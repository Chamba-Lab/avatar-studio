import { useEffect, useRef } from 'react';
import { Icon, type IconName } from '../ui/Icon.tsx';

type Colors = {
  /** The sticker's own colour. */
  original: string;
  suggested: { name: string; color: string } | null;
  /** The chosen tint, or null for the original. */
  current: string | null;
  onPick: (color: string | null) => void;
  /** While dragging in the colour picker. */
  onPreview: (color: string) => void;
  /** When the colour picker closes. */
  onPreviewEnd: (color: string) => void;
};

const same = (a: string | null, b: string | null) =>
  (a ?? '').toUpperCase() === (b ?? '').toUpperCase();

function Swatch({
  color,
  label,
  on,
  onClick,
}: {
  color: string;
  label: string;
  on: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={on}
      aria-label={label}
      title={label}
      onClick={onClick}
      className="flex h-11 w-11 items-center justify-center rounded-[13px] transition-transform duration-150 hover:bg-white/6 active:scale-90"
    >
      <span
        className={`h-6 w-6 rounded-full border-2 ${on ? 'border-accent ring-2 ring-accent/30' : 'border-black/40'}`}
        style={{ background: color }}
      />
    </button>
  );
}

/** Original colour, one suggestion and a free colour picker (the browser's own). */
function ColorRow({ colors }: { colors: Colors }) {
  const input = useRef<HTMLInputElement>(null);
  const custom =
    colors.current !== null && !same(colors.current, colors.suggested?.color ?? null)
      ? colors.current
      : null;
  // The native "change" event fires once, when the picker closes; React's onChange fires on every move.
  const onEnd = useRef(colors.onPreviewEnd);
  useEffect(() => {
    onEnd.current = colors.onPreviewEnd;
  });
  useEffect(() => {
    const el = input.current;
    if (!el) return;
    const handler = () => onEnd.current(el.value);
    el.addEventListener('change', handler);
    return () => el.removeEventListener('change', handler);
  }, []);

  return (
    <div
      role="radiogroup"
      aria-label="Sticker colour"
      className="flex gap-1 rounded-[18px] border border-white/10 bg-raised p-1.5 shadow-[0_12px_30px_rgb(0_0_0/0.4)]"
    >
      <Swatch
        color={colors.original}
        label="Original colour"
        on={colors.current === null}
        onClick={() => colors.onPick(null)}
      />
      {colors.suggested && (
        <Swatch
          color={colors.suggested.color}
          label={colors.suggested.name}
          on={same(colors.current, colors.suggested.color)}
          onClick={() => colors.onPick(colors.suggested!.color)}
        />
      )}
      <label
        title="Any colour"
        className="relative flex h-11 w-11 cursor-pointer items-center justify-center rounded-[13px] transition-transform duration-150 hover:bg-white/6 active:scale-90 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent"
      >
        <span
          aria-hidden="true"
          className={`flex h-6 w-6 items-center justify-center rounded-full border-2 bg-[conic-gradient(#e53935,#fb8c00,#fdd835,#43a047,#1e88e5,#8e24aa,#e53935)] ${custom ? 'border-accent ring-2 ring-accent/30' : 'border-black/40'}`}
        >
          {custom && (
            <span
              className="h-3.5 w-3.5 rounded-full border border-black/40"
              style={{ background: custom }}
            />
          )}
        </span>
        <input
          ref={input}
          type="color"
          aria-label="Any colour"
          value={(colors.current ?? colors.original).toLowerCase()}
          onChange={(e) => colors.onPreview(e.target.value.toUpperCase())}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </label>
    </div>
  );
}

function ActionButton({
  icon,
  label,
  onClick,
  tone = 'default',
  disabled = false,
  pressed,
}: {
  icon: IconName;
  label: string;
  onClick: () => void;
  tone?: 'default' | 'danger' | 'confirm';
  disabled?: boolean;
  /** Set for toggle buttons. */
  pressed?: boolean;
}) {
  const tones = {
    default: pressed ? 'bg-accent/16 text-accent' : 'text-text hover:bg-white/6',
    danger: 'text-danger hover:bg-danger/10',
    confirm: 'bg-confirm text-on-confirm',
  };
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={`flex h-11 w-11 items-center justify-center rounded-[13px] transition-[transform,opacity,background-color] duration-150 active:scale-90 disabled:pointer-events-none disabled:opacity-30 ${tones[tone]}`}
    >
      <Icon name={icon} size={19} />
    </button>
  );
}

type Props = {
  /** Already the top sticker of its layer, so "Bring to front" would do nothing. */
  onTop: boolean;
  /** Already the bottom sticker of its layer, so "Send to back" would do nothing. */
  atBack: boolean;
  onFlip: () => void;
  onFront: () => void;
  onBack: () => void;
  /** Shown only when a sticker behind the photo would be visible (or is already there). */
  behindPhoto: { active: boolean; onToggle: () => void } | null;
  /** Recolouring for tintable stickers: original, a suggested colour and a free picker. */
  colors: Colors | null;
  onDuplicate: () => void;
  onDelete: () => void;
  onDone: () => void;
};

/** Actions for the sticker selected on the canvas. */
export function StickerToolbar({
  onTop,
  atBack,
  onFlip,
  onFront,
  onBack,
  behindPhoto,
  colors,
  onDuplicate,
  onDelete,
  onDone,
}: Props) {
  return (
    <div className="flex animate-[pop-in_260ms_var(--ease-out-expo)_both] flex-col items-center gap-1.5 lg:flex-row">
      {colors && <ColorRow colors={colors} />}
      <div
        role="toolbar"
        aria-label="Sticker actions"
        className="flex gap-1 rounded-[18px] border border-white/10 bg-raised p-1.5 shadow-[0_12px_30px_rgb(0_0_0/0.4)]"
      >
        <ActionButton icon="flip" label="Flip" onClick={onFlip} />
        <ActionButton icon="front" label="Bring to front" disabled={onTop} onClick={onFront} />
        <ActionButton icon="toBack" label="Send to back" disabled={atBack} onClick={onBack} />
        {behindPhoto && (
          <ActionButton
            icon="behind"
            label="Behind the photo"
            pressed={behindPhoto.active}
            onClick={behindPhoto.onToggle}
          />
        )}
        <ActionButton icon="duplicate" label="Duplicate" onClick={onDuplicate} />
        <ActionButton icon="trash" label="Delete" tone="danger" onClick={onDelete} />
        <ActionButton icon="check" label="Done" tone="confirm" onClick={onDone} />
      </div>
    </div>
  );
}
