// ===================== part 10: the ghost finger (first move, and every move of the training dive) and dragging a card onto the table =====================
let _fing = '';
function fingerDone() {
  if (UI.fingerOn) { UI.fingerOn = false; try { lsSet('ld_finger', String((+lsGet('ld_finger') || 0) + 1)); } catch (e) { } }
  const f = $('#finger'); if (f) { f.hidden = true; _fing = ''; }
}
function fingerTarget() {
  if (!G || !UI.started || UI.busy || UI.fz || UI.dlg || UI.cards.length || UI.pop || G.phase === 'over' || viewSeat() < 0 || !iMustAct()) return null;
  const train = UI.mode === 'guided'; if (!train && !UI.fingerOn) return null;
  const v = viewSeat(), ph = G.phase;
  if (ph === 'assign') {
    if (!myMoves().some(m => m.t === 'take')) return null;
    let m = null; try { m = LD.AI.choose(G, v, 'normal'); } catch (e) { }
    const sel = m && m.t === 'take' ? '#pool [data-key="job' + m.i + '"]' : '#pool .jcard.glow';
    return { sel, kind: 'tap' };
  }
  if (!train) { if (ph !== 'play') return null; }
  if (ph === 'distress') return { sel: '#acts [data-a=dist][data-on=false]', kind: 'tap' };
  if (ph === 'signal') return { sel: '#acts [data-a=nosig]', kind: 'tap' };
  if (ph === 'play') {
    const T = G.trick, turn = T.turn; if (ctlSeat(turn) !== v) return null;
    if (G.players[turn].helper) return { sel: '#opp .dc.can', kind: 'tap' };
    let c = tutOnly();
    if (c < 0) { let m = null; try { m = LD.AI.choose(G, v, 'normal'); } catch (e) { } if (m && m.t === 'play') c = m.c; }
    if (c >= 0) return { sel: '#hand .hc[data-id="' + c + '"]', kind: 'drag' };
  }
  return null;
}
function placeFinger() {
  const f = $('#finger'); if (!f) return;
  const t = fingerTarget(); if (!t) { f.hidden = true; _fing = ''; return; }
  const el = document.querySelector(t.sel); if (!el) { f.hidden = true; return; }
  const r = el.getBoundingClientRect(); if (r.width < 4) { f.hidden = true; return; }
  const dist = t.kind === 'drag' ? Math.max(60, Math.min(170, r.top - ($('#table').getBoundingClientRect().top + 90))) : 0;
  f.hidden = false; f.className = t.kind === 'drag' ? 'drag' : 'tap';
  f.style.left = Math.round(r.left + r.width / 2) + 'px'; f.style.top = Math.round(r.top + r.height * (t.kind === 'drag' ? .45 : .5)) + 'px'; f.style.setProperty('--dist', Math.round(dist) + 'px');
  const k = t.sel + '|' + Math.round(r.left) + '|' + Math.round(r.top); if (k !== _fing) { _fing = k; f.classList.remove('go'); void f.offsetWidth; }
  f.classList.add('go');
}
// a detail callout (seat, job, last trick) never blocks the table: any touch elsewhere closes it and goes through
document.addEventListener('pointerdown', e => { if (UI.pop && e.target.closest && !e.target.closest('#ppop')) closePop(); }, true);
// ---- drag a card from the hand onto the table to play it ----
(function () {
  let Dg = null;
  const overTable = e => { const hz = $('#handz'), t = $('#table'); if (!hz || !t) return false; const tr = t.getBoundingClientRect(); return e.clientY < hz.getBoundingClientRect().top + 6 && e.clientY > tr.top - 10; };
  document.addEventListener('pointerdown', e => {
    if (e.button > 0 || !e.target.closest) return;
    const el = e.target.closest('#hand .hc, #opp .dc.can'); if (!el || e.target.closest('.pspot') || el.classList.contains('dim')) return;
    if (!G || !canAct() || G.phase !== 'play') return;
    Dg = { el, id: +el.dataset.id, drone: el.classList.contains('dc'), x0: e.clientX, y0: e.clientY, moved: false };
  }, true);
  document.addEventListener('pointermove', e => {
    if (!Dg) return; const dx = e.clientX - Dg.x0, dy = e.clientY - Dg.y0;
    if (!Dg.moved && Math.hypot(dx, dy) < 12) return;
    if (!Dg.moved) { Dg.moved = true; Dg.el.classList.add('drag'); const f = $('#finger'); if (f) f.hidden = true; }
    Dg.el.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(1.1)'; Dg.el.style.zIndex = '100';
    const t = $('#table'); if (t) t.classList.toggle('drop', overTable(e));
    try { pxDirty(); } catch (er) { }
  }, true);
  const end = e => {
    if (!Dg) return; const d = Dg; Dg = null; const t = $('#table'); if (t) t.classList.remove('drop');
    if (!d.moved) return;
    UI.noClickUntil = Date.now() + 400;
    d.el.classList.remove('drag'); d.el.style.transform = ''; d.el.style.zIndex = '';
    if (e.type === 'pointerup' && overTable(e)) { if (d.drone) tapDrone(d.id); else tapHand(d.id); } else { render(); }
  };
  document.addEventListener('pointerup', end, true); document.addEventListener('pointercancel', end, true);
  window.addEventListener('click', e => { if (UI.noClickUntil && Date.now() < UI.noClickUntil) { e.stopPropagation(); e.preventDefault(); } }, true);
})();
