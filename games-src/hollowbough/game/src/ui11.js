// ===================== part 11: help (gx-help kit): coach bubbles the first time, the lightbulb on demand =====================
// Bubbles: once per phase, short, pointing at the board. The bulb: the computer helper's own move (HB.AI.choose, the same one the ghost finger uses),
// the element it points at comes from UI.tgEls (the glowing thing), and a short "why" built from the move's real facts. Rules cards for every phase.
// ---------------------------------------------------------------- pictures for the rules cards (the game's own art)
const HPX = 46;
const HP = {
  res: r => ic(r, HPX), worker: () => pawn(0, HPX - 6), back: () => backEl(34), point: () => ic('point', HPX), road: () => ic('road', HPX),
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
  turn: { target: () => { try { const m = UI.rec && UI.rec.m, e = m && hlpEl(m); if (e && e.getBoundingClientRect().width) return e; } catch (x) { } return hfirst('#bd .tile.glow', '#bd .glow:not(.tchip)', '#acts .btn')(); }, title: 'Your turn', text: 'Tap a glowing spot to send a worker there. Or tap a glowing card to play it.', pic: () => hnode(HP.worker) },
  prepare: { target: hfirst('#acts .prep'), title: 'Prepare for next season', text: 'All your workers are out. Tap Prepare: they come home and you gain more workers.', pic: () => hnode(() => HP.season(1)) },
  lastCall: { target: hfirst('#acts .pass', '#acts .btn'), title: 'Nothing left to do?', text: 'Play a card if you can. Otherwise tap Pass twice: your city still scores.', pic: () => hnode(HP.tree) },
  how: { target: hfirst('#acts .tchip'), title: 'Choose how', text: 'This can be done in several ways. Tap the option you want.', pic: () => hnode(HP.cost) },
  pickCard: { target: hfirst('#bd .glow:not(.tchip)', '#acts .tchip'), title: 'Pick a card', text: 'The power needs a card. Tap one that glows.', pic: () => hnode(HP.card) },
  pickRes: { target: hfirst('#acts .tchip'), title: 'Pick a resource', text: 'Tap the resource you want, in the row below the board.', pic: () => hnode(() => HP.res('berry')) },
  pickPlace: { target: hfirst('#bd .tile.glow', '#bd .glow:not(.tchip)', '#acts .tchip'), title: 'Pick a place', text: 'Tap the glowing place or worker the power should use.', pic: () => hnode(HP.haven) },
  pickOption: { target: hfirst('#acts .tchip', '#bd .glow'), title: 'Make a choice', text: 'The power gives you options. Tap the one you want.', pic: () => hnode(HP.star) }
};
// ---------------------------------------------------------------- the rules cards (<= 20 words each, a picture each)
const HLP_RULES = [
  { title: 'The goal', text: 'Build the best woodland city. When everyone has passed, the highest total of points wins.', pic: () => hpics([[HP.tree, 'City'], '>', [HP.point, 'Points']]) },
  { title: 'Your turn', text: 'Place a worker, play a card, or Prepare for the next season. Then the next player goes.', pic: () => hpics([[HP.worker, 'Worker'], [HP.back, 'Card'], [() => HP.season(1), 'Prepare']]) },
  { phase: 'turn', title: 'Place a worker', text: 'Tap a glowing spot. Your worker goes there and its effect happens at once.', pic: () => hpics([[HP.worker, 'Worker'], '>', [() => HP.res('twig'), 'Goods']]) },
  { phase: 'turn', title: 'Or play a card', text: 'Tap a glowing card in your hand or the meadow, then pay its price in resources.', pic: () => hpics([[HP.back, 'Card'], '>', [HP.cost, 'Price']]) },
  { phase: 'turn', title: 'Spots fill up', text: 'Most spots hold only one worker, so good ones go fast. Spots marked Shared hold more.', pic: () => hpics([[HP.worker, 'Taken'], [() => HP.res('resin'), 'Shared']]) },
  { phase: 'turn', title: 'Events and the Long Road', text: 'Flags and stars are events: claim one when your city meets its need. The Long Road opens in Autumn.', pic: () => hpics([[HP.flag, 'Event'], [HP.road, 'Long Road']]) },
  { phase: 'prepare', title: 'Prepare', text: 'When all your workers are out, tap Prepare. They come home and you gain more workers.', pic: () => hpics([[HP.worker, 'Home'], '>', [() => HP.season(1), 'Spring']]) },
  { phase: 'prepare', title: 'Production pays', text: 'In Spring and Autumn every green Production card in your city gathers goods again.', pic: () => hpics([[() => HP.res('twig'), 'Twigs'], [() => HP.res('berry'), 'Berries'], [() => HP.res('resin'), 'Resin']]) },
  { phase: 'prepare', title: 'Your own seasons', text: 'Each player moves through Winter, Spring, Summer and Autumn at their own pace.', pic: () => hpics([[() => HP.season(0)], '>', [() => HP.season(1)], '>', [() => HP.season(2)], '>', [() => HP.season(3)]]) },
  { phase: 'lastCall', title: 'Nothing left? Pass', text: 'When you have no workers or plays left, tap Pass twice. You take no more turns.', pic: () => hpics([[HP.worker, 'All out'], '>', [HP.tree, 'Done']]) },
  { phase: 'lastCall', title: 'Your city still scores', text: 'When everyone has passed, your cards, point tokens, events and Long Road workers are scored.', pic: () => hpics([[HP.back, 'Cards'], [HP.point, 'Tokens'], [HP.flag, 'Events']]) },
  { phase: 'lastCall', title: 'Highest total wins', text: 'The highest total wins. A tie goes to the player with more events claimed.', pic: () => hpics([[HP.point, 'Points'], '>', [HP.star, 'Winner']]) },
  { phase: 'how', title: 'Several ways', text: 'This card or spot can be used in more than one way. Tap the option you want.', pic: () => hpics([[HP.back, 'Card'], '>', [HP.cost, 'Pay']]) },
  { phase: 'how', title: 'Pay or play free', text: 'Pay the price, or play a critter free into its matching building when that building is open.', pic: () => hpics([[HP.cost, 'Pay'], [HP.star, 'Or free']]) },
  { phase: 'how', title: 'Cheaper plays', text: 'Some cards you own make a play cheaper. They show up as extra buttons.', pic: () => hpics([[HP.back, 'Card'], '>', [() => HP.res('pebble'), 'Fewer']]) },
  { phase: 'how', title: 'The Long Road', text: 'In Autumn, discard 5, 4, 3 or 2 cards. Your worker stays and scores that many points.', pic: () => hpics([[HP.back, 'Discard'], '>', [HP.road, 'Road'], '>', [HP.point, 'Points']]) },
  { phase: 'pickCard', title: 'Pick a card', text: 'The power needs a card. Tap one that glows: it may be in your hand, the meadow or your city.', pic: () => hpics([[HP.back, 'Card'], '>', [HP.star, 'Power']]) },
  { phase: 'pickCard', title: 'Read it first', text: 'Press and hold any card to read it big before you choose.', pic: () => hpics([[HP.back, 'Hold'], '>', [HP.card, 'Read']]) },
  { phase: 'pickRes', title: 'Pick a resource', text: 'A power asks for a resource. Tap one of the icons in the row below the board.', pic: () => hpics([[() => HP.res('twig')], [() => HP.res('resin')], [() => HP.res('pebble')], [() => HP.res('berry')]]) },
  { phase: 'pickRes', title: 'Four resources', text: 'Twigs, resin, pebbles and berries pay for cards. The row under your city shows your stock.', pic: () => hpics([[HP.cost, 'Prices'], '>', [HP.back, 'Cards']]) },
  { phase: 'pickPlace', title: 'Pick a place', text: 'Tap the glowing place or worker the power should use.', pic: () => hpics([[HP.haven, 'Place'], '>', [HP.worker, 'Worker']]) },
  { phase: 'pickPlace', title: 'Read before you tap', text: 'Press and hold a place to read what it gives.', pic: () => hpics([[HP.haven, 'Hold'], '>', [HP.star, 'Read']]) },
  { phase: 'pickOption', title: 'Make a choice', text: 'The power gives you options. Tap the one you want in the row below the board.', pic: () => hpics([[HP.star, 'Power'], '>', [HP.cost, 'Options']]) },
  { phase: 'pickOption', title: 'Read each button', text: 'Each button says what it does. Pick the one that helps your city most.', pic: () => hpics([[HP.back, 'Option'], [HP.back, 'Option']]) }
];
// ---------------------------------------------------------------- phases
// the moment the player is deciding in (null when there is nothing to decide on the board)
function hlpPhase() {
  try {
    if (!G || !UI.started || G.phase === 'over' || UI.cards.length || UI.pop || UI.cityOpen || UI.animBusy) return null;
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
    else if (m.k === 'haven') t = 'Barter Burrow turns spare cards into resources: 1 for every 2.';
    else if (m.k === 'journey') t = 'The Long Road: discard cards, and this worker stays and scores ' + D.journey[m.i].points + ' points.';
    else if (m.k === 'event') { const e = m.e === 'b' ? D.basicEvents[G.bev[m.i].k] : D.specialEvents[G.sev[m.i].k]; t = 'Your city meets this event: claim it for ' + (e.pts || 'bonus') + ' points.'; }
    else if (m.k === 'dest') t = (m.o === a ? 'Use ' + cname(m.c) + ' in your city.' : 'Visit ' + cname(m.c) + ': you use its power, its owner gets a point token.');
  } else if (m.type === 'play') {
    const nm = cname(m.card), pts = cdef(m.card).pts;
    if (m.how === 'pay') t = 'Build ' + nm + ': you can afford it' + (pts ? ', and it scores ' + pts + (pts === 1 ? ' point.' : ' points.') : '.');
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
  const mk = m.type === 'choose' ? 'q' + m.i : tgOf(m);
  return { why: hlpWhy(m, a), key: mk, m, target: () => { const e = hlpEl(m); return hlpEl(m); } };
}
// ---------------------------------------------------------------- wiring
let _hlpInit = false;
function hlpInit() {
  if (_hlpInit || typeof GXH === 'undefined') return; _hlpInit = true;
  GXH.init({ game: 'hollowbough', defaultOn: true, steps: HLP_STEPS, rules: HLP_RULES, avoid: '.glow,#acts .btn' });
  GXH.bulb({ el: '#bulbbtn', suggest: hlpSuggest, rulesFor: hlpPhase });
}
function hlpAfter() {
  hlpInit(); if (typeof GXH === 'undefined') return;
  const st = $('#start'), nb = $('#netbox');
  GXH.phase(!G || !UI.started || (st && !st.hidden) || (nb && !nb.hidden) ? null : hlpPhase());
}
