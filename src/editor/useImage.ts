import { useEffect, useState } from 'react';

const cache = new Map<string, HTMLImageElement>();

/** Loads an image URL once and shares it between every node that uses it. */
export function useImage(src: string | undefined): HTMLImageElement | null {
  const [loaded, setLoaded] = useState<{ src: string; img: HTMLImageElement } | null>(null);

  useEffect(() => {
    if (!src || cache.has(src)) return;
    let cancelled = false;
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      cache.set(src, img);
      if (!cancelled) setLoaded({ src, img });
    };
    img.src = src;
    return () => {
      cancelled = true;
    };
  }, [src]);

  if (!src) return null;
  return cache.get(src) ?? (loaded?.src === src ? loaded.img : null);
}
