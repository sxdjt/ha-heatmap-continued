'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { loadCard } = require('./helpers/load-card.js');

const { HeatmapCard, label_stride, bucket_values, format_month_day, shorten_month,
        month_shortening_is_safe } = loadCard();

// The card's data methods are plain instance methods that only read `this.config`,
// `this.meta` and `this.myhass`. We exercise them on a bare object whose prototype is
// HeatmapCard.prototype, which avoids constructing a real LitElement while still
// resolving sibling method calls (e.g. combine_grids -> combine_cell/day_key).
function makeCard(props = {}) {
    return Object.assign(Object.create(HeatmapCard.prototype), props);
}

test('day_key formats a date as zero-padded YYYY-MM-DD', () => {
    const card = makeCard();
    assert.equal(card.day_key(new Date(2024, 0, 5)), '2024-01-05');
    assert.equal(card.day_key(new Date(2024, 11, 31)), '2024-12-31');
});

test('combine_cell (measurement) yields null when either side is missing', () => {
    const card = makeCard();
    assert.equal(card.combine_cell(null, 5, 'difference', true), null);
    assert.equal(card.combine_cell(5, null, 'difference', true), null);
    assert.equal(card.combine_cell(undefined, 5, 'sum', true), null);
    assert.equal(card.combine_cell(5, undefined, 'sum', true), null);
});

test('combine_cell (measurement) subtracts and sums present values', () => {
    const card = makeCard();
    assert.equal(card.combine_cell(10, 4, 'difference', true), 6);
    assert.equal(card.combine_cell(10, 4, 'sum', true), 14);
});

test('combine_cell (non-measurement) treats missing values as zero', () => {
    const card = makeCard();
    assert.equal(card.combine_cell(null, 3, 'difference', false), -3);
    assert.equal(card.combine_cell(3, null, 'sum', false), 3);
    assert.equal(card.combine_cell(null, null, 'sum', false), 0);
});

test('combine_cell rounds to two decimals to avoid float noise', () => {
    const card = makeCard();
    assert.equal(card.combine_cell(0.1, 0.3, 'difference', false), -0.2);
    assert.equal(card.combine_cell(1.005, 0, 'sum', false), 1.0); // toFixed rounding
});

test('combine_grids aligns rows by calendar day, not array index', () => {
    const card = makeCard({ meta: { state_class: 'measurement' } });
    const day1 = new Date(2024, 0, 1);
    const day2 = new Date(2024, 0, 2);
    const primary = [
        { date: 'Jan 01', nativeDate: day1, vals: [10, 20] },
        { date: 'Jan 02', nativeDate: day2, vals: [5, 6] }
    ];
    // Secondary is deliberately in a different order to prove day-key alignment.
    const secondary = [
        { date: 'Jan 02', nativeDate: new Date(2024, 0, 2), vals: [1, 2] },
        { date: 'Jan 01', nativeDate: new Date(2024, 0, 1), vals: [4, 5] }
    ];
    const combined = card.combine_grids(primary, secondary, 'difference');
    assert.equal(combined.length, 2);
    assert.deepEqual([...combined[0].vals], [6, 15]);
    assert.deepEqual([...combined[1].vals], [4, 4]);
});

test('combine_grids drops days present only in the secondary grid', () => {
    const card = makeCard({ meta: { state_class: 'total_increasing' } });
    const primary = [
        { date: 'Jan 01', nativeDate: new Date(2024, 0, 1), vals: [10] }
    ];
    const secondary = [
        { date: 'Jan 01', nativeDate: new Date(2024, 0, 1), vals: [4] },
        { date: 'Jan 09', nativeDate: new Date(2024, 0, 9), vals: [99] }
    ];
    const combined = card.combine_grids(primary, secondary, 'difference');
    assert.equal(combined.length, 1);
    assert.deepEqual([...combined[0].vals], [6]);
});

test('combine_grids treats missing secondary hours per the state_class null policy', () => {
    // measurement: unmatched hour becomes null
    const measurement = makeCard({ meta: { state_class: 'measurement' } });
    const mResult = measurement.combine_grids(
        [{ date: 'Jan 01', nativeDate: new Date(2024, 0, 1), vals: [10, 20] }],
        [{ date: 'Jan 01', nativeDate: new Date(2024, 0, 1), vals: [1] }],
        'difference'
    );
    assert.deepEqual([...mResult[0].vals], [9, null]);

    // total_increasing: unmatched hour treated as 0
    const total = makeCard({ meta: { state_class: 'total_increasing' } });
    const tResult = total.combine_grids(
        [{ date: 'Jan 01', nativeDate: new Date(2024, 0, 1), vals: [10, 20] }],
        [{ date: 'Jan 01', nativeDate: new Date(2024, 0, 1), vals: [1] }],
        'difference'
    );
    assert.deepEqual([...tResult[0].vals], [9, 20]);
});

test('max_from and min_from ignore nulls', () => {
    const card = makeCard();
    const grid = [
        { vals: [1, null, 3] },
        { vals: [null, -2, 5] }
    ];
    assert.equal(card.max_from(grid), 5);
    assert.equal(card.min_from(grid), -2);
});

test('secondary_state_class_conflict returns null without a secondary entity', () => {
    const card = makeCard({ config: {}, meta: {}, myhass: { states: {} } });
    assert.equal(card.secondary_state_class_conflict(), null);
});

