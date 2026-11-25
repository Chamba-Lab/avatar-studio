import type { Placement } from '../themes/types.ts';

/**
 * Everything the person built, as plain data (see docs/theme-schema.md, "Scene").
 * Positions are normalized to the canvas side so the same scene renders at any size,
 * on screen or at 1024 px for export. The photo bitmap itself lives outside the scene.
 */
export type PhotoTransform = Placement;

export type StickerInstance = Placement & {
  uid: string;
  /** Global asset key, e.g. "christmas/santa-hat". */
  ref: string;
  flipX: boolean;
};

export type Scene = {
  version: 1;
  photo: PhotoTransform;
  frame: string | null;
  /** Array order is z-order: the last one is on top. */
  stickers: StickerInstance[];
};

export const PHOTO_FIT: PhotoTransform = { x: 0.5, y: 0.5, scale: 1, rotation: 0 };
export const MIN_STICKER_SCALE = 0.08;
export const MAX_STICKER_SCALE = 1.5;
export const MIN_PHOTO_SCALE = 1;
export const MAX_PHOTO_SCALE = 4;

export const emptyScene = (): Scene => ({
  version: 1,
  photo: { ...PHOTO_FIT },
  frame: null,
  stickers: [],
});

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const normalizeAngle = (deg: number) => ((((deg + 180) % 360) + 360) % 360) - 180;

export type SceneAction =
  | { type: 'addSticker'; uid: string; ref: string; placement: Placement }
  | { type: 'updateSticker'; uid: string; patch: Partial<Placement> }
  | { type: 'removeSticker'; uid: string }
  | { type: 'duplicateSticker'; uid: string; newUid: string }
  | { type: 'flipSticker'; uid: string }
  | { type: 'bringToFront'; uid: string }
  | { type: 'setFrame'; frame: string | null }
  | { type: 'updatePhoto'; patch: Partial<PhotoTransform> }
  | { type: 'resetPhoto' }
  | { type: 'clear' };

function sanitizeSticker(s: StickerInstance): StickerInstance {
  return {
    ...s,
    x: clamp(s.x, -0.25, 1.25),
    y: clamp(s.y, -0.25, 1.25),
    scale: clamp(s.scale, MIN_STICKER_SCALE, MAX_STICKER_SCALE),
    rotation: normalizeAngle(s.rotation),
  };
}

export function applyAction(scene: Scene, action: SceneAction): Scene {
  const mapSticker = (uid: string, fn: (s: StickerInstance) => StickerInstance): Scene => ({
    ...scene,
    stickers: scene.stickers.map((s) => (s.uid === uid ? sanitizeSticker(fn(s)) : s)),
  });

  switch (action.type) {
    case 'addSticker':
      return {
        ...scene,
        stickers: [
          ...scene.stickers,
          sanitizeSticker({ uid: action.uid, ref: action.ref, flipX: false, ...action.placement }),
        ],
      };
    case 'updateSticker':
      return mapSticker(action.uid, (s) => ({ ...s, ...action.patch }));
    case 'removeSticker':
      return { ...scene, stickers: scene.stickers.filter((s) => s.uid !== action.uid) };
    case 'duplicateSticker': {
      const source = scene.stickers.find((s) => s.uid === action.uid);
      if (!source) return scene;
      const copy = sanitizeSticker({
        ...source,
        uid: action.newUid,
        x: source.x + 0.06,
        y: source.y + 0.06,
      });
      return { ...scene, stickers: [...scene.stickers, copy] };
    }
    case 'flipSticker':
      return mapSticker(action.uid, (s) => ({ ...s, flipX: !s.flipX }));
    case 'bringToFront': {
      const target = scene.stickers.find((s) => s.uid === action.uid);
      if (!target) return scene;
      return { ...scene, stickers: [...scene.stickers.filter((s) => s !== target), target] };
    }
    case 'setFrame':
      return { ...scene, frame: action.frame };
    case 'updatePhoto': {
      const next = { ...scene.photo, ...action.patch };
      return {
        ...scene,
        photo: {
          x: clamp(next.x, -0.5, 1.5),
          y: clamp(next.y, -0.5, 1.5),
          scale: clamp(next.scale, MIN_PHOTO_SCALE, MAX_PHOTO_SCALE),
          rotation: normalizeAngle(next.rotation),
        },
      };
    }
    case 'resetPhoto':
      return { ...scene, photo: { ...PHOTO_FIT } };
    case 'clear':
      return { ...emptyScene(), photo: scene.photo };
  }
}

/** Undo history. Every committed action is one step; `preview` changes the present without one. */
export type History = { past: Scene[]; present: Scene; future: Scene[] };

export type HistoryAction =
  | { type: 'commit'; action: SceneAction }
  | { type: 'preview'; action: SceneAction }
  | { type: 'checkpoint'; before: Scene }
  | { type: 'undo' }
  | { type: 'redo' }
  | { type: 'reset'; scene: Scene };

const HISTORY_LIMIT = 50;

export const createHistory = (scene: Scene): History => ({ past: [], present: scene, future: [] });

export function historyReducer(state: History, action: HistoryAction): History {
  switch (action.type) {
    case 'commit': {
      const next = applyAction(state.present, action.action);
      if (next === state.present) return state;
      return {
        past: [...state.past, state.present].slice(-HISTORY_LIMIT),
        present: next,
        future: [],
      };
    }
    case 'preview':
      return { ...state, present: applyAction(state.present, action.action) };
    case 'checkpoint':
      // Ends a gesture made of previews: one undo step back to where it started.
      if (action.before === state.present) return state;
      return {
        past: [...state.past, action.before].slice(-HISTORY_LIMIT),
        present: state.present,
        future: [],
      };
    case 'undo': {
      const previous = state.past.at(-1);
      if (!previous) return state;
      return {
        past: state.past.slice(0, -1),
        present: previous,
        future: [state.present, ...state.future],
      };
    }
    case 'redo': {
      const [next, ...rest] = state.future;
      if (!next) return state;
      return { past: [...state.past, state.present], present: next, future: rest };
    }
    case 'reset':
      return createHistory(action.scene);
  }
}
