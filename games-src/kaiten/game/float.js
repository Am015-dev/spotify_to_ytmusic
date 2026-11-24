// Kaiten Kitchen: worked example of the floating tutorial kit (shell/gx-float.js). Off by default: open the game with ?gxf=1.
(function () {
  if (!/[?&]gxf=1/.test(location.search) || !window.GXF) return;
  var me = function () { return typeof viewSeat === 'function' ? viewSeat() : 0; };
  var steps = [
    { id: 'pick', title: 'Take a dish', say: 'Tap a dish on the belt to take it.', why: 'Each turn every diner takes one dish from the hand in front of them.', target: '#belt .hc[data-id]',
      done: function () { return !!G && (G.turn > 1 || !!G.players[me()].picked); } },
    { id: 'tray', title: 'Your tray', say: 'Dishes you take land on your tray and score at the end of the round.', why: 'Sets and pairs score more than single dishes.', target: '#tbl' },
    { id: 'pass', title: 'Hands pass on', say: 'The belt moves on: take another dish from the new hand.', why: 'You see what rivals left, so you can block what they want.', target: '#belt .hc[data-id]',
      done: function () { return !!G && G.turn > 2; } },
    { id: 'rivals', title: 'Rivals and scores', say: 'Tap Diners to see every tray and score.', why: 'Watch what they collect before you pick.', target: '[data-gx="rivald"]' },
    { id: 'hint', title: 'Ask for a hint', say: 'The bulb suggests a good dish whenever you are stuck.', why: 'It explains why, so you learn the scoring.', target: '#bulbbtn' }
  ];
  var hud = [
    { sel: '#barstat', label: 'Round', say: 'The round and turn you are on.' },
    { sel: '#barprompt', label: 'What now', say: 'One line telling you what to do this moment.' },
    { sel: '[data-gx="rivald"]', label: 'Diners', say: 'Every diner\u2019s tray and score.' },
    { sel: '#bulbbtn', label: 'Hint', say: 'Suggests a good dish and says why.' },
    { sel: '[data-gx="logd"]', label: 'Log', say: 'Everything that happened so far.' },
    { sel: '[data-gx="rulesd"]', label: 'Rules', say: 'The full rules, any time.' },
    { sel: '[data-gx="setd"]', label: 'Menu', say: 'New game, sound and settings.' },
    { sel: '.gxf-q', label: 'Help ?', say: 'Reopens this map and the lessons.' },
    { sel: '#belt', label: 'Belt', say: 'Your hand of dishes; tap one to take it.' },
    { sel: '#tbl', label: 'Trays', say: 'The dishes each diner has taken this round.' },
    { sel: '#dock', label: 'Panel', say: 'Round track, diners and your actions.' }
  ];
  var ready = function () { return typeof G !== 'undefined' && typeof newGame === 'function' && typeof UI !== 'undefined' && typeof render === 'function'; };
  var go = function () {
    if (!ready()) { setTimeout(go, 200); return; }
    try { GX.close(); } catch (e) { } try { GXH.setEnabled(false); } catch (e) { }
    try { goalCard.seen = 1; } catch (e) { }
    UI.seed = 5; newGame('vs'); UI.coach.level = 'off'; UI.coach.userOff = true; render();
    try { localStorage.removeItem('gxf-kaiten'); } catch (e) { }   // the demo always starts fresh
    GXF.init({ game: 'kaiten', steps: steps, hud: hud }).open();
  };
  setTimeout(go, 300);
})();
