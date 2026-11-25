import { useEffect, useMemo, useState } from 'react';
import { Icon } from '../ui/Icon.tsx';

type Props = {
  png: Blob;
  onBack: () => void;
  onStartOver: () => void;
};

const FILE_NAME = 'avatar-studio.png';

/** Discord, Instagram, Facebook and similar in-app browsers often block downloads. */
const inAppBrowser =
  typeof navigator !== 'undefined' &&
  /(Discord|FBAN|FBAV|Instagram|Line\/|; wv\))/i.test(navigator.userAgent);

export function SaveScreen({ png, onBack, onStartOver }: Props) {
  const url = useMemo(() => URL.createObjectURL(png), [png]);
  useEffect(() => () => URL.revokeObjectURL(url), [url]);
  const file = useMemo(() => new File([png], FILE_NAME, { type: 'image/png' }), [png]);
  const canShare = typeof navigator !== 'undefined' && !!navigator.canShare?.({ files: [file] });
  const [status, setStatus] = useState<string | null>(null);

  const share = async () => {
    try {
      await navigator.share({ files: [file], title: 'My avatar' });
    } catch (e) {
      if ((e as DOMException).name !== 'AbortError')
        setStatus('Sharing failed. Try Download instead.');
    }
  };

  const download = () => {
    const a = document.createElement('a');
    a.href = url;
    a.download = FILE_NAME;
    a.click();
    setStatus('Saved to your downloads.');
  };

  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col overflow-hidden px-5 pb-[max(1.75rem,env(safe-area-inset-bottom))] lg:max-w-xl">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {['#f7b696', '#7ce0c3', '#f9a825', '#e53935', '#b8a6ff', '#f7b696'].map((c, i) => (
          <span
            key={i}
            className="absolute top-0 h-3.5 w-2.5 animate-[confetti_3.6s_linear_infinite] rounded-[3px]"
            style={{ left: `${8 + i * 16}%`, background: c, animationDelay: `${-i * 0.6}s` }}
          />
        ))}
      </div>

      <header className="relative flex h-16 items-center justify-between">
        <button
          type="button"
          aria-label="Back to editor"
          onClick={onBack}
          className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-surface active:scale-95"
        >
          <Icon name="back" />
        </button>
        <span className="text-[13px] text-muted">PNG · 1024 × 1024</span>
      </header>

      <div className="relative flex flex-1 flex-col items-center justify-center gap-6 py-4">
        <div className="relative animate-[land_700ms_var(--ease-out-expo)_both]">
          <img
            src={url}
            alt="Your decorated avatar"
            className="h-[min(60vw,34dvh,300px)] w-[min(60vw,34dvh,300px)] rounded-full shadow-[0_30px_60px_rgb(0_0_0/0.45)]"
          />
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-confirm px-3 py-1 text-xs font-bold tracking-wide text-on-confirm">
            READY
          </span>
        </div>

        <div className="flex flex-col items-center gap-1.5 text-center">
          <h1 className="font-display text-[34px] font-extrabold tracking-[-0.03em]">
            Looking good.
          </h1>
          <p className="text-sm text-muted">Your avatar is packed and ready to drop.</p>
        </div>

        <div
          className="flex w-full gap-3 rounded-[20px] border border-white/7 bg-surface p-3.5"
          aria-label="Chat preview"
        >
          <img src={url} alt="" className="h-10 w-10 shrink-0 rounded-full" />
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-bold">
              you <span className="text-xs font-normal text-muted">today</span>
            </span>
            <span className="text-sm text-text/85">new avatar just dropped</span>
          </div>
        </div>

        {inAppBrowser && (
          <p className="rounded-2xl border border-accent/30 bg-accent/8 p-3.5 text-[13px] leading-relaxed text-text/90">
            This browser may not save images. Press and hold the avatar above to save it, or open
            this page in your browser from the <span aria-hidden="true">⋯</span> menu.
          </p>
        )}
      </div>

      <div className="relative flex flex-col gap-2.5">
        {canShare && (
          <button
            type="button"
            onClick={share}
            className="flex h-[60px] items-center justify-center gap-2.5 rounded-[20px] bg-accent text-[17px] font-bold text-on-accent active:scale-[0.98]"
          >
            <Icon name="share" />
            Share or save
          </button>
        )}
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={download}
            className={`flex h-[52px] flex-1 items-center justify-center gap-2 rounded-[18px] text-[15px] font-semibold active:scale-[0.98] ${
              canShare ? 'border border-white/12 bg-surface' : 'bg-accent font-bold text-on-accent'
            }`}
          >
            <Icon name="download" size={18} />
            Download
          </button>
          <button
            type="button"
            onClick={onStartOver}
            className="flex h-[52px] flex-1 items-center justify-center rounded-[18px] border border-white/12 text-[15px] font-semibold text-muted active:scale-[0.98]"
          >
            Start over
          </button>
        </div>
        <p role="status" className="min-h-5 text-center text-[13px] text-muted">
          {status}
        </p>
      </div>
    </main>
  );
}
