'use strict';

/*
    `smoothing: true` (#17, ported from the upstream high-res branch): spread each step of
    a coarse running total over the flat stretch before it.
*/

const test = require('node:test');
const assert = require('node:assert/strict');
const { loadCard } = require('./helpers/load-card.js');

const { HeatmapCard, smooth_plateaus } = loadCard();

const plain = (vals) => JSON.parse(JSON.stringify(Array.from(vals)));
const sums = (entries) => plain(entries.map((entry) => entry.sum));
const close = (actual, expected) => {
    assert.equal(actual.length, expected.length);
    actual.forEach((value, i) => assert.ok(
        Math.abs(value - expected[i]) < 1e-9, `index ${i}: ${value} != ${expected[i]}`
    ));
};

test('smooth_plateaus ramps each plateau up to the step that ends it', () => {
    const out = smooth_plateaus([
        { sum: 10 }, { sum: 10 }, { sum: 10 }, { sum: 10 }, { sum: 10.01 }, { sum: 10.01 }
    ]);
    // Four entries share the 0.01 step; the trailing plateau has no step yet and stays flat.
    close(sums(out), [10, 10.0025, 10.005, 10.0075, 10.01, 10.01]);
});

test('smooth_plateaus preserves the total and leaves single steps alone', () => {
    const input = [{ sum: 1 }, { sum: 2 }, { sum: 2 }, { sum: 5 }, { sum: 6 }];
    const out = smooth_plateaus(input);
    close(sums(out), [1, 2, 3.5, 5, 6]);
    assert.equal(out[out.length - 1].sum - out[0].sum, 5);
});

test('smooth_plateaus spreads a falling step too', () => {
    close(sums(smooth_plateaus([{ sum: 4 }, { sum: 4 }, { sum: 2 }])), [4, 3, 2]);
});

test('smooth_plateaus does not ramp across a null', () => {
    const out = smooth_plateaus([{ sum: 1 }, { sum: 1 }, { sum: null }, { sum: 3 }, { sum: 3 }, { sum: 4 }]);
    assert.deepEqual(sums(out), [1, 1, null, 3, 3.5, 4]);
});

test('smooth_plateaus copies entries instead of mutating them', () => {
    const input = [{ sum: 1, start: 'a' }, { sum: 1, start: 'b' }, { sum: 2, start: 'c' }];
    const out = smooth_plateaus(input);
    assert.equal(input[1].sum, 1);
    assert.equal(out[1].sum, 1.5);
    assert.equal(out[1].start, 'b');
    assert.equal(smooth_plateaus([]).length, 0);
    assert.deepEqual(sums(smooth_plateaus([{ sum: 7 }])), [7]);
});

function fetchCard(config, state_class, statistics) {
    let pending;
    const card = Object.assign(Object.create(HeatmapCard.prototype), {
        config: { entity: 'sensor.e', days: 1, data: {}, display: {}, ...config },
        meta: { language: 'en', state_class, data: {} },
        view_offset: 0,
        myhass: {
            config: { unit_system: { temperature: '°C' } },
            localize: () => 'No data',
            callWS() { pending = Promise.resolve({ 'sensor.e': statistics }); return pending; }
        }
    });
    return {
        card,
        async run() {
            card.get_recorder(['sensor.e'], 1);
            await pending;
            await new Promise((resolve) => setImmediate(resolve));
        }
    };
}

// 5-minute statistics at 09:00, 09:05 ... on 8 Oct 2026.
const five = (sumsList) => sumsList.map((sum, i) => ({
    start: new Date(2026, 9, 8, 9, i * 5).getTime(), sum, state: sum
}));

test('get_recorder smooths totals in minute mode when asked', async () => {
    const statistics = five([10, 10, 10, 10, 10.01, 10.01]);

    const off = fetchCard({ mode: 'minute', minute_interval: 5 }, 'total_increasing', statistics);
    await off.run();
    assert.deepEqual(plain(off.card.grid[0].vals), [0, 0, 0, 0, 0.01, 0]);

    const on = fetchCard({ mode: 'minute', minute_interval: 5, smoothing: true }, 'total_increasing', statistics);
    await on.run();
    // Smoothing keeps 6 decimals, so the shares survive and add back up to the step.
    assert.deepEqual(plain(on.card.grid[0].vals), [0, 0.0025, 0.0025, 0.0025, 0.0025, 0]);
    assert.equal(on.card.meta.data.max, 0.0025);
});

test('get_recorder smooths totals in hourly mode without rounding the shares away', async () => {
    const hourly = [10, 10, 10, 10, 10.01].map((sum, i) => ({
        start: new Date(2026, 9, 8, 9 + i).getTime(), sum
    }));
    const on = fetchCard({ mode: 'hourly', smoothing: true }, 'total', hourly);
    await on.run();
    assert.deepEqual(plain(on.card.grid[0].vals.slice(9)), [0, 0.0025, 0.0025, 0.0025, 0.0025]);

    // Without smoothing hourly mode keeps its 2 decimals and the single step.
    const off = fetchCard({ mode: 'hourly' }, 'total', hourly);
    await off.run();
    assert.deepEqual(plain(off.card.grid[0].vals.slice(9)), [0, 0, 0, 0, 0.01]);
});

test('delta_decimals follows mode and smoothing', () => {
    const card = (config) => Object.assign(Object.create(HeatmapCard.prototype), { config });
    assert.equal(card({ mode: 'hourly' }).delta_decimals(), 2);
    assert.equal(card({ mode: 'minute' }).delta_decimals(), 3);
    assert.equal(card({ mode: 'hourly', smoothing: true }).delta_decimals(), 6);
    assert.equal(card({ mode: 'minute', smoothing: true }).delta_decimals(), 6);
});

test('get_recorder ignores smoothing for measurement and treat_as: measurement', async () => {
    const statistics = five([10, 10, 10.01]).map((entry) => ({ ...entry, mean: entry.sum }));

    const measurement = fetchCard({ mode: 'minute', smoothing: true }, 'measurement', statistics);
    await measurement.run();
    assert.deepEqual(plain(measurement.card.grid[0].vals), [10, 10, 10.01]);

    const fluctuating = fetchCard({ mode: 'minute', smoothing: true, treat_as: 'measurement' }, 'total', statistics);
    await fluctuating.run();
    assert.deepEqual(plain(fluctuating.card.grid[0].vals), [10, 10, 10.01]);
});

test('setConfig validates smoothing', () => {
    const card = Object.assign(Object.create(HeatmapCard.prototype), { scales: { get_scale() {} } });
    card.setConfig({ entity: 'sensor.e' });
    assert.equal(card.config.smoothing, false);
    card.setConfig({ entity: 'sensor.e', smoothing: true });
    assert.equal(card.config.smoothing, true);
    card.setConfig({ entity: 'sensor.e', mode: 'minute', smoothing: true });
    assert.equal(card.config.smoothing, true);
    assert.throws(() => card.setConfig({ entity: 'sensor.e', smoothing: 'yes' }), /`smoothing` must be a boolean/);
    assert.throws(() => card.setConfig({ entity: 'sensor.e', mode: 'daily', smoothing: true }),
        /only supported in hourly and minute mode/);
});
