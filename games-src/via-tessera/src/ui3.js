// ui3: title, starting games, learn mode tips, result, menu (rules, card reference, log, settings, credits), save, boot.
var LS = { get: function (k) { try { return localStorage.getItem('vt_' + k); } catch (e) { return null; } }, set: function (k, v) { try { localStorage.setItem('vt_' + k, v); } catch (e) { } } };
function save() { if (!G || GXS.on) return; LS.set('save', JSON.stringify({ G: G, mode: UI.mode, lvl: UI.lvl, learn: UI.learn })); }
function startGame(mode, o) {
  o = o || {};
  UI.mode = mode; UI.lvl = o.lvl || UI.lvl; UI.learn = !!o.learn; UI.hints = o.learn ? true : UI.hints;
  var names = mode === 'hot' ? ['Red', 'Green'] : ['You', 'Rival'];
  G = VT.newGame({ seed: o.seed, names: names, ai: mode === 'hot' ? [null, null] : [null, UI.lvl], first: o.first != null ? o.first : (o.learn ? 0 : null) });
  if (o.first == null && !o.learn && o.seed == null) { /* random start player */ var f = Math.random() < 0.5 ? 0 : 1; G = VT.newGame({ seed: G.seed, names: names, ai: G.pl.map(function (p) { return p.ai; }), first: f }); }
  UI.sel = null; UI.selCol = null; UI.selProv = null; UI.busy = false; UI.tipsSeen = {}; UI.undo = []; UI.lastRecap = null;
  $('#start').hidden = true; $('#result').hidden = true; $('#drawer').hidden = true; closeSheet();
  buildMap(); setView({ x: 0, y: 0, w: VTART.W }); homeView(); render(); save();
  if (UI.learn) { tip('Goal: most points at the end', '#race'); setTimeout(function () { if (G && G.turn < 3) banner('Tap a score to see the points', '#race'); }, 5200); }
  if (!isHuman(VT.sideToAct(G))) setTimeout(runAI, UI.fast ? 30 : 900);
}
// learn mode: one short line the first time each action comes up (8 words max)
var TIPS = { 'arch-move': 'Steps = your carts and ships on the map', 'arch-build': 'Build next to your carts and ships', pref: 'Every house in the region makes one good', merc: 'Sell spare goods, buy what you need', buy: 'Each card adds points at the end', colo: 'More carts and ships, more steps', trib: 'Your played cards come back to hand', dipl: 'Use the rival’s last card as yours' };
function tip(t, a) { if (!UI.learn) return; banner(t, a || '#acts .btn'); }
var _rp = renderPrompt;
renderPrompt = function () { _rp(); if (UI.learn && G && G.pend && isHuman(VT.sideToAct(G)) && !UI.busy && TIPS[G.pend.h] && !UI.tipsSeen[G.pend.h]) { UI.tipsSeen[G.pend.h] = 1; UI.tipFor = { h: G.pend.h, t: TIPS[G.pend.h] }; setTimeout(function () { if (typeof placeFinger === 'function') placeFinger(); }, 40); } };

// ---------- title ----------
function showTitle() {
  var s = $('#start'), sv = LS.get('save'), has = false;
  try { var o = JSON.parse(sv); has = o && o.G && o.G.phase === 'play'; } catch (e) { }
  var art = UI.mosaic || (UI.mosaic = VTART.mosaic(D, 2));
  s.innerHTML = '<div class="panel"><div class="title-art" style="background-image:url(' + (art || '') + ')"><h1>Via Tessera</h1></div>' +
    '<p>Spread carts and ships. Build, trade, win patrons.</p><div class="tgrid">' +
    (has ? '<button type="button" class="btn" id="tcont">Continue game</button>' : '') +
    '<button type="button" class="btn' + (has ? ' alt' : '') + '" id="tlearn">Learn to play</button>' +
    '<button type="button" class="btn alt" id="tlvl" aria-label="Rival level">Level: ' + UI.lvl[0].toUpperCase() + UI.lvl.slice(1) + ' \u25B8</button>' +
    '<button type="button" class="btn alt" id="tvs">Play vs computer</button>' +
    '<button type="button" class="btn alt" id="thot">Two players, one phone</button>' +
    '<button type="button" class="btn alt" id="trules">How to play</button></div></div>';
  s.hidden = false;
  $('#tlvl').onclick = function () { var L = ['easy', 'normal', 'hard']; UI.lvl = L[(L.indexOf(UI.lvl) + 1) % 3]; LS.set('lvl', UI.lvl); showTitle(); };
  var c = $('#tcont'); if (c) c.onclick = function () { var o = JSON.parse(LS.get('save')); G = o.G; UI.mode = o.mode; UI.lvl = o.lvl; UI.learn = o.learn; UI.tipsSeen = {}; s.hidden = true; buildMap(); setView({ x: 0, y: 0, w: VTART.W }); homeView(); render(); if (!isHuman(VT.sideToAct(G))) setTimeout(runAI, 600); };
  $('#tlearn').onclick = function () { $('#start').hidden = true; GXST.picker(); };
  $('#tvs').onclick = function () { startGame('vs', { lvl: UI.lvl }); };
  $('#thot').onclick = function () { startGame('hot', {}); };
  $('#trules').onclick = function () { showRules(); };
}

