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

test('H5: a second setConfig on a live card refetches with the hass it has', { todo: true }, () => {
    const { card, hass } = liveCard({ title: 'One' });
    assert.equal(hass.requests.length, 1);
    card.setConfig({ entity: 'sensor.a', title: 'Two' });
    assert.equal(card.meta.title, 'Two');
    assert.equal(hass.requests.length, 2);
});

test('H6: an older fetch that resolves last does not overwrite the newer grid', { todo: true }, async () => {
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

test('H7: the grid is measured again after HA reconnects the card', { todo: true }, () => {
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

test('H8: a missing entity shows a status instead of throwing', { todo: true }, () => {
    const hass = fakeHass({});
    const card = new HeatmapCard();
    card.setConfig({ entity: 'sensor.gone' });
    assert.doesNotThrow(() => { card.hass = hass; });
    assert.doesNotThrow(() => card.render());
    assert.match(String(card.grid_status), /sensor\.gone/);
    assert.equal(hass.requests.length, 0);
});
