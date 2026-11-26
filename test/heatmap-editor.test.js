'use strict';

/*
    The visual editor: lifecycle, the delegated value-changed handler, every switch
    and field handler, the custom step rows, and the scale documentation renderer.
*/

const test = require('node:test');
const assert = require('node:assert/strict');
const { loadCard } = require('./helpers/load-card.js');
const { markup, handlers } = require('./helpers/fixtures.js');

const { HeatmapCard, HeatmapCardEditor, HeatmapScales, vm_global } = loadCard();

const plain = (value) => JSON.parse(JSON.stringify(value));

const STATES = {
    'sensor.t': { state: '20', attributes: { device_class: 'temperature', state_class: 'measurement', unit_of_measurement: '°C' } },
    'sensor.m': { state: '1', attributes: { state_class: 'measurement', unit_of_measurement: 'W' } },
    'sensor.e': { state: '1', attributes: { state_class: 'total_increasing', unit_of_measurement: 'kWh', device_class: 'energy' } },
    'sensor.f': { state: '1', attributes: { state_class: 'total' } },
    'sensor.n': { state: '1', attributes: {} }
};

// An editor built the way HA builds it: element, hass, then setConfig.
async function editorFor(config, { registered = true } = {}) {
    const created = [];
    vm_global.loadCardHelpers = () => Promise.resolve({
        createCardElement(card_config) {
            created.push(card_config);
            return Promise.resolve({ constructor: { getConfigElement: () => Promise.resolve() } });
        }
    });
    if (registered && !vm_global.customElements.get('ha-entity-picker')) {
        vm_global.customElements.define('ha-entity-picker', class {});
    }
    const editor = new HeatmapCardEditor();
    editor.hass = { states: STATES, config: { unit_system: { temperature: '°C' } }, language: 'en' };
    await editor.setConfig({ entity: 'sensor.m', ...config });
    editor.root = editor.createRenderRoot();
    editor.created = created;
    return editor;
}

// The config the last config-changed event carried.
const last = (editor) => plain(editor.dispatched_events.at(-1).detail.config);

// Fire value-changed at the root listener, as an ha-selector would.
function change(editor, key, value) {
    const [listener] = editor.root.listeners['value-changed'];
    listener({ stopPropagation() {}, target: { configValue: key }, detail: { value } });
    return last(editor);
}

/* --- lifecycle --------------------------------------------------------------- */

test('properties, fields and getConfigElement', () => {
    assert.ok('_config' in HeatmapCardEditor.properties);
    assert.ok(new HeatmapCardEditor().scales instanceof HeatmapScales);
    assert.deepEqual(plain(HeatmapCard.getConfigElement()), {});
});

test('setConfig resolves entity, device class and scale', async () => {
    const editor = await editorFor({ entity: 'sensor.t' });
    assert.equal(editor.entity, STATES['sensor.t']);
    assert.equal(editor.device_class, 'temperature');
    assert.equal(editor.scale.key, 'outdoor temperature');

    const custom = await editorFor({ scale: { type: 'relative', steps: [{ color: '#000' }, { color: '#fff' }] } });
    assert.equal(custom.scale.type, 'relative');

    const fallback = await editorFor({ entity: 'sensor.n', device_class: 'temperature' });
    assert.equal(fallback.device_class, 'temperature');
    const missing = await editorFor({ entity: 'sensor.gone' });
    assert.equal(missing.entity, undefined);
});

test('setConfig loads the entity picker when HA has not registered it yet', async () => {
    const registry = vm_global.customElements;
    const get = registry.get;
    registry.get = (name) => (name === 'ha-entity-picker' ? undefined : get(name));
    try {
        const editor = await editorFor({}, { registered: false });
        assert.deepEqual(plain(editor.created), [{ type: 'entities', entities: [] }]);
    } finally {
        registry.get = get;
    }
});

test('render waits for hass and config', () => {
    const editor = new HeatmapCardEditor();
    assert.equal(editor.render(), undefined);
    editor.myhass = {};
    assert.equal(editor.render(), undefined);
});