// ---------- result ----------
function showResult() {
  if (!G) return;
  var sc = G.pl.map(function (p, i) { return VT.score(G, i); }), w = VT.winner(G), r = $('#result');
  var rows = D.GODS.map(function (gd) { return '<tr><td><span class="gi">' + icon(gd.icon) + gd.n + '</span></td>' + sc.map(function (s) { var b = s.by[gd.id]; return '<td>' + (b.n ? b.pts + ' <span class="small">(' + b.n + (b.each != null ? '×' + b.each : '') + ')</span>' : '–') + '</td>'; }).join('') + '</tr>'; }).join('');
  rows += '<tr><td><span class="gi">' + icon('laurel') + 'Laurel</span></td>' + sc.map(function (s) { return '<td>' + (s.by.laurel ? s.by.laurel.pts : '–') + '</td>'; }).join('') + '</tr>';
  rows += '<tr class="tot"><td>Total</td>' + sc.map(function (s) { return '<td>' + s.total + '</td>'; }).join('') + '</tr>';
  var youWin = UI.mode !== 'hot' && w === 0;
  r.innerHTML = '<div class="panel"><h2>' + (UI.mode === 'hot' ? esc(G.pl[w].name) + ' wins!' : youWin ? 'You win!' : 'The rival wins') + '</h2>' +
    '<table class="sc-table"><thead><tr><th>Patron</th>' + G.pl.map(function (p) { return '<th>' + esc(p.name) + '</th>'; }).join('') + '</tr></thead><tbody>' + rows + '</tbody></table>' +
    '<p class="small">' + (sc[0].total === sc[1].total ? 'Tie: the Grand Governor tile decides.' : 'Each patron scores once per card showing it.') + '</p>' +
    '<button type="button" class="btn" id="ragain">Play again</button><button type="button" class="btn alt" id="rmap">See the map</button><button type="button" class="btn alt" id="rhome">Title</button></div>';
  r.hidden = false; sfx(youWin ? 'win' : 'card');
  $('#ragain').onclick = function () { startGame(UI.mode, { lvl: UI.lvl }); };
  $('#rmap').onclick = function () { r.hidden = true; };
  $('#rhome').onclick = function () { r.hidden = true; showTitle(); };
  LS.set('save', '');
}

