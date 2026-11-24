// Meadowfold UI: title + setup, the valley board (SVG, tap a glowing hex), the token pockets, your hand, animal cards (yours + the row),
// the rival's turn played out step by step, scores, rules + every card, results with suns in solo. Board-first, phone portrait first.
var UI = { mode: 'quick', sel: null, view: 0, busy: false, undo: [], tab: 'row', fast: false, cfg: null, prefs: { mute: false }, aiT: null, flash: null, hintMove: null };
var ANIM = true, AIDELAY = 650;
function $(s, r) { return (r || document).querySelector(s); }
function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
var R3 = Math.sqrt(3);

// ---------- sound: soft paper sounds (WebAudio, no files) ----------
var SND = (function () {
  var ac = null;
  function vol() { if (UI.prefs.mute) return 0; try { var p = GX.pref ? GX.pref() : {}; return (p.master == null ? 1 : p.master) * (p.sfx == null ? .8 : p.sfx); } catch (e) { return .8; } }
  function ctx() { if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { } } if (ac && ac.state === 'suspended') ac.resume(); return ac; }
  function rustle(t0, len, f, g) { var a = ctx(); if (!a) return; var n = a.createBuffer(1, Math.floor(a.sampleRate * len), a.sampleRate), d = n.getChannelData(0); for (var i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2); var s = a.createBufferSource(); s.buffer = n; var bp = a.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = f; bp.Q.value = 1.2; var gn = a.createGain(); gn.gain.value = g * vol(); s.connect(bp); bp.connect(gn); gn.connect(a.destination); s.start(a.currentTime + t0); }
  function tone(t0, f, len, g) { var a = ctx(); if (!a) return; var o = a.createOscillator(), gn = a.createGain(); o.type = 'triangle'; o.frequency.value = f; gn.gain.setValueAtTime(0, a.currentTime + t0); gn.gain.linearRampToValueAtTime(g * vol(), a.currentTime + t0 + .01); gn.gain.exponentialRampToValueAtTime(.0001, a.currentTime + t0 + len); o.connect(gn); gn.connect(a.destination); o.start(a.currentTime + t0); o.stop(a.currentTime + t0 + len + .05); }
  return {
    take: function () { if (!vol()) return; rustle(0, .12, 2400, .5); rustle(.06, .1, 1800, .35); },
    place: function () { if (!vol()) return; rustle(0, .07, 1200, .6); tone(0, 330, .18, .12); },
    card: function () { if (!vol()) return; rustle(0, .18, 3200, .4); },
    animal: function () { if (!vol()) return; tone(0, 523, .35, .16); tone(.09, 659, .35, .14); tone(.18, 784, .5, .12); },
    bad: function () { if (!vol()) return; tone(0, 196, .2, .1); },
    end: function () { if (!vol()) return; [523, 659, 784, 1046].forEach(function (f, i) { tone(i * .12, f, .6, .12); }); }
  };
})();

// ---------- geometry ----------
function hexXY(k, r) { var p = E.cells(G.side).pos[k], c = p[0], row = p[1]; return [r + c * 1.5 * r, r * R3 / 2 + r * R3 * (row + (c & 1 ? .5 : 0))]; }
function boardWH(r) { var cols = MF.BOARDS[G.side]; var maxH = 0; cols.forEach(function (n, c) { maxH = Math.max(maxH, (n + (c & 1 ? .5 : 0))); }); return [r * 2 + (cols.length - 1) * 1.5 * r, r * R3 * maxH]; }

// ---------- new game / flow ----------
function newGame(o) {
  clearTimeout(UI.aiT); o = Object.assign({ np: 2, humans: 1, ai: 'normal', side: 'A', spirits: false }, o || {});
  if (o.seed != null && window.GXS && GXS.seed) GXS.seed(o.seed);
  UI.cfg = o; UI.sel = null; UI.undo = []; UI.busy = false; UI.tab = 'row'; UI.hintMove = null;
  E.newGame(o); UI.view = firstHuman(); hideOverlays(); document.documentElement.classList.add('mf-play');
  render(); save(); nextActor();
  return G;
}
function firstHuman() { for (var i = 0; i < G.np; i++) if (!G.seats[i].ai) return i; return 0; }
function humans() { return G.seats.filter(function (s) { return !s.ai; }).length; }
function hideOverlays() { ['#start', '#rs', '#pass'].forEach(function (s) { var e = $(s); if (e) e.hidden = true; }); try { GX.close(); } catch (e) { } }
function nextActor() {
  if (!G || G.over) { if (G && G.over) setTimeout(showResults, UI.fast ? 0 : 500); return; }
  var s = E.seat();
  if (s.ai) { UI.view = wide() && humans() ? firstHuman() : G.cur; render(); UI.aiT = setTimeout(runAI, UI.fast ? 0 : AIDELAY); return; }
  UI.view = G.cur;
  if (humans() > 1 && !UI.fast && UI.mode !== 'tut') { showPass(); return; }
  render(); if (s.offer) showSpiritPick();
}
function act(m, how) {   // a human move
  if (UI.busy || !G || G.over) return false;
  if (UI.mode === 'tut' && window.tutAllow && !tutAllow(m)) { SND.bad(); return false; }
  var before = JSON.stringify(G), b0 = E.score(E.seat()), sc0 = b0.total, fx = m.t === 'cube' ? cubeInfo(E.seat(), m) : null, me = E.seat(), mi = G.cur;
  if (!E.apply(m)) { SND.bad(); return false; }
  if (fx) UI.justCard = fx.id;
  if (m.t !== 'end') UI.undo.push(before); else UI.undo = [];
  UI.recap = null;
  UI.hintMove = null;
  var s = G.seats[UI.view], gain = G.over ? 0 : E.score(s).total - sc0;
  if (m.t === 'take') { SND.take(); UI.fresh = true; UI.sel = { kind: 'tok', h: 0 }; }
  if (m.t === 'place') { SND.place(); UI.flash = m.k; buzz(8); var T = G.turn; UI.sel = T.hand.length ? { kind: 'tok', h: Math.min(m.h, T.hand.length - 1) } : null; }
  if (m.t === 'card') { SND.card(); UI.tab = 'mine'; if (UI.pp) { UI.pp = null; document.documentElement.removeAttribute('data-pp'); } }
  if (m.t === 'cube') { SND.animal(); UI.flash = m.k; buzz([10, 40, 10]); UI.sel = null; }
  if (m.t === 'spirit') UI.tab = 'mine';
  render();
  if (m.k && !G.over) flyGains(me, mi, m.k, explain(me, b0, E.score(me), m.k, fx ? { name: E.card(fx.id).name.split(' ').pop() } : null), '#map');
  if (fx) settleFx(m.k, fx, me, '#map');
  if (window.tutAfter) tutAfter(m);
  if (m.t === 'end') { UI.sel = null; save(); nextActor(); }
  return true;
}
function undo() { if (!UI.undo.length || UI.busy) return; G = JSON.parse(UI.undo.pop()); UI.sel = G.turn.hand.length ? { kind: 'tok', h: 0 } : null; render(); }
function runAI() {
  if (!G || G.over) return; var s = E.seat(); if (!s.ai) return nextActor();
  UI.busy = true; UI.skip = false; UI.rivalMark = {}; UI.lastAI = G.cur; var si = G.cur, ssel = UI.view === si ? '#map' : '#mini' + si; var plan = AI.plan(s.ai), i = 0, start = E.score(s).total, got = [], sc0all = E.score(s);
  (function stepAI() {
    if (!G || G.over) { UI.busy = false; return nextActor(); }
    if (i >= plan.length) { UI.busy = false; return nextActor(); }
    var m = plan[i++];
    if (!E.legal(m)) { m = { t: 'end' }; if (!E.legal(m)) { var ms = E.moves(); m = ms.find(function (x) { return x.t === 'place'; }) || ms[0]; } }
    var b0 = E.score(s), sc0 = b0.total, fx = m.t === 'cube' ? cubeInfo(s, m) : null; if (m.t === 'end') { UI.busy = true; } E.apply(m);
    if (m.k) UI.rivalMark[m.k] = 1; if (fx) UI.justCard = fx.id;
    if (m.t === 'cube') got.push(E.card(typeof s.cubes[m.k] === 'number' ? s.cubes[m.k] : +String(s.cubes[m.k]).slice(1)).name.split(' ').pop());
    if (m.t === 'end') {
      var d = E.score(s).total - start, sc1 = E.score(s), why = [['animals', 'animals'], ['trees', 'trees'], ['mounts', 'peaks'], ['fields', 'fields'], ['builds', 'buildings'], ['water', G.side === 'A' ? 'river' : 'islands']].map(function (q) { return [q[1], (sc1[q[0]] || 0) - (sc0all[q[0]] || 0)]; }).filter(function (q) { return q[1] > 0; }).sort(function (a, b) { return b[1] - a[1]; }).slice(0, 2);
      UI.recap = s.name + ' +' + d + (why.length ? ': ' + why.map(function (q) { return q[0] + ' +' + q[1]; }).join(', ') : '') + (got.length ? ' (' + got.slice(0, 2).join(', ') + ')' : '') + '.';
      save(); if (!UI.fast) SND.card();
      if (UI.fast || G.over) { UI.busy = false; UI.view = G.over ? UI.view : G.cur; return nextActor(); }
      render(); UI.aiT = setTimeout(function () { UI.busy = false; UI.rivalMark = null; UI.view = G.cur; nextActor(); }, UI.skip ? 1200 : Math.max(2000, AIDELAY * 3.4)); return;
    }
    if (m.t === 'place') { UI.flash = m.k; UI.miniFlash = si; UI.flashK = m.k; SND.place(); }
    if (m.t === 'take') { UI.lastPocket = m.i; SND.take(); }
    if (m.t === 'cube') { UI.flash = m.k; UI.miniFlash = si; UI.flashK = m.k; SND.animal(); }
    if (m.t === 'card') SND.card();
    render(); ssel = UI.view === si ? '#map' : '#mini' + si; if (m.k) flyGains(s, si, m.k, explain(s, b0, E.score(s), m.k, fx ? { name: E.card(fx.id).name.split(' ').pop() } : null), ssel); if (fx) settleFx(m.k, fx, s, ssel);
    UI.aiT = setTimeout(stepAI, UI.fast ? 0 : UI.skip ? 90 : Math.max(380, AIDELAY * (m.t === 'cube' ? 1.4 : 1)));
  })();
}
function buzz(p) { try { if (GX.buzz) GX.buzz(p); } catch (e) { } }

