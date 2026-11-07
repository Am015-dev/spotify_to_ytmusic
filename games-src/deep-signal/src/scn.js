// Deep Signal scenarios (shell/gx-scenario.js): ?scn=<id> builds ONE moment directly.
(function () {
  if (!window.GXS) return;
  var booted = function () { return typeof G !== 'undefined' && typeof startGame === 'function' && typeof UI !== 'undefined'; };
  function begin(o) { UI.fast = true; AIDELAY = 30; window.ANIM = false; o.noFlareOffer = true; startGame(o); }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function toPlay() { var g = 0; while (G.phase === 'draft' && g++ < 20) { var s = sideToAct(G); performMove(G, { t: 'take', i: AIX.draftPick(G, G.draftTurn) }, s); } UI.sigDone[0] = true; render(); }
  GXS.boardOpen = function () { if (!booted()) return; begin({ players: 4, mission: 2, seed: 11 }); };
  GXS.add({ id: 'ds-board', name: 'Dive: hand, crew, tasks', ask: 'Can you see your hand and crew?', seed: 5, when: booted,
    setup: function () { begin({ players: 4, mission: 4, seed: 5 }); toPlay(); return wait(500); },
    checks: [{ kind: 'visible', sel: '#hand .cd', name: 'a card in hand' }, { kind: 'visible', sel: '#seat1', name: 'crew panel' }, { kind: 'visible', sel: '#msg', name: 'one line' },
      { kind: 'fn', name: 'ten cards', fn: function () { return document.querySelectorAll('#hand .cd').length === G.hands[0].length || 'hand dom ' + document.querySelectorAll('#hand .cd').length; } }] });
  GXS.add({ id: 'ds-play', name: 'Play a glowing card', ask: 'Tap a glowing card: does it play?', seed: 8, when: booted,
    setup: function () { begin({ players: 4, mission: 1, seed: 8, deal: TUT_DEAL, taskCards: ['c7'] }); toPlay(); G.turn = G.lead = 0; render(); return wait(400); },
    checks: [{ kind: 'play', name: 'lead Coral 9', snap: function () { return { n: G.hands[0].length, t: G.trick.length + G.tricks.length }; }, steps: [{ sel: '#hand .cd.legal[data-c="c9"]' }], idle: function () { return G.tricks.length >= 1 && !UI.hold; },
      verify: function (b, a) { return a.n === b.n - 1 && G.tricks[0].cards[0].c === 'c9' || 'not played ' + JSON.stringify(a); } }],
    mut: [{ name: 'dead hand', js: 'onHandTap = function(){}' }] });
  GXS.add({ id: 'ds-zoom', name: 'Zoom a card', ask: 'Tap a dim card: does it show large?', seed: 6, when: booted,
    setup: function () { begin({ players: 4, mission: 2, seed: 6 }); toPlay(); return wait(400); },
    checks: [{ kind: 'tap', sel: '#seat1', name: 'crew panel opens', state: function () { return $('#zoom').classList.contains('on'); }, expect: function (b, a) { return a === true || 'zoom not open'; } }],
    mut: [{ name: 'no zoom', js: 'zoomSeat = function(){}' }] });
  GXS.add({ id: 'ds-help', name: 'Rules drawer', ask: 'Do the rules read clearly?', seed: 4, when: booted,
    setup: function () { begin({ players: 4, mission: 2, seed: 4 }); toPlay(); return wait(300); },
    checks: [{ kind: 'tap', sel: '#helpB', name: 'rules open', state: function () { return !!document.querySelector('.gxh-rules,.gxh-sheet,[class*=gxh-r]'); }, expect: function (b, a) { return a || 'no rules'; } }] });
  GXS.add({ id: 'ds-signal', name: 'Send a signal', ask: 'Signal, then tap a white card', seed: 9, when: booted,
    setup: function () { begin({ players: 4, mission: 2, seed: 9 }); toPlay(); clearTimeout(UI.timer); G.turn = G.lead = 0; render(); return wait(400); },
    checks: [{ kind: 'play', name: 'signal sent', snap: function () { return { u: G.commUsed[0] }; }, steps: [{ sel: '#sigB' }, { sel: '#hand .cd.sigok' }], idle: function () { return true; },
      verify: function (b, a) { return !b.u && a.u && !!G.comm[0] || 'no signal'; } }], mut: [{ name: 'signal ignored', js: 'commPos = function(){return null}' }] });
  GXS.add({ id: 'ds-stamp', name: 'Mission complete stamp', ask: 'Does the stamp show clearly?', seed: 3, when: booted,
    setup: function () { begin({ players: 4, mission: 1, seed: 8, deal: TUT_DEAL, taskCards: ['c7'] }); toPlay(); G.turn = G.lead = 0; UI.fast = false; apply({ t: 'play', c: 'c9' }, 0); return wait(4500); },
    checks: [{ kind: 'visible', sel: '#stamp.on', name: 'stamp' }, { kind: 'fn', name: 'engine says complete', fn: function () { return G.result && G.result.ok || JSON.stringify(G.result); } }] });
  GXS.add({ id: 'ds-result', name: 'Result screen', ask: 'Can you start the next mission?', seed: 2, when: booted,
    setup: function () { begin({ players: 4, mission: 1, seed: 8, deal: TUT_DEAL, taskCards: ['c7'] }); toPlay(); G.result = { ok: true, why: '' }; G.phase = 'over'; showResult(); return wait(300); },
    checks: [{ kind: 'visible', sel: '#again', name: 'Next mission' }, { kind: 'tap', sel: '#again', name: 'next starts', state: function () { return G.mission.n; }, expect: function (b, a) { return a === 2 || 'mission ' + a; } }] });
})();
