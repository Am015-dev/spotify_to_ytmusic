// Independent rules audit for Deep Signal: one headless assertion per numbered rule of RULES-CHECKLIST.md, run against the real engine.
// node logic-test.js          -> prints one line per failing rule ("R<n> FAIL expected .. got ..") and a total
// node logic-test.js --md     -> prints RULES-CHECKLIST.md (the checklist is generated from the rule list below, so numbers always match)
const E = require('./src/engine.js'); E.setMissions(require('./missions.json'));
const MD = { n: 99, k: 0, tok: [], sp: null };
const RULES = []; let SECTION = '';
const S = (t, note) => { SECTION = t; RULES.push({ sec: t, note: note || '' }); };
const R = (text, fn) => { RULES.push({ n: RULES.filter(r => r.fn).length + 1, text, fn, sec: SECTION }); };
const J = x => JSON.stringify(x);
// ---------- helpers ----------
const base = (np, md, seed) => E.newGame({ players: np, missionDef: md || MD, seed: seed || 5 });
const setTasks = (G, list, fake) => { G.tasks = list.map(([card, owner, tok]) => ({ card, owner, tok: tok || null })); if (fake) G.tasks.push({ card: 'z1', owner: 0, tok: null }); G.pool = []; G.phase = 'play'; G.ask = null; };
const lead = (G, p) => { G.lead = G.turn = p; };
const play = (G, c) => E.performMove(G, { t: 'play', c }, E.sideToAct(G));
const auto = G => play(G, E.legalCards(G, G.turn)[0]);
const autoTrick = G => { for (let i = 0; i < G.n; i++) auto(G); };
// 4-player game with chosen cards: spec[p] = cards seat p must hold, voids[p] = suits seat p must not receive as filler. Unreachable fake task keeps the mission running.
function mk4(spec, voids, md) {
  spec = spec || []; voids = voids || {}; const G = base(4, md), used = new Set([].concat(...spec.map(x => x || [])));
  const rest = E.deckAll().filter(c => !used.has(c)), hs = [], order = [0, 1, 2, 3].sort((a, b) => (voids[b] ? 1 : 0) - (voids[a] ? 1 : 0));
  for (const p of order) { const h = (spec[p] || []).slice(); while (h.length < 10) { const i = rest.findIndex(c => !(voids[p] || []).includes(c[0])); if (i < 0) throw new Error('filler'); h.push(rest.splice(i, 1)[0]); } hs[p] = h; }
  G.hands = hs.map(h => E.sortHand(h)); const cap = G.hands.findIndex(h => h.includes('r4')); G.cmd = G.cap = cap; lead(G, cap); setTasks(G, [], true); return G;
}
// finish a trick: first three cards are already on the table, seat (lead+3) plays the fourth through the engine. o.end empties every other hand.
function fin(G, ld, cards, o) {
  o = o || {}; const n = G.n; G.trick = []; for (let i = 0; i < 3; i++) G.trick.push({ p: (ld + i) % n, c: cards[i] }); G.lead = ld; const t = (ld + 3) % n; G.turn = t;
  if (o.end) { G.hands = G.hands.map(() => []); G.hands[t] = [cards[3]]; } else G.hands[t] = [cards[3], 'z9'];
  return play(G, cards[3]);
}
const T1 = ['c1', 'c2', 'c3', 'c4'], T2 = ['k1', 'k2', 'k3', 'k4'], T3 = ['t1', 't2', 't3', 't4'];   // winners: seat 3 (lead 0), seat 2 (lead 3), seat 1 (lead 2)
const orderRun = (tasks, tricks) => { const G = mk4(); setTasks(G, tasks); const L = [[0, T1], [3, T2], [2, T3]]; for (let i = 0; i < tricks && !G.result; i++) fin(G, L[i][0], L[i][1]); return G; };
function drive(G, pick) { let g = 0; while (G.phase !== 'play' && G.phase !== 'over' && g++ < 200) { const s = E.sideToAct(G), v = E.validMoves(G, s); const m = pick ? pick(G, v) : (v.find(x => x.t === 'answer' && x.yes) || v[0]); if (!m || !E.performMove(G, m, s)) return false; } return true; }
const counts = G => { const o = Array(G.n).fill(0); G.tasks.forEach(t => o[t.owner]++); return o; };
const sorted = a => a.slice().sort((x, y) => y - x);
const picksOf = G => G.hands.map(h => h.find(c => c[0] !== 'r'));
const SIG = [['c1', 'c5', 'c9', 'k7', 'r2'], ['k1', 'k9']], SIGV = { 0: ['c', 'k'], 1: ['k'] };

