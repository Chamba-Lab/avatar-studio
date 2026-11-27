import { useRef, useState } from 'react';
import { themes } from '../themes/catalog.ts';
import type { Theme } from '../themes/types.ts';
import { FrameTab } from './panel/FrameTab.tsx';
import { PhotoTab } from './panel/PhotoTab.tsx';
import { StickerTab } from './panel/StickerTab.tsx';
import { tileBase } from './panel/styles.ts';
import type { Background, PhotoTransform } from './scene.ts';

export type Tab = 'photo' | 'frame' | 'stickers';

type Props = {
  tab: Tab;
  onTab: (tab: Tab) => void;
  frame: string | null;
  photo: PhotoTransform;
  background: Background;
  onBackground: (background: Background) => void;
  photoPreview: string;
  onFrame: (key: string | null) => void;
  /** How many copies of each sticker (by asset key) are on the avatar. */
  stickerUsage: Map<string, number>;
  /** Asset key of the sticker selected on the canvas, if any. */
  selectedRef: string | null;
  onSticker: (themeId: string, sticker: Theme['stickers'][number]) => void;
  onPhotoScale: (scale: number) => void;
  onRotatePhoto: () => void;
  onResetPhoto: () => void;
  onReplacePhoto: () => void;
};

const TABS: Array<{ id: Tab; label: string }> = [
  { id: 'photo', label: 'Photo' },
  { id: 'frame', label: 'Frame' },
  { id: 'stickers', label: 'Stickers' },
];

/** The editor's side panel (bottom sheet on a phone): section tabs, theme chips and the tab body. */
export function DecorPanel(props: Props) {
  const { tab, onTab } = props;
  const [themeId, setThemeId] = useState(themes[0]?.id);
  const theme = themes.find((t) => t.id === themeId) ?? themes[0];
  const tabIndex = TABS.findIndex((t) => t.id === tab);
  const tabButtons = useRef<Array<HTMLButtonElement | null>>([]);

  /** Arrow keys, Home and End move between tabs, as in the ARIA tabs pattern. */
  const onTabKey = (e: React.KeyboardEvent) => {
    const last = TABS.length - 1;
    const next =
      e.key === 'ArrowRight'
        ? (tabIndex + 1) % TABS.length
        : e.key === 'ArrowLeft'
          ? (tabIndex - 1 + TABS.length) % TABS.length
          : e.key === 'Home'
            ? 0
            : e.key === 'End'
              ? last
              : null;
    if (next === null) return;
    e.preventDefault();
    onTab(TABS[next].id);
    tabButtons.current[next]?.focus();
  };

  return (
    // Only the tab body scrolls, so the tabs and themes stay in reach on a short phone panel.
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div
        role="tablist"
        aria-label="Editor sections"
        onKeyDown={onTabKey}
        className="relative grid shrink-0 grid-cols-3 rounded-2xl bg-ink p-1"
      >
        <div
          aria-hidden="true"
          className="absolute top-1 bottom-1 left-1 w-[calc((100%-0.5rem)/3)] rounded-xl bg-raised shadow-[0_4px_12px_rgb(0_0_0/0.35)] transition-transform duration-300 ease-out-expo"
          style={{ transform: `translateX(${tabIndex * 100}%)` }}
        />
        {TABS.map((t, i) => (
          <button
            key={t.id}
            ref={(el) => {
              tabButtons.current[i] = el;
            }}
            id={`tab-${t.id}`}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            aria-controls="decor-panel"
            tabIndex={tab === t.id ? 0 : -1}
            onClick={() => onTab(t.id)}
            className={`relative h-11 text-sm font-semibold transition-colors ${tab === t.id ? 'text-text' : 'text-muted'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab !== 'photo' && (
        <div role="group" aria-label="Themes" className="flex shrink-0 gap-2 overflow-x-auto pb-1">
          {themes.map((t) => (
            <button
              key={t.id}
              type="button"
              aria-pressed={t.id === theme.id}
              onClick={() => setThemeId(t.id)}
              className={`flex h-11 shrink-0 items-center gap-2 rounded-full border pr-3.5 pl-2 text-[13px] font-semibold ${tileBase} ${
                t.id === theme.id ? 'border-accent bg-accent/14' : 'border-white/14'
              }`}
            >
              <img src={t.iconUrl} alt="" className="h-5 w-5" />
              {t.name}
            </button>
          ))}
          <span className="flex h-11 shrink-0 items-center rounded-full border border-dashed border-white/16 px-3 text-[13px] text-muted">
            More soon
          </span>
        </div>
      )}

      <div
        // Remounted per tab so each one starts scrolled to the top.
        key={tab}
        id="decor-panel"
        role="tabpanel"
        aria-labelledby={`tab-${tab}`}
        className="-mx-1 min-h-0 flex-1 overflow-y-auto px-1 pb-1"
      >
        {tab === 'stickers' && (
          <StickerTab
            theme={theme}
            usage={props.stickerUsage}
            selectedRef={props.selectedRef}
            onSticker={props.onSticker}
          />
        )}
        {tab === 'frame' && (
          <FrameTab
            theme={theme}
            frame={props.frame}
            photoPreview={props.photoPreview}
            onFrame={props.onFrame}
          />
        )}
        {tab === 'photo' && <PhotoTab {...props} />}
      </div>
    </div>
  );
}
