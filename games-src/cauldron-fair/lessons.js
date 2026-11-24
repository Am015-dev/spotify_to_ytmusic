// Cauldron Fair: scenario lessons on the shared engine (shell/gx-scenario-tutor.js, docs shell/GXST.md). They replace the old dimming guided game.
// Each lesson stacks a real 2-maker table (the real engine: bags in a known order, a few chips already drawn), scripts the rival, and judges the real state.
// RULE -> LESSON (every rule of the rules drawer):
//   draw a chip, it moves its number, the scoring space is the one after your last chip, stop any time, big number coins / brown points ... walk
//   white chips only count towards the limit, past 7 the pot explodes, stop to keep what you have ......................................... limit
//   the flask puts the last white chip back (once a day, cannot undo an explosion) ............................................................ flask
//   a ruby on your scoring space gives a ruby (rubies also move the droplet / refill the flask) ............................................... ruby
//   chips have powers: blue, red, yellow act when drawn (yellow sends the white before it back) ............................................... power
//   an exploded pot takes points OR coins, not both ........................................................................................... boom
//   shop: up to two chips of different colours, leftover coins are lost ....................................................................... shop
//   fortune cards, rat stone head start, the last day (secret Draw / Stop, 5 coins and 2 rubies = 1 point), the bonus die, the tie-break,
//   the extra white before day 6, the game end and the winner ................................................................................. game (a real 2-day game)
(function () {
  if (!window.GXST) return;
  var $ = function (s) { return document.querySelector(s); };
  var L = { on: false, rd: 1, last: 0, n: 0 };   // n = the player's own moves in this lesson (for par)
  var me = function () { return G.players[0]; };
  var rv = function () { return G.players[1]; };
  var wsum = function (p) { var n = 0; p.pot.forEach(function (c) { if (c.c === 'W') n += c.v; }); return n; };
  var space = function (p) { return Math.min((p.pot.length ? p.pot[p.pot.length - 1].pos : (p.rat > p.droplet ? p.rat : p.droplet)) + 1, 53); };
  var stopped = function () { return me().st !== 'draw'; };
  var ready = function () { return typeof G !== 'undefined' && typeof newGame === 'function' && typeof UI !== 'undefined' && typeof render === 'function' && typeof CF !== 'undefined' && typeof BF !== 'undefined'; };
  var until = function (f, ms) { var t0 = Date.now(); return new Promise(function (r) { (function w() { var ok = false; try { ok = f(); } catch (e) { } if (ok || Date.now() - t0 > ms) r(ok); else setTimeout(w, 60); })(); }); };
  var settled = function () { return !!G && !BF.pulling && !document.querySelector('.boomfx,.bfchip,.dfly') && !(typeof STG !== 'undefined' && STG.run); };
  var btn = function (sel) { return function () { var e = $(sel); return e && !e.disabled && e.getBoundingClientRect().width ? e : null; }; };
  var draw = btn('#acts .bagb:not(.off)'), stop = btn('#acts .stopb:not(.off)'), flask = btn('#acts .flb');
  var mv = function (pred) { return function () { var l = UI.legal[0] || []; var a = document.querySelectorAll('#qbox [data-a=mv]'); for (var i = 0; i < a.length; i++) { var m = l[+a[i].dataset.i]; if (m && pred(m)) return a[i]; } return null; }; };
  var RV = ['O1', 'G1', 'O1', 'G1', 'O1', 'G1'];    // the rival's bag in a lesson: no whites, so he never explodes

  // return every chip of a seat to the box, then fill its bag with these chips; keys[0] is drawn first (the engine draws from the END of the bag)
  function setBag(p, keys) {
    [p.bag, p.pot, p.hold, p.side, p.newChips].forEach(function (a) { a.splice(0).forEach(function (c) { CF._.putBack(G, c); }); });
    p.bag = keys.slice().reverse().map(function (k) { return CF._.take(G, k); });
  }
  // sp: {pre:[chips already drawn], bag:[next draws], rival:[draws the rival makes], rbag, upto: 'play' | 'stop' | 'q:<name>', last: days}
  function stack(sp) {
    try { GX.close(); } catch (e) { } try { GXH.setEnabled(false); GXH.hide(); } catch (e) { } try { closeRS(true); } catch (e) { }
    L.on = true; L.n = 0; L.bought = null; L.de = null; L.rd = sp.rd == null ? 1 : sp.rd; L.last = sp.last || 0;
    BF.pulling = false; UI.seed = sp.seed || 7; window.AIDELAY = 120; newGame('vs', { np: 2 });
    UI.coach.level = 'off'; UI.coach.userOff = true;
    if (sp.last) G.last = sp.last;
    if (!sp.keepCard) { G.fcard = 'spring'; }
    if (sp.keep) { setBag(rv(), sp.rbag || RV); G.events = []; UI.evN = G.evN; return waitIdle(); }
    var a = me().bag.concat(rv().bag); me().bag.length = 0; rv().bag.length = 0; a.forEach(function (c) { CF._.putBack(G, c); });
    var all = (sp.pre || []).concat(sp.bag || []);
    setBag(me(), all); setBag(rv(), sp.rbag || RV);
    for (var i = 0; i < (sp.pre || []).length; i++) { var r = CF.apply(G, 0, { t: 'draw' }); if (!r.ok) throw new Error('lesson setup: ' + r.error); }
    G.events = []; UI.evN = G.evN; UI.potSig = ''; render();
    return waitIdle();
  }
  function waitIdle() { return until(function () { return !BF.pulling && (draw() || stop() || me().q || me().st !== 'draw'); }, 8000).then(function () { return new Promise(function (r) { setTimeout(r, 500); }); }); }
  // run the stack, then let the day reach the maker's decision (an exploded pot or a shop)
  function toQ(sp, h, ms) {
    return stack(sp).then(function () {
      var n = 0; (sp.auto || []).forEach(function (m) { var r = CF.apply(G, 0, m); if (!r.ok) throw new Error('auto: ' + r.error); }); G.events = []; UI.evN = G.evN; afterApply(false);
      return until(function () { return me().q && me().q.h === h && !(typeof STG !== 'undefined' && STG.run); }, ms || 15000);
    }).then(function () { return new Promise(function (r) { setTimeout(r, 600); }); });
  }
  var plays = function () { return L.n; };

  var lessons = [
    { id: 'walk', title: 'Draw and walk', par: 4, moves: plays,
      rule: 'Each chip moves as many spaces as its number. You score the space after your last chip. Brown number: points.',
      goal: 'Stop on a space that scores points.',
      setup: function () { return stack({ bag: ['G2', 'O1', 'G4', 'G2', 'O1'] }); },
      success: function () { return stopped() && D.VP[space(me())] > 0; },
      fail: function () { return stopped() && D.VP[space(me())] === 0 ? 'Space ' + space(me()) + ' scores no points. The brown numbers start at space 7. Draw more chips first.' : false; },
      hints: ['Stopping early is safe, but is this space brown?', { say: 'Draw until the ring shows a brown number, then Stop.', target: draw }],
      debrief: 'Your last chip picks your space. A brown number scores points.' },
    { id: 'limit', title: 'The limit of 7', par: 1, moves: plays,
      rule: 'Fizzpods (white) are the only chips that count to the limit. Past 7 the pot explodes. Stop before that.',
      goal: 'Bank this pot without exploding.',
      setup: function () { return stack({ pre: ['W3', 'W2', 'W1'], bag: ['W2', 'G2', 'O1'] }); },
      success: function () { return stopped() && !me().boom; },
      fail: function () { return me().boom ? 'Your white chips reached ' + wsum(me()) + '. The limit is 7: the pot exploded.' : false; },
      hints: ['Add up the white chips in your pot. How many are left to the limit?', { say: 'You hold 6 of 7. The next white 2 would explode. Stop.', target: stop }],
      debrief: 'White chips add up to 6. One more white 2 makes 8: boom. Stop in time.' },
    { id: 'flask', title: 'The flask', par: 3, moves: plays,
      rule: 'Once a day the flask puts your last white chip back in the bag. It cannot undo an explosion.',
      goal: 'Add one more chip safely, then Stop.',
      setup: function () { return stack({ pre: ['O1', 'W3', 'W2', 'W2'], bag: ['W1', 'G2', 'G2'] }); },
      success: function () { return stopped() && !me().boom && !me().flask && me().pot.length >= 4; },
      fail: function () {
        if (me().boom) return 'You were at exactly 7 and drew a white 1: 8, boom. The flask first puts a white chip back.';
        return stopped() && me().flask ? 'You stopped with the flask unused. Tap the flask, then draw one more chip.' : false;
      },
      hints: ['You are at exactly 7. Which button makes room?', { say: 'Tap the flask, then draw, then Stop.', target: flask }],
      debrief: 'The flask took the white 2 out: room for one more chip. It works once a day.' },
    { id: 'ruby', title: 'Ruby space', par: 2, moves: plays,
      rule: 'A ruby on your scoring space gives you a ruby. Rubies move your droplet or refill your flask.',
      goal: 'Stop on a space with a ruby.',
      setup: function () { return stack({ pre: ['O1', 'O1', 'W1'], bag: ['O1', 'O1', 'O1'] }); },
      success: function () { return stopped() && !!D.RUBY[space(me())]; },
      fail: function () { return stopped() && !D.RUBY[space(me())] ? 'Space ' + space(me()) + ' has no ruby. Ruby spaces are 5, 9, 13 and so on. Count the spaces.' : false; },
      hints: ['The ring shows your scoring space. Is there a ruby on it?', { say: 'One more orange 1 lands on space 5, a ruby. Draw, then Stop.', target: draw }],
      debrief: 'Space 5 holds a ruby. Count one chip at a time.' },
    { id: 'power', title: 'Chip powers', par: 2, moves: plays,
      rule: 'Yellow, red and blue chips act the moment you draw them. A Sunroot sends the white chip before it back.',
      goal: 'Draw the Sunroot and send a Fizzpod back.',
      setup: function () { return stack({ pre: ['W3', 'W3', 'W1'], bag: ['Y1', 'O1', 'O1'] }); },
      success: function () { return me().pot.some(function (c) { return c.c === 'Y'; }) && wsum(me()) <= 6 && !me().boom && !me().q; },
      fail: function () {
        var y = me().pot.some(function (c) { return c.c === 'Y'; });
        if (y && wsum(me()) > 6 && !me().q) return 'The white 1 stayed in the pot. The Sunroot can send it back: answer Yes.';
        return stopped() && !y ? 'You stopped before the Sunroot came out. Its power works only when you draw it.' : false;
      },
      hints: ['The next chip in your bag is yellow. Its power needs a white right before it.', { say: 'Draw. When asked, put the white chip back.', target: draw }],
      debrief: 'Sunroot sends the white 1 back: your white total falls to 6.' },
    { id: 'boom', title: 'After a boom', par: 1, moves: plays,
      rule: 'An exploded pot gets the points of its space OR the coins to shop with, never both.',
      goal: 'Keep the 3 points from your exploded pot.',
      setup: function () { return toQ({ pre: ['W3', 'W3', 'G4', 'G4', 'W1'], bag: ['W1'], auto: [{ t: 'draw' }] }, 'de'); },
      success: function () { return me().vp >= 3; },
      fail: function () { return L.de === 'buy' ? 'You took the coins. Points or coins, never both: those 3 points are gone.' : false; },
      hints: ['The pot exploded. What do you want from it: points or coins?', { say: 'Take the 3 victory points.', target: function () { return $('#rs [data-a=mv]') && [].filter.call(document.querySelectorAll('#rs [data-a=mv]'), function (e) { return /point/i.test(e.textContent); })[0] || null; } }],
      debrief: 'Points or coins: you picked the points, so you score now.' },
    { id: 'shop', title: 'At the stalls', par: 1, moves: plays,
      rule: 'Spend coins on up to two chips of different colours. Coins you do not spend are lost.',
      goal: 'Buy two chips of different colours.',
      setup: function () { return toQ({ pre: ['W2', 'W2', 'W2', 'O1'], bag: ['O1'], auto: [{ t: 'stop' }] }, 'shop'); },
      success: function () { var b = L.bought || []; return b.length >= 2 && b[0][0] !== b[1][0]; },
      fail: function () { var b = L.bought; return b && !(b.length >= 2 && b[0][0] !== b[1][0]) ? 'You left coins unspent: they are lost. Two chips of different colours fit in your purse.' : false; },
      hints: ['You have 8 coins. How many chips can you buy?', { say: 'Tap two stalls of different colours, then confirm.', target: function () { return $('#rs .stalls .tok:not([disabled])'); } }],
      debrief: 'Two chips, two colours. They go into your bag for tomorrow.' },
    { id: 'game', title: 'A short real game', par: 14, moves: plays,
      rule: 'Two days: day 1 as usual, day 2 is the last day: secret Draw or Stop, no shop. Most points wins.',
      goal: 'Win a two-day game: the most points.',
      setup: function () { return stack({ keep: 1, last: 2, rd: 1, rbag: ['O1', 'O1', 'O1', 'O1', 'O1', 'O1'] }); },
      success: function () { return G.phase === 'over' && G.winner === 0; },
      fail: function () { return G.phase === 'over' && G.winner !== 0 ? 'Wynne finished ahead. Stop on a brown number each day to score points.' : false; },
      hints: ['Each day, stop on a brown number before the white chips pass 7.', { say: 'Draw to a brown number, Stop, then repeat on day 2.', target: draw }],
      debrief: 'Two days played with every rule: you win on points.' }
  ];
  var go = function () {
    if (!ready()) { setTimeout(go, 200); return; }
    // the rival plays a script in a lesson: a set number of draws, then Stop (every other decision is the normal computer's). Lessons never overwrite the saved game.
    var oc = CF.AI.choose; CF.AI.choose = function (Gx, seat, level) {
      if (L.on && GXST.active() && Gx === G && seat === 1 && Gx.phase === 'brew') {
        var p = Gx.players[1];
        if (p.st === 'draw' && !p.q) { var m = CF.moves(Gx, 1), t = p.pot.length >= L.rd ? 'stop' : 'draw'; var x = m.filter(function (e) { return e.t === t; })[0] || m.filter(function (e) { return e.t === 'stop'; })[0]; if (x) return x; }
      }
      return oc.call(CF.AI, Gx, seat, level);
    };
    var og = goalCard; goalCard = function (force) { if (!force && GXST.active()) return; return og.apply(this, arguments); };   // no goal popup over a lesson
    var oc2 = commit; commit = function (seat, m) { if (L.on && seat === 0) { L.n++; if (m.t === 'buy') L.bought = (m.items || []).slice(); if (m.t === 'de') L.de = m.o; } return oc2.apply(this, arguments); };
    var os = save; save = function () { if (!GXST.active()) return os.apply(this, arguments); };
    var slot = document.createElement('div'); slot.id = 'gxst-slot'; slot.hidden = true; document.body.appendChild(slot);
    window.addEventListener('gxst', function (e) { if (e.detail.type === 'close' || e.detail.type === 'picker') { L.on = false; } else if (e.detail.type === 'start' || e.detail.type === 'retry') L.on = true; });
    document.addEventListener('click', function (e) { var b = e.target.closest && e.target.closest('[data-lessons-open]'); if (b) { try { GX.close(); } catch (x) { } GXST.picker(); } });
    var KC = [];   // areas the card keeps off: the board's turn strip and buttons while brewing, the day report's buttons while it is open (the report fills the screen)
    var kc = function () { var rs = $('#rs'), open = rs && !rs.hidden && rs.getBoundingClientRect().height > 50; var want = open ? ['.gx-bar', '#rs .dpick', '#rs [data-a=shopbuy]'] : ['.gx-bar', '#fort', '.gx-dock-head', '#acts', '#qbox', '#cwrap']; if (want.join() !== KC.join()) { KC.length = 0; want.forEach(function (x) { KC.push(x); }); } };
    kc(); setInterval(kc, 150);
    GXST.init({ game: 'cauldron-fair', scenarios: lessons, qParent: '#gxst-slot', keepClear: KC, settled: settled });
    window.CFLessons = { open: function () { GXST.picker(); } };
  };
  setTimeout(go, 300);
})();