// ================= RULES =================
S('A. Setup and deal');
R('The deck has 40 cards: four colours (Coral, Kelp, Tide, Amber) ranked 1-9 (36 cards) plus four Sonar trumps ranked 1-4.', () => { const d = E.deckAll();
  return [J({ n: 40, col: 36, sonar: ['r1', 'r2', 'r3', 'r4'], uniq: 40 }), J({ n: d.length, col: d.filter(c => c[0] !== 'r').length, sonar: d.filter(c => c[0] === 'r').sort(), uniq: new Set(d).size })]; });
R('5 players: all 40 cards are dealt, 8 each.', () => [J([8, 8, 8, 8, 8]), J(base(5).hands.map(h => h.length))]);
R('4 players: all 40 cards are dealt, 10 each.', () => [J([10, 10, 10, 10]), J(base(4).hands.map(h => h.length))]);
R('3 players: all 40 cards are dealt, 14/13/13 (one player holds one extra card).', () => [J([13, 13, 14]), J(base(3).hands.map(h => h.length).sort((a, b) => a - b))]);
R('Every card exists exactly once after dealing, for 2, 3, 4 and 5 players (no duplicates, none missing).', () => [J([[], [], [], []]), J([2, 3, 4, 5].map(np => E.checkInvariants(base(np, MD, 11))))]);
R('2 players: each player gets 13 cards; the drone gets the other 14 as 7 stacks of 2.', () => { const G = base(2); return [J([13, 13, 7, 2]), J([G.hands[0].length, G.hands[1].length, G.stacks.length, G.stacks[0].length])]; });
R('2 players: the drone shows only the top card of each stack (7 cards in its hand); playing a top card turns the hidden card of that stack face up.', () => {
  const G = base(2), tops = G.stacks.map(s => s[1]).sort(), st = G.stacks[0], top = st[1], hid = st[0]; const before = G.hands[2].slice().sort(); lead(G, 2); setTasks(G, [], true);
  const ok = E.performMove(G, { t: 'play', c: top }, G.ctrl[2]);
  return [J({ handBefore: tops, ok: true, top: false, hid: true, size: 7 }), J({ handBefore: before, ok, top: G.hands[2].includes(top), hid: G.hands[2].includes(hid), size: G.hands[2].length })]; });
R('2 players: the captain\'s player plays the drone\'s cards, and if the drone holds Sonar 4 the drone is captain, leads, and seat 0 plays for it.', () => {
  for (let s = 1; s < 400; s++) { const G = base(2, MD, s); if (G.cmd === 2) return [J({ turn: 2, side: 0 }), J({ turn: G.turn, side: E.sideToAct(G) })]; } return ['a seed where the drone holds Sonar 4', 'none found in 400 seeds']; });
R('The holder of Sonar 4 is the captain (3, 4 and 5 players).', () => { const bad = []; for (const np of [3, 4, 5]) for (let s = 1; s <= 15; s++) { const G = base(np, MD, s); if (!G.hands[G.cmd].includes('r4')) bad.push(np + 'p seed ' + s); } return [J([]), J(bad)]; });
R('The captain leads the first trick and may lead any card in hand (no card is forced).', () => { const G = base(4); return [J({ turn: G.cmd, legal: G.hands[G.cmd].length }), J({ turn: G.turn, legal: E.legalCards(G, G.turn).length })]; });

S('B. Task cards and drafting');
R('Task cards are drawn from the 36 colour cards only (never a Sonar), all different, as many as the mission says (mission 45: 8).', () => { const bad = [];
  for (let s = 1; s <= 30; s++) { const G = base(4, null, s); const g2 = E.newGame({ players: 4, mission: 45, seed: s }); const c = g2.pool.map(t => t.card); if (c.length !== 8 || new Set(c).size !== 8 || c.some(x => x[0] === 'r')) bad.push(s); } return [J([]), J(bad)]; });
R('The mission\'s order tokens lie on its task cards (mission 31: tokens 1, 2 and Ω among 6 tasks).', () => { const G = E.newGame({ players: 4, mission: 31, seed: 3 }); return [J({ n: 6, toks: ['1', '2', 'O'] }), J({ n: G.pool.length, toks: G.pool.map(t => t.tok).filter(Boolean).sort() })]; });
R('Drafting starts with the captain and goes clockwise, one task per turn (mission 27, 6 tasks, 4 players).', () => { const G = E.newGame({ players: 4, mission: 27, seed: 3 }); const exp = []; for (let i = 0; i < 6; i++) exp.push((G.cap + i) % 4);
  drive(G, (g, v) => v[0]); return [J(exp), J(G.tasks.map(t => t.owner))]; });
