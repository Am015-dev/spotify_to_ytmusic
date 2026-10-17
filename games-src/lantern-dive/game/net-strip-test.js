// The whitelist view sent to a remote seat.   node net-strip-test.js [games=20]
// For many states: the stripped copy answers LD.moves / LD.AI.choose / LD.pending like the real state, holds no other hand, no drone card
// underneath, no seed, no deck order, no other seat's pending vote / pass / memory, and every field is on the whitelist.
const LD = require('./src/engine.js'); require('./src/ai.js'); const netStrip = require('./src/netstrip.js'); global.LD = LD;
const N = +process.argv[2] || 20; const D = LD.DATA;
let checks = 0, problems = 0, maxBytes = 0; const bad = []; const prob = m => { problems++; if (bad.length < 8) bad.push(m); };
const ALLOWED = new Set(['v', 'hn', 'np', 'two', 'helper', 'att', 'logN', 'evN', 'mission', 'distress', 'clock', 'clockLeft', 'clockRun', 'timerOn', 'comm', 'unk', 'pool', 'tasks', 'pl', 'pings', 'tricks', 'phase', 'result', 'trick', 'left', 'offered', 'ntr', 'firstW', 'lastCard', 'as', 'cap', 'actor', 'sig', 'pass', 'tdeck', 'tdisc', 'used', 'players', 'log', 'events', 'rng', 'seed', 'nolog']);
for (let g = 0; g < N; g++) {
  const np = 2 + (g % 4), id = [3, 6, 9, 11, 14, 20, 26, 29, 10, 17][g % 10];
  const G = LD.newGame({ players: np, seed: 900 + g, mission: { kind: 'log', id }, ai: Array(np).fill('normal'), timer: id === 14 });
  G.players.forEach(p => { if (!p.helper) p.ai = 'normal'; });
  let steps = 0;
  while (G.phase !== 'over' && steps++ < 500) {
    for (let seat = 0; seat < G.hn; seat++) {
      const S = netStrip(G, seat); checks++;
      const js = JSON.stringify(S); maxBytes = Math.max(maxBytes, js.length);
      for (const k of Object.keys(S)) if (!ALLOWED.has(k)) prob('field ' + k);
      if (S.rng !== 0 || S.seed !== 0) prob('seed/rng');
      if (typeof S.tdeck !== 'number') prob('deck order');
      S.players.forEach(p => { if (p.seat !== seat && !p.helper && p.hand.some(x => x >= 0)) prob('hand of seat ' + p.seat); if (p.seat !== seat && Object.keys(p.mem || {}).length) prob('mem of ' + p.seat); if (p.helper && p.stacks.some(s => s[1] >= 0)) prob('drone bottom'); if (p.helper && p.hand.filter(x => x >= 0).length !== p.stacks.filter(s => s[0] >= 0).length) prob('drone hand ' + JSON.stringify(p.hand)); Object.keys(p).forEach(k => { if (!['seat', 'name', 'ai', 'hand', 'stacks', 'pingUsed', 'mem', 'helper'].includes(k)) prob('player field ' + k); }); });
      if (S.as && S.as.votes) for (const k in S.as.votes) if (+k !== seat && S.as.votes[k] !== -1) prob('vote of ' + k);
      if (S.pass && S.pass.give) for (const k in S.pass.give) if (+k !== seat && S.pass.give[k] !== -1) prob('pass of ' + k);
      S.tasks.forEach(t => { const d = D.tasks[t.id]; if (d.k === 'pred' && !d.open && t.pn >= 0 && LD.ctl(G, t.owner) !== seat && G.phase !== 'over') prob('secret prediction'); });
      // same answers as the real state
      const m1 = JSON.stringify(LD.moves(G, seat)), m2 = JSON.stringify(LD.moves(S, seat)); if (m1 !== m2) prob('moves differ seat ' + seat + ' phase ' + G.phase);
      if (JSON.stringify(LD.pending(G)) !== JSON.stringify(LD.pending(S))) prob('pending differs');
      if (LD.pending(G).includes(seat) && !G.players[seat].helper && steps % 4 === 0) { const a = JSON.stringify(LD.AI.choose(G, seat, 'normal')), b = JSON.stringify(LD.AI.choose(S, seat, 'normal')); if (a !== b) prob('AI differs seat ' + seat + ' ' + G.phase + ' ' + a + ' / ' + b); }
    }
    if (!LD.AI.step(G)) break;
  }
  // the watcher view shows no hand at all
  const W = netStrip(G, -1); W.players.forEach(p => { if (!p.helper && p.hand.some(x => x >= 0)) prob('watcher sees a hand'); });
}
console.log(JSON.stringify({ games: N, views: checks, problems, maxViewBytes: maxBytes }));
for (const b of bad) console.log('  ' + b);
process.exit(problems ? 1 : 0);
