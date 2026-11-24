// Ochre Horizon charters: three short story puzzles on the REAL engine (window.OH / node). No rule is changed: each charter only
// sets up a starting position, offers the player 2-3 real legal moves at the moments that matter, and plays the rival with a fixed,
// explained plan. Everything between decisions (passing, income, the rival's turns) runs by itself with a one-line explanation,
// so every tap the player makes is a decision. Design and per-tap lesson table: ../../proof/STORY-DESIGN.md
(function (root) {
  var isNode = typeof module !== 'undefined';
  function OHx() { return root.OH || (isNode ? require('./engine.js') : null); }
  var YOU = 'Lantern Cooperative', RIV = 'Greyline Holdings';

  // ---------- setup helpers ----------
  function base(seed, o) {
    var OH = OHx(); OH.newGame({ seed: seed });
    var G = OH.G;
    G.pl.forEach(function (P) { G.deck = G.deck.concat(P.offer.cards); P.offer = null; P.corp = 'c00'; });
    G.phase = 'action'; G.turn = 0; G.first = 0; G.acts = 0;
    G.charter = true;   // marks the state (UI hides research etc.)
    [0, 1].forEach(function (p) { var s = o.pl[p] || {}; var P = G.pl[p]; for (var k in s) { if (k === 'prod') for (var r in s.prod) P.prod[r] = s.prod[r]; else if (k === 'hand') s.hand.forEach(function (id) { give(p, id); }); else P[k] = s[k]; } });
    if (o.temp !== undefined) G.temp = o.temp; if (o.oxy !== undefined) G.oxy = o.oxy;
    if (o.oceans) { var M = OHx().MAP, os = M.order.filter(function (s) { return M.spaces[s].ocean; }); for (var j = 0; j < o.oceans; j++) G.tiles[os[os.length - 1 - j]] = { t: 'ocean', o: -1 }; G.oceans = o.oceans; }
    G.log.push({ p: -1, t: 'Charter begins.' });
    return G;
  }
  function give(p, id) { var G = OHx().G; [G.deck, G.discard].forEach(function (a) { var i = a.indexOf(id); if (i >= 0) a.splice(i, 1); }); G.pl[p].hand.push(id); }
  function legal(m) { var OH = OHx(); return OH.validMoves().some(function (v) { return v.t === m.t && (v.k || '') === (m.k || '') && (v.id || '') === (m.id || ''); }); }
  function money(n) { return n + ' credit' + (n === 1 ? '' : 's'); }

  // the rival's fixed plans (real legal moves), each with its reason in one sentence
  var PLANS = {
    income: function (G) { var OH = OHx(), P = G.pl[1]; var c = P.hand.filter(function (id) { return OH.playable(1, id); })[0]; if (c && G.gen <= 2) return { m: { t: 'play', id: c }, why: RIV + ' buys income (' + OH.card(c).name + '): rich later, no points now.' }; return PLANS.comets(G); },
    comets: function (G) { var OH = OHx(), P = G.pl[1]; if (OH.stdOk(1, 'asteroid')) return { m: { t: 'std', k: 'asteroid' }, why: RIV + ' buys a comet strike: +1 rating now, nothing for later.' }; return { m: { t: 'pass' }, why: RIV + ' is out of money and passes.' }; },
    cities: function (G) {
      var OH = OHx(), P = G.pl[1];
      if (OH.stdOk(1, 'city') && OH.cities(1) < 1) return { m: { t: 'std', k: 'city' }, why: RIV + ' builds a city: it wants greenery next to it.', place: 'rivalCity' };
      if (P.plant >= OH.greenCost(1) && OH.legalSpaces(1, 'greenery').length) return { m: { t: 'green' }, why: RIV + ' turns 8 plants into a greenery by its city.', place: 'rivalNear' };
      if (OH.stdOk(1, 'asteroid')) return { m: { t: 'std', k: 'asteroid' }, why: RIV + ' buys a comet strike for 1 rating.' };
      return { m: { t: 'pass' }, why: RIV + ' passes and waits for income.' };
    },
    rating: function (G) {
      var OH = OHx(), P = G.pl[1];
      if (P.plant >= OH.greenCost(1) && OH.legalSpaces(1, 'greenery').length) return { m: { t: 'green' }, why: RIV + ' turns 8 plants into a greenery: +1 oxygen, +1 rating.' };
      return { m: { t: 'pass' }, why: RIV + ' sits on its credits and passes.' };
    },
    race: function (G) {
      var OH = OHx();
      if (G.pl[1].heat >= 8 && G.temp < OH.TEMP_MAX) return { m: { t: 'heat' }, why: RIV + ' burns 8 heat: +1 temperature, +1 rating.' };
      if (OH.stdOk(1, 'aquifer')) return { m: { t: 'std', k: 'aquifer' }, why: RIV + ' pumps an aquifer: an ocean and +1 rating.', place: 'rivalOcean' };
      if (OH.stdOk(1, 'asteroid')) return { m: { t: 'std', k: 'asteroid' }, why: RIV + ' buys a comet strike for 1 rating.' };
      return { m: { t: 'pass' }, why: RIV + ' passes.' };
    }
  };

  // ---------- the three charters ----------
  var CH = [
    {
      id: 'seed', n: 1, title: 'Four Seasons', gens: 4, plan: 'income',
      story: [
        'You have 4 seasons to beat ' + RIV + '. Whoever has more points at the end wins.',
        'Each season you earn credits equal to your points. Points are worth more early.'
      ],
      goal: 'Beat ' + RIV + ' on points in 4 seasons.',
      lesson: 'Count the seasons left. An income card pays back after about 4-5 seasons; with only 4 left, raising the planet (rating) wins.',
      hint: 'In a full game (12+ rounds) it flips: buy income in the first 3 rounds, terraform from the middle on.',
      setup: function () { return base(7101, { pl: [{ mc: 31, tr: 20, hand: ['p009', 'p004'] }, { mc: 31, tr: 20, hand: ['p001', 'p181', 'p185'] }], temp: -30 }); },
      decisions: [
        { gen: 1, prompt: 'Season 1 of 4: grow, or score now?', options: [
          { label: 'Quiet Money Company', sub: '17 credits · +4 income every season', moves: [{ t: 'play', id: 'p009' }], why: '+4 a season, 4 paydays left: 16 back for 17 spent. No points.', naive: 1 },
          { label: 'Comet strike', sub: '14 credits · +1 rating now', moves: [{ t: 'std', k: 'asteroid' }], why: '+1 point now, and it pays 1 credit every season too.' }],
          teach: 'An income card is worth its number times the paydays left; rating is points and also pays.' },
        { gen: 2, prompt: 'Season 2 of 4: one more income card?', options: [
          { label: 'Moonlit Ledger', sub: '15 credits · +3 income every season', moves: [{ t: 'play', id: 'p004' }], why: '+3 for 3 paydays: 9 back for 15 spent. A loss this late.', naive: 1 },
          { label: 'Comet strike', sub: '14 credits · +1 rating now', moves: [{ t: 'std', k: 'asteroid' }], why: 'Another point that also pays you each season.' }],
          teach: 'With fewer seasons left, the same card returns less: 3 paydays x 3 = 9 for a 15-credit card.' }
      ],
      auto: 'cashin',
      check: function (G) { var OH = OHx(); var a = OH.score(0).total, b = OH.score(1).total; return { ok: a > b || (a === b && G.pl[0].mc > G.pl[1].mc), line: 'You ' + a + ' · ' + RIV.split(' ')[0] + ' ' + b }; }
    },
    {
      id: 'garden', n: 2, title: 'The Garden Ring', gens: 3, plan: 'rating',
      story: [
        'Build a garden city. Every green tile next to a city scores 1 point.',
        'Where you place a tile matters. ' + RIV + ' is racing you for it.'
      ],
      goal: 'Beat ' + RIV + ' on points in 3 seasons.',
      lesson: 'Cities and greenery feed each other: a city in open ground with room for greenery around it scores every leaf.',
      hint: 'In a full game, plan your city where 3-4 greenery can follow, and plant next to it.',
      setup: function () { return base(7202, { pl: [{ mc: 26, tr: 20, hand: ['p042'], plant: 24, prod: { plant: 8 } }, { mc: 26, tr: 27, plant: 24, prod: { plant: 8 } }], temp: -20, oxy: 2 }); },
      decisions: [
        { gen: 1, prompt: 'Season 1: what to build first?', options: [
          { label: 'Terrace Settlement', sub: '17 credits · a city, +1 income', moves: [{ t: 'play', id: 'p042' }], why: 'A city: every greenery that touches it is +1 point at the end.' },
          { label: 'Comet strike', sub: '14 credits · +1 rating now', moves: [{ t: 'std', k: 'asteroid' }], why: 'One rating now. No city means your greenery score only 1 each.', naive: 1 }],
          teach: 'A city scores 1 point per greenery touching it.' },
        { gen: 1, kind: 'place', tile: 'city', prompt: 'Where does the city go?', pick: 'cityRoom',
          teach: 'Greenery must touch your own tiles, so the city decides where your greenery can grow.' },
        { gen: 1, prompt: 'You have 24 plants. Plant now?', options: [
          { label: 'Plant a greenery', sub: '8 plants · +1 oxygen, +1 rating, +1 point', moves: [{ t: 'green' }], why: 'Oxygen up: +1 rating, the tile is +1 point, and it touches your city: +1 more.' },
          { label: 'Keep the plants', sub: 'save them for later', moves: [], why: 'Plants wait safely, but each season you wait is a season the tile is not scoring.', naive: 1 }],
          teach: '8 plants make a greenery: it raises oxygen (+1 rating) and is worth 1 point, 2 next to your city.' }
      ],
      auto: 'plant',
      check: function (G) { var OH = OHx(); var a = OH.score(0).total, b = OH.score(1).total; return { ok: a > b || (a === b && G.pl[0].mc > G.pl[1].mc), line: 'You ' + a + ' · ' + RIV.split(' ')[0] + ' ' + b }; }
    },
    {
      id: 'thaw', n: 3, title: 'The Thaw', gens: 3, plan: 'race',
      story: [
        'At 0°C a free sea appears. The player who lifts the heat onto 0°C gets it.',
        RIV + ' lifts the heat too. Time your step to be the one that lands on 0°C.'
      ],
      goal: 'Finish 3 seasons ahead of ' + RIV + '.',
      lesson: 'Don’t set up your rival. One step short of a white mark is a gift to whoever moves next. Count the steps.',
      hint: 'In a full game, before you raise a gauge, check the next white mark: land on it yourself or stop two steps short.',
      setup: function () { return base(7303, { pl: [{ mc: 18, tr: 26, heat: 8, prod: { mc: 2, heat: 4 } }, { mc: 18, tr: 26, heat: 8, prod: { mc: 2, heat: 4 } }], temp: -4, oxy: 4, oceans: 3 }); },
      decisions: [
        { gen: 1, prompt: 'Temperature -4°C: 2 steps to the free ocean. Your move?', options: [
          { label: 'Burn 8 heat', sub: 'free · +1 temperature, +1 rating', moves: [{ t: 'heat' }], why: 'Now -2°C: one step from the free ocean, and ' + RIV + ' moves next.', naive: 1 },
          { label: 'Aquifer', sub: '18 credits · ocean, +1 rating', moves: [{ t: 'std', k: 'aquifer' }], why: 'Temperature stays at -4°C: two steps away, so no one can land on 0°C in one move.' }],
          teach: 'Whoever lands on 0°C gets the free ocean (+1 more rating). Count steps before you raise.' },
        { gen: 1, prompt: 'Temperature -2°C, one step from the free ocean.', when: function (G) { return G.temp === -2 && G.pl[0].heat >= 8; }, options: [
          { label: 'Burn 8 heat', sub: 'lands on 0°C · +1 rating +1 ocean', moves: [{ t: 'heat' }], why: 'You landed on 0°C: +1 rating for the step, +1 for the free ocean.' },
          { label: 'Keep the heat', sub: 'pass for now', moves: [], why: 'You kept the heat. ' + RIV + ' can take the 0°C step next season.', naive: 1 }],
          teach: 'A white mark pays the one who lands on it: here, 2 rating for one move.' }
      ],
      auto: 'heat',
      check: function (G) { var a = G.pl[0].tr, b = G.pl[1].tr; return { ok: a > b, line: 'Rating: you ' + a + ' · ' + RIV.split(' ')[0] + ' ' + b }; }
    }
  ];

  // ---------- placement picks (decisions where the board space is the choice) ----------
  function spaceScore(G, s, kind) {
    var OH = OHx(), M = OH.MAP, sp = M.spaces[s]; if (!sp) return -9;
    var free = sp.adj.filter(function (a) { return !G.tiles[a] && M.spaces[a] && !M.spaces[a].ocean; }).length;
    var mine = sp.adj.filter(function (a) { return G.tiles[a] && G.tiles[a].o === 0 && G.tiles[a].t === 'city'; }).length;
    if (kind === 'cityRoom') return free;
    if (kind === 'nextToCity') return mine * 10 + free;
    return 0;
  }
  // options for a placement decision: the best space and a worse one, both legal, with their consequence in words
  function placeOptions(G, d) {
    var OH = OHx(), sp = G.pending.d.spaces.filter(function (s) { return OH.MAP.spaces[s]; });
    var ranked = sp.map(function (s) { return { s: s, v: spaceScore(G, s, d.pick) }; }).sort(function (a, b) { return b.v - a.v || (a.s < b.s ? -1 : 1); });
    var good = ranked[0], bad = ranked[ranked.length - 1];
    if (!good) return [];
    var o = [];
    if (d.pick === 'cityRoom') {
      o.push({ space: good.s, label: 'Open ground', sub: good.v + ' free spaces around it', why: 'Room for ' + good.v + ' greenery around it: up to ' + good.v + ' points later.' });
      if (bad && bad.s !== good.s) o.push({ space: bad.s, label: 'Tight corner', sub: bad.v + ' free spaces around it', why: 'Only ' + bad.v + ' spaces can ever touch it: the city can score at most ' + bad.v + '.', naive: 1 });
    } else {
      o.push({ space: good.s, label: 'Touching your city', sub: '+1 point, +1 for the city', why: 'It touches your city: worth 2 points instead of 1.' });
      var far = ranked.filter(function (r) { return Math.floor(r.v / 10) === 0; })[0];
      if (far) o.push({ space: far.s, label: 'Away from the city', sub: '+1 point', why: 'Worth 1 point. A tile touching the city would have been worth 2.', naive: 1 });
    }
    return o;
  }
  function rivalPlace(G, hint) {
    var OH = OHx(), M = OH.MAP, sp = G.pending.d.spaces.slice();
    function sc(s) { if (!M.spaces[s]) return -99; var a = M.spaces[s].adj; return hint === 'rivalNear' ? a.filter(function (x) { return G.tiles[x] && G.tiles[x].o === 1 && G.tiles[x].t === 'city'; }).length * 10 + a.filter(function (x) { return !G.tiles[x]; }).length : a.filter(function (x) { return !G.tiles[x]; }).length; }
    sp.sort(function (a, b) { return sc(b) - sc(a) || (a < b ? -1 : 1); });
    return sp[0];
  }

  // ---------- the driver (same code for the page and for node tests) ----------
  // R = run state: { ch, step, done[], feed[], ended, result }
  function start(i) { var ch = CH[i]; ch.setup(); return { i: i, ch: ch, taken: {}, feed: [], ended: false, result: null }; }
  function auto(R) {
    var OH = OHx(), G = OH.G, k = R.ch.auto;
    if (k === 'cashin') { if (OH.stdOk(0, 'asteroid')) return { m: { t: 'std', k: 'asteroid' }, why: 'Your bank buys a comet strike: +1 rating.' }; }
    if (k === 'plant' && G.pl[0].plant >= OH.greenCost(0) && OH.legalSpaces(0, 'greenery').length && R.taken['1:2'] !== undefined) return { m: { t: 'green' }, why: 'New plants grow into a greenery.' };
    if (k === 'heat' && G.pl[0].heat >= 8 && G.temp < OH.TEMP_MAX) return { m: { t: 'heat' }, why: 'Your heat warms the air: +1 rating.' };
    if (k !== 'cashin' && OH.stdOk(0, 'asteroid') && G.gen > lastDecisionGen(R)) return { m: { t: 'std', k: 'asteroid' }, why: 'Your bank buys a comet strike: +1 rating.' };
    return { m: { t: 'pass' }, why: 'You keep the rest and pass.' };
  }
  function lastDecisionGen(R) { return R.ch.decisions.reduce(function (a, d) { return Math.max(a, d.gen); }, 0); }
  // the decision waiting for the player now, or null
  function decision(R) {
    var OH = OHx(), G = OH.G;
    if (R.ended || OH.sideToAct() !== 0) return null;
    var list = R.ch.decisions;
    for (var j = 0; j < list.length; j++) {
      var d = list[j], key = d.gen + ':' + j;
      if (R.taken[key] !== undefined || d.gen !== G.gen) continue;
      if (d.kind === 'place') {
        if (!(G.pending && G.pending.h === 'place' && G.pending.d.t === d.tile)) { if (j > 0 && R.taken[list[j - 1].gen + ':' + (j - 1)] === undefined) return null; continue; }
        if (d.pick === 'nextToCity' && !OHx().cities(0)) { R.taken[key] = 'skip'; continue; }
        var po = placeOptions(G, d); if (po.length < 2) { R.taken[key] = 'skip'; continue; }
        return { key: key, d: d, options: po };
      }
      if (G.pending || G.phase !== 'action') return null;
      if (d.when && !d.when(G)) continue;
      var ok = d.options.filter(function (o) { return !o.moves.length || legal(o.moves[0]); });
      if (ok.length < 2) { R.taken[key] = 'skip'; continue; }
      return { key: key, d: d, options: ok };
    }
    return null;
  }
  function choose(R, dec, idx) {
    var OH = OHx(), o = dec.options[idx];
    R.taken[dec.key] = idx; R.lastNaive = !!o.naive;
    if (o.space) OH.performMove({ t: 'place', s: o.space });
    else if (!o.moves.length) OH.performMove({ t: OH.G.acts === 1 ? 'end' : 'pass' });
    else o.moves.forEach(function (m) { OH.performMove(m); });
    R.endAfter = true;   // one decision = one turn (ended in advance once any placement is done)
    R.feed.push({ who: 0, t: o.why });
    return o.why;
  }
  // run everything that needs no decision; returns the list of {who, t} lines it produced (for the UI to animate)
  function advance(R, maxSteps) {
    var OH = OHx(), out = [], guard = 0;
    while (guard++ < (maxSteps || 400)) {
      var G = OH.G;
      if (G.gen > R.ch.gens || G.over || G.phase === 'final') { if (!R.ended) { R.ended = true; R.result = R.ch.check(G); } break; }
      if (decision(R)) break;
      var p = OH.sideToAct();
      if (p < 0) break;
      if (G.phase === 'research') { OH.performMove({ t: 'buy', ids: [] }); continue; }
      if (R.endAfter && p === 0 && !G.pending && G.phase === 'action') { R.endAfter = false; if (G.acts === 1) { OH.performMove({ t: 'end' }); continue; } }
      if (R.endAfter && p === 1) R.endAfter = false;
      if (G.pending && G.pending.h === 'place') {
        if (p === 1) { OH.performMove({ t: 'place', s: rivalPlace(G, R.rivalPlace) }); continue; }
        var best = G.pending.d.spaces.filter(function (s) { return OH.MAP.spaces[s]; }).sort(function (a, b) { return spaceScore(G, b, 'nextToCity') - spaceScore(G, a, 'nextToCity') || (a < b ? -1 : 1); })[0] || G.pending.d.spaces[0];
        OH.performMove({ t: 'place', s: best }); continue;
      }
      if (G.pending) { OH.performMove(G.pending.h === 'choose' ? { t: 'choose', i: G.pending.d.ok[0] } : { t: 'pickres', id: G.pending.d.cards[0] }); continue; }
      var a = p === 1 ? PLANS[R.ch.plan](G) : auto(R);
      if (p === 1) R.rivalPlace = a.place;
      if (G.acts === 1 && a.m.t === 'pass') a.m = { t: 'end' };
      if (!OH.performMove(a.m)) OH.performMove({ t: G.acts === 1 ? 'end' : 'pass' });
      if (a.m.t !== 'pass' && a.m.t !== 'end' || p === 1) out.push({ who: p, t: a.why, m: a.m });
    }
    R.feed = R.feed.concat(out);
    return out;
  }
  // a whole line for tests: pick(dec) returns the option index
  function play(i, pick) { var R = start(i), n = 0; while (!R.ended && n++ < 60) { advance(R); var d = decision(R); if (d) choose(R, d, pick(d)); } return R; }

  // ---------- SCENARIOS: the tutorial as a game. Each one = a built start position on the REAL engine, one objective, a par,
  // a fail rule and two hints. The player makes every move with the normal controls; nothing is clicked for them.
  function hexes(f) { var M = OHx().MAP; return M.order.filter(function (s) { var S = M.spaces[s]; return S && !S.reserved && f(S, s); }); }
  function landN(s) { var M = OHx().MAP; return M.spaces[s].adj.filter(function (a) { return M.spaces[a] && !M.spaces[a].ocean && !M.spaces[a].reserved; }).length; }
  function put(s, t, o) { OHx().G.tiles[s] = { t: t, o: t === 'ocean' ? -1 : o }; if (t === 'ocean') OHx().G.oceans++; }
  function midCity() { var c = hexes(function (S) { return !S.ocean && !S.bonus.length; }).sort(function (a, b) { return landN(b) - landN(a) || (a < b ? -1 : 1); })[0]; put(c, 'city', 0); return c; }
  function noRival(G) { G.pl[1].passed = true; G.noRival = true; return G; }
  function adjOcean(s) { var OH = OHx(), G = OH.G; return OH.MAP.spaces[s].adj.filter(function (a) { return G.tiles[a] && G.tiles[a].t === 'ocean'; }).length; }
  function myCities() { var G = OHx().G, o = []; for (var s in G.tiles) if (G.tiles[s].t === 'city' && G.tiles[s].o === 0 && OHx().MAP.spaces[s]) o.push(s); return o; }
  function bestSpace(f) { var G = OHx().G; return G.pending.d.spaces.slice().sort(function (a, b) { return f(b) - f(a) || (a < b ? -1 : 1); })[0]; }
  var SC = [
    { id: 'tiles', title: 'First greenery', learn: 'Tiles and the board',
      goal: 'Plant a greenery: +1 oxygen, +1 rating.', acts: 2, par: { acts: 1, mc: 0 },
      setup: function () { var G = noRival(base(8101, { pl: [{ mc: 6, plant: 8, tr: 20 }, {}], temp: -30 })); G.scCity = midCity(); return G; },
      win: function (G) { return OHx().greeneries(0) >= 1; },
      why: 'You got +1 rating because the greenery raised oxygen 1 step.',
      failWhy: 'No greenery yet. The leaf button under your plants turns 8 plants into a tile.',
      hints: ['Your 8 plants are a greenery waiting to happen. Look at the plants in your resource bar.', 'Tap the plants (8) in the resource bar, then a glowing hex next to your city, then Place here.'],
      learned: 'Greenery must go next to your own tiles when it can. Each one raises oxygen (+1 rating) and is 1 point.',
      solve: [{ t: 'green' }, function () { return { t: 'place', s: bestSpace(function (s) { return 0; }) }; }], wrong: [{ t: 'pass' }] },
    { id: 'stock', title: 'Stock and production', learn: 'Resources',
      goal: 'Get titanium production: play Cobalt Trawler.', acts: 2, par: { acts: 1 },
      setup: function () { return noRival(base(8102, { pl: [{ mc: 6, ti: 2, tr: 20, hand: ['p016', 'p031'] }, {}], temp: -30 })); },
      win: function (G) { return G.pl[0].prod.ti >= 1; },
      why: 'You could pay because titanium is worth 3 each on space cards. Now +1 titanium every round.',
      failWhy: 'Hot Wire Barrage spent your titanium, so Cobalt Trawler now costs more credits than you have.',
      fail: function (G) { return G.pl[0].played.indexOf('p031') >= 0 && !OHx().playable(0, 'p016'); },
      hints: ['Titanium (stock 2) is worth 3 credits each, but only on space cards. Both cards are space cards.', 'Play Cobalt Trawler first: 2 titanium pay 6, your 6 credits pay the rest.'],
      learned: 'Big number = stock you spend now. Small +N = production you get every round. Steel pays building cards, titanium space cards.',
      solve: [{ t: 'play', id: 'p016' }], wrong: [{ t: 'play', id: 'p031' }] },
    { id: 'global', title: 'The bonus dot', learn: 'Raise a global',
      goal: 'Raise the temperature to -24 °C (bonus dot) in 2 actions.', acts: 2, par: { acts: 2, mc: 9 },
      setup: function () { return noRival(base(8103, { pl: [{ mc: 16, heat: 5, tr: 20, hand: ['p031'] }, {}], temp: -28 })); },
      win: function (G) { return G.temp >= -24; },
      fail: function (G) { return G.pl[0].heat < 8 && G.pl[0].mc < 9; },
      why: 'You got 2 rating because each step is +1; landing on the -24 °C dot added +1 heat production.',
      failWhy: 'Out of fuel: under 8 heat and under 9 credits, nothing left can raise the temperature.',
      hints: ['Each temperature step costs one action. Which two steps are cheapest?', 'Hot Wire Barrage (9) gives a step AND 3 heat: then burn 8 heat for the second step. Cheaper than a comet strike (14).'],
      learned: 'Every global step is +1 rating. Landing on a dot pays a bonus to whoever lands there.',
      solve: [{ t: 'play', id: 'p031' }, { t: 'heat' }], wrong: [{ t: 'std', k: 'power' }] },
    { id: 'route', title: 'Card or project', learn: 'Standard projects vs cards',
      goal: 'Gain +3 rating with 30 credits, in 2 actions.', acts: 2, par: { acts: 2, mc: 23 },
      setup: function () { return noRival(base(8104, { pl: [{ mc: 30, tr: 20, prod: { energy: 1 }, hand: ['p039'] }, {}], temp: -20 })); },
      win: function (G, S) { return G.pl[0].tr >= S.tr0 + 3; },
      why: 'You got 3 rating for 23 credits because the card gave 2 steps for just 9.',
      failWhy: 'Two comet strikes cost 28 for +2. The card gives +2 for 9.',
      hints: ['Projects are always there, but a card can be cheaper per step. Compare credits per rating.', 'Play Mirror Tilt Program (+2 temperature for 9), then Projects > Comet strike (14).'],
      learned: 'Standard projects are your fallback. A good card usually buys rating cheaper than a project.',
      solve: [{ t: 'play', id: 'p039' }, { t: 'std', k: 'asteroid' }], wrong: [{ t: 'std', k: 'asteroid' }, { t: 'std', k: 'asteroid' }] },
    { id: 'adj', title: 'Between two seas', learn: 'Adjacency',
      goal: 'Build a city that touches 2 oceans (+2 credits each).', acts: 1, par: { acts: 1 },
      setup: function () {
        var G = noRival(base(8105, { pl: [{ mc: 27, tr: 20 }, {}], temp: -30 })), M = OHx().MAP;
        var land = hexes(function (S, s) { return !S.ocean && S.adj.filter(function (a) { return M.spaces[a] && M.spaces[a].ocean; }).length >= 2; })[2];
        M.spaces[land].adj.filter(function (a) { return M.spaces[a] && M.spaces[a].ocean; }).slice(0, 2).forEach(function (a) { put(a, 'ocean'); });
        G.scLand = land; return G;
      },
      win: function (G) { return myCities().some(function (s) { return adjOcean(s) >= 2; }); },
      fail: function (G) { return myCities().length > 0 && !myCities().some(function (s) { return adjOcean(s) >= 2; }); },
      why: 'You got 4 credits because your city touches 2 oceans (2 credits each).',
      failWhy: 'Your city touches fewer than 2 oceans. Look for land between the two blue ocean tiles.',
      hints: ['Every tile you place pays 2 credits for each ocean next to it.', 'Projects > City, then pick the land hex that touches BOTH ocean tiles.'],
      learned: 'Oceans next to a tile pay 2 credits each; hex icons pay their bonus. Cities never touch other cities.',
      solve: [{ t: 'std', k: 'city' }, function () { return { t: 'place', s: bestSpace(adjOcean) }; }],
      wrong: [{ t: 'std', k: 'city' }, function () { return { t: 'place', s: bestSpace(function (s) { return -adjOcean(s); }) }; }] },
    { id: 'req', title: 'Unlock a card', learn: 'Tags and requirements',
      goal: 'Play Tray Garden Rows. It needs 2% oxygen; the air has 1%.', acts: 2, par: { acts: 2 },
      setup: function () { var G = noRival(base(8106, { pl: [{ mc: 12, plant: 8, tr: 20, hand: ['p019'] }, {}], temp: -30, oxy: 1 })); midCity(); return G; },
      win: function (G) { return G.pl[0].played.indexOf('p019') >= 0; },
      fail: function (G) { return G.pl[0].mc < 11; },
      why: 'You could play it because your greenery raised oxygen to 2%.',
      failWhy: 'You spent the credits the card needs (11).',
      hints: ['A requirement is a gauge level. Can you raise oxygen without spending credits?', 'Plant a greenery with your 8 plants (oxygen 2%), then play the card.'],
      learned: 'Requirements sit under a card name: meet the gauge or tag count first, then play it.',
      solve: [{ t: 'green' }, function () { return { t: 'place', s: bestSpace(function () { return 0; }) }; }, { t: 'play', id: 'p019' }], wrong: [{ t: 'std', k: 'power' }] },
    { id: 'mile', title: 'Milestone race', learn: 'Milestones',
      goal: 'Claim Quartermaster (5 production kinds) before Greyline.', acts: 2, par: { acts: 2 },
      setup: function () { var G = base(8107, { pl: [{ mc: 20, tr: 20, prod: { mc: 1, steel: 1, plant: 1, heat: 1 } }, { mc: 20, tr: 20, prod: { mc: 1, steel: 1, ti: 1, plant: 1, heat: 1 } }], temp: -30 }); G.scPlan = 'mile'; return G; },
      win: function (G) { return G.milestones.quartermaster === 0; },
      fail: function (G) { return G.milestones.quartermaster === 1; },
      why: 'You got 5 points because the power plant gave you a 5th production kind and you claimed first.',
      failWhy: 'Greyline claimed Quartermaster first. You needed a 5th production kind, then 8 credits to claim.',
      hints: ['You have 4 production kinds. Which project adds a new one?', 'Projects > Power plant (11) adds energy production. Then Milestones > Quartermaster (8).'],
      learned: 'Milestones cost 8 and give 5 points, but only the first claimer gets each one.',
      solve: [{ t: 'std', k: 'power' }, { t: 'mile', k: 'quartermaster' }], wrong: [{ t: 'std', k: 'asteroid' }, { t: 'end' }] },
    { id: 'gens', title: 'Two seasons ahead', learn: 'Generations',
      goal: 'Plant a greenery from plants by the end of generation 3.', acts: 0, gens: 3, par: { acts: 2 },
      setup: function () { return noRival(base(8108, { pl: [{ mc: 14, tr: 10, prod: { plant: 2, energy: 1 }, hand: ['p020'] }, {}], temp: -30, oxy: 4 })); },
      win: function (G, S) { return S.greens > 0; },
      why: 'You made it because +2 plant production paid out every round: 8 plants by round 3.',
      failWhy: 'Plants grew too slowly. At +2 a round you reach 4 by round 3; +4 a round reaches 8.',
      hints: ['Production pays at the end of every round. What makes 8 plants by round 3?', 'Play Hydroponic Spindle now (+2 plant production), pass twice, then plant in round 3.'],
      learned: 'Production early pays every round after. Count rounds left before you choose engine or rating.',
      solve: [{ t: 'play', id: 'p020' }, { t: 'pass' }, { t: 'pass' }, { t: 'green' }, function () { return { t: 'place', s: bestSpace(function () { return 0; }) }; }], wrong: [{ t: 'std', k: 'asteroid' }, { t: 'pass' }, { t: 'pass' }, { t: 'pass' }] },
    { id: 'rival', title: 'The rival', learn: 'The rival',
      goal: 'Outscore Greyline after 3 generations.', acts: 0, gens: 3, par: { margin: 4 },
      setup: function () { var G = base(8109, { pl: [{ mc: 30, tr: 20, heat: 5, plant: 8, prod: { energy: 1, mc: 1 }, hand: ['p039', 'p031', 'p001'] }, { mc: 20, tr: 20 }], temp: -30 }); midCity(); G.scPlan = 'comets'; return G; },
      win: function (G, S) { return S.over && OHx().score(0).total > OHx().score(1).total; },
      fail: function (G, S) { return S.over && OHx().score(0).total <= OHx().score(1).total; },
      why: 'You won because you raised more steps than the rival each round.',
      failWhy: 'Greyline bought a comet strike every round while you waited.',
      hints: ['Greyline buys a comet strike whenever it can. Every step you raise is a point.', 'Play your two temperature cards, burn heat, plant your greenery: 5 rating in round 1.'],
      learned: 'The rival races for the same rating. Act every round; passing early only helps it.',
      policy: 'hard', wrong: 'pass' },
    { id: 'grad', title: 'Graduation', learn: 'A mini game',
      goal: 'Beat the normal rival in a 5-generation game.', acts: 0, gens: 5, par: { margin: 6 },
      setup: function () {
        var G = base(8110, { pl: [{ mc: 40, tr: 22 }, { mc: 40, tr: 22 }], temp: -12, oxy: 6, oceans: 4 });
        [0, 1].forEach(function (p) { for (var i = 0; i < 6; i++) G.pl[p].hand.push(G.deck.pop()); G.pl[p].prod.mc = 2; G.pl[p].prod.plant = 1; G.pl[p].prod.heat = 1; });
        G.scPlan = 'ai'; return G;
      },
      win: function (G, S) { return S.over && OHx().score(0).total > OHx().score(1).total; },
      fail: function (G, S) { return S.over && OHx().score(0).total <= OHx().score(1).total; },
      why: 'You beat a real rival. You are ready for a full game.',
      failWhy: 'The rival scored more. Count points: rating, tiles, cards, milestones.',
      hints: ['Use the bulb at the top for a suggested move any time.', 'Raise globals with cheap cards first, claim a milestone if you can, plant every 8 plants.'],
      learned: 'A full game is this, longer: about 10-12 generations to fill all three gauges.',
      policy: 'hard', wrong: 'pass' }
  ];
  // W733: five more one-rule lessons (oceans, greenery next to a city, awards, selling cards, card actions)
  SC.push(
    { id: 'ocean', title: 'Make an ocean', learn: 'Oceans',
      goal: 'Put an ocean on the map: +1 rating.', acts: 1, par: { acts: 1 },
      setup: function () { return noRival(base(8115, { pl: [{ mc: 18, tr: 20 }, {}], temp: -30 })); },
      win: function (G) { return G.oceans >= 1; },
      why: 'You got +1 rating because every ocean placed raises the ocean gauge.',
      failWhy: 'No ocean yet. Projects > Aquifer (18 credits) places one.',
      hints: ['Oceans come from the Projects list. Which project adds water?', 'Projects > Aquifer (18), then tap a glowing blue ocean space, then Place here.'],
      learned: 'Oceans only go on the blue ocean spaces. Each one is +1 rating; there are 9 in all.',
      solve: [{ t: 'std', k: 'aquifer' }, function () { return { t: 'place', s: bestSpace(function () { return 0; }) }; }], wrong: [{ t: 'pass' }] },
    { id: 'score', title: 'Garden by a city', learn: 'Greenery points',
      goal: 'Get 2 points from one greenery.', acts: 1, par: { acts: 1 },
      setup: function () {
        var G = noRival(base(8111, { pl: [{ mc: 0, plant: 8, tr: 20 }, {}], temp: -30 })), M = OHx().MAP, c = midCity();
        var near = [c].concat(M.spaces[c].adj), far = hexes(function (S, s) { return !S.ocean && !S.bonus.length && near.indexOf(s) < 0 && S.adj.every(function (a) { return near.indexOf(a) < 0; }); })[0];
        put(far, 'greenery', 0); G.scCity = c; return G;
      },
      win: function (G) { return OHx().greeneries(0) >= 2 && OHx().score(0).city >= 1; },
      fail: function (G) { return OHx().greeneries(0) >= 2 && OHx().score(0).city < 1; },
      why: 'You got 2 points because a greenery is 1 point, plus 1 for touching your city.',
      failWhy: 'Your new greenery does not touch your city, so it scores 1 point, not 2.',
      hints: ['At the end, every greenery next to your city gives that city 1 more point.', 'Tap the plants (8), then a glowing hex right next to your city.'],
      learned: 'Each greenery is 1 point. Each greenery touching your city gives 1 more point.',
      solve: [{ t: 'green' }, function () { var c = OHx().G.scCity, A = OHx().MAP.spaces[c].adj; return { t: 'place', s: bestSpace(function (s) { return A.indexOf(s) >= 0 ? 1 : 0; }) }; }],
      wrong: [{ t: 'green' }, function () { var c = OHx().G.scCity, A = OHx().MAP.spaces[c].adj; return { t: 'place', s: bestSpace(function (s) { return A.indexOf(s) >= 0 ? 0 : 1; }) }; }] },
    { id: 'award', title: 'Fund an award', learn: 'Awards',
      goal: 'Fund an award that you are winning.', acts: 1, par: { acts: 1 },
      setup: function () { return noRival(base(8112, { pl: [{ mc: 8, steel: 5, ti: 2, tr: 20 }, { tr: 20, prod: { energy: 2, heat: 2 } }], temp: -30 })); },
      win: function (G) { return G.awards.length > 0 && OHx().score(0).award - OHx().score(1).award >= 5; },
      fail: function (G) { return G.awards.length > 0 && OHx().score(0).award - OHx().score(1).award < 5; },
      why: 'You got 5 points because you have the most steel + titanium: Outfitter is yours.',
      failWhy: 'You do not lead that award. A tie pays both players; behind pays nothing.',
      hints: ['Awards pay 5 points to whoever leads at the end. Where do you lead?', 'Awards > Outfitter: you have 7 steel + titanium, the rival has 0.'],
      learned: 'Awards cost 8, 14, then 20. At the end the leader gets 5 points, even if the rival funded it.',
      solve: [{ t: 'award', k: 'outfitter' }], wrong: [{ t: 'award', k: 'gridkeeper' }] },
    { id: 'sell', title: 'Sell cards', learn: 'Selling cards',
      goal: 'Play Mirror Tilt Program (9). You have 8 credits.', acts: 2, par: { acts: 2 },
      setup: function () { return noRival(base(8113, { pl: [{ mc: 8, tr: 20, prod: { energy: 1 }, hand: ['p039', 'p020', 'p019'] }, {}], temp: -30 })); },
      win: function (G) { return G.pl[0].played.indexOf('p039') >= 0; },
      fail: function (G) { return G.pl[0].played.indexOf('p039') < 0 && G.pl[0].hand.indexOf('p039') < 0; },
      why: 'You could pay 9 because selling a card you cannot use gave 1 credit.',
      failWhy: 'You sold Mirror Tilt Program itself. Sell a card you cannot play yet.',
      hints: ['Two of your cards need more oxygen than the air has. What are they worth to you now?', 'Projects > Sell cards: sell Hydroponic Spindle (+1), then play Mirror Tilt Program.'],
      learned: 'Any card in your hand sells for 1 credit (Projects > Sell cards).',
      solve: [{ t: 'sell', ids: ['p020'] }, { t: 'play', id: 'p039' }], wrong: [{ t: 'sell', ids: ['p039'] }] },
    { id: 'act', title: 'Card actions', learn: 'Card actions',
      goal: 'Gain 2 rating this round with your 16 heat.', acts: 2, par: { acts: 2 },
      setup: function () { var G = noRival(base(8114, { pl: [{ mc: 0, heat: 16, tr: 20 }, {}], temp: -30 })); G.pl[0].played.push('p142'); return G; },
      win: function (G, S) { return G.pl[0].tr >= S.tr0 + 2; },
      fail: function (G, S) { return G.pl[0].tr < S.tr0 + 2 && (G.pl[0].heat < 8 || (G.pl[0].used.p142 && G.pl[0].heat < 8)); },
      why: 'You got 2 rating because the Kiln action and burning heat each gave 1.',
      failWhy: 'Out of heat for the second rating. The Kiln gives +1 rating once per round.',
      hints: ['A card action works once per round. What else turns 8 heat into rating?', 'Actions > Kiln: 8 heat for +1 rating. Then tap your heat (8) for +1 temperature.'],
      learned: 'Blue cards have an action you may use once every round (the Actions button).',
      solve: [{ t: 'act', id: 'p142', i: 0 }, { t: 'heat' }], wrong: [{ t: 'act', id: 'p142', i: 1 }, { t: 'heat' }] }
  );
  SC.forEach(function (c, i) { c.n = i + 1; });
  function sStart(i) { var c = SC[i], G = c.setup(); G.scenario = c.id; G.log.push({ p: -1, s: 'Scenario: ' + c.title + '.' }); return { i: i, sc: c, acts: 0, spent: 0, greens: 0, tr0: G.pl[0].tr, ended: false, over: false, result: null }; }
  // record one of the player's moves (call with the credits before the move)
  function sNote(S, m, mc0) {
    var G = OHx().G;
    if (['pass', 'end', 'place', 'choose', 'pickres', 'buy', 'done'].indexOf(m.t) < 0) S.acts++;
    if (m.t === 'green') S.greens++;
    S.spent += Math.max(0, mc0 - G.pl[0].mc);
  }
  function stars(S) { var p = S.sc.par, G = OHx().G; if (p.margin !== undefined) { var d = OHx().score(0).total - OHx().score(1).total; return d >= p.margin ? 3 : d >= 2 ? 2 : 1; } return S.acts <= p.acts && (p.mc === undefined || S.spent <= p.mc) ? 3 : S.acts <= p.acts + 1 ? 2 : 1; }
  // decide win/fail; returns the result once the scenario ended
  function sCheck(S) {
    if (S.ended) return S.result;
    var OH = OHx(), G = OH.G, c = S.sc, gens = c.gens || 1;
    S.over = G.over || G.phase === 'final' || G.gen > gens;
    var placing = G.pending && G.pending.p === 0;
    if (!placing && c.win(G, S)) { S.ended = true; S.result = { ok: true, stars: stars(S), line: c.why }; }
    else if ((c.fail && c.fail(G, S)) || (c.acts && S.acts >= c.acts && !placing && !G.pending) || S.over) { S.ended = true; S.result = { ok: false, stars: 0, line: c.failWhy }; }
    return S.result;
  }
  function rivalMove(S) {
    var OH = OHx(), G = OH.G, k = G.scPlan;
    if (G.noRival || !k) return { t: G.phase === 'final' ? 'done' : G.acts === 1 ? 'end' : 'pass' };
    if (k === 'mile') return OH.mileOk(1, 'quartermaster') ? { t: 'mile', k: 'quartermaster' } : { t: 'pass' };
    if (k === 'ai') return (root.OHAI || require('./ai.js')).decide('normal');
    if (G.phase === 'final') return { t: 'done' };
    var a = PLANS[k](G).m; return a.t === 'pass' && G.acts === 1 ? { t: 'end' } : a;
  }
  // play every move that is not the player's (research, the rival, its placements); returns rival moves made
  function sAuto(S) {
    var OH = OHx(), out = [], n = 0;
    while (n++ < 200) {
      var G = OH.G; if (sCheck(S) || G.over) break;
      var p = OH.sideToAct(); if (p < 0) break;
      if (G.phase === 'research') { OH.performMove({ t: 'buy', ids: [] }); continue; }
      if (p === 0) break;
      if (G.pending && G.pending.h === 'place') { OH.performMove({ t: 'place', s: rivalPlace(G, 'rivalNear') }); continue; }
      if (G.pending) { OH.performMove(G.pending.h === 'choose' ? { t: 'choose', i: G.pending.d.ok[0] } : { t: 'pickres', id: G.pending.d.cards[0] }); continue; }
      var m = rivalMove(S) || { t: 'pass' };
      if (!OH.performMove(m)) OH.performMove({ t: G.phase === 'final' ? 'done' : G.acts === 1 ? 'end' : 'pass' });
      out.push(m);
    }
    return out;
  }
  // node + tests: run a scenario with a list of moves (or a policy) and return the run state
  function sRun(i, moves) {
    var OH = OHx(), S = sStart(i), j = 0, guard = 0; sAuto(S);
    while (!S.ended && guard++ < 300) {
      var m;
      if (moves === 'hard' || moves === 'pass') { var G = OH.G; m = moves === 'pass' ? (G.pending ? OH.validMoves()[0] : { t: G.phase === 'final' ? 'done' : G.acts === 1 ? 'end' : 'pass' }) : (root.OHAI || require('./ai.js')).decide('hard'); }
      else { if (j >= moves.length) break; m = moves[j++]; if (typeof m === 'function') m = m(); }
      var mc0 = OH.G.pl[0].mc;
      if (!OH.performMove(m)) return { S: S, bad: m };
      sNote(S, m, mc0); sAuto(S);
    }
    sCheck(S); return { S: S };
  }

  var OHC = root.OHC = { SC: SC, sStart: sStart, sNote: sNote, sCheck: sCheck, sAuto: sAuto, sRun: sRun, CH: CH, start: start, advance: advance, decision: decision, choose: choose, play: play, YOU: YOU, RIV: RIV };
  if (isNode) module.exports = OHC;
})(typeof window !== 'undefined' ? window : globalThis);
