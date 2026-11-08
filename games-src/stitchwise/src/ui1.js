// ui1: helpers, state, sound, rendering of quilts, track, strips, dock
var $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
function h(sel) { var p = sel.split('.'), tg = (p[0] || 'div').split('#'), e = document.createElement(tg[0] || 'div'); if (tg[1]) e.id = tg[1]; if (p.length > 1) e.className = p.slice(1).join(' '); for (var i = 1; i < arguments.length; i++) { var a = arguments[i]; if (a == null || a === false) continue; if (typeof a === 'object' && !a.nodeType && !Array.isArray(a)) { for (var k in a) { if (k === 'html') e.innerHTML = a[k]; else e.setAttribute(k, a[k]); } } else if (Array.isArray(a)) a.forEach(function (c) { if (c) e.appendChild(c.nodeType ? c : document.createTextNode(c)); }); else e.appendChild(a.nodeType ? a : document.createTextNode(a)); } return e; }
var PAL = ['#c0527a', '#e0a82e', '#2a8a80', '#4a86b8', '#c8553d', '#6b8e4e', '#8a5ba6', '#d98a3d', '#3f6fa0', '#b0486a', '#5a9a6a'];
function pcol(pid) { return PAL[pid % PAL.length]; } function ppat(pid) { return 'p' + ((pid * 7) % 5); }
var G = null, AIDELAY = 700, rngUI = Math.random;
var UI = { started: false, mode: 'vs', lvl: 'normal', sel: -1, o: 0, gx: 0, gy: 0, busy: 0, camp: null, seq: 0, seq2: 0, newCells: {}, names: ['You', 'Computer'], tm: {}, sound: true, tutorial: false, lastInc: null, wide: false };
try { UI.sound = localStorage.getItem('sw_sound') !== '0'; } catch (e) { }
var SVG_BTN = '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8.5" fill="#e0a82e" stroke="#7a5410" stroke-width="1.4"/><circle cx="10" cy="10" r="5.6" fill="none" stroke="#7a5410" stroke-width="1"/><circle cx="8" cy="8.4" r="1" fill="#5a3a08"/><circle cx="12" cy="8.4" r="1" fill="#5a3a08"/><circle cx="8" cy="11.6" r="1" fill="#5a3a08"/><circle cx="12" cy="11.6" r="1" fill="#5a3a08"/></svg>';
var SVG_TIME = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 2h10M5 18h10M6 2c0 5 8 5 8 8s-8 3-8 8M14 2c0 5-8 5-8 8s8 3 8 8" fill="none" stroke="#3a2a18" stroke-width="1.6" stroke-linecap="round"/><path d="M7.5 15.5h5L10 12.5z" fill="#c8553d"/></svg>';
var SVG_LEA = '<svg viewBox="0 0 20 20" aria-hidden="true"><rect x="3" y="3" width="14" height="14" rx="2" fill="#8a5a3a" stroke="#4a2a12" stroke-width="1.2"/><rect x="6" y="6" width="8" height="8" fill="none" stroke="#f0d9b0" stroke-width="1.2" stroke-dasharray="2 1.5"/></svg>';
function leaIc() { var i = artImg('icon-leather', 'ic'); return i ? i.outerHTML : SVG_LEA; }
function bonusIc() { var i = artImg('icon-bonus', 'ic'); return i ? i.outerHTML : '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="8" r="6" fill="#e0a82e" stroke="#7a5410" stroke-width="1.3"/><path d="M6 13l-2 6 6-3 6 3-2-6" fill="#c8553d"/></svg>'; }
function btnIc() { var i = artImg('icon-button', 'ic'); return i ? i.outerHTML : SVG_BTN; }
function timeIc() { var i = artImg('icon-hourglass', 'ic'); return i ? i.outerHTML : SVG_TIME; }
// ---------- sound: small synth, off-able; respects the shelf volume sliders
var AC = null;
function tone(f, d, type, vol, at) { if (!UI.sound) return; try { if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume(); var o = AC.createOscillator(), g = AC.createGain(), t = AC.currentTime + (at || 0), v = (vol == null ? .12 : vol) * (GX.pref('sfx') == null ? 1 : GX.pref('sfx')) * (GX.pref('master') == null ? 1 : GX.pref('master')); o.type = type || 'sine'; o.frequency.setValueAtTime(f, t); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.0001, t + d); o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t + d + .02); } catch (e) { } }
var SFX = { pick: function () { tone(520, .08, 'triangle'); }, tick: function () { tone(700, .05, 'square', .05); }, place: function () { tone(160, .14, 'sine', .22); tone(880, .12, 'triangle', .1, .06); tone(1320, .12, 'triangle', .08, .12); }, coin: function (i) { tone(1100 + (i || 0) * 90, .1, 'triangle', .1); tone(1650 + (i || 0) * 90, .12, 'triangle', .08, .06); }, adv: function () { tone(300, .18, 'sawtooth', .05); tone(450, .18, 'sawtooth', .04, .08); }, bad: function () { tone(140, .18, 'square', .08); }, rot: function () { tone(620, .05, 'triangle', .07); }, win: function () { [523, 659, 784, 1046].forEach(function (f, i) { tone(f, .22, 'triangle', .12, i * .13); }); }, lose: function () { [440, 392, 330].forEach(function (f, i) { tone(f, .26, 'sine', .1, i * .16); }); }, bonus: function () { [784, 988, 1175, 1568].forEach(function (f, i) { tone(f, .2, 'triangle', .1, i * .09); }); } };
SFX.fanfare = function () { [523, 659, 784, 1047].forEach(function (f, i) { tone(f, .22, 'triangle', .14, i * .12); }); tone(1047, .6, 'sine', .1, .5); tone(1568, .5, 'triangle', .06, .55); };
SFX.thud = function () { tone(110, .16, 'sine', .2); };
function sfx(n, a) { try { SFX[n](a); } catch (e) { } }
function toast(t, ms) { var e = $('#toast'); if (!e) return; if (G && UI.started && !G.over && !hintsOn() && !$('#start:not([hidden])')) return; e.textContent = t; e.classList.add('on'); e.onclick = function () { e.classList.remove('on'); }; clearTimeout(toast.t); toast.t = setTimeout(function () { e.classList.remove('on'); }, Math.max(ms || 0, 4000 + 100 * t.split(/\s+/).length)); } // W470: stays >= 4 s + 1 s per 10 words, tap closes
function amt(ms) { return GX.animMs ? GX.animMs(ms) : ms; }
function later(ms, f) { var q = UI.seq; return setTimeout(function () { if (q === UI.seq) f(); }, ms); }
// ---------- who is who
function isHuman(s) { return UI.mode === 'hot' ? true : s === 0; }
function viewSeat() { if (!G) return 0; if (UI.peek >= 0) return UI.peek; if (UI.mode === 'hot') { var w = swWho(G); return w < 0 ? 0 : w; } return 0; }
function nameOf(s) { return UI.names[s] || (s === 0 ? 'You' : 'Computer'); }
function lvlOf(s) { return UI.mode === 'hot' ? 'human' : (UI.camp ? UI.camp.opponent.aiLevel : UI.lvl); }
// ---------- layout (board sized to the space the shell leaves)
function layout() {
  document.documentElement.classList.toggle('sm', innerHeight < 700); var b = GX.boardSize(), W = b.w, H = b.h, wide = W > H * 1.12 && W >= 600; UI.wide = wide; var bd = $('#bd'); bd.classList.toggle('wide', wide);
  var cs;
  if (wide) cs = Math.floor(Math.min((H - 20 - 12) / 9, (W * 0.55) / 9)); else cs = Math.floor(Math.min((W - 16 - 10) / 9, (H - 12 - 46 - 56 - 22 - 26) / 9));
  cs = Math.max(18, Math.min(72, cs)); document.documentElement.style.setProperty('--cs', cs + 'px'); UI.cs = cs;
  var tw = wide ? Math.max(190, Math.min(520, W - 9 * cs - 70)) : Math.min(W - 16, 560); var tr = $('#track'); if (tr) tr.style.width = tw + 'px';
}
// ---------- quilt
function patchBoxes(board) { var bx = {}; for (var i = 0; i < 81; i++) { var p = board[i]; if (p < 0 || p > 98) continue; var x = i % 9, y = (i / 9) | 0, b = bx[p] || (bx[p] = [9, 9, 0, 0]); if (x < b[0]) b[0] = x; if (y < b[1]) b[1] = y; if (x > b[2]) b[2] = x; if (y > b[3]) b[3] = y; } return bx; }
function quiltEl(seat, cls) {
  var board = G.board[seat], q = h('div#quilt.' + cls), bx = patchBoxes(board), cs = UI.cs || 36;
  for (var i = 0; i < 81; i++) {
    var p = board[i], x = i % 9, y = (i / 9) | 0, c = h('div.qc'); c.dataset.x = x; c.dataset.y = y;
    if (p === 99) { c.classList.add('torn'); if (artHas('torn-square')) artBg(c, 'torn-square'); } else if (p === 100) { c.classList.add('lea'); if (artHas('patch-leather')) { artBg(c, 'patch-leather'); c.style.backgroundSize = 'cover'; } } else if (p >= 0) {
      c.classList.add('f', ppat(p)); c.style.setProperty('--pc', pcol(p));
      if (x === 0 || board[i - 1] !== p) c.classList.add('eL'); if (x === 8 || board[i + 1] !== p) c.classList.add('eR'); if (y === 0 || board[i - 9] !== p) c.classList.add('eT'); if (y === 8 || board[i + 9] !== p) c.classList.add('eB');
      if (artHas(fabricStem(p))) { var b = bx[p], sz = Math.max(b[2] - b[0] + 1, b[3] - b[1] + 1) * cs; c.style.backgroundImage = 'url(media/' + fabricStem(p) + '.webp)'; c.style.backgroundSize = sz + 'px ' + sz + 'px'; c.style.backgroundPosition = (-(x - b[0]) * cs) + 'px ' + (-(y - b[1]) * cs) + 'px'; c.classList.add('img'); }
    }
    if (UI.newCells[seat + ':' + i]) c.classList.add('new');
    q.appendChild(c);
  }
  if (UI.useQuiltFrame && artBg(q, 'quilt-frame')) { // W381: the temp/free frame draws a panel that does not line up with the 9x9 grid; off until real art
    q.classList.add('art'); q.style.backgroundSize = '100% 100%'; }
  q.setAttribute('aria-label', nameOf(seat) + ' quilt: ' + swEmpty(board) + ' empty squares');
  return q;
}
function thumb(seat) { var c = document.createElement('canvas'); c.width = c.height = 90; c.className = 'thumb'; var x = c.getContext('2d'); x.fillStyle = '#f1e5c8'; x.fillRect(0, 0, 90, 90); for (var i = 0; i < 81; i++) { var p = G.board[seat][i]; if (p === -1) continue; x.fillStyle = p === 99 ? '#4d4032' : p === 100 ? '#8a5a3a' : pcol(p); x.fillRect((i % 9) * 10 + 0.5, ((i / 9) | 0) * 10 + 0.5, 9, 9); } return c; }
function strip(seat) {
  var sc = swScore(G, seat), w = (UI.peek >= 0 ? UI.peek : swWho(G)) === seat && !G.over;
  return h('button.pstrip' + (w ? '.turn' : ''), { type: 'button', 'data-a': 'strip', 'data-seat': seat, title: 'Score now ' + sc.total, 'aria-label': nameOf(seat) + ': ' + G.btn[seat] + ' buttons, income ' + G.inc[seat] + ', score ' + sc.total + '. Tap for their quilt.' },
    h('span.dot', { style: 'background:' + (seat === 0 ? 'var(--me)' : 'var(--opp)') }), thumb(seat), h('b', nameOf(seat) + (sc.total > swScore(G, 1 - seat).total ? ' \u2605' : ''), h('span.pts', ' ' + sc.total + ' pts')),
    h('span.st', h('span.bt', { html: '<span class="nb" data-seat="' + seat + '">' + G.btn[seat] + '</span> buttons \u00B7', title: 'Buttons' }), false ? h('span.bt', { html: '<small>income</small> +' + G.inc[seat], title: 'Buttons earned each time a gold spot is passed' }) : null, h('span.bt.emp', { title: 'Empty squares (gaps), -2 each' }, sc.empty + ' empty'), G.bonus === seat ? h('span.bt', { html: bonusIc() + '+7', title: '7x7 bonus' }) : null));
}
// ---------- track
function trackCols() { return UI.wide ? 9 : 18; }
function trackPos(i) { var cols = trackCols(), r = (i / cols) | 0, c = i % cols; if (r % 2) c = cols - 1 - c; return [r, c]; }
function renderTrack() {
  var cols = trackCols(), rows = Math.ceil(54 / cols), t = $('#track'); if (!t) { t = h('div#track', { role: 'img' }); }
  t.innerHTML = ''; t.style.gridTemplateColumns = 'repeat(' + cols + ',1fr)'; t.style.gridTemplateRows = 'repeat(' + rows + ',auto)';
  for (var i = 0; i <= SW.TRACK; i++) { var rc = trackPos(i), cell = h('div.tc'); cell.dataset.i = i; cell.style.gridRow = rc[0] + 1; cell.style.gridColumn = rc[1] + 1;
    if (SW.BTN_SPOTS.indexOf(i) >= 0) { cell.classList.add('bspot'); cell.innerHTML = btnIc(); } else if (SW.LEATHER_SPOTS.indexOf(i) >= 0) { cell.classList.add('lspot'); var taken = G.leather[SW.LEATHER_SPOTS.indexOf(i)] !== null; cell.innerHTML = taken ? '<span style="opacity:.45">&#10003;</span>' : leaIc(); } else if (i === 0) cell.classList.add('tstart'); else if (i === 53) cell.classList.add('tend');
    if (rc[0] % 2) cell.classList.add('trv'); if (i < Math.min(G.pos[0], G.pos[1])) cell.classList.add('past'); t.appendChild(cell); }
  artBg(t, 'track-frame'); t.style.backgroundSize = 'cover';
  [1, 0].forEach(function (s) { var k = h('div.tk.' + (s === 0 ? 'me' : 'opp'), { 'data-seat': s, title: nameOf(s) + ' at ' + G.pos[s] }); if (artHas(s === 0 ? 'token-me' : 'token-opp')) { artBg(k, s === 0 ? 'token-me' : 'token-opp'); k.style.backgroundSize = 'contain'; k.style.border = '0'; k.style.boxShadow = 'none'; } t.appendChild(k); });
  t.setAttribute('aria-label', 'Time track. ' + nameOf(0) + ' at ' + G.pos[0] + ' of 53, ' + nameOf(1) + ' at ' + G.pos[1] + '.');
  return t;
}
function placeTokens() { var t = $('#track'); if (!t) return; var top = G.stamp[0] > G.stamp[1] ? 0 : 1, last = UI.tokPos || G.pos.slice(); UI.tokPos = G.pos.slice();
  function at(k, cellI, s) { var c = $('.tc[data-i="' + cellI + '"]', t); if (!k || !c) return; var hw = (k.offsetWidth || 20) / 2; k.style.left = (c.offsetLeft + c.offsetWidth / 2 - hw + (G.pos[0] === G.pos[1] ? (s === 0 ? -6 : 6) : 0)) + 'px'; k.style.top = (c.offsetTop + c.offsetHeight / 2 - hw) + 'px'; }
  [0, 1].forEach(function (s) { var k = $('.tk[data-seat="' + s + '"]', t); if (!k) return; k.classList.toggle('top', G.pos[0] === G.pos[1] && s === top); if (last[s] !== G.pos[s] && amt(1)) { k.style.transition = 'none'; at(k, last[s], s); void k.offsetWidth; k.style.transition = ''; } at(k, G.pos[s], s); }); }
