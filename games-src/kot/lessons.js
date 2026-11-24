// Crown City Smash lessons: ten short scenario games on the shared engine (shell/gx-scenario-tutor.js, docs shell/GXST.md).
// Each lesson sets a tiny real position on the real board (the game's own engine), gives ONE goal, scripts the dice and the rivals, judges the real state.
// RULE -> LESSON TABLE (rules-notes.md, tutor.js TUT_RULES, the rules drawer):
//   keep dice, three throws, three of a kind, a pair scores nothing ........ keep
//   extra matching die +1, energy dice, empty Downtown: move in +1 ......... enter
//   outside: claws hit the monster in Downtown ............................. claws
//   in Downtown: claws hit every rival ..................................... city
//   hearts heal outside Downtown ........................................... heal
//   spend energy on power cards: permanent vs one-shot ..................... buy
//   sweep the cards for 2 energy ........................................... sweep
//   stay or yield after a hit; Downtown pays +2 stars at turn start ........ yield
//   20 stars win at the END of your turn ................................... win20
//   a short real game: first to 8 stars, last standing ..................... game
//   NOT a lesson (rules drawer only): Harbor (5-6 monsters), evolutions, Brainjack, curses, expansions, each card's own text.
(function () {
  if (!window.GXST) return;
  var L = { on: 0, n: 0, res: 0, t0: 0, mine: [], riv: [], re: [], feed: 0, frame: null };
  var ready = function () { return typeof G !== 'undefined' && typeof newGame === 'function' && typeof render === 'function' && typeof UI !== 'undefined' && typeof resolve === 'function' && typeof nextTurn === 'function' && typeof startRoll === 'function'; };
  var M = function () { return G.pl.filter(function (p) { return p.human; })[0]; };
  var R = function () { return G.pl.filter(function (p) { return !p.human; }); };
  var nm = function (p) { return mname(p); };
  var until = function (f, ms) { var t0 = Date.now(); return new Promise(function (r) { (function w() { var ok = false; try { ok = f(); } catch (e) { } if (ok || Date.now() - t0 > ms) r(ok); else setTimeout(w, 50); })(); }); };
  var q = function (s) { return function () { var e = document.querySelector(s); if (!e) return null; var r = e.getBoundingClientRect(); return r.width ? e : null; }; };
  var die = function (k) { return q('#dice .die[data-die="' + k + '"]'); };
  var SMASH = q('#pacts [data-act="resolve"]'), ROLL = q('#pacts [data-act="reroll"]'), END = q('#pacts [data-act="end"]'), SWEEP = q('#pacts [data-act="sweep"]');
  var opt = function (o) { return q('#choice [data-opt="' + o + '"]'); };
  var shop = function (k) { return function () { return q('#pshop [data-shop="' + k + '"]')() || q('#buymini [data-card="' + k + '"]')(); }; };
  var keepers = function (p) { return p.cards.filter(function (c) { return CARDS[base(c)].t === 'K'; }).length; };

  // ---- the position: a fresh solo table (fixed seed), then every number set by hand
  function stack(sp) {
    try { GX.close(); } catch (e) { } try { GXH.setEnabled(false); GXH.hide(); } catch (e) { }
    L.on = 1; L.n = 0; L.res = 0;
    L.mine = (sp.mine || []).map(function (f) { return f.slice(); }); L.riv = (sp.riv || []).map(function (f) { return f.slice(); }); L.re = (sp.re || []).map(function (f) { return f.slice(); });
    var sv = { lvl: UI.lvl, xp: UI.xp, evo: UI.evo, ex: UI.ex, mon: UI.mon, n: UI.n };
    UI.lvl = 'easy'; UI.xp = 'base'; UI.evo = false; UI.ex = {}; UI.mon = 0;
    // a solo game (you vs computer monsters), no menus or story card, waiting at YOUR roll
    var m = document.getElementById('modal'); if (m) { m.hidden = true; m.innerHTML = ''; }
    try { AIDELAY = 60; UI.n = sp.n || 3; UI.firstGame = false; UI.intro = false; UI.adv = false; UI.coach = -1; UI.freeze = false; UI.tour = false; UI.tipSeen = {}; UI.info = false; UI.stats = false; setSeed(7); newGame('solo'); render(); } finally { Object.assign(UI, sv); }
    return until(function () { return humanTurn() && G.phase === 'roll' && !UI.busy && !UI.choice && G.dice.length === 6; }, 15000).then(function () {
      var me = M(), rv = R(), i;
      G.pl.forEach(function (p) { G.disc.push.apply(G.disc, p.cards); p.cards = []; p.hp = 10; p.vp = 0; p.en = 0; p.tok = {}; p.alive = true; p.dmod = 0; p.evo = []; });
      Object.assign(me, sp.me || {});
      (sp.rv || []).forEach(function (d, k) { Object.assign(rv[k], d); });
      G.city = sp.city === 'me' ? me.i : sp.city == null ? -1 : rv[sp.city].i; G.bay = -1; G.goal = sp.goal || 20; G.xq = []; G.winner = null;
      if (sp.market) {
        var all = sp.market.concat(sp.next || []);
        G.deck = G.deck.concat(G.market, G.disc).filter(function (c) { return all.indexOf(c) < 0; }); G.market = sp.market.slice(); G.disc = [];
        (sp.next || []).slice().reverse().forEach(function (c) { G.deck.push(c); }); G.ncards = cardTotal();
      }
      G.phase = 'roll'; G.step = 1; G.active = me.i; G.home = me.i; G.tf.startIn = [G.city, G.bay];
      if (sp.dice === null) { setSeed(null); startRoll(me); }   // a real game: real random dice
      else { G.dice = (sp.dice || ['1', '2', '3', 'E', 'H', 'C']).map(function (f) { return { f: f, k: false, x: false }; }); G.rolls = sp.rolls == null ? 2 : sp.rolls; }
      UI.choice = null; UI.pick = null; UI.banner = ''; UI.busy = false; UI.info = false; G.log = []; try { BF.recap = ''; BF.rsA = G.active; } catch (e) { }
      render();
      L.t0 = G.tid;
      if (sp.rivalsFirst) { G.dice = []; nextTurn(me); return until(function () { return UI.choice || (humanTurn() && G.phase === 'roll' && G.dice.length); }, 15000).then(function () { return new Promise(function (r) { setTimeout(r, 800); }); }); }
      return new Promise(function (r) { setTimeout(r, 700); });
    });
  }
  var settled = function () { if (!G || UI.busy || UI.choice) return false; var me = M(); if (!me) return false; return !!G.winner || !me.alive || (humanTurn() && (G.phase === 'roll' || G.phase === 'buy')); };
  var res = function () { return L.res > 0; };

  var lessons = [
    { id: 'keep', title: 'Keep and reroll', rule: 'You throw 6 dice up to 3 times. Tap dice to keep them; the rest are rerolled. Three matching numbers score, a pair scores nothing.', par: 2,
      goal: 'Score 3 stars from the dice.',
      setup: function () { return stack({ city: 0, dice: ['3', '3', 'E', 'H', 'C', '1'], re: [['3', 'E', 'E', '2'], ['2', '1', 'E', 'E']] }); },
      success: function () { return res() && M().vp >= 3; },
      fail: function () { return res() && M().vp < 3 ? 'Only three matching numbers score. You kept a pair, and a pair scores nothing.' : false; },
      hints: ['Two dice already match. Keep them and reroll the rest.', { say: 'Tap both 3s to keep them, tap Roll, then SMASH!', target: die(0) }],
      debrief: 'Keep the pair, reroll the rest: three 3s score 3 stars.' },
    { id: 'enter', title: 'Take Downtown', rule: 'A fourth matching die adds 1. When Downtown is empty you must move in: +1 star. Each energy die gives 1 energy.', par: 1,
      goal: 'Reach 5 stars this turn.',
      setup: function () { return stack({ dice: ['3', '3', '3', '3', 'E', 'H'], re: [['3', '1']] }); },
      success: function () { return res() && M().vp >= 5 && G.city === M().i; },
      fail: function () { return res() && M().vp < 5 ? 'You made ' + M().vp + ' stars. Four 3s score 4, and moving into the empty Downtown gives 1 more.' : false; },
      hints: ['Count the 3s. Downtown is empty, so you will move in.', { say: 'Keep all four 3s and tap SMASH!', target: SMASH }],
      debrief: 'Four 3s are 3 + 1 stars, and moving into Downtown is +1.' },
    { id: 'claws', title: 'Claws outside', rule: 'Rolled from outside the city, claws hit only the monster in Downtown. One claw takes one heart.', par: 1,
      goal: function () { var d = R()[0]; return 'Knock out ' + (d ? nm(d) : 'the monster in Downtown') + '.'; },
      setup: function () { return stack({ city: 0, dice: ['C', 'C', 'C', '1', '2', 'E'], rv: [{ hp: 3 }, { hp: 5 }], re: [['1', '2', 'E']] }); },
      success: function () { var d = R()[0]; return res() && (!d.alive || d.hp <= 0); },
      fail: function () { var d = R()[0]; return res() && d.alive && d.hp > 0 ? nm(d) + ' has ' + d.hp + ' hearts left. One claw takes one heart: three claws knock out three hearts.' : false; },
      hints: ['The monster in Downtown has 3 hearts. How many claws do you hold?', { say: 'Keep the three claws and tap SMASH!', target: SMASH }],
      debrief: 'Three claws, three hearts: the Downtown monster is out.' },
    { id: 'city', title: 'Claws from Downtown', rule: 'Rolled from Downtown, claws hit EVERY rival at once, wherever they stand.', par: 2,
      goal: 'Knock out both rivals this turn.',
      setup: function () { return stack({ city: 'me', dice: ['C', 'C', '3', '3', 'E', 'H'], rv: [{ hp: 3 }, { hp: 3 }], re: [['C', '2', 'E', '1']] }); },
      success: function () { return res() && R().every(function (p) { return !p.alive || p.hp <= 0; }); },
      fail: function () { var a = R().filter(function (p) { return p.alive && p.hp > 0; }); return res() && a.length ? 'Each claw hits every rival from Downtown, but you rolled too few: ' + nm(a[0]) + ' kept ' + a[0].hp + ' heart.' : false; },
      hints: ['Both rivals have 3 hearts, and claws hit them both. You need three claws.', { say: 'Keep the two claws, reroll the rest, then SMASH!', target: die(0) }],
      debrief: 'In Downtown every claw hits every rival: three claws, two knockouts.' },
    { id: 'heal', title: 'Hearts heal', rule: 'Heart dice heal 1 each, but only outside Downtown. In Downtown they do nothing.', par: 2,
      goal: 'Heal back up to 8 hearts.',
      setup: function () { return stack({ city: 0, me: { hp: 4 }, dice: ['H', 'H', '3', '2', '1', 'E'], re: [['H', 'H', 'C', '2']] }); },
      success: function () { return res() && M().hp >= 8; },
      fail: function () { return res() && M().hp < 8 ? 'You healed to ' + M().hp + ' hearts. Each heart die heals 1, so you needed four hearts.' : false; },
      hints: ['You start with 4 hearts and two heart dice. Four hearts heal 4.', { say: 'Keep both hearts, reroll the rest, then SMASH!', target: die(0) }],
      debrief: 'Four heart dice, four hearts back: healing works outside Downtown only.' },
    { id: 'buy', title: 'Buy a power card', rule: 'Spend energy on a face-up card. A Keep card (PERMANENT) works all game; a one-shot card works once and is gone.', par: 2,
      goal: 'Buy a card that works all game.',
      setup: function () { return stack({ city: 0, dice: ['E', 'E', 'E', 'E', '1', '2'], rolls: 0, market: ['cosmic', 'kiosk', 'plated'] }); },
      success: function () { return keepers(M()) > 0; },
      fail: function () {
        if (G.tf.bought && !keepers(M()) && res()) return 'Corner Kiosk is one-shot: it gave 1 star and is gone. Pick a PERMANENT card.';
        return G.tid > L.t0 && !keepers(M()) ? 'You ended the turn with energy unspent. Energy only buys cards.' : false; },
      hints: ['SMASH! turns energy dice into energy, then cards you can afford light up.', { say: 'Tap SMASH!, then buy a card marked PERMANENT.', target: SMASH }],
      debrief: 'A permanent card keeps working every turn.' },
    { id: 'sweep', title: 'Sweep the cards', rule: 'Pay 2 energy to throw away all three face-up cards and deal three new ones.', par: 3,
      goal: 'Buy a card, though none for sale is affordable now.',
      setup: function () { return stack({ city: 0, me: { en: 5 }, dice: ['1', '2', '3', '1', '2', '3'], rolls: 0, market: ['acid', 'skull', 'egg'], next: ['cosmic', 'kiosk', 'plated'] }); },
      success: function () { return M().cards.length > 0 && res(); },
      fail: function () { return G.tid > L.t0 && !M().cards.length ? 'You ended the turn with 5 energy. The cards cost 6 or more: sweep for 2 to deal new ones.' : false; },
      hints: ['The cards for sale all cost more than your 5 energy.', { say: 'Tap SMASH!, then Sweep, then buy a cheaper card.', target: SMASH }],
      debrief: 'Sweep costs 2: you dealt cards you could afford.' },
    { id: 'yield', title: 'Stay or yield', rule: 'Hit in Downtown, you choose: stay for +2 stars next turn but keep getting hit, or yield and run. A yielded Downtown goes to the attacker.', par: 1,
      goal: 'Survive the round with your monster alive.',
      setup: function () { return stack({ city: 'me', me: { hp: 3 }, dice: ['1', '2', '3', 'E', 'H', 'E'], riv: [['C', 'C', '1', '2', 'E', 'E'], ['C', 'C', '1', '2', 'E', 'E']], rivalsFirst: 1 }); },
      success: function () { return M().alive && G.city !== M().i && humanTurn(); },
      fail: function () { return !M().alive ? 'You stayed with 1 heart in Downtown. The next claws knocked you out.' : false; },
      hints: ['You have 1 heart left and another rival rolls after this one.', { say: 'Tap Yield and run.', target: opt('yield') }],
      debrief: 'Yielding saved you. Stay only when one more hit will not knock you out.' },
    { id: 'win20', title: 'Win at 20', rule: 'Reach 20 stars and survive to the end of your own turn: you win. Last monster standing also wins.', par: 2,
      goal: 'Win the game.',
      setup: function () { return stack({ city: 0, me: { vp: 17 }, dice: ['3', '3', '3', 'H', 'E', 'C'], rolls: 1, re: [['1', '2', 'E']] }); },
      success: function () { return G.winner === 'P' + (M().i + 1); },
      fail: function () { return res() && !G.winner && M().vp < 20 ? 'You have ' + M().vp + ' stars. You need 20: keep the three 3s.' : (G.winner && G.winner !== 'P' + (M().i + 1) ? 'A rival won.' : false); },
      hints: ['You have 17 stars. Three 3s are worth 3.', { say: 'Keep the 3s and SMASH!, then End turn to win.', target: SMASH }],
      debrief: 'Win is checked when your turn ends: 17 + 3 = 20.' },
    { id: 'game', title: 'Short game', rule: 'First to 8 stars, or last monster standing, wins. Use everything you learned.',
      goal: 'Win a short game: first to 8 stars.',
      setup: function () { return stack({ goal: 8, dice: null }); },
      success: function () { return G.winner === 'P' + (M().i + 1); },
      fail: function () { return G.winner && G.winner !== 'P' + (M().i + 1) ? (G.winText || 'A rival won.') : false; },
      hints: ['Keep matching numbers. Move into Downtown when it is empty.', 'Heal when you are low, and yield rather than be knocked out.'],
      debrief: 'You reached 8 stars and finished your turn: the city is yours.' }
  ];
  lessons.forEach(function (s) { s.moves = function () { return L.n; }; });

  // ---- hooks while a lesson runs: scripted throws, nothing saved over the player's real game
  function hook() {
    var fo = faceOf; faceOf = function (d) { if (L.feed && L.frame && L.frame.length) return L.frame.shift(); return fo(d); };
    var feed = function (f, frame) { return function () { if (!(L.on && GXST.active())) return f.apply(this, arguments); L.frame = frame(); L.feed = 1; try { return f.apply(this, arguments); } finally { L.feed = 0; L.frame = null; } }; };
    var sr = startRoll; startRoll = function (p) {
      if (!(L.on && GXST.active())) return sr.apply(this, arguments);
      L.frame = (p.human ? L.mine : L.riv).shift() || null; L.feed = 1;
      try { return sr.apply(this, arguments); } finally { L.feed = 0; L.frame = null; if (!p.human && G.dice.length && (L.riv.length || true)) G.rolls = 0; }
    };
    var rr = reroll; reroll = feed(function () { if (G.pl[G.active].human) L.n++; return rr.apply(this, arguments); }, function () { return G.pl[G.active].human ? (L.re.shift() || null) : null; });
    var rs = resolve; resolve = function () { if (L.on && GXST.active() && G.pl[G.active].human && G.phase === 'roll') { L.n++; L.res++; } return rs.apply(this, arguments); };
    var sw = sweep; sweep = function () { if (L.on && GXST.active() && G.pl[G.active].human) L.n++; return sw.apply(this, arguments); };
    var by = buy; buy = function () { if (L.on && GXST.active() && G.pl[G.active].human) L.n++; return by.apply(this, arguments); };
    var sv = save; save = function () { if (!(L.on && GXST.active())) return sv.apply(this, arguments); };
    window.CCL = { L: L, stack: stack };
  }
  var go = function () {
    if (!ready()) { setTimeout(go, 200); return; }
    hook();
    GXST.init({ game: 'crown-city-smash', scenarios: lessons, keepClear: ['#dice', '#pacts', '#pshop', '#buymini', '#choice'], settled: settled });
    window.addEventListener('gxst', function (e) { if (e.detail.type === 'close') { L.on = 0; try { setSeed(null); } catch (x) { } } });
  };
  setTimeout(go, 300);
})();
