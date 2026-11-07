// Perch & Plume scenarios (shell/gx-scenario.js): ?scn=<id> builds ONE state directly, real taps act, verify() checks the engine.
(function () {
  if (!window.GXS) return;
  var booted = function () { return typeof G !== 'undefined' && typeof startGame === 'function' && typeof PP !== 'undefined' && typeof UI !== 'undefined'; };
  function begin(seed, prep) {
    UI.fast = true;
    startGame({ seats: [{ name: 'You', kind: 'human', face: 'you' }, { name: 'Fern', kind: 'ai', lvl: 'normal', face: 'pip' }], mode: 'vs', seed: seed,
      prep: function (Gx) { PP.performMove(Gx, PPAI.setup(Gx, 0), 0); PP.performMove(Gx, PPAI.setup(Gx, 1), 1); Gx.cur = 0; Gx.first = 0; Gx.fx = []; if (prep) prep(Gx); } });
  }
  function take(Gx, id) { [Gx.deck, Gx.disc].forEach(function (a) { var k = a.indexOf(id); if (k >= 0) a.splice(k, 1); }); var t = Gx.tray.indexOf(id); if (t >= 0) Gx.tray[t] = Gx.deck.shift(); Gx.pl.forEach(function (p) { var k = p.hand.indexOf(id); if (k >= 0) p.hand.splice(k, 1); }); }
  var settled = function () { return !UI.busy && G && (G.phase === 'over' || PP.sideToAct(G) === 0); };
  GXS.boardOpen = function () { if (!booted()) return; begin(5); };
  GXS.add({
    id: 'pp-board', name: 'Board: rows, feeder, hand', ask: 'Can you see rows, feeder and hand?', seed: 5, when: booted,
    setup: function () { begin(5); return GXS.wait(function () { return document.querySelector('.ract'); }); },
    checks: [
      { kind: 'visible', sel: '.ract[data-h="0"]', name: 'forest action' }, { kind: 'visible', sel: '.ract[data-h="2"]', name: 'wetland action' },
      { kind: 'visible', sel: '#feeder .die', name: 'a die' }, { kind: 'visible', sel: '#tray .bc', name: 'a tray bird' }, { kind: 'visible', sel: '#hand .bc', name: 'a bird in hand' },
      { kind: 'eq', name: 'hand size', a: function () { return document.querySelectorAll('#hand .bc').length; }, b: function () { return G.pl[0].hand.length; } },
      { kind: 'fn', name: 'eight actions in round 1', fn: function () { return G.pl[0].cubes === 8 || 'cubes ' + G.pl[0].cubes; } }
    ]
  });
  // the centrepiece: a full forest chains its brown powers right to left (cache, draw, lay ...)
  GXS.add({
    id: 'pp-chain', name: 'Forest chain: powers fire', ask: 'Do the forest birds fire one by one?', seed: 8, when: booted,
    setup: function () {
      begin(8, function (Gx) {
        var me = Gx.pl[0], ids = PP.DATA.birds.filter(function (b) { return b.h.indexOf('F') >= 0 && (b.pw === 'cacheS' || b.pw === 'laySelf'); }).slice(0, 4).map(function (b) { return b.id; });
        ids.forEach(function (id) { take(Gx, id); }); me.board[0] = ids.map(function (id) { return { id: id, eggs: 0, cache: 0, tuck: 0 }; });
        Gx.feeder = ['seed', 'fish', 'berry', 'grub', 'rodent'];
      });
      return GXS.wait(function () { return document.querySelector('.ract.glow'); });
    },
    mut: [{ name: 'browns never fire', js: 'var _o=PP.performMove;PP.performMove=function(G2,m,s){if(m.t==="act"){G2.pl[s].board[m.a==="food"?0:m.a==="eggs"?1:2]=G2.pl[s].board[m.a==="food"?0:m.a==="eggs"?1:2].map(function(x){return {id:PP.DATA.birds.find(function(b){return !b.pw&&b.h.indexOf("F")>=0}).id,eggs:x.eggs,cache:x.cache,tuck:x.tuck}})}return _o.apply(this,arguments)}' }],
    checks: [{ kind: 'play', name: 'forest action fires every bird', snap: function () { return { gain: PP.birds(G.pl[0]).reduce(function (a, x) { return a + x.s.eggs + x.s.cache; }, 0), cubes: G.pl[0].cubes }; },
      steps: [{ sel: '.ract[data-h="0"]' }, { sel: '.die.glow', until: function () { return !G.q || G.q.h !== 'die'; }, max: 4, skip: function () { return !G.q || G.q.h !== 'die'; } }, { sel: '#acts [data-a="mv"]', skip: function () { return UI.gsDie == null; } }, { sel: '.die.glow', until: function () { return !G.q || G.q.h !== 'die'; }, max: 4, skip: function () { return !G.q || G.q.h !== 'die'; } }],
      idle: settled, verify: function (b, a) { return a.gain - b.gain >= 4 && a.cubes === b.cubes - 1 || 'gain ' + (a.gain - b.gain) + ' cubes ' + b.cubes + '->' + a.cubes; } }]
  });
  GXS.add({
    id: 'pp-play', name: 'Play a bird from hand', ask: 'Tap a bird, a space, then Play.', seed: 11, when: booted,
    setup: function () {
      begin(11, function (Gx) { var me = Gx.pl[0], b = PP.DATA.birds.find(function (x) { return x.h.indexOf('F') >= 0 && x.c.length === 1 && x.c[0] === 'seed'; }); take(Gx, b.id); me.hand.unshift(b.id); me.food = { grub: 0, seed: 1, fish: 0, berry: 0, rodent: 0 }; });
      return GXS.wait(function () { return document.querySelector('#hand .bc.glow'); });
    },
    mut: [{ name: 'food not paid', js: 'var _p=PP.performMove;PP.performMove=function(G2,m,s){var f=JSON.stringify(G2.pl[s].food),r=_p.apply(this,arguments);if(m.t==="play")G2.pl[s].food=JSON.parse(f);return r}' }],
    checks: [{ kind: 'play', name: 'bird moves to the forest and food is paid', snap: function () { return { hand: G.pl[0].hand.length, forest: G.pl[0].board[0].length, food: PP.foodN(G.pl[0]) }; },
      steps: [{ sel: '#hand .bc.glow' }, { sel: '.slot.next.glow' }, { sel: '#acts [data-a="playgo"]' }],
      idle: settled, verify: function (b, a) { return (a.hand === b.hand - 1 && a.forest === b.forest + 1 && a.food === b.food - 1) || JSON.stringify([b, a]); } }]
  });
  GXS.add({
    id: 'pp-eggs', name: 'Lay eggs in the grassland', ask: 'Do eggs appear on your birds?', seed: 13, when: booted,
    setup: function () {
      begin(13, function (Gx) { var me = Gx.pl[0], ids = PP.DATA.birds.filter(function (b) { return b.h.indexOf('G') >= 0 && !b.pw && b.e >= 3; }).slice(0, 2).map(function (b) { return b.id; }); ids.forEach(function (id) { take(Gx, id); }); me.board[1] = ids.map(function (id) { return { id: id, eggs: 0, cache: 0, tuck: 0 }; }); });
      return GXS.wait(function () { return document.querySelector('.ract.glow'); });
    },
    mut: [{ name: 'eggs vanish', js: 'var _q=PP.performMove;PP.performMove=function(G2,m,s){var r=_q.apply(this,arguments);if(m.t==="egg")PP.birds(G2.pl[s]).forEach(function(x){x.s.eggs=0});return r}' }],
    checks: [{ kind: 'play', name: 'three eggs laid', snap: function () { return { eggs: PP.eggsOn(G.pl[0]) }; },
      steps: [{ sel: '.ract[data-h="1"]' }, { sel: '#acts [data-a="mv"]', skip: function () { return !G.q || G.q.h !== 'bonus'; } }, { sel: '.bc[data-a="bird"].glow', until: function () { return !G.q || G.q.h !== 'egg'; }, max: 5 }],
      idle: settled, verify: function (b, a) { return a.eggs - b.eggs === 3 || 'eggs +' + (a.eggs - b.eggs); } }]
  });
  GXS.add({
    id: 'pp-result', name: 'End of the year: results', ask: 'Can you read the final scores?', seed: 3, when: booted,
    setup: function () {
      begin(3); stopTimers(); var guard = 0;
      while (G.phase !== 'over' && guard++ < 3000) { var s = PP.sideToAct(G); PP.performMove(G, PPAI.choose(G, s, 'easy'), s); }
      UI.busy = false; render(); gameOver();
      return GXS.wait(function () { return !document.getElementById('result').hidden; });
    },
    checks: [{ kind: 'visible', sel: '#again', name: 'Play again' }, { kind: 'visible', sel: '.stand', name: 'score table' },
      { kind: 'eq', name: 'your total', a: function () { return GXS.num('.stand [data-engine="G.final.0.total"]'); }, b: function () { return G.final[0].total; } }]
  });
  GXS.add({
    id: 'pp-story', name: 'Story map opens', ask: 'Does the story map show 3 acts?', seed: 2, when: booted,
    setup: function () { showTitle(); openStory(); return GXS.wait(function () { return document.querySelector('.gxc'); }); },
    checks: [{ kind: 'visible', sel: '.gxc', name: 'story map' }, { kind: 'fn', name: 'ten chapters', fn: function () { return window.CAMPAIGN.chapters.length === 10 || 'n=' + window.CAMPAIGN.chapters.length; } }]
  });
})();
