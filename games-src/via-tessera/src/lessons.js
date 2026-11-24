// lessons.js: wires the scenario tutor (shell/gx-scenario-tutor.js) to Via Tessera. Scenarios come from window.VTSCN
// (lessons-a.js, lessons-b.js; both optional). ES5. Loaded last, after ui.js.
// Title "Learn to play" and the ? button open the lesson picker (GXST.picker). ?lesson=<id> starts one lesson directly.
(function () {
  'use strict';
  function ready() {
    return typeof VTUI !== 'undefined' && typeof VT !== 'undefined' && typeof G !== 'undefined';
  }
  var go = function () {
    if (!ready()) { setTimeout(go, 200); return; }
    // a lesson is a real game on the real board: never save over the player's game while one runs
    var oSave = save;
    save = function () { if (window.GXST && GXST.active()) return; return oSave.apply(this, arguments); };
    GXST.init({
      game: 'via-tessera',
      scenarios: window.VTSCN || [],
      keepClear: ['.gx-bar', '#hand', '#acts', '#map', '#store', '#prompt'],
      settled: function () { return !VTUI.UI.busy; }
    });
    // ?lesson=<id>: start that lesson directly (after the page has loaded, so the title screen does not cover it)
    var m = /[?&]lesson=([^&#]+)/.exec(location.search);
    if (m) {
      var id = decodeURIComponent(m[1]);
      var launch = function () {
        VTUI.startGame('vs', { lvl: 'easy', seed: 3, first: 0 });
        GXST.start(id);
      };
      if (document.readyState === 'complete') setTimeout(launch, 0);
      else addEventListener('load', function () { setTimeout(launch, 0); });
    }
  };
  setTimeout(go, 200);
})();
