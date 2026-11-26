import type { Background } from '../scene.ts';
import { tileBase } from './styles.ts';

const SWATCHES = ['#fcf6e8', '#ffffff', '#121016', '#f7b696', '#7ce0c3', '#e53935'];
const CHECKER =
  'bg-[conic-gradient(#3a3542_25%,#27232f_0_50%,#3a3542_0_75%,#27232f_0)] [background-size:12px_12px]';

const ring = (on: boolean) =>
  `h-10 w-10 rounded-full border-2 ${tileBase} ${on ? 'border-accent' : 'border-white/12'}`;

type Props = {
  background: Background;
  /** Small copy of the photo, shown blurred on the "blurred photo" option. */
  photoPreview: string;
  onBackground: (background: Background) => void;
};

/** What fills the canvas where the photo does not reach: blurred photo, a color or nothing. */
export function BackgroundPicker({ background: bg, photoPreview, onBackground }: Props) {
  const customColor = bg.kind === 'color' && !SWATCHES.includes(bg.color);
  return (
    <fieldset className="flex flex-col gap-2.5">
      <legend className="mb-2.5 text-[13px] text-muted">
        Background <span className="text-muted/70">· shows where the photo doesn’t reach</span>
      </legend>
      <div className="flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          aria-label="Blurred photo"
          title="Blurred photo"
          aria-pressed={bg.kind === 'blur'}
          onClick={() => onBackground({ kind: 'blur' })}
          className={`${ring(bg.kind === 'blur')} overflow-hidden`}
        >
          <img
            src={photoPreview}
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
              onClick={() => onBackground({ kind: 'color', color })}
              className={ring(on)}
              style={{ background: color }}
            />
          );
        })}
        <label
          title="Custom color"
          className={`${ring(customColor)} relative cursor-pointer bg-[conic-gradient(#e53935,#f9a825,#7ce0c3,#5b8def,#b8a6ff,#e53935)]`}
        >
          <span className="sr-only">Custom color</span>
          <input
            type="color"
            value={bg.kind === 'color' ? bg.color : '#fcf6e8'}
            onChange={(e) => onBackground({ kind: 'color', color: e.target.value })}
            className="absolute inset-0 cursor-pointer opacity-0"
          />
        </label>
        <button
          type="button"
          aria-label="Transparent"
          title="Transparent"
          aria-pressed={bg.kind === 'transparent'}
          onClick={() => onBackground({ kind: 'transparent' })}
          className={`${ring(bg.kind === 'transparent')} ${CHECKER}`}
        />
      </div>
    </fieldset>
  );
}
