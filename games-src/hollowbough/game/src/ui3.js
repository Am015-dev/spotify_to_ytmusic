// ===================== part 3: doing things on the board (tap, long-press zoom, flying pieces, floating gains, ghost finger) =====================
// ---- shake: "not here"
function shake(el) { if (!el) return; el.classList.remove('shk'); void el.offsetWidth; el.classList.add('shk'); setTimeout(() => el.classList.remove('shk'), 420); snd('error', { vol: .3 }); }
// ---- tap on a board target
// a tap on something that cannot be used right now answers with one short line (never silent)
function deadSay(tg) {
  try {
    const a = HB.actor(G), p = G.players[a]; if (!p || p.ai || (typeof NET !== 'undefined' && NET.on && a !== viewSeat())) return;
    if (G.q) { toast(G.q.kind === 'meadow' || G.q.kind === 'clear' || G.q.kind === 'inn' ? 'Tap a meadow card, not your hand' : 'Finish the choice first'); return; }
    const m = /^x:([hm])(\d+)$/.exec(tg);
    if (m) {
      const id = +m[2], c = cdef(id), cost = c.cost || {}, miss = [];
      for (const r of HB.RES) { const n = (cost[r] || 0) - (p.res[r] || 0); if (n > 0) miss.push(n + ' more ' + (r === 'berry' ? (n > 1 ? 'berries' : 'berry') : r === 'resin' ? 'resin' : r + (n > 1 ? 's' : ''))); }
      if (miss.length) { toast('Needs ' + miss.join(' and ')); return; }
      if (p.city.length >= HB.CITY) { toast('Your city is full'); return; }
      toast(m[1] === 'm' ? 'You cannot build that one now' : 'You cannot build that now'); return;
    }
    toast(availW(p) <= 0 ? 'No workers left. Prepare instead' : 'Not available right now');
  } catch (e) { }
}
function onTarget(tg, el) {
  if (!G || UI.cards.length) return;
  if (lookFirst(tg, el)) return;   // PLAY1: a tap shows what the move does and gives; the sheet's button commits
  if (/^x:/.test(tg) || UI.animBusy) { UI.sel = null; shake(el); if (/^x:/.test(tg) && !UI.animBusy) deadSay(tg); return; }
  const mm = myMoves();
  if (tg === 'pass') {
    const m = mm.find(x => x.type === 'pass'); if (!m) return;
    if (UI.passArm && Date.now() - UI.passArm < 2600) { UI.passArm = 0; actFrom(m, el); return; }
    UI.passArm = Date.now(); renderBoard(); setTimeout(() => { if (G && !UI.cards.length) renderBoard(); }, 2700); return;
  }
  UI.passArm = 0;
  const ms = mm.filter(m => tgOf(m) === tg);
  if (!ms.length) { shake(el); return; }
  if (ms.length === 1) { UI.sel = null; actFrom(ms[0], el); return; }
  if (UI.sel && UI.sel.tg === tg) { toast(ms.some(m => m.type === 'play') ? 'Pick how to pay below' : 'Pick one of the numbers below'); return; }   // the same card again: say where the answer is
  UI.sel = { tg, ms, logN: G.logN }; snd('click', { vol: .5 }); render();
}
function actFrom(m, el) {
  UI.fingerSeen = true; UI.fxSrc = el ? frameRect(el) : null;
  act(m);
}
// ---- long-press zoom (card or place details; nothing else explains itself in text)
function openZoom(spec) {
  const z = $('#zoom'); if (!z || !G) return;
  const [kind, a, b] = String(spec).split(':'); z.innerHTML = '';
  const box = h('div.zbox');
  if (kind === 'card') {
    const id = +a, c = cdef(id), w = Math.min(190, Math.round(Math.min(innerWidth, innerHeight) * .46));
    box.appendChild(cardEl(id, w));
    box.appendChild(h('div.zinfo', h('b', c.name), h('div.zcost', costEl(c.cost, 20), h('b', ' \u00B7 ' + c.pts + ' pt')), h('p', c.text), h('p.sm', TYPEN[c.type] + (c.unique ? ' \u00B7 unique' : ''))));
  } else if (kind === 'tile') {
    const k = a, i = +b, info = tileInfo(k, i);
    if (/deck|disc|tree/.test(k)) {
      const t = h('div.ztile.tile.t-' + k, tileFace({ kind: k, i }, true)); box.appendChild(t);
      box.appendChild(h('div.zinfo', k === 'deck' ? [h('b', 'Draw pile'), h('p', G.deck.length + ' cards')] : k === 'disc' ? [h('b', 'Discards'), h('p', G.discard.length + ' cards')] : [h('b', 'Seasons'), h('p', 'Prepare to move on.')]));
    } else {
      const t = h('div.ztile.tile.t-' + k, tileFace({ kind: k, i }, true)); box.appendChild(t);
      box.appendChild(h('div.zinfo', h('b', info.name || ''), h('p', (info.text || '').replace(/ Shared\.$/, '')), h('p.sm', info.slots || (info.shared ? 'Any number of workers.' : 'One worker.'))));
    }
  }
  z.appendChild(box); z.hidden = false; UI.zoomAt = Date.now();
}
function closeZoom() { const z = $('#zoom'); if (z && !z.hidden) { z.hidden = true; z.innerHTML = ''; } }
function closePop() { UI.pop = null; UI.sel = null; UI.cityOpen = null; closeZoom(); }
// ---- flying and floating
function fxLayer() { return $('#fx'); }
function fxClear() { const f = fxLayer(); if (f) f.innerHTML = ''; UI.animBusy = false; UI.animTok = (UI.animTok || 0) + 1; }
function animate(el, frames, opt) { try { if (el.animate) return el.animate(frames, opt); } catch (e) { } return null; }
function ctr(r) { return { x: r.x + r.w / 2, y: r.y + r.h / 2 }; }
// a piece flies from one rect to another, then calls done
function fxFly(node, from, to, ms, done) {
  const L = fxLayer(); if (!L || !ANIM || !from || !to) { if (done) done(); return; }
  const a = ctr(from), b = ctr(to); node.classList.add('fxfly'); L.appendChild(node);
  const f = [{ transform: `translate(${a.x}px,${a.y}px) translate(-50%,-50%) scale(.9)` }, { transform: `translate(${(a.x + b.x) / 2}px,${Math.min(a.y, b.y) - 24}px) translate(-50%,-50%) scale(1.25)`, offset: .5 }, { transform: `translate(${b.x}px,${b.y}px) translate(-50%,-50%) scale(1)` }];
  const an = animate(node, f, { duration: ms, easing: 'ease-in-out', fill: 'forwards' });
  let fin = false; const end = () => { if (fin) return; fin = true; node.remove(); if (done) done(); };
  if (an) { an.onfinish = end; an.oncancel = end; setTimeout(end, ms + 250); } else end();
}
// a number and an icon pop up where something was earned, then fly to the place that holds it
function fxFloat(from, kind, txt, to, o) {
  o = o || {}; const L = fxLayer(); if (!L || !ANIM || !from) return;
  const e = h('div.fxp' + (o.neg ? '.neg' : ''), kind ? ic(kind, 22) : null, h('b', txt)); L.appendChild(e);
  const a0 = ctr(from), a = { x: a0.x, y: a0.y + ((o.slot || 0) - ((o.n || 1) - 1) / 2) * 32 }, sx = Math.max(50, Math.min((UI.lay ? UI.lay.W : innerWidth) - 50, a.x)), b = to ? ctr(to) : { x: sx, y: a.y - 70 };   // G8: stacked pills, kept on screen
  const up = o.neg ? 22 : -26;
  const f = [{ transform: `translate(${sx}px,${a.y}px) translate(-50%,-50%) scale(.5)`, opacity: 0 },
    { transform: `translate(${sx}px,${a.y + up}px) translate(-50%,-50%) scale(1.3)`, opacity: 1, offset: .25 },
    { transform: `translate(${sx}px,${a.y + up}px) translate(-50%,-50%) scale(1.2)`, opacity: 1, offset: .5 },
    { transform: `translate(${o.neg ? sx : b.x}px,${o.neg ? a.y + up + 24 : b.y}px) translate(-50%,-50%) scale(${o.neg ? 1 : .7})`, opacity: o.neg ? 0 : .2 }];
  const an = animate(e, f, { duration: 950, delay: (o.slot || 0) * 110, easing: 'ease-in-out', fill: 'both' });
  const end = () => { e.remove(); if (to && !o.neg && o.bump) o.bump(); };
  if (an) { an.onfinish = end; an.oncancel = () => e.remove(); setTimeout(() => e.remove(), 2600); } else end();
}
// a score change, written inside the seat chip for a moment (never on top of other text or buttons)
function fxDelta(seat, d) {
  if (!d) return; const c = $('.chip[data-seat="' + seat + '"]'); if (!c) return;
  const ln = c.querySelector('.pvch-s') || c.querySelector('.cl > span:nth-child(2)'); if (!ln) return;
  const old = c.__fxOld != null ? c.__fxOld : ln.textContent; c.__fxOld = old; clearTimeout(c.__fxT);
  ln.textContent = (d > 0 ? '+' : '\u2212') + Math.abs(d) + (Math.abs(d) === 1 ? ' pt' : ' pts'); ln.classList.add('fxd'); if (d < 0) ln.classList.add('neg');
  bump('.chip[data-seat="' + seat + '"]');
  c.__fxT = setTimeout(() => { if (!ln.isConnected) return; ln.textContent = old; ln.classList.remove('fxd', 'neg'); c.__fxOld = null; }, 1600);
}
// a goods pile flashes green (gain) or red (spent); the number itself is the feedback
function fxRes(k, d) {
  const e = $('.rs[data-res="' + k + '"]'); if (!e) return;
  e.classList.remove('fxup', 'fxdn'); void e.offsetWidth; e.classList.add(d > 0 ? 'fxup' : 'fxdn');
  setTimeout(() => e.classList.remove('fxup', 'fxdn'), 1100);
}
function bump(sel) { const e = $(sel); if (!e) return; e.classList.remove('bmp'); void e.offsetWidth; e.classList.add('bmp'); setTimeout(() => e.classList.remove('bmp'), 500); }
// FLIP: a freshly drawn element slides in from where it was before
function flipFrom(el, from, ms) {
  if (!el || !from || !ANIM) return; const to = frameRect(el); if (!to) return;
  const a = ctr(from), b = ctr(to), s = Math.max(.5, Math.min(2.2, from.w / (to.w || 1)));
  el.style.zIndex = 60;
  const an = animate(el, [{ transform: `translate(${a.x - b.x}px,${a.y - b.y}px) scale(${s})` }, { transform: 'none' }], { duration: ms || 480, easing: 'cubic-bezier(.2,.8,.2,1)' });
  if (an) an.onfinish = () => { el.style.zIndex = ''; };
}
function seatRect(seat) { const e = $('.chip[data-seat="' + seat + '"]'); return e ? frameRect(e) : null; }
// what changed for a seat; shown right after a move
function fxPre(seat) {
  if (!G || seat == null || seat === 'G' || !G.players[seat]) return null;
  const p = G.players[seat]; return { seat, res: Object.assign({}, p.res), tot: score(seat).total, hand: p.hand.length, season: p.season, city: HB.cityCount(G, seat) };
}
function fxPost(pre, m, src) {
  if (!pre || !G || !ANIM) return;
  const p = G.players[pre.seat]; if (!p) return;
  const mine = pre.seat === viewSeat(), chip = seatRect(pre.seat);
  if (!src) src = chip || ctr0();
  const items = [];
  for (const k of RESK) { const d = p.res[k] - pre.res[k]; if (d !== 0) items.push({ kind: k, d }); }
  const dt = score(pre.seat).total - pre.tot; if (dt !== 0) items.push({ kind: 'point', d: dt, pts: true });
  const dh = p.hand.length - pre.hand; if (dh > 0) items.push({ kind: 'card', d: dh });
  // R17: no pill floats over the board. Points show inside the seat chip ("+2 pts" in its city-count line); goods flash on their own pile.
  for (const it of items) {
    if (it.kind === 'point') fxDelta(pre.seat, it.d);
    else if (it.kind === 'card') { if (mine) bump('.strip.hand .scount'); }
    else if (mine) fxRes(it.kind, it.d);
  }
  if (m && m.type === 'prepare' && p.season !== pre.season) fxSeason(p.season, mine);
}
function ctr0() { const R = UI.lay; return R ? { x: R.W / 2 - 10, y: R.H / 2 - 10, w: 20, h: 20 } : null; }
function fxSeason(s, mine) {
  // a brief banner at the top of the board (fades in and out in about 1 s), never a sticker over the cards
  const L = fxLayer(); if (!L || !ANIM || !mine) return;
  const e = h('div.fxseason', HBKit.season(SEAS[s], 28), h('b', SEASN[s])); L.appendChild(e);
  const an = animate(e, [{ opacity: 0, transform: 'translate(-50%,-6px)' }, { opacity: 1, transform: 'translate(-50%,0)', offset: .25 }, { opacity: 1, transform: 'translate(-50%,0)', offset: .75 }, { opacity: 0, transform: 'translate(-50%,-6px)' }], { duration: 1000, easing: 'ease-out' });
  if (an) an.onfinish = () => e.remove(); else e.remove();
  setTimeout(() => e.remove(), 1200);
}
// after a move was applied and drawn: pieces land where they went
function fxLand(m, seat, src, preChip) {
  if (PV_ON && pvLand(m, seat, src, preChip)) return;
  if (!ANIM || !m) return;
  const mine = seat === viewSeat();
  if (m.type === 'play' && mine) { const el = $('.sc[data-id="' + m.card + '"]'); if (el && src) flipFrom(el, src, 520); }
  else if (m.type === 'worker') {
    const sel = m.k === 'dest' ? null : '.tile[data-k="' + (m.k === 'event' ? (m.e === 'b' ? 'bev' : 'sev') : m.k) + '"]' + (m.k === 'haven' || m.k === 'journey' ? '' : '[data-i="' + m.i + '"]');
    const t = sel && $(sel); const pw = t && t.querySelectorAll('.pawnw'); const from = preChip || seatRect(seat);
    if (pw && pw.length && from) flipFrom(pw[pw.length - 1], from, 520);
  }
}
// ---- ghost finger: shows the first move (every move in the guided game)
function fingerWanted() {
  if ((UI.cfg && UI.cfg.tutorial) || UI.noRec || !G || G.phase === 'over' || UI.cards.length || UI.animBusy) return false;
  if (myActCount() >= 2) return false;   // PLAY1: one helper; the finger only on your first two moves (the look sheet explains, the bulb is on demand)
  if (UI.mode === 'guided') return true;
  if (typeof guideOn === 'function' && guideOn()) return true;   // R35: the finger shows by default in vs games too (hints off turns it off)
  if (UI.camp && UI.coach && UI.coach.level !== 'off' && UI.camp.hints) return true;
  return false;   // FIXED13: a normal game shows no finger unless Hints are on (the first game is the guided one)
}
// a hand chip outside the sideways-scrolling hand row: bring it into view (the row remembers where it was)
function hscrollTo(el) { hscrollTo0(el); fingerFollow(); }
// the finger stays on its target when a row scrolls under it
// R39: the finger tip sits on the target but off every card name: try a few spots, keep the one covering the least name text
function fingerSpot(r) {
  const c = ctr(r), fb = $('#board').getBoundingClientRect(), names = [...document.querySelectorAll('.pvc-name,.hcn,.tcn,.cn,.nm,.pv-name,.cost,.ci,.zcost,.rew,.rw')].map(e => e.getBoundingClientRect()).filter(b => b.width > 2 && b.height > 2);
  const spots = [[c.x, c.y], [c.x, r.y + 2], [r.x + r.w * .75, r.y + 4], [r.x + r.w * .25, r.y + 4], [c.x, r.y + 12], [c.x, r.y + r.h * .3], [c.x, r.y + r.h * .72], [r.x + r.w * .78, r.y + r.h * .78], [r.x + r.w * .22, r.y + r.h * .78], [c.x, r.y + r.h - 6], [r.x + r.w * .5, r.y + r.h + 4]];
  let best = spots[0], bo = 1e9;
  for (const [x, y] of spots) { const L = fb.left + x - 23, T = fb.top + y - 8, o = names.reduce((s, b) => s + Math.max(0, Math.min(b.right, L + 48) - Math.max(b.left, L)) * Math.max(0, Math.min(b.bottom, T + 58) - Math.max(b.top, T)), 0); if (o < bo) { bo = o; best = [x, y]; } if (!o) break; }
  return best;
}
function fingerFollow() { const f = document.getElementById('finger'), el = UI.fingerEl; if (!f || f.hidden || !el || !el.isConnected) return; const r = frameRect(el); if (!r || r.w < 4) return; const sp = fingerSpot(r); f.style.left = (sp[0] - 19) + 'px'; f.style.top = (sp[1] - 4) + 'px'; }
function hscrollTo0(el) { if (PV_ON && pvScrollTo(el)) return; const hs = el && el.closest && el.closest('.hscroll'); if (!hs) return; const a = el.offsetLeft, b = a + el.offsetWidth, c = el.offsetTop, d = c + el.offsetHeight;
  if (hs.classList.contains('vert')) { if (c < hs.scrollTop) hs.scrollTop = c - 4; else if (d > hs.scrollTop + hs.clientHeight) hs.scrollTop = d - hs.clientHeight + 4; UI.hsy = hs.scrollTop; }
  else { if (a < hs.scrollLeft + 36) hs.scrollLeft = Math.max(0, a - 40); else if (b > hs.scrollLeft + hs.clientWidth) hs.scrollLeft = b - hs.clientWidth + 4; UI.hsx = hs.scrollLeft; } }
