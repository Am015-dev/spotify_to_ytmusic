// Coverage: mixed AI and random legal moves, invariants after EVERY apply, and a list of every card / rule path that actually fired.
//   node cover.js [games=300]
const CF = require('./src/engine.js'); require('./src/ai.js');
const N = +process.argv[2] || 300;
let r = 42; const rnd = n => { r = (Math.imul(r, 1103515245) + 12345) >>> 0; return Math.floor(r / 4294967296 * n); };
const fired = {}; const hit = (k, n) => { fired[k] = (fired[k] || 0) + (n === undefined ? 1 : n); };
let applies = 0, problems = 0, games = 0; const probs = [];
const LV = ['easy', 'normal', 'hard', 'random', 'random', 'normal'];
for (let g = 0; g < N; g++) {
  const np = 2 + g % 3, lv = []; for (let i = 0; i < np; i++) lv.push(LV[rnd(LV.length)]);
  const G = CF.newGame({ players: np, seed: 31337 + g, ai: lv.map(x => x === 'random' ? null : x), setMode: [1, 2, 3, 4, 'random'][g % 5] });
  games++; let steps = 0, lastEv = 0;
  try {
    while (G.phase !== 'over') {
      const pend = CF.pending(G); if (!pend.length) throw new Error('nothing pending in phase ' + G.phase);
      for (const s of pend) {
        const ms = CF.moves(G, s); if (!ms.length) throw new Error('no moves for seat ' + s + ' phase ' + G.phase);
        let m = lv[s] === 'random' ? ms[rnd(ms.length)] : CF.AI.choose(G, s, lv[s] === 'hard' && g % 4 ? 'normal' : lv[s]);
        m = Object.assign({}, m); delete m.label;
        const res = CF.apply(G, s, m); if (!res.ok) throw new Error('rejected ' + JSON.stringify(m) + ': ' + res.error); applies++; steps++;
        const e = CF.checkInvariants(G); if (e.length) throw new Error('invariant: ' + e.join('; '));
        for (const ev of G.events) { if (ev.n <= lastEv) continue; lastEv = ev.n;
          if (ev.t === 'fortune') hit('fortune ' + ev.id);
          else if (ev.t === 'buy') hit('bought ' + ev.chip.c);
          else if (ev.t === 'gainChip') hit('gained chip ' + ev.chip.c);
          else if (ev.t === 'die') hit('die ' + ev.face);
          else hit('event ' + ev.t);
        }
        if (steps > 6000) throw new Error('too many steps');
      }
    }
    for (const k of Object.keys(G.used)) hit('used ' + k, G.used[k]);
    hit('players ' + np); hit('winners ' + G.winners.length);
    if (G.winners.length === 1 && G.used.tieBreak) hit('game: tie broken');
  } catch (e) { problems++; if (probs.length < 6) probs.push('game ' + g + ' (seed ' + (31337 + g) + '): ' + (e.stack || e.message).split('\n').slice(0, 2).join(' | ')); }
}
const REQUIRED = [];
for (const f of CF.DATA.FORTUNE) REQUIRED.push('fortune ' + f.id);
for (const c of ['G', 'B', 'R', 'Y', 'P', 'O', 'K']) REQUIRED.push('bought ' + c);
REQUIRED.push('event boom', 'event flask', 'event refill', 'event rat', 'event peek', 'event restart', 'event slide', 'event extraWhite', 'event bookOut', 'event scored', 'event gameEnd',
  'used explode', 'used explodeSafe', 'used flask', 'used doover', 'used rubySpace', 'used spoon', 'players 2', 'players 3', 'players 4');
for (const f of CF.DATA.DIE) REQUIRED.push('die ' + f);
const need = [...new Set(REQUIRED)];
let missing = 0; for (const k of need) if (!fired[k]) { missing++; console.log('FAIL: never fired: ' + k); }
console.log('cover: ' + games + ' games, ' + applies + ' applies (invariants checked after each), ' + problems + ' problems; ' + (need.length - missing) + '/' + need.length + ' required items fired');
console.log(JSON.stringify(fired));
for (const p of probs) console.log('FAIL: ' + p);
process.exit(problems || missing ? 1 : 0);