function markLanding() {
  var t = $('#track'); if (!t || !G) return; $$('.tc.land,.tc.next', t).forEach(function (e) { e.classList.remove('land', 'next'); }); var s = swWho(G); if (s < 0) s = 0; var pos = G.pos[s], nx = null;
  SW.BTN_SPOTS.concat(SW.LEATHER_SPOTS.filter(function (l, i) { return G.leather[i] === null; })).forEach(function (b) { if (b > pos && (nx === null || b < nx)) nx = b; });
  var c = nx != null && $('.tc[data-i="' + nx + '"]', t); if (c) c.classList.add('next');
  var p = curPatch(); if (p) { var l = $('.tc[data-i="' + Math.min(SW.TRACK, pos + p.time) + '"]', t); if (l) l.classList.add('land'); }
}
function trackInfo() {
  var s = swWho(G), me = s >= 0 ? s : 0, pos = G.pos[me], nb = null, nl = null; SW.BTN_SPOTS.forEach(function (b) { if (nb === null && b > pos) nb = b; }); SW.LEATHER_SPOTS.forEach(function (l, i) { if (nl === null && l > pos && G.leather[i] === null) nl = l; });
  return 'Gold spot (income) in ' + (nb == null ? '-' : nb - pos) + ' \u00B7 free patch in ' + (nl == null ? '-' : nl - pos);
}
// ---------- render everything
function render() {
  if (!G) return; renderDock(); layout(); var vs = viewSeat(), os = 1 - vs, qc = $('#qcol'), sd = $('#side'); qc.innerHTML = ''; sd.innerHTML = '';
  var q = quiltEl(vs, 'me'); UI.newCells = {}; if (UI.mode !== 'hot' && vs !== 0) q.appendChild(h('div.qlabel', nameOf(vs) + '\u2019s quilt'));
  artBg($('#board'), 'bg-table');
  var ps = UI.peek >= 0 && UI.mode !== 'hot' ? 0 : vs, pills = h('div#pills', strip(ps), strip(1 - ps)), sbar = scoreBar();
  if (UI.wide) { qc.appendChild(q); sd.appendChild(pills); if (hintsOn()) sd.appendChild(sbar); } else { qc.appendChild(pills); qc.appendChild(q); }
  var tr = renderTrack(); sd.appendChild(tr);
  if (UI.wide && !(UI.wide && hintsOn())) { var mcs = Math.max(14, Math.min(30, Math.floor(((innerHeight - 330) / 9)))), sv = UI.cs, svn = UI.newCells; UI.cs = mcs; UI.newCells = {}; var oq = quiltEl(os, 'opp'); UI.cs = sv; UI.newCells = svn; oq.removeAttribute('id'); oq.className = 'oppq'; oq.style.setProperty('--cs', mcs + 'px'); oq.style.backgroundImage = 'none'; oq.setAttribute('data-a', 'strip'); oq.setAttribute('data-seat', os); oq.setAttribute('role', 'button'); oq.setAttribute('aria-label', nameOf(os) + ' quilt, tap to enlarge'); sd.appendChild(h('div.oppwrap', h('span', os === 0 && UI.mode !== 'hot' ? 'Your quilt' : nameOf(os) + '\u2019s quilt'), oq)); } if (UI.wide && hintsOn()) { sd.appendChild(h('div#tinfo', trackInfo())); var om = h('button.oppmini', { type: 'button', 'data-a': 'strip', 'data-seat': os, 'aria-label': nameOf(os) + ' quilt, tap to enlarge' }, thumb(os), h('span', h('b', os === 0 && UI.mode !== 'hot' ? 'Your quilt' : nameOf(os) + '\u2019s quilt'), h('small', swScore(G, os).empty + ' empty squares \u00B7 score now ' + swScore(G, os).total))); sd.appendChild(om); } placeTokens(); markLanding();
  drawGhost();
  var bp = $('#barprompt'); if (bp) bp.textContent = G.over ? 'Game over' : UI.peek >= 0 ? nameOf(UI.peek) + ' is stitching' : (isHuman(swWho(G)) ? (UI.mode === 'hot' ? nameOf(swWho(G)) + ' to play' : 'Your turn') : nameOf(swWho(G)) + ' is stitching');
  var gl = $('#goalline'); if (gl) { gl.hidden = !UI.camp; if (UI.camp) gl.textContent = 'Goal: ' + UI.camp.goal.text + (UI.camp.twist ? ' \u00B7 ' + UI.camp.twist.text : ''); }
  try { if (typeof coachRender === 'function') coachRender(); } catch (e) { }
  try { if (typeof hlpRefresh === 'function') hlpRefresh(); } catch (e) { }
}
function patchShape(pid, cls, oc, cells) { var p = PATCHES[pid], c = cells || p.cells, w = 0, ht = 0; c.forEach(function (q) { if (q[0] > w) w = q[0]; if (q[1] > ht) ht = q[1]; }); var s = h('div.shape' + (cls ? '.' + cls : ''), { style: 'grid-template-columns:repeat(' + (w + 1) + ',' + oc + 'px);grid-template-rows:repeat(' + (ht + 1) + ',' + oc + 'px);--pc:' + pcol(pid) }), set = {}; c.forEach(function (q) { set[q[0] + ',' + q[1]] = 1; });
  for (var y = 0; y <= ht; y++) for (var x = 0; x <= w; x++) { var e = h('i.sc' + (set[x + ',' + y] ? '' : '.e')); e.style.width = e.style.height = oc + 'px'; if (set[x + ',' + y] && artHas(fabricStem(pid))) { var sz = Math.max(w + 1, ht + 1) * oc; e.style.backgroundImage = 'url(media/' + fabricStem(pid) + '.webp)'; e.style.backgroundSize = sz + 'px ' + sz + 'px'; e.style.backgroundPosition = (-x * oc) + 'px ' + (-y * oc) + 'px'; } s.appendChild(e); }
  return s; }
