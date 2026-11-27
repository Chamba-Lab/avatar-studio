/**
 * Recolouring vector stickers. A sticker that can be tinted lists the colours of its main shape in
 * `tint.colors`: the first is the base, the rest are its shades and highlights. Tinting replaces the
 * base with the chosen colour and moves every shade by the same hue, saturation and lightness
 * distance it had from the base, so the drawing keeps its depth in any colour.
 */

type Hsl = { h: number; s: number; l: number };

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export function hexToHsl(hex: string): Hsl {
  const n = parseInt(hex.slice(1), 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h =
    max === r
      ? ((g - b) / d + (g < b ? 6 : 0)) / 6
      : max === g
        ? ((b - r) / d + 2) / 6
        : ((r - g) / d + 4) / 6;
  return { h: h * 360, s, l };
}

export function hslToHex({ h, s, l }: Hsl): string {
  const hue = (((h % 360) + 360) % 360) / 360;
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const channel = (t: number) => {
    const x = t < 0 ? t + 1 : t > 1 ? t - 1 : t;
    const v =
      x < 1 / 6
        ? p + (q - p) * 6 * x
        : x < 1 / 2
          ? q
          : x < 2 / 3
            ? p + (q - p) * (2 / 3 - x) * 6
            : p;
    return Math.round(clamp(v, 0, 1) * 255)
      .toString(16)
      .padStart(2, '0');
  };
  const rgb =
    s === 0
      ? [l, l, l].map((v) =>
          Math.round(v * 255)
            .toString(16)
            .padStart(2, '0'),
        )
      : [channel(hue + 1 / 3), channel(hue), channel(hue - 1 / 3)];
  return `#${rgb.join('')}`.toUpperCase();
}

/** The colours `colors` become when the base (`colors[0]`) turns into `target`. */
export function tintPalette(colors: string[], target: string): Map<string, string> {
  const base = hexToHsl(colors[0]);
  const to = hexToHsl(target);
  return new Map(
    colors.map((c, i) => {
      if (i === 0) return [c.toUpperCase(), target.toUpperCase()];
      const own = hexToHsl(c);
      return [
        c.toUpperCase(),
        hslToHex({
          h: to.h + (own.h - base.h),
          s: clamp(to.s + (own.s - base.s), 0, 1),
          l: clamp(to.l + (own.l - base.l), 0, 1),
        }),
      ];
    }),
  );
}

/** Returns the SVG text with its tint colours swapped for `target` and its derived shades. */
export function tintSvg(svg: string, colors: string[], target: string): string {
  const palette = tintPalette(colors, target);
  return svg.replace(/#[0-9a-fA-F]{6}\b/g, (hex) => palette.get(hex.toUpperCase()) ?? hex);
}
