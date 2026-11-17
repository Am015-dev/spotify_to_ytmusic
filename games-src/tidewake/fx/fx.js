// Tidewake pixel effects: runtime (flag, one canvas layer, one finite loop, event hooks). Our own code.
// OFF by default: on only with ?fx=1 in the address (the Menu then shows an "Effects" toggle; ?fx=0 shows it too, starting off).
// Never runs with prefers-reduced-motion: reduce, or with the game's own "Animations off".
// The layer is one <canvas> in #board, under the overlay labels (#ov) and chips, pointer-events:none, drawn at 2 CSS px per pixel.
// Each effect plays once per game event and stops; the loop stops when the last effect is done (hard cap 4 s per effect).
// Effects: rain.js (ported, MIT) when a Rogue Wave arrives or moves; spray.js (ours) where a junk sinks.
(function (g) {
  'use strict';
  var P = g.TWFXPX, PX = P.PX, CAP = 4;
  var q = ''; try { q = new URLSearchParams(location.search).get('fx'); } catch (e) {}
  var F = { on: q === '1', menu: q === '1' || q === '0', list: [], raf: 0, cv: null, cx: null, img: null, w: 0, h: 0, last: 0, n: 0,
    st: { frames: 0, played: 0, cost: [], skipped: 0 } };
  function reduced() { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } }
  function allowed() { return F.on && !reduced() && !(typeof ANIM !== 'undefined' && !ANIM) && !!document.getElementById('board'); }
  function proj() { try { return typeof ovMakeProj === 'function' ? ovMakeProj() : null; } catch (e) { return null; } }
  function layer() {
    var bd = document.getElementById('board'); if (!bd) return false;
    if (!F.cv || F.cv.parentNode !== bd) {
      F.cv = document.createElement('canvas'); F.cv.className = 'twfx'; F.cv.setAttribute('aria-hidden', 'true');
      F.cv.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;z-index:1;pointer-events:none;image-rendering:pixelated;';
      bd.appendChild(F.cv); F.cx = F.cv.getContext('2d'); F.w = F.h = 0;
    }
    var w = Math.max(1, Math.ceil(bd.clientWidth / PX)), h = Math.max(1, Math.ceil(bd.clientHeight / PX));
    if (w !== F.w || h !== F.h) { F.w = F.cv.width = w; F.h = F.cv.height = h; F.img = F.cx.createImageData(w, h); F.buf = new Uint32Array(F.img.data.buffer); }
    F.cv.hidden = false; return true;
  }
  function tick(now) {
    F.raf = 0; var t0 = performance.now();
    var dt = Math.min(0.05, Math.max(0, (now - (F.last || now)) / 1000)); F.last = now;
    if (!F.list.length || !allowed() || !layer()) return end();
    var dim = 0, i, it;
    for (i = F.list.length - 1; i >= 0; i--) { it = F.list[i]; it.age += dt; it.fx.update(dt); if (it.fx.done() || it.age > CAP) F.list.splice(i, 1); }
    if (!F.list.length) return end();
    for (i = 0; i < F.list.length; i++) dim = Math.max(dim, F.list[i].fx.dim ? F.list[i].fx.dim() : 0);
    F.buf.fill(dim > 0 ? P.rgba(8, 20, 42, Math.round(dim * 72)) : 0);   // the squall darkens the sea a little
    var f = { w: F.w, h: F.h, ox: 0, oy: 0, color: F.buf };
    for (i = 0; i < F.list.length; i++) F.list[i].fx.draw(f);
    F.cx.putImageData(F.img, 0, 0);
    F.st.frames++; F.st.cost.push(performance.now() - t0); if (F.st.cost.length > 600) F.st.cost.shift();
    F.raf = requestAnimationFrame(tick);
  }
  function end() { F.list.length = 0; F.last = 0; if (F.cx) F.cx.clearRect(0, 0, F.w, F.h); if (F.cv) F.cv.hidden = true; }
  function play(fx) {
    if (!fx) return false; F.list.push({ fx: fx, age: 0 }); F.st.played++;
    if (!F.raf) { F.last = 0; F.raf = requestAnimationFrame(tick); }
    return true;
  }
  function geom() {
    var pj = proj(); if (!pj) return null;
    var B = typeof BC === 'number' ? BC : 3, lo = -B - 0.5, hi = B + 0.5;
    var cs = [pj(lo, 0, lo), pj(hi, 0, lo), pj(lo, 0, hi), pj(hi, 0, hi)].filter(Boolean); if (cs.length < 4) return null;
    var xs = cs.map(function (p) { return p[0]; }), ys = cs.map(function (p) { return p[1]; });
    var x0 = Math.min.apply(0, xs), x1 = Math.max.apply(0, xs), y0 = Math.min.apply(0, ys), y1 = Math.max.apply(0, ys);
    return { pj: pj, B: B, lo: lo, hi: hi, x0: x0, x1: x1, y0: y0, y1: y1, sq: (x1 - x0) / (2 * B + 1) };
  }
  var TW = {
    get on() { return F.on; },
    get menu() { return F.menu; },
    setOn: function (b) { F.on = !!b; if (!F.on) end(); return F.on; },
    active: function () { return F.list.length; },
    stats: function () { var c = F.st.cost.slice().sort(function (a, b) { return a - b; }); return { played: F.st.played, frames: F.st.frames, skipped: F.st.skipped, active: F.list.length, costAvg: c.length ? c.reduce(function (a, b) { return a + b; }, 0) / c.length : 0, costP95: c.length ? c[Math.floor(c.length * 0.95)] : 0, costMax: c.length ? c[c.length - 1] : 0 }; },
    // a Rogue Wave arrives or moves: w = { x, y, r } (r odd = the wave runs down column x, even = along row y)
    wave: function (w) {
      if (!allowed() || !w) { F.st.skipped++; return false; } var G2 = geom(); if (!G2 || !layer()) return false;
      var col = !!(w.r & 1), band = (col ? w.x : w.y) - G2.B;
      var land = function (R) {
        var a = R.range(G2.lo, G2.hi), b = R.chance(0.55) ? band + R.range(-0.5, 0.5) : R.range(G2.lo, G2.hi);
        var p = col ? G2.pj(b, 0, a) : G2.pj(a, 0, b); return p || [(G2.x0 + G2.x1) / 2, (G2.y0 + G2.y1) / 2];
      };
      return play(g.TWFX_rain({ land: land, top: G2.y0 - 30, area: (G2.x1 - G2.x0) * (G2.y1 - G2.y0), dur: 1.5, seed: (Date.now() & 0xffff) + 1 }));
    },
    // a junk sinks: k = its kit position { c, r, port }
    sink: function (k) {
      if (!allowed() || !k) { F.st.skipped++; return false; } var G2 = geom(); if (!G2 || !layer()) return false;
      var wp = null; try { wp = TWKit.portWorld(k.c, k.r, k.port); } catch (e) {}
      var p = wp ? G2.pj(wp[0], 0, wp[1]) : G2.pj(k.c - G2.B, 0, k.r - G2.B); if (!p) return false;
      return play(g.TWFX_spray({ x: p[0], y: p[1], s: G2.sq, seed: (Date.now() & 0xffff) + 3 }));
    },
    // the Menu's "Effects" button (only when the address has ?fx=)
    menuHTML: function (cls) { return F.menu ? '<button class="' + cls + (F.on ? ' on' : '') + '" data-a="fxtog">Effects ' + (F.on ? 'on' : 'off') + '</button>' : ''; }
  };
  g.TWFX = TW;
})(typeof window !== 'undefined' ? window : globalThis);
