// Independent rule test (W434): one assertion per numbered rule in RULES-CHECKLIST.md, against the real engine (core.js built from src/).
// node logic-test.js            -> one line per failing rule: "FAIL rule N: expected X, got Y", then "RULES passing a / b"
// Does not reuse rules-test.js; every check sets up its own state, acts, and compares the exact result.
const path = require('path'), fs = require('fs'), cp = require('child_process');
cp.execFileSync('python3', [path.join(__dirname, 'build.py')], { stdio: 'ignore' });
const EC = require('./core.js'), E = EC.E, D = EC.D, SC = D.SCALE;
const clone = o => JSON.parse(JSON.stringify(o));
const J = JSON.stringify;
let pass = 0, total = 0; const fails = [];
function rule(n, fn) {
  total++; let exp, got;
  try { [exp, got] = fn(); } catch (err) { exp = 'no crash'; got = 'crash: ' + err.message; }
  if (J(exp) === J(got)) pass++; else { fails.push(n); console.log('FAIL rule ' + n + ': expected ' + J(exp) + ', got ' + J(got)); }
}
const go1 = () => E.performMove({ t: 'go', n: E.validMoves()[0].n });
// clean fight: given heroes, hero HP 999, every enemy 200 HP with no state; extra enemies marked dead unless keepAll
function F(hs, seed, keepAll) {
  E.newGame({ heroes: hs, seed }); go1(); const g = E.G();
  g.hs.forEach(x => { x.st = {}; x.blk = 0; x.hp = x.mhp = 999; });
  g.b.en.forEach((e, i) => { e.hp = e.mhp = 200; e.blk = 0; e.st = {}; if (!keepAll && i) e.dead = 1; });
  return g;
}
function give(g, id, hi) { const x = g.hs[hi || 0]; x.hand.push(E.mk(id)); return x.hand.length - 1; }
function play(g, id, tgt, hi) { const x = g.hs[hi || 0], c = give(g, id, hi); x.en = Math.max(x.en, 3); const mv = { t: 'play', h: hi || 0, c }; if (tgt != null) mv.e = tgt; return E.performMove(mv); }
function acts(g) { for (let i = 0, n = g.b.en.length; i < n && g.b; i++) E.step(); }
function endAct(g) { E.performMove({ t: 'end' }); acts(g); }
function toBoss(g) { g.at = g.map.length - 1; g.scr = 'reward'; g.b = null; g.rw = { gold: 0, cards: {}, relics: null, took: {} }; }

