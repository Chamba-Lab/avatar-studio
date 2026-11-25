# Chamba Lab: asset prompts

Final files go to `src/themes/chamba-lab/stickers/` with the id as file name. See
`design/style-guide.md` for the shared rules.

| Id             | Method       | Status  | Notes                                                                   |
| -------------- | ------------ | ------- | ----------------------------------------------------------------------- |
| `rakim`        | Existing art | in repo | From `rakim-pngtuber/sprites/sticker/1-boca-cerrada.png`                |
| `rakim-sleepy` | Existing art | in repo | From `rakim-pngtuber/sprites/sticker/3-parpadeo-boca-cerrada.png`       |
| `lab-badge`    | SVG (Claude) | in repo |                                                                         |
| `coffee`       | SVG (Claude) | in repo | Redrawn 2026-11-25                                                      |
| `laptop`       | SVG (Claude) | in repo |                                                                         |
| `git-branch`   | SVG (Claude) | in repo |                                                                         |
| `bug`          | SVG (Claude) | in repo |                                                                         |
| `rocket`       | SVG (Claude) | in repo |                                                                         |
| `rakim-peek`   | Generate     | todo    | Rakim peeking up from the bottom edge of the avatar. Full prompt below. |

## rakim-peek

Attach `rakim-pngtuber/sprites/sticker/1-boca-cerrada.png` as the character reference.

```
Generate 4 different variations (separate images).
Create a single sticker illustration of the attached character (a fluffy black-and-white raccoon-like mascot called Rakim with sleepy, unimpressed eyes) PEEKING UP from below: only the top of the head, the eyes and two small paws gripping an invisible edge are visible, as if he were climbing into a round profile picture from its bottom edge. The bottom of the drawing is a clean straight horizontal cut (where the edge would be). Same face, fur shapes and expression as the reference.
Style: match the reference exactly: bold black fur shapes with cream highlights, flat colors, and the same thick golden-yellow (#FACC15) sticker outline around the whole silhouette. No gradients, no 3D, no text, no drop shadow.
Composition: centered horizontally, filling about 80% of the width of a square 1024x1024 canvas, the straight cut at about 75% of the height.
Background: fully transparent. If transparency is not possible, a solid flat magenta #FF00FF background with nothing else on it.
```
