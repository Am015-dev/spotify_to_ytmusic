/* Computer drivers: look at their own hand, the track ahead and the cars around them. They never peek at other hands. */
function combos(a, k) {
  if (k === 0) return [[]]; var out = [];
  (function rec(s, cur) { if (cur.length === k) { out.push(cur.slice()); return; } for (var i = s; i < a.length; i++) { cur.push(a[i]); rec(i + 1, cur); cur.pop(); } })(0, []);
  return out;
}
function aiNoise(G) { return G.diff === 'easy' ? 3 : G.diff === 'hard' ? 0 : 0.7; }
function heatW(c, extra) { return 1.25 + (c.eng - extra <= 2 ? 0.9 : 0); }
function aiPlan(G, c) {
  var N = T(G).N, avg = avgSpeed(c), best = null, handHeat = c.hand.filter(function (x) { return x === 'H'; }).length;
  var play = []; c.hand.forEach(function (x, j) { if (x !== 'H') play.push(j); });
  var adr = G.adr.indexOf(c.i) >= 0 ? 1 : 0, others = G.cars.filter(function (o) { return o !== c; });
  gearOpts(c).forEach(function (go) {
    var k = needCards(c, go.g);
    combos(play, k).forEach(function (idx) {
      var base = 0, nx = 0; idx.forEach(function (j) { var x = c.hand[j]; if (x === 'X') { base += avg; nx++; } else base += +x; });
      [false, true].forEach(function (boost) {
        var cost = go.cost + (boost ? 1 : 0); if (cost > c.eng) return;
        var sp = base + (boost ? avg : 0), safe = Math.ceil(sp + (nx || boost ? 1 : 0)), mv = Math.round(sp) + adr, L = c.pos + mv;
        var slipOk = others.some(function (o) { return o.pos % N === L % N || o.pos % N === (L + 1) % N; });
        var L2 = slipOk ? L + 2 : L, heat = cornerCost(G, c.pos, L2, safe), left = c.eng - cost, spin = heat > left;
        var score = mv + (slipOk ? 1.4 : 0) - heatW(c, cost) * (cost + Math.min(heat, left)) - (spin ? 16 : 0);
        score += go.g === 1 ? Math.min(handHeat, COOL[1]) * 1.6 : go.g === 2 ? Math.min(handHeat, COOL[2]) * 1.6 : 0;
        if (boost && c.eng <= 3) score -= 2;
        score += (rnd(G) - 0.5) * 2 * aiNoise(G);
        if (!best || score > best.s) best = { s: score, plan: { gear: go.g, idx: idx.slice(), boost: boost } };
      });
    });
  });
  if (!best) { var p = { gear: c.gear, idx: [], boost: false }; return { gear: p.gear, cards: [], boost: false }; }
  var pl = best.plan, cards = pl.idx.map(function (j) { return c.hand[j]; });
  c.hand = c.hand.filter(function (x, j) { return pl.idx.indexOf(j) < 0; });
  return { gear: pl.gear, cards: cards, boost: pl.boost, idx: pl.idx };
}
function aiSlip(G, c, from, L0, L1, speed) {
  var extra = cornerCost(G, from, L1, speed) - cornerCost(G, from, L0, speed), cost0 = cornerCost(G, from, L0, speed);
  if (cost0 + extra > c.eng) return false;   /* would spin out */
  return 2 > heatW(c, 0) * extra;
}
