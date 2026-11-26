const matches = (query: string) =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia(query).matches;

/** A finger rather than a mouse: bigger handles, pinch instead of corners. */
export const prefersCoarsePointer = () => matches('(pointer: coarse)');

/** Checked at the moment of animating, so a change in system settings applies right away. */
export const prefersReducedMotion = () => matches('(prefers-reduced-motion: reduce)');
