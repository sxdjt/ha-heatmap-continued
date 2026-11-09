'use strict';

/*
    Raw-history fallback for entities without a state_class: the pure reducer that turns
    HA history into statistics-shaped entries, and the card paths that route to it.
    Runs under TZ=UTC (see package.json); DST and offset zones have their own files.
*/

const test = require('node:test');
const assert = require('node:assert/strict');
const { loadCard } = require('./helpers/load-card.js');

const { HeatmapCard, HeatmapCardEditor, HeatmapScales, history_value, history_periods,
        history_to_statistics } = loadCard();

const HOUR = 3600000;
const MIN = 60000;
const T0 = Date.parse('2026-11-01T00:00:00Z');
const iso = (ms) => new Date(ms).toISOString();
const plain = (value) => JSON.parse(JSON.stringify(value));

// HA minimal_response: only the first state is a full object.
function history(entity_id, points) {
    return points.map(([ms, state], i) => (i === 0
        ? { entity_id, state, last_changed: iso(ms), last_updated: iso(ms) }
        : { state, last_changed: iso(ms) }));
}

/* --- history_value ------------------------------------------------------- */

test('history_value parses numeric states', () => {
    assert.equal(history_value('12.5'), 12.5);
    assert.equal(history_value('0'), 0);
    assert.equal(history_value('-3'), -3);
    assert.equal(history_value('1e3'), 1000);
});

test('history_value rejects states that are not a number', () => {
    for (const state of ['unavailable', 'unknown', '', '  ', '12abc', 'Infinity', 'NaN', undefined, null, 12]) {
        assert.equal(history_value(state), null, String(state));
    }
});

/* --- history_periods ----------------------------------------------------- */

test('history_periods aligns hourly periods to whole hours', () => {
    const periods = history_periods(T0 + 20 * MIN, T0 + 3 * HOUR, 'hour');
    assert.deepEqual(plain(periods), [[T0, T0 + HOUR], [T0 + HOUR, T0 + 2 * HOUR], [T0 + 2 * HOUR, T0 + 3 * HOUR]]);
});

test('history_periods aligns 5-minute periods to 5-minute boundaries', () => {
    const periods = history_periods(T0 + 7 * MIN, T0 + 20 * MIN, '5minute');
    assert.deepEqual(plain(periods).map(([from]) => (from - T0) / MIN), [5, 10, 15]);
    assert.ok(periods.every(([from, to]) => to - from === 5 * MIN));
});

test('history_periods starts daily periods at local midnight', () => {
    const periods = history_periods(T0 + 5 * HOUR, T0 + 50 * HOUR, 'day');
    assert.deepEqual(plain(periods).map(([from]) => (from - T0) / HOUR), [0, 24, 48]);
});

test('history_periods returns nothing for an empty window', () => {
    assert.equal(history_periods(T0, T0, 'hour').length, 0);
    assert.equal(history_periods(T0, T0, 'day').length, 0);
});

/* --- history_to_statistics ----------------------------------------------- */

test('history_to_statistics weights the mean by how long each value held', () => {
    const states = history('sensor.p', [[T0, '10'], [T0 + 45 * MIN, '20']]);
    const entries = history_to_statistics(states, T0, T0 + 2 * HOUR, 'hour');
    assert.deepEqual(plain(entries), [
        { start: T0, end: T0 + HOUR, mean: 12.5, min: 10, max: 20, state: 20 },
        { start: T0 + HOUR, end: T0 + 2 * HOUR, mean: 20, min: 20, max: 20, state: 20 }
    ]);
});

test('history_to_statistics starts the first state at the window start', () => {
    // HA returns the state in effect at start_time; it may carry an earlier timestamp.
    const states = history('sensor.p', [[T0 - 5 * HOUR, '4'], [T0 + 30 * MIN, '8']]);
    const [first] = history_to_statistics(states, T0, T0 + HOUR, 'hour');
    assert.equal(first.mean, 6);
    assert.equal(first.min, 4);
});

test('history_to_statistics treats unavailable time as a gap, not a zero', () => {
    const states = history('sensor.p', [[T0, '10'], [T0 + 30 * MIN, 'unavailable'], [T0 + 2 * HOUR + 30 * MIN, '30']]);
    const entries = history_to_statistics(states, T0, T0 + 3 * HOUR, 'hour');
    assert.deepEqual(plain(entries).map((e) => [(e.start - T0) / HOUR, e.mean]), [[0, 10], [2, 30]],
        'hour 1 is omitted entirely, like a statistics period without data');
});

