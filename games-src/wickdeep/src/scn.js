// Wickdeep scenarios (shell/gx-scenario.js): ?scn=<id> builds ONE state directly. Registered before the game scripts; setup() runs after boot.
(function () {
  if (!window.GXS) return;
  var booted = function () { return typeof WDUI !== 'undefined' && typeof WD !== 'undefined'; };
  var calm = function () { return new Promise(function (r) { setTimeout(r, 500); }); };
  var idle = function () { return !UI.busy; };
  function fresh(id, party, seed) { UI.fast = true; localStorage.removeItem('wickdeep-game-v1'); CAMP = WDC.newCamp((party || ['warden', 'ringer']), 0); WDUI.startScenario(id, { seed: seed || 5 }); }
  // play the selection phase for every hero with the helper, so a hero turn is waiting
  function toTurn() { var n = 0; while (G.ask && G.ask.h === 'sel' && n++ < 8) { WD.apply(G, WDAI.choose(G)); } G.ev = []; UI.view = null; WDUI.refresh(); }
  GXS.boardOpen = function () { if (!booted()) return; fresh(1); };
  GXS.add({ id: 'wd-board', name: 'Board: pick two cards', ask: 'Can you pick 2 cards and go?', seed: 5, when: booted,
    setup: function () { fresh(1); return calm(); },
    checks: [{ kind: 'visible', sel: '#cv', name: 'the hex map' }, { kind: 'visible', sel: '#tray .cd', name: 'a card in hand' }, { kind: 'visible', sel: '#goalchip', name: 'goal chip' },
      { kind: 'fn', name: 'ten cards in hand', fn: function () { return G.figs[0].hand.length === 10 || 'hand ' + G.figs[0].hand.length; } },
      { kind: 'play', name: 'pick 2 cards and Ready', snap: function () { return { r: G.phase }; },
        steps: [{ sel: '#tray .cd:not(.sel)' }, { sel: '#tray .cd:not(.sel)' }, { sel: '#readybtn' }, { sel: '#tray .cd:not(.sel)' }, { sel: '#tray .cd:not(.sel)' }, { sel: '#readybtn' }], idle: idle,
        verify: function () { return G.phase === 'turns' || G.phase === 'over' || 'still ' + G.phase; } }],
    mut: [{ name: 'Ready does nothing', js: 'document.getElementById("readybtn") && (doMove = function(){})' }] });
  GXS.add({ id: 'wd-zoom', name: 'Zoom the map', ask: 'Do + and − zoom the map?', seed: 6, when: booted,
    setup: function () { fresh(1); return calm(); },
    checks: [{ kind: 'tap', sel: '#zin', name: 'zoom in', state: function () { return CAM.z; }, expect: function (b, a) { return a > b || 'zoom ' + b + ' -> ' + a; } }] });
  GXS.add({ id: 'wd-move', name: 'Your turn: move', ask: 'Can you play a half and move?', seed: 7, when: booted,
    setup: function () { fresh(1, null, 7); toTurn(); return calm(); },
    checks: [{ kind: 'play', name: 'play a move half, then walk', snap: function () { var f = WD.fig(G, G.ask.id); return { id: f.id, pos: f.pos }; },
      steps: [{ sel: function () { var hs = [].slice.call(document.querySelectorAll('#tray .half.can')); return hs.filter(function (h) { return /Move|Jump/.test(h.textContent); })[0] || hs[0]; } }, { sel: '#playbtn' },
        { sel: '#hot .glow', skip: function () { return !G.ask || G.ask.h !== 'move'; } }], idle: idle,
      verify: function (b) { var f = WD.fig(G, b.id); return !f || f.pos !== b.pos || G.ask.h !== 'move' || 'did not move'; } }],
    mut: [{ name: 'moves ignored', js: 'WD.apply = function(G){ return G; }' }] });
  GXS.add({ id: 'wd-attack', name: 'Attack a monster', ask: 'Does the hit show a card flip?', seed: 8, when: booted,
    setup: function () {
      fresh(1, null, 8); toTurn(); var f = WD.fig(G, G.ask.id);
      var adj = WD.nb(f.pos).filter(function (k) { return G.hex[k] && G.hex[k].t === 'f' && !WD.figAt(G, k); })[0];
      G.figs.push({ id: 'mx', kind: 'mon', team: 'm', type: 'rat', elite: false, pos: adj, hp: 9, max: 9, cond: {}, rnd: {}, num: 1 });
      G.md.rat = G.md.rat || { fam: 'swarm', draw: [0, 1, 2, 3, 4, 5, 6, 7], disc: [], cur: null, resh: false };
      WDUI.refresh(); return calm();
    },
    checks: [{ kind: 'play', name: 'Hit 2 a monster', snap: function () { return { hp: (WD.fig(G, 'mx') || { hp: 0 }).hp, n: G.mamd.draw.length + G.mamd.disc.length }; },
      steps: [{ sel: function () { return document.querySelector('#tray .basic button.can[data-b="top"]'); } }, { sel: '#playbtn' }, { sel: '#hot .glow.atk', skip: function () { return !G.ask || G.ask.h !== 'target'; } }], idle: idle,
      verify: function (b) { var m = WD.fig(G, 'mx'), d = (G.figs[0].amd.disc.length + G.figs[1].amd.disc.length); return d > 0 || (m ? m.hp < b.hp : true) || 'no attack card drawn'; } }],
    mut: [{ name: 'attack skipped', js: 'var _a=WD.apply; WD.apply=function(G,m){ if(m.t==="tgt") m={t:"skip"}; return _a(G,m); }' }] });
  GXS.add({ id: 'wd-camp', name: 'Campaign map', ask: 'Can you see the scenario map?', seed: 9, when: booted,
    setup: function () { CAMP = WDC.newCamp(['warden', 'ringer'], 0); CAMP.done[1] = true; CAMP.unlocked = [1, 2]; WDUI.showCamp(); return calm(); },
    checks: [{ kind: 'visible', sel: '.node.open', name: 'an open scenario' }, { kind: 'visible', sel: '.pm', name: 'a hero' },
      { kind: 'tap', sel: '.node.open', name: 'open the briefing', state: function () { return !!document.getElementById('enterbtn'); }, expect: function (b, a) { return a || 'no briefing'; } }] });
  GXS.add({ id: 'wd-result', name: 'Result screen', ask: 'Can you read the rewards?', seed: 3, when: booted,
    setup: function () { fresh(1, null, 3); var n = 0; while (!G.done && n++ < 4000) { WD.apply(G, WDAI.choose(G)); G.ev = []; } UI.view = null; showResult(); return calm(); },
    checks: [{ kind: 'visible', sel: '#rs .rsrow', name: 'hero rewards' }, { kind: 'visible', sel: '#rsnext', name: 'Continue' }] });
})();
