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
// a bird card: size 'slot' (on the board: picture, points, eggs) | 'tray' (picture + points) | 'hand' / 'big' (the readable card:
// big picture, name, points in large type, habitat band with words, food cost as at most 3 icons with words, power in one sentence)
function costItems(b) {
  return b.c.slice(0, 3).map(function (s) {
    if (s === '*') return '<span class="ci">' + foodIcon('any') + '<small>any</small></span>';
    var p = s.split('|');
    return p.length > 1 ? '<span class="ci or">' + p.map(function (f) { return foodIcon(f); }).join('') + '<small>' + p.map(function (f) { return FOODW[f] || f; }).join(' or ') + '</small></span>' : '<span class="ci">' + foodIcon(s) + '<small>' + (FOODW[s] || s) + '</small></span>';
  }).join('') + (b.c.length > 3 ? '<span class="ci more">+' + (b.c.length - 3) + '</span>' : '');
}
function bigCardHTML(id, attrs, extra, cls) {
  var b = B[id], sp = shortPower(id), habs = b.h.split('');
  var h = '<div class="bc big ' + (cls || '') + '" ' + (attrs || '') + ' aria-label="' + esc(b.n + ', ' + b.p + ' points, ' + sp.when + ': ' + sp.txt) + '">';
  h += '<div class="bk-pic">' + artHTML('bird-' + id) + '</div>';
  h += '<div class="bk-body"><div class="bk-hab">' + habs.map(function (x) { return '<span class="hb h' + x + '">' + HABW[x] + '</span>'; }).join('') + '</div>';
  h += '<div class="bk-hd"><span class="bk-nm">' + esc(b.n) + '</span><span class="vpb"><b>' + b.p + '</b><small>' + (b.p === 1 ? 'point' : 'points') + '</small></span></div>';
  h += '<div class="bk-cost">' + (b.c.length ? costItems(b) : '<span class="ci free">Free</span>') + '</div>';
  h += '<div class="bk-pw ' + (sp.col || 'none') + '">' + (sp.when ? '<b>' + sp.when + ':</b> ' : '') + esc(sp.txt) + '</div>';
  return h + (extra || '') + '</div></div>';
}
function cardHTML(id, size, st, attrs) {
  if (size === 'hand' || size === 'big') return bigCardHTML(id, attrs);
  var b = B[id], pw = PP.power(id), col = pw.col || 'none';
  var h = '<div class="bc ' + (size === 'slot' ? 'on-board' : 'mini') + '" ' + (attrs || '') + ' aria-label="' + esc(b.n + ', ' + b.p + ' points') + '">';
  h += '<div class="pic">' + artHTML('bird-' + id) + '<span class="hband">' + b.h.split('').map(function (x) { return '<i class="h' + x + '"></i>'; }).join('') + '</span><span class="vp">' + b.p + '</span></div>';
  if (size === 'slot' && st && (st.eggs || st.cache || st.tuck)) {
    h += '<div class="meta">';
    if (st.eggs) h += '<span class="mt">' + eggIcon() + '<b>' + st.eggs + '</b></span>';
    if (st.cache) h += '<span class="mt" title="stored food">' + foodIcon('any') + '<b>' + st.cache + '</b></span>';
    if (st.tuck) h += '<span class="mt" title="tucked cards">&#9636;<b>' + st.tuck + '</b></span>';
    h += '</div>';
  }
  return h + '</div>';
}
// ---------------- render
function render() {
  if (!G) return;
  var vs = UI.view, p = G.pl[vs], cur = PP.sideToAct(G);
  $('#barstat').textContent = '';
  renderOpps(cur); renderMid(); renderMat(p, vs); renderDock(p, vs, cur); renderGoalbar(); fitMat();
  glow();
  try { rateStart(); showRate(); } catch (e) { }
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
function renderOpps(cur) {   // the always-visible score breakdown: every player, leader marked
  $('#opps').innerHTML = scoreHTML();
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
      else h += '<div class="slot' + (c === p.board[r].length ? ' next' : '') + '" data-a="slot" data-h="' + r + '" data-c="' + c + '">' + (c === p.board[r].length ? '<span class="ec">' + (PP.EGGCOST[c] ? eggIcon() + PP.EGGCOST[c] + (PP.EGGCOST[c] === 1 ? ' egg' : ' eggs') : 'free') + '</span>' : '') + '</div>';
    }
    h += '</div>';
  }
  $('#mat').innerHTML = h;
}
function renderDock(p, vs, cur) {
  var Q = G.q, mine = myTurn();
  var who = G.phase === 'over' ? 'Game over' : isHuman(cur) ? (humans().length > 1 ? G.pl[cur].name + "'s turn" : 'Your turn') : G.pl[cur].name + "'s turn";
  if (G.phase !== 'over' && UI.busy && UI.animSeat != null && UI.animSeat !== cur) who = UI.animSeat === UI.view && humans().length === 1 ? 'Your birds are working' : G.pl[UI.animSeat].name + ' is playing';
  $('#dt').textContent = who;
  $('#trk').innerHTML = trackerHTML();
  if (!mine || Q) UI.pickBird = false;
  var idle = mine && !Q && UI.sel == null && !UI.pend && UI.gsDie == null && !UI.pickBird;
  document.body.classList.toggle('idle4', !!idle);
  document.body.classList.toggle('picking', !!(mine && !Q && (UI.pickBird || UI.sel != null)));
  $('#prompt').textContent = promptText(mine);
  $('#acts').innerHTML = mine ? (idle ? act4HTML() : actsHTML()) : '';
  var have = PP.FOODS.filter(function (f) { return p.food[f]; });
  $('#foodrow').innerHTML = '<span class="fl">Your food</span>' + (have.length ? have.map(function (f) { return '<span class="fd" aria-label="' + f + ' ' + p.food[f] + '">' + foodIcon(f) + '<b data-engine="G.pl[' + vs + '].food.' + f + '">' + p.food[f] + '</b><small>' + f + '</small></span>'; }).join('') : '<span class="fd none">none yet</span>') +
    (p.bonus.length ? '<button type="button" class="fd bon" data-gx="goalsd" aria-label="Your secret bonus card">&#9733; bonus card</button>' : '');
  var ok = {}; if (mine && (!Q || Q.h === 'play2')) PP.playable(G, vs, Q && Q.h === 'play2' ? Q.d.hab : null).forEach(function (x) { ok[x.i] = 1; });
  var bp = mine && !Q ? bestPlay(G, vs) : null;
  var tuckQ = mine && Q && (Q.h === 'pwTuck' || Q.h === 'bonus');
  var order = p.hand.map(function (id, i) { return i; }).sort(function (x, y) { return (ok[y] ? 1 : 0) - (ok[x] ? 1 : 0) || (ok[x] ? B[p.hand[y]].p - B[p.hand[x]].p : 0) || x - y; });   // birds you can play first, best first
  $('#hand').innerHTML = p.hand.length ? order.map(function (i) {
    var id = p.hand[i], b = B[id], st;
    if (tuckQ) st = '<div class="bk-st go">Tap to use this card</div>';
    else if (!mine) st = '';
    else if (ok[i]) st = '<div class="bk-st go">' + (UI.sel === i ? 'Now tap a glowing space on your board' : 'Drag to a row or tap: +' + b.p) + '</div>';
    else if (!Q) st = '<div class="bk-st no">' + esc(whyCant(id)) + '</div>';
    else st = '';
    var cls = (UI.sel === i ? 'sel' : '') + (mine && !Q && !ok[i] ? ' cant' : '') + (bp && bp.i === i ? ' bestc' : '');
    return bigCardHTML(id, 'data-a="hand" data-i="' + i + '" role="button" tabindex="0"', (bp && bp.i === i ? '<em class="bestb">Best</em>' : '') + st, cls);
  }).join('') : '<span class="empty">No birds in hand. Use Draw birds to get some.</span>';
  if (UI.hix == null || UI.hix >= p.hand.length) UI.hix = 0;
  handScrollSync(); handPager();
  var hc = $('#hand').querySelectorAll('.bc')[UI.hix]; if (hc) $('#hand').scrollLeft = hc.offsetLeft - $('#hand').offsetLeft - 6;
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
  if (!Q) return UI.sel != null ? 'Tap the glowing space on your board.' : UI.pickBird ? 'Pick a glowing bird below.' : 'Choose one action:';
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
  if (!Q) return '<button type="button" class="btn" data-a="cancel">Back</button>' + (UI.sel != null ? '<button type="button" class="btn" data-a="zoom" data-i="' + UI.sel + '">Read card</button>' : '');
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
    if (!UI.pickBird) add('.ract');
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
// big card view (tap to inspect): the same readable card, larger, plus nest and egg facts
function showCard(id, st, extra) { hideHelp();
  var b = B[id], el = $('#pop');
  var facts = '<div class="facts"><span>' + nestIcon(b.nest) + ' Nest holds ' + b.e + ' eggs</span>' + (st ? '<span>' + (st.eggs || 0) + ' egg' + (st.eggs === 1 ? '' : 's') + ' on it' + (st.cache ? ' · ' + st.cache + ' stored food' : '') + (st.tuck ? ' · ' + st.tuck + ' tucked' : '') + '</span>' : '') + '</div>';
  el.innerHTML = '<div class="card" role="dialog" aria-label="' + esc(b.n) + '">' + bigCardHTML(id, '', facts, 'insp') +
    '<div class="acts">' + (extra || '') + '<button type="button" class="btn pri" data-a="popx">Close</button></div></div>';
  el.hidden = false;
}
