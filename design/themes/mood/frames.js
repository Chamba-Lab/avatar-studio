// Mood frame proposals, written to the scratch folder for review (not the repo yet).
const fs = require('fs');
const out = process.argv[2];
const repo = 'src/themes/mood/stickers/';
const INK = '#111',
  RED = '#E53935',
  CREAM = '#FCF6E8';
const svg = (body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">${body}</svg>\n`;
const f1 = (n) => n.toFixed(1);
const clip = '<defs><clipPath id="c"><circle cx="200" cy="200" r="199"/></clipPath></defs>';

// A · Screentone: manga halftone that grows toward the edge, like a shaded panel.
const halftone = (color, from, step, maxR) => {
  let dots = '';
  const a = Math.PI / 4;
  for (let i = -40; i <= 40; i++) {
    for (let j = -40; j <= 40; j++) {
      const x = 200 + (i * Math.cos(a) - j * Math.sin(a)) * step;
      const y = 200 + (i * Math.sin(a) + j * Math.cos(a)) * step;
      const r = Math.hypot(x - 200, y - 200);
      if (r < from || r > 204) continue;
      const t = (r - from) / (199 - from);
      const dr = maxR * Math.pow(Math.min(t, 1), 1.15);
      if (dr > 0.35) dots += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(dr)}"/>`;
    }
  }
  return `<g fill="${color}">${dots}</g>`;
};
fs.writeFileSync(
  `${out}/screentone.svg`,
  svg(`${clip}<g clip-path="url(#c)">${halftone(INK, 128, 9, 5.4)}
<circle cx="200" cy="200" r="196" fill="none" stroke="${CREAM}" stroke-width="10"/><circle cx="200" cy="200" r="196" fill="none" stroke="${INK}" stroke-width="5"/></g>`),
);

// C · Seeing red: the same screentone in red, with a red rim.
fs.writeFileSync(
  `${out}/seeing-red.svg`,
  svg(`${clip}<g clip-path="url(#c)">${halftone(RED, 120, 9, 5.6)}
<circle cx="200" cy="200" r="195" fill="none" stroke="${RED}" stroke-width="12"/><circle cx="200" cy="200" r="199" fill="none" stroke="${INK}" stroke-width="5"/></g>`),
);

// D · Worried: the same screentone in orange, the step below anger.
fs.writeFileSync(
  `${out}/worried.svg`,
  svg(`${clip}<g clip-path="url(#c)">${halftone('#FB8C00', 120, 9, 5.6)}
<circle cx="200" cy="200" r="195" fill="none" stroke="#FB8C00" stroke-width="12"/><circle cx="200" cy="200" r="199" fill="none" stroke="${INK}" stroke-width="5"/></g>`),
);

// B · Mood ring: a bold band with the theme's own reaction stickers pinned to it.
const inner = (f) =>
  fs
    .readFileSync(repo + f, 'utf8')
    .replace(/^<svg[^>]*>/, '')
    .replace(/<\/svg>\s*$/, '');
const badge = (f, deg, size, rot) => {
  const t = (deg * Math.PI) / 180,
    r = 154;
  const x = 200 + r * Math.cos(t) - size / 2,
    y = 200 + r * Math.sin(t) - size / 2;
  return `<g transform="rotate(${rot} ${f1(x + size / 2)} ${f1(y + size / 2)})"><svg x="${f1(x)}" y="${f1(y)}" width="${size}" height="${size}" viewBox="0 0 200 200">${inner(f)}</svg></g>`;
};
const band = `<circle cx="200" cy="200" r="184" fill="none" stroke="${INK}" stroke-width="30"/>
<circle cx="200" cy="200" r="184" fill="none" stroke="${RED}" stroke-width="20"/>
<circle cx="200" cy="200" r="184" fill="none" stroke="#EF6A66" stroke-width="3" stroke-dasharray="2 14" stroke-linecap="round"/>`;
fs.writeFileSync(
  `${out}/mood-ring.svg`,
  svg(`${clip}<g clip-path="url(#c)">${band}
${badge('exclamation.svg', -132, 86, -8)}${badge('anger-vein.svg', -46, 80, 0)}${badge('sweat-drop.svg', 22, 66, 12)}${badge('huff.svg', 150, 92, 0)}</g>`),
);
