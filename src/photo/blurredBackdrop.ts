import type { LoadedPhoto } from './loadPhoto.ts';

const SIZE = 256;
const BLUR_PX = 14;

/** Draws the photo cover-fit and slightly enlarged, so the blur has no faded edges. */
function drawCover(ctx: CanvasRenderingContext2D, photo: LoadedPhoto, size: number, zoom: number) {
  const side = Math.min(photo.width, photo.height) / zoom;
  const sx = (photo.width - side) / 2;
  const sy = (photo.height - side) / 2;
  ctx.drawImage(photo.canvas, sx, sy, side, side, 0, 0, size, size);
}

/**
 * A soft, blurred cover-fit copy of the photo for the background. Uses the canvas blur filter
 * where it exists; otherwise shrinks to a few pixels and scales back up in smooth steps.
 */
export function blurredBackdrop(photo: LoadedPhoto): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = SIZE;
  const ctx = canvas.getContext('2d');
  if (!ctx) return photo.canvas;
  ctx.imageSmoothingQuality = 'high';

  ctx.filter = `blur(${BLUR_PX}px)`;
  if (ctx.filter.includes('blur')) {
    drawCover(ctx, photo, SIZE, 1.15);
    ctx.filter = 'none';
    return canvas;
  }

  // Fallback: progressive downscale (16 px) then upscale in steps for a smooth result.
  let current = document.createElement('canvas');
  current.width = current.height = 16;
  const small = current.getContext('2d');
  if (!small) return photo.canvas;
  small.imageSmoothingQuality = 'high';
  drawCover(small, photo, 16, 1.15);
  for (const size of [32, 64, 128, SIZE]) {
    const next = size === SIZE ? canvas : document.createElement('canvas');
    next.width = next.height = size;
    const nctx = next.getContext('2d');
    if (!nctx) break;
    nctx.imageSmoothingQuality = 'high';
    nctx.drawImage(current, 0, 0, size, size);
    current = next;
  }
  return canvas;
}
