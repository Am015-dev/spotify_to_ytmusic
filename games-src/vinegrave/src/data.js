/* Vinegrave data: every card, site, guardian, idol and the research track. Original names and numbers (see rules-notes.md).
   Works in node (module.exports) and the page (window.VD). Effects are small op lists, read by engine.js:
   {g:{res:n}} gain · {p:{res:n}} pay (only if you can) · {d:n} draw · {x:1} exile a card (hand or discard) · {r:'g'|'n'} free research step
   {b:'i'|'a', o:n} buy an item / artifact n cheaper · {fd:1} send an explorer to a site without paying travel · {or:[[ops],[ops]]} pick one */
(function (root) {
  var RES = ['coin', 'compass', 'tablet', 'arrow', 'jewel'];
  var RNAME = { coin: 'coin', compass: 'compass', tablet: 'tablet', arrow: 'arrowhead', jewel: 'jewel' };
  var TRAVEL = ['boot', 'car', 'ship', 'plane'];
  var TNAME = { boot: 'Boot', car: 'Jeep', ship: 'Boat', plane: 'Plane' };
  // ---- starting cards (each explorer: 2 of each) ----
  var BASIC = {
    dread: { id: 'dread', t: 'fear', name: 'Creeping Dread', tr: 'boot', vp: -1, ops: [], text: 'No effect. Worth -1 point. Use it for one Boot of travel.' },
    grant: { id: 'grant', t: 'basic', name: 'Patron Letter', tr: 'boot', vp: 0, ops: [{ g: { coin: 1 } }], text: 'Gain 1 coin.' },
    trail: { id: 'trail', t: 'basic', name: 'Trail Notes', tr: 'boot', vp: 0, ops: [{ g: { compass: 1 } }], text: 'Gain 1 compass.' }
  };
  // ---- items: bought with coins, go to the bottom of your deck. [id, name, cost, travel, vp, ops] ----
  var I = [
    ['machete', 'Brush Machete', 1, 'boot', 0, [{ g: { coin: 1, compass: 1 } }]],
    ['canteen', 'Dented Canteen', 1, 'boot', 0, [{ d: 1 }, { g: { coin: 1 } }]],
    ['rope', 'Coil of Rope', 1, 'car', 0, [{ g: { compass: 2 } }]],
    ['lamp', 'Tin Lamp', 1, 'ship', 0, [{ g: { tablet: 1 } }]],
    ['satchel', 'Field Satchel', 2, 'boot', 1, [{ d: 2 }]],
    ['pickaxe', 'Short Pickaxe', 2, 'car', 1, [{ g: { arrow: 1 } }]],
    ['sextant', 'Brass Sextant', 2, 'ship', 1, [{ g: { compass: 3 } }]],
    ['ledger', 'Trade Ledger', 2, 'boot', 1, [{ g: { coin: 3 } }]],
    ['brush', 'Soft Brush', 2, 'car', 1, [{ g: { tablet: 1, coin: 1 } }]],
    ['tarp', 'Oilcloth Tarp', 2, 'ship', 1, [{ x: 1 }, { g: { compass: 1 } }]],
    ['camera', 'Box Camera', 2, 'boot', 1, [{ r: 'n' }]],
    ['hammock', 'Jungle Hammock', 2, 'boot', 1, [{ d: 1 }, { x: 1 }]],
    ['kettle', 'Camp Kettle', 2, 'car', 1, [{ or: [[{ g: { coin: 2 } }], [{ g: { compass: 2 } }]] }]],
    ['spyglass', 'Folding Spyglass', 3, 'ship', 1, [{ g: { compass: 2 } }, { d: 1 }]],
    ['jeepkey', 'Spare Jeep Key', 3, 'car', 1, [{ fd: 1 }]],
    ['chisel', 'Mason Chisel', 3, 'boot', 1, [{ g: { tablet: 1, arrow: 1 } }]],
    ['scale', 'Jeweller Scale', 3, 'ship', 1, [{ or: [[{ p: { coin: 2 } }, { g: { jewel: 1 } }], [{ g: { coin: 2 } }]] }]],
    ['journal', 'Dusty Journal', 3, 'boot', 2, [{ r: 'g' }]],
    ['flares', 'Signal Flares', 3, 'plane', 1, [{ g: { compass: 2, coin: 1 } }]],
    ['crate', 'Supply Crate', 3, 'car', 1, [{ g: { coin: 2, tablet: 1 } }]],
    ['radio', 'Field Radio', 3, 'plane', 1, [{ b: 'i', o: 2 }]],
    ['tent', 'Canvas Tent', 3, 'boot', 2, [{ g: { coin: 1 } }, { x: 1 }]],
    ['dinghy', 'Rubber Dinghy', 3, 'ship', 1, [{ g: { arrow: 1, compass: 1 } }]],
    ['ropebridge', 'Rope Bridge Kit', 3, 'car', 2, [{ g: { compass: 3 } }]],
    ['almanac', 'Tide Almanac', 4, 'ship', 2, [{ d: 2 }, { g: { compass: 1 } }]],
    ['theodolite', 'Theodolite', 4, 'car', 2, [{ r: 'g' }, { g: { coin: 1 } }]],
    ['mule', 'Pack Mule', 4, 'boot', 2, [{ g: { coin: 2, compass: 2 } }]],
    ['seaplane', 'Seaplane Ticket', 4, 'plane', 2, [{ fd: 1 }, { g: { coin: 1 } }]],
    ['lockbox', 'Iron Lockbox', 4, 'car', 2, [{ g: { jewel: 1 } }]],
    ['codebook', 'Cipher Codebook', 4, 'ship', 2, [{ g: { tablet: 2 } }]],
    ['quiver', 'Hunter Quiver', 4, 'boot', 2, [{ g: { arrow: 2 } }]],
    ['permit', 'Dig Permit', 4, 'plane', 2, [{ b: 'a', o: 2 }]],
    ['mapcase', 'Leather Map Case', 4, 'car', 2, [{ g: { compass: 4 } }]],
    ['gramophone', 'Camp Gramophone', 4, 'boot', 3, [{ x: 1 }, { x: 1 }]],
    ['airship', 'Survey Airship', 4, 'plane', 3, [{ r: 'n' }, { d: 1 }]]
  ];
  // ---- artifacts: bought with compasses (the effect fires at once, free); played later from hand they cost 1 tablet. ----
  var A = [
    ['ember-mask', 'Ember Mask', 1, 'boot', 0, [{ g: { arrow: 1 } }]],
    ['reed-flute', 'Reed Flute', 1, 'boot', 0, [{ g: { coin: 2 } }]],
    ['clay-cup', 'Clay Cup', 1, 'ship', 0, [{ d: 1 }, { g: { compass: 1 } }]],
    ['bone-dice', 'Bone Dice', 1, 'car', 0, [{ or: [[{ g: { tablet: 1 } }], [{ g: { arrow: 1 } }]] }]],
    ['moss-idol', 'Moss Figurine', 2, 'boot', 1, [{ x: 1 }, { g: { coin: 1 } }]],
    ['sun-disc', 'Sun Disc', 2, 'ship', 1, [{ g: { tablet: 2 } }]],
    ['vine-crown', 'Vine Crown', 2, 'car', 1, [{ g: { jewel: 1 } }]],
    ['star-chart', 'Star Chart', 2, 'plane', 1, [{ r: 'g' }]],
    ['jade-frog', 'Jade Frog', 2, 'boot', 1, [{ g: { arrow: 1, coin: 1 } }]],
    ['rain-drum', 'Rain Drum', 2, 'ship', 1, [{ d: 2 }]],
    ['ash-urn', 'Ash Urn', 2, 'car', 1, [{ x: 1 }, { x: 1 }]],
    ['thorn-key', 'Thorn Key', 2, 'boot', 1, [{ fd: 1 }]],
    ['owl-totem', 'Owl Totem', 3, 'plane', 1, [{ r: 'n' }, { g: { compass: 1 } }]],
    ['tide-shell', 'Tide Shell', 3, 'ship', 1, [{ g: { jewel: 1, coin: 1 } }]],
    ['root-sceptre', 'Root Sceptre', 3, 'car', 2, [{ g: { arrow: 2 } }]],
    ['glyph-stone', 'Glyph Stone', 3, 'boot', 2, [{ g: { tablet: 2, compass: 1 } }]],
    ['serpent-ring', 'Serpent Ring', 3, 'ship', 1, [{ or: [[{ p: { coin: 1 } }, { g: { jewel: 1 } }], [{ g: { tablet: 1 } }]] }]],
    ['moon-comb', 'Moon Comb', 3, 'boot', 1, [{ b: 'a', o: 2 }]],
    ['bat-wing-fan', 'Bat Wing Fan', 3, 'plane', 1, [{ d: 1 }, { r: 'g' }]],
    ['lava-blade', 'Lava Blade', 3, 'car', 2, [{ g: { arrow: 1, jewel: 1 } }]],
    ['spirit-bowl', 'Spirit Bowl', 3, 'ship', 2, [{ x: 1 }, { g: { tablet: 1 } }]],
    ['wind-chime', 'Wind Chime', 3, 'boot', 1, [{ g: { coin: 3, compass: 1 } }]],
    ['gilded-beetle', 'Gilded Beetle', 4, 'plane', 2, [{ g: { jewel: 2 } }]],
    ['storm-horn', 'Storm Horn', 4, 'car', 2, [{ r: 'g' }, { r: 'n' }]],
    ['coral-throne', 'Coral Throne', 4, 'ship', 3, [{ g: { tablet: 1, arrow: 1, jewel: 1 } }]],
    ['ancestor-mask', 'Ancestor Mask', 4, 'boot', 3, [{ x: 1 }, { d: 2 }]],
    ['obsidian-mirror', 'Obsidian Mirror', 4, 'plane', 2, [{ fd: 1 }, { g: { arrow: 1 } }]],
    ['feather-cloak', 'Feather Cloak', 4, 'car', 2, [{ g: { compass: 4, coin: 1 } }]],
    ['tusk-horn', 'Tusk Horn', 4, 'boot', 2, [{ g: { arrow: 2, tablet: 1 } }]],
    ['sky-lens', 'Sky Lens', 4, 'plane', 2, [{ r: 'g' }, { g: { tablet: 1 } }]],
    ['twin-idols', 'Twin Statuettes', 5, 'ship', 3, [{ g: { jewel: 2, coin: 1 } }]],
    ['old-codex', 'Old Codex', 5, 'boot', 3, [{ r: 'n' }, { r: 'n' }]],
    ['gold-mask', 'Sunken Gold Mask', 5, 'car', 4, [{ g: { jewel: 1, arrow: 1 } }]],
    ['stone-heart', 'Stone Heart', 5, 'plane', 3, [{ b: 'i', o: 4 }]],
    ['world-seed', 'World Seed', 5, 'ship', 4, [{ d: 3 }]]
  ];
  // ---- guardians: overcome one for 5 points; its boon is a one-time free action. [id, name, cost, boon, boon text] ----
  var GU = [
    ['mire-crawler', 'Mire Crawler', { arrow: 1, coin: 2 }, [{ g: { jewel: 1 } }]],
    ['stone-ape', 'Stone Ape', { arrow: 2 }, [{ d: 2 }]],
    ['glass-moth', 'Glass Moth', { tablet: 1, jewel: 1 }, [{ r: 'g' }]],
    ['rootback-boar', 'Rootback Boar', { arrow: 1, compass: 2 }, [{ g: { coin: 3 } }]],
    ['tide-serpent', 'Tide Serpent', { jewel: 1, arrow: 1 }, [{ fd: 1 }]],
    ['ember-hound', 'Ember Hound', { arrow: 2, coin: 1 }, [{ x: 1 }]],
    ['moss-golem', 'Moss Golem', { tablet: 2, arrow: 1 }, [{ g: { arrow: 1, tablet: 1 } }]],
    ['howl-bat', 'Howler Bat', { compass: 3, coin: 1 }, [{ g: { compass: 3 } }]],
    ['vine-widow', 'Vine Widow', { jewel: 1, coin: 2 }, [{ r: 'n' }]],
    ['thunder-toad', 'Thunder Toad', { arrow: 1, tablet: 1, coin: 1 }, [{ b: 'a', o: 3 }]],
    ['bone-heron', 'Bone Heron', { tablet: 2, coin: 1 }, [{ g: { jewel: 1 } }]],
    ['ash-jaguar', 'Ash Jaguar', { arrow: 2, jewel: 1 }, [{ g: { jewel: 1, arrow: 1 } }]],
    ['canopy-wyrm', 'Canopy Wyrm', { jewel: 2 }, [{ r: 'g' }, { r: 'n' }]],
    ['temple-cat', 'Temple Lynx', { compass: 2, tablet: 1 }, [{ b: 'i', o: 3 }]],
    ['old-warden', 'The Old Warden', { arrow: 1, jewel: 1, tablet: 1 }, [{ g: { coin: 2, compass: 2 } }]]
  ];
  // ---- dig sites. Level 0 (camp) sites are printed on the board; level 1 and 2 slots are hidden until discovered. ----
  var CAMP = [
    { id: 'c-spring', name: 'Clear Spring', cost: ['boot'], rew: { compass: 1, coin: 1 } },
    { id: 'c-cliff', name: 'Lookout Cliff', cost: ['boot'], rew: { tablet: 1 } },
    { id: 'c-wreck', name: 'Old Wreck', cost: ['ship'], rew: { arrow: 1 } },
    { id: 'c-cove', name: 'Pearl Cove', cost: ['ship'], rew: { coin: 2 } },
    { id: 'c-road', name: 'Logging Road', cost: ['car'], rew: { compass: 2 } }
  ];
  var SLOT1 = [['boot', 'boot'], ['boot', 'boot'], ['ship', 'ship'], ['car', 'car'], ['car', 'ship']];
  var SLOT2 = [['car', 'car', 'boot'], ['ship', 'ship', 'boot'], ['car', 'car', 'car'], ['ship', 'ship', 'ship']];
  var DISC = { 1: 3, 2: 6 };   // compasses to discover a level-1 / level-2 site
  var S1 = [
    ['fern-steps', 'Fern Steps', { tablet: 1, compass: 1 }], ['frog-pool', 'Frog Pool', { arrow: 1, coin: 1 }], ['broken-arch', 'Broken Arch', { tablet: 2 }],
    ['hollow-tree', 'Hollow Tree', { compass: 2, coin: 1 }], ['snake-ford', 'Snake Ford', { arrow: 1, tablet: 1 }], ['moth-cave', 'Moth Cave', { jewel: 1 }],
    ['sunken-well', 'Sunken Well', { coin: 3 }], ['statue-row', 'Statue Row', { arrow: 2 }], ['root-gate', 'Root Gate', { tablet: 1, arrow: 1 }], ['echo-pit', 'Echo Pit', { compass: 3 }]
  ];
  var S2 = [
    ['crystal-vault', 'Crystal Vault', { jewel: 2 }], ['lava-stair', 'Lava Stair', { arrow: 2, jewel: 1 }], ['sky-altar', 'Sky Altar', { tablet: 2, jewel: 1 }], ['drowned-hall', 'Drowned Hall', { jewel: 1, coin: 3 }],
    ['thorn-palace', 'Thorn Palace', { arrow: 2, tablet: 2 }], ['star-pool', 'Star Pool', { jewel: 1, compass: 3 }], ['bone-chapel', 'Bone Chapel', { tablet: 3, arrow: 1 }], ['jade-court', 'Jade Court', { jewel: 2, coin: 1 }]
  ];
  // ---- idols: found on a discovered site (immediate gift); 3 points each, also when set in a shrine slot (a one-time boon; each slot once per game). ----
  var ID = [
    ['idol-owl', 'Owl Idol', { coin: 2 }], ['idol-frog', 'Frog Idol', { compass: 2 }], ['idol-sun', 'Sun Idol', { tablet: 1 }], ['idol-snake', 'Snake Idol', { arrow: 1 }],
    ['idol-moon', 'Moon Idol', { coin: 1, compass: 1 }], ['idol-boar', 'Boar Idol', { arrow: 1 }], ['idol-fish', 'Fish Idol', { coin: 2 }], ['idol-bat', 'Bat Idol', { compass: 2 }],
    ['idol-cat', 'Lynx Idol', { tablet: 1 }], ['idol-bird', 'Heron Idol', { coin: 1, compass: 1 }], ['idol-ape', 'Ape Idol', { arrow: 1 }], ['idol-star', 'Star Idol', { jewel: 1 }]
  ];
  // shrine slot boons (pick one when you set an idol)
  var SHRINE = [{ id: 'sh-coin', ops: [{ g: { coin: 3 } }], text: '3 coins' }, { id: 'sh-compass', ops: [{ g: { compass: 3 } }], text: '3 compasses' },
    { id: 'sh-tablet', ops: [{ g: { tablet: 2 } }], text: '2 tablets' }, { id: 'sh-arrow', ops: [{ g: { arrow: 1 } }, { g: { coin: 1 } }], text: 'arrowhead and coin' }, { id: 'sh-exile', ops: [{ x: 1 }], text: 'exile a card' }];
  var SLOTS = 4;   // shrine slots on each explorer's board
  // ---- research track: rows 1..7, row 8 = the temple. cost to move a token INTO row r; bonus when it arrives; points at the end. ----
  var TRACK = [
    null,
    { cost: { tablet: 1 }, bonus: { coin: 1 } },
    { cost: { arrow: 1 }, bonus: { compass: 2 } },
    { cost: { tablet: 1, coin: 1 }, bonus: { tablet: 1 } },
    { cost: { jewel: 1 }, bonus: { arrow: 1 } },
    { cost: { tablet: 2 }, bonus: { coin: 2 } },
    { cost: { arrow: 1, jewel: 1 }, bonus: { jewel: 1 } },
    { cost: { tablet: 1, arrow: 1 }, bonus: { compass: 3 } },
    { cost: { jewel: 1, tablet: 1 }, bonus: { arrow: 1 } }
  ];
  // first-arrival rewards: only the FIRST magnifier to reach these rows takes the extra reward (every arrival still takes the row bonus)
  var FIRST = { 2: { tablet: 1 }, 4: { coin: 2, arrow: 1 }, 6: { jewel: 1 }, 7: { tablet: 1, arrow: 1 } };
  var DREAD_SUPPLY = 19;   // Dread cards in the box (2 start in each deck); when they run out, a fear tile worth -2 instead
  var NOTE_VP = [0, 1, 2, 4, 6, 9, 12, 15, 19], GLASS_VP = [0, 0, 1, 2, 3, 4, 6, 8, 10], TOP = 8;
  // temple tiles (bought with the research action once your glass is in the temple)
  // three stacks: 6 points for the left two cost parts, 6 for the right two, 11 for all three (parts: 2 tablets | 1 jewel | 2 arrowheads)
  var TEMPLE = [{ vp: 6, cost: { tablet: 2, jewel: 1 }, n: 8 }, { vp: 6, cost: { jewel: 1, arrow: 2 }, n: 8 }, { vp: 11, cost: { tablet: 2, jewel: 1, arrow: 2 }, n: 4 }];
  var TEMPLE_ARRIVE = [10, 8, 6, 4];   // magnifier points in the temple row, by order of arrival
  var GUARD_VP = 5, IDOL_VP = 3, IDOL_USED_VP = 3, IDOL_SLOT_VP = [1, 1, 1, 2], ROUNDS = 5, HAND = 5, ROW = 6, EXPL = 2;
  var START = [{ coin: 2, compass: 0 }, { coin: 1, compass: 1 }, { coin: 2, compass: 1 }, { coin: 1, compass: 2 }];   // by turn order (rulebook)
  // ---- rival expedition (solo): one card per turn; each does the first thing it can. ----
  var RIVAL = [
    { id: 'rv-camp', name: 'Pitch camp', text: 'Takes a free camp site.', a: 'camp' }, { id: 'rv-camp2', name: 'Pitch camp', text: 'Takes a free camp site.', a: 'camp' },
    { id: 'rv-buyi', name: 'Raid the market', text: 'Takes the cheapest item: its points.', a: 'buyi' }, { id: 'rv-buya', name: 'Loot a relic', text: 'Takes the cheapest artifact: its points.', a: 'buya' },
    { id: 'rv-study', name: 'Study', text: 'Climbs one research row.', a: 'study' }, { id: 'rv-study2', name: 'Study', text: 'Climbs one research row.', a: 'study' },
    { id: 'rv-scout', name: 'Scout ahead', text: 'Discovers a site: 2 points; a guardian wakes.', a: 'scout' }, { id: 'rv-hunt', name: 'Hunt', text: 'Overcomes a waiting guardian: 4 points.', a: 'hunt' }
  ];
  function mk(arr, t) { var o = {}; arr.forEach(function (r) { o[r[0]] = { id: r[0], t: t, name: r[1], cost: r[2], tr: r[3], vp: r[4], ops: r[5] }; }); return o; }
  var CARDS = Object.assign({}, BASIC, mk(I, 'item'), mk(A, 'art'));
  var GUARD = {}; GU.forEach(function (r) { GUARD[r[0]] = { id: r[0], name: r[1], cost: r[2], boon: r[3] }; });
  var SITE = {}; S1.forEach(function (r) { SITE[r[0]] = { id: r[0], lvl: 1, name: r[1], rew: r[2] }; }); S2.forEach(function (r) { SITE[r[0]] = { id: r[0], lvl: 2, name: r[1], rew: r[2] }; });
  CAMP.forEach(function (c) { SITE[c.id] = { id: c.id, lvl: 0, name: c.name, rew: c.rew }; });
  var IDOL = {}; ID.forEach(function (r) { IDOL[r[0]] = { id: r[0], name: r[1], gift: r[2] }; });
  // plain-words text of an op list
  function opText(ops) {
    return (ops || []).map(function (o) {
      if (o.g) return 'gain ' + resText(o.g);
      if (o.p) return 'pay ' + resText(o.p);
      if (o.d) return 'draw ' + o.d + ' card' + (o.d > 1 ? 's' : '');
      if (o.x) return 'exile a card';
      if (o.r) return 'free research step (' + (o.r === 'g' ? 'magnifier' : 'notebook') + ')';
      if (o.b) return 'buy ' + (o.b === 'i' ? 'an item' : 'an artifact') + ' ' + o.o + ' cheaper';
      if (o.fd) return 'dig at a site with no travel cost';
      if (o.or) return o.or.map(function (x) { return x.length ? opText(x) : 'nothing'; }).join(' OR ');
      return '';
    }).join(', then ');
  }
  function resText(r) { return Object.keys(r).map(function (k) { return r[k] + ' ' + RNAME[k] + (r[k] > 1 ? (k === 'compass' ? 'es' : 's') : ''); }).join(' + '); }
  Object.keys(CARDS).forEach(function (k) { var c = CARDS[k]; if (!c.text) c.text = opText(c.ops).replace(/^./, function (m) { return m.toUpperCase(); }) + '.'; });
  Object.keys(GUARD).forEach(function (k) { var g = GUARD[k]; g.text = 'Boon: ' + opText(g.boon) + '.'; });

  // ---- STORY: every narrative line of the guided prologue and Quick games in one place (Story chapters live in campaign.json). See STORY.md.
  var STORY = {
    guide: { name: 'Pell Ardent', short: 'Pell', mark: 'P' }, rival: { name: 'Tamsin Reed', why: 'wants the temple map for her museum' },
    tut: {
      hand: ['Ch 1 · Landfall', 'The boat is gone and Tamsin is already ashore. Trail Notes will point us inland.'],
      play: ['Ch 1 · Landfall', 'One action a turn, then Tamsin moves. Play it: +1 compass.'],
      ruin: ['Ch 2 · The ruin', 'Tamsin grabbed a camp. Fine: 3 compasses find what she can’t. That hidden ruin.'],
      disc: ['Ch 2 · The ruin', 'Your two Dread cards pay the two Boots. Fear is good for something!'],
      idol: ['Ch 2 · The ruin', 'An idol, 3 points! And something stirs. Idols can wake a shrine: free.'],
      shrine: ['Ch 2 · The ruin', 'The shrine gives 3 coins. Its slot was worth 1 point; the coins buy more.'],
      beat: ['Ch 2 · The guardian', 'The Glass Moth guards our ruin. You carry a tablet and a jewel: face it.'],
      over: ['Ch 2 · The guardian', 'Pay its price and it’s ours: 5 points and a boon to use later.'],
      boon: ['Ch 3 · Supplies', 'Tamed! Its boon is free, any time. Use it now.'],
      useboon: ['Ch 3 · Supplies', 'The Moth lights the research track: your magnifier climbs a row.'],
      market: ['Ch 3 · Supplies', 'Research pays at the end. Now shop: Tamsin is out of explorers.'],
      buy: ['Ch 3 · Supplies', 'Items cost coins and sleep under your deck until you draw them.'],
      pass: ['Ch 3 · Supplies', 'Nothing left worth a move. Pass: when all pass, the round ends.'],
      dig: ['Ch 4 · Last light', 'New day: explorers home, fresh hand, market shifted. Last round! Dig a camp.'],
      digit: ['Ch 4 · Last light', 'Pay its travel with a card and haul the loot home.'],
      pass2: ['Ch 4 · Last light', 'The light is going. Pass, and we count the finds.'],
      score: ['Ch 4 · The count', '']
    },
    endWin: 'You beat Tamsin to the temple trail. The island is waiting.', endLose: 'Tamsin edged it, but now you know the island. Rematch?',
    quick: { intro: ['Fresh footprints on the beach: someone landed before you.', 'Storm clouds over the vines. Five rounds before the rain.', 'A rival crew hums at their campfire. Outdig them.'],
      win: 'The island remembers your name.', lose: 'The vines close behind you. Come back stronger.' }
  };
  var VD = { STORY: STORY, RES: RES, RNAME: RNAME, TRAVEL: TRAVEL, TNAME: TNAME, CARDS: CARDS, ITEMS: I.map(function (r) { return r[0]; }), ARTS: A.map(function (r) { return r[0]; }),
    GUARD: GUARD, GUARDS: GU.map(function (r) { return r[0]; }), SITE: SITE, CAMP: CAMP, SLOT1: SLOT1, SLOT2: SLOT2, DISC: DISC, S1: S1.map(function (r) { return r[0]; }), S2: S2.map(function (r) { return r[0]; }),
    IDOL: IDOL, IDOLS: ID.map(function (r) { return r[0]; }), SHRINE: SHRINE, SLOTS: SLOTS, TRACK: TRACK, FIRST: FIRST, DREAD_SUPPLY: DREAD_SUPPLY, NOTE_VP: NOTE_VP, GLASS_VP: GLASS_VP, TOP: TOP, TEMPLE: TEMPLE, TEMPLE_ARRIVE: TEMPLE_ARRIVE,
    GUARD_VP: GUARD_VP, IDOL_SLOT_VP: IDOL_SLOT_VP, IDOL_VP: IDOL_VP, IDOL_USED_VP: IDOL_USED_VP, ROUNDS: ROUNDS, HAND: HAND, ROW: ROW, EXPL: EXPL, START: START, RIVAL: RIVAL, opText: opText, resText: resText };
  if (typeof module !== 'undefined' && module.exports) module.exports = VD; else root.VD = VD;
})(typeof window !== 'undefined' ? window : this);
