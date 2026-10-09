'use strict';

/*
    Minute mode with day rows (`minute_rows: day`, #17): one row per calendar day, the
    day's 5-minute slices across it, as in the upstream high-res branch. DST cases live in
    heatmap-minute-dst.test.js, which pins a time zone.
*/

const test = require('node:test');
const assert = require('node:assert/strict');
const { loadCard } = require('./helpers/load-card.js');

const { HeatmapCard, format_month_day } = loadCard();

function makeCard(props = {}) {
    return Object.assign(Object.create(HeatmapCard.prototype), props);
}

function dayRowCard(config = {}, props = {}) {
    return makeCard({
        config: { mode: 'minute', minute_rows: 'day', minute_interval: 5, display: {}, ...config },
        meta: { language: 'en', state_class: 'measurement' },
        myhass: { locale: { time_format: '24' } },
        ...props
    });
}

// One 5-minute statistic starting at the given local time in October 2026.
function stat(day, hour, minute, fields) {
    return { start: new Date(2026, 9, day, hour, minute).getTime(), ...fields };
}

const plain = (vals) => JSON.parse(JSON.stringify(Array.from(vals)));
// A header's label: its interpolated text, or the literal dot of an unlabelled header.
const header_text = (th) => th.values[1] ?? '·';

test('calculate_minute_day_values builds one 288-slot row per day, newest first', () => {
    const rows = dayRowCard().calculate_minute_day_values([
        stat(7, 0, 0, { mean: 1 }),
        stat(7, 23, 55, { mean: 2 }),
        stat(8, 0, 0, { mean: 3 }),
        stat(8, 1, 10, { mean: 4 })
    ], 'mean', false);

    assert.equal(rows.length, 2);
    assert.equal(rows[0].nativeDate.getTime(), new Date(2026, 9, 8).getTime());
    assert.equal(rows[1].nativeDate.getTime(), new Date(2026, 9, 7).getTime());
    assert.equal(rows[0].date, format_month_day(new Date(2026, 9, 8), 'en'));
    // A full day has 288 slots; missing ones are null.
    assert.equal(rows[1].vals.length, 288);
    assert.equal(rows[1].vals[0], 1);
    assert.equal(rows[1].vals[1], null);
    assert.equal(rows[1].vals[287], 2);
    // Today stops after its last slot: 01:10 is slot 14.
    assert.equal(rows[0].vals.length, 15);
    assert.equal(rows[0].vals[0], 3);
    assert.equal(rows[0].vals[14], 4);
});

test('calculate_minute_day_values diffs the running sum, across midnight too', () => {
    const card = dayRowCard({}, { meta: { language: 'en', state_class: 'total_increasing' } });
    const rows = card.calculate_minute_day_values([
        stat(7, 23, 55, { sum: 10 }),
        stat(8, 0, 0, { sum: 10.042 }),
        stat(8, 0, 10, { sum: 10.1 })
    ], 'sum', true);

    assert.equal(rows[1].vals[287], 0, 'the very first slot has nothing to diff against');
    // Missing slots inside a day are 0; 3 decimals as in hour rows.
    assert.deepEqual(plain(rows[0].vals), [0.042, 0, 0.058]);
});

test('calculate_minute_day_values skips a day with no statistics', () => {
    const rows = dayRowCard().calculate_minute_day_values([
        stat(6, 12, 0, { mean: 1 }),
        stat(8, 12, 0, { mean: 2 })
    ], 'mean', false);
    assert.deepEqual(plain(rows.map((row) => row.nativeDate.getDate())), [8, 6]);
});

test('calculate_minute_day_values returns no rows for no statistics', () => {
    assert.equal(dayRowCard().calculate_minute_day_values([], 'mean', false).length, 0);
});

test('bucket_grid groups day-row slots by minute_interval across hour boundaries', () => {
    const vals = Array.from({ length: 288 }, (_, i) => i);
    const card = dayRowCard({ minute_interval: 30 });
    const bucketed = card.bucket_grid([{ date: 'd', vals }])[0].vals;
    assert.equal(bucketed.length, 48);
    assert.equal(bucketed[0], 2.5);
});

test('day rows label the time axis with clock times', () => {
    assert.equal(dayRowCard().slot_label(0), '00:00');
    assert.equal(dayRowCard().slot_label(171), '14:15');
    assert.equal(dayRowCard({ minute_interval: 30 }).slot_label(3), '01:30');
    const twelve = dayRowCard({}, { myhass: { locale: { time_format: '12' } } });
    assert.equal(twelve.slot_label(168), '2 PM');
    assert.equal(twelve.slot_label(174), '2:30 PM');
    assert.equal(twelve.slot_label(6), '12:30 AM');
});

