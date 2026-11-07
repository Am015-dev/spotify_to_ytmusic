// ===================== render.js: state, helpers, rendering (board, dock, hand, opponents, feeder, tray) =====================
var G = null;
var UI = { mode: 'vs', view: 0, sel: null, pend: null, gsDie: null, busy: false, fxOn: false, camp: null, hints: true, fast: false, keep: null, timers: [], started: 0, lastHuman: 0 };
var $ = function (s, r) { return (r || document).querySelector(s); };
var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
var B = PP.B, HABN = ['forest', 'grassland', 'wetland'], HABC = ['F', 'G', 'W'];
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function isHuman(s) { return G && G.pl[s] && G.pl[s].kind === 'human'; }
function humans() { return G ? G.pl.map(function (p, i) { return p.kind === 'human' ? i : -1; }).filter(function (i) { return i >= 0; }) : []; }
function myTurn() { if (!G || G.phase === 'over') return false; var s = PP.sideToAct(G); return isHuman(s) && s === UI.view && !UI.busy && !UI.passing; }
function q() { return G && G.q; }
function toast(t, ms) { var w = $('#toast'), d = document.createElement('div'); d.className = 't'; d.textContent = t; w.appendChild(d); setTimeout(function () { d.remove(); }, ms || 2600); while (w.children.length > 3) w.firstChild.remove(); }
function aMs(ms) { if (UI.fast) return 0; var sp = UI.speed || 1; try { return Math.round((GX.animMs ? GX.animMs(ms) : ms) / sp); } catch (e) { return ms; } }
function costHTML(b) { return b.c.map(function (s) { if (s === '*') return foodIcon('any'); var p = s.split('|'); return p.length > 1 ? p.map(function (f) { return foodIcon(f); }).join('<i>/</i>') : foodIcon(s); }).join(b.c.some(function (s) { return s.indexOf('|') >= 0; }) ? '' : '<i>+</i>'); }
// a bird card: size 'slot' (on the board: picture, points, eggs/cache/tuck) | 'hand' (name, cost, habitats) | 'tray'
function cardHTML(id, size, st, attrs) {
  var b = B[id], pw = PP.power(id), col = pw.col || 'none';
  var h = '<div class="bc ' + (size === 'slot' ? 'on-board' : '') + '" ' + (attrs || '') + ' aria-label="' + esc(b.n + ', ' + b.p + ' points') + '">';
  h += '<div class="pic">' + artHTML('bird-' + id) + '<span class="hband">' + b.h.split('').map(function (x) { return '<i class="h' + x + '"></i>'; }).join('') + '</span><span class="vp">' + b.p + '</span></div><div class="pwbar ' + col + '"></div>';
  if (size === 'slot') {
    h += '<div class="meta">';
    if (st && st.eggs) h += eggIcon() + '<b>' + st.eggs + '</b>';
    else h += '<span style="opacity:.6">' + nestIcon(b.nest) + '</span>';
    if (st && st.cache) h += '<span class="tk" title="cached food">+' + st.cache + '</span>';
    if (st && st.tuck) h += '<span class="tk" title="tucked cards">' + st.tuck + '▤</span>';
    h += '</div>';
  } else if (size === 'tray') {
    h += '';
  } else {
    h += '<div class="nm">' + esc(b.n) + '</div><div class="cost">' + costHTML(b) + '</div>' + (size === 'hand' ? '<div class="pwt ' + col + '">' + esc(pw.txt || 'No power.') + '</div>' : '') + '<div class="habs">' + b.h.split('').map(function (x) { return '<i class="h' + x + '"></i>'; }).join('') + nestIcon(b.nest) + '</div>';
  }
  return h + '</div>';
}
// ---------------- render
function render() {
  if (!G) return;
  var vs = UI.view, p = G.pl[vs], cur = PP.sideToAct(G);
  $('#barstat').textContent = G.phase === 'over' ? 'Final' : 'Round ' + (G.round + 1) + '/' + G.rounds;
  renderOpps(cur); renderMid(); renderMat(p, vs); renderDock(p, vs, cur); renderGoalbar(); fitMat();
  glow();
  try { if (window.GXH && GXH.phase) GXH.phase(helpPhase()); } catch (e) { }
  try { coachState(); } catch (e) { }
}
// live chapter goal: always visible during a story chapter, with the count and a tick once met
var GOAL_LABEL = { forest: 'Forest birds', eggs: 'Eggs', birds: 'Birds played', goals: 'Round-goal points', bonus: 'Bonus points', score: 'Score', margin: 'Lead over the best rival' };
function campGoalLive(g, def) {
  var gl = def.goal || {}, m = campMetrics(g), k = gl.type === 'score' ? 'score' : gl.type === 'margin' ? 'margin' : gl.type === 'custom' ? gl.k : null;
  if (!k) return { label: 'Win the year', cur: m.margin > 0 ? 'ahead by ' + m.margin : m.margin === 0 ? 'level' : 'behind by ' + (-m.margin), met: m.won && g.phase === 'over', pending: g.phase !== 'over', lead: m.margin > 0 };
  var v = Math.max(0, m[k]); if (k === 'margin') v = m.margin;
  var met = campIsWon(g, def);
  return { label: GOAL_LABEL[k] || k, cur: v + ' of ' + gl.value, met: k === 'margin' ? m.won && m.margin >= gl.value : (v >= gl.value && (gl.winNotNeeded || m.won)), pending: g.phase !== 'over', num: v, need: gl.value, winNeeded: !gl.winNotNeeded };
}
function renderGoalbar() {
  var el = $('#goalbar'); if (!el) return;
  var def = UI.camp && G && UI.mode === 'campaign' ? UI.camp : null;
  if (!def || !def.goal) { el.hidden = true; return; }
  var r = campGoalLive(G, def); el.hidden = false; el.className = r.met ? 'met' : '';
  el.innerHTML = '<span class="gk">Goal</span><span class="gt">' + esc(r.label) + ': <b>' + esc(r.cur) + '</b></span><span class="gm">' + (r.met ? '\u2713 met' : '') + '</span>';
  el.setAttribute('aria-label', 'Chapter goal. ' + r.label + ': ' + r.cur + (r.met ? ', met' : ''));
}
function renderOpps(cur) {
  var h = '';
  G.pl.forEach(function (p, i) {
    if (i === UI.view) return;
    var sc = PP.scoreOf(G, i).total;
    h += '<button type="button" class="opp' + (i === cur && G.phase !== 'over' ? ' cur' : '') + '" data-a="opp" data-s="' + i + '" aria-label="' + esc(p.name) + ': ' + sc + ' points, ' + p.cubes + ' actions left">' +
      '<span class="pt">' + portraitHTML(p.face || 'p' + i) + '</span><span><b>' + esc(p.name) + '</b> ' + sc + ' pts · ' + p.cubes + ' left</span></button>';
  });
  $('#opps').innerHTML = h || '<span style="color:#f6eedb;font-size:var(--fs);align-self:center;opacity:.8">Solo year: beat your best score</span>';
}
function portraitHTML(face) { var st = 'portrait-' + face; return ART.items[st] ? artHTML(st) : '<span class="art ph">' + placeholder('portrait-' + face) + '</span>'; }
function renderMid() {
  var f = '';
  for (var i = 0; i < 5; i++) { var d = G.feeder[i]; f += d ? '<button type="button" class="die" data-a="die" data-i="' + i + '" aria-label="' + (d === 'gs' ? 'grub or seed' : d) + ' die">' + foodIcon(d) + '<small>' + (d === 'gs' ? 'either' : d) + '</small></button>' : '<span class="die gone"></span>'; }
  $('#feeder').innerHTML = f;
  $('#tray').innerHTML = G.tray.map(function (id, i) { return id ? '<div class="tcard">' + cardHTML(id, 'tray', null, 'data-a="tray" data-i="' + i + '" role="button" tabindex="0"') + '</div>' : '<div class="tcard"></div>'; }).join('');
  $('#deckb').innerHTML = '<span>Deck</span><span>' + G.deck.length + '</span>';
}
function rowLabel(p, h) {
  var y = PP.rowYield(p, h), word = h === 0 ? 'food' : h === 1 ? 'eggs' : 'cards', ic = h === 0 ? foodIcon('any') : h === 1 ? eggIcon() : '▤';
  return '<b>+' + y.n + '</b><span>' + word + '</span>' + (y.bonus ? '<span class="bon">+1 trade</span>' : '');
}
function renderMat(p, vs) {
  var h = '';
  for (var r = 0; r < 3; r++) {
    h += '<div class="row" data-h="' + r + '">' + (ART.have['row-' + HABN[r]] ? '<div class="rowart">' + artHTML('row-' + HABN[r]) + '</div>' : '') +
      '<button type="button" class="ract" data-a="ract" data-h="' + r + '" aria-label="' + HABN[r] + ': ' + (r === 0 ? 'gain food' : r === 1 ? 'lay eggs' : 'draw cards') + '">' + rowLabel(p, r) + '</button>';
    for (var c = 0; c < 5; c++) {
      var s = p.board[r][c];
      if (s) h += '<div class="slot">' + cardHTML(s.id, 'slot', s, 'data-a="bird" data-h="' + r + '" data-c="' + c + '" role="button" tabindex="0"') + '</div>';
      else h += '<div class="slot' + (c === p.board[r].length ? ' next' : '') + '" data-a="slot" data-h="' + r + '" data-c="' + c + '">' + (c === p.board[r].length ? '<span class="ec">' + (PP.EGGCOST[c] ? eggIcon() + PP.EGGCOST[c] : 'free') + '</span>' : '') + '</div>';
    }
    h += '</div>';
  }
  $('#mat').innerHTML = h;
}
function renderDock(p, vs, cur) {
  var Q = G.q, mine = myTurn();
  var who = G.phase === 'over' ? 'Game over' : 'Round ' + (G.round + 1) + ' of ' + G.rounds + ' · ' + (isHuman(cur) ? (humans().length > 1 ? G.pl[cur].name : 'you') : G.pl[cur].name) + ' · ' + G.pl[cur].cubes + (G.pl[cur].cubes === 1 ? ' action left' : ' actions left');
  if (G.phase !== 'over' && UI.busy && UI.animSeat != null && UI.animSeat !== cur) who = 'Round ' + (G.round + 1) + ' of ' + G.rounds + ' · ' + (UI.animSeat === UI.view && humans().length === 1 ? 'your birds are firing' : G.pl[UI.animSeat].name + ' is playing');
  $('#dt').textContent = who;
  $('#prompt').textContent = promptText(mine);
  $('#acts').innerHTML = mine ? actsHTML() : '';
  $('#foodrow').innerHTML = PP.FOODS.map(function (f) { return '<span class="fd' + (p.food[f] ? '' : ' zero') + '" aria-label="' + f + ' ' + p.food[f] + '">' + foodIcon(f) + '<span data-engine="G.pl[' + vs + '].food.' + f + '">' + p.food[f] + '</span><small>' + f + '</small></span>'; }).join('') +
    '<span class="fd" aria-label="bonus cards">★ ' + p.bonus.length + ' bonus</span>';
  var ok = {}; if (mine && !Q) PP.playable(G, vs).forEach(function (x) { ok[x.i] = 1; });
  $('#hand').innerHTML = p.hand.length ? p.hand.map(function (id, i) { return cardHTML(id, 'hand', null, 'data-a="hand" data-i="' + i + '" role="button" tabindex="0"').replace('class="bc ', 'class="bc' + (UI.sel === i ? ' sel' : '') + (mine && !Q && !ok[i] ? ' cant' : '') + ' '); }).join('') : '<span class="empty">No birds in hand. Draw cards in the wetland.</span>';
}
function promptText(mine) {
  if (!G) return '';
  if (G.phase === 'over') return 'The year is over.';
  if (!mine && UI.cap) return UI.cap;
  if (!mine && isHuman(UI.animSeat == null ? PP.sideToAct(G) : UI.animSeat) && humans().length <= 1) return UI.animSeat === UI.view && UI.busy ? 'Your birds are at work, one by one.' : 'Your turn is starting.';
  if (!mine) return UI.busy ? (UI.animSeat === UI.view ? 'Your birds are at work, one by one.' : G.pl[UI.animSeat == null ? PP.sideToAct(G) : UI.animSeat].name + ' is playing.') : 'Watch ' + G.pl[PP.sideToAct(G)].name + '.';
  var Q = G.q;
  if (UI.pend) return 'Play ' + B[G.pl[UI.view].hand[UI.pend.i]].n + '?';
  if (UI.gsDie != null) return 'Grub or seed?';
  if (!Q) return UI.sel != null ? 'Tap the glowing space in a row to put this bird there.' : 'Tap a glowing row button (food, eggs or cards), or a glowing bird in your hand.';
  var n = Q.d && Q.d.n;
  switch (Q.h) {
    case 'die': return 'Tap a glowing food die in the feeder to take it (' + n + ' left).';
    case 'egg': return 'Tap a glowing bird on your board to lay an egg on it (' + n + ' left).';
    case 'draw': return 'Tap a glowing bird in the tray, or the deck, to take a card (' + n + ' left).';
    case 'bonus': return Q.d.kind === 'card' ? 'Discard a card for 1 more food?' : Q.d.kind === 'food' ? 'Pay 1 food for 1 more egg?' : 'Pay 1 egg for 1 more card?';
    case 'pwTuck': return B[G.pl[UI.view].board[Q.d.h][Q.d.c].id].n + ': tuck a card?';
    case 'pwTrade': return B[G.pl[UI.view].board[Q.d.h][Q.d.c].id].n + ': spend an egg?';
    case 'play2': return 'Play a second bird in your ' + HABN[Q.d.hab] + '?';
    case 'bonusPick': return 'Keep one bonus card.';
  }
  return '';
}
function mvBtn(m, label, cls) { return '<button type="button" class="btn ' + (cls || '') + '" data-a="mv" data-m="' + esc(JSON.stringify(m)) + '">' + label + '</button>'; }
function actsHTML() {
  var Q = G.q, p = G.pl[UI.view];
  if (UI.pend) {
    var inf = PP.playInfo(G, UI.view, p.hand[UI.pend.i], UI.pend.h, Q && Q.h === 'play2' ? Q.d.hab : null); if (!inf) { UI.pend = null; return ''; }
    var pay = inf.pays[UI.pend.k % inf.pays.length], paid = PP.FOODS.filter(function (f) { return pay[f]; }).map(function (f) { return new Array(pay[f] + 1).join(foodIcon(f)); }).join('');
    return '<button type="button" class="btn pri" data-a="playgo">Play: ' + (paid || 'free') + (inf.eggs ? ' + ' + inf.eggs + eggIcon() : '') + '</button>' +
      (inf.pays.length > 1 ? '<button type="button" class="btn" data-a="paycycle">Other food</button>' : '') + '<button type="button" class="btn" data-a="cancel">Cancel</button>';
  }
  if (UI.gsDie != null) return mvBtn({ t: 'die', i: UI.gsDie, f: 'grub' }, foodIcon('grub') + 'Grub') + mvBtn({ t: 'die', i: UI.gsDie, f: 'seed' }, foodIcon('seed') + 'Seed') + '<button type="button" class="btn" data-a="cancel">Back</button>';
  if (!Q) return UI.sel != null ? '<button type="button" class="btn" data-a="cancel">Cancel</button><button type="button" class="btn" data-a="zoom" data-i="' + UI.sel + '">Read card</button>' : '';
  switch (Q.h) {
    case 'die': return PP.allSame(G) ? mvBtn({ t: 'reroll' }, 'Reroll the feeder') : '';
    case 'bonus': return Q.d.kind === 'food' ? PP.FOODS.filter(function (f) { return p.food[f]; }).map(function (f) { return mvBtn({ t: 'bonus', yes: true, f: f }, 'Pay ' + foodIcon(f)); }).join('') + mvBtn({ t: 'bonus', yes: false }, 'No thanks') : mvBtn({ t: 'bonus', yes: false }, 'No thanks');
    case 'pwTuck': case 'pwTrade': case 'play2': return mvBtn({ t: 'skip' }, 'Skip');
    case 'bonusPick': return Q.d.opts.map(function (id, i) { var bc = PP.BON[id]; return '<button type="button" class="bonc" data-a="mv" data-m="' + esc(JSON.stringify({ t: 'pickb', i: i })) + '"><b>' + esc(bc.n) + '</b>' + esc(bc.txt) + '<br>' + bonusTiers(bc) + '</button>'; }).join('');
  }
  return '';
}
function bonusTiers(bc) { return typeof bc.sc === 'string' ? bc.sc + ' point' + (bc.sc === '1' ? '' : 's') + ' each' : bc.sc.map(function (t) { return t[0] + '+: ' + t[1] + ' pts'; }).join(', '); }
// glowing legal targets (only while the shown seat decides)
function glow() {
  $$('.glow').forEach(function (e) { e.classList.remove('glow'); });
  document.body.classList.toggle('focus', !!(myTurn() && G && (G.q || UI.sel != null) && !UI.pend && UI.gsDie == null));
  if (!myTurn()) return;
  var Q = G.q, p = G.pl[UI.view], add = function (sel) { $$(sel).forEach(function (e) { e.classList.add('glow'); }); };
  if (UI.pend || UI.gsDie != null) return;
  if (!Q) {
    if (UI.sel != null) { var id = p.hand[UI.sel]; [0, 1, 2].forEach(function (h) { if (PP.playInfo(G, UI.view, id, h)) add('.row[data-h="' + h + '"] .slot.next'); }); return; }
    add('.ract');
    PP.playable(G, UI.view).forEach(function (x) { add('#hand .bc[data-i="' + x.i + '"]'); });
    return;
  }
  var mv = PP.validMoves(G, UI.view);
  mv.forEach(function (m) {
    if (m.t === 'die') add('.die[data-i="' + m.i + '"]');
    if (m.t === 'egg' || m.t === 'trade' || (m.t === 'bonus' && m.h != null)) add('.bc[data-a="bird"][data-h="' + m.h + '"][data-c="' + m.c + '"]');
    if (m.t === 'tray') add('.bc[data-a="tray"][data-i="' + m.i + '"]');
    if (m.t === 'deck') add('#deckb');
    if (m.t === 'tuck' || (m.t === 'bonus' && m.i != null)) add('#hand .bc[data-i="' + m.i + '"]');
    if (m.t === 'play') { if (UI.sel === m.i) add('.row[data-h="' + m.h + '"] .slot.next'); else if (UI.sel == null) add('#hand .bc[data-i="' + m.i + '"]'); }
  });
}
function fitMat() {   // slots keep a card-like shape: width from the row height, never wider than the screen allows
  var m = $('#mat'); if (!m || !m.clientHeight) return;
  var rh = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--rh')) || 64, rowH = (m.clientHeight - 8) / 3, w = (m.clientWidth - rh - 30) / 5;
  m.style.setProperty('--sw', Math.max(40, Math.floor(Math.min(w, rowH * .78))) + 'px');
}
// big card view
function showCard(id, st, extra) { hideHelp();
  var b = B[id], pw = PP.power(id), el = $('#pop');
  el.innerHTML = '<div class="card" role="dialog" aria-label="' + esc(b.n) + '"><div class="bigpic">' + artHTML('bird-' + id) + '</div><h3>' + esc(b.n) + '</h3>' +
    '<div class="facts"><b>' + b.p + ' points</b><span>Cost: ' + costHTML(b) + '</span><span>' + nestIcon(b.nest) + ' ' + b.nest + ' nest, holds ' + b.e + ' eggs</span><span>Wings ' + b.ws + ' cm across</span><span>Lives in: ' + b.h.split('').map(function (x) { return HABN['FGW'.indexOf(x)]; }).join(', ') + '</span></div>' +
    '<div class="pw ' + (pw.col || 'none') + '"><b>' + (pw.col === 'brown' ? 'When activated (brown): ' : pw.col === 'pink' ? 'Between turns (pink): ' : pw.col === 'white' ? '' : '') + '</b>' + esc(pw.txt) + '</div>' +
    (st ? '<div class="facts">' + (st.eggs ? st.eggs + ' egg' + (st.eggs > 1 ? 's' : '') + ' · ' : '') + (st.cache ? st.cache + ' cached food · ' : '') + (st.tuck ? st.tuck + ' tucked cards' : '') + '</div>' : '') +
    '<div class="acts">' + (extra || '') + '<button type="button" class="btn pri" data-a="popx">Close</button></div></div>';
  el.hidden = false;
}
