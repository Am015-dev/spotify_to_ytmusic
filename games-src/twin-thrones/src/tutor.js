// Twin Thrones guided first game (W492): one short scripted game that teaches every core rule in play order.
// Each step = one sentence (12 words or fewer) + ONE highlighted tap (a game action, or Next on a rule you see on the board).
// The engine applies the real rules; only the deal and the rival's choices are fixed. After the final score: a real game.
(function () {
  if (typeof GXT === 'undefined' || !window.TT_UI) return;
  var UI = TT_UI, U = UI.U, E = UI.E, $ = UI.$, GAME = 'twin-thrones';
  var T = { active: false, then: null, seen: {} };
  // ---------------------------------------------------------------- the deal
  var POOL = ['w-terraced-orchard', 'w-sky-tomb', 'w-bronze-titan', 'w-stone-riddle', 'w-moon-grove', 'w-merchant-road', 'w-archive-of-dust', 'w-thunder-idol'];
  var DECK = {
    1: ['a1-weights-hall', 'a1-scribe-room', 'a1-roadside-inn', 'a1-bathhouse', 'a1-stake-fence', 'a1-timber-stand', 'a1-rock-face', 'a1-pony-pen', 'a1-lookout'],
    2: ['a2-parade-ground', 'a2-measure-hall', 'a2-glassblower', 'a2-horse-yard', 'a2-brewhouse'],
    3: ['a3-high-fort', 'a3-war-pavilion', 'a3-bastion']
  };
  function row(xs, up) { return { xs: xs, up: up }; }
  var TLAY = { 1: [row([-1, 1], 1), row([-2, 0, 2], 0), row([-3, -1, 1, 3], 1)], 2: [row([-2, 0, 2], 0), row([-1, 1], 1)], 3: [row([0], 0), row([-1, 1], 1)] };
  var LAY0 = null;
  function layout(on) {
    var L = TT.LAYOUT;
    if (on) { if (!LAY0) LAY0 = { 1: L[1], 2: L[2], 3: L[3] }; L[1] = TLAY[1]; L[2] = TLAY[2]; L[3] = TLAY[3]; }
    else if (LAY0) { L[1] = LAY0[1]; L[2] = LAY0[2]; L[3] = LAY0[3]; LAY0 = null; }
  }
  function deal() {
    var g = U.G; g.draft.pool = POOL.slice(); g.draft.avail = POOL.slice(0, 4);
    g.tokensUp = ['t-strategy', 't-agriculture', 't-philosophy', 't-urbanism', 't-law'];
    g.tokensBox = ['t-architecture', 't-economy', 't-masonry', 't-mathematics', 't-theology'];
    g.decks[1] = DECK[1].slice(); g.decks[2] = DECK[2].slice(); g.decks[3] = DECK[3].slice();
  }
  // the rival's fixed choices (the computer opponent makes them through the normal turn flow)
  var RPICK = ['w-sky-tomb', 'w-bronze-titan', 'w-merchant-road'];
  var RPLAY = { 'a1-rock-face': 'build', 'a1-lookout': 'build', 'a1-stake-fence': 'build', 'a1-scribe-room': 'build', 'a2-brewhouse': 'build', 'a2-glassblower': 'build', 'a3-bastion': 'discard' };
  function rivalMove(g) {
    if (!T.active) return null;
    var M = E.validMoves(g), pd = g.pend[0];
    if (pd && pd.type === 'first') return { t: 'first', who: 0 };
    if (g.phase === 'draft') { for (var k = 0; k < RPICK.length; k++) if (g.draft.avail.indexOf(RPICK[k]) >= 0) return { t: 'pick', w: RPICK[k] }; return null; }
    var av = E.available(g);
    for (var j = 0; j < av.length; j++) { var t = RPLAY[av[j].id]; if (t) { var m = { t: t, i: av[j].i }; if (M.some(function (x) { return x.t === m.t && x.i === m.i; })) return m; } }
    return null;
  }
  // ---------------------------------------------------------------- step helpers
  function G() { return U.G; }
  function idle() { return !!U.G && !U.busy && !U.narr && !U.G.over && E.sideToAct(U.G) === 0; }
  function cellOf(id) { var g = G(); if (!g) return null; for (var i = 0; i < g.pyr.length; i++) if (g.pyr[i].id === id) return g.pyr[i]; return null; }
  function cardEl(id) { var c = cellOf(id); return c ? $('c' + c.i) : null; }
  function canTake(id) { var c = cellOf(id); return !!c && !c.taken && E.available(G()).some(function (x) { return x.i === c.i; }); }
  function sel(id) { var c = cellOf(id); return !!c && U.sel === c.i; }
  function pickStep(id, w, say) { return { id: id, rule: id, say: say, target: function () { return document.querySelector('[data-pick="' + w + '"]'); }, wait: { type: 'tap', match: function (a) { return a.kind === 'pick' && a.id === w; } }, ready: function () { return idle() && G().phase === 'draft' && G().draft.avail.indexOf(w) >= 0; } }; }
  function cardStep(id, cid, say) { return { id: id, rule: id, say: say, target: function () { return cardEl(cid); }, wait: { type: 'tap', match: function (a) { var c = cellOf(cid); return a.kind === 'card' && c && a.i === c.i; } }, ready: function () { return idle() && !G().pend.length && canTake(cid) && U.sel == null; } }; }
  function actStep(id, cid, act, say) { return { id: id, rule: id, say: say, target: function () { return document.querySelector('#zoom:not([hidden]) [data-a="' + act + '"]'); }, wait: { type: 'tap', match: function (a) { return a.kind === 'act' && a.a === act; } }, ready: function () { return idle() && sel(cid); } }; }
  function infoStep(id, say, target, ready) { return { id: id, rule: id, say: say, target: target, wait: null, ready: function () { return idle() && (!ready || ready()); } }; }
  // a rule shown right after YOUR move: the rival's turn waits until you tap Next
  function holdStep(id, say, target, ready) { return { id: id, rule: id, hold: 1, say: say, target: target, wait: null, ready: function () { return !!U.G && !U.narr && !U.G.over && (!ready || ready()); } }; }
  function holdRival() { var st = T.active && GXT.current && GXT.current(); return !!(st && st.hold); }
  function pawn() { return $('pawn') || document.querySelector('#mil'); }
  // ---------------------------------------------------------------- the steps, in rule order
  var STEPS = [
    infoStep('goal', 'Most points after three ages wins. War or science win early.', function () { return $('instr'); }, function () { return G().phase === 'draft'; }),
    pickStep('draft', 'w-terraced-orchard', 'First, draft wonders. Tap the glowing wonder to claim it.'),
    infoStep('draft-last', 'Rival took two. The fourth wonder came to you automatically.', function () { return $('s0') || $('pyr'); }, function () { return G().phase === 'draft' && G().draft.n === 5; }),
    pickStep('draft-2', 'w-moon-grove', 'Round two: four new wonders. Rival picked first; you take two.'),
    pickStep('draft-3', 'w-archive-of-dust', 'Take your second one. Rival gets the last wonder.'),
    cardStep('pyramid', 'a1-timber-stand', 'Only uncovered cards glow. Tap the wood card.'),
    actStep('build-free', 'a1-timber-stand', 'build', 'It costs nothing. Tap Build to add it to your city.'),
    infoStep('flip', 'A freed face-down card turns face up.', function () { return cardEl('a1-roadside-inn'); }, function () { var c = cellOf('a1-roadside-inn'); return c && c.up && canTake('a1-roadside-inn'); }),
    cardStep('resource', 'a1-pony-pen', 'This red card needs 1 wood. Tap it.'),
    actStep('own-resource', 'a1-pony-pen', 'build', 'Your wood card pays the wood. Build it free.'),
    holdStep('shield', 'Shields push the war pawn toward your rival.', pawn, function () { return G().mil === 1; }),
    holdStep('military-win', 'Pawn reaches the rival end: you win at once.', function () { return document.querySelector('.mend.r') || pawn(); }),
    cardStep('trade-card', 'a1-bathhouse', 'This card needs stone you lack. Tap it.'),
    actStep('trade', 'a1-bathhouse', 'build', 'Buy stone: 2 coins plus 1 per rival stone card.'),
    cardStep('yellow', 'a1-roadside-inn', 'Yellow cards bring coins. Tap the inn.'),
    actStep('yellow-build', 'a1-roadside-inn', 'build', 'Build it: you get 4 coins now.'),
    cardStep('science', 'a1-weights-hall', 'Green cards carry science symbols. Tap this one.'),
    actStep('science-build', 'a1-weights-hall', 'build', 'Missing papyrus costs 2 coins. Build it.'),
    { id: 'next-age', rule: 'next-age', say: 'Fewer shields than the rival? You choose who starts.', target: function () { return document.querySelector('[data-first="0"]'); }, wait: { type: 'tap', match: function (a) { return a.kind === 'first' && a.who === 0; } }, ready: function () { var pd = G().pend[0]; return idle() && pd && pd.type === 'first' && G().age === 2; } },
    infoStep('age2', 'Age Two: new, stronger cards. Same turn rules.', function () { return $('pyr'); }, function () { return G().age === 2 && !G().pend.length; }),
    cardStep('chain-card', 'a2-horse-yard', 'Your Pony Pen links to this card. Tap it.'),
    actStep('chain', 'a2-horse-yard', 'build', 'Linked cards are free: a chain. Build it.'),
    cardStep('wonder-card', 'a2-parade-ground', 'Any card can build a wonder. Tap this one.'),
    { id: 'wonder', rule: 'wonder', say: 'Tap Wonder: pay its cost, the card goes underneath.', target: function () { return document.querySelector('#zoom:not([hidden]) [data-a="wonder"][data-w="w-terraced-orchard"]'); }, wait: { type: 'tap', match: function (a) { return a.kind === 'act' && a.a === 'wonder' && a.w === 'w-terraced-orchard'; } }, ready: function () { return idle() && sel('a2-parade-ground'); } },
    infoStep('again', 'This wonder gives 6 coins and another turn now.', function () { return $('s0') || $('pyr'); }, function () { return G().built === 1; }),
    infoStep('seven', 'Only seven wonders get built. The eighth one is lost.', function () { return $('s0') || $('pyr'); }),
    cardStep('pair-card', 'a2-measure-hall', 'A second scale symbol makes a pair. Tap it.'),
    actStep('pair-build', 'a2-measure-hall', 'build', 'Buy the stone and build it.'),
    { id: 'pair', rule: 'pair', say: 'A pair earns a progress token. Take this one.', target: function () { return document.querySelector('[data-token="t-strategy"]'); }, wait: { type: 'tap', match: function (a) { return a.kind === 'token' && a.id === 't-strategy'; } }, ready: function () { var pd = G().pend[0]; return idle() && pd && pd.type === 'token'; } },
    holdStep('science-win', 'Six different science symbols is an instant win.', function () { return $('s0') || $('pyr'); }, function () { return G().players[0].tokens.length === 1; }),
    infoStep('tie-start', 'Tied shields: the last card taker chose. You start.', function () { return $('pyr'); }, function () { return G().age === 3 && !G().pend.length; }),
    cardStep('age3', 'a3-war-pavilion', 'Last age. Horse Yard chains to this. Tap it.'),
    actStep('loot-build', 'a3-war-pavilion', 'build', 'Free by chain, plus one extra shield from your token.'),
    holdStep('loot', 'Pawn crossed a coin space: the rival lost 2 coins.', pawn, function () { return G().mil >= 3; }),
    cardStep('sell-card', 'a3-high-fort', 'The last card. Tap it.'),
    actStep('sell', 'a3-high-fort', 'discard', 'Sell it: 2 coins plus 1 per yellow card.'),
    { id: 'score', rule: 'score', say: 'Score: cards, wonders, tokens, war track, 1 per 3 coins.', target: function () { return document.querySelector('#res table'); }, wait: null, ready: function () { return !!G() && G().over && !$('res').hidden && !!document.querySelector('#res table'); } },
    { id: 'tie', rule: 'tie', say: 'Tied on points? More blue card points wins.', target: function () { return document.querySelector('#res table'); }, wait: null, ready: function () { return !!G() && G().over && !$('res').hidden; } }
  ];
  // rules every step teaches (the e2e walks the tutorial and checks each appears)
  var RULES = ['goal', 'draft', 'draft-last', 'draft-2', 'pyramid', 'build-free', 'flip', 'own-resource', 'shield', 'military-win', 'trade', 'yellow-build', 'science-build', 'next-age', 'chain', 'wonder', 'again', 'seven', 'pair', 'science-win', 'tie-start', 'age3', 'loot', 'sell', 'score', 'tie'];
  STEPS.forEach(function (s) { var on = s.onEnter; s.onEnter = function () { T.seen[s.id] = 1; if (on) on(); }; });
  // ---------------------------------------------------------------- start / end
  function off() { T.active = false; document.body.classList.remove('ttguided'); layout(false); U.tut = false; U.rivalName = null; }
  function start(o) {
    T.then = (o && o.then) || null; U.lvl = 'easy'; T.seen = {};
    $('res').hidden = true; $('start').hidden = true;
    U.tut = true; U.rivalName = 'Pell'; layout(true); T.active = true; document.body.classList.add('ttguided');
    UI.newGame('cpu', 5); deal(); U.fingerDone = true; UI.render();
    GXT.start({ game: GAME, story: false, endTitle: 'You know the rules', endText: 'Now play a real game against the computer.', endButtons: [{ id: 'go', label: 'Play a real game' }],
      steps: STEPS, setup: function () { },
      onDone: function () { off(); try { GXT.markDone(GAME); } catch (e) { } $('res').hidden = true; var f = T.then; T.then = null; if (f) f(); else UI.newGame('cpu'); },
      onExit: function () { off(); if (T.then) { var f = T.then; T.then = null; f(); } else UI.showStart(); } });
  }
  function coverage() { return { all: RULES.slice(), seen: Object.keys(T.seen) }; }
  Object.defineProperty(window, 'GXCOACH', { configurable: true, get: function () { return { running: !!T.active, explained: Object.keys(T.seen), done: !T.active }; } });
  window.TT_TUTOR = { start: start, cancel: function () { if (T.active) off(); }, coverage: coverage, rivalMove: rivalMove, holdRival: holdRival, steps: STEPS, rules: RULES, words: function () { return STEPS.map(function (s) { return [s.id, s.say.split(/\s+/).length]; }); } };
})();
