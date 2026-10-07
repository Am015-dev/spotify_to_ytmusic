// gx-tutor.js: a staged tutorial game for any game (spotlight, one bubble per step, only the target accepts input, steps advance only on the
// right action). Needs gx-tutor.css and gx-help.css (bubble styles). Uses GXV.watch (gx-viewport.js) for relayout when it is loaded. See GX-KIT.md section 10.
//   GXT.start({game:'slug', setup:()=>void, steps:[{id, say:'<=20 words' | ()=>str, title?:'<=4 words', target:()=>el|rect|{x,y}, also?:()=>el|[el],
//              wait:{type:'tap'|'drag'|'event', match:(action)=>bool, times?:n} | null /* null = a Next button */, from?:()=>el /* drag finger start */,
//              ready?:()=>bool, onEnter?:()=>void, onNext?:()=>void, ai?:()=>void|Promise, side?:'top'|'bottom', wrong?:'text'}],
//             onDone:({choice:'play'|'story'})=>void, onExit?:()=>void, endTitle?, endText?, story?:true})
//   GXT.act({type:'tap'|'drag'|'event', ...})   games call it from their input handlers BEFORE applying the action; false = not what this step asks (ignore it)
//   GXT.active() GXT.current() GXT.state() GXT.skip() GXT.stop() GXT.relayout() GXT.lint(steps)
//   GXT.status(game) GXT.menuHTML({game, first, cls, launch}) GXT.isDone(game) GXT.markDone(game) GXT.reset(game)
// Everything the kit draws carries data-help. Progress is remembered per game in localStorage 'gxt-<game>' {done, open, step}.
(function () {
  'use strict';
  var D = document, cfg = null, S = null, wired = false, mem = {}, launchers = {}, dlg = null;
  var DIM = 'rgba(8,4,10,.62)';
  function mk(tag, cls, html) { var e = D.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; e.setAttribute('data-help', ''); return e; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function words(t) { return String(t || '').replace(/[^a-zA-Z0-9'’+]+/g, ' ').trim().split(' ').filter(Boolean).length; }
  // ------------------------------------------------------------------ remembered progress
  function key(g) { return 'gxt-' + g; }
  function load(g) {
    var raw = null; try { raw = localStorage.getItem(key(g)); } catch (e) { raw = mem[g] || null; }
    var o = null; try { o = raw ? JSON.parse(raw) : null; } catch (e) { o = null; }
    return o && typeof o === 'object' ? o : null;
  }
  function save(g, o) { var s = JSON.stringify(o); mem[g] = s; try { localStorage.setItem(key(g), s); } catch (e) {} }
  function status(g) { var o = load(g); return { done: !!(o && o.done), open: !!(o && o.open && !o.done), step: o && o.step || 0, seen: !!o }; }
  function mark(g, patch) { var o = load(g) || {}; for (var k in patch) o[k] = patch[k]; save(g, o); }
  // ------------------------------------------------------------------ geometry
  function vp() { if (window.GXV) { try { var m = GXV.now(); if (m && m.w) return { w: m.w, h: m.h }; } catch (e) {} } return { w: innerWidth, h: innerHeight }; }
  function norm(r) { var o = { left: r.left, top: r.top, width: r.width, height: r.height }; o.right = o.left + o.width; o.bottom = o.top + o.height; o.cx = o.left + o.width / 2; o.cy = o.top + o.height / 2; return o; }
  function toRect(t) {
    try {
      if (typeof t === 'function') t = t(); if (!t) return null;
      if (t.getBoundingClientRect) { if (t.closest && t.closest('[hidden]')) return null; var r = t.getBoundingClientRect(); if (!r.width && !r.height) return null; return norm(r); }
      if (t.left != null && t.top != null) return norm({ left: t.left, top: t.top, width: t.width || 0, height: t.height || 0 });
      if (t.x != null && t.y != null) return norm({ left: t.x - 22, top: t.y - 22, width: 44, height: 44 });
    } catch (e) {}
    return null;
  }
  function holesOf(st) {
    var p = toRect(st.target); if (!p || p.width < 2 || p.height < 2) return null;
    var out = [p], al = null;
    try { al = typeof st.also === 'function' ? st.also() : st.also; } catch (e) {}
    if (al && !Array.isArray(al)) al = [al];
    (al || []).forEach(function (a) { var r = toRect(a); if (r && r.width > 1 && r.height > 1) out.push(r); });
    return out;
  }
  function inflate(r, p, v) {
    var l = Math.max(0, r.left - p), t = Math.max(0, r.top - p), rr = Math.min(v.w, r.right + p), b = Math.min(v.h, r.bottom + p);
    return norm({ left: l, top: t, width: Math.max(1, rr - l), height: Math.max(1, b - t) });
  }
  function hit(a, b) { return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top; }
  function moved(hs, key) {
    if (!key) return true; var a = key.split('|'); if (a.length !== hs.length) return true;
    for (var i = 0; i < hs.length; i++) { var q = a[i].split(',').map(Number), r = hs[i]; if (Math.abs(q[0] - r.left) > 3 || Math.abs(q[1] - r.top) > 3 || Math.abs(q[2] - r.width) > 4 || Math.abs(q[3] - r.height) > 4) return true; }
    return false;
  }
  function rkey(hs) { return hs.map(function (r) { return Math.round(r.left) + ',' + Math.round(r.top) + ',' + Math.round(r.width) + ',' + Math.round(r.height); }).join('|'); }
  function reduced() { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } }
  // ------------------------------------------------------------------ drawing
  function clearVisuals() {
    if (!S) return;
    (S.vis || []).forEach(function (e) { if (e.parentNode) e.parentNode.removeChild(e); }); S.vis = []; S.bub = null; S.holes = null; S.cells = []; S.pill = null;
  }
  function add(e) { D.body.appendChild(e); S.vis.push(e); return e; }
  function cell(l, t, w, h, clear) {
    var c = mk('div', 'gxt-cell' + (clear ? ' gxt-clear' : '')); c.style.cssText = 'left:' + Math.round(l) + 'px;top:' + Math.round(t) + 'px;width:' + Math.round(w) + 'px;height:' + Math.round(h) + 'px';
    c.addEventListener('pointerdown', onBlocked); c.addEventListener('click', swallow); c.addEventListener('touchstart', function (e) { if (e.cancelable) e.preventDefault(); }, { passive: false });
    return c;
  }
  function swallow(e) { e.preventDefault(); e.stopPropagation(); }
  function onBlocked(e) { e.preventDefault(); e.stopPropagation(); wrong(); }
  // everything outside the holes is a dim, input-eating cell (no overlay can be "tapped through"); holes stay live unless the step is a Next step
  function drawCells(hs, shield) {
    var v = vp(), xs = [0, v.w], ys = [0, v.h];
    hs.forEach(function (r) { xs.push(Math.max(0, Math.min(v.w, r.left)), Math.max(0, Math.min(v.w, r.right))); ys.push(Math.max(0, Math.min(v.h, r.top)), Math.max(0, Math.min(v.h, r.bottom))); });
    xs = xs.sort(function (a, b) { return a - b; }).filter(function (x, i, a) { return i === 0 || x - a[i - 1] > 0.5; });
    ys = ys.sort(function (a, b) { return a - b; }).filter(function (x, i, a) { return i === 0 || x - a[i - 1] > 0.5; });
    for (var i = 0; i < xs.length - 1; i++) for (var j = 0; j < ys.length - 1; j++) {
      var cx = (xs[i] + xs[i + 1]) / 2, cy = (ys[j] + ys[j + 1]) / 2, inH = false;
      for (var k = 0; k < hs.length; k++) if (cx > hs[k].left && cx < hs[k].right && cy > hs[k].top && cy < hs[k].bottom) { inH = true; break; }
      if (!inH) add(cell(xs[i], ys[j], xs[i + 1] - xs[i], ys[j + 1] - ys[j], false));
    }
    if (shield) hs.forEach(function (r) { add(cell(r.left, r.top, r.width, r.height, true)); });
  }
  function ring(r, cls) {
    var e = mk('div', 'gxt-ring' + (cls ? ' ' + cls : ''));
    e.style.cssText = 'left:' + Math.round(r.left) + 'px;top:' + Math.round(r.top) + 'px;width:' + Math.round(r.width) + 'px;height:' + Math.round(r.height) + 'px';
    return add(e);
  }
  function finger(fr, tr) {
    var f = mk('div', 'gxt-fin', '<i></i><b></b>'); add(f); f.setAttribute('aria-hidden', 'true');
    f.dataset.tx = Math.round(tr.cx); f.dataset.ty = Math.round(tr.cy); if (fr) { f.dataset.fx = Math.round(fr.cx); f.dataset.fy = Math.round(fr.cy); }
    var a = fr || tr, b = tr, T = function (p, s) { return 'translate(' + Math.round(p.cx) + 'px,' + Math.round(p.cy) + 'px) scale(' + s + ')'; };
    var kf = fr ? [{ transform: T(a, 1.25), opacity: 0 }, { transform: T(a, 1), opacity: 1, offset: .14 }, { transform: T(a, .9), opacity: 1, offset: .28 }, { transform: T(b, .9), opacity: 1, offset: .72 }, { transform: T(b, 1.2), opacity: .9, offset: .86 }, { transform: T(b, 1.4), opacity: 0 }]
      : [{ transform: T(b, 1.3), opacity: 0 }, { transform: T(b, 1), opacity: 1, offset: .3 }, { transform: T(b, .85), opacity: 1, offset: .55 }, { transform: T(b, 1.35), opacity: 0 }];
    f.style.transform = T(b, 1);
    if (!reduced()) { try { f.animate(kf, { duration: fr ? 2300 : 1500, iterations: Infinity, easing: 'ease-in-out' }); } catch (e) {} }
    return f;
  }
  function stepText(st, k) { var v = st[k]; try { if (typeof v === 'function') v = v(); } catch (e) { v = ''; } return v == null ? '' : String(v); }
  function stripH() { var b = D.querySelector('.gx-bar'); if (b) { var r = b.getBoundingClientRect(); if (r.height > 20 && r.height < 80 && r.top < 4) return Math.ceil(r.bottom); } return 34; }
  function topLimit() { return stripH() + 4; }
  // the bubble goes where it covers none of the holes: below or above them, nearest the first (primary) hole
  function place(b, hs, side) {
    var v = vp(), pad = 6, w = b.offsetWidth, h = b.offsetHeight, top = topLimit(), bot = v.h - pad, P = hs[0];
    var T = hs.map(function (r) { return inflate(r, 8, v); });
    var x = Math.max(pad, Math.min(v.w - w - pad, P.cx - w / 2));
    function ok(c) { if (c.top < top - 0.5 || c.bottom > bot + 0.5) return false; for (var i = 0; i < T.length; i++) if (hit(c, T[i])) return false; return true; }
    var hull = { top: Math.min.apply(null, hs.map(function (r) { return r.top; })), bottom: Math.max.apply(null, hs.map(function (r) { return r.bottom; })) };
    var below = { left: x, top: hull.bottom + 12, right: x + w, bottom: hull.bottom + 12 + h }, above = { left: x, top: hull.top - 12 - h, right: x + w, bottom: hull.top - 12 };
    var room = { below: bot - hull.bottom, above: hull.top - top }, order = side === 'top' ? ['above', 'below'] : side === 'bottom' ? ['below', 'above'] : (room.below >= room.above ? ['below', 'above'] : ['above', 'below']);
    var best = null; order.forEach(function (n) { var c = n === 'below' ? below : above; if (!best && ok(c)) best = c; });
    if (!best) {   // scan the whole screen for the free spot nearest the primary hole (any x, so a bubble can sit beside a big target)
      var bs = 1e9, xs = [x, pad, Math.max(pad, v.w - w - pad)];
      for (var xi = 0; xi < xs.length; xi++) for (var y = top; y <= bot - h; y += 4) {
        var c2 = { left: xs[xi], top: y, right: xs[xi] + w, bottom: y + h };
        if (!ok(c2)) continue; var d = Math.abs(c2.left + w / 2 - P.cx) * 0.5 + Math.abs(y + h / 2 - P.cy); if (d < bs) { bs = d; best = c2; }
      }
    }
    if (!best) { var useBelow = room.below >= room.above; var yy = useBelow ? Math.min(bot - h, hull.bottom + 12) : Math.max(top, hull.top - 12 - h); best = { left: x, top: yy, right: x + w, bottom: yy + h }; }
    b.style.left = Math.round(best.left) + 'px'; b.style.top = Math.round(best.top) + 'px';
    var sd = best.bottom <= P.top + 2 ? 'bottom' : best.top >= P.bottom - 2 ? 'top' : best.right <= P.left + 2 ? 'right' : 'left';
    b.className = b.className.replace(/\bgxh-a-\w+/g, '').trim() + ' gxh-a-' + sd;
    var arr = b.querySelector('.gxh-arr');
    if (arr) {
      arr.style.left = arr.style.top = '';
      if (sd === 'top' || sd === 'bottom') arr.style.left = Math.round(Math.max(14, Math.min(w - 26, P.cx - best.left - 6))) + 'px';
      else arr.style.top = Math.round(Math.max(14, Math.min(h - 26, P.cy - best.top - 6))) + 'px';
    }
    b.classList.add('on');
    return best;
  }
  function dots() {
    var n = cfg.steps.length, h = '';
    for (var i = 0; i < n; i++) h += '<i' + (i < S.i ? ' class="done"' : i === S.i ? ' class="on"' : '') + '></i>';
    return '<span class="gxt-dots" role="img" aria-label="Step ' + (S.i + 1) + ' of ' + n + '">' + h + '</span><span class="gxt-n">' + (S.i + 1) + '/' + n + '</span>';
  }
  function topStrip() {
    var t = mk('div', 'gxt-top', '<span class="gxt-prog">' + dots() + '</span><button type="button" class="gxt-skip" data-gxt-skip>Skip tutorial</button>');
    t.style.height = stripH() + 'px'; t.querySelector('.gxt-skip').addEventListener('click', function (e) { e.stopPropagation(); skip(); });
    return t;
  }
  // ------------------------------------------------------------------ one step: wait for it, show it, advance on the right action
  function draw() {   // (re)build the visible pieces for the current step at the current layout
    var st = S.step, hs = holesOf(st); clearVisuals();
    var v = vp();
    if (!hs) { S.phase = 'pend'; S.key = ''; drawWaiting(); return false; }
    var H = hs.map(function (r) { return inflate(r, st.pad != null ? st.pad : 6, v); });
    S.holes = H; S.key = rkey(hs);
    var nextStep = !st.wait;
    drawCells(H, nextStep);
    H.forEach(function (r, i) { ring(r, i ? 'soft' : ''); });
    add(topStrip());
    if (st.wait && st.wait.type !== 'event') {
      var fr = st.wait.type === 'drag' && st.from ? toRect(st.from) : null; finger(fr, H[0]);
    }
    var say = stepText(st, 'say'), title = stepText(st, 'title');
    var b = mk('div', 'gxh-bub gxt-bub' + (nextStep ? '' : ' gxt-nobtn')); b.setAttribute('role', 'status'); b.setAttribute('aria-live', 'polite'); b.dataset.step = st.id || S.i;
    b.innerHTML = '<i class="gxh-arr"></i><div class="gxh-bd"><div>' + (title ? '<div class="gxh-tt">' + esc(title) + '</div>' : '') + '<div class="gxh-tx">' + esc(say) + '</div></div></div>' +
      (nextStep ? '<div class="gxh-row2"><button type="button" class="gxh-ok gxt-next">' + (S.i === cfg.steps.length - 1 ? 'Finish' : 'Next') + '</button></div>' : '');
    add(b); S.bub = b; S.say = say;
    var nb = b.querySelector('.gxt-next'); if (nb) nb.addEventListener('click', function (e) { e.stopPropagation(); next(); });
    place(b, H, st.side);
    return true;
  }
  function drawWaiting() {   // between steps (the game is moving on): nothing to tap, nothing hidden by a dim
    var v = vp(); add(cell(0, 0, v.w, v.h, true)); add(topStrip());
  }
  function enter(i) {
    var st = cfg.steps[i]; if (!st) { finish(); return; }
    S.i = i; S.step = st; S.count = 0; S.phase = 'pend'; S.key = ''; S.stable = 0; S.stable_k = ''; S.since = Date.now(); S.shown = false; S.misses = 0;
    mark(cfg.game, { open: 1, step: i });
    clearVisuals(); drawWaiting();
    try { if (st.onEnter) st.onEnter(); } catch (e) { console.warn('gxt onEnter', e); }
    if (st.ai) { try { var r = st.ai(); if (r && r.then) { S.aiBusy = true; r.then(function () { S.aiBusy = false; }, function () { S.aiBusy = false; }); } } catch (e) { console.warn('gxt ai', e); } }
  }
  function tick() {
    if (!S || S.phase === 'gap' || S.phase === 'end') return;
    var st = S.step; if (!st) return;
    if (S.phase === 'pend') {
      var rdy = !S.aiBusy; try { if (rdy && st.ready) rdy = !!st.ready(); } catch (e) { rdy = false; }
      var hs = rdy ? holesOf(st) : null;
      if (!hs) { S.stable = 0; if (!S.pill && Date.now() - S.since > 900) { S.pill = add(mk('div', 'gxt-pill', esc(st.pending || 'Watch the board'))); S.pill.setAttribute('role', 'status'); } return; }
      if (S.stable_k && !moved(hs, S.stable_k)) S.stable++; else { S.stable_k = rkey(hs); S.stable = 0; }
      if (S.stable >= 2) { S.phase = 'show'; S.stable_k = ''; if (draw()) { S.shown = true; S.shownAt = Date.now(); } }
      return;
    }
    if (S.phase === 'show') {
      var hs2 = holesOf(st);
      if (!hs2) { if (++S.misses >= 3) { S.misses = 0; S.phase = 'pend'; S.stable = 0; S.stable_k = ''; clearVisuals(); drawWaiting(); } return; }
      S.misses = 0;
      if (moved(hs2, S.key)) draw();
    }
  }
  function advance() {
    var st = S.step; S.phase = 'gap'; clearVisuals(); drawWaiting();
    setTimeout(function () { if (!S || S.step !== st) return; try { if (st.onDone) st.onDone(); } catch (e) {} if (S.i + 1 >= cfg.steps.length) finish(); else enter(S.i + 1); }, 0);
  }
  function next() {
    if (!S || S.phase !== 'show' || S.step.wait) return;
    try { if (S.step.onNext) S.step.onNext(); } catch (e) { console.warn('gxt onNext', e); }
    advance();
  }
  var wrongT = 0;
  function wrong() {
    if (!S || S.phase !== 'show' || !S.bub) return;
    var b = S.bub, st = S.step, tx = b.querySelector('.gxh-tx'); if (!tx) return;
    b.classList.remove('gxt-shake'); void b.offsetWidth; b.classList.add('gxt-shake');
    tx.textContent = st.wrong || (st.wait ? 'Tap the glowing one.' : 'Tap Next.');
    clearTimeout(wrongT); wrongT = setTimeout(function () { if (S && S.bub === b && tx) { tx.textContent = S.say; b.classList.remove('gxt-shake'); } }, 1700);
    S.wrongs = (S.wrongs || 0) + 1;
  }
  // the games call this from their input handlers; the return value says whether to go on with the action
  function act(a) {
    if (!S || S.phase === 'end') return true;
    a = a || {};
    if (S.phase !== 'show') return a.type === 'event' ? true : false;
    var st = S.step, w = st.wait;
    if (a.type === 'event') {
      if (w && w.type === 'event' && (!w.match || w.match(a))) { S.count++; if (S.count >= (w.times || 1)) advance(); }
      return true;
    }
    if (!w || w.type === 'event') { wrong(); return false; }
    var okm = true; try { okm = !w.match || !!w.match(a); } catch (e) { okm = false; }
    if (!okm) { wrong(); return false; }
    S.count++;
    if (S.count >= (w.times || 1)) advance(); else { S.phase = 'pend'; S.stable = 0; S.stable_k = ''; S.since = Date.now(); clearVisuals(); drawWaiting(); }
    return true;
  }
  // ------------------------------------------------------------------ end card, skip, stop
  function teardown() {
    if (S) { clearVisuals(); clearInterval(S.timer); }
    S = null; closeDlg();
  }
  function finish() {
    mark(cfg.game, { done: 1, open: 0, step: 0 });
    clearVisuals(); S.phase = 'end';
    var v = vp(); add(cell(0, 0, v.w, v.h, false));
    var story = cfg.story !== false;
    var c = mk('div', 'gxt-end'); c.setAttribute('role', 'dialog'); c.setAttribute('aria-modal', 'true'); c.setAttribute('aria-label', 'Tutorial finished');
    c.innerHTML = '<div class="gxt-endc"><div class="gxt-ek" aria-hidden="true">&#10003;</div><div class="gxt-et">' + esc(cfg.endTitle || 'You know the rules') + '</div><div class="gxt-ex">' + esc(cfg.endText || 'You can start a real game now.') + '</div>' +
      '<div class="gxt-eb"><button type="button" class="gxt-b pri" data-gxt-end="play">Play a real game</button>' + (story ? '<button type="button" class="gxt-b" data-gxt-end="story">Story mode</button>' : '') + '</div></div>';
    add(c);
    c.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('[data-gxt-end]'); if (!b) return;
      var choice = b.dataset.gxtEnd, done = cfg.onDone; teardown();
      try { if (done) done({ choice: choice }); } catch (err) { console.warn('gxt onDone', err); }
    });
  }
  function skip() {
    if (!S) return; var g = cfg.game, ex = cfg.onExit;
    mark(g, { open: 0, step: 0 }); teardown();
    try { if (ex) ex(); } catch (e) { console.warn('gxt onExit', e); }
  }
  function stop() { if (cfg && S) mark(cfg.game, { open: 0, step: 0 }); teardown(); }
  // ------------------------------------------------------------------ start
  function lint(steps) {
    var bad = [];
    (steps || []).forEach(function (s, i) {
      var tag = 'step ' + i + ' (' + (s.id || '?') + ')';
      if (!s.id) bad.push(tag + ': no id');
      if (typeof s.say === 'string' && words(s.say) > 20) bad.push(tag + ': say over 20 words (' + words(s.say) + ')');
      if (typeof s.title === 'string' && words(s.title) > 4) bad.push(tag + ': title over 4 words');
      if (typeof s.target !== 'function' && !(s.target && typeof s.target === 'object')) bad.push(tag + ': no target');
      if (s.wait && s.wait.type !== 'event' && s.wait.type !== 'tap' && s.wait.type !== 'drag') bad.push(tag + ': wait.type must be tap, drag or event');
    });
    return bad;
  }
  function start(c) {
    if (S) teardown();
    cfg = c; cfg.steps = cfg.steps || []; wire();
    var bad = lint(cfg.steps); if (bad.length) console.warn('gxt lint: ' + bad.join('; '));
    mark(cfg.game, { open: 1, step: 0 });
    S = { i: 0, step: null, phase: 'pend', vis: [], cells: [], timer: 0 };
    try { if (cfg.setup) cfg.setup(); } catch (e) { console.error('gxt setup', e); }
    S.timer = setInterval(tick, 100);
    enter(0);
    return GXT;
  }
  function relayout() { if (S && S.phase === 'show') draw(); else if (S && S.phase === 'end') { var e = S.vis[S.vis.length - 1]; if (e) { var v = vp(), c0 = S.vis[0]; if (c0) c0.style.cssText = 'left:0;top:0;width:' + v.w + 'px;height:' + v.h + 'px'; } } else if (S && (S.phase === 'pend' || S.phase === 'gap')) { clearVisuals(); drawWaiting(); } }
  function wire() {
    if (wired) return; wired = true;
    if (window.GXV) GXV.watch(relayout);
    else { var t; var f = function () { clearTimeout(t); t = setTimeout(relayout, 80); setTimeout(relayout, 420); }; addEventListener('resize', f); addEventListener('orientationchange', f); }
    D.addEventListener('click', onMenuClick, true);
  }
  // ------------------------------------------------------------------ menu helper: "New here? Learn in 5 minutes" / "Tutorial" / "Tutorial ✓"
  function label(g, first) {
    var s = status(g);
    if (s.done) return 'Tutorial ✓';
    if (first && !s.open) return 'New here? Learn in 5 minutes';
    return s.open ? 'Tutorial (continue?)' : 'Tutorial';
  }
  function menuHTML(o) {
    o = o || {}; var g = o.game; if (o.launch) launchers[g] = o.launch; wire();
    var s = status(g), first = !!o.first && !s.done && !s.open, cls = (o.cls || '') + ' gxt-menu' + (first ? ' gxt-first' : '') + (s.done ? ' gxt-ok' : '');
    var sub = o.sub === false ? '' : '<span>' + esc(s.done ? 'Done. Tap to play it again.' : first ? '19 short steps, no reading walls' : s.open ? 'Restart or exit' : 'Learn by doing, step by step') + '</span>';
    return '<button type="button" class="' + cls.trim() + '" data-gxt-open="' + esc(g) + '" data-help><b>' + esc(label(g, first)) + '</b>' + sub + '</button>';
  }
  function onMenuClick(e) {
    var b = e.target && e.target.closest && e.target.closest('[data-gxt-open]'); if (!b) return;
    e.preventDefault(); e.stopPropagation();
    var g = b.dataset.gxtOpen, fn = launchers[g]; if (!fn) return;
    if (status(g).open && !S) openDlg(g, fn); else fn();
  }
  function closeDlg() { if (dlg) { if (dlg.parentNode) dlg.parentNode.removeChild(dlg); dlg = null; } }
  function openDlg(g, fn) {
    closeDlg();
    dlg = mk('div', 'gxt-end'); dlg.setAttribute('role', 'dialog'); dlg.setAttribute('aria-modal', 'true'); dlg.setAttribute('aria-label', 'Tutorial in progress');
    dlg.innerHTML = '<div class="gxt-endc"><div class="gxt-et">You left the tutorial half way</div><div class="gxt-ex">Start it again from the first step, or leave it.</div><div class="gxt-eb"><button type="button" class="gxt-b pri" data-gxt-dlg="restart">Restart tutorial</button><button type="button" class="gxt-b" data-gxt-dlg="exit">Exit</button></div></div>';
    D.body.appendChild(dlg);
    dlg.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('[data-gxt-dlg]'); if (!b) return;
      closeDlg(); if (b.dataset.gxtDlg === 'restart') fn(); else { mark(g, { open: 0, step: 0 }); var l = D.querySelectorAll('[data-gxt-open="' + g + '"]'); for (var i = 0; i < l.length; i++) { var bb = l[i].querySelector('b'); if (bb) bb.textContent = label(g, false); } }
    });
  }
  function state() {
    if (!S) return { active: false };
    var st = S.step || {}, hs = S.holes && S.holes[0], b = S.bub && S.bub.getBoundingClientRect();
    return { active: true, phase: S.phase, i: S.i, n: cfg.steps.length, id: st.id, shown: S.phase === 'show' && !!S.bub, wait: st.wait ? st.wait.type : null, times: st.wait && st.wait.times || 1, count: S.count,
      say: S.say || '', title: stepText(st, 'title'), hole: hs ? { left: hs.left, top: hs.top, width: hs.width, height: hs.height, cx: hs.cx, cy: hs.cy } : null,
      holes: (S.holes || []).map(function (r) { return { left: r.left, top: r.top, width: r.width, height: r.height, cx: r.cx, cy: r.cy }; }),
      bubble: b ? { left: b.left, top: b.top, right: b.right, bottom: b.bottom } : null, wrongs: S.wrongs || 0, shownAt: S.shownAt || 0 };
  }
  var GXT = window.GXT = {
    version: 1, start: start, act: act, active: function () { return !!S && S.phase !== 'end'; }, running: function () { return !!S; }, current: function () { return S ? S.step : null; },
    index: function () { return S ? S.i : -1; }, state: state, skip: skip, stop: stop, next: next, relayout: relayout, lint: lint,
    status: status, isDone: function (g) { return status(g).done; }, markDone: function (g) { mark(g, { done: 1, open: 0, step: 0 }); }, reset: function (g) { save(g, {}); try { localStorage.removeItem(key(g)); } catch (e) {} delete mem[g]; },
    menuHTML: menuHTML, label: label
  };
})();
