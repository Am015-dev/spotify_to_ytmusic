// Wildmark scenarios (shell/gx-scenario.js): ?scn=<id> builds ONE state directly.
(function () {
  if (!window.GXS) return;
  var booted = function () { return typeof G !== 'undefined' && typeof newGame === 'function' && typeof UI !== 'undefined' && !!window.GX && !!GX.app; };
  function begin(o) { UI.fast = true; window.ANIM = false; UI.mode = 'quick'; try { GXH.setEnabled(false); } catch (e) { } return newGame(o); }
  var wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  GXS.boardOpen = function () { if (!booted()) return; try { GXH.setEnabled(true); } catch (e) { } UI.mode = 'quick'; newGame({ np: 2, humans: 1, ai: 'normal' }); };
  GXS.add({
    id: 'wm-board', name: 'Your turn: the market', ask: 'Can you see the market and your valley?', seed: 5, when: booted,
    setup: function () { begin({ np: 2, humans: 1, ai: 'normal', seed: 5 }); return wait(300); },
    checks: [
      { kind: 'visible', sel: '#mk .mt[data-i="0"]', name: 'market tile' },
      { kind: 'visible', sel: '#mk .mk[data-i="0"]', name: 'market token' },
      { kind: 'visible', sel: '#map .hx', name: 'starter tiles' },
      { kind: 'text', sel: '#line', re: /pick/i, name: 'instruction line' },
      { kind: 'eq', name: 'turn counter', a: function () { return +(/Turn (\d+)/.exec(document.getElementById('barstat').textContent) || [])[1]; }, b: function () { return G.seats[0].done + 1; } },
      { kind: 'tap', sel: '#mk .mt[data-i="1"]', name: 'take pair 2', state: function () { return G.stage; }, expect: function (b, a) { return b === 'pick' && a === 'tile' || 'stage ' + b + '->' + a; } }
    ]
  });
  GXS.add({
    id: 'wm-place', name: 'Place a tile', ask: 'Do the spots glow and does Place work?', seed: 7, when: booted,
    setup: function () { begin({ np: 2, humans: 1, ai: 'normal', seed: 7 }); take({ t: 'take', i: 0 }); return wait(300); },
    checks: [
      { kind: 'visible', sel: '#map .spot', name: 'glowing spot' },
      { kind: 'play', name: 'place the tile', snap: function () { return Object.keys(G.seats[0].env).length; },
        steps: [{ sel: function () { return document.querySelector('#map .spot'); } }, { sel: '#okB', ready: function () { return !!document.querySelector('#okB'); } }],
        idle: function () { return G.stage === 'tok'; }, verify: function (b, a) { return a === b + 1 || 'tiles ' + b + '->' + a; } }
    ]
  });
  GXS.add({
    id: 'wm-token', name: 'Settle a token', ask: 'Does the bear pair light and score?', seed: 9, when: booted,
    setup: function () {
      begin({ np: 1, humans: 1, seed: 9 });
      var env = G.seats[0].env; env['1,0'] = { id: 801, t: ['forest'], a: ['bear'], key: false, rot: 0, tok: 'bear' }; G.bag.bear--;
      env['2,0'] = { id: 802, t: ['forest'], a: ['bear', 'elk'], key: false, rot: 0, tok: null };
      G.market.tiles[0] = { id: 803, t: ['river'], a: ['salmon'], key: true }; G.bag[G.market.toks[0]]++; G.bag.bear--; G.market.toks[0] = 'bear';
      take({ t: 'take', i: 0 }); act({ t: 'place', c: '0,-1', rot: 0 }); return wait(300);
    },
    checks: [
      { kind: 'visible', sel: '#map .tgt', name: 'a glowing target' },
      { kind: 'play', name: 'make a bear pair', snap: function () { return WM.score(G.seats[0].env, 0).ani.bear; },
        steps: [{ sel: function () { return document.querySelector('#map [data-c="2,0"]'); } }], idle: function () { return G.stage === 'pick'; }, verify: function (b, a) { return b === 0 && a === 4 || 'bear ' + b + '->' + a; } }
    ]
  });
  GXS.add({
    id: 'wm-sweep', name: 'Three matching tokens', ask: 'Is the Sweep button offered?', seed: 4, when: booted,
    setup: function () { begin({ np: 2, humans: 1, ai: 'normal', seed: 4 }); ['elk', 'elk', 'elk'].forEach(function (a, i) { G.bag[G.market.toks[i]]++; G.bag[a]--; G.market.toks[i] = a; }); if (G.market.toks[3] === 'elk') { G.bag.elk++; G.bag.fox--; G.market.toks[3] = 'fox'; } render(); return wait(300); },
    checks: [{ kind: 'tap', sel: '#w3B', name: 'Sweep 3', state: function () { return G.used3; }, expect: function (b, a) { return !b && a || 'used3 ' + b + '->' + a; } }]
  });
  GXS.add({
    id: 'wm-story', name: 'Story: the region map', ask: 'Can you open region 1?', seed: 2, when: booted,
    setup: function () { try { GXT.markDone('wildmark'); } catch (e) { } GXC.open(); return wait(500); },
    checks: [{ kind: 'visible', sel: '.gxc-node', name: 'a region node' },
      { kind: 'fn', name: 'ten chapters, three bosses', fn: function () { var c = CAMPAIGN.chapters; return c.length === 10 && c.filter(function (x) { return x.boss; }).length === 3 || 'chapters ' + c.length; } }]
  });
  GXS.add({
    id: 'wm-boss', name: 'Boss: Bram starts with acorns', ask: 'Does the goal say Beat Bram?', seed: 6, when: booted,
    setup: function () { UI.fast = true; window.ANIM = false; try { GXH.setEnabled(false); } catch (e) { } campStart(CAMPAIGN.chapters[2]); return wait(700); },
    checks: [{ kind: 'eq', name: 'boss acorns', a: function () { return G.seats[1].acorns; }, b: function () { return 2; } },
      { kind: 'visible', sel: '#mk .mt[data-i="0"]', name: 'market' }, { kind: 'text', sel: '#seats .seat:nth-child(2)', re: /Bram/, name: 'boss seat chip' }]
  });
  GXS.add({
    id: 'wm-cards', name: 'Mixed animal cards', ask: 'Do the cards show their new names?', seed: 8, when: booted,
    setup: function () { begin({ np: 2, humans: 1, ai: 'normal', seed: 8, cards: { bear: 'b', elk: 'c', salmon: 'd', hawk: 'c', fox: 'b' } }); return wait(300); },
    checks: [{ kind: 'fn', name: 'bear chip says Bear Trios', fn: function () { var e = document.querySelector('#cards .cc[data-card="bear"]'); return /Bear Trios/.test(e.getAttribute('aria-label')) || e.getAttribute('aria-label'); } },
      { kind: 'tap', sel: '#cards .cc[data-card="hawk"]', name: 'open the cards', state: function () { return GX.open; }, expect: function (b, a) { return a === 'cardsd' && /Sight Lines/.test(document.getElementById('cardsd').textContent) || 'open ' + a; } }]
  });
  GXS.add({
    id: 'wm-result', name: 'Season end: results', ask: 'Can you read the score table?', seed: 3, when: booted,
    setup: function () { begin({ np: 3, humans: 1, ai: 'normal', seed: 3 }); WM.forceEnd(G); step(); return wait(600); },
    checks: [{ kind: 'visible', sel: '#againB', name: 'Play again' }, { kind: 'visible', sel: '#rs .st', name: 'score table' },
      { kind: 'eq', name: 'your total', a: function () { var r = document.querySelectorAll('#rs .st .tot td'); return +r[1].textContent; }, b: function () { return G.res[0].total; } }]
  });
})();