test('secondary_state_class_conflict tolerates unknown state classes', () => {
    const card = makeCard({
        config: { entity: 'sensor.a', secondary_entity: 'sensor.b' },
        meta: { state_class: undefined },
        myhass: { states: { 'sensor.b': { attributes: {} } } }
    });
    assert.equal(card.secondary_state_class_conflict(), null);
});

test('secondary_state_class_conflict flags mixing measurement with total', () => {
    const card = makeCard({
        config: { entity: 'sensor.a', secondary_entity: 'sensor.b' },
        meta: { state_class: 'measurement' },
        myhass: { states: { 'sensor.b': { attributes: { state_class: 'total_increasing' } } } }
    });
    const msg = card.secondary_state_class_conflict();
    assert.match(msg, /Cannot combine entities/);
    assert.match(msg, /sensor\.a/);
    assert.match(msg, /sensor\.b/);
});

test('secondary_state_class_conflict allows two compatible entities', () => {
    const card = makeCard({
        config: { entity: 'sensor.a', secondary_entity: 'sensor.b' },
        meta: { state_class: 'total' },
        myhass: { states: { 'sensor.b': { attributes: { state_class: 'total_increasing' } } } }
    });
    assert.equal(card.secondary_state_class_conflict(), null);
});

test('apply_symmetric_range widens auto range symmetrically around zero', () => {
    const card = makeCard({
        config: { secondary_entity: 'sensor.b', operation: 'difference', data: {} },
        meta: { data: { min: -3, max: 8 } }
    });
    card.apply_symmetric_range();
    assert.equal(card.meta.data.min, -8);
    assert.equal(card.meta.data.max, 8);
});

test('apply_symmetric_range is a no-op without a difference of two entities', () => {
    const card = makeCard({
        config: { operation: 'difference', data: {} },
        meta: { data: { min: -3, max: 8 } }
    });
    card.apply_symmetric_range();
    assert.equal(card.meta.data.min, -3);
    assert.equal(card.meta.data.max, 8);
});

test('apply_symmetric_range is a no-op when min or max is pinned', () => {
    const card = makeCard({
        config: { secondary_entity: 'sensor.b', operation: 'difference', data: { min: 0 } },
        meta: { data: { min: -3, max: 8 } }
    });
    card.apply_symmetric_range();
    assert.equal(card.meta.data.min, -3);
    assert.equal(card.meta.data.max, 8);
});

test('getCardSize scales with days in hourly mode and weeks in daily mode', () => {
    assert.equal(makeCard({ config: { mode: 'hourly', days: 21 } }).getCardSize(), 1 + Math.ceil(21 / 6));
    assert.equal(makeCard({ config: { mode: 'hourly', days: 0 } }).getCardSize(), 1);
    assert.equal(makeCard({ config: { mode: 'daily', weeks: 12 } }).getCardSize(), 1 + Math.ceil(12 / 3));
});

test('getStubConfig prefers a recorder-tracked sensor', () => {
    const hass = {
        states: {
            'light.kitchen': { attributes: {} },
            'sensor.plain': { attributes: {} },
            'sensor.tracked': { attributes: { state_class: 'measurement' } }
        }
    };
    assert.equal(HeatmapCard.getStubConfig(hass).entity, 'sensor.tracked');
});

test('getStubConfig falls back to any sensor, then to an empty entity', () => {
    const onlyPlain = { states: { 'sensor.plain': { attributes: {} } } };
    assert.equal(HeatmapCard.getStubConfig(onlyPlain).entity, 'sensor.plain');
    const noSensors = { states: { 'light.kitchen': { attributes: {} } } };
    assert.equal(HeatmapCard.getStubConfig(noSensors).entity, '');
    assert.equal(HeatmapCard.getStubConfig(undefined).entity, '');
});

test('build_weekly_grid buckets days into Mon-Sun weeks, newest week first', () => {
    const card = makeCard({ meta: { language: 'en-US' } });
    const grid = card.build_weekly_grid([
        { start: '2024-01-01T12:00:00Z', value: 1 }, // Mon, week 1
        { start: '2024-01-03T12:00:00Z', value: 3 }, // Wed, week 1
        { start: '2024-01-08T12:00:00Z', value: 8 }  // Mon, week 2
    ]);
    assert.equal(grid.length, 2);
    // Reverse chronological: most recent week first.
    assert.deepEqual([...grid[0].vals], [8, null, null, null, null, null, null]);
    assert.deepEqual([...grid[1].vals], [1, null, 3, null, null, null, null]);
});

test('calculate_daily_values pulls the configured aggregate per day', () => {
    const card = makeCard({ config: { aggregate: 'max' }, meta: { language: 'en-US' } });
    const grid = card.calculate_daily_values([
        { start: '2024-01-01T12:00:00Z', mean: 2, min: 1, max: 9 }
    ]);
    assert.equal(grid[0].vals[0], 9); // Monday slot holds the max
});

test('calculate_daily_last_values keeps the final recorded hour of each day', () => {
    const card = makeCard({ meta: { language: 'en-US' } });
    const grid = card.calculate_daily_last_values([
        { start: '2024-01-01T00:00:00Z', mean: 1 },
        { start: '2024-01-01T03:00:00Z', mean: 5 },
        { start: '2024-01-01T05:00:00Z', mean: 9 }
    ]);
    assert.equal(grid[0].vals[0], 9); // last hour wins
});

test('calculate_daily_last_values skips hours with a null mean', () => {
    const card = makeCard({ meta: { language: 'en-US' } });
    const grid = card.calculate_daily_last_values([
        { start: '2024-01-01T04:00:00Z', mean: 4 },
        { start: '2024-01-01T05:00:00Z', mean: null }
    ]);
    assert.equal(grid[0].vals[0], 4); // null final hour does not blank the day
});

