'use strict';

/*
    Branches the behaviour-focused files do not reach: config and custom scale
    validation, fetch and grid-builder edge cases, horizontal rendering and sizing.
*/

const test = require('node:test');
const assert = require('node:assert/strict');
const { loadCard } = require('./helpers/load-card.js');
const { fakeHass, hourlyRows, settle, markup, HOUR } = require('./helpers/fixtures.js');

const { HeatmapCard, HeatmapScales, fetch_history_statistics, month_shortening_is_safe } = loadCard();

const ATTRS = { state_class: 'measurement', friendly_name: 'A', unit_of_measurement: 'W' };

function newCard(config) {
    const card = new HeatmapCard();
    card.setConfig({ entity: 'sensor.a', ...config });
    return card;
}

async function loadedCard(config = {}, rows = { 'sensor.a': hourlyRows(5, 3) }, attributes = ATTRS, states = {}) {
    const hass = fakeHass({ 'sensor.a': { state: '1', attributes }, ...states });
    const card = newCard(config);
    card.hass = hass;
    if (hass.requests.length > 0) { hass.requests[0].resolve(rows); }
    await settle();
    return { card, hass };
}

/* --- setConfig ------------------------------------------------------------------ */

test('setConfig rejects malformed configs', () => {
    const card = new HeatmapCard();
    const cases = [
        [null, /must be an object/],
        [[], /must be an object/],
        [{ entity: 'sensor.a', secondary_entity: '' }, /non-empty entity ID/],
        [{ entity: 'sensor.a', data: null }, /`data` must be an object/],
        [{ entity: 'sensor.a', data: [] }, /`data` must be an object/],
        [{ entity: 'sensor.a', display: [] }, /`display` must be an object/],
        [{ entity: 'sensor.a', display: { legend: 'no' } }, /display.legend/],
        [{ entity: 'sensor.a', display: { labels: 1 } }, /display.labels/],
        [{ entity: 'sensor.a', display: { hide_zero: 'yes' } }, /display.hide_zero/],
        [{ entity: 'sensor.a', display: { decimals: 11 } }, /display.decimals/],
        [{ entity: 'sensor.a', scale: 'no such scale' }, /Unknown scale/]
    ];
    for (const [config, message] of cases) {
        assert.throws(() => card.setConfig(config), message, JSON.stringify(config));
    }
    assert.doesNotThrow(() => card.setConfig({ entity: 'sensor.a', display: { hide_zero: true } }));
});

test('custom scales are validated step by step', () => {
    const scales = new HeatmapScales();
    const ok = { color: '#000000', value: 0 };
    const cases = [
        [null, /must be an object/],
        [[], /must be an object/],
        [{ type: 'bogus', steps: [ok, ok] }, /scale.type/],
        [{ steps: [ok] }, /2-100 entries/],
        [{ steps: Array(101).fill(ok) }, /2-100 entries/],
        [{ steps: 'x' }, /2-100 entries/],
        [{ steps: [ok, null] }, /must be an object/],
        [{ steps: [ok, []] }, /must be an object/],
        [{ steps: [ok, { color: 'not a color' }] }, /valid color/],
        [{ steps: [ok, { color: 7 }] }, /valid color/],
        [{ steps: [ok, { color: '#fff', value: Infinity }] }, /finite numbers/],
        [{ type: 'absolute', steps: [ok, { color: '#fff' }] }, /numeric values/]
    ];
    for (const [scale, message] of cases) {
        assert.throws(() => scales.get_scale(scale), message, JSON.stringify(scale));
    }
});

/* --- populate_meta, fetch errors ------------------------------------------------ */

test('the language comes from selectedLanguage, then language, then en', async () => {
    const { card } = await loadedCard();
    const hass = (extra) => ({ config: { unit_system: {} }, states: card.myhass.states, ...extra });
    assert.equal(card.populate_meta(hass({ selectedLanguage: 'de', language: 'fr' })).language, 'de');
    assert.equal(card.populate_meta(hass({ language: 'fr' })).language, 'fr');
    assert.equal(card.populate_meta(hass({})).language, 'en');
});