// ---------- turn and resources
rule(1, () => { const g = F(['w'], 1), h = g.hs[0]; h.en = 0; h.blk = 7; h.hand = []; E.performMove({ t: 'end' }); E.settle(); return [{ en: 3, blk: 0, hand: 5 }, { en: h.en, blk: h.blk, hand: h.hand.length }]; });
rule(2, () => { const g = F(['w'], 2), h = g.hs[0]; h.hand = []; for (let i = 0; i < 11; i++) h.hand.push(E.mk('w-defend')); h.draw = []; for (let i = 0; i < 6; i++) h.draw.push(E.mk('w-strike')); play(g, 'w-second-wind'); return [13, h.hand.length]; });
rule(3, () => { const g = F(['w'], 3), h = g.hs[0]; h.hand = []; h.draw = []; h.disc = []; for (let i = 0; i < 6; i++) h.disc.push(E.mk('w-strike')); play(g, 'w-second-wind'); return [{ hand: 2, draw: 4, disc: 1 }, { hand: h.hand.length, draw: h.draw.length, disc: h.disc.length }]; });
rule(4, () => { const g = F(['w'], 4), h = g.hs[0]; h.hand = [E.mk('w-defend'), E.mk('w-strike')]; h.disc = []; E.performMove({ t: 'end' }); return [{ hand: 0, disc: 2 }, { hand: h.hand.length, disc: h.disc.length }]; });
rule(5, () => { const g = F(['w'], 5), h = g.hs[0]; h.hand = [E.mk('dazed'), E.mk('w-defend')]; h.disc = []; h.exh = []; E.performMove({ t: 'end' }); return [{ exh: ['dazed'], disc: 1 }, { exh: h.exh.map(c => c.id), disc: h.disc.length }]; });
rule(6, () => { let g = F(['w'], 6), h = g.hs[0]; h.hand = []; play(g, 'w-roar'); const a = h.exh.length; E.debug.win(); E.performMove({ t: 'leave' }); go1(); g = E.G(); h = g.hs[0]; return [{ afterPlay: 1, nextExh: 0, cards: h.deck.length }, { afterPlay: a, nextExh: h.exh.length, cards: h.hand.length + h.draw.length }]; });
rule(7, () => { const g = F(['w'], 7), h = g.hs[0]; g.pots = ['energy-vial']; h.en = 5; E.performMove({ t: 'pot', p: 0 }); return [6, h.en]; });
rule(8, () => { const g = F(['w'], 8), h = g.hs[0]; h.blk = 20 * SC - 2; play(g, 'w-defend'); return [20 * SC, h.blk]; });
rule(9, () => { const g = F(['w'], 9), h = g.hs[0], e = g.b.en[0]; e.id = 'mire-slug'; e.i = -1; e.blk = 10; h.hand = []; E.performMove({ t: 'end' }); const mid = e.blk; E.settle(); return [[10, 0], [mid, e.blk]]; });
rule(10, () => { const g = F(['w'], 10), h = g.hs[0], e = g.b.en[0]; h.blk = 5; play(g, 'w-second-wind'); const a = [h.hp, h.blk]; h.hand = []; e.intent = { atk: 4, tg: 0 }; endAct(g); return [[999 - SC, 5, 999 - SC, 1], a.concat([h.hp, h.blk])]; });
rule(11, () => { const g = F(['w'], 11), h = g.hs[0], e = g.b.en[0]; h.st.str = 3; play(g, 'w-strike', 0); const hp = e.hp; h.st.str = 7; play(g, 'w-kindle'); return [[200 - 4 * SC, 8], [hp, h.st.str]]; });
rule(12, () => { const g = F(['s'], 12), h = g.hs[0], e = g.b.en[0]; h.st.str = 3; e.st.vuln = 3; play(g, 's-strike', 0); const a = [e.hp, e.st.vuln]; e.st.vuln = 3; play(g, 's-cripple', 0); return [[200 - 8 * SC, 2, 3], a.concat([e.st.vuln])]; });
rule(13, () => { const g = F(['w'], 13), h = g.hs[0], e = g.b.en[0]; h.st.weak = 1; play(g, 'w-strike', 0); h.st.weak = 2; play(g, 'w-twin-slash', 0); const a = [e.hp, h.st.weak]; for (let i = 0; i < 4; i++) play(g, 'w-roar'); return [[200, 1, 3], a.concat([e.st.weak])]; });
rule(14, () => { const g = F(['w'], 14), h = g.hs[0], e = g.b.en[0]; h.st.weak = 1; e.st.vuln = 1; play(g, 'w-strike', 0); return [[200 - SC, 0, 0], [e.hp, h.st.weak || 0, e.st.vuln || 0]]; });
rule(15, () => { const g = F(['w'], 15), h = g.hs[0], e = g.b.en[0]; h.hand = []; h.st.vuln = 2; e.intent = { atk: 4, hits: 2, tg: 0 }; endAct(g); const a = [h.hp, h.st.vuln]; E.settle(); h.hand = []; h.st.vuln = 0; e.st.weak = 1; e.intent = { atk: 9, tg: 0 }; endAct(g); return [[983, 1, 983 - (9 - SC), 0], a.concat([h.hp, e.st.weak || 0])]; });
rule(16, () => { const g = F(['w'], 16, true), h = g.hs[0]; const e0 = g.b.en[0]; g.b.en = [e0, clone(e0), clone(e0)]; g.b.en.forEach(e => { e.hp = e.mhp = 200; e.st = { vuln: 1 }; e.dead = 0; }); h.st.weak = 2; play(g, 'w-cleave'); return [{ hp: [200 - 2 * SC, 200 - 2 * SC, 200 - 2 * SC], vuln: [0, 0, 0], weak: 1 }, { hp: g.b.en.map(e => e.hp), vuln: g.b.en.map(e => e.st.vuln || 0), weak: h.st.weak }]; });
rule(17, () => { const g = F(['s'], 17), h = g.hs[0], e = g.b.en[0]; h.hand = []; e.blk = 10; e.st.poison = 4; E.performMove({ t: 'end' }); return [[200 - 4 * SC, 10, 4], [e.hp, e.blk, e.st.poison]]; });
rule(18, () => { const g = F(['s'], 18, true), e0 = g.b.en[0]; g.b.en = [e0, clone(e0)]; g.b.en.forEach(e => { e.hp = e.mhp = 200; e.st = {}; e.dead = 0; }); g.b.en[0].st.poison = 29; play(g, 's-toxic-vial', 1); return [[1, 30], [g.b.en[1].st.poison || 0, (g.b.en[0].st.poison || 0) + (g.b.en[1].st.poison || 0)]]; });
rule(19, () => { const g = F(['s'], 19), h = g.hs[0], e = g.b.en[0]; h.hand = []; e.hp = 2; e.st.poison = 5; E.performMove({ t: 'end' }); return ['reward', g.scr]; });

