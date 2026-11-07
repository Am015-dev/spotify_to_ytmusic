// Stitchwise data: 33 patches (shape, button cost, time cost, button income), track constants. Original fabric names.
var SW = { N: 9, TRACK: 53, BTN_SPOTS: [5, 11, 17, 23, 29, 35, 41, 47, 53], LEATHER_SPOTS: [20, 26, 32, 44, 50], START_BTN: 5, BONUS_SIZE: 7, BONUS_PTS: 7, EMPTY_PEN: 2 };
// [name, shape rows, cost, time, income]
var PATCH_DEF = [
  ['Ribbon Scrap', '##', 2, 1, 0], ['Bias Binding', '###', 2, 2, 0], ['Corner Patch', '##/#.', 1, 3, 0], ['Tile Square', '##/##', 6, 5, 2],
  ['Long Strip', '####', 3, 3, 1], ['Boot Patch', '#./#./##', 5, 3, 1], ['Tab Patch', '###/.#.', 5, 4, 2], ['Wave Patch', '.##/##.', 7, 2, 2],
  ['Ruler Strip', '#####', 7, 1, 1], ['Hook Patch', '#./#./#./##', 4, 2, 1], ['Step Patch', '.#/.#/##/#.', 3, 6, 1], ['Pocket Patch', '##/##/#.', 7, 4, 2],
  ['Anchor Patch', '###/.#./.#.', 5, 5, 2], ['Cup Patch', '#.#/###', 4, 6, 2], ['Elbow Patch', '#../#../###', 3, 3, 0], ['Stair Patch', '#../##./.##', 5, 5, 2],
  ['Cross Patch', '.#./###/.#.', 7, 4, 2], ['Banner Patch', '.#/##/.#/.#', 8, 6, 3], ['Lightning Patch', '##./.#./.##', 8, 4, 2], ['Leaf Patch', '.##/##./.#.', 5, 3, 1],
  ['Wide Block', '##/##/##', 10, 4, 3], ['Ladder Patch', '###/##./#..', 4, 5, 2], ['Kite Patch', '##./###/.#.', 7, 6, 3], ['Bridge Patch', '#.../####/..#.', 6, 3, 2],
  ['Hammer Patch', '###/#.#/#..', 5, 4, 1], ['Zigzag Patch', '##/#./##/#.', 10, 3, 2], ['Arch Patch', '####/#..#', 6, 5, 2], ['Pennant Patch', '#####/..#..', 7, 5, 3],
  ['Windmill Patch', '.#./###/.#./.#.', 8, 6, 3], ['Long Stair', '###/###/#..', 10, 6, 3], ['Snowflake Patch', '.#./###/.#./.##', 9, 6, 3], ['Frame Patch', '#.#/###/#.#', 9, 5, 3],
  ['Flag Patch', '####/###.', 8, 5, 2]
];
function swParse(s) { var c = []; s.split('/').forEach(function (r, y) { for (var x = 0; x < r.length; x++) if (r[x] === '#') c.push([x, y]); }); return c; }
function swNorm(c) { var mx = Math.min.apply(null, c.map(function (p) { return p[0]; })), my = Math.min.apply(null, c.map(function (p) { return p[1]; })); return c.map(function (p) { return [p[0] - mx, p[1] - my]; }).sort(function (a, b) { return a[1] - b[1] || a[0] - b[0]; }); }
function swOrients(cells) { // up to 8 distinct orientations (rotate x4, flip x2), each normalised
  var out = [], seen = {}, c = cells;
  for (var f = 0; f < 2; f++) { for (var r = 0; r < 4; r++) { var n = swNorm(c), k = JSON.stringify(n); if (!seen[k]) { seen[k] = 1; out.push(n); } c = c.map(function (p) { return [-p[1], p[0]]; }); } c = c.map(function (p) { return [-p[0], p[1]]; }); }
  return out;
}
var PATCHES = PATCH_DEF.map(function (d, i) { var cells = swNorm(swParse(d[1])); return { id: i, name: d[0], rows: d[1], cells: cells, n: cells.length, cost: d[2], time: d[3], inc: d[4], or: swOrients(cells) }; });