// ---------- menu and drawers ----------
function drawer(title, html) {
  var d = $('#drawer');
  d.innerHTML = '<div class="panel"><div class="sh-head"><h2>' + esc(title) + '</h2><button type="button" class="x" data-x aria-label="Close">×</button></div>' + html + '</div>';
  d.hidden = false;
  d.querySelector('[data-x]').onclick = function () { d.hidden = true; };
  d.onclick = function (e) { if (e.target === d) d.hidden = true; };
}
document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { if (!$('#drawer').hidden) $('#drawer').hidden = true; else if (UI.sheet && $('#sheet [data-x]')) closeSheet(); } });
function showMenu() {
  drawer('Menu', '<div class="seg"><button type="button" id="mh" aria-pressed="' + UI.hints + '">Hints ' + (UI.hints ? 'on' : 'off') + '</button><button type="button" id="ms" aria-pressed="' + !UI.mute + '">Sound ' + (UI.mute ? 'off' : 'on') + '</button></div>' +
    '<button type="button" class="btn alt" id="mrules">How to play</button><button type="button" class="btn alt" id="mcards">Every card</button><button type="button" class="btn alt" id="mscore">Score so far</button><button type="button" class="btn alt" id="mlog">What happened</button>' +
    '<button type="button" class="btn alt" id="mnew">New game</button><button type="button" class="btn alt" id="mcred">Credits</button>');
  $('#mh').onclick = function () { UI.hints = !UI.hints; UI.learn = UI.hints && UI.learn; LS.set('hints', UI.hints ? '1' : '0'); render(); showMenu(); };
  $('#ms').onclick = function () { UI.mute = !UI.mute; LS.set('mute', UI.mute ? '1' : '0'); showMenu(); };
  $('#mrules').onclick = showRules; $('#mcards').onclick = showCards; $('#mlog').onclick = showLog; $('#mcred').onclick = showCredits; $('#mscore').onclick = showScoreNow;
  $('#mnew').onclick = function () { $('#drawer').hidden = true; showTitle(); };
}
function showScoreNow() { if (G) drawer('Points so far', scoreTable()); }
function scoreTable() {
  var sc = G.pl.map(function (p, i) { return VT.score(G, i); });
  return ('<table class="sc-table"><thead><tr><th>Patron</th>' + G.pl.map(function (p) { return '<th>' + esc(p.name) + '</th>'; }).join('') + '</tr></thead><tbody>' +
    D.GODS.map(function (gd) { return '<tr><td><span class="gi">' + icon(gd.icon) + gd.n + '</span><br><span class="small">' + gd.rule + '</span></td>' + sc.map(function (s) { var b = s.by[gd.id]; return '<td>' + b.pts + (b.n ? '<br><span class="small">' + b.n + ' card' + (b.n > 1 ? 's' : '') + (b.each != null ? ' \u00D7 ' + b.each : '') + '</span>' : '') + '</td>'; }).join('') + '</tr>'; }).join('') +
    '<tr class="tot"><td>Total</td>' + sc.map(function (s) { return '<td>' + s.total + '</td>'; }).join('') + '</tr></tbody></table>' + (UI.lastRecap ? '<p class="small">Last rival turn: ' + esc(UI.lastRecap) + '</p>' : '') + '<p class="small">More cards with a patron multiply its points.</p>');
}
function showPlayer(i) {
  var p = G.pl[i], goods = D.GOODS.map(function (g) { return '<span class="pg">' + gIcon(g) + ' ' + p.goods[g] + '</span>'; }).join(''), top = p.disc[p.disc.length - 1];
  var facts = '<div class="pfacts"><span><b>' + VT.score(G, i).total + '</b> points now</span><span><b>' + p.coins + '</b> coins</span><span><b>' + p.houses.length + '/15</b> houses</span><span><b>' + VT.onBoard(p) + '</b> carts and ships on the map</span><span><b>' + p.hand.length + '</b> cards in hand</span></div><div class="pgoods">' + goods + '</div>';
  var pile = p.disc.length ? '<h3 class="ph">Played pile (top card is public)</h3><div class="mrow">' + p.disc.slice().reverse().map(function (id) { return cardHTML(id, '', 'tabindex="-1" disabled'); }).join('') + '</div>' : '<p class="small">Nothing played yet.</p>';
  drawer(p.name, facts + pile + '<h3 class="ph">Points by patron</h3>' + scoreTable());
}
function showLog() { drawer('What happened', '<div class="rules">' + (G ? G.log.slice(-30).reverse().map(function (l) { return '<p>' + esc(l) + '</p>'; }).join('') : '') + '</div>'); }
function showRules() {
  var G5 = ['brick', 'food', 'tool', 'wine', 'cloth'], gi = function (g) { return '<span class="gi" style="color:' + GOOD_COL[g] + '">' + icon(g) + '</span>'; };
  var role = function (k, txt) { return '<li class="rl"><span class="ri">' + icon(D.ACTS[k].icon) + '</span><span><b>' + D.ACTS[k].n + ':</b> ' + txt + '</span></li>'; };
  var god = function (id, txt) { var g = D.GODS.filter(function (x) { return x.id === id; })[0]; return '<li class="rl"><span class="ri">' + icon(g.icon) + '</span><span><b>' + g.n + ':</b> ' + txt + '</span></li>'; };
  drawer('How to play', '<div class="rules">' +
    '<h3>1. The goal</h3><p>Finish with the most points. You score at the end, and <b>every card you own</b> (in your hand or played) scores for the symbol printed on it. So buy cards that match how you play.</p>' +
    '<h3>2. Your turn</h3><ol><li><b>Play ONE card</b> from your hand.</li><li><b>Do what it says</b> (see the roles below).</li><li>Your played cards pile up face up. Play the <b>Herald</b> to take them all back.</li></ol>' +
    '<h3>3. The roles</h3><ul class="rls">' +
    role('arch', 'moves your ' + icon('meeple') + ' carts and ' + icon('ship') + ' ships, then you build ' + icon('house') + ' houses next to them.') +
    role('pref', 'a region with its good showing makes goods for every house there, and you get 1 extra. Or collect the coins on flipped regions.') +
    role('merc', 'take 3 ' + icon('coins') + ' (5 if bought), then buy or sell goods, 2 kinds at most.') +
    role('sen', 'buy up to 2 cards from the market.') +
    role('cons', 'buy 1 card, but only pay the goods printed on it.') +
    role('dipl', 'do the same as the top card of the rival’s pile.') +
    role('colo', 'add carts or ships (1 ' + gi('food') + ' + 1 ' + gi('tool') + ' each), or take 5 ' + icon('coins') + ' + 1 per cart or ship on the map.') +
    role('trib', 'take all your played cards back (+1 ' + icon('coins') + ' per card over 3). You may also buy 1 cart or ship.') +
    role('spec', 'each of your houses in cities of its good makes 1 of that good.') + '</ul>' +
    '<h3>4. Goods and coins</h3><p>' + G5.map(gi).join('') + ' brick, grain, tools, wine, cloth. Buy and sell price: 3, 4, 5, 6, 7 ' + icon('coins') + '. Your storehouse has 12 spaces. Each holds 1 good <i>or</i> 1 waiting cart or ship. If more arrives than fits, you choose what to keep.</p>' +
    '<h3>5. Moving and building</h3><ol><li>Carts use roads, ships use sea lanes. You get 1 step per cart or ship on the map.</li><li>First step goes onto a line. Each next step goes through a city onto the next line.</li><li>You may pass a busy line, but never end on one.</li><li>Then build in cities at either end of a line you stand on.</li></ol>' +
    '<p>A house costs 1 ' + gi('brick') + ' + 1 of the city’s good (brick cities: just 1 ' + gi('food') + '), plus coins: brick 1, grain 2, tools 3, wine 4, cloth 5, times the houses there after yours. One house per city each. Never in the capital (Caput).</p>' +
    '<h3>6. The market</h3><p>A card costs the goods printed on it plus an extra for its slot: slot 1 none, 2–3 any 1 good, 4–5 1 ' + gi('cloth') + ', 6 any 1 good + 1 ' + gi('cloth') + ', 7 two ' + gi('cloth') + '. Gaps close and the market refills at the end of your turn.</p>' +
    '<h3>7. The end</h3><ol><li>The game ends when someone <b>buys the last market card</b> or <b>builds their 15th house</b>.</li><li>That player takes the <b>Laurel: 7 points</b>.</li><li>The other player gets one last turn. Then count points.</li></ol>' +
    '<h3>8. Points, per symbol</h3><p class="small">Work out the value once, then multiply by your cards that show the symbol.</p><ul class="rls">' +
    god('hearth', '1 point per 10 coins. Your goods count at their price.') +
    god('eagle', '1 point per house outside brick cities (up to 15).') +
    god('sickle', '1 point per region where you have a house.') +
    god('wing', '2 points per kind of good your houses make (up to 10).') +
    god('shield', '2 points per cart or ship on the map (up to 12).') +
    god('owl', 'Maker cards only: points per house in cities of its good: brick 3, grain 3, tools 3, wine 4, cloth 5.') + '</ul>' +
    '<h3>9. Grand Governor</h3><p>Starts with the second player. Whoever makes a region produce while holding it gets 2 bonus goods, then passes it to the other player. It also wins a tie.</p></div>');
}
function actRule(k) {
  return { arch: 'move your carts and ships as many steps as you have on the map, then build houses.',
    pref: 'pick a region with its good showing: every house there makes 1 good, you also get its bonus good, then flip it. Or collect the coins on all flipped markers and flip them back.',
    merc: 'take 3 coins (5 on bought Traders), then buy and sell up to 2 kinds of goods at the roof prices.',
    sen: 'buy up to 2 cards from the market.', cons: 'buy 1 card, paying only its printed goods.',
    dipl: 'do the action of the card on top of the rival’s played pile.',
    colo: 'put new carts or ships in Caput or a city with your house (1 grain + 1 tool each), or take 5 coins + 1 per cart and ship on the map.',
    trib: 'take all played cards back, plus 1 coin per card over 3. Then you may buy one cart or ship for Caput.',
    spec: 'each of your houses in cities of its good makes 1 of that good.' }[k];
}
function showCards() {
  var seen = {}, h = '<p class="small">7 starting cards each, plus 15 market cards.</p>';
  var list = D.START_HAND.map(function (id) { return [id, 'Start × 2 players']; });
  D.DECK_STACKS(2).forEach(function (st, n) { st.forEach(function (id) { list.push([id, 'Market ' + (n ? 'II' : 'I')]); }); });
  list.forEach(function (x) { var c = D.CARDS[x[0]]; var cost = Object.keys(c.cost).map(function (g) { return c.cost[g] + ' ' + D.GOOD_NAME[g]; }).join(' + ') || 'none';
    h += '<div class="ref">' + cardHTML(x[0], '', 'tabindex="-1" disabled') + '<div class="t"><b>' + esc(c.n) + ' · ' + godName(c.god) + '</b>' + esc(cardWhat(c)) + '<br><span class="small">' + x[1] + ' · cost: ' + cost + '</span></div></div>'; });
  drawer('Every card', h);
}
function showCredits() {
  drawer('Credits', '<div class="rules"><p>Icons by Delapouite, Lorc and Sbed from game-icons.net, CC BY 3.0 (creativecommons.org/licenses/by/3.0).</p><p>Map mosaic, cards and sounds are code art made for this game.</p><p>Fonts: Cinzel and Alegreya Sans, SIL Open Font License.</p></div>');
}

