// One headless assertion per numbered rule of RULES-CHECKLIST.md, against the real engine (src/engine.js + src/data.js).
//   node logic-test.js          prints one line per failing rule ("R012 FAIL ...: expected X got Y") and a summary; exit 1 on any failure.
//   node logic-test.js -v       also prints the passing rules.
// Written from the rulebook, not from the engine: expected values come from RULES-CHECKLIST.md / the track table in rules-notes.md,
// never from the code under test. A rule in the checklist without a test below counts as a failure ("no test").
const fs = require('fs'), path = require('path');
const T = require('./tlib.js'); const CF = T.CF; const D = CF.DATA;
const DIE_ORIG = D.DIE.slice();
const P = (G, s) => G.players[s];
const J = JSON.stringify;
const eq = (got, want, what) => { if (J(got) !== J(want)) throw new Error('expected ' + J(want) + ' got ' + J(got) + (what ? ' (' + what + ')' : '')); };
const yes = (c, what) => { if (!c) throw new Error('expected true got false' + (what ? ' (' + what + ')' : '')); };
const tests = {}; const rule = (n, f) => { tests['R' + String(n).padStart(3, '0')] = f; };

// ---------- expected track, parsed from the table in rules-notes.md (a transcription of the board) ----------
const EXP = { c: [], v: [], r: [] };
fs.readFileSync(path.join(__dirname, 'rules-notes.md'), 'utf8').split('\n').forEach(l => {
  if (!/^\|\s*\d+\s*\|/.test(l)) return; const cells = l.split('|').slice(1, -1).map(s => s.trim());
  for (let i = 0; i + 3 < cells.length + 1; i += 4) { if (cells[i] === '') continue; const ix = +cells[i]; EXP.c[ix] = +cells[i + 1]; EXP.v[ix] = +cells[i + 2]; EXP.r[ix] = /ruby/.test(cells[i + 3] || '') ? 1 : 0; }
});

// ---------- helpers ----------
function setDie(f) { D.DIE.length = 0; for (let i = 0; i < 6; i++) D.DIE.push(f); }
// a game parked in the brew phase. o: round, sets (all books), setObj, card, vp[], rubies, die (face, default 'none' = no effect)
function mk(np, o) { o = o || {}; const G = T.game(np, o); setDie(o.die || 'none'); G.fdeck = G.fdeck.concat(G.fdisc.splice(0)); return G; }
// put chips straight into a seat's pot: items 'W3@10' (key@space the chip sits on). The seat is then done brewing.
function fix(G, seat, items, o) {
  o = o || {}; const p = P(G, seat); T.order(G, seat, items.map(s => s.split('@')[0]));
  p.pot = p.bag.splice(0).reverse(); p.pot.forEach((c, i) => { c.pos = +items[i].split('@')[1]; });
  p.st = 'done'; p.boom = !!o.boom; p.prot = !!o.prot; p.q = null; if (o.bag) T.bagTail(G, seat, o.bag);
}
const dflt = (G, s) => { const p = P(G, s), ms = CF.moves(G, s); let m = ms[0]; if (p.q && p.q.h === 'restart') m = ms.find(x => x.yes === false) || m; const o = Object.assign({}, m); delete o.label; T.ok(G, s, o); };
// bring every seat to "done" with the simplest play, answering questions with the default
function settle(G) { for (let g = 0; g < 60 && G.phase === 'brew'; g++) { let moved = false; for (const p of G.players) { if (p.st === 'done') continue; moved = true; if (p.q) dflt(G, p.seat); else if (p.st === 'draw') { if (!p.pot.length) { T.order(G, p.seat, ['O1']); T.draw(G, p.seat); } else T.stop(G, p.seat); } } if (!moved) break; } }
// start the evaluation of a hand-built round and answer with `ans` (see T.finish); next round's fortune card is forced to a harmless one
function go(G, ans) { if (G.round < 9) G.force = 'thick'; CF._.adv(G); T.finish(G, ans); }
function toWait(G) { if (G.round < 9) G.force = 'thick'; CF._.adv(G); }
const hist = (G, s) => G.hist.filter(h => h.seat === s).pop();
const pick = (want) => (s, q, ms) => ms.find(m => Object.keys(want).every(k => J(m[k]) === J(want[k])));
const choose = (map) => (s, q, ms) => { const w = map[q.h]; if (!w) return undefined; const m = ms.find(x => Object.keys(w).every(k => J(x[k]) === J(w[k]))); if (!m) throw new Error('no ' + q.h + ' move ' + J(w) + ' in ' + J(ms.map(x => { const y = Object.assign({}, x); delete y.label; return y; }))); return m; };
const bagKeys = p => p.bag.map(c => c.c + c.v).sort();
const countKey = (p, k) => p.bag.concat(p.pot, p.newChips).filter(c => c.c + c.v === k).length;
const logIdx = (G, re) => G.log.findIndex(l => re.test(l.t));
function shopMoves(G, s) { return CF.moves(G, s).filter(m => m.t === 'buy'); }
function card(G, id, round) { if (round) G.round = round; G.force = id; CF._.startRound(G); }
function autoplay(G) { for (let g = 0; g < 4000 && G.phase !== 'over'; g++) { let any = false; for (const s of CF.pending(G).slice()) { const ms = CF.moves(G, s); if (!ms.length) continue; const p = P(G, s); let m = ms[0]; if (G.phase === 'brew' && !p.q) { const dr = ms.find(x => x.t === 'draw'), st = ms.find(x => x.t === 'stop'); m = (dr && p.pot.length < 3) ? dr : (st || dr || m); } const o = Object.assign({}, m); delete o.label; if (CF.apply(G, s, o).ok) any = true; } if (!any) throw new Error('autoplay stuck in ' + G.phase + ' round ' + G.round); } }

