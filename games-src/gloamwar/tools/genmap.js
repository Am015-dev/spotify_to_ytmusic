// Generates src/map.js: 104 land regions (Voronoi cells of hand-placed + seeded points), adjacency (mountain walls cut it),
// coastline, rivers and mountain ranges. Original geography. Run: node tools/genmap.js   (needs d3-delaunay: npm i --no-save d3-delaunay in games-src)
const fs = require('fs'), path = require('path');
const { Delaunay } = require(path.join(__dirname, '..', '..', 'node_modules', 'd3-delaunay'));
const W = 1000, H = 1400, TARGET = 104;
let s = 7; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;

// ---- coastline (land polygon) and lake, clockwise
const COAST = [[120, 40], [300, 20], [520, 30], [760, 18], [990, 30], [990, 1390], [930, 1395], [820, 1360], [700, 1385], [560, 1350], [470, 1290], [455, 1200],
  [420, 1160], [330, 1150], [250, 1090], [270, 1010], [190, 960], [150, 880], [110, 800], [130, 720], [85, 640], [110, 560], [60, 480], [95, 400], [40, 330], [70, 250], [30, 170], [80, 90]];
const BAY = [[60, 210], [150, 200], [165, 240], [90, 260]];          // the Gullet, a firth by Sailhaven
const LAKE = [[880, 470], [945, 455], [975, 520], [940, 590], [880, 585], [860, 525]]; // the Bitter Mere
function inPoly(p, P) { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [xi, yi] = P[i], [xj, yj] = P[j]; if ((yi > p[1]) !== (yj > p[1]) && p[0] < (xj - xi) * (p[1] - yi) / (yj - yi) + xi) c = !c; } return c; }
const land = p => inPoly(p, COAST) && !inPoly(p, LAKE);

// ---- mountain walls (impassable borders). Gaps in the lines are passes.
const MOUNTAINS = [
  { n: 'The Spine', pts: [[540, 70], [520, 150], [500, 215]] },                       // north spine; gap = Lanternvale pass at y~250
  { n: 'The Spine', pts: [[485, 300], [470, 380], [455, 470], [445, 540]] },          // middle spine; Hollowdeep under it links both sides
  { n: 'The Spine', pts: [[432, 610], [420, 660]] },                                   // south tail, the Varrn gap below it
  { n: 'Frostteeth', pts: [[640, 70], [720, 60], [790, 40]] },                          // north range above the Hammer hills
  { n: 'The Ashwall', pts: [[715, 800], [700, 870], [695, 930]] },                      // Morvast west wall (Wraithpass gap at y~950)
  { n: 'The Ashwall', pts: [[700, 985], [720, 1050], [760, 1110], [830, 1140], [905, 1150]] }, // south wall; Ashfields gap east of x 905
  { n: 'The Ashwall', pts: [[830, 760], [905, 745], [935, 740]] },                      // north wall; Blackgate gap x 715-830
  { n: 'Brass Hills', pts: [[160, 590], [230, 600]] },
];
const RIVERS = [
  { n: 'Varrow', pts: [[600, 120], [590, 260], [610, 380], [640, 520], [655, 650], [680, 780], [690, 900], [660, 1000], [640, 1080], [630, 1160], [640, 1260], [660, 1350]] },
  { n: 'Greyrun', pts: [[260, 140], [300, 260], [330, 380], [300, 470], [250, 560], [190, 640], [160, 720]] },
  { n: 'Silverthread', pts: [[560, 460], [610, 480]] },
];
function segX(a, b, c, d) { const o = (p, q, r) => Math.sign((q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0])); return o(a, b, c) !== o(a, b, d) && o(c, d, a) !== o(c, d, b); }
function crossesWall(a, b, under) {
  if (under) return false;   /* Hollowdeep: the delvings run under the Spine */
  for (const m of MOUNTAINS) for (let i = 1; i < m.pts.length; i++) if (segX(a, b, m.pts[i - 1], m.pts[i])) return true; return false; }

