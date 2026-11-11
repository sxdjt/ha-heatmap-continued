'use strict';

/*
    Custom scales in the visual editor: "Custom" as the first Scale option, starting
    steps derived from the scale in use, sorted steps (editor and card), unit labels,
    and the scale section for entities without a device_class.
*/

const test = require('node:test');
const assert = require('node:assert/strict');
const { loadCard } = require('./helpers/load-card.js');

const { HeatmapCardEditor, HeatmapScales, BUILTIN_SCALES, steps_across_range,
        CUSTOM_SCALE_OPTION, DEFAULT_CUSTOM_STEPS } = loadCard();

const plain = (value) => JSON.parse(JSON.stringify(value));
const builtin = (key) => plain(BUILTIN_SCALES.find((scale) => scale.key === key));

// Flatten a stubbed lit template (and any nested ones) to its literal text.
function text(template) {
    if (template === undefined || template === null || template === '') { return ''; }
    if (Array.isArray(template)) { return template.map(text).join(''); }
    if (typeof template !== 'object' || !template.strings) { return String(template); }
    return template.strings.reduce((out, part, i) =>
        out + part + (i < template.values.length ? text(template.values[i]) : ''), '');
}

function makeEditor({ attributes = { state_class: 'measurement' }, config = {}, ws, api } = {}) {
    const calls = { ws: [], api: [] };
    const editor = Object.create(HeatmapCardEditor.prototype);
    const states = attributes ? { 'sensor.x': { attributes } } : {};
    editor.scales = new HeatmapScales();
    editor._config = { entity: 'sensor.x', ...config };
    editor.entity = states['sensor.x'];
    editor.device_class = attributes?.device_class ?? config.device_class;
    editor.myhass = {
        config: { unit_system: { temperature: '°C' } },
        states,
        callWS(request) { calls.ws.push(request); return ws ? ws(request) : Promise.resolve({}); },
        callApi(method, path) { calls.api.push(path); return api ? api(path) : Promise.resolve([]); }
    };
    editor.dispatched = [];
    editor._dispatch_config = (c) => editor.dispatched.push(plain(c));
    return { editor, calls };
}

const statsOf = (field, values) => () => Promise.resolve({
    'sensor.x': values.map((value, i) => ({ start: i * 3600000, [field]: value }))
});

/* --- card: sorting -------------------------------------------------------- */

test('generate_scale sorts out-of-order absolute steps', () => {
    const scale = new HeatmapScales().get_scale({
        type: 'absolute',
        steps: [{ value: 100, color: '#ff0000' }, { value: 0, color: '#00ff00' }, { value: 50, color: '#0000ff' }]
    });
    assert.deepEqual(plain(scale.steps).map((s) => s.value), [0, 50, 100]);
    assert.equal(scale.gradient(0).hex(), '#00ff00');
    assert.equal(scale.gradient(50).hex(), '#0000ff');
    assert.equal(scale.gradient(100).hex(), '#ff0000');
});

test('generate_scale keeps the order of steps without values', () => {
    const colors = ['#ff0000', '#00ff00', '#0000ff'];
    const scale = new HeatmapScales().get_scale({ type: 'relative', steps: colors.map((color) => ({ color })) });
    assert.deepEqual(plain(scale.steps).map((s) => s.color), colors);
});

test('generate_scale leaves built-in scales unchanged', () => {
    const scales = new HeatmapScales();
    for (const scale of BUILTIN_SCALES) {
        assert.deepEqual(plain(scales.get_scale(scale.key).steps).map((s) => s.color),
            plain(scale.steps).map((s) => s.color), scale.key);
    }
});

/* --- steps_across_range --------------------------------------------------- */

test('steps_across_range spreads relative positions across tidy bounds', () => {
    const steps = steps_across_range(builtin('stoplight').steps, 29.05, 29.58);
    assert.deepEqual(plain(steps).map((s) => s.value), [29, 29.3, 29.6]);
    assert.deepEqual(plain(steps).map((s) => s.color), builtin('stoplight').steps.map((s) => s.color));
});

