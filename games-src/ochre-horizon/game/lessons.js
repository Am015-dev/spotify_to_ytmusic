// Ochre Horizon: scenario lessons on the shared engine (shell/gx-scenario-tutor.js, docs shell/GXST.md).
// The positions live in src/charters.js (OHC.SC): each builds a small real position on the real engine, one goal, a fail rule.
// This file orders them into 4 short chapters, words every goal as "Your goal: ..." in the screen's own labels, and adds the
// Rules window (every rule in plain words, each linked to the lesson that teaches it). The last lesson flows into a real Easy game.
// Rule map (engine rule -> lesson; RULES below is the same list the player sees):
//   greenery from 8 plants, oxygen +1 rating .......... tiles   | stock vs production, steel/titanium pay ........ stock
//   sell cards for 1 credit ........................... sell    | production paid each round, energy -> heat ..... gens
//   8 heat -> +1 temperature, bonus steps ............. global  | oceans only on ocean spaces, +1 rating ......... ocean
//   placement bonus, 2 credits per adjacent ocean ..... adj     | city not next to a city, city +1 credit income . adj
//   card requirements ................................. req     | standard projects vs cards ...................... route
//   greenery 1 point, +1 per greenery by your city .... score   | milestones (8 credits, 5 points, first only) .... mile
//   awards (8/14/20, leader 5, tie pays both) ......... award   | card actions once per round ..................... act
//   2 actions per turn, pass, the rival races ......... rival   | game end, final greenery, scoring, TR ........... grad
//   research (buy cards for 3) ........................ grad (real game; listed in the Rules window)
// Entry: Lessons button, the ? button / Learn to play, ?lessons=1 (picker), ?lesson=<id>, ?rules=1 (Rules window).
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
  var nearCity = function () { var c = OH.G.scCity, A = c ? OH.MAP.spaces[c].adj : []; return first(['#confirmb'].concat(A.map(function (s) { return '.hex.tgt[data-s="' + s + '"]'; }))); };
  var T = {
    tiles: function () { return placing() ? placeStep() : res('plant'); },
    stock: function () { return cardStep('p016'); },
    sell: function () { return played('p039') ? null : OH.G.pl[0].mc >= 9 ? cardStep('p039') : first(['#mSellGo:not([disabled])', '#mb [data-sp="p020"]', '#shB [data-sell]', '#bProj']); },
    global: function () { return played('p031') ? res('heat') : cardStep('p031'); },
    gens: function () { return placing() ? placeStep() : !played('p020') ? cardStep('p020') : OH.G.gen >= 3 ? res('plant') : first(['#mPassY', '#bPass']); },
    ocean: function () { return placing() ? placeStep() : stdStep('aquifer'); },
    adj: function () { return placing() ? first(['#confirmb', '.tgt[data-s="' + OH.G.scLand + '"]', '.hex.tgt']) : stdStep('city'); },
    req: function () { return placing() ? placeStep() : OH.G.oxy < 2 ? res('plant') : cardStep('p019'); },
    route: function () { return played('p039') ? stdStep('asteroid') : cardStep('p039'); },
    score: function () { return placing() ? nearCity() : res('plant'); },
    mile: function () { return OH.G.pl[0].prod.energy < 1 ? stdStep('power') : first(['#shB [data-mile="quartermaster"]', '#tMile']); },
    award: function () { return first(['#shB [data-award="outfitter"]', '#tAward']); },
    act: function () { return OH.G.pl[0].used.p142 ? res('heat') : first(['#shB [data-act="p142"][data-i="0"]', '#bAct']); },
    rival: function () { return placing() ? placeStep() : first(['#hintbtn']); },
    grad: function () { return first(['#hintbtn']); }
  };
  // chapters, simplest first; goals in plain words, named the way the screen labels them
  var ORDER = [
    ['Basics', 'tiles', 'Plant a greenery', 'Your goal: turn your 8 plants into a greenery tile.'],
    ['Basics', 'stock', 'Pay with titanium', 'Your goal: play the card Cobalt Trawler.'],
    ['Basics', 'sell', 'Sell a card', 'Your goal: play Mirror Tilt Program. It costs 9; you have 8.'],
    ['Basics', 'global', 'Raise the heat', 'Your goal: get the temperature up to -24 °C.'],
    ['Basics', 'gens', 'Rounds and income', 'Your goal: plant a greenery from plants by round 3.'],
    ['Building', 'ocean', 'Make an ocean', 'Your goal: put one ocean on the map.'],
    ['Building', 'adj', 'City by the sea', 'Your goal: build a city touching 2 oceans.'],
    ['Building', 'req', 'Unlock a card', 'Your goal: play Tray Garden Rows. It needs 2% oxygen.'],
    ['Building', 'route', 'Card or project', 'Your goal: gain 3 rating with your 30 credits.'],
    ['Scoring', 'score', 'Garden by a city', 'Your goal: get 2 points from one greenery.'],
    ['Scoring', 'mile', 'Claim a milestone', 'Your goal: claim Quartermaster before the rival.'],
    ['Scoring', 'award', 'Fund an award', 'Your goal: fund an award you are winning.'],
    ['Advanced', 'act', 'Card actions', 'Your goal: gain 2 rating this round from 16 heat.'],
    ['Advanced', 'rival', 'Race the rival', 'Your goal: have more points than the rival after 3 rounds.'],
    ['Advanced', 'grad', 'Short real game', 'Your goal: beat the rival in a 5-round game.']
  ];
  var idx = {}; OHC.SC.forEach(function (c, i) { idx[c.id] = i; });
  var cur = function () { return window.SCN && SCN.S; };
  var lessons = ORDER.filter(function (o) { return idx[o[1]] !== undefined; }).map(function (o) {
    var i = idx[o[1]], c = OHC.SC[i];
    return {
      id: c.id, chapter: o[0], title: o[2], rule: c.learned, goal: o[3], par: c.par.acts || 99,
      debrief: c.why,
      setup: function () { scStart(i); try { twClose(); } catch (e) { } return new Promise(function (r) { setTimeout(r, 450); }); },
      success: function () { var S = cur(); if (!S) return false; OHC.sCheck(S); return !!(S.ended && S.result && S.result.ok); },
      fail: function () { var S = cur(); if (!S) return false; OHC.sCheck(S); return S.ended && S.result && !S.result.ok ? S.result.line : false; },
      moves: function () { var S = cur(); return S ? S.acts : 0; },
      hints: [c.hints[0], { say: c.hints[1], target: T[c.id] }]
    };
  });
  // ---------- Rules window: every rule in plain words, each linked to its lesson ----------
  var RULES = [
    ['Goal', 'Have the most points when the game ends. Points = your rating + tiles + cards + milestones + awards.', 'grad'],
    ['Turns', 'On your turn take 1 or 2 actions, then the rival does. Pass when you are done for the round.', 'rival'],
    ['Rounds', 'When both players pass, the round ends and everyone gets their production (income).', 'gens'],
    ['Income', 'You get credits equal to your credit production plus your rating. Energy turns into heat.', 'gens'],
    ['Stock and production', 'The big number is what you have now. The small +N is what you get every round.', 'stock'],
    ['Steel and titanium', 'Steel pays 2 credits on building cards, titanium pays 3 on space cards.', 'stock'],
    ['Selling', 'Any card in your hand sells for 1 credit (Projects > Sell cards).', 'sell'],
    ['Rating', 'Every step you raise on temperature, oxygen or oceans is +1 rating (1 point and 1 credit each round).', 'global'],
    ['Heat', '8 heat raises the temperature 1 step. Bonus dots on the gauge pay whoever lands there.', 'global'],
    ['Plants', '8 plants make a greenery tile, which raises oxygen 1 step.', 'tiles'],
    ['Greenery placement', 'A greenery must go next to one of your tiles when it can.', 'tiles'],
    ['Oceans', 'Oceans only go on the blue ocean spaces. There are 9.', 'ocean'],
    ['Placement bonus', 'A tile next to an ocean pays 2 credits per ocean. Icons on a space pay their bonus.', 'adj'],
    ['Cities', 'A city can never touch another city. Each city gives +1 credit production.', 'adj'],
    ['Requirements', 'Some cards need a gauge level or tags before you can play them.', 'req'],
    ['Projects', 'Projects are always available: power plant, comet strike, aquifer, greenery, city. Cards are often cheaper.', 'route'],
    ['Greenery points', 'Each greenery is 1 point. Each greenery touching your city gives 1 more.', 'score'],
    ['Milestones', 'Claim one for 8 credits when you meet its goal: 5 points. Only the first player gets it; 3 in a game.', 'mile'],
    ['Awards', 'Fund one for 8, 14, then 20 credits. At the end the leader gets 5 points; a tie pays both.', 'award'],
    ['Card actions', 'Blue cards have an action you may use once every round (the Actions button).', 'act'],
    ['Buying cards', 'Each new round shows you 4 cards; keep any for 3 credits each.', 'grad'],
    ['Game end', 'When temperature, oxygen and oceans are all full, the round finishes, you may plant once more, then score.', 'grad'],
    ['Ties', 'If points are tied, the player with more credits wins.', 'grad']
  ];
  var css = '#ohRules{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;background:rgba(10,6,4,.55);padding:12px}' +
    '#ohRules .rw{background:var(--gxst-bg,#2a1d16);color:var(--gxst-ink,#f6ead8);border-radius:14px;max-width:560px;width:100%;max-height:calc(100vh - 24px);display:flex;flex-direction:column;box-shadow:0 10px 40px rgba(0,0,0,.5);font:15px/1.35 "Space Grotesk",system-ui,sans-serif}' +
    '#ohRules .rh{display:flex;align-items:center;padding:10px 12px;border-bottom:1px solid rgba(255,255,255,.12)}#ohRules .rh b{flex:1;font-size:17px}' +
    '#ohRules .rh button{min-width:44px;min-height:44px;border:0;border-radius:10px;background:rgba(255,255,255,.1);color:inherit;font-size:20px;cursor:pointer}' +
    '#ohRules ol{margin:0;padding:6px 12px 12px;overflow:auto;list-style:none}#ohRules li{display:flex;gap:8px;align-items:center;padding:7px 0;border-bottom:1px solid rgba(255,255,255,.07)}' +
    '#ohRules li span{flex:1}#ohRules li i{font-style:normal;font-weight:700;color:var(--gxst-acc,#f0a24a)}' +
    '#ohRules li button{flex:none;min-height:40px;padding:0 10px;border-radius:10px;border:1px solid var(--gxst-acc,#f0a24a);background:none;color:inherit;font:600 13px/1 inherit;cursor:pointer}';
  var title = {}; lessons.forEach(function (l, i) { title[l.id] = (i + 1) + '. ' + l.title; });
  function closeRules() { var w = document.getElementById('ohRules'); if (w) w.remove(); }
  function openRules() {
    closeRules();
    if (!document.getElementById('ohRulesCss')) { var st = document.createElement('style'); st.id = 'ohRulesCss'; st.textContent = css; document.head.appendChild(st); }
    var w = document.createElement('div'); w.id = 'ohRules'; w.setAttribute('role', 'dialog'); w.setAttribute('aria-label', 'Rules');
    w.innerHTML = '<div class="rw"><div class="rh"><b>All the rules</b><button type="button" aria-label="Close rules">×</button></div><ol>' + RULES.map(function (r) {
      return '<li><span><i>' + r[0] + ':</i> ' + r[1] + '</span>' + (title[r[2]] ? '<button type="button" data-rl="' + r[2] + '" aria-label="Play lesson ' + title[r[2]] + '">Lesson ' + title[r[2]].split('.')[0] + '</button>' : '') + '</li>';
    }).join('') + '</ol></div>';
    w.addEventListener('click', function (e) {
      var b = e.target.closest('button'); e.stopPropagation();
      if (e.target === w || (b && !b.hasAttribute('data-rl'))) return closeRules();
      if (b) { closeRules(); GXST.start(b.getAttribute('data-rl')); }
    });
    document.body.appendChild(w);
  }
  window.ohRules = openRules;
  var go = function () {
    if (!(window.UI && UI.ready !== false && window.OH && typeof scStart === 'function' && typeof startGame === 'function')) { setTimeout(go, 150); return; }
    GXST.init({ game: 'ochre', qParent: '#bw', scenarios: lessons, keepClear: ['#res', '#bPass', '#bCards', '#bProj', '.hex.tgt'],
      pickerButtons: [{ label: 'Rules', aria: 'All the rules', cls: 'gxst-rules', fn: openRules }],
      settled: function () { return !UI.busy; } });
    // Learn to play and the ? button open the lessons (the first visit starts lesson 1)
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
    if (Q2.get('rules')) openRules();
  };
  setTimeout(go, 200);
})();
