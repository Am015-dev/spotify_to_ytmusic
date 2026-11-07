// Temporary art (until the owner's Flow pictures): draws every Wildmark slot in assets.json as a code-drawn shape in the game's
// palette with one game-icons.net icon on it (CC BY 3.0, credits in ASSETS.md and Menu > About), as temp-art/<stem>.webp.
// Pictures only fill slots; a Flow file with the same stem replaces each one with zero code changes.
//   git clone --depth 1 --filter=blob:none --sparse https://github.com/game-icons/icons.git <dir>
//   (cd <dir> && git sparse-checkout set delapouite lorc) ; node tools/temp-art.js <dir> [outdir]
const fs = require('fs'), path = require('path');
const { chromium } = require(path.join(__dirname, '../../node_modules/playwright'));
const GI = process.argv[2], OUT = process.argv[3] || path.join(__dirname, '../temp-art');
const MANIFEST = path.join(__dirname, '../assets.json');
if (!GI) { console.error('usage: node tools/temp-art.js <game-icons clone dir> [outdir]'); process.exit(1); }

const INK = '#2a2014', CREAM = '#fff8e6', PARCH = '#efe3c4';
const TER = { peak: ['#8d939b', 'lorc/mountaintop'], forest: ['#2f5d3a', 'lorc/pine-tree'], meadow: ['#c9a84a', 'lorc/wheat'],
  marsh: ['#3f8f86', 'delapouite/reed'], river: ['#3f7fb8', 'delapouite/river'] };
const ANIMAL = { bear: ['#7a4e2d', 'delapouite/bear-head'], elk: ['#b08452', 'lorc/stag-head'], salmon: ['#e0825a', 'lorc/fish-corpse'],
  hawk: ['#4f6d8a', 'lorc/hawk-emblem'], fox: ['#d9652b', 'lorc/fox-head'], acorn: ['#c59a3a', 'lorc/acorn'] };
const PORTRAIT = { ranger: 'lorc/hood', rowan: 'lorc/oak', pip: 'lorc/sprout', bram: 'lorc/beard', sorrel: 'lorc/curled-leaf',
  quill: 'lorc/feather', linnet: 'lorc/bird-twitter', oake: 'lorc/tree-branch', warden: 'lorc/stone-tower', frost: 'lorc/snowflake-1',
  snowline: 'lorc/mountains' };
const SETS = { a: ['#c9a84a', 1], b: ['#7fa35a', 2], c: ['#8a7fb8', 3], d: ['#c46f5a', 4] }; // card set tint, dot count