test('steps_across_range rounds to a unit that suits the span', () => {
    const three = [{ value: 0, color: '#000' }, { value: 0.5, color: '#888' }, { value: 1, color: '#fff' }];
    const values = (min, max) => plain(steps_across_range(three, min, max)).map((s) => s.value);
    assert.deepEqual(values(18.2, 24.7), [18, 21.5, 25]);
    assert.deepEqual(values(-5.3, 12), [-6, 3, 12]);
    assert.deepEqual(values(0, 3200), [0, 2000, 4000]);
    assert.deepEqual(values(0.012, 0.018), [0.012, 0.015, 0.018]);
});

test('steps_across_range spaces steps evenly when they have no positions', () => {
    const steps = steps_across_range([{ color: '#000' }, { color: '#888' }, { color: '#fff' }], 0, 10);
    assert.deepEqual(plain(steps).map((s) => s.value), [0, 5, 10]);
});

test('steps_across_range keeps uneven positions', () => {
    const steps = steps_across_range(builtin('iron red').steps, 0, 100);
    assert.deepEqual(plain(steps).map((s) => s.value), builtin('iron red').steps.map((s) => s.value * 100));
});

/* --- dropdown ------------------------------------------------------------- */

test('_scale_key resolves the scale the card actually uses', () => {
    assert.equal(makeEditor({ config: { scale: 'iron red' } }).editor._scale_key(), 'iron red');
    assert.equal(makeEditor({ attributes: { device_class: 'temperature', state_class: 'measurement' } })
        .editor._scale_key(), 'outdoor temperature');
    assert.equal(makeEditor().editor._scale_key(), 'stoplight');
    assert.equal(makeEditor({ config: { scale: { type: 'absolute', steps: [] } } }).editor._scale_key(), 'stoplight');
});

function picker(editor) {
    const template = editor.render_scale_picker();
    const selector = template.values.find((value) => value?.select);
    return { template, options: selector.select.options, value: template.values[3] };
}

test('Custom is the first Scale option, then every built-in', () => {
    const { options } = picker(makeEditor().editor);
    assert.deepEqual(plain(options[0]), { value: CUSTOM_SCALE_OPTION, label: 'Custom' });
    assert.equal(options.length, BUILTIN_SCALES.length + 1);
    assert.equal(options.filter((o) => o.value === CUSTOM_SCALE_OPTION).length, 1);
});

test('the scale section is shown for an entity without a device_class', () => {
    const { editor } = makeEditor({ attributes: { state_class: 'measurement' } });
    assert.equal(editor.device_class, undefined);
    const { template, value } = picker(editor);
    assert.match(text(template), /Color scale/);
    assert.equal(value, 'stoplight');
});

test('a built-in shows its preview, not the step editor', () => {
    const { editor } = makeEditor({ config: { scale: 'iron red' } });
    editor.scale = editor.scales.get_scale('iron red');
    const { template, value } = picker(editor);
    assert.equal(value, 'iron red');
    assert.match(text(template), /linear-gradient/);
    assert.doesNotMatch(text(template), /custom-steps/);
});

test('a custom scale selects Custom and shows the step editor below the dropdown', () => {
    const scale = { type: 'absolute', steps: [{ value: 1, color: '#000000' }, { value: 2, color: '#ffffff' }] };
    const { template, value } = picker(makeEditor({ config: { scale } }).editor);
    assert.equal(value, CUSTOM_SCALE_OPTION);
    const markup = text(template);
    assert.ok(markup.indexOf('Color scale') < markup.indexOf('custom-steps'));
    assert.doesNotMatch(markup, /Back to preset|Use custom thresholds/);
});

test('picking Custom starts a custom scale; picking it again keeps the edits', () => {
    const { editor } = makeEditor();
    let switched = 0;
    editor._switch_to_custom = () => { switched++; };
    editor._scale_changed({ stopPropagation() {}, detail: { value: CUSTOM_SCALE_OPTION } });
    assert.equal(switched, 1);

    editor._config.scale = { type: 'absolute', steps: [] };
    editor._scale_changed({ stopPropagation() {}, detail: { value: CUSTOM_SCALE_OPTION } });
    assert.equal(switched, 1);
    assert.equal(editor.dispatched.length, 0);
});

test('picking a built-in replaces a custom scale', () => {
    const { editor } = makeEditor({ config: { scale: { type: 'absolute', steps: [] } } });
    editor._scale_changed({ stopPropagation() {}, detail: { value: 'iron red' } });
    assert.equal(editor.dispatched[0].scale, 'iron red');
});