test('calculate_measurement_values builds one row per date, newest first', () => {
    const card = makeCard({ meta: { language: 'en-US' } });
    const grid = card.calculate_measurement_values([
        { start: '2024-01-01T00:00:00Z', mean: 5 },
        { start: '2024-01-01T01:00:00Z', mean: 6 },
        { start: '2024-01-02T00:00:00Z', mean: 7 }
    ]);
    assert.equal(grid.length, 2);
    // Newest date first; its row is truncated to the last received hour.
    assert.deepEqual([...grid[0].vals], [7]);
    assert.equal(grid[1].vals[0], 5);
    assert.equal(grid[1].vals[1], 6);
});

test('calculate_increasing_values stores hourly deltas and fills gaps with zero', () => {
    const card = makeCard({ meta: { language: 'en-US' } });
    const grid = card.calculate_increasing_values([
        { start: '2024-01-01T00:00:00Z', sum: 0 },
        { start: '2024-01-01T01:00:00Z', sum: 2 },
        { start: '2024-01-01T02:00:00Z', sum: 5 }
    ]);
    // First hour has no prior sum (stays 0); subsequent hours are deltas.
    assert.deepEqual([...grid[0].vals], [0, 2, 3]);
});

test('setConfig applies documented defaults', () => {
    const card = makeCard();
    card.setConfig({ entity: 'sensor.temp' });
    assert.equal(card.config.mode, 'hourly');
    assert.equal(card.config.days, 21);
    assert.equal(card.config.weeks, 12);
    assert.equal(card.config.aggregate, 'mean');
    assert.equal(card.config.operation, 'difference');
    assert.deepEqual({ ...card.config.data }, {});
    assert.deepEqual({ ...card.config.display }, {});
});

test('setConfig rejects invalid configuration', () => {
    const card = makeCard();
    assert.throws(() => card.setConfig({}), /define an entity/);
    assert.throws(() => card.setConfig({ entity: 'sensor.a', days: -5 }), /`days`/);
    assert.throws(() => card.setConfig({ entity: 'sensor.a', weeks: -1 }), /`weeks`/);
    assert.throws(() => card.setConfig({ entity: 'sensor.a', mode: 'weekly' }), /`mode`/);
    assert.throws(() => card.setConfig({ entity: 'sensor.a', aggregate: 'median' }), /`aggregate`/);
    assert.throws(() => card.setConfig({ entity: 'sensor.a', operation: 'divide' }), /`operation`/);
    assert.throws(
        () => card.setConfig({ entity: 'sensor.a', data: { max: 'high' } }),
        /`data.max`/
    );
    assert.throws(
        () => card.setConfig({ entity: 'sensor.a', data: { min: 'low' } }),
        /`data.min`/
    );
});

test('setConfig rejects a secondary entity outside hourly mode', () => {
    const card = makeCard();
    assert.throws(
        () => card.setConfig({ entity: 'sensor.a', secondary_entity: 'sensor.b', mode: 'daily' }),
        /only supported in hourly mode/
    );
});

test('setConfig accepts auto and numeric data bounds', () => {
    const card = makeCard();
    card.setConfig({ entity: 'sensor.a', data: { min: 'auto', max: 14 } });
    assert.equal(card.config.data.min, 'auto');
    assert.equal(card.config.data.max, 14);
});

test('label_stride labels everything when there is room', () => {
    // 10 labels across 1000px is 100px each, comfortably over the 48px minimum.
    assert.equal(label_stride(10, 1000, 48), 1);
    // Exactly at the minimum still fits.
    assert.equal(label_stride(10, 480, 48), 1);
});

test('label_stride thins labels proportionally when space runs out', () => {
    // 100px for 10 labels is 10px each; a 48px minimum needs every 5th.
    assert.equal(label_stride(10, 100, 48), 5);
    // 365 days across 700px is ~1.9px each; a 48px minimum needs every 26th.
    assert.equal(label_stride(365, 700, 48), 26);
});

test('label_stride falls back to 1 before the grid has been measured', () => {
    // grid_width/grid_height are 0 until the ResizeObserver first fires. Dropping
    // labels on that first paint would make the card visibly flicker.
    assert.equal(label_stride(365, 0, 48), 1);
    assert.equal(label_stride(365, -1, 48), 1);
    assert.equal(label_stride(0, 500, 48), 1);
});

test('slot_count reads the widest grid entry rather than assuming 24', () => {
    const card = makeCard({ grid: [{ vals: new Array(24).fill(0) }, { vals: new Array(9).fill(0) }] });
    assert.equal(card.slot_count(), 24);
    assert.equal(makeCard({ grid: [] }).slot_count(), 0);
});

test('slot_label formats the time axis per locale time_format', () => {
    const card24 = makeCard({
        config: { mode: 'hourly' },
        myhass: { locale: { time_format: '24' } }
    });
    assert.equal(card24.slot_label(0), '00');
    assert.equal(card24.slot_label(9), '09');
    assert.equal(card24.slot_label(23), '23');

    const card12 = makeCard({
        config: { mode: 'hourly' },
        myhass: { locale: { time_format: '12' } }
    });
    assert.equal(card12.slot_label(0), '12 AM');
    assert.equal(card12.slot_label(9), '9 AM');
    assert.equal(card12.slot_label(12), '12 PM');
    assert.equal(card12.slot_label(23), '11 PM');
});

