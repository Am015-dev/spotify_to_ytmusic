// Vellum Shire data: the estate map (37 hexes), every tile kind with its count, goods, lore tiles, scoring tables.
// Original names only. Counts and numbers follow the original edition one for one (see COMPONENTS.md).
var VS = {
  // colour keys: K keep (dark green), F flock (light green), L lore (yellow), B barge (blue), T town (beige), Q quarry (grey)
  COL: { K: 'Keep', F: 'Pasture', L: 'Lore', B: 'Barge', T: 'Town', Q: 'Quarry' },
  COLS: ['K', 'F', 'L', 'B', 'T', 'Q'],
  // estate #1 rows top to bottom: colour letter + die number. Row widths 4,5,6,7,6,5,4 (centred hex rows).
  ROWS: [
    ['F6', 'K5', 'K4', 'L3'],
    ['F2', 'F1', 'K6', 'L5', 'T4'],
    ['F5', 'F4', 'T3', 'L1', 'T2', 'T3'],
    ['B6', 'B1', 'B2', 'K6', 'B5', 'B4', 'B1'],
    ['T2', 'T5', 'Q4', 'T3', 'T1', 'F2'],
    ['T6', 'Q1', 'L2', 'T5', 'T6'],
    ['Q3', 'L4', 'L1', 'T3']
  ],
  START: 18, // index of the centre keep (row 3, col 3)
  SIZE_PTS: [0, 1, 3, 6, 10, 15, 21, 28, 36], // completed region of n spaces
  PHASE_BONUS: [10, 8, 6, 4, 2], // chapters I..V
  SELL_VP: 2, // per goods tile, 2 players
  BIG_BONUS: 5, SMALL_BONUS: 2, // 2 players
  BLACK_PER_PHASE: 4,
  // 2-player stall contents each chapter (fixed colours, 2 tiles per numbered stall)
  STALL_COLS: { 1: ['B', 'T'], 2: ['K', 'L'], 3: ['F', 'T'], 4: ['B', 'T'], 5: ['Q', 'L'], 6: ['F', 'T'] },
  // buildings (town tiles): 8 kinds x 7 (5 plain back + 2 ink back)
  BUILD: {
    granary: { n: 'Granary', fx: 'Sell one kind of goods now.' },
    belltower: { n: 'Bell Tower', fx: '+4 points now.' },
    joinery: { n: 'Joinery', fx: 'Take a town tile from any stall.' },
    chapel: { n: 'Chapel', fx: 'Take a keep, quarry or lore tile from any stall.' },
    fair: { n: 'Fair', fx: 'Take a barge or animal tile from any stall.' },
    hostel: { n: 'Hostel', fx: '+4 workers now.' },
    counting: { n: 'Counting House', fx: '+2 silver now.' },
    guildhall: { n: 'Guildhall', fx: 'Place one more tile from storage, any die.' }
  },
  BKEYS: ['granary', 'belltower', 'joinery', 'chapel', 'fair', 'hostel', 'counting', 'guildhall'],
  ANIMALS: { sheep: 'Sheep', cow: 'Cows', pig: 'Pigs', hen: 'Hens' },
  AKEYS: ['sheep', 'cow', 'pig', 'hen'],
  ANIM_PLAIN: [2, 2, 3, 3, 4], ANIM_INK: [3, 4], // animals per tile, per kind
  GOODS: [null,
    { n: 'Wool', c: '#3c8f95' }, { n: 'Rose dye', c: '#c4577e' }, { n: 'Grain', c: '#8a6232' },
    { n: 'Wine', c: '#a8322c' }, { n: 'Woad', c: '#6a4a94' }, { n: 'Honey', c: '#d9822b' }],
  // lore tiles 1..26 (ink back: 7,12,14,15,24,25). k = effect key used by the engine.
  LORE: [null,
    { n: 'Free Charter', k: 'anyb', fx: 'A town may hold the same building twice.' },
    { n: 'Deep Seams', k: 'minew', fx: 'Each chapter end: +1 worker per quarry.' },
    { n: 'Silver Tongue', k: 'sell2', fx: 'Selling goods gives 2 silver, not 1.' },
    { n: 'Hired Porters', k: 'sellw', fx: 'Selling goods also gives 1 worker.' },
    { n: 'River Charts', k: 'ship2', fx: 'A barge may load goods from 2 stalls side by side.' },
    { n: 'Open Purse', k: 'buyall', fx: 'Buy from any stall for 2 silver (once a turn).' },
    { n: 'Shepherd’s Psalter', k: 'animal1', fx: '+1 point per animal tile scored.' },
    { n: 'Strong Backs', k: 'work2', fx: 'Each worker turns a die by up to 2.' },
    { n: 'Mason’s Square', k: 'adjT', fx: 'Free ±1 on a die to place a town tile.' },
    { n: 'Boatman’s Knot', k: 'adjBF', fx: 'Free ±1 on a die to place a barge or animal.' },
    { n: 'Lord’s Seal', k: 'adjKQL', fx: 'Free ±1 on a die to place a keep, quarry or lore.' },
    { n: 'Trader’s Eye', k: 'adjTake', fx: 'Free ±1 on a die to take a tile from a stall.' },
    { n: 'Paid Day', k: 'work1s', fx: 'Taking workers also gives 1 silver.' },
    { n: 'Full Muster', k: 'work4', fx: 'Taking workers gives 4, not 2.' },
    { n: 'Wide Trade', k: 'endKinds', fx: 'End: 3 points per goods kind you sold.' },
    { n: 'Granary Rolls', k: 'endB:granary', fx: 'End: 4 points per Granary.' },
    { n: 'Bell Rolls', k: 'endB:belltower', fx: 'End: 4 points per Bell Tower.' },
    { n: 'Joinery Rolls', k: 'endB:joinery', fx: 'End: 4 points per Joinery.' },
    { n: 'Chapel Rolls', k: 'endB:chapel', fx: 'End: 4 points per Chapel.' },
    { n: 'Fair Rolls', k: 'endB:fair', fx: 'End: 4 points per Fair.' },
    { n: 'Hostel Rolls', k: 'endB:hostel', fx: 'End: 4 points per Hostel.' },
    { n: 'Counting Rolls', k: 'endB:counting', fx: 'End: 4 points per Counting House.' },
    { n: 'Guild Rolls', k: 'endB:guildhall', fx: 'End: 4 points per Guildhall.' },
    { n: 'Bestiary', k: 'endAnim', fx: 'End: 4 points per animal kind on your estate.' },
    { n: 'Ledger', k: 'endSold', fx: 'End: 1 point per goods tile you sold.' },
    { n: 'Seal Roll', k: 'endBonus', fx: 'End: 2 points per gilded seal you won.' }],
  LORE_INK: [7, 12, 14, 15, 24, 25],
  // other parts (counts as in the original edition)
  PARTS: { keepPlain: 14, keepInk: 2, bargePlain: 20, bargeInk: 6, quarryPlain: 10, quarryInk: 2, goodsPerKind: 7, silver: 20, workers: 30, seals: 12, dice: 9, estates: 9 },
  CHAPTERS: ['I', 'II', 'III', 'IV', 'V']
};
// geometry: centre x in hex units, row y; neighbours share an edge
VS.HEX = (function () {
  var out = [];
  VS.ROWS.forEach(function (row, r) { row.forEach(function (s, c) { out.push({ i: out.length, r: r, c: c, x: c + (7 - row.length) / 2, col: s[0], d: +s[1] }); }); });
  out.forEach(function (h) { h.nb = out.filter(function (o) { return o !== h && ((o.r === h.r && Math.abs(o.x - h.x) === 1) || (Math.abs(o.r - h.r) === 1 && Math.abs(o.x - h.x) === 0.5)); }).map(function (o) { return o.i; }); });
  return out;
})();
// regions: connected same-colour spaces
VS.REGIONS = (function () {
  var reg = [], of = [];
  VS.HEX.forEach(function (h) {
    if (of[h.i] != null) return;
    var id = reg.length, q = [h.i], cells = []; of[h.i] = id;
    while (q.length) { var i = q.pop(); cells.push(i); VS.HEX[i].nb.forEach(function (n) { if (of[n] == null && VS.HEX[n].col === h.col) { of[n] = id; q.push(n); } }); }
    reg.push({ id: id, col: h.col, cells: cells.sort(function (a, b) { return a - b; }) });
  });
  VS.REG_OF = of;
  return reg;
})();
// the full tile set: every hex tile of the original box (164), with an id
VS.TILES = (function () {
  var t = [], add = function (col, ink, k, a) { t.push({ id: t.length, col: col, ink: ink, k: k || col, a: a || 0 }); };
  var i, j;
  for (i = 0; i < VS.PARTS.keepPlain; i++) add('K', 0, 'keep');
  for (i = 0; i < VS.PARTS.keepInk; i++) add('K', 1, 'keep');
  for (i = 0; i < VS.PARTS.bargePlain; i++) add('B', 0, 'barge');
  for (i = 0; i < VS.PARTS.bargeInk; i++) add('B', 1, 'barge');
  for (i = 0; i < VS.PARTS.quarryPlain; i++) add('Q', 0, 'quarry');
  for (i = 0; i < VS.PARTS.quarryInk; i++) add('Q', 1, 'quarry');
  VS.BKEYS.forEach(function (b) { for (j = 0; j < 5; j++) add('T', 0, b); for (j = 0; j < 2; j++) add('T', 1, b); });
  VS.AKEYS.forEach(function (a) { VS.ANIM_PLAIN.forEach(function (n) { add('F', 0, a, n); }); VS.ANIM_INK.forEach(function (n) { add('F', 1, a, n); }); });
  for (i = 1; i <= 26; i++) add('L', VS.LORE_INK.indexOf(i) >= 0 ? 1 : 0, 'lore', i);
  return t;
})();
VS.tileName = function (t) {
  if (!t) return '';
  if (t.col === 'T') return VS.BUILD[t.k].n;
  if (t.col === 'F') return t.a + ' ' + VS.ANIMALS[t.k];
  if (t.col === 'L') return VS.LORE[t.a].n;
  return { K: 'Keep', B: 'Barge', Q: 'Quarry' }[t.col];
};
VS.tileFx = function (t) {
  if (t.col === 'T') return VS.BUILD[t.k].fx;
  if (t.col === 'F') return 'Scores ' + t.a + ', plus same animals in that pasture.';
  if (t.col === 'L') return VS.LORE[t.a].fx;
  return { K: 'Take one extra action with any die number.', B: 'Load goods from a stall. Move up the procession.', Q: 'Each chapter end: +1 silver.' }[t.col];
};
// all 9 estate boards of the original (colour layouts; the die numbers are the same on every board). Board 1 is the standard game.
VS.LAYOUTS = { 1: ['FKKL', 'FFKLT', 'FFTLTT', 'BBBKBBB', 'TTQTTF', 'TQLTT', 'QLLT'],
  2: ['BTFK', 'FBTFT', 'FFFTLT', 'TTTTTLK', 'LLQLQB', 'TTQLB', 'KBBK'], 3: ['FFFF', 'BBKBB', 'TQLLBT', 'TTLKLTT', 'TTLLTT', 'KFQQK', 'TFBT'],
  4: ['KFTB', 'FFTBB', 'TTTBKQ', 'FFFLLQB', 'TKLTTT', 'TQTLL', 'BTLK'], 5: ['FTTB', 'FFTQQ', 'TKLBBB', 'TTFLKTT', 'LKFLBT', 'TFTKB', 'LLTQ'],
  6: ['LLKB', 'LTTBT', 'FFQBTT', 'LTTKBTT', 'LTTQBT', 'LQFFB', 'KFFK'], 7: ['LKKB', 'LFFFB', 'BQTTQF', 'BLTTTFT', 'TLTTFT', 'TBQLT', 'BKKL'],
  8: ['TTBT', 'BKLKT', 'TLQLLB', 'TFLQFLT', 'BFFFQT', 'TKFKB', 'TBTT'], 9: ['TTKL', 'TTFFB', 'TTFFBB', 'KLLQBKL', 'BBLQTF', 'LTTTF', 'QKTT'] };
VS.BOARDS = {};
Object.keys(VS.LAYOUTS).forEach(function (n) {
  var col = VS.LAYOUTS[n].join('').split(''), reg = [], of = [];
  VS.HEX.forEach(function (h) {
    if (of[h.i] != null) return;
    var id = reg.length, q = [h.i], cells = []; of[h.i] = id;
    while (q.length) { var i = q.pop(); cells.push(i); VS.HEX[i].nb.forEach(function (x) { if (of[x] == null && col[x] === col[h.i]) { of[x] = id; q.push(x); } }); }
    reg.push({ id: id, col: col[h.i], cells: cells.sort(function (a, b) { return a - b; }) });
  });
  VS.BOARDS[n] = { n: +n, col: col, regions: reg, regOf: of };
});
if (typeof module !== 'undefined') module.exports = VS;
