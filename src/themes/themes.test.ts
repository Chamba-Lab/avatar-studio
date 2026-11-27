import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { isInSeason } from './catalog.ts';

const THEMES_DIR = join(import.meta.dirname);
const KB = 1024;
const id = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'kebab-case');
const monthDay = z.string().regex(/^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/, 'MM-DD');
const placement = z.object({
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  scale: z.number().gt(0).max(1.5),
  rotation: z.number().min(-180).max(180),
});

const themeSchema = z.strictObject({
  schemaVersion: z.literal(1),
  id,
  name: z.string().min(1).max(24),
  icon: z.string().endsWith('.svg'),
  order: z.number().int(),
  season: z.strictObject({ from: monthDay, to: monthDay }).optional(),
  frames: z.array(z.strictObject({ id, name: z.string().min(1).max(24), src: z.string() })),
  stickers: z
    .array(
      z.strictObject({
        id,
        name: z.string().min(1).max(32),
        src: z.string(),
        defaults: placement.optional(),
        tint: z
          .strictObject({
            colors: z.array(z.string().regex(/^#[0-9A-Fa-f]{6}$/, '#RRGGBB')).min(1),
            suggested: z
              .strictObject({
                name: z.string().min(1).max(24),
                color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, '#RRGGBB'),
              })
              .optional(),
          })
          .optional(),
        color: z
          .string()
          .regex(/^#[0-9A-Fa-f]{6}$/, '#RRGGBB')
          .optional(),
      }),
    )
    .min(1),
  credits: z
    .array(z.strictObject({ author: z.string().min(1), assets: z.array(id).min(1) }))
    .min(1),
});

const themeIds = readdirSync(THEMES_DIR).filter((name) =>
  existsSync(join(THEMES_DIR, name, 'theme.json')),
);

/** Reads width/height of a WebP (VP8X / VP8 / VP8L) or PNG without extra dependencies. */
function rasterSize(buf: Buffer): { width: number; height: number; alpha: boolean } {
  if (buf.toString('ascii', 1, 4) === 'PNG') {
    const colorType = buf[25];
    return {
      width: buf.readUInt32BE(16),
      height: buf.readUInt32BE(20),
      alpha: colorType === 6 || colorType === 4,
    };
  }
  const chunk = buf.toString('ascii', 12, 16);
  if (chunk === 'VP8X') {
    return {
      width: 1 + buf.readUIntLE(24, 3),
      height: 1 + buf.readUIntLE(27, 3),
      alpha: (buf[20] & 0x10) !== 0,
    };
  }
  if (chunk === 'VP8L') {
    const bits = buf.readUInt32LE(21);
    return {
      width: (bits & 0x3fff) + 1,
      height: ((bits >> 14) & 0x3fff) + 1,
      alpha: ((bits >> 28) & 1) === 1,
    };
  }
  throw new Error('Unsupported raster format (lossy WebP without alpha is not allowed)');
}

function checkSvg(text: string, file: string) {
  expect(text, `${file}: needs width`).toMatch(/<svg[^>]*\swidth="/);
  expect(text, `${file}: needs height`).toMatch(/<svg[^>]*\sheight="/);
  expect(text, `${file}: needs viewBox`).toMatch(/<svg[^>]*\sviewBox="/);
  for (const banned of ['<foreignObject', '<script', '<text', 'href="http', '<style']) {
    expect(text.includes(banned), `${file}: must not contain ${banned}`).toBe(false);
  }
}

describe.each(themeIds)('theme %s', (themeId) => {
  const dir = join(THEMES_DIR, themeId);
  const raw = JSON.parse(readFileSync(join(dir, 'theme.json'), 'utf8'));

  it('matches the schema', () => {
    const result = themeSchema.safeParse(raw);
    expect(result.error?.issues ?? []).toEqual([]);
  });

  it('uses the folder name as id', () => {
    expect(raw.id).toBe(themeId);
  });

  it('has unique asset ids and credits that point at real assets', () => {
    const ids = [...raw.frames, ...raw.stickers].map((a: { id: string }) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
    const credited = raw.credits.flatMap((c: { assets: string[] }) => c.assets);
    for (const a of credited) expect(ids).toContain(a);
    // A tint can only recolour a vector sticker, and its colours must be in the file.
    for (const s of raw.stickers as Array<{
      id: string;
      src: string;
      tint?: { colors: string[] };
    }>) {
      if (!s.tint) continue;
      expect(s.src.endsWith('.svg'), `${s.id}: only SVG stickers can be tinted`).toBe(true);
      const text = readFileSync(join(dir, s.src), 'utf8').toUpperCase();
      for (const color of s.tint.colors) {
        expect(text.includes(color.toUpperCase()), `${s.id}: ${color} is not in ${s.src}`).toBe(
          true,
        );
      }
    }
  });

  const assets: Array<{ kind: 'frame' | 'sticker' | 'icon'; src: string }> = [
    { kind: 'icon', src: raw.icon },
    ...raw.frames.map((f: { src: string }) => ({ kind: 'frame' as const, src: f.src })),
    ...raw.stickers.map((s: { src: string }) => ({ kind: 'sticker' as const, src: s.src })),
  ];

  it.each(assets)('$kind $src is valid', ({ kind, src }) => {
    const file = join(dir, src);
    expect(existsSync(file), `${src} is missing`).toBe(true);
    const bytes = statSync(file).size;

    if (src.endsWith('.svg')) {
      const limit = kind === 'icon' ? 10 * KB : 100 * KB;
      expect(bytes, `${src} is ${bytes} bytes`).toBeLessThanOrEqual(limit);
      checkSvg(readFileSync(file, 'utf8'), src);
      return;
    }

    expect(kind, 'theme icons must be SVG').not.toBe('icon');
    const { width, height, alpha } = rasterSize(readFileSync(file));
    expect(alpha, `${src} needs an alpha channel`).toBe(true);
    if (kind === 'frame') {
      expect([width, height]).toEqual([1024, 1024]);
      expect(bytes).toBeLessThanOrEqual(400 * KB);
    } else {
      expect(Math.max(width, height)).toBeGreaterThanOrEqual(512);
      expect(bytes).toBeLessThanOrEqual(300 * KB);
    }
  });
});

describe('isInSeason', () => {
  const xmas = { from: '12-01', to: '01-06' };
  it('handles ranges that cross the new year', () => {
    expect(isInSeason(xmas, new Date(2026, 11, 24))).toBe(true);
    expect(isInSeason(xmas, new Date(2027, 0, 3))).toBe(true);
    expect(isInSeason(xmas, new Date(2026, 6, 1))).toBe(false);
  });
  it('handles ranges within one year', () => {
    expect(isInSeason({ from: '10-15', to: '10-31' }, new Date(2026, 9, 20))).toBe(true);
    expect(isInSeason({ from: '10-15', to: '10-31' }, new Date(2026, 10, 1))).toBe(false);
  });
});