// ---------- class mechanics
rule(20, () => { const g = F(['s'], 20), h = g.hs[0], e = g.b.en[0]; const s0 = h.hand.some(c => c.id === 'shiv'); h.st.str = 2; e.st.vuln = 1; play(g, 's-blade-fan'); play(g, 's-knife-rain'); const n = h.hand.filter(c => c.id === 'shiv').length; E.performMove({ t: 'play', h: 0, c: h.hand.findIndex(c => c.id === 'shiv'), e: 0 }); return [[false, 5, 200 - 6 * SC], [s0, n, e.hp]]; });
rule(21, () => { const g = F(['m'], 21), h = g.hs[0], s = h.mir; h.mir = 4; play(g, 'm-zen-burst'); const a = h.mir; h.en = 2; E.performMove({ t: 'mir' }); return [[1, 5, 3, 4], [s, a, h.en, h.mir]]; });
rule(22, () => { const g = F(['m'], 22), h = g.hs[0]; h.draw = [E.mk('wound')]; h.disc = [E.mk('m-strike'), E.mk('m-strike'), E.mk('m-strike')]; play(g, 'm-third-eye'); const a = [g.b.scry && g.b.scry.n, h.draw.length, h.disc.length]; E.performMove({ t: 'scry', keep: [0] });
  const g2 = F(['m'], 23), h2 = g2.hs[0]; const c1 = E.mk('m-strike'), c2 = E.mk('m-defend'), c3 = E.mk('wound'); h2.draw = [c3, c2, c1]; h2.disc = []; play(g2, 'm-third-eye'); E.performMove({ t: 'scry', keep: [0, 2] });
  return [[1, 1, 4, [c3.uid, c1.uid]], a.concat([h2.draw.map(c => c.uid)])]; });
rule(23, () => { const g = F(['a'], 24), h = g.hs[0], e = g.b.en[0]; h.orbs = [{ k: 'L', v: 0 }, { k: 'F', v: 0 }, { k: 'D', v: 0 }]; play(g, 'a-zap'); const o = h.orbs.map(x => x.k), hp = e.hp; E.debug.win(); return [[['F', 'D', 'L'], 200 - 2 * SC, 0], [o, hp, E.G().hs[0].orbs.length]]; });
rule(24, () => { const run = (orbs, f) => { const g = F(['a'], 25), h = g.hs[0], e = g.b.en[0]; h.orbs = orbs; h.pw.focus = f; h.hand = []; h.blk = 0; E.performMove({ t: 'end' }); return { d: 200 - e.hp, b: h.blk, v: h.orbs[0] && h.orbs[0].v }; };
  const l0 = run([{ k: 'L', v: 0 }], 0), l1 = run([{ k: 'L', v: 0 }], 1), f0 = run([{ k: 'F', v: 0 }], 0), f1 = run([{ k: 'F', v: 0 }], 1), d0 = run([{ k: 'D', v: 0 }], 0);
  return [[true, true, true, true], [l0.d > 0 && l1.d - l0.d === SC, f0.b > 0 && f1.b - f0.b === SC, d0.v > 0, true]]; });
rule(25, () => { const g = F(['m'], 26), h = g.hs[0], s0 = h.stance; h.stance = 'w'; E.debug.win(); E.performMove({ t: 'leave' }); go1(); return [['n', 'n'], [s0, E.G().hs[0].stance]]; });
rule(26, () => { const g = F(['m'], 27), h = g.hs[0], e = g.b.en[0]; h.stance = 'w'; play(g, 'm-strike', 0); const hp = e.hp; e.intent = { atk: 10, tg: 0 }; return [[200 - 2 * SC, 10], [hp, E.previewHit(0, 0)]]; });
rule(27, () => { const run = blk => { const g = F(['m'], 28), h = g.hs[0]; h.stance = 'w'; h.blk = blk; h.hand = []; E.performMove({ t: 'end' }); return [h.hp, h.blk]; }; return [[[999, 10 - SC], [999 - SC, 0]], [run(10), run(0)]]; });
rule(28, () => { const g = F(['m'], 29), h = g.hs[0]; h.stance = 'c'; h.en = 3; h.hand = []; play(g, 'm-empty-fist', 0); const a = h.en; h.stance = 'w'; h.pw.rush = 2; h.hand = []; h.en = 3; play(g, 'm-eruption', 0); return [[4, 1, 0], [a, h.en, h.hand.length]]; });
rule(29, () => { const g = F(['m'], 30), h = g.hs[0]; h.hand = [E.mk('m-judgment')]; h.disc = []; E.performMove({ t: 'end' }); return [[1, 0], [h.hand.filter(c => c.id === 'm-judgment').length, h.disc.length]]; });