R('Only the player whose turn it is to draft may take a task.', () => { const G = E.newGame({ players: 4, mission: 27, seed: 3 }); const other = (G.cap + 2) % 4; return [J({ cap: true, other: false }), J({ cap: E.validMoves(G, G.cap).some(m => m.t === 'take'), other: E.validMoves(G, other).some(m => m.t === 'take') })]; });
R('When the last task is taken the first trick begins, led by the captain.', () => { const G = E.newGame({ players: 4, mission: 27, seed: 3 }); drive(G, (g, v) => v[0]); return [J({ ph: 'play', turn: G.cmd, pool: 0 }), J({ ph: G.phase, turn: G.turn, pool: G.pool.length })]; });

S('C. Playing a trick');
const F = (extra) => mk4([[...(extra || [])], null, null, null]);
R('Follow suit: a player who holds the led colour must play that colour.', () => { const G = mk4([['c5'], ['c2', 'k3', 'k4', 'k5', 't1', 't2', 't3', 'a1', 'a2', 'a3']]); lead(G, 0); play(G, 'c5'); return [J(['c2']), J(E.legalCards(G, 1))]; });
R('A player with no card of the led colour may play any card (including a Sonar).', () => { const G = mk4([['c5'], ['k1', 'k2', 'k3', 't1', 't2', 't3', 'a1', 'a2', 'a3', 'r1']]); lead(G, 0); play(G, 'c5'); return [10, E.legalCards(G, 1).length]; });
R('If a Sonar is led, every player holding a Sonar must follow with a Sonar.', () => { const G = mk4([['r2'], ['r1', 'c1', 'c2', 'c3', 'k1', 'k2', 'k3', 't1', 't2', 't3']]); lead(G, 0); play(G, 'r2'); return [J(['r1']), J(E.legalCards(G, 1))]; });
R('If a Sonar is led and a player has no Sonar, any card may be played.', () => { const G = mk4([['r2'], ['c1', 'c2', 'c3', 'k1', 'k2', 'k3', 't1', 't2', 't3', 'a1']]); lead(G, 0); play(G, 'r2'); return [10, E.legalCards(G, 1).length]; });
R('Play goes clockwise: after seat 2 leads, seat 3 plays next.', () => { const G = mk4(); lead(G, 2); play(G, G.hands[2][0]); return [3, G.turn]; });
R('The highest card of the led colour wins when no Sonar was played.', () => { const G = mk4([['c3'], ['c9'], ['k9'], ['c5']], { 2: ['c', 'r'] }); lead(G, 0); const ok = [play(G, 'c3'), play(G, 'c9'), play(G, 'k9'), play(G, 'c5')]; return [J({ ok: [true, true, true, true], lead: 1, won: 1 }), J({ ok, lead: G.lead, won: G.won[1] })]; });
R('A card of another colour never wins unless it is a Sonar (Kelp 9 off-suit loses to Coral 5).', () => { const G = mk4([['c3'], ['c4'], ['k9'], ['c5']], { 2: ['c', 'r'] }); lead(G, 0); [ 'c3', 'c4', 'k9', 'c5'].forEach(c => play(G, c)); return [3, G.lead]; });
R('Any Sonar beats every colour card (Sonar 1 beats Coral 8).', () => { const G = mk4([['c3'], ['c2'], ['r1', 'c1'], ['c8']], { 2: ['c'] }); G.hands[2] = E.sortHand(['r1', 'k1', 'k2', 'k3', 't1', 't2', 't3', 'a1', 'a2', 'a3']); lead(G, 0); ['c3', 'c2', 'r1', 'c8'].forEach(c => play(G, c)); return [2, G.lead]; });
R('Among Sonars, the higher Sonar wins (Sonar 4 beats Sonar 2).', () => { const G = mk4([['c3'], ['c8'], ['r2'], ['r4']], { 2: ['c'], 3: ['c'] }); lead(G, 0); ['c3', 'c8', 'r2', 'r4'].forEach(c => play(G, c)); return [3, G.lead]; });
R('The trick winner leads the next trick (turn passes to the winner).', () => { const G = mk4([['c3'], ['c9'], ['k9'], ['c5']], { 2: ['c', 'r'] }); lead(G, 0); ['c3', 'c9', 'k9', 'c5'].forEach(c => play(G, c)); return [J({ turn: 1, side: 1, trick: 0, tricks: 1 }), J({ turn: G.turn, side: E.sideToAct(G), trick: G.trick.length, tricks: G.tricks.length })]; });
R('A trick is only resolved after every player has played one card.', () => { const G = mk4(); lead(G, 0); auto(G); auto(G); auto(G); const mid = [G.tricks.length, G.trick.length]; auto(G); return [J([0, 3, 1, 0]), J([...mid, G.tricks.length, G.trick.length])]; });