function placeFinger() {
  let f = $('#finger'); if (!f) { f = h('div#finger', { 'aria-hidden': 'true', html: '<svg viewBox="0 0 40 48"><rect x="13" y="2" width="13" height="30" rx="6.500" fill="#fff8e6" stroke="#3b2f2a" stroke-width="2.200"/><rect x="7" y="22" width="27" height="25" rx="11" fill="#fff8e6" stroke="#3b2f2a" stroke-width="2.200"/></svg>' }); $('#board').appendChild(f); }
  f.hidden = true;
  if (!fingerWanted() || !UI.rec || !UI.rec.m || !myMoves().length) return;
  try { const s = GXH.state(); if (s.cur || s.rules) return; } catch (e) { }   // a coach bubble or the bulb is showing: it is the one helper on screen
  let tg = tgOf(UI.rec.m);
  if (UI.sel) { const i = UI.sel.ms.findIndex(x => sameM(x, UI.rec.m)); if (i >= 0) tg = 'o:' + i; else return; }
  let el = UI.tgEls && UI.tgEls[tg];
  if (!el && G.q) { const i = UI.rec.m.i; el = UI.tgEls['q:' + i]; }
  if (!el) return;
  if (tg === 'pass' && UI.mode !== 'guided') return;   // vs games: Pass never glows, so the finger does not point at it
  { const pn = PV_ON && el.closest && el.closest('#bd.pv .pv-panel'); const tb = pn && !pn.classList.contains('on') && pvTall() && UI.pvTabUser === G.logN && document.querySelector('#bd .pv-tab[data-v="' + pn.dataset.p + '"]');
    if (tb) { el = tb; tb.classList.add('glow'); } else hscrollTo(el); }   // a tab the player picked this turn stays in front: the finger then points at its target's tab
  const r = frameRect(el); if (!r || r.w < 4) return;
  const sp = fingerSpot(r); f.style.left = (sp[0] - 19) + 'px'; f.style.top = (sp[1] - 4) + 'px'; f.hidden = false; UI.fingerEl = el; clearTimeout(UI.ftm); UI.ftm = setTimeout(fingerFollow, 300); UI.ftm2 = setTimeout(fingerFollow, 900);   // R39: panels settle after the first placement; re-pick the spot off the names
  f.classList.remove('go'); void f.offsetWidth; f.classList.add('go');
}
// ---- Play view (W457): tab taps, drag a worker meeple onto a place or a hand card up into the city, a tick on every usable tap
if (PV_ON) {
  document.addEventListener('click', e => {
    if (UI.pvDragEnd && Date.now() - UI.pvDragEnd < 450) { e.stopPropagation(); e.preventDefault(); return; }
    const t = e.target.closest && e.target.closest('[data-a="pvtab"]'); if (t) { e.stopPropagation(); UI.pvTabUser = G ? G.logN : -1; pvSetTab(t.dataset.v); snd('click', { vol: .4 }); }
    // a board tap while a message card is up (or before the game starts) still answers: a small 'not now' shake
    const bt = e.target.closest && e.target.closest('#bd.pv [data-a="t"]'); if (bt && (!G || UI.cards.length || !UI.started)) shake(bt);
  }, true);
  // ---- drag: a worker meeple onto a place (or a rival's open place), a hand card up into the city
  (function () {
    let d = null;
    const under = (x, y) => { const e = document.elementFromPoint(x, y); return e && e.closest('#bd .pv-panel [data-a="t"]'); };
    const clear = () => { document.querySelectorAll('#bd .pv-over').forEach(e => e.classList.remove('pv-over')); };
    document.addEventListener('pointerdown', e => {
      if (!PV_ON || (e.button != null && e.button > 0)) return;
      const src = e.target.closest && e.target.closest('#bd.pv .pv-meeple.can, #bd.pv .hc');
      if (!src || UI.animBusy || UI.cards.length || !G || G.phase === 'over') return;
      d = { src, x0: e.clientX, y0: e.clientY, on: false, kind: src.classList.contains('hc') ? 'card' : 'worker', pid: e.pointerId };
    }, true);
    document.addEventListener('pointermove', e => {
      if (!d || e.pointerId !== d.pid) return;
      const dx = e.clientX - d.x0, dy = e.clientY - d.y0;
      if (d.swipe) { if (d.swipe.hs) d.swipe.hs.scrollLeft = d.swipe.x0 - dx; e.preventDefault(); return; }
      if (!d.on) {
        if (Math.hypot(dx, dy) < 10) return;
        if (d.kind === 'card' && Math.abs(dx) > Math.abs(dy)) { const hs = d.src.closest('.strip.hand'); d.swipe = { hs, x0: hs ? hs.scrollLeft : 0 }; if (hs) hs.style.scrollSnapType = 'none'; d.on = true; UI.lp = false; }   // sideways: swipe the hand row
        else if (d.kind === 'card' && dy > -4) { d = null; return; }
        if (d.swipe) { e.preventDefault(); return; }
        d.on = true; UI.lp = false;
        const r = d.src.getBoundingClientRect(); d.ox = d.x0 - r.left; d.oy = d.y0 - r.top;
        const g = d.src.cloneNode(true); g.className = 'pv-ghost ' + d.kind; g.removeAttribute('data-a'); g.style.cssText = `width:${r.width}px;height:${r.height}px`; document.body.appendChild(g); d.g = g;
        d.src.classList.add('pv-lifted');
        if (d.kind === 'card') { if (pvTall()) pvSetTab('city', true); $('#bd').classList.add('pv-dragcard'); }
        else { if (pvTall() && UI.pvTab === 'meadow') pvSetTab('places', true); $('#bd').classList.add('pv-dragw'); }
      }
      if (d.g) d.g.style.transform = `translate(${e.clientX - d.ox}px,${e.clientY - d.oy}px) rotate(${d.kind === 'card' ? Math.max(-12, Math.min(12, dx / 12)) : 0}deg) scale(1.08)`;
      clear();
      if (d.kind === 'worker') { const t = under(e.clientX, e.clientY); if (t) t.classList.add('pv-over'); }
      else { const hs = $('#bd .strip.hand'), top = hs ? hs.getBoundingClientRect().top : innerHeight; $('#bd').classList.toggle('pv-armed', e.clientY < top - 10); }
      e.preventDefault();
    }, { passive: false });
    const end = (e, cancel) => {
      if (!d || (e && e.pointerId !== d.pid)) return; const dd = d; d = null;
      if (!dd.on) return;
      if (dd.swipe) { UI.pvDragEnd = Date.now(); if (dd.swipe.hs) { dd.swipe.hs.style.scrollSnapType = ''; UI.hsx = dd.swipe.hs.scrollLeft; } return; }
      UI.pvDragEnd = Date.now(); clear(); const bd = $('#bd'); bd.classList.remove('pv-dragcard', 'pv-dragw', 'pv-armed');
      const x = e ? e.clientX : 0, y = e ? e.clientY : 0; let ok = false, tg = null, el = null;
      if (!cancel && dd.kind === 'worker') { el = under(x, y); tg = el && el.dataset.t; ok = !!tg && /^(w:|d:|q:)/.test(tg); }
      if (!cancel && dd.kind === 'card') { const hs = $('#bd .strip.hand'), top = hs ? hs.getBoundingClientRect().top : innerHeight; el = dd.src; tg = el.dataset.t; ok = y < top - 10 && !!tg; }
      const br = $('#board').getBoundingClientRect(), at = { x: x - br.left - 20, y: y - br.top - 20, w: 40, h: 40 };
      if (dd.g) dd.g.remove(); dd.src.classList.remove('pv-lifted');
      if (ok && !/^x:/.test(tg)) {
        PV_FEEL.tick(16);
        if (dd.kind === 'worker') UI.pvDropAt = at; else { const r = frameRect(dd.src); if (r) dd.src.style.transform = `translate(${at.x + 20 - (r.x + r.w / 2)}px,${at.y + 20 - (r.y + r.h / 2)}px)`; }
        UI.lookSkip = true; onTarget(tg, el); UI.lookSkip = false;   // a drag is already a deliberate move: no look sheet
      } else if (ok || (el && tg && /^x:/.test(tg))) { onTarget(tg, el); if (pvTall() && dd.kind === 'card') pvSetTab(UI.pvMine && availW(G.players[Math.max(0, viewSeat())]) ? 'places' : 'meadow', true); }
      else if (pvTall() && dd.kind === 'card') render();
    };
    document.addEventListener('pointerup', e => end(e, false), true);
    document.addEventListener('pointercancel', e => end(e, true), true);
  })();
  // a tap on a place or card I can use: a short tick, like a drop
  document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('#bd.pv .glow[data-a="t"]'); if (t) PV_FEEL.tick(10); });
}
// ---- PLAY1 (20 Nov 2026): look before you commit
// Owner on a phone: "unplayable and not fun", "confusing with the tap button". Cold play showed why:
//  1. a tap committed at once, and what a card does was only behind a hidden long-press;
//  2. no "what do I get" before a move;  3. finger, coach bubble and a big green (but dead) Prepare button all asked for taps;
//  4. the rival's move flashed past in one second, and its gifts to you were never said;  5. scoring gave almost no payoff.
// This part: tap = a look sheet (big art, what it does, what you get now, one Do-it button); Prepare says what it gives;
// the finger only on your first two moves; a readable rival line; a one-shot "+N" over your score.
const LOOK = { on: () => !!G && UI.started && !(UI.cfg && (UI.cfg.tutorial || UI.cfg.noLook)) && !/[?&](scn|nolook)=/.test(location.search) };
const SEASON_GIVES = ['', '+1 worker. Your green cards pay.', '+1 worker. Take up to 2 meadow cards.', '+2 workers. Your green cards pay.'];
function lookDelta(m) {
  try {
    const seat = HB.actor(G), W = HB.clone(G); const r = HB.apply(W, m); if (r && r.ok === false) return '';
    const p = G.players[seat], q = W.players[seat], parts = [];
    for (const k of HB.RES) { const d = q.res[k] - p.res[k]; if (d) parts.push((d > 0 ? '+' : '') + d + ' ' + rname(k, Math.abs(d))); }
    const dp = HB.score(W, seat).total - score(seat).total; if (dp) parts.push((dp > 0 ? '+' : '') + dp + (Math.abs(dp) === 1 ? ' point' : ' points'));
    const dc = q.hand.length - p.hand.length; if (dc > 0) parts.push('+' + dc + (dc > 1 ? ' cards' : ' card'));
    if (W.q && W.q.who === seat) parts.push('then you choose');
    return parts.join(', ');
  } catch (e) { return ''; }
}
// PLAY2: the plan lines under a card or place: its pair, when a green card pays again, a goal's progress, what shared means
function lookPlan(m) {
  const out = [];
  try {
    const seat = HB.actor(G), id = m.type === 'play' ? m.card : m.type === 'worker' && m.k === 'dest' ? null : null;
    if (id != null) { const cb = comboOf(id, seat); if (cb && cb.long) out.push(cb.long); if (cdef(id).color === 'green') out.push(greenWhen(seat, m)); }
    if (m.type === 'worker' && m.k === 'event') { const kind = m.e === 'b' ? 'bev' : 'sev', g = goalProg(kind, m.i, seat); out.push('First to own the cards claims it.' + (g ? ' You have ' + g.txt + '.' : '')); }
    if (m.type === 'worker' && (m.k === 'basic' || m.k === 'haven')) { const t = tileInfo(m.k, m.k === 'haven' ? 0 : m.i); out.push(t.shared ? SHARED_LINE : 'Only one worker fits here.'); }
  } catch (e) { }
  return out;
}
function lookCardArt(id) { const sp = spec(id), T = (HBKit.TYPES && HBKit.TYPES[sp.type]) || { c: '#a67c52' }; const a = pvArt(sp); a.classList.add('lk-card'); a.style.setProperty('--tc', T.c); a.appendChild(pvPts(sp.points || 0, 'pvc-pts')); return a; }
function lookArtTile(kind, i) { const t = h('div.lk-tile.tile.t-' + kind, tileFace({ kind, i }, true)); return t; }
function lookOpen(m, tg, el) {
  const p = G.players[HB.actor(G)];
  let title = '', what = '', art = null, go = 'Do it', sub = '';
  if (m.type === 'play') {
    const c = cdef(m.card); title = c.name; what = c.text || ''; art = lookCardArt(m.card);
    sub = (TYPEN[c.type] || '') + ' · ' + c.pts + (c.pts === 1 ? ' point' : ' points'); go = 'Build it';
  } else if (m.type === 'worker') {
    const kind = m.k === 'event' ? (m.e === 'b' ? 'bev' : 'sev') : m.k, i = m.k === 'haven' || m.k === 'journey' ? 0 : m.i;
    if (m.k === 'dest') { const c = cdef(m.c); title = c.name; what = c.text || ''; art = lookCardArt(m.c); }
    else { const t = tileInfo(kind, i); title = t.name || 'Place'; what = (t.text || '').replace(/ Shared\.$/, ''); try { art = lookArtTile(kind, i); } catch (e) { art = null; } }
    sub = m.k === 'event' ? 'Goal' : 'Send a worker'; go = m.k === 'event' ? 'Claim it' : 'Send worker';
  } else if (m.type === 'prepare') {
    const s = p.season + 1; title = 'Prepare for ' + SEASN[s]; sub = 'Your workers come home';
    what = SEASON_GIVES[s] || ''; art = h('div.lk-season', seasonIcon(s, 64)); go = 'Prepare';
  } else if (m.type === 'choose') return choiceLook(m, el);
  else return false;
  const gain = lookDelta(m), plan = lookPlan(m);
  UI.cards.unshift({ kind: 'look', m, title, sub, body: () => h('div.lk',
    art ? h('div.lk-art', art) : null,
    h('div.lk-txt', h('h3.lkh', title), sub ? h('p.lks', sub) : null, what ? h('p.lk-what', what) : null, ...plan.map(t => h('p.lk-plan', t)), gain ? h('p.lk-gain', h('span', 'What happens'), h('b', gain)) : null)),
    buttons: [{ label: go, a: 'lookgo' }, { label: 'Not now', a: 'lookno', cls: 'alt' }] });
  UI.lookEl = el || null; snd('click', { vol: .5 }); closePop(); render(); return true;
}
// a card you cannot pay for yet: the same sheet, with what is missing (instead of a toast that hides what the card does)
function lookNeed(tg) {
  const mm = /^x:([hm])(\d+)$/.exec(tg); if (!mm) return false;
  const a = HB.actor(G), p = G.players[a]; if (!p || p.ai || G.q) return false;
  const id = +mm[2], c = cdef(id), miss = [];
  for (const r of HB.RES) { const n = (c.cost && c.cost[r] || 0) - (p.res[r] || 0); if (n > 0) miss.push(n + ' more ' + rname(r, n)); }
  const why = miss.length ? 'You need ' + miss.join(' and ') + '.' : p.city.length >= HB.CITY ? 'Your city is full.' : 'You cannot build it right now.';
  UI.cards.unshift({ kind: 'look', title: c.name, sub: (TYPEN[c.type] || '') + ' · ' + c.pts + (c.pts === 1 ? ' point' : ' points'),
    body: () => h('div.lk', h('div.lk-art', lookCardArt(id)), h('div.lk-txt', h('h3.lkh', c.name), h('p.lks', (TYPEN[c.type] || '') + ' · ' + c.pts + (c.pts === 1 ? ' point' : ' points')), c.text ? h('p.lk-what', c.text) : null, ...lookPlan({ type: 'play', card: id }).map(t => h('p.lk-plan', t)), h('p.lk-need', why))),
    buttons: [{ label: 'OK', a: 'lookno' }] });
  snd('click', { vol: .4 }); closePop(); render(); return true;
}
function lookFirst(tg, el) {
  try {
    if (!LOOK.on() || UI.animBusy || UI.lookSkip || tg === 'pass') return false;
    if (/^x:[hm]\d+$/.test(tg)) return lookNeed(tg);
    if (/^x:/.test(tg)) return false;
    const ms = myMoves().filter(m => tgOf(m) === tg); return ms.length === 1 && lookOpen(ms[0], tg, el);
  } catch (e) { console.warn('look', e); return false; }
}
// how many moves the human made this game (from the log, so a new game or a loaded save counts right)
function myActCount() { if (!G) return 0; const me = G.players.filter(p => !p.ai).map(p => p.name); return G.log.filter(x => me.some(n => x.t.indexOf(n + ' places a worker') === 0 || x.t.indexOf(n + ' plays ') === 0 || x.t.indexOf(n + ' prepares') === 0)).length; }
document.addEventListener('click', e => {
  const b = e.target.closest && e.target.closest('[data-a="lookgo"],[data-a="lookno"]');
  const pc = document.getElementById('pc');
  if (!b) { if (pc && e.target === pc && pc.dataset.card === 'look') { UI.cards.shift(); render(); schedule(); } return; }   // tap outside the sheet = not now
  const c = UI.cards[0]; if (!c || c.kind !== 'look') return;
  UI.cards.shift();
  if (b.dataset.a === 'lookgo' && c.m && G && myMoves().some(m => sameM(m, c.m))) { render(); actFrom(c.m, UI.lookEl); }
  else { render(); schedule(); }
  UI.lookEl = null;
});
// ---- PLAY2 (20 Nov 2026): plan ahead ----
// Cold play after PLAY1: "for the first half I was just doing what was offered, not making plans". Still confusing: the meadow
// row scrolled under a tap and opened the wrong card; rare powers (Fox, Sexton, give/trade) had unclear prompts; Goals and
// "shared" were not explained; the rival's plan was hard to follow. This part:
//  1. a tap on a sideways row opens the card that was under the finger; a swipe never opens a card;
//  2. every choice power says what you pick and what happens, and a tap previews the outcome before you confirm;
//  3. goals say what they are and how far you are ("2 of 4 green");
//  4. cards show their pairs ("Free: your Dovecote"), green cards say when they pay again, a gentle aim at the start,
//     and a season payout card when your engine fires;
//  5. the rival's plan in one line each season, with its city one tap away.
// Rules are untouched: everything here reads G or previews a move on a clone (HB.apply on HB.clone).

