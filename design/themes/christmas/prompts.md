# Christmas: asset prompts

Prepend the base prompt from `design/style-guide.md` to each item. Final files go to
`src/themes/christmas/stickers/` or `src/themes/christmas/frames/` with the id as file name.

Method: **SVG (Claude)** is drawn in code by Claude, following the style guide (a first draft of each exists in the mockup); **Generate** needs an image model, with the full prompt from the section below; **Cutout** comes from existing art.

Priority: **P1** is needed for the 12 Dec release; **P2** can follow.

## Stickers

| Id                 | Priority | Method       | Status                     | Item prompt                                                                                                                                              |
| ------------------ | -------- | ------------ | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `santa-hat`        | P1       | SVG (Claude) | draft in repo              | A classic Santa hat seen from the front-left, slightly tilted, red with a fluffy cream brim and pompom, shaped to sit on top of a head.                  |
| `elf-hat`          | P2       | SVG (Claude) | draft in repo              | A pointy green elf hat with a red-and-cream striped brim and a small gold bell at the tip, curving to one side.                                          |
| `reindeer-antlers` | P1       | Generate     | approved                   | A headband with two brown reindeer antlers and small red ribbons, seen from the front, symmetrical, to sit on top of a head.                             |
| `scarf`            | P1       | Generate     | approved (v2, variation 1) | A cozy red knitted scarf with cream stripes and two small snowflake patterns, wrapped in a loop with both ends hanging to one side, as if around a neck. |
| `snowflakes`       | P1       | SVG (Claude) | draft in repo              | A small cluster of three snowflakes of different sizes, cream with sky-blue accents, with a couple of tiny sparkles.                                     |
| `string-lights`    | P1       | SVG (Claude) | draft in repo              | A gently curved string of Christmas lights with seven glowing bulbs in red, gold and green on a dark wire, arc shape.                                    |
| `gift-box`         | P1       | SVG (Claude) | draft in repo              | A small gift box, pine green with a gold ribbon and a big bow on top.                                                                                    |
| `hot-cocoa`        | P1       | SVG (Claude) | draft in repo              | A cream mug of hot chocolate with marshmallows and steam curls, a small candy cane leaning on the rim.                                                   |
| `candy-cane`       | P2       | SVG (Claude) | draft in repo              | A single candy cane with red and cream stripes, slightly tilted.                                                                                         |
| `mistletoe`        | P2       | Generate     | todo                       | A sprig of mistletoe with three leaves, white berries and a small red bow.                                                                               |
| `mini-tree`        | P2       | SVG (Claude) | draft in repo              | A small round Christmas tree with a gold star on top and a few red and gold baubles.                                                                     |
| `sparkles`         | P1       | SVG (Claude) | draft in repo              | Three four-point sparkles of different sizes in gold, like the ones next to the reference character.                                                     |
| `rakim-santa`      | P1       | Cutout       | todo                       | Not generated: cut out Rakim from `home/brand/discord/avatar-christmas-1024.png` (remove the cream background).                                          |

## Frames

Frames are full 1024 × 1024 images with a **transparent circular center**. Decoration stays in a
ring between 80% and 100% of the circle's radius, so it frames the face without covering it, and
nothing goes outside the circle (Discord crops the corners).

