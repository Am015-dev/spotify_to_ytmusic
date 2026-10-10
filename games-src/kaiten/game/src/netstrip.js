// ---------- online play: what a remote seat may see ----------
// netStrip(G, seat) builds a NEW state object for ONE seat from a WHITELIST of public fields (nothing is copied by default: a field the engine
// gains later is absent from the copy until it is listed here, so it cannot leak by accident). It starts from KK.stripView (own hand and own
// pick only, deck order gone, seed and rng zeroed) and rebuilds the object field by field. The copy answers KK.moves(seat) / KK.score /
// KK.AI.choose the same as the real state (tools: net-strip-test.js). seat -1 = a watcher (every hand hidden). Pure function: no DOM.
const NET_TOP = ['v', 'np', 'round', 'turn', 'hand', 'phase', 'deck', 'discard', 'hist', 'rs', 'logN', 'evN', 'used', 'winner', 'winners', 'winText', 'final'];
const NET_PL = ['seat', 'name', 'ai', 'hand', 'table', 'pud', 'pick', 'picked', 'mem'];
function netStrip(g, seat) {
  const v = KK.stripView(g, Number.isInteger(seat) && seat >= 0 && seat < g.np ? seat : -1);
  const cp = o => o == null ? o : JSON.parse(JSON.stringify(o));
  const P = {};
  for (const k of NET_TOP) if (v[k] !== undefined) P[k] = cp(v[k]);
  P.players = v.players.map(p => { const o = {}; for (const k of NET_PL) if (p[k] !== undefined) o[k] = cp(p[k]); return o; });
  P.log = cp(v.log.slice(-150)); P.events = cp(v.events);
  P.rng = 0; P.seed = 0;
  return P;
}
if (typeof module === 'object' && module.exports) { module.exports = netStrip; }