// =====================================================  A. Setup
rule(1, () => { for (const np of [2, 3, 4]) { const G = CF.newGame({ players: np, seed: 3 }); eq(G.players.length, np, 'seats'); const ids = new Set(); for (const p of G.players) { yes(Array.isArray(p.bag) && Array.isArray(p.pot) && 'flask' in p && 'droplet' in p && 'rat' in p && 'vp' in p, 'seat fields'); p.bag.forEach(c => ids.add(c.i)); } eq(ids.size, 9 * np, 'every seat owns its own chips'); } });
rule(2, () => { eq(D.rounds, 9); const G = CF.newGame({ players: 2, seed: 5 }); autoplay(G); eq([G.phase, G.round], ['over', 9]); eq(G.hist.filter(h => h.seat === 0).length, 9, 'rounds played'); });
rule(3, () => { for (const np of [2, 4]) { const G = CF.newGame({ players: np, seed: 8 }); for (const p of G.players) eq(bagKeys(p), ['G1', 'O1', 'W1', 'W1', 'W1', 'W1', 'W2', 'W2', 'W3']); } });
rule(4, () => { const G = CF.newGame({ players: 3, seed: 2 }); for (const p of G.players) eq([p.vp, p.droplet, p.flask, p.rat, p.rubies], [0, 0, true, 0, 1]); });
rule(5, () => { const want = { W1: 20, W2: 8, W3: 4, O1: 22, G1: 15, G2: 8, G4: 13, B1: 12, B2: 8, B4: 10, R1: 12, R2: 8, R4: 10, Y1: 13, Y2: 8, Y4: 10, P1: 17, K1: 17 }; eq(D.SUPPLY, want); eq(Object.values(want).reduce((a, b) => a + b, 0), 215); const G = CF.newGame({ players: 4, seed: 1 }); eq(G.supply.W1, 20 - 16, 'start bags come out of the box'); });
rule(6, () => { eq(D.FORTUNE.length, 24); eq(D.FORTUNE.filter(f => f.kind === 'blue').length, 11); eq(D.FORTUNE.filter(f => f.kind === 'purple').length, 13); });
rule(7, () => { const G = CF.newGame({ players: 2, seed: 11 }); autoplay(G); const ids = G.hist.filter(h => h.seat === 0).map(h => h.fortune); eq(ids.length, 9); eq(new Set(ids).size, 9, 'no repeat: ' + ids.join(',')); });
function shopColours(G) { return Array.from(new Set(shopMoves(G, 0).filter(m => m.items.length === 1).map(m => m.items[0][0]))).sort().join(''); }
function shopRound(r) { const G = mk(2, { round: r, vp: [0, 0] }); P(G, 0).rubies = 0; fix(G, 0, ['O1@12'], {}); fix(G, 1, ['O1@1']); toWait(G); eq(CF.pending(G)[0], 0, 'seat 0 shops first'); return shopColours(G); }
rule(8, () => eq(shopRound(1), 'BGKOR'));
rule(9, () => eq(shopRound(2), 'BGKORY'));
rule(10, () => { eq(shopRound(3), 'BGKOPRY'); eq(shopRound(5), 'BGKOPRY'); });
rule(11, () => { const G = mk(2, { round: 5 }); fix(G, 0, ['O1@1']); fix(G, 1, ['O1@1']); const w0 = G.supply.W1; go(G); eq(G.round, 6); eq(G.supply.W1, w0 - 2, 'one white 1 per player from the supply'); eq(P(G, 0).bag.length, 2, 'pot chip + the new white 1'); yes(bagKeys(P(G, 0)).includes('W1')); const H = mk(2, { round: 4 }); fix(H, 0, ['O1@1']); fix(H, 1, ['O1@1']); const v0 = H.supply.W1; go(H); eq(H.round, 5); eq([H.supply.W1, P(H, 0).bag.length], [v0, 1], 'no extra chip before round 6'); });
rule(12, () => { const G = mk(3, {}); const seen = [G.start]; for (let r = 0; r < 4; r++) { G.force = 'thick'; for (const p of G.players) { T.order(G, p.seat, ['O1']); T.draw(G, p.seat); } seen.push(G.start); } eq(seen, [0, 1, 2, 0, 1]); });
rule(13, () => { for (let s = 1; s <= 4; s++) { const G = CF.newGame({ players: 2, seed: 1, setMode: s }); eq(G.sets, { G: s, B: s, R: s, Y: s, P: s }); } const G = CF.newGame({ players: 2, seed: 1, sets: { G: 4, B: 3, R: 2, Y: 1, P: 4 } }); eq(G.sets, { G: 4, B: 3, R: 2, Y: 1, P: 4 }); const mix = new Set(); for (let sd = 1; sd < 30; sd++) { const H = CF.newGame({ players: 2, seed: sd, setMode: 'random' }); for (const c of 'GBRYP') { yes(H.sets[c] >= 1 && H.sets[c] <= 4, 'set range'); } mix.add(J(H.sets)); } yes(mix.size > 5, 'random mixes differ'); });
rule(14, () => { const G = CF.newGame({ players: 4, seed: 4 }); eq(CF.checkInvariants(G), []); autoplay(G); eq(CF.checkInvariants(G), [], 'after a whole game'); const H = mk(2); H.supply.G4 = 0; eq(CF._.take(H, 'G4'), null, 'an empty supply gives nothing'); });

// =====================================================  B. Track and placing chips
rule(15, () => { eq(EXP.c.length, 54); const bad = []; for (let i = 0; i < 54; i++) if (D.COINS[i] !== EXP.c[i]) bad.push('space ' + i + ' coins ' + D.COINS[i] + ' want ' + EXP.c[i]); eq(bad, []); });
rule(16, () => { const bad = []; for (let i = 0; i < 54; i++) if (D.VP[i] !== EXP.v[i]) bad.push('space ' + i + ' vp ' + D.VP[i] + ' want ' + EXP.v[i]); eq(bad, []); });
rule(17, () => { const want = [5, 9, 13, 16, 20, 24, 28, 30, 34, 36, 40, 42, 46, 50, 52]; eq(EXP.r.map((r, i) => r ? i : -1).filter(i => i >= 0), want, 'table'); eq(D.RUBY.map((r, i) => r ? i : -1).filter(i => i >= 0), want, 'engine'); });
rule(18, () => { eq([D.COINS[53], D.VP[53], D.RUBY[53]], [35, 15, 0]); eq(D.SPOON, 53); });
rule(19, () => { const G = mk(2); T.order(G, 0, ['W3']); T.draw(G, 0); eq(T.pot(G, 0), ['W3@3']); });
rule(20, () => { const G = mk(2); T.order(G, 0, ['W2', 'O1', 'G1', 'W3']); T.draw(G, 0, 4); eq(T.pot(G, 0), ['W2@2', 'O1@3', 'G1@4', 'W3@7']); });
rule(21, () => { const G = mk(2); P(G, 0).droplet = 50; T.order(G, 0, ['W3']); T.draw(G, 0); eq(T.pot(G, 0), ['W3@52']); eq(CF.spaceOf(P(G, 0)), 53); T.stop(G, 0); settle(G); go(G); eq([hist(G, 0).space, hist(G, 0).coins, hist(G, 0).vp], [53, 35, 15]); });
rule(22, () => { const G = mk(2); T.order(G, 0, ['O1', 'W3']); T.draw(G, 0, 2); eq(CF.spaceOf(P(G, 0)), 5); const H = mk(2); T.order(H, 0, ['W3', 'W3', 'W3']); T.draw(H, 0, 3); yes(P(H, 0).boom); eq(CF.spaceOf(P(H, 0)), 10, 'exploded pot'); });
rule(23, () => { const G = mk(2); P(G, 0).droplet = 2; T.order(G, 0, ['O1']); T.draw(G, 0); eq(T.pot(G, 0), ['O1@3']); });
rule(24, () => { const G = mk(2); P(G, 0).droplet = 2; P(G, 0).rat = 6; T.order(G, 0, ['O1']); T.draw(G, 0); eq(T.pot(G, 0), ['O1@7']); });

// =====================================================  C. Brewing
rule(25, () => { const firsts = new Set(), later = new Set(); for (let sd = 1; sd <= 40; sd++) { const G = mk(2, { seed: sd }); firsts.add(J(P(G, 0).bag.map(c => c.c + c.v))); fix(G, 0, ['O1@1', 'G1@2', 'W1@3', 'W1@4', 'W2@6', 'W3@9']); fix(G, 1, ['O1@1']); go(G); later.add(J(P(G, 0).bag.map(c => c.c + c.v))); } yes(firsts.size >= 20, 'bag orders vary by game: ' + firsts.size); yes(later.size >= 10, 'bag is reshuffled each round: ' + later.size); });
rule(26, () => { const G = mk(2); T.order(G, 0, ['W3', 'W3', 'W1']); T.draw(G, 0, 3); eq([CF.whiteSum(P(G, 0)), P(G, 0).boom], [7, false]); });
rule(27, () => { const G = mk(2); T.order(G, 0, ['W3', 'W3', 'W2']); T.draw(G, 0, 3); eq([CF.whiteSum(P(G, 0)), P(G, 0).boom], [8, true]); });
rule(28, () => { const G = mk(2); T.order(G, 0, ['W3', 'W3', 'G4', 'R4', 'Y4', 'O1', 'K1', 'W1']); T.draw(G, 0, 8); eq(P(G, 0).boom, false); });
rule(29, () => { const G = mk(2); T.order(G, 0, ['W3', 'W3', 'W2']); T.draw(G, 0, 3); eq(T.pot(G, 0), ['W3@3', 'W3@6', 'W2@8']); });
rule(30, () => { const G = mk(2); T.order(G, 0, ['W3', 'W3', 'W2', 'O1']); T.draw(G, 0, 3); yes(T.bad(G, 0, { t: 'draw' }), 'draw refused'); yes(!CF.moves(G, 0).some(m => m.t === 'draw'), 'no draw move'); });
rule(31, () => { const G = mk(2); T.order(G, 0, ['O1', 'O1', 'O1']); T.draw(G, 0); yes(CF.moves(G, 0).some(m => m.t === 'draw') && CF.moves(G, 0).some(m => m.t === 'stop')); T.draw(G, 0); T.ok(G, 0, { t: 'stop' }); eq(P(G, 0).pot.length, 2); });
rule(32, () => { const G = mk(2); yes(T.bad(G, 0, { t: 'stop' }), 'stop before the first draw refused'); });
rule(33, () => { const G = mk(2); T.order(G, 0, ['O1', 'O1']); T.draw(G, 0, 2); eq(P(G, 0).st, 'done'); yes(T.bad(G, 0, { t: 'draw' })); });
rule(34, () => { const G = mk(2); T.order(G, 0, ['O1', 'W2', 'G1']); T.draw(G, 0, 2); T.ok(G, 0, { t: 'flask' }); eq(T.pot(G, 0), ['O1@1']); eq(P(G, 0).flask, false); eq(P(G, 0).bag.length, 2); });
rule(35, () => { const G = mk(2); T.order(G, 0, ['W1', 'O1']); T.draw(G, 0, 2); yes(T.bad(G, 0, { t: 'flask' }), 'last chip orange'); });
rule(36, () => { const G = mk(2); T.order(G, 0, ['W3', 'W3', 'W3']); T.draw(G, 0, 3); yes(P(G, 0).boom); yes(T.bad(G, 0, { t: 'flask' })); });
rule(37, () => { const G = mk(2); T.order(G, 0, ['W1', 'W1', 'W1']); T.draw(G, 0); T.ok(G, 0, { t: 'flask' }); T.draw(G, 0); yes(T.bad(G, 0, { t: 'flask' }), 'second use refused'); const H = mk(2); P(H, 0).flask = false; T.order(H, 0, ['W1', 'O1']); T.draw(H, 0); yes(T.bad(H, 0, { t: 'flask' }), 'empty flask'); });
rule(38, () => { const G = mk(2); T.order(G, 0, ['W3', 'O1']); T.draw(G, 0); T.ok(G, 0, { t: 'flask' }); eq(CF.whiteSum(P(G, 0)), 0); T.draw(G, 0, 2); eq(P(G, 0).pot.map(c => c.c + c.v).sort(), ['O1', 'W3'], 'the returned chip came out again'); });
rule(39, () => { const G = mk(2); T.order(G, 0, ['B1', 'O1', 'G1']); T.draw(G, 0); eq(P(G, 0).q && P(G, 0).q.h, 'crow', 'blue acts when drawn'); const H = mk(2); T.order(H, 0, ['W1', 'O1']); T.draw(H, 0, 2); eq(P(H, 0).q, null, 'white/orange: no power'); });
rule(40, () => { const G = mk(2, { round: 9 }); T.order(G, 0, ['O1', 'O1']); T.order(G, 1, ['O1', 'O1']); T.ok(G, 0, { t: 'draw' }); eq(P(G, 0).pot.length, 0, 'hidden until all have chosen'); T.ok(G, 1, { t: 'draw' }); eq([P(G, 0).pot.length, P(G, 1).pot.length], [1, 1], 'revealed together'); });
rule(41, () => { const G = mk(2, { round: 4 }); T.order(G, 0, ['O1', 'O1']); T.ok(G, 0, { t: 'draw' }); eq(P(G, 0).pot.length, 1, 'no waiting for seat 1'); });

