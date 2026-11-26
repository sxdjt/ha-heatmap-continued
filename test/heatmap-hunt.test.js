'use strict';

/*
    Bugs found by the 2026-11 card review sweep (docs/card-review-plan.md in the
    monorepo). Each starts as a `todo` test describing the intended behavior and
    becomes a regular test when its fix lands.
*/

const test = require('node:test');
const assert = require('node:assert/strict');
const { loadCard } = require('./helpers/load-card.js');

const { HeatmapCard, HeatmapCardEditor, HeatmapScales, bucket_values, vm_global } = loadCard();

function hassWith(attributes) {
    return {
        config: { unit_system: { temperature: '°C' } },
        language: 'en',
        states: { 'sensor.a': { state: '1', attributes } }
    };
}

// A card that went through setConfig, as HA builds it, then populate_meta.
function metaFor(config, attributes) {
    const card = Object.create(HeatmapCard.prototype);
    card.scales = new HeatmapScales();
    card.setConfig({ entity: 'sensor.a', ...config });
    return card.populate_meta(hassWith(attributes));
}

test('H1: config device_class picks the scale for an entity without one', () => {
    const meta = metaFor({ device_class: 'temperature' }, { unit_of_measurement: '°C', state_class: 'measurement' });
    assert.equal(meta.device_class, 'temperature');
    assert.equal(meta.scale.key, 'outdoor temperature');
});

test('H1: the editor\'s temperature switch converts the scale to a °F sensor\'s unit', () => {
    // What render_device_class_picker() writes for an entity without a device_class.
    const meta = metaFor({ device_class: 'temperature', scale: 'outdoor temperature' },
        { unit_of_measurement: '°F', state_class: 'measurement' });
    assert.equal(meta.scale.unit, '°F');
});

test('H1: the entity\'s own device_class still wins over the config', () => {
    const meta = metaFor({ device_class: 'temperature' }, { device_class: 'humidity', state_class: 'measurement' });
    assert.equal(meta.device_class, 'humidity');
    assert.equal(meta.scale.key, 'stoplight');
});

test('H2: carbon_dioxide and pm25 sensors select their scales again', () => {
    assert.equal(metaFor({}, { device_class: 'carbon_dioxide' }).scale.key, 'carbon dioxide');
    assert.equal(metaFor({}, { device_class: 'pm25' }).scale.key, 'pm25');
});

test('H3: the RdPu scale is named RdPu, not BuPu', () => {
    const scales = new HeatmapScales();
    assert.equal(scales.scale_by_key['colorbrewer 5cl rdpu'].name, 'ColorBrewer 5-class RdPu');
});

/* --- Card lifecycle and fetches, in HA's order: setConfig, hass, connect ---- */

const HOUR = 3600000;

// A hass whose callWS answers are released by the test, in any order.
function fakeHass(states) {
    const requests = [];
    return {
        requests,
        config: { unit_system: { temperature: '°C' } },
        language: 'en',
        locale: { time_format: '24' },
        localize: () => 'No data',
        states,
        callWS(request) {
            return new Promise((resolve) => { requests.push({ request, resolve }); });
        }
    };
}

// One statistics row per hour for the last `hours` hours, all with the same mean.
function hourlyRows(mean, hours = 3) {
    const now = Math.floor(Date.now() / HOUR) * HOUR;
    return Array.from({ length: hours }, (_, i) => ({ start: now - (hours - i) * HOUR, mean }));
}

const settle = () => new Promise((resolve) => setImmediate(resolve));
const values = (card) => card.grid.flatMap((row) => Array.from(row.vals)).filter((v) => v !== null);

function liveCard(config, attributes = { state_class: 'measurement', friendly_name: 'A' }) {
    const hass = fakeHass({ 'sensor.a': { state: '1', attributes } });
    const card = new HeatmapCard();
    card.setConfig({ entity: 'sensor.a', ...config });
    card.hass = hass;
    return { card, hass };
}

test('H4: a measurement_angle sensor (wind direction) renders as a measurement', async () => {
    const { card, hass } = liveCard({}, { state_class: 'measurement_angle', unit_of_measurement: '°' });
    hass.requests[0].resolve({ 'sensor.a': hourlyRows(270) });
    await settle();
    assert.equal(card.grid_status, undefined);
    assert.ok(values(card).length > 0);
    assert.ok(values(card).every((v) => v === 270));
});

test('H4: time_interval averages angles around the circle', () => {
    const card = Object.create(HeatmapCard.prototype);
    card.config = { mode: 'hourly', time_interval: 2 };
    card.meta = { state_class: 'measurement_angle' };
    const [entry] = card.bucket_grid([{ vals: [350, 10] }]);
    const v = entry.vals[0];
    assert.ok(Math.min(Math.abs(v), Math.abs(360 - v)) < 1e-9, `350 and 10 average to 0, got ${v}`);
});

