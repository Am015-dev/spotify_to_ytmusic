// Twin Thrones (W492): the guided first game's fixed deal, played move by move on the real engine.
// Checks every rule the tutorial claims really happens (costs, flips, chain, pair token, loot, who chooses the start). node tutorial-script-test.js
var E = require('./src/engine.js'), D = require('./src/data.js'), fs = require('fs');
var src = fs.readFileSync(__dirname + '/src/tutor.js', 'utf8'), fails = 0;
function grab(name) { var m = src.match(new RegExp('var ' + name + ' = ([\\s\\S]*?);\\n')); return eval('(' + m[1] + ')'); }
function row(xs, up) { return { xs: xs, up: up }; }
var POOL = grab('POOL'), DECK = grab('DECK'), TLAY = grab('TLAY');
D.LAYOUT[1] = TLAY[1]; D.LAYOUT[2] = TLAY[2]; D.LAYOUT[3] = TLAY[3];
var G = E.newGame({ seed: 5, first: 0 }); G.draft.pool = POOL.slice(); G.draft.avail = POOL.slice(0, 4);
G.tokensUp = ['t-strategy', 't-agriculture', 't-philosophy', 't-urbanism', 't-law']; G.decks[1] = DECK[1].slice(); G.decks[2] = DECK[2].slice(); G.decks[3] = DECK[3].slice();
function ok(cond, msg) { if (!cond) { fails++; console.log('FAIL ' + msg); } else console.log('ok   ' + msg); }
function cell(id) { return G.pyr.filter(function (c) { return c.id === id; })[0]; }
function mv(p, m, msg) { if (E.sideToAct(G) !== p) { ok(false, msg + ' (wrong side ' + E.sideToAct(G) + ')'); return; } var legal = E.validMoves(G).some(function (x) { return JSON.stringify(x) === JSON.stringify(m); }); ok(legal, msg + ' is legal'); if (legal) E.apply(G, m); }
function card(p, t, id, msg) { var c = cell(id); mv(p, { t: t, i: c.i }, msg); }
mv(0, { t: 'pick', w: 'w-terraced-orchard' }, 'you pick a wonder'); mv(1, { t: 'pick', w: 'w-sky-tomb' }, 'rival picks'); mv(1, { t: 'pick', w: 'w-bronze-titan' }, 'rival picks again');
ok(G.players[0].wonders.length === 2 && G.draft.n === 4, 'the 4th wonder came to you automatically');
mv(1, { t: 'pick', w: 'w-merchant-road' }, 'round 2: rival picks first'); mv(0, { t: 'pick', w: 'w-moon-grove' }, 'you pick'); mv(0, { t: 'pick', w: 'w-archive-of-dust' }, 'you pick again');
ok(G.phase === 'play' && G.players[1].wonders.length === 4 && G.turn === 0, 'rival got the last wonder; you open Age I');
var c0 = G.players[0].coins; card(0, 'build', 'a1-timber-stand', 'free wood card'); ok(G.players[0].coins === c0, 'free card cost 0');
ok(!cell('a1-roadside-inn').up, 'inn starts face down'); card(1, 'build', 'a1-rock-face', 'rival takes stone'); ok(cell('a1-roadside-inn').up === 1, 'freed face-down inn turned face up');
c0 = G.players[0].coins; card(0, 'build', 'a1-pony-pen', 'pony pen'); ok(G.players[0].coins === c0 && G.mil === 1, 'own wood paid it; pawn +1');
card(1, 'build', 'a1-lookout', 'rival lookout');
c0 = G.players[0].coins; card(0, 'build', 'a1-bathhouse', 'bathhouse'); ok(c0 - G.players[0].coins === 3, 'stone bought at 2 + 1 rival stone card = 3');
card(1, 'build', 'a1-stake-fence', 'rival stake fence');
c0 = G.players[0].coins; card(0, 'build', 'a1-roadside-inn', 'inn'); ok(G.players[0].coins - c0 === 4, 'inn gave 4 coins');
card(1, 'build', 'a1-scribe-room', 'rival scribe room');
c0 = G.players[0].coins; card(0, 'build', 'a1-weights-hall', 'weights hall'); ok(c0 - G.players[0].coins === 2, 'papyrus bought for 2');
ok(G.age === 2 && G.mil === -1 && G.pend[0] && G.pend[0].type === 'first' && G.pend[0].pl === 0, 'Age II: you have fewer shields, so you choose');
mv(0, { t: 'first', who: 0 }, 'you start Age II');
c0 = G.players[0].coins; card(0, 'build', 'a2-horse-yard', 'horse yard'); ok(G.players[0].coins === c0 && G.mil === 0, 'chain: free; pawn back to 0');
card(1, 'build', 'a2-brewhouse', 'rival brewhouse');
var pc = cell('a2-parade-ground'); ok(E.validMoves(G).some(function (m) { return m.t === 'wonder' && m.w === 'w-terraced-orchard' && m.i === pc.i; }), 'orchard is affordable');
mv(0, { t: 'wonder', i: pc.i, w: 'w-terraced-orchard' }, 'build the orchard'); ok(G.built === 1 && E.sideToAct(G) === 0 && G.players[0].coins === 6, 'orchard: paid 6, +6 coins, play again');
card(0, 'build', 'a2-measure-hall', 'measure hall'); ok(G.pend[0] && G.pend[0].type === 'token', 'scale pair: token choice');
mv(0, { t: 'token', id: 't-strategy' }, 'take the strategy token');
card(1, 'build', 'a2-glassblower', 'rival glassblower');
ok(G.age === 3 && G.mil === 0 && G.pend[0] && G.pend[0].pl === 1, 'tied shields: rival (last card) chooses');
mv(1, { t: 'first', who: 0 }, 'rival lets you start');
var rc = G.players[1].coins; card(0, 'build', 'a3-war-pavilion', 'war pavilion'); ok(G.mil === 4 && rc - G.players[1].coins === 2, 'chain + token shield: pawn 4, rival loses 2');
card(1, 'discard', 'a3-bastion', 'rival sells');
c0 = G.players[0].coins; card(0, 'discard', 'a3-high-fort', 'you sell the last card'); ok(G.players[0].coins - c0 === 3, 'sell = 2 + 1 yellow');
ok(G.over && G.reason !== 'military' && G.final, 'game ends on points with a final score');
var blk = src.slice(src.indexOf('var STEPS = ['), src.indexOf('var RULES')), words = [], re = /'([A-Z][^']* [^']*[.!?])'/g, m; while ((m = re.exec(blk))) words.push(m[1]);
ok(words.length >= 38, 'found every step sentence (' + words.length + ')');
words.forEach(function (w) { var n = w.split(/\s+/).length; ok(n <= 12, 'step text <= 12 words (' + n + '): ' + w); });
console.log(fails ? 'FAIL tutorial script (' + fails + ')' : 'PASS tutorial script'); process.exit(fails ? 1 : 0);