// =====================================================  D. Rats
rule(42, () => { const G = mk(2, { round: 1 }); G.players[1].vp = 12; card(G, 'thick', 1); eq([P(G, 0).rat, P(G, 0).ratTails], [0, 0]); });
const tails = (m, L) => { let n = 0; for (let e = 0; e < 60; e += 2) if (e >= m && e + 1 <= L) n++; return n; };   // a tail hangs after every even number
rule(43, () => { const G = mk(4, { round: 2 }); G.players.forEach((p, i) => p.vp = [0, 3, 9, 14][i]); card(G, 'thick', 2); eq(G.players.map(p => p.ratTails), [0, 3, 9, 14].map(m => tails(m, 14)), 'tails'); eq(tails(0, 14), 7); });
rule(44, () => { const G = mk(3, { round: 3 }); G.players.forEach((p, i) => p.vp = [8, 20, 20][i]); card(G, 'thick', 3); eq(G.players.map(p => p.ratTails), [tails(8, 20), 0, 0]); eq(P(G, 1).rat, 0); });
rule(45, () => { const G = mk(2, { round: 3 }); P(G, 0).vp = 0; P(G, 1).vp = 10; P(G, 0).droplet = 2; card(G, 'thick', 3); eq(P(G, 0).rat, 2 + 5); const H = mk(2, { round: 3 }); H.players[1].vp = 40; H.players[0].droplet = 50; card(H, 'thick', 3); eq(P(H, 0).rat, 52, 'capped'); });
rule(46, () => { const G = mk(2, { round: 3 }); G.players[1].vp = 10; card(G, 'thick', 3); yes(P(G, 0).rat > 0, 'rat stone in play'); fix(G, 0, [space(3)]); fix(G, 1, [space(3)]); P(G, 0).rat = 5; go(G); eq(P(G, 0).rat, P(G, 0).droplet + P(G, 0).ratTails, 'a fresh count, not the old stone carried over'); });
rule(47, () => { const G = mk(2, { round: 2 }); G.players[1].vp = 6; card(G, 'clear', 2); eq([P(G, 0).rat, P(G, 0).ratTails], [0, 0], 'not counted before the answers'); T.ok(G, 0, { t: 'clear', o: 'vp' }); T.ok(G, 1, { t: 'clear', o: 'white' }); eq(P(G, 0).vp, 4); eq(P(G, 0).ratTails, tails(4, 6), 'counted from the new total'); });

// =====================================================  E. Evaluation
rule(48, () => {
  const G = mk(2, { round: 3, die: 'vp1' }); P(G, 0).rubies = 1; fix(G, 0, ['O1@1', 'O1@2', 'O1@3', 'O1@4', 'O1@5', 'O1@6', 'O1@7', 'G1@8']); fix(G, 1, ['O1@1']); G.force = 'thick';
  CF._.adv(G); T.finish(G, choose({ shop: { t: 'buy', items: ['O1'] }, ruby: { t: 'ruby', drop: 1, flask: false } }));
  const i = [/rolls the bonus die/, /Ruby moss/, /ruby space/, /scoring space/, /buys Marrow/, /moves the droplet 1 space \(rubies\)/].map(re => logIdx(G, re)); yes(i.every(x => x >= 0), 'all steps happened ' + J(i)); eq(i.slice().sort((a, b) => a - b), i, 'order die, powers, ruby, VP, buy, rubies');
});
const space = (n) => 'O1@' + (n - 1);          // a lone orange chip that makes the scoring space n
rule(49, () => { const G = mk(3, { round: 2, die: 'vp1' }); fix(G, 0, [space(11)]); fix(G, 1, [space(6)]); fix(G, 2, ['W3@10', 'W3@20', 'W3@30'], { boom: true }); go(G); eq(G.players.map((p, i) => hist(G, i).die.length), [1, 0, 0]); });
rule(50, () => { const G = mk(2, { round: 2, die: 'vp1' }); fix(G, 0, [space(15)]); fix(G, 1, [space(16)]); eq([D.COINS[15], D.COINS[16]], [15, 15]); go(G); eq([hist(G, 0).die.length, hist(G, 1).die.length], [0, 1]); });
rule(51, () => { const G = mk(2, { round: 2, die: 'vp1' }); fix(G, 0, [space(15)]); fix(G, 1, [space(15)]); go(G); eq([hist(G, 0).die.length, hist(G, 1).die.length], [1, 1]); });
rule(52, () => { const G = mk(2, { round: 2, die: 'vp1' }); fix(G, 0, ['W3@10', 'W3@20', 'W3@30'], { boom: true }); fix(G, 1, [space(3)]); go(G); eq([hist(G, 0).die.length, hist(G, 1).die.length], [0, 1]); });
rule(53, () => { const G = mk(2, { round: 2, die: 'vp1' }); fix(G, 0, ['W3@10', 'W3@20', 'W2@30'], { boom: true }); fix(G, 1, ['W3@11', 'W3@21', 'W2@31'], { boom: true }); go(G); eq([hist(G, 0).die.length, hist(G, 1).die.length], [0, 0]); });
function dieCase(face, check) { const G = mk(2, { round: 2, die: face }); const sup = G.supply.O1; fix(G, 0, [space(11)]); fix(G, 1, [space(3)]); P(G, 0).rubies = 0; const bag0 = P(G, 0).bag.length + 1; go(G); check(G, bag0, sup); }
rule(54, () => dieCase('vp1', G => eq(P(G, 0).vp, EXP.v[11] + 1)));
rule(55, () => dieCase('vp2', G => eq(P(G, 0).vp, EXP.v[11] + 2)));
rule(56, () => dieCase('ruby', G => eq(P(G, 0).rubies, 1)));
rule(57, () => dieCase('drop', G => eq(P(G, 0).droplet, 1)));
rule(58, () => dieCase('orange', (G, bag0, sup) => { eq(P(G, 0).bag.length, bag0 + 1); eq(bagKeys(P(G, 0)).filter(k => k === 'O1').length, 2, 'the pot O1 and the gift'); }));
rule(59, () => { D.DIE.length = 0; DIE_ORIG.forEach(f => D.DIE.push(f)); eq(D.DIE.length, 6); eq(new Set(D.DIE).size, 5, 'six faces, five outcomes'); eq(Array.from(new Set(D.DIE)).sort(), ['drop', 'orange', 'ruby', 'vp1', 'vp2']); });
rule(60, () => { const G = mk(2, { round: 3 }); G.start = 1; P(G, 0).rubies = 0; P(G, 1).rubies = 0; fix(G, 0, ['O1@1', 'G1@2']); fix(G, 1, ['O1@1', 'G1@2']); go(G); const a = logIdx(G, /Ann takes 1 ruby \(Ruby moss\)/), b = logIdx(G, /Bo takes 1 ruby \(Ruby moss\)/); yes(a >= 0 && b >= 0 && b < a, 'start player (seat 1) first: Bo ' + b + ' Ann ' + a); });
rule(61, () => { const G = mk(2, { round: 2 }); P(G, 0).rubies = 0; fix(G, 0, ['W3@2', 'W3@3', 'W3@4'], { boom: true }); fix(G, 1, [space(3)]); go(G); eq(P(G, 0).rubies, 1, 'space 5 has a ruby'); });
rule(62, () => { const G = mk(2, { round: 2 }); fix(G, 0, [space(15)]); fix(G, 1, [space(3)]); toWait(G); eq(P(G, 0).q && P(G, 0).q.h, 'shop', 'shopping offered'); eq(P(G, 0).q.d.coins, 15); eq(P(G, 0).vp, 3, 'VP already scored'); });
rule(63, () => { const mkb = () => { const G = mk(2, { round: 2 }); fix(G, 0, ['W3@3', 'W3@6', 'W3@9'].slice(0, 3).map((s, i) => ['W3@3', 'W3@6', 'W2@9'][i]), { boom: true }); P(G, 0).rubies = 0; fix(G, 1, [space(3)]); return G; };
  const A = mkb(); toWait(A); eq(A.players[0].q.h, 'de'); eq(A.players[0].q.d.vp, EXP.v[10]); T.ok(A, 0, { t: 'de', o: 'vp' }); yes(!(P(A, 0).q && P(A, 0).q.h === 'shop'), 'VP chosen: no shopping'); eq(P(A, 0).vp, EXP.v[10]);
  const B = mkb(); toWait(B); T.ok(B, 0, { t: 'de', o: 'buy' }); eq(P(B, 0).vp, 0, 'coins chosen: no VP'); eq(P(B, 0).q && P(B, 0).q.h, 'shop'); });