test('history_to_statistics keeps the last value of each period as state', () => {
    const states = history('sensor.p', [[T0, '1'], [T0 + 10 * MIN, '9'], [T0 + 20 * MIN, '5']]);
    const [entry] = history_to_statistics(states, T0, T0 + HOUR, 'hour');
    assert.equal(entry.state, 5);
    assert.equal(entry.max, 9);
});

test('history_to_statistics stops at the window end', () => {
    const states = history('sensor.p', [[T0, '3']]);
    const entries = history_to_statistics(states, T0, T0 + 90 * MIN, 'hour');
    assert.equal(entries.length, 2);
    assert.equal(entries[1].mean, 3, 'the partial last hour averages only the time that has passed');
});

test('history_to_statistics ignores changes after the window end', () => {
    const states = history('sensor.p', [[T0, '3'], [T0 + 2 * HOUR, '100']]);
    const entries = history_to_statistics(states, T0, T0 + HOUR, 'hour');
    assert.deepEqual(plain(entries).map((e) => e.mean), [3]);
});

test('history_to_statistics falls back to last_updated', () => {
    const states = [
        { entity_id: 'sensor.p', state: '2', last_updated: iso(T0) },
        { state: '6', last_updated: iso(T0 + 30 * MIN) }
    ];
    assert.equal(history_to_statistics(states, T0, T0 + HOUR, 'hour')[0].mean, 4);
});

test('history_to_statistics returns nothing without numeric history', () => {
    assert.deepEqual(plain(history_to_statistics([], T0, T0 + HOUR, 'hour')), []);
    const text = history('sensor.p', [[T0, 'on'], [T0 + 10 * MIN, 'off']]);
    assert.deepEqual(plain(history_to_statistics(text, T0, T0 + HOUR, 'hour')), []);
});

test('history_to_statistics builds 5-minute and daily periods', () => {
    const states = history('sensor.p', [[T0, '2'], [T0 + 7 * MIN, '4']]);
    const five = history_to_statistics(states, T0, T0 + 10 * MIN, '5minute');
    assert.deepEqual(plain(five).map((e) => e.mean), [2, 3.2], '2 for 2 min, then 4 for 3 min');

    const days = history('sensor.p', [[T0, '0'], [T0 + 6 * HOUR, '24'], [T0 + 30 * HOUR, '48']]);
    const daily = history_to_statistics(days, T0, T0 + 48 * HOUR, 'day');
    assert.deepEqual(plain(daily).map((e) => [e.mean, e.min, e.max]), [[18, 0, 24], [42, 24, 48]]);
});

/* --- card routing -------------------------------------------------------- */

function historyCard({ mode = 'hourly', state_class, config = {}, response = [], view_offset = 0 } = {}) {
    const calls = { api: [], ws: [] };
    let pending;
    const card = Object.assign(Object.create(HeatmapCard.prototype), {
        config: { mode, entity: 'sensor.p', days: 2, weeks: 1, minute_interval: 5, data: {}, display: {}, ...config },
        meta: { language: 'en', state_class, data: {} },
        view_offset,
        myhass: {
            config: { unit_system: { temperature: '°C' } },
            localize: () => 'No data',
            callApi(method, path) { calls.api.push({ method, path }); pending = Promise.resolve(response); return pending; },
            callWS(request) { calls.ws.push(request); pending = Promise.resolve({}); return pending; }
        }
    });
    const settle = async () => { await pending; await new Promise((resolve) => setImmediate(resolve)); };
    return { card, calls, settle };
}

const cells = (grid) => grid.flatMap((row) => Array.from(row.vals)).filter((v) => v !== null);

test('uses_history follows the absence of a state_class', () => {
    assert.equal(historyCard({ state_class: undefined }).card.uses_history(), true);
    assert.equal(historyCard({ state_class: null }).card.uses_history(), true);
    assert.equal(historyCard({ state_class: 'measurement' }).card.uses_history(), false);
    assert.equal(Object.create(HeatmapCard.prototype).uses_history(), true, 'no meta yet');
});

