/* (W395 addendum 4: now a COACHED game: 2 forced first steps, then free play with just-in-time coach bubbles, see the coach section below.)
   Redline Rally tutorial = Prologue "The Sunline Seat": ONE real short game (30-space Practice Loop, 1 lap, you + Kit Marlow + Juno) played to the result screen with the real AI,
   in 6 chapters (one round each). Hands, deck tops and the rivals' start spaces are stacked each round so every rule comes up once. Text: story.js (STORY.tut).
   Chapter start states are absolute (space, gear, engine), so a chapter can be started on its own (Help > Guide chapters). Never saved except done/skipped in gxt-redline-rally. */
var TUT_GAME = 'redline-rally';
function tutOn() { return typeof GXT !== 'undefined' && GXT.active() && UI.mode === 'tutorial'; }
function firstTime() { return !lsGet('rr_seen') && !(typeof GXT !== 'undefined' && GXT.isDone(TUT_GAME)); }
function tutBtn(cls, o) { return typeof GXT === 'undefined' ? '' : GXT.menuHTML(Object.assign({ game: TUT_GAME, first: firstTime(), cls: cls, launch: function () { tutStart(); } }, o || {})); }
/* stack a car's cards: `want` = the hand (in order), `top` = next cards that will be flipped (first flipped first). Conserves every card (pool = deck + hand + discard). */
function stackCards(c, want, top) {
  var pool = c.deck.concat(c.hand, c.disc), take = function (w) { var k = pool.indexOf(w); if (k >= 0) pool.splice(k, 1); return k >= 0; };
  var hand = want.filter(take), tp = (top || []).filter(take);
  shuffle(G, pool); c.deck = pool.concat(tp.slice().reverse()); c.hand = hand; c.disc = [];
  while (c.hand.length < HAND && c.deck.length) c.hand.push(c.deck.shift());
}
/* chapter start states: me = {pos, gear, eng (heat in the engine; the rest sits as heat cards in the discard)}, hand, top of deck, and where the rivals start */
var TUT_CH = [
  { round: 1, pos: 3, gear: 1, eng: 6, hand: ['1', '3', '2', '4', '1', '2', '3'], kit: 4, juno: 2 },
  { round: 2, pos: 8, gear: 2, eng: 6, hand: ['4', '3', '2', '2', '1', '1', '3'], kit: 10, juno: 5 },
  { round: 3, pos: 12, gear: 2, eng: 6, hand: ['3', '2', '1', '4', '1', '2', '3'], kit: 15, juno: 9 },
  { round: 4, pos: 17, gear: 2, eng: 5, hand: ['H', 'X', '4', '3', '2', '1', '1'], top: ['3'], kit: 21, juno: 20 },
  { round: 5, pos: 21, gear: 1, eng: 6, hand: ['2', '2', '1', '4', '3', '3', '4'], kit: 'slip', juno: -3 },
  { round: 6, pos: 28, gear: 3, eng: 5, hand: ['2', '1', '4', '4', '3', '3', '1'], top: ['3'], kit: -8, juno: -10 }
];
function tutStageRound(r) {   /* round r's plan is about to be shown (tutorial only): stack the hand so the needed cases come up; the rivals sit near the player. Player choices stay free. */
  var ch = TUT_CH[r - 1]; if (!ch || !G || G.cars[0].fin) return;
  var c = G.cars[0], kit = G.cars[1], jn = G.cars[2];
  var pool = c.deck.concat(c.hand, c.disc).filter(function (x) { return x !== 'H'; }), heatCards = ENGINE0 - ch.eng;
  if (r === 1 || r === 4) { c.eng = ch.eng; c.deck = pool.concat(Array(heatCards).fill('H')); c.hand = []; c.disc = []; if (c.plan) c.plan = null; stackCards(c, ch.hand, ch.top); }
  else { var hh = c.deck.concat(c.hand, c.disc).filter(function (x) { return x === 'H'; }).length; c.deck = pool.concat(Array(hh).fill('H')); c.hand = []; c.disc = []; c.plan = null; stackCards(c, ch.hand, ch.top); }
  if (r === 1) { c.pos = ch.pos; c.gear = 1; }
  UI.gear = c.gear; UI.sel = []; UI.touchedGear = 0; UI.boost = false;
  var KO = [0, 2, 3, 4, 2, -8];
  kit.pos = r === 1 ? 4 : Math.max(0, c.pos + KO[r - 1]); jn.pos = r === 1 ? 2 : Math.max(0, c.pos + (r === 4 ? 3 : r === 6 ? -10 : -3));
  if (r === 4) { kit.pos = c.pos + 4; }
  var KP = { 1: ['2', '2'], 2: ['3', '2'], 3: ['3', '2'], 4: ['2', '2'], 5: ['2', '2'], 6: ['2', '1'] };
  [kit, jn].forEach(function (x, n) {
    var cards = n === 0 ? KP[r] : ['2', '1']; x.gear = 2; x.plan = null; x.eng = ENGINE0 - x.deck.concat(x.hand, x.disc).filter(function (q) { return q === 'H'; }).length; stackCards(x, cards.concat(['3', '4', '3', '4', '1']));
    var e2 = submitPlan(G, x.i, { gear: 2, idx: [0, 1], boost: false }); if (e2) console.warn('tut rival plan', e2);
  });
  G.cars.forEach(function (x, i) { UI.vis[i].p = x.pos; x.tie = i === 0 ? 2 : i === 1 ? 0 : 1; });
  UI.focus = 0; snapCam(); UI.redraw();
}
function stageTutorial() { tutStageRound(1); }

