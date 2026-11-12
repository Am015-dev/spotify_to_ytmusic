/* Computer drivers: look at their own hand, the track ahead and the cars around them. They never peek at other hands. */
function combos(a, k) {
  if (k === 0) return [[]]; var out = [];
  (function rec(s, cur) { if (cur.length === k) { out.push(cur.slice()); return; } for (var i = s; i < a.length; i++) { cur.push(a[i]); rec(i + 1, cur); cur.pop(); } })(0, []);
  return out;
}
function aiLvl(G, c) { return (c && c.lvl) || G.diff; }   /* per car level; 'pro' is the planner behind the Suggest button */
var AIP = { easy: { noise: 4.5, hw: 1.9, mis: 0.4, misBy: 3, lift: 0.4 }, normal: { noise: 1.6, hw: 1.6, mis: 0.08, misBy: 2 }, hard: { noise: 0.3, hw: 1.25, look: 1 }, pro: { noise: 0.15, hw: 1.25, look: 1 } };
function aiP(G, c) { return AIP[aiLvl(G, c)] || AIP.normal; }
function aiNoise(G, c) { return aiP(G, c).noise; }
function heatW(c, extra, G) { return (G ? aiP(G, c).hw : 1.25) + (c.eng - extra <= 2 ? 0.9 : 0); }
function aiPlan(G, c) {
  var N = T(G).N, avg = avgSpeed(c), best = null, handHeat = c.hand.filter(function (x) { return x === 'H'; }).length;
  var play = []; c.hand.forEach(function (x, j) { if (x !== 'H') play.push(j); });
  var adr = G.adr.indexOf(c.i) >= 0 ? 1 : 0, others = G.cars.filter(function (o) { return o !== c; });
  var lv = aiLvl(G, c), easy = lv === 'easy', P = aiP(G, c);
  var mis = P.mis && rnd(G) < P.mis ? P.misBy : 0;   /* rookies misjudge a corner now and then: this round they read every limit higher (spins, burnt heat). Easy often, Normal rarely */   /* easy rivals drive like careful rookies: never top gear, never boost (W496: a new player can reach the podium) */
  var lift = P.lift && rnd(G) < P.lift;   /* rookies sometimes hold their gear instead of shifting up */
  gearOpts(c).filter(function (go) { return !easy || (go.g <= 3 && (!lift || go.g <= c.gear)); }).forEach(function (go) {
    var k = needCards(c, go.g);
    combos(play, k).forEach(function (idx) {
      var base = 0, nx = 0, ul = 0, uc = 0; idx.forEach(function (j) { var x = c.hand[j], u = upgId(x); if (u) { base += UPG[u].sp; ul += UPG[u].lim; uc += UPG[u].cool; } else if (x === 'X') { base += avg; nx++; } else base += +x; });
      [false, true].forEach(function (boost) {
        var cost = go.cost + (boost ? 1 : 0); if (cost > c.eng || (boost && easy)) return;
        var sp = base + (boost ? avg : 0), safe = Math.ceil(sp + (nx || boost ? 1 : 0)), mv = Math.round(sp) + adr, L = c.pos + mv;
        var slipOk = others.some(function (o) { return o.pos % N === L % N || o.pos % N === (L + 1) % N; });
        var L2 = slipOk ? L + 2 : L, heat = cornerCost(G, c.pos, L2, safe, ul + mis), left = c.eng - cost, spin = heat > left;
        var score = mv * (P.mv || 1) + (slipOk ? 1.4 : 0) - heatW(c, cost, G) * (cost + Math.min(heat, left)) - (spin ? 16 : 0);
        var cw = P.cw || 1.6; score += go.g === 1 ? Math.min(handHeat, COOL[1]) * cw : go.g === 2 ? Math.min(handHeat, COOL[2]) * cw : 0;
        score += Math.min(handHeat, uc) * cw;
        if (boost && c.eng <= 3) score -= 2;
        if (P.look) score -= P.look * heatW(c, cost, G) * nextCornerRisk(G, c, idx, go.g, L2, avg, left - Math.min(heat, left));
        score += (rnd(G) - 0.5) * 2 * aiNoise(G, c);
        if (!best || score > best.s) best = { s: score, plan: { gear: go.g, idx: idx.slice(), boost: boost } };
      });
    });
  });
  if (!best) { var p = { gear: c.gear, idx: [], boost: false }; return { gear: p.gear, cards: [], boost: false }; }
  var pl = best.plan, cards = pl.idx.map(function (j) { return c.hand[j]; });
  c.hand = c.hand.filter(function (x, j) { return pl.idx.indexOf(j) < 0; });
  return { gear: pl.gear, cards: cards, boost: pl.boost, idx: pl.idx };
}
/* look one round ahead (hard and Suggest): if even the slowest free choice next round (one gear down, the smallest cards left in the
   hand) reaches the next corner too fast, count that heat now, more when it would not fit in the heat left (a spin) */
function nextCornerRisk(G, c, idx, g, L2, avg, heatLeft) {
  var vals = []; c.hand.forEach(function (x, j) { if (x === 'H' || idx.indexOf(j) >= 0) return; var u = upgId(x); vals.push(u ? UPG[u].sp : x === 'X' ? avg : +x); });
  var k = Math.max(1, g - 1); while (vals.length < k + 1) vals.push(avg); vals.sort(function (a, b) { return a - b; });
  var s = 0; for (var i = 0; i < k; i++) s += vals[i]; s = Math.round(s);
  var ks = cornersIn(G, L2, L2 + s); if (!ks.length) return 0;
  var over = 0; ks.forEach(function (q) { over += Math.max(0, s - q.limit); });
  return over > heatLeft ? over + 4 : over * 0.6;
}
function aiSlip(G, c, from, L0, L1, speed, lim) {
  var extra = cornerCost(G, from, L1, speed, lim) - cornerCost(G, from, L0, speed, lim), cost0 = cornerCost(G, from, L0, speed, lim);
  if (cost0 + extra > c.eng) return false;   /* would spin out */
  return 2 > heatW(c, 0) * extra;
}
function aiBoost(G, c) {   /* react step: boost only if the committed plan wanted it and the revealed speed + an average flip stays safe */
  var q = c.pl2; if (!c.plan || !c.plan.boost || c.eng < 1 || !q) return false;
  var add = avgSpeed(c), sp = q.speed + add, heat = cornerCost(G, q.from, landing(G, c, q.from + Math.round(sp)), Math.ceil(sp + 1), q.lim);
  return heat <= c.eng - 1;
}
/* Suggest: plans the player's own hand from the player's seat with the strongest planner ('pro'), on a copy of the game */
function suggestPlan(G, c) { var g2 = JSON.parse(JSON.stringify(G)), c2 = g2.cars[c.i]; c2.lvl = 'pro'; c2.human = false; return aiPlan(g2, c2); }
function suggestBoost(G, c) { var c2 = JSON.parse(JSON.stringify(c)); c2.lvl = 'pro'; c2.plan = { boost: true }; return aiBoost(G, c2); }
function suggestSlip(G, c) { var q = G.pend; if (!q || q.t !== 'slip') return false; var c2 = JSON.parse(JSON.stringify(c)); c2.lvl = 'pro'; return aiSlip(G, c2, q.from, q.L0, q.L1, q.speed, q.lim); }
