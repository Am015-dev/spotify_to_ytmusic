TB.ready = new Promise(function (res) { TB._ready = res; });
if (typeof document !== 'undefined') {
  var _boot = function () {
    TB.mount();
    var P = (document.fonts && document.fonts.load) ? Promise.all([document.fonts.load('700 16px "TB Display"'), document.fonts.load('16px "TB Body"'), document.fonts.load('italic 16px "TB Body"')]) : Promise.resolve();
    P.then(function () { TB.clearCache(); TB._ready(true); }, function () { TB._ready(false); });
  };
  if (document.body) _boot(); else document.addEventListener('DOMContentLoaded', _boot);
} else TB._ready(false);
global.TBKit = TB;
