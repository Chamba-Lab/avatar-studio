# Theme schema (proposal, v1)

Status: implemented in `src/themes/` (validated by `src/themes/themes.test.ts`). Last updated 2026-11-25.

## Goals

- Adding a sticker or a theme is a small PR that touches only one folder, with no app code.
- CI rejects a broken theme before it is merged (bad JSON, missing file, oversized or wrong image).
- The format can grow (more themes, contributed stickers, animated GIFs) without rewriting existing themes.

## Two models, kept apart

1. **Theme**: static catalog data, one folder per theme. Describes what can be placed.
2. **Scene**: what the person built in the editor. Plain serializable data, not Konva state.

Konva only renders and edits the scene. Export is a pure function `scene → image`. This split is what makes phase 3 (GIF) possible: the GIF encoder draws the same scene once per frame instead of reading the Konva canvas.

## Theme folder

```
src/themes/
  christmas/
    theme.json
    icon.svg
    frames/wreath.webp
    stickers/santa-hat.webp
  chamba-lab/
    ...
```

Themes are discovered at build time with `import.meta.glob("/src/themes/*/theme.json")`. There is no central registry file to edit, so two contributors adding themes never conflict.

## theme.json

```jsonc
{
  "schemaVersion": 1,
  "id": "christmas", // kebab-case, must equal the folder name
  "name": "Christmas", // short UI label (English)
  "icon": "icon.svg", // theme tab icon, relative to the folder
  "order": 10, // tab order, lower first
  "season": { "from": "12-01", "to": "12-25" }, // optional: listed first in this window; never hidden
  "frames": [{ "id": "wreath", "name": "Wreath", "src": "frames/wreath.webp" }],
  "stickers": [
    {
      "id": "santa-hat",
      "name": "Santa hat",
      "src": "stickers/santa-hat.webp",
      "defaults": { "x": 0.5, "y": 0.2, "scale": 0.45, "rotation": -12 },
    },
    {
      "id": "exclamation",
      "name": "Exclamation",
      "src": "stickers/exclamation.svg",
      // optional colour variants: the sticker's own src is the default colour, named here
      "colorName": "Red",
      "color": "#E53935",
      "variants": [
        {
          "id": "orange",
          "name": "Orange",
          "color": "#FB8C00",
          "src": "stickers/exclamation-orange.svg",
        },
        {
          "id": "white",
          "name": "White",
          "color": "#FCF6E8",
          "src": "stickers/exclamation-white.svg",
        },
      ],
    },
  ],
  "credits": [{ "author": "Chamba Lab", "assets": ["wreath", "santa-hat"] }],
}
```

- **Coordinates are normalized** (0–1 of the canvas side; `scale` is relative to the canvas width), so the same data works for the on-screen preview and the 1024 px export.
- `defaults` is optional; without it a sticker is placed centered at scale 0.4.
- `variants` is optional: other colours of the same sticker, each its own file. `color` is the swatch shown in the editor. A sticker with variants also needs `colorName` and `color` for its default colour, and `default` is reserved as a variant id. Use variants only where a colour changes the meaning (for example alert levels: red, orange, white), not for every sticker.
- An asset's global key is `themeId/assetId` (for example `christmas/santa-hat`), so IDs only have to be unique inside a theme.
- `credits` records who made each asset. CONTRIBUTING states that contributors assign the rights to Chamba Lab.

## Scene (editor state)

```ts
type Scene = {
  version: 1;
  photo: { x: number; y: number; scale: number; rotation: number } | null;
  frame: string | null; // "christmas/wreath"
  stickers: Array<{
    uid: string; // instance id; the same sticker can be added twice
    ref: string; // "christmas/santa-hat"
    x: number;
    y: number;
    scale: number;
    rotation: number;
    flipX: boolean;
    behindPhoto?: true; // drawn under the photo, over the background
    variant?: string; // id of a colour variant; absent = default colour
  }>; // array order = z-order (last is on top) inside each group: behind the photo, then over it
};
```

The photo itself (a decoded bitmap) is held outside the scene, because it never leaves the device and is not serializable.

Drawing order: background, stickers behind the photo, photo, frame, the other stickers. The editor only offers "Behind the photo" when the sticker would still show: the photo has transparent pixels (a cut-out) or no longer covers the canvas. On a cut-out photo, only its visible pixels catch taps, so stickers behind it stay selectable.

## Asset rules (enforced by a Vitest check in CI)

| Asset               | Format                 | Size                            | Other                                                                                                                                                       |
| ------------------- | ---------------------- | ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sticker (raster)    | WebP or PNG with alpha | longest side ≥ 512 px, ≤ 300 KB | transparent background, no text                                                                                                                             |
| Sticker (vector)    | SVG                    | ≤ 100 KB                        | square `viewBox` plus explicit `width` and `height`; no `<text>` (letters are drawn as paths), `<style>`, `<foreignObject>`, scripts or external references |
| Frame (illustrated) | WebP or PNG with alpha | exactly 1024 × 1024, ≤ 400 KB   | transparent circular center; decoration in the outer ring, inside the circle                                                                                |
| Frame (vector)      | SVG                    | ≤ 100 KB                        | same layout rules and SVG restrictions as vector stickers                                                                                                   |
| Theme icon          | SVG                    | ≤ 10 KB                         | readable at 24 px                                                                                                                                           |

The check also verifies that `id` matches the folder, IDs are unique, every `src` exists and `schemaVersion` is known. The schema is written with Zod as a dev dependency, so it adds nothing to the bundle.

## How it grows

- **Phase 2 (more themes, contributions):** no format change. A theme is a folder; the issue template collects the same fields as `theme.json`.
- **Phase 3 (GIF):** a sticker gains an optional `animated` source. Old themes stay valid. Any breaking change bumps `schemaVersion` with a small migration.
- **Not now:** translations of `name`, per-theme colors, remote themes. Add them only when needed.

## Decisions (2026-11-25)

- `season` stays.
- Frames and stickers from different themes can be mixed freely in one scene.
- Frames can be illustrated raster images, not only SVG, so they match the sticker art. Prompts for generating assets live in `design/` (see `design/style-guide.md`), not in `src/`.
