// ===================== part 6: coach, drawers (log, rules, menu, rivals), start screen, events, phone mode, boot =====================
const COACH = [
  { id: 'welcome', light: 1, t: 'Welcome to Hollowbough', x: 'You lead a small band of woodland creatures. Over the game you build a city of up to 15 cards and send workers out to gather. When everyone has finished, the city with the most points wins.' },
  { id: 'turn', light: 1, t: 'One thing per turn', x: 'On your turn you do exactly one thing: place a worker on a location, play a card, or Prepare for the next season. You start with 2 workers.' },
  { id: 'board', t: 'The shared board', x: 'The glowing places are open to you. Tap one to see what it gives, then place a worker. Most places hold only one worker, so the good ones can be taken before your next turn.', when: (p, v) => myMoves().some(m => m.type === 'worker') },
  { id: 'cards', t: 'Cards', x: 'Tap a card in your hand, or one of the eight in the meadow on the board, to see its price. Pay with resources, or play a critter free when you already own its matching building (it is named on the card).', when: (p) => p.dep.length > 0 && p.hand.length > 0 },
  { id: 'occupy', t: 'A free card', x: 'One of your critters can be played for free: it moves into its matching building and uses up that building’s one free slot. Look for the button that says "Play it free".', when: (p, v) => myMoves().some(m => m.type === 'play' && m.how === 'occupy') },
  { id: 'prepare', light: 1, t: 'Out of workers? Prepare', x: 'When all your workers are out, Prepare for the next season: they come home, you gain new workers, and green Production cards gather goods. Each player moves through the seasons on their own.', when: (p, v) => myMoves().some(m => m.type === 'prepare') },
  { id: 'season', t: 'Production time', x: 'In Spring and Autumn all your green Production cards pay out. That is why building them early pays off.', when: (p) => p.season >= 1 },
  { id: 'autumn', t: 'Autumn: the last season', x: 'After Autumn there are no more seasons. Use the rest of your workers and cards, and try for events or the Long Road. Pass when nothing useful remains.', when: (p) => p.season >= 3 },
  { id: 'event', t: 'Events', x: 'The small flags and stars are events. Meet the requirement with the cards in your city and a worker claims it for bonus points. Each event can only be claimed once.', when: (p, v) => myMoves().some(m => m.type === 'worker' && m.k === 'event') },
  { id: 'pass', light: 1, t: 'Passing', x: 'When you have nothing worthwhile left, press Pass. Your city is scored when everybody has passed. Your Hint button always shows a good move and why.', when: (p) => p.season >= 3 && availW(p) === 0 }
];
function coachCheck() {
  const lv = UI.coach.level; if (lv === 'off') return false;
  const v = viewSeat(); if (v < 0 || HB.actor(G) !== v) return false;
  const p = G.players[v]; if (G.q) { if (!UI.coach.seen.decision && lv === 'full') { UI.coach.seen.decision = 1; pushCard({ kind: 'coach', title: 'A choice for you', sub: 'Guide', body: h('p', 'Some cards and places ask you to choose. A decision appears here one at a time. The star marks what the computer helper would pick.') }); return true; } return false; }
  for (const c of COACH) {
    if (UI.coach.seen[c.id]) continue; if (lv === 'light' && !c.light) continue;
    if (c.when && !c.when(p, v)) continue;
    UI.coach.seen[c.id] = 1;
    pushCard({ kind: 'coach', title: c.t, sub: 'Guide', body: h('p', c.x), buttons: [{ label: 'Got it', a: 'cont' }] });
    return true;
  }
  return false;
}
// ---- drawers
const RULES = `<h3>The goal</h3><p>Build the best woodland city. Each player has a city of up to 15 cards and a few workers. When every player has passed, you add up points from cards, point tokens, bonuses, events and the Long Road. The highest total wins.</p>
<h3>How a turn goes</h3><p>On your turn do exactly <b>one</b> of these:</p><ul><li><b>Place a worker</b> on an open place and use it at once.</li><li><b>Play a card</b> from your hand or from the meadow by paying its price.</li><li><b>Prepare for the next season</b> (only when all your workers are out).</li></ul><p>When you cannot or do not want to do anything useful, <b>Pass</b>. You take no more turns, but your city still scores.</p>
<h3>Places for workers</h3><ul><li><b>Brown places</b> give resources, cards or a point token. Some are shared, others take one worker only.</li><li><b>Forest places</b> (green) are special and take one worker (two players can share in a four-player game).</li><li><b>The Barter Burrow</b> turns spare cards into resources: 1 resource for every 2 cards you discard.</li><li><b>The Long Road</b> opens in Autumn. Discard cards equal to the spot (5, 4, 3 or 2); the worker stays and scores that many points.</li><li><b>Destinations</b> are red cards in your city. A worker on one uses its power. A few are Open, so rivals may visit them too (the owner gets a point token).</li><li><b>Events</b> are claimed with a worker when your city meets their requirement. Each can be claimed only once.</li></ul>
<h3>Playing cards</h3><p>Pay the price in resources: twigs, resin, pebbles and berries. You can play from the eight-card meadow as well as from your hand. Your hand holds 8 cards at most. A <b>unique</b> card can be in your city once; a common card as often as you like.</p><p><b>Playing free:</b> each critter is paired with one building. If you own that building and it has no token, you can play the critter free and put a token on the building. Each building can do this once, ever.</p><p>Some cards (Inn, Crane, Dungeon, Judge, Hostler) change the price. They are offered as extra buttons when you play a card.</p>
<h3>Card colours</h3><ul><li><b>Tan, Traveler:</b> acts once when played.</li><li><b>Green, Production:</b> acts when played and again every Spring and Autumn.</li><li><b>Red, Destination:</b> a place for your workers.</li><li><b>Blue, Governance:</b> a lasting bonus or discount.</li><li><b>Purple, Prosperity:</b> extra points at the end.</li></ul>
<h3>Seasons</h3><p>Everyone starts in Winter with 2 workers. Preparing for <b>Spring</b> gives +1 worker and runs your production. <b>Summer</b> gives +1 worker and lets you take 2 meadow cards. <b>Autumn</b> gives +2 workers and runs production again. Every player moves through the seasons at their own pace.</p>
<h3>Scoring</h3><p>Printed points on your cards, point tokens you hold, purple card bonuses, events and Long Road workers. Ties go to the player with more events, then more leftover resources.</p>
<h3>Solo play</h3><p>You play against Old Grimbeard. He takes places and cards by dice and a fixed routine. You win if you end with strictly more points than he does. Choose Grumpy, Gruff or Ghastly for the difficulty.</p>
<h3>Tips</h3><ul><li>Build production early; it pays every Spring and Autumn.</li><li>Keep cards in hand cheap to play. Watch the meadow too.</li><li>Press Hint any time to see a good move and the reason for it.</li></ul>`;
function logHTML() { const e = h('div.logl'); for (let i = G.log.length - 1; i >= Math.max(0, G.log.length - 150); i--) e.appendChild(h('div.ll', h('span.lt', G.log[i].turn), ' ' + G.log[i].t)); return e; }
function renderRival(seat) {
  const b = $('#rivalbody'); if (!b || !G) return; b.innerHTML = ''; seat = seat == null ? (UI.rseat != null ? UI.rseat : 0) : seat; UI.rseat = seat;
  const tabs = h('div.rtabs'); for (let s = 0; s < G.np; s++) tabs.appendChild(h('button.btn' + (s === seat ? '.on' : '.alt'), { 'data-a': 'rtab', 'data-seat': s, type: 'button' }, pawn(s, 14), ' ' + G.players[s].name));
  if (G.grim) tabs.appendChild(h('button.btn' + (seat === 'G' ? '.on' : '.alt'), { 'data-a': 'rtab', 'data-seat': 'G', type: 'button' }, D.soloName));
  b.appendChild(tabs);
  if (seat === 'G') {
    const g = HB.grimScore(G); b.appendChild(h('div.kv', h('span', 'Points so far'), h('b', g.total)));
    b.appendChild(h('p.sm', D.soloName + ' plays a card from the meadow chosen by a die every turn. His city:'));
    G.grim.city.forEach(id => b.appendChild(rowCard(id)));
    return;
  }
  const p = G.players[seat], sc = score(seat);
  b.appendChild(h('div.rhead', pawn(seat, 28), h('div', h('b', p.name), h('div.sm', (p.ai ? 'Computer (' + p.ai + ')' : 'Player') + ' · ' + SEASN[p.season] + (p.passed ? ' · passed' : '')))));
  b.appendChild(h('div.kv', h('span', 'Points so far'), h('b', sc.total)));
  b.appendChild(h('div.kv', h('span', 'Workers'), h('b', availW(p) + ' free of ' + p.workers)));
  b.appendChild(h('div.kv', h('span', 'Cards in hand'), h('b', p.hand.length)));
  const rr = h('div.rrow'); RESK.forEach(k => rr.appendChild(h('span.rs', ic(k, 20), h('b', p.res[k])))); rr.appendChild(h('span.rs', ic('point', 20), h('b', p.pts))); b.appendChild(rr);
  const evs = []; G.bev.forEach(e => { if (e.o === seat) evs.push(D.basicEvents[e.k].name); }); G.sev.forEach(e => { if (e.o === seat) evs.push(D.specialEvents[e.k].name); });
  b.appendChild(h('div.kv', h('span', 'Events'), h('b.l', evs.join(', ') || 'none')));
  b.appendChild(h('h4', 'City (' + HB.cityCount(G, seat) + '/15)'));
  p.city.forEach(e => b.appendChild(rowCard(e.id, e)));
  if (!p.city.length) b.appendChild(h('p.sm', 'Empty so far.'));
}
function rowCard(id, e) {
  const c = cdef(id); const bits = []; if (e) { if (e.occ) bits.push('occupied'); if (e.tok) bits.push(e.tok + ' tokens'); if (e.w) bits.push(e.w + ' workers'); if (e.pris && e.pris.length) bits.push(e.pris.length + ' prisoners'); }
  return h('div.rc', cardEl(id, 54, { entry: e }), h('div', h('b', c.name), h('div.sm', TYPEN[c.type] + ' · ' + c.pts + ' pt' + (bits.length ? ' · ' + bits.join(', ') : '')), h('div.sm', c.text)));
}
function renderDrawers() {
  if (!GX.open || !G) return;
  if (GX.open === 'logd') { const b = $('#logbody'); b.innerHTML = ''; b.appendChild(logHTML()); }
  if (GX.open === 'rivald') renderRival();
  if (GX.open === 'setd') renderMenu();
}
function renderMenu() {
  const b = $('#setbody'); b.innerHTML = '';
  const row = (l, ...k) => b.appendChild(h('div.mrow', h('div.lbl', l), h('div.mbt', k)));
  row('Game', h('button.btn', { 'data-a': 'menu', type: 'button' }, 'New game'), h('button.btn.alt', { 'data-a': 'save', type: 'button' }, 'Save'), h('button.btn.alt' + (hasSave() ? '' : '.dis'), { 'data-a': 'loadsave', type: 'button', disabled: hasSave() ? null : true }, 'Load'));
  row('Computer speed', ...[['Fast', 150], ['Normal', 650], ['Slow', 1300]].map(([n, v]) => h('button.btn' + (AIDELAY === v ? '' : '.alt'), { 'data-a': 'speed', 'data-v': v, type: 'button' }, n)));
  row('Guide', ...['full', 'light', 'off'].map(n => h('button.btn' + (UI.coach.level === n ? '' : '.alt'), { 'data-a': 'guide', 'data-v': n, type: 'button' }, n[0].toUpperCase() + n.slice(1))));
  row('Sound', h('button.btn' + (UI.sound === false ? '.alt' : ''), { 'data-a': 'sound', type: 'button' }, UI.sound === false ? 'Off' : 'On'));
  row('Info', h('button.btn.alt', { 'data-a': 'rules', type: 'button' }, 'Rules'), h('button.btn.alt', { 'data-a': 'speedhud', type: 'button' }, 'Speed tool'));
  b.appendChild(h('p.sm', 'Hollowbough is an original game inspired by the family of woodland city-building worker-placement games. All names, art and text are our own. Art is drawn procedurally; no outside assets.'));
}
// ---- start screen
function renderStart() {
  const s = $('#start'); s.hidden = false; s.innerHTML = '';
  const o = UI.opt = UI.opt || Object.assign({}, DEF);
  const seg = (l, key, vals, fmt) => h('div.seg', h('span.lbl', l), vals.map(v => h('button.chipb' + (o[key] === v ? '.on' : ''), { 'data-a': 'opt', 'data-k': key, 'data-v': v, type: 'button' }, fmt ? fmt(v) : v)));
  const card = h('div.scard',
    h('h1', h('span', { html: ICO.tree }), 'Hollowbough'),
    h('p.tag', 'Build a woodland city. Place workers, play cards, outlast the winter.'),
    h('button.sbtn.big', { 'data-start': 'guided', 'data-a': 'guided', type: 'button' }, h('b', 'Guided first game'), h('span', 'You and one gentle computer player; tips appear one at a time.')),
    h('div.opts', seg('Players', 'np', [2, 3, 4]), seg('Computer level', 'level', ['easy', 'normal', 'hard']), seg('Solo rival', 'solo', [1, 2, 3], v => D.soloLevels[v - 1] + (v > 1 ? '*' : ''))),
    h('p.sm', '*Gruff and Ghastly are very hard.'),
    h('div.sgrid',
      h('button.sbtn', { 'data-start': 'vs', 'data-a': 'start', 'data-m': 'vs', type: 'button' }, h('b', 'Play vs computer'), h('span', 'You against 1 to 3 computer players')),
      h('button.sbtn', { 'data-start': 'solo', 'data-a': 'start', 'data-m': 'solo', type: 'button' }, h('b', 'Solo vs ' + D.soloName), h('span', 'Beat the automated rival')),
      h('button.sbtn', { 'data-start': 'hot', 'data-a': 'start', 'data-m': 'hot', type: 'button' }, h('b', 'Hot-seat'), h('span', '2 to 4 people, one device')),
      h('button.sbtn', { 'data-start': 'ai', 'data-a': 'start', 'data-m': 'ai', type: 'button' }, h('b', 'Watch computers'), h('span', 'Sit back and learn'))),
    h('div.srow2', hasSave() ? h('button.btn', { 'data-a': 'loadsave', type: 'button' }, 'Continue saved game') : null, h('button.btn.alt', { 'data-a': 'rules', type: 'button' }, 'How to play')));
  s.appendChild(card);
}
function showStart() { try { GX.close(); } catch (e) { } closePop(); UI.cards = []; clearTimeout(UI.tm); renderStart(); }
// ---- events
document.addEventListener('click', ev => {
  const t = ev.target.closest('[data-a],[data-start]'); const pop = $('#ppop');
  if (!t) { if (UI.pop && pop && !pop.contains(ev.target) && !ev.target.closest('#pc,.gx-drawer')) closePop(); return; }
  const a = t.dataset.a, d = t.dataset;
  if (d.start && !a) { newGame(d.start); return; }
  switch (a) {
    case 'tile': openTile(d.k, d.i); break;
    case 'mcard': { const id = G.meadow[+d.i]; if (id >= 0) openCard('meadow', id, null, +d.i); break; }
    case 'hcard': openCard('hand', +d.id); break;
    case 'ccard': openCard('city', +d.id, +d.seat === +d.seat ? +d.seat : d.seat); break;
    case 'chip': UI.rseat = d.seat === 'G' ? 'G' : +d.seat; GX.show('rivald'); renderRival(UI.rseat); break;
    case 'rtab': renderRival(d.seat === 'G' ? 'G' : +d.seat); break;
    case 'prep': openPrep(); break;
    case 'pass': openPass(); break;
    case 'hint': openHint(); break;
    case 'popx': closePop(); break;
    case 'do': { const m = UI.pm && UI.pm[+d.mi]; if (m) act(m); break; }
    case 'q': choose(+d.i); break;
    case 'cont': nextCard(); break;
    case 'take': takeDevice(); break;
    case 'again': { const m = UI.mode, c = UI.cfg || {}; UI.cards = []; newGame(m, { np: c.np, level: c.level, solo: c.solo }); break; }
    case 'menu': showStart(); break;
    case 'start': newGame(d.m); break;
    case 'guided': newGame('guided'); break;
    case 'opt': { UI.opt = UI.opt || Object.assign({}, DEF); UI.opt[d.k] = isNaN(+d.v) ? d.v : +d.v; renderStart(); break; }
    case 'rules': GX.show('rulesd'); break;
    case 'save': save(); toast('Game saved.'); break;
    case 'loadsave': if (!loadSave()) toast('No saved game.'); break;
    case 'speed': AIDELAY = +d.v; renderMenu(); break;
    case 'guide': UI.coach.level = d.v; renderMenu(); break;
    case 'sound': UI.sound = UI.sound === false; try { if (window.GA) { GA.setSfx(UI.sound); GA.setMusic(UI.sound); } } catch (e) { } renderMenu(); break;
    case 'speedhud': try { PerfHUD.toggle ? PerfHUD.toggle() : PerfHUD.show && PerfHUD.show(); } catch (e) { } break;
  }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape' && UI.pop) closePop(); });
// ---- phone mode
function applyPhone() {
  const q = /[?&]phone=(\d)/.exec(location.search); const w = innerWidth, hh = innerHeight, short = Math.min(w, hh);
  let ph = short <= 500 || (window.matchMedia && matchMedia('(pointer:coarse)').matches && short <= 600);
  if (q) ph = q[1] === '1';
  const r = document.documentElement.classList, was = r.contains('ph');
  r.toggle('ph', ph); r.toggle('ph-p', ph && w < hh); r.toggle('ph-l', ph && w >= hh);
  placePrompt(); if (was !== ph) { if (G && UI.started) render(); }
}
let rzT = 0;
function onResize() { clearTimeout(rzT); rzT = setTimeout(() => { applyPhone(); if (G && UI.started) { renderBoard(); placePop(); } }, 60); }
// ---- boot
function boot() {
  GX.init({ key: 'hb' });
  GX.drawer('rulesd', 'How to play', h('div.rules', { html: RULES }), true);
  GX.drawer('logd', 'Log', h('div#logbody'));
  GX.drawer('rivald', 'Cities and players', h('div#rivalbody'));
  GX.drawer('setd', 'Menu', h('div#setbody'));
  GX.onShow = id => { renderDrawers(); };
  applyPhone();
  addEventListener('resize', onResize); addEventListener('orientationchange', onResize);
  const bd = $('#board'); if (window.ResizeObserver) new ResizeObserver(() => { if (G && UI.started) { renderBoard(); placePop(); } }).observe(bd);
  try { if (window.GA) { const A = typeof GA_DATA !== 'undefined' ? GA_DATA : {}; GA.init({ sfx: A.sfx || {}, music: A.music || {}, key: 'hb' }); }; } catch (e) { }
  try { if (window.PerfHUD && PerfHUD.register) PerfHUD.register({ game: 'Hollowbough' }); } catch (e) { }
  if (/[?&]seed=(\d+)/.test(location.search)) UI.seed = +RegExp.$1;
  renderStart();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
