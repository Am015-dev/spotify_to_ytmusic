// ---------- online play: what a remote seat may see ----------
// netStrip(G, seat) builds a NEW state object for ONE seat from a WHITELIST of public fields (nothing is copied by default: a field the engine
// gains later is absent from the copy until it is listed here, so it cannot leak by accident). It starts from CF.stripView (other bags and
// held chips are replaced by placeholders, the fortune deck order is gone, seed and rng zeroed) and rebuilds the object field by field. The
// copy answers CF.moves(seat) / CF.AI.choose for its own seat the same as the real state (tools: net-strip-test.js).
// seat -1 = a watcher (every bag hidden). Pure function: no DOM.
const NET_TOP = ['v', 'np', 'round', 'phase', 'start', 'sets', 'supply', 'fdeckN', 'fcard', 'fdisc', 'logN', 'evN', 'hist', 'rep', 'over', 'winner', 'winners', 'winText', 'ev', 'shopSeat', 'opts'];
const NET_PL = ['seat', 'name', 'ai', 'char', 'vp', 'rubies', 'droplet', 'flask', 'rat', 'ratTails', 'bag', 'bagN', 'pot', 'side', 'hold', 'holdN', 'newChips', 'q', 'postq', 'acts', 'st', 'boom', 'prot', 'f', 'res', 'last9', 'ver', 'endVp'];
function netStrip(g, seat) {
  const v = CF.stripView(g, Number.isInteger(seat) && seat >= 0 && seat < g.np ? seat : -1);
  const cp = o => o == null ? o : JSON.parse(JSON.stringify(o));
  const P = {};
  for (const k of NET_TOP) if (v[k] !== undefined) P[k] = cp(v[k]);
  P.players = v.players.map(p => { const o = {}; for (const k of NET_PL) if (p[k] !== undefined) o[k] = cp(p[k]); return o; });
  P.log = cp(v.log.slice(-150));
  // events: what another seat peeked at (chips drawn aside) is private
  P.events = cp(v.events.slice(-80)).map(e => (e.t === 'peek' && e.seat !== seat) ? { t: 'peek', seat: e.seat, n: e.n, round: e.round } : e);
  P.rng = 0; P.seed = 0;
  return P;
}
if (typeof module === 'object' && module.exports) { module.exports = netStrip; }
