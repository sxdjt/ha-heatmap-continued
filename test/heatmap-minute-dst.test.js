'use strict';

/*
    Minute mode across daylight saving changes. Must set TZ before anything touches Date,
    and lives in its own file because node --test gives each file its own process.
*/
process.env.TZ = 'Europe/London';

const test = require('node:test');
const assert = require('node:assert/strict');
const { loadCard } = require('./helpers/load-card.js');

const { HeatmapCard } = loadCard();

function minuteCard() {
    return Object.assign(Object.create(HeatmapCard.prototype), {
        config: { mode: 'minute', minute_interval: 5, display: {} },
        meta: { language: 'en', state_class: 'measurement' },
        myhass: { locale: { time_format: '24' } }
    });
}

const at = (iso, mean) => ({ start: Date.parse(iso), mean });
const plain = (vals) => JSON.parse(JSON.stringify(Array.from(vals)));

test('the repeated hour when clocks go back gets two rows, not one merged row', () => {
    // 25 Oct 2026: 01:00-02:00 happens first in BST (00:xxZ) and again in GMT (01:xxZ).
    const rows = minuteCard().calculate_minute_values([
        at('2026-10-25T00:00:00Z', 1),
        at('2026-10-25T00:30:00Z', 2),
        at('2026-10-25T01:00:00Z', 3),
        at('2026-10-25T01:30:00Z', 4),
        at('2026-10-25T02:00:00Z', 5)
    ], 'mean', false).reverse();

    assert.deepEqual(plain(rows.map((row) => row.nativeDate.toISOString())), [
        '2026-10-25T00:00:00.000Z', '2026-10-25T01:00:00.000Z', '2026-10-25T02:00:00.000Z'
    ]);
    assert.deepEqual(plain(rows.map((row) => row.nativeDate.getHours())), [1, 1, 2]);
    assert.equal(rows[0].vals[6], 2);
    assert.equal(rows[1].vals[6], 4);

    // Each copy of 01:xx reports its own window in the tooltip.
    const card = minuteCard();
    card.grid = rows;
    assert.equal(card.minute_cell_window('0', '6'), `${rows[0].date} 01:30 - 01:35`);
    assert.equal(card.minute_cell_window('1', '6'), `${rows[1].date} 01:30 - 01:35`);
});

test('the skipped hour when clocks go forward is not invented as a gap row', () => {
    // 29 Mar 2026: 00:59 GMT is followed by 02:00 BST; there is no 01:xx local hour.
    const rows = minuteCard().calculate_minute_values([
        at('2026-03-29T00:30:00Z', 1),
        at('2026-03-29T01:00:00Z', 2)
    ], 'mean', false).reverse();
    assert.deepEqual(plain(rows.map((row) => row.nativeDate.getHours())), [0, 2]);
});

function dayRowCard(state_class = 'measurement') {
    return Object.assign(Object.create(HeatmapCard.prototype), {
        config: { mode: 'minute', minute_rows: 'day', minute_interval: 5, display: {} },
        meta: { language: 'en', state_class },
        myhass: { locale: { time_format: '24' } }
    });
}

test('day rows add the repeated hour\'s deltas together so the day total survives', () => {
    // 25 Oct 2026: 01:00 BST is 00:00Z, 01:00 GMT is 01:00Z. Both land on slot 12.
    const rows = dayRowCard('total_increasing').calculate_minute_day_values([
        { start: Date.parse('2026-10-24T23:55:00Z'), sum: 10 },
        { start: Date.parse('2026-10-25T00:00:00Z'), sum: 11 },
        { start: Date.parse('2026-10-25T00:55:00Z'), sum: 12 },
        { start: Date.parse('2026-10-25T01:00:00Z'), sum: 14 },
        { start: Date.parse('2026-10-25T01:05:00Z'), sum: 15 }
    ], 'sum', true);

    assert.equal(rows.length, 1, 'one row for the whole 25-hour day');
    assert.equal(rows[0].vals[12], 3, '01:00 BST (+1) and 01:00 GMT (+2) share a slot');
    assert.equal(rows[0].vals[23], 1);
    // Truncated after the furthest slot reached (01:55), not the latest received (01:05).
    assert.equal(rows[0].vals.length, 24);
    const total = rows[0].vals.reduce((sum, value) => sum + value, 0);
    assert.equal(total, 5);
});

test('day rows leave the skipped hour empty when clocks go forward', () => {
    // 29 Mar 2026: 00:55 GMT is followed by 02:00 BST.
    const rows = dayRowCard().calculate_minute_day_values([
        { start: Date.parse('2026-03-29T00:55:00Z'), mean: 1 },
        { start: Date.parse('2026-03-29T01:00:00Z'), mean: 2 }
    ], 'mean', false);
    assert.equal(rows[0].vals[11], 1);
    assert.ok(rows[0].vals.slice(12, 24).every((value) => value === null));
    assert.equal(rows[0].vals[24], 2);

    // The tooltip reads the slot off the clock, so 02:00 is labelled 02:00.
    const card = dayRowCard();
    card.grid = rows;
    assert.equal(card.minute_cell_window('0', '24'), `${rows[0].date} 02:00 - 02:05`);
});
