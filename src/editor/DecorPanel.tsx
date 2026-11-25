import { useState } from 'react';
import { assetKey, themes } from '../themes/catalog.ts';
import type { StickerAsset } from '../themes/types.ts';
import { Icon } from '../ui/Icon.tsx';
import { MAX_PHOTO_SCALE, MIN_PHOTO_SCALE, type Background, type PhotoTransform } from './scene.ts';

export type Tab = 'photo' | 'frame' | 'stickers';

type Props = {
  tab: Tab;
  onTab: (tab: Tab) => void;
  frame: string | null;
  photo: PhotoTransform;
  background: Background;
  onBackground: (background: Background) => void;
  photoPreview: string;
  onFrame: (key: string | null) => void;
  /** How many copies of each sticker (by asset key) are on the avatar. */
  stickerUsage: Map<string, number>;
  /** Asset key of the sticker selected on the canvas, if any. */
  selectedRef: string | null;
  onSticker: (themeId: string, sticker: StickerAsset) => void;
  onPhotoScale: (scale: number) => void;
  onRotatePhoto: () => void;
  onResetPhoto: () => void;
  onReplacePhoto: () => void;
};

const TABS: Array<{ id: Tab; label: string }> = [
  { id: 'photo', label: 'Photo' },
  { id: 'frame', label: 'Frame' },
  { id: 'stickers', label: 'Stickers' },
];

const SWATCHES = ['#fcf6e8', '#ffffff', '#121016', '#f7b696', '#7ce0c3', '#e53935'];
const CHECKER =
  'bg-[conic-gradient(#3a3542_25%,#27232f_0_50%,#3a3542_0_75%,#27232f_0)] [background-size:12px_12px]';

const tileBase =
  'transition-[transform,border-color,background-color] duration-200 ease-out-expo active:scale-95';