test('grid_style divides the configured height between rows', () => {
    const grid = new Array(10).fill({ vals: new Array(24).fill(0) });
    const vertical = makeCard({ config: { orientation: 'vertical', display: { height: 300 } }, grid });
    assert.equal(vertical.grid_style(), '--hm-cell-height: 30px;');

    // Horizontal divides by the slot count instead, since rows are time slots there.
    const horizontal = makeCard({ config: { orientation: 'horizontal', display: { height: 240 } }, grid });
    assert.equal(horizontal.grid_style(), '--hm-cell-height: 10px;');

    // Sub-pixel rows are floored to 1px rather than collapsing to nothing.
    const cramped = makeCard({ config: { orientation: 'vertical', display: { height: 5 } }, grid });
    assert.equal(cramped.grid_style(), '--hm-cell-height: 1px;');
});

test('grid_style is empty when no height is configured', () => {
    const grid = new Array(10).fill({ vals: [] });
    assert.equal(makeCard({ config: { display: {} }, grid }).grid_style(), '');
    assert.equal(makeCard({ config: {}, grid }).grid_style(), '');
});

test('grid_css_class reflects orientation and explicit height', () => {
    assert.equal(makeCard({ config: {} }).grid_css_class(), '');
    assert.equal(makeCard({ config: { orientation: 'vertical' } }).grid_css_class(), '');
    assert.equal(makeCard({ config: { orientation: 'horizontal' } }).grid_css_class(), 'horizontal');
    assert.equal(
        makeCard({ config: { orientation: 'horizontal', display: { height: 200 } } }).grid_css_class(),
        'horizontal fixed-height'
    );
});

test('getCardSize is near-constant in horizontal layout', () => {
    // The whole point of horizontal: a 365-day range is no taller than a 21-day one.
    const short = makeCard({ config: { orientation: 'horizontal', mode: 'hourly', days: 21 } });
    const long = makeCard({ config: { orientation: 'horizontal', mode: 'hourly', days: 365 } });
    assert.equal(short.getCardSize(), long.getCardSize());
    // ...and much shorter than the vertical equivalent for the same range.
    const vertical = makeCard({ config: { orientation: 'vertical', mode: 'hourly', days: 365 } });
    assert.ok(long.getCardSize() < vertical.getCardSize());
});

test('setConfig defaults orientation to vertical and validates it', () => {
    const card = makeCard();
    card.setConfig({ entity: 'sensor.temp' });
    assert.equal(card.config.orientation, 'vertical');

    card.setConfig({ entity: 'sensor.temp', orientation: 'horizontal' });
    assert.equal(card.config.orientation, 'horizontal');

    assert.throws(
        () => card.setConfig({ entity: 'sensor.temp', orientation: 'sideways' }),
        /`orientation`/
    );
});

test('setConfig validates display.height', () => {
    const card = makeCard();
    card.setConfig({ entity: 'sensor.temp', display: { height: 300 } });
    assert.equal(card.config.display.height, 300);

    for (const bad of [0, -10, 'tall', Infinity, NaN]) {
        assert.throws(
            () => card.setConfig({ entity: 'sensor.temp', display: { height: bad } }),
            /`display.height`/,
            `expected ${String(bad)} to be rejected`
        );
    }
});

test('page_size_days steps by days in hourly mode and whole weeks in daily', () => {
    assert.equal(makeCard({ config: { mode: 'hourly', days: 21 } }).page_size_days(), 21);
    // Daily rows are Monday-aligned weeks, so paging must move whole weeks.
    assert.equal(makeCard({ config: { mode: 'daily', weeks: 12 } }).page_size_days(), 84);
});

test('navigate pages backwards and clamps at the present', () => {
    const card = makeCard({ config: { mode: 'hourly', days: 21 }, view_offset: 0 });
    let fetches = 0;
    card.fetch_history = () => { fetches += 1; };
    card.close_tooltip = () => {};

    card.navigate('back');
    assert.equal(card.view_offset, -21);
    card.navigate('back');
    assert.equal(card.view_offset, -42);
    card.navigate('forward');
    assert.equal(card.view_offset, -21);

    // Forward from the last page must stop at 0, never run into the future.
    card.navigate('forward');
    assert.equal(card.view_offset, 0);
    card.navigate('forward');
    assert.equal(card.view_offset, 0);

    card.navigate('back');
    card.navigate('current');
    assert.equal(card.view_offset, 0);

    assert.equal(fetches, 7, 'every navigation should trigger a fetch');
});

test('navigate closes the tooltip so it cannot describe the old window', () => {
    const card = makeCard({ config: { mode: 'hourly', days: 7 }, view_offset: 0 });
    let closed = 0;
    card.fetch_history = () => {};
    card.close_tooltip = () => { closed += 1; };
    card.navigate('back');
    assert.equal(closed, 1);
});

test('view_end is now at offset 0 and end-of-day when browsing history', () => {
    const current = makeCard({ view_offset: 0 });
    const delta = Math.abs(current.view_end().getTime() - Date.now());
    assert.ok(delta < 1000, 'offset 0 should end at the present moment');

    const past = makeCard({ view_offset: -10 });
    const end = past.view_end();
    assert.equal(end.getHours(), 23);
    assert.equal(end.getMinutes(), 59);
    const expected = new Date();
    expected.setDate(expected.getDate() - 10);
    assert.equal(end.toDateString(), expected.toDateString());
});

