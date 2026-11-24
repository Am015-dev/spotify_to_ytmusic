// Twin Thrones scenario lessons (W687): ten short games on the real board (shell/gx-scenario-tutor.js, docs shell/GXST.md).
// Each lesson hand-builds a tiny position with the game's own engine, gives ONE goal, scripts the rival, and judges the real state.
// The old dimming guided game (tutor.js) is retired; this file keeps the small TT_TUTOR hooks the UI calls (rival script, cancel).
// RULE -> LESSON TABLE (rules-notes.md, the rules drawer, engine.js):
//   wonder draft: you 1, rival 2, last one yours ...... draft     | pyramid: only uncovered cards, a covered card flips ..... take
//   cards you own pay their resource for free ......... own       | trading: 2 coins + 1 per rival card making it ........... trade
//   chain symbol makes a linked card free ............. chain     | sell: 2 coins + 1 per yellow card ....................... sell
//   shields move the pawn, loot at 3 steps ............ war       | science pair: second symbol = progress token ............ pair
//   wonder: card tucked under, play again ............. wonder    | scoring and the winner after the last card .............. game
//   board tour: every region named before any move .. board | 9-step war win ........ warwin | six symbols win ........ sciwin
//   NOT a lesson (rules drawer only): 7-wonder cap, who starts the next age, guilds,
//   the other progress tokens, blue-point tie-break.
(function () {
  if (!window.GXST || !window.TT_UI) return;
  var UI = TT_UI, U = UI.U, E = UI.E, $ = UI.$, BY = UI.BY;
  var L = { on: 0, n: 0, r: 0, last: null, lay0: null, c0: 0 };   // n = my moves, r = rival moves in this lesson
  var ALLT = ['t-strategy', 't-agriculture', 't-philosophy', 't-urbanism', 't-law', 't-architecture', 't-economy', 't-masonry', 't-mathematics', 't-theology'];
  var G = function () { return U.G; };
  var me = function () { return U.G.players[0]; };
  function rows(a) { return a.map(function (r) { return { xs: r[0], up: r[1], ids: r[2] }; }); }
  function layout(on, age, rs) {
    var Ly = TT.LAYOUT;
    if (on) { if (!L.lay0) L.lay0 = { 1: Ly[1], 2: Ly[2], 3: Ly[3] }; Ly[age] = rs.map(function (r) { return { xs: r.xs, up: r.up }; }); }
    else if (L.lay0) { Ly[1] = L.lay0[1]; Ly[2] = L.lay0[2]; Ly[3] = L.lay0[3]; L.lay0 = null; }
  }
  // ---- the position: a fresh game, then every piece placed by hand (the engine's own state shape)
  function stack(sp) {
    try { GX.close(); } catch (e) { } tourEnd(true);
    U.tut = true; U.rivalName = 'Pell'; U.lvl = 'easy'; L.on = 1; L.n = 0; L.r = 0; L.last = null;
    layout(false); if (sp.rows) layout(true, sp.age, sp.rows);
    $('res').hidden = true; $('start').hidden = true;
    UI.newGame('cpu', 5);
    var g = U.G; g.firstSeat = 0;
    if (sp.draft) { g.draft.pool = sp.draft.slice(); g.draft.avail = sp.draft.slice(0, 4); }
    else {
      g.phase = 'play'; g.age = sp.age; g.draft.n = 8; g.draft.avail = []; g.draft.pool = []; g.turn = 0; g.pend = []; g.over = false; g.discard = [];
      g.mil = sp.mil || 0; g.built = 0; g.loot = [[0, 0], [0, 0]]; g.pyr = []; g.decks[sp.age] = [];
      var n = 0; sp.rows.forEach(function (r, ri) { r.xs.forEach(function (x, k) { g.pyr.push({ i: n++, r: ri, x: x, id: r.ids[k], up: r.up, taken: 0 }); g.decks[sp.age].push(r.ids[k]); }); });
      [0, 1].forEach(function (p) {
        var P = g.players[p]; P.coins = sp.coins[p]; P.cards = (sp.cards[p] || []).slice(); P.tokens = []; P.pairs = [];
        P.wonders = ((sp.wonders && sp.wonders[p]) || []).map(function (w) { return { id: w, card: null }; });
      });
      g.tokensUp = ALLT.slice(0, 5); g.tokensBox = ALLT.slice(5);
    }
    L.c0 = g.players[0].coins; L.cards0 = g.players[0].cards.length;
    U.sel = null; U.busy = false; U.narr = false; U.lastSide = null;
    UI.render();
    return new Promise(function (r) { setTimeout(r, 450); });
  }
  var card = function (id) { return function () { var g = U.G, i; if (!g) return null; for (i = 0; i < g.pyr.length; i++) if (g.pyr[i].id === id && !g.pyr[i].taken) return $('c' + i); return null; }; };
  // multi-step move: ring the picked card first, then the action button (Build / Sell / Wonder) once a card is picked
  var step = function (cf, act) { return function () { if (U.G && U.sel != null) { var b = document.querySelector('[data-a="' + act + '"]'); if (b) return b; } return cf(); }; };
  var pick = function (w) { return function () { return document.querySelector('[data-pick="' + w + '"]'); }; };
  var did = function () { return L.n > 0; };
  var built = function () { return me().cards.length > L.cards0; };
  var tokPend = function () { var p = G().pend[0]; return !!p && p.type === 'token'; };
  var FRONT4 = [-3, -1, 1, 3];
  // ---- W771 board tour (lesson 1): before any move, a bubble names each board region in turn, its arrow touching the region.
  // One short sentence per step; tap anywhere for the next. The lesson is won when the last region has been named.
  var TOUR = [
    ['#pyr', 'This is the board: a pyramid of cards. You and Pell share it.'],
    ['#pyr .card.av', 'Glowing cards are uncovered. Only these can be taken.'],
    ['#s1', 'Top: Pell’s throne. Pell’s coins, wonders and city.'],
    ['#s0 .tab', 'Bottom: your throne. Cards you build land in your city.'],
    ['#coins0', 'Your coins. Cards cost coins or resources.'],
    ['#s0 .wrow', 'Your wonders. Build them later for big rewards.'],
    ['#s0 .scis', 'Your science symbols. Six different ones win the game at once.'],
    ['#mil', 'The war track. Shields push this pawn toward Pell.'],
    ['#mil .mend.r', 'Push the pawn to this end and you win at once.'],
    ['#tokrow', 'Science bonus tokens. Two matching symbols earn you one.'],
    ['#pts0', 'Your points. After three ages, most points wins.'],
    ['#pts1', 'Pell’s points. Stay ahead of this number.'],
    ['#instr', 'This line says whose turn it is and what to do.'],
    ['.gx-bar [data-gx="rulesd"]', 'Full rules and every card live here, any time.']
  ];
  var T = { i: -1, el: null, hl: null, done: false };
  function tourEnd(quiet) {
    if (T.hl) T.hl.classList.remove('tt-hl'); T.hl = null;
    if (T.el) T.el.remove(); T.el = null; T.i = -1;
    document.documentElement.classList.remove('tt-touring'); var bd = $('bd'); if (bd) bd.classList.remove('tour');
    if (!quiet) T.done = true;
  }
  function tourShow() {
    if (T.hl) T.hl.classList.remove('tt-hl'); T.hl = null;
    var st = TOUR[T.i]; if (!st) { tourEnd(); return; }
    var tg = document.querySelector(st[0]), r = tg && tg.getBoundingClientRect();
    if (!r || r.width < 4 || r.height < 4) { T.i++; tourShow(); return; }
    tg.classList.add('tt-hl'); T.hl = tg;
    var b = T.el.firstChild, vw = innerWidth, vh = innerHeight, bw = Math.min(340, vw - 24);
    b.style.width = bw + 'px'; b.querySelector('.tx').textContent = st[1]; b.querySelector('.n').textContent = (T.i + 1) + ' of ' + TOUR.length + ' · tap to go on';
    var bh = b.offsetHeight, x = Math.max(12, Math.min(vw - bw - 12, r.left + r.width / 2 - bw / 2)), y, up;
    if (r.bottom + 16 + bh <= vh - 8) { y = r.bottom + 14; up = '1'; }          // below, arrow up
    else if (r.top - 16 - bh >= 8) { y = r.top - bh - 14; up = '0'; }           // above, arrow down
    else { y = Math.max(8, Math.min(vh - bh - 8, r.top + 16)); up = 'in'; }     // a big region (the pyramid): inside its top edge
    b.style.left = x + 'px'; b.style.top = y + 'px'; b.dataset.up = up;
    b.querySelector('i').style.left = Math.max(14, Math.min(bw - 30, r.left + r.width / 2 - x - 8)) + 'px';
  }
  function tourStart() {
    tourEnd(true); T.done = false; T.i = 0;
    document.documentElement.classList.add('tt-touring'); var bd = $('bd'); if (bd) bd.classList.add('tour');
    var o = document.createElement('div'); o.id = 'tt-tour'; o.setAttribute('role', 'dialog'); o.setAttribute('aria-label', 'Board tour');
    o.innerHTML = '<div class="bub" aria-live="polite"><i></i><span class="tx"></span><span class="n"></span></div>';
    o.addEventListener('click', function (e) { e.stopPropagation(); T.i++; tourShow(); });
    document.body.appendChild(o); T.el = o; setTimeout(tourShow, 60);
  }
  var lessons = [
    { id: 'board', title: 'The board', rule: 'Meet the board first: the card pyramid, both thrones, the war track, science and points.',
      goal: 'Tap to see each part of the board.', par: 0,
      setup: function () { return stack({ age: 1, rows: rows([[[-1, 1], 0, ['a1-lookout', 'a1-open-stage']], [FRONT4, 1, ['a1-timber-stand', 'a1-pony-pen', 'a1-roadside-inn', 'a1-scribe-room']]]), coins: [7, 7], cards: [['a1-herb-garden', 'a1-weights-hall'], ['a1-rock-face']], wonders: [['w-sky-tomb', 'w-terraced-orchard', 'w-moon-grove', 'w-merchant-road'], ['w-bronze-titan', 'w-stone-riddle', 'w-archive-of-dust', 'w-thunder-idol']] }).then(tourStart); },
      success: function () { return T.done; },
      fail: function () { return false; },
      hints: ['Tap anywhere: the next part of the board lights up.'],
      debrief: 'That is the whole board. Next: take your first card.' },
    { id: 'draft', title: 'Wonder draft', rule: 'Wonders are drafted before play: you take one, your rival takes two, the last one comes to you.',
      goal: 'Claim the Sky Tomb, the wonder worth 9 points.', par: 1,
      setup: function () { return stack({ draft: ['w-sky-tomb', 'w-bronze-titan', 'w-moon-grove', 'w-stone-riddle', 'w-terraced-orchard', 'w-merchant-road', 'w-archive-of-dust', 'w-thunder-idol'] }); },
      success: function () { return did() && me().wonders.some(function (w) { return w.id === 'w-sky-tomb'; }); },
      fail: function () { return did() ? 'You took another wonder. Pell takes the next two, so the Sky Tomb went to Pell.' : false; },
      hints: ['Each wonder lists what it is worth. Which is the biggest?', { say: 'Tap the Sky Tomb: it is worth 9 points.', target: pick('w-sky-tomb') }],
      debrief: 'You pick first, so the best wonder is yours. Pell then takes two.' },
    { id: 'take', title: 'Take a card', rule: 'Only uncovered cards can be taken. Build one to add it to your city; taking cards flips covered cards face up.',
      goal: 'Build the card that makes wood.', par: 1,
      setup: function () { return stack({ age: 1, rows: rows([[[0], 0, ['a1-lookout']], [FRONT4, 1, ['a1-open-stage', 'a1-timber-stand', 'a1-roadside-inn', 'a1-scribe-room']]]), coins: [7, 7], cards: [[], []] }); },
      success: function () { return me().cards.indexOf('a1-timber-stand') >= 0; },
      fail: function () { return did() ? (L.last && L.last.t === 'discard' ? 'You sold it for coins. Built, the Timber Stand would give you wood.' : 'That card makes no wood. Look for the wood symbol.') : false; },
      hints: ['Only the front cards are uncovered. Which one shows a wood icon?', { say: 'Tap the Timber Stand, then Build.', target: step(card('a1-timber-stand'), 'build') }],
      debrief: 'Front cards are free to take. A built wood card now pays wood for you.' },
    { id: 'own', title: 'Your cards pay', rule: 'A resource card you own pays that resource for free on later cards. Missing resources cost coins.',
      goal: 'Build a card and keep all 5 coins.', par: 1,
      setup: function () { return stack({ age: 1, rows: rows([[[0], 0, ['a1-lookout']], [FRONT4, 1, ['a1-pony-pen', 'a1-barrack-yard', 'a1-bathhouse', 'a1-stake-fence']]]), coins: [5, 7], cards: [['a1-timber-stand'], []] }); },
      success: function () { return built() && me().coins >= L.c0; },
      fail: function () { return did() ? 'That card cost ' + Math.max(0, L.c0 - me().coins) + ' coins. You only own wood, so only a wood card is free.' : false; },
      hints: ['You own a wood card. Which card here needs wood?', { say: 'Tap the Pony Pen: its wood is paid by your Timber Stand.', target: step(card('a1-pony-pen'), 'build') }],
      debrief: 'Your Timber Stand paid the wood: the Pony Pen was free.' },
    { id: 'trade', title: 'Buy a resource', rule: 'A resource you lack costs 2 coins, plus 1 for each card your rival has that makes it.',
      goal: 'Build a card and keep at least 4 coins.', par: 1,
      setup: function () { return stack({ age: 1, rows: rows([[[0], 0, ['a1-lookout']], [FRONT4, 1, ['a1-bathhouse', 'a1-barrack-yard', 'a1-timber-depot', 'a1-herb-garden']]]), coins: [6, 7], cards: [[], ['a1-rock-face', 'a1-gravel-pit']] }); },
      success: function () { return built() && me().coins >= 4; },
      fail: function () { return did() && !(built() && me().coins >= 4) ? 'You spent ' + Math.max(0, L.c0 - me().coins) + ' coins. Pell makes 2 stone, so stone costs 4. Clay and glass cost 2.' : false; },
      hints: ['Pell makes stone, so stone is dear. Which cards need something else?', { say: 'The Barrack Yard needs clay, which Pell lacks: only 2 coins.', target: step(card('a1-barrack-yard'), 'build') }],
      debrief: 'Clay: 2 coins. Stone: 2 plus 1 for each of Pell’s stone cards.' },
    { id: 'chain', title: 'Chain symbols', rule: 'A card with a chain symbol you already own is free to build, even if it costs resources.',
      goal: 'Build a red card without spending coins.', par: 1,
      setup: function () { return stack({ age: 2, rows: rows([[[0], 0, ['a2-city-wall']], [FRONT4, 1, ['a2-sawpit', 'a2-horse-yard', 'a2-barracks', 'a2-kiln-yard']]]), coins: [2, 7], cards: [['a1-pony-pen'], []] }); },
      success: function () { return me().cards.indexOf('a2-horse-yard') >= 0 && me().coins >= L.c0; },
      fail: function () { return did() ? 'That cost coins. Your Pony Pen has the horse symbol: the Horse Yard links to it and is free.' : false; },
      hints: ['Your Pony Pen shows a horse symbol. Which red card links to it?', { say: 'Tap the Horse Yard: its chain makes it free.', target: step(card('a2-horse-yard'), 'build') }],
      debrief: 'The horse symbol on your Pony Pen made the Horse Yard free.' },
    { id: 'sell', title: 'Sell a card', rule: 'Instead of building you can sell a card: 2 coins, plus 1 for each yellow card you own.',
      goal: 'Reach 7 coins this turn.', par: 1,
      setup: function () { return stack({ age: 1, rows: rows([[[0], 0, ['a1-lookout']], [FRONT4, 1, ['a1-timber-stand', 'a1-pony-pen', 'a1-open-stage', 'a1-herb-garden']]]), coins: [3, 7], cards: [['a1-roadside-inn', 'a2-brewhouse'], []] }); },
      success: function () { return me().coins >= 7; },
      fail: function () { return did() ? 'You have ' + me().coins + ' coins. Building gives none. Selling gives 2 plus 1 per yellow card: 4.' : false; },
      hints: ['You own two yellow cards. How much does selling pay with them?', { say: 'Tap any card, then Sell: 2 + 2 yellow = 4 coins.', target: step(card('a1-timber-stand'), 'sell') }],
      debrief: 'Sold for 2 + 2 yellow cards: 3 + 4 = 7 coins.' },
    { id: 'war', title: 'War pawn', rule: 'Shields push the pawn toward your rival. Passing 3 steps takes 2 coins from them, 6 steps takes 5, 9 steps wins.',
      goal: 'Take coins from your rival with the war pawn.', par: 1,
      setup: function () { return stack({ age: 3, rows: rows([[[0], 0, ['a3-arsenal']], [FRONT4, 1, ['a1-lookout', 'a3-war-pavilion', 'a1-open-stage', 'a1-stake-fence']]]), coins: [8, 7], cards: [[], []] }); },
      success: function () { return !!G().loot[0][0]; },
      fail: function () { return did() ? 'The pawn is on step ' + G().mil + '. Reach step 3 and your rival loses 2 coins.' : false; },
      hints: ['Red cards show shields. Which one has the most?', { say: 'Tap the War Pavilion: 3 shields move the pawn 3 steps.', target: step(card('a3-war-pavilion'), 'build') }],
      debrief: 'Three shields crossed the first coin space: Pell lost 2 coins.' },
    { id: 'pair', title: 'Science pair', rule: 'A second copy of a science symbol earns a progress token. Six different symbols win at once.',
      goal: 'Earn a progress token.', par: 2,
      setup: function () { return stack({ age: 1, rows: rows([[[0], 0, ['a1-lookout']], [FRONT4, 1, ['a2-measure-hall', 'a1-scribe-room', 'a1-remedy-shop', 'a1-open-stage']]]), coins: [6, 7], cards: [['a1-weights-hall', 'a1-timber-stand', 'a1-glass-kiln'], []] }); },
      success: function () { return me().tokens.length > 0; },
      fail: function () { return did() && !tokPend() && me().tokens.length === 0 ? 'No token: that card carries a different symbol. You need a second scale.' : false; },
      hints: ['You own the scale symbol. Which green card shows a scale too?', { say: 'Tap the Measure Hall: a second scale is a pair.', target: step(card('a2-measure-hall'), 'build') }],
      debrief: 'Two scales make a pair: a progress token is yours.' },
    { id: 'warwin', title: 'War victory', rule: 'Push the war pawn all the way to your rival’s end (9 steps) and you win at once.',
      goal: 'Win the game with the war pawn.', par: 1,
      setup: function () { return stack({ age: 2, mil: 7, rows: rows([[[0], 0, ['a2-sawpit']], [FRONT4, 1, ['a1-lookout', 'a2-city-wall', 'a1-open-stage', 'a1-roadside-inn']]]), coins: [8, 7], cards: [[], []] }).then(function () { U.G.loot = [[1, 1], [0, 0]]; UI.render(); }); },
      success: function () { return !!G().over && G().winner === 0; },
      fail: function () { return did() && !G().over ? 'The pawn is on step ' + G().mil + ' of 9. Two shields were needed.' : false; },
      hints: ['The pawn is 2 steps from Pell’s end. Which card has 2 shields?', { say: 'Tap the City Wall, then Build: 2 shields reach the end.', target: step(card('a2-city-wall'), 'build') }],
      debrief: 'The pawn reached Pell’s end: a war win, no points counted.' },
    { id: 'sciwin', title: 'Science victory', rule: 'Own six different science symbols and you win at once.',
      goal: 'Win the game with your sixth science symbol.', par: 1,
      setup: function () { return stack({ age: 2, rows: rows([[[0], 0, ['a2-sawpit']], [FRONT4, 1, ['a2-herbarium', 'a1-open-stage', 'a2-chart-room', 'a1-lookout']]]), coins: [12, 7], cards: [['a1-herb-garden', 'a1-weights-hall', 'a1-scribe-room', 'a1-remedy-shop', 'a2-star-gazers'], []] }); },
      success: function () { return !!G().over && G().winner === 0; },
      fail: function () { return did() && !G().over && !tokPend() ? 'Still five symbols. You need a new one: the globe.' : false; },
      hints: ['You own five symbols. Which green card shows one you lack?', { say: 'Tap the Chart Room, then Build: the globe is your sixth.', target: step(card('a2-chart-room'), 'build') }],
      debrief: 'Six different symbols: a science win, no points counted.' },
    { id: 'wonder', title: 'Build a wonder', rule: 'Any card can build a wonder: pay its cost and the card goes underneath. Some wonders give another turn.',
      goal: 'Build your wonder and keep your turn.', par: 1,
      setup: function () { return stack({ age: 2, rows: rows([[[0], 0, ['a2-city-wall']], [FRONT4, 1, ['a1-lookout', 'a1-open-stage', 'a1-roadside-inn', 'a1-scribe-room']]]), coins: [5, 7], cards: [['a2-sawpit', 'a1-glass-kiln', 'a1-reed-press'], []], wonders: [['w-terraced-orchard', 'w-sky-tomb'], []] }); },
      success: function () { return G().built > 0 && L.r === 0; },
      fail: function () { return did() && G().built === 0 ? 'You built a card, not a wonder. Tap a card, then Wonder, to tuck it under.' : false; },
      hints: ['Tap any card and look for the Wonder button.', { say: 'Pick a card, then tap Wonder: the Orchard gives 6 coins and a turn.', target: step(card('a1-lookout'), 'wonder') }],
      debrief: 'The Orchard is built and you play again at once.' },
    { id: 'game', title: 'Short game', rule: 'After the last card, points count: cards, wonders, tokens, war, and 1 per 3 coins. Most points wins.',
      goal: 'Win a short game against Pell.',
      setup: function () { return stack({ age: 3, rows: rows([[[0], 0, ['a2-hero-monument']], [[-1, 1], 1, ['a2-judges-hall', 'a2-sun-temple']], [[-2, 0, 2], 1, ['a1-open-stage', 'a1-roadside-inn', 'a2-water-arch']]]), coins: [4, 8], cards: [['a2-sawpit', 'a1-glass-kiln', 'a1-reed-press', 'a1-shrine'], ['a1-lookout', 'a1-stake-fence']] }); },
      success: function () { return !!G().over && G().winner === 0; },
      fail: function () { return G().over && G().winner !== 0 ? 'Pell finished with more points. Blue cards score best: build them rather than sell.' : false; },
      hints: ['Blue cards are worth the most points. Take them before Pell sells them.', 'Build what you can afford; sell only cards you cannot build.'],
      debrief: 'Cards, coins and wonders added up: you finished ahead.' }
  ];
  lessons.forEach(function (s) { s.moves = function () { return L.n; }; });
  // ---- hooks while a lesson runs: scripted rival, move counts; the old guided game's entry points now open the lessons
  function junk(g, M) {   // the rival sells the least useful card, so lessons are never decided by its choice
    var d = M.filter(function (m) { return m.t === 'discard'; }); if (!d.length) return M[0];
    d.sort(function (a, b) { var va = (BY[g.pyr[a.i].id].vp || 0) + (BY[g.pyr[a.i].id].shields || 0), vb = (BY[g.pyr[b.i].id].vp || 0) + (BY[g.pyr[b.i].id].shields || 0); return va - vb || b.i - a.i; });
    return d[0];
  }
  window.TT_TUTOR = {
    rivalMove: function (g) {
      if (!L.on) return null; var M = E.validMoves(g), pd = g.pend[0];
      if (pd && pd.type === 'first') return { t: 'first', who: 0 };
      if (g.phase === 'draft') return M.length ? M[0] : null;
      if (pd) return M[0] || null;
      return junk(g, M);
    },
    holdRival: function () { return false; },
    cancel: function () { if (L.on && GXST.active()) GXST.close(); },
    start: function () { GXST.picker(); }
  };
  var oa = E.apply;
  E.apply = function (g, m) { if (L.on && g === U.G && GXST.active() && !g.over) { var p = E.sideToAct(g); if (p === 0) { L.n++; L.last = m; } else if (p === 1) L.r++; } return oa.apply(this, arguments); };
  addEventListener('gxst', function (e) {
    if (e.detail.type !== 'close' || !L.on) return;
    var fin = GXST.state() && GXST.state().i === lessons.length - 1;   // closed from the last lesson: go on into a real game (Easy), not back to the title
    L.on = 0; tourEnd(true); layout(false); U.tut = false; U.rivalName = null;
    if (fin) { try { U.lvl = 'easy'; $('start').hidden = true; $('res').hidden = true; UI.newGame('cpu'); return; } catch (er) { } }
    try { UI.showStart(); } catch (er) { }
  });
  setInterval(function () { if (L.on && U.G && U.G.over && $('res') && !$('res').hidden) $('res').hidden = true; }, 200);   // the lesson card, not the result screen, ends a lesson
  function go() {
    if (!window.GXST || !document.body) { setTimeout(go, 200); return; }
    GXST.init({ game: 'twin-thrones', scenarios: lessons, keepClear: ['#pyr .card.av', '#zoom', '[data-pick]', '#instr', '#mil', '#s0', '#s1', '#dock', '.gx-bar', '#tokrow', '[data-token]', '[data-tok]'],
      settled: function () { var g = U.G; return !!g && (g.over || (!U.busy && !U.narr && E.sideToAct(g) === 0)); } });
    window.TTL = { L: L, lessons: lessons, stack: stack };
  }
  setTimeout(go, 300);
})();
