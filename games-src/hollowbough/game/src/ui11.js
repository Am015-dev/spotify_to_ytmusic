// ===================== part 11: help (gx-help kit): coach bubbles the first time, the lightbulb on demand =====================
// Bubbles: once per phase, short, pointing at the board. The bulb: the computer helper's own move (HB.AI.choose, the same one the ghost finger uses),
// the element it points at comes from UI.tgEls (the glowing thing), and a short "why" built from the move's real facts. Rules cards for every phase.
// ---------------------------------------------------------------- pictures for the rules cards (the game's own art)
const HPX = 46;
const HP = {
  res: r => HBKit.resource(r, HPX), worker: () => pawn(0, HPX - 6), back: () => backEl(34), point: () => ic('point', HPX), road: () => ic('road', HPX),
  flag: () => ic('flag', HPX), star: () => ic('star', HPX), haven: () => ic('haven', HPX), deck: () => ic('deck', HPX), tree: () => ic('tree', HPX),
  season: i => HBKit.season(SEAS[i], HPX + 4),
  cost: () => costEl({ twig: 2, berry: 1 }, 24),
  card: () => cardEl(firstCardId(), 40)
};
function firstCardId() { try { for (let i = 0; i < HB.NCARDS; i++) if (HB.cardKey(i) === 'architect') return i; } catch (e) { } return 0; }
function hnode(x) { try { const n = typeof x === 'function' ? x() : x; return n && n.outerHTML ? n.outerHTML : String(n || ''); } catch (e) { return ''; } }
function hpics(items) { return '<div class="gxh-pics">' + items.map(it => it === '>' ? '<span class="gxh-ar">&rarr;</span>' : '<figure>' + hnode(it[0]) + (it[1] ? '<figcaption>' + it[1] + '</figcaption>' : '') + '</figure>').join('') + '</div>'; }
// ---------------------------------------------------------------- where each bubble points
const hq = s => () => document.querySelector(s);
const hfirst = (...sels) => () => { for (const s of sels) { const e = document.querySelector(s); if (e && e.getBoundingClientRect().width) return e; } return null; };
const HLP_STEPS = {
  turn: { target: () => { try { const m = UI.rec && UI.rec.m, e = m && hlpEl(m); if (e && e.getBoundingClientRect().width) return e; } catch (x) { } return hfirst('#bd .tile.glow', '#bd .glow:not(.tchip)', '#acts .btn')(); }, title: 'Your turn', text: 'Tap a glowing place or card.', pic: () => hnode(HP.worker) },
  prepare: { target: hfirst('#acts .prep'), title: 'Time to prepare', text: 'Tap Prepare. Workers come home.', pic: () => hnode(() => HP.season(1)) },
  lastCall: { target: hfirst('#acts .pass', '#acts .btn'), title: 'Nothing left to do?', text: 'Play a card, or tap Pass twice.', pic: () => hnode(HP.tree) },
  how: { target: hfirst('#acts .tchip'), title: 'Choose how', text: 'Tap the way you want.', pic: () => hnode(HP.cost) },
  pickCard: { target: hfirst('#bd .glow:not(.tchip)', '#acts .tchip'), title: 'Pick a card', text: 'The power needs a card. Tap one that glows.', pic: () => hnode(HP.card) },
  pickRes: { target: hfirst('#acts .tchip'), title: 'Pick a resource', text: 'Tap the resource you want, in the row below the board.', pic: () => hnode(() => HP.res('berry')) },
  pickPlace: { target: hfirst('#bd .tile.glow', '#bd .glow:not(.tchip)', '#acts .tchip'), title: 'Pick a place', text: 'Tap the glowing place or worker the power should use.', pic: () => hnode(HP.haven) },
  pickOption: { target: hfirst('#acts .tchip', '#bd .glow'), title: 'Make a choice', text: 'The power gives you options. Tap the one you want.', pic: () => hnode(HP.star) }
};
// ---------------------------------------------------------------- the rules cards (<= 20 words each, a picture each)
const HLP_RULES = [
  { title: 'The goal', text: 'Build the best city. When everyone has passed, the highest total wins.', pic: () => hpics([[HP.tree, 'City'], '>', [HP.point, 'Points']]) },
  { title: 'Your turn', text: 'Place a worker, play a card, or Prepare. Then the next player goes.', pic: () => hpics([[HP.worker, 'Worker'], [HP.back, 'Card'], [() => HP.season(1), 'Prepare']]) },
  { phase: 'turn', title: 'Place a worker', text: 'Tap a glowing spot. Your worker goes there and you get its reward.', pic: () => hpics([[HP.worker, 'Worker'], '>', [() => HP.res('twig'), 'Goods']]) },
  { phase: 'turn', title: 'Or play a card', text: 'Tap a glowing card in your hand or the meadow. Then pay its price.', pic: () => hpics([[HP.back, 'Card'], '>', [HP.cost, 'Price']]) },
  { phase: 'turn', title: 'Spots fill up', text: 'Most spots hold one worker, so good ones go fast. Shared spots hold more.', pic: () => hpics([[HP.worker, 'Taken'], [() => HP.res('resin'), 'Shared']]) },
  { phase: 'turn', title: 'Events and the Long Road', text: 'Flags and stars are events. Claim one when your city fits it. The Long Road opens in Autumn.', pic: () => hpics([[HP.flag, 'Event'], [HP.road, 'Long Road']]) },
  { phase: 'prepare', title: 'Prepare', text: 'When all workers are out, tap Prepare. They come home and you gain more.', pic: () => hpics([[HP.worker, 'Home'], '>', [() => HP.season(1), 'Spring']]) },
  { phase: 'prepare', title: 'Production pays', text: 'In Spring and Autumn, each green Production card pays again.', pic: () => hpics([[() => HP.res('twig'), 'Twigs'], [() => HP.res('berry'), 'Berries'], [() => HP.res('resin'), 'Resin']]) },
  { phase: 'prepare', title: 'Your own seasons', text: 'Each player goes through Winter, Spring, Summer and Autumn alone.', pic: () => hpics([[() => HP.season(0)], '>', [() => HP.season(1)], '>', [() => HP.season(2)], '>', [() => HP.season(3)]]) },
  { phase: 'lastCall', title: 'Nothing left? Pass', text: 'With nothing left to do, tap Pass twice. You take no more turns.', pic: () => hpics([[HP.worker, 'All out'], '>', [HP.tree, 'Done']]) },
  { phase: 'lastCall', title: 'Your city still scores', text: 'When all have passed, cards, tokens, events and Long Road workers score.', pic: () => hpics([[HP.back, 'Cards'], [HP.point, 'Tokens'], [HP.flag, 'Events']]) },
  { phase: 'lastCall', title: 'Highest total wins', text: 'The highest total wins. Ties: more events, then more leftover goods.', pic: () => hpics([[HP.point, 'Points'], '>', [HP.star, 'Winner']]) },
  { phase: 'how', title: 'Several ways', text: 'This can be used in more than one way. Tap the option you want.', pic: () => hpics([[HP.back, 'Card'], '>', [HP.cost, 'Pay']]) },
  { phase: 'how', title: 'Pay or play free', text: 'Pay the price. Or play a critter free into its open matching building.', pic: () => hpics([[HP.cost, 'Pay'], [HP.star, 'Or free']]) },
  { phase: 'how', title: 'Cheaper plays', text: 'Some of your cards make a play cheaper. They show as extra buttons.', pic: () => hpics([[HP.back, 'Card'], '>', [() => HP.res('pebble'), 'Fewer']]) },
  { phase: 'how', title: 'The Long Road', text: 'In Autumn, discard 5, 4, 3 or 2 cards. Your worker stays and scores that many points.', pic: () => hpics([[HP.back, 'Discard'], '>', [HP.road, 'Road'], '>', [HP.point, 'Points']]) },
  { phase: 'pickCard', title: 'Pick a card', text: 'Tap a glowing card. It may be in your hand, the meadow or your city.', pic: () => hpics([[HP.back, 'Card'], '>', [HP.star, 'Power']]) },
  { phase: 'pickCard', title: 'Read it first', text: 'Press and hold any card to read it big before you choose.', pic: () => hpics([[HP.back, 'Hold'], '>', [HP.card, 'Read']]) },
  { phase: 'pickRes', title: 'Pick a resource', text: 'Tap a resource icon in the row below the board.', pic: () => hpics([[() => HP.res('twig')], [() => HP.res('resin')], [() => HP.res('pebble')], [() => HP.res('berry')]]) },
  { phase: 'pickRes', title: 'Four resources', text: 'Twigs, resin, pebbles and berries pay for cards. The row under your city shows what you hold.', pic: () => hpics([[HP.cost, 'Prices'], '>', [HP.back, 'Cards']]) },
  { phase: 'pickPlace', title: 'Pick a place', text: 'Tap the glowing place or worker the power should use.', pic: () => hpics([[HP.haven, 'Place'], '>', [HP.worker, 'Worker']]) },
  { phase: 'pickPlace', title: 'Read before you tap', text: 'Press and hold a place to read what it gives.', pic: () => hpics([[HP.haven, 'Hold'], '>', [HP.star, 'Read']]) },
  { phase: 'pickOption', title: 'Make a choice', text: 'Tap the option you want in the row below the board.', pic: () => hpics([[HP.star, 'Power'], '>', [HP.cost, 'Options']]) },
  { phase: 'pickOption', title: 'Read each button', text: 'Each button says what it does. Pick the one that helps most.', pic: () => hpics([[HP.back, 'Option'], [HP.back, 'Option']]) }
];
// ---------------------------------------------------------------- phases
// the moment the player is deciding in (null when there is nothing to decide on the board)
function hlpPhase() {
  try {
    if (!G || !UI.started || G.phase === 'over' || (UI.cfg && UI.cfg.tutorial) || UI.cards.length || UI.pop || UI.cityOpen || UI.animBusy) return null;
    const a = HB.actor(G); if (a < 0 || G.players[a].ai || a !== viewSeat()) return null;
    const mm = myMoves(); if (!mm.length) return null;
    if (UI.sel) return 'how';
    if (G.q) {
      const qm = mm.filter(m => m.type === 'choose');
      if (qm.some(m => { const e = UI.tgEls && UI.tgEls['q:' + m.i]; return e && e.classList.contains('tile'); })) return 'pickPlace';
      if (qm.some(m => m.card !== undefined)) return 'pickCard';
      if (qm.some(m => m.res !== undefined)) return 'pickRes';
      return 'pickOption';
    }
    const p = G.players[a];
    if (mm.some(m => m.type === 'prepare')) return 'prepare';
    if (availW(p) > 0) return 'turn';
    return mm.some(m => m.type === 'pass') ? 'lastCall' : null;
  } catch (e) { return null; }
}
// ---------------------------------------------------------------- the bulb: the helper's move, where it is on the board, and why (<= 15 words)
function capW(t, n) { const w = String(t || '').replace(/\s+/g, ' ').trim().split(' ').filter(Boolean); return w.length <= n ? w.join(' ') : ''; }
function hlpWhy(m, a) {
  const p = G.players[a]; let t = '';
  if (m.type === 'worker') {
    if (m.k === 'basic') { const b = D.basic[m.i]; t = b.name + ': ' + b.text.replace(/\s*Shared\.?$/, ''); }
    else if (m.k === 'forest') { const f = D.forest[G.forest[m.i]]; t = f.name + ': ' + f.text; }
    else if (m.k === 'haven') t = 'Barter Burrow turns 2 spare cards into 1 resource.';
    else if (m.k === 'journey') t = 'The Long Road: discard cards. This worker stays and scores ' + D.journey[m.i].points + ' points.';
    else if (m.k === 'event') { const e = m.e === 'b' ? D.basicEvents[G.bev[m.i].k] : D.specialEvents[G.sev[m.i].k]; t = 'Your city fits this event. Claim it for ' + (e.pts || 'bonus') + ' points.'; }
    else if (m.k === 'dest') t = (m.o === a ? 'Use ' + cname(m.c) + ' in your city.' : 'Visit ' + cname(m.c) + ': you use its power. Its owner gets a point token.');
  } else if (m.type === 'play') {
    const nm = cname(m.card), pts = cdef(m.card).pts;
    if (HB.cardKey(m.card) === 'fool') t = 'Plant ' + nm + ' in a rival city: it costs them 2 points.';
    else if (m.how === 'pay') t = 'Build ' + nm + ': you can afford it' + (pts ? ', and it scores ' + pts + (pts === 1 ? ' point.' : ' points.') : '.');
    else if (m.how === 'occupy') t = 'Play ' + nm + ' free into its matching building.';
    else t = 'Play ' + nm + ' the cheaper way.';
  } else if (m.type === 'prepare') t = 'All workers are out: Prepare for ' + SEASN[Math.min(3, p.season + 1)] + '. They come home.';
  else if (m.type === 'pass') t = 'Nothing worthwhile is left to do. Passing keeps your city for scoring.';
  else if (m.type === 'choose') t = m.label || '';
  t = capW(t, 15);
  if (!t && m.type === 'choose') t = capW('Best choice here: ' + capW(m.label, 8), 15);
  return t || 'The computer helper picks this one.';
}
// the element the move is tapped on right now (the glowing thing), or null
function hlpEl(m) {
  if (!m || !UI.tgEls) return null;
  let tg = tgOf(m);
  if (UI.sel) { const i = UI.sel.ms.findIndex(x => sameM(x, m)); if (i < 0) return null; tg = 'o:' + i; }
  let el = UI.tgEls[tg];
  if (!el && G.q && m.type === 'choose') el = UI.tgEls['q:' + m.i];
  return el && el.isConnected ? el : null;
}
function hlpSuggest() {
  if (!hlpPhase()) return null;
  const a = HB.actor(G);
  try { computeRec(true); } catch (e) { return null; }
  const m = UI.rec && UI.rec.m; if (!m || !hlpEl(m)) return null;
  try { pvReveal(hlpEl(m)); } catch (x) { }   // and scrolled into view   // the target may sit on another phone tab: bring it forward
  const mk = m.type === 'choose' ? 'q' + m.i : tgOf(m);
  // the helper's target may sit on another phone tab (Meadow, City, Goals): bring that panel forward so the finger and glow are visible
  return { why: hlpWhy(m, a), key: mk, m, target: () => hlpEl(m) };
}
// ---------------------------------------------------------------- wiring
// the middle of every button is a spot a bubble must not cover (the kit avoids [data-gxh-avoid]); invisible 2px markers, redrawn with the board
function hlpMarks() {
  document.querySelectorAll('i.gxm').forEach(e => e.remove());
  if (!G || !UI.started) return;
  const W = innerWidth, H = innerHeight, f = document.createDocumentFragment();
  document.querySelectorAll('button').forEach(b => {
    if (b.closest('[data-help],[hidden],#start,#netbox')) return;
    const r = b.getBoundingClientRect(); if (r.width < 4 || r.height < 4) return;
    const x = r.left + r.width / 2, y = r.top + r.height / 2; if (x < 0 || y < 0 || x > W || y > H) return;
    const m = document.createElement('i'); m.className = 'gxm'; m.setAttribute('data-gxh-avoid', ''); m.setAttribute('aria-hidden', 'true');
    m.style.cssText = 'position:fixed;pointer-events:none;width:2px;height:2px;left:' + Math.round(x - 1) + 'px;top:' + Math.round(y - 1) + 'px'; f.appendChild(m);
  });
  document.body.appendChild(f);
}
let _hlpInit = false;
function hlpInit() {
  if (_hlpInit || typeof GXH === 'undefined') return; _hlpInit = true;
  GXH.init({ game: 'hollowbough', defaultOn: true, steps: HLP_STEPS, rules: HLP_RULES, avoid: '.glow,#acts .btn', avoidPad: 6 });
  GXH.bulb({ el: '#bulbbtn', suggest: hlpSuggest, rulesFor: hlpPhase });
}
function hlpAfter() {
  hlpInit(); hlpMarks(); clearTimeout(UI.hmk); UI.hmk = setTimeout(hlpMarks, 200);   // again just before a bubble is placed (things may still be moving) if (typeof GXH === 'undefined') return;
  const st = $('#start'), nb = $('#netbox');
  // first time in each phase: one short coach bubble (the kit keeps it off glowing targets and buttons); tapping the lightbulb asks again
  void st; void nb;
  // FIXED13: coach bubbles only in the guided first game; a normal game is clean (the bulb answers on demand and closes when the moment changes)
  try { const ph = hlpPhase(); if (hlpCoached()) GXH.phase(ph); else { const s = GXH.state(); if (s.cur && (s.cur.kind === 'coach' || (s.cur.phase != null && s.cur.phase !== ph))) GXH.hide(); } } catch (e) { }
}
function hlpCoached() { return UI.mode === 'guided' || !!(UI.cfg && UI.cfg.coached); }
// ---------------------------------------------------------------- the idle nudge (FIXED13): a normal game shows no helper; after 8 s without a tap
// on your turn, the helper's pick gets one soft gold outline (no finger, no bubble). Tips off in the Menu turns it off too.
const HLP_IDLE_MS = 8000;
function hlpIdleClear() { clearTimeout(UI.idleT); document.querySelectorAll('.nudge').forEach(e => e.classList.remove('nudge')); }
function hlpIdleArm() {
  hlpIdleClear();
  if (!G || !UI.started || G.phase === 'over' || hlpCoached() || guideOn() || (UI.cfg && UI.cfg.tutorial)) return;
  UI.idleT = setTimeout(hlpNudge, HLP_IDLE_MS);
}
function hlpNudge() {
  try {
    if (!hlpPhase()) { UI.idleT = setTimeout(hlpNudge, 1500); return; }   // cards flying or a card open: wait, then try again
    if (typeof GXH !== 'undefined') { const s = GXH.state(); if (!s.on || s.cur || s.rules) return; }
    computeRec(true); const m = UI.rec && UI.rec.m; let el = hlpEl(m); if (!el || (m.type === 'pass')) return;
    try { pvReveal(el); } catch (e) { }   // open the right tab and scroll the target into view first, then outline it there (the tab dot hides meanwhile)
    el.classList.add('nudge');
  } catch (e) { }
}
document.addEventListener('pointerdown', () => { if (typeof hlpIdleArm === 'function' && UI.started) hlpIdleArm(); }, true);
// the guided game: when a coach bubble closes (a tap), the finger comes back (it hides while a bubble shows: one helper at a time)
document.addEventListener('pointerup', () => { if (!UI.started || !hlpCoached()) return; clearTimeout(UI.fbk); UI.fbk = setTimeout(() => { try { const f = document.getElementById('finger'); if (f && f.hidden && !GXH.state().cur) placeFinger(); } catch (e) { } }, 400); }, true);
// one helper at a time (FIXED13): the moment a coach bubble or the bulb's answer appears, the ghost finger steps aside (it comes back on the next tap)
try { new MutationObserver(ms => { for (const m of ms) for (const n of m.addedNodes) if (n.nodeType === 1 && n.classList && n.classList.contains('gxh-bub')) { const f = document.getElementById('finger'); if (f) f.hidden = true; hlpIdleClear(); return; } }).observe(document.body, { childList: true }); } catch (e) { }

// calm play: the bulb's ring pulses 3 times (CSS) and its finger taps twice, then both hold still / go away (the shared kit loops them forever)
try {
  new MutationObserver(ms => {
    if (!document.documentElement.classList.contains('calm')) return;
    for (const m of ms) for (const n of m.addedNodes) {
      if (!n.classList || !n.classList.contains('gxh-finger') || !n.getAnimations) continue;
      for (const a of n.getAnimations()) { try { a.effect.updateTiming({ iterations: 2 }); a.onfinish = () => { n.style.display = 'none'; }; } catch (e) { } }
    }
  }).observe(document.body, { childList: true });
} catch (e) { }
