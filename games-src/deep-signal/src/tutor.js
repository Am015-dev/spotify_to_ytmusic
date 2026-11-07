/* The staged first dive (gx-tutor.js): a fixed deal, one task, one signal, one trick. Offered on first launch, in the menus and as Story mission 1. */
var TUT_DEAL = [['r4', 'c9', 'c8', 'k2', 'k5', 't3', 't6', 'a4', 'a7', 'r1'], ['c7', 'k9', 'k7', 't9', 't8', 'a9', 'a8', 'r3', 'k3', 't1'],
  ['c1', 'c2', 'c3', 'k1', 'k4', 't2', 't4', 'a1', 'a2', 'r2'], ['c4', 'c5', 'c6', 'k6', 'k8', 't5', 't7', 'a3', 'a5', 'a6']];
function startTutorial(fromStory) {
  var q = function (s) { return function () { return document.querySelector(s); }; };
  try { if (GXT.active()) GXT.stop(); } catch (e) { }
  GXT.start({ game: 'deep-signal', story: true,
    setup: function () { startGame({ players: 4, mission: 1, seed: 7, deal: TUT_DEAL, taskCards: ['c7'], mode: 'tut', tut: { sig: { p: 1, c: 'c7' }, only: 'c9' } }); },
    steps: [
      { id: 'crew', title: 'One crew', say: 'Welcome aboard the Lanternfish. Your crew wins or loses together.', target: q('#seat2'), wait: null },
      { id: 'task', title: 'Take the task', say: 'This is a task card. Tap it to take it.', target: q('#pool .tcard'), wait: { type: 'tap', match: function (a) { return a.what === 'task'; } } },
      { id: 'mine', title: 'Your job', say: 'Win the trick that holds Coral 7 and the mission is done.', target: q('#mytasks'), ready: function () { return G && G.tasks.length === 1 && G.phase === 'play'; }, wait: null },
      { id: 'sig', title: 'A signal', say: 'Ines signals: Coral 7 is her only Coral card.', target: q('#seat1'), ready: function () { return G && !!G.comm[1]; }, wait: null },
      { id: 'sigb', title: 'Your signal', say: 'You get one signal per mission too: highest, only or lowest of a colour.', target: q('#sigB'), wait: null },
      { id: 'order', title: 'Order marks', say: 'Later missions put 1, 2, 3 or Ω on tasks: do them in that order. Ω comes last.', target: q('#mtrick'), wait: null },
      { id: 'flare', title: 'The flare', say: 'Before trick 1 the crew may send one flare: everyone passes a card. It costs a star.', target: q('#flareB'), wait: null },
      { id: 'cap', title: 'Captain leads', say: 'You hold Sonar 4, so you are captain and lead first. Sonars beat colours.', target: q('#hand .cd[data-c="r4"]'), wait: null },
      { id: 'lead', title: 'Lead high', say: 'Lead Coral 9, the highest Coral. Tap it.', target: q('#hand .cd[data-c="c9"]'), ready: function () { return G && sideToAct(G) === 0 && !UI.hold; }, wait: { type: 'tap', match: function (a) { return a.what === 'card' && a.id === 'c9'; } }, wrong: 'Tap the glowing Coral 9.' },
      { id: 'follow', title: 'Follow suit', say: 'Everyone must play Coral if they can. Ines has to give you Coral 7.', target: q('#seat1'), wait: { type: 'event', match: function (a) { return a.what === 'trick'; } }, pending: 'Watch the trick' },
      { id: 'stamp', title: 'Mission complete', say: 'Coral 7 fell to the right diver. That is the whole game: plan it together.', target: q('#seat2'), wait: { type: 'event', match: function (a) { return a.what === 'done'; } }, pending: 'Watch the board' }],
    endButtons: fromStory ? [{ id: 'chapter', label: 'Continue the logbook' }] : null,
    endTitle: 'You know the rules', endText: 'Missions add more tasks, order marks and special rules.',
    onDone: function (r) { ls('ds-played', 1); var c = r && r.choice; if (fromStory && window.GXC && GXC.active()) { GXC.finish(G); return; } if (c === 'story') { $('#title').classList.remove('on'); GXC.open(); } else showSetup(); },
    onExit: function () { ls('ds-played', 1); showTitle(); } });
}