test('visible_range_label describes the grid actually rendered', () => {
    // The grid is newest-first, so the label runs oldest to newest.
    const card = makeCard({ grid: [{ date: '10 Sep' }, { date: '05 Sep' }, { date: '21 Aug' }] });
    assert.equal(card.visible_range_label(), '21 Aug - 10 Sep');

    // A single row should not read "21 Aug - 21 Aug".
    assert.equal(makeCard({ grid: [{ date: '21 Aug' }] }).visible_range_label(), '21 Aug');
    assert.equal(makeCard({ grid: [] }).visible_range_label(), '');
    assert.equal(makeCard({}).visible_range_label(), '');
});

test('setConfig validates display.navigation and resets paging', () => {
    const card = makeCard();
    card.setConfig({ entity: 'sensor.temp' });
    assert.equal(card.view_offset, 0);

    // An offset measured in the old page size is meaningless after an edit.
    card.view_offset = -42;
    card.setConfig({ entity: 'sensor.temp', days: 7 });
    assert.equal(card.view_offset, 0);

    card.setConfig({ entity: 'sensor.temp', display: { navigation: false } });
    assert.equal(card.config.display.navigation, false);
    assert.throws(
        () => card.setConfig({ entity: 'sensor.temp', display: { navigation: 'yes' } }),
        /`display.navigation`/
    );
});

test('periodic refresh is suspended while browsing history', () => {
    const card = makeCard({ config: { mode: 'hourly', days: 7 }, view_offset: -7 });
    card.last_render_ts = 0;   // throttle window has long expired
    let fetches = 0;
    card.fetch_history = () => { fetches += 1; };
    card.hass = { states: {} };
    assert.equal(fetches, 0, 'a hass update must not yank the view while paging');

    // Back at the present, the same update does refresh.
    card.view_offset = 0;
    card.hass = { states: {} };
    assert.equal(fetches, 1);
});

test('ordered_columns runs oldest-first so the time axis reads left to right', () => {
    // this.grid is newest-first (vertical wants the newest day at the top).
    const card = makeCard({ grid: [{ date: '01 Sept' }, { date: '31 Aug' }, { date: '30 Aug' }] });
    const cols = card.ordered_columns();
    assert.deepEqual(cols.map((c) => c.entry.date), ['30 Aug', '31 Aug', '01 Sept']);
    // Original grid indices must be preserved, or data-row would point at the wrong day.
    assert.deepEqual(cols.map((c) => c.row), [2, 1, 0]);
});

test('date_column_headers spans the gap between labels and stays aligned', () => {
    // Rebuild the span sequence from the rendered headers so the test exercises the
    // real method rather than a copy of its arithmetic.
    const spansFor = (days, width) => {
        const card = makeCard({
            grid: new Array(days).fill(null).map((_, i) => ({ date: 'd' + i })),
            grid_width: width,
            grid_height: 300,
            config: { orientation: 'horizontal' }
        });
        const headers = card.date_column_headers();
        const spans = headers.map((h) => Number(h.values[0]));
        return { spans, stride: card.column_label_stride(), total: days, width };
    };

    for (const [days, width] of [[365, 1000], [365, 1900], [60, 1000], [90, 1000], [24, 1000], [5, 400]]) {
        const { spans, stride, total } = spansFor(days, width);
        assert.equal(spans.reduce((a, b) => a + b, 0), total,
            `${days}d@${width}: colspans must sum to the column count or the header desyncs`);
        /*
            No group may be narrower than the stride. A short trailing stub is what pushed
            the final label past the right edge of the card: 365 columns at stride 11
            leaves 2 columns, a few pixels wide, with a full date to draw in them.
        */
        const narrowest = Math.min(...spans);
        assert.ok(narrowest >= Math.min(stride, total),
            `${days}d@${width}: narrowest group ${narrowest} is under stride ${stride}`);
    }
});

test('horizontal cells still map to the correct grid entry after reordering', () => {
    const grid = [
        { date: 'newest', vals: [10, 11] },
        { date: 'middle', vals: [20, 21] },
        { date: 'oldest', vals: [30, 31] }
    ];
    const card = makeCard({
        grid,
        grid_width: 1000,
        grid_height: 1000,
        config: { orientation: 'horizontal', mode: 'hourly', display: {} },
        myhass: { locale: { time_format: '24' } }
    });
    const seen = [];
    card.render_cell = (val, row, col) => { seen.push({ val, row, col }); };
    card.render_rows_horizontal();

    // Every cell's value must match grid[row].vals[col] despite the reversed order.
    for (const { val, row, col } of seen) {
        assert.equal(grid[row].vals[col], val,
            `cell ${val} claimed row ${row} col ${col}`);
    }
    // First row rendered is slot 0, oldest date first.
    assert.deepEqual(seen.slice(0, 3).map((c) => c.val), [30, 20, 10]);
});

test('render_cell leaves slots with no reading blank', () => {
    // A null must never reach the gradient: doing so paints "missing" with the bottom
    // of the scale, which made not-yet-elapsed hours look like zeros in horizontal
    // layout (vertical layout hides them by simply emitting fewer cells).
    const card = makeCard({
        meta: {
            scale: {
                type: 'relative',
                gradient: () => { throw new Error('gradient called for an empty cell'); }
            },
            data: { min: 0, max: 10 }
        }
    });
    for (const missing of [null, undefined]) {
        const cell = card.render_cell(missing, 3, 7);
        const markup = cell.strings.join('');
        assert.ok(markup.includes('class="hm-box null"'), 'empty cell must carry the null class');
        assert.ok(!markup.includes('style="color:'), 'empty cell must not be coloured');
        // data-row/data-col still have to identify the grid entry for the tooltip.
        // Array.from normalises the realm - the card is evaluated in a vm context.
        assert.deepEqual(Array.from(cell.values.slice(1)), [3, 7]);
    }
});

