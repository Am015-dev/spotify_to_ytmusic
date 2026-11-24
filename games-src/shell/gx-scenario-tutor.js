// gx-scenario-tutor.js: scenario tutorials (owner verdict, Nov 2026: tutorials must be GAMES). Each scenario puts the real board in a
// small, stacked position with ONE objective; the player makes real moves and learns the rule from the consequence. A floating
// objective card never dims and never blocks taps. Needs gx-scenario-tutor.css. ES5, no dependencies. Docs: shell/GXST.md.
// (Global is GXST because GXS is already the ?scn= test registry in gx-scenario.js.)
//   GXST.init({game, scenarios:[...], storageKey?, settled?:()=>bool, keepClear?:[selectors], qParent?, phoneSlot?:{after,before,avoid:[selectors]}})   GXST.picker() GXST.start(id) GXST.retry()
//   GXST.next() GXST.hint() GXST.close() GXST.state()      events: window 'gxst' CustomEvent, detail.type =
//   picker | start | hint | win | fail | retry | close
//   scenario: {id, title, rule, goal, setup(), success()->bool, fail()->false|'message', par?, moves?()->n, hints:[nudge, {say, target}],
//              debrief, solve?(api) (tests only)}
(function () {
  'use strict';
  var D = document, C = null, S = null, W = null, R = null, Q = null, tick = 0, drag = null;
  function $(s) { try { return D.querySelector(s); } catch (e) { return null; } }
  function mk(tag, cls, txt) { var e = D.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; e.setAttribute('data-help', ''); return e; }
  function btn(cls, txt, aria, f) { var b = mk('button', cls, txt); b.type = 'button'; if (aria) b.setAttribute('aria-label', aria); b.onclick = function (ev) { ev.stopPropagation(); f(); }; return b; }
  function emit(type, x) { var d = { type: type, game: C && C.game }; for (var k in x) d[k] = x[k]; var e; try { e = new CustomEvent('gxst', { detail: d }); } catch (er) { e = D.createEvent('CustomEvent'); e.initCustomEvent('gxst', false, false, d); } window.dispatchEvent(e); }
  function vis(e) { if (!e || !e.getBoundingClientRect) return null; var r = e.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return null; return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height }; }
  function find(t) { if (!t) return null; if (typeof t === 'function') { try { return t(); } catch (e) { return null; } } var a; try { a = D.querySelectorAll(t); } catch (e) { return null; } for (var i = 0; i < a.length; i++) if (vis(a[i])) return a[i]; return null; }
  function hit(a, b) { return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top; }
  function call(f, d) { if (typeof f !== 'function') return d; try { return f(); } catch (e) { return d; } }
  // ------------------------------------------------------------ progress: best stars per scenario, card position
  function key() { return C.storageKey || 'gxst-' + C.game; }
  function load() { var o = null; try { o = JSON.parse(localStorage.getItem(key()) || 'null'); } catch (e) { } return o && typeof o === 'object' ? o : {}; }
  function save() { try { localStorage.setItem(key(), JSON.stringify({ best: S.best, pos: S.pos })); } catch (e) { } }
  function sc(id) { for (var i = 0; i < C.scenarios.length; i++) if (C.scenarios[i].id === id) return i; return -1; }
  function cur() { return S.i >= 0 ? C.scenarios[S.i] : null; }
  function stars() { var s = cur(), n = 3 - S.hint; if (s && s.par && call(s.moves, 0) > s.par) n--; return Math.max(1, n); }
  function firstOpen() { for (var i = 0; i < C.scenarios.length; i++) if (!S.best[C.scenarios[i].id]) return i; return 0; }
  function txt(v) { return typeof v === 'function' ? call(v, '') : v; }
  function starTxt(n) { var t = ''; for (var i = 0; i < 3; i++) t += i < n ? '★' : '☆'; return t; }
  // ------------------------------------------------------------ Lessons button (reopens the picker)
  function qBtn() {
    if (Q && D.body.contains(Q)) return;
    Q = btn('gxst-q', 'Lessons', 'Lessons: learn by playing', function () { GXST.picker(); });
    var p = (C.qParent && $(C.qParent)) || $('.gx-bar');
    if (p) { Q.className = 'gx-ibtn gxst-q'; p.appendChild(Q); } else { Q.className += ' gxst-qfix'; D.body.appendChild(Q); }
  }
  // ------------------------------------------------------------ the card: picker | play | win | fail
  function render() {
    if (!S.open) { if (W) { W.remove(); W = null; } ring(); return; }
    if (!W) { W = mk('div', 'gxst-card'); W.setAttribute('role', 'dialog'); W.setAttribute('aria-label', 'Lesson'); D.body.appendChild(W); wireDrag(); }
    W.innerHTML = ''; W.className = 'gxst-card gxst-' + S.phase + (S.min ? ' gxst-min' : '');
    var s = cur();
    if (S.min) { W.appendChild(btn('gxst-chip', s && S.phase === 'play' ? s.title + ': ' + txt(s.goal) : 'Lessons', 'Open lesson card', function () { S.min = false; render(); })); place(); return; }
    var hd = mk('div', 'gxst-hd');
    hd.appendChild(mk('b', null, S.phase === 'picker' ? 'Learn by playing' : (S.i + 1) + '/' + C.scenarios.length + ' ' + s.title));
    hd.appendChild(mk('span', 'gxst-sp'));
    hd.appendChild(btn('gxst-ib', '–', 'Minimise', function () { S.min = true; render(); }));
    hd.appendChild(btn('gxst-ib', '×', 'Close', function () { GXST.close(); }));
    W.appendChild(hd);
    var ft = mk('div', 'gxst-ft');
    if (S.phase === 'picker') {
      W.appendChild(mk('p', 'gxst-say', 'Short games on the real board. Each one teaches one rule.'));
      var ol = mk('ol', 'gxst-list');
      C.scenarios.forEach(function (x, i) {
        var li = mk('li'), b = btn('gxst-pick' + (i === firstOpen() ? ' rec' : ''), null, 'Lesson ' + (i + 1) + ': ' + x.title, function () { GXST.start(x.id); });
        b.setAttribute('data-id', x.id); b.appendChild(mk('span', 'gxst-n', String(i + 1))); b.appendChild(mk('span', 'gxst-t', x.title)); b.appendChild(mk('span', 'gxst-st', starTxt(S.best[x.id] || 0)));
        li.appendChild(b); ol.appendChild(li);
      });
      W.appendChild(ol);
    } else if (S.phase === 'play') {
      W.appendChild(mk('p', 'gxst-goal', txt(s.goal)));
      if (S.hint) { var h = s.hints[S.hint - 1]; W.appendChild(mk('p', 'gxst-hint', typeof h === 'string' ? h : h.say)); }
      var hb = btn('gxst-btn gxst-bulb', S.hint ? (S.hint < s.hints.length ? 'Show me' : 'Hint shown') : 'Hint', 'Hint', function () { GXST.hint(); });
      if (S.hint >= s.hints.length) hb.disabled = true;
      ft.appendChild(hb); ft.appendChild(mk('span', 'gxst-sp'));
      ft.appendChild(btn('gxst-btn', 'Restart', null, function () { GXST.retry(); }));
    } else if (S.phase === 'win') {
      W.appendChild(mk('p', 'gxst-stars', starTxt(S.stars)));
      W.appendChild(mk('p', 'gxst-say', s.debrief));
      W.appendChild(mk('p', 'gxst-rule', 'Rule: ' + s.rule));
      ft.appendChild(btn('gxst-btn', 'Retry', null, function () { GXST.retry(); })); ft.appendChild(mk('span', 'gxst-sp'));
      ft.appendChild(btn('gxst-btn pri', S.i < C.scenarios.length - 1 ? 'Next lesson' : 'All lessons', null, function () { GXST.next(); }));
    } else if (S.phase === 'fail') {
      W.appendChild(mk('p', 'gxst-say', 'Not quite.'));
      W.appendChild(mk('p', 'gxst-msg', S.msg));
      ft.appendChild(btn('gxst-btn', 'Lessons', null, function () { GXST.picker(); })); ft.appendChild(mk('span', 'gxst-sp'));
      ft.appendChild(btn('gxst-btn pri', 'Retry', null, function () { GXST.retry(); }));
    }
    if (ft.children.length) W.appendChild(ft);
    place();
  }
  function hintTarget() { var s = cur(); if (!s || S.phase !== 'play' || S.hint < 2) return null; var h = s.hints[S.hint - 1]; return h && typeof h === 'object' ? vis(find(h.target)) : null; }
  // keep the card off the hinted target and the keepClear areas; a dragged position is kept unless it covers the hinted target
  function place() {
    if (!W) return; var vw = innerWidth, vh = innerHeight, bw = W.offsetWidth, bh = W.offsetHeight, t = hintTarget(), av = [];
    (C.keepClear || []).forEach(function (sel) { var a; try { a = D.querySelectorAll(sel); } catch (e) { a = []; } for (var i = 0; i < a.length; i++) { var r = vis(a[i]); if (r) av.push(r); } });
    function clamp(p) { return [Math.max(4, Math.min(vw - bw - 4, p[0])), Math.max(4, Math.min(vh - bh - 4, p[1]))]; }
    function box(p) { return { left: p[0], top: p[1], right: p[0] + bw, bottom: p[1] + bh }; }
    function cost(p) { var b = box(p), c = t && hit(b, t) ? 1e6 : 0; av.forEach(function (r) { var x = Math.min(b.right, r.right) - Math.max(b.left, r.left), y = Math.min(b.bottom, r.bottom) - Math.max(b.top, r.top); if (x > 0 && y > 0) c += x * y; }); return c; }
    if (S.pos && !(S.min && C.phoneSlot && vw < 600)) { var q = clamp(S.pos); if (!(t && hit(box(q), t))) return put(q); }
    var top = 4, bar = $('.gx-bar'); if (bar) { var br = bar.getBoundingClientRect(); if (br.top < 4 && br.height < 90) top = br.bottom + 6; }
    var sp = [[8, top], [vw - bw - 8, top], [vw - bw - 8, vh - bh - 8], [8, vh - bh - 8]];
    av.concat(t ? [t] : []).forEach(function (r) { sp.push([8, r.bottom + 6], [vw - bw - 8, r.bottom + 6], [8, r.top - bh - 6], [r.right + 6, r.top]); });
    var best = null; sp.forEach(function (p, i) { p = clamp(p); var c = cost(p) + i * 0.01; if (!best || c < best.c) best = { p: p, c: c }; });
    if (S.min && C.phoneSlot && vw < 600) {   // phone chip: keep the card's own spot when it is clear (no jump on open); else the chip gets a band just under phoneSlot.after or just above phoneSlot.before, never over phoneSlot.avoid items or the dock
      var ps = C.phoneSlot, an = vis($(ps.after)), bf = vis($(ps.before)), ob = [], cs = [best.p];
      (ps.avoid || []).forEach(function (sel) { var a; try { a = D.querySelectorAll(sel); } catch (e) { a = []; } for (var i = 0; i < a.length; i++) { var r = vis(a[i]); if (r) ob.push(r); } });
      if (an) cs.push([8, an.bottom + 4]); if (bf) cs.push([8, bf.top - bh - 6]);
      var pb = null; cs.forEach(function (c, k) { c = clamp(c); var b = box(c), v = t && hit(b, t) ? 1e6 : 0; ob.forEach(function (r) { if (hit(b, r)) v += 1; }); if (bf && b.bottom > bf.top) v += 1; if (!pb || v < pb.v) pb = { p: c, v: v }; });
      if (pb && pb.v < 1e6) { W.style.left = '8px'; return put(pb.p); }
    }
    var cx = W.style.left ? clamp([parseFloat(W.style.left), parseFloat(W.style.top)]) : null;   // stay where you are unless somewhere is clearly better: a card that jumps while you reach for Retry is worse than a small overlap
    if (cx && cost(cx) <= best.c + 0.5) best = { p: cx, c: 0 };
    put(best.p);
  }
  function put(p) { W.style.left = Math.round(p[0]) + 'px'; W.style.top = Math.round(p[1]) + 'px'; }
  function wireDrag() {
    W.addEventListener('pointerdown', function (e) { if (!e.target.closest('.gxst-hd') || e.target.closest('button')) return; var r = W.getBoundingClientRect(); drag = [e.clientX - r.left, e.clientY - r.top, false]; try { W.setPointerCapture(e.pointerId); } catch (x) { } });
    W.addEventListener('pointermove', function (e) { if (!drag) return; drag[2] = true; S.pos = [e.clientX - drag[0], e.clientY - drag[1]]; put(S.pos); });
    W.addEventListener('pointerup', function () { if (drag && drag[2]) { save(); place(); } drag = null; });
  }
  // ------------------------------------------------------------ the "show me" ring: pointer-events none, never steals a tap
  function ring() {
    var t = S && S.open ? hintTarget() : null;
    if (!t) { if (R) { R.remove(); R = null; } return; }
    if (!R) { R = mk('div', 'gxst-ring'); D.body.appendChild(R); }
    R.style.left = (t.left - 4) + 'px'; R.style.top = (t.top - 4) + 'px'; R.style.width = (t.width + 8) + 'px'; R.style.height = (t.height + 8) + 'px';
  }
  // ------------------------------------------------------------ judge: success / fail only when the game has settled (animations done)
  function loop() {
    if (!S || !S.open) return;
    var s = cur();
    if (S.phase === 'play' && S.live && call(C.settled, true)) {
      if (call(s.success, false)) { S.stars = stars(); if ((S.best[s.id] || 0) < S.stars) S.best[s.id] = S.stars; S.phase = 'win'; S.min = false; save(); render(); emit('win', { id: s.id, stars: S.stars }); return; }
      var f = call(s.fail, false); if (f) { S.phase = 'fail'; S.msg = String(f); S.min = false; render(); emit('fail', { id: s.id, msg: S.msg }); return; }
    }
    if (!drag) place(); ring();
  }
  function begin(i, how) {
    S.i = i; S.phase = 'play'; S.hint = 0; S.msg = ''; S.stars = 0; S.open = true; S.min = false; S.live = false;
    var s = cur(), tok = ++S.tok; render();
    var r = null; try { r = s.setup(); } catch (e) { console.error(e); }
    var go = function () { if (tok === S.tok) { S.live = true; place(); emit(how, { id: s.id, i: i }); } };
    if (r && typeof r.then === 'function') r.then(go, go); else go();
  }
  window.GXST = {
    init: function (cfg) {
      C = cfg; var o = load(); S = { open: false, phase: 'picker', i: -1, hint: 0, best: o.best || {}, pos: o.pos || null, min: false, live: false, tok: 0, msg: '', stars: 0 };
      qBtn(); if (!tick) { tick = setInterval(loop, 250); addEventListener('resize', function () { if (S && S.open) render(); }); }
      return GXST;
    },
    picker: function () { if (!C) return; qBtn(); S.open = true; S.phase = 'picker'; S.min = false; S.tok++; S.live = false; render(); emit('picker', {}); },
    start: function (id) { var i = typeof id === 'number' ? id : sc(id); if (i < 0) return; begin(i, 'start'); },
    retry: function () { if (S.i < 0) return; begin(S.i, 'retry'); },
    next: function () { if (S.i < C.scenarios.length - 1) begin(S.i + 1, 'start'); else GXST.picker(); },
    hint: function () { var s = cur(); if (!s || S.phase !== 'play' || S.hint >= s.hints.length) return; S.hint++; render(); ring(); emit('hint', { id: s.id, level: S.hint }); },
    close: function () { if (!S || !S.open) return; S.open = false; S.live = false; S.tok++; render(); emit('close', {}); },
    active: function () { var s = S && S.open && S.phase !== 'picker' ? cur() : null; return s; },
    state: function () {
      if (!S) return null; var s = cur(), wr = W && vis(W), tr = hintTarget();
      return { open: S.open, phase: S.phase, id: s && S.phase !== 'picker' ? s.id : null, i: S.i, live: S.live, hint: S.hint, stars: S.stars, msg: S.msg,
        best: JSON.parse(JSON.stringify(S.best)), min: S.min, pos: S.pos, card: wr, target: tr, overlap: !!(wr && tr && hit(wr, tr)), count: C.scenarios.length };
    }
  };
})();
