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
      UI.hints = true; var c = G.cars[0]; c.pos = 7; c.hand = ['4', '4', '3', '4', '2', '1', '3']; c.gear = 2; UI.gear = 3; UI.sel = [0, 1, 3]; drawPlan();
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
  GXS.add({
    id: 'rr-play', name: 'Play: clean screen', ask: 'Only board, hand, tracker, one score line and the top bar?', seed: 5, when: booted,
    setup: function () { UI.hints = false; begin({ track: 'sunline', laps: 2, opp: 4, hum: 1, diff: 'normal', seed: 5 }); return new Promise(function (r) { setTimeout(r, 400); }); },
    checks: [
      { kind: 'visible', sel: '#scoreL', name: 'score line' },
      { kind: 'fn', name: 'no hint clutter', fn: function () { return (!document.querySelector('#sugB') && !document.querySelector('#tray') && !document.querySelector('#coach') && document.getElementById('bulbbtn').hidden) || 'hint UI visible in Play'; } }
    ]
  });
  GXS.add({
    id: 'rr-lights', name: 'Start lights', ask: 'Do the start lights show?', seed: 5, when: booted,
    setup: function () { begin({ track: 'sunline', laps: 2, opp: 4, hum: 1, diff: 'normal', seed: 5 }); RACE.lights = { t0: 0, freeze: 1600 }; return new Promise(function (r) { setTimeout(r, 300); }); },
    checks: [{ kind: 'fn', name: 'lights on', fn: function () { return !!RACE.lights || 'no lights'; } }, { kind: 'visible', sel: '#trk', name: 'turn tracker' }]
  });
  GXS.add({
    id: 'rr-preview', name: 'Preview before Go', ask: 'Do you see where you land and what the corner costs?', seed: 9, when: booted,
    setup: function () {
      begin({ track: 'hairpin', laps: 1, opp: 3, hum: 1, diff: 'normal', seed: 9 }); G.round = 4; RACE.rate = 'Good: 7 spaces for 0 heat.'; RACE.rateK = 'good'; RACE.rateShow = 1;
      UI.hints = true; var c = G.cars[0]; c.pos = 7; c.hand = ['4', '4', '3', '4', '2', '1', '3']; c.gear = 2; c.eng = 4; G.cars[1].pos = 15; UI.gear = 3; UI.sel = [0, 2, 4]; UI.touchedGear = 1; drawPlan();
      return new Promise(function (r) { setTimeout(r, 400); });
    },
    checks: [
      { kind: 'fn', name: 'preview set', fn: function () { return !!RACE.prev || 'no preview'; } },
      { kind: 'fn', name: 'phase Play lit', fn: function () { var o = document.querySelector('#trk .phs li.on'); return (o && o.textContent === 'Play') || 'phase ' + (o && o.textContent); } },
      { kind: 'fn', name: 'round rating', fn: function () { return /Good/.test(document.getElementById('banner').textContent) || 'banner ' + document.getElementById('banner').textContent; } }
    ]
  });
  GXS.add({
    id: 'rr-spin', name: 'Spin out', ask: 'Is the spin-out loud and clear?', seed: 11, when: booted,
    setup: function () {
      begin({ track: 'hairpin', laps: 1, opp: 3, hum: 1, diff: 'normal', seed: 11 }); var c = G.cars[0], k = T(G).list[1]; c.pos = k.idx - 1; c.eng = 0; c.gear = 1; UI.vis[0].p = c.pos; UI.focus = 0;
      RACE.spdT = RACE.spd = 11; raceSpin({ car: 0, to: c.pos }); RACE.flashHold = 1; UI.pops.push({ txt: 'SPIN: 11 in a ' + climit(G, k.limit), p: c.pos, t: performance.now(), col: '#ff4d3a', stem: 'fx-spinout-smoke', hold: 1 });
      drawPlan(); hud(); setMsg('You spin out: not enough heat.', 'warn'); setPhase('react'); snapCam(); var sb = function () { banner('You spin out: lose all heat, back to gear 1', 0, 'turn'); }; sb(); setTimeout(sb, 900); setTimeout(sb, 2400);
      return new Promise(function (r) { setTimeout(r, 400); });
    },
    checks: [{ kind: 'fn', name: 'skid marks', fn: function () { return RACE.skids.length > 0 || 'no skids'; } }]
  });
})();
