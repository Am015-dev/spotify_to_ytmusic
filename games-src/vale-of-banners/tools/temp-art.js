// Temporary art (until the owner's Flow pictures): renders game-icons.net icons (CC BY 3.0, see ASSETS.md credits) onto code-drawn
// hex tiles / tokens in the game's palette, as media/<stem>.webp. Pictures only fill slots; a Flow file with the same stem replaces them.
//   git clone --depth 1 https://github.com/game-icons/icons.git <dir> ; node tools/temp-art.js <dir> <outdir>
const fs = require('fs'), path = require('path'); const { chromium } = require(path.join(__dirname, '../../node_modules/playwright'));
const GI = process.argv[2], OUT = process.argv[3] || path.join(__dirname, '../temp-art');
const COL = { castle: '#2f5d3a', mine: '#7b7f86', know: '#e3c64a', bld: '#c9a273', pas: '#8fbf5a', ship: '#4f86c6' };
const ICON = { 'tile-keep': ['delapouite/castle', 'castle'], 'tile-mine': ['delapouite/gold-mine', 'mine'], 'tile-barge': ['delapouite/sailboat', 'ship'],
  'tile-bld-hall': ['delapouite/greek-temple', 'bld'], 'tile-bld-carp': ['delapouite/hand-saw', 'bld'], 'tile-bld-chapel': ['delapouite/church', 'bld'],
  'tile-bld-mkt': ['delapouite/shop', 'bld'], 'tile-bld-inn': ['lorc/beer-stein', 'bld'], 'tile-bld-mint': ['delapouite/two-coins', 'bld'],
  'tile-bld-tower': ['delapouite/watchtower', 'bld'], 'tile-bld-store': ['delapouite/barn', 'bld'], 'tile-back': ['delapouite/tower-flag', 'back'] };
const LORE = ['lorc/scroll-unfurled', 'lorc/open-book', 'delapouite/book-cover', 'lorc/quill-ink', 'delapouite/scroll-quill', 'willdabeast/white-book'];
for (let i = 1; i <= 26; i++) ICON['tile-lore-k' + i] = [LORE[(i - 1) % LORE.length], 'know'];
const AN = { sheep: 'delapouite/sheep', goat: 'skoll/goat', pig: 'skoll/pig', goose: 'delapouite/goose' };
for (const a in AN) for (const n of [2, 3, 4]) ICON['tile-pas-' + a + '-' + n] = [AN[a], 'pas'];
const GOODS = ['delapouite/wool', 'lorc/cheese-wedge', 'lorc/honeypot', 'lorc/shiny-apple', 'delapouite/rolled-cloth', 'lorc/salt-shaker'], GC = ['#f7f4ec', '#f6dc92', '#f3c27e', '#f0b0a0', '#c7dbf2', '#e6e6e6'];
GOODS.forEach((g, i) => { ICON['goods-' + (i + 1)] = [g, 'goods', GC[i]]; });
Object.assign(ICON, { 'token-worker': ['delapouite/farmer', 'token', '#e9dcbc'], 'token-silver': ['delapouite/two-coins', 'token', '#d8dde3'], 'token-points': ['lorc/laurel-crown', 'token', '#f6d36b'],
  'die-white': ['delapouite/perspective-dice-six-faces-random', 'token', '#ffffff'],
  'icon-workers': ['delapouite/farmer', 'icon'], 'icon-silver': ['delapouite/two-coins', 'icon'], 'icon-points': ['lorc/laurel-crown', 'icon'], 'icon-storage': ['delapouite/barrel', 'icon'],
  'icon-backlane': ['delapouite/bindle', 'icon'], 'icon-season': ['lorc/wheat', 'icon'], 'icon-track': ['delapouite/tower-flag', 'icon'] });
['#c0392b', '#2e6fb8', '#d9a21b', '#6b3fa0'].forEach((c, i) => { ICON['token-banner-' + i] = ['delapouite/tower-flag', 'token', c]; });
function pathOf(rel) { const s = fs.readFileSync(path.join(GI, rel + '.svg'), 'utf8'); const m = [...s.matchAll(/<path[^>]*d="([^"]+)"/g)]; return m.slice(1).map(x => x[1]).join(' ') || m[0][1]; }
function svg(stem, [rel, kind, c]) {
  const d = pathOf(rel), hex = '128,6 234,67 234,189 128,250 22,189 22,67';
  if (kind === 'icon') return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="96" height="96"><path fill="#2a2014" d="${d}"/></svg>`;
  if (kind === 'goods' || kind === 'token') return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="${kind === 'goods' ? 128 : 128}" height="128"><circle cx="128" cy="128" r="118" fill="${c}" stroke="#2a2014" stroke-width="8"/><g transform="translate(48 48) scale(.3125)"><path fill="${kind === 'token' && /banner/.test(stem) ? '#fff' : '#2a2014'}" d="${d}"/></g></svg>`;
  const fill = kind === 'back' ? '#e9dcbc' : COL[kind], ink = kind === 'castle' || kind === 'ship' ? '#f4ecd8' : '#2a2014';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256"><polygon points="${hex}" fill="${fill}" stroke="#2a2014" stroke-opacity=".55" stroke-width="6"/><polygon points="${hex}" fill="none" stroke="#fff" stroke-opacity=".25" stroke-width="2" transform="translate(128 128) scale(.9) translate(-128 -128)"/><g transform="translate(58 58) scale(.2734)"><path fill="${ink}" d="${d}"/></g></svg>`;
}
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] }), pg = await b.newPage();
  let n = 0;
  for (const stem in ICON) {
    const s = svg(stem, ICON[stem]);
    const b64 = await pg.evaluate(async src => { const im = new Image(); im.src = 'data:image/svg+xml;base64,' + btoa(src); await im.decode(); const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; c.getContext('2d').drawImage(im, 0, 0); return c.toDataURL('image/webp', 0.9).split(',')[1]; }, s);
    fs.writeFileSync(path.join(OUT, stem + '.webp'), Buffer.from(b64, 'base64')); n++;
  }
  await b.close(); console.log('temp art:', n, 'files ->', OUT);
})();
