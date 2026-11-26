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

/** What fills the canvas where the photo does not reach (after zooming out or moving it). */
export type Background =
  { kind: 'blur' } | { kind: 'color'; color: string } | { kind: 'transparent' };

export type Scene = {
  version: 1;
  photo: PhotoTransform;
  background: Background;
  frame: string | null;
  /** Array order is z-order: the last one is on top. */
  stickers: StickerInstance[];
};

export const PHOTO_FIT: PhotoTransform = { x: 0.5, y: 0.5, scale: 1, rotation: 0 };
export const MIN_STICKER_SCALE = 0.08;
export const MAX_STICKER_SCALE = 1.5;
/** Below 1 the photo no longer covers the canvas and the background shows. */
export const MIN_PHOTO_SCALE = 0.4;
export const MAX_PHOTO_SCALE = 4;

export const emptyScene = (): Scene => ({
  version: 1,
  photo: { ...PHOTO_FIT },
  background: { kind: 'blur' },
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
  | { type: 'setBackground'; background: Background }
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
    case 'setBackground':
      return { ...scene, background: action.background };
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
      return { ...emptyScene(), photo: scene.photo, background: scene.background };
  }
}

/**
 * Where a new sticker goes: its default spot, else the mirrored spot on the other side, else a
 * step away from either, so tapping stickers that share a default does not pile them up. Steps
 * grow with the sticker so big ones do not still cover each other.
 */
export function freeSpot(stickers: StickerInstance[], placement: Placement): Placement {
  const step = Math.max(0.14, placement.scale * 0.6);
  const taken = (x: number, y: number) =>
    stickers.some((s) => Math.hypot(s.x - x, s.y - y) < step * 0.75);
  const { x, y } = placement;
  const mx = 1 - x;
  const towardCenter = (v: number) => (v > 0.5 ? -step : step);
  const candidates: Array<[number, number]> = [
    [x, y],
    [mx, y],
    [x + towardCenter(x), y],
    [mx + towardCenter(mx), y],
    [x, y + towardCenter(y)],
    [mx, y + towardCenter(y)],
  ];
  for (const [cx, cy] of candidates) {
    if (cx >= 0.08 && cx <= 0.92 && cy >= 0.08 && cy <= 0.92 && !taken(cx, cy)) {
      return { ...placement, x: cx, y: cy };
    }
  }
  return placement;
}

/**
 * The copy a second tap on a sticker tile removes: the selected one if it is that sticker,
 * otherwise the most recently added. Null when the sticker is not on the avatar.
 */
export function copyToRemove(
  stickers: StickerInstance[],
  ref: string,
  selected: string | null,
): string | null {
  const copies = stickers.filter((s) => s.ref === ref);
  return (copies.find((s) => s.uid === selected) ?? copies.at(-1))?.uid ?? null;
}

/**
 * What a tap on a sticker tile does. Tiles toggle: if that sticker is already on the avatar, the
 * tap removes a copy (see `copyToRemove`); otherwise it adds one at a free spot, and `select`
 * names the new sticker.
 * Extra copies come from Duplicate on the selected sticker, not from tapping the tile again.
 */
export function stickerTileTap(
  scene: Scene,
  ref: string,
  selected: string | null,
  defaults: Placement,
  newUid: string,
): { action: SceneAction; select?: string } {
  const existing = copyToRemove(scene.stickers, ref, selected);
  if (existing) return { action: { type: 'removeSticker', uid: existing } };
  return {
    action: { type: 'addSticker', uid: newUid, ref, placement: freeSpot(scene.stickers, defaults) },
    select: newUid,
  };
}

/**
 * Keyboard editing of the selected sticker: arrows move it, + and - resize, [ and ] turn it.
 * Shift makes each step bigger. Returns null for any other key.
 */
export function keyboardNudge(
  sticker: Placement,
  key: string,
  shift: boolean,
): Partial<Placement> | null {
  const move = shift ? 0.05 : 0.01;
  const turn = shift ? 15 : 5;
  const grow = shift ? 1.25 : 1.06;
  switch (key) {
    case 'ArrowLeft':
      return { x: sticker.x - move };
    case 'ArrowRight':
      return { x: sticker.x + move };
    case 'ArrowUp':
      return { y: sticker.y - move };
    case 'ArrowDown':
      return { y: sticker.y + move };
    case '+':
    case '=':
      return { scale: sticker.scale * grow };
    case '-':
    case '_':
      return { scale: sticker.scale / grow };
    case '[':
    case '{':
      return { rotation: sticker.rotation - turn };
    case ']':
    case '}':
      return { rotation: sticker.rotation + turn };
    default:
      return null;
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
