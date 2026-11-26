import { Icon } from '../../ui/Icon.tsx';
import {
  MAX_PHOTO_SCALE,
  MIN_PHOTO_SCALE,
  type Background,
  type PhotoTransform,
} from '../scene.ts';
import { BackgroundPicker } from './BackgroundPicker.tsx';
import { tileBase } from './styles.ts';

type Props = {
  photo: PhotoTransform;
  background: Background;
  photoPreview: string;
  onBackground: (background: Background) => void;
  onPhotoScale: (scale: number) => void;
  onRotatePhoto: () => void;
  onResetPhoto: () => void;
  onReplacePhoto: () => void;
};

/** Framing the photo (zoom, turn, fit, replace) and the background behind it. */
export function PhotoTab(props: Props) {
  const actions = [
    ['rotate', 'Rotate', props.onRotatePhoto],
    ['fit', 'Fit', props.onResetPhoto],
    ['image', 'Replace', props.onReplacePhoto],
  ] as const;
  return (
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
        {actions.map(([icon, label, action]) => (
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
      <BackgroundPicker
        background={props.background}
        photoPreview={props.photoPreview}
        onBackground={props.onBackground}
      />
    </div>
  );
}