// ---------- rendering ----------
window.addEventListener('resize', function () { if (G) render(); });
function render() {
  if (!G) return;
  renderBar(); renderCentral(); renderEnd(); renderMap(); renderRail(); renderScorep(); renderDock(); renderLine();
  if (window.tutRender) tutRender();
}
function myTurn() { return G && !G.over && !E.seat().ai && UI.view === G.cur && !UI.busy; }
var SEATC = ['#e8907e', '#3f7fb0', '#5d9c58', '#e3b23c'];
function renderBar() {
  var h = '';
  G.seats.forEach(function (s, i) {
    var sc = E.score(s).total;
    var up = UI.lastSc && UI.lastSc[i] != null && sc > UI.lastSc[i];
    h += '<button type="button" class="pill' + (i === G.cur && !G.over ? ' cur' : '') + (i === UI.view ? ' view' : '') + '" data-seat="' + i + '" style="--sc:' + SEATC[i % 4] + '" aria-label="' + esc(s.name) + ' ' + sc + ' points"><i class="stab" aria-hidden="true"></i><span>' + esc(s.name) + '</span><b class="badge' + (up ? ' tick' : '') + '" data-engine="E.score(G.seats[' + i + ']).total">' + sc + '</b></button>';
  });
  UI.lastSc = G.seats.map(function (s) { return E.score(s).total; });
  $('#barstat').innerHTML = h;
}