S('D. Tasks and winning/losing');
R('A task is completed when its owner wins the trick containing the task card (Coral 4, owner seat 3 wins T1).', () => { const G = mk4(); setTasks(G, [['c4', 3], ['z1', 0]]); fin(G, 0, T1); const t = G.tasks[0]; return [J({ done: true, by: 3 }), J({ done: !!t.done, by: t.wonBy })]; });
R('If a task card is won by someone other than its owner, the mission fails at once.', () => { const G = mk4(); setTasks(G, [['c4', 0], ['z1', 0]]); fin(G, 0, T1); return [J({ over: true, ok: false }), J({ over: G.phase === 'over', ok: G.result && G.result.ok })]; });
R('Several tasks inside one trick are all completed when that trick is won by their owner.', () => { const G = mk4(); setTasks(G, [['c2', 3], ['c4', 3]]); fin(G, 0, T1); return [J({ done: [true, true], ok: true }), J({ done: G.tasks.map(t => !!t.done), ok: G.result && G.result.ok })]; });
R('The mission is won immediately when the last task is completed, even with cards still in hands.', () => { const G = mk4(); setTasks(G, [['c4', 3]]); fin(G, 0, T1); return [J({ ok: true, over: true, left: 3 }), J({ ok: G.result && G.result.ok, over: G.phase === 'over', left: G.hands[0].length - 7 })]; });
R('3 players: the one card left unplayed at the end can never be won, so a task on it fails the mission.', () => {
  const sim = tk => { const G = base(3, MD, 21); setTasks(G, tk); let g = 0; while (!G.result && g++ < 100) auto(G); return G; };
  const G1 = sim([['z1', 0]]); const L = G1.hands.flat()[0]; const G2 = sim([[L, 0]]); return [J({ ok: false, left: 1 }), J({ ok: G2.result && G2.result.ok, left: G2.hands.flat().length })]; });
R('After the mission is over no further move is accepted (win or loss).', () => { const G = mk4(); setTasks(G, [['c4', 0]]); fin(G, 0, T1); const m = E.validMoves(G, 0).length + E.validMoves(G, 1).length; return [J({ moves: 0, play: false }), J({ moves: m, play: play(G, G.hands[0][0]) })]; });
R('A finished game has a plain win/loss outcome (co-operative: no scores, no ties); a full game always reaches it.', () => { const G = base(4, { n: 1, k: 1, tok: [], sp: null }, 8); drive(G); let g = 0; while (!G.result && g++ < 100) auto(G); return [J({ t: 'boolean', ph: 'over', inv: [] }), J({ t: typeof (G.result && G.result.ok), ph: G.phase, inv: E.checkInvariants(G) })]; });
R('2 players: a full game with the drone ends with a result and consistent cards.', () => { const G = base(2, { n: 1, k: 1, tok: [], sp: null }, 8); drive(G); let g = 0; while (!G.result && g++ < 100) auto(G); return [J({ ph: 'over', inv: [] }), J({ ph: G.phase, inv: E.checkInvariants(G) })]; });

S('E. Order tokens');
R('Numbered token 1 then 2: tasks completed in that order win the mission.', () => { const G = orderRun([['c4', 3, '1'], ['k4', 2, '2']], 2); return [true, G.result && G.result.ok]; });
R('Numbered token completed too early (token 2 done first) loses the mission at once.', () => { const G = orderRun([['c4', 3, '2'], ['k4', 2, '1']], 1); return [false, G.result ? G.result.ok : 'no result']; });
R('Numbered tokens count every task: an untokened task done first makes token 1 impossible.', () => { const G = orderRun([['c4', 3], ['k4', 2, '1']], 1); return [false, G.result ? G.result.ok : 'no result']; });
R('Numbered token 2 is satisfied by being the second task done overall (after one untokened task).', () => { const G = orderRun([['c4', 3], ['k4', 2, '2']], 2); return [true, G.result && G.result.ok]; });
R('Arrow tokens: > before >> is correct.', () => { const G = orderRun([['c4', 3, '>'], ['k4', 2, '>>']], 2); return [true, G.result && G.result.ok]; });
R('Arrow tokens: >> completed before > loses the mission.', () => { const G = orderRun([['c4', 3, '>>'], ['k4', 2, '>']], 1); return [false, G.result ? G.result.ok : 'no result']; });
R('Arrow tokens only order the arrow tasks: untokened tasks may be done anywhere in between (U, >, >>).', () => { const G = orderRun([['c4', 3], ['k4', 2, '>'], ['t4', 1, '>>']], 3); return [true, G.result && G.result.ok]; });
R('Ω: finishing the Ω task while another task is still open loses the mission.', () => { const G = orderRun([['c4', 3, 'O'], ['k4', 2]], 1); return [false, G.result ? G.result.ok : 'no result']; });
R('Ω: finishing Ω last wins the mission.', () => { const G = orderRun([['c4', 3], ['k4', 2, 'O']], 2); return [true, G.result && G.result.ok]; });
R('Same trick: tokens 2 and 1 completed in one trick are fine (any order inside the trick).', () => { const G = orderRun([['c1', 3, '2'], ['c2', 3, '1']], 1); return [true, G.result && G.result.ok]; });
R('Same trick: Ω together with the other tasks in the same trick is fine.', () => { const G = orderRun([['c1', 3, 'O'], ['c2', 3]], 1); return [true, G.result && G.result.ok]; });
R('Same trick: arrow tasks > and >> completed in one trick (any order) are fine.', () => { const G = orderRun([['c1', 3, '>>'], ['c2', 3, '>']], 1); return [true, G.result && G.result.ok]; });
R('Same trick: token 3 and an untokened task completed together after token 1 are fine (the trick is ordered in the most favourable way).', () => { const G = orderRun([['c4', 3, '1'], ['k2', 2], ['k4', 2, '3']], 2); return [true, G.result && G.result.ok]; });
R('Same trick: token 2 and an untokened task completed together as the first tasks are fine (untokened counts first, token 2 second).', () => { const G = orderRun([['c1', 3, '2'], ['c2', 3]], 1); return [true, G.result && G.result.ok]; });
R('Token 1 completed in the same trick as an untokened task counts as first (most favourable order).', () => { const G = orderRun([['c1', 3, '1'], ['c2', 3]], 1); return [true, G.result && G.result.ok]; });

