// node net-strip-test.js [games]  -> netStrip: whitelist view per seat. Checks on AI games (2-5 players, all levels), at every pick:
//   moves(seat)/score/AI choice on the copy equal the real state's; poison test (scramble every hidden thing in the real G -> identical copy);
//   leak scan (other hands, deck, rng/seed, pending picks, other seats' memories, unlisted fields).
const KK = require('./src/engine.js'); require('./src/ai.js'); global.KK = KK; const netStrip = require('./src/netstrip.js');
const N = +process.argv[2] || 20; let views = 0, bad = 0; const probs = []; const P = m => { bad++; if (probs.length < 10) probs.push('FAIL: ' + m); };
const J = JSON.stringify;
const ALLOWED = new Set(['v', 'np', 'round', 'turn', 'hand', 'phase', 'deck', 'discard', 'hist', 'rs', 'logN', 'evN', 'used', 'winner', 'winners', 'winText', 'final', 'players', 'log', 'events', 'rng', 'seed']);
const PL_ALLOWED = ['seat', 'name', 'ai', 'hand', 'table', 'pud', 'pick', 'picked', 'mem'];
function poison(g, seat) {
  const c = KK.clone(g); let s = 12345; const r = n => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s % n; };
  const hid = []; c.players.forEach((p, i) => { if (i !== seat) hid.push(...p.hand); }); hid.push(...c.deck);
  for (let i = hid.length - 1; i > 0; i--) { const j = r(i + 1); [hid[i], hid[j]] = [hid[j], hid[i]]; }
  let k = 0; c.players.forEach((p, i) => { if (i !== seat) { p.hand = p.hand.map(() => hid[k++]); if (p.pick) p.pick = p.pick.map(() => hid[0]); p.mem = [{ turn: 5, hand: [hid[1]] }]; } });
  c.deck = c.deck.map(() => hid[k++]); c.rng = 999; c.seed = 777; c.zzz = 'unlisted'; c.players.forEach(p => { p.zzz = 'unlisted'; });
  return c;
}
function check(g) {
  for (let seat = -1; seat < g.np; seat++) {
    const v = netStrip(g, seat); views++;
    if (seat >= 0) {
      if (J(KK.moves(g, seat)) !== J(KK.moves(v, seat))) P('moves differ seat ' + seat);
      if (g.phase === 'pick' && !g.players[seat].picked) for (const lv of ['easy', 'normal', 'hard']) { if (lv === 'hard' && views % 5) continue; if (J(KK.AI.choose(g, seat, lv)) !== J(KK.AI.choose(v, seat, lv))) P('AI choice differs (' + lv + ')'); }
    }
    if (J(KK.score(g)) !== J(KK.score(v))) P('score differs');
    if (g.winText !== v.winText || J(g.final) !== J(v.final)) P('result differs');
    if (J(netStrip(g, seat)) !== J(netStrip(poison(g, seat), seat))) P('poison changed the copy, seat ' + seat);
    for (const k of Object.keys(v)) if (!ALLOWED.has(k)) P('unlisted field ' + k);
    v.players.forEach((p, i) => {
      for (const k of Object.keys(p)) if (!PL_ALLOWED.includes(k)) P('player field ' + k);
      if (i !== seat) { if (p.hand.some(c => c !== -1)) P('hand of ' + i + ' visible to ' + seat); if (p.pick && J(p.pick) !== '[-1]') P('pick of ' + i + ' visible'); if (p.mem.length) P('mem of ' + i + ' visible'); }
    });
    if (v.deck.some(c => c !== -1)) P('deck visible'); if (v.rng || v.seed) P('rng/seed visible');
    if (seat >= 0 && v.players[seat].hand.some(c => c < 0)) P('own hand hidden');
    if (seat >= 0 && g.players[seat].pick && J(v.players[seat].pick) !== J(g.players[seat].pick)) P('own pick hidden');
    if (seat < 0 && v.players.some(p => p.hand.some(c => c !== -1))) P('watcher sees a hand');
    if (J(v).includes('zzz')) P('unlisted field leaked');
  }
}
for (let gi = 0; gi < N; gi++) {
  const np = 2 + gi % 4, lv = ['easy', 'normal', 'hard'][gi % 3];
  const g = KK.newGame({ players: np, seed: 1000 + gi, ai: Array.from({ length: np }, (_, i) => ['easy', 'normal', 'hard'][(gi + i) % 3]) });
  let n = 0; check(g);
  while (g.phase !== 'over' && n < 400) { for (let s = 0; s < np; s++) { const m = KK.AI.choose(g, s); if (!KK.apply(g, s, m).ok) { P('illegal move'); n = 999; break; } if (n++ % 3 === 0) check(g); } }
  check(g);
}
console.log('net-strip-test: ' + N + ' games, ' + views + ' stripped views checked, ' + bad + ' problems');
for (const p of probs) console.log(p);
console.log(bad ? 'NET-STRIP TEST FAILED' : 'NET-STRIP TEST PASSED');
process.exit(bad ? 1 : 0);
