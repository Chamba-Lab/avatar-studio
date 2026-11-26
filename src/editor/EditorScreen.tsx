import type Konva from 'konva';
import {
  useEffect,
  useEffectEvent,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import type { LoadedPhoto } from '../photo/loadPhoto.ts';
import { assetKey } from '../themes/catalog.ts';
import { Icon } from '../ui/Icon.tsx';
import { AvatarStage } from './AvatarStage.tsx';
import { exportAvatar } from './exportAvatar.ts';
import { DecorPanel, type Tab } from './DecorPanel.tsx';
import { FirstUseGuide } from './FirstUseGuide.tsx';
import { StickerToolbar } from './StickerToolbar.tsx';
import { useFirstUseGuide } from './useFirstUseGuide.ts';
import { historyReducer, stickerTileTap, type History, type SceneAction } from './scene.ts';

type Props = {
  photo: LoadedPhoto;
  initialHistory: History;
  onClose: () => void;
  onReplacePhoto: () => void;
  onSaved: (png: Blob, history: History) => void;
};

const newUid = () => crypto.randomUUID().slice(0, 8);

function useSquareSize(ref: React.RefObject<HTMLElement | null>, max: number) {
  const [size, setSize] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const { width, height } = el.getBoundingClientRect();
      setSize(Math.floor(Math.min(width, height, max)));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref, max]);
  return size;
}

