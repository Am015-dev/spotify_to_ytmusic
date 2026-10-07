// ===== Board-first shell: dock toggle, sheet sizing, closable popups (drawers) =====
const GX={key:'gx',open:null,
  init(o){this.key=o&&o.key||'gx';document.documentElement.classList.add('gx');const app=document.querySelector('.gx-app');this.app=app;
    let min=false;try{min=localStorage.getItem(this.key+'_dockmin')==='1'}catch(e){}if(min)app.classList.add('gx-dock-min');
    if(!document.querySelector('.gx-scrim')){const s=document.createElement('div');s.className='gx-scrim';s.addEventListener('click',()=>this.close());document.body.appendChild(s);this.scrim=s}
    document.addEventListener('click',e=>{const t=e.target.closest('[data-gx]');if(!t)return;const a=t.dataset.gx;
      if(a==='dock')this.toggleDock();else if(a==='sheet')this.cycleSheet();else if(a==='close')this.close();else this.toggle(a)});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&this.open){this.close();e.stopImmediatePropagation()}},true);
    // resize hook for boards
    const b=document.querySelector('.gx-board');if(b&&window.ResizeObserver)new ResizeObserver(()=>{for(const f of this._rs)try{f(b.clientWidth,b.clientHeight)}catch(e){}}).observe(b)},
  // a drawer is modal: the page behind it is inert and hidden from assistive tech, so nothing under the sheet is a live tap target
  bg(on){const a=this.app;if(!a)return;if(on){a.setAttribute('aria-hidden','true');a.inert=true}else{a.removeAttribute('aria-hidden');a.inert=false}},
  _rs:[],onResize(f){this._rs.push(f)},
  boardSize(){const b=document.querySelector('.gx-board');return b?{w:b.clientWidth,h:b.clientHeight}:{w:innerWidth,h:innerHeight}},
  toggleDock(force){const min=force!=null?!force:!this.app.classList.contains('gx-dock-min');this.app.classList.toggle('gx-dock-min',min);this.app.classList.remove('gx-sheet-full');try{localStorage.setItem(this.key+'_dockmin',min?'1':'0')}catch(e){}},
  // phone sheet: min -> normal -> full -> min
  cycleSheet(){const a=this.app;if(a.classList.contains('gx-dock-min')){this.toggleDock(true)}else if(!a.classList.contains('gx-sheet-full'))a.classList.add('gx-sheet-full');else{a.classList.remove('gx-sheet-full');this.toggleDock(false)}},
  showDock(){if(this.app&&this.app.classList.contains('gx-dock-min'))this.toggleDock(true)},
  toggle(id){if(this.open===id)this.close();else this.show(id)},
  show(id){const d=document.getElementById(id);if(!d)return;if(this.open&&this.open!==id){const o=document.getElementById(this.open);if(o)o.classList.remove('on')}
    this.open=id;d.classList.add('on');this.scrim&&this.scrim.classList.add('on');this.bg(true);this._back=document.activeElement;
    for(const b of document.querySelectorAll('[data-gx="'+id+'"]'))b.setAttribute('aria-expanded','true');
    const f=d.querySelector('.gx-x');if(f)f.focus({preventScroll:true});if(this.onShow)this.onShow(id)},
  close(){if(!this.open)return;const id=this.open;const d=document.getElementById(this.open);if(d)d.classList.remove('on');for(const b of document.querySelectorAll('[data-gx="'+this.open+'"]'))b.setAttribute('aria-expanded','false');this.open=null;this.bg(false);this.scrim&&this.scrim.classList.remove('on');if(this._back&&this._back.focus)this._back.focus({preventScroll:true});if(this.onClose)this.onClose(id)},
  // build a drawer shell around a body element: <div class=gx-drawer id><head><h2>title</h2><button.gx-x></head><body/></div>
  drawer(id,title,bodyEl,wide){let d=document.getElementById(id);if(!d){d=document.createElement('section');d.id=id;d.className='gx-drawer'+(wide?' wide':'');d.setAttribute('role','dialog');d.setAttribute('aria-label',title);
      d.innerHTML=`<div class="gx-drawer-head"><h2></h2><button class="gx-x" data-gx="close" aria-label="Close">×</button></div><div class="gx-drawer-body"></div>`;document.body.appendChild(d)}
    d.querySelector('h2').textContent=title;if(bodyEl){const b=d.querySelector('.gx-drawer-body');if(bodyEl.parentNode!==b){b.innerHTML='';b.appendChild(bodyEl)}}return d}};

// gx-viewport.js: one debounced relayout for every game. GXV.watch(fn) calls fn(size) when the visible size or safe-area key changes.
// Fed by resize, orientationchange, visualViewport resize, ResizeObserver(documentElement) and pageshow; re-measures at 120 and 420 ms
// (iOS reports the old size for a moment after a rotation). Size comes from a fixed full-screen probe, not innerWidth/innerHeight.
(function () {
  var fns = [], key = '', t1 = 0, t2 = 0, t3 = 0, probe = null;
  function mk() {
    if (probe || !document.body) return probe;
    probe = document.createElement('div');
    probe.setAttribute('aria-hidden', 'true');
    probe.style.cssText = 'position:fixed;left:0;top:0;width:100vw;height:100%;visibility:hidden;pointer-events:none;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);box-sizing:border-box;z-index:-1';
    document.body.appendChild(probe); return probe;
  }
  function measure() {
    var p = mk(), w = innerWidth, h = innerHeight, s = '';
    if (p) { w = p.offsetWidth || w; h = p.offsetHeight || h; var cs = getComputedStyle(p); s = cs.paddingTop + cs.paddingRight + cs.paddingBottom + cs.paddingLeft; }
    return { w: w, h: h, safe: s, key: w + 'x' + h + '|' + s };
  }
  function run(force) {
    var m = measure(); if (!force && m.key === key) return; key = m.key;
    fns.forEach(function (f) { try { f(m); } catch (e) { console.error(e); } });
  }
  function kick() { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); t1 = setTimeout(function () { run(); }, 40); t2 = setTimeout(function () { run(); }, 120); t3 = setTimeout(function () { run(); }, 420); }
  var wired = false;
  function wire() {
    if (wired) return; wired = true;
    addEventListener('resize', kick); addEventListener('orientationchange', kick); addEventListener('pageshow', kick);
    if (window.visualViewport) visualViewport.addEventListener('resize', kick);
    if (window.ResizeObserver) new ResizeObserver(kick).observe(document.documentElement);
  }
  window.GXV = { watch: function (fn) { fns.push(fn); wire(); run(true); return fn; }, now: measure, poke: function () { run(true); } };
})();

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