export function DecorPanel(props: Props) {
  const { tab, onTab } = props;
  const [themeId, setThemeId] = useState(themes[0]?.id);
  const theme = themes.find((t) => t.id === themeId) ?? themes[0];
  const tabIndex = TABS.findIndex((t) => t.id === tab);

  return (
    <div className="flex flex-col gap-3">
      <div
        role="tablist"
        aria-label="Editor sections"
        className="relative grid grid-cols-3 rounded-2xl bg-ink p-1"
      >
        <div
          aria-hidden="true"
          className="absolute top-1 bottom-1 left-1 w-[calc((100%-0.5rem)/3)] rounded-xl bg-raised shadow-[0_4px_12px_rgb(0_0_0/0.35)] transition-transform duration-300 ease-out-expo"
          style={{ transform: `translateX(${tabIndex * 100}%)` }}
        />
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => onTab(t.id)}
            className={`relative h-10 text-sm font-semibold transition-colors ${tab === t.id ? 'text-text' : 'text-muted'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab !== 'photo' && (
        <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Themes">
          {themes.map((t) => (
            <button
              key={t.id}
              type="button"
              aria-pressed={t.id === theme.id}
              onClick={() => setThemeId(t.id)}
              className={`flex h-9 shrink-0 items-center gap-2 rounded-full border pr-3.5 pl-2 text-[13px] font-semibold ${tileBase} ${
                t.id === theme.id ? 'border-accent bg-accent/14' : 'border-white/14'
              }`}
            >
              <img src={t.iconUrl} alt="" className="h-5 w-5" />
              {t.name}
            </button>
          ))}
          <span className="flex h-9 shrink-0 items-center rounded-full border border-dashed border-white/16 px-3 text-[13px] text-muted">
            More soon
          </span>
        </div>
      )}

      {tab === 'stickers' && (
        <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-5 lg:grid-cols-4">
          {theme.stickers.map((s, i) => {
            const key = assetKey(theme.id, s.id);
            const count = props.stickerUsage.get(key) ?? 0;
            const used = count > 0;
            const focused = props.selectedRef === key;
            return (
              <button
                key={s.id}
                type="button"
                aria-pressed={used}
                aria-label={used ? `Remove ${s.name}` : `Add ${s.name}`}
                title={s.name}
                onClick={() => props.onSticker(theme.id, s)}
                className={`relative flex aspect-square items-center justify-center rounded-[18px] border-2 ${tileBase} animate-[tile-in_420ms_var(--ease-out-expo)_both] ${
                  used
                    ? `bg-accent/12 ${focused ? 'border-accent' : 'border-accent/55'}`
                    : 'border-white/7 bg-raised hover:border-white/20'
                }`}
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <img
                  src={s.src}
                  alt=""
                  className={`h-[70%] w-[70%] object-contain transition-transform duration-300 ease-out-expo ${used ? 'scale-90' : ''}`}
                  draggable={false}
                />
                {used && (
                  <span
                    key={count}
                    aria-hidden="true"
                    className="absolute top-1 right-1 flex h-[22px] min-w-[22px] animate-[pop-in_260ms_var(--ease-out-expo)_both] items-center justify-center rounded-full bg-accent px-1 text-[11px] font-bold text-on-accent shadow-[0_2px_6px_rgb(0_0_0/0.35)]"
                  >
                    {count > 1 ? count : <Icon name="check" size={13} />}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {tab === 'frame' && (
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            aria-label="No frame"
            aria-pressed={props.frame === null}
            onClick={() => props.onFrame(null)}
            className={`flex h-[76px] w-[76px] items-center justify-center rounded-full border-2 bg-ink text-muted ${tileBase} ${
              props.frame === null ? 'border-accent' : 'border-white/8'
            }`}
          >
            <Icon name="none" size={24} />
          </button>
          {theme.frames.map((f) => {
            const key = assetKey(theme.id, f.id);
            return (
              <button
                key={key}
                type="button"
                aria-label={f.name}
                aria-pressed={props.frame === key}
                onClick={() => props.onFrame(key)}
                className={`relative h-[76px] w-[76px] rounded-full border-2 bg-raised ${tileBase} ${
                  props.frame === key ? 'border-accent' : 'border-white/8'
                }`}
              >
                <img
                  src={props.photoPreview}
                  alt=""
                  className="absolute inset-[7px] h-[58px] w-[58px] rounded-full object-cover opacity-60"
                />
                <img src={f.src} alt="" className="absolute inset-0.5 h-[68px] w-[68px]" />
              </button>
            );
          })}
        </div>
      )}

      {tab === 'photo' && (
        <div className="flex flex-col gap-4 pt-1">
          <label className="flex items-center gap-3 text-[13px] text-muted">
            Zoom
            <input
              type="range"
              min={MIN_PHOTO_SCALE}
              max={MAX_PHOTO_SCALE}
              step={0.01}
              value={props.photo.scale}
              onChange={(e) => props.onPhotoScale(Number(e.target.value))}
              className="flex-1 accent-accent"
            />
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {(
              [
                ['rotate', 'Rotate', props.onRotatePhoto],
                ['fit', 'Fit', props.onResetPhoto],
                ['image', 'Replace', props.onReplacePhoto],
              ] as const
            ).map(([icon, label, action]) => (
              <button
                key={label}
                type="button"
                onClick={action}
                className={`flex h-12 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-raised text-sm font-semibold ${tileBase}`}
              >
                <Icon name={icon} size={18} />
                {label}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted">Drag to move · pinch or scroll to zoom</p>

          <fieldset className="flex flex-col gap-2.5">
            <legend className="mb-2.5 text-[13px] text-muted">
              Background{' '}
              <span className="text-muted/70">· shows where the photo doesn’t reach</span>
            </legend>
            <div className="flex flex-wrap items-center gap-2.5">
              {(() => {
                const bg = props.background;
                const ring = (on: boolean) =>
                  `h-10 w-10 rounded-full border-2 ${tileBase} ${on ? 'border-accent' : 'border-white/12'}`;
                return (
                  <>
                    <button
                      type="button"
                      aria-label="Blurred photo"
                      title="Blurred photo"
                      aria-pressed={bg.kind === 'blur'}
                      onClick={() => props.onBackground({ kind: 'blur' })}
                      className={`${ring(bg.kind === 'blur')} overflow-hidden`}
                    >
                      <img
                        src={props.photoPreview}
                        alt=""
                        className="h-full w-full scale-150 object-cover blur-[3px]"
                      />
                    </button>
                    {SWATCHES.map((color) => {
                      const on = bg.kind === 'color' && bg.color === color;
                      return (
                        <button
                          key={color}
                          type="button"
                          aria-label={`Color ${color}`}
                          aria-pressed={on}
                          onClick={() => props.onBackground({ kind: 'color', color })}
                          className={ring(on)}
                          style={{ background: color }}
                        />
                      );
                    })}
                    <label
                      title="Custom color"
                      className={`${ring(bg.kind === 'color' && !SWATCHES.includes(bg.color))} relative cursor-pointer bg-[conic-gradient(#e53935,#f9a825,#7ce0c3,#5b8def,#b8a6ff,#e53935)]`}
                    >
                      <span className="sr-only">Custom color</span>
                      <input
                        type="color"
                        value={bg.kind === 'color' ? bg.color : '#fcf6e8'}
                        onChange={(e) =>
                          props.onBackground({ kind: 'color', color: e.target.value })
                        }
                        className="absolute inset-0 cursor-pointer opacity-0"
                      />
                    </label>
                    <button
                      type="button"
                      aria-label="Transparent"
                      title="Transparent"
                      aria-pressed={bg.kind === 'transparent'}
                      onClick={() => props.onBackground({ kind: 'transparent' })}
                      className={`${ring(bg.kind === 'transparent')} ${CHECKER}`}
                    />
                  </>
                );
              })()}
            </div>
          </fieldset>
        </div>
      )}
    </div>
  );
}