test('an unknown state_class reports an error instead of drawing garbage', async () => {
    const { card } = await loadedCard({}, { 'sensor.a': hourlyRows(1) }, { state_class: 'not_a_class' });
    assert.match(card.grid_status, /Unknown state_class defined \(not_a_class/);
});

test('a fetch error that is not an Error object is reported as is', async () => {
    const hass = fakeHass({ 'sensor.a': { state: '1', attributes: ATTRS } });
    const card = newCard({});
    card.hass = hass;
    const error = console.error;
    console.error = () => {};
    try {
        hass.requests[0].resolve(Promise.reject('socket closed'));
        await settle();
    } finally {
        console.error = error;
    }
    assert.equal(card.grid_status, 'Error loading data: socket closed');
});

test('a daily fetch error is reported', async () => {
    const hass = fakeHass({ 'sensor.a': { state: '1', attributes: ATTRS } });
    const card = newCard({ mode: 'daily', weeks: 1 });
    card.hass = hass;
    const error = console.error;
    console.error = () => {};
    try {
        hass.requests[0].resolve(Promise.reject(new Error('boom')));
        await settle();
    } finally {
        console.error = error;
    }
    assert.equal(card.grid_status, 'Error loading data: boom');
});

/* --- grid builders ----------------------------------------------------------------- */

test('a secondary entity with data is combined per hour, missing rows count as absent', async () => {
    const states = { 'sensor.b': { state: '1', attributes: ATTRS } };
    const { card } = await loadedCard({ secondary_entity: 'sensor.b', operation: 'sum' },
        { 'sensor.a': hourlyRows(5, 3), 'sensor.b': hourlyRows(2, 3) }, ATTRS, states);
    const vals = card.grid.flatMap((row) => Array.from(row.vals)).filter((v) => v !== null);
    assert.ok(vals.length > 0);
    assert.ok(vals.every((v) => v === 7));

    card.meta.state_class = 'total_increasing';
    const day = new Date(2026, 0, 1);
    const [row] = card.combine_grids([{ date: 'd', nativeDate: day, vals: [4] }], [], 'difference');
    assert.deepEqual(Array.from(row.vals), [4], 'no secondary row: a meter counts it as 0');
});

test('daily mode: a missing aggregate is a gap, Sunday is the last column', async () => {
    const sunday = new Date(2026, 10, 22, 12);   // a Sunday
    const { card } = await loadedCard({ mode: 'daily', weeks: 1, aggregate: 'max' },
        { 'sensor.a': [{ start: sunday.getTime(), mean: 3 }] });
    const row = card.grid.find((r) => r.vals[6] !== undefined);
    assert.equal(row.vals[6], null);
});

test('minute day rows leave a missing reading empty', () => {
    const card = Object.create(HeatmapCard.prototype);
    card.config = { mode: 'minute', minute_rows: 'day', display: {} };
    card.meta = { language: 'en' };
    const start = new Date(2026, 0, 1, 0, 0).getTime();
    const [row] = card.calculate_minute_day_values([{ start }, { start: start + 300000, mean: 4 }], 'mean', false);
    assert.deepEqual(Array.from(row.vals), [null, 4]);
});

test('minute hour rows leave a missing reading empty', () => {
    const card = Object.create(HeatmapCard.prototype);
    card.config = { mode: 'minute', display: {} };
    card.meta = { language: 'en' };
    const start = new Date(2026, 0, 1, 3, 0).getTime();
    const [row] = card.calculate_minute_values([{ start }, { start: start + 300000, mean: 4 }], 'mean', false);
    assert.deepEqual(Array.from(row.vals), [null, 4]);
});

test('raw history: an empty response and lists without an entity_id are skipped', async () => {
    const hass = { callApi: () => Promise.resolve(null) };
    const start = Date.now() - 2 * HOUR;
    assert.deepEqual({ ...(await fetch_history_statistics(hass, ['sensor.a'], 'hour', new Date(start).toISOString(), new Date().toISOString())) }, {});
    const nameless = { callApi: () => Promise.resolve([[{ state: '1', last_changed: new Date(start).toISOString() }]]) };
    assert.deepEqual({ ...(await fetch_history_statistics(nameless, ['sensor.a'], 'hour', new Date(start).toISOString(), new Date().toISOString())) }, {});
});

test('month shortening is cached for an unspecified language', () => {
    assert.equal(typeof month_shortening_is_safe(undefined), 'boolean');
    assert.equal(month_shortening_is_safe(''), month_shortening_is_safe(undefined));
});

/* --- horizontal rendering and sizing ----------------------------------------------- */

test('horizontal layout renders through render(), with short rows padded', async () => {
    const { card } = await loadedCard({ orientation: 'horizontal', days: 2 }, { 'sensor.a': hourlyRows(5, 3) });
    card.grid.push({ date: 'x', nativeDate: new Date(2026, 0, 1), vals: [1] });
    const text = markup(card.render());
    assert.match(text, /class="hm-box null"/);
    card.grid_width = 400;
    card.grid_height = 300;
    assert.equal(typeof card.labels_are_legible(3), 'boolean');
});

test('label width ignores rows without values', () => {
    const card = Object.create(HeatmapCard.prototype);
    card.config = { display: {} };
    card.grid = [{}, { vals: [12.5, null] }];
    assert.equal(card.widest_label_length(), 4);
});

test('grid_style gives no row height for an empty grid', () => {
    const card = newCard({ display: { height: 300 } });
    card.grid = [];
    assert.equal(card.grid_style(), '');
});

test('minute headers fall back to the interval when there is no data', () => {
    const card = newCard({ mode: 'minute', minute_interval: 15 });
    card.grid = [];
    card.meta = { language: 'en' };
    card.myhass = { locale: { time_format: '24' } };
    assert.equal(card.minute_table_headers().length, 4);
});

test('minute mode tooltips give the cell\'s time window', async () => {
    const { card } = await loadedCard({ mode: 'minute' },
        { 'sensor.a': [{ start: Math.floor(Date.now() / HOUR) * HOUR, mean: 2 }] });
    const { meta, value } = card.cell_description({ row: '0', col: '1', val: '2' });
    assert.match(meta, /:05/);
    assert.match(value, /^2 W$/);
});

test('getCardSize: horizontal daily mode is seven slots tall', () => {
    const daily = newCard({ mode: 'daily', orientation: 'horizontal' });
    const hourly = newCard({ orientation: 'horizontal' });
    assert.ok(daily.getCardSize() < hourly.getCardSize());
});

test('updated() calls through to the base class when it has one', async () => {
    const { card } = await loadedCard();
    const base = Object.getPrototypeOf(HeatmapCard.prototype);
    const seen = [];
    base.updated = (changed) => seen.push(changed);
    try {
        card.updated('changed');
    } finally {
        delete base.updated;
    }
    assert.deepEqual(seen, ['changed']);
});

test('observe_grid does nothing where ResizeObserver does not exist', async () => {
    const { card } = await loadedCard();
    card.observe_grid();
    assert.equal(card._grid_observer, undefined);
});
