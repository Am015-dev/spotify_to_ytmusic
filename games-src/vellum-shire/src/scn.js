// Vellum Shire scenarios (shell/gx-scenario.js): ?scn=<id> builds ONE state directly.
(function () {
  if (!window.GXS) return;
  var booted = function () { return typeof G !== 'undefined' && typeof newGame === 'function' && typeof UI !== 'undefined' && document.querySelector('#bd'); };
  var q = function (s) { var b = document.querySelector(s); return b && !b.disabled && b.getBoundingClientRect().width > 3 ? b : null; };
  function quiet() { try { GXH.setEnabled(false); GXH.hide(); } catch (e) { } }
  function game(o, f) { quiet(); window.AIDELAY = 60; var g = newGame('vs', Object.assign({ seed: 11, first: 0, lvl: 'easy' }, o || {})); if (f) { f(g); render(); } quiet(); return g; }
  function give(g, col, pred) { var st = g.stack[col]; var i = st.findIndex(function (id) { return !pred || pred(VS.TILES[id]); }); var id = st.splice(i, 1)[0]; g.p[0].sto[g.p[0].sto.indexOf(null)] = id; return id; }
  var idle = function () { return !UI.busy; };
  GXS.boardOpen = function () { if (!booted()) return; game(); };
  GXS.add({ id: 'vs-board', name: 'Stalls, estate and tray', ask: 'Can you see stalls, estate and dice?', seed: 11, when: booted,
    setup: function () { game(); },
    checks: [{ kind: 'visible', sel: '#estate svg', name: 'estate' }, { kind: 'visible', sel: '.stall', name: 'a stall' }, { kind: 'visible', sel: '[data-die="0"]', name: 'die' }, { kind: 'visible', sel: '.stall.blk', name: 'ink stall' },
      { kind: 'fn', name: '37 estate spaces', fn: function () { return document.querySelectorAll('#estate .hcell').length === 37 || document.querySelectorAll('#estate .hcell').length; } },
      { kind: 'fn', name: '12 stall tiles and 4 ink tiles', fn: function () { var n = document.querySelectorAll('.stall:not(.blk) .tile').length, k = document.querySelectorAll('.stall.blk .tile').length; return (n === 12 && k === 4) || n + '/' + k; } },
      { kind: 'fn', name: 'estate spaces at least 30 px wide', fn: function () { var w = document.querySelector('#estate .hcell').getBoundingClientRect().width; return w >= 30 || 'hex ' + w; } },
      { kind: 'eq', name: 'silver', a: function () { return +document.querySelector('[data-silver] span').textContent; }, b: function () { return G.p[0].silver; } },
      { kind: 'eq', name: 'workers', a: function () { return +document.querySelector('[data-work] span').textContent; }, b: function () { return G.p[0].wk; } }],
    mut: [{ name: 'silver off by one', js: 'G.p[0].silver+=1' }, { name: 'workers off by one', js: 'G.p[0].wk+=1' }] });
  GXS.add({ id: 'vs-take', name: 'Take a tile with a die', ask: 'Tap a die, a glowing tile, Do it', seed: 11, when: booted,
    setup: function () { game({}, function (g) { g.p[0].dice = [3, 3]; g.p[0].wk = 0; }); },
    checks: [{ kind: 'play', name: 'take from stall 3', snap: function () { return { n: G.p[0].sto.filter(function (x) { return x != null; }).length, st: G.st[3].t.length, used: G.p[0].used.join() }; },
      steps: [{ sel: '[data-die="0"]' }, { sel: '.stall[data-st="3"] .tile.tgt', ready: function () { return !!q('.stall[data-st="3"] .tile.tgt'); } }, { sel: '[data-a="opt"]', ready: function () { return !!q('[data-a="opt"]'); } }],
      idle: function () { return idle() && G.p[0].used[0] === 1; }, verify: function (a, b) { return (b.n === a.n + 1 && b.st === a.st - 1 && b.used === '1,0') || JSON.stringify([a, b]); } }],
    mut: [{ name: 'moves do nothing', js: 'doMove=function(){}' }, { name: 'wrong stall', js: 'G.st[3].t=[]' }] });
  GXS.add({ id: 'vs-place', name: 'Place a stored tile', ask: 'Tap the glowing river space, Do it', seed: 11, when: booted,
    setup: function () { game({}, function (g) { g.p[0].dice = [2, 2]; give(g, 'B'); g.st[4].g = [3, 3]; }); },
    checks: [{ kind: 'play', name: 'place the barge on river 2', snap: function () { return { e: G.p[0].est.filter(function (x) { return x != null; }).length, trk: G.p[0].trk }; },
      steps: [{ sel: '[data-h="17"]', ready: function () { return !!document.querySelector('[data-h="17"].tgt'); } }, { sel: '[data-a="opt"]', ready: function () { return !!q('[data-a="opt"]'); } }],
      idle: function () { return idle() && G.p[0].est[17] != null; }, verify: function (a, b) { return (b.e === a.e + 1 && b.trk === a.trk + 1 && G.pend.length === 1 && G.pend[0].h === 'ship') || JSON.stringify([a, b, G.pend]); } }],
    mut: [{ name: 'moves do nothing', js: 'doMove=function(){}' }, { name: 'space number wrong', js: 'VS.HEX[17].d=5;render()' }] });
  GXS.add({ id: 'vs-region', name: 'Fill a region: gold leaf', ask: 'Place the tower. Does the region gild?', seed: 11, when: booted,
    setup: function () { game({}, function (g) { g.p[0].dice = [3, 3]; give(g, 'T', function (t) { return t.k === 'belltower'; }); }); },
    checks: [{ kind: 'play', name: 'town of 1 scores 1 + 10 + tower 4', snap: function () { return { vp: G.p[0].vp }; },
      steps: [{ sel: '[data-h="11"]', ready: function () { return !!document.querySelector('[data-h="11"].tgt'); } }, { sel: '[data-a="opt"]', ready: function () { return !!q('[data-a="opt"]'); } }],
      idle: function () { return idle() && G.p[0].est[11] != null; }, verify: function (a, b) { return (b.vp - a.vp === 15) || 'got ' + (b.vp - a.vp); } },
      { kind: 'eq', name: 'score chip shows the engine score', a: function () { return +document.querySelector('[data-engine="G.p.0.vp"]').textContent; }, b: function () { return G.p[0].vp; } }],
    mut: [{ name: 'region points off', js: 'VS.SIZE_PTS[1]=5' }, { name: 'no chapter bonus', js: 'VS.PHASE_BONUS[0]=0' }] });
  GXS.add({ id: 'vs-sell', name: 'Sell goods', ask: 'Tap your goods, Do it. 2 points each?', seed: 11, when: booted,
    setup: function () { game({}, function (g) { g.p[0].dice = [4, 4]; g.p[0].goods = [{ d: 4, n: 3 }]; g.p[0].silver = 0; }); },
    checks: [{ kind: 'play', name: 'sell 3 goods', snap: function () { return { vp: G.p[0].vp, s: G.p[0].silver }; },
      steps: [{ sel: '[data-goods="4"]', ready: function () { return !!q('[data-goods="4"].tgt'); } }, { sel: '[data-a="opt"]', ready: function () { return !!q('[data-a="opt"]'); } }],
      idle: function () { return idle() && G.p[0].goods.length === 0; }, verify: function (a, b) { return (b.vp - a.vp === 6 && b.s - a.s === 1) || JSON.stringify([a, b]); } }],
    mut: [{ name: 'sell value 3', js: 'VS.SELL_VP=3' }, { name: 'moves do nothing', js: 'doMove=function(){}' }] });
  GXS.add({ id: 'vs-workers', name: 'Workers change a die', ask: 'Tap a tile that needs a worker', seed: 11, when: booted,
    setup: function () { game({}, function (g) { g.p[0].dice = [6, 6]; g.p[0].wk = 2; }); },
    checks: [{ kind: 'play', name: 'take from stall 1 with a 6 and 1 worker', snap: function () { return { wk: G.p[0].wk, n: G.st[1].t.length }; },
      steps: [{ sel: '.stall[data-st="1"] .tile.tgt', ready: function () { return !!q('.stall[data-st="1"] .tile.tgt'); } }, { sel: '[data-a="opt"]', ready: function () { return !!q('[data-a="opt"]'); } }],
      idle: function () { return idle() && G.st[1].t.length === 1; }, verify: function (a, b) { return (a.wk - b.wk === 1 && b.n === a.n - 1) || JSON.stringify([a, b]); } }],
    mut: [{ name: 'workers free', js: 'VSE.validMoves=(function(f){return function(g){return f(g).map(function(m){m.w=0;return m})}})(VSE.validMoves)' }] });
  GXS.add({ id: 'vs-rival', name: 'The rival takes a turn', ask: 'End your turn. Does the rival play?', seed: 11, when: booted,
    setup: function () { game({}, function (g) { g.p[0].dice = [1, 2]; }); },
    checks: [{ kind: 'play', name: 'two worker actions, then the rival plays', snap: function () { return { t: G.turnNo }; },
      steps: [{ sel: '[data-work]', ready: function () { return !!q('[data-work].tgt'); } }, { sel: '[data-a="opt"][data-i="0"]', ready: function () { return !!q('[data-a="opt"]'); } },
        { sel: '[data-work]', ready: function () { return idle() && !!q('[data-work].tgt'); } }, { sel: '[data-a="opt"][data-i="0"]', ready: function () { return !!q('[data-a="opt"]'); }, skip: function () { return G.p[0].used[0] && G.p[0].used[1]; } },
        { sel: '[data-a="end"]', skip: function () { return !q('[data-a="end"]'); }, ready: function () { return idle(); } }],
      idle: function () { return idle() && G.turnNo >= 2 && VSE.side(G) === 0; }, verify: function (a, b) { return b.t >= 2 || 'turns ' + b.t; } }],
    mut: [{ name: 'computer never moves', js: 'aiStep=function(){}' }] });
  GXS.add({ id: 'vs-stuck', name: 'Nothing fits: Workers glow', ask: 'No spot glows. Is Workers obvious?', seed: 11, when: booted,
    setup: function () { game({}, function (g) { g.p[0].dice = [5, 5]; g.p[0].wk = 0; g.p[0].silver = 0; g.p[0].goods = g.p[0].goods.filter(function (x) { return x.d !== 5; }); g.st[5].t.forEach(function (id) { g.gone.push(id); }); g.st[5].t = []; g.st[5].g = []; }); },
    checks: [{ kind: 'fn', name: 'Workers glow and the line says so', fn: function () { return (!!document.querySelector('[data-work].hot') && /Nothing fits: tap the glowing worker/.test(document.querySelector('#prompt').textContent)) || document.querySelector('#prompt').textContent; } },
      { kind: 'play', name: 'tap Workers, take 2', snap: function () { return { wk: G.p[0].wk }; },
      steps: [{ sel: '[data-work]', ready: function () { return !!q('[data-work].hot'); } }, { sel: '[data-a="opt"][data-i="0"]', ready: function () { return !!q('[data-a="opt"]'); }, skip: function () { return G.p[0].wk > 0; } }],
      idle: function () { return idle() && G.p[0].wk > 0; }, verify: function (a, b) { return b.wk - a.wk === 2 || JSON.stringify([a, b]); } }],
    mut: [{ name: 'no stuck cue', js: 'targets=(function(f){return function(){var t=f();t.stuck=false;return t}})(targets);render()' }] });
  GXS.add({ id: 'vs-full', name: 'Storage full on the first tap', ask: 'Tap a tile with full storage', seed: 11, when: booted,
    setup: function () { game({}, function (g) { g.p[0].dice = [3, 3]; g.p[0].wk = 0; give(g, 'B'); give(g, 'B'); give(g, 'Q'); }); },
    checks: [{ kind: 'play', name: 'first tap says storage full', snap: function () { return {}; },
      steps: [{ sel: '.stall[data-st="3"] .tile.tgt', ready: function () { return !!q('.stall[data-st="3"] .tile.tgt'); } }],
      idle: function () { return idle() && !!UI.disc; }, verify: function () { var t = document.querySelector('#prompt').textContent; return /Storage full/.test(t) || t; } }],
    mut: [{ name: 'silent first tap', js: 'setPrompt=function(){}' }] });
  GXS.add({ id: 'vs-zoom', name: 'Every tile, shown large', ask: 'Can you read the lore tile?', seed: 11, when: booted,
    setup: function () { game(); GX.refOpen('l-3'); },
    checks: [{ kind: 'fn', name: 'reference open on lore 3', fn: function () { var t = document.body.innerText; return /Silver Tongue/.test(t) || 'no lore text'; } }] });
  GXS.add({ id: 'vs-result', name: 'Result page', ask: 'Do the totals add up?', seed: 11, when: booted,
    setup: function () { game(); G.p[0].vp = 120; G.p[1].vp = 90; VSE.finish(G); UI.mode = 'vs'; UI.resulted = true; showResult(); },
    checks: [{ kind: 'visible', sel: '#rs .rvt1', name: 'winner line' },
      { kind: 'fn', name: 'totals match the engine', fn: function () { var t = [].map.call(document.querySelectorAll('#rs .rvt'), function (e) { return +e.textContent; }); return (t[0] === G.final[0].total && t[1] === G.final[1].total) || t.join(); } },
      { kind: 'fn', name: 'winner line matches', fn: function () { var t = document.querySelector('#rs .rvt1').textContent; return (G.winner === 0 ? /You win/.test(t) : /wins/.test(t)) || t; } }],
    mut: [{ name: 'winner flips', js: 'G.winner=1-G.winner;showResult()' }] });
})();
