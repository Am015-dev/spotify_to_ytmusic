// AI vs AI games with invariants after every move. node gauntlet.js [games=20] [levelD=normal] [levelG=normal]   QUICK=1 -> 4 games
const W = require('./load.js')();
const N = process.env.QUICK ? 4 : +(process.argv[2] || 20), LD = process.argv[3] || 'normal', LG = process.argv[4] || 'normal';
const res = { D: 0, G: 0, none: 0 }, why = {}, turns = [], t0 = Date.now(); let bad = 0, moves = 0;
const cardsSeen = new Set();
for (let g = 0; g < N; g++) {
  const G = W.newGame({ seed: 1000 + (g + (+process.argv[5] || 0)) * 7919 }); W.AI.s = 77 + g;
  let k = 0, stuck = 0;
  while (!G.win && k < 6000 && G.turn <= 40) {
    const s = W.sideToAct(G), m = W.AI.move(G, s === 'D' ? LD : LG);
    if (!m) { console.log('NO MOVE', g, G.phase, JSON.stringify(G.pend && { h: G.pend.h, st: G.pend.d && G.pend.d.stage, cur: G.pend.d && G.pend.d.cur })); bad++; break; }
    const legal = W.validMoves(G).some(x => JSON.stringify(x) === JSON.stringify(m));
    if (!legal && m.t !== 'cdone' && m.t !== 'taint' && m.t !== 'hunt' && !(G.pend && G.pend.h === 'battle')) { console.log('ILLEGAL', g, JSON.stringify(m)); bad++; break; }
    try { W.performMove(G, m); } catch (e) { console.log('THROW', g, JSON.stringify(m), e.stack.split('\n').slice(0, 4).join(' | ')); bad++; break; }
    if (m.t === 'die' && m.a === 'card') cardsSeen.add(m.c);
    moves++; k++;
    const inv = W.checkInvariants(G); if (inv.length) { console.log('INV', g, G.turn, JSON.stringify(m), inv.slice(0, 3).join('; ')); bad++; break; }
  }
  const w = G.win ? G.win.side : 'none'; res[w]++; const y = G.win ? G.win.side + ':' + G.win.why : 'timeout'; why[y] = (why[y] || 0) + 1; turns.push(G.turn);
  if (process.env.V) console.log('game', g, y, 'turn', G.turn, 'vp', W.vpOf(G, 'D'), W.vpOf(G, 'G'), 'taint', G.F.taint, 'road', G.F.road, 'loc', G.F.loc, 'battles', G.stats.battles);
}
console.log(`games ${N} D(${LD}) ${res.D} G(${LG}) ${res.G} none ${res.none} | ${JSON.stringify(why)} | avg turns ${(turns.reduce((a, b) => a + b, 0) / N).toFixed(1)} | moves ${moves} | cards played ${cardsSeen.size}/96 | errors ${bad} | ${((Date.now() - t0) / 1000).toFixed(1)}s`);
process.exit(bad ? 1 : 0);
