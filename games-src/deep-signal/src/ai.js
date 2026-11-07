/* Deep Signal crew AI. Uses only what that seat may know: its own hand, played cards, signals, the drone's face-up cards and voids shown by
   not following suit. Card play: sample hidden hands consistent with that knowledge, play the rest of the mission out with a cooperative
   heuristic, keep the card that completes the mission most often. */
var E = (typeof module !== 'undefined') ? require('./engine.js') : null;
var AIX = (function () {
  var eng = E || (typeof window !== 'undefined' ? window : global);
  function R(x) { return eng.rankOf(x); } function Su(x) { return eng.suitOf(x); }
  function clone(G) { return JSON.parse(JSON.stringify(G)); }
  var rs = 12345; function rnd() { rs = (rs * 1103515245 + 12345) & 0x7fffffff; return rs / 0x7fffffff; }
  function seedAI(s) { rs = (s >>> 0) || 1; }
  // ---------- knowledge
  function voids(G) { var v = []; for (var i = 0; i < G.n; i++) v.push({}); G.tricks.concat([{ cards: G.trick }]).forEach(function (t) { if (!t.cards.length) return; var ls = Su(t.cards[0].c); t.cards.forEach(function (x) { if (Su(x.c) !== ls) v[x.p][ls] = 1; }); }); return v; }
  function sample(G, me) {
    var S = clone(G), known = {}, i, q;
    S.hands[me].forEach(function (c) { known[c] = me; });
    for (q = 0; q < S.n; q++) { if (S.comm[q]) known[S.comm[q].c] = q; }
    if (S.dummy >= 0) { S.hands[S.dummy].forEach(function (c) { known[c] = S.dummy; }); }
    var gone = {}; S.tricks.forEach(function (t) { t.cards.forEach(function (x) { gone[x.c] = 1; }); }); S.trick.forEach(function (x) { gone[x.c] = 1; });
    var U = eng.deckAll().filter(function (c) { return !gone[c] && known[c] == null; });
    var need = [], vd = voids(S), sig = S.sig || [];
    for (q = 0; q < S.n; q++) { var kept = S.hands[q].filter(function (c) { return known[c] === q; }); need.push(q === me ? 0 : (S.dummy === q ? S.stacks.filter(function (s) { return s.length === 2; }).length : S.hands[q].length - kept.length)); S.hands[q] = kept; }
    function ok(c, q) { if (vd[q][Su(c)] && q !== S.dummy) return false; for (var j = 0; j < sig.length; j++) { var g = sig[j]; if (g.p !== q || Su(g.c) !== Su(c)) continue; if (g.pos === 'only') return false; if (g.pos === 'top' && R(c) > R(g.c)) return false; if (g.pos === 'bot' && R(c) < R(g.c)) return false; } return true; }
    for (var tries = 0; tries < 12; tries++) {
      var cap = need.slice(), as = {}, fail = false, order = U.slice().sort(function () { return rnd() - .5; });
      var elig = {}; order.forEach(function (c) { elig[c] = []; for (var q2 = 0; q2 < S.n; q2++) if (q2 !== me && cap[q2] > 0 && (tries < 10 ? ok(c, q2) : true)) elig[c].push(q2); });
      order.sort(function (a, b) { return elig[a].length - elig[b].length; });
      for (var k = 0; k < order.length; k++) { var c = order[k], e = elig[c].filter(function (q3) { return cap[q3] > 0; }); if (!e.length) { fail = true; break; } var tot = 0; e.forEach(function (x) { tot += cap[x]; }); var r = rnd() * tot, pick = e[0]; for (var z = 0; z < e.length; z++) { r -= cap[e[z]]; if (r <= 0) { pick = e[z]; break; } } as[c] = pick; cap[pick]--; }
      if (!fail) { Object.keys(as).forEach(function (c) { S.hands[as[c]].push(c); }); break; }
      if (tries === 11) { var rest = U.slice(); for (q = 0; q < S.n; q++) while (S.hands[q].length < (q === me ? G.hands[me].length : need[q] + S.hands[q].length) && rest.length) { S.hands[q].push(rest.pop()); } }
    }
    if (S.dummy >= 0) { S.dummy = -1; S.stacks = null; }
    S.hands.forEach(eng.sortHand); return S;
  }
  // ---------- heuristic (full information inside a sample)
  function openTaskOf(S) { var m = {}; S.tasks.forEach(function (t) { if (!t.done) m[t.card] = t; }); return m; }
  function trickScore(S, cards, w, tasks) {
    var sc = 0, sp = S.mission.sp || '', wc = null;
    cards.forEach(function (x) { if (x.p === w) wc = x.c; var t = tasks[x.c]; if (t) { if (t.owner === w && eng.taskAllowed(S, t)) sc += 100; else sc -= 1000; } });
    if (S.chosen >= 0 && /notrick/.test(sp) && w === S.chosen) sc -= 1000;
    if (S.chosen >= 0 && /onetrick/.test(sp)) { if (w === S.chosen && S.won[S.chosen] >= 1) sc -= 1000; else if (w === S.chosen) sc += 60; }
    if (/sonars/.test(sp)) cards.forEach(function (x) { if (Su(x.c) === 'r') sc += x.c === wc ? 80 : -1000; });
    if (/sonar1/.test(sp)) cards.forEach(function (x) { if (x.c === 'r1') sc += wc === 'r1' ? 120 : -1000; });
    return sc;
  }
  function legalFor(S, q, trick) { var h = S.hands[q]; if (!trick.length) return h.slice(); var ls = Su(trick[0].c), f = h.filter(function (c) { return Su(c) === ls; }); return f.length ? f : h.slice(); }
  function cost(S, q, c, tasks) { var mine = S.tasks.some(function (t) { return !t.done && t.owner === q; }); return (Su(c) === 'r' ? 6 + R(c) : 0) + R(c) / 9 * (mine ? 2 : .6) + (tasks[c] ? 3 : 0); }
  function myopic(S, q, trick, tasks) {   // follower: best card looking only at this trick (the ones still to play may overtake)
    var L = legalFor(S, q, trick), best = null, bs = -1e9;
    L.forEach(function (c) {
      var t = trick.concat([{ p: q, c: c }]), w = eng.trickWinner(t), sc;
      if (t.length === S.n) sc = trickScore(S, t, w, tasks);
      else { sc = 0; t.forEach(function (x) { var tk = tasks[x.c]; if (tk) { if (tk.owner === w && eng.taskAllowed(S, tk)) sc += 60; else if (pendingCanTake(S, t, tk)) sc -= 30; else sc -= 800; } }); }
      sc -= cost(S, q, c, tasks);
      if (sc > bs) { bs = sc; best = c; }
    });
    return best;
  }
  function pendingCanTake(S, t, tk) {   // could the task's owner still win this trick (plays later)?
    if (!eng.taskAllowed(S, tk)) return false; var played = {}; t.forEach(function (x) { played[x.p] = 1; }); if (played[tk.owner]) return false;
    var w = eng.trickWinner(t), wc = t.filter(function (x) { return x.p === w; })[0].c;
    return legalFor(S, tk.owner, t).some(function (c) { return eng.trickWinner(t.concat([{ p: tk.owner, c: c }])) === tk.owner; }) || wc === null;
  }
  function heur(S, p) {
    var tasks = openTaskOf(S), L = legalFor(S, p, S.trick), best = L[0], bs = -1e9;
    if (L.length === 1) return L[0];
    L.forEach(function (c) {
      var t = S.trick.concat([{ p: p, c: c }]), q = p;
      while (t.length < S.n) { q = (q + 1) % S.n; var sv = S.hands[q]; var cq = myopic(S, q, t, tasks); if (cq == null) break; t.push({ p: q, c: cq }); }
      var w = eng.trickWinner(t), sc = trickScore(S, t, w, tasks) - cost(S, p, c, tasks);
      if (!S.trick.length) { // leading: prefer giving the lead to someone with open tasks, and leading suits where a teammate's task can be dumped
        if (S.tasks.some(function (x) { return !x.done && x.owner === w; })) sc += 4;
        S.tasks.forEach(function (x) { if (!x.done && x.owner === p && S.hands[p].indexOf(x.card) < 0 && Su(x.card) === Su(c) && R(c) > R(x.card)) sc += 3; });
      }
      if (sc > bs) { bs = sc; best = c; }
    });
    return best;
  }
  // full rollout from state S (already a sample), returns 1 on success, tiny partial credit otherwise
  function rollout(S) {
    var guard = 0;
    while (!S.result && S.phase === 'play' && guard++ < 80) { var c = heur(S, S.turn); if (!c) break; S.hands[S.turn].indexOf(c) >= 0 && playRaw(S, c); }
    if (S.result && S.result.ok) return 1;
    return S.tasks.filter(function (t) { return t.done && t.wonBy === t.owner; }).length * 0.01;
  }
  function playRaw(S, c) { return eng.performMove(S, { t: 'play', c: c }, eng.sideToAct(S)); }
  function choosePlay(G, p, level) {
    var L = eng.legalCards(G, p); if (L.length <= 1) return L[0];
    var n = level === 'easy' ? 0 : level === 'hard' ? 22 : 10;
    if (!n) return heur(sample(G, p), p);
    var tot = {}; L.forEach(function (c) { tot[c] = 0; });
    for (var i = 0; i < n; i++) { var S = sample(G, p); L.forEach(function (c) { var T = clone(S); playRaw(T, c); tot[c] += rollout(T); }); }
    var hs = heur(sample(G, p), p), best = null, bs = -1;
    L.forEach(function (c) { var v = tot[c] + (c === hs ? 0.05 : 0); if (v > bs) { bs = v; best = c; } });
    return best;
  }
  // ---------- drafting and answers (own hand only)
  function taskValue(G, p, card) {
    var h = G.hands[p], s = Su(card), r = R(card), mine = h.filter(function (c) { return Su(c) === s; }), hi = mine.filter(function (c) { return R(c) > r; }).length, rk = h.filter(function (c) { return Su(c) === 'r'; }).length;
    var v = 0; if (h.indexOf(card) >= 0) v += r >= 8 ? 5 : r >= 6 ? 2 : -1; v += hi * 1.1 + rk * .5; if (!mine.length) v -= 1.2;
    if (mine.length && Math.max.apply(null, mine.map(R)) === 9) v += 1.5;
    return v - G.tasks.filter(function (t) { return t.owner === p; }).length * 1.5;
  }
  function draftPick(G, p) { var best = 0, bs = -1e9; G.pool.forEach(function (t, i) { var v = taskValue(G, p, t.card) + (t.tok === '1' ? .3 : 0); if (v > bs) { bs = v; best = i; } }); return best; }
  function answer(G, p) {
    var h = G.hands[p], k = G.ask.kind, avg = h.reduce(function (a, c) { return a + (Su(c) === 'r' ? 10 : R(c)); }, 0) / h.length;
    if (k === 'notrick') return avg < 4.6 && !h.some(function (c) { return c === 'r4' || c === 'r3'; });
    if (k === 'onetrick') return h.filter(function (c) { return Su(c) === 'r' || R(c) >= 8; }).length === 1;
    var cards = k === 'dist' ? [G.pool[0].card] : G.pool.map(function (t) { return t.card; });
    var v = cards.reduce(function (a, c) { return a + taskValue(G, p, c); }, 0) / cards.length; return v > 1.5;
  }
  function choose(G) {
    var T = eng.chooseTargets(G), c = eng.crew(G), yes = [];
    for (var i = 1; i <= G.n; i++) { var p = (G.cap + i) % G.n; if (T.indexOf(p) >= 0 && G.answers[p]) yes.push(p); }
    if (G.ask.kind === 'dist' && T.indexOf(G.cap) >= 0 && taskValue(G, G.cap, G.pool[0].card) > 1.5) yes.unshift(G.cap);
    return yes.length ? yes[0] : T[Math.floor(rnd() * T.length)];
  }
  function commPick(G, p) {   // a signal worth sending now, or null
    if (!eng.canComm(G, p)) return null; var h = G.hands[p], best = null, bs = 0;
    h.forEach(function (c) {
      var pos = eng.commPos(G, p, c); if (!pos) return; var v = 0;
      G.tasks.forEach(function (t) { if (t.done) return; if (t.card === c && t.owner !== p) v += 6; if (t.owner === p && Su(t.card) === Su(c) && h.indexOf(t.card) < 0 && pos === 'top' && R(c) > R(t.card)) v += 4; if (t.owner !== p && Su(t.card) === Su(c) && pos === 'only') v += 2; });
      if (pos === 'only' && R(c) >= 8) v += 1;
      if (v > bs) { bs = v; best = c; }
    });
    return bs >= 2 ? best : null;
  }
  function act(G, seat, level) {   // the AI's next move for the seat that must act
    if (G.phase === 'draft') return { t: 'take', i: draftPick(G, G.draftTurn) };
    if (G.phase === 'ask') { var q = eng.askWho(G); if (q >= 0) return { t: 'answer', p: q, yes: answer(G, q) }; return { t: 'choose', p: choose(G) }; }
    if (G.phase === 'play') return { t: 'play', c: choosePlay(G, G.turn, level) };
    return null;
  }
  function randomAct(G) { var s = eng.sideToAct(G), v = eng.validMoves(G, s).filter(function (m) { return m.t !== 'comm'; }); return v[Math.floor(rnd() * v.length)]; }
  return { act: act, commPick: commPick, choosePlay: choosePlay, sample: sample, heur: heur, seed: seedAI, randomAct: randomAct, draftPick: draftPick, answer: answer, taskValue: taskValue };
})();
if (typeof module !== 'undefined') module.exports = AIX;
