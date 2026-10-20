// Shared helpers for rules-test.js / cover.js / hidden-test.js: build states by hand without breaking card conservation.
const KK = require('./src/engine.js'); require('./src/ai.js');
const T = { KK };
T.game = (np, seed, o) => KK.newGame(Object.assign({ players: np, seed: seed === undefined ? 7 : seed }, o || {}));
T.all = G => { const o = []; for (const p of G.players) { p.hand.forEach(id => o.push(id)); p.table.forEach(e => o.push(e.id)); p.pud.forEach(id => o.push(id)); } return o; };
// take one card of `key` out of the deck (or, if the deck has none, swap it out of another zone); returns its id
T.take = (G, key, avoid) => {
  for (let i = G.deck.length - 1; i >= 0; i--) { const id = G.deck[i]; if (KK.cardKey(id) === key && !(avoid && avoid.has(id))) { G.deck.splice(i, 1); return id; } }
  for (let i = 0; i < G.discard.length; i++) { const id = G.discard[i]; if (KK.cardKey(id) === key && !(avoid && avoid.has(id))) { G.discard.splice(i, 1); return id; } }
  for (const p of G.players) {
    for (const zone of [p.hand, p.pud]) for (let i = 0; i < zone.length; i++) { const id = zone[i]; if (KK.cardKey(id) === key && !(avoid && avoid.has(id))) { zone[i] = G.deck.pop(); return id; } }
  }
  throw new Error('no free card of ' + key);
};
T.setHand = (G, seat, keys) => { const p = G.players[seat]; G.deck.push(...p.hand); p.hand = []; const av = new Set(); for (const k of keys) { const id = T.take(G, k, av); av.add(id); p.hand.push(id); } return p.hand.slice(); };
// table keys in order; nigiri land on the oldest unused wasabi automatically (same as in play)
T.setTable = (G, seat, keys) => { const p = G.players[seat]; G.deck.push(...p.table.map(e => e.id)); p.table = []; const ids = []; for (const k of keys) { const id = T.take(G, k); ids.push(id); KK._.place(p, id); } return ids; };
T.setPud = (G, seat, n) => { const p = G.players[seat]; G.deck.push(...p.pud); p.pud = []; for (let i = 0; i < n; i++) p.pud.push(T.take(G, 'pudding')); };
// make it the last turn of the round: every seat holds exactly one card (keys[seat])
T.lastTurn = (G, keys) => { G.turn = G.hand; keys.forEach((k, i) => T.setHand(G, i, [k])); };
T.pickKey = (G, seat, k) => { const i = G.players[seat].hand.findIndex(id => KK.cardKey(id) === k); if (i < 0) throw new Error('seat ' + seat + ' has no ' + k); const r = KK.apply(G, seat, { pick: [i] }); if (!r.ok) throw new Error(r.error); };
T.pickKeys = (G, seat, a, b) => { const h = G.players[seat].hand, ia = h.findIndex(id => KK.cardKey(id) === a); const ib = h.findIndex((id, i) => i !== ia && KK.cardKey(id) === b); if (ia < 0 || ib < 0) throw new Error('missing ' + a + '/' + b); const r = KK.apply(G, seat, { pick: [Math.min(ia, ib), Math.max(ia, ib)] }); if (!r.ok) throw new Error(r.error); };
// every seat picks the first card
T.pickFirst = G => { for (const p of G.players) if (!p.picked) { const r = KK.apply(G, p.seat, { pick: [0] }); if (!r.ok) throw new Error(r.error); } };
T.keys = ids => ids.map(KK.cardKey);
T.inv = G => { const e = KK.checkInvariants(G); if (e.length) throw new Error('invariant: ' + e.join('; ')); };
// score a hand-built table set via the real round-end: each seat plays one last card from `last` after the tables are set
T.rs = (G) => KK.roundScores(G);
module.exports = T;
