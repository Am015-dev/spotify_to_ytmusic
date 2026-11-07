/* Wildmark data: terrains, animals, the habitat tile set, starter triads and the five A scoring cards (all names original). JSON-safe. */
var WM = window.WM || (window.WM = {});
WM.TER = ['peak', 'forest', 'meadow', 'marsh', 'river'];
WM.TER_NAME = { peak: 'Peak', forest: 'Forest', meadow: 'Meadow', marsh: 'Marsh', river: 'River' };
WM.TER_COL = { peak: '#8d8f9c', forest: '#3f7a4a', meadow: '#c9b45a', marsh: '#5f9c8a', river: '#4a8cc4' };
WM.ANI = ['bear', 'elk', 'salmon', 'hawk', 'fox'];
WM.ANI_NAME = { bear: 'Bear', elk: 'Elk', salmon: 'Salmon', hawk: 'Hawk', fox: 'Fox' };
WM.ANI_COL = { bear: '#7a4e2d', elk: '#c08a4a', salmon: '#d8576b', hawk: '#4f6fa3', fox: '#e2762b' };
// scoring cards (A set): id, animal, title, one-line rule, points table
WM.CARDS = {
  bear: { title: 'Twin Dens', rule: 'Groups of exactly 2 bears. More pairs, more points.', pts: [0, 4, 11, 19, 27] },
  elk: { title: 'Ridge Lines', rule: 'Straight lines of elk. Each elk counts in one line.', pts: [0, 2, 5, 9, 13] },
  salmon: { title: 'River Runs', rule: 'Chains of salmon, each touching at most 2 salmon.', pts: [0, 2, 5, 8, 12, 16, 20, 25] },
  hawk: { title: 'Lone Perches', rule: 'Hawks touching no other hawk.', pts: [0, 2, 5, 8, 11, 14, 18, 22, 26] },
  fox: { title: 'Curious Fox', rule: 'Each fox: 1 point per different animal next to it.', pts: null }
};
// The habitat tile set (85): 25 single-terrain keystones (5 per terrain, one animal each) and 60 split tiles (6 per terrain pair, 2-3 animals).
(function () {
  var T = WM.TER, A = WM.ANI, tiles = [], id = 0;
  var key = { peak: ['bear', 'elk', 'hawk', 'hawk', 'bear'], forest: ['bear', 'elk', 'fox', 'bear', 'elk'], meadow: ['elk', 'fox', 'salmon', 'fox', 'hawk'], marsh: ['salmon', 'hawk', 'fox', 'salmon', 'hawk'], river: ['salmon', 'bear', 'hawk', 'salmon', 'fox'] };
  T.forEach(function (t) { key[t].forEach(function (a) { tiles.push({ id: id++, t: [t], a: [a], key: true }); }); });
  // split tiles: animal sets cycle so every animal appears equally often
  var sets2 = [['bear', 'elk'], ['salmon', 'hawk'], ['fox', 'bear'], ['elk', 'salmon'], ['hawk', 'fox'], ['bear', 'salmon'], ['elk', 'hawk'], ['salmon', 'fox'], ['hawk', 'bear'], ['fox', 'elk']];
  var sets3 = [['bear', 'elk', 'fox'], ['salmon', 'hawk', 'elk'], ['fox', 'salmon', 'bear'], ['hawk', 'elk', 'salmon'], ['bear', 'hawk', 'fox']];
  var k = 0, k2 = 0;
  for (var i = 0; i < 5; i++) for (var j = i + 1; j < 5; j++) for (var n = 0; n < 6; n++) {
    var a = (n % 3 === 2) ? sets3[(k++) % 5] : sets2[(k2++) % 10];
    tiles.push({ id: id++, t: [T[i], T[j]], a: a.slice(), key: false });
  }
  WM.TILES = tiles;
  // starter triads (placed at the start; not part of the supply): top keystone + two split tiles below it
  WM.STARTERS = [
    [{ t: ['river'], a: ['salmon'], key: true }, { t: ['forest', 'peak'], a: ['bear', 'elk', 'hawk'], r: 0 }, { t: ['meadow', 'marsh'], a: ['fox', 'salmon'], r: 2 }],
    [{ t: ['marsh'], a: ['hawk'], key: true }, { t: ['meadow', 'river'], a: ['elk', 'salmon', 'fox'], r: 0 }, { t: ['peak', 'forest'], a: ['bear', 'fox'], r: 2 }],
    [{ t: ['meadow'], a: ['fox'], key: true }, { t: ['river', 'forest'], a: ['salmon', 'bear', 'elk'], r: 0 }, { t: ['marsh', 'peak'], a: ['hawk', 'elk'], r: 2 }],
    [{ t: ['forest'], a: ['elk'], key: true }, { t: ['peak', 'marsh'], a: ['bear', 'hawk', 'salmon'], r: 0 }, { t: ['river', 'meadow'], a: ['fox', 'salmon'], r: 2 }],
    [{ t: ['peak'], a: ['bear'], key: true }, { t: ['marsh', 'meadow'], a: ['hawk', 'fox', 'elk'], r: 0 }, { t: ['forest', 'river'], a: ['elk', 'salmon'], r: 2 }]
  ];
  WM.RIVALS = ['Bram', 'Sorrel', 'Quill', 'Tamsin', 'Oake', 'Linnet'];
})();
if (typeof module !== 'undefined') module.exports = WM;
