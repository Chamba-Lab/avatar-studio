import { assetKey } from '../../themes/catalog.ts';
import type { Theme } from '../../themes/types.ts';
import { Icon } from '../../ui/Icon.tsx';
import { tileBase } from './styles.ts';

type Props = {
  theme: Theme;
  /** Asset key of the frame in use, or null for none. */
  frame: string | null;
  /** Small copy of the photo, so each tile previews the frame on it. */
  photoPreview: string;
  onFrame: (key: string | null) => void;
};

export function FrameTab({ theme, frame, photoPreview, onFrame }: Props) {
  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        aria-label="No frame"
        aria-pressed={frame === null}
        onClick={() => onFrame(null)}
        className={`flex h-[76px] w-[76px] items-center justify-center rounded-full border-2 bg-ink text-muted ${tileBase} ${
          frame === null ? 'border-accent' : 'border-white/8'
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
            aria-pressed={frame === key}
            onClick={() => onFrame(key)}
            className={`relative h-[76px] w-[76px] rounded-full border-2 bg-raised ${tileBase} ${
              frame === key ? 'border-accent' : 'border-white/8'
            }`}
          >
            <img
              src={photoPreview}
              alt=""
              className="absolute inset-[7px] h-[58px] w-[58px] rounded-full object-cover opacity-60"
            />
            <img src={f.src} alt="" className="absolute inset-0.5 h-[68px] w-[68px]" />
          </button>
        );
      })}
    </div>
  );
}
