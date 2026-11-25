import { describe, expect, it } from 'vitest';
import {
  applyAction,
  createHistory,
  emptyScene,
  historyReducer,
  MAX_PHOTO_SCALE,
  MAX_STICKER_SCALE,
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
