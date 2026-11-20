// Gloamwar scenarios (shell/gx-scenario.js): ?scn=<id> builds ONE moment directly.
(function () {
  if (!window.GXS) return;
  var booted = function () { return typeof G !== 'undefined' && typeof startGame === 'function' && typeof MV !== 'undefined'; };
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function begin(o) { UI.fast = true; AIDELAY = 20; window.ANIM = false; startGame(o); clearTimeout(UI.timer); }
  function toAct(side) {   // run the computer until the human has a free die
    var k = 0; while (G && !G.win && k++ < 400) { if (G.phase === 'act' && sideToAct(G) === side && !G.pend) break; var m = AI.move(G, 'normal'); performMove(G, m); G.ev = []; }
    UI.hold = false; UI.die = null; render();
  }
  var DICE = { D: ['C', 'M', 'X', 'E'], G: ['C', 'A', 'M', 'X', 'E', 'A', 'M'] };
  GXS.boardOpen = function () { if (!booted()) return; begin({ side: 'D', seed: 11, dice: DICE }); toAct('D'); };
  GXS.add({ id: 'gw-board', name: 'Map, dice and dock', ask: 'Can you see the map and your dice?', seed: 5, when: booted,
    setup: function () { begin({ side: 'D', seed: 5, dice: DICE }); toAct('D'); return wait(400); },
    checks: [{ kind: 'visible', sel: '#mydice .die', name: 'a die' }, { kind: 'visible', sel: '#company', name: 'the Company' }, { kind: 'visible', sel: '#msg', name: 'one line' },
      { kind: 'fn', name: '104 regions', fn: function () { return document.querySelectorAll('.rg').length === 104 || 'regions ' + document.querySelectorAll('.rg').length; } },
      { kind: 'fn', name: 'armies drawn', fn: function () { return document.querySelectorAll('#dyn .tok').length > 20 || 'tokens ' + document.querySelectorAll('#dyn .tok').length; } }] });
  GXS.add({ id: 'gw-company', name: 'Move the Company', ask: 'Tap the Character die, then Move Company', seed: 8, when: booted,
    setup: function () { begin({ side: 'D', seed: 8, dice: DICE }); toAct('D'); return wait(300); },
    checks: [{ kind: 'play', name: 'company moves', snap: function () { return { p: G.F.prog, t: G.F.tried }; }, steps: [{ sel: '#mydice .die[data-f="C"]' }, { sel: '#acts .act[data-key="cmove"]' }], idle: function () { return true; },
      verify: function (b, a) { return a.t && !b.t || 'company did not move ' + JSON.stringify(a); } }],
    mut: [{ name: 'dead die', js: 'renderDice = function(){}' }] });
  GXS.add({ id: 'gw-muster', name: 'Stir a nation', ask: 'Tap the Muster die, then stir a nation', seed: 9, when: booted,
    setup: function () { begin({ side: 'D', seed: 9, dice: DICE }); toAct('D'); return wait(300); },
    checks: [{ kind: 'play', name: 'nation steps', snap: function () { return NAT_ORDER.reduce(function (t, n) { return t + G.pol[n].s; }, 0); }, steps: [{ sel: '#mydice .die[data-f="M"]' }, { sel: '#acts .act[data-key^="dip-"]' }], idle: function () { return true; },
      verify: function (b, a) { return a === b - 1 || 'political sum ' + b + ' -> ' + a; } }] });
  GXS.add({ id: 'gw-cards', name: 'Card drawer', ask: 'Do your cards read clearly?', seed: 4, when: booted,
    setup: function () { begin({ side: 'D', seed: 4, dice: DICE }); toAct('D'); return wait(300); },
    checks: [{ kind: 'tap', sel: '#tCards', name: 'cards open', state: function () { return $('#sheet').classList.contains('on') && document.querySelectorAll('#sheet .card').length; }, expect: function (b, a) { return a >= 2 || 'cards shown ' + a; } }] });
  GXS.add({ id: 'gw-nations', name: 'Political track', ask: 'Can you see who is at war?', seed: 4, when: booted,
    setup: function () { begin({ side: 'D', seed: 4, dice: DICE }); toAct('D'); return wait(300); },
    checks: [{ kind: 'tap', sel: '#tNat', name: 'nations open', state: function () { return document.querySelectorAll('#sheet .ntok').length; }, expect: function (b, a) { return a === 8 || 'tokens ' + a; } }] });
  GXS.add({ id: 'gw-battle', name: 'A battle', ask: 'Fight the battle: do the dice show?', seed: 3, when: booted,
    setup: function () {
      begin({ side: 'D', seed: 3, dice: DICE }); toAct('D');
      G.A.ottercrag = { pt: [2, 0, 0] }; G.A.ferrystone = { hl: [3, 1, 1] }; G.pol.hl.s = 0; G.pol.hl.a = true;
      startBattle(G, 'D', 'ferrystone', 'ottercrag', null, {}); var k = 0; while (G.pend && G.pend.h === 'battle' && sideToAct(G) !== 'D' && k++ < 10) performMove(G, AI.move(G, 'normal'));
      UI.hold = false; render(); return wait(300); },
    checks: [{ kind: 'visible', sel: '#battle.on', name: 'battle overlay' },
      { kind: 'play', name: 'a round is fought', snap: function () { return G.stats.battles; }, steps: [{ sel: '#battle .btn' }], idle: function () { return true; }, verify: function (b, a) { var B = G.pend && G.pend.d; return !G.pend || G.pend.h !== 'battle' || (B && B.round >= 1) || 'no round'; } }] });
  GXS.add({ id: 'gw-rules', name: 'Rules drawer', ask: 'Do the rules read clearly?', seed: 4, when: booted,
    setup: function () { begin({ side: 'D', seed: 4, dice: DICE }); toAct('D'); return wait(300); },
    checks: [{ kind: 'tap', sel: '#helpB', name: 'rules open', state: function () { return !!document.querySelector('.gxh-rules,.gxh-sheet,[class*=gxh-r]'); }, expect: function (b, a) { return a || 'no rules'; } }] });
  GXS.add({ id: 'gw-gloam', name: 'Play the Gloam', ask: 'As the Gloam, can you send hunt dice?', seed: 6, when: booted,
    setup: function () { begin({ side: 'G', seed: 6 }); var k = 0; while (G.phase !== 'hunt' && k++ < 20) performMove(G, AI.move(G, 'normal')); UI.hold = false; render(); return wait(300); },
    checks: [{ kind: 'play', name: 'hunt dice sent', snap: function () { return G.phase; }, steps: [{ sel: '#acts .act[data-key^="hunt"]' }], idle: function () { return true; }, verify: function (b, a) { return b === 'hunt' && a !== 'hunt' || 'phase ' + a; } }] });
  GXS.add({ id: 'gw-result', name: 'Result screen', ask: 'Can you play again?', seed: 2, when: booted,
    setup: function () { begin({ side: 'D', seed: 2 }); G.win = { side: 'D', why: 'kiln' }; G.phase = 'over'; UI.ended = false; showResult(); return wait(300); },
    checks: [{ kind: 'visible', sel: '#resRow .btn', name: 'Play again' }, { kind: 'tap', sel: '#resRow .btn', name: 'new game', state: function () { return !!G && !G.win; }, expect: function (b, a) { return a === true || 'no new game'; } }] });
})();
