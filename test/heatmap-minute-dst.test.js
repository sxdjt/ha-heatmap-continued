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
