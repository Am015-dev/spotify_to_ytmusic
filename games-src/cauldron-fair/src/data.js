// Cauldron Fair static data. Internal `id` strings are for code only; players see `name` and `text`.
// Every number here is from the research (see rules-notes.md, "Confirmed vs. guessed"). Real-game names are NOT in this file.
(function (g) {
var CF = g.CF = g.CF || {};

// ---- the cauldron track: 54 spaces, index 0 = where the droplet starts, 53 = the spoon (last scoring space).
// Chips can sit on indexes 1..52 (LAST_CHIP); a chip that would go further stays on 52. The scoring space is the one after the last chip.
var COINS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 15, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 21, 22, 22, 23, 23, 24, 24, 25, 25, 26, 26, 27, 27, 28, 28, 29, 29, 30, 30, 31, 31, 32, 32, 33, 33, 35];
var VP = [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 7, 7, 7, 8, 8, 8, 9, 9, 9, 10, 10, 10, 11, 11, 11, 12, 12, 12, 12, 13, 13, 13, 14, 14, 15];
var RUBY_AT = [5, 9, 13, 16, 20, 24, 28, 30, 34, 36, 40, 42, 46, 50, 52];
var RUBY = COINS.map(function (_, i) { return RUBY_AT.indexOf(i) >= 0 ? 1 : 0; });

// ---- chips. Colour letters: W white, O orange, G green, B blue, R red, Y yellow, P purple, K black.
// supply = how many chips of that (colour,value) exist in the box.
var COLORS = {
  W: { id: 'W', name: 'Fizzpod', plural: 'Fizzpods', css: '#f4efe2', ink: '#5b3a24', vals: [1, 2, 3], blurb: 'Explosive. Too many and the pot blows.' },
  O: { id: 'O', name: 'Marrow', plural: 'Marrows', css: '#f08a22', ink: '#fff', vals: [1] },
  G: { id: 'G', name: 'Mossback', plural: 'Mossbacks', css: '#3fa04a', ink: '#fff', vals: [1, 2, 4] },
  B: { id: 'B', name: 'Wren Feather', plural: 'Wren Feathers', css: '#3b82d6', ink: '#fff', vals: [1, 2, 4] },
  R: { id: 'R', name: 'Scarlet Cap', plural: 'Scarlet Caps', css: '#d6392f', ink: '#fff', vals: [1, 2, 4] },
  Y: { id: 'Y', name: 'Sunroot', plural: 'Sunroots', css: '#f2c230', ink: '#4a3410', vals: [1, 2, 4] },
  P: { id: 'P', name: 'Dusk Sigh', plural: 'Dusk Sighs', css: '#8a55c4', ink: '#fff', vals: [1] },
  K: { id: 'K', name: 'Cinder Moth', plural: 'Cinder Moths', css: '#3a3238', ink: '#f4efe2', vals: [1] }
};
var SUPPLY = { W1: 20, W2: 8, W3: 4, O1: 22, G1: 15, G2: 8, G4: 13, B1: 12, B2: 8, B4: 10, R1: 12, R2: 8, R4: 10, Y1: 13, Y2: 8, Y4: 10, P1: 17, K1: 17 };
var START_BAG = { W1: 4, W2: 2, W3: 1, O1: 1, G1: 1 };
var SHOP_COLORS = ['O', 'G', 'B', 'R', 'Y', 'P', 'K'];       // buyable colours (white never is)
var BOOK_ROUND = { O: 1, K: 1, G: 1, B: 1, R: 1, Y: 2, P: 3 };   // the first round whose buying phase may use the book

// ---- ingredient books. price = cost of the 1-chip, 2-chip, 4-chip (a single number: only a 1-chip exists).
// eff = engine handler key. title/text are our own wording.
var BOOKS = {
  O: { 0: { price: [3], eff: 'none', title: 'Plain filler', text: 'No power. It just fills one space. The cheapest chip in the shop.' } },
  K: {
    0: { price: [10], eff: 'black', title: 'Moth count', text: 'After everyone has stopped, compare black chips. 2 players: equal to your rival, droplet one space; more than your rival, droplet and a ruby. 3 or 4 players: more than the player on your left or on your right, droplet one space; more than both, droplet and a ruby. You need at least one black chip.' }
  },
  G: {
    1: { price: [4, 8, 14], eff: 'g1', title: 'Ruby moss', text: 'After the brew, take 1 ruby for each green chip that is your last or your second-to-last chip. Its number does not matter.' },
    2: { price: [6, 11, 18], eff: 'g2', title: 'Gift moss', text: 'After the brew, for each green chip that is last or second-to-last put a free chip in your bag: a green 1 gives an orange 1; a green 2 gives a blue 1 or a red 1; a green 4 gives a yellow 1 or a purple 1 (only if that book is already out).' },
    3: { price: [6, 11, 18], eff: 'g3', title: 'Lucky-seven moss', text: 'After the brew, if your white chips add up to exactly 7, add the numbers of all green chips in your pot and slide your last chip forward that many spaces.' },
    4: { price: [4, 8, 14], eff: 'g4', title: 'Drip moss', text: 'After the brew, for each green chip that is last or second-to-last you may pay 1 ruby to move your droplet forward one space.' }
  },
  B: {
    1: { price: [5, 10, 19], eff: 'b1', title: 'Peek and pick', text: 'When it lands, draw as many extra chips from your bag as its number (1, 2 or 4). Place one of them as your next chip, with its power, or none. The rest go back into the bag.' },
    2: { price: [5, 10, 19], eff: 'b2', title: 'Safe harbour', text: 'For the next chips after it (as many as its number: 1, 2 or 4), if your pot explodes you still get the victory points and the coins, but no bonus die. Covers do not add up: the longer remaining one counts.' },
    3: { price: [4, 8, 14], eff: 'b3', title: 'Ruby catcher', text: 'If it lands on a ruby space, take 1 ruby. Its number does not matter.' },
    4: { price: [5, 10, 20], eff: 'b4', title: 'Ruby hoard', text: 'If it lands on a ruby space, score victory points equal to its number: 1, 2 or 4.' }
  },
  R: {
    1: { price: [6, 10, 16], eff: 'r1', title: 'Marrow booster', text: 'It slides extra spaces by the number of orange chips already in your pot: 1 or 2 oranges give +1, 3 or more give +2.' },
    2: { price: [4, 8, 14], eff: 'r2', title: 'Side pocket', text: 'Set it beside your pot instead. After you stop (even if exploded) you may add it after your last chip, moving by its number. Or keep it beside the pot for a later round, or put it back in the bag any time.' },
    3: { price: [5, 9, 15], eff: 'r3', title: 'Pod pusher', text: 'If the chip just before it is white, add that white chip\'s number to this chip\'s move.' },
    4: { price: [7, 11, 17], eff: 'r4', title: 'Pod skipper', text: 'Once a red chip is in your pot, every white 1 you draw later moves 2 spaces (it still counts only 1 for the explosion).' }
  },
  Y: {
    1: { price: [8, 12, 18], eff: 'y1', title: 'Kind cut', text: 'If it is drawn right after a white chip, you may put that white chip back in the bag. Its space stays empty and the yellow chip stays where it is.' },
    2: { price: [9, 13, 19], eff: 'y2', title: 'Double step', text: 'The next chip you place moves twice as far as its number.' },
    3: { price: [8, 12, 18], eff: 'y3', title: 'Roomier pot', text: 'With one yellow chip in your pot the explosion limit is 8, with three or more it is 9.' },
    4: { price: [8, 12, 18], eff: 'y4', title: 'Sunroot stretch', text: 'Your 1st yellow chip in the pot moves 1 extra space, your 2nd moves 2 extra, your 3rd moves 3 extra. Later ones get nothing.' }
  },
  P: {
    1: { price: [9], eff: 'p1', title: 'Gentle sigh', text: 'After the brew, count purple chips: 1 gives 1 VP; 2 give 1 VP and a ruby; 3 or more give 2 VP and a droplet step. You may take a lower reward.' },
    2: { price: [12], eff: 'p2', title: 'Trade wind', text: 'After the brew, hand in purple chips: 1 gives a black 1, 1 VP and a ruby; 2 give a green 1, a blue 2, 3 VP and a droplet step; 3 give a yellow 4, 6 VP, a ruby and two droplet steps. You may hand in fewer than you have, but not use the 2-reward twice.' },
    3: { price: [10], eff: 'p3', title: 'Deep sigh', text: 'After the brew, each purple chip scores by its space: spaces 0-9 give 0 VP, 10-19 give 1, 20-29 give 2, 30 and up give 3.' },
    4: { price: [11], eff: 'p4', title: 'Upgrade sigh', text: 'After the brew: 1 purple lets you swap one 1-chip of your pot for the 2-chip of the same colour; 2 purples swap a 2-chip for the 4-chip; 3 or more swap a 1-chip for a 4-chip. The new chip goes into your bag.' }
  }
};
var SET_NAMES = { 1: 'Beginner set', 2: 'Set 2', 3: 'Set 3', 4: 'Set 4' };

// ---- fortune cards: kind 'blue' lasts the round, 'purple' happens at once. eff = engine key.
var FORTUNE = [
  { id: 'lucky7', kind: 'blue', name: 'Lucky Seven', text: 'If your white chips add up to exactly 7 when you stop, move your droplet one space.', ref: 'Bubbling Over' },
  { id: 'spilled', kind: 'blue', name: 'Spilled Brew', text: 'If your pot explodes this round, the player on your left takes any 2-chip from the shop.', ref: 'Toil and Trouble' },
  { id: 'doover', kind: 'blue', name: 'Do-Over', text: 'Right after your 5th chip you may tip all your chips back into the bag and start the round again. Once.', ref: 'Second Chances' },
  { id: 'twice', kind: 'blue', name: 'Twice Rolled', text: 'Whoever rolls the bonus die this round rolls it twice and gets both results.', ref: 'Double Double' },
  { id: 'thick', kind: 'blue', name: 'Thick Skin', text: 'The explosion limit is 9 this round instead of 7.', ref: 'Portentous Potables' },
  { id: 'marrowfair', kind: 'blue', name: 'Marrow Fair', text: 'This round every orange chip moves 1 extra space.', ref: 'Pumpkin Party' },
  { id: 'peek', kind: 'blue', name: 'Peek and Pick', text: 'If you stop without exploding, draw up to 5 chips from your bag and place one of them.', ref: 'Safety Procedure' },
  { id: 'glint', kind: 'blue', name: 'Ruby Glint', text: 'If your scoring space shows a ruby, score 2 VP, even if your pot exploded.', ref: 'Lucky Devil' },
  { id: 'spring', kind: 'blue', name: 'Spring Water', text: 'At the end of the round every flask is refilled for free.', ref: 'Flask Rabbit' },
  { id: 'froth', kind: 'blue', name: 'Frothing Pot', text: 'This round you may put the first white chip you draw back into the bag.', ref: 'Cauldron Bubble' },
  { id: 'spark', kind: 'blue', name: 'Red Spark', text: 'If your scoring space shows a ruby, take 1 extra ruby.', ref: 'Fire Burn' },
  { id: 'pick', kind: 'purple', name: 'Pedlar\'s Pick', text: 'Take a black chip, or any 2-chip, or 3 rubies.', ref: 'Choices, Choices' },
  { id: 'slide', kind: 'purple', name: 'A Little Slide', text: 'Move your droplet forward one space.', ref: 'Drop It' },
  { id: 'swap', kind: 'purple', name: 'Swap Stall', text: 'You may trade 1 ruby for any 1-chip except purple and black.', ref: 'Wheeling and Dealing' },
  { id: 'alms', kind: 'purple', name: 'Kind Alms', text: 'The player or players with the fewest rubies take 1 ruby.', ref: 'Charity' },
  { id: 'underdog', kind: 'purple', name: 'Underdog Gift', text: 'The player or players with the fewest victory points take a green 1.', ref: 'Beginner\'s Luck' },
  { id: 'clear', kind: 'purple', name: 'Clear the Pods', text: 'Score 4 VP, or take one white 1 out of your bag.', ref: 'Boomberry Cleanse' },
  { id: 'swarm', kind: 'purple', name: 'Rat Swarm', text: 'Count your rat tails again: move your rat stone that many extra spaces.', ref: 'Infestation' },
  { id: 'dip', kind: 'purple', name: 'Lucky Dip', text: 'Everyone draws 5 chips. The lowest total takes a blue 2, everyone else takes a ruby. Chips go back.', ref: 'Less is More' },
  { id: 'bribe', kind: 'purple', name: 'Rat Bribe', text: 'You may move your rat stone back 1 to 3 spaces and take that many rubies.', ref: 'Good Start' },
  { id: 'bounty', kind: 'purple', name: 'Rat Bounty', text: 'Take any 4-chip, or score 1 VP for each rat tail you trail the leader by.', ref: 'Rat-a-Tat' },
  { id: 'fork', kind: 'purple', name: 'Fork in the Road', text: 'Move your droplet 2 spaces, or take a purple chip.', ref: 'Decisions, Decisions' },
  { id: 'dice', kind: 'purple', name: 'Fairground Dice', text: 'Everyone rolls the bonus die once and takes the result.', ref: 'Take a Chance' },
  { id: 'haggle', kind: 'purple', name: 'Haggler\'s Hour', text: 'Draw 4 chips. You may swap one for the next higher chip of its colour; if none can, take a green 1. Chips go back.', ref: 'Flea Market' }
];

// ---- bonus die: six faces (one repeated; which one is repeated is a guess, see rules-notes)
var DIE = ['vp1', 'vp2', 'ruby', 'ruby', 'drop', 'orange'];
var DIE_TEXT = { vp1: '1 victory point', vp2: '2 victory points', ruby: '1 ruby', drop: 'droplet one space', orange: 'a Marrow chip in your bag' };

// ---- the four fair-goers. Colours are the player colours of the box (green, yellow, blue, red).
var CHARS = [
  { id: 'wynne', name: 'Wynne', color: 'green', css: '#3fa04a', title: 'The Moss Herbalist', story: 'Wynne grows everything she brews on her own window sill and talks to each plant by name.', like: 'Choose Wynne if you like steady, patient play.' },
  { id: 'odo', name: 'Odo', color: 'yellow', css: '#e8b425', title: 'The Root Dealer', story: 'Odo digs sunroots at dawn and sells them by noon, always with a story about how rare they are.', like: 'Choose Odo if you like a quick sale and a big pot.' },
  { id: 'tamsin', name: 'Tamsin', color: 'blue', css: '#3b82d6', title: 'The Feather Seer', story: 'Tamsin reads the fair by the wren feathers that drift past her stall and is right more often than she admits.', like: 'Choose Tamsin if you like clever tricks.' },
  { id: 'mirabel', name: 'Mirabel', color: 'red', css: '#d6392f', title: 'The Fire Brewer', story: 'Mirabel says a pot that never bubbles over is a pot that never tried.', like: 'Choose Mirabel if you like living dangerously.' }
];

CF.DATA = {
  game: 'Cauldron Fair', rounds: 9, limit: 7, maxPlayers: 4, LAST_CHIP: 52, SPOON: 53, TRACK_LEN: 54,
  COINS: COINS, VP: VP, RUBY: RUBY, RUBY_AT: RUBY_AT,
  COLORS: COLORS, SUPPLY: SUPPLY, START_BAG: START_BAG, SHOP_COLORS: SHOP_COLORS, BOOK_ROUND: BOOK_ROUND,
  BOOKS: BOOKS, SET_NAMES: SET_NAMES, FORTUNE: FORTUNE, DIE: DIE, DIE_TEXT: DIE_TEXT, CHARS: CHARS,
  startRubies: 1, dropletCost: 2, flaskCost: 2, endCoinsPerVp: 5, endRubiesPerVp: 2, extraWhiteRound: 6,
  rubySpend: 2,
  // rat tails hang on the scoring track after every even number (after 0, 2, 4, ...): between marker positions e and e+1.
  ratTails: function (mine, leader) { var n = 0; for (var e = Math.ceil(mine / 2) * 2; e + 1 <= leader; e += 2) n++; return n; }
};
if (typeof module === 'object' && module.exports) module.exports = CF.DATA;
})(typeof globalThis !== 'undefined' ? globalThis : this);
