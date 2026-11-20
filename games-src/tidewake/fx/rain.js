// Tidewake pixel effects: rain squall (plays when a Rogue Wave arrives or moves).
// Ported from TypeScript to plain browser JS from the Sprite Fusion pixel-art VFX library
// (https://www.spritefusion.com/pixel-art-vfx, rain.ts). Kept: three depth layers of slanted streaks with bright heads, splash
// rings and flying bits with gravity, the palette and speeds. Changed for a board seen from above: each drop falls to its own
// landing point on the sea (given by the caller, so splashes gather in the wave's row or column) instead of a ground line; rings
// are whole one-pass ellipses and fewer mid-layer drops splash (phone frame time); the squall is FINITE (it rains for `dur` seconds, then the drops drain and done() turns true); the
// side-view mist band is left out; the palette is lifted for the teal sea. See games-src/THIRD-PARTY.md.
//
// MIT License
// Copyright (c) 2026 Hugo Duprez
//
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation
// files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy,
// modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software
// is furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
// OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
// IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
(function (g) {
  'use strict';
  var P = g.TWFXPX, Px = P.Px, dot = P.dot, hex = P.hex;
  // palette lifted from the original's dusk blues so the streaks hold on Tidewake's teal sea
  var C = { far: hex('#5a7aa8'), farH: hex('#7d9cc8'), mid: hex('#8fb0d8'), midH: hex('#c4dcf2'), near: hex('#a9c8e8'), nearH: hex('#f2f8ff') };
  var SPEED = [760, 1050, 1450], LEN = [3, 6, 12], BODY = [C.far, C.mid, C.near], HEAD = [C.farH, C.midH, C.nearH];
  var PX = P.PX;
  // o: { land(R) -> [x, y] landing point in CSS px, top: y where drops start, area: CSS px^2 of the board, dur: seconds of rain,
  //      slant, density, seed }
  function rain(o) {
    var R = new P.Rng(o.seed || 1), D = o.density == null ? 1 : o.density;
    var DX = o.slant == null ? -0.22 : o.slant, DL = Math.hypot(DX, 1), ux = DX / DL, uy = 1 / DL;
    var TOP = o.top, DUR = o.dur || 1.6;
    // the original's counts are for a 680 x 370 area; scale by the board's area, capped so a big desktop board stays light
    var k = Math.min(1.4, Math.max(0.35, (o.area || 250000) / (680 * 370))) * D;
    var drops = [], splashes = [], bits = [], t = 0, stopped = false;
    function reset(d) {
      var l = o.land(R); d.lx = l[0]; d.ly = l[1];
      var y0 = TOP - R.range(0, 160), dist = (d.ly - y0) / uy;
      d.x = d.lx - ux * dist; d.y = y0;
      d.sp = SPEED[d.layer] * R.range(0.9, 1.1);
      d.stop = d.layer === 0 ? d.ly - R.range(10, 90) : d.ly;  // the far layer fades out before it reaches the water
    }
    [[0, 230], [1, 120], [2, 34]].forEach(function (ln) {
      for (var i = 0; i < Math.round(ln[1] * k); i++) { var d = { layer: ln[0] }; reset(d); drops.push(d); }
    });
    function again(i) { if (stopped) drops.splice(i, 1); else reset(drops[i]); }
    // a one-pass ring (the shared splash() draws three passes; dozens of rings at once cost too much on a throttled phone)
    function ring(buf, cx, cy, rx, ry, c, a) {
      var n = Math.ceil(rx * 5);
      for (var j = 0; j < n; j++) { var ang = (j / n) * P.TAU; dot(buf, cx + Math.cos(ang) * rx, cy + Math.sin(ang) * ry, c, a); }
    }
    function drawLayer(buf, layer) {
      var L = LEN[layer], c = BODY[layer], h = HEAD[layer];
      for (var i = 0; i < drops.length; i++) {
        var d = drops[i]; if (d.layer !== layer) continue;
        var x = d.x / PX, y = d.y / PX;
        buf.line(x - ux * L, y - uy * L, x - ux * L * 0.4, y - uy * L * 0.4, c);
        buf.line(x - ux * L * 0.4, y - uy * L * 0.4, x, y, h);
      }
    }
    return {
      update: function (dt) {
        t += dt; if (!stopped && t >= DUR) stopped = true;
        for (var i = drops.length - 1; i >= 0; i--) {
          var d = drops[i];
          d.x += ux * d.sp * dt; d.y += uy * d.sp * dt;
          if (d.layer === 0 && d.y > d.stop) again(i);
          else if (d.y >= d.ly) {
            if (d.layer === 2 || R.chance(0.3)) splashes.push({ x: d.lx, y: d.ly, t: t });
            for (var n = 0; n < (d.layer === 2 ? 3 : R.int(0, 2)); n++) bits.push({ x: d.lx, y: d.ly - 1, gy: d.ly, vx: R.range(-90, 70), vy: -R.range(110, 230), life: R.range(0.18, 0.32) });
            again(i);
          }
        }
        for (var j = bits.length - 1; j >= 0; j--) {
          var b = bits[j];
          if ((b.life -= dt) <= 0 || b.y > b.gy) { bits.splice(j, 1); continue; }
          b.vy += 1900 * dt; b.x += b.vx * dt; b.y += b.vy * dt;
        }
        for (var s = splashes.length - 1; s >= 0; s--) if (t - splashes[s].t > 0.4) splashes.splice(s, 1);
      },
      draw: function (f) {
        var buf = new Px(f);
        drawLayer(buf, 0); drawLayer(buf, 1);
        for (var i = 0; i < splashes.length; i++) {
          var s = splashes[i], u = (t - s.t) / 0.4, rx = 1 + 5 * Math.sqrt(u);
          ring(buf, s.x / PX, s.y / PX, rx, rx * 0.4, u < 0.3 ? C.midH : C.mid, 1 - u);
        }
        for (var j = 0; j < bits.length; j++) dot(buf, bits[j].x / PX, bits[j].y / PX, C.nearH);
        drawLayer(buf, 2);
      },
      stop: function () { stopped = true; },
      done: function () { return stopped && drops.length === 0 && bits.length === 0 && splashes.length === 0; }
    };
  }
  g.TWFX_rain = rain;
})(typeof window !== 'undefined' ? window : globalThis);
