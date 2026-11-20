// Headless test games: the hero helper plays every scenario; invariants after every move. node gauntlet.js [games per scenario] [heroes csv] [scen csv]
global.window = global; ['data', 'scen', 'engine', 'ai'].forEach(f => require('./src/' + f + '.js'));
const D = WDD, E = WD, AI = WDAI;
const N = +process.argv[2] || 4, cls = (process.argv[3] || 'warden,ringer').split(','), only = process.argv[4] ? process.argv[4].split(',').map(Number) : null;
let fails = 0, tot = 0, wins = 0; const rows = [];
for (const s of D.SCEN_LIST) {
  if (only && !only.includes(s.id)) continue;
  let w = 0, rounds = 0, err = '';
  for (let i = 0; i < N; i++) {
    const party = cls.map(c => ({ cls: c, lvl: Math.min(9, 1 + Math.floor((s.id - 1) / 3)) }));
    let G;
    try {
      G = E.newScenario(s.id, party, { seed: 1000 * s.id + i });
      let n = 0;
      while (!G.done && n++ < 6000) {
        const m = AI.choose(G); if (!m) throw new Error('no move at ' + JSON.stringify(G.ask));
        const legal = E.validMoves(G); if (!legal.some(x => JSON.stringify(x) === JSON.stringify(m))) throw new Error('illegal ' + JSON.stringify(m) + ' ask ' + G.ask.h);
        E.apply(G, m); G.ev = [];
        const inv = E.checkInvariants(G); if (inv.length) throw new Error('invariant: ' + inv.join('; ') + ' after ' + JSON.stringify(m));
        if (G.round > 60) throw new Error('too many rounds');
      }
      if (!G.done) throw new Error('stuck: ' + JSON.stringify(G.ask));
      if (G.done.won) w++; rounds += G.round;
    } catch (e) { err = err || (e.message + ' seed ' + (1000 * s.id + i)); fails++; if (process.env.TRACE) console.log(e.stack); }
    tot++;
  }
  wins += w;
  console.log(String(s.id).padStart(2) + ' ' + s.n.padEnd(20) + ' won ' + w + '/' + N + '  avg rounds ' + (rounds / N).toFixed(1) + (err ? '  ERROR ' + err : ''));
}
console.log('games ' + tot + ' wins ' + wins + ' errors ' + fails); process.exit(fails ? 1 : 0);
