/** Placement in normalized canvas units: x/y are 0–1 of the side, scale is relative to the width. */
export type Placement = {
  x: number;
  y: number;
  scale: number;
  rotation: number;
};

export type FrameAsset = {
  id: string;
  name: string;
  src: string;
};

/**
 * A vector sticker that can be recoloured. `colors` are the hex colours of its main shape as written
 * in the SVG: the first is the base, the rest its shades and highlights (they follow the base).
 * `suggested` is one extra colour offered next to the original and the free picker.
 */
export type StickerTint = {
  colors: string[];
  suggested?: { name: string; color: string };
};

export type StickerAsset = {
  id: string;
  name: string;
  src: string;
  defaults?: Placement;
  /** Optional: lets people recolour a vector sticker. */
  tint?: StickerTint;
};

/** Shape of a theme.json file. See docs/theme-schema.md. */
export type ThemeData = {
  schemaVersion: 1;
  id: string;
  name: string;
  icon: string;
  order: number;
  season?: { from: string; to: string };
  frames: FrameAsset[];
  stickers: StickerAsset[];
  credits: Array<{ author: string; assets: string[] }>;
};

/** A theme with every asset path resolved to a URL the browser can load, and defaults filled in. */
export type Theme = Omit<ThemeData, 'icon' | 'stickers'> & {
  iconUrl: string;
  stickers: Array<StickerAsset & { defaults: Placement }>;
};
