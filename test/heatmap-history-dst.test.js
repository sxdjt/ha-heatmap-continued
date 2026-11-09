'use strict';

/*
    Raw-history periods across daylight saving changes. Must set TZ before anything
    touches Date, and lives in its own file because node --test gives each file its own
    process.
*/
process.env.TZ = 'Europe/London';

const test = require('node:test');
const assert = require('node:assert/strict');
const { loadCard } = require('./helpers/load-card.js');

const { history_periods, history_to_statistics } = loadCard();

const HOUR = 3600000;
const plain = (value) => JSON.parse(JSON.stringify(value));

test('daily periods follow local midnight across clocks going back', () => {
    // 25 Oct 2026: BST -> GMT, so that day is 25 hours long.
    const start = new Date(2026, 9, 24).getTime();
    const end = new Date(2026, 9, 27).getTime();
    const periods = history_periods(start, end, 'day');
    assert.deepEqual(plain(periods).map(([from, to]) => (to - from) / HOUR), [24, 25, 24]);
    assert.ok(periods.every(([from]) => new Date(from).getHours() === 0));
});

test('daily periods follow local midnight across clocks going forward', () => {
    // 29 Mar 2026: GMT -> BST, so that day is 23 hours long.
    const start = new Date(2026, 2, 28).getTime();
    const end = new Date(2026, 2, 31).getTime();
    const periods = history_periods(start, end, 'day');
    assert.deepEqual(plain(periods).map(([from, to]) => (to - from) / HOUR), [24, 23, 24]);
});

test('hourly periods stay one hour long through the repeated hour', () => {
    const start = Date.parse('2026-10-24T23:00:00Z');
    const end = Date.parse('2026-10-25T03:00:00Z');
    const periods = history_periods(start, end, 'hour');
    assert.equal(periods.length, 4);
    assert.ok(periods.every(([from, to]) => to - from === HOUR));
    assert.deepEqual(plain(periods).map(([from]) => new Date(from).getHours()), [0, 1, 1, 2],
        'local 01:00 occurs twice, as two separate periods');
});

test('a 25-hour day averages over all 25 hours', () => {
    const start = new Date(2026, 9, 25).getTime();
    const end = new Date(2026, 9, 26).getTime();
    const states = [
        { entity_id: 'sensor.p', state: '0', last_changed: new Date(start).toISOString() },
        { state: '25', last_changed: new Date(start + 20 * HOUR).toISOString() }
    ];
    const [day] = history_to_statistics(states, start, end, 'day');
    assert.equal(day.end - day.start, 25 * HOUR);
    assert.equal(day.mean, 5, '0 for 20 h, 25 for 5 h');
});
