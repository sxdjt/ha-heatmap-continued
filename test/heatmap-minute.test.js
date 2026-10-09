'use strict';

/*
    Minute mode (#17): rows are clock hours, columns are slices of the hour, built from
    5-minute short-term statistics. Kept in its own file so the DST cases can pin a time
    zone without disturbing the rest of the suite (node --test runs each file in its own
    process).
*/

const test = require('node:test');
const assert = require('node:assert/strict');
const { loadCard } = require('./helpers/load-card.js');

const { HeatmapCard, align_stride, local_hour_start, format_month_day, MINUTE_INTERVALS } = loadCard();

function makeCard(props = {}) {
    return Object.assign(Object.create(HeatmapCard.prototype), props);
}

// A minute-mode card with just enough state for the grid builders and labels.
function minuteCard(config = {}, props = {}) {
    return makeCard({
        config: { mode: 'minute', minute_interval: 5, display: {}, ...config },
        meta: { language: 'en', state_class: 'measurement' },
        myhass: { locale: { time_format: '24' } },
        ...props
    });
}

// One 5-minute statistic starting at the given local time on 8 Oct 2026.
function stat(hour, minute, fields) {
    return { start: new Date(2026, 9, 8, hour, minute).getTime(), ...fields };
}

// Arrays built inside the card's VM context are a different realm's Array, which
// deepEqual will not match against a literal; round-trip them to plain data first.
const plain = (vals) => JSON.parse(JSON.stringify(Array.from(vals)));

test('align_stride rounds up to the next allowed stride', () => {
    const allowed = [1, 2, 3, 4, 6, 12, 24];
    assert.equal(align_stride(1, allowed), 1);
    assert.equal(align_stride(5, allowed), 6);
    assert.equal(align_stride(7, allowed), 12);
    assert.equal(align_stride(99, allowed), 24);
});

test('local_hour_start drops minutes, seconds and milliseconds', () => {
    const start = local_hour_start(new Date(2026, 9, 8, 14, 37, 12, 345));
    assert.equal(start.getTime(), new Date(2026, 9, 8, 14, 0, 0, 0).getTime());
});

test('calculate_minute_values builds one row per hour, newest first', () => {
    const card = minuteCard();
    const rows = card.calculate_minute_values([
        stat(13, 0, { mean: 1 }),
        stat(13, 55, { mean: 2 }),
        stat(14, 0, { mean: 3 }),
        stat(14, 10, { mean: 4 })
    ], 'mean', false);

    assert.equal(rows.length, 2);
    assert.equal(rows[0].nativeDate.getHours(), 14);
    assert.equal(rows[1].nativeDate.getHours(), 13);
    // A full hour has 12 slots; missing ones are null, not 0.
    assert.equal(rows[1].vals.length, 12);
    assert.equal(rows[1].vals[0], 1);
    assert.equal(rows[1].vals[1], null);
    assert.equal(rows[1].vals[11], 2);
    // The current hour stops after its last received slot (14:10 is slot 2).
    assert.deepEqual(plain(rows[0].vals), [3, null, 4]);
    // `date` is the calendar day, for the tooltip and the navigation range.
    assert.equal(rows[0].date, format_month_day(new Date(2026, 9, 8), 'en'));
});

test('calculate_minute_values fills a missing hour with null so rows stay aligned', () => {
    const card = minuteCard();
    const rows = card.calculate_minute_values([
        stat(10, 0, { mean: 1 }),
        stat(12, 0, { mean: 2 })
    ], 'mean', false);

    assert.deepEqual(plain(rows.map((row) => row.nativeDate.getHours())), [12, 11, 10]);
    assert.ok(rows[1].vals.every((value) => value === null), 'gap hour must be no data, not 0');
    assert.equal(rows[1].vals.length, 12);
});

test('calculate_minute_values diffs the running sum for totals', () => {
    const card = minuteCard({}, { meta: { language: 'en', state_class: 'total_increasing' } });
    const rows = card.calculate_minute_values([
        stat(9, 0, { sum: 10 }),
        stat(9, 5, { sum: 10.042 }),
        stat(9, 15, { sum: 10.1 })
    ], 'sum', true);

    // First slot has nothing to diff against; the skipped 9:10 slot is 0 inside the
    // hour. 3 decimals so a 42 Wh reading is not flattened to 40.
    assert.deepEqual(plain(rows[0].vals), [0, 0.042, 0, 0.058]);
});

test('calculate_minute_values reads state for a treat_as: measurement total', () => {
    const card = minuteCard();
    const rows = card.calculate_minute_values([
        stat(9, 0, { sum: 999, state: 4 }),
        stat(9, 5, { sum: 999, state: 7 })
    ], 'state', false);
    assert.deepEqual(plain(rows[0].vals), [4, 7]);
});