S('F. Signals (crew communication)');
const SG = () => mk4(SIG, SIGV);
R('A signal is allowed before the first trick (after the tasks are taken).', () => { const G = SG(); return [true, E.performMove(G, { t: 'comm', c: 'c9' }, 0)]; });
R('A signal is allowed between tricks (nothing on the table).', () => { const G = SG(); lead(G, 0); play(G, 'k7'); autoTrick.call(null, G); while (G.trick.length) auto(G); return [true, E.performMove(G, { t: 'comm', c: 'c9' }, 0)]; });
R('A signal is not allowed while a trick is in progress.', () => { const G = SG(); lead(G, 0); play(G, 'k7'); return [J({ s0: false, s1: false }), J({ s0: E.performMove(G, { t: 'comm', c: 'c9' }, 0), s1: E.performMove(G, { t: 'comm', c: 'k9' }, 1) })]; });
R('Each player may signal only once per mission.', () => { const G = SG(); const a = E.performMove(G, { t: 'comm', c: 'c9' }, 0), b = E.performMove(G, { t: 'comm', c: 'c1' }, 0); return [J([true, false, false]), J([a, b, E.canComm(G, 0)])]; });
R('Every player has their own signal (two different players can both signal).', () => { const G = SG(); return [J([true, true]), J([E.performMove(G, { t: 'comm', c: 'c9' }, 0), E.performMove(G, { t: 'comm', c: 'k9' }, 1)])]; });
R('Sonar cards can never be signalled.', () => { const G = SG(); return [false, E.performMove(G, { t: 'comm', c: 'r2' }, 0)]; });
R('Signalling the highest card of a colour in hand reports position "top".', () => { const G = SG(); E.performMove(G, { t: 'comm', c: 'c9' }, 0); return ['top', G.comm[0] && G.comm[0].pos]; });
R('Signalling the lowest card of a colour in hand reports position "bot" (lowest).', () => { const G = SG(); E.performMove(G, { t: 'comm', c: 'c1' }, 0); return ['bot', G.comm[0] && G.comm[0].pos]; });
R('Signalling the only card of a colour in hand reports position "only".', () => { const G = SG(); E.performMove(G, { t: 'comm', c: 'k7' }, 0); return ['only', G.comm[0] && G.comm[0].pos]; });
R('A card that is neither highest, lowest nor only in its colour cannot be signalled (Coral 5 among 1,5,9).', () => { const G = SG(); return [false, E.performMove(G, { t: 'comm', c: 'c5' }, 0)]; });
R('The signalled card stays in hand and can still be played normally.', () => { const G = SG(); E.performMove(G, { t: 'comm', c: 'c9' }, 0); lead(G, 0); return [J({ inHand: true, legal: true }), J({ inHand: G.hands[0].includes('c9'), legal: E.legalCards(G, 0).includes('c9') })]; });
R('When the signalled card is played, the signal marker is removed.', () => { const G = SG(); E.performMove(G, { t: 'comm', c: 'c9' }, 0); lead(G, 0); play(G, 'c9'); return [null, G.comm[0]]; });
R('Signalling does not use up a turn (the player to move stays the same).', () => { const G = SG(); lead(G, 2); E.performMove(G, { t: 'comm', c: 'c9' }, 0); return [2, G.turn]; });
R('2 players: the drone can never signal.', () => { const G = base(2); setTasks(G, [], true); return [J({ can: false, moves: 0 }), J({ can: E.canComm(G, 2), moves: E.validMoves(G, G.ctrl[2]).filter(m => m.t === 'comm' && G.hands[2].includes(m.c)).length })]; });
R('No signals are allowed after the mission is over.', () => { const G = SG(); setTasks(G, [['c4', 0]]); fin(G, 0, T1); return [false, E.performMove(G, { t: 'comm', c: 'c9' }, 0)]; });
R('Silent-running missions (nocomm) forbid every signal.', () => { const G = base(4, { n: 98, k: 0, tok: [], sp: 'nocomm' }); setTasks(G, [], true); return [J({ can: false, moves: 0 }), J({ can: E.canComm(G, 0), moves: E.validMoves(G, 0).filter(m => m.t === 'comm').length })]; });
R('Dead-zone missions show the signalled card but hide whether it is highest, only or lowest ("?").', () => { const G = base(4, { n: 97, k: 0, tok: [], sp: 'dead' }); setTasks(G, [], true); const c = G.hands[0].find(x => E.commPos(G, 0, x)); E.performMove(G, { t: 'comm', c }, 0); return ['?', G.comm[0] && G.comm[0].pos]; });
R('Jammed-relay "late2": no signal in trick 1, signals allowed from trick 2.', () => { const G = base(4, { n: 96, k: 0, tok: [], sp: 'late2' }); setTasks(G, [], true); const a = E.canComm(G, 0); autoTrick(G); return [J([false, true]), J([a, E.canComm(G, 0)])]; });
R('Jammed-relay "late3": no signal in tricks 1-2, signals allowed from trick 3.', () => { const G = base(4, { n: 95, k: 0, tok: [], sp: 'late3' }); setTasks(G, [], true); const a = E.canComm(G, 0); autoTrick(G); const b = E.canComm(G, 0); autoTrick(G); return [J([false, false, true]), J([a, b, E.canComm(G, 0)])]; });

