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
  const a = ctr(from), jx = (o.slot || 0) * 22 - (o.n || 1) * 11 + 11, sx = a.x + jx, b = to ? ctr(to) : { x: sx, y: a.y - 70 };
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
      const to = mine ? (it.kind === 'card' ? (UI.lay && UI.lay.hand) : frameRect($('.rs[data-res="' + it.kind + '"]'))) : chip;
      fxFloat(src, it.kind, '+' + it.d, to, { slot: slot++, n, bump: mine ? () => bump('.rs[data-res="' + it.kind + '"]') : null });
    } else if (mine && it.kind !== 'point') {
      const at = frameRect($('.rs[data-res="' + it.kind + '"]')); fxFloat(at, it.kind, '\u2212' + (-it.d), null, { neg: true });
    }
  }
  if (m && m.type === 'prepare' && p.season !== pre.season) fxSeason(p.season, mine);
}
function ctr0() { const R = UI.lay; return R ? { x: R.W / 2 - 10, y: R.H / 2 - 10, w: 20, h: 20 } : null; }
function fxSeason(s, mine) {
  const L = fxLayer(); if (!L || !ANIM || !mine) return;
  const e = h('div.fxseason', HBKit.season(SEAS[s], 110), h('b', SEASN[s])); L.appendChild(e);
  const an = animate(e, [{ transform: 'translate(-50%,-50%) scale(.4)', opacity: 0 }, { transform: 'translate(-50%,-50%) scale(1.1)', opacity: 1, offset: .3 }, { transform: 'translate(-50%,-50%) scale(1)', opacity: 1, offset: .75 }, { transform: 'translate(-50%,-50%) scale(1.3)', opacity: 0 }], { duration: 1100, fill: 'both' });
  if (an) an.onfinish = () => e.remove(); else e.remove();
  setTimeout(() => e.remove(), 1500);
}
// after a move was applied and drawn: pieces land where they went
function fxLand(m, seat, src, preChip) {
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
  if (UI.noRec || !G || G.phase === 'over' || UI.cards.length || UI.animBusy) return false;
  if (UI.mode === 'guided') return true;
  if (UI.camp && UI.coach && UI.coach.level !== 'off' && UI.camp.hints) return true;
  return !UI.fingerSeen && UI.mode !== 'net' && UI.mode !== 'ai';
}
function placeFinger() {
  let f = $('#finger'); if (!f) { f = h('div#finger', { 'aria-hidden': 'true', html: '<svg viewBox="0 0 40 48"><rect x="13" y="2" width="13" height="30" rx="6.500" fill="#fff8e6" stroke="#3b2f2a" stroke-width="2.200"/><rect x="7" y="22" width="27" height="25" rx="11" fill="#fff8e6" stroke="#3b2f2a" stroke-width="2.200"/></svg>' }); $('#board').appendChild(f); }
  f.hidden = true;
  if (!fingerWanted() || !UI.rec || !UI.rec.m || !myMoves().length) return;
  let tg = tgOf(UI.rec.m);
  if (UI.sel) { const i = UI.sel.ms.findIndex(x => sameM(x, UI.rec.m)); if (i >= 0) tg = 'o:' + i; else return; }
  let el = UI.tgEls && UI.tgEls[tg];
  if (!el && G.q) { const i = UI.rec.m.i; el = UI.tgEls['q:' + i]; }
  if (!el) return;
  const r = frameRect(el); if (!r || r.w < 4) return;
  const c = ctr(r); f.style.left = (c.x - 19) + 'px'; f.style.top = (c.y - 4) + 'px'; f.hidden = false;
  f.classList.remove('go'); void f.offsetWidth; f.classList.add('go');
}
