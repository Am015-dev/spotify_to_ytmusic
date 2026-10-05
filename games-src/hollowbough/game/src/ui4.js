// ===================== part 4: the computer helper's pick (drives the ghost finger) and pending decisions =====================
// The pick comes from the normal computer player. It is only ever shown as the ghost finger on a target that is glowing.
function computeRec(force) {
  if (!G || G.phase === 'over') { UI.rec = null; return; }
  const a = HB.actor(G), p = G.players[a];
  if (p.ai || a !== viewSeat() || (UI.noRec && !force)) { UI.rec = null; return; }
  if (!force && !fingerWanted()) { UI.rec = null; return; }
  const key = G.logN + ':' + G.turn + ':' + (G.q ? G.q.kind + G.q.opts.length : '');
  if (UI.recKey === key && UI.rec) return;
  try { UI.rec = { m: HB.AI.choose(G, a, 'normal') }; } catch (e) { UI.rec = null; }
  UI.recKey = key;
}
// choosing: a question's options are shown on the board (cards glow where they lie, the rest are chips in the action row)
function choose(i) { const a = HB.actor(G); const m = movesFor(a).find(x => x.type === 'choose' && x.i === i); if (m) act(m); }
function renderQ() { }
