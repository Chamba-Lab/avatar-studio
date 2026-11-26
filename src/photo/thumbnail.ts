import type { LoadedPhoto } from './loadPhoto.ts';

/**
 * A small square, cover-cropped JPEG of the photo for previews in the panel (frame tiles, the
 * blurred-background swatch). Encoding the full 2048 px photo there cost hundreds of KB per open.
 */
export function photoThumbnail(photo: LoadedPhoto, size = 160): string {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return photo.canvas.toDataURL('image/jpeg', 0.6);
  ctx.imageSmoothingQuality = 'high';
  const side = Math.min(photo.width, photo.height);
  ctx.drawImage(
    photo.canvas,
    (photo.width - side) / 2,
    (photo.height - side) / 2,
    side,
    side,
    0,
    0,
    size,
    size,
  );
  return canvas.toDataURL('image/jpeg', 0.8);
}