test('vertical day rows get hour headers spanning each hour, every 4 hours', () => {
    const headers = dayRowCard().date_table_headers();
    assert.equal(headers.length, 24);
    assert.ok(headers.every((th) => th.values[0] === 12), 'each hour spans 12 cells');
    assert.deepEqual(plain(headers.map(header_text)), [
        '00', '·', '·', '·', '04', '·', '·', '·', '08', '·', '·', '·',
        '12', '·', '·', '·', '16', '·', '·', '·', '20', '·', '·', '23'
    ]);
    // Coarser cells span fewer columns; display.time_labels counts hours.
    const coarse = dayRowCard({ minute_interval: 15, display: { time_labels: 6 } }).date_table_headers();
    assert.equal(coarse[0].values[0], 4);
    assert.deepEqual(plain(coarse.map(header_text).filter((v) => v !== '·')),
        ['00', '06', '12', '18', '23']);
});

test('vertical day rows are titled with dates, thinned like hourly mode', () => {
    const entry = { date: '08 Oct', nativeDate: new Date(2026, 9, 8) };
    const card = dayRowCard();
    assert.equal(card.vertical_row_title(entry, 0, 1), '08 Oct');
    assert.equal(card.vertical_row_title(entry, 3, 2), '');
    // No hour-of-day alignment: day rows are not hours.
    const tight = dayRowCard({}, { grid: new Array(48).fill({ vals: [] }), grid_height: 100 });
    assert.equal(tight.row_label_stride(), 7);
});

test('corner label reads Date for vertical day rows and Time for horizontal', () => {
    const myhass = { locale: { time_format: '24' }, localize: () => '' };
    assert.equal(dayRowCard({ orientation: 'vertical' }, { myhass }).corner_label(), 'Date');
    assert.equal(dayRowCard({ orientation: 'horizontal' }, { myhass }).corner_label(), 'Time');
});

test('horizontal day rows put one date per column, as hourly mode does', () => {
    const grid = [
        { date: '09 Oct', vals: [] },
        { date: '08 Oct', vals: [] }
    ];
    const headers = dayRowCard({ orientation: 'horizontal' }, { grid, grid_width: 0 }).date_column_headers();
    assert.deepEqual(plain(headers.map((th) => th.values[1])), ['08 Oct', '09 Oct']);
});

test('horizontal day rows thin the time axis to round clock times', () => {
    // 288 rows at 2px: 14px needs a stride of 7 slots, which rounds up to an hour.
    const card = dayRowCard({ orientation: 'horizontal' }, {
        grid: [{ vals: new Array(288).fill(0) }], grid_height: 576
    });
    assert.equal(card.row_label_stride(), 12);
    // display.time_labels counts hours, so 2 means every 24 five-minute slots.
    const configured = dayRowCard({ orientation: 'horizontal', display: { time_labels: 2 } }, {
        grid: [{ vals: new Array(288).fill(0) }], grid_height: 576
    });
    assert.equal(configured.row_label_stride(), 24);
    // Unmeasured: label everything, as label_stride() does elsewhere.
    const unmeasured = dayRowCard({ orientation: 'horizontal' }, { grid: [], grid_height: 0 });
    assert.equal(unmeasured.row_label_stride(), 1);
});

test('horizontal day rows default to a compact fixed height', () => {
    const card = dayRowCard({ orientation: 'horizontal' }, { grid: [{ vals: new Array(288).fill(0) }] });
    assert.equal(card.grid_height_px(), 576);
    assert.equal(card.grid_css_class(), 'horizontal fixed-height');
    assert.equal(card.grid_style(), '--hm-cell-height: 2px;');
    // display.height still wins.
    const tall = dayRowCard({ orientation: 'horizontal', display: { height: 900 } });
    assert.equal(tall.grid_height_px(), 900);
    // Vertical day rows and hour rows keep natural height.
    assert.equal(dayRowCard().grid_height_px(), undefined);
    assert.equal(dayRowCard({ minute_rows: 'hour', orientation: 'horizontal' }).grid_height_px(), undefined);
});

