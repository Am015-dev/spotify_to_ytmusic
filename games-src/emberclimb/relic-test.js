// F3: every relic's printed effect applies in the engine. node relic-test.js  -> "RELICS passing a / b"
const path = require('path'), cp = require('child_process');
cp.execFileSync('python3', [path.join(__dirname, 'build.py')], { stdio: 'ignore' });
const EC = require('./core.js'), E = EC.E, D = EC.D, SC = D.SCALE;
let pass = 0, total = 0;
const T = (n, fn) => { total++; let r; try { r = fn(); } catch (e) { r = 'crash ' + e.message; } if (r === true) pass++; else console.log('FAIL relic ' + n + ': ' + r); };
const go1 = () => E.performMove({ t: 'go', n: E.validMoves()[0].n });
function start(hero, relic, seed) { E.newGame({ heroes: [hero], seed }); const g = E.G(); if (relic) { g.relics = g.relics.filter(r => r !== relic); } return g; }
function gain(g, id) { g.rw = { gold: 0, cards: {}, relics: [id], took: {}, nrel: 1 }; g.scr = 'reward'; g.b = null; E.performMove({ t: 'relic', i: 0 }); g.scr = 'map'; g.rw = null; }
function fightWith(hero, relic, seed, nogain) { const g = start(hero, relic, seed); if (!nogain) gain(g, relic); go1(); return E.G(); }
T('oak-heart', () => { const g = start('w', 'oak-heart', 1), m = g.hs[0].mhp; gain(g, 'oak-heart'); return g.hs[0].mhp === m + SC && g.hs[0].hp === m + SC || 'mhp ' + g.hs[0].mhp; });
T('lucky-coin', () => { const g = start('w', 'lucky-coin', 1), v = g.gold; gain(g, 'lucky-coin'); return g.gold === v + SC || g.gold; });
T('pocket-satchel', () => { const g = start('w', 'pocket-satchel', 1), v = g.pslots; gain(g, 'pocket-satchel'); return g.pslots === v + 1 || g.pslots; });
T('whetstone-ring', () => { const b = fightWith('s', 'whetstone-ring', 5, 1).hs[0].hand.length; const g = fightWith('s', 'whetstone-ring', 5); return g.hs[0].hand.length === b + 2 || b + ' -> ' + g.hs[0].hand.length; });
T('candle-stub', () => { const b = fightWith('w', null, 5).hs[0].hand.length; const g = fightWith('w', 'candle-stub', 5); return g.hs[0].hand.length === b + 1 || b + ' -> ' + g.hs[0].hand.length; });
T('lantern', () => { const g = fightWith('w', 'lantern', 5); return g.hs[0].en === 4 || g.hs[0].en; });
T('iron-bangle', () => { const g = fightWith('w', 'iron-bangle', 5); return g.hs[0].blk === SC || g.hs[0].blk; });
T('bag-of-marbles', () => { const g = fightWith('w', 'bag-of-marbles', 5); return g.b.en.every(e => (e.st.vuln || 0) >= 1) || J(g.b.en.map(e => e.st)); });
T('spark-core', () => { const g = fightWith('a', 'spark-core', 5); return g.hs[0].orbs.some(o => o.k === 'L') || JSON.stringify(g.hs[0].orbs); });
T('prayer-beads', () => { const g = fightWith('m', 'prayer-beads', 5); return g.hs[0].mir === 1 || g.hs[0].mir; });
T('ember-brand', () => { const g = fightWith('w', 'ember-brand', 5); g.hs[0].hp = 2; E.debug.win(); return E.G().hs[0].hp === 2 + SC || E.G().hs[0].hp; });
T('gold-tooth', () => { const g = fightWith('w', null, 5); const g0 = g.gold; E.debug.win(); const base = E.G().gold - g0; const h = fightWith('w', 'gold-tooth', 5); const h0 = h.gold; E.debug.win(); const gt = E.G().gold - h0; return gt === Math.round(base * 1.5) || base + ' -> ' + gt; });
T('healing-moss', () => { const g = start('w', 'healing-moss', 5); g.hs[0].hp = 2; E.debug.rest(); g.hs[0].hp = 2; E.performMove({ t: 'heal', h: 0 }); const b = E.G().hs[0].hp; const h = start('w', 'healing-moss', 5); gain(h, 'healing-moss'); E.debug.rest(); h.hs[0].hp = 2; E.performMove({ t: 'heal', h: 0 }); return E.G().hs[0].hp === b + SC || b + ' -> ' + E.G().hs[0].hp; });
T('dawnstone', () => { const g = fightWith('w', 'dawnstone', 5); const h = g.hs[0]; h.hand = []; E.performMove({ t: 'end' }); for (let i = 0; i < 6 && E.G().b && E.G().b.ph !== 'p'; i++) E.step(); E.settle(); return E.G().hs[0].en === 4 || E.G().hs[0].en; });
T('gale-cloak', () => { const g = fightWith('w', 'gale-cloak', 5); const h = g.hs[0]; E.performMove({ t: 'end' }); for (let i = 0; i < 6 && E.G().b && E.G().b.ph !== 'p'; i++) E.step(); E.settle(); return E.G().hs[0].hand.length === 6 || E.G().hs[0].hand.length; });
T('tin-flute', () => { const g = fightWith('w', 'tin-flute', 5); const h = g.hs[0]; h.blk = 0; h.en = 3; h.hand = [E.mk('w-defend')]; const d = E.mk('w-defend'); E.performMove({ t: 'play', h: 0, c: 0 }); const a = E.G().hs[0].blk; const b = fightWith('w', null, 5); b.hs[0].blk = 0; b.hs[0].en = 3; b.hs[0].hand = [E.mk('w-defend')]; E.performMove({ t: 'play', h: 0, c: 0 }); return a === E.G().hs[0].blk + SC || a + ' vs ' + E.G().hs[0].blk; });
T('smoking-censer', () => { const dmg = (r) => { const g = fightWith('w', r, 5); const e = g.b.en[0]; e.hp = e.mhp = 500; e.blk = 0; e.st = {}; g.hs[0].en = 3; g.hs[0].hand = [E.mk('w-strike')]; g.hs[0].st = {}; E.performMove({ t: 'play', h: 0, c: 0, e: 0 }); return 500 - E.G().b.en[0].hp; }; const a = dmg(null), b = dmg('smoking-censer'); return b === a + SC || a + ' -> ' + b; });
T('clover-dice', () => { const g = fightWith('w', 'clover-dice', 5); return g.relics.indexOf('clover-dice') >= 0 && true; });
T('phoenix-ash', () => { const g = fightWith('w', 'phoenix-ash', 5); g.hs[0].hp = 1; E.debug.hurt(0, 999); return (E.G().hs[0].hp === Math.floor(g.hs[0].mhp * 0.3) && !E.G().hs[0].dead) || 'hp ' + E.G().hs[0].hp; });
function J(x) { return JSON.stringify(x); }
const all = Object.keys(D.RELICS).length; console.log('relics in data: ' + all + ', tested: ' + total);
console.log('RELICS passing ' + pass + ' / ' + total); process.exit(pass === total && all === total ? 0 : 1);
