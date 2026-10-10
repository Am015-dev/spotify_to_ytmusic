// gx-help.js: on-demand and first-time help for any game. Coach bubbles (once per phase), a lightbulb (suggested move + rules cards), a tips switch.
// Needs gx-help.css. Uses GXV.watch (gx-viewport.js) for relayout when it is loaded, else its own resize listeners. See GX-KIT.md section 9.
//   GXH.init({game:'slug', steps:{phaseId:{target:()=>el, title:'<=4 words', text:'<=20 words', pic?:svg}}, rules:[{phase?, title, text, pic}], avoid:'css selector', defaultOn:true})
//   GXH.phase(phaseId|null)   call after every render; shows the phase's bubble the first time only
//   GXH.bulb({el?, suggest:()=>({target, from?, why})|null, rulesFor:()=>phaseId})
//   GXH.setEnabled(bool) GXH.enabled() GXH.reset() GXH.rules(phaseId?) GXH.hide() GXH.settingsRow() GXH.settingsHTML()
// Targets may be an element, a function returning an element or {left,top,width,height} or {x,y}. All elements the kit draws carry data-help.
(function () {
  'use strict';
  var D = document, cfg = null, st = { on: true, seen: {} }, cur = null, pend = null, skipUntil = 0, bulbEl = null, bulbOpts = null, rulesEl = null, wired = false, shown = [], mem = '';
  function mk(tag, cls, html) { var e = D.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; e.setAttribute('data-help', ''); return e; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function key() { return 'gxh-' + (cfg && cfg.game || 'game'); }
  function load() {
    var raw = null; try { raw = localStorage.getItem(key()); } catch (e) { raw = mem || null; }
    var o = null; try { o = raw ? JSON.parse(raw) : null; } catch (e) { o = null; }
    st = { on: o && typeof o.on === 'boolean' ? o.on : cfg.defaultOn !== false, seen: (o && o.seen && typeof o.seen === 'object') ? o.seen : {} };
  }
  function save() { var s = JSON.stringify(st); mem = s; try { localStorage.setItem(key(), s); } catch (e) {} }
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
  function hit(a, b) { return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top; }
  function inter(a, b) { return Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) * Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top)); }
  function infl(r, p) { return { left: r.left - p, top: r.top - p, right: r.right + p, bottom: r.bottom + p }; }
  // what a bubble must not cover: the core (the tap spot) of every glowing or recommended thing, so a big glowing region keeps its middle free
  var CORE = 56;   // 56px around the middle of a big glowing thing; when the screen is too cramped for that, 32px (the tap spot itself)
  function core(r, k) { var w = r.width, h = r.height, cx = r.left + w / 2, cy = r.top + h / 2; k = k || CORE; if (w > k + 24) w = k; if (h > k + 24) h = k; return { left: cx - w / 2, top: cy - h / 2, right: cx + w / 2, bottom: cy + h / 2 }; }
  function avoidRects(k) {
    var out = [], v = vp(), sel = (cfg && cfg.avoid) || '.glow,.rglow,.rec,.rrec,.pri';
    var list; try { list = D.querySelectorAll(sel + ',[data-gxh-avoid]'); } catch (e) { list = []; }
    for (var i = 0; i < list.length; i++) {
      var e = list[i]; if (e.closest && (e.closest('[data-help]') || e.closest('[hidden]'))) continue;
      var r = e.getBoundingClientRect(); if (!r.width || !r.height || r.right < 0 || r.bottom < 0 || r.left > v.w || r.top > v.h) continue;
      out.push(infl(core(r, k), k < CORE ? 2 : 4));
    }
    return out;
  }
  function topLimit() { var b = D.querySelector('.gx-bar'); var t = 6; if (b) { var r = b.getBoundingClientRect(); if (r.bottom > 0 && r.bottom < vp().h / 2) t = Math.ceil(r.bottom) + 4; } return typeof cfg.top === 'function' ? cfg.top() : (typeof cfg.top === 'number' ? cfg.top : t); }
  function place(b, tr) {
    var v = vp(), pad = 6, w = b.offsetWidth, h = b.offsetHeight, top = topLimit(), bot = v.h - pad;
    var T = infl(tr, 8), best = null, bs = 1e9, soft = null, ss = 1e9;
    var xs = [Math.max(pad, Math.min(v.w - w - pad, tr.cx - w / 2)), pad, Math.max(pad, v.w - w - pad)];
    var ks = [CORE, 32];
    for (var ki = 0; ki < ks.length && !best; ki++) {
      var av = avoidRects(ks[ki]);
      for (var xi = 0; xi < xs.length; xi++) for (var y = top; y <= bot - h; y += 6) {
        var c = { left: xs[xi], top: y, right: xs[xi] + w, bottom: y + h };
        if (hit(c, T)) continue;
        var ov = 0; for (var k = 0; k < av.length; k++) if (hit(c, av[k])) ov += inter(c, av[k]) || 1;
        var d = Math.abs(c.left + w / 2 - tr.cx) * 0.5 + Math.abs(y + h / 2 - tr.cy);
        if (!ov) { if (d < bs) { bs = d; best = c; } } else { var s2 = ov * 50 + d; if (s2 < ss) { ss = s2; soft = c; } }
      }
    }
    var c2 = best || soft || { left: xs[0], top: top, right: xs[0] + w, bottom: top + h };
    b.style.left = Math.round(c2.left) + 'px'; b.style.top = Math.round(c2.top) + 'px';
    var side = c2.bottom <= tr.top + 2 ? 'bottom' : c2.top >= tr.bottom - 2 ? 'top' : c2.right <= tr.left + 2 ? 'right' : 'left';
    b.className = b.className.replace(/\bgxh-a-\w+/g, '').trim() + ' gxh-a-' + side;
    var arr = b.querySelector('.gxh-arr');
    if (arr) {
      arr.style.left = arr.style.top = '';
      if (side === 'top' || side === 'bottom') arr.style.left = Math.round(Math.max(14, Math.min(w - 26, tr.cx - c2.left - 6))) + 'px';
      else arr.style.top = Math.round(Math.max(14, Math.min(h - 26, tr.cy - c2.top - 6))) + 'px';
    }
    b.classList.add('on');
    return c2;
  }
  function ringAt(r, cls) {
    var e = mk('div', 'gxh-ring' + (cls ? ' ' + cls : '')), p = 4;
    e.style.cssText = 'left:' + Math.round(r.left - p) + 'px;top:' + Math.round(r.top - p) + 'px;width:' + Math.round(r.width + 2 * p) + 'px;height:' + Math.round(r.height + 2 * p) + 'px';
    if (Math.abs(r.width - r.height) < 6 && r.width < 80) e.classList.add('round');
    D.body.appendChild(e); return e;
  }
  function reduced() { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } }
  function fingerAt(fr, tr) {
    var f = mk('div', 'gxh-finger', '<i></i><b></b>'); D.body.appendChild(f);
    f.setAttribute('aria-hidden', 'true'); f.dataset.tx = Math.round(tr.cx); f.dataset.ty = Math.round(tr.cy);
    if (fr) { f.dataset.fx = Math.round(fr.cx); f.dataset.fy = Math.round(fr.cy); }
    var a = fr || tr, b = tr, T = function (p, s) { return 'translate(' + Math.round(p.cx) + 'px,' + Math.round(p.cy) + 'px) scale(' + s + ')'; };
    var kf = fr ? [{ transform: T(a, 1.25), opacity: 0 }, { transform: T(a, 1), opacity: 1, offset: .14 }, { transform: T(a, .9), opacity: 1, offset: .28 }, { transform: T(b, .9), opacity: 1, offset: .72 }, { transform: T(b, 1.2), opacity: .9, offset: .86 }, { transform: T(b, 1.4), opacity: 0 }]
      : [{ transform: T(b, 1.3), opacity: 0 }, { transform: T(b, 1), opacity: 1, offset: .3 }, { transform: T(b, .85), opacity: 1, offset: .55 }, { transform: T(b, 1.35), opacity: 0 }];
    f.style.transform = T(b, 1);
    if (!reduced()) { try { f.animate(kf, { duration: fr ? 2300 : 1500, iterations: Infinity, easing: 'ease-in-out' }); } catch (e) {} }
    return f;
  }
  function picHTML(p) { try { if (typeof p === 'function') p = p(); if (p == null) return ''; return typeof p === 'string' ? p : (p.outerHTML || ''); } catch (e) { return ''; } }
  // ------------------------------------------------------------------ the one current help element
  function clearEls() { if (!cur) return; (cur.els || []).forEach(function (e) { if (e.parentNode) e.parentNode.removeChild(e); }); cur.els = []; }
  function hide() {
    if (cur) { clearEls(); if (bulbEl) bulbEl.classList.remove('lit'); }
    cur = null; D.removeEventListener('pointerdown', onDown, true);
  }
  function arm() { D.removeEventListener('pointerdown', onDown, true); D.addEventListener('pointerdown', onDown, true); }
  function onDown(e) {
    if (rulesEl || !cur) return;
    var t = e.target;
    if (t && t.closest) {
      if (cur.kind === 'bulb' && t.closest('.gxh-link')) return;
      if (bulbEl && bulbEl.contains(t) && cur.kind === 'bulb') skipUntil = Date.now() + 450;
    }
    hide();   // the tap is not swallowed: it still reaches whatever was tapped
  }
  function draw() {   // (re)build the visible pieces for cur at the current layout
    if (!cur) return;
    clearEls();
    var tr = toRect(cur.target); if (!tr) { hide(); return; }
    var fr = cur.from ? toRect(cur.from) : null, els = [];
    if (cur.kind === 'bulb') { if (fr) els.push(ringAt(fr, 'from')); els.push(ringAt(tr)); els.push(fingerAt(fr, tr)); }
    else els.push(ringAt(tr, 'soft'));
    var b = cur.mkBubble(); D.body.appendChild(b); els.push(b); cur.els = els; cur.bub = b;
    place(b, tr);
  }
  // ------------------------------------------------------------------ coach bubbles
  function cancelPend() { if (pend) { clearTimeout(pend.t); pend = null; } }
  function tryShow(id, n) {
    pend = null;
    var step = cfg.steps[id]; if (!step || !st.on || st.seen[id] || cur) return;
    var tr = toRect(step.target);
    if (!tr) { if (n < 8) { pend = { id: id, t: setTimeout(function () { tryShow(id, n + 1); }, 200) }; } return; }
    st.seen[id] = 1; save(); shown.push(id);
    cur = { kind: 'coach', id: id, phase: id, target: step.target, els: [], mkBubble: function () {
      var b = mk('div', 'gxh-bub'); b.setAttribute('role', 'status'); b.dataset.phase = id;
      b.innerHTML = '<i class="gxh-arr"></i><div class="gxh-bd">' + (step.pic ? '<div class="gxh-sp">' + picHTML(step.pic) + '</div>' : '') + '<div><div class="gxh-tt">' + esc(step.title) + '</div><div class="gxh-tx">' + esc(step.text) + '</div></div></div><div class="gxh-row2"><button type="button" class="gxh-ok">Got it</button></div>';
      b.querySelector('.gxh-ok').addEventListener('click', function () { hide(); });
      return b;
    } };
    draw(); arm();
  }
  function phase(id) {
    if (!cfg) return;
    if (id == null) { cancelPend(); if (cur && cur.kind === 'coach') hide(); else if (cur && cur.kind === 'bulb' && cur.phase != null) hide(); return; }
    if (cur) { if (cur.phase != null && cur.phase !== id) hide(); else { if (cur.kind === 'coach') { var tr = toRect(cur.target); if (!tr) hide(); else if (cur.bub) { var k = Math.round(tr.left) + ',' + Math.round(tr.top) + ',' + Math.round(tr.width) + ',' + Math.round(tr.height); if (k !== cur.k) { cur.k = k; draw(); } } } return; } }
    if (pend) { if (pend.id === id) return; cancelPend(); }
    if (!st.on || st.seen[id] || !cfg.steps[id]) return;
    pend = { id: id, t: setTimeout(function () { tryShow(id, 0); }, 280) };
  }
  // ------------------------------------------------------------------ the lightbulb
  var BULB = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.7.6 1.1 1.4 1.1 2.2h5c0-.8.4-1.6 1.1-2.2A6 6 0 0 0 12 3z"/></svg>';
  function bulbOpen() {
    if (!bulbOpts || Date.now() < skipUntil) return;
    hide(); cancelPend();
    var s = null, ph = null;
    try { s = bulbOpts.suggest ? bulbOpts.suggest() : null; } catch (e) { console.warn('gxh suggest', e); }
    try { ph = bulbOpts.rulesFor ? bulbOpts.rulesFor() : null; } catch (e) {}
    if (!s || !s.target || !toRect(s.target)) { rules(ph); return; }
    cur = { kind: 'bulb', phase: ph, target: s.target, from: s.from, sug: s, els: [], mkBubble: function () {
      var b = mk('div', 'gxh-bub gxh-bulbb'); b.setAttribute('role', 'status');
      b.innerHTML = '<i class="gxh-arr"></i><div class="gxh-tx">' + esc(s.why || '') + '</div><div class="gxh-row2"><button type="button" class="gxh-link">How does this work?</button></div>';
      b.querySelector('.gxh-link').addEventListener('click', function () { rules(ph); });
      return b;
    } };
    if (bulbEl) bulbEl.classList.add('lit');
    draw(); arm();
  }
  function bulb(o) {
    if (!cfg) return; bulbOpts = o || {};
    var e = o && o.el; if (typeof e === 'string') e = D.querySelector(e);
    if (!e) { e = mk('button', 'gxh-bulb gxh-float'); e.type = 'button'; D.body.appendChild(e); }
    if (bulbEl && bulbEl !== e) bulbEl.removeEventListener('click', bulbOpen);
    bulbEl = e; e.classList.add('gxh-bulb'); e.setAttribute('data-help', ''); if (!e.getAttribute('aria-label')) e.setAttribute('aria-label', 'Help: suggest a move');
    if (!e.querySelector('svg')) e.insertAdjacentHTML('afterbegin', BULB);
    e.removeEventListener('click', bulbOpen); e.addEventListener('click', bulbOpen);
    return e;
  }
  // ------------------------------------------------------------------ rules cards
  function rulesList(ph) {
    var all = cfg.rules || [], m = function (r) { return r.phase === ph || (Array.isArray(r.phase) && r.phase.indexOf(ph) >= 0); };
    var l = ph != null ? all.filter(m) : []; if (!l.length) l = all.filter(function (r) { return r.phase == null; }); if (!l.length) l = all.slice();
    return l;
  }
  function closeRules() { if (rulesEl) { if (rulesEl.parentNode) rulesEl.parentNode.removeChild(rulesEl); rulesEl = null; D.removeEventListener('keydown', onKey, true); } }
  function onKey(e) { if (!rulesEl) return; if (e.key === 'Escape') closeRules(); else if (e.key === 'ArrowRight') rulesEl._go(1); else if (e.key === 'ArrowLeft') rulesEl._go(-1); }
  function rules(ph) {
    if (!cfg) return; var list = rulesList(ph); hide(); cancelPend(); closeRules(); if (!list.length) return;
    var R = rulesEl = mk('div', 'gxh-rules'); R.setAttribute('role', 'dialog'); R.setAttribute('aria-modal', 'true'); R.setAttribute('aria-label', 'How this works');
    R.innerHTML = '<div class="gxh-card" data-help><button type="button" class="gxh-x" aria-label="Close">×</button><div class="gxh-pic"></div><div class="gxh-rt"></div><div class="gxh-rx"></div><div class="gxh-nav"><button type="button" class="gxh-prev">Back</button><span class="gxh-dots"></span><button type="button" class="gxh-next">Next</button></div></div>';
    var i = 0, q = function (s) { return R.querySelector(s); };
    function show() {
      var c = list[i]; q('.gxh-pic').innerHTML = picHTML(c.pic); q('.gxh-rt').textContent = c.title || ''; q('.gxh-rx').textContent = c.text || '';
      q('.gxh-dots').innerHTML = list.length > 1 ? list.map(function (_, k) { return '<i' + (k === i ? ' class="on"' : '') + '></i>'; }).join('') : '';
      q('.gxh-prev').disabled = i === 0; q('.gxh-prev').style.visibility = list.length > 1 ? 'visible' : 'hidden'; q('.gxh-next').textContent = i === list.length - 1 ? 'Done' : 'Next';
      R.dataset.card = i; R.dataset.count = list.length;
    }
    R._go = function (d) { var n = i + d; if (n >= list.length) { closeRules(); return; } if (n < 0) return; i = n; show(); };
    q('.gxh-x').addEventListener('click', closeRules); q('.gxh-prev').addEventListener('click', function () { R._go(-1); }); q('.gxh-next').addEventListener('click', function () { R._go(1); });
    R.addEventListener('click', function (e) { if (e.target === R) closeRules(); });
    var x0 = null; R.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    R.addEventListener('touchend', function (e) { if (x0 == null) return; var dx = e.changedTouches[0].clientX - x0; x0 = null; if (Math.abs(dx) > 45) R._go(dx < 0 ? 1 : -1); }, { passive: true });
    D.addEventListener('keydown', onKey, true);
    show(); D.body.appendChild(R);
  }
  // ------------------------------------------------------------------ settings: Tips on/off + Reset tips
  function settingsHTML(o) {
    o = o || {}; var rc = o.rowClass || 'gxh-set', sc = o.segClass || '', bc = o.btnClass || '';
    var b = function (a, v, label, pr) { return '<button type="button" class="' + bc + '" data-gxh="' + a + '"' + (v != null ? ' data-v="' + v + '"' : '') + (pr != null ? ' aria-pressed="' + pr + '"' : '') + '>' + label + '</button>'; };
    return '<div class="' + rc + ' gxh-set" data-help><span>Tips</span><span class="' + sc + '" style="display:inline-flex;gap:6px;flex:0 0 auto">' + b('tips', 1, 'On', st.on) + b('tips', 0, 'Off', !st.on) + '</span></div>' +
      '<div class="' + rc + ' gxh-set" data-help><span>Show tips again</span>' + b('reset', null, 'Reset tips') + '</div>';
  }
  function settingsRow(o) { var d = D.createElement('div'); d.setAttribute('data-help', ''); d.innerHTML = settingsHTML(o); return d; }
  function syncSettings() {
    var l = D.querySelectorAll('[data-gxh=tips]');
    for (var i = 0; i < l.length; i++) l[i].setAttribute('aria-pressed', String((l[i].dataset.v === '1') === st.on));
  }
  function onClick(e) {
    var t = e.target && e.target.closest && e.target.closest('[data-gxh]'); if (!t || !cfg) return;
    if (t.dataset.gxh === 'tips') setEnabled(t.dataset.v === '1');
    else if (t.dataset.gxh === 'reset') { reset(); var o = t.textContent; t.textContent = 'Done'; setTimeout(function () { t.textContent = o; }, 1400); }
  }
  function setEnabled(v) { if (!cfg) return; st.on = !!v; save(); if (!st.on) { cancelPend(); if (cur && cur.kind === 'coach') hide(); } syncSettings(); }
  function reset() { if (!cfg) return; st.seen = {}; shown.length = 0; save(); }
  // ------------------------------------------------------------------ relayout
  function relayout() { if (!cfg || !cur || rulesEl) return; draw(); }
  function init(o) {
    cfg = o || {}; cfg.steps = cfg.steps || {}; cfg.rules = cfg.rules || []; load(); hide(); cancelPend(); closeRules();
    if (wired) return GXH; wired = true;
    D.addEventListener('click', onClick, true);
    if (window.GXV) GXV.watch(relayout);
    else { var t; var f = function () { clearTimeout(t); t = setTimeout(relayout, 80); setTimeout(relayout, 420); }; addEventListener('resize', f); addEventListener('orientationchange', f); }
    return GXH;
  }
  var GXH = window.GXH = {
    version: 1, init: init, phase: phase, bulb: bulb, rules: rules, hide: hide, relayout: relayout, setEnabled: setEnabled, reset: reset,
    enabled: function () { return !!st.on; }, seen: function (id) { return !!st.seen[id]; }, settingsHTML: settingsHTML, settingsRow: settingsRow,
    state: function () { return { on: st.on, seen: Object.keys(st.seen), shown: shown.slice(), cur: cur ? { kind: cur.kind, id: cur.id || null, phase: cur.phase } : null, rules: !!rulesEl, pending: pend ? pend.id : null }; }
  };
})();