/* --- starting steps ------------------------------------------------------- */

test('Custom from an absolute built-in copies its steps in the grid unit', async () => {
    const { editor, calls } = makeEditor({
        attributes: { device_class: 'temperature', state_class: 'measurement', unit_of_measurement: '°F' }
    });
    editor.myhass.config.unit_system.temperature = '°F';
    await editor._switch_to_custom();
    const { scale } = editor.dispatched[0];
    assert.equal(scale.type, 'absolute');
    assert.equal(scale.name, 'Custom');
    assert.equal(scale.steps[0].value, -22, '-30 °C in °F');
    assert.deepEqual(scale.steps.map((s) => s.color), builtin('outdoor temperature').steps.map((s) => s.color));
    assert.deepEqual(Object.keys(scale.steps[0]).sort(), ['color', 'value']);
    assert.equal(calls.ws.length, 0, 'no range lookup needed');
});

test('Custom from an absolute built-in keeps °C values for a °C entity', async () => {
    const { editor } = makeEditor({
        attributes: { device_class: 'temperature', state_class: 'measurement', unit_of_measurement: '°C' }
    });
    editor.myhass.config.unit_system.temperature = '°F';
    await editor._switch_to_custom();
    assert.deepEqual(editor.dispatched[0].scale.steps.map((s) => s.value),
        builtin('outdoor temperature').steps.map((s) => s.value));
});

test('Custom from a relative built-in spreads its colours across the data range', async () => {
    const { editor, calls } = makeEditor({
        attributes: { state_class: 'measurement', unit_of_measurement: 'inHg' },
        ws: statsOf('mean', [29.3, 29.05, null, 29.58])
    });
    await editor._switch_to_custom();
    assert.deepEqual(editor.dispatched[0].scale.steps, [
        { value: 29, color: builtin('stoplight').steps[0].color },
        { value: 29.3, color: builtin('stoplight').steps[1].color },
        { value: 29.6, color: builtin('stoplight').steps[2].color }
    ]);
    assert.equal(calls.ws[0].period, 'hour');
    assert.deepEqual(plain(calls.ws[0].types), ['mean']);
});

test('Custom falls back to 0 / 50 / 100 when there is no usable range', async () => {
    const cases = {
        'no data': { ws: () => Promise.resolve({}) },
        'flat line': { ws: statsOf('mean', [5, 5, 5]) },
        'failed fetch': { ws: () => Promise.reject(new Error('boom')) },
        'secondary entity': { config: { secondary_entity: 'sensor.y' }, ws: statsOf('mean', [1, 9]) },
        'unreadable state_class': { attributes: { state_class: 'measurement_angle' }, ws: statsOf('mean', [1, 9]) }
    };
    const warn = console.warn;
    console.warn = () => {};
    try {
        for (const [name, options] of Object.entries(cases)) {
            const { editor } = makeEditor(options);
            await editor._switch_to_custom();
            assert.deepEqual(editor.dispatched[0].scale.steps, plain(DEFAULT_CUSTOM_STEPS), name);
        }
    } finally {
        console.warn = warn;
    }
});

test('Custom keeps config edits made while the range was loading', async () => {
    let release;
    const { editor } = makeEditor({ ws: () => new Promise((resolve) => { release = resolve; }) });
    const pending = editor._switch_to_custom();
    await new Promise((resolve) => setImmediate(resolve));
    editor._config = { ...editor._config, title: 'Edited meanwhile' };
    release({ 'sensor.x': [{ mean: 1 }, { mean: 9 }] });
    await pending;
    assert.equal(editor.dispatched[0].title, 'Edited meanwhile');
    assert.equal(editor.dispatched[0].scale.steps[0].value, 1, '1-9 rounds to 1 / 5 / 9');
});

/* --- range lookup --------------------------------------------------------- */

async function rangeRequest(attributes, config = {}) {
    const { editor, calls } = makeEditor({ attributes, config, ws: statsOf('x', []) });
    await editor._value_range();
    return calls.ws[0];
}