test('an entity with a state_class still reads statistics', async () => {
    const { card, calls, settle } = historyCard({ state_class: 'measurement' });
    card.get_recorder(['sensor.p'], 2);
    await settle();
    assert.equal(calls.ws.length, 1);
    assert.equal(calls.api.length, 0);
});

test('hourly mode without a state_class reads raw history', async () => {
    const now = Date.now();
    const change = now - 2 * HOUR;
    const { card, calls, settle } = historyCard({
        response: [history('sensor.p', [[now - 5 * 86400000, '10'], [change, '20']])]
    });
    card.get_recorder(['sensor.p'], 2);
    await settle();

    assert.equal(calls.ws.length, 0);
    assert.equal(calls.api.length, 1);
    const { method, path } = calls.api[0];
    assert.equal(method, 'GET');
    assert.match(path, /^history\/period\/\d{4}-\d\d-\d\dT[\d:.]+Z\?filter_entity_id=sensor\.p&end_time=/);
    assert.match(path, /&significant_changes_only=1&minimal_response&no_attributes$/);

    assert.equal(card.grid_status, undefined);
    const values = cells(card.grid);
    assert.ok(values.length > 0);
    assert.ok(values.every((v) => v >= 10 && v <= 20));
    assert.ok(values.includes(10) && values.includes(20));
    assert.equal(card.meta.data.min, 10);
    assert.equal(card.meta.data.max, 20);
});

test('minute mode without a state_class reads raw history in 5-minute periods', async () => {
    const now = Date.now();
    const { card, calls, settle } = historyCard({
        mode: 'minute', config: { days: 1 },
        response: [history('sensor.p', [[now - 3 * HOUR, '7']])]
    });
    card.get_recorder(['sensor.p'], 1);
    await settle();
    assert.equal(calls.api.length, 1);
    const values = cells(card.grid);
    assert.ok(values.length >= 30, 'roughly three hours of 5-minute cells');
    assert.ok(values.every((v) => v === 7));
});

test('daily mode without a state_class reads raw history per day', async () => {
    const now = Date.now();
    for (const aggregate of ['mean', 'min', 'max', 'last']) {
        const { card, calls, settle } = historyCard({
            mode: 'daily', config: { aggregate },
            response: [history('sensor.p', [[now - 3 * 86400000, '5']])]
        });
        card.get_recorder_daily(['sensor.p'], 1);
        await settle();
        assert.equal(calls.api.length, 1, aggregate);
        assert.equal(calls.ws.length, 0, aggregate);
        assert.equal(card.grid_status, undefined, aggregate);
        const values = cells(card.grid);
        assert.ok(values.length >= 3, aggregate);
        assert.ok(values.every((v) => v === 5), aggregate);
    }
});

test('no raw history explains the retention limit', async () => {
    for (const mode of ['hourly', 'minute']) {
        const { card, settle } = historyCard({ mode, response: [] });
        card.get_recorder(['sensor.p'], 1);
        await settle();
        assert.deepEqual(plain(card.grid), [], mode);
        assert.match(card.grid_status, /^No data\. This entity has no state_class/, mode);
        assert.match(card.grid_status, /purge_keep_days \(10 days by default\)/, mode);
    }
    const { card, settle } = historyCard({ mode: 'daily', response: [] });
    card.get_recorder_daily(['sensor.p'], 1);
    await settle();
    assert.match(card.grid_status, /^No data\. This entity has no state_class/);
});

test('non-numeric raw history is reported as no data', async () => {
    const { card, settle } = historyCard({
        response: [history('sensor.p', [[Date.now() - HOUR, 'unavailable']])]
    });
    card.get_recorder(['sensor.p'], 1);
    await settle();
    assert.match(card.grid_status, /^No data\. This entity has no state_class/);
});

test('statistics no-data messages are unchanged', async () => {
    const hourly = historyCard({ state_class: 'measurement' });
    hourly.card.get_recorder(['sensor.p'], 1);
    await hourly.settle();
    assert.equal(hourly.card.grid_status, 'No data');

    const daily = historyCard({ mode: 'daily', state_class: 'measurement' });
    daily.card.get_recorder_daily(['sensor.p'], 1);
    await daily.settle();
    assert.equal(daily.card.grid_status, 'No data');
});

test('a failed history request is reported, not swallowed', async () => {
    const { card } = historyCard();
    let rejected;
    card.myhass.callApi = () => { rejected = Promise.reject(new Error('boom')); return rejected; };
    card.get_recorder(['sensor.p'], 1);
    await rejected.catch(() => {});
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(card.grid_status, 'Error loading data: boom');
});

