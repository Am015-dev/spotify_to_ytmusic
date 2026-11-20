// Wickdeep rules test: component counts (COMPONENTS.md) + one check per key rule (RULES-CHECKLIST.md) + headless test games.
// node rules-test.js   (QUICK=1: fewer test games)
global.window = global;
const store = {}; global.localStorage = { getItem: k => store[k] || null, setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; } };
['data', 'scen', 'engine', 'ai', 'camp'].forEach(f => require('./src/' + f + '.js'));
const D = WDD, E = WD, AI = WDAI, C = WDC;
let pass = 0, fail = 0;
function ok(name, cond, why) { if (cond) pass++; else { fail++; console.log('FAIL ' + name + (why ? ': ' + why : '')); } }
function eq(name, a, b) { ok(name, JSON.stringify(a) === JSON.stringify(b), JSON.stringify(a) + ' != ' + JSON.stringify(b)); }
function mk(sc, party, seed) { return E.newScenario(sc || 1, party || [{ cls: 'warden' }, { cls: 'ringer' }], { seed: seed || 11 }); }
function doorOf(G) { return Object.keys(G.hex).find(k => G.hex[k].t === 'door'); }
function insideDoor(G) { const d = doorOf(G), r0 = G.hex[G.starts[0]].room; return E.nb(d).find(k => G.hex[k] && G.hex[k].room === r0 && G.hex[k].t !== 'o'); }
function outsideDoor(G) { const d = doorOf(G), r0 = G.hex[G.starts[0]].room; return E.nb(d).find(k => G.hex[k] && G.hex[k].room !== r0 && G.hex[k].t !== 'o'); }
function toHero(G, id) { while (G.ask && G.ask.id !== id && !G.done) E.apply(G, AI.choose(G)); }
function selAll(G, pick) { while (G.ask && G.ask.h === 'sel') { const id = E.validMoves(G)[0].id, f = E.fig(G, id); E.apply(G, pick ? pick(f) : { t: 'sel', id, cards: f.hand.slice(0, 2) }); } }

// ---------- components ----------
eq('4 heroes', Object.keys(D.HERO).length, 4);
eq('hand sizes', D.HERO_ORDER.map(h => D.HERO[h].hand), [10, 10, 9, 11]);
eq('HP curves', D.HERO_ORDER.map(h => D.HERO[h].hp.join(',')), ['10,12,14,16,18,20,22,24,26', '8,9,11,12,14,15,17,18,20', '8,9,11,12,14,15,17,18,20', '6,7,8,9,10,11,12,13,14']);
D.HERO_ORDER.forEach(h => {
  const H = D.HERO[h], by = l => H.cards.filter(c => c[2] === l).length;
  eq(h + ' level-1 cards = hand size', by('1'), H.hand);
  eq(h + ' 3 level-X cards', by('X'), 3);
  for (let l = 2; l <= 9; l++) eq(h + ' 2 cards at level ' + l, by(l), 2);
  eq(h + ' card total', H.cards.length, H.hand + 19);
  ok(h + ' initiatives 1..99', H.cards.every(c => c[3] >= 1 && c[3] <= 99));
  ok(h + ' perks >= 7', H.perks.length >= 7);
  H.cards.forEach(c => { [c[4], c[5]].forEach(t => ok('card parses ' + c[0], E.parse(t).every(a => a.t !== '?'), t)); });
});
eq('16 monster types', Object.keys(D.MON).length, 16);
eq('4 bosses', Object.keys(D.BOSS).length, 4);
Object.keys(D.MDECK).forEach(f => { eq('deck ' + f + ' has 8 cards', D.MDECK[f].length, 8); eq('deck ' + f + ' has 2 reshuffle cards', D.MDECK[f].filter(c => c.sh).length, 2); D.MDECK[f].forEach(c => ok('monster card parses ' + f, E.parse(c.a).every(a => a.t !== '?'), c.a)); });
eq('25 scenarios', D.SCEN_LIST.length, 25);
eq('4 boss scenarios', D.SCEN_LIST.filter(s => s.boss).length, 4);
eq('30 items', D.ITEM.length, 30);
eq('10 hero goals', D.GOAL.length, 10);
const amd = E.baseAmd(), cnt = v => amd.filter(c => String(c.v) === String(v)).length;
eq('modifier deck 20 cards', amd.length, 20);
eq('modifier mix', [cnt(0), cnt(1), cnt(-1), cnt(2), cnt(-2), cnt('x2'), cnt('null')], [6, 5, 5, 1, 1, 1, 1]);
eq('6 elements', E.EL.length, 6);
eq('XP thresholds', D.XP_LEVEL, [0, 45, 95, 150, 210, 275, 345, 420, 500]);
eq('trap damage', [0, 3, 7].map(D.trapDmg), [2, 5, 9]);
eq('gold per coin', [0, 1, 2, 3, 4, 5, 6, 7].map(D.goldPerCoin), [2, 2, 3, 3, 4, 4, 5, 6]);
eq('bonus XP', [0, 2, 7].map(D.bonusXp), [4, 8, 18]);
// every scenario unlocks along a path to 25
const reach = { 1: 1 }; let grew = true; while (grew) { grew = false; D.SCEN_LIST.forEach(s => { if (reach[s.id]) (s.unlock || []).forEach(u => { if (!reach[u]) { reach[u] = 1; grew = true; } }); }); }
eq('all 25 scenarios reachable in the campaign', Object.keys(reach).length, 25);
ok('campaign branches', D.SCEN_LIST.filter(s => (s.unlock || []).length > 1).length >= 5);

