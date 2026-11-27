// Generates the Mood fire frame: `node design/themes/mood/fire.cjs <output folder>`.
//
// Cartoon fire around the ring. One hand-drawn flame tongue (red, with orange and yellow inside)
// is repeated along a hot band at the edge, overlapping its neighbours so the whole fire reads as
// one shape. The single ink outline comes from drawing every tongue and the band in ink first and
// the colours on top. Flames rise: they lean upward, are tallest at the bottom and become small
// licks at the top so the ring stays whole.
const fs = require('fs');

const out = process.argv[2];
const INK = '#111';
const RED = '#E53935';
const ORANGE = '#FF8A3D';
const YELLOW = '#FFD54F';
const C = 200;
const f1 = (n) => n.toFixed(1);

// One flame, base centred at 0,0, pointing up (-y), about 60 wide and 104 tall.
const OUTER =
  'M-30 0 C-38 -28 -22 -46 -10 -60 C0 -72 -8 -86 6 -104 C8 -90 20 -78 26 -60 C32 -42 34 -16 30 0 Z';
const MIDDLE =
  'M-18 0 C-23 -18 -14 -30 -6 -40 C0 -48 -4 -57 5 -68 C6 -58 13 -50 16 -38 C20 -26 21 -10 18 0 Z';
const CORE =
  'M-8 0 C-11 -9 -6 -16 -2 -21 C1 -25 -1 -30 4 -36 C5 -30 8 -26 9 -19 C11 -12 11 -5 9 0 Z';

let seed = 7;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

// Walk around the ring, spacing tongues by their own width so neighbours always overlap.
const BASE_R = 190;
const tongues = [];
for (let a = -Math.PI / 2, i = 0; a < (3 * Math.PI) / 2 - 0.02; i++) {
  const low = (1 + Math.sin(a)) / 2; // 1 at the bottom, 0 at the top
  const s = (0.3 + 0.34 * Math.pow(low, 1.5)) * (i % 2 ? 0.78 : 1) * (0.92 + rnd() * 0.16);
  // Lean: the inward direction blended with "up", so flames rise.
  let dx = -Math.cos(a) * 0.6;
  let dy = -Math.sin(a) * 0.6 - 0.4;
  const len = Math.hypot(dx, dy);
  dx /= len;
  dy /= len;
  const rot = (Math.atan2(dx, -dy) * 180) / Math.PI;
  tongues.push({
    x: C + BASE_R * Math.cos(a),
    y: C + BASE_R * Math.sin(a),
    rot,
    s,
    flip: i % 3 === 1 ? -1 : 1,
  });
  a += (60 * s * 0.82) / BASE_R;
}

const place = (t, inner) =>
  `<g transform="translate(${f1(t.x)} ${f1(t.y)}) rotate(${f1(t.rot)}) scale(${f1(t.s * t.flip)} ${f1(t.s)})">${inner(t)}</g>`;
// Stroke widths are divided by the tongue scale so the outline is even everywhere.
const ink = tongues
  .map((t) =>
    place(
      t,
      () =>
        `<path d="${OUTER}" fill="${INK}" stroke="${INK}" stroke-width="${f1(9 / t.s)}" stroke-linejoin="round"/>`,
    ),
  )
  .join('');
const colour = tongues
  .map((t) =>
    place(
      t,
      () =>
        `<path d="${OUTER}" fill="${RED}"/><path d="${MIDDLE}" fill="${ORANGE}"/><path d="${CORE}" fill="${YELLOW}"/>`,
    ),
  )
  .join('');

const body = `<defs><clipPath id="c"><circle cx="200" cy="200" r="199"/></clipPath></defs>
<g clip-path="url(#c)">
<circle cx="200" cy="200" r="199" fill="none" stroke="${INK}" stroke-width="40"/>
${ink}
<circle cx="200" cy="200" r="199" fill="none" stroke="${RED}" stroke-width="30"/>
${colour}
<circle cx="200" cy="200" r="199" fill="none" stroke="${ORANGE}" stroke-width="18"/>
<circle cx="200" cy="200" r="199" fill="none" stroke="${YELLOW}" stroke-width="8"/>
<circle cx="200" cy="200" r="199" fill="none" stroke="${INK}" stroke-width="4"/>
</g>`;

fs.writeFileSync(
  `${out}/on-fire.svg`,
  `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">${body}</svg>\n`,
);
