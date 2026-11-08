/* Redline Rally data: drivers, tracks (waypoints in a 2000x1200 world; third number = corner speed limit), card rules. */
var COLS = [
  { id: 'crimson', hex: '#d83a3a' }, { id: 'azure', hex: '#2f7be0' }, { id: 'jade', hex: '#2ea86b' },
  { id: 'amber', hex: '#e8a824' }, { id: 'violet', hex: '#8a52d6' }, { id: 'graphite', hex: '#59626e' }
];
var DRIVERS = [
  { id: 'kit', name: 'Kit Marlow', tag: 'Smooth and patient' },
  { id: 'juno', name: 'Juno Vega', tag: 'Late on the brakes' },
  { id: 'dax', name: 'Dax Orrin', tag: 'Hates traffic' },
  { id: 'pia', name: 'Pia Rask', tag: 'Lives in the slipstream' },
  { id: 'oto', name: 'Oto Lind', tag: 'Cold engine, calm head' },
  { id: 'bex', name: 'Bex Hollis', tag: 'All gas, no fear' }
];
var TRACKDEFS = {
  sunline: {
    name: 'Sunline Speedway', blurb: 'Fast and flowing. Big straights, wide corners.', N: 48,
    pts: [[600, 1050], [1100, 1060], [1600, 1040], [1820, 930, 5], [1900, 700, 6], [1780, 480, 4], [1480, 400], [1250, 300, 5], [950, 180], [600, 170, 6], [320, 300, 4], [210, 560], [260, 820, 5], [250, 1000, 4]]
  },
  hairpin: {
    name: 'Hairpin Hill', blurb: 'Technical. Tight bends punish every point over.', N: 64,
    pts: [[500, 1040], [1000, 1060], [1450, 1030], [1750, 900, 4], [1800, 720, 3], [1500, 620, 2], [1100, 700], [900, 820], [650, 760, 3], [450, 640], [600, 480, 2], [1000, 420], [1400, 380], [1700, 260, 3], [1500, 140, 2], [900, 130], [400, 200], [220, 400, 3], [200, 700], [250, 900, 3]]
  }
};
TRACKDEFS.harbour = { name: 'Harbour Ring', blurb: 'Medium. One long straight, a tight chicane.', N: 56, pts: [[450, 1050], [1000, 1070], [1550, 1050], [1800, 900, 4], [1750, 650, 5], [1450, 560], [1250, 640, 3], [1050, 520, 3], [1300, 350], [1650, 230, 5], [1300, 120], [700, 140], [350, 260, 4], [200, 550], [260, 860, 5]] };
TRACKDEFS.practice = { name: 'Practice Loop', blurb: 'Short loop for learning.', N: 30, hidden: true, pts: [[500, 1000], [1000, 1010], [1500, 990], [1780, 850, 5], [1800, 500], [1500, 300, 4], [1000, 250], [500, 300], [250, 500], [250, 800]] };
var HAND = 7, GEARS = 4, ENGINE0 = 6;
var COOL = { 1: 3, 2: 1, 3: 0, 4: 0 };   /* heat cards returned from hand to engine when you play in this gear */

/* Upgrade cards (optional "Upgrades" mode): drafted before the race, shuffled into your deck, played like a speed card. Card string = 'u:<id>'.
   sp = speed it adds, cool = extra heat cards returned from hand to engine when played, lim = corner limits raised this move, stress = stress cards added to your discard. */