S('G. Distress signal (flare)');
const FL = () => mk4([[], ['r1'], [], []]);
R('A flare may be sent before the first trick and before any signal: everyone passes one non-Sonar card.', () => { const G = FL(); return [true, E.performMove(G, { t: 'flare', dir: 1, picks: picksOf(G) }, 0)]; });
R('A flare is not allowed once any crew member has signalled.', () => { const G = FL(); E.performMove(G, { t: 'comm', c: G.hands[0].find(c => E.commPos(G, 0, c)) }, 0); return [false, E.performMove(G, { t: 'flare', dir: 1, picks: picksOf(G) }, 0)]; });
R('Only one flare per mission.', () => { const G = FL(); E.performMove(G, { t: 'flare', dir: 1, picks: picksOf(G) }, 0); return [false, E.performMove(G, { t: 'flare', dir: 1, picks: picksOf(G) }, 0)]; });
R('A flare is not allowed after the first trick has been played.', () => { const G = FL(); autoTrick(G); return [false, E.performMove(G, { t: 'flare', dir: 1, picks: picksOf(G) }, 0)]; });
R('A flare is not allowed during the draft (tasks must be assigned first).', () => { const G = E.newGame({ players: 4, mission: 10, seed: 3 }); return [J({ can: false, mv: false }), J({ can: E.canFlare(G), mv: E.performMove(G, { t: 'flare', dir: 1, picks: picksOf(G) }, 0) })]; });
R('Every crew member must pass a card: a flare with a missing pick is refused and nothing moves.', () => { const G = FL(), before = J(G.hands), p = picksOf(G); p[2] = undefined; const ok = E.performMove(G, { t: 'flare', dir: 1, picks: p }, 0); return [J({ ok: false, same: true }), J({ ok, same: J(G.hands) === before })]; });
R('A Sonar card can never be passed in a flare.', () => { const G = FL(), p = picksOf(G); p[1] = 'r1'; return [false, E.performMove(G, { t: 'flare', dir: 1, picks: p }, 0)]; });
R('All cards are passed the same way: left (next seat) or right (previous seat).', () => {
  const chk = dir => { const G = FL(), p = picksOf(G); E.performMove(G, { t: 'flare', dir, picks: p }, 0); return p.every((c, i) => G.hands[(i + (dir > 0 ? 1 : 3)) % 4].includes(c)); };
  return [J([true, true]), J([chk(1), chk(-1)])]; });
