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
/* each round (F4: 5 rounds, about 16 taps, no forced spin-out): your space, gear, engine heat, hand, deck top, the gear the step asks for and
   the cards it auto-picks for that gear (pickG / pick); the rivals' spaces and the two cards they play (always gear 2). Positions follow on
   from the previous round exactly, so nothing jumps (corners: space 10 limit 5, space 15 limit 4; finish at 30). */
var TUT_CH = [
  { pos: 0, gear: 1, eng: 6, hand: ['1', '3', '2', '4', '1', '2', '3'], pickG: 2, pick: ['3', '2'], kit: [3, ['2', '2']], juno: [2, ['2', '1']] },   /* 3+2, +1 adrenaline (you move last) */
  { pos: 6, gear: 2, eng: 6, hand: ['1', '4', '2', '4', '1', '2', '3'], pickG: 2, pick: ['4', '4'], kit: [7, ['3', '2']], juno: [5, ['2', '1']] },   /* 8 in a limit-5 corner: burn 3, said why */
  { pos: 14, gear: 2, eng: 3, hand: ['H', 'H', 'H', '4', '2', '1', '3'], pickG: 1, pick: ['3'], kit: [12, ['4', '2']], juno: [9, ['1', '1']] },   /* 3 heat left before a limit 4: gear 1, clean, cools 3 */
  { pos: 17, gear: 1, eng: 6, hand: ['2', '4', '1', '3', '1', 'X', '3'], top: ['1'], pickG: 3, pick: ['2', '1', 'X'], kit: [18, ['2', '2']], juno: [12, ['2', '1']] },   /* 1 -> 3 for 1 heat, Stress draws a 1, behind Kit: slipstream; then discard */
  { pos: 23, gear: 3, eng: 5, hand: ['1', '4', '3', '1', '2', '3', '4'], top: ['3'], pickG: 3, pick: ['4', '2', '1'], kit: [22, ['1', '1']], juno: [16, ['2', '1']] }   /* 4+2+1 and a boost: finish */
];
function tutPick(c, g) {   /* the cards the step wants for the gear it asks for (ui.js autoPick) */
  var ch = TUT_CH[G.round - 1]; if (!ch || ch.pickG !== g) return null; var used = [], out = [];
  ch.pick.forEach(function (v) { for (var j = 0; j < c.hand.length; j++) if (c.hand[j] === v && used.indexOf(j) < 0) { used.push(j); out.push(j); return; } });
  return out.length === needCards(c, g) ? out : null;
}
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
function tutPlan(r) { return function () { return !!G && G.phase === 'plan' && G.round === r && !UI.busy && !G.pend && !!$('#goB'); }; }
function tutSpot() {   /* a small box over the next corner sign on the board, so the bubble points at it and sits beside it */
  var w = $('#cvw'), s = $('#tutSpot'); if (!w || !G) return null; if (!s) { s = document.createElement('div'); s.id = 'tutSpot'; w.appendChild(s); }
  var me = G.cars[UI.seat], nc = nextCorner(me.pos), tk = T(G), cam = UI.cam; if (!nc) return null;
  var a = tk.at(((me.pos + nc.d) % tk.N) * tk.seg), q = { x: a.x + Math.sin(a.a) * 98, y: a.y - Math.cos(a.a) * 98 }, dO = dashH(UI.W, UI.H) / 2;
  var x = Math.max(24, Math.min(UI.W - 24, (q.x - cam.x) * cam.s + UI.W / 2)), y = Math.max(24, Math.min(UI.H - 24, (q.y - cam.y) * cam.s + UI.H / 2 - dO));
  s.style.cssText = 'position:absolute;pointer-events:none;width:48px;height:48px;left:' + (x - 24) + 'px;top:' + (y - 24) + 'px'; return s;
}
function tutRects(sels) { return function () { return sels.map(function (q) { var e = $(q); return e && e.offsetParent !== null ? e.getBoundingClientRect() : null; }).filter(Boolean); }; }
/* one rule per step, in turn order. rule = the rule id the tutorial test checks; every step is one short sentence and one tap */
var TUT_RULES = ['goal', 'gear', 'speed', 'corner', 'burn', 'spin', 'cooldown', 'shift2', 'stress', 'slip', 'discard', 'boost', 'finish'];
function tutSteps() {
  /* F4: the bubble never covers what the player needs now: the line, gears, hand and Go (avoid) */
  var need = tutRects(['#msg', '#gears', '#acts', '#hand']), needQ = tutRects(['#msg', '#panel .slipq', '#panel #hand']);
  var gear = function (id, r, g, say, rule) { return { id: id, rule: rule, say: say, target: function () { return document.querySelector('.gb[data-g="' + g + '"]'); }, ready: tutPlan(r), wait: { type: 'tap', match: function (a) { return a.what === 'gear' && a.g === g; } }, wrong: 'Tap gear ' + g + '.', side: 'top', avoid: need }; };
  var go = function (id, r, say, rule) { return { id: id, rule: rule, say: say, target: function () { var b = $('#goB'); return b && !b.disabled ? b : null; }, ready: tutPlan(r), wait: { type: 'tap', match: function (a) { return a.what === 'go'; } }, side: 'top', avoid: need }; };
  var info = function (id, r, say, rule, tg) { return { id: id, rule: rule, say: say, target: tg, ready: tutPlan(r), wait: null, side: 'top', avoid: need }; };
  var pend = function (t) { return function () { return !!G && !!G.pend && G.pend.t === t; }; };
  return [
    info('goal', 1, 'Race one lap: the first car over the line wins.', 'goal', function () { return $('#trk .score') || $('#msg'); }),
    gear('gear', 1, 2, 'Your gear is how many cards you play: tap gear 2.', 'gear'),
    go('go1', 1, 'Best cards are picked for you, 3 + 2: tap Go.', 'speed'),
    info('corner', 2, 'This sign is the corner\'s speed limit: 5.', 'corner', tutSpot),
    go('go2', 2, 'Speed 8 in a 5 burns 3 engine heat: tap Go.', 'burn'),
    info('spin', 3, 'Only 3 heat left: 4+ over a limit spins you out.', 'spin', function () { return $('#heatl'); }),
    gear('gear1', 3, 1, 'Gear 1 is slow but cools 3 Heat cards: tap it.', 'cooldown'),
    go('go3', 3, 'Speed 3 takes the corner clean: tap Go.'),
    gear('gear3', 4, 3, 'Shifting two gears costs 1 heat: tap gear 3.', 'shift2'),
    go('go4', 4, 'Stress plays your deck\'s next speed card: tap Go.', 'stress'),
    { id: 'slip', rule: 'slip', say: 'Right behind a car, slipstream gives 2 extra spaces, no cards: tap it.', target: function () { return $('#slipY'); }, ready: pend('slip'), wait: { type: 'tap', match: function (a) { return a.what === 'slip'; } }, side: 'top', avoid: tutRects(['#msg']) },
    { id: 'disc', rule: 'discard', say: 'Drop slow cards to draw fresh ones: tap Drop.', target: function () { var b = $('#discY'); return b && !b.disabled ? b : null; }, ready: pend('disc'), wait: { type: 'tap', match: function (a) { return a.what === 'discgo'; } }, side: 'top', avoid: needQ },
    { id: 'boost', rule: 'boost', say: 'Boost: after your cards show, flip one more for 1 heat.', target: function () { return $('#boostT'); }, ready: tutPlan(5), wait: { type: 'tap', match: function (a) { return a.what === 'boost'; } }, side: 'top', avoid: need },
    go('go5', 5, 'Speed 7 plus the boost reaches the line: tap Go.'),
    { id: 'finish', rule: 'finish', say: 'You won, and the others race on until all finish.', target: function () { return $('#trk .score') || $('#msg'); }, ready: function () { return !!UI.tutOver; }, wait: null, side: 'bottom', avoid: tutRects(['#msg']) }
  ];
}
function tutStart(o) {
  closeModal(); UI.cmpDef = null; UI.tutOver = false; o = o || {};
  GXT.start({
    game: TUT_GAME, setup: function () { UI.mode = 'tutorial'; startGame({ track: 'practice', laps: 1, opp: 2, hum: 1, diff: 'easy', seed: 12, tut: true }); },
    steps: tutSteps(), story: true, endTitle: 'You know every rule', endText: 'Now a real race against four rivals. Pick a gear, press Go.',
    onDone: function (r) { tutLeave(false); if (r && r.choice === 'story' && typeof GXC !== 'undefined') GXC.open(); else if (o.then) o.then(); else startGame(); },
    onExit: function () { tutLeave(true); }
  });
}
function chapterMenu() { tutStart(); }
/* help drawer: rules cards through the shared help kit (lightbulb in the top bar: suggested move, "How does this work?" opens the cards) */
/* Hint text: the move itself (gear and cards from the strongest planner), not a generic tip */
function hintWhy() {
  try {
    var c = you(), p = planOnce(), nm = p.idx.map(function (i) { var x = c.hand[i]; return x === 'X' ? 'the Stress card' : isSpeed(x) ? 'the ' + x : cardText(x).split(/[:.]/)[0].replace(/ card$/, ''); }); nm = nm.map(function (t) { return /^(Burst|Brake)/.test(t) ? 'the ' + t : t; });
    var on = UI.gear === p.gear && p.idx.every(function (j) { return UI.sel.indexOf(j) >= 0; });   /* F6: the plan is picked for you at the start of each turn */
    return 'Take gear ' + p.gear + ' and play ' + (nm.length > 1 ? nm.slice(0, -1).join(', ') + ' and ' + nm[nm.length - 1] : nm[0]) + (on ? '. Already picked: press Go.' : '. Tap the gold ones, then Go.');
  } catch (e) { return 'Tap Suggest: the gear and cards to play turn gold.'; }
}
function helpBoot() {
  if (typeof GXH === 'undefined') return;
  var R = [
    { title: 'How a turn works', text: 'Pick a gear (cards to play). Tap that many cards: they add up to your speed. Press Go. Mind the corner limits. Cars then move one at a time, leader first.' },
    { title: 'Gear and cards', text: 'Your gear is how many cards you play. Shift one gear free, or two gears for 1 heat. The cards add up to your speed.' },
    { title: 'Corners', text: 'Each corner has a speed limit. Every point you go over costs 1 heat from your engine. Too little heat in your engine to pay means a spin-out.' },
    { title: 'Heat', text: 'Heat you pay goes to your discard pile and comes back as dead cards in your hand. Gears 1 and 2 send heat back to the engine.' },
    { title: 'Stress', text: 'A Stress card is a gamble: it plays as a random card flipped.' },
    { title: 'Slipstream and boost', text: 'End next to or right behind a car to glide 2 more spaces (no cards; a corner it carries you past still costs heat). Boost: pay 1 heat to flip an extra speed card.' },
    { title: 'Upgrades', text: 'With Upgrades on you draft 3 cards before the race. They are played like speed cards and add a bonus.' }
  ];
  GXH.init({ game: 'redline-rally', defaultOn: false, steps: {}, rules: R, top: function () { var dk = document.querySelector('.gx-dock'); if (innerHeight < 600 && dk) { var r = dk.getBoundingClientRect(); if (r.top > innerHeight * 0.3) return Math.ceil(r.top) + 4; } var b = document.querySelector('.gx-bar'), rb = b && b.getBoundingClientRect(); return rb && rb.bottom > 0 && rb.bottom < innerHeight / 2 ? Math.ceil(rb.bottom) + 4 : 6; } });   /* short phones: the Hint bubble stays over the dock, never over the board */
  GXH.bulb({ el: '#bulbbtn', rulesFor: function () { return null; }, suggest: function () {
    if (!G || G.phase !== 'plan' || !$('#sugB')) return null; try { if (!sugShown()) suggest(); } catch (e) { }   /* F3: the bulb shows the same gold plan as Suggest, never plays it */ return { target: function () { return $('.gb[data-g="' + planOnce().gear + '"]') || $('#sugB'); }, why: hintWhy() };
  } });
}
