/* Gloamwar staged first turn (gx-tutor.js): fixed seed and fixed first dice. Teaches the goal, the Company, dice, politics, armies and cards. */
var TUT_DICE = { D: ['C', 'M', 'X', 'E'], G: ['A', 'M', 'C', 'E', 'X', 'A', 'M'] };
function startTutorial() {
  var q = function (s) { return function () { return document.querySelector(s); }; };
  var die = function (f) { return function () { return document.querySelector('#mydice .die[data-f="' + f + '"]:not(.used)'); }; };
  var act = function (k) { return function () { return document.querySelector('#acts .act[data-key="' + k + '"]'); }; };
  var myTurn = function () { return G && G.phase === 'act' && sideToAct(G) === 'D' && !G.pend && !UI.hold; };
  try { if (GXT.active()) GXT.stop(); } catch (e) { }
  GXT.start({ game: 'gloamwar',
    setup: function () { startGame({ side: 'D', level: 'easy', seed: 4242, mode: 'tut', dice: TUT_DICE }); },
    live: function () { return [document.getElementById('battle'), document.getElementById('acts')]; },
    steps: [
      { id: 'company', title: 'The Company', say: 'This lantern is the Company. It carries the Hollow Crown.', target: q('#company'), wait: null },
      { id: 'kiln', title: 'Your goal', say: 'Walk it to the Kiln, the red mountain in the south-east.', target: function () { MV.focus('cinderplain'); return document.getElementById('rg-cinderplain'); }, wait: null },
      { id: 'lose', title: 'The danger', say: 'The Hunt adds taint. At 12 taint the Gloam wins.', target: q('#cT'), wait: null, onNext: function () { MV.focus('lanternvale'); } },
      { id: 'phase', title: 'Company phase', say: 'Each turn starts here. Tap Keep moving.', target: act('cdone'), wait: { type: 'tap', match: function (a) { return a.what === 'act' && a.key === 'cdone'; } } },
      { id: 'dice', title: 'Action dice', say: 'These are your dice. The Gloam rolled the small red ones.', target: q('#mydice'), ready: myTurn, wait: null },
      { id: 'char', title: 'Character die', say: 'Tap the hooded Character die.', target: die('C'), ready: myTurn, wait: { type: 'tap', match: function (a) { return a.what === 'die' && a.f === 'C'; } } },
      { id: 'move', title: 'Move on', say: 'Move the Company one step. A hunt 6 finds it.', target: act('cmove'), wait: { type: 'tap', match: function (a) { return a.what === 'act' && a.key === 'cmove'; } } },
      { id: 'rival', title: 'Rival turn', say: 'You take turns, one die each. Watch the Gloam move.', target: q('#msg'), ready: myTurn, wait: null },
      { id: 'muster', title: 'Muster die', say: 'Tap the Muster die with the scroll.', target: die('M'), ready: myTurn, wait: { type: 'tap', match: function (a) { return a.what === 'die' && a.f === 'M'; } } },
      { id: 'stir', title: 'Stir a nation', say: 'Tap Stir a nation. Only nations at war can attack.', target: act('dip'), wait: { type: 'tap', match: function (a) { return a.what === 'act' && String(a.key).indexOf('dip') === 0; } } },
      { id: 'stir2', title: 'Aurelmont', say: 'Pick Aurelmont, the white-walled kingdom.', target: function () { return act('dip-au')() || document.querySelector('#acts .act[data-key^="dip-"]'); }, ready: function () { return !!document.querySelector('#acts .act[data-key^="dip-"]') || G.used.D[1]; }, wait: { type: 'tap', match: function (a) { return a.what === 'act' && String(a.key).indexOf('dip-') === 0; } } },
      { id: 'nations', title: 'Nations', say: 'The Nations tab shows how close each nation is to war.', target: q('#tNat'), ready: myTurn, wait: null },
      { id: 'army', title: 'Army die', say: 'Tap the helmet die: Muster or Army.', target: die('X'), ready: myTurn, wait: { type: 'tap', match: function (a) { return a.what === 'die' && a.f === 'X'; } } },
      { id: 'march', title: 'March', say: 'Tap Move armies. Then tap an army and a glowing region.', target: act('amove'), wait: { type: 'tap', match: function (a) { return a.what === 'act' && (a.key === 'amove' || a.key === 'recruit'); } } },
      { id: 'event', title: 'Event die', say: 'Last die: the Event die draws or plays a card.', target: die('E'), ready: myTurn, wait: { type: 'tap', match: function (a) { return a.what === 'die' && a.f === 'E'; } } },
      { id: 'draw', title: 'Cards', say: 'Tap Draw a card. Cards also fight in battles.', target: act('draw'), wait: { type: 'tap', match: function (a) { return a.what === 'act' && (String(a.key).indexOf('draw') === 0 || a.key === 'card'); } } },
      { id: 'draw2', title: 'Two decks', say: 'Character cards help heroes. Strategy cards help armies.', target: function () { return act('draw-DS')() || document.querySelector('#acts .act[data-key^="draw-"]'); }, ready: function () { return !!document.querySelector('#acts .act[data-key^="draw-"]'); }, wait: { type: 'tap', match: function (a) { return a.what === 'act' && String(a.key).indexOf('draw-') === 0; } } },
      { id: 'end', title: 'Your war', say: 'The bulb suggests moves. Rules are under the ? button.', target: q('#bulbbtn'), wait: null }],
    endTitle: 'You know the basics', endText: 'Hide the Company, wake the nations, and reach the Kiln.',
    onDone: function () { ls('gw-played', 1); UI.mode = 'quick'; step(); },
    onExit: function () { ls('gw-played', 1); showTitle(); } });
}
