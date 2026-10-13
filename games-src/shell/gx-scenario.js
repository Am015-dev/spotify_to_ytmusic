/* GX scenarios: "spawn the requirement only". Open any game with  ?scn=<id>  and it skips menus / tutorial offers, seeds the RNG,
   builds the exact engine state of ONE scenario directly (no playing through), shows a tiny "Test: <name>" tag and exposes
   window.GXSCN = {id, name, ask, ready, checks}. `ask` is the one line the owner should try ("Tap SMASH over Downtown");
   `checks` are the machine asserts the runner (scripts/scenario-test.js) runs at 390x763, 375x553 and 1366x768.
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
   Universal asserts the runner adds to every scenario: no page error, no horizontal scroll, the Test tag shows, the board/game fills the screen. */
(function () {
  var q = new URLSearchParams(location.search), id = q.get('scn');
  var S = window.GXS = { defs: [], on: !!id, id: id };
  S.add = function (d) { S.defs.push(d); };
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

  /* ---- list mode (no setup) ---- */
  function def() { return S.defs.filter(function (d) { return d.id === id; })[0]; }
  function pub(d) { return { id: d.id, name: d.name, ask: d.ask || '', sizes: d.sizes || 'all' }; }
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
    if (t && t !== e && !e.contains(t) && !t.contains(e) && t.id !== 'gxscn-tag') return 'covered by ' + (t.id ? '#' + t.id : t.tagName.toLowerCase() + '.' + String(t.className && t.className.baseVal === undefined ? t.className : '').split(' ')[0]);
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
  S.universal = function () {
    var out = [], de = document.documentElement;
    if (Math.max(de.scrollWidth, document.body.scrollWidth) > innerWidth + 1) out.push('horizontal scroll ' + de.scrollWidth + '>' + innerWidth);
    var t = document.getElementById('gxscn-tag'); if (!t || !t.textContent) out.push('Test tag missing');
    return out;
  };

  /* ---- boot: wait for the game, seed, run setup, publish ---- */
  onload(function () {
    var d = def();
    if (!d) { window.GXSCN = { id: id, ready: true, error: 'unknown scenario ' + id + ' (have: ' + S.defs.map(function (x) { return x.id; }).join(', ') + ')' }; return; }
    tag(d);
    S.wait(d.when || function () { return true; }, 20000).then(function () {
      if (d.seed != null) seedRng(d.seed >>> 0);
      return new Promise(function (r) { setTimeout(r, 300); });
    }).then(function () { return d.setup && d.setup(); }).then(function () {
      var pubD = pub(d); pubD.checks = d.checks.map(function (c) { return { kind: c.kind, name: c.name || c.sel || c.kind, sel: c.sel }; });
      window.GXSCN = { id: d.id, name: d.name, ask: d.ask || '', sizes: d.sizes || 'all', checks: pubD.checks, ready: true };
      try { if (parent !== window) parent.postMessage({ type: 'gxscn', id: d.id, name: d.name, ask: d.ask || '' }, '*'); } catch (e) { }
    }).catch(function (e) { window.GXSCN = { id: d.id, name: d.name, ask: d.ask || '', ready: true, error: 'setup failed: ' + String(e && e.message || e).slice(0, 160), checks: [] }; });
  });
})();