var UPG = {
  coolant: { sn: 'Cool', name: 'Coolant Line', sp: 1, cool: 2, lim: 0, stress: 0, txt: 'Speed 1. Cools 2 more heat.' },
  pit: { sn: 'Pit', name: 'Pit Crew', sp: 0, cool: 3, lim: 0, stress: 0, txt: 'Speed 0. Cools 3 heat.' },
  grip: { sn: 'Grip', name: 'Grip Tyres', sp: 2, cool: 0, lim: 1, stress: 0, txt: 'Speed 2. Corner limits +1 this move.' },
  brakes: { sn: 'Brakes', name: 'Big Brakes', sp: 1, cool: 0, lim: 2, stress: 0, txt: 'Speed 1. Corner limits +2 this move.' },
  rocket: { sn: 'Rocket', name: 'Rocket Pack', sp: 5, cool: 0, lim: 0, stress: 1, txt: 'Speed 5. Adds a stress card to your discard.' },
  tuned: { sn: 'Tuned', name: 'Tuned Engine', sp: 3, cool: 1, lim: 0, stress: 0, txt: 'Speed 3. Cools 1 heat.' }
};
/* Starting upgrades (rulebook: every car shuffles 3 starting upgrade cards into its deck). The booklet gives no values: HOUSE VALUES here.
   zero = speed 0 (a safe brake card for corners), five = speed 5 (a burst), plus one heat card in the draw deck. They are not speed cards for a stress flip. */
UPG.zero = { sn: 'Brake', name: 'Brake card', sp: 0, cool: 0, lim: 0, stress: 0, start: 1, txt: 'Speed 0. A safe card for corners (starting upgrade).' };
UPG.five = { sn: 'Burst', name: 'Burst card', sp: 5, cool: 0, lim: 0, stress: 0, start: 1, txt: 'Speed 5. A big burst (starting upgrade).' };
var START_UPG = ['zero', 'five'], START_HEAT = 1;
/* Weather (optional module, HOUSE RULES, own design): one condition for the whole race. */
var WEATHER = {
  dry: { name: 'Dry', txt: 'Normal grip.', cl: 0, slip: 2, eng: 0 },
  rain: { name: 'Rain', txt: 'Wet road: corner limits 1 lower (never below 2).', cl: -1, slip: 2, eng: 0 },
  heat: { name: 'Heatwave', txt: 'Hot engines: every car starts with 1 heat card already in its discard.', cl: 0, slip: 2, eng: -1 },
  wind: { name: 'Tailwind', txt: 'Slipstream carries you 3 spaces instead of 2.', cl: 0, slip: 3, eng: 0 }
};
var WX_IDS = ['dry', 'rain', 'heat', 'wind'];
/* Championship (HOUSE VALUES): points per finishing place, tracks in order */
var CHAMP_PTS = [9, 6, 4, 3, 2, 1], CHAMP_TRACKS = ['sunline', 'hairpin', 'harbour'];
var UPG_IDS = ['coolant', 'pit', 'grip', 'brakes', 'rocket', 'tuned'], DRAFT_PICKS = 3, UPG_COPIES = 4;
/* Legends (optional): automated cars with their own rules. No hand, no engine heat, no stress. Each turn a Legend turns up the next card of its pace deck and moves
   that many spaces, braking just enough to take every corner on its path without penalty, and it always takes a slipstream boost when one is free and safe. */
var LEGEND_NAMES = ['Legend Ash', 'Legend Vale', 'Legend Crest'], LEGEND_PACE = [[3, 4, 4, 5, 5, 5, 6, 6, 7, 7, 8, 9], [4, 5, 5, 6, 6, 6, 7, 7, 8, 8, 9, 10], [5, 6, 6, 7, 7, 7, 8, 8, 9, 9, 10, 11]], LEGEND_MAX = 3;
/* Garage (optional, replaces the draft): a face-up market of GARAGE_MARKET upgrades from a pile with GARAGE_COPIES of each type; the car at the back of the grid chooses first, then the order runs
   forward, then back again (snake), GARAGE_PICKS times. A choice is taken from the market and the market is refilled from the pile. */
var GARAGE_MARKET = 6, GARAGE_COPIES = 2, GARAGE_PICKS = 2;
function upgId(x) { return x && x.charAt(1) === ':' && x.charAt(0) === 'u' ? x.slice(2) : null; }
