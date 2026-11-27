import type { StickerVariant } from '../themes/types.ts';
import { Icon, type IconName } from '../ui/Icon.tsx';

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
  /** Colour variants of the sticker, the first one being its default colour. */
  colors: { variants: StickerVariant[]; current: string; onPick: (id: string) => void } | null;
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
      {colors && (
        <div
          role="radiogroup"
          aria-label="Sticker colour"
          className="flex gap-1 rounded-[18px] border border-white/10 bg-raised p-1.5 shadow-[0_12px_30px_rgb(0_0_0/0.4)]"
        >
          {colors.variants.map((v) => {
            const on = v.id === colors.current;
            return (
              <button
                key={v.id}
                type="button"
                role="radio"
                aria-checked={on}
                aria-label={v.name}
                title={v.name}
                onClick={() => colors.onPick(v.id)}
                className="flex h-11 w-11 items-center justify-center rounded-[13px] transition-transform duration-150 hover:bg-white/6 active:scale-90"
              >
                <span
                  className={`h-6 w-6 rounded-full border-2 ${on ? 'border-accent ring-2 ring-accent/30' : 'border-black/40'}`}
                  style={{ background: v.color }}
                />
              </button>
            );
          })}
        </div>
      )}
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
