// Stitchwise data: 33 patches (shape, button cost, time cost, button income), track constants. Original fabric names.
var SW = { N: 9, TRACK: 53, BTN_SPOTS: [5, 11, 17, 23, 29, 35, 41, 47, 53], LEATHER_SPOTS: [20, 26, 32, 44, 50], START_BTN: 5, BONUS_SIZE: 7, BONUS_PTS: 7, EMPTY_PEN: 2 };
// [name, shape rows, cost, time, income]. Values checked against two independent public sources (see rules-notes.md).
var PATCH_DEF = [
  ['Ribbon Scrap', '##', 2, 1, 0], ['Bias Binding', '###', 2, 2, 0], ['Corner Patch', '#./##', 1, 3, 0],
  ['Tile Square', '##/##', 6, 5, 2], ['Long Strip', '####', 3, 3, 1], ['Boot Patch', '#./##', 3, 1, 0],
  ['Tab Patch', '.#./###', 2, 2, 0], ['Wave Patch', '##./.##', 3, 2, 1], ['Ruler Strip', '#../###', 4, 2, 1],
  ['Hook Patch', '#../###', 4, 6, 2], ['Step Patch', '##./.##', 7, 6, 3], ['Pocket Patch', '###/#.#', 1, 2, 0],
  ['Anchor Patch', '##./###', 2, 2, 0], ['Cup Patch', '###./..##', 2, 3, 1], ['Elbow Patch', '..#./####', 3, 4, 1],
  ['Stair Patch', '.#./###/.#.', 5, 4, 2], ['Cross Patch', '###/.#./.#.', 5, 5, 2], ['Banner Patch', '#####', 7, 1, 1],
  ['Lightning Patch', '#.../####', 10, 3, 2], ['Leaf Patch', '##./.##/..#', 10, 4, 3], ['Wide Block', '.#../####/.#..', 0, 3, 1],
  ['Ladder Patch', '...#/####/#...', 1, 2, 0], ['Kite Patch', '####/#..#', 1, 5, 1], ['Bridge Patch', '.#../####/..#.', 2, 1, 0],
  ['Hammer Patch', '.#./###/#.#', 3, 6, 2], ['Zigzag Patch', '###./.###', 4, 2, 0], ['Arch Patch', '#.../####/#...', 7, 2, 2],
  ['Pennant Patch', '.##./####', 7, 4, 2], ['Windmill Patch', '##./###/..#', 8, 6, 3], ['Long Stair', '##../####', 10, 5, 3],
  ['Snowflake Patch', '..#../#####/..#..', 1, 4, 1], ['Frame Patch', '#.#/###/#.#', 2, 3, 0], ['Flag Patch', '.##./####/.##.', 5, 3, 1]
];
function swParse(s) { var c = []; s.split('/').forEach(function (r, y) { for (var x = 0; x < r.length; x++) if (r[x] === '#') c.push([x, y]); }); return c; }
function swNorm(c) { var mx = Math.min.apply(null, c.map(function (p) { return p[0]; })), my = Math.min.apply(null, c.map(function (p) { return p[1]; })); return c.map(function (p) { return [p[0] - mx, p[1] - my]; }).sort(function (a, b) { return a[1] - b[1] || a[0] - b[0]; }); }
function swOrients(cells) { // up to 8 distinct orientations (rotate x4, flip x2), each normalised
  var out = [], seen = {}, c = cells;
  for (var f = 0; f < 2; f++) { for (var r = 0; r < 4; r++) { var n = swNorm(c), k = JSON.stringify(n); if (!seen[k]) { seen[k] = 1; out.push(n); } c = c.map(function (p) { return [-p[1], p[0]]; }); } c = c.map(function (p) { return [-p[0], p[1]]; }); }
  return out;
}
var PATCHES = PATCH_DEF.map(function (d, i) { var cells = swNorm(swParse(d[1])); return { id: i, name: d[0], rows: d[1], cells: cells, n: cells.length, cost: d[2], time: d[3], inc: d[4], or: swOrients(cells) }; });