const withShop = (coinsSpace, rd, f) => { const G = mk(2, { round: rd || 3 }); fix(G, 0, [space(coinsSpace)]); fix(G, 1, [space(3)]); toWait(G); eq(P(G, 0).q.h, 'shop'); f(G); };
rule(64, () => { withShop(33, 3, G => { yes(T.bad(G, 0, { t: 'buy', items: ['G1', 'G2'] }), 'same colour refused'); T.ok(G, 0, { t: 'buy', items: ['G1', 'B1'] }); }); });
rule(65, () => withShop(33, 3, G => { yes(T.bad(G, 0, { t: 'buy', items: ['G1', 'B1', 'R1'] }), 'three refused'); }));

rule(66, () => { withShop(5, 3, G => { yes(T.bad(G, 0, { t: 'buy', items: ['R1'] }), 'R1 costs 6, only 5 coins'); yes(T.bad(G, 0, { t: 'buy', items: ['O1', 'G1'] }), '3 + 4 = 7 > 5'); const vp = P(G, 0).vp, ru = P(G, 0).rubies; T.ok(G, 0, { t: 'buy', items: ['G1'] }); eq([P(G, 0).vp, P(G, 0).rubies], [vp, ru], 'leftover coin gives nothing'); }); eq(CF.price(mk(2), 'G', 4), 14); eq(CF.price(mk(2), 'B', 4), 19); });
rule(67, () => withShop(33, 3, G => { G.supply.G4 = 0; yes(T.bad(G, 0, { t: 'buy', items: ['G4'] }), 'sold out'); T.ok(G, 0, { t: 'buy', items: ['B4'] }); }));
rule(68, () => { withShop(33, 1, G => { yes(T.bad(G, 0, { t: 'buy', items: ['Y1'] }), 'yellow before round 2'); yes(T.bad(G, 0, { t: 'buy', items: ['P1'] }), 'purple'); yes(T.bad(G, 0, { t: 'buy', items: ['W1'] }), 'white'); yes(T.bad(G, 0, { t: 'buy', items: ['O2'] }), 'orange 2'); }); withShop(33, 2, G => yes(T.bad(G, 0, { t: 'buy', items: ['P1'] }), 'purple in round 2')); });
rule(69, () => { const G = mk(2, { round: 3 }); fix(G, 0, [space(33)]); fix(G, 1, [space(6)]); toWait(G); T.ok(G, 0, { t: 'buy', items: ['G4'] }); eq(P(G, 1).q && P(G, 1).q.h, 'shop', 'seat 1 still shopping'); eq(P(G, 0).newChips.map(c => c.c + c.v), ['G4']); eq(countKey(P(G, 0), 'G4'), 1); eq(P(G, 0).bag.some(c => c.c === 'G' && c.v === 4), false, 'not in the bag yet'); T.ok(G, 1, { t: 'buy', items: [] }); yes(P(G, 0).bag.some(c => c.c === 'G' && c.v === 4), 'in the bag after clean-up'); });
rule(70, () => { const G = mk(3, { round: 3 }); G.start = 2; for (let s = 0; s < 3; s++) fix(G, s, [space(10)]); toWait(G); eq(CF.pending(G), [2], 'start player buys first'); T.ok(G, 2, { t: 'buy', items: [] }); eq(CF.pending(G), [0]); });
function rubyCase(rub, flask, f) { const G = mk(2, { round: 3 }); P(G, 0).rubies = rub; P(G, 0).flask = flask; fix(G, 0, ['O1@1']); fix(G, 1, ['O1@1']); G.force = 'thick'; CF._.adv(G); const bn = { t: 'buy', items: [] }; while (P(G, 0).q && P(G, 0).q.h === 'shop' || P(G, 1).q && P(G, 1).q.h === 'shop') { const s = P(G, 0).q && P(G, 0).q.h === 'shop' ? 0 : 1; T.ok(G, s, bn); } f(G); }
rule(71, () => rubyCase(5, true, G => { eq(P(G, 0).q.h, 'ruby'); T.ok(G, 0, { t: 'ruby', drop: 2, flask: false }); eq([P(G, 0).droplet, P(G, 0).rubies], [2, 1], 'two droplet steps cost 4'); }));
rule(72, () => { rubyCase(3, false, G => { yes(CF.moves(G, 0).some(m => m.flask === true), 'refill offered'); T.ok(G, 0, { t: 'ruby', drop: 0, flask: true }); eq([P(G, 0).flask, P(G, 0).rubies], [true, 1]); }); rubyCase(4, true, G => { yes(T.bad(G, 0, { t: 'ruby', drop: 0, flask: true }), 'a full flask cannot be refilled'); }); });
rule(73, () => rubyCase(1, true, G => { eq(P(G, 0).q, null, 'no ruby question'); eq(P(G, 0).rubies, 1); }));
rule(74, () => { const G = mk(2, { round: 3 }); fix(G, 0, ['O1@1', 'G2@3']); fix(G, 1, ['O1@1']); P(G, 0).rat = 4; go(G); eq([P(G, 0).pot.length, P(G, 0).rat, G.round, G.start], [0, 0, 4, 1]); eq(bagKeys(P(G, 0)).includes('G2') && bagKeys(P(G, 0)).includes('O1'), true, 'chips back in the bag'); eq(P(G, 0).bag.length, 2); });
rule(75, () => { const G = mk(2, { round: 2 }); P(G, 0).rubies = 0; fix(G, 0, ['W3@2', 'W3@3', 'W3@4'], { boom: true }); fix(G, 1, [space(3)]); go(G, choose({ de: { t: 'de', o: 'buy' } })); eq(P(G, 0).rubies, 1); G.hist.pop(); });

