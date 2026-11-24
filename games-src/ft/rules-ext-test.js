// W624 rules audit: player counts, expansions and the 6 extra djinns (28 djinn types total), against the real engine.
// Run: node rules-ext-test.js  -> one line per failing rule, then totals. Numbers from rules-notes.md.
const fs = require('fs'), vm = require('vm'), path = require('path');
const C = { console, Math, Date, JSON, setTimeout, clearTimeout, performance: { now: Date.now }, window: {}, document: {} }; vm.createContext(C);
for (const f of ['data', 'djinns', 'engine']) vm.runInContext(fs.readFileSync(path.join(__dirname, 'src', f + '.js'), 'utf8'), C, { filename: f });
const run = s => vm.runInContext(s, C); run('UI.sim=true;');
const g = () => run('G');
let pass = 0, fail = 0; const bad = [];
function T(id, text, fn) { try { const r = fn(); if (r !== true) throw new Error('got ' + JSON.stringify(r)); pass++ } catch (e) { fail++; bad.push(id); console.log(`FAIL ${id} ${text}: ${e.message}`) } }
function game(np, ex) { run('DEFSEED=77;'); C.newGame({ np, ex: ex || {}, seats: Array(np).fill('human') }); return g() }
const cnt = (a, f) => a.filter(f).length;