test('_dispatch_config sends config-changed with the config', async () => {
    const editor = await editorFor({});
    editor._dispatch_config({ entity: 'x' });
    const event = editor.dispatched_events.at(-1);
    assert.equal(event.type, 'config-changed');
    assert.deepEqual(plain(event.detail), { config: { entity: 'x' } });
});

/* --- full render per mode -------------------------------------------------------- */

test('every mode renders its own fields', async () => {
    const hourly = markup((await editorFor({})).render());
    assert.match(hourly, /Days/);
    assert.match(hourly, /Label every Nth time slot/);

    const daily = markup((await editorFor({ mode: 'daily' })).render());
    assert.match(daily, /Weeks/);
    assert.match(daily, /Aggregate/);
    assert.doesNotMatch(daily, /Secondary entity/);

    const minute = markup((await editorFor({ mode: 'minute' })).render());
    assert.match(minute, /Rows/);
    assert.match(minute, /Minutes per cell/);

    const day_rows = markup((await editorFor({ mode: 'minute', minute_rows: 'day' })).render());
    assert.match(day_rows, /Label every Nth hour/);
});

test('the High Res help button shows and hides its text', async () => {
    const editor = await editorFor({});
    const toggle = handlers(editor.render()).find((fn) => /_mode_help_open = !/.test(String(fn)));
    toggle();
    const text = markup(editor.render());
    assert.match(text, /aria-expanded=true/);
    assert.match(text, /class="mode-help"/);
    toggle();
    assert.doesNotMatch(markup(editor.render()), /class="mode-help"/);
});

test('display fields show their configured values', async () => {
    const editor = await editorFor({ display: { height: 300, time_labels: 2, decimals: 1, labels: true, hide_zero: true } });
    const template = editor.render();
    const text = markup(template);
    assert.match(text, /Hide zero values in labels/);
    assert.ok(handlers(template).length > 0);
});

test('the Card elements switches write display keys, creating display when needed', async () => {
    const editor = await editorFor({ display: { labels: true } });
    const switches = handlers(editor.render()).filter((fn) => /config\.display\.(navigation|legend|labels|hide_zero) = e\.target\.checked/.test(String(fn)));
    assert.equal(switches.length, 4);
    for (const fn of switches) { fn({ target: { checked: false } }); }
    const keys = editor.dispatched_events.map((e) => plain(e.detail.config.display));
    assert.deepEqual(Array.from(keys, (d) => Object.keys(d).filter((k) => d[k] === false)),
        [['navigation'], ['legend'], ['labels'], ['hide_zero']]);

    const bare = await editorFor({});
    const [navigation] = handlers(bare.render()).filter((fn) => /config\.display\.navigation =/.test(String(fn)));
    navigation({ target: { checked: true } });
    assert.deepEqual(last(bare).display, { navigation: true });
    for (const key of ['legend', 'labels']) {
        const fresh = await editorFor({});
        const [fn] = handlers(fresh.render()).filter((h) => new RegExp(`config\\.display\\.${key} =`).test(String(h)));
        fn({ target: { checked: true } });
        assert.deepEqual(last(fresh).display, { [key]: true });
    }
    const zero = await editorFor({ display: { labels: true } });
    zero._config = { entity: 'sensor.m', display: { labels: true } };
    const [hide] = handlers(zero.render()).filter((fn) => /hide_zero = e\.target\.checked/.test(String(fn)));
    delete zero._config.display;
    hide({ target: { checked: true } });
    assert.deepEqual(last(zero).display, { hide_zero: true });
});

/* --- switches ------------------------------------------------------------------------ */

test('treat_as and smoothing switches only show where they act, and toggle their key', async () => {
    const meter = await editorFor({ entity: 'sensor.e' });
    assert.equal(meter.render_treat_as_toggle(), '', 'total_increasing is never a snapshot');
    const total = await editorFor({ entity: 'sensor.f' });
    const [treat] = handlers(total.render_treat_as_toggle());
    treat({ target: { checked: true } });
    assert.equal(last(total).treat_as, 'measurement');
    total._config = last(total);
    assert.equal(total.render_smoothing_toggle(), '', 'no smoothing for a snapshot');
    treat({ target: { checked: false } });
    assert.equal('treat_as' in last(total), false);

    const [smooth] = handlers(meter.render_smoothing_toggle());
    smooth({ target: { checked: true } });
    assert.equal(last(meter).smoothing, true);
    smooth({ target: { checked: false } });
    assert.equal('smoothing' in last(meter), false);
    assert.equal((await editorFor({})).render_smoothing_toggle(), '');
});

