import { assetKey } from '../../themes/catalog.ts';
import type { Theme } from '../../themes/types.ts';
import { Icon } from '../../ui/Icon.tsx';
import { tileBase } from './styles.ts';

type Props = {
  theme: Theme;
  /** How many copies of each sticker (by asset key) are on the avatar. */
  usage: Map<string, number>;
  /** Asset key of the sticker selected on the canvas, if any. */
  selectedRef: string | null;
  onSticker: (themeId: string, sticker: Theme['stickers'][number]) => void;
};

/** The theme's stickers as toggle tiles, with a count when there are copies. */
export function StickerTab({ theme, usage, selectedRef, onSticker }: Props) {
  return (
    <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-5 lg:grid-cols-4">
      {theme.stickers.map((s, i) => {
        const key = assetKey(theme.id, s.id);
        const count = usage.get(key) ?? 0;
        const used = count > 0;
        const focused = selectedRef === key;
        return (
          <button
            key={s.id}
            type="button"
            aria-pressed={used}
            aria-label={used ? `Remove ${s.name}` : `Add ${s.name}`}
            title={s.name}
            onClick={() => onSticker(theme.id, s)}
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
  );
}
