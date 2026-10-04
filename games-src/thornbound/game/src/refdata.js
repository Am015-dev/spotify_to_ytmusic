// Component reference for The Thornbound Throne in the shared GX.reference format (JSON-safe, so node can read it too).
//   TB.refSections(DATA) -> [{id, title, items:[{id, name, count, text, tags, meta, extra, pic}]}]
// `pic` says what to draw ({fac, k} a faction card, {kc: n} a Kingdom Card, {loc: i} ...); the page turns it into a picture.
(function (g) {
  var TB = g.TB = g.TB || {};
  var ARCH = { ruse: 'Ruse', trader: 'Trader', agent: 'Agent', follower: 'Follower', cavalry: 'Cavalry', war_machine: 'War machine', captain: 'Captain', champion: 'Champion', heir: 'Heir' };
  var TRAIT = { inv: ['Invulnerable', 'cannot be Eliminated'], res: ['Resilient', 'if Eliminated it goes to your discard pile instead of the Lost Pile'], path: ['Pathfinder', 'if it is used to Journey it goes to your discard pile, not the Lost Pile'] };
  var SUIT = { relics: 'Coin', secrets: 'Whispers', oaths: 'Pledges' };
  var PLACE = { board: 'Sits on your board with your bid card under it', supply: 'Goes to your Supply', region: 'Placed on a region', loc: 'Placed on a location', none: 'Used once, then discarded' };
  var STEP = { passive: 'Lasting', spring: 'Spring', day: 'Day', autumn: 'Autumn', night: 'Night', any: 'Any time', bid: 'Bids', winter: 'Winter' };
  function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
  function cardText(c) {
    var t = (c.tr || []).map(function (x) { return TRAIT[x] ? TRAIT[x][0] + '.' : ''; }).filter(Boolean).join(' ');
    return ((t ? t + ' ' : '') + (c.txt || '')).trim() || 'No special ability.';
  }
  function cardMeta(c) {
    var m = [];
    if (c.kind !== 'hq') m.push('Strength ' + c.s);
    if (c.v) m.push(c.v + ' vote' + (c.v > 1 ? 's' : ''));
    if (c.l) m.push(c.l + ' lore');
    if (c.lc) m.push('costs ' + c.lc + ' Lore');
    return m.join(' · ');
  }
  function cardExtra(c) {
    var x = (c.tr || []).map(function (t) { return TRAIT[t] ? TRAIT[t][0] + ': ' + TRAIT[t][1] + '.' : ''; }).filter(Boolean);
    if (c.kind === 'basic' || c.kind === 'heir') x.push('One of the 14 basic cards every faction starts with (the Heir starts in your hand).');
    else if (c.kind === 'hq') x.push('Headquarters: bought with Lore, it never enters your deck; its power works from your board.');
    else x.push('Site of Power card: buy it with Lore after a Journey; it then joins your deck.');
    return x.join(' ');
  }
  TB.refSections = function (D) {
    D = D || TB.DATA;
    var fac = D.FACTIONS, cards = [], kcs = [], tac = [], fav = [], places = [], box = [];
    fac.forEach(function (f) {
      var fs = D.FSHORT[f];
      D.BASIC.forEach(function (c, k) {
        var nm = (D.BASICNAMES[f] || [])[k] || c.nm || ('Card ' + (k + 1));
        cards.push({ id: 'f-' + f + '-' + k, name: nm, count: 1, text: cardText(c), meta: cardMeta(c), extra: cardExtra(c),
          tags: [fs, ARCH[c.ar] || 'Card', 'Basic'], pic: { fac: f, k: k } });
      });
      (D.SITE[f] || []).forEach(function (c, j) {
        cards.push({ id: 'f-' + f + '-' + (14 + j), name: c.nm, count: 1, text: cardText(c), meta: cardMeta(c), extra: cardExtra(c),
          tags: [fs, c.kind === 'hq' ? 'HQ' : (ARCH[c.ar] || 'Card'), 'Site of Power'], pic: { fac: f, k: 14 + j } });
      });
      (D.TACTICS[f] || []).forEach(function (t) {
        tac.push({ id: 't-' + t.id, name: t.nm, count: 1, text: t.txt, meta: fs + ' · ' + (STEP[t.step] || cap(t.step) || 'Any time') + (t.mk ? ' · starts with ' + t.mk + ' markers' : ''),
          extra: 'A Tactic is a once-only faction power: after use it is Exhausted until something refreshes it.', tags: [fs, 'Tactic'], pic: { tac: f } });
      });
      var fv = D.FAVOUR[f];
      if (fv) fav.push({ id: 'v-' + f, name: fv.nm, count: 1, text: fv.txt, meta: fs + ' · ' + (STEP[fv.step] || cap(fv.step) || ''),
        extra: 'Usable only while you hold the Kingdom\'s Favour (claimed at the Gleaning Meadow); each use spends one of its three charges.', tags: [fs, 'Favour'], pic: { tac: f } });
    });
    D.KC.forEach(function (k) {
      kcs.push({ id: 'kc' + k.n, name: k.nm, count: 1, text: k.txt, meta: SUIT[k.suit] + ' suit · ' + (PLACE[k.place] || k.place) + ' · No. ' + k.n,
        extra: 'Kingdom Cards are won with your bid: the highest bid chooses first from the four on the Great Road. You can hold at most two on your board; a rival steals one with a bid stronger than the card under it.',
        tags: ['Kingdom Card', SUIT[k.suit]], pic: { kc: k.n } });
    });
    D.LOCS.forEach(function (l, i) {
      places.push({ id: 'loc' + i, name: l[1], count: 1, text: '+' + l[2] + ' Influence' + (l[3] ? '. ' + l[3] : '. Nothing else: the best plain Influence on the map.'),
        meta: D.RNAMES[i >> 1] + ' · reward +' + l[2], extra: 'The winner of the Clash in ' + D.RNAMES[i >> 1] + ' claims one of its two locations. With your Herald here you also gain +1 and take 1 Influence from each rival Herald here.',
        tags: ['Location', D.RNAMES[i >> 1]], pic: { loc: i } });
    });
    D.COUNCILS.forEach(function (c) {
      places.push({ id: 'co-' + c, name: D.COUNCIL_NAMES[c], count: 1, text: D.COUNCIL_TXT[c], meta: SUIT[c] + ' suit · cards with votes go here by Govern',
        tags: ['Council'], pic: { council: c } });
    });
    box.push({ id: 'x-heralds', name: 'Heralds', count: 4, text: 'One per faction. Placed in Spring on a location, in public; they go home in Winter.', tags: ['Box'], pic: { piece: 'herald' } });
    box.push({ id: 'x-supp', name: 'Supporters', count: 20, text: '5 per faction. Each one sent to a region adds +1 Strength in its first Clash; those on the map are spent in Winter.', tags: ['Box'], pic: { piece: 'supp' } });
    box.push({ id: 'x-fav', name: 'The Kingdom\'s Favour', count: 1, text: 'A disc with three uses. Claimed at the Gleaning Meadow; it unlocks your faction\'s Favour power and breaks ties at the end.', tags: ['Box'], pic: { piece: 'fav' } });
    box.push({ id: 'x-track', name: 'Influence track', count: 1, text: 'Runs round the map edge, 0 to 40. Each faction has one marker on it.', tags: ['Box'], pic: { piece: 'inf' } });
    box.push({ id: 'x-markers', name: 'Faction markers', count: 4, text: 'One set per faction, used by the Council of Whispers and by some Tactics. Four on one location claim its bonus.', tags: ['Box'], pic: { piece: 'inf' } });
    box.push({ id: 'x-order', name: 'Clash order markers', count: 3, text: 'I, II and III: the player lowest on Influence decides which region fights first.', tags: ['Box'] });
    return [
      { id: 'cards', title: 'Faction cards', items: cards },
      { id: 'kc', title: 'Kingdom Cards', items: kcs },
      { id: 'tactics', title: 'Tactics', items: tac },
      { id: 'favour', title: 'Favour powers', items: fav },
      { id: 'map', title: 'Map', items: places },
      { id: 'box', title: 'In the box', items: box }
    ];
  };
  if (typeof module === 'object' && module.exports) module.exports = TB.refSections;
})(typeof window !== 'undefined' ? window : globalThis);
