// Five quick drafts for the custom "spray" effect (a junk sinking), drawn the Sprite Fusion way: code as clay, render each as a
// frame strip, judge, pick one and refine (the refined one is ../spray.js). Uses ../px.js (MIT, see games-src/THIRD-PARTY.md).
// Units: CSS px around the sinking point (x, y); s = one board square in CSS px. Each draft is finite (done() turns true).
(function (g) {
  'use strict';
  var P = g.TWFXPX, Px = P.Px, dot = P.dot, splash = P.splash, hex = P.hex, PX = P.PX;
  var FOAM = hex('#f4fbff'), LIGHT = hex('#cfe9f2'), MID = hex('#8fc7d6'), DEEP = hex('#2f6f86'), DARK = hex('#1d4a5e');
  function drops(R, n, x, y, s, up, spread) {
    var a = []; for (var i = 0; i < n; i++) { var ang = R.range(0, P.TAU); a.push({ x: x, y: y, gy: y + Math.sin(ang) * s * 0.12, vx: Math.cos(ang) * R.range(0.3, 1) * spread * s, vy: -R.range(0.6, 1) * up * s, life: R.range(0.5, 0.9) }); } return a;
  }
  function stepDrops(a, dt, grav) { for (var i = a.length - 1; i >= 0; i--) { var b = a[i]; b.vy += grav * dt; b.x += b.vx * dt; b.y += b.vy * dt; if ((b.life -= dt) <= 0 || (b.vy > 0 && b.y > b.gy)) a.splice(i, 1); } }
  var D = {};
  // A: a white water column shoots up, then collapses, shedding drops
  D.column = function (o) {
    var R = new P.Rng(o.seed || 3), s = o.s, t = 0, a = [];
    return { update: function (dt) { t += dt; if (t > 0.25 && t < 0.5 && R.chance(0.7)) a = a.concat(drops(R, 3, o.x, o.y - s * 0.9 * Math.sin(Math.min(1, t / 0.35) * Math.PI / 2), s, 0.4, 0.8)); stepDrops(a, dt, s * 9); },
      draw: function (f) { var b = new Px(f), h = s * 1.1 * Math.sin(Math.min(1, t / 0.7) * Math.PI), w = s * 0.18;
        for (var yy = 0; yy < h; yy += PX) for (var xx = -w; xx <= w; xx += PX) dot(b, (o.x + xx) / PX, (o.y - yy) / PX, Math.abs(xx) > w * 0.6 ? MID : FOAM, 1 - yy / (h + 1) * 0.6);
        a.forEach(function (d) { dot(b, d.x / PX, d.y / PX, LIGHT); }); },
      done: function () { return t > 0.7 && !a.length; } };
  };
  // B: crown splash, a ring of drops thrown out and up, landing in small rings
  D.crown = function (o) {
    var R = new P.Rng(o.seed || 5), s = o.s, t = 0, a = drops(R, 22, o.x, o.y, s, 1.1, 0.9), rings = [];
    return { update: function (dt) { t += dt; var n = a.length; stepDrops(a, dt, s * 7); if (a.length < n) rings.push({ x: o.x + R.range(-s * 0.5, s * 0.5), y: o.y + R.range(-s * 0.15, s * 0.15), t: t }); for (var i = rings.length - 1; i >= 0; i--) if (t - rings[i].t > 0.35) rings.splice(i, 1); },
      draw: function (f) { var b = new Px(f); var u = Math.min(1, t / 0.6); splash(b, o.x / PX, o.y / PX, (s * 0.2 + s * 0.4 * u) / PX, (s * 0.08 + s * 0.16 * u) / PX, FOAM, 1 - u, true);
        rings.forEach(function (r) { var k = (t - r.t) / 0.35; splash(b, r.x / PX, r.y / PX, 1 + 3 * k, (1 + 3 * k) * 0.4, LIGHT, 1 - k, true); });
        a.forEach(function (d) { dot(b, d.x / PX, d.y / PX, FOAM); dot(b, d.x / PX, d.y / PX + 1, MID); }); },
      done: function () { return t > 0.6 && !a.length && !rings.length; } };
  };
  // C: short geyser burst plus three staggered ripple rings and foam flecks
  D.geyser = function (o) {
    var R = new P.Rng(o.seed || 7), s = o.s, t = 0, a = drops(R, 14, o.x, o.y, s, 1.4, 0.35);
    return { update: function (dt) { t += dt; stepDrops(a, dt, s * 8); },
      draw: function (f) { var b = new Px(f);
        for (var k = 0; k < 3; k++) { var u = (t - k * 0.18) / 0.8; if (u < 0 || u > 1) continue; splash(b, o.x / PX, o.y / PX, (s * 0.15 + s * 0.6 * u) / PX, (s * 0.06 + s * 0.24 * u) / PX, k ? MID : FOAM, 1 - u, true); }
        a.forEach(function (d) { dot(b, d.x / PX, d.y / PX, FOAM); }); },
      done: function () { return t > 1.16 && !a.length; } };
  };
  // D: the gulp, a foam swirl tightening into the hole while bubbles rise and pop
  D.gulp = function (o) {
    var R = new P.Rng(o.seed || 9), s = o.s, t = 0, bub = [];
    return { update: function (dt) { t += dt; if (t < 0.8 && R.chance(0.5)) bub.push({ x: o.x + R.range(-s * 0.25, s * 0.25), y: o.y + R.range(-s * 0.1, s * 0.1), life: R.range(0.2, 0.45), r: R.int(0, 1) }); for (var i = bub.length - 1; i >= 0; i--) if ((bub[i].life -= dt) <= 0) bub.splice(i, 1); },
      draw: function (f) { var b = new Px(f), k = Math.min(1, t / 0.9), r = s * 0.55 * (1 - k * 0.8);
        for (var j = 0; j < 40; j++) { var ang = j / 40 * P.TAU * 1.5 + t * 6, rr = r * (0.4 + 0.6 * j / 40); dot(b, (o.x + Math.cos(ang) * rr) / PX, (o.y + Math.sin(ang) * rr * 0.4) / PX, j & 1 ? FOAM : MID, 1 - k * 0.7); }
        bub.forEach(function (q) { splash(b, q.x / PX, q.y / PX, 1 + q.r, 1 + q.r, LIGHT, 1, true); }); },
      done: function () { return t > 0.9 && !bub.length; } };
  };
  // E: two slanted spray fans and a drifting mist
  D.fan = function (o) {
    var R = new P.Rng(o.seed || 11), s = o.s, t = 0, a = [];
    for (var i = 0; i < 26; i++) { var side = i & 1 ? 1 : -1; a.push({ x: o.x, y: o.y, gy: o.y + s * 0.1, vx: side * R.range(0.4, 1.1) * s, vy: -R.range(0.5, 1.2) * s, life: R.range(0.4, 0.8) }); }
    return { update: function (dt) { t += dt; stepDrops(a, dt, s * 5); },
      draw: function (f) { var b = new Px(f); a.forEach(function (d) { dot(b, d.x / PX, d.y / PX, FOAM); dot(b, (d.x - d.vx * 0.03) / PX, (d.y - d.vy * 0.03) / PX, MID, 0.6); });
        var m = Math.max(0, 1 - t / 0.9); for (var j = 0; j < 60; j++) dot(b, (o.x + P.noise(j * 1.7, 2) * s * 0.7) / PX, (o.y - Math.abs(P.noise(j * 2.3, 5)) * s * 0.4 - t * s * 0.2) / PX, LIGHT, m * 0.6); },
      done: function () { return t > 0.9 && !a.length; } };
  };
  g.TWFX_SPRAY_DRAFTS = D;
})(typeof window !== 'undefined' ? window : globalThis);