test('render_cell still colours slots that do have a reading', () => {
    const card = makeCard({
        meta: {
            scale: { type: 'relative', gradient: (r) => `rgb(${r})` },
            data: { min: 0, max: 10 }
        }
    });
    const cell = card.render_cell(5, 1, 2);
    assert.ok(cell.values.includes('rgb(0.5)'));
});

test('cell_label_text formats to display.decimals, or sensibly without it', () => {
    const fixed = makeCard({ config: { display: { decimals: 2 } } });
    assert.equal(fixed.cell_label_text(12.5), '12.50');
    assert.equal(fixed.cell_label_text(7), '7.00');

    // No decimals configured: whole numbers stay bare, fractions get one place.
    const auto = makeCard({ config: { display: {} } });
    assert.equal(auto.cell_label_text(21), '21');
    assert.equal(auto.cell_label_text(21.44), '21.4');
});

test('hide_zero suppresses readings that DISPLAY as zero, not just exact zeros', () => {
    // Regression: hide_zero used to test the raw reading, so a value rounding to "0.00" still drew a visible zero on a card that had asked for none.
    const card = makeCard({ config: { display: { decimals: 2, hide_zero: true } } });
    assert.equal(card.cell_label_text(0), null);
    assert.equal(card.cell_label_text(0.004), null);
    assert.equal(card.cell_label_text(0.02), '0.02');
});

test('hide_zero off keeps zero labels', () => {
    const card = makeCard({ config: { display: { decimals: 2 } } });
    assert.equal(card.cell_label_text(0), '0.00');
    assert.equal(card.cell_label_text(0.004), '0.00');
});

test('widest_label_length ignores empty cells and suppressed labels', () => {
    const grid = [
        { vals: [1, null, 123.5] },
        { vals: [undefined, 0] }
    ];
    assert.equal(makeCard({ config: { display: {} }, grid }).widest_label_length(), '123.5'.length);

    // With hide_zero a grid of nothing but zeros has no label to size against.
    const hidden = makeCard({ config: { display: { hide_zero: true } }, grid: [{ vals: [0, 0] }] });
    assert.equal(hidden.widest_label_length(), 0);
});

test('labels_are_legible budgets width by the labels actually drawn', () => {
    // 24 hourly columns in a 420px grid is 15.4px a cell once the row-title gutter is off.
    const card = makeCard({
        config: { mode: 'hourly' },
        grid: Array.from({ length: 21 }, () => ({ vals: new Array(24).fill(1) })),
        grid_width: 420,
        grid_height: 21 * 20
    });
    // Two characters ("72") fit that cell; five ("-12.5") do not. A single fixed worst-case threshold rejected both, which is what hid labels at interval 1.
    assert.equal(card.labels_are_legible(2), true);
    assert.equal(card.labels_are_legible(5), false);
});

test('labels_are_legible fires on height as well as width', () => {
    const card = makeCard({
        config: { mode: 'hourly' },
        grid: Array.from({ length: 21 }, () => ({ vals: new Array(6).fill(1) })),
        grid_width: 420,
        // display.height: 200 across 21 rows leaves 9.5px a row - too short for a label.
        grid_height: 200
    });
    assert.equal(card.labels_are_legible(2), false);
});

test('labels_are_legible shows labels when there is nothing to measure', () => {
    const grid = [{ vals: [1, 2] }];
    // grid_width/grid_height stay 0 until the ResizeObserver first fires; dropping labels on that first paint would make the card flicker.
    assert.equal(makeCard({ config: {}, grid, grid_width: 0, grid_height: 0 }).labels_are_legible(4), true);
    // No labels to draw is not a reason to call the layout illegible.
    assert.equal(makeCard({ config: {}, grid, grid_width: 420, grid_height: 100 }).labels_are_legible(0), true);
});

test('bucket_values averages measurements and sums deltas', () => {
    // Array.from normalises the realm: the card is evaluated in a vm context, so arrays
    // it builds do not share this file's Array.prototype and deepStrictEqual rejects them.
    const vals = [1, 2, 3, 4, 5, 6];
    // Measurement: hourly means must be averaged, never added.
    assert.deepEqual(Array.from(bucket_values(vals, 2, false)), [1.5, 3.5, 5.5]);
    // total/total_increasing: hourly deltas must be added, never averaged.
    assert.deepEqual(Array.from(bucket_values(vals, 2, true)), [3, 7, 11]);
    assert.deepEqual(Array.from(bucket_values(vals, 3, true)), [6, 15]);
});

test('bucket_values ignores gaps but keeps fully empty buckets null', () => {
    // A missing hour must not be counted as zero - that would drag a mean down.
    assert.deepEqual(Array.from(bucket_values([10, null, 20, 30], 2, false)), [10, 25]);
    assert.deepEqual(Array.from(bucket_values([10, null, 20, 30], 2, true)), [10, 50]);
    // Only when nothing in the window was recorded is the bucket itself empty.
    assert.deepEqual(Array.from(bucket_values([null, null, 5, 7], 2, false)), [null, 6]);
    assert.deepEqual(Array.from(bucket_values([null, null], 2, true)), [null]);
});

