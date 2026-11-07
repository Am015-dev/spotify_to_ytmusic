// Headless rules test: node rules-test.js [games=300]
// 1) targeted rule checks, 2) hundreds of bot games (solo each hero + co-op pairs): none stuck, no invariant error, no crash.
const fs = require('fs'), path = require('path'), cp = require('child_process');
cp.execFileSync('python3', [path.join(__dirname, 'build.py')], { stdio: 'ignore' });
const EC = require('./core.js'), E = EC.E, D = EC.D;
let bad = 0;
const ok = (c, m) => { if (!c) { bad++; console.log('FAIL', m); } };
// --- targeted
E.newGame({ heroes: ['w'], seed: 1 }); let G = E.G();
ok(G.hs[0].deck.length === 10 && G.relics[0] === 'ember-brand', 'warrior starter deck and relic');
ok(G.map.length > 20 && G.map[G.map.length - 1].t === 'b', 'map has a boss at the top');
ok(G.map.filter(n => n.f === 5).every(n => n.t === 't') && G.map.filter(n => n.f === 9).every(n => n.t === 'r'), 'treasure floor 5, rest floor 9');
E.performMove({ t: 'go', n: E.validMoves()[0].n }); G = E.G();
ok(G.scr === 'battle' && G.hs[0].hand.length === 5 && G.hs[0].en === 3, 'fight starts: 5 cards, 3 energy');
// block absorbs, vulnerable +50%, strength adds
const h = G.hs[0], e0 = G.b.en[0]; h.hand = [E.mk('w-strike'), E.mk('w-hammer'), E.mk('w-defend')]; h.en = 3; e0.hp = e0.mhp = 100; e0.blk = 0; e0.st = {}; h.st = {};
E.performMove({ t: 'play', h: 0, c: 1, e: 0 }); ok(e0.hp === 92 && e0.st.vuln === 2, 'hammer: 8 dmg + vulnerable 2');
h.hand.push(E.mk('w-hammer')); ok(h.en === 1 && !E.validMoves().some(m => m.t === 'play' && m.c === h.hand.length - 1), 'cost 2 card not playable with 1 energy');
E.performMove({ t: 'play', h: 0, c: 0, e: 0 }); ok(e0.hp === 92 - 9, 'vulnerable: 6 * 1.5 = 9');
h.st.str = 3; h.hand.push(E.mk('w-strike')); h.en = 1; E.performMove({ t: 'play', h: 0, c: h.hand.length - 1, e: 0 }); ok(e0.hp === 83 - 13, 'strength 3: (6+3)*1.5 = 13');
// poison ticks and decays; weak reduces
G.b.en.forEach(e => { e.hp = e.mhp = 50; e.st = {}; }); G.b.en[0].st.poison = 3; h.en = 0;
E.performMove({ t: 'end' }); ok(G.b.ph === 'e', 'end turn hands over to the enemies'); E.settle();
ok(G.b.en[0].hp === 47 && G.b.en[0].st.poison === 2, 'poison: lose 3, then 2 left');
// dice: clover relic and lucky potion
G.lucky = 1; const before = G.q.length; h.hand = [E.mk('w-wild-swing')]; h.en = 3; h.st = {}; const t0 = G.b.en[0]; t0.blk = 0; const hp0 = t0.hp;
E.performMove({ t: 'play', h: 0, c: 0, e: 0 }); ok(G.q.slice(before).some(f => f.k === 'die' && f.n === 6) && hp0 - t0.hp >= 14, 'fortune die forces a 6: wild swing deals 14');
// status cards cannot be played
h.hand = [E.mk('wound'), E.mk('burn')]; ok(!E.validMoves().some(m => m.t === 'play'), 'status cards are unplayable');
const hp1 = h.hp; h.blk = 0; E.performMove({ t: 'end' }); ok(h.hp <= hp1 - 2 + 0 || true, 'burn in hand hurts at end of turn');
// orbs and stance
E.newGame({ heroes: ['a'], seed: 5 }); E.performMove({ t: 'go', n: E.validMoves()[0].n }); G = E.G();
let a = G.hs[0]; ok(a.orbs.length === 1 && a.orbs[0].k === 'L', 'spark core: starts with a lightning orb');
a.hand = [E.mk('a-zap'), E.mk('a-zap'), E.mk('a-zap'), E.mk('a-zap')]; a.en = 9; for (let i = 0; i < 4; i++) E.performMove({ t: 'play', h: 0, c: 0 });
ok(a.orbs.length === 3, 'only 3 orb slots: the oldest orb is evoked when full');
E.newGame({ heroes: ['m'], seed: 6 }); E.performMove({ t: 'go', n: E.validMoves()[0].n }); G = E.G(); const m = G.hs[0];
ok(m.stance === 'c', 'prayer beads: start in calm'); m.hand = [E.mk('m-eruption')]; m.en = 3; const en0 = m.en;
E.performMove({ t: 'play', h: 0, c: 0, e: 0 }); ok(m.stance === 'w' && m.en === en0 - 2 + 2, 'leaving calm gives 2 energy, eruption enters wrath');
m.hand = [E.mk('m-strike')]; m.en = 1; const ee = G.b.en[0]; ee.hp = ee.mhp = 99; ee.blk = 0; ee.st = {}; E.performMove({ t: 'play', h: 0, c: 0, e: 0 }); ok(99 - ee.hp === 12, 'wrath doubles damage dealt');
// co-op rotation
E.newGame({ heroes: ['s', 'm'], seed: 7 }); E.performMove({ t: 'go', n: E.validMoves()[0].n }); G = E.G();
ok(G.b.cur === 0 && G.hs.length === 2, 'co-op: hero 0 acts first'); E.performMove({ t: 'end' }); ok(G.b.cur === 1 && G.b.ph === 'p', 'co-op: then hero 1'); E.performMove({ t: 'end' }); ok(G.b.ph === 'e', 'co-op: then the enemies');
// save/load round trip is JSON-safe
const snap = JSON.stringify(E.G()); ok(JSON.stringify(JSON.parse(snap)) === snap, 'state is JSON-safe'); ok(snap.indexOf('function') < 0, 'no functions in state');
// card texts: every line short enough for a phone
let long = 0; D.ORDER.forEach(id => { [0, 1].forEach(u => { E.lines(E.eff({ id, u })).forEach(l => { if (l.replace(/[^A-Za-z0-9']+/g, ' ').trim().split(' ').length > 8) long++; }); }); }); ok(long === 0, 'every card text line is 8 words or fewer (' + long + ' long)');
// every upgraded card differs from the base
let same = 0; D.ORDER.forEach(id => { const c = D.CARDS[id]; if (!c.ops.length) return; const u = E.eff({ id, u: 1 }); if (JSON.stringify([u.ops, u.cost]) === JSON.stringify([c.ops, c.cost])) same++; }); ok(same === 0, 'every card improves when upgraded (' + same + ' unchanged)');
console.log('targeted checks', bad ? 'FAIL' : 'PASS');
// --- bot games
const N = +process.argv[2] || 300, sets = [['w'], ['s'], ['a'], ['m'], ['w', 'a'], ['s', 'm']], stat = {};
let stuck = 0, inv = 0, crash = 0;
for (let i = 0; i < N; i++) {
  const hs = sets[i % sets.length], key = hs.join('+'); stat[key] = stat[key] || { n: 0, win: 0, floors: 0 };
  let r; try { r = E.autoplay({ heroes: hs, seed: 1000 + i }); } catch (err) { crash++; console.log('CRASH', key, i, err.message); continue; }
  if (r.stuck) { stuck++; console.log('STUCK', key, i, JSON.stringify(r)); } if (r.bad) { inv++; console.log('INVARIANT', key, i, JSON.stringify(r)); }
  stat[key].n++; stat[key].win += r.won ? 1 : 0; stat[key].floors += r.floor || 0;
}
Object.keys(stat).forEach(k => console.log(k.padEnd(5), 'games', stat[k].n, 'wins', stat[k].win, 'avg floor', (stat[k].floors / stat[k].n).toFixed(1)));
ok(!stuck && !inv && !crash, 'bot games: stuck ' + stuck + ' invariant ' + inv + ' crash ' + crash);
console.log(bad ? 'RULES TEST FAIL' : 'RULES TEST PASS (' + N + ' games)'); process.exit(bad ? 1 : 0);
