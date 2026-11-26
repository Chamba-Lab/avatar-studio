import { Icon, type IconName } from '../ui/Icon.tsx';

function ActionButton({
  icon,
  label,
  onClick,
  tone = 'default',
  disabled = false,
}: {
  icon: IconName;
  label: string;
  onClick: () => void;
  tone?: 'default' | 'danger' | 'confirm';
  disabled?: boolean;
}) {
  const tones = {
    default: 'text-text hover:bg-white/6',
    danger: 'text-danger hover:bg-danger/10',
    confirm: 'bg-confirm text-on-confirm',
  };
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={`flex h-10 w-11 items-center justify-center rounded-[13px] transition-[transform,opacity] duration-150 active:scale-90 disabled:pointer-events-none disabled:opacity-30 ${tones[tone]}`}
    >
      <Icon name={icon} size={19} />
    </button>
  );
}

type Props = {
  /** The selected sticker is already the top layer, so "Bring to front" would do nothing. */
  onTop: boolean;
  onFlip: () => void;
  onFront: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onDone: () => void;
};

/** Actions for the sticker selected on the canvas. */
export function StickerToolbar({ onTop, onFlip, onFront, onDuplicate, onDelete, onDone }: Props) {
  return (
    <div
      role="toolbar"
      aria-label="Sticker actions"
      className="flex animate-[pop-in_260ms_var(--ease-out-expo)_both] gap-1 rounded-[18px] border border-white/10 bg-raised p-1.5 shadow-[0_12px_30px_rgb(0_0_0/0.4)]"
    >
      <ActionButton icon="flip" label="Flip" onClick={onFlip} />
      <ActionButton icon="front" label="Bring to front" disabled={onTop} onClick={onFront} />
      <ActionButton icon="duplicate" label="Duplicate" onClick={onDuplicate} />
      <ActionButton icon="trash" label="Delete" tone="danger" onClick={onDelete} />
      <ActionButton icon="check" label="Done" tone="confirm" onClick={onDone} />
    </div>
  );
}
