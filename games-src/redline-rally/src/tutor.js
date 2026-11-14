/* Redline Rally tutorial (W496): ONE guided first race on the Practice Loop (30 spaces, 1 lap, you + Kit Marlow + Juno Vega, real engine).
   Every core rule is taught in turn order, one short sentence and one highlighted tap per step (TUT_STEPS). Hands, deck tops, rival cards and
   positions are stacked each round (TUT_CH) so every rule really happens on the board. Then the end card starts a real race. No "learn later" list. */
var TUT_GAME = 'redline-rally';
function tutOn() { return typeof GXT !== 'undefined' && GXT.active() && UI.mode === 'tutorial'; }
function firstTime() { return !lsGet('rr_seen') && !(typeof GXT !== 'undefined' && GXT.isDone(TUT_GAME)); }
function tutBtn(cls, o) { return typeof GXT === 'undefined' ? '' : GXT.menuHTML(Object.assign({ game: TUT_GAME, first: firstTime(), cls: cls, launch: function () { tutStart(); } }, o || {})); }
/* stack a car's cards: `want` = the hand (in order), `top` = next cards drawn or flipped (first one first). Conserves every card (pool = deck + hand + discard). */
function stackCards(c, want, top) {
  var pool = c.deck.concat(c.hand, c.disc), take = function (w) { var k = pool.indexOf(w); if (k >= 0) pool.splice(k, 1); return k >= 0; };
  var hand = want.filter(take), tp = (top || []).filter(take);
  shuffle(G, pool); c.deck = pool.concat(tp.slice().reverse()); c.hand = hand; c.disc = [];
  while (c.hand.length < HAND && c.deck.length) c.hand.push(c.deck.shift());
}
/* each round: your space, gear, engine heat, hand, deck top; the rivals' spaces and the two cards they play (always gear 2). Positions follow on from the
   previous round exactly, so nothing jumps (corners: space 10 limit 5, space 15 limit 4; finish at 30). */
var TUT_CH = [
  { pos: 0, gear: 1, eng: 6, hand: ['1', '3', '2', '4', '1', '2', '3'], kit: [3, ['2', '2']], juno: [2, ['2', '1']] },   /* you start last: adrenaline */
  { pos: 6, gear: 2, eng: 6, hand: ['1', '4', '2', '4', '1', '2', '3'], kit: [7, ['3', '2']], juno: [5, ['2', '1']] },   /* 4+4 = 8 in a limit-5 corner: burn 3 */
  { pos: 14, gear: 2, eng: 3, hand: ['1', '4', '2', '4', '2', '1', '3'], kit: [12, ['2', '2']], juno: [9, ['1', '1']] },   /* 4+4 into the limit-4 corner with 3 heat: spin out */
  { pos: 14, gear: 1, eng: 0, hand: ['H', 'H', 'H', 'H', 'H', 'H', 'X'], kit: [16, ['2', '3']], juno: [12, ['2', '1']] },   /* the spin's Stress card is the one playable card; gear 2 needs two: stall */
  { pos: 14, gear: 1, eng: 0, hand: ['H', 'X', 'H', 'H', 'H', 'H', '2'], top: ['2'], kit: [21, ['1', '1']], juno: [16, ['2', '1']] },   /* gear 1 + stress: cool down, adrenaline */
  { pos: 17, gear: 1, eng: 4, hand: ['2', '4', '1', '3', '1', '4', '3'], kit: [23, ['1', '1']], juno: [19, ['2', '1']] },   /* gear 1 -> 3 for 1 heat, beside Juno: slipstream, then discard */
  { pos: 24, gear: 3, eng: 3, hand: ['1', '4', '3', '1', '2', '3', '4'], top: ['3'], kit: [25, ['1', '1']], juno: [22, ['2', '1']] }   /* 4+2+1, boost after the reveal: finish */
];
function tutStageRound(r) {
  var ch = TUT_CH[r - 1]; if (!ch || !G || G.cars[0].fin) return;
  var c = G.cars[0];
  c.deck = c.deck.concat(c.hand, c.disc).filter(function (x) { return x !== 'H'; }).concat(Array(ENGINE0 - ch.eng).fill('H'));
  c.hand = []; c.disc = []; c.plan = null; c.eng = ch.eng; c.gear = ch.gear; c.pos = ch.pos; stackCards(c, ch.hand, ch.top);
  UI.gear = c.gear; UI.sel = []; UI.touchedGear = 0; UI.boost = false; UI.swap = false;
  [[G.cars[1], ch.kit], [G.cars[2], ch.juno]].forEach(function (q) {
    var x = q[0]; x.pos = q[1][0]; x.gear = 2; x.plan = null; x.eng = ENGINE0 - x.deck.concat(x.hand, x.disc).filter(function (h) { return h === 'H'; }).length;
    stackCards(x, q[1][1].concat(['3', '4', '3', '4', '1']));
    var e2 = submitPlan(G, x.i, { gear: 2, idx: [0, 1], boost: false }); if (e2) console.warn('tut rival plan', e2);
  });
  G.cars.forEach(function (x, i) { UI.vis[i].p = x.pos; x.tie = i; });
  UI.focus = 0; snapCam(); UI.redraw();
}
function stageTutorial() { tutStageRound(1); }

