import { describe, expect, it } from 'vitest';
import { anyTransparent, fitWithin, isProbablyImage } from './loadPhoto.ts';

describe('fitWithin', () => {
  it('scales the longest side down to the limit', () => {
    expect(fitWithin(4032, 3024, 2048)).toEqual({ width: 2048, height: 1536 });
    expect(fitWithin(3000, 6000, 2048)).toEqual({ width: 1024, height: 2048 });
  });
  it('never upscales', () => {
    expect(fitWithin(800, 600, 2048)).toEqual({ width: 800, height: 600 });
  });
});

describe('isProbablyImage', () => {
  it('accepts image types and HEIC files without a type', () => {
    expect(isProbablyImage(new File([], 'a.jpg', { type: 'image/jpeg' }))).toBe(true);
    expect(isProbablyImage(new File([], 'IMG_1.HEIC', { type: '' }))).toBe(true);
  });
  it('rejects other files', () => {
    expect(isProbablyImage(new File([], 'doc.pdf', { type: 'application/pdf' }))).toBe(false);
  });
});

describe('anyTransparent', () => {
  it('tells a cut-out from an opaque photo', () => {
    expect(anyTransparent(new Uint8ClampedArray([10, 20, 30, 255, 40, 50, 60, 255]))).toBe(false);
    expect(anyTransparent(new Uint8ClampedArray([10, 20, 30, 255, 0, 0, 0, 0]))).toBe(true);
  });
});