export function EditorScreen({ photo, initialHistory, onClose, onReplacePhoto, onSaved }: Props) {
  const [history, dispatch] = useReducer(historyReducer, initialHistory);
  const scene = history.present;
  const [rawSelected, setSelected] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>(
    initialHistory.present.stickers.length ? 'stickers' : 'frame',
  );
  const guide = useFirstUseGuide();
  const [saving, setSaving] = useState(false);
  const stageRef = useRef<Konva.Stage>(null);
  const stageBox = useRef<HTMLDivElement>(null);
  const size = useSquareSize(stageBox, 560);

  // A sticker that was undone away cannot stay selected.
  const selected =
    rawSelected && scene.stickers.some((s) => s.uid === rawSelected) ? rawSelected : null;

  const commit = (action: SceneAction) => dispatch({ type: 'commit', action });
  const stickerUsage = useMemo(() => {
    const usage = new Map<string, number>();
    for (const s of scene.stickers) usage.set(s.ref, (usage.get(s.ref) ?? 0) + 1);
    return usage;
  }, [scene.stickers]);
  const selectedRef = scene.stickers.find((s) => s.uid === selected)?.ref ?? null;
  const photoPreview = useMemo(() => photo.canvas.toDataURL('image/jpeg', 0.6), [photo]);

  // Keyboard shortcuts: undo/redo, delete the selected sticker, Escape to deselect.
  // An effect event reads the latest selection without re-subscribing on every render.
  const onKey = useEffectEvent((e: KeyboardEvent) => {
    const mod = e.ctrlKey || e.metaKey;
    if (mod && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      dispatch({ type: e.shiftKey ? 'redo' : 'undo' });
    } else if (selected && (e.key === 'Delete' || e.key === 'Backspace')) {
      commit({ type: 'removeSticker', uid: selected });
    } else if (e.key === 'Escape') {
      setSelected(null);
    }
  });
  useEffect(() => {
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const save = async () => {
    if (!stageRef.current || saving) return;
    setSaving(true);
    setSelected(null);
    // Let the transformer detach before rendering the export.
    await new Promise((r) => requestAnimationFrame(r));
    try {
      onSaved(await exportAvatar(stageRef.current), history);
    } finally {
      setSaving(false);
    }
  };

  const selectedActions = selected && (
    <StickerToolbar
      onTop={scene.stickers.at(-1)?.uid === selected}
      onFlip={() => commit({ type: 'flipSticker', uid: selected })}
      onFront={() => commit({ type: 'bringToFront', uid: selected })}
      onDuplicate={() => {
        const uid = newUid();
        commit({ type: 'duplicateSticker', uid: selected, newUid: uid });
        setSelected(uid);
      }}
      onDelete={() => commit({ type: 'removeSticker', uid: selected })}
      onDone={() => setSelected(null)}
    />
  );

  const hint =
    tab === 'frame'
      ? 'Frames sit on the edge of the circle'
      : tab === 'photo'
        ? 'Center your face inside the circle'
        : 'Tap a sticker to add it, tap again to remove it';

  return (
    <main className="flex h-dvh flex-col overflow-hidden lg:flex-row">
      <section className="flex min-h-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between px-3.5 lg:h-16 lg:px-6">
          <button
            type="button"
            aria-label="Close editor"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-surface active:scale-95"
          >
            <Icon name="close" />
          </button>
          <div className="flex gap-0.5 rounded-[14px] bg-surface p-[3px]">
            <button
              type="button"
              aria-label="Undo"
              disabled={!history.past.length}
              onClick={() => dispatch({ type: 'undo' })}
              className="flex h-[38px] w-[42px] items-center justify-center rounded-[11px] disabled:text-white/25"
            >
              <Icon name="undo" size={19} />
            </button>
            <button
              type="button"
              aria-label="Redo"
              disabled={!history.future.length}
              onClick={() => dispatch({ type: 'redo' })}
              className="flex h-[38px] w-[42px] items-center justify-center rounded-[11px] disabled:text-white/25"
            >
              <Icon name="redo" size={19} />
            </button>
          </div>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="flex h-11 items-center gap-1.5 rounded-[14px] bg-accent px-[18px] text-[15px] font-bold text-on-accent transition-transform active:scale-95 disabled:opacity-60 lg:hidden"
          >
            {saving ? 'Saving…' : 'Save'}
            <Icon name="arrow" size={17} />
          </button>
        </header>

        <div
          ref={stageBox}
          className="relative flex min-h-0 flex-1 touch-none items-center justify-center bg-[radial-gradient(rgb(255_255_255/0.07)_1px,transparent_1px)] [background-size:18px_18px] p-3 select-none lg:p-8"
        >
          {size > 0 && (
            <div
              style={{ width: size, height: size }}
              className={`relative ${
                scene.background.kind === 'transparent'
                  ? 'bg-[conic-gradient(#3a3542_25%,#27232f_0_50%,#3a3542_0_75%,#27232f_0)] [background-size:20px_20px]'
                  : ''
              }`}
            >
              <AvatarStage
                size={size}
                photo={photo}
                scene={scene}
                selected={selected}
                onSelect={(uid) => {
                  setSelected(uid);
                  if (uid) setTab('stickers');
                }}
                onCommit={commit}
                stageRef={stageRef}
              />
            </div>
          )}
        </div>

        <div className="flex h-14 shrink-0 items-center justify-center lg:h-[72px]">
          {selectedActions || <p className="text-[13px] text-muted">{hint}</p>}
        </div>
      </section>

      <aside className="flex max-h-[40dvh] shrink-0 flex-col gap-3 overflow-y-auto rounded-t-[30px] border-t border-hairline bg-surface px-4 pt-2.5 pb-[max(1.25rem,env(safe-area-inset-bottom))] lg:max-h-none lg:w-[400px] lg:rounded-none lg:border-t-0 lg:border-l lg:px-6 lg:pt-6">
        <div
          aria-hidden="true"
          className="mx-auto h-[5px] w-[38px] rounded-full bg-white/18 lg:hidden"
        />
        <h2 className="hidden font-display text-2xl font-extrabold tracking-tight lg:block">
          Decorate
        </h2>
        <DecorPanel
          tab={tab}
          onTab={setTab}
          frame={scene.frame}
          photo={scene.photo}
          background={scene.background}
          onBackground={(background) => commit({ type: 'setBackground', background })}
          photoPreview={photoPreview}
          onFrame={(frame) => commit({ type: 'setFrame', frame })}
          stickerUsage={stickerUsage}
          selectedRef={selectedRef}
          onSticker={(themeId, s) => {
            const tap = stickerTileTap(
              scene,
              assetKey(themeId, s.id),
              selected,
              s.defaults,
              newUid(),
            );
            commit(tap.action);
            if (tap.select) setSelected(tap.select);
          }}
          onPhotoScale={(scale) => commit({ type: 'updatePhoto', patch: { scale } })}
          onRotatePhoto={() =>
            commit({ type: 'updatePhoto', patch: { rotation: scene.photo.rotation + 90 } })
          }
          onResetPhoto={() => commit({ type: 'resetPhoto' })}
          onReplacePhoto={onReplacePhoto}
        />
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="mt-auto hidden h-14 items-center justify-center gap-2 rounded-[18px] bg-accent text-base font-bold text-on-accent transition-transform active:scale-[0.98] disabled:opacity-60 lg:flex"
        >
          {saving ? 'Saving…' : 'Save avatar'}
          <Icon name="arrow" size={18} />
        </button>
      </aside>
      {/* Last, so the canvas ref is attached by the time the guide measures it. */}
      {guide.open && <FirstUseGuide stage={stageBox} onDone={guide.dismiss} />}
    </main>
  );
}
