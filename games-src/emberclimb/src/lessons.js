// Emberclimb scenario tutorials (GXST, shell/gx-scenario-tutor.js, docs shell/GXST.md, spec orch/TUTORIAL-SPEC.md). They REPLACE the old dimming
// walkthrough: UI.tutStart now opens the lesson picker. Each lesson stacks a tiny real fight (or the campfire) with ONE goal; the player plays
// real cards on the real board and learns the rule from the consequence. Test: node tools/lessons-test.js (402x874 and 1366x768).
//
// RULE -> SCENARIO (every core rule of rules-notes.md / RULES-CHECKLIST.md that a first climb needs):
//   energy 3 a turn, a card costs energy, play a card on a foe, kill ........... strike
//   Block soaks damage point for point; End turn; Block resets each turn ....... block
//   enemy intent shows the next move and its size .............................. intent
//   Vulnerable doubles the next hit; order of cards matters ..................... vuln
//   Weak shrinks hits; Exhaust cards leave the fight; 0-cost cards ............. weak
//   potions; Poison ignores Block, ticks at end of turn, never wears off ........ poison
//   Strength (a Power) adds to every hit for the whole fight .................... strength
//   hit-all attacks; picking a target among several foes ........................ sweep
//   campfire: rest heals or smith upgrades (map rooms, reward cards: game) ..... camp
//   a short real fight start to finish (draw 5, discard pile, reward card) ...... game
// NOT taught here (listed in the report as gaps): shop, events, elite and boss rooms, three acts, hero-only rules (Shivs, Orbs, stances, Scry, two heroes).
(function () {
  if (!window.GXST || !window.EC || !EC.E) return;
  var E = EC.E, G = function () { return E.G(); }, L = { n: 0, hp0: 0, on: false };
  var $ = function (s) { return document.querySelector(s); };
  var hero = function () { return G().hs[0]; };
  var foes = function () { return G().b ? G().b.en : []; };
  var alive = function () { return foes().filter(function (e) { return !e.dead; }); };
  var inFight = function () { return G().scr === 'battle' && !!G().b; };
  var turn = function () { return inFight() ? G().b.turn : 99; };
  var cardIdx = function (id) { var h = hero().hand; for (var i = 0; i < h.length; i++) if (h[i].id === id) return i; return -1; };
  var cardEl = function (id) { return function () { var i = cardIdx(id); return i < 0 ? null : $('.hand .card[data-c="' + i + '"]'); }; };
  var lost = function () { return hero().mhp - hero().hp; };
  // count real card plays / potions (par)
  var op = E.performMove; E.performMove = function (m) { var r = op.apply(this, arguments); if (r && L.on && m && (m.t === 'play' || m.t === 'pot')) L.n++; return r; };
  // stage a fight: foes = [{id, hp, blk, atk}], hand = card ids, extra = {pots, draw}
  function stage(sp) {
    try { var sk = document.querySelector('[data-gxt-skip]'); if (sk) sk.click(); GX.close(); if (window.GXC) GXC.close(); } catch (e) { }
    window.EC_NOSAVE = 1; UI.camp = null; UI.ov = null; UI.sel = -1; window.ANIM = false; try { UI.coach.on = false; UI.coach.q = []; UI.say(''); } catch (e) { }
    E.newGame({ heroes: ['w'], seed: sp.seed || 7, floors: 6, hpPct: 100 });
    E.performMove({ t: 'go', n: 0 });
    var g = G(), e0 = g.b.en[0], mk = E.mk, h = g.hs[0];
    g.b.en = (sp.foes || []).map(function (f, i) {
      var e = JSON.parse(JSON.stringify(e0)); e.id = f.id || 'ooze-drop'; e.hp = e.mhp = f.hp; e.blk = f.blk || 0; e.st = {}; e.i = 0; e.dead = 0; e.row = 0;
      e.intent = { atk: f.atk == null ? 8 : f.atk, tg: 0 }; return e; });
    h.hand = sp.hand.map(function (id) { return mk(id); }); h.en = 3; h.blk = 0; h.hp = h.mhp;
    h.draw = ['w-strike', 'w-defend', 'w-strike', 'w-defend', 'w-strike', 'w-defend'].map(function (id) { return mk(id); }); h.disc = [];
    g.pots = (sp.pots || []).slice(); L.n = 0; L.on = true; L.hp0 = h.hp; UI.mode = 'game'; UI.render();
  }
  var one = function (hp, atk, blk) { return [{ id: 'ooze-drop', hp: hp, atk: atk, blk: blk }]; };
  // the first round is over and the hero is back on turn 2
  var round2 = function () { return inFight() && turn() >= 2; };
  var ended = function () { return !inFight() || turn() >= 2; };
  var lessons = [
    { id: 'strike', title: 'Strike', rule: 'You have 3 energy each turn. A card costs energy; attacks hurt the foe you tap.', par: 3,
      goal: 'Defeat the Ooze Drop this turn.',
      setup: function () { stage({ foes: one(24, 8), hand: ['w-strike', 'w-defend', 'w-strike', 'w-defend', 'w-strike'] }); },
      success: function () { return !alive().length; },
      fail: function () { return alive().length && (hero().en === 0 || ended()) ? 'Out of energy and it still stands. You get 3 energy a turn, and Plate Guard spends one without hurting it.' : false; },
      hints: ['How much damage does each Cinder Strike do, and how many can 3 energy pay for?', { say: 'Three Strikes: 8 + 8 + 8 = 24.', target: cardEl('w-strike') }],
      debrief: 'Three Strikes cost 3 energy and deal 24.' },
    { id: 'block', title: 'Block', rule: 'Block soaks damage point for point. Play it before you end the turn.', par: 1,
      goal: 'End your turn without losing any HP.',
      setup: function () { stage({ foes: one(80, 8), hand: ['w-strike', 'w-defend', 'w-strike', 'w-strike', 'w-defend'] }); },
      success: function () { return round2() && lost() === 0; },
      fail: function () { return round2() && lost() > 0 ? 'It hit you for ' + lost() + '. Block must be on you before the turn ends: Plate Guard gives 8.' : false; },
      hints: ['The foe is about to bite. Look at the sword number over it.', { say: 'Play Plate Guard, then End turn.', target: cardEl('w-defend') }],
      debrief: 'Plate Guard took the whole bite: 8 Block against 8 damage.' },
    { id: 'intent', title: 'Read the intent', rule: 'The sign over a foe shows its next move and how big it is.', par: 3,
      goal: 'The foe plans a huge hit. Take none of it.',
      setup: function () { stage({ foes: one(80, 24), hand: ['w-defend', 'w-strike', 'w-defend', 'w-strike', 'w-defend'] }); },
      success: function () { return round2() && lost() === 0; },
      fail: function () { return round2() && lost() > 0 ? 'It hit for ' + lost() + '. The sign said 24; each Plate Guard blocks 8, so you needed three.' : false; },
      hints: ['Read the number over the foe, then count your Block.', { say: '24 damage needs three Plate Guards (3 x 8).', target: cardEl('w-defend') }],
      debrief: 'Read the sign first: 24 incoming, 3 x 8 Block.' },
    { id: 'vuln', title: 'Vulnerable', rule: 'A Vulnerable foe takes double damage from hits. Apply it first.', par: 2,
      goal: 'Defeat the Ooze Drop (32 HP) this turn.',
      setup: function () { stage({ foes: one(32, 8), hand: ['w-strike', 'w-strike', 'w-hammer', 'w-strike', 'w-defend'] }); },
      success: function () { return !alive().length; },
      fail: function () { return alive().length && (hero().en === 0 || ended()) ? 'Not enough damage. Vulnerable doubles later hits, so Anvil Blow has to land BEFORE the Strike.' : false; },
      hints: ['Three Strikes only make 24. What card makes hits count double?', { say: 'Anvil Blow (16) first, then Strike hits for 16.', target: cardEl('w-hammer') }],
      debrief: 'Anvil Blow 16, then a doubled Strike 16: 32.' },
    { id: 'weak', title: 'Weak', rule: 'A Weak foe hits 8 less per hit. Exhaust cards leave the fight once played.', par: 1,
      goal: 'End your turn without losing HP. You have no Block card.',
      setup: function () { stage({ foes: one(80, 8), hand: ['w-strike', 'w-roar', 'w-strike', 'w-strike', 'w-strike'] }); },
      success: function () { return round2() && lost() === 0; },
      fail: function () { return round2() && lost() > 0 ? 'It hit for ' + lost() + '. Weak makes a foe hit 8 less: Intimidating Roar costs 0 and weakens it.' : false; },
      hints: ['Nothing here blocks. What else can blunt an attack?', { say: 'Play Intimidating Roar (cost 0), then End turn.', target: cardEl('w-roar') }],
      debrief: 'Weak took 8 off an 8 bite. Roar is exhausted: gone for this fight.' },
    { id: 'poison', title: 'Poison', rule: 'Poison hurts at the end of your turn, ignores Block and never wears off.', par: 1,
      goal: 'Defeat the shielded foe by the end of your turn.',
      setup: function () { stage({ foes: one(16, 8, 80), hand: ['w-strike', 'w-strike', 'w-defend', 'w-strike', 'w-defend'], pots: ['venom-vial'] }); },
      success: function () { return !alive().length; },
      fail: function () { return alive().length && ended() ? 'It lives: 80 Block shrugs off Strikes. Poison ignores Block: drink the Venom Vial, then End turn.' : false; },
      hints: ['Its Block is huge. Is there something Block cannot stop?', { say: 'Drink the Venom Vial (potion bar), then End turn.', target: '.pots .pot.full' }],
      debrief: 'Poison ignores Block: 2 tokens x 8 = 16 at turn end.' },
    { id: 'strength', title: 'Strength', rule: 'Strength adds damage to every hit, and a Power card lasts the whole fight.', par: 3,
      goal: 'Defeat the Ooze Drop (32 HP) this turn.',
      setup: function () { stage({ foes: one(32, 8), hand: ['w-strike', 'w-kindle', 'w-strike', 'w-strike', 'w-defend'] }); },
      success: function () { return !alive().length; },
      fail: function () { return alive().length && (hero().en === 0 || ended()) ? 'Three plain Strikes make only 24. Kindle gives +8 to every hit, so play it first.' : false; },
      hints: ['Three Strikes make 24. What makes each one bigger?', { say: 'Kindle (cost 1), then two Strikes of 16.', target: cardEl('w-kindle') }],
      debrief: 'Kindle: +8 on each hit. Two Strikes of 16 = 32.' },
    { id: 'sweep', title: 'Hit them all', rule: 'Most cards hit one foe you tap. A hit-all card strikes every foe.', par: 1,
      goal: 'Defeat all three foes this turn.',
      setup: function () { stage({ foes: [{ id: 'ooze-drop', hp: 16 }, { id: 'ooze-drop', hp: 16 }, { id: 'ooze-drop', hp: 16 }], hand: ['w-strike', 'w-strike', 'w-cleave', 'w-defend', 'w-defend'] }); },
      success: function () { return !alive().length; },
      fail: function () { return alive().length && (hero().en === 0 || ended()) ? 'Strikes hit one foe, and each has 16 HP. Sweeping Arc hits all three for 16.' : false; },
      hints: ['Three foes at 16 HP, and you can afford only 3 cards.', { say: 'Sweeping Arc hits every foe for 16.', target: cardEl('w-cleave') }],
      debrief: 'One Sweeping Arc: 16 to all three.' },
    { id: 'camp', title: 'Campfire', rule: 'At a campfire you either rest to heal, or smith to upgrade a card.', par: 1,
      goal: 'You are hurt. Restore your health at the fire.',
      setup: function () {
        try { var sk = document.querySelector('[data-gxt-skip]'); if (sk) sk.click(); GX.close(); } catch (e) { }
        window.EC_NOSAVE = 1; UI.camp = null; UI.ov = null; UI.sel = -1; E.newGame({ heroes: ['w'], seed: 9 }); E.debug.rest(); L.n = 0; L.on = true; L.hp0 = hero().hp; UI.mode = 'game'; UI.render(); },
      success: function () { return hero().hp > L.hp0; },
      fail: function () { return G().scr !== 'rest' && hero().hp <= L.hp0 ? 'Smithing upgrades a card but heals nothing. Choose Rest to get 24 HP back.' : false; },
      hints: ['Two choices on the fire. Which one fixes low HP?', { say: 'Tap Rest: heal.', target: '#rest-heal' }],
      debrief: 'Rest healed 24 HP. Smith would have upgraded a card instead.' },
    { id: 'game', title: 'A short climb', rule: 'Draw 5 each turn, spend 3 energy, watch the intent, block when it bites.', par: 99,
      goal: 'Win this real fight.',
      setup: function () {
        try { var sk = document.querySelector('[data-gxt-skip]'); if (sk) sk.click(); GX.close(); } catch (e) { }
        window.EC_NOSAVE = 1; UI.camp = null; UI.ov = null; UI.sel = -1; try { UI.coach.on = false; } catch (e) { }
        E.newGame({ heroes: ['w'], seed: 21, floors: 6, hpPct: 100 }); E.performMove({ t: 'go', n: 0 }); L.n = 0; L.on = true; L.hp0 = hero().hp; UI.mode = 'game'; UI.render(); },
      success: function () { return G().scr !== 'battle' && G().scr !== 'over' && !hero().dead; },
      fail: function () { return G().scr === 'over' || hero().hp <= 0 ? 'You fell. Block when the sign shows a hit, strike when it is safe.' : false; },
      hints: ['Tap a card to pick it, tap it again to play it.', { say: 'Block when the foe shows a hit; otherwise Strike.', target: cardEl('w-defend') }],
      debrief: 'Fight won: that is the whole loop, again and again up the tower.' }
  ];
  lessons.forEach(function (s) { s.moves = function () { return L.n; }; });
  var go = function () {
    if (!(window.UI && UI.render && window.GX && window.GXH)) { setTimeout(go, 200); return; }
    // the old dimming walkthrough is retired: every entry point (title, menu, story Guide) opens the lessons
    UI.tutStart = function () { if (UI.camp && UI.campExit) UI.campExit(); try { GX.close(); } catch (e) { } try { GXT.markDone('emberclimb'); } catch (e) { } GXST.picker(); };
    GXST.init({ game: 'emberclimb', scenarios: lessons, keepClear: ['.hand', '.en', '#end', '.pots', '.ec-potpop', '.reward'], settled: function () { var g = G(); return !UI.busy && (g.scr !== 'battle' || (g.b && g.b.ph === 'p')); } });
    window.addEventListener('gxst', function (ev) {
      var t = ev.detail && ev.detail.type;
      if (t === 'close' && L.on && UI.mode === 'game') { L.on = false; window.EC_NOSAVE = 0; UI.mode = 'title'; UI.sub = ''; UI.ov = null; try { UI.render(); } catch (e) { } }
    });
    if (/[?&]lessons=1/.test(location.search)) GXST.picker();
  };
  setTimeout(go, 300);
})();
