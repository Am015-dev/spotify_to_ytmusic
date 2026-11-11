// ---------- scenes (100 x 62 art box) ----------
function scene(kind, key) {
  const r = rng('scene' + key); let s = '';
  const sky = { meadow: ['#d6ebe2', '#f7efc4'], autumn: ['#f4dfb6', '#f7c98e'], dusk: ['#ecc9c2', '#b99ac6'], night: ['#3e4b7c', '#59629a'], indoor: ['#ecd9b6', '#f6e6c4'], stone: ['#cbd5da', '#e3e6df'], winter: ['#dbe6ef', '#f2f5f7'] }[kind];
  s += rc(-2, -2, 104, 66, sky[0], 0, NS0);
  s += blob(30, 14, 40, 18, sky[1], .8, r) + blob(78, 8, 30, 14, sky[1], .6, r);
  if (kind === 'night') { s += `<circle cx="80" cy="12" r="6" fill="#f6ecc0" stroke="none"/><circle cx="82.5" cy="10.5" r="5" fill="#3e4b7c" stroke="none" fill-opacity=".35"/>`; for (let i = 0; i < 14; i++) s += `<circle cx="${f1(r() * 100)}" cy="${f1(r() * 26)}" r="${f1(.3 + r() * .5)}" fill="#fff3c8" stroke="none"/>`; }
  if (kind === 'meadow') s += `<circle cx="84" cy="11" r="5.5" fill="#fff0a0" fill-opacity=".85" stroke="none"/>`;
  if (kind === 'autumn') s += `<circle cx="16" cy="12" r="6" fill="#ffd9a0" fill-opacity=".8" stroke="none"/>`;
  if (kind === 'indoor') {
    s += rc(60, 7, 24, 22, '#bcdcec', 2, ' stroke-width=".7"') + ln(72, 7, 72, 29) + ln(60, 18, 84, 18) + blob(70, 16, 9, 6, '#fff', .35, r);
    s += rc(-2, 46, 104, 18, '#b88a58', 0, NS0) + blob(50, 52, 60, 7, '#cf9f6a', .8, r) + ln(0, 46, 100, 46, '#7a5434', .6);
    for (let i = 0; i < 6; i++) s += ln(i * 20 + 6, 46, i * 24 - 6, 62, '#8a6038', .35);
    s += rc(4, 12, 20, 2.4, '#8a6240', 0, ' stroke-width=".4"') + rc(7, 6, 3, 6, '#c2603f', 0, ' stroke-width=".3"') + rc(11, 8, 3, 4, '#5f8f6a', 0, ' stroke-width=".3"') + rc(15, 5, 3, 7, '#d6aa4a', 0, ' stroke-width=".3"');
    return s;
  }
  const hill = { meadow: ['#a9d08e', '#86b86d', '#6ea35c'], autumn: ['#e6ad62', '#cf8044', '#b86a38'], dusk: ['#8f99bb', '#6f8a98', '#587a62'], night: ['#34505a', '#2c4650', '#243a40'], stone: ['#9fb1b4', '#8a9d93', '#74866f'], winter: ['#e7eff5', '#d7e3ec', '#f6f9fb'] }[kind];
  s += blob(25, 40, 38, 11, hill[0], .85, r) + blob(78, 42, 34, 10, hill[0], .8, r);
  s += blob(50, 50, 62, 11, hill[1], .85, r);
  s += blob(50, 59, 66, 9, hill[2], .9, r);
  // distant trees
  const tc = kind === 'autumn' ? ['#d9843a', '#c2562f'] : kind === 'night' ? ['#233a3e'] : kind === 'winter' ? ['#b9c9d3'] : ['#7aa869', '#5f9560'];
  for (let i = 0; i < 4; i++) { const x = 6 + i * 27 + r() * 8, h = 9 + r() * 6; s += `<ellipse cx="${f1(x)}" cy="${f1(41 - h / 2)}" rx="${f1(4.5 + r() * 2)}" ry="${f1(h / 2 + 2)}" fill="${tc[i % tc.length]}" fill-opacity=".6" stroke="none"/>`; }
  // foreground tufts / flowers / leaves
  for (let i = 0; i < 9; i++) { const x = r() * 100, y = 52 + r() * 9; if (kind === 'meadow') s += `<circle cx="${f1(x)}" cy="${f1(y)}" r=".9" fill="${['#f7e9a0', '#f3b6c4', '#fff'][i % 3]}" stroke="none"/>`; else if (kind === 'autumn') s += `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="1.5" ry=".8" fill="${['#d9632d', '#e8a43a'][i % 2]}" fill-opacity=".9" stroke="none" transform="rotate(${f1(r() * 90)} ${f1(x)} ${f1(y)})"/>`; else if (kind === 'winter') s += `<circle cx="${f1(r() * 100)}" cy="${f1(r() * 50)}" r=".6" fill="#fff" stroke="none"/>`; s += `<path d="M${f1(x)} ${f1(y + 1.5)} q.5 -2 1.3 -2.6 M${f1(x)} ${f1(y + 1.5)} q-.4 -2 -1.2 -2.4" stroke="#4b7a45" stroke-opacity=".6" stroke-width=".4" fill="none"/>`; }
  return s;
}
// ---------- critters ----------
const eyes = (dx, y, rr, col) => [-1, 1].map(k => `<circle cx="${50 + k * dx}" cy="${y}" r="${rr}" fill="${col || INK}" stroke="none"/><circle cx="${50 + k * dx + .45}" cy="${y - .5}" r="${f1(rr * .35)}" fill="#fff" stroke="none"/>`).join('');
const whisk = (y) => [-1, 1].map(k => `<path d="M${50 + k * 5} ${y} l${k * 9} -1.5 M${50 + k * 5} ${y + 1} l${k * 9} 1.5" stroke="${INK}" stroke-width=".3" fill="none" stroke-opacity=".7"/>`).join('');
const SP = {
  mouse: { fur: '#bfa98d', belly: '#efe1c8', hand: '#e8b4a8',
    back: () => pa('M64 58 C78 58 82 46 74 40 C70 37 74 33 78 36', 'none', ' stroke="#d6a79d" stroke-width="2.2" stroke-linecap="round"') ,
    head: S => [-1, 1].map(k => ell(50 + k * 10, 17, 5.8, 5.8, S.fur) + ell(50 + k * 10, 17, 3.3, 3.3, '#eab2a8', null, NS0)).join('') + ell(50, 28, 11, 10, S.fur) + ell(50, 31.5, 5, 3.6, S.belly, null, NS0) + ell(50, 30, 1.7, 1.2, '#d98a8a') + eyes(4.6, 26, 1.2) + whisk(31) },
  squirrel: { fur: '#c47a3e', belly: '#f1dcb8', hand: '#f1dcb8',
    back: () => ell(74, 40, 9.5, 17, '#c47a3e', null, ' transform="rotate(22 74 40)"') + ell(74, 38, 4.5, 11, '#e9a864', .8, ' transform="rotate(22 74 40)"' + NS0),
    head: S => [-1, 1].map(k => pg([50 + k * 6, 20, 50 + k * 12, 18, 50 + k * 11.5, 11.5], S.fur) + pg([50 + k * 10.6, 17.8, 50 + k * 12, 12.2, 50 + k * 8.7, 18.5], '#e9a864', NS0)).join('') + ell(50, 28, 11, 10, S.fur) + ell(50, 31.5, 6, 4, S.belly, null, NS0) + ell(50, 30, 1.6, 1.2, '#4a2e22') + eyes(4.8, 26, 1.3) + `<path d="M48.5 33 q1.5 1.3 3 0" stroke="${INK}" stroke-width=".4" fill="none"/>` + ell(49, 35.5, 1.1, 1.8, '#fff', null, ' stroke-width=".3"') + ell(51, 35.5, 1.1, 1.8, '#fff', null, ' stroke-width=".3"') },
  hedgehog: { fur: '#7a5a42', belly: '#e8cfa6', hand: '#e8cfa6',
    back: () => { let d = 'M25 62'; for (let i = 0; i <= 14; i++) { const a = Math.PI + i / 14 * Math.PI, rx = 26, ry = 40; const r1 = i % 2 ? 1.14 : 1; d += `L${f1(50 + Math.cos(a) * rx * r1)} ${f1(58 + Math.sin(a) * ry * r1)}`; } return pa(d + 'L75 62Z', '#6a4c37'); },
    head: S => { let sp = ''; for (let i = 0; i < 6; i++) sp += pg([39 + i * 4.4, 20, 41 + i * 4.4, 13 + (i % 2) * 2, 43.2 + i * 4.4, 20], '#6a4c37', ' stroke-width=".4"'); return sp + ell(50, 28, 10.5, 9.5, '#e6c79c') + [-1, 1].map(k => ell(50 + k * 9, 21, 2.6, 2.6, '#e6c79c')).join('') + pa('M41 22 Q50 16 59 22 Q56 25 50 24 Q44 25 41 22Z', '#6a4c37', ' stroke-width=".4"') + ell(50, 32.5, 4, 3, '#f1dcb8', null, NS0) + ell(50, 31, 2, 1.5, '#2e211a') + eyes(4.4, 27, 1.2); } },
  frog: { fur: '#72b25c', belly: '#dcebaa', hand: '#8bc671',
    back: () => '',
    head: S => ell(50, 29.5, 13.5, 9.5, S.fur) + [-1, 1].map(k => ell(50 + k * 8, 20, 5.4, 5.4, S.fur) + ell(50 + k * 8, 19.6, 3.7, 3.7, '#fdf6d6') + ell(50 + k * 8, 19.8, 1.9, 1.9, INK, null, NS0) + `<circle cx="${50 + k * 8 + .6}" cy="19" r=".6" fill="#fff" stroke="none"/>`).join('') + `<path d="M39 32 Q50 40 61 32" stroke="${INK}" stroke-width=".6" fill="none"/>` + ell(50, 35.5, 8, 2.4, S.belly, .8, NS0) + `<circle cx="48" cy="27" r=".5" fill="${INK}" stroke="none"/><circle cx="52" cy="27" r=".5" fill="${INK}" stroke="none"/>` + ell(41, 29, 2.2, 1.5, '#f0a0a0', .5, NS0) + ell(59, 29, 2.2, 1.5, '#f0a0a0', .5, NS0) },
  owl: { fur: '#a47c54', belly: '#e9d5ae', hand: '#d6a850',
    back: () => '',
    head: S => [-1, 1].map(k => pg([50 + k * 4, 18.5, 50 + k * 12, 18, 50 + k * 11, 10], S.fur)).join('') + ell(50, 27.5, 12.5, 11, S.fur) + [-1, 1].map(k => `<circle cx="${50 + k * 5.4}" cy="27" r="5.6" fill="#f6e8c0"/><circle cx="${50 + k * 5.4}" cy="27" r="3.4" fill="#e8b23a" stroke-width=".4"/><circle cx="${50 + k * 5.4}" cy="27" r="1.8" fill="${INK}" stroke="none"/><circle cx="${50 + k * 5.4 + .7}" cy="26.2" r=".6" fill="#fff" stroke="none"/>`).join('') + pg([48.4, 30.4, 51.6, 30.4, 50, 35], '#e08a30', ' stroke-width=".5"') + ln(41, 38, 44, 35, '#7a5a3a', .4) + ln(59, 38, 56, 35, '#7a5a3a', .4) },
  badger: { fur: '#8a8784', belly: '#f1ede4', hand: '#5a5755',
    back: () => '',
    head: S => [-1, 1].map(k => ell(50 + k * 9.5, 19, 3.3, 3.3, '#4a4846') + ell(50 + k * 9.5, 19.4, 1.7, 1.7, '#f1ede4', null, NS0)).join('') + ell(50, 28.5, 11, 10.5, '#f1ede4') + [-1, 1].map(k => pa(`M${50 + k * 3} 19 Q${50 + k * 11.5} 22 ${50 + k * 9.5} 33 Q${50 + k * 5} 31 ${50 + k * 3} 19Z`, '#3d3b3a', NS0)).join('') + pa('M44 33 Q50 38 56 33 Q50 30 44 33Z', '#8a8784', NS0) + ell(50, 31.4, 2, 1.3, '#2a2524') + [-1, 1].map(k => `<circle cx="${50 + k * 5.2}" cy="26.5" r="1.1" fill="#fff" stroke="none"/><circle cx="${50 + k * 5.2}" cy="26.6" r=".7" fill="${INK}" stroke="none"/>`).join('') },
  rabbit: { fur: '#eadfce', belly: '#fbf5ea', hand: '#fbf5ea',
    back: () => '',
    head: S => [-1, 1].map(k => ell(50 + k * 6.5, 9, 3.8, 11.5, S.fur, null, ` transform="rotate(${k * 8} ${50 + k * 6.5} 20)"`) + ell(50 + k * 6.5, 9.5, 1.9, 8, '#efb7b0', null, ` transform="rotate(${k * 8} ${50 + k * 6.5} 20)"` + NS0)).join('') + ell(50, 28, 10.8, 10, S.fur) + ell(50, 31.5, 5, 3.6, S.belly, null, NS0) + `<path d="M48.6 30 L51.4 30 L50 31.7Z" fill="#e58a96" stroke-width=".4"/>` + eyes(4.8, 26, 1.2) + ell(42, 30, 2, 1.4, '#f0a0a0', .5, NS0) + ell(58, 30, 2, 1.4, '#f0a0a0', .5, NS0) + whisk(32) },
  mole: { fur: '#5e5652', belly: '#8a817b', hand: '#e0a7a0',
    back: () => '',
    head: S => [-1, 1].map(k => ell(50 + k * 9.5, 20, 2.6, 2.6, S.fur)).join('') + ell(50, 28.5, 11, 10, S.fur) + ell(50, 33.5, 5, 3.4, '#e0a7a0') + ell(50, 31.8, 2.2, 1.5, '#c97d80', null, ' stroke-width=".3"') + `<circle cx="45" cy="26.5" r=".9" fill="#111" stroke="none"/><circle cx="55" cy="26.5" r=".9" fill="#111" stroke="none"/>` + whisk(34) },
  beetle: { fur: '#3d4a3a', belly: '#6c8a6a', hand: '#3d4a3a',
    back: () => ell(50, 49, 21, 18, '#3e7b6c') + `<path d="M50 32 L50 66" stroke="${INK}" stroke-width=".6"/>` + `<path d="M36 40 Q40 36 45 37" stroke="#bfe6d8" stroke-width="1.3" fill="none" stroke-linecap="round" stroke-opacity=".8"/>`,
    head: S => [-1, 1].map(k => `<path d="M${50 + k * 3} 21 Q${50 + k * 8} 8 ${50 + k * 13} 12" stroke="${INK}" stroke-width=".7" fill="none"/><circle cx="${50 + k * 13}" cy="12" r="1.1" fill="${INK}" stroke="none"/>`).join('') + ell(50, 27.5, 9.5, 8.5, '#47543f') + [-1, 1].map(k => `<circle cx="${50 + k * 4.2}" cy="26" r="2.4" fill="#f4efc8" stroke-width=".4"/><circle cx="${50 + k * 4.2 + .3}" cy="26.2" r="1.2" fill="${INK}" stroke="none"/>`).join('') + `<path d="M46 32 q4 3 8 0" stroke="${INK}" stroke-width=".5" fill="none"/>` },
  bat: { fur: '#6d5a7c', belly: '#c9b6d4', hand: '#6d5a7c',
    back: () => [-1, 1].map(k => pa(`M${50 + k * 9} 43 C${50 + k * 22} 28 ${50 + k * 36} 28 ${50 + k * 46} 36 C${50 + k * 42} 38 ${50 + k * 40} 41 ${50 + k * 38} 43 C${50 + k * 35} 41 ${50 + k * 33} 45 ${50 + k * 30} 48 C${50 + k * 26} 46 ${50 + k * 22} 50 ${50 + k * 16} 52Z`, '#8a73a0', ' fill-opacity=".92"') + `<path d="M${50 + k * 12} 44 L${50 + k * 40} 33 M${50 + k * 12} 46 L${50 + k * 30} 47" stroke="#4a3a58" stroke-width=".4" fill="none"/>`).join(''),
    head: S => [-1, 1].map(k => pg([50 + k * 4, 19, 50 + k * 11, 19, 50 + k * 10, 6.5], S.fur) + pg([50 + k * 6, 18, 50 + k * 9.4, 17.6, 50 + k * 9.2, 10.5], '#e9b8c9', NS0)).join('') + ell(50, 28, 10.5, 10, S.fur) + ell(50, 31.5, 5, 3.5, '#d8c6e0', null, NS0) + ell(50, 30, 1.6, 1.1, '#2a1f30') + eyes(4.6, 26, 1.3) + pg([48, 33.5, 49, 36, 50, 33.5], '#fff', ' stroke-width=".3"') },
  toad: { fur: '#938a58', belly: '#e0d6a0', hand: '#a79d68',
    back: () => '',
    head: S => ell(50, 29.5, 13.5, 9.8, S.fur) + [-1, 1].map(k => ell(50 + k * 8.5, 20.5, 5, 4.4, S.fur) + ell(50 + k * 8.5, 20.3, 3.3, 3, '#e6b83c') + `<ellipse cx="${50 + k * 8.5}" cy="20.4" rx="2.1" ry=".8" fill="${INK}" stroke="none"/>`).join('') + `<path d="M38.5 32 Q50 39 61.5 32" stroke="${INK}" stroke-width=".6" fill="none"/>` + ell(50, 35.5, 8, 2.2, S.belly, .8, NS0) + [[43, 26], [57, 27], [46, 31], [54, 24], [40, 30], [60, 31]].map(p => `<circle cx="${p[0]}" cy="${p[1]}" r=".9" fill="#6e6538" fill-opacity=".8" stroke="none"/>`).join('') + `<circle cx="48.4" cy="26.5" r=".5" fill="${INK}" stroke="none"/><circle cx="51.6" cy="26.5" r=".5" fill="${INK}" stroke="none"/>` },
  shrew: { fur: '#948878', belly: '#d9cdb6', hand: '#d9b9a4',
    back: () => `<path d="M64 58 C78 60 82 52 80 46" stroke="#b9a99a" stroke-width="1.6" fill="none" stroke-linecap="round"/>`,
    head: S => [-1, 1].map(k => ell(50 + k * 8.5, 19, 3.2, 3.2, S.fur) + ell(50 + k * 8.5, 19.2, 1.7, 1.7, '#e5b3a8', null, NS0)).join('') + pa('M39.5 26 C39 19 45 17 50 17 C55 17 61 19 60.5 26 C60 31 55 35 50 40 C45 35 40 31 39.5 26Z', S.fur) + pa('M44 33 Q50 38 56 33 Q50 41 44 33Z', S.belly, NS0) + ell(50, 39.2, 1.5, 1.2, '#d98a8a') + eyes(4.4, 26, 1.1) + whisk(35) },
  turtle: { fur: '#93b681', belly: '#d8e6b6', hand: '#93b681',
    back: () => ell(50, 51, 22, 17, '#6b8f52') + `<path d="M50 34 L50 68 M30 46 Q50 52 70 46 M33 58 Q50 52 67 58" stroke="#3e5a30" stroke-width=".6" fill="none"/>` + `<path d="M34 42 Q38 37 44 37" stroke="#cfe8b0" stroke-width="1.3" fill="none" stroke-linecap="round" stroke-opacity=".8"/>`,
    head: S => ell(50, 28, 9.2, 9, S.fur) + eyes(4.1, 26.5, 1.2) + `<path d="M46.6 32 q3.4 2.4 6.8 0" stroke="${INK}" stroke-width=".6" fill="none"/>` + ell(41.5, 29, 1.8, 1.2, '#f0a0a0', .55, NS0) + ell(58.5, 29, 1.8, 1.2, '#f0a0a0', .55, NS0) },
  fox: { fur: '#dc7a3a', belly: '#fbf0dc', hand: '#4a342a',
    back: () => `<path d="M62 60 C82 62 88 44 78 34 C76 42 70 46 64 48Z" fill="#dc7a3a"/><path d="M78 34 C83 40 85 48 80 54 C84 48 82 40 78 34Z" fill="#fbf0dc" stroke="none"/>`,
    head: S => [-1, 1].map(k => pg([50 + k * 4.5, 19, 50 + k * 12, 19, 50 + k * 11, 8.5], S.fur) + pg([50 + k * 8, 17, 50 + k * 11.2, 16.8, 50 + k * 10.6, 11.4], '#4a342a', NS0)).join('') + pa('M39 26 C39 19 45 18 50 18 C55 18 61 19 61 26 C61 30 56 33 50 36 C44 33 39 30 39 26Z', S.fur) + pa('M39.6 29 Q46 30 50 36 Q43 35 39.6 29Z M60.4 29 Q54 30 50 36 Q57 35 60.4 29Z', S.belly, NS0) + ell(50, 35.6, 1.5, 1.1, '#2a1c16') + eyes(4.6, 26, 1.2) },
  pigeon: { fur: '#a1aab4', belly: '#d9dee3', hand: '#d9dee3',
    back: () => [-1, 1].map(k => pa(`M${50 + k * 12} 42 C${50 + k * 26} 40 ${50 + k * 32} 52 ${50 + k * 30} 60 C${50 + k * 22} 56 ${50 + k * 16} 54 ${50 + k * 12} 54Z`, '#8893a0')).join(''),
    head: S => ell(50, 28, 9.5, 9.2, S.fur) + pa('M42 36 Q50 41 58 36 Q57 40 50 41 Q43 40 42 36Z', '#5aa39a', ' fill-opacity=".9" stroke="none"') + pg([46.5, 29.6, 53.5, 29.6, 50, 35], '#e7a14a', ' stroke-width=".5"') + eyes(4.6, 26, 1.3, '#c4511f') }
};
const coatCol = { green: '#5f8f4a', brown: '#9a6a44', red: '#b8493a', blue: '#4a76a6', purple: '#7f5496', cream: '#efe2c4', grey: '#7d8590', black: '#3f3a40', yellow: '#dcae3e', teal: '#3f8f88', tan: '#c9a46a', orange: '#d67f3a' };
// hats (head top ~ y 18)
const HAT = {
  straw: () => ell(50, 19, 16, 3.4, '#e6c880') + pa('M39 19 Q40 8 50 8 Q60 8 61 19Z', '#efd48c') + rc(39.5, 15.5, 21, 2.6, '#c2503a', 0, NS0),
  crown: (c) => pg([39, 19, 38, 8, 44, 13, 50, 5, 56, 13, 62, 8, 61, 19], c || '#e8b930') + [38, 50, 62].map((x, i) => `<circle cx="${x}" cy="${i == 1 ? 5 : 8}" r="1.3" fill="#c2364c" stroke-width=".3"/>`).join('') + rc(39, 16.5, 22, 2.4, '#f6d86a', 0, ' stroke-width=".4"'),
  jester: () => pa('M38 20 Q30 14 28 6 Q36 8 46 14 Q50 4 50 -1 Q56 6 54 14 Q64 8 72 6 Q70 14 62 20 Z', '#c2493a') + pa('M50 14 Q56 8 54 14 Q64 8 72 6 Q70 14 62 20 L50 20Z', '#3f7fb0', NS0) + [[28, 6], [50, -1], [72, 6]].map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="2" fill="#f0c43a" stroke-width=".4"/>`).join('') + rc(38, 17.5, 24, 2.4, '#f0c43a', 0, ' stroke-width=".4"'),
  hood: (c) => pa('M36 34 C32 18 40 8 50 8 C60 8 68 18 64 34 C60 26 58 20 50 20 C42 20 40 26 36 34Z', c || '#7a5a3a'),
  helmet: () => pa('M38 20 Q38 8 50 8 Q62 8 62 20Z', '#d9a43a') + rc(36, 18.5, 28, 2.6, '#b88224', 1.2, ' stroke-width=".4"') + `<circle cx="50" cy="12" r="2.6" fill="#fff4b0"/>` + `<circle cx="50" cy="12" r="5" fill="#fff4b0" fill-opacity=".35" stroke="none"/>`,
  wig: () => [[36, 24], [34, 30], [64, 24], [66, 30], [41, 16], [50, 14], [59, 16]].map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="4.6" fill="#f4f1ec" stroke-width=".5"/>`).join(''),
  feather: () => pa('M38 19 Q40 9 52 10 Q60 10 62 19Z', '#4f8f5a') + pa('M52 11 Q64 2 68 8 Q62 6 56 12Z', '#d6563a', ' stroke-width=".4"') + rc(38, 17, 24, 2.4, '#e6c06a', 0, NS0),
  tophat: () => rc(40, 3, 20, 15, '#2f2a30', 1.5) + ell(50, 18, 15, 2.6, '#2f2a30') + rc(40, 13, 20, 2.6, '#7a4a8a', 0, NS0),
  mortar: () => pg([36, 14, 50, 8, 64, 14, 50, 20], '#2f2f3a') + rc(43, 15, 14, 4, '#2f2f3a', 0, NS0) + `<path d="M62 14 L63 24" stroke="#e0b030" stroke-width=".8"/><circle cx="63" cy="25" r="1.4" fill="#e0b030" stroke-width=".3"/>`,
  cap: (c) => pa('M38.5 20 Q38 10 50 10 Q62 10 61.5 20Z', c || '#c2713a') + pa('M36 20 Q44 24 54 20 L54 18.5 L38 18.5Z', c || '#c2713a'),
  postal: () => pa('M38.5 20 Q38 10 50 10 Q62 10 61.5 20Z', '#3d5f98') + pa('M37 20 Q45 25 62 20 L62 18 L38 18Z', '#2d4572') + `<circle cx="50" cy="14.5" r="2.2" fill="#f0c43a" stroke-width=".4"/>`,
  wander: () => ell(50, 19, 18, 3.4, '#8a6a46') + pa('M40 19 Q42 7 50 5 Q58 7 60 19Z', '#9a7a52') + rc(40, 15.5, 20, 2.6, '#c2503a', 0, NS0) + `<path d="M58 8 Q66 4 68 10 Q64 8 60 12Z" fill="#e8c24a" stroke-width=".4"/>`,
  bonnet: () => pa('M37 28 C34 14 44 10 50 10 C58 10 66 14 63 28 C60 20 56 18 50 18 C44 18 40 20 37 28Z', '#f0e6d0') + `<path d="M40 20 Q50 14 60 20" stroke="#7a4a8a" stroke-width="1.6" fill="none"/>`,
  monk: () => HAT.hood('#8a6a48'),
  doc: () => rc(40, 8, 20, 11, '#3a6f8a', 3) + `<circle cx="50" cy="13.5" r="3.2" fill="#e8f0f2" stroke-width=".5"/><path d="M50 11.5 v4 M48 13.5 h4" stroke="#c2364c" stroke-width=".9"/>`,
  none: () => ''
};
const PROP = {
  pitchfork: () => `<path d="M72 60 L72 28" stroke="#8a6240" stroke-width="1.2"/><path d="M68 32 Q68 26 72 26 Q76 26 76 32 M72 26 L72 22" stroke="#5a5a5e" stroke-width="1" fill="none"/>`,
  scales: () => `<path d="M72 56 L72 32 M63 34 L81 34" stroke="#8a6240" stroke-width="1"/>` + [63, 81].map(x => `<path d="M${x} 34 L${x - 4} 42 L${x + 4} 42Z" fill="#f0c43a" stroke-width=".4"/>`).join('') + `<circle cx="64" cy="55" r="3.4" fill="#e3b23e"/><circle cx="64" cy="55" r="1.4" fill="#b88224" stroke="none"/>`,
  lute: () => ell(70, 52, 7, 8.5, '#c2803a', null, ' transform="rotate(-25 70 52)"') + `<circle cx="69" cy="52" r="2" fill="#4a2e1c" stroke="none"/><path d="M72 46 L81 30" stroke="#6a4630" stroke-width="1.8"/><path d="M71 49 L80 33" stroke="#f5e8c0" stroke-width=".3"/>`,
  gavel: () => rc(70, 40, 12, 6, '#8a5a36', 1.5, ' transform="rotate(-30 76 43)"') + `<path d="M67 58 L75 44" stroke="#8a5a36" stroke-width="1.6" stroke-linecap="round"/>`,
  book: () => rc(62, 46, 17, 13, '#4a6fa0', 1.2, ' transform="rotate(-8 70 52)"') + `<path d="M64 48 h12 M64 51 h12" stroke="#f6ecd6" stroke-width=".6" transform="rotate(-8 70 52)"/>`,
  pick: () => `<path d="M72 60 L72 30" stroke="#8a6240" stroke-width="1.4" stroke-linecap="round"/><path d="M62 32 Q72 24 82 32 Q72 28 62 32Z" fill="#7d858c" stroke-width=".7"/>`,
  plans: () => rc(63, 48, 18, 11, '#f4ead0', 1, ' transform="rotate(-10 72 53)"') + `<path d="M65 52 h6 M65 55 l10 -1 M70 50 v7" stroke="#4a76a6" stroke-width=".5" transform="rotate(-10 72 53)"/>`,
  stick: () => `<path d="M73 62 L70 24" stroke="#7a5638" stroke-width="1.3" stroke-linecap="round"/><path d="M64 38 Q60 44 62 52 Q70 54 74 48 Q74 40 70 36Z" fill="#a8683c" stroke-width=".6"/>`,
  bow: () => `<path d="M70 28 Q84 44 70 62" stroke="#8a5a36" stroke-width="1.3" fill="none"/><path d="M70 28 L70 62" stroke="#f0e6d0" stroke-width=".3"/><path d="M60 45 L82 45" stroke="#6a4a2a" stroke-width=".6"/>`,
  letter: () => rc(62, 47, 16, 11, '#fbf4e0', 1, ' transform="rotate(-12 70 52)"') + `<path d="M62 47 L70 53 L78 47" stroke="${INK}" stroke-width=".5" fill="none" transform="rotate(-12 70 52)"/><circle cx="70" cy="53.5" r="1.5" fill="#c2364c" stroke="none" transform="rotate(-12 70 52)"/>`,
  ruler: () => `<rect x="64" y="22" width="2.6" height="38" fill="#e6c06a" transform="rotate(14 65 41)" stroke-width=".5"/>` + rc(60, 44, 16, 11, '#2f4a3a', 1) + `<path d="M62 48 h8 M62 51 h5" stroke="#f6ecd6" stroke-width=".5"/>`,
  bag: () => rc(62, 48, 15, 11, '#4a2e22', 2) + `<path d="M66 48 q3.5 -5 7 0" stroke="#4a2e22" stroke-width="1.2" fill="none"/><path d="M69.5 50 v7 M66 53.5 h7" stroke="#e8564a" stroke-width="1.4"/>`,
  shovel: () => `<path d="M72 60 L72 30" stroke="#8a6240" stroke-width="1.2"/><path d="M68 18 Q72 14 76 18 L76 28 Q72 31 68 28Z" fill="#7d858c" stroke-width=".7"/>`,
  candle: () => rc(65, 46, 5, 12, '#f4ead0', 1) + pa('M67.5 40 q3 4 0 6 q-3 -2 0 -6Z', '#f6a830', ' stroke-width=".4"') + `<circle cx="67.5" cy="43" r="6" fill="#ffd36a" fill-opacity=".3" stroke="none"/>`,
  bells: () => `<path d="M66 52 Q72 40 80 34" stroke="#8a5a36" stroke-width="1.2" fill="none"/><circle cx="80" cy="34" r="3" fill="#f0c43a" stroke-width=".5"/>`,
  broom: () => `<path d="M74 24 L66 58" stroke="#8a6240" stroke-width="1.2"/><path d="M62 58 L70 58 L72 66 L60 66Z" fill="#d0a24c" stroke-width=".5"/>`,
  carve: () => rc(63, 49, 11, 9, '#b98a5a', 1.5) + `<path d="M74 52 L82 46" stroke="#7d858c" stroke-width="1.2" stroke-linecap="round"/><path d="M66 49 q2 -5 5 -2 q-1 3 -2 3Z" fill="#d9b27a" stroke-width=".4"/>`,
  pack: () => rc(60, 36, 14, 18, '#a8683c', 3) + `<path d="M60 44 h14 M64 36 v18" stroke="#6a3f22" stroke-width=".6"/>` + rc(62, 30, 10, 7, '#c9a46a', 2),
  mug: () => rc(63, 49, 9, 10, '#e6b04a', 1.5) + `<path d="M72 51 q5 1 0 6" stroke="${INK}" stroke-width="1" fill="none"/>` + pa('M63 49 q4.5 -4 9 0', '#fff', ' stroke-width=".4"'),
  sickle: () => `<path d="M72 60 L72 38" stroke="#8a6240" stroke-width="1.2"/><path d="M72 38 Q84 32 78 24 Q80 32 72 34Z" fill="#a8b0b6" stroke-width=".6"/>` + `<path d="M62 56 L62 40 M60 56 L60 42 M64 56 L64 42" stroke="#d6aa4a" stroke-width=".8"/>`,
  scepter: () => `<path d="M72 60 L72 30" stroke="#e0b030" stroke-width="1.4"/><circle cx="72" cy="28" r="3.4" fill="#c2364c" stroke-width=".6"/>`,
  scroll: () => rc(63, 46, 14, 10, '#f4ead0', 3, ' transform="rotate(-8 70 51)"') + `<path d="M65 49 h10 M65 52 h8" stroke="#8a6240" stroke-width=".4" transform="rotate(-8 70 51)"/>`,
  none: () => ''
};
const EXTRA = {
  apron: () => pa('M42 44 L58 44 L60 62 L40 62Z', '#fbf6ea', ' stroke-width=".5"') + `<path d="M42 45 L40 41 M58 45 L60 41" stroke="${INK}" stroke-width=".4"/>`,
  glasses: () => [-1, 1].map(k => `<circle cx="${50 + k * 4.6}" cy="26.2" r="3.1" fill="#cfe8f0" fill-opacity=".45" stroke="#4a3a2a" stroke-width=".6"/>`).join('') + ln(47.6, 26, 52.4, 26, '#4a3a2a', .5),
  mirror: () => `<circle cx="50" cy="19.5" r="2.4" fill="#e8f0f2" stroke-width=".6"/><circle cx="50" cy="19.5" r=".8" fill="#9aa" stroke="none"/>`,
  bowtie: () => pg([46, 40, 50, 42, 46, 44, 50, 42, 54, 40, 54, 44, 50, 42], '#c2364c', ' stroke-width=".4"'),
  scarf: () => pa('M40 39 Q50 44 60 39 L60 42.5 Q50 47.5 40 42.5Z', '#c2493a', ' stroke-width=".5"') + rc(55, 41, 4, 8, '#c2493a', 0, ' stroke-width=".4"'),
  medal: () => `<circle cx="50" cy="46" r="2.4" fill="#f0c43a" stroke-width=".4"/><path d="M48 40 L50 46 L52 40" fill="#c2364c" stroke-width=".3"/>`,
  ermine: () => pa('M38 39 Q50 45 62 39 L62 44 Q50 50 38 44Z', '#f6f1e8', ' stroke-width=".5"') + [42, 48, 54, 60].map(x => `<circle cx="${x - 1}" cy="${44}" r=".7" fill="${INK}" stroke="none"/>`).join('')
};
const CRIT = {
  mouse_farmer:   ['mouse', 'meadow', 'green', 'straw', 'pitchfork', ['apron']],
  squirrel_shopkeeper: ['squirrel', 'indoor', 'brown', 'none', 'scales', ['apron']],
  hedgehog_bard:  ['hedgehog', 'dusk', 'purple', 'feather', 'lute', []],
  frog_judge:     ['frog', 'indoor', 'black', 'wig', 'gavel', ['bowtie']],
  owl_historian:  ['owl', 'indoor', 'brown', 'none', 'book', ['glasses']],
  badger_king:    ['badger', 'dusk', 'red', 'crown', 'scepter', ['ermine']],
  rabbit_queen:   ['rabbit', 'meadow', 'purple', 'crown', 'scepter', ['medal']],
  mole_miner:     ['mole', 'stone', 'tan', 'helmet', 'pick', []],
  beetle_architect: ['beetle', 'meadow', 'blue', 'cap', 'plans', ['glasses']],
  fox_wanderer:   ['fox', 'autumn', 'green', 'wander', 'stick', ['scarf']],
  shrew_ranger:   ['shrew', 'meadow', 'green', 'hood', 'bow', []],
  pigeon_postal:  ['pigeon', 'meadow', 'blue', 'postal', 'letter', []],
  turtle_teacher: ['turtle', 'indoor', 'teal', 'mortar', 'ruler', ['glasses']],
  bat_doctor:     ['bat', 'night', 'cream', 'doc', 'bag', ['mirror']],
  toad_undertaker:['toad', 'dusk', 'black', 'tophat', 'shovel', []],
  hedgehog_monk:  ['hedgehog', 'indoor', 'brown', 'monk', 'candle', []],
  mouse_fool:     ['mouse', 'dusk', 'yellow', 'jester', 'bells', []],
  shrew_sweeper:  ['shrew', 'autumn', 'grey', 'cap', 'broom', ['apron']],
  squirrel_woodcarver: ['squirrel', 'autumn', 'tan', 'cap', 'carve', ['apron']],
  rabbit_peddler: ['rabbit', 'meadow', 'orange', 'wander', 'pack', []],
  frog_innkeeper: ['frog', 'indoor', 'red', 'none', 'mug', ['apron']],
  badger_harvester:['badger', 'autumn', 'orange', 'straw', 'sickle', []],
  owl_judge:      ['owl', 'indoor', 'black', 'wig', 'scroll', []],
  fox_peddler:    ['fox', 'autumn', 'blue', 'cap', 'pack', ['scarf']],
  mole_historian: ['mole', 'indoor', 'grey', 'none', 'scroll', ['glasses']],
  bat_bard:       ['bat', 'night', 'red', 'feather', 'lute', []],
  turtle_monk:    ['turtle', 'stone', 'brown', 'monk', 'candle', []],
  toad_shopkeeper:['toad', 'indoor', 'green', 'bonnet', 'scales', ['apron']],
  beetle_woodcarver:['beetle', 'autumn', 'tan', 'none', 'carve', ['apron']],
  pigeon_ranger:  ['pigeon', 'winter', 'green', 'hood', 'bow', []],
  mouse_queen:    ['mouse', 'dusk', 'blue', 'crown', 'scepter', ['medal']],
  hedgehog_farmer:['hedgehog', 'autumn', 'green', 'straw', 'sickle', []]
};
function critter(key) {
  const [sp, bg, coat, hat, prop, ex] = CRIT[key], S = SP[sp], c = coatCol[coat];
  let s = scene(bg, key);
  s += ell(50, 61, 26, 3.4, '#2f3a2a', .18, NS0); // ground shadow
  if (ex.includes('ermine') || hat === 'crown') s += pa('M34 63 C32 46 38 38 50 38 C62 38 68 46 66 63Z', '#9c3a34', ' transform="translate(0 0) scale(1)"');
  s += S.back();
  const arm = k => ell(50 + k * 15, 51, 4.2, 6.8, c, null, ` transform="rotate(${k * -14} ${50 + k * 15} 51)"`);
  s += arm(-1);
  s += pa('M35 63 C34 48 39 39.5 50 39.5 C61 39.5 66 48 65 63Z', c);
  if (coat !== 'cream' && coat !== 'black') s += pa('M44 40.5 Q50 46 56 40.5', 'none', ' stroke="#fff" stroke-opacity=".45" stroke-width=".8"');
  s += `<path d="M50 41 L50 62" stroke="#000" stroke-opacity=".18" stroke-width=".5"/>` + `<circle cx="50" cy="47" r=".9" fill="#f0e2b8" stroke="none"/><circle cx="50" cy="53" r=".9" fill="#f0e2b8" stroke="none"/>`;
  ex.forEach(e => { if (e === 'apron') s += EXTRA.apron(); });
  s += S.head(S);
  ex.forEach(e => { if (e !== 'apron' && EXTRA[e]) s += EXTRA[e](); });
  s += (HAT[hat] || HAT.none)();
  s += arm(1).replace(/fill="[^"]+"/, `fill="${c}"`);
  s += ell(66.5, 56, 2.6, 2.6, S.hand, null, ' stroke-width=".4"');
  s += (PROP[prop] || PROP.none)();
  return s;
}
