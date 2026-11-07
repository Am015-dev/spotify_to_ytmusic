/* Art slots: every picture the game shows is a NAMED slot (assets.json). media/<stem>.webp fills it when present, else the code-drawn placeholder shows. */
var ART = { items: {}, img: {}, have: window.RR_HAVE || [], on: [] };
(window.RR_ASSETS && RR_ASSETS.items || []).forEach(function (it) { ART.items[it.stem] = it; });
function artFit(stem) { var it = ART.items[stem]; return it && (it.kind === 'bg' || it.kind === 'board') ? 'cover' : 'contain'; }
function artGet(stem) { return ART.img[stem] || null; }
function artDraw(ctx, stem, x, y, w, h, fit) {   /* canvas: draws the picture at the slot's size and aspect (cover crops, contain letterboxes), never stretched */
  var im = ART.img[stem]; if (!im) return false; fit = fit || artFit(stem);
  var r = Math.max(w / im.width, h / im.height); if (fit === 'contain') r = Math.min(w / im.width, h / im.height);
  var dw = im.width * r, dh = im.height * r;
  ctx.save(); if (fit === 'cover') { ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); }
  ctx.drawImage(im, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh); ctx.restore(); return true;
}
function artApply(root) {   /* DOM: any [data-art] element gets the file as its background once loaded */
  (root || document).querySelectorAll('[data-art]').forEach(function (e) {
    var s = e.getAttribute('data-art'), im = ART.img[s];
    if (im) { e.style.backgroundImage = 'url(media/' + s + '.webp)'; e.style.backgroundSize = artFit(s); e.style.backgroundRepeat = 'no-repeat'; e.style.backgroundPosition = 'center'; e.classList.add('hasart'); }
  });
}
function artLoad(done) {
  ART.have.forEach(function (s) {
    var im = new Image(); im.onload = function () { ART.img[s] = im; artApply(); if (window.UI && UI.redraw) UI.redraw(); }; im.src = 'media/' + s + '.webp';
  });
}