T('X1', '3 and 4 players: 8 camels and 1 marker each, 9-spot track', () => [3, 4].every(n => { const G = game(n); return G.pl.every(p => p.camels === 8 && p.markers === 1) && G.track.length === 9 }));
T('X2', '2 players: 11 camels and 2 markers each', () => { const G = game(2); return G.pl.every(p => p.camels === 11 && p.markers === 2) && G.bidQueue.length === 4 });
T('X3', '5 players: 8 camels, 12-spot track, Wonder Cities board forced on', () => { const G = game(5); return G.pl.every(p => p.camels === 8) && G.track.length === 12 && G.ex.sultan === true && JSON.stringify(G.track.map(t => t.cost)) === '[18,12,8,5,5,3,3,1,1,0,0,0]' });
T('X4', 'Base board is 6x5 = 30 tiles, 3 people on each (90 meeples)', () => { const G = game(3); return G.board.length === 30 && G.board.every(t => t.m.length === 3) && G.bag.length === 0 });
T('X5', 'Crafters: 6x6 board, 3 Workshops + 2 Spice Exchanges + 1 Ravine, 15 Crafters, a tent each', () => { const G = game(3, { artisans: true }); return G.W * G.H === 36 && cnt(G.board, t => t.k === 'workshop') === 3 && cnt(G.board, t => t.k === 'exchange') === 2 && cnt(G.board, t => t.k === 'ravine') === 1 && G.meepleTotal === 105 && G.pl.every(p => p.tent === 1) });
T('X6', 'Crafters: Workshops sit in the inner area, 2 mountains each, every tile still reachable', () => { const G = game(3, { artisans: true }); const inner = i => { const c = i % G.W, r = Math.floor(i / G.W); return c > 0 && c < G.W - 1 && r > 0 && r < G.H - 1 }; return G.board.filter(t => t.k === 'workshop').every(t => inner(t.i)) && Object.keys(G.walls).length === 6 && C.connected() });
T('X7', 'Crafters scoring: most Crafters scores 3 each, others 2 each (ties all count as most)', () => { const G = game(3, { artisans: true }); G.pl[0].art = 4; G.pl[1].art = 2; G.pl[2].art = 4; return C.scoreOf(G.pl[0]).crafters === 12 && C.scoreOf(G.pl[1]).crafters === 4 && C.scoreOf(G.pl[2]).crafters === 12 });
T('X8', 'Crafters: precious items score 5/7/9, magic items score nothing', () => { const G = game(3, { artisans: true }); G.pl[0].items = ['gem5', 'gem7', 'gem9', 'lamp']; return C.scoreOf(G.pl[0]).items === 21 });
T('X9', 'Crafters: item deck is 9 precious + 9 magic', () => { const G = game(3, { artisans: true }); return G.items.length === 18 && cnt(G.items, k => C.ITEMS ? true : true) === 18 && cnt(G.items, k => run('ITEMS')[k].kind === 'precious') === 9 });
T('X10', 'Crafters: a tent scores its tile value plus 1 per red tile around it', () => { const G = game(3, { artisans: true }); for (const t of G.board) { t.camel = null; t.tent = null; t.palm = 0; t.pal = 0 } const t = G.board[G.W + 1]; t.camel = 0; t.tent = 0; const reds = C.AROUND(t.i).filter(j => !G.board[j].blue && !G.board[j].block).length; return C.scoreOf(G.pl[0]).tiles === t.v + reds });
T('X11', 'Wonder Cities: 6x6 board with 3 blue + 2 red Wonder Cities and the Great Lake; 15 extra meeples', () => { const G = game(3, { sultan: true }); return G.W * G.H === 36 && cnt(G.board, t => t.k === 'city' && t.blue) === 3 && cnt(G.board, t => t.k === 'city' && !t.blue) === 2 && cnt(G.board, t => t.k === 'lake') === 1 && G.meepleTotal === 105 });
T('X12', 'Wonder Cities: holding 1..5 cities scores 5/20/45/80/125 on top of the tiles', () => JSON.stringify([1, 2, 3, 4, 5].map(c => run('CITYVP')(c))) === '[5,20,45,80,125]');
T('X13', 'Great Lake: palms and palaces on tiles touching it score double', () => { const G = game(3, { sultan: true }); for (const t of G.board) { t.camel = null; t.palm = 0; t.pal = 0 } const lake = G.board.find(t => t.k === 'lake'); const n = C.nbr(lake.i).find(j => !G.board[j].block); G.board[n].camel = 0; G.board[n].palm = 1; G.board[n].pal = 1; const s = C.scoreOf(G.pl[0]); return s.palms === 6 && s.palaces === 10 });
T('X14', 'Both expansions: 6x7 board', () => { const G = game(3, { artisans: true, sultan: true }); return G.W === 6 && G.H === 7 });
T('X15', 'Cutpurses: one face-up cutpurse to hire', () => { const G = game(3, { thieves: true }); return G.thRow.length === 1 });
T('X16', 'Djinn deck: 22 base; +3 promos; +2 Crafters djinns; +1 Cutpurse djinn = 28 types', () => { const F = e => C.DJINNS_FOR(e).length; return F({}) === 22 && F({ promos: true }) === 25 && F({ artisans: true }) === 24 && F({ thieves: true }) === 23 && run('DJINNS').length === 28 });
T('X17', 'Promo Majlis: every djinn you own earns 4 more points', () => { const G = game(3, { promos: true }); G.pl[0].dj = ['majlis', 'tamuz']; const vp = run('DJ').majlis.vp + run('DJ').tamuz.vp; return C.scoreOf(G.pl[0]).djinns === vp + 8 });
T('X18', 'Crafters djinn San’a: each Crafter earns 3 more', () => { const G = game(3, { artisans: true }); G.pl[0].art = 2; G.pl[0].dj = ['sana']; return C.scoreOf(G.pl[0]).crafters === 2 * 3 + 6 });
T('X19', 'Crafters djinn Jawhar: each precious item earns 4 more', () => { const G = game(3, { artisans: true }); G.pl[0].items = ['gem5']; G.pl[0].dj = ['jawhar']; return C.scoreOf(G.pl[0]).items === 9 });
T('X20', 'Promo Amir: Advisors taken by a rival pay you 2', () => { const G = game(3, { promos: true }); G.pl[1].dj = ['amir']; const c = G.pl[1].coins; G.cur = 0; C.trig('vizier', 0); return G.pl[1].coins - c === 2 || 'trig signature' });
T('X21', 'Cutpurse djinn Hafiz: owner gives nothing to a cutpurse', () => /hasDj\(q,'hafiz'\)/.test(C.useThief.toString()));
T('X22', 'Every djinn has a written effect and a VP value', () => run('DJINNS').every(d => d.x && d.x.length > 8 && typeof d.vp === 'number'));
console.log(`rules-ext-test: ${pass + fail} rules, ${pass} pass, ${fail} fail${fail ? ' (' + bad.join(',') + ')' : ''}`);
process.exit(fail ? 1 : 0);
