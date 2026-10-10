// Helpers for rules-test.js / cover.js / hidden-test.js: build situations by hand through the real engine.
const FA = require('./src/engine.js'); const D = FA.DATA;
const T = { FA, D };
T.game = (sc, seed, o) => FA.newGame(Object.assign({ scenario: sc || 'g1', seed: seed === undefined ? 7 : seed }, o || {}));
// both crews ready -> dice are rolled
T.roll = G => { for (const s of [0, 1]) if (!G.ready[s]) T.mv(G, s, { t: 'ready' }); return G; };
T.mv = (G, seat, m) => { const r = FA.performMove(G, m, seat); if (!r.ok) throw new Error('move refused: ' + r.error + ' ' + JSON.stringify(m) + ' seat ' + seat + ' phase ' + G.phase + ' turn ' + G.turn); return r; };
// set the values of a seat's four dice (all unplaced) and make it that seat's turn
T.dice = (G, seat, vals) => { vals.forEach((v, i) => { G.dice[seat][i].v = v; G.dice[seat][i].u = false; }); for (let i = vals.length; i < 4; i++) G.dice[seat][i].u = true; };
T.turn = (G, seat) => { G.turn = seat; };
// index of an unplaced die of that value
T.idx = (G, seat, v) => { const i = G.dice[seat].findIndex(d => !d.u && d.v === v); if (i < 0) throw new Error('seat ' + seat + ' has no unplaced ' + v + ': ' + JSON.stringify(G.dice[seat])); return i; };
// place the die showing v on a slot (coffee c). Forces the turn to that seat so scenarios can be written in any order.
T.put = (G, seat, v, to, c) => { G.turn = seat; return T.mv(G, seat, { t: 'place', d: T.idx(G, seat, v), to, c: c || 0 }); };
T.can = (G, seat, v, to, c) => { const t0 = G.turn; if (!G.pend) G.turn = seat; const r = FA.validMoves(G, seat).some(m => m.t === 'place' && m.to === to && (m.c || 0) === (c || 0) && (m.d === 'p' ? G.pend.d.val : G.dice[seat][m.d].v) === v); G.turn = t0; return r; };
// a fresh round in the placement phase with the dice given for each seat (arrays of up to 4 values). Pilot starts.
T.round = (sc, seed, pv, cv, o) => { const G = T.game(sc, seed, o); T.roll(G); if (pv) T.dice(G, 0, pv); if (cv) T.dice(G, 1, cv); G.turn = G.first; return G; };
// make the axis/engines for a round: pilot a/e, co-pilot a/e values (uses four dice)
T.axisEng = (G, pa, pe, ca, ce) => { T.put(G, 0, pa, 'ax0'); T.put(G, 1, ca, 'ax1'); if (!G.result) { T.put(G, 0, pe, 'en0'); T.put(G, 1, ce, 'en1'); } };
T.inv = G => { const e = FA.checkInvariants(G); if (e.length) throw new Error('invariant: ' + e.join('; ')); };
// jump to the start of a later round with a given state (planes cleared etc. are set by the caller afterwards)
T.toRound = (G, r) => { while (G.round < r && !G.result) { G.round++; FA._.startRound(G); } return G; };
// close the round the way real play would (mandatory dice present, nothing else changes) and run the end-of-round rules
T.finishRound = G => { if (G.result) return; for (const s of [0, 1]) for (let i = 0; i < 4; i++) G.dice[s][i].u = true; G.pend = null; const f = (k, s, v) => { if (!G.slots[k]) G.slots[k] = { s, v, k: 'd' }; }; f('ax0', 0, 3); f('ax1', 1, 3); f('en0', 0, 1); f('en1', 1, 1); FA._.endRound(G); };
module.exports = T;
