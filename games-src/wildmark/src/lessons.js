// Wildmark scenario tutorials (GXST, shell/gx-scenario-tutor.js, docs shell/GXST.md, spec orch/TUTORIAL-SPEC.md). They REPLACE the old floating
// lesson window on the default path: tutStart now opens the lesson picker (the old kit stays in tutor.js, reachable only through its own '?' button
// if a game already runs under it). Each lesson stacks a tiny real valley and market with ONE goal; the player takes, places and settles for real
// and learns the rule from the consequence. Judged only when the turn is over (stage 'pick'). Link: ?lesson=<id>. Test: node lessons-test.js.
//
// RULE -> SCENARIO (rules-notes.md / RULES-COVERAGE.md):
//   a turn = take one market column (tile + animal), place the tile, settle the animal ... pair
//   an animal on a gold-rimmed one-land keystone earns an acorn ........................ key
//   acorn: any tile with any animal (free pick) ........................................ acorn
//   three alike in the market: sweep once per turn (four alike go by themselves) ....... sweep
//   joined land: 1 point per tile of the biggest group of one land ..................... land
//   bears: groups of exactly two ........................................................ bear
//   hawks: only hawks that touch no hawk ................................................ hawk
//   foxes: 1 per different kind beside the fox ......................................... fox
// NOT taught here (reference + old floating lessons only): elk lines, salmon runs, land majority bonus, solo market slide, end-of-game tie-break.
(function () {
  if (!window.GXST || !window.WM || !window.GXS) return;
  var L = { n: 0, on: false, w3: 0, id: -10 };
  var $ = function (s) { return document.querySelector(s); };
  var me = function () { return G.seats[0]; };
  var turnOver = function () { return !!G && G.stage === 'pick' && me().done >= 1; };
  // count the player's real moves (par); hint previews clone G, so only the live game counts
  var oa = WM.apply; WM.apply = function (g, m) { var r = oa.apply(this, arguments); if (L.on && g === G && g.cur === 0 && m) { L.n++; if (m.t === 'wipe3') L.w3++; } return r; };
  // lesson games never overwrite the player's saved game
  var os = window.save; window.save = function () { if (L.on) return; return os.apply(this, arguments); };
  // a hex cell: split tile (two lands) unless one land is given; a = animals shown, tok = animal already settled
  var cell = function (t, a, tok) { return { id: L.id--, t: t.slice(), a: a.slice(), key: t.length === 1, rot: 0, tok: tok || null }; };
  var sp = function (a, tok, t) { return cell(t || ['forest', 'peak'], a, tok); };
  var key = function (t, a, tok) { return cell([t], [a], tok); };
  var tile = function (t, a) { return { id: L.id--, t: t.slice(), a: a.slice(), key: t.length === 1 }; };
  var colEl = function (i) { return $('#mk .mt[data-i="' + i + '"]'); };
  // where the soft ring goes: the column while picking, the tile spot / Place button while placing, a glowing animal spot while settling
  var guide = function (i) { return function () { return G.stage === 'pick' ? colEl(i) : G.stage === 'tile' ? ($('#okB') || $('#map .spot')) : $('#map .tgt'); }; };
  var cellEl = function (c) { return function () { return G.stage === 'tok' ? $('#map [data-c="' + c + '"]') || $('#map .tgt') : guide(0)(); }; };
  // stage a one-turn puzzle: env = {'q,r': cell}, tiles/toks = the four market columns
  function stage(sp0) {
    try { var sk = document.querySelector('[data-gxt-skip]'); if (sk) sk.click(); GX.close(); if (window.GXC) GXC.close(); } catch (e) { }
    if (window.tutLeave) try { tutLeave(); } catch (e) { }
    try { coachHide(); } catch (e) { }
    try { GXH.setEnabled(false); } catch (e) { }
    L.id = -10; L.n = 0; L.w3 = 0; L.on = true; UI.fast = true; window.ANIM = false; UI.mode = 'quick'; UI.camp = null;
    newGame({ np: 1, humans: 1, seed: sp0.seed || 5, turns: 20 });
    G.seats[0].env = sp0.env; G.seats[0].acorns = sp0.acorns || 0;
    G.market.tiles = sp0.tiles.map(function (t) { return tile(t[0], t[1]); }); G.market.toks = sp0.toks.slice();
    UI.undo = null; UI.ghost = null; UI.free = null; UI.wipe = null; UI.acornMenu = false; UI.view = 0;
    try { fitView(true); } catch (e) { } render(); step();
  }
  var lessons = [
    { id: 'pair', title: 'Take and settle', par: 3,
      rule: 'A turn: take one column (tile + animal), place the tile, then settle the animal on a tile showing it.',
      goal: 'Score a bear pair: two bears side by side.',
      setup: function () {
        var e = { '0,0': sp(['bear', 'elk'], 'bear', ['forest', 'peak']), '0,1': sp(['salmon', 'hawk'], null, ['meadow', 'marsh']), '1,0': sp(['bear', 'fox'], null, ['forest', 'meadow']) };
        stage({ env: e, tiles: [[['river', 'marsh'], ['salmon', 'hawk']], [['meadow', 'peak'], ['elk', 'fox']], [['forest', 'river'], ['hawk', 'elk']], [['marsh', 'meadow'], ['fox', 'salmon']]], toks: ['elk', 'salmon', 'bear', 'fox'] }); },
      success: function () { return WM.score(me().env, 0).ani.bear >= 4; },
      fail: function () { return turnOver() ? 'No pair. Only the bear animal makes a bear pair: take its column and settle it next to the other bear.' : false; },
      hints: ['Which column carries a bear animal? The bear needs a neighbour.', { say: 'Take the third column, place its tile, then tap the glowing bear spot.', target: guide(2) }],
      debrief: 'Two bears side by side: 4 points. Take, place, settle.' },
    { id: 'key', title: 'Keystone acorn', par: 3,
      rule: 'An animal settled on a gold-rimmed one-land keystone earns an acorn.',
      goal: 'Settle the fox and earn an acorn.',
      setup: function () {
        var e = { '0,0': sp(['fox', 'elk'], null, ['forest', 'peak']), '1,0': key('river', 'fox'), '0,1': sp(['bear', 'hawk'], null, ['meadow', 'marsh']) };
        stage({ env: e, tiles: [[['river', 'marsh'], ['salmon', 'hawk']], [['meadow', 'peak'], ['elk', 'bear']], [['forest', 'river'], ['hawk', 'elk']], [['marsh', 'meadow'], ['bear', 'salmon']]], toks: ['elk', 'fox', 'bear', 'salmon'] }); },
      success: function () { return me().acorns >= 1; },
      fail: function () { return turnOver() ? 'No acorn. The fox sat on an ordinary tile; only the gold-rimmed one-land keystone pays one.' : false; },
      hints: ['Two tiles show a fox. One has a gold rim.', { say: 'Take the fox, place a tile, settle it on the gold-rimmed river keystone.', target: guide(1) }],
      debrief: 'Keystone: the fox earned an acorn, worth 1 point at the end.' },
    { id: 'acorn', title: 'Spend an acorn', par: 4,
      rule: 'An acorn lets you take any tile with any animal, not the column as dealt.',
      goal: 'Settle a hawk on a river tile this turn.',
      setup: function () {
        var e = { '0,0': sp(['bear', 'elk'], null, ['forest', 'peak']), '0,1': sp(['fox', 'salmon'], null, ['meadow', 'marsh']), '1,0': sp(['elk', 'bear'], null, ['forest', 'meadow']) };
        stage({ env: e, acorns: 1, tiles: [[['river', 'marsh'], ['hawk', 'bear']], [['forest', 'peak'], ['elk', 'fox']], [['meadow', 'peak'], ['bear', 'salmon']], [['forest', 'marsh'], ['elk', 'fox']]], toks: ['fox', 'hawk', 'bear', 'elk'] }); },
      success: function () { var e = me().env; return Object.keys(e).some(function (c) { return e[c].tok === 'hawk' && e[c].t.indexOf('river') >= 0; }); },
      fail: function () { return turnOver() ? 'No hawk on a river tile. The hawk and the river tile sit in different columns: spend your acorn to take them together.' : false; },
      hints: ['The hawk and the river tile are in different columns. What lets you split them?', { say: 'Tap Acorn, then Free pick, then the river tile and the hawk.', target: function () { return $('#freeB') || $('#acornB'); } }],
      debrief: 'Acorn: any tile with any animal. The hawk went onto the river tile.' },
    { id: 'sweep', title: 'Sweep three', par: 1,
      rule: 'Three alike animals in the market may be swept away, once per turn. Four alike go by themselves.',
      goal: 'Sweep the three elk out of the market.',
      setup: function () {
        var e = { '0,0': sp(['fox', 'elk'], null, ['forest', 'peak']), '0,1': sp(['bear', 'hawk'], null, ['meadow', 'marsh']), '1,0': sp(['salmon', 'fox'], null, ['forest', 'meadow']) };
        stage({ env: e, tiles: [[['river', 'marsh'], ['salmon', 'hawk']], [['meadow', 'peak'], ['elk', 'bear']], [['forest', 'river'], ['hawk', 'elk']], [['marsh', 'meadow'], ['bear', 'salmon']]], toks: ['elk', 'elk', 'elk', 'fox'] }); },
      success: function () { return L.w3 > 0; },
      fail: function () { return turnOver() ? 'The three elk stayed. Sweeping is free, once a turn, before you take: tap the Sweep button.' : false; },
      hints: ['Three animals in the market match. Is there a button for that?', { say: 'Tap Sweep 3 elk.', target: '#w3B' }],
      debrief: 'Three alike swept for free: fresh animals came in.' },
    { id: 'land', title: 'Join the land', par: 3,
      rule: 'Each land scores 1 point per tile in its biggest joined group. Same land edge to same land edge.',
      goal: 'Make one forest group of 3 tiles.',
      setup: function () {
        var e = { '0,0': key('forest', 'elk'), '0,1': key('river', 'hawk'), '1,1': key('river', 'salmon'), '2,0': key('forest', 'bear') };
        stage({ env: e, tiles: [[['forest'], ['elk']], [['river'], ['hawk']], [['meadow'], ['fox']], [['peak'], ['bear']]], toks: ['elk', 'hawk', 'fox', 'bear'] }); },
      success: function () { return WM.corridor(me().env, 'forest') >= 3; },
      fail: function () { return turnOver() ? 'Forest stays at ' + WM.corridor(me().env, 'forest') + '. Take the forest tile and drop it in the gap between the two forests so all three touch.' : false; },
      hints: ['Two forest tiles with a gap between them. What fills the gap?', { say: 'Take the forest column and place it in the gap.', target: guide(0) }],
      debrief: 'Forest, gap, forest: one group of 3 = 3 points.' },
    { id: 'bear', title: 'Bear pairs', par: 3,
      rule: 'Bears score only in groups of exactly two. A third bear in the group ruins it.',
      goal: 'Score 11 points with two bear pairs.',
      setup: function () {
        var e = { '0,0': sp(['bear', 'elk'], 'bear'), '1,0': sp(['bear', 'hawk'], 'bear', ['forest', 'meadow']), '2,0': sp(['bear', 'fox'], null, ['peak', 'marsh']), '2,1': sp(['salmon', 'elk'], null, ['river', 'forest']),
          '3,1': sp(['bear', 'elk'], 'bear', ['meadow', 'river']), '3,2': sp(['bear', 'salmon'], null, ['marsh', 'forest']) };
        stage({ env: e, tiles: [[['river', 'marsh'], ['salmon', 'hawk']], [['meadow', 'peak'], ['elk', 'fox']], [['forest', 'river'], ['hawk', 'elk']], [['marsh', 'meadow'], ['fox', 'salmon']]], toks: ['bear', 'salmon', 'hawk', 'elk'] }); },
      success: function () { return WM.score(me().env, 0).ani.bear >= 11; },
      fail: function () { var b = WM.score(me().env, 0).ani.bear; return turnOver() ? 'Bears scored ' + b + '. A trio of bears scores nothing: join the lone bear, never the pair.' : false; },
      hints: ['A pair is already there. Which empty bear spot does NOT touch it?', { say: 'Settle the bear by the lone bear on the right, away from the pair.', target: function () { return G.stage === 'tok' ? $('#map [data-c="3,2"]') || $('#map .tgt') : guide(0)(); } }],
      debrief: 'Two separate pairs: 11. A third bear in a pair would have scored 0.' },
    { id: 'hawk', title: 'Lone hawks', par: 3,
      rule: 'A hawk scores only if no other hawk touches it. More lone hawks score more.',
      goal: 'Score 5 points from hawks.',
      setup: function () {
        var e = { '0,0': sp(['hawk', 'elk'], 'hawk'), '1,0': sp(['hawk', 'bear'], null, ['forest', 'meadow']), '0,1': sp(['fox', 'salmon'], null, ['meadow', 'marsh']), '0,2': sp(['elk', 'bear'], null, ['river', 'peak']), '0,3': sp(['hawk', 'fox'], null, ['marsh', 'river']) };
        stage({ env: e, tiles: [[['river', 'marsh'], ['salmon', 'elk']], [['meadow', 'peak'], ['elk', 'fox']], [['forest', 'river'], ['bear', 'elk']], [['marsh', 'meadow'], ['fox', 'salmon']]], toks: ['hawk', 'salmon', 'elk', 'fox'] }); },
      success: function () { return WM.score(me().env, 0).ani.hawk >= 5; },
      fail: function () { var h = WM.score(me().env, 0).ani.hawk; return turnOver() ? 'Hawks scored ' + h + '. Two hawks touching each other score nothing: keep every hawk alone.' : false; },
      hints: ['Two empty hawk spots. One touches the hawk you have.', { say: 'Settle the hawk on the far spot, touching no hawk.', target: function () { return G.stage === 'tok' ? $('#map [data-c="0,3"]') || $('#map .tgt') : guide(0)(); } }],
      debrief: 'Two lone hawks: 5 points. Touching ones would have scored 0.' },
    { id: 'fox', title: 'Curious fox', par: 3,
      rule: 'A fox scores 1 for each different kind of animal beside it.',
      goal: 'Score 3 points from your fox.',
      setup: function () {
        var e = { '0,0': sp(['fox', 'elk'], null, ['forest', 'peak']), '1,0': sp(['bear', 'hawk'], 'bear', ['forest', 'meadow']), '0,1': sp(['elk', 'fox'], 'elk', ['meadow', 'marsh']), '-1,1': sp(['salmon', 'bear'], 'salmon', ['river', 'forest']), '2,0': sp(['fox', 'hawk'], null, ['peak', 'river']) };
        stage({ env: e, tiles: [[['river', 'marsh'], ['salmon', 'hawk']], [['meadow', 'peak'], ['elk', 'bear']], [['forest', 'river'], ['hawk', 'elk']], [['marsh', 'meadow'], ['bear', 'salmon']]], toks: ['salmon', 'elk', 'fox', 'hawk'] }); },
      success: function () { return WM.score(me().env, 0).ani.fox >= 3; },
      fail: function () { var f = WM.score(me().env, 0).ani.fox; return turnOver() ? 'The fox scored ' + f + '. It counts each different animal beside it: sit it where bear, elk and salmon meet.' : false; },
      hints: ['Two fox spots. Which one has more different animals around it?', { say: 'Settle the fox on the left spot, among bear, elk and salmon.', target: function () { return G.stage === 'tok' ? $('#map [data-c="0,0"]') || $('#map .tgt') : guide(2)(); } }],
      debrief: 'Bear + elk + salmon beside it: 3 points.' }
  ];
  lessons.forEach(function (s) { s.moves = function () { return L.n; }; });
  var go = function () {
    if (!(window.UI && window.render && window.GX && window.GXH && window.newGame && window.G !== undefined)) { setTimeout(go, 200); return; }
    // every entry point (title Tutorial button, menu, story Guide, the ? button) reaches tutStart in tutor.js, which opens the lessons once GXST is up
    var qh = document.createElement('div'); qh.hidden = true; document.body.appendChild(qh);   // the bar is full on a phone: the '?' button opens the picker, so the extra Lessons button goes here (unseen)
    GXST.init({ game: 'wildmark', qParent: qh, scenarios: lessons, keepClear: ['.gx-bar', '#mk', '#acts', '#line', '#cards'], settled: function () { return !!G && G.stage === 'pick' && !UI.aiRun && !UI.ghost; } });
    window.__wmLessons = true;
    window.addEventListener('gxst', function (ev) {
      var t = ev.detail && ev.detail.type;
      if ((t === 'start' || t === 'retry') && L.on) setTimeout(function () { try { fitView(true); } catch (e) { } }, 60);
      if (t === 'close' && L.on) { L.on = false; UI.fast = false; window.ANIM = true; try { GXH.setEnabled(true); } catch (e) { } UI.mode = 'quick'; try { G = null; UI.mode = 'title'; showTitle(); } catch (e) { } }
    });
    var m = /[?&]lesson=([\w-]+)/.exec(location.search);
    if (m) { try { GXT.markDone('wildmark'); } catch (e) { } setTimeout(function () { GXST.start(m[1]); }, 400); }
    else if (/[?&]lessons=1/.test(location.search)) GXST.picker();
  };
  setTimeout(go, 300);
})();
