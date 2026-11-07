// ===================== part 3: title, quick-game setup, starting hand, result, drawers, menu =====================
var NAMES = ['Fern', 'Rowan', 'Hazel', 'Linnet', 'Bram'], FACES = ['pip', 'mags', 'tobias', 'pip', 'mags'];
var CFG = { n: 2, kinds: ['human', 'ai', 'ai', 'ai', 'ai'], lvl: 'normal', side: 'green', first: 'you' };
try { var c0 = JSON.parse(localStorage.getItem('pp-cfg') || 'null'); if (c0 && c0.n) CFG = c0; } catch (e) { }
function firstTime() { try { return !localStorage.getItem('pp-played'); } catch (e) { return true; } }
function tutBtn() { try { return typeof GXT !== 'undefined' ? GXT.menuHTML({ game: 'perch-and-plume', first: firstTime(), cls: 'btn', launch: tutStart }) : ''; } catch (e) { return ''; } }
function showTitle() { hideHelp();
  stopTimers(); UI.camp = null; G = G && G.phase !== 'over' && UI.mode !== 'tutorial' ? G : G;
  try { GX.close(); } catch (e) { }
  var el = $('#title'), sv = loadSave(), tut = tutBtn();
  var first = firstTime();
  el.innerHTML = artHTML('bg-title', 'bgart', '') + '<div class="ttl">Perch &amp; Plume</div><div class="sub">A naturalist\'s year of birds</div>' +
    '<div class="tbirds">' + ['F', 'G', 'W'].map(function (h) { var b = PP.DATA.birds.find(function (x) { return x.h === h && x.p >= 4; }); return b ? cardHTML(b.id, 'slot', null, 'aria-hidden="true"') : ''; }).join('') + '</div>' +
    '<div class="tmenu">' + (first ? tut : '') +
    (sv ? '<button type="button" class="btn" data-t="resume">Continue your game <small>(round ' + (sv.G.round + 1) + ')</small></button>' : '') +
    '<button type="button" class="btn big primary" data-t="story">Story: A Naturalist\'s Year</button>' +
    '<button type="button" class="btn" data-t="quick">Quick game</button>' +
    '<button type="button" class="btn" data-t="how">How to play</button>' + (first ? '' : tut) + '</div>';
  el.hidden = false;
  $$('#title [data-t]').forEach(function (b) { b.onclick = function () { var t = b.dataset.t; sfx('tap'); if (t === 'resume') resume(loadSave()); if (t === 'story') openStory(); if (t === 'quick') showConfig(); if (t === 'how') { GX.show('rulesd'); } }; });
  musicSync();
}
function openStory() { if (window.GXC && window.CAMPAIGN) { $('#title').hidden = true; GXC.open(); } else toast('Story is not available.'); }
function showConfig() { hideHelp();
  var el = $('#setup');
  function draw() {
    var h = '<h2>Quick game</h2><div class="cfg"><div class="lab">Players</div><div class="seg">' + [1, 2, 3, 4, 5].map(function (n) { return '<button type="button" class="btn' + (CFG.n === n ? ' on' : '') + '" data-n="' + n + '">' + n + '</button>'; }).join('') + '</div>';
    if (CFG.n === 1) h += '<p style="text-align:left">Solo: you play against the Rival Flock, a simple deck-driven rival that grabs dice, lays eggs and races you for the round goals.</p>';
    h += '<div class="seatrow"><span class="nm">You</span><span>always a person</span></div>';
    for (var i = 1; i < CFG.n; i++) h += '<div class="seatrow"><span class="nm">' + NAMES[i - 1] + '</span><div class="seg">' + ['ai', 'human'].map(function (k) { return '<button type="button" class="btn' + (CFG.kinds[i] === k ? ' on' : '') + '" data-k="' + i + ':' + k + '">' + (k === 'ai' ? 'Computer' : 'Person (pass the device)') + '</button>'; }).join('') + '</div></div>';
    h += '<div class="lab">Computer skill</div><div class="seg">' + ['easy', 'normal', 'hard'].map(function (l) { return '<button type="button" class="btn' + (CFG.lvl === l ? ' on' : '') + '" data-l="' + l + '">' + l[0].toUpperCase() + l.slice(1) + '</button>'; }).join('') + '</div>' +
      '<div class="lab">Round goals</div><div class="seg">' + [['green', 'Race (most wins)'], ['blue', '1 point each, max 5']].map(function (o) { return '<button type="button" class="btn' + ((CFG.side || 'green') === o[0] ? ' on' : '') + '" data-side="' + o[0] + '">' + o[1] + '</button>'; }).join('') + '</div>' +
      '<div class="lab">Who starts</div><div class="seg">' + [['you', 'You'], ['random', 'Random']].map(function (o) { return '<button type="button" class="btn' + ((CFG.first || 'you') === o[0] ? ' on' : '') + '" data-first="' + o[0] + '">' + o[1] + '</button>'; }).join('') + '</div></div>';
    h += '<div class="tmenu"><button type="button" class="btn big primary" data-go="1">Start the year</button><button type="button" class="btn" data-back="1">Back</button></div>';
    el.innerHTML = h;
    $$('[data-n]', el).forEach(function (b) { b.onclick = function () { CFG.n = +b.dataset.n; draw(); }; });
    $$('[data-k]', el).forEach(function (b) { b.onclick = function () { var x = b.dataset.k.split(':'); CFG.kinds[+x[0]] = x[1]; draw(); }; });
    $$('[data-l]', el).forEach(function (b) { b.onclick = function () { CFG.lvl = b.dataset.l; draw(); }; });
    $$('[data-side]', el).forEach(function (b) { b.onclick = function () { CFG.side = b.dataset.side; draw(); }; });
    $$('[data-first]', el).forEach(function (b) { b.onclick = function () { CFG.first = b.dataset.first; draw(); }; });
    $('[data-back]', el).onclick = function () { el.hidden = true; showTitle(); };
    $('[data-go]', el).onclick = function () { try { localStorage.setItem('pp-cfg', JSON.stringify(CFG)); } catch (e) { } quickStart(); };
  }
  $('#title').hidden = true; el.hidden = false; draw();
}
// Restart: the same players and settings from a fresh deal (story chapters restart the chapter)
function restartGame() {
  if (!G || UI.mode === 'tutorial') { tutStart(); return; }
  if (UI.camp) { campStart(UI.camp); return; }
  startGame({ seats: G.pl.map(function (p) { return { name: p.name, kind: p.kind, lvl: p.lvl, face: p.face }; }), mode: UI.mode });
}
function quickStart() {
  var seats = [{ name: 'You', kind: 'human', face: 'you' }];
  if (CFG.n === 1) seats.push({ name: 'Rival Flock', kind: 'automa', lvl: CFG.lvl, face: 'corvin' });
  for (var i = 1; i < CFG.n; i++) seats.push({ name: NAMES[i - 1], kind: CFG.kinds[i] === 'human' ? 'human' : 'ai', lvl: CFG.lvl, face: FACES[i - 1] });
  if (seats.filter(function (s) { return s.kind === 'human'; }).length > 1) seats[0].name = 'Player 1';
  startGame({ seats: seats, mode: seats.some(function (s, k) { return k && s.kind === 'human'; }) ? 'hot' : CFG.n === 1 ? 'solo' : 'vs', goalSide: CFG.side === 'blue' ? 'blue' : 'green', first: CFG.first === 'random' ? 'random' : 0 });
}
// ---------------- the starting hand: keep 5 in total (birds + food), pick 1 of 2 bonus cards
function showKeep(s) { hideHelp();
  var p = G.pl[s], off = p.offer, el = $('#setup');
  if (!UI.keep || UI.keep.s !== s) { var sug = PPAI.setup(G, s); UI.keep = { s: s, birds: sug.birds.slice(), food: sug.food.slice(), bonus: sug.bonus }; }
  var K = UI.keep;
  function draw() {
    var n = K.birds.length + K.food.length;
    var h = '<h2>' + (humans().length > 1 ? esc(p.name) + ': your' : 'Your') + ' starting hand</h2>' + (UI.camp && UI.camp.goal ? '<p class="goalline"><b>Chapter goal:</b> ' + esc(UI.camp.goal.text) + '</p>' : '') + '<p>Keep 5 things in total: birds and food. We picked a good start; tap to change it.</p>' +
      '<div class="keepgrid">' + off.birds.map(function (id, i) { return cardHTML(id, 'hand', null, 'data-kb="' + i + '" role="button" tabindex="0"').replace('class="bc ', 'class="bc ' + (K.birds.indexOf(i) >= 0 ? 'on ' : 'off ')); }).join('') + '</div>' +
      '<div class="keepgrid">' + PP.FOODS.map(function (f) { return '<button type="button" class="fbtn ' + (K.food.indexOf(f) >= 0 ? 'on' : 'off') + '" data-kf="' + f + '" aria-label="keep ' + f + '">' + foodIcon(f) + '</button>'; }).join('') + '</div>' +
      '<p><b>' + K.birds.length + ' bird' + (K.birds.length === 1 ? '' : 's') + ' + ' + K.food.length + ' food = ' + n + '</b>' + (n === 5 ? ' ✓' : ' (need 5)') + '</p>' +
      '<p>Secret bonus card (scores at the end):</p><div class="keepgrid">' + off.bonus.map(function (id, i) { var bc = PP.BON[id]; return '<button type="button" class="bonc' + (K.bonus === i ? ' on' : '') + '" data-bb="' + i + '"><b>' + esc(bc.n) + '</b>' + esc(bc.txt) + '<br>' + bonusTiers(bc) + '</button>'; }).join('') + '</div>' +
      '<div class="tmenu"><button type="button" class="btn big primary" id="keepgo"' + (n === 5 ? '' : ' disabled') + '>Keep these</button></div>';
    el.innerHTML = h; el.hidden = false;
    $$('[data-kb]', el).forEach(function (b) { b.onclick = function () { var i = +b.dataset.kb, k = K.birds.indexOf(i); if (k >= 0) K.birds.splice(k, 1); else { K.birds.push(i); if (K.birds.length + K.food.length > 5 && K.food.length) K.food.pop(); } draw(); }; });
    $$('[data-kf]', el).forEach(function (b) { b.onclick = function () { var f = b.dataset.kf, k = K.food.indexOf(f); if (k >= 0) K.food.splice(k, 1); else { K.food.push(f); if (K.birds.length + K.food.length > 5 && K.birds.length) K.birds.pop(); } draw(); }; });
    $$('[data-bb]', el).forEach(function (b) { b.onclick = function () { K.bonus = +b.dataset.bb; draw(); }; });
    $('#keepgo').onclick = function () { if (!tutGate({ type: 'tap', what: 'keep' })) return; el.hidden = true; UI.keep = null; apply({ t: 'keep', birds: K.birds.slice(), food: K.food.slice(), bonus: K.bonus }, s); };
  }
  draw();
}
// ---------------- game over
function gameOver() { hideHelp();
  if (UI.overShown === G) return; UI.overShown = G;
  clearSave(); musicSync(); sfx('end');
  try { localStorage.setItem('pp-played', '1'); } catch (e) { }
  if (UI.mode === 'tutorial') return;
  var me = humans()[0] || 0, sc = G.final, win = G.winner, winners = Array.isArray(win) ? win : [win];
  try { if (window.GNS && UI.mode !== 'tutorial') GNS.result({ game: 'perch-and-plume', mode: UI.camp ? 'campaign' : UI.mode, level: (G.pl.find(function (p) { return p.kind !== 'human'; }) || {}).lvl, seats: G.pl.map(function (p, i) { return { name: p.name, me: i === me, ai: p.kind !== 'human' ? p.lvl : undefined }; }), winner: Array.isArray(win) ? win : win, scores: sc.map(function (s) { return s.total; }), turns: G.turn, ms: Date.now() - UI.started }); } catch (e) { }
  var gwin, el = $('#result'), order = sc.map(function (s, i) { return i; }).sort(function (a, b) { return sc[b].total - sc[a].total; });
  var line = winners.length > 1 ? 'A tie at the top!' : isHuman(winners[0]) ? (humans().length > 1 ? G.pl[winners[0]].name + ' wins the year!' : 'You win the year!') : G.pl[winners[0]].name + ' wins the year.';
  var goalHTML = '';
  if (UI.camp && UI.camp.goal) {   // story: say plainly whether the chapter goal was met, with the count, and what the stars need
    var gr = campGoalLive(G, UI.camp), gm = campMetrics(G), gwin = campIsWon(G, UI.camp);
    var sl = (UI.camp.stars || []).map(function (st, i) { var ok = i === 0 ? gwin : (gwin && GXC.testStar(st.test, gm)); return '<li class="' + (ok ? 'on' : '') + '"><i>\u2605</i> ' + esc(st.text) + '</li>'; }).join('');
    goalHTML = '<div class="goalres ' + (gwin ? 'met' : 'miss') + '"><b>' + (gwin ? 'Chapter goal met!' : 'Chapter goal missed') + '</b><span>' + esc(UI.camp.goal.text) + (gr.need != null ? ' You had ' + gr.cur + '.' : '') + '</span>' +
      (gwin ? '' : '<span>' + (win === 0 || winners.indexOf(me) >= 0 ? 'You won the year, but this chapter is only cleared when its goal is met. Try again!' : 'Try again: the goal is shown at the top of the board.') + '</span>') +
      '<ul class="goalstars">' + sl + '</ul>' + (gwin ? '' : '<small>Stars are earned once the goal is met.</small>') + '</div>';
  }
  var h = artHTML('bg-result', 'bgart', '') + (UI.camp && UI.camp.goal ? '<h2>' + esc(gwin ? 'Goal met!' : 'Goal missed') + '</h2><p class="yr">' + esc(line) + '</p>' + goalHTML : '<h2>' + esc(line) + '</h2>') + '<table class="stand"><tr><th>Player</th><th>Birds</th><th>Bonus</th><th>Goals</th><th>Eggs</th><th>Food</th><th>Tucked</th><th>Total</th></tr>' +
    order.map(function (i) { var s = sc[i]; return '<tr class="' + (winners.indexOf(i) >= 0 ? 'win' : '') + '"><td>' + esc(G.pl[i].name) + '</td><td>' + s.birds + '</td><td>' + s.bonus + '</td><td>' + s.goals + '</td><td>' + s.eggs + '</td><td>' + s.cache + '</td><td>' + s.tuck + (s.lead ? '+' + s.lead : '') + '</td><td><b data-engine="G.final[' + i + '].total">' + s.total + '</b></td></tr>'; }).join('') + '</table>';
  h += '<p>Birds = card points. Food = food cached on birds. Ties go to the most food left over.</p><div class="tmenu">' +
    (UI.camp ? '<button type="button" class="btn big primary" id="again">Continue the story</button>' : '<button type="button" class="btn big primary" id="again">Play again</button><button type="button" class="btn" id="totitle">Title screen</button>') + '</div>';
  el.innerHTML = h;
  setTimeout(function () {
    el.hidden = false; $('#toast').innerHTML = '';
    $('#again').onclick = function () { el.hidden = true; if (UI.camp) { try { GXC.finish(G); } catch (e) { showTitle(); } } else quickStart(); };
    var tt = $('#totitle'); if (tt) tt.onclick = function () { el.hidden = true; showTitle(); };
  }, aMs(700));
}
// ---------------- drawers: rules, goals, log, opponent board
var RULES = [
  ['The goal', 'Attract birds to your three habitats over 4 rounds. Most points wins: birds, bonus cards, round goals, eggs, cached food and tucked cards are each worth points.'],
  ['Your turn', 'Take ONE action: play a bird from your hand, or use a habitat row. Each round you get fewer actions: 8, then 7, 6 and 5.'],
  ['Forest: gain food', 'Take food dice from the birdfeeder. The more birds in your forest, the more food. When the feeder is empty, all 5 dice are rolled again; if every die shows the same food you may reroll.'],
  ['Grassland: lay eggs', 'Put eggs on your birds (each bird holds only as many as its nest shows). Each egg is 1 point and pays for playing birds further right.'],
  ['Wetland: draw cards', 'Take birds from the face-up tray of 3 or from the deck. The tray refills at the end of the turn.'],
  ['Trades on the board', 'Every second space in a row offers a trade: a card for 1 more food, a food for 1 more egg, or an egg for 1 more card.'],
  ['Playing a bird', 'Pay its food (any 2 food can stand in for 1) and put it in the leftmost empty space of a habitat it lives in. Spaces 2 and 3 cost 1 egg, spaces 4 and 5 cost 2 eggs.'],
  ['Powers', 'Brown powers fire every time you use that row, one by one from right to left. White powers fire once when the bird is played. Pink powers react to other players between your turns.'],
  ['End of round', 'The round goal is scored: most items gets the most points (4/1/0 in round 1 up to 7/4/3 in round 4); ties share. The tray is refreshed and the first player passes on.'],
  ['End of the year', 'After round 4, add up card points, bonus cards, goals, eggs, cached food and tucked cards. Ties go to the most leftover food.']
];
function rulesBody() {
  var d = document.createElement('div'); d.className = 'dr';
  d.innerHTML = '<h3>How a turn works</h3><ol class="howturn"><li>On your turn you do ONE thing.</li><li>Play a bird from your hand into a row (pay the food on the card).</li><li>Or tap a row button: forest = food, grassland = eggs, wetland = cards.</li><li>Every bird in that row then uses its power, right to left.</li><li>After 4 rounds, most points wins: birds, eggs, goals, bonus cards.</li></ol>' + RULES.map(function (r) { return '<h3>' + r[0] + '</h3><p>' + r[1] + '</p>'; }).join('') +
    '<h3>Simplified on purpose</h3><ul><li>Food and eggs you pay for a bird are picked for you (cheapest first).</li><li>The solo Rival Flock is this game\'s own simple deck.</li><li>120 birds, 18 bonus cards and 12 goals, all original.</li><li>A row\'s trade (card for food, food for egg, egg for card) is offered before the row\'s gain, not after.</li><li>Row yields: forest and wetland 1,1,2,2,3,3; grassland 2,2,3,3,4,4; a trade on every second space.</li><li>The 4 round goals never repeat a family.</li><li>When the feeder dice all match and a power wants a food that is not there, the dice are rerolled for you.</li></ul>' +
    '<h3>Row actions by birds in the row</h3><p>Forest food: 1, 1+trade, 2, 2+trade, 3, 3+trade. Grassland eggs: 2, 2+trade, 3, 3+trade, 4, 4+trade. Wetland cards: 1, 1+trade, 2, 2+trade, 3, 3+trade.</p>' +
    '<div class="tmenu" style="margin:10px 0"><button type="button" class="btn" id="rtut">Play the tutorial</button><button type="button" class="btn" id="rref">All cards</button></div>';
  setTimeout(function () { var t = $('#rtut', d); if (t) t.onclick = function () { GX.close(); tutStart(); }; var r = $('#rref', d); if (r) r.onclick = function () { GX.close(); try { GX.refOpen(); } catch (e) { } }; }, 0);
  return d;
}
function goalsBody() {
  var d = document.createElement('div'); d.className = 'dr';
  if (!G) { d.innerHTML = '<p>Start a game to see its round goals.</p>'; return d; }
  var me = UI.view, p = G.pl[me];
  d.innerHTML = '<h3>Round goals</h3>' + G.goals.map(function (gid, r) {
    var res = G.gres[r], cur = r === G.round && G.phase !== 'over';
    var detail = res ? res.pts.map(function (v, i) { return G.pl[i].name + ' ' + v; }).join(', ') : 'Now: ' + G.pl.map(function (q, i) { return q.name + ' ' + PP.goalCount(G, i, gid); }).join(', ');
    return '<div class="gl' + (cur ? ' now' : '') + '"><span>Round ' + (r + 1) + ': ' + esc(PP.GOL[gid].n) + '<br><small>' + PP.GOALPTS[Math.min(r, 3)].join('/') + ' pts · ' + esc(detail) + '</small></span></div>';
  }).join('') + '<h3>Your bonus cards</h3>' + p.bonus.map(function (id) { var bc = PP.BON[id], s = PP.bonusScore(p, id); return '<div class="gl"><span><b>' + esc(bc.n) + '</b>: ' + esc(bc.txt) + '<br><small>' + bonusTiers(bc) + ' · now ' + s.n + ' birds = ' + s.pts + ' pts</small></span></div>'; }).join('') +
    '<h3>Score so far</h3>' + G.pl.map(function (q, i) { var s = PP.scoreOf(G, i); return '<div class="gl"><span>' + esc(q.name) + '</span><b>' + s.total + '</b></div>'; }).join('');
  return d;
}
function logBody() { var d = document.createElement('div'); d.className = 'dr'; d.innerHTML = G ? G.log.slice(-60).reverse().map(function (l) { return '<div class="logl">' + esc(l) + '</div>'; }).join('') : '<p>No game yet.</p>'; return d; }
function oppBody(s) {
  var d = document.createElement('div'), p = G.pl[s], sc = PP.scoreOf(G, s); d.className = 'dr';
  if (p.auto) { d.innerHTML = '<p>The Rival Flock has ' + p.auto.birds.length + ' birds, ' + p.auto.eggs + ' eggs and ' + p.auto.tuck + ' tucked cards. Goal marks this round: ' + p.auto.marks + '.</p><p>Score so far: <b>' + sc.total + '</b></p>'; return d; }
  d.innerHTML = '<p><b>' + sc.total + ' points</b> so far · ' + p.hand.length + ' cards in hand · ' + p.cubes + ' actions left · food ' + PP.FOODS.map(function (f) { return foodIcon(f) + p.food[f]; }).join(' ') + '</p>' +
    [0, 1, 2].map(function (h) { return '<div class="minirow"><span class="rl h' + HABC[h] + '">' + HABN[h] + '</span>' + [0, 1, 2, 3, 4].map(function (c) { var st = p.board[h][c]; return '<div class="slot">' + (st ? cardHTML(st.id, 'slot', st, 'data-oz="' + st.id + '" role="button" tabindex="0"') : '') + '</div>'; }).join('') + '</div>'; }).join('');
  setTimeout(function () { $$('[data-oz]', d).forEach(function (b) { b.onclick = function () { showCard(b.dataset.oz); }; }); }, 0);
  return d;
}
function openOpp(s) { if (!G) return; GX.drawer('oppd', G.pl[s].name + "'s birds", oppBody(s), true); GX.show('oppd'); }
function bootDrawers() {
  GX.drawer('rulesd', 'How to play', rulesBody());
  GX.drawer('goalsd', 'Goals and bonus cards', goalsBody());
  GX.drawer('logd', 'What happened', logBody());
  var o = GX.onShow;
  GX.onShow = function (id) { if (id === 'goalsd') GX.drawer('goalsd', 'Goals and bonus cards', goalsBody()); if (id === 'logd') GX.drawer('logd', 'What happened', logBody()); if (o) o(id); };
  try {
    GX.settings({ id: 'setd', title: 'Menu',
      game: function (S) { var b1 = document.createElement('button'); b1.className = 'btn'; b1.type = 'button'; b1.textContent = 'Title screen'; b1.onclick = function () { GX.close(); showTitle(); };
        var b2 = document.createElement('button'); b2.className = 'btn'; b2.type = 'button'; b2.textContent = 'New quick game'; b2.onclick = function () { GX.close(); showConfig(); };
        var b3 = document.createElement('button'); b3.className = 'btn'; b3.type = 'button'; b3.textContent = 'Story map'; b3.onclick = function () { GX.close(); openStory(); };
        var b4 = document.createElement('button'); b4.className = 'btn'; b4.type = 'button'; b4.textContent = 'Restart'; b4.onclick = function () { GX.close(); restartGame(); };
        S.appendChild(GX.row('This game', [b4, b1, b2, b3])); },
      sound: function (S) { S.appendChild(GX.row('Sound effects', GX.onoff(SND.on, function (v) { SND.on = v; try { localStorage.setItem('pp-snd', v ? '1' : '0'); } catch (e) { } }))); var mb = document.createElement('button'); mb.className = 'btn'; mb.type = 'button'; mb.textContent = (window.PP_MUSIC || []).length ? 'Pick songs' : 'No songs yet'; mb.disabled = !(window.PP_MUSIC || []).length; mb.onclick = function () { try { GXMUS.open(); } catch (e) { } }; S.appendChild(GX.row('Music', [mb], 'Songs play here once the music files are added.')); },
      help: function (S) { var r = document.createElement('button'); r.className = 'btn'; r.type = 'button'; r.textContent = 'Rules'; r.onclick = function () { GX.show('rulesd'); };
        var c = document.createElement('button'); c.className = 'btn'; c.type = 'button'; c.textContent = 'All cards'; c.onclick = function () { GX.close(); try { GX.refOpen(); } catch (e) { } };
        var t = document.createElement('button'); t.className = 'btn'; t.type = 'button'; t.textContent = 'Tutorial'; t.onclick = function () { GX.close(); tutStart(); };
        S.appendChild(GX.row('Read', [r, c, t])); try { if (window.GXH) S.appendChild(GXH.settingsRow()); } catch (e) { } },
      about: { name: 'Perch & Plume', version: '1.0', text: 'Original birds and names. Food, egg and cube icons: game-icons.net by Lorc and Delapouite, CC BY 3.0.' } });
  } catch (e) { }
  try {
    GX.reference([
      { id: 'birds', title: 'Birds', items: PP.DATA.birds.map(function (b) { var pw = PP.power(b.id); return { id: b.id, name: b.n, count: 1, text: pw.txt, tags: b.h.split('').map(function (x) { return HABN['FGW'.indexOf(x)]; }).concat([b.nest + ' nest', (pw.col || 'no') + ' power']), meta: b.p + ' points · eggs ' + b.e + ' · ' + b.ws + ' cm' }; }) },
      { id: 'bonus', title: 'Bonus cards', items: PP.DATA.bonus.map(function (bc) { return { id: 'bonus-' + bc.id, name: bc.n, count: 1, text: bc.txt + '. ' + bonusTiers(bc) + '.', tags: ['bonus'] }; }) },
      { id: 'goals', title: 'Round goals', items: PP.DATA.goals.map(function (g) { return { id: 'goal-' + g.id, name: g.n, count: 1, text: 'Scored at the end of a round: most wins.', tags: ['goal'] }; }) }
    ], { title: 'All cards', label: 'Cards', button: false, picture: function (it, big) { return PP.B[it.id] ? '<div style="position:relative;width:' + (big ? 200 : 52) + 'px;height:' + (big ? 200 : 52) + 'px;border-radius:8px;overflow:hidden" class="bc">' + artHTML('bird-' + it.id) + '</div>' : null; } });
  } catch (e) { }
}
