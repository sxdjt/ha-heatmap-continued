'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { loadCard } = require('./helpers/load-card.js');

const { HeatmapScales, BUILTIN_SCALES, SCALE_ALIASES, DEVICE_CLASSES, conversions } = loadCard();

test('constructor indexes every builtin scale by key and sets the default', () => {
    const scales = new HeatmapScales();
    assert.equal(scales.default_scale, 'stoplight');
    assert.equal(Object.keys(scales.scale_by_key).length, BUILTIN_SCALES.length);
    for (const scale of BUILTIN_SCALES) {
        assert.equal(scales.scale_by_key[scale.key], scale);
    }
});

test('defaults_for returns the device-class default when defined', () => {
    const scales = new HeatmapScales();
    assert.equal(scales.defaults_for('temperature'), 'outdoor temperature');
});

test('defaults_for falls back to the global default for classes without one', () => {
    const scales = new HeatmapScales();
    // DEVICE_CLASSES only carries metadata for temperature; every other device
    // class - known to HA or not - falls back to the global default.
    assert.equal(scales.defaults_for('battery'), 'stoplight');
    assert.equal(scales.defaults_for('pm25'), 'stoplight');
    assert.equal(scales.defaults_for('carbon_dioxide'), 'stoplight');
    assert.equal(scales.defaults_for('not_a_real_class'), 'stoplight');
    assert.equal(scales.defaults_for(''), 'stoplight');
});

test('get_scale(undefined) resolves to the default scale', () => {
    const scales = new HeatmapScales();
    const scale = scales.get_scale(undefined);
    assert.equal(scale.key, 'stoplight');
});

