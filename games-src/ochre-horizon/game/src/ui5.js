// ===== part 5: start screen, menu, rules, coach (learn to play), suggestion, end screen, boot =====
function menuHTML() {
  var rows = [['new', 'New game', 'Same level, fresh planet'], ['learn', 'Learn to play', 'Screen tour, then a guided first game'], ['practice', 'Practice puzzles', 'Three short charters: story + strategy'], ['rules', 'How to play', 'All the rules, short'], ['ref', 'All cards', '208 projects, 12 companies, map'], ['log', 'What happened', 'Every move so far'], ['sound', 'Sound: ' + (UI.sound ? 'on' : 'off'), 'Tap to switch'], ['home', 'Title screen', 'Change level or draft'], ['credits', 'Credits', 'Fonts and licences']];
  return rows.map(function (r) { return '<div class="row"><div class="rt"><b>' + r[1] + '</b><span>' + r[2] + '</span></div><button data-menu="' + r[0] + '">Open</button></div>'; }).join('');
}
function menuDo(k) {
  if (k === 'new') { closeSheet(); startGame({ level: UI.level, draft: UI.draft }); }
  else if (k === 'learn') { closeSheet(); learnStart(); }
  else if (k === 'practice') { closeSheet(); chStart(0); }
  else if (k === 'rules' || k === 'ref' || k === 'log') { UI.tab = k === 'ref' ? 'r-auto' : null; openSheet(k, UI.tab); }
  else if (k === 'sound') { UI.sound = !UI.sound; LS.set('oh_sound', UI.sound ? '1' : '0'); UI.refreshSheet(); }
  else if (k === 'home') { closeSheet(); showStart(); }
  else if (k === 'credits') modal('<h3>Credits</h3><p>Game design of this version, cards, map, art and code: the Game Night Shelf.</p><p>Fonts: Righteous (Astigmatic) and Space Grotesk (Florian Karsten), SIL Open Font License 1.1, via Google Fonts.</p><p>All pictures are drawn in code. Sounds are synthesised.</p>');
}
$('bmenu').innerHTML = A.icon('menu', 24); $('bmenu').addEventListener('click', function () { openSheet('menu'); });
$('shX').innerHTML = A.icon('x', 18);
$('zin').innerHTML = A.icon('plus', 20); $('zout').innerHTML = A.icon('minus', 20); $('zfit').innerHTML = A.icon('fit', 20);
$('hintbtn').innerHTML = A.icon('bulb', 22);
function rulesHTML() {
  return '<div class="rules">' +
    '<h4>Goal</h4><p>Make Ochre livable with your rival. Temperature to 8°C, oxygen to 14%, all 9 oceans. When all three are done, that round is the last: income is paid, both may turn plants into greenery once more, then points are counted. Most points wins; a tie goes to the most credits.</p>' +
    '<h4>Points</h4><p>Your rating (starts at 20, +1 for every step you raise), milestones and awards, 1 per greenery, 1 per greenery next to your cities, and points on cards.</p>' +
    '<h4>A round (generation)</h4><p>1. New cards: see 4, buy any for 3 credits each (round 1: pick a company and keep from 10).</p><p>2. Actions: take turns doing 1 or 2 actions, until both pass. Who goes first swaps every round.</p><p>3. Income: energy turns into heat. Gain credits = credit production + rating, and every other production.</p>' +
    '<h4>Actions</h4><p>Play a card (pay its cost; steel pays 2 for building cards, titanium 3 for space cards; meet its needs). Use a standard project. Plant greenery for 8 plants. Warm the air for 8 heat. Claim a milestone. Fund an award. Use a card action once per round. Pass.</p>' +
    '<h4>Standard projects</h4><p>Sell cards 1 each · Power plant 11 · Comet strike 14 · Aquifer 18 · Greenery 23 · City 25.</p>' +
    '<h4>Bonus steps</h4><p>Temperature −24°C and −20°C: +1 heat production. 0°C: place an ocean. Oxygen 8%: +1 temperature. A full gauge cannot go higher and pays no rating, but cards that would raise it can still be played.</p>' +
    '<h4>Tiles</h4><p>Oceans only on ocean spaces. Greenery next to your own tile if you can; it raises oxygen. Cities never next to another city. Spaces pay their bonus icons, and each ocean next to the new tile pays 2 credits.</p>' +
    '<h4>Milestones and awards</h4><p>Milestones: 8 credits, 5 points, only 3 claimed in a game. Awards: fund for 8, 14, then 20; only 3. At the end the leader gets 5 points (2 players: no second place; a tie pays both).</p>' +
    '<h4>Card kinds</h4><p>Orange Projects act once. Teal Lasting cards stay with an effect or an action. Pink Events act once and their tags only count when played. A card that cuts production takes it from the rival; if the rival has too little, it takes yours, and if neither has enough it cannot be played.</p></div>';
}
// ---------- start screen ----------
function showStart() {
  var has = !!LS.get('oh_save');
  var lv = UI.level || 'normal';
  $('start').style.display = 'flex'; document.body.classList.add('st');
  $('start').innerHTML = '<svg class="bg" viewBox="0 0 400 700" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' + A.DEFS + A.backdrop(400, 700) + '<circle cx="200" cy="560" r="230" fill="url(#planet)"/><circle cx="200" cy="560" r="230" fill="url(#ht)" opacity=".7"/><path d="M60 420l40-30 30 20 50-40 40 30" fill="none" stroke="#1c120d" stroke-width="0"/></svg>' +
    '<div class="tt"><h1>OCHRE<br>HORIZON</h1><div class="sub">Terraform a red world. Outscore your rival.</div></div>' +
    '<div class="bt">' + (has ? '<button class="btn" id="stCont">Continue game</button>' : '') +
    '<button class="btn' + (has ? ' cr' : '') + '" id="stNew">New game</button><button class="btn alt" id="stLearn">Learn to play<small>Screen tour, then a guided first game</small></button>' +
    '<div class="lv">' + ['easy', 'normal', 'hard'].map(function (l) { return '<button data-lv="' + l + '" class="' + (l === lv ? 'on' : '') + '">' + l[0].toUpperCase() + l.slice(1) + '</button>'; }).join('') + '<button data-draft="1" class="' + (UI.draft ? 'on' : '') + '">Draft ' + (UI.draft ? 'on' : 'off') + '</button></div></div>';
  if ($('stCont')) $('stCont').addEventListener('click', function () { loadGame(); });
  $('stNew').addEventListener('click', function () { startGame({ level: UI.level, draft: UI.draft }); });
  $('stLearn').addEventListener('click', function () { learnStart(); });
  $('start').querySelectorAll('[data-lv]').forEach(function (b) { b.addEventListener('click', function () { UI.level = b.getAttribute('data-lv'); LS.set('oh_level', UI.level); showStart(); }); });
  $('start').querySelector('[data-draft]').addEventListener('click', function () { UI.draft = !UI.draft; showStart(); });
}
function hideStart() { $('start').style.display = 'none'; document.body.classList.remove('st'); }
function startGame(o) {
  o = o || {}; if (window.chStop && UI.charter) chStop();
  UI.level = o.level || UI.level; UI.tut = !!o.tut; UI.draft = !!o.draft; UI.setup = null; UI.research = null; UI.coachDone = {};
  OH.newGame({ seed: o.seed || (o.tut ? 20261120 : (Date.now() % 1e9)), draft: UI.draft, beginner: true });
  UI.evSeen = 0; UI.logSeen = 0;
  hideStart(); closeModal(); closeSheet(); if (UI.pc) openSheet('cards'); fitView(); render(); save(); pump();
}
function loadGame() {
  try { var d = JSON.parse(LS.get('oh_save')); OH.G = d.G; UI.level = d.level || 'normal'; UI.tut = !!d.tut; UI.coachDone = d.coach || {}; UI.evSeen = OH.G.ev.length; UI.logSeen = OH.G.log.length; hideStart(); if (UI.pc) openSheet('cards'); fitView(); pump(); }
  catch (e) { LS.del('oh_save'); showStart(); }
}
// ---------- coach (learn to play: one bubble at a time, 12 words or fewer) ----------
var COACH = {
  corp: 'Pick a company. Open Charter is best for a first game.',
  keep: 'Keep cards you can use soon. Each costs 3.',
  goal: 'Warm it, give it air, fill the oceans. Each step: +1 rating.',
  cards: 'Tap Cards. Play one: pay its cost, get its effect.',
  turn2: 'Done = end this turn, play again after the rival. Pass = out till next round.',
  rating: 'Rating counts as points. Cards, tiles and goals add more.',
  prod: 'Production pays you every round. Income cards early pay most.',
  place: 'Tap a glowing space, see what you get, tap Place here.',
  proj: 'Projects never run out. Comet strike warms the planet.',
  pass: 'Out of money? Pass. Income comes when both pass.',
  research: 'Marked cards are our pick. Tap to change. 3 credits each.',
  research2: 'Income = credit production + your rating. Grow both.',
  bonus: 'White marks on gauges pay a bonus: heat production, an ocean, warmth.',
  vp: 'VP on a card means points at the end. Not rating.',
  plants: 'Glowing plants? Tap them: 8 plants make a greenery.',
  goals: 'Projects tab holds milestones and awards: 5 points each.',
  out: 'Rival is out. Keep taking turns until you pass too.',
  end: 'When all three gauges are full, that round is the last.'
};
function coachShow(k) {
  if (!UI.tut || UI.coachDone[k] || UI.scn || (window.guideEnabled && guideEnabled())) return;
  if (HCUR && HCUR.coach || HQ.some(function (x) { return x.coach; })) return;   // one helper at a time
  if (k === 'turn') {
    var P = G.pl[0], playN = P.hand.filter(function (id) { return OH.playable(0, id); }).length;
    var hasVP = P.hand.concat(P.played).some(function (id) { return OH.CARDS[id] && OH.CARDS[id].vp; });
    var when = { cards: true, turn2: G.acts === 1, rating: P.tr > 20, prod: UI.coachDone.turn2 && G.acts === 0, out: G.pl[1].passed, bonus: G.temp >= -26 || G.oxy >= 6, vp: hasVP && UI.coachDone.rating, plants: P.plant >= OH.greenCost(0), proj: UI.coachDone.cards && G.acts === 0 && UI.coachDone.turn2, pass: !playN && P.mc < 14, goals: G.gen >= 3, end: G.gen >= 4 };
    var order = ['cards', 'turn2', 'rating', 'out', 'plants', 'prod', 'bonus', 'vp', 'proj', 'pass', 'goals', 'end'];
    for (var i = 0; i < order.length; i++) if (!UI.coachDone[order[i]] && when[order[i]]) { k = order[i]; break; }
    if (k === 'turn') return;
  }
  HQ.push({ coach: true, k: k, key: 'coach' }); helperNext();
}
function coachHide() {
  $('coach').classList.remove('on');
  if (HCUR && HCUR.coach) { clearTimeout(HCUR.tm); HCUR = null; helperNext(); }
}
$('coachB').addEventListener('click', function () { coachHide(); });
function coachCheck(m) {
  if (!UI.tut) return;
  if (m.t === 'play' || m.t === 'place' || m.t === 'setup' || m.t === 'buy' || m.t === 'pass') { HQ = HQ.filter(function (x) { return !x.coach; }); if (HCUR && HCUR.coach) coachHide(); }
}
// ---------- suggestion (lightbulb): the computer's own pick for you, with a one-line why ----------
function suggestWords(m) {
  var g = function () { var w = preview(m); return w.length ? w.slice(0, 3).join(', ') : ''; };
  if (m.t === 'play') { var c = OH.card(m.id), w = g(); return ['Play ' + c.name, m.why === 'income' ? 'Income card: it pays you every round.' : (w ? 'Gives: ' + w + '.' : 'Best value in your hand.')]; }
  if (m.t === 'std') return ['Projects: ' + OH.STD_NAME[m.k], { power: 'More energy every round.', asteroid: 'Warms the planet: +1 rating.', aquifer: 'An ocean: +1 rating and a bonus.', greenery: 'Greenery: +1 point and more air.', city: 'A city: +1 credit production.' }[m.k] || ''];
  if (m.t === 'place') return ['Build on the highlighted space', 'It has the best bonus.'];
  if (m.t === 'green') return ['Tap your plants: plant a greenery', '+1 point and more air.'];
  if (m.t === 'heat') return ['Tap your heat: warm the air', '+1 rating for 8 heat.'];
  if (m.t === 'act') { var a = OH.card(m.id).action[m.i || 0]; return ['Actions: use ' + OH.card(m.id).name, opsWords(a.do) + '.']; }
  if (m.t === 'mile') return ['Projects, Milestones: claim ' + M.MILESTONES.filter(function (x) { return x.k === m.k; })[0].name, '5 points for 8 credits.'];
  if (m.t === 'award') return ['Projects, Awards: fund ' + M.AWARDS.filter(function (x) { return x.k === m.k; })[0].name, 'You lead it: 5 points at the end.'];
  if (m.t === 'sell') return ['Sell ' + plural(m.ids.length, 'card') + ' you cannot play yet', 'Their needs are far off. 1 credit each.'];
  if (m.t === 'end') return ['End your turn', 'Save your credits for later.'];
  if (m.t === 'pass') return ['Pass for this round', 'Next income: +' + (G.pl[0].prod.mc + G.pl[0].tr) + ' credits.'];
  return ['Choose an option', ''];
}
$('hintbtn').addEventListener('click', function () {
  if (!G || OH.sideToAct() !== 0 || G.phase !== 'action' && !G.pending) { toast('Suggestions work on your turn.', true, 2000, { now: true }); return; }
  var m = OHAI.suggest(0); if (!m) return;
  var t = suggestWords(m);
  if (m.t === 'place') { UI.sel = m.s; focusSpace(m.s); renderBoard(); }
  UI.tryTxt = 'Try: ' + esc(t[0]) + (t[1] ? '<small>' + esc(t[1]) + '</small>' : ''); UI.tryUntil = Date.now() + 5000; setHint(hintNow()); clearTimeout(UI.tryTm); UI.tryTm = setTimeout(function () { UI.tryTxt = null; if (G) setHint(hintNow()); }, 5100);
});
// ---------- end screen ----------
function showEnd() {
  if (UI.endShown === G.seed + ':' + G.gen) return; UI.endShown = G.seed + ':' + G.gen;
  var s0 = G.final[0], s1 = G.final[1], win = G.winner === 0; LS.set('oh_done', '1');
  sfx(win ? 'win' : 'bad'); LS.del('oh_save');
  var row = function (n, k) { return '<tr><td>' + n + '</td><td>' + s0[k] + '</td><td>' + s1[k] + '</td></tr>'; };
  modal('<h3>' + (win ? 'You win!' : 'Rival wins') + '</h3><p>' + (win ? 'Ochre remembers your name.' : 'So close. The red world waits.') + ' Generation ' + G.gen + '.</p><table class="sc2"><tr><td></td><td>You</td><td>Rival</td></tr>' + row('Rating', 'tr') + row('Milestones', 'mile') + row('Awards', 'award') + row('Greeneries', 'green') + row('Cities', 'city') + row('Cards', 'cards') + '<tr class="tot"><td>Total</td><td>' + s0.total + '</td><td>' + s1.total + '</td></tr></table><button class="btn" id="mAgain">Play again</button><button class="btn alt" id="mHome">Title screen</button>', false);
  $('mAgain').addEventListener('click', function () { closeModal(); startGame({ level: UI.level, draft: UI.draft }); });
  $('mHome').addEventListener('click', function () { closeModal(); showStart(); });
}
// ---------- PC (wide screen, mouse): map in the middle, cards docked left, rival panel right ----------
function setPC() {
  var pc = window.matchMedia && matchMedia('(min-width: 1100px) and (min-height: 620px)').matches;
  if (pc === UI.pc) return;
  UI.pc = pc; document.body.classList.toggle('pc', pc);
  if (pc) { $('scrim').classList.remove('on'); $('app').inert = false; if (G && G.pl) openSheet(UI.sheet || 'cards', UI.tab); renderRival(); }
  else if (UI.sheet) { UI.sheet = null; $('sheet').classList.remove('on'); }
  setTimeout(applyView, 30);
}
// ---------- boot ----------
(function boot() {
  UI.sound = LS.get('oh_sound') !== '0'; UI.level = LS.get('oh_level') || 'normal';
  buildBoard();
  setPC(); window.addEventListener('resize', setPC);
  if (window.GXV && GXV.watch) GXV.watch(function () { applyView(); }); else window.addEventListener('resize', applyView);
  if (window.ResizeObserver) new ResizeObserver(function () { applyView(); }).observe($('bw'));
  UI.ready = true;
  if (window.GXS && GXS.on) return;   // a test scenario builds its own state
  if (Q.get('play')) { startGame({ level: Q.get('level') || 'normal', seed: +Q.get('seed') || undefined }); return; }
  showStart();
})();
