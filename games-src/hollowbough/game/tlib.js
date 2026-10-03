// Shared helpers for rules-test.js, cover.js and hidden-test.js: build states by hand without breaking card conservation.
const HB = require('./src/engine.js');
const D = HB.DATA, X = HB._;
const T = { HB, D };
T.idsOf = key => { const o = []; for (let i = 0; i < HB.NCARDS; i++) if (HB.cardKey(i) === key) o.push(i); return o; };
T.game = (np, o) => {
  o = o || {};
  const pl = []; for (let i = 0; i < np; i++) pl.push({ name: 'P' + i });
  const G = HB.newGame({ players: pl, seed: o.seed || 7, solo: o.solo || null });
  return G;
};
T.solo = (diff, seed) => HB.newGame({ players: [{ name: 'P0' }], solo: { difficulty: diff || 1 }, seed: seed || 7 });
// take one instance of card `key` out of wherever it is (deck first); returns its id. Meadow slots are refilled.
T.take = (G, key, avoid) => {
  const ids = T.idsOf(key).filter(i => !(avoid && avoid.includes(i)));
  const pools = [G.deck, G.discard, G.limbo];
  for (const id of ids) { for (const pool of pools) { const i = pool.indexOf(id); if (i >= 0) { pool.splice(i, 1); return id; } } }
  for (const id of ids) {
    const mi = G.meadow.indexOf(id); if (mi >= 0) { G.meadow[mi] = -1; X.withG(G, () => X.refill()); return id; }
    for (const p of G.players) { const hi = p.hand.indexOf(id); if (hi >= 0) { p.hand.splice(hi, 1); return id; } }
  }
  for (const id of ids) { for (const p of G.players) { const e = p.city.find(x => x.id === id); if (e) throw new Error('all ' + key + ' already in cities'); } }
  throw new Error('no free ' + key);
};
// ensure the deck/meadow/hands don't hold cards we want to place deterministically: put cards on top of the deck
T.city = (G, seat, keys) => {
  const out = [];
  for (const k of keys) { const id = T.take(G, k, out); X.withG(G, () => X.placeInCity(seat, id)); out.push(id); }
  return out;
};
T.hand = (G, seat, keys) => {
  const p = G.players[seat];
  while (p.hand.length) G.discard.push(p.hand.pop());
  const out = [];
  for (const k of keys) { const id = T.take(G, k, out); p.hand.push(id); out.push(id); }
  return out;
};
T.handAdd = (G, seat, keys) => { const out = []; for (const k of keys) { const id = T.take(G, k, out); G.players[seat].hand.push(id); out.push(id); } return out; };
T.meadow = (G, slot, key) => { const id = T.take(G, key); const old = G.meadow[slot]; if (old >= 0) G.discard.push(old); G.meadow[slot] = id; return id; };
T.res = (G, seat, o) => { const p = G.players[seat]; for (const r of HB.RES) p.res[r] = o[r] || 0; };
T.entry = (G, seat, key) => G.players[seat].city.find(e => HB.cardKey(e.id) === key);
T.topDeck = (G, keys) => { const ids = []; for (const k of keys) ids.push(T.take(G, k, ids)); for (let i = ids.length - 1; i >= 0; i--) G.deck.push(ids[i]); return ids; }; // keys[0] is drawn first
T.labels = (G, seat) => HB.moves(G, seat).map(m => m.label);
// find a move: pred is a function, a regexp on label, or an object of fields
T.find = (G, seat, pred) => {
  const ms = HB.moves(G, seat);
  const f = typeof pred === 'function' ? pred : pred instanceof RegExp ? (m => pred.test(m.label)) : (m => Object.keys(pred).every(k => m[k] === pred[k]));
  return ms.find(f);
};
T.act = (G, seat, pred) => {
  const m = T.find(G, seat, pred);
  if (!m) throw new Error('no such move for seat ' + seat + ': ' + String(pred) + '\n  available: ' + (HB.moves(G, seat).map(x => x.label).join(' | ') || '(none)') + '\n  actor=' + HB.actor(G));
  const r = HB.apply(G, m); if (!r.ok) throw new Error('apply failed: ' + r.error);
  return m;
};
T.q = (G, pred) => T.act(G, G.q ? G.q.who : G.cur, pred);
T.pending = G => G.q ? G.q.kind : null;
T.finish = (G) => { // resolve any pending decisions by always picking the first option (guarded)
  let n = 0; while (G.q && n++ < 200) { const m = HB.moves(G, G.q.who)[0]; HB.apply(G, m); } return G;
};
T.inv = G => { const e = HB.checkInvariants(G); if (e.length) throw new Error('invariant: ' + e.join('; ')); };
// give a seat free workers: make it that nothing is deployed
T.cur = (G, seat) => { G.cur = seat; };
T.kinds = G => G.q ? G.q.opts.map(o => o.label) : [];
T.deployed = (G, seat) => G.players[seat].dep.length;
module.exports = T;
