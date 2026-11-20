// Content balance sim: node tools/content-sim.js [runs=150] (after python3 build.py). Test bot, 3-act climb, per hero:
// win rate, % of runs that clear act 1 / 2 / 3, average HP lost per fight (start-of-fight HP minus end-of-fight HP, normal/elite/boss).
const path = require('path'), EC = require(path.join(__dirname, '..', 'core.js')), E = EC.E, N = +process.argv[2] || 150;
function run(k, seed) {
  E.newGame({ heroes: [k], seed, acts: 3 }); const G = E.G(); let n = 0, rs = G.rs >>> 0 || 1, cur = null, start = 0; const fights = [];
  const rnd = () => { let t = rs = (rs + 0x6D2B79F5) | 0; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const hp = () => G.hs.reduce((a, h) => a + Math.max(0, h.hp), 0);
  // same move picker as E.autoplay (validMoves fallback), but we watch each fight
  while (G.scr !== 'over' && n++ < 6000) {
    if (G.b && G.b !== cur) { cur = G.b; start = hp(); cur._kind = G.b.kind; }
    if (cur && G.b !== cur) { fights.push({ k: cur._kind, lost: start - hp() }); cur = G.b || null; if (cur) start = hp(); }
    { const m = E.aiMove(rnd); if (!m || !E.performMove(m)) { const m2 = E.validMoves()[0]; if (!m2 || !E.performMove(m2)) { if (G.b && G.b.ph === 'e') { E.settle(); continue; } break; } } }
    if (G.b && G.b.ph === 'e') E.settle();
  }
  if (cur) fights.push({ k: cur._kind, lost: start - hp() });
  return { won: !!G.won, act: G.act || 1, fights };
}
const out = {};
for (const k of ['w', 's', 'a', 'm']) {
  let w = 0, c = [0, 0, 0, 0]; const L = { m: [0, 0], e: [0, 0], b: [0, 0] };
  for (let i = 0; i < N; i++) { const r = run(k, 9100 + i); if (r.won) w++; for (let a = 1; a <= 3; a++) if (r.act > a || r.won) c[a]++; r.fights.forEach(f => { const b = L[f.k] || L.m; b[0] += f.lost; b[1]++; }); }
  const av = b => (b[0] / Math.max(1, b[1])).toFixed(1);
  out[k] = { win: Math.round(100 * w / N), act1: Math.round(100 * c[1] / N), act2: Math.round(100 * c[2] / N), act3: Math.round(100 * c[3] / N), hpFight: av(L.m), hpElite: av(L.e), hpBoss: av(L.b) };
  console.log(k, 'win', out[k].win + '%', '| clear act1', out[k].act1 + '% act2', out[k].act2 + '% act3', out[k].act3 + '%', '| HP lost/fight', out[k].hpFight, 'elite', out[k].hpElite, 'boss', out[k].hpBoss);
}