function facts(p) { return '<span class="bt" title="Cost in buttons">' + btnIc() + p.cost + '</span><span class="bt" title="Time it takes">' + timeIc() + p.time + '</span><span class="bt" title="Buttons earned at each button spot">' + btnIc() + '×' + p.inc + '</span>'; }
function offerFacts(p) { return '<span class="of oc" title="Price in buttons">' + btnIc() + '<b>' + p.cost + '</b></span><span class="of ot" title="Time: spaces you move">' + timeIc() + '<b>' + p.time + '</b></span><span class="of oi" title="Buttons it pays at each gold spot"><b>+' + p.inc + '</b>' + btnIc() + '</span>'; }
// W381c: see how you score. Value of a patch for a seat = 2 per square covered (each empty square costs 2) - its button cost + its buttons x gold spots still ahead.
// W381 Addendum 7: Play is clean by default; Hints (top-bar toggle, off by default) or the Learn-to-play game show previews, badges and ratings.
UI.hints = (function () { try { return localStorage.getItem('sw_hints') === '1'; } catch (e) { return false; } })();
function hintsOn() { return !!(UI.hints || UI.coach); }
function spotsAhead(pos) { return SW.BTN_SPOTS.filter(function (b) { return b > pos; }).length; }
function patchValue(seat, pid) { var p = PATCHES[pid], np = Math.min(SW.TRACK, G.pos[seat] + p.time), sp = spotsAhead(np); return { sq: p.n, pts: p.n * 2, cost: p.cost, inc: p.inc, spots: sp, incv: p.inc * sp, net: p.n * 2 - p.cost + p.inc * sp }; }
function advValue(seat) { return swAdvSteps(G, seat); }
function best7(board, extra) { // most squares filled in any 7x7 block (extra = cells of the ghost)
  var f = board.map(function (v) { return v !== -1; }); (extra || []).forEach(function (i) { f[i] = true; }); var best = 0;
  for (var y0 = 0; y0 <= 2; y0++) for (var x0 = 0; x0 <= 2; x0++) { var n = 0; for (var y = y0; y < y0 + 7; y++) for (var x = x0; x < x0 + 7; x++) if (f[y * 9 + x]) n++; if (n > best) best = n; } return best; }
