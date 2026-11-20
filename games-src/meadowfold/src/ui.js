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
  if (s.ai) { UI.view = G.cur; render(); UI.aiT = setTimeout(runAI, UI.fast ? 0 : AIDELAY); return; }
  UI.view = G.cur;
  if (humans() > 1 && !UI.fast && UI.mode !== 'tut') { showPass(); return; }
  render(); if (s.offer) showSpiritPick();
}
function act(m, how) {   // a human move
  if (UI.busy || !G || G.over) return false;
  if (UI.mode === 'tut' && window.tutAllow && !tutAllow(m)) { SND.bad(); return false; }
  var before = JSON.stringify(G), sc0 = E.score(E.seat()).total;
  if (!E.apply(m)) { SND.bad(); return false; }
  if (m.t !== 'end') UI.undo.push(before); else UI.undo = [];
  UI.recap = null;
  UI.hintMove = null;
  var s = G.seats[UI.view], gain = G.over ? 0 : E.score(s).total - sc0;
  if (m.t === 'take') { SND.take(); UI.sel = { kind: 'tok', h: 0 }; }
  if (m.t === 'place') { SND.place(); UI.flash = m.k; buzz(8); var T = G.turn; UI.sel = T.hand.length ? { kind: 'tok', h: Math.min(m.h, T.hand.length - 1) } : null; }
  if (m.t === 'card') { SND.card(); UI.tab = 'mine'; }
  if (m.t === 'cube') { SND.animal(); UI.flash = m.k; buzz([10, 40, 10]); UI.sel = null; }
  if (m.t === 'spirit') UI.tab = 'mine';
  render();
  if (gain && m.k) popAt(m.k, gain);
  if (window.tutAfter) tutAfter(m);
  if (m.t === 'end') { UI.sel = null; save(); nextActor(); }
  return true;
}
function undo() { if (!UI.undo.length || UI.busy) return; G = JSON.parse(UI.undo.pop()); UI.sel = G.turn.hand.length ? { kind: 'tok', h: 0 } : null; render(); }
function runAI() {
  if (!G || G.over) return; var s = E.seat(); if (!s.ai) return nextActor();
  UI.busy = true; var plan = AI.plan(s.ai), i = 0, start = E.score(s).total, got = [];
  (function stepAI() {
    if (!G || G.over) { UI.busy = false; return nextActor(); }
    if (i >= plan.length) { UI.busy = false; return nextActor(); }
    var m = plan[i++];
    if (!E.legal(m)) { m = { t: 'end' }; if (!E.legal(m)) { var ms = E.moves(); m = ms.find(function (x) { return x.t === 'place'; }) || ms[0]; } }
    var sc0 = E.score(s).total; if (m.t === 'end') { UI.busy = true; } E.apply(m);
    if (m.t === 'cube') got.push(E.card(typeof s.cubes[m.k] === 'number' ? s.cubes[m.k] : +String(s.cubes[m.k]).slice(1)).name.split(' ').pop());
    if (m.t === 'end') {
      var d = E.score(s).total - start; UI.recap = s.name + ' scored +' + d + (got.length ? ', settled ' + got.slice(0, 2).join(' and ') : '') + '.';
      save(); if (!UI.fast) SND.card();
      if (UI.fast || G.over) { UI.busy = false; UI.view = G.over ? UI.view : G.cur; return nextActor(); }
      render(); toast(UI.recap); UI.aiT = setTimeout(function () { UI.busy = false; UI.view = G.cur; nextActor(); }, Math.max(1400, AIDELAY * 3)); return;
    }
    if (m.t === 'place') { UI.flash = m.k; SND.place(); }
    if (m.t === 'take') { UI.lastPocket = m.i; SND.take(); }
    if (m.t === 'cube') { UI.flash = m.k; SND.animal(); }
    if (m.t === 'card') SND.card();
    render(); var gain = E.score(s).total - sc0; if (gain && m.k) popAt(m.k, gain);
    UI.aiT = setTimeout(stepAI, UI.fast ? 0 : Math.max(380, AIDELAY * (m.t === 'cube' ? 1.4 : 1)));
  })();
}
function buzz(p) { try { if (GX.buzz) GX.buzz(p); } catch (e) { } }

