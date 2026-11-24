// Wickdeep data: our own heroes, cards, monsters, items and story. All names and designs are original to this game.
// Card text is a tiny language (see engine.js parse): m3 move, a3 attack, r3 range, h2 heal, s1 shield, R1 retaliate, I:fire infuse, C:fire:+2 consume...
(function (g) {
  'use strict';
  var D = {};
  D.EL_NAME = { fire: 'Fire', ice: 'Frost', air: 'Wind', earth: 'Earth', light: 'Light', dark: 'Dark' };
  D.COND_NAME = { poi: 'Poison', wnd: 'Wound', imm: 'Stuck', dis: 'Disarm', stn: 'Stun', mud: 'Muddle', inv: 'Hidden', str: 'Strong', crs: 'Curse' };
  D.COND_TIP = { poi: 'Hits on it deal +1. Healing only cures it.', wnd: 'Loses 1 HP at the start of its turn.', imm: 'Cannot move on its next turn.', dis: 'Cannot attack on its next turn.',
    stn: 'Skips its next turn.', mud: 'Its attacks draw two cards, worse one counts.', inv: 'Enemies cannot target it.', str: 'Its attacks draw two cards, better one counts.', crs: 'A miss card goes into its deck once.' };

  // ---------------- heroes ----------------
  // hand = cards you carry; hp = HP at levels 1..9. cards: [id, name, level ('1', 'X' or 2..9), initiative, top, bottom]
  var HI = [10, 12, 14, 16, 18, 20, 22, 24, 26], MID = [8, 9, 11, 12, 14, 15, 17, 18, 20], LOW = [6, 7, 8, 9, 10, 11, 12, 13, 14];
  D.HERO = {
    warden: { n: 'Wickwarden', role: 'Front line: shields and burning hits', tile: 96, hand: 10, hp: HI, col: '#e8a33c',
      blurb: 'A knight of the last candles. Stands in front and takes the hits.',
      cards: [
        ['ww01', 'Tallow Bash', '1', 32, 'a3', 'm3'],
        ['ww02', 'Candle Guard', '1', 12, 'a2 imm', 's2'],
        ['ww03', 'Wickflare', '1', 20, 'a3, I:light, xp1', 'm2, h2 self'],
        ['ww04', 'Lantern Swing', '1', 45, 'a2 all', 'm4'],
        ['ww05', 'Molten Grip', '1', 18, 'a2 imm, xp1', 'm3'],
        ['ww06', 'Holdfast', '1', 8, 'R2 C:light:+1, xp1', 's1, m2'],
        ['ww07', 'Hot Wax Hurl', '1', 60, 'a2 r3 C:light:+2', 'm3, L1'],
        ['ww08', 'Vigil', '1', 75, 'p:shd:1:4, lost, xp1', 'm4'],
        ['ww09', 'Brazier Rush', '1', 38, 'a4, lost, xp2', 'm2, a1 push1'],
        ['ww10', 'Ember Oath', '1', 70, 'h3 self, I:fire', 'm3, s1'],
        ['ww11', 'Bell of Iron', 'X', 25, 'a3 stn, lost, xp2', 'm3'],
        ['ww12', 'Grease Fire', 'X', 55, 'a2 all C:fire:wnd', 'm3, I:fire'],
        ['ww13', 'Shoulder Charge', 'X', 30, 'a3 push2', 'j3'],
        ['ww14', 'Soot Cloak', 2, 22, 'a3 mud, xp1', 'm4'],
        ['ww15', 'Waxen Shell', 2, 10, 's3, lost, xp1', 'm3, h2 self'],
        ['ww16', 'Searing Brand', 3, 28, 'a4 wnd, xp1', 'm3, I:fire'],
        ['ww17', 'Steadfast', 3, 14, 'p:ret:2:4, lost, xp2', 'm4'],
        ['ww18', 'Lantern Cleave', 4, 40, 'a3 all, I:light, xp1', 'm4'],
        ['ww19', 'Cinder Step', 4, 35, 'a4 C:fire:+2', 'j4'],
        ['ww20', 'Unmoving', 5, 9, 's2 r1, R2, xp2', 'm3'],
        ['ww21', 'Wickstorm', 5, 50, 'a3 r2 t3, lost, xp2', 'm5'],
        ['ww22', 'Burning Halo', 6, 16, 'a3 all C:light:stn, xp2', 'h4 self'],
        ['ww23', 'Iron Candle', 6, 26, 'a6, lost, xp2', 'm4, s1'],
        ['ww24', 'Flareback', 7, 11, 'p:ret:3:5, lost, xp2', 'm5'],
        ['ww25', 'Pillar of Wax', 7, 33, 'a5 imm push1, xp2', 'm3, s2'],
        ['ww26', 'Smoulder', 8, 24, 'a4 wnd poi', 'm4, I:fire'],
        ['ww27', 'Last Light', 8, 7, 's4, R3, lost, xp3', 'm5'],
        ['ww28', 'Sun in a Jar', 9, 44, 'a5 all C:light:+2, lost, xp3', 'j5'],
        ['ww29', 'Everflame', 9, 13, 'p:atk:2:4, lost, xp3', 'm5, h3 self']
      ] },
    ringer: { n: 'Bellringer', role: 'Ranged: knockback and stuns', tile: 99, hand: 10, hp: MID, col: '#7fb6d9',
      blurb: 'Rings a cracked bronze bell. The sound hits like a hammer.',
      cards: [
        ['br01', 'Toll', '1', 22, 'a2 r3 push1', 'm3'],
        ['br02', 'Knell', '1', 41, 'a3 r3 C:air:+1', 'm3, I:air'],
        ['br03', 'Hum of the Deep', '1', 15, 'a1 r3 splash, xp1', 'm4'],
        ['br04', 'Dull Clang', '1', 58, 'a2 r2 mud', 'm3, L1'],
        ['br05', 'Cracked Bell', '1', 33, 'a4 r3, lost, xp2', 'm4'],
        ['br06', 'Ringing Ears', '1', 12, 'a2 r2 stn, lost, xp1', 'm3'],
        ['br07', 'Echo Step', '1', 64, 'a3', 'j4'],
        ['br08', 'Sound Wall', '1', 19, 's1 r2', 'm3, I:air'],
        ['br09', 'Low Note', '1', 70, 'a2 r3 C:dark:poi, xp1', 'm3'],
        ['br10', 'Resonance', '1', 47, 'p:atk:1:3, lost, xp1', 'm4'],
        ['br11', 'Peal', 'X', 27, 'a2 r3 t2', 'm3'],
        ['br12', 'Thunder Bell', 'X', 52, 'a3 r2 splash C:air:push1, lost, xp2', 'm3, I:air'],
        ['br13', 'Silence', 'X', 10, 'a2 r3 dis, xp1', 'm2, self:inv'],
        ['br14', 'Hollow Ring', 2, 30, 'a3 r3 push2, xp1', 'm4'],
        ['br15', 'Shatter Note', 2, 44, 'a4 r2 P2, xp1', 'm3, I:dark'],
        ['br16', 'Choir of Bats', 3, 26, 'a2 r3 t3, lost, xp2', 'm4'],
        ['br17', 'Deafen', 3, 17, 'a2 r3 stn, xp1', 'm3'],
        ['br18', 'Long Peal', 4, 55, 'a3 r5, xp1', 'm5'],
        ['br19', 'Undertow Hum', 4, 36, 'a3 r3 pull2 C:dark:+2', 'm3'],
        ['br20', 'Grand Toll', 5, 49, 'a4 r3 splash, lost, xp2', 'm4'],
        ['br21', 'Tuning', 5, 13, 'p:atk:1:5, lost, xp2', 'm4, s1'],
        ['br22', 'Crack the Air', 6, 31, 'a3 r3 t2 C:air:+1t, xp1', 'j4'],
        ['br23', 'Bell Rope', 6, 62, 'a4 pull1 imm', 'm5'],
        ['br24', 'Death Knell', 7, 39, 'a6 r3, lost, xp3', 'm4, I:dark'],
        ['br25', 'Ward Chime', 7, 14, 's2 r2, xp2', 'm5'],
        ['br26', 'Shock Wave', 8, 23, 'a3 all push2 stn, lost, xp2', 'm5'],
        ['br27', 'Night Peal', 8, 46, 'a4 r4 C:dark:+2, xp1', 'm4, L2'],
        ['br28', 'Toll for the Tide', 9, 20, 'a5 r4 splash stn, lost, xp3', 'm5'],
        ['br29', 'Perfect Pitch', 9, 34, 'a4 r5 t2, xp2', 'j5']
      ] },
    ratter: { n: 'Ratcatcher', role: 'Quick knives, poison and pet ferrets', tile: 112, hand: 9, hp: MID, col: '#9bc46a',
      blurb: 'Lives in the sewers with a bag of ferrets. Fights dirty.',
      cards: [
        ['rc01', "Sic 'Em", '1', 24, 'sum:ferret, lost, xp1', 'm3'],
        ['rc02', 'Gutting Knife', '1', 18, 'a3 poi', 'm4'],
        ['rc03', 'Snare Line', '1', 40, 'a2 r2 imm', 'm3'],
        ['rc04', 'Rat Poison', '1', 35, 'a2 r2 poi C:earth:+2', 'm3, I:earth'],
        ['rc05', 'Scuttle', '1', 9, 'a2 mud', 'j4'],
        ['rc06', 'Bag of Rats', '1', 52, 'sum:ratswarm, lost, xp1', 'm3, L1'],
        ['rc07', 'Sewer Sense', '1', 70, 'a3 C:earth:wnd', 'm3, L1'],
        ['rc08', 'Hamstring', '1', 28, 'a3 wnd, xp1', 'm3'],
        ['rc09', 'Burrow Out', '1', 60, 'a4, lost, xp2', 'm3, h2 self'],
        ['rc10', 'Cheese Lure', 'X', 30, 'a2 r3 pull2', 'm4'],
        ['rc11', 'Plague Kiss', 'X', 21, 'a2 poi wnd, xp1', 'm3, I:earth'],
        ['rc12', 'Weasel Out', 'X', 7, 'a2 dis', 'm3, s1'],
        ['rc13', 'Ferret Pack', 2, 25, 'sum:ferret2, lost, xp2', 'm4'],
        ['rc14', 'Sting', 2, 16, 'a3 r2 poi, xp1', 'm4'],
        ['rc15', 'Gnaw', 3, 34, 'a4 wnd', 'm3, L1'],
        ['rc16', 'Muck Bomb', 3, 44, 'a2 r3 splash mud, xp1', 'm3, I:earth'],
        ['rc17', 'Pack Tactics', 4, 11, 'p:atk:1:4, lost, xp2', 'm4'],
        ['rc18', 'Ankle Biter', 4, 38, 'a3 imm poi', 'j4'],
        ['rc19', "Rat King's Gift", 5, 55, 'sum:ratking, lost, xp2', 'm4'],
        ['rc20', 'Twin Knives', 5, 19, 'a3 t2, xp1', 'm4'],
        ['rc21', 'Toxic Cloud', 6, 42, 'a3 r2 splash poi C:earth:+1, lost, xp2', 'm5'],
        ['rc22', 'Slip Away', 6, 8, 'a3', 'm4, self:inv'],
        ['rc23', 'Open Vein', 7, 27, 'a5 wnd, xp2', 'm4'],
        ['rc24', 'Swarm Rush', 7, 33, 'a2 all poi', 'j5'],
        ['rc25', 'Gutter Feast', 8, 46, 'a4 C:earth:h3, xp1', 'm5'],
        ['rc26', 'Hidden Blade', 8, 12, 'a6 P2, lost, xp3', 'm4'],
        ['rc27', 'Night of Rats', 9, 50, 'sum:ratking, lost, xp2', 'm5'],
        ['rc28', 'Pest Plague', 9, 22, 'a4 r3 t3 poi, lost, xp3', 'm5, L1']
      ] },
    lamp: { n: 'Lamplighter', role: 'Healer: blessings and fire', tile: 84, hand: 11, hp: LOW, col: '#f2d36b',
      blurb: 'Keeps the lamps of the deep lit. Mends friends, burns foes.',
      cards: [
        ['ll01', 'Kindle', '1', 20, 'a2 r3, I:fire', 'm3'],
        ['ll02', 'Mend Wick', '1', 66, 'h3 r3', 'm3'],
        ['ll03', 'Spark Throw', '1', 35, 'a3 r3 C:fire:+1, xp1', 'm3'],
        ['ll04', 'Lantern Glow', '1', 52, 'h2 r3 all, lost, xp2', 'm3, I:light'],
        ['ll05', 'Blinding Flash', '1', 14, 'a2 r2 mud t2', 'm4'],
        ['ll06', 'Hearth Blessing', '1', 75, 'bless, lost, xp1', 'm3'],
        ['ll07', 'Fire Ward', '1', 28, 's1 r2, xp1', 'm3, h2 self'],
        ['ll08', 'Ember Darts', '1', 40, 'a2 r3 t2', 'm3'],
        ['ll09', 'Wildfire', '1', 59, 'a3 r2 splash C:fire:wnd, lost, xp2', 'm4'],
        ['ll10', 'Oil Spill', '1', 44, 'a2 r3 imm', 'm3, L1'],
        ['ll11', 'Warm Hands', '1', 80, 'h4 r1', 'm2, s1'],
        ['ll12', 'Sunburst', 'X', 11, 'a2 all C:light:stn', 'm3, I:light'],
        ['ll13', 'Smoke Veil', 'X', 25, 'a1 r3 t3', 'm3, I:fire'],
        ['ll14', 'Rekindle', 'X', 63, 'rec:1, lost, xp1', 'm3, h2 self'],
        ['ll15', 'Flame Lash', 2, 32, 'a3 r3 push1, xp1', 'm4'],
        ['ll16', 'Candlemass', 2, 70, 'h3 r3 C:light:+2', 'm3, I:light'],
        ['ll17', 'Firebloom', 3, 41, 'a3 r3 splash, lost, xp2', 'm4'],
        ['ll18', 'Guiding Light', 3, 16, 'a2 r4 C:light:stn, xp1', 'm4'],
        ['ll19', 'Phoenix Wick', 4, 85, 'h5 r2, lost, xp2', 'm3, I:fire'],
        ['ll20', 'Scorch', 4, 30, 'a4 r2 wnd', 'm4'],
        ['ll21', 'Halo of Embers', 5, 24, 'p:shd:1:6, lost, xp2', 'm4'],
        ['ll22', 'Fire Rain', 5, 47, 'a2 r3 t3 C:fire:+1, xp1', 'm4'],
        ['ll23', 'Lantern March', 6, 60, 'h2 r3 all, xp2', 'j4'],
        ['ll24', 'Blaze', 6, 37, 'a5 r3, lost, xp2', 'm4'],
        ['ll25', 'Dawnbreak', 7, 13, 'a3 r3 splash stn C:light:+1, lost, xp3', 'm5'],
        ['ll26', 'Second Wind', 7, 72, 'h3 r3, bless', 'm4'],
        ['ll27', 'Inferno', 8, 43, 'a4 r2 splash wnd C:fire:+2, lost, xp3', 'm5'],
        ['ll28', 'Kind Fire', 8, 66, 'h4 r4', 'm5, I:light'],
        ['ll29', 'Last Candle', 9, 90, 'h4 r4 all, lost, xp3', 'm5'],
        ['ll30', 'Star Wick', 9, 21, 'a5 r4 t2 C:light:+2, xp2', 'j5']
      ] }
  };
  D.HERO_ORDER = ['warden', 'ringer', 'ratter', 'lamp'];
  D.CARD = {};
  Object.keys(D.HERO).forEach(function (h) {
    D.HERO[h].cards.forEach(function (c) { D.CARD[c[0]] = { id: c[0], hero: h, n: c[1], lvl: c[2], i: c[3], top: c[4], bot: c[5] }; });
  });
  D.defaultHand = function (cls) { return D.HERO[cls].cards.filter(function (c) { return c[2] === '1'; }).map(function (c) { return c[0]; }); };
  D.cardPool = function (cls, lvl, picked) {   // cards a hero may bring: level 1 + X + one picked card per level reached
    return D.HERO[cls].cards.filter(function (c) { return c[2] === '1' || c[2] === 'X' || (picked || []).indexOf(c[0]) >= 0; }).map(function (c) { return c[0]; });
  };
  D.XP_LEVEL = [0, 45, 95, 150, 210, 275, 345, 420, 500];
  D.levelFor = function (xp) { var l = 1; while (l < 9 && xp >= D.XP_LEVEL[l]) l++; return l; };

  // perks: each changes the hero's attack modifier deck
  function pk(text, fx, n) { return { text: text, fx: fx, n: n || 1 }; }
  var rm = function (v, n) { return { v: v, n: n }; }, ad = function (v, n, o) { var x = { v: v, n: n }; if (o) for (var k in o) x[k] = o[k]; return x; };
  D.HERO.warden.perks = [pk('Remove two -1 cards', { rm: [rm(-1, 2)] }, 2), pk('Swap a -1 for a +1', { rm: [rm(-1, 1)], add: [ad(1, 1)] }, 2), pk('Swap a +0 for a +2', { rm: [rm(0, 1)], add: [ad(2, 1)] }),
    pk('Add two rolling +1', { add: [ad(1, 2, { roll: 1 })] }), pk('Add a +1 that sticks foes', { add: [ad(1, 1, { c: 'imm' })] }, 2), pk('Add a +2 that lights the room', { add: [ad(2, 1, { e: 'light' })] }),
    pk('Add a rolling heal 1', { add: [ad(0, 1, { roll: 1, heal: 1 })] }), pk('Remove the -2', { rm: [rm(-2, 1)] })];
  D.HERO.ringer.perks = [pk('Remove two -1 cards', { rm: [rm(-1, 2)] }, 2), pk('Swap a +0 for a +1 that muddles', { rm: [rm(0, 1)], add: [ad(1, 1, { c: 'mud' })] }, 2), pk('Add two rolling +1', { add: [ad(1, 2, { roll: 1 })] }),
    pk('Add a +1 that stuns', { add: [ad(1, 1, { c: 'stn' })] }), pk('Add a +1 that calls wind', { add: [ad(1, 1, { e: 'air' })] }, 2), pk('Swap the -2 for a +0', { rm: [rm(-2, 1)], add: [ad(0, 1)] }),
    pk('Add a +2 that calls dark', { add: [ad(2, 1, { e: 'dark' })] }), pk('Swap a -1 for a +1', { rm: [rm(-1, 1)], add: [ad(1, 1)] })];
  D.HERO.ratter.perks = [pk('Remove two -1 cards', { rm: [rm(-1, 2)] }, 2), pk('Add two rolling poison', { add: [ad(0, 2, { roll: 1, c: 'poi' })] }), pk('Add a +1 that wounds', { add: [ad(1, 1, { c: 'wnd' })] }, 2),
    pk('Swap a +0 for a +2', { rm: [rm(0, 1)], add: [ad(2, 1)] }, 2), pk('Add a +1 that calls earth', { add: [ad(1, 1, { e: 'earth' })] }), pk('Add two rolling +1', { add: [ad(1, 2, { roll: 1 })] }), pk('Remove the -2', { rm: [rm(-2, 1)] })];
  D.HERO.lamp.perks = [pk('Remove two -1 cards', { rm: [rm(-1, 2)] }, 2), pk('Add a rolling heal 2', { add: [ad(0, 1, { roll: 1, heal: 2 })] }, 2), pk('Add a +1 that calls fire', { add: [ad(1, 1, { e: 'fire' })] }, 2),
    pk('Swap a +0 for a +2 that calls light', { rm: [rm(0, 1)], add: [ad(2, 1, { e: 'light' })] }), pk('Add two rolling +1', { add: [ad(1, 2, { roll: 1 })] }), pk('Swap a -1 for a +1', { rm: [rm(-1, 1)], add: [ad(1, 1)] }), pk('Remove the -2', { rm: [rm(-2, 1)] })];
  // expand "n" (a perk you may take n times) into separate perk slots
  Object.keys(D.HERO).forEach(function (h) { var out = []; D.HERO[h].perks.forEach(function (p) { for (var i = 0; i < p.n; i++) out.push({ text: p.text, fx: p.fx }); }); D.HERO[h].perks = out; });

  // summons (stay until killed; act just before their owner)
  D.SUMMON = {
    ferret: { n: 'Ferret', tile: 123, hp: 4, hpL: 1, mv: 3, atk: 2, act: 'm+0, a+0' },
    ferret2: { n: 'Ferret Pack', tile: 123, hp: 6, hpL: 1, mv: 3, atk: 2, act: 'm+0, a+0 poi' },
    ratswarm: { n: 'Rat Swarm', tile: 123, hp: 3, mv: 2, atk: 1, act: 'm+0, a+0 poi' },
    ratking: { n: 'Rat King', tile: 123, hp: 8, hpL: 1, mv: 3, atk: 3, act: 'm+0, a+0 wnd' }
  };

  // ---------------- monsters ----------------
  // stats per scenario level L (0..7): hp = h0 + floor(hs*L), atk = a0 + floor(as*L); elites: hp x1.6, +1 attack, +1 shield if it has one
  D.MON = {
    rat:    { n: 'Mire Rat', tile: 123, deck: 'swarm', h0: 2, hs: 0.7, mv: 3, a0: 1, as: 0.4, tip: 'Fast and weak. Comes in packs.' },
    bat:    { n: 'Bell Bat', tile: 120, deck: 'stalker', h0: 3, hs: 0.7, mv: 4, a0: 1, as: 0.45, fly: 1, tip: 'Flies over traps and walls of foes.' },
    spider: { n: 'Loom Spider', tile: 122, deck: 'stalker', h0: 3, hs: 0.9, mv: 3, a0: 2, as: 0.4, poi: 1, tip: 'Its bite poisons.' },
    ooze:   { n: 'Ink Ooze', tile: 108, deck: 'ooze', h0: 5, hs: 1.2, mv: 1, a0: 2, as: 0.45, shd: 1, tip: 'Slow, tough, soaks up hits.' },
    hush:   { n: 'Hush', tile: 121, deck: 'caster', h0: 3, hs: 0.8, mv: 2, a0: 2, as: 0.4, rng: 3, fly: 1, mud: 1, tip: 'A floating silence. Muddles from afar.' },
    monk:   { n: 'Drowned Monk', tile: 111, deck: 'caster', h0: 4, hs: 1, mv: 2, a0: 2, as: 0.45, rng: 3, tip: 'Throws brine from range.' },
    wight:  { n: 'Tallow Wight', tile: 85, deck: 'brute', h0: 6, hs: 1.3, mv: 2, a0: 3, as: 0.45, tip: 'A body of old candle wax. Hits hard.' },
    ogre:   { n: 'Quarry Ogre', tile: 109, deck: 'brute', h0: 9, hs: 1.8, mv: 2, a0: 4, as: 0.5, tip: 'Huge. Keep away from its fists.' },
    crab:   { n: 'Brine Crab', tile: 110, deck: 'guard', h0: 4, hs: 0.9, mv: 2, a0: 2, as: 0.4, shd: 2, tip: 'Hard shell: shield 2.' },
    hound:  { n: 'Bilge Hound', tile: 124, deck: 'beast', h0: 4, hs: 1, mv: 4, a0: 2, as: 0.45, wnd: 0, tip: 'Runs you down.' },
    mimic:  { n: 'Lid Biter', tile: 92, deck: 'guard', h0: 7, hs: 1.5, mv: 1, a0: 4, as: 0.5, ret: 1, tip: 'A chest with teeth. Bites back.' },
    ghoul:  { n: 'Chain Ghoul', tile: 97, deck: 'brute', h0: 7, hs: 1.4, mv: 3, a0: 3, as: 0.45, ret: 1, tip: 'Covered in chains: hits back for 1.' },
    bandit: { n: 'Saltknife', tile: 86, deck: 'stalker', h0: 4, hs: 1, mv: 3, a0: 3, as: 0.4, tip: 'A smuggler with a salt-crusted blade.' },
    archer: { n: 'Wax Archer', tile: 98, deck: 'archer', h0: 3, hs: 0.9, mv: 2, a0: 2, as: 0.45, rng: 4, tip: 'Shoots from far away.' },
    acolyte:{ n: 'Ash Acolyte', tile: 87, deck: 'caster', h0: 4, hs: 0.9, mv: 2, a0: 3, as: 0.4, rng: 3, tip: 'Burns you from range.' },
    thrall: { n: 'Tide Thrall', tile: 100, deck: 'guard', h0: 6, hs: 1.2, mv: 2, a0: 2, as: 0.45, shd: 1, tip: 'Sea-soaked guard: shield 1.' }
  };
  D.monStats = function (type, L, elite) {
    var m = D.MON[type], hp = m.h0 + Math.floor(m.hs * L), at = m.a0 + Math.floor(m.as * L);
    var s = { hp: hp, mv: m.mv, atk: at, rng: m.rng || 0, shd: m.shd || 0, ret: m.ret || 0, fly: m.fly, poi: m.poi, wnd: m.wnd, mud: m.mud, tg: 1, pierce: 0 };
    if (elite) { s.hp = Math.ceil(hp * 1.6); s.atk = at + 1; if (s.shd) s.shd++; if (s.ret) s.ret++; if (L >= 4 && !s.shd) s.shd = 1; }
    return s;
  };
  D.BOSS = {
    matron: { n: 'Wax Matron', tile: 99, deck: 'boss', h0: 7, hs: 2, mv: 2, a0: 3, as: 0.5, imm: ['stn', 'dis'], tip: 'Mother of the tallow dead.',
      sp: [{ text: 'Calls a Tallow Wight', a: 'sum:wight, h2' }, { text: 'Melt wave: hits all next to her', a: 'm+1, a+0 all' }] },
    engine: { n: 'Knell Engine', tile: 110, deck: 'boss', h0: 9, hs: 2, mv: 0, a0: 3, as: 0.5, rng: 3, shd: 1, imm: ['stn', 'imm', 'dis', 'mud', 'poi', 'wnd'], tip: 'A bell machine. Never moves.',
      sp: [{ text: 'Rings: hits three, muddles', a: 'a+0 t3 mud' }, { text: 'Repairs itself', a: 's2, h3' }] },
    abbot: { n: 'Drowned Abbot', tile: 111, deck: 'boss', h0: 9, hs: 2.5, mv: 2, a0: 3, as: 0.6, rng: 3, imm: ['stn', 'imm'], tip: 'He leads the drowned choir.',
      sp: [{ text: 'Raises a Drowned Monk', a: 'sum:monk, h2' }, { text: 'Brine storm: two targets, poison', a: 'a+1 t2 poi' }] },
    unlit: { n: 'The Unlit', tile: 121, deck: 'boss', h0: 12, hs: 3, mv: 3, a0: 4, as: 0.6, fly: 1, imm: ['stn', 'imm', 'dis', 'mud', 'crs'], tip: 'The dark that ate the abbey.',
      sp: [{ text: 'Calls a Hush and lashes out', a: 'sum:hush, m+0, a+0 all' }, { text: 'Snuffs light: three targets', a: 'a+1 r3 t3 mud, h3' }] }
  };
  D.bossHp = function (b, L, C) { var x = D.BOSS[b]; return Math.round((x.h0 + x.hs * L) * C); };
  D.bossAtk = function (b, L) { var x = D.BOSS[b]; return x.a0 + Math.floor(x.as * L); };
  // monster ability decks: 8 cards per family, sh = reshuffle at round end
  D.MDECK = {
    brute: [{ i: 11, a: 's1, a+0', sh: 1 }, { i: 28, a: 'm+0, a+0' }, { i: 32, a: 'm+1, a-1' }, { i: 47, a: 'm-1, a+1' }, { i: 61, a: 'm+0, a+0 push1' }, { i: 68, a: 'm+1, a+0', sh: 1 }, { i: 74, a: 'm-1, a+1 t2' }, { i: 85, a: 'a+2' }],
    swarm: [{ i: 7, a: 'm+1, a-1' }, { i: 15, a: 'm+0, a+0' }, { i: 23, a: 'm+2, a-1' }, { i: 29, a: 'm+1, a+0', sh: 1 }, { i: 43, a: 'm+0, a+0 poi' }, { i: 51, a: 'm-1, a+1' }, { i: 63, a: 'm+1, a+1', sh: 1 }, { i: 72, a: 'm+0, a+0, I:earth' }],
    stalker: [{ i: 6, a: 'm+1, a-1 mud' }, { i: 13, a: 'm+2, a-1' }, { i: 24, a: 'm+0, a+1' }, { i: 33, a: 'm+1, a+0', sh: 1 }, { i: 40, a: 'm+0, a+0 wnd' }, { i: 55, a: 'm+2, a+0' }, { i: 64, a: 'm-1, a+2', sh: 1 }, { i: 79, a: 'm+1, a+0, I:dark' }],
    archer: [{ i: 16, a: 'm+1, a-1' }, { i: 31, a: 'm+0, a+0' }, { i: 32, a: 'm+0, a+1 r-1' }, { i: 44, a: 'm-1, a+1' }, { i: 56, a: 'm+0, a-1 t2', sh: 1 }, { i: 68, a: 'm+1, a+0, I:air' }, { i: 79, a: 'a+1 r+1', sh: 1 }, { i: 88, a: 'm+0, a+0 imm' }],
    caster: [{ i: 14, a: 'm+0, a+0 mud' }, { i: 23, a: 'm-1, a+1' }, { i: 41, a: 'h2, m+0, a-1' }, { i: 45, a: 'm+0, a+0 C:dark:+2' }, { i: 62, a: 'm+1, a-1 t2', sh: 1 }, { i: 71, a: 'a+1, I:dark' }, { i: 77, a: 'm+0, a+0 poi', sh: 1 }, { i: 89, a: 'm-1, a+2' }],
    guard: [{ i: 9, a: 's1, a+0', sh: 1 }, { i: 18, a: 'R2, m+0, a+0' }, { i: 34, a: 'm+0, a+0' }, { i: 46, a: 'm+1, a-1' }, { i: 50, a: 's2, m-1, a+0' }, { i: 66, a: 'm+0, a+1', sh: 1 }, { i: 70, a: 'R1, m+1, a+0' }, { i: 83, a: 'a+1 push1' }],
    ooze: [{ i: 36, a: 'm+0, a+0 poi' }, { i: 48, a: 'm+1, a-1' }, { i: 57, a: 'h2, m+0, a-1' }, { i: 59, a: 'a+1', sh: 1 }, { i: 66, a: 'm-1, a+1 imm' }, { i: 75, a: 'm+0, a+0, I:ice' }, { i: 82, a: 'm+1, a+0' }, { i: 94, a: 's2, a+0', sh: 1 }],
    beast: [{ i: 4, a: 'm+2, a-1' }, { i: 19, a: 'm+1, a+0' }, { i: 27, a: 'm+1, a+0 wnd' }, { i: 38, a: 'm+2, a+0', sh: 1 }, { i: 49, a: 'm+0, a+1' }, { i: 58, a: 'm+3, a-1' }, { i: 69, a: 'm+1, a+1', sh: 1 }, { i: 78, a: 'm+0, a+1 push1' }],
    boss: [{ i: 11, a: 'sp1' }, { i: 14, a: 'sp1' }, { i: 35, a: 'm+0, a+0' }, { i: 52, a: 'sp2' }, { i: 61, a: 'm+1, a-1 t2' }, { i: 73, a: 'sp2', sh: 1 }, { i: 79, a: 'm+0, a+1', sh: 1 }, { i: 85, a: 'm-1, a+2' }]
  };
  D.trapDmg = function (L) { return 2 + L; };
  D.goldPerCoin = function (L) { return [2, 2, 3, 3, 4, 4, 5, 6][L]; };
  D.bonusXp = function (L) { return 4 + 2 * L; };

  // ---------------- items ----------------
  // slot: head, body, legs, hand (two allowed), two (both hands), small (level/2 rounded up). use: spent (back after a long rest) or lost (gone this scenario)
  // k: atk / adv / mov / rng / shd / ret / heal / stamina / str / cure / inf
  D.ITEM = [
    { id: 'i01', n: 'Tallow Helm', slot: 'head', cost: 20, use: 'spent', k: 'shd', v: 1, text: 'Shield 1 this round' },
    { id: 'i02', n: 'Lantern Hood', slot: 'head', cost: 25, use: 'spent', k: 'rng', v: 1, text: '+1 range on your next attack' },
    { id: 'i03', n: 'Bell-Iron Cap', slot: 'head', cost: 30, use: 'lost', k: 'shd', v: 3, text: 'Shield 3 this round' },
    { id: 'i04', n: 'Waxed Coat', slot: 'body', cost: 25, use: 'spent', k: 'shd', v: 1, text: 'Shield 1 this round' },
    { id: 'i05', n: 'Thornleather', slot: 'body', cost: 25, use: 'spent', k: 'ret', v: 1, text: 'Retaliate 1 this round' },
    { id: 'i06', n: 'Deepmail', slot: 'body', cost: 40, use: 'spent', k: 'shd', v: 2, text: 'Shield 2 this round' },
    { id: 'i07', n: 'Ratskin Boots', slot: 'legs', cost: 20, use: 'spent', k: 'mov', v: 1, text: '+1 move on your next move' },
    { id: 'i08', n: 'Wading Boots', slot: 'legs', cost: 15, use: 'lost', k: 'mov', v: 2, text: '+2 move on your next move' },
    { id: 'i09', n: 'Spring Greaves', slot: 'legs', cost: 35, use: 'spent', k: 'mov', v: 2, text: '+2 move on your next move' },
    { id: 'i10', n: 'Rusty Shiv', slot: 'hand', cost: 20, use: 'spent', k: 'atk', v: 1, text: '+1 on your next attack' },
    { id: 'i11', n: 'Hook Blade', slot: 'hand', cost: 30, use: 'spent', k: 'adv', v: 1, text: 'Next attack draws two, best counts' },
    { id: 'i12', n: 'Bell Hammer', slot: 'hand', cost: 25, use: 'lost', k: 'atk', v: 2, text: '+2 on your next attack' },
    { id: 'i13', n: 'Small Buckler', slot: 'hand', cost: 20, use: 'spent', k: 'shd', v: 1, text: 'Shield 1 this round' },
    { id: 'i14', n: 'Salt Pike', slot: 'two', cost: 35, use: 'spent', k: 'atk', v: 2, text: '+2 on your next attack' },
    { id: 'i15', n: 'Wick Crossbow', slot: 'two', cost: 40, use: 'spent', k: 'rng', v: 2, text: '+2 range on your next attack' },
    { id: 'i16', n: 'Minor Tonic', slot: 'small', cost: 10, use: 'lost', k: 'heal', v: 3, text: 'Heal 3 now' },
    { id: 'i17', n: 'Stamina Tea', slot: 'small', cost: 12, use: 'lost', k: 'stamina', v: 2, text: 'Take 2 played cards back' },
    { id: 'i18', n: 'Strength Draught', slot: 'small', cost: 15, use: 'lost', k: 'str', v: 1, text: 'Become Strong' },
    { id: 'i19', n: 'Cure Salve', slot: 'small', cost: 10, use: 'lost', k: 'cure', v: 1, text: 'Cure poison and wounds, heal 1' },
    { id: 'i20', n: 'Fire Flask', slot: 'small', cost: 15, use: 'lost', k: 'inf', v: 'fire', text: 'Make Fire strong' },
    { id: 'i21', n: 'Lamp Oil', slot: 'small', cost: 15, use: 'lost', k: 'inf', v: 'light', text: 'Make Light strong' },
    { id: 'i22', n: 'Greater Tonic', slot: 'small', cost: 25, use: 'lost', k: 'heal', v: 5, text: 'Heal 5 now' },
    { id: 'i23', n: 'Whetstone', slot: 'small', cost: 20, use: 'spent', k: 'atk', v: 1, text: '+1 on your next attack' },
    { id: 'i24', n: 'Smoke Pellet', slot: 'small', cost: 20, use: 'lost', k: 'inv', v: 1, text: 'Become Hidden' },
    { id: 'i25', n: 'Brine Shield', slot: 'hand', cost: 40, use: 'spent', k: 'shd', v: 2, text: 'Shield 2 this round' },
    { id: 'i26', n: 'Night Cloak', slot: 'body', cost: 45, use: 'spent', k: 'inv', v: 1, text: 'Become Hidden' },
    { id: 'i27', n: 'Crown of Wicks', slot: 'head', cost: 50, use: 'spent', k: 'adv', v: 1, text: 'Next attack draws two, best counts' },
    { id: 'i28', n: 'Tidewalkers', slot: 'legs', cost: 45, use: 'spent', k: 'mov', v: 3, text: '+3 move on your next move' },
    { id: 'i29', n: 'Grand Stamina Tea', slot: 'small', cost: 30, use: 'lost', k: 'stamina', v: 3, text: 'Take 3 played cards back' },
    { id: 'i30', n: 'Abbey Relic', slot: 'two', cost: 60, use: 'spent', k: 'atk', v: 3, text: '+3 on your next attack' }
  ];
  D.ITEM_BY = {}; D.ITEM.forEach(function (it) { D.ITEM_BY[it.id] = it; });
  D.SHOP_START = ['i01', 'i04', 'i07', 'i08', 'i10', 'i12', 'i13', 'i16', 'i17', 'i18', 'i19', 'i20', 'i21', 'i23'];

  // hero goals (one secret goal per hero per scenario; finishing it gives a check, 3 checks = a perk)
  D.GOAL = [
    { id: 'g1', n: 'Butcher', text: 'Defeat 3 or more foes', test: function (r) { return r.kills >= 3; } },
    { id: 'g2', n: 'Untouched', text: 'Never drop below half HP', test: function (r) { return r.minhp * 2 >= r.max; } },
    { id: 'g3', n: 'Hoarder', text: 'Pick up 3 or more coins', test: function (r) { return r.coins >= 3; } },
    { id: 'g4', n: 'Ascetic', text: 'Pick up no coins at all', test: function (r) { return r.coins === 0; } },
    { id: 'g5', n: 'Steady', text: 'Lose no more than 3 cards', test: function (r) { return r.lostCount <= 3; } },
    { id: 'g6', n: 'Tireless', text: 'Never take a long rest', test: function (r) { return r.lrests === 0; } },
    { id: 'g7', n: 'Bruiser', text: 'Deal 12 or more damage', test: function (r) { return r.dealt >= 12; } },
    { id: 'g8', n: 'Survivor', text: 'Do not get knocked out', test: function (r) { return !r.exh; } },
    { id: 'g9', n: 'Scholar', text: 'Gain 8 or more card XP', test: function (r) { return r.sxp >= 8; } },
    { id: 'g10', n: 'Bodyguard', text: 'Take 8 or more damage', test: function (r) { return r.taken >= 8; } }
  ];
  D.GOAL_BY = {}; D.GOAL.forEach(function (x) { D.GOAL_BY[x.id] = x; });

  g.WDD = D;
})(typeof window !== 'undefined' ? window : globalThis);