test('bucket_values is a no-op at interval 1', () => {
    const vals = [1, null, 3];
    assert.deepEqual(Array.from(bucket_values(vals, 1, false)), [1, null, 3]);
});

test('bucket_grid buckets hourly data and leaves daily mode alone', () => {
    const grid = () => [{ date: 'd1', vals: [1, 2, 3, 4] }];

    const measurement = makeCard({
        config: { mode: 'hourly', time_interval: 2 },
        meta: { state_class: 'measurement' }
    });
    assert.deepEqual(Array.from(measurement.bucket_grid(grid())[0].vals), [1.5, 3.5]);

    const energy = makeCard({
        config: { mode: 'hourly', time_interval: 2 },
        meta: { state_class: 'total_increasing' }
    });
    assert.deepEqual(Array.from(energy.bucket_grid(grid())[0].vals), [3, 7]);

    // Daily rows are weekdays; there are no hours to group.
    const daily = makeCard({
        config: { mode: 'daily', time_interval: 2 },
        meta: { state_class: 'measurement' }
    });
    assert.deepEqual(Array.from(daily.bucket_grid(grid())[0].vals), [1, 2, 3, 4]);

    // Interval 1 must return the rows untouched.
    const plain = makeCard({ config: { mode: 'hourly' }, meta: { state_class: 'measurement' } });
    assert.deepEqual(Array.from(plain.bucket_grid(grid())[0].vals), [1, 2, 3, 4]);
});

test('bucket_grid preserves row metadata the tooltip depends on', () => {
    const when = new Date(2026, 8, 1);
    const card = makeCard({
        config: { mode: 'hourly', time_interval: 2 },
        meta: { state_class: 'measurement' }
    });
    const out = card.bucket_grid([{ date: '01 Sept', nativeDate: when, vals: [1, 2] }]);
    assert.equal(out[0].date, '01 Sept');
    assert.equal(out[0].nativeDate, when);
});

test('slot_label describes the whole bucket in 24h and its start in 12h', () => {
    const card = (interval, fmt) => makeCard({
        config: { mode: 'hourly', time_interval: interval },
        myhass: { locale: { time_format: fmt } }
    });
    // Hourly is unchanged.
    assert.equal(card(1, '24').slot_label(9), '09');
    // Bucketed 24h shows the window.
    assert.equal(card(2, '24').slot_label(0), '00-02');
    assert.equal(card(2, '24').slot_label(5), '10-12');
    // The final bucket wraps to 00 rather than showing 24.
    assert.equal(card(2, '24').slot_label(11), '22-00');
    // 12h would not fit a range in the 50px gutter, so it shows the start only.
    assert.equal(card(2, '12').slot_label(0), '12 AM');
    assert.equal(card(2, '12').slot_label(7), '2 PM');
});

test('time_label_stride honours display.time_labels over the automatic value', () => {
    const explicit = makeCard({
        config: { orientation: 'horizontal', display: { time_labels: 3 } },
        grid_height: 1000
    });
    assert.equal(explicit.time_label_stride(24), 3);

    // Vertical keeps four-hourly labelling, scaled by the bucket size.
    assert.equal(makeCard({ config: { display: {} } }).time_label_stride(24), 4);
    assert.equal(makeCard({ config: { time_interval: 2, display: {} } }).time_label_stride(12), 2);
    assert.equal(makeCard({ config: { time_interval: 4, display: {} } }).time_label_stride(6), 1);
});

test('setConfig validates time_interval and display.time_labels', () => {
    const card = makeCard();
    card.setConfig({ entity: 'sensor.t' });
    assert.equal(card.config.time_interval, 1);

    card.setConfig({ entity: 'sensor.t', time_interval: 6 });
    assert.equal(card.config.time_interval, 6);

    // Only whole divisors of 24; an uneven final bucket would misrepresent the axis.
    for (const bad of [5, 7, 9, 0, -2, 1.5, 'two']) {
        assert.throws(
            () => card.setConfig({ entity: 'sensor.t', time_interval: bad }),
            /`time_interval`/,
            `expected ${String(bad)} to be rejected`
        );
    }
    assert.throws(
        () => card.setConfig({ entity: 'sensor.t', mode: 'daily', time_interval: 2 }),
        /only supported in hourly mode/
    );
    // Interval 1 is meaningless but harmless in daily mode, so it is allowed.
    card.setConfig({ entity: 'sensor.t', mode: 'daily', time_interval: 1 });

    card.setConfig({ entity: 'sensor.t', display: { time_labels: 3 } });
    assert.equal(card.config.display.time_labels, 3);
    for (const bad of [0, -1, 2.5, 25, 'four']) {
        assert.throws(
            () => card.setConfig({ entity: 'sensor.t', display: { time_labels: bad } }),
            /`display.time_labels`/,
            `expected ${String(bad)} to be rejected`
        );
    }
});

test('setConfig accepts the string time_interval the editor emits', () => {
    // ha-selector's select control round-trips option values as strings.
    const card = makeCard();
    card.setConfig({ entity: 'sensor.t', time_interval: '2' });
    assert.equal(card.config.time_interval, 2);
    assert.equal(typeof card.config.time_interval, 'number');

    // YAML still sends a number.
    card.setConfig({ entity: 'sensor.t', time_interval: 6 });
    assert.equal(card.config.time_interval, 6);

    // Normalising must not let an invalid value through.
    assert.throws(
        () => card.setConfig({ entity: 'sensor.t', time_interval: '5' }),
        /`time_interval`/
    );
    assert.throws(
        () => card.setConfig({ entity: 'sensor.t', time_interval: 'lots' }),
        /`time_interval`/
    );
});

