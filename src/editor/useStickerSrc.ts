import { useEffect, useState } from 'react';
import { assets } from '../themes/catalog.ts';
import { tintSvg } from '../themes/tint.ts';

const svgText = new Map<string, Promise<string>>();
const tinted = new Map<string, string>();

/** The SVG source of a sticker file, fetched once. It is one of the app's own static files. */
function loadSvg(src: string): Promise<string> {
  let text = svgText.get(src);
  if (!text) {
    text = fetch(src).then((r) => r.text());
    svgText.set(src, text);
  }
  return text;
}

/**
 * The image URL to draw for a sticker: its own file, or for a tinted one a recoloured copy of the
 * SVG as a data URL. Until the recoloured copy is ready, the original is shown.
 */
export function useStickerSrc(ref: string, tint: string | undefined): string | undefined {
  const info = assets.get(ref);
  const key = info?.tint && tint ? `${ref}|${tint}` : null;
  const [, setReady] = useState(0);

  useEffect(() => {
    if (!key || !info?.tint || !tint || tinted.has(key)) return;
    let cancelled = false;
    const colors = info.tint.colors;
    loadSvg(info.src)
      .then((text) => {
        tinted.set(
          key,
          `data:image/svg+xml;charset=utf-8,${encodeURIComponent(tintSvg(text, colors, tint))}`,
        );
        if (!cancelled) setReady((n) => n + 1);
      })
      .catch(() => console.warn(`Could not tint sticker: ${ref}`));
    return () => {
      cancelled = true;
    };
  }, [key, info, tint, ref]);

  return (key && tinted.get(key)) || info?.src;
}
