// Generates the Mood fire frame: `node design/themes/mood/fire.cjs <output folder>`.
//
// Simple cartoon fire along the bottom of the circle, in the spirit of the "This is fine" flames:
// a few tall, wavy S-shaped tongues of different heights, joined into one mass, orange outside and
// yellow inside, with a thin outline. Fire rises, so there is nothing at the top.
//
// The outline is drawn by hand as a straight wall of fire, then bent along the bottom arc of the
// circle: the base follows the edge (a crescent) and the tongues rise.
const fs = require('fs');

const out = process.argv[2];
const INK = '#111';
const ORANGE = '#FF6A1A';
const YELLOW = '#FFC531';

// The straight wall, left to right: small tongue, tall tongue, small lick, the tallest in the
// middle, tall, small. x is the position along the fire, y the height (valleys near y = 385).
const FIRE = [
  'M-10 470 L-10 430',
  'C8 400 16 330 22 306 C28 284 24 270 36 252 C40 280 50 304 54 330 C57 352 62 372 70 388',
  'C82 370 78 346 90 326 C102 306 96 290 112 272 C116 294 132 308 138 332 C142 350 148 368 158 382',
  'C166 368 170 354 178 346 C186 338 184 330 190 322 C196 336 200 348 204 356',
  'C206 334 214 312 210 290 C208 272 216 258 228 246 C226 268 244 286 250 312 C254 334 252 356 262 380',
  'C272 362 270 342 282 324 C292 308 288 296 302 282 C306 304 320 318 324 340 C326 356 332 370 342 384',
  'C350 366 350 336 358 314 C364 294 362 280 372 262 C380 290 392 312 394 340 C396 362 404 400 412 430',
  'L412 470 Z',
].join(' ');

// The yellow core: the same wall squashed toward its base, so each tongue has a hot inside.
const core = ([x, y]) => [0.94 * x + 12, 0.6 * y + 168];

// --- Bending the wall along the bottom arc ---------------------------------------------------
const C = 200;
const BASE_Y = 400; // wall height 0
const HEIGHT = 0.8; // flame height after bending
const SPAN = 60; // degrees on each side of the bottom

/** Samples a path of absolute M, L, C and Z commands into points. */
function sample(d) {
  const tokens = d.match(/[MLCZ]|-?\d*\.?\d+/g);
  const pts = [];
  let cur = [0, 0];
  let i = 0;
  const num = () => Number(tokens[i++]);
  while (i < tokens.length) {
    const cmd = tokens[i++];
    if (cmd === 'M' || cmd === 'L') {
      cur = [num(), num()];
      pts.push(cur);
    } else if (cmd === 'C') {
      const c1 = [num(), num()];
      const c2 = [num(), num()];
      const end = [num(), num()];
      for (let k = 1; k <= 16; k++) {
        const t = k / 16;
        const u = 1 - t;
        pts.push(
          [0, 1].map(
            (j) =>
              u * u * u * cur[j] +
              3 * u * u * t * c1[j] +
              3 * u * t * t * c2[j] +
              t * t * t * end[j],
          ),
        );
      }
      cur = end;
    }
  }
  return pts;
}

/** x becomes the angle on the arc, height above BASE_Y becomes distance from the edge. */
function bend([x, y]) {
  const t = ((90 + ((C - x) / 211) * SPAN) * Math.PI) / 180;
  // Flames rise: their direction mixes "toward the centre" with "up".
  let dx = -Math.cos(t) * 0.35;
  let dy = -Math.sin(t) * 0.35 - 0.65;
  const len = Math.hypot(dx, dy);
  dx /= len;
  dy /= len;
  const h = (BASE_Y - y) * HEIGHT;
  return [C + 203 * Math.cos(t) + dx * h, C + 203 * Math.sin(t) + dy * h];
}

const toPath = (pts) => `M${pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L')} Z`;
/** The wall's flat bottom edge, sampled so it follows the arc once bent. */
const bottom = (y) => Array.from({ length: 41 }, (_, k) => [412 - (422 * k) / 40, y]);
const outer = toPath([...sample(FIRE), ...bottom(470)].map(bend));
const inner = toPath([...sample(FIRE).map(core), ...bottom(core([0, 470])[1])].map(bend));

const body = `<defs><clipPath id="c"><circle cx="200" cy="200" r="199"/></clipPath></defs>
<g clip-path="url(#c)">
<path d="${outer}" fill="${ORANGE}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
<path d="${inner}" fill="${YELLOW}"/>
</g>`;

fs.writeFileSync(
  `${out}/on-fire.svg`,
  `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">${body}</svg>\n`,
);
