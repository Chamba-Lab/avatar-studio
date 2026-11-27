// Generates the Mood fire frame: `node design/themes/mood/fire.cjs <output folder>`.
//
// Fire only along the bottom of the circle, as if the avatar sat on it: fire rises, so it never
// hangs from the top. One hand-drawn cartoon flame (curled main tip, side licks, wide base, orange
// and yellow layers inside) is repeated along a band of embers, tallest in the middle and smaller
// toward the sides. Every flame and the band are drawn in ink first and in colour on top, so the
// whole fire shares a single outline.
const fs = require('fs');

const out = process.argv[2];
const INK = '#111';
const RED = '#E53935';
const ORANGE = '#FF8A3D';
const YELLOW = '#FFD54F';
const C = 200;
const f1 = (n) => n.toFixed(1);

// One flame, base centred at 0,0, pointing up: about 80 wide and 116 tall.
const FLAME =
  'M-34 0 C-44 -20 -34 -40 -27 -50 C-33 -62 -36 -74 -30 -88 C-24 -76 -17 -70 -12 -66 ' +
  'C-14 -84 -6 -100 8 -116 C6 -100 14 -90 22 -80 C26 -86 30 -92 32 -100 ' +
  'C40 -82 42 -60 37 -40 C34 -22 38 -10 32 0 Z';

// Flames are placed along this arc of the circle.
const FROM = 26; // degrees, SVG angles (90 is the bottom); matches where the ember band ends
const TO = 154;
// The band of embers: a crescent, `depth` thick at the bottom and thinning to nothing where the
// side flames start. It is the circle minus a larger circle placed above.
const band = (depth, color) =>
  `<g mask="url(#m${depth})"><circle cx="200" cy="200" r="199" fill="${color}"/></g>`;
const mask = (depth) =>
  `<mask id="m${depth}"><rect width="400" height="400" fill="#fff"/><circle cx="200" cy="${399 - depth - 250}" r="250" fill="#000"/></mask>`;

// Flames along the band, tallest at the bottom, leaning a little toward the middle.
const flames = [];
const STEPS = 11;
for (let i = 0; i < STEPS; i++) {
  const deg = FROM + 2 + ((TO - FROM - 4) * i) / (STEPS - 1);
  const t = (deg * Math.PI) / 180;
  const low = Math.sin(t); // 1 at the bottom
  const s = (0.26 + 0.44 * Math.pow(low, 3)) * (i % 2 ? 0.86 : 1);
  // Sit each flame inside the band, which is thinner toward the ends.
  const lowest = Math.sin((FROM * Math.PI) / 180);
  const band = 36 * Math.max(0, (low - lowest) / (1 - lowest));
  const r = 199 - 3 - band * 0.55;
  flames.push({
    x: C + r * Math.cos(t),
    y: C + r * Math.sin(t) + 6,
    rot: -(90 - deg) * 0.35,
    s,
    flip: i % 2 ? -1 : 1,
  });
}
// Small ones first, so the tall middle flames sit in front.
flames.sort((a, b) => a.s - b.s);

const place = (f, inner) =>
  `<g transform="translate(${f1(f.x)} ${f1(f.y)}) rotate(${f1(f.rot)}) scale(${f1(f.s * f.flip)} ${f1(f.s)})">${inner}</g>`;
const ink = flames
  .map((f) =>
    place(
      f,
      `<path d="${FLAME}" fill="${INK}" stroke="${INK}" stroke-width="${f1(10 / f.s)}" stroke-linejoin="round"/>`,
    ),
  )
  .join('');
const colour = flames
  .map((f) =>
    place(
      f,
      `<path d="${FLAME}" fill="${RED}"/>` +
        `<path d="${FLAME}" fill="${ORANGE}" transform="scale(0.66)"/>` +
        `<path d="${FLAME}" fill="${YELLOW}" transform="scale(0.36)"/>`,
    ),
  )
  .join('');

const body = `<defs><clipPath id="c"><circle cx="200" cy="200" r="199"/></clipPath>${mask(42)}${mask(36)}${mask(20)}${mask(9)}</defs>
<g clip-path="url(#c)">
${band(42, INK)}
${ink}
${band(36, RED)}
${colour}
${band(20, ORANGE)}
${band(9, YELLOW)}
</g>`;

fs.writeFileSync(
  `${out}/on-fire.svg`,
  `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">${body}</svg>\n`,
);
