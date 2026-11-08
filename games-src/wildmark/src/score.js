/* Scoring you can see (W416): exact point previews before you commit, a why-pop after, market badges with the best gain, and
   one line after each of your turns rating the move against the best one. Points here = animal cards + largest habitats (the
   majority bonuses are settled at the end and shown in the score strip). Used by ui.js (drawMap, renderDock, act). */
var PV = { memo: null };
// ---- plain-language "why" for every point (card set A counts what the card counts; variant cards name their card)
function pvSetA(a) { return (G.cards && G.cards[a] || 'a') === 'a'; }
function pvGroups(env, a) {   // connected groups of animal a: [[cells]]
  var seen = {}, out = [];
  Object.keys(env).forEach(function (c) { if (seen[c] || env[c].tok !== a) return; var g = [], st = [c]; seen[c] = 1;
    while (st.length) { var x = st.pop(); g.push(x); WM.nb(x).forEach(function (n) { if (!seen[n] && env[n] && env[n].tok === a) { seen[n] = 1; st.push(n); } }); }
    out.push(g); });
  return out;
}
var PV_TABLE = { bear: 'pairs 1, 2, 3, 4 = 4, 11, 19, 27', elk: 'lines of 1, 2, 3, 4 = 2, 5, 9, 13', salmon: 'runs of 1-7 = 2, 5, 8, 12, 16, 20, 25', hawk: 'lone hawks 1-8 = 2, 5, 8, 11, 14, 18, 22, 26', fox: '1 point per different animal next to each fox' };
function pvPl(n, one, many) { return n + ' ' + (n === 1 ? one : many); }
function pvDesc(env, a) {   // {n, text}: what the card counts right now
  if (!pvSetA(a)) return { n: 0, text: cinfo(a).title };
  if (a === 'bear') { var n = pvGroups(env, 'bear').filter(function (g) { return g.length === 2; }).length; return { n: n, text: n ? pvPl(n, 'pair', 'pairs') : 'no pairs yet' }; }
  if (a === 'elk') { var i = {}; WM.scoreAnimal(env, 'elk', i, 'a'); var L = (i.lines || []).sort(function (x, y) { return y - x; }); return { n: L[0] || 0, text: L.length ? (L.length === 1 ? 'a line of ' + L[0] : 'lines of ' + L.join(', ')) : 'no elk yet' }; }
  if (a === 'salmon') { var R = pvGroups(env, 'salmon').filter(function (g) { return g.every(function (x) { return WM.nb(x).filter(function (y) { return env[y] && env[y].tok === 'salmon'; }).length <= 2; }); }).map(function (g) { return g.length; }).sort(function (x, y) { return y - x; }); return { n: R[0] || 0, text: R.length ? (R.length === 1 ? 'a run of ' + R[0] : 'runs of ' + R.join(', ')) : 'no runs yet' }; }
  if (a === 'hawk') { var h = {}; WM.scoreAnimal(env, 'hawk', h, 'a'); var m = (h.lit || []).length; return { n: m, text: m ? pvPl(m, 'lone hawk', 'lone hawks') : 'no lone hawks yet' }; }
  var F = Object.keys(env).filter(function (c) { return env[c].tok === 'fox'; }).map(function (c) { var k = {}; WM.nb(c).forEach(function (y) { if (env[y] && env[y].tok) k[env[y].tok] = 1; }); return Object.keys(k).length; });
  return { n: F.reduce(function (x, y) { return x + y; }, 0), text: F.length ? (F.length === 1 ? 'a fox next to ' + pvPl(F[0], 'kind', 'kinds') : F.length + ' foxes next to ' + F.join(' + ') + ' kinds') : 'no foxes yet' };
}
function pvScore(env, acorns) { var s = WM.score(env, acorns || 0, G.cards); s.why = {}; WM.ANI.forEach(function (a) { s.why[a] = pvDesc(env, a); }); return s; }
var PV_ORD = ['', 'first', 'second', 'third', 'fourth', 'fifth'];
function pvAniWhy(a, w0, w1, p0, p1) {   // "makes a second Bear pair (4 -> 11)"
  var arrow = ' (' + p0 + ' → ' + p1 + ')', N = WM.ANI_NAME[a];
  if (!pvSetA(a)) return N + ' card' + arrow;
  if (a === 'bear') return (w1.n > w0.n ? 'makes a ' + (PV_ORD[w1.n] || w1.n + 'th') + ' Bear pair' : 'breaks a Bear pair (a third bear spoils it)') + arrow;
  if (a === 'elk') return (p1 > p0 ? 'Elk ' + w1.text.replace(/^a /, '') : 'Elk lines split') + arrow;
  if (a === 'salmon') return (p1 > p0 ? 'Salmon ' + w1.text.replace(/^a /, '') : 'Salmon run broken (a salmon touches 3)') + arrow;
  if (a === 'hawk') return (p1 > p0 ? pvPl(w1.n, 'lone Hawk', 'lone Hawks') : 'a Hawk is no longer alone') + arrow;
  return (p1 > p0 ? 'Fox sees a new kind of animal' : 'Fox loses a neighbour') + arrow;
}
// the parts of a score change, biggest first: [{d, a|t, why}]
function pvParts(s0, s1) {
  var p = [];
  WM.ANI.forEach(function (a) { var d = s1.ani[a] - s0.ani[a]; if (d) p.push({ d: d, a: a, why: s0.why && s1.why ? pvAniWhy(a, s0.why[a], s1.why[a], s0.ani[a], s1.ani[a]) : WM.ANI_NAME[a] }); });
  WM.TER.forEach(function (t) { var d = s1.hab[t] - s0.hab[t]; if (d) p.push({ d: d, t: t, why: (d > 0 ? WM.TER_NAME[t].toLowerCase() + ' grows to ' + s1.hab[t] : 'largest ' + WM.TER_NAME[t].toLowerCase() + ' ' + s1.hab[t]) }); });
  return p.sort(function (x, y) { return Math.abs(y.d) - Math.abs(x.d); }).map(function (x) { var sg = (x.d > 0 ? '+' : '') + x.d; x.label = / \(\d+ \u2192 \d+\)$/.test(x.why) ? x.why.replace(/\)$/, ' points, ' + sg + ')') : x.why + ' (' + sg + ')'; return x; });
}
// one card in words: "Bears: you have 2 pairs = 11 points (pairs 1, 2, 3, 4 = 4, 11, 19, 27)"
function pvCardLine(a, seat) {
  var s = G.seats[seat], w = pvDesc(s.env, a), v = WM.scoreAnimal(s.env, a, null, G.cards && G.cards[a]), who = seat === meSeat() ? 'you have' : s.name + ' has';
  return ({ bear: 'Bears', elk: 'Elk', salmon: 'Salmon', hawk: 'Hawks', fox: 'Foxes' })[a] + ': ' + who + ' ' + w.text + ' = ' + pvPl(v, 'point', 'points') + (pvSetA(a) ? ' (' + PV_TABLE[a] + ')' : ' (' + cinfo(a).rule + ')');
}
var PV_SHORT = { bear: 'Bear pair', elk: 'Elk line', salmon: 'Salmon run', hawk: 'lone Hawk', fox: 'Fox neighbours' };
function pvPop(p) { if (hintsOn()) return pvText(p); return p.slice(0, 2).map(function (x) { return (x.d > 0 ? '+' : '') + x.d + ' ' + (x.a ? (pvSetA(x.a) ? PV_SHORT[x.a] : WM.ANI_NAME[x.a]) : x.t ? WM.TER_NAME[x.t].toLowerCase() : 'acorn'); }).join(', '); }
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
  if (x.key) p.push({ d: 1, label: 'keystone acorn, 1 point at the end (+1)' });
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
// the move rating runs one task later on a snapshot (it can plan the best move: a long task on slow phones); it only reads the
// state and writes PV.turn, which is read when the turn ends
function pvTurnStart(m) {
  if (!G || G.seats[G.cur].ai) return; UI.rivalMsg = null;
  var snap = WM.clone(G), mm = Object.assign({}, m);
  setTimeout(function () { var live = G; G = snap; try { pvTurnRate(mm); } catch (e) { } finally { G = live; } }, 0);
}
function pvTurnRate(m) {
  var v = pvMarket().slice(), b = pvBestCol(v), s = G.seats[G.cur], sol = -1;
  if (hintsOn()) try { var pl = WM.AI.plan(WM.clone(G), 'hard'); sol = pl.pick.t === 'take' ? pl.pick.i : pl.pick.ti; } catch (e) { }   // only the Hints verdict uses it (a long task on slow phones)
  var ci = m.t === 'take' ? m.i : m.ti;
  var names = G.market.toks.map(function (k) { return k ? WM.ANI_NAME[k] : ''; });
  UI.rivalMsg = null;
  PV.turn = { v: v, best: b >= 0 ? v[b] : 0, bestI: b, sol: sol, chosen: ci, s0: pvScore(s.env), ac0: s.acorns + (m.t === 'free' ? 1 : 0), seat: G.cur, names: names };
}
function pvColName(i) { var t = G.market.tiles[i], k = G.market.toks[i]; return 'column ' + (i + 1) + (k ? ' (' + WM.ANI_NAME[k] + ')' : ''); }
function pvTurnEnd() {
  var T = PV.turn; PV.turn = null; if (!T) return null;
  var s = G.seats[T.seat], s1 = pvScore(s.env), p = pvParts(T.s0, s1);
  if (s.acorns > T.ac0) p.push({ d: s.acorns - T.ac0, label: 'keystone acorn (+' + (s.acorns - T.ac0) + ')' });
  var got = pvSum(p), best = Math.max(T.best, got), col = function (i) { return 'the ' + T.names[i] + ' column'; };
  var why = p.length ? pvText(p) : 'nothing scored';
  var tag = got >= best - 0.5 ? 'good' : got >= best - 2 || got >= best * 0.6 ? 'okay' : 'poor';
  var alt = T.bestI >= 0 && T.bestI !== T.chosen ? ' Best was ' + col(T.bestI) + ' for up to +' + T.best + '.' : '';
  var hint = T.sol >= 0 && T.sol !== T.chosen && T.sol !== T.bestI ? ' The hint liked ' + col(T.sol) + ' for later turns.' : '';
  var pts = got > 0 ? '+' + got : got < 0 ? String(got) : 'No points';
  var verdict = tag === 'good' ? 'Good move' + (got > 0 ? ': the best this turn.' : ': nothing scored more.') : (tag === 'okay' ? 'Okay move.' : 'Poor move.') + alt + hint;
  var text = pts + ' this turn' + (p.length ? ': ' + why : '') + '. ' + verdict;
  UI.verdict = { tag: tag, text: text };
  if (window.GXH && GXH.log) try { GXH.log(text); } catch (e) { }
  return UI.verdict;
}
function pvVerdictHTML() { var v = UI.verdict; if (!v || !G || G.over) return ''; return '<div id="verdict" class="vd ' + v.tag + '" role="status"><b>' + (v.tag === 'good' ? '&#9733;' : v.tag === 'okay' ? '&#9679;' : '&#9888;') + '</b><span>' + esc(v.text) + (UI.rivalMsg ? '<em class="rivl">' + esc(UI.rivalMsg) + '</em>' : '') + '</span></div>'; }
// the rival's caption joins the verdict strip (one message box at a time, no toast); cleared when you pick
function rivalNote(t) { UI.rivalMsg = t; }
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
  if (!hintsOn()) { e.innerHTML = ''; e.hidden = true; return; }
  if (pv) h = '<div class="vd ' + (pv.d > 0 ? 'good' : pv.d < 0 ? 'poor' : 'okay') + '"><b>' + (pv.d > 0 ? '+' : '') + pv.d + '</b><span>' + esc(pv.what + ': ' + pvText(pv.parts)) + '</span></div>';
  else if (UI.verdict && !G.over && !(myTurn() && G.stage !== 'pick')) h = pvVerdictHTML();
  else if (UI.rivalMsg && !G.over && !myTurn()) h = '<div class="vd okay riv"><span>' + esc(UI.rivalMsg) + '</span></div>';
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