function sgn(n) { return (n >= 0 ? '+' : '\u2212') + Math.abs(n); }
function scoreBar() { // always visible: you vs the rival, leader marked
  var sc = [swScore(G, 0), swScore(G, 1)], lead = sc[0].total === sc[1].total ? -1 : sc[0].total > sc[1].total ? 0 : 1, bar = h('div#scorebar', { 'aria-label': 'Score now' });
  [0, 1].forEach(function (s) { var c = sc[s]; bar.appendChild(h('span.sb' + (lead === s ? '.lead' : ''), h('b', (lead === s ? '\u2605 ' : '') + nameOf(s) + ' ' + sgn(c.total)), h('small', '(' + c.btn + ' \u2212 ' + c.empty + '\u00D72' + (c.bonus ? ' + 7' : '') + ')'))); });
  return bar; }
function turnTracker(s) { // whose turn and why (the token further back moves), spaces left
  if (G.over) return 'Game over'; var o = 1 - s, me = UI.mode !== 'hot' && isHuman(s), nm = me ? 'You' : nameOf(s), d = G.pos[o] - G.pos[s], sp = function (n) { return n + ' space' + (n === 1 ? '' : 's'); };
  if (G.pend) return nm + (me ? ' get' : ' gets') + ' a free 1\u00D71 patch';
  if (G.pos[o] >= SW.TRACK) return nm + (me ? ' go' : ' goes') + ': ' + nameOf(o) + ' has finished';
  if (d > 0) return nm + (me ? ' are ' : ' is ') + sp(d) + ' behind, so ' + (me ? 'you go' : 'goes') + ' next';
  return 'Level: ' + (me ? 'you' : nameOf(s)) + ' landed on top, so ' + (me ? 'you go' : 'goes') + ' next'; }
