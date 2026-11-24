// Ochre Horizon: scenario lessons on the shared engine (shell/gx-scenario-tutor.js, docs shell/GXST.md).
// The ten scenario positions live in src/charters.js (OHC.SC): each builds a small real position on the real engine, one goal, a fail rule.
// This file wraps them as GXST lessons: the player makes every move with the normal controls; the card only shows the goal.
// Rule -> lesson table: tiles=place a greenery, stock=stock vs production, global=raise a gauge + bonus dot, route=card vs standard
// project, adj=placement bonus, req=card requirements, mile=milestones, gens=generations/production, rival=racing the rival, grad=a full mini game.
// Entry: Lessons button, the ? button / Learn to play, ?lessons=1 (auto-opens the picker), ?lesson=<id>. The last lesson ends in a real game.
(function () {
  if (!window.GXST || !window.OHC) return;
  var Q2 = new URLSearchParams(location.search);
  var vis = function (e) { if (!e) return false; var r = e.getBoundingClientRect(); return r.width > 2 && r.height > 2 && e.offsetParent !== null; };
  // the deepest control of the chain that is on screen right now: the next thing to tap
  var first = function (sels) { for (var i = 0; i < sels.length; i++) { var a = document.querySelectorAll(sels[i]); for (var j = 0; j < a.length; j++) if (vis(a[j])) return a[j]; } return null; };
  var placing = function () { return !!(OH.G.pending && OH.G.pending.h === 'place'); };
  var placeStep = function () { return first(['#confirmb', '.hex.tgt']); };
  var played = function (id) { return OH.G.pl[0].played.indexOf(id) >= 0; };
  var cardStep = function (id) { return first(['#mPlay', '#shB [data-card="' + id + '"]', '#bCards']); };
  var stdStep = function (k) { return first(['#shB [data-std="' + k + '"]', '#bProj']); };
  var res = function (r) { return first(['#res .rc[data-r="' + r + '"]']); };
  var T = {
    tiles: function () { return placing() ? placeStep() : res('plant'); },
    stock: function () { return cardStep('p016'); },
    global: function () { return played('p031') ? res('heat') : cardStep('p031'); },
    route: function () { return played('p039') ? stdStep('asteroid') : cardStep('p039'); },
    adj: function () { return placing() ? first(['#confirmb', '.tgt[data-s="' + OH.G.scLand + '"]', '.hex.tgt']) : stdStep('city'); },
    req: function () { return placing() ? placeStep() : OH.G.oxy < 2 ? res('plant') : cardStep('p019'); },
    mile: function () { return OH.G.pl[0].prod.energy < 1 ? stdStep('power') : first(['#shB [data-mile="quartermaster"]', '#tMile']); },
    gens: function () { return placing() ? placeStep() : !played('p020') ? cardStep('p020') : OH.G.gen >= 3 ? res('plant') : first(['#bPass']); },
    rival: function () { return placing() ? placeStep() : first(['#hintbtn']); },
    grad: function () { return first(['#hintbtn']); }
  };
  var cur = function () { return window.SCN && SCN.S; };
  var lessons = OHC.SC.map(function (c, i) {
    var s = {
      id: c.id, title: c.title, rule: c.learned, goal: c.goal, par: c.par.acts || 99, debrief: c.why,
      setup: function () { scStart(i); try { twClose(); } catch (e) { } return new Promise(function (r) { setTimeout(r, 450); }); },
      success: function () { var S = cur(); if (!S) return false; OHC.sCheck(S); return !!(S.ended && S.result && S.result.ok); },
      fail: function () { var S = cur(); if (!S) return false; OHC.sCheck(S); return S.ended && S.result && !S.result.ok ? S.result.line : false; },
      moves: function () { var S = cur(); return S ? S.acts : 0; },
      hints: [c.hints[0], { say: c.hints[1], target: T[c.id] }]
    };
    return s;
  });
  var go = function () {
    if (!(window.UI && UI.ready !== false && window.OH && typeof scStart === 'function' && typeof startGame === 'function')) { setTimeout(go, 150); return; }
    GXST.init({ game: 'ochre', qParent: '#bw', scenarios: lessons, keepClear: ['#res', '#bPass', '#bCards', '#bProj', '.hex.tgt'],
      settled: function () { return !UI.busy; } });
    // Learn to play and the ? button open the lessons (the first visit starts lesson 1)
    var old = window.learnStart;
    window.learnStart = function () { try { hideStart(); } catch (e) { } var any = false, b = GXST.state().best; for (var k in b) any = true; if (any) GXST.picker(); else GXST.start(0); };
    // the last lesson is a real mini game; closing its win card (or opening the list after it) starts a real Easy game
    var done = false;
    addEventListener('gxst', function (e) {
      var d = e.detail || {};
      if (d.type === 'win' && d.id === 'grad') done = true;
      else if ((d.type === 'close' || d.type === 'picker') && done) { done = false; setTimeout(function () { try { GXST.close(); scStop(); startGame({ level: 'easy' }); } catch (er) { } }, 0); }
    });
    var id = Q2.get('lesson');
    if (id && lessons.some(function (l) { return l.id === id; })) GXST.start(id);
    else if (Q2.get('lessons')) GXST.picker();
  };
  setTimeout(go, 200);
})();
