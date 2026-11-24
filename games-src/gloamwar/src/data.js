/* Gloamwar static data (node + page). Original world, names and characters. Structure (counts, faces, tracks) follows the rules in rules-notes.md / COMPONENTS.md. */
var SIDES = { D: 'Dawn League', G: 'the Gloam' };
// pol = steps from war at start (3 top box, 0 = At War); act = active at start
var NATIONS = {
  gr: { n: 'Greenhold', short: 'Greenhold', side: 'D', pol: 3, act: true, col: '#3f6b3a', who: 'forest wardens' },
  df: { n: 'Deepforge Clans', short: 'Deepforge', side: 'D', pol: 3, act: false, col: '#8a5a2b', who: 'hill smiths' },
  au: { n: 'Aurelmont', short: 'Aurelmont', side: 'D', pol: 2, act: false, col: '#6f7e8c', who: 'white-wall kingdom' },
  hl: { n: 'Hearthlands', short: 'Hearth', side: 'D', pol: 3, act: false, col: '#6e8a34', who: 'shire folk and river towns' },
  va: { n: 'Varrn', short: 'Varrn', side: 'D', pol: 3, act: false, col: '#a8842c', who: 'horse riders' },
  pt: { n: 'Pale Throne', short: 'Throne', side: 'G', pol: 1, act: true, col: '#7a1e1e', who: 'the Ashen King' },
  cv: { n: 'Corvel', short: 'Corvel', side: 'G', pol: 1, act: true, col: '#4a4a4a', who: 'the brass magus' },
  sh: { n: 'Sundered Hosts', short: 'Hosts', side: 'G', pol: 2, act: true, col: '#a4512c', who: 'corsairs and steppe riders' } };
var NAT_ORDER = ['gr', 'df', 'au', 'hl', 'va', 'pt', 'cv', 'sh'];
// starting armies: region -> {nation: [regular, elite, leader]} ; Pale Throne leaders = Gloamriders (8 in all)
var SETUP = {
  hammerdeep: { df: [1, 2, 1] }, westdelve: { df: [1, 0, 0] }, ironreach: { df: [1, 0, 0] },
  sailhaven: { gr: [1, 1, 1] }, lanternvale: { gr: [0, 2, 1] }, oakthrone: { gr: [1, 1, 1] }, silverbough: { gr: [1, 2, 1] },
  citadel: { au: [3, 1, 1] }, seawatch: { au: [3, 0, 0] }, crossing: { au: [2, 0, 0] }, brinemouth: { au: [1, 0, 0] },
  kettlecross: { hl: [1, 0, 0] }, ferrystone: { hl: [1, 0, 0] }, brightwater: { hl: [1, 0, 1] }, northmarch: { hl: [0, 1, 0] }, thistledown: { hl: [1, 0, 0] },
  hallowmead: { va: [1, 1, 0] }, fords: { va: [2, 0, 1] }, shieldkeep: { va: [1, 0, 0] },
  corvel: { cv: [4, 1, 0] }, nbrass: { cv: [1, 0, 0] }, sbrass: { cv: [1, 0, 0] },
  spire: { pt: [4, 1, 1] }, gallowmere: { pt: [5, 1, 1] }, cinderplain: { pt: [3, 0, 0] }, wraithpass: { pt: [5, 0, 1] }, hollowdeep: { pt: [2, 0, 0] },
  cragmaw: { pt: [2, 0, 0] }, ashfields: { pt: [2, 0, 0] }, blackgate: { pt: [5, 0, 1] },
  dunesreach: { sh: [3, 1, 0] }, saltfang: { sh: [3, 0, 0] }, steppegate: { sh: [2, 0, 0] }, khazmar: { sh: [3, 1, 0] }, redsand: { sh: [3, 1, 0] } };
