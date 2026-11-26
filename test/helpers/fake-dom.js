'use strict';

/*
    Just enough of a rendered card for the tooltip, keyboard and tabindex code: a
    render root holding #card, #tooltip, #grid and a table of td.hm-box cells. Only
    the selectors and element members the card uses are implemented. Never pass these
    objects to assert (see ../README.md); assert on their fields.
*/

class FakeElement {
    constructor(props = {}) {
        this.dataset = {};
        this.style = {};
        this.id = '';
        this.attributes = new Map();
        this.children = [];
        this.parentElement = null;
        this.classList = { contains: (name) => (this.classes ?? []).includes(name) };
        this.focused = false;
        this.rect = { top: 0, left: 0, width: 10, height: 10 };
        Object.assign(this, props);
    }

    get tabIndex() { return this.attributes.has('tabindex') ? Number(this.attributes.get('tabindex')) : -1; }
    set tabIndex(value) { this.attributes.set('tabindex', String(value)); }
    hasAttribute(name) { return name === 'id' ? this.id !== '' : this.attributes.has(name); }
    setAttribute(name, value) { this.attributes.set(name, String(value)); }
    getAttribute(name) { return this.attributes.get(name); }
    removeAttribute(name) {
        if (name === 'id') { this.id = ''; } else { this.attributes.delete(name); }
    }
    getBoundingClientRect() { return this.rect; }
    focus() { this.focused = true; }
    closest(selector) {
        if (selector !== 'td.hm-box') { return null; }
        let node = this;
        while (node) {
            if (node.is_cell) { return node; }
            node = node.parentElement;
        }
        return null;
    }
    querySelectorAll(selector) {
        if (selector !== 'td.hm-box') { return []; }
        return this.children.filter((child) => child.is_cell);
    }
    querySelector(selector) { return this.querySelectorAll(selector)[0] ?? null; }
}

/*
    `shape` lists the number of cells per row, e.g. [3, 3, 2]. Each cell's dataset has
    row, col and val (val = `${row}${col}` unless `vals` overrides it).
*/
function fakeRoot(shape, vals = {}) {
    const tbody = new FakeElement();
    const cells = [];
    shape.forEach((count, row) => {
        const tr = new FakeElement({ parentElement: tbody });
        for (let col = 0; col < count; col++) {
            const td = new FakeElement({ parentElement: tr, is_cell: true, classes: ['hm-box'] });
            td.dataset = { row: String(row), col: String(col), val: vals[`${row},${col}`] ?? `${row}${col}` };
            td.rect = { top: 100 + row * 10, left: 50 + col * 10, width: 10, height: 10 };
            td.label = new FakeElement({ parentElement: td });
            tr.children.push(td);
            cells.push(td);
        }
        tbody.children.push(tr);
    });
    // A header row with no cells, as the real table has.
    tbody.children.unshift(new FakeElement({ parentElement: tbody }));
    const card = new FakeElement({ rect: { top: 20, left: 10, width: 400, height: 300 } });
    const tooltip = new FakeElement();
    const grid = new FakeElement();
    const root = {
        cells,
        card,
        tooltip,
        grid,
        querySelectorAll(selector) { return selector === 'td.hm-box' ? cells : []; },
        querySelector(selector) {
            if (selector === '#card') { return card; }
            if (selector === '#tooltip') { return tooltip; }
            if (selector === '#grid') { return grid; }
            if (selector === '#selected') { return cells.find((c) => c.id === 'selected') ?? null; }
            const match = /^td\.hm-box\[data-row="([^"]*)"\]\[data-col="([^"]*)"\]$/.exec(selector);
            if (match) {
                return cells.find((c) => c.dataset.row === match[1] && c.dataset.col === match[2]) ?? null;
            }
            return null;
        }
    };
    return root;
}

module.exports = { FakeElement, fakeRoot };
