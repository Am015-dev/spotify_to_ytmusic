// Shared helpers for rules-test.js / cover.js / hidden-test.js: build play states by hand without breaking card conservation.
const LD = require('./src/engine.js'); require('./src/ai.js');
const D = LD.DATA;
const T = { LD, D };
const CO = 0, TI = 1, KE = 2, SU = 3, LA = 4;
T.c = (s, v) => D.card(s, v);
T.SU = { CO, TI, KE, SU, LA };
// a play-phase state: hands = array of arrays of card ids (they must cover all 40 cards; leftovers are dealt to whoever is short), tasks = [[jobId, ownerSeat],..]
T.setup = (np, hands, tasks, o) => {
  o = o || {};
  const G = LD.newGame({ players: np, seed: o.seed || 3, mission: o.mission || { kind: 'free', jobs: [78] }, nolog: false });
  const used = new Set(hands.flat()); const rest = []; for (let i = 0; i < 40; i++) if (!used.has(i)) rest.push(i);
  const n = G.np, size = Math.floor(40 / n); const hs = hands.map(h => h.slice());
  while (hs.length < n) hs.push([]);
  if (G.two) { const H = G.players[G.helper]; const hc = (o.helper || rest.splice(0, 14)).slice(); H.stacks = []; for (let i = 0; i < 7; i++) H.stacks.push([hc[i], hc[7 + i]]); H.hand = hc.slice(); hs[G.helper] = hc; }
  for (let s = 0; s < n; s++) { if (G.two && s === G.helper) continue; const want = G.two ? 13 : (size + (s < 40 - size * n ? 1 : 0)); while (hs[s].length < want && rest.length) hs[s].push(rest.shift()); G.players[s].hand = hs[s].slice().sort((a, b) => a - b); }
  if (rest.length) throw new Error('left over cards ' + rest.length);
  G.tasks = tasks.map(([id, owner]) => ({ id, owner, pn: -1, st: 0 }));
  G.cap = G.players.findIndex(p => p.hand.includes(39)); G.pl = new Array(40).fill(0); G.tricks = []; G.pings = []; G.pool = 0; G.comm = o.comm || 'normal'; G.offered = !!o.offered;
  G.mission = Object.assign({}, G.mission, o.m || {}); G.mission.hold = LD._.holdsMission(G.mission);
  if (o.comm === 'narc') G.pool = np - 2;
  G.ntr = LD.ntrOf(n); G.firstW = -1; G.lastCard = -1; G.result = null;
  G.phase = 'play'; G.trick = { n: 0, lead: G.cap, turn: G.cap, plays: [], ls: -1 }; if (o.lead != null) { G.trick.lead = G.trick.turn = o.lead; }
  const e = LD.checkInvariants(G); if (e.length) throw new Error('setup invariant: ' + e.join('; '));
  return G;
};
// play cards for seats in turn order: plays = [[seat, card], ...]
T.play = (G, plays) => { for (const [s, c] of plays) { const ctl = LD.ctl(G, G.trick.turn); const r = LD.apply(G, ctl, { t: 'play', c, ...(G.players[G.trick.turn].helper ? { as: G.trick.turn } : {}) }); if (!r.ok) throw new Error('cannot play ' + D.cardName(c) + ' for seat ' + s + ': ' + r.error + ' (turn ' + G.trick.turn + ')'); if (G.trick && G.trick.turn !== undefined && G.phase === 'play' && s !== undefined && false) { } } };
T.playOK = (G, seat, c) => { const ctl = LD.ctl(G, seat); return LD.moves(G, ctl).some(m => m.t === 'play' && m.c === c); };
// finish the rest of the dive with the first legal card each (used to reach a final status)
T.finish = G => { let g = 0; while (G.phase === 'play' && g++ < 400) { const s = LD.pending(G)[0]; const m = LD.moves(G, s).find(m => m.t === 'play'); if (!m) throw new Error('no play'); const r = LD.apply(G, s, m); if (!r.ok) throw new Error(r.error); } return G; };
T.inv = G => { const e = LD.checkInvariants(G); if (e.length) throw new Error('invariant: ' + e.join('; ')); };
T.status = (G, i) => LD.jobStatus(G, i);
T.names = ids => ids.map(D.cardName);
module.exports = T;
