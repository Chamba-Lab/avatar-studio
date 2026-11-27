// Generates the Mood fire frame: `node design/themes/mood/fire.cjs <output folder>`.
// Cartoon fire in the sticker style: rounded teardrop tongues with curled tips, three tones, ink outline on the outer layer.
const fs = require('fs');
const out = process.argv[2];
const INK = '#111',
  DEEP = '#B71C1C',
  RED = '#E53935',
  ORANGE = '#FF8A3D',
  YELLOW = '#FFD54F';
const f1 = (n) => n.toFixed(1);
let seed = 21;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

// One flame tongue: base centred at (bx, by), width w, height h, tip leaning by lean, tip curling by curl.
const tongue = (bx, by, w, h, lean, curl) => {
  // Round belly, shoulders that stay apart until near the tip, and a tip that bends toward the curl side.
  const l = bx - w / 2,
    r = bx + w / 2,
    tx = bx + lean + curl * 0.6,
    ty = by - h;
  return (
    `M${f1(l)} ${f1(by)}` +
    ` C${f1(l - w * 0.28)} ${f1(by - h * 0.38)} ${f1(tx - w * 0.3)} ${f1(by - h * 0.72)} ${f1(tx)} ${f1(ty)}` +
    ` C${f1(tx + w * 0.22)} ${f1(by - h * 0.74)} ${f1(r + w * 0.3)} ${f1(by - h * 0.36)} ${f1(r)} ${f1(by)} Z`
  );
};

const C = 200,
  R = 192;
const flames = [];
// Angles in SVG space: 90Â° is the bottom. Cover the lower two-thirds of the ring.
for (let a = -20; a <= 200; a += 13 + rnd() * 5) {
  const t = (a * Math.PI) / 180;
  const bx = C + (R + 10) * Math.cos(t),
    by = C + (R + 10) * Math.sin(t) + 6;
  const low = Math.max(0, Math.sin(t)); // 1 at the bottom, 0 at the sides
  const h = 50 + 66 * Math.pow(low, 1.2) + rnd() * 20;
  const w = 30 + 14 * low + rnd() * 8;
  const lean = (rnd() - 0.5) * 16 + Math.cos(t) * -8; // lean slightly toward the middle
  const curl = (rnd() < 0.5 ? -1 : 1) * (8 + rnd() * 12);
  flames.push({ bx, by, w, h, lean, curl });
}
const layer = (k, color, outline) => {
  const d = flames
    .map(({ bx, by, w, h, lean, curl }) => tongue(bx, by + 2, w * k, h * k, lean * k, curl * k))
    .join('');
  return outline
    ? `<path d="${d}" fill="${color}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>`
    : `<path d="${d}" fill="${color}"/>`;
};
const back = (() => {
  seed = 77;
  let d = '';
  for (let a = -14; a <= 194; a += 16 + rnd() * 6) {
    const t = (a * Math.PI) / 180;
    const low = Math.max(0, Math.sin(t));
    const bx = C + (R + 10) * Math.cos(t),
      by = C + (R + 10) * Math.sin(t) + 8;
    d += tongue(
      bx,
      by,
      48 + 18 * low,
      44 + 50 * Math.pow(low, 1.2) + rnd() * 12,
      (rnd() - 0.5) * 14,
      (rnd() < 0.5 ? -1 : 1) * 10,
    );
  }
  return `<path d="${d}" fill="${DEEP}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>`;
})();
// Embers drifting up in the upper half.
seed = 4;
const embers = Array.from({ length: 9 }, () => {
  const t = Math.PI + rnd() * Math.PI,
    r = 150 + rnd() * 34;
  return `<circle cx="${f1(C + r * Math.cos(t))}" cy="${f1(C + r * Math.sin(t))}" r="${f1(2.5 + rnd() * 3)}" fill="${ORANGE}" stroke="${INK}" stroke-width="2"/>`;
}).join('');

const body = `<defs><clipPath id="c"><circle cx="200" cy="200" r="199"/></clipPath></defs><g clip-path="url(#c)">
${back}${layer(1, RED, true)}${layer(0.68, ORANGE, false)}${layer(0.38, YELLOW, false)}
${embers}
<circle cx="200" cy="200" r="194" fill="none" stroke="${DEEP}" stroke-width="10"/>
<circle cx="200" cy="200" r="198" fill="none" stroke="${INK}" stroke-width="5"/></g>`;
fs.writeFileSync(
  `${out}/on-fire.svg`,
  `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">${body}</svg>\n`,
);
