import { describe, expect, it } from 'vitest';
import { fitWithin, isProbablyImage } from './loadPhoto.ts';

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