// ---- 1. taps on sideways rows: the card under the finger at the press wins; a swipe is not a tap
(function () {
  let pd = null;
  const ROW = '#bd .pv-mead, #bd .strip.hand, #bd .pv-board-t, #bd .pv-visit';
  document.addEventListener('pointerdown', e => {
    UI.pressAt = Date.now();
    const t = e.target.closest && e.target.closest('#bd [data-a="t"]'), row = e.target.closest && e.target.closest(ROW);
    pd = (t || row) ? { t, tg: t && t.dataset.t, row, sl: row ? row.scrollLeft : 0, x: e.clientX, y: e.clientY, at: Date.now() } : null;
  }, true);
  document.addEventListener('click', e => {
    const p = pd; pd = null; if (!p || !e.isTrusted || Date.now() - p.at > 1500) return;
    const moved = Math.hypot(e.clientX - p.x, e.clientY - p.y) > 14 || (p.row && Math.abs(p.row.scrollLeft - p.sl) > 10);
    const t = e.target.closest && e.target.closest('#bd [data-a="t"]');
    if (moved && p.row) { e.stopImmediatePropagation(); e.preventDefault(); return; }   // the row was swiped: no card opens
    if (!p.tg || (t && t.dataset.t === p.tg)) return;   // the same card: nothing to fix
    // the board was redrawn (or the row slid) between press and release: answer the card that was pressed
    const el = p.t && p.t.isConnected ? p.t : document.querySelector('#bd [data-a="t"][data-t="' + p.tg + '"]');
    e.stopImmediatePropagation(); e.preventDefault();
    if (el) onTarget(p.tg, el);
  }, true);
})();

