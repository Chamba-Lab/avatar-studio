# Logo, link preview and home screen icons

## Logo

The mark is Rakim's coffee mug from the chambalab.org logo, as a die-cut sticker caught mid-edit
inside the editor's own selection: peach dashed bounds, cream handles and the rotate knob (the same
colours as the Konva transformer in `src/editor/AvatarStage.tsx`). The sources are in `logo/`:

| File                     | Use                                                                     |
| :----------------------- | :---------------------------------------------------------------------- |
| `logo/icon.svg`          | The full mark: app icon, link preview and anywhere at 40 px or more     |
| `logo/icon-small.svg`    | Favicon and sizes under 40 px: the mug only, the handles would be noise |
| `logo/icon-maskable.svg` | Android maskable icon and iPhone home screen: the mark at 80 % on ink   |

`public/favicon.svg` is a copy of `logo/icon-small.svg`.

## Generated files in `public/`

| File                    | Size       | Source                                 |
| :---------------------- | :--------- | :------------------------------------- |
| `og-image.png`          | 1200 × 630 | `og-image.html`, element `#og`         |
| `icon-512.png`          | 512 × 512  | `icons.html`, `logo/icon.svg`          |
| `icon-192.png`          | 192 × 192  | `icons.html`, `logo/icon.svg`          |
| `icon-maskable-512.png` | 512 × 512  | `icons.html`, `logo/icon-maskable.svg` |
| `apple-touch-icon.png`  | 180 × 180  | `icons.html`, `logo/icon-maskable.svg` |

To regenerate them (fonts load from `node_modules`, so run `npm ci` first), open each HTML file in
Playwright and screenshot the element with the same id as the file name.

`og:image` needs an absolute address. It is built from `VITE_SITE_URL` (`.env`, overridden in CI
while the site lives under `github.io/avatar-studio/`). When the custom domain goes live, remove
that override and `BASE_PATH` from `.github/workflows/ci.yml`.
