/* Art slots: every picture the game shows is a NAMED slot (assets.json). games/deep-signal/media/<stem>.webp fills it when present (build.py lists
   the files that exist, so a missing picture is never requested); else the code-drawn placeholder shows. Never stretched: bg/board cover, the rest contain. */
var ART = { items: {}, img: {}, have: window.DS_HAVE || [] };
(window.DS_ASSETS && DS_ASSETS.items || []).forEach(function (it) { ART.items[it.stem] = it; });
function artFit(stem) { var it = ART.items[stem]; return it && (it.kind === 'bg' || it.kind === 'board' || it.kind === 'card' || it.kind === 'portrait') ? 'cover' : 'contain'; }
function artHas(stem) { return !!ART.img[stem]; }
function artApply(root) {
  (root || document).querySelectorAll('[data-art]').forEach(function (e) {
    var s = e.getAttribute('data-art'); if (!ART.img[s] || e.classList.contains('hasart')) return;
    e.style.backgroundImage = 'url(media/' + s + '.webp)'; e.style.backgroundSize = artFit(s); e.style.backgroundRepeat = 'no-repeat'; e.style.backgroundPosition = 'center'; e.classList.add('hasart');
  });
}
function artLoad() {
  ART.have.forEach(function (s) { var im = new Image(); im.onload = function () { ART.img[s] = im; artApply(); }; im.src = 'media/' + s + '.webp'; });
  if (window.MutationObserver) new MutationObserver(function () { if (ART.have.length) artApply(); }).observe(document.body, { childList: true, subtree: true });
}
