'use strict';

/*
    The card's templates and interaction code, driven in HA's order: setConfig, hass,
    connect. Templates are inspected through helpers/fixtures.js `markup()`; cell
    interaction runs against helpers/fake-dom.js.
*/

const test = require('node:test');
const assert = require('node:assert/strict');
const { loadCard } = require('./helpers/load-card.js');
const { fakeHass, hourlyRows, settle, markup, handlers } = require('./helpers/fixtures.js');
const { fakeRoot } = require('./helpers/fake-dom.js');

const { HeatmapCard, vm_global } = loadCard();

const ATTRS = { state_class: 'measurement', friendly_name: 'Sensor A', unit_of_measurement: 'W' };

// A connected card whose first fetch has been answered with `rows`.
async function loadedCard(config = {}, rows = hourlyRows((i) => i * 10, 6), attributes = ATTRS, extra = {}) {
    const hass = fakeHass({ 'sensor.a': { state: '1', attributes } }, extra);
    const card = new HeatmapCard();
    card.setConfig({ entity: 'sensor.a', ...config });
    card.hass = hass;
    card.connectedCallback();
    hass.requests[0].resolve({ 'sensor.a': rows });
    await settle();
    return { card, hass };
}

function withRoot(card, shape, vals) {
    const root = fakeRoot(shape, vals);
    Object.defineProperty(card, 'renderRoot', { value: root, configurable: true });
    return root;
}

/* --- render ------------------------------------------------------------------ */

test('static properties declare the reactive state', () => {
    const props = HeatmapCard.properties;
    for (const key of ['hass', 'config', 'grid', 'meta', 'tooltipOpen', 'view_offset']) {
        assert.ok(key in props, key);
    }
});

test('a loaded hourly card renders title, rows, cells, legend and navigation', async () => {
    const { card } = await loadedCard({ title: 'Power' });
    const text = markup(card.render());
    assert.match(text, /<ha-card header="Power"/);
    assert.match(text, /<td class="hm-row-title"><span>/);
    assert.ok((text.match(/class="hm-box"/g) ?? []).length >= 6);
    assert.match(text, /class="nav-controls"/);
    assert.match(text, /class="legend-container"/);
    assert.equal((text.match(/class="legend-tick"/g) ?? []).length, 6, 'relative legend: 6 ticks');
    assert.match(text, /<div id="tooltip" class="hidden">/);
});

test('render recreates a missing grid array', async () => {
    const { card } = await loadedCard();
    card.grid = undefined;
    assert.doesNotThrow(() => card.render());
    assert.equal(card.grid.length, 0);
});

test('navigation buttons page back, forward and to the present', async () => {
    const { card, hass } = await loadedCard({ days: 2 });
    const [back, forward, now] = handlers(card.render_navigation());
    back();
    assert.equal(card.view_offset, -2);
    assert.match(markup(card.render_navigation()), /Now/);
    forward();
    assert.equal(card.view_offset, 0);
    back(); back();
    now();
    assert.equal(card.view_offset, 0);
    assert.equal(hass.requests.length, 6, 'the first load and five pages');
});

test('display.navigation and display.legend false hide those parts', async () => {
    const { card } = await loadedCard({ display: { navigation: false, legend: false } });
    assert.equal(card.render_navigation(), undefined);
    assert.equal(card.render_legend(), undefined);
});

test('the legend uses fixed decimals and the scale unit', async () => {
    const { card } = await loadedCard({ display: { decimals: 1 }, scale: 'outdoor temperature' },
        hourlyRows(20, 3), { ...ATTRS, unit_of_measurement: '°C', device_class: 'temperature' });
    const text = markup(card.render_legend());
    assert.match(text, /-?\d+\.0 °C/);
});

test('legend_scale spaces absolute steps by value, relative ticks across the range', async () => {
    const { card } = await loadedCard();
    const absolute = card.legend_scale({ type: 'absolute', steps: [{ value: 0 }, { value: 5 }, { value: 20 }] });
    assert.deepEqual(Array.from(absolute, ([at, v]) => [at, v]), [[0, 0], [25, 5], [100, 20]]);
    card.meta.data = { min: 0, max: 50 };
    const relative = card.legend_scale({ type: 'relative' });
    assert.deepEqual(Array.from(relative, ([at, v]) => [at, v]), [[0, 0], [20, 10], [40, 20], [60, 30], [80, 40], [100, 50]]);
});

test('render_cell clamps values outside the relative range', async () => {
    const { card } = await loadedCard();
    card.meta.data = { min: 10, max: 20 };
    const low = card.render_cell(0, 0, 0).values.at(-2);
    const high = card.render_cell(99, 0, 0).values.at(-2);
    assert.equal(String(low), String(card.meta.scale.gradient(0)));
    assert.equal(String(high), String(card.meta.scale.gradient(1)));
});

