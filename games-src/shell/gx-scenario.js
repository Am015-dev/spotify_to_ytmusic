/* GX scenarios: "spawn the requirement only". Open any game with  ?scn=<id>  and it skips menus / tutorial offers, seeds the RNG,
   builds the exact engine state of ONE scenario directly (no playing through), shows a tiny "Test: <name>" tag and exposes
   window.GXSCN = {id, name, ask, ready, checks}. `ask` is the one line the owner should try ("Tap SMASH over Downtown");
   `checks` are the machine asserts the runner (scripts/scn-run.js + scenarios.spec.js) runs at 390x763, 375x553 and 1366x768.
   ?scn=list  ->  window.GXSLIST = [{id, name, ask, sizes}]  (no setup, used by the runner and the shelf).

   A game registers its scenarios in ONE small file (scn.js) inlined right after this one and BEFORE the game scripts:
     GXS.add({
       id: 'dk-help-label',                         // unique, kebab-case, prefix = game
       name: 'Tutorial: Help button',               // shown in the "Test:" tag
       ask: 'Is the Help button label readable?',   // ONE line for the owner (8 words or fewer is best)
       ls: { dkd_offer: '1' },                      // optional: localStorage seeded for this scenario (a private in-memory store: the player's saves are never touched)
       seed: 7,                                     // optional RNG seed (default: hash of id)
       sizes: 'all' | 'phone' | 'pc',               // optional, default all
       when: () => window.G && window.UI,           // optional: wait until the game has booted (default: page loaded + 300 ms)
       setup() { ...build the state directly... },  // may return a promise
       checks: [ ... ]                              // see below
     });
   Checks (plain data + small functions; they run IN the page):
     {kind:'visible', sel:'.fbtns .helpb', name:'Help button'}     exists, shown, inside the viewport, not covered by another element
     {kind:'text', sel:'.fbtns .helpb', re:/help/i, name:'label'}   visible text matches re, font >= 12 px, not clipped, not transparent
     {kind:'eq', name:'YOU total', a:() => dom number, b:() => engine number}   on-screen number equals the engine's
     {kind:'tap', sel:'.fbtns .smash', name:'SMASH', state:() => any, expect:(before, after) => true|false|'why'}
                                                                  the runner touch-taps the element; the engine state must then change as expected
     {kind:'hold', sel:'#pshop .obc', ms:700, name:'hold a card', state:..., expect:...}   like tap, but the runner presses and holds ms (touch: CDP touchStart..touchEnd; pc: mouse hover); state is read WHILE held
     {kind:'fn', name:'sound played', fn:() => true|false|'why'}   anything else
     {kind:'play', name:'buy a card', snap:() => engine numbers, steps:[{sel:'.card', until:() => done, max:3}, ...], idle:() => settled, verify:(before, after) => true|'why'}
                                                                  a BEHAVIOUR check: the runner taps each step with REAL touches (nothing is forced), waits (<= 8 s) until idle() is
                                                                  true, then verify(before, after) asserts the OUTCOME in the engine. step = {sel: css|() => Element, ready?: () => bool,
                                                                  skip?: () => bool, until?: () => bool (tap again, up to max times, until true), after?: ms}
   A scenario may add  mut:[{name:'cost +1', js:'canBuy = ...'}]  (JS run in the page after setup that breaks the feature on purpose: scripts/scenario-mutate.js
   runs every scenario with it and the scenario MUST then fail, or the scenario does not count) and  fp:() => engine fingerprint  (glow-response check).
   Invariants added to EVERY scenario (no per-game code): no console/page error, no failed same-origin request, no text under 11 px / clipped / overlapping,
   no covered button, no horizontal scroll, every element marked  data-engine="G.pl.0.en"  shows the engine value, every glowing legal target
   (GXS.glowSel, default .bf-tgt,.glow,[data-legal]) responds to a real tap.
   Universal asserts the runner adds to every scenario: no page error, no horizontal scroll, the Test tag shows, the board/game fills the screen. */
