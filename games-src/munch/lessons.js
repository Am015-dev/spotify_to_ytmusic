// Doorkick Dungeon lessons: ten short scenario games on the shared engine (shell/gx-scenario-tutor.js, docs shell/GXST.md). Replaces the old staged tutorial.
// Each lesson stacks a tiny real position (the game's own engine and board), gives ONE goal, scripts the rivals, judges the real state.
// RULE -> LESSON TABLE (rules drawer rules-html.js, rules-notes.md, engine.js):
//   goal: level 10, the last level only from a monster ... game        | start: level 1, hand of cards ........................ gear, game
//   items: slots, two hands, ONE Big item, strength = level + items ... gear
//   sell items worth 1,000 gold for a level ............................. sell
//   kick the door: a monster is a fight ................................. kick, game
//   strength: higher wins, ties go to the monster; one-shots add ........ kick
//   look for trouble (a monster from your hand) or loot the room ........ trouble
//   ask one player for help, who adds strength .......................... help
//   run away: roll 5 or 6, else Bad Stuff (even death) .................. run
//   curses can be played on anyone ...................................... curse
//   charity: hand limit 5, extras go to the lowest level ................ charity
//   classes: the Warrior wins ties ...................................... warrior
//   NOT a lesson (rules drawer and the lightbulb only): other races and classes (Elf, Dwarf, Halfling, Wizard, Thief, Cleric), monster boosts and
//   wandering monsters, death and looting, level-up cards, items you cannot use, the Porter, bribes, the special monster cards.
(function () {
  if (!window.GXST) return;
  var L = { on: 0, n: 0, run: 0, live: 0, startN: 0 };   // n = my moves in this lesson, run = scripted next d6 for my escape roll
  var ready = function () { return typeof G !== 'undefined' && typeof newGame === 'function' && typeof render === 'function' && typeof startCombat === 'function' && typeof UI !== 'undefined' && typeof BF !== 'undefined'; };
  var until = function (f, ms) { var t0 = Date.now(); return new Promise(function (r) { (function w() { var ok = false; try { ok = f(); } catch (e) { } if (ok || Date.now() - t0 > ms) r(ok); else setTimeout(w, 50); })(); }); };
  var vis = function (e) { if (!e || e.closest('[hidden]')) return false; var r = e.getBoundingClientRect(); return r.width > 3 && r.height > 3; };
  var q1 = function () { var a = arguments; return function () { for (var i = 0; i < a.length; i++) { var l = document.querySelectorAll(a[i]); for (var j = 0; j < l.length; j++) if (vis(l[j])) return l[j]; } return null; }; };
  var me = function () { return P(0); };
  var did = function () { return L.n > 0; };
  // ---- card helpers (the pattern of rules-test.js): take a card by key from the decks or a hand
  function inst(k) {
    var ids = Object.keys(G.C).map(Number).filter(function (i) { return G.C[i] === k; }), z, i, j;
    for (i = 0; i < ids.length; i++) for (j = 0; j < 4; j++) { z = ['door', 'tr', 'dd', 'td'][j]; var x = G[z].indexOf(ids[i]); if (x >= 0) { G[z].splice(x, 1); return ids[i]; } }
    for (i = 0; i < ids.length; i++) for (j = 0; j < G.pl.length; j++) { var h = G.pl[j].hand.indexOf(ids[i]); if (h >= 0) { G.pl[j].hand.splice(h, 1); return ids[i]; } }
    throw new Error('no free ' + k);
  }
  var give = function (s, k) { var id = inst(k); P(s).hand.push(id); return id; };
  var wear = function (s, k) { var id = inst(k); P(s).eq.push({ id: id, on: true }); return id; };
  var onTop = function (k) { var id = inst(k); G.door.push(id); return id; };   // the next door kicked
  var idOf = function (k) { return Object.keys(G.C).map(Number).find(function (i) { return G.C[i] === k; }); };
  var handId = function (k) { return P(0).hand.filter(function (i) { return G.C[i] === k; })[0]; };
  var cardEl = function (k) { return function () { var id = handId(k); if (id == null) id = (P(0).eq.filter(function (e) { return G.C[e.id] === k; })[0] || {}).id; return id == null ? null : q1('.mine .hand [data-card="' + id + '"]', '.mine .gear [data-card="' + id + '"]')(); }; };
  // ---- the position: a fresh solo game (fixed seed), then every hand and the top of the door set by hand; every card id is still used once
  function stage(sp) {
    var m = document.getElementById('modal'); if (m) { m.hidden = true; m.innerHTML = ''; }
    try { GX.close(); } catch (e) { } try { GXH.setEnabled(false); GXH.hide(); } catch (e) { }
    window.TUTG = true;   // bf.js: no 'How to win' popup over a lesson
    L.on = 1; L.n = 0; L.run = sp.run || 0; L.live = sp.live ? 1 : 0;
    clearTimeout(window.aiTimer); window.aiTimer = null;
    BF.pick = null; BF.ask = null; BF.kicking = false; UI.pass = null; UI.lastSeat = -1; UI.menu = null; UI.zoom = null; UI.sell = null; UI.cmp = null;
    var lvl0 = UI.lvl, nm0 = UI.names; UI.lvl = 'normal'; UI.names = null; setSeed(sp.seed || 51);
    try { newGame('solo', 3); } finally { UI.lvl = lvl0; UI.names = nm0; }
    G.les = 1; UI.goalGid = G.gid; G.learn = false; UI.hints = false; UI.info = false; UI.speed = Math.max(2, UI.speed || 1); UI.pause = false;
    G.pl.forEach(function (p) { p.hand.forEach(function (id) { (cd(id).d === 'door' ? G.door : G.tr).unshift(id); }); p.hand = []; p.eq.forEach(function (e) { (cd(e.id).d === 'door' ? G.door : G.tr).unshift(e.id); }); p.eq = []; });
    G.phase = 'main'; G.active = 0; G.setupI = 99; G.win = null; G.q = null; G.log = []; G.ln = 0; G.kicked = null; G.fought = false; G.cb = null; G.out = null;
    sp.go(); G.rng = sp.rng || G.rng; G.pl.forEach(function (p) { p.nm = ['Pip', 'Morwen', 'Grub'][p.i]; });
    lg(-1, 'A lesson room opens. Nothing here is saved.');
    refresh();
    return until(function () { return !BF.kicking && !document.getElementById('bfrev') && !UI.busy; }, 4000).then(function () { return new Promise(function (r) { setTimeout(r, 300); }); });
  }
  // the next d6 shows v (rnd() adds 0x6D2B79F5 to G.rng first)
  function rollTo(v) { for (var r = 1; r < 5000; r++) { var t = r + 0x6D2B79F5; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); if (1 + Math.floor(((t ^ t >>> 14) >>> 0) / 4294967296 * 6) === v) { G.rng = r; return true; } } return false; }
  var lvl = function (s, n) { P(s).lvl = n; };
  var lost = function () { return !!G.out && !G.out.won; };
  // ---- the lessons
  var lessons = [
    { id: 'gear', title: 'Gear up', rule: 'Items add to your level: that is your strength. You wear one item per slot, two hands of weapons and ONE Big item.', par: 5,
      goal: 'Reach strength 7. Play the right items on your hero.',
      setup: function () { return stage({ go: function () { lvl(0, 1); ['stompy', 'sneakers', 'bucket', 'buzzsaw', 'boulderitem'].forEach(function (k) { give(0, k); }); } }); },
      success: function () { return did() && pStr(me()) >= 7; },
      fail: function () { return did() && !me().hand.length && pStr(me()) < 7 ? 'Strength ' + pStr(me()) + '. A slot holds one item and you carry one Big item: the best of each wins.' : false; },
      hints: ['Two cards want the same slot, and two are Big. You can wear only one of each.', { say: 'Wear Stompy, the Bucket and the Buzzsaw. Skip Sneakers and the Boulder.', target: cardEl('stompy') }],
      debrief: 'Level 1 plus 6 from items: strength 7.' },
    { id: 'sell', title: 'Cash in', rule: 'On your turn, outside a fight, sell items worth 1,000 gold for one level. No change is given.', par: 3,
      goal: 'Sell items for a level.',
      setup: function () { return stage({ go: function () { lvl(0, 1); ['antler', 'kneepads', 'swash', 'pole'].forEach(function (k) { give(0, k); }); onTop('imp'); } }); },
      success: function () { return did() && me().lvl >= 2; },
      fail: function () { return did() && G.phase !== 'main' && me().lvl < 2 ? 'You moved on without selling. Items worth 1,000 gold buy one level.' : false; },
      hints: ['Tap Sell, pick cards that add up to 1,000 gold or more.', { say: 'Antler and Kneepads are worth 600 each: 1,200 gold.', target: cardEl('antler') }],
      debrief: '1,200 gold: one level. The extra 200 is lost, so pick well.' },
    { id: 'kick', title: 'Kick the door', rule: 'Kick open the door: a monster means a fight. Higher strength wins; a tie goes to the monster. A one-shot potion adds to your side.', par: 3,
      goal: 'Kick open the door and beat the monster.',
      setup: function () { return stage({ run: -3, go: function () { lvl(0, 2); wear(0, 'stompy'); give(0, 'cizzy'); give(0, 'antler'); onTop('slugs'); } }); },
      success: function () { return !!G.out && G.out.won && G.out.who === 0; },
      fail: function () { return lost() && G.out.who === 0 ? 'You tied the monster and ties go to the monster, so you had to run. Play the potion first.' : false; },
      hints: ['You and the monster are equal. A tie is a loss.', { say: 'Tap the potion, then your side of the fight, then Fight.', target: cardEl('cizzy') }],
      debrief: 'Strength above the monster: you win a level and its treasure.' },
    { id: 'run', title: 'Run away', rule: 'When you cannot win, run: roll a die for each monster, 5 or 6 escapes. Fail and its Bad Stuff hits you.', par: 1,
      goal: 'The monster is too strong. Get away.',
      setup: function () { return stage({ run: 1, go: function () { lvl(0, 3); P(0).race.push(inst('elf')); wear(0, 'stompy'); give(0, 'antler'); G.active = 0; startCombat(0, inst('troll'), 'kick'); rollTo(1); } }); },
      success: function () { return !G.cb && !!G.out && !G.out.won && !me().dead && !!G.lastRoll && G.lastRoll.v >= 4; },
      fail: function () { return !G.cb && lost() && (me().dead || !G.lastRoll || G.lastRoll.v < 4 || did()) && did() ? 'The monster caught you and its Bad Stuff hit. Run when you cannot win.' : false; },
      hints: ['Your strength is far below the monster.', { say: 'Tap Run. An Elf gets +1 on the roll.', target: q1('.fbtns .runb') }],
      debrief: 'You rolled well and got away. Better a lost turn than a lost level.' },
    { id: 'help', title: 'Ask for help', rule: 'You may ask one player to help. Their strength adds to yours; you gain the level, they take the treasure you promised.', par: 3,
      goal: 'Win this fight with a helper.',
      setup: function () { return stage({ run: -3, go: function () { lvl(0, 2); lvl(1, 6); lvl(2, 3); P(1).race.push(inst('elf')); wear(0, 'stompy'); give(0, 'antler'); G.active = 0; startCombat(0, inst('lizards'), 'kick'); } }); },
      success: function () { return !!G.out && G.out.won && G.out.who === 0 && G.out.help === 1; },
      fail: function () { return lost() && G.out.who === 0 ? 'You were too weak alone and had to run. Ask a stronger hero to join you.' : false; },
      hints: ['Morwen is a strong Elf and she helps for free.', { say: 'Tap Help, then Morwen, then Fight.', target: q1('.fbtns .helpb') }],
      debrief: 'Your strength plus hers beat the monster.' },
    { id: 'trouble', title: 'Look for trouble', rule: 'If the door shows no monster, you may fight one from your hand (look for trouble) or loot the room for a card.', par: 3,
      goal: 'No monster behind the door. Win a fight anyway.',
      setup: function () { return stage({ go: function () { lvl(0, 4); wear(0, 'stompy'); give(0, 'toads'); give(0, 'antler'); onTop('wizard'); performMove({ act: 'kick' }, 0); } }); },
      success: function () { return !!G.out && G.out.won && G.out.who === 0; },
      fail: function () { return did() && !G.cb && G.phase !== 'after' && !(G.out && G.out.won) ? 'You looted the room and no fight came. Toads were in your hand: a free level.' : false; },
      hints: ['You hold a small monster. A free fight is a free level.', { say: 'Tap Toads, then the door, then Fight.', target: cardEl('toads') }],
      debrief: 'You chose your own fight: a safe monster, a safe level.' },
    { id: 'curse', title: 'Curse a rival', rule: 'Curses can be played on anyone. Play Rotten Luck on a rival to take away a level.', par: 1,
      goal: 'Knock Morwen down a level.',
      setup: function () { return stage({ go: function () { lvl(0, 3); lvl(1, 5); lvl(2, 2); give(0, 'hexlvl'); give(0, 'antler'); onTop('imp'); } }); },
      success: function () { return did() && P(1).lvl <= 4; },
      fail: function () { return did() && G.phase !== 'main' && P(1).lvl > 4 ? 'You moved on and Morwen kept her level. Play the curse before you kick.' : false; },
      hints: ['Morwen leads the table. You hold a curse.', { say: 'Tap Rotten Luck, then tap Morwen.', target: cardEl('hexlvl') }],
      debrief: 'Morwen lost a level. Anyone can curse anyone.' },
    { id: 'charity', title: 'Charity', rule: 'You may keep 5 cards at the end of your turn. Give the extras to the lowest-level hero.', par: 3,
      goal: 'End your turn with 5 cards. Keep both level cards.',
      setup: function () { return stage({ go: function () { lvl(0, 5); lvl(1, 2); lvl(2, 3); ['l1', 'l2', 'pole', 'gooey', 'rascal', 'kneecaps', 'sousaphone'].forEach(function (k) { give(0, k); }); G.phase = 'post'; G.fought = true; } }); },
      success: function () { return did() && G.active !== 0 && P(0).hand.filter(function (i) { return /^l[12]$/.test(G.C[i]); }).length === 2; },
      fail: function () { return did() && G.phase !== 'post' && G.phase !== 'charity' && P(0).hand.filter(function (i) { return /^l[12]$/.test(G.C[i]); }).length < 2 ? 'You gave away a level card. Give the cards you cannot use.' : false; },
      hints: ['You hold 7 cards. Two of them are worth a level each.', { say: 'Tap End turn, then give Pole and Gooey Vest to Morwen.', target: q1('#prompt [data-mv*="end"]') }],
      debrief: 'Five cards left, and the lowest hero got the spare two.' },
    { id: 'warrior', title: 'Warrior power', rule: 'Races and classes give powers. A Warrior wins ties; the other classes, and the Elf, Dwarf and Halfling, have their own.', par: 1,
      goal: 'Win this tied fight without playing a card.',
      setup: function () { return stage({ run: 1, go: function () { lvl(0, 2); P(0).cls.push(inst('warrior')); wear(0, 'stompy'); give(0, 'cizzy'); G.active = 0; startCombat(0, inst('slugs'), 'kick'); } }); },
      success: function () { return !!G.out && G.out.won && G.out.who === 0 && !!handId('cizzy'); },
      fail: function () { return did() && !handId('cizzy') ? 'You spent the potion. A Warrior wins ties on class alone, so just fight.' : false; },
      hints: ['Count both sides. Your class settles a tie.', { say: 'Tap Fight. Keep the potion.', target: q1('.fbtns .fightb') }],
      debrief: 'Tied at 4 and the Warrior wins. The potion stays for later.' },
    { id: 'game', title: 'Short game', rule: 'First to level 10 wins, and the last level only comes from beating a monster.',
      goal: 'Reach level 10 before the rivals do.',
      setup: function () { return stage({ live: 1, seed: 77, go: function () { lvl(0, 8); lvl(1, 2); lvl(2, 2); wear(0, 'stompy'); wear(0, 'bucket'); wear(0, 'swash'); wear(0, 'blazing'); give(0, 'fizz'); give(0, 'cizzy'); G.setupI = 99; } }); },
      success: function () { return !!G.winner && G.winner === 'P1'; },
      fail: function () { return G.winner && G.winner !== 'P1' ? 'A rival reached level 10 first. Kick doors, beat monsters, keep your potions.' : false; },
      hints: ['Kick the door. Fight what you can beat, run from what you cannot.', 'You need a monster kill to reach level 10: level cards stop at 9.'],
      debrief: 'Level 10 from a monster kill: you won the dungeon.' }
  ];
  lessons.forEach(function (s) { s.moves = function () { return L.n; }; });
  // ---- hooks while a lesson runs: scripted rivals and dice, nothing saved over the player's real game
  function hook() {
    var of = refresh; refresh = function () {
      if (L.on && G) { if (G.active !== 0 && !L.live && !G.winner) UI.pause = true; if (!G.winner) autoPass(); render(); schedule(); sounds(); return; }
      return of.apply(this, arguments);
    };
    var oa = aiMove; aiMove = function (s) {
      if (L.on && G && G.les && !L.live && s !== 0 && G.active === 0) {
        var vm = validMoves(s), by = function (a) { return vm.filter(function (m) { return m.act === a; })[0]; };
        if (G.q) { if (G.q.kind === 'help') return { act: 'opt', opt: s === 1 ? 'yes' : 'no' }; return null; }
        if (G.phase === 'window') return by('pass');
        if (G.phase === 'combat' && G.cb.stage === 'others') return by('pass');
      }
      return oa.apply(this, arguments);
    };
    var ou = uiAct; uiAct = function (m) {
      if (L.on && G && G.les) { L.n++; if (m && m.act === 'run' && L.run) rollTo(L.run + 4); }
      return ou.apply(this, arguments);
    };
    addEventListener('gxst', function (e) {
      if (e.detail.type === 'close' && L.on) { L.on = 0; window.TUTG = false; UI.pause = false; clearTimeout(window.aiTimer); window.aiTimer = null; if (G && G.les) { G = null; UI.info = true; BF.pick = null; BF.ask = null; try { GXH.hide(); } catch (x) { } render(); } }
    });
    // the title screen and the menu list Lessons (ui.js asks tutBtn for a button); the top-bar button sits under the title card on a phone
    window.tutBtn = function (cls) { return G && G.mode === 'net' && !G.winner ? '' : '<button class="' + cls + '" type="button" data-lessons="1">Lessons</button>'; };
    document.addEventListener('click', function (e) { var b = e.target && e.target.closest && e.target.closest('[data-lessons]'); if (b) { e.stopPropagation(); try { GX.close(); } catch (x) { } GXST.picker(); } }, true);
    window.DKL = { L: L, stage: stage, give: give, inst: inst };
  }
  var go = function () {
    if (!ready() || typeof refresh !== 'function' || typeof uiAct !== 'function' || typeof aiMove !== 'function') { setTimeout(go, 200); return; }
    hook();
    GXST.init({ game: 'doorkick-dungeon', scenarios: lessons,
      keepClear: ['.gx-bar', '.hand', '.mine .top', '.mine .gear', '#prompt', '.fbtns', '.opps', '#phopps'],
      settled: function () { return !!G && G.les && !BF.kicking && !document.getElementById('bfrev') && !UI.busy && UI.pass == null && (!!G.winner || sideToAct() === 0 || G.active !== 0); } });
  };
  setTimeout(go, 300);
})();
