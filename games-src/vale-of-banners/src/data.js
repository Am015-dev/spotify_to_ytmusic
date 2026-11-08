/* Vale of Banners: static data (node + page). Original names only. */
var VB = (typeof VB !== 'undefined') ? VB : {};
(function (V) {
  /* Estate: a hexagon of 37 spaces, 7 rows (4,5,6,7,6,5,4). Letters = space colour; digits = the die number printed on each space. */
  V.LAYOUT = [
    'SSPP', 'SBBPP', 'KBBMPP', 'KKCCBBM', 'SKCBBM', 'SKKBB', 'SPPB'];
  V.NUMS = [
    '3416', '62513', '154246', '2635153', '415624', '35134', '6152'];
  V.COL = { C: 'castle', M: 'mine', K: 'know', B: 'bld', P: 'pas', S: 'ship' };
  V.COLNAME = { castle: 'Keep', mine: 'Mine', know: 'Lore', bld: 'Building', pas: 'Pasture', ship: 'Barge' };
  V.COLHEX = { castle: '#2f5d3a', mine: '#7b7f86', know: '#e3c64a', bld: '#c9a273', pas: '#8fbf5a', ship: '#4f86c6' };
  V.REGION_PTS = [0, 1, 3, 6, 10, 15, 21, 28, 36];
  V.PHASE_BONUS = [10, 8, 6, 4, 2];
  V.COLOUR_BONUS = { 2: [5, 2], 3: [6, 3, 0], 4: [7, 4, 0, 0] };
  V.PHASES = ['Spring', 'Summer', 'Harvest', 'Autumn', 'Frost'];
  V.ANIMALS = { sheep: 'Sheep', goat: 'Goats', pig: 'Pigs', goose: 'Geese' };
  V.GOODS = ['', 'Wool', 'Cheese', 'Honey', 'Cider', 'Linen', 'Salt'];
  V.BLD = {
    hall:  { name: 'Moot Hall',      text: 'Place one more tile from your storage at once, on any free space of its colour next to your land (any number).' },
    carp:  { name: "Joiner's Yard",  text: 'Take any Building tile from a market stall into your storage.' },
    chapel:{ name: 'Bell Chapel',    text: 'Take a Keep, Mine or Lore tile from a market stall into your storage.' },
    mkt:   { name: 'Fair Green',     text: 'Take a Barge or Pasture tile from a market stall into your storage.' },
    inn:   { name: "Drovers' Inn",   text: 'Take 4 workers.' },
    mint:  { name: 'Counting House', text: 'Take 2 silver.' },
    tower: { name: 'Beacon Tower',   text: 'Score 4 points.' },
    store: { name: 'Granary',        text: 'Sell one kind of your goods at once, whatever the dice show.' }
  };
  V.BLDKEYS = ['hall', 'carp', 'chapel', 'mkt', 'inn', 'mint', 'tower', 'store'];
  /* 26 Lore tiles: each bends one rule for its owner. e = effect key read by the engine. */
  V.KNOW = [
    { id: 'k1',  name: "Drover's Almanac",  e: 'wk+1',     text: 'When you take workers, take 1 more.' },
    { id: 'k2',  name: "Merchant's Ledger", e: 'saleSil',  text: 'When you sell goods, take 1 more silver.' },
    { id: 'k3',  name: "Weigher's Scale",   e: 'saleVP',   text: 'When you sell goods, score 1 more point per tile.' },
    { id: 'k4',  name: "Pilot's Chart",     e: 'shipVP',   text: 'When you place a Barge, score 2 points.' },
    { id: 'k5',  name: "Delver's Lamp",     e: 'mineWk',   text: 'At the end of each season, take 1 worker per Mine.' },
    { id: 'k6',  name: "Carter's Rule",     e: 'take1',    text: 'Taking a tile: change the die by 1 for free.' },
    { id: 'k7',  name: "Mason's Rule",      e: 'place1',   text: 'Placing a tile: change the die by 1 for free.' },
    { id: 'k8',  name: 'Larder Plans',      e: 'store4',   text: 'Your storage holds 4 tiles instead of 3.' },
    { id: 'k9',  name: "Smuggler's Wink",   e: 'black1',   text: 'The back-lane stall costs you 1 silver instead of 2.' },
    { id: 'k10', name: 'Charter of Guilds', e: 'dupBld',   text: 'You may build the same kind of Building twice in one quarter.' },
    { id: 'k11', name: "Shepherd's Psalter",e: 'pasVP',    text: 'When you place a Pasture, score 2 more points.' },
    { id: 'k12', name: 'Purse Strings',     e: 'wkSil',    text: 'When you take workers, also take 1 silver.' },
    { id: 'k13', name: "Dockhand's Pact",   e: 'saleWk',   text: 'When you sell goods, also take 1 worker.' },
    { id: 'k14', name: 'Harbour Toll',      e: 'shipSil',  text: 'When you place a Barge, take 1 silver.' },
    { id: 'k15', name: 'Seam Map',          e: 'mineVP',   text: 'At the end of each season, score 1 point per Mine.' },
    { id: 'k16', name: 'Steady Hands',      e: 'wk2',      text: 'Each worker changes a die by up to 2.' },
    { id: 'k17', name: 'Roll of the Moot',      e: 'end:hall',   text: 'Game end: 3 points per Moot Hall.' },
    { id: 'k18', name: 'Roll of the Joiners',   e: 'end:carp',   text: "Game end: 3 points per Joiner's Yard." },
    { id: 'k19', name: 'Roll of the Bells',     e: 'end:chapel', text: 'Game end: 3 points per Bell Chapel.' },
    { id: 'k20', name: 'Roll of the Fair',      e: 'end:mkt',    text: 'Game end: 3 points per Fair Green.' },
    { id: 'k21', name: 'Roll of the Drovers',   e: 'end:inn',    text: "Game end: 3 points per Drovers' Inn." },
    { id: 'k22', name: 'Roll of the Counters',  e: 'end:mint',   text: 'Game end: 3 points per Counting House.' },
    { id: 'k23', name: 'Roll of the Beacons',   e: 'end:tower',  text: 'Game end: 3 points per Beacon Tower.' },
    { id: 'k24', name: 'Roll of the Granaries', e: 'end:store',  text: 'Game end: 3 points per Granary.' },
    { id: 'k25', name: 'Tradebook',         e: 'end:sold', text: 'Game end: 1 point per goods tile you sold.' },
    { id: 'k26', name: 'Bestiary',          e: 'end:beast',text: 'Game end: 4 points per kind of animal on your land.' }
  ];
  V.KNOWBY = {}; V.KNOW.forEach(function (k) { V.KNOWBY[k.id] = k; });
  V.KEEP = { name: 'Keep', text: 'Take one extra action at once, as if you had a die showing any number you like.' };
  V.MINE = { name: 'Mine', text: 'At the end of every season, take 1 silver.' };
  V.SHIP = { name: 'Barge', text: 'Take all goods from one market stall, and move 1 step up the banner track.' };
  V.PAS = { name: 'Pasture', text: 'Score the animals of this kind in this meadow (this tile included).' };
  /* Tile pool: the published mix of 164 hexagon tiles. 26 barges, 12 mines, 16 keeps, 26 lore, 28 pastures (7 per kind), 56 buildings (7 per kind).
     40 of them have a black back (b:true) and are only dealt to the back lane: 6 barges, 2 mines, 2 keeps, 6 lore, 8 pastures, 16 buildings.
     The six numbered stalls are filled from the other 124 (24 per season at 4 players, 120 in all). */
  V.BLACKKNOW = ['k2', 'k7', 'k12', 'k17', 'k22', 'k26'];
  V.PASNUMS = [2, 2, 3, 3, 3, 4, 4];   /* animals on the 7 tiles of each kind; the first and last are black-backed */
  V.pool = function () {
    var t = [], id = 0, i;
    function add(o, black) { o.id = 't' + (id++); if (black) o.b = true; t.push(o); }
    for (i = 0; i < 16; i++) add({ t: 'castle' }, i < 2);
    for (i = 0; i < 12; i++) add({ t: 'mine' }, i < 2);
    V.KNOW.forEach(function (kn) { add({ t: 'know', k: kn.id }, V.BLACKKNOW.indexOf(kn.id) >= 0); });
    V.BLDKEYS.forEach(function (b) { for (i = 0; i < 7; i++) add({ t: 'bld', k: b }, i < 2); });
    Object.keys(V.ANIMALS).forEach(function (a) { V.PASNUMS.forEach(function (n, j) { add({ t: 'pas', k: a, n: n }, j === 0 || j === 6); }); });
    for (i = 0; i < 26; i++) add({ t: 'ship' }, i < 6);
    return t;
  };
  V.tileName = function (x) {
    if (!x) return '';
    if (x.t === 'bld') return V.BLD[x.k].name;
    if (x.t === 'know') return V.KNOWBY[x.k].name;
    if (x.t === 'pas') return x.n + ' ' + V.ANIMALS[x.k];
    return { castle: 'Keep', mine: 'Mine', ship: 'Barge' }[x.t];
  };
  V.tileText = function (x) {
    if (!x) return '';
    if (x.t === 'bld') return V.BLD[x.k].text + ' A quarter may not hold two of the same Building.';
    if (x.t === 'know') return V.KNOWBY[x.k].text;
    if (x.t === 'pas') return V.PAS.text;
    return { castle: V.KEEP.text, mine: V.MINE.text, ship: V.SHIP.text }[x.t];
  };
  /* asset stem for a tile picture */
  V.tileStem = function (x) {
    if (!x) return '';
    if (x.t === 'bld') return 'tile-bld-' + x.k;
    if (x.t === 'know') return 'tile-lore-' + x.k;
    if (x.t === 'pas') return 'tile-pas-' + x.k + '-' + x.n;
    return 'tile-' + ({ castle: 'keep', mine: 'mine', ship: 'barge' }[x.t]);
  };
  V.CAST = {
    you:   { name: 'You' },
    wren:  { name: 'Wren', title: 'the young steward' },
    odo:   { name: 'Old Odo', title: 'the reeve' },
    cass:  { name: 'Cass Ferrow', title: 'the barge-mistress' },
    hask:  { name: 'Lord Haskel', title: 'the castle-builder' },
    marla: { name: 'Marla Venn', title: 'the shepherd queen' },
    ivo:   { name: 'Ivo Grath', title: 'the silver baron' }
  };
  V.SEATCOL = ['#c0392b', '#2e6fb8', '#d9a21b', '#6b3fa0'];
  V.SEATNAME = ['Crimson', 'Azure', 'Saffron', 'Violet'];
})(VB);
if (typeof module !== 'undefined') module.exports = VB;
