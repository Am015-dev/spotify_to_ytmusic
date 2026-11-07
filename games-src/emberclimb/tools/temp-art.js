// Temporary art (until the owner's Flow pictures): game-icons.net glyphs (CC BY 3.0, credits in ASSETS.md + Menu > About) on code-drawn shapes
// in the game's palette -> temp-art/<stem>.webp. A Flow file with the same stem replaces any of them. Never publisher art, scans or fan art.
//   git clone --depth 1 https://github.com/game-icons/icons.git <dir> ; node tools/temp-art.js <dir> [outdir]
const fs = require('fs'), path = require('path'); const { chromium } = require(path.join(__dirname, '../../node_modules/playwright'));
const GI = process.argv[2], OUT = process.argv[3] || path.join(__dirname, '../temp-art');
const IDX = {}; for (const a of fs.readdirSync(GI).sort((x, y) => (x === 'lorc' || x === 'delapouite') - (y === 'lorc' || y === 'delapouite'))) { const d = path.join(GI, a); if (fs.statSync(d).isDirectory()) for (const f of fs.readdirSync(d)) if (f.endsWith('.svg')) IDX[f.slice(0, -4)] = a + '/' + f; }
const pathOf = n => { const r = IDX[n]; if (!r) throw new Error('missing icon ' + n); const s = fs.readFileSync(path.join(GI, r), 'utf8'); const m = [...s.matchAll(/<path[^>]*d="([^"]+)"/g)]; return m.slice(1).map(x => x[1]).join(' ') || m[0][1]; };
// kind: round = dark disc + ring; tile = rounded square; ico = bare glyph; por = 3:4 portrait panel; frame = 5:7 card overlay with corner glyph
const R = {};   // stem -> [icon, kind, colour]
const add = (stem, icon, kind, col) => { R[stem] = [icon, kind, col]; };
// intents + statuses (bare coloured glyphs, read on the dark intent bubble)
[['intent-attack', 'broadsword', '#ff8b7a'], ['intent-attack-big', 'crossed-swords', '#ff5a44'], ['intent-defend', 'shield', '#8ec1ff'], ['intent-buff', 'strong', '#ffd36a'], ['intent-debuff', 'skull', '#d9a2ff'],
 ['intent-sleep', 'night-sleep', '#9fb4ff'], ['intent-weak', 'broken-bone', '#caa6ff'], ['intent-vuln', 'crosshair', '#ff7a7a'], ['intent-frail', 'broken-shield', '#8ec1ff'], ['intent-poison', 'poison-bottle', '#7be07b'],
 ['intent-burn', 'flame', '#ff9a3c'], ['intent-slime', 'slime', '#9be34a'], ['intent-daze', 'knocked-out-stars', '#ffe27a'], ['intent-unknown', 'uncertainty', '#c9c0b8'],
 ['st-str', 'strong', '#ffd36a'], ['st-vuln', 'crosshair', '#ff7a7a'], ['st-weak', 'broken-bone', '#caa6ff'], ['st-poison', 'poison-bottle', '#7be07b'], ['st-frail', 'broken-shield', '#8ec1ff'],
 ['orb-L', 'lightning-frequency', '#8fd6ff'], ['orb-F', 'snowflake-2', '#bfe9ff'], ['orb-D', 'moon', '#b58cff'], ['stance-w', 'flame', '#ff7a4a'], ['stance-c', 'lotus', '#8fe0c0'], ['icon-energy', 'lightning-arc', '#ffe066'], ['icon-remove', 'trash-can', '#d9c8b8']
].forEach(([s, i, c]) => add(s, i, 'ico', c));
// map nodes
[['node-monster', 'crossed-swords'], ['node-elite', 'horned-skull'], ['node-rest', 'campfire'], ['node-shop', 'shop'], ['node-event', 'uncertainty'], ['node-treasure', 'locked-chest'], ['node-boss', 'crowned-skull']].forEach(([s, i]) => add(s, i, 'round', '#6b4a2f'));
// relics
const REL = { 'ember-brand': 'tire-iron', 'whetstone-ring': 'diamond-ring', 'spark-core': 'orbital', 'prayer-beads': 'pearl-necklace', 'lucky-coin': 'two-coins', 'iron-bangle': 'bracer', 'lantern': 'lantern', 'bag-of-marbles': 'marbles',
  'clover-dice': 'dice-six-faces-four', 'healing-moss': 'sprout', 'gold-tooth': 'tooth', 'oak-heart': 'acorn', 'candle-stub': 'candle-light', 'pocket-satchel': 'knapsack', 'tin-flute': 'flute', 'smoking-censer': 'incense',
  'dawnstone': 'sun', 'gale-cloak': 'cloak', 'phoenix-ash': 'fire-bowl' };
for (const k in REL) add('relic-' + k, REL[k], 'round', '#8a6a2a');
// potions
const POT = { 'fire-flask': ['round-bottom-flask', '#ff7a2a'], 'block-brew': ['standing-potion', '#9aa5b3'], 'strength-tonic': ['health-potion', '#d94a3a'], 'swift-draught': ['magic-potion', '#7fc0ff'], 'energy-vial': ['potion-ball', '#ffe066'],
  'venom-vial': ['poison-bottle', '#7be07b'], 'frost-gas': ['round-potion', '#bfe9ff'], 'healing-draught': ['health-potion', '#ff9ab0'], 'fortune-die': ['dice-six-faces-six', '#f2c14a'] };
for (const k in POT) add('pot-' + k, POT[k][0], 'round', POT[k][1]);
// heroes (3:4 portraits) and enemies (square tiles)
[['hero-w', 'barbute', '#a8431f'], ['hero-s', 'hood', '#2f7a46'], ['hero-a', 'cog', '#2f6fa8'], ['hero-m', 'meditation', '#a8861c']].forEach(([s, i, c]) => add(s, i, 'por', c));
const EN = { 'mire-slug': 'snail-eyes', 'gnawer': 'rat', 'hex-acolyte': 'cultist', 'gape-grub': 'worm-mouth', 'rust-tick': 'mite-alt', 'bile-blob': 'slime', 'snare-vine': 'thorny-vine', 'ash-imp': 'imp-laugh', 'thorn-brute': 'ogre',
  'sleeper-statue': 'stone-tower', 'iron-warden': 'robot-golem', 'mire-behemoth': 'swamp', 'ashen-wraith': 'ghost', 'gate-colossus': 'dungeon-gate' };
for (const k in EN) add('enemy-' + k, EN[k], 'tile', '#5a3a2a');
add('cast-guide', 'flame', 'round', '#a8431f'); add('cast-rival', 'gate', 'round', '#5a4a3a');
// card frames (overlay: border in the type colour + a small glyph in the window corner) and rarity gems
[['frame-attack', 'broadsword', '#c8563a'], ['frame-skill', 'shield', '#4a7ab8'], ['frame-power', 'star-swirl', '#8a5ad0'], ['frame-status', 'skull', '#777']].forEach(([s, i, c]) => add(s, i, 'frame', c));
{ const miss = Object.values(R).map(v => v[0]).filter(n => !IDX[n]); if (miss.length) { console.log('missing icons:', [...new Set(miss)].join(' ')); process.exit(1); } }
function svg(stem, [icon, kind, col]) {
  const d = pathOf(icon), g = (c, s, x, y) => `<g transform="translate(${x} ${y}) scale(${s})"><path fill="${c}" d="${d}"/></g>`;
  if (kind === 'ico') return `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><g transform="scale(.25) translate(0 0)"><path fill="#000" fill-opacity=".45" transform="translate(10 10)" d="${d}"/><path fill="${col}" d="${d}"/></g></svg>`;
  if (kind === 'round') return `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><defs><radialGradient id="r" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#4a3626"/><stop offset="1" stop-color="#1c120c"/></radialGradient></defs><circle cx="128" cy="128" r="120" fill="url(#r)" stroke="${col}" stroke-width="8"/><g transform="translate(40 40) scale(.344)"><path fill="${col === '#6b4a2f' || col === '#8a6a2a' ? '#f3d9a0' : col}" d="${d}"/></g></svg>`;
  if (kind === 'tile') return `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><defs><linearGradient id="t" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6a4632"/><stop offset="1" stop-color="#241610"/></linearGradient></defs><rect x="6" y="6" width="244" height="244" rx="34" fill="url(#t)" stroke="#c98a4a" stroke-width="6"/><g transform="translate(36 36) scale(.367)"><path fill="#f0c890" d="${d}"/></g></svg>`;
  if (kind === 'por') return `<svg xmlns="http://www.w3.org/2000/svg" width="192" height="256" viewBox="0 0 192 256"><defs><linearGradient id="p" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${col}"/><stop offset="1" stop-color="#150d09"/></linearGradient></defs><rect x="4" y="4" width="184" height="248" rx="22" fill="url(#p)" stroke="#e8c48a" stroke-width="5"/><g transform="translate(26 54) scale(.28)"><path fill="#fff3d8" d="${d}"/></g></svg>`;
  if (kind === 'frame') return `<svg xmlns="http://www.w3.org/2000/svg" width="250" height="350" viewBox="0 0 250 350"><rect x="5" y="5" width="240" height="340" rx="18" fill="none" stroke="${col}" stroke-width="10"/><rect x="14" y="49" width="222" height="132" fill="none" stroke="${col}" stroke-opacity=".7" stroke-width="3"/><circle cx="212" cy="160" r="22" fill="#1c120c" fill-opacity=".8" stroke="${col}" stroke-width="3"/><g transform="translate(196 144) scale(.0625)"><path fill="#fff3d8" d="${d}"/></g></svg>`;
}
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] }), pg = await b.newPage(); let n = 0;
  for (const stem in R) {
    const s = svg(stem, R[stem]);
    const b64 = await pg.evaluate(async src => { const im = new Image(); im.src = 'data:image/svg+xml;base64,' + btoa(src); await im.decode(); const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; c.getContext('2d').drawImage(im, 0, 0); return c.toDataURL('image/webp', 0.92).split(',')[1]; }, s);
    fs.writeFileSync(path.join(OUT, stem + '.webp'), Buffer.from(b64, 'base64')); n++;
  }
  const auth = {}; for (const stem in R) { const [a] = IDX[R[stem][0]].split('/'); (auth[a] = auth[a] || new Set()).add(R[stem][0]); }
  const cr = ['## Temporary art credits', '', 'Glyphs from game-icons.net, licensed CC BY 3.0 (https://creativecommons.org/licenses/by/3.0/), drawn on our own code-made shapes. Stems in `temp-art/` are placeholders: a Flow file with the same stem replaces them.', ''];
  for (const a of Object.keys(auth).sort()) cr.push('- ' + a + ' (game-icons.net/1x1/' + a + '/): ' + [...auth[a]].sort().join(', '));
  fs.writeFileSync(path.join(OUT, 'CREDITS.md'), cr.join('\n') + '\n');
  fs.writeFileSync(path.join(OUT, 'credits.txt'), 'Icons: game-icons.net (' + Object.keys(auth).sort().join(', ') + '), CC BY 3.0');
  await b.close(); console.log('temp art:', n, 'files ->', OUT);
})();