test('_value_range reads what the grid shows for each kind of entity', async () => {
    const hourly = await rangeRequest({ state_class: 'measurement' });
    assert.deepEqual(plain([hourly.period, ...hourly.types]), ['hour', 'mean']);

    const total = await rangeRequest({ state_class: 'total_increasing', device_class: 'energy' });
    assert.deepEqual(plain([total.period, ...total.types]), ['hour', 'change']);
    assert.equal(total.units.energy, 'kWh');

    const fluctuating = await rangeRequest({ state_class: 'total' }, { treat_as: 'measurement' });
    assert.deepEqual(plain(fluctuating.types), ['state']);

    const minute = await rangeRequest({ state_class: 'measurement' }, { mode: 'minute' });
    assert.equal(minute.period, '5minute');

    const daily_min = await rangeRequest({ state_class: 'measurement' }, { mode: 'daily', aggregate: 'min' });
    assert.deepEqual(plain([daily_min.period, ...daily_min.types]), ['day', 'min']);

    const daily_last = await rangeRequest({ state_class: 'measurement' }, { mode: 'daily', aggregate: 'last' });
    assert.deepEqual(plain(daily_last.types), ['mean']);
});

test('_value_range covers the configured window', async () => {
    const span = (request) => Math.round((Date.parse(request.end_time) - Date.parse(request.start_time)) / 86400000);
    assert.equal(span(await rangeRequest({ state_class: 'measurement' })), 21);
    assert.equal(span(await rangeRequest({ state_class: 'measurement' }, { days: 5 })), 5);
    assert.equal(span(await rangeRequest({ state_class: 'measurement' }, { mode: 'daily', weeks: 2 })), 14);
    assert.equal(span(await rangeRequest({ state_class: 'measurement' }, { mode: 'minute' })), 1);
    assert.equal(span(await rangeRequest({ state_class: 'measurement' }, { mode: 'minute', minute_rows: 'day' })), 7);
});

test('_value_range uses the entity temperature unit', async () => {
    const request = await rangeRequest({ state_class: 'measurement', unit_of_measurement: '°F' });
    assert.equal(request.units.temperature, '°F');
});

test('_value_range reads raw history for an entity without a state_class', async () => {
    const now = Date.now();
    const { editor, calls } = makeEditor({
        attributes: { unit_of_measurement: 'inHg' },
        api: () => Promise.resolve([[
            { entity_id: 'sensor.x', state: '29.1', last_changed: new Date(now - 5 * 3600000).toISOString() },
            { state: '29.5', last_changed: new Date(now - 2 * 3600000).toISOString() }
        ]])
    });
    const range = await editor._value_range();
    assert.equal(calls.ws.length, 0);
    assert.match(calls.api[0], /^history\/period\/.*filter_entity_id=sensor\.x/);
    assert.equal(range.min, 29.1);
    assert.equal(range.max, 29.5);
});

test('_value_range needs a loaded entity', async () => {
    const { editor, calls } = makeEditor({ attributes: null });
    assert.equal(await editor._value_range(), null);
    assert.equal(calls.ws.length + calls.api.length, 0);
});

/* --- step rows ------------------------------------------------------------ */

