// node net-strip-test.js [games]  -> netStrip: whitelist view per seat. Checks on AI games (2-4 players, all levels), at every few steps:
//   moves(seat) / score / AI choice on the copy equal the real state's; poison test (scramble every hidden thing in the real G -> identical copy);
//   leak scan (other bags and held chips, fortune deck, seeds, other seats' peeks, unlisted fields).
const CF = require('./src/engine.js'); require('./src/ai.js'); global.CF = CF; const netStrip = require('./src/netstrip.js');
const N = +process.argv[2] || 12; let views = 0, bad = 0; const probs = []; const P = m => { bad++; if (probs.length < 10) probs.push('FAIL: ' + m); };
const J = JSON.stringify;
const ALLOWED = new Set(['v', 'np', 'round', 'phase', 'start', 'sets', 'supply', 'fdeckN', 'fcard', 'fdisc', 'logN', 'evN', 'hist', 'rep', 'over', 'winner', 'winners', 'winText', 'ev', 'shopSeat', 'opts', 'players', 'log', 'events', 'rng', 'seed']);
const PL_ALLOWED = ['seat', 'name', 'ai', 'char', 'vp', 'rubies', 'droplet', 'flask', 'rat', 'ratTails', 'bag', 'bagN', 'pot', 'side', 'hold', 'holdN', 'newChips', 'q', 'postq', 'acts', 'st', 'boom', 'prot', 'f', 'res', 'last9', 'ver', 'endVp', 'lock'];
function poison(g, seat) {
  const c = JSON.parse(J(g)); let s = 12345; const r = n => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s % n; };
  const sh = a => { for (let i = a.length - 1; i > 0; i--) { const j = r(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  for (const p of c.players) { if (p.seat !== seat) { sh(p.bag); sh(p.hold); } p.rng = 999; p.zzz = 'unlisted'; }
  c.fdeck = sh(c.fdeck.slice()); c.rng = 999; c.seed = 777; c.zzz = 'unlisted';
  for (const e of c.events) if (e.t === 'peek' && e.seat !== seat) e.chips = (e.chips || []).map(x => Object.assign({}, x, { c: 'K', v: 9 }));
  return c;
}
function check(g) {
  for (let seat = -1; seat < g.np; seat++) {
    const v = netStrip(g, seat); views++;
    if (seat >= 0) {
      if (J(CF.moves(g, seat)) !== J(CF.moves(v, seat))) P('moves differ seat ' + seat);
      if (CF.pending(g).includes(seat) && g.phase === 'brew') for (const lv of ['easy', 'normal', 'hard']) { if (lv === 'hard' && views % 5) continue; if (J(CF.AI.choose(g, seat, lv)) !== J(CF.AI.choose(v, seat, lv))) P('AI choice differs (' + lv + ')'); }
    }
    if (J(CF.score(g)) !== J(CF.score(v))) P('score differs');
    if (g.winText !== v.winText) P('result differs');
    if (J(netStrip(g, seat)) !== J(netStrip(poison(g, seat), seat))) P('poison changed the copy, seat ' + seat);
    for (const k of Object.keys(v)) if (!ALLOWED.has(k)) P('unlisted field ' + k);
    v.players.forEach((p, i) => {
      for (const k of Object.keys(p)) if (!PL_ALLOWED.includes(k)) P('player field ' + k);
      if (i !== seat) { if (p.bag.some(c => c !== 0)) P('bag of ' + i + ' visible to ' + seat); if (p.hold.some(c => c !== 0)) P('held chips of ' + i + ' visible'); }
    });
    if (v.fdeck) P('fortune deck visible'); if (v.rng || v.seed) P('rng/seed visible');
    if (seat >= 0 && v.players[seat].bag.some(c => typeof c !== 'object')) P('own bag hidden');
    if (seat < 0 && v.players.some(p => p.bag.some(c => c !== 0))) P('watcher sees a bag');
    for (const e of v.events) if (e.t === 'peek' && e.seat !== seat && e.chips) P('peek chips of another seat visible');
    if (J(v).includes('zzz')) P('unlisted field leaked');
  }
}
for (let gi = 0; gi < N; gi++) {
  const np = 2 + gi % 3;
  const g = CF.newGame({ players: np, seed: 1000 + gi, setMode: [1, 2, 3, 4][gi % 4], ai: Array.from({ length: np }, (_, i) => ['easy', 'normal', 'hard'][(gi + i) % 3]) });
  let n = 0; check(g);
  while (g.phase !== 'over' && n < 6000) { for (const s of CF.pending(g)) { const m = Object.assign({}, CF.AI.choose(g, s)); delete m.label; if (!CF.apply(g, s, m).ok) { P('illegal move'); n = 99999; break; } if (n++ % 25 === 0) check(g); } }
  check(g);
}
console.log('net-strip-test: ' + N + ' games, ' + views + ' stripped views checked, ' + bad + ' problems');
for (const p of probs) console.log(p);
console.log(bad ? 'NET-STRIP TEST FAILED' : 'NET-STRIP TEST PASSED');
process.exit(bad ? 1 : 0);
