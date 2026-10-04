// ---------- online play: what a remote seat may see ----------
// netStrip(G, seat) builds a NEW state object for ONE seat from a WHITELIST of public fields (nothing is copied by default: a field the
// engine gains later is absent from the copy until it is listed here, so it cannot leak by accident). It starts from HB.stripView (own hand
// only, deck order gone, private limbo / tucked cards hidden, other seats' pending question has no options, seed and rng zeroed) and then
// rebuilds the object field by field. The copy answers HB.actor / HB.moves(seat) / HB.score / HB.AI.choose the same as the real state
// (tools: net-strip-test.js). seat -1 = a watcher (every hand hidden). Pure function: no DOM.
const NET_TOP = ['v', 'np', 'solo', 'deck', 'discard', 'meadow', 'limbo', 'lpriv', 'forest', 'bev', 'sev', 'grim', 'cur', 'first', 'turn', 'phase', 'logN', 'over', 'nolog'];
const NET_PL = ['name', 'ai', 'seat', 'hand', 'city', 'res', 'pts', 'workers', 'lost', 'season', 'passed', 'dep'];
function netStrip(g, seat) {
  const v = HB.stripView(g, Number.isInteger(seat) && seat >= 0 && seat < g.np ? seat : -1);
  const cp = o => o == null ? o : JSON.parse(JSON.stringify(o));
  const P = {};
  for (const k of NET_TOP) if (v[k] !== undefined) P[k] = cp(v[k]);
  P.players = v.players.map(p => { const o = {}; for (const k of NET_PL) if (p[k] !== undefined) o[k] = cp(p[k]); return o; });
  P.q = v.q ? { who: v.q.who, kind: v.q.kind, title: v.q.who === seat ? v.q.title : '', opts: v.q.who === seat ? cp(v.q.opts) : [] } : null;
  P.log = cp(v.log.slice(-150));
  P.used = {}; P.rng = 0; P.seed = 0; P.ag = []; P.agI = 0;
  return P;
}
if (typeof module === 'object' && module.exports) module.exports = netStrip;
