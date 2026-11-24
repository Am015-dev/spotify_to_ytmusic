// Meadowfold scenarios (shell/gx-scenario.js): ?scn=<id> builds ONE state directly.
(function () {
  if (!window.GXS) return;
  var booted = function () { return typeof G !== 'undefined' && typeof newGame === 'function' && typeof UI !== 'undefined' && !!window.GX && !!GX.app; };
  function begin(o) { UI.fast = true; window.ANIM = false; UI.mode = 'quick'; var g = newGame(o); UI.fast = false; return g; }
  var wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  var me = function () { return G.seats[0]; };
  GXS.boardOpen = function () { if (!booted()) return; UI.mode = 'quick'; newGame({ np: 2, humans: 1, ai: 'normal' }); };
  GXS.add({
    id: 'mf-board', name: 'Your turn: the pockets', ask: 'Can you see pockets, valley and cards?', seed: 5, when: booted,
    setup: function () { begin({ np: 2, humans: 1, ai: 'normal', seed: 5 }); return wait(300); },
    checks: [
      { kind: 'visible', sel: '#central .pocket[data-pocket="0"]', name: 'pocket 1' },
      { kind: 'visible', sel: '#map .hx', name: 'valley hexes' },
      { kind: 'visible', sel: '#dockbody .acard', name: 'an animal card' },
      { kind: 'text', sel: '#line', re: /pocket/i, name: 'instruction line' },
      { kind: 'eq', name: 'your score', a: function () { return +document.querySelector('.pill[data-seat="0"] b').textContent; }, b: function () { return E.score(me()).total; } },
      { kind: 'tap', sel: '#central .pocket[data-pocket="1"]', name: 'take pocket 2', state: function () { return G.turn.hand.length; }, expect: function (b, a) { return b === 0 && a === 3 || 'hand ' + b + '->' + a; } }
    ],
    mut: [{ name: 'take gives 2 tokens', js: 'var _ap=E.apply;E.apply=function(m){var r=_ap(m);if(m.t==="take")G.turn.hand.pop();return r;}' }]
  });
  GXS.add({
    id: 'mf-place', name: 'Place a token', ask: 'Do hexes glow and does placing work?', seed: 7, when: booted,
    setup: function () { begin({ np: 2, humans: 1, ai: 'normal', seed: 7 }); act({ t: 'take', i: 0 }); return wait(300); },
    checks: [
      { kind: 'visible', sel: '#map .hx.glow', name: 'glowing hex' },
      { kind: 'play', name: 'place a token', snap: function () { return G.turn.hand.length; },
        steps: [{ sel: function () { return document.querySelector('#map .hx.glow'); } }],
        idle: function () { return true; }, verify: function (b, a) { return a === b - 1 || 'hand ' + b + '->' + a; } }
    ],
    mut: [{ name: 'placing does nothing', js: 'var _ap=E.apply;E.apply=function(m){if(m.t==="place")return true;return _ap(m);}' }]
  });
  GXS.add({
    id: 'mf-stack', name: 'Stack a mountain', ask: 'Can grey go on grey, not on water?', seed: 8, when: booted,
    setup: function () { begin({ np: 2, humans: 1, ai: 'normal', seed: 8 }); var s = me(); s.board['2,2'] = ['mount']; s.board['2,1'] = ['water']; G.bag.mount--; G.bag.water--; G.central[0].forEach(function (c) { G.bag[c]++; }); G.central[0] = ['mount', 'mount', 'mount']; G.bag.mount -= 3; act({ t: 'take', i: 0 }); return wait(300); },
    checks: [
      { kind: 'fn', name: 'water hex does not glow', fn: function () { return !document.querySelector('#map .hx.glow[data-k="2,1"]') || 'water glows'; } },
      { kind: 'play', name: 'stack grey', snap: function () { return (me().board['2,2'] || []).length; },
        steps: [{ sel: '#map .hx.glow[data-k="2,2"]' }], idle: function () { return true; }, verify: function (b, a) { return a === 2 || 'height ' + b + '->' + a; } }
    ],
    mut: [{ name: 'mountains cannot stack', js: 'var _ap=E.apply;E.apply=function(m){if(m.t==="place"&&(G.seats[G.cur].board[m.k]||[]).length)return false;return _ap(m);}' }]
  });
  GXS.add({
    id: 'mf-animal', name: 'Settle an animal', ask: 'Does the duck move in and score?', seed: 9, when: booted,
    setup: function () {
      begin({ np: 2, humans: 1, ai: 'normal', seed: 9 }); var s = me();
      s.board['2,2'] = ['leaf']; s.board['1,1'] = ['water']; G.bag.leaf--; G.bag.water--; s.cards = [{ id: 5, left: 5 }];
      var i = G.row.indexOf(5); if (i >= 0) G.row.splice(i, 1, G.deck.shift()); else G.deck.splice(G.deck.indexOf(5), 1);
      UI.tab = 'mine'; render(); return wait(300);
    },
    checks: [
      { kind: 'visible', sel: '.acard.ready', name: 'home ready badge' },
      { kind: 'play', name: 'settle the duck', snap: function () { return E.score(me()).animals; },
        steps: [{ sel: '.acard[data-ci="0"]' }, { sel: function () { return document.querySelector('#map .hx.glow'); } }], idle: function () { return true; },
        verify: function (b, a) { return a === b + 2 || 'animals ' + b + '->' + a; } }
    ],
    mut: [{ name: 'track scores wrong', js: 'MF.CARDS[4].pts=[1,4,6,10,15]' }]
  });
  GXS.add({
    id: 'mf-zoom', name: 'Read an animal card', ask: 'Is the big card clear?', seed: 10, when: booted,
    setup: function () { begin({ np: 2, humans: 1, ai: 'normal', seed: 10 }); return wait(300); },
    checks: [
      { kind: 'tap', sel: '.acard[data-row="0"]', name: 'open the card', state: function () { return GX.open; }, expect: function (b, a) { return a === 'bigd' || 'open ' + a; } },
      { kind: 'visible', sel: '#takeB', name: 'Invite button' }
    ]
  });
  GXS.add({
    id: 'mf-rival', name: 'Rival plays a turn', ask: 'Does the rival play and pass back?', seed: 12, when: booted,
    setup: function () { begin({ np: 2, humans: 1, ai: 'normal', seed: 12 }); act({ t: 'take', i: 0 }); while (G.turn.hand.length) { var m = E.moves().find(function (x) { return x.t === 'place'; }); act(m); } return wait(200); },
    checks: [
      { kind: 'play', name: 'end turn', snap: function () { return G.seats[1].turns; }, steps: [{ sel: '#endB' }], idle: function () { return G.cur === 0 && !UI.busy; },
        verify: function (b, a) { return a === b + 1 || 'rival turns ' + b + '->' + a; } }
    ]
  });
})();
