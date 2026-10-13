// Cauldron Fair scenarios (see shell/gx-scenario.js): ?scn=<id> builds ONE state directly. Registered before the game scripts run; setup() runs after boot.
(function () {
  if (!window.GXS) return;
  var booted = function () { return typeof G !== 'undefined' && typeof newGame === 'function' && typeof schedule === 'function' && typeof UI !== 'undefined'; };
  var q = function (s) { var b = document.querySelector(s); return b && !b.disabled && b.offsetParent ? b : null; };
  // a plain 3-player game against the computer, coach off, then tap through (draw / stop / continue) until the market of day 2 opens
  function toMarket() {
    try { GXH.setEnabled(false); } catch (e) { }
    window.AIDELAY = 40; newGame('vs', {});
    return GXS.wait(function () {
      var b = q('[data-a=rscont]') || q('.stopb:not(.off)') || q('.bagb:not(.off)') || q('[data-a=mv]');
      if (b && !document.querySelector('.stalls')) b.click();
      return document.querySelector('.stalls');
    }, 60000).then(function () { return quiet(); });
  }
  // no coach bubble over the scene
  function quiet() { try { GXH.setEnabled(false); GXH.hide(); } catch (e) { } return new Promise(function (r) { setTimeout(r, 700); }); }
  GXS.add({
    id: 'cf-board', name: 'Cauldron: draw or stop', ask: 'Can you see Draw and Stop?', seed: 5, when: booted,
    setup: function () {
      try { GXH.setEnabled(false); } catch (e) { }
      window.AIDELAY = 120; newGame('vs', {});
      return GXS.wait(function () { return q('.bagb:not(.off)') || q('[data-a=mv]'); }, 15000).then(function () {
        var b = q('.bagb:not(.off)'); if (b) b.click();
        return GXS.wait(function () { return q('.stopb:not(.off)'); }, 15000);
      }).then(function () { return quiet(); });
    },
    checks: [
      { kind: 'visible', sel: '.bagb', name: 'Draw button' },
      { kind: 'visible', sel: '.stopb', name: 'Stop button' },
      { kind: 'visible', sel: '#acts .meter', name: 'white-chip meter' },
      { kind: 'fn', name: 'buttons are at least 44 px tall', fn: function () { var h = Math.min(document.querySelector('.bagb').getBoundingClientRect().height, document.querySelector('.stopb').getBoundingClientRect().height); return h >= 44 || 'height ' + Math.round(h); } }
    ]
  });
  GXS.add({
    id: 'cf-zoom', name: 'Market: stalls and prices', ask: 'Can you read every stall price?', seed: 5, when: booted,
    setup: toMarket,
    checks: [
      { kind: 'visible', sel: '.awn', name: 'awning with the coin purse' },
      { kind: 'visible', sel: '.stalls .stall', name: 'stall board' },
      { kind: 'fn', name: 'every shown price is >= 12 px', fn: function () { var bad = [].slice.call(document.querySelectorAll('.stall .tok .pc')).filter(function (e) { return parseFloat(getComputedStyle(e).fontSize) < 12; }); return bad.length === 0 || bad.length + ' prices under 12 px'; } },
      { kind: 'fn', name: 'a stall chip is tappable (>= 44 px high)', fn: function () { var t = document.querySelector('.stall .tok:not([disabled])'); if (!t) return 'no buyable chip'; var r = t.getBoundingClientRect(); return (r.width >= 32 && r.height >= 44) || Math.round(r.width) + 'x' + Math.round(r.height); } }
    ]
  });
})();
