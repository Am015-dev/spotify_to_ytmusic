// Simple new-player bot against the computer.   node newbie-bench.js N [players=3] [rivalLevel=easy] [stopAt=5]
// The "new player" draws until its white total reaches stopAt (or the next draw could pass the limit with a white 3), never uses the flask,
// buys the dearest chip it can afford plus the dearest different colour with the coins left, and takes the option the game tags "best"
// (the normal computer's pick) on fortune cards, rubies and gifts. Reports the new player's win rate (ties credited fractionally) and scores.
const CF = require('./src/engine.js'); require('./src/ai.js');
const a = process.argv.slice(2), N = +a[0] || 200, NP = +a[1] || 3, LV = a[2] || 'easy', STOP = +a[3] || 5;
const ws = p => p.pot.reduce((s, c) => s + (c.c === 'W' ? c.v : 0), 0);
function newbie(G, s) {
  const p = G.players[s], ms = CF.moves(G, s), q = p.q && p.q.h;
  if (G.phase === 'brew' && !q) {
    const d = ms.find(m => m.t === 'draw'), st = ms.find(m => m.t === 'stop');
    if (d && (!st || ws(p) < STOP)) return d; return st || ms.find(m => m.t !== 'flask') || ms[0];
  }
  if (q === 'shop') {
    let best = null, bc = -1; for (const m of ms) { const c = (m.items || []).reduce((t, k) => t + (+k.slice(1)) * 10 + 1, 0); if (c > bc) { bc = c; best = m; } } return best;
  }
  if (q === 'de') return ms.find(m => m.o === 'buy') || ms[0];
  if (q === 'crow') return ms.find(m => m.idx >= 0 && !/Fizzpod/.test(m.label)) || ms[0];
  if (q === 'y1') return ms.find(m => m.yes) || ms[0];
  return CF.AI.choose(G, s, 'normal');
}
let w = 0, me = 0, them = 0, done = 0, err = 0, place = 0;
for (let g = 0; g < N; g++) {
  const ai = [null]; for (let i = 1; i < NP; i++) ai.push(LV);
  try {
    const G = CF.newGame({ players: NP, seed: 7000 + g, ai, setMode: 1 }); G.nolog = true; let n = 0;
    while (G.phase !== 'over' && n < 6000) for (const s of CF.pending(G)) { const m = s === 0 ? newbie(G, s) : CF.AI.choose(G, s); const mm = Object.assign({}, m); delete mm.label; const r = CF.apply(G, s, mm); if (!r.ok) throw new Error(r.error + JSON.stringify(mm)); n++; }
    if (G.phase !== 'over') { err++; continue; }
    done++; if (G.winners.indexOf(0) >= 0) w += 1 / G.winners.length;
    me += G.players[0].vp; let top = 0; for (let i = 1; i < NP; i++) top = Math.max(top, G.players[i].vp); them += top;
  } catch (e) { err++; if (err < 3) console.log(e.message); }
}
console.log(JSON.stringify({ N, players: NP, rivals: LV, stopAt: STOP, done, err, newbieWinPct: +(100 * w / done).toFixed(1), newbieAvg: +(me / done).toFixed(1), bestRivalAvg: +(them / done).toFixed(1) }));