function rateMove(m) { // compare the human's move with the best value on offer (the solver's yardstick)
  var s = swWho(G), off = swOffer(G), opts = [];
  off.forEach(function (pid, k) { var p = PATCHES[pid]; if (G.btn[s] >= p.cost && swPlacements(G.board[s], p).length) opts.push({ k: k, name: p.name, v: patchValue(s, pid).net }); });
  opts.push({ k: -1, name: 'Advance', v: advValue(s) }); var best = opts.reduce(function (a, b) { return b.v > a.v ? b : a; });
  var mine = m.t === 'adv' ? opts[opts.length - 1] : opts.filter(function (o) { return o.k === m.k; })[0]; if (!mine) return '';
  var d = best.v - mine.v, verdict = d <= 1 ? 'good' : d <= 4 ? 'okay' : 'poor';
  return 'Last turn: ' + verdict + ' (' + sgn(mine.v) + ').' + (d <= 1 ? ' Best value on offer.' : ' Best was ' + best.name + ' (' + sgn(best.v) + ').'); }
function renderDock() {
  var s = UI.peek >= 0 ? UI.peek : swWho(G), hum = !G.over && isHuman(s) && !(UI.peek >= 0), off = swOffer(G), box = $('#offers'), pr = $('#prompt'), ac = $('#acts'), dt = $('#detail'), dh = $('.gx-dt');
  box.innerHTML = ''; ac.innerHTML = ''; dt.innerHTML = ''; pr.classList.toggle('rv-cap', !G.over && !hum && UI.mode !== 'hot');
  off.forEach(function (pid, k) {
    var p = PATCHES[pid], aff = hum && !G.pend && G.btn[s] >= p.cost, fits = hum && !G.pend && swPlacements(G.board[s], p).length > 0, why = !hum ? '' : G.pend ? '' : !aff ? 'need ' + (p.cost - G.btn[s]) + ' more' : !fits ? 'no room' : '';
    var can = hum && !G.pend && aff && fits, val = hintsOn() && hum && !G.pend && aff && fits ? patchValue(s, pid).net : null;
    var b = h('button.offer' + (UI.sel === k ? '.sel' : '') + (hum && !G.pend && (!aff || !fits) ? '.no.cant' : '') + (!hum ? '.no' : '') + (can && UI.sel < 0 ? '.can' : '') + (UI.sel >= 0 && UI.sel !== k ? '.dim' : ''), { type: 'button', 'data-a': 'offer', 'data-k': k, 'data-why': why, 'aria-label': p.name + ': cost ' + p.cost + ' buttons, time ' + p.time + ', earns ' + p.inc + ' per button spot, ' + p.n + ' squares' });
    if (artHas('ui-offer-card')) { artBg(b, 'ui-offer-card'); b.style.backgroundImage = 'linear-gradient(#fffaf0e6,#fffaf0e6),' + b.style.backgroundImage; b.style.backgroundSize = 'cover'; }
    if (val != null) b.dataset.val = val; b.appendChild(h('span.onm', p.name)); var bb = bbox(p.cells), sm = document.documentElement.classList.contains('sm'), wd = innerWidth >= 1024; b.appendChild(patchShape(pid, '', Math.max(9, Math.min(sm ? 12 : wd ? 28 : 22, Math.floor((sm ? 60 : wd ? 112 : 100) / bb[0]), Math.floor((sm ? 44 : wd ? 76 : 58) / bb[1]))))); b.appendChild(h('div.meta.ofx', { html: offerFacts(p) })); box.appendChild(b);
  });
  var vs = $$('.offer[data-val]', box); if (vs.length) { var bst = vs.reduce(function (a, b) { return +b.dataset.val > +a.dataset.val ? b : a; }); bst.appendChild(h('span.badge', 'Best ' + sgn(+bst.dataset.val))); }
  if (!off.length) box.appendChild(h('div', 'No patches left.'));
  if (G.over) { pr.textContent = 'The fair is over.'; dh.textContent = 'Result'; ac.appendChild(h('button.btn.go', { type: 'button', 'data-a': 'result' }, 'See the result')); return; }
  dh.textContent = turnTracker(s);
  if (G.pend) { pr.textContent = hum ? 'Free 1×1 patch! Tap any empty square on your quilt' : nameOf(s) + ' sews a free 1×1 patch'; if (hum) { box.style.display = 'none'; dt.textContent = 'You passed a leather space on the track. The 1×1 patch is yours, sew it anywhere.'; } return; }
  box.style.display = '';
  if (!hum) { pr.textContent = UI.cap || (nameOf(s) + ' is thinking…'); return; }
  if (UI.sel >= 0) {
    var pid = off[UI.sel], p = PATCHES[pid], ok = ghostOk(), pv = patchValue(s, pid), gc = ok ? (curCells() || []).map(function (c) { return (UI.gy + c[1]) * 9 + UI.gx + c[0]; }) : [];
    pr.textContent = hintsOn() ? (ok ? 'Sew it on: ' : 'Drag it onto your quilt: ') + 'worth ' + sgn(pv.net) : ok ? 'Good spot! Tap Sew it on' : 'Drag the patch onto your quilt';
    dt.innerHTML = '<b>' + sgn(pv.pts) + '</b> for ' + pv.sq + ' squares \u00B7 <b>\u2212' + pv.cost + '</b> cost \u00B7 <b>+' + pv.incv + '</b> income \u00B7 time ' + p.time; if ((!UI.wide && UI.camp) || !hintsOn()) dt.innerHTML = '';
    ac.appendChild(h('button.btn.alt.sm', { type: 'button', 'data-a': 'rot', 'aria-label': 'Rotate' }, h('span', { html: '<svg viewBox="0 0 24 24"><path d="M20 12a8 8 0 1 1-3-6.2M20 4v5h-5"/></svg>' }), 'Rotate'));
    ac.appendChild(h('button.btn.alt.sm', { type: 'button', 'data-a': 'flip', 'aria-label': 'Flip' }, h('span', { html: '<svg viewBox="0 0 24 24"><path d="M12 3v18M8 7L3 12l5 5zM16 7l5 5-5 5z"/></svg>' }), 'Flip'));
    ac.appendChild(h('button.btn.go.grow', { type: 'button', 'data-a': 'sew', disabled: ok ? null : 'disabled' }, 'Sew it on'));
    ac.appendChild(h('button.btn.alt.sm', { type: 'button', 'data-a': 'cancel', 'aria-label': 'Cancel' }, 'Cancel'));
  } else {
    var nCan = off.filter(function (pid) { var q = PATCHES[pid]; return G.btn[s] >= q.cost && swPlacements(G.board[s], q).length > 0; }).length;
    pr.textContent = UI.again ? UI.again : nCan ? 'Tap a glowing patch, or tap Advance' : 'No patch you can buy: tap Advance';
    var st = swAdvSteps(G, s), o = nameOf(1 - s);
    ac.appendChild(h('button.btn.adv.grow', { type: 'button', 'data-a': 'adv', title: 'Move your token just ahead of ' + o + ' and take ' + st + ' button' + (st === 1 ? '' : 's') }, 'Advance +' + st + ' button' + (st === 1 ? '' : 's')));
    dt.textContent = hintsOn() && (UI.wide || !UI.camp) ? UI.rate || trackInfo() : '';
    if (UI.hints && !UI.coach) ac.appendChild(h('button.btn.alt.sm', { type: 'button', 'data-a': 'whatdo' }, 'What should I do?'));
  }
}