/* ============ the coach: just-in-time bubbles, one at a time, never blocking input, dismissable ============ */
var COACH_RULES = ['goal', 'gear', 'cards', 'shift2', 'corner', 'burn', 'heatcards', 'stress', 'cooldown', 'rivals', 'adrenaline', 'slip', 'boost', 'finish'];
var COACH_LATER = {
  spin: 'Spin out: not enough heat for a corner means you stop behind it, lose ALL engine heat, take 1 stress card (2 from gear 3 or 4).',
  pushback: 'Two cars fit on a space. If the space you aim for is full, you stop on the first free space behind.',
  stall: 'Too few playable cards for your gear? You play them all, pay heat cards for the rest, do not move and drop to gear 1.',
  swap: 'Swap cards (before you pick): throw away speed cards you do not want and draw back to 7, once per round.',
  upgrades: 'Upgrades mode: draft 3 bonus cards before the race. They play like speed cards with a bonus.',
  tie: 'Ties on the finish: the car that arrived first wins. The race goes on until every car has finished.'
};
var COACH = { on: false, seen: {}, q: [], cur: null, timer: 0 };
var COACH_TXT = {
  goal: ['Coach Mara', 'Rookie, Kit Marlow wants your seat at Sunline. Win one lap and it stays yours.'],
  gear: ['Coach Mara', 'Your gear is how many cards you play. Pick one, then tap that many cards.'],
  cards: ['Coach Mara', 'The numbers on your cards add up to your speed. Speed is how many spaces you drive.'],
  shift2: ['Coach Mara', 'Shifting two gears at once costs 1 heat. One gear up or down is free.'],
  corner: ['Coach Mara', 'Corner ahead. Its sign is the speed limit. Faster than the limit burns engine heat.'],
  burn: ['Coach Mara', 'You are over the limit: each point over burns 1 heat from your engine. Brake or pay?'],
  heatcards: ['Coach Mara', 'Dark Heat cards are dead weight in your hand. Gear 1 or 2 cools them back into the engine.'],
  stress: ['Coach Mara', 'Purple Stress card: when played, it flips a random speed card from your deck.'],
  cooldown: ['Coach Mara', 'Cooled! Heat cards from your hand went back into the engine. Fuel restored.'],
  rivals: ['Coach Mara', 'Now every rival drives in turn, leader first. Watch how Kit and Juno handle the corners.'],
  adrenaline: ['Coach Mara', 'Adrenaline: the last car to move gets +1 space and +1 cool-down. Free help.'],
  slip: ['Coach Mara', 'You are next to or right behind a car: slipstream gives 2 free spaces. Usually take it.'],
  boost: ['Coach Mara', 'Boost: pay 1 heat, flip an extra speed card and add it. Use it when the line is near.'],
  finish: ['Coach Mara', 'Over the line! Finishers are placed in the order they cross.']
};
function coachSay(id, text, force) {
  if (!COACH.on || (COACH.seen[id] && !force)) return; COACH.seen[id] = (COACH.seen[id] || 0) + 1;
  var t = text || COACH_TXT[id][1]; if (COACH.q.some(function (x) { return x.id === id; })) return;
  COACH.q.push({ id: id, t: t }); if (!COACH.cur) coachNext();
}
function coachNext() {
  clearTimeout(COACH.timer); var b = $('#coach'); COACH.cur = COACH.q.shift() || null;
  if (!b) { b = document.createElement('div'); b.id = 'coach'; b.setAttribute('role', 'status'); b.setAttribute('data-help', ''); $('#cvw').appendChild(b); }
  if (!COACH.cur) { b.className = ''; b.innerHTML = ''; return; }
  b.className = 'on'; b.innerHTML = '<span class="pt">M</span><span class="tx"></span><button type="button" id="coachX" aria-label="Dismiss">Got it</button><button type="button" id="coachSkip" aria-label="Skip tutorial">Skip</button>';
  b.querySelector('.tx').textContent = COACH.cur.t;
  $('#coachX').onclick = coachNext; $('#coachSkip').onclick = function () { tutLeave(true); };
  COACH.timer = setTimeout(coachNext, 9000 * (window.AIDELAY || 1));
}
function coachPlan(c, ci) {   /* called from drawPlan */
  if (!COACH.on) return;
  if (G.round === 1) { coachSay('goal'); coachSay('gear'); coachSay('cards'); }
  if (Math.abs(UI.gear - c.gear) === 2) coachSay('shift2');
  var nc = nextCorner(c.pos); if (nc && nc.d <= 8) coachSay('corner', 'Corner ahead in ' + nc.d + ' spaces, limit ' + nc.limit + '. Faster than that burns engine heat.');
  if (ci && ci.burn > 0) coachSay('burn', 'Speed ' + ci.sp + ' is over the limit: it burns ' + ci.burn + ' of your ' + c.eng + ' heat. Brake or pay?');
  if (c.hand.indexOf('H') >= 0) coachSay('heatcards');
  if (c.hand.indexOf('X') >= 0) coachSay('stress');
  if (UI.boost) coachSay('boost');
  else if (G.round >= 5 && c.eng >= 3) coachSay('boost');
}
function coachEvent(e, you) {   /* called from playEvents */
  if (!COACH.on) return;
  if (!you && (e.t === 'play')) coachSay('rivals');
  if (you && e.t === 'cool') coachSay('cooldown');
  if (you && e.t === 'adr') coachSay('adrenaline');
  if (you && e.t === 'boost') coachSay('boost');
  if (e.t === 'slip' && you) coachSay('slip');
  if (you && e.t === 'corner') { if (e.cost) coachSay('burn' + e.idx, 'Good lesson: ' + e.cost + ' heat burned over a limit of ' + e.limit + '. Brake earlier to save fuel.', 1); else coachSay('clean' + e.idx, 'Clean corner: you stayed under the limit of ' + e.limit + '. That is how you save fuel.', 1); }
  if (you && e.t === 'spin') { COACH.seen.spin = 1; coachSay('spin', 'Spin out! No heat left for that corner: you lose all engine heat and take stress cards.', 1); }
  if (you && e.t === 'stall') { COACH.seen.stall = 1; coachSay('stall', COACH_LATER.stall, 1); }
  if (e.t === 'finish' && you) coachSay('finish');
}
function coachFinish() {   /* result screen of the tutorial: score rule by rule with the player's numbers, then "things you'll meet later" */
  var me = G.cars[0], place = G.rank.indexOf(0) + 1, st = me.stats;
  COACH.later = COACH_RULES.concat(Object.keys(COACH_LATER)).filter(function (k) { return !COACH.seen[k]; });
  var rows = '<ol class="walk"><li><b>Finish:</b> you came ' + ord(place) + ' of ' + G.cars.length + '. Finishers rank by crossing order; the rest by distance. Ties go to whoever arrived first.</li><li><b>Heat burned:</b> ' + st.heat + ' in corners, shifts and boosts. Less heat spent means more left for the next push.</li><li><b>Spin-outs:</b> ' + st.spins + '. A spin-out loses all your heat.</li><li><b>Slipstreams:</b> ' + st.slips + ' (' + (st.slips ? 'free spaces' : 'none this time') + ').</li><li><b>Boosts:</b> ' + st.boosts + '.</li></ol>';
  UI.lockModal = true;
  modal('<div class="podium"><h2>' + (place === 1 ? 'You win the seat!' : 'Race over') + '</h2><p class="rl">' + (place === 1 ? 'Coach Mara: "That is how you beat Kit. The Sunline seat is yours."' : 'Coach Mara: "Not first, but you now know every trick. Again?"') + '</p></div><h3>Your score, rule by rule</h3>' + rows + '<div class="row"><button class="big" id="walkN">Next</button></div>');
  $('#mx').hidden = true;
  $('#walkN').onclick = function () {
    var l = COACH.later.map(function (k) { return '<li data-rule="' + k + '">' + esc(COACH_LATER[k] || COACH_TXT[k][1]) + '</li>'; }).join('');
    modal('<h2>Things you will meet later</h2>' + (l ? '<ul class="later">' + l + '</ul>' : '<p>You met every rule in this game.</p>') + '<div class="row"><button class="big" id="tq">Play a Quick game</button><button class="ghostb" id="ts">Story: chapter 1</button></div>');
    $('#mx').hidden = true; COACH.laterShown = true;
    var end = function (to) { UI.lockModal = false; tutLeave(false); if (to === 'quick') startGame(); else if (typeof GXC !== 'undefined') GXC.open(); };
    $('#tq').onclick = function () { end('quick'); }; $('#ts').onclick = function () { end('story'); };
  };
}
function tutLeave(skipped) {
  COACH.on = false; clearTimeout(COACH.timer); var b = $('#coach'); if (b) b.remove(); UI.mode = ''; UI.lockModal = false; lsSet('rr_seen', '1');
  try { if (GXT.running()) GXT.skip(); } catch (e) { }
  try { GXT.markDone(TUT_GAME); } catch (e) { }
  closeModal(); if (skipped) showTitle();
}
function tutSteps() {   /* only the very first action is forced (2 steps); the rest is free play with the coach */
  var gearT = function () { return document.querySelector('.gb[data-g="2"]'); };
  return [
    { id: 'gear', title: 'Coach Mara', say: 'Kit Marlow wants your seat. Win one lap. Your gear is how many cards you play: take gear 2.', target: gearT, ready: function () { return G && G.phase === 'plan' && !UI.busy && !!document.querySelector('.gb[data-g="2"]'); }, wait: { type: 'tap', match: function (a) { return a.what === 'gear' && a.g === 2; } }, wrong: 'Take gear 2.', side: 'top' },
    { id: 'cards', title: 'Coach Mara', say: 'Tap any two cards. Their numbers add up to your speed.', target: function () { return $('#hand'); }, wait: { type: 'tap', times: 2, match: function (a) { return a.what === 'card'; } }, wrong: 'Tap two cards.', side: 'top', onDone: function () { setTimeout(function () { try { GXT.stop(); } catch (e) { } COACH.on = true; coachPlan(you(), null); drawPlan(); }, 30); } }
  ];
}
function tutStart(o) {
  closeModal(); UI.cmpDef = null; o = o || {}; COACH.seen = {}; COACH.q = []; COACH.cur = null; COACH.later = null; COACH.laterShown = false;
  GXT.start({
    game: TUT_GAME, setup: function () { UI.mode = 'tutorial'; startGame({ track: 'practice', laps: 1, opp: 2, hum: 1, diff: 'easy', seed: 12, tut: true }); },
    steps: tutSteps(), story: false, onDone: function () { }, onExit: function () { tutLeave(true); }
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
