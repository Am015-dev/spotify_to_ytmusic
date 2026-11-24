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
        'The Assembly has signed your charter. ' + YOU + ' gets four seasons on Ochre and one rule: finish ahead of ' + RIV + '.',
        RIV + ' starts level with you. They are buying income cards: they plan to be rich in season 10.',
        'Your rating is your points, and every season it pays you its number in credits.'
      ],
      goal: 'Have more points than ' + RIV + ' when season 4 ends.',
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
        'Your settlers want a home, not a number. The Assembly will name the first garden city by season 3.',
        RIV + ' is building one too. A city scores 1 point for every greenery that touches it, yours or anyone’s.',
        'Where you put a tile matters as much as when.'
      ],
      goal: 'Score more points than ' + RIV + ' by the end of season 3.',
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
        'Season 3 of the new world. The ice line is close: at 0°C the first sea breaks through, a free ocean for whoever gets there.',
        RIV + ' raises the temperature every chance it gets. Every step is +1 rating for whoever raises it.',
        'The white mark at 0°C pays its ocean to the player who lands on it, not to the one who did the work before.'
      ],
      goal: 'Finish season 3 with more rating than ' + RIV + '.',
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

  var OHC = root.OHC = { CH: CH, start: start, advance: advance, decision: decision, choose: choose, play: play, YOU: YOU, RIV: RIV };
  if (isNode) module.exports = OHC;
})(typeof window !== 'undefined' ? window : globalThis);