test('cell labels fall back to light text when contrast cannot be computed', async () => {
    const { card } = await loadedCard({ display: { labels: true } });
    const contrast = vm_global.chroma.contrast;
    vm_global.chroma.contrast = () => { throw new Error('no contrast'); };
    try {
        const label = card.render_cell(5, 0, 0).values.at(-1);
        assert.equal(label.values[0], '#fff');
    } finally {
        vm_global.chroma.contrast = contrast;
    }
});

test('the range label handles a grid without dates', async () => {
    const { card } = await loadedCard();
    card.grid = [{ vals: [1] }];
    assert.equal(card.visible_range_label(), '');
    card.grid = [{ date: 'Nov 1', vals: [1] }];
    assert.equal(card.visible_range_label(), 'Nov 1');
});

/* --- tooltip ----------------------------------------------------------------- */

test('the tooltip shows the selected cell\'s time window and value', async () => {
    const { card } = await loadedCard();
    card.selected_element_data = { row: '0', col: '3', val: '12.345' };
    card.tooltipOpen = true;
    const text = markup(card.render_tooltip());
    assert.match(text, /class="active"/);
    assert.match(text, /03:00 - 04:00/);
    assert.match(text, /12\.35 W/);
});

test('cell_description: no data, 12-hour clock, and daily weekday dates', async () => {
    const { card } = await loadedCard({}, hourlyRows(1, 3), ATTRS);
    assert.equal(card.cell_description({ row: '0', col: '0', val: '' }).value, 'No data');
    card.myhass.locale = { time_format: '12' };
    assert.match(card.cell_description({ row: '0', col: '13', val: '1' }).meta, /1 PM - 2 PM/);

    const daily = await loadedCard({ mode: 'daily', weeks: 1 }, [{ start: Date.now() - 86400000, mean: 3 }]);
    daily.card.grid = [{ date: 'w', nativeDate: new Date(2026, 10, 2), vals: [] }];
    assert.match(daily.card.cell_description({ row: '0', col: '2', val: '3' }).meta, /Wed/);
});

test('clicking a cell opens the tooltip near it; clicking it again closes it', async () => {
    const { card } = await loadedCard();
    const root = withRoot(card, [3, 3]);
    const cell = root.cells[4];
    card.toggle_tooltip({ target: cell.label });
    assert.equal(card.tooltipOpen, true);
    assert.equal(cell.id, 'selected');
    assert.equal(root.tooltip.style.top, `${(110 - 20) - 50 - 10}px`);
    assert.equal(root.tooltip.style.left, `${(60 - 10) - 5 - 70}px`);
    assert.equal(card.selected_element_data.col, '1');

    card.toggle_tooltip({ target: root.cells[0] });
    assert.equal(cell.id, '', 'the selection moves');
    assert.equal(root.cells[0].id, 'selected');

    card.toggle_tooltip({ target: root.cells[0] });
    assert.equal(card.tooltipOpen, false);
    assert.equal(card.selected_element_data, '');
});

test('a click target without closest() is used as the cell itself', async () => {
    const { card } = await loadedCard();
    const root = withRoot(card, [2]);
    const cell = root.cells[1];
    cell.closest = undefined;
    card.toggle_tooltip({ target: cell });
    assert.equal(cell.id, 'selected');
});

test('document clicks outside a cell and Escape close the tooltip', async () => {
    const { card } = await loadedCard();
    const root = withRoot(card, [2]);
    card.toggle_tooltip({ target: root.cells[0] });

    card._dismiss_on_click({ composedPath: () => [root.cells[1], {}] });
    assert.equal(card.tooltipOpen, true, 'a cell click is left to toggle_tooltip');
    card._dismiss_on_escape({ key: 'a' });
    assert.equal(card.tooltipOpen, true);
    card._dismiss_on_click({ composedPath: () => [{ classList: { contains: () => false } }, {}] });
    assert.equal(card.tooltipOpen, false);

    card._dismiss_on_click({ composedPath: () => { throw new Error('not reached when closed'); } });
    card.toggle_tooltip({ target: root.cells[0] });
    card._dismiss_on_escape({ key: 'Escape' });
    assert.equal(card.tooltipOpen, false);
    card._dismiss_on_escape({ key: 'Escape' });
});

/* --- keyboard ---------------------------------------------------------------- */

function key(card, cell, name) {
    const event = { key: name, target: cell, prevented: false, preventDefault() { this.prevented = true; } };
    card.grid_keydown(event);
    return event;
}

test('arrow keys, Home and End move focus between cells', async () => {
    const { card } = await loadedCard();
    const root = withRoot(card, [3, 3, 2]);
    const [a0, a1, a2, b0, b1, b2, c0, c1] = root.cells;

    assert.equal(key(card, a0, 'ArrowRight').prevented, true);
    assert.equal(a1.focused, true);
    assert.equal(a1.tabIndex, 0);
    assert.equal(a0.tabIndex, -1);
    assert.match(a1.getAttribute('aria-label'), /: /);

    key(card, a1, 'ArrowLeft');
    assert.equal(a0.focused, true);
    key(card, b2, 'ArrowDown');
    assert.equal(c1.focused, true, 'a shorter row clamps to its last cell');
    key(card, b1, 'ArrowUp');
    assert.equal(a1.tabIndex, 0);
    key(card, b1, 'Home');
    assert.equal(b0.focused, true);
    key(card, b0, 'End');
    assert.equal(b2.focused, true);
    void a2; void c0;
});

