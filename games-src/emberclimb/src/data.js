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
  // Scale: tabletop rules that are pure numbers x SCALE (the shelf keeps video-game-sized HP and damage). Caps follow the tabletop.
  var SCALE = 3, CAPS = { str: 8, blk: 60, en: 6, shiv: 5, poison: 30, deb: 3, mir: 5 }, EHP = { 1: 1, 2: 1.6 };
  var H = {
    w: { k: 'w', name: 'Garrick Cinderplate', role: 'Ember Warrior', hp: 80, mech: 'Strength: every point adds damage to all attacks.', art: 'broad-shouldered armoured warrior with a glowing ember-forged greatsword', relic: 'ember-brand', start: ['w-strike', 'w-strike', 'w-strike', 'w-strike', 'w-strike', 'w-defend', 'w-defend', 'w-defend', 'w-defend', 'w-hammer'], col: '#c8472b' },
    s: { k: 's', name: 'Sable Quillfinger', role: 'Venom Rogue', hp: 70, mech: 'Poison and Shivs: stack poison, flood the table with 0-cost shivs.', art: 'hooded lithe rogue with throwing knives and a vial of green venom', relic: 'whetstone-ring', start: ['s-strike', 's-strike', 's-strike', 's-strike', 's-strike', 's-defend', 's-defend', 's-defend', 's-defend', 's-defend', 's-pinprick', 's-slip-away'], col: '#3f9b5a' },
    a: { k: 'a', name: 'Cog-9', role: 'Orb Automaton', hp: 75, mech: 'Orbs: channel Lightning, Frost and Dark; evoke them for big effects.', art: 'friendly brass clockwork automaton with three glowing orbs orbiting its chest', relic: 'spark-core', start: ['a-strike', 'a-strike', 'a-strike', 'a-strike', 'a-defend', 'a-defend', 'a-defend', 'a-defend', 'a-zap', 'a-dualcast'], col: '#3d8fd0' },
    m: { k: 'm', name: 'Ione Stillwater', role: 'Stance Monk', hp: 72, mech: 'Stances: Wrath adds 3 damage per hit; Calm gives energy on exit.', art: 'serene barefoot monk in saffron robes with prayer beads, calm and wrathful aura halves', relic: 'prayer-beads', start: ['m-strike', 'm-strike', 'm-strike', 'm-strike', 'm-defend', 'm-defend', 'm-defend', 'm-defend', 'm-eruption', 'm-vigilance'], col: '#c9a227' }
  };
  // ---------- Warrior
  c('w-strike', 'w', 'Cinder Strike', 'A', 's', 1, [['dmg', 6]], 'plain sword cut trailing orange sparks');
  c('w-defend', 'w', 'Plate Guard', 'S', 's', 1, [['blk', 5]], 'dented round shield raised against flames');
  c('w-hammer', 'w', 'Anvil Blow', 'A', 's', 2, [['dmg', 8], ['vuln', 2]], 'huge hammer cracking an anvil-shaped rock');
  c('w-cleave', 'w', 'Sweeping Arc', 'A', 'c', 1, [['all', 8]], 'wide sword arc across three foes');
  c('w-twin-slash', 'w', 'Twin Slash', 'A', 'c', 1, [['hit', 2, 5]], 'two crossed sword slashes in a flash');
  c('w-warm-up', 'w', 'Warm Up', 'S', 'c', 1, [['str', 1], ['draw', 1]], 'warrior stretching by a campfire, sparks rising');
  c('w-bulwark-bash', 'w', 'Bulwark Bash', 'A', 'c', 1, [['dmg', 5], ['blk', 5]], 'shield slammed into a goblin chest');
  c('w-sunder', 'w', 'Sunder Plate', 'A', 'c', 2, [['dmg', 8], ['vuln', 2]], 'axe splitting a breastplate in two');
  c('w-iron-skin', 'w', 'Iron Skin', 'S', 'c', 1, [['blk', 8]], 'arm turning to grey iron');
  c('w-skull-rap', 'w', 'Skull Rap', 'A', 'c', 1, [['dmg', 7], ['draw', 1]], 'helmeted headbutt with a shower of stars');
  c('w-roar', 'w', 'Intimidating Roar', 'S', 'c', 0, [['weakAll', 1]], 'warrior bellowing, enemies shrinking back', 'x');
  c('w-wild-swing', 'w', 'Wild Swing', 'A', 'c', 1, [['roll', [['dmg', 5]], [['dmg', 9]], [['dmg', 14]]]], 'reckless spinning swing, a die tumbling in the air');
  c('w-whirlwind', 'w', 'Whirling Gale', 'A', 'u', 'X', [['all', 5]], 'warrior spinning in a ring of blades');
  c('w-kindle', 'w', 'Kindle', 'P', 'u', 1, [['str', 2]], 'ember blooming in a clenched fist');
  c('w-slow-burn', 'w', 'Slow Burn', 'P', 'u', 1, [['power', 'ritual', 1]], 'coals glowing steadily inside a ribcage');
  c('w-body-check', 'w', 'Body Check', 'A', 'u', 1, [['bodyslam']], 'armoured shoulder charge through a wooden door');
  c('w-second-wind', 'w', 'Second Wind', 'S', 'u', 1, [['loss', 2], ['draw', 2]], 'warrior gulping air on one knee');
  c('w-berserk-roll', 'w', 'Berserk Roll', 'S', 'u', 1, [['roll', [['draw', 1]], [['draw', 2]], [['draw', 3]]]], 'wild-eyed warrior and a rolling die in a battle frenzy');
  c('w-reapers-edge', 'w', "Reaper's Edge", 'A', 'u', 2, [['dmg', 12], ['heal', 3]], 'curved scythe blade drinking red light');
  c('w-plate-up', 'w', 'Plate Up', 'P', 'u', 1, [['power', 'plated', 4]], 'armour plates sliding over a torso');
  c('w-pyre-heart', 'w', 'Pyre Heart', 'P', 'r', 3, [['power', 'ritual', 3]], 'a blazing furnace heart in an open chest');
  c('w-colossus-slam', 'w', 'Colossus Slam', 'A', 'r', 2, [['dmgx', 12, 3]], 'giant fist of molten rock crashing down');
  c('w-double-down', 'w', 'Double Down', 'S', 'r', 1, [['dblStr']], 'two identical fiery fists side by side', 'x');
  c('w-final-gambit', 'w', 'Final Gambit', 'A', 'r', 3, [['dmg', 32]], 'lone warrior charging a dragon silhouette', 'x');
  // ---------- Rogue
  c('s-strike', 's', 'Quick Cut', 'A', 's', 1, [['dmg', 6]], 'short dagger slash in dim light');
  c('s-defend', 's', 'Cloak Guard', 'S', 's', 1, [['blk', 5]], 'dark cloak swirled across the body');
  c('s-pinprick', 's', 'Pinprick', 'A', 's', 0, [['dmg', 3], ['weak', 1]], 'needle dart striking a shoulder');
  c('s-slip-away', 's', 'Slip Away', 'S', 's', 1, [['blk', 8]], 'rogue vanishing in a puff of grey smoke');
  c('s-blade-fan', 's', 'Blade Fan', 'S', 'c', 1, [['shiv', 3]], 'three throwing knives fanned in one hand');
  c('s-toxic-vial', 's', 'Toxic Vial', 'S', 'c', 1, [['poison', 3]], 'glass vial of bubbling green venom');
  c('s-quick-stab', 's', 'Gutter Stab', 'A', 'c', 1, [['dmg', 9]], 'upward stab from an alley shadow');
  c('s-dodge-roll', 's', 'Dodge Roll', 'S', 'c', 0, [['blk', 4], ['draw', 1]], 'rogue tumbling under a swinging club');
  c('s-hidden-knives', 's', 'Hidden Knives', 'S', 'c', 1, [['shiv', 2], ['blk', 4]], 'knives tucked inside a coat lining');
  c('s-dagger-spray', 's', 'Dagger Spray', 'A', 'c', 1, [['all', 4], ['all', 4]], 'burst of daggers flying outward');
  c('s-cripple', 's', 'Hamstring', 'S', 'c', 1, [['weak', 2], ['vuln', 1]], 'rope snare around an ogre leg');
  c('s-lucky-pick', 's', 'Lucky Pick', 'S', 'c', 1, [['blk', 6], ['roll', [], [['draw', 1]], [['draw', 2], ['nrg', 1]]]], 'pickpocket hand flipping a die and a coin');
  c('s-snap-cut', 's', 'Barbed Cut', 'A', 'c', 1, [['dmg', 6], ['poison', 2]], 'barbed blade dripping green');
  c('s-catalyst', 's', 'Catalyst', 'S', 'u', 1, [['dblPoison']], 'green flask thrown into a green cauldron', 'x');
  c('s-noxious', 's', 'Noxious Haze', 'P', 'u', 1, [['power', 'noxious', 1]], 'sickly green mist curling around boots');
  c('s-envenom', 's', 'Coat Blades', 'P', 'u', 2, [['power', 'envenom', 1]], 'brush painting venom onto a dagger');
  c('s-knife-rain', 's', 'Knife Rain', 'S', 'u', 2, [['shiv', 5]], 'a downpour of tiny knives from above');
  c('s-backstab', 's', 'Backstab', 'A', 'u', 0, [['dmg', 11]], 'rogue behind a distracted guard', 'x');
  c('s-choking-cloud', 's', 'Choking Cloud', 'S', 'u', 2, [['poisonAll', 2]], 'billowing poison cloud over a crowd', 'x');
  c('s-needle-rain', 's', 'Needle Volley', 'A', 'u', 2, [['hit', 3, 4]], 'three needles in a straight row');
  c('s-venom-storm', 's', 'Venom Storm', 'S', 'r', 2, [['poisonAll', 3]], 'swirling emerald storm of droplets');
  c('s-afterimage', 's', 'Afterimage', 'P', 'r', 1, [['power', 'afterimg', 1]], 'ghostly echo of the rogue trailing behind');
  c('s-final-flourish', 's', 'Final Flourish', 'A', 'r', 2, [['dmg', 28]], 'dramatic bow with a single bright blade', 'x');
  c('s-plague-doctor', 's', 'Plague Brew', 'S', 'r', 2, [['poison', 4], ['dblPoison']], 'beaked mask above a seething black cauldron');
  // ---------- Automaton
  c('a-strike', 'a', 'Piston Jab', 'A', 's', 1, [['dmg', 6]], 'brass piston arm punching forward');
  c('a-defend', 'a', 'Plating Shift', 'S', 's', 1, [['blk', 5]], 'metal plates sliding shut');
  c('a-zap', 'a', 'Spark Up', 'S', 's', 1, [['chan', 'L']], 'single blue spark leaping between coils');
  c('a-dualcast', 'a', 'Twin Pulse', 'S', 's', 1, [['evoke2']], 'orb pulsing twice in a ring of rings');
  c('a-ball-lightning', 'a', 'Ball Lightning', 'A', 'c', 1, [['dmg', 7], ['chan', 'L']], 'crackling sphere of lightning thrown');
  c('a-cool-circuit', 'a', 'Cool Circuit', 'S', 'c', 1, [['chan', 'F'], ['draw', 1]], 'frosted circuit board with ice crystals');
  c('a-charge-up', 'a', 'Charge Up', 'S', 'c', 1, [['blk', 5], ['chan', 'L']], 'dynamo winding up with sparks');
  c('a-barrier-pulse', 'a', 'Barrier Pulse', 'S', 'c', 1, [['blk', 7]], 'hexagonal energy barrier');
  c('a-beam-cell', 'a', 'Beam Cell', 'A', 'c', 0, [['dmg', 3], ['chan', 'L']], 'tiny cell firing a thin beam');
  c('a-sweeping-beam', 'a', 'Sweeping Beam', 'A', 'c', 1, [['all', 6], ['draw', 1]], 'laser fan sweeping across a hall');
  c('a-overclock', 'a', 'Overclock', 'S', 'c', 0, [['draw', 2], ['add', 'burn', 1, 'disc']], 'gears glowing red-hot and smoking');
  c('a-static-jolt', 'a', 'Static Jolt', 'S', 'c', 1, [['roll', [['chan', 'L']], [['chan', 'L'], ['chan', 'F']], [['chan', 'L'], ['chan', 'L'], ['chan', 'F']]]], 'automaton hand crackling and a die rolling');
  c('a-compile-strike', 'a', 'Compile Strike', 'A', 'c', 1, [['dmg', 6], ['chan', 'F']], 'cold blue gauntlet punch');
  c('a-capacitor', 'a', 'Capacitor Bank', 'P', 'u', 1, [['power', 'slots', 2]], 'row of glass capacitor jars');
  c('a-defrag', 'a', 'Focus Lattice', 'P', 'u', 1, [['power', 'focus', 1]], 'glowing lattice of crystal lines');
  c('a-glacier', 'a', 'Glacier Core', 'S', 'u', 2, [['blk', 6], ['chan', 'F'], ['chan', 'F']], 'two ice orbs wrapped in frost');
  c('a-darkness', 'a', 'Dark Matter', 'S', 'u', 1, [['chan', 'D']], 'swirling violet-black orb');
  c('a-tempest', 'a', 'Storm Array', 'S', 'u', 'X', [['chanX', 'L']], 'ring of lightning orbs overhead');
  c('a-multicast', 'a', 'Multicast', 'S', 'u', 'X', [['evokeX']], 'orb bursting into many copies');
  c('a-core-breach', 'a', 'Core Breach', 'A', 'u', 2, [['all', 10]], 'overloaded reactor core exploding outward');
  c('a-biased-core', 'a', 'Biased Core', 'P', 'r', 1, [['power', 'focus', 3]], 'brass brain core with bright wires');
  c('a-meteor-strike', 'a', 'Meteor Strike', 'A', 'r', 3, [['dmg', 24], ['chan', 'L'], ['chan', 'L'], ['chan', 'L']], 'fiery meteor slamming down on a robot hand');
  c('a-hyperbeam', 'a', 'Hyperbeam', 'A', 'r', 2, [['all', 26], ['focus', -3]], 'enormous white beam from a chest cannon');
  c('a-reactor', 'a', 'Mini Reactor', 'P', 'r', 2, [['power', 'reactor', 1]], 'tiny glowing reactor in a glass jar');
  // ---------- Monk
  c('m-strike', 'm', 'Open Palm', 'A', 's', 1, [['dmg', 6]], 'flat palm strike with a ripple of air');
  c('m-defend', 'm', 'Guarded Stance', 'S', 's', 1, [['blk', 5]], 'monk arms crossed in defence');
  c('m-eruption', 'm', 'Wrath Eruption', 'A', 's', 2, [['dmg', 12], ['stance', 'w']], 'red flames bursting from a monk fist');
  c('m-vigilance', 'm', 'Quiet Vigil', 'S', 's', 2, [['blk', 11], ['stance', 'c']], 'monk sitting under a blue lotus glow');
  c('m-palm-flurry', 'm', 'Palm Flurry', 'A', 'c', 0, [['dmg', 5], ['draw', 1]], 'many blurred hands striking');
  c('m-crush-joints', 'm', 'Crush Joints', 'A', 'c', 1, [['dmg', 8], ['vuln', 1]], 'precise elbow strike to an armoured joint');
  c('m-pressure-point', 'm', 'Pressure Point', 'S', 'c', 0, [['poison', 3]], 'fingertip pressed on a glowing nerve spot');
  c('m-still-water', 'm', 'Still Water', 'S', 'c', 1, [['stance', 'c'], ['blk', 4]], 'perfectly calm pond with a single ripple');
  c('m-sash-whip', 'm', 'Sash Whip', 'A', 'c', 1, [['dmg', 8], ['weak', 1]], 'silk sash cracking like a whip');
  c('m-cut-through', 'm', 'Cut Through', 'A', 'c', 1, [['dmg', 7], ['blk', 2]], 'blade of air slicing a bamboo stalk');
  c('m-empty-fist', 'm', 'Empty Fist', 'A', 'c', 1, [['dmg', 9], ['stance', 'n']], 'open empty hand over a plain stone');
  c('m-bow', 'm', 'Deep Bow', 'S', 'c', 0, [['blk', 4], ['scry', 2]], 'monk bowing low at a shrine gate');
  c('m-third-eye', 'm', 'Third Eye', 'S', 'c', 1, [['blk', 7], ['scry', 3]], 'glowing eye painted on a forehead');
  c('m-inner-peace', 'm', 'Inner Peace', 'S', 'u', 1, [['draw', 3], ['stance', 'c']], 'monk meditating on a floating stone');
  c('m-wheel-kick', 'm', 'Wheel Kick', 'A', 'u', 2, [['dmg', 15], ['draw', 2]], 'spinning high kick trailing a circle');
  c('m-rushdown', 'm', 'Rushdown', 'P', 'u', 1, [['power', 'rush', 2]], 'red wind rushing around a crouched monk');
  c('m-mental-fort', 'm', 'Mental Fortress', 'P', 'u', 1, [['power', 'mental', 4]], 'translucent fortress rising from meditation');
  c('m-flying-sleeves', 'm', 'Flying Sleeves', 'A', 'u', 1, [['hit', 2, 4]], 'long robe sleeves flying like wings');
  c('m-windmill', 'm', 'Windmill Strike', 'A', 'u', 1, [['all', 6]], 'monk spinning with arms out like a windmill');
  c('m-roll-with-it', 'm', 'Roll With It', 'S', 'u', 1, [['roll', [['blk', 6]], [['blk', 10]], [['blk', 14], ['stance', 'c']]]], 'monk tumbling softly as a die lands nearby');
  c('m-sky-hammer', 'm', 'Sky Hammer', 'A', 'r', 3, [['hit', 4, 6]], 'four heavenly hammer-shaped lights falling');
  c('m-zen-burst', 'm', 'Zen Burst', 'S', 'r', 0, [['mir', 2], ['stance', 'c']], 'blinding golden burst behind a calm monk', 'x');
  c('m-deva-form', 'm', 'Deva Form', 'P', 'r', 3, [['power', 'deva', 1]], 'monk ascending with golden multi-armed halo');
  c('m-judgment', 'm', 'Final Verdict', 'A', 'r', 1, [['dmg', 30]], 'a single glowing sword of light over a scale', 'xt');
  // ---------- Neutral (shop, events)
  c('n-bandage', 'n', 'Bandage Up', 'S', 'c', 0, [['heal', 4]], 'cloth bandage rolled around an arm', 'x');
  c('n-good-instincts', 'n', 'Good Instincts', 'S', 'c', 0, [['blk', 6]], 'eyes opening wide in a dark corridor', 'x');
  c('n-finesse', 'n', 'Finesse', 'S', 'c', 0, [['blk', 2], ['draw', 1]], 'light-footed step over a rope');
  c('n-panic-button', 'n', 'Panic Button', 'S', 'u', 0, [['blk', 30]], 'big red button under a glass cover', 'xt');
  c('n-hand-of-greed', 'n', 'Hand of Greed', 'A', 'u', 2, [['dmg', 20]], 'golden clenched hand with coins', '');
  // ---------- Statuses and curses (unplayable junk)
  c('wound', 'z', 'Wound', 'X', 'z', -1, [], 'torn bandage with a red stain', 'u');
  c('dazed', 'z', 'Dazed', 'X', 'z', -1, [], 'spiral of stars around a head', 'ue');
  c('burn', 'z', 'Burn', 'X', 'z', -1, [], 'small hot flame licking a card', 'ub');
  c('slimed', 'z', 'Slimed', 'X', 'z', 1, [], 'green slime dripping off a card', 'x');
  c('regret', 'z', 'Regret', 'X', 'k', -1, [], 'faded letter left on a dark table', 'ur');
  c('doubt', 'z', 'Doubt', 'X', 'k', -1, [], 'cracked mirror showing a worried face', 'ud');
  c('injury', 'z', 'Lingering Injury', 'X', 'k', -1, [], 'old bruise on a shoulder', 'u');
  c('calm-spark', 'z', 'Calm Spark', 'S', 'z', 0, [['nrg', 1]], 'small golden light cupped in two hands', 'x');
  c('shiv', 'z', 'Shiv', 'A', 'z', 0, [['dmg', 3]], 'small improvised blade', 'x');
  // flags: t=retain (stays in hand at end of turn) u=unplayable x=exhaust e=ethereal(exhaust at end of turn) b=burn(2 hp at end of turn if held) r=regret d=doubt

  var ENEMIES = {
    'mire-slug': { name: 'Mire Slug', hp: [11, 15], pat: [{ atk: 5 }, { atk: 3, weak: 1 }, { atk: 6 }], art: 'fat grey-green slug with eyestalks on a swamp log' },
    'gnawer': { name: 'Gnawer', hp: [10, 14], pat: [{ atk: 4 }, { atk: 4 }, { blk: 5, str: 1 }], art: 'oversized scruffy rat showing yellow teeth' },
    'hex-acolyte': { name: 'Hex Acolyte', hp: [40, 44], pat: [{ str: 3 }, { atk: 6 }], ritual: 3, art: 'cultist in a feathered hood chanting by a candle' },
    'gape-grub': { name: 'Gape Grub', hp: [40, 44], pat: [{ die: [{ str: 3, blk: 6 }, { atk: 7, blk: 5 }, { atk: 11 }] }], art: 'wide-mouthed pale grub with a ring of teeth' },
    'rust-tick': { name: 'Rust Tick', hp: [10, 14], pat: [{ atk: 5 }, { die: [{ weak: 2 }, { atk: 4, weak: 1 }, { atk: 7 }] }, { atk: 6 }], art: 'rust-coloured tick the size of a dog' },
    'bile-blob': { name: 'Bile Blob', hp: [28, 32], pat: [{ atk: 7, add: ['slimed', 1] }, { atk: 11 }, { add: ['slimed', 2] }], art: 'quivering yellow blob of acid with floating bones' },
    'snare-vine': { name: 'Snare Vine', hp: [22, 26], pat: [{ vuln: 2 }, { die: [{ atk: 4, blk: 6 }, { atk: 8 }, { atk: 11 }] }], art: 'thorny vine bundle with a grasping tendril' },
    'ash-imp': { name: 'Ash Imp', hp: [16, 20], pat: [{ atk: 3, hits: 3 }, { atk: 3, hits: 3 }, { blk: 6, str: 1 }], art: 'small black imp with ember eyes and bat wings' },
    'thorn-brute': { name: 'Thorn Brute', hp: [80, 86], pat: [{ str: 2 }, { atk: 14 }, { atk: 8, vuln: 2 }], onSkill: 2, elite: 1, art: 'bark-skinned hulking brute with thorns and a horned skull' },
    'sleeper-statue': { name: 'Sleeper Statue', hp: [78, 84], sleep: 3, pat: [{ atk: 16 }, { atk: 16 }, { weak: 2, vuln: 1 }], elite: 1, art: 'mossy stone statue of a seated giant with one eye opening' },
    'iron-warden': { name: 'Iron Warden', hp: [36, 40], pat: [{ atk: 9 }, { add: ['dazed', 2] }, { atk: 6, blk: 6 }], elite: 1, art: 'tall slim iron sentry with a lantern head' },
    'warden-captain': { name: 'Warden Captain', hp: [56, 60], pat: [{ atk: 11 }, { blk: 10, spikes: 7 }, { atk: 22 }], boss: 1, art: 'iron sentry captain in spiked plate with a lantern helm' },
    'mire-behemoth': { name: 'Mire Behemoth', hp: [132, 140], split: ['bile-blob', 'mire-slug', 'mire-slug'], splitSay: 'bursts apart', pat: [{ atk: 9, add: ['slimed', 2] }, { blk: 12, str: 2 }, { atk: 22 }, { atk: 7, hits: 2, all: 1 }], boss: 1, art: 'colossal swamp creature of mud and reeds with a wide mouth' },
    'ashen-wraith': { name: 'Ashen Wraith', hp: [124, 130], pat: [{ add: ['burn', 1], atk: 6, all: 1 }, { die: [{ blk: 10, str: 2 }, { atk: 5, hits: 2 }, { atk: 6, hits: 3 }] }], boss: 1, art: 'tall ghost of burnt cloth and ash with six floating candles' },
    'gate-colossus': { name: 'Gate Wyrm', hp: [138, 146], pat: [{ atk: 9, hits: 2 }, { blk: 16 }, { atk: 24, vuln: 2 }, { str: 3, blk: 8 }], boss: 1, art: 'green horned wyrm bursting out of a dungeon gate' },
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
  var ENC = {
    weak: [['mire-slug', 'gnawer'], ['rust-tick', 'rust-tick'], ['ash-imp', 'ash-imp'], ['mire-slug', 'rust-tick']],   // the 40-HP Grub and Acolyte are strong-pool foes
    strong: [['bile-blob', 'rust-tick'], ['snare-vine', 'ash-imp', 'mire-slug'], ['gape-grub', 'gnawer'], ['hex-acolyte', 'rust-tick']],   // G3 r3: solo takes the lead foe; the weak Ash Imp pair moved to the weak pool
    elite: [['thorn-brute'], ['sleeper-statue'], ['iron-warden', 'iron-warden', 'iron-warden']],
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
  var RELICS = {
    'ember-brand': { name: 'Ember Brand', t: 'Heal 6 after each fight.', rar: 's', art: 'iron brand glowing orange at the tip' },
    'whetstone-ring': { name: 'Whetstone Ring', t: 'Draw 2 extra on turn 1.', rar: 's', art: 'silver ring with a tiny whetstone' },
    'spark-core': { name: 'Spark Core', t: 'Start fights with a Lightning orb.', rar: 's', art: 'glass sphere with a trapped blue spark' },
    'prayer-beads': { name: 'Prayer Beads', t: 'Start fights with 1 Miracle: spend for +1 energy.', rar: 's', art: 'string of wooden prayer beads' },
    'lucky-coin': { name: 'Lucky Coin', t: '+25 gold now.', rar: 'c', art: 'chipped gold coin balanced on its edge' },
    'iron-bangle': { name: 'Iron Bangle', t: 'Start fights with 4 Block.', rar: 'c', art: 'thick iron bracelet with a rune notch' },
    'lantern': { name: 'Tin Lantern', t: '+1 energy on turn 1.', rar: 'c', art: 'small dented tin lantern lit from within' },
    'bag-of-marbles': { name: 'Bag of Marbles', t: 'Enemies start Vulnerable 1.', rar: 'c', art: 'leather pouch spilling glass marbles' },
    'clover-dice': { name: 'Clover Dice', t: 'Dice rolls get +1 (max 6).', rar: 'c', art: 'carved bone die with a four-leaf clover on it' },
    'healing-moss': { name: 'Healing Moss', t: 'Rest sites heal 10 more.', rar: 'c', art: 'clump of glowing green moss on a stone' },
    'gold-tooth': { name: 'Gold Tooth', t: '+50% gold from fights.', rar: 'c', art: 'single gold tooth on a velvet scrap' },
    'oak-heart': { name: 'Oak Heart', t: '+8 max HP now.', rar: 'c', art: 'heart-shaped knot cut from an oak branch' },
    'candle-stub': { name: 'Candle Stub', t: 'Draw 1 extra on turn 1.', rar: 'c', art: 'melted candle stub on a saucer' },
    'pocket-satchel': { name: 'Pocket Satchel', t: '+1 potion slot.', rar: 'c', art: 'small canvas satchel with brass buckles' },
    'tin-flute': { name: 'Tin Flute', t: 'Skills give +1 Block.', rar: 'u', art: 'little tin flute with painted stripes' },
    'smoking-censer': { name: 'Smoking Censer', t: 'Attacks deal +1 damage.', rar: 'u', art: 'hanging brass censer trailing grey smoke' },
    'dawnstone': { name: 'Dawnstone', t: '+1 energy every turn.', rar: 'b', art: 'pale pink glowing stone like a sunrise' },
    'gale-cloak': { name: 'Gale Cloak', t: 'Draw 1 extra every turn.', rar: 'b', art: 'wind-tossed travelling cloak with a brooch' },
    'phoenix-ash': { name: 'Phoenix Ash', t: 'Once per run: revive at 30% HP.', rar: 'b', art: 'urn of warm glowing ash with a red feather' }
  };
  var POTIONS = {
    'fire-flask': { name: 'Fire Flask', t: 'Deal 20 to an enemy.', tgt: 1, art: 'round flask of bright orange fire' },
    'block-brew': { name: 'Block Brew', t: 'Gain 12 Block.', art: 'grey potion bottle with metal flecks' },
    'strength-tonic': { name: 'Strength Tonic', t: 'Gain 2 Strength.', art: 'thick red tonic in a tall bottle' },
    'swift-draught': { name: 'Swift Draught', t: 'Draw 3 cards.', art: 'silver-blue swirling potion with wings' },
    'energy-vial': { name: 'Energy Vial', t: 'Gain 2 energy.', art: 'yellow glowing vial with lightning shape' },
    'venom-vial': { name: 'Venom Vial', t: 'Poison an enemy 4.', tgt: 1, art: 'skull-stoppered green vial' },
    'frost-gas': { name: 'Frost Gas', t: 'All enemies Weak 3.', art: 'pale blue misty bottle' },
    'healing-draught': { name: 'Healing Draught', t: 'Heal 20.', art: 'rosy pink potion in a heart-shaped flask' },
    'fortune-die': { name: 'Fortune Die', t: 'Next 2 dice rolls show 6.', art: 'golden die floating inside a glass bottle' }
  };
  var EVENTS = {
    'ember-shrine': { name: 'Ember Shrine', q: 'A shrine hums with warm light.', art: 'small stone shrine with floating embers', o: [{ t: 'Pray: heal 15', do: { heal: 15 } }, { t: 'Offer 6 HP: upgrade a card', do: { hp: -6, upg: 1 } }, { t: 'Walk on', do: {} }] },
    'wandering-tinker': { name: 'Wandering Tinker', q: 'A tinker offers a trade.', art: 'cheerful tinker with a cart of pots and gadgets', o: [{ t: 'Buy a relic (90 gold)', do: { gold: -90, relic: 1 }, cost: 90 }, { t: 'Sell blood: +60 gold, -8 HP', do: { gold: 60, hp: -8 } }, { t: 'Leave', do: {} }] },
    'whispering-well': { name: 'Whispering Well', q: 'Drink? Roll the die.', art: 'old stone well with blue mist and a coin', o: [{ t: 'Drink and roll', roll: [{ hp: -8 }, { gold: 40 }, { relic: 1 }] }, { t: 'Leave', do: {} }] },
    'stranded-caravan': { name: 'Stranded Caravan', q: 'A broken cart blocks the road.', art: 'wrecked merchant cart in a forest road', o: [{ t: 'Help: lose 5 HP, gain a card', do: { hp: -5, card: 1 } }, { t: 'Loot: +45 gold, Regret', do: { gold: 45, curse: 'regret' } }, { t: 'Leave', do: {} }] },
    'mirror-pool': { name: 'Mirror Pool', q: 'Your reflection offers a deal.', art: 'still dark pond reflecting a different sky', o: [{ t: 'Lose 7 HP: remove a card', do: { hp: -7, rem: 1 } }, { t: 'Gain 6 max HP, Doubt', do: { mhp: 6, curse: 'doubt' } }, { t: 'Step in: transform a card', do: { xform: 1 } }, { t: 'Leave', do: {} }] },
    'first-ember': { img: 'event-ember-shrine', start: 1, name: 'The First Ember', q: 'A warm ember offers one gift.', art: 'small glowing ember floating over an open palm', o: [{ t: 'Gain 8 max HP', do: { mhp: 8 } }, { t: 'Take 100 gold', do: { gold: 100 } }, { t: 'Take a rare card', do: { rare: 1 } }, { t: 'Lose 10 HP: take a relic', do: { hp: -10, relic: 1 } }] },
    'ash-library': { img: 'node-event', name: 'Ash Library', q: 'Half-burnt books line the walls.', art: 'tall scorched bookshelves with drifting pages', o: [{ t: 'Read: gain a card', do: { card: 1 } }, { t: 'Sleep here: heal 12', do: { heal: 12 } }, { t: 'Leave', do: {} }] },
    'cursed-chest': { img: 'node-event', name: 'Cursed Chest', q: 'A chest hums with a dark tune.', art: 'iron-bound chest leaking purple smoke', o: [{ t: 'Open: a relic and Regret', do: { relic: 1, curse: 'regret' } }, { t: 'Leave', do: {} }] },
    'herb-witch': { img: 'event-wandering-tinker', name: 'Herb Witch', q: 'An old woman stirs a pot.', art: 'smiling old woman stirring a bubbling green pot', o: [{ t: 'Buy 2 potions (40 gold)', do: { gold: -40, pot: 2 }, cost: 40 }, { t: 'Taste the stew: heal 8', do: { heal: 8 } }, { t: 'Leave', do: {} }] },
    'forge-spirit': { img: 'event-ember-shrine', name: 'Forge Spirit', q: 'A spirit offers to hammer a card.', art: 'glowing figure of flame standing at an anvil', o: [{ t: 'Upgrade a card', do: { upg: 1 } }, { t: 'Lose 6 HP: 2 max HP', do: { hp: -6, mhp: 2 } }, { t: 'Leave', do: {} }] },
    'golden-idol': { img: 'node-event', name: 'Golden Idol', q: 'A golden idol sits on a trap.', art: 'small golden idol on a stone plinth with cracks', o: [{ t: 'Grab it: +100 gold, Injury', do: { gold: 100, curse: 'injury' } }, { t: 'Grab carefully: +50 gold, -9 HP', do: { gold: 50, hp: -9 } }, { t: 'Leave', do: {} }] },
    'kind-pilgrim': { img: 'event-stranded-caravan', name: 'Kind Pilgrim', q: 'A pilgrim shares the fire.', art: 'hooded pilgrim at a small campfire offering bread', o: [{ t: 'Rest: heal 10', do: { heal: 10 } }, { t: 'Trade stories: remove a card, -4 HP', do: { hp: -4, rem: 1 } }, { t: 'Leave', do: {} }] },
    'back-alley-gambler': { name: 'Back Alley Gambler', q: 'A grin and a pair of dice.', art: 'hooded gambler at a barrel table with dice', o: [{ t: 'Bet 30 gold, roll', roll: [{ gold: -30 }, { gold: -30 }, { gold: 0 }, { gold: 0 }, { gold: 60 }, { gold: 90 }], cost: 30 }, { t: 'Walk away', do: {} }] }
  };
  var NODES = { m: 'Monster', e: 'Elite', r: 'Rest', s: 'Shop', v: 'Event', t: 'Treasure', b: 'Boss' };
  EC.D = { SCALE: SCALE, CAPS: CAPS, EHP: EHP, CARDS: CARDS, ORDER: ORDER, H: H, ENEMIES: ENEMIES, ENC: ENC, ENCA: ENCA, ACTBOSS: ACTBOSS, RELICS: RELICS, POTIONS: POTIONS, EVENTS: EVENTS, NODES: NODES, needsTarget: needsTarget };
  if (typeof module !== 'undefined') module.exports = EC;
})();
