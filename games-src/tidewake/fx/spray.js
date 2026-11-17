// Tidewake pixel effects: spray (plays once where a junk sinks). Our own effect, made the way the Sprite Fusion notes describe:
// five quick drafts (records/spray-drafts.js, frame strips records/draft-*.png), then one picked and refined. It combines the
// geyser draft's staggered ripple rings with a tapered crown column that sheds arcing drops, a dark hole as the hull goes under,
// and two late bubbles. Finite: about 1.3 s, then done() turns true. Draws with the helpers in px.js (MIT, Sprite Fusion; see
// games-src/THIRD-PARTY.md).
(function (g) {
  'use strict';
  var P = g.TWFXPX, Px = P.Px, dot = P.dot, splash = P.splash, hex = P.hex, PX = P.PX;
  var FOAM = hex('#f4fbff'), LIGHT = hex('#cfe9f2'), MID = hex('#8fc7d6'), DARK = hex('#163e50');
  // o: { x, y: the sinking point in CSS px, s: one board square in CSS px, seed }
  function spray(o) {
    var R = new P.Rng(o.seed || 7), s = Math.max(24, o.s), t = 0, drops = [], rings = [], bubbles = [], shed = 0;
    var cx = o.x / PX, cy = o.y / PX;
    function colH() { return t < 0.22 ? s * 0.95 * Math.sin(t / 0.22 * Math.PI / 2) : Math.max(0, s * 0.95 * (1 - (t - 0.22) / 0.33)); }
    return {
      update: function (dt) {
        t += dt;
        // the column sheds drops from its top while it stands; they arc out and land in small rings
        if (t > 0.08 && t < 0.42) {
          shed += dt * 60;
          while (shed >= 1) {
            shed -= 1; var ang = R.range(0, P.TAU), sp = R.range(0.35, 0.9) * s;
            drops.push({ x: o.x, y: o.y - colH() * R.range(0.6, 1), vx: Math.cos(ang) * sp, vy: -R.range(0.1, 0.7) * s, gy: o.y + Math.sin(ang) * s * 0.18, life: 0.9 });
          }
        }
        for (var i = drops.length - 1; i >= 0; i--) {
          var d = drops[i]; d.vy += s * 6 * dt; d.x += d.vx * dt; d.y += d.vy * dt;
          if ((d.life -= dt) <= 0 || (d.vy > 0 && d.y >= d.gy)) { if (R.chance(0.45)) rings.push({ x: d.x, y: d.gy, t: t }); drops.splice(i, 1); }
        }
        for (var j = rings.length - 1; j >= 0; j--) if (t - rings[j].t > 0.3) rings.splice(j, 1);
        if (t > 0.6 && t < 0.95 && bubbles.length < 2 && R.chance(0.08)) bubbles.push({ x: o.x + R.range(-s * 0.15, s * 0.15), y: o.y + R.range(-s * 0.05, s * 0.05), t: t });
        for (var b = bubbles.length - 1; b >= 0; b--) if (t - bubbles[b].t > 0.3) bubbles.splice(b, 1);
      },
      draw: function (f) {
        var buf = new Px(f), i, u;
        // the hole: a dark ellipse where the hull goes under, closing as the rings spread
        u = t / 0.7; if (u < 1) for (var hy = -2; hy <= 2; hy++) for (var hx = -5; hx <= 5; hx++) { var r = (hx * hx) / 25 + (hy * hy) / 4; if (r <= 1 - u * 0.6) dot(buf, cx + hx * s / 56, cy + hy * s / 56, DARK, 0.75 * (1 - u)); }
        // three staggered ripple rings (from the geyser draft)
        for (var k = 0; k < 3; k++) { u = (t - k * 0.18) / 0.8; if (u < 0 || u > 1) continue; splash(buf, cx, cy, (s * 0.15 + s * 0.6 * u) / PX, (s * 0.06 + s * 0.24 * u) / PX, k ? MID : FOAM, 1 - u, true); }
        // the crown column: wide foam base, tapering to a ragged top, dithered at the edges
        var h = colH() / PX, w0 = s * 0.2 / PX;
        for (var y = 0; y < h; y++) {
          var q = y / Math.max(1, h), w = w0 * (1 - q * 0.7) + (P.hash(y, (t * 30) | 0) - 0.5);
          for (var x = -Math.ceil(w); x <= Math.ceil(w); x++) { var e = Math.abs(x) / Math.max(1, w); dot(buf, cx + x, cy - y, e > 0.65 ? MID : q > 0.8 ? LIGHT : FOAM, e > 0.85 ? 0.5 : 1 - q * 0.35); }
        }
        for (i = 0; i < rings.length; i++) { u = (t - rings[i].t) / 0.3; splash(buf, rings[i].x / PX, rings[i].y / PX, 1 + 2.5 * u, (1 + 2.5 * u) * 0.45, LIGHT, 1 - u, true); }
        for (i = 0; i < drops.length; i++) { dot(buf, drops[i].x / PX, drops[i].y / PX, FOAM); dot(buf, drops[i].x / PX - drops[i].vx * 0.02 / PX, drops[i].y / PX - drops[i].vy * 0.02 / PX, MID, 0.6); }
        for (i = 0; i < bubbles.length; i++) { u = (t - bubbles[i].t) / 0.3; splash(buf, bubbles[i].x / PX, bubbles[i].y / PX, 1 + u * 1.5, 1 + u, u < 0.6 ? FOAM : LIGHT, 1 - u * 0.8, true); }
      },
      dim: function () { return 0; },
      stop: function () { t = Math.max(t, 0.95); },
      done: function () { return t > 1.16 && !drops.length && !rings.length && !bubbles.length; }
    };
  }
  g.TWFX_spray = spray;
})(typeof window !== 'undefined' ? window : globalThis);
