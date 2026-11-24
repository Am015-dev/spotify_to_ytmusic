// Thornbound lessons: short scenario games on the shared engine (shell/gx-scenario-tutor.js, docs shell/GXST.md).
(function () {
  if (!window.GXST) return;
  var L = { ai: null, n: 0, pre: 0 };
  var ready = function () { return typeof G !== 'undefined' && typeof newGame === 'function' && typeof UI !== 'undefined' && typeof renderAll === 'function' && typeof TB !== 'undefined' && TB.internal; };
  var until = function (f, ms) { var t0 = Date.now(); return new Promise(function (r) { (function w() { var ok = false; try { ok = f(); } catch (e) { } if (ok || Date.now() - t0 > ms) r(ok); else setTimeout(w, 50); })(); }); };
  var SKEL = [['bidPlace'], ['bidReveal'], ['bidOrder'], ['bidNext'], ['bidEnd'], ['heralds', { i: 0 }], ['placeCards'], ['menus', { step: 'spring', i: 0 }], ['clashOrder'], ['regionLoop', { i: 0 }], ['menus', { step: 'autumn', i: 0 }], ['winter']];
  var START = { bid: 0, herald: 5, place: 6, spring: 7, clash: 8, autumn: 10 };
  // The position: a fresh 2-house game (fixed seed), then every card placed by hand. Every card id still exists exactly once (the rest of a house's basics are its deck).
  // sp: { at, order, hands:[[k..],[k..]] (k = card number 0..13 within the house, 14..18 site), ks:[[{kc,occ}..],..], road:[kc x4], inf:[a,b], lore:[a,b], ai(seat,kind,moves) -> move|null, round, ... }
  function stack(sp) {
    try { GX.close(); } catch (e) { } try { GXH.setEnabled(false); GXH.hide(); } catch (e) { } try { hideStart(); } catch (e) { } try { closePop(true); } catch (e) { }
    newGame('me', { np: 2, length: 'short', seed: sp.seed || 23, faction: 'clans', levels: ['easy', 'easy'], seatFactions: ['clans', 'nobility'], guide: 'off', order: sp.order || [0, 1] });
    var gc = document.getElementById('tbgoal'); if (gc) gc.remove();
    var I = TB.internal; UI.guide = 'off'; UI.coachOn = 0; UI.speed = 6; try { UI.coach.level = 'off'; } catch (e) { }
    L.n = 0; L.ai = sp.ai || null; L.pre = 0;
    G.q = null; G.ag = []; G.agI = 0; G.log = []; G.logN = 0; G.round = sp.round || 1; G.phase = 'spring'; G.order = (sp.order || [0, 1]).slice();
    G.pl.forEach(function (P, s) {
      var h = (sp.hands && sp.hands[s]) || [], ks = (sp.ks && sp.ks[s]) || [], used = {};
      P.hand = h.map(function (k) { return s * 100 + k; }); P.hand.forEach(function (id) { used[id] = 1; });
      P.ks = [null, null, null]; ks.forEach(function (t, j) { if (!t) return; var o = t.occ == null ? null : s * 100 + t.occ; if (o != null) used[o] = 1; P.ks[j] = { kc: t.kc, occ: o }; });
      P.site = []; for (var k = 14; k < 19; k++) if (!used[s * 100 + k]) P.site.push(s * 100 + k);
      P.deck = []; for (k = 0; k < 14; k++) if (!used[s * 100 + k]) P.deck.push(s * 100 + k); P.disc = []; P.bid = null; P.herald = -1;
      P.inf = ((sp.inf || [])[s]) || 0; P.lore = ((sp.lore || [])[s]) || 0; P.hs = 6; P.hq = []; P.sup = [];
      P.supp = { b: sp.bench && s === 0 ? 5 : 0, r: [0, 0, 0], x: [0, 0, 0], l: 0 }; if (sp.tactics !== true) P.tac.forEach(function (t) { t.ex = true; });
    });
    var taken = {}; G.pl.forEach(function (P) { P.ks.forEach(function (t) { if (t) taken[t.kc] = 1; }); });
    var road = sp.road || [3, 5, 9, 12]; road.forEach(function (k) { taken[k] = 1; }); G.road = road.slice();
    G.kdeck = []; for (var k2 = 1; k2 <= 51; k2++) if (!taken[k2]) G.kdeck.push(k2); G.kdisc = []; G.klimbo = [];
    G.council = { relics: [], secrets: [], oaths: [] }; (sp.council || []).forEach(function (c) { G.council[c[0]].push(c[2] * 100 + c[1]); });
    G.fav = { h: sp.favour == null ? -1 : sp.favour, u: 3 };
    G.reg.forEach(function (R) { R.up = []; R.down = []; R.took = []; R.kc = []; R.done = false; R.n = 0; });
    G.rm = I.newRM(); G.used = {}; G.cord = []; G.clash = null; G.bidRev = false; G.taken = false; G.bstr = []; G.bq = [];
    (sp.down || []).forEach(function (pr, r) { pr.forEach(function (k, s) { if (k != null) { var id = s * 100 + k; G.pl[s].deck = G.pl[s].deck.filter(function (x) { return x !== id; }); G.pl[s].hand = G.pl[s].hand.filter(function (x) { return x !== id; }); G.reg[r].down.push(id); } }); });
    (sp.herald || []).forEach(function (l, s) { G.pl[s].herald = l; });
    if (sp.prep) sp.prep(G);
    var from = START[sp.at || 'bid']; SKEL.slice(from).forEach(function (a) { G.ag.push({ h: a[0], d: a[1] ? JSON.parse(JSON.stringify(a[1])) : {} }); });
    I.flow(); UI.evq = []; UI.card = null; UI.pop = null; UI.busy = false; UI.rs0 = snapInf(); UI.rsLog = G.logN; UI.rsInfl = JSON.parse(JSON.stringify(G.infl || [])); UI.mapReset = true;
    renderAll(); pump();
    return until(function () { return !UI.busy && !UI.card && G.q && whoActs().hum.length; }, 8000).then(function () { return new Promise(function (r) { setTimeout(r, 500); }); });
  }

  // ---- helpers: what the real game says happened
  var me = function () { return G.pl[0]; }, rv = function () { return G.pl[1]; };
  var logHas = function (re) { return G.log.some(function (e) { return re.test(e.t); }); };
  var won = function (reg) { return logHas(new RegExp('^' + me().name + ' wins the Clash' + (reg ? ' in ' + reg : ''))); };
  var wins = function () { return G.log.filter(function (e) { return new RegExp('^' + me().name + ' wins the Clash').test(e.t); }).length; };
  var pastBids = function () { return G.step === 'herald' || G.step === 'place' || G.phase !== 'spring' || G.round > 1; };
  var hasKC = function (P, kc) { return P.ks.some(function (t) { return t && t.kc === kc; }); };
  var card = function (k) { return function () { return document.querySelector('#handw .hc[data-id="' + k + '"]'); }; };
  var pick = function (kind, f) { return function (seat, k, mv) { return k === kind ? mv.filter(f)[0] || null : null; }; };
  var script = function () { var fs = [].slice.call(arguments); return function (seat, k, mv) { for (var i = 0; i < fs.length; i++) { var m = fs[i](seat, k, mv); if (m) return m; } return null; }; };
  var bidWith = function (k) { return pick('bid', function (m) { return m.id === 100 + k; }); };
  var order = function (k) { return pick('clashOrder', function (m) { return m.k === k; }); };
  var any = function (kind) { return pick(kind, function () { return true; }); };
  var lessons = [
    { id: 'bid', title: 'Bid', rule: 'Everyone bids one hidden card. The highest bid chooses first from the Great Road. Its power is yours to keep.', par: 3,
      goal: 'Win the bid and take Ward Towers.',
      setup: function () { return stack({ at: 'bid', hands: [[2, 4, 10, 0, 1, 3], [9, 3, 5, 6, 7, 8]], road: [3, 5, 9, 12], ai: script(bidWith(9), pick('bidRes', function (m) { return m.t === 'take' && m.kc === 5; })) }); },
      success: function () { return hasKC(me(), 5); },
      fail: function () { if (!pastBids() || hasKC(me(), 5)) return false; return hasKC(rv(), 5) ? 'The Crown bid a 6 and chose first. It took Ward Towers. Your card was lower.' : 'You won the bid but took another card. Ward Towers was the goal.'; },
      hints: ['The highest bid chooses first. One card in your hand beats a 6.', { say: 'Bid the 7, then take Ward Towers.', target: card(10) }],
      debrief: 'The 7 outbid the 6, so you chose first.' },
    { id: 'steal', title: 'Steal a card', rule: 'To steal a Kingdom Card, your bid must beat its occupier\'s Strength. A tie is not enough.', par: 3,
      goal: 'Steal the Crown\'s Ribbon Charter.',
      setup: function () { return stack({ at: 'bid', hands: [[2, 5, 10, 0, 1, 3], [3, 4, 6, 7, 8, 9]], ks: [[], [{ kc: 3, occ: 5 }]], road: [9, 12, 13, 14], ai: script(bidWith(3), pick('bidRes', function (m) { return m.t === 'return'; })) }); },
      success: function () { return hasKC(me(), 3); },
      fail: function () { return pastBids() && !hasKC(me(), 3) ? 'A steal needs a bid above the occupier. The Crown\'s occupier is a 4, and your card was not higher.' : false; },
      hints: ['Its occupier is a Reed Shields, Strength 4. You need more than that.', { say: 'Bid the 7, then choose Steal.', target: card(10) }],
      debrief: '7 beats the occupier\'s 4: stolen, and it returns to the Crown\'s hand.' },
    { id: 'place', title: 'Hide your cards', rule: 'Place one face-down card at each Region. In the Clash the higher total Strength wins that Region.', par: 8,
      goal: 'Win two Regions. The Crown\'s Herald marks its Heir.',
      setup: function () { return stack({ at: 'place', hands: [[9, 4, 7, 0, 1, 2], [8, 13, 3, 0, 1, 2]], herald: [0, 3],
        ai: script(pick('place', function (m) { var n = G.reg.reduce(function (a, R) { return a + R.down.filter(function (id) { return id >= 100; }).length; }, 0); return m.id === 100 + [8, 13, 3][n] && m.r === n; }), order('o012'), any('location')) }); },
      success: function () { return wins() >= 2; },
      fail: function () { return G.log.filter(function (e) { return /wins the Clash/.test(e.t); }).length >= 3 && wins() < 2 ? 'The Crown\'s cards were stronger in two Regions. Your best card was wasted against its Heir.' : false; },
      hints: ['The Heir is a 10: nothing you hold beats it. Do not feed it your best card.', { say: 'Put the 3 in the Crossroads, your two big cards beside it.', target: card(4) }],
      debrief: 'You gave up the Region you could not win, and won the other two.' },
    { id: 'supporters', title: 'Supporters', rule: 'In Spring, send Supporters to a Region. Each one adds +1 Strength to that Region\'s Clash.', par: 3,
      goal: 'Win the Crossroads: your 3 faces the Crown\'s 5.',
      setup: function () { return stack({ at: 'spring', bench: 1, hands: [[2, 5, 0, 1], [3, 0, 1, 2]], down: [[10, 3], [4, 8], [7, 2]], herald: [3, 0], ai: script(order('o102'), any('location')) }); },
      success: function () { return won('The Crossroads'); },
      fail: function () { return logHas(new RegExp('^' + rv().name + ' wins the Clash in The Crossroads')) ? 'Your 3 plus your Supporters did not beat the 5. Each Supporter adds only +1.' : false; },
      hints: ['Your Supporters are on your board. Where would +1 each help most?', 'Send three Supporters to the Crossroads: 3 + 3 beats 5.'],
      debrief: 'Three Supporters made your 3 into a 6.' },
    { id: 'tie', title: 'Break a tie', rule: 'On a tie, each tied side may add one more face-down card. A new Clash counts only the new cards.', par: 3,
      goal: 'Break the tie in the Crossroads and win it.',
      setup: function () { return stack({ at: 'clash', hands: [[10, 2, 0, 1], [3, 0, 1, 2]], down: [[0, 3], [6, 8], [5, 4]], herald: [3, 0], ai: script(order('o102'), pick('tie', function (m) { return m.pass; }), any('location')) }); },
      success: function () { return won('The Crossroads'); },
      fail: function () { return logHas(/Nobody breaks the tie/) || logHas(new RegExp('^' + rv().name + ' wins the Clash in The Crossroads')) ? 'Passing leaves the tie and nobody claims the Region. Add a card to win.' : false; },
      hints: ['5 against 5. Your hand holds a bigger card.', { say: 'Play the 7 face-down to the new Clash.', target: card(10) }],
      debrief: 'The new Clash counted only the 7. You win the Region.' },
    { id: 'herald', title: 'Herald call', rule: 'If your Herald stands on the Location you claim, gain 1 Influence and steal 1 from each rival Herald there.', par: 3,
      goal: 'Win the South Weald and claim the Herald Reward.',
      setup: function () { return stack({ at: 'clash', hands: [[2, 0, 1, 3], [3, 0, 1, 2]], inf: [0, 3], down: [[2, 0], [3, 4], [10, 3]], herald: [5, 5], ai: script(order('o201'), any('location')) }); },
      success: function () { return logHas(new RegExp('^' + me().name + ' steals 1 Influence')); },
      fail: function () { return G.reg[2].done && !logHas(new RegExp('^' + me().name + ' steals 1 Influence')) ? 'Your Herald stands on Ash Heap. You claimed the other Location, so no Herald Reward.' : false; },
      hints: ['Both Heralds are on the same Location. Claim it.', 'Claim Ash Heap: +1 base, +1 Herald, and 1 stolen.'],
      debrief: 'Herald call: +1, and 1 stolen from the Crown.' },
    { id: 'journey', title: 'Journey for Lore', rule: 'In Autumn, Journey a card with scroll icons to gain Lore. Spend Lore to buy a card from your Site of Power.', par: 5,
      goal: 'Journey, then buy Marsh Outriders for 2 Lore.',
      setup: function () { return stack({ at: 'autumn', hands: [[9, 4, 0, 1, 2], [3, 0, 1, 2]], ai: script(pick('menu', function (m) { return m.t === 'done'; })) }); },
      success: function () { return me().hand.indexOf(15) >= 0; },
      fail: function () { return G.phase === 'winter' || G.round > 1 ? 'You ended Autumn without Marsh Outriders. A card with two scrolls pays its 2 Lore.' : false; },
      hints: ['Cards with scroll icons give Lore when you Journey with them.', { say: 'Journey the 6 (two scrolls), then buy Marsh Outriders.', target: card(9) }],
      debrief: 'Two scrolls, two Lore: spent at once on a new card.' },
    { id: 'favour', title: 'Kingdom\'s Favour', rule: 'Claim Market Cross to take the Favour disc. Its holder may use a special action, three times.', par: 3,
      goal: 'Win the Crossroads and take the Favour disc.',
      setup: function () { return stack({ at: 'clash', hands: [[2, 0, 1, 3], [3, 0, 1, 2]], down: [[2, 0], [10, 3], [3, 4]], herald: [1, 5], ai: script(order('o102'), any('location')) }); },
      success: function () { return G.fav.h === 0; },
      fail: function () { return logHas(new RegExp('^' + me().name + ' claims (?!Market Cross)')) && G.fav.h !== 0 ? 'Only Market Cross hands out the Favour disc. You claimed the other Location.' : false; },
      hints: ['One of the two Crossroads Locations gives the Favour disc. Read them.', 'Claim Market Cross.'],
      debrief: 'The disc is yours: three uses of your faction\'s Favour.' },
    { id: 'govern', title: 'Govern', rule: 'In Autumn, move a card with Votes into a Council. Votes in a Council pay out when you claim with your Herald.', par: 4,
      goal: 'Put two Votes into the Purse Council.',
      setup: function () { return stack({ at: 'autumn', hands: [[3, 1, 0, 9, 4], [3, 0, 1, 2]], ai: script(pick('menu', function (m) { return m.t === 'done'; })) }); },
      success: function () { return TB.internal.cvotes(0, 'relics') >= 2; },
      fail: function () { return G.phase === 'winter' || G.round > 1 ? 'You ended Autumn with fewer than two Votes in the Purse Council. The card with two Votes is the Ferry Trader.' : false; },
      hints: ['Votes are the gavel icons. Which card shows two?', { say: 'Govern the Ferry Trader into the Purse Council.', target: card(1) }],
      debrief: 'Two Votes in the Purse Council, ready to cash in.' },
    { id: 'game', title: 'A short game', rule: 'Two rounds against the Crown. Bid, place, fight, claim. Most Influence wins.', par: 0,
      goal: 'Finish two rounds with more Influence than the Crown.',
      setup: function () { stackGame(); return until(function () { return !UI.busy && !UI.card && G.q && whoActs().hum.length; }, 8000).then(function () { return new Promise(function (r) { setTimeout(r, 500); }); }); },
      success: function () { return !!(G.over && G.over.winner === 0); },
      fail: function () { return G.over && G.over.winner !== 0 ? 'The Crown finished ahead. Win more Regions and make your Herald calls count.' : false; },
      hints: ['Bid high for a card you want, keep one big card for a Region you can win.', 'Each Region pays Influence, and a Herald call adds more.'],
      debrief: 'A full game: you finished ahead.' }
  ];
  function stackGame() {
    try { GX.close(); } catch (e) { } try { GXH.setEnabled(false); GXH.hide(); } catch (e) { } try { hideStart(); } catch (e) { } try { closePop(true); } catch (e) { }
    newGame('me', { np: 2, length: 'short', seed: 23, faction: 'clans', levels: ['easy', 'easy'], seatFactions: ['clans', 'nobility'], guide: 'off' });
    G.rounds = 2; L.n = 0; L.ai = null; UI.guide = 'off'; UI.speed = 6; var gc = document.getElementById('tbgoal'); if (gc) gc.remove(); try { UI.coach.level = 'off'; } catch (e) { }
    renderAll(); pump();
  }
  lessons.forEach(function (s) { s.moves = function () { return L.n; }; });
  var go = function () {
    if (!ready()) { setTimeout(go, 200); return; }
    var oc = aiChoose; aiChoose = function (seat, level) {
      if (GXST.active() && L.ai && G && G.q) { var m = L.ai(seat, G.q.kind, legal(seat)); if (m) return m; }
      return oc.apply(this, arguments);
    };
    var os = saveGame; saveGame = function () { if (!GXST.active()) return os.apply(this, arguments); };
    var oh = humanMove; humanMove = function (k) { var r = oh.apply(this, arguments); if (r && GXST.active() && !/^(done|seldone)$/.test(k)) L.n++; return r; };
    window.TBL = { L: L, stack: stack, lessons: lessons, until: until };
    if (lessons.length) GXST.init({ game: 'thornbound', scenarios: lessons, keepClear: ['#handw', '#road'], settled: function () { return !!(G && G.over) || (!UI.busy && !UI.card && !UI.pumping); } });
  };
  setTimeout(go, 300);
})();
