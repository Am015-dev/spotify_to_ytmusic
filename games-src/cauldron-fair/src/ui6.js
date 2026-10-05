// ===================== part 6: board first: the bag, the pull, the danger meter, the boil, the explosion, the ghost finger, the shop =====================
// The brew is played on the bag: tap it, a hand rummages (longer when the pot is risky), the chip pops out of the bag and flies onto the
// spiral. The danger meter under it ticks up with every white chip; the pot boils harder as the risk grows. Stop is the one big button.
// Nothing here changes the rules: it only times and shows the same moves (act() / CF.moves()).
const BF = { pulling: false, fast: false, seq: 0, lastWs: {}, fxUntil: 0, heat: 0, launch: null, repT: 0 };
const bfAnim = () => ANIM && !UI.sim && !(typeof pxRM === 'function' && pxRM()) && !/jsdom/i.test(navigator.userAgent || '');
// how long the hand rummages in the bag: a short beat, longer when the next chip may explode the pot
function pullMs(p) { if (!bfAnim() || UI.pullMs === 0) return 0; const r = CF.risk(G, p.seat); return Math.round(480 + 820 * Math.min(1, r.pBoom * 2.4)); }
function heatOf(p) { if (!p || !G) return 0; const lim = CF.limitOf(G, p), ws = CF.whiteSum(p); if (p.boom) return 1; let pb = 0; try { if (G.phase === 'brew' && p.st === 'draw' && p.bag.length && p.bag[0]) pb = CF.risk(G, p.seat).pBoom; } catch (e) { } return Math.max(0, Math.min(1, Math.max(ws / Math.max(1, lim + 1), pb * 2.2))); }
const bfHand = () => '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M22 60 C14 50 12 40 16 30 L18 14 C18 10 24 10 24 14 L25 28 L27 8 C27 3 34 3 34 8 L34 27 L37 10 C37 5 44 5 44 10 L42 29 L46 18 C47 13 53 14 52 19 L48 40 C46 50 42 56 38 60 Z" fill="#f3d2b0" stroke="#5a3a1a" stroke-width="2.4" stroke-linejoin="round"/></svg>';
function bfPull(m, v) {
  if (BF.pulling) { BF.fast = true; return; }              // a second tap hurries the hand, it never draws twice
  const p = G.players[v], ms = pullMs(p);
  if (!ms) { act(m, v); return; }
  BF.pulling = true; BF.fast = false; BF.seq = UI.seq; document.documentElement.classList.add('pulling');
  $$('.bagb').forEach(b => b.classList.add('pull')); snd('draw'); if (ms > 900) setTimeout(() => { if (BF.pulling) snd('tick'); }, ms * .55);
  const t0 = Date.now();
  const step = () => {
    if (BF.seq !== UI.seq || !G || G.phase !== 'brew') { bfEndPull(); return; }
    if (!BF.fast && Date.now() - t0 < ms) { setTimeout(step, 30); return; }
    bfEndPull(); const dm = mvList(v).find(x => x.t === 'draw'); if (dm) act(dm, v); else render();
  };
  setTimeout(step, 30);
}
function bfEndPull() { BF.pulling = false; BF.fast = false; document.documentElement.classList.remove('pulling'); $$('.bagb').forEach(b => b.classList.remove('pull')); }
// the chip pops out of the bag, hangs for a beat, then the painted layer flies it onto the spiral
function bfReveal(chip) {
  if (!bfAnim()) return 0; const bag = document.querySelector('.bagb'); if (!bag) return 0;
  const r = bag.getBoundingClientRect(); if (r.width < 4) return 0;
  const key = chip.c + chip.v, sz = Math.round(Math.min(84, Math.max(56, r.height * .8)));
  const x0 = r.left + r.width / 2, y0 = r.top + r.height * .35, x1 = x0, y1 = Math.max(70, r.top - sz * .9);
  const e = h('div.bfchip' + (chip.c === 'W' ? '.w' : ''), { html: chipHTML(key, sz), 'aria-hidden': 'true' });
  e.style.left = (x1 - sz / 2) + 'px'; e.style.top = (y1 - sz / 2) + 'px'; document.body.appendChild(e);
  const dy = y0 - y1;
  try {
    e.animate([{ transform: 'translateY(' + dy + 'px) scale(.3) rotate(-30deg)', opacity: 0 }, { transform: 'translateY(-8px) scale(1.25) rotate(6deg)', opacity: 1, offset: .45 }, { transform: 'translateY(0) scale(1.1) rotate(0)', opacity: 1, offset: .7 }, { transform: 'translateY(0) scale(1.1)', opacity: 1 }], { duration: 560, easing: 'cubic-bezier(.2,.8,.3,1)', fill: 'forwards' });
    setTimeout(() => { try { e.animate([{ opacity: 1 }, { opacity: 0, transform: 'translateY(-14px) scale(.9)' }], { duration: 160, fill: 'forwards' }); } catch (x) { } setTimeout(() => e.remove(), 180); }, 560);
  } catch (x) { setTimeout(() => e.remove(), 700); }
  const bd = $('#bd'); if (bd) { const B = bd.getBoundingClientRect(); BF.launch = { x: x1 - B.left, y: y1 - B.top, t: Date.now() }; }
  return 520;
}
// ---------- the brew deck: one line, the danger meter, the bag and Stop ----------
function bfLine(p, r, fm) {
  if (!p.pot.length) return G.round === 1 ? 'Tap the bag to pull a chip!' : 'Tap the bag to start brewing';
  if (p.lock) return 'Decided. Waiting for the others…';
  const pct = Math.round(r.pBoom * 100);
  if (fm && p.pot[p.pot.length - 1].c === 'W' && CF.whiteSum(p) >= r.limit - 2) return 'Too hot? The flask puts it back';
  if (pct >= 40) return 'Very risky! Stop now?';
  if (pct >= 20) return 'Risky… one more, or Stop?';
  if (pct > 0) return 'Pull again, or Stop and keep it';
  return 'Safe! Pull another chip';
}
function bfMeter(p, v, fm, legal) {
  const lim = CF.limitOf(G, p), ws = CF.whiteSum(p), r = CF.risk(G, v), pct = Math.round(r.pBoom * 100);
  const prev = BF.lastWs[p.seat + ':' + G.round] || 0; BF.lastWs[p.seat + ':' + G.round] = ws;
  const lv = ws > lim ? 'over' : ws >= lim - 1 ? 'hi' : ws >= lim - 3 ? 'mid' : 'lo';
  const cells = h('span.mcells', { 'aria-hidden': 'true' });
  const n = Math.max(lim, ws);
  for (let i = 1; i <= n; i++) { const c = h('i' + (i <= ws ? '.on' : '') + (i > lim ? '.x' : '') + (i <= ws && i > prev ? '.new' : '')); if (i <= ws && i > prev) c.style.animationDelay = ((i - prev - 1) * 110) + 'ms'; cells.appendChild(c); }
  cells.appendChild(h('b.mboom', { html: ico('boom', 22) }));
  const m = h('div.meter.' + lv + (ws > prev ? '.up' : ''), { 'data-priv': v, role: 'meter', 'aria-valuemin': 0, 'aria-valuemax': lim, 'aria-valuenow': ws, 'aria-label': 'White chips ' + ws + ' of ' + lim + '. Next chip: ' + pct + '% to explode.' },
    h('span.mw', { html: KIT.chipSVG('W', 0, { size: 22 }) }), cells, h('span.mn', h('b', ws), '/' + lim),
    G.phase === 'brew' && p.st === 'draw' && !p.lock ? h('span.mp.' + (pct < 15 ? 'lo' : pct < 30 ? 'mid' : 'hi'), pct + '%') : null,
    fm ? h('button.flb', { 'data-a': 'mv', 'data-i': legal.indexOf(fm), type: 'button', 'aria-label': 'Flask: put the last white chip back in the bag', title: 'Flask: put the last white chip back' }, h('span', { html: ico('flask', 22, true) })) : null);
  return m;
}
function brewDeck(p, v, legal) {
  const dm = legal.find(x => x.t === 'draw'), sm = legal.find(x => x.t === 'stop'), fm = legal.find(x => x.t === 'flask');
  const r = CF.risk(G, v), sp = CF.spaceOf(p), heat = heatOf(p);
  const deck = h('div.bdeck' + (heat > .7 ? '.hot' : ''));
  deck.appendChild(h('div.bline', { 'aria-live': 'polite' }, bfLine(p, r, fm)));
  deck.appendChild(bfMeter(p, v, p.lock ? null : fm, legal));
  const extras = [legal.find(x => x.t === 'froth') ? h('button.btn.alt.sec', { 'data-a': 'mv', 'data-i': legal.indexOf(legal.find(x => x.t === 'froth')), type: 'button' }, '↩ White chip back, free') : null,
    legal.find(x => x.t === 'restart') ? h('button.btn.alt.sec', { 'data-a': 'mv', 'data-i': legal.indexOf(legal.find(x => x.t === 'restart')), type: 'button' }, 'Do-over: tip the chips back, once') : null].filter(Boolean);
  const rat = legal.filter(x => x.t === 'ratset');
  if (rat.length) { const k = p.rat - p.droplet; const d = h('details.ratd', h('summary', h('span', { html: ico('rat', 18) }), 'Head start +' + k)); const row = h('div.ratrow'); rat.forEach(x => row.appendChild(h('button.btn.alt', { 'data-a': 'mv', 'data-i': legal.indexOf(x), type: 'button' }, x.n ? 'Only +' + x.n : 'None'))); d.appendChild(row); extras.push(d); }
  const bagArt = KIT.ART.bag ? h('img.bagimg', { src: KIT.ART.bag, alt: '' }) : h('span.bagimg', { html: ico('bag', 80) });
  const bag = dm ? h('button.btn.drawb.bagb' + (BF.pulling ? '.pull' : ''), { 'data-a': 'mv', 'data-i': legal.indexOf(dm), type: 'button', 'aria-label': 'Draw: pull a chip from your bag (' + bagN(p) + ' chips inside)' },
    h('span.bagwrap', bagArt, h('span.hand', { html: bfHand() }), h('span.bagn', bagN(p))), h('span.bl', 'Draw'))
    : h('button.btn.drawb.bagb.off', { type: 'button', disabled: true }, h('span.bagwrap', bagArt, h('span.bagn', bagN(p))), h('span.bl', p.lock ? 'Waiting' : 'Draw'));
  const keep = h('small.keep', h('span', { html: ico('vp', 15) }), D.VP[sp], h('span', { html: ico('coin', 15) }), D.COINS[sp], D.RUBY[sp] ? h('span', { html: ico('ruby', 15) }) : null);
  const stop = sm ? h('button.btn.stopb', { 'data-a': 'mv', 'data-i': legal.indexOf(sm), type: 'button', disabled: BF.pulling ? true : null, 'aria-label': 'Stop and keep ' + D.VP[sp] + ' points and ' + D.COINS[sp] + ' coins' }, h('b', 'Stop'), keep)
    : h('button.btn.stopb.off', { type: 'button', disabled: true, title: 'Pull your first chip first' }, h('b', 'Stop'), p.pot.length ? keep : h('small.keep', 'after a chip'));
  deck.appendChild(h('div.brow', bag, stop));
  if (extras.length) deck.appendChild(h('div.bextra', extras));   // below Draw/Stop, so the two big buttons never move
  return deck;
}
// ---------- the boil: the pot reacts to the risk (CSS on #cwrap, the painted layer reads BF.heat) ----------
function bfHeat() {
  const cw = $('#cwrap'); if (!cw || !G) return; const f = focusSeat(), p = G.players[f];
  const ht = G.phase === 'brew' || p.boom ? heatOf(p) : 0; BF.heat = ht;
  cw.style.setProperty('--heat', ht.toFixed(2)); cw.dataset.heat = ht > .75 ? 3 : ht > .5 ? 2 : ht > .25 ? 1 : 0;
}
// ---------- the explosion ----------
function bfBoom(e) {
  if (!bfAnim()) return; const mine = isMine(e.seat), f = focusSeat(); if (e.seat !== f && !mine) return;
  const big = mine, T = big ? 460 : 220, TOT = big ? 1600 : 1000;           // a tension beat on the deciding draw, then the bang, then the result
  BF.fxUntil = Date.now() + TOT + 40; clearTimeout(BF.repT);
  const o = h('div.boomfx' + (e.prot ? '.prot' : '') + (big ? '' : '.small'), { 'aria-hidden': 'true' }, h('div.btense'), h('div.bflash'), h('div.bword', e.prot ? 'BOOM… safe!' : 'BOOM!'), h('div.bsub', 'White ' + CF.whiteSum(G.players[e.seat]) + ' > ' + CF.limitOf(G, G.players[e.seat])));
  o.style.setProperty('--T', T + 'ms'); o.style.setProperty('--S', big ? 1 : .6);
  const cols = ['#f8f2e0', '#ff8a2a', '#7fd65a', '#ffd23a', '#8a5cf0'], n = big ? 30 : 16;
  for (let i = 0; i < n; i++) {
    const w = i % 5 === 0 ? h('i.shard.chipy') : h('i.shard'); const a = -Math.PI / 2 + (Math.random() - .5) * 2.6, d = (big ? 140 : 90) + Math.random() * (big ? 260 : 150);
    w.style.setProperty('--dx', Math.round(Math.cos(a) * d) + 'px'); w.style.setProperty('--dy', Math.round(Math.sin(a) * d * 1.2 + d * .5) + 'px'); w.style.setProperty('--c', cols[i % cols.length]);
    w.style.animationDelay = (T + Math.round(Math.random() * 140)) + 'ms'; o.appendChild(w);
  }
  document.body.appendChild(o);
  const cw = $('#cwrap'), app = document.querySelector('.gx-app'); let done = false;
  const end = skip => { if (done) return; done = true; o.remove(); if (cw) cw.classList.remove('tense'); if (app) app.classList.remove('quake'); if (skip) { BF.fxUntil = 0; if (typeof checkReport === 'function') checkReport(); } };
  o.addEventListener('click', () => end(true)); o.style.pointerEvents = 'auto';  // a tap skips it
  if (cw) cw.classList.add('tense'); snd('tick'); setTimeout(() => { if (!done) snd('tick'); }, T * .55);
  setTimeout(() => {
    if (done) return; if (cw) cw.classList.remove('tense'); snd('boom'); o.classList.add('bang');
    if (app) { app.classList.remove('quake'); void app.offsetWidth; app.classList.add('quake'); }
    try { if (navigator.vibrate) navigator.vibrate([90, 40, 160]); } catch (x) { }
  }, T);
  setTimeout(() => end(false), TOT);
}
// ---------- events: called from playEvents ----------
function bfEvent(e) {
  if (!G || UI.sim) return;
  if (e.t === 'place' && isMine(e.seat) && focusSeat() === e.seat && e.chip) { const d = bfReveal(e.chip); if (d && typeof PX !== 'undefined') PX.flyIds[e.chip.i] = d; }
  else if (e.t === 'boom') bfBoom(e);
}
// ---------- the ghost finger: shows the very first moves, then goes away ----------
function bfGhost() {
  let g = $('#ghost'); const tgt = bfGhostTarget();
  if (!tgt) { if (g) g.hidden = true; return; }
  if (!g) { g = h('div#ghost', { 'aria-hidden': 'true', html: bfHand() }); document.body.appendChild(g); }
  const r = tgt.getBoundingClientRect(); if (r.width < 4) { g.hidden = true; return; }
  g.hidden = false; g.style.left = Math.round(Math.min(innerWidth - 52, r.left + r.width * .62)) + 'px'; g.style.top = Math.round(Math.min(innerHeight - 64, r.top + r.height * .5)) + 'px';
}
function bfGhostTarget() {
  if (!G || !UI.started || G.phase === 'over' || hotSeat() || UI.coach.level === 'off') return null;
  const p = mineP(); if (!p) return null; const fresh = UI.mode === 'guided' || !UI.prefs.drew;
  if (UI.rsOpen && UI.rsMode === 'report') {
    if (p.q && p.q.h === 'shop' && !UI.prefs.shopped && !(UI.shopSel || []).length) return document.querySelector('#rs .tok.sug:not([disabled])') || document.querySelector('#rs .tok:not([disabled])');
    if (p.q && p.q.h === 'shop' && !UI.prefs.shopped && (UI.shopSel || []).length) return document.querySelector('#rs [data-a=shopbuy]');
    return null;
  }
  if (UI.rsOpen || G.phase !== 'brew' || p.st !== 'draw' || p.lock || p.q || focusSeat() !== p.seat) return null;
  if (fresh && !p.pot.length && G.round === 1 && !BF.pulling) return document.querySelector('#acts .bagb:not([disabled])');
  if (UI.mode === 'guided' && G.round === 1 && !UI.prefs.stopped && p.pot.length >= 3 && CF.risk(G, p.seat).pBoom >= .2 && !BF.pulling) return document.querySelector('#acts .stopb:not([disabled])');
  return null;
}
// ---------- the shop: tap a chip, it drops into your bag ----------
function shopUI(p, q, legal) {
  const wrap = h('div.shop'); const coins = q.d.coins, sel = UI.shopSel = (UI.shopSel || []).filter(k => G.supply[k] > 0);
  const cost = sel.reduce((a, k) => a + CF.price(G, k[0], +k.slice(1)), 0);
  wrap.appendChild(h('div.purse', h('span', { html: ico('coin', 30) }), h('b', coins - cost), h('span.pl', sel.length ? ' left' : ' coins to spend')));
  const stalls = h('div.stalls');
  for (const c of D.SHOP_COLORS) {
    const out = CF.bookOut(G, c), bk = c === 'O' ? D.BOOKS.O[0] : c === 'K' ? D.BOOKS.K[0] : D.BOOKS[c][G.sets[c]];
    const st = h('div.stall' + (out ? '' : '.locked'));
    st.appendChild(h('details.sth', h('summary', { 'aria-label': D.COLORS[c].name + ': how it works' }, h('b', D.COLORS[c].name), h('span.bi', { 'aria-hidden': 'true' }, out ? 'i' : 'day ' + D.BOOK_ROUND[c])), h('div.bx', bk.title + ': ' + bk.text)));
    const row = h('div.toks');
    D.COLORS[c].vals.forEach(val => {
      if (c === 'W' || (c === 'O' && val !== 1)) return; const key = c + val, price = CF.price(G, c, val), left = G.supply[key];
      const on = sel.indexOf(key) >= 0; const others = sel.filter(k => k[0] !== c).reduce((a, k) => a + CF.price(G, k[0], +k.slice(1)), 0);
      const dis = !out || left < 1 || price + others > coins;
      row.appendChild(h('button.tok' + (on ? '.on' : ''), { 'data-a': 'shopsel', 'data-k': key, type: 'button', disabled: dis && !on ? true : null, 'aria-pressed': on ? 'true' : 'false', 'aria-label': keyName(key) + ' for ' + price + ' coins' + (left < 1 ? ', sold out' : '') },
        chipN(key, 40), h('span.pc', h('span', { html: ico('coin', 12) }), left < 1 ? '—' : price)));
    });
    st.appendChild(row); stalls.appendChild(st);
  }
  wrap.appendChild(stalls);
  const bagArt = KIT.ART.bag ? h('img.sbimg', { src: KIT.ART.bag, alt: '' }) : h('span.sbimg', { html: ico('bag', 56) });
  const bagz = h('div.shopbag', { 'aria-label': 'Your bag' }, bagArt, h('div.sbin', sel.length ? sel.map(k => h('button.sbc', { 'data-a': 'shopsel', 'data-k': k, type: 'button', 'aria-label': 'Take ' + keyName(k) + ' out again' }, chipN(k, 40))) : h('span.sbe', 'Tap chips to drop them in')));
  UI.rsFoot = [h('div.shopfoot', bagz, h('button.btn.go', { 'data-a': 'shopbuy', type: 'button' }, sel.length ? 'Done' : 'Buy nothing'))];
  return wrap;
}
function bfFly(fromR, toEl, key, size) {
  if (!bfAnim() || !fromR || !toEl) return; const to = toEl.getBoundingClientRect(); if (to.width < 4) return;
  const e = h('div.bfchip', { html: chipHTML(key, size || 40), 'aria-hidden': 'true' }); e.style.left = fromR.left + 'px'; e.style.top = fromR.top + 'px'; document.body.appendChild(e);
  toEl.style.visibility = 'hidden';
  try { const a = e.animate([{ transform: 'translate(0,0) scale(1)' }, { transform: 'translate(' + ((to.left - fromR.left) / 2) + 'px,' + ((to.top - fromR.top) / 2 - 60) + 'px) scale(1.3)', offset: .5 }, { transform: 'translate(' + (to.left - fromR.left) + 'px,' + (to.top - fromR.top) + 'px) scale(1)' }], { duration: 420, easing: 'ease-in-out' }); a.onfinish = () => { e.remove(); toEl.style.visibility = ''; }; }
  catch (x) { e.remove(); toEl.style.visibility = ''; }
}
function shopToggle(key) {
  const c = key[0]; let sel = UI.shopSel.slice(); const i = sel.indexOf(key), adding = i < 0;
  const src = document.querySelector('#rs .tok[data-k="' + key + '"] svg'), fromR = src ? src.getBoundingClientRect() : null;
  if (i >= 0) sel.splice(i, 1); else { sel = sel.filter(k => k[0] !== c); sel.push(key); if (sel.length > 2) sel.shift(); }
  UI.shopSel = sel; snd(adding ? 'coin' : 'click'); renderReport();
  if (adding) { const t = document.querySelector('#rs .sbc[data-k="' + key + '"]'); bfFly(fromR, t, key, 40); setTimeout(() => snd('plop'), 380); }
  bfGhost();
}
function shopBuy() {
  const v = viewSeat(); if (v < 0) return; const items = UI.shopSel.slice();
  const go = () => { UI.shopSel = []; UI.prefs.shopped = true; savePrefs(); if (!act({ t: 'buy', items }, v)) toast('That purchase did not work.'); };
  const cs = $$('#rs .sbc'), img = document.querySelector('#rs .sbimg');
  if (!items.length || !bfAnim() || !cs.length || !img) { go(); return; }
  if (UI.buying) return; UI.buying = true;
  const ir = img.getBoundingClientRect();
  cs.forEach((c, k) => { const r = c.getBoundingClientRect(); try { c.animate([{ transform: 'none', opacity: 1 }, { transform: 'translate(' + (ir.left + ir.width / 2 - r.left - r.width / 2) + 'px,' + (ir.top + ir.height * .3 - r.top - r.height / 2 - 40) + 'px) scale(.8)', offset: .55 }, { transform: 'translate(' + (ir.left + ir.width / 2 - r.left - r.width / 2) + 'px,' + (ir.top + ir.height * .45 - r.top - r.height / 2) + 'px) scale(.2)', opacity: 0 }], { duration: 520, delay: k * 120, fill: 'forwards', easing: 'ease-in' }); } catch (x) { } });
  try { img.animate([{ transform: 'none' }, { transform: 'scale(1.12,.9)' }, { transform: 'none' }], { duration: 300, delay: 480 + (cs.length - 1) * 120 }); } catch (x) { }
  snd('buy'); setTimeout(() => { UI.buying = false; go(); }, 720 + (cs.length - 1) * 120);
}