test('combine_grids aligns day rows by day', () => {
    const card = dayRowCard();
    const day = (d) => new Date(2026, 9, d);
    const combined = card.combine_grids(
        [{ date: '08 Oct', nativeDate: day(8), vals: [10, 10] },
         { date: '07 Oct', nativeDate: day(7), vals: [5, 5] }],
        [{ date: '07 Oct', nativeDate: day(7), vals: [1, 2] },
         { date: '08 Oct', nativeDate: day(8), vals: [3, 4] }],
        'difference'
    );
    assert.deepEqual(plain(combined[0].vals), [7, 6]);
    assert.deepEqual(plain(combined[1].vals), [4, 3]);
});

test('minute_cell_window reads day-row cells off the clock', () => {
    const grid = [{ date: '08 Oct', nativeDate: new Date(2026, 9, 8) }];
    assert.equal(dayRowCard({}, { grid }).minute_cell_window('0', '171'), '08 Oct 14:15 - 14:20');
    assert.equal(dayRowCard({ minute_interval: 30 }, { grid }).minute_cell_window('0', '47'),
        '08 Oct 23:30 - 00:00');
});

test('get_recorder requests 5-minute statistics over whole days for day rows', async () => {
    const requests = [];
    let pending;
    const card = makeCard({
        config: { mode: 'minute', minute_rows: 'day', minute_interval: 5, entity: 'sensor.t',
            days: 3, data: {}, display: {} },
        meta: { language: 'en', state_class: 'measurement', data: {} },
        view_offset: 0,
        myhass: {
            config: { unit_system: { temperature: '°C' } },
            localize: () => 'No data',
            callWS(request) {
                requests.push(request);
                pending = Promise.resolve({ 'sensor.t': [stat(8, 9, 0, { mean: 1 }), stat(8, 9, 5, { mean: 3 })] });
                return pending;
            }
        }
    });
    card.get_recorder(['sensor.t'], 3);
    await pending;
    await new Promise((resolve) => setImmediate(resolve));

    assert.equal(requests[0].period, '5minute');
    const start = new Date(requests[0].start_time);
    const end = new Date(requests[0].end_time);
    assert.equal(start.getHours(), 0, 'window starts at local midnight');
    assert.equal(start.getMinutes(), 0);
    const today = new Date(end);
    today.setHours(0, 0, 0, 0);
    assert.equal(today.getTime() - start.getTime(), 2 * 86400000, '3 days including today');

    assert.equal(card.grid.length, 1);
    assert.equal(card.grid[0].vals[108], 1);
    assert.equal(card.grid[0].vals[109], 3);
});

test('setConfig accepts minute_rows with its own range and default', () => {
    const card = makeCard({ scales: { get_scale() {} } });
    card.setConfig({ entity: 'sensor.t', mode: 'minute', minute_rows: 'day' });
    assert.equal(card.config.minute_rows, 'day');
    assert.equal(card.config.days, 7);

    // Day rows take the full hourly range.
    card.setConfig({ entity: 'sensor.t', mode: 'minute', minute_rows: 'day', days: 365 });
    assert.equal(card.config.days, 365);
    assert.throws(
        () => card.setConfig({ entity: 'sensor.t', mode: 'minute', minute_rows: 'day', days: 366 }),
        /between 1 and 365/
    );

    // Hour rows keep their cap and default.
    card.setConfig({ entity: 'sensor.t', mode: 'minute' });
    assert.equal(card.config.minute_rows, 'hour');
    assert.equal(card.config.days, 1);
    assert.throws(
        () => card.setConfig({ entity: 'sensor.t', mode: 'minute', minute_rows: 'hour', days: 32 }),
        /between 1 and 31 in minute mode/
    );

    assert.throws(
        () => card.setConfig({ entity: 'sensor.t', mode: 'minute', minute_rows: 'week' }),
        /`minute_rows` must be/
    );
    assert.throws(
        () => card.setConfig({ entity: 'sensor.t', minute_rows: 'day' }),
        /only supported in minute mode/
    );
});

test('day-row sizing counts days vertically and the compact height horizontally', () => {
    const vertical = (days) => dayRowCard({ days, orientation: 'vertical' });
    assert.ok(vertical(30).estimated_height_px() > vertical(7).estimated_height_px());
    // Same as hourly mode for the same number of days.
    const hourly = makeCard({ config: { mode: 'hourly', days: 30, display: {} } });
    assert.equal(vertical(30).estimated_height_px(), hourly.estimated_height_px());
    assert.equal(vertical(30).getCardSize(), hourly.getCardSize());

    const horizontal = dayRowCard({ days: 7, orientation: 'horizontal' });
    assert.equal(horizontal.getCardSize(), 1 + Math.ceil(576 / 50));
});
