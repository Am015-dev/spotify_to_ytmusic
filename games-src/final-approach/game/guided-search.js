// Finds a scripted set of hands for the guided first flight (g1, no abilities) that teaches each control in order and is easy to win.
// node guided-search.js [candidates] [games each]
const T = require('./tlib.js'); require('./src/ai.js'); const { FA, D } = T;
const NC = +(process.argv[2] || 60), NG = +(process.argv[3] || 14);
let sd = 12345; const rnd = () => { sd = (sd * 1664525 + 1013904223) >>> 0; return sd / 4294967296; }; const d6 = () => 1 + Math.floor(rnd() * 6);
const hand = (need) => { const h = [d6(), d6(), d6(), d6()]; need.forEach((v, i) => { const opts = Array.isArray(v) ? v : [v]; h[i] = opts[Math.floor(rnd() * opts.length)]; }); return h.sort(() => rnd() - .5); };
function cand() {
  const S = [];
  for (let r = 0; r < 7; r++) { let p = hand([]), c = hand([]); if (r === 1) p = hand([[3, 4], [1, 2]]); if (r === 2) c = hand([[1, 2]]); if (r === 3) p = hand([2, 4]); if (r === 4) c = hand([[2, 3]]); S.push([p, c]); }
  return S;
}
function play(script, seed) {
  let r = seed; const R = () => { r = (r * 1664525 + 1013904223) >>> 0; return r / 4294967296; };
  const G = FA.newGame({ scenario: 'g1', seed, abil: [], ai: ['normal', 'normal'] }); G.script = script; let n = 0;
  while (!G.result && n++ < 600) { const s = FA.pending(G)[0], m = FA.AI.move(G, s, 'normal', { rand: R }); if (!m) return false; if (!FA.performMove(G, m, s).ok) return false; }
  return !!(G.result && G.result.win);
}
const rate = (sc, n, s0) => { let w = 0; for (let i = 0; i < n; i++) if (play(JSON.parse(JSON.stringify(sc)), s0 + i * 977)) w++; return w / n; };
let best = null, bv = -1;
for (let i = 0; i < NC; i++) { const c = cand(), v = rate(c, NG, 500 + i); if (v > bv) { bv = v; best = c; console.log('cand', i, v.toFixed(2)); } }
const ver = rate(best, 60, 9000); console.log('verify 60 games', ver.toFixed(2)); console.log(JSON.stringify(best));