// ---------- enemies and combat
rule(30, () => { const g = F(['w'], 31), e = g.b.en[0]; e.id = 'gape-grub'; let bad = 0; const seen = {};
  for (let r = 0; r < 14 && g.scr === 'battle'; r++) { e.i = -1; g.hs[0].hand = []; E.performMove({ t: 'end' }); E.settle(); const d = g.b.die, it = e.intent, band = d <= 2 ? 0 : d <= 4 ? 1 : 2; seen[band] = 1;
    const ok = it.die === d && ((() => { const w = D.ENEMIES['gape-grub'].pat[0].die[band]; return it.str === w.str && it.blk === w.blk && it.atk === w.atk; })() && (band === 0 ? it.atk > 0 && !it.str : band === 1 ? it.atk > 0 && it.str > 0 : it.str > 0 && !it.atk)); if (!ok) bad++; }
  return [{ bad: 0, bands: 3 }, { bad, bands: Object.keys(seen).length }]; });
rule(31, () => { let g = F(['w', 'a'], 32, true); const rowsOk = g.b.en.every((e, i) => e.row === i % 2 && (e.intent.sleep || e.intent.tg === e.row));
  g = F(['w', 'a'], 33, true); g.b.en.forEach((e, i) => { if (i) e.dead = 1; }); g.b.en[0].intent = { atk: 5, all: 1, tg: 0 }; g.hs.forEach(x => { x.hand = []; x.hp = x.mhp = 50; }); E.performMove({ t: 'end' }); E.performMove({ t: 'end' }); acts(g);
  return [[true, 45, 45], [rowsOk, g.hs[0].hp, g.hs[1].hp]]; });
rule(32, () => { const g = F(['w'], 34, true), e0 = g.b.en[0]; g.b.en = [e0, clone(e0), clone(e0)]; g.b.en.forEach(e => { e.hp = e.mhp = 200; e.dead = 0; e.st = {}; e.intent = { atk: 1, tg: 0 }; }); g.hs[0].hand = []; const q0 = g.q.length; endAct(g);
  return [['e0', 'e1', 'e2'], g.q.slice(q0).filter(f => f.k === 'act').map(f => f.w)]; });
rule(33, () => { let bad = 0, n = 0; [['w'], ['w', 'a']].forEach(hs => { for (let s = 1; s <= 30; s++) { E.newGame({ heroes: hs, seed: 400 + s }); go1(); n++; if (E.G().b.en.length !== hs.length) bad++; } }); return [{ wrongSize: 0, of: n }, { wrongSize: bad, of: n }]; });
rule(34, () => { E.newGame({ heroes: ['w'], seed: 35 }); let g = E.G(); g.at = g.map.filter(n => n.f === g.F)[0].id; const bid = g.map[g.at].nx[0]; E.performMove({ t: 'go', n: bid }); g = E.G(); return [[1, g.boss, 'b'], [g.b.en.length, g.b.en[0].id, g.b.kind]]; });
rule(35, () => { const chk = hs => { let bad = 0; for (let s = 0; s < 20; s++) { E.newGame({ heroes: hs, seed: 500 + s }); go1(); E.G().b.en.forEach(e => { const d = D.ENEMIES[e.id], r = d.hp, m = (d.elite || d.boss) && !d.flat ? hs.length : 1; if (e.pf ? e.mhp !== d.hpF : (e.mhp < r[0] * m || e.mhp > r[1] * m)) bad++; }); E.debug.boss(); const bb = E.G().b.en[0]; if (bb.mhp !== D.ENEMIES[bb.id].hp[0] * hs.length) bad++; } return bad; }; return [[0, 0], [chk(['w']), chk(['w', 'a'])]]; });
rule(36, () => { E.newGame({ heroes: ['w', 's', 'a', 'm'].slice(0, 2), seed: 36 }); const hp = k => D.H[k].hp, st = k => D.H[k].start.length, rl = k => D.H[k].relic; return [['80/72/72/72', '10/12/10/10', 'ember-brand,whetstone-ring,spark-core,prayer-beads'], [['w', 's', 'a', 'm'].map(hp).join('/'), ['w', 's', 'a', 'm'].map(st).join('/'), ['w', 's', 'a', 'm'].map(rl).join(',')]]; });
rule(37, () => { const g = F(['w'], 37); g.hs[0].hp = 1; g.hs[0].hand = []; g.b.en[0].intent = { atk: 99, tg: 0 }; endAct(g); const a = [g.scr, g.won];
  const g2 = F(['w', 'a'], 38); g2.b.en.forEach((e, i) => { if (i) e.dead = 1; }); g2.b.en[0].intent = { atk: 99, tg: 1 }; g2.hs.forEach(x => { x.hand = []; x.hp = x.mhp = 50; }); E.performMove({ t: 'end' }); E.performMove({ t: 'end' }); acts(g2);
  return [['over', 0, 'over', 0], a.concat([g2.scr, g2.won])]; });
