// Art slots: every picture is a NAMED SLOT (assets.json stem). A file media/<stem>.webp that existed at build time fills the slot; else the code placeholder shows. (FLAG: none)
var TTA = (function () {
  var A = (typeof TT_ASSETS !== 'undefined') ? TT_ASSETS : {}, H = (typeof TT_HAVE !== 'undefined') ? TT_HAVE : {};
  var FIT = { card: 'cover', board: 'cover', bg: 'cover', portrait: 'cover', token: 'contain', icon: 'contain', ui: 'contain', fx: 'contain' };
  function url(stem) { return H[stem] || null; }
  // el: the .art element of the slot. Never stretched: cover for pictures that fill their frame, contain for single objects.
  function fill(el, stem) {
    var u = url(stem); if (!u || !el) return false;
    var it = A[stem] || {}, host = el.parentNode;
    var im = new Image(); im.onload = function () { el.style.backgroundImage = 'url("' + u + '")'; el.classList.add(FIT[it.kind] || 'cover'); if (host && host.classList.contains('tok')) { var big = host.offsetWidth >= 110; el.style.backgroundPosition = big ? 'left 3px center' : 'center'; el.style.backgroundSize = big ? 'auto 88%' : 'auto 100%'; if (big) host.style.paddingLeft = (host.offsetHeight + 2) + 'px'; else el.style.opacity = '.3'; }
    if (host) { host.classList.add('has-art'); for (var i = 0; i < host.children.length; i++) { var c = host.children[i]; if (c !== el && !c.style.zIndex && !c.classList.contains('art')) c.style.zIndex = 1; } } }; im.onerror = function () { }; im.src = u; return true;
  }
  return { url: url, fill: fill, items: A, have: H };
})();
