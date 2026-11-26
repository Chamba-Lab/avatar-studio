import { describe, expect, it } from 'vitest';
import {
  applyAction,
  copyToRemove,
  freeSpot,
  createHistory,
  emptyScene,
  historyReducer,
  MAX_PHOTO_SCALE,
  MAX_STICKER_SCALE,
  MIN_PHOTO_SCALE,
  stickerTileTap,
} from './scene.ts';

const hat = { x: 0.5, y: 0.2, scale: 0.4, rotation: -10 };

const withHat = () =>
  applyAction(emptyScene(), {
    type: 'addSticker',
    uid: 'a',
    ref: 'christmas/santa-hat',
    placement: hat,
  });

describe('applyAction', () => {
  it('adds stickers on top, unflipped', () => {
    const scene = applyAction(withHat(), {
      type: 'addSticker',
      uid: 'b',
      ref: 'christmas/scarf',
      placement: hat,
    });
    expect(scene.stickers.map((s) => s.uid)).toEqual(['a', 'b']);
    expect(scene.stickers[1].flipX).toBe(false);
  });

  it('clamps sticker scale and normalizes rotation', () => {
    const scene = applyAction(withHat(), {
      type: 'updateSticker',
      uid: 'a',
      patch: { scale: 9, rotation: 370 },
    });
    expect(scene.stickers[0].scale).toBe(MAX_STICKER_SCALE);
    expect(scene.stickers[0].rotation).toBe(10);
  });

  it('duplicates with an offset and brings a sticker to the front', () => {
    let scene = applyAction(withHat(), { type: 'duplicateSticker', uid: 'a', newUid: 'b' });
    expect(scene.stickers[1]).toMatchObject({ uid: 'b', x: 0.56, y: 0.26 });
    scene = applyAction(scene, { type: 'bringToFront', uid: 'a' });
    expect(scene.stickers.map((s) => s.uid)).toEqual(['b', 'a']);
  });

  it('flips and removes', () => {
    let scene = applyAction(withHat(), { type: 'flipSticker', uid: 'a' });
    expect(scene.stickers[0].flipX).toBe(true);
    scene = applyAction(scene, { type: 'removeSticker', uid: 'a' });
    expect(scene.stickers).toEqual([]);
  });

  it('keeps the photo scale within limits and clear keeps the photo framing', () => {
    let scene = applyAction(emptyScene(), { type: 'updatePhoto', patch: { scale: 20, x: 0.3 } });
    expect(scene.photo.scale).toBe(MAX_PHOTO_SCALE);
    scene = applyAction({ ...scene, frame: 'christmas/wreath' }, { type: 'clear' });
    expect(scene.frame).toBeNull();
    expect(scene.photo.x).toBe(0.3);
  });
});

describe('background', () => {
  it('defaults to a blurred photo and can be changed', () => {
    expect(emptyScene().background).toEqual({ kind: 'blur' });
    const scene = applyAction(emptyScene(), {
      type: 'setBackground',
      background: { kind: 'color', color: '#fcf6e8' },
    });
    expect(scene.background).toEqual({ kind: 'color', color: '#fcf6e8' });
  });

  it('lets the photo zoom out below cover, down to the minimum', () => {
    const scene = applyAction(emptyScene(), { type: 'updatePhoto', patch: { scale: 0.1 } });
    expect(scene.photo.scale).toBe(MIN_PHOTO_SCALE);
  });
});