// ---------- rendering ----------
function render() {
  if (!G) return;
  renderBar(); renderCentral(); renderMap(); renderDock(); renderLine();
  if (window.tutRender) tutRender();
}
function myTurn() { return G && !G.over && !E.seat().ai && UI.view === G.cur && !UI.busy; }
function renderBar() {
  var h = '';
  G.seats.forEach(function (s, i) {
    var sc = E.score(s).total;
    h += '<button type="button" class="pill' + (i === G.cur && !G.over ? ' cur' : '') + (i === UI.view ? ' view' : '') + '" data-seat="' + i + '" aria-label="' + esc(s.name) + ' ' + sc + ' points"><span>' + esc(s.name) + '</span><b data-engine="E.score(G.seats[' + i + ']).total">' + sc + '</b></button>';
  });
  $('#barstat').innerHTML = h;
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
  h += '<span class="pouch" title="Tokens left in the pouch"><b>' + E.bagCount() + '</b> left</span>';
  $('#central').innerHTML = h;
}
function renderMap() {
  var s = G.seats[UI.view], r = 40, wh = boardWH(r), pad = 14, svg = $('#map');
  var W = wh[0] + pad * 2, H = wh[1] + pad * 2 + 4;
  svg.setAttribute('viewBox', (-pad) + ' ' + (-pad) + ' ' + W + ' ' + H);
  var mine = myTurn() && UI.view === G.cur, sel = UI.sel, glow = {}, ghost = null;
  if (mine && sel && sel.kind === 'tok' && G.turn.hand[sel.h]) E.spots(s, G.turn.hand[sel.h]).forEach(function (k) { if (UI.mode !== 'tut' || !window.tutAllow || tutAllow({ t: 'place', h: sel.h, k: k })) glow[k] = 1; });
  if (mine && sel && sel.kind === 'card') { var id = sel.ci === 'S' ? s.spirit.id : (s.cards[sel.ci] || {}).id; if (id) { ghost = E.card(id).an; Object.keys(E.cubeSpots(s, id)).forEach(function (k) { glow[k] = 2; }); } }
  var gain = {}, base = (mine && sel) ? E.score(s).total : 0;
  if (mine && sel && Object.keys(glow).length) Object.keys(glow).forEach(function (k) {
    var c = JSON.parse(JSON.stringify({ board: s.board, cubes: s.cubes, cards: s.cards, done: s.done, spirit: s.spirit }));
    if (glow[k] === 1) (c.board[k] = c.board[k] || []).push(G.turn.hand[sel.h]);
    else if (sel.ci === 'S') { c.cubes[k] = 'S'; c.spirit.placed = true; } else { c.cubes[k] = 1; c.cards[sel.ci].left--; }
    gain[k] = E.score(c).total - base;
  });
  var o = ART.defs('m');
  // the diorama: layered paper hills behind the valley sheet
  var C = E.cells(G.side), hp = UI.hintMove;
  o += '<g filter="url(#msh2)">' + C.list.map(function (k) { var xy = hexXY(k, r); return '<polygon points="' + ART.hexPts(xy[0], xy[1] + 4, r + 9) + '" fill="#bfe0b1"/>'; }).join('') + '</g>';
  o += '<g>' + C.list.map(function (k) { var xy = hexXY(k, r); return '<polygon points="' + ART.hexPts(xy[0], xy[1], r + 5) + '" fill="#d7ecc9"/>'; }).join('') + '</g>';
  C.list.forEach(function (k) {
    var xy = hexXY(k, r), st = s.board[k] || [], g = glow[k], cls = 'hx' + (g ? ' glow' + (g === 2 ? ' home' : '') : '') + (UI.flash === k ? ' pop' : '') + (hp && hp.k === k ? ' hint' : '');
    o += '<g class="' + cls + '" data-k="' + k + '"' + (g ? ' data-legal="1"' : '') + '>';
    o += '<polygon points="' + ART.hexPts(xy[0], xy[1], r - 1.5) + '" class="cell" filter="url(#msh)"/>';
    o += ART.stack(st, xy[0], xy[1], r * .82, 'm');
    if (s.cubes[k]) { var cv = s.cubes[k], an = typeof cv === 'number' ? E.card(cv).an : E.card(+String(cv).slice(1)).an; o += ART.cube(an, xy[0] + r * .3, xy[1] - r * .28, r * .74, typeof cv === 'number' ? '#fdf8ee' : '#f1e3ff', 'm'); }
    if (g) o += '<polygon points="' + ART.hexPts(xy[0], xy[1], r - 4) + '" class="ring"/>';
    if (g && gain[k]) o += '<g class="gain"><rect x="' + (xy[0] - 15) + '" y="' + (xy[1] + r * .38) + '" width="30" height="18" rx="9"/><text x="' + xy[0] + '" y="' + (xy[1] + r * .38 + 13.5) + '">' + (gain[k] > 0 ? '+' : '') + gain[k] + '</text></g>';
    if (g === 2 && ghost) o += '<g class="ghost">' + ART.animal(ghost, xy[0] + r * .32, xy[1] - r * .3, r * .55, '#6b4e3a', 'm') + '</g>';
    o += '</g>';
  });
  svg.innerHTML = o; UI.flash = null;
  svg.setAttribute('aria-label', (UI.view === firstHuman() && !s.ai ? 'Your' : s.name + '\'s') + ' valley');
}
function cardSVG(id, left, big) {
  var c = E.card(id), pat = c.pat, rr = big ? 15 : 9.5, pts = [], q = 0, ar = 0;
  pat.forEach(function (p, i) { if (i) { var d = E.DIRS[p.d]; q += d[0]; ar += d[1]; } pts.push([1.5 * q * rr, R3 * (ar + q / 2) * rr, p]); });
  var minx = 1e9, maxx = -1e9, miny = 1e9, maxy = -1e9; pts.forEach(function (p) { minx = Math.min(minx, p[0]); maxx = Math.max(maxx, p[0]); miny = Math.min(miny, p[1]); maxy = Math.max(maxy, p[1]); });
  var w = maxx - minx + rr * 2.2, h = maxy - miny + rr * 2.2, f = 'k' + id + (big ? 'b' : ''), o = '<svg class="pat" viewBox="' + (minx - rr * 1.1) + ' ' + (miny - rr * 1.1) + ' ' + w + ' ' + h + '" aria-hidden="true">' + ART.defs(f);
  pts.forEach(function (p) { var st = needStack(p[2].n); o += '<polygon points="' + ART.hexPts(p[0], p[1], rr - .6) + '" fill="#fffaf0" stroke="#d8c8ae" stroke-width="' + rr * .07 + '"/>' + ART.stack(st, p[0], p[1], rr * .8, f); if (p[2].cube) o += '<circle cx="' + (p[0] + rr * .38) + '" cy="' + (p[1] - rr * .38) + '" r="' + rr * .36 + '" fill="#fff" stroke="#8a5a3c" stroke-width="' + rr * .08 + '" stroke-dasharray="' + rr * .14 + ' ' + rr * .1 + '"/>'; });
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
function cardHTML(id, o) {
  o = o || {}; var c = E.card(id);
  return '<button type="button" class="acard' + (c.pts ? '' : ' spirit') + (o.sel ? ' sel' : '') + (o.ready ? ' ready' : '') + (o.hint ? ' hint' : '') + (o.dim ? ' dim' : '') + (o.can || o.ready ? ' playable' : '') + '" ' + (o.attr || '') + ' aria-label="' + esc(c.name) + (o.ready ? ', home ready' : '') + '">' +
    '<span class="ahead"><svg viewBox="0 0 30 30" aria-hidden="true">' + ART.defs('a' + id) + ART.animal(c.an, 15, 15, 24, c.pts ? '#7a5a44' : '#7b5aa8', 'a' + id) + '</svg><span class="nm">' + esc(c.name.replace(/^Spirit of the /, '')) + '</span></span>' +
    cardSVG(id) + trackHTML(id, o.left) + (o.ready ? '<span class="rdy">Home ready</span>' : '') + '</button>';
}
function renderHand() {
  var T = G.turn, h = '<div class="handrow">';
  T.hand.forEach(function (c, i) { var hint = UI.hintMove && UI.hintMove.t === 'place' && UI.hintMove.h === i; h += '<button type="button" class="htok' + (UI.sel && UI.sel.kind === 'tok' && UI.sel.h === i ? ' sel' : '') + (hint ? ' hint' : '') + '" data-h="' + i + '" aria-label="Place ' + ART.NAME[c] + '"><svg viewBox="0 0 40 40" aria-hidden="true">' + ART.defs('h' + i) + ART.token(c, 20, 20, 15, 'h' + i) + '</svg><span>' + ART.NAME[c] + '</span></button>'; });
  if (!T.hand.length) h += '<span class="hn">All placed. Settle animals?</span>';
  h += '<span class="sp"></span>';
  if (UI.undo.length) h += '<button type="button" class="btn ghostb" id="undoB">Undo</button>';
  var canEnd = E.legal({ t: 'end' }); h += '<button type="button" class="btn primary' + (canEnd ? ' go' : '') + '" id="endB"' + (canEnd ? '' : ' aria-disabled="true"') + '>End turn</button>';
  $('#central').innerHTML = h + '</div>';
}
function renderDock() {
  var T = G.turn, s = G.seats[UI.view], mine = myTurn(), h = '', cs = E.seat();
  // tabs
  var act = s.cards.length + (s.spirit && !s.spirit.placed ? 1 : 0);
  var canTake = mine && !T.tookCard && !T.swapped && E.active(cs) < 4;
  h += '<div class="tabs" role="tablist"><button type="button" role="tab" class="tab' + (UI.tab === 'row' ? ' on' : '') + '" data-tab="row" aria-selected="' + (UI.tab === 'row') + '">Animals to invite' + (canTake ? ' <em>take 1</em>' : '') + '</button>' +
    '<button type="button" role="tab" class="tab' + (UI.tab === 'mine' ? ' on' : '') + '" data-tab="mine" aria-selected="' + (UI.tab === 'mine') + '">' + (s.name === 'You' ? 'Your' : esc(s.name) + '\'s') + ' cards <em>' + act + '/4</em>' + (UI.tab === 'row' && mine && s.cards.some(function (c) { return Object.keys(E.cubeSpots(s, c.id)).length; }) ? ' <em class="rd">home ready</em>' : '') + '</button></div>';
  h += '<div class="cards">';
  if (UI.tab === 'row') {
    G.row.forEach(function (id, i) { var hint = UI.hintMove && UI.hintMove.t === 'card' && UI.hintMove.i === i; h += cardHTML(id, { attr: 'data-row="' + i + '"', hint: hint, dim: !canTake, can: canTake }); });
    if (!G.row.length) h += '<span class="hn">No animals left to invite.</span>';
  } else {
    if (s.spirit && !s.spirit.placed) { var rs = mine && Object.keys(E.cubeSpots(s, s.spirit.id)).length; h += cardHTML(s.spirit.id, { attr: 'data-ci="S"', sel: UI.sel && UI.sel.ci === 'S', ready: rs }); }
    s.cards.forEach(function (c, i) { var ready = mine && Object.keys(E.cubeSpots(s, c.id)).length, hint = UI.hintMove && UI.hintMove.t === 'cube' && UI.hintMove.ci === i; h += cardHTML(c.id, { attr: 'data-ci="' + i + '"', left: c.left, sel: UI.sel && UI.sel.kind === 'card' && UI.sel.ci === i, ready: ready, hint: hint }); });
    if (!act) h += '<span class="hn">No cards yet. Invite an animal.</span>';
    if (s.done.length || (s.spirit && s.spirit.placed)) h += '<span class="donec">' + s.done.length + ' done' + (s.spirit && s.spirit.placed ? ' + spirit' : '') + '</span>';
  }
  h += '</div>';
  $('#dockbody').innerHTML = h;
}
var TOKEN_TIP = { water: 'Water: a longer river scores more.', mount: 'Mountain: stack up to 3, beside another.', trunk: 'Trunk: put leaves on it later.', leaf: 'Leaves: a tree. Taller trees score more.', field: 'Field: 5 points per pair or more.', build: 'Building: on a token, 3 colours around.' };
function renderLine() {
  var t = '', T = G.turn, s = E.seat();
  if (G.over) t = 'The valley is finished.';
  else if (UI.busy || s.ai) t = s.name + ' is folding their valley…';
  else if (UI.view !== G.cur) t = 'Viewing ' + G.seats[UI.view].name + '. Tap your name.';
  else if (s.offer) t = 'Keep one spirit card.';
  else if (UI.sel && UI.sel.kind === 'card') t = $$('#map .glow').length ? 'Tap a glowing hex: the animal moves in.' : 'Its habitat is not on your board yet.';
  else if (T.took < 0) t = 'Tap a pocket: take its 3 tokens.';
  else if (T.hand.length) t = TOKEN_TIP[T.hand[UI.sel && UI.sel.kind === 'tok' ? UI.sel.h : 0] || T.hand[0]];
  else if (s.cards.some(function (c) { return Object.keys(E.cubeSpots(s, c.id)).length; })) t = 'An animal can move in! Tap its card.';
  else t = 'Done? Tap End turn.';
  if (UI.recap && !UI.busy && UI.view === G.cur && G.turn.took < 0 && !G.over) t = UI.recap;
  if (G.last && !G.over) t += ' Last round!';
  else if (!G.over && G.seats.some(function (x) { return E.empties(x) <= 5; })) t += ' Ending soon!';
  $('#line').textContent = t;
}
function popAt(k, gain) {
  var svg = $('#map'); if (!svg || !ANIM || UI.fast) return;
  var xy = hexXY(k, 40), b = svg.getBoundingClientRect(), vb = svg.viewBox.baseVal, sc = Math.min(b.width / vb.width, b.height / vb.height);
  var ox = b.left + (b.width - vb.width * sc) / 2, oy = b.top + (b.height - vb.height * sc) / 2;
  var d = document.createElement('div'); d.className = 'ptpop' + (gain < 0 ? ' neg' : ''); d.textContent = (gain > 0 ? '+' : '') + gain;
  d.style.left = (ox + (xy[0] - vb.x) * sc) + 'px'; d.style.top = (oy + (xy[1] - vb.y) * sc - 10) + 'px';
  document.body.appendChild(d); setTimeout(function () { d.remove(); }, 1100);
}
function toast(t) { var e = $('#toast'); e.textContent = t; e.classList.add('on'); clearTimeout(e._t); e._t = setTimeout(function () { e.classList.remove('on'); }, 2200); }

// ---------- input ----------
function onTap(e) {
  var t = e.target;
  if (UI.dragged && Date.now() - UI.dragged < 400) return;
  var seatB = t.closest('[data-seat]'); if (seatB) { if (UI.mode === 'tut' && TUT) { toast('Finish the lesson first.'); return; } var v = +seatB.dataset.seat; if (v === UI.view) { toast(v === firstHuman() ? 'This is your valley.' : 'Showing ' + G.seats[v].name + '.'); return; } UI.view = v; UI.sel = null; render(); toast(v === G.cur || v === firstHuman() ? 'Back to your valley.' : 'Showing ' + G.seats[v].name + '. Tap your name to return.'); return; }
  if (!G) return;
  var p = t.closest('[data-pocket]'); if (p) { if (myTurn()) act({ t: 'take', i: +p.dataset.pocket }); return; }
  var ht = t.closest('[data-h]'); if (ht && myTurn()) { UI.sel = { kind: 'tok', h: +ht.dataset.h }; SND.card(); render(); return; }
  var tb = t.closest('[data-tab]'); if (tb) { var same = UI.tab === tb.dataset.tab; UI.tab = tb.dataset.tab; render(); if (same) bump('[data-tab="' + UI.tab + '"]'); return; }
  var rw = t.closest('[data-row]'); if (rw) { bigCard(+rw.dataset.row); return; }
  var ci = t.closest('[data-ci]'); if (ci && myTurn()) { var v = ci.dataset.ci === 'S' ? 'S' : +ci.dataset.ci; UI.sel = (UI.sel && UI.sel.kind === 'card' && UI.sel.ci === v) ? null : { kind: 'card', ci: v }; render(); if (UI.sel && !$$('#map .glow').length) toast('Build its habitat first: see the dashed hex.'); return; }
  if (ci) { var sv = G.seats[UI.view], cid = ci.dataset.ci === 'S' ? sv.spirit.id : (sv.cards[+ci.dataset.ci] || {}).id; if (cid) bigCard(null, cid); return; }
  var hx = t.closest('[data-k]');
  if (hx && myTurn()) {
    var k = hx.dataset.k;
    if (UI.sel && UI.sel.kind === 'tok') { if (!act({ t: 'place', h: UI.sel.h, k: k })) { shake(hx); toast(whyNot(G.seats[UI.view], k, G.turn.hand[UI.sel.h])); } return; }
    if (UI.sel && UI.sel.kind === 'card') { if (!act({ t: 'cube', ci: UI.sel.ci, k: k })) shake(hx); return; }
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
function bigCard(i, idOnly) {
  var id = idOnly || G.row[i], c = E.card(id), s = idOnly ? G.seats[UI.view] : E.seat(), T = G.turn, mine = myTurn() && !idOnly;
  var can = mine && E.legal({ t: 'card', i: i }) && (UI.mode !== 'tut' || !window.tutAllow || tutAllow({ t: 'card', i: i })), fits = Object.keys(E.cubeSpots(s, id)).length;
  var why = idOnly ? '' : !mine ? 'Wait for your turn.' : (UI.mode === 'tut' && TUT && !can) ? 'Follow the lesson first.' : T.tookCard ? 'One animal per turn.' : T.swapped ? 'You swapped a card this turn.' : E.active(s) >= 4 ? 'You hold 4 cards: finish one first.' : '';
  var b = document.createElement('div'); b.className = 'bigc';
  b.innerHTML = '<div class="bigtop"><svg viewBox="0 0 60 60" aria-hidden="true">' + ART.defs('bg') + ART.animal(c.an, 30, 30, 50, '#7a5a44', 'bg') + '</svg><div><h3>' + esc(c.name) + '</h3><p>Build this habitat. The animal lives on the dashed hex. Turn it any way.</p></div></div>' +
    cardSVG(id, null, true) + trackHTML(id, c.pts ? c.pts.length : 0) +
    '<p class="trk">Each animal you settle uncovers the next number. You score the highest one showing.</p>' +
    (!c.pts ? '<p class="fit">' + spiritText(c.sc) + '</p>' : '') + '<p class="fit">' + (fits ? 'Fits this valley now: ' + fits + (fits > 1 ? ' homes.' : ' home.') : 'Not on your valley yet.') + '</p>' +
    (why ? '<p class="why">' + why + '</p>' : '') +
    '<div class="bigacts">' + (can ? '<button type="button" class="btn primary" id="takeB">Invite this animal</button>' : '') + (mine && G.solo && E.legal({ t: 'swap', i: i }) ? '<button type="button" class="btn ghostb" id="swapB">Swap for a new card</button>' : '') + '</div>';
  GX.drawer('bigd', c.pts ? 'Animal card' : 'Spirit card', b, false); GX.show('bigd');
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
function showResults() {
  if (!G || !G.over || !G.result) return;
  var R = G.result, win = R.winners, me = firstHuman(), t;
  if (G.solo) t = R.suns.total + ' sun' + (R.suns.total === 1 ? '' : 's') + '!';
  else if (win.length > 1) t = 'A shared win!';
  else t = (G.seats[win[0]].ai ? G.seats[win[0]].name + ' wins' : (humans() > 1 ? G.seats[win[0]].name + ' wins!' : 'You win!'));
  SND.end();
  var p = $('#rs'); p.hidden = false;
  p.innerHTML = '<div class="rsc"><h2>' + esc(t) + '</h2>' + (G.solo ? '<p class="suns">' + '☀'.repeat(Math.min(10, R.suns.total)) + '</p><p class="small">' + R.scores[0].total + ' points: ' + R.suns.base + ' suns, +' + R.suns.bonus + ' bonus.</p>' : '') +
    scoresHTML() + '<div class="bigacts"><button type="button" class="btn primary" id="againB">Play again</button><button type="button" class="btn ghostb" id="lookB">See the valleys</button><button type="button" class="btn ghostb" id="titleB">Title</button></div></div>';
  $('#againB').onclick = function () { newGame(Object.assign({}, UI.cfg, { seed: null })); };
  $('#lookB').onclick = function () { p.hidden = true; render(); };
  $('#titleB').onclick = function () { showTitle(); };
  try { localStorage.removeItem('mf_save'); } catch (e) { }
}
var RULES_HTML = '<h3>Goal</h3><p>Fold the best paper valley. Shape landscapes, then invite animals to live in them. Most points wins.</p>' +
  '<h3>Your turn</h3><ol><li><b>Take one pocket</b> of 3 tokens and place all 3 on your board.</li><li><b>Invite one animal</b> (optional): take a card. Hold at most 4 unfinished cards.</li><li><b>Settle animals</b> (optional, as many as you can): when a card\'s habitat is on your board, put an animal on its dashed hex. Turn the pattern any way; no mirror images.</li></ol>' +
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
  var c = UI.setup || (UI.setup = { mode: 'quick', ai: 'normal', side: 'A', spirits: false, np: 2 });
  var deco = '<svg class="tdeco" viewBox="0 0 360 170" aria-hidden="true">' + ART.defs('t') +
    '<path d="M0,120 C60,80 120,130 180,95 C240,60 300,110 360,80 L360,170 L0,170Z" fill="#cfe5c4" filter="url(#tsh2)"/>' +
    '<path d="M0,140 C80,115 150,150 220,125 C280,105 320,135 360,120 L360,170 L0,170Z" fill="#a9d39a" filter="url(#tsh2)"/>' +
    ART.stack(['mount', 'mount', 'mount'], 70, 92, 34, 't') + ART.stack(['trunk', 'trunk', 'leaf'], 285, 100, 30, 't') + ART.stack(['mount', 'build'], 215, 112, 24, 't') +
    ART.animal('heron', 130, 118, 44, '#fbf3e4', 't') + ART.animal('fox', 250, 140, 36, '#f6c99a', 't') + ART.animal('rabbit', 40, 145, 30, '#fbf3e4', 't') + '</svg>';
  var seg = function (name, vals, cur) { return '<div class="seg" role="group" aria-label="' + name + '">' + vals.map(function (v) { return '<button type="button" data-set="' + name + '" data-v="' + v[0] + '" class="' + (String(cur) === String(v[0]) ? 'on' : '') + '">' + v[1] + '</button>'; }).join('') + '</div>'; };
  st.innerHTML = '<div class="tcard">' + deco + '<h1>Meadowfold</h1><p class="sub">Fold a paper valley. Invite its animals.</p>' +
    '<div class="tbtns"><button type="button" class="btn primary big" id="tutB">Learn to play (2 min)</button>' + (hasSave ? '<button type="button" class="btn big" id="resB">Continue game</button>' : '') + '</div>' +
    '<div class="setup"><label>Players</label>' + seg('mode', [['quick', 'Vs computer'], ['solo', 'Solo'], ['hot', 'Pass & play']], c.mode) +
    (c.mode === 'quick' ? '<label>Computer</label>' + seg('ai', [['easy', 'Easy'], ['normal', 'Normal'], ['hard', 'Hard']], c.ai) + '<label>Rivals</label>' + seg('np', [[2, '1'], [3, '2'], [4, '3']], c.np) : '') +
    (c.mode === 'hot' ? '<label>Players</label>' + seg('np', [[2, '2'], [3, '3'], [4, '4']], c.np) : '') +
    '<label>Board side</label>' + seg('side', [['A', 'A: river'], ['B', 'B: islands']], c.side) +
    '<label>Spirit cards</label>' + seg('spirits', [['false', 'Off'], ['true', 'On']], c.spirits) +
    '<button type="button" class="btn primary big" id="goB">Start game</button></div></div>';
  $$('[data-set]', st).forEach(function (b) { b.onclick = function () { var k = b.dataset.set, v = b.dataset.v, same = b.classList.contains('on'); c[k] = k === 'np' ? +v : k === 'spirits' ? v === 'true' : v; if (k === 'mode') c.np = v === 'hot' ? Math.max(2, c.np) : c.np; showTitle(); if (same) bump('[data-set="' + k + '"][data-v="' + v + '"]'); }; });
  $('#goB').onclick = function () { startFromSetup(); };
  $('#tutB').onclick = function () { if (window.tutStart) tutStart(); };
  var rb = $('#resB'); if (rb) rb.onclick = function () { if (!load()) newGame(); };
}
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
  GX.onShow = function (id) { if (id === 'scored') $('#scoresb').innerHTML = G ? scoresHTML() : '<p>No game yet.</p>'; if (id === 'rulesd') fillRules(); };
  try {
    GX.settings({ id: 'setd', title: 'Menu',
      game: function (S) { var a = document.createElement('button'); a.type = 'button'; a.className = 'gx-sb'; a.textContent = 'Title screen'; a.onclick = function () { GX.close(); showTitle(); };
        var rs = document.createElement('button'); rs.type = 'button'; rs.className = 'gx-sb'; rs.textContent = 'Restart'; rs.onclick = function () { GX.close(); if (UI.mode === 'tut' && window.tutStart) tutStart(); else newGame(Object.assign({}, UI.cfg, { seed: null })); };
        S.appendChild(GX.row('This game', [rs, a])); },
      sound: function (S) { S.appendChild(GX.row('Sound effects', GX.onoff(!UI.prefs.mute, function (v) { UI.prefs.mute = !v; try { localStorage.setItem('mf_prefs', JSON.stringify(UI.prefs)); } catch (e) { } }))); },
      help: function (S) { var r = document.createElement('button'); r.type = 'button'; r.className = 'gx-sb'; r.textContent = 'Rules'; r.onclick = function () { GX.close(); setTimeout(function () { fillRules(); GX.show('rulesd'); }, 50); }; var tu = document.createElement('button'); tu.type = 'button'; tu.className = 'gx-sb'; tu.textContent = 'Tutorial'; tu.onclick = function () { GX.close(); if (window.tutStart) tutStart(); }; S.appendChild(GX.row('Read', [r, tu])); },
      about: { name: 'Meadowfold', version: '1.0', text: 'Paper art drawn in code. Animal silhouettes: game-icons.net (CC BY 3.0).' } });
    AIDELAY = GX.aiDelay ? GX.aiDelay(650) : 650; if (GX.onPref) GX.onPref(function (k) { if (k === 'ai') AIDELAY = GX.aiDelay(650); });
    if (GX.applyPrefs) GX.applyPrefs();
  } catch (e) { }
  try { UI.prefs = Object.assign(UI.prefs, JSON.parse(localStorage.getItem('mf_prefs') || '{}')); } catch (e) { }
  document.addEventListener('click', onTap); dragInit();
  $('#hintB').onclick = hint;
  GX.onResize(function () { });
  if (window.GXV) GXV.watch(function () { });
  if (!(window.GXS && GXS.on)) showTitle();
}
window.render_game_to_text = function () { if (!G) return 'title'; var s = G.seats[G.cur]; return JSON.stringify({ cur: G.cur, over: G.over, took: G.turn.took, hand: G.turn.hand, scores: G.seats.map(function (x) { return E.score(x).total; }), line: ($('#line') || {}).textContent }); };
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
