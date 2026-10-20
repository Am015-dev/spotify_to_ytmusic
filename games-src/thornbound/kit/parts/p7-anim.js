/* ===== CSS + reveal / clash animation helpers ===== */
function backSymbols() { return FIDS.map(function (f) { return '<symbol id="tb-back-' + f + '" viewBox="0 0 260 372">' + cardBackInner(f, true) + '</symbol>'; }).join(''); }
CSS = '.tb-card{display:block;filter:drop-shadow(0 3px 5px rgba(0,0,0,.55));font-feature-settings:"lnum"}' +
  '.tb-card text,.tb-map text{font-feature-settings:"lnum"}' +
  '.tb-map{display:block;width:100%;height:auto;-webkit-tap-highlight-color:transparent;user-select:none;-webkit-user-select:none}' +
  '.tb-map .tb-loc{cursor:pointer;outline:none}.tb-map .tb-ring{transform-box:fill-box;transform-origin:center}' +
  '.tb-map .tb-loc:hover .tb-ring,.tb-map .tb-loc:focus-visible .tb-ring{opacity:.85!important}' +
  '.tb-map .tb-loc.tb-hl .tb-ring{opacity:1!important;animation:tb-dash 7s linear infinite,tb-breathe 1.6s ease-in-out infinite}' +
  '.tb-map .tb-loc.tb-sel .tb-ring{opacity:1!important;stroke:#fff;stroke-dasharray:none}' +
  '.tb-map.tb-compact .tb-name{display:none}.tb-map.tb-compact .tb-loc.tb-sel .tb-name,.tb-map.tb-compact .tb-loc.tb-hl .tb-name{display:inline}.tb-map .tb-herald,.tb-map .tb-infl{pointer-events:none}.tb-map .tb-herald,.tb-map .tb-infl{will-change:transform}' +
  '.tb-map .tb-win{animation:tb-breathe 1.2s ease-in-out infinite;transform-box:fill-box;transform-origin:center}' +
  '@keyframes tb-dash{to{stroke-dashoffset:-160}}@keyframes tb-breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.045)}}' +
  '.tb-flipcard{position:relative;display:inline-block;perspective:900px;transition:transform .5s cubic-bezier(.2,.8,.2,1),filter .5s,opacity .5s}' +
  '.tb-flip-inner{position:relative;width:100%;height:100%;transform-style:preserve-3d;transition:transform .62s cubic-bezier(.3,.7,.2,1)}' +
  '.tb-flipcard.tb-up .tb-flip-inner{transform:rotateY(180deg)}' +
  '.tb-face{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden}.tb-face .tb-card{filter:none}' +
  '.tb-face.tb-front{transform:rotateY(180deg)}.tb-flipcard{filter:drop-shadow(0 4px 6px rgba(0,0,0,.55))}' +
  '.tb-flipcard.tb-winner{transform:translateY(-8px) scale(1.06);filter:drop-shadow(0 0 10px #ffe9a0) drop-shadow(0 0 22px rgba(255,200,90,.8));z-index:2}' +
  '.tb-flipcard.tb-loser{transform:scale(.94);filter:grayscale(.7) brightness(.6) drop-shadow(0 2px 3px rgba(0,0,0,.6))}' +
  '.tb-flipcard.tb-tied{filter:drop-shadow(0 0 10px #c9d0ff)}' +
  '.tb-clash{display:flex;gap:14px;align-items:flex-end;justify-content:center;flex-wrap:wrap;position:relative}' +
  '.tb-clash-col{display:flex;flex-direction:column;align-items:center;gap:6px;font:700 14px/1.1 ' + DISPLAY + ';color:#f1d98a;text-align:center}' +
  '.tb-clash-col .tb-str{font-size:22px;color:#fff4cf;text-shadow:0 1px 2px #000;min-height:26px;opacity:0;transition:opacity .4s}' +
  '.tb-clash-col.tb-shown .tb-str{opacity:1}' +
  '.tb-clash-spark{position:absolute;left:50%;top:44%;width:56px;height:56px;margin:-28px 0 0 -28px;pointer-events:none;opacity:0;transform:scale(.3)}' +
  '.tb-clash-spark.tb-go{animation:tb-spark .9s ease-out}' +
  '@keyframes tb-spark{0%{opacity:0;transform:scale(.3) rotate(-30deg)}35%{opacity:1;transform:scale(1.25) rotate(8deg)}100%{opacity:0;transform:scale(1.6) rotate(0)}}' +
  '.tb-crown-pop{position:absolute;left:50%;top:-22px;width:44px;margin-left:-22px;animation:tb-pop .5s cubic-bezier(.2,1.6,.3,1) both;pointer-events:none}' +
  '@keyframes tb-pop{from{opacity:0;transform:translateY(14px) scale(.3)}to{opacity:1;transform:none}}' +
  '@media (prefers-reduced-motion:reduce){.tb-flip-inner,.tb-flipcard{transition-duration:.01s}.tb-map .tb-loc.tb-hl .tb-ring,.tb-map .tb-win{animation:none}}';