// reinforcements at start [regular, elite, leader]
var REINF = { df: [2, 3, 3], gr: [2, 4, 0], au: [6, 4, 3], hl: [6, 4, 3], va: [6, 4, 3], cv: [6, 5, 0], pt: [8, 4, 4], sh: [10, 3, 0] };
// action dice faces: C character, A army, M muster, X muster/army, E event, W will of the dawn, Y the Gaze (eye)
var FACES = { D: ['C', 'C', 'M', 'X', 'E', 'W'], G: ['C', 'A', 'M', 'X', 'E', 'Y'] };
var FACE_NAME = { C: 'Character', A: 'Army', M: 'Muster', X: 'Muster or Army', E: 'Event', W: 'Will of the Dawn', Y: 'The Gaze' };
var DICE0 = { D: 4, G: 7 }, DICEMAX = { D: 6, G: 10 };
// the Lantern Company and the other characters. lv = level (moves / hunt absorb), ld = leadership. Abilities are our own.
var CHARS = {
  orrin: { n: 'Orrin the Lamplighter', short: 'Orrin', lv: 3, ld: 1, nat: null, start: 'F', icon: 'staff', guide: 'After you play a card with an Event die, draw a card of the same deck type.', out: 'Adds +1 die in a battle where he stands (max 5).' },
  kestrel: { n: 'Kestrel the Ranger', short: 'Kestrel', lv: 3, ld: 1, nat: null, start: 'F', icon: 'bow', guide: 'Numbered hunt tiles with a reveal mark do not reveal the Company.', out: 'Adds +1 die in a battle where she stands. Can be crowned.' },
  darian: { n: 'Darian of Aurelmont', short: 'Darian', lv: 2, ld: 1, nat: 'au', start: 'F', icon: 'sword', guide: 'If a hunt deals 2 or more taint, reduce it by 1 once per turn.', out: 'Battles he joins in Aurelmont or Varrn: one extra leader re-roll.' },
  sylwen: { n: 'Sylwen of the Greenhold', short: 'Sylwen', lv: 2, ld: 1, nat: 'gr', start: 'F', icon: 'oak', guide: 'Gloamriders in the Company\'s region give no hunt re-roll.', out: 'First battle round: one of her army\'s misses becomes a hit.' },
  brokk: { n: 'Brokk Deepforge', short: 'Brokk', lv: 2, ld: 1, nat: 'df', start: 'F', icon: 'axe', guide: 'Gloam armies in the Company\'s region give no hunt re-roll.', out: 'His army ignores the first hit it takes each battle.' },
  pell: { n: 'Pell Underhill', short: 'Pell', lv: 1, ld: 1, nat: null, start: 'F', icon: 'bindle', guide: 'Once per turn, change the guide before a hunt tile is taken.', out: 'Wakes any Dawn nation he enters (city or stronghold).' },
  hobb: { n: 'Hobb Brightwater', short: 'Hobb', lv: 1, ld: 1, nat: null, start: 'F', icon: 'candle', guide: 'When the Company is revealed, you may move it 1 region less.', out: 'Wakes any Dawn nation he enters (city or stronghold).' },
  queen: { n: 'Kestrel, Crowned Queen', short: 'Queen', lv: 3, ld: 2, nat: null, start: 'out', icon: 'crown', guide: '', out: 'Adds +1 die in battles. Gives the Dawn League one more action die.', die: 'D' },
  kindled: { n: 'Orrin the Kindled', short: 'Kindled', lv: 3, ld: 1, nat: null, start: 'out', icon: 'fire', guide: '', out: 'Moves 4 alone. Can cancel all Gloamrider leadership in a battle. One more action die.', die: 'D' },
  wretch: { n: 'The Hollow Wretch', short: 'Wretch', lv: 0, ld: 0, nat: null, start: 'out', icon: 'ghost', guide: 'Guides only when no companions remain. Once per turn: reveal the Company to cut a hunt by 1.', out: '' },
  vael: { n: 'Vael the Brass Magus', short: 'Vael', lv: 0, ld: 1, nat: 'cv', start: 'out', side: 'G', icon: 'pointy', out: 'Never leaves Corvel Tower. Corvel regulars there fight as elites. One more action die.', die: 'G' },
  marshal: { n: 'The Wraith-Marshal', short: 'Marshal', lv: 99, ld: 2, nat: 'pt', start: 'out', side: 'G', icon: 'wraith', out: 'Flies like a Gloamrider. After a battle where you played a combat card, draw a card. One more action die.', die: 'G' },
  voice: { n: 'The Voice of the Throne', short: 'Voice', lv: 3, ld: 2, nat: 'pt', start: 'out', side: 'G', icon: 'skull', out: 'Moves 3 and ignores armies when alone. Once per turn: turn a Muster die into an Army die. One more action die.', die: 'G' } };
var COMPANIONS = ['orrin', 'kestrel', 'darian', 'sylwen', 'brokk', 'pell', 'hobb'];
var MINIONS = ['vael', 'marshal', 'voice'];
// hunt tiles. v: number | 'eye' | 'die'; r: reveals; stop: blocks a step on the Ashen Road. [unverified split, see rules-notes]
var HUNT_STD = [{ v: 'eye' }, { v: 'eye' }, { v: 'eye' }, { v: 'eye' }, { v: 0 }, { v: 0 }, { v: 1 }, { v: 1 }, { v: 1, r: 1 }, { v: 1, r: 1 }, { v: 2 }, { v: 2, r: 1 }, { v: 2, r: 1 }, { v: 3 }, { v: 3 }, { v: 3 }];
var HUNT_SPECIAL = {   // added by event cards, enter the pool when the Company reaches the Ashen Road
  dlantern: { v: -2, side: 'D', n: 'Hooded lantern' }, dcloak: { v: -1, side: 'D', n: 'Ashcloth cloaks' }, drope: { v: 0, side: 'D', n: 'Knotted rope', r: 0 }, dmoss: { v: -1, side: 'D', n: 'Bitter moss' },
  gcoil: { v: 'die', side: 'G', n: 'The coil', stop: 1 }, gcrown: { v: 'die', side: 'G', n: 'The crown calls', stop: 1, r: 1 }, gmaw: { v: 3, side: 'G', n: 'Cave maw', stop: 1 }, gwatch: { v: 1, side: 'G', n: 'Watchers', stop: 1, r: 1 } };
var ROAD_STEPS = 5;           // steps on the Ashen Road to the Kiln of Kaldur
var VP = { city: 1, strong: 2 }, VPWIN = { G: 10, D: 4 }, TAINT_MAX = 12;
var REG = {}; REGIONS.forEach(function (r) { REG[r.id] = r; });
var ELF_START = 'lanternvale';