/* --- secondary entity ---------------------------------------------------- */

function fetchCard(primary_class, secondary_class, secondary_loaded = true) {
    const states = { 'sensor.a': { attributes: { state_class: primary_class } } };
    if (secondary_loaded) { states['sensor.b'] = { attributes: { state_class: secondary_class } }; }
    const calls = [];
    const card = Object.assign(Object.create(HeatmapCard.prototype), {
        config: { entity: 'sensor.a', secondary_entity: 'sensor.b', mode: 'hourly', days: 1, data: {}, display: {} },
        scales: new HeatmapScales(),
        view_offset: 0,
        myhass: {
            config: { unit_system: { temperature: '°C' } },
            language: 'en',
            states,
            localize: () => 'No data',
            callApi(...args) { calls.push(args); return new Promise(() => {}); },
            callWS(request) { calls.push(request); return new Promise(() => {}); }
        }
    });
    return { card, calls };
}

test('a secondary entity is rejected when the primary has no state_class', () => {
    const { card, calls } = fetchCard(undefined, 'measurement');
    card.fetch_history();
    assert.equal(calls.length, 0, 'nothing is fetched');
    assert.deepEqual(plain(card.grid), []);
    assert.match(card.grid_status, /'sensor\.a' has no state_class/);
});

test('a secondary entity is rejected when it has no state_class', () => {
    const { card, calls } = fetchCard('measurement', undefined);
    card.fetch_history();
    assert.equal(calls.length, 0);
    assert.match(card.grid_status, /'sensor\.b' has no state_class/);
});

test('secondary_history_conflict allows statistics pairs and unloaded secondaries', () => {
    assert.equal(fetchCard('measurement', 'measurement').card.secondary_history_conflict(), null);
    assert.equal(fetchCard('measurement', undefined, false).card.secondary_history_conflict(), null);
    const { card } = fetchCard('measurement', 'measurement');
    card.config.secondary_entity = undefined;
    assert.equal(card.secondary_history_conflict(), null);
});

test('a statistics pair still fetches both entities together', () => {
    const { card, calls } = fetchCard('measurement', 'measurement');
    card.fetch_history();
    assert.equal(calls.length, 1);
    assert.deepEqual([...calls[0].statistic_ids], ['sensor.a', 'sensor.b']);
});

/* --- editor -------------------------------------------------------------- */

function editor(states, config = {}) {
    const instance = Object.create(HeatmapCardEditor.prototype);
    instance.myhass = { states };
    instance._config = { entity: 'sensor.a', ...config };
    instance.entity = states['sensor.a'];
    return instance;
}

const markup = (template) => template.strings.join('');

test('the editor shows an info note, not a warning, for an entity without a state_class', () => {
    const template = editor({ 'sensor.a': { attributes: {} } }).render_entity_warning();
    assert.deepEqual([...template.values].slice(0, 2), ['No long-term statistics', 'info']);
    assert.match(markup(template), /reads its raw history/);
    assert.match(markup(template), /purge_keep_days/);
});

test('the editor still warns for a state_class the card cannot read', () => {
    const template = editor({ 'sensor.a': { attributes: { state_class: 'measurement_angle' } } }).render_entity_warning();
    assert.deepEqual([...template.values].slice(0, 3), ['Warning', 'warning', 'measurement_angle']);
});

test('the editor says nothing for a readable state_class or an unloaded entity', () => {
    assert.equal(editor({ 'sensor.a': { attributes: { state_class: 'measurement' } } }).render_entity_warning(), undefined);
    assert.equal(editor({}).render_entity_warning(), undefined);
});

test('the editor warns when a combined entity has no state_class', () => {
    const states = { 'sensor.a': { attributes: { state_class: 'measurement' } }, 'sensor.b': { attributes: {} } };
    const template = editor(states, { secondary_entity: 'sensor.b' }).render_secondary_entity_warning();
    assert.equal(template.values[2], 'sensor.b');
    assert.match(markup(template), /cannot be combined/);

    states['sensor.b'].attributes.state_class = 'measurement';
    assert.equal(editor(states, { secondary_entity: 'sensor.b' }).render_secondary_entity_warning(), undefined);
});
