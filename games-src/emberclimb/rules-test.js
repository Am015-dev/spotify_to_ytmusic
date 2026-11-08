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
// R02 Vulnerable doubles after Strength; Weak -SCALE per hit
const h = G.hs[0], e0 = G.b.en[0], SC = D.SCALE; h.hand = [E.mk('w-strike'), E.mk('w-hammer'), E.mk('w-defend')]; h.en = 3; e0.hp = e0.mhp = 100; e0.blk = 0; e0.st = {}; h.st = {};
E.performMove({ t: 'play', h: 0, c: 1, e: 0 }); ok(e0.hp === 92 && e0.st.vuln === 2, 'hammer: 8 dmg + vulnerable 2');
h.hand.push(E.mk('w-hammer')); ok(h.en === 1 && !E.validMoves().some(m => m.t === 'play' && m.c === h.hand.length - 1), 'cost 2 card not playable with 1 energy');
E.performMove({ t: 'play', h: 0, c: 0, e: 0 }); ok(e0.hp === 92 - 12, 'R02 vulnerable doubles: 6 x 2 = 12');
ok(e0.st.vuln === 1, 'R03 vulnerable loses 1 token per attack, not per round');
h.st.str = 3; h.hand.push(E.mk('w-strike')); h.en = 1; E.performMove({ t: 'play', h: 0, c: h.hand.length - 1, e: 0 }); ok(e0.hp === 80 - 18, 'R02 strength then vulnerable: (6+3) x 2 = 18');
// helper: fresh fight, clean state
function fresh(hs, seed) { E.newGame({ heroes: hs, seed }); E.performMove({ t: 'go', n: E.validMoves()[0].n }); const g = E.G(); g.hs.forEach(x => { x.st = {}; x.blk = 0; }); g.b.en.forEach(e => { e.hp = e.mhp = 200; e.blk = 0; e.st = {}; }); return g; }
function playId(g, id, tgt, hi) { const x = g.hs[hi || 0]; x.hand.push(E.mk(id)); x.en = Math.max(x.en, 3); const mv = { t: 'play', h: hi || 0, c: x.hand.length - 1 }; if (tgt != null) mv.e = tgt; return E.performMove(mv); }
G = fresh(['w'], 11); let hw = G.hs[0], t0 = G.b.en[0];
hw.st.weak = 1; playId(G, 'w-strike', 0); ok(t0.hp === 200 - (6 - SC) && !hw.st.weak, 'R02 weak: -' + SC + ' per hit, spent by the attack');
hw.st.weak = 2; playId(G, 'w-defend'); ok(hw.st.weak === 2, 'R03 weak is not spent by a skill');
t0.hp = 200; t0.st = { vuln: 2 }; hw.st = {}; playId(G, 'w-twin-slash', 0); ok(t0.hp === 200 - 20 && t0.st.vuln === 1, 'R03 multi-hit: both hits doubled, only 1 vulnerable spent');
playId(G, 'w-roar'); playId(G, 'w-roar'); playId(G, 'w-roar'); playId(G, 'w-roar'); ok(t0.st.weak === 3, 'R03 weak capped at 3 tokens');
t0.hp = 200; t0.st = { vuln: 1 }; hw.st = { weak: 1 }; playId(G, 'w-strike', 0); ok(t0.hp === 194 && !t0.st.vuln && !hw.st.weak, 'R04 weak attacker vs vulnerable target: neither applies, both lose 1');
// R05 poison: end of the heroes' turn, 1 HP per token, tokens stay; cap 30 total
G = fresh(['s'], 12); G.b.en.forEach(e => { e.st.poison = 0; }); t0 = G.b.en[0]; t0.st.poison = 4; G.hs[0].hand = []; E.performMove({ t: 'end' });
ok(t0.hp === 196 && t0.st.poison === 4, 'R05 poison: lose 1 per token at end of turn, tokens stay');
E.settle(); G.hs[0].hand = []; t0.st.poison = 28; G.hs[0].hand.push(E.mk('s-toxic-vial')); G.hs[0].en = 3; E.performMove({ t: 'play', h: 0, c: 0, e: 0 }); ok(t0.st.poison === 30, 'R05 poison capped at 30 tokens');
// R06 wrath: +SCALE per hit dealt, no extra taken, end of turn in wrath costs SCALE HP; monk starts neutral
G = fresh(['m'], 13); let mk = G.hs[0]; ok(mk.stance === 'n', 'R06 stance class starts every fight neutral');
mk.stance = 'w'; t0 = G.b.en[0]; playId(G, 'm-strike', 0); ok(t0.hp === 200 - 6 - SC, 'R06 wrath: +' + SC + ' damage per hit');
G.b.en[0].intent = { atk: 10, tg: 0 }; ok(E.previewHit(0, 0) === 10, 'R06 wrath does not raise damage taken (previewHit)');
mk.hand = []; const hpw = mk.hp; E.performMove({ t: 'end' }); ok(mk.hp === hpw - SC, 'R06 ending the turn in wrath costs ' + SC + ' HP');
// R07 monk relic: Miracles, no calm start, no calm spark
G = fresh(['m'], 14); mk = G.hs[0]; ok(mk.mir === 2 && !mk.hand.some(c => c.id === 'calm-spark') && mk.stance === 'n', 'R07 monk relic: Miracle tokens, no Calm, no Calm Spark');
mk.en = 6; ok(E.validMoves().some(m => m.t === 'mir'), 'R07 mir move offered'); E.performMove({ t: 'mir' }); ok(mk.en === 7 && mk.mir === 1, 'R07 miracle: +1 energy, may pass the cap');
// R18 energy cap 6
mk.en = 6; mk.stance = 'c'; playId(G, 'm-empty-fist', 0); ok(mk.en === 6, 'R18 energy cap 6 (calm exit +2 capped)');
mk.en = 3; mk.stance = 'c'; mk.hand.push(E.mk('m-empty-fist')); E.performMove({ t: 'play', h: 0, c: mk.hand.length - 1, e: 0 }); ok(mk.en === 4, 'R06 calm exit still gives 2 energy');
// R17 strength cap 8, block cap 60
G = fresh(['w'], 15); hw = G.hs[0]; hw.st.str = 7; playId(G, 'w-kindle'); ok(hw.st.str === 8, 'R17 strength capped at 8');
hw.blk = 58; playId(G, 'w-defend'); ok(hw.blk === 60, 'R17 player block capped at 60');
// R01 no hand cap
hw.hand = []; for (let i = 0; i < 11; i++) hw.hand.push(E.mk('w-defend')); hw.draw = []; for (let i = 0; i < 6; i++) hw.draw.push(E.mk('w-strike'));
playId(G, 'w-second-wind'); ok(hw.hand.length === 13, 'R01 no hand cap (' + hw.hand.length + ' cards)');
// R19 retain and scry
G = fresh(['m'], 16); mk = G.hs[0]; mk.hand = [E.mk('m-judgment')]; E.performMove({ t: 'end' }); E.settle(); ok(mk.hand.some(c => c.id === 'm-judgment'), 'R19 retain: card stays in hand at end of turn');
mk.draw = [E.mk('wound'), E.mk('m-strike'), E.mk('wound')]; const dn = mk.disc.length; playId(G, 'm-third-eye'); ok(G.b.scry && G.b.scry.n === 3 && E.validMoves().every(m => m.t === 'scry'), 'R19 scry 3: pending choice');
E.performMove({ t: 'scry', keep: [1] }); ok(mk.draw.length === 1 && mk.draw[0].id === 'm-strike' && mk.disc.length === dn + 3, 'R19 scry: discard any of the top cards');
// R20 shared die and die-based intents
G = fresh(['w'], 17); t0 = G.b.en[0]; t0.id = 'gape-grub'; t0.i = -1; G.b.en.slice(1).forEach(e => { e.dead = 1; }); G.hs[0].hand = []; G.hs[0].hp = G.hs[0].mhp; t0.intent = { blk: 1, tg: 0 };
const q0 = G.q.length; E.performMove({ t: 'end' }); E.settle(); const dv = G.b.die, want = dv <= 2 ? 'str' : 'atk';
ok(G.q.slice(q0).some(f => f.k === 'die' && f.w === '' && f.n === dv) && t0.intent.die === dv && t0.intent[want] > 0, 'R20 one die per round, die-based intent (die ' + dv + ')');
// R21 rows and all-hero attacks; R08 any hero down = party loses
G = fresh(['w', 'a'], 18); ok(G.b.en.every((e, i) => e.row === i % 2 && (e.intent.sleep || e.intent.tg === e.row)), 'R21 each enemy attacks the hero in its row');
G.b.en.forEach((e, i) => { if (i) e.dead = 1; }); G.b.en[0].intent = { atk: 5, all: 1, tg: 0 }; G.hs.forEach(x => { x.hand = []; x.hp = 50; });
E.performMove({ t: 'end' }); G.hs[1].blk = 0; G.hs[0].blk = 0; E.performMove({ t: 'end' }); E.settle(); ok(G.hs[0].hp < 50 && G.hs[1].hp < 50, 'R21 all:1 hits every hero');
G = fresh(['w', 'a'], 19); G.b.en.forEach((e, i) => { if (i) e.dead = 1; }); G.b.en[0].intent = { atk: 99, tg: 1 }; G.hs.forEach(x => { x.hand = []; });
E.performMove({ t: 'end' }); E.performMove({ t: 'end' }); E.settle(); ok(G.scr === 'over' && !G.won && G.hs[0].hp > 0, 'R08 duo: one hero at 0 HP loses the run');
// R10 two-hero enemy HP table; R11 class HP; R12 rogue starter
E.newGame({ heroes: ['w', 'a'], seed: 20 }); E.performMove({ t: 'go', n: E.validMoves()[0].n }); G = E.G();
ok(G.b.en.every(e => { const r = D.ENEMIES[e.id].hp; return e.mhp >= Math.round(r[0] * D.EHP[2]) && e.mhp <= Math.round(r[1] * D.EHP[2]); }), 'R10 two heroes: enemy HP x' + D.EHP[2]);
ok(D.H.w.hp === 80 && D.H.s.hp === 70 && D.H.a.hp === 75 && D.H.m.hp === 72, 'R11 class HP 80/70/75/72');
ok(D.H.s.start.length === 12 && D.H.s.start.filter(x => x === 's-strike').length === 5 && D.H.s.start.filter(x => x === 's-defend').length === 5, 'R12 rogue starter 5 + 5 + 2');
// R13 shiv: 3 damage own attack, max 5 held, none at start
G = fresh(['s'], 21); let sr = G.hs[0]; ok(!sr.hand.some(c => c.id === 'shiv'), 'R13 combat starts with 0 shivs');
playId(G, 's-knife-rain'); playId(G, 's-blade-fan'); ok(sr.hand.filter(c => c.id === 'shiv').length === 5, 'R13 max 5 shivs held');
t0 = G.b.en[0]; E.performMove({ t: 'play', h: 0, c: sr.hand.findIndex(c => c.id === 'shiv'), e: 0 }); ok(t0.hp === 200 - SC, 'R13 shiv deals ' + SC);
// R09 rest heals 3 x SCALE
E.newGame({ heroes: ['w'], seed: 22 }); E.debug.rest(); G = E.G(); const hr = G.hs[0].hp; E.performMove({ t: 'heal', h: 0 }); ok(G.hs[0].hp === hr + 3 * SC, 'R09 rest heals ' + 3 * SC);
// R14 treasure: each hero gains a relic
E.newGame({ heroes: ['w', 'a'], seed: 23 }); E.debug.treasure(); G = E.G(); ok(G.rw.relics.length === 2 && E.performMove({ t: 'relic', i: 0 }) && E.performMove({ t: 'relic', i: 1 }) && G.rw.took.relic, 'R14 treasure: each hero takes a relic');
// R15 boss relics: 1 per hero + 1 (3 solo), each hero takes one; R16 boss cards come from the rare deck
E.newGame({ heroes: ['w'], seed: 24 }); E.performMove({ t: 'go', n: E.validMoves()[0].n }); G = E.G(); G.b.kind = 'b'; E.debug.win();
ok(G.rw.relics.length === 3 && G.rw.nrel === 1, 'R15 solo boss: 3 relics revealed, take 1'); ok(G.rw.cards[0].every(id => D.CARDS[id].rar === 'r'), 'R16 boss card reward from the rare deck');
E.newGame({ heroes: ['w', 's'], seed: 25 }); E.performMove({ t: 'go', n: E.validMoves()[0].n }); G = E.G(); G.b.kind = 'b'; E.debug.win();
ok(G.rw.relics.length === 3 && E.performMove({ t: 'relic', i: 0 }) && E.performMove({ t: 'relic', i: 2 }) && G.rw.took.relic, 'R15 duo boss: 3 relics revealed, each hero takes one');
// R16 reward deck: skipped cards return and the deck is reshuffled
E.newGame({ heroes: ['w'], seed: 26 }); E.performMove({ t: 'go', n: E.validMoves()[0].n }); G = E.G(); const rd0 = G.rd.w.length; E.debug.win();
ok(G.rd.w.length === rd0 - 3 && G.rw.cards[0].every(id => D.CARDS[id].hero === 'w' && D.CARDS[id].rar !== 'r'), 'R16 reward deck per class');
E.performMove({ t: 'skip', h: 0 }); ok(G.rd.w.length === rd0, 'R16 skipped cards go back into the reward deck');
// R22 acts: full heal and a new map at the next act
E.newGame({ heroes: ['w'], seed: 27, acts: 2 }); G = E.G(); G.at = G.map.length - 1; G.scr = 'reward'; G.rw = { gold: 0, cards: {}, relics: null, took: {} }; G.hs[0].hp = 10;
E.performMove({ t: 'leave' }); ok(G.act === 2 && G.scr === 'map' && G.hs[0].hp === G.hs[0].mhp && G.at === -1, 'R22 act 2: full heal, new map');
// R24 per-act encounter decks: act 2/3/4 fights draw from their own decks; one fixed guardian per act
E.newGame({ heroes: ['w'], seed: 31, acts: 3 }); G = E.G(); ok(G.boss === D.ACTBOSS[1], 'R24 multi-act climb: act 1 guardian is fixed');
G.at = G.map.length - 1; G.scr = 'reward'; G.rw = { gold: 0, cards: {}, relics: null, took: {} }; E.performMove({ t: 'leave' });
ok(G.act === 2 && G.boss === D.ACTBOSS[2], 'R24 act 2 guardian');
E.performMove({ t: 'go', n: E.validMoves()[0].n }); const a2ids = Object.keys(D.ENCA[2]).reduce((a, k) => a.concat(...D.ENCA[2][k]), []);
ok(G.scr === 'battle' && G.b.en.every(e => a2ids.indexOf(e.id) >= 0), 'R24 act 2 fight comes from the act 2 deck');
ok(G.b.en[0].mhp >= Math.round(D.ENEMIES[G.b.en[0].id].hp[0] * 1.25), 'R22 act 2 foes have +25% HP');
// R25 final act: opt.final adds act 4 and the Ember Tyrant
E.newGame({ heroes: ['w'], seed: 32, acts: 3, final: 1 }); G = E.G(); ok(G.acts === 4, 'R25 final act makes 4 acts');
E.newGame({ heroes: ['w'], seed: 33, startAct: 4 }); G = E.G(); ok(G.act === 4 && G.boss === 'ember-tyrant', 'R25 a chapter can start in the final act');
E.performMove({ t: 'go', n: E.validMoves()[0].n }); const a4ids = Object.keys(D.ENCA[4]).reduce((a, k) => a.concat(...D.ENCA[4][k]), []); ok(G.b.en.every(e => a4ids.indexOf(e.id) >= 0), 'R25 final-act fights use the act 4 deck');
// R26 frail: an enemy applies Frail, block cards give 25% less while it lasts
E.newGame({ heroes: ['w'], seed: 34, startAct: 2 }); E.performMove({ t: 'go', n: E.validMoves()[0].n }); G = E.G(); G.hs[0].st = { frail: 1 }; G.hs[0].blk = 0; playId(G, 'w-iron-skin'); ok(G.hs[0].blk === 6, 'R26 frail: 8 block becomes 6');
ok(D.ENEMIES['ash-wisp'].pat[0].frail === 2 && D.ENEMIES['tomb-king'].pat[0].frail === 2, 'R26 act 2/3 foes apply Frail');
// R27 last stand: boss fight, 2 heroes, the first fall leaves that hero at 1 HP with Weak 3; the second fall loses
E.newGame({ heroes: ['w', 's'], seed: 35, boss: 'mire-behemoth' }); G = E.G(); E.debug.boss();
ok(G.b && G.b.kind === 'b', 'R27 boss fight starts'); E.debug.hurt(0, 999); ok(G.scr === 'battle' && G.hs[0].hp === 1 && G.hs[0].st.weak === 3, 'R27 last stand: first fall keeps 1 HP, Weak 3');
E.debug.hurt(1, 999); ok(G.scr === 'over' && !G.won, 'R27 second fall loses');
E.newGame({ heroes: ['w'], seed: 36, boss: 'mire-behemoth' }); G = E.G(); E.debug.boss(); E.debug.hurt(0, 999); ok(G.scr === 'over' && !G.won, 'R27 solo: no last stand, any fall loses');
// R23 merchant: 3 cards per hero, 3 relics + 3 potions, first relic/potion one step cheaper
E.newGame({ heroes: ['w', 'm'], seed: 28 }); E.debug.shop(); G = E.G(); const its = G.shop.items, rel = its.filter(x => x.t === 'relic'), pts = its.filter(x => x.t === 'pot');
ok(its.filter(x => x.t === 'card' && D.CARDS[x.id].hero === 'w').length === 3 && its.filter(x => x.t === 'card' && D.CARDS[x.id].hero === 'm').length === 3 && rel.length === 3 && pts.length === 3, 'R23 merchant: 3 cards per hero, 3 relics, 3 potions');
ok(pts[0].p === pts[1].p - 15 && rel[0].p === (D.RELICS[rel[0].id].rar === 'u' ? 205 : 135), 'R23 merchant: first relic and potion 15 cheaper');
// UI contract: plain-word keyword lines
const ln = id => E.lines(E.eff({ id, u: 0 })).join(' ');
ok(/Retain/.test(ln('m-judgment')) && /Scry 3/.test(ln('m-third-eye')) && /Miracle/.test(ln('m-zen-burst')) && /Shivs \(3-damage/.test(ln('s-blade-fan')), 'lines: Retain, Scry, Miracle, Shiv described');
// dice: clover relic and lucky potion
E.newGame({ heroes: ['w'], seed: 1 }); E.performMove({ t: 'go', n: E.validMoves()[0].n }); G = E.G();
{ const h = G.hs[0];
G.lucky = 1; const before = G.q.length; h.hand = [E.mk('w-wild-swing')]; h.en = 3; h.st = {}; const t0 = G.b.en[0]; t0.blk = 0; t0.st = {}; t0.hp = t0.mhp = 100; const hp0 = t0.hp;
E.performMove({ t: 'play', h: 0, c: 0, e: 0 }); ok(G.q.slice(before).some(f => f.k === 'die' && f.n === 6) && hp0 - t0.hp >= 14, 'fortune die forces a 6: wild swing deals 14');
h.hand = [E.mk('wound'), E.mk('burn')]; ok(!E.validMoves().some(m => m.t === 'play'), 'status cards are unplayable'); }
// orbs
E.newGame({ heroes: ['a'], seed: 5 }); E.performMove({ t: 'go', n: E.validMoves()[0].n }); G = E.G();
let a = G.hs[0]; ok(a.orbs.length === 1 && a.orbs[0].k === 'L', 'spark core: starts with a lightning orb');
a.hand = [E.mk('a-zap'), E.mk('a-zap'), E.mk('a-zap'), E.mk('a-zap')]; a.en = 9; for (let i = 0; i < 4; i++) E.performMove({ t: 'play', h: 0, c: 0 });
ok(a.orbs.length === 3, 'only 3 orb slots: the oldest orb is evoked when full');
// co-op rotation
E.newGame({ heroes: ['s', 'm'], seed: 7 }); E.performMove({ t: 'go', n: E.validMoves()[0].n }); G = E.G();
ok(G.b.cur === 0 && G.hs.length === 2, 'co-op: hero 0 acts first'); E.performMove({ t: 'end' }); ok(G.b.cur === 1 && G.b.ph === 'p', 'co-op: then hero 1'); E.performMove({ t: 'end' }); ok(G.b.ph === 'e', 'co-op: then the enemies');
// save/load round trip is JSON-safe
const snap = JSON.stringify(E.G()); ok(JSON.stringify(JSON.parse(snap)) === snap, 'state is JSON-safe'); ok(snap.indexOf('function') < 0, 'no functions in state');
// card texts: every line short enough for a phone
let long = 0; D.ORDER.forEach(id => { [0, 1].forEach(u => { E.lines(E.eff({ id, u })).forEach(l => { if (l.replace(/[^A-Za-z0-9']+/g, ' ').trim().split(' ').length > 8) long++; }); }); }); ok(long === 0, 'every card text line is 8 words or fewer (' + long + ' long)');
// every upgraded card differs from the base
let same = 0; D.ORDER.forEach(id => { const c = D.CARDS[id]; if (!c.ops.length) return; const u = E.eff({ id, u: 1 }); if (JSON.stringify([u.ops, u.cost]) === JSON.stringify([c.ops, c.cost])) same++; }); ok(same === 0, 'every card improves when upgraded (' + same + ' unchanged)');
// full climbs (3 acts + final act): never stuck, no invariant error
{ let fs = 0, fw = 0; for (let i = 0; i < 12; i++) { const r = E.autoplay({ heroes: [['w'], ['s'], ['a'], ['m'], ['w', 's'], ['a', 'm']][i % 6], seed: 5000 + i, acts: 3, final: 1 }); if (r.stuck || r.bad) fs++; if (r.won) fw++; } ok(fs === 0, 'R22/R25 full 4-act climbs: none stuck (' + fw + '/12 won)'); }
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