R('Hand sizes are unchanged after a flare.', () => { const G = FL(); E.performMove(G, { t: 'flare', dir: 1, picks: picksOf(G) }, 0); return [J([10, 10, 10, 10]), J(G.hands.map(h => h.length))]; });
R('The captain does not change after a flare (Sonar 4 cannot be passed).', () => { const G = FL(), c = G.cmd; E.performMove(G, { t: 'flare', dir: -1, picks: picksOf(G) }, 0); return [J({ cmd: c, holds: true }), J({ cmd: G.cmd, holds: G.hands[c].includes('r4') })]; });
R('Using the flare is recorded (it costs the "No flare" star).', () => { const G = FL(); E.performMove(G, { t: 'flare', dir: 1, picks: picksOf(G) }, 0); return [true, !!G.flare]; });
R('A flare does not change who owns which task.', () => { const G = FL(); setTasks(G, [['c4', 1], ['k4', 2], ['z1', 0]]); const b = J(G.tasks.map(t => t.owner)); E.performMove(G, { t: 'flare', dir: 1, picks: picksOf(G) }, 0); return [b, J(G.tasks.map(t => t.owner))]; });
R('2 players: the drone does not take part in a flare (only the two humans pass).', () => { const G = base(2); setTasks(G, [], true); const d = J(G.hands[2]), p = [G.hands[0].find(c => c[0] !== 'r'), G.hands[1].find(c => c[0] !== 'r')];
  const ok = E.performMove(G, { t: 'flare', dir: 1, picks: p }, 0); return [J({ ok: true, drone: d, sizes: [13, 13] }), J({ ok, drone: J(G.hands[2]), sizes: [G.hands[0].length, G.hands[1].length] })]; });

S('H. Special mission rules', 'These missions are original to this game (same kinds of rules as the published set, not copies), so the rule being checked is the text on the mission card.');
const ask = (mission, np, seed) => { const G = E.newGame({ players: np || 4, mission, seed: seed || 5 }); drive(G); return G; };
const NT = { n: 94, k: 0, tok: [], sp: 'notrick' }, OT = { n: 93, k: 0, tok: [], sp: 'onetrick' };
const special = (md, chosen, tasks) => { const G = base(4, md); G.phase = 'play'; G.ask = null; G.chosen = chosen; setTasks(G, tasks || [], !tasks); return G; };
R('"Wins no tricks" (mission 26): the captain picks one other crew member, who is given no task; the others share all tasks.', () => { const G = ask(26); return [J({ picked: true, notCap: true, n: 2, divTasks: false }), J({ picked: G.chosen >= 0, notCap: G.chosen !== G.cap, n: G.tasks.length, divTasks: G.tasks.some(t => t.owner === G.chosen) })]; });
R('"Wins no tricks": if the chosen diver wins any trick the mission fails at once.', () => { const G = special(NT, 3); fin(G, 0, T1); return [false, G.result ? G.result.ok : 'no result']; });
R('"Wins no tricks": finishing all tasks early does not end the mission; the diver must stay trickless to the end.', () => { const G = special(NT, 1, [['c4', 3]]); fin(G, 0, T1); return [J({ result: null, phase: 'play' }), J({ result: G.result, phase: G.phase })]; });
R('"Wins no tricks": the mission is won when all tasks are done and the cards run out with the diver trickless.', () => { const G = special(NT, 1, [['c4', 3]]); fin(G, 0, T1, { end: true }); return [true, G.result && G.result.ok]; });
R('"Exactly one trick" (mission 20): the chosen diver winning a second trick fails the mission.', () => { const G = special(OT, 3); G.won[3] = 1; fin(G, 0, T1); return [false, G.result ? G.result.ok : 'no result']; });
R('"Exactly one trick": the mission is won when the diver ends with exactly one trick.', () => { const G = special(OT, 3, [['c4', 3]]); fin(G, 0, T1, { end: true }); return [true, G.result && G.result.ok]; });
R('"Exactly one trick": a diver who ends with no trick fails the mission.', () => { const G = special(OT, 1, [['c4', 3]]); fin(G, 0, T1, { end: true }); return [false, G.result ? G.result.ok : 'no result']; });
R('"Captain decides" (mission 17): the captain gives all tasks to one other crew member.', () => { const G = ask(17); const own = new Set(G.tasks.map(t => t.owner)); return [J({ n: 2, one: 1, notCap: true }), J({ n: G.tasks.length, one: own.size, notCap: !own.has(G.cap) })]; });
R('"Captain decides": the captain cannot choose themselves (3 choices of 4 players).', () => { const G = E.newGame({ players: 4, mission: 17, seed: 5 }); let t = null; drive(G, (g, v) => { const c = v.filter(m => m.t === 'choose'); if (c.length) t = c.map(m => m.p).sort(); return v.find(x => x.t === 'answer' && x.yes) || v[0]; });
  return [J([0, 1, 2, 3].filter(p => p !== G.cap)), J(t)]; });