// score drawer: every number's why, on tap only
function showScoreDrawer() {
  if (!G) return; var w = h('div.scored');
  [0, 1].forEach(function (s) { var c = swScore(G, s); w.appendChild(h('div.sdp', h('b', nameOf(s) + ': ' + sgn(c.total)),
    h('div', c.btn + ' buttons = ' + c.btn + ' points (buttons are money and score)'),
    h('div', c.empty + ' gaps \u00D7 \u22122 = \u2212' + c.empty * 2 + ' (every empty square costs 2)'),
    h('div', (c.bonus ? '+7 for the first full 7\u00D77 block' : '7\u00D77 bonus: nobody yet. Your best block: ' + best7(G.board[s]) + '/49.')),
    h('div', 'Income +' + G.inc[s] + ': paid at each gold spot passed (' + spotsAhead(G.pos[s]) + ' still ahead)'))); });
  var ob = h('button.btn.alt.sm', { type: 'button' }, 'See ' + nameOf(1) + '\u2019s quilt'); ob.onclick = function () { GX.close(); showOppQuilt(1); }; w.appendChild(ob);
  GX.drawer('scored', 'Score', w); var dr = $('#scored .gx-drawer-body'); if (dr) { dr.innerHTML = ''; dr.appendChild(w); } GX.show('scored');
}
function setHints(on) { UI.hints = !!on; try { localStorage.setItem('sw_hints', on ? '1' : '0'); } catch (e) { } var b = $('#bulbbtn'); if (b) { b.classList.toggle('on', UI.hints); b.setAttribute('aria-pressed', UI.hints ? 'true' : 'false'); b.setAttribute('aria-label', 'Hints ' + (UI.hints ? 'on' : 'off')); b.textContent = 'Hints ' + (UI.hints ? 'on' : 'off'); } if (G) render(); }
function showGoal() { // one card before turn 1 in Play: the aim in one sentence, 3 ways to score
  UI.goal = true; clearTimeout(UI.tm.ai); UI.seq++; var ov = h('div#goalcard.ov', { role: 'dialog', 'aria-label': 'Goal' }), c = h('div.gcard');
  c.appendChild(h('h2', 'Win with the most points when time runs out.'));
  var ul = h('ul'); ['Score = your buttons, minus 2 for each empty square.', 'Cover squares with patches. Buttons pay for them.', 'Fill a 7\u00D77 block first: +7 points.'].forEach(function (t, i) { var li = h('li', t); if (i === 2 && typeof bonusTileHtml === 'function') li.insertAdjacentHTML('afterbegin', bonusTileHtml()); ul.appendChild(li); }); c.appendChild(ul);
  var b = h('button.btn.go.grow', { type: 'button', 'data-a': 'goalok' }, 'Start'); c.appendChild(b); ov.appendChild(c); document.body.appendChild(ov);
}
function closeGoal() { var g = $('#goalcard'); if (g) g.remove(); UI.goal = false; schedule(); }
