// node net-strip-test.js [games]  -> netStrip: whitelist view per seat (and for a watcher, seat -1). Checks on computer games (all levels), at many points:
//   legal moves / AI choice on the copy equal the real state's; poison test (scramble every hidden thing in the real G -> identical copy);
//   leak scan (other dice, rng/seed, scripted hands, unlisted fields); the copy passes checkInvariants.
const T = require('./tlib.js'); require('./src/ai.js'); const { FA, D } = T; const netStrip = require('./src/netstrip.js');
const N = +process.argv[2] || 20; let views = 0, bad = 0; const probs = []; const P = m => { bad++; if (probs.length < 10) probs.push('FAIL: ' + m); }; const J = JSON.stringify;
const ALLOWED = new Set(['v', 'seed', 'rng', 'sid', 'tk', 'alt', 'row0', 'mods', 'abil', 'names', 'ai', 'round', 'phase', 'first', 'turn', 'ready', 'say', 'pl', 'planes', 'coffee', 'rrHand', 'rrTaken', 'dice', 'slots', 'keys', 'pend', 'fl', 'adaptUsed', 'intern', 'internUsed', 'speed', 'landSpeed', 'result', 'log', 'events', 'logN', 'evN', 'used', 'nolog']);
let ps = 12345; const pr = n => { ps = (ps * 1103515245 + 12345) & 0x7fffffff; return ps % n; };
function poison(g, seat) { const c = FA.clone(g); for (let t = 0; t < 2; t++) if (t !== seat) for (const d of c.dice[t]) if (!d.u) d.v = 1 + pr(6); c.rng = 999; c.seed = 777; c.script = [[[6, 6, 6, 6], [6, 6, 6, 6]]]; c.zzz = 'unlisted'; if (c.pend && c.pend.h === 'rr') c.pend.d.m = c.pend.d.m.map((m, s) => s !== seat && m ? m.map(() => !!pr(2)) : m); if (c.pend && c.pend.h === 'wt' && c.pend.d.a !== seat) c.pend.d.ai = pr(4); return c; }
function seeded(seed) { let r = seed; return () => { r = (r * 1664525 + 1013904223) >>> 0; return r / 4294967296; }; }
function check(g, k) {
  for (let seat = -1; seat < 2; seat++) {
    const v = netStrip(g, seat); views++;
    if (seat >= 0) {
      if (J(FA.validMoves(g, seat)) !== J(FA.validMoves(v, seat))) P('moves differ seat ' + seat);
      if (FA.pending(g).includes(seat) && k % 4 === 0) for (const lv of ['easy', 'normal']) { if (J(FA.AI.move(g, seat, lv, { rand: seeded(k) })) !== J(FA.AI.move(v, seat, lv, { rand: seeded(k) }))) P('AI choice differs ' + lv); }
    }
    if (J(g.result && g.result.win) !== J(v.result && v.result.win)) P('result differs');
    if (J(netStrip(g, seat)) !== J(netStrip(poison(g, seat), seat))) P('poison changed the copy, seat ' + seat);
    for (const key of Object.keys(v)) if (!ALLOWED.has(key)) P('unlisted field ' + key);
    if (v.seed || v.rng) P('rng/seed visible'); if ('script' in v) P('script visible'); if (J(v).includes('zzz')) P('unlisted field leaked');
    for (let s = 0; s < 2; s++) { const vis = s === seat; v.dice[s].forEach((d, i) => { if (!vis && d.v !== 0) P('dice of seat ' + s + ' visible to ' + seat); if (vis && d.v !== g.dice[s][i].v) P('own die hidden'); if (d.u !== g.dice[s][i].u) P('used flag differs'); }); }
    for (const e of FA.checkInvariants(v)) P('copy fails invariant: ' + e);
    if (v.events.length) P('events not stripped');
  }
}
for (let gi = 0; gi < N; gi++) {
  const sc = D.scenarios[gi % D.scenarios.length], lv = ['easy', 'normal', 'hard'][gi % 3] === 'hard' ? 'normal' : ['easy', 'normal', 'hard'][gi % 3];
  const g = FA.newGame({ scenario: sc.id, seed: 1000 + gi, abil: sc.ab ? Object.keys(D.abilities).slice(gi % 3, gi % 3 + sc.ab) : [], ai: [lv, lv] }); let n = 0; check(g, 0);
  while (!g.result && n < 400) { const s = FA.pending(g)[0]; if (s === undefined) break; const m = FA.AI.move(g, s, lv, { rand: seeded(gi * 31 + n) }); if (!FA.performMove(g, m, s).ok) { P('illegal move'); break; } if (n++ % 3 === 0) check(g, n); }
  check(g, 1);
}
console.log('net-strip-test: ' + N + ' games, ' + views + ' stripped views checked, ' + bad + ' problems'); for (const p of probs) console.log(p);
console.log(bad ? 'NET-STRIP TEST FAILED' : 'NET-STRIP TEST PASSED'); process.exit(bad ? 1 : 0);
