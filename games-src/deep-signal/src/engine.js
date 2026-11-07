/* Deep Signal rules engine: co-op trick taking with tasks. All state lives in one JSON-safe G (no functions).
   Seats 0..n-1 (seat 0 = the local player). 2 players: seat 2 is the dummy (7 stacks, top card face up), controlled by the captain's seat.
   Exposed: newGame(o), validMoves(seat), performMove(m, seat), sideToAct(), checkInvariants(), render_game_to_text(), trickWinner(cards), legalCards(G,p) */
var DS = (typeof window !== 'undefined' ? window : global);
var SUITS = ['c', 'k', 't', 'a'];                 // coral, kelp, tide, amber; 'r' = sonar (trump 1-4)
var SUIT_NAME = { c: 'Coral', k: 'Kelp', t: 'Tide', a: 'Amber', r: 'Sonar' };
var MISSIONS = DS.DS_MISSIONS || [];
function deckAll() { var d = []; SUITS.forEach(function (s) { for (var v = 1; v <= 9; v++) d.push(s + v); }); for (var r = 1; r <= 4; r++) d.push('r' + r); return d; }
function suitOf(c) { return c[0]; }
function rankOf(c) { return +c.slice(1); }
function cardName(c) { return SUIT_NAME[suitOf(c)] + ' ' + rankOf(c); }
function rngNext(G) { G.seed = (G.seed * 1664525 + 1013904223) >>> 0; return G.seed / 4294967296; }
function shuffle(G, a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rngNext(G) * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
function sortHand(h) { var o = { c: 0, k: 1, t: 2, a: 3, r: 4 }; return h.sort(function (x, y) { return o[x[0]] - o[y[0]] || rankOf(x) - rankOf(y); }); }
function missionDef(n) { for (var i = 0; i < MISSIONS.length; i++) if (MISSIONS[i].n === n) return MISSIONS[i]; return { n: n, k: 1, tok: [], sp: null }; }
function spHas(G, w) { var s = G.mission.sp || ''; return s.split('-').indexOf(w) >= 0 || s === w; }
function commAllowedNow(G) {
  var s = G.mission.sp || ''; if (spHas(G, 'nocomm')) return false;
  var m = /late(\d)/.exec(s); if (m && G.tricks.length < +m[1] - 1) return false; return true;
}
function isDead(G) { return spHas(G, 'dead'); }
/* o: {players 2-5, mission n, seed, humans:[seat...], twist} */
function newGame(o) {
  o = o || {}; var np = Math.max(2, Math.min(5, o.players || 4)), md = o.missionDef || missionDef(o.mission || 1);
  var G = { v: 1, np: np, n: np === 2 ? 3 : np, dummy: np === 2 ? 2 : -1, seed: (o.seed == null ? (Date.now() & 0x7fffffff) : o.seed) >>> 0, mission: JSON.parse(JSON.stringify(md)),
    hands: [], stacks: null, cmd: 0, ctrl: [], phase: 'draft', tasks: [], pool: [], draftTurn: 0, trick: [], lead: 0, turn: 0, tricks: [], won: [], comm: [], commUsed: [],
    flare: null, result: null, done: [], chosen: -1, ask: null, answers: [], distLeft: [], log: [], sig: [], human: o.humans || [0], twist: o.twist || null, moves: 0 };
  G.seed0 = G.seed;
  var d = shuffle(G, deckAll()), i;
  for (i = 0; i < G.n; i++) { G.hands.push([]); G.won.push(0); G.comm.push(null); G.commUsed.push(false); G.ctrl.push(i); G.answers.push(null); }
  if (G.dummy >= 0) { G.hands[0] = d.slice(0, 13); G.hands[1] = d.slice(13, 26); var dd = d.slice(26); G.stacks = []; for (i = 0; i < 7; i++) G.stacks.push([dd[2 * i], dd[2 * i + 1]]); G.hands[2] = G.stacks.map(function (s) { return s[1]; }); }
  else if (o.deal) { for (i = 0; i < G.n; i++) G.hands[i] = o.deal[i].slice(); }
  else { for (i = 0; i < d.length; i++) G.hands[i % G.n].push(d[i]); }
  G.hands.forEach(sortHand);
  for (i = 0; i < G.n; i++) if (G.hands[i].indexOf('r4') >= 0) G.cmd = i;
  if (G.dummy >= 0 && G.stacks.some(function (s) { return s.indexOf('r4') >= 0; })) G.cmd = 2;
  if (G.dummy >= 0) { G.ctrl[2] = G.cmd === 1 ? 1 : 0; G.cap = G.cmd === 2 ? 0 : G.cmd; } else G.cap = G.cmd;
  G.lead = G.turn = G.cmd;
  // task cards: k drawn from the 36 suit cards
  var tdeck = shuffle(G, deckAll().filter(function (c) { return c[0] !== 'r'; })), k = G.mission.k || 0;
  if (o.taskCards) tdeck = o.taskCards.concat(tdeck.filter(function (c) { return o.taskCards.indexOf(c) < 0; }));
  for (i = 0; i < k; i++) G.pool.push({ card: tdeck[i], tok: (G.mission.tok || [])[i] || null });
  var sp = G.mission.sp || '';
  if (/decide|notrick|onetrick/.test(sp)) { G.phase = 'ask'; G.ask = { kind: /decide/.test(sp) ? 'decide' : /notrick/.test(sp) ? 'notrick' : 'onetrick' }; }
  else if (/dist/.test(sp)) { G.phase = 'ask'; G.ask = { kind: 'dist', idx: 0 }; }
  else if (!k) startPlay(G); else { G.phase = 'draft'; G.draftTurn = G.cap; }
  log(G, 'Mission ' + G.mission.n + ': captain is ' + seatName(G, G.cmd));
  return G;
}
function seatName(G, p) { return p === G.dummy ? 'the drone' : (p === 0 ? 'You' : ['You', 'Ines', 'Bram', 'Kito', 'Odile'][p]); }
function log(G, t) { G.log.push(t); if (G.log.length > 60) G.log.shift(); }
function startPlay(G) { G.phase = 'play'; G.turn = G.lead = G.cmd; G.trick = []; }
// who answers / decides right now (seat whose input is needed)
function actor(G, p) { return G.ctrl[p]; }
function sideToAct(G) {
  if (G.phase === 'draft') return actor(G, G.draftTurn);
  if (G.phase === 'ask') { var q = askWho(G); return q < 0 ? G.cap : q; }
  if (G.phase === 'play') return actor(G, G.turn);
  return -1;
}
function crew(G) { var o = []; for (var i = 0; i < G.n; i++) if (i !== G.dummy) o.push(i); return o; }
function askWho(G) { var c = crew(G); for (var i = 0; i < c.length; i++) { var p = (G.cap + 1 + i) % G.n; if (p === G.dummy || p === G.cap && G.ask.kind !== 'dist') continue; if (G.answers[p] == null) return p; } return -1; }
function legalCards(G, p) {
  var h = playable(G, p); if (!G.trick.length) return h.slice();
  var ls = suitOf(G.trick[0].c), f = h.filter(function (c) { return suitOf(c) === ls; }); return f.length ? f : h.slice();
}
function playable(G, p) { return G.hands[p]; }
function trickWinner(cards) {
  var best = cards[0], ls = suitOf(cards[0].c);
  for (var i = 1; i < cards.length; i++) { var c = cards[i].c, b = best.c;
    if (suitOf(c) === 'r' && (suitOf(b) !== 'r' || rankOf(c) > rankOf(b))) best = cards[i];
    else if (suitOf(c) === ls && suitOf(b) === ls && rankOf(c) > rankOf(b)) best = cards[i]; }
  return best.p;
}
function commPos(G, p, c) {   // 'top' | 'only' | 'bot' | null
  if (!c || c[0] === 'r' || G.hands[p].indexOf(c) < 0) return null;
  var same = G.hands[p].filter(function (x) { return x[0] === c[0]; }).map(rankOf), r = rankOf(c);
  if (same.length === 1) return 'only'; if (r === Math.max.apply(null, same)) return 'top'; if (r === Math.min.apply(null, same)) return 'bot'; return null;
}
function canComm(G, p) { return G.phase === 'play' && !G.trick.length && p !== G.dummy && !G.commUsed[p] && commAllowedNow(G) && !G.result; }
function canFlare(G) { return G.phase === 'play' && !G.tricks.length && !G.trick.length && !G.flare && !G.result; }
function validMoves(G, seat) {
  var out = [], s = sideToAct(G); if (G.result) return out;
  if (G.phase === 'draft') { if (s === seat) G.pool.forEach(function (t, i) { out.push({ t: 'take', i: i }); }); return out; }
  if (G.phase === 'ask') {
    var q = askWho(G);
    if (q >= 0 && actor(G, q) === seat) { out.push({ t: 'answer', p: q, yes: true }); out.push({ t: 'answer', p: q, yes: false }); }
    else if (q < 0 && seat === G.cap) chooseTargets(G).forEach(function (p) { out.push({ t: 'choose', p: p }); });
    return out;
  }
  if (G.phase === 'play') {
    // signals by any seat (before the lead of a trick)
    if (canComm(G, seat)) G.hands[seat].forEach(function (c) { var pos = commPos(G, seat, c); if (pos) out.push({ t: 'comm', c: c }); });
    if (s === seat) legalCards(G, G.turn).forEach(function (c) { out.push({ t: 'play', c: c }); });
  }
  return out;
}
function chooseTargets(G) {
  var c = crew(G), k = G.ask.kind;
  if (k === 'dist') { var cnt = taskCounts(G), tot = G.mission.k, mx = Math.ceil(tot / c.length), left = tot - G.ask.idx, need = 0;
    // keep the split even: nobody above ceil, and everyone can still reach floor
    var mn = Math.floor(tot / c.length);
    return c.filter(function (p) { if (cnt[p] >= mx) return false; var deficit = 0; c.forEach(function (q) { var v = cnt[q] + (q === p ? 1 : 0); if (v < mn) deficit += mn - v; }); return deficit <= left - 1; });
  }
  return c.filter(function (p) { return p !== G.cap; });
}
function taskCounts(G) { var o = []; for (var i = 0; i < G.n; i++) o.push(0); G.tasks.forEach(function (t) { o[t.owner]++; }); return o; }
function performMove(G, m, seat) {
  var ok = validMoves(G, seat).some(function (v) { return v.t === m.t && v.i === m.i && v.c === m.c && v.p === m.p && v.yes === m.yes; });
  if (!ok && m.t !== 'flare') return false;
  G.moves++;
  if (m.t === 'take') { var tk = G.pool.splice(m.i, 1)[0]; tk.owner = G.draftTurn; G.tasks.push(tk); log(G, seatName(G, G.draftTurn) + ' took task ' + cardName(tk.card));
    G.draftTurn = (G.draftTurn + 1) % G.n; if (!G.pool.length) startPlay(G); return true; }
  if (m.t === 'answer') { G.answers[m.p] = !!m.yes; return true; }
  if (m.t === 'choose') {
    var k = G.ask.kind;
    if (k === 'decide') { G.pool.forEach(function (t) { t.owner = m.p; G.tasks.push(t); }); G.pool = []; G.chosen = m.p; startPlay(G); }
    else if (k === 'notrick' || k === 'onetrick') { G.chosen = m.p; if (G.pool.length) { G.phase = 'draft'; G.draftTurn = G.cap; } else startPlay(G); }
    else if (k === 'dist') { var t = G.pool.shift(); t.owner = m.p; G.tasks.push(t); G.ask.idx++; for (var i = 0; i < G.n; i++) G.answers[i] = null; if (!G.pool.length) startPlay(G); }
    log(G, 'Captain chose ' + seatName(G, m.p)); return true;
  }
  if (m.t === 'comm') { var pos = commPos(G, seat, m.c); G.comm[seat] = { c: m.c, pos: isDead(G) ? '?' : pos, tr: G.tricks.length }; G.commUsed[seat] = true; G.sig.push({ p: seat, c: m.c, pos: G.comm[seat].pos }); log(G, seatName(G, seat) + ' signalled ' + cardName(m.c)); return true; }
  if (m.t === 'flare') return doFlare(G, m);
  if (m.t === 'play') return playCard(G, m.c);
  return false;
}
/* flare (distress signal): before the first trick, everyone passes one non-sonar card the same way. m = {t:'flare', dir:1|-1, picks:[card per seat]} */
function doFlare(G, m) {
  if (!canFlare(G)) return false; var c = crew(G), picks = m.picks || [];
  for (var i = 0; i < c.length; i++) { var p = c[i], x = picks[p]; if (!x || x[0] === 'r' || G.hands[p].indexOf(x) < 0) return false; }
  var moved = c.map(function (p) { G.hands[p].splice(G.hands[p].indexOf(picks[p]), 1); return picks[p]; });
  c.forEach(function (p, i) { var to = c[(i + (m.dir > 0 ? 1 : c.length - 1)) % c.length]; G.hands[to].push(moved[i]); sortHand(G.hands[to]); });
  G.flare = { dir: m.dir }; G.comm.forEach(function (x, p) { if (x && G.hands[p].indexOf(x.c) < 0) G.comm[p] = null; });
  log(G, 'Flare! Everyone passed one card ' + (m.dir > 0 ? 'left' : 'right')); return true;
}
function playCard(G, c) {
  var p = G.turn, h = G.hands[p]; h.splice(h.indexOf(c), 1);
  if (G.dummy === p) { for (var s = 0; s < G.stacks.length; s++) if (G.stacks[s][1] === c) { G.stacks[s].pop(); if (G.stacks[s].length) h.push(G.stacks[s][0]); sortHand(h); break; } }
  if (G.comm[p] && G.comm[p].c === c) G.comm[p] = null;
  G.trick.push({ p: p, c: c });
  if (G.trick.length < G.n) { G.turn = (G.turn + 1) % G.n; return true; }
  var w = trickWinner(G.trick), cards = G.trick.map(function (x) { return x.c; }), wc = G.trick.filter(function (x) { return x.p === w; })[0].c;
  G.tricks.push({ cards: G.trick.slice(), winner: w, lead: G.lead }); G.won[w]++; G.trick = []; G.lead = G.turn = w;
  var newly = G.tasks.filter(function (t) { return !t.done && cards.indexOf(t.card) >= 0; });
  newly.forEach(function (t) { t.done = true; t.wonBy = w; t.trick = G.tricks.length; });
  newly.sort(function (a, b) { return tokRank(a.tok) - tokRank(b.tok); });
  newly.forEach(function (t) { G.done.push(G.tasks.indexOf(t)); });
  var why = null;
  newly.forEach(function (t) { if (!why && t.wonBy !== t.owner) why = cardName(t.card) + ' was won by ' + seatName(G, t.wonBy) + ', not ' + seatName(G, t.owner); });
  if (!why) why = orderProblem(G);
  if (!why && G.chosen >= 0 && /notrick/.test(G.mission.sp || '') && w === G.chosen) why = seatName(G, w) + ' had to win no tricks';
  if (!why && G.chosen >= 0 && /onetrick/.test(G.mission.sp || '') && G.won[G.chosen] > 1) why = seatName(G, G.chosen) + ' had to win exactly one trick';
  if (!why && /sonars/.test(G.mission.sp || '') && wc[0] !== 'r' && cards.some(function (x) { return x[0] === 'r'; }) && false) why = null;
  if (/sonar/.test(G.mission.sp || '') && wc[0] === 'r') { G.sonarWins = G.sonarWins || []; if (G.sonarWins.indexOf(wc) < 0) G.sonarWins.push(wc); }
  if (!why && /sonars/.test(G.mission.sp || '')) { // a sonar beaten by a higher sonar can never win a trick now
    cards.forEach(function (x) { if (x[0] === 'r' && x !== wc && !why) why = 'Sonar ' + rankOf(x) + ' was played but did not win its trick'; }); }
  if (!why && /sonar1/.test(G.mission.sp || '') && cards.indexOf('r1') >= 0 && wc !== 'r1') why = 'Sonar 1 was played but did not win its trick';
  if (why) { G.result = { ok: false, why: why }; G.phase = 'over'; log(G, 'Mission lost: ' + why); return true; }
  var allDone = G.tasks.every(function (t) { return t.done; }) && !G.pool.length, out = G.hands.every(function (x, i) { return !x.length || G.np === 3 && x.length <= 1; });
  out = out || G.hands.some(function (x) { return !x.length; });
  var needFull = /notrick|onetrick/.test(G.mission.sp || ''), sonarOk = true;
  if (/sonars/.test(G.mission.sp || '')) sonarOk = (G.sonarWins || []).length === 4;
  if (/sonar1/.test(G.mission.sp || '')) sonarOk = (G.sonarWins || []).indexOf('r1') >= 0;
  if (allDone && sonarOk && (!needFull || out)) {
    if (/onetrick/.test(G.mission.sp || '') && G.won[G.chosen] !== 1) { G.result = { ok: false, why: seatName(G, G.chosen) + ' had to win exactly one trick' }; }
    else G.result = { ok: true, why: 'All tasks complete' };
    G.phase = 'over'; log(G, G.result.ok ? 'Mission complete!' : 'Mission lost'); return true;
  }
  if (out) { G.result = { ok: false, why: !allDone ? 'A task card was never won' : /onetrick/.test(G.mission.sp) ? seatName(G, G.chosen) + ' had to win exactly one trick' : 'The sonar goal was not met' }; G.phase = 'over'; log(G, 'Mission lost'); }
  return true;
}
function tokRank(t) { if (!t) return 50; if (/^\d$/.test(t)) return +t; if (t[0] === '>') return 10 + t.length; if (t === 'O') return 99; return 50; }
/* order rules: numbered tokens = absolute place in the completion order; arrows = relative order; omega = last task completed */
function orderProblem(G) {
  var seq = G.done.map(function (i) { return G.tasks[i]; }), all = G.tasks.length;
  for (var i = 0; i < seq.length; i++) { var t = seq[i].tok; if (!t) continue;
    if (/^\d$/.test(t) && i !== +t - 1) return 'Task ' + t + ' had to be done ' + ['first', 'second', 'third', 'fourth', 'fifth'][+t - 1];
    if (t === 'O') { if (i !== all - 1 && !(G.tasks.every(function (x) { return x.done; }))) return 'The final task (Ω) had to come last'; }
    if (t[0] === '>') { for (var j = 0; j < G.tasks.length; j++) { var u = G.tasks[j]; if (u.tok && u.tok[0] === '>' && u.tok.length < t.length && (!u.done || G.done.indexOf(j) > i)) return 'Task ' + t + ' came before ' + u.tok; } }
  }
  // a numbered task not yet done while later positions are filled
  for (var n = 1; n <= 5; n++) { var tn = G.tasks.filter(function (x) { return x.tok === String(n); })[0]; if (tn && !tn.done && seq.length >= n) return 'Task ' + n + ' had to be done ' + ['first', 'second', 'third', 'fourth', 'fifth'][n - 1]; }
  return null;
}
/* can task t be completed next without breaking the order? (used by the AI) */
function taskAllowed(G, t) {
  if (t.done) return false; var seq = G.done.length, tok = t.tok;
  for (var n = 1; n <= 5; n++) { var tn = G.tasks.filter(function (x) { return x.tok === String(n); })[0]; if (tn && !tn.done && tn !== t && seq === n - 1) return false; }
  if (tok && /^\d$/.test(tok)) return seq === +tok - 1;
  if (tok === 'O') return G.tasks.filter(function (x) { return !x.done; }).length === 1;
  if (tok && tok[0] === '>') return !G.tasks.some(function (u) { return !u.done && u.tok && u.tok[0] === '>' && u.tok.length < tok.length; });
  return true;
}
function checkInvariants(G) {
  var seen = {}, n = 0, bad = [];
  G.hands.forEach(function (h, p) { h.forEach(function (c) { if (seen[c]) bad.push('dup ' + c); seen[c] = 1; n++; }); });
  if (G.stacks) G.stacks.forEach(function (s) { if (s.length === 2) { if (seen[s[0]]) bad.push('dup ' + s[0]); seen[s[0]] = 1; n++; } });
  G.tricks.forEach(function (t) { t.cards.forEach(function (x) { if (seen[x.c]) bad.push('dup ' + x.c); seen[x.c] = 1; n++; }); });
  G.trick.forEach(function (x) { if (seen[x.c]) bad.push('dup ' + x.c); seen[x.c] = 1; n++; });
  if (n !== 40) bad.push('card count ' + n);
  if (G.tasks.length + G.pool.length !== (G.mission.k || 0)) bad.push('task count');
  return bad;
}
function render_game_to_text(G) {
  return JSON.stringify({ mission: G.mission.n, phase: G.phase, captain: G.cmd, turn: G.turn, trick: G.trick, tricks: G.tricks.length, myHand: G.hands[0],
    tasks: G.tasks.map(function (t) { return t.card + '>' + t.owner + (t.tok ? '[' + t.tok + ']' : '') + (t.done ? '✓' : ''); }), result: G.result });
}
if (typeof module !== 'undefined') module.exports = { newGame: newGame, validMoves: validMoves, performMove: performMove, sideToAct: sideToAct, checkInvariants: checkInvariants,
  legalCards: legalCards, trickWinner: trickWinner, commPos: commPos, canComm: canComm, canFlare: canFlare, taskAllowed: taskAllowed, suitOf: suitOf, rankOf: rankOf, deckAll: deckAll,
  missionDef: missionDef, render_game_to_text: render_game_to_text, cardName: cardName, seatName: seatName, crew: crew, askWho: askWho, chooseTargets: chooseTargets, setMissions: function (m) { MISSIONS = m; }, commAllowedNow: commAllowedNow, isDead: isDead, sortHand: sortHand };