/* no free-play coach any more: the guided steps teach everything. Kept as no-ops for the hooks in ui.js. */
var COACH = { on: false, seen: {} };
function coachSay() { } function coachPlan() { } function coachEvent() { }
function coachFinish() { UI.tutOver = true; }
function tutLeave(skipped) {
  UI.mode = ''; UI.lockModal = false; UI.tutOver = false; lsSet('rr_seen', '1');
  try { if (GXT.running && GXT.running()) GXT.skip(); } catch (e) { }
  try { GXT.markDone(TUT_GAME); } catch (e) { }
  closeModal(); if (skipped) showTitle();
}
/* targets */
function tutCardV(v) {   /* the first not-yet-picked card of value v in your hand */
  var c = G && G.cars[UI.seat]; if (!c) return null;
  for (var j = 0; j < c.hand.length; j++) if (c.hand[j] === v && UI.sel.indexOf(j) < 0) return document.querySelector('#hand .cd[data-i="' + j + '"]');
  return null;
}
function tutPlan(r) { return function () { return !!G && G.phase === 'plan' && G.round === r && !UI.busy && !G.pend && !!$('#goB'); }; }
function tutIsCard(v) { return function (a) { var c = G.cars[UI.seat]; return a.what === 'card' && c.hand[a.i] === v; }; }
/* one rule per step, in turn order. rule = the rule id the tutorial test checks; every step is one short sentence and one tap */
var TUT_RULES = ['goal', 'gear', 'speed', 'reveal', 'order', 'adrenaline', 'space', 'corner', 'engine', 'burn', 'spin', 'heatcards', 'stall', 'cooldown', 'stress', 'shift2', 'slip', 'discard', 'boost', 'finish'];
function tutSteps() {
  var cv = function () { return $('#cvw'); }, eng = function () { return $('#tray .eng') || $('#tray'); };
  var card = function (id, r, v, say, rule) { return { id: id, rule: rule, say: say, target: function () { return tutCardV(v); }, ready: tutPlan(r), wait: { type: 'tap', match: tutIsCard(v) }, wrong: 'Tap the glowing card.', side: 'top' }; };
  var gear = function (id, r, g, say, rule) { return { id: id, rule: rule, say: say, target: function () { return document.querySelector('.gb[data-g="' + g + '"]'); }, ready: tutPlan(r), wait: { type: 'tap', match: function (a) { return a.what === 'gear' && a.g === g; } }, wrong: 'Tap gear ' + g + '.', side: 'top' }; };
  var go = function (id, r, say, rule) { return { id: id, rule: rule, say: say, target: function () { var b = $('#goB'); return b && !b.disabled ? b : null; }, ready: tutPlan(r), wait: { type: 'tap', match: function (a) { return a.what === 'go'; } }, side: 'top' }; };
  var info = function (id, r, say, rule, tg) { return { id: id, rule: rule, say: say, target: tg || cv, ready: tutPlan(r), wait: null, side: 'bottom' }; };
  var pend = function (t) { return function () { return !!G && !!G.pend && G.pend.t === t; }; };
  return [
    info('goal', 1, 'Race one lap; the first car over the line wins.', 'goal'),
    gear('gear', 1, 2, 'Your gear is how many cards you play, so tap gear 2.', 'gear'),
    card('c13', 1, '3', 'Tap the 3, since card numbers add up to your speed.', 'speed'),
    card('c12', 1, '2', 'Tap the 2 for speed 5, which drives 5 spaces.'),
    go('go1', 1, 'Tap Go: everyone plays at once, then cars move.', 'reveal'),
    info('order', 2, 'Cars moved one by one, the leader first.', 'order'),
    info('adr', 2, 'Moving last gave you adrenaline: +1 speed and +1 cooldown.', 'adrenaline'),
    info('space', 2, 'Two cars fit per space, so a full space stops you behind.', 'space'),
    info('corner', 2, 'The corner sign ahead is its speed limit: 5.', 'corner'),
    info('engine', 2, 'Your engine holds 6 heat, and speeding through corners burns it.', 'engine', eng),
    info('bb', 2, 'Your deck also holds Brake (speed 0) and Burst (speed 5).', null),
    card('c24', 2, '4', 'Tap a 4.'),
    card('c24b', 2, '4', 'Tap the other 4 for speed 8, three over the limit.'),
    go('go2', 2, 'Tap Go: each point over the limit burns 1 heat.', 'burn'),
    card('c34', 3, '4', 'Tap a 4.'),
    card('c34b', 3, '4', 'Tap the other 4: speed 8 into a limit-4 corner.'),
    go('go3', 3, 'Tap Go: with too little heat to pay, you spin out.', 'spin'),
    info('spun', 4, 'Spun out: stopped before the corner, gear 1, plus a Stress card.', null),
    { id: 'heatcard', rule: 'heatcards', say: 'Spent heat comes back as dead Heat cards you cannot play.', target: function () { return tutCardV('H'); }, ready: tutPlan(4), wait: null, side: 'top' },
    gear('g42', 4, 2, 'Tap gear 2, though you hold just one playable card.', 'stall'),
    card('c43', 4, 'X', 'Tap the Stress card, your only card that is not heat.'),
    go('go4', 4, 'Tap Go: too few cards means a stall, no move.'),
    gear('gear1', 5, 1, 'Stay in gear 1: it cools up to 3 heat cards.', 'cooldown'),
    card('c5x', 5, 'X', 'Tap the Stress card: it flips a random speed card.', 'stress'),
    go('go5', 5, 'Tap Go and watch your heat cards cool down.'),
    info('cooled', 6, 'Cooled: heat went back into your engine.', null, eng),
    gear('gear3', 6, 3, 'Shifting two gears costs 1 heat, so tap gear 3.', 'shift2'),
    card('c62', 6, '2', 'Tap the 2.'),
    card('c61', 6, '1', 'Tap a 1.'),
    card('c61b', 6, '1', 'Tap the other 1: speed 4, plus 1 for adrenaline.'),
    go('go6', 6, 'Tap Go to pull up right beside Juno.'),
    { id: 'slip', rule: 'slip', say: 'Next to a car, slipstream gives 2 free spaces: tap it.', target: function () { return $('#slipY'); }, ready: pend('slip'), wait: { type: 'tap', match: function (a) { return a.what === 'slip'; } }, side: 'top' },
    { id: 'disc', rule: 'discard', say: 'Discard any card but Heat or Stress after moving: tap a 3.', target: function () { var c = G.cars[UI.seat]; for (var j = 0; j < c.hand.length; j++) if (c.hand[j] === '3') return document.querySelector('#panel .cd[data-i="' + j + '"]'); return null; }, ready: pend('disc'), wait: { type: 'tap', match: function (a) { return a.what === 'dcard' && G.cars[UI.seat].hand[a.i] === '3'; } }, side: 'top' },
    { id: 'discgo', say: 'Tap Discard 1 to draw to 7; Keep all skips this step.', target: function () { var b = $('#discY'); return b && !b.disabled ? b : null; }, ready: pend('disc'), wait: { type: 'tap', match: function (a) { return a.what === 'discgo'; } }, side: 'top' },
    card('c74', 7, '4', 'Tap the 4.'),
    card('c72', 7, '2', 'Tap the 2.'),
    card('c71', 7, '1', 'Tap the 1 for speed 7.'),
    go('go7', 7, 'Tap Go: your cards show first, then you may boost.'),
    { id: 'boost', rule: 'boost', say: 'After the reveal, boost once: pay 1 heat, flip, add the card.', target: function () { return $('#boostY'); }, ready: pend('boost'), wait: { type: 'tap', match: function (a) { return a.what === 'boost'; } }, side: 'top' },
    { id: 'finish', rule: 'finish', say: 'You won, and the others race on until all finish.', target: cv, ready: function () { return !!UI.tutOver; }, wait: null, side: 'bottom' }
  ];
}
function tutStart(o) {
  closeModal(); UI.cmpDef = null; UI.tutOver = false; o = o || {};
  GXT.start({
    game: TUT_GAME, setup: function () { UI.mode = 'tutorial'; startGame({ track: 'practice', laps: 1, opp: 2, hum: 1, diff: 'easy', seed: 12, tut: true }); },
    steps: tutSteps(), story: true, endTitle: 'You know every rule', endText: 'Now a real race against four rivals. Tap Suggest any time you are unsure.',
    onDone: function (r) { tutLeave(false); if (r && r.choice === 'story' && typeof GXC !== 'undefined') GXC.open(); else if (o.then) o.then(); else startGame(); },
    onExit: function () { tutLeave(true); }
  });
}
function chapterMenu() { tutStart(); }
/* help drawer: rules cards through the shared help kit (lightbulb in the top bar: suggested move, "How does this work?" opens the cards) */
function helpBoot() {
  if (typeof GXH === 'undefined') return;
  var R = [
    { title: 'How a turn works', text: 'Pick a gear (cards to play). Tap that many cards: they add up to your speed. Press Go. Mind the corner limits. Then each rival drives in turn.' },
    { title: 'Gear and cards', text: 'Your gear is how many cards you play. Shift one gear free, or two gears for 1 heat. The cards add up to your speed.' },
    { title: 'Corners', text: 'Each corner has a speed limit. Every point you go over costs 1 heat from your engine. No heat left means a spin-out.' },
    { title: 'Heat', text: 'Heat you pay goes to your discard pile and comes back as dead cards in your hand. Gears 1 and 2 send heat back to the engine.' },
    { title: 'Slipstream and boost', text: 'End next to or right behind a car to glide 2 more spaces. Boost: pay 1 heat to flip an extra speed card.' },
    { title: 'Upgrades', text: 'With Upgrades on you draft 3 cards before the race. They are played like speed cards and add a bonus.' }
  ];
  GXH.init({ game: 'redline-rally', defaultOn: false, steps: {}, rules: R });
  GXH.bulb({ el: '#bulbbtn', rulesFor: function () { return null; }, suggest: function () {
    if (!G || G.phase !== 'plan' || !$('#sugB')) return null; return { target: function () { return $('#sugB'); }, why: 'Tap Suggest and the computer picks a gear and cards for you. Then tap Go.' };
  } });
}