// ---------- rules ----------
let G = mk(1);
ok('round starts with card choice', G.ask.h === 'sel' && G.round === 1);
eq('heroes start with full hand', G.figs.filter(f => f.kind === 'hero').map(f => f.hand.length), [10, 10]);
// scenario level from party level: ceil(avg/2)
eq('scenario level', [E.newScenario(1, [{ cls: 'warden', lvl: 3 }, { cls: 'ringer', lvl: 4 }]).L, E.newScenario(1, [{ cls: 'warden', lvl: 1 }, { cls: 'ringer', lvl: 1 }]).L], [2, 1]);
eq('monsters scale by party size', [2, 3, 4].map(n => E.parseMap(D.SCEN[1], n).place.length), [3, 4, 4]);
ok('elites at 4 heroes in scenario 1', E.parseMap(D.SCEN[1], 4).place.some(p => p.elite));
// initiative order: lowest card first; ties -> heroes before monsters
G = mk(1); selAll(G, f => ({ t: 'sel', id: f.id, cards: f.id === 'h0' ? ['ww06', 'ww01'] : ['br01', 'br02'] }));
eq('initiative order', G.order.map(o => o.id + ':' + o.init), ['h0:8', 'h1:22']);
ok('hero with lowest card acts first', G.ask.id === 'h0');
// top of one card forces bottom of the other
let opts = E.validMoves(G).filter(m => m.t === 'half');
ok('first half: any card, top or bottom', opts.some(m => m.c === 'ww06' && m.h === 'top') && opts.some(m => m.c === 'ww01' && m.h === 'bot'));
E.apply(G, { t: 'half', c: 'ww01', h: 'bot' });
while (G.ask && G.ask.h === 'move') E.apply(G, { t: 'skip' });
opts = E.validMoves(G).filter(m => m.t === 'half');
ok('second half must be the other card, other half', opts.length && opts.every(m => m.c === 'ww06' && m.h === 'top'), JSON.stringify(opts));
E.apply(G, { t: 'half', c: 'ww06', h: 'top' });
const h0 = E.fig(G, 'h0');
ok('played cards go to the played pile', h0.disc.indexOf('ww01') >= 0 && h0.disc.indexOf('ww06') >= 0);
// lost cards
G = mk(1); selAll(G, f => ({ t: 'sel', id: f.id, cards: f.id === 'h0' ? ['ww08', 'ww01'] : ['br01', 'br02'] }));
toHero(G, 'h0');
E.apply(G, { t: 'half', c: 'ww08', h: 'top' });
let w = E.fig(G, 'h0'); ok('persistent card stays active', w.active.some(a => a.c === 'ww08') && w.pers.length === 1);
G = mk(1); selAll(G, f => ({ t: 'sel', id: f.id, cards: f.id === 'h0' ? ['ww09', 'ww01'] : ['br01', 'br02'] }));
toHero(G, 'h0'); E.apply(G, { t: 'half', c: 'ww09', h: 'top' }); while (G.ask && G.ask.h === 'target') E.apply(G, { t: 'skip' });
ok('a played LOST half is lost even if skipped', E.fig(G, 'h0').lost.indexOf('ww09') >= 0);
G = mk(1); { const r0k = G.starts[2]; const adj = E.nb(r0k).find(k => G.hex[k] && !E.figAt(G, k) && G.hex[k].t === 'f'); G.figs.push({ id: 'mz', kind: 'mon', team: 'm', type: 'rat', pos: adj, hp: 30, max: 30, cond: {}, rnd: {}, num: 9 }); G.figs[0].pos = r0k; G.md.rat = G.md.rat || { fam: 'swarm', draw: [0, 1, 2, 3, 4, 5, 6, 7], disc: [], cur: null, resh: false }; }
E.apply(G, { t: 'sel', id: 'h0', cards: ['ww09', 'ww01'] }); E.apply(G, { t: 'sel', id: 'h1', cards: ['br07', 'br04'] });
toHero(G, 'h0'); E.apply(G, { t: 'half', c: 'ww09', h: 'top' }); if (G.ask.h === 'target') E.apply(G, { t: 'tgt', id: 'mz' });
ok('used LOST half goes to the lost pile', E.fig(G, 'h0').lost.indexOf('ww09') >= 0 && (E.fig(G, 'mz') || { hp: 0 }).hp < 30);
// long rest
G = mk(1); let f0 = G.figs[0]; f0.disc = f0.hand.splice(0, 4); f0.hp = 5;
E.apply(G, { t: 'lrest', id: 'h0' }); E.apply(G, { t: 'sel', id: 'h1', cards: ['br01', 'br02'] });
ok('long rest has initiative 99', G.order.find(o => o.id === 'h0').init === 99);
while (G.ask && !(G.ask.h === 'lrest')) E.apply(G, AI.choose(G));
const lose = f0.disc[0]; E.apply(G, { t: 'lose', c: lose });
ok('long rest: lose chosen card, heal 2, hand back', f0.lost.indexOf(lose) >= 0 && f0.hp === 7 && f0.disc.length === 0 && f0.hand.length === 9);
// short rest
G = mk(1); f0 = G.figs[0]; f0.disc = f0.hand.splice(0, 5);
selAll(G); while (G.ask && G.ask.h !== 'srest') E.apply(G, AI.choose(G));
ok('short rest offered at end of round', G.ask && G.ask.h === 'srest');
const dBefore = f0.disc.length; E.apply(G, { t: 'srest' }); ok('short rest shows the random card first', G.ask.h === 'srest2');
const hpB = f0.hp; E.apply(G, { t: 'srest-redo' }); ok('swap costs 1 HP', f0.hp === hpB - 1);
E.apply(G, { t: 'srest' }); ok('short rest: one card lost, rest back', f0.lost.length === 1 && f0.disc.length === 0);
// exhaustion
G = mk(1); f0 = G.figs[0]; f0.lost = f0.hand.splice(0, 8); f0.disc = [];
for (let i = 0; i < 300 && !f0.exh && !G.done && G.round < 4; i++) E.apply(G, AI.choose(G));
ok('hero with 1 card and nothing to rest is exhausted', f0.exh === true);
// elements
G = mk(1); selAll(G, f => ({ t: 'sel', id: f.id, cards: f.id === 'h0' ? ['ww03', 'ww01'] : ['br01', 'br02'] }));
toHero(G, 'h0');
E.apply(G, { t: 'half', c: 'ww03', h: 'top' }); while (G.ask && G.ask.h === 'target') E.apply(G, { t: 'skip' });
ok('infuse waits for the end of the turn', G.el.light === 0);
E.apply(G, { t: 'half', c: 'ww01', h: 'bot' }); while (G.ask && G.ask.h === 'move' && G.ask.id === 'h0') E.apply(G, { t: 'skip' });
ok('infused element is strong after the turn', G.el.light === 2);
while (G.ask && G.ask.h !== 'sel' && !G.done) E.apply(G, AI.choose(G));
ok('element wanes at round end', G.el.light === 1);
// consume
G = mk(1); G.el.light = 1; const a = E.parse('a2 r3 C:light:+2')[0]; const x = JSON.parse(JSON.stringify(a));
// direct consume via a hero half
selAll(G, f => ({ t: 'sel', id: f.id, cards: f.id === 'h0' ? ['ww07', 'ww01'] : ['br01', 'br02'] }));
toHero(G, 'h0'); E.apply(G, { t: 'half', c: 'ww07', h: 'top' }); ok('consume uses the element', G.el.light === 0);
// modifier math
eq('x2 doubles', E.modValue([{ v: 'x2' }], 3).v, 6);
eq('miss is 0', E.modValue([{ v: 'null' }], 3).v, 0);
eq('rolling adds', E.modValue([{ v: 1, roll: 1 }, { v: 1 }], 3).v, 5);
eq('never below 0', E.modValue([{ v: -2 }], 1).v, 0);
// attack: poison +1, shield, pierce, advantage draws two
G = mk(1); f0 = G.figs[0];
const rat = { id: 'mr', kind: 'mon', team: 'm', type: 'crab', elite: false, pos: '1,1', hp: 40, max: 40, cond: { poi: 1 }, rnd: {}, num: 1 }; G.figs.push(rat);
f0.amd.draw = [{ v: 0 }, { v: 0 }, { v: 0 }]; f0.amd.disc = []; G.ev = [];
// direct attack through the module internals: simulate with a hero half
G.ask = { h: 'target', id: 'h0', ids: ['mr'], a: { t: 'atk', v: 3, hits: [] }, left: 1 }; G.act = { id: 'h0', step: 'first', used: [], q: [{ t: 'atk', v: 3, hits: [] }], i: 0, cur: { c: 'ww01', h: 'top', did: false } }; f0.sel = ['ww01', 'ww02'];
E.apply(G, { t: 'tgt', id: 'mr' });
let atk = G.log.filter(e => e.e === 'atk').pop();
ok('poison adds 1 and shield 2 subtracts', atk && atk.base === 4 && atk.dmg === 2, JSON.stringify(atk));
G = mk(1); f0 = G.figs[0]; f0.cond.str = 'go'; f0.amd.draw = [{ v: 0 }, { v: -1 }, { v: 1 }]; const r2 = { id: 'm2', kind: 'mon', team: 'm', type: 'rat', elite: false, pos: '1,1', hp: 40, max: 40, cond: {}, rnd: {}, num: 1 }; G.figs.push(r2);
G.ask = { h: 'target', id: 'h0', ids: ['m2'], a: { t: 'atk', v: 2, hits: [] }, left: 1 }; G.act = { id: 'h0', step: 'first', used: [], q: [{ t: 'atk', v: 2, hits: [] }], i: 0, cur: { c: 'ww01', h: 'top', did: false } }; f0.sel = ['ww01', 'ww02'];
E.apply(G, { t: 'tgt', id: 'm2' }); atk = G.log.filter(e => e.e === 'atk').pop();
ok('strong: two cards, better counts', atk.adv && atk.other && atk.dmg === 3, JSON.stringify(atk));
// heal cures poison without healing
G = mk(1); f0 = G.figs[0]; f0.hp = 5; f0.cond.poi = 1; G.ask = { h: 'first', id: 'h0' }; f0.sel = ['ww03', 'ww01'];
G.act = { id: 'h0', step: 'first', used: [], q: [], i: 0 }; E.apply(G, { t: 'half', c: 'ww03', h: 'bot' }); while (G.ask && G.ask.h === 'move') E.apply(G, { t: 'skip' });
ok('heal on a poisoned hero only cures', f0.hp === 5 && !f0.cond.poi);
// monster focus and ranged disadvantage
G = mk(1); const monk = { id: 'mm', kind: 'mon', team: 'm', type: 'wight', elite: false, pos: '6,0', hp: 9, max: 9, cond: {}, rnd: {}, num: 1 };
G.figs.push(monk); G.figs[0].pos = '4,1'; G.figs[1].pos = '1,1';
const foc = E.findFocus(G, monk, { r: 4 }, E.monInfo(G, monk)); ok('monster focus: least movement then closest', foc && foc.id === 'h0', foc && foc.id);
// door opens and spawns
G = mk(1); const before = G.figs.length; G.figs[0].pos = insideDoor(G); selAll(G); toHero(G, 'h0');
G.act.q = [{ t: 'move', v: 2 }]; G.act.i = 0; G.act.cur = { c: G.figs[0].sel[0], h: 'bot', did: false }; G.ask = { h: 'move', id: 'h0', v: 2, hexes: [doorOf(G)] };
E.apply(G, { t: 'hex', k: doorOf(G) });
ok('door opens, next room revealed and monsters appear', G.hex[doorOf(G)].open && G.figs.length > before);
// trap
G = mk(1); f0 = G.figs[0]; const tk = E.nb(f0.pos).find(k => G.hex[k] && G.hex[k].t === 'f' && !E.figAt(G, k)); G.hex[tk].t = 'trap'; const hp0 = f0.hp; selAll(G, f => ({ t: 'sel', id: f.id, cards: f.id === 'h0' ? ['ww06', 'ww01'] : ['br09', 'br07'] })); toHero(G, 'h0'); const from = f0.pos;
G.act.q = [{ t: 'move', v: 1 }]; G.act.i = 0; G.act.cur = { c: f0.sel[0], h: 'bot', did: false }; f0.pos = from; G.ask = { h: 'move', id: 'h0', v: 1, hexes: [tk] };
E.apply(G, { t: 'hex', k: tk }); ok('trap deals 2+level then is gone', f0.hp === hp0 - D.trapDmg(G.L) && G.hex[tk].t === 'f');
// coin pickup at end of turn
G = mk(1); f0 = G.figs[0]; const coinHex = Object.keys(G.hex).find(k => G.hex[k].coin); f0.pos = coinHex; selAll(G, f => ({ t: 'sel', id: f.id, cards: f.id === 'h0' ? ['ww06', 'ww01'] : ['br01', 'br02'] })); toHero(G, 'h0');
E.apply(G, { t: 'half', c: 'ww06', h: 'top' }); E.apply(G, { t: 'half', c: 'ww01', h: 'bot' }); while (G.ask && G.ask.h === 'move' && G.ask.id === 'h0') E.apply(G, { t: 'skip' });
ok('coin picked up at end of turn', f0.coins === 1 && !G.hex[coinHex].coin);
// block a lethal hit
G = mk(1); f0 = G.figs[0]; f0.hp = 2; G.blockAsk = true; G.pend = null;
const ogre = { id: 'mo', kind: 'mon', team: 'm', type: 'ogre', elite: false, pos: '3,1', hp: 9, max: 9, cond: {}, rnd: {}, num: 1 }; G.figs.push(ogre); f0.pos = '2,1';
G.md.ogre = { fam: 'brute', draw: [], disc: [], cur: 7, resh: false };
G.mamd.draw = [{ v: 0 }]; G.order = [{ mt: 'ogre', init: 1 }]; G.ti = -1; G.phase = 'turns'; G.ask = null;
// run the monster turn directly through the public flow: end selection quickly
G = (function () { const g2 = mk(1); g2.figs[0].hp = 2; ogre.pos = E.nb(g2.figs[0].pos).find(k => g2.hex[k] && g2.hex[k].t === 'f' && !E.figAt(g2, k)); g2.figs.push(ogre); g2.md.ogre = { fam: 'brute', draw: [7, 7, 7, 7], disc: [], cur: null, resh: false }; g2.mamd.draw = [{ v: 0 }, { v: 0 }, { v: 0 }, { v: 0 }]; selAll(g2, f => ({ t: 'sel', id: f.id, cards: f.id === 'h0' ? ['ww10', 'ww07'] : ['br09', 'br07'] })); return g2; })();
let seenBlock = false; for (let i = 0; i < 40 && G.ask && G.ask.h !== 'sel'; i++) { if (G.ask.h === 'block') { seenBlock = true; const h = E.fig(G, G.ask.id), c = E.validMoves(G).find(m => m.t === 'block'); const lostB = h.lost.length, hpB2 = h.hp; E.apply(G, c); ok('blocking loses a hand card and no damage', h.lost.length === lostB + 1 && h.hp === hpB2); break; } E.apply(G, AI.choose(G)); }
ok('lethal hit offers a block', seenBlock);
// campaign
let camp = C.newCamp(['warden', 'ringer'], 0);
eq('campaign starts with scenario 1', camp.unlocked, [1]);
const fakeDone = { won: true, round: 5, res: [{ id: 'h0', xp: 50, gold: 10, kills: 4, coins: 2, minhp: 10, max: 10, taken: 0, dealt: 15, lostCount: 1, lrests: 0, sxp: 8, exh: false, goal: 'g1' }, { id: 'h1', xp: 10, gold: 4, kills: 0, coins: 0, minhp: 2, max: 8, taken: 6, dealt: 2, lostCount: 4, lrests: 1, sxp: 2, exh: false, goal: 'g1' }], items: [] };
const sum = C.result(camp, 1, fakeDone);
ok('win unlocks next scenario', camp.unlocked.indexOf(2) >= 0 && camp.done[1]);
ok('XP levels up at 45', C.lvl(camp.party[0]) === 2 && sum.heroes[0].lvlUp);
ok('goal met gives a check', camp.party[0].checks === 1 && camp.party[1].checks === 0);
ok('level-up asks for a new card', C.cardPending(camp.party[0]) && C.levelChoices(camp.party[0]).every(id => D.CARD[id].lvl <= 2));
C.pickCard(camp.party[0], C.levelChoices(camp.party[0])[0]); ok('hand keeps its size after a new card', camp.party[0].hand.length === 10);
ok('a perk per level', C.perksLeft(camp.party[0]) === 1);
camp.party[0].gold = 100; ok('buy an item', C.buy(camp, camp.party[0], 'i10') === '' && camp.party[0].items.length === 1);
ok('one body slot only', C.buy(camp, camp.party[0], 'i04') === '' && C.buy(camp, camp.party[0], 'i05') !== '');