// ---- 2. choice powers: plain words, then a preview of what happens before you confirm
const P2_RARE = new Set(['recipient', 'give', 'teach', 'trade', 'spend', 'pigeon', 'cemetery', 'mole', 'chip', 'ranger', 'ruins', 'university', 'banish', 'prisoner', 'copy', 'clock', 'queen', 'inn', 'judge', 'waive', 'scroll', 'bazaar', 'stock', 'cityDisc', 'recall', 'tuck', 'clear']);
// what you pick, in plain words (the prompt line); the card's own text says the rest
const P2_SAY = {
  recipient: 'Pick the rival who gets it.', give: 'Pick what you give away.', teach: 'Keep one card. Your rival gets the other.',
  trade: 'Give up to 2 goods, take any 2 back.', spend: 'Spend goods for point tokens, or stop.', pigeon: 'Build one shown card free, or skip.',
  cemetery: 'Look at 4 cards from the deck or the discards.', mole: 'Pick a rival green card to copy.', chip: 'Pick one of your green cards to run again.',
  ranger: 'Pick a worker, then where it moves.', ruins: 'Knock down a building; get its cost back.', university: 'Remove a card; get its cost back.',
  banish: 'Pick a card to remove.', prisoner: 'Pick a critter to lock in the cells.', copy: 'Pick a place to copy its reward.',
  clock: 'Repeat one place you used, or skip.', queen: 'Build a card worth up to 3, free.', inn: 'Build a meadow card 3 cheaper.',
  judge: 'Swap one good in the price.', waive: 'Pick goods to leave off the price.', scroll: 'Keep the card, or tuck it for 1 point.',
  bazaar: 'Build one card you took, 1 cheaper?', stock: 'Pick goods to store on the cellar.', cityDisc: 'Pick a city card to discard.',
  recall: 'Pick a worker to bring home.', tuck: 'Tuck a critter under the goal for points.', clear: 'Throw away a meadow card. Then take one.'
};
function p2Src() {   // the card whose power is asking: the newest card name in the last few log lines
  try {
    if (!P2.names) P2.names = D.cards.map(c => c.name).sort((a, b) => b.length - a.length);
    const L = G.log.slice(-6).reverse();
    for (const x of L) for (const n of P2.names) if (x.t.indexOf(n) >= 0) return D.cards.find(c => c.name === n);
  } catch (e) { }
  return null;
}
const P2 = { names: null, on: () => typeof LOOK !== 'undefined' && LOOK.on() };
// every player's change after move m (on a clone), in plain words
function p2Delta(m) {
  try {
    const seat = HB.actor(G), W = HB.clone(G); const r = HB.apply(W, m); if (r && r.ok === false) return null;
    const out = [];
    G.players.forEach((p, s) => {
      const q = W.players[s], parts = [];
      for (const k of HB.RES) { const d = q.res[k] - p.res[k]; if (d) parts.push((d > 0 ? '+' : '') + d + ' ' + rname(k, Math.abs(d))); }
      const dt = q.pts - p.pts; if (dt) parts.push((dt > 0 ? '+' : '') + dt + (Math.abs(dt) === 1 ? ' point token' : ' point tokens'));
      const dh = q.hand.length - p.hand.length; if (dh) parts.push((dh > 0 ? '+' : '') + dh + (Math.abs(dh) === 1 ? ' card in hand' : ' cards in hand'));
      const add = q.city.filter(e => !p.city.some(x => x.id === e.id)).map(e => cname(e.id)), gone = p.city.filter(e => !q.city.some(x => x.id === e.id)).map(e => cname(e.id));
      if (add.length) parts.push('builds ' + add.join(', ')); if (gone.length) parts.push('loses ' + gone.join(', '));
      const dp = HB.score(W, s).total - score(s).total; if (dp) parts.push((dp > 0 ? '+' : '') + dp + (Math.abs(dp) === 1 ? ' point' : ' points') + ' in all');
      if (parts.length) out.push((s === seat ? 'You' : p.name) + ': ' + parts.join(', '));
    });
    const left = G.meadow.filter(id => id >= 0 && W.meadow.indexOf(id) < 0 && !W.players.some(q => q.hand.indexOf(id) >= 0 || q.city.some(e => e.id === id)));
    if (left.length) out.push(left.map(cname).join(', ') + ' leaves the meadow');
    if (W.q && W.q.who === seat) out.push('Then you pick the next step');
    if (!out.length) out.push('Nothing changes. You skip it.');
    return out;
  } catch (e) { return null; }
}
function choiceLook(m, el) {
  if (!P2.on() || UI.lookSkip || !G || !G.q || !m || m.type !== 'choose' || !P2_RARE.has(G.q.kind)) return false;
  const q = G.q, src = p2Src(), say = P2_SAY[q.kind] || wordsCap(q.title, 12), d = p2Delta(m); if (!d) return false;
  const pick = m.card !== undefined && !/\b(give|play|clear|discard|lock|remove|raze|disband|tuck|keep)\b/i.test(m.label || '') ? cname(m.card) : chipText(m.label) || (m.card !== undefined ? cname(m.card) : 'This');
  let sid = -1; if (src) for (let i = 0; i < 200; i++) { let c = null; try { c = HB.cardOf(i); } catch (e) { break; } if (!c) break; if (c.key === src.key) { sid = i; break; } }
  let art = null; try { art = m.card !== undefined ? lookCardArt(m.card) : sid >= 0 ? lookCardArt(sid) : null; } catch (e) { art = null; }
  UI.cards.unshift({ kind: 'look', m, title: src ? src.name : 'Your choice', sub: say, body: () => h('div.lk.p2c',
    art ? h('div.lk-art', art) : null,
    h('div.lk-txt', h('h3.lkh', src ? src.name : 'Your choice'), h('p.lks', say), src && src.text ? h('p.lk-what', src.text) : null,
      h('p.p2-pick', h('span', 'You picked'), h('b', pick)),
      h('div.lk-gain', h('span', 'What happens'), ...d.map(t => h('b', t))))),
    buttons: [{ label: 'Confirm', a: 'lookgo' }, { label: 'Pick again', a: 'lookno', cls: 'alt' }] });
  UI.lookEl = el || null; snd('click', { vol: .5 }); closePop(); render(); return true;
}