// ===== GX campaign: story chapters, bosses and gradual difficulty (opt-in; see CAMPAIGN.md) =====
// A new, self-contained module: it does not change shell.js or gx-kit.js, and works with or without them.
//   GXC.init(opts)        wire a game: {game, data, startChapter, isWon, metrics, starsEarned, portrait, artBase, onExit, scores, seats}
//   GXC.open()            the chapter map (the title's "Story" button)
//   GXC.play(id)          intro scene -> boss card -> opts.startChapter(effective chapter)
//   GXC.finish(G, over)   on game over: store stars, GNS.result({mode:'campaign'}), result screen, outro, back to the map
//   GXC.scene / bossCard / result      the single screens (Promises), used by the flow and by the demo
//   GXC.active() · progress() · unlocked() · reset() · close() · validate(data)
// Progress lives in localStorage['gns-campaign-<game>'] and every access is wrapped in try/catch.
(function (root) {
  'use strict';
  var GXC = {};
  var doc = root && root.document;
  var LS = {
    json: function (k, d) { try { var v = JSON.parse(root.localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } },
    put: function (k, v) { try { root.localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } },
    del: function (k) { try { root.localStorage.removeItem(k); } catch (e) { } }
  };
  var LEVELS = ['easy', 'normal', 'hard'];
  var O = null, D = null, P = null, CUR = null, OV = null, BUSY = false;

  // ------------------------------------------------------------------ validation (node-safe)
  var GOALS = ['win', 'score', 'margin', 'before-round', 'survive', 'mission', 'custom'];
  var UNLOCKS = ['portrait', 'cardback', 'title', 'act', 'table', 'chapter'];
  function lineText(l) { return typeof l === 'string' ? l : l && l.text; }
  GXC.validate = function (data) {
    var bad = [], add = function (m) { bad.push(m); };
    if (!data || typeof data !== 'object') return ['no data'];
    ['game', 'title'].forEach(function (k) { if (!data[k]) add('missing ' + k); });
    var cast = data.cast || {}, twists = {}, ids = {};
    (data.twists || []).forEach(function (t) { if (!t.id || !t.how) add('twist without id/how'); twists[t.id] = t; });
    if (!data.acts || data.acts.length !== 3) add('needs 3 acts');
    var ch = data.chapters || [];
    if (ch.length < 9 || ch.length > 10) add('needs 9 or 10 chapters (has ' + ch.length + ')');
    ch.forEach(function (c, i) {
      var at = 'chapter ' + (c.id || i) + ': ';
      if (!c.id) add(at + 'no id'); else if (ids[c.id]) add(at + 'duplicate id'); ids[c.id] = 1;
      if ([1, 2, 3].indexOf(c.act) < 0) add(at + 'act must be 1-3');
      if (i && c.act < ch[i - 1].act) add(at + 'acts out of order');
      if (!c.title) add(at + 'no title');
      var intro = c.intro || [], outro = c.outro || [];
      if (intro.length < 2 || intro.length > 4) add(at + 'intro needs 2-4 lines');
      if (outro.length < 1 || outro.length > 3) add(at + 'outro needs 1-3 lines');
      intro.concat(outro).forEach(function (l) {
        var t = lineText(l); if (!t) add(at + 'empty line'); else if (t.length > 110) add(at + 'line over 110 chars: ' + t.slice(0, 30) + '…');
        if (l && l.who && l.who !== 'opponent' && l.who !== 'narrator' && !cast[l.who]) add(at + 'unknown speaker ' + l.who);
      });
      var op = c.opponent || {};
      ['name', 'personality', 'aiLevel'].forEach(function (k) { if (op[k] == null || op[k] === '') add(at + 'opponent.' + k + ' missing'); });
      if (c.boss && (!op.taunt || !op.praise)) add(at + 'boss needs taunt and praise');
      if (!c.goal || GOALS.indexOf(c.goal.type) < 0 || !c.goal.text) add(at + 'goal needs a known type and text');
      if (!c.stars || c.stars.length !== 3) add(at + 'needs exactly 3 stars');
      else c.stars.forEach(function (s) { if (!s.text || !s.test) add(at + 'star needs text and test'); });
      if (c.twist) { if (!twists[c.twist.id]) add(at + 'twist ' + c.twist.id + ' not in the twists menu'); if (!c.twist.text) add(at + 'twist needs text'); }
      if (c.act === 3 && c.boss && !c.twist) add(at + 'act 3 boss needs a twist');
      if (c.act === 1 && c.hints !== true) add(at + 'act 1 needs hints:true');
      if (!c.easier) add(at + 'no easier block');
      (c.unlock || []).forEach(function (u) { if (UNLOCKS.indexOf(u.type) < 0) add(at + 'unknown unlock type ' + u.type); if (!u.text) add(at + 'unlock needs text'); });
      if (!c.setup || typeof c.setup !== 'object') add(at + 'setup must be an object');
    });
    [1, 2, 3].forEach(function (a) {
      var inAct = ch.filter(function (c) { return c.act === a; });
      if (!inAct.length) return add('act ' + a + ' has no chapters');
      if (!inAct[inAct.length - 1].boss) add('act ' + a + ' must end with a boss');
      if (inAct[0].boss) add('act ' + a + ' starts with a boss');
    });
    try { JSON.parse(JSON.stringify(data)); } catch (e) { add('not JSON-safe'); }
    return bad;
  };

  // ------------------------------------------------------------------ progress
  function key() { return 'gns-campaign-' + (O && O.game || 'game'); }
  function load() { var p = LS.json(key(), null); if (!p || p.v !== 1) p = { v: 1, ch: {}, unlocked: [], last: null }; p.ch = p.ch || {}; p.unlocked = p.unlocked || []; return p; }
  function save() { LS.put(key(), P); }
  function rec(id) { return P.ch[id] || (P.ch[id] = { beaten: false, stars: 0, best: null, tries: 0, losses: 0, easy: false }); }
  function chapters() { return (D && D.chapters) || []; }
  function byId(id) { var c = chapters(); for (var i = 0; i < c.length; i++) if (c[i].id === id) return c[i]; return null; }
  function isOpen(c) {
    var list = chapters(), i = list.indexOf(c);
    if (c.requires && c.requires.length) return c.requires.every(function (r) { return P.ch[r] && P.ch[r].beaten; });
    return i <= 0 || !!(P.ch[list[i - 1].id] && P.ch[list[i - 1].id].beaten);
  }
  GXC.progress = function () { return JSON.parse(JSON.stringify(P || load())); };
  GXC.unlocked = function () {
    var out = [];
    chapters().forEach(function (c) { if (P.ch[c.id] && P.ch[c.id].beaten) (c.unlock || []).forEach(function (u) { out.push({ type: u.type, id: u.id, text: u.text, from: c.id }); }); });
    return out;
  };
  GXC.reset = function () { LS.del(key()); P = load(); if (OV) GXC.open(); };
  GXC.active = function () { return CUR; };

  // effective chapter: the "make it a bit easier" offer drops one AI level and the twist, at most 2 stars
  function resolve(c, easy) {
    var d = JSON.parse(JSON.stringify(c));
    d.easy = !!easy; d.maxStars = 3;
    if (easy) {
      var e = c.easier || {}, lv = LEVELS.indexOf(c.opponent.aiLevel);
      d.opponent.aiLevel = e.aiLevel || (lv > 0 ? LEVELS[lv - 1] : c.opponent.aiLevel);
      d.twist = 'twist' in e ? e.twist : null;
      if (e.setup) for (var k in e.setup) d.setup[k] = e.setup[k];
      if (e.hints != null) d.hints = e.hints; else d.hints = true;
      d.maxStars = e.maxStars || 2;
    }
    return d;
  }
  GXC.resolve = resolve;

  // ------------------------------------------------------------------ small DOM helpers
  function el(tag, cls, txt) { var e = doc.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function btn(cls, txt, on) { var b = el('button', cls, txt); b.type = 'button'; if (on) b.addEventListener('click', on); return b; }
  function overlay() {
    if (!OV) {
      OV = el('div', 'gxc'); OV.setAttribute('role', 'dialog'); OV.setAttribute('aria-modal', 'true');
      doc.body.appendChild(OV);
      doc.addEventListener('keydown', function (e) { if (OV && OV.parentNode && e.key === 'Escape') { var x = OV.querySelector('[data-gxc-esc]'); if (x) x.click(); } });
    }
    OV.hidden = false;
    return OV;
  }
  function screen(cls) { var o = overlay(); o.innerHTML = ''; o.className = 'gxc ' + (cls || ''); var s = el('div', 'gxc-screen'); o.appendChild(s); return s; }
  GXC.close = function () { if (OV) { OV.hidden = true; OV.innerHTML = ''; } };
  function castOf(who, def) {
    if (who === 'opponent' && def) return { name: def.opponent.name, portrait: def.opponent.portrait, emoji: def.opponent.emoji, color: def.opponent.color };
    if (who && D && D.cast && D.cast[who]) return D.cast[who];
    if (def && def.opponent && def.opponent.cast === who) return { name: def.opponent.name, portrait: def.opponent.portrait, emoji: def.opponent.emoji };
    return { name: who === 'narrator' || !who ? '' : who, emoji: '📜' };
  }
  // portrait: the game's own hook first, then <img> from artBase (falls back to the emoji), then the emoji badge
  function portrait(who, size, def) {
    var c = castOf(who, def), box = el('div', 'gxc-pt');
    box.style.setProperty('--gxc-pt', size + 'px');
    if (c.color) box.style.setProperty('--gxc-ptc', c.color);
    var emo = function () { box.innerHTML = ''; box.appendChild(el('span', 'gxc-pt-e', c.emoji || (c.name ? c.name.charAt(0) : '?'))); };
    var got = null;
    try { if (O && O.portrait) got = O.portrait(who, size, c); } catch (e) { got = null; }
    if (got && got.nodeType) { box.appendChild(got); return box; }
    var src = typeof got === 'string' ? got : (O && O.artBase && c.portrait ? O.artBase + c.portrait : null);
    if (src) { var im = el('img'); im.alt = ''; im.src = src; im.onerror = emo; box.appendChild(im); } else emo();
    return box;
  }
  function starRow(n, max, total) {
    var r = el('div', 'gxc-stars'); r.setAttribute('aria-label', n + ' of ' + (total || 3) + ' stars');
    for (var i = 0; i < (total || 3); i++) r.appendChild(el('i', 'gxc-st' + (i < n ? ' on' : '') + (max != null && i >= max ? ' cap' : ''), '★'));
    return r;
  }
  // twist text without its 'Boss rule:' prefix (the label shows it), first letter upper-case
  function ruleText(t) { t = String(t || '').replace(/^(Boss|Special) rule:\s*/i, ''); return t.charAt(0).toUpperCase() + t.slice(1); }
  function easierText(def) { return ((def.easier && def.easier.text) || 'the computer plays one level gentler and any special rule is off').replace(/[.\s]+$/, ''); }
  function toast(t) {
    var o = overlay(), x = el('div', 'gxc-toast', t); o.appendChild(x);
    setTimeout(function () { if (x.parentNode) x.parentNode.removeChild(x); }, 2200);
  }

  // ------------------------------------------------------------------ the chapter map
  GXC.open = function () {
    if (!D) return;
    P = load(); CUR = null;
    var s = screen('gxc-map-on'), list = chapters();
    var head = el('div', 'gxc-head');
    var back = btn('gxc-ib', '‹ Back', function () { GXC.close(); if (O.onExit) O.onExit(); }); back.setAttribute('data-gxc-esc', '');
    head.appendChild(back);
    var tt = el('div', 'gxc-htitle'); tt.appendChild(el('b', null, D.title || 'Story')); head.appendChild(tt);
    var got = 0; list.forEach(function (c) { got += (P.ch[c.id] && P.ch[c.id].stars) || 0; });
    var sc = btn('gxc-ib gxc-score', '★ ' + got + '/' + list.length * 3, function () { rewards(); });
    sc.setAttribute('aria-label', got + ' stars of ' + list.length * 3 + '. Show rewards'); head.appendChild(sc);
    s.appendChild(head);
    var map = el('div', 'gxc-map'), path = el('div', 'gxc-path');
    map.appendChild(path); s.appendChild(map);
    // nodes zigzag down a winding road; each act gets a banner and its own tint
    var X = [50, 78, 50, 22], rows = [], y = 0, ROW = 74, BAN = 46, nextOpen = null;
    list.forEach(function (c, i) {
      if (!i || c.act !== list[i - 1].act) {
        var a = (D.acts || []).filter(function (x) { return x.act === c.act; })[0] || { title: 'Act ' + c.act };
        rows.push({ banner: a, y: y }); y += BAN;
      }
      rows.push({ c: c, y: y, x: X[i % 4] }); y += ROW;
      if (!nextOpen && isOpen(c) && !(P.ch[c.id] && P.ch[c.id].beaten)) nextOpen = c;
    });
    var H = y + 20; path.style.height = H + 'px';
    var pts = rows.filter(function (r) { return r.c; });
    // the painted road: an SVG in percent units for x, px for y (viewBox stretched horizontally only)
    var svgNS = 'http://www.w3.org/2000/svg', svg = doc.createElementNS(svgNS, 'svg');
    svg.setAttribute('class', 'gxc-road'); svg.setAttribute('viewBox', '0 0 100 ' + H); svg.setAttribute('preserveAspectRatio', 'none');
    svg.style.height = H + 'px';
    var d = '';
    pts.forEach(function (p, i) {
      var cy = p.y + 30;
      if (!i) d = 'M' + p.x + ' ' + cy; else { var q = pts[i - 1], qy = q.y + 30, my = (qy + cy) / 2; d += ' C' + q.x + ' ' + my + ' ' + p.x + ' ' + my + ' ' + p.x + ' ' + cy; }
    });
    ['gxc-road-edge', 'gxc-road-fill', 'gxc-road-dash'].forEach(function (k) { var pa = doc.createElementNS(svgNS, 'path'); pa.setAttribute('d', d); pa.setAttribute('class', k); pa.setAttribute('vector-effect', 'non-scaling-stroke'); svg.appendChild(pa); });
    path.appendChild(svg);
    rows.forEach(function (r) {
      if (r.banner) {
        var b = el('div', 'gxc-act'); b.style.top = r.y + 'px';
        b.appendChild(el('b', null, 'Act ' + (r.banner.act || '') + ' · ' + (r.banner.title || '')));
        if (r.banner.blurb) b.appendChild(el('small', null, r.banner.blurb));
        path.appendChild(b); return;
      }
      var c = r.c, st = P.ch[c.id] || {}, open = isOpen(c), beaten = !!st.beaten;
      var n = btn('gxc-node a' + c.act + (c.boss ? ' boss' : '') + (beaten ? ' won' : open ? ' open' : ' locked') + (c === nextOpen ? ' next' : ''), null, function () { sheet(c); });
      n.style.top = r.y + 'px'; n.style.left = r.x + '%';
      n.setAttribute('aria-label', 'Chapter ' + (list.indexOf(c) + 1) + ': ' + c.title + (c.boss ? ' (boss)' : '') + (beaten ? ', beaten, ' + (st.stars || 0) + ' stars' : open ? ', open' : ', locked'));
      var disc = el('span', 'gxc-disc', c.boss ? '' : String(list.indexOf(c) + 1));
      if (c.boss) disc.appendChild(portrait(c.opponent.cast || 'opponent', 40, c));
      if (!open) disc.appendChild(el('i', 'gxc-lock', '🔒'));
      n.appendChild(disc);
      if (beaten) n.appendChild(starRow(st.stars || 0, null, 3));
      var lab = el('span', 'gxc-lab', c.title); n.appendChild(lab);
      if (r.x > 60) n.classList.add('lab-l');
      path.appendChild(n);
    });
    // bring the next open chapter into view
    if (nextOpen) setTimeout(function () { var t = rows.filter(function (r) { return r.c === nextOpen; })[0]; if (t) map.scrollTop = Math.max(0, t.y - map.clientHeight / 2 + 40); }, 0);
  };

  function rewards() {
    var o = overlay(), sh = el('div', 'gxc-sheet'), u = GXC.unlocked();
    var close = function () { if (sh.parentNode) sh.parentNode.removeChild(sh); };
    sh.appendChild(el('h3', null, 'Rewards'));
    if (!u.length) sh.appendChild(el('p', 'gxc-dim', 'Beat chapters to unlock portraits, card backs, titles and new acts.'));
    var ul = el('ul', 'gxc-rw');
    u.forEach(function (x) { var li = el('li'); li.appendChild(el('span', 'gxc-tag', x.type)); li.appendChild(el('span', null, x.text)); ul.appendChild(li); });
    sh.appendChild(ul);
    var b = btn('gxc-btn', 'Close', close); b.setAttribute('data-gxc-esc', ''); sh.appendChild(b);
    o.appendChild(sh); b.focus();
  }

  // the chapter's detail sheet: goal, opponent, stars, Play (and the easier offer after 2 losses)
  function sheet(c) {
    var o = overlay(), old = o.querySelector('.gxc-sheet'); if (old) old.parentNode.removeChild(old);
    if (!isOpen(c)) { var i = chapters().indexOf(c); toast('Beat chapter ' + i + ' first.'); return; }
    var st = rec(c.id), sh = el('div', 'gxc-sheet a' + c.act);
    var close = function () { if (sh.parentNode) sh.parentNode.removeChild(sh); };
    var top = el('div', 'gxc-sh-top');
    top.appendChild(portrait(c.opponent.cast || 'opponent', 64, c));
    var t = el('div', 'gxc-sh-t');
    t.appendChild(el('small', null, 'Act ' + c.act + ' · Chapter ' + (chapters().indexOf(c) + 1) + (c.boss ? ' · Boss' : '')));
    t.appendChild(el('h3', null, c.title));
    t.appendChild(el('div', 'gxc-dim', (c.boss ? 'Boss: ' : 'Opponent: ') + c.opponent.name));
    top.appendChild(t); sh.appendChild(top);
    var g = el('div', 'gxc-goal'); g.appendChild(el('b', null, 'Goal')); g.appendChild(el('span', null, c.goal.text)); sh.appendChild(g);
    if (c.twist) { var tw = el('div', 'gxc-twist'); tw.appendChild(el('b', null, c.boss ? 'Boss rule' : 'Special rule')); tw.appendChild(el('span', null, ruleText(c.twist.text))); sh.appendChild(tw); }
    var sl = el('ul', 'gxc-slist');
    c.stars.forEach(function (s, i) { var li = el('li', i < (st.stars || 0) ? 'on' : ''); li.appendChild(el('i', null, '★')); li.appendChild(el('span', null, s.text)); sl.appendChild(li); });
    sh.appendChild(sl);
    var row = el('div', 'gxc-row');
    var x = btn('gxc-btn ghost', 'Close', close); x.setAttribute('data-gxc-esc', ''); row.appendChild(x);
    if (st.losses >= 2 && !st.beaten) row.appendChild(btn('gxc-btn ghost', 'Make it a bit easier', function () { GXC.play(c.id, { easy: true }); }));
    var go = btn('gxc-btn go', st.beaten ? 'Play again' : 'Play', function () { GXC.play(c.id); }); row.appendChild(go);
    sh.appendChild(row);
    if (st.losses >= 2 && !st.beaten) sh.appendChild(el('p', 'gxc-dim gxc-small', 'Easier: ' + easierText(c) + ' (up to 2 stars).'));
    o.appendChild(sh); go.focus();
  }

  // ------------------------------------------------------------------ story scene (2-4 lines, always skippable)
  GXC.scene = function (lines, opts) {
    opts = opts || {};
    return new Promise(function (done) {
      lines = (lines || []).filter(function (l) { return lineText(l); });
      if (!lines.length || !doc) return done();
      var s = screen('gxc-scene-on'), i = 0, def = opts.def;
      var box = el('div', 'gxc-scene');
      if (opts.title) box.appendChild(el('div', 'gxc-sc-title', opts.title));
      var who = el('div', 'gxc-sc-who'), name = el('div', 'gxc-sc-name'), txt = el('p', 'gxc-sc-text');
      txt.setAttribute('aria-live', 'polite');
      var dots = el('div', 'gxc-dots');
      lines.forEach(function () { dots.appendChild(el('i')); });
      var row = el('div', 'gxc-row');
      var finish = function () { done(); };
      var skip = btn('gxc-btn ghost', 'Skip', finish); skip.setAttribute('data-gxc-esc', '');
      var next = btn('gxc-btn go', 'Next', function () { i++; if (i >= lines.length) finish(); else show(); });
      row.appendChild(skip); row.appendChild(next);
      box.appendChild(who); box.appendChild(name); box.appendChild(txt); box.appendChild(dots); box.appendChild(row);
      s.appendChild(box);
      txt.addEventListener('click', function () { next.click(); });
      function show() {
        var l = lines[i], w = typeof l === 'string' ? (opts.who || 'narrator') : (l.who || 'narrator'), c = castOf(w, def);
        who.innerHTML = ''; who.appendChild(portrait(w, 112, def));
        name.textContent = c.name || '';
        txt.textContent = lineText(l);
        for (var k = 0; k < dots.children.length; k++) dots.children[k].className = k === i ? 'on' : k < i ? 'was' : '';
        next.textContent = i === lines.length - 1 ? (opts.last || 'Continue') : 'Next';
        txt.classList.remove('in'); void txt.offsetWidth; txt.classList.add('in');
        next.focus();
      }
      show();
    });
  };

  // ------------------------------------------------------------------ boss intro card
  GXC.bossCard = function (def) {
    return new Promise(function (done) {
      if (!doc) return done(true);
      var s = screen('gxc-boss-on a' + def.act), op = def.opponent, card = el('div', 'gxc-boss');
      card.appendChild(el('div', 'gxc-boss-tag', def.boss ? 'Boss' : 'Rival'));
      card.appendChild(portrait(op.cast || 'opponent', 148, def));
      card.appendChild(el('h2', null, op.name));
      card.appendChild(el('p', 'gxc-boss-pers', op.personality));
      if (def.twist && def.twist.text) {
        var tw = el('div', 'gxc-twist big');
        tw.appendChild(el('b', null, def.boss ? 'Boss rule' : 'Special rule'));
        tw.appendChild(el('span', null, ruleText(def.twist.text)));
        card.appendChild(tw);
      }
      var g = el('div', 'gxc-goal'); g.appendChild(el('b', null, 'Your goal')); g.appendChild(el('span', null, def.goal.text)); card.appendChild(g);
      var lv = el('div', 'gxc-dim gxc-small', 'Computer: ' + op.aiLevel + (op.aiStyle ? ' · ' + op.aiStyle : '') + (def.easy ? ' · made easier' : ''));
      card.appendChild(lv);
      var row = el('div', 'gxc-row');
      var back = btn('gxc-btn ghost', 'Back', function () { done(false); }); back.setAttribute('data-gxc-esc', '');
      var go = btn('gxc-btn go', 'Fight', function () { done(true); });
      row.appendChild(back); row.appendChild(go); card.appendChild(row);
      s.appendChild(card); go.focus();
    });
  };

  // ------------------------------------------------------------------ play a chapter
  GXC.play = function (id, opt) {
    if (BUSY) return;
    var c = byId(id); if (!c || !isOpen(c)) return;
    BUSY = true;
    var def = resolve(c, opt && opt.easy);
    var st = rec(c.id); st.tries++; P.last = c.id; save();
    GXC.scene(c.intro, { def: def, title: c.title, last: c.boss || def.twist ? 'Meet ' + (c.boss ? 'the boss' : 'your rival') : 'Start' }).then(function () {
      return c.boss || def.twist ? GXC.bossCard(def) : true;
    }).then(function (go) {
      BUSY = false;
      if (!go) { GXC.open(); return; }
      CUR = def; GXC.close();
      try { O.startChapter(def); } catch (e) { CUR = null; GXC.open(); throw e; }
    }, function () { BUSY = false; });
  };

  // ------------------------------------------------------------------ stars and game over
  function testOne(t, m) {
    if (!t || !m) return false;
    var v = m[t.k], op = t.op || (t.v == null ? 'truthy' : '>=');
    switch (op) {
      case '>=': return v >= t.v; case '>': return v > t.v; case '<=': return v <= t.v; case '<': return v < t.v;
      case '==': case '=': return v === t.v; case '!=': return v !== t.v; default: return !!v;
    }
  }
  GXC.testStar = testOne;
  function countStars(G, def, won) {
    if (!won) return 0;
    var n = 0;
    if (O.starsEarned) { try { n = O.starsEarned(G, def) | 0; } catch (e) { n = 1; } }
    else {
      var m = {}; try { m = O.metrics ? O.metrics(G) || {} : {}; } catch (e) { }
      if (m.won == null) m.won = won;
      n = 1; // the first star is the chapter's goal, already met by winning
      for (var i = 1; i < def.stars.length; i++) if (testOne(def.stars[i].test, m)) n++;
    }
    return Math.max(1, Math.min(n, def.maxStars || 3, 3));
  }

  // over: optional {won, stars} to override the game's callbacks (e.g. a resign counts as a loss)
  GXC.finish = function (G, over) {
    var def = CUR; if (!def) return Promise.resolve(null);
    over = over || {};
    var won = over.won != null ? !!over.won : (function () { try { return !!O.isWon(G, def); } catch (e) { return false; } })();
    var stars = over.stars != null ? Math.min(over.stars, def.maxStars || 3) : countStars(G, def, won);
    var st = rec(def.id), first = won && !st.beaten;
    if (won) { st.beaten = true; st.stars = Math.max(st.stars || 0, stars); if (def.easy) st.easy = true; st.losses = 0; }
    else st.losses = (st.losses || 0) + 1;
    var unl = first ? (byId(def.id).unlock || []) : [];
    unl.forEach(function (u) { var k = u.type + ':' + (u.id || u.text); if (P.unlocked.indexOf(k) < 0) P.unlocked.push(k); });
    var list = chapters(), i = list.indexOf(byId(def.id)), nxt = list[i + 1];
    if (first && nxt && nxt.act !== def.act) unl = unl.concat([{ type: 'act', text: 'Act ' + nxt.act + ' opens' }]);
    save();
    if (root.GNS && root.GNS.result) {
      try {
        root.GNS.result({ game: O.game, mode: 'campaign', level: def.opponent.aiLevel, won: won, winner: won ? 0 : 1,
          seats: O.seats ? O.seats(G) : [{ name: 'You', me: true }, { name: def.opponent.name, ai: def.opponent.aiLevel }],
          scores: O.scores ? O.scores(G) : null, turns: over.turns || 0, ms: over.ms || 0,
          extra: { chapter: def.id, stars: won ? stars : 0, easy: !!def.easy, boss: !!def.boss } });
      } catch (e) { }
    }
    CUR = null;
    var res = { won: won, stars: won ? stars : 0, def: def, unlocks: unl, losses: st.losses, best: st.stars, first: first };
    return GXC.result(res).then(function (pick) {
      if (pick === 'retry') { GXC.play(def.id); return res; }
      if (pick === 'easier') { GXC.play(def.id, { easy: true }); return res; }
      if (pick === 'next' && nxt) { GXC.play(nxt.id); return res; }
      return (won ? GXC.scene(def.outro, { def: def, title: def.title, last: 'Back to the map' }) : Promise.resolve()).then(function () { GXC.open(); return res; });
    });
  };

  // result screen: stars, the boss's taunt or praise, unlocks, and the easier offer after 2 losses
  GXC.result = function (r) {
    return new Promise(function (done) {
      if (!doc) return done('map');
      var def = r.def, s = screen('gxc-res-on ' + (r.won ? 'won' : 'lost')), box = el('div', 'gxc-res');
      box.appendChild(el('div', 'gxc-res-k', def.title));
      box.appendChild(el('h2', null, r.won ? (def.boss ? 'Boss defeated!' : 'Chapter won!') : (def.goal.type === 'mission' || def.goal.type === 'survive' ? 'Mission failed' : 'Not this time')));
      var sr = starRow(r.stars, def.maxStars, 3); sr.classList.add('big'); box.appendChild(sr);
      if (r.won && def.easy) box.appendChild(el('div', 'gxc-dim gxc-small', 'Easier mode: up to ' + def.maxStars + ' stars. Play it normally for 3.'));
      var sl = el('ul', 'gxc-slist');
      def.stars.forEach(function (st, i) { var li = el('li', i < r.stars ? 'on' : ''); li.appendChild(el('i', null, '★')); li.appendChild(el('span', null, st.text)); sl.appendChild(li); });
      box.appendChild(sl);
      var op = def.opponent, line = r.won ? op.praise : op.taunt;
      if (line) {
        var q = el('div', 'gxc-quote');
        q.appendChild(portrait(op.cast || 'opponent', 52, def));
        var qt = el('div'); qt.appendChild(el('b', null, op.name)); qt.appendChild(el('p', null, '“' + line + '”')); q.appendChild(qt);
        box.appendChild(q);
      }
      if (r.unlocks && r.unlocks.length) {
        var ul = el('div', 'gxc-unl'); ul.appendChild(el('b', null, 'Unlocked'));
        r.unlocks.forEach(function (u) { var x = el('div', 'gxc-unl-i'); x.appendChild(el('span', 'gxc-tag', u.type)); x.appendChild(el('span', null, u.text)); ul.appendChild(x); });
        box.appendChild(ul);
      }
      var row = el('div', 'gxc-row wrap');
      var m = btn('gxc-btn ghost', 'Map', function () { done('map'); }); m.setAttribute('data-gxc-esc', ''); row.appendChild(m);
      row.appendChild(btn('gxc-btn ' + (r.won ? 'ghost' : 'go'), r.won ? 'Replay' : 'Try again', function () { done('retry'); }));
      if (!r.won && r.losses >= 2) row.appendChild(btn('gxc-btn soft', 'Make it a bit easier', function () { done('easier'); }));
      if (r.won) row.appendChild(btn('gxc-btn go', 'Continue', function () { done('continue'); }));
      box.appendChild(row);
      if (!r.won && r.losses >= 2) box.appendChild(el('p', 'gxc-dim gxc-small', 'Easier: ' + easierText(def) + ' (up to 2 stars).'));
      s.appendChild(box);
      var f = row.querySelector('.go') || m; f.focus();
    });
  };

  // ------------------------------------------------------------------ init
  GXC.init = function (opts) {
    O = opts || {}; D = O.data || null; P = load();
    if (!O.startChapter) O.startChapter = function () { };
    if (!O.isWon) O.isWon = function () { return false; };
    return GXC;
  };
  GXC.data = function () { return D; };

  if (root && root.document) root.GXC = GXC;
  if (typeof module !== 'undefined' && module.exports) module.exports = GXC;
})(typeof window !== 'undefined' ? window : this);

window.CAMPAIGN={
  "game": "sands",
  "title": "The Empty Throne of Qamar",
  "version": 1,
  "cast": {
    "hadiya": {
      "name": "Old Hadiya",
      "portrait": "camp-hadiya.webp",
      "emoji": "🧓",
      "color": "#b0702a"
    },
    "you": {
      "name": "You",
      "portrait": "camp-you.webp",
      "emoji": "🐪",
      "color": "#2b2b2b"
    },
    "farid": {
      "name": "Farid the Water-Boy",
      "portrait": "camp-farid.webp",
      "emoji": "🧒",
      "color": "#4f8fbf"
    },
    "layla": {
      "name": "Layla Coin-Counter",
      "portrait": "camp-layla.webp",
      "emoji": "🪙",
      "color": "#c9a227"
    },
    "yusra": {
      "name": "Yusra of the Copper Scales",
      "portrait": "camp-yusra.webp",
      "emoji": "⚖️",
      "color": "#b5532c"
    },
    "tahir": {
      "name": "Master Tahir",
      "portrait": "camp-tahir.webp",
      "emoji": "🔨",
      "color": "#7a4fa0"
    },
    "sabah": {
      "name": "Sabah the Silk-Seller",
      "portrait": "camp-sabah.webp",
      "emoji": "🧣",
      "color": "#c2457a"
    },
    "marwan": {
      "name": "Grand Advisor Marwan",
      "portrait": "camp-marwan.webp",
      "emoji": "📜",
      "color": "#2f5f8f"
    },
    "zubaida": {
      "name": "Zubaida of the Lamp",
      "portrait": "camp-zubaida.webp",
      "emoji": "🪔",
      "color": "#d08a1e"
    },
    "qays": {
      "name": "Qays and Kamil",
      "portrait": "camp-qays.webp",
      "emoji": "👬",
      "color": "#4c7a3a"
    },
    "nimr": {
      "name": "Nimr of the Night Roads",
      "portrait": "camp-nimr.webp",
      "emoji": "🗡️",
      "color": "#3a3a52"
    },
    "qadira": {
      "name": "Qadira the Uncrowned",
      "portrait": "camp-qadira.webp",
      "emoji": "👑",
      "color": "#6a2c70"
    }
  },
  "acts": [
    {
      "act": 1,
      "title": "The Empty Throne",
      "blurb": "The old Sultan is dead. Learn to lead the tribes across the sands."
    },
    {
      "act": 2,
      "title": "The Bazaar Wars",
      "blurb": "Crafters, cutpurses and wonder cities: the sultanate grows crowded."
    },
    {
      "act": 3,
      "title": "Night of the Djinns",
      "blurb": "The strongest claimants play to win. Only one will take the throne."
    }
  ],
  "twists": [
    {
      "id": "head-start",
      "where": "setup",
      "how": "Right after newGame(), add param coins to the human seat: G.pl[0].coins += param (a gift, shown on the card as 'Gift: ...')."
    },
    {
      "id": "boss-purse",
      "where": "setup",
      "how": "Right after newGame(), add param coins to the boss seat: G.pl[bossSeat].coins += param."
    },
    {
      "id": "boss-goods",
      "where": "setup",
      "how": "Right after newGame(), shift param cards off G.rdeck into the boss seat (a 'fakir' card does p.fk++, any other card is pushed to p.res), then call refillMarket()."
    },
    {
      "id": "boss-djinn",
      "where": "setup",
      "how": "Right after newGame(), take the djinn key param out of G.djDeck (or out of G.djRow, then refillDjinns()) and push it to the boss seat's p.dj. If the twist has a coins field, the boss seat also gets that many coins."
    },
    {
      "id": "short-road",
      "where": "setup",
      "how": "Right after newGame(), set every seat's p.camels = Math.max(4, p.camels - param), so the normal last-camel end trigger fires sooner."
    },
    {
      "id": "boss-favour",
      "where": "ai",
      "how": "In ai.js evalOutcome(p,o), when p is the boss seat and o.c === param (a tribe key such as 'vizier' or 'assassin'), add 6 to v before returning."
    }
  ],
  "chapters": [
    {
      "boss": false,
      "twist": {
        "id": "head-start",
        "param": 25,
        "text": "Gift: Old Hadiya lends you 25 extra coins to start, and coins are points."
      },
      "hints": true,
      "id": "c1",
      "act": 1,
      "title": "The First Caravan",
      "intro": [
        {
          "who": "hadiya",
          "text": "The Sultan of Qamar is dead, and he named no heir. Every family is reaching for the throne."
        },
        {
          "who": "hadiya",
          "text": "Lift the people off one tile and walk them across the sands, one left on each tile you pass."
        },
        {
          "who": "hadiya",
          "text": "Where the last one stops, take that tribe. Empty the tile and your camel claims it."
        },
        {
          "who": "farid",
          "text": "I'm only here to carry the water! Go easy on me."
        }
      ],
      "outro": [
        {
          "who": "hadiya",
          "text": "Every tile under your camels pays you points at the end. You have begun well."
        },
        {
          "who": "farid",
          "text": "I'll tell everyone at the well about you!"
        }
      ],
      "opponent": {
        "name": "Farid the Water-Boy",
        "portrait": "camp-farid.webp",
        "emoji": "🧒",
        "cast": "farid",
        "personality": "Cheerful and careless; moves whoever is closest and forgets to bid.",
        "aiLevel": "easy",
        "aiStyle": "balanced"
      },
      "setup": {
        "np": 2,
        "seats": [
          "human",
          "ai"
        ],
        "lv": [
          "normal",
          "easy"
        ],
        "names": [
          "You",
          "Farid"
        ],
        "ex": {
          "artisans": false,
          "sultan": false,
          "thieves": false,
          "promos": false
        }
      },
      "goal": {
        "type": "win",
        "value": null,
        "text": "Win the game."
      },
      "stars": [
        {
          "text": "Win the game",
          "test": {
            "k": "won"
          }
        },
        {
          "text": "Claim 6 or more tiles with your camels",
          "test": {
            "k": "tiles",
            "op": ">=",
            "v": 6
          }
        },
        {
          "text": "Score 180 or more",
          "test": {
            "k": "score",
            "op": ">=",
            "v": 180
          }
        }
      ],
      "easier": {
        "aiLevel": "easy",
        "twist": {
          "id": "head-start",
          "param": 70,
          "text": "Gift: Old Hadiya lends you 70 extra coins to start."
        },
        "setup": {},
        "maxStars": 2,
        "text": "Hadiya lends you even more coins."
      },
      "unlock": [
        {
          "type": "portrait",
          "id": "farid",
          "text": "Farid's portrait"
        },
        {
          "type": "chapter",
          "id": "c2",
          "text": "Chapter 2: The Price of Going First"
        }
      ]
    },
    {
      "boss": false,
      "twist": null,
      "hints": true,
      "id": "c2",
      "act": 1,
      "title": "The Price of Going First",
      "intro": [
        {
          "who": "hadiya",
          "text": "Before each round you bid for your place in line. Going first costs coins."
        },
        {
          "who": "hadiya",
          "text": "Every coin you keep is a point at the end. Pay only when the best tile is worth it."
        },
        {
          "who": "layla",
          "text": "I count every coin twice. Let us see who still has a purse when the camels stop."
        }
      ],
      "outro": [
        {
          "who": "layla",
          "text": "You spent less and earned more. I will be watching your purse."
        },
        {
          "who": "hadiya",
          "text": "A cheap spot in line is often the wisest one."
        }
      ],
      "opponent": {
        "name": "Layla Coin-Counter",
        "portrait": "camp-layla.webp",
        "emoji": "🪙",
        "cast": "layla",
        "personality": "Thrifty to a fault; almost never pays for the front of the line.",
        "aiLevel": "easy",
        "aiStyle": "balanced"
      },
      "setup": {
        "np": 2,
        "seats": [
          "human",
          "ai"
        ],
        "lv": [
          "normal",
          "easy"
        ],
        "names": [
          "You",
          "Layla"
        ],
        "ex": {
          "artisans": false,
          "sultan": false,
          "thieves": false,
          "promos": false
        }
      },
      "goal": {
        "type": "custom",
        "value": 40,
        "test": {
          "k": "coins",
          "op": ">=",
          "v": 40
        },
        "text": "Win with at least 40 coins left in your purse."
      },
      "stars": [
        {
          "text": "Win with at least 40 coins left",
          "test": {
            "k": "goal"
          }
        },
        {
          "text": "End with 60 coins or more",
          "test": {
            "k": "coins",
            "op": ">=",
            "v": 60
          }
        },
        {
          "text": "Score 190 or more",
          "test": {
            "k": "score",
            "op": ">=",
            "v": 190
          }
        }
      ],
      "easier": {
        "aiLevel": "easy",
        "twist": {
          "id": "head-start",
          "param": 20,
          "text": "Gift: you start with 20 extra coins."
        },
        "setup": {},
        "maxStars": 2,
        "text": "You start with 20 extra coins."
      },
      "unlock": [
        {
          "type": "portrait",
          "id": "layla",
          "text": "Layla's portrait"
        },
        {
          "type": "title",
          "id": "thrifty",
          "text": "Title: The Thrifty"
        }
      ]
    },
    {
      "boss": true,
      "twist": {
        "id": "boss-goods",
        "param": 2,
        "text": "Boss rule: Yusra starts with 2 goods cards already in her stall."
      },
      "hints": true,
      "id": "c3",
      "act": 1,
      "title": "The Copper Scales",
      "intro": [
        {
          "who": "hadiya",
          "text": "Yusra rules the old bazaar. She buys goods cheap and sells sets dear."
        },
        {
          "who": "hadiya",
          "text": "Traders bring you goods cards. A set of different kinds scores far more than doubles."
        },
        {
          "who": "yusra",
          "text": "Silk, spice and ivory: I have them all. What will you bring, little claimant?"
        }
      ],
      "outro": [
        {
          "who": "yusra",
          "text": "Hmph. A fine set. The bazaar will speak your name."
        },
        {
          "who": "hadiya",
          "text": "The first great family bows. Word is spreading across Qamar."
        }
      ],
      "opponent": {
        "name": "Yusra of the Copper Scales",
        "portrait": "camp-yusra.webp",
        "emoji": "⚖️",
        "cast": "yusra",
        "personality": "Shrewd and greedy for goods; always takes the Traders when she can.",
        "aiLevel": "easy",
        "aiStyle": "balanced",
        "taunt": "Your sets were thin. Come back when you know the market.",
        "praise": "You read the market better than I did. Take my scales."
      },
      "setup": {
        "np": 2,
        "seats": [
          "human",
          "ai"
        ],
        "lv": [
          "normal",
          "easy"
        ],
        "names": [
          "You",
          "Yusra"
        ],
        "ex": {
          "artisans": false,
          "sultan": false,
          "thieves": false,
          "promos": false
        }
      },
      "goal": {
        "type": "custom",
        "value": 30,
        "test": {
          "k": "goods",
          "op": ">=",
          "v": 30
        },
        "text": "Win with at least 30 points from goods sets."
      },
      "stars": [
        {
          "text": "Win with 30+ points from goods",
          "test": {
            "k": "goal"
          }
        },
        {
          "text": "Score 50+ points from goods",
          "test": {
            "k": "goods",
            "op": ">=",
            "v": 50
          }
        },
        {
          "text": "Win by 20 or more",
          "test": {
            "k": "margin",
            "op": ">=",
            "v": 20
          }
        }
      ],
      "easier": {
        "aiLevel": "easy",
        "twist": null,
        "setup": {},
        "maxStars": 2,
        "text": "Yusra starts with no extra goods."
      },
      "unlock": [
        {
          "type": "portrait",
          "id": "yusra",
          "text": "Yusra's portrait"
        },
        {
          "type": "act",
          "id": "2",
          "text": "Act 2: The Bazaar Wars"
        },
        {
          "type": "cardback",
          "id": "copper",
          "text": "Copper-scale card back"
        }
      ]
    },
    {
      "boss": false,
      "twist": null,
      "hints": false,
      "id": "c4",
      "act": 2,
      "title": "The Crafters' Quarter",
      "intro": [
        {
          "who": "hadiya",
          "text": "Purple-robed Crafters have come from the mountains with workshops and fine items."
        },
        {
          "who": "tahir",
          "text": "Keep my Crafters and they score. Keep the most, and they score more."
        },
        {
          "who": "hadiya",
          "text": "Shrines still summon djinns: two Sages, or a Sage and a Mystic. Try it."
        }
      ],
      "outro": [
        {
          "who": "tahir",
          "text": "My workshops are yours to use. Spend your items wisely."
        },
        {
          "who": "hadiya",
          "text": "Djinns remember who called them. They will remember you."
        }
      ],
      "opponent": {
        "name": "Master Tahir",
        "portrait": "camp-tahir.webp",
        "emoji": "🔨",
        "cast": "tahir",
        "personality": "Patient and steady; plays the full plan every turn.",
        "aiLevel": "normal",
        "aiStyle": "balanced"
      },
      "setup": {
        "np": 2,
        "seats": [
          "human",
          "ai"
        ],
        "lv": [
          "normal",
          "normal"
        ],
        "names": [
          "You",
          "Tahir"
        ],
        "ex": {
          "artisans": true,
          "sultan": false,
          "thieves": false,
          "promos": false
        }
      },
      "goal": {
        "type": "win",
        "value": null,
        "text": "Win the game with the Crafters in play."
      },
      "stars": [
        {
          "text": "Win the game",
          "test": {
            "k": "won"
          }
        },
        {
          "text": "Own 3 or more djinns",
          "test": {
            "k": "djinns",
            "op": ">=",
            "v": 3
          }
        },
        {
          "text": "Score 210 or more",
          "test": {
            "k": "score",
            "op": ">=",
            "v": 210
          }
        }
      ],
      "easier": {
        "aiLevel": "easy",
        "twist": null,
        "setup": {},
        "maxStars": 2,
        "text": "Tahir plays gently."
      },
      "unlock": [
        {
          "type": "portrait",
          "id": "tahir",
          "text": "Tahir's portrait"
        },
        {
          "type": "table",
          "id": "workshop",
          "text": "Workshop table skin"
        }
      ]
    },
    {
      "boss": false,
      "twist": {
        "id": "head-start",
        "param": 10,
        "text": "Gift: Old Hadiya lends you 10 extra coins against two rivals."
      },
      "hints": false,
      "id": "c5",
      "act": 2,
      "title": "Cutpurses in the Souk",
      "intro": [
        {
          "who": "hadiya",
          "text": "Three claimants now, and cutpurses for hire at the Shrines."
        },
        {
          "who": "sabah",
          "text": "My silk buys loyalty, and my purse is deep. Nimr and I will squeeze you out."
        },
        {
          "who": "hadiya",
          "text": "With three at the table, Advisors are a race: 10 points for each rival with fewer."
        }
      ],
      "outro": [
        {
          "who": "sabah",
          "text": "You outbid me with half my coins. How?"
        },
        {
          "who": "hadiya",
          "text": "Two rivals beaten at once. The souk is yours."
        }
      ],
      "opponent": {
        "name": "Sabah the Silk-Seller",
        "portrait": "camp-sabah.webp",
        "emoji": "🧣",
        "cast": "sabah",
        "personality": "Flashy and rich; spends freely to go first and hires every cutpurse she can.",
        "aiLevel": "normal",
        "aiStyle": "balanced"
      },
      "setup": {
        "np": 3,
        "seats": [
          "human",
          "ai",
          "ai"
        ],
        "lv": [
          "normal",
          "normal",
          "normal"
        ],
        "names": [
          "You",
          "Sabah",
          "Nimr"
        ],
        "ex": {
          "artisans": false,
          "sultan": false,
          "thieves": true,
          "promos": false
        }
      },
      "goal": {
        "type": "score",
        "value": 140,
        "text": "Win with at least 140 points."
      },
      "stars": [
        {
          "text": "Win with 140+ points",
          "test": {
            "k": "goal"
          }
        },
        {
          "text": "Collect 5 or more Advisors",
          "test": {
            "k": "advisors",
            "op": ">=",
            "v": 5
          }
        },
        {
          "text": "Win by 15 or more",
          "test": {
            "k": "margin",
            "op": ">=",
            "v": 15
          }
        }
      ],
      "easier": {
        "aiLevel": "easy",
        "twist": null,
        "setup": {},
        "maxStars": 2,
        "text": "Both rivals play gently and Sabah has no extra coins."
      },
      "unlock": [
        {
          "type": "portrait",
          "id": "sabah",
          "text": "Sabah's portrait"
        },
        {
          "type": "title",
          "id": "souk",
          "text": "Title: Terror of the Souk"
        }
      ]
    },
    {
      "boss": true,
      "twist": {
        "id": "boss-favour",
        "param": "vizier",
        "text": "Boss rule: Marwan values Advisors far more than other tribes."
      },
      "hints": false,
      "id": "c6",
      "act": 2,
      "title": "The Patient Advisor",
      "intro": [
        {
          "who": "hadiya",
          "text": "Marwan served the old Sultan for forty years. Now he wants the throne himself."
        },
        {
          "who": "hadiya",
          "text": "Wonder Cities have risen from the sand. Each one you hold is worth more than the last."
        },
        {
          "who": "marwan",
          "text": "I collect Advisors as others collect coins. A court is won by whispers, not swords."
        }
      ],
      "outro": [
        {
          "who": "marwan",
          "text": "My court has gone quiet. Perhaps it was always yours."
        },
        {
          "who": "hadiya",
          "text": "The old court is broken. Only the strongest claimants remain."
        }
      ],
      "opponent": {
        "name": "Grand Advisor Marwan",
        "portrait": "camp-marwan.webp",
        "emoji": "📜",
        "cast": "marwan",
        "personality": "Calm and calculating; hoards Advisors to win the court race.",
        "aiLevel": "normal",
        "aiStyle": "balanced",
        "taunt": "Forty years at court. Did you think you could hurry me?",
        "praise": "Well played. The court will whisper your name now."
      },
      "setup": {
        "np": 2,
        "seats": [
          "human",
          "ai"
        ],
        "lv": [
          "normal",
          "normal"
        ],
        "names": [
          "You",
          "Marwan"
        ],
        "ex": {
          "artisans": false,
          "sultan": true,
          "thieves": false,
          "promos": false
        }
      },
      "goal": {
        "type": "margin",
        "value": 15,
        "text": "Win by 15 points or more."
      },
      "stars": [
        {
          "text": "Win by 15 or more",
          "test": {
            "k": "goal"
          }
        },
        {
          "text": "Hold 2 or more Wonder Cities",
          "test": {
            "k": "cities",
            "op": ">=",
            "v": 2
          }
        },
        {
          "text": "Score 30+ points from palaces",
          "test": {
            "k": "palaces",
            "op": ">=",
            "v": 30
          }
        }
      ],
      "easier": {
        "aiLevel": "easy",
        "twist": null,
        "setup": {},
        "maxStars": 2,
        "text": "Marwan plays gently and has no favourite tribe."
      },
      "unlock": [
        {
          "type": "portrait",
          "id": "marwan",
          "text": "Marwan's portrait"
        },
        {
          "type": "act",
          "id": "3",
          "text": "Act 3: Night of the Djinns"
        },
        {
          "type": "table",
          "id": "court",
          "text": "Court table skin"
        }
      ]
    },
    {
      "boss": false,
      "twist": {
        "id": "head-start",
        "param": 10,
        "text": "Gift: Old Hadiya gives you 10 extra coins for the hard road ahead."
      },
      "hints": false,
      "id": "c7",
      "act": 3,
      "title": "Djinn-Smoke",
      "intro": [
        {
          "who": "hadiya",
          "text": "The last claimants are no fools. From here on, every rival plays its best."
        },
        {
          "who": "zubaida",
          "text": "I keep three djinns in a lamp, and I can always find room for one more."
        },
        {
          "who": "hadiya",
          "text": "Take this purse, and summon djinns early. Their powers last the whole game."
        }
      ],
      "outro": [
        {
          "who": "zubaida",
          "text": "The smoke has cleared and your lamp is fuller than mine."
        },
        {
          "who": "hadiya",
          "text": "Two claimants left, then the last one."
        }
      ],
      "opponent": {
        "name": "Zubaida of the Lamp",
        "portrait": "camp-zubaida.webp",
        "emoji": "🪔",
        "cast": "zubaida",
        "personality": "Mysterious and greedy for djinns; heads for the Shrines every chance she gets.",
        "aiLevel": "hard",
        "aiStyle": "balanced"
      },
      "setup": {
        "np": 2,
        "seats": [
          "human",
          "ai"
        ],
        "lv": [
          "normal",
          "hard"
        ],
        "names": [
          "You",
          "Zubaida"
        ],
        "ex": {
          "artisans": false,
          "sultan": false,
          "thieves": false,
          "promos": true
        }
      },
      "goal": {
        "type": "win",
        "value": null,
        "text": "Win the game."
      },
      "stars": [
        {
          "text": "Win the game",
          "test": {
            "k": "won"
          }
        },
        {
          "text": "Own 4 or more djinns",
          "test": {
            "k": "djinns",
            "op": ">=",
            "v": 4
          }
        },
        {
          "text": "Score 220 or more",
          "test": {
            "k": "score",
            "op": ">=",
            "v": 220
          }
        }
      ],
      "easier": {
        "aiLevel": "normal",
        "twist": {
          "id": "head-start",
          "param": 30,
          "text": "Gift: you start with 30 extra coins."
        },
        "setup": {},
        "maxStars": 2,
        "text": "Zubaida plays a little softer and your purse is bigger."
      },
      "unlock": [
        {
          "type": "portrait",
          "id": "zubaida",
          "text": "Zubaida's portrait"
        },
        {
          "type": "cardback",
          "id": "lamp",
          "text": "Lamp card back"
        }
      ]
    },
    {
      "boss": false,
      "twist": {
        "id": "head-start",
        "param": 15,
        "text": "Gift: Old Hadiya slips you 15 extra coins against the two brothers."
      },
      "hints": false,
      "id": "c8",
      "act": 3,
      "title": "The Long Afternoon",
      "intro": [
        {
          "who": "qays",
          "text": "We are two brothers and one plan: whatever you want, one of us takes it first."
        },
        {
          "who": "hadiya",
          "text": "Every expansion is in play. Three seats, Crafters and cutpurses: the sands are crowded."
        },
        {
          "who": "hadiya",
          "text": "Don't wait for the perfect move. Place your camels before the brothers do."
        }
      ],
      "outro": [
        {
          "who": "qays",
          "text": "Two against one, and still we lost? Our mother will laugh."
        },
        {
          "who": "hadiya",
          "text": "One rival remains, and she is the worst of them."
        }
      ],
      "opponent": {
        "name": "Qays and Kamil",
        "portrait": "camp-qays.webp",
        "emoji": "👬",
        "cast": "qays",
        "personality": "Two cheeky brothers who play the same hard plan from two seats.",
        "aiLevel": "hard",
        "aiStyle": "balanced"
      },
      "setup": {
        "np": 3,
        "seats": [
          "human",
          "ai",
          "ai"
        ],
        "lv": [
          "normal",
          "hard",
          "hard"
        ],
        "names": [
          "You",
          "Qays",
          "Kamil"
        ],
        "ex": {
          "artisans": true,
          "sultan": false,
          "thieves": true,
          "promos": false
        }
      },
      "goal": {
        "type": "win",
        "value": null,
        "text": "Win the game against both brothers."
      },
      "stars": [
        {
          "text": "Win against both brothers",
          "test": {
            "k": "won"
          }
        },
        {
          "text": "Finish before round 11",
          "test": {
            "k": "rounds",
            "op": "<=",
            "v": 10
          }
        },
        {
          "text": "Score 170 or more",
          "test": {
            "k": "score",
            "op": ">=",
            "v": 170
          }
        }
      ],
      "easier": {
        "aiLevel": "normal",
        "twist": null,
        "setup": {
          "lv": [
            "normal",
            "normal",
            "normal"
          ]
        },
        "maxStars": 2,
        "text": "The brothers play at normal strength."
      },
      "unlock": [
        {
          "type": "portrait",
          "id": "qays",
          "text": "The brothers' portrait"
        },
        {
          "type": "title",
          "id": "crowded",
          "text": "Title: Master of the Crowded Sands"
        }
      ]
    },
    {
      "boss": false,
      "twist": {
        "id": "short-road",
        "param": 3,
        "text": "Night rule: every claimant starts with 3 fewer camels, so the game ends sooner."
      },
      "hints": false,
      "id": "c9",
      "act": 3,
      "title": "The Night Roads",
      "intro": [
        {
          "who": "nimr",
          "text": "I am the shortest road to the throne. Few camels, fast feet, no mercy."
        },
        {
          "who": "hadiya",
          "text": "Tonight everyone travels light: 3 fewer camels each, so the game ends sooner."
        },
        {
          "who": "hadiya",
          "text": "Every claim counts double in a short game. Watch his Shadows."
        }
      ],
      "outro": [
        {
          "who": "nimr",
          "text": "You were faster in the dark than I was. I did not expect that."
        },
        {
          "who": "hadiya",
          "text": "Only Qadira stands between you and the throne."
        }
      ],
      "opponent": {
        "name": "Nimr of the Night Roads",
        "portrait": "camp-nimr.webp",
        "emoji": "🗡️",
        "cast": "nimr",
        "personality": "Quiet and ruthless; races to place his camels and end the game.",
        "aiLevel": "hard",
        "aiStyle": "balanced"
      },
      "setup": {
        "np": 2,
        "seats": [
          "human",
          "ai"
        ],
        "lv": [
          "normal",
          "hard"
        ],
        "names": [
          "You",
          "Nimr"
        ],
        "ex": {
          "artisans": false,
          "sultan": false,
          "thieves": false,
          "promos": false
        }
      },
      "goal": {
        "type": "before-round",
        "value": 8,
        "text": "Win and finish before round 8."
      },
      "stars": [
        {
          "text": "Win before round 8",
          "test": {
            "k": "goal"
          }
        },
        {
          "text": "Claim 7 or more tiles",
          "test": {
            "k": "tiles",
            "op": ">=",
            "v": 7
          }
        },
        {
          "text": "Score 180 or more",
          "test": {
            "k": "score",
            "op": ">=",
            "v": 180
          }
        }
      ],
      "easier": {
        "aiLevel": "normal",
        "twist": {
          "id": "short-road",
          "param": 3,
          "text": "Night rule: 3 fewer camels each."
        },
        "setup": {},
        "maxStars": 2,
        "text": "Nimr plays at normal strength."
      },
      "unlock": [
        {
          "type": "portrait",
          "id": "nimr",
          "text": "Nimr's portrait"
        },
        {
          "type": "table",
          "id": "night",
          "text": "Night-sands table skin"
        }
      ]
    },
    {
      "boss": true,
      "twist": {
        "id": "boss-djinn",
        "param": "hikma",
        "coins": 50,
        "text": "Boss rule: Qadira starts with the djinn Hikma (her Sages score 4 each) and 50 extra coins."
      },
      "hints": false,
      "id": "c10",
      "act": 3,
      "title": "The Uncrowned",
      "intro": [
        {
          "who": "hadiya",
          "text": "Qadira was the old Sultan's niece. She thinks the throne is hers by blood."
        },
        {
          "who": "qadira",
          "text": "I have bargained with djinns since I could walk. The Sage-djinn already serves me."
        },
        {
          "who": "hadiya",
          "text": "The whole sultanate is in play: Crafters, cutpurses, Wonder Cities and every djinn."
        },
        {
          "who": "hadiya",
          "text": "Win this, and Qamar has a ruler again."
        }
      ],
      "outro": [
        {
          "who": "qadira",
          "text": "Blood was not enough. Take the throne, then. Rule it well."
        },
        {
          "who": "hadiya",
          "text": "The sands are quiet. Qamar has a ruler at last, and it is you."
        },
        {
          "who": "hadiya",
          "text": "Long may you reign."
        }
      ],
      "opponent": {
        "name": "Qadira the Uncrowned",
        "portrait": "camp-qadira.webp",
        "emoji": "👑",
        "cast": "qadira",
        "personality": "Proud, clever and relentless; summons djinns early and hoards Sages.",
        "aiLevel": "hard",
        "aiStyle": "balanced",
        "taunt": "The throne was never yours to take. Kneel.",
        "praise": "I yield. Qamar is yours, Sultan."
      },
      "setup": {
        "np": 2,
        "seats": [
          "human",
          "ai"
        ],
        "lv": [
          "normal",
          "hard"
        ],
        "names": [
          "You",
          "Qadira"
        ],
        "ex": {
          "artisans": true,
          "sultan": true,
          "thieves": true,
          "promos": true
        }
      },
      "goal": {
        "type": "win",
        "value": null,
        "text": "Win the game and take the throne."
      },
      "stars": [
        {
          "text": "Win and take the throne",
          "test": {
            "k": "won"
          }
        },
        {
          "text": "Win by 20 or more",
          "test": {
            "k": "margin",
            "op": ">=",
            "v": 20
          }
        },
        {
          "text": "Score 230 or more",
          "test": {
            "k": "score",
            "op": ">=",
            "v": 230
          }
        }
      ],
      "easier": {
        "aiLevel": "normal",
        "twist": null,
        "setup": {},
        "maxStars": 2,
        "text": "Qadira plays at normal strength and has no djinn at the start."
      },
      "unlock": [
        {
          "type": "portrait",
          "id": "qadira",
          "text": "Qadira's portrait"
        },
        {
          "type": "title",
          "id": "sultan",
          "text": "Title: Sultan of Qamar"
        },
        {
          "type": "table",
          "id": "palace",
          "text": "Palace table skin"
        }
      ]
    }
  ]
};
/* gameaudio.js - shared sample playback for the single-file board games.
 * Plain script (no modules). Defines window.GA. Every public call is wrapped so it never throws;
 * without Web Audio (jsdom, very old browsers) it stays silent and GA.has() returns false,
 * so games keep using their synthesized sounds:  GA.has(x) ? GA.play(x) : oldSynth(x)
 *
 *   GA.init({sfx:{name:b64mp3}, music:{name:b64mp3}, key:'prefix', duck:['boom',..], ctx:AudioContext|fn})
 *   GA.play(name, {vol, rate, pan, jitter, cooldown, duck, at})  -> true if it played
 *   GA.loop(name, {vol, fade}) / GA.stopLoop(name, {fade})         ambience beds
 *   GA.music(name|null, {vol, fade})                                 cross-fading background track
 *   GA.setSfx(on) GA.setMusic(on) GA.setVolume('sfx'|'music', 0..1)  persisted in localStorage
 *   GA.setVolume('master', 0..1)  one level over everything (the shared settings panel sets it; default 1)
 *   GA.has(name) GA.playing() GA.state() GA.unlock() GA.names() GA.duration(name)
 * Samples are decoded lazily on the first user gesture (atob -> ArrayBuffer -> decodeAudioData, no fetch).
 */
(function (root) {
  'use strict';
  var NOOP = function () {};
  var S = {
    inited: false, key: 'ga', src: {}, kind: {}, buf: {}, failed: {}, pending: {},
    ctx: null, ctxOpt: null, out: null, sfxBus: null, musBus: null, duckBus: null,
    sfxOn: true, musOn: true, sfxVol: 0.8, musVol: 0.5, masterVol: 1, last: {}, loops: {},
    cur: null, curName: null, wantMusic: null, duckSet: {}, duckUntil: 0, unlocked: false, decoding: false
  };
  var DEFAULT_DUCK = ['win', 'lose', 'levelup', 'level', 'boom', 'ko', 'thunder', 'roar', 'smash', 'stomp', 'door', 'death', 'crit', 'crumble'];

  function safe(fn, dflt) {
    return function () { try { return fn.apply(null, arguments); } catch (e) { return dflt; } };
  }
  function lsGet(k, d) { try { var v = root.localStorage && root.localStorage.getItem(S.key + '_ga_' + k); return v == null ? d : v; } catch (e) { return d; } }
  function lsSet(k, v) { try { root.localStorage && root.localStorage.setItem(S.key + '_ga_' + k, String(v)); } catch (e) {} }
  function clamp(v, a, b) { v = +v; return isFinite(v) ? Math.max(a, Math.min(b, v)) : a; }

  function b64ToBuf(b64) {
    var s = String(b64 || '');
    var i = s.indexOf('base64,'); if (i >= 0) s = s.slice(i + 7);
    if (typeof root.atob !== 'function') return null;
    var bin = root.atob(s), n = bin.length, u = new Uint8Array(n);
    for (var j = 0; j < n; j++) u[j] = bin.charCodeAt(j);
    return u.buffer;
  }

  function getCtx() {
    if (S.ctx) return S.ctx;
    var c = null;
    if (S.ctxOpt) c = typeof S.ctxOpt === 'function' ? S.ctxOpt() : S.ctxOpt;
    if (!c) {
      var AC = root.AudioContext || root.webkitAudioContext;
      if (!AC) return null;
      c = new AC();
    }
    if (!c || typeof c.createGain !== 'function' || typeof c.decodeAudioData !== 'function') return null;
    S.ctx = c;
    S.out = c.createGain(); S.out.connect(c.destination);
    S.sfxBus = c.createGain(); S.sfxBus.connect(S.out);
    S.duckBus = c.createGain(); S.duckBus.connect(S.out);
    S.musBus = c.createGain(); S.musBus.connect(S.duckBus);
    applyVol();
    return c;
  }

  function applyVol() {
    if (!S.ctx) return;
    var t = S.ctx.currentTime;
    S.sfxBus.gain.setTargetAtTime(S.sfxOn ? S.sfxVol : 0, t, 0.02);
    S.musBus.gain.setTargetAtTime(S.musOn ? S.musVol : 0, t, 0.08);
    S.out.gain.setTargetAtTime(S.masterVol, t, 0.02);
  }

  // Loops: skip encoder padding / near-silence at the edges so MP3 loops don't gap.
  function loopPoints(b) {
    var d = b.getChannelData(0), n = d.length, lim = Math.min(n >> 2, Math.floor(b.sampleRate * 0.1)), s = 0, e = n - 1, th = 1e-4;
    while (s < lim && Math.abs(d[s]) < th) s++;
    while (e > n - lim && Math.abs(d[e]) < th) e--;
    return [s / b.sampleRate, (e + 1) / b.sampleRate];
  }

  function decodeOne(name, done) {
    var c = S.ctx; done = done || NOOP;
    if (!c || S.buf[name] || S.failed[name]) return done();
    if (S.pending[name]) { S.pending[name].push(done); return; }
    S.pending[name] = [done];
    var finish = function (b) {
      if (b && b.duration > 0) { S.buf[name] = b; b._lp = loopPoints(b); } else S.failed[name] = 1;
      var q = S.pending[name] || []; delete S.pending[name];
      for (var i = 0; i < q.length; i++) { try { q[i](); } catch (e) {} }
    };
    var ab;
    try { ab = b64ToBuf(S.src[name]); } catch (e) { ab = null; }
    if (!ab) return finish(null);
    try {
      var p = c.decodeAudioData(ab, function (b) { finish(b); }, function () { finish(null); });
      if (p && typeof p.then === 'function') p.then(NOOP, function () { finish(null); });
    } catch (e) { finish(null); }
  }

  function decodeAll() {
    if (S.decoding || !S.ctx) return;
    S.decoding = true;
    // music first (the wanted track), then effects in small serial steps to keep the main thread free
    var names = Object.keys(S.src).sort(function (a, b) {
      var pa = a === S.wantMusic ? 0 : S.kind[a] === 'sfx' ? 1 : 2, pb = b === S.wantMusic ? 0 : S.kind[b] === 'sfx' ? 1 : 2;
      return pa - pb;
    });
    var i = 0;
    (function next() {
      if (i >= names.length) { S.decoding = false; return; }
      var n = names[i++];
      decodeOne(n, function () {
        if (n === S.wantMusic && S.musOn && S.curName !== n) startMusic(n, S._musOpt || {});
        setTimeout(next, 0);
      });
    })();
  }

  function unlock() {
    if (!S.inited) return false;
    var c = getCtx(); if (!c) return false;
    if (c.state === 'suspended' && typeof c.resume === 'function') { try { var p = c.resume(); if (p && p.then) p.then(NOOP, NOOP); } catch (e) {} }
    if (!S.unlocked) { S.unlocked = true; decodeAll(); }
    return true;
  }

  function onGesture() { safe(unlock)(); }
  function onVis() {
    try {
      if (!S.ctx || !root.document) return;
      if (root.document.hidden) { if (S.ctx.state === 'running' && S.ctx.suspend) S.ctx.suspend().then(NOOP, NOOP); }
      else if (S.unlocked && S.ctx.state === 'suspended' && S.ctx.resume) S.ctx.resume().then(NOOP, NOOP);
    } catch (e) {}
  }

  function init(o) {
    o = o || {};
    if (o.key) S.key = String(o.key);
    if (o.ctx) S.ctxOpt = o.ctx;
    var add = function (m, k) { if (!m) return; for (var n in m) if (Object.prototype.hasOwnProperty.call(m, n) && m[n]) { S.src[n] = m[n]; S.kind[n] = k; } };
    add(o.sfx, 'sfx'); add(o.music, 'music');
    var d = o.duck || DEFAULT_DUCK; S.duckSet = {}; for (var i = 0; i < d.length; i++) S.duckSet[d[i]] = 1;
    S.sfxOn = lsGet('sfx', '1') !== '0'; S.musOn = lsGet('mus', '1') !== '0';
    S.sfxVol = clamp(lsGet('sfxvol', o.sfxVol != null ? o.sfxVol : 0.8), 0, 1);
    S.musVol = clamp(lsGet('musvol', o.musVol != null ? o.musVol : 0.5), 0, 1);
    S.masterVol = clamp(lsGet('mastervol', 1), 0, 1);
    if (!S.inited && root.document && root.document.addEventListener) {
      ['pointerdown', 'keydown', 'touchstart', 'mousedown'].forEach(function (ev) {
        root.document.addEventListener(ev, onGesture, { capture: true, passive: true });
      });
      root.document.addEventListener('visibilitychange', onVis);
    }
    S.inited = true;
    if (S.unlocked) { S.decoding = false; decodeAll(); }
    return true;
  }

  function has(name) { return !!(S.buf[name]); }

  function duck(sec) {
    if (!S.ctx || !S.duckBus) return;
    var c = S.ctx, t = c.currentTime, g = S.duckBus.gain, end = t + Math.max(0.2, sec);
    g.cancelScheduledValues(t); g.setValueAtTime(g.value, t);
    g.linearRampToValueAtTime(0.35, t + 0.06);
    S.duckUntil = Math.max(S.duckUntil, end);
    g.setValueAtTime(0.35, S.duckUntil); g.linearRampToValueAtTime(1, S.duckUntil + 0.6);
  }

  function play(name, o) {
    o = o || {};
    var b = S.buf[name], c = S.ctx;
    if (!b || !c || !S.sfxOn || c.state === 'closed') return false;
    var now = Date.now(), cd = o.cooldown != null ? o.cooldown : 45;
    if (now - (S.last[name] || 0) < cd) return false;
    S.last[name] = now;
    var src = c.createBufferSource(); src.buffer = b;
    var j = o.jitter != null ? o.jitter : 0.04;
    var rate = clamp(o.rate != null ? o.rate : 1, 0.25, 4) * (1 + (Math.random() * 2 - 1) * j);
    src.playbackRate.value = rate;
    var g = c.createGain(); g.gain.value = clamp(o.vol != null ? o.vol : 1, 0, 2) * (1 - Math.random() * j * 1.5);
    src.connect(g);
    var last = g;
    if (o.pan && c.createStereoPanner) { var p = c.createStereoPanner(); p.pan.value = clamp(o.pan, -1, 1); g.connect(p); last = p; }
    last.connect(S.sfxBus);
    src.start(c.currentTime + Math.max(0, +o.at || 0));
    if (o.duck || (o.duck !== false && S.duckSet[name])) duck(b.duration / rate);
    return true;
  }

  function loop(name, o) {
    o = o || {};
    var b = S.buf[name], c = S.ctx;
    if (!b || !c) return false;
    if (S.loops[name]) { S.loops[name].g.gain.setTargetAtTime(clamp(o.vol != null ? o.vol : 1, 0, 2), c.currentTime, 0.1); return true; }
    var src = c.createBufferSource(); src.buffer = b; src.loop = true;
    src.loopStart = b._lp[0]; src.loopEnd = b._lp[1];
    var g = c.createGain(), t = c.currentTime, f = o.fade != null ? o.fade : 0.8;
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(clamp(o.vol != null ? o.vol : 1, 0, 2), t + Math.max(0.01, f));
    src.connect(g); g.connect(S.sfxBus); src.start(t, b._lp[0]);
    S.loops[name] = { src: src, g: g };
    return true;
  }

  function stopLoop(name, o) {
    o = o || {};
    var L = S.loops[name], c = S.ctx; if (!L || !c) return false;
    delete S.loops[name];
    var t = c.currentTime, f = o.fade != null ? o.fade : 0.8;
    L.g.gain.cancelScheduledValues(t); L.g.gain.setValueAtTime(L.g.gain.value, t); L.g.gain.linearRampToValueAtTime(0.0001, t + Math.max(0.01, f));
    try { L.src.stop(t + Math.max(0.01, f) + 0.05); } catch (e) {}
    return true;
  }

  function stopMusic(f) {
    var M = S.cur, c = S.ctx; S.cur = null; S.curName = null;
    if (!M || !c) return;
    var t = c.currentTime;
    M.g.gain.cancelScheduledValues(t); M.g.gain.setValueAtTime(M.g.gain.value, t); M.g.gain.linearRampToValueAtTime(0.0001, t + f);
    try { M.src.stop(t + f + 0.05); } catch (e) {}
  }

  function startMusic(name, o) {
    var b = S.buf[name], c = S.ctx; if (!b || !c) return false;
    var f = o.fade != null ? o.fade : 1.5;
    if (S.curName === name) return true;
    stopMusic(f);
    var src = c.createBufferSource(); src.buffer = b; src.loop = true;
    src.loopStart = b._lp[0]; src.loopEnd = b._lp[1];
    var g = c.createGain(), t = c.currentTime;
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(clamp(o.vol != null ? o.vol : 1, 0, 2), t + Math.max(0.01, f));
    src.connect(g); g.connect(S.musBus); src.start(t, b._lp[0]);
    S.cur = { src: src, g: g }; S.curName = name;
    return true;
  }

  // GA.music(name) remembers the wish: it starts once decoded / unlocked and music is on.
  function music(name, o) {
    o = o || {}; S._musOpt = o;
    if (!name) { S.wantMusic = null; stopMusic(o.fade != null ? o.fade : 1.2); return true; }
    S.wantMusic = name;
    if (!S.musOn || !S.ctx) return false;
    if (!S.buf[name]) { decodeOne(name, function () { if (S.wantMusic === name && S.musOn) startMusic(name, o); }); return false; }
    return startMusic(name, o);
  }

  function setSfx(on) {
    S.sfxOn = !!on; lsSet('sfx', S.sfxOn ? 1 : 0); applyVol();
    if (!S.sfxOn) for (var n in S.loops) stopLoop(n, { fade: 0.2 });
    return S.sfxOn;
  }
  function setMusic(on) {
    S.musOn = !!on; lsSet('mus', S.musOn ? 1 : 0); applyVol();
    if (!S.musOn) stopMusic(0.6); else if (S.wantMusic) music(S.wantMusic, S._musOpt || {});
    return S.musOn;
  }
  function setVolume(kind, v) {
    v = clamp(v, 0, 1);
    if (kind === 'master') { S.masterVol = v; lsSet('mastervol', v); } else if (kind === 'music') { S.musVol = v; lsSet('musvol', v); } else { S.sfxVol = v; lsSet('sfxvol', v); }
    applyVol(); return v;
  }
  function state() {
    return { sfx: S.sfxOn, music: S.musOn, sfxVol: S.sfxVol, musVol: S.musVol, masterVol: S.masterVol, audio: !!S.ctx,
      ctxState: S.ctx ? S.ctx.state : 'none', decoded: Object.keys(S.buf).length, failed: Object.keys(S.failed),
      total: Object.keys(S.src).length, playing: S.curName, loops: Object.keys(S.loops) };
  }
  function names() { return Object.keys(S.src); }
  function duration(name) { return S.buf[name] ? S.buf[name].duration : 0; }

  root.GA = {
    init: safe(init, false), play: safe(play, false), has: safe(has, false),
    loop: safe(loop, false), stopLoop: safe(stopLoop, false), music: safe(music, false),
    setSfx: safe(setSfx, false), setMusic: safe(setMusic, false), setVolume: safe(setVolume, 0),
    playing: safe(function () { return S.curName; }, null),
    state: safe(state, {}), unlock: safe(unlock, false), names: safe(names, []), duration: safe(duration, 0),
    decode: safe(function (n, cb) { decodeOne(n, cb); return true; }, false)
  };
})(typeof window !== 'undefined' ? window : this);

// ---------- NetRoom: free peer-to-peer game rooms (WebRTC through Trystero, MIT) ----------
// Players find each other through public Nostr relays; after that the moves go browser to browser.
// The room object has the same shape as the claude.ai "room" capability, so a game's net code runs on either:
//   lobby.join(name) -> room {presence(o), on(type,fn), emit(type,data), onPeers(fn), onConnection(fn), leave()}
//   messages: {peer, data, isMe:false, by}   peers: {peer, isMe, sameTab, kind:'viewer', presence, by, guest:false}
// Tests can point it at a local relay with window.NETROOM_RELAYS=['ws://127.0.0.1:17700'].
const NetRoom=(()=>{
  const APP='game-night-shelf-v1';
  const rand=n=>{const a='abcdefghijkmnpqrstuvwxyz23456789',u=new Uint8Array(n);crypto.getRandomValues(u);return [...u].map(x=>a[x%a.length]).join('')};
  const store={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
  let myUid=null;
  function uid(){if(myUid)return myUid;myUid=store.get('gns-uid');if(!myUid){myUid='p'+rand(15);store.set('gns-uid',myUid)}return myUid}
  function name(){return (store.get('gns-name')||'').slice(0,24)}
  function setName(n){n=String(n||'').replace(/[<>&"]/g,'').trim().slice(0,24);store.set('gns-name',n);return n}
  function available(){return typeof Trystero!=='undefined'&&typeof RTCPeerConnection!=='undefined'&&!!(window.crypto&&crypto.subtle)}
  // invite codes: 5 letters/digits without look-alikes
  function newCode(){return rand(5)}
  function cleanCode(c){return String(c||'').toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,10)}
  // one room per page: joining again (a retry, or another code) first closes the old room, so the host
  // can't stay connected to an abandoned copy while the game listens on the new one
  let active=null;
  function lobby(game){return {join:async roomName=>{if(active){const old=active;active=null;try{await old.leave()}catch(e){}await new Promise(r=>setTimeout(r,250))}
    const r=makeRoom(game,String(roomName));active=r;return r}}}
  function makeRoom(game,roomName){
    const cfg={appId:APP,password:game+'/'+roomName,relayConfig:{redundancy:6,warnOnRelayFailure:false}};
    if(window.NETROOM_RELAYS)cfg.relayConfig.urls=window.NETROOM_RELAYS;
    if(window.NETROOM_ICE)cfg.rtcConfig={iceServers:window.NETROOM_ICE};
    if(window.NETROOM_TURN)cfg.turnConfig=window.NETROOM_TURN;
    const tr=Trystero.joinRoom(cfg,game+'/'+roomName);
    const me=Trystero.selfId,by=uid();
    let pres={name:name()},left=false;
    const remote=new Map(),handlers={},peerFns=[],connFns=[];
    const gA=tr.makeAction('g'),pA=tr.makeAction('p');
    const entry=(p,v)=>({peer:p,isMe:false,sameTab:false,kind:'viewer',presence:v.presence,by:v.by,guest:false});
    const list=()=>[{peer:me,isMe:true,sameTab:true,kind:'viewer',presence:pres,by,guest:false},...[...remote].map(([p,v])=>entry(p,v))];
    const fire=(joined,gone)=>{const ch={peers:list(),joined,left:gone};peerFns.forEach(f=>{try{f(ch)}catch(e){console.error(e)}})};
    const sendPres=target=>{try{pA.send({pr:pres,by},target?{target}:undefined)}catch(e){}};
    const gone=new Set();
    tr.onPeerJoin=p=>{if(left)return;gone.delete(p);sendPres(p)};
    tr.onPeerLeave=p=>{if(left)return;gone.add(p);const v=remote.get(p);if(!v)return;remote.delete(p);fire([],[entry(p,v)])};
    pA.onMessage=(d,info)=>{const p=info&&info.peerId;if(left||!p||gone.has(p)||!d||typeof d!=='object')return;
      const pr=d.pr&&typeof d.pr==='object'&&!Array.isArray(d.pr)?Object.assign({},d.pr):{};if('name' in pr)pr.name=String(pr.name||'').replace(/[<>&"]/g,'').slice(0,24);
      const v={presence:pr,by:typeof d.by==='string'?d.by.slice(0,40):null};
      const old=remote.get(p);remote.set(p,v);if(!old){sendPres(p);fire([entry(p,v)],[]);return}
      // presence is re-sent every few seconds in case one was lost; only a real change is reported
      if(JSON.stringify(old)!==JSON.stringify(v))fire([],[])};
    gA.onMessage=(d,info)=>{const p=info&&info.peerId;if(left||!p||!d||typeof d.t!=='string')return;
      // a message can arrive just before that peer's presence does
      const v=remote.get(p)||{presence:{},by:null};(handlers[d.t]||[]).forEach(f=>{try{f({peer:p,data:d.d,isMe:false,by:v.by})}catch(e){console.error(e)}})};
    setTimeout(()=>connFns.forEach(f=>f(true)),0);
    const hb=setInterval(()=>{if(!left)sendPres()},5000);
    // closing the tab tells the others at once, instead of after WebRTC's ~10 s timeout
    const bye=()=>{if(left)return;left=true;clearInterval(hb);try{tr.leave()}catch(e){}};window.addEventListener('pagehide',bye);
    return {
      self:me,
      presence(o){pres=Object.assign({},pres,o||{});sendPres();fire([],[]);return Promise.resolve()},
      on(t,f){(handlers[t]=handlers[t]||[]).push(f)},
      emit(t,d){if(left)return Promise.resolve();try{return Promise.resolve(gA.send({t,d})).then(()=>{},()=>{})}catch(e){return Promise.resolve()}},
      sendTo(peer,t,d){if(left)return Promise.resolve();try{return Promise.resolve(gA.send({t,d},{target:peer})).then(()=>{},()=>{})}catch(e){return Promise.resolve()}},
      onPeers(f){peerFns.push(f);setTimeout(()=>f({peers:list(),joined:[],left:[]}),0)},
      onConnection(f){connFns.push(f)},
      peerCount(){return remote.size},
      leave(){window.removeEventListener('pagehide',bye);left=true;clearInterval(hb);try{return Promise.resolve(tr.leave())}catch(e){return Promise.resolve()}}};
  }
  // an invite link opens the game with the code filled in: …/game/#join-abcde
  function linkCode(){const m=/^#join-([a-z0-9]{3,10})$/i.exec(location.hash||'');return m?m[1].toLowerCase():''}
  function inviteLink(code){return location.href.split('#')[0]+'#join-'+code}
  return {available,lobby,uid,name,setName,newCode,cleanCode,linkCode,inviteLink};
})();

// ---------- Sands of Qamar: components (numbers from the research in ../rules.md; names are original) ----------
const MNAME={vizier:'Advisor',elder:'Sage',merchant:'Trader',builder:'Mason',assassin:'Shadow',artisan:'Crafter'};
const MPLUR={vizier:'Advisors',elder:'Sages',merchant:'Traders',builder:'Masons',assassin:'Shadows',artisan:'Crafters'};
const MHELP={vizier:'Keep them. 1 point each, and 10 more for every rival with fewer Advisors.',elder:'Keep them. 2 points each; spend them to summon djinns.',
  merchant:'Take that many goods cards from the front of the market row.',builder:'Earn coins: Masons × blue tiles in the 3×3 around the tile (+1 per Mystic you add).',
  assassin:'Remove one person within that many steps (+1 per Mystic), or one Advisor or Sage kept by a rival.',artisan:'Keep them and draw that many items: keep 1, discard the rest.'};
const MEEPLE_COUNT={vizier:16,elder:20,merchant:18,builder:18,assassin:18};
// tiles: k, name, colour (blue counts for Masons), value, count, set
const TILEDEF={
  village:{n:'Hamlet',blue:true,x:'Place a palace here (you must).'},
  sacred:{n:'Shrine',blue:true,x:'You may pay 2 Sages, or 1 Sage and 1 Mystic, to summon a face-up djinn.'},
  oasis:{n:'Oasis',blue:false,x:'Plant a palm tree here (you must).'},
  small:{n:'Bazaar Stall',blue:false,x:'You may pay 3 coins for 1 of the first 3 goods in the market row.'},
  large:{n:'Grand Bazaar',blue:false,x:'You may pay 6 coins for 2 of the first 6 goods in the market row.'},
  workshop:{n:'Workshop',blue:true,x:'You may pay 1 Crafter or 2 Mystics to take the top item.'},
  exchange:{n:'Spice Exchange',blue:false,x:'You may pay 4 coins for any 1 face-up goods card.'},
  ravine:{n:'Ravine',blue:false,x:'Impassable. Nothing may ever stand here.',block:1},
  lake:{n:'Great Lake',blue:true,x:'Impassable. Palms and palaces on tiles touching it score double.',block:1},
  city:{n:'Wonder City',blue:true,x:'A city of wonders: the more of them you hold, the more they are worth (5 / 20 / 45 / 80 / 125).'}};
const TILESET=[['village',5,5],['sacred',6,4],['sacred',10,1],['sacred',12,1],['sacred',15,1],['oasis',8,6],['small',6,8],['large',4,4]];
const TILESET_ART=[['workshop',5,3],['exchange',10,2],['ravine',0,1]];
const TILESET_WHIM=[['city',5,3,'blue'],['city',5,2,'red'],['lake',0,1]];
function mkTiles(set,ex){const o=[];for(const [k,v,n,col] of set)for(let i=0;i<n;i++)o.push({k,v,blue:col?col==='blue':TILEDEF[k].blue,ex});return o}
// goods (54 base): Mystics are the special cards
const RNAME={ivory:'Ivory',jewels:'Jewels',gold:'Gold',papyrus:'Papyrus',silk:'Silk',spice:'Spice',fish:'Fish',wheat:'Wheat',pottery:'Pottery',fakir:'Mystic'};
const RICON={ivory:'🦷',jewels:'💎',gold:'🥇',papyrus:'📜',silk:'🧣',spice:'🌶️',fish:'🐟',wheat:'🌾',pottery:'🏺',fakir:'🔮'};
const RESOURCE_COUNT={ivory:2,jewels:2,gold:2,papyrus:4,silk:4,spice:4,fish:6,wheat:6,pottery:6,fakir:18};
const SETVP=[0,1,3,7,13,21,30,40,50,60];
// turn-order track: cost per spot; several spots may share a cost ("stack" spots: a later bidder goes first)
const BIDTRACK_STD=[18,12,8,5,3,1,0,0,0];const BIDTRACK_5=[18,12,8,5,5,3,3,1,1,0,0,0];
const CAMELS={2:11,3:8,4:8,5:8};
// items (Artisans): 9 precious + 9 magic. The split per kind is an assumption (see rules-notes).
const ITEMS={
  gem5:{n:'Silver Bangle',kind:'precious',vp:5,cp:3,x:'Worth 5 points at the end.'},
  gem7:{n:'Jade Casket',kind:'precious',vp:7,cp:3,x:'Worth 7 points at the end.'},
  gem9:{n:'Sun Diadem',kind:'precious',vp:9,cp:3,x:'Worth 9 points at the end.'},
  carpet:{n:'Wind Rug',kind:'magic',cp:2,x:'This turn your last person may be dropped on any tile holding its colour, ignoring distance and mountains.'},
  lamp:{n:'Brass Lamp',kind:'magic',cp:2,x:'Take one face-up djinn for free.'},
  flute:{n:'Reed Pipe',kind:'magic',cp:2,x:'Before your move, bring up to 5 people from neighbouring tiles onto one tile.'},
  scimitar:{n:'Ember Blade',kind:'magic',cp:1,x:'Remove any 2 people from the board; you claim tiles this empties.'},
  talisman:{n:'Storm Charm',kind:'magic',cp:1,x:'Move one of your camels to an empty tile.'},
  horn:{n:'Plenty Horn',kind:'magic',cp:1,x:'Replace the market row with 9 new goods.'}};
// thieves (one per colour)
const THIEVES={
  assassin:{n:'Red Cutpurse',x:'Each rival lifts one of their camels off a tile; you claim one of those tiles.'},
  builder:{n:'Blue Cutpurse',x:'Each rival gives up one palm tree or palace from their tiles; you place one of them on any tile.'},
  merchant:{n:'Green Cutpurse',x:'Each rival discards 2 goods; you take 2 of them.'},
  vizier:{n:'Gold Cutpurse',x:'Each rival gives up an Advisor; you keep one.'},
  elder:{n:'White Cutpurse',x:'Each rival gives up a djinn; you take one of them.'},
  artisan:{n:'Purple Cutpurse',x:'Each rival gives up an item; you take one of them.'}};

// ---------- djinns: 22 base + 3 promos + 2 Crafters + 1 Cutpurse djinn. Original names; effects follow the published cards. ----------
// cost: null (always on) | 'EF' (1 Sage or 1 Mystic) | 'EEF' (1 Sage + 1 Sage-or-Mystic) | 'F' (1 Mystic) | 'F+' (1+ Mystics, bidding)
const DJINNS=[
 {k:'zarifa',n:'Zarifa',vp:5,cost:null,x:'At the end, every 2 Mystics you hold count as 1 goods card of any kind.'},
 {k:'tamuz',n:'Tamuz',vp:8,cost:'EF',x:'Put 3 people from the bag on an empty tile.'},
 {k:'harith',n:'Harith',vp:6,cost:null,x:'Whenever a djinn is summoned: +1 coin if by you, +2 if by a rival.'},
 {k:'sadim',n:'Sadim',vp:6,cost:null,x:'Shadows cannot take your Advisors or Sages (or Crafters).'},
 {k:'nuraya',n:'Nuraya',vp:6,cost:'EF',x:'Place a palace on any Hamlet.'},
 {k:'qirsh',n:'Qirsh',vp:4,cost:'EEF',x:'This turn your Masons earn double.'},
 {k:'wahha',n:'Wahha',vp:8,cost:'EF',x:'Plant a palm tree on any Oasis.'},
 {k:'burhan',n:'Burhan',vp:10,cost:'EF',x:'This turn, a palace you place may go on a neighbouring tile instead.'},
 {k:'nakhla',n:'Nakhla',vp:8,cost:null,x:'Palm trees on your tiles score 5 instead of 3.'},
 {k:'ghulam',n:'Ghulam',vp:8,cost:'EF',x:'This turn your Shadows take 2: two people from one tile, or two Advisors/Sages from one rival.'},
 {k:'wazira',n:'Wazira',vp:6,cost:null,x:'Your Advisors score 3 each instead of 1.'},
 {k:'sirra',n:'Sirra',vp:6,cost:null,x:'When your Shadows take a Trader: draw a goods card; a Mason: earn what it would have; an Advisor or Sage: keep it yourself (a Crafter: keep it and draw an item).'},
 {k:'dalil',n:'Dalil',vp:6,cost:'F+',x:'When bidding, each Mystic you discard lets you pay the price one spot cheaper.'},
 {k:'rawda',n:'Rawda',vp:10,cost:'EF',x:'This turn, a palm tree you plant may go on a neighbouring tile instead.'},
 {k:'jamal',n:'Jamal',vp:4,cost:'EEF',x:'Put one of your camels on an empty tile.'},
 {k:'tariq',n:'Tariq',vp:6,cost:null,x:'Whenever a person is dropped on one of your tiles: +1 coin on your move, +2 on a rival’s.'},
 {k:'qasra',n:'Qasra',vp:6,cost:null,x:'Whenever a palace is placed: +1 coin if by you, +2 if by a rival.'},
 {k:'khanjar',n:'Khanjar',vp:6,cost:null,x:'Whenever Shadows take a person: +1 coin if yours, +2 if a rival’s.'},
 {k:'hikma',n:'Hikma',vp:6,cost:null,x:'Your Sages score 4 each instead of 2.'},
 {k:'ruya',n:'Ru’ya',vp:4,cost:'EEF',x:'Look at the top 3 djinns of the deck: keep 1, discard 2.'},
 {k:'suqra',n:'Suqra',vp:8,cost:'F',x:'Take the top card of the goods deck.'},
 {k:'fath',n:'Fath',vp:4,cost:'EEF',x:'Put one of your camels on a tile holding only people.'},
 // promos
 {k:'amir',n:'Amir',vp:6,cost:null,set:'promos',x:'Whenever Advisors are taken: +1 coin if by you, +2 if by a rival.'},
 {k:'majlis',n:'Majlis',vp:0,cost:null,set:'promos',x:'At the end, +5 points for every djinn you own, this one included.',assumed:'printed VP'},
 {k:'dukkan',n:'Dukkan',vp:0,cost:null,set:'promos',x:'Whenever a rival ends a move on a bazaar tile, take the top goods card.'},
 // Crafters expansion
 {k:'jawhar',n:'Jawhar',vp:6,cost:null,set:'artisans',x:'Each precious item you own scores 3 more.',assumed:'printed VP'},
 {k:'sana',n:'San’a',vp:6,cost:null,set:'artisans',x:'Each Crafter you keep scores 2 more.',assumed:'printed VP'},
 // Cutpurse expansion
 {k:'hafiz',n:'Hafiz',vp:6,cost:null,set:'thieves',x:'Cutpurses cannot touch you.',assumed:'name and printed VP'}];
const DJ={};for(const d of DJINNS)DJ[d.k]=d;
function DJINNS_FOR(ex){return DJINNS.filter(d=>!d.set||ex[d.set])}
function hasDj(p,k){return p.dj.includes(k)}
// ---------- activation ----------
function costOpts(p,cost){const o=[];if(cost==='EF'){if(p.el>=1)o.push({el:1,fk:0});if(p.fk>=1)o.push({el:0,fk:1})}
  if(cost==='EEF'){if(p.el>=2)o.push({el:2,fk:0});if(p.el>=1&&p.fk>=1)o.push({el:1,fk:1})}if(cost==='F'&&p.fk>=1)o.push({el:0,fk:1});return o}
function payCost(p,c){p.el-=c.el;p.fk-=c.fk;G.bag.push(...Array(c.el).fill('elder'));G.rdisc.push(...Array(c.fk).fill('fakir'))}
function emptyTile(t){return !t.block&&t.camel==null&&t.tent==null&&!t.m.length&&!t.palm&&!t.pal}
function djinnTargets(p,k){switch(k){
  case 'tamuz':return G.board.filter(emptyTile).map(t=>t.i);
  case 'nuraya':return G.board.filter(t=>t.k==='village').map(t=>t.i);
  case 'wahha':return G.board.filter(t=>t.k==='oasis').map(t=>t.i);
  case 'jamal':return p.camels>0?G.board.filter(emptyTile).map(t=>t.i):[];
  case 'fath':return p.camels>0?G.board.filter(t=>!t.block&&t.camel==null&&t.tent==null&&t.m.length&&!t.palm&&!t.pal).map(t=>t.i):[];
  case 'suqra':return G.rdeck.length?[-1]:[];
  case 'ruya':return G.djDeck.length+G.djDisc.length?[-1]:[];
  case 'qirsh':return G.act&&!G.act.tribeDone&&G.act.color==='builder'&&!G.turnFx.qirsh?[-1]:[];
  case 'ghulam':return G.act&&!G.act.tribeDone&&G.act.color==='assassin'&&!G.turnFx.ghulam?[-1]:[];
  case 'burhan':return !G.turnFx.burhan?[-1]:[];case 'rawda':return !G.turnFx.rawda?[-1]:[];
  default:return[]}}
function djinnMoves(p){const o=[];if(G.phase!=='turn'||G.q)return o;
  for(const k of p.dj){const d=DJ[k];if(!d.cost||d.cost==='F+'||p.used[k])continue;const tg=djinnTargets(p,k);if(!tg.length)continue;for(const c of costOpts(p,d.cost))for(const t of tg)o.push({act:'djinn',k,t,pay:c})}return o}
function runDjinn(p,m){const d=DJ[m.k];payCost(p,m.pay);lg(`✨ ${p.nm} calls on ${d.n}.`,'step');fx('djinn',m.k);
  switch(m.k){
  case 'tamuz':{const t=G.board[m.t];for(let i=0;i<3&&G.bag.length;i++)t.m.push(G.bag.splice(rnd(G.bag.length),1)[0]);lg(`Three people appear on ${tileName(t)}.`);break}
  case 'nuraya':placePalace(p,m.t,true);break;
  case 'wahha':placePalm(p,m.t,true);break;
  case 'jamal':case 'fath':claimTile(p,m.t,'camel');break;
  case 'suqra':gainCard(p,G.rdeck.shift());break;
  case 'ruya':{if(!G.djDeck.length){G.djDeck=shuffle(G.djDisc);G.djDisc=[]}const top=G.djDeck.splice(0,3);ask(p.i,`${d.n}: keep one djinn`,top.map(k=>({l:`${DJ[k].n} (${DJ[k].vp} pts): ${DJ[k].x}`,h:'ruya',d:{p:p.i,k,top}})),{kind:'djinn',cards:top});break}
  case 'qirsh':G.turnFx.qirsh=1;lg('This turn the Masons earn double.','good');break;
  case 'ghulam':G.turnFx.ghulam=1;lg('This turn the Shadows take two.','good');break;
  case 'burhan':G.turnFx.burhan=1;break;case 'rawda':G.turnFx.rawda=1;break}}
// ---------- passive triggers ----------
function trig(kind,actor,data){for(const q of G.pl){const gainC=n=>{q.coins+=n;lg(`${q.nm} gains ${n} coin${n>1?'s':''} (${DJ[trigDj(kind)].n}).`,'good')};const own=q.i===actor;
  if(kind==='djinn'&&hasDj(q,'harith')&&!(own&&data&&data.k==='harith'))gainC(own?1:2);
  if(kind==='palace'&&hasDj(q,'qasra'))gainC(own?1:2);
  if(kind==='kill'&&hasDj(q,'khanjar'))gainC(own?1:2);
  if(kind==='vizier'&&hasDj(q,'amir'))gainC(own?1:2);
  if(kind==='drop'&&hasDj(q,'tariq')&&data&&(G.board[data.i].camel===q.i||G.board[data.i].tent===q.i))gainC(own?1:2);
  if(kind==='market'&&hasDj(q,'dukkan')&&!own&&G.rdeck.length){lg(`${q.nm}'s ${DJ.dukkan.n} slips a card from the deck.`,'good');gainCard(q,G.rdeck.shift())}}}
function trigDj(kind){return {djinn:'harith',palace:'qasra',kill:'khanjar',vizier:'amir',drop:'tariq',market:'dukkan'}[kind]}

// ---------- Sands of Qamar engine: G is plain JSON; every change goes through validMoves/performMove; questions pause on G.q ----------
// player colours avoid every tribe colour (yellow, white, green, blue, red, purple)
const PNAMES=['Onyx','Teal','Rose','Cedar','Slate'];
var ANIM=1,AIDELAY=450,DEFSEED=null;const SAVE='soq_save1';
let G=null;const UI={pause:false,speed:1,sel:null,pick:[],fx:[]};
function rnd(n){let t=(G.rng+=0x6D2B79F5);t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return Math.floor(((t^t>>>14)>>>0)/4294967296*n)}
function setSeed(s){DEFSEED=s>>>0;if(G)G.rng=s>>>0}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=rnd(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
function lg(t,c){G.logN=(G.logN||0)+1;G.log.unshift({t,r:G.round,c:c||'',i:G.logN});if(G.log.length>500)G.log.length=500}
function fx(t,x){if(UI.sim)return;UI.fxN=(UI.fxN||0)+1;UI.fx.push({t,x,n:UI.fxN});if(UI.fx.length>40)UI.fx.shift()}
const P=i=>G.pl[i];
// ---------- geometry (W×H grid, impassable tiles, mountains between tiles) ----------
const wkey=(a,b)=>a<b?a+'_'+b:b+'_'+a;
function nbr(i){const W=G.W,c=i%W,r=Math.floor(i/W),o=[];if(r>0)o.push(i-W);if(r<G.H-1)o.push(i+W);if(c>0)o.push(i-1);if(c<W-1)o.push(i+1);return o}
function ADJ(i){return nbr(i).filter(j=>!G.board[j].block&&!G.walls[wkey(i,j)])}
function AROUND(i){const W=G.W,c=i%W,r=Math.floor(i/W),o=[];for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){const rr=r+dr,cc=c+dc;if(rr>=0&&rr<G.H&&cc>=0&&cc<W)o.push(rr*W+cc)}return o}
const MDIST=(a,b)=>Math.abs(a%G.W-b%G.W)+Math.abs(Math.floor(a/G.W)-Math.floor(b/G.W));
// every tile has a unique grid name (rows A.., columns 1..6) so plans, advice and the log can be followed
function tileCoord(i){return 'ABCDEFG'[Math.floor(i/G.W)]+(i%G.W+1)}
function tileName(t){return `${TILEDEF[t.k].n} ${tileCoord(t.i)}`}
// ---------- setup ----------
function newGame(o){o=o||{};const seed=DEFSEED!=null?DEFSEED:Math.floor(Math.random()*2**31);const np=o.np||(o.seats?o.seats.length:2);
  const ex=Object.assign({artisans:false,sultan:false,thieves:false,promos:false},o.ex||{});if(np===5)ex.sultan=true;
  G={v:1,rng:seed,seed,np,ex,round:1,phase:'bid',log:[],logN:0,q:null,over:null,winner:null,winText:'',turn:0,W:6,H:5,walls:{},
    pl:[],board:[],market:[],rdeck:[],rdisc:[],djRow:[],djDeck:[],djDisc:[],bag:[],items:[],itemDisc:[],thRow:[],thDeck:[],
    bids:[],bidQueue:[],order:[],nextBid:[],turnIdx:0,cur:null,step:null,move:null,act:null,turnFx:{},endTrig:false,stats:{kills:0,djinns:0,moves:0}};
  const names=o.names||PNAMES;
  for(let i=0;i<np;i++)G.pl.push({i,nm:names[i],human:o.seats?o.seats[i]==='human':(o.mode==='hot'||(o.mode!=='ai'&&i===0)),lv:(o.lv&&o.lv[i])||'normal',
    coins:50,camels:CAMELS[np],tent:ex.artisans?1:0,vz:0,el:0,art:0,dj:[],res:[],fk:0,items:[],thieves:[],used:{},markers:np===2?2:1});
  buildBoard();
  const colours=Object.keys(MEEPLE_COUNT);const bag=[];for(const c of colours)for(let k=0;k<MEEPLE_COUNT[c];k++)bag.push(c);
  if(ex.artisans)for(let k=0;k<15;k++)bag.push('artisan');if(ex.sultan)for(const c of colours)for(let k=0;k<3;k++)bag.push(c);
  G.meepleTotal=bag.length;G.bag=shuffle(bag);for(const t of G.board)if(!t.block)for(let k=0;k<3;k++)t.m.push(G.bag.pop());
  const rd=[];for(const r in RESOURCE_COUNT)for(let k=0;k<RESOURCE_COUNT[r];k++)rd.push(r);G.rdeck=shuffle(rd);refillMarket();
  G.djDeck=shuffle(DJINNS_FOR(ex).map(d=>d.k));refillDjinns();
  if(ex.artisans){const it=[];for(const k in ITEMS)for(let n=0;n<ITEMS[k].cp;n++)it.push(k);G.items=shuffle(it)}
  if(ex.thieves){G.thDeck=shuffle(Object.keys(THIEVES).filter(k=>k!=='artisan'||ex.artisans));G.thRow=[G.thDeck.shift()]}
  G.track=(np===5?BIDTRACK_5:BIDTRACK_STD).map(c=>({cost:c}));
  const mk=[];for(const p of G.pl)for(let k=0;k<p.markers;k++)mk.push({p:p.i,k});G.bidQueue=shuffle(mk);G.bids=[];G.phase='bid';
  lg(`A new sultanate opens for ${np} players${(()=>{const l=Object.keys(ex).filter(k=>ex[k]).map(k=>({artisans:'the Crafters',sultan:'the Wonder Cities',thieves:'the Cutpurses',promos:'the promo djinns'})[k]).filter(Boolean);return l.length?' with '+l.join(', '):''})()}.`,'big');
  if(typeof refresh==='function')refresh()}
function buildBoard(){const ex=G.ex;const base=shuffle(mkTiles(TILESET,'base'));const art=ex.artisans?shuffle(mkTiles(TILESET_ART,'artisans')):[];const wh=ex.sultan?shuffle(mkTiles(TILESET_WHIM,'sultan')):[];
  let W=6,H=5;if(ex.artisans&&ex.sultan){W=6;H=7}else if(ex.artisans||ex.sultan){W=6;H=6}G.W=W;G.H=H;const N=W*H;const cells=new Array(N).fill(null);
  if(ex.artisans){// the 6 Crafter tiles sit in the inner area with random others; the rest form the border
    const inner=[];for(let r=1;r<H-1;r++)for(let c=1;c<W-1;c++)inner.push(r*W+c);const pool=shuffle(base.concat(wh));const innerTiles=shuffle(art.concat(pool.splice(0,inner.length-art.length)));
    inner.forEach((i,j)=>cells[i]=innerTiles[j]);let k=0;for(let i=0;i<N;i++)if(!cells[i])cells[i]=pool[k++]}
  else{const all=shuffle(base.concat(wh));for(let i=0;i<N;i++)cells[i]=all[i]}
  G.board=cells.map((t,i)=>Object.assign({},t,{i,m:[],camel:null,tent:null,palm:0,pal:0,block:TILEDEF[t.k].block?1:0}));G.walls={};
  // mountains: 2 on each Workshop, on two of its sides, keeping every tile reachable
  if(ex.artisans)for(const t of G.board)if(t.k==='workshop'){let tries=0;let placed=0;while(placed<2&&tries++<40){const ns=nbr(t.i).filter(j=>!G.board[j].block&&!G.walls[wkey(t.i,j)]);if(!ns.length)break;const j=ns[rnd(ns.length)];G.walls[wkey(t.i,j)]=1;if(connected())placed++;else delete G.walls[wkey(t.i,j)]}}}
function connected(){const open=G.board.filter(t=>!t.block).map(t=>t.i);const seen=new Set([open[0]]);const q=[open[0]];while(q.length){const a=q.shift();for(const b of ADJ(a))if(!seen.has(b)){seen.add(b);q.push(b)}}return seen.size===open.length}
function refillMarket(){while(G.market.length<9){if(!G.rdeck.length){if(!G.rdisc.length)break;G.rdeck=shuffle(G.rdisc);G.rdisc=[]}G.market.push(G.rdeck.shift())}}
function refillDjinns(){while(G.djRow.length<3){if(!G.djDeck.length){if(!G.djDisc.length)break;G.djDeck=shuffle(G.djDisc);G.djDisc=[]}G.djRow.push(G.djDeck.shift())}}
// ---------- questions (JSON-safe: a handler key plus data) ----------
const QH={};
function ask(who,title,opts,extra){if(!opts.length)return;G.q=Object.assign({who,title,opts},extra||{});const p=P(who);if(!p.human||UI.sim){const i=aiAnswer(G.q);answerQ(i)}}
function answerQ(i){const q=G.q;G.q=null;const o=q.opts[i];QH[o.h](o.d||{},q);afterQ()}
function afterQ(){if(G.q)return;if(G.pendingEnd){G.pendingEnd=0;endTurn()}}
// ---------- turn order auction ----------
function spotTaken(s){return G.bids.some(b=>b.spot===s)}
function bidPrice(p,spot,fk){const costs=G.track.map(t=>t.cost);const cheaper=[...new Set(costs)].sort((a,b)=>b-a);const i=cheaper.indexOf(costs[spot]);return cheaper[Math.min(cheaper.length-1,i+(fk||0))]}
function bidMoves(p){const o=[];const free=[];const seen=new Set();G.track.forEach((t,s)=>{if(spotTaken(s))return;const key=t.cost;if(seen.has(key))return;seen.add(key);free.push(s)});
  for(const s of free){const maxF=hasDj(p,'dalil')?p.fk:0;for(let f=0;f<=maxF;f++){const pr=bidPrice(p,s,f);if(f&&pr===bidPrice(p,s,f-1))break;if(p.coins>=pr)o.push(f?{act:'bid',spot:s,fk:f}:{act:'bid',spot:s})}}
  // assumption: a player who cannot afford any free spot takes the cheapest one and pays what they have
  if(!o.length&&free.length){const s=free.reduce((a,b)=>G.track[b].cost<G.track[a].cost?b:a);o.push({act:'bid',spot:s})}return o}
function doBid(m){const mk=G.bidQueue.shift();const p=P(mk.p);const pr=Math.min(p.coins,bidPrice(p,m.spot,m.fk));p.coins-=pr;if(m.fk){p.fk-=m.fk;G.rdisc.push(...Array(m.fk).fill('fakir'))}
  G.bids.push({mk,spot:m.spot,n:G.bids.length});lg(`${p.nm} bids ${pr?pr+' coin'+(pr>1?'s':''):'nothing'} for turn order${m.fk?' (Dalil: '+m.fk+' Mystic'+(m.fk>1?'s':'')+')':''}.`);fx('bid',p.i);
  if(!G.bidQueue.length){// play order: dearest spot first; among equal-cost spots the later bidder plays first
    G.order=G.bids.slice().sort((a,b)=>G.track[b.spot].cost-G.track[a.spot].cost||b.n-a.n).map(b=>b.mk);G.phase='turn';G.turnIdx=0;G.nextBid=[];startTurn()}}
// ---------- turns ----------
function startTurn(){const mk=G.order[G.turnIdx];G.cur=mk.p;G.nextBid.push(mk);G.turn++;const p=P(mk.p);p.used={};p.itemUsed=0;G.turnFx={};G.move=null;G.act=null;G.step='move';
  lg(`— ${p.nm}'s turn —`,'turn');fx('turn',p.i);if(!legalStarts().length){lg(`${p.nm} has no legal move and passes.`);G.step='sell'}}
function endTurn(){if(G.q){G.pendingEnd=1;return}G.turnIdx++;G.move=null;G.act=null;G.step=null;if(G.turnIdx>=G.order.length)return endRound();startTurn()}
function endRound(){refillMarket();refillDjinns();if(G.ex.thieves&&!G.thRow.length&&G.thDeck.length)G.thRow.push(G.thDeck.shift());
  if(G.endTrig){lg('The last camel has been placed: the game ends.','big');return finish()}
  if(!legalStarts().length){lg('No legal move remains anywhere on the board.','big');return finish()}
  G.round++;G.bidQueue=G.nextBid.slice();G.bids=[];G.phase='bid';lg(`— Round ${G.round}: bid for turn order —`,'round');fx('round')}
// ---------- movement ----------
function handCounts(h){const o={};for(const c of h)o[c]=(o[c]||0)+1;return o}
// can a hand dropped from `at` (not stepping back to prev) end legally? uses the live board (earlier drops included)
function canFinish(at,prev,hand){if(!hand.length)return true;for(const nx of ADJ(at)){if(nx===prev)continue;if(hand.length===1){if(G.board[nx].m.includes(hand[0]))return true;continue}
  for(const c of new Set(hand)){const h=hand.slice();h.splice(h.indexOf(c),1);const s=G.board[nx].m;G.board[nx].m=s.concat([c]);const ok=canFinish(nx,at,h);G.board[nx].m=s;if(ok)return true}}return false}
// quicker legality for a start tile: order-free check (colours dropped earlier on the final tile count)
function startLegal(s){const t=G.board[s];if(t.block||!t.m.length)return false;const hand=t.m.slice();const saved=t.m;t.m=[];let ok=false;
  const hc=handCounts(hand);const rec=(at,prev,left,visits)=>{for(const nx of ADJ(at)){if(nx===prev)continue;
      if(left===1){const had=G.board[nx].m;for(const c in hc)if(had.includes(c)||(visits[nx]&&hc[c]>=2)){ok=true;return}continue}
      visits[nx]=(visits[nx]||0)+1;rec(nx,at,left-1,visits);visits[nx]--;if(ok)return}};
  rec(s,-1,hand.length,{});t.m=saved;return ok||(G.turnFx.carpet&&hand.length===1&&G.board.some(x=>x.i!==s&&x.m.includes(hand[0])))}
function legalStarts(){const o=[];for(const t of G.board)if(t.m.length&&startLegal(t.i))o.push(t.i);return o}
function pickUp(s){const t=G.board[s];G.move={start:s,at:s,prev:-1,hand:t.m.slice(),path:[s],drops:[]};t.m=[];lg(`${P(G.cur).nm} lifts ${G.move.hand.length} ${G.move.hand.length>1?'people':'person'}${''&&G.move.hand.length>1?'s':''} off ${tileName(t)}.`);fx('pick',s)}
function stepTargets(){const mv=G.move;if(!mv)return[];const o=new Set();for(const nx of ADJ(mv.at)){if(nx===mv.prev)continue;if(dropColors(nx).length)o.add(nx)}
  if(G.turnFx.carpet&&mv.hand.length===1)for(const t of G.board)if(t.i!==mv.at&&t.m.includes(mv.hand[0]))o.add(t.i);return [...o]}
function dropColors(nx){const mv=G.move;const o=[];const carpet=G.turnFx.carpet&&mv.hand.length===1&&!ADJ(mv.at).includes(nx);
  for(const c of new Set(mv.hand)){if(mv.hand.length===1){if(G.board[nx].m.includes(c)&&(carpet||ADJ(mv.at).includes(nx)))o.push(c);continue}
    if(!ADJ(mv.at).includes(nx)||nx===mv.prev)continue;const h=mv.hand.slice();h.splice(h.indexOf(c),1);const s=G.board[nx].m;G.board[nx].m=s.concat([c]);const ok=canFinish(nx,mv.at,h);G.board[nx].m=s;if(ok)o.push(c)}return o}
function dropAt(nx,c){const mv=G.move;mv.hand.splice(mv.hand.indexOf(c),1);G.board[nx].m.push(c);mv.prev=mv.at;mv.at=nx;mv.path.push(nx);mv.drops.push({i:nx,c});fx('drop',nx);trig('drop',G.cur,{i:nx});
  if(!mv.hand.length)finishMove(nx,c)}
function finishMove(e,c){const t=G.board[e];const p=P(G.cur);const n=t.m.filter(x=>x===c).length;t.m=t.m.filter(x=>x!==c);
  G.act={tile:e,color:c,n,tribeDone:false,tileDone:false};G.move=null;lg(`${p.nm} ends on ${tileName(t)} and takes ${n} ${n>1?MPLUR[c]:MNAME[c]}.`,'big');fx('take',e);
  if(!t.m.length&&t.camel==null&&t.tent==null)claimTile(p,e,'auto');G.step='tribe';
  if(['small','large','exchange'].includes(t.k))trig('market',p.i)}
// taking control: a camel (or, with Crafters, the tent)
function claimTile(p,e,how){const t=G.board[e];if(t.camel!=null||t.tent!=null)return;
  if(how==='auto'&&p.tent&&p.human&&!UI.sim){ask(p.i,`Claim ${tileName(t)} with a camel or your tent?`,[{l:'🐪 A camel',h:'claim',d:{p:p.i,e,how:'camel'}},{l:'⛺ The tent (scores its tile and each red tile around it)',h:'claim',d:{p:p.i,e,how:'tent'}}],{kind:'claim'});return}
  if(how==='auto'&&p.tent&&(!p.human||UI.sim)&&aiWantsTent(p,e))how='tent';
  if(how==='tent'&&p.tent){p.tent=0;t.tent=p.i;lg(`⛺ ${p.nm} pitches the tent on ${tileName(t)}.`,'good');fx('camel',e);return}
  if(p.camels<=0){lg(`${p.nm} has no camels left to claim ${tileName(t)}.`);return}t.camel=p.i;p.camels--;lg(`🐪 ${p.nm} claims ${tileName(t)}.`,'good');fx('camel',e);
  if(p.camels===0&&!G.endTrig){G.endTrig=true;lg(`${p.nm} has placed the last camel: the game ends after this round.`,'big')}}
QH.claim=d=>claimTile(P(d.p),d.e,d.how);
function owner(t){return t.camel!=null?t.camel:t.tent!=null?t.tent:null}
// ---------- tribe actions ----------
function killTargets(p,n,fkMax){const a=G.act;const o=[];const two=G.turnFx.ghulam;
  for(const t of G.board){if(t.block||!t.m.length)continue;const d=MDIST(a.tile,t.i);const f=Math.max(0,d-n);if(f>fkMax)continue;const cols=[...new Set(t.m)];
    for(const c of cols)o.push({tile:t.i,c,fk:f});if(two&&t.m.length>=2){for(let x=0;x<cols.length;x++)for(let y=x;y<cols.length;y++){if(x===y&&t.m.filter(q=>q===cols[x]).length<2)continue;o.push({tile:t.i,c:cols[x],c2:cols[y],fk:f})}}}
  for(const q of G.pl){if(q.i===p.i||hasDj(q,'sadim'))continue;for(const c of ['vizier','elder','artisan']){const have=c==='vizier'?q.vz:c==='elder'?q.el:q.art;if(have)o.push({pl:q.i,c,fk:0})}
    if(two){const kinds=[['vizier',q.vz],['elder',q.el],['artisan',q.art]].filter(x=>x[1]);for(let x=0;x<kinds.length;x++)for(let y=x;y<kinds.length;y++){if(x===y&&kinds[x][1]<2)continue;o.push({pl:q.i,c:kinds[x][0],c2:kinds[y][0],fk:0})}}}
  return o}
function tribeMoves(p){const a=G.act;const c=a.color;const o=[];
  if(c==='builder'){for(let f=0;f<=p.fk;f++)o.push(f?{act:'tribe',fk:f}:{act:'tribe'});return o}
  if(c==='assassin'){const ts=killTargets(p,a.n,p.fk);if(!ts.length)return [{act:'tribe',none:1}];for(const k of ts)o.push({act:'tribe',kill:k});return o}
  return [{act:'tribe'}]}
function doTribe(m){const a=G.act;const p=P(G.cur);const c=a.color;a.tribeDone=true;G.step='tile';
  if(c==='vizier'){p.vz+=a.n;lg(`${p.nm} keeps ${a.n} ${a.n>1?'Advisors':'Advisor'}.`,'good');trig('vizier',p.i)}
  else if(c==='elder'){p.el+=a.n;lg(`${p.nm} keeps ${a.n} ${a.n>1?'Sages':'Sage'}.`,'good')}
  else if(c==='artisan'){p.art+=a.n;const k=Math.min(a.n,G.items.length);if(k){const drawn=G.items.splice(0,k);if(drawn.length===1){p.items.push(drawn[0]);lg(`${p.nm} keeps ${a.n} Crafter${a.n>1?'s':''} and takes an item.`,'good')}else ask(p.i,'Your Crafters show you items: keep one',drawn.map((x,j)=>({l:`${ITEMS[x].n}: ${ITEMS[x].x}`,h:'keepItem',d:{p:p.i,keep:j,drawn}})),{kind:'item'})}else lg(`${p.nm} keeps ${a.n} Crafter${a.n>1?'s':''}; the item pile is empty.`,'good')}
  else if(c==='merchant'){const k=Math.min(a.n,G.market.length);const got=G.market.splice(0,k);for(const r of got)gainCard(p,r,1);G.bag.push(...Array(a.n).fill('merchant'));lg(`${p.nm}'s Traders bring ${k} card${k===1?'':'s'}: ${got.map(r=>RNAME[r]).join(', ')}.`,'good');fx('res')}
  else if(c==='builder'){const blues=AROUND(a.tile).filter(i=>G.board[i].blue&&!G.board[i].block).length;const f=m.fk||0;p.fk-=f;G.rdisc.push(...Array(f).fill('fakir'));let gain=(a.n+f)*blues;if(G.turnFx.qirsh)gain*=2;p.coins+=gain;G.bag.push(...Array(a.n).fill('builder'));lg(`${p.nm}'s ${a.n} Mason${a.n>1?'s':''}${f?' and '+f+' Mystic'+(f>1?'s':''):''} earn ${gain} coins (${blues} blue tile${blues===1?'':'s'} around${G.turnFx.qirsh?', doubled':''}).`,'good');fx('coins')}
  else if(c==='assassin'){G.bag.push(...Array(a.n).fill('assassin'));if(m.none){lg(`${p.nm}'s Shadows find no target.`)}else{const k=m.kill;if(k.fk){p.fk-=k.fk;G.rdisc.push(...Array(k.fk).fill('fakir'))}killOne(p,k,k.c);if(k.c2)killOne(p,k,k.c2)}}}
QH.keepItem=d=>{const p=P(d.p);p.items.push(d.drawn[d.keep]);G.itemDisc.push(...d.drawn.filter((x,j)=>j!==d.keep));lg(`${p.nm} keeps an item.`,'good')};
function gainCard(p,r,quiet){if(r==null)return;if(r==='fakir')p.fk++;else p.res.push(r);if(!quiet)lg(`${p.nm} takes ${RNAME[r]}.`,'good')}
function killOne(p,k,c){G.stats.kills++;const sirra=hasDj(p,'sirra');
  if(k.pl!=null){const q=P(k.pl);if(c==='vizier')q.vz--;else if(c==='elder')q.el--;else q.art--;lg(`🗡 ${p.nm}'s Shadow takes one of ${q.nm}'s ${MPLUR[c]}.`,'bad');fx('kill');}
  else{const t=G.board[k.tile];t.m.splice(t.m.indexOf(c),1);lg(`🗡 ${p.nm}'s Shadow takes a ${MNAME[c]} from ${tileName(t)}.`,'bad');fx('kill',k.tile);if(!t.m.length&&t.camel==null&&t.tent==null)claimTile(p,k.tile,'camel')}
  if(sirra){if(c==='merchant'&&G.rdeck.length){gainCard(p,G.rdeck.shift());G.bag.push(c)}else if(c==='builder'&&k.tile!=null){const blues=AROUND(k.tile).filter(i=>G.board[i].blue&&!G.board[i].block).length;p.coins+=blues;lg(`${p.nm} pockets ${blues} coins from the fallen Mason (Sirra).`,'good');G.bag.push(c)}
    else if(c==='vizier'){p.vz++;lg(`${p.nm} keeps the Advisor (Sirra).`,'good')}else if(c==='elder'){p.el++;lg(`${p.nm} keeps the Sage (Sirra).`,'good')}else if(c==='artisan'){p.art++;if(G.items.length)p.items.push(G.items.shift());lg(`${p.nm} keeps the Crafter and draws an item (Sirra).`,'good')}else G.bag.push(c)}
  else G.bag.push(c);trig('kill',p.i)}
// ---------- tile actions ----------
function tileMoves(p){const a=G.act;const t=G.board[a.tile];const o=[];
  switch(t.k){
  case 'village':return placeMoves(p,t,'pal');case 'oasis':return placeMoves(p,t,'palm');
  case 'sacred':{for(const k of G.djRow)for(const pay of summonPays(p))o.push({act:'tile',dj:k,pay});if(G.ex.thieves)for(const k of G.thRow)for(const pay of summonPays(p))o.push({act:'tile',thief:k,pay});break}
  case 'small':if(p.coins>=3)for(let j=0;j<Math.min(3,G.market.length);j++)o.push({act:'tile',take:[j]});break;
  case 'large':if(p.coins>=6){const n=Math.min(6,G.market.length);for(let x=0;x<n;x++)for(let y=x+1;y<n;y++)o.push({act:'tile',take:[x,y]})}break;
  case 'workshop':if(G.items.length){if(p.art>=1)o.push({act:'tile',work:'art'});if(p.fk>=2)o.push({act:'tile',work:'fk'})}break;
  case 'exchange':if(p.coins>=4)for(let j=0;j<G.market.length;j++)o.push({act:'tile',take:[j],ex:1});break}
  o.push({act:'tile',skip:1});return o}
function placeMoves(p,t,what){const flag=what==='pal'?'burhan':'rawda';const o=[{act:'tile',place:t.i}];if(G.turnFx[flag])for(const j of nbr(t.i))if(!G.board[j].block)o.push({act:'tile',place:j});return o}
function summonPays(p){const o=[];if(p.el>=2)o.push({el:2,fk:0});if(p.el>=1&&p.fk>=1)o.push({el:1,fk:1});return o}
function doTile(m){const a=G.act;const p=P(G.cur);const t=G.board[a.tile];a.tileDone=true;G.step='sell';if(m.skip)return;
  if(m.place!=null){if(t.k==='village')placePalace(p,m.place);else placePalm(p,m.place);return}
  if(m.dj){payCost(p,m.pay);G.djRow.splice(G.djRow.indexOf(m.dj),1);gainDjinn(p,m.dj);return}
  if(m.thief){payCost(p,m.pay);G.thRow.splice(G.thRow.indexOf(m.thief),1);p.thieves.push({k:m.thief,turn:G.turn});lg(`🦹 ${p.nm} hires the ${THIEVES[m.thief].n}.`,'big');return}
  if(m.take){const cost=t.k==='small'?3:t.k==='large'?6:4;p.coins-=cost;const got=m.take.slice().sort((x,y)=>y-x).map(j=>G.market.splice(j,1)[0]);for(const r of got)gainCard(p,r,1);lg(`${p.nm} buys ${got.map(r=>RNAME[r]).join(' and ')} for ${cost} coins.`,'good');fx('res');return}
  if(m.work){if(m.work==='art'){p.art--;G.bag.push('artisan')}else{p.fk-=2;G.rdisc.push('fakir','fakir')}p.items.push(G.items.shift());lg(`${p.nm} commissions an item at the Workshop.`,'good');return}}
function placePalace(p,i,viaDj){const t=G.board[i];t.pal++;lg(`🏰 ${p.nm} raises a palace on ${tileName(t)}.`,'good');fx('build',i);trig('palace',p.i)}
function placePalm(p,i){const t=G.board[i];t.palm++;lg(`🌴 ${p.nm} plants a palm on ${tileName(t)}.`,'good');fx('build',i)}
function gainDjinn(p,k){p.dj.push(k);G.stats.djinns++;lg(`✨ ${p.nm} summons ${DJ[k].n}.`,'big');fx('djinn',k);trig('djinn',p.i,{k})}
// ---------- goods sale (end of turn, optional) ----------
function sellValue(n){return SETVP[Math.min(n,9)]}
function sellMoves(p){const kinds=[...new Set(p.res)];const o=[];// offer selling the n kinds you hold most copies of (the dock also lets you choose kinds)
  const byCopies=kinds.sort((a,b)=>p.res.filter(x=>x===b).length-p.res.filter(x=>x===a).length||a.localeCompare(b));for(let n=1;n<=byCopies.length;n++)o.push({act:'sell',kinds:byCopies.slice(0,n).sort()});return o}
function doSell(m){const p=P(G.cur);for(const k of m.kinds)p.res.splice(p.res.indexOf(k),1);G.rdisc.push(...m.kinds);const v=sellValue(m.kinds.length);p.coins+=v;lg(`${p.nm} sells ${m.kinds.length} different goods for ${v} coins.`,'good');fx('coins')}
// ---------- items (Crafters) and cutpurses ----------
function itemMoves(p){const o=[];if(p.itemUsed||!p.items.length)return o;const kinds=new Set(p.items);
  for(const k of kinds){switch(k){
    case 'carpet':if(G.step==='move'&&!G.turnFx.carpet)o.push({act:'item',k});break;
    case 'lamp':if(G.djRow.length)for(const d of G.djRow)o.push({act:'item',k,dj:d});break;
    case 'flute':if(G.step==='move'&&!G.move)for(const t of G.board)if(!t.block&&nbr(t.i).some(j=>G.board[j].m.length))o.push({act:'item',k,t:t.i});break;
    case 'scimitar':if(G.board.some(t=>t.m.length))o.push({act:'item',k});break;
    case 'talisman':{const mine=G.board.filter(t=>t.camel===p.i);const em=G.board.filter(emptyTile);if(mine.length&&em.length)for(const a of mine)for(const b of em)o.push({act:'item',k,from:a.i,to:b.i});break}
    case 'horn':o.push({act:'item',k});break}}return o}
function useItem(p,m){p.items.splice(p.items.indexOf(m.k),1);G.itemDisc.push(m.k);p.itemUsed=1;const I=ITEMS[m.k];lg(`🪄 ${p.nm} uses the ${I.n}.`,'step');fx('item',m.k);
  switch(m.k){
  case 'carpet':G.turnFx.carpet=1;break;
  case 'lamp':G.djRow.splice(G.djRow.indexOf(m.dj),1);gainDjinn(p,m.dj);break;
  case 'flute':fluteStep(p,m.t,5);break;
  case 'scimitar':scimStep(p,2);break;
  case 'talisman':{const a=G.board[m.from],b=G.board[m.to];a.camel=null;b.camel=p.i;lg(`${p.nm}'s camel wanders to ${tileName(b)}.`);break}
  case 'horn':G.rdisc.push(...G.market);G.market=[];refillMarket();lg('A fresh market row is laid out.');break}}
function fluteStep(p,t,left){const opts=[];for(const j of nbr(t))for(const c of new Set(G.board[j].m))opts.push({l:`${MNAME[c]} from ${tileName(G.board[j])}`,h:'flute',d:{p:p.i,t,j,c,left}});if(!opts.length||!left)return;opts.unshift({l:'Done',h:'noop'});ask(p.i,`Reed Pipe: bring a meeple onto ${tileName(G.board[t])} (${left} left)`,opts,{kind:'flute'})}
QH.flute=d=>{const s=G.board[d.j];s.m.splice(s.m.indexOf(d.c),1);G.board[d.t].m.push(d.c);if(!s.m.length&&s.camel==null&&s.tent==null){}fluteStep(P(d.p),d.t,d.left-1)};QH.noop=()=>{};
function scimStep(p,left){if(!left)return;const opts=[];for(const t of G.board)for(const c of new Set(t.m))opts.push({l:`${MNAME[c]} on ${tileName(t)}`,h:'scim',d:{p:p.i,tile:t.i,c,left}});if(!opts.length)return;ask(p.i,`Ember Blade: remove a meeple (${left} left)`,opts,{kind:'kill'})}
QH.scim=d=>{const p=P(d.p);killOne(p,{tile:d.tile},d.c);scimStep(p,d.left-1)};
function thiefMoves(p){if(!G.act||G.act.tribeDone)return[];return p.thieves.filter(t=>t.k===G.act.color&&t.turn!==G.turn&&!G.turnFx.thief).map(t=>({act:'thief',k:t.k}))}
function useThief(p,m){p.thieves.splice(p.thieves.findIndex(t=>t.k===m.k),1);G.turnFx.thief=1;lg(`🦹 ${p.nm} sends the ${THIEVES[m.k].n} out!`,'big');fx('thief');const pool=[];
  for(const q of G.pl){if(q.i===p.i||hasDj(q,'hafiz'))continue;const give=thiefGive(q,m.k);if(give.length)pool.push(...give)}
  if(!pool.length){lg('Nobody has anything to give up.');return}
  const take=m.k==='merchant'?2:1;thiefClaim(p,m.k,pool,take)}
// each rival gives up the least valuable thing of that kind (a real rival would choose; the computer chooses for them)
function thiefGive(q,k){const o=[];switch(k){
  case 'assassin':{const ts=G.board.filter(t=>t.camel===q.i).sort((a,b)=>tileWorth(a)-tileWorth(b));if(ts[0]){ts[0].camel=null;q.camels++;o.push({kind:'tile',i:ts[0].i});lg(`${q.nm} lifts a camel off ${tileName(ts[0])}.`,'bad')}break}
  case 'builder':{const ts=G.board.filter(t=>owner(t)===q.i&&(t.palm||t.pal)).sort((a,b)=>(a.palm?3:5)-(b.palm?3:5));if(ts[0]){const t=ts[0];if(t.palm){t.palm--;o.push({kind:'palm'})}else{t.pal--;o.push({kind:'pal'})}lg(`${q.nm} loses a ${o[0].kind==='palm'?'palm tree':'palace'} from ${tileName(t)}.`,'bad')}break}
  case 'merchant':{for(let n=0;n<2&&q.res.length+q.fk;n++){if(q.fk){q.fk--;o.push({kind:'card',r:'fakir'})}else{const r=q.res.splice(0,1)[0];o.push({kind:'card',r})}}if(o.length)lg(`${q.nm} gives up ${o.length} card${o.length>1?'s':''}.`,'bad');break}
  case 'vizier':if(q.vz){q.vz--;o.push({kind:'vizier'});lg(`${q.nm} gives up an Advisor.`,'bad')}break;
  case 'elder':if(q.dj.length){const k2=q.dj.slice().sort((a,b)=>DJ[a].vp-DJ[b].vp)[0];q.dj.splice(q.dj.indexOf(k2),1);o.push({kind:'dj',k:k2});lg(`${q.nm} gives up ${DJ[k2].n}.`,'bad')}break;
  case 'artisan':if(q.items.length){const it=q.items.shift();o.push({kind:'item',k:it});lg(`${q.nm} gives up an item.`,'bad')}break}return o}
function thiefClaim(p,k,pool,take){if(!take||!pool.length)return;const opts=pool.map((g,j)=>({l:giveLabel(g),h:'thiefTake',d:{p:p.i,k,pool,j,take}}));ask(p.i,`Cutpurse haul: take ${take>1?take+' things':'one'}`,opts,{kind:'thief'})}
QH.thiefTake=d=>{const p=P(d.p);const g=d.pool[d.j];const rest=d.pool.filter((x,j)=>j!==d.j);
  if(g.kind==='tile'){if(p.camels>0){G.board[g.i].camel=p.i;p.camels--;lg(`🐪 ${p.nm} claims ${tileName(G.board[g.i])}.`,'good')}}
  else if(g.kind==='palm'||g.kind==='pal'){const best=G.board.filter(t=>owner(t)===p.i).sort((a,b)=>b.v-a.v)[0]||G.board.find(t=>!t.block);if(g.kind==='palm')best.palm++;else best.pal++;lg(`${p.nm} places it on ${tileName(best)}.`,'good')}
  else if(g.kind==='card')gainCard(p,g.r);else if(g.kind==='vizier'){p.vz++;lg(`${p.nm} gains an Advisor.`,'good')}else if(g.kind==='dj'){p.dj.push(g.k);lg(`${p.nm} gains ${DJ[g.k].n}.`,'good')}else if(g.kind==='item')p.items.push(g.k);
  // the rest goes to the discards
  if(d.take>1)thiefClaim(p,d.k,rest,d.take-1);else for(const x of rest){if(x.kind==='card')G.rdisc.push(x.r);if(x.kind==='dj')G.djDisc.push(x.k);if(x.kind==='item')G.itemDisc.push(x.k);if(x.kind==='vizier')G.bag.push('vizier')}};
function giveLabel(g){return g.kind==='tile'?`the tile ${tileName(G.board[g.i])}`:g.kind==='palm'?'a palm tree':g.kind==='pal'?'a palace':g.kind==='card'?RNAME[g.r]:g.kind==='vizier'?'an Advisor':g.kind==='dj'?DJ[g.k].n:ITEMS[g.k].n}
function tileWorth(t){return t.v+t.palm*3+t.pal*5}
// ---------- the move list ----------
function sideToAct(){if(!G||G.over)return -1;if(G.q)return G.q.who;if(G.phase==='bid')return G.bidQueue[0]?G.bidQueue[0].p:-1;if(G.phase==='turn')return G.cur;return -1}
function validMoves(s){if(!G||G.over)return[];if(s===undefined)s=sideToAct();if(s!==sideToAct()||s<0)return[];const p=P(s);const o=[];
  if(G.q)return G.q.opts.map((x,i)=>({act:'q',i}));
  if(G.phase==='bid')return bidMoves(p);
  const extras=()=>{o.push(...djinnMoves(p),...itemMoves(p))};
  switch(G.step){
  case 'move':if(!G.move){for(const i of legalStarts())o.push({act:'start',tile:i})}else{for(const nx of stepTargets())for(const c of dropColors(nx))o.push({act:'step',tile:nx,c});if(!G.move.drops.length)o.push({act:'undo'})}extras();break;
  case 'tribe':o.push(...tribeMoves(p),...thiefMoves(p));extras();break;
  case 'tile':o.push(...tileMoves(p));extras();break;
  case 'sell':o.push({act:'end'},...sellMoves(p));extras();break}
  return o}
function same(a,b){return JSON.stringify(a)===JSON.stringify(b)}
function performMove(m,s){if(s===undefined)s=sideToAct();let ok=validMoves(s).some(x=>same(x,m));
  if(!ok&&m.act==='sell'&&G.step==='sell'&&s===G.cur){const p=P(s);const k=m.kinds||[];ok=k.length>0&&new Set(k).size===k.length&&k.every(x=>p.res.includes(x))}
  if(!ok)return {success:false,error:'illegal move '+JSON.stringify(m)};const p=P(s);
  switch(m.act){
  case 'q':answerQ(m.i);break;
  case 'bid':doBid(m);break;
  case 'start':pickUp(m.tile);break;
  case 'undo':{const mv=G.move;G.board[mv.start].m=mv.hand.slice();G.move=null;lg(`${p.nm} sets them back down.`);break}
  case 'step':dropAt(m.tile,m.c);break;
  case 'tribe':doTribe(m);break;
  case 'thief':useThief(p,m);break;
  case 'tile':doTile(m);break;
  case 'djinn':p.used[m.k]=1;runDjinn(p,m);break;
  case 'item':useItem(p,m);break;
  case 'sell':doSell(m);break;
  case 'end':endTurn();break}
  G.stats.moves++;if(typeof refresh==='function'&&!UI.sim)refresh();return {success:true}}
// ---------- scoring ----------
function lakeNear(i){return AROUND(i).some(j=>G.board[j].k==='lake')}
function scoreOf(p){const s={coins:p.coins,advisors:0,sages:0,crafters:0,djinns:0,tiles:0,palms:0,palaces:0,goods:0,items:0,cities:0};
  s.advisors=p.vz*(hasDj(p,'wazira')?3:1);for(const q of G.pl)if(q.i!==p.i&&q.vz<p.vz)s.advisors+=10;
  s.sages=p.el*(hasDj(p,'hikma')?4:2);
  if(G.ex.artisans){const most=G.pl.every(q=>q.art<=p.art);s.crafters=p.art*(most?3:2)+(hasDj(p,'sana')?2*p.art:0);
    for(const k of p.items)if(ITEMS[k].kind==='precious')s.items+=ITEMS[k].vp+(hasDj(p,'jawhar')?3:0)}
  for(const k of p.dj)s.djinns+=DJ[k].vp;if(hasDj(p,'majlis'))s.djinns+=5*p.dj.length;
  let cities=0;for(const t of G.board){const own=owner(t);if(own!==p.i)continue;s.tiles+=t.v;const dbl=G.ex.sultan&&lakeNear(t.i)?2:1;s.palms+=t.palm*(hasDj(p,'nakhla')?5:3)*dbl;s.palaces+=t.pal*5*dbl;
    if(t.tent===p.i)s.tiles+=AROUND(t.i).filter(j=>!G.board[j].blue&&!G.board[j].block).length;if(t.k==='city')cities++}
  if(cities)s.cities=5*cities*cities;
  s.goods=goodsBest(p);s.total=Object.values(s).reduce((a,b)=>a+b,0);return s}
function goodsScore(res){const c={};for(const r of res)c[r]=(c[r]||0)+1;let tot=0;while(true){const kinds=Object.keys(c).filter(k=>c[k]>0);if(!kinds.length)break;tot+=SETVP[Math.min(kinds.length,9)];for(const k of kinds)c[k]--}return tot}
// Zarifa: every 2 Mystics = 1 wild goods card; pick the kinds that score best
function goodsBest(p){const w=hasDj(p,'zarifa')?Math.floor(p.fk/2):0;if(!w)return goodsScore(p.res);const kinds=Object.keys(RNAME).filter(k=>k!=='fakir');let best=0;
  const rec=(res,left)=>{if(!left){best=Math.max(best,goodsScore(res));return}for(const k of kinds)rec(res.concat([k]),left-1)};if(w<=3)rec(p.res,w);else{let r=p.res.slice();for(let i=0;i<w;i++){let bk=kinds[0],bv=-1;for(const k of kinds){const v=goodsScore(r.concat([k]));if(v>bv){bv=v;bk=k}}r.push(bk)}best=goodsScore(r)}return best}
function finish(){if(G.over)return;const sc=G.pl.map(p=>({p,s:scoreOf(p)}));sc.sort((a,b)=>b.s.total-a.s.total);const top=sc[0].s.total;const winners=sc.filter(x=>x.s.total===top).map(x=>x.p);
  G.over={scores:sc.map(x=>({p:x.p.i,s:x.s})),win:winners.map(w=>w.i)};G.winner=winners.map(w=>w.nm).join(' & ');G.winText=`${G.winner} ${winners.length>1?'share the win':'wins'} with ${top} points.`;G.phase='over';lg('🏆 '+G.winText,'big');fx('win')}
// ---------- invariants and test hooks ----------
function checkInvariants(){const v=[];if(!G)return v;let n=G.bag.length;for(const t of G.board){n+=t.m.length;if(t.block&&t.m.length)v.push('meeple on a blocked tile')}if(G.move)n+=G.move.hand.length;if(G.act&&!G.act.tribeDone)n+=G.act.n;
  for(const p of G.pl){n+=p.vz+p.el+p.art;if(p.coins<0)v.push(p.nm+' coins negative');if(p.fk<0)v.push(p.nm+' mystics negative');if(p.camels<0)v.push('camels negative');if(p.el<0||p.vz<0||p.art<0)v.push('kept meeples negative')}
  if(n!==G.meepleTotal)v.push(`meeples ${n} != ${G.meepleTotal}`);
  const cards=G.market.length+G.rdeck.length+G.rdisc.length+G.pl.reduce((a,p)=>a+p.res.length+p.fk,0);if(cards!==54)v.push('goods cards '+cards);
  if(!G.over&&sideToAct()<0)v.push('stuck in '+G.phase+'/'+G.step);if(!G.over&&!G.q&&!validMoves().length)v.push('no legal move in '+G.phase+'/'+G.step);return v}
function render_game_to_text(){if(!G)return '{}';return JSON.stringify({round:G.round,phase:G.phase,step:G.step,cur:G.cur,q:G.q&&G.q.title,move:G.move&&{at:G.move.at,hand:G.move.hand},act:G.act,pl:G.pl.map(p=>({nm:p.nm,coins:p.coins,camels:p.camels,vz:p.vz,el:p.el,dj:p.dj,res:p.res.length,fk:p.fk})),log:G.log.slice(0,5).map(l=>l.t)})}
QH.ruya=d=>{gainDjinn(P(d.p),d.k);G.djDisc.push(...d.top.filter(x=>x!==d.k))};

// ---------- campaign twists: applied right after newGame(); the normal rules never change ----------
function applyTwist(def){const tw=def&&def.twist&&def.twist.id,par=def&&def.twist&&def.twist.param;if(!tw)return;const boss=G.pl[1];
  if(tw==='head-start')G.pl[0].coins+=par;
  else if(tw==='boss-purse')boss.coins+=par;
  else if(tw==='boss-goods'){for(let k=0;k<par&&G.rdeck.length;k++){const r=G.rdeck.shift();if(r==='fakir')boss.fk++;else boss.res.push(r)}refillMarket()}
  else if(tw==='boss-djinn'){let i=G.djDeck.indexOf(par);if(i>=0)G.djDeck.splice(i,1);else{i=G.djRow.indexOf(par);if(i>=0){G.djRow.splice(i,1);refillDjinns()}}boss.dj.push(par)}
  else if(tw==='short-road'){for(const p of G.pl)p.camels=Math.max(4,p.camels-par)}
  else if(tw==='boss-favour')G.boss={seat:1,favour:par};
  if(def.twist.coins)boss.coins+=def.twist.coins}

// ---------- computer players: plan the whole move (start, path, colour), then play it step by step ----------
let AIPLAN=null;
const LVL={easy:{noise:4,depth:3000},normal:{noise:.25,depth:20000},hard:{noise:0,depth:60000}};
function aiNoise(p){return (LVL[p.lv]||LVL.normal).noise}
// every legal outcome of picking up tile s: {s,e,c,n,path}
function outcomes(s,cap){const t=G.board[s];const hand=t.m.slice();const saved=t.m;t.m=[];const hc=handCounts(hand);const L=hand.length;const res={};let nodes=0;
  const path=[s];const visits={};
  const rec=(at,prev,left)=>{if(nodes++>cap)return;for(const nx of ADJ(at)){if(nx===prev)continue;path.push(nx);
      if(left===1){const had=G.board[nx].m;for(const c in hc){const pre=had.filter(x=>x===c).length;const extra=Math.min(visits[nx]||0,hc[c]-1);if(pre||extra){const n=pre+extra+1;const key=nx+c;if(!res[key]||res[key].n<n)res[key]={s,e:nx,c,n,path:path.slice()}}}}
      else{visits[nx]=(visits[nx]||0)+1;rec(nx,at,left-1);visits[nx]--}path.pop()}};
  rec(s,-1,L);t.m=saved;return Object.values(res)}
function goodsGain(p,cards){const base=goodsBest(p);const q=Object.assign({},p,{res:p.res.concat(cards.filter(r=>r!=='fakir')),fk:p.fk+cards.filter(r=>r==='fakir').length});return goodsBest(q)-base+cards.filter(r=>r==='fakir').length*1.2}
function djValue(p,k){const d=DJ[k];let v=d.vp;const left=Math.max(1,12-G.round*1.2);
  if(d.cost)v+=Math.min(6,left*.6);if(k==='nakhla')v+=G.board.filter(t=>owner(t)===p.i).reduce((a,t)=>a+t.palm*2,0)+2;if(k==='wazira')v+=p.vz*2+2;if(k==='hikma')v+=p.el*2+2;if(k==='zarifa')v+=Math.floor(p.fk/2)*3;if(k==='majlis')v+=5*(p.dj.length+1);
  if(['harith','qasra','khanjar','tariq','amir'].includes(k))v+=left*.8;return v}
function bestSummon(p){let b=null,bv=-1e9;for(const k of G.djRow)for(const pay of summonPays(p)){const cost=pay.el*2+pay.fk*1.5;const v=djValue(p,k)-cost;if(v>bv){bv=v;b={k,pay}}}return {b,v:bv}}
function vizierValue(p,n){const others=G.pl.filter(q=>q.i!==p.i);let v=n*(hasDj(p,'wazira')?3:1);for(const q of others){const before=q.vz<p.vz,after=q.vz<p.vz+n;if(!before&&after)v+=10*(G.round>3?1:.7);else if(!after&&q.vz-p.vz<=n+2)v+=2}return v}
function killValue(p,n,tile){let best=0;for(const q of G.pl){if(q.i===p.i||hasDj(q,'sadim'))continue;if(q.vz){const leader=G.pl.every(x=>x.vz<=q.vz);best=Math.max(best,leader?6:2)}if(q.el)best=Math.max(best,3+(q.el>=2?1:0))}
  for(const t of G.board){if(t.block||!t.m.length||MDIST(tile,t.i)>n+p.fk)continue;if(t.m.length===1&&t.camel==null&&t.tent==null)best=Math.max(best,tileWorth(t)-2)}return best}
function evalOutcome(p,o){const t=G.board[o.e];let v=0;
  // after the move: what remains on the end tile?
  const baseM=o.e===o.s?[]:t.m;const visitsE=o.path.slice(1,-1).filter(i=>i===o.e).length;const extraC=o.n-1-baseM.filter(x=>x===o.c).length;const remain=baseM.filter(x=>x!==o.c).length+Math.max(0,visitsE-extraC);
  const mine=owner(t)===p.i||(owner(t)==null&&remain<=0&&p.camels>0);const theirs=owner(t)!=null&&owner(t)!==p.i;
  if(owner(t)==null&&remain<=0&&p.camels>0)v+=tileWorth(t)+(t.k==='city'?6:0)+(G.endTrig?0:1)-(p.camels<=2&&!aiAhead(p)?6:0);
  switch(o.c){case 'vizier':v+=vizierValue(p,o.n);break;case 'elder':v+=o.n*(hasDj(p,'hikma')?4:2)+(G.djRow.length?o.n*1.5:0);break;
    case 'merchant':v+=goodsGain(p,G.market.slice(0,o.n));break;case 'builder':{const blues=AROUND(o.e).filter(i=>G.board[i].blue&&!G.board[i].block).length;v+=o.n*blues;break}
    case 'assassin':v+=killValue(p,o.n,o.e);break;case 'artisan':v+=o.n*2.6+(G.items.length?4:0);break}
  switch(t.k){case 'village':v+=mine?5:theirs?-4:1;break;case 'oasis':v+=mine?(hasDj(p,'nakhla')?5:3):theirs?-2.5:1;break;
    case 'sacred':{const pe=Object.assign({},p,{el:p.el+(o.c==='elder'?o.n:0)});const s=bestSummon(pe);if(s.b)v+=Math.max(0,s.v);break}
    case 'small':if(p.coins>=3)v+=Math.max(0,Math.max(...G.market.slice(0,3).map(r=>goodsGain(p,[r])))-3);break;
    case 'large':if(p.coins>=6){const f=G.market.slice(0,6);let b=0;for(let x=0;x<f.length;x++)for(let y=x+1;y<f.length;y++)b=Math.max(b,goodsGain(p,[f[x],f[y]]));v+=Math.max(0,b-6)}break;
    case 'exchange':if(p.coins>=4)v+=Math.max(0,Math.max(0,...G.market.map(r=>goodsGain(p,[r])))-4);break;
    case 'workshop':if(G.items.length&&(p.art||p.fk>=2))v+=3;break}
  if(G.boss&&G.boss.seat===p.i&&o.c===G.boss.favour)v+=6;// campaign boss rule: this boss prefers one tribe
  return v+(Math.random()-.5)*aiNoise(p)*6}
function aiAhead(p){const s=scoreOf(p).total;return G.pl.every(q=>q.i===p.i||scoreOf(q).total<=s)}
function planTurn(p){const cap=(LVL[p.lv]||LVL.normal).depth;let best=null,bv=-1e9;for(const s of legalStarts())for(const o of outcomes(s,cap)){const v=evalOutcome(p,o);if(v>bv){bv=v;best=o}}return best&&Object.assign(best,{v:bv})}
function bestTurnValue(p){const b=planTurn(Object.assign({},p,{lv:'hard'}));return b?b.v:0}
// the next concrete move for side s
function aiMove(s){const p=P(s);const vm=validMoves(s);if(!vm.length)return null;const by=a=>vm.filter(m=>m.act===a);
  if(G.q)return {act:'q',i:aiAnswer(G.q)};
  if(G.phase==='bid'){const v=bestTurnValue(p);const budget=Math.max(0,v*.35-2);let pick=vm[vm.length-1];let pv=-1;for(const m of vm){const pr=bidPrice(p,m.spot,m.fk);if(pr<=budget&&G.track[m.spot].cost>pv){pv=G.track[m.spot].cost;pick=m}}return pick}
  const dj=aiDjinn(p,vm);if(dj)return dj;const it=aiItem(p,vm);if(it)return it;
  switch(G.step){
  case 'move':{if(!G.move){AIPLAN=planTurn(p);if(!AIPLAN)return vm[0];return {act:'start',tile:AIPLAN.s}}
    const pl=AIPLAN;const k=G.move.path.length;const nx=pl&&pl.path[k];const steps=by('step');if(nx==null)return steps[0];const here=steps.filter(m=>m.tile===nx);if(!here.length)return steps[0];
    const last=G.move.hand.length===1;const want=pl.c;const cnt=G.move.hand.filter(x=>x===want).length;
    if(last)return here.find(m=>m.c===want)||here[0];if(nx===pl.e&&cnt>1){const m=here.find(m=>m.c===want);if(m)return m}
    return here.find(m=>m.c!==want)||here[0]}
  case 'tribe':{const th=by('thief')[0];if(th)return th;const tr=by('tribe');if(G.act.color==='builder'){const blues=AROUND(G.act.tile).filter(i=>G.board[i].blue&&!G.board[i].block).length;if(blues>=4&&p.fk)return tr[tr.length-1]||tr[0];return tr[0]}
    if(G.act.color==='assassin')return bestKill(p,tr);return tr[0]}
  case 'tile':{const tm=by('tile');const t=G.board[G.act.tile];
    if(t.k==='village'||t.k==='oasis'){let b=tm[0],bv=-1e9;for(const m of tm){if(m.place==null)continue;const tt=G.board[m.place];const v=owner(tt)===p.i?3:owner(tt)==null?0:-3;if(v>bv){bv=v;b=m}}return b}
    if(t.k==='sacred'){const s=bestSummon(p);if(s.b&&s.v>0)return tm.find(m=>m.dj===s.b.k&&same(m.pay,s.b.pay))||tm[tm.length-1];const th=tm.find(m=>m.thief);if(th&&G.round>2&&Math.random()<.3)return th;return tm[tm.length-1]}
    let b=tm[tm.length-1],bv=0;for(const m of tm){if(!m.take)continue;const cost=t.k==='small'?3:t.k==='large'?6:4;const v=goodsGain(p,m.take.map(j=>G.market[j]))-cost;if(v>bv){bv=v;b=m}}
    if(t.k==='workshop'){const w=tm.find(m=>m.work==='art')||tm.find(m=>m.work==='fk');if(w)return w}return b}
  case 'sell':{// sell only when coins would win a close bid next round? keep it simple: sell duplicate-heavy sets late
    if(G.endTrig&&false)return by('sell')[0];return by('end')[0]}}
  return vm[0]}
function bestKill(p,tr){let b=tr[0],bv=-1e9;for(const m of tr){if(m.none)return m;const k=m.kill;let v=-k.fk*1.2;
    if(k.pl!=null){const q=P(k.pl);if(k.c==='vizier')v+=G.pl.every(x=>x.vz<=q.vz)?6:2;if(k.c==='elder')v+=3;if(k.c==='artisan')v+=2.5;v+=scoreOf(q).total>scoreOf(p).total?1.5:0}
    else{const t=G.board[k.tile];const left=t.m.length-(k.c2?2:1);if(left<=0&&t.camel==null&&t.tent==null&&p.camels>0)v+=tileWorth(t)-1;else v+=.5}
    if(k.c2)v+=1.5;if(v>bv){bv=v;b=m}}return b}
function aiDjinn(p,vm){const ds=vm.filter(m=>m.act==='djinn');if(!ds.length)return null;
  for(const m of ds){const cheap=m.pay.fk?1.5:m.pay.el*2;
    if(m.k==='suqra')return m;
    if((m.k==='wahha'||m.k==='nuraya')&&owner(G.board[m.t])===p.i&&cheap<=2.5)return m;
    if((m.k==='jamal'||m.k==='fath')&&tileWorth(G.board[m.t])>=8+cheap&&!aiShort(p))return m;
    if(m.k==='qirsh'){const blues=AROUND(G.act.tile).filter(i=>G.board[i].blue).length;if(G.act.n*blues>=cheap+6)return m}
    if(m.k==='ruya'&&p.el>=3&&m.pay.el<=1)return m}return null}
function aiShort(p){return p.camels<=1}
function aiItem(p,vm){const it=vm.filter(m=>m.act==='item');for(const m of it){if(m.k==='lamp'){const s=G.djRow.map(k=>({k,v:djValue(p,k)})).sort((a,b)=>b.v-a.v)[0];if(s&&s.k===m.dj)return m}
    if(m.k==='horn'&&G.step==='sell')return m}return null}
function aiWantsTent(p,e){const t=G.board[e];const red=AROUND(e).filter(j=>!G.board[j].blue&&!G.board[j].block).length;return red>=5||(tileWorth(t)>=10&&red>=3)}
function aiAnswer(q){const p=P(q.who);switch(q.kind){
  case 'claim':return aiWantsTent(p,q.opts[1].d.e)?1:0;
  case 'item':{let b=0,bv=-1;q.opts.forEach((o,i)=>{const k=o.d.drawn[o.d.keep];const v=ITEMS[k].kind==='precious'?ITEMS[k].vp:k==='lamp'?7:k==='scimitar'?5:3;if(v>bv){bv=v;b=i}});return b}
  case 'djinn':{let b=0,bv=-1;q.opts.forEach((o,i)=>{const k=q.cards[i];const v=djValue(p,k);if(v>bv){bv=v;b=i}});return b}
  case 'flute':return q.opts.length>1&&Math.random()<.7?1:0;
  case 'thief':return 0;default:return 0}}

// ---------- the rules, in plain words ----------
const RULES_HTML=`<div class="rules">
<p>The old sultan is gone and the sultanate of Qamar is up for grabs. Shift its tribes from tile to tile, claim land with your camels, summon djinns and trade in the bazaar. <b>The most points at the end wins.</b></p>
<h3>1. Bid for turn order</h3>
<p>Each round starts with a bid. In the order of the last round, each player puts a marker on a free spot of the turn-order track and pays its price: 0, 0, 0, 1, 3, 5, 8, 12 or 18 coins. Dearer spots play earlier. If two players sit on spots with the same price, the one who bid later plays first. With 2 players, each of you has two markers and so takes two turns a round.</p>
<h3>2. Your turn: move, then act</h3>
<ol>
<li><b>Lift</b> everyone from one tile.</li>
<li><b>Drop</b> them one by one: one on each next tile, moving up, down, left or right. You may not step straight back onto the tile you just left (you may pass a tile again later). Mountains block the way.</li>
<li>The <b>last</b> person must land on a tile that already holds its colour. Then you take everyone of that colour from that tile.</li>
<li>If the tile is now empty, you claim it: put one of your camels there (or your tent, with the Crafters).</li>
<li>Do the <b>tribe action</b> of the colour you took, then the <b>tile action</b> of the tile you ended on (both optional where the card says “may”).</li>
<li>At the end of your turn you may <b>sell</b> a set of different goods for coins.</li>
</ol>
<h3>3. The tribes</h3>
<ul>
<li><b>Advisors (yellow)</b>: keep them. 1 point each, and 10 more for every rival who has fewer.</li>
<li><b>Sages (white)</b>: keep them. 2 points each. Spend them to summon djinns and use djinn powers.</li>
<li><b>Traders (green)</b>: take that many goods cards from the front of the market row. They go back to the bag.</li>
<li><b>Masons (blue)</b>: earn coins: the number of Masons times the blue tiles around you (the 3×3 square, your tile included). Each Mystic card you spend adds 1 Mason.</li>
<li><b>Shadows (red)</b>: remove one person up to that many steps away, or one Advisor or Sage kept by a rival. Each Mystic adds 1 step. If a tile empties, you claim it.</li>
<li><b>Crafters (purple, expansion)</b>: keep them, draw that many items, keep one.</li>
</ul>
<h3>4. The tiles</h3>
<ul>
<li><b>Hamlet</b>: place a palace here (5 points to whoever holds the tile).</li>
<li><b>Oasis</b>: plant a palm tree (3 points to whoever holds the tile).</li>
<li><b>Shrine</b>: you may summon one face-up djinn by paying 2 Sages, or 1 Sage and 1 Mystic.</li>
<li><b>Bazaar Stall</b>: you may pay 3 coins for one of the first 3 goods. <b>Grand Bazaar</b>: 6 coins for two of the first 6.</li>
</ul>
<h3>5. Goods and Mystics</h3>
<p>Goods score in sets of different kinds: 1, 3, 7, 13, 21, 30, 40, 50 or 60 points for 1 to 9 kinds. Build as many sets as you can. Mystics are special cards: they never score, but they boost Masons and Shadows, stand in for a Sage when summoning, and pay djinn powers.</p>
<h3>6. The end</h3>
<p>When someone places their last camel, the round is finished and the game ends. It also ends if no legal move is left on the board. Score coins, Advisors, Sages, djinns, the tiles you hold (with their palms and palaces), goods, and any expansion extras. Ties go to the player with more coins.</p>
<h3>Expansions (switch them on at the start)</h3>
<ul>
<li><b>The Crafters</b>: purple Crafters, Workshops (pay 1 Crafter or 2 Mystics for an item), Spice Exchanges (4 coins for any face-up good), a Ravine, mountains beside the Workshops, and a tent for each player. The player with the most Crafters scores 3 for each, everyone else 2. Precious items score points; magic items are one-shot powers.</li>
<li><b>Wonder Cities</b>: Wonder City tiles (5, 20, 45, 80 or 125 points for holding 1 to 5), the Great Lake (palms and palaces next to it score double) and room for a 5th player.</li>
<li><b>Cutpurses</b>: at a Shrine you may hire the face-up cutpurse instead of a djinn. Later, when you take people of its colour, send it out: every rival gives something up and you take the best of it.</li>
<li><b>Promo djinns</b>: three extra djinns join the deck.</li>
</ul>
<p class="muted small">Tip: tap the glowing tiles on the board. The panel on the right always says what the game is waiting for; the card list explains every djinn, tile, good and token.</p>
<h3>Credits</h3>
<section class="credits-audio">
<h4>Audio</h4>
<p>With thanks to these public-domain (CC0) creators:</p>
<ul>
<li>Music: &ldquo;Desert Loop&rdquo; by iamoneabe (<a href="https://opengameart.org/content/desert-loop" target="_blank" rel="noopener">OpenGameArt</a>, CC0)</li>
<li>Sound effects: Casino Audio, Digital Audio, Impact Sounds, Interface Sounds, Music Jingles, RPG Audio, UI Audio by <a href="https://kenney.nl" target="_blank" rel="noopener">Kenney</a> (CC0)</li>
</ul>
<p class="muted small">All sounds were trimmed, loudness-normalised and converted to MP3 for this game.</p>
</section>
<p class="muted small">Names, card text and art are original.</p>
</div>`;

// ---------- the painted dusk over the sultanate (start screen banner) ----------
function paintOpening(){const c=document.getElementById('opencv');if(!c)return;let x=null;try{x=c.getContext('2d')}catch(e){}if(!x)return;const w=c.width,h=c.height;
  // golden-hour sky with a low sun and soft rays
  let g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,'#5a2a4a');g.addColorStop(.35,'#d8744a');g.addColorStop(.62,'#f6c070');g.addColorStop(1,'#f2b765');x.fillStyle=g;x.fillRect(0,0,w,h);
  const sx=w*.72,sy=h*.5;let rg=x.createRadialGradient(sx,sy,0,sx,sy,h*.9);rg.addColorStop(0,'rgba(255,245,210,.95)');rg.addColorStop(.12,'rgba(255,225,150,.6)');rg.addColorStop(1,'rgba(255,200,120,0)');x.fillStyle=rg;x.fillRect(0,0,w,h);
  x.save();x.globalAlpha=.12;x.fillStyle='#fff3d0';for(let k=0;k<9;k++){const a=-Math.PI*.95+k*Math.PI*.11;x.beginPath();x.moveTo(sx,sy);x.lineTo(sx+Math.cos(a)*w,sy+Math.sin(a)*w);x.lineTo(sx+Math.cos(a+.04)*w,sy+Math.sin(a+.04)*w);x.fill()}x.restore();
  x.fillStyle='#fff6dc';x.beginPath();x.arc(sx,sy,h*.09,0,7);x.fill();
  // three layers of skyline, fading with distance
  const dome=(cx,base,r,hh)=>{x.fillRect(cx-r,base-hh,r*2,hh);x.beginPath();x.moveTo(cx-r*1.05,base-hh);x.bezierCurveTo(cx-r*1.25,base-hh-r*1.1,cx-r*.2,base-hh-r*1.2,cx,base-hh-r*1.9);x.bezierCurveTo(cx+r*.2,base-hh-r*1.2,cx+r*1.25,base-hh-r*1.1,cx+r*1.05,base-hh);x.fill();x.fillRect(cx-1,base-hh-r*2.3,2,r*.5)};
  const mina=(cx,base,wd,hh)=>{x.fillRect(cx-wd/2,base-hh,wd,hh);x.fillRect(cx-wd*.8,base-hh*.72,wd*1.6,3);x.beginPath();x.moveTo(cx-wd*.6,base-hh);x.lineTo(cx,base-hh-wd*2.2);x.lineTo(cx+wd*.6,base-hh);x.fill()};
  const layer=(col,base,sc,seed)=>{x.fillStyle=col;let s=seed;const R=()=>{s=(s*16807)%2147483647;return s/2147483647};x.fillRect(0,base,w,h-base);for(let X=-20;X<w+20;){const t=R();if(t<.4){const r=(10+R()*14)*sc;dome(X+r,base,r,(8+R()*20)*sc);X+=r*2+6*sc}else if(t<.6){const wd=6*sc;mina(X+wd,base,wd,(40+R()*40)*sc);X+=wd*3}else{const bw=(20+R()*40)*sc;x.fillRect(X,base-(10+R()*18)*sc,bw,40*sc);X+=bw}}};
  layer('rgba(170,90,80,.55)',h*.62,.7,7);layer('rgba(130,60,50,.8)',h*.68,.95,19);layer('#5e2718',h*.74,1.2,31);
  // dunes in the foreground with a rim of light
  g=x.createLinearGradient(0,h*.72,0,h);g.addColorStop(0,'#e7a55c');g.addColorStop(1,'#b8672f');x.fillStyle=g;x.beginPath();x.moveTo(0,h*.8);x.quadraticCurveTo(w*.3,h*.7,w*.55,h*.8);x.quadraticCurveTo(w*.8,h*.9,w,h*.78);x.lineTo(w,h);x.lineTo(0,h);x.fill();
  x.strokeStyle='rgba(255,230,170,.7)';x.lineWidth=2;x.beginPath();x.moveTo(0,h*.8);x.quadraticCurveTo(w*.3,h*.7,w*.55,h*.8);x.stroke();
  // a caravan crossing the dune
  x.fillStyle='#3a160c';const camel=(cx,cy,s)=>{x.save();x.translate(cx,cy);x.scale(s,s);x.beginPath();x.moveTo(-20,0);x.bezierCurveTo(-18,-14,-8,-24,0,-16);x.bezierCurveTo(6,-22,12,-14,14,-8);x.lineTo(20,-20);x.lineTo(26,-20);x.lineTo(24,-16);x.lineTo(18,-4);x.lineTo(14,2);x.lineTo(-18,2);x.fill();for(const lx of [-15,-10,8,12])x.fillRect(lx,0,2.5,16);x.restore()};
  camel(w*.2,h*.74,1.1);camel(w*.29,h*.72,1);camel(w*.37,h*.71,.9);
  // the tribes as turned pawns, lit from the sun
  const cols=['#f0b72a','#f3eee2','#3a9a48','#2c62c6','#c9312a'];for(let k=0;k<5;k++){const px=w*(.58+k*.075),py=h*.93;const gg=x.createLinearGradient(px-10,0,px+10,0);gg.addColorStop(0,'rgba(0,0,0,.25)');gg.addColorStop(.6,'rgba(255,255,255,.25)');gg.addColorStop(1,'rgba(0,0,0,.1)');
    x.fillStyle='rgba(60,20,5,.35)';x.beginPath();x.ellipse(px+6,py+2,16,4,0,0,7);x.fill();for(const f of [cols[k],gg]){x.fillStyle=f;x.beginPath();x.moveTo(px-12,py);x.quadraticCurveTo(px-12,py-6,px-7,py-8);x.quadraticCurveTo(px-4,py-20,px-4,py-26);x.lineTo(px+4,py-26);x.quadraticCurveTo(px+4,py-20,px+7,py-8);x.quadraticCurveTo(px+12,py-6,px+12,py);x.fill();x.fillRect(px-6,py-29,12,3);x.beginPath();x.arc(px,py-36,7.5,0,7);x.fill()}}
  // gilded arch frame
  x.strokeStyle='rgba(224,165,58,.9)';x.lineWidth=3;x.strokeRect(6,6,w-12,h-12);x.strokeStyle='rgba(255,230,170,.35)';x.lineWidth=1;x.strokeRect(11,11,w-22,h-22)}

// ---------- sound: recorded samples (audio/gameaudio.js + audio-data.js) with the synthesized sounds below as the fallback ----------
// One line per event: s = sample name in GA_DATA (null = use the synth), vol = gain (1 = as normalised), duck = dip the music under it.
// Swapping or muting a sound later is a one-line change here.
const SND_MAP={
  // levels measured on the decoded samples (loudest 100 ms): events land near -16 dB, UI clicks near -33 dB
  click:{s:'click',vol:.5},       // UI button: kept quiet
  pick:{s:'pick',vol:.9},
  drop:{s:'drop',vol:.9},         // plays on every pawn dropped, so not boosted
  take:{s:'take',vol:.6},
  camel:{s:'camel',vol:.8},
  coins:{s:'coins',vol:1.2},      // soft coin rattle, +1.6 dB
  kill:{s:'kill',vol:.8},
  djinn:{s:'djinn',vol:.8,duck:true},
  build:{s:'build',vol:.8},
  bid:{s:'bid',vol:1.4},          // short chip click, +2.9 dB
  round:{s:'round',vol:.6,duck:true},
  win:{s:'win',vol:.85},          // ducks the music by itself (GA default list)
  bad:{s:'bad',vol:.55}
};
const SND={ctx:null,on:true,music:true,pitch:1,vol:.7,last:{},nb:null,beat:0,mTimer:null};
try{SND.on=localStorage.getItem('soq_snd')!=='0';SND.music=localStorage.getItem('soq_mus')!=='0'}catch(e){}
function audioInit(){if(SND.ctx)return true;const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return false;
  try{const c=SND.ctx=new AC();const comp=c.createDynamicsCompressor();comp.threshold.value=-14;comp.ratio.value=4;comp.connect(c.destination);
    SND.master=c.createGain();SND.master.gain.value=SND.on?SND.vol:0;SND.master.connect(comp);
    SND.fxBus=c.createGain();SND.fxBus.connect(SND.master);SND.musBus=c.createGain();SND.musBus.gain.value=.3;SND.musBus.connect(SND.master);
    const len=c.sampleRate*1.5,b=c.createBuffer(1,len,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;SND.nb=b;
    if(SND.music)musicStart();return true}catch(e){SND.ctx=null;return false}}
document.addEventListener('pointerdown',()=>{if(audioInit()&&SND.ctx.state==='suspended')SND.ctx.resume()},{capture:true});
document.addEventListener('keydown',()=>{if(audioInit()&&SND.ctx.state==='suspended')SND.ctx.resume()},{capture:true});
// samples share the synth's AudioContext (created on the first gesture); GA stays silent without Web Audio (jsdom) and never throws
const HAS_GA=typeof GA!=='undefined'&&typeof GA_DATA!=='undefined';
if(HAS_GA){GA.init({sfx:GA_DATA.sfx,music:GA_DATA.music,key:'soq',ctx:()=>{audioInit();return SND.ctx}});GA.setSfx(SND.on);GA.setMusic(SND.music)}
// the recorded music takes over unless Web Audio is missing or its track failed to decode
function gaMusicOk(){if(!HAS_GA)return false;const st=GA.state();return !!GA.playing()||(st.audio&&(st.failed||[]).indexOf('main')<0)}
function env(g,t,a,peak,dur){g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(peak,t+a);g.gain.exponentialRampToValueAtTime(0.0001,t+dur)}
function tone(f,dur,o){o=o||{};const c=SND.ctx,t=c.currentTime+(o.at||0);const osc=c.createOscillator(),g=c.createGain();osc.type=o.type||'sine';
  osc.frequency.setValueAtTime(f,t);if(o.to)osc.frequency.exponentialRampToValueAtTime(o.to,t+dur);if(o.det)osc.detune.value=o.det;
  let last=osc;if(o.lp){const fl=c.createBiquadFilter();fl.type='lowpass';fl.frequency.value=o.lp;last.connect(fl);last=fl}
  if(o.vib){const l=c.createOscillator(),lg=c.createGain();l.frequency.value=o.vib;lg.gain.value=o.vibAmt||f*.06;l.connect(lg);lg.connect(osc.frequency);l.start(t);l.stop(t+dur+.05)}
  last.connect(g);g.connect(o.bus||SND.fxBus);env(g,t,o.a||.008,o.v||.3,dur);osc.start(t);osc.stop(t+dur+.05)}
function noise(dur,o){o=o||{};const c=SND.ctx,t=c.currentTime+(o.at||0);const s=c.createBufferSource();s.buffer=SND.nb;s.playbackRate.value=o.rate||1;
  const fl=c.createBiquadFilter();fl.type=o.ft||'bandpass';fl.frequency.setValueAtTime(o.f||2000,t);if(o.fto)fl.frequency.exponentialRampToValueAtTime(o.fto,t+dur);fl.Q.value=o.q||1;
  const g=c.createGain();s.connect(fl);fl.connect(g);g.connect(o.bus||SND.fxBus);env(g,t,o.a||.004,o.v||.3,dur);s.start(t,Math.random());s.stop(t+dur+.05)}
const thump=(at,v)=>{tone(120,.35,{to:38,v:v||.7,at});noise(.18,{ft:'lowpass',f:500,v:(v||.7)*.5,at})};
function sfx(name){if(!SND.on)return;const m=SND_MAP[name];
  if(HAS_GA&&m&&m.s&&GA.has(m.s)){if(typeof window!=='undefined'&&window.__sfxLog)window.__sfxLog.push(name+':sample');GA.play(m.s,{vol:m.vol,duck:m.duck,cooldown:name==='drop'?40:80});return}
  if(!SND.ctx||SND.ctx.state!=='running')return;if(typeof window!=='undefined'&&window.__sfxLog)window.__sfxLog.push(name+':synth');const now=performance.now();if(now-(SND.last[name]||0)<(name==='drop'?40:80))return;SND.last[name]=now;
  try{switch(name){
  case 'click':tone(1100,.03,{type:'triangle',v:.05});break;
  case 'pick':noise(.08,{f:1800,q:3,v:.18});tone(420,.08,{type:'triangle',v:.1,to:620});break;
  case 'drop':tone(660+Math.random()*120,.07,{type:'triangle',v:.12});noise(.03,{f:3000,q:4,v:.1});break;
  case 'take':[523,659,784].forEach((f,k)=>tone(f,.18,{type:'triangle',v:.1,at:k*.06}));break;
  case 'camel':tone(180,.25,{type:'sawtooth',to:120,v:.12,lp:900});thump(.05,.4);break;
  case 'coins':for(let k=0;k<6;k++)tone(1800+Math.random()*900,.06,{type:'square',v:.04,lp:5000,at:k*.05});break;
  case 'kill':noise(.25,{f:4000,fto:800,q:2,v:.25});tone(200,.2,{type:'sawtooth',to:90,v:.12,lp:800});break;
  case 'djinn':tone(440,1.1,{type:'sine',v:.12,vib:6,vibAmt:30});tone(660,1.1,{type:'sine',v:.08,at:.1,vib:5,vibAmt:25});noise(.9,{f:6000,fto:2000,q:1,v:.06,a:.3});break;
  case 'build':thump(0,.5);noise(.05,{f:2600,q:6,v:.2,at:.1});break;
  case 'bid':tone(880,.1,{type:'triangle',v:.1});tone(1320,.14,{type:'triangle',v:.08,at:.08});break;
  case 'round':[392,523,659].forEach((f,k)=>tone(f,.4,{type:'sine',v:.1,at:k*.12}));break;
  case 'win':[523,659,784,1047,784,1047].forEach((f,k)=>tone(f,k===5?.9:.2,{type:'triangle',v:.13,at:k*.15}));break;
  case 'bad':tone(330,.25,{type:'sawtooth',to:220,v:.14,lp:1400});break;
  }}catch(e){}}
// ambience: an oud-like drone and soft hand-drum pattern
const OUD=[146.8,164.8,174.6,196,220,233.1,261.6];
function musicStart(){if(HAS_GA)GA.music('main',{fade:2});if(!SND.ctx||SND.mTimer)return;SND.nextT=SND.ctx.currentTime+.1;SND.mTimer=setInterval(musicTick,200)}
function musicStop(){if(HAS_GA)GA.music(null);clearInterval(SND.mTimer);SND.mTimer=null}
function musicTick(){const c=SND.ctx;if(!c||c.state!=='running')return;if(gaMusicOk()){SND.nextT=c.currentTime+.1;return}const st=.36;
  while(SND.nextT<c.currentTime+.5){const at=SND.nextT-c.currentTime,k=SND.beat%16;
    if(k===0)tone(73.4,st*15,{type:'sine',v:.08,a:.5,at,bus:SND.musBus});
    if([0,3,6,10,12].includes(k))tone(110,.12,{to:70,v:.3,at,bus:SND.musBus});if([8,14].includes(k))noise(.08,{f:900,q:1,v:.18,at,bus:SND.musBus});
    if(k%4===2&&Math.random()<.7){const f=OUD[Math.floor(Math.random()*OUD.length)];tone(f*2,.5,{type:'triangle',v:.05,at,bus:SND.musBus,a:.01})}
    SND.nextT+=st;SND.beat++}}
function toggleSound(){SND.on=!SND.on;try{localStorage.setItem('soq_snd',SND.on?'1':'0')}catch(e){}audioInit();if(HAS_GA)GA.setSfx(SND.on);if(SND.master)SND.master.gain.value=SND.on?SND.vol:0;if(SND.on)sfx('click');soundBtns()}
function toggleMusic(){SND.music=!SND.music;try{localStorage.setItem('soq_mus',SND.music?'1':'0')}catch(e){}if(HAS_GA)GA.setMusic(SND.music);if(SND.music){audioInit();musicStart()}else musicStop();soundBtns()}
function soundBtns(){const a=document.getElementById('sndbtn'),b=document.getElementById('musbtn');if(a)a.textContent=SND.on?'🔊':'🔇';if(b)b.textContent=SND.music?'🎶':'🎶̸'}

// ---------- online play: free peer-to-peer rooms (NetRoom over WebRTC). The host's page runs the game; the other pages send moves. ----------
// Host: holds the real G, runs the engine and the computer seats, checks every move a friend sends, and broadcasts G after each change.
// Client: renders the G it receives from its own seat; a click becomes a small move message (netSend) instead of a rules move.
const NET={on:false,role:null,code:'',room:null,lobby:null,uid:null,peer:null,mySeat:-1,seq:0,applied:0,last:0,timer:null,parts:{},hostPeer:null,peers:[],
  err:'',ready:false,busy:false,ep:0,lastRx:0,dead:[],expect:null,gno:0,wait:0,waitT:0,fxSeen:-1,myName:'',opt:null,copied:false,lastSide:-2,rej:0,acts:0,hiT:0,over:''};
function netInit(){try{if(typeof NetRoom!=='undefined'&&NetRoom.available()){NET.lobby=NetRoom.lobby('soq');NET.uid=NetRoom.uid();NET.myName=NetRoom.name();const lc=NetRoom.linkCode();if(lc){UI.joinCode=lc;UI.netOpen=true}}}catch(e){}NET.ready=true}
netInit();
const netAvail=()=>!!NET.lobby;
const isClient=()=>NET.on&&NET.role==='client';
const isHost=()=>NET.on&&NET.role==='host';
const netName=s=>String(s||'').replace(/[<>&"'`]/g,'').trim().slice(0,16);
function peerName(p){const n=netName(p&&p.presence&&p.presence.name);return n||(p&&p.isMe?'You':'Player')}
// ---- joining and leaving a room ----
async function netJoin(role,code){if(NET.busy||!NET.lobby)return;NET.err='';
  code=NetRoom.cleanCode(code);if(!code){NET.err='Type the invite code first.';render();return}
  if(typeof NetRoom!=='undefined')NET.myName=NetRoom.setName(NET.myName);
  NET.busy=true;render();
  try{if(NET.room){try{await NET.room.leave()}catch(e){}}NET.room=await NET.lobby.join('soq-'+code)}catch(e){NET.busy=false;NET.err='Could not open the game room.';render();return}
  Object.assign(NET,{busy:false,code,role,on:true,mySeat:-1,hostPeer:null,parts:{},applied:0,ep:0,lastRx:0,dead:[],expect:null,wait:0,fxSeen:-1,over:'',opt:null,peer:NET.room.self||null});
  if(role==='client'){G=null;NET.gno=0}
  NET.room.presence({role,uid:NET.uid,v:1,name:NET.myName||''}).catch(()=>{});
  NET.room.on('st',onNetState);NET.room.on('act',onNetAct);
  NET.room.onPeers(ch=>{NET.peers=ch.peers;const meP=ch.peers.find(p=>p.isMe);if(meP)NET.peer=meP.peer;
    if(isHost()&&G){let ch2=false;
      ch.left.forEach(l=>{const s=G.pl.find(p=>p.peer===l.peer&&p.human);if(s){s.human=false;s.away=true;ch2=true;lg(`${s.nm} left the game: the computer takes over.`)}});
      ch.joined.forEach(j=>{if(j.isMe)return;const uid=j.by||(j.presence&&j.presence.uid);const s=uid&&G.pl.find(p=>p.uid===uid&&(p.away||p.peer!==j.peer));if(s){s.peer=j.peer;s.human=true;s.away=false;ch2=true;NET.dead=NET.dead.filter(x=>x!==j.peer);lg(`${s.nm} is back and takes the seat again.`)}});
      if(ch2)refresh();else netPush(true)}
    else if(isHost())netPush(true);
    if(isClient()&&NET.hostPeer&&ch.left.some(p=>p.peer===NET.hostPeer)){if(G&&!G.over)netMigrate(NET.hostPeer);else NET.over='The host closed the room.'}
    render()});
  UI.modal='lobby';render()}
async function netLeave(){const r=NET.room;Object.assign(NET,{on:false,role:null,room:null,mySeat:-1,hostPeer:null,err:'',over:'',wait:0});try{if(r)await r.leave()}catch(e){}G=null;UI.modal='start';render()}
function netStatus(){if(!NET.on)return '';const n=NET.peers.length;
  if(NET.over)return NET.over;
  if(isClient()&&!NET.hostPeer)return 'Looking for the host…';
  if(isClient()&&G&&!G.over&&NET.lastRx&&Date.now()-NET.lastRx>6000)return 'Reconnecting…';
  if(n<=1)return 'Looking for players…';return `${n} players online`}
// ---- the host starts a game with everyone in the room; seats go in join order, empty seats go to the computer ----
function netStart(){if(!isHost())return;const hum=NET.peers.slice(0,5).map(p=>({peer:p.peer,uid:p.by||(p.presence&&p.presence.uid)||null,name:peerName(p)}));
  if(!hum.some(h=>h.peer===NET.peer))hum.unshift({peer:NET.peer,uid:NET.uid,name:netName(NET.myName)||'You'});const o=UI.setup;
  const np=Math.min(5,Math.max(o.np,hum.length));const seats=[],names=[],used=new Set();
  for(let i=0;i<np;i++){const h=hum[i];seats.push(h?'human':'ai');let nm=h&&h.name&&h.name!=='You'&&h.name!=='Player'?h.name:PNAMES[i];if(used.has(nm.toLowerCase()))nm=nm+' ('+PNAMES[i]+')';used.add(nm.toLowerCase());names.push(nm)}
  UI.modal=null;UI.fx.length=0;UI.fxSeen=0;UI.chapterShown='';UI.moveSnap=null;UI.autoPlan=null;NET.gno++;NET.over='';NET.pushOff=1;
  newGame({np,seats,names,lv:o.lv.slice(0,np),ex:Object.assign({},o.ex,np===5?{sultan:true}:{}),mode:'x'});NET.pushOff=0;
  G.pl.forEach((p,i)=>{const h=hum[i];if(h){p.peer=h.peer;p.uid=h.uid}});NET.mySeat=G.pl.findIndex(p=>p.peer===NET.peer);
  resetScene();refresh();netPush(true)}
// ---- state packets: JSON, deflate-compressed, cut into 3200-character chunks ----
function b64(u8){let s='';for(let i=0;i<u8.length;i+=0x8000)s+=String.fromCharCode.apply(null,u8.subarray(i,i+0x8000));return btoa(s)}
function unb64(s){const b=atob(s),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u}
async function packStr(s){if(window.CompressionStream){try{const cs=new CompressionStream('deflate-raw');const w=cs.writable.getWriter();w.write(new TextEncoder().encode(s));w.close();return 'z'+b64(new Uint8Array(await new Response(cs.readable).arrayBuffer()))}catch(e){}}return 'j'+b64(new TextEncoder().encode(s))}
async function unpackStr(s){const u=unb64(s.slice(1));if(s[0]==='z'){const ds=new DecompressionStream('deflate-raw');const w=ds.writable.getWriter();w.write(u);w.close();return await new Response(ds.readable).text()}return new TextDecoder().decode(u)}
// what a friend's page may see: the log is trimmed, and the order of every face-down pile and the random seed are left out
function netView(){const g=JSON.parse(JSON.stringify(G));g.log=g.log.slice(0,60);g.rng=0;for(const k of ['rdeck','bag','items','djDeck','thDeck'])if(Array.isArray(g[k]))g[k].sort();return g}
function netPush(force){if(!isHost()||!NET.room||NET.pushOff)return;const now=Date.now();
  if(!force&&now-NET.last<300){if(!NET.timer)NET.timer=setTimeout(()=>{NET.timer=null;netPush(true)},310);return}
  NET.last=now;const seq=++NET.seq;const opt={np:UI.setup.np,ex:UI.setup.ex,lv:UI.setup.lv,ord:NET.peers.map(p=>p.by||null)};
  const body=G?{code:NET.code,ep:NET.ep,gno:NET.gno,g:netView(),fx:UI.fx.slice(-20).map(f=>({t:f.t,n:f.n})),undo:!!(UI.moveSnap&&G.move),opt}:{code:NET.code,ep:NET.ep,lobby:true,opt};
  packStr(JSON.stringify(body)).then(z=>{const CH=3200,n=Math.ceil(z.length/CH);for(let i=0;i<n;i++)NET.room&&NET.room.emit('st',{s:seq,i,n,d:z.slice(i*CH,(i+1)*CH)}).catch(()=>{})})}
setInterval(()=>{if(isHost())netPush(true)},3000);
function onNetState(msg){if(!NET.on||msg.isMe)return;const d=msg.data;if(!d||typeof d.d!=='string'||!(d.n>0&&d.n<60)||!(d.i>=0&&d.i<d.n)||typeof d.s!=='number')return;
  if(NET.dead.includes(msg.peer))return;
  const k=msg.peer+':'+d.s;const P2=NET.parts[k]=NET.parts[k]||{n:d.n,got:0,c:[]};if(P2.c[d.i]===undefined){P2.c[d.i]=d.d;P2.got++}
  if(P2.got<P2.n)return;delete NET.parts[k];Object.keys(NET.parts).forEach(x=>{const [pp,ss]=x.split(':');if(pp===msg.peer&&+ss<d.s)delete NET.parts[x]});
  unpackStr(P2.c.join('')).then(txt=>{const o=JSON.parse(txt);if(!o||o.code!==NET.code)return;const ep=o.ep|0;
    // only a seated player may take over as host (or anyone, before there is a game)
    const seated=!G||G.pl.some(p=>p.peer===msg.peer);
    if(isHost()){if(!seated||!(ep>NET.ep||(ep===NET.ep&&msg.peer<NET.peer)))return;
      NET.role='client';UI.moveSnap=null;NET.hostPeer=msg.peer;NET.ep=ep;NET.applied=d.s;NET.room.presence({role:'client'}).catch(()=>{})}
    else{if(!NET.hostPeer||(ep>NET.ep&&seated)){if(NET.hostPeer&&NET.hostPeer!==msg.peer)NET.applied=0;NET.hostPeer=msg.peer;NET.ep=Math.max(NET.ep,ep);NET.expect=null}
      if(msg.peer!==NET.hostPeer||ep<NET.ep||d.s<=NET.applied)return;NET.applied=d.s}
    NET.lastRx=Date.now();applyNet(o)}).catch(()=>{})}
function validG(g){return g&&typeof g==='object'&&Array.isArray(g.pl)&&g.pl.length>=2&&g.pl.length<=5&&Array.isArray(g.board)&&Array.isArray(g.log)&&Array.isArray(g.market)}
const FXSND={pick:'pick',drop:'drop',take:'take',camel:'camel',coins:'coins',res:'take',kill:'kill',djinn:'djinn',build:'build',bid:'bid',round:'round',win:'win',thief:'kill',item:'djinn'};
function applyNet(o){if(o.opt&&typeof o.opt==='object')NET.opt=o.opt;
  if(o.lobby||!o.g){if(G){G=null;UI.modal='lobby'}render();return}
  if(!validG(o.g))return;
  const prev=G,mine0=prev&&NET.mySeat>=0&&prev.pl[NET.mySeat]?scoreOf(prev.pl[NET.mySeat]):null,sent=NET.wait;
  const newGameHere=o.gno!==NET.gno||!prev;G=o.g;
  NET.mySeat=G.pl.findIndex(p=>p.peer===NET.peer);
  if(newGameHere){NET.gno=o.gno;NET.fxSeen=-1;UI.chapterShown='';UI.plans=null;UI.planKey='';UI.autoPlan=null;UI.adv=null;UI.pendDj=null;UI.sellSel=[];if(UI.modal)UI.modal=null;resetScene()}
  // my seat shows as left (a page reload, a dropped connection): say hello so the host gives it back
  const mineByUid=G.pl.find(p=>p.uid&&p.uid===NET.uid);if(mineByUid&&(mineByUid.away||mineByUid.peer!==NET.peer)&&Date.now()-NET.hiT>2500){NET.hiT=Date.now();NET.room.emit('act',{m:{act:'hi'}}).catch(()=>{})}
  // sounds from the host's event list
  const fxl=Array.isArray(o.fx)?o.fx:[];let top=NET.fxSeen;for(const f of fxl){if(!f||typeof f.n!=='number')continue;if(NET.fxSeen>=0&&f.n>NET.fxSeen&&FXSND[f.t]&&typeof sfx==='function')sfx(FXSND[f.t]);if(f.n>top)top=f.n}NET.fxSeen=Math.max(top,0);
  UI.moveSnap=o.undo&&G.cur===NET.mySeat?'net':null;NET.wait=0;
  if(sent&&mine0&&G.pl[NET.mySeat]&&!G.over)try{scoreNote(G.pl[NET.mySeat],mine0)}catch(e){}
  refresh()}
// ---- host migration: if the host leaves, the seated player with the lowest seat takes over from the latest state ----
function netMigrate(gone){if(!isClient()||!G||G.over)return;if(gone&&!NET.dead.includes(gone))NET.dead.push(gone);
  const here=new Set(NET.peers.map(p=>p.peer));
  const cand=G.pl.filter(p=>p.human&&p.peer&&!NET.dead.includes(p.peer)&&(here.has(p.peer)||p.peer===NET.peer));
  const next=cand[0];NET.lastRx=Date.now();
  if(!next){NET.over='The host left. The game is over.';render();return}
  if(next.peer!==NET.peer){NET.expect=next.peer;NET.over='';toast(`The host left. ${next.nm} is taking over…`);render();return}
  G.pl.forEach(p=>{if(p.human&&p.peer!==NET.peer&&(NET.dead.includes(p.peer)||!here.has(p.peer))){p.human=false;p.away=true}});
  // the face-down piles arrived sorted and without the seed: shuffle them afresh
  G.rng=Math.floor(Math.random()*2**31);for(const k of ['rdeck','bag','items','djDeck','thDeck'])if(Array.isArray(G[k]))shuffle(G[k]);
  NET.role='host';NET.ep++;NET.migr=(NET.migr||0)+1;NET.hostPeer=NET.peer;NET.expect=null;NET.mySeat=G.pl.findIndex(p=>p.peer===NET.peer);NET.over='';UI.moveSnap=null;UI.autoPlan=null;NET.wait=0;
  lg(`The host left. ${G.pl[NET.mySeat].nm}'s page is running the game now.`);
  NET.room.presence({role:'host'}).catch(()=>{});netPush(true);refresh()}
setInterval(()=>{if(!isClient()||!G||G.over||!NET.lastRx)return;// only a host whose connection is gone is replaced: a host that is merely slow (a busy page) shows "Reconnecting…" and keeps the game
  const gone=NET.hostPeer&&!NET.peers.some(p=>p.peer===NET.hostPeer);if(gone&&Date.now()-NET.lastRx>8000)netMigrate(NET.expect||NET.hostPeer)},1000);
// ---- client -> host: one move at a time ----
function netSend(m){if(!NET.room)return false;if(NET.wait&&Date.now()-NET.waitT<2500)return false;let s='';try{s=JSON.stringify(m)}catch(e){return false}if(s.length>900)return false;
  NET.wait=1;NET.waitT=Date.now();NET.room.emit('act',{m:JSON.parse(s)}).catch(()=>{});return true}
// the same check performMove makes, done first so a bad message never reaches the rules
function netLegal(m,s){if(validMoves(s).some(x=>same(x,m)))return true;
  if(m.act==='sell'&&G.step==='sell'&&s===G.cur){const k=m.kinds;return Array.isArray(k)&&k.length>0&&k.every(x=>typeof x==='string')&&new Set(k).size===k.length&&k.every(x=>P(s).res.includes(x))}return false}
function onNetAct(msg){if(!isHost()||!G||msg.isMe)return;let seat=G.pl.findIndex(p=>p.peer===msg.peer&&p.human);
  if(seat<0){const s=msg.by&&G.pl.find(p=>p.uid===msg.by&&(p.away||p.peer!==msg.peer));if(!s)return;s.peer=msg.peer;s.human=true;s.away=false;NET.dead=NET.dead.filter(x=>x!==msg.peer);lg(`${s.nm} is back and takes the seat again.`);refresh();return}
  const m=msg.data&&msg.data.m;
  if(!m||typeof m!=='object'||Array.isArray(m)||typeof m.act!=='string'){NET.rej++;return}
  if(m.act==='hi')return;
  if(m.act==='undodrop'){if(seat===G.cur&&sideToAct()===seat&&G.move&&UI.moveSnap&&UI.moveSteps){NET.acts++;uiAct('undodrop')}else{NET.rej++;netPush()}return}
  let ok=false;try{ok=sideToAct()===seat&&netLegal(m,seat)}catch(e){ok=false}
  if(!ok){NET.rej++;netPush();return}
  NET.acts++;go(JSON.parse(JSON.stringify(m)));netPush()}
// ---- the "your turn" chime, on every page ----
function netTurnCheck(){if(!NET.on||!G||G.over){NET.lastSide=-2;return}const s=sideToAct();const mine=s>=0&&s===NET.mySeat;if(mine&&NET.lastSide!==s&&NET.lastSide!==-2&&typeof sfx==='function')sfx('bid');NET.lastSide=s}
// ---- the start-screen block and the lobby popup ----
function optText(o){if(!o)return '';const ex=[['artisans','the Crafters'],['sultan','Wonder Cities'],['thieves','Cutpurses'],['promos','promo djinns']].filter(([k])=>o.ex&&(o.ex[k]||(k==='sultan'&&o.np===5))).map(x=>x[1]);
  return `${o.np} seats${ex.length?' · with '+ex.join(', '):' · base game'}`}
function onlineBlock(){if(!NET.ready)return '';
  if(!netAvail())return '<p class="small muted">🌐 Online play needs a recent browser with WebRTC (Chrome, Edge, Firefox or Safari).</p>';
  if(NET.on)return `<div class="online"><b>🌐 Online room <span class="code">${esc(NET.code)}</span></b> <span class="small muted">${esc(netStatus())}</span><div class="acts"><button class="btn go" data-net="lobby">Open the lobby</button><button class="btn" data-net="leave">Leave the room</button></div></div>`;
  return `<details class="exd online" ${UI.netOpen?'open':''}><summary><b>🌐 Play online</b> <small>free: your browsers connect to each other</small></summary>
   <p class="small muted">Host a game and send friends the code or link. Empty seats go to the computer.</p>
   <div class="netrow"><input id="netname" placeholder="your name" maxlength="16" autocomplete="off" value="${esc(NET.myName||'')}"><button class="btn" data-net="host">Host</button></div>
   <div class="netrow"><input id="joincode" placeholder="invite code" maxlength="10" autocomplete="off" autocapitalize="off" value="${esc(UI.joinCode||'')}"><button class="btn" data-net="join">Join</button></div>${NET.err?`<p class="small warnt">${esc(NET.err)}</p>`:''}${NET.busy?'<p class="small muted">Opening the room…</p>':''}</details>`}
function lobbyHtml(){const host=isHost();const ord=!host&&NET.opt&&Array.isArray(NET.opt.ord)?NET.opt.ord:null;const at=p=>{const k=ord?ord.indexOf(p.by):-1;return k<0?99:k};const ps=ord?NET.peers.slice().sort((a,b)=>at(a)-at(b)):NET.peers;const o=host?{np:UI.setup.np,ex:UI.setup.ex}:NET.opt;
  const rows=ps.map((p,i)=>`<li><i style="--pc:${PCOL[i]||'#999'}"></i><b>${esc(peerName(p))}</b>${p.isMe?' <small>(you)</small>':''}${p.presence&&p.presence.role==='host'?' <small>· host</small>':''}</li>`).join('');
  const seats=o?Math.min(5,Math.max(o.np,ps.length)):ps.length;const inGame=!!G&&!G.over;
  return `<div class="mbox lobby" role="dialog" aria-modal="true" aria-label="Online game"><button class="gx-x lobx" data-net="close" aria-label="Close">×</button><h2>🌐 Online game</h2>
   <p>Invite code: <b class="code">${esc(NET.code)}</b> <span class="small muted">Friends open this page, choose <b>Play online</b> and type the code.</span></p>
   <div class="netrow"><input class="invlink" readonly value="${esc(NetRoom.inviteLink(NET.code))}" aria-label="Invite link"><button class="btn sm" data-net="copy">${NET.copied?'Copied ✓':'Copy link'}</button></div>
   ${NET.over?`<p class="small warnt">${esc(NET.over)}</p>`:''}<p class="small muted netst">${esc(netStatus())}</p>
   <h3>Players here (${ps.length})</h3><ul class="plist">${rows||'<li class="muted">Connecting…</li>'}</ul>
   ${host?`<h3>Game</h3><div class="seg">${[2,3,4,5].map(n=>`<button class="${UI.setup.np===n?'on':''}" data-np="${n}" ${n<ps.length?'disabled':''}>${n}</button>`).join('')}</div>
     <div class="exs">${[['artisans','The Crafters'],['sultan','Wonder Cities'],['thieves','Cutpurses'],['promos','Promo djinns']].map(([k,n])=>`<label class="chk"><input type="checkbox" data-ex="${k}" ${UI.setup.ex[k]||(k==='sultan'&&seats===5)?'checked':''} ${k==='sultan'&&seats===5?'disabled':''}> <b>${n}</b></label>`).join('')}</div>
     <p class="small">${seats} seats: ${Math.min(ps.length,5)} player${ps.length===1?'':'s'}${seats>ps.length?` and ${seats-ps.length} computer${seats-ps.length>1?'s':''}`:''}. Seats go in the order people joined.</p>
     <div class="acts"><button class="btn go" data-net="start">${inGame?'Start a new game (ends this one)':'Start the game ▶'}</button>${inGame?'<button class="btn" data-net="close">Back to the game</button>':''}<button class="btn ghost" data-net="leave">Close the room</button></div>`
   :`<p class="small">Game: <b>${esc(optText(o))||'…'}</b></p><p class="tip">${inGame?'The game is on.':'Waiting for the host to start the game…'}</p><div class="acts">${inGame?'<button class="btn go" data-net="close">Back to the game</button>':''}<button class="btn ghost" data-net="leave">Leave</button></div>`}</div>`}
function netCopy(){const t=NetRoom.inviteLink(NET.code);const sel=()=>{const i=document.querySelector('.invlink');if(i){i.focus();i.select()}};const done=()=>{NET.copied=true;render();setTimeout(()=>{NET.copied=false;render()},2500)};
  try{navigator.clipboard.writeText(t).then(done,sel)}catch(e){sel()}}
function netCloseLobby(){if(UI.modal!=='lobby')return;UI.modal=G?null:'start';render()}
document.addEventListener('click',e=>{const b=e.target.closest('[data-net]');
  if(!b){if(UI.modal==='lobby'&&e.target&&e.target.id==='modal')netCloseLobby();
    else if(isHost()&&UI.modal==='lobby'&&e.target.closest&&e.target.closest('[data-np],[data-ex]'))setTimeout(()=>{render();netPush(true)},0);return}
  switch(b.dataset.net){
  case 'host':UI.netOpen=true;netJoin('host',NetRoom.newCode());return;
  case 'join':{UI.netOpen=true;const v=(document.getElementById('joincode')||{}).value;netJoin('client',v);return}
  case 'start':netStart();return;case 'leave':netLeave();return;case 'copy':netCopy();return;case 'lobby':UI.modal='lobby';render();return;case 'close':netCloseLobby();return}});
document.addEventListener('input',e=>{const t=e.target;if(!t)return;if(t.id==='joincode')UI.joinCode=t.value;if(t.id==='netname'&&typeof NetRoom!=='undefined')NET.myName=NetRoom.setName(t.value)});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&UI.modal==='lobby'){e.preventDefault();netCloseLobby()}if(e.target&&e.target.id==='joincode'&&e.key==='Enter'){e.preventDefault();netJoin('client',e.target.value)}});
// keep the lobby's status line fresh
setInterval(()=>{if(!NET.on)return;if(UI.modal==='lobby'||UI.modal==='start')renderModal();if(G)renderChip()},2000);
// an invite link pasted into a tab that already has the game open only changes the #hash
window.addEventListener('hashchange',()=>{const lc=typeof NetRoom!=='undefined'&&NET.lobby?NetRoom.linkCode():'';if(!lc||NET.on)return;UI.joinCode=lc;UI.netOpen=true;if(!G||G.over||UI.modal)UI.modal='start';else toast('Invite link received: open New game → Play online to join.');render()});
// closing or reloading the tab tells the others at once (otherwise WebRTC notices only after its own timeout)
window.addEventListener('pagehide',()=>{if(NET.room)try{NET.room.leave()}catch(e){}});

// ---------- UI: the bazaar IS the screen. Tap a tile, tap where its people go, watch it happen. ----------
// Layout: seat chips (scores) on top, one short line, the bazaar grid + the goods row + the djinn row (the table), then the buttons.
// Everything that changes on screen is drawn from G by render(); ui2.js animates the difference between two renders.
const $=s=>document.querySelector(s);const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const PCOL=['#2b2b33','#119e98','#ff4fa3','#8b5a2b','#6d7b8d'];const MCSS={vizier:'#f2c230',elder:'#f4f1ea',merchant:'#3fa34d',builder:'#2f6fd6',assassin:'#d23a2e',artisan:'#9a5bd0'};
const TSHORT={village:'Hamlet',sacred:'Shrine',oasis:'Oasis',small:'Stall',large:'Bazaar',workshop:'Workshop',exchange:'Exchange',ravine:'Ravine',lake:'Lake',city:'City'};
const TICON={village:'🏘️',sacred:'🕌',oasis:'💧',small:'🧺',large:'🏪',workshop:'🔨',exchange:'🌶️',ravine:'⛰️',lake:'🌊',city:'🏛️'};
Object.assign(UI,{pendDj:null,pendItem:null,chz:null,mkSel:[],sellSel:[],fxSeen:0,hurry:false,pick:[],pickSeat:[],pickMk:[],pickDj:[],pickSpot:[],snap:null,autoMove:null,autoMs:650,modal:null,moveSnap:null,moveSteps:null});
function refresh(){if(G&&!(typeof NET!=='undefined'&&NET.on)){try{if(!G.over&&!G.pl.every(p=>!p.human))localStorage.setItem(SAVE,JSON.stringify(G));else if(G.over)localStorage.removeItem(SAVE)}catch(e){}}
  if(!G)return;playFx();try{render()}catch(e){console.error(e)}schedule();if(typeof NET!=='undefined'&&NET.on){if(isHost())netPush();netTurnCheck()}}
function playFx(){for(const f of UI.fx.slice(UI.fxSeen)){const m={pick:'pick',drop:'drop',take:'take',camel:'camel',coins:'coins',res:'take',kill:'kill',djinn:'djinn',build:'build',bid:'bid',round:'round',win:'win',thief:'kill',item:'djinn'}[f.t];if(m&&typeof sfx==='function')sfx(m)}UI.fxSeen=UI.fx.length;if(UI.fx.length>30){UI.fx.splice(0,20);UI.fxSeen=UI.fx.length}}
const online=()=>typeof NET!=='undefined'&&NET.on;
const me=()=>{if(!G)return null;const s=sideToAct();if(online()&&s!==NET.mySeat)return null;return s>=0&&P(s).human?P(s):null};
const mySeatP=()=>online()?(NET.mySeat>=0?P(NET.mySeat):null):null;
// online, a rival's Crafter items are face down: their points stay hidden until the end
function shownTotal(p){const s=scoreOf(p);return online()&&!G.over&&p.i!==NET.mySeat?s.total-s.items:s.total}
function human(){return G&&G.pl.some(p=>p.human)}
function viewP(){if(!G)return null;return online()?mySeatP():(me()||G.pl.find(p=>p.human)||null)}
function seatName(p){const hs=G.pl.filter(x=>x.human);const you=online()?p.i===NET.mySeat:(p.human&&hs.length===1);return you?'You':p.nm}
const words=s=>String(s).replace(/<[^>]*>/g,' ').split(/\s+/).filter(Boolean);
// ---------- what glows ----------
function qBoardTile(o){const d=o.d||{};if(o.h==='flute')return d.j;if(o.h==='scim')return d.tile;return null}
function computePick(){UI.pick=[];UI.pickSeat=[];UI.pickMk=[];UI.pickDj=[];UI.pickSpot=[];const p=me();if(!p)return;const vm=validMoves(p.i);
  if(G.q){const s=new Set();for(const o of G.q.opts){const t=qBoardTile(o);if(t!=null)s.add(t)}UI.pick=[...s];return}
  if(UI.pendDj){UI.pick=[...new Set(vm.filter(m=>m.act==='djinn'&&m.k===UI.pendDj.k&&same(m.pay,UI.pendDj.pay)&&m.t>=0).map(m=>m.t))];return}
  if(UI.pendItem){const it=UI.pendItem;const ms=vm.filter(m=>m.act==='item'&&m.k===it.k);
    if(it.k==='flute')UI.pick=[...new Set(ms.map(m=>m.t))];else if(it.k==='talisman')UI.pick=[...new Set(it.from==null?ms.map(m=>m.from):ms.filter(m=>m.from===it.from).map(m=>m.to))];return}
  if(G.phase==='bid'){UI.pickSpot=vm.filter(m=>m.act==='bid').map(m=>m.spot);return}
  if(G.step==='move'){if(!G.move)UI.pick=[...new Set(vm.filter(m=>m.act==='start').map(m=>m.tile))];else UI.pick=[...new Set(vm.filter(m=>m.act==='step').map(m=>m.tile))];return}
  if(G.step==='tribe'&&G.act.color==='assassin'){const ks=vm.filter(m=>m.act==='tribe'&&m.kill);UI.pick=[...new Set(ks.filter(m=>m.kill.tile!=null).map(m=>m.kill.tile))];UI.pickSeat=[...new Set(ks.filter(m=>m.kill.pl!=null).map(m=>m.kill.pl))];return}
  if(G.step==='tile'){const tm=vm.filter(m=>m.act==='tile');const pl=[...new Set(tm.filter(m=>m.place!=null).map(m=>m.place))];if(pl.length>1)UI.pick=pl;
    UI.pickDj=[...new Set(tm.filter(m=>m.dj).map(m=>m.dj))].concat([...new Set(tm.filter(m=>m.thief).map(m=>'t:'+m.thief))]);
    const tk=tm.filter(m=>m.take);if(tk.length){const sel=UI.mkSel;const js=new Set();for(const m of tk){if(sel.length===0||m.take.includes(sel[0])){for(const j of m.take)if(!sel.includes(j))js.add(j)}}UI.pickMk=[...js]}}}
// ---------- the one short line ----------
function qLine(q){return {claim:'Camel or tent?',item:'Keep which item?',djinn:'Pick a djinn',flute:'Pull a person over',kill:'Remove a person',thief:'Take your prize'}[q.kind]||words(q.title).slice(0,6).join(' ')}
function lineText(){if(!G)return '';if(G.over)return `${G.winner.split(' & ').slice(0,2).join(' & ')} ${G.over.win.length>1?'share':'wins'}`;
  const s=sideToAct(),p=s>=0?P(s):null;if(!p)return '';const hp=me();
  if(!hp){const nm=seatName(p);if(online()&&p.human)return `Waiting for ${nm}`;if(G.q)return `${nm} is choosing`;if(G.phase==='bid')return `${nm} is bidding`;return `${nm} is ${{move:G.move?'moving':'choosing',tribe:'collecting',tile:'acting',sell:'finishing'}[G.step]||'playing'}`}
  if(G.q)return qLine(G.q);if(UI.pendDj||UI.pendItem)return 'Tap a glowing tile';
  if(G.phase==='bid'){const two=hp.markers>1;return two?`Bid ${Math.min(2,G.bids.filter(b=>b.mk.p===hp.i).length+1)} of 2: pick a spot`:'Pick your turn-order spot'}
  switch(G.step){
  case 'move':return !G.move?'Tap a glowing tile to start':G.move.hand.length===1?'Last one: land on its colour':'Tap a glowing tile to drop one';
  case 'tribe':return {assassin:'Tap who to remove',builder:'Masons earn coins',merchant:'Traders fetch goods',vizier:'Advisors join you',elder:'Sages join you',artisan:'Crafters join you'}[G.act.color]||'';
  case 'tile':{const t=G.board[G.act.tile];return {village:'A palace rises here',oasis:'A palm grows here',sacred:'Tap a djinn to summon',small:'Buy a good for 3🪙',large:'Buy two goods for 6🪙',exchange:'Buy a good for 4🪙',workshop:'Commission an item?'}[t.k]||'Nothing to do here'}
  case 'sell':return 'Sell goods or end turn'}
  return ''}
// ---------- seats (the score race) ----------
function pip(c,n){return n?`<span class="pp" title="${esc(MPLUR[c])}"><i class="mp sm" data-c="${c}"></i>${n}</span>`:''}
function seatHtml(p){const a=sideToAct()===p.i&&!G.over;const kill=UI.pickSeat.includes(p.i);const nm=seatName(p);
  return `<div class="sch ${a?'actnow':''} ${kill?'glow':''}" data-seat="${p.i}" style="--pc:${PCOL[p.i]}" aria-label="${esc(nm)}, score ${shownTotal(p)}">
   <b class="sn">${esc(nm)}${!p.human?'<small>cpu</small>':''}</b><b class="ss">★${shownTotal(p)}</b>
   <span class="s2"><span class="st">🪙${p.coins}</span><span class="st">🐪${p.camels}</span>${p.tent?'<span class="st">⛺</span>':''}</span>
   <span class="s3">${pip('vizier',p.vz)}${pip('elder',p.el)}${G.ex.artisans?pip('artisan',p.art):''}${p.fk?`<span class="pp">🔮${p.fk}</span>`:''}${p.res.length?`<span class="pp">🧺${p.res.length}</span>`:''}${p.dj.length?`<span class="pp">🧞${p.dj.length}</span>`:''}</span></div>`}
function renderSeats(){const el=$('#seats');if(!el)return;const h=G.pl.map(seatHtml).join('');el.dataset.n=G.pl.length;el.innerHTML=h}
// ---------- the bazaar ----------
function mpHtml(c,h){return `<i class="mp${h?' h':''}" data-c="${c}"></i>`}
function tileHtml(t){const d=TILEDEF[t.k],i=t.i;
  if(t.block)return `<div class="tile blk k-${t.k}" data-tile="${i}" aria-label="${esc(d.n)}"><i class="ti">${TICON[t.k]}</i><span class="tn">${TSHORT[t.k]}</span></div>`;
  const mv=G.move,cur=!!mv&&mv.at===i,glow=UI.pick.includes(i),own=owner(t);const hand=cur?mv.hand:[];const n=t.m.length+hand.length;
  const cls=['tile',t.blue?'blue':'red','k-'+t.k,glow?'glow':'',cur?'cur':'',own!=null?'owned':''].filter(Boolean).join(' ');
  return `<div class="${cls}" data-tile="${i}" data-n="${n}" role="button" style="${own!=null?'--oc:'+PCOL[own]:''}" aria-label="${esc(tileName(t))}">
   <i class="ti">${TICON[t.k]}</i><span class="tn">${TSHORT[t.k]}</span>${t.v?`<b class="tv">${t.v}</b>`:''}<i class="tc">${tileCoord(i)}</i>
   <div class="ms">${t.m.map(c=>mpHtml(c)).join('')}${hand.map(c=>mpHtml(c,1)).join('')}</div>
   <div class="tk">${own!=null?`<b class="own" style="--pc:${PCOL[own]}">${t.tent!=null?'⛺':'🐪'}</b>`:''}${t.palm?`<span class="tok">🌴${t.palm>1?'<small>×'+t.palm+'</small>':''}</span>`:''}${t.pal?`<span class="tok">🏰${t.pal>1?'<small>×'+t.pal+'</small>':''}</span>`:''}</div></div>`}
function renderGrid(){const g=$('#grid');if(!g)return;g.style.setProperty('--W',G.W);g.style.setProperty('--H',G.H);g.classList.toggle('dim',UI.pick.length>0);g.innerHTML=G.board.map(tileHtml).join('')}
function renderMarket(){const el=$('#mkt');if(!el)return;const tk=G.step==='tribe'&&G.act&&G.act.color==='merchant'&&G.phase==='turn'?G.act.n:0;
  let h='<div class="mrow" aria-label="Goods market">';for(let j=0;j<9;j++){const r=G.market[j];
    h+=r?`<button class="mcard ${UI.pickMk.includes(j)?'glow':''} ${UI.mkSel.includes(j)?'sel':''} ${j<tk?'mtake':''}" data-mk="${j}" aria-label="${esc(RNAME[r])}"><span class="mi">${RICON[r]}</span></button>`:'<span class="mcard empty"></span>'}
  h+='</div><div class="drow" aria-label="Djinns">'+G.djRow.map(k=>`<button class="dcard ${UI.pickDj.includes(k)?'glow':''}" data-dj="${k}" aria-label="${esc(DJ[k].n)}"><b>${esc(DJ[k].n)}</b><span class="dv">${DJ[k].vp}</span></button>`).join('')
   +(G.ex.thieves?G.thRow.map(k=>`<button class="dcard th ${UI.pickDj.includes('t:'+k)?'glow':''}" data-th="${k}" aria-label="${esc(THIEVES[k].n)}"><b>🦹 ${esc(THIEVES[k].n.replace(' Cutpurse',''))}</b></button>`).join(''):'')+'</div>';
  if(el.dataset.h!==h){el.innerHTML=h;el.dataset.h=h}}
// ---------- buttons under the table ----------
const mvAttr=m=>esc(JSON.stringify(m));
function abtn(m,label,cls){return `<button class="ab ${cls||''}" data-mv='${mvAttr(m)}'>${label}</button>`}
function shortOpt(l){let t=String(l).replace(/\s*\(.*?\)/g,'').replace(/:.*$/,'').trim();const w=t.split(/\s+/);return w.length>6?w.slice(0,6).join(' '):t}
function trackHtml(hp,vm){const bm=vm.filter(m=>m.act==='bid');const done=new Set(G.bids.map(b=>b.spot));
  const ord=['1st','2nd','3rd','4th','5th','6th','7th','8th','9th','10th','11th','12th'];
  return `<div class="bidt" aria-label="Turn order">${G.track.map((t,s)=>{const b=G.bids.find(x=>x.spot===s);const mine=bm.filter(m=>m.spot===s);
    return `<div class="spot ${b?'taken':''}" style="${b?'--pc:'+PCOL[b.mk.p]:''}"><small class="ord">${ord[s]}</small>${mine.map(m=>`<button class="sp-b glow ${m.fk?'fkv':''}" data-mv='${mvAttr(m)}' aria-label="${t.cost} coins${m.fk?' with '+m.fk+' Mystic':''}">${m.fk?`<i>−${m.fk}🔮</i>${bidPrice(hp,s,m.fk)}🪙`:`${t.cost}🪙`}</button>`).join('')||`<span class="sp-c">${t.cost}🪙</span>`}${b?'<i class="mk"></i>':''}</div>`}).join('')}</div>`}
function powerChips(hp,vm){const pw=[...vm.filter(m=>m.act==='djinn'),...vm.filter(m=>m.act==='item')];if(!pw.length)return '';const seen=new Set();let h='';
  for(const m of pw){if(m.act==='djinn'){const key=m.k+JSON.stringify(m.pay);if(seen.has(key))continue;seen.add(key);const pay=(m.pay.el?m.pay.el+'●':'')+(m.pay.fk?m.pay.fk+'🔮':'');
      h+=m.t>=0?`<button class="ab pw${UI.pendDj&&same(UI.pendDj,{k:m.k,pay:m.pay})?' on':''}" data-pw='${mvAttr({k:m.k,pay:m.pay})}'>✨ ${esc(DJ[m.k].n)} <small>${pay}</small></button>`:abtn(m,`✨ ${esc(DJ[m.k].n)} <small>${pay}</small>`,'pw')}
    else{const key='i'+m.k+(m.dj||'');if(seen.has(key))continue;seen.add(key);
      if(m.k==='flute'||m.k==='talisman')h+=`<button class="ab pw${UI.pendItem&&UI.pendItem.k===m.k?' on':''}" data-pi="${m.k}">🪄 ${esc(ITEMS[m.k].n)}</button>`;else h+=abtn(m,`🪄 ${esc(ITEMS[m.k].n)}${m.dj?' → '+esc(DJ[m.dj].n):''}`,'pw')}}
  return `<div class="arow pws">${h}</div>`}
// builds the button area and sets UI.autoMove when the turn needs no decision from the player
function buildActs(){UI.autoMove=null;const hp=me();if(!G||G.over||!hp||UI.modal)return '';const vm=validMoves(hp.i);const by=a=>vm.filter(m=>m.act===a);let h='',main='';
  if(G.q){const q=G.q;main=q.opts.map((o,i)=>qBoardTile(o)!=null?(o.h==='noop'?'':''):abtn({act:'q',i},esc(shortOpt(o.l)),'')).join('');
    const done=q.opts.findIndex(o=>o.h==='noop');if(done>=0)main+=abtn({act:'q',i:done},'Done','go');return `<div class="arow">${main}</div>`}
  if(G.phase==='bid')return trackHtml(hp,vm);
  const pw=powerChips(hp,vm);
  switch(G.step){
  case 'move':if(G.move){const u=by('undo')[0];main=u?abtn(u,'↶ Put them back','ghost'):(UI.moveSnap&&G.move.drops.length?'<button class="ab ghost" data-ui="undodrop">↶ Undo last drop</button>':'')}break;
  case 'tribe':{const tr=by('tribe');const th=by('thief');const a=G.act;main=th.map(m=>abtn(m,`🦹 ${esc(THIEVES[m.k].n.replace(' Cutpurse',''))}`,'pw')).join('');
    if(a.color==='assassin'){if(tr[0]&&tr[0].none)main+=abtn(tr[0],'No target: carry on','go')}
    else if(a.color==='builder'&&tr.length>1){const blues=AROUND(a.tile).filter(i=>G.board[i].blue&&!G.board[i].block).length;main+=tr.map(m=>abtn(m,`Earn ${(a.n+(m.fk||0))*blues*(G.turnFx.qirsh?2:1)}🪙${m.fk?` +${m.fk}🔮`:''}`,m.fk?'':'go')).join('')}
    else if(tr[0]){const extras=vm.filter(m=>m.act!=='tribe').length;if(extras)main+=abtn(tr[0],'Collect ▶','go');else UI.autoMove=tr[0]}
    break}
  case 'tile':{const tm=by('tile');const t=G.board[G.act.tile];const pl=tm.filter(m=>m.place!=null);const skip=tm.find(m=>m.skip);const extras=vm.filter(m=>m.act!=='tile').length;
    if(pl.length===1&&!extras)UI.autoMove=pl[0];
    else if(pl.length>1||pl.length===1){/* choose by tapping a glowing tile */ if(pl.length===1)main+=abtn(pl[0],t.k==='village'?'🏰 Build here':'🌴 Plant here','go')}
    for(const m of tm.filter(m=>m.work))main+=abtn(m,m.work==='art'?'Pay 1 Crafter':'Pay 2 🔮','');
    if(skip&&!pl.length){if(tm.length===1&&!extras)UI.autoMove=skip;else main+=abtn(skip,'Skip','ghost')}
    break}
  case 'sell':{const kinds=[...new Set(hp.res)];UI.sellSel=UI.sellSel.filter(k=>kinds.includes(k));const end=by('end')[0];
    if(!kinds.length&&!vm.filter(m=>m.act!=='end').length&&end){UI.autoMove=end;break}
    if(UI.sellSel.length)main+=abtn({act:'sell',kinds:UI.sellSel.slice().sort()},`Sell +${sellValue(UI.sellSel.length)}🪙`,'');
    main+=abtn(end,'End turn ▶','go');break}}
  if(main)h+=`<div class="arow">${main}</div>`;return h+pw}
function renderActs(){const el=$('#acts');if(!el)return;const h=buildActs();if(el.dataset.h!==h){el.innerHTML=h;el.dataset.h=h}el.classList.toggle('empty',!h)}
function renderMine(){const el=$('#mine');if(!el)return;const hp=me();let h='';
  if(G&&!G.over&&hp&&!UI.modal&&!G.q&&G.phase==='turn'&&G.step==='sell'){const kinds=[...new Set(hp.res)];UI.sellSel=UI.sellSel.filter(k=>kinds.includes(k));
    h=kinds.map(k=>`<button class="gchip ${UI.sellSel.includes(k)?'on':''}" data-sell="${k}" aria-label="${esc(RNAME[k])}">${RICON[k]}${hp.res.filter(x=>x===k).length>1?'<small>×'+hp.res.filter(x=>x===k).length+'</small>':''}</button>`).join('')}
  if(el.dataset.h!==h){el.innerHTML=h;el.dataset.h=h}el.hidden=!h}
function renderLine(){const el=$('#line');if(!el)return;const t=lineText();if(el.textContent!==t)el.textContent=t;const hp=me();el.classList.toggle('mine',!!hp&&!G.over)}
function renderChrome(){const c=$('#pchip');if(c&&G){const s=sideToAct();const t=G.over?'Game over':`Round ${G.round}`+(online()?' · online':'');if(c.textContent!==t)c.textContent=t}
  const sb=$('#speedbtn');if(sb)sb.innerHTML=ICON('fast')+'<span>'+({0.5:'slow',1:'normal',3:'fast'}[UI.speed]||'normal')+'</span>'}
function render(){if(!G){renderModal();return}
  const prev=UI.snap&&UI.snap.seed===G.seed?UI.snap:null;if(me())UI.hurry=false;
  computePick();renderSeats();renderGrid();renderMarket();renderMine();renderActs();renderLine();renderChrome();renderPopups();renderModal();
  if(typeof fit==='function')fit();if(typeof animate==='function')animate(prev);UI.snap=snapState();
  autoStep();if(typeof placeChz==='function')placeChz();if(typeof placeFinger==='function')placeFinger();overCheck();if(typeof hlpAfter==='function')hlpAfter()}
function snapState(){return {seed:G.seed,tiles:G.board.map(t=>({m:t.m.slice(),hand:G.move&&G.move.at===t.i?G.move.hand.slice():[],camel:t.camel,tent:t.tent,palm:t.palm,pal:t.pal})),market:G.market.slice(),djRow:G.djRow.slice(),thRow:(G.thRow||[]).slice(),
  tot:G.pl.map(p=>shownTotal(p)),coins:G.pl.map(p=>p.coins),cur:G.cur,act:G.act?{color:G.act.color,tile:G.act.tile}:null,step:G.step,logN:G.logN}}
// steps that need no decision run by themselves after a short beat, so the player sees what happened
function autoStep(){clearTimeout(UI.autoT);UI.autoT=0;const m=UI.autoMove;UI.autoMove=null;UI.autoOn=!!m;if(!m||UI.pause)return;const key=G.logN+'|'+G.step+'|'+JSON.stringify(m);
  UI.autoT=setTimeout(()=>{UI.autoT=0;const hp=G&&!G.over&&!UI.modal?me():null;if(!hp||G.logN+'|'+G.step+'|'+JSON.stringify(m)!==key)return;if(!validMoves(hp.i).some(x=>same(x,m)))return;go(m)},ANIM?UI.autoMs/(UI.speed>1?UI.speed:1):0)}
function overCheck(){if(!G||!G.over||UI.overFor===G.seed)return;UI.overFor=G.seed;
  if(UI.camp&&typeof GXC!=='undefined'&&GXC.active&&GXC.active()){setTimeout(()=>{try{GXC.finish(G)}catch(e){console.error(e)}},ANIM?1600:0);return}
  setTimeout(()=>{if(G&&G.over&&!UI.modal){UI.modal='over';render()}},ANIM?1800:0)}
// ---------- input ----------
function pickChoose(anchor,opts){UI.chz={anchor,opts};render()}
function chzBtn(html,m,i){return {html,m}}
function onTile(i){const p=me();if(!p)return;if(UI.chz){const same=UI.chz.anchor&&UI.chz.anchor.tile===i;UI.chz=null;if(same)return render()}const vm=validMoves(p.i);const nope=()=>{const e=document.querySelector(`[data-tile="${i}"]`);if(e){e.classList.remove('nope');void e.offsetWidth;e.classList.add('nope')}render()};
  if(G.q){const os=G.q.opts.map((o,k)=>({o,k})).filter(x=>qBoardTile(x.o)===i);if(!os.length)return nope();
    if(os.length===1)return go({act:'q',i:os[0].k});
    return pickChoose({tile:i},os.map(x=>({html:mdotHtml((x.o.d||{}).c),m:{act:'q',i:x.k}})))}
  if(UI.pendDj){const m=vm.find(m=>m.act==='djinn'&&m.k===UI.pendDj.k&&same(m.pay,UI.pendDj.pay)&&m.t===i);UI.pendDj=null;if(m)return go(m);return render()}
  if(UI.pendItem){const it=UI.pendItem;const ms=vm.filter(m=>m.act==='item'&&m.k===it.k);
    if(it.k==='flute'){const m=ms.find(m=>m.t===i);UI.pendItem=null;if(m)return go(m);return render()}
    if(it.k==='talisman'){if(it.from==null){if(ms.some(m=>m.from===i)){it.from=i;return render()}UI.pendItem=null;return render()}const m=ms.find(m=>m.from===it.from&&m.to===i);UI.pendItem=null;if(m)return go(m);return render()}}
  if(G.step==='move'){if(!G.move){const m=vm.find(m=>m.act==='start'&&m.tile===i);if(m){UI.hurry=false;return go(m)}return nope()}
    const ok=vm.filter(m=>m.act==='step'&&m.tile===i);if(!ok.length)return nope();if(ok.length===1)return go(ok[0]);
    return pickChoose({tile:i},ok.map(m=>({html:mdotHtml(m.c),m})))}
  if(G.step==='tribe'&&G.act.color==='assassin'){const ks=vm.filter(m=>m.act==='tribe'&&m.kill&&m.kill.tile===i);if(!ks.length)return nope();if(ks.length===1)return go(ks[0]);
    return pickChoose({tile:i},ks.map(m=>({html:killChip(m.kill),m})))}
  if(G.step==='tile'){const m=vm.find(m=>m.act==='tile'&&m.place===i);if(m)return go(m)}
  nope()}
function mdotHtml(c){return `<i class="mp lg" data-c="${c}"></i>`}
function killChip(k){return mdotHtml(k.c)+(k.c2?mdotHtml(k.c2):'')+(k.fk?`<small>+${k.fk}🔮</small>`:'')}
function onSeat(i){const p=me();if(UI.chz&&UI.chz.anchor.seat===i){UI.chz=null;return render()}if(p&&UI.pickSeat.includes(i)){const ks=validMoves(p.i).filter(m=>m.act==='tribe'&&m.kill&&m.kill.pl===i);if(ks.length===1)return go(ks[0]);if(ks.length)return pickChoose({seat:i},ks.map(m=>({html:killChip(m.kill),m})))}
  UI.chz=null;GX.show('plrd');renderPopups()}
function onMarket(j){const p=me();const el=document.querySelector(`[data-mk="${j}"]`);const tm=p&&G.step==='tile'&&!G.q?validMoves(p.i).filter(m=>m.act==='tile'&&m.take):[];if(!tm.length){const r=G.market[j];return showTip(el,`<b>${RICON[r]} ${esc(RNAME[r])}</b>${r==='fakir'?'<br>Mystic: extra power':'<br>Different goods make sets'}`)}
  const one=tm.filter(m=>m.take.length===1&&m.take[0]===j);if(one.length)return go(one[0]);
  if(UI.mkSel.includes(j)){UI.mkSel=[];return render()}
  if(!UI.mkSel.length){if(tm.some(m=>m.take.includes(j))){UI.mkSel=[j];return render()}return}
  const a=UI.mkSel[0];const m=tm.find(m=>m.take.length===2&&m.take.includes(a)&&m.take.includes(j));UI.mkSel=[];if(m)return go(m);render()}
function onDjinn(k,th){const p=me();const ak=th?'t:'+k:k;if(UI.chz&&UI.chz.anchor.dj===ak){UI.chz=null;return render()}if(p&&G.step==='tile'&&!G.q){const tm=validMoves(p.i).filter(m=>m.act==='tile'&&(th?m.thief===k:m.dj===k));
    if(tm.length===1)return go(tm[0]);if(tm.length>1){UI.chz={anchor:{dj:ak},opts:tm.map(m=>({html:`<span class="paychip">${m.pay.el}● ${m.pay.fk?'+ 🔮':''}</span>`,m}))};return render()}}
  const d=DJ[k];showTip(document.querySelector(th?`[data-th="${k}"]`:`[data-dj="${k}"]`),th?`<b>${esc(THIEVES[k].n)}</b><br>${esc(THIEVES[k].x)}`:`<b>${esc(d.n)}</b> · ${d.vp} points<br>${esc(d.x)}`)}
function go(m){UI.chz=null;UI.mkSel=[];UI.pendDj=null;UI.pendItem=null;clearTimeout(UI.autoT);if(online()&&isClient()){netSend(m);return}const s=sideToAct();const hu=s>=0&&P(s).human;const mine=!online()||s===NET.mySeat;
  if(hu&&m.act==='start'){UI.moveSnap=JSON.stringify(G);UI.moveSteps=[m]}else if(hu&&m.act==='step'&&UI.moveSteps)UI.moveSteps.push(m);else if(m.act!=='djinn'&&m.act!=='item')UI.moveSnap=null;
  if(hu&&mine&&typeof fingerUsed==='function')fingerUsed(m);
  const r=performMove(m,s);if(G&&!G.move)UI.moveSnap=G.step==='move'?UI.moveSnap:null;
  if(!r.success&&mine){toast('Not allowed now');console.error(r.error)}}
function toast(t){const el=$('#line');if(!el)return;el.textContent=t;clearTimeout(UI.tt);UI.tt=setTimeout(()=>{if(G)renderLine()},1800)}
document.addEventListener('click',e=>{const b=e.target.closest('button,[data-tile],[data-seat],input[type=checkbox]');if(!b)return;const d=b.dataset;
  if(d.chz!=null){const c=UI.chz;if(c&&c.opts[+d.chz])go(c.opts[+d.chz].m);return}
  if(d.mv){const m=JSON.parse(d.mv);if(m.ui)return uiAct(m.ui);if(m.act==='sell')UI.sellSel=[];if(typeof sfx==='function')sfx('click');return go(m)}
  if(d.tile!=null)return onTile(+d.tile);
  if(d.seat!=null)return onSeat(+d.seat);
  if(d.mk!=null)return onMarket(+d.mk);
  if(d.dj)return onDjinn(d.dj,false);if(d.th)return onDjinn(d.th,true);
  if(d.sell){const i=UI.sellSel.indexOf(d.sell);if(i>=0)UI.sellSel.splice(i,1);else UI.sellSel.push(d.sell);render();return}
  if(d.pw){const w=JSON.parse(d.pw);UI.pendDj=UI.pendDj&&same(UI.pendDj,w)?null:w;UI.pendItem=null;render();return}
  if(d.pi){UI.pendItem=UI.pendItem&&UI.pendItem.k===d.pi?null:{k:d.pi};UI.pendDj=null;render();return}
  if(d.np){UI.setup.np=+d.np;render();return}if(d.seatset!=null){const i=+d.seatset;UI.setup.seats[i]=UI.setup.seats[i]==='human'?'ai':'human';render();return}
  if(d.lv!=null){const i=+d.lv;const L=['easy','normal','hard'];UI.setup.lv[i]=L[(L.indexOf(UI.setup.lv[i])+1)%3];render();return}
  if(d.ex&&b.type==='checkbox'){UI.setup.ex[d.ex]=b.checked;return}
  if(d.ui)return uiAct(d.ui);
  switch(d.a){case 'snd':toggleSound();return;case 'mus':toggleMusic();return;case 'speed':UI.speed=UI.speed===1?3:UI.speed===3?.5:1;render();return;case 'pause':UI.pause=!UI.pause;render();schedule();return;case 'new':if(online()){UI.modal='lobby';render();return}openStart();return}});
// a tap anywhere that is not a button, while the computer plays, hurries it along
document.addEventListener('pointerdown',e=>{if(G&&!G.over&&!me()&&!UI.modal&&e.target.closest&&e.target.closest('#bd'))UI.hurry=true},true);
document.addEventListener('pointerdown',e=>{const tp=document.getElementById('tip');if(tp&&!tp.hidden&&!(e.target.closest&&e.target.closest('#tip')))tp.hidden=true},true);
document.addEventListener('pointerdown',e=>{if(UI.chz&&!(e.target.closest&&e.target.closest('#chz,[data-tile],[data-seat],[data-dj],[data-th]'))){UI.chz=null;if(G)render()}},true);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&(UI.pendDj||UI.pendItem||UI.chz)){UI.pendDj=UI.pendItem=UI.chz=null;render()}});
function uiAct(a){if(online()){if(a==='new'||a==='start'){UI.modal='lobby';render();return}if(a==='undodrop'&&isClient()){netSend({act:'undodrop'});return}if(a==='continue')return}
  switch(a){case 'start':beginGame();return;case 'quick':UI.setup.np=2;UI.setup.seats=['human','ai','ai','ai','ai'];beginGame();return;case 'continue':loadSaved();return;case 'new':openStart();return;case 'story':if(typeof GXC!=='undefined'&&window.CAMPAIGN){UI.modal=null;GX.close();render();GXC.open()}return;
  case 'again':UI.modal=null;beginGame();return;case 'closeover':UI.modal=null;render();return;
  case 'undodrop':{if(!UI.moveSnap||!UI.moveSteps)return;const steps=UI.moveSteps.slice(0,-1);G=JSON.parse(UI.moveSnap);UI.moveSteps=[];for(const m of steps){performMove(m,G.cur);UI.moveSteps.push(m)}if(!steps.length)UI.moveSnap=null;refresh();return}}}
function openStart(){UI.modal='start';render()}
function resetScene(){UI.camp=null;UI.snap=null;UI.chz=null;UI.pendDj=UI.pendItem=null;UI.mkSel=[];UI.sellSel=[];UI.moveSnap=null;UI.hurry=false}
function beginGame(o){o=o||{};const s=UI.setup;UI.modal=null;UI.fx.length=0;UI.fxSeen=0;resetScene();const seats=s.seats.slice(0,s.np);
  newGame({np:s.np,seats,lv:s.lv.slice(0,s.np),ex:Object.assign({},s.ex,s.np===5?{sultan:true}:{}),mode:seats.every(x=>x==='ai')?'ai':'x'});UI.modal=null;refresh()}
function loadSaved(){try{const g=JSON.parse(localStorage.getItem(SAVE));if(!g||!g.v)throw 0;G=g;UI.modal=null;resetScene();refresh()}catch(e){openStart()}}
// ---------- the computer: one step at a time, about 0.6 s a drop; tap the table to hurry ----------
const modalStops=()=>UI.modal&&UI.modal!=='lobby';
let aiTimer=null;function schedule(){if(online()&&isClient())return;if(aiTimer||!G||G.over||UI.pause||modalStops())return;const s=sideToAct();if(s<0||P(s).human)return;
  const drop=G.step==='move'&&G.move;const base=drop?600:420;const d=ANIM?Math.max(0,base/(UI.speed||1)*(UI.hurry?.12:1)):0;
  aiTimer=setTimeout(()=>{aiTimer=null;if(!G||G.over||modalStops()||(online()&&isClient()))return;const s2=sideToAct();if(s2<0||P(s2).human)return;const m=aiMove(s2);if(!m){console.error('AI has no move in '+G.phase+'/'+G.step);return}go(m)},d)}

// ---------- UI part 2: fitting the grid, animating what changed between two renders, the chooser pop-over, the ghost finger ----------
function fit(){const gw=$('#gw'),g=$('#grid');if(!gw||!g||!G)return;const W=G.W,H=G.H,gap=3;const bw=gw.clientWidth,bh=gw.clientHeight;if(bw<20||bh<20)return;
  let cw=Math.floor((bw-(W-1)*gap)/W),ch=Math.floor((bh-(H-1)*gap)/H);ch=Math.min(ch,Math.round(cw*1.55));cw=Math.min(cw,Math.round(ch*1.6));
  g.style.width=(cw*W+(W-1)*gap)+'px';g.style.height=(ch*H+(H-1)*gap)+'px';
  const ms=Math.max(10,Math.min(26,Math.round(Math.min(cw*.27,(ch-27)/2.36))));g.style.setProperty('--ms',ms+'px');g.style.setProperty('--cw',cw+'px');g.style.setProperty('--ch',ch+'px');
  // how many people fit on a tile in two rows: past that they are drawn smaller
  const cap=Math.max(1,Math.floor((cw-10)/(ms+2)))*Math.max(1,Math.floor((ch-27)/(ms*1.18+2)));
  for(const e of g.querySelectorAll('.tile[data-n]')){const n=+e.dataset.n;e.classList.toggle('m7',n>cap&&n<=cap*1.7);e.classList.toggle('m10',n>cap*1.7)}}
function relayout(sz){const R=document.documentElement;R.classList.toggle('land',sz.w>sz.h&&sz.w>=520);R.classList.toggle('short',sz.h<=600);if(G){fit();placeChz();placeFinger()}}
if(typeof GXV!=='undefined')GXV.watch(relayout);else addEventListener('resize',()=>relayout({w:innerWidth,h:innerHeight}));
// ---------- flights ----------
const ctr=r=>({x:r.left+r.width/2,y:r.top+r.height/2});
const spd=()=>UI.speed>1?UI.speed:1;
function flyEl(inner,cls,from,to,o){o=o||{};const fx=$('#fx');if(!fx||!ANIM)return null;const el=document.createElement('div');el.className='fl '+(cls||'');el.innerHTML=inner;const ms=getComputedStyle($('#grid')).getPropertyValue('--ms')||'18px';el.style.setProperty('--ms',ms);
  el.style.left=from.x+'px';el.style.top=from.y+'px';fx.appendChild(el);const dur=(o.dur||420)/spd();
  const dx=to.x-from.x,dy=to.y-from.y;const lift=Math.min(26,Math.hypot(dx,dy)*.25);let done=false;const fin=()=>{if(done)return;done=true;el.remove();if(o.end)o.end()};
  try{const a=el.animate([{transform:'translate(-50%,-50%) scale(1)',opacity:1},{transform:`translate(calc(-50% + ${dx/2}px),calc(-50% + ${dy/2-lift}px)) scale(${o.big||1.25})`,opacity:1,offset:.5},{transform:`translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) scale(${o.end2==null?1:o.end2})`,opacity:o.fade?0:1}],{duration:dur,delay:(o.delay||0)/spd(),easing:'cubic-bezier(.4,.1,.3,1)',fill:'both'});
    a.onfinish=fin;setTimeout(fin,dur+(o.delay||0)/spd()+400)}catch(e){fin()}return el}
function tileEl(i){return document.querySelector(`#grid [data-tile="${i}"]`)}
function seatEl(i){return document.querySelector(`#seats [data-seat="${i}"]`)}
function floatText(txt,at,cls){const fx=$('#fx');if(!fx||!ANIM)return;const el=document.createElement('div');el.className='ft '+(cls||'');el.textContent=txt;el.style.left=at.x+'px';el.style.top=at.y+'px';fx.appendChild(el);setTimeout(()=>el.remove(),1500/spd())}
function animate(prev){const cur=snapState();if(!ANIM||!prev||document.hidden)return;const flights=[];const gains={},loss={};
  for(let i=0;i<cur.tiles.length;i++){const a=prev.tiles[i],b=cur.tiles[i];if(!a||!b)continue;const ca={},cb={};for(const c of a.m.concat(a.hand))ca[c]=(ca[c]||0)+1;for(const c of b.m.concat(b.hand))cb[c]=(cb[c]||0)+1;
    for(const c of new Set([...Object.keys(ca),...Object.keys(cb)])){const d=(cb[c]||0)-(ca[c]||0);for(let k=0;k<Math.abs(d);k++)(d>0?(gains[c]=gains[c]||[]):(loss[c]=loss[c]||[])).push(i)}}
  const W=G.W,dist=(a,b)=>Math.abs(a%W-b%W)+Math.abs(Math.floor(a/W)-Math.floor(b/W));
  const actor=prev.cur!=null&&prev.cur>=0?prev.cur:cur.cur;const killing=prev.step==='tribe'&&prev.act&&prev.act.color==='assassin';
  for(const c of new Set([...Object.keys(gains),...Object.keys(loss)])){const g=(gains[c]||[]).slice(),l=(loss[c]||[]).slice();
    while(g.length&&l.length){let bi=0,bj=0,bd=1e9;for(let x=0;x<l.length;x++)for(let y=0;y<g.length;y++){const d=dist(l[x],g[y]);if(d<bd){bd=d;bi=x;bj=y}}flights.push({c,from:{tile:l[bi]},to:{tile:g[bj]}});l.splice(bi,1);g.splice(bj,1)}
    for(const t of l)flights.push({c,from:{tile:t},to:killing?null:{seat:actor}})}
  let n=0;const nHide={};
  for(const f of flights){const fe=f.from.tile!=null?tileEl(f.from.tile):null;if(!fe)continue;const fr=fe.querySelector('.ms')||fe;const from=ctr(fr.getBoundingClientRect());let to,hid=null,fadeOnly=false;
    if(f.to&&f.to.tile!=null){const te=tileEl(f.to.tile);if(!te)continue;const nodes=[...te.querySelectorAll(`.mp[data-c="${f.c}"]`)].filter(x=>!x.classList.contains('fhid'));hid=nodes[nodes.length-1]||null;to=ctr((hid||te).getBoundingClientRect());if(hid)hid.classList.add('fhid')}
    else if(f.to&&f.to.seat!=null){const se=seatEl(f.to.seat);if(!se)continue;to=ctr(se.getBoundingClientRect())}else{to={x:from.x,y:from.y-20};fadeOnly=true}
    flyEl(`<i class="mp" data-c="${f.c}"></i>`,'',from,to,{delay:n*70,end:()=>{if(hid)hid.classList.remove('fhid')},fade:!!(f.to&&f.to.seat!=null)||fadeOnly,end2:f.to&&f.to.seat!=null?.4:fadeOnly?1.6:1});n++}
  // the goods row and the djinn row: a card that left flies to whoever took it; new ones slide in
  const take=(oldA,newA)=>{const left=[];let j=0;const used=[];for(let i=0;i<oldA.length;i++){if(j<newA.length&&newA[j]===oldA[i]){j++}else left.push(i)}return {left,added:Math.max(0,newA.length-(oldA.length-left.length))}};
  const mk=take(prev.market,cur.market);const rows=$('#mkt');
  if(mk.left.length&&rows){const slots=rows.querySelectorAll('.mrow .mcard');for(const i of mk.left){const s=slots[i];if(!s)continue;flyEl(`<span class="mi">${RICON[prev.market[i]]}</span>`,'card',ctr(s.getBoundingClientRect()),seatPoint(actor),{delay:n*70,fade:true,end2:.4});n++}}
  if(mk.added&&rows){const slots=rows.querySelectorAll('.mrow .mcard:not(.empty)');for(let k=Math.max(0,slots.length-mk.added);k<slots.length;k++){slots[k].classList.add('newc')}}
  const dj=take(prev.djRow,cur.djRow);if(dj.left.length&&rows){const dr=rows.querySelector('.drow');const r=dr.getBoundingClientRect();for(const i of dj.left){flyEl(`<span class="mi">🧞</span>`,'card',{x:r.left+r.width*(i+.5)/Math.max(3,prev.djRow.length),y:r.top+r.height/2},seatPoint(actor),{delay:n*70,fade:true,end2:.4});n++}}
  if(dj.added&&rows){const cs=rows.querySelectorAll('.drow .dcard:not(.th)');for(let k=Math.max(0,cs.length-dj.added);k<cs.length;k++)cs[k].classList.add('newc')}
  // tokens that appeared: camels, tents, palms, palaces
  for(let i=0;i<cur.tiles.length;i++){const a=prev.tiles[i],b=cur.tiles[i];if(!a)continue;const te=tileEl(i);if(!te)continue;
    if((b.camel!=null&&a.camel!==b.camel)||(b.tent!=null&&a.tent!==b.tent)){const o=te.querySelector('.own');if(o)o.classList.add('popin')}
    if(b.palm>a.palm||b.pal>a.pal){for(const o of te.querySelectorAll('.tok'))o.classList.add('popin')}}
  // scores pop up where they are earned
  const tf=cur.act&&cur.act.tile!=null?tileEl(cur.act.tile):null;
  cur.tot.forEach((t,i)=>{const d=t-(prev.tot[i]||0);if(!d)return;const se=seatEl(i);if(!se)return;const ss=se.querySelector('.ss');if(ss){ss.classList.add('bump')}
    const at=tf&&i===actor?ctr(tf.getBoundingClientRect()):ctr(se.getBoundingClientRect());floatText((d>0?'+':'−')+Math.abs(d),at,d>0?'up':'dn');if(tf&&i===actor){const p2=ctr(se.getBoundingClientRect());if(Math.hypot(p2.x-at.x,p2.y-at.y)>40)floatText((d>0?'+':'−')+Math.abs(d),p2,d>0?'up':'dn')}})}
function seatPoint(i){const se=seatEl(i);return se?ctr(se.getBoundingClientRect()):{x:innerWidth/2,y:20}}
// ---------- the pop-over for a choice on a tile, a seat or a card ----------
function placeChz(){const el=$('#chz');if(!el)return;const c=UI.chz;if(!c||!G){el.hidden=true;el.innerHTML='';return}
  el.innerHTML=c.opts.map((o,i)=>`<button class="chb glow" data-chz="${i}">${o.html}</button>`).join('');el.hidden=false;
  const a=c.anchor;const ae=a.tile!=null?tileEl(a.tile):a.seat!=null?seatEl(a.seat):a.dj?document.querySelector(`[data-dj="${a.dj}"],[data-th="${String(a.dj).replace('t:','')}"]`):null;if(!ae){el.hidden=true;return}
  const r=ae.getBoundingClientRect(),w=el.offsetWidth,h=el.offsetHeight;let x=r.left+r.width/2-w/2;x=Math.max(6,Math.min(innerWidth-w-6,x));let y=r.top-h-8;if(y<50)y=r.bottom+8;
  el.style.left=x+'px';el.style.top=y+'px'}
// ---------- the ghost finger: shows one real, legal move to the new player, and stays away after a few moves ----------
const FING={n:0,max:10,key:'',t:null};try{FING.n=+localStorage.getItem('soq_fing')||0}catch(e){}
function fingerUsed(m){FING.n++;try{localStorage.setItem('soq_fing',String(FING.n))}catch(e){}const f=$('#finger');if(f){f.hidden=true;FING.key=''}}
function fingerEl(m){const q=s=>document.querySelector(s);
  switch(m.act){case 'bid':case 'sell':case 'end':case 'undo':case 'tribe':return [...document.querySelectorAll('[data-mv]')].find(b=>b.dataset.mv===JSON.stringify(m))||null;
  case 'start':case 'step':return tileEl(m.tile);
  case 'q':{const o=G.q&&G.q.opts[m.i];const t=o?qBoardTile(o):null;if(t!=null)return tileEl(t);return [...document.querySelectorAll('[data-mv]')].find(b=>b.dataset.mv===JSON.stringify(m))||null}
  case 'tile':if(m.place!=null)return tileEl(m.place)||q('#acts .ab.go');if(m.take)return q(`[data-mk="${m.take[0]}"]`);if(m.dj)return q(`[data-dj="${m.dj}"]`);if(m.thief)return q(`[data-th="${m.thief}"]`);if(m.skip||m.work)return [...document.querySelectorAll('[data-mv]')].find(b=>b.dataset.mv===JSON.stringify(m))||null}
  return null}
function fingerTarget(){if(!G||G.over||UI.modal||GX.open||UI.chz||UI.autoOn||FING.n>=FING.max)return null;if(typeof GXH!=='undefined'){const hs=GXH.state();if(!hs.on||hs.cur||hs.rules)return null}const hp=me();if(!hp||online()&&isClient())return null;
  const k=G.seed+'|'+G.logN+'|'+G.phase+'|'+G.step+'|'+(G.q?1:0)+'|'+(G.move?G.move.path.length:0);if(FING.key!==k){FING.key=k;FING.m=null;
    try{FING.m=typeof hlpAdvice==='function'?hlpAdvice():null}catch(e){FING.m=null}}
  const m=FING.m;if(!m)return null;if(!validMoves(hp.i).some(x=>same(x,m))&&m.act!=='start')return null;return fingerEl(m)}
function placeFinger(){const f=$('#finger');if(!f)return;let el=null;try{el=fingerTarget()}catch(e){el=null}if(!el||!el.getBoundingClientRect){f.hidden=true;return}
  const r=el.getBoundingClientRect();if(r.width<4||r.bottom<0||r.top>innerHeight){f.hidden=true;return}
  f.hidden=false;f.style.left=Math.round(r.left+r.width/2)+'px';f.style.top=Math.round(r.top+r.height*.55)+'px';f.dataset.on=el.dataset.tile!=null?'tile':'btn';
  if(f.dataset.k!==FING.key){f.dataset.k=FING.key;f.classList.remove('go');void f.offsetWidth}f.classList.add('go')}
// a small note next to a card the player touched (not a panel: any other touch closes it and goes through)
function showTip(anchor,html){const el=document.getElementById('tip');if(!el||!anchor)return;el.innerHTML=html;el.hidden=false;const r=anchor.getBoundingClientRect(),w=el.offsetWidth,h=el.offsetHeight;
  let x=Math.max(6,Math.min(innerWidth-w-6,r.left+r.width/2-w/2));let y=r.top-h-8;if(y<44)y=r.bottom+8;el.style.left=x+'px';el.style.top=y+'px';clearTimeout(UI.tipT);UI.tipT=setTimeout(()=>{el.hidden=true},4500)}

// ---------- UI part 3: drawers, start and result screens, settings, story mode, boot ----------
function pChip(p){return `<span class="pc" style="--pc:${PCOL[p.i]}"><i></i>${esc(p.nm)}</span>`}
function mdot(c,big){return `<span class="md ${big?'big':''}" style="--mc:${MCSS[c]}" title="${MNAME[c]}"></span>`}
function statusHtml(p){const s=scoreOf(p);const L=(ic,n,lab,t)=>`<span class="st" title="${t||lab}">${ic} <b>${n}</b><small>${lab}</small></span>`;
  return `<div class="stat" style="--pc:${PCOL[p.i]}"><b class="nm">${esc(p.nm)}${online()&&p.i===NET.mySeat?' <small>(you)</small>':''}${p.human?'':p.away?' <small>(left · cpu)</small>':' <small>(cpu)</small>'}</b><span class="tot" title="points so far">★ ${shownTotal(p)}</span>
   <div class="sts">${L('🪙',p.coins,'coins')}${L('🐪',p.camels,'camels')}${p.tent?L('⛺',1,'tent'):''}${L(mdot('vizier'),p.vz,'Advisors')}${L(mdot('elder'),p.el,'Sages')}${G.ex.artisans?L(mdot('artisan'),p.art,'Crafters'):''}${L('🔮',p.fk,'Mystics','Mystic cards: add power to Masons or Shadows, or stand in for a Sage')}${L('🧺',p.res.length,'goods · set '+goodsBest(p),'goods cards; the set is worth '+goodsBest(p)+' points now')}${p.dj.length?L('🧞',p.dj.length,'djinns'):''}</div></div>`}
function scoreTable(){const rows=G.over.scores;const keys=['coins','advisors','sages','crafters','djinns','tiles','palms','palaces','goods','items','cities','total'];const nm={coins:'🪙 Coins',advisors:'Advisors',sages:'Sages',crafters:'Crafters',djinns:'Djinns',tiles:'Tiles',palms:'Palms',palaces:'Palaces',goods:'Goods',items:'Items',cities:'Cities',total:'★ Total'};
  const epi=rows.map(r=>{const best=keys.filter(k=>k!=='total').sort((a,b)=>r.s[b]-r.s[a])[0];return `<li>${pChip(P(r.p))}: most of the points came from <b>${nm[best]}</b> (${r.s[best]}).</li>`}).join('');
  return `<div class="prompt"><h3>🏆 ${esc(G.winText)}</h3><ul class="story">${epi}</ul><div class="tw"><table><tr><th></th>${rows.map(r=>`<th>${pChip(P(r.p))}</th>`).join('')}</tr>${keys.filter(k=>k==='total'||rows.some(r=>r.s[k])).map(k=>`<tr class="${k==='total'?'tot':''}"><td>${nm[k]}</td>${rows.map(r=>`<td>${r.s[k]}</td>`).join('')}</tr>`).join('')}</table></div></div>`}
function renderPopups(){if(GX.open==='logd'){const lb=$('#logbody');lb.innerHTML=`<ol class="log">${G.log.slice(0,300).reverse().map(l=>`<li class="${l.c}"><small>R${l.r}</small> ${esc(l.t)}</li>`).join('')}</ol>`;lb.scrollTop=lb.scrollHeight}
  if(GX.open==='plrd')$('#plrbody').innerHTML=G.pl.map(p=>playerSheet(p)).join('');
  if(GX.open==='djd'&&$('#djbody').dataset.v!==String(G.logN))renderDjPop()}
function playerSheet(p){const s=scoreOf(p);const hid=online()&&!G.over&&p.i!==NET.mySeat;return `<section class="sheet" style="--pc:${PCOL[p.i]}"><h3>${pChip(p)} ${online()&&p.i===NET.mySeat?'<small>(you)</small>':''}${p.human?'':'<small>(computer)</small>'} <span class="tot">★ ${shownTotal(p)}</span></h3>${statusHtml(p)}
  <div><b>Goods:</b> ${p.res.length?p.res.slice().sort().map(r=>RICON[r]).join(' '):'none'} ${p.fk?`· ${p.fk} Mystic${p.fk>1?'s':''}`:''}</div>
  <div><b>Djinns:</b> ${p.dj.length?p.dj.map(k=>`<span class="tag" title="${esc(DJ[k].x)}">${esc(DJ[k].n)} ${DJ[k].vp}</span>`).join(' '):'none'}</div>
  ${G.ex.artisans?`<div><b>Items:</b> ${hid&&p.items.length?`${p.items.length} face down`:p.items.length?p.items.map(k=>`<span class="tag" title="${esc(ITEMS[k].x)}">${esc(ITEMS[k].n)}</span>`).join(' '):'none'}</div>`:''}
  ${G.ex.thieves?`<div><b>Cutpurses:</b> ${p.thieves.length?p.thieves.map(t=>esc(THIEVES[t.k].n)).join(', '):'none'}</div>`:''}
  <div><b>Tiles held:</b> ${G.board.filter(t=>owner(t)===p.i).map(t=>`${esc(tileName(t))}${t.palm?' 🌴'+t.palm:''}${t.pal?' 🏰'+t.pal:''}`).join(', ')||'none'}</div>
  <div class="small muted">So far: ${Object.entries(s).filter(([k,v])=>v&&k!=='total'&&!(hid&&k==='items')).map(([k,v])=>k+' '+v).join(' · ')}</div></section>`}
function renderDjPop(){const b=$('#djbody');b.dataset.v=String(G.logN);const inGame=DJINNS_FOR(G.ex);const where=k=>{if(G.djRow.includes(k))return 'on offer';for(const p of G.pl)if(p.dj.includes(k))return 'owned by '+p.nm;if(G.djDisc.includes(k))return 'discarded';return 'in the deck'};
  b.innerHTML=`<p class="muted small">Summon djinns at a Shrine: 2 Sages, or 1 Sage and 1 Mystic. Powers with a cost can be used once per turn, paying each time.</p><div class="cgrid">${inGame.map(d=>`<div class="card dj"><h4>${esc(d.n)} <small>${d.vp} pts</small></h4>${cardArt('djinn',d.n)}<div class="tag">${d.cost?{EF:'power: 1 Sage or 1 Mystic',EEF:'power: 1 Sage + 1 Sage-or-Mystic',F:'power: 1 Mystic','F+':'power: Mystics when bidding'}[d.cost]:'always on'} · ${where(d.k)}</div><p>${esc(d.x)}</p></div>`).join('')}</div>`}
function refHtml(){const sec=(t,items)=>`<h3>${t}</h3><div class="cgrid">${items.map(i=>`<div class="card"><h4>${i.n}${i.c>1?` <small>×${i.c}</small>`:''}</h4>${i.art||(/^[^\x00-\x7f]/.test(i.n)?cardArt('good',i.n,{glyph:i.n.split(' ')[0],hue:30}):'')}${i.tag?`<div class="tag">${esc(i.tag)}</div>`:''}<p>${esc(i.x)}</p></div>`).join('')}</div>`;
  const tiles=[];for(const [k,v,n,col] of TILESET.concat(TILESET_ART,TILESET_WHIM)){const d=TILEDEF[k];tiles.push({art:cardArt('tile',d.n+v,{blue:col?col==='blue':d.blue,v,hue:30}),n:d.n,c:n,tag:`${v?v+' points · ':''}${(col?col==='blue':d.blue)?'blue':'red'}${TILESET_ART.some(x=>x[0]===k)?' · Crafters':TILESET_WHIM.some(x=>x[0]===k)?' · Wonder Cities':''}`,x:d.x})}
  return sec('The tribes (and the Crafters)',Object.keys(MNAME).map(c=>({art:cardArt('tribe',c,{col:MCSS[c]||'#888',hue:35}),n:`${MNAME[c]} (${c==='vizier'?'yellow':c==='elder'?'white':c==='merchant'?'green':c==='builder'?'blue':c==='assassin'?'red':'purple'})`,c:c==='artisan'?15:MEEPLE_COUNT[c],tag:c==='artisan'?'Crafters expansion':'meeples',x:MHELP[c]})))+
   sec('Tiles',tiles)+sec('Goods cards',Object.keys(RESOURCE_COUNT).map(r=>({art:cardArt('good',r,{glyph:RICON[r]}),n:`${RICON[r]} ${RNAME[r]}`,c:RESOURCE_COUNT[r],tag:r==='fakir'?'special':'goods',x:r==='fakir'?'Adds 1 Mason or 1 Shadow range, pays for a Sage when summoning, pays djinn powers. Never part of a set.':'Collect sets of different kinds: 1, 3, 7, 13, 21, 30, 40, 50 or 60 points for 1–9 different kinds.'})))+
   sec('Djinns',DJINNS.map(d=>({n:d.n,tag:`${d.vp} points · ${d.cost?'power':'always on'}${d.set?' · '+{promos:'promo',artisans:'Crafters',thieves:'Cutpurses'}[d.set]:''}${d.assumed?' · '+d.assumed+' assumed':''}`,x:d.x})))+
   sec('Items (Crafters)',Object.values(ITEMS).map(i=>({n:i.n,c:i.cp,tag:i.kind,x:i.x})))+sec('Cutpurses',Object.values(THIEVES).map(t=>({n:t.n,tag:'Cutpurses expansion',x:t.x})))+
   sec('Tokens and pieces',[{n:'🐪 Camels',tag:'11 each with 2 players, 8 with 3–5',x:'Mark the tiles you control. Placing your last camel ends the game at the end of the round.'},{n:'⛺ Tent',tag:'Crafters · 1 each',x:'Claim a tile with it instead of a camel: it scores the tile plus 1 for each red tile around it.'},{n:'🌴 Palm tree',x:'3 points to whoever holds the tile (5 with Nakhla; doubled next to the Great Lake).'},{n:'🏰 Palace',x:'5 points to whoever holds the tile (doubled next to the Great Lake).'},{n:'⛰ Mountains',tag:'Crafters',x:'Block moving between two tiles (not Shadow range).'},{n:'🪙 Coins',x:'1 point each at the end; pay for turn order and bazaar goods.'},{n:'Turn-order track',x:'Costs 0, 0, 0, 1, 3, 5, 8, 12, 18 (5 players: 0, 0, 0, 1, 1, 3, 3, 5, 5, 8, 12, 18).'}])}
// ---------- inline SVG icons (consistent line icons instead of emoji in the chrome) ----------
const ICONS={bulb:'<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.6 1 2.5h6c0-.9.2-1.7 1-2.5A6 6 0 0 0 12 3z"/>',
 camel:'<path d="M3 19v-5.5C3 11.6 4 10.6 5.6 10.6 6.6 7.8 7.6 7 9 7s2.3 1.6 3.2 3.6h1.6l1.3-3.2c.4-1 1.1-1.4 2-1.4h1.4l1.5 1.7-1.6.6-1 3.9v3.3M6.5 14v5M16.5 14v5M10.5 14.4V19"/>',
 lamp:'<path d="M2.5 14c2 2.2 5 3.3 9 3.3 3.6 0 5.7-1.3 6.8-3l3.2-2.1h-3.2C17.2 10.3 14.8 9.5 12 9.5c-3.3 0-6.9 1.3-9.5 4.5zM12 9.5V7.8M9 20.5h7M12.5 17.3v3.2"/><path d="M12 7.8c-1.3-1 0-2 .8-2.8s.2-2-.8-2.5"/>',
 scroll:'<path d="M7 4h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6a2 2 0 0 0-2-2h3M4 4a2 2 0 0 0-2 2v2h4M10 9h6M10 13h6M10 17h3"/>',
 cards:'<rect x="3" y="6" width="11" height="15" rx="2"/><path d="M9.5 3.4l8.7 2.3a2 2 0 0 1 1.4 2.5L17 18"/><path d="M8.5 11l1.2 2.3 2.3.3-1.7 1.6.4 2.3-2.2-1.1-2.2 1.1.4-2.3-1.7-1.6 2.3-.3z"/>',
 book:'<path d="M12 6c-2-1.5-5-2-8-1.5v14c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5v-14c-3-.5-6 0-8 1.5zM12 6v14"/>',
 snd:'<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16.5 9a4 4 0 0 1 0 6M19 6.5a7.5 7.5 0 0 1 0 11"/>',sndoff:'<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M17 9.5l5 5M22 9.5l-5 5"/>',
 mus:'<path d="M9 18V5.5l11-2v12.5"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>',musoff:'<path d="M9 18V5.5l11-2v12.5"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/><path d="M3 3l18 18"/>',
 fast:'<path d="M3.5 6.5l7.5 5.5-7.5 5.5zM12 6.5l7.5 5.5L12 17.5z"/>',pause:'<path d="M8 5v14M16 5v14"/>',play:'<path d="M7 5l12 7-12 7z"/>',menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',plus:'<path d="M12 5v14M5 12h14"/>',
 gear:'<circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/>',
 gem:'<path d="M6 3h12l3 6-9 12L3 9zM3 9h18M9 3l-1 6 4 12 4-12-1-6"/>'};
function ICON(k){return `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[k]||''}</svg>`}
function paintIcons(root){for(const e of (root||document).querySelectorAll('[data-ic]'))if(!e.firstChild)e.innerHTML=ICON(e.dataset.ic)}
function soundBtns(){const a=document.getElementById('sndbtn'),b=document.getElementById('musbtn');const on=typeof SND==='undefined'||SND.on,mu=typeof SND!=='undefined'&&SND.music;
  if(a){a.innerHTML=ICON(on?'snd':'sndoff');a.setAttribute('aria-pressed',on?'true':'false')}if(b){b.innerHTML=ICON(mu?'mus':'musoff');b.setAttribute('aria-pressed',mu?'true':'false')}if(GX.open==='setd')renderSettings()}
function hueOf(s){let h=0;for(const c of String(s))h=(h*31+c.charCodeAt(0))%360;return h}
function cardArt(kind,name,o){o=o||{};const h=o.hue!=null?o.hue:hueOf(name);const id='ca'+Math.abs(hueOf(name+kind))+kind.length;let fg='';
  if(kind==='djinn')fg=`<path d="M22 58c6 5 16 7 28 7 11 0 17-4 20-9l9-6h-9c-3-6-10-8-19-8-9 0-20 3-29 16z" fill="#e9b24a" stroke="#6b3d10" stroke-width="1.5"/><path d="M50 42c-6-5 3-9 0-15-3-6 6-10 3-16" fill="none" stroke="hsl(${h},70%,85%)" stroke-width="4" stroke-linecap="round" opacity=".9"/><circle cx="53" cy="12" r="6" fill="hsl(${h},70%,80%)"/>`;
  else if(kind==='tribe')fg=`<path d="M40 70h20l-2-4c-3-2-4-8-4-16l4-2-3-2c4-2 6-6 6-10a11 11 0 0 0-22 0c0 4 2 8 6 10l-3 2 4 2c0 8-1 14-4 16z" fill="${o.col}" stroke="rgba(0,0,0,.45)" stroke-width="1.5"/><ellipse cx="46" cy="30" rx="3" ry="4" fill="rgba(255,255,255,.4)"/>`;
  else if(kind==='tile')fg=`<rect x="26" y="22" width="48" height="48" rx="6" fill="${o.blue?'#2d5f9f':'#b34a2a'}"/><rect x="31" y="27" width="38" height="38" rx="4" fill="#ecc996"/><rect x="33" y="54" width="34" height="8" rx="4" fill="#f6e7c6"/>${o.v?`<circle cx="36" cy="58" r="6" fill="${o.blue?'#1b3a66':'#7a2d17'}"/>`:''}`;
  else fg=`<text x="50" y="58" font-size="30" text-anchor="middle">${o.glyph||''}</text>`;
  return `<svg class="ca" viewBox="0 0 100 76" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(${h},55%,${kind==='djinn'?30:62}%)"/><stop offset="1" stop-color="hsl(${(h+30)%360},60%,${kind==='djinn'?14:40}%)"/></linearGradient></defs><rect width="100" height="76" fill="url(#${id})"/><path d="M0 76V40q50-30 100 0v36z" fill="rgba(255,255,255,.08)"/>${fg}</svg>`}
// ---------- the screens in front of the board ----------
function renderModal(){const m=$('#modal');if(!m)return;const h=UI.modal==='start'?startHtml():UI.modal==='over'&&G&&G.over?overHtml():UI.modal==='lobby'&&online()?lobbyHtml():'';m.hidden=!h;if(m.dataset.h!==h){
  const a=document.activeElement,id=a&&m.contains(a)&&a.id,sel=id&&a.selectionStart!=null?[a.selectionStart,a.selectionEnd]:null;const det=[...m.querySelectorAll('details')].map(d=>d.open);
  m.innerHTML=h;m.dataset.h=h;if(UI.modal==='start')paintOpening();[...m.querySelectorAll('details')].forEach((d,i)=>{if(det[i]!=null)d.open=det[i]});if(id){const e=document.getElementById(id);if(e){e.focus({preventScroll:true});if(sel)try{e.setSelectionRange(sel[0],sel[1])}catch(x){}}}}}
UI.setup={np:2,seats:['human','ai','ai','ai','ai'],lv:['normal','normal','normal','normal','normal'],ex:{artisans:false,sultan:false,thieves:false,promos:false}};
function startHtml(){const o=UI.setup;let saved=null;try{saved=localStorage.getItem(SAVE)}catch(e){}
  return `<div class="mbox start"><canvas id="opencv" width="640" height="220" aria-hidden="true"></canvas><h2>Sands of Qamar</h2><p class="lede">Lead the tribes. Rule the bazaar.</p>
   <div class="acts big">${online()?'':'<button class="btn go big" data-ui="quick">▶ Play vs computer</button>'}${window.CAMPAIGN&&typeof GXC!=='undefined'?'<button class="btn big" data-ui="story">📜 Story mode</button>':''}${saved&&!online()?'<button class="btn big" data-ui="continue">Continue saved game</button>':''}</div>
   <details class="exd"><summary><b>More ways to play</b></summary><div class="more"><div class="seg">${[2,3,4,5].map(n=>`<button class="${o.np===n?'on':''}" data-np="${n}">${n} players</button>`).join('')}</div>
   <div class="seats">${Array.from({length:o.np},(_,i)=>`<div class="seatrow" style="--pc:${PCOL[i]}"><i></i><b>${PNAMES[i]}</b><button class="btn sm" data-seatset="${i}">${o.seats[i]==='human'?'🙂 person':'🤖 computer'}</button>${o.seats[i]==='ai'?`<button class="btn sm ghost" data-lv="${i}">${o.lv[i]}</button>`:''}</div>`).join('')}</div>
   <div class="exs">${[['artisans','The Crafters'],['sultan','Wonder Cities'],['thieves','Cutpurses'],['promos','Promo djinns']].map(([k,n])=>`<label class="chk"><input type="checkbox" data-ex="${k}" ${o.ex[k]||(k==='sultan'&&o.np===5)?'checked':''} ${k==='sultan'&&o.np===5?'disabled':''}> <b>${n}</b></label>`).join('')}</div>
   <div class="acts">${online()?'':'<button class="btn go" data-ui="start">Begin ▶</button>'}<button class="btn" data-gx="rulesd">How to play</button><button class="btn" data-gx="refd">Card list</button></div>${typeof onlineBlock==='function'?onlineBlock():''}</div></details></div>`}
function overHtml(){const mp=viewP();const win=G.over.win;const won=mp&&win.includes(mp.i);
  return `<div class="mbox over"><h2>${mp?(won?(win.length>1?'You share the win':'You win!'):'You lose'):esc(G.winText)}</h2>${scoreTable()}<div class="acts"><button class="btn go" data-ui="again">Play again</button><button class="btn" data-ui="closeover">View the board</button></div></div>`}
function renderSettings(){const el=$('#setbody');if(!el)return;const seg=(attr,cur,opts)=>`<div class="seg">${opts.map(([v,l])=>`<button ${attr}="${v}" class="${String(cur)===String(v)?'on':''}">${l}</button>`).join('')}</div>`;
  el.innerHTML=`<div class="setrow"><h4>Sound</h4><div class="seg"><button data-a="snd" class="${typeof SND==='undefined'||SND.on?'on':''}">${ICON('snd')} Effects</button><button data-a="mus" class="${typeof SND!=='undefined'&&SND.music?'on':''}">${ICON('mus')} Music</button></div></div>
   <div class="setrow"><h4>Computer speed</h4>${seg('data-spd',UI.speed||1,[[.5,'Slow'],[1,'Normal'],[3,'Fast']])}</div>`+(typeof GXH!=='undefined'?`<div class="setrow"><h4>Help</h4>${GXH.settingsHTML({rowClass:'',btnClass:''})}</div>`:'')}
document.addEventListener('click',e=>{const b=e.target.closest('[data-spd]');if(!b)return;UI.speed=+b.dataset.spd;if(G)render();renderSettings()});
// ---------- story mode (the shared campaign kit): ten chapters in three acts, bosses with a rule of their own ----------
function campStart(def){const s=def.setup||{},op=def.opponent||{};const np=s.np||s.players||(s.seats?s.seats.length:2);const seats=(s.seats||['human','ai']).slice(0,np);
  const lv=seats.map((x,i)=>i===0?'normal':(op.aiLevel||(s.lv&&s.lv[i])||'normal'));const ex=Object.assign({artisans:false,sultan:false,thieves:false,promos:false},s.ex||{});
  UI.fx.length=0;UI.fxSeen=0;resetScene();UI.modal=null;UI.camp=def;if(s.seed!=null)setSeed(s.seed);
  newGame({np,seats,lv,names:s.names,ex,mode:'x'});applyTwist(def);
  UI.setup.np=np;refresh()}
function campMetrics(g){const p=g.pl[0],s=scoreOf(p);const rivals=g.pl.slice(1).map(q=>scoreOf(q).total);const best=Math.max(...rivals);const won=!!g.over&&g.over.win.includes(0);
  return {won,score:s.total,margin:s.total-best,coins:p.coins,goods:s.goods,tiles:g.board.filter(t=>owner(t)===0).length,djinns:p.dj.length,advisors:p.vz,cities:g.board.filter(t=>t.k==='city'&&owner(t)===0).length,palaces:s.palaces,rounds:g.round}}
function campIsWon(g,def){const m=campMetrics(g);if(!m.won)return false;const gl=def.goal||{};switch(gl.type){case 'score':return m.score>=gl.value;case 'margin':return m.margin>=gl.value;case 'before-round':return m.rounds<gl.value;case 'custom':return gl.test?GXC.testStar(gl.test,m):true}return true}
function campInit(){if(typeof GXC==='undefined'||!window.CAMPAIGN)return;GXC.init({game:'sands',data:window.CAMPAIGN,startChapter:campStart,isWon:campIsWon,metrics:campMetrics,onExit:()=>{UI.camp=null;UI.modal='start';render()},
  scores:g=>g.pl.map(p=>scoreOf(p).total),seats:g=>g.pl.map((p,i)=>({name:p.nm,me:i===0,ai:p.human?undefined:p.lv}))})}
// ---------- start ----------
function boot(){GX.init({key:'soq'});paintIcons();GX.onShow=id=>{if(id==='setd')renderSettings();if(id==='rulesd')$('#rulesbody').innerHTML=RULES_HTML;if(id==='refd')$('#refbody').innerHTML=refHtml();if(id==='djd'&&G)renderDjPop();if(G)render()};
  campInit();soundBtns();UI.modal='start';render()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();

// ===================== help (gx-help kit): coach bubbles the first time, the lightbulb on demand =====================
// Bubbles: once per phase, short, pointing at the board. The bulb: the computer player's own move for you (hlpAdvice, the same one the ghost finger
// uses), a short why, and rules cards. Where the computer has no real answer (flute pulls, cutpurse hauls, aiming a power) the bulb shows rules only.
// ---------------------------------------------------------------- pictures for the rules cards (inline SVG in the game's colours)
const HP={
 meeple:c=>{const f=MCSS[c]||'#999';return '<svg viewBox="0 0 64 64"><ellipse cx="32" cy="57" rx="19" ry="4" fill="rgba(0,0,0,.18)"/><path d="M15 55Q32 20 49 55z" fill="'+f+'" stroke="#2b2418" stroke-width="3" stroke-linejoin="round"/><circle cx="32" cy="22" r="11" fill="'+f+'" stroke="#2b2418" stroke-width="3"/></svg>'},
 tile:(k,t)=>{const d=TILEDEF[k]||{};const b=d.blue?'#2d5f9f':'#b34a2a';return '<svg viewBox="0 0 64 64"><rect x="9" y="7" width="46" height="50" rx="7" fill="#ecc996" stroke="'+b+'" stroke-width="5"/><text x="32" y="40" text-anchor="middle" font-size="26">'+(TICON[k]||'')+'</text>'+(t?'<text x="32" y="53" text-anchor="middle" font-size="11" font-weight="800" fill="'+b+'">'+t+'</text>':'')+'</svg>'},
 coin:n=>'<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="22" fill="#e8c867" stroke="#8a6a1a" stroke-width="3.5"/><circle cx="32" cy="32" r="15" fill="none" stroke="#8a6a1a" stroke-width="2"/><text x="32" y="39" text-anchor="middle" font-size="20" font-weight="800" fill="#6b4a00" font-family="Georgia,serif">'+(n==null?'':n)+'</text></svg>',
 spot:n=>'<svg viewBox="0 0 64 64"><rect x="8" y="14" width="48" height="36" rx="9" fill="#fbf1de" stroke="#93391a" stroke-width="4"/><text x="32" y="38" text-anchor="middle" font-size="18" font-weight="800" fill="#93391a">'+n+'</text></svg>',
 camel:()=>'<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="23" fill="#fbf1de" stroke="#119e98" stroke-width="4"/><text x="32" y="43" text-anchor="middle" font-size="28">🐪</text></svg>',
 tent:()=>'<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="23" fill="#fbf1de" stroke="#d9772b" stroke-width="4"/><text x="32" y="43" text-anchor="middle" font-size="28">⛺</text></svg>',
 icon:(e,c)=>'<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="23" fill="#fbf1de" stroke="'+(c||'#93391a')+'" stroke-width="4"/><text x="32" y="43" text-anchor="middle" font-size="28">'+e+'</text></svg>',
 goods:r=>'<svg viewBox="0 0 64 64"><rect x="13" y="6" width="38" height="52" rx="6" fill="#fbf1d2" stroke="#8a6a1a" stroke-width="3.5"/><text x="32" y="40" text-anchor="middle" font-size="26">'+(RICON[r]||'')+'</text></svg>',
 djinn:()=>'<svg viewBox="0 0 24 24" fill="none" stroke="#93391a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">'+ICONS.lamp+'</svg>',
 chip:t=>'<svg viewBox="0 0 64 64"><rect x="6" y="18" width="52" height="28" rx="14" fill="#93391a"/><text x="32" y="38" text-anchor="middle" font-size="14" font-weight="800" fill="#fff6e6">'+t+'</text></svg>',
 pts:n=>'<svg viewBox="0 0 64 64"><path d="M32 6l7.5 17 18.5 1.6-14 12 4.4 18.4L32 45l-16.4 10 4.4-18.4-14-12L24.5 23z" fill="#e8c867" stroke="#8a6a1a" stroke-width="3" stroke-linejoin="round"/><text x="32" y="36" text-anchor="middle" font-size="15" font-weight="800" fill="#6b4a00">'+(n==null?'':n)+'</text></svg>',
 pass:()=>'<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="22" fill="none" stroke="#93391a" stroke-width="5"/><path d="M16 48L48 16" stroke="#93391a" stroke-width="5"/></svg>',
 tap:()=>'<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="18" fill="rgba(147,57,26,.15)" stroke="#93391a" stroke-width="4"/><path d="M30 14v26l-6-5-4 4 14 14h14l4-20-8-2-4-4-4 1-2-4z" fill="#fff" stroke="#231a10" stroke-width="2.5" stroke-linejoin="round"/></svg>'
};
function hpics(items){return '<div class="gxh-pics">'+items.map(it=>it==='>'?'<span class="gxh-ar">&rarr;</span>':'<figure>'+(HP[it[0]]?HP[it[0]](it[1],it[3]):'')+(it[2]?'<figcaption>'+it[2]+'</figcaption>':'')+'</figure>').join('')+'</div>'}
// ---------------------------------------------------------------- where each bubble points
const hq=s=>()=>document.querySelector(s);
const hfirst=(...sels)=>()=>{for(const s of sels){const e=document.querySelector(s);if(e&&e.getBoundingClientRect().width)return e}return null};
const HLP_STEPS={
 bid:{target:hfirst('#acts .sp-b.glow'),title:'Buy turn order',text:'Tap a glowing spot. Dearer spots play earlier; free spots cost nothing.',pic:()=>HP.spot('3🪙')},
 lift:{target:hfirst('#grid .tile.glow'),title:'Lift a group',text:'Tap a glowing tile to pick up everyone standing on it.',pic:()=>HP.meeple('merchant')},
 drop:{target:hfirst('#grid .tile.glow'),title:'Drop one by one',text:'Tap a glowing neighbour to drop one person there. The last must match a colour.',pic:()=>HP.meeple('builder')},
 collect:{target:hfirst('#acts .ab.go','#acts .ab'),title:'Use your tribe',text:'Tap Collect. The power chips below are optional extras.',pic:()=>HP.meeple('vizier')},
 mason:{target:hfirst('#acts .ab.go','#acts .ab'),title:'Choose your pay',text:'Masons earn coins for blue tiles around you. A Mystic adds one Mason.',pic:()=>HP.coin('+')},
 shadow:{target:hfirst('#grid .tile.glow','#seats .sch.glow','#acts .ab.go'),title:'Remove a person',text:'Tap a glowing tile or rival to remove someone there.',pic:()=>HP.meeple('assassin')},
 hamlet:{target:hfirst('#grid .tile.glow','#acts .ab.go'),title:'Build a palace',text:'Tap the glowing spot to build. A palace scores 5 points for the tile’s holder.',pic:()=>HP.icon('🏰')},
 oasis:{target:hfirst('#grid .tile.glow','#acts .ab.go'),title:'Plant a palm',text:'Tap the glowing spot to plant. A palm scores 3 points for the tile’s holder.',pic:()=>HP.icon('🌴')},
 shrine:{target:hfirst('#mkt .dcard.glow'),title:'Summon a djinn',text:'Tap a glowing djinn. It costs 2 Sages, or 1 Sage and 1 Mystic.',pic:()=>HP.djinn()},
 goods:{target:hfirst('#mkt .mcard.glow'),title:'Buy goods',text:'Tap a glowing goods card to buy it. The Grand Bazaar lets you tap two.',pic:()=>HP.goods('gold')},
 workshop:{target:hfirst('#acts .ab.go','#acts .ab'),title:'Commission an item',text:'Tap a pay button to take the top item, or tap Skip.',pic:()=>HP.icon('🔨')},
 sell:{target:hfirst('#mine .gchip','#acts .ab.go','#acts .ab'),title:'Sell or finish',text:'Tap goods of different kinds, then Sell for coins. Or tap End turn.',pic:()=>HP.coin('+')},
 power:{target:hfirst('#grid .tile.glow'),title:'Aim your power',text:'Tap a glowing tile to use the power there. Tap the chip again to cancel.',pic:()=>HP.djinn()},
 qClaim:{target:hfirst('#acts .ab'),title:'Camel or tent?',text:'Tap a button: a camel, or your tent for extra points from red tiles around.',pic:()=>HP.tent()},
 qItem:{target:hfirst('#acts .ab'),title:'Keep one item',text:'Tap the item you want to keep. The others are discarded.',pic:()=>HP.icon('🪄','#9a5bd0')},
 qDjinn:{target:hfirst('#acts .ab'),title:'Keep one djinn',text:'Tap the djinn you want to keep. The others are discarded.',pic:()=>HP.djinn()},
 qFlute:{target:hfirst('#grid .tile.glow','#acts .ab'),title:'Pull a person',text:'Tap a glowing neighbour to pull a person from it onto your tile.',pic:()=>HP.icon('🎶')},
 qKill:{target:hfirst('#grid .tile.glow','#acts .ab'),title:'Remove a person',text:'Tap a glowing tile to remove one person from it.',pic:()=>HP.meeple('assassin')},
 qThief:{target:hfirst('#acts .ab'),title:'Take your prize',text:'Tap the prize you want. Read each button first.',pic:()=>HP.icon('🦹')}
};
// ---------------------------------------------------------------- the rules cards (<= 20 words each, a picture each)
const HLP_RULES=[
 {title:'The goal',text:'Most points when the game ends wins. Points come from tiles, palaces, palms, djinns, goods, Advisors and coins.',pic:()=>hpics([['tile','oasis'],['djinn'],['coin',1],'>',['pts',null,'Winner']])},
 {title:'A turn in short',text:'Bid for turn order, lift a group, drop it tile by tile, then use your colour and tile.',pic:()=>hpics([['spot','1st'],'>',['meeple','merchant','Lift'],'>',['tile','small','Act']])},
 {phase:'bid',title:'Turn order',text:'Each round starts with a bid. Tap a glowing spot on the track to claim your place in line.',pic:()=>hpics([['spot','1st'],'>',['meeple','vizier','You']])},
 {phase:'bid',title:'Price of a spot',text:'Early spots cost coins, late ones are free. Coins are also worth one point each at the end.',pic:()=>hpics([['coin',8,'Early'],['coin',0,'Late']])},
 {phase:'bid',title:'Why go first?',text:'Playing earlier lets you grab tiles, goods and djinns before your rivals can.',pic:()=>hpics([['meeple','vizier','You'],'>',['tile','sacred','First']])},
 {phase:'lift',title:'Pick up a group',text:'Tap a tile with people on it. You lift all of them at once.',pic:()=>hpics([['tile','small','Tap'],'>',['meeple','merchant'],['meeple','builder']])},
 {phase:'lift',title:'Only some tiles glow',text:'A tile glows only if you can finish a legal move from it. Plan where your last person lands.',pic:()=>hpics([['tile','village','Glows'],['tile','lake','No']])},
 {phase:'lift',title:'The six colours',text:'Yellow and white are kept for points. Green buys goods, blue earns coins, red removes people, purple makes items.',pic:()=>hpics([['meeple','vizier'],['meeple','elder'],['meeple','merchant'],['meeple','builder'],['meeple','assassin']])},
 {phase:'drop',title:'Walk and drop',text:'Drop one person on each tile you pass, moving up, down, left or right. No stepping straight back.',pic:()=>hpics([['tile','oasis','1'],'>',['tile','small','2'],'>',['tile','village','3']])},
 {phase:'drop',title:'The last drop',text:'Your last person must land on a tile that already holds their colour. You then take all of that colour.',pic:()=>hpics([['meeple','merchant'],'>',['tile','large','Same colour']])},
 {phase:'drop',title:'Try another route',text:'Use the undo button to put people back and try again before you finish.',pic:()=>hpics([['meeple','builder'],'>',['tap']])},
 {phase:'collect',title:'Each colour acts',text:'Advisors and Sages are kept. Traders fetch goods. Masons earn coins. Shadows remove people. Crafters make items.',pic:()=>hpics([['meeple','vizier'],['meeple','merchant'],['meeple','builder'],['meeple','assassin']])},
 {phase:'collect',title:'Then the tile',text:'After the tribe, the tile you ended on has its own action: build, plant, summon or buy.',pic:()=>hpics([['meeple','merchant'],'>',['tile','small']])},
 {phase:'collect',title:'Optional powers',text:'Djinn and item chips are optional. Tap one, then a glowing target if it asks for one.',pic:()=>hpics([['chip','✨ Power'],'>',['tap']])},
 {phase:'mason',title:'Blue tiles pay',text:'Coins equal your Masons times the blue tiles in the 3 by 3 square around you.',pic:()=>hpics([['meeple','builder','×'],['tile','sacred','blue'],'>',['coin','+']])},
 {phase:'mason',title:'Mystic Mason',text:'Spending a Mystic card adds one Mason to the count, but the card is gone.',pic:()=>hpics([['goods','fakir'],'>',['meeple','builder','+1']])},
 {phase:'shadow',title:'Reach',text:'A Shadow removes one person up to its count of steps away, or a rival’s Advisor or Sage.',pic:()=>hpics([['meeple','assassin'],'>',['meeple','vizier','Rival']])},
 {phase:'shadow',title:'Empty tiles',text:'If a tile empties, you claim it with a camel, so a removal can win you land.',pic:()=>hpics([['tile','small','Empty'],'>',['camel']])},
 {phase:'shadow',title:'Mystic reach',text:'Each Mystic you spend adds one step of reach.',pic:()=>hpics([['goods','fakir'],'>',['meeple','assassin','+1 step']])},
 {phase:'hamlet',title:'Palace',text:'A palace scores 5 points for whoever holds the tile. Placing it is required.',pic:()=>hpics([['tile','village'],'>',['pts',5]])},
 {phase:'hamlet',title:'Holding a tile',text:'A camel marks who holds a tile. Tile value, palaces and palms all score for the holder.',pic:()=>hpics([['camel',null,'Holder'],'>',['pts','+']])},
 {phase:'hamlet',title:'Next to the lake',text:'Palaces and palms on tiles touching the Great Lake score double.',pic:()=>hpics([['tile','lake'],['tile','village','×2']])},
 {phase:'oasis',title:'Palm',text:'A palm scores 3 points for whoever holds the tile. Planting it is required.',pic:()=>hpics([['tile','oasis'],'>',['pts',3]])},
 {phase:'oasis',title:'Holding a tile',text:'A camel marks who holds a tile. Tile value, palaces and palms all score for the holder.',pic:()=>hpics([['camel',null,'Holder'],'>',['pts','+']])},
 {phase:'oasis',title:'Next to the lake',text:'Palaces and palms on tiles touching the Great Lake score double.',pic:()=>hpics([['tile','lake'],['tile','oasis','×2']])},
 {phase:'shrine',title:'Summon a djinn',text:'Pay 2 Sages, or 1 Sage and 1 Mystic, to take a face-up djinn. Spent Sages stop scoring.',pic:()=>hpics([['meeple','elder','×2'],'>',['djinn']])},
 {phase:'shrine',title:'What a djinn gives',text:'Each djinn is worth points and has a power, either always on or used by paying Sages.',pic:()=>hpics([['djinn'],'>',['pts','+'],['chip','Power']])},
 {phase:'shrine',title:'Not worth it?',text:'You may skip. Tap Skip if no djinn is worth the Sages you would spend.',pic:()=>hpics([['pass',null,'Skip']])},
 {phase:'goods',title:'Goods make sets',text:'Different kinds of goods make sets: 1, 3, 7, 13, 21 points for 1 to 5 kinds, and more beyond.',pic:()=>hpics([['goods','gold'],['goods','silk'],['goods','spice'],'>',['pts',7]])},
 {phase:'goods',title:'What it costs',text:'Stall: 3 coins for one of the first 3. Bazaar: 6 coins for two. Exchange: 4 coins for any.',pic:()=>hpics([['tile','small','3'],['tile','large','6'],['tile','exchange','4']])},
 {phase:'goods',title:'Mystic cards',text:'Mystic cards boost Masons and Shadows and pay for djinns. They never join a set.',pic:()=>hpics([['goods','fakir']])},
 {phase:'workshop',title:'Items',text:'Pay 1 Crafter or 2 Mystics to take the top item. Items give points or one-off powers.',pic:()=>hpics([['meeple','artisan','×1'],'>',['icon','🪄',null,'#9a5bd0']])},
 {phase:'workshop',title:'Using items',text:'Tap an item chip to use it. You may use one item each turn.',pic:()=>hpics([['chip','🪄 Item'],'>',['tap']])},
 {phase:'sell',title:'Sell a set',text:'Tap goods of different kinds to sell them as a set. Bigger sets pay more coins.',pic:()=>hpics([['goods','gold'],['goods','silk'],'>',['coin',3]])},
 {phase:'sell',title:'Why sell?',text:'Coins buy turn order and bazaar goods, and each coin is worth one point at the end.',pic:()=>hpics([['coin','+'],'>',['spot','1st']])},
 {phase:'sell',title:'Or keep them',text:'Unsold goods still score as sets at the end. Tap End turn when you are done.',pic:()=>hpics([['goods','gold'],'>',['pts','+']])},
 {phase:'power',title:'Aiming a power',text:'You tapped a power chip. Now tap a glowing tile to choose where it works.',pic:()=>hpics([['chip','✨ Power'],'>',['tile','village','Aim']])},
 {phase:'power',title:'Changed your mind?',text:'Tap the same chip again to cancel without using the power.',pic:()=>hpics([['chip','✨ Power'],'>',['pass',null,'Cancel']])},
 {phase:'power',title:'What it costs',text:'Some powers cost Sages or Mystics. The chip shows the price.',pic:()=>hpics([['meeple','elder','×1'],['goods','fakir','×1']])},
 {phase:'qClaim',title:'Camel',text:'A camel marks the tile as yours. Its value, palaces and palms score for you.',pic:()=>hpics([['camel'],'>',['pts','+']])},
 {phase:'qClaim',title:'Your tent',text:'The tent scores its tile plus 1 for each red tile around it. You have only one.',pic:()=>hpics([['tent'],'>',['tile','village','+red']])},
 {phase:'qItem',title:'Items',text:'Precious items score points at the end. Magic items give a one-off power.',pic:()=>hpics([['icon','💍'],['icon','🪄',null,'#9a5bd0']])},
 {phase:'qItem',title:'Only one',text:'You keep one item and the rest are discarded, so pick what helps you most.',pic:()=>hpics([['icon','🪄',null,'#9a5bd0'],'>',['pass',null,'Others']])},
 {phase:'qDjinn',title:'Djinn cards',text:'Each djinn is worth points and has a power. Read them before you choose.',pic:()=>hpics([['djinn'],'>',['pts','+']])},
 {phase:'qDjinn',title:'Keep one',text:'You keep one of the djinns shown. The rest are discarded.',pic:()=>hpics([['djinn'],'>',['pass',null,'Others']])},
 {phase:'qFlute',title:'The Reed Pipe',text:'It pulls people from neighbouring tiles onto your tile, one at a time, up to five.',pic:()=>hpics([['tile','small'],'>',['meeple','merchant'],['tile','village']])},
 {phase:'qFlute',title:'Stop early',text:'You may stop pulling at any time. Tap the Done button.',pic:()=>hpics([['pass',null,'Done']])},
 {phase:'qKill',title:'The Ember Blade',text:'It removes any 2 people from the board. You do this one person at a time.',pic:()=>hpics([['meeple','assassin','×2']])},
 {phase:'qKill',title:'Empty tiles',text:'You claim any tile this empties with a camel.',pic:()=>hpics([['tile','small','Empty'],'>',['camel']])},
 {phase:'qThief',title:'Cutpurse haul',text:'Your Cutpurse earned a prize. Tap the one you want to take.',pic:()=>hpics([['icon','🦹'],'>',['pts','+']])},
 {phase:'qThief',title:'Read each button',text:'Each button says what you receive. You get only one.',pic:()=>hpics([['chip','Prize'],'>',['tap']])}
];
// ---------------------------------------------------------------- phases
function hlpBusy(){return !G||G.over||UI.modal||GX.open||UI.chz||UI.autoOn||!me()}
// the phase the player is deciding in (null when there is nothing to decide on the board)
function hlpPhase(){try{if(hlpBusy())return null;const hp=me();
  if(G.q)return {claim:'qClaim',item:'qItem',djinn:'qDjinn',flute:'qFlute',kill:'qKill',thief:'qThief'}[G.q.kind]||null;
  if(UI.pendDj||UI.pendItem)return 'power';
  if(G.phase==='bid')return 'bid';
  switch(G.step){
   case 'move':return G.move?'drop':'lift';
   case 'tribe':{const c=G.act.color;if(c==='assassin')return 'shadow';if(c==='builder'&&validMoves(hp.i).filter(m=>m.act==='tribe').length>1)return 'mason';return 'collect'}
   case 'tile':{if(UI.pickMk.length)return 'goods';if(UI.pickDj.length)return 'shrine';const k=G.board[G.act.tile].k;
    if(k==='village')return 'hamlet';if(k==='oasis')return 'oasis';
    if(k==='workshop'&&validMoves(hp.i).some(m=>m.act==='tile'&&m.work))return 'workshop';return null}
   case 'sell':return 'sell'}
  return null}catch(e){return null}}
// ---------------------------------------------------------------- the computer player's advice for the human (the one function the bulb and the ghost finger both use)
const HPL={k:'',m:null,plan:null};
function hlpKey(){return [G.seed,G.logN,G.phase,G.step,G.q?G.q.kind:'',G.move?G.move.path.join('-'):'',G.cur,UI.pendDj?1:0,UI.pendItem?1:0].join('|')}
function hlpAdvice(){if(!G||G.over)return null;const hp=me();if(!hp)return null;const k=hlpKey();if(HPL.k===k)return HPL.m;
  let m=null;const lv=hp.lv,keep=AIPLAN;hp.lv='hard';
  try{
   if(UI.pendDj||UI.pendItem)m=null;
   else if(G.q){if(['claim','item','djinn'].includes(G.q.kind))m=aiMove(hp.i)}
   else if(G.phase==='turn'&&G.step==='move'&&G.move){const pl=HPL.plan;   // follow the plan made at the lift, only while the player is on it
    if(pl&&pl.seed===G.seed&&pl.turn===G.turn&&G.move.path.every((x,i)=>x===pl.o.path[i])){AIPLAN=pl.o;m=aiMove(hp.i)}}
   else{m=aiMove(hp.i);if(G.phase==='turn'&&G.step==='move'&&!G.move&&AIPLAN&&m&&m.act==='start')HPL.plan={o:AIPLAN,seed:G.seed,turn:G.turn}}
  }catch(e){m=null}
  hp.lv=lv;AIPLAN=keep;
  if(m&&!validMoves(hp.i).some(x=>same(x,m)))m=null;
  HPL.k=k;HPL.m=m;return m}
function hlpEl(m){if(!m)return null;const mv=s=>[...document.querySelectorAll('[data-mv]')].find(b=>b.dataset.mv===s)||null;
  if(m.act==='djinn')return [...document.querySelectorAll('[data-pw]')].find(b=>b.dataset.pw===JSON.stringify({k:m.k,pay:m.pay}))||mv(JSON.stringify(m));
  if(m.act==='item'){if(m.k==='flute'||m.k==='talisman')return document.querySelector('[data-pi="'+m.k+'"]');return mv(JSON.stringify(m))}
  if(m.act==='thief')return mv(JSON.stringify(m));
  if(m.act==='tribe'&&m.kill){const k=m.kill;if(k.tile!=null)return tileEl(k.tile);if(k.pl!=null)return document.querySelector('#seats [data-seat="'+k.pl+'"]');return null}
  return fingerEl(m)}
// why (<= 15 words), from what the move really does
function capW(t,n){const w=String(t||'').replace(/\s+/g,' ').trim().split(' ');return w.length<=n?w.join(' '):''}
const HTAIL={vizier:'Advisors score points.',elder:'Sages summon djinns.',merchant:'Goods score as sets.',builder:'Masons earn coins.',assassin:'Shadows remove rivals.',artisan:'Crafters make items.'};
function hlpWhy(m,hp){let t='';
  switch(m.act){
   case 'bid':{const c=G.track[m.spot].cost;t=m.fk?'A Mystic makes this spot cost '+bidPrice(hp,m.spot,m.fk)+' coins.':c?c+' coins buys an earlier turn.':'A free spot keeps your coins for later.';break}
   case 'start':{const o=HPL.plan&&HPL.plan.o;if(o&&o.s===m.tile){const n=o.n;t='Ends on the '+TSHORT[G.board[o.e].k]+', taking '+n+' '+(n>1?MPLUR[o.c]:MNAME[o.c])+'. '+HTAIL[o.c]}break}
   case 'step':t=G.move.hand.length===1?'Last drop: land on its colour to finish.':'This follows the best route to a good finish.';break;
   case 'tribe':{if(m.none){t='No target in range: carry on.';break}const k=m.kill;
     if(k){t=k.pl!=null?'Removes a '+MNAME[k.c]+' from '+P(k.pl).nm+'.':'Clears people off this tile.';break}
     const c=G.act.color;t=c==='builder'?'Masons earn coins from blue tiles.':'Collect your '+MPLUR[c]+'. '+HTAIL[c];break}
   case 'tile':{const a=G.board[G.act.tile];
     if(m.skip)t='Nothing here is worth the price.';
     else if(m.place!=null)t=a.k==='village'?'A palace scores 5 points for the tile’s holder.':'A palm scores 3 points for the tile’s holder.';
     else if(m.dj)t='Summon '+DJ[m.dj].n+': worth '+DJ[m.dj].vp+' points.';
     else if(m.take)t=m.take.length>1?'These two goods grow your sets.':'This good grows your goods sets.';
     else if(m.work)t='Commission an item for a one-off power.';break}
   case 'djinn':t='Use '+DJ[m.k].n+' now while it helps.';break;
   case 'item':t='Use your '+ITEMS[m.k].n+' now.';break;
   case 'thief':t='Use your Cutpurse now.';break;
   case 'end':t=hp.res.length?'Unsold goods still score as sets at the end.':'Nothing to sell: end your turn.';break;
   case 'q':{const q=G.q;if(q.kind==='claim')t=m.i===1?'The tent adds points for each red tile around.':'A camel is enough here.';
     else if(q.kind==='item')t='Keep the item worth most to you.';
     else if(q.kind==='djinn'&&q.cards&&DJ[q.cards[m.i]])t='Keep '+DJ[q.cards[m.i]].n+': worth '+DJ[q.cards[m.i]].vp+' points.';break}}
  return capW(t,15)}
function hlpSuggest(){if(hlpBusy())return null;const hp=me();const m=hlpAdvice();if(!m)return null;
  const why=hlpWhy(m,hp);if(!why||!hlpEl(m))return null;
  return {why,key:JSON.stringify(m),target:()=>hlpEl(m),from:null}}
// ---------------------------------------------------------------- wiring
let _hlpInit=false;
function hlpInit(){if(_hlpInit||typeof GXH==='undefined')return;_hlpInit=true;
  GXH.init({game:'sands-of-qamar',defaultOn:true,steps:HLP_STEPS,rules:HLP_RULES,avoid:'.glow,#acts .ab,#acts .sp-b,#mine .gchip,#finger'});
  GXH.bulb({el:'#bulbbtn',suggest:hlpSuggest,rulesFor:hlpPhase});
  const hm=document.getElementById('gxhmenu');if(hm)hm.innerHTML=GXH.settingsHTML({rowClass:'',btnClass:'btn sm'});
  // a tap that lands on a bubble only dismisses it (the board under it must not act)
  let sw=0;document.addEventListener('pointerdown',e=>{sw=0;const b=document.querySelector('.gxh-bub.on');if(!b||(e.target.closest&&e.target.closest('.gxh-link')))return;const r=b.getBoundingClientRect();if(e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom)sw=Date.now()},true);
  document.addEventListener('click',e=>{if(sw&&Date.now()-sw<800){sw=0;e.stopImmediatePropagation();e.preventDefault()}},true);
  // the ghost finger comes back after a bubble or the bulb is dismissed
  document.addEventListener('pointerup',()=>setTimeout(()=>{if(typeof placeFinger==='function'&&G)placeFinger()},80),true)}
function hlpAfter(){hlpInit();if(typeof GXH==='undefined')return;const ph=hlpPhase();if(ph==='lift')hlpAdvice();   // the plan made at the lift is what the drops follow
  GXH.phase(ph)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',hlpInit);else hlpInit();