// ---------- boot ----------
function boot() {
  installIcons();
  UI.hints = LS.get('hints') !== '0'; UI.mute = LS.get('mute') === '1'; UI.lvl = LS.get('lvl') || 'normal';
  wireCamera();
  $('#hand').addEventListener('click', onHandTap);
  $('#menub').onclick = showMenu; $('#helpb').onclick = showRules; $('#plb').onclick = showScoreNow; $('#undob').onclick = doUndo;
  $('#mktb').onclick = function () { if (G) openMarket(!!(G.pend && G.pend.h === 'buy' && isHuman(VT.sideToAct(G)))); };
  document.addEventListener('click', function (e) { var st = e.target.closest('[data-pl]'); if (st && G) showPlayer(+st.getAttribute('data-pl')); });
  document.addEventListener('click', function (e) { if (e.target.closest('#pileb') && G) { var pp = G.pl[UI.mode === 'hot' ? Math.max(0, VT.sideToAct(G)) : 0]; drawer('Played cards', '<p class="small">They come back with the Herald.</p><div class="mrow">' + pp.disc.slice().reverse().map(function (id) { return cardHTML(id, '', 'tabindex="-1" disabled'); }).join('') + '</div>'); } });
  document.addEventListener('click', function (e) { if (e.target.closest('#storeb') && G) { var p = G.pl[UI.mode === 'hot' ? Math.max(0, VT.sideToAct(G)) : 0]; banner(VT.used(p) + ' of 12 spaces used'); } });
  var rl = function () { if (UI.view) setView(UI.view); placeFinger(); };
  window.addEventListener('resize', function () { clearTimeout(UI._rz); UI._rz = setTimeout(rl, 120); });
  window.addEventListener('orientationchange', function () { setTimeout(rl, 250); });
  if (GXS.on) return;   // a ?scn= test builds its own state
  showTitle();
}
window.addEventListener('load', boot);
// test hooks
window.VTUI = { hintTarget: function () { return hintTarget(); }, startGame: startGame, render: render, move: move, runAI: runAI, showResult: showResult, UI: UI };
