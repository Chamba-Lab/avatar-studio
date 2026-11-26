# Avatar Studio

Decorate your profile picture with frames and stickers, then save it for Discord. Everything runs
in the browser: your photo never leaves your device.

> **Status:** in development, aiming for v1.0 on 12 December with the Christmas, New Year and
> Chamba Lab themes.

## Develop

Requires Node.js 22 or later.

```sh
npm install
npm run dev
```

| Script           | What it does                                      |
| ---------------- | ------------------------------------------------- |
| `npm run dev`    | Local dev server                                  |
| `npm test`       | Unit tests, including the theme and asset checks  |
| `npm run lint`   | Lint with oxlint                                  |
| `npm run format` | Format with Prettier                              |
| `npm run build`  | Type-check and build the static site into `dist/` |

## How themes work

Each theme is a folder in `src/themes/` with a `theme.json` and its images. Adding a sticker or a
theme only touches that folder; the tests validate the data and every asset. See
[docs/theme-schema.md](docs/theme-schema.md) and the art guide in
[design/style-guide.md](design/style-guide.md).

## Contributing

Stickers, frames and whole themes are the easiest way to help. Read
[CONTRIBUTING.md](CONTRIBUTING.md), and [AGENTS.md](AGENTS.md) before changing the editor.

## License

Code: [MIT](LICENSE). Images, Rakim and the Chamba Lab brand: all rights reserved, see
[LICENSE-ASSETS.md](LICENSE-ASSETS.md).