/* --- secondary entity ------------------------------------------------------------------ */

test('the operation selector and the pairing warning follow the secondary entity', async () => {
    const none = await editorFor({});
    assert.doesNotMatch(markup(none.render_multi_entity()), /Operation/);
    assert.equal(none.render_secondary_entity_warning(), undefined);

    const pair = await editorFor({ secondary_entity: 'sensor.e' });
    const text = markup(pair.render_multi_entity());
    assert.match(text, /Operation/);
    assert.match(text, /the primary has\s+<code>state_class<\/code> <i>measurement<\/i>/);

    const ok = await editorFor({ secondary_entity: 'sensor.t' });
    assert.equal(ok.render_secondary_entity_warning(), undefined);
    assert.equal((await editorFor({ mode: 'daily' })).render_multi_entity(), undefined);
});

/* --- range controls ---------------------------------------------------------------- */

test('range controls show fixed bounds and accept new ones', async () => {
    const editor = await editorFor({ data: { min: 2, max: 8 } });
    editor._range_hint = () => ({ min: 0, max: 10 });
    const template = editor.render_range_controls();
    assert.match(markup(template), /placeholder=0/);
    assert.ok(template.values.includes('2') && template.values.includes('8'));
    const [min, min_auto, max, max_auto] = handlers(template);
    max({ stopPropagation() {}, target: { value: '12' } });
    assert.deepEqual(last(editor).data, { min: 2, max: 12 });
    min_auto({ stopPropagation() {}, target: { checked: true } });
    assert.equal(last(editor).data.min, 'auto', 'ticking Infer hands min back to the data');
    max_auto({ stopPropagation() {}, target: { checked: true } });
    assert.equal(last(editor).data.max, 'auto');

    const bare = await editorFor({});
    bare._range_hint = () => undefined;
    const [bmin, , bmax] = handlers(bare.render_range_controls());
    bmin({ stopPropagation() {}, target: { value: '1' } });
    assert.deepEqual(last(bare).data, { min: 1 });
    bmax({ stopPropagation() {}, target: { value: '3' } });
    assert.deepEqual(last(bare).data, { max: 3 });
    void min;
});

/* --- custom steps -------------------------------------------------------------------- */

function customEditor(scale) {
    return editorFor({ scale }).then((editor) => {
        editor._range_hint = () => undefined;
        return editor;
    });
}

