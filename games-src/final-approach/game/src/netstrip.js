// Whitelist copy of the game state for ONE seat (online play). Built field by field: a field that is not listed here never leaves the host.
// The other crew member's dice values, the seed, the random state and any scripted hands are gone; everything public stays.
function netStrip(G, seat) {
  const own = (s, d) => ({ v: s === seat ? (d.v | 0) : 0, u: !!d.u });
  const pend = !G.pend ? null : G.pend.h === 'rr' ? { h: 'rr', d: { m: G.pend.d.m.map((m, s) => s === seat ? (m ? m.map(x => !!x) : null) : (m ? [] : null)), by: G.pend.d.by } }
    : G.pend.h === 'wt' ? { h: 'wt', d: { a: G.pend.d.a, ai: G.pend.d.a === seat ? G.pend.d.ai : -1 } }
    : G.pend.h === 'intern' ? { h: 'intern', d: { seat: G.pend.d.seat, val: G.pend.d.val } } : { h: 'sync', d: { seat: G.pend.d.seat, val: G.pend.d.val } };
  const pl = G.pl;
  return {
    v: G.v, seed: 0, rng: 0, sid: G.sid, tk: G.tk, alt: G.alt, row0: G.row0, mods: Object.assign({}, G.mods), abil: G.abil.slice(), names: G.names.slice(), ai: G.ai.slice(),
    round: G.round, phase: G.phase, first: G.first, turn: G.turn, ready: G.ready.slice(), say: [G.say[0].slice(), G.say[1].slice()],
    pl: { axis: pl.axis, aeroB: pl.aeroB, aeroO: pl.aeroO, pos: pl.pos, kero: pl.kero, wind: pl.wind, ice: pl.ice, sw: { lg: pl.sw.lg.slice(), fl: pl.sw.fl.slice(), br: pl.sw.br.slice() } },
    planes: G.planes.slice(), coffee: G.coffee, rrHand: G.rrHand, rrTaken: G.rrTaken,
    dice: [G.dice[0].map(d => own(0, d)), G.dice[1].map(d => own(1, d))],
    slots: Object.fromEntries(Object.keys(G.slots).map(k => [k, { s: G.slots[k].s, v: G.slots[k].v, k: G.slots[k].k }])), keys: G.keys.slice(), pend,
    fl: { antic: !!G.fl.antic, sync: !!G.fl.sync, wt: !!G.fl.wt, keroUsed: !!G.fl.keroUsed }, adaptUsed: G.adaptUsed.slice(), intern: G.intern.slice(), internUsed: G.internUsed,
    speed: G.speed, landSpeed: G.landSpeed, result: G.result ? Object.assign({ win: !!G.result.win, why: G.result.why, msg: G.result.msg, checks: Object.assign({}, G.result.checks) }, Array.isArray(G.result.miss) ? { miss: G.result.miss.filter(k => /^(ax|en)[01]$/.test(k)) } : {}) : null,
    log: G.log.slice(-60).map(l => ({ i: l.i, r: l.r, t: l.t })), logN: G.logN, events: [], evN: G.evN, used: Object.assign({}, G.used), nolog: false
  };
}
if (typeof module === 'object' && module.exports) module.exports = netStrip;
if (typeof FA !== 'undefined') FA.netStrip = netStrip;
