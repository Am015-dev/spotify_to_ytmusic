// Stitchwise data: 33 patches (shape, button cost, time cost, button income), track constants. Our own patch set.
var SW = { N: 9, TRACK: 53, BTN_SPOTS: [5, 11, 17, 23, 29, 35, 41, 47, 53], LEATHER_SPOTS: [26, 32, 38, 44, 50], START_BTN: 5, BONUS_SIZE: 7, BONUS_PTS: 7, EMPTY_PEN: 2 };
// [name, shape rows, cost, time, income]. Our own patch set (see COMPONENTS.md): same count, sizes and economy curve as the base game.
var PATCH_DEF = [
  ['Snip', '##', 1, 3, 0], ['Selvedge', '###', 3, 1, 0], ['Thimble', '#./##', 0, 2, 0],
  ['Pincushion', '##/##', 5, 4, 2], ['Yardstick', '####', 2, 2, 0], ['Heel Tab', '#../###', 3, 1, 0],
  ['Collar', '#../###', 1, 3, 0], ['Gingham Wave', '##./.##', 2, 3, 1], ['Tulip Bud', '.#./###', 4, 2, 1],
  ['Lantern', '.#./###', 5, 6, 3], ['Hearth Corner', '#../###', 5, 5, 1], ['Apron Pocket', '#.#/###', 2, 3, 0],
  ['Flag Iron', '##/##/#.', 5, 3, 1], ['Garden Path', '##../.###', 1, 1, 0], ['Weathervane', '.#../####', 7, 3, 2],
  ['Hem Line', '#####', 2, 4, 0], ['Long Hook', '#.../####', 9, 4, 2], ['Chevron', '#../#../###', 2, 6, 1],
  ['Cascade', '#../##./.##', 7, 4, 2], ['Lightning Seam', '##./.#./.##', 5, 2, 1], ['Clover Sprig', '.##/##./.#.', 1, 4, 1],
  ['Hearth Block', '###/###', 8, 5, 3], ['Bolt End', '######', 1, 4, 0], ['Staircase', '##../.##./..##', 9, 4, 3],
  ['Teapot', '##./###/.#.', 5, 2, 1], ['Crook', '#..../#####', 4, 5, 2], ['Rickrack', '###../..###', 1, 3, 1],
  ['River Bend', '#.../###./..##', 6, 2, 2], ['Signpost', '#.../####/.#..', 9, 3, 2], ['Big Corner', '#.../#.../####', 2, 3, 1],
  ['Cottage', '.#./###/###', 2, 3, 1], ['Comet Tail', '###../.####', 10, 5, 2], ['Bow Tie', '##../####/..##', 8, 4, 2]
];
function swParse(s) { var c = []; s.split('/').forEach(function (r, y) { for (var x = 0; x < r.length; x++) if (r[x] === '#') c.push([x, y]); }); return c; }
function swNorm(c) { var mx = Math.min.apply(null, c.map(function (p) { return p[0]; })), my = Math.min.apply(null, c.map(function (p) { return p[1]; })); return c.map(function (p) { return [p[0] - mx, p[1] - my]; }).sort(function (a, b) { return a[1] - b[1] || a[0] - b[0]; }); }
function swOrients(cells) { // up to 8 distinct orientations (rotate x4, flip x2), each normalised
  var out = [], seen = {}, c = cells;
  for (var f = 0; f < 2; f++) { for (var r = 0; r < 4; r++) { var n = swNorm(c), k = JSON.stringify(n); if (!seen[k]) { seen[k] = 1; out.push(n); } c = c.map(function (p) { return [-p[1], p[0]]; }); } c = c.map(function (p) { return [-p[0], p[1]]; }); }
  return out;
}
var PATCHES = PATCH_DEF.map(function (d, i) { var cells = swNorm(swParse(d[1])); return { id: i, name: d[0], rows: d[1], cells: cells, n: cells.length, cost: d[2], time: d[3], inc: d[4], or: swOrients(cells) }; });
