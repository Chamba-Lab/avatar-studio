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

/** Another colour of the same sticker. `color` is the swatch shown to pick it. */
export type StickerVariant = {
  id: string;
  name: string;
  color: string;
  src: string;
};

export type StickerAsset = {
  id: string;
  name: string;
  src: string;
  defaults?: Placement;
  /** Optional colour variants; the sticker's own `src` is the default colour, named by `colorName` and `color`. */
  variants?: StickerVariant[];
  colorName?: string;
  color?: string;
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
