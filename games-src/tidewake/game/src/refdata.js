// Component reference for Tidewake in the shared GX.reference format. JSON-safe, so node can read it too:
//   node -e "require('./src/data.js-like globals'); TWRef.sections(D)"  where D = {BASE_PATHS, EXTRA_TYPES, LEV, SHIP_NAMES}
// Pictures are drawn by the page (ui8.js) from item.pic; nothing here touches the DOM.
var TWRef = (function () {
  var SIDE = ['top', 'top', 'right', 'right', 'bottom', 'bottom', 'left', 'left'];
  var DIRW = { N: 'north', E: 'east', S: 'south', W: 'west' };
  // a current layout: 4 wake lines, each straight across, a turn to the next side, or a U-turn back to the same side
  function shape(paths) {
    var st = 0, tu = 0, ut = 0;
    paths.forEach(function (p) { var a = p[0] >> 1, b = p[1] >> 1, d = (b - a + 4) % 4; if (d === 0) ut++; else if (d === 2) st++; else tu++; });
    return { st: st, tu: tu, ut: ut };
  }
  function n(k, one, many) { return k + ' ' + (k === 1 ? one : many); }
  function sections(D) {
    var cnt = function (t) { return 1 + (D.EXTRA_TYPES.indexOf(t) >= 0 ? 1 : 0); };
    var cur = D.BASE_PATHS.map(function (ps, t) {
      var s = shape(ps), bits = [], tags = ['Current'];
      if (s.st) { bits.push(n(s.st, 'straight line', 'straight lines')); tags.push('Straight lines'); }
      if (s.tu) { bits.push(n(s.tu, 'turn', 'turns')); tags.push('Turns'); }
      if (s.ut) { bits.push(n(s.ut, 'U-turn', 'U-turns')); tags.push('U-turns'); }
      if (cnt(t) > 1) tags.push('In the pile twice');
      return { id: 'cur' + (t + 1), name: 'Current #' + (t + 1), count: cnt(t), tags: tags,
        meta: 'Current tile · turn it any of 4 ways',
        text: 'Four wake lines: ' + bits.join(', ') + '. A junk entering one end sails out of the other' + (s.ut ? '; a U-turn sends it back out on the side it came in.' : '.'),
        pic: { cur: t } };
    });
    var lev = D.LEV.map(function (L) {
      var faces = L.arr.map(function (a, i) { return (i + 1) + ': ' + (a === 'R' ? 'quarter turn ' + (L.rd > 0 ? 'clockwise' : 'counter-clockwise') : 'swims ' + DIRW[a]); });
      return { id: 'lev' + L.id, name: L.nm, count: 1, tags: ['Leviathan'].concat(L.gold ? ['Gold arrow'] : []),
        meta: 'Move order ' + L.order + (L.gold ? ' · gold arrow wins ties' : ''),
        text: 'Wakes on a total of 6, 7 or 8 and rolls one die. ' + faces.join(' · ') + ' · 6: stays, and another leviathan rises. The arrows are shown with the tile facing north; they turn with it.',
        pic: { lev: L.id } };
    });
    var exp = [
      { id: 'gate', name: 'Rift Gate', count: 1, tags: ['Expansion', 'Current pile'], meta: 'Expansion · in the current pile',
        text: 'Play it instead of a current, or to escape a sinking. It stays on its square all game. Junks and leviathans that touch it are thrown to a square rolled on the dice.', pic: { ex: 'gate' } },
      { id: 'wave', name: 'Rogue Wave', count: 1, tags: ['Expansion', 'Leviathan pile'], meta: 'Expansion · in the leviathan pile, with a blue edge marker',
        text: 'Sweeps one row or column and moves one square each round. A junk in its line rolls a die and capsizes unless it reaches the strength: 2, then 3, then 4.', pic: { ex: 'wave' } },
      { id: 'mael', name: 'Maelstrom', count: 1, tags: ['Expansion', 'Leviathan pile'], meta: 'Expansion · in the leviathan pile',
        text: 'A whirlpool that moves on calm rolls (not 6 to 8): die 1 east, 2 south, 3 west, 4 north, 5 or 6 stays. It destroys the tile, junk or leviathan it enters; destroyed tiles leave the game.', pic: { ex: 'mael' } },
      { id: 'cannon', name: 'Deck Cannon', count: 5, tags: ['Expansion', 'Current pile'], meta: 'Expansion · in the current pile, at most two per hand',
        text: 'Fire it when a leviathan is about to sink your junk (even out of turn), or on your turn instead of a tile against a leviathan next to your front square. The leviathan goes to the bottom of its pile.', pic: { ex: 'cannon' } }
    ];
    var board = [
      { id: 'junk', name: 'Junks', count: 8, tags: ['Board'], meta: 'One per captain',
        text: 'Your ship. It never steers itself: it sails along the wake of the tile laid in front of it. It sinks off the edge, in a leviathan\'s square or on another junk\'s wake. Colours: ' + D.SHIP_NAMES.join(', ') + '.', pic: { junk: 1 } },
      { id: 'dice', name: 'Dice', count: 2, tags: ['Board'], meta: 'Rolled at the start of every turn',
        text: 'A total of 6, 7 or 8 wakes every leviathan. They also pick squares: the gold die is the column and the blue die is the row where a leviathan rises or a rift sends a piece.', pic: { dice: 1 } },
      { id: 'marks', name: 'Gold start marks', tags: ['Board'], meta: 'On the outer edge',
        text: 'Where junks start. The numbers 1 to 6 along each edge name them; each number has two marks.', pic: { mark: 'start' } },
      { id: 'route', name: 'Gold route line', tags: ['Board', 'Help'], meta: 'Shown while you choose a tile',
        text: 'The exact path your junk will sail, with a flag where it stops. It turns red when that move would sink you.', pic: { mark: 'route' } },
      { id: 'frames', name: 'Teal frames', tags: ['Board', 'Help'], meta: 'Shown when you must choose a square',
        text: 'The squares you may choose right now.', pic: { mark: 'frame' } }
    ];
    return [
      { id: 'currents', title: 'Currents', items: cur },
      { id: 'leviathans', title: 'Leviathans', items: lev },
      { id: 'expansion', title: 'Expansion', items: exp },
      { id: 'board', title: 'Board', items: board }
    ];
  }
  return { sections: sections, shape: shape };
})();
if (typeof module !== 'undefined') module.exports = TWRef;