// ---- 3. goals: how far you are
function goalProg(kind, i, seat) {
  const p = G.players[seat]; if (!p) return null;
  if (kind === 'bev') {
    const dd = D.basicEvents[G.bev[i].k], t = Object.keys(dd.need || {})[0]; if (!t) return null;
    const col = PV_TCOL[t] || t, n = dd.need[t], have = Math.min(n, p.city.filter(e => cdef(e.id).color === col).length);
    return { have, n, txt: have + ' of ' + n + ' ' + col };
  }
  if (kind === 'sev') {
    const req = D.specialEvents[G.sev[i].k].req || []; if (!req.length) return null;
    const have = req.filter(k => p.city.some(e => cdef(e.id).key === k)).length;
    return { have, n: req.length, txt: have + ' of ' + req.length + ' cards' };
  }
  return null;
}
const GOAL_LINE = 'Goals: first to own the cards sends a worker and scores.';
const SHARED_LINE = 'Shared: any number of workers fit here.';

// ---- 4. plans: pairs, green pay-outs, an aim, a season payout
const p2Short = n => n.length <= 13 ? n : n.split(' ').sort((a, b) => b.length - a.length)[0];
function comboOf(id, seat) {
  const c = cdef(id), p = G.players[seat]; if (!p || !c) return null;
  if (c.kind === 'critter' && c.linked) {
    const lk = D.cards.find(x => x.key === c.linked), ln = lk ? lk.name : '';
    if (!ln) return null;
    const dup = c.unique && p.city.some(e => cdef(e.id).key === c.key);
    const e = p.city.find(x => cdef(x.id).key === c.linked);
    if (e && !e.occ && !dup) return { free: true, short: 'Free: your ' + p2Short(ln), long: 'Pairs with your ' + ln + ': it moves in free.' };
    if (e) return { short: '', long: 'Pairs with ' + ln + ' (yours already has a guest).' };
    if (p.hand.some(x => cdef(x).key === c.linked)) return { short: 'Pairs: ' + p2Short(ln), long: 'Build your ' + ln + ' first; then this moves in free.' };
    return { short: '', long: 'Free once you own ' + ln + '.' };
  }
  if (c.kind === 'construction') {
    const cr = D.cards.filter(x => x.kind === 'critter' && x.linked === c.key); if (!cr.length) return null;
    const mine = cr.find(x => p.hand.some(j => cdef(j).key === x.key));
    if (mine) return { short: 'Then ' + p2Short(mine.name) + ' free', long: 'Then your ' + mine.name + ' moves in free.' };
    return { short: '', long: 'Lets ' + cr.map(x => x.name).join(' or ') + ' move in free.' };
  }
  return null;
}
function greenWhen(seat, m) {
  const s = G.players[seat] ? G.players[seat].season : 0, left = [1, 3].filter(x => x > s).map(x => SEASN[x]);
  let what = '';   // what it pays: the goods you end up with plus what you paid (only for a plain or free build, so the number is true)
  try { if (m && m.type === 'play' && (m.how === 'pay' || m.how === 'occupy')) { const W = HB.clone(G), r = HB.apply(W, m); if (!(r && r.ok === false) && !(W.q && W.q.who === seat)) { const p = G.players[seat], q = W.players[seat], c = cdef(m.card), parts = [];
    for (const k of HB.RES) { const d = q.res[k] - p.res[k] + (m.how === 'pay' && c.cost ? (c.cost[k] || 0) : 0); if (d > 0) parts.push(d + ' ' + rname(k, d)); }
    const dh = q.hand.length - p.hand.length + 1 * (p.hand.indexOf(m.card) >= 0 ? 1 : 0); if (dh > 0) parts.push(dh + (dh === 1 ? ' card' : ' cards'));
    const dt = q.pts - p.pts; if (dt > 0) parts.push(dt + (dt === 1 ? ' point token' : ' point tokens'));
    what = parts.join(', '); } } } catch (e) { what = ''; }
  const now = what ? 'Green: pays ' + what + ' now' : 'Green: pays now';
  return left.length ? now + ', then again when you prepare for ' + left.join(' and ') + '.' : now + ', once.';
}
function aimLine(seat) {
  try {
    const p = G.players[seat]; if (!p) return '';
    const pool = p.hand.concat(G.meadow.filter(x => x >= 0));
    for (const id of pool) { const c = cdef(id); if (c.kind !== 'construction') continue; const cr = pool.find(j => cdef(j).kind === 'critter' && cdef(j).linked === c.key); if (cr != null) return 'Build ' + c.name + ', then ' + cname(cr) + ' moves in free.'; }
    const g = pool.filter(id => cdef(id).color === 'green');
    if (g.length) return 'Build green cards early, like ' + cname(g[0]) + '. They pay again each Spring and Autumn.';
  } catch (e) { }
  return 'Build green cards early. They pay again each Spring and Autumn.';
}
// the rival's plan in one line
function rivToward(s) {
  const p = G.players[s]; if (!p) return '';
  const cnt = c => p.city.filter(e => cdef(e.id).color === c).length;
  let best = null;
  G.bev.forEach((e, i) => { if (e.o !== -1 && e.o != null) return; const g = goalProg('bev', i, s); if (g && g.have >= 2 && g.have >= g.n - 2) { const r = g.have / g.n; if (!best || r > best.r) best = { r, full: g.have >= g.n, nm: D.basicEvents[e.k].name, t: D.basicEvents[e.k].name + ' (' + g.txt + ')' }; } });
  G.sev.forEach((e, i) => { if (e.o !== -1 && e.o != null) return; const g = goalProg('sev', i, s); if (g && g.have >= 1) { const r = g.have / g.n; if (!best || r > best.r) best = { r, full: g.have >= g.n, nm: D.specialEvents[e.k].name, t: D.specialEvents[e.k].name + ' (' + g.txt + ')' }; } });
  const bits = [], gr = cnt('green'), pu = cnt('purple'), red = cnt('red');
  if (gr >= 3) bits.push('a green engine (' + gr + ' green)');
  else if (pu >= 1) bits.push('end-game bonus points (' + pu + ' purple)');
  else if (red >= 2) bits.push('its own places to visit (' + red + ' red)');
  if (best && !best.full) bits.push('the ' + best.t + ' goal');
  if (!bits.length) bits.push(p.city.length ? 'a bigger city (' + HB.cityCount(G, s) + ' of 15)' : 'its first cards');
  return p.name + ' is building toward ' + bits.slice(0, 2).join(' and ') + '.' + (best && best.full ? ' It can claim ' + best.nm + ' now.' : '');
}
// a season payout card: what your engine gave, and the rival's plan
const PAY = { pend: null };
// act (ui13) takes a snapshot before your Prepare and hands it over after; render (ui13) then shows the card once your choices are done
function paySnapOf(m) {
  try { if (m && m.type === 'prepare' && G && P2.on()) { const a = HB.actor(G), p = G.players[a]; if (!p.ai && a === viewSeat()) return { seat: a, season: p.season + 1, res: Object.assign({}, p.res), hand: p.hand.length, tok: p.pts, w: p.workers }; } } catch (e) { }
  return null;
}
function payAfter(snap) { if (snap && G && G.players[snap.seat] && G.players[snap.seat].season === snap.season) PAY.pend = snap; }
function payRender() { try { if (PAY.pend) { payoutCheck(); if (UI.cards.length && UI.cards[0].kind === 'payout') renderCard(); } } catch (e) { console.warn('pay', e); } }
function payoutCheck() {
  const s = PAY.pend; if (!s || !G) return;
  if (G.phase === 'over') { PAY.pend = null; return; }
  if (G.q && G.q.who === s.seat) return;   // still choosing (Summer's meadow cards, the order of green cards)
  PAY.pend = null;
  const p = G.players[s.seat], parts = [];
  for (const k of RESK) { const d = p.res[k] - s.res[k]; if (d) parts.push((d > 0 ? '+' : '') + d + ' ' + rname(k, Math.abs(d))); }
  const dc = p.hand.length - s.hand; if (dc) parts.push((dc > 0 ? '+' : '') + dc + (Math.abs(dc) === 1 ? ' card' : ' cards'));
  const dt = p.pts - s.tok; if (dt > 0) parts.push('+' + dt + (dt === 1 ? ' point token' : ' point tokens'));
  const greens = p.city.filter(e => cdef(e.id).color === 'green').map(e => cname(e.id));
  const sum = s.season === 2 ? (dc > 0 ? 'You took ' + dc + (dc === 1 ? ' meadow card.' : ' meadow cards.') : 'You took no meadow cards.')
    : greens.length ? 'Your ' + greens.length + ' green ' + (greens.length === 1 ? 'card' : 'cards') + ' paid out.' : 'No green cards yet. Green cards pay here.';
  const gw = p.workers - s.w, rivals = G.players.map((q, i) => i).filter(i => i !== s.seat);
  const r0 = rivals[0];
  const btns = [{ label: 'Continue', a: 'cont' }]; if (r0 != null) btns.push({ label: 'See ' + G.players[r0].name + '’s city', a: 'rivcity', cls: 'alt', at: { 'data-seat': r0 } });
  UI.cards.push({ kind: 'payout', title: SEASN[s.season] + ' is here', sub: sum, body: () => h('div.p2pay',
    h('div.p2pay-s', seasonIcon(s.season, 52), h('div', h('b.p2pay-h', SEASN[s.season] + ' is here'), h('span', '+' + gw + (gw === 1 ? ' worker' : ' workers') + ' · ' + p.workers + ' in all'))),
    h('p.p2pay-sum', sum),
    parts.length ? h('p.p2pay-big', parts.join(', ')) : null,
    greens.length && s.season !== 2 ? h('p.p2pay-from', 'From ' + greens.join(', ')) : null,
    s.season === 1 && greens.length ? h('p.p2pay-next', 'They pay again when you prepare for Autumn.') : null,
    ...rivals.map(i => h('p.p2pay-riv', pawn(i, 22), h('span', rivToward(i) + ' ' + score(i).total + ' points.'))),
    h('p.p2pay-you', 'You: ' + score(s.seat).total + (score(s.seat).total === 1 ? ' point.' : ' points.'))),
    buttons: btns });
  try { snd('coin', { vol: .5 }); } catch (e) { }
}
document.addEventListener('click', e => {
  const b = e.target.closest && e.target.closest('[data-a="rivcity"]'); if (!b) return;
  e.stopImmediatePropagation();
  const s = +b.dataset.seat; if (UI.cards[0] && UI.cards[0].kind === 'payout') UI.cards.shift();
  render(); schedule(); UI.rseat = s; GX.show('rivald'); renderRival(s);
}, true);
