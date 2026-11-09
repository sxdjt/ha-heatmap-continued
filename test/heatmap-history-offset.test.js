'use strict';

/*
    Raw-history periods in a half-hour offset zone. HA's hourly statistics start on
    whole UTC hours, which fall at :30 local here, and the history fallback must match
    them so the grid builders see the same input either way. Daily periods still start
    at local midnight. Own file for its own TZ.
*/
process.env.TZ = 'Asia/Kolkata';

const test = require('node:test');
const assert = require('node:assert/strict');
const { loadCard } = require('./helpers/load-card.js');

const { history_periods } = loadCard();

const HOUR = 3600000;

test('hourly periods start on whole UTC hours, at :30 local', () => {
    const start = Date.parse('2026-11-01T00:10:00Z');
    const periods = history_periods(start, start + 3 * HOUR, 'hour');
    assert.equal(periods[0][0], Date.parse('2026-11-01T00:00:00Z'));
    assert.ok(periods.every(([from]) => new Date(from).getMinutes() === 30));
    assert.ok(periods.every(([from]) => new Date(from).getUTCMinutes() === 0));
});

test('daily periods start at local midnight, not UTC midnight', () => {
    const start = new Date(2026, 10, 1, 12).getTime();
    const periods = history_periods(start, start + 36 * HOUR, 'day');
    assert.equal(periods.length, 2);
    for (const [from] of periods) {
        const local = new Date(from);
        assert.equal(local.getHours(), 0);
        assert.equal(local.getMinutes(), 0);
        assert.equal(local.getUTCHours(), 18, 'local midnight is 18:30 UTC the day before');
        assert.equal(local.getUTCMinutes(), 30);
    }
});