// ---- named places: [id, name, x, y, nation, settlement]. Nations: gr deepwood folk, df dwarf-clans, au Aurelmont, va Varrn, hl Hearthlands; pt Pale Throne, cv Corvel, sh Sundered Hosts
const PLACES = [
  ['sailhaven', 'Sailhaven', 105, 175, 'gr', 'strong'], ['lanternvale', 'Lanternvale', 455, 255, 'gr', 'strong'], ['silverbough', 'Silverbough', 565, 510, 'gr', 'strong'], ['oakthrone', 'Oakthrone', 735, 215, 'gr', 'strong'],
  ['hammerdeep', 'Hammerdeep', 835, 95, 'df', 'strong'], ['westdelve', 'Westdelve', 170, 105, 'df', 'town'], ['ironreach', 'Ironreach', 950, 120, 'df', 'town'],
  ['citadel', 'Aurel Citadel', 610, 935, 'au', 'strong'], ['seawatch', 'Seawatch', 360, 1080, 'au', 'strong'], ['brinemouth', 'Brinemouth', 585, 1150, 'au', 'city'], ['crossing', 'Varrow Crossing', 660, 880, 'au', 'fort'], ['lampfield', 'Lampfield', 510, 1010, 'au', 'town'],
  ['thistledown', 'Thistledown', 235, 300, 'hl', 'city'], ['brightwater', 'Brightwater', 860, 185, 'hl', 'city'], ['kettlecross', 'Kettlecross', 345, 290, 'hl', 'town'], ['ferrystone', 'Ferrystone', 620, 230, 'hl', 'town'], ['northmarch', 'Northmarch', 300, 160, 'hl', 'town'],
  ['shieldkeep', 'Shieldkeep', 300, 815, 'va', 'strong'], ['hallowmead', 'Hallowmead', 415, 790, 'va', 'city'], ['fords', 'Corvel Fords', 285, 720, 'va', 'fort'], ['windmere', 'Windmere', 505, 735, 'va', 'town'],
  ['corvel', 'Corvel Tower', 330, 625, 'cv', 'strong'], ['nbrass', 'North Brassmoor', 190, 525, 'cv', 'town'], ['sbrass', 'South Brassmoor', 200, 665, 'cv', 'town'],
  ['spire', 'Morvast Spire', 905, 905, 'pt', 'strong'], ['gallowmere', 'Gallowmere', 770, 520, 'pt', 'strong'], ['wraithpass', 'Wraithpass', 735, 960, 'pt', 'strong'], ['blackgate', 'Blackgate', 775, 735, 'pt', 'strong'],
  ['hollowdeep', 'Hollowdeep', 450, 505, 'pt', 'strong'], ['cragmaw', 'Cragmaw', 590, 65, 'pt', 'strong'], ['ashfields', 'Ashfields', 900, 1090, 'pt', 'town'], ['cinderplain', 'Cinderplain', 815, 870, 'pt', null],
  ['dunesreach', 'Dunesreach', 860, 1310, 'sh', 'city'], ['saltfang', 'Saltfang', 560, 1305, 'sh', 'strong'], ['khazmar', 'Khazmar', 945, 650, 'sh', 'city'], ['steppegate', 'Steppegate', 935, 330, 'sh', 'town'], ['redsand', 'Redsand', 760, 1210, 'sh', 'town'],
  ['whisperwood', 'Whisperwood', 400, 650, null, null], ['emberwaste', 'Ember Waste', 860, 990, 'pt', null], ['coldmoor', 'Coldmoor', 400, 80, 'pt', null],
];
// nation territories: every region whose seed lies in one of these discs belongs to that nation (first match wins; else no nation)
const TERR = { gr: [[105, 175, 95], [455, 255, 70], [565, 510, 80], [735, 215, 85]], df: [[835, 95, 95], [170, 105, 70], [950, 120, 70]],
  au: [[610, 935, 110], [360, 1080, 130], [585, 1150, 110], [660, 880, 40], [510, 1010, 90]], va: [[300, 815, 95], [415, 790, 110], [285, 720, 40], [505, 735, 90], [250, 900, 80]],
  hl: [[235, 300, 110], [860, 185, 45], [345, 290, 70], [620, 230, 55], [300, 160, 70], [150, 300, 80]], cv: [[330, 625, 50], [190, 525, 80], [200, 665, 60]],
  pt: [[905, 905, 120], [770, 520, 90], [735, 960, 40], [775, 735, 40], [450, 505, 40], [590, 65, 60], [900, 1090, 70], [400, 80, 70], [910, 800, 60], [745, 830, 30]],
  sh: [[860, 1310, 130], [560, 1305, 90], [945, 650, 90], [935, 330, 80], [760, 1210, 90], [940, 1200, 70]] };