// =====================================================  F. End of the game
function last(vps, pots, o) { o = o || {}; const G = mk(pots.length, { round: 9 }); pots.forEach((it, i) => { P(G, i).vp = vps[i]; P(G, i).rubies = (o.rub || [])[i] || 0; fix(G, i, it, (o.boom || [])[i] ? { boom: true } : {}); }); toWait(G); return G; }
rule(76, () => { const G = last([0, 0], [[space(20)], [space(20)]]); eq(G.phase, 'over'); yes(!G.log.some(l => /buys/.test(l.t))); eq(G.players.some(p => p.q), false); });
rule(77, () => { const G = last([0, 0], [[space(15)], [space(18)]]); eq(P(G, 0).vp, EXP.v[15] + Math.floor(EXP.c[15] / 5)); eq(P(G, 1).vp, EXP.v[18] + Math.floor(EXP.c[18] / 5), '16 coins = 3 VP'); });

rule(78, () => { const G = mk(2, { round: 9 }); fix(G, 0, ['W3@1', 'W3@2', 'W2@5'], { boom: true }); fix(G, 1, [space(3)]); P(G, 0).rubies = 0; toWait(G); eq(P(G, 0).vp, 1, 'space 6: 1 VP or 6 coins = 1 VP, never 2'); });
rule(79, () => { const G = last([0, 0], [[space(3)], [space(3)]], { rub: [5, 1] }); eq([P(G, 0).vp, P(G, 1).vp], [Math.floor(EXP.c[3] / 5) + 2, 0]); });
rule(80, () => { const G = last([10, 4, 7], [[space(3)], [space(3)], [space(3)]]); eq([G.winners, G.winner], [[0], 0]); });
rule(81, () => { const G = last([0, 0], [[space(11)], [space(12)]]); eq([P(G, 0).vp, P(G, 1).vp], [4, 4], 'level on points'); eq(G.winners, [1], 'furthest chip wins the tie'); });
rule(82, () => { const G = last([0, 0], [[space(11)], [space(11)]]); eq(G.winners, [0, 1]); eq(G.winner, -1); });
rule(83, () => { const G = last([0, 0], [[space(3)], [space(3)]], { rub: [4, 4] }); eq([P(G, 0).droplet, P(G, 0).flask], [0, true], 'no spending'); eq(P(G, 0).vp, Math.floor(EXP.c[3] / 5) + 2); });

// =====================================================  G. Chip powers
rule(84, () => { const G = mk(2, { round: 3 }); eq(CF.price(G, 'O', 1), 3); fix(G, 0, [space(33)]); fix(G, 1, [space(3)]); toWait(G); yes(shopMoves(G, 0).every(m => m.items.every(k => k[0] !== 'W')), 'white never sold'); eq(CF.effOf(G, 'W'), 'none'); eq(CF.effOf(G, 'O'), 'none'); });
function blackCase(np, counts, seat, want) { const G = mk(np, { round: 3 }); counts.forEach((n, s) => { const it = []; for (let i = 0; i < n; i++) it.push('K1@' + (i + 1)); if (!n) it.push('O1@1'); fix(G, s, it); P(G, s).rubies = 0; }); go(G); eq([P(G, seat).droplet, P(G, seat).rubies], want); }
rule(85, () => blackCase(2, [2, 2], 0, [1, 0]));
rule(86, () => { blackCase(2, [2, 1], 0, [1, 1]); });
rule(87, () => { blackCase(2, [1, 2], 0, [0, 0]); });
rule(88, () => { blackCase(3, [2, 1, 3], 0, [1, 0]); blackCase(3, [2, 2, 1], 0, [1, 0]); });       // seat 0: left = seat 1 (1 black), right = seat 2 (3): more than left only
rule(89, () => blackCase(3, [3, 1, 2], 0, [1, 1]));
rule(90, () => { blackCase(3, [1, 2, 3], 0, [0, 0]); blackCase(3, [2, 2, 2], 0, [0, 0]); });
const hasRubies = (items, first) => { const G = mk(2, { round: 3 }); P(G, 0).rubies = 0; fix(G, 0, items); fix(G, 1, ['O1@1']); go(G); return P(G, 0).rubies; };
rule(91, () => eq(hasRubies(['O1@1', 'G1@2']), 1));
rule(92, () => { eq(hasRubies(['G1@1', 'O1@2', 'O1@3']), 0); eq(hasRubies(['G1@1', 'G4@5']), 2); });
rule(93, () => {
  const G = mk(2, { round: 1, setObj: { G: 2, B: 1, R: 1, Y: 1, P: 1 } }); fix(G, 0, ['O1@1', 'G1@2']); fix(G, 1, ['O1@1']); const o0 = countKey(P(G, 0), 'O1'); go(G); eq(countKey(P(G, 0), 'O1'), o0 + 1, 'green 1 gives an orange 1');
  const H = mk(2, { round: 1, setObj: { G: 2, B: 1, R: 1, Y: 1, P: 1 } }); fix(H, 0, ['O1@1', 'G2@3']); fix(H, 1, ['O1@1']); toWait(H); eq(P(H, 0).q.h, 'g2'); eq(P(H, 0).q.d.opts, ['B1', 'R1'], 'green 2: blue 1 or red 1'); T.ok(H, 0, { t: 'g2', o: 'R1' }); yes(countKey(P(H, 0), 'R1') === 1);
  const I = mk(2, { round: 1, setObj: { G: 2, B: 1, R: 1, Y: 1, P: 1 } }); fix(I, 0, ['O1@1', 'G4@5']); fix(I, 1, ['O1@1']); I.force = 'thick'; CF._.adv(I); eq(P(I, 0).q && P(I, 0).q.h === 'g2', false, 'round 1: yellow/purple not out, nothing to take');
  const K = mk(2, { round: 3, setObj: { G: 2, B: 1, R: 1, Y: 1, P: 1 } }); fix(K, 0, ['O1@1', 'G4@5']); fix(K, 1, ['O1@1']); toWait(K); eq(P(K, 0).q.d.opts, ['Y1', 'P1'], 'green 4 with both books out'); });
