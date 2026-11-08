// ===================== part 3: doing things on the board (tap, long-press zoom, flying pieces, floating gains, ghost finger) =====================
// ---- shake: "not here"
function shake(el) { if (!el) return; el.classList.remove('shk'); void el.offsetWidth; el.classList.add('shk'); setTimeout(() => el.classList.remove('shk'), 420); snd('error', { vol: .3 }); }
// ---- tap on a board target
function onTarget(tg, el) {
  if (!G || UI.cards.length) return;
  if (/^x:/.test(tg) || UI.animBusy) { UI.sel = null; shake(el); return; }
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
      box.appendChild(h('div.zinfo', h('b', info.name || ''), h('p', (info.text || '').replace(/ Shared\.$/, '')), h('p.sm', info.shared ? 'Any number of workers.' : 'One worker.')));
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
  let slot = 0; const n = items.filter(x => x.d > 0).length;
  for (const it of items) {
    if (it.d > 0) {
      const to = it.kind === 'point' ? chip : mine ? (it.kind === 'card' ? (UI.lay && UI.lay.hand) : frameRect($('.rs[data-res="' + it.kind + '"]'))) : chip;
      fxFloat(src, it.kind, '+' + it.d + (it.kind === 'point' ? (it.d === 1 ? ' point' : ' points') : ''), to, { slot: slot++, n, bump: it.kind === 'point' ? () => bump('.chip[data-seat="' + pre.seat + '"]') : mine ? () => bump('.rs[data-res="' + it.kind + '"]') : null });
    } else if (mine && it.kind !== 'point') {
      const at = frameRect($('.rs[data-res="' + it.kind + '"]')); fxFloat(at, it.kind, '\u2212' + (-it.d), null, { neg: true });
    }
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
  if (UI.mode === 'guided') return true;
  if (UI.camp && UI.coach && UI.coach.level !== 'off' && UI.camp.hints) return true;
  return !UI.fingerSeen && UI.mode !== 'net' && UI.mode !== 'ai';
}
// a hand chip outside the sideways-scrolling hand row: bring it into view (the row remembers where it was)
function hscrollTo(el) { if (PV_ON && pvScrollTo(el)) return; const hs = el && el.closest && el.closest('.hscroll'); if (!hs) return; const a = el.offsetLeft, b = a + el.offsetWidth, c = el.offsetTop, d = c + el.offsetHeight;
  if (hs.classList.contains('vert')) { if (c < hs.scrollTop) hs.scrollTop = c - 4; else if (d > hs.scrollTop + hs.clientHeight) hs.scrollTop = d - hs.clientHeight + 4; UI.hsy = hs.scrollTop; }
  else { if (a < hs.scrollLeft + 36) hs.scrollLeft = Math.max(0, a - 40); else if (b > hs.scrollLeft + hs.clientWidth) hs.scrollLeft = b - hs.clientWidth + 4; UI.hsx = hs.scrollLeft; } }
function placeFinger() {
  let f = $('#finger'); if (!f) { f = h('div#finger', { 'aria-hidden': 'true', html: '<svg viewBox="0 0 40 48"><rect x="13" y="2" width="13" height="30" rx="6.500" fill="#fff8e6" stroke="#3b2f2a" stroke-width="2.200"/><rect x="7" y="22" width="27" height="25" rx="11" fill="#fff8e6" stroke="#3b2f2a" stroke-width="2.200"/></svg>' }); $('#board').appendChild(f); }
  f.hidden = true;
  if (!fingerWanted() || !UI.rec || !UI.rec.m || !myMoves().length) return;
  let tg = tgOf(UI.rec.m);
  if (UI.sel) { const i = UI.sel.ms.findIndex(x => sameM(x, UI.rec.m)); if (i >= 0) tg = 'o:' + i; else return; }
  let el = UI.tgEls && UI.tgEls[tg];
  if (!el && G.q) { const i = UI.rec.m.i; el = UI.tgEls['q:' + i]; }
  if (!el) return;
  hscrollTo(el);
  const r = frameRect(el); if (!r || r.w < 4) return;
  const c = ctr(r); f.style.left = (c.x - 19) + 'px'; f.style.top = (c.y - 4) + 'px'; f.hidden = false;
  f.classList.remove('go'); void f.offsetWidth; f.classList.add('go');
}
// ---- Play view (W457): tab taps, drag a worker meeple onto a place or a hand card up into the city, a tick on every usable tap
if (PV_ON) {
  document.addEventListener('click', e => {
    if (UI.pvDragEnd && Date.now() - UI.pvDragEnd < 450) { e.stopPropagation(); e.preventDefault(); return; }
    const t = e.target.closest && e.target.closest('[data-a="pvtab"]'); if (t) { e.stopPropagation(); pvSetTab(t.dataset.v); snd('click', { vol: .4 }); }
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
        onTarget(tg, el);
      } else if (ok || (el && tg && /^x:/.test(tg))) { onTarget(tg, el); if (pvTall() && dd.kind === 'card') pvSetTab(UI.pvMine && availW(G.players[Math.max(0, viewSeat())]) ? 'places' : 'meadow', true); }
      else if (pvTall() && dd.kind === 'card') render();
    };
    document.addEventListener('pointerup', e => end(e, false), true);
    document.addEventListener('pointercancel', e => end(e, true), true);
  })();
  // a tap on a place or card I can use: a short tick, like a drop
  document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('#bd.pv .glow[data-a="t"]'); if (t) PV_FEEL.tick(10); });
}