// ---- seed filler regions (Poisson disk), deterministic
const seeds = PLACES.map(p => ({ id: p[0], n: p[1], x: p[2], y: p[3], nat: p[4], set: p[5] }));
const minD = (x, y) => Math.min(...seeds.map(q => Math.hypot(q.x - x, q.y - y)));
let tries = 0, D = 84;
while (seeds.length < TARGET && tries < 200000) {
  tries++; if (tries % 20000 === 0) D -= 4;
  const x = 40 + rnd() * (W - 80), y = 40 + rnd() * (H - 80);
  if (!land([x, y]) || minD(x, y) < D) continue;
  // keep a little away from coast so cells read as land
  let near = false; for (let a = 0; a < 6.28; a += 0.8) if (!land([x + 28 * Math.cos(a), y + 28 * Math.sin(a)])) near = true;
  if (near) continue;
  seeds.push({ x: Math.round(x), y: Math.round(y) });
}
// water seeds (not regions): a ring of points just outside the coast and inside the lake/bay, so cells stop at the shore
const water = [];
for (let y = 10; y < H; y += 26) for (let x = 10; x < W; x += 26) { const p = [x + (y % 52 ? 13 : 0), y]; if (!land(p) && minD(p[0], p[1]) > 30) water.push({ x: p[0], y: p[1], w: 1 }); }
const all = seeds.concat(water);
const del = Delaunay.from(all.map(p => [p.x, p.y])), vor = del.voronoi([0, 0, W, H]);
// names for filler regions
const A = ['Ash', 'Bram', 'Cold', 'Dun', 'Elder', 'Fern', 'Gorse', 'Hollin', 'Iron', 'Kestle', 'Lark', 'Marrow', 'Nettle', 'Oxen', 'Pike', 'Rook', 'Sedge', 'Thorn', 'Umber', 'Wold', 'Yarrow', 'Briar', 'Cinder', 'Drake', 'Ember', 'Frost', 'Heron', 'Moss', 'Raven', 'Stag', 'Wether', 'Willow', 'Hare', 'Badger', 'Cairn', 'Salt', 'Red', 'Hazel', 'Rowan', 'Alder', 'Birch', 'Barley', 'Teasel', 'Otter', 'Flint', 'Linden', 'Tansy', 'Wren', 'Crane', 'Mallow', 'Sorrel', 'Quarry', 'Bell', 'Copper', 'Dusk', 'Glim', 'Hob', 'Kell', 'Lorn', 'Mire', 'Nab'];
const B = ['fen', 'mere', 'wold', 'moor', 'ford', 'dale', 'holt', 'reach', 'downs', 'heath', 'marsh', 'barrow', 'combe', 'field', 'wick', 'tor', 'crag', 'hollow', 'glen', 'wash', 'lea', 'stead', 'brook', 'ridge'];
const DARK = ['Soot', 'Grave', 'Gloam', 'Rot', 'Blight', 'Murk', 'Char', 'Wail', 'Scorch', 'Bleak', 'Dread', 'Grim'];
const used = new Set(seeds.filter(q => q.n).map(q => q.n)); let ni = 0;
function nameFor(q) {
  for (let k = 0; k < 400; k++) { const dark = q.nat === 'pt'; const a = dark ? DARK[(ni * 7 + k) % DARK.length] : A[(ni * 13 + k * 7) % A.length], b = B[(ni * 5 + k * 3) % B.length]; const n = a + b; if (!used.has(n)) { used.add(n); ni++; return n; } }
  return 'Region ' + (ni++);
}
const regions = [];
seeds.forEach((q, i) => {
  if (q.nat === undefined) { q.nat = null; for (const [nat, ds] of Object.entries(TERR)) if (ds.some(([x, y, r]) => Math.hypot(x - q.x, y - q.y) <= r)) { q.nat = nat; break; } }
  if (!q.id) { q.n = nameFor(q); q.id = q.n.toLowerCase().replace(/[^a-z]/g, ''); }
  const poly = vor.cellPolygon(i).map(([x, y]) => [Math.round(x), Math.round(y)]);
  const adj = [...del.neighbors(i)].filter(j => j < seeds.length && !crossesWall([q.x, q.y], [seeds[j].x, seeds[j].y], q.id === 'hollowdeep' || seeds[j].id === 'hollowdeep'));
  regions.push({ id: q.id, n: q.n, x: q.x, y: q.y, nat: q.nat, set: q.set || null, poly, adjI: adj });
});
regions.forEach(r => { r.adj = r.adjI.map(j => regions[j].id); delete r.adjI; });
// symmetric check, connectivity
regions.forEach(r => r.adj.forEach(a => { const o = regions.find(x => x.id === a); if (o.adj.indexOf(r.id) < 0) o.adj.push(r.id); }));
const seen = new Set(['lanternvale']), st = ['lanternvale'];
while (st.length) { const c = st.pop(); regions.find(x => x.id === c).adj.forEach(a => { if (!seen.has(a)) { seen.add(a); st.push(a); } }); }
const bfs = (from) => { const d = { [from]: 0 }, q = [from]; while (q.length) { const c = q.shift(); regions.find(x => x.id === c).adj.forEach(a => { if (d[a] == null) { d[a] = d[c] + 1; q.push(a); } }); } return d; };
const d0 = bfs('lanternvale');
console.log('regions', regions.length, 'connected', seen.size, 'water seeds', water.length, 'minD', D);
console.log('Lanternvale -> Wraithpass', d0.wraithpass, ' -> Blackgate', d0.blackgate, '; Spire adj', regions.find(r => r.id === 'spire').adj.join(','));
const cnt = {}; regions.forEach(r => { if (r.set) cnt[r.nat + ':' + r.set] = (cnt[r.nat + ':' + r.set] || 0) + 1; }); console.log(JSON.stringify(cnt));
const natc = {}; regions.forEach(r => natc[r.nat] = (natc[r.nat] || 0) + 1); console.log(JSON.stringify(natc));
const out = '/* GENERATED by tools/genmap.js (do not edit by hand). Original map of the Gloamwar lands: 104 regions, Voronoi cells, adjacency cut by mountain walls. */\n' +
  'var MAPW=' + W + ',MAPH=' + H + ';\nvar COAST=' + JSON.stringify(COAST) + ';\nvar LAKES=' + JSON.stringify([LAKE]) + ';\nvar MOUNTAINS=' + JSON.stringify(MOUNTAINS) + ';\nvar RIVERS=' + JSON.stringify(RIVERS) + ';\n' +
  'var REGIONS=' + JSON.stringify(regions) + ';\n';
fs.writeFileSync(path.join(__dirname, '..', 'src', 'map.js'), out);
