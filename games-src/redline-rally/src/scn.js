// Redline Rally scenarios (shell/gx-scenario.js): ?scn=<id> builds ONE state directly.
(function () {
  if (!window.GXS) return;
  var booted = function () { return typeof G !== 'undefined' && typeof startGame === 'function' && typeof UI !== 'undefined'; };
  function begin(o) { UI.fast = true; window.ANIM = false; startGame(o); }
  GXS.boardOpen = function () { if (!booted()) return; begin({ track: 'sunline', laps: 2, opp: 4, hum: 1, diff: 'normal' }); };
  GXS.add({
    id: 'rr-board', name: 'Race: pick gear and cards', ask: 'Can you see your hand and Go?', seed: 5, when: booted,
    setup: function () { begin({ track: 'sunline', laps: 2, opp: 4, hum: 1, diff: 'normal', seed: 5 }); return new Promise(function (r) { setTimeout(r, 500); }); },
    checks: [
      { kind: 'visible', sel: '#goB', name: 'Go button' },
      { kind: 'visible', sel: '#gears', name: 'gear dial' },
      { kind: 'visible', sel: '#hand .cd', name: 'a card in hand' },
      { kind: 'visible', sel: '#cv', name: 'track' },
      { kind: 'fn', name: 'seven cards in hand', fn: function () { return G.cars[0].hand.length === 7 || 'hand ' + G.cars[0].hand.length; } }
    ]
  });
  GXS.add({
    id: 'rr-corner', name: 'Corner: brake or push', ask: 'Does the corner warning show?', seed: 9, when: booted,
    setup: function () {
      begin({ track: 'hairpin', laps: 1, opp: 3, hum: 1, diff: 'normal', seed: 9 });
      var c = G.cars[0]; c.pos = 7; c.hand = ['4', '4', '3', '4', '2', '1', '3']; c.gear = 2; UI.gear = 3; UI.sel = [0, 1, 3]; drawPlan();
      return new Promise(function (r) { setTimeout(r, 400); });
    },
    checks: [
      { kind: 'visible', sel: '#msg', name: 'status line' },
      { kind: 'fn', name: 'warns about the corner', fn: function () { return /burn|spin/i.test(document.getElementById('msg').textContent) || 'msg: ' + document.getElementById('msg').textContent; } },
      { kind: 'visible', sel: '#goB', name: 'Go button' }
    ]
  });
  GXS.add({
    id: 'rr-result', name: 'Podium: results', ask: 'Can you read the standings?', seed: 3, when: booted,
    setup: function () { begin({ track: 'sunline', laps: 1, opp: 3, hum: 1, diff: 'normal', seed: 3 }); UI.forceEnd(); G.over = true; G.phase = 'over'; G.rank = rankList(G); showResult(); return new Promise(function (r) { setTimeout(r, 300); }); },
    checks: [
      { kind: 'visible', sel: '#again', name: 'Race again' },
      { kind: 'visible', sel: '.stand', name: 'standings' }
    ]
  });
})();
