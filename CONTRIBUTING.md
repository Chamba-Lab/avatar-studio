# Contributing to Avatar Studio

Thanks for helping. This guide explains how to propose changes with as little friction as possible.
Questions are welcome on [Discord](https://chambalab.org/discord).

## Ways to contribute

| I want to...                      | What to do                                                            |
| :-------------------------------- | :-------------------------------------------------------------------- |
| Report something that is broken   | Open an issue with the **Report a bug** template                      |
| Suggest a sticker, frame or theme | Open an issue with the **Propose a sticker or theme** template        |
| Add a sticker, frame or theme     | Open a pull request that touches only that theme's folder (see below) |
| Fix or improve the app            | Create a branch (or a fork) and open a pull request                   |

You don't need permission to fix an obvious bug or typo. For bigger changes (a new feature, a
design change, a new dependency), open an issue or ask on Discord first so nobody duplicates work.

## Set up

Requires **Node.js 22 or later** and npm.

```sh
git clone https://github.com/Chamba-Lab/avatar-studio.git
cd avatar-studio
npm install
npm run dev
```

Read [AGENTS.md](AGENTS.md) before changing the editor: it explains the architecture and the
rules that keep the app simple.

## Workflow

1. Start from an up-to-date `master`. Collaborators create a branch; everyone else forks.
2. Name the branch with a prefix and a short description: `feat/halloween-theme`,
   `fix/export-safari`, `docs/contributing`.
3. Keep commits small: one logical change per commit.
4. Check locally before opening the pull request:
   ```sh
   npm run format:check
   npm run lint
   npm test
   npm run build
   ```
5. Open a pull request against `master` and fill in the template. If the interface changes,
   attach a screenshot (phone and desktop when it applies).
6. A maintainer reviews it. Answer comments with new commits on the same branch.

`master` is protected: nobody pushes to it directly, people or AI agents. Every change goes
through a pull request, and merging deploys the site.

## Commits and pull request titles

We use [Conventional Commits](https://www.conventionalcommits.org/). Pull requests are merged with
squash, so **the pull request title becomes the commit message** and must follow the format too
(a check enforces it).

| Prefix      | When                                            |
| :---------- | :---------------------------------------------- |
| `feat:`     | A new feature or new content (themes, stickers) |
| `fix:`      | A bug fix                                       |
| `docs:`     | Documentation only                              |
| `perf:`     | A performance improvement                       |
| `refactor:` | An internal change with no behavior change      |
| `chore:`    | Maintenance, dependencies, configuration        |

Example: `feat(themes): add a Halloween theme`. Write in English, in the imperative, lower case
after the prefix.

## Adding a sticker, frame or theme

Each theme is a folder in `src/themes/` with a `theme.json`, an icon and its images. Adding art
never touches app code. The format is documented in [docs/theme-schema.md](docs/theme-schema.md).

1. **Follow the style guide**: [design/style-guide.md](design/style-guide.md) has the look (bold
   outline, flat colors, no text) and a base prompt for free image tools. Every theme also has a
   `design/themes/<theme>/prompts.md` with its palette and item list.
2. **Prepare the file**:
   - **SVG** (preferred for simple shapes): with `width`, `height` and `viewBox`; no `<text>`,
     `<style>`, `<script>`, `<foreignObject>` or external links; at most 100 KB.
   - **Sticker image**: WebP or PNG with transparency, at least 512 px on its longest side, at most
     300 KB.
   - **Frame image**: 1024 × 1024 with a transparent center, at most 400 KB. Keep the decoration in
     a ring along the edge (80–100 % of the radius) and nothing in the corners: Discord crops them.
3. **Add it to `theme.json`** with a kebab-case `id`, a short `name`, its `src`, optional
   `defaults` (where it lands on the avatar) and your name in `credits`. If an SVG sticker makes sense
   in other colours, add a `tint` with the colours of its main shape (see the schema).
4. **Run `npm test`**: it validates the JSON and every file (size, format, transparency, SVG
   rules) and fails with a clear message if something is off.
5. **Try it in `npm run dev`** on a real photo and on the Rakim sample, then open the pull request
   with a screenshot.

A new theme also needs an `icon.svg` (24 × 24, at most 10 KB), an `order` and, if it belongs to a
date, a `season` (`MM-DD` range; themes in season are listed first and are never hidden).

### Rights to the art

By contributing a frame, sticker or any other image, you confirm that you made it (or have the
right to submit it) and you assign its rights to Chamba Lab, so it can be covered by the asset
license. Read [LICENSE-ASSETS.md](LICENSE-ASSETS.md) before submitting art. Images made with AI
tools are welcome if the tool's terms let you use and transfer them and they carry no watermark.

## Code style

- Prettier and oxlint are required: `npm run format` fixes formatting.
- TypeScript is strict. Keep editor logic in pure, tested functions (`src/editor/scene.ts`) and
  keep components for rendering.
- Use the design tokens in `src/index.css` (and `src/ui/tokens.ts` where the canvas needs them)
  instead of loose colors.
- Everything runs in the browser: no server, no uploads, no tracking. The photo never leaves the
  device, and that promise is part of the product.

## Review

- Keep it respectful and direct: we review code, not people.
- Small, focused pull requests get reviewed faster.
- Reviewers may ask for changes or suggest alternatives; maintainers make the final call.
