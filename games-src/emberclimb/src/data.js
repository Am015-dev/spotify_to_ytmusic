// Emberclimb data: heroes, cards, enemies, relics, potions, events. Original names. Each entry has `art` = one-line picture subject (feeds assets.json).
var EC = (typeof EC !== 'undefined') ? EC : {};
(function () {
  var TGT = { dmg: 1, hit: 1, dmgx: 1, bodyslam: 1, vuln: 1, weak: 1, poison: 1, dblPoison: 1 };
  function needsTarget(ops) { return ops.some(function (o) { return TGT[o[0]] || (o[0] === 'roll' && (o[1].concat(o[2], o[3])).some(function (p) { return TGT[p[0]]; })); }); }
  var CARDS = {}, ORDER = [];
  // c(id, hero, name, type A|S|P, rarity s|c|u|r, cost (n or 'X'), ops, art, flags)
  function c(id, hero, name, type, rar, cost, ops, art, fl) {
    var d = { id: id, hero: hero, name: name, type: type, rar: rar, cost: cost, ops: ops, art: art, fl: fl || '' };
    d.tgt = needsTarget(ops); CARDS[id] = d; ORDER.push(id);
  }
  // ONE SCALE (R16): every number on the shelf = the tabletop number x SCALE (8). Damage, Block, HP, healing, HP loss, Weak, Wrath,
  // Shiv, orb values, poison per token and gold all use it; token counts (Strength, Weak, Vulnerable, Poison, Frail) stay tabletop
  // counts and each Strength / Poison token is worth SCALE. Source per value: rules-notes.md. The content tables below were written in
  // video-game sizes; tt() at the bottom converts them once to whole tabletop units x SCALE. Caps follow the tabletop (Block cap 20 x SCALE).
  var SCALE = 1, CAPS = { str: 8, blk: 20 * SCALE, en: 6, shiv: 5, poison: 30, deb: 3, mir: 5 }, EHP = { 1: 1, 2: 1.6 };
  // gold: tabletop coins x SCALE; the video-game sizes below are 25 gold per tabletop coin (common card 2 coins, rare 6)
  function GOLD(v) { var c = Math.round(Math.abs(v) / 25); return (v < 0 ? -1 : 1) * SCALE * c; }
  var H = {
    w: { k: 'w', name: 'Garrick Cinderplate', role: 'Ember Warrior', hp: 80, mech: 'Strength: every point adds damage to all attacks.', art: 'broad-shouldered armoured warrior with a glowing ember-forged greatsword', relic: 'ember-brand', start: ['w-strike', 'w-strike', 'w-strike', 'w-strike', 'w-strike', 'w-defend', 'w-defend', 'w-defend', 'w-defend', 'w-hammer'], col: '#c8472b' },
    s: { k: 's', name: 'Sable Quillfinger', role: 'Venom Rogue', hp: 70, mech: 'Poison and Shivs: stack poison, flood the table with 0-cost shivs.', art: 'hooded lithe rogue with throwing knives and a vial of green venom', relic: 'whetstone-ring', start: ['s-strike', 's-strike', 's-strike', 's-strike', 's-strike', 's-defend', 's-defend', 's-defend', 's-defend', 's-defend', 's-pinprick', 's-slip-away'], col: '#3f9b5a' },
    a: { k: 'a', name: 'Cog-9', role: 'Orb Automaton', hp: 75, mech: 'Orbs: channel Lightning, Frost and Dark; evoke them for big effects.', art: 'friendly brass clockwork automaton with three glowing orbs orbiting its chest', relic: 'spark-core', start: ['a-strike', 'a-strike', 'a-strike', 'a-strike', 'a-defend', 'a-defend', 'a-defend', 'a-defend', 'a-zap', 'a-dualcast'], col: '#3d8fd0' },
    m: { k: 'm', name: 'Ione Stillwater', role: 'Stance Monk', hp: 72, mech: 'Stances: Wrath adds 1 damage per hit; Calm gives energy on exit.', art: 'serene barefoot monk in saffron robes with prayer beads, calm and wrathful aura halves', relic: 'prayer-beads', start: ['m-strike', 'm-strike', 'm-strike', 'm-strike', 'm-defend', 'm-defend', 'm-defend', 'm-defend', 'm-eruption', 'm-vigilance'], col: '#c9a227' }
  };
  // ---------- Warrior (W571: our own pool; ids are kept only because they name the picture files)
  c('w-strike', 'w', 'Cinder Strike', 'A', 's', 1, [['dmg', 6]], 'plain sword cut trailing orange sparks');
  c('w-defend', 'w', 'Plate Guard', 'S', 's', 1, [['blk', 5]], 'dented round shield raised against flames');
  c('w-hammer', 'w', 'Anvil Breaker', 'A', 's', 2, [['dmg', 10], ['weak', 1]], 'huge hammer cracking an anvil-shaped rock');
  c('w-cleave', 'w', 'Sweeping Arc', 'A', 'c', 1, [['all', 5], ['blk', 4]], 'wide sword arc across three foes');
  c('w-twin-slash', 'w', 'Crossed Embers', 'A', 'c', 1, [['hit', 2, 5], ['vuln', 1]], 'two crossed sword slashes in a flash');
  c('w-warm-up', 'w', 'Stoke the Fire', 'S', 'c', 1, [['str', 3], ['blk', 4]], 'warrior stretching by a campfire, sparks rising');
  c('w-bulwark-bash', 'w', 'Shield Shove', 'A', 'c', 1, [['dmg', 5], ['vuln', 1]], 'shield slammed into a goblin chest');
  c('w-sunder', 'w', 'Split Breastplate', 'A', 'c', 2, [['dmg', 14], ['vuln', 1]], 'axe splitting a breastplate in two');
  c('w-iron-skin', 'w', 'Ironhide', 'S', 'c', 1, [['blk', 10]], 'arm turning to grey iron');
  c('w-skull-rap', 'w', 'Skull Rap', 'A', 'c', 1, [['dmg', 5], ['draw', 1]], 'helmeted headbutt with a shower of stars');
  c('w-roar', 'w', 'War Bellow', 'S', 'c', 0, [['weakAll', 1], ['blk', 4]], 'warrior bellowing, enemies shrinking back', 'x');
  c('w-wild-swing', 'w', 'Wild Swing', 'A', 'c', 1, [['roll', [['dmg', 5]], [['dmg', 9]], [['dmg', 14]]]], 'reckless spinning swing, a die tumbling in the air');
  c('w-whirlwind', 'w', 'Ring of Blades', 'A', 'u', 'X', [['all', 5], ['blk', 4]], 'warrior spinning in a ring of blades');
  c('w-kindle', 'w', 'Kindle', 'P', 'u', 1, [['str', 3], ['draw', 1]], 'ember blooming in a clenched fist');
  c('w-slow-burn', 'w', 'Banked Coals', 'P', 'u', 1, [['power', 'ritual', 1], ['loss', 8]], 'coals glowing steadily inside a ribcage');
  c('w-body-check', 'w', 'Door Breaker', 'A', 'u', 1, [['blk', 4], ['bodyslam']], 'armoured shoulder charge through a wooden door');
  c('w-second-wind', 'w', 'Catch Breath', 'S', 'u', 1, [['loss', 8], ['draw', 1], ['nrg', 1]], 'warrior gulping air on one knee');
  c('w-berserk-roll', 'w', 'Berserk Roll', 'S', 'u', 1, [['roll', [['draw', 1]], [['draw', 2]], [['draw', 3]]]], 'wild-eyed warrior and a rolling die in a battle frenzy');
  c('w-reapers-edge', 'w', 'Red Harvest', 'A', 'u', 2, [['dmg', 10], ['str', 3]], 'curved scythe blade drinking red light');
  c('w-plate-up', 'w', 'Plate Up', 'P', 'u', 1, [['blk', 4], ['power', 'plated', 4]], 'armour plates sliding over a torso');
  c('w-pyre-heart', 'w', 'Pyre Heart', 'P', 'r', 3, [['str', 3], ['power', 'ritual', 1]], 'a blazing furnace heart in an open chest');
  c('w-colossus-slam', 'w', 'Molten Fist', 'A', 'r', 2, [['dmgx', 10, 2], ['vuln', 1]], 'giant fist of molten rock crashing down');
  c('w-double-down', 'w', 'Twin Flames', 'S', 'r', 1, [['str', 3], ['dblStr']], 'two identical fiery fists side by side', 'x');
  c('w-final-gambit', 'w', 'Last Charge', 'A', 'r', 3, [['dmg', 25], ['vuln', 1]], 'lone warrior charging a dragon silhouette', 'x');
  // ---------- Rogue
  c('s-strike', 's', 'Quick Cut', 'A', 's', 1, [['dmg', 6]], 'short dagger slash in dim light');
  c('s-defend', 's', 'Cloak Guard', 'S', 's', 1, [['blk', 5]], 'dark cloak swirled across the body');
  c('s-pinprick', 's', 'Pinprick', 'A', 's', 0, [['dmg', 3], ['poison', 1]], 'needle dart striking a shoulder');
  c('s-slip-away', 's', 'Slip Away', 'S', 's', 1, [['blk', 5], ['draw', 1]], 'rogue vanishing in a puff of grey smoke');
  c('s-blade-fan', 's', 'Blade Fan', 'S', 'c', 1, [['shiv', 2], ['draw', 1]], 'three throwing knives fanned in one hand');
  c('s-toxic-vial', 's', 'Toxic Vial', 'S', 'c', 1, [['poison', 3], ['draw', 1]], 'glass vial of bubbling green venom');
  c('s-quick-stab', 's', 'Gutter Stab', 'A', 'c', 1, [['dmg', 9]], 'upward stab from an alley shadow');
  c('s-dodge-roll', 's', 'Under the Club', 'S', 'c', 0, [['blk', 4], ['draw', 1]], 'rogue tumbling under a swinging club');
  c('s-hidden-knives', 's', 'Hidden Knives', 'S', 'c', 1, [['shiv', 2], ['poison', 1]], 'knives tucked inside a coat lining');
  c('s-dagger-spray', 's', 'Knife Burst', 'A', 'c', 1, [['all', 4], ['draw', 1]], 'burst of daggers flying outward');
  c('s-cripple', 's', 'Hamstring', 'S', 'c', 1, [['weak', 1], ['vuln', 1], ['draw', 1]], 'rope snare around an ogre leg');
  c('s-lucky-pick', 's', 'Lucky Pick', 'S', 'c', 1, [['blk', 6], ['roll', [], [['draw', 1]], [['draw', 2], ['nrg', 1]]]], 'pickpocket hand flipping a die and a coin');
  c('s-snap-cut', 's', 'Barbed Cut', 'A', 'c', 1, [['hit', 2, 4], ['poison', 1]], 'barbed blade dripping green');
  c('s-catalyst', 's', 'Green Cauldron', 'S', 'u', 1, [['poison', 3], ['dblPoison']], 'green flask thrown into a green cauldron', 'x');
  c('s-noxious', 's', 'Creeping Mist', 'P', 'u', 1, [['blk', 4], ['power', 'noxious', 1]], 'sickly green mist curling around boots');
  c('s-envenom', 's', 'Coat Blades', 'P', 'u', 2, [['shiv', 2], ['power', 'envenom', 1]], 'brush painting venom onto a dagger');
  c('s-knife-rain', 's', 'Knife Rain', 'S', 'u', 2, [['shiv', 4], ['draw', 1]], 'a downpour of tiny knives from above');
  c('s-backstab', 's', 'Blind Spot', 'A', 'u', 0, [['dmg', 10], ['vuln', 1]], 'rogue behind a distracted guard', 'x');
  c('s-choking-cloud', 's', 'Choking Cloud', 'S', 'u', 2, [['poisonAll', 2], ['weakAll', 1]], 'billowing poison cloud over a crowd', 'x');
  c('s-needle-rain', 's', 'Needle Volley', 'A', 'u', 2, [['hit', 3, 4], ['poison', 1]], 'three needles in a straight row');
  c('s-venom-storm', 's', 'Venom Storm', 'S', 'r', 2, [['poisonAll', 6]], 'swirling emerald storm of droplets', 'x');
  c('s-afterimage', 's', 'Ghost Step', 'P', 'r', 3, [['power', 'afterimg', 8]], 'ghostly echo of the rogue trailing behind');
  c('s-final-flourish', 's', 'Curtain Call', 'A', 'r', 2, [['dmg', 20], ['shiv', 2]], 'dramatic bow with a single bright blade', 'x');
  c('s-plague-doctor', 's', 'Plague Brew', 'S', 'r', 2, [['poisonAll', 3], ['dblPoison']], 'beaked mask above a seething black cauldron');
  // ---------- Automaton
  c('a-strike', 'a', 'Piston Jab', 'A', 's', 1, [['dmg', 6]], 'brass piston arm punching forward');
  c('a-defend', 'a', 'Plating Shift', 'S', 's', 1, [['blk', 5]], 'metal plates sliding shut');
  c('a-zap', 'a', 'Spark Up', 'S', 's', 1, [['chan', 'L']], 'single blue spark leaping between coils');
  c('a-dualcast', 'a', 'Twin Pulse', 'S', 's', 1, [['blk', 4], ['evoke2']], 'orb pulsing twice in a ring of rings');
  c('a-ball-lightning', 'a', 'Arc Lob', 'A', 'c', 1, [['all', 4], ['chan', 'L']], 'crackling sphere of lightning thrown');
  c('a-cool-circuit', 'a', 'Cool Circuit', 'S', 'c', 1, [['chan', 'F'], ['scry', 2]], 'frosted circuit board with ice crystals');
  c('a-charge-up', 'a', 'Charge Up', 'S', 'c', 1, [['blk', 5], ['chan', 'L']], 'dynamo winding up with sparks');
  c('a-barrier-pulse', 'a', 'Hex Barrier', 'S', 'c', 1, [['blk', 10]], 'hexagonal energy barrier');
  c('a-beam-cell', 'a', 'Pinhole Beam', 'A', 'c', 0, [['dmg', 3], ['scry', 1]], 'tiny cell firing a thin beam');
  c('a-sweeping-beam', 'a', 'Hall Sweep', 'A', 'c', 1, [['all', 4], ['blk', 4]], 'laser fan sweeping across a hall');
  c('a-overclock', 'a', 'Redline Gears', 'S', 'c', 0, [['nrg', 1], ['add', 'burn', 1, 'disc']], 'gears glowing red-hot and smoking');
  c('a-static-jolt', 'a', 'Static Jolt', 'S', 'c', 1, [['roll', [['chan', 'L']], [['chan', 'L'], ['chan', 'F']], [['chan', 'L'], ['chan', 'L'], ['chan', 'F']]]], 'automaton hand crackling and a die rolling');
  c('a-compile-strike', 'a', 'Cold Fist', 'A', 'c', 1, [['dmg', 4], ['blk', 4], ['chan', 'F']], 'cold blue gauntlet punch');
  c('a-capacitor', 'a', 'Jar Bank', 'P', 'u', 1, [['power', 'slots', 1], ['chan', 'L']], 'row of glass capacitor jars');
  c('a-defrag', 'a', 'Focus Lattice', 'P', 'u', 1, [['power', 'focus', 1], ['draw', 1]], 'glowing lattice of crystal lines');
  c('a-glacier', 'a', 'Ice Twins', 'S', 'u', 2, [['chan', 'F'], ['chan', 'F'], ['draw', 1]], 'two ice orbs wrapped in frost');
  c('a-darkness', 'a', 'Dark Matter', 'S', 'u', 1, [['chan', 'D'], ['blk', 4]], 'swirling violet-black orb');
  c('a-tempest', 'a', 'Storm Array', 'S', 'u', 'X', [['chanX', 'L'], ['blk', 4]], 'ring of lightning orbs overhead');
  c('a-multicast', 'a', 'Cascade', 'S', 'u', 'X', [['evokeX'], ['draw', 1]], 'orb bursting into many copies');
  c('a-core-breach', 'a', 'Core Breach', 'A', 'u', 2, [['all', 10], ['loss', 8]], 'overloaded reactor core exploding outward');
  c('a-biased-core', 'a', 'Brass Brain', 'P', 'r', 2, [['power', 'focus', 2], ['draw', 2]], 'brass brain core with bright wires');
  c('a-meteor-strike', 'a', 'Skyfall', 'A', 'r', 3, [['dmg', 20], ['chan', 'L'], ['chan', 'L']], 'fiery meteor slamming down on a robot hand');
  c('a-hyperbeam', 'a', 'Chest Cannon', 'A', 'r', 2, [['all', 20], ['loss', 8]], 'enormous white beam from a chest cannon');
  c('a-reactor', 'a', 'Mini Reactor', 'P', 'r', 2, [['power', 'reactor', 1], ['blk', 4]], 'tiny glowing reactor in a glass jar');
  // ---------- Monk
  c('m-strike', 'm', 'Open Palm', 'A', 's', 1, [['dmg', 6]], 'flat palm strike with a ripple of air');
  c('m-defend', 'm', 'Guarded Stance', 'S', 's', 1, [['blk', 5]], 'monk arms crossed in defence');
  c('m-eruption', 'm', 'Flare Fist', 'A', 's', 1, [['dmg', 5], ['stance', 'w']], 'red flames bursting from a monk fist');
  c('m-vigilance', 'm', 'Lotus Seat', 'S', 's', 1, [['blk', 5], ['stance', 'c']], 'monk sitting under a blue lotus glow');
  c('m-palm-flurry', 'm', 'Palm Flurry', 'A', 'c', 0, [['dmg', 3], ['scry', 1]], 'many blurred hands striking');
  c('m-crush-joints', 'm', 'Joint Lock', 'A', 'c', 1, [['dmg', 10], ['vuln', 1]], 'precise elbow strike to an armoured joint');
  c('m-pressure-point', 'm', 'Nerve Touch', 'S', 'c', 0, [['poison', 3], ['scry', 1]], 'fingertip pressed on a glowing nerve spot');
  c('m-still-water', 'm', 'Still Water', 'S', 'c', 1, [['stance', 'c'], ['scry', 2]], 'perfectly calm pond with a single ripple');
  c('m-sash-whip', 'm', 'Silk Lash', 'A', 'c', 1, [['dmg', 5], ['weak', 2]], 'silk sash cracking like a whip');
  c('m-cut-through', 'm', 'Bamboo Cleave', 'A', 'c', 1, [['dmg', 5], ['blk', 4], ['scry', 1]], 'blade of air slicing a bamboo stalk');
  c('m-empty-fist', 'm', 'Stone Hand', 'A', 'c', 1, [['dmg', 10], ['stance', 'n'], ['draw', 1]], 'open empty hand over a plain stone');
  c('m-bow', 'm', 'Shrine Bow', 'S', 'c', 0, [['blk', 4], ['scry', 3]], 'monk bowing low at a shrine gate');
  c('m-third-eye', 'm', 'Painted Eye', 'S', 'c', 1, [['blk', 5], ['scry', 2], ['draw', 1]], 'glowing eye painted on a forehead');
  c('m-inner-peace', 'm', 'Floating Stone', 'S', 'u', 1, [['draw', 2], ['stance', 'c']], 'monk meditating on a floating stone');
  c('m-wheel-kick', 'm', 'Circle Kick', 'A', 'u', 2, [['dmg', 15], ['scry', 2]], 'spinning high kick trailing a circle');
  c('m-rushdown', 'm', 'Red Wind', 'P', 'u', 1, [['blk', 4], ['power', 'rush', 1]], 'red wind rushing around a crouched monk');
  c('m-mental-fort', 'm', 'Inner Fortress', 'P', 'u', 1, [['power', 'mental', 4], ['stance', 'c']], 'translucent fortress rising from meditation');
  c('m-flying-sleeves', 'm', 'Winged Robes', 'A', 'u', 1, [['hit', 2, 4], ['scry', 1]], 'long robe sleeves flying like wings');
  c('m-windmill', 'm', 'Spinning Arms', 'A', 'u', 1, [['all', 5], ['blk', 4]], 'monk spinning with arms out like a windmill');
  c('m-roll-with-it', 'm', 'Roll With It', 'S', 'u', 1, [['roll', [['blk', 6]], [['blk', 10]], [['blk', 14], ['stance', 'c']]]], 'monk tumbling softly as a die lands nearby');
  c('m-sky-hammer', 'm', "Heaven's Hammers", 'A', 'r', 3, [['hit', 4, 5], ['stance', 'w']], 'four heavenly hammer-shaped lights falling');
  c('m-zen-burst', 'm', 'Zen Burst', 'S', 'r', 0, [['mir', 1], ['stance', 'c'], ['draw', 1]], 'blinding golden burst behind a calm monk', 'x');
  c('m-deva-form', 'm', 'Golden Halo', 'P', 'r', 3, [['power', 'deva', 1], ['blk', 4]], 'monk ascending with golden multi-armed halo');
  c('m-judgment', 'm', 'Scale of Light', 'A', 'r', 1, [['dmg', 25]], 'a single glowing sword of light over a scale', 'xt');
  // ---------- Neutral (shop, events)
  c('n-bandage', 'n', 'Field Dressing', 'S', 'c', 0, [['heal', 8], ['blk', 4]], 'cloth bandage rolled around an arm', 'x');
  c('n-good-instincts', 'n', 'Sixth Sense', 'S', 'c', 0, [['blk', 5], ['draw', 1]], 'eyes opening wide in a dark corridor', 'x');
  c('n-finesse', 'n', 'Light Step', 'S', 'c', 0, [['blk', 2], ['scry', 2]], 'light-footed step over a rope');
  c('n-panic-button', 'n', 'Glass Alarm', 'S', 'u', 0, [['blk', 25]], 'big red button under a glass cover', 'x');
  c('n-hand-of-greed', 'n', 'Gilded Fist', 'A', 'u', 2, [['dmg', 15], ['vuln', 1]], 'golden clenched hand with coins', '');
  // ---------- Statuses and curses (unplayable junk)
  c('wound', 'z', 'Gash', 'X', 'z', -1, [], 'torn bandage with a red stain', 'u');
  c('dazed', 'z', 'Seeing Stars', 'X', 'z', -1, [], 'spiral of stars around a head', 'ue');
  c('burn', 'z', 'Scorch', 'X', 'z', -1, [], 'small hot flame licking a card', 'ub');
  c('slimed', 'z', 'Muck', 'X', 'z', 1, [], 'green slime dripping off a card', 'x');
  c('regret', 'z', 'Remorse', 'X', 'k', -1, [], 'faded letter left on a dark table', 'ur');
  c('doubt', 'z', 'Cold Feet', 'X', 'k', -1, [], 'cracked mirror showing a worried face', 'ud');
  c('injury', 'z', 'Lingering Injury', 'X', 'k', -1, [], 'old bruise on a shoulder', 'u');
  c('calm-spark', 'z', 'Calm Spark', 'S', 'z', 0, [['nrg', 1]], 'small golden light cupped in two hands', 'x');
  c('shiv', 'z', 'Shiv', 'A', 'z', 0, [['dmg', 3]], 'small improvised blade', 'x');
  // flags: t=retain (stays in hand at end of turn) u=unplayable x=exhaust e=ethereal(exhaust at end of turn) b=burn(2 hp at end of turn if held) r=regret d=doubt

  var ENEMIES = {
    // R24 ACT 1 = the printed tabletop enemy cards (tab:1): every number below is the card's own value; data.js multiplies HP, damage,
    // Block and Spikes by SCALE once (Strength / Weak / Vulnerable / added cards stay counts). Elite and boss HP is per hero (x heroes).
    // die: 3 rows = d6 1-2 / 3-4 / 5-6, 2 rows = 1-3 / 4-6. first: a one-time opening step. hpF/patF: the gentle first-encounter card.
    // Source per foe (tabletop value -> in-game value): rules-notes.md "Act 1 foes".
    // W571: our own act-1 foes. The tabletop structure stays (HP and damage bands per tier, die rows, the rules each tier uses), the
    // patterns and numbers are ours.
    'mire-slug': { tab: 1, name: 'Bog Leech', hp: [5, 5], pat: [{ die: [{ atk: 3 }, { atk: 1, weak: 1 }, { blk: 2, add: ['dazed', 1] }] }], art: 'fat grey-green slug with eyestalks on a swamp log' },
    'spine-slug': { tab: 1, img: 'mire-slug', name: 'Quill Leech', hp: [6, 6], pat: [{ die: [{ atk: 1, hits: 2 }, { atk: 2, vuln: 1 }, { blk: 1, spikes: 1 }] }], art: 'slug covered in sharp grey spines' },
    'ooze-drop': { tab: 1, img: 'bile-blob', name: 'Ooze Drop', hp: [3, 3], pat: [{ atk: 1 }, { atk: 1, add: ['slimed', 1] }], art: 'small drop of yellow ooze with two eyes' },
    'gnawer': { tab: 1, name: 'Gnawer', hp: [11, 11], pat: [{ die: [{ atk: 2, hits: 2 }, { atk: 3, weak: 1 }, { blk: 3 }] }], hpF: 7, patF: [{ die: [{ blk: 2 }, { atk: 2 }, { atk: 2, weak: 1 }] }], art: 'oversized scruffy rat showing yellow teeth' },
    'hex-acolyte': { tab: 1, name: 'Hex Acolyte', hp: [8, 8], pat: [{ blk: 2, str: 1 }, { atk: 2 }], art: 'cultist in a feathered hood chanting by a candle' },
    'gape-grub': { tab: 1, name: 'Gape Grub', hp: [7, 7], pat: [{ die: [{ atk: 3 }, { atk: 2, str: 1 }, { str: 1, blk: 2 }] }], deathVuln: 1, art: 'wide-mouthed pale grub with a ring of teeth' },
    'rust-tick': { tab: 1, name: 'Rust Tick', hp: [4, 4], pat: [{ die: [{ atk: 1, weak: 1 }, { atk: 3 }, { blk: 1, str: 1 }] }], curl: 3, hpF: 3, patF: [{ die: [{ atk: 1 }, { atk: 2 }, { blk: 1 }] }], art: 'rust-coloured tick the size of a dog' },
    'bile-blob': { tab: 1, name: 'Bile Blob', hp: [11, 11], pat: [{ die: [{ atk: 2, add: ['slimed', 1] }, { atk: 2, hits: 2 }, { blk: 2, weak: 1 }] }], art: 'quivering yellow blob of acid with floating bones' },
    'snare-vine': { tab: 1, name: 'Snare Vine', hp: [9, 9], pat: [{ die: [{ atk: 1, weak: 2 }, { atk: 4 }, { atk: 2, add: ['dazed', 1] }] }], art: 'thorny vine bundle with a grasping tendril' },
    'ash-imp': { tab: 1, name: 'Ash Imp', hp: [10, 10], pat: [{ die: [{ atk: 2, hits: 2 }, { atk: 1, add: ['burn', 1] }, { atk: 3, vuln: 1 }] }], art: 'small black imp with ember eyes and bat wings' },
    'thorn-brute': { tab: 1, name: 'Thorn Brute', hp: [15, 15], first: { blk: 3, spikes: 1 }, pat: [{ atk: 2, hits: 2 }, { atk: 4, vuln: 1 }], elite: 1, art: 'bark-skinned hulking brute with thorns and a horned skull' },
    'sleeper-statue': { tab: 1, name: 'Sleeper Statue', hp: [20, 20], sleep: 1, skillTax: 1, pat: [{ atk: 3, blk: 2 }, { atk: 2, hits: 2 }, { str: 1, weak: 1 }], elite: 1, art: 'mossy stone statue of a seated giant with one eye opening' },
    'iron-warden': { tab: 1, name: 'Iron Warden', hp: [6, 6], pat: [{ die: [{ atk: 1, add: ['dazed', 1] }, { atk: 2, weak: 1 }] }], elite: 1, flat: 1, art: 'tall slim iron sentry with a lantern head' },
    'iron-warden-b': { tab: 1, img: 'iron-warden', name: 'Iron Warden', hp: [8, 8], pat: [{ die: [{ atk: 4 }, { blk: 1, add: ['dazed', 1] }] }], elite: 1, flat: 1, art: 'tall slim iron sentry with a lantern head' },
    'iron-warden-c': { tab: 1, img: 'iron-warden', name: 'Iron Warden', hp: [7, 7], pat: [{ die: [{ atk: 1, hits: 2 }, { weak: 1 }] }], elite: 1, flat: 1, art: 'tall slim iron sentry with a lantern head' },
    'warden-captain': { name: 'Warden Captain', hp: [58, 62], pat: [{ atk: 9, weak: 1 }, { blk: 12, spikes: 5 }, { atk: 6, hits: 3 }], boss: 1, art: 'iron sentry captain in spiked plate with a lantern helm' },
    'mire-behemoth': { tab: 1, name: 'Mire Behemoth', hp: [20, 20], split: ['bile-blob', 'ooze-drop', 'spine-slug'], splitSay: 'bursts apart', pat: [{ blk: 3, add: ['slimed', 2] }, { atk: 2, hits: 2 }, { atk: 5, weak: 1 }], boss: 1, art: 'colossal swamp creature of mud and reeds with a wide mouth' },
    'ashen-wraith': { tab: 1, name: 'Ashen Wraith', hp: [38, 38], hpN: { 2: 78 }, pat: [{ atk: 2, hits: 3 }, { blk: 4, add: ['burn', 2] }, { atk: 5, add: ['burn', 1] }, { atk: 2, hits: 2, str: 1 }], boss: 1, art: 'tall ghost of burnt cloth and ash with six floating candles' },
    'gate-colossus': { tab: 1, name: 'Gate Wyrm', hp: [42, 42], keepBlk: 1, hide: 2, pat: [{ atk: 3, blk: 4, blkH: 1 }, { atk: 5, guard: 1 }], pat2: [{ atk: 1, hits: 2 }, { atk: 3, str: 1 }], boss: 1, art: 'green horned wyrm bursting out of a dungeon gate' },
    // act 2 (Ash Stair) and act 3 (Cinder Gate) encounter decks, act 4 = the optional final act
    'cinder-hound': { name: 'Cinder Hound', hp: [30, 34], pat: [{ atk: 5, hits: 2 }, { atk: 8, add: ['burn', 1] }, { blk: 6, str: 1 }], act: 2, art: 'lean black hound with ember-cracked skin and smoking jaws' },
    'ash-wisp': { name: 'Ash Wisp', hp: [20, 24], pat: [{ atk: 4, frail: 2 }, { atk: 7 }, { die: [{ blk: 8 }, { atk: 6, frail: 1 }, { atk: 10 }] }], act: 2, art: 'floating grey wisp of ash with two coal eyes' },
    'smoke-hexer': { name: 'Smoke Hexer', hp: [36, 40], pat: [{ atk: 6, weak: 1 }, { str: 2, blk: 6 }, { atk: 12 }], act: 2, art: 'robed hexer exhaling grey smoke shaped like hands' },
    'skyclaw': { name: 'Skyclaw', hp: [90, 96], pat: [{ atk: 6, hits: 3 }, { blk: 12, str: 2 }, { atk: 18, vuln: 1 }], elite: 1, act: 2, art: 'golden winged griffin diving down a stone corridor' },
    'grave-knight': { name: 'Grave Knight', hp: [44, 48], pat: [{ atk: 10 }, { blk: 12 }, { atk: 7, hits: 2 }], act: 3, art: 'rusted skeleton knight with a cracked tower shield' },
    'bone-caller': { name: 'Bone Caller', hp: [30, 34], pat: [{ atk: 6, add: ['wound', 1] }, { die: [{ str: 2 }, { atk: 9 }, { atk: 5, hits: 3 }] }], act: 3, art: 'hunched necromancer rattling a staff of bones' },
    'tomb-king': { name: 'Tomb King', hp: [120, 128], pat: [{ atk: 12, frail: 2 }, { blk: 14, str: 2 }, { atk: 7, hits: 3 }, { atk: 8, add: ['dazed', 2] }], elite: 1, act: 3, art: 'bandaged king rising from a stone sarcophagus in dust' },
    'ember-tyrant': { name: 'Ember Tyrant', hp: [210, 220], pat: [{ atk: 10, all: 1, add: ['burn', 2] }, { str: 3, blk: 20 }, { atk: 8, hits: 3 }, { atk: 30, vuln: 2 }], boss: 1, act: 4, art: 'horned fire demon striding out of a burning archway' }
  };
  var ENC = {   // R24: the tabletop act-1 decks. The first fight draws from the 4-card first-encounter deck (gentle hpF/patF sides), then the normal deck
    first: [['hex-acolyte'], ['gnawer'], ['rust-tick'], ['ooze-drop']],
    weak: [['hex-acolyte'], ['gnawer'], ['rust-tick'], ['snare-vine'], ['ash-imp'], ['ooze-drop'], ['bile-blob'], ['gape-grub']],
    strong: [['hex-acolyte'], ['gnawer'], ['rust-tick'], ['snare-vine'], ['ash-imp'], ['ooze-drop'], ['bile-blob'], ['gape-grub']],
    elite: [['thorn-brute'], ['sleeper-statue'], ['iron-warden', 'iron-warden-b', 'iron-warden-c']],
    boss: [['mire-behemoth'], ['ashen-wraith'], ['gate-colossus']]
  };
  // per-act encounter decks (act 1 = ENC). Multi-act climbs meet one fixed guardian per act; act 4 is the optional final act.
  var ENCA = {
    2: { weak: [['cinder-hound'], ['ash-wisp', 'ash-wisp'], ['smoke-hexer']], strong: [['cinder-hound', 'ash-wisp'], ['smoke-hexer', 'ash-wisp'], ['cinder-hound', 'cinder-hound'], ['bile-blob', 'smoke-hexer']], elite: [['skyclaw'], ['thorn-brute'], ['sleeper-statue']] },
    3: { weak: [['grave-knight'], ['bone-caller', 'ash-wisp'], ['cinder-hound', 'bone-caller']], strong: [['grave-knight', 'bone-caller'], ['grave-knight', 'cinder-hound'], ['bone-caller', 'bone-caller', 'ash-wisp']], elite: [['tomb-king'], ['skyclaw'], ['iron-warden', 'iron-warden', 'grave-knight']] },
    4: { weak: [['grave-knight', 'ash-wisp']], strong: [['grave-knight', 'smoke-hexer'], ['tomb-king']], elite: [['tomb-king'], ['skyclaw']] }
  };
  var ACTBOSS = { 1: 'mire-behemoth', 2: 'ashen-wraith', 3: 'gate-colossus', 4: 'ember-tyrant' };
  // relic effect keys are read by the engine
  var RELICS = {   // W571: our own relic set (ids name the picture files); the engine reads the ids (engine.js has('...'))
    'ember-brand': { name: 'Ember Brand', t: 'Heal 1 after each fight, 2 after an elite or boss.', rar: 's', art: 'iron brand glowing orange at the tip' },
    'whetstone-ring': { name: 'Whetstone Ring', t: 'Turn 1: add 1 Shiv to your hand.', rar: 's', art: 'silver ring with a tiny whetstone' },
    'spark-core': { name: 'Spark Core', t: 'Start fights with a Frost and a Dark orb.', rar: 's', art: 'glass sphere with a trapped blue spark' },
    'prayer-beads': { name: 'Prayer Beads', t: 'Start every fight in Calm.', rar: 's', art: 'string of wooden prayer beads' },
    'lucky-coin': { name: 'Lucky Coin', t: '+2 gold now.', rar: 'c', art: 'chipped gold coin balanced on its edge' },
    'iron-bangle': { name: 'Iron Bangle', t: 'Start fights with 1 Block per foe.', rar: 'c', art: 'thick iron bracelet with a rune notch' },
    'lantern': { name: 'Tin Lantern', t: 'Every 3rd turn: +1 energy.', rar: 'c', art: 'small dented tin lantern lit from within' },
    'bag-of-marbles': { name: 'Spilled Marbles', t: 'Elites and bosses start Vulnerable 2.', rar: 'c', art: 'leather pouch spilling glass marbles' },
    'clover-dice': { name: 'Clover Dice', t: 'Cards with a die (like Wild Swing): a rolled 1 counts as 4.', rar: 'c', art: 'carved bone die with a four-leaf clover on it' },
    'healing-moss': { name: 'Healing Moss', t: 'Rest sites heal 2 more.', rar: 'c', art: 'clump of glowing green moss on a stone' },
    'gold-tooth': { name: 'Gold Tooth', t: '+1 gold after every fight.', rar: 'c', art: 'single gold tooth on a velvet scrap' },
    'oak-heart': { name: 'Oak Heart', t: '+2 max HP now.', rar: 'c', art: 'heart-shaped knot cut from an oak branch' },
    'candle-stub': { name: 'Candle Stub', t: 'Turn 2: draw 2 extra.', rar: 'c', art: 'melted candle stub on a saucer' },
    'pocket-satchel': { name: 'Pocket Satchel', t: '+1 potion slot and a potion now.', rar: 'c', art: 'small canvas satchel with brass buckles' },
    'tin-flute': { name: 'Tin Flute', t: 'Powers give 2 Block when played.', rar: 'u', art: 'little tin flute with painted stripes' },
    'smoking-censer': { name: 'Smoking Censer', t: 'Attacks deal +1 damage.', rar: 'u', art: 'hanging brass censer trailing grey smoke' },
    'dawnstone': { name: 'Dawnstone', t: '+1 energy every turn; turn 1 draws 1 less.', rar: 'b', art: 'pale pink glowing stone like a sunrise' },
    'gale-cloak': { name: 'Gale Cloak', t: 'From turn 2: draw 1 extra every turn.', rar: 'b', art: 'wind-tossed travelling cloak with a brooch' },
    'phoenix-ash': { name: 'Phoenix Ash', t: 'Once per run: revive at 40% HP with 2 Block.', rar: 'b', art: 'urn of warm glowing ash with a red feather' }
  };
  var POTIONS = {   // W571: our own potion set; engine.js usePot() reads the ids
    'fire-flask': { name: 'Fire Flask', t: 'Deal 3 to a foe; Vulnerable 1.', tgt: 1, art: 'round flask of bright orange fire' },
    'block-brew': { name: 'Iron Brew', t: 'Gain 1 Block per foe (at least 2).', art: 'grey potion bottle with metal flecks' },
    'strength-tonic': { name: 'Red Tonic', t: 'Gain 1 Strength. Draw 1.', art: 'thick red tonic in a tall bottle' },
    'swift-draught': { name: 'Wing Draught', t: 'Draw 2. Gain 1 energy.', art: 'silver-blue swirling potion with wings' },
    'energy-vial': { name: 'Bolt Vial', t: 'Gain 3 energy. Lose 1 HP (never your last).', art: 'yellow glowing vial with lightning shape' },
    'venom-vial': { name: 'Venom Vial', t: 'Poison every foe 1.', art: 'skull-stoppered green vial' },
    'frost-gas': { name: 'Frost Gas', t: 'All foes Weak 1 and Vulnerable 1.', art: 'pale blue misty bottle' },
    'healing-draught': { name: 'Rose Draught', t: 'Heal 3. Gain 1 Block.', art: 'rosy pink potion in a heart-shaped flask' },
    'fortune-die': { name: 'Fortune Die', t: 'Drink it before a card with a die (like Wild Swing). Your next 2 die rolls land on 6.', art: 'golden die floating inside a glass bottle' }
  };
  var EVENTS = {
    'ember-shrine': { name: 'Ember Shrine', q: 'A shrine hums with warm light.', art: 'small stone shrine with floating embers', o: [{ t: 'Pray: heal 2', do: { heal: 15 } }, { t: 'Offer 1 HP: upgrade a card', do: { hp: -6, upg: 1 } }, { t: 'Walk on', do: {} }] },
    'wandering-tinker': { name: 'Wandering Tinker', q: 'A tinker offers a trade.', art: 'cheerful tinker with a cart of pots and gadgets', o: [{ t: 'Buy a relic (4 gold)', do: { gold: -90, relic: 1 }, cost: 90 }, { t: 'Sell blood: +2 gold, -1 HP', do: { gold: 60, hp: -8 } }, { t: 'Leave', do: {} }] },
    'whispering-well': { name: 'Whispering Well', q: 'Drink? Roll the die.', art: 'old stone well with blue mist and a coin', o: [{ t: 'Drink and roll', roll: [{ hp: -8 }, { gold: 40 }, { relic: 1 }] }, { t: 'Leave', do: {} }] },
    'stranded-caravan': { name: 'Stranded Caravan', q: 'A broken cart blocks the road.', art: 'wrecked merchant cart in a forest road', o: [{ t: 'Help: lose 1 HP, gain a card', do: { hp: -5, card: 1 } }, { t: 'Loot: +2 gold, Remorse', do: { gold: 45, curse: 'regret' } }, { t: 'Leave', do: {} }] },
    'mirror-pool': { name: 'Mirror Pool', q: 'Your reflection offers a deal.', art: 'still dark pond reflecting a different sky', o: [{ t: 'Lose 1 HP: remove a card', do: { hp: -7, rem: 1 } }, { t: 'Gain 1 max HP, Cold Feet', do: { mhp: 6, curse: 'doubt' } }, { t: 'Step in: transform a card', do: { xform: 1 } }, { t: 'Leave', do: {} }] },
    'first-ember': { start: 1, name: 'The First Ember', q: 'A warm ember offers one gift.', art: 'small glowing ember floating over an open palm', o: [{ t: 'Gain 1 max HP', do: { mhp: 8 } }, { t: 'Take 4 gold', do: { gold: 100 } }, { t: 'Take a rare card', do: { rare: 1 } }, { t: 'Lose 1 HP: take a relic', do: { hp: -10, relic: 1 } }] },
    'ash-library': { name: 'Ash Library', q: 'Half-burnt books line the walls.', art: 'tall scorched bookshelves with drifting pages', o: [{ t: 'Read: gain a card', do: { card: 1 } }, { t: 'Sleep here: heal 2', do: { heal: 12 } }, { t: 'Leave', do: {} }] },
    'cursed-chest': { name: 'Cursed Chest', q: 'A chest hums with a dark tune.', art: 'iron-bound chest leaking purple smoke', o: [{ t: 'Open: a relic and Remorse', do: { relic: 1, curse: 'regret' } }, { t: 'Leave', do: {} }] },
    'herb-witch': { name: 'Herb Witch', q: 'An old woman stirs a pot.', art: 'smiling old woman stirring a bubbling green pot', o: [{ t: 'Buy 2 potions (2 gold)', do: { gold: -40, pot: 2 }, cost: 40 }, { t: 'Taste the stew: heal 1', do: { heal: 8 } }, { t: 'Leave', do: {} }] },
    'forge-spirit': { name: 'Forge Spirit', q: 'A spirit offers to hammer a card.', art: 'glowing figure of flame standing at an anvil', o: [{ t: 'Upgrade a card', do: { upg: 1 } }, { t: 'Lose 1 HP: +1 max HP', do: { hp: -6, mhp: 2 } }, { t: 'Leave', do: {} }] },
    'golden-idol': { name: 'Cracked Plinth', q: 'A gilded statuette rests on a cracked stone.', art: 'small golden idol on a stone plinth with cracks', o: [{ t: 'Grab it: +4 gold, Injury', do: { gold: 100, curse: 'injury' } }, { t: 'Grab carefully: +2 gold, -1 HP', do: { gold: 50, hp: -9 } }, { t: 'Leave', do: {} }] },
    'kind-pilgrim': { name: 'Kind Pilgrim', q: 'A pilgrim shares the fire.', art: 'hooded pilgrim at a small campfire offering bread', o: [{ t: 'Rest: heal 1', do: { heal: 10 } }, { t: 'Trade stories: remove a card, -1 HP', do: { hp: -4, rem: 1 } }, { t: 'Leave', do: {} }] },
    'back-alley-gambler': { name: 'Back Alley Gambler', q: 'A grin and a pair of dice.', art: 'hooded gambler at a barrel table with dice', o: [{ t: 'Bet 1 gold and roll: 1-2 lose it, 3-4 keep it, 5 win 2, 6 win 4', roll: [{ gold: -30 }, { gold: -30 }, { gold: 0 }, { gold: 0 }, { gold: 60 }, { gold: 90 }], cost: 30 }, { t: 'Walk away', do: {} }] }
  };
  var NODES = { m: 'Monster', e: 'Elite', r: 'Rest', s: 'Shop', v: 'Event', t: 'Treasure', b: 'Boss' };

  // ---------- tt(): one-time conversion to tabletop units x SCALE (see rules-notes.md "One scale")
  // u(v, k): nearest whole tabletop unit, at least 1. k = video-game size of one tabletop unit: 5 for damage / Block (Strike 6 -> 1,
  // Defend 5 -> 1, Bash 8 -> 2), 8 for HP / healing / HP loss (hero 80 -> 10), 3 for Strength / Ritual / Poison token counts.
  function u(v, k) { var a = Math.abs(v), r = Math.max(1, Math.round(a / k)); return v < 0 ? -r : r; }
  var KE = (typeof EC_KE !== 'undefined') ? EC_KE : [8, 5, 8, 5],   // R21: foes use the SAME conversion as heroes (HP /8, damage and Block /5): one scale for both sides
  KB = 0, EHPV = function (v) { return SCALE * u(v, KE[KB]); }, EDM = function (v) { return SCALE * u(v, KE[KB + 1]); };
  var DM = function (v) { return SCALE * u(v, 5); }, HPV = function (v) { return SCALE * u(v, 8); }, TOK = function (v) { return u(v, 3); };
  function ttOps(ops) {
    return ops.map(function (o) {
      o = o.slice(); var k = o[0];
      if (k === 'dmg' || k === 'blk' || k === 'all') o[1] = DM(o[1]);
      else if (k === 'hit') o[2] = DM(o[2]);
      else if (k === 'dmgx') o[1] = DM(o[1]);
      else if (k === 'heal' || k === 'loss') o[1] = HPV(o[1]);
      else if (k === 'str' || k === 'poison' || k === 'poisonAll') o[1] = TOK(o[1]);
      else if (k === 'focus') o[1] = u(o[1], 3);
      else if (k === 'power') { if (o[1] === 'plated' || o[1] === 'mental') o[2] = DM(o[2]); else if (o[1] === 'ritual' || o[1] === 'noxious' || o[1] === 'envenom') o[2] = TOK(o[2]); }
      else if (k === 'roll') { o[1] = ttOps(o[1]); o[2] = ttOps(o[2]); o[3] = ttOps(o[3]); }
      return o;
    });
  }
  Object.keys(CARDS).forEach(function (id) { var d = CARDS[id]; d.ops = ttOps(d.ops); });
  function ttPat(p) {
    if (p.die) { p.die.forEach(ttPat); return; }
    if (p.atk) p.atk = EDM(p.atk); if (p.blk) p.blk = DM(p.blk); if (p.spikes) p.spikes = DM(p.spikes); if (p.str) p.str = TOK(p.str);
  }
  function tabPat(p) { if (p.die) { p.die.forEach(tabPat); return; } if (p.atk) p.atk *= SCALE; if (p.blk) p.blk *= SCALE; if (p.spikes) p.spikes *= SCALE; }
  Object.keys(ENEMIES).forEach(function (id) { var e = ENEMIES[id]; if (!e.tab) return; e.hp = [e.hp[0] * SCALE, e.hp[1] * SCALE]; if (e.hpF) e.hpF *= SCALE; e.pat.forEach(tabPat); (e.pat2 || []).forEach(tabPat); (e.patF || []).forEach(tabPat); if (e.first) tabPat(e.first); });
  Object.keys(ENEMIES).forEach(function (id) { var e = ENEMIES[id]; if (e.tab) return; KB = e.boss ? 2 : 0; e.hp = [EHPV(e.hp[0]), EHPV(e.hp[1])]; e.pat.forEach(ttPat); if (e.ritual) e.ritual = TOK(e.ritual); if (e.onSkill) e.onSkill = TOK(e.onSkill); });
  Object.keys(H).forEach(function (k) { H[k].hp = HPV(H[k].hp); });
  Object.keys(EVENTS).forEach(function (id) { EVENTS[id].o.forEach(function (o) {
    function f(d) { if (!d) return; if (d.heal) d.heal = HPV(d.heal); if (d.hp) d.hp = HPV(d.hp); if (d.mhp) d.mhp = HPV(d.mhp); if (d.gold) d.gold = GOLD(d.gold); }
    f(o.do); (o.roll || []).forEach(f); if (o.cost) o.cost = GOLD(o.cost);
  }); });

  // F1: every card has its own printed upgrade (no generic +1). Numbers are final (tabletop units x SCALE). o = new effects, c = new cost, f = new flags.
  (function () {
    var S = SCALE, U = {
      'w-strike': { o: [['dmg', 2 * S]] }, 'w-defend': { o: [['blk', 2 * S]] }, 'w-hammer': { o: [['dmg', 3 * S], ['weak', 1]] },
      'w-cleave': { o: [['all', 2 * S], ['blk', S]] }, 'w-twin-slash': { o: [['hit', 2, S], ['vuln', 2]] }, 'w-warm-up': { o: [['str', 1], ['blk', 2 * S]] },
      'w-bulwark-bash': { o: [['dmg', 2 * S], ['vuln', 1]] }, 'w-sunder': { o: [['dmg', 4 * S], ['vuln', 1]] }, 'w-iron-skin': { o: [['blk', 3 * S]] },
      'w-skull-rap': { o: [['dmg', 2 * S], ['draw', 1]] }, 'w-roar': { o: [['weakAll', 2], ['blk', S]] }, 'w-wild-swing': { o: [['roll', [['dmg', 2 * S]], [['dmg', 3 * S]], [['dmg', 4 * S]]]] },
      'w-whirlwind': { o: [['all', 2 * S], ['blk', S]] }, 'w-kindle': { o: [['str', 2], ['draw', 1]] }, 'w-slow-burn': { c: 0 }, 'w-body-check': { o: [['blk', 2 * S], ['bodyslam']] },
      'w-second-wind': { c: 0 }, 'w-berserk-roll': { c: 0 }, 'w-reapers-edge': { o: [['dmg', 3 * S], ['str', 1]] },
      'w-plate-up': { o: [['blk', 2 * S], ['power', 'plated', S]] }, 'w-pyre-heart': { c: 2 }, 'w-colossus-slam': { o: [['dmgx', 2 * S, 3], ['vuln', 1]] },
      'w-double-down': { f: '' }, 'w-final-gambit': { o: [['dmg', 6 * S], ['vuln', 1]] },
      's-strike': { o: [['dmg', 2 * S]] }, 's-defend': { o: [['blk', 2 * S]] }, 's-pinprick': { o: [['dmg', S], ['poison', 2]] },
      's-slip-away': { o: [['blk', 2 * S], ['draw', 1]] }, 's-blade-fan': { o: [['shiv', 3], ['draw', 1]] }, 's-toxic-vial': { o: [['poison', 2], ['draw', 1]] },
      's-quick-stab': { o: [['dmg', 2 * S], ['draw', 1]] }, 's-dodge-roll': { o: [['blk', 2 * S], ['draw', 1]] }, 's-hidden-knives': { o: [['shiv', 3], ['poison', 1]] },
      's-dagger-spray': { o: [['all', 2 * S], ['draw', 1]] }, 's-cripple': { o: [['weak', 2], ['vuln', 2], ['draw', 1]] },
      's-lucky-pick': { o: [['blk', 2 * S], ['roll', [], [['draw', 1]], [['draw', 2], ['nrg', 1]]]] }, 's-snap-cut': { o: [['hit', 2, S], ['poison', 2]] },
      's-catalyst': { f: '' }, 's-noxious': { c: 0 }, 's-envenom': { c: 1 }, 's-knife-rain': { c: 1 },
      's-backstab': { o: [['dmg', 3 * S], ['vuln', 1]] }, 's-choking-cloud': { o: [['poisonAll', 2], ['weakAll', 1]] }, 's-needle-rain': { o: [['hit', 4, S], ['poison', 1]] },
      's-venom-storm': { f: '' }, 's-afterimage': { c: 2 }, 's-final-flourish': { o: [['dmg', 5 * S], ['shiv', 2]] },
      's-plague-doctor': { o: [['poisonAll', 2], ['dblPoison']] },
      'a-strike': { o: [['dmg', 2 * S]] }, 'a-defend': { o: [['blk', 2 * S]] }, 'a-zap': { o: [['chan', 'L'], ['draw', 1]] }, 'a-dualcast': { o: [['blk', 2 * S], ['evoke2']] },
      'a-ball-lightning': { o: [['all', 2 * S], ['chan', 'L']] }, 'a-cool-circuit': { o: [['chan', 'F'], ['scry', 2], ['draw', 1]] }, 'a-charge-up': { o: [['blk', 2 * S], ['chan', 'L']] },
      'a-barrier-pulse': { o: [['blk', 3 * S]] }, 'a-beam-cell': { o: [['dmg', 2 * S], ['scry', 1]] }, 'a-sweeping-beam': { o: [['all', 2 * S], ['blk', S]] },
      'a-overclock': { o: [['nrg', 1], ['add', 'burn', 1, 'disc'], ['draw', 1]] }, 'a-static-jolt': { c: 0 }, 'a-compile-strike': { o: [['dmg', 2 * S], ['blk', S], ['chan', 'F']] },
      'a-capacitor': { o: [['power', 'slots', 2], ['chan', 'L']] }, 'a-defrag': { o: [['power', 'focus', 2], ['draw', 1]] }, 'a-glacier': { o: [['chan', 'F'], ['chan', 'F'], ['draw', 2]] },
      'a-darkness': { o: [['chan', 'D'], ['blk', 2 * S]] }, 'a-tempest': { o: [['chanX', 'L', 1], ['blk', S]] }, 'a-multicast': { o: [['evokeX', 1], ['draw', 1]] },
      'a-core-breach': { o: [['all', 3 * S], ['loss', S]] }, 'a-biased-core': { c: 1 }, 'a-meteor-strike': { o: [['dmg', 5 * S], ['chan', 'L'], ['chan', 'L']] },
      'a-hyperbeam': { o: [['all', 5 * S], ['loss', S]] }, 'a-reactor': { c: 1 },
      'm-strike': { o: [['dmg', 2 * S]] }, 'm-defend': { o: [['blk', 2 * S]] }, 'm-eruption': { o: [['dmg', 2 * S], ['stance', 'w']] }, 'm-vigilance': { o: [['blk', 2 * S], ['stance', 'c']] },
      'm-palm-flurry': { o: [['dmg', 2 * S], ['scry', 1]] }, 'm-crush-joints': { o: [['dmg', 2 * S], ['vuln', 2]] }, 'm-pressure-point': { o: [['poison', 2], ['scry', 1]] },
      'm-still-water': { o: [['stance', 'c'], ['scry', 2], ['blk', S]] }, 'm-sash-whip': { o: [['dmg', 2 * S], ['weak', 2]] }, 'm-cut-through': { o: [['dmg', 2 * S], ['blk', S], ['scry', 1]] },
      'm-empty-fist': { o: [['dmg', 3 * S], ['stance', 'n'], ['draw', 1]] }, 'm-bow': { o: [['blk', 2 * S], ['scry', 3]] }, 'm-third-eye': { o: [['blk', 2 * S], ['scry', 2], ['draw', 1]] },
      'm-inner-peace': { o: [['draw', 3], ['stance', 'c']] }, 'm-wheel-kick': { o: [['dmg', 4 * S], ['scry', 2]] }, 'm-rushdown': { c: 0 },
      'm-mental-fort': { o: [['power', 'mental', 2 * S], ['stance', 'c']] }, 'm-flying-sleeves': { o: [['hit', 3, S], ['scry', 1]] }, 'm-windmill': { o: [['all', 2 * S], ['blk', S]] },
      'm-roll-with-it': { o: [['roll', [['blk', 2 * S]], [['blk', 3 * S]], [['blk', 4 * S], ['stance', 'c']]]] }, 'm-sky-hammer': { o: [['hit', 5, S], ['stance', 'w']] },
      'm-zen-burst': { o: [['mir', 2], ['stance', 'c'], ['draw', 1]] }, 'm-deva-form': { c: 2 }, 'm-judgment': { o: [['dmg', 6 * S]] },
      'n-bandage': { o: [['heal', 2 * S], ['blk', S]] }, 'n-good-instincts': { o: [['blk', 2 * S], ['draw', 1]] }, 'n-finesse': { o: [['blk', 2 * S], ['scry', 2]] },
      'n-panic-button': { o: [['blk', 6 * S]] }, 'n-hand-of-greed': { o: [['dmg', 4 * S], ['vuln', 1]] },
      'calm-spark': { o: [['nrg', 2]] }, 'shiv': { o: [['dmg', 2 * S]] }
    };
    Object.keys(U).forEach(function (id) { if (CARDS[id]) CARDS[id].up = U[id]; });
  })();
  // Passive / trigger rules a foe carries (not part of its intent): one short chip on the foe, one full sentence for the popup and the Rules.
  function foeNote(id) {
    var d = ENEMIES[id]; if (!d) return null;
    if (d.skillTax) return { chip: 'Skill: -' + d.skillTax * SCALE + ' HP', text: 'From its 2nd turn, every Skill you play costs you ' + d.skillTax * SCALE + ' HP. Attacks and Powers are free.' };
    if (d.deathVuln) return { chip: 'Dies: you Vulnerable', text: 'When it dies, every hero becomes Vulnerable ' + d.deathVuln + '.' };
    if (d.curl) return { chip: 'Curls: +' + d.curl * SCALE + ' Block', text: 'The first time it is hurt, it curls up and gains ' + d.curl * SCALE + ' Block.' };
    if (d.split) return { chip: 'Splits when slain', text: 'When it dies it bursts into smaller foes next round.' };
    if (d.keepBlk) return { chip: 'Keeps its Block', text: 'It keeps its Block between turns. Break the Block before its Mode Shift step and it turns defensive instead of attacking.' };
    if (d.sleep) return { chip: 'Asleep: wakes if hurt', text: 'It sleeps until you hurt it, then it wakes and fights.' };
    return null;
  }
  EC.D = { foeNote: foeNote, GOLD: GOLD, SCALE: SCALE, CAPS: CAPS, EHP: EHP, CARDS: CARDS, ORDER: ORDER, H: H, ENEMIES: ENEMIES, ENC: ENC, ENCA: ENCA, ACTBOSS: ACTBOSS, RELICS: RELICS, POTIONS: POTIONS, EVENTS: EVENTS, NODES: NODES, needsTarget: needsTarget,
    // Gentle (first climb) player-side numbers: max HP x hp, start with `pots` x `pot`, Rest heals `rest` (tabletop 3) x SCALE. Env GENTLE='{...}' overrides in the bench.
    GENTLE: (typeof process !== 'undefined' && process.env && process.env.GENTLE_CFG) ? JSON.parse(process.env.GENTLE_CFG) : { hp: 5, pots: 3, pot: 'healing-draught', rest: 8 } };
  if (typeof module !== 'undefined') module.exports = EC;
})();