rule(38, () => { const g = F(['w', 'a'], 39); g.b.kind = 'b'; g.b.en.forEach((e, i) => { if (i) e.dead = 1; }); g.b.en[0].intent = { atk: 99, tg: 1 }; g.hs.forEach(x => { x.hand = []; }); E.performMove({ t: 'end' }); E.performMove({ t: 'end' }); acts(g); return ['battle (optional Last Stand: survivors continue)', g.scr === 'battle' ? 'battle (optional Last Stand: survivors continue)' : g.scr + ' (party loses at once; optional rule not built)']; });
rule(39, () => { E.newGame({ heroes: ['w'], seed: 40, acts: 2 }); const g = E.G(); toBoss(g); return [true, E.validMoves().some(m => m.t === 'stop')]; });

// ---------- rooms
rule(40, () => { E.newGame({ heroes: ['w', 'a'], seed: 41 }); E.debug.rest(); const g = E.G(), h0 = g.hs[0].hp; E.performMove({ t: 'heal', h: 0 }); const a = [g.hs[0].hp - h0, g.scr]; const u = E.validMoves().find(m => m.t === 'upg' && m.h === 1); E.performMove(u); return [[Math.min(g.hs[0].mhp - h0, Math.round(g.hs[0].mhp * 0.3)), 'rest', 'map', 1], a.concat([g.scr, g.hs[1].deck[u.c].u])]; });
rule(41, () => { E.newGame({ heroes: ['w', 'a'], seed: 42 }); E.debug.treasure(); const g = E.G(), r0 = g.relics.length; E.performMove({ t: 'relic', i: 0 }); E.performMove({ t: 'relic', i: 1 }); return [2, g.relics.length - r0]; });
rule(42, () => { const g = F(['w'], 43); g.b.kind = 'e'; E.debug.win(); const rw = E.G().rw; return [[1, 1, 2], [(rw.relics || []).length, rw.cards[0].filter(id => D.CARDS[id].rar === 'r').length, rw.cards[0].filter(id => D.CARDS[id].rar !== 'r').length]]; });
rule(43, () => { E.newGame({ heroes: ['w', 'm'], seed: 44 }); E.debug.shop(); const its = E.G().shop.items, cls = h => its.filter(x => x.t === 'card' && D.CARDS[x.id].hero === h).length, neu = its.filter(x => x.t === 'card' && D.CARDS[x.id].hero === 'n').length, rel = its.filter(x => x.t === 'relic'), pts = its.filter(x => x.t === 'pot');
  return [{ w: 3, m: 3, colourless: 3, relics: 3, pots: 3, relicOff: SC * ((D.RELICS[rel[0].id].rar === 'u' ? 9 : 6) - 1), potOff: pts[1].p - SC }, { w: cls('w'), m: cls('m'), colourless: neu, relics: rel.length, pots: pts.length, relicOff: rel[0].p, potOff: pts[0].p }]; });
rule(44, () => { let bad = []; for (let s = 0; s < 6; s++) { E.newGame({ heroes: ['w', 's'], seed: 600 + s }); E.debug.shop(); E.G().shop.items.filter(x => x.t === 'card' && D.CARDS[x.id].hero !== 'n').forEach(x => { const want = SC * { c: 2, u: 3, r: 6 }[D.CARDS[x.id].rar]; if (x.p !== want) bad.push(D.CARDS[x.id].rar + ':' + x.p); }); } return [[], bad.slice(0, 6)]; });
rule(45, () => { E.newGame({ heroes: ['w', 'a'], seed: 46 }); E.debug.shop(); const g = E.G(); E.performMove({ t: 'remove', h: 0, c: 0 }); const m = E.validMoves().filter(x => x.t === 'remove'); return [[false, true, 3 * SC], [m.some(x => x.h === 0), m.some(x => x.h === 1), 400 - g.gold]]; });
rule(46, () => { const run = (idx) => { E.newGame({ heroes: ['w', 's'], seed: 47 }); E.debug.event('stranded-caravan'); const g = E.G(); E.performMove({ t: 'opt', i: idx }); return g.hs.map(h => h.deck.length + ':' + h.deck.filter(c => c.id === 'regret').length); };
  return [{ loot: ['11:1', '13:1'], help: [11, 13] }, { loot: run(1), help: run(0).map(x => +x.split(':')[0]) }]; });
