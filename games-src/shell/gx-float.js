// gx-float.js: the floating tutorial (owner design, Nov 2026). A draggable lesson window that never dims, never blocks taps and never
// makes one item the only tappable one; a pulse ring marks the suggested target. It begins with a HUD map (labels + leader lines).
// Needs gx-float.css. No dependencies. Docs: shell/GXF.md.
//   GXF.init({game, steps:[{id, title, say, why?, target?:selector|fn, done?:()=>bool, setup?:fn}], hud:[{sel, label, say}], storageKey?, qParent?})
//   GXF.open() GXF.close() GXF.hudMap() GXF.next() GXF.state()   events: window 'gxf' CustomEvent, detail.type = open|close|map|step|complete
(function () {
  'use strict';
  var D = document, C = null, S = null, W = null, M = null, R = null, Q = null, tick = 0, drag = null;
  function $(s) { try { return D.querySelector(s); } catch (e) { return null; } }
  function mk(tag, cls, txt) { var e = D.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; e.setAttribute('data-help', ''); return e; }
  function btn(cls, txt, aria, f) { var b = mk('button', cls, txt); b.type = 'button'; if (aria) b.setAttribute('aria-label', aria); b.onclick = function (ev) { ev.stopPropagation(); f(); }; return b; }
  function emit(type, x) { var d = { type: type, game: C && C.game }; for (var k in x) d[k] = x[k]; var e; try { e = new CustomEvent('gxf', { detail: d }); } catch (er) { e = D.createEvent('CustomEvent'); e.initCustomEvent('gxf', false, false, d); } window.dispatchEvent(e); }
  function vis(e) { if (!e || !e.getBoundingClientRect) return null; var r = e.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return null; if (getComputedStyle(e).visibility === 'hidden') return null; return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height }; }
  function find(t) {
    if (!t) return null; if (typeof t === 'function') { try { return t(); } catch (e) { return null; } }
    var all; try { all = D.querySelectorAll(t); } catch (e) { return null; }
    for (var i = 0; i < all.length; i++) if (vis(all[i])) return all[i]; return null;
  }
  function hit(a, b, m) { m = m || 0; return a.left < b.right + m && a.right + m > b.left && a.top < b.bottom + m && a.bottom + m > b.top; }
  function area(a, b) { var x = Math.min(a.right, b.right) - Math.max(a.left, b.left), y = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top); return x > 0 && y > 0 ? x * y : 0; }
  // ------------------------------------------------------------ remembered state: position, minimised, lesson, ticks
  function key() { return C.storageKey || 'gxf-' + C.game; }
  function load() { var o = null; try { o = JSON.parse(localStorage.getItem(key()) || 'null'); } catch (e) { o = null; } return o && typeof o === 'object' ? o : {}; }
  function save() { try { localStorage.setItem(key(), JSON.stringify({ pos: S.pos, min: S.min, i: S.i, done: S.done, complete: S.complete })); } catch (e) {} }
  function cur() { return C && C.steps[S.i]; }
  function say(st, k) { var v = st && st[k]; if (typeof v === 'function') { try { v = v(); } catch (e) { v = ''; } } return v == null ? '' : String(v); }
  // ------------------------------------------------------------ the ? button
  function qBtn() {
    if (Q && D.body.contains(Q)) return;
    Q = btn('gxf-q', '?', 'Help: screen map and lessons', function () { GXF.hudMap(); });
    var p = (C.qParent && $(C.qParent)) || $('.gx-bar');
    if (p) { Q.className = 'gx-ibtn gxf-q'; p.appendChild(Q); } else { Q.className += ' gxf-qfix'; D.body.appendChild(Q); }
  }
  // ------------------------------------------------------------ HUD map: labels never overlap each other, leader line to each element
  function drawMap() {
    if (M) { M.remove(); M = null; } if (!S.open || !S.map) return;
    var vw = innerWidth, vh = innerHeight, placed = [], items = [], ns = 'http://www.w3.org/2000/svg';
    M = mk('div', 'gxf-map'); D.body.appendChild(M);
    var svg = D.createElementNS(ns, 'svg'); svg.setAttribute('class', 'gxf-lines'); svg.setAttribute('width', vw); svg.setAttribute('height', vh); M.appendChild(svg);
    (C.hud || []).forEach(function (h) { var r = vis(find(h.sel)); if (r) items.push({ h: h, r: r }); });
    function big(r) { return r.width > vw * 0.45 || r.height > vh * 0.35; }
    items.forEach(function (t) {
      var b = btn('gxf-lab', t.h.label, null, function () { S.info = t.h; [].forEach.call(M.querySelectorAll('.gxf-lab'), function (x) { x.classList.toggle('on', x === b); }); render(); emit('info', { sel: t.h.sel }); });
      b.setAttribute('data-sel', t.h.sel); M.appendChild(b);
      var bw = b.offsetWidth, bh = b.offsetHeight, r = t.r, cx = (r.left + r.right) / 2, cy = (r.top + r.bottom) / 2, best = null, pts = [];
      if (big(r)) pts.push([cx - bw / 2, cy - bh / 2], [cx - bw / 2, r.top + 8], [r.left + 8, cy - bh / 2], [cx - bw / 2, r.bottom - bh - 8]);
      for (var d = 8; d <= 260; d += 12) pts.push([cx - bw / 2, r.bottom + d], [cx - bw / 2, r.top - d - bh], [r.left - d - bw, cy - bh / 2], [r.right + d, cy - bh / 2], [r.left - d - bw, r.bottom + d], [r.right + d, r.bottom + d], [r.left - d - bw, r.top - d - bh], [r.right + d, r.top - d - bh]);
      pts.forEach(function (p, i) {
        var x = Math.max(4, Math.min(vw - bw - 4, p[0])), y = Math.max(4, Math.min(vh - bh - 4, p[1])), box = { left: x, top: y, right: x + bw, bottom: y + bh }, sc = i * 0.01;
        placed.forEach(function (q) { if (hit(box, q, 3)) sc += 1000; });
        items.forEach(function (q) { if (q !== t && !big(q.r) && hit(box, q.r)) sc += 40; });
        if (!big(r) && hit(box, r)) sc += 30;
        if (!best || sc < best.sc) best = { sc: sc, box: box };
      });
      placed.push(best.box); b.style.left = best.box.left + 'px'; b.style.top = best.box.top + 'px';
      var lx = best.box.left + bw / 2, ly = best.box.top + bh / 2, ex = Math.max(r.left + 3, Math.min(r.right - 3, lx)), ey = Math.max(r.top + 3, Math.min(r.bottom - 3, ly));
      if (big(r) && ex === lx && ey === ly) ey = Math.min(r.bottom - 3, ly + bh);
      var ln = D.createElementNS(ns, 'line'); ln.setAttribute('x1', lx); ln.setAttribute('y1', ly); ln.setAttribute('x2', ex); ln.setAttribute('y2', ey); svg.appendChild(ln);
      var c = D.createElementNS(ns, 'circle'); c.setAttribute('cx', ex); c.setAttribute('cy', ey); c.setAttribute('r', 4); svg.appendChild(c);
      if (S.info === t.h) b.classList.add('on');
    });
  }
  // ------------------------------------------------------------ the window
  function render() {
    if (!S.open) { if (W) { W.remove(); W = null; } return; }
    if (!W) { W = mk('div', 'gxf-win'); W.setAttribute('role', 'dialog'); W.setAttribute('aria-label', 'Tutorial'); D.body.appendChild(W); wireDrag(); }
    W.innerHTML = ''; W.className = 'gxf-win' + (S.min ? ' min' : '');
    var st = cur(), n = C.steps.length;
    if (S.min) { W.appendChild(btn('gxf-chip', S.map ? 'Screen map' : S.complete ? 'Tutorial done' : 'Lesson ' + (S.i + 1) + ': ' + say(st, 'title'), 'Open tutorial', function () { S.min = S.autoMin = false; save(); render(); })); place(); return; }
    var hd = mk('div', 'gxf-hd'); hd.appendChild(mk('b', null, S.map ? 'Your screen' : S.complete ? 'All lessons done' : (S.i + 1) + '/' + n + ' ' + say(st, 'title')));
    hd.appendChild(mk('span', 'gxf-sp'));
    hd.appendChild(btn('gxf-ib', '–', 'Minimise', function () { S.min = true; save(); render(); }));
    hd.appendChild(btn('gxf-ib', '×', 'Close', function () { GXF.close(); }));
    W.appendChild(hd);
    var ft = mk('div', 'gxf-ft');
    if (S.map) {
      var p = mk('p', 'gxf-say'); if (S.info) { p.appendChild(mk('b', null, S.info.label + ': ')); p.appendChild(D.createTextNode(S.info.say)); } else p.textContent = 'Tap any label to learn what it does. Everything still works while this is open.';
      W.appendChild(p); ft.appendChild(mk('span', 'gxf-sp'));
      ft.appendChild(btn('gxf-btn pri', S.complete ? 'Close map' : 'Start lessons', null, function () { if (S.complete) { GXF.close(); return; } S.map = false; S.info = null; drawMap(); enter(); render(); emit('step', { id: cur().id, i: S.i }); }));
    } else if (S.complete) {
      W.appendChild(mk('p', 'gxf-say', 'You know the basics. Press ? any time to see the screen map again.'));
      ft.appendChild(mk('span', 'gxf-sp')); ft.appendChild(btn('gxf-btn pri', 'Play on', null, function () { GXF.close(); }));
    } else {
      W.appendChild(mk('p', 'gxf-say', say(st, 'say'))); if (say(st, 'why')) W.appendChild(mk('p', 'gxf-why', 'Why: ' + say(st, 'why')));
      var ol = mk('ol', 'gxf-list'); C.steps.forEach(function (x, i) { var li = mk('li', (S.done[x.id] ? 'ok' : '') + (i === S.i ? ' cur' : ''), say(x, 'title')); ol.appendChild(li); }); W.appendChild(ol);
      if (S.i) ft.appendChild(btn('gxf-btn', 'Back', null, function () { S.i--; enter(); save(); render(); emit('step', { id: cur().id, i: S.i }); }));
      ft.appendChild(mk('span', 'gxf-sp')); ft.appendChild(btn('gxf-btn pri', 'Next', null, function () { GXF.next(); }));
    }
    W.appendChild(ft); place();
  }
  function enter() { var st = cur(); if (st && st.setup) { try { st.setup(); } catch (e) {} } }
  function targetRect() { if (!S.open) return null; if (S.map) return S.info ? vis(find(S.info.sel)) : null; if (S.complete) return null; return vis(find(cur().target)); }
  // keep the window off the target (and the map labels); a dragged position is kept unless it would cover the target
  function place() {
    if (!W) return; var vw = innerWidth, vh = innerHeight, bw = W.offsetWidth, bh = W.offsetHeight, t = targetRect(), av = [];
    if (t) av.push([t, 1e6]); if (M) [].forEach.call(M.querySelectorAll('.gxf-lab'), function (b) { av.push([b.getBoundingClientRect(), 400]); });
    function cost(x, y) { var box = { left: x, top: y, right: x + bw, bottom: y + bh }, s = 0; av.forEach(function (a) { var o = area(box, a[0]); if (o || hit(box, a[0], 6) && a[1] > 1e5) s += a[1] + o; }); return s; }
    function clamp(p) { return [Math.max(4, Math.min(vw - bw - 4, p[0])), Math.max(4, Math.min(vh - bh - 4, p[1]))]; }
    if (S.pos) { var q = clamp(S.pos); if (!t || cost(q[0], q[1]) < 1e5) return put(q); }
    var top = 4, bar = $('.gx-bar'); if (bar) { var br = bar.getBoundingClientRect(); if (br.top < 4 && br.height < 90) top = br.bottom + 6; }
    var sp = [[8, vh - bh - 8], [vw - bw - 8, vh - bh - 8], [8, top], [vw - bw - 8, top], [(vw - bw) / 2, vh - bh - 8], [(vw - bw) / 2, top], [8, (vh - bh) / 2], [vw - bw - 8, (vh - bh) / 2]], best = null;
    if (t) sp.push([t.left, t.bottom + 10], [t.left, t.top - bh - 10], [t.right + 10, t.top], [t.left - bw - 10, t.top]);
    sp.forEach(function (p, i) { p = clamp(p); var c = cost(p[0], p[1]) + i * 0.1; if (!best || c < best.c) best = { p: p, c: c }; });
    if (best.c >= 1e5 && !S.min) { S.min = S.autoMin = true; render(); return; }   // nowhere free: fold to a chip
    put(best.p);
  }
  function put(p) { W.style.left = Math.round(p[0]) + 'px'; W.style.top = Math.round(p[1]) + 'px'; }
  function wireDrag() {
    W.addEventListener('pointerdown', function (e) { if (!e.target.closest('.gxf-hd') || e.target.closest('button')) return; var r = W.getBoundingClientRect(); drag = [e.clientX - r.left, e.clientY - r.top, false]; try { W.setPointerCapture(e.pointerId); } catch (x) {} });
    W.addEventListener('pointermove', function (e) { if (!drag) return; drag[2] = true; S.pos = [e.clientX - drag[0], e.clientY - drag[1]]; put(S.pos); });
    W.addEventListener('pointerup', function () { if (drag && drag[2]) { save(); place(); } drag = null; });
  }
  // ------------------------------------------------------------ pulse ring (pointer-events:none, never steals a tap)
  function ring() {
    var t = S.open && !S.map && !S.complete ? vis(find(cur().target)) : null;
    if (!t) { if (R) { R.remove(); R = null; } return; }
    if (!R) { R = mk('div', 'gxf-ring'); D.body.appendChild(R); }
    R.style.left = (t.left - 4) + 'px'; R.style.top = (t.top - 4) + 'px'; R.style.width = (t.width + 8) + 'px'; R.style.height = (t.height + 8) + 'px';
  }
  function loop() {
    if (!S.open) return;
    var st = cur();
    if (!S.map && !S.complete && st && st.done) { var ok = false; try { ok = !!st.done(); } catch (e) {} if (ok) { GXF.next(true); return; } }
    if (S.min && S.autoMin) { var t = targetRect(); if (!t) { S.min = S.autoMin = false; render(); } }
    if (!drag) place(); ring();
  }
  window.GXF = {
    init: function (cfg) {
      C = cfg; var o = load(); S = { open: false, map: true, min: !!o.min, i: Math.min(o.i || 0, cfg.steps.length - 1), done: o.done || {}, complete: !!o.complete, pos: o.pos || null, info: null, autoMin: false };
      qBtn(); if (!tick) { tick = setInterval(loop, 300); addEventListener('resize', function () { if (S && S.open) { drawMap(); render(); } }); }
      return GXF;
    },
    open: function () { if (!C) return; qBtn(); S.open = true; S.map = true; S.info = null; drawMap(); render(); emit('open', {}); emit('map', {}); },
    hudMap: function () { GXF.open(); S.min = false; render(); },
    close: function () { if (!S || !S.open) return; S.open = false; S.info = null; drawMap(); render(); ring(); save(); emit('close', {}); },
    next: function (auto) {
      var st = cur(); if (!st || S.map || S.complete) return; S.done[st.id] = auto ? 'done' : 'next'; if (S.autoMin) S.min = S.autoMin = false;
      if (S.i < C.steps.length - 1) { S.i++; enter(); emit('step', { id: cur().id, i: S.i, prev: st.id, by: auto ? 'done' : 'next' }); }
      else { S.complete = true; emit('complete', { by: auto ? 'done' : 'next' }); }
      save(); render(); ring();
    },
    state: function () {
      if (!S) return null; var st = cur(), wr = W && vis(W), tr = targetRect();
      return { open: S.open, map: S.map, min: S.min, i: S.i, id: st && st.id, done: Object.keys(S.done), complete: S.complete, pos: S.pos,
        win: wr, target: tr, overlap: !!(wr && tr && hit(wr, tr)),
        labels: M ? [].map.call(M.querySelectorAll('.gxf-lab'), function (b) { var r = b.getBoundingClientRect(); return { sel: b.getAttribute('data-sel'), left: r.left, top: r.top, right: r.right, bottom: r.bottom }; }) : [] };
    }
  };
})();