test('moves off the grid edge, other keys and non-cell targets do nothing', async () => {
    const { card } = await loadedCard();
    const root = withRoot(card, [2, 2]);
    const [a0, , , b1] = root.cells;
    assert.equal(key(card, a0, 'ArrowUp').prevented, true);
    assert.equal(key(card, a0, 'ArrowLeft').prevented, true);
    assert.equal(key(card, b1, 'ArrowDown').prevented, true);
    assert.equal(key(card, a0, 'Tab').prevented, false);
    assert.equal(key(card, { closest: () => null }, 'ArrowRight').prevented, false);
    assert.equal(key(card, {}, 'ArrowRight').prevented, false);
});

test('Enter and Space toggle the tooltip; an open tooltip follows the focus', async () => {
    const { card } = await loadedCard();
    const root = withRoot(card, [2, 2]);
    const [a0, a1] = root.cells;
    assert.equal(key(card, a0, 'Enter').prevented, true);
    assert.equal(card.tooltipOpen, true);
    key(card, a0, 'ArrowRight');
    assert.equal(a1.id, 'selected');
    assert.equal(card.selected_element_data.col, '1');
    key(card, a1, ' ');
    assert.equal(card.tooltipOpen, false);
});

test('sync_cell_tabindex falls back to the first cell and skips an empty grid', async () => {
    const { card } = await loadedCard();
    withRoot(card, [0]);
    assert.doesNotThrow(() => card.sync_cell_tabindex());
    Object.defineProperty(card, 'renderRoot', { value: undefined, configurable: true });
    assert.doesNotThrow(() => card.sync_cell_tabindex());

    const fresh = withRoot(card, [2]);
    card._active_cell = undefined;
    card.sync_cell_tabindex();
    assert.equal(fresh.cells[0].tabIndex, 0, 'no cell used yet: the first one');

    const root = withRoot(card, [2, 2]);
    card._active_cell = { row: '9', col: '9' };
    card.updated(new Map());
    assert.equal(root.cells[0].tabIndex, 0, 'the active cell is gone after new data');
    root.cells[0].tabIndex = 0;
    card.sync_cell_tabindex();
    assert.equal(root.cells[1].tabIndex, -1);
});

/* --- grid measurement ---------------------------------------------------------- */

test('the ResizeObserver records whole-pixel size changes only', async () => {
    let callback;
    vm_global.ResizeObserver = class {
        constructor(fn) { callback = fn; }
        observe() {}
        disconnect() {}
    };
    try {
        const { card } = await loadedCard();
        card.grid_width = 0;
        card.grid_height = 0;
        withRoot(card, [1]);
        card.firstUpdated();
        callback([{ contentRect: { width: 300, height: 120 } }]);
        assert.deepEqual([card.grid_width, card.grid_height], [300, 120]);
        callback([{ contentRect: { width: 300.4, height: 120.2 } }]);
        assert.deepEqual([card.grid_width, card.grid_height], [300, 120]);
        callback([]);
        assert.equal(card.grid_width, 300);

        Object.defineProperty(card, 'renderRoot', { value: { querySelector: () => null }, configurable: true });
        card._grid_observer = undefined;
        card.observe_grid();
        assert.equal(card._grid_observer, undefined, 'no grid in the DOM yet');
    } finally {
        delete vm_global.ResizeObserver;
    }
});

/* --- headers ----------------------------------------------------------------- */

test('daily mode headers and slot labels are weekdays from Monday', async () => {
    const { card } = await loadedCard({ mode: 'daily', weeks: 1 }, [{ start: Date.now() - 86400000, mean: 3 }]);
    const headers = card.date_table_headers().map(markup);
    assert.equal(headers.length, 7);
    assert.match(headers[0], /Mon/);
    assert.match(card.slot_label(6), /Sun/);
});

test('hourly headers use the 12-hour clock when the locale does', async () => {
    const { card } = await loadedCard();
    card.myhass.locale = { time_format: '12' };
    const headers = card.date_table_headers().map(markup);
    assert.match(headers[0], /12<br\/>AM/);
});

test('minute day-row headers use the 12-hour clock when the locale does', async () => {
    const { card } = await loadedCard({ mode: 'minute', minute_rows: 'day', days: 1 }, []);
    card.myhass.locale = { time_format: '12' };
    const text = card.minute_day_table_headers().map(markup).join('');
    assert.match(text, /12<br\/>AM/);
});
