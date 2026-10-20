/* GX LAB core: storage + result rules shared by the in-game LAB (gx-lab.js) and the owner page (games/lab.html).
   Results live in the player's REAL localStorage (the same origin as the shelf), in the shelf's own format:
     shelf_ck_res      {"<date>|<game>|<item index>": {s:'ok'|'bad'|'skip', n:'note'}}   (the shelf's ✔ Test checklist)
     shelf_wn_checked / shelf_ck_auto                                                       (What's new "Checked" ticks, same rule as the shelf)
     gx_lab_res        {"<slug>/<scenario id>": {s, n}}                                      (scenario results: LAB menu + lab.html)
   Rating a scenario also rates every checklist item that points at it, and rating an item rates its scenario, so a tick shows everywhere.
   Test mode: ?test=1 in the URL or localStorage gx_test = '1'. Off = nothing in the page changes. */
(function (W) {
  if (W.GXLAB && W.GXLAB.core) return;
  var IDS = { 'crown-city-smash': 'crown', 'nebula-aces': 'nebula', 'doorkick-dungeon': 'doorkick', 'shipwreck-isle': 'shipwreck', 'sands-of-qamar': 'sands', 'sunglaze': 'sunglaze', 'rampart-and-vine': 'rampart', 'short-fuse': 'shortfuse', 'tidewake': 'tidewake', 'hollowbough': 'hollowbough', 'thornbound': 'thornbound', 'kaiten-kitchen': 'kaiten', 'lantern-dive': 'lantern', 'cauldron-fair': 'cauldron', 'final-approach': 'approach', 'mainhattan-nightrun': 'mainhattan', 'mainhattan-overdrive': 'overdrive' };
  var L = W.GXLAB = W.GXLAB || {}; L.core = true; L.IDS = IDS;
  L.idOf = function (slug) { return IDS[slug] || slug; };
  L.slugOfId = function (id) { for (var k in IDS) if (IDS[k] === id) return k; return id; };
  L.slug = function () { var p = location.pathname.split('/').filter(Boolean); if (p.length && /\.html?$/.test(p[p.length - 1])) p.pop(); return p[p.length - 1] || ''; };
  L.ls = function () { try { return (W.GXS && W.GXS.realLS) || W.localStorage; } catch (e) { return null; } };
  L.get = function (k) { try { return L.ls().getItem(k); } catch (e) { return null; } };
  L.set = function (k, v) { try { L.ls().setItem(k, v); } catch (e) { } };
  L.j = function (k) { try { return JSON.parse(L.get(k) || '{}') || {}; } catch (e) { return {}; } };
  L.testOn = function () { return /[?&]test=1\b/.test(location.search) || L.get('gx_test') === '1'; };
  L.setTest = function (on) { L.set('gx_test', on ? '1' : '0'); };
  var RES = 'gx_lab_res', CKR = 'shelf_ck_res', WNK = 'shelf_wn_checked', CKA = 'shelf_ck_auto';
  L.key = function (e, i) { return e.date + '|' + e.game + '|' + i; };
  L.wnKey = function (e) { return e.date + '|' + e.game; };
  L.entries = function (upds, slug) { var id = L.idOf(slug); return (upds || []).filter(function (e) { return e.game === id || e.game === slug; }); };
  L.scnRes = function (slug, id) { return L.j(RES)[slug + '/' + id] || {}; };
  L.itemRes = function (e, i) { return L.j(CKR)[L.key(e, i)] || {}; };
  /* mark a What's new entry Checked when every item works; undo only what we marked (same rule as the shelf) */
  L.sync = function (upds) {
    var r = L.j(CKR), a = L.j(CKA), d = L.j(WNK), ch = false;
    (upds || []).forEach(function (e) { var its = e.items || []; if (!its.length) return; var wk = L.wnKey(e), all = its.every(function (_, i) { return (r[L.key(e, i)] || {}).s === 'ok'; });
      if (all && !d[wk]) { d[wk] = 1; a[wk] = 1; ch = true; } else if (!all && d[wk] && a[wk]) { delete d[wk]; delete a[wk]; ch = true; } });
    if (ch) { L.set(WNK, JSON.stringify(d)); L.set(CKA, JSON.stringify(a)); }
  };
  function put(store, k, s, n) { var o = L.j(store); if (s == null) delete o[k]; else o[k] = { s: s, n: n || '' }; L.set(store, JSON.stringify(o)); }
  L.setItem = function (upds, e, i, s, n) {
    put(CKR, L.key(e, i), s, n); var sid = e.scn && e.scn[i]; if (sid) put(RES, L.slugOfId(e.game) + '/' + sid, s, n);
    L.sync(upds);
  };
  L.setScn = function (upds, slug, id, s, n) {
    put(RES, slug + '/' + id, s, n);
    L.entries(upds, slug).forEach(function (e) { (e.scn || []).forEach(function (x, i) { if (x === id) put(CKR, L.key(e, i), s, n); }); });
    L.sync(upds);
  };
  /* text for "Copy results": the shelf's own format per entry, then the scenarios that no checklist item covers */
  L.text = function (upds, slug, list, name) {
    var out = [], used = {};
    L.entries(upds, slug).forEach(function (e) { var l = ['Game Night test · ' + name + ' · ' + e.date];
      (e.items || []).forEach(function (t, i) { var v = L.itemRes(e, i), sid = e.scn && e.scn[i], tg = sid ? ' [scn:' + sid + ']' : ''; if (sid) used[sid] = 1;
        l.push(v.s === 'ok' ? '✅ ' + t + tg : v.s === 'bad' ? '❌ ' + t + tg + (v.n ? ' — ' + v.n : '') : v.s === 'skip' ? '⏭ ' + t + tg : '⬜ ' + t + tg + ' (not tested)'); });
      out.push(l.join('\n')); });
    var rest = (list || []).filter(function (d) { return !used[d.id]; });
    if (rest.length) out.push(['Game Night LAB · ' + name].concat(rest.map(function (d) { var v = L.scnRes(slug, d.id); return (v.s === 'ok' ? '✅ ' : v.s === 'bad' ? '❌ ' : v.s === 'skip' ? '⏭ ' : '⬜ ') + d.name + ' [scn:' + d.id + ']' + (v.s === 'bad' && v.n ? ' — ' + v.n : ''); })).join('\n'));
    return out.join('\n\n');
  };
  L.copy = function (text, done) {
    var fb = function () { var ok = false, box = document.createElement('div'); box.className = 'gxl-fb'; box.innerHTML = '<textarea readonly aria-label="Results"></textarea><button type="button">Close</button>';
      var ta = box.firstChild; ta.value = text; document.body.appendChild(box); ta.focus(); ta.select(); try { ok = document.execCommand('copy'); } catch (_) { }
      box.lastChild.onclick = function () { box.remove(); }; if (ok) { box.remove(); done(true); } else done(false); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { done(true); }, fb); else fb();
  };
  L.esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  L.chip = function (s) { return s === 'ok' ? '✅' : s === 'bad' ? '❌' : s === 'skip' ? '⏭' : '⬜'; };
})(window);
