// Cauldron Fair static data. Internal `id` strings are for code only; players see `name` and `text`.
// All tables and card effects here are our own design (see rules-notes.md). Real-game names are NOT in this file.
(function (g) {
var CF = g.CF = g.CF || {};

// ---- the cauldron track: 54 spaces, index 0 = where the droplet starts, 53 = the spoon (last scoring space).
// Chips can sit on indexes 1..52 (LAST_CHIP); a chip that would go further stays on 52. The scoring space is the one after the last chip.
var COINS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 22, 22, 23, 23, 24, 24, 25, 25, 26, 26, 27, 28, 28, 29, 29, 30, 30, 31, 31, 32, 33, 33, 34];
var VP = [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 6, 6, 6, 7, 7, 7, 8, 8, 8, 8, 9, 9, 9, 10, 10, 10, 11, 11, 11, 12, 12, 12, 13, 13, 13, 13, 14, 14, 14, 15, 15];
var RUBY_AT = [5, 8, 11, 15, 19, 22, 26, 29, 33, 37, 40, 44, 47, 49, 51];
var RUBY = COINS.map(function (_, i) { return RUBY_AT.indexOf(i) >= 0 ? 1 : 0; });

// ---- chips. Colour letters: W white, O orange, G green, B blue, R red, Y yellow, P purple, K black.
// supply = how many chips of that (colour,value) exist in the box.
var COLORS = {
  W: { id: 'W', name: 'Fizzpod', plural: 'Fizzpods', css: '#f4efe2', ink: '#5b3a24', vals: [1, 2, 3], blurb: 'Explosive. Too many and the pot explodes.' },
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
  O: { 0: { price: [3], eff: 'none', title: 'Plain filler', text: 'No power. It fills one space. The cheapest chip.' } },
  K: {
    0: { price: [9], eff: 'black', title: 'Moth count', text: 'When everyone has stopped, compare black chips. You need at least one. Two players: tie your rival, droplet one space. Beat your rival: droplet and a ruby. Three or four: beat either neighbour, droplet one space. Beat both neighbours: droplet and a ruby.' }
  },
  G: {
    1: { price: [4, 7, 13], eff: 'g1', title: 'Ruby moss', text: 'After the brew, check your last two chips. Take 1 ruby per green chip there. Its number does not matter.' },
    2: { price: [5, 10, 17], eff: 'g2', title: 'Gift moss', text: 'After the brew, check your last two chips. Each green chip there gives a free chip. Green 1: an orange 1. Green 2: a blue 1 or a red 1. Green 4: a yellow 1 or a purple 1. That book must be out already.' },
    3: { price: [7, 11, 17], eff: 'g3', title: 'Steady-six moss', text: 'After the brew, do your white chips total 5 or 6? Add up your green chips. Slide your last chip forward that many spaces.' },
    4: { price: [3, 7, 13], eff: 'g4', title: 'Drip moss', text: 'After the brew, check your last two chips. Per green chip there, pay 1 ruby to move your droplet.' }
  },
  B: {
    1: { price: [5, 9, 17], eff: 'b1', title: 'Peek and pick', text: 'When it lands, draw that many extra chips: 1, 2 or 4. Place one as your next chip, or none. The rest go back into the bag.' },
    2: { price: [6, 10, 18], eff: 'b2', title: 'Safe harbour', text: 'It covers your next 1, 2 or 4 chips. Explode while covered? Keep points and coins. You still skip the bonus die. Covers do not add up. The longest one counts.' },
    3: { price: [3, 8, 13], eff: 'b3', title: 'Ruby catcher', text: 'If it lands on a ruby space, take 1 ruby. Its number does not matter.' },
    4: { price: [6, 10, 19], eff: 'b4', title: 'Ruby hoard', text: 'If it lands on a ruby space, score its number in points.' }
  },
  R: {
    1: { price: [5, 10, 15], eff: 'r1', title: 'Marrow booster', text: 'It moves extra for orange chips already in your pot. One orange: +1. Two or more: +2.' },
    2: { price: [4, 7, 13], eff: 'r2', title: 'Side pocket', text: 'Set it beside your pot. After you stop, you may add it last. That works even if you exploded. Or keep it for a later round. You may put it back in the bag any time.' },
    3: { price: [6, 9, 14], eff: 'r3', title: 'Pod pusher', text: 'Right after a white chip? It also moves that white chip\'s number.' },
    4: { price: [6, 11, 16], eff: 'r4', title: 'Pod skipper', text: 'Once it is in your pot, later white 1s move 2 spaces. They still count 1 towards exploding.' }
  },
  Y: {
    1: { price: [7, 12, 17], eff: 'y1', title: 'Send a white back', text: 'Drawn right after a white chip? You may put that white back. Its space stays empty. The yellow chip stays put.' },
    2: { price: [8, 13, 18], eff: 'y2', title: 'Double step', text: 'The next chip you place moves twice as far as its number.' },
    3: { price: [9, 12, 17], eff: 'y3', title: 'Roomier pot', text: 'One or two yellow chips in your pot: you explode past 8. Three or more: past 9.' },
    4: { price: [7, 11, 17], eff: 'y4', title: 'Sunroot stretch', text: 'Your 1st yellow moves 1 extra space. Your 2nd, 3rd and 4th move 2 extra. Later ones get nothing.' }
  },
  P: {
    1: { price: [8], eff: 'p1', title: 'Gentle sigh', text: 'After the brew, count purple chips. One: 1 ruby. Two: 1 VP and a droplet step. Three or more: 2 VP and a ruby. You may take less.' },
    2: { price: [11], eff: 'p2', title: 'Trade wind', text: 'After the brew, you may hand in purple chips. One: a red 1 and 2 rubies. Two: a green 2, a red 2, 2 VP and a ruby. Three: a red 4, 5 VP and two droplet steps. You may hand in fewer, or mix rewards. Each reward works once a day.' },
    3: { price: [9], eff: 'p3', title: 'Deep sigh', text: 'After the brew, each purple scores by its space. Spaces 0-7: 0 VP. 8-17: 1. 18-29: 2. 30 and up: 3.' },
    4: { price: [10], eff: 'p4', title: 'Upgrade sigh', text: 'After the brew, upgrade one chip of the same colour. One purple: a 1-chip becomes a 2-chip. Two: a 2-chip becomes a 4-chip. Three or more: a 1-chip becomes a 4-chip. The new chip goes into your bag.' }
  }
};
var SET_NAMES = { 1: 'Beginner set', 2: 'Set 2', 3: 'Set 3', 4: 'Set 4' };

// ---- fortune cards: kind 'blue' lasts the round, 'purple' happens at once. eff = engine key.
var FORTUNE = [
  { id: 'lucky7', kind: 'blue', name: 'Lucky Six', text: 'Stop with your white chips adding up to exactly 6? Move your droplet one space.' },
  { id: 'spilled', kind: 'blue', name: 'Tipped Cauldron', text: 'If your pot explodes, the player on your right takes any 2-chip.' },
  { id: 'doover', kind: 'blue', name: 'Fresh Start', text: 'Right after your 4th chip, you may tip them all back and start the day again, once.' },
  { id: 'twice', kind: 'blue', name: 'Lucky Roller', text: 'Whenever you roll the bonus die today, you also take 1 ruby.' },
  { id: 'thick', kind: 'blue', name: 'Sturdy Pot', text: 'The white limit is 8 today instead of 7.' },
  { id: 'marrowfair', kind: 'blue', name: 'Root Market', text: 'Today every orange chip and every green 1-chip moves 1 extra space.' },
  { id: 'peek', kind: 'blue', name: 'Quick Look', text: 'Stop safely? Draw up to 4 chips and place one of them.' },
  { id: 'glint', kind: 'blue', name: 'Ruby Gleam', text: 'If your scoring space shows a ruby and your pot did not explode, score 3 points.' },
  { id: 'spring', kind: 'blue', name: 'Rain Barrel', text: 'At the end of the day every empty flask refills free, unless its owner exploded.' },
  { id: 'froth', kind: 'blue', name: 'Second Skim', text: 'Today you may put your second white chip back in the bag.' },
  { id: 'spark', kind: 'blue', name: 'Ember Spark', text: 'If your scoring space shows a ruby, take 2 extra rubies.' },
  { id: 'pick', kind: 'purple', name: 'Pedlar\'s Pick', text: 'Take a black chip, any 2-chip, or 4 rubies.' },
  { id: 'slide', kind: 'purple', name: 'Tailwind', text: 'Move your droplet forward one space, or two if you are furthest back.' },
  { id: 'swap', kind: 'purple', name: 'Ruby Trader', text: 'You may pay 1 ruby for any orange, green, blue, red or yellow 1-chip.' },
  { id: 'alms', kind: 'purple', name: 'Poor Box', text: 'Each player with the fewest rubies takes 2 rubies.' },
  { id: 'underdog', kind: 'purple', name: 'Helping Hand', text: 'Whoever has the fewest points takes a blue 1.' },
  { id: 'clear', kind: 'purple', name: 'Clear the Pods', text: 'Score 3 points, or take a white 1 out of your bag.' },
  { id: 'swarm', kind: 'purple', name: 'Rat Parade', text: 'If you are behind, count your rat tails and move your rat stone, your head start for being behind, that many spaces plus one.' },
  { id: 'dip', kind: 'purple', name: 'Grab Bag', text: 'Everyone draws 4 chips, the lowest total takes a red 2 and the others take a ruby, then the chips go back.' },
  { id: 'bribe', kind: 'purple', name: 'Hush Money', text: 'Move your rat stone, your head start for being behind, back up to 2 spaces and take 2 rubies for each space.' },
  { id: 'bounty', kind: 'purple', name: 'Rat Prize', text: 'Take any 4-chip, or score one more point than your rat tails, which count how far you trail the leader.' },
  { id: 'fork', kind: 'purple', name: 'Crossroads', text: 'Move your droplet one space and take a ruby, or take a purple chip.' },
  { id: 'dice', kind: 'purple', name: 'Carnival Dice', text: 'Everyone rolls the bonus die once, and whoever has the fewest points rolls it twice.' },
  { id: 'haggle', kind: 'purple', name: 'Market Haggle', text: 'Draw 3 chips and you may upgrade one to the next size, or take a blue 1 if none can, then the chips go back.' }
];

// ---- bonus die: six faces (one repeated; which one is repeated is a guess, see rules-notes)
var DIE = ['vp1', 'vp2', 'ruby', 'ruby', 'drop', 'orange'];   // our own six faces: the ruby shows twice
var DIE_TEXT = { vp1: '1 victory point', vp2: '2 victory points', ruby: '1 ruby', drop: 'droplet one space', orange: 'a Marrow chip in your bag' };

// ---- the four fair-goers. Colours are the player colours of the box (green, yellow, blue, red).
var CHARS = [
  { id: 'wynne', name: 'Wynne', color: 'green', css: '#3fa04a', title: 'The Moss Herbalist', story: 'Wynne grows every herb on her window sill. She names each plant.', like: 'Choose Wynne if you like steady, patient play.' },
  { id: 'odo', name: 'Odo', color: 'yellow', css: '#e8b425', title: 'The Root Dealer', story: 'Odo digs sunroots at dawn. By noon he swears they are rare.', like: 'Choose Odo if you like a quick sale and a big pot.' },
  { id: 'tamsin', name: 'Tamsin', color: 'blue', css: '#3b82d6', title: 'The Feather Seer', story: 'Tamsin reads the fair in drifting wren feathers. She is often right.', like: 'Choose Tamsin if you like clever tricks.' },
  { id: 'mirabel', name: 'Mirabel', color: 'red', css: '#d6392f', title: 'The Fire Brewer', story: 'Mirabel says a pot that never bubbles over never tried.', like: 'Choose Mirabel if you like living dangerously.' }
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