test('H4: circular buckets wrap, skip gaps and stay in [0, 360)', () => {
    const near = (a, b) => Math.abs(a - b) < 1e-9;
    const [a, b, c] = bucket_values([90, 180, 270, null, null, null], 2, false, true);
    assert.ok(near(a, 135));
    assert.equal(b, 270, 'a missing hour is skipped, not counted as 0 degrees');
    assert.equal(c, null);
    const [d] = bucket_values([340, 350], 2, false, true);
    assert.ok(near(d, 345));
    assert.deepEqual(Array.from(bucket_values([350, 10], 2, false)), [180], 'linear unless circular');
});

test('H4: measurement_angle combines like a measurement', () => {
    const card = Object.create(HeatmapCard.prototype);
    card.config = { mode: 'hourly' };
    card.meta = { state_class: 'measurement_angle' };
    const day = new Date(2026, 0, 1);
    const [row] = card.combine_grids([{ date: 'd', nativeDate: day, vals: [10, 20] }],
        [{ date: 'd', nativeDate: day, vals: [null, 5] }], 'difference');
    assert.deepEqual(Array.from(row.vals), [null, 15], 'measurement null policy: a missing side stays null');
});

test('H4: measurement_angle pairs with measurement but not with a total', () => {
    const conflict = (secondary_class) => {
        const card = Object.create(HeatmapCard.prototype);
        card.config = { entity: 'sensor.a', secondary_entity: 'sensor.b' };
        card.meta = { state_class: 'measurement_angle' };
        card.myhass = { states: { 'sensor.b': { attributes: { state_class: secondary_class } } } };
        return card.secondary_state_class_conflict();
    };
    assert.equal(conflict('measurement'), null);
    assert.equal(conflict('measurement_angle'), null);
    assert.match(conflict('total_increasing'), /Cannot combine/);
});

test('H4: the editor does not warn that a measurement_angle sensor has no statistics', () => {
    const editor = Object.create(HeatmapCardEditor.prototype);
    editor.scales = new HeatmapScales();
    editor._config = { entity: 'sensor.a' };
    editor.entity = { attributes: { state_class: 'measurement_angle' } };
    assert.equal(editor.render_entity_warning(), undefined);
});

test('H5: a second setConfig on a live card refetches with the hass it has', () => {
    const { card, hass } = liveCard({ title: 'One' });
    assert.equal(hass.requests.length, 1);
    card.setConfig({ entity: 'sensor.a', title: 'Two' });
    assert.equal(card.meta.title, 'Two');
    assert.equal(hass.requests.length, 2);
});

test('H5: setConfig on a card without hass does not fetch', () => {
    const card = new HeatmapCard();
    assert.doesNotThrow(() => card.setConfig({ entity: 'sensor.a' }));
    assert.equal(card.meta, undefined);
});

test('H6: an older fetch that resolves last does not overwrite the newer grid', async () => {
    const { card, hass } = liveCard({ days: 1 });
    card.navigate('back');
    assert.equal(hass.requests.length, 2);
    // The newer (paged back) answer lands first, then the stale present-day one.
    hass.requests[1].resolve({ 'sensor.a': hourlyRows(2) });
    await settle();
    hass.requests[0].resolve({ 'sensor.a': hourlyRows(1) });
    await settle();
    assert.ok(values(card).length > 0);
    assert.ok(values(card).every((v) => v === 2), `grid shows ${[...new Set(values(card))]}`);
});

test('H6: stale daily answers and stale errors are dropped too', async () => {
    const { card, hass } = liveCard({ mode: 'daily', weeks: 1 });
    card.navigate('back');
    card.navigate('current');
    assert.equal(hass.requests.length, 3);
    const day = { start: Date.now() - 86400000, mean: 7, min: 7, max: 7 };
    hass.requests[2].resolve({ 'sensor.a': [day] });
    await settle();
    hass.requests[0].resolve({ 'sensor.a': [{ ...day, mean: 1, min: 1, max: 1 }] });
    hass.requests[1].resolve(Promise.reject(new Error('late failure')));
    await settle();
    assert.equal(card.grid_status, undefined);
    assert.ok(values(card).length > 0);
    assert.ok(values(card).every((v) => v === 7));
});

test('H6: a conflict status is not overwritten by an earlier fetch', async () => {
    const { card, hass } = liveCard({ secondary_entity: 'sensor.b' });
    hass.states['sensor.b'] = { state: '1', attributes: { state_class: 'total_increasing' } };
    card.setConfig({ entity: 'sensor.a', secondary_entity: 'sensor.b', title: 'x' });
    hass.requests[0].resolve({ 'sensor.a': hourlyRows(1) });
    await settle();
    assert.match(card.grid_status, /Cannot combine/);
});

