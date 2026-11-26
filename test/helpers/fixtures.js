'use strict';

/*
    Shared fixtures for tests that drive a whole card in HA's order (setConfig, hass,
    connect) and inspect its templates. See ../README.md.
*/

const HOUR = 3600000;

// A hass whose callWS answers are released by the test, in any order.
function fakeHass(states, extra = {}) {
    const requests = [];
    return {
        requests,
        config: { unit_system: { temperature: '°C' } },
        language: 'en',
        locale: { time_format: '24' },
        localize: () => 'No data',
        states,
        callWS(request) {
            return new Promise((resolve) => { requests.push({ request, resolve }); });
        },
        ...extra
    };
}

// One statistics row per hour for the last `hours` hours.
function hourlyRows(mean, hours = 3) {
    const now = Math.floor(Date.now() / HOUR) * HOUR;
    return Array.from({ length: hours }, (_, i) => ({
        start: now - (hours - i) * HOUR,
        mean: (typeof mean === 'function') ? mean(i) : mean
    }));
}

const settle = () => new Promise((resolve) => setImmediate(resolve));

/*
    Text of a stub template ({ strings, values }), with nested templates and arrays
    flattened in place. Functions (event handlers) render as nothing.
*/
function markup(template) {
    if (template === null || template === undefined || template === false) { return ''; }
    if (Array.isArray(template)) { return template.map(markup).join(''); }
    if (typeof template === 'function') { return ''; }
    if (typeof template === 'object' && Array.isArray(template.strings)) {
        let out = '';
        template.strings.forEach((s, i) => {
            out += s;
            if (i < template.values.length) { out += markup(template.values[i]); }
        });
        return out;
    }
    return String(template);
}

// Every function bound anywhere in a template tree, in order.
function handlers(template, found = []) {
    if (Array.isArray(template)) {
        template.forEach((t) => handlers(t, found));
    } else if (typeof template === 'function') {
        found.push(template);
    } else if (template && typeof template === 'object' && Array.isArray(template.values)) {
        template.values.forEach((v) => handlers(v, found));
    }
    return found;
}

module.exports = { HOUR, fakeHass, hourlyRows, settle, markup, handlers };
