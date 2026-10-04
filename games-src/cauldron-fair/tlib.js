// Helpers for rules-test.js / cover.js / hidden-test.js: build states by hand without breaking chip conservation.
const CF = require('./src/engine.js'); require('./src/ai.js');
const T = { CF };
const ck = c => c.c + c.v;
// a game parked at the start of the brew with a chosen fortune card; every seat empty-handed (bag 9 starting chips) unless set later
const DIE0 = CF.DATA.DIE.slice();
T.dieOff = () => { CF.DATA.DIE.length = 0; for (let i = 0; i < 6; i++) CF.DATA.DIE.push('orange'); };
T.dieOn = () => { CF.DATA.DIE.length = 0; DIE0.forEach(x => CF.DATA.DIE.push(x)); };
T.game = (np, o) => {
  o = o || {}; if (o.die) T.dieOn(); else T.dieOff();
  const G = CF.newGame({ players: np || 3, seed: o.seed === undefined ? 7 : o.seed, setMode: o.sets || 1, sets: o.setObj, firstCard: 'lucky7' });
  for (const p of G.players) { p.q = null; }
  G.fcard = o.card || 'froth_none'; // any id that no rule looks at
  if (o.round) { G.round = o.round; }
  if (o.vp) o.vp.forEach((v, i) => G.players[i].vp = v);
  if (o.rubies !== undefined) G.players.forEach(p => p.rubies = o.rubies);
  G.phase = 'brew'; G.ev = null;
  for (const p of G.players) { p.st = 'draw'; p.pot = []; p.hold = []; p.postq = []; p.rat = 0; p.f = { dbl: false, safe: 0, doUsed: false, frOpen: false, frUsed: false, canFlask: false, whites: 0 }; p.boom = false; p.prot = false; }
  return G;
};
// return all of a seat's chips to the supply, then fill its bag so the chips are drawn in the listed order (first key = first draw)
// grab a chip of `key`: from the supply, else swap it out of another seat's bag for an orange 1 (keeps the box count right)
function grab(G, key, seat) {
  let c = CF._.take(G, key); if (c) return c;
  for (const q of G.players) { if (q.seat === seat) continue; const i = q.bag.findIndex(x => x.c + x.v === key); if (i >= 0) { c = q.bag[i]; q.bag[i] = CF._.take(G, 'O1'); return c; } }
  throw new Error('no chip ' + key + ' anywhere');
}
T.order = (G, seat, keys) => {
  const p = G.players[seat];
  for (const c of p.bag.concat(p.pot, p.hold, p.newChips)) G.supply[ck(c)]++;
  p.bag = []; p.pot = []; p.hold = []; p.newChips = [];
  for (let i = keys.length - 1; i >= 0; i--) p.bag.push(grab(G, keys[i], seat));
};
// extra chips that sit in the bag after the ordered ones (drawn later)
T.bagTail = (G, seat, keys) => { const p = G.players[seat]; for (const k of keys) p.bag.unshift(grab(G, k, seat)); };
T.ok = (G, seat, m) => { const r = CF.apply(G, seat, m); if (!r.ok) throw new Error('move ' + JSON.stringify(m) + ' refused: ' + r.error); return r; };
T.draw = (G, seat, n) => { for (let i = 0; i < (n || 1); i++) T.ok(G, seat, { t: 'draw' }); };
T.stop = (G, seat) => { const p = G.players[seat]; if (G.phase === 'brew' && p.st === 'draw' && !p.q && p.pot.length) return T.ok(G, seat, { t: 'stop' }); };
T.bad = (G, seat, m) => CF.apply(G, seat, m).ok === false;
T.pot = (G, seat) => G.players[seat].pot.map(c => ck(c) + '@' + c.pos);
T.inv = G => { const e = CF.checkInvariants(G); if (e.length) throw new Error('invariant: ' + e.join('; ')); };
// answer whatever a seat is asked, picking the first legal move whose fields match `want` (partial match)
T.answer = (G, seat, want) => { const ms = CF.moves(G, seat); const m = ms.find(x => Object.keys(want).every(k => JSON.stringify(x[k]) === JSON.stringify(want[k]))); if (!m) throw new Error('no move like ' + JSON.stringify(want) + ' among ' + JSON.stringify(ms.map(x => { const o = Object.assign({}, x); delete o.label; return o; }))); const o = Object.assign({}, m); delete o.label; return T.ok(G, seat, o); };
// the other seats stop at once so the evaluation can start
T.stopOthers = (G, except) => { for (const p of G.players) if (p.seat !== except && p.st !== 'done') { if (!p.pot.length) { T.order(G, p.seat, ['O1']); T.draw(G, p.seat); } if (p.st === 'draw') T.stop(G, p.seat); settleAll(G, p.seat); } };
function settleAll(G, seat) { const p = G.players[seat]; let n = 0; while (p.q && n++ < 20) { const ms = CF.moves(G, seat); const o = Object.assign({}, ms[ms.length > 1 && ms[0].t !== 'crow' ? 0 : 0]); delete o.label; CF.apply(G, seat, o); } }
// run the evaluation, answering questions with the first legal move unless `ans` says otherwise: ans(seat, q, moves) -> move|undefined
T.finish = (G, ans) => {
  let guard = 0;
  while (G.phase !== 'over' && G.phase === 'eval' && guard++ < 200) {
    const pend = CF.pending(G); if (!pend.length) break;
    const s = pend[0], p = G.players[s], ms = CF.moves(G, s); if (!ms.length) throw new Error('stuck at ' + p.q.h);
    let m = ans && ans(s, p.q, ms); if (!m) m = ms[0]; const o = Object.assign({}, m); delete o.label; T.ok(G, s, o);
  }
};
module.exports = T;
