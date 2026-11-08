// The guided first landing, as data: dice per round, the co-pilot's scripted moves and the pilot's moves, in turn order.
// Shared by the page (ui12.js reads TUT_PLAN through FA) and by tut-sim.js (node: plays it through the engine and must land).
(function (root) {
  const P = {
    script: [[[4, 5, 6, 1], [3, 2, 5, 1]], [[2, 4, 1, 5], [4, 3, 2, 5]], [[5, 4, 3, 2], [5, 4, 4, 6]], [[4, 3, 2, 6], [3, 2, 6, 1]]],
    rr: [[0, 0, 6, 0], [0, 0, 0, 0]],
    // co-pilot moves per round, in order: [die, slot]
    cop: [[[0, 'ax1'], [1, 'en1'], [2, 'co0'], [3, 'fl0']], [[0, 'ax1'], [1, 'en1'], [2, 'fl1'], [3, 'co0']], [[0, 'ax1'], [1, 'en1'], [2, 'fl2'], [3, 'co0']], [[0, 'ax1'], [1, 'en1'], [2, 'fl3'], [3, 'ra1']]],
    // pilot moves per round, in order: [die, slot, coffee]
    pil: [[[0, 'ax0', 0], [1, 'en0', 0], [2, 'co1', 0], [3, 'lg0', 0]], [[0, 'ra0', 0], [1, 'ax0', -1], [3, 'en0', 0], [2, 'lg2', 0]], [[0, 'ax0', 0], [1, 'en0', 0], [2, 'lg1', 0], [3, 'br0', 0]], [[0, 'br1', 0], [1, 'ax0', 0], [2, 'en0', 0], [3, 'br2', 0]]]
  };
  P.rrAt = [1, 1]; P.rrDie = 2;   // round 2, before the pilot's 2nd die: spend the token and reroll die 2 (the 1 becomes a 6)
  P.setup = { scenario: 'tt', seed: 23, row0: 3, pre: { script: P.script, rrScript: P.rr } };
  root.TUT_PLAN = P; if (typeof module !== 'undefined') module.exports = P;
})(typeof window !== 'undefined' ? window : globalThis);