test('custom step rows: colors, values, units, drafts and removal', async () => {
    const editor = await customEditor({ type: 'absolute', steps: [
        { value: 0, color: '#ff0000' }, { value: 5, color: '#00ff00' }
    ] });
    // An invalid and a missing colour, as a hand edit can leave them (setConfig rejects
    // them, so they go straight into _config).
    editor._config = { ...editor._config, scale: { type: 'absolute', steps: [
        { value: 0, color: '#ff0000' }, { value: 5, color: 'nonsense' }, { value: 9 }
    ] } };
    editor._value_unit = () => 'W';
    const text = markup(editor.render_custom_scale_editor());
    assert.match(text, /#888888/, 'an invalid colour shows grey in the picker');
    assert.match(text, /custom-step-unit">W</);

    editor._step_color_drafts = { 0: '  ', 1: 'bad' };
    const drafts = markup(editor.render_custom_scale_editor());
    assert.match(drafts, /Color for step 1 is required/);
    assert.match(drafts, /Color for step 2 is not a valid color/);

    const fns = handlers(editor.render_custom_scale_editor());
    const picker = fns.find((fn) => /_step_color_input\(i, e\.target\.value\)/.test(String(fn)));
    picker({ target: { value: '#00ff00' } });
    assert.equal(last(editor).scale.steps[0].color, '#00ff00');

    const typed = fns.filter((fn) => /_step_color_input\(i, e\.target\.value\)/.test(String(fn)))[1];
    typed({ target: { value: 'blue' } });
    assert.equal(last(editor).scale.steps[0].color, 'blue');
    const add = fns.find((fn) => /_add_step\(\)/.test(String(fn)));
    add();
    assert.equal(last(editor).scale.steps.length, 4);

    const value = fns.find((fn) => /_update_step_value/.test(String(fn)));
    value({ target: { value: '20' } });
    assert.deepEqual(last(editor).scale.steps.map((s) => s.value), [5, 9, 20]);

    let focused = false;
    Object.defineProperty(editor, 'renderRoot', { value: { querySelector: () => ({ focus() { focused = true; } }) }, configurable: true });
    const remove = fns.find((fn) => /_remove_step/.test(String(fn)));
    remove();
    assert.equal(last(editor).scale.steps.length, 2);
    assert.equal(focused, true);
    assert.deepEqual(plain(editor._step_color_drafts), {});
});

test('relative custom steps have no value boxes; removal works without a render root', async () => {
    const editor = await customEditor({ type: 'relative', steps: [{ color: '#000' }, { color: '#fff' }, { color: '#f00' }] });
    editor._value_unit = () => undefined;
    const text = markup(editor.render_custom_scale_editor());
    assert.match(text, /Step 1/);
    assert.doesNotMatch(text, /Value for step/);
    editor._remove_step(0);
    assert.equal(last(editor).scale.steps.length, 2);

    const absolute = await customEditor({ type: 'absolute', steps: [{ value: 0, color: '#000' }, { value: 1, color: '#fff' }] });
    absolute._value_unit = () => undefined;
    assert.doesNotMatch(markup(absolute.render_custom_scale_editor()), /custom-step-unit/);
});

test('a custom scale caught mid-edit without steps still renders and takes a step', async () => {
    const editor = await customEditor({ type: 'relative', steps: [{ color: '#000' }, { color: '#fff' }] });
    editor._config = { entity: 'sensor.m', scale: { type: 'relative' } };
    assert.doesNotThrow(() => editor.render_custom_scale_editor());
    editor._add_step();
    assert.deepEqual(last(editor).scale.steps, [{ color: '#888888' }]);
    editor.entity = undefined;
    assert.equal(editor._value_unit(), undefined);
});

test('a retired scale name shows no gradient preview in the picker', async () => {
    const editor = await editorFor({ scale: 'wikipedia climate cool2' });
    vm_global.DOMParser = class { parseFromString() { return { body: { childNodes: [] } }; } };
    try {
        assert.doesNotMatch(markup(editor.render_scale_picker()), /linear-gradient/);
    } finally {
        delete vm_global.DOMParser;
    }
});

test('changing the custom scale type strips or spreads the step values', async () => {
    const editor = await customEditor({ type: 'absolute', steps: [{ value: 3, color: '#000' }, { value: 7, color: '#fff' }] });
    const fire = (value) => editor._custom_type_changed({ stopPropagation() {}, detail: value === undefined ? undefined : { value } });
    const before = (editor.dispatched_events ?? []).length;
    fire(undefined);
    fire('absolute');
    assert.equal((editor.dispatched_events ?? []).length, before, 'no type, or the same type, does nothing');

    fire('relative');
    assert.deepEqual(last(editor).scale.steps, [{ color: '#000' }, { color: '#fff' }]);

    editor._config = { entity: 'sensor.m', scale: { steps: [{ color: '#000' }] } };
    const untyped = editor.dispatched_events.length;
    fire('relative');
    assert.equal(editor.dispatched_events.length, untyped, 'an untyped scale is already relative');
    fire('absolute');
    assert.deepEqual(last(editor).scale.steps, [{ value: 0, color: '#000' }], 'a single step starts at 0');
});

test('the scale picker reads the selector value or the target value', async () => {
    const editor = await editorFor({});
    editor._scale_changed({ stopPropagation() {}, target: { value: 'iron red' } });
    assert.equal(last(editor).scale, 'iron red');
    const count = editor.dispatched_events.length;
    editor._scale_changed({ stopPropagation() {}, target: { value: '' } });
    assert.equal(editor.dispatched_events.length, count);
});

test('_default_scale_for_config prefers the entity device class, then the config', async () => {
    const editor = await editorFor({});
    assert.equal(editor._default_scale_for_config({ entity: 'sensor.t' }), 'outdoor temperature');
    assert.equal(editor._default_scale_for_config({ entity: 'sensor.n', device_class: 'temperature' }), 'outdoor temperature');
    assert.equal(editor._default_scale_for_config({ entity: 'sensor.gone' }), 'stoplight');
});

/* --- delegated value-changed handler ------------------------------------------------- */

test('value-changed writes plain and dotted keys', async () => {
    const editor = await editorFor({});
    assert.equal(change(editor, 'days', 9).days, 9);
    assert.deepEqual(change(editor, 'display.height', 300).display, { height: 300 });
    editor._config = last(editor);
    assert.deepEqual(change(editor, 'display.decimals', 2).display, { height: 300, decimals: 2 });
});

test('picking an entity with a device class sets its scale and drops a config device_class', async () => {
    const editor = await editorFor({ device_class: 'temperature', scale: 'iron red' });
    const picked = change(editor, 'entity', 'sensor.t');
    assert.equal(picked.scale, 'outdoor temperature');
    assert.equal('device_class' in picked, false);
    const plainEntity = change(editor, 'entity', 'sensor.n');
    assert.equal(plainEntity.scale, 'iron red', 'an entity without a device class keeps the scale');
});

test('a secondary entity suggests net energy; clearing it restores the default scale', async () => {
    const editor = await editorFor({ entity: 'sensor.t' });
    assert.equal(change(editor, 'secondary_entity', 'sensor.m').scale, 'net energy');
    editor._config = { entity: 'sensor.t', secondary_entity: 'sensor.m', scale: 'net energy' };
    assert.equal(change(editor, 'secondary_entity', undefined).scale, 'outdoor temperature');

    editor._config = { entity: 'sensor.t', operation: 'sum' };
    assert.equal(change(editor, 'secondary_entity', 'sensor.m').scale, undefined, 'sum keeps the scale');

    const steps = [{ color: '#000' }, { color: '#fff' }];
    editor._config = { entity: 'sensor.t', scale: { steps } };
    assert.deepEqual(change(editor, 'secondary_entity', 'sensor.m').scale, { steps }, 'custom scales are never replaced');
    editor._config = { entity: 'sensor.t', secondary_entity: 'sensor.m', scale: { steps } };
    assert.deepEqual(change(editor, 'secondary_entity', undefined).scale, { steps });
});

test('switching the operation swaps net energy and the default scale', async () => {
    const editor = await editorFor({ entity: 'sensor.t', secondary_entity: 'sensor.m', scale: 'net energy' });
    assert.equal(change(editor, 'operation', 'sum').scale, 'outdoor temperature');
    assert.equal(change(editor, 'operation', 'difference').scale, 'net energy');
    editor._config = { entity: 'sensor.t', scale: 'iron red' };
    assert.equal(change(editor, 'operation', 'sum').scale, 'iron red', 'no secondary entity: nothing to swap');
});

test('switching to daily drops what daily mode rejects', async () => {
    const editor = await editorFor({ entity: 'sensor.t', smoothing: true, secondary_entity: 'sensor.m',
        operation: 'sum', scale: 'net energy', time_interval: 4 });
    const daily = change(editor, 'mode', 'daily');
    for (const key of ['smoothing', 'secondary_entity', 'operation', 'time_interval']) {
        assert.equal(key in daily, false, key);
    }
    assert.equal(daily.scale, 'outdoor temperature');

    const steps = [{ color: '#000' }, { color: '#fff' }];
    editor._config = { entity: 'sensor.t', secondary_entity: 'sensor.m', scale: { steps }, time_interval: 1 };
    const kept = change(editor, 'mode', 'daily');
    assert.deepEqual(kept.scale, { steps });
    assert.equal(kept.time_interval, 1, 'an interval of 1 is valid everywhere');
});

test('entering or leaving minute mode resets its range options; so does changing rows', async () => {
    const editor = await editorFor({ days: 30, minute_interval: 5 });
    const minute = change(editor, 'mode', 'minute');
    assert.equal('days' in minute, false);
    editor._config = { entity: 'sensor.m', mode: 'minute', days: 2, minute_interval: 15, minute_rows: 'day' };
    const back = change(editor, 'mode', 'hourly');
    for (const key of ['days', 'minute_interval', 'minute_rows']) { assert.equal(key in back, false, key); }

    editor._config = { entity: 'sensor.m', mode: 'minute', days: 2 };
    assert.equal(change(editor, 'mode', 'minute').days, 2, 're-picking minute keeps the range');
    assert.equal('days' in change(editor, 'minute_rows', 'day'), false);
    editor._config = { entity: 'sensor.m', mode: 'minute', minute_rows: 'day', days: 9 };
    assert.equal(change(editor, 'minute_rows', 'day').days, 9);
    editor._config = { entity: 'sensor.m', mode: 'minute', days: 9 };
    assert.equal(change(editor, 'minute_rows', 'hour').days, 9, 'hour is the default layout');
});

/* --- scale documentation ---------------------------------------------------------------- */

// A parsed fragment: text is a string, an element is [tag, attributes, ...children].
function node(spec) {
    if (typeof spec === 'string') { return { nodeType: 3, textContent: spec }; }
    if (spec === null) { return { nodeType: 8 }; }
    const [tag, attributes, ...children] = spec;
    return {
        nodeType: 1,
        tagName: tag.toUpperCase(),
        getAttribute: (name) => attributes[name] ?? null,
        childNodes: children.map(node)
    };
}

test('scale docs render a safe subset of HTML and the license', async () => {
    const fragment = [
        ['p', {}, 'See ', ['a', { href: 'https://example.com/x' }, 'here'], ' and ',
            ['a', { href: 'javascript:alert(1)' }, 'not this'], ' or ', ['a', {}, 'nothing']],
        ['p', {}, ['em', {}, 'e'], ['strong', {}, 's'], ['code', {}, 'c'], ['sup', {}, '2'],
            ['sub', {}, 'x'], ['br', {}], ['span', {}, 'plain'], ['script', {}, 'gone?']],
        null
    ];
    vm_global.DOMParser = class {
        parseFromString() { return { body: { childNodes: fragment.map(node) } }; }
    };
    try {
        const editor = await editorFor({});
        editor.scale = { docs: { text: 'ignored', license: { name: 'CC BY', url: 'https://cc.example/' } } };
        const text = markup(editor.render_scale_docs());
        assert.match(text, /<a href="https:\/\/example\.com\/x" rel="noopener noreferrer" target="_blank">here<\/a>/);
        assert.doesNotMatch(text, /javascript:/);
        assert.match(text, / or nothing/);
        assert.match(text, /<em>e<\/em><strong>s<\/strong><code>c<\/code><sup>2<\/sup><sub>x<\/sub><br>plain/);
        assert.match(text, /gone\?/, 'unknown tags keep their text, not their markup');
        assert.match(text, /<a href="https:\/\/cc\.example\/"[^>]*>CC BY<\/a>/);

        editor.scale = { docs: { license: { name: 'Odd licence', url: 'ftp://x' } } };
        const unlinked = markup(editor.render_scale_docs());
        assert.match(unlinked, /under Odd licence\./);

        editor.scale = { docs: { text: 'x' } };
        assert.doesNotMatch(markup(editor.render_scale_docs()), /Scale license/);
        editor.scale = { };
        assert.equal(editor.render_scale_docs(), undefined);
        editor.scale = undefined;
        assert.equal(editor.render_scale_docs(), undefined);
    } finally {
        delete vm_global.DOMParser;
    }
});

/* --- card picker registration --------------------------------------------------------- */

test('the card picker suggests sensors that keep statistics', () => {
    const fresh = loadCard({ customCards: false });
    const [entry] = fresh.vm_global.customCards;
    const hass = { states: { 'sensor.m': STATES['sensor.m'], 'sensor.n': STATES['sensor.n'], 'light.x': { attributes: { state_class: 'measurement' } } } };
    assert.deepEqual(plain(entry.getEntitySuggestion(hass, 'sensor.m')), { config: { type: 'custom:heatmap-card', entity: 'sensor.m' } });
    assert.equal(entry.getEntitySuggestion(hass, 'sensor.n'), null);
    assert.equal(entry.getEntitySuggestion(hass, 'light.x'), null);
    assert.equal(entry.getEntitySuggestion(hass, 'sensor.gone'), null);
});
