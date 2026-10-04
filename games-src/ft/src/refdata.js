// Component reference for Sands of Qamar in the shared GX.reference format (JSON-safe, so node can read it too).
//   SOQ_REF(D) -> [{id, title, items:[{id, name, count, text, tags, meta, extra, pic}]}]
// D holds the game's data tables (MNAME, MHELP, MEEPLE_COUNT, TILEDEF, TILESET*, RNAME, RICON, RESOURCE_COUNT, SETVP, DJINNS, ITEMS, THIEVES, CAMELS).
// `pic` says what to draw ({tribe}, {tile, v, blue}, {good}, {djinn}, {item}, {thief}, {piece}); the page turns it into a picture.
(function (g) {
  var COLOUR = { vizier: 'yellow', elder: 'white', merchant: 'green', builder: 'blue', assassin: 'red', artisan: 'purple' };
  var WHY = {
    vizier: 'Advisors score 1 point each at the end, and you get 10 more points for every rival who has fewer Advisors than you.',
    elder: 'Sages score 2 points each at the end, but they are mostly the price of a djinn: 2 Sages (or 1 Sage and 1 Mystic) at a Shrine.',
    merchant: 'Goods only pay in sets of different kinds, so the more kinds you collect, the more each new card is worth.',
    builder: 'Blue tiles are Hamlets, Shrines and Workshops. A tile surrounded by blue pays well.',
    assassin: 'A Shadow that empties a tile claims it for you; one that removes a rival\'s Advisor can swing the Advisor majority.',
    artisan: 'Crafters score points for the player with the most of them, and each one draws an item.'
  };
  var SET = { promos: 'promo', artisans: 'Crafters', thieves: 'Cutpurses' };
  var COST = { EF: 'Power: pay 1 Sage or 1 Mystic each time', EEF: 'Power: pay 1 Sage plus 1 Sage or Mystic each time', F: 'Power: pay 1 Mystic each time', 'F+': 'Power: Mystics when bidding' };
  g.SOQ_REF = function (D) {
    var tribes = [], tiles = [], goods = [], djinns = [], items = [], thieves = [], box = [];
    Object.keys(D.MNAME).forEach(function (c) {
      var n = c === 'artisan' ? 15 : D.MEEPLE_COUNT[c];
      tribes.push({ id: 'm-' + c, name: D.MPLUR[c] + ' (' + COLOUR[c] + ')', count: n, text: D.MHELP[c], meta: 'People · ' + COLOUR[c] + (c === 'artisan' ? ' · Crafters expansion' : ''),
        extra: WHY[c], tags: ['Tribe', c === 'artisan' ? 'Crafters' : 'Base game'], pic: { tribe: c } });
    });
    var seen = {};
    function addTiles(set, tag) {
      set.forEach(function (row) {
        var k = row[0], v = row[1], n = row[2], col = row[3], d = D.TILEDEF[k], blue = col ? col === 'blue' : !!d.blue, id = 't-' + k + '-' + v + (col ? '-' + col : '');
        if (seen[id]) { seen[id].count += n; return; }
        var it = { id: id, name: d.n + (v ? ' (' + v + ')' : ''), count: n, text: d.x, meta: (v ? v + ' points to whoever holds it · ' : '') + (d.block ? 'blocked' : blue ? 'blue tile' : 'red tile'),
          extra: d.block ? 'Nobody can stand on it or move through it.' : 'A tile you hold at the end scores its printed points. ' + (blue ? 'Blue tiles count for Masons.' : 'Red tiles do not count for Masons.'),
          tags: ['Tile', blue ? 'Blue' : 'Red', tag], pic: { tile: k, v: v, blue: blue } };
        seen[id] = it; tiles.push(it);
      });
    }
    addTiles(D.TILESET, 'Base game'); addTiles(D.TILESET_ART, 'Crafters'); addTiles(D.TILESET_WHIM, 'Wonder Cities');
    var sv = D.SETVP.slice(1).join(', ');
    Object.keys(D.RESOURCE_COUNT).forEach(function (r) {
      var mystic = r === 'fakir';
      goods.push({ id: 'g-' + r, name: D.RNAME[r], count: D.RESOURCE_COUNT[r], meta: mystic ? 'Special card · never part of a set' : 'Goods card',
        text: mystic ? 'Adds 1 to a Mason\'s pay or a Shadow\'s range, stands in for one Sage when summoning, and pays for djinn powers.' : 'Collect sets of different kinds: a set of 1 to 9 kinds scores ' + sv + ' points.',
        extra: mystic ? 'Mystics are kept face up in front of you; they do not score on their own.' : 'Sets are counted again and again: 2 Fish and 1 Wheat make a set of 2 kinds (3 points) and a set of 1 kind (1 point).',
        tags: ['Goods', mystic ? 'Mystic' : 'Set card'], pic: { good: r } });
    });
    D.DJINNS.forEach(function (d) {
      djinns.push({ id: 'dj-' + d.k, name: d.n, count: 1, text: d.x, meta: d.vp + ' points · ' + (d.cost ? COST[d.cost] || 'power' : 'always on') + (d.set ? ' · ' + (SET[d.set] || d.set) : ''),
        extra: 'Summon a djinn at a Shrine: pay 2 Sages, or 1 Sage and 1 Mystic. Three are face up at a time; the row is refilled at the end of each round.' + (d.assumed ? ' (Some of its numbers are assumed: ' + d.assumed + '.)' : ''),
        tags: ['Djinn', d.cost ? 'Power' : 'Always on', d.set ? SET[d.set] || d.set : 'Base game'], pic: { djinn: d.k } });
    });
    Object.keys(D.ITEMS).forEach(function (k) {
      var i = D.ITEMS[k];
      items.push({ id: 'it-' + k, name: i.n, count: i.cp, text: i.x, meta: (i.kind === 'precious' ? 'Precious item' + (i.vp ? ' · ' + i.vp + ' points' : '') : 'Magic item, used once') + ' · Crafters',
        extra: 'Crafters draw items; keep one and discard the rest. A Workshop sells the top item for 1 Crafter or 2 Mystics.', tags: ['Item', i.kind === 'precious' ? 'Precious' : 'Magic', 'Crafters'], pic: { item: k } });
    });
    Object.keys(D.THIEVES).forEach(function (k) {
      var t = D.THIEVES[k];
      thieves.push({ id: 'th-' + k, name: t.n, count: 1, text: t.x, meta: 'Cutpurses' + (k === 'artisan' ? ' · with the Crafters' : ''),
        extra: 'Hire a Cutpurse at a Shrine instead of a djinn (2 Sages, or 1 Sage and 1 Mystic). Send it before a tribe action of its colour.', tags: ['Cutpurse', 'Cutpurses'], pic: { thief: k } });
    });
    var cam = D.CAMELS || {};
    box.push({ id: 'x-camels', name: 'Camels', count: null, text: 'Mark the tiles you hold: ' + (cam[2] || 11) + ' each with 2 players, ' + (cam[3] || 8) + ' each with 3 to 5. Placing your last camel ends the game at the end of the round.', tags: ['Piece'], pic: { piece: 'camel' } });
    box.push({ id: 'x-palm', name: 'Palm trees', count: null, text: '3 points each to whoever holds the tile (5 with a djinn that loves gardens; doubled next to the Great Lake).', tags: ['Piece'], pic: { piece: 'palm' } });
    box.push({ id: 'x-palace', name: 'Palaces', count: null, text: '5 points each to whoever holds the tile (doubled next to the Great Lake).', tags: ['Piece'], pic: { piece: 'palace' } });
    box.push({ id: 'x-coins', name: 'Coins', count: null, text: 'Every coin is 1 point at the end. Pay them for turn order and bazaar goods.', tags: ['Piece'], pic: { piece: 'coin' } });
    box.push({ id: 'x-tent', name: 'Tents', count: null, text: 'Crafters: one each. Claim a tile with it instead of a camel: it scores the tile plus 1 for each red tile around it.', tags: ['Piece', 'Crafters'], pic: { piece: 'tent' } });
    box.push({ id: 'x-mount', name: 'Mountains', count: null, text: 'Crafters: block moving between two tiles (not a Shadow\'s range).', tags: ['Piece', 'Crafters'], pic: { piece: 'mount' } });
    box.push({ id: 'x-track', name: 'Turn-order track', count: 1, text: 'Spots cost 0, 0, 0, 1, 3, 5, 8, 12 and 18 coins (with 5 players: 0, 0, 0, 1, 1, 3, 3, 5, 5, 8, 12, 18). Dearer spots play first; on equal prices the later bidder plays first.', tags: ['Piece'], pic: { piece: 'track' } });
    return [
      { id: 'tribes', title: 'Tribes', items: tribes },
      { id: 'tiles', title: 'Tiles', items: tiles },
      { id: 'goods', title: 'Goods', items: goods },
      { id: 'djinns', title: 'Djinns', items: djinns },
      { id: 'items', title: 'Items', items: items },
      { id: 'thieves', title: 'Cutpurses', items: thieves },
      { id: 'box', title: 'Pieces', items: box }
    ];
  };
  if (typeof module === 'object' && module.exports) module.exports = g.SOQ_REF;
})(typeof window !== 'undefined' ? window : globalThis);