test('calculate_minute_values returns no rows for no statistics', () => {
    assert.equal(minuteCard().calculate_minute_values([], 'mean', false).length, 0);
});

test('bucket_grid groups 5-minute slots by minute_interval', () => {
    const grid = () => [{ date: 'd', vals: [1, 2, 3, 4, 5, 6] }];

    const mean = minuteCard({ minute_interval: 15 });
    assert.deepEqual(plain(mean.bucket_grid(grid())[0].vals), [2, 5]);

    const energy = minuteCard({ minute_interval: 10 }, { meta: { state_class: 'total_increasing' } });
    assert.deepEqual(plain(energy.bucket_grid(grid())[0].vals), [3, 7, 11]);

    // 5 minutes is the raw statistic: nothing to group.
    assert.deepEqual(plain(minuteCard().bucket_grid(grid())[0].vals), [1, 2, 3, 4, 5, 6]);

    // time_interval must not leak into minute mode even if present.
    const stray = minuteCard({ time_interval: 2 });
    assert.deepEqual(plain(stray.bucket_grid(grid())[0].vals), [1, 2, 3, 4, 5, 6]);
});

test('minute axis labels carry a colon so they cannot be read as hours', () => {
    assert.equal(minuteCard().slot_label(0), ':00');
    assert.equal(minuteCard().slot_label(1), ':05');
    assert.equal(minuteCard().slot_label(11), ':55');
    assert.equal(minuteCard({ minute_interval: 15 }).slot_label(3), ':45');
});

test('minute_table_headers label each quarter hour and the final slot', () => {
    const card = minuteCard({}, { grid: [{ vals: new Array(12).fill(0) }] });
    const labels = card.minute_table_headers().map((th) => th.values[0]);
    assert.deepEqual(plain(labels), [
        ':00', '·', '·', ':15', '·', '·', ':30', '·', '·', ':45', '·', ':55'
    ]);
    // At 20-minute cells every slot is labelled.
    const coarse = minuteCard({ minute_interval: 20 }, { grid: [{ vals: [0, 0, 0] }] });
    assert.deepEqual(plain(coarse.minute_table_headers().map((th) => th.values[0])), [':00', ':20', ':40']);
});

test('date_table_headers dispatches to the minute headers in minute mode', () => {
    const card = minuteCard({}, { grid: [{ vals: [0, 0] }] });
    assert.deepEqual(plain(card.date_table_headers().map((th) => th.values[0])), [':00', ':05']);
});

test('vertical row titles are hours aligned to the day, with the date at midnight', () => {
    const row = (hour) => ({ date: '08 Oct', nativeDate: new Date(2026, 9, 8, hour) });
    const card = minuteCard();
    assert.equal(card.vertical_row_title(row(14), 0, 1), '14:00');
    assert.equal(card.vertical_row_title(row(0), 5, 1), '08 Oct');
    // Thinned by the hour, not the row index: hour 6 is labelled at stride 6 wherever
    // it sits in the grid, and hour 7 is not.
    assert.equal(card.vertical_row_title(row(6), 3, 6), '06:00');
    assert.equal(card.vertical_row_title(row(7), 0, 6), '');

    const twelve = minuteCard({}, { myhass: { locale: { time_format: '12' } } });
    assert.equal(twelve.vertical_row_title(row(14), 0, 1), '2 PM');
});

test('row_label_stride in minute mode only lands on strides that divide a day', () => {
    // 48 rows in 240px is 5px per row; 14px needs a stride of 3, which already divides 24.
    const fits = minuteCard({}, { grid: new Array(48).fill({ vals: [] }), grid_height: 240 });
    assert.equal(fits.row_label_stride(), 3);
    // 48 rows in 100px wants a stride of 7, which rounds up to 12.
    const tight = minuteCard({}, { grid: new Array(48).fill({ vals: [] }), grid_height: 100 });
    assert.equal(tight.row_label_stride(), 12);
    // Hourly mode is untouched: raw strides are allowed there.
    const hourly = makeCard({ config: { mode: 'hourly' }, grid: new Array(48).fill({}), grid_height: 100 });
    assert.equal(hourly.row_label_stride(), 7);
});