// ---------- panels: info the player opens, reads while deciding and closes (X, tap outside, Esc). Nothing closes by itself. ----------
UI.pp = null;
function openPanel(id, tab) {
  if (tab) UI.tab = tab;
  UI.pp = id; if (id === 'dock') renderDock(); if (id === 'scorep') renderScorep();
  document.documentElement.setAttribute('data-pp', id); syncPanels();
}
function closePanel() { if (!UI.pp) return; UI.pp = null; document.documentElement.removeAttribute('data-pp'); syncPanels(); if (G) render(); }
function syncPanels() {
  ['dock', 'scorep'].forEach(function (id) { var e = document.getElementById(id); if (e) e.classList.toggle('on', UI.pp === id); });
  $$('#rail [data-pp]').forEach(function (b) { var on = UI.pp === (b.dataset.pp === 'score' ? 'scorep' : 'dock') && (b.dataset.pp === 'score' || UI.tab === b.dataset.pp); b.classList.toggle('on', on); b.setAttribute('aria-expanded', on ? 'true' : 'false'); });
  var t = $('#ppt'); if (t) t.textContent = UI.tab === 'mine' ? 'My animal cards' : 'Animals to invite';
}
function renderRail() {
  if (!G) return; var s = G.seats[firstHuman()], act = s.cards.length + (s.spirit && !s.spirit.placed ? 1 : 0), cs = E.seat();
  var ready = !s.ai && (s.cards.some(function (c) { return Object.keys(E.cubeSpots(s, c.id)).length; }) || (s.spirit && !s.spirit.placed && Object.keys(E.cubeSpots(s, s.spirit.id)).length > 0));
  var canTake = myTurn() && !G.turn.tookCard && !G.turn.swapped && E.active(cs) < 4;
  var rr = $('#railRow svg'); if (rr && G.row.length) { var an = E.card(G.row[0]).an; if (rr.dataset.an !== an) { rr.dataset.an = an; rr.setAttribute('viewBox', '0 0 30 30'); rr.setAttribute('class', 'an'); rr.innerHTML = ART.defs('rr') + ART.animal(an, 15, 15, 27, '#7a5a44', 'rr'); } }
  var a = $('#bdRow'), b = $('#bdMine');
  if (a) { a.textContent = canTake ? '1' : ''; a.hidden = !canTake; }
  if (b) { var go = ready && myTurn(); b.textContent = go ? '!' : act + '/4'; b.className = 'bd' + (go ? ' go' : ''); b.hidden = !act && !go; }
  syncPanels();
}
function ladder(a) { return a.map(function (x) { return '<span class="lad"><b>' + x[0] + '</b>' + x[1] + '</span>'; }).join(''); }
function renderScorep() {
  var b = $('#scorebody'); if (!b || !G || UI.pp !== 'scorep') return;
  var me = firstHuman(), foe = G.np > 1 ? chipFoe() : -1, A = E.score(G.seats[me]), B = foe >= 0 ? E.score(G.seats[foe]) : null, ei = endInfo();
  var rows = {
    trees: ['A tree is leaves on 0-2 trunks.', ladder([['1 high', '1'], ['2 high', '3'], ['3 high', '7']]) + '<em>Bare trunks score 0.</em>'],
    mounts: ['Grey tokens stack up to 3.', ladder([['1 high', '1'], ['2 high', '3'], ['3 high', '7']]) + '<em>Only when touching another mountain.</em>'],
    fields: ['Yellow fields never stack.', ladder([['group of 2+', '5']]) + '<em>A lone field scores 0.</em>'],
    builds: ['A red building sits on one grey, trunk or red.', ladder([['3+ colours touch it', '5']])],
    water: G.side === 'A' ? ['Blue water: your longest river counts.', ladder([['2', '2'], ['3', '5'], ['4', '8'], ['5', '11'], ['6', '15'], ['+1', '+4']])] : ['Water splits your valley into islands.', ladder([['each island', '5']]) + '<em>Empty hexes count as land.</em>'],
    animals: ['Each animal card scores its highest number showing.', '<em>Settle animals to uncover bigger numbers.</em>'],
    spirit: ['Your spirit card scores its own bonus once settled.', '<em>See it under My cards.</em>']
  };
  var h = '<div class="endbox ' + (ei && ei.last ? 'last' : '') + '"><h3>When the game ends</h3><p>' + (ei ? esc(ei.t) + ' ' : '') + 'It ends when the pouch cannot refill a pocket, or a player finishes a turn with 2 or fewer empty hexes. The round always finishes, so turns stay equal.</p></div>';
  h += '<table class="sctab"><tr><th></th><th></th><th class="n">You</th>' + (B ? '<th class="n">' + esc(G.seats[foe].name) + '</th>' : '') + '</tr>';
  cats().forEach(function (c) { var r = rows[c[0]]; h += '<tr><td class="ic">' + catIcon(c, 'sp' + c[0]) + '</td><td><b>' + c[1] + '</b><div class="sl">' + r[0] + '</div><div class="sd">' + r[1] + '</div></td><td class="n">' + A[c[0]] + '</td>' + (B ? '<td class="n foe">' + B[c[0]] + '</td>' : '') + '</tr>'; });
  h += '<tr class="tot"><td></td><td><b>Total</b></td><td class="n">' + A.total + '</td>' + (B ? '<td class="n foe">' + B.total + '</td>' : '') + '</tr></table>';
  b.innerHTML = h;
}
function renderCentral() {
  if (myTurn() && G.turn.took >= 0) return renderHand();
  var T = G.turn, can = myTurn() && T.took < 0 && !E.seat().offer, h = '';
  G.central.forEach(function (sp, i) {
    var can1 = can && (UI.mode !== 'tut' || !window.tutAllow || tutAllow({ t: 'take', i: i }));
    var taken = (T.took === i), hint = UI.hintMove && UI.hintMove.t === 'take' && UI.hintMove.i === i;
    h += '<button type="button" class="pocket' + (can1 && sp.length ? ' glow' : '') + (taken ? ' taken' : '') + (hint ? ' hint' : '') + '" data-pocket="' + i + '"' + (can1 && sp.length ? '' : ' disabled') + ' aria-label="Pocket ' + (i + 1) + ': ' + sp.map(function (c) { return ART.NAME[c]; }).join(', ') + '">' +
      '<svg viewBox="0 0 46 42" aria-hidden="true">' + ART.defs('c' + i) + sp.map(function (c, j) { var xy = [[12, 29], [34, 29], [23, 12]][j]; return ART.token(c, xy[0], xy[1], 10.5, 'c' + i); }).join('') + '</svg></button>';
  });
  h += '<span class="pouch" title="Tokens left in the pouch"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4h6l-1.5 3h-3zM7.5 8.5C4 11 3.5 20 12 20s8-9 4.5-11.5z"/></svg><b>' + E.bagCount() + '</b> left</span>';
  $('#central').innerHTML = h;
}
function wide() { return false; }   // one layout everywhere: the board is the screen, info lives in panels
// one valley drawing for the big board and the small rival boards. o: glow{k:1|2}, gain{k:n}, ghost, hint, plan{k:label}, marks{k:1}, f (filter id prefix)
function valleySVG(s, o) {
  o = o || {}; var r = 40, wh = boardWH(r), pad = 12, f = o.f || 'm', glow = o.glow || {}, gain = o.gain || {}, plan = o.plan || {}, hp = o.hint;
  var W = wh[0] + pad * 2, H = wh[1] + pad * 2 + 4, C = E.cells(G.side);
  var h = ART.defs(f);
  h += '<g filter="url(#' + f + 'sh2)">' + C.list.map(function (k) { var xy = hexXY(k, r); return '<polygon points="' + ART.hexPts(xy[0], xy[1] + 4, r + 9) + '" fill="#bfe0b1"/>'; }).join('') + '</g>';
  h += '<g>' + C.list.map(function (k) { var xy = hexXY(k, r); return '<polygon points="' + ART.hexPts(xy[0], xy[1], r + 5) + '" fill="#d7ecc9"/>'; }).join('') + '</g>';
  C.list.slice().sort(function (a, b) { return hexXY(a, r)[1] - hexXY(b, r)[1]; }).forEach(function (k) {
    var xy = hexXY(k, r), st = s.board[k] || [], g = glow[k], cls = 'hx' + (g ? (o.still ? ' fitk' : ' glow') + (g === 2 ? ' home' : '') : '') + (o.flash === k ? ' pop' : '') + (hp && hp.k === k ? ' hint' : '') + (plan[k] ? ' plan' : '');
    h += '<g class="' + cls + '"' + (o.still ? '' : ' data-k="' + k + '"') + (g && !o.still ? ' data-legal="1"' : '') + '>';
    h += '<polygon points="' + ART.hexPts(xy[0], xy[1], r - 1.5) + '" class="cell" filter="url(#' + f + 'sh)"/>';
    h += ART.terrain(st, xy[0], xy[1], r, f);
    if (o.marks && o.marks[k]) h += '<polygon points="' + ART.hexPts(xy[0], ART.topY(st, xy[1], r), r - 6) + '" class="rmark"/>';
    if (s.cubes[k]) { var cv = s.cubes[k], an = typeof cv === 'number' ? E.card(cv).an : E.card(+String(cv).slice(1)).an; h += '<g class="cub">' + ART.cube(an, xy[0], ART.topY(st, xy[1], r) + r * .02, r * .82, typeof cv === 'number' ? '#fdf8ee' : '#f1e3ff', f) + '</g>'; }
    if (g) h += '<polygon points="' + ART.hexPts(xy[0], xy[1], r - 4) + '" class="ring"/>';
    if (plan[k]) h += '<polygon points="' + ART.hexPts(xy[0], xy[1], r - 4) + '" class="pring"/><g class="plab"><rect x="' + (xy[0] - Math.max(25, plan[k].length * 3.6)) + '" y="' + (xy[1] + r * .3) + '" width="' + Math.max(50, plan[k].length * 7.2) + '" height="19" rx="9.5"/><text x="' + xy[0] + '" y="' + (xy[1] + r * .3 + 14) + '">' + esc(plan[k]) + '</text></g>';
    if (g && gain[k]) h += '<g class="gain"><rect x="' + (xy[0] - 15) + '" y="' + (xy[1] + r * .38) + '" width="30" height="18" rx="9"/><text x="' + xy[0] + '" y="' + (xy[1] + r * .38 + 13.5) + '">' + (gain[k] > 0 ? '+' : '') + gain[k] + '</text></g>';
    if (g === 1 && o.tok) h += '<g class="ghost pv">' + ART.token(o.tok, xy[0], ART.topY(st, xy[1], r) - r * .1, r * .42, f) + '</g>';
    if (g === 2 && o.ghost) h += '<g class="ghost">' + ART.animal(o.ghost, xy[0], ART.topY(st, xy[1], r) - r * .05, r * .62, '#6b4e3a', f) + '</g>';
    h += '</g>';
  });
  return { vb: (-pad) + ' ' + (-pad) + ' ' + W + ' ' + H, html: h };
}
function renderMap() {
  var s = G.seats[UI.view], svg = $('#map');
  var mine = myTurn() && UI.view === G.cur, sel = UI.sel, glow = {}, ghost = null, plan = null;
  if (mine && sel && sel.kind === 'tok' && G.turn.hand[sel.h]) E.spots(s, G.turn.hand[sel.h]).forEach(function (k) { if (UI.mode !== 'tut' || !window.tutAllow || tutAllow({ t: 'place', h: sel.h, k: k })) glow[k] = 1; });
  if (mine && sel && sel.kind === 'card') { var id = sel.ci === 'S' ? s.spirit.id : (s.cards[sel.ci] || {}).id; if (id) { ghost = E.card(id).an; Object.keys(E.cubeSpots(s, id)).forEach(function (k) { glow[k] = 2; }); if (!Object.keys(glow).length) { var pl = planFor(s, id); if (pl) plan = pl.labels; } } }
  var gain = {}, base = (mine && sel) ? E.score(s).total : 0;
  if (mine && sel && Object.keys(glow).length) Object.keys(glow).forEach(function (k) {
    var c = JSON.parse(JSON.stringify({ board: s.board, cubes: s.cubes, cards: s.cards, done: s.done, spirit: s.spirit }));
    if (glow[k] === 1) (c.board[k] = c.board[k] || []).push(G.turn.hand[sel.h]);
    else if (sel.ci === 'S') { c.cubes[k] = 'S'; c.spirit.placed = true; } else { c.cubes[k] = 1; c.cards[sel.ci].left--; }
    gain[k] = E.score(c).total - base;
  });
  var v = valleySVG(s, { glow: glow, gain: gain, ghost: ghost, tok: mine && sel && sel.kind === 'tok' ? G.turn.hand[sel.h] : null, hint: UI.hintMove, plan: plan, marks: G.seats[UI.view].ai || UI.view !== firstHuman() ? UI.rivalMark : null, flash: UI.flash, f: 'm' });
  svg.setAttribute('viewBox', v.vb); svg.innerHTML = v.html; UI.flash = null;
  svg.setAttribute('aria-label', (UI.view === firstHuman() && !s.ai ? 'Your' : s.name + '\'s') + ' valley');
  var vb = $('#vbanner'), other = UI.view !== firstHuman() && humans() === 1;
  vb.hidden = !other || G.over;
  if (other) vb.innerHTML = '<b>' + esc(s.name) + '\'s valley</b><span>' + E.score(s).total + ' pts</span>' + (UI.busy || s === E.seat() && s.ai ? '<em>playing now</em>' : '<button type="button" class="btn" id="backB">Back to mine</button>');
}
// the small boards beside yours on a PC: every rival, live, with its score chips and cards
function renderRivals() {
  var p = $('#rivalp'); if (!p || !wide()) return;
  var h = '';
  G.seats.forEach(function (s, i) {
    if (i === UI.view) return;
    var playing = i === G.cur && !G.over && (UI.busy || s.ai);
    var v = valleySVG(s, { marks: playing || (UI.recap && UI.rivalMark && i === UI.lastAI) ? UI.rivalMark : null, flash: i === UI.miniFlash ? UI.flashK : null, f: 'r' + i, still: true });
    h += '<section class="rv1' + (playing ? ' on' : '') + '" data-rv="' + i + '"><div class="rvh"><b>' + esc(s.name) + (s.name === 'You' ? '' : '\'s valley') + '</b><span class="rvs">' + E.score(s).total + '</span>' + (playing ? '<em>playing</em>' : '') + '</div>' +
      '<svg class="mini" id="mini' + i + '" viewBox="' + v.vb + '" role="img" aria-label="' + esc(s.name) + ' valley">' + v.html + '</svg>' +
      chipRow(s, i, 'rvc') + '<div class="rvcards">' + (s.spirit && !s.spirit.placed ? cardHTML(s.spirit.id, { attr: 'data-rc="' + i + ':S"' }) : '') + s.cards.map(function (c, j) { return cardHTML(c.id, { attr: 'data-rc="' + i + ':' + j + '"', left: c.left }); }).join('') + (s.cards.length ? '' : '<span class="hn">No animal cards yet.</span>') + '</div>' +
      (s.done.length ? '<span class="donec">' + s.done.length + ' card' + (s.done.length > 1 ? 's' : '') + ' finished</span>' : '') + '</section>';
  });
  p.innerHTML = h; UI.miniFlash = null;
}
// ---------- score chips: every landscape for you and a rival, always on screen ----------
var CATS = [['trees', 'Trees', 'leaf'], ['mounts', 'Mountains', 'mount'], ['fields', 'Fields', 'field'], ['builds', 'Buildings', 'build'], ['water', 'River', 'water'], ['animals', 'Animals', 'an'], ['spirit', 'Spirit', 'sp']];
function cats() { return CATS.filter(function (c) { return c[0] !== 'spirit' || G.spirits; }).map(function (c) { return c[0] === 'water' && G.side === 'B' ? ['water', 'Islands', 'water'] : c; }); }
function catIcon(c, f) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + (c[2] === 'an' ? ART.animal('fox', 12, 12, 20, '#7a5a44', f) : c[2] === 'sp' ? ART.animal('lion', 12, 12, 20, '#7b5aa8', f) : ART.defs(f) + ART.token(c[2], 12, 12, 10, f)) + '</svg>'; }
function chipRow(s, i, cls) { var sc = E.score(s); return '<div class="' + cls + '">' + cats().map(function (c) { return '<span class="chip1" data-chip="' + c[0] + '" data-cs="' + i + '" title="' + c[1] + '">' + catIcon(c, 'q' + i + c[0]) + '<b>' + sc[c[0]] + '</b></span>'; }).join('') + '</div>'; }
function chipFoe() { var me = firstHuman(); if (UI.view !== me) return UI.view; var best = -1, bv = -1; G.seats.forEach(function (s, i) { if (i === me) return; var v = E.score(s).total; if (v > bv) { bv = v; best = i; } }); return best; }
function renderChips() {
  var me = firstHuman(), foe = G.np > 1 ? chipFoe() : -1, a = E.score(G.seats[me]), b = foe >= 0 ? E.score(G.seats[foe]) : null;
  var h = '<div class="clg"><span class="lme">' + (humans() > 1 ? esc(G.seats[me].name) : 'You') + '</span>' + (b ? '<span class="lfoe">' + esc(G.seats[foe].name) + '</span>' : '') + '</div>';
  cats().forEach(function (c) { h += '<span class="chip" data-chip="' + c[0] + '" title="' + c[1] + '">' + catIcon(c, 'c' + c[0]) + '<span class="cv"><b data-cs="' + me + '">' + a[c[0]] + '</b>' + (b ? '<i data-cs="' + foe + '">' + b[c[0]] + '</i>' : '') + '</span></span>'; });
  $('#chips').innerHTML = h;
}
// why a score changed: one short reason per landscape
function explain(s, b0, b1, k, mv) {
  var out = [], st = k ? (s.board[k] || []) : [], hgt = st.length, nm = function (c) { return c[1].toLowerCase(); };
  cats().forEach(function (c) {
    var d = (b1[c[0]] || 0) - (b0[c[0]] || 0); if (!d) return;
    var why = '';
    if (c[0] === 'trees') why = st[hgt - 1] === 'leaf' ? 'tree ' + hgt + ' tall' : 'taller tree';
    if (c[0] === 'mounts') why = d > 0 ? 'peaks touching' : 'peak changed';
    if (c[0] === 'fields') why = d > 0 ? 'a group of 2+' : 'two groups joined';
    if (c[0] === 'builds') why = '3 colours touch it';
    if (c[0] === 'water') why = G.side === 'A' ? 'river ' + b1.river + ' long' : b1.islands + ' island' + (b1.islands > 1 ? 's' : '');
    if (c[0] === 'animals') why = (mv && mv.name ? mv.name + ' moved in' : 'animal moved in');
    if (c[0] === 'spirit') why = 'spirit bonus';
    out.push({ c: c[0], d: d, why: why, label: c[1] });
  });
  return out;
}
// "+N trees: tree 3 tall" flies from the hex into its chip
function flyGains(s, si, k, ex, svgSel) {
  if (!ex.length) return;
  var big = ex.slice().sort(function (x, y) { return Math.abs(y.d) - Math.abs(x.d); })[0], who = s.ai || humans() > 1 ? s.name + ' ' : '';
  var w = $('#whyl'); w.textContent = who + (big.d > 0 ? '+' : '') + big.d + ' ' + big.label.toLowerCase() + ': ' + big.why + (ex.length > 1 && wide() ? ' (' + ex.filter(function (e) { return e !== big; }).map(function (e) { return (e.d > 0 ? '+' : '') + e.d + ' ' + e.label.toLowerCase(); }).join(', ') + ')' : '');
  w.classList.remove('on'); void w.offsetWidth; w.classList.add('on'); w.classList.toggle('rv', !!s.ai);
  if (!ANIM || UI.fast) return;
  var p = k ? hexScreen(k, svgSel) : null;
  ex.forEach(function (e, j) {
    var tgt = $('.pill[data-seat="' + si + '"] b');
    if (!tgt) return; var tb = tgt.getBoundingClientRect(); if (!tb.width) return;
    var d = document.createElement('div'); d.className = 'flyn' + (e.d < 0 ? ' neg' : '') + (s.ai ? ' rv' : ''); d.textContent = (e.d > 0 ? '+' : '') + e.d;
    var sx = p ? p[0] : tb.left + tb.width / 2, sy = p ? p[1] - 10 : tb.top - 30;
    d.style.left = sx + 'px'; d.style.top = sy + 'px'; d.style.setProperty('--dx', (tb.left + tb.width / 2 - sx) + 'px'); d.style.setProperty('--dy', (tb.top + tb.height / 2 - sy) + 'px'); d.style.animationDelay = (j * 120) + 'ms';
    document.body.appendChild(d);
    setTimeout(function () { d.remove(); var c2 = null; [c2, tgt].forEach(function (x) { if (!x) return; x.classList.remove('bumpc'); void x.offsetWidth; x.classList.add('bumpc'); }); }, 900 + j * 120);
  });
}
// ---------- planning: how far a card is from your valley ----------
function needFor(st, n, cube) {   // tokens to add so this hex shows n, or null if it can't any more
  var h = st.length;
  if (E.shows(st, n)) return [];
  if (cube) return null;
  if (n === 'water' || n === 'field') return h ? null : [n];
  if (n.indexOf('mount') === 0) { var N = +n[5]; return st.every(function (x) { return x === 'mount'; }) && h < N ? Array(N - h).fill('mount') : null; }
  if (n.indexOf('tree') === 0) { var T = +n[4]; if (!st.every(function (x) { return x === 'trunk'; }) || h > T - 1) return null; var a = Array(T - 1 - h).fill('trunk'); a.push('leaf'); return a; }
  if (n === 'build') { if (!h) return ['mount', 'build']; if (h === 1 && /mount|trunk|build/.test(st[0])) return ['build']; return null; }
  return null;
}
function planFor(s, id) {   // cheapest way to build this card's habitat on s: {cost, labels{k:'+1 grey'}, add{colour:n}}
  var pat = E.card(id).pat, C = E.cells(G.side), best = null;
  C.list.forEach(function (o) {
    for (var rot = 0; rot < 6; rot++) {
      var k = o, cost = 0, ok = true, adds = {};
      for (var i = 0; i < pat.length; i++) {
        if (i) { k = E.step(G.side, k, pat[i].d + rot); if (!k) { ok = false; break; } }
        var nd = needFor(s.board[k] || [], pat[i].n, !!s.cubes[k] && !(pat[i].cube && false));
        if (pat[i].cube && s.cubes[k]) nd = null;
        if (!nd) { ok = false; break; }
        if (nd.length) { adds[k] = nd; cost += nd.length; }
      }
      if (ok && (!best || cost < best.cost)) best = { cost: cost, adds: adds };
    }
  });
  if (!best) return null;
  var labels = {}, tot = {};
  Object.keys(best.adds).forEach(function (k) { var c = {}; best.adds[k].forEach(function (x) { c[x] = (c[x] || 0) + 1; tot[x] = (tot[x] || 0) + 1; }); labels[k] = Object.keys(c).map(function (x) { return '+' + (c[x] > 1 ? c[x] : '') + SHORT[x]; }).join(' '); });
  return { cost: best.cost, labels: labels, tot: tot };
}
var SHORT = { water: 'water', mount: 'grey', trunk: 'trunk', leaf: 'leaf', field: 'field', build: 'red' };
function planText(pl) { return Object.keys(pl.tot).map(function (x) { return pl.tot[x] + ' ' + (pl.tot[x] > 1 ? PLURAL[x] : ONE[x]); }).join(', '); }
var ONE = { water: 'water', mount: 'mountain', trunk: 'trunk', leaf: 'leaf', field: 'field', build: 'building' };
var PLURAL = { water: 'water', mount: 'mountains', trunk: 'trunks', leaf: 'leaves', field: 'fields', build: 'buildings' };
function turnsLeft(s) {   // rough turns before this valley or the pouch ends the game
  var e = E.empties(s), v = e <= 2 ? 0 : Math.ceil((e - 2) / 3), p = Math.floor(E.bagCount() / (G.solo ? 9 : 3) / Math.max(1, G.np)) + 1;
  return Math.min(v, p);
}
function endInfo() {   // the countdown line, or null while the end is far
  if (G.over || G.np < 1) return null;
  if (G.last) { var fin = E.seat(); return { last: true, t: 'Last round! ' + (fin.ai ? fin.name + ' plays its final turn.' : 'This is your final turn.') }; }
  var bi = -1, bt = 99, be = 0; G.seats.forEach(function (s, i) { var e = E.empties(s), t = e <= 2 ? 0 : Math.ceil((e - 2) / 3); if (t < bt) { bt = t; bi = i; be = e; } });
  var pt = Math.floor(E.bagCount() / (G.solo ? 9 : 3) / Math.max(1, G.np)) + 1;
  if (pt < bt && pt <= 3) return { t: 'Pouch almost empty: about ' + pt + ' turn' + (pt > 1 ? 's' : '') + ' left.' };
  if (bt > 3) return null;
  var who = G.seats[bi], nm = who.ai || humans() > 1 ? who.name + ' has' : 'you have';
  return { t: (bt <= 1 ? 'Could end next turn' : '~' + bt + ' turns left') + ': ' + nm + ' ' + be + ' empty hexes. End at 2.' };
}
function renderEnd() { var e = $('#endw'), i = endInfo(); e.hidden = !i; if (i) { var c = i.t.indexOf(':'); e.innerHTML = c < 0 ? esc(i.t) : '<b>' + esc(i.t.slice(0, c)) + '</b><span class="ed">' + esc(i.t.slice(c)) + '</span>'; e.title = i.t; e.classList.toggle('last', !!i.last); } }
function cardSVG(id, left, big) {
  var c = E.card(id), pat = c.pat, rr = big ? 15 : 9.5, pts = [], q = 0, ar = 0;
  pat.forEach(function (p, i) { if (i) { var d = E.DIRS[p.d]; q += d[0]; ar += d[1]; } pts.push([1.5 * q * rr, R3 * (ar + q / 2) * rr, p]); });
  var minx = 1e9, maxx = -1e9, miny = 1e9, maxy = -1e9; pts.forEach(function (p) { minx = Math.min(minx, p[0]); maxx = Math.max(maxx, p[0]); miny = Math.min(miny, p[1]); maxy = Math.max(maxy, p[1]); });
  var w = maxx - minx + rr * 2.1, h = maxy - miny + rr * 2.3, f = 'k' + id + (big ? 'b' : ''), o = '<svg class="pat" viewBox="' + (minx - rr * 1.05) + ' ' + (miny - rr * 1.35) + ' ' + w + ' ' + h + '" aria-hidden="true">' + ART.defs(f);
  pts.sort(function (a, b) { return a[1] - b[1]; }).forEach(function (p) { var st = needStack(p[2].n); o += ART.terrain(st, p[0], p[1], rr, f, !big); if (p[2].cube) { var ty = p[1] - (st.length - 1) * rr * (big ? .17 : .2); o += '<circle cx="' + p[0] + '" cy="' + ty + '" r="' + rr * .46 + '" fill="#fffaf0" fill-opacity=".9" stroke="#7b5aa8" stroke-width="' + rr * .12 + '" stroke-dasharray="' + rr * .2 + ' ' + rr * .12 + '"/>'; } });
  if (!big) o = o.replace(/<text[^>]*class="hnum"[^>]*>\d<\/text>/g, '');
  return o + '</svg>';
}
function needStack(n) { if (n === 'water' || n === 'field') return [n]; if (n === 'build') return ['mount', 'build']; if (n.indexOf('mount') === 0) return Array(+n[5]).fill('mount'); var h = +n[4], a = Array(h - 1).fill('trunk'); a.push('leaf'); return a; }
function trackHTML(id, left) {
  var c = E.card(id); if (!c.pts) return '<div class="track sp">' + spiritText(c.sc) + '</div>';
  var n = c.pts.length - (left == null ? c.pts.length : left), h = '<div class="track">';
  c.pts.forEach(function (v, i) { h += '<span class="slot' + (i < n ? ' open' : '') + (i === n - 1 ? ' now' : '') + '">' + (i < n ? v : '<i>' + v + '</i>') + '</span>'; });
  return h + '</div>';
}
function spiritText(k) { return { fieldsBig: 'Fields: 2 each, 10 if 3+', fieldsAll: 'Every field group: 5', trees23: 'Trees 2-3 high: +4 each', trees331: 'Trees: 3 / 3 / 1 by height', buildGroups: 'Building groups: +4 each', buildGroups2: 'Groups of 2+ buildings: +6', mount23: 'Peaks 2-3 high: +4 each', mount331: 'Peaks: 3 / 3 / 1 by height', waterGroups: 'Water groups of 2+: +7', waterEach: 'Every water token: +2' }[k]; }
function planBadge(pl) { if (!pl) return '<span class="rdy nob">No room left</span>'; if (!pl.cost) return '<span class="rdy fitb">Fits now</span>'; return '<span class="rdy farb">Needs ' + pl.cost + ' token' + (pl.cost > 1 ? 's' : '') + '</span>'; }
function cardHTML(id, o) {
  o = o || {}; var c = E.card(id);
  return '<button type="button" class="acard' + (c.pts ? '' : ' spirit') + (o.sel ? ' sel' : '') + (o.ready ? ' ready' : '') + (o.hint ? ' hint' : '') + (o.dim ? ' dim' : '') + (o.can || o.ready ? ' playable' : '') + '" ' + (o.attr || '') + ' aria-label="' + esc(c.name) + (o.ready ? ', home ready' : '') + '">' +
    '<span class="ahead"><svg viewBox="0 0 30 30" aria-hidden="true">' + ART.defs('a' + id) + ART.animal(c.an, 15, 15, 24, c.pts ? '#7a5a44' : '#7b5aa8', 'a' + id) + '</svg><span class="nm">' + esc(c.name.replace(/^Spirit of the /, '')) + '</span></span>' +
    cardSVG(id) + trackHTML(id, o.left) + (o.ready ? '<span class="rdy">Home ready</span>' : o.fit ? '<span class="rdy fitb">Fits now</span>' : o.showPlan ? planBadge(o.plan) : '') + '</button>';
}
function renderHand() {
  var T = G.turn, h = '<div class="handrow">' + (T.hand.length > 1 ? '<span class="anyo">Any<br>order</span>' : '');
  T.hand.forEach(function (c, i) { var hint = UI.hintMove && UI.hintMove.t === 'place' && UI.hintMove.h === i; h += '<button type="button" class="htok' + (UI.fresh ? ' fresh' : '') + (UI.sel && UI.sel.kind === 'tok' && UI.sel.h === i ? ' sel' : '') + (hint ? ' hint' : '') + '" data-h="' + i + '" aria-label="Place ' + ART.NAME[c] + '"><svg viewBox="0 0 40 40" aria-hidden="true">' + ART.defs('h' + i) + ART.token(c, 20, 20, 15, 'h' + i) + '</svg><span>' + ART.NAME[c] + '</span></button>'; });
  if (!T.hand.length) h += '<span class="hn">' + (E.moves().some(function (m) { return m.t === 'cube'; }) ? 'All placed. An animal can move in!' : 'All placed.') + '</span>';
  h += '<span class="sp"></span>';
  UI.fresh = false;
  if (UI.undo.length) h += '<button type="button" class="btn ghostb" id="undoB" aria-label="Undo" title="Undo"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 7 4 12l5 5M4 12h10a5 5 0 0 1 0 10h-3"/></svg></button>';
  var canEnd = E.legal({ t: 'end' }); h += '<button type="button" class="btn primary' + (canEnd ? ' go' : '') + '" id="endB"' + (canEnd ? '' : ' aria-disabled="true"') + '>End turn</button>';
  $('#central').innerHTML = h + '</div>';
}
function renderStrip(rowH, mineH, rowL, mineL) {   // the cards on the table; phone: pages of 2 cards (no sideways overflow)
  var sp = $('#strip'); if (!sp) return;
  var cut = function (h) { return h.split(/(?=<button type="button" class="acard)|(?=<span class="(?:hn|donec)")/).filter(Boolean); };
  var grp = function (cls, l, a) { return '<div class="sgrp ' + cls + '"><h3>' + l + '</h3><div class="srow">' + a.join('') + '</div></div>'; };
  if (!window.matchMedia('(max-width:759px)').matches) { sp.innerHTML = grp('sg-row', rowL, cut(rowH)) + grp('sg-mine', mineL, cut(mineH)); return; }
  var items = cut(mineH).filter(function (h) { return h.indexOf('<button') === 0; }).map(function (h) { return ['m', h]; }).concat(cut(rowH).map(function (h) { return ['r', h]; })), pages = [], cur = [];
  items.forEach(function (it) { if (cur.length === 2 || (cur.length && cur[0][0] !== it[0])) { pages.push(cur); cur = []; } cur.push(it); }); if (cur.length) pages.push(cur);
  var n = pages.length; UI.sp = ((UI.sp || 0) % n + n) % n; var pg = pages[UI.sp];
  sp.innerHTML = grp(pg[0][0] === 'm' ? 'sg-mine' : 'sg-row', pg[0][0] === 'm' ? mineL : rowL, pg.map(function (x) { return x[1]; })) +
    (n > 1 ? '<button type="button" class="spg" id="spNext" aria-label="More cards, page ' + (UI.sp + 1) + ' of ' + n + '"><b>' + (UI.sp + 1) + '/' + n + '</b><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg></button>' : '');
}
function renderDock() {
  var T = G.turn, s = G.seats[UI.view], mine = myTurn(), h = '', cs = E.seat(), both = false;
  var act = s.cards.length + (s.spirit && !s.spirit.placed ? 1 : 0);
  var canTake = mine && !T.tookCard && !T.swapped && E.active(cs) < 4;
  var rowL = 'Animals to invite' + (canTake ? ' <em>take 1</em>' : ''), mineL = (s.name === 'You' ? 'Your' : esc(s.name) + '\'s') + ' cards <em>' + act + '/4</em>' + (!both && UI.tab === 'row' && mine && s.cards.some(function (c) { return Object.keys(E.cubeSpots(s, c.id)).length; }) ? ' <em class="rd">home ready</em>' : '');
  var rowH = '', mineH = '', ps = cs.ai ? G.seats[firstHuman()] : cs;
  G.row.forEach(function (id, i) { var hint = UI.hintMove && UI.hintMove.t === 'card' && UI.hintMove.i === i, pl = planFor(ps, id); rowH += cardHTML(id, { attr: 'data-row="' + i + '"', hint: hint, dim: !canTake, can: canTake, fit: pl && pl.cost === 0, plan: pl, showPlan: true }); });
  if (!G.row.length) rowH += '<span class="hn">No animals left to invite.</span>';
  if (s.spirit && !s.spirit.placed) { var rs = mine && Object.keys(E.cubeSpots(s, s.spirit.id)).length; mineH += cardHTML(s.spirit.id, { attr: 'data-ci="S"', sel: UI.sel && UI.sel.ci === 'S', ready: rs }); }
  s.cards.forEach(function (c, i) { var ready = mine && Object.keys(E.cubeSpots(s, c.id)).length, hint = UI.hintMove && UI.hintMove.t === 'cube' && UI.hintMove.ci === i, pl = !ready ? planFor(s, c.id) : null; mineH += cardHTML(c.id, { attr: 'data-ci="' + i + '"' + (UI.justCard === c.id ? ' data-just="1"' : ''), left: c.left, sel: UI.sel && UI.sel.kind === 'card' && UI.sel.ci === i, ready: ready, hint: hint, plan: pl, showPlan: !ready && !s.ai }); });
  if (!act) mineH += '<span class="hn">No cards yet. Invite an animal.</span>';
  if (s.done.length || (s.spirit && s.spirit.placed)) mineH += '<span class="donec">' + s.done.length + ' done' + (s.spirit && s.spirit.placed ? ' + spirit' : '') + '</span>';
  if (both) h = '<h2 class="dh">' + mineL + '</h2><div class="cards">' + mineH + '</div><h2 class="dh">' + rowL + '</h2><div class="cards">' + rowH + '</div>';
  else h = '<div class="tabs" role="tablist"><button type="button" role="tab" class="tab' + (UI.tab === 'row' ? ' on' : '') + '" data-tab="row" aria-selected="' + (UI.tab === 'row') + '">' + rowL + '</button>' +
    '<button type="button" role="tab" class="tab' + (UI.tab === 'mine' ? ' on' : '') + '" data-tab="mine" aria-selected="' + (UI.tab === 'mine') + '">' + mineL + '</button></div><div class="cards">' + (UI.tab === 'row' ? rowH : mineH) + '</div>';
  $('#dockbody').innerHTML = h;
  renderStrip(rowH, mineH, 'Animals to invite' + (canTake ? ' <em>take 1</em>' : ''), mineL);
  UI.justCard = null;
}
var TOKEN_TIP = { water: 'Water: a longer river scores more.', mount: 'Mountain: stack up to 3, beside another.', trunk: 'Trunk: put leaves on it later.', leaf: 'Leaves: a tree. Taller trees score more.', field: 'Fields: each group of 2+ scores 5.', build: 'Building: 5 if 3 colours touch it.' };
function renderLine() {
  var t = '', T = G.turn, s = E.seat();
  if (G.over) t = 'The valley is finished.';
  else if (UI.busy && UI.recap) t = UI.recap;
  else if (UI.busy || s.ai) t = s.name + '\'s turn: ' + (wide() && UI.view !== G.cur ? 'watch its valley on the left.' : 'blue rings show its moves.') + ' Tap to speed up.';
  else if (UI.view !== G.cur) t = 'Your turn. Tap Back to mine.';
  else if (s.offer) t = 'Keep one spirit card.';
  else if (UI.sel && UI.sel.kind === 'card') t = $$('#map .glow').length ? 'Tap a glowing hex: the animal moves in.' : $$('#map .plan').length ? 'Not yet. Build the dashed hexes first.' : 'This habitat no longer fits your valley.';
  else if (T.took < 0) t = 'Tap a pocket: take all 3 tokens.';
  else if (T.hand.length) t = TOKEN_TIP[T.hand[UI.sel && UI.sel.kind === 'tok' ? UI.sel.h : 0] || T.hand[0]];
  else if (s.cards.some(function (c) { return Object.keys(E.cubeSpots(s, c.id)).length; })) t = 'An animal can move in! Tap its card.';
  else t = 'Done? Tap End turn.';
  if (UI.recap && !UI.busy && UI.view === G.cur && G.turn.took < 0 && !G.over) t = UI.recap;
  $('#line').textContent = t; $('#line').classList.toggle('rv', !!(UI.busy || (s.ai && !G.over)));
  $('#board').classList.toggle('rivalv', !!(G.seats[UI.view] && G.seats[UI.view].ai && !G.over));
}
function hexScreen(k, sel) {
  var svg = $(sel || '#map'); if (!svg) return null; var xy = hexXY(k, 40), b = svg.getBoundingClientRect(), vb = svg.viewBox.baseVal, sc = Math.min(b.width / vb.width, b.height / vb.height);
  return [b.left + (b.width - vb.width * sc) / 2 + (xy[0] - vb.x) * sc, b.top + (b.height - vb.height * sc) / 2 + (xy[1] - vb.y) * sc, sc];
}
function cubeInfo(s, m) { if (m.ci === 'S') return s.spirit ? { id: s.spirit.id, spirit: true, done: true } : null; var c = s.cards[m.ci]; return c ? { id: c.id, done: c.left === 1, n: E.card(c.id).pts.length - c.left + 1 } : null; }
// the payoff: the animal hops out big, then settles into its hex; a finished card gets its own short banner
function settleFx(k, fx, s, sel) {
  var c = E.card(fx.id);
  if (!ANIM || UI.fast) return; var p = hexScreen(k, sel); if (!p) return;
  var d = document.createElement('div'); d.className = 'settlefx'; d.style.left = p[0] + 'px'; d.style.top = p[1] + 'px';
  d.innerHTML = '<svg viewBox="0 0 100 100" aria-hidden="true">' + ART.defs('sf') + '<circle cx="50" cy="50" r="42" fill="#fffaf0" filter="url(#sfsh2)"/>' + ART.animal(c.an, 50, 50, 64, '#6b4e3a', 'sf') + '</svg>';
  document.body.appendChild(d); setTimeout(function () { d.remove(); }, 1300);
  if (!fx.done) return;
  var pts = c.pts ? c.pts[c.pts.length - 1] : null, who = s && s.ai ? s.name + ' finished ' : 'Card complete: ';
  var bn = document.createElement('div'); bn.className = 'donefx'; bn.setAttribute('role', 'status');
  bn.innerHTML = '<svg viewBox="0 0 60 60" aria-hidden="true">' + ART.defs('df') + ART.animal(c.an, 30, 30, 50, c.pts ? '#7a5a44' : '#7b5aa8', 'df') + '</svg><div><b>' + esc(who + c.name.split(' ').pop()) + '</b><span>' + (pts != null ? 'Every animal moved in: ' + pts + ' points' : 'Spirit settled: bonus at the end') + '</span></div>';
  setTimeout(function () { document.body.appendChild(bn); if (!(s && s.ai)) SND.end(); setTimeout(function () { bn.remove(); }, 1900); }, 650);
}
function toast(t) { var e = $('#toast'); e.textContent = t; e.classList.add('on'); clearTimeout(e._t); e._t = setTimeout(function () { e.classList.remove('on'); }, 2200); }

// ---------- input ----------
function onTap(e) {
  var t = e.target;
  var xb = t.closest('[data-ppx]'); if (xb) { closePanel(); return; }
  var rb = t.closest('#rail [data-pp]');
  if (rb) { if (!G) return; var w = rb.dataset.pp, id = w === 'score' ? 'scorep' : 'dock', same = UI.pp === id && (id === 'scorep' || UI.tab === w); if (same) closePanel(); else openPanel(id, id === 'dock' ? w : null); return; }
  if (UI.pp && !t.closest('.pp') && !t.closest('.gx-drawer') && !t.closest('#tbub') && !t.closest('[data-k],.pocket,.htok,#endB,#undoB,.pill')) { closePanel(); return; }
  if (UI.dragged && Date.now() - UI.dragged < 400) return;
  if (UI.busy && G && !G.over && E.seat().ai && !UI.skip && !t.closest('.gx-drawer,.gx-bar')) { UI.skip = true; toast('Speeding up the rival.'); return; }
  if (t.closest('#backB')) { UI.view = firstHuman(); UI.sel = null; render(); return; }
  var rc = t.closest('[data-rc]'); if (rc) { var pr = rc.dataset.rc.split(':'), so = G.seats[+pr[0]], rid = pr[1] === 'S' ? so.spirit.id : (so.cards[+pr[1]] || {}).id; if (rid) bigCard(null, rid, +pr[0]); return; }
  var seatB = t.closest('[data-seat]'); if (seatB) { if (UI.mode === 'tut' && TUT) { toast('Finish the lesson first.'); return; } var v = +seatB.dataset.seat; if (v === UI.view) { toast(v === firstHuman() ? 'This is your valley.' : 'Showing ' + G.seats[v].name + '.'); return; } UI.view = v; UI.sel = null; render(); toast(v === G.cur || v === firstHuman() ? 'Back to your valley.' : 'Showing ' + G.seats[v].name + '. Tap your name to return.'); return; }
  if (!G) return;
  var p = t.closest('[data-pocket]'); if (p) { if (myTurn()) act({ t: 'take', i: +p.dataset.pocket }); return; }
  var ht = t.closest('[data-h]'); if (ht && myTurn()) { UI.sel = { kind: 'tok', h: +ht.dataset.h }; SND.card(); render(); return; }
  var tb = t.closest('[data-tab]'); if (tb) { var same = UI.tab === tb.dataset.tab; UI.tab = tb.dataset.tab; render(); if (same) bump('[data-tab="' + UI.tab + '"]'); return; }
  if (t.closest('#spNext')) { UI.sp = (UI.sp || 0) + 1; render(); return; }
  var rw = t.closest('[data-row]'); if (rw) { bigCard(+rw.dataset.row); return; }
  var ci = t.closest('[data-ci]'); if (ci && myTurn()) { var v = ci.dataset.ci === 'S' ? 'S' : +ci.dataset.ci; UI.sel = (UI.sel && UI.sel.kind === 'card' && UI.sel.ci === v) ? null : { kind: 'card', ci: v }; if (UI.sel && UI.pp === 'dock') { UI.pp = null; document.documentElement.removeAttribute('data-pp'); syncPanels(); } render(); if (UI.sel && !$$('#map .glow').length) { var pl = planFor(G.seats[UI.view], ci.dataset.ci === 'S' ? G.seats[UI.view].spirit.id : G.seats[UI.view].cards[v].id); toast(pl ? 'Needs ' + planText(pl) + '. See the dashed hexes.' : 'This habitat no longer fits.'); } return; }
  if (ci) { var sv = G.seats[UI.view], cid = ci.dataset.ci === 'S' ? sv.spirit.id : (sv.cards[+ci.dataset.ci] || {}).id; if (cid) bigCard(null, cid); return; }
  var hx = t.closest('[data-k]');
  if (hx && myTurn()) {
    var k = hx.dataset.k;
    if (UI.sel && UI.sel.kind === 'tok') { if (!act({ t: 'place', h: UI.sel.h, k: k })) { shake(hx); toast(whyNot(G.seats[UI.view], k, G.turn.hand[UI.sel.h])); } return; }
    if (UI.sel && UI.sel.kind === 'card') { if (!act({ t: 'cube', ci: UI.sel.ci, k: k })) { shake(hx); var lb = hx.querySelector('.plab text'); toast(lb ? 'Build here first: ' + lb.textContent + '. Then the animal can move in.' : 'The animal can\'t live here. Try a glowing or dashed hex.'); } return; }
    if (G.turn.took < 0) { toast('First tap a pocket of tokens above.'); flashPockets(); }
    return;
  }
  if (t.id === 'endB') { if (!E.legal({ t: 'end' })) { toast(G.turn.took < 0 ? 'Take a pocket first.' : 'Place all your tokens first.'); return; } act({ t: 'end' }); return; }
  if (t.id === 'undoB') { undo(); return; }
}
// drag a hand token onto a glowing hex (a tap on the token, then on a hex, works too)
function dragInit() {
  var d = null;
  document.addEventListener('pointerdown', function (e) {
    var ht = e.target.closest('[data-h]'); if (!ht || !myTurn()) return;
    var h = +ht.dataset.h; UI.sel = { kind: 'tok', h: h };
    d = { h: h, x: e.clientX, y: e.clientY, el: null, moved: false };
  });
  document.addEventListener('pointermove', function (e) {
    if (!d) return;
    if (!d.moved && Math.hypot(e.clientX - d.x, e.clientY - d.y) < 10) return;
    if (!d.moved) { d.moved = true; render(); d.el = document.createElement('div'); d.el.className = 'dragtok'; d.el.innerHTML = '<svg viewBox="0 0 40 40">' + ART.defs('dg') + ART.token(G.turn.hand[d.h], 20, 20, 16, 'dg') + '</svg>'; document.body.appendChild(d.el); }
    d.el.style.left = e.clientX + 'px'; d.el.style.top = (e.clientY - 26) + 'px';
    $$('#map .hx.over').forEach(function (x) { x.classList.toggle('over', false); });
    var u = document.elementFromPoint(e.clientX, e.clientY - 26), hx = u && u.closest && u.closest('#map [data-legal]'); if (hx) hx.classList.add('over');
  });
  function up(e) {
    if (!d) return; var dd = d; d = null; if (!dd.moved) return;
    if (dd.el && dd.el.parentNode) dd.el.parentNode.removeChild(dd.el); UI.dragged = Date.now();
    var u = document.elementFromPoint(e.clientX, e.clientY - 26), hx = u && u.closest && u.closest('#map [data-k]');
    if (hx && hx.getAttribute('data-legal')) act({ t: 'place', h: dd.h, k: hx.dataset.k }); else render();
  }
  document.addEventListener('pointerup', up); document.addEventListener('pointercancel', up);
}
function bump(sel) { var e = $(sel); if (!e) return; e.classList.add('bump'); setTimeout(function () { e.classList.toggle('bump', false); }, 350); }
function whyNot(s, k, c) {
  var st = s.board[k] || [], top = st[st.length - 1], n = ART.NAME[c];
  if (s.cubes[k]) return 'An animal lives there. Nothing stacks on it.';
  if (c === 'water' || c === 'field') return n.charAt(0).toUpperCase() + n.slice(1) + ' only goes on an empty hex.';
  if (top === 'water' || top === 'field') return 'Nothing stacks on ' + ART.NAME[top] + '.';
  if (top === 'leaf') return 'Nothing goes on top of leaves.';
  if (top === 'build') return 'Nothing goes on a building.';
  if (c === 'mount') return st.length >= 3 ? 'Mountains are 3 high at most.' : 'Mountains stack only on grey.';
  if (c === 'trunk') return 'Trunks: two at most, on trunks only.';
  if (c === 'leaf') return 'Leaves go on trunks, or alone.';
  if (c === 'build') return 'Buildings go on one grey, trunk or red.';
  return 'That hex does not fit.';
}
function shake(el) { SND.bad(); el.classList.add('no'); setTimeout(function () { el.classList.remove('no'); }, 400); }
function flashPockets() { $$('#central .pocket').forEach(function (p) { p.classList.add('hint'); setTimeout(function () { p.classList.remove('hint'); }, 900); }); }
function bigCard(i, idOnly, owner) {
  var id = idOnly || G.row[i], c = E.card(id), s = owner != null ? G.seats[owner] : idOnly ? G.seats[UI.view] : E.seat(), T = G.turn, mine = myTurn() && !idOnly;
  if (!idOnly && s.ai) s = G.seats[firstHuman()];
  var can = mine && E.legal({ t: 'card', i: i }) && (UI.mode !== 'tut' || !window.tutAllow || tutAllow({ t: 'card', i: i })), fits = Object.keys(E.cubeSpots(s, id)).length;
  var why = idOnly ? '' : !mine ? 'Wait for your turn.' : (UI.mode === 'tut' && TUT && !can) ? 'Follow the lesson first.' : T.tookCard ? 'One animal per turn.' : T.swapped ? 'You swapped a card this turn.' : E.active(s) >= 4 ? 'You hold 4 cards: finish one first.' : '';
  var pl = fits ? null : planFor(s, id), left = turnsLeft(s), need = pl ? Math.ceil(pl.cost / 3) : 0, warn = '', planH = '';
  var whose = s.ai ? s.name + '\'s valley' : 'your valley';
  if (fits) planH = '<p class="fit ok">Fits ' + whose + ' now: ' + fits + (fits > 1 ? ' homes.' : ' home.') + '</p>';
  else if (!pl) { planH = '<p class="fit no">Can\'t be built on ' + whose + ': the spots are taken.</p>'; warn = 'no'; }
  else {
    planH = '<p class="fit">Needs ' + planText(pl) + ': about ' + need + ' turn' + (need > 1 ? 's' : '') + '. Dashed hexes show where.</p>';
    if (!idOnly && need > Math.max(1, left)) { planH += '<p class="why">Your valley may fill up before it is built.</p>'; warn = 'late'; }
  }
  var mv = valleySVG(s, { plan: pl ? pl.labels : null, glow: fits ? (function () { var g = {}; Object.keys(E.cubeSpots(s, id)).forEach(function (k) { g[k] = 2; }); return g; })() : null, ghost: c.an, f: 'pv', still: true });
  var b = document.createElement('div'); b.className = 'bigc';
  b.innerHTML = '<div class="bigtop"><svg viewBox="0 0 60 60" aria-hidden="true">' + ART.defs('bg') + ART.animal(c.an, 30, 30, 50, '#7a5a44', 'bg') + '</svg><div><h3>' + esc(c.name) + '</h3><p>Build this habitat. The animal lives on the dashed hex. Turn it any way.</p></div></div>' +
    (!c.pts ? '<p class="fit">' + spiritText(c.sc) + '</p>' : '') + planH +
    (why ? '<p class="why">' + why + '</p>' : '') +
    '<div class="bigacts">' + (can ? '<button type="button" class="btn ' + (warn ? 'ghostb' : 'primary') + '" id="takeB">' + (warn ? 'Invite anyway' : 'Invite this animal') + '</button>' : '') + (mine && G.solo && E.legal({ t: 'swap', i: i }) ? '<button type="button" class="btn ghostb" id="swapB">Swap for a new card</button>' : '') + '</div>' +
    '<div class="bigrow">' + cardSVG(id, null, true) + '<svg class="pvmap" viewBox="' + mv.vb + '" role="img" aria-label="Where it fits on ' + whose + '">' + mv.html + '</svg></div>' + trackHTML(id, c.pts ? c.pts.length : 0) +
    '<p class="trk">Each animal you settle uncovers the next number. You score the highest one showing.</p>';
  GX.drawer('bigd', c.pts ? 'Animal card' : 'Spirit card', b, false); GX.show('bigd'); if (window.tutRender) tutRender();
  $$('#board .glow, #dock .playable').forEach(function (e) { e.classList.toggle('glow', false); e.classList.toggle('playable', false); });   // the sheet covers them; glows return on close
  var tk = $('#takeB'); if (tk) tk.onclick = function () { GX.close(); act({ t: 'card', i: i }); };
  var sw = $('#swapB'); if (sw) sw.onclick = function () { GX.close(); act({ t: 'swap', i: i }); };
}
function showSpiritPick() {
  var s = E.seat(); if (!s.offer) return;
  var b = document.createElement('div'); b.className = 'spick';
  b.innerHTML = '<p>Keep one spirit. Settle it for its bonus.</p><div class="cards">' + s.offer.map(function (id, i) { return cardHTML(id, { attr: 'data-sp="' + i + '"' }); }).join('') + '</div>';
  GX.drawer('spd', 'Choose your spirit', b, false); GX.show('spd');
  $$('[data-sp]', b).forEach(function (el) { el.onclick = function () { GX.close(); act({ t: 'spirit', i: +el.dataset.sp }); }; });
}
function showPass() {
  var p = $('#pass'); p.hidden = false;
  p.innerHTML = '<div class="passc"><h2>' + esc(E.seat().name) + '</h2><p>Your turn. Pass the phone.</p><button type="button" class="btn primary" id="passB">I\'m ready</button></div>';
  $('#passB').onclick = function () { p.hidden = true; render(); if (E.seat().offer) showSpiritPick(); };
}
function hint() {
  if (!myTurn()) return;
  var plan = AI.plan('hard'), m = plan.find(function (x) { return x.t !== 'end' && x.t !== 'swap'; });
  if (!m) { UI.hintMove = { t: 'end' }; toast('Nothing left to do: tap End turn.'); render(); return; }
  if (m.t === 'spirit') { showSpiritPick(); return; }
  UI.hintMove = m;
  if (m.t === 'place') UI.sel = { kind: 'tok', h: m.h };
  if (m.t === 'cube') { UI.sel = { kind: 'card', ci: m.ci }; UI.tab = 'mine'; }
  if (m.t === 'card') UI.tab = 'row';
  render();
  toast({ take: 'Try the glowing pocket.', place: 'Try the glowing hex.', card: 'Invite the glowing animal.', cube: 'Settle the animal on the glowing hex.' }[m.t]);
}

// ---------- results, scores, rules ----------
function scoreRows(s) { var sc = E.score(s); return [['Trees', sc.trees], ['Mountains', sc.mounts], ['Fields', sc.fields], ['Buildings', sc.builds], [G.side === 'A' ? 'River (' + sc.river + ')' : 'Islands (' + sc.islands + ')', sc.water], ['Animals', sc.animals], ['Spirit', sc.spirit], ['Total', sc.total]]; }
function scoresHTML() {
  var rows = scoreRows(G.seats[0]).map(function (r, j) { return '<tr' + (j === 7 ? ' class="tot"' : '') + '><th>' + r[0].replace(/ \(.*/, '') + '</th>' + G.seats.map(function (s) { return '<td>' + scoreRows(s)[j][1] + '</td>'; }).join('') + '</tr>'; }).join('');
  return '<table class="sct"><tr><th></th>' + G.seats.map(function (s) { return '<th>' + esc(s.name) + '</th>'; }).join('') + '</tr>' + rows + '</table><p class="small">' + (G.side === 'A' ? 'River: longest line of water.' : 'Islands: land split by water.') + '</p>';
}
function whyWin() {   // one line: where the game was won or lost
  if (G.solo || G.np < 2) return '';
  var me = firstHuman(), R = G.result, a = R.scores[me], o = R.scores.filter(function (r) { return r.i !== me; }).sort(function (x, y) { return y.total - x.total; })[0];
  var d = a.total - o.total, nm = G.seats[o.i].name, diffs = cats().map(function (c) { return [c[1].toLowerCase(), a.sc[c[0]] - o.sc[c[0]]]; });
  var best = diffs.slice().sort(function (x, y) { return y[1] - x[1]; })[0], worst = diffs.slice().sort(function (x, y) { return x[1] - y[1]; })[0];
  var t = d > 0 ? 'You won by ' + d + '. Your ' + best[0] + ' made the difference (+' + best[1] + ').' : d < 0 ? nm + ' won by ' + (-d) + '. Its ' + worst[0] + ' beat yours by ' + (-worst[1]) + '.' : 'Tied on points: most animals settled wins.';
  return '<p class="whyw">' + esc(t) + '</p>';
}
function showResults() {
  if (!G || !G.over || !G.result) return;
  var R = G.result, win = R.winners, me = firstHuman(), t;
  if (G.solo) t = R.suns.total + ' sun' + (R.suns.total === 1 ? '' : 's') + '!';
  else if (win.length > 1) t = 'A shared win!';
  else t = (G.seats[win[0]].ai ? G.seats[win[0]].name + ' wins' : (humans() > 1 ? G.seats[win[0]].name + ' wins!' : 'You win!'));
  SND.end();
  var p = $('#rs'); p.hidden = false;
  p.innerHTML = '<div class="rsc"><h2>' + esc(t) + '</h2>' + (G.solo ? '<p class="suns">' + '☀'.repeat(Math.min(10, R.suns.total)) + '</p><p class="small">' + R.scores[0].total + ' points: ' + R.suns.base + ' suns, +' + R.suns.bonus + ' bonus.</p>' : '') +
    whyWin() + scoresHTML() + '<div class="bigacts"><button type="button" class="btn primary" id="againB">Play again</button><button type="button" class="btn ghostb" id="lookB">See the valleys</button><button type="button" class="btn ghostb" id="titleB">Title</button></div></div>';
  $('#againB').onclick = function () { newGame(Object.assign({}, UI.cfg, { seed: null })); };
  $('#lookB').onclick = function () { p.hidden = true; render(); };
  $('#titleB').onclick = function () { showTitle(); };
  try { localStorage.removeItem('mf_save'); } catch (e) { }
}
var RULES_HTML = '<h3>Goal</h3><p>Fold the best paper valley. Shape landscapes, then invite animals to live in them. Most points wins.</p>' +
  '<h3>Your turn</h3><ol><li><b>Take one pocket</b> of 3 tokens and place all 3 on your board.</li><li><b>Invite one animal</b> (optional): take a card. Hold at most 4 unfinished cards.</li><li><b>Settle animals</b> (optional, as many as you can): when a card\'s habitat is on your board, put an animal on its dashed hex. Turn the pattern any way.</li></ol>' +
  '<p>Do these in any order. One animal per hex. Nothing stacks on an animal. A token can serve several habitats.</p>' +
  '<h3>Stacking</h3><ul><li><b>Mountain</b>: grey on grey, up to 3 high.</li><li><b>Tree</b>: leaves alone, or on 1 or 2 trunks. Nothing on leaves.</li><li><b>Building</b>: red on one grey, trunk or red.</li><li><b>Water</b> and <b>field</b>: never stack.</li></ul>' +
  '<h3>Scoring</h3><ul><li>Trees: 1 / 3 / 7 by height.</li><li>Mountains: 1 / 3 / 7, only next to another mountain.</li><li>Fields: 5 per group of 2 or more.</li><li>Buildings: 5 if 3+ different colours touch it.</li><li>Side A river: longest line of water: 2/5/8/11/15 for 2-6, +4 each after.</li><li>Side B islands: 5 per land area split by water.</li><li>Animal cards: the highest number uncovered.</li><li>Spirit: its bonus, if you settled it.</li></ul>' +
  '<h3>End</h3><p>When the pouch can\'t refill a pocket, or someone has 2 or fewer empty hexes after their turn, finish the round. Tie: most animals settled.</p>' +
  '<h3>Solo</h3><p>3 pockets, 3 cards. After each turn the other 2 pockets go to the box. No card taken? You may swap one. Earn suns: 40/70/90/110/130/140/150/160 points = 1-8 suns, +1 for side A, +2 with no spirit, +1 for a group spirit.</p>' +
  '<h3>Every card</h3><div class="allc" id="allc"></div>';
function fillRules() { var b = $('#rulesb'); if (!b) return; if (!b.dataset.f) { b.innerHTML = RULES_HTML; b.dataset.f = 1; } var a = $('#allc'); if (a && G && !a.dataset.f) { a.innerHTML = MF.CARDS.concat(MF.SPIRITS).map(function (c) { return cardHTML(c.id, {}); }).join(''); a.dataset.f = 1; } }

// ---------- title ----------
function showTitle() {
  clearTimeout(UI.aiT); UI.busy = false; hideOverlays(); document.documentElement.classList.remove('mf-play');
  var st = $('#start'); st.hidden = false; var hasSave = false; try { hasSave = !!localStorage.getItem('mf_save'); } catch (e) { }
  var c = UI.setup || (UI.setup = { mode: 'quick', ai: 'easy', side: 'A', spirits: false, np: 2 });
  var deco = '<svg class="tdeco" viewBox="0 0 360 170" aria-hidden="true">' + ART.defs('t') +
    '<path d="M0,120 C60,80 120,130 180,95 C240,60 300,110 360,80 L360,170 L0,170Z" fill="#cfe5c4" filter="url(#tsh2)"/>' +
    '<path d="M0,140 C80,115 150,150 220,125 C280,105 320,135 360,120 L360,170 L0,170Z" fill="#a9d39a" filter="url(#tsh2)"/>' +
    ART.stack(['mount', 'mount', 'mount'], 70, 92, 34, 't') + ART.stack(['trunk', 'trunk', 'leaf'], 285, 100, 30, 't') + ART.stack(['mount', 'build'], 215, 112, 24, 't') +
    ART.animal('heron', 130, 118, 44, '#fbf3e4', 't') + ART.animal('fox', 250, 140, 36, '#f6c99a', 't') + ART.animal('rabbit', 40, 145, 30, '#fbf3e4', 't') + '</svg>';
  var seg = function (name, vals, cur) { return '<div class="seg" role="group" aria-label="' + name + '">' + vals.map(function (v) { return '<button type="button" data-set="' + name + '" data-v="' + v[0] + '" class="' + (String(cur) === String(v[0]) ? 'on' : '') + '">' + v[1] + '</button>'; }).join('') + '</div>'; };
  st.innerHTML = '<div class="tcard">' + deco + '<h1>Meadowfold</h1><p class="sub">Fold a paper valley. Invite its animals.</p>' +
    '<div class="tbtns"><button type="button" class="btn primary big" id="tutB">Learn to play (2 min)</button>' + (hasSave ? '<button type="button" class="btn big" id="resB">Continue game</button>' : '') + '<button type="button" class="btn big" id="goB">Play now</button></div>' +
    '<details class="opts"' + (UI.optOpen ? ' open' : '') + '><summary>Game options: ' + esc(optSum(c)) + '</summary><div class="setup"><label>Players</label>' + seg('mode', [['quick', 'Vs computer'], ['solo', 'Solo'], ['hot', 'Pass & play']], c.mode) +
    (c.mode === 'quick' ? '<label>Computer</label>' + seg('ai', [['easy', 'Easy'], ['normal', 'Normal'], ['hard', 'Hard']], c.ai) + '<label>Rivals</label>' + seg('np', [[2, '1'], [3, '2'], [4, '3']], c.np) : '') +
    (c.mode === 'hot' ? '<label>Players</label>' + seg('np', [[2, '2'], [3, '3'], [4, '4']], c.np) : '') +
    '<label>Board side</label>' + seg('side', [['A', 'A: river'], ['B', 'B: islands']], c.side) +
    '<label>Spirit cards</label>' + seg('spirits', [['false', 'Off'], ['true', 'On']], c.spirits) +
    '</div></details></div>';
  $$('[data-set]', st).forEach(function (b) { b.onclick = function () { var k = b.dataset.set, v = b.dataset.v, same = b.classList.contains('on'); c[k] = k === 'np' ? +v : k === 'spirits' ? v === 'true' : v; if (k === 'mode') c.np = v === 'hot' ? Math.max(2, c.np) : c.np; UI.optOpen = true; showTitle(); if (same) bump('[data-set="' + k + '"][data-v="' + v + '"]'); }; });
  $('#goB').onclick = function () { startFromSetup(); };
  $('#tutB').onclick = function () { if (window.GXST) GXST.picker(); };
  var rb = $('#resB'); if (rb) rb.onclick = function () { if (!load()) newGame(); };
}
function optSum(c) { var m = { quick: 'vs computer', solo: 'solo', hot: 'pass & play' }[c.mode]; return m + (c.mode === 'quick' ? ', ' + c.ai.toLowerCase() + ', ' + (c.np - 1) + (c.np > 2 ? ' rivals' : ' rival') : c.mode === 'hot' ? ', ' + c.np + ' players' : '') + ', side ' + c.side + (c.spirits ? ', spirits' : ''); }
function startFromSetup() {
  var c = UI.setup; UI.mode = c.mode;
  if (c.mode === 'solo') return newGame({ np: 1, humans: 1, side: c.side, spirits: c.spirits });
  if (c.mode === 'hot') return newGame({ np: c.np, humans: c.np, side: c.side, spirits: c.spirits, seats: Array.apply(null, Array(c.np)).map(function (x, i) { return { name: 'Player ' + (i + 1), ai: null }; }) });
  var names = ['You', 'Wren', 'Basil', 'Juniper'];
  return newGame({ np: c.np, humans: 1, ai: c.ai, side: c.side, spirits: c.spirits, seats: names.slice(0, c.np).map(function (n, i) { return { name: c.np === 2 && i ? 'Rival' : n, ai: i ? c.ai : null }; }) });
}
function save() { if (!G || G.over || UI.mode === 'tut' || UI.fast) return; try { localStorage.setItem('mf_save', JSON.stringify({ G: G, cfg: UI.cfg, mode: UI.mode })); } catch (e) { } }
function load() { try { var d = JSON.parse(localStorage.getItem('mf_save')); if (!d || !d.G) return false; G = d.G; UI.cfg = d.cfg; UI.mode = d.mode; UI.undo = []; UI.sel = null; hideOverlays(); document.documentElement.classList.add('mf-play'); UI.view = firstHuman(); render(); nextActor(); return true; } catch (e) { return false; } }

// ---------- boot ----------
function boot() {
  GX.init({ key: 'mf' });
  var sb = document.createElement('div'); sb.id = 'scoresb'; GX.drawer('scored', 'Scores', sb, true);
  var rb = document.createElement('div'); rb.id = 'rulesb'; GX.drawer('rulesd', 'How to play', rb, false);
  var oc = GX.onClose; GX.onClose = function (id) { if (oc) oc(id); if (id === 'bigd' && G) render(); };
  GX.onShow = function (id) { if (id === 'scored') $('#scoresb').innerHTML = G ? scoresHTML() : '<p>No game yet.</p>'; if (id === 'rulesd') fillRules(); };
  try {
    GX.settings({ id: 'setd', title: 'Menu',
      game: function (S) { var a = document.createElement('button'); a.type = 'button'; a.className = 'gx-sb'; a.textContent = 'Title screen'; a.onclick = function () { GX.close(); showTitle(); };
        var rs = document.createElement('button'); rs.type = 'button'; rs.className = 'gx-sb'; rs.textContent = 'Restart'; rs.onclick = function () { GX.close(); if (UI.mode === 'tut' && window.GXST) GXST.picker(); else newGame(Object.assign({}, UI.cfg, { seed: null })); };
        S.appendChild(GX.row('This game', [rs, a])); },
      sound: function (S) { S.appendChild(GX.row('Sound effects', GX.onoff(!UI.prefs.mute, function (v) { UI.prefs.mute = !v; try { localStorage.setItem('mf_prefs', JSON.stringify(UI.prefs)); } catch (e) { } }))); },
      help: function (S) { var r = document.createElement('button'); r.type = 'button'; r.className = 'gx-sb'; r.textContent = 'Rules'; r.onclick = function () { GX.close(); setTimeout(function () { fillRules(); GX.show('rulesd'); }, 50); }; var tu = document.createElement('button'); tu.type = 'button'; tu.className = 'gx-sb'; tu.textContent = 'Tutorial'; tu.onclick = function () { GX.close(); if (window.GXST) GXST.picker(); }; S.appendChild(GX.row('Read', [r, tu])); },
      about: { name: 'Meadowfold', version: '1.0', text: 'Paper art drawn in code. Animal silhouettes: game-icons.net (CC BY 3.0).' } });
    AIDELAY = GX.aiDelay ? GX.aiDelay(650) : 650; if (GX.onPref) GX.onPref(function (k) { if (k === 'ai') AIDELAY = GX.aiDelay(650); });
    if (GX.applyPrefs) GX.applyPrefs();
  } catch (e) { }
  try { UI.prefs = Object.assign(UI.prefs, JSON.parse(localStorage.getItem('mf_prefs') || '{}')); } catch (e) { }
  document.addEventListener('click', onTap); dragInit();
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && UI.pp && !(window.GX && GX.open)) closePanel(); });
  $('#hintB').onclick = hint;
  GX.onResize(function () { });
  if (window.GXV) GXV.watch(function () { });
  if (!(window.GXS && GXS.on)) showTitle();
}
window.render_game_to_text = function () { if (!G) return 'title'; var s = G.seats[G.cur]; return JSON.stringify({ cur: G.cur, over: G.over, took: G.turn.took, hand: G.turn.hand, scores: G.seats.map(function (x) { return E.score(x).total; }), line: ($('#line') || {}).textContent }); };
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
