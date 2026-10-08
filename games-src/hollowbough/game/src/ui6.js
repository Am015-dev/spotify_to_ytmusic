// ===================== part 6: coach, drawers (log, rules, menu, rivals), start screen, events, phone mode, boot =====================
// (the old guided-game advice cards are gone: first-time help is the gx-help kit, see ui11.js)
// ---- drawers
const RULES = `<h3>The goal</h3><p>Build the best woodland city. Each player has a city of up to 15 cards and a few workers. When every player has passed, you add up points from cards, point tokens, bonuses, events and the Long Road. The highest total wins.</p>
<h3>How a turn goes</h3><p>On your turn do exactly <b>one</b> of these:</p><ul><li><b>Place a worker</b> on an open place and use it at once.</li><li><b>Play a card</b> from your hand or from the meadow by paying its price.</li><li><b>Prepare for the next season</b> (only when all your workers are out).</li></ul><p>When you cannot or do not want to do anything useful, <b>Pass</b>. You take no more turns, but your city still scores.</p>
<h3>Places for workers</h3><ul><li><b>Brown places</b> give resources, cards or a point token. Some are shared, others take one worker only.</li><li><b>Forest places</b> (green) are special and take one worker (two players can share in a four-player game).</li><li><b>The Barter Burrow</b> turns spare cards into resources: 1 resource for every 2 cards you discard.</li><li><b>The Long Road</b> opens in Autumn. Discard cards equal to the spot (5, 4, 3 or 2); the worker stays and scores that many points.</li><li><b>Destinations</b> are red cards in your city. A worker on one uses its power. A few are Open, so rivals may visit them too (the owner gets a point token).</li><li><b>Events</b> are claimed with a worker when your city meets their requirement. Each can be claimed only once.</li></ul>
<h3>Playing cards</h3><p>Pay the price in resources: twigs, resin, pebbles and berries. You can play from the eight-card meadow as well as from your hand. Your hand holds 8 cards at most. A <b>unique</b> card can be in your city once; a common card as often as you like.</p><p><b>Playing free:</b> each critter is paired with one building. If you own that building and it has no token, you can play the critter free and put a token on the building. Each building can do this once, ever.</p><p>Some cards (Lantern Rest, Pulley Lift, Thornhold Cells, Gavel Marten, Hostler Hedgehog) change the price. They are offered as extra buttons when you play a card.</p>
<h3>Card colours</h3><ul><li><b>Tan, Traveler:</b> acts once when played.</li><li><b>Green, Production:</b> acts when played and again every Spring and Autumn.</li><li><b>Red, Destination:</b> a place for your workers.</li><li><b>Blue, Governance:</b> a lasting bonus or discount.</li><li><b>Purple, Prosperity:</b> extra points at the end.</li></ul>
<h3>Seasons</h3><p>Everyone starts in Winter with 2 workers. Preparing for <b>Spring</b> gives +1 worker and runs your production. <b>Summer</b> gives +1 worker and lets you take 2 meadow cards. <b>Autumn</b> gives +2 workers and runs production again. Every player moves through the seasons at their own pace.</p>
<h3>Scoring</h3><p>Printed points on your cards, point tokens you hold, purple card bonuses, events and Long Road workers. Ties go to the player with more events, then more leftover resources.</p>
<h3>Solo play</h3><p>You play against Old Grimbeard. He takes places and cards by dice and a fixed routine. You win if you end with strictly more points than he does. Choose Grumpy, Gruff or Ghastly for the difficulty.</p>
<h3>Tips</h3><ul><li>Build production early; it pays every Spring and Autumn.</li><li>Keep cards in hand cheap to play. Watch the meadow too.</li><li>Tap the lightbulb any time to see a good move and the reason for it.</li></ul>`;
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
}
// ---- start screen
function renderStart() {
  const s = $('#start'); s.hidden = false; s.innerHTML = '';
  if (NET.on) { netStartScreen(s); return; }
  const o = UI.opt = UI.opt || Object.assign({}, DEF);
  const seg = (l, key, vals, fmt) => h('div.seg', h('span.lbl', l), vals.map(v => h('button.chipb' + (o[key] === v ? '.on' : ''), { 'data-a': 'opt', 'data-k': key, 'data-v': v, type: 'button' }, fmt ? fmt(v) : v)));
  const card = h('div.scard',
    h('h1', h('span', { html: ICO.tree }), 'Hollowbough'),
    h('p.tag', 'Build a woodland city. Place workers, play cards, outlast the winter.'),
    firstTime() ? tutNode('sbtn big') : null,
    h('button.sbtn.big', { 'data-start': 'guided', 'data-a': 'guided', type: 'button' }, h('b', 'Guided first game'), h('span', 'You and one gentle computer player.')),
    window.CAMPAIGN ? h('button.sbtn.big.story', { 'data-start': 'story', 'data-a': 'story', type: 'button' }, h('b', '\u2728 Story: The Long Winter'), h('span', campLine())) : null,
    h('div.opts', seg('Players', 'np', [2, 3, 4]), seg('Computer level', 'level', ['easy', 'normal', 'hard']), seg('Solo rival', 'solo', [1, 2, 3], v => D.soloLevels[v - 1] + (v > 1 ? '*' : ''))),
    h('p.sm', '*Gruff and Ghastly are very hard.'),
    h('div.sgrid',
      h('button.sbtn', { 'data-start': 'vs', 'data-a': 'start', 'data-m': 'vs', type: 'button' }, h('b', 'Play vs computer'), h('span', 'You against 1 to 3 computer players')),
      h('button.sbtn', { 'data-start': 'solo', 'data-a': 'start', 'data-m': 'solo', type: 'button' }, h('b', 'Solo vs ' + D.soloName), h('span', 'Beat the automated rival')),
      h('button.sbtn', { 'data-start': 'hot', 'data-a': 'start', 'data-m': 'hot', type: 'button' }, h('b', 'Hot-seat'), h('span', '2 to 4 people, one device')),
      h('button.sbtn', { 'data-start': 'ai', 'data-a': 'start', 'data-m': 'ai', type: 'button' }, h('b', 'Watch computers'), h('span', 'Sit back and learn'))),
    netBlock(),
    firstTime() ? null : tutNode('sbtn'),
    h('div.srow2', hasSave() ? h('button.btn', { 'data-a': 'loadsave', type: 'button' }, 'Continue saved game') : null, h('button.btn.alt', { 'data-a': 'rules', type: 'button' }, 'How to play')));
  s.appendChild(card);
}
function showStart() { try { GX.close(); } catch (e) { } closePop(); UI.cards = []; clearTimeout(UI.tm); renderStart(); }
// ---- events
document.addEventListener('click', ev => {
  if (UI.zoomAt && Date.now() - UI.zoomAt < 450) { ev.preventDefault(); return; }
  const z = $('#zoom'); if (z && !z.hidden) { closeZoom(); return; }
  if (UI.lp) { UI.lp = false; return; }
  const t = ev.target.closest('[data-a],[data-start]');
  if (!t) { if (UI.sel && !ev.target.closest('[data-help]')) { UI.sel = null; render(); } return; }   // help (bulb, bubbles, rules cards) must not cancel an open choice
  const a = t.dataset.a, d = t.dataset;
  if (netClick(a, t)) return;
  if (d.start && !a) { newGame(d.start); return; }
  switch (a) {
    case 't': onTarget(d.t, t); break;
    case 'tm': { const m = UI.tm2 && UI.tm2[+d.mi]; if (m) { UI.sel = null; actFrom(m, t); } break; }
    case 'selx': UI.sel = null; render(); break;
    case 'city': if (!UI.animBusy) { UI.sel = null; UI.cityOpen = { logN: G.logN }; snd('click', { vol: .4 }); render(); } break;
    case 'cityx': UI.cityOpen = null; render(); break;
    case 'noop': break;
    case 'chip': UI.rseat = d.seat === 'G' ? 'G' : +d.seat; GX.show('rivald'); renderRival(UI.rseat); break;
    case 'rtab': renderRival(d.seat === 'G' ? 'G' : +d.seat); break;
    case 'cont': nextCard(); break;
    case 'take': takeDevice(); break;
    case 'again': { if (campOn()) { const dd = UI.camp; UI.cards = []; GXC.play(dd.id); break; } const m = UI.mode, c = UI.cfg || {}; UI.cards = []; newGame(m, { np: c.np, level: c.level, solo: c.solo }); break; }
    case 'menu': UI.camp = null; showStart(); break;
    case 'story': storyOpen(); break;
    case 'campfin': campFinish(); break;
    case 'start': if (d.m !== 'ai' && tutOffer(() => newGame(d.m))) break; newGame(d.m); break;
    case 'guided': if (tutOffer(() => newGame('guided'))) break; newGame('guided'); break;
    case 'opt': { UI.opt = UI.opt || Object.assign({}, DEF); UI.opt[d.k] = isNaN(+d.v) ? d.v : +d.v; renderStart(); break; }
    case 'rules': GX.show('rulesd'); break;
    case 'save': save(); toast('Game saved.'); break;
    case 'loadsave': if (!loadSave()) toast('No saved game.'); break;
    case 'speed': AIDELAY = +d.v; break;
    case 'sound': UI.sound = UI.sound === false; try { if (window.GA) { GA.setSfx(UI.sound); GA.setMusic(UI.sound); } } catch (e) { } GX.renderSettings(); break;
  }
});
// long-press on a card or a place: a big view with the details (the only place the details are written)
{ let lpT = 0, lpS = null;
  document.addEventListener('pointerdown', e => {
    const z = e.target.closest('[data-zoom]'); if (!z || (e.button != null && e.button > 0)) return;
    UI.lp = false; lpS = { x: e.clientX, y: e.clientY }; clearTimeout(lpT);
    lpT = setTimeout(() => { UI.lp = true; openZoom(z.dataset.zoom); try { navigator.vibrate && navigator.vibrate(12); } catch (x) { } }, 430);
  });
  document.addEventListener('pointermove', e => { if (lpS && Math.hypot(e.clientX - lpS.x, e.clientY - lpS.y) > 12) clearTimeout(lpT); });
  ['pointerup', 'pointercancel'].forEach(n => document.addEventListener(n, () => { clearTimeout(lpT); lpS = null; }));
  document.addEventListener('contextmenu', e => { if (e.target.closest('[data-zoom]')) e.preventDefault(); });
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') { if (UI.sel) { UI.sel = null; render(); } closeZoom(); } });
// ---- phone mode
function applyPhone() {
  const q = /[?&]phone=(\d)/.exec(location.search); const vm = (window.GXV ? GXV.now() : { w: innerWidth, h: innerHeight }), w = vm.w, hh = vm.h, short = Math.min(w, hh);
  let ph = short <= 500 || (window.matchMedia && matchMedia('(pointer:coarse)').matches && short <= 600);
  if (q) ph = q[1] === '1';
  const r = document.documentElement.classList, was = r.contains('ph');
  r.toggle('ph', ph); r.toggle('ph-p', ph && w < hh); r.toggle('ph-l', ph && w >= hh);
  placePrompt(); if (was !== ph) { if (G && UI.started) render(); }
}
function onResize() { applyPhone(); if (G && UI.started) renderBoard(); }
// ---- boot
function boot() {
  GX.init({ key: 'hb' });
  GX.drawer('rulesd', 'How to play', h('div.rules', { html: RULES }), true);
  GX.drawer('logd', 'Log', h('div#logbody'));
  GX.drawer('rivald', 'Cities and players', h('div#rivalbody'));
  GX.onShow = id => { renderDrawers(); };
  kitBoot();
  applyPhone();
  if (window.GXV) GXV.watch(onResize); else { addEventListener('resize', onResize); addEventListener('orientationchange', onResize); }
  const bd = $('#board'); if (window.ResizeObserver) new ResizeObserver(() => { if (G && UI.started) renderBoard(); }).observe(bd);
  try { if (window.GA) { const A = typeof GA_DATA !== 'undefined' ? GA_DATA : {}; GA.init({ sfx: A.sfx || {}, music: A.music || {}, key: 'hb' }); GX.applyPrefs(); }; } catch (e) { }
  try { if (window.PerfHUD && PerfHUD.register) PerfHUD.register({ game: 'Hollowbough' }); } catch (e) { }
  if (/[?&]seed=(\d+)/.test(location.search)) UI.seed = +RegExp.$1;
  netInit();
  renderStart();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
