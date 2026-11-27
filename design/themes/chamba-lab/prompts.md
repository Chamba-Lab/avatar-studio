# Chamba Lab: asset prompts

Final files go to `src/themes/chamba-lab/stickers/` with the id as file name. See
`design/style-guide.md` for the shared rules.

| Id                                                                       | Method       | Status  | Notes                                                                                                                       |
| ------------------------------------------------------------------------ | ------------ | ------- | --------------------------------------------------------------------------------------------------------------------------- |
| `rakim-chibi`, `rakim-chibi-wave`, `rakim-chibi-sit`, `rakim-chibi-arms` | Generate     | in repo | Chibi set, 2026-11-25. Temporary: about 460 px sources from a 2x2 grid; regenerate one pose per request at full resolution. |
| `rakim`                                                                  | Existing art | in repo | Logo style. From `rakim-pngtuber/sprites/sticker/1-boca-cerrada.png`                                                        |
| `rakim-sleepy`                                                           | Existing art | in repo | Logo style. From `rakim-pngtuber/sprites/sticker/3-parpadeo-boca-cerrada.png`                                               |
| `lab-badge`                                                              | SVG (Claude) | in repo |                                                                                                                             |
| `coffee-ring`                                                            | SVG (Claude) | in repo | Frame: cream ring, coffee beans and a cup, 2026-11-26                                                                       |
| `coffee`                                                                 | SVG (Claude) | in repo | Redrawn 2026-11-25                                                                                                          |
| `laptop`                                                                 | SVG (Claude) | in repo |                                                                                                                             |
| `git-branch`                                                             | SVG (Claude) | in repo |                                                                                                                             |
| `bug`                                                                    | SVG (Claude) | in repo |                                                                                                                             |
| `rocket`                                                                 | SVG (Claude) | in repo |                                                                                                                             |
| `rakim-peek`                                                             | Generate     | todo    | Rakim peeking up from the bottom edge of the avatar. Full prompt below.                                                     |

## rakim-peek

Attach `rakim-pngtuber/sprites/sticker/1-boca-cerrada.png` as the character reference.

```
Generate 4 different variations (separate images).
Create a single sticker illustration of the attached character (a fluffy black-and-white raccoon-like mascot called Rakim with sleepy, unimpressed eyes) PEEKING UP from below: only the top of the head, the eyes and two small paws gripping an invisible edge are visible, as if he were climbing into a round profile picture from its bottom edge. The bottom of the drawing is a clean straight horizontal cut (where the edge would be). Same face, fur shapes and expression as the reference.
Style: match the reference exactly: bold black fur shapes with cream highlights, flat colors, and the same thick golden-yellow (#FACC15) sticker outline around the whole silhouette. No gradients, no 3D, no text, no drop shadow.
Composition: centered horizontally, filling about 80% of the width of a square 1024x1024 canvas, the straight cut at about 75% of the height.
Background: fully transparent. If transparency is not possible, a solid flat magenta #FF00FF background with nothing else on it.
```

## Chibi Rakim set (direction chosen 2026-11-25)

Rakim stickers move to a chibi "keychain charm" style, closer to the 3D Rakim than to the logo. Once
the set exists, the logo-style `rakim` and `rakim-sleepy` stickers are replaced so only one Rakim
style ships. Generate **one pose per request** so each image comes out at full resolution (a 2x2 grid
leaves each sticker at about 500 px).

Attach two references: `rakim-studio/assets/rakim/rakim-saluda-recorte.webp` (the character) and
`src/themes/chamba-lab/stickers/rakim-peek.webp` (the line and color style).

Base prompt (replace `[POSE]` with one line from the table):

```
Generate 4 different variations (separate images).
Create a single chibi sticker of the attached raccoon character, Rakim, in the style of a cute acrylic keychain charm: oversized round head (about 60% of the height), tiny soft body, short stubby limbs, sleepy half-closed eyes with an unimpressed look, small black nose. Keep his identity from the reference: dark slate-grey fur, cream face mask and eyebrow band, dark eye patches, cream-tipped pointed ears, striped tail.
Pose: [POSE]
Style: clean vector-like illustration matching the second reference: simple shapes, a thin dark outline (#111111) inside, flat colors with one soft cel shade, a subtle glossy highlight like acrylic, and a thick golden-yellow (#F2B21B) sticker border around the whole silhouette. No gradients on the background, no text, no drop shadow, no realistic fur.
Composition: one character centered, filling about 85% of a square 1024x1024 canvas.
Background: fully transparent. If transparency is not possible, a solid flat magenta #FF00FF background with nothing else on it.
```

| Id                   | [POSE]                                                                                        |
| -------------------- | --------------------------------------------------------------------------------------------- |
| `rakim-chibi-wave`   | standing, waving with one paw, the other paw relaxed                                          |
| `rakim-chibi-coffee` | holding a big cream coffee mug with both paws, a little steam above it                        |
| `rakim-chibi-laptop` | sitting cross-legged typing on a tiny laptop, unbothered                                      |
| `rakim-chibi-sleep`  | curled up asleep, tail wrapped around, a small "z" bubble drawn as a shape, not text          |
| `rakim-chibi-ok`     | giving a thumbs-up (paw) with a tiny smirk                                                    |
| `rakim-chibi-santa`  | standing in a small Santa hat and red scarf, holding a candy cane (for the Christmas theme)   |
| `rakim-peek`         | peeking up from below: only the head and two paws gripping a straight bottom edge are visible |
