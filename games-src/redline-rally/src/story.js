/* Redline Rally story text: every line the player reads outside the rules lives here (tutorial prologue, quick-game flavour, turn captions).
   Story-mode chapter intros/outros live in campaign.json (same cast). Edit text here; no logic. Original names only. */
var STORY = {
  guide: 'Coach Mara',
  rival: 'Kit Marlow',
  /* the five lines at the top of Help */
  turn: ['1. Pick a gear: it is how many cards you play.', '2. Tap that many cards. Their numbers add up to your speed.', '3. Press Go. Your car drives that many spaces.', '4. Corners have a speed limit. Go over it and you burn engine heat.', '5. Everyone plans at once, then the cars move one at a time, leader first.'],
  /* quick game */
  quickIntro: ['Lights out. Brake smart, burn little, cross first.', 'Rain is coming. One clean lap wins.', 'Heat is fuel. Spend it where it counts.'],
  quickWin: ['You took the flag with fuel to spare.', 'Chequered flag, and it is yours.'],
  quickLose: ['Not today. Brake earlier next time.', 'They got you at the line. Run it back?'],
  /* turn banner + plain instructions */
  yourTurn: 'Your turn',
  planGear: 'Pick a gear, then tap cards.',
  planCards: function (n) { return 'Tap ' + n + ' card' + (n > 1 ? 's' : '') + ': they add up to speed.'; },
  planGo: 'Press Go!',
  tutEndTitle: 'The seat is yours',
  tutEndText: 'Gear, cards, corners, heat, slipstream, boost. Kit wants a rematch.',
  /* result lines in the game's voice (Quick game) */
  resultWin: 'Flag! Sunline is yours.',
  resultLose: function (n) { return n + ' takes the flag.'; }
};
function pickLine(a) { return a[Math.floor(Math.random() * a.length)]; }
