// Redline Rally: scenario lessons on the shared engine (shell/gx-scenario-tutor.js, docs shell/GXST.md). They replace the old guided first race.
// Each lesson stages a real 3-car practice race (you + two rivals), plays the real engine, and judges the real car state.
// RULE -> LESSON (every rule the rules drawer teaches):
//   gear = cards you play, the total is your speed ......................................................... gear
//   corners have a speed limit, every point over burns 1 heat ............................................. corner
//   no heat left when over the limit: you spin out and lose all engine heat ............................... spin
//   gear 1 cools up to 3 heat back into the engine, gear 2 cools 1, gears 3 and 4 none ................. cool
//   end beside or just behind a rival: a slipstream glides you 2 more spaces ............................. slip
//   boost: pay 1 heat after the reveal, flip cards until a speed card shows, add it ...................... boost
(function () {
  if (!window.GXST) return;
  var $ = function (s) { return document.querySelector(s); };
  var L = { n: 0, s: null };   // n = the player's own moves in this lesson (for par); s = car values at setup (judged against)
  var me = function () { return G.cars[0]; };
  var ready = function () { return typeof G !== 'undefined' && typeof startGame === 'function' && typeof UI !== 'undefined' && typeof goalCard === 'function' && typeof commit === 'function' && !!window.GXST; };
  var until = function (f, ms) { var t0 = Date.now(); return new Promise(function (r) { (function w() { var ok = false; try { ok = f(); } catch (e) { } if (ok || Date.now() - t0 > ms) r(ok); else setTimeout(w, 60); })(); }); };
  var settled = function () { return !!G && !UI.busy && !G.pend && (G.phase === 'plan' || !!G.over || !!me().fin) && !$('#bq') && !$('.slipq'); };
  var moved = function () { return me().pos - L.s.pos; };
  var cardAt = function (j) { return function () { return document.querySelector('#hand .cd[data-i="' + j + '"]'); }; };
  var gearBtn = function (g) { return function () { return document.querySelector('#gears .gb[data-g="' + g + '"]'); }; };
  var plays = function () { return L.n; };

  // deal the car and the two rivals a set-up round, in the same way as the tutorial's stackCards / tutStageRound
  // (car 0 = you; rivals cars 1 and 2 play gear 2 with the two given cards)
  function stackCards(c, want, top) {
    var pool = c.deck.concat(c.hand, c.disc), take = function (w) { var k = pool.indexOf(w); if (k >= 0) pool.splice(k, 1); return k >= 0; };
    var hand = want.filter(take), tp = (top || []).filter(take);
    shuffle(G, pool); c.deck = pool.concat(tp.slice().reverse()); c.hand = hand; c.disc = [];
    while (c.hand.length < HAND && c.deck.length) c.hand.push(c.deck.shift());
  }
  function stage(o) {
    var c = G.cars[0];
    c.deck = c.deck.concat(c.hand, c.disc).filter(function (x) { return x !== 'H'; });
    for (var k = 0; k < ENGINE0 - o.eng; k++) c.deck.push('H');
    c.hand = []; c.disc = []; c.plan = null; c.eng = o.eng; c.gear = o.gear; c.pos = o.pos; stackCards(c, o.hand, o.top);
    UI.gear = c.gear; UI.sel = []; UI.touchedGear = 0; UI.boost = false; UI.swap = false;
    o.rivals.forEach(function (r, i) {
      var x = G.cars[i + 1], heat = 0;
      x.pos = r.pos; x.gear = 2; x.plan = null;
      [x.deck, x.hand, x.disc].forEach(function (a) { a.forEach(function (h) { if (h === 'H') heat++; }); });
      x.eng = ENGINE0 - heat;
      stackCards(x, r.cards.concat(['3', '4', '3', '4', '1']));
      var e2 = submitPlan(G, x.i, { gear: 2, idx: [0, 1], boost: false }); if (e2) console.warn('lesson rival plan', e2);
    });
    G.cars.forEach(function (x, i) { UI.vis[i].p = x.pos; x.tie = i; });
    UI.focus = 0; snapCam(); UI.redraw();
  }
  // every lesson: a fresh game, then the staged round, then the start values the judge compares against
  function setup(o) {
    startGame({ track: 'practice', laps: 1, hum: 1, opp: 2, diff: 'easy', seed: 7, sup: false, tut: false });
    stage(o);
    L.n = 0; L.s = { pos: me().pos, eng: me().eng, spins: me().stats.spins, slips: me().stats.slips };
    drawPlan();
    return null;
  }

  var lessons = [
    { id: 'gear', title: 'Gear and speed', par: 1, moves: plays,
      rule: 'Gear = cards you play. The total of those cards is your speed, and you move that many spaces.',
      goal: 'Move 7 or more spaces this turn.',
      setup: function () { return setup({ pos: 17, gear: 1, eng: 6, hand: ['4', '3', '1', '2', '3', '1', '2'], rivals: [{ pos: 15, cards: ['1', '1'] }, { pos: 14, cards: ['1', '1'] }] }); },
      success: function () { return settled() && L.n > 0 && moved() >= 7; },
      fail: function () { return settled() && L.n > 0 && moved() < 7 ? 'You moved ' + moved() + ' spaces. Gear 1 plays one card, gear 2 plays two: more cards, more speed.' : false; },
      hints: ['Gear 1 plays one card. How many cards does a bigger gear play?', { say: 'Shift to gear 2, then tap two cards.', target: gearBtn(2) }],
      debrief: 'Gear 2 plays two cards: 4 and 3 make 7 spaces.' },
    { id: 'corner', title: 'Corner limit', par: 1, moves: plays,
      rule: 'A corner has a speed limit. Every point over the limit burns 1 heat from your engine.',
      goal: 'Pass the corner without losing any heat.',
      setup: function () { return setup({ pos: 6, gear: 2, eng: 6, hand: ['4', '4', '1', '2', '3', '1', '2'], rivals: [{ pos: 3, cards: ['1', '1'] }, { pos: 2, cards: ['1', '1'] }] }); },
      success: function () { return settled() && L.n > 0 && me().pos >= 10 && me().eng === 6; },
      fail: function () {
        if (!(settled() && L.n > 0 && me().eng < 6)) return false;
        return 'Speed ' + moved() + ' at a limit-5 corner burned ' + (L.s.eng - me().eng) + ' heat. Keep your speed at 5 or less.';
      },
      hints: ['The corner at space 10 has limit 5. Which two cards make 5 or less?', { say: 'Tap the 3: with the 2 in gear 2 that is speed 5.', target: cardAt(4) }],
      debrief: 'Speed 5 is the limit: no heat burned, and you passed the corner.' },
    { id: 'spin', title: 'Spin out', par: 1, moves: plays,
      rule: 'Over the corner limit with too little engine heat, you spin out and lose all your engine heat.',
      goal: 'Pass the corner without spinning out.',
      setup: function () { return setup({ pos: 6, gear: 2, eng: 1, hand: ['4', '4', '1', '2', '3', '1', '2'], rivals: [{ pos: 3, cards: ['1', '1'] }, { pos: 2, cards: ['1', '1'] }] }); },
      success: function () { return settled() && L.n > 0 && me().pos >= 10 && me().stats.spins === 0; },
      fail: function () { return settled() && L.n > 0 && me().stats.spins > 0 ? 'You spun out: speed over the limit with too little heat loses all your heat.' : false; },
      hints: ['You have 1 heat. How far over the limit can you go?', { say: 'Keep to speed 5: tap the 2 and the 3 in gear 2.', target: cardAt(4) }],
      debrief: 'With 1 heat you may not burn more than 1. Speed 5 keeps you on the road.' },
    { id: 'cool', title: 'Cooldown', par: 1, moves: plays,
      rule: 'Gear 1 cools up to 3 heat from your hand back into the engine. Gear 2 cools 1, gears 3 and 4 none.',
      goal: 'Refill your engine to full heat.',
      setup: function () { return setup({ pos: 17, gear: 1, eng: 3, hand: ['H', 'H', 'H', '2', '3', '1', '4'], rivals: [{ pos: 15, cards: ['1', '1'] }, { pos: 14, cards: ['1', '1'] }] }); },
      success: function () { return settled() && L.n > 0 && me().eng >= 6; },
      fail: function () { return settled() && L.n > 0 && me().eng < 6 ? 'Only gear 1 cools down 3 heat. Gear 2 cools 1, gears 3 and 4 none.' : false; },
      hints: ['Which gear cools the most heat back into the engine?', { say: 'Shift to gear 1 and play the 4: it cools all 3 heat.', target: gearBtn(1) }],
      debrief: 'Gear 1 pulled all 3 heat cards back into the engine. Full heat again.' },
    { id: 'slip', title: 'Slipstream', par: 1, moves: plays,
      rule: 'End beside or just behind a rival and the slipstream glides you 2 more spaces, for free.',
      goal: 'Land beside a rival and use the slipstream.',
      setup: function () { return setup({ pos: 17, gear: 2, eng: 6, hand: ['4', '3', '2', '1', '2', '1', '3'], rivals: [{ pos: 22, cards: ['1', '1'] }, { pos: 10, cards: ['1', '1'] }] }); },
      success: function () { return settled() && L.n > 0 && me().stats.slips > 0; },
      fail: function () { return settled() && L.n > 0 && me().stats.slips === 0 ? 'No rival was on or just ahead of your space, so no slipstream.' : false; },
      hints: ['Where does your move end? Look for a rival on that space.', { say: 'Tap the 4 and the 3 in gear 2: you land on space 24, beside the rival.', target: cardAt(0) }],
      debrief: 'Landing beside a rival lets the slipstream carry you 2 more spaces.' },
    { id: 'boost', title: 'Boost', par: 1, moves: plays,
      rule: 'Boost: pay 1 heat after the reveal, flip cards until a speed card shows, and add it to your move.',
      goal: 'Cross the finish line using a boost.',
      setup: function () { return setup({ pos: 24, gear: 2, eng: 4, hand: ['3', '2', '1', '1', '2', '3', '4'], top: ['4'], rivals: [{ pos: 22, cards: ['1', '1'] }, { pos: 20, cards: ['1', '1'] }] }); },
      success: function () { return settled() && L.n > 0 && !!me().fin; },
      fail: function () { return settled() && L.n > 0 && !me().fin ? 'One space short. A boost costs 1 heat and flips a card to add its speed.' : false; },
      hints: ['Gear 2 leaves you one space short. What can add speed after the reveal?', { say: 'Play the 3 and the 2, then answer Yes to the boost.', target: function () { return document.querySelector('#boostY') || document.querySelector('#goB'); } }],
      debrief: 'The boost flipped the 4, so your move reached the finish line.' },
  ];

  var go = function () {
    if (!ready()) { setTimeout(go, 200); return; }
    UI.fast = false; window.AIDELAY = 0.15;
    // a lesson never shows the goal card: the race start runs at once, the saved game is not touched (the lesson game is not saved)
    window.RRL = L;   // ui.js commit() counts moves into RRL.n and race.js goalCard() skips itself while a lesson runs
    var hb = document.getElementById('howB'); if (hb && !document.getElementById('lessonsB')) { var lb = document.createElement('button'); lb.className = 'ghostb'; lb.id = 'lessonsB'; lb.textContent = 'Lessons'; lb.onclick = function () { GXST.picker(); }; hb.parentNode.insertBefore(lb, hb.nextSibling); }   // title screen entry
    document.addEventListener('click', function (e) { var b = e.target.closest && e.target.closest('[data-lessons-open]'); if (b) { try { GX.close(); } catch (x) { } GXST.picker(); } });
    GXST.init({ game: 'redline-rally', scenarios: lessons, qParent: '.gx-bar',
      keepClear: ['.gx-bar', '#panel', '#hand', '#acts', '#gears', '#goB', '#bq', '.slipq'], settled: settled });
    window.RRLessons = { open: function () { GXST.picker(); } };
  };
  setTimeout(go, 300);
})();