rule(47, () => { E.newGame({ heroes: ['w', 'm'], seed: 48 }); E.debug.shop(); const g = E.G(), i = g.shop.items.findIndex(x => x.t === 'card' && D.CARDS[x.id].hero === 'm'), p = g.shop.items[i].p, d1 = g.hs[1].deck.length, d0 = g.hs[0].deck.length; E.performMove({ t: 'buy', i }); return [[d0, d1 + 1, 400 - p], [g.hs[0].deck.length, g.hs[1].deck.length, g.gold]]; });

// ---------- rewards
rule(48, () => { const g = F(['w'], 49), rd0 = g.rd.w.length; E.debug.win(); const rw = E.G().rw, a = [rw.cards[0].length, g.rd.w.length]; E.performMove({ t: 'pick', h: 0, i: 0 }); return [[3, rd0 - 3, 11, rd0 - 1, true], a.concat([g.hs[0].deck.length, g.rd.w.length, rw.cards[0].every(id => D.CARDS[id].hero === 'w' && D.CARDS[id].rar !== 'r')])]; });
rule(49, () => { const run = hs => { const g = F(hs, 50); g.b.kind = 'b'; E.debug.win(); const rw = E.G().rw; const n = rw.relics.length; let took = 0; for (let i = 0; i < hs.length; i++) if (E.performMove({ t: 'relic', i })) took++; return [n, took, rw.cards[0].every(id => D.CARDS[id].rar === 'r')]; };
  return [[[3, 1, true], [3, 2, true]], [run(['w']), run(['w', 's'])]]; });
rule(50, () => { E.newGame({ heroes: ['w'], seed: 51 }); const a = E.G().pslots; E.newGame({ heroes: ['w', 'a'], seed: 52 }); return [[3, 6], [a, E.G().pslots]]; });
rule(51, () => { const g = F(['w'], 53); g.pots = []; E.debug.win(); const r = E.G(); r.rw.pot = 'fire-flask'; r.rw.took = {}; const offered = E.validMoves().some(m => m.t === 'takepot'); E.performMove({ t: 'takepot' }); const n = r.pots.length; r.rw.took = {}; r.pots = ['a', 'b', 'c']; return [[true, 1, false], [offered, n, E.validMoves().some(m => m.t === 'takepot')]]; });
rule(52, () => { const bad = []; const nums = o => typeof o === 'string' ? [] : o.some(Array.isArray) ? [].concat.apply([], o.map(nums)) : [0, 1, 2, 3].map(i => typeof o[i] === 'number' ? o[i] : 0); D.ORDER.forEach(id => { const c = D.CARDS[id]; if (!c.ops.length) return; const b = E.eff({ id, u: 0 }), u = E.eff({ id, u: 1 }); const nb = [].concat.apply([], b.ops.map(nums)), nu = [].concat.apply([], u.ops.map(nums)); const cb = typeof b.cost === 'number' ? b.cost : 99, cu = typeof u.cost === 'number' ? u.cost : 99;
  const ge = nb.length === nu.length && nb.every((x, i) => nu[i] >= x), gt = nu.some((x, i) => x > nb[i]); if (!(ge && cu <= cb && (gt || cu < cb))) bad.push(id); }); return [[], bad.slice(0, 5)]; });

// ---------- acts and campaign
rule(53, () => { E.newGame({ heroes: ['w'], seed: 54, acts: 2 }); const g = E.G(), b0 = g.boss, m0 = J(g.map); toBoss(g); g.hs[0].hp = 10; E.performMove({ t: 'leave' }); return [{ act: 2, scr: 'map', full: true, at: -1, newBoss: true, newMap: true }, { act: g.act, scr: g.scr, full: g.hs[0].hp === g.hs[0].mhp, at: g.at, newBoss: g.boss !== b0, newMap: J(g.map) !== m0 }]; });
rule(54, () => { E.newGame({ heroes: ['w'], seed: 55, acts: 5 }); const g = E.G(), n = g.acts; toBoss(g); E.performMove({ t: 'leave' }); toBoss(g); E.performMove({ t: 'leave' }); const a = g.act; toBoss(g); E.performMove({ t: 'leave' }); return [[3, 3, 'over', 1], [n, a, g.scr, g.won]]; });
const CAMP = JSON.parse(fs.readFileSync(path.join(__dirname, 'campaign.json'), 'utf8')), CFG = require('./camp-cfg.js');
rule(55, () => { const bad = []; CAMP.chapters.forEach((c, i) => { const s = c.setup; if (!s || !s.heroes) return; E.newGame(clone(s)); const g = E.G(); const eng = J([g.hs[0].k, g.F, g.boss, g.relics.indexOf(s.relic) >= 0, g.ehp]), want = J([s.heroes[0], s.floors, s.boss, true, s.hpPct || 100]); if (eng !== want) bad.push(c.id + ' engine ' + eng + ' want ' + want);
    const cf = CFG[i], pick = o => J([o.heroes, o.floors, o.boss, o.relic, o.hpPct || 100]); if (!cf || pick(cf) !== pick(s)) bad.push(c.id + ' camp-cfg ' + (cf ? pick(cf) : 'missing') + ' vs json ' + pick(s)); }); return [[], bad]; });