describe('historyReducer', () => {
  it('undoes and redoes committed actions', () => {
    let h = createHistory(emptyScene());
    h = historyReducer(h, {
      type: 'commit',
      action: { type: 'setFrame', frame: 'christmas/wreath' },
    });
    h = historyReducer(h, { type: 'commit', action: { type: 'setFrame', frame: null } });
    h = historyReducer(h, { type: 'undo' });
    expect(h.present.frame).toBe('christmas/wreath');
    h = historyReducer(h, { type: 'redo' });
    expect(h.present.frame).toBeNull();
  });

  it('turns a gesture of previews into a single undo step', () => {
    let h = createHistory(withHat());
    const before = h.present;
    for (const scale of [0.45, 0.5, 0.6]) {
      h = historyReducer(h, {
        type: 'preview',
        action: { type: 'updateSticker', uid: 'a', patch: { scale } },
      });
    }
    h = historyReducer(h, { type: 'checkpoint', before });
    expect(h.past).toHaveLength(1);
    h = historyReducer(h, { type: 'undo' });
    expect(h.present.stickers[0].scale).toBe(0.4);
  });

  it('drops the redo stack after a new commit', () => {
    let h = createHistory(emptyScene());
    h = historyReducer(h, { type: 'commit', action: { type: 'setFrame', frame: 'x/y' } });
    h = historyReducer(h, { type: 'undo' });
    h = historyReducer(h, { type: 'commit', action: { type: 'setFrame', frame: 'x/z' } });
    expect(h.future).toEqual([]);
  });
});

describe('freeSpot', () => {
  const at = (uid: string, x: number, y: number, ref = 'x/y') => ({
    uid,
    ref,
    flipX: false,
    x,
    y,
    scale: 0.4,
    rotation: 0,
  });
  const spot = { x: 0.8, y: 0.74, scale: 0.42, rotation: 0 };

  it('keeps the default spot when it is free', () => {
    expect(freeSpot([], spot)).toEqual(spot);
  });

  it('mirrors to the other side when the default spot is taken', () => {
    const next = freeSpot([at('a', 0.8, 0.74)], spot);
    expect(next.x).toBeCloseTo(0.2);
    expect(next.y).toBeCloseTo(0.74);
  });

  it('then steps toward the center, far enough for big stickers not to cover each other', () => {
    const next = freeSpot([at('a', 0.8, 0.74), at('b', 0.2, 0.74)], spot);
    expect(next.x).toBeCloseTo(0.8 - 0.42 * 0.6);
    expect(Math.hypot(next.x - 0.8, next.y - 0.74)).toBeGreaterThan(0.2);
  });

  it('stays inside the circle', () => {
    const crowd = [
      at('a', 0.8, 0.74),
      at('b', 0.2, 0.74),
      at('c', 0.548, 0.74),
      at('d', 0.452, 0.74),
    ];
    const next = freeSpot(crowd, spot);
    expect(next.x).toBeGreaterThanOrEqual(0.08);
    expect(next.x).toBeLessThanOrEqual(0.92);
    expect(next.y).toBeLessThanOrEqual(0.92);
  });
});

describe('copyToRemove', () => {
  const s = (uid: string, ref: string) => ({
    uid,
    ref,
    flipX: false,
    x: 0.5,
    y: 0.5,
    scale: 0.4,
    rotation: 0,
  });
  const stickers = [s('a', 'hat'), s('b', 'scarf'), s('c', 'hat')];

  it('is null when the sticker is not on the avatar', () => {
    expect(copyToRemove(stickers, 'tree', null)).toBeNull();
  });

  it('removes the most recent copy by default', () => {
    expect(copyToRemove(stickers, 'hat', null)).toBe('c');
  });

  it('removes the selected copy when it is that sticker', () => {
    expect(copyToRemove(stickers, 'hat', 'a')).toBe('a');
    expect(copyToRemove(stickers, 'hat', 'b')).toBe('c');
  });
});

describe('stickerTileTap', () => {
  it('adds the sticker at a free spot and selects it', () => {
    const tap = stickerTileTap(withHat(), 'christmas/scarf', null, hat, 'n');
    expect(tap.select).toBe('n');
    expect(tap.action).toMatchObject({ type: 'addSticker', uid: 'n', ref: 'christmas/scarf' });
    // The default spot (and its mirror, the same at the center) is taken by the hat: it steps aside.
    expect(tap.action).toMatchObject({ placement: { x: 0.74, y: 0.2 } });
  });

  it('removes the sticker when it is already on the avatar, keeping the selection', () => {
    const tap = stickerTileTap(withHat(), 'christmas/santa-hat', null, hat, 'n');
    expect(tap.action).toEqual({ type: 'removeSticker', uid: 'a' });
    expect(tap.select).toBeUndefined();
  });
});