test('day_column_headers group hour columns by day and blank a day too narrow to label', () => {
    // Newest first, as the builders return it: 2 hours on 09 Oct, 22 hours on 08 Oct.
    const grid = [];
    for (let i = 0; i < 2; i++) { grid.push({ date: '09 Oct', vals: [] }); }
    for (let i = 0; i < 22; i++) { grid.push({ date: '08 Oct', vals: [] }); }

    const unmeasured = minuteCard({ orientation: 'horizontal' }, { grid, grid_width: 0 });
    const headers = unmeasured.date_column_headers();
    assert.deepEqual(plain(headers.map((th) => [th.values[0], th.values[1]])), [[22, '08 Oct'], [2, '09 Oct']]);

    // 24 columns over 290px is 10px each: 2 columns cannot hold a date label.
    const narrow = minuteCard({ orientation: 'horizontal' }, { grid, grid_width: 290 });
    assert.deepEqual(plain(narrow.date_column_headers().map((th) => th.values[1])), ['08 Oct', '']);
});

test('combine_grids aligns minute rows by hour, not by day', () => {
    const card = minuteCard();
    const hour = (h) => new Date(2026, 9, 8, h);
    const primary = [
        { date: '08 Oct', nativeDate: hour(14), vals: [10, 10] },
        { date: '08 Oct', nativeDate: hour(13), vals: [5, 5] }
    ];
    const secondary = [
        { date: '08 Oct', nativeDate: hour(13), vals: [1, 2] },
        { date: '08 Oct', nativeDate: hour(14), vals: [3, 4] }
    ];
    const combined = card.combine_grids(primary, secondary, 'difference');
    assert.deepEqual(plain(combined[0].vals), [7, 6]);
    assert.deepEqual(plain(combined[1].vals), [4, 3]);
});

test('combine_grids keeps 3 decimals in minute mode', () => {
    const card = minuteCard({}, { meta: { state_class: 'total_increasing' } });
    const when = new Date(2026, 9, 8, 9);
    const combined = card.combine_grids(
        [{ date: 'd', nativeDate: when, vals: [0.042] }],
        [{ date: 'd', nativeDate: when, vals: [0.001] }],
        'difference'
    );
    assert.deepEqual(plain(combined[0].vals), [0.041]);
});

test('minute_cell_window describes the cell on the clock', () => {
    const grid = [{ date: '08 Oct', nativeDate: new Date(2026, 9, 8, 14) }];
    assert.equal(minuteCard({}, { grid }).minute_cell_window('0', '3'), '08 Oct 14:15 - 14:20');
    assert.equal(minuteCard({ minute_interval: 30 }, { grid }).minute_cell_window('0', '1'),
        '08 Oct 14:30 - 15:00');
    const twelve = minuteCard({}, { grid, myhass: { locale: { time_format: '12' } } });
    assert.equal(twelve.minute_cell_window('0', '0'), '08 Oct 2:00 PM - 2:05 PM');
    // A stale row index (grid refetched under an open tooltip) yields no label.
    assert.equal(minuteCard({}, { grid }).minute_cell_window('5', '0'), '');
});

test('corner label reads Time in both minute-mode layouts', () => {
    const myhass = { locale: { time_format: '24' }, localize: () => '' };
    assert.equal(minuteCard({ orientation: 'vertical' }, { myhass }).corner_label(), 'Time');
    assert.equal(minuteCard({ orientation: 'horizontal' }, { myhass }).corner_label(), 'Time');
    assert.equal(makeCard({ config: { orientation: 'vertical' }, myhass }).corner_label(), 'Date');
});

test('get_recorder requests 5-minute statistics over days * 24 hours', async () => {
    const requests = [];
    let pending;
    const card = makeCard({
        config: { mode: 'minute', minute_interval: 5, entity: 'sensor.t', days: 2, data: {}, display: {} },
        meta: { language: 'en', state_class: 'measurement', data: {} },
        view_offset: 0,
        myhass: {
            config: { unit_system: { temperature: '°C' } },
            localize: () => 'No data',
            callWS(request) {
                requests.push(request);
                pending = Promise.resolve({ 'sensor.t': [stat(9, 0, { mean: 1 }), stat(9, 5, { mean: 3 })] });
                return pending;
            }
        }
    });
    card.get_recorder(['sensor.t'], 2);
    await pending;
    await new Promise((resolve) => setImmediate(resolve));

    assert.equal(requests[0].period, '5minute');
    const start = new Date(requests[0].start_time);
    const end = new Date(requests[0].end_time);
    assert.equal(start.getMinutes(), 0, 'window starts on an hour boundary');
    assert.equal(local_hour_start(end).getTime() - start.getTime(), 47 * 3600000,
        '48 hour rows including the current one');

    assert.equal(card.grid.length, 1);
    assert.deepEqual(plain(card.grid[0].vals), [1, 3]);
    assert.equal(card.meta.data.min, 1);
    assert.equal(card.meta.data.max, 3);
});

