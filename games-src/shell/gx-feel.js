// gx-feel.js: the shared FEEL layer (W456). Makes a board game respond to the hand: drag-and-drop with a lifted piece,
// legal spots glowing under the finger, snap on drop and spring back on a bad drop; a pinch / wheel / drag camera for DOM
// boards; flights (deck -> hand, market -> board, points -> score), hops, counters that roll up, a short beat between rounds;
// vibration ticks, tiny synth sounds (quiet by default), keyboard shortcuts. Opt-in: nothing happens until a game calls it.
// Read FEEL.md (same folder) before using it. Depends on nothing; uses GX.pref / GX.animMs / GX.reduced / GX.buzz when the kit is loaded.
//   GXF.drag(cfg)            pointer drag from items to targets (tap still works: no drag starts under the threshold)
//   GXF.camera(vp, content)  pinch / wheel / drag-pan zoom on a DOM board; .glideTo(el), .focus(el, ms), .reset()
//   GXF.fly(from, to, opt)   a piece flies along an arc (Promise);  GXF.hop(el), GXF.pulse(el), GXF.shake(el)
//   GXF.points(from, to, txt) "+3" flies into the score, the score bumps;  GXF.roll(el, to) / GXF.rollAll(root)
//   GXF.beat(title, sub)     a short round-end banner (Promise);  GXF.tick(kind) = sound + vibration for one moment
//   GXF.keys(map)            keyboard shortcuts (ignored while typing or while a drawer is open)
(function (root) {
  'use strict';
  var doc = root.document, F = {};
  root.GXF = F; try { if (root.GX) root.GX.feel = F; } catch (e) { }
  function gx() { return root.GX || null; }
  function pref(k, d) { try { var g = gx(); var v = g && g.pref ? g.pref(k) : undefined; return v == null ? d : v; } catch (e) { return d; } }
  F.reduced = function () { try { var g = gx(); if (g && g.reduced) return g.reduced(); return !!(root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { return false; } };
  F.ms = function (ms) { if (F.off) return 0; try { var g = gx(); if (g && g.animMs) return g.animMs(ms); } catch (e) { } return F.reduced() ? 0 : ms; };
  F.off = false;   // a game sets GXF.off = true for its ?fast test runs: every flight resolves at once
  function rectOf(x) {
    if (!x) return null; if (x.getBoundingClientRect) { var r = x.getBoundingClientRect(); return { left: r.left, top: r.top, width: r.width, height: r.height }; }
    if (x.left != null) return { left: x.left, top: x.top, width: x.width || 0, height: x.height || 0 };
    if (x.x != null) return { left: x.x, top: x.y, width: 0, height: 0 }; return null;
  }
  function cx(r) { return r.left + r.width / 2; } function cy(r) { return r.top + r.height / 2; }
  function layer() { var l = doc.getElementById('gxf-layer'); if (!l) { l = doc.createElement('div'); l.id = 'gxf-layer'; l.setAttribute('aria-hidden', 'true'); doc.body.appendChild(l); } return l; }
  F.layer = layer;
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  F.wait = wait;

  // ------------------------------------------------------------------ vibration + sound
  var BUZ = { pick: 8, hover: 4, drop: 14, deny: [10, 40, 10], score: [12, 30, 18], turn: 20, beat: [18, 60, 24] };
  F.buzz = function (kind) { if (F.reduced() && kind === 'hover') return; var g = gx(), p = BUZ[kind] != null ? BUZ[kind] : kind; try { if (g && g.buzz) return g.buzz(p); if (root.navigator && root.navigator.vibrate) return root.navigator.vibrate(p); } catch (e) { } };
  // tiny synthesized sounds (generated here: no files, no licence), soft by default: 0.35 x master x effects; 'Touch sounds' off silences them
  var AC = null;
  var SFX = {
    pick:  [['sine', 520, 0.04, 0.5], ['sine', 780, 0.05, 0.4]],
    hover: [['sine', 990, 0.025, 0.25]],
    drop:  [['triangle', 300, 0.06, 0.7], ['sine', 450, 0.08, 0.5]],
    deny:  [['triangle', 220, 0.07, 0.5], ['triangle', 165, 0.09, 0.5]],
    flip:  [['triangle', 700, 0.03, 0.35], ['triangle', 900, 0.03, 0.3]],
    hop:   [['sine', 440, 0.04, 0.5], ['sine', 660, 0.06, 0.45]],
    score: [['sine', 660, 0.06, 0.5], ['sine', 880, 0.06, 0.5], ['sine', 1175, 0.12, 0.45]],
    coin:  [['square', 1320, 0.03, 0.12], ['sine', 1760, 0.08, 0.3]],
    beat:  [['sine', 392, 0.12, 0.5], ['sine', 523, 0.12, 0.5], ['sine', 659, 0.25, 0.5]],
    tick:  [['sine', 880, 0.02, 0.3]]
  };
  F.vol = function () { if (pref('tsfx', true) === false) return 0; var m = +pref('master', 1), s = +pref('sfx', 0.8); return 0.35 * (isNaN(m) ? 1 : m) * (isNaN(s) ? 0.8 : s); };
  F.mute = null;   // optional game hook: () => true when the game's own sound switch is off
  F.sfx = function (kind) {
    try {
      if (F.mute && F.mute()) return; var v = F.vol(); if (!v) return; var notes = SFX[kind]; if (!notes) return;
      var C = AC || (AC = new (root.AudioContext || root.webkitAudioContext)()); if (C.state === 'suspended') C.resume();
      var t = C.currentTime + 0.005;
      notes.forEach(function (n) { var o = C.createOscillator(), g = C.createGain(); o.type = n[0]; o.frequency.value = n[1]; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(0.0002, 0.22 * v * n[3]), t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + n[2]); o.connect(g); g.connect(C.destination); o.start(t); o.stop(t + n[2] + 0.02); t += n[2] * 0.75; });
    } catch (e) { }
  };
  F.tick = function (kind) { F.sfx(kind); F.buzz(kind === 'flip' || kind === 'hop' || kind === 'coin' ? 'pick' : kind); };
  // a settings row for the game's Sound section: GX.settings({ sound: S => { GXF.settingsRows(S); ... } })
  F.settingsRows = function (S) {
    var g = gx(); if (!g || !g.row || !g.onoff) return;
    S.appendChild(g.row('Touch sounds', g.onoff(pref('tsfx', true) !== false, function (v) { g.setPref('tsfx', v); if (v) F.sfx('pick'); }, 'Touch sounds'), 'Soft clicks when you pick up, drop and score'));
  };

  // ------------------------------------------------------------------ drag and drop
  // cfg: { items: '.selector' (delegated from document), data(el) -> any|null (null: this item cannot be dragged now),
  //        targets(data, el) -> [{ el, key, ...anything }], drop(data, target, el) -> truthy (accepted) | falsy (spring back),
  //        ghost(el, data) -> Node (default: a clone of el), over(data, target|null), start(data, el), end(data, ok),
  //        threshold (px, default 8; touch 10), axis: 'any' | 'up' (touch: only a mostly-vertical pull starts a drag, so
  //        horizontal swipes still scroll a hand), lift (px the piece floats above a finger, default 28 on touch), radius (px snap) }
  var DRAGS = [], cur = null, swallow = 0;
  F.dragging = function () { return !!(cur && cur.live); };
  F.drag = function (cfg) { cfg = Object.assign({ threshold: 8, axis: 'any', radius: 36 }, cfg); DRAGS.push(cfg); wireDrag(); return { off: function () { var i = DRAGS.indexOf(cfg); if (i >= 0) DRAGS.splice(i, 1); } }; };
  var wired = false;
  function wireDrag() {
    if (wired) return; wired = true;
    doc.addEventListener('pointerdown', down, true);
    doc.addEventListener('pointermove', move, { capture: true, passive: false });
    doc.addEventListener('pointerup', up, true);
    doc.addEventListener('pointercancel', cancel, true);
    doc.addEventListener('click', function (e) { if (swallow && Date.now() < swallow) { e.stopPropagation(); e.preventDefault(); swallow = 0; } }, true);
    doc.addEventListener('touchmove', function (e) { if (cur && cur.live) e.preventDefault(); }, { passive: false });
    doc.addEventListener('dragstart', function (e) { if (e.target && e.target.closest && DRAGS.some(function (d) { return e.target.closest(d.items); })) e.preventDefault(); }, true);
  }
  function down(e) {
    if (cur || (e.button != null && e.button > 0)) return;
    for (var i = DRAGS.length - 1; i >= 0; i--) {
      var d = DRAGS[i], el = e.target && e.target.closest && e.target.closest(d.items); if (!el) continue;
      var data; try { data = d.data(el); } catch (er) { data = null; } if (data == null) return;
      cur = { cfg: d, el: el, data: data, id: e.pointerId, x0: e.clientX, y0: e.clientY, touch: e.pointerType === 'touch' || e.pointerType === 'pen', live: false };
      return;
    }
  }
  function start(e) {
    var c = cur, d = c.cfg, r = c.el.getBoundingClientRect();
    c.live = true; c.r0 = r; c.hov = null;
    if (d.start) try { d.start(c.data, c.el); } catch (er) { }   // before targets: a game may draw its drop spots here
    var tg; try { tg = d.targets(c.data, c.el) || []; } catch (er) { tg = []; }
    c.targets = tg;
    var g; try { g = d.ghost ? d.ghost(c.el, c.data) : null; } catch (er) { g = null; } if (!g) g = c.el.cloneNode(true);
    var w = doc.createElement('div'); w.className = 'gxf-ghost'; w.appendChild(g);
    var sz = null; try { sz = d.size ? d.size(c.el, c.data) : null; } catch (er) { }   // optional {w,h}: the piece at board scale, centred on the finger
    var gw = sz ? sz.w : r.width, gh = sz ? sz.h : r.height, gl = sz ? c.x0 - gw / 2 : r.left, gt = sz ? c.y0 - gh / 2 : r.top;
    w.style.width = gw + 'px'; w.style.height = gh + 'px'; w.style.left = gl + 'px'; w.style.top = gt + 'px';
    layer().appendChild(w); c.ghost = w; c.dx = c.x0 - gl; c.dy = c.y0 - gt; c.r0 = { left: gl, top: gt, width: gw, height: gh }; c.lift = d.lift != null ? d.lift : (c.touch ? 28 : 6);
    requestAnimationFrame(function () { if (c.ghost) c.ghost.classList.add('up'); });
    c.el.classList.add('gxf-src'); doc.documentElement.classList.add('gxf-dragging');
    tg.forEach(function (t) { if (t.el) t.el.classList.add('gxf-ok'); });
    try { c.el.setPointerCapture && c.el.setPointerCapture(c.id); } catch (er) { }
    F.tick('pick');
  }
  function hit(x, y) {
    var c = cur, best = null, bd = 1e9;
    c.targets.forEach(function (t) {
      var r = t.rect ? t.rect() : t.el && t.el.getBoundingClientRect(); if (!r) return;
      if (x >= r.left && x <= r.left + r.width && y >= r.top && y <= r.top + r.height) { var dd = Math.hypot(x - cx(r), y - cy(r)) * 0.5; if (dd < bd) { bd = dd; best = t; } return; }
      var dx = Math.max(r.left - x, 0, x - (r.left + r.width)), dy = Math.max(r.top - y, 0, y - (r.top + r.height)), dist = Math.hypot(dx, dy);
      if (dist < c.cfg.radius && dist + 100 < bd) { bd = dist + 100; best = t; }
    });
    return best;
  }
  function move(e) {
    var c = cur; if (!c || e.pointerId !== c.id) return;
    var dx = e.clientX - c.x0, dy = e.clientY - c.y0;
    if (!c.live) {
      var th = c.cfg.threshold + (c.touch ? 2 : 0); if (Math.abs(dx) + Math.abs(dy) < th) return;
      if (c.touch && c.cfg.axis === 'up' && Math.abs(dx) > Math.abs(dy) * 1.1) { cur = null; return; }   // a sideways swipe: let the list scroll
      start(e);
    }
    e.preventDefault();
    var px = e.clientX, py = e.clientY - c.lift;
    if (c.targets.some(function (t) { return t.el && !t.el.isConnected; })) {   // the game redrew its board mid-drag: find the targets again
      var tg; try { tg = c.cfg.targets(c.data, c.el) || []; } catch (er) { tg = []; }
      c.targets = tg; c.hov = null; tg.forEach(function (t) { if (t.el) t.el.classList.add('gxf-ok'); });
    }
    c.ghost.style.left = (e.clientX - c.dx) + 'px'; c.ghost.style.top = (e.clientY - c.dy - c.lift) + 'px';
    var h = hit(px, py);
    if (h !== c.hov) {
      if (c.hov && c.hov.el) c.hov.el.classList.remove('gxf-hov');
      c.hov = h; if (h && h.el) { h.el.classList.add('gxf-hov'); F.sfx('hover'); F.buzz('hover'); }
      c.ghost.classList.toggle('on', !!h);
      if (c.cfg.over) try { c.cfg.over(c.data, h); } catch (er) { }
    }
    if (c.cfg.edge) try { c.cfg.edge(e.clientX, e.clientY); } catch (er) { }
  }
  function clean(c) {
    c.el.classList.remove('gxf-src'); doc.documentElement.classList.remove('gxf-dragging');
    (c.targets || []).forEach(function (t) { if (t.el) t.el.classList.remove('gxf-ok', 'gxf-hov'); });
  }
  function up(e) {
    var c = cur; if (!c || e.pointerId !== c.id) return; cur = null;
    if (!c.live) return;   // a tap: the game's own click runs
    swallow = Date.now() + 400; e.preventDefault();
    var t = c.hov, ok = false;
    clean(c);
    if (c.cfg.over) try { c.cfg.over(c.data, null); } catch (er) { }
    var g = c.ghost;
    var tr = t ? (t.rect ? t.rect() : t.el.getBoundingClientRect()) : null;   // measure before the game re-renders
    if (t) { try { ok = !!c.cfg.drop(c.data, t, c.el); } catch (er) { console.error(er); ok = false; } }
    if (ok) {
      F.tick('drop');
      var ms = F.ms(170);
      if (!ms) { g.remove(); } else {
        var gr = g.getBoundingClientRect();
        g.classList.add('snap'); g.style.transitionDuration = ms + 'ms';
        g.style.transform = 'translate(' + (cx(tr) - cx(gr)) + 'px,' + (cy(tr) - cy(gr)) + 'px) scale(' + Math.max(0.35, Math.min(1, tr.width / Math.max(1, gr.width))) + ')';
        g.style.opacity = '0.0';
        setTimeout(function () { g.remove(); }, ms + 40);
      }
    } else {
      F.tick('deny');
      var ms2 = F.ms(280);
      if (!ms2) g.remove(); else {
        g.classList.add('back'); g.style.transitionDuration = ms2 + 'ms';
        g.style.left = c.r0.left + 'px'; g.style.top = c.r0.top + 'px'; g.classList.remove('up', 'on');
        setTimeout(function () { g.remove(); F.shake(c.el); }, ms2 + 20);
      }
    }
    if (c.cfg.end) try { c.cfg.end(c.data, ok); } catch (er) { }
  }
  function cancel(e) {
    var c = cur; if (!c || e.pointerId !== c.id) return; cur = null;
    if (!c.live) return; clean(c); if (c.ghost) c.ghost.remove(); if (c.cfg.end) try { c.cfg.end(c.data, false); } catch (er) { }
  }

  // ------------------------------------------------------------------ flights and small motions
  // fly a piece from one place to another along an arc. from/to: element, rect or {x,y}. opt: { node | html, ms, arc (px up), scale (end), cls, spin }
  F.fly = function (from, to, opt) {
    opt = opt || {}; var a = rectOf(from), b = rectOf(to), ms = F.ms(opt.ms || 520);
    if (!a || !b || !ms) return Promise.resolve();
    var w = doc.createElement('div'); w.className = 'gxf-fly' + (opt.cls ? ' ' + opt.cls : '');
    var sw = opt.w || a.width || 40, sh = opt.h || a.height || 40;
    w.style.width = sw + 'px'; w.style.height = sh + 'px'; w.style.left = (cx(a) - sw / 2) + 'px'; w.style.top = (cy(a) - sh / 2) + 'px';
    if (opt.node) w.appendChild(opt.node); else if (opt.html) w.innerHTML = opt.html; else if (from && from.cloneNode) w.appendChild(from.cloneNode(true));
    layer().appendChild(w);
    var dx = cx(b) - cx(a), dy = cy(b) - cy(a), arc = opt.arc != null ? opt.arc : Math.min(140, 40 + Math.hypot(dx, dy) * 0.25), s1 = opt.scale != null ? opt.scale : (b.width && sw ? Math.max(0.3, Math.min(1.6, b.width / sw)) : 1);
    return new Promise(function (res) {
      if (w.animate) {
        var an = w.animate([
          { transform: 'translate(0,0) scale(1) rotate(0deg)', opacity: 1, offset: 0 },
          { transform: 'translate(' + dx * 0.5 + 'px,' + (dy * 0.5 - arc) + 'px) scale(' + (1 + (s1 - 1) * 0.5) * 1.08 + ') rotate(' + (opt.spin || 0) / 2 + 'deg)', opacity: 1, offset: 0.5 },
          { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(' + s1 + ') rotate(' + (opt.spin || 0) + 'deg)', opacity: opt.fade ? 0 : 1, offset: 1 }
        ], { duration: ms, easing: 'cubic-bezier(.45,.05,.35,1)', fill: 'forwards' });
        an.onfinish = function () { w.remove(); res(); }; an.oncancel = function () { w.remove(); res(); };
      } else { setTimeout(function () { w.remove(); res(); }, 0); }
    });
  };
  function cls(el, c, ms) { if (!el || !F.ms(ms)) return; el.classList.remove(c); void el.offsetWidth; el.classList.add(c); setTimeout(function () { el.classList.remove(c); }, F.ms(ms) + 30); }
  F.hop = function (el) { cls(el, 'gxf-hop', 420); };
  F.pulse = function (el) { cls(el, 'gxf-pulse', 600); };
  F.shake = function (el) { cls(el, 'gxf-shake', 320); };
  F.settle = function (el) { cls(el, 'gxf-settle', 360); };
  // "+3" flies from a place into a score element, which bumps; then the number rolls up (if `to` holds a number)
  F.points = function (from, to, txt, opt) {
    opt = opt || {}; var a = rectOf(from), b = rectOf(to); if (!a || !b) return Promise.resolve();
    var n = doc.createElement('span'); n.className = 'gxf-pts' + (opt.neg ? ' neg' : ''); n.textContent = txt;
    return F.fly({ left: cx(a) - 30, top: cy(a) - 16, width: 60, height: 32 }, { left: cx(b) - 30, top: cy(b) - 16, width: 60, height: 32 }, { node: n, ms: opt.ms || 650, arc: 60, scale: 0.7, fade: true, w: 60, h: 32 })
      .then(function () { if (to && to.nodeType) F.pulse(to); if (!opt.neg) F.tick('coin'); });
  };
  // roll a number element from what it showed to a new value
  F.roll = function (el, to, ms) {
    if (!el) return; var from = parseFloat(el.getAttribute('data-gxf-n')); if (isNaN(from)) from = parseFloat(el.textContent) || 0;
    el.setAttribute('data-gxf-n', to); var d = F.ms(ms || 520);
    if (!d || from === to) { el.textContent = to; return; }
    var t0 = performance.now(); el.classList.add('gxf-rolling');
    (function st(n) { var k = Math.min(1, (n - t0) / d), e = 1 - Math.pow(1 - k, 3); el.textContent = Math.round(from + (to - from) * e); if (k < 1) requestAnimationFrame(st); else { el.textContent = to; el.classList.remove('gxf-rolling'); } })(t0);
  };
  // after a render: every element with [data-gxf-roll="key"] that shows a new number rolls up from the last value seen for that key
  var LAST = {};
  F.rollAll = function (rootEl) {
    var els = (rootEl || doc).querySelectorAll('[data-gxf-roll]');
    for (var i = 0; i < els.length; i++) {
      var el = els[i], k = el.getAttribute('data-gxf-roll'), v = parseFloat(el.textContent); if (isNaN(v)) continue;
      if (LAST[k] != null && LAST[k] !== v) { el.setAttribute('data-gxf-n', LAST[k]); el.textContent = LAST[k]; F.roll(el, v); if (v > LAST[k]) F.pulse(el); }
      LAST[k] = v;
    }
  };
  F.rollReset = function () { LAST = {}; };
  // a short beat between rounds: a banner slides in, holds, leaves. Resolves when gone (tap skips).
  F.beat = function (title, sub, ms) {
    var d = F.ms(ms || 1300); F.tick('beat'); if (!d) return Promise.resolve();
    var b = doc.createElement('div'); b.className = 'gxf-beat'; b.setAttribute('role', 'status');
    b.innerHTML = '<b></b>' + (sub ? '<span></span>' : ''); b.firstChild.textContent = title; if (sub) b.lastChild.textContent = sub;
    layer().appendChild(b);
    return new Promise(function (res) {
      var done = false, fin = function () { if (done) return; done = true; b.classList.add('out'); setTimeout(function () { b.remove(); res(); }, 260); };
      b.addEventListener('pointerdown', fin); requestAnimationFrame(function () { b.classList.add('on'); }); setTimeout(fin, d);
    });
  };

  // ------------------------------------------------------------------ camera for DOM boards
  // GXF.camera(viewport, content, opt): transform-based zoom on `content` inside `viewport`.
  //   phone: two-finger pinch zooms, one finger pans only when zoomed in (so normal page scrolling and taps stay);
  //   PC: wheel zooms at the pointer, a mouse drag on empty board pans, double-click toggles 1x / 1.6x.
  //   opt: { min: 1, max: 2.5, ignore: '.selector' (never start a pan here, e.g. draggable cards), onChange(z) }
  //   returns { glideTo(el, z, ms), focus(el, holdMs, z) (glide in, hold, glide back), reset(ms), z(), user() (ms since the player moved it) }
  F.camera = function (vp, content, opt) {
    opt = Object.assign({ min: 1, max: 2.5 }, opt || {});
    var S = { z: 1, x: 0, y: 0 }, pts = {}, st = null, moved = false, lastUser = 0, anim = 0;
    content.classList.add('gxf-cam'); vp.classList.add('gxf-vp');
    function clamp() {
      var W = vp.clientWidth, H = vp.clientHeight, cw = content.offsetWidth, ch = content.offsetHeight;
      S.z = Math.max(opt.min, Math.min(opt.max, S.z));
      var minx = Math.min(0, W - cw * S.z), miny = Math.min(0, H - ch * S.z);
      S.x = Math.max(minx, Math.min(0, S.x)); S.y = Math.max(miny, Math.min(0, S.y));
      if (S.z <= 1.001) { S.x = 0; S.y = 0; }
    }
    function apply() { clamp(); content.style.transform = S.z === 1 && !S.x && !S.y ? '' : 'translate(' + S.x.toFixed(1) + 'px,' + S.y.toFixed(1) + 'px) scale(' + S.z.toFixed(3) + ')'; vp.classList.toggle('gxf-zoomed', S.z > 1.01); if (opt.onChange) try { opt.onChange(S.z); } catch (e) { } }
    function local(e) { var r = vp.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
    function zoomAt(f, px, py) { var z = Math.max(opt.min, Math.min(opt.max, S.z * f)); f = z / S.z; S.x = px - (px - S.x) * f; S.y = py - (py - S.y) * f; S.z = z; apply(); }
    function glide(t, ms) {
      cancelAnimationFrame(anim); var d = F.ms(ms == null ? 420 : ms), f = { z: S.z, x: S.x, y: S.y };
      if (!d) { S.z = t.z; S.x = t.x; S.y = t.y; apply(); return Promise.resolve(); }
      return new Promise(function (res) { var t0 = performance.now(); (function an(n) { var k = Math.min(1, (n - t0) / d), e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; S.z = f.z + (t.z - f.z) * e; S.x = f.x + (t.x - f.x) * e; S.y = f.y + (t.y - f.y) * e; apply(); if (k < 1) anim = requestAnimationFrame(an); else res(); })(t0); });
    }
    function target(el, z) {   // the camera state that centres el at zoom z
      var vr = vp.getBoundingClientRect(), er = el.getBoundingClientRect();
      var ex = (er.left - vr.left - S.x) / S.z + er.width / S.z / 2, ey = (er.top - vr.top - S.y) / S.z + er.height / S.z / 2;
      z = Math.max(opt.min, Math.min(opt.max, z || S.z)); var t = { z: z, x: vp.clientWidth / 2 - ex * z, y: vp.clientHeight / 2 - ey * z };
      var save = { z: S.z, x: S.x, y: S.y }; S.z = t.z; S.x = t.x; S.y = t.y; clamp(); t = { z: S.z, x: S.x, y: S.y }; S.z = save.z; S.x = save.x; S.y = save.y; return t;
    }
    vp.addEventListener('pointerdown', function (e) {
      if (F.dragging()) return;
      if (opt.ignore && e.target.closest && e.target.closest(opt.ignore) && e.pointerType !== 'touch') return;
      pts[e.pointerId] = local(e); moved = false; st = { s: { z: S.z, x: S.x, y: S.y }, p: JSON.parse(JSON.stringify(pts)) };
    });
    vp.addEventListener('pointermove', function (e) {
      if (!(e.pointerId in pts) || !st || F.dragging()) return; pts[e.pointerId] = local(e); var ids = Object.keys(pts);
      if (ids.length >= 2) {
        var p0 = st.p[ids[0]], p1 = st.p[ids[1]]; if (!p0 || !p1) { st = { s: { z: S.z, x: S.x, y: S.y }, p: JSON.parse(JSON.stringify(pts)) }; return; }
        var q0 = pts[ids[0]], q1 = pts[ids[1]], d0 = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) || 1, d1 = Math.hypot(q1[0] - q0[0], q1[1] - q0[1]);
        var z = Math.max(opt.min, Math.min(opt.max, st.s.z * d1 / d0)), mx = (p0[0] + p1[0]) / 2, my = (p0[1] + p1[1]) / 2, nx = (q0[0] + q1[0]) / 2, ny = (q0[1] + q1[1]) / 2;
        S.z = z; S.x = nx - (mx - st.s.x) * z / st.s.z; S.y = ny - (my - st.s.y) * z / st.s.z; apply(); moved = true; lastUser = Date.now(); e.preventDefault(); return;
      }
      var a = st.p[ids[0]], b = pts[ids[0]]; if (!a) return; var dx = b[0] - a[0], dy = b[1] - a[1];
      var canPan = S.z > 1.01 && (e.pointerType === 'touch' || !(opt.ignore && e.target.closest && e.target.closest(opt.ignore)));
      if (!canPan) return;
      if (!moved && Math.abs(dx) + Math.abs(dy) < 8) return; moved = true;
      S.x = st.s.x + dx; S.y = st.s.y + dy; apply(); lastUser = Date.now(); vp.classList.add('gxf-panning');
    });
    function up(e) { if (!(e.pointerId in pts)) return; delete pts[e.pointerId]; vp.classList.remove('gxf-panning'); st = Object.keys(pts).length ? { s: { z: S.z, x: S.x, y: S.y }, p: JSON.parse(JSON.stringify(pts)) } : null; if (moved) { swallow = Date.now() + 300; moved = false; } }
    vp.addEventListener('pointerup', up); vp.addEventListener('pointercancel', up);
    vp.addEventListener('wheel', function (e) { if (F.dragging()) return; if (S.z <= 1.001 && e.deltaY > 0) return; e.preventDefault(); var p = local(e); zoomAt(e.deltaY < 0 ? 1.12 : 1 / 1.12, p[0], p[1]); lastUser = Date.now(); }, { passive: false });
    vp.addEventListener('dblclick', function (e) { if (e.target.closest && e.target.closest('button,[data-a],[role="button"]')) return; var p = local(e); if (S.z > 1.05) glide({ z: 1, x: 0, y: 0 }); else { zoomAt(1.6, p[0], p[1]); } lastUser = Date.now(); });
    var cam = {
      z: function () { return S.z; },
      user: function () { return lastUser ? Date.now() - lastUser : 1e9; },
      glideTo: function (el, z, ms) { if (!el) return Promise.resolve(); return glide(target(el, z), ms); },
      focus: function (el, hold, z) {   // glide in on el, hold, glide back to where the player had it (skipped while the player is zoomed in)
        if (!el || S.z > 1.05 || cam.user() < 4000 || !F.ms(400)) return Promise.resolve();
        var back = { z: S.z, x: S.x, y: S.y };
        return glide(target(el, z || 1.25), 380).then(function () { return wait(F.ms(hold == null ? 500 : hold)); }).then(function () { return glide(back, 380); });
      },
      reset: function (ms) { return glide({ z: 1, x: 0, y: 0 }, ms); },
      zoomBy: function (f) { zoomAt(f, vp.clientWidth / 2, vp.clientHeight / 2); lastUser = Date.now(); },
      apply: apply
    };
    return cam;
  };

  // ------------------------------------------------------------------ keyboard
  // GXF.keys({ '1': fn, 'ArrowLeft': fn, 'Enter': fn, 'z': fn, ... }, { when: () => bool })
  F.keys = function (map, o) {
    o = o || {};
    doc.addEventListener('keydown', function (e) {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      var t = e.target; if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      if (doc.querySelector('.gx-drawer.on, .gx-drawer[aria-hidden="false"], .gx-sheet.on')) { return; }
      if (o.when && !o.when()) return;
      var k = e.key.length === 1 ? e.key.toLowerCase() : e.key, f = map[k] || map[e.key] || (/^[1-9]$/.test(k) && map.digit ? function () { return map.digit(+k); } : null);
      if (!f) return;
      if (k === 'Enter' && t && t.tagName === 'BUTTON' && !o.enterOverButtons) return;   // Enter on a focused button presses that button
      var r = f(e); if (r !== false) { e.preventDefault(); F.sfx('tick'); }
    });
  };
})(typeof window !== 'undefined' ? window : this);