// The icon's own inner SVG, recoloured: strip the bounding rect and every per-path fill, then paint it in one colour.
const cache = {};
function icon(rel) {
  if (cache[rel]) return cache[rel];
  const f = path.join(GI, rel + '.svg');
  if (!fs.existsSync(f)) throw new Error('missing icon ' + rel + ' (' + f + ')');
  let inner = fs.readFileSync(f, 'utf8').replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
  inner = inner.replace(/<path d="M0 0h512v512H0z"\s*\/>/g, '').replace(/\sfill="[^"]*"/g, '');
  return (cache[rel] = inner);
}
// place icon (512 units) with its top-left at x,y, size px, colour, opacity
const put = (rel, x, y, size, col, op = 1) => `<g transform="translate(${x} ${y}) scale(${size / 512})" fill="${col}" opacity="${op}">${icon(rel)}</g>`;
const wrap = (w, h, defs, body) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs>${defs}</defs>${body}</svg>`;
const grad = (id, c1, c2) => `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>`;

const SLOT = {};
// ---- boards and backgrounds (opaque)
SLOT['title-bg'] = () => wrap(1920, 1080, grad('g', '#cfe3e8', '#5d7f5a'),
  `<rect width="1920" height="1080" fill="url(#g)"/>` + put('lorc/mountains', 410, 140, 1100, '#2f4a3a', 0.28) + put('delapouite/river', 560, 620, 800, '#3f7fb8', 0.22));
SLOT['table-bg'] = () => { let b = `<rect width="1920" height="1080" fill="#2f5d3a"/>`;
  for (let y = 0; y < 1080; y += 270) for (let x = 0; x < 1920; x += 240) b += put('delapouite/forest', x + 20, y + 20, 220, '#1d3a24', 0.22);
  return wrap(1920, 1080, '', b); };
SLOT['result-win'] = () => wrap(1600, 900, grad('g', '#f6d36b', '#b98a2a'), `<rect width="1600" height="900" fill="url(#g)"/>` + put('lorc/crown', 540, 190, 520, '#5a3d0f', 0.35));
SLOT['result-lose'] = () => wrap(1600, 900, grad('g', '#7d8a96', '#2f3a44'), `<rect width="1600" height="900" fill="url(#g)"/>` + put('lorc/waves', 540, 190, 520, '#e6edf2', 0.3));

// ---- terrain fills (512, opaque, tileable-ish: the icons sit inside the square)
for (const t in TER) SLOT['ter-' + t] = () => { const [c, rel] = TER[t]; let b = `<rect width="512" height="512" fill="${c}"/>`;
  for (const [x, y] of [[128, 128], [384, 128], [128, 384], [384, 384]]) b += put(rel, x - 90, y - 90, 180, '#000', 0.2);
  return wrap(512, 512, '', b); };

// ---- animal tokens (512, transparent outside the disc)
for (const a in ANIMAL) SLOT['tok-' + a] = () => { const [c, rel] = ANIMAL[a];
  return wrap(512, 512, '', `<circle cx="256" cy="256" r="236" fill="${c}" stroke="${INK}" stroke-width="16"/>` +
    `<circle cx="256" cy="256" r="200" fill="none" stroke="${CREAM}" stroke-opacity=".6" stroke-width="8"/>` + put(rel, 116, 116, 280, CREAM)); };

// ---- scoring cards (600x840): one frame per animal and set (set = tint and dot count)
for (const a of ['bear', 'elk', 'salmon', 'hawk', 'fox']) for (const s in SETS) SLOT['card-' + a + '-' + s] = () => { const [c, rel] = ANIMAL[a], [tint, n] = SETS[s];
  let b = `<rect x="8" y="8" width="584" height="824" rx="36" fill="${PARCH}" stroke="${c}" stroke-width="18"/>` +
    `<rect x="36" y="36" width="528" height="768" rx="20" fill="${tint}" fill-opacity=".35" stroke="${INK}" stroke-opacity=".5" stroke-width="4"/>` +
    `<circle cx="300" cy="380" r="190" fill="${c}" fill-opacity=".2"/>` + put(rel, 120, 200, 360, c);
  for (let i = 0; i < n; i++) b += `<circle cx="${300 - (n - 1) * 26 + i * 52}" cy="720" r="16" fill="${c}"/>`;
  return wrap(600, 840, '', b); };

// ---- story portraits (768, opaque): a medallion with one icon
for (const p in PORTRAIT) SLOT['portrait-' + p] = () => wrap(768, 768, grad('g', '#e9dcbc', '#8fa18a'),
  `<rect width="768" height="768" fill="url(#g)"/><circle cx="384" cy="384" r="290" fill="#f4ecd8" stroke="${INK}" stroke-width="16"/>` +
  put(PORTRAIT[p], 194, 194, 380, INK));

// ---- top bar crest (256, transparent outside the shield)
SLOT['icon-logo'] = () => wrap(256, 256, '', `<path d="M128 16 L232 56 L232 140 C232 200 190 232 128 248 C66 232 24 200 24 140 L24 56 Z" fill="#2f5d3a" stroke="#e3c64a" stroke-width="12"/>` + put('lorc/pine-tree', 53, 40, 150, CREAM));

(async () => {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8')).items;
  const stems = manifest.map(i => i.stem), missing = stems.filter(s => !SLOT[s]), extra = Object.keys(SLOT).filter(s => !stems.includes(s));
  if (missing.length || extra.length) { console.error('slot mismatch; missing:', missing, 'extra:', extra); process.exit(1); }
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] }), pg = await b.newPage();
  let n = 0;
  for (const it of manifest) {
    const src = SLOT[it.stem]();
    const b64 = await pg.evaluate(async ([s, w, h]) => { const im = new Image(); im.src = 'data:image/svg+xml;base64,' + btoa(s); await im.decode();
      const c = document.createElement('canvas'); c.width = w; c.height = h; c.getContext('2d').drawImage(im, 0, 0, w, h); return c.toDataURL('image/webp', 0.9).split(',')[1]; },
      [src, it.w, it.h]);
    fs.writeFileSync(path.join(OUT, it.stem + '.webp'), Buffer.from(b64, 'base64')); n++;
  }
  await b.close(); console.log('temp art:', n, 'of', stems.length, 'slots ->', OUT);
})();
