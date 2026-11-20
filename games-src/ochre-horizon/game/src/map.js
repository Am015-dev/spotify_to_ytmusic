// Ochre Horizon map: 61 hexes in rows 5-6-7-8-9-8-7-6-5 (axial coords), 12 ocean spaces, 4 named volcanic spaces,
// 1 reserved city site, 2 off-map city spaces, milestones and awards. Our own geography and names.
(function (root) {
  var ROWS = [
    ['SS', 'S', '', 'O:C', 'O'],
    ['', 'V:S', '', '', '', 'O:CC'],
    ['V:T', '', '', '', '', '', 'S'],
    ['V:PT', 'P', 'P', 'R:PP', 'P', '', '', 'O:C'],
    ['V:PP', 'PP', 'P', 'P', 'O:PP', 'O:PP', 'P', 'PP', 'P'],
    ['P', 'P', 'P', 'O:PP', 'O:PP', 'O:PP', 'P', 'P'],
    ['', '', '', 'O', '', 'P', ''],
    ['SS', '', 'C', 'C', 'O', 'T'],
    ['S', 'S', '', 'O:S', 'TT']
  ];
  var VNAMES = ['Mount Ember', 'Cinder Crown', 'Ash Throne', 'Red Anvil'];
  var CODE = { S: 'steel', T: 'ti', P: 'plant', C: 'card' };
  var spaces = {}, order = [], vi = 0;
  ROWS.forEach(function (row, ri) {
    var r = ri - 4, q0 = Math.max(-4, -4 - r);
    row.forEach(function (code, i) {
      var id = 's' + ri + '_' + i, sp = { id: id, row: ri, col: i, q: q0 + i, r: r, bonus: [], ocean: false };
      var m = code.split(':'), kind = m.length > 1 ? m[0] : (code === 'O' ? 'O' : ''), b = m.length > 1 ? m[1] : (code === 'O' ? '' : code);
      if (kind === 'O') sp.ocean = true;
      if (kind === 'V') { sp.volcanic = true; sp.name = VNAMES[vi++]; }
      if (kind === 'R') { sp.reserved = true; sp.name = 'Rift City Site'; }
      for (var k = 0; k < b.length; k++) sp.bonus.push(CODE[b[k]]);
      spaces[id] = sp; order.push(id);
    });
  });
  var byQR = {};
  order.forEach(function (id) { var s = spaces[id]; byQR[s.q + ',' + s.r] = id; });
  var DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, -1], [-1, 1]];
  order.forEach(function (id) {
    var s = spaces[id]; s.adj = [];
    DIRS.forEach(function (d) { var n = byQR[(s.q + d[0]) + ',' + (s.r + d[1])]; if (n) s.adj.push(n); });
  });
  var OFFMAP = {
    m1: { id: 'm1', name: 'Lantern Moon Port', offmap: true, adj: [], bonus: [] },
    m2: { id: 'm2', name: 'Far-Moon Habitat', offmap: true, adj: [], bonus: [] }
  };
  var MILESTONES = [
    { k: 'steward', name: 'Steward', text: 'Terraform rating 34 or more', need: 34, m: 'tr' },
    { k: 'founder', name: 'Founder', text: 'Own 3 cities', need: 3, m: 'cities' },
    { k: 'grower', name: 'Grower', text: 'Plant production 4 or more', need: 4, m: 'plantProd' },
    { k: 'engineer', name: 'Engineer', text: '7 building tags', need: 7, m: 'tag:building' },
    { k: 'navigator', name: 'Navigator', text: '5 space tags', need: 5, m: 'tag:space' }
  ];
  var AWARDS = [
    { k: 'surveyor', name: 'Surveyor', text: 'Most tiles on the map', m: 'tilesOnMap' },
    { k: 'financier', name: 'Financier', text: 'Highest credit production', m: 'mcProd' },
    { k: 'visionary', name: 'Visionary', text: 'Most science tags', m: 'tag:science' },
    { k: 'stoker', name: 'Stoker', text: 'Most heat in stock', m: 'heat' },
    { k: 'prospector', name: 'Prospector', text: 'Most steel + titanium production', m: 'stProd' }
  ];
  root.OH_MAP = { ROWS: ROWS, spaces: spaces, order: order, OFFMAP: OFFMAP, MILESTONES: MILESTONES, AWARDS: AWARDS };
  if (typeof module !== 'undefined') module.exports = root.OH_MAP;
})(typeof window !== 'undefined' ? window : globalThis);