test('step values show the unit the grid uses', () => {
    const scale = { type: 'absolute', steps: [{ value: 1, color: '#000000' }, { value: 2, color: '#ffffff' }] };
    const unitText = (attributes) =>
        text(makeEditor({ attributes, config: { scale } }).editor.render_custom_scale_editor());
    assert.match(unitText({ unit_of_measurement: 'inHg' }), /custom-step-unit">inHg</);
    assert.match(unitText({ device_class: 'energy', state_class: 'total_increasing', unit_of_measurement: 'Wh' }),
        /custom-step-unit">kWh</);
    assert.match(unitText({ device_class: 'energy', unit_of_measurement: 'Wh' }), /custom-step-unit">Wh</,
        'raw history keeps the entity unit');
    assert.doesNotMatch(unitText({ state_class: 'measurement' }), /custom-step-unit/);
});

test('editing a step value re-sorts the steps', () => {
    const scale = { type: 'absolute', steps: [{ value: 0, color: '#a' }, { value: 50, color: '#b' }, { value: 100, color: '#c' }] };
    const { editor } = makeEditor({ config: { scale } });
    editor._update_step_value(0, '75');
    assert.deepEqual(editor.dispatched[0].scale.steps, [
        { value: 50, color: '#b' }, { value: 75, color: '#a' }, { value: 100, color: '#c' }
    ]);
    assert.equal(scale.steps[0].value, 0, 'the current config is not mutated');
});

test('a blank or non-numeric step value is ignored', () => {
    const scale = { type: 'absolute', steps: [{ value: 0, color: '#a' }, { value: 1, color: '#b' }] };
    const { editor } = makeEditor({ config: { scale } });
    let updates = 0;
    editor.requestUpdate = () => { updates++; };
    editor._update_step_value(0, '');
    editor._update_step_value(0, 'abc');
    assert.equal(editor.dispatched.length, 0);
    assert.equal(updates, 2);
});

test('a new step goes one gap above the highest', () => {
    const add = (steps, type = 'absolute') => {
        const { editor } = makeEditor({ config: { scale: { type, steps } } });
        editor._add_step();
        return editor.dispatched[0].scale.steps.at(-1);
    };
    assert.deepEqual(add([{ value: 0, color: '#a' }, { value: 50, color: '#b' }, { value: 100, color: '#c' }]),
        { value: 150, color: '#888888' });
    assert.deepEqual(add([{ value: 29, color: '#a' }, { value: 29.6, color: '#b' }]).value.toFixed(1), '30.2');
    assert.equal(add([{ value: 10, color: '#a' }, { value: 10, color: '#b' }]).value, 11);
    assert.equal(add([]).value, 1);
    assert.deepEqual(add([{ color: '#a' }, { color: '#b' }], 'relative'), { color: '#888888' });
});

/* --- range controls (#21) ------------------------------------------------- */

const { tidy_range, RANGE_FALLBACK } = loadCard();

test('tidy_range widens a range to tidy numbers', () => {
    assert.deepEqual(plain(tidy_range(29.05, 29.58)), { low: 29, high: 29.6, decimals: 2 });
    assert.deepEqual(plain(tidy_range(3, 97)), { low: 0, high: 100, decimals: 0 });
    assert.deepEqual(plain(tidy_range(18.2, 24.7)), { low: 18, high: 25, decimals: 1 });
    assert.deepEqual(plain(tidy_range(-5.3, 12)), { low: -6, high: 12, decimals: 1 });
});

const settle = () => new Promise((resolve) => setImmediate(resolve));

function rangeEditor(options = {}) {
    const made = makeEditor({ ws: statsOf('mean', [29.3, 29.05, 29.58]), ...options });
    made.editor.updates = 0;
    made.editor.requestUpdate = () => { made.editor.updates++; };
    return made;
}

test('the range boxes are labelled Minimum and Maximum', () => {
    const markup = text(rangeEditor().editor.render_range_controls());
    assert.ok(markup.indexOf('>Minimum<') < markup.indexOf('>Maximum<'));
    assert.match(markup, /class="range-label">Minimum</);
});

test('the greyed placeholders show the inferred range once it has loaded', async () => {
    const { editor } = rangeEditor();
    assert.match(text(editor.render_range_controls()), /placeholder=Auto[\s\S]*placeholder=Auto/);
    await settle();
    assert.equal(editor.updates, 1, 're-rendered when the range landed');
    assert.match(text(editor.render_range_controls()), /placeholder=29\s[\s\S]*placeholder=29\.6\s/);
});

test('the placeholders fall back to 0 and 100 without usable data', async () => {
    const { editor } = rangeEditor({ ws: () => Promise.resolve({}) });
    editor.render_range_controls();
    await settle();
    assert.match(text(editor.render_range_controls()), /placeholder=0\s[\s\S]*placeholder=100\s/);
    assert.deepEqual(plain(RANGE_FALLBACK), { min: 0, max: 100 });
});

test('the range is looked up once per configuration', async () => {
    const { editor, calls } = rangeEditor();
    editor.render_range_controls();
    editor.render_range_controls();
    await settle();
    editor.render_range_controls();
    assert.equal(calls.ws.length, 1);

    editor._config = { ...editor._config, days: 3 };
    editor.render_range_controls();
    assert.equal(calls.ws.length, 2, 'a new window means a new lookup');
});

test('a range for an outdated configuration is dropped', async () => {
    let release;
    const { editor } = rangeEditor({ ws: () => new Promise((resolve) => { release = resolve; }) });
    editor.render_range_controls();
    await settle();
    editor._config = { ...editor._config, entity: 'sensor.other' };
    release({ 'sensor.x': [{ mean: 1 }, { mean: 9 }] });
    await settle();
    assert.equal(editor._range_hint_cache, undefined);
    assert.equal(editor.updates, 0);
});

const toggle = (editor, bound, checked) =>
    editor._range_auto_changed(bound, { stopPropagation() {}, target: { checked } });

test('unticking fills in the inferred value, not 0 (#21)', async () => {
    const { editor } = rangeEditor();
    editor.render_range_controls();
    await settle();
    await toggle(editor, 'max', false);
    await toggle(editor, 'min', false);
    assert.equal(editor.dispatched[0].data.max, 29.6);
    assert.equal(editor.dispatched[1].data.min, 29);
});

test('unticking before the range has loaded waits for it', async () => {
    const { editor } = rangeEditor();
    await toggle(editor, 'max', false);
    assert.equal(editor.dispatched[0].data.max, 29.6);
});

test('unticking without usable data fills in 0 or 100', async () => {
    const warn = console.warn;
    console.warn = () => {};
    try {
        const { editor } = rangeEditor({ ws: () => Promise.reject(new Error('boom')) });
        await toggle(editor, 'max', false);
        await toggle(editor, 'min', false);
        assert.equal(editor.dispatched[0].data.max, 100);
        assert.equal(editor.dispatched[1].data.min, 0);
    } finally {
        console.warn = warn;
    }
});

test('ticking infers the bound again and keeps the other one', async () => {
    const { editor } = rangeEditor({ config: { data: { min: 5, max: 50 } } });
    await toggle(editor, 'min', true);
    assert.deepEqual(editor.dispatched[0].data, { min: 'auto', max: 50 });
    assert.equal(editor._config.data.min, 5, 'the current config is not mutated');
});

/* --- accessible names ----------------------------------------------------- */

test('the range boxes are tied to their labels', () => {
    const markup = text(rangeEditor().editor.render_range_controls());
    assert.match(markup, /for="range-min"[^>]*>Minimum<\/label>\s*<input\s+id="range-min"/);
    assert.match(markup, /for="range-max"[^>]*>Maximum<\/label>\s*<input\s+id="range-max"/);
});

test('the range checkboxes say which bound they infer', () => {
    // Both visible labels read the same, so each name has to carry its bound.
    const markup = text(rangeEditor().editor.render_range_controls());
    for (const bound of ['minimum', 'maximum']) {
        const name = `Infer ${bound} from the sensor data`;
        assert.match(markup, new RegExp(`<ha-checkbox\\s+aria-label="${name}"`));
        assert.match(markup, new RegExp(`class="visually-hidden">${name}</span></ha-checkbox>`));
    }
});

test('every control in a step row is named after its step', () => {
    const scale = { type: 'absolute', steps: [{ value: 1, color: '#000000' }, { value: 2, color: '#ffffff' }] };
    const markup = text(makeEditor({ config: { scale } }).editor.render_custom_scale_editor());
    for (const name of ['Color for step 1', 'Value for step 1', 'Remove step 1', 'Remove step 2']) {
        assert.ok(markup.includes(`aria-label="${name}"`), name);
    }
});

test('adding a step is a button, not a link', () => {
    const scale = { type: 'relative', steps: [{ color: '#000000' }, { color: '#ffffff' }] };
    const markup = text(makeEditor({ config: { scale } }).editor.render_custom_scale_editor());
    assert.match(markup, /<button class="add-step"[\s\S]*?>\+ Add threshold<\/button>/);
    assert.doesNotMatch(markup, /<a href="#"/);
});

test('switches carry their label as a name', () => {
    const { editor } = makeEditor({ attributes: { state_class: 'total_increasing' } });
    const markup = text(editor.render_smoothing_toggle());
    assert.match(markup, /<ha-switch\s+aria-label="Smooth low-precision readings"/);
    assert.match(markup, /class="visually-hidden">Smooth low-precision readings<\/span><\/ha-switch>/);
});
