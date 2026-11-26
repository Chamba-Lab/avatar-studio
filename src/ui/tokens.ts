/**
 * Design tokens needed in JavaScript: the canvas (Konva) and inline styles cannot read the CSS
 * custom properties in index.css. Keep the two in sync.
 */
export const color = {
  text: '#f6f1ea',
  accent: '#f7b696',
  confirm: '#7ce0c3',
  inkDeep: '#0c0b0f',
} as const;