test('get_recorder explains short-term retention when minute mode finds nothing', async () => {
    let pending;
    const card = makeCard({
        config: { mode: 'minute', entity: 'sensor.t', days: 1, data: {}, display: {} },
        meta: { language: 'en', state_class: 'measurement', data: {} },
        view_offset: -20,
        myhass: {
            config: { unit_system: { temperature: '°C' } },
            localize: () => 'No data',
            callWS() { pending = Promise.resolve({}); return pending; }
        }
    });
    card.get_recorder(['sensor.t'], 1);
    await pending;
    await new Promise((resolve) => setImmediate(resolve));
    assert.match(card.grid_status, /^No data\. 5-minute statistics/);
});

test('hourly get_recorder still requests hourly statistics', async () => {
    const requests = [];
    let pending;
    const card = makeCard({
        config: { mode: 'hourly', entity: 'sensor.t', days: 1, data: {}, display: {} },
        meta: { language: 'en', state_class: 'measurement', data: {} },
        view_offset: 0,
        myhass: {
            config: { unit_system: { temperature: '°C' } },
            localize: () => 'No data',
            callWS(request) { requests.push(request); pending = Promise.resolve({}); return pending; }
        }
    });
    card.get_recorder(['sensor.t'], 1);
    await pending;
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(requests[0].period, 'hour');
    // Hourly mode keeps the plain "No data" status.
    assert.equal(card.grid_status, 'No data');
});

test('setConfig accepts minute mode with its own defaults', () => {
    const card = makeCard({ scales: { get_scale() {} } });
    card.setConfig({ entity: 'sensor.t', mode: 'minute' });
    assert.equal(card.config.mode, 'minute');
    assert.equal(card.config.days, 1);
    assert.equal(card.config.minute_interval, 5);

    // Hourly default range is unchanged.
    card.setConfig({ entity: 'sensor.t' });
    assert.equal(card.config.days, 21);
});

test('setConfig validates minute_interval and the minute-mode range', () => {
    const card = makeCard({ scales: { get_scale() {} } });
    for (const minutes of MINUTE_INTERVALS) {
        card.setConfig({ entity: 'sensor.t', mode: 'minute', minute_interval: minutes });
        assert.equal(card.config.minute_interval, minutes);
    }
    // The editor's select emits strings.
    card.setConfig({ entity: 'sensor.t', mode: 'minute', minute_interval: '15' });
    assert.equal(card.config.minute_interval, 15);

    for (const bad of [0, 7, 60, '7', 'lots']) {
        assert.throws(
            () => card.setConfig({ entity: 'sensor.t', mode: 'minute', minute_interval: bad }),
            /`minute_interval`/
        );
    }
    assert.throws(
        () => card.setConfig({ entity: 'sensor.t', minute_interval: 15 }),
        /only supported in minute mode/
    );
    assert.throws(
        () => card.setConfig({ entity: 'sensor.t', mode: 'minute', days: 32 }),
        /between 1 and 31 in minute mode/
    );
    card.setConfig({ entity: 'sensor.t', mode: 'minute', days: 31 });
    assert.equal(card.config.days, 31);
    assert.throws(
        () => card.setConfig({ entity: 'sensor.t', mode: 'minute', time_interval: 2 }),
        /`time_interval` is only supported in hourly mode/
    );
    // Multi-entity combination works per hour row in minute mode.
    card.setConfig({ entity: 'sensor.a', secondary_entity: 'sensor.b', mode: 'minute' });
    assert.equal(card.config.secondary_entity, 'sensor.b');
});

test('minute mode sizing counts hour rows vertically and minute slots horizontally', () => {
    const height = (config) => minuteCard({ days: 1, ...config }).estimated_height_px();
    assert.ok(height({ orientation: 'vertical', days: 2 }) > height({ orientation: 'vertical', days: 1 }));
    assert.ok(height({ orientation: 'horizontal', minute_interval: 5 })
            > height({ orientation: 'horizontal', minute_interval: 30 }));
    assert.equal(minuteCard({ orientation: 'vertical', days: 1 }).getCardSize(), 5);
});

test('set hass refreshes every 5 minutes in minute mode', () => {
    let fetches = 0;
    const card = minuteCard({}, { view_offset: 0, last_render_ts: Date.now() - (6 * 60 * 1000) });
    card.fetch_history = () => { fetches++; };
    // Setter lives on the prototype; Object.assign in makeCard would not reach it.
    Object.getOwnPropertyDescriptor(HeatmapCard.prototype, 'hass').set.call(card, {});
    assert.equal(fetches, 1);

    const hourly = makeCard({ config: { mode: 'hourly' }, view_offset: 0,
        last_render_ts: Date.now() - (6 * 60 * 1000) });
    hourly.fetch_history = () => { fetches++; };
    Object.getOwnPropertyDescriptor(HeatmapCard.prototype, 'hass').set.call(hourly, {});
    assert.equal(fetches, 1, 'hourly mode keeps its 10 minute throttle');
});