test('get_scale by string name returns a fully rendered scale object', () => {
    const scales = new HeatmapScales();
    const scale = scales.get_scale('iron red');
    assert.equal(scale.key, 'iron red');
    assert.equal(scale.type, 'relative');
    assert.equal(typeof scale.gradient, 'function');
    assert.equal(typeof scale.css, 'string');
    assert.ok(Array.isArray(scale.steps));
    // gradient() returns a chroma color usable via .hex()
    assert.match(scale.gradient(0.5).hex(), /^#[0-9a-f]{6}$/i);
});

test('get_scale with a custom object strips the docs key', () => {
    const scales = new HeatmapScales();
    const custom = {
        type: 'relative',
        name: 'Custom',
        documentation: { text: 'should be removed from the returned object' },
        steps: [
            { value: 0, color: '#000000' },
            { value: 1, color: '#ffffff' }
        ]
    };
    const scale = scales.get_scale(custom);
    assert.equal('docs' in scale, false);
    assert.equal(scale.type, 'relative');
    assert.equal(scale.name, 'Custom');
});

test('generate_scale defaults type to relative when the config omits it', () => {
    const scales = new HeatmapScales();
    const scale = scales.generate_scale({
        name: 'no type',
        steps: [
            { value: 0, color: '#000000' },
            { value: 10, color: '#ffffff' }
        ]
    });
    assert.equal(scale.type, 'relative');
});

test('generate_scale does not mutate the caller-supplied step objects', () => {
    const scales = new HeatmapScales();
    const config = {
        type: 'absolute',
        unit: '°C',
        steps: [
            { value: 12, color: '#0f3489' },
            { value: 30, color: '#ff0000' }
        ]
    };
    scales.generate_scale(config, 'temperature', { temperature: '°F' });
    // Original steps must be untouched (HA passes immutable config objects).
    assert.equal(config.steps[0].value, 12);
    assert.equal(config.unit, '°C');
});

test('generate_scale converts absolute step values when the display unit differs', () => {
    const scales = new HeatmapScales();
    // 12 C -> parseInt(12 * 1.8 + 32) = 53
    const scale = scales.get_scale('indoor temperature', 'temperature', { temperature: '°F' });
    assert.equal(scale.unit, '°F');
    assert.equal(scale.steps[0].value, 53);
});

test('generate_scale leaves values untouched when the units already match', () => {
    const scales = new HeatmapScales();
    const converted = scales.get_scale('indoor temperature', 'temperature', { temperature: '°F' });
    const same = scales.get_scale('indoor temperature', 'temperature', { temperature: '°C' });
    assert.equal(same.unit, '°C');
    assert.notEqual(same.steps[0].value, converted.steps[0].value);
    assert.equal(same.steps[0].value, 12);
});

test('legend_css_by_gradient produces 21 evenly spaced color stops', () => {
    const scales = new HeatmapScales();
    const scale = scales.get_scale('iron red');
    const stops = scale.css.split(', ');
    assert.equal(stops.length, 21);
    assert.match(stops[0], /0%$/);
    assert.match(stops[stops.length - 1], /100%$/);
    // Each stop is "<color> <pct>%".
    for (const stop of stops) {
        assert.match(stop, /^#[0-9a-f]{6} \d+%$/i);
    }
});

test('get_by returns every builtin scale matching a field value', () => {
    const scales = new HeatmapScales();
    const relative = scales.get_by('type', 'relative');
    const expected = BUILTIN_SCALES.filter((s) => s.type === 'relative').length;
    assert.equal(relative.length, expected);
    for (const scale of relative) {
        assert.equal(scale.type, 'relative');
    }
});

test('get_by returns an empty array when nothing matches', () => {
    const scales = new HeatmapScales();
    assert.equal(scales.get_by('key', 'does-not-exist').length, 0);
});

test('temperature conversion helpers round-trip through integer values', () => {
    assert.equal(conversions.temperature['°C']['°F'](0), 32);
    assert.equal(conversions.temperature['°C']['°F'](100), 212);
    assert.equal(conversions.temperature['°F']['°C'](32), 0);
    assert.equal(conversions.temperature['°F']['°C'](212), 100);
});

test('DEVICE_CLASSES temperature entry drives unit-system conversion', () => {
    assert.equal(DEVICE_CLASSES.temperature.unit_system, 'temperature');
    assert.equal(DEVICE_CLASSES.temperature.default, 'outdoor temperature');
});

test('retired scale keys resolve to their replacement instead of throwing', () => {
    const scales = new HeatmapScales();
    for (const [retired, replacement] of Object.entries(SCALE_ALIASES)) {
        const scale = scales.get_scale(retired);
        assert.equal(scale.key, replacement,
            `${retired} should resolve to ${replacement}`);
    }
});

test('retired scale keys are not offered as selectable scales', () => {
    const scales = new HeatmapScales();
    const offered = [
        ...scales.get_by('type', 'absolute'),
        ...scales.get_by('type', 'relative')
    ].map((scale) => scale.key);
    for (const retired of Object.keys(SCALE_ALIASES)) {
        assert.ok(!offered.includes(retired),
            `${retired} should not appear in the scale picker`);
    }
});

test('SCALE_ALIASES never points at another alias', () => {
    // get_scale() only follows one hop, so a chained alias would silently throw.
    for (const replacement of Object.values(SCALE_ALIASES)) {
        assert.ok(!(replacement in SCALE_ALIASES),
            `${replacement} is itself an alias; get_scale only resolves one hop`);
    }
});

test('the hot single-hue scales render dark to hue to pale', () => {
    const scales = new HeatmapScales();
    for (const key of ['red hot', 'blue hot', 'green hot']) {
        const scale = scales.get_scale(key);
        assert.equal(scale.type, 'relative');
        assert.equal(scale.steps.length, 3);
        assert.equal(scale.steps[0].color.toUpperCase(), '#242124');
        assert.match(scale.gradient(0.5).hex(), /^#[0-9a-f]{6}$/i);
        // The top of the ramp must be lighter than the bottom.
        const low = scale.gradient(0).hex();
        const high = scale.gradient(1).hex();
        const luma = (hex) => parseInt(hex.slice(1, 3), 16)
            + parseInt(hex.slice(3, 5), 16) + parseInt(hex.slice(5, 7), 16);
        assert.ok(luma(high) > luma(low), `${key}: expected ${high} lighter than ${low}`);
    }
});
