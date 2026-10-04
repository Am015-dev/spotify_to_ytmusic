// ===== GX kit: opt-in shared parts for every game on the shelf (load AFTER shell.js) =====
// Adds to the existing GX object without changing any of its existing calls:
//   GX.pref / GX.setPref / GX.onPref / GX.applyPrefs     shared settings stored once as `gns-prefs`
//   GX.settings(opts)                                     the Menu drawer with the same sections in every game
//   GX.reference(sections, opts) / GX.refOpen(id)         component reference drawer (search, chips, big view)
//   GX.undo                                               snapshot / restore of the JSON game state
//   GX.recap                                              "Since your last turn" strip for the dock
//   GX.buzz / GX.animMs / GX.aiDelay / GX.reduced / GX.mark   small helpers
//   GX.offline(opts)                                      service worker + "a new version is ready" notice
// and a global GNS for local results, statistics and achievements (shared with the shelf home page).
// Everything is wrapped in try/catch: a missing localStorage, navigator.vibrate or service worker never throws.
(function (root, shellGX) {
  'use strict';
  // shell.js declares `const GX` (a global lexical binding, not window.GX): extend that same object, and expose it as window.GX too
  var GX = root.GX = shellGX || root.GX || {};
  var doc = root.document;
  var LS = {
    get: function (k) { try { return root.localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { root.localStorage.setItem(k, v); return true; } catch (e) { return false; } },
    json: function (k, d) { try { var v = JSON.parse(root.localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } },
    put: function (k, v) { try { root.localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  };
  GX._ls = LS;
  function el(tag, cls, txt) { var e = doc.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function btn(cls, txt, on) { var b = el('button', cls, txt); b.type = 'button'; if (on) b.addEventListener('click', on); return b; }
  var qs = function () { try { return root.location ? root.location.search : ''; } catch (e) { return ''; } };
  GX.dev = /[?&]dev=1\b/.test(qs());
  // hooks run just before a drawer opens (the game's own GX.onShow keeps working untouched)
  var bsh = [];
  GX.beforeShow = function (f) {
    if (!GX._kitShow && typeof GX.show === 'function') { var base = GX.show; GX._kitShow = true; GX.show = function (id) { for (var i = 0; i < bsh.length; i++) { try { bsh[i](id); } catch (e) { } } return base.apply(this, arguments); }; }
    bsh.push(f); return f;
  };

  // ------------------------------------------------------------------ shared settings
  var PDEF = { master: 1, music: 0.5, sfx: 0.8, anim: 'normal', ai: 'normal', text: 1, cb: false, lefty: false, reduce: false, haptics: true };
  var P = Object.assign({}, PDEF, LS.json('gns-prefs', {}) || {});
  var pl = [];
  GX.PREF_DEFAULTS = PDEF;
  GX.pref = function (k) { return k == null ? Object.assign({}, P) : P[k]; };
  GX.setPref = function (k, v) {
    if (typeof k === 'object') { for (var x in k) P[x] = k[x]; } else P[k] = v;
    LS.put('gns-prefs', P); GX.applyPrefs();
    for (var i = 0; i < pl.length; i++) { try { pl[i](k, v, GX.pref()); } catch (e) { } }
    return v;
  };
  GX.onPref = function (f) { pl.push(f); return f; };
  GX.reduced = function () { if (P.reduce) return true; try { return !!(root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { return false; } };
  var AM = { slow: 1.6, normal: 1, fast: 0.5, off: 0 };
  // scale an animation length by the player's animation speed (0 when animations are off or motion is reduced)
  GX.animMs = function (ms) { return GX.reduced() ? 0 : Math.round(ms * (AM[P.anim] != null ? AM[P.anim] : 1)); };
  var AD = { slow: 2, normal: 1, fast: 0.25 };
  // scale the pause between computer moves by the player's computer speed
  GX.aiDelay = function (ms) { return Math.round(ms * (AD[P.ai] != null ? AD[P.ai] : 1)); };
  GX.buzz = function (pat) { try { if (P.haptics && root.navigator && typeof root.navigator.vibrate === 'function') return root.navigator.vibrate(pat == null ? 12 : pat); } catch (e) { } return false; };
  GX.canBuzz = function () { try { return !!(root.navigator && typeof root.navigator.vibrate === 'function'); } catch (e) { return false; } };
  // colour-blind hook: one symbol per seat / colour index, shown next to colour-coded pieces when html.cb is on
  GX.SYMBOLS = ['●', '▲', '■', '◆', '★', '✚', '⬟', '✱'];
  GX.mark = function (i) { return GX.SYMBOLS[((i | 0) % GX.SYMBOLS.length + GX.SYMBOLS.length) % GX.SYMBOLS.length]; };
  GX.applyPrefs = function () {
    try {
      var h = doc.documentElement, c = h.classList;
      c.toggle('cb', !!P.cb); c.toggle('lefty', !!P.lefty); c.toggle('gx-reduce', !!P.reduce); c.toggle('gx-noanim', P.anim === 'off');
      h.style.setProperty('--gx-text', String(+P.text || 1));
      h.style.setProperty('--gx-anim', String(GX.reduced() ? 0 : (AM[P.anim] != null ? AM[P.anim] : 1)));
      if (root.GA && root.GA.setVolume) { root.GA.setVolume('master', +P.master); root.GA.setVolume('music', +P.music); root.GA.setVolume('sfx', +P.sfx); }
    } catch (e) { }
  };

  // ------------------------------------------------------------------ settings panel
  // GX.settings({id, title, label, game, sound, speed, help, graphics, accessibility, about:{name, version, text}, shelf:'../'})
  // game / sound / speed / help / graphics / accessibility: optional fn(sectionEl) that appends the game's own rows.
  // Sections are always in this order: Game · Sound · Speed · Help · Graphics · Accessibility · About (+ Developer with ?dev=1).
  GX.SECTIONS = ['Game', 'Sound', 'Speed', 'Help', 'Graphics', 'Accessibility', 'About'];
  GX.row = function (label, kids, hint) {
    var r = el('div', 'gx-row'), l = el('div', 'gx-row-l', label), k = el('div', 'gx-row-k');
    r.appendChild(l); if (hint) l.appendChild(el('small', null, hint));
    (Array.isArray(kids) ? kids : [kids]).forEach(function (x) { if (x) k.appendChild(typeof x === 'string' ? doc.createTextNode(x) : x); });
    r.appendChild(k); return r;
  };
  // segmented choice: GX.seg([[value,label],...], current, onPick)
  GX.seg = function (vals, cur, on, name) {
    var g = el('div', 'gx-seg'); g.setAttribute('role', 'group'); if (name) g.setAttribute('aria-label', name);
    vals.forEach(function (v) {
      var b = btn('gx-sb', v[1], function () { on(v[0]); g.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); });
      b.setAttribute('aria-pressed', String(v[0] === cur)); b.dataset.v = String(v[0]); g.appendChild(b);
    });
    return g;
  };
  GX.onoff = function (on, set, name) {
    var b = btn('gx-tg', on ? 'On' : 'Off'); b.setAttribute('role', 'switch'); b.setAttribute('aria-checked', String(!!on)); if (name) b.setAttribute('aria-label', name);
    b.addEventListener('click', function () { on = !on; b.textContent = on ? 'On' : 'Off'; b.setAttribute('aria-checked', String(on)); set(on); });
    return b;
  };
  GX.slider = function (val, set, name) {
    var w = el('span', 'gx-sl'), i = el('input'), o = el('output', null, Math.round(val * 100) + '%');
    i.type = 'range'; i.min = '0'; i.max = '100'; i.step = '5'; i.value = String(Math.round(val * 100)); if (name) i.setAttribute('aria-label', name);
    i.addEventListener('input', function () { o.textContent = i.value + '%'; set(+i.value / 100); });
    w.appendChild(i); w.appendChild(o); return w;
  };
  function prefRows(sec, S) {
    if (sec === 'Sound') {
      S.appendChild(GX.row('Master volume', GX.slider(+P.master, function (v) { GX.setPref('master', v); }, 'Master volume')));
      S.appendChild(GX.row('Music', GX.slider(+P.music, function (v) { GX.setPref('music', v); }, 'Music volume')));
      S.appendChild(GX.row('Effects', GX.slider(+P.sfx, function (v) { GX.setPref('sfx', v); }, 'Effects volume')));
      if (GX.canBuzz()) S.appendChild(GX.row('Vibration', GX.onoff(P.haptics, function (v) { GX.setPref('haptics', v); if (v) GX.buzz(20); }, 'Vibration'), 'Short buzz on your turn and on big moments'));
    } else if (sec === 'Speed') {
      S.appendChild(GX.row('Animations', GX.seg([['slow', 'Slow'], ['normal', 'Normal'], ['fast', 'Fast'], ['off', 'Off']], P.anim, function (v) { GX.setPref('anim', v); }, 'Animation speed')));
      S.appendChild(GX.row('Computer players', GX.seg([['slow', 'Slow'], ['normal', 'Normal'], ['fast', 'Fast']], P.ai, function (v) { GX.setPref('ai', v); }, 'Computer speed')));
    } else if (sec === 'Accessibility') {
      S.appendChild(GX.row('Text size', GX.seg([[0.9, 'Small'], [1, 'Normal'], [1.15, 'Large'], [1.3, 'Huge']], +P.text, function (v) { GX.setPref('text', v); }, 'Text size')));
      S.appendChild(GX.row('Colour-blind help', GX.onoff(P.cb, function (v) { GX.setPref('cb', v); }, 'Colour-blind help'), 'Adds symbols to colour-coded pieces'));
      S.appendChild(GX.row('Left-handed', GX.onoff(P.lefty, function (v) { GX.setPref('lefty', v); }, 'Left-handed layout'), 'Panel and main buttons on the left'));
      S.appendChild(GX.row('Reduce motion', GX.onoff(P.reduce, function (v) { GX.setPref('reduce', v); }, 'Reduce motion'), 'No sliding or flying pieces'));
    }
  }
  GX.settings = function (o) {
    o = o || {}; GX._set = o;
    var id = o.id || 'gx-setd';
    var body = el('div', 'gx-set');
    GX.drawer(id, o.title || 'Menu', body, false);
    var render = function () {
      body.innerHTML = '';
      var nav = el('nav', 'gx-set-nav'); nav.setAttribute('aria-label', 'Menu sections'); body.appendChild(nav);
      var secs = GX.SECTIONS.slice(); if (GX.dev) secs.push('Developer');
      secs.forEach(function (sec) {
        var key = sec.toLowerCase(), S = el('section', 'gx-sec'); S.id = id + '-' + key; S.setAttribute('aria-label', sec);
        S.appendChild(el('h3', null, sec));
        try { if (typeof o[key] === 'function') o[key](S); } catch (e) { if (root.console) console.error(e); }
        prefRows(sec, S);
        if (sec === 'About') aboutRows(S, o);
        if (sec === 'Developer') devRows(S);
        if (S.childNodes.length > 1) { body.appendChild(S); var a = btn('gx-chip', sec, function () { S.scrollIntoView({ block: 'start', behavior: GX.reduced() ? 'auto' : 'smooth' }); }); nav.appendChild(a); }
      });
    };
    GX._setRender = render;
    GX.beforeShow(function (x) { if (x === id) render(); });
    render();
    return id;
  };
  GX.renderSettings = function () { if (GX._setRender) GX._setRender(); };
  function aboutRows(S, o) {
    var a = o.about || {}, shelf = o.shelf != null ? o.shelf : '../';
    if (a.name) S.appendChild(el('p', 'gx-about-n', a.name + (a.version ? ' · ' + a.version : '')));
    if (a.text) { var p = el('p', 'gx-small'); p.textContent = a.text; S.appendChild(p); }
    var links = el('div', 'gx-links');
    [['credits.html', 'Credits & licences'], ['privacy.html', 'Privacy'], ['terms.html', 'Terms'], ['reference.html', 'All cards on the shelf']].forEach(function (l) {
      var x = el('a', 'gx-chip', l[1]); x.href = shelf + l[0]; x.target = '_blank'; x.rel = 'noopener'; links.appendChild(x);
    });
    S.appendChild(links);
    S.appendChild(el('p', 'gx-small', 'Settings, saves and statistics stay on this device. Nothing is sent anywhere unless you play online.'));
  }
  function devRows(S) {
    var H = root.PerfHUD;
    S.appendChild(GX.row('Speed tools', [
      btn('gx-sb', 'Show speed', function () { try { H && (H.toggle ? H.toggle() : H.show && H.show()); } catch (e) { } }),
      btn('gx-sb', 'Test speed', function () { try { H && H.test && H.test(); } catch (e) { } }),
      btn('gx-sb', 'Copy report', function () { try { var r = H && H.report ? H.report() : JSON.stringify(GX.pref()); root.navigator.clipboard.writeText(r); } catch (e) { } })
    ]));
  }

  // ------------------------------------------------------------------ component reference
  // sections: [{id, title, items:[{id, name, count, text, tags:[], meta, picture}]}]
  //   picture: optional; a string (image URL or SVG/HTML markup), a DOM node, or anything opts.picture(item, big) can draw.
  // opts: {id:'gx-refd', title:'Cards', label:'Cards', button:true|selector, picture:fn(item,big)->Node|string,
  //        inGame:fn(item)->bool (adds an "In this game" chip), search:'placeholder'}
  GX.reference = function (sections, opts) {
    opts = opts || {}; var id = opts.id || 'gx-refd';
    var R = GX._ref = { id: id, sections: sections || [], opts: opts, sec: 'all', tags: {}, q: '', inGame: false, big: null };
    var body = el('div', 'gx-ref'); GX.drawer(id, opts.title || 'Cards', body, true);
    R.body = body;
    var top = el('div', 'gx-ref-top');
    var s = el('input', 'gx-ref-q'); s.type = 'search'; s.placeholder = opts.search || 'Search names and text'; s.setAttribute('aria-label', 'Search');
    s.addEventListener('input', function () { R.q = s.value; draw(); });
    top.appendChild(s);
    R.secRow = el('div', 'gx-chips gx-ref-secs'); R.tagRow = el('div', 'gx-chips gx-ref-tags'); R.count = el('div', 'gx-ref-n'); R.count.setAttribute('aria-live', 'polite');
    top.appendChild(R.secRow); top.appendChild(R.tagRow); top.appendChild(R.count);
    R.list = el('div', 'gx-ref-list'); R.view = el('div', 'gx-ref-big'); R.view.hidden = true; R.view.setAttribute('role', 'region'); R.view.setAttribute('aria-label', 'Card');
    body.appendChild(top); body.appendChild(R.list); body.appendChild(R.view);
    R.input = s;
    if (opts.button !== false) {
      var bar = doc.querySelector(typeof opts.button === 'string' ? opts.button : '.gx-bar');
      if (bar && !doc.querySelector('[data-gx="' + id + '"]')) {
        var b = btn('gx-ibtn gx-refbtn'); b.dataset.gx = id; b.setAttribute('aria-expanded', 'false'); b.setAttribute('aria-label', opts.title || 'Cards'); b.title = opts.title || 'Cards';
        b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="11" height="16" rx="2"/><path d="M14 6.5 20 8l-3.2 12.2-5-1.3"/></svg><span></span>';
        b.querySelector('span').textContent = opts.label || 'Cards';
        var sp = bar.querySelector('.gx-sp'); var after = sp ? sp.nextElementSibling : null;
        if (opts.before) after = bar.querySelector(opts.before) || after;
        if (after) bar.insertBefore(b, after); else bar.appendChild(b);
      }
    }
    GX.beforeShow(function (x) { if (x === id) { if (!R.keepBig) closeBig(); R.keepBig = false; draw(); } });
    R.view.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') step(1); else if (e.key === 'ArrowLeft') step(-1); });
    draw();
    return id;
  };
  GX.refData = function (sections) { if (GX._ref) { GX._ref.sections = sections; draw(); } };
  function all() { var R = GX._ref, out = []; R.sections.forEach(function (S) { (S.items || []).forEach(function (it) { out.push({ s: S, it: it }); }); }); return out; }
  function norm(x) { return String(x == null ? '' : x).toLowerCase(); }
  function matches(e) {
    var R = GX._ref, it = e.it;
    if (R.sec !== 'all' && e.s.id !== R.sec) return false;
    for (var t in R.tags) if (R.tags[t] && (it.tags || []).indexOf(t) < 0) return false;
    if (R.inGame && R.opts.inGame && !R.opts.inGame(it)) return false;
    if (R.q) { var hay = norm(it.name) + ' ' + norm(it.text) + ' ' + norm((it.tags || []).join(' ')) + ' ' + norm(it.meta); var w = norm(R.q).split(/\s+/); for (var i = 0; i < w.length; i++) if (w[i] && hay.indexOf(w[i]) < 0) return false; }
    return true;
  }
  function pic(it, big) {
    var R = GX._ref, p = null;
    try { p = R.opts.picture ? R.opts.picture(it, big) : null; } catch (e) { p = null; }
    if (p == null) p = it.picture;
    if (p == null) return null;
    var w = el('span', 'gx-ref-pic' + (big ? ' big' : ''));
    if (typeof p === 'string') { if (/^\s*</.test(p)) w.innerHTML = p; else { var im = el('img'); im.src = p; im.alt = ''; im.loading = 'lazy'; w.appendChild(im); } }
    else if (p.nodeType) w.appendChild(p);
    return w;
  }
  function chip(label, on, f) { var b = btn('gx-chip', label, f); b.setAttribute('aria-pressed', String(!!on)); return b; }
  function draw() {
    var R = GX._ref; if (!R) return;
    R.secRow.innerHTML = '';
    if (R.sections.length > 1) {
      R.secRow.appendChild(chip('All', R.sec === 'all', function () { R.sec = 'all'; R.tags = {}; draw(); }));
      R.sections.forEach(function (S) { var n = (S.items || []).length; R.secRow.appendChild(chip(S.title + ' ' + n, R.sec === S.id, function () { R.sec = S.id; R.tags = {}; draw(); })); });
    }
    // tag chips for the chosen section (most common first, at most 14)
    var tc = {}; all().forEach(function (e) { if (R.sec !== 'all' && e.s.id !== R.sec) return; (e.it.tags || []).forEach(function (t) { tc[t] = (tc[t] || 0) + 1; }); });
    var tl = Object.keys(tc).sort(function (a, b) { return tc[b] - tc[a] || (a < b ? -1 : 1); }).slice(0, 14);
    R.tagRow.innerHTML = '';
    if (R.opts.inGame) R.tagRow.appendChild(chip('In this game', R.inGame, function () { R.inGame = !R.inGame; draw(); }));
    tl.forEach(function (t) { R.tagRow.appendChild(chip(t, R.tags[t], function () { R.tags[t] = !R.tags[t]; draw(); })); });
    var hits = all().filter(matches), copies = 0;
    hits.forEach(function (e) { copies += +e.it.count || 0; });
    R.hits = hits;
    R.count.textContent = hits.length + (hits.length === 1 ? ' entry' : ' entries') + (copies > hits.length ? ' · ' + copies + ' pieces in the box' : '');
    R.list.innerHTML = '';
    if (!hits.length) R.list.appendChild(el('p', 'gx-small', 'Nothing matches. Clear the search or a chip.'));
    var frag = doc.createDocumentFragment();
    hits.forEach(function (e, i) {
      var it = e.it, b = btn('gx-ref-it'); b.dataset.ref = it.id != null ? String(it.id) : String(i);
      b.setAttribute('aria-label', it.name + (it.count ? ', ' + it.count + ' in the box' : ''));
      var p = pic(it, false); if (p) b.appendChild(p);
      var t = el('span', 'gx-ref-tx'); var nm = el('b', null, it.name); t.appendChild(nm);
      if (it.count != null) { var c = el('span', 'gx-ref-c', '×' + it.count); t.appendChild(c); }
      if (it.meta) t.appendChild(el('span', 'gx-ref-m', it.meta));
      if (it.text) t.appendChild(el('span', 'gx-ref-d', it.text));
      b.appendChild(t);
      b.addEventListener('click', function () { openBig(i); });
      frag.appendChild(b);
    });
    R.list.appendChild(frag);
  }
  function openBig(i) {
    var R = GX._ref, e = R.hits[i]; if (!e) return; R.big = i; var it = e.it, V = R.view;
    V.innerHTML = '';
    var head = el('div', 'gx-ref-bh');
    head.appendChild(btn('gx-sb', '‹ All', closeBig));
    var nav = el('span', 'gx-ref-nav');
    var pv = btn('gx-sb', '‹', function () { step(-1); }); pv.setAttribute('aria-label', 'Previous'); pv.disabled = i <= 0;
    var nx = btn('gx-sb', '›', function () { step(1); }); nx.setAttribute('aria-label', 'Next'); nx.disabled = i >= R.hits.length - 1;
    nav.appendChild(pv); nav.appendChild(el('span', 'gx-small', (i + 1) + ' / ' + R.hits.length)); nav.appendChild(nx);
    head.appendChild(nav); V.appendChild(head);
    var p = pic(it, true); if (p) V.appendChild(p);
    V.appendChild(el('h3', null, it.name));
    var m = []; if (it.count != null) m.push(it.count + (it.count === 1 ? ' in the box' : ' in the box')); if (it.meta) m.push(it.meta); m.push(e.s.title);
    V.appendChild(el('p', 'gx-ref-m', m.join(' · ')));
    if (it.text) V.appendChild(el('p', 'gx-ref-full', it.text));
    if (it.extra) { var x = el('div', 'gx-ref-x'); if (typeof it.extra === 'string') x.textContent = it.extra; else x.appendChild(it.extra); V.appendChild(x); }
    if (it.tags && it.tags.length) { var tg = el('div', 'gx-chips'); it.tags.forEach(function (t) { tg.appendChild(el('span', 'gx-tag', t)); }); V.appendChild(tg); }
    V.hidden = false; R.list.hidden = true; R.body.classList.add('big');
    V.tabIndex = -1; try { V.focus({ preventScroll: true }); } catch (er) { }
    var sc = V.closest && V.closest('.gx-drawer-body'); if (sc) sc.scrollTop = 0;
  }
  function closeBig() { var R = GX._ref; if (!R) return; R.big = null; R.view.hidden = true; R.list.hidden = false; R.body.classList.remove('big'); }
  function step(d) { var R = GX._ref; if (R && R.big != null) openBig(Math.max(0, Math.min(R.hits.length - 1, R.big + d))); }
  // open the drawer straight at one item (e.g. from a card pop-up: "Read in the reference")
  GX.refOpen = function (itemId) {
    var R = GX._ref; if (!R) return false;
    R.sec = 'all'; R.tags = {}; R.q = ''; R.inGame = false; if (R.input) R.input.value = '';
    draw();
    var i = -1; R.hits.forEach(function (e, k) { if (String(e.it.id) === String(itemId)) i = k; });
    R.keepBig = i >= 0; if (GX.open !== R.id) GX.show(R.id); else R.keepBig = false;
    if (i >= 0) openBig(i);
    return i >= 0;
  };

  // ------------------------------------------------------------------ undo
  // GX.undo.config({get:()=>state, set:state=>{...re-render...}, owner:state=>seat|null, online:()=>bool, allowOnline:false,
  //                 onChange:fn(can)})
  // snap() before each human move; check() after it (seals when the turn passed to someone else);
  // seal() when hidden information was revealed or the move is confirmed. undo() restores the last snapshot.
  GX.undo = (function () {
    var C = { get: null, set: null, owner: null, online: null, allowOnline: false, onChange: null, max: 40 }, st = [], ow = null;
    function changed() { if (C.onChange) { try { C.onChange(U.can()); } catch (e) { } } }
    var U = {
      config: function (o) { for (var k in o) C[k] = o[k]; st = []; ow = null; changed(); return U; },
      enabled: function () { if (C.online && C.online() && !C.allowOnline) return false; return !!(C.get && C.set); },
      snap: function (label) {
        if (!U.enabled()) return false;
        var s; try { s = JSON.stringify(C.get()); } catch (e) { return false; }
        var o = C.owner ? C.owner(C.get()) : null;
        if (st.length && o !== ow) st = [];
        ow = o; st.push({ s: s, label: label || '' }); if (st.length > C.max) st.shift(); changed(); return true;
      },
      // call after the move: seals when the decision passed to another seat, or when sealIf(beforeState, nowState) says so
      check: function (sealIf) {
        if (!st.length) return;
        var now = C.get(), o = C.owner ? C.owner(now) : null;
        if (C.owner && o !== ow) return U.seal('turn');
        if (sealIf) { var before; try { before = JSON.parse(st[st.length - 1].s); } catch (e) { before = null; } try { if (sealIf(before, now)) return U.seal('reveal'); } catch (e) { } }
      },
      seal: function (why) { if (st.length) { st = []; U.why = why || 'sealed'; changed(); } return false; },
      clear: function () { st = []; ow = null; changed(); },
      can: function () { return U.enabled() && st.length > 0; },
      size: function () { return st.length; },
      label: function () { return st.length ? st[st.length - 1].label : ''; },
      undo: function () {
        if (!U.can()) return false;
        var e = st.pop(), s;
        try { s = JSON.parse(e.s); } catch (er) { return false; }
        C.set(s); changed(); return true;
      }
    };
    return U;
  })();

  // ------------------------------------------------------------------ "Since your last turn"
  // GX.recap.attach(el|selector, {title}); push(lines, fromSeat) while others play; mark(seat) when that seat decides;
  // view(seat) chooses whose summary is shown (hot-seat); the strip renders itself and can be dismissed.
  GX.recap = (function () {
    var box = null, buf = {}, cur = 0, open = false, title = 'Since your last turn', seats = null;
    function list() { return buf[cur] || []; }
    function render() {
      if (!box) return;
      var L = list(); box.innerHTML = '';
      if (!L.length) { box.hidden = true; return; }
      box.hidden = false; box.classList.toggle('open', open);
      var head = btn('gx-recap-h'); head.setAttribute('aria-expanded', String(open));
      head.appendChild(el('b', null, title)); head.appendChild(el('span', 'gx-recap-n', String(L.length)));
      head.appendChild(el('span', 'gx-recap-1', open ? '' : L[L.length - 1]));
      head.addEventListener('click', function () { open = !open; render(); });
      var x = btn('gx-recap-x', '×', function () { R.dismiss(); }); x.setAttribute('aria-label', 'Dismiss');
      var top = el('div', 'gx-recap-top'); top.appendChild(head); top.appendChild(x); box.appendChild(top);
      if (open) { var ul = el('ol', 'gx-recap-l'); L.forEach(function (t) { ul.appendChild(el('li', null, t)); }); box.appendChild(ul); }
    }
    var R = {
      attach: function (where, o) {
        var host = typeof where === 'string' ? doc.querySelector(where) : where; if (!host) return null;
        if (o && o.title) title = o.title;
        box = el('div', 'gx-recap'); box.setAttribute('role', 'status'); box.hidden = true;
        if (o && o.before) host.insertBefore(box, host.firstChild); else host.appendChild(box);
        render(); return box;
      },
      seats: function (list) { seats = list; },
      push: function (lines, fromSeat) {
        lines = (Array.isArray(lines) ? lines : [lines]).filter(function (x) { return x != null && x !== ''; }).map(String);
        if (!lines.length) return;
        var ks = seats || Object.keys(buf).map(Number); if (!ks.length) ks = [cur];
        ks.forEach(function (s) { if (s === fromSeat) return; var b = buf[s] = buf[s] || []; b.push.apply(b, lines); if (b.length > 60) b.splice(0, b.length - 60); });
        render();
      },
      mark: function (seat) { buf[seat == null ? cur : seat] = []; open = false; render(); },
      view: function (seat) { if (seat !== cur) { cur = seat; open = false; render(); } },
      dismiss: function () { buf[cur] = []; open = false; render(); },
      clear: function () { buf = {}; open = false; render(); },
      lines: function (seat) { return (buf[seat == null ? cur : seat] || []).slice(); },
      render: render
    };
    return R;
  })();

  // ------------------------------------------------------------------ offline + new version notice
  // GX.offline({sw:'../sw.js', scope:'../'}) registers the shelf service worker (http/https only) and shows
  // "A new version is ready — tap to reload" when the worker says this page changed or a new worker takes over.
  GX.offline = function (o) {
    o = o || {};
    try {
      var nav = root.navigator; if (!nav || !nav.serviceWorker || !/^https?:$/.test(root.location.protocol)) return false;
      var had = !!nav.serviceWorker.controller;
      nav.serviceWorker.register(o.sw || '../sw.js', { scope: o.scope || '../' }).catch(function () { });
      nav.serviceWorker.addEventListener('controllerchange', function () { if (had) GX.updateNotice(); had = true; });
      nav.serviceWorker.addEventListener('message', function (e) {
        var d = e.data || {}; if (d.type !== 'gns-update') return;
        try { var u = new URL(d.url, root.location.href), me = new URL(root.location.href); var p = function (x) { return x.pathname.replace(/index\.html$/, ''); }; if (p(u) === p(me)) GX.updateNotice(); } catch (er) { }
      });
      return true;
    } catch (e) { return false; }
  };
  GX.updateNotice = function (text) {
    if (!doc || doc.querySelector('.gx-update')) return;
    var b = btn('gx-update', text || 'A new version is ready — tap to reload', function () { try { root.location.reload(); } catch (e) { } });
    b.setAttribute('role', 'status'); doc.body.appendChild(b);
  };

  try { GX.applyPrefs(); } catch (e) { }
  if (root.matchMedia) { try { root.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', GX.applyPrefs); } catch (e) { } }
})(typeof window !== 'undefined' ? window : this, typeof GX !== 'undefined' ? GX : null);

// ===== GNS: local results, statistics and achievements (read by the shelf home page) =====
// GNS.result({game, mode, seats:[{name, me, ai}], winner, scores, turns, ms})  on game over -> {stats, earned:[new achievements]}
// GNS.achievements(game, [{id, name, how, test:(result, stats)=>bool}])          declare once at boot
// GNS.stats(game) · GNS.earned(game) · GNS.results(game) · GNS.saved(game, bool) · GNS.onEarn(fn)
(function (root) {
  'use strict';
  var GNS = root.GNS = root.GNS || {};
  var LS = {
    json: function (k, d) { try { var v = JSON.parse(root.localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } },
    put: function (k, v) { try { root.localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  };
  var DEFS = {}, earnL = [];
  GNS.achievements = function (game, list) {
    DEFS[game] = list || [];
    var all = LS.json('gns-achdef', {}) || {};
    all[game] = DEFS[game].map(function (a) { return { id: a.id, name: a.name, how: a.how }; });
    LS.put('gns-achdef', all);
    return DEFS[game];
  };
  GNS.onEarn = function (f) { earnL.push(f); };
  GNS.stats = function (game) { var s = LS.json('gns-stats', {}) || {}; return game ? s[game] || null : s; };
  GNS.earned = function (game) { var a = LS.json('gns-ach', {}) || {}; return game ? a[game] || {} : a; };
  GNS.results = function (game) { var r = LS.json('gns-results', []) || []; return game ? r.filter(function (x) { return x.game === game; }) : r; };
  GNS.saved = function (game, has) { var s = LS.json('gns-saves', {}) || {}; if (has) s[game] = Date.now(); else delete s[game]; LS.put('gns-saves', s); };
  GNS.result = function (r) {
    r = r || {}; if (!r.game) return null;
    var seats = r.seats || [], me = -1;
    seats.forEach(function (s, i) { if (me < 0 && s && s.me) me = i; });
    var humans = seats.filter(function (s) { return s && !s.ai; }).length;
    var won = me >= 0 && (Array.isArray(r.winner) ? r.winner.indexOf(me) >= 0 : r.winner === me);
    if (r.won != null) won = !!r.won;
    var rec = { game: r.game, mode: r.mode || 'vs', at: Date.now(), np: seats.length, me: me, won: won, winner: r.winner, scores: r.scores || null,
      score: me >= 0 && r.scores ? r.scores[me] : null, turns: r.turns || 0, ms: r.ms || 0, humans: humans, level: r.level || null };
    var list = LS.json('gns-results', []) || []; list.push(rec); if (list.length > 200) list.splice(0, list.length - 200); LS.put('gns-results', list);
    var all = LS.json('gns-stats', {}) || {}, s = all[r.game] || { played: 0, won: 0, best: null, turns: 0, ms: 0, modes: {}, streak: 0, bestStreak: 0 };
    s.played++; if (won) { s.won++; s.streak++; s.bestStreak = Math.max(s.bestStreak, s.streak); } else if (me >= 0) s.streak = 0;
    if (rec.score != null && (s.best == null || rec.score > s.best)) s.best = rec.score;
    s.turns += rec.turns; s.ms += rec.ms; s.modes[rec.mode] = (s.modes[rec.mode] || 0) + 1; s.last = rec.at;
    all[r.game] = s; LS.put('gns-stats', all);
    var ach = LS.json('gns-ach', {}) || {}, mine = ach[r.game] = ach[r.game] || {}, fresh = [];
    (DEFS[r.game] || []).forEach(function (a) { if (mine[a.id]) return; var ok = false; try { ok = !!a.test(rec, s, r); } catch (e) { } if (ok) { mine[a.id] = rec.at; fresh.push(a); } });
    LS.put('gns-ach', ach);
    fresh.forEach(function (a) { earnL.forEach(function (f) { try { f(a, r.game); } catch (e) { } }); });
    return { stats: s, earned: fresh, record: rec };
  };
})(typeof window !== 'undefined' ? window : this);