const slideGame = (items, o) => { const G = mk(2, { round: 3, die: 'vp1', setObj: { G: 3, B: 1, R: 1, Y: 1, P: 1 } }); P(G, 0).rubies = 0; fix(G, 0, items); fix(G, 1, o && o.other || ['O1@1']); return G; };
rule(94, () => { const G = slideGame(['W3@3', 'W3@6', 'W1@7', 'G2@10']); toWait(G); eq(P(G, 0).q.h, 'g3'); T.ok(G, 0, { t: 'g3', yes: true }); eq(P(G, 0).res.space, 13, 'last chip 10 + green 2 = 12, space 13'); });
rule(95, () => { const G = slideGame(['W3@3', 'W2@5', 'W1@6', 'G2@10']); toWait(G); eq(P(G, 0).q && P(G, 0).q.h === 'g3', false); eq(P(G, 0).res.space, 11); });
rule(96, () => { const G = slideGame(['W3@3', 'W3@6', 'W1@7', 'G2@10'], { other: ['O1@11'] }); toWait(G); T.ok(G, 0, { t: 'g3', yes: true }); const h = G.players.map((p, i) => p.res); eq(P(G, 1).res.die.length, 1, 'the die went on the space before the slide (11 < 12)'); eq(P(G, 0).res.die.length, 0); yes(P(G, 0).rubies >= 1, 'ruby of the new space 13'); eq(P(G, 0).res.coins, 13); });
rule(97, () => { const G = mk(2, { round: 3, setObj: { G: 4, B: 1, R: 1, Y: 1, P: 1 } }); P(G, 0).rubies = 3; fix(G, 0, ['O1@1', 'G1@2']); fix(G, 1, ['O1@1']); toWait(G); eq(P(G, 0).q.h, 'g4'); eq(P(G, 0).q.d.max, 1); T.ok(G, 0, { t: 'g4', n: 1 }); eq([P(G, 0).droplet, P(G, 0).rubies], [1, 2]); });
const bset = (n) => ({ G: 1, B: n, R: 1, Y: 1, P: 1 });
rule(98, () => { for (const [k, n] of [['B1', 1], ['B2', 2], ['B4', 4]]) { const G = mk(2, { setObj: bset(1) }); T.order(G, 0, [k, 'O1', 'O1', 'O1', 'O1', 'O1']); T.draw(G, 0); eq(P(G, 0).q.h, 'crow'); eq(P(G, 0).hold.length, n, k); } const G = mk(2, { setObj: bset(1) }); T.order(G, 0, ['B1', 'G1', 'O1']); T.draw(G, 0); T.ok(G, 0, { t: 'crow', idx: 0 }); eq(T.pot(G, 0), ['B1@1', 'G1@2']); const H = mk(2, { setObj: bset(1) }); T.order(H, 0, ['B2', 'G1', 'O1', 'W1']); T.draw(H, 0); T.ok(H, 0, { t: 'crow', idx: -1 }); eq(P(H, 0).pot.length, 1); eq(P(H, 0).bag.length, 3, 'unplaced chips went back'); });
rule(99, () => { const G = mk(2, { setObj: bset(2) }); T.order(G, 0, ['W3', 'W3', 'B2', 'W3']); T.draw(G, 0, 4); yes(P(G, 0).boom && P(G, 0).prot, 'covered explosion'); settle(G); go(G); const h = hist(G, 0); eq([h.boom, h.prot, h.mode, h.die.length], [true, true, 'both', 0]); });
rule(100, () => { const G = mk(2, { setObj: bset(2) }); T.order(G, 0, ['W3', 'W3', 'B1', 'B1', 'O1', 'W3']); T.draw(G, 0, 6); yes(P(G, 0).boom); eq(P(G, 0).prot, false, 'covers do not add up'); const H = mk(2, { setObj: bset(2) }); T.order(H, 0, ['W3', 'W3', 'B1', 'W1', 'W3']); T.draw(H, 0, 5); eq([P(H, 0).boom, P(H, 0).prot], [true, false], 'a cover of 1 does not reach the 2nd chip'); });
rule(101, () => { const G = mk(2, { setObj: bset(3) }); T.order(G, 0, ['O1', 'O1', 'O1', 'O1', 'B1']); T.draw(G, 0, 5); eq(P(G, 0).rubies, 2); const H = mk(2, { setObj: bset(3) }); T.order(H, 0, ['O1', 'O1', 'O1', 'B1']); T.draw(H, 0, 4); eq(P(H, 0).rubies, 1, 'off the ruby space'); });
rule(102, () => { const G = mk(2, { setObj: bset(4) }); T.order(G, 0, ['O1', 'O1', 'O1', 'B2']); T.draw(G, 0, 4); eq(T.pot(G, 0)[3], 'B2@5'); eq(P(G, 0).vp, 2); const H = mk(2, { setObj: bset(4) }); T.order(H, 0, ['O1', 'O1', 'O1', 'B1']); T.draw(H, 0, 4); eq(P(H, 0).vp, 0, 'off the ruby space'); });
const rset = (n) => ({ G: 1, B: 1, R: n, Y: 1, P: 1 });
rule(103, () => { const G = mk(2, { setObj: rset(1) }); T.order(G, 0, ['O1', 'O1', 'R1']); T.draw(G, 0, 3); eq(T.pot(G, 0)[2], 'R1@4'); const H = mk(2, { setObj: rset(1) }); T.order(H, 0, ['O1', 'O1', 'O1', 'R1']); T.draw(H, 0, 4); eq(T.pot(H, 0)[3], 'R1@6'); const I = mk(2, { setObj: rset(1) }); T.order(I, 0, ['G1', 'R1']); T.draw(I, 0, 2); eq(T.pot(I, 0)[1], 'R1@2', 'no orange: no bonus'); });
rule(104, () => { const G = mk(2, { setObj: rset(2) }); T.order(G, 0, ['O1', 'R2', 'G1']); T.draw(G, 0, 2); eq(P(G, 0).side.length, 1); eq(T.pot(G, 0), ['O1@1']); T.stop(G, 0); eq(P(G, 0).q.h, 'side'); T.ok(G, 0, { t: 'side', o: 'place' }); eq(T.pot(G, 0), ['O1@1', 'R2@3']);
  const H = mk(2, { setObj: rset(2) }); T.order(H, 0, ['R2', 'O1']); T.draw(H, 0, 2); T.stop(H, 0); T.ok(H, 0, { t: 'side', o: 'keep' }); eq(P(H, 0).side.length, 1, 'kept beside the cauldron'); yes(!bagKeys(P(H, 0)).includes('R2'));
  const I = mk(2, { setObj: rset(2) }); T.order(I, 0, ['R2', 'W3', 'W3', 'W3']); T.draw(I, 0, 4); yes(P(I, 0).boom); eq(P(I, 0).q && P(I, 0).q.h, 'side', 'offered even if exploded'); });
rule(105, () => { const G = mk(2, { setObj: rset(3) }); T.order(G, 0, ['W2', 'R1']); T.draw(G, 0, 2); eq(T.pot(G, 0)[1], 'R1@5'); const H = mk(2, { setObj: rset(3) }); T.order(H, 0, ['O1', 'R1']); T.draw(H, 0, 2); eq(T.pot(H, 0)[1], 'R1@2'); });
rule(106, () => { const G = mk(2, { setObj: rset(4) }); T.order(G, 0, ['W1', 'R1', 'W1']); T.draw(G, 0, 3); eq(T.pot(G, 0), ['W1@1', 'R1@2', 'W1@4']); eq(CF.whiteSum(P(G, 0)), 2, 'still counts 1 for the explosion'); });
const yset = (n) => ({ G: 1, B: 1, R: 1, Y: n, P: 1 });
rule(107, () => { const G = mk(2, { setObj: yset(1) }); T.order(G, 0, ['W1', 'Y1', 'O1']); T.draw(G, 0, 2); eq(P(G, 0).q.h, 'y1'); T.ok(G, 0, { t: 'y1', yes: true }); eq([T.pot(G, 0), CF.whiteSum(P(G, 0))], [['Y1@2'], 0]); const H = mk(2, { setObj: yset(1) }); T.order(H, 0, ['O1', 'Y1']); T.draw(H, 0, 2); eq(P(H, 0).q, null, 'only after a white chip'); });
rule(108, () => { const G = mk(2, { setObj: yset(2) }); T.order(G, 0, ['Y2', 'O1', 'O1']); T.draw(G, 0, 3); eq(T.pot(G, 0), ['Y2@2', 'O1@4', 'O1@5'], 'only the next chip is doubled'); });
rule(109, () => { const G = mk(2, { setObj: yset(3) }); T.order(G, 0, ['Y1', 'W3', 'W3', 'W2']); T.draw(G, 0, 4); eq(P(G, 0).boom, false, 'limit 8'); const H = mk(2, { setObj: yset(3) }); T.order(H, 0, ['Y1', 'W3', 'W3', 'W3']); T.draw(H, 0, 4); eq(P(H, 0).boom, true, '9 > 8 with one yellow'); const I = mk(2, { setObj: yset(3) }); T.order(I, 0, ['Y1', 'Y1', 'Y1', 'W3', 'W3', 'W3']); T.draw(I, 0, 6); eq(P(I, 0).boom, false, 'limit 9 with three'); const J2 = mk(2, { setObj: yset(3) }); T.order(J2, 0, ['W3', 'W3', 'W2']); T.draw(J2, 0, 3); eq(P(J2, 0).boom, true, 'no yellow: 8 explodes'); });
rule(110, () => { const G = mk(2, { setObj: yset(4) }); T.order(G, 0, ['Y1', 'Y1', 'Y1', 'Y1']); T.draw(G, 0, 4); eq(T.pot(G, 0), ['Y1@2', 'Y1@5', 'Y1@9', 'Y1@10']); });
const pset = (n) => ({ G: 1, B: 1, R: 1, Y: 1, P: n });
function purple(n, set, ans) { const G = mk(2, { round: 3, setObj: pset(set) }); P(G, 0).rubies = 0; fix(G, 0, Array.from({ length: n }, (_, i) => 'P1@' + (i + 1))); fix(G, 1, ['O1@1']); const s = {}; for (const k in G.supply) s[k] = G.supply[k]; go(G, ans); return { G, p: P(G, 0), s }; }
rule(111, () => { let r = purple(1, 1); eq([r.p.vp, r.p.rubies, r.p.droplet], [1, 0, 0]); r = purple(2, 1); eq([r.p.vp, r.p.rubies, r.p.droplet], [1, 1, 0]); r = purple(3, 1); eq([r.p.vp, r.p.rubies, r.p.droplet], [2, 0, 1]); r = purple(4, 1); eq([r.p.vp, r.p.rubies, r.p.droplet], [2, 1, 1], '4 purples = same as 3; space 5 adds its ruby'); r = purple(3, 1, choose({ p1: { k: 1 } })); eq([r.p.vp, r.p.rubies, r.p.droplet], [1, 0, 0], 'a lower reward may be taken'); });
rule(112, () => { const r = purple(1, 2, choose({ p2: { set: [1] } })); eq([r.p.vp, r.p.rubies, countKey(r.p, 'K1')], [1, 1, 1]); });
rule(113, () => { const r = purple(2, 2, choose({ p2: { set: [2] } })); eq([r.p.vp, r.p.droplet, countKey(r.p, 'G1'), countKey(r.p, 'B2')], [3, 1, 1, 1]); });
rule(114, () => { const r = purple(3, 2, choose({ p2: { set: [3] } })); eq([r.p.vp, r.p.rubies, r.p.droplet, countKey(r.p, 'Y4')], [6, 1, 2, 1]); });
rule(115, () => { const G = mk(2, { round: 3, setObj: pset(3) }); fix(G, 0, ['P1@9', 'P1@10', 'P1@19', 'P1@20', 'P1@29', 'P1@30']); fix(G, 1, ['O1@1']); go(G); eq(P(G, 0).vp, 0 + 1 + 1 + 2 + 2 + 3 + EXP.v[31]); });
const bagOf = G => bagKeys(P(G, 0));
rule(116, () => { const G = mk(2, { round: 3, setObj: pset(4) }); fix(G, 0, ['G1@1', 'B2@3', 'P1@4']); fix(G, 1, ['O1@1']); go(G, choose({ p4: { from: 'G1', to: 'G2' } })); eq(bagOf(G), ['B2', 'G2', 'P1']); });
rule(117, () => { const G = mk(2, { round: 3, setObj: pset(4) }); fix(G, 0, ['G1@1', 'B2@3', 'P1@4', 'P1@5']); fix(G, 1, ['O1@1']); go(G, choose({ p4: { from: 'B2', to: 'B4' } })); eq(bagOf(G), ['B4', 'G1', 'P1', 'P1']); });
rule(118, () => { const G = mk(2, { round: 3, setObj: pset(4) }); fix(G, 0, ['G1@1', 'P1@3', 'P1@4', 'P1@5']); fix(G, 1, ['O1@1']); go(G, choose({ p4: { from: 'G1', to: 'G4' } })); eq(bagOf(G), ['G4', 'P1', 'P1', 'P1']); });

