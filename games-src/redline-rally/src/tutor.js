/* Redline Rally first-game guide (shared tutor games-src/shell/gx-tutor.js, see GX-KIT.md section 10): one staged round that teaches the core decision
   (push through a corner and burn heat, or brake and keep it) by doing it. Fixed hand, car parked 3 spaces before the first corner (limit 5). Never saved. */
var TUT_GAME = 'redline-rally';
function tutOn() { return typeof GXT !== 'undefined' && GXT.active() && UI.mode === 'tutorial'; }
function firstTime() { return !lsGet('rr_seen') && !(typeof GXT !== 'undefined' && GXT.isDone(TUT_GAME)); }
function tutBtn(cls, o) { return typeof GXT === 'undefined' ? '' : GXT.menuHTML(Object.assign({ game: TUT_GAME, first: firstTime(), cls: cls, launch: function () { tutStart(); } }, o || {})); }
function stageTutorial() {   /* fixed hand 1 2 2 3 4 3 1; the rest of the deck stays valid so the engine invariants hold */
  var c = G.cars[0], want = ['1', '2', '2', '3', '4', '3', '1'], rest = c.deck.concat(c.hand, c.disc);
  want.forEach(function (w) { var k = rest.indexOf(w); if (k >= 0) rest.splice(k, 1); });
  c.hand = want.slice(); c.deck = rest; c.disc = []; c.pos = 11; c.gear = 1; UI.gear = 1; UI.vis[0].p = 11; UI.focus = 0; snapCam(); UI.redraw();
}
function tutSteps() {
  var isCard = function (a, ids) { return a.what === 'card' && ids.indexOf(a.i) >= 0; };
  return [
    { id: 'goal', title: 'Win the race', say: 'First across the line wins. Each round pick a gear, play that many cards, and the total is your speed.', target: function () { return $('#cvw'); }, wait: null, side: 'bottom' },
    { id: 'gear', title: 'Pick a gear', say: 'Gear 2 means you play two cards. Tap gear 2.', target: function () { return document.querySelector('.gb[data-g="2"]'); }, wait: { type: 'tap', match: function (a) { return a.what === 'gear' && a.g === 2; } }, wrong: 'Tap gear 2.', side: 'top' },
    { id: 'push', title: 'Push hard', say: 'A corner is ahead with limit 5. Go fast: tap the 4 and the 3.', target: function () { return $('#hand'); }, wait: { type: 'tap', times: 2, match: function (a) { return isCard(a, [3, 4]); } }, wrong: 'Tap the 4 and the 3.', side: 'top' },
    { id: 'burn', title: 'The cost', say: 'Over the limit, every point burns one heat from your engine. No heat left means a spin out.', target: function () { return $('#msg'); }, wait: null, side: 'top' },
    { id: 'brake', title: 'Or brake', say: 'Safer: tap the two 2s instead. Speed 4 stays under the limit.', target: function () { return $('#hand'); }, wait: { type: 'tap', times: 2, match: function (a) { return isCard(a, [1, 2]); } }, wrong: 'Tap the two 2s.', side: 'top' },
    { id: 'go', title: 'Go!', say: 'Speed 4 is safe, no heat burned. Tap Go!', target: function () { return $('#goB'); }, ready: function () { return UI.sel.length === 2 && UI.sel.indexOf(1) >= 0 && UI.sel.indexOf(2) >= 0 && !$('#goB').disabled; }, wait: { type: 'tap', match: function (a) { return a.what === 'go'; } }, side: 'top' },
    { id: 'heat', title: 'Heat is your fuel', say: 'Brake and keep heat, or push and burn it. Gears 1 and 2 cool heat back. That is the game.', target: function () { return $('#tray'); }, ready: function () { return G && G.round >= 2 && !UI.busy && !!$('#tray'); }, wait: null, side: 'top' }
  ];
}
function tutStart() {
  closeModal();
  GXT.start({
    game: TUT_GAME, setup: function () { UI.mode = 'tutorial'; startGame({ track: 'sunline', laps: 1, opp: 2, hum: 1, diff: 'easy', seed: 12, tut: true }); },
    steps: tutSteps(), story: false, endTitle: 'You can race', endText: 'Brake to keep heat, push when it pays. See you on the grid.',
    onDone: function () { UI.mode = ''; lsSet('rr_seen', '1'); showTitle(); }, onExit: function () { UI.mode = ''; lsSet('rr_seen', '1'); showTitle(); }
  });
}
