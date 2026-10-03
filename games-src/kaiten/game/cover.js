// Coverage: mixed AI and random legal moves, invariants after EVERY apply, and a list of every card type / rule path that actually fired.
//   node cover.js [games=300]
const KK = require('./src/engine.js'); require('./src/ai.js');
const N = +process.argv[2] || 300;
let r = 42; const rnd = n => { r = (Math.imul(r, 1103515245) + 12345) >>> 0; return Math.floor(r / 4294967296 * n); };
const fired = {}; const hit = (k, n) => { fired[k] = (fired[k] || 0) + (n === undefined ? 1 : n); };
let applies = 0, problems = 0, games = 0; const probs = [];
const LV = ['easy', 'normal', 'hard', 'random', 'normal', 'random'];
for (let g = 0; g < N; g++) {
  const np = 2 + g % 4, lv = []; for (let i = 0; i < np; i++) lv.push(LV[rnd(LV.length)]);
  const G = KK.newGame({ players: np, seed: 31337 + g, ai: lv.map(x => x === 'random' ? null : x) });
  games++;
  try {
    while (G.phase !== 'over') {
      for (let s = 0; s < np; s++) {
        const ms = KK.moves(G, s); if (!ms.length) throw new Error('no moves for seat ' + s);
        const m = lv[s] === 'random' ? ms[rnd(ms.length)] : KK.AI.choose(G, s, lv[s] === 'hard' && g % 6 ? 'normal' : lv[s]);
        const res = KK.apply(G, s, m); if (!res.ok) throw new Error('rejected ' + JSON.stringify(m) + ': ' + res.error); applies++;
        const e = KK.checkInvariants(G); if (e.length) throw new Error('invariant: ' + e.join('; '));
        for (const ev of G.events) {
          if (ev.t === 'reveal') for (const pk of ev.picks) { for (const c of pk.cards) { hit('card played: ' + KK.cardKey(c.id)); if (c.w >= 0) hit('nigiri placed on Fire Paste'); } if (pk.chop >= 0) hit('Twin Sticks used (double pick, sticks returned to hand)'); if (pk.cards.length === 2) hit('double pick'); }
          if (ev.t === 'score') hit('round scored');
          if (ev.t === 'gameEnd') hit('game ended');
        }
      }
    }
    const S = KK.score(G);
    for (const rd of S.rounds) rd.seats.forEach((x, i) => {
      if (x.tempura) hit('score: tempura pair'); if (x.sashimi) hit('score: sashimi set'); if (x.dumpling) hit('score: dumplings'); if (x.dumpling >= 15) hit('score: 5+ dumplings (15)');
      if (x.maki === 6) hit('score: maki most (6)'); if (x.maki === 3) hit('score: maki 3 (second or split most)'); if (x.maki === 0 && x.icons > 0) hit('score: maki icons but no points'); if (x.maki === 1) hit('score: maki split second (1)'); if (x.maki === 2) hit('score: maki 3-way split most (2)');
      if (x.nigiri) hit('score: nigiri'); if (x.wasabi) hit('score: tripled nigiri (paste bonus)'); if (x.total === 0) hit('score: a round of 0');
    });
    if (S.pudding.pts.some(p => p > 0)) hit('pudding: most scored'); if (S.pudding.pts.some(p => p < 0)) hit('pudding: fewest penalised (3+ players)');
    if (np === 2 && S.pudding.counts[0] !== S.pudding.counts[1]) hit('pudding: 2-player game with different counts (no penalty)');
    if (S.pudding.pts.every(p => p === 0) && S.pudding.counts.every(c => c === S.pudding.counts[0])) hit('pudding: all equal, nobody scores');
    if (G.winners.length > 1) hit('game: shared win'); if (G.final.totals.filter(t => t === Math.max(...G.final.totals)).length > 1 && G.winners.length === 1) hit('game: tie broken by puddings');
    for (const k of ['chopUsed', 'wasabiNigiri', 'wasabiWasted', 'makiTie', 'makiZero']) if (G.used[k]) hit('used: ' + k, G.used[k]);
    hit('players ' + np);
  } catch (e) { problems++; if (probs.length < 6) probs.push('game ' + g + ' (seed ' + (31337 + g) + '): ' + (e.stack || e.message).split('\n').slice(0, 2).join(' | ')); }
}
// forced scenarios for rare paths (the tie-break and a fully equal game are rare in AI play)
{
  const T = require('./tlib');
  const mk = (banked, puds) => { const G = T.game(2, 12); G.round = 3; G.rs = [banked.map(t => ({ total: t, maki: 0, tempura: 0, sashimi: 0, dumpling: 0, nigiri: 0, wasabi: 0, icons: 0, table: [] }))]; puds.forEach((n, i) => T.setPud(G, i, n)); T.lastTurn(G, ['egg', 'egg']); T.pickFirst(G); return G; };
  const a = mk([20, 26], [3, 2]); if (a.winners.length === 1 && a.final.totals[0] === a.final.totals[1]) hit('game: tie broken by puddings');
  const b = mk([30, 30], [1, 1]); if (b.winners.length === 2) hit('game: shared win');
  const c = mk([30, 30], [2, 2]); if (c.final.puddingPts.every(p => p === 0)) hit('pudding: all equal, nobody scores');
}
const REQUIRED = [];
for (const t of KK.DATA.types) REQUIRED.push('card played: ' + t.id);
REQUIRED.push('Twin Sticks used (double pick, sticks returned to hand)', 'double pick', 'nigiri placed on Fire Paste', 'used: wasabiWasted', 'round scored', 'game ended',
  'score: tempura pair', 'score: sashimi set', 'score: dumplings', 'score: 5+ dumplings (15)', 'score: maki most (6)', 'score: maki 3 (second or split most)', 'score: maki icons but no points', 'score: nigiri', 'score: tripled nigiri (paste bonus)',
  'pudding: most scored', 'pudding: fewest penalised (3+ players)', 'pudding: 2-player game with different counts (no penalty)', 'pudding: all equal, nobody scores', 'game: tie broken by puddings', 'game: shared win', 'used: makiTie', 'players 2', 'players 3', 'players 4', 'players 5');
let missing = 0; for (const k of REQUIRED) if (!fired[k]) { missing++; console.log('FAIL: never fired: ' + k); }
console.log('cover: ' + games + ' games, ' + applies + ' applies (invariants checked after each), ' + problems + ' problems; ' + (REQUIRED.length - missing) + '/' + REQUIRED.length + ' required items fired');
console.log(JSON.stringify(fired));
for (const p of probs) console.log('FAIL: ' + p);
process.exit(problems || missing ? 1 : 0);