R('"Captain distributes" (mission 28, 6 tasks, 4 players): tasks are split as evenly as possible (2,2,1,1).', () => [J([2, 2, 1, 1]), J(sorted(counts(ask(28))))]);
R('"Captain distributes" (mission 28, 6 tasks, 5 players): split 2,1,1,1,1.', () => [J([2, 1, 1, 1, 1]), J(sorted(counts(ask(28, 5))))]);
R('"Captain distributes" (mission 22, 4 tasks, 3 players): split 2,1,1.', () => [J([2, 1, 1]), J(sorted(counts(ask(22, 3))))]);
R('"Sonar 1 must win a trick" (mission 9): playing Sonar 1 and losing the trick fails the mission.', () => { const G = special({ n: 92, k: 0, tok: [], sp: 'sonar1' }, -1); fin(G, 0, ['c5', 'r1', 'c9', 'r2']); return [false, G.result ? G.result.ok : 'no result']; });
R('"Sonar 1 must win a trick": winning a trick with Sonar 1 completes the goal and the mission is won.', () => { const G = special({ n: 92, k: 0, tok: [], sp: 'sonar1' }, -1, []); fin(G, 0, ['c5', 'r1', 'c9', 'c2']); return [true, G.result && G.result.ok]; });
R('"Sonar 1 must win a trick": with all tasks done but Sonar 1 not yet winning, the mission goes on.', () => { const G = special({ n: 92, k: 0, tok: [], sp: 'sonar1' }, -1, [['c4', 3]]); fin(G, 0, T1); return [J({ result: null, phase: 'play' }), J({ result: G.result, phase: G.phase })]; });
R('"Every sonar must win a trick" (mission 13): a Sonar beaten by a higher Sonar fails the mission.', () => { const G = special({ n: 91, k: 0, tok: [], sp: 'sonars' }, -1); fin(G, 0, ['c5', 'r1', 'c9', 'r2']); return [false, G.result ? G.result.ok : 'no result']; });
R('"Every sonar must win a trick": the mission is won only after all four Sonars have each won a trick.', () => { const G = special({ n: 91, k: 0, tok: [], sp: 'sonars' }, -1, []); const r = [];
  for (let i = 1; i <= 4; i++) { fin(G, 0, ['c5', 'r' + i, 'c9', 'c2']); r.push(G.result ? G.result.ok : null); } return [J([null, null, null, true]), J(r)]; });
S('I. Not applicable or not in this edition', 'Printed rules that have no counterpart here. Listed so nothing is silently skipped; no assertion is possible.');

// ================= RUN =================
if (process.argv.includes('--md')) {
  const out = ['# Deep Signal rules checklist', '', 'Rules of the published co-operative trick-taking game this edition adapts, in the same words as the assertions in `logic-test.js`. Numbers match `R<n>` in the test output. The file is generated: `node logic-test.js --md > RULES-CHECKLIST.md`.', '',
    'Sources: the game\'s published rulebook and online rules summaries (rules-notes.md cross-check), checked 8 Nov 2026. The 50 missions are original, so mission special rules are checked against the text on their mission cards.', '',
    'Not applicable (co-operative game): scoring, final scoring, ties. A mission is simply won or lost; trick winners are always unique because every card is unique. Rules marked [assumed] are simplifications noted in rules-notes.md ("Guessed / simplified").', ''];
  for (const r of RULES) { if (!r.fn) { out.push('', '## ' + r.sec, r.note ? '_' + r.note + '_' : '', ''); continue; } out.push(r.n + '. ' + r.text); }
  out.push('', '## I. Not applicable or not in this edition', '', '- Scoring / final scoring / ties: none in a co-operative game (see above).', '- Optional real-time timer, shared-signal-token mission modes and the larger task deck of the published set: not part of this edition.', '- Attempts counter: replaced by the "No flare" star (see section G).',
    '- 3-player extra card [assumed]: which seat gets 14 cards is not specified by the engine tests; the leftover card is never played (section D, 3-player leftover rule).');
  console.log(out.filter((l, i, a) => !(l === '' && a[i - 1] === '')).join('\n')); process.exit(0);
}
let pass = 0, total = 0; const failed = [];
for (const r of RULES) { if (!r.fn) continue; total++; let res;
  try { res = r.fn(); } catch (e) { res = ['no crash', 'threw ' + e.message]; }
  if (J(res[0]) === J(res[1])) pass++; else { failed.push(r.n); console.log('R' + r.n + ' FAIL expected ' + J(res[0]) + ' got ' + J(res[1]) + '  -- ' + r.text.slice(0, 70)); } }
console.log('LOGIC ' + pass + '/' + total + ' pass' + (failed.length ? ', failing: ' + failed.join(',') : ''));
process.exit(failed.length ? 1 : 0);
