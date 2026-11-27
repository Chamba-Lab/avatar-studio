// Generates the Mood screentone frames: `node design/themes/mood/frames.cjs <output folder>`.
// Manga halftone dots on a 45° grid that grow toward the edge, with a coloured rim.
const fs = require('fs');

const out = process.argv[2];
const INK = '#111';
const svg = (body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">${body}</svg>\n`;
const f1 = (n) => n.toFixed(1);
const clip = '<defs><clipPath id="c"><circle cx="200" cy="200" r="199"/></clipPath></defs>';

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

const screentone = (color) =>
  svg(`${clip}<g clip-path="url(#c)">${halftone(color, 120, 9, 5.6)}
<circle cx="200" cy="200" r="195" fill="none" stroke="${color}" stroke-width="12"/><circle cx="200" cy="200" r="199" fill="none" stroke="${INK}" stroke-width="5"/></g>`);

// Seeing red: anger. Worried: the same in orange, one level below.
fs.writeFileSync(`${out}/seeing-red.svg`, screentone('#E53935'));
fs.writeFileSync(`${out}/worried.svg`, screentone('#FB8C00'));
