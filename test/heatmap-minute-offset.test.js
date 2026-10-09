'use strict';

/*
    Minute mode in a zone whose offset is not a whole number of hours. Rows must start
    on the LOCAL hour, which here falls at :30 UTC. Own file for its own TZ.
*/
process.env.TZ = 'Asia/Kolkata';

const test = require('node:test');
const assert = require('node:assert/strict');
const { loadCard } = require('./helpers/load-card.js');

const { HeatmapCard } = loadCard();

test('rows start on the local hour in a +05:30 zone', () => {
    const card = Object.assign(Object.create(HeatmapCard.prototype), {
        config: { mode: 'minute', minute_interval: 5, display: {} },
        meta: { language: 'en', state_class: 'measurement' },
        myhass: { locale: { time_format: '24' } }
    });
    // 08:25Z is 13:55 IST and 08:30Z is 14:00 IST: different local hours.
    const rows = card.calculate_minute_values([
        { start: Date.parse('2026-10-08T08:25:00Z'), mean: 1 },
        { start: Date.parse('2026-10-08T08:30:00Z'), mean: 2 }
    ], 'mean', false);
    assert.equal(rows.length, 2);
    assert.equal(rows[0].nativeDate.toISOString(), '2026-10-08T08:30:00.000Z');
    assert.equal(rows[0].vals[0], 2);
    assert.equal(rows[1].vals[11], 1);
});
