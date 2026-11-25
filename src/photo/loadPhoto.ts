/** Longest side kept after loading. Enough for a 1024 px export with room to zoom, and safe for iOS canvas memory. */
export const MAX_PHOTO_SIDE = 2048;

export type LoadedPhoto = {
  /** Changes with every loaded photo. */
  id: string;
  /** Decoded, upright (EXIF applied) and downscaled bitmap. Never leaves the device. */
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
};

export type PhotoErrorReason = 'not-an-image' | 'heic-unsupported' | 'decode-failed';

export class PhotoError extends Error {
  readonly reason: PhotoErrorReason;
  constructor(reason: PhotoErrorReason) {
    super(reason);
    this.reason = reason;
  }
}

const HEIC = /\.(heic|heif)$/i;

export function isProbablyImage(file: File): boolean {
  return file.type.startsWith('image/') || HEIC.test(file.name);
}

/** Size that fits `max` on the longest side, never upscaling. */
export function fitWithin(width: number, height: number, max: number) {
  const ratio = Math.min(1, max / Math.max(width, height));
  return { width: Math.round(width * ratio), height: Math.round(height * ratio) };
}

async function decode(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if ('createImageBitmap' in window) {
    try {
      // `from-image` applies the EXIF orientation, so phone photos come out upright.
      return await createImageBitmap(file, { imageOrientation: 'from-image' });
    } catch {
      // Some browsers reject the options object or the format here; fall through to <img>.
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = 'async';
    img.src = url;
    await img.decode();
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function loadPhoto(file: File): Promise<LoadedPhoto> {
  if (!isProbablyImage(file)) throw new PhotoError('not-an-image');

  let source: ImageBitmap | HTMLImageElement;
  try {
    source = await decode(file);
  } catch {
    const heic = HEIC.test(file.name) || /hei[cf]/i.test(file.type);
    throw new PhotoError(heic ? 'heic-unsupported' : 'decode-failed');
  }

  const naturalWidth = 'naturalWidth' in source ? source.naturalWidth : source.width;
  const naturalHeight = 'naturalHeight' in source ? source.naturalHeight : source.height;
  const { width, height } = fitWithin(naturalWidth, naturalHeight, MAX_PHOTO_SIDE);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new PhotoError('decode-failed');
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(source, 0, 0, width, height);
  if ('close' in source) source.close();

  return { id: crypto.randomUUID(), canvas, width, height };
}
