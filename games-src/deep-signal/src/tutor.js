/* The staged first dive (gx-tutor.js): a fixed deal, one task, one signal, one trick. Offered on first launch, in the menus and as Story mission 1. */
var TUT_DEAL = [['r4', 'c9', 'c8', 'k2', 'k5', 't3', 't6', 'a4', 'a7', 'r1'], ['c7', 'k9', 'k7', 't9', 't8', 'a9', 'a8', 'r3', 'k3', 't1'],
  ['c1', 'c2', 'c3', 'k1', 'k4', 't2', 't4', 'a1', 'a2', 'r2'], ['c4', 'c5', 'c6', 'k6', 'k8', 't5', 't7', 'a3', 'a5', 'a6']];
function startTutorial(fromStory) {
  var q = function (s) { return function () { return document.querySelector(s); }; };
  try { if (GXT.active()) GXT.stop(); } catch (e) { }
  GXT.start({ game: 'deep-signal', story: true,
    setup: function () { startGame({ players: 4, mission: 1, seed: 7, deal: TUT_DEAL, taskCards: ['c7'], mode: 'tut', tut: { sig: { p: 1, c: 'c7' }, only: 'c9' } }); },
    steps: [
      { id: 'task', title: 'Take the task', say: 'Your crew wins or loses together. This task card says: win Coral 7. Tap it to take it.', target: q('#pool .tcard'), wait: { type: 'tap', match: function (a) { return a.what === 'task'; } } },
      { id: 'sig', title: 'A crewmate\u2019s signal', say: 'Ines shows a card: Coral 7 is her ONLY Coral. So she must play it when Coral is led.', target: q('#seat1'), ready: function () { return G && !!G.comm[1] && G.phase === 'play'; }, wait: null },
      { id: 'lead', title: 'Lead high', say: 'You lead first. Coral 9 is the highest Coral: tap it.', target: q('#hand .cd[data-c="c9"]'), ready: function () { return G && sideToAct(G) === 0 && !UI.hold; }, wait: { type: 'tap', match: function (a) { return a.what === 'card' && a.id === 'c9'; } }, wrong: 'Tap the glowing Coral 9.' },
      { id: 'follow', title: 'Follow the colour', say: 'Everyone must play Coral if they can. Watch: Ines has to give you Coral 7.', target: q('#seat1'), wait: { type: 'event', match: function (a) { return a.what === 'trick'; } }, pending: 'Watch the trick' },
      { id: 'stamp', title: 'Mission complete', say: 'Your Coral 9 was highest, so you won Coral 7. That is the whole game.', target: q('#seat2'), wait: { type: 'event', match: function (a) { return a.what === 'done'; } }, pending: 'Watch the board' }],
    endButtons: fromStory ? [{ id: 'chapter', label: 'Continue the logbook' }] : null,
    endTitle: 'You know the rules', endText: 'Missions add more tasks, order marks and special rules.',
    onDone: function (r) { ls('ds-played', 1); var c = r && r.choice; if (fromStory && window.GXC && GXC.active()) { GXC.finish(G); return; } if (c === 'story') { $('#title').classList.remove('on'); GXC.open(); } else showSetup(); },
    onExit: function () { ls('ds-played', 1); showTitle(); } });
}
