# Sticker and frame style guide

Every sticker and frame must look like it belongs to the same family as Rakim's existing art
(reference: `home/brand/discord/avatar-christmas-1024.png`). Attach that image as a style reference
whenever the tool allows it.

## Style

- Bold, uniform black outline (about 3% of the image width), rounded line ends.
- Flat colors with one soft shade per area; no gradients, no textures, no 3D rendering.
- Palette: Christmas red `#E53935`, deep red `#B71C1C`, cream `#FCF6E8`, pine green `#2E7D32`,
  light green `#43A047`, gold `#F9A825`, soft sky `#90CAF9`, ink `#111111`.
- Cute and slightly cheeky, like a sticker on a laptop. No text, letters or logos.

## Output rules

- Square image, at least 1024 × 1024, one object centered, filling about 80% of the canvas.
- Background: **transparent** if the tool supports it (ChatGPT does). Otherwise a solid flat
  magenta `#FF00FF` with no shadow on it, so it can be removed cleanly.
- No drop shadow on the background, no white sticker border (the app adds effects if needed).

## Base prompt (prepend to every item prompt)

```
Flat vector-style sticker illustration, bold uniform black outlines with rounded ends, flat colors with a single soft shade, cute and slightly cheeky style matching the attached reference character. Palette: red #E53935, deep red #B71C1C, cream #FCF6E8, pine green #2E7D32, gold #F9A825, ink #111111. Single object centered, filling 80% of a square canvas. No text, no letters, no logos, no drop shadow, no white border, no gradients, no 3D.
Background: transparent (if not possible, solid flat magenta #FF00FF).
```

## After generating

1. Remove the background (rakim-studio has a cutout tool) and check edges at 200% zoom.
2. Export as WebP with alpha, longest side 1024 px, ≤ 300 KB.
3. Name the file with the item id from the theme's `prompts.md` (for example `santa-hat.webp`)
   and mark the item as done there.
4. Check the tool's terms: free tiers may add a visible watermark, which disqualifies the image.
