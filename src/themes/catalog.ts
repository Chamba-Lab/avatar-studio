import type { Placement, StickerVariant, Theme, ThemeData } from './types.ts';

const themeFiles = import.meta.glob<ThemeData>('./*/theme.json', {
  eager: true,
  import: 'default',
});
const assetUrls = import.meta.glob<string>('./*/**/*.{svg,webp,png}', {
  eager: true,
  query: '?url',
  import: 'default',
});

const DEFAULT_PLACEMENT: Placement = { x: 0.5, y: 0.5, scale: 0.4, rotation: 0 };

function resolve(themeId: string, path: string): string {
  const url = assetUrls[`./${themeId}/${path}`];
  if (!url) throw new Error(`Theme "${themeId}" references a missing file: ${path}`);
  return url;
}

function loadThemes(): Theme[] {
  return Object.values(themeFiles).map(({ icon, ...data }) => ({
    ...data,
    iconUrl: resolve(data.id, icon),
    frames: data.frames.map((f) => ({ ...f, src: resolve(data.id, f.src) })),
    stickers: data.stickers.map((s) => ({
      ...s,
      src: resolve(data.id, s.src),
      variants: s.variants?.map((v) => ({ ...v, src: resolve(data.id, v.src) })),
      defaults: s.defaults ?? DEFAULT_PLACEMENT,
    })),
  }));
}

/** "MM-DD" range check that also handles ranges crossing the new year (12-01 → 01-06). */
export function isInSeason(season: Theme['season'], today: Date): boolean {
  if (!season) return false;
  const md = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  return season.from <= season.to
    ? md >= season.from && md <= season.to
    : md >= season.from || md <= season.to;
}

/** Themes in season first, then by `order`. */
export function sortThemes(themes: Theme[], today: Date): Theme[] {
  return [...themes].sort((a, b) => {
    const seasonDiff = Number(isInSeason(b.season, today)) - Number(isInSeason(a.season, today));
    return seasonDiff || a.order - b.order;
  });
}

export const themes: Theme[] = sortThemes(loadThemes(), new Date());

/** Global asset key, e.g. "christmas/santa-hat". */
export const assetKey = (themeId: string, assetId: string) => `${themeId}/${assetId}`;

export type AssetInfo = {
  key: string;
  themeId: string;
  name: string;
  src: string;
  kind: 'frame' | 'sticker';
  /** Colour variants of a sticker, with resolved URLs. The first one is the default colour. */
  variants?: StickerVariant[];
};

/** Every frame and sticker by its global key, so a scene can mix assets from any theme. */
export const assets: ReadonlyMap<string, AssetInfo> = new Map(
  themes.flatMap((t) => [
    ...t.frames.map((f): [string, AssetInfo] => [
      assetKey(t.id, f.id),
      { key: assetKey(t.id, f.id), themeId: t.id, name: f.name, src: f.src, kind: 'frame' },
    ]),
    ...t.stickers.map((s): [string, AssetInfo] => [
      assetKey(t.id, s.id),
      {
        key: assetKey(t.id, s.id),
        themeId: t.id,
        name: s.name,
        src: s.src,
        kind: 'sticker',
        variants: s.variants && [
          {
            id: 'default',
            name: s.colorName ?? 'Default',
            color: s.color ?? '#ffffff',
            src: s.src,
          },
          ...s.variants,
        ],
      },
    ]),
  ]),
);

/** The image to draw for a sticker instance: its variant's file, or the default one. */
export function stickerSrc(ref: string, variant?: string): string | undefined {
  const info = assets.get(ref);
  return info?.variants?.find((v) => v.id === variant)?.src ?? info?.src;
}
