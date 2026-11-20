// Wickdeep: a helper that plays heroes (used for the hint and for the automated test games). Monsters use the rules' own AI in engine.js.
(function (g) {
  'use strict';
  var D = g.WDD, E = g.WD;
  function foes(G, f) { return G.figs.filter(function (o) { return o.team !== f.team && o.pos && (o.kind !== 'obj' || f.team === 'h'); }); }
  function nearestFoeDist(G, f, k) { var best = 99; foes(G, f).forEach(function (o) { var d = E.dist(k || f.pos, o.pos); if (d < best) best = d; }); return best; }
  // goal hexes the party should head for when no monster is in sight
  function goalHexes(G) {
    var sc = D.SCEN[G.sc], out = [];
    Object.keys(G.hex).forEach(function (k) {
      var h = G.hex[k]; if (!E.seen(G, k)) return;
      if ((sc.goal.t === 'escape' || sc.goal.t === 'reach') && h.ex) out.push(k);
      if (sc.goal.t === 'loot' && h.tr) out.push(k);
      if (h.t === 'door' && !h.open) out.push(k);
    });
    return out;
  }
  // walking distance from a set of hexes (walls and pillars respected, doors passable)
  function field(G, targets) {
    var F = {}, q = targets.slice(); targets.forEach(function (k) { F[k] = 0; });
    for (var i = 0; i < q.length; i++) { var k = q[i]; E.nb(k).forEach(function (n) { var h = G.hex[n]; if (!h || F[n] != null || h.t === 'o' || !E.seen(G, n)) return; F[n] = F[k] + 1; q.push(n); }); }
    return F;
  }
  function halfValue(G, f, text, isTop) {
    var v = 0, acts = E.parse(text), near = nearestFoeDist(G, f), hurt = f.max - f.hp;
    var hasAtk = acts.some(function (a) { return a.t === 'atk'; }), mv = 0;
    acts.forEach(function (a) { if (a.t === 'move') mv = a.v; });
    acts.forEach(function (a) {
      switch (a.t) {
        case 'atk': { var reachD = (a.r || 1) + mv + (f.cond.imm ? -mv : 0); var can = near <= reachD + 2; v += (a.v + 1) * (a.tg || 1) * (a.all || a.splash ? 1.6 : 1) * (can ? 1 : 0.15) + (a.cond ? a.cond.length * 0.8 : 0); break; }
        case 'move': v += a.v * (near > 1 ? 0.8 : 0.25) + (a.jump ? 0.5 : 0); break;
        case 'heal': v += Math.min(a.v, a.r ? Math.max(hurt, 2) : hurt) * (a.all ? 1.5 : 1.1); break;
        case 'shield': v += a.v * (near <= 4 ? 1.4 : 0.3); break;
        case 'retal': v += a.v * (near <= 3 ? 1.2 : 0.2); break;
        case 'pers': v += a.v * a.n * 0.7; break;
        case 'summon': v += 5; break;
        case 'blessall': v += 2; break;
        case 'loot': v += 0.5; break;
        case 'xp': v += a.v * 0.25; break;
        case 'lost': v -= (f.hand.length + f.disc.length > 6 ? 2.5 : 4); break;
        case 'infuse': v += 0.4; break;
        case 'selfc': v += 1.5; break;
        case 'recover': v += f.disc.length ? 2 : 0; break;
      }
      if (a.use && G.el[a.use.e] > 0) v += 1.2;
    });
    return v;
  }
  function pairValue(G, f, a, b) {
    var A = D.CARD[a], B = D.CARD[b];
    var v1 = Math.max(halfValue(G, f, A.top, 1), 2.5) + Math.max(halfValue(G, f, B.bot, 0), 1.6);
    var v2 = Math.max(halfValue(G, f, B.top, 1), 2.5) + Math.max(halfValue(G, f, A.bot, 0), 1.6);
    var near = nearestFoeDist(G, f), ini = Math.min(A.i, B.i);
    return Math.max(v1, v2) + (near <= 3 ? (50 - ini) * 0.01 : 0);
  }
  function choose(G, lvl) {
    var mv = E.validMoves(G); if (!mv.length) return null;
    var A = G.ask, f = A.id ? E.fig(G, A.id) : null;
    var im = mv.filter(function (m) { return m.t === 'item'; });
    for (var ii = 0; ii < im.length; ii++) {
      var it = D.ITEM_BY[f.items[im[ii].i].id], near = nearestFoeDist(G, f);
      if ((it.k === 'heal' || it.k === 'cure') && f.hp * 2 <= f.max) return im[ii];
      if (it.k === 'stamina' && f.hand.length <= 3 && f.disc.length >= 2) return im[ii];
      if ((it.k === 'shd' || it.k === 'ret') && A.h === 'first' && near <= 3 && it.k !== 'x') return im[ii];
      if ((it.k === 'atk' || it.k === 'adv') && A.h === 'target') return im[ii];
      if (it.k === 'str' && A.h === 'target' && f.hp < f.max) return im[ii];
    }
    switch (A.h) {
      case 'sel': {
        // one hero at a time
        var hid = mv[0].id, h = E.fig(G, hid), mine = mv.filter(function (m) { return m.id === hid; });
        var lr = mine.filter(function (m) { return m.t === 'lrest'; })[0];
        if (lr && (h.hand.length < 2 || (h.hand.length <= 3 && h.disc.length >= 3 && h.hp * 2 < h.max) || (h.hand.length <= 2 && h.disc.length >= 4))) return lr;
        var best = null, bv = -1e9;
        mine.forEach(function (m) { if (m.t !== 'sel') return; var v = pairValue(G, h, m.cards[0], m.cards[1]); if (v > bv) { bv = v; best = m; } });
        return best || mine[0];
      }
      case 'first': case 'second': {
        var best2 = null, bv2 = -1e9;
        mv.forEach(function (m) {
          if (m.t !== 'half') return;
          var c = D.CARD[m.c], text = m.basic ? (m.h === 'top' ? 'a2' : 'm2') : (m.h === 'top' ? c.top : c.bot);
          var v = halfValue(G, f, text, m.h === 'top');
          if (A.h === 'first') { var other = f.sel.filter(function (x) { return x !== m.c; })[0], oc = D.CARD[other]; v += Math.max(halfValue(G, f, m.h === 'top' ? oc.bot : oc.top, m.h !== 'top'), 1.6); }
          if (m.basic) v -= 0.3;
          // prefer moving before attacking when nothing is in reach
          if (A.h === 'first' && /^m|^j/.test(text) && nearestFoeDist(G, f) > 1) v += 0.6;
          if (v > bv2) { bv2 = v; best2 = m; }
        });
        return best2;
      }
      case 'move': {
        var act = G.act.q.slice(G.act.i + 1), atk = act.filter(function (a) { return a.t === 'atk'; })[0];
        var range = atk ? (atk.r || 1) : 1, fs = foes(G, f), gl = goalHexes(G);
        var bestK = null, bs = -1e9, FF = field(G, fs.map(function (o) { return o.pos; })), GF = field(G, gl);
        A.hexes.forEach(function (k) {
          var s = 0, d = FF[k] != null ? FF[k] : 99;
          if (atk && fs.some(function (o) { return E.dist(k, o.pos) <= range && E.los(G, k, o.pos); })) s += 100 - (range > 1 && d === 1 ? 30 : 0);
          var sc = D.SCEN[G.sc];
          if (sc.goal.t === 'escape' || sc.goal.t === 'reach') { var gd = GF[k] != null ? GF[k] : 99; if (gd < 99) s -= gd * 6; if (G.hex[k].ex) s += 60; }
          if (sc.goal.t === 'loot' && G.hex[k].tr) s += 80;
          if (fs.length && d < 99) s -= d * 3; else { var gdd = GF[k] != null ? GF[k] : 99; s -= gdd * 4; }
          if (G.hex[k].coin) s += 2;
          if (G.hex[k].t === 'trap') s -= 25; if (G.hex[k].t === 'haz') s -= 8;
          if (f.hp <= 3 && fs.length && d <= 1) s -= 10;
          if (s > bs) { bs = s; bestK = k; }
        });
        // stay put if moving makes things worse and nothing to chase
        return bestK ? { t: 'hex', k: bestK } : { t: 'skip' };
      }
      case 'target': {
        var a = A.a, bestT = null, bt = -1e9;
        A.ids.forEach(function (id) { var o = E.fig(G, id), dmg = a.v - E.shieldOf(G, o) + (o.cond.poi ? 1 : 0); var s = (dmg >= o.hp ? 50 : 0) - o.hp + (o.kind === 'boss' ? 5 : 0) + (o.kind === 'obj' ? 8 : 0) + (o.elite ? 2 : 0); if (s > bt) { bt = s; bestT = id; } });
        return { t: 'tgt', id: bestT };
      }
      case 'heal': { var bh = null, br = 2; A.ids.forEach(function (id) { var o = E.fig(G, id), r = o.hp / o.max; if (r < br) { br = r; bh = id; } }); return { t: 'tgt', id: bh }; }
      case 'summon': { var bk = null, bd = 99; A.hexes.forEach(function (k) { var d = nearestFoeDist(G, f, k); if (d < bd) { bd = d; bk = k; } }); return { t: 'hex', k: bk || A.hexes[0] }; }
      case 'recover': return mv[0];
      case 'lrest': { var low = null, lv = 1e9; f.disc.forEach(function (c) { var C = D.CARD[c], v = halfValue(G, f, C.top, 1) + halfValue(G, f, C.bot, 0); if (v < lv) { lv = v; low = c; } }); return { t: 'lose', c: low }; }
      case 'srest': return (A.must || f.hand.length <= 2) ? { t: 'srest' } : { t: 'nosrest' };
      case 'srest2': return { t: 'srest' };
      case 'stunned': return { t: 'ok' };
      case 'block': {
        var left = f.hand.length + f.disc.length;
        if (left <= 2) return { t: 'take' };
        if (f.disc.length >= 2 && f.hand.length >= 3) return { t: 'block2' };
        var okc = mv.filter(function (m) { return m.t === 'block'; }).map(function (m) { return m.c; });
        var cheap = null, cv = 1e9; okc.forEach(function (c) { var C = D.CARD[c], v = halfValue(G, f, C.top, 1) + halfValue(G, f, C.bot, 0); if (v < cv) { cv = v; cheap = c; } });
        return (okc.length >= 2 && cheap) ? { t: 'block', c: cheap } : (f.disc.length >= 2 ? { t: 'block2' } : { t: 'take' });
      }
    }
    return mv[0];
  }
  g.WDAI = { choose: choose, halfValue: halfValue, pairValue: pairValue };
})(typeof window !== 'undefined' ? window : globalThis);