// =====================================================  H. Fortune cards
rule(119, () => { const G = mk(2, { round: 3, card: 'lucky7' }); fix(G, 0, ['W3@3', 'W3@6', 'W1@7']); fix(G, 1, ['W3@3', 'W2@5']); go(G); eq([P(G, 0).droplet, P(G, 1).droplet], [1, 0]); G.fcard; });
rule(120, () => { const G = mk(2, { round: 3 }); G.fcard = 'spilled'; fix(G, 0, ['W3@3', 'W3@6', 'W2@8'], { boom: true }); fix(G, 1, [space(4)]); toWait(G); eq(P(G, 1).q && P(G, 1).q.h, 'gift', 'left neighbour (seat 1) takes a 2-chip'); const h = CF.moves(G, 1).map(m => m.o).sort(); eq(h, ['B2', 'G2', 'R2', 'Y2'], 'any 2-chip of the books in play'); });
rule(121, () => { const G = mk(2, { card: 'doover' }); T.order(G, 0, ['O1', 'O1', 'O1', 'O1', 'O1', 'O1']); T.draw(G, 0, 5); yes(CF.moves(G, 0).some(m => m.t === 'restart'), 'offered after the 5th chip'); T.ok(G, 0, { t: 'restart', yes: true }); eq(P(G, 0).pot.length, 0); eq(P(G, 0).bag.length, 6); T.draw(G, 0, 5); yes(!CF.moves(G, 0).some(m => m.t === 'restart'), 'once only'); const H = mk(2, { card: 'doover' }); T.order(H, 0, ['W3', 'W3', 'O1', 'O1', 'W3']); T.draw(H, 0, 5); yes(P(H, 0).boom); yes(!CF.moves(H, 0).some(m => m.t === 'restart') && !(P(H, 0).q && P(H, 0).q.h === 'restart'), 'not after an exploding 5th chip'); });
rule(122, () => { const G = mk(2, { round: 3, die: 'vp1' }); G.fcard = 'twice'; fix(G, 0, [space(11)]); fix(G, 1, [space(3)]); go(G); eq(hist(G, 0).die.length, 2); eq(P(G, 0).vp, EXP.v[11] + 2); });
rule(123, () => { const G = mk(2, { card: 'thick' }); T.order(G, 0, ['W3', 'W3', 'W3']); T.draw(G, 0, 3); eq(P(G, 0).boom, false, '9'); const H = mk(2, { card: 'thick' }); T.order(H, 0, ['W3', 'W3', 'W2', 'W2']); T.draw(H, 0, 4); eq(P(H, 0).boom, true, '10'); });
rule(124, () => { const G = mk(2, { card: 'marrowfair' }); T.order(G, 0, ['O1', 'G1']); T.draw(G, 0, 2); eq(T.pot(G, 0), ['O1@2', 'G1@3']); });
rule(125, () => { const G = mk(2, { card: 'peek' }); T.order(G, 0, ['O1', 'G1', 'W1', 'W2', 'O1', 'O1', 'B1']); T.draw(G, 0); T.stop(G, 0); eq(P(G, 0).q.h, 'peek'); eq(P(G, 0).hold.length, 5); T.ok(G, 0, { t: 'peek', idx: 0 }); eq(P(G, 0).pot.length, 2); const H = mk(2, { card: 'peek' }); T.order(H, 0, ['W3', 'W3', 'W3']); T.draw(H, 0, 3); yes(P(H, 0).boom); eq(P(H, 0).q, null, 'exploded: no peek'); });
rule(126, () => { const G = mk(2, { round: 3 }); G.fcard = 'glint'; P(G, 0).rubies = 0; fix(G, 0, ['W3@2', 'W3@3', 'W2@4'], { boom: true }); fix(G, 1, [space(3)]); go(G, choose({ de: { t: 'de', o: 'vp' } })); eq(P(G, 0).vp, EXP.v[5] + 2, 'space 5 has a ruby'); });
rule(127, () => { const G = mk(2, { card: 'spring' }); P(G, 0).flask = false; settle(G); go(G); eq(P(G, 0).flask, true); });
rule(128, () => { const G = mk(2, { card: 'froth' }); T.order(G, 0, ['W2', 'W1', 'O1']); T.draw(G, 0); yes(CF.moves(G, 0).some(m => m.t === 'froth'), 'offered after the first white'); T.ok(G, 0, { t: 'froth' }); eq([P(G, 0).pot.length, P(G, 0).flask], [0, true], 'flask untouched'); T.draw(G, 0, 2); yes(!CF.moves(G, 0).some(m => m.t === 'froth'), 'only once'); });
rule(129, () => { const G = mk(2, { round: 3 }); G.fcard = 'spark'; P(G, 0).rubies = 0; fix(G, 0, ['O1@4']); fix(G, 1, [space(3)]); go(G); eq(P(G, 0).rubies, 2); });
const roundStart = (id, rd, o) => { const G = mk(2, Object.assign({ round: rd || 3 }, o || {})); card(G, id, rd || 3); return G; };
rule(130, () => { const G = roundStart('pick'); const o = CF.moves(G, 0).map(m => m.o).sort(); eq(o, ['B2', 'G2', 'K1', 'R2', 'Y2', 'rubies']); T.ok(G, 0, { t: 'pick', o: 'rubies' }); eq(P(G, 0).rubies, 4); T.ok(G, 1, { t: 'pick', o: 'K1' }); yes(countKey(P(G, 1), 'K1') === 1); });
rule(131, () => { const G = roundStart('slide'); eq(G.players.map(p => p.droplet), [1, 1]); });
rule(132, () => { const G = mk(3, { round: 3 }); P(G, 1).rubies = 0; card(G, 'swap', 3); eq(P(G, 1).q, null, 'no ruby: not asked'); eq(CF.moves(G, 0).map(m => m.o).sort(), ['', 'B1', 'G1', 'O1', 'R1', 'Y1']); T.ok(G, 0, { t: 'swap', o: 'G1' }); eq(P(G, 0).rubies, 0); yes(countKey(P(G, 0), 'G1') === 2); });
rule(133, () => { const G = mk(3, { round: 3 }); G.players.forEach((p, i) => p.rubies = [3, 1, 1][i]); card(G, 'alms', 3); eq(G.players.map(p => p.rubies), [3, 2, 2]); });
rule(134, () => { const G = mk(3, { round: 3 }); G.players.forEach((p, i) => p.vp = [5, 2, 2][i]); const c0 = countKey(P(G, 0), 'G1'); card(G, 'underdog', 3); eq([countKey(P(G, 0), 'G1') - c0, countKey(P(G, 1), 'G1') - c0, countKey(P(G, 2), 'G1') - c0], [0, 1, 1]); });
rule(135, () => { const G = roundStart('clear'); T.ok(G, 0, { t: 'clear', o: 'vp' }); eq(P(G, 0).vp, 4); const w = P(G, 1).bag.filter(c => c.c === 'W' && c.v === 1).length; T.ok(G, 1, { t: 'clear', o: 'white' }); eq(P(G, 1).bag.filter(c => c.c === 'W' && c.v === 1).length, w - 1); });
rule(136, () => { const G = mk(2, { round: 3 }); G.players[1].vp = 10; const b = (() => { const H = mk(2, { round: 3 }); H.players[1].vp = 10; card(H, 'thick', 3); return P(H, 0).rat; })(); card(G, 'swarm', 3); eq(P(G, 0).rat, b + P(G, 0).ratTails, 'moved again by the tail count'); eq(P(G, 0).rat, tails(0, 10) * 2); });
rule(137, () => { for (let sd = 1; sd <= 12; sd++) { const G = mk(3, { round: 3, seed: sd }); G.force = 'dip'; CF._.startRound(G); const sums = G.players.map(p => { const e = G.events.filter(x => x.t === 'peek' && x.seat === p.seat).pop(); eq(e.chips.length, 5, 'draws 5'); return e.chips.reduce((a, c) => a + c.v, 0); }); const m = Math.min.apply(null, sums); G.players.forEach((p, i) => { if (sums[i] === m) eq([countKey(p, 'B2'), p.rubies], [1, 1], 'seed ' + sd + ' lowest ' + J(sums)); else eq([countKey(p, 'B2'), p.rubies], [0, 2], 'seed ' + sd + ' others ' + J(sums)); eq(p.bag.length, 9 + (sums[i] === m ? 1 : 0), 'chips went back'); }); } });
rule(138, () => { const G = mk(2, { round: 3 }); G.players[1].vp = 14; G.force = 'thick'; /* want a rat stone and then the bribe: set up by hand */ CF._.startRound(G); const t0 = P(G, 0).rat; const H = mk(2, { round: 3 }); H.players[1].vp = 14; H.force = 'bribe'; CF._.startRound(H); eq(P(H, 0).q.h, 'bribe'); eq(P(H, 0).q.d.max, 3); const r0 = P(H, 0).rubies; T.ok(H, 0, { t: 'bribe', n: 2 }); eq([P(H, 0).rubies, P(H, 0).rat], [r0 + 2, t0 - 2]); eq(P(H, 1).q, null, 'the leader has no rat stone'); });
rule(139, () => { const G = mk(2, { round: 3 }); G.players[1].vp = 10; card(G, 'bounty', 3); const t = P(G, 0).ratTails; yes(t > 0); eq(CF.moves(G, 0).filter(m => m.o !== 'vp').map(m => m.o).sort(), ['B4', 'G4', 'R4', 'Y4']); T.ok(G, 0, { t: 'bounty', o: 'vp' }); eq(P(G, 0).vp, t, '1 VP per rat tail'); const H = mk(2, { round: 3 }); H.players[1].vp = 10; card(H, 'bounty', 3); T.ok(H, 0, { t: 'bounty', o: 'R4' }); yes(countKey(P(H, 0), 'R4') === 1); });
rule(140, () => { const G = roundStart('fork', 3); eq(CF.moves(G, 0).map(m => m.o).sort(), ['P1', 'drop']); T.ok(G, 0, { t: 'fork', o: 'drop' }); eq(P(G, 0).droplet, 2); T.ok(G, 1, { t: 'fork', o: 'P1' }); yes(countKey(P(G, 1), 'P1') === 1); });
rule(141, () => { const G = mk(3, { round: 3, die: 'vp1' }); card(G, 'dice', 3); eq(G.players.map(p => p.vp), [1, 1, 1]); });
rule(142, () => { let up = 0, none = 0; for (let sd = 1; sd <= 40 && (up < 2 || none < 2); sd++) { const G = mk(2, { round: 3, seed: sd }); G.force = 'haggle'; CF._.startRound(G); for (const p of G.players) { if (p.q) { eq(p.q.h, 'haggle'); eq(p.hold.length, 4); const u = CF.upgrades(G, p.hold, true)[0]; yes(u && u.from === 'G1' && u.to === 'G2', 'only the green 1 can be upgraded'); T.ok(G, p.seat, { t: 'haggle', idx: u.idx }); eq([p.hold.length, countKey(p, 'G1'), countKey(p, 'G2'), p.bag.length], [0, 0, 1, 9], 'swapped, chips back'); up++; } else { eq(p.hold.length, 0); eq([countKey(p, 'G1'), p.bag.length], [2, 10], 'nothing to swap: a green 1 and all chips back (seed ' + sd + ')'); none++; } } } yes(up >= 2 && none >= 2, 'both branches seen'); });
rule(143, () => { for (const rd of [1, 2]) { const G = mk(2, { round: rd }); G.fdeck = G.fdeck.filter(x => x !== 'fork').concat(['fork']); CF._.startRound(G); yes(G.fcard !== 'fork', 'round ' + rd + ': Fork names a purple chip, so it cannot be turned up before the purple book is out'); } const G = mk(2, { round: 3 }); G.fdeck = G.fdeck.filter(x => x !== 'fork').concat(['fork']); CF._.startRound(G); eq(G.fcard, 'fork', 'round 3: allowed'); const H = mk(2, { round: 1 }); H.fdeck = H.fdeck.filter(x => x !== 'fork').concat(['fork']); CF._.startRound(H); eq(CF.checkInvariants(H), [], 'deck still 24 cards'); });

