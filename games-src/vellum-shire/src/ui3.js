// ui3: title page, result page, menu, rules, tile reference, help bulb, guided tutorial, boot
function logoHtml() { return '<svg class="frame" viewBox="0 0 120 84" aria-hidden="true"><defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff2b0"/><stop offset=".5" stop-color="#d9a738"/><stop offset="1" stop-color="#8a6118"/></linearGradient></defs>' +
  [[60, 30, 'K'], [36, 44, 'F'], [84, 44, 'B'], [48, 64, 'T'], [72, 64, 'L']].map(function (a) { return '<polygon points="' + hexPts(a[0], a[1], 15) + '" fill="' + COLHEX[a[2]] + '" stroke="url(#lg)" stroke-width="2.5"/>' + iconG({ K: 'castle', F: 'sheep', B: 'ship', T: 'belltower', L: 'lore' }[a[2]], a[0], a[1], 17, COLINK[a[2]]); }).join('') + '</svg>'; }
function firstTime() { try { return !localStorage.getItem('vs_seen'); } catch (e) { return false; } }
function showStart() {
  UI.started = false;
  var sv = loadSave(), lv = UI.lvl;
  var tut = ''; try { tut = GXT.menuHTML({ game: 'vellum-shire', first: firstTime(), cls: 'btn', launch: tutStart }); } catch (e) { }
  $('#start').innerHTML = '<div class="page">' + logoHtml() + '<h2><span class="cap">V</span>ellum Shire</h2><p class="sub">Roll two dice. Build the finest estate.</p><div class="col">' +
    (firstTime() ? tut : '') +
    (sv ? '<button class="btn go" data-s="cont">Continue your game</button>' : '') +
    '<button class="btn' + (sv ? '' : ' go') + '" data-s="vs">Play vs computer</button>' +
    '<div class="lbl">Computer</div><div class="row">' + [['easy', 'Easy'], ['normal', 'Normal'], ['hard', 'Hard']].map(function (x) { return '<button class="btn' + (lv === x[0] ? ' on' : '') + '" data-lvl="' + x[0] + '">' + x[1] + '</button>'; }).join('') + '</div>' +
    (firstTime() ? '' : tut) +
    '<button class="btn" data-s="hot">Two players, one phone</button></div></div>';
  $('#start').hidden = false;
}
document.addEventListener('click', function (e) {
  var b = e.target.closest('#start [data-s],#start [data-lvl],#rs [data-r]'); if (!b) return;
  try { localStorage.setItem('vs_seen', '1'); } catch (x) { }
  if (b.dataset.lvl) { UI.lvl = b.dataset.lvl; try { localStorage.setItem('vs_lvl', UI.lvl); } catch (x) { } showStart(); return; }
  var a = b.dataset.s || b.dataset.r;
  if (a === 'cont') { var o = loadSave(); if (o) { G = o.G; UI.mode = o.mode; UI.lvl = o.lvl; UI.human = o.human; UI.started = true; UI.view = 0; UI.busy = false; $('#start').hidden = true; G.ev = []; render(); flow(); } return; }
  if (a === 'vs') newGame('vs', { lvl: UI.lvl });
  if (a === 'hot') newGame('hot');
  if (a === 'again') newGame(UI.mode === 'hot' ? 'hot' : 'vs', { lvl: UI.lvl });
  if (a === 'menu') { $('#rs').hidden = true; showStart(); }
});
// ---------- result
function winText() { if (!G.final) return ''; var w = G.winner; return UI.mode === 'hot' ? (w === 0 ? 'Player 1 wins!' : 'Player 2 wins!') : (w === 0 ? 'You win!' : nameOf(1) + ' wins'); }
function showResult() {
  if (!G || !G.final) return;
  var f = G.final, rows = [['Points in play', 'vp'], ['Goods left', 'goods'], ['Silver', 'silver'], ['Workers (2 = 1)', 'workers'], ['Lore at the end', 'lore']];
  var h = '<div class="page"><h2 class="rvt1">' + winText() + '</h2><table class="rtab"><tr><th></th><th>' + (UI.mode === 'hot' ? 'P1' : 'You') + '</th><th>' + nameOf(1) + '</th></tr>' +
    rows.map(function (r) { return '<tr><td>' + r[0] + '</td><td>' + f[0][r[1]] + '</td><td>' + f[1][r[1]] + '</td></tr>'; }).join('') +
    '<tr class="tot"><td>Total</td><td class="rvt">' + f[0].total + '</td><td class="rvt">' + f[1].total + '</td></tr></table>' +
    (f[0].total === f[1].total ? '<p class="sub">Tie: more empty spaces wins.</p>' : '') +
    '<div class="col"><button class="btn go" data-r="again">Play again</button><button class="btn" data-r="menu">Main menu</button></div></div>';
  $('#rs').innerHTML = h; $('#rs').hidden = false;
  if (!UI.tut && !UI.resulted) {
    UI.resulted = true;
    try { GNS.result({ game: 'vellum-shire', mode: UI.mode === 'hot' ? 'hot' : 'vs', level: UI.lvl, seats: [{ name: 'You', me: true }, { name: nameOf(1), ai: UI.mode === 'vs' ? UI.lvl : undefined }], winner: G.winner, scores: [f[0].total, f[1].total], turns: G.turnNo }); } catch (e) { }
    clearSave();
  }
}
// ---------- rules drawer
function rulesHtml() {
  return '<div class="rbody">' +
    '<p><span class="drop-cap">Y</span>ou and a rival each build an estate over <b>5 chapters of 5 rounds</b>. Most points at the end wins.</p>' +
    '<h3>A round</h3><ul><li>Everyone rolls 2 dice. A white die puts new goods in a stall.</li><li>On your turn, use each die for one action.</li><li>Once a turn, pay 2 silver for any ink-stall tile.</li></ul>' +
    '<h3>The 4 actions</h3><ul><li><b>Take a tile</b> from the stall with your die number. It goes to storage (3 spaces).</li>' +
    '<li><b>Place a stored tile</b> on an estate space with your die number, the same colour, next to a tile you have.</li>' +
    '<li><b>Sell goods</b> of your die number: 2 points each and 1 silver.</li><li><b>Take 2 workers</b> with any die.</li></ul>' +
    '<p>Each worker turns a die up or down by 1 (6 and 1 wrap around).</p>' +
    '<h3>Tiles</h3><ul><li><b>Keep</b>: one extra action, any die number.</li><li><b>Barge</b>: load all goods from one stall, and go earlier next round.</li>' +
    '<li><b>Animals</b>: score the animals, plus same animals already in that pasture.</li><li><b>Quarry</b>: 1 silver at each chapter end.</li>' +
    '<li><b>Lore</b>: a lasting power or end points.</li><li><b>Town buildings</b>: a one-time effect. One of each kind per town.</li></ul>' +
    '<h3>Points</h3><ul><li>Fill a whole region: 1, 3, 6, 10, 15, 21, 28 or 36 for 1 to 8 spaces, plus a chapter bonus (10, 8, 6, 4, 2).</li>' +
    '<li>First to fill every space of a colour: gilded seal +5. Second: +2.</li><li>End: 1 point per goods tile, per silver, and per 2 workers.</li>' +
    '<li>Tie: more empty spaces wins.</li></ul>' +
    '<p>Tap <b>Tiles</b> in the menu to see every tile and lore power.</p></div>';
}
function buildRules() { var el = document.createElement('div'); el.innerHTML = rulesHtml(); GX.drawer('rulesd', 'How to play', el); }
// ---------- reference (every component with its count)
function refSections() {
  var tiles = [];
  tiles.push({ id: 'keep', name: 'Keep', count: 16, text: VS.tileFx(T(0)), meta: '14 plain + 2 ink back', pic: { t: 0 } });
  var b = VS.TILES.filter(function (t) { return t.col === 'B'; })[0], q = VS.TILES.filter(function (t) { return t.col === 'Q'; })[0];
  tiles.push({ id: 'barge', name: 'Barge', count: 26, text: VS.tileFx(b), meta: '20 plain + 6 ink back', pic: { t: b.id } });
  tiles.push({ id: 'quarry', name: 'Quarry', count: 12, text: VS.tileFx(q), meta: '10 plain + 2 ink back', pic: { t: q.id } });
  var town = VS.BKEYS.map(function (k) { var t = VS.TILES.filter(function (x) { return x.k === k; })[0]; return { id: 'b-' + k, name: VS.BUILD[k].n, count: 7, text: VS.BUILD[k].fx, meta: 'Town · 5 plain + 2 ink back', tags: ['Town'], pic: { t: t.id } }; });
  var anim = VS.AKEYS.map(function (k) { var t = VS.TILES.filter(function (x) { return x.k === k; })[0]; return { id: 'a-' + k, name: VS.ANIMALS[k], count: 7, text: 'Tiles show 2, 2, 3, 3, 4 animals (plain) and 3, 4 (ink back). Score the animals plus same animals in that pasture.', meta: 'Pasture', tags: ['Animal'], pic: { t: t.id } }; });
  var lore = []; for (var i = 1; i <= 26; i++) { var t = VS.TILES.filter(function (x) { return x.col === 'L' && x.a === i; })[0]; lore.push({ id: 'l-' + i, name: i + '. ' + VS.LORE[i].n, count: 1, text: VS.LORE[i].fx, meta: t.ink ? 'Ink back' : 'Plain back', tags: ['Lore'], pic: { t: t.id } }); }
  var goods = []; for (var d = 1; d <= 6; d++) goods.push({ id: 'g-' + d, name: VS.GOODS[d].n, count: 7, text: 'Goods of die ' + d + '. Sell all you hold for 2 points each.', pic: { g: d } });
  var other = [{ id: 'silver', name: 'Silver', count: 20, text: 'Pay 2 to buy a tile from the ink stall. 1 point each at the end.' },
    { id: 'workers', name: 'Workers', count: 30, text: 'Each turns a die by 1. 2 workers = 1 point at the end.' },
    { id: 'seals', name: 'Gilded seals', count: 12, text: 'One big (+5) and one small (+2) per colour, for filling every space of it.' },
    { id: 'dice', name: 'Dice', count: 9, text: '2 per player colour, plus the white goods die.' },
    { id: 'estates', name: 'Estate boards', count: 9, text: 'This game uses estate 1 for both players, as the rules advise.' }];
  return [{ id: 'tiles', title: 'Keeps, barges, quarries', items: tiles }, { id: 'town', title: 'Town buildings', items: town }, { id: 'anim', title: 'Animals', items: anim }, { id: 'lore', title: 'Lore', items: lore }, { id: 'goods', title: 'Goods', items: goods }, { id: 'other', title: 'Other parts', items: other }];
}
function buildRef() {
  try { GX.reference(refSections(), { title: 'Every tile', label: 'Tiles', picture: function (it) { if (it.pic && it.pic.t != null) return tileSVG(T(it.pic.t)); if (it.pic && it.pic.g) return goodsChip(it.pic.g, true); return null; }, before: '[data-gx="setd"]' }); } catch (e) { console.warn(e); }
}
function buildMenu() {
  try {
    GX.settings({ id: 'setd', title: 'Menu',
      game: function (S) { var nb = document.createElement('button'); nb.className = 'btn'; nb.textContent = 'New game'; nb.onclick = function () { GX.close(); clearSave(); showStart(); };
        var tb = document.createElement('button'); tb.className = 'btn'; tb.textContent = 'Tutorial'; tb.onclick = function () { GX.close(); tutStart(); };
        S.appendChild(GX.row('This game', [nb, tb])); },
      help: function (S) { var rb = document.createElement('button'); rb.className = 'btn'; rb.textContent = 'Rules'; rb.onclick = function () { GX.show('rulesd'); }; S.appendChild(GX.row('Read', [rb])); try { S.insertAdjacentHTML('beforeend', GXH.settingsHTML({ rowClass: 'mrow', btnClass: 'btn' })); } catch (e) { } },
      about: { name: 'Vellum Shire', version: '1.0', text: 'Ink icons by Delapouite, Lorc and Skoll (game-icons.net, CC BY 3.0). Fonts: Uncial Antiqua, UnifrakturMaguntia, IM Fell English (SIL OFL).' } });
  } catch (e) { console.warn(e); }
}
// ---------- help bulb: the suggestion is the Normal computer's own pick
function moveTarget(m) {
  if (!m) return null;
  if (m.t === 'take' || m.t === 'buy' || m.t === 'grab') return $('[data-tile="' + m.tile + '"]');
  if (m.t === 'place') return $('[data-h="' + m.h + '"]');
  if (m.t === 'sell') return $('[data-goods="' + m.v + '"]');
  if (m.t === 'work') return $('[data-work]');
  if (m.t === 'ship') return $('[data-ship="' + m.st + '"]');
  if (m.t === 'end') return $('[data-a="end"]');
  if (m.t === 'skip') return $('[data-a="skip"]');
  return null;
}
function hlpInit() {
  try {
    GXH.init({ game: 'vellum-shire', defaultOn: true,
      steps: { turn: { target: function () { return $('#dice'); }, title: 'Pick a die', text: 'Tap a die. Glowing spots show what it can do.' },
        pend: { target: function () { return $('#stalls'); }, title: 'A bonus action', text: 'Your new tile gives a bonus. Tap a glowing spot.' } },
      rules: [{ title: 'The goal', text: 'Fill your estate. Whole regions score big. Most points wins.' },
        { title: 'Die = number', text: 'A die takes from the stall with its number, or places on a space with it.' },
        { title: 'Workers', text: 'Each worker turns a die up or down by 1.' },
        { title: 'Selling', text: 'Sell goods of your die number: 2 points each, plus 1 silver.' }],
      avoid: '.tgt,#acts .btn' });
    GXH.bulb({ el: '#bulbbtn', suggest: function () {
      if (!G || G.over || !isHuman(VSE.side(G)) || UI.busy || UI.view !== VSE.side(G)) return null;
      var m = VSAI.pick(G, 'normal'), el = moveTarget(m); if (!el) return null;
      var pv = preview(m); return { target: function () { return moveTarget(m); }, why: title(m) + (m.w ? ' (' + wTxt(m.w) + ')' : '') + (pv ? ': ' + pv : '') };
    }, rulesFor: function () { return null; } });
  } catch (e) { console.warn(e); }
}
// ---------- tutorial: a staged first game that teaches by doing
var TUT = { bell: -1 };
function tutOn() { try { return UI.tut && GXT.active(); } catch (e) { return false; } }
function tutAllow() { return true; }
function tutAfter() { }
function tutAI() { var ms = VSE.validMoves(G); return ms.filter(function (m) { return m.t === 'work'; })[0] || ms.filter(function (m) { return m.t === 'end'; })[0] || null; }
function swapIn(id, n) { // move tile id into stall n (swap with a stall tile of the same colour, keeps every count right)
  var st = G.st[n].t, col = T(id).col, k = st.findIndex(function (x) { return T(x).col === col; });
  var stack = G.stack[col], j = stack.indexOf(id); if (j < 0) return;
  if (k >= 0) { stack[j] = st[k]; st[k] = id; } else { stack.splice(j, 1); st.push(id); }
}
function tutSetup() {
  newGame('vs', { seed: 4242, first: 0, lvl: 'easy', tut: true });
  try { GXH.setEnabled(false); GXH.hide(); } catch (e) { }
  var bell = G.stack.T.filter(function (id) { return T(id).k === 'belltower'; })[0]; swapIn(bell, 3); TUT.bell = bell;
  var P0 = G.p[0]; P0.sto[0] = G.stack.B.pop();
  // goods: two Honey (6) and one Rose dye (2), swapped with the unused goods so the total stays 42
  P0.goods.forEach(function (x) { for (var i = 0; i < x.n; i++) G.unused.push(x.d); }); P0.goods = [];
  [6, 6, 2].forEach(function (d) { var i = G.unused.indexOf(d); if (i >= 0) { G.unused.splice(i, 1); } else { var j = G.piles.findIndex(function (p) { return p.indexOf(d) >= 0; }); if (j >= 0) G.piles[j].splice(G.piles[j].indexOf(d), 1); } var e = P0.goods.filter(function (x) { return x.d === d; })[0]; if (e) e.n++; else P0.goods.push({ d: d, n: 1 }); });
  P0.dice = [3, 5]; UI.tutD2 = false;
  if (!G.st[1].g.length && !G.st[2].g.length) { var gg = G.unused.pop(); G.st[2].g.push(gg); }
  render();
}
function tq(s) { return function () { return $(s); }; }
function tutSteps() {
  var tapM = function (what, f) { return { type: 'tap', match: function (a) { return a.what === what && (!f || f(a)); } }; };
  return [
    { id: 'goal', title: 'Your estate', say: 'Fill your estate with tiles. Most points wins.', target: tq('#estate'), wait: null },
    { id: 'dice', title: 'Two dice', say: 'You roll 2 dice. Each die is one action.', target: tq('#dice'), wait: null },
    { id: 'die3', say: 'Tap your 3.', target: tq('[data-die="0"]'), wait: tapM('die', function (a) { return a.i === 0; }) },
    { id: 'take', title: 'Take a tile', say: 'Stall 3 matches your 3. Tap the tower.', target: function () { return $('[data-tile="' + TUT.bell + '"]'); }, wait: tapM('tile', function (a) { return a.id === TUT.bell; }) },
    { id: 'take2', say: 'It goes to storage. Tap Do it.', target: tq('[data-a="opt"]'), wait: tapM('opt') },
    { id: 'die5', say: 'Now tap your 5.', target: tq('[data-die="1"]'), ready: function () { return !UI.busy && !!$('[data-die="1"].tgt'); }, wait: tapM('die', function (a) { return a.i === 1; }) },
    { id: 'place', title: 'Place a tile', say: 'Your stored barge fits river space 5. Tap it.', target: tq('[data-h="19"]'), wait: tapM('hex', function (a) { return a.h === 19; }) },
    { id: 'place2', say: 'New tiles must touch your tiles. Tap Do it.', target: tq('[data-a="opt"]'), wait: tapM('opt') },
    { id: 'ship', title: 'Barge bonus', say: 'A barge loads goods. Tap the goods.', target: tq('.gd.gtgt'), ready: function () { return !UI.busy && !!$('.gd.gtgt'); }, wait: tapM('ship') },
    { id: 'ship2', say: 'You also go first next round. Tap Do it.', target: tq('[data-a="opt"]'), wait: tapM('opt') },
    { id: 'rival', title: 'Rival’s turn', say: 'Now the rival plays. Then a new round.', target: tq('#estate'), ready: function () { return !UI.busy && VSE.side(G) === 0 && G.rd === 1 && UI.view === 0; }, wait: null },
    { id: 'die3b', say: 'New dice! Tap your 3.', target: tq('[data-die="0"]'), ready: function () { return !UI.busy && !!$('[data-die="0"].tgt'); }, wait: tapM('die', function (a) { return a.i === 0; }) },
    { id: 'tower', say: 'Town spaces with 3 glow. Tap one.', target: tq('[data-h="11"]'), wait: tapM('hex', function (a) { return a.h === 11 || a.h === 25; }) },
    { id: 'tower2', say: 'A bell tower gives 4 points. Tap Do it.', target: tq('[data-a="opt"]'), wait: tapM('opt') },
    { id: 'sell', title: 'Sell goods', say: 'Your 6 sells goods marked 6. Tap them.', target: tq('[data-goods="6"]'), ready: function () { return !UI.busy && !!$('[data-goods="6"].tgt'); }, wait: tapM('goods') },
    { id: 'sell2', say: '2 points per goods tile, plus silver. Tap Do it.', target: tq('[data-a="opt"]'), wait: tapM('opt') },
    { id: 'work', title: 'Workers', say: 'Workers turn a die up or down by 1.', target: tq('[data-work]'), ready: function () { return !UI.busy; }, wait: null },
    { id: 'ink', title: 'Ink stall', say: 'Once a turn, pay 2 silver for an ink-stall tile.', target: tq('.stall.blk'), wait: null },
    { id: 'region', title: 'Big points', say: 'Fill a whole region of one colour for big points!', target: tq('#estate'), wait: null }
  ];
}
function tutStart() {
  try { GX.close(); } catch (e) { }
  $('#rs').hidden = true; $('#start').hidden = true;
  GXT.start({ game: 'vellum-shire', setup: tutSetup, steps: tutSteps(), story: false, endTitle: 'You know the rules', endText: 'Play a real game against the computer.',
    onDone: function () { UI.tut = false; try { GXH.setEnabled(true); } catch (e) { } newGame('vs', { lvl: 'easy' }); },
    onExit: function () { UI.tut = false; try { GXH.setEnabled(true); } catch (e) { } newGame('vs', { lvl: UI.lvl }); } });
}
// round 2 of the tutorial gets fixed dice
var _flow = flow;
flow = function () { if (UI.tut && G && !G.over && G.rd === 1 && VSE.side(G) === 0 && !UI.tutD2) { UI.tutD2 = true; G.p[0].dice = [3, 6]; } return _flow(); };
// tutorial gate on every tap
document.addEventListener('click', function (e) {
  if (!tutOn()) return;
  var el = e.target.closest('[data-tile],[data-h],[data-goods],[data-ship],[data-work],[data-sto],[data-die],[data-view],[data-a]');
  if (!el || !el.closest('#bd,#dock')) return;
  var a = { type: 'tap' };
  if (el.dataset.die != null) { a.what = 'die'; a.i = +el.dataset.die; }
  else if (el.dataset.tile != null) { a.what = 'tile'; a.id = +el.dataset.tile; }
  else if (el.dataset.h != null) { a.what = 'hex'; a.h = +el.dataset.h; }
  else if (el.dataset.goods != null) { a.what = 'goods'; a.d = +el.dataset.goods; }
  else if (el.dataset.ship != null) { a.what = 'ship'; a.st = +el.dataset.ship; }
  else if (el.dataset.a) a.what = el.dataset.a;
  else a.what = 'other';
  if (!GXT.act(a)) { e.stopImmediatePropagation(); e.preventDefault(); }
}, true);
// ---------- boot
function boot() {
  try { GX.init({ key: 'vs' }); } catch (e) { console.error(e); }
  try { UI.lvl = localStorage.getItem('vs_lvl') || 'easy'; } catch (e) { }
  buildRules(); buildMenu(); buildRef(); hlpInit(); bindBoard();
  try { if (!/^(localhost|127\.0\.0\.1)$/.test(location.hostname) && location.protocol !== 'file:') GX.offline({ sw: '../sw.js', scope: '../' }); } catch (e) { }
  try { GNS.achievements('vellum-shire', [{ id: 'win', name: 'Lord of the shire', how: 'Beat the computer.', test: function (r) { return r.won && r.mode === 'vs'; } }, { id: 'big', name: 'Gilded page', how: 'Score 150 or more.', test: function (r) { return r.score >= 150; } }]); } catch (e) { }
  var rf = function () { if (G && UI.started) render(); };
  if (typeof GXV !== 'undefined') GXV.watch(rf); else window.addEventListener('resize', rf);
  if (window.GXS && GXS.on) return;
  showStart();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
