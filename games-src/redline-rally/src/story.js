/* Redline Rally story text: every line the player reads outside the rules lives here (tutorial prologue, quick-game flavour, turn captions).
   Story-mode chapter intros/outros live in campaign.json (same cast). Edit text here; no logic. Original names only. */
var STORY = {
  guide: 'Coach Mara',
  rival: 'Kit Marlow',
  /* the five lines at the top of Help */
  turn: ['1. Pick a gear: it is how many cards you play.', '2. Tap that many cards. Their numbers add up to your speed.', '3. Press Go. Your car drives that many spaces.', '4. Corners have a speed limit. Go over it and you burn engine heat.', '5. Then every rival takes a turn, one car at a time.'],
  /* quick game */
  quickIntro: ['Lights out. Brake smart, burn little, cross first.', 'Rain on the horizon. One clean lap wins it.', 'The grid is set. Heat is your fuel: spend it where it counts.'],
  quickWin: ['You took the flag with fuel to spare.', 'Chequered flag, and it is yours.'],
  quickLose: ['Not today. Brake earlier next time.', 'They got you at the line. Run it back?'],
  /* turn banner + plain instructions */
  yourTurn: 'Your turn',
  planGear: 'Pick a gear: it is how many cards you play.',
  planCards: function (n) { return 'Tap ' + n + ' card' + (n > 1 ? 's' : '') + ': their numbers add up to your speed.'; },
  planGo: 'Happy with that? Press Go!',
  /* tutorial: Prologue "The Sunline Seat". Each step: t = who speaks, s = the story reason + what to do (no "click"), r = the reaction shown next */
  tutTitle: 'Prologue: The Sunline Seat',
  chapters: ['Chapter 1: Your first turn', 'Chapter 2: The wet corner', 'Chapter 3: Heat is fuel', 'Chapter 4: Cool down, catch up', 'Chapter 5: Tuck in behind Kit', 'Chapter 6: The line'],
  tut: {
    meet: { s: 'Rookie, I am Coach Mara. Kit Marlow wants your seat at Sunline. Win one lap and it stays yours.' },
    gear: { s: 'First lesson. Your gear is how many cards you play. Take gear 2.' },
    cards: { s: 'Two cards, two numbers: the sum is your speed. Play the 3 and the 2.' },
    go1: { s: 'Speed 5 puts you five spaces up the road. Floor it!' },
    watch1: { s: 'Smooth launch! Kit, Juno and you each drive in turn. That is every round.' },
    corner: { s: 'Rain on the corner ahead: the speed limit is 5. Every point over burns a heat from your engine.' },
    push: { s: 'Try it the bold way. Play the 4 and the 3.' },
    read: { s: 'Speed 7 is 2 over the limit: two heat burned. Too pricey right now.' },
    brake: { s: 'Brake instead. Play the two 2s: speed 4 stays under the limit.' },
    go2: { s: 'Speed 4 sails through clean. Hit Go.' },
    watch2: { s: 'Clean corner, full engine. That is how you save fuel.' },
    gamble: { s: 'Kit is pulling away. Corner limit 4 ahead. Spend one heat to catch him: play the 3 and the 2.' },
    go3: { s: 'Speed 5, one over the limit. One heat is a fair price. Go!' },
    watch3: { s: 'Caught him! One heat spent. Watch the engine dots: that is your fuel.' },
    deadcards: { s: 'Spent heat comes back later as dead Heat cards in your hand. They cannot be played.' },
    gear1: { s: 'Gear 1 cools your engine: heat cards go back to the engine. Take gear 1.' },
    stress: { s: 'The purple card is Stress: a mystery speed, flipped from your deck. Play it.' },
    adr: { s: 'You are last, so you get adrenaline: one extra space and one extra cool-down. Free help.' },
    go4: { s: 'Stress card, mystery speed, plus adrenaline. Go!' },
    watch4: { s: 'Heat back in the engine and the pack in sight. Good work.' },
    tuck: { s: 'Kit is just ahead. Stop right behind him and you can slipstream: two free spaces.' },
    gear3: { s: 'Shifting two gears costs one heat. Worth it: take gear 3.' },
    cards3: { s: 'Three cards this time: play the two 2s and the 1.' },
    go5: { s: 'Speed 5 should tuck you right behind Kit. Go!' },
    slip: { s: 'You are on his bumper! Take the slipstream: two free spaces.' },
    watch5: { s: 'Slingshot! Kit never saw it coming.' },
    finale: { s: 'The line is close. Gear 2, then boost: one heat for an extra flipped card.' },
    gear2: { s: 'Take gear 2.' },
    cards2: { s: 'Play the 2 and the 1.' },
    boost: { s: 'Now boost: it pays one heat and flips an extra speed card.' },
    go6: { s: 'Everything you have. Go!' },
    result: { s: 'First over the line wins. Finishing order is by distance, ties go to whoever arrived first.' }
  },
  tutEndTitle: 'The seat is yours',
  tutEndText: 'Gear, cards, corners, heat, slipstream, boost. Kit wants a rematch.',
  /* result lines in the game's voice (Quick game) */
  resultWin: 'Flag! Sunline is yours.',
  resultLose: function (n) { return n + ' takes the flag. Brake earlier next time.'; }
};
function pickLine(a) { return a[Math.floor(Math.random() * a.length)]; }
