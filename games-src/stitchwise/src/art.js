/* Art slots: every picture is a NAMED slot (assets.json). media/<stem>.webp fills it when present (SW_HAVE), else the code-drawn placeholder shows. */
var ART = { items: {}, have: window.SW_HAVE || [] };
(window.SW_ASSETS && SW_ASSETS.items || []).forEach(function (it) { ART.items[it.stem] = it; });
function artHas(stem) { return ART.have.indexOf(stem) >= 0; }
function artUrl(stem) { return artHas(stem) ? 'media/' + stem + '.webp' : null; }
function artFit(stem) { var it = ART.items[stem]; return it && (it.kind === 'bg' || it.kind === 'board') ? 'cover' : 'contain'; }
function artBg(el, stem) { /* CSS background at the slot's aspect, never stretched */ var u = artUrl(stem); if (!u || !el) return false; el.style.backgroundImage = 'url(' + u + ')'; el.style.backgroundSize = artFit(stem); el.style.backgroundRepeat = 'no-repeat'; el.style.backgroundPosition = 'center'; return true; }
function artImg(stem, cls) { var u = artUrl(stem); if (!u) return null; var i = new Image(); i.src = u; i.alt = ''; i.draggable = false; if (cls) i.className = cls; i.style.objectFit = artFit(stem); return i; }
function fabricStem(pid) { return 'fabric-' + ('0' + (pid + 1)).slice(-2); }
