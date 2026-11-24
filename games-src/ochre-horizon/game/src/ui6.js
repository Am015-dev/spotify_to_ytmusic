
// ===== part 6: guide (what to tap now): one banner, glowing target, wrong-tap nudge =====
var GD = { on: false, sel: [], line: '', nudgeTm: 0, last: '' };
function guideEnabled() { return !!G && !UI.scn && !UI.charter && !G.over && (UI.tut || (!LS.get('oh_done') && !Q.get('play')) || !!Q.get('guide')); }
var GD_IDEA = {   // first-time teaching line for each idea (shown in gens 1-2 under the instruction)
  corp: 'Your company sets your start. This one is plain: easy to learn.',
  keep: 'Cards are your projects. You get all 10 free with this company.',
  play: 'A card costs credits. Pay it, get its effect right away.',
  place: 'Tiles score. Glowing hexes are allowed. Pick one, then confirm.',
  green: 'Plants become a greenery tile: +1 point and more air.',
  heat: 'Heat warms the planet: +1 rating, which also raises your income.',
  std: 'Projects always work if you can pay. They raise your rating.',
  act: 'Card actions are free once per round. Use them.',
  end: 'Done ends your turn. You play again after the rival.',
  buy: 'New round: buy cards you can use soon. 3 credits each.'
};
function guideTitle(m) { try { return suggestWords(m); } catch (e) { return ['Make a move', '']; } }
function guideNow() {
  var P = G.pl[0], p = OH.sideToAct(), early = G.gen <= 2, sheetOn = $('sheet').classList.contains('on'), modalOn = $('modal').classList.contains('on'), xOk = getComputedStyle($('shX')).visibility !== 'hidden', m;
  if (p === 1) return { t: 'Rival is playing', w: 'Wait a moment. It is quick.', sel: [] };
  if (G.pending) {
    var h = G.pending.h;
    if (h === 'place') {
      var tt = G.pending.d && G.pending.d.t; tt = tt === 'special' ? 'tile' : tt || 'tile';
      if (UI.sel && G.pending.d.spaces.indexOf(UI.sel) >= 0) return { t: 'Tap Place here to build your ' + tt, w: 'The highlighted hex is yours. Check the bonus first.', sel: ['#confirmb'], nm: 'Place here' };
      var best = null; try { m = OHAI.suggest(0); if (m && m.t === 'place') best = m.s; } catch (e) { }
      if (best == null || G.pending.d.spaces.indexOf(best) < 0) best = G.pending.d.spaces[0];
      best = guideVisibleHex(best, G.pending.d.spaces);
      return { t: 'Tap the glowing hex for your ' + tt, w: early ? GD_IDEA.place : 'Glowing hexes are the allowed spots. Bonus icons give extras.', sel: ['.hex[data-s="' + best + '"]'], nm: 'the glowing hex' };
    }
    if (h === 'choose') return { t: 'Tap an option', w: 'Pick the one you like. Either is fine.', sel: ['#mb [data-ch]:not([disabled])'], nm: 'an option' };
    if (h === 'pickres') return { t: 'Tap a card to get the resource', w: 'Resources on a card can score points.', sel: ['#mb [data-pr]'], nm: 'a card' };
  }
  if (G.phase === 'setup') {
    var st = UI.setup || {};
    if (st.step === 1) return { t: 'Tap Keep all 10', w: GD_IDEA.keep, sel: ['#mKeep'], nm: 'Keep all 10' };
    return { t: 'Tap Open Charter', w: GD_IDEA.corp, sel: ['#mb [data-corp="c00"]'], nm: 'Open Charter' };
  }
  if (G.phase === 'research' || G.phase === 'draft') {
    if (G.phase === 'draft') return { t: 'Tap a card to keep it', w: 'The rest go to the rival.', sel: ['#mb [data-dr]'], nm: 'a card' };
    return { t: 'Tap Buy to get the marked cards', w: GD_IDEA.buy, sel: ['#mBuy'], nm: 'Buy' };
  }
  if (G.phase === 'final') return { t: 'Tap Plant or Skip', w: 'Last chance to turn plants into greenery.', sel: ['#mFg', '#mFd'], nm: 'a button' };
  if (G.phase !== 'action') return { t: 'Tap the glowing button', w: '', sel: ['#mb button.pickable', '#mb button'], nm: 'the button' };
  try { m = OHAI.suggest(0); } catch (e) { m = null; }
  var t = m ? guideTitle(m) : ['', ''], tk = m && m.t === 'sell' ? 'end' : m ? m.t : 'end';
  var why = function (k) { return early && GD_IDEA[k] ? GD_IDEA[k] : t[1] || GD_IDEA[k] || ''; };
  if (modalOn) {
    if ($('mPassY')) return { t: 'Tap Yes, pass', w: 'You are out till the next round. Income comes then.', sel: ['#mPassY'], nm: 'Yes, pass' };
    if ($('mPlay') && !$('mPlay').disabled) return { t: 'Tap Play it', w: GD_IDEA.play, sel: ['#mPlay'], nm: 'Play it' };
    return { t: 'Tap Close', w: 'This card cannot be played now.', sel: ['#mb .mx', '#mb button'], nm: 'Close' };
  }
  var nm = m && m.t === 'play' ? OH.card(m.id).name : '';
  if (tk === 'play') {
    if (sheetOn && UI.sheet === 'cards') {
      if (UI.tab !== 'play' && UI.tab !== 'all' || !document.querySelector('#shB [data-card="' + m.id + '"]')) return { t: 'Tap "Can play"', w: 'These are the cards you can afford.', sel: ['#shTabs [data-tab="play"]'], nm: 'Can play' };
      return { t: 'Tap ' + nm, w: 'Play it: ' + (t[1] || GD_IDEA.play), sel: ['#shB [data-card="' + m.id + '"]'], nm: nm };
    }
    if (sheetOn && xOk) return { t: 'Tap X to close', w: 'You want your cards, not this list.', sel: ['#shX'], nm: 'X' };
    return { t: 'Tap Cards: play ' + nm, w: why('play'), sel: ['#bCards'], nm: 'Cards' };
  }
  if (tk === 'std' || tk === 'mile' || tk === 'award') {
    var nice = tk === 'std' ? OH.STD_NAME[m.k] : tk === 'mile' ? 'milestone ' + M.MILESTONES.filter(function (x) { return x.k === m.k; })[0].name : 'award ' + M.AWARDS.filter(function (x) { return x.k === m.k; })[0].name;
    var q = tk === 'std' ? '[data-std="' + m.k + '"]' : tk === 'mile' ? '[data-mile="' + m.k + '"]' : '[data-award="' + m.k + '"]';
    if (sheetOn && UI.sheet === 'proj') {
      if (document.querySelector('#shB ' + q + ':not([disabled])')) return { t: 'Tap ' + (tk === 'std' ? '' : 'Claim ') + nice, w: why('std'), sel: ['#shB ' + q], nm: 'the button' };
      return { t: 'Tap the ' + (tk === 'std' ? 'Standard' : tk === 'mile' ? 'Milestones' : 'Awards') + ' tab', w: '', sel: ['#shTabs [data-tab="' + (tk === 'std' ? 'std' : tk) + '"]'], nm: 'the tab' };
    }
    if (sheetOn && xOk) return { t: 'Tap X to close', w: '', sel: ['#shX'], nm: 'X' };
    return { t: 'Tap Projects: ' + nice, w: why('std'), sel: ['#bProj'], nm: 'Projects' };
  }
  if (tk === 'act') {
    if (sheetOn && UI.sheet === 'act') return { t: 'Tap Use on ' + OH.card(m.id).name, w: why('act'), sel: ['#shB [data-act="' + m.id + '"][data-i="' + (m.i || 0) + '"]:not([disabled])', '#shB [data-act="' + m.id + '"]:not([disabled])'], nm: 'Use' };
    if (sheetOn && xOk) return { t: 'Tap X to close', w: '', sel: ['#shX'], nm: 'X' };
    return { t: 'Tap Actions: ' + OH.card(m.id).name, w: why('act'), sel: ['#bAct'], nm: 'Actions' };
  }
  if (tk === 'green' || tk === 'heat') {
    if (sheetOn && xOk) return { t: 'Tap X to close', w: '', sel: ['#shX'], nm: 'X' };
    var r = tk === 'green' ? 'plant' : 'heat';
    return { t: tk === 'green' ? 'Tap your plants' : 'Tap your heat', w: why(tk), sel: ['#res .rc[data-r="' + r + '"]'], nm: r };
  }
  if (sheetOn && xOk) return { t: 'Tap X to close', w: 'Nothing here helps now.', sel: ['#shX'], nm: 'X' };
  return { t: G.acts === 1 ? 'Tap Done to end your turn' : 'Tap Pass to end the round', w: why('end'), sel: ['#bPass'], nm: G.acts === 1 ? 'Done' : 'Pass' };
}
function guideVisibleHex(best, spaces) {   // keep the guided hex well inside the map view, away from the buttons
  var bw = $('bw').getBoundingClientRect(), cx = bw.left + bw.width / 2, cy = bw.top + bw.height / 2, bd = 1e9, bs = best, ok = function (r) { return r.left > bw.left + 20 && r.right < bw.right - 60 && r.top > bw.top + 50 && r.bottom < bw.bottom - 80; };
  var one = document.querySelector('#hexes [data-s="' + best + '"]'); if (one && ok(one.getBoundingClientRect())) return best;
  spaces.forEach(function (s) { var e = document.querySelector('#hexes [data-s="' + s + '"]'); if (!e) return; var r = e.getBoundingClientRect(); if (!ok(r)) return; var d = Math.abs(r.left + r.width / 2 - cx) + Math.abs(r.top + r.height / 2 - cy); if (d < bd) { bd = d; bs = s; } });
  return bs;
}
function guideEls(sel) { var out = []; sel.some(function (s) { var l = document.querySelectorAll(s); if (l.length) { Array.prototype.forEach.call(l, function (e) { out.push(e); }); return true; } return false; }); return out; }
function guideRefresh() {
  var on = guideEnabled(); document.body.classList.toggle('gd', on);
  if (!on) { GD.on = false; Array.prototype.forEach.call(document.querySelectorAll('.gd-glow'), function (e) { e.classList.remove('gd-glow'); }); $('gdB').classList.remove('on'); $('gdR').classList.remove('on'); return; }
  GD.on = true; document.body.classList.toggle('gd-ov', $('sheet').classList.contains('on') || $('modal').classList.contains('on')); var g = guideNow(); GD.g = g;
  var els = guideEls(g.sel);
  Array.prototype.forEach.call(document.querySelectorAll('.gd-glow'), function (e) { if (els.indexOf(e) < 0) e.classList.remove('gd-glow'); });
  els.forEach(function (e) { e.classList.add('gd-glow'); });
  GD.els = els;
  var key = g.t + '|' + els.length; if (els[0] && key !== GD.scrolled && els[0].closest('#shB, #mb')) { GD.scrolled = key; try { els[0].scrollIntoView({ block: 'center', behavior: 'auto' }); } catch (e) { } }
  if (key !== GD.key) { GD.key = key; GD.more = false; }
  var bb = $('gdB');
  if (!GD.nudging) { $('gdT').textContent = g.t; $('gdW').textContent = g.w || ''; bb.classList.remove('nudge'); }
  bb.classList.toggle('has-m', !!g.w && !GD.nudging); bb.classList.toggle('more', !!GD.more && !GD.nudging);
  $('gdM').setAttribute('aria-expanded', GD.more ? 'true' : 'false');
  bb.setAttribute('data-gd', g.t);
  guidePlace();
}
// ---- bubbles: placed next to the glowing target, arrow touching it, never over the target ----
function gdVis(e) { var r = e.getBoundingClientRect(); return r.width > 3 && r.height > 3 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth && getComputedStyle(e).visibility !== 'hidden'; }
function gdRect(e) { var r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom }; }
function gdOver(a, b) { var w = Math.min(a.r, b.r) - Math.max(a.l, b.l), h = Math.min(a.b, b.b) - Math.max(a.t, b.t); return w > 0 && h > 0 ? w * h : 0; }
function gdObstacles(skip) {
  var root = $('modal').classList.contains('on') ? $('mb') : $('sheet').classList.contains('on') ? $('sheet') : $('app'), out = [];
  Array.prototype.forEach.call(root.querySelectorAll('button, .cw, [data-card], g.hex.tgt'), function (e) {
    if (skip.indexOf(e) >= 0 || skip.some(function (s) { return s.contains(e) || e.contains(s); }) || !gdVis(e)) return;
    var r = gdRect(e); if ((r.r - r.l) * (r.b - r.t) > innerWidth * innerHeight * 0.5) return; out.push(r);
  });
  return out;
}
function gdPlaceBubble(bub, tgts, avoid, anchor) {
  var vw = innerWidth, vh = innerHeight, top = (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--st')) || 0) + 28, G0 = 12, best = null;
  var obs = gdObstacles(tgts), a = gdRect(anchor), acx = (a.l + a.r) / 2, acy = (a.t + a.b) / 2, tr = tgts.map(gdRect);
  var maxW = Math.min(270, vw - 16);
  [maxW, Math.min(220, maxW)].forEach(function (W, wi) {
    bub.style.width = W + 'px'; var w = bub.offsetWidth, h = bub.offsetHeight;
    ['below', 'above', 'right', 'left'].forEach(function (sd, si) {
      var x, y;
      if (sd === 'below') { x = acx - w / 2; y = a.b + G0; } else if (sd === 'above') { x = acx - w / 2; y = a.t - G0 - h; }
      else if (sd === 'right') { x = a.r + G0; y = acy - h / 2; } else { x = a.l - G0 - w; y = acy - h / 2; }
      x = Math.max(8, Math.min(vw - 8 - w, x)); y = Math.max(top, Math.min(vh - 8 - h, y));
      var R = { l: x, t: y, r: x + w, b: y + h }, sc = wi * 8 + si * 6, bad = false;
      tr.forEach(function (t) { if (gdOver(R, t) > 0) bad = true; }); if (bad) return;
      var dx = Math.max(a.l - R.r, R.l - a.r, 0), dy = Math.max(a.t - R.b, R.t - a.b, 0); if (Math.max(dx, dy) > 60) sc += 400;   // got pushed away from the target by the screen edge
      obs.forEach(function (o) { sc += gdOver(R, o) / 20; }); avoid.forEach(function (o) { sc += gdOver(R, o) / 2; });
      if (!best || sc < best.sc) best = { sc: sc, sd: sd, x: x, y: y, w: w, h: h, W: W };
    });
  });
  if (!best) return null;
  bub.style.width = best.W + 'px'; bub.style.transform = 'translate(' + Math.round(best.x) + 'px,' + Math.round(best.y) + 'px)'; bub.setAttribute('data-side', best.sd);
  var ar = bub.querySelector('.ar'), horiz = best.sd === 'below' || best.sd === 'above';
  if (horiz) { ar.style.left = Math.max(14, Math.min(best.w - 34, acx - best.x - 10)) + 'px'; ar.style.top = ''; }
  else { ar.style.top = Math.max(14, Math.min(best.h - 34, acy - best.y - 10)) + 'px'; ar.style.left = ''; }
  if (horiz) ar.style[best.sd === 'below' ? 'bottom' : 'top'] = ''; else ar.style[best.sd === 'right' ? 'right' : 'left'] = '';
  return { l: best.x, t: best.y, r: best.x + best.w, b: best.y + best.h };
}
function guidePlace() {
  var bb = $('gdB'), rb = $('gdR'); if (!GD.on || !GD.els) return;
  var tg = GD.els.filter(gdVis); if (!tg.length || document.hidden) { bb.classList.remove('on'); GD.rect = null; return; }
  var rr = null;
  if (GD.res && Date.now() < GD.res.until) {
    var an = GD.res.fn(); an = an && an.isConnected && gdVis(an) ? an : null;
    if (an) { $('gdRT').textContent = GD.res.txt; rb.classList.add('on'); rr = gdPlaceBubble(rb, [an], [], an); if (!rr) rb.classList.remove('on'); }
    else rb.classList.remove('on');
  } else { rb.classList.remove('on'); GD.res = null; }
  bb.classList.add('on');
  GD.rect = gdPlaceBubble(bb, tg, rr ? [rr] : [], tg[0]);
  if (!GD.rect) bb.classList.remove('on');
}
function guideResult(html, me, anchor) {
  if (!me || /rival|your turn/i.test(String(html))) return;
  if (Date.now() - (GD.tapAt || 0) > 2500) return;
  var txt = String(html).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(); if (!txt) return;
  var tapEl = GD.tapEl, tapHex = GD.tapHex;
  var fn = function () {
    var q = anchor && (anchor.charAt(0) === '#' || anchor.charAt(0) === '.' ? $(anchor.slice(1)) || document.querySelector(anchor) : null);
    if (anchor && anchor.indexOf('hex:') === 0) { var h = document.querySelector('#hexes [data-s="' + anchor.slice(4) + '"]'); if (h) return h; }
    if (q && gdVis(q)) return q;
    if (tapEl && tapEl.isConnected && gdVis(tapEl)) return tapEl;
    if (tapHex) { var h2 = document.querySelector('#hexes [data-s="' + tapHex + '"]'); if (h2 && gdVis(h2)) return h2; }
    return $('bCards') && gdVis($('bCards')) ? $('bCards') : null;
  };
  GD.res = { txt: txt.length > 64 ? txt.slice(0, 62) + '…' : txt, fn: fn, until: Date.now() + 3400 };
  guideRefresh();
}
function guideNudge(msg) {
  GD.nudging = true; $('gdT').textContent = msg; $('gdW').textContent = ''; $('gdB').classList.add('nudge');
  clearTimeout(GD.nudgeTm); GD.nudgeTm = setTimeout(function () { GD.nudging = false; guideRefresh(); }, 2600); guidePlace();
}
document.addEventListener('click', function (e) {
  var m = e.target && e.target.closest && e.target.closest('#gdM'); if (!m) return;
  GD.more = !GD.more; guideRefresh();
}, false);
// a tap that is not on the glowing thing gets one nudge line (the tap itself still works)
document.addEventListener('click', function (e) {
  if (!GD.on || !GD.g || !GD.els || !GD.els.length) return;
  var t = e.target; if (!t || !t.closest) return;
  GD.tapAt = Date.now(); GD.tapEl = t.closest('button, [data-s], .cw, [data-r]') || null; GD.tapHex = UI.sel != null ? UI.sel : (t.closest('[data-s]') ? t.closest('[data-s]').getAttribute('data-s') : null);
  if (t.closest('#guide') || t.closest('#gdB') || t.closest('#bmenu')) return;
  var hit = t.closest('button, [data-s], .cw, [data-r], .gx-board'); if (!hit) return;
  if (t.closest('.gx-board') && !t.closest('[data-s]') && !t.closest('button')) return;   // dragging the map is fine
  if (GD.g.sel.some(function (q) { try { return !!t.closest(q); } catch (x) { return false; } }) || GD.els.some(function (el) { return el === t || el.contains(t); })) return;
  guideNudge('Not that one. ' + GD.g.t);
}, true);
(function guideBoot() {
  var go = function () { if (GD.raf) return; GD.raf = requestAnimationFrame(function () { GD.raf = 0; try { guideRefresh(); } catch (e) { } }); };
  ['mb', 'shB', 'shTabs', 'board', 'res', 'bar', 'confirm'].forEach(function (id) { var el = $(id); if (el) new MutationObserver(go).observe(el, { childList: true, subtree: id === 'board' || id === 'bar' }); });
  ['modal', 'sheet', 'confirm'].forEach(function (id) { new MutationObserver(go).observe($(id), { attributes: true, attributeFilter: ['class'] }); });
  setInterval(go, 500); setInterval(function () { try { if (GD.on) guidePlace(); } catch (e) { } }, 120); window.addEventListener('resize', go); document.addEventListener('scroll', function () { if (GD.on) guidePlace(); }, true);
  if (window.ResizeObserver) new ResizeObserver(function () { document.documentElement.style.setProperty('--gd', (document.body.classList.contains('gd') ? $('guide').offsetHeight : 0) + 'px'); }).observe($('guide'));
})();
