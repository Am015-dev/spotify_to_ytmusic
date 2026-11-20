// Tidewake pixel effects: shared pixel-buffer helpers (Px, dithered dot, splash ellipse, colours, seeded random, noise).
// Ported from TypeScript to plain browser JS (no build step, no imports) from the Sprite Fusion pixel-art VFX library
// (https://www.spritefusion.com/pixel-art-vfx, rain.ts). Changes: plain JS, one global (TWFXPX), an RGBA colour helper and a
// full-ring option on splash (the board is seen from above). See games-src/THIRD-PARTY.md.
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
  var TAU = Math.PI * 2;
  var BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  // a Frame is { w, h, ox, oy, color: Uint32Array } (little-endian ABGR, the layout ImageData uses)
  function Px(f) { this.w = f.w; this.h = f.h; this.ox = f.ox || 0; this.oy = f.oy || 0; this.data = f.color; }
  Px.prototype.at = function (x, y) { x = (x - this.ox) | 0; y = (y - this.oy) | 0; return x < 0 || y < 0 || x >= this.w || y >= this.h ? -1 : y * this.w + x; };
  Px.prototype.set = function (x, y, c) { var i = this.at(x, y); if (i >= 0) this.data[i] = c; };
  Px.prototype.line = function (x0, y0, x1, y1, c) {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    var dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1, err = dx + dy;
    for (var n = 0; n < 4096; n++) {
      this.set(x0, y0, c);
      if (x0 === x1 && y0 === y1) break;
      var e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
  };
  // ordered-dither dot: a < 1 keeps only the Bayer cells under the threshold (pixel-art transparency)
  function dot(buf, x, y, c, a) {
    if (a === undefined) a = 1;
    var px = Math.floor(x), py = Math.floor(y);
    if (a >= 1 || a > (BAYER[((py & 3) << 2) | (px & 3)] + 0.5) / 16) buf.set(px, py, c);
  }
  // splash ring: the lower part of an ellipse (the back arc is hidden by the water), dithered by a; full = the whole ring (seen from above)
  function splash(buf, cx, cy, rx, ry, c, a, full) {
    var n = Math.ceil(Math.max(rx, ry) * TAU * 1.3);
    for (var j = 0; j < n; j++) {
      var ang = (j / n) * TAU, ca = Math.cos(ang), sa = Math.sin(ang);
      if (sa < -0.2 && !full) continue;
      for (var o = -0.5; o <= 0.5; o += 0.5) dot(buf, cx + ca * (rx + o), cy + sa * (ry + o * (ry / Math.max(1, rx))), c, a);
    }
  }
  function rgba(r, gg, b, a) { return ((a & 255) << 24) | ((b & 255) << 16) | ((gg & 255) << 8) | (r & 255); }
  function hex(h) { var v = parseInt(h.slice(1), 16); return rgba((v >> 16) & 255, (v >> 8) & 255, v & 255, 255); }
  function Rng(seed) { this.s = (seed >>> 0) || 1; }
  Rng.prototype.next = function () {
    var t = (this.s = (this.s + 0x6d2b79f5) >>> 0);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  Rng.prototype.range = function (a, b) { return a + (b - a) * this.next(); };
  Rng.prototype.int = function (a, b) { return Math.floor(this.range(a, b + 1)); };
  Rng.prototype.chance = function (p) { return this.next() < p; };
  function hash(n, k) { k = k || 0; return ((Math.imul(n + 1 + k * 7919, 2654435761) >>> 0) % 100000) / 100000; }
  function noise(x, seed) {
    seed = seed || 0; var i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f);
    return hash(i, seed) * 2 - 1 + (hash(i + 1, seed) - hash(i, seed)) * 2 * u;
  }
  g.TWFXPX = { Px: Px, dot: dot, splash: splash, rgba: rgba, hex: hex, Rng: Rng, hash: hash, noise: noise, TAU: TAU, PX: 2 };
})(typeof window !== 'undefined' ? window : globalThis);
