// ===================== part 8: board-first layer (one short line, round animation, drag a die onto a space, ghost finger) =====================
// The board is the screen. The dock holds a thin goal strip, ONE line of at most 8 words, and one row of buttons. Explanations, the log and the phrases live in the drawers.
function phPrompt() {
  if (!G) return '';
  if (G.result) return endWords();
  const v = actSeat(), pend = FA.pending(G), mine = typeof v === 'number' && v >= 0 && mayAct(v);
  if (G.phase === 'brief') return mine ? (G.ready[v] ? 'Waiting for your crewmate.' : 'Tap Roll to start.') : 'Crew getting ready.';
  if (G.pend) {
    const p = G.pend, me = mine && pend.includes(v);
    if (p.h === 'rr') return me && !p.d.m[v] ? 'Tap dice to reroll, or keep.' : 'Waiting for the reroll.';
    if (p.h === 'intern') return me && v === p.d.seat ? 'Tap the token, then a space.' : 'Trainee token being placed.';
    if (p.h === 'sync') return me && v === 1 ? 'Place the cross-check die.' : 'Cross-check die being placed.';
    if (p.h === 'wt') return me && v === 1 - p.d.a ? 'Pick one die to swap.' : 'Waiting for the hand-over.';
  }
  if (mine && G.turn === v) { const mi = mandInfo(v); if (mi && mi.lost) return 'Too few dice left!'; if (mi && mi.tight && (UI.sel === -1 || UI.sel == null)) return 'Save a die for Axis and Engines.'; return UI.sel === -1 || UI.sel == null ? 'Drag a die onto a space.' : 'Drop it on a glowing space.'; }
  if (v === 'all') return name(G.turn) + ' is placing.';
  return name(G.turn) + ' is placing...';
}
// the thin goal / race strip
function goalStrip() {
  const size = trackOf().sp.length, pos = G.pl.pos, last = D.rounds - G.row0, fin = FA.isFinal(G), need = size - pos;
  const t = fin ? 'Landing round · speed ≤ brakes ' + FA.brakeVal(G) : pos >= size ? 'At the airport · hold to round ' + last : 'Land by round ' + last + ' · ' + need + ' to go';
  return h('button.goalb.gstrip', { type: 'button', 'data-a': 'goalopen', 'aria-label': t + '. Tap for the full goal and checklist.' }, h('span', t), h('i.gi', { 'aria-hidden': 'true' }, 'i'));
}
// ---------- the overlay layer: round animation, ghost finger, dragged die ----------
function fxLayer() { const bd = $('#bd'); if (!bd) return null; let f = $('#fx'); if (!f) { f = h('div#fx', { 'aria-hidden': 'true' }); bd.appendChild(f); } return f; }
const bdRect = () => $('#bd').getBoundingClientRect();
function relRect(el) { if (!el) return null; const b = bdRect(), r = el.getBoundingClientRect(); return { x: r.left - b.left, y: r.top - b.top, w: r.width, h: r.height, cx: r.left - b.left + r.width / 2, cy: r.top - b.top + r.height / 2 }; }
function fxPop(x, y, txt, cls, delay) {
  const f = fxLayer(); if (!f) return; const e = h('div.pop' + (cls ? '.' + cls : ''), { style: 'left:' + Math.round(x) + 'px;top:' + Math.round(y) + 'px;animation-delay:' + (delay || 0) + 'ms' }, txt);
  f.appendChild(e); setTimeout(() => { try { e.remove(); } catch (er) { } }, 2400 + (delay || 0));
}
// the plane flies from space a to space b of the approach strip
function fxPlane(a, b) {
  const f = fxLayer(), LY = UI.LY; if (!f || !LY || a === b || !UI.cw) return; const ap = LY.r.appr, cw = UI.cw, off = UI.stripOff || 0;
  const px = i => ap.x + 2 + off + (i - .5) * cw, y = ap.y + ap.h * .42, ax = Math.max(ap.x + 8, Math.min(ap.x + ap.w - 8, px(a))), bx = Math.max(ap.x + 8, Math.min(ap.x + ap.w - 8, px(b)));
  const e = h('div.fxplane', { style: 'left:' + Math.round(ax) + 'px;top:' + Math.round(y) + 'px;--dx:' + Math.round(bx - ax) + 'px', html: PLANE_SVG.replace('width="12" height="12"', 'width="34" height="34"') });
  f.appendChild(e); setTimeout(() => { try { e.remove(); } catch (er) { } }, 1500);
}
// ---------- results on the board: every change shows where it happens (needle, tilt, plane, coffee, altitude); no report card ----------
const LOSS_S = { mandatory: 'Empty Axis or Engines', spin: 'Spin! The tilt was too big', collision: 'Collided with a plane', overshoot: 'Overshot the airport', corridor: 'Axis outside the corridor', fuel: 'Out of fuel', short: 'Missed the airport', timeout: 'Out of time' };
const CHK_S = { speed: 'Too fast to stop', planes: 'Planes still on the track', gear: 'Landing gear still up', flaps: 'Flaps not out', axis: 'Not level at landing', intern: 'Trainee not trained', ice: 'Icy brakes unfinished' };
function endWords() {
  const R = G.result; if (!R) return ''; if (R.win) return 'Landed! Well flown.';
  if (R.why === 'checks' || R.why === 'speed') { const bad = Object.keys(R.checks || {}).filter(k => !R.checks[k]); if (bad.length) return CHK_S[bad[0]] || 'The landing failed'; }
  return LOSS_S[R.why] || 'The flight is over';
}
function engineEv() { if (!G || !G.events) return null; for (let i = G.events.length - 1; i >= 0; i--) if (G.events[i].t === 'engine') return G.events[i]; return null; }
// called from render(): compares the engine's numbers with the last picture and pops what changed on the part that changed
function resultFx(r) {
  const e = engineEv(), k = G.sid + ':' + G.seed + ':' + (UI.mode || ''), cur = { k, axis: G.pl.axis, n: e ? e.n : 0, planes: FA.planesOnTrack(G) };
  UI.gSpd = e ? e.s : 0; const was = UI.rfx; UI.rfx = cur;
  if (!was || was.k !== k || !ANIM || !r) return;
  if (cur.axis !== was.axis && r.dial) fxPop(r.dial.x + r.dial.w / 2, r.dial.y + r.dial.h * .08, cur.axis === 0 ? 'level' : 'tilt ' + Math.abs(cur.axis) + (cur.axis < 0 ? ' left' : ' right'), 'tilt', 80);
  if (e && cur.n !== was.n && r.gauge) fxPop(r.gauge.x + r.gauge.w / 2, r.gauge.y - 6, e.final ? 'landing speed ' + e.s : 'speed ' + e.s + (e.adv ? ' · +' + e.adv : ' · hold'), 'spd', 200);
  if (cur.planes < was.planes && r.appr) fxPop(r.appr.x + r.appr.w * .5, r.appr.y + r.appr.h * .3, cur.planes === 0 ? 'track clear' : '− plane', 'rad', 150);
}
// the round just ended: the plane flies, coffee pops where it was earned, the altitude window announces the new height
function roundFx(r, info) {
  if (!G || G.result || !ANIM) return;
  const rows = altRows(), N = rows[G.round + G.row0], cr = UI.LY && UI.LY.r;
  if (info.axis !== G.pl.axis) { UI.axA = { from: info.axis, to: G.pl.axis, t0: Date.now() }; setTimeout(() => { if (UI.axA && Date.now() - UI.axA.t0 >= 900) UI.axA = null; }, 1000); }
  if (info.pos !== G.pl.pos) setTimeout(() => fxPlane(info.pos, G.pl.pos), 350);
  if (info.coffee < G.coffee || info.coffeeLines) { const n = Math.max(1, info.coffeeLines || (G.coffee - info.coffee)), ks = (info.slots || []).filter(k => /^co/.test(k)); for (let i = 0; i < n; i++) { const q = ks.length && cr && cr[ks[Math.min(i, ks.length - 1)]] ? cr[ks[Math.min(i, ks.length - 1)]] : (cr && cr.coffee); if (q) fxPop(q.x + q.w / 2 + (ks.length ? 0 : (i - (n - 1) / 2) * 40), q.y - 4, '+1 ☕', 'cof', 150 + i * 200); } }
  if (N && cr && cr.alt) fxPop(cr.alt.x + cr.alt.w * .5, cr.alt.y + 2, N[0] + ' ft', 'alt', 900);
}
// ---------- ghost finger: one hand shows the first move (die, then the space) while hints are on ----------
// the ghost finger shows the move on the first round of a first flight (and on the guided flight), later only after the Hint button
function hintsOn() { return !!G && !G.result && (!!UI.hint || UI.mode === 'guided' || (UI.camp ? !!UI.camp.hints : !Object.keys(UI.won || {}).length && G.round < 1)); }
function ghostPlan() {
  const v = actSeat(); if (!hintsOn() || typeof v !== 'number' || v < 0 || !mayAct(v) || G.phase !== 'place' || G.pend || G.turn !== v || UI.dragging) return null;
  const key = G.sid + ':' + G.seed + ':' + G.round + ':' + Object.keys(G.slots).length + ':' + (UI.mode || '');
  if (UI.gk !== key) { UI.gk = key; UI.gm = null; try { const m = FA.AI.move(G, v, 'normal', { noMC: true }); if (m && m.t === 'place' && typeof m.d === 'number') UI.gm = m; } catch (e) { } }
  return UI.gm && !G.dice[v][UI.gm.d].u ? { v, m: UI.gm } : null;
}
function drawGhost() {
  const f = fxLayer(); if (!f) return; $$('#fx .gh').forEach(e => e.remove());
  const p = ghostPlan(); if (!p) return; const sel = UI.sel;
  const die = relRect($('#pz .die[data-s="' + p.v + '"][data-d="' + p.m.d + '"]')), slot = relRect($('#pz .slot[data-slot="' + p.m.to + '"]'));
  if (!die) return;
  const hand = '<svg viewBox="0 0 32 32" width="44" height="44"><path d="M12 3a2.5 2.5 0 0 1 5 0v10l2-.6a2.4 2.4 0 0 1 3 1.5l.3.9 1.6-.2a2.3 2.3 0 0 1 2.6 2l.5 5.2c.3 3.3-2.2 6.2-5.5 6.2h-4.6a5.5 5.5 0 0 1-4.4-2.2L7 20.3a2.2 2.2 0 0 1 3.4-2.8L12 19.2z" fill="#fff" stroke="#14202c" stroke-width="1.6" stroke-linejoin="round"/></svg>';
  if (sel === p.m.d && slot) f.appendChild(h('div.gh.go', { style: 'left:' + Math.round(die.cx) + 'px;top:' + Math.round(die.cy) + 'px;--dx:' + Math.round(slot.cx - die.cx) + 'px;--dy:' + Math.round(slot.cy - die.cy) + 'px', html: hand }));
  else if (sel === -1 || sel == null) f.appendChild(h('div.gh.tap', { style: 'left:' + Math.round(die.cx) + 'px;top:' + Math.round(die.cy) + 'px', html: hand }));
}
// ---------- drag a die onto a space ----------
(function () {
  let dr = null;
  const ghostDie = d => { const f = fxLayer(), s = +d.dataset.s, e = h('div.gdie.' + (s ? 'o' : 'b'), { style: 'width:' + Math.round(d.getBoundingClientRect().width * 1.05) + 'px;height:' + Math.round(d.getBoundingClientRect().width * 1.05) + 'px' }, (d.querySelector('.dv') || {}).textContent || ''); f.appendChild(e); return e; };
  const at = (x, y) => { const e = document.elementFromPoint(x, y); return e && e.closest ? e.closest('.slot') : null; };
  const place = (e, x, y) => { const b = bdRect(); e.style.left = Math.round(x - b.left) + 'px'; e.style.top = Math.round(y - b.top - 26) + 'px'; };
  document.addEventListener('pointerdown', ev => {
    if (dr || !G || !UI.started || (ev.pointerType === 'mouse' && ev.button !== 0)) return; const d = ev.target.closest && ev.target.closest('#pz .die:not(.used):not(.cover)'); if (!d) return;
    dr = { el: d, s: +d.dataset.s, d: d.dataset.d === 'p' ? 'p' : +d.dataset.d, x: ev.clientX, y: ev.clientY, on: false, g: null, id: ev.pointerId };
  }, true);
  window.addEventListener('pointermove', ev => {
    if (!dr || ev.pointerId !== dr.id) return;
    if (!dr.on) { if (Math.hypot(ev.clientX - dr.x, ev.clientY - dr.y) < 9) return; dr.on = true; UI.dragging = true; UI.dragged = Date.now();
      if (UI.sel !== dr.d) dieTap(dr.s, dr.d);   // picking it up selects it: the legal spaces glow
      if (UI.sel !== dr.d) { dr = null; UI.dragging = false; return; }
      const nd = $('#pz .die[data-s="' + dr.s + '"][data-d="' + dr.d + '"]'); if (nd) { dr.el = nd; nd.classList.add('drag'); } dr.g = ghostDie(dr.el); $$('#fx .gh').forEach(e => e.remove()); }
    if (dr.g) { place(dr.g, ev.clientX, ev.clientY); const s = at(ev.clientX, ev.clientY); $$('#pz .slot.over').forEach(e => { if (e !== s) e.classList.remove('over'); }); if (s && s.classList.contains('legal')) s.classList.add('over'); }
  }, true);
  const end = ev => {
    if (!dr || ev.pointerId !== dr.id) return; const o = dr; dr = null; if (!o.on) return;
    UI.dragging = false; if (o.g) o.g.remove(); $$('#pz .slot.over,#pz .die.drag').forEach(e => e.classList.remove('over', 'drag'));
    if (ev.type === 'pointerup') { const s = at(ev.clientX, ev.clientY); if (s && s.dataset.slot) { slotTap(s.dataset.slot); return; } }
    render();
  };
  window.addEventListener('pointerup', end, true); window.addEventListener('pointercancel', end, true);
  // a drag ends with a click on the die: swallow that one so it does not un-select the die
  document.addEventListener('click', ev => { if (UI.dragged && Date.now() - UI.dragged < 400 && ev.target.closest && ev.target.closest('#pz .die')) { ev.stopPropagation(); ev.preventDefault(); UI.dragged = 0; } }, true);
})();
// ---------- post-render hook (called at the end of render) ----------
function phPost() {
  const R = document.documentElement.classList; if (!G) return;
  fxLayer(); drawGhost();
  const ac = $('#acts'), si = $('#selinfo');
  if (isPh() && ac && si) { const cof = si.querySelector('.cof'); if (cof) ac.insertBefore(cof, ac.firstChild); }
  if (GX && (GX.open === 'crewd' || GX.open === 'logd')) { try { renderDrawers(); } catch (e) { } }
  R.toggle('fabrief', G.phase === 'brief' && !G.result);
  try { hlpAfter(); } catch (e) { console.error(e); }
}

// ---------- the ending, on the board: the picture plus at most 8 words; tap the banner to look at the panel ----------
function showEndBoard() {
  const f = fxLayer(); if (!f || !G || !G.result) return; try { render(); } catch (e) { }   // the Fly again / Next airport buttons come with the banner
  $$('#fx .endb').forEach(e => e.remove());
  f.appendChild(h('button.endb.' + (G.result.win ? 'win' : 'lose'), { type: 'button', 'data-a': 'lookpanel', 'aria-label': endWords() + '. Tap to look at the panel.' }, h('b', endWords())));
}
function lookPanel() { if (typeof pxClearEnd === 'function') pxClearEnd(); const b = $('#fx .endb'); if (b) b.classList.add('small'); render(); }