test('getGridOptions reports sizing so sections view can resize the card', () => {
    const opts = (cfg) => {
        const card = makeCard();
        card.setConfig({ entity: 'sensor.t', ...cfg });
        return card.getGridOptions();
    };

    const vertical = opts({ days: 21 });
    assert.equal(vertical.columns, 12);
    assert.ok(vertical.rows >= 1);
    assert.equal(vertical.min_rows, 2);
    // No maximum: resizing beyond the default is the user's call.
    assert.equal(vertical.max_rows, undefined);

    // Vertical grows with the range; horizontal does not.
    assert.ok(opts({ days: 365 }).rows > opts({ days: 21 }).rows);
    assert.equal(opts({ orientation: 'horizontal', days: 365 }).rows,
                 opts({ orientation: 'horizontal', days: 21 }).rows);
    assert.ok(opts({ orientation: 'horizontal', days: 365 }).rows < opts({ days: 365 }).rows);

    // An explicit height overrides the estimate.
    assert.ok(opts({ days: 365, display: { height: 300 } }).rows < opts({ days: 365 }).rows);

    // Bigger buckets mean fewer rows in horizontal layout.
    assert.ok(opts({ orientation: 'horizontal', time_interval: 4 }).rows
            < opts({ orientation: 'horizontal', time_interval: 1 }).rows);

    // Horizontal needs more width to be legible.
    assert.ok(opts({ orientation: 'horizontal' }).min_columns > opts({}).min_columns);
});

test('estimated_height_px accounts for the optional furniture', () => {
    const height = (cfg) => {
        const card = makeCard();
        card.setConfig({ entity: 'sensor.t', ...cfg });
        return card.estimated_height_px();
    };
    const full = height({});
    assert.ok(height({ display: { legend: false } }) < full, 'hiding the legend should shorten the card');
    assert.ok(height({ display: { navigation: false } }) < full, 'hiding nav should shorten the card');
    assert.ok(height({ display: { legend: false, navigation: false } }) < height({ display: { legend: false } }));
});

test('time_axis_label marks skipped rows so thinning cannot be misread', () => {
    const card = makeCard({
        config: { mode: 'hourly', time_interval: 1, orientation: 'horizontal' },
        myhass: { locale: { time_format: '24' } }
    });
    // With stride 2 a bare "00, 02, 04" would read as two-hour cells. The dot shows
    // there is an unlabelled row in between.
    assert.equal(card.time_axis_label(0, 2), '00');
    assert.equal(card.time_axis_label(1, 2), '·');
    assert.equal(card.time_axis_label(2, 2), '02');
    // Nothing is skipped at stride 1, so no dots appear.
    assert.equal(card.time_axis_label(1, 1), '01');
    assert.equal(card.time_axis_label(23, 1), '23');
});

test('bucketed axis labels state their range instead of relying on dots', () => {
    const card = makeCard({
        config: { mode: 'hourly', time_interval: 2, orientation: 'horizontal' },
        myhass: { locale: { time_format: '24' } }
    });
    // A two-hour cell says so, so there is nothing to misread.
    assert.equal(card.time_axis_label(0, 1), '00-02');
    assert.equal(card.time_axis_label(1, 1), '02-04');
});

test('shorten_month trims to three letters only where that is safe', () => {
    assert.equal(shorten_month('Sept'), 'Sep');
    assert.equal(shorten_month('sept.'), 'sep');
    assert.equal(shorten_month('Jan'), 'Jan');
    // A trailing period is dropped even when nothing else changes.
    assert.equal(shorten_month('mai'), 'mai');
    assert.equal(shorten_month('okt.'), 'okt');
    // Cyrillic is trimmed; other scripts are left as the locale wrote them.
    assert.equal(shorten_month('сент.'), 'сен');
    assert.equal(shorten_month('سبتمبر'), 'سبتمبر');
});

test('en-GB months are all three letters', () => {
    // The reported nit: "20 Dec" beside "01 Sept" on the same axis.
    const months = [];
    for (let m = 0; m < 12; m++) {
        months.push(format_month_day(new Date(2024, m, 20), 'en-GB').replace('20 ', ''));
    }
    assert.deepEqual([...new Set(months.map((m) => m.length))], [3], months.join(' '));
    assert.ok(months.includes('Sep'));
    assert.ok(!months.includes('Sept'));
});

test('locales where trimming would collide keep their own abbreviations', () => {
    // French "juin" and "juil." both trim to "jui" - a tidier axis is not worth an
    // ambiguous one, so the whole locale opts out.
    assert.equal(month_shortening_is_safe('fr-FR'), false);
    const june = format_month_day(new Date(2024, 5, 20), 'fr-FR');
    const july = format_month_day(new Date(2024, 6, 20), 'fr-FR');
    assert.notEqual(june, july);

    assert.equal(month_shortening_is_safe('en-GB'), true);
    assert.equal(month_shortening_is_safe('ru-RU'), true);
});

test('every locale still yields twelve distinct month labels', () => {
    for (const locale of ['en-GB', 'en-US', 'de-DE', 'fr-FR', 'es-ES', 'ru-RU', 'ja-JP', 'ar-EG']) {
        const labels = new Set();
        for (let m = 0; m < 12; m++) {
            labels.add(format_month_day(new Date(2024, m, 20), locale));
        }
        assert.equal(labels.size, 12, `${locale} produced ambiguous month labels`);
    }
});
