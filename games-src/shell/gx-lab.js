/* GX LAB (test mode only): 🧪 LAB menu of this game's scenarios, a pinned ✔ Test checklist, quick ✅/❌ for the scenario on screen.
   Needs gx-scenario.js (GXS.defs) and gx-lab-core.js. Off (no ?test=1, no localStorage gx_test) = returns at once: no element, no listener.
   build-all.py inlines gx-lab-core.js + this + gx-lab.css into every staged game. Read the use in games-src/shell/LAB.md. */
(function (W) {
  var L = W.GXLAB; if (!L || !L.core || !L.testOn()) return;
  var slug = L.slug(), gid = L.idOf(slug), q = new URLSearchParams(location.search), scn = q.get('scn') && q.get('scn') !== 'list' ? q.get('scn') : '';
  var inShelf = false; try { inShelf = parent !== window; } catch (e) { inShelf = true; }
  var UP = [], el = {}, esc = L.esc, name = slug;
  var list = function () { var S = W.GXS; return S && S.defs ? S.defs.map(S.pub) : []; };
  var run = function () { try { return JSON.parse(sessionStorage.getItem('gx_lab_run') || 'null'); } catch (e) { return null; } };
  var saveRun = function (r) { try { if (r) sessionStorage.setItem('gx_lab_run', JSON.stringify(r)); else sessionStorage.removeItem('gx_lab_run'); } catch (e) { } };
  var ckOpen = function () { try { return sessionStorage.getItem('gx_lab_ck') === '1'; } catch (e) { return false; } };
  var setCk = function (v) { try { sessionStorage.setItem('gx_lab_ck', v ? '1' : '0'); } catch (e) { } };
  var go = function (id) { L.go = id; location.href = location.pathname + '?scn=' + encodeURIComponent(id) + '&test=1'; };
  function toast(m) { var t = document.createElement('div'); t.className = 'gxl-toast'; t.textContent = m; document.body.appendChild(t); setTimeout(function () { t.remove(); }, 1600); }
  function mk(tag, id, cls) { var e = document.createElement(tag); if (id) e.id = id; if (cls) e.className = cls; return e; }

  function css() {   // the stylesheet is inlined next to this script by build-all.py (window.GXLAB_CSS); else load nothing
    if (W.GXLAB_CSS && !document.getElementById('gxlab-css')) { var s = mk('style', 'gxlab-css'); s.textContent = W.GXLAB_CSS; document.head.appendChild(s); }
  }

  /* ---- the little bar (top corner): LAB, checklist chip, run controls, quick rating ---- */
  function bar() {
    var b = el.bar; if (!b) { b = el.bar = mk('div', 'gxlab-bar'); document.body.appendChild(b); }
    b.className = L.get('gx_lab_pos') === 'r' ? 'r' : '';
    var r = run(), done = 0, tot = 0, h = '<button type="button" id="gxlab-btn" aria-label="LAB menu">🧪 LAB</button>';
    if (!inShelf && UP.length) { var c = ckCount(); h += '<button type="button" id="gxlab-ck" aria-label="Test checklist">📍 ' + c.done + '/' + c.tot + '</button>'; }
    if (r) h += '<button type="button" id="gxlab-next" class="on">Next ▶ ' + (r.i + 1) + '/' + r.ids.length + '</button>';
    if (scn) { var v = L.scnRes(slug, scn).s; h += '<span class="gxl-r">' + [['ok', '✅'], ['bad', '❌'], ['skip', '⏭']].map(function (a) { return '<button type="button" data-s="' + a[0] + '" aria-pressed="' + (v === a[0]) + '" aria-label="' + a[0] + '">' + a[1] + '</button>'; }).join('') + '</span>'; }
    b.innerHTML = h;
  }
  function ckEntries() { return L.entries(UP, slug).slice(0, 4); }
  function ckCount() { var done = 0, tot = 0; ckEntries().forEach(function (e) { (e.items || []).forEach(function (_, i) { tot++; if (L.itemRes(e, i).s) done++; }); }); return { done: done, tot: tot }; }

  /* ---- LAB menu ---- */
  function menu() {
    var p = el.menu; if (!p) { p = el.menu = mk('div', 'gxlab-menu', 'gxl-panel'); p.setAttribute('role', 'dialog'); p.setAttribute('aria-label', 'LAB'); p.hidden = true; document.body.appendChild(p);
      p.act = function (t) {
        if (t.id === 'gxl-close') { p.hidden = true; return; }
        if (t.dataset.go) { go(t.dataset.go); return; }
        if (t.id === 'gxl-all') { var ids = list().map(function (d) { return d.id; }); if (!ids.length) return; saveRun({ ids: ids, i: 0 }); go(ids[0]); return; }
        if (t.id === 'gxl-copy') { L.copy(L.text(UP, slug, list(), name), function (ok) { toast(ok ? 'Copied' : 'Select and copy the text'); }); return; }
        if (t.id === 'gxl-pos') { L.set('gx_lab_pos', L.get('gx_lab_pos') === 'r' ? 'l' : 'r'); bar(); return; }
        if (t.id === 'gxl-off') { L.setTest(false); location.href = location.pathname; return; }
        if (t.dataset.chip) { var d = L.scnRes(slug, t.dataset.chip).s, nx = !d ? 'ok' : d === 'ok' ? 'bad' : d === 'bad' ? 'skip' : null; L.setScn(UP, slug, t.dataset.chip, nx); fillMenu(); bar(); if (el.card && !el.card.hidden) fillCard(); } }; }
    fillMenu(); p.hidden = false;
  }
  function fillMenu() {
    var p = el.menu, ds = list(), g = {}, order = ['Board', 'Cards', 'Story', 'Bosses', 'UI'], h;
    ds.forEach(function (d) { (g[d.group] = g[d.group] || []).push(d); });
    Object.keys(g).forEach(function (k) { if (order.indexOf(k) < 0) order.push(k); });
    var n = 0; ds.forEach(function (d) { if (L.scnRes(slug, d.id).s === 'ok') n++; });
    h = '<div class="gxl-h"><h2>🧪 LAB · ' + esc(name) + ' · ' + n + '/' + ds.length + ' ✅</h2><button type="button" id="gxl-close" aria-label="Close LAB">✕</button></div>' +
      '<div class="gxl-tools"><button type="button" id="gxl-all">All scenarios ▶</button><button type="button" id="gxl-copy">Copy results</button><button type="button" id="gxl-pos">⇄ Move 🧪</button><button type="button" id="gxl-off">Test mode off</button></div><div class="gxl-body" id="gxl-mbody">';
    order.forEach(function (k) { if (!g[k]) return; h += '<div class="gxl-g">' + esc(k) + '</div>';
      g[k].forEach(function (d) { var v = L.scnRes(slug, d.id).s;
        h += '<div class="gxl-row" data-id="' + esc(d.id) + '"><div class="gxl-t"><b>' + esc(d.name) + '</b>' + (d.ask ? '<small>' + esc(d.ask) + '</small>' : '') + '</div>' +
          '<button type="button" class="gxl-go' + (d.id === scn ? ' here' : '') + '" data-go="' + esc(d.id) + '" aria-label="Go: ' + esc(d.name) + '">▶ GO</button>' +
          '<button type="button" class="gxl-chip" data-chip="' + esc(d.id) + '" aria-label="Result">' + L.chip(v) + '</button></div>'; }); });
    if (!ds.length) h += '<div class="gxl-g">No scenarios registered for this game yet.</div>';
    var bd = p.querySelector('.gxl-body'), st = bd ? bd.scrollTop : 0; p.innerHTML = h + '</div>'; p.querySelector('.gxl-body').scrollTop = st;
  }

  /* ---- pinned ✔ Test checklist (this game's What's new items, shared with the shelf) ---- */
  function card() {
    var p = el.card; if (!p) { p = el.card = mk('div', 'gxlab-card', 'gxl-panel'); p.setAttribute('role', 'region'); p.setAttribute('aria-label', 'Test checklist'); p.hidden = true; document.body.appendChild(p);
      p.act = function (t) {
        if (t.id === 'gxl-cclose') { setCk(false); p.hidden = true; return; }
        if (t.id === 'gxl-ccopy') { L.copy(L.text(UP, slug, list(), name), function (ok) { toast(ok ? 'Copied' : 'Select and copy the text'); }); return; }
        if (t.dataset.go) { setCk(false); go(t.dataset.go); return; }
        if (t.dataset.s) { var e2 = ckEntries()[+t.dataset.e], i = +t.dataset.i, cur = L.itemRes(e2, i).s; L.setItem(UP, e2, i, cur === t.dataset.s ? null : t.dataset.s, ''); fillCard(); bar(); if (el.menu && !el.menu.hidden) fillMenu(); } };
      p.addEventListener('input', function (e) { var t = e.target; if (t.dataset && t.dataset.note) { var e3 = ckEntries()[+t.dataset.e], i = +t.dataset.i; L.setItem(UP, e3, i, 'bad', t.value); } }); }
    fillCard(); p.hidden = false;
  }
  function fillCard() {
    var p = el.card, c = ckCount(), h = '<div class="gxl-h"><h2>📍 ' + esc(name) + ' · ' + c.done + '/' + c.tot + ' checked</h2><button type="button" id="gxl-ccopy">Copy</button><button type="button" id="gxl-cclose" aria-label="Fold checklist">▾</button></div><div class="gxl-body">';
    ckEntries().forEach(function (e, ei) { h += '<div class="gxl-ed">' + esc(e.date) + ' · <b>' + esc(e.title) + '</b></div>';
      (e.items || []).forEach(function (t, i) { var v = L.itemRes(e, i), sid = e.scn && e.scn[i], d = list().filter(function (x) { return x.id === sid; })[0], ask = (d && d.ask) || (e.ask && e.ask[i]) || '';
        h += '<div class="gxl-item" data-e="' + ei + '" data-i="' + i + '"><span class="gxl-p">' + esc(t) + '</span>' +
          (sid ? '<div class="gxl-top"><button type="button" class="gxl-go' + (sid === scn ? ' here' : '') + '" data-go="' + esc(sid) + '">📍 GO</button>' + (ask ? '<span class="gxl-ask">' + esc(ask) + '</span>' : '') + '</div>' : '') +
          '<div class="gxl-rate">' + [['ok', '✅ Works'], ['bad', '❌ Problem'], ['skip', '⏭ Skip']].map(function (a) { return '<button type="button" data-s="' + a[0] + '" data-e="' + ei + '" data-i="' + i + '" aria-pressed="' + (v.s === a[0]) + '">' + a[1] + '</button>'; }).join('') + '</div>' +
          (v.s === 'bad' ? '<input class="gxl-note" type="text" maxlength="200" placeholder="What went wrong? (optional)" aria-label="Note" data-note="1" data-e="' + ei + '" data-i="' + i + '" value="' + esc(v.n || '') + '">' : '') + '</div>'; }); });
    if (!ckEntries().length) h += '<div class="gxl-g">Nothing to test for this game yet.</div>';
    var bd = p.querySelector('.gxl-body'), st = bd ? bd.scrollTop : 0; p.innerHTML = h + '</div>'; p.querySelector('.gxl-body').scrollTop = st;
  }

  /* ---- wiring ---- */
  function init() {
    css(); bar();
    /* one window-capture handler on pointerup (a game's blocking handlers, e.g. the tutorial's, never see it) and on click (mouse / keyboard / when no pointerup came) */
    var last = 0;
    function hit(e) {
      var b = e.target && e.target.closest && e.target.closest('#gxlab-bar button, .gxl-panel button'); if (!b) return;
      e.stopPropagation(); if (e.type === 'click') e.preventDefault();
      if (e.type === 'click' && Date.now() - last < 600) return;   // pointerup already did it
      if (e.type === 'pointerup') last = Date.now();
      var p = b.closest('.gxl-panel'); if (p) { if (p.act) p.act(b); return; }
      if (b.id === 'gxlab-btn') { if (el.menu && !el.menu.hidden) el.menu.hidden = true; else { if (el.card) el.card.hidden = true; menu(); } return; }
      if (b.id === 'gxlab-ck') { if (el.card && !el.card.hidden) { setCk(false); el.card.hidden = true; } else { if (el.menu) el.menu.hidden = true; setCk(true); card(); } return; }
      if (b.id === 'gxlab-next') { var r = run(); if (!r) return; if (r.i + 1 < r.ids.length) { r.i++; saveRun(r); go(r.ids[r.i]); } else { saveRun(null); location.href = location.pathname + '?test=1#lab'; } return; }
      if (b.dataset.s && scn) { var cur = L.scnRes(slug, scn).s; L.setScn(UP, slug, scn, cur === b.dataset.s ? null : b.dataset.s); bar(); if (el.menu && !el.menu.hidden) fillMenu(); if (el.card && !el.card.hidden) fillCard(); }
    }
    W.addEventListener('pointerup', hit, true); W.addEventListener('click', hit, true);
    if (location.hash === '#lab') menu();
    else if (ckOpen() && !inShelf && UP.length) card();
  }
  var ready = function () { init(); };
  fetch('../updates.json', { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : []; }).catch(function () { return []; }).then(function (u) {
    UP = Array.isArray(u) ? u : []; if (W.GXS && W.GXS.defs) { /* scenarios are registered before this runs */ }
    var go2 = function () { try { name = (document.title || slug).replace(/\s*[|–-].*$/, '').trim() || slug; } catch (e) { } ready(); };
    if (document.body) go2(); else addEventListener('DOMContentLoaded', go2);
  });
  L.ui = { list: list, bar: bar, menu: menu, card: card };
})(window);