// ---- A7: the one-card Goal before turn 1 of a Play or Story game (never in Learn to play)
function goalShow() {
  if (!G || UI.mode === 'coach' || G.seats[0].done > 0 || UI.fast || /[?&](scn|fast)=/.test(location.search)) return;   // scenario and fast test states start straight on the board
  var e = $('#goal'); if (!e) { e = document.createElement('div'); e.id = 'goal'; $('#board').appendChild(e); }
  var riv = G.np > 1 ? G.seats.filter(function (s, i) { return i !== 0; }).map(function (s) { return s.name; }).join(' and ') : '';
  e.innerHTML = '<div class="gcard" role="dialog" aria-label="Goal"><h2>Goal</h2><p class="g1">' + esc(riv ? 'Have more points than ' + riv + ' after ' + G.turns + ' turns.' : 'Score as many points as you can in ' + G.turns + ' turns.') + '</p><ul>' +
    '<li><b>Animals</b> score by their card: bears in pairs, elk in lines, salmon in runs, lone hawks, foxes next to different animals.</li>' +
    '<li><b>Land</b>: each terrain scores 1 point per tile in your largest joined area' + (riv ? ', +2 if yours is the biggest.' : ', +2 at 7 or more.') + '</li>' +
    '<li><b>Acorns</b> from gold keystone tiles: 1 point each at the end.</li></ul>' +
    '<p class="g2">Each turn: take a tile with its animal, add the tile, place the animal. Tap Scores any time to see why.</p><button type="button" class="big" id="goalGo">Start</button></div>';
  e.hidden = false;
}
document.addEventListener('pointerdown', function (ev) { var e = $('#goal'); if (!e || e.hidden) return; if (ev.target.closest && ev.target.closest('.gcard') && ev.target.id !== 'goalGo') return; e.hidden = true; }, true);   // never blocks: any tap outside the card (or Start) closes it and still acts
document.addEventListener('click', function (ev) { var b = ev.target.closest && ev.target.closest('#hintsB'); if (!b) return; UI.prefs.hints = !UI.prefs.hints; savePrefs(); sfx('tap'); if (G) { render(); fitView(); } else hintsSync(); });