rule(56, () => { const bad = []; CAMP.chapters.forEach(c => { const s = c.setup; if (!s || !s.heroes) return; E.newGame(clone(s)); let g = E.G(); const top = Math.max.apply(null, g.map.filter(n => n.t !== 'b').map(n => n.f)), bn = g.map.filter(n => n.t === 'b'); if (top !== s.floors || bn.length !== 1 || bn[0].f !== s.floors + 1) bad.push(c.id + ' map ' + top + '/' + bn.length);
    g.at = g.map.filter(n => n.f === s.floors)[0].id; E.performMove({ t: 'go', n: bn[0].id }); g = E.G(); if (!g.b || g.b.kind !== 'b' || g.b.en[0].id !== s.boss) bad.push(c.id + ' boss ' + (g.b && g.b.en[0].id)); }); return [[], bad]; });
rule(57, () => { const src = fs.readFileSync(path.join(__dirname, 'src', 'camp.js'), 'utf8'), m = src.match(/if \(def\.easy[^\n]*?\);/); const run = (hp) => { const o = hp ? { hpPct: hp } : {}; if (m) new Function('def', 'o', m[0])({ easy: 1 }, o); return o.hpPct; };
  E.newGame({ heroes: ['w'], seed: 56, hpPct: 80, boss: 'gate-colossus' }); const g = E.G(); g.at = g.map.filter(n => n.f === g.F)[0].id; E.performMove({ t: 'go', n: g.map[g.at].nx[0] }); const mh = E.G().b.en[0].mhp;
  return [[80, 80, true], [run(0), run(110), mh >= Math.round(D.ENEMIES['gate-colossus'].hp[0] * 0.8) && mh <= Math.round(D.ENEMIES['gate-colossus'].hp[1] * 0.8)]]; });
rule(58, () => { E.newGame({ heroes: ['w'], seed: 57, asc: 2 }); return ['max HP below the class value with Ascension 2', E.G().hs[0].mhp < D.H.w.hp ? 'max HP below the class value with Ascension 2' : 'Ascension option ignored (max HP ' + E.G().hs[0].mhp + ')']; });
rule(59, () => { E.newGame({ heroes: ['w'], seed: 58, acts: 4 }); return [4, E.G().acts]; });
rule(60, () => { const has = /xform|transform/i.test(J(D.EVENTS)) || /xform|transform/i.test(fs.readFileSync(path.join(__dirname, 'src', 'engine.js'), 'utf8').replace(/\/\/.*$/gm, '')); return ['a transform action exists', has ? 'a transform action exists' : 'no transform action in events or engine']; });

// ---------- W494: systems the original run has that the shelf lacked
rule(61, () => { E.newGame({ heroes: ['w'], seed: 61, bless: 1 }); const g = E.G(), a = [g.scr, g.evn && g.evn.id, g.at]; const gold0 = g.gold; E.performMove({ t: 'opt', i: 1 }); E.performMove({ t: 'leave' }); const g2 = E.G();
  return [['event', 'first-ember', -1, 4 * SC, 'map', -1, true], a.concat([g2.gold - gold0, g2.scr, g2.at, E.validMoves().every(m => m.t === 'go' && g2.map[m.n].f === 1)])]; });
rule(62, () => { E.newGame({ heroes: ['w'], seed: 62, bless: 1 }); const g = E.G(), n0 = g.hs[0].deck.length; E.performMove({ t: 'opt', i: 2 }); const c = g.hs[0].deck[g.hs[0].deck.length - 1]; return [[n0 + 1, 'r'], [g.hs[0].deck.length, D.CARDS[c.id].rar]]; });
rule(63, () => { const ids = Object.keys(D.EVENTS).filter(k => !D.EVENTS[k].start); let seen = new Set(); for (let s = 1; s < 400 && seen.size < ids.length; s++) { E.newGame({ heroes: ['w'], seed: s }); const g = E.G(); const v = g.map.filter(n => n.t === 'v' && n.f === 2)[0]; if (!v) continue; g.at = g.map.filter(n => n.f === 1 && n.nx.indexOf(v.id) >= 0)[0].id; E.performMove({ t: 'go', n: v.id }); seen.add(E.G().evn.id); }
  return [[true, false, true], [ids.length >= 12, seen.has('first-ember'), seen.size >= 10]]; });