(function () {
  var q = new URLSearchParams(location.search), id = q.get('scn');
  var S = window.GXS = { defs: [], on: !!id, id: id };
  try { S.realLS = window.localStorage; } catch (e) { }   // the player's real storage (a scenario swaps window.localStorage for a private one): the LAB (gx-lab.js) keeps its results here
  S.add = function (d) { S.defs.push(d); };
  S.known = [];   // known findings a game lists on purpose: {re: /message/, why: 'owner-listed in HANDOFF.md'}; they are not hidden, scenario-test prints how many were skipped
  S.glowSel = '.bf-tgt,.glow,[data-legal]';
  /* group of a scenario for the LAB menu: d.group, else guessed from id / name (Board, Cards, Story, Bosses, UI) */
  S.group = function (d) { if (d.group) return d.group; var t = (d.id + ' ' + d.name).toLowerCase();
    return /boss/.test(t) ? 'Bosses' : /story|chapter|campaign|scene|cutscene/.test(t) ? 'Story' : /zoom|card|hand|market|deck|piece|token/.test(t) ? 'Cards' : /board|start|map|table|tile|grid|island|city|dungeon/.test(t) ? 'Board' : 'UI'; };
  S.pub = function (d) { return { id: d.id, name: d.name, ask: d.ask || '', sizes: d.sizes || 'all', group: S.group(d), mut: (d.mut || []).length }; };
  if (!id) return;   // normal play: the module is inert (one small object)

  /* ---- seeded RNG (mulberry32) ---- */
  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function seedRng(n) { var a = n >>> 0; Math.random = function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  S.seed = function (n) { seedRng(n); };
  seedRng(hash(id));   // until the scenario's own seed is known, the run is already deterministic

  /* ---- private storage: a scenario never reads or writes the player's saves ---- */
  var mem = {}, store = { getItem: function (k) { return Object.prototype.hasOwnProperty.call(mem, k) ? mem[k] : null; }, setItem: function (k, v) { mem[k] = String(v); }, removeItem: function (k) { delete mem[k]; }, clear: function () { mem = {}; }, key: function (i) { return Object.keys(mem)[i] || null; } };
  Object.defineProperty(store, 'length', { get: function () { return Object.keys(mem).length; } });
  try { Object.defineProperty(window, 'localStorage', { configurable: true, get: function () { return store; } }); } catch (e) { }
  S.store = store;
  /* registration happens before the game scripts run, so the scenario's storage + seed are in place for the game's own boot */
  S.add = function (d) { S.defs.push(d); if (d.id === id) { var ls = d.ls || {}; for (var k in ls) mem[k] = String(ls[k]); if (d.seed != null) seedRng(d.seed >>> 0); } };

  /* ---- helpers for scenario files ---- */
  S.vis = function (e) { if (!e) return false; var r = e.getBoundingClientRect(), s = getComputedStyle(e); return r.width > 3 && r.height > 3 && s.visibility !== 'hidden' && s.display !== 'none' && +s.opacity > .05 && !e.closest('[hidden]'); };
  S.num = function (sel) { var e = document.querySelector(sel); return e ? +String(e.textContent).replace(/[^0-9.\-]/g, '') : NaN; };
  S.wait = function (fn, ms) { return new Promise(function (res, rej) { var t0 = Date.now(); (function p() { var v; try { v = fn(); } catch (e) { } if (v) return res(v); if (Date.now() - t0 > (ms || 15000)) return rej(new Error('GXS.wait timed out: ' + String(fn).slice(0, 80))); setTimeout(p, 50); })(); }); };
  S.click = function (sel) { var e = typeof sel === 'string' ? document.querySelector(sel) : sel; if (e) e.click(); return !!e; };
  S.spy = function (obj, name) { var c = { n: 0, args: [] }, f = obj[name]; obj[name] = function () { c.n++; c.args.push([].slice.call(arguments).slice(0, 3)); return f && f.apply(this, arguments); }; return c; };

  /* ---- shared "menu" scenario (?scn=menu): opens every menu surface of ANY game and checks it with machines ----
     Surfaces: the title/start screen as booted, every top-bar button whose id/label says menu/settings/rules/help/options/about/how, the campaign screen (GXC.open), plus any a game adds
     with  GXS.menuSurfaces.push({name, open(), close()}).  Per surface: no text boxes overlapping, no text clipped, text >= 13 px, no covered button, every font actually loaded and one of the two shelf faces,
     tap targets (axe, run by scenarios.spec.js through GXS.menuOpen(i)). Report: GXS.menuReport = {surface: [problem, ...]}. */
  S.menuSurfaces = S.menuSurfaces || [];
  S.MENU_FONTS = ['Cinzel', 'Alegreya Sans'];   // the shelf's self-hosted title face and body face (shell/fonts, injected by build-all.py)
  var MENU_MIN = 13, MENU_OPEN = /menu|setting|rules|help|option|about|how|info|pause|guide/i, MENU_SKIP = /bulb|hint|undo|dock|log|opp|mute|sound|music|zoom|full/i;
  function menuTop() { return [].slice.call(document.querySelectorAll('button,[role=button]')).filter(function (b) { var t = (b.id + ' ' + b.className + ' ' + (b.getAttribute('aria-label') || '') + ' ' + (b.dataset && b.dataset.gx || '')); return MENU_OPEN.test(t) && !MENU_SKIP.test(t) && !/gxt-menu|story|learn|primary|bigb/.test(b.className) && S.vis(b) && !b.closest('[hidden]') && b.getBoundingClientRect().top < 80; }); }
  function menuClose() { try { if (typeof GX !== 'undefined' && GX.close) GX.close(); } catch (e) { } [].slice.call(document.querySelectorAll('.gx-x,[data-gx-close],.gxc-x')).forEach(function (b) { if (S.vis(b)) b.click(); }); document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); }
  function unq(f) { return String(f).trim().replace(/^["']|["']$/g, ''); }
  function famOk(cs, e) {   // the face the browser really uses: the first listed family must be a shelf face, declared by an @font-face in document.fonts, and loaded (document.fonts.check() is true when nothing is declared, so it proves nothing)
    var first = unq(cs.fontFamily.split(',')[0]);
    if (S.MENU_FONTS.indexOf(first) < 0) return 'font "' + first + '" is not a shelf face (' + S.MENU_FONTS.join(' / ') + ')';
    var mine = []; try { document.fonts.forEach(function (f) { if (unq(f.family) === first) mine.push(f); }); } catch (x) { }
    if (!mine.length) return 'font "' + first + '" has no @font-face (falls back to a system font)';
    if (!mine.some(function (f) { return f.status === 'loaded'; })) return 'font "' + first + '" declared but ' + mine[0].status;
    return '';
  }
  S.menuAudit = function () {   // problems on the CURRENT screen
    var out = [], seen = {}; function add(m) { if (!seen[m] && out.length < 60) { seen[m] = 1; out.push(m); } }
    S.audit().forEach(function (m) { if (!/^text under 11px/.test(m)) add(m); });   // overlap / clipped / covered button / engine
    [].slice.call(document.querySelectorAll('body *')).forEach(function (e) {
      if (/^(SCRIPT|STYLE|NOSCRIPT|OPTION|SVG|PATH)$/i.test(e.tagName) || e.closest(SKIPSEL) || !ownText(e) || !S.vis(e)) return;
      var r = e.getBoundingClientRect(); if (r.right <= 0 || r.bottom <= 0 || r.left >= innerWidth || r.top >= innerHeight) return;
      var cs = getComputedStyle(e), fsz = parseFloat(cs.fontSize), t = ownText(e).slice(0, 22); if (fsz < 1) return;
      if (fsz < MENU_MIN) add('text under ' + MENU_MIN + 'px: "' + t + '" (' + Math.round(fsz * 10) / 10 + 'px) <' + who(e) + '>');
      if (e.scrollWidth > e.clientWidth + 2 && /(hidden|clip)/.test(cs.overflowX) && e.clientWidth > 0) add('text clipped (scrollWidth ' + e.scrollWidth + ' > ' + e.clientWidth + '): "' + t + '" <' + who(e) + '>');
      var f = famOk(cs, e); if (f) add(f + ': "' + t + '" <' + who(e) + '>');
      var tr = S.menuTopmost && firstLine(e); if (tr && tr.width >= 2 && tr.left >= 0 && tr.right <= innerWidth && tr.top >= 0 && tr.bottom <= innerHeight) { var top = document.elementFromPoint(tr.left + tr.width / 2, tr.top + tr.height / 2); if (top && !related(top, e) && !/^(HTML|BODY)$/.test(top.tagName) && S.vis(top)) add('text not topmost: "' + t + '" <' + who(e) + '> is under <' + who(top) + '>'); }
    });
    return out;
  };
  function firstLine(e) {   // box of the first line of the element's own text (the centre of a multi-line union often lies on a neighbour)
    for (var i = 0; i < e.childNodes.length; i++) { var n = e.childNodes[i]; if (n.nodeType === 3 && /\S/.test(n.textContent)) { var r = document.createRange(); r.selectNodeContents(n); var q = r.getClientRects()[0]; if (q) return q; } }
    return null;
  }
  function menuScrollers() { return [].slice.call(document.querySelectorAll('body *')).filter(function (e) { var cs = getComputedStyle(e); return /(auto|scroll)/.test(cs.overflowY) && e.scrollHeight > e.clientHeight + 24 && e.clientHeight > 60 && S.vis(e); }); }
  S.menuAuditAll = function () {   // async: the screen as shown, then every scrollable panel scrolled page by page (content below the fold), then back to the top
    var out = S.menuAudit(), sc = menuScrollers(), chain = Promise.resolve();
    sc.slice(0, 4).forEach(function (el) { var steps = Math.min(8, Math.ceil(el.scrollHeight / Math.max(60, el.clientHeight - 40))); for (var k = 1; k < steps; k++) (function (k) { chain = chain.then(function () { el.scrollTop = k * Math.max(60, el.clientHeight - 40); return new Promise(function (r) { setTimeout(r, 120); }); }).then(function () { S.menuAudit().forEach(function (m) { if (out.indexOf(m) < 0 && out.length < 90) out.push(m); }); }); })(k); chain = chain.then(function () { el.scrollTop = 0; }); });
    return chain.then(function () { return out; });
  };
  S.menuList = function () {
    var l = [{ name: 'title', open: function () { menuClose(); }, close: function () { } }];
    menuTop().forEach(function (b, i) { var nm = 'panel ' + (b.id || b.getAttribute('aria-label') || (b.dataset && b.dataset.gx) || b.className.toString().split(' ').pop() || i); l.push({ name: nm, open: function () { b.click(); }, close: menuClose }); });
    if (window.GXC && GXC.open) l.push({ name: 'campaign', open: function () { GXC.open(); }, close: function () { try { GXC.close(); } catch (e) { } menuClose(); } });
    return l.concat(S.menuSurfaces);
  };
  S.menuOpen = function (i) { var l = S.menuList(), cur = S._menuCur; if (cur) try { cur.close(); } catch (e) { } menuClose(); S._menuCur = l[i]; if (!l[i]) return null; try { l[i].open(); } catch (e) { return 'open threw ' + e.message; } return l[i].name; };
  S.menuTopmost = false;   // text-not-topmost check: set GXS.menuTopmost = true to try it; unvalidated (flags ~every title screen, see HANDOFF Fast gate v2)
  S.menuReport = {};
  function menuPass() {   // async: walk every surface once, record problems, end on the title
    var l = S.menuList(), chain = Promise.resolve(), seenMsg = {};
    try { document.fonts.forEach(function (f) { f.load(); }); } catch (e) { }   // every declared face must be fetchable: wait for them all before judging
    chain = chain.then(function () { return document.fonts && document.fonts.ready; }).catch(function () { });
    l.forEach(function (sf, i) { chain = chain.then(function () { var nm = S.menuOpen(i); return new Promise(function (r) { setTimeout(r, 700); }).then(function () { return S.menuAuditAll().then(function (ms) { S.menuReport[sf.name] = ms.filter(function (m) { if (seenMsg[m]) return false; seenMsg[m] = 1; return true; }); }); }); }); });
    return chain.then(function () { S.menuOpen(0); S.menuN = l.length; return new Promise(function (r) { setTimeout(r, 400); }); });
  }
  function menuCheck(rx, name) { return { kind: 'fn', name: name, fn: function () { var bad = []; Object.keys(S.menuReport).forEach(function (k) { S.menuReport[k].filter(function (m) { return rx.test(m); }).forEach(function (m) { bad.push('[' + k + '] ' + m); }); }); return bad.length ? 'N=' + bad.length + ' ' + bad.slice(0, 14).join(' | ') : true; } }; }
  S.defs.push({
    id: 'menu', name: 'Menus: clean and readable', ask: 'Is every menu clean and readable?', group: 'UI',
    setup: function () { return menuPass(); },
    checks: [
      { kind: 'fn', name: 'menu surfaces opened', fn: function () { return S.menuN >= 1 || 'no surface'; } },
      menuCheck(/^text overlaps/, 'no two text boxes overlap'),
      menuCheck(/^text clipped/, 'no text clipped'),
      menuCheck(/^font "/, 'every font a loaded shelf face'),
      menuCheck(/^text not topmost/, 'no text covered at its centre'),
      menuCheck(/^text under/, 'text at least ' + MENU_MIN + ' px'),
      menuCheck(/^button covered/, 'no covered button')
    ]
  });

  /* ---- list mode (no setup) ---- */
  function def() { return S.defs.filter(function (d) { return d.id === id; })[0]; }
  var pub = S.pub;
  function onload(fn) { if (document.readyState === 'complete') setTimeout(fn, 0); else addEventListener('load', function () { setTimeout(fn, 0); }); }
  if (id === 'list') { onload(function () { window.GXSLIST = S.defs.map(pub); window.GXSCN = { id: 'list', ready: true }; }); return; }

  /* ---- the "Test:" tag ---- */
  function tag(d) {
    var e = document.createElement('div'); e.id = 'gxscn-tag'; e.textContent = 'Test: ' + d.name;
    e.style.cssText = 'position:fixed;left:4px;bottom:2px;z-index:2147483000;font:600 10px/1.2 system-ui,sans-serif;color:#fff;background:rgba(20,20,30,.62);padding:1px 6px;border-radius:8px;pointer-events:none;max-width:70vw;white-space:nowrap;overflow:hidden;text-overflow:ellipsis';
    document.body.appendChild(e);
  }

  /* ---- check engine (runs in the page; the runner drives the taps) ---- */
  var saved = {};
  function box(e) { var r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, r: r }; }
  function onScreen(e) { var b = box(e), W = innerWidth, H = innerHeight; if (b.r.right <= 0 || b.r.bottom <= 0 || b.r.left >= W || b.r.top >= H) return 'outside the screen'; if (b.r.left < -2 || b.r.top < -2 || b.r.right > W + 2 || b.r.bottom > H + 2) { if (!(function () { for (var p = e.parentElement; p; p = p.parentElement) { var o = getComputedStyle(p); if (/(auto|scroll)/.test(o.overflowX + o.overflowY) && p.scrollWidth + p.scrollHeight > p.clientWidth + p.clientHeight) return true; } return false; })()) return 'partly off screen (' + Math.round(b.r.left) + ',' + Math.round(b.r.top) + ',' + Math.round(b.r.right) + ',' + Math.round(b.r.bottom) + ' in ' + W + 'x' + H + ')'; }
    if (getComputedStyle(e).pointerEvents === 'none' || (e.closest && e.closest('[style*="pointer-events:none"],[style*="pointer-events: none"]'))) return '';   // display-only overlays (score lines) cannot be hit-tested
    var cx = Math.max(1, Math.min(W - 1, b.x)), cy = Math.max(1, Math.min(H - 1, b.y)), t = document.elementFromPoint(cx, cy);
    if (t && t !== e && !e.contains(t) && !t.contains(e) && t.id !== 'gxscn-tag' && !(t.closest && t.closest('#gxlab-bar'))) return 'covered by ' + (t.id ? '#' + t.id : t.tagName.toLowerCase() + '.' + String(t.className && t.className.baseVal === undefined ? t.className : '').split(' ')[0]);
    return ''; }
  function find(c) { var e = document.querySelector(c.sel); if (!e) return { err: 'not found: ' + c.sel }; if (!S.vis(e)) return { err: 'not visible: ' + c.sel }; return { e: e }; }
  S.step = function (i) {
    var d = def(), c = d.checks[i], nm = c.name || c.sel || c.kind, f;
    try {
      if (c.kind === 'visible') { f = find(c); if (f.err) return { ok: false, msg: nm + ' ' + f.err }; var w = onScreen(f.e); return w ? { ok: false, msg: nm + ' ' + w } : { ok: true }; }
      if (c.kind === 'text') { f = find(c); if (f.err) return { ok: false, msg: nm + ' ' + f.err }; var e = f.e, t = (e.innerText || e.textContent || '').trim(), cs = getComputedStyle(e), why = '';
        if (c.re && !c.re.test(t)) why = 'text "' + t.slice(0, 30) + '" does not match ' + c.re; else if (!t && !e.querySelector('svg,img')) why = 'blank (no text, no icon)';
        else if (parseFloat(cs.fontSize) < (c.minPx || 12)) why = 'font ' + cs.fontSize + ' under ' + (c.minPx || 12) + 'px';
        else if (/rgba\(\d+, \d+, \d+, 0\)|transparent/.test(cs.color) || +cs.opacity < .3) why = 'text transparent';
        else if (e.scrollWidth > e.clientWidth + 2 && cs.overflow !== 'visible') why = 'label clipped (' + e.scrollWidth + '>' + e.clientWidth + ')';
        else { var w2 = onScreen(e); if (w2) why = w2; }
        return why ? { ok: false, msg: nm + ': ' + why } : { ok: true }; }
      if (c.kind === 'eq') { var A = c.a(), B = c.b(); return A === B ? { ok: true } : { ok: false, msg: nm + ': screen ' + A + ' != engine ' + B }; }
      if (c.kind === 'play') { saved[i] = c.snap ? c.snap() : null; return { ok: true, play: { n: c.steps.length } }; }
      if (c.kind === 'fn') { var r = c.fn(); return r === true ? { ok: true } : { ok: false, msg: nm + (typeof r === 'string' ? ': ' + r : ' failed') }; }
      if (c.kind === 'tap' || c.kind === 'hold') { f = find(c); if (f.err) return { ok: false, msg: nm + ' ' + f.err }; var w3 = onScreen(f.e); if (w3) return { ok: false, msg: nm + ' ' + w3 };
        saved[i] = c.state ? c.state() : null; var b = box(f.e); return c.kind === 'hold' ? { ok: true, hold: { x: b.x, y: b.y, ms: c.ms || 700 } } : { ok: true, tap: { x: b.x, y: b.y } }; }
      return { ok: false, msg: 'unknown check kind ' + c.kind };
    } catch (x) { return { ok: false, msg: nm + ' threw ' + String(x.message).slice(0, 100) }; }
  };
  S.after = function (i) {
    var c = def().checks[i], nm = c.name || c.sel;
    try { var now = c.state ? c.state() : null, r = c.expect ? c.expect(saved[i], now) : (JSON.stringify(saved[i]) !== JSON.stringify(now));
      return r === true ? { ok: true } : { ok: false, msg: nm + ': tap did not ' + (typeof r === 'string' ? r : 'change the game as expected') + ' (' + JSON.stringify(saved[i]).slice(0, 60) + ' -> ' + JSON.stringify(now).slice(0, 60) + ')' };
    } catch (x) { return { ok: false, msg: nm + ' threw ' + String(x.message).slice(0, 100) }; }
  };
  /* ---- play: real taps, then the outcome in the engine ---- */
  function stepEl(st) { return typeof st.sel === 'function' ? st.sel() : document.querySelector(st.sel); }
  S.pstep = function (i, j) {   // async: wait until the step's element is tappable, then say where to tap
    var c = def().checks[i], st = c.steps[j], nm = st.name || (typeof st.sel === 'string' ? st.sel : 'step ' + (j + 1));
    try { if (st.skip && st.skip()) return Promise.resolve({ skip: true }); if (st.until && st.until()) return Promise.resolve({ skip: true }); } catch (x) { return Promise.resolve({ err: nm + ' threw ' + x.message }); }
    var why = '';
    return S.wait(function () { var e = stepEl(st); if (!e) { why = 'not found'; return false; } if (!S.vis(e)) { why = 'not visible'; return false; } var w = onScreen(e); if (w) { why = w; return false; } if (st.ready && !st.ready()) { why = 'not ready'; return false; } return true; }, st.ms || 8000)
      .then(function () { var b = box(stepEl(st)); return { x: b.x, y: b.y, until: !!st.until, max: st.max || 1, after: st.after || 450 }; }, function () { return { err: nm + ': ' + why + ' (cannot tap it)' }; });
  };
  S.puntil = function (i, j) { try { return !!def().checks[i].steps[j].until(); } catch (x) { return true; } };
  S.pidle = function (i) {   // the turn must complete: "stuck" = no engine/screen change for 8 s (a long computer turn that keeps moving is fine, hard cap 60 s)
    var c = def().checks[i]; if (!c.idle) return Promise.resolve({ ok: true });
    var quiet = c.settleMs || 8000;
    return new Promise(function (res) { var t0 = Date.now(), last = Date.now(), fp = S.fp();
      (function p() { var v = false; try { v = c.idle(); } catch (e) { } if (v) return res({ ok: true });
        if (c.assist) { var ae = null; try { ae = c.assist(); } catch (e) { } if (ae && S.vis(ae) && !onScreen(ae)) { var ab = box(ae); return res({ assist: { x: ab.x, y: ab.y } }); } }   // a question for the player (stay or yield?): the runner answers it with a real tap
        var f = S.fp(); if (f !== fp) { fp = f; last = Date.now(); }
        if (Date.now() - last > quiet || Date.now() - t0 > 60000) return res({ ok: false, msg: (c.name || 'play') + ': stuck, nothing changed for ' + Math.round((Date.now() - last) / 1000) + ' s and  ' + String(c.idle).replace(/\s+/g, ' ').slice(0, 80) + '  never became true' + (c.diag ? ' [' + (function () { try { return c.diag(); } catch (e) { return 'diag threw'; } })() + ']' : '') });
        setTimeout(p, 100); })(); });
  };
  S.pend = function (i) {
    var c = def().checks[i], nm = c.name || 'play';
    try { var r = c.verify(saved[i], c.snap ? c.snap() : null); return r === true ? { ok: true } : { ok: false, msg: nm + ': ' + (typeof r === 'string' ? r : 'wrong outcome') + ' (' + JSON.stringify(saved[i]).slice(0, 70) + ' -> ' + JSON.stringify(c.snap ? c.snap() : null).slice(0, 70) + ')' }; }
    catch (x) { return { ok: false, msg: nm + ' threw ' + String(x.message).slice(0, 100) }; }
  };

  /* ---- invariants for EVERY scenario ---- */
  var SKIPSEL = '#gxscn-tag,#gxlab-bar,[data-gx-skip]';
  function ownText(e) { var t = ''; for (var n = e.firstChild; n; n = n.nextSibling) if (n.nodeType === 3) t += n.nodeValue; return t.trim(); }
  function textRect(e) {   // union of the element's OWN text nodes (an inline icon child must not inflate the box)
    var L = 1e9, T = 1e9, R = -1e9, B = -1e9, r = document.createRange();
    for (var n = e.firstChild; n; n = n.nextSibling) if (n.nodeType === 3 && n.nodeValue.trim()) { r.selectNodeContents(n); var q = r.getBoundingClientRect(); if (q.width > 0) { L = Math.min(L, q.left); T = Math.min(T, q.top); R = Math.max(R, q.right); B = Math.max(B, q.bottom); } }
    return { left: L, top: T, right: R, bottom: B, width: R - L, height: B - T }; }
  function related(a, b) { return a === b || a.contains(b) || b.contains(a); }
  function scrim(t) { for (var x = t; x && x !== document.body; x = x.parentElement) { var r = x.getBoundingClientRect(); if (r.width * r.height >= .6 * innerWidth * innerHeight && (x === t || getComputedStyle(x).position === 'fixed')) return true; } return false; }   // a modal / story layer on top legitimately covers what is below
  function coveredBy(e) { var b = box(e), r = b.r; if (r.right <= 0 || r.bottom <= 0 || r.left >= innerWidth || r.top >= innerHeight) return ''; if (getComputedStyle(e).pointerEvents === 'none') return '';
    var t = document.elementFromPoint(Math.max(1, Math.min(innerWidth - 1, b.x)), Math.max(1, Math.min(innerHeight - 1, b.y)));
    if (!t || related(t, e) || t.closest(SKIPSEL) || scrim(t) || getComputedStyle(t).pointerEvents === 'none') return ''; return t.id ? '#' + t.id : t.tagName.toLowerCase() + '.' + String(t.className && t.className.baseVal === undefined ? t.className : '').split(' ')[0]; }
  function who(e) { var c = e.className && e.className.baseVal === undefined ? String(e.className).trim().split(/\s+/).slice(0, 2).join('.') : ''; return e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (c ? '.' + c : ''); }
  function engineBad() {   // every element marked data-engine="<js expression>" must show that engine number
    var out = [];
    [].slice.call(document.querySelectorAll('[data-engine]')).forEach(function (e) { if (!S.vis(e)) return; var v; try { v = (0, eval)(e.getAttribute('data-engine')); } catch (x) { out.push('data-engine "' + e.getAttribute('data-engine') + '" threw ' + x.message); return; }
      var shown = +String(e.textContent).replace(/[^0-9.\-]/g, ''); if (typeof v === 'number' && shown !== v) out.push('on screen ' + shown + ' != engine ' + v + ' (' + e.getAttribute('data-engine') + ')'); });
    return out; }
  S.audit = function () {
    var out = [], seen = {}; function add(m) { if (!seen[m] && out.length < 8) { seen[m] = 1; out.push(m); } }
    var els = [].slice.call(document.querySelectorAll('body *')).filter(function (e) { return !/^(SCRIPT|STYLE|NOSCRIPT|OPTION)$/.test(e.tagName) && !e.closest(SKIPSEL) && ownText(e) && S.vis(e); }), rects = [];
    els.forEach(function (e) {
      var cs = getComputedStyle(e), t = ownText(e).slice(0, 22), r = e.getBoundingClientRect(); if (r.right <= 0 || r.bottom <= 0 || r.left >= innerWidth || r.top >= innerHeight) return;
      var fsz = parseFloat(cs.fontSize);   // 0 px = the text is replaced by a painted icon on purpose
      if (fsz >= 1 && fsz < 11) add('text under 11px: "' + t + '" (' + Math.round(fsz * 10) / 10 + 'px) <' + who(e) + '>');
      var tr = textRect(e); if (tr.width < 2) return;
      for (var p = e; p && p !== document.body; p = p.parentElement) { var o = getComputedStyle(p); if (o.overflowX === 'visible' && o.overflowY === 'visible') continue; if (/(auto|scroll)/.test(o.overflowX + o.overflowY)) break; var pr = p.getBoundingClientRect(); if (pr.width > 0 && (tr.left < pr.left - 2 || tr.right > pr.right + 2 || tr.top < pr.top - 2 || tr.bottom > pr.bottom + 2)) { add('text clipped: "' + t + '" <' + who(e) + ' in ' + who(p) + ' ' + Math.round(tr.left - pr.left) + ',' + Math.round(tr.top - pr.top) + ',' + Math.round(pr.right - tr.right) + ',' + Math.round(pr.bottom - tr.bottom) + '>'); break; } }
      var top = document.elementFromPoint(Math.max(1, Math.min(innerWidth - 1, tr.left + tr.width / 2)), Math.max(1, Math.min(innerHeight - 1, tr.top + tr.height / 2)));
      if (top && related(top, e)) rects.push({ t: t, r: tr, e: e });
    });
    for (var a = 0; a < rects.length; a++) for (var b = a + 1; b < rects.length; b++) { var A = rects[a], B = rects[b]; if (related(A.e, B.e)) continue;
      var w = Math.min(A.r.right, B.r.right) - Math.max(A.r.left, B.r.left), h = Math.min(A.r.bottom, B.r.bottom) - Math.max(A.r.top, B.r.top);
      if (w > 2 && h > 2 && w * h > .3 * Math.min(A.r.width * A.r.height, B.r.width * B.r.height)) add('text overlaps: "' + A.t + '" <' + who(A.e) + '> / "' + B.t + '" <' + who(B.e) + '>'); }
    [].slice.call(document.querySelectorAll('button,[role=button],a[href],[data-act],[data-mv],.btn')).forEach(function (e) { if (e.closest(SKIPSEL) || !S.vis(e)) return; var w = coveredBy(e); if (w) add('button covered by ' + w + ': <' + who(e) + '>'); });
    engineBad().forEach(add);
    return out;
  };
  S.fp = function () { var d = def(); try { if (d && d.fp) return JSON.stringify(d.fp()); } catch (e) { } var g = ''; try { g = JSON.stringify(window.G || (0, eval)('G')); } catch (e) { } return g.length + ':' + g.slice(0, 4000) + '|' + document.body.innerHTML.length; };
  S.glow = function () { return [].slice.call(document.querySelectorAll(S.glowSel)).filter(function (e) { return S.vis(e) && !onScreen(e) && !e.closest(SKIPSEL); }).map(function (e) { var b = box(e); return { x: b.x, y: b.y, n: (e.dataset && (e.dataset.bfz || e.dataset.act || e.id)) || e.className.toString().slice(0, 20) }; }); };

  /* ---- mutation hooks (scripts/scenario-mutate.js): break the feature on purpose ---- */
  S.mutateNamed = function (name) { var m = (def().mut || []).filter(function (x) { return x.name === name; })[0]; if (!m) return false; (0, eval)(m.js); return true; };
  S.mutate = function (m) {
    var ev = ['click', 'pointerdown', 'pointerup', 'mousedown', 'mouseup', 'touchstart', 'touchend'];
    function hit(e) { try { return m.sel && e.target && e.target.closest && e.target.closest(m.sel); } catch (x) { return false; } }
    if (m.t === 'dead' || m.t === 'throw') ev.forEach(function (n) { addEventListener(n, function (e) { if (!hit(e)) return; e.stopImmediatePropagation(); e.preventDefault(); if (m.t === 'throw' && n === 'click') throw new Error('mutant: handler throws'); }, true); });
    else if (m.t === 'cover') { var tg = document.querySelector(m.sel); if (tg) { var q = tg.getBoundingClientRect(), o = document.createElement('div'); o.setAttribute('data-mutant', 'cover'); o.style.cssText = 'position:fixed;z-index:2147482000;background:rgba(255,0,0,.9);left:' + (q.left + q.width * .15) + 'px;top:' + (q.top + q.height * .15) + 'px;width:' + q.width * .7 + 'px;height:' + q.height * .7 + 'px'; document.body.appendChild(o); } }
    else if (m.t === 'hide' || m.t === 'font') { var st = document.createElement('style'); st.textContent = m.t === 'hide' ? m.sel + '{display:none!important}' : m.sel + ',' + m.sel + ' *{font-size:8px!important}'; document.head.appendChild(st); }
    else if (m.t === 'num') setInterval(function () { [].slice.call(document.querySelectorAll(m.sel)).forEach(function (e) { var t = e.textContent; if (/\d/.test(t) && e.__fake !== t) { e.textContent = t.replace(/\d+/, function (d) { return +d + 1; }); e.__fake = e.textContent; } }); }, 40);   // shows every number one too high (once per update)
    else if (m.t === 'js') (0, eval)(m.js);
  };

  S.universal = function (inv) {   // async: numbers that animate (a tally counting up) get 5 s to land before they are compared with the engine
    return (inv === false ? Promise.resolve() : S.wait(function () { return !engineBad().length; }, 5000).catch(function () { })).then(function () { return universalNow(inv); });
  };
  function universalNow(inv) {
    var out = [], de = document.documentElement;
    if (Math.max(de.scrollWidth, document.body.scrollWidth) > innerWidth + 1) out.push('horizontal scroll ' + de.scrollWidth + '>' + innerWidth);
    var t = document.getElementById('gxscn-tag'); if (!t || !t.textContent) out.push('Test tag missing');
    if (inv !== false) try { S.audit().forEach(function (m) { if (S.known.some(function (k) { return k.re.test(m); })) S.skipped = (S.skipped || 0) + 1; else out.push(m); }); } catch (x) { out.push('audit threw ' + x.message); }
    return out;
  }

  /* ---- boot: wait for the game, seed, run setup, publish ---- */
  onload(function () {
    var d = def();
    if (!d) { window.GXSCN = { id: id, ready: true, error: 'unknown scenario ' + id + ' (have: ' + S.defs.map(function (x) { return x.id; }).join(', ') + ')' }; return; }
    tag(d);
    S.wait(d.when || function () { return true; }, 20000).then(function () {
      if (d.seed != null) seedRng(d.seed >>> 0);
      return new Promise(function (r) { setTimeout(r, 300); });
    }).then(function () { return d.setup && d.setup(); }).then(function () {
      var pubD = pub(d); pubD.checks = d.checks.map(function (c) { return { kind: c.kind, name: c.name || c.sel || c.kind, sel: c.sel, sels: (c.steps || []).map(function (x) { return typeof x.sel === 'string' ? x.sel : null; }).filter(Boolean), eqsel: c.sel || c.dom || null }; });
      window.GXSCN = { id: d.id, name: d.name, ask: d.ask || '', sizes: d.sizes || 'all', checks: pubD.checks, mut: (d.mut || []).map(function (m) { return m.name; }), engine: [].filter.call(document.querySelectorAll('[data-engine]'), S.vis).length, glowN: S.glow().length, glowSel: S.glowSel, ready: true };
      try { if (parent !== window) parent.postMessage({ type: 'gxscn', id: d.id, name: d.name, ask: d.ask || '' }, '*'); } catch (e) { }
    }).catch(function (e) { window.GXSCN = { id: d.id, name: d.name, ask: d.ask || '', ready: true, error: 'setup failed: ' + String(e && e.message || e).slice(0, 160), checks: [] }; });
  });
})();
