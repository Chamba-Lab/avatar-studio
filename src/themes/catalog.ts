import type { Placement, Theme, ThemeData } from './types.ts';

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
