/* Redline Rally tutorial = Prologue "The Sunline Seat": ONE real short game (30-space Practice Loop, 1 lap, you + Kit Marlow + Juno) played to the result screen with the real AI,
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
function tutStageRound(r) {   /* called when the plan for round r is about to be shown (tutorial only) */
  var ch = TUT_CH[Math.min(r, 6) - 1]; if (!ch || !G || G.cars[0].fin) return;
  var c = G.cars[0], kit = G.cars[1], jn = G.cars[2], N = T(G).N;
  if (UI.tutAbs) { c.pos = ch.pos; c.gear = ch.gear; UI.tutAbs = false; G.round = ch.round; }
  /* heat accounting: engine heat + heat cards = 6 */
  var pool = c.deck.concat(c.hand, c.disc).filter(function (x) { return x !== 'H'; }), heatCards = ENGINE0 - ch.eng;
  c.eng = ch.eng; c.deck = pool.concat(Array(heatCards).fill('H')); c.hand = []; c.disc = []; if (c.plan) c.plan = null;
  stackCards(c, ch.hand, ch.top);
  c.gear = ch.gear; c.pos = ch.pos; UI.gear = c.gear; UI.sel = []; UI.touchedGear = 0;
  /* positions: the rivals start near the player each round (rounds 4 and 6 are staged for adrenaline and the finish) */
  var KO = [0, 2, 3, 4, 2, -8], JO = [0, -1, -3, -3, 3, -3, -10];
  kit.pos = r === 1 ? 4 : c.pos + KO[r - 1]; jn.pos = r === 1 ? 2 : c.pos + (r === 4 ? 3 : r === 6 ? JO[6] : -3);
  if (r === 4) kit.pos = c.pos + 4;
  /* the rivals' plans are fixed too, so nobody races away and the slipstream chapter lines up: Kit plays 2+2 (lands one space past the player's speed-5 move) */
  var KP = { 1: ['2', '2'], 2: ['3', '2'], 3: ['3', '2'], 4: ['2', '2'], 5: ['2', '2'], 6: ['2', '1'] };
  [kit, jn].forEach(function (x, n) {
    var cards = n === 0 ? KP[r] : ['2', '1']; x.gear = 2; x.plan = null; x.eng = ENGINE0 - x.deck.concat(x.hand, x.disc).filter(function (q) { return q === 'H'; }).length; stackCards(x, cards.concat(['3', '4', '3', '4', '1']));
    var e2 = submitPlan(G, x.i, { gear: 2, idx: [0, 1], boost: false }); if (e2) console.warn('tut rival plan', e2);
  });
  G.cars.forEach(function (x, i) { UI.vis[i].p = x.pos; x.tie = i === 0 ? 2 : i === 1 ? 0 : 1; }); G.cars.slice(3).forEach(function (x) { x.pos = 0; });
  UI.focus = 0; snapCam(); UI.redraw();
}
function stageTutorial() { tutStageRound(UI.tutStart || 1); }
function tutSteps(from) {
  var isCard = function (a, ids) { return a.what === 'card' && ids.indexOf(a.i) >= 0; }, TX = STORY.tut;
  var say = function (id) { return function () { return TX[id].s; }; };
  var plan = function () { return G && G.phase === 'plan' && !UI.busy && !G.pend; };
  var round = function (k) { return function () { return plan() && G.round === k && !!$('#goB'); }; };
  var after = function (k) { return function () { return plan() && G.round >= k && !!$('#tray'); }; };
  var gearT = function (g) { return function () { return document.querySelector('.gb[data-g="' + g + '"]'); }; };
  var gearW = function (g) { return { type: 'tap', match: function (a) { return a.what === 'gear' && a.g === g; } }; };
  var cardsW = function (ids) { return { type: 'tap', times: ids.length, match: function (a) { return isCard(a, ids); } }; };
  var cardEl = function (i) { return function () { return document.querySelector('#hand .cd[data-i="' + i + '"]'); }; };
  var cardsEl = function (ids) { return function () { return document.querySelector('#hand .cd[data-i="' + ids[0] + '"]'); }; };
  var goStep = function (id, ids) { return { id: id, chapter: 0, title: STORY.guide, say: say(id), target: function () { return $('#goB'); }, ready: function () { return !$('#goB').disabled && ids.every(function (i) { return UI.sel.indexOf(i) >= 0; }); }, wait: { type: 'tap', match: function (a) { return a.what === 'go'; } }, side: 'top' }; };
  var watch = function (id, k) { return { id: id, title: STORY.guide, say: say(id), target: function () { return $('#tray'); }, ready: after(k), wait: null, side: 'top', pending: 'The rivals take their turns' }; };
  var S = [
    { id: 'meet', ch: 1, title: STORY.chapters[0], say: say('meet'), target: function () { return $('#cvw'); }, ready: round(1), wait: null, side: 'bottom' },
    { id: 'gear', title: STORY.guide, say: say('gear'), target: gearT(2), wait: gearW(2), wrong: 'Take gear 2.', side: 'top' },
    { id: 'cards', title: STORY.guide, say: say('cards'), target: function () { return $('#hand'); }, wait: cardsW([1, 2]), wrong: 'Play the 3 and the 2.', side: 'top' },
    goStep('go1', [1, 2]), watch('watch1', 2),
    { id: 'corner', ch: 2, title: STORY.chapters[1], say: say('corner'), target: function () { return $('#cvw'); }, ready: round(2), wait: null, side: 'bottom' },
    { id: 'push', title: STORY.guide, say: say('push'), target: function () { return $('#hand'); }, wait: cardsW([0, 1]), wrong: 'Play the 4 and the 3.', side: 'top' },
    { id: 'read', title: STORY.guide, say: function () { var ci = curveInfo(); return 'Speed ' + ci.sp + ' would burn ' + ci.burn + ' of your 6 heat' + (ci.spin ? ' and spin you out' : '') + '. Far too pricey.'; }, target: function () { return $('#msg'); }, ready: function () { return UI.sel.length === 2; }, wait: null, side: 'top' },
    { id: 'brake', title: STORY.guide, say: say('brake'), target: function () { return $('#hand'); }, wait: cardsW([2, 3]), wrong: 'Play the two 2s.', side: 'top' },
    goStep('go2', [2, 3]), watch('watch2', 3),
    { id: 'gamble', ch: 3, title: STORY.chapters[2], say: say('gamble'), target: function () { return $('#hand'); }, ready: round(3), wait: cardsW([0, 1]), wrong: 'Play the 3 and the 2.', side: 'top' },
    goStep('go3', [0, 1]), watch('watch3', 4),
    { id: 'deadcards', ch: 4, title: STORY.chapters[3], say: say('deadcards'), target: cardEl(0), ready: round(4), wait: null, side: 'top' },
    { id: 'gear1', title: STORY.guide, say: say('gear1'), target: gearT(1), wait: gearW(1), wrong: 'Take gear 1.', side: 'top' },
    { id: 'stress', title: STORY.guide, say: say('stress'), target: cardEl(1), wait: cardsW([1]), wrong: 'Play the purple Stress card.', side: 'top' },
    { id: 'adr', title: STORY.guide, say: say('adr'), target: function () { return $('#msg'); }, wait: null, side: 'top' },
    goStep('go4', [1]), watch('watch4', 5),
    { id: 'tuck', ch: 5, title: STORY.chapters[4], say: say('tuck'), target: function () { return $('#cvw'); }, ready: round(5), wait: null, side: 'bottom' },
    { id: 'gear3', title: STORY.guide, say: say('gear3'), target: gearT(3), wait: gearW(3), wrong: 'Take gear 3.', side: 'top' },
    { id: 'cards3', title: STORY.guide, say: say('cards3'), target: function () { return $('#hand'); }, wait: cardsW([0, 1, 2]), wrong: 'Play the two 2s and the 1.', side: 'top' },
    goStep('go5', [0, 1, 2]),
    { id: 'slip', title: STORY.guide, say: say('slip'), target: function () { return $('#slipY'); }, ready: function () { return !!$('#slipY'); }, wait: { type: 'tap', match: function (a) { return a.what === 'slip'; } }, wrong: 'Take the slipstream.', side: 'top', pending: 'Kit drives first' },
    watch('watch5', 6),
    { id: 'finale', ch: 6, title: STORY.chapters[5], say: say('finale'), target: function () { return $('#cvw'); }, ready: round(6), wait: null, side: 'bottom' },
    { id: 'gear2', title: STORY.guide, say: say('gear2'), target: gearT(2), wait: gearW(2), wrong: 'Take gear 2.', side: 'top' },
    { id: 'cards2', title: STORY.guide, say: say('cards2'), target: function () { return $('#hand'); }, wait: cardsW([0, 1]), wrong: 'Play the 2 and the 1.', side: 'top' },
    { id: 'boost', title: STORY.guide, say: say('boost'), target: function () { return $('#boostB'); }, wait: { type: 'tap', match: function (a) { return a.what === 'boost'; } }, wrong: 'Tap Boost.', side: 'top' },
    goStep('go6', [0, 1]),
    { id: 'result', title: STORY.guide, say: say('result'), target: function () { return document.querySelector('#modal .sheet'); }, ready: function () { return !!document.querySelector('#modal .podium'); }, wait: null, side: 'top', pending: 'The cars cross the line' }
  ];
  S.forEach(function (st) { if (st.ch) st.chapter = st.ch; });
  if (from > 1) { var k = 0; S.forEach(function (st, i) { if (st.ch === from) k = i; }); S = S.slice(k); }
  return S;
}
function tutCoverage() { return tutSteps(1).map(function (s) { return s.id; }); }
function tutStart(o) {
  closeModal(); UI.cmpDef = null; o = o || {}; var after = o.then, from = o.chapter || 1;
  GXT.start({
    game: TUT_GAME, setup: function () { UI.mode = 'tutorial'; UI.tutStart = from; UI.tutAbs = from > 1; startGame({ track: 'practice', laps: 1, opp: 2, hum: 1, diff: 'easy', seed: 12, tut: true }); },
    steps: tutSteps(from), story: false, endTitle: STORY.tutEndTitle, endText: STORY.tutEndText,
    endButtons: [{ id: 'quick', label: 'Play a Quick game' }, { id: 'story', label: 'Story: chapter 1' }],
    onDone: function (r) { UI.mode = ''; lsSet('rr_seen', '1'); showTitle(); if (after) after(); else if (r && r.choice === 'quick') startGame(); else if (r && r.choice === 'story' && typeof GXC !== 'undefined') GXC.open(); },
    onExit: function () { UI.mode = ''; lsSet('rr_seen', '1'); showTitle(); }
  });
}
function chapterMenu() {
  modal('<h2>' + esc(STORY.tutTitle) + '</h2><p>Six short chapters, one real game. Start anywhere.</p><div style="display:flex;flex-direction:column;gap:8px">' + STORY.chapters.map(function (t, i) { return '<button class="ghostb" data-ch="' + (i + 1) + '">' + esc(t) + '</button>'; }).join('') + '</div>');
  document.querySelectorAll('#modal [data-ch]').forEach(function (b) { b.onclick = function () { tutStart({ chapter: +b.getAttribute('data-ch') }); }; });
}
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