// =====================================================  I. Variants
rule(144, () => { yes(D.TESTTUBE && D.TESTTUBE.tubes === 12, 'no test-tube track in the data (rewards unconfirmed, see rules-notes.md "Not built")'); });

// =====================================================  run
const ids = fs.readFileSync(path.join(__dirname, 'RULES-CHECKLIST.md'), 'utf8').match(/^\*\*R\d{3}\*\*/gm).map(s => s.slice(2, 6));
const text = {}; fs.readFileSync(path.join(__dirname, 'RULES-CHECKLIST.md'), 'utf8').split('\n').forEach(l => { const m = /^\*\*(R\d{3})\*\* (.*)$/.exec(l); if (m) text[m[1]] = m[2]; });
const verbose = process.argv.includes('-v'); let pass = 0; const failed = [];
for (const id of ids) {
  const f = tests[id]; if (!f) { failed.push(id); console.log(id + ' FAIL no test written: ' + text[id].slice(0, 70)); continue; }
  try { setDie('none'); f(); pass++; if (verbose) console.log(id + ' pass ' + text[id].slice(0, 60)); }
  catch (e) { failed.push(id); console.log(id + ' FAIL ' + text[id].slice(0, 60) + ' | ' + String(e.message).split('\n')[0].slice(0, 260)); }
}
console.log('\nrules ' + ids.length + ', passing ' + pass + ', failing ' + failed.length + (failed.length ? ' [' + failed.join(' ') + ']' : ''));
process.exit(failed.length ? 1 : 0);
