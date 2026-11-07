/* Wildmark scoring card sets B, C and D (set A lives in engine.js). G.cards = {bear:'a'|'b'|'c'|'d', ...}; WM.scoreAnimal(env, a, info, set).
   Patterns follow the rulebook summaries; point tables marked (guessed) in rules-notes.md where no table was found online. */
(function () {
  var W = window.WM, DIRS = W.DIRS, k = W.k, pk = W.pk, nb = W.nb;
  W.SETS = ['a', 'b', 'c', 'd'];
  W.CARDSX = {
    bear: { b: { title: 'Bear Trios', rule: 'Each group of exactly 3 bears scores 10.' }, c: { title: 'Mixed Dens', rule: 'Groups of 1, 2 or 3 bears score 2, 5, 8; +3 for one of each size.' }, d: { title: 'Big Dens', rule: 'Groups of 2, 3 or 4 bears score 5, 8, 13.' } },
    elk: { b: { title: 'Elk Herds', rule: 'Shapes of 1, 2, 3 (triangle) or 4 (diamond) elk score 2, 5, 9, 13.' }, c: { title: 'Elk Meadow', rule: 'Any connected group of elk scores by size: 2, 4, 7, 10, 14, 18, 23, 28.' }, d: { title: 'Elk Rings', rule: 'Elk curled around one space score by size: 2, 5, 8, 12, 16, 21.' } },
    salmon: { b: { title: 'Short Runs', rule: 'Salmon runs (each touching at most 2 salmon) of 1-5+: 2, 4, 9, 11, 17.' }, c: { title: 'Long Runs', rule: 'Only runs of 3, 4 or 5+ salmon score: 10, 12, 15.' }, d: { title: 'Busy Rivers', rule: 'Each run scores 1 per salmon plus 1 per other animal touching it.' } },
    hawk: { b: { title: 'Watching Hawks', rule: 'Lone hawks that can see another hawk in a straight line: 2-8+ score 5, 9, 12, 16, 20, 24, 28.' }, c: { title: 'Sight Lines', rule: 'Each straight line of sight between two hawks scores 3.' }, d: { title: 'Hawk Pairs', rule: 'Pairs of hawks in sight score 4, 7, 9, 11 for 1-4 kinds of animals between them.' } },
    fox: { b: { title: 'Fox Pairs Seen', rule: 'Each fox: 3, 5, 7 for 1, 2, 3 kinds of animal pairs next to it (not foxes).' }, c: { title: 'Fox Favourite', rule: 'Each fox: 1 point per animal of the most common kind next to it (not foxes).' }, d: { title: 'Fox Dens', rule: 'Each pair of foxes: 5, 7, 9, 11 for 1-4 kinds of animal pairs around it (not foxes).' } }
  };
  W.cardInfo = function (a, set) { return !set || set === 'a' ? W.CARDS[a] : W.CARDSX[a][set]; };
  function cells(env, a) { var o = []; for (var c in env) if (env[c].tok === a) o.push(c); return o; }
  function groups(env, a) { var seen = {}, out = []; cells(env, a).forEach(function (c) { if (seen[c]) return; var g = [], st = [c]; seen[c] = 1; while (st.length) { var x = st.pop(); g.push(x); nb(x).forEach(function (n) { if (!seen[n] && env[n] && env[n].tok === a) { seen[n] = 1; st.push(n); } }); } out.push(g); }); return out; }
  function tokAt(env, c, a) { return env[c] && env[c].tok === a; }
  function runs(env) { return groups(env, 'salmon').filter(function (g) { return g.every(function (x) { return nb(x).filter(function (y) { return tokAt(env, y, 'salmon'); }).length <= 2; }); }); }
  function sight(env, c) {   // hawks visible in straight lines (blocked by the first hawk), with the cells between
    var p = pk(c), out = [];
    for (var d = 0; d < 6; d++) { var q = p, between = []; for (var s = 0; s < 30; s++) { q = [q[0] + DIRS[d][0], q[1] + DIRS[d][1]]; var kk = k(q[0], q[1]); if (!env[kk]) break; if (env[kk].tok === 'hawk') { out.push({ c: kk, between: between }); break; } between.push(kk); } }
    return out;
  }
  function pairKinds(env, around, excl) {   // kinds with 2+ tokens among the cells
    var n = {}; around.forEach(function (y) { var t = env[y] && env[y].tok; if (t && t !== excl) n[t] = (n[t] || 0) + 1; }); return Object.keys(n).filter(function (t) { return n[t] >= 2; }).length;
  }
  var T = function (tab, i) { return tab[Math.max(0, Math.min(i, tab.length - 1))]; };
  W.scoreX = function (env, a, set, info) {
    var v = 0, lit = [];
    if (a === 'bear') {
      var gs = groups(env, 'bear'), sz = {};
      gs.forEach(function (g) { var n = g.length, p = 0;
        if (set === 'b' && n === 3) p = 10; if (set === 'c' && n <= 3) { p = [0, 2, 5, 8][n]; sz[n] = 1; } if (set === 'd' && n >= 2 && n <= 4) p = [0, 0, 5, 8, 13][n];
        if (p) { v += p; lit = lit.concat(g); } });
      if (set === 'c' && sz[1] && sz[2] && sz[3]) v += 3;
    } else if (a === 'elk') {
      groups(env, 'elk').forEach(function (g) {
        var n = g.length, p = 0;
        if (set === 'c') p = T([0, 2, 4, 7, 10, 14, 18, 23, 28], n);
        else if (set === 'b') { var rest = g.slice(), tab = [0, 2, 5, 9, 13];   // greedy: diamond(4) > triangle(3) > pair > single
          var adj = function (x, y) { return nb(x).indexOf(y) >= 0; };
          for (var want = 4; want >= 1; want--) { var found = true; while (found) { found = false; var pick = null;
            if (want === 1 && rest.length) pick = [rest[0]];
            if (want === 2) rest.some(function (x) { return rest.some(function (y) { if (x !== y && adj(x, y)) { pick = [x, y]; return true; } }); });
            if (want === 3) rest.some(function (x) { return rest.some(function (y) { return rest.some(function (z) { if (x < y && y < z && adj(x, y) && adj(y, z) && adj(x, z)) { pick = [x, y, z]; return true; } }); }); });
            if (want === 4) rest.some(function (x) { return rest.some(function (y) { if (x === y || !adj(x, y)) return false; var cm = rest.filter(function (z) { return z !== x && z !== y && adj(x, z) && adj(y, z); }); if (cm.length >= 2) { pick = [x, y, cm[0], cm[1]]; return true; } }); });
            if (pick) { found = true; p += tab[want]; rest = rest.filter(function (x) { return pick.indexOf(x) < 0; }); } } }
        } else if (set === 'd') {   // the largest set of the group's elk that all touch one common space
          var best = 1; var cand = {}; g.forEach(function (x) { nb(x).forEach(function (y) { cand[y] = 1; }); });
          Object.keys(cand).forEach(function (cc) { var m = g.filter(function (x) { return nb(x).indexOf(cc) >= 0; }).length; if (m > best) best = m; });
          p = T([0, 2, 5, 8, 12, 16, 21], best) + (n - best) * 2;
        }
        if (p) { v += p; lit = lit.concat(g); }
      });
    } else if (a === 'salmon') {
      runs(env).forEach(function (g) { var n = g.length, p = 0;
        if (set === 'b') p = T([0, 2, 4, 9, 11, 17], n); if (set === 'c') p = n >= 3 ? T([0, 0, 0, 10, 12, 15], n) : 0;
        if (set === 'd') { var ad = {}; g.forEach(function (x) { nb(x).forEach(function (y) { if (env[y] && env[y].tok && env[y].tok !== 'salmon') ad[y] = 1; }); }); p = n + Object.keys(ad).length; }
        if (p) { v += p; lit = lit.concat(g); } });
    } else if (a === 'hawk') {
      var hs = cells(env, 'hawk');
      if (set === 'b') { var q = hs.filter(function (x) { return !nb(x).some(function (y) { return tokAt(env, y, 'hawk'); }) && sight(env, x).some(function (s) { return s.between.length > 0; }); }); lit = q; v = q.length >= 2 ? T([0, 0, 5, 9, 12, 16, 20, 24, 28], q.length) : 0; }
      if (set === 'c') { var seen = {}; hs.forEach(function (x) { sight(env, x).forEach(function (s) { var key = [x, s.c].sort().join('|'); if (!seen[key] && s.between.length) { seen[key] = 1; v += 3; lit.push(x, s.c); } }); }); }
      if (set === 'd') { var used = {}, pairs = []; hs.forEach(function (x) { sight(env, x).forEach(function (s) { if (x < s.c && s.between.length) { var kinds = {}; s.between.forEach(function (y) { var t = env[y].tok; if (t && t !== 'hawk') kinds[t] = 1; }); pairs.push({ a: x, b: s.c, n: Object.keys(kinds).length }); } }); });
        pairs.sort(function (p1, p2) { return p2.n - p1.n; }).forEach(function (p1) { if (used[p1.a] || used[p1.b] || !p1.n) return; used[p1.a] = used[p1.b] = 1; v += T([0, 4, 7, 9, 11], p1.n); lit.push(p1.a, p1.b); }); }
    } else if (a === 'fox') {
      var fx = cells(env, 'fox');
      if (set === 'b' || set === 'c') fx.forEach(function (x) { var p = 0, ar = nb(x);
        if (set === 'b') p = T([0, 3, 5, 7], pairKinds(env, ar, 'fox'));
        else { var n = {}; ar.forEach(function (y) { var t = env[y] && env[y].tok; if (t && t !== 'fox') n[t] = (n[t] || 0) + 1; }); for (var t in n) p = Math.max(p, n[t]); }
        if (p) { v += p; lit.push(x); } });
      if (set === 'd') { var u = {}; fx.forEach(function (x) { nb(x).forEach(function (y) { if (!u[x] && !u[y] && tokAt(env, y, 'fox')) { u[x] = u[y] = 1; var ar = nb(x).concat(nb(y)).filter(function (z) { return z !== x && z !== y; }); ar = ar.filter(function (z, i) { return ar.indexOf(z) === i; }); var p = T([0, 5, 7, 9, 11], pairKinds(env, ar, 'fox')); if (p) { v += p; lit.push(x, y); } } }); }); }
    }
    if (info) info.lit = lit;
    return v;
  };
})();
