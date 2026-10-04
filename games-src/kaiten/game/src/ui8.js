// ===================== part 8: board-first play: grab a dish, the reveal stage, hands moving along the belt, ghost finger, tips on the board =====================
// Nothing here changes the rules: a tap or a drag on a dish ends in tapHand(), exactly like before; the rest only draws.
const ppMode = () => document.documentElement.classList.contains('ph-p');
const bulbSVG = '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M12 2.5a6.5 6.5 0 0 0-3.8 11.8c.8.6 1.3 1.5 1.3 2.5v.7h5v-.7c0-1 .5-1.9 1.3-2.5A6.5 6.5 0 0 0 12 2.5z" fill="#ffd23a" stroke="#4a2a22" stroke-width="1.6"/><path d="M9.5 19.5h5M10.3 21.5h3.4" stroke="#4a2a22" stroke-width="1.6" stroke-linecap="round"/></svg>';
const fingerSVG = '<svg viewBox="0 0 48 62" width="100%" height="100%"><path d="M17 3c3 0 5 2.2 5 5v17.5l2.2-.9c2.3-.8 4.8.2 5.8 2.3 2.3-1 5 0 6 2.2 2.4-.8 5 .8 5.5 3.3l.5 2.6v10c0 9-6.5 15-15 15h-3c-5.2 0-9.3-2.3-12-6.3L4 41.5c-1.5-2.3-1-5.2 1.2-6.6 2.1-1.3 4.8-.8 6.3 1.1l.5.6V8c0-2.8 2.2-5 5-5z" fill="#fff" stroke="#3a231d" stroke-width="3" stroke-linejoin="round"/><path d="M22 27v8M30 29v7M37 32v6" stroke="#3a231d" stroke-width="2.4" stroke-linecap="round"/></svg>';
// ---- the small buttons on the belt's label row (portrait phones: the dock is gone)
function renderLabActs() {
  const la = $('#labacts'); if (!la) return;
  const v = viewSeat(), can = ppMode() && G && v >= 0 && canPick();
  const n = UI.sel.length, sig = [can ? 1 : 0, n, UI.twin ? 1 : 0, UI.prefs.grab1 === false ? 1 : 0].join();
  if (la.dataset.sg === sig) return; la.dataset.sg = sig; la.replaceChildren();
  if (!can) return;
  if (n && (UI.prefs.grab1 === false || n === 2)) la.appendChild(h('button.lbtn.go', { 'data-a': 'serve', type: 'button' }, n === 2 ? 'Serve both' : 'Serve'));
  else if (!n) la.appendChild(h('button.lbtn.bulb', { 'data-a': 'hint', type: 'button', 'aria-label': 'Hint: show a good dish', title: 'Hint', html: bulbSVG }));
}
// ---- after every render: place the ghost finger and the tip bubble on the board
let fxQ = 0;
function boardFX() { if (fxQ) return; fxQ = requestAnimationFrame(() => { fxQ = 0; try { placeGhost(); placeTip(); } catch (e) { console.error(e); } }); }
function curTurn() { return G ? G.round + '.' + G.turn : ''; }
function ghostTarget() {
  if (!G || !UI.started || UI.cards.length || UI.drag || UI.busy || G.phase !== 'pick' || UI.rsOpen) return null;
  const v = viewSeat(); if (v < 0 || !canPick()) return null;
  const t = curTurn();
  // the first time the Twin Sticks can be used: point at them, then at the dishes
  if (UI.tip && UI.tip.key === 'twinReady' && UI.tip.turn === t && !UI.twin) return $('#tbl .grp.usable');
  // a hint, or the very first grab of a newcomer: point at a good dish
  const first = !lsGet('kk_grab') && !UI.coach.seen.grabbed && UI.coach.level !== 'off';
  if (first && !(UI.rec && UI.rec.turn === t)) {
    // the first grab: the dish with the biggest green +N (the idea to copy)
    try { const hand = G.players[v].hand; let bi = 0, bg = -1; hand.forEach((id, i) => { const g = gainOf(v, [id]); if (g > bg) { bg = g; bi = i; } }); UI.rec = { ids: [hand[bi]], pick: [bi], turn: t, auto: 1 }; renderBelt(); } catch (e) { }
  }
  if (!(UI.rec && UI.rec.turn === t)) return null;
  if (UI.rec.pick.length === 2 && !UI.twin) return $('#tbl .grp.usable');
  const hand = G.players[v].hand, idx = UI.rec.pick.find(i => UI.sel.indexOf(i) < 0);
  return idx == null ? null : document.querySelector('#belt .hc[data-i="' + idx + '"]');
}
function placeGhost() {
  let g = $('#ghost'); const tg = ANIM ? ghostTarget() : null;
  if (!tg) { if (g) g.hidden = true; return; }
  if (!g) { g = h('div#ghost', { 'aria-hidden': 'true' }, h('div.gring'), h('div.gfin', { html: fingerSVG })); document.body.appendChild(g); }
  const r = tg.getBoundingClientRect(); if (!r.width) { g.hidden = true; return; }
  g.hidden = false; g.style.left = Math.round(r.left + r.width / 2) + 'px'; g.style.top = Math.round(r.top + r.height * .42) + 'px';
}
function tipTarget(tp) {
  if (tp.key === 'twinReady') return $('#tbl .grp.usable');
  if (!tp.type) return null;
  const same = k => k === tp.type || (ICONS[k] && ICONS[tp.type]);
  return [...document.querySelectorAll('#belt .hc[data-id]')].find(b => same(tkey(+b.dataset.id))) || null;
}
function placeTip() {
  let b = $('#tipb'); const tp = UI.tip;
  const show = tp && G && UI.started && tp.turn === curTurn() && !(tp.t0 && Date.now() - tp.t0 > 6000) && canPick() && !UI.drag && !UI.cards.length && !UI.rsOpen && UI.coach.level !== 'off';
  if (!show) { if (b) b.hidden = true; return; }
  if (!b) { b = h('div#tipb', { role: 'status', 'data-a': 'tipx' }); document.body.appendChild(b); }
  const key = tp.key + tp.turn; if (b.dataset.k !== key) { b.dataset.k = key; b.replaceChildren(h('b', tp.title), ' ', tp.text); }
  const tg = tipTarget(tp), bd = $('#bd').getBoundingClientRect(); b.hidden = false; b.classList.toggle('free', !tg);
  const bw = b.offsetWidth, bh = b.offsetHeight, W = innerWidth;
  if (tg) {
    const r = tg.getBoundingClientRect(), bz = tg.closest('#belt') ? $('#beltz').getBoundingClientRect().top + 6 : r.top; const cx = r.left + r.width / 2; let x = Math.max(8, Math.min(W - bw - 8, cx - bw / 2)), y = Math.min(r.top, bz) - bh - 12;   // above the belt, never over its dishes
    const below = y < bd.top + 4; if (below) y = r.bottom + 12;
    b.style.left = Math.round(x) + 'px'; b.style.top = Math.round(y) + 'px'; b.style.setProperty('--ax', Math.round(Math.max(14, Math.min(bw - 14, cx - x))) + 'px'); b.classList.toggle('below', below);
  } else { b.style.left = Math.round(Math.max(8, bd.left + (bd.width - bw) / 2)) + 'px'; b.style.top = Math.round(bd.top + 6) + 'px'; b.classList.remove('below'); }
}
// ---- press and hold a dish: read it (two short lines); drag it up onto the table: grab it
const SHORT = { tempura: 'Pairs: two = 5', sashimi: 'Sets of three = 10', dumpling: 'More buns, more points', roll1: 'Roll race: 1 icon', roll2: 'Roll race: 2 icons', roll3: 'Roll race: 3 icons', salmon: 'Nigiri: 2 (×3 on paste)', squid: 'Nigiri: 3 (×3 on paste)', egg: 'Nigiri: 1 (×3 on paste)', wasabi: 'Next nigiri ×3', chop: 'Later: grab two dishes', pudding: 'End: most +6, fewest −6' };
function peekShow(b) {
  const id = +b.dataset.id; if (isNaN(id)) return; const k = tkey(id);
  let p = $('#peek'); if (!p) { p = h('div#peek', { 'aria-hidden': 'true' }); document.body.appendChild(p); }
  p.replaceChildren(h('b', TY[k].name), h('span', SHORT[k] || TY[k].ruleText)); p.hidden = false;
  const r = b.getBoundingClientRect(), pw = p.offsetWidth, ph = p.offsetHeight;
  p.style.left = Math.round(Math.max(8, Math.min(innerWidth - pw - 8, r.left + r.width / 2 - pw / 2))) + 'px'; p.style.top = Math.round(Math.max(8, r.top - ph - 26)) + 'px';
  b.classList.add('peeked'); snd('click', { vol: .3 });
}
function peekHide() { const p = $('#peek'); if (p) p.hidden = true; for (const e of $$('#belt .hc.peeked')) e.classList.remove('peeked'); }
function pxCardOf(b) { return PX.on && b && b.dataset.id != null ? PX.objs.get('h:' + b.dataset.id) : null; }
function dragStart(s, e) {
  const b = s.b, r = b.getBoundingClientRect(), id = +b.dataset.id;
  const c = h('div#dragc'); c.style.cssText = 'left:' + r.left + 'px;top:' + r.top + 'px;width:' + r.width + 'px;height:' + r.height + 'px';
  c.appendChild(cardNode(tkey(id), Math.round(r.width))); document.body.appendChild(c);
  s.drag = { c, r }; UI.drag = true; b.classList.add('dragging');
  const o = pxCardOf(b); if (o) { o.a = .25; PX.dirty = true; }
  for (const x of $$('.seat.me .slot .sbox, .seat[data-seat="' + viewSeat() + '"] .slot .sbox')) x.classList.add('drop');
  placeGhost(); placeTip();
}
function dragMove(s, e) { const d = s.drag; d.c.style.transform = 'translate(' + (e.clientX - s.x) + 'px,' + (e.clientY - s.y) + 'px) rotate(' + Math.max(-12, Math.min(12, (e.clientX - s.x) / 8)) + 'deg) scale(1.08)'; }
function dragOver(s, e) { const w = $('#beltw'); return !!w && e.clientY < w.getBoundingClientRect().top - 4; }
function dragEnd(s, ok) {
  const d = s.drag; UI.drag = false; s.b.classList.remove('dragging');
  for (const x of $$('.slot .sbox.drop')) x.classList.remove('drop');
  const o = pxCardOf(s.b); if (o && !ok) { o.a = 1; PX.dirty = true; }
  if (ok) UI.flyFrom = d.c.getBoundingClientRect();
  d.c.remove();
}
(function () {
  let st = null;
  const noClick = () => { UI.noClick = Date.now() + 350; };
  document.addEventListener('pointerdown', e => {
    if (!G || !UI.started) return;
    if (UI.busy && e.target.closest && e.target.closest('#bd,#stage')) hurry();
    const b = e.target.closest && e.target.closest('#belt .hc[data-up="1"]'); if (!b || (e.button && e.button !== 0)) return;
    st = { b, x: e.clientX, y: e.clientY, id: e.pointerId, drag: null, peek: false };
    st.tm = setTimeout(() => { if (st && !st.drag) { st.peek = true; peekShow(b); } }, 430);
  }, true);
  document.addEventListener('pointermove', e => {
    if (!st || e.pointerId !== st.id) return;
    const dx = e.clientX - st.x, dy = e.clientY - st.y;
    if (!st.drag && !st.peek && Math.hypot(dx, dy) > 10) { clearTimeout(st.tm); if (dy < -12 && -dy > Math.abs(dx) && canPick()) dragStart(st, e); else { st = null; return; } }
    if (st.drag) { dragMove(st, e); e.preventDefault(); }
  }, { capture: true, passive: false });
  const end = (e, cancel) => {
    if (!st || e.pointerId !== st.id) return; clearTimeout(st.tm); const s = st; st = null;
    if (s.peek) { peekHide(); noClick(); return; }
    if (s.drag) { const ok = !cancel && dragOver(s, e) && canPick(); dragEnd(s, ok); noClick(); if (ok) tapHand(+s.b.dataset.i); else render(); }
  };
  document.addEventListener('pointerup', e => end(e, false), true);
  document.addEventListener('pointercancel', e => end(e, true), true);
  document.addEventListener('click', e => { if (UI.noClick && Date.now() < UI.noClick && e.target.closest && e.target.closest('#belt')) { e.stopPropagation(); e.preventDefault(); } }, true);
  document.addEventListener('contextmenu', e => { if (e.target.closest && e.target.closest('#belt .hc')) e.preventDefault(); }, true);
  document.addEventListener('click', e => { if (e.target.closest && e.target.closest('#tipb')) { UI.tip = null; boardFX(); } });
  addEventListener('resize', boardFX);
  document.addEventListener('scroll', boardFX, { passive: true, capture: true });
})();
// tap the table during a reveal or a pass: everything still moving plays faster
function hurry() {
  if (UI.fast) return; UI.fast = true;
  try { for (const a of document.getAnimations()) if (a.playState === 'running') a.playbackRate = 3; } catch (e) { }
}
const spd = () => (AIDELAY > 0 ? Math.max(.5, AIDELAY / 650) : .5) * (UI.fast ? .35 : 1);
function anim(el, kf, o) { if (!el.animate) return Promise.resolve(); const a = el.animate(kf, o); if (UI.fast) a.playbackRate = 3; return new Promise(r => { a.onfinish = r; a.oncancel = r; setTimeout(r, (o.duration + (o.delay || 0)) / (UI.fast ? 3 : 1) + 400); }); }
// ---- the reveal stage: every diner's covered dish in a row in the middle of the table, a drum roll, all covers up at once
function stageOK() { return !!$('#tbl') && !!document.body.animate && !pxRM(); }
function stageClear() { const s = $('#stage'); if (s) s.remove(); }
async function stageReveal(picks, tok) {
  stageClear();
  const bd = $('#bd'), tbl = $('#tbl'), B = bd.getBoundingClientRect(), T = tbl.getBoundingClientRect();
  const f = focusSeat(), np = picks.length, order = []; for (let k = 0; k < np; k++) order.push((f + k) % np);
  const st = h('div#stage', { 'aria-label': 'Reveal' });
  st.style.top = Math.round(T.top - B.top) + 'px'; st.style.height = Math.round(T.height) + 'px';
  const W = B.width - 20, podW = Math.max(56, Math.min(120, Math.floor((W - (np - 1) * 8) / np))), cardsW = Math.min(podW - 8, Math.round((T.height - 70) / 1.4));
  const row = h('div.srow'); st.appendChild(row); st.appendChild(h('div.sban', 'Reveal!'));
  const pods = [];
  for (const s of order) {
    const pk = picks.find(p => p.seat === s); if (!pk) continue;
    const n = pk.cards.length, cw = n > 1 ? Math.round(cardsW * .62) : cardsW;
    const host = h('div.shost'); host.style.width = (n > 1 ? cw * 2 + 4 : cw) + 'px'; host.style.height = Math.round(cw * 1.4) + 'px';
    pk.cards.forEach(c => { const d = h('div.scard'); d.style.width = cw + 'px'; d.style.height = Math.round(cw * 1.4) + 'px'; d.appendChild(cardNode(c.key, cw, c.w >= 0 && NIG[c.key] ? null : null)); host.appendChild(d); });
    const av = h('div.sav'); av.appendChild(avN(s, 96));
    const pod = h('div.pod' + (s === viewSeat() ? '.me' : ''), { style: 'width:' + podW + 'px;--pc:' + pcol(s).c }, host, h('div.snm', av, h('span', pname(s))));
    row.appendChild(pod); pods.push({ s, pod, host });
  }
  bd.appendChild(st);
  const covers = pods.map(p => KIT.clocheOn(p.host));
  // the covered dishes slide in from each diner's seat
  await Promise.all(pods.map((p, i) => {
    const sl = document.querySelector('.seat[data-seat="' + p.s + '"] .slot .sbox'), to = p.host.getBoundingClientRect();
    if (!sl || !to.width) return Promise.resolve();
    const fr = sl.getBoundingClientRect(), dx = fr.left + fr.width / 2 - (to.left + to.width / 2), dy = fr.top + fr.height / 2 - (to.top + to.height / 2), sc = Math.max(.25, fr.width / to.width);
    return anim(p.host, [{ transform: 'translate(' + dx + 'px,' + dy + 'px) scale(' + sc + ')' }, { transform: 'none' }], { duration: 340 * spd(), easing: 'cubic-bezier(.2,.8,.3,1)', delay: i * 40 });
  }));
  if (tok !== UI.seq) return stageClear();
  // drum roll: the covers rattle
  st.classList.add('wob');
  for (let k = 0; k < 3; k++) { snd('tick', { rate: 1 + k * .15, vol: .5 }); await wait(190); if (tok !== UI.seq) return stageClear(); }
  st.classList.remove('wob'); st.classList.add('up'); UI.fz.slots = picks.map(p => ({ mode: 'faces', cards: p.cards })); renderDock(); renderLabActs();
  snd('cloche');
  await Promise.all(covers.map(c => c.lift({ delay: 0 })));
  if (tok !== UI.seq) return stageClear();
  await wait(800); if (tok !== UI.seq) return stageClear();
  // each dish goes home to its diner's counter
  UI.fz.slots = picks.map(() => ({ mode: 'gone' }));
  await Promise.all(pods.map((p, i) => {
    const se = document.querySelector('.seat[data-seat="' + p.s + '"] .ctr'), fr = p.host.getBoundingClientRect(); if (!se) return Promise.resolve();
    const to = se.getBoundingClientRect(), dx = to.left + Math.min(to.width / 2, 60) - (fr.left + fr.width / 2), dy = to.top + to.height / 2 - (fr.top + fr.height / 2);
    p.pod.querySelector('.snm').style.opacity = '0';
    return anim(p.host, [{ transform: 'none', opacity: 1 }, { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(.45)', opacity: .9 }], { duration: 380 * spd(), easing: 'cubic-bezier(.5,0,.6,1)', delay: i * 40, fill: 'both' });
  }));
  st.classList.add('out');
}
// ---- points float up where they were earned (the painted table does its own bursts for gains)
function scorePops(before, after) {
  if (!ANIM) return;
  const ib = seatScoreInfo(before), ia = seatScoreInfo(after);
  requestAnimationFrame(() => {
    for (let s = 0; s < G.np; s++) {
      const pb = {}; groupsOf(s, before, ib).list.forEach(g => pb[g.k] = g.pts);
      for (const g of groupsOf(s, after, ia).list) {
        const d = g.pts - (pb[g.k] || 0); if (!d || (d > 0 && PX.on)) continue;
        const el = document.querySelector('#tbl .grp[data-seat="' + s + '"][data-k="' + g.k + '"]'); if (!el) continue;
        const r = el.getBoundingClientRect(); if (!r.width) continue;
        const p = h('div.fpop' + (d < 0 ? '.neg' : ''), (d > 0 ? '+' : '−') + Math.abs(d) + (d < 0 && g.k === 'roll' ? ' roll race' : ''));
        p.style.left = Math.round(r.left + r.width / 2) + 'px'; p.style.top = Math.round(r.top + 6) + 'px'; document.body.appendChild(p);
        setTimeout(() => p.remove(), 2200);
      }
    }
  });
}
// ---- the hands pass along the belt: your dishes ride off the left end and up to the next diner; every other hand moves one seat;
// the hand you get rides in from the previous diner onto the right end of the belt
async function passAlong(sizes) {
  const np = G.np, f = focusSeat(), nx = (f + 1) % np, pv = (f + np - 1) % np;
  const avR = s => { const e = document.querySelector('.seat[data-seat="' + s + '"] .sh .av'); if (!e) return null; const r = e.getBoundingClientRect(); return r.width ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : null; };
  const bwEl = $('#beltw'); if (!bwEl) return; const bw = bwEl.getBoundingClientRect();
  const belt = $('#belt'), cards = [...belt.querySelectorAll('.hc')].filter(b => b.getBoundingClientRect().width);
  snd('pass');
  if (PX.on) for (const o of [...PX.objs.values()]) if (o.kind === 'card' && !o.detached) pxKill(o);
  belt.style.visibility = 'hidden';
  const jobs = [], to = avR(nx), from = avR(pv), sp = spd(), keep = [];
  const tag = (txt, x, y) => { const t = h('div.ptag', txt); t.style.left = Math.round(x) + 'px'; t.style.top = Math.round(y) + 'px'; document.body.appendChild(t); keep.push(t); };
  if (to && cards.length) tag('→ ' + pname(nx), bw.left + 10, bw.top + 4);
  cards.forEach((b, k) => {
    const r = b.getBoundingClientRect(), id = b.dataset.id;
    const c = h('div.flyc.pass'); c.style.cssText = 'left:' + r.left + 'px;top:' + r.top + 'px;width:' + r.width + 'px;height:' + r.height + 'px';
    c.appendChild(id != null ? cardNode(tkey(+id), Math.round(r.width)) : backN(Math.round(r.width))); document.body.appendChild(c); keep.push(c);
    const ex = bw.left + 6 - r.left, kf = [{ transform: 'none' }, { transform: 'translate(' + ex + 'px,0) rotate(-4deg)', offset: .5 }];
    if (to) kf.push({ transform: 'translate(' + (to.x - (r.left + r.width / 2)) + 'px,' + (to.y - (r.top + r.height / 2)) + 'px) scale(' + Math.max(.2, 30 / r.width) + ')', opacity: .9 });
    else kf.push({ transform: 'translate(' + (ex - r.width * 1.5) + 'px,0)', opacity: 0 });
    jobs.push(anim(c, kf, { duration: 1000 * sp, easing: 'ease-in-out', delay: k * 40 * sp, fill: 'both' }));
  });
  // every other hand moves one seat on
  for (let s = 0; s < np; s++) {
    if (s === f || s === pv && np > 1) continue;
    const a = avR(s), b = avR((s + 1) % np); if (!a || !b) continue;
    const el = h('div.pkt'); el.innerHTML = KIT.backSVG({ w: 34 }); el.appendChild(h('b', String(sizes ? sizes[s] : ''))); el.style.left = '0'; el.style.top = '0'; document.body.appendChild(el); keep.push(el);
    jobs.push(anim(el, [{ transform: 'translate(' + (a.x - 17) + 'px,' + (a.y - 24) + 'px) scale(.6)', opacity: 0 }, { transform: 'translate(' + (a.x - 17) + 'px,' + (a.y - 24) + 'px)', opacity: 1, offset: .15 }, { transform: 'translate(' + (b.x - 17) + 'px,' + (b.y - 24) + 'px)', opacity: 1, offset: .85 }, { transform: 'translate(' + (b.x - 17) + 'px,' + (b.y - 24) + 'px) scale(.6)', opacity: 0 }], { duration: 1100 * sp, easing: 'ease-in-out', delay: 150 * sp, fill: 'both' }));
  }
  // the next hand comes to you from the previous diner, onto the right end of the belt
  if (from && np > 1) {
    const hw = cards[0] ? cards[0].getBoundingClientRect().width : 60, tx = bw.right - hw - 10, ty = bw.bottom - hw * 1.4 - 8;
    const el = h('div.pkt.in'); el.style.width = hw + 'px'; el.style.height = Math.round(hw * 1.4) + 'px'; el.innerHTML = KIT.backSVG({ w: Math.round(hw) }); el.appendChild(h('b', String(sizes ? sizes[pv] : ''))); el.style.left = '0'; el.style.top = '0'; document.body.appendChild(el); keep.push(el);
    tag(pname(pv) + ' →', bw.right - 10, bw.top + 4); keep[keep.length - 1].classList.add('r');
    jobs.push(anim(el, [{ transform: 'translate(' + (from.x - hw / 2) + 'px,' + (from.y - hw * .7) + 'px) scale(.4)', opacity: 0 }, { transform: 'translate(' + (from.x - hw / 2) + 'px,' + (from.y - hw * .7) + 'px) scale(.5)', opacity: 1, offset: .2 }, { transform: 'translate(' + tx + 'px,' + ty + 'px) scale(1)', opacity: 1 }], { duration: 1000 * sp, easing: 'cubic-bezier(.3,.1,.3,1)', delay: 350 * sp, fill: 'both' }));
  }
  UI.passKeep = keep;
  await Promise.all(jobs);
}
function passDone() {
  const b = $('#belt'); if (b) b.style.visibility = '';
  if (UI.passKeep) { const k = UI.passKeep; UI.passKeep = null; setTimeout(() => k.forEach(e => e.remove()), 120); }
}
