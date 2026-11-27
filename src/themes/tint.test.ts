import { describe, expect, it } from 'vitest';
import { hexToHsl, hslToHex, tintPalette, tintSvg } from './tint.ts';

describe('tint', () => {
  it('round-trips colours through HSL', () => {
    for (const hex of ['#E53935', '#FFD54F', '#90CAF9', '#111111', '#FFFFFF']) {
      expect(hslToHex(hexToHsl(hex))).toBe(hex);
    }
  });

  it('maps the base to the target and keeps shades darker and highlights lighter', () => {
    const palette = tintPalette(['#E53935', '#B71C1C', '#EF6A66'], '#1E88E5');
    expect(palette.get('#E53935')).toBe('#1E88E5');
    const target = hexToHsl('#1E88E5');
    const shade = hexToHsl(palette.get('#B71C1C')!);
    const highlight = hexToHsl(palette.get('#EF6A66')!);
    expect(shade.l).toBeLessThan(target.l);
    expect(highlight.l).toBeGreaterThan(target.l);
    expect(Math.abs(shade.h - target.h)).toBeLessThan(10);
  });

  it('only replaces the listed colours in the SVG', () => {
    const svg = '<path fill="#E53935" stroke="#111"/><path fill="#b71c1c"/><path fill="#FCF6E8"/>';
    const out = tintSvg(svg, ['#E53935', '#B71C1C'], '#FB8C00');
    expect(out).toContain('fill="#FB8C00"');
    expect(out).not.toContain('#b71c1c');
    expect(out).toContain('stroke="#111"');
    expect(out).toContain('fill="#FCF6E8"');
  });
});