// ---------- test games ----------
const N = process.env.QUICK === '1' ? 1 : 3, scs = process.env.QUICK === '1' ? [1, 2, 3, 4, 5] : D.SCEN_LIST.map(s => s.id);
const parties = [['warden', 'ringer'], ['ratter', 'lamp'], ['warden', 'ringer', 'ratter', 'lamp'], ['lamp']];
let games = 0, wins = 0, errs = 0;
scs.forEach(id => parties.forEach(p => { for (let i = 0; i < N; i++) {
  try {
    const g = E.newScenario(id, p.map(c => ({ cls: c, lvl: Math.min(9, 1 + Math.floor((id - 1) / 3)) })), { seed: id * 100 + i }); let n = 0;
    while (!g.done && n++ < 8000) { const m = AI.choose(g); E.apply(g, m); g.ev = []; const inv = E.checkInvariants(g); if (inv.length) throw new Error(inv.join('; ')); }
    if (!g.done) throw new Error('stuck at ' + JSON.stringify(g.ask)); games++; if (g.done.won) wins++;
  } catch (e) { errs++; console.log('FAIL game sc' + id + ' ' + p + ': ' + e.message); }
} }));
ok('test games finish without errors', errs === 0, errs + ' errors');
console.log('games ' + games + ' (helper wins ' + wins + ')');
console.log((fail ? 'FAIL' : 'PASS') + ' wickdeep rules-test: ' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
