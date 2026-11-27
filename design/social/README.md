# Link preview and home screen icons

`og-image.html` is the source of these files in `public/`:

| File                   | Size       | Used for                                            |
| :--------------------- | :--------- | :-------------------------------------------------- |
| `og-image.png`         | 1200 × 630 | Link preview on Discord and other apps (`og:image`) |
| `icon-512.png`         | 512 × 512  | Home screen icon (web app manifest, maskable)       |
| `icon-192.png`         | 192 × 192  | Home screen icon (web app manifest, maskable)       |
| `apple-touch-icon.png` | 180 × 180  | Home screen icon on iPhone and iPad                 |

To regenerate them after changing the HTML (fonts load from `node_modules`, so run `npm ci` first),
open the file in Playwright and screenshot `#og`, then `#icon` with `zoom` set to `size / 512` for
each icon size. Keep the icon's artwork inside the central 80 % so Android's mask never cuts it.

`og:image` needs an absolute address. It is built from `VITE_SITE_URL` (`.env`, overridden in CI
while the site lives under `github.io/avatar-studio/`). When the custom domain goes live, remove
that override and `BASE_PATH` from `.github/workflows/ci.yml`.