Frame base prompt (use instead of the sticker base prompt's composition line):

```
Circular decorative frame for a profile picture, 1024x1024. The center is completely empty and transparent (a clean circle about 80% of the canvas diameter). All decoration forms a ring along the edge of the circle; nothing in the four corners outside the circle.
```

| Id            | Priority | Method       | Status                                                                              | Item prompt                                                                                                     |
| ------------- | -------- | ------------ | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `wreath`      | P1       | Generate     | approved (opening ~63%, thicker than spec; accepted, the photo is adjusted instead) | A full Christmas wreath ring of pine branches with red berries, small gold baubles and a red bow at the bottom. |
| `lights-ring` | P1       | SVG (Claude) | draft in repo                                                                       | A ring of Christmas string lights following the circle, bulbs in red, gold and green, with a soft glow.         |
| `snow-ring`   | P2       | Generate     | todo                                                                                | A ring of soft snow and snowflakes, thicker at the bottom like a snowbank, with a few sparkles.                 |

## Full prompts for the "Generate" items

Self-contained: paste as is and attach `home/brand/discord/avatar-christmas-1024.png` as the style
reference. The prompts ask for 4 variations; tools that return one image per request need to be run again. Keep the one whose outline and colors match Rakim best.

### reindeer-antlers (P1)

```
Generate 4 different variations (separate images).
Create a single sticker illustration: a headband with two reindeer antlers, seen straight from the front, symmetrical, designed to sit on top of someone's head in a profile picture. Warm brown antlers (#8D5A3B with a lighter #B07A52 shade) with three rounded tines each, a thin dark-red headband (#B71C1C) and a small red bow (#E53935) at the base of each antler.
Style: match the attached reference character exactly: bold uniform black outlines (#111111) with rounded ends, flat colors with one soft shade per area, cute and slightly cheeky, sticker look. No gradients, no textures, no 3D, no text, no drop shadow, no white sticker border.
Composition: one object centered, filling about 80% of a square 1024x1024 canvas, the headband at the bottom so it can rest on a head.
Background: fully transparent. If transparency is not possible, a solid flat magenta #FF00FF background with nothing else on it.
```

### scarf (P1)

```
Generate 4 different variations (separate images).
Create a single sticker illustration: a cozy knitted scarf AS WORN around a neck, seen straight from the front, as if the wearer were invisible. The scarf wraps the neck once: only the front part of the loop is visible, curving in a gentle U across the lower half of the image; the back of the loop is hidden behind the (invisible) neck, so there is NO visible hole or ring seen from above. Both ends hang down in front, slightly to the right, one overlapping the other. Christmas red (#E53935, shade #B71C1C) with two cream stripes (#FCF6E8) near each end, one small cream snowflake motif on each end, short cream fringe at the tips, a few simple knit ridge lines.
Reference: the scarf worn by the attached character is exactly the pose and perspective wanted; draw the same kind of scarf on its own.
Style: match the attached reference character exactly: bold uniform black outlines (#111111) with rounded ends, flat colors with one soft shade per area, sticker look. No gradients, no realistic texture, no 3D, no text, no drop shadow, no white sticker border, no neck or body drawn.
Composition: centered horizontally, filling about 85% of the width of a square 1024x1024 canvas; the top edge of the scarf sits around the middle of the canvas.
Background: fully transparent. If transparency is not possible, a solid flat magenta #FF00FF background with nothing else on it.
```

### wreath frame (P1)

```
Generate 4 different variations (separate images).
Create a circular Christmas wreath frame for a profile picture, 1024x1024.
The center must be completely empty and transparent: a clean circle about 80% of the canvas diameter, so a face shows through. All decoration forms a ring along the edge of the circle; nothing in the four corners outside the circle.
The ring: pine branches in two greens (#2E7D32 and #43A047) all the way around, clusters of red berries (#E53935), a few small gold baubles (#F9A825), and a red bow with hanging ribbons centered at the bottom.
Style: match the attached reference character: bold uniform black outlines (#111111) with rounded ends, flat colors with one soft shade, simple stylized needles (not realistic), sticker look. No gradients, no 3D, no text, no drop shadow.
Background: fully transparent outside the ring and in the center. If transparency is not possible, solid flat magenta #FF00FF in those areas.
```

### mistletoe (P2)

```
Generate 4 different variations (separate images).
Create a single sticker illustration: a sprig of mistletoe with three rounded leaves (#43A047, shade #2E7D32), a cluster of four white berries (#FCF6E8) and a small red bow (#E53935) at the top. Style: match the attached reference character: bold uniform black outlines (#111111) with rounded ends, flat colors with one soft shade, sticker look. No gradients, no 3D, no text, no drop shadow, no white border. One object centered, about 80% of a square 1024x1024 canvas. Background: fully transparent, or solid flat magenta #FF00FF if transparency is not possible.
```

### snow-ring frame (P2)

```
Generate 4 different variations (separate images).
Create a circular frame for a profile picture, 1024x1024, with a completely empty transparent circular center (about 80% of the canvas diameter). The ring is soft snow (#FCF6E8 with pale blue #90CAF9 shading), thicker at the bottom like a snowbank, with a few cream snowflakes and three gold four-point sparkles (#F9A825) along the top. Nothing outside the circle. Style: match the attached reference character: bold uniform black outlines (#111111), flat colors with one soft shade, sticker look. No gradients, no 3D, no text. Background: transparent, or solid flat magenta #FF00FF in the center and corners if transparency is not possible.
```