function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
/* flipCard(spec,size) -> element, starts face-down; .flip() / .unflip() return Promises; .isUp() */
TB.flipCard = function (spec, size) {
  TB.mount(); var w = sizeToW(size), h = Math.round(w * CH / CW), d = document.createElement('div'); d.className = 'tb-flipcard'; d.style.width = w + 'px'; d.style.height = h + 'px';
  var inner = document.createElement('div'); inner.className = 'tb-flip-inner'; var b = document.createElement('div'); b.className = 'tb-face tb-back'; var f = document.createElement('div'); f.className = 'tb-face tb-front';
  var fs = {}; for (var k in spec) fs[k] = spec[k]; fs.faceDown = false;
  b.appendChild(TB.card({ faceDown: true, faction: spec.faction }, w)); f.appendChild(TB.card(fs, w)); inner.appendChild(b); inner.appendChild(f); d.appendChild(inner);
  d.flip = function () { d.classList.add('tb-up'); return sleep(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches ? 20 : 640); };
  d.unflip = function () { d.classList.remove('tb-up'); return sleep(640); };
  d.isUp = function () { return d.classList.contains('tb-up'); };
  d.setResult = function (r) { d.classList.remove('tb-winner', 'tb-loser', 'tb-tied'); if (r) d.classList.add('tb-' + r); };
  return d;
};
/* clash(entries,{stagger,sparkParent,tie}) entries: [{el: flipCard element, winner:bool, col?: wrapper to mark}] -> Promise.
   Flips every card in turn, plays a spark, then lifts + glows the winner(s) and dims the rest. */
TB.clash = function (entries, o) {
  o = o || {}; var st = o.stagger != null ? o.stagger : 420, p = Promise.resolve(), parent = o.sparkParent;
  entries.forEach(function (en) { p = p.then(function () { return en.el.flip(); }).then(function () { if (en.col) en.col.classList.add('tb-shown'); return sleep(st); }); });
  return p.then(function () {
    if (parent) { var sp = parent.querySelector('.tb-clash-spark'); if (sp) { sp.classList.remove('tb-go'); void sp.offsetWidth; sp.classList.add('tb-go'); } }
    return sleep(350);
  }).then(function () {
    var any = entries.some(function (e) { return e.winner; });
    entries.forEach(function (en) { en.el.setResult(any ? (en.winner ? 'winner' : 'loser') : (o.tie ? 'tied' : null)); if (en.winner) { var c = TB.token('winner', {}, 44); c.classList.add('tb-crown-pop'); en.el.appendChild(c); } });
    return sleep(500);
  });
};
/* clashPanel(container,[{faction,name,card:spec,strength,winner}],{size,run:true}) -> {el, play():Promise, reset()} */
TB.clashPanel = function (container, items, o) {
  o = o || {}; TB.mount(); var size = o.size || 110, root = document.createElement('div'); root.className = 'tb-clash';
  var ents = items.map(function (it) {
    var col = document.createElement('div'); col.className = 'tb-clash-col'; var nm = document.createElement('div'); nm.textContent = it.name || fac(it.faction).short;
    var fc = TB.flipCard(it.card || { faction: it.faction, title: '?', value: it.strength, type: 'unit', art: 'knight' }, size); var str = document.createElement('div'); str.className = 'tb-str'; str.textContent = it.strength != null ? it.strength : '';
    col.appendChild(fc); col.appendChild(str); col.appendChild(nm); root.appendChild(col); return { el: fc, winner: !!it.winner, col: col };
  });
  var sp = document.createElement('div'); sp.className = 'tb-clash-spark'; sp.appendChild(TB.token('clash', {}, 56)); root.appendChild(sp);
  if (container) container.appendChild(root);
  var api = { el: root, play: function () { return TB.clash(ents, { sparkParent: root, tie: !!o.tie, stagger: o.stagger }); }, reset: function () { ents.forEach(function (e) { e.el.classList.remove('tb-up'); e.el.setResult(null); e.col.classList.remove('tb-shown'); var c = e.el.querySelector('.tb-crown-pop'); if (c) c.remove(); }); } };
  if (o.run) setTimeout(api.play, o.delay || 400);
  return api;
};
