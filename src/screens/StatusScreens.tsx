import type { PhotoErrorReason } from '../photo/loadPhoto.ts';
import { Icon } from '../ui/Icon.tsx';

export function LoadingScreen() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-5 p-6 text-center">
      <svg width="120" height="120" viewBox="0 0 120 120" className="-rotate-90" aria-hidden="true">
        <circle cx="60" cy="60" r="54" fill="none" stroke="var(--color-raised)" strokeWidth="6" />
        <circle
          cx="60"
          cy="60"
          r="54"
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray="340"
          className="animate-[ring_1.4s_var(--ease-out-expo)_infinite]"
        />
      </svg>
      <p role="status" className="text-[15px] font-semibold">
        Getting your photo ready
      </p>
      <p className="-mt-3 text-[13px] text-muted">Nothing is uploaded.</p>
    </main>
  );
}

const messages: Record<PhotoErrorReason, string> = {
  'not-an-image': 'That file is not a photo. Use a JPG, PNG or WebP image.',
  'heic-unsupported':
    'This browser cannot open HEIC photos. Pick the photo from your phone gallery, or export it as JPG first.',
  'decode-failed': 'The photo could not be opened. Try another JPG, PNG or WebP image.',
};

export function PhotoErrorScreen({
  reason,
  onRetry,
}: {
  reason: PhotoErrorReason;
  onRetry: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col items-center justify-center gap-5 p-6 text-center">
      <div className="flex h-36 w-36 items-center justify-center rounded-full border-2 border-dashed border-danger/60 text-danger">
        <Icon name="close" size={40} />
      </div>
      <h1 className="font-display text-2xl font-extrabold tracking-tight">That file didn’t open</h1>
      <p className="text-sm leading-relaxed text-muted">{messages[reason]}</p>
      <button
        type="button"
        onClick={onRetry}
        className="h-[52px] rounded-[18px] bg-accent px-6 text-[15px] font-bold text-on-accent active:scale-[0.98]"
      >
        Choose another photo
      </button>
    </main>
  );
}
