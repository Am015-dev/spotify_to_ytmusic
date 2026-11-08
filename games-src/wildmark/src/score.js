/* Scoring you can see (W416): exact point previews before you commit, a why-pop after, market badges with the best gain, and
   one line after each of your turns rating the move against the best one. Points here = animal cards + largest habitats (the
   majority bonuses are settled at the end and shown in the score strip). Used by ui.js (drawMap, renderDock, act). */
var PV = { memo: null };
function pvScore(env) { return WM.score(env, 0, G.cards); }
// the parts of a score change, biggest first: [{d, a|t, label}]
function pvParts(s0, s1) {
  var p = [];
  WM.ANI.forEach(function (a) { var d = s1.ani[a] - s0.ani[a]; if (d) p.push({ d: d, a: a, label: (d > 0 ? '+' : '') + d + ' ' + pvWhy(a, d) }); });
  WM.TER.forEach(function (t) { var d = s1.hab[t] - s0.hab[t]; if (d) p.push({ d: d, t: t, label: (d > 0 ? '+' : '') + d + ' largest ' + WM.TER_NAME[t].toLowerCase() }); });
  return p.sort(function (x, y) { return Math.abs(y.d) - Math.abs(x.d); });
}
// what the animal's card rewards, in two or three words (set A); other sets name their card
var PV_WHY = { bear: ['Bear pair', 'Bear pair broken'], elk: ['Elk line', 'Elk line broken'], salmon: ['Salmon run', 'Salmon run broken'], hawk: ['lone Hawk', 'Hawk no longer alone'], fox: ['Fox neighbours', 'Fox neighbours'] };
function pvWhy(a, d) { return (G.cards && G.cards[a] || 'a') === 'a' ? PV_WHY[a][d < 0 ? 1 : 0] : WM.ANI_NAME[a] + ' (' + cinfo(a).title + ')'; }
function pvSum(p) { return p.reduce(function (n, x) { return n + x.d; }, 0); }
function pvText(p) { return p.length ? p.map(function (x) { return x.label; }).join(', ') : 'no points now'; }
// cells to light for a part (the pattern the move completes, or the habitat it grows)
function pvLit(env, p) {
  var cells = [];
  p.forEach(function (x) {
    if (x.d <= 0) return;
    if (x.a) { var i = {}; WM.scoreAnimal(env, x.a, i, G.cards && G.cards[x.a]); cells = cells.concat(i.lit || []); }
    else { var j = {}; WM.corridor(env, x.t, j); cells = cells.concat(j.cells || []); }
  });
  return cells;
}
// put the held tile at c (rotation rot) for a moment: points it adds and the cells it lights
function pvTile(env, tile, c, rot) {
  var s0 = pvScore(env);
  env[c] = { id: tile.id, t: tile.t.slice(), a: tile.a.slice(), key: !!tile.key, rot: tile.t.length === 1 ? 0 : rot, tok: null };
  var s1 = pvScore(env), p = pvParts(s0, s1), lit = pvLit(env, p); delete env[c];
  return { d: pvSum(p), parts: p, lit: lit };
}
// put animal a on c for a moment
function pvTok(env, c, a) {
  var x = env[c], s0 = pvScore(env), i0 = {}; WM.scoreAnimal(env, a, i0, G.cards && G.cards[a]);
  x.tok = a; var s1 = pvScore(env), p = pvParts(s0, s1), lit = pvLit(env, p);
  if (x.key) p.push({ d: 1, label: '+1 acorn (keystone)' });
  var broke = []; if (pvSum(p) < 0) { var i1 = {}; WM.scoreAnimal(env, a, i1, G.cards && G.cards[a]); broke = (i0.lit || []).filter(function (y) { return (i1.lit || []).indexOf(y) < 0; }); }
  x.tok = null; return { d: pvSum(p), parts: p, lit: lit, broke: broke };
}
// best gain of one market pair: best tile spot + rotation, plus the best spot for its animal (the new tile included)
function pvPair(env, tile, tok) {
  var spots = WM.spots(env), tokBest = 0;
  WM.tokSpots(env, tok).forEach(function (c) { tokBest = Math.max(tokBest, pvTok(env, c, tok).d); });
  var best = { d: -99 };
  spots.forEach(function (c) {
    WM.rots(tile).forEach(function (r) {
      var t = pvTile(env, tile, c, r), d = t.d + tokBest;
      if (tile.a.indexOf(tok) >= 0) { env[c] = { id: tile.id, t: tile.t.slice(), a: tile.a.slice(), key: !!tile.key, rot: r, tok: null }; d = Math.max(d, t.d + pvTok(env, c, tok).d); delete env[c]; }
      if (d > best.d) best = { d: d, c: c, rot: r };
    });
  });
  if (best.d < 0) best.d = 0;
  return best;
}
// gains for the 4 market pairs (memoised per market + valley state)
function pvMarket() {
  var s = G.seats[G.cur], key = JSON.stringify([G.market.tiles.map(function (t) { return t && t.id; }), G.market.toks, Object.keys(s.env).length, G.cur, G.logN, s.done]);
  if (PV.memo && PV.memo.key === key) return PV.memo.v;
  var v = G.market.tiles.map(function (t, i) { var k = G.market.toks[i]; return t && k ? pvPair(s.env, t, k).d : null; });
  PV.memo = { key: key, v: v }; return v;
}
function pvBestCol(v) { var b = -1; v.forEach(function (x, i) { if (x != null && (b < 0 || x > v[b])) b = i; }); return b; }
// ---- the turn verdict: remembered at the pick, told after the animal step
function pvTurnStart(m) {
  if (!G || G.seats[G.cur].ai) return;
  var v = pvMarket().slice(), b = pvBestCol(v), s = G.seats[G.cur], sol = -1;
  try { var pl = WM.AI.plan(WM.clone(G), 'hard'); sol = pl.pick.t === 'take' ? pl.pick.i : pl.pick.ti; } catch (e) { }
  var ci = m.t === 'take' ? m.i : m.ti;
  var names = G.market.toks.map(function (k) { return k ? WM.ANI_NAME[k] : ''; });
  PV.turn = { v: v, best: b >= 0 ? v[b] : 0, bestI: b, sol: sol, chosen: ci, s0: pvScore(s.env), ac0: s.acorns + (m.t === 'free' ? 1 : 0), seat: G.cur, names: names };
}
function pvColName(i) { var t = G.market.tiles[i], k = G.market.toks[i]; return 'column ' + (i + 1) + (k ? ' (' + WM.ANI_NAME[k] + ')' : ''); }
function pvTurnEnd() {
  var T = PV.turn; PV.turn = null; if (!T) return null;
  var s = G.seats[T.seat], s1 = pvScore(s.env), p = pvParts(T.s0, s1);
  if (s.acorns > T.ac0) p.push({ d: s.acorns - T.ac0, label: '+' + (s.acorns - T.ac0) + ' acorn' });
  var got = pvSum(p), best = Math.max(T.best, got), col = function (i) { return 'the ' + T.names[i] + ' column'; };
  var why = p.length ? pvText(p) : 'nothing scored';
  var tag = got >= best - 0.5 ? 'good' : got >= best - 2 || got >= best * 0.6 ? 'okay' : 'poor';
  var alt = T.bestI >= 0 && T.bestI !== T.chosen ? ' Best was ' + col(T.bestI) + ' for up to +' + T.best + '.' : '';
  var hint = T.sol >= 0 && T.sol !== T.chosen && T.sol !== T.bestI ? ' The hint liked ' + col(T.sol) + ' for later turns.' : '';
  var pts = got > 0 ? '+' + got : got < 0 ? String(got) : 'no points';
  var head = (tag === 'good' ? 'Good move: ' : tag === 'okay' ? 'Okay move: ' : 'Poor move: ') + pts;
  var text = head + (p.length ? ' (' + why + ').' : '.') + (tag === 'good' ? (got > 0 ? ' The best this turn.' : ' Nothing scored more.') : alt + hint);
  UI.verdict = { tag: tag, text: text };
  if (window.GXH && GXH.log) try { GXH.log(text); } catch (e) { }
  return UI.verdict;
}
function pvVerdictHTML() { var v = UI.verdict; if (!v || !G || G.over) return ''; return '<div id="verdict" class="vd ' + v.tag + '" role="status"><b>' + (v.tag === 'good' ? '&#9733;' : v.tag === 'okay' ? '&#9679;' : '&#9888;') + '</b><span>' + esc(v.text) + '</span></div>'; }
// ---- map previews: the ghost tile (tap a spot) or the spot / animal target under the mouse
function pvSpotBest(env, c) { var b = -99; WM.rots(G.hold.tile).forEach(function (r) { b = Math.max(b, pvTile(env, G.hold.tile, c, r).d); }); return b; }
function pvNow() {
  var env = G.seats[G.cur].env;
  if (G.stage === 'tile' && UI.ghost) { var g = pvTile(env, G.hold.tile, UI.ghost.c, UI.ghost.rot); g.lit = g.lit.concat([UI.ghost.c]); g.what = 'Here'; return g; }
  if (G.stage === 'tile' && UI.hov && WM.spots(env).indexOf(UI.hov) >= 0) { var b = null; WM.rots(G.hold.tile).forEach(function (r) { var t = pvTile(env, G.hold.tile, UI.hov, r); if (!b || t.d > b.d) b = t; }); b.lit = b.lit.concat([UI.hov]); b.what = 'This spot'; return b; }
  if (G.stage === 'tok' && UI.hov && env[UI.hov] && !env[UI.hov].tok && env[UI.hov].a.indexOf(G.hold.tok) >= 0) { var t2 = pvTok(env, UI.hov, G.hold.tok); t2.lit = t2.lit.concat([UI.hov]); t2.what = WM.ANI_NAME[G.hold.tok] + ' here'; return t2; }
  return null;
}
// a "+N" badge on the map (SVG, fixed readable size); zero shows only on the ghost
function pvBadge(x, y, d, c, spot, ghost) {
  if (!ghost && d === 0 && spot) return '';
  var t = (d > 0 ? '+' : d < 0 ? '−' : '') + Math.abs(d), w = 14 + t.length * 9;
  var k = Math.min(1, 1.25 / (UI.pan && UI.pan.z || 1));   // same on-screen size at any zoom
  return '<g class="pvb' + (d > 0 ? ' up' : d < 0 ? ' dn' : ' zero') + '" data-c="' + c + '" transform="translate(' + x.toFixed(1) + ',' + y.toFixed(1) + ') scale(' + k.toFixed(3) + ')"><rect x="' + (-w / 2) + '" y="-12" width="' + w + '" height="24" rx="12"/><text y="6" text-anchor="middle">' + t + '</text></g>';
}
// the one preview / verdict strip above the instruction line
function pvStrip(pv) {
  var e = $('#pv'); if (!e) { e = document.createElement('div'); e.id = 'pv'; e.setAttribute('aria-live', 'polite'); $('#board').appendChild(e); }
  var h = '';
  if (pv) h = '<div class="vd ' + (pv.d > 0 ? 'good' : pv.d < 0 ? 'poor' : 'okay') + '"><b>' + (pv.d > 0 ? '+' : '') + pv.d + '</b><span>' + esc(pv.what + ': ' + (pv.d < 0 ? pvText(pv.parts) + ' (breaks a pattern)' : pvText(pv.parts))) + '</span></div>';
  else if (UI.verdict && !G.over && !(myTurn() && G.stage !== 'pick')) h = pvVerdictHTML();
  e.innerHTML = h; e.hidden = !h;
  var ln = $('#line'), lh = ln && getComputedStyle(ln).display !== 'none' ? ln.offsetHeight : 0; e.style.bottom = (lh ? lh + 18 : 10) + 'px';   // sits just above the instruction line
  var te = $('#toast'); if (te && te.classList.contains('on')) toastPlace(te);
}
// mouse: hovering a spot or an animal target previews it (touch: the badges on every spot and the ghost tile do the same)
(function () {
  document.addEventListener('pointerover', function (e) {
    if (e.pointerType === 'touch' || !G || !myTurn() || (G.stage !== 'tile' && G.stage !== 'tok')) return;
    var el = e.target.closest && e.target.closest('#map [data-c]'), c = el ? el.getAttribute('data-c') : null;
    if (UI.ghost && G.stage === 'tile') c = null;
    if (c === UI.hov) return; UI.hov = c; drawMap();
  });
})();
