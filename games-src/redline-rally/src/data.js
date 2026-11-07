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
var UPG_IDS = ['coolant', 'pit', 'grip', 'brakes', 'rocket', 'tuned'], DRAFT_PICKS = 3, UPG_COPIES = 4;
function upgId(x) { return x && x.charAt(1) === ':' && x.charAt(0) === 'u' ? x.slice(2) : null; }