test('H7: the grid is measured again after HA reconnects the card', () => {
    const observed = [];
    vm_global.ResizeObserver = class {
        observe(el) { observed.push(el); }
        disconnect() {}
    };
    try {
        const { card } = liveCard({});
        const grid = {};
        Object.defineProperty(card, 'renderRoot', { value: { querySelector: () => grid } });
        card.connectedCallback();
        card.firstUpdated();
        card.hasUpdated = true;
        card.disconnectedCallback();
        card.connectedCallback();
        assert.equal(observed.length, 2, 'observing again after the reconnect');
        assert.ok(card._grid_observer, 'an observer is attached');
    } finally {
        delete vm_global.ResizeObserver;
    }
});

test('H8: a missing entity shows a status instead of throwing', () => {
    const hass = fakeHass({});
    const card = new HeatmapCard();
    card.setConfig({ entity: 'sensor.gone' });
    assert.doesNotThrow(() => { card.hass = hass; });
    assert.doesNotThrow(() => card.render());
    assert.match(String(card.grid_status), /sensor\.gone/);
    assert.equal(hass.requests.length, 0);
});

test('H8: the card recovers when the missing entity appears', () => {
    const hass = fakeHass({});
    const card = new HeatmapCard();
    card.setConfig({ entity: 'sensor.a', title: 'Mine' });
    card.hass = hass;
    const status = card.render().strings.join('');
    assert.match(status, /<ha-card header="/);
    assert.equal(card.render().values[0], 'Mine', 'the configured title is kept while waiting');
    hass.states['sensor.a'] = { state: '1', attributes: { state_class: 'measurement' } };
    card.hass = { ...hass };
    assert.equal(hass.requests.length, 1, 'fetched on the next hass update');
    assert.equal(card.meta.title, 'Mine');
});

/* --- E1: "Show title" switch (decision a: it writes title: null) ---------- */

function titleEditor(config) {
    const editor = Object.create(HeatmapCardEditor.prototype);
    editor.scales = new HeatmapScales();
    editor._config = { entity: 'sensor.a', ...config };
    editor.dispatched = [];
    editor._dispatch_config = (c) => editor.dispatched.push(c);
    return editor;
}

// Template values: [checked, onChange, slotted name, title box].
function titleSwitch(editor) {
    const [checked, change, , box] = editor.render_title_fields().values;
    return { checked, change, box };
}

test('E1: the Show title switch is on unless the title is null', () => {
    assert.equal(titleSwitch(titleEditor({})).checked, true);
    assert.equal(titleSwitch(titleEditor({ title: 'Mine' })).checked, true);
    assert.equal(titleSwitch(titleEditor({ title: null })).checked, false);
});

test('E1: turning the switch off stores title: null, on removes the key', () => {
    const off = titleEditor({ title: 'Mine' });
    titleSwitch(off).change({ target: { checked: false } });
    assert.equal(off.dispatched[0].title, null);

    const on = titleEditor({ title: null });
    titleSwitch(on).change({ target: { checked: true } });
    assert.equal('title' in on.dispatched[0], false);
});

test('E1: the title box is hidden while the header is off', () => {
    assert.equal(titleSwitch(titleEditor({ title: null })).box, '');
    const box = titleSwitch(titleEditor({ title: 'Mine' })).box;
    assert.match(box.strings.join(''), /<ha-selector/);
    assert.ok(box.values.includes('Mine'));
});

test('E1: the card hides the header for title: null and uses the friendly name when unset', () => {
    const hass = (title) => {
        const card = Object.create(HeatmapCard.prototype);
        card.scales = new HeatmapScales();
        card.setConfig({ entity: 'sensor.a', ...(title === undefined ? {} : { title }) });
        return card.populate_meta(hassWith({ friendly_name: 'Friendly', state_class: 'measurement' })).title;
    };
    assert.equal(hass(null), undefined);
    assert.equal(hass(undefined), 'Friendly');
    assert.equal(hass('Mine'), 'Mine');
});

test('H9: a relative scale over a flat range colours cells from the scale, not grey', { todo: true }, () => {
    const scale = new HeatmapScales().get_scale('stoplight');
    const card = Object.create(HeatmapCard.prototype);
    card.config = { display: {} };
    card.meta = { scale, data: { min: 5, max: 5 } };
    card.grid = [{ vals: [5] }];
    const color = card.render_cell(5, 0, 0).values.at(-2);
    assert.equal(String(color), String(scale.gradient(0.5)), 'the middle of the scale');
});
