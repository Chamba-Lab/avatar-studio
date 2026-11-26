import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { prefersCoarsePointer } from '../ui/media.ts';

/** One fingertip: a solid dot with a soft halo, like a touch indicator in a screen recording. */
function Touch({ className }: { className: string }) {
  return (
    <g className={className}>
      <circle r="19" fill="var(--color-accent)" opacity="0.28" />
      <circle r="10" fill="var(--color-accent)" stroke="var(--color-text)" strokeWidth="2.5" />
    </g>
  );
}

/** Touch: one finger drags, then two fingers pinch apart and turn. */
function TouchDemo() {
  return (
    <svg viewBox="0 0 200 200" className="guide-demo" aria-hidden="true">
      <path
        d="M66 100H134"
        className="guide-trail"
        stroke="var(--color-accent)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="2 9"
        fill="none"
      />
      <Touch className="guide-drag" />
      <Touch className="guide-pinch-a" />
      <Touch className="guide-pinch-b" />
    </svg>
  );
}

/** Mouse: drag the sticker, then pull a corner handle out to resize, as with the real handles. */
function PointerDemo() {
  return (
    <svg viewBox="0 0 200 200" className="guide-demo" aria-hidden="true">
      <g className="guide-box">
        <rect
          x="-40"
          y="-40"
          width="80"
          height="80"
          rx="4"
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="2"
          strokeDasharray="6 5"
        />
        {[
          [-40, -40],
          [40, -40],
          [-40, 40],
        ].map(([x, y]) => (
          <rect
            key={`${x}${y}`}
            x={x - 5}
            y={y - 5}
            width="10"
            height="10"
            rx="2"
            fill="var(--color-text)"
          />
        ))}
        <rect x="35" y="35" width="10" height="10" rx="2" fill="var(--color-accent)" />
      </g>
      <path
        className="guide-cursor"
        d="M0 0v22l6-6 4 9 4-2-4-9h8z"
        fill="var(--color-text)"
        stroke="var(--color-ink)"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type Props = { stage: RefObject<HTMLElement | null>; onDone: () => void };

/** Where the canvas sits on screen, kept current through resizes and rotation. */
function useRect(ref: RefObject<HTMLElement | null>) {
  const [rect, setRect] = useState<DOMRect | null>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setRect(el.getBoundingClientRect());
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener('resize', update);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [ref]);
  return rect;
}

/**
 * Shown the first time someone opens the editor: an animated demo of the two gestures plays over
 * the canvas while the steps sit lower down (over the panel on a phone, where the canvas is too
 * small to share), with the step being shown lit up. Any tap closes it.
 */
export function FirstUseGuide({ stage, onDone }: Props) {
  const [touch] = useState(prefersCoarsePointer);
  const rect = useRect(stage);
  const demo = rect ? Math.min(240, Math.min(rect.width, rect.height) * 0.62) : 0;
  const [leaving, setLeaving] = useState(false);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    button.current?.focus({ preventScroll: true });
  }, []);

  const close = () => {
    if (leaving) return;
    setLeaving(true);
    // Let the fade-out play; reduced motion makes it near-instant through the global rule.
    window.setTimeout(onDone, 220);
  };

  const steps = touch
    ? ['Drag to move', 'Pinch to resize and turn']
    : ['Drag to move', 'Drag a corner to resize'];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="guide-title"
      onPointerDown={(e) => {
        // A tap outside the card dismisses; the card's own button handles itself.
        if (e.target === e.currentTarget) close();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') close();
      }}
      className={`fixed inset-0 z-30 bg-ink-deep/60 transition-opacity duration-200 ${
        leaving ? 'opacity-0' : 'animate-[guide-in_420ms_var(--ease-out-expo)_both]'
      }`}
    >
      {rect && (
        <div
          style={{
            left: rect.left + rect.width / 2 - demo / 2,
            top: rect.top + rect.height / 2 - demo / 2,
            width: demo,
            height: demo,
          }}
          className="pointer-events-none absolute"
        >
          {touch ? <TouchDemo /> : <PointerDemo />}
        </div>
      )}

      <div className="absolute inset-x-4 bottom-[max(1.25rem,env(safe-area-inset-bottom))] mx-auto flex max-w-[360px] animate-[pop-in_420ms_120ms_var(--ease-out-expo)_both] flex-col gap-3.5 rounded-[26px] border border-white/10 bg-raised p-4 shadow-[0_18px_40px_rgb(0_0_0/0.5)] lg:right-[416px] lg:bottom-6">
        <h2 id="guide-title" className="sr-only">
          How to edit
        </h2>
        <ol className="flex flex-col gap-2">
          {steps.map((text, i) => (
            <li key={text} className="flex items-center gap-2.5 text-[15px] font-medium">
              <span
                className={`guide-step-${i + 1} flex h-7 w-7 shrink-0 items-center justify-center rounded-[9px] bg-surface text-[13px] font-bold`}
              >
                {i + 1}
              </span>
              {text}
            </li>
          ))}
        </ol>
        <button
          ref={button}
          type="button"
          onClick={close}
          className="h-12 rounded-[16px] bg-accent text-[15px] font-bold text-on-accent transition-transform active:scale-[0.98]"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
