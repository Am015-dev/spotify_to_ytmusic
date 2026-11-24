// Rampart and Vine: the floating tutorial (shell/gx-float.js, GXF.md). Replaces the dimming staged tutorial: same fixed valley and scripted
// rival (tutor.js), but a window that never dims or blocks anything. HUD map first, then one lesson per rule in play order, then a practice.
(function () {
  var ME = function () { return !!G && !!G.pl; };
  var F = { turned: false };
  // a plain box over some board tiles, so a lesson can point at a group of tiles (the kit wants one element)
  var cellsEl = function (keys) {
    return function () {
      var r = typeof tutCells === 'function' ? tutCells(keys) : null, d = document.getElementById('gxf-cells');
      if (!r) { if (d) d.style.display = 'none'; return null; }
      if (!d) { d = document.createElement('div'); d.id = 'gxf-cells'; d.style.cssText = 'position:fixed;pointer-events:none;z-index:1'; document.body.appendChild(d); }
      d.style.display = 'block'; d.style.left = r.left + 'px'; d.style.top = r.top + 'px'; d.style.width = r.width + 'px'; d.style.height = r.height + 'px'; return d;
    };
  };
  var at = function (n) { return ME() && G.turn > n; };                       // the human's turn n is over
  var inFig = function (n) { return ME() && G.turn === n && G.step === 'fig'; };
  var RING = ['-2,-1', '-1,-1', '0,-1', '-2,0', '-1,0', '0,0', '-2,1', '-1,1', '0,1'];
  var steps = [
    { id: 'goal', title: 'Most points wins', say: 'Build the valley tile by tile; the most points when the tiles run out wins.', why: 'Every rule below is a way to score.', target: '#seats' },
    { id: 'turn', title: 'Turn your tile', say: 'Tap your tile at the bottom to turn it.', why: 'Edges must fit, so you often need another turn.', target: '#htile', done: function () { return F.turned; } },
    { id: 'place1', title: 'Match the edges', say: 'Tap a glowing square to lay the tile: road meets road, town meets town, field meets field.', why: 'Matching edges is what builds one long road or town.', target: function () { return tutGlow(1)(); }, done: function () { return at(1) || inFig(1); } },
    { id: 'fig_road', title: 'Claim the road', say: 'Tap the glowing circle to put a follower on the road.', why: 'Only a claimed road scores for you.', target: function () { return tutFig(1)(); }, done: function () { return at(1); } },
    { id: 'seven', title: 'Seven followers', say: 'You have seven followers; the count by your name shows how many are left.', why: 'Followers on the board are busy, so spend them wisely.', target: '#seats' },
    { id: 'claimed', title: 'One owner only', say: 'Your rival lays and claims a tile; a road, town or field that has a follower is taken.', why: 'You cannot join a feature someone already claimed, so claim early.', target: function () { return UI.tl && UI.tl['1,1']; }, done: function () { return at(2) && myTurn('place'); } },
    { id: 'place2', title: 'Close the road', say: 'Lay this tile on the glowing square to close your road.', why: 'Followers go only on the tile you just laid.', target: function () { return tutGlow(3)(); }, done: function () { return at(3) || inFig(3); } },
    { id: 'fig_priory', title: 'Claim the priory', say: 'Tap the circle to claim the priory.', why: 'A priory scores 9 once eight tiles ring it.', target: function () { return tutFig(3)(); }, done: function () { return at(3); } },
    { id: 'road_done', title: 'Road finished', say: 'A finished road scores 1 per tile, and the follower walks home.', why: 'Finishing returns your follower to use again.', target: cellsEl(['0,0', '1,0', '1,1', '-1,0']), done: function () { return ME() && G.pl[0].score >= 4; } },
    { id: 'place3', title: 'Build a town', say: 'Lay the tile so town meets town and the town closes.', why: 'A town scores only when it is closed all round.', target: function () { return tutGlow(5)(); }, done: function () { return at(5) || inFig(5); } },
    { id: 'fig_town', title: 'Claim the town', say: 'Tap the circle to claim the town before it closes.', why: 'Once closed, it is too late to claim it.', target: function () { return tutFig(5)(); }, done: function () { return at(5); } },
    { id: 'town_done', title: 'Town finished', say: 'A finished town scores 2 per tile.', why: 'Towns pay double what roads pay.', target: cellsEl(['0,0', '0,-1']), done: function () { return ME() && G.pl[0].score >= 8; } },
    { id: 'pennant', title: 'Banners', say: 'Each banner in a finished town adds 2 more points.', why: 'A small town with banners can beat a big one without.', target: cellsEl(['0,0', '0,-1']) },
    { id: 'place4', title: 'Fill the ring', say: 'Lay the tile on the glowing square: the priory needs all eight neighbours.', why: 'Each tile beside it brings the 9 points closer.', target: function () { return tutGlow(7)(); }, done: function () { return at(7) || inFig(7); } },
    { id: 'fig_farmer', title: 'Send a farmer', say: 'A follower in a field is a farmer; tap the circle to send one.', why: 'A farmer never comes home, so he scores at the very end.', target: function () { return tutFig(7)(); }, done: function () { return at(7); } },
    { id: 'majority', title: 'Most followers', say: 'The player with most followers on a road or town takes its points.', why: 'Sending a second follower can win a shared road.', target: cellsEl(['0,0', '1,0', '1,1']) },
    { id: 'tie', title: 'Ties', say: 'If followers are tied for most, everyone tied scores in full.', why: 'A tie never costs you points.', target: cellsEl(['0,0', '1,0', '1,1']) },
    { id: 'place5', title: 'Keep building', say: 'Lay this tile; you need no follower this time.', why: 'Six of the priory’s eight neighbours are down.', target: function () { return tutGlow(9)(); }, done: function () { return at(9); } },
    { id: 'discard', title: 'No fit', say: 'A tile that fits nowhere is swapped for a new one.', why: 'You are never stuck.', target: '#htile' },
    { id: 'place6', title: 'The last tile', say: 'Lay the last tile: it closes the ring around the priory.', why: 'Eight neighbours make the priory score 9.', target: function () { return tutGlow(11)(); }, done: function () { return inFig(11) || (ME() && G.turn > 11) || (ME() && !!G.over); } },
    { id: 'skip', title: 'Or skip', say: 'Nothing to claim here: tap Skip to keep your follower.', why: 'Skipping is always allowed.', target: '#hskip', done: function () { return ME() && !!G.over; } },
    { id: 'priory_done', title: 'Priory scored', say: 'Eight tiles around it: the priory scores 9 and the follower goes home.', why: 'A priory pays the most for the fewest tiles.', target: cellsEl(RING) },
    { id: 'final', title: 'Final scoring', say: 'When the last tile is laid, open roads and towns score 1 per tile.', why: 'Unfinished work still pays a little.', target: cellsEl(['-2,-1', '0,-1']) },
    { id: 'farmers', title: 'Farmers score', say: 'Each farmer scores 3 for every finished town beside his field.', why: 'Farmers are a slow bet that pays at the end.', target: cellsEl(['-2,-1', '0,-1']) },
    { id: 'winner', title: 'Most points wins', say: function () { return !!G && !!G.over ? 'Final score: you ' + G.pl[0].score + ', rival ' + G.pl[1].score + '. Most points wins.' : 'Most points wins.'; }, why: 'That is the whole game.', target: '#seats' },
    { id: 'river', title: 'Extra: the river', say: 'With the River option, river tiles come first and each must continue the river, never turning the same way twice.', why: 'It gives the valley a winding spine.' },
    { id: 'tavern', title: 'Extra: taverns', say: 'With Taverns, a road with an inn scores 2 per tile (0 if left open); a cathedral town scores 3 per tile (0 if open).', why: 'Big rewards, big risk.' },
    { id: 'champion', title: 'Extra: champion', say: 'The champion is a follower that counts as 2 when you fight over a road or town.', why: 'It wins close contests.' },
    { id: 'mason', title: 'Extra: mason and hog', say: 'With Merchants, a mason on your road or town gives an extra turn when it grows; a hog in your field makes each town pay 4, not 3.', why: 'Both need your own follower there first.' },
    { id: 'goods', title: 'Extra: goods', say: 'Whoever finishes a town with goods takes the tokens; at the end, most of each kind scores 10.', why: 'Finishing the town is what earns them.' },
    { id: 'practice', title: 'Your practice', say: 'Open the menu (three dots) and choose New game to play a real one.', why: 'You now know every rule.', target: '#menubtn', done: function () { return !UI.tut && !!G && !G.over && G.turn > 0 && !!document.getElementById('hand'); } }
  ];
  var hud = [
    { sel: '#seats', label: 'Scores', say: 'Every player’s points and the followers they have left.' },
    { sel: '#left', label: 'Tiles left', say: 'How many tiles remain; the game ends when they run out.' },
    { sel: '#bulbbtn', label: 'Hint', say: 'Suggests a move and explains why.' },
    { sel: '#menubtn', label: 'Menu', say: 'New game, sound, music and the rules.' },
    { sel: '#status', label: 'What now', say: 'One line saying what to do this moment.' },
    { sel: '#world .glow', label: 'Valley', say: 'The board: drag it to move, pinch to zoom, tap a glowing square to place your tile.' },
    { sel: '#hand', label: 'Your tile', say: 'Your tile to turn; Place here and Skip appear here.' },
    { sel: '#recentre', label: 'Recentre', say: 'Brings the view back to where you play.' },
    { sel: '.gxf-q', label: 'Help ?', say: 'Reopens this map and the lessons.' }
  ];
  window.floatTutStart = function () {
    try { GXC.close(); } catch (e) { } try { closeMenu(); } catch (e) { } $('#modal').innerHTML = '';
    tutSetup(); F.turned = false;
    try { localStorage.removeItem('gxf-rampart-and-vine'); } catch (e) { }
    GXF.init({ game: 'rampart-and-vine', steps: steps, hud: hud, qParent: '#top' }).open();
  };
  document.addEventListener('pointerdown', function (e) { if (UI.tut && e.target.closest && e.target.closest('#htile')) F.turned = true; }, true);
  addEventListener('gxf', function (e) { if (e.detail && e.detail.type === 'complete') { try { GXT.markDone(TUT_GAME); } catch (x) { } } });
  // starting any other game leaves the practice valley (tutSetup itself passes a fixed stack)
  var ob = beginGame; beginGame = function (o) { if (UI.tut && !(o && o.stack)) { UI.tut = false; UI.tutHold = false; try { GXF.close(); } catch (e) { } } return ob.apply(this, arguments); };
})();
