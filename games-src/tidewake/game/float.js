// Tidewake: the floating tutorial (shared kit shell/gx-float.js, docs shell/GXF.md). It replaces the old dimming guided game's steps (ui10.js tutSteps,
// now unused): same fixed game against Cobalt (src/tutscript.js), but a draggable window, a map of the screen first, and a pulse ring that never
// blocks a tap. Lessons follow the play order, one rule each. Next on an action lesson does that action for you in the fixed game.
(function () {
  var seen = {};
  function ready() { return typeof G !== 'undefined' && typeof TS !== 'undefined' && typeof tutBegin === 'function' && typeof GXF !== 'undefined'; }
  // a plain rect (board cell) becomes a real element the kit can measure; it never takes taps
  function cellEl(r) {
    var e = document.getElementById('gxf-t');
    if (!e) { e = document.createElement('div'); e.id = 'gxf-t'; e.setAttribute('aria-hidden', 'true'); e.style.cssText = 'position:fixed;pointer-events:none;visibility:hidden'; document.body.appendChild(e); }
    if (!r) return null;
    e.style.left = r.left + 'px'; e.style.top = r.top + 'px'; e.style.width = r.width + 'px'; e.style.height = r.height + 'px'; e.style.visibility = 'visible'; return e;
  }
  var cell = function (x, y) { return function () { return cellEl(tcell(x, y)); }; };
  var mon = function (id) { return function () { var m = G && monById(id); return m ? cellEl(tcell(m.x, m.y)) : null; }; };
  var myShip = function () { var s = G && G.ships[TS.me]; return s && s.x != null ? cellEl(tcell(s.x, s.y)) : null; };
  var coShip = function () { var s = G && G.ships[TS.co]; return s && s.x != null ? cellEl(tcell(s.x, s.y)) : null; };
  var board = function () { return document.getElementById('board'); };
  var tile = function (i) { return function () { return tvis('[data-a=card][data-t="' + i + '"],[data-ph=pcard][data-t="' + i + '"]'); }; };
  var turnNow = function (n) { return function () { return !!G && G.turn >= n; }; };
  var mineAt = function (n) { return tmine(n); };
  function place(n, r) { return function () { if (mineAt(n)) { tsel(0, r); doPlace(); } }; }
  function rot(n, r) { return function () { if (mineAt(n)) tsel(0, r); }; }
  var tapped = false;
  document.addEventListener('pointerdown', function (e) { var b = board(); if (b && b.contains(e.target)) tapped = true; }, true);

  // One lesson per rule, in play order. say = one sentence, why = the reason, act = what Next does for you when the move was not made yet.
  function steps() {
    var ph = typeof PH !== 'undefined' && PH.on;
    return [
      { id: 'goal', title: 'The goal', say: 'The last junk still afloat wins.', why: 'Every other rule is about keeping your junk afloat.', target: board, done: function () { return tapped; } },
      { id: 'mark', title: 'Start mark', say: ph ? 'Tap the gold mark on the chart edge to start there.' : 'Tap a gold mark on the chart edge to start there.', why: 'Your junk starts outside the chart and sails in along the first tile.',
        target: function () { return tvis('[data-a=startmark]:not(.pri)[data-x="' + TS.myStart.x + '"][data-y="' + TS.myStart.y + '"][data-e="' + TS.myStart.e + '"]') || cell(TS.myStart.x, TS.myStart.y)(); },
        done: function () { return !!G && G.ships[TS.me].x != null; },
        act: function () { if (G && G.ships[TS.me].x == null && sideToAct() === TS.me) act({ a: 'start', x: TS.myStart.x, y: TS.myStart.y, e: TS.myStart.e }, TS.me); } },
      { id: 'order', title: 'All start first', say: 'Every junk takes a mark before any tile is laid.', why: 'Then nobody can pick a start next to a finished line.', target: coShip },
      { id: 'reloc', title: 'Blocked start', say: 'A leviathan on your start square? Move to another free mark.', why: 'You never lose a junk before you have sailed.', target: myShip },
      { id: 'roll', title: 'Two dice', say: 'Every turn begins with a roll of two dice.', why: 'The total decides whether the leviathans wake.', target: tmph },
      { id: 'wake', title: 'Six, seven, eight', say: 'A total of 6, 7 or 8 wakes every leviathan.', why: 'Any other total is calm, so you can plan the next tile.', target: tmph },
      { id: 'levmove', title: 'Leviathans move', say: 'Each awake leviathan rolls one die: one square, or a quarter turn.', why: 'Its tile shows an arrow for each number.', target: mon(0) },
      { id: 'six', title: 'A six', say: 'A 6 on its die raises a new leviathan instead.', why: 'The sea gets more dangerous the longer you sail.', target: mon(5) },
      { id: 'hand', title: 'Your tiles', say: 'Tap a tile from your hand of three.', why: 'You always hold three, so you choose how to steer.', target: tile(0), done: function () { return !!UI.sel; }, act: function () { if (mineAt(2)) tsel(0, 0); } },
      { id: 'edge', title: 'Chart edge', say: 'A line that runs off the chart edge sinks you.', why: 'The red cross marks a tile that would drown you.', target: cell(TS.myStart.x, TS.myStart.y) },
      { id: 'turn', title: 'Turn the tile', say: 'Tap Turn to spin the tile a quarter.', why: 'Every tile can be laid four ways.', target: trot, done: function () { return !!UI.sel && UI.sel.t === 0 && UI.sel.r === 1 || turnNow(3)(); }, act: rot(2, 1) },
      { id: 'never', title: 'Never allowed', say: 'Never lay a loop, a leviathan tile or a rival\'s path.', why: 'Place stays grey when the move is not allowed.', target: tile(0) },
      { id: 'place', title: 'Lay the tile', say: 'Tap Place to put the tile on the square at your bow.', why: 'A laid tile stays for the whole game.', target: tplace, done: turnNow(3), act: place(2, 1) },
      { id: 'sail', title: 'Sail on', say: 'Your junk sails along the new line to its open end.', why: 'You can only move by laying tiles.', target: myShip },
      { id: 'draw', title: 'Draw to three', say: 'After each turn you draw back up to three tiles.', why: 'Destroyed tiles go to the bottom of the pile.', target: tile(2) },
      { id: 'chain', title: 'Sail through', say: 'Tap Place: this tile joins Cobalt\'s line, so you sail through both.', why: 'Lines from other captains carry you too.', target: tplace, done: turnNow(5), act: place(4, 0) },
      { id: 'push', title: 'Push a rival', say: 'A tile at any junk\'s line end sends that junk sailing too.', why: 'You can steer your rivals, not just yourself.', target: coShip },
      { id: 'collide', title: 'Two on one line', say: 'Two junks on one line sailing the same way both sink.', why: 'Moves that sink you are not allowed.', target: coShip },
      { id: 'wave', title: 'Rogue wave', say: 'A rogue wave sweeps a row: roll its strength or capsize.', why: 'It rolls again when your line crosses its row.', target: board },
      { id: 'safe', title: 'Green tick', say: 'This tile is safe, marked with a green tick. Tap Place.', why: 'The tick means no leviathan or edge ends your line.', target: tplace, done: turnNow(7), act: place(6, 0) },
      { id: 'blocked', title: 'Danger ahead', say: 'A leviathan in front of your bow sinks you.', why: 'Only a Deck Cannon can destroy it first.', target: mon(4) },
      { id: 'cannon', title: 'Deck cannon', say: 'A Deck Cannon destroys one leviathan; keep it or discard it.', why: 'You may hold two, so keep the useful ones.', target: tile(0) },
      { id: 'offboard', title: 'Off the chart', say: 'A leviathan pushed off the chart is gone for good.', why: 'It does not come back.', target: mon(0) },
      { id: 'collapse', title: 'Leviathan clash', say: 'A leviathan landing on another one destroys it.', why: 'You can use the crowd to clear your way.', target: mon(7) },
      { id: 'min3', title: 'At least three', say: 'Fewer than three leviathans? The next captain adds more.', why: 'The sea never empties.', target: mon(7) },
      { id: 'turn2', title: 'Turn twice', say: 'This tile needs two quarter turns. Tap Turn twice.', why: 'Count the turns before you place.', target: trot, done: function () { return !!UI.sel && UI.sel.r === 2 || turnNow(9)(); }, act: rot(8, 2) },
      { id: 'place2', title: 'Lay it', say: 'Tap Place.', why: 'This tile ends Cobalt\'s line under a leviathan.', target: tplace, done: turnNow(9), act: place(8, 2) },
      { id: 'sunk', title: 'A tile destroyed', say: 'A leviathan landing on a tile destroys it and sinks the junk on it.', why: 'Tap OK on the card that tells you.', target: function () { return tvis('#pc [data-a=sunkok],#cards [data-a=sunkok]'); }, done: function () { return !!G && !!G.over && !(UI.sunk && UI.sunk.length); }, act: function () { var b = tvis('#pc [data-a=sunkok],#cards [data-a=sunkok]'); if (b) b.click(); } },
      { id: 'swap', title: 'Swap tiles', say: 'Sink a rival with your tile and swap your tiles for theirs.', why: 'The elimination bonus, shown in this practice swap.', target: function () { return tvis('#twswap'); }, setup: function () { try { if (!TSW.on && G && G.over) swOpen(); } catch (e) { } }, done: function () { return TSW.n > 0 && !TSW.on; } },
      { id: 'win', title: 'You win', say: 'Yours is the last junk afloat: you win.', why: 'That is the whole goal.', target: board },
      { id: 'rift', title: 'Rift gate', say: 'A Rift Gate moves ships and leviathans to new squares.', why: 'Tick it in Setup; it can rescue a ship about to sink.', target: '[data-gx="setd"]' },
      { id: 'mael', title: 'Whirlpool', say: 'A whirlpool moves only on calm turns and removes what it meets.', why: 'It is an add-on from Setup.', target: '[data-gx="setd"]' },
      { id: 'modes', title: 'Other ways', say: 'Teams, solo and a no-leviathan game are chosen in Setup.', why: 'The same tiles and rules, a different challenge.', target: '[data-gx="setd"]' },
      { id: 'practice', title: 'Practice', say: 'Practice: open Menu, start a real game and lay three tiles.', why: 'The lantern is won by sailing, not by reading.', target: '[data-gx="setd"]' }
    ];
  }
  var hud = [
    { sel: '#barstat', label: 'Turn', say: 'Whose turn it is and the turn number.' },
    { sel: '#bulbbtn', label: 'Hint', say: 'Suggests the safest tile and says why.' },
    { sel: '[data-gx="setd"]', label: 'Menu', say: 'Rules, Log, Crews, new game, sound and speed.' },
    { sel: '.gxf-q', label: 'Help ?', say: 'Reopens this map and the lessons.' },
    { sel: '#board', label: 'Sea chart', say: 'The seven by seven chart; tap a square or a gold mark.' },
    { sel: '.ps-main', label: 'Now', say: 'What to do this moment, and the dice or status.' },
    { sel: '.ps-ctl', label: 'Controls', say: 'Your tiles, Turn and Place buttons appear here.' },
    { sel: '.ps-crews', label: 'Captains', say: 'Every captain, whether afloat, and their tiles in hand.' }
  ];
  // Next on an action lesson performs that action in the fixed game
  window.addEventListener('gxf', function (e) {
    var d = e.detail || {}; if (d.type !== 'step' || d.by !== 'next') return;
    var st = window.TW_FLOAT.steps.filter(function (s) { return s.id === d.prev; })[0];
    if (st && st.act && !(st.done && st.done())) try { st.act(); } catch (er) { }
  });
  window.TW_FLOAT = { steps: [], hud: hud, tutStep: null };
  // called by tutStart (ui10.js)
  window.tutFloat = function () {
    if (!ready()) return false;
    try { localStorage.removeItem('gxf-tidewake'); } catch (e) { }
    tapped = false; seen = {};
    tutBegin(); TUTG.freeze = false; try { schedule(); } catch (e) { }
    window.TW_FLOAT.steps = steps();
    GXF.init({ game: 'tidewake', steps: window.TW_FLOAT.steps, hud: hud }).open();
    return true;
  };
})();