rule(64, () => { E.newGame({ heroes: ['w'], seed: 64 }); const g = E.G(); g.gold = 100; g.pots = ['fire-flask', 'fire-flask']; g.scr = 'event'; g.evn = { id: 'herb-witch', res: null }; E.performMove({ t: 'opt', i: 0 }); return [[100 - 2 * SC, 3], [g.gold, g.pots.length]]; });
rule(65, () => { E.newGame({ heroes: ['w'], seed: 65 }); const g = E.G(); g.scr = 'event'; g.evn = { id: 'forge-spirit', res: null }; E.performMove({ t: 'opt', i: 0 }); const pend = g.evn.pend, ms = E.validMoves(); E.performMove(ms[0]); return [['upg', true, 1], [pend, ms.every(m => m.t === 'evpick'), g.hs[0].deck[ms[0].c].u]]; });
rule(66, () => { const u = fs.readFileSync(path.join(__dirname, 'src', 'ui.js'), 'utf8'); return [[true, true], [/UI\.acts = UI\.acts \|\| 1/.test(u), /bless: 1/.test(u)]]; });

// ---------- G3 review fixes
// Iron Bangle: the start-of-fight Block survives into round 1 and is cleared at the start of round 2
rule(67, () => { E.newGame({ heroes: ['w'], seed: 67 }); const g0 = E.G(); g0.relics.push('iron-bangle'); go1(); const g = E.G(), b1 = g.hs[0].blk, t1 = g.b.turn;
  g.hs[0].hp = g.hs[0].mhp = 999; g.b.en.forEach(e => { e.intent = { atk: 0, tg: 0 }; }); E.performMove({ t: 'end' }); for (let k = 0; k < 20 && g.b && g.b.ph === 'e'; k++) E.step(); return [[1, SC, 2, 0], [t1, b1, g.b && g.b.turn, g.hs[0].blk]]; });
// an enemy action resolves top to bottom: its hit lands first, then the Vulnerable it applies (8 into 10 Block = 0 damage, not 16)
rule(68, () => { const g = F(['w'], 68); const h = g.hs[0]; h.hand.forEach(c => { c.id = 'w-defend'; }); g.b.en[0].intent = { atk: 8, vuln: 2, tg: 0 }; h.blk = 10; const pv = E.previewHit(0, 0);
  E.performMove({ t: 'end' }); g.b.ph === 'e' && E.step(); return [[8, 999, 2], [pv, h.hp, h.st.vuln || 0]]; });

// tabletop split: killing the act-1 boss does not end the fight; the dead boss takes no action; at the start of the next round its
// listed slimes arrive in the hero's row with intents; the fight ends when they are all dead
rule(69, () => { E.newGame({ heroes: ['w'], seed: 69 }); const g0 = E.G(); g0.boss = 'mire-behemoth'; E.debug.boss(); const g = E.G(), e = g.b.en[0]; g.hs[0].hp = g.hs[0].mhp = 999; e.blk = 0; e.st = {}; e.hp = 3;
  g.hs[0].hand.push(E.mk('w-strike')); g.hs[0].en = 3; E.performMove({ t: 'play', h: 0, c: g.hs[0].hand.length - 1, e: 0 }); const a = [e.dead, g.scr];
  E.performMove({ t: 'end' }); for (let k = 0; k < 20 && g.b && g.b.ph === 'e'; k++) E.step(); const sp = g.b.en.filter(x => x.spawn);
  const b = [sp.length, J(sp.map(x => x.id)) === J(D.ENEMIES['mire-behemoth'].split), sp.every(x => x.intent && x.row === 0), g.b.turn];
  E.debug.win(); return [[1, 'battle', 3, true, true, 2, 'reward'], a.concat(b, [g.scr])]; });
// potion Discard: removes the potion on any screen, and is never offered to bots as a move
rule(70, () => { E.newGame({ heroes: ['w'], seed: 70 }); const g = E.G(); g.pots = ['fire-flask', 'block-brew']; const ok = E.performMove({ t: 'toss', p: 0 }); return [[true, ['block-brew'], false], [ok, g.pots, E.validMoves().some(m => m.t === 'toss')]]; });

console.log('RULES passing ' + pass + ' / ' + total + (fails.length ? '   failing: ' + fails.join(',') : ''));
process.exit(fails.length ? 1 : 0);
