// Wickdeep scenarios: 25 maps of our own design (the story of the drowned abbey and its last candles).
// Map key (one character per hex, odd rows sit half a hex to the right): ' ' or '#' wall, '.' floor, 'S' hero start, 'D' door,
// 'o' pillar/crate (blocks), '^' trap, '~' brine (hurts a little), ':' rubble (2 moves), '$' coin, 'T' treasure, 'X' exit,
// letters = monsters from the legend: n:[2 heroes, 3 heroes, 4 heroes] with 'n' normal, 'e' elite, '-' none.
(function (g) {
  'use strict';
  var D = g.WDD;
  function M(m, a, b, c) { return { m: m, n: [a, b, c] }; }
  var S = [];
  function add(o) { o.id = S.length + 1; S.push(o); }

  add({ n: 'The Candle Cellar', act: 1, goal: { t: 'kill', text: 'Defeat every monster' },
    intro: ['The abbey candles are failing.', 'Something stirs in the wax cellar.'], outro: 'The cellar is quiet. A drain leads deeper.',
    map: ['.......', '..S.S..', '.S.$.S.', '...o...', '###D###', '.......', '..a.b..', '.o...^.', '..a.c..', '...$...'],
    legend: { a: M('rat', 'n', 'n', 'e'), b: M('wight', 'n', 'n', 'e'), c: M('rat', '-', 'n', 'n') },
    unlock: [2], reward: { gold: 5 } });

  add({ n: 'Rat Run', act: 1, goal: { t: 'kill', text: 'Defeat every monster' },
    intro: ['The drain opens into old sewers.', 'Rats. Hundreds of them.'], outro: 'Two tunnels split ahead.',
    map: ['SS.$..#.......', '.S..S.D..a.a..', '..o...#.:..o..', '......#..b..a.', '##D####.......', '......  ', '.c..^.', '..d...', '.c..$.'],
    legend: { a: M('rat', 'n', 'n', 'n'), b: M('rat', '-', 'e', 'e'), c: M('spider', 'n', 'n', 'e'), d: M('spider', '-', 'n', 'n') },
    unlock: [3, 4], reward: { gold: 5, items: ['i02', 'i11'] } });

  add({ n: 'The Salt Stair', act: 1, goal: { t: 'loot', n: 2, text: 'Grab both treasure chests' },
    intro: ['Smugglers stash salt on these steps.', 'They guard two chests.'], outro: 'The chests hold a key to the foundry.',
    treasure: [{ gold: 10 }, { item: 'i09' }],
    map: ['   ......   ', '  .S.S.S.   ', '  .S.$...   ', '  ##D###    ', '.~~.....a.  ', '.~T...o..a. ', '.~~.b......', '....o..~~.  ', '#####D######', '  ..a....   ', '  .o..T.c.  ', '  ...^..... '],
    legend: { a: M('bandit', 'n', 'n', 'e'), b: M('crab', 'n', 'e', 'e'), c: M('crab', '-', 'n', 'n') },
    unlock: [5], reward: { gold: 10 } });

  add({ n: 'Bellfoundry', act: 1, goal: { t: 'reach', text: 'Reach the exit (X)' },
    intro: ['Molten bronze once poured here.', 'Bats nest in the old bells.'], outro: 'You slip out through the slag chute.',
    map: ['S.S.......#....X.', '.S.S.o....D.b..a.', '....:.....#..o..c', '.$......o.#.a....', '########D#####...', '   ...a.....  ', '   ..o...b..  ', '   ...^.$...  '],
    legend: { a: M('bat', 'n', 'n', 'e'), b: M('archer', 'n', 'n', 'e'), c: M('ogre', '-', 'n', 'n') },
    unlock: [5], reward: { gold: 10, items: ['i05', 'i14'] } });

  add({ n: 'Mother of Wax', act: 1, boss: 'matron', goal: { t: 'boss', text: 'Defeat the Wax Matron' },
    intro: ['She shapes the dead from tallow.', 'Put out her fire.'], outro: 'The Matron melts. Her wicks point to the chapel.',
    map: ['  ..S.S..  ', ' ...S.S... ', ' ..o...o.. ', ' ......... ', '#####D#####', '..w.....w..', '.o...B...o.', '...^...^...', '.w.......w.', '..$.....$..'],
    legend: { B: { boss: 'matron' }, w: M('wight', 'n', 'n', 'e') },
    unlock: [6, 7], reward: { gold: 15, items: ['i03', 'i06', 'i22'] } });

  add({ n: 'Drowned Chapel', act: 2, goal: { t: 'kill', text: 'Defeat every monster' },
    intro: ['Water fills the chapel to the knee.', 'The monks still sing below.'], outro: 'A hidden stair goes down to the looms.',
    map: ['...S.S...#.......', '..~.S.S.~D..a.h..', '..~.....~#~.....~', '...o.o...#~..m..~', '##D#######.......', '.......  ', '..h.m..  ', '.~...~.  ', '..m.$..  '],
    legend: { a: M('monk', 'n', 'n', 'e'), h: M('hush', 'n', 'n', 'n'), m: M('monk', '-', 'n', 'e') },
    unlock: [8, 10], reward: { gold: 10, items: ['i15', 'i24'] } });

  add({ n: "Smugglers' Locks", act: 2, goal: { t: 'loot', n: 3, text: 'Grab all three treasure chests' },
    intro: ['The smugglers run the canal locks.', 'Their loot is ours now.'], outro: 'A map in the last chest shows the flooded nave.',
    treasure: [{ gold: 15 }, { item: 'i25' }, { gold: 15 }],
    map: ['S.S.S.S.....', '..$.......o.', '####D#######', '.T..a..~~..h', '...o...~~...', '.m.....~~.b.', '######D#####', '  .h.....T.  ', '  ..b.o.....', '  .T....h..  '],
    legend: { a: M('bandit', 'n', 'n', 'e'), h: M('hound', 'n', 'n', 'e'), b: M('bandit', '-', 'n', 'n'), m: M('mimic', 'n', 'n', 'n') },
    unlock: [9, 10], reward: { gold: 10, items: ['i26'] } });

  add({ n: 'Loom Hollow', act: 2, goal: { t: 'kill', text: 'Defeat every monster' },
    intro: ['Webs as thick as sails.', 'Something big is weaving.'], outro: 'Under the webs: an engine of bells.',
    map: ['  .S.S.S.  ', ' ...S..... ', ' ..o...o.. ', '####D######', '.s.:::.s...', '..o.....o..', '.:.s.^.u.:.', '..:.....:..', '#####D#####', ' ..u...s.. ', ' ...s.u... '],
    legend: { s: M('spider', 'n', 'n', 'e'), u: M('ooze', 'n', 'e', 'e') },
    unlock: [11], reward: { gold: 10, items: ['i27'] } });

  add({ n: 'The Flooded Nave', act: 2, goal: { t: 'escape', text: 'All heroes stand on exits (X)' },
    intro: ['The tide is rising in the nave.', 'Get across before it takes you.'], outro: 'You climb out, soaked and alive.',
    map: ['S.S..#~~~..t..', '.S.S.D~.~.....', '..o..#~~~..o.t', '.....#~...m...', '#####D########', '  ....m..~..XX', '  .t..o...~.XX', '  ...~~~.h...X'],
    legend: { t: M('thrall', 'n', 'n', 'e'), m: M('monk', 'n', 'n', 'n'), h: M('hush', '-', 'n', 'e') },
    unlock: [11], reward: { gold: 15, items: ['i28'] } });

  add({ n: 'Ash Choir', act: 2, goal: { t: 'objs', n: 3, text: 'Smash the three ash altars (A)' },
    intro: ['Acolytes burn hymns into the walls.', 'Their altars feed the dark.'], outro: 'The altars crack. The engine room is open.',
    map: ['..S.S.S..', '.S...$...', '###D#####', '.a...A..c', '..o...o..', 'A..c...a.', '..o...o..', '.a...A..c', '...^.^...'],
    legend: { A: { obj: { n: 'Ash Altar', hp: 4, per: 2 } }, a: M('acolyte', 'n', 'n', 'e'), c: M('wight', 'n', 'e', 'e') },
    unlock: [11], reward: { gold: 15, items: ['i29'] } });

  add({ n: 'Engine Deep', act: 2, goal: { t: 'kill', text: 'Defeat every monster' },
    intro: ['Gears grind under the abbey.', 'Ogres keep the furnaces hot.'], outro: 'The Knell Engine waits beyond.',
    map: ['S.S....#.......', '.S.S.o.D..o.g..', '.......#....:..', '..$....#.a..g..', '#######D#######', ' ..o..a...^... ', ' .g.......o... ', ' ...:..g.....  '],
    legend: { g: M('ogre', 'n', 'n', 'e'), a: M('archer', 'n', 'n', 'e') },
    unlock: [12], reward: { gold: 15, items: ['i30'] } });

  add({ n: 'The Knell Engine', act: 2, boss: 'engine', goal: { t: 'boss', text: 'Silence the Knell Engine' },
    intro: ['A machine of bells rings the dead awake.', 'Break it.'], outro: 'The bells stop. Saltmarsh lies open.',
    map: ['   ..S.S..   ', '  ..S...S..  ', '  .........  ', '######D######', '.a.o.....o.a.', '...:..B..:...', '.^...o.o...^.', '..c.......c..', '...$.....$...'],
    legend: { B: { boss: 'engine' }, a: M('archer', 'n', 'n', 'e'), c: M('crab', 'n', 'n', 'n') },
    unlock: [13, 14], reward: { gold: 20 } });

  add({ n: 'Saltmarsh Gate', act: 3, goal: { t: 'survive', n: 6, text: 'Hold the gate for 6 rounds', limit: 99 },
    intro: ['The tide army marches on the gate.', 'Hold it until the bells ring.'], outro: 'Dawn. The tide pulls back.',
    map: ['..t..h..t..', '.~...~...~.', '..h.....h..', '#####D#####', '...o...o...', '.S.S...S.S.', '...........', '...$...$...'],
    legend: { t: M('thrall', 'n', 'n', 'e'), h: M('hound', 'n', 'n', 'n') },
    unlock: [15], reward: { gold: 15 } });

  add({ n: 'Ink Wells', act: 3, goal: { t: 'kill', text: 'Defeat every monster' },
    intro: ['The scribes drowned in their own ink.', 'The ink still moves.'], outro: 'Among the wells, a lantern road.',
    map: ['S.S.S.S#........', '.......D..u..u..', '.o.$.o.#.~~..~~.', '.......#..u..h..', '#######D########', ' .h..~~..u.. ', ' ..~~..u..~. ', ' .....$..... '],
    legend: { u: M('ooze', 'n', 'n', 'e'), h: M('hush', 'n', 'e', 'e') },
    unlock: [16], reward: { gold: 15 } });

  add({ n: 'Ghoul Cloister', act: 3, goal: { t: 'kill', text: 'Defeat every monster' },
    intro: ['Chained monks walk the cloister.', 'Their chains rattle like bells.'], outro: 'The library key hangs on the last chain.',
    map: ['  ..S.S.S..  ', '  ....S....  ', '#####D#######', '.g..o...o..g.', '.............', '.o..:.^.:..o.', '...g.....g...', '######D######', '  ..m...m..  ', '  ...$.....  '],
    legend: { g: M('ghoul', 'n', 'n', 'e'), m: M('monk', 'n', 'n', 'e') },
    unlock: [17, 18], reward: { gold: 15 } });

  add({ n: 'The Lantern Road', act: 3, goal: { t: 'escape', text: 'All heroes stand on exits (X)' },
    intro: ['An old road lit by dead lamps.', 'Bats hunt anything with light.'], outro: 'You reach the library steps.',
    map: ['S.S...#....b.....', '.S.S..D.o.....o..X', '......#.:::....bXX', '..$...#..b...o..X', '......#o..^......', '......#...a..a...'],
    legend: { b: M('bat', 'n', 'n', 'e'), a: M('archer', 'n', 'n', 'n') },
    unlock: [17], reward: { gold: 15 } });

  add({ n: "Abbot's Library", act: 3, goal: { t: 'loot', n: 3, text: 'Grab all three treasure chests' },
    intro: ['Books swollen with sea water.', 'The Abbot hid his secrets here.'], outro: 'His journal names the drowned crypt.',
    treasure: [{ gold: 20 }, { item: 'i22' }, { gold: 20 }],
    map: ['S.S.S.#.T..m..', '.S....D..o..o.', '..$...#.m....h', '......#..h..T.', '##D###########', '.....o.o.  ', '.m....T..  ', '...h.....  '],
    legend: { m: M('monk', 'n', 'n', 'e'), h: M('hush', 'n', 'n', 'n') },
    unlock: [19], reward: { gold: 15 } });

  add({ n: 'Bilge Kennels', act: 3, goal: { t: 'kill', text: 'Defeat every monster' },
    intro: ['The smugglers bred hounds down here.', 'They smell you already.'], outro: 'The kennels open onto the crypt.',
    map: ['  .S.S.S.  ', ' ...S..... ', '####D######', '.h..~~..h..', '..o....o...', '.h..b...h..', '...~~..b...', '#####D#####', ' .h.....m. ', ' ...$..... '],
    legend: { h: M('hound', 'n', 'n', 'e'), b: M('bandit', 'n', 'n', 'n'), m: M('mimic', 'n', 'n', 'e') },
    unlock: [19], reward: { gold: 15 } });

  add({ n: 'The Drowned Abbot', act: 3, boss: 'abbot', goal: { t: 'boss', text: 'Defeat the Drowned Abbot' },
    intro: ['He sold the abbey to the tide.', 'End his sermon.'], outro: 'The Abbot sinks. The tide falters.',
    map: ['  ..S.S.S..  ', '  ...S.....  ', '######D######', '.~~..m...~~..', '.~...o.o...~.', '..m...B...m..', '.~...^.^...~.', '.~~.......~~.', '...$.....$...'],
    legend: { B: { boss: 'abbot' }, m: M('monk', 'n', 'n', 'e') },
    unlock: [20, 21], reward: { gold: 25, items: ['i23'] } });

  add({ n: 'Tide Steps', act: 4, goal: { t: 'survive', n: 7, text: 'Hold the steps for 7 rounds', limit: 99 },
    intro: ['The tide climbs the abbey steps.', 'Do not give ground.'], outro: 'The water drains away at last.',
    map: ['.t..u..t..', '..~~..~~..', '.u..t...u.', '####D#####', '..o....o..', '.S.S..S.S.', '..........'],
    legend: { t: M('thrall', 'n', 'n', 'e'), u: M('ooze', 'n', 'n', 'n') },
    unlock: [22], reward: { gold: 20 } });

  add({ n: 'Wax Catacombs', act: 4, goal: { t: 'objs', n: 2, text: 'Smash both wax idols (A)' },
    intro: ['Wax idols keep the dead walking.', 'Smash them.'], outro: 'The catacombs fall still.',
    map: ['S.S.S.S#.....', '.......D.w.A.', '..$....#...w.', '#######D#####', ' .w..g..w.. ', ' ...o..A... ', ' .g......w. '],
    legend: { A: { obj: { n: 'Wax Idol', hp: 6, per: 3 } }, w: M('wight', 'n', 'n', 'e'), g: M('ghoul', 'n', 'n', 'n') },
    unlock: [22], reward: { gold: 20 } });

  add({ n: 'Hush Market', act: 4, goal: { t: 'kill', text: 'Defeat every monster' },
    intro: ['A market with no sound at all.', 'The Hush trade in voices.'], outro: 'Two ways up: the belfry or the heart.',
    map: ['S.S.S#.........', '.S...D.h..o..h.', '..$..#.....b...', '.....#.o..h..o.', '#####D#########', ' .b...h...b. ', ' ...o...o... '],
    legend: { h: M('hush', 'n', 'n', 'e'), b: M('bandit', 'n', 'e', 'e') },
    unlock: [23, 24], reward: { gold: 20 } });

  add({ n: 'The Last Belfry', act: 4, goal: { t: 'reach', text: 'Reach the bell rope (X)' },
    intro: ['Ring the last bell to wake the abbey.', 'Climb.'], outro: 'The bell rings. The Unlit hears it.',
    map: ['S.S.S..#..a..X', '.S.....D...a..', '..o..$.#.o..b.', '.......#..b...', '#######D######', ' ..b..^..a... ', ' .a...o...b.. '],
    legend: { a: M('archer', 'n', 'n', 'e'), b: M('bat', 'n', 'n', 'e') },
    unlock: [25], reward: { gold: 20 } });

  add({ n: 'Heart of the Tide', act: 4, goal: { t: 'kill', text: 'Defeat every monster' },
    intro: ['The tide has a heart.', 'It beats under the crypt.'], outro: 'The heart stops. Only the Unlit remains.',
    map: ['  .S.S.S.  ', ' ...S..... ', '####D######', '.t..~~..u..', '..o.....o..', '.u..~~..t..', '#####D#####', ' .t..g..u. ', ' ...~~.... '],
    legend: { t: M('thrall', 'n', 'n', 'e'), u: M('ooze', 'n', 'n', 'n'), g: M('ogre', 'n', 'e', 'e') },
    unlock: [25], reward: { gold: 20 } });

  add({ n: 'The Unlit', act: 4, boss: 'unlit', goal: { t: 'boss', text: 'Destroy the Unlit' },
    intro: ['The dark that ate the abbey.', 'Every candle you carry is a weapon.'], outro: 'Light returns to the Wickdeep.',
    map: ['   ..S.S..   ', '  ..S...S..  ', '  ...o.o...  ', '######D######', '.h.........h.', '..o..^.^..o..', '.....:B:.....', '..o.......o..', '.h....$....h.'],
    legend: { B: { boss: 'unlit' }, h: M('hush', 'n', 'n', 'e') },
    unlock: [], reward: { gold: 50 } });

  D.SCEN = {}; S.forEach(function (s) { D.SCEN[s.id] = s; });
  D.SCEN_LIST = S;
})(typeof window !== 'undefined' ? window : globalThis);
