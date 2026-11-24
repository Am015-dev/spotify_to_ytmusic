// Via Tessera art: the mosaic map. A canvas lays real tesserae (small jittered tiles with grout) for sea, land, coasts and regions,
// then the page uses it as the SVG map's background. All code art; no image files. Map units: 980 x 600.
(function () {
  var W = 980, H = 600;
  function pj(p) { return [(p[0] + 11) * 20, (54 - p[1]) * 24]; }
  // coastlines (lon, lat), hand traced and simplified
  var MED = [[-5.6, 36.1], [-4.4, 36.7], [-2.1, 36.7], [-0.7, 37.6], [0.2, 38.8], [-0.3, 39.5], [0.5, 40.6], [2.2, 41.4], [3.2, 42.2], [3.1, 43.1], [4.6, 43.4], [6, 43.1], [7.5, 43.8], [8.8, 44.4], [9.8, 44.1], [10.5, 42.9], [11.2, 42.4], [12.3, 41.7], [13.6, 41.2], [14.3, 40.8], [15.6, 40.1], [15.7, 38.9], [15.6, 38], [16.1, 38], [16.6, 38.8], [17.2, 39.4], [17.1, 40.5], [18.5, 40.1], [18, 40.7], [16, 41.9], [14.2, 42.4], [13.6, 43.5], [12.3, 44.3], [12.4, 45.4], [13.7, 45.7], [13.6, 45.1], [14.5, 45.3], [15.9, 43.6], [17.5, 43], [18.6, 42.4], [19.4, 41.8], [19.5, 40.5], [20.1, 39.6], [21, 38.3], [22, 37.9], [21.7, 36.8], [22.5, 36.4], [23.2, 36.4], [23, 37.5], [24, 37.7], [24, 38.2], [22.8, 38.9], [23.4, 39.2], [22.6, 40.3], [23.8, 40.4], [24.8, 40.8], [26, 40.7], [26.3, 40.1], [27.5, 40.9], [29, 41], [29, 40.9], [28.5, 40.4], [26.7, 40.4], [26.2, 39.5], [26.8, 38.6], [26.3, 38.2], [27.2, 37.9], [27.3, 37], [28.3, 36.6], [29.6, 36.2], [30.6, 36.8], [31.5, 36.6], [32.8, 36.0], [34.6, 36.8], [36.2, 36.6], [35.8, 35.6], [35.9, 34.9], [35.5, 33.9], [35.1, 33], [34.6, 31.8], [34.2, 31.3], [32.3, 31.3], [31, 31.6], [29.9, 31.2], [28, 31.1], [25.2, 31.6], [23, 32.6], [21.5, 32.9], [20, 32.3], [20, 31], [19, 30.3], [17.5, 30.9], [15.6, 31.6], [15.2, 32.3], [13.2, 32.9], [11.5, 33.1], [10.2, 33.8], [10.1, 34.6], [11.1, 35.2], [10.6, 36.4], [11.1, 37.1], [10.2, 37.2], [9.8, 37.3], [8.6, 36.9], [6.9, 37], [5, 36.8], [3, 36.8], [1, 36.5], [-0.6, 35.8], [-2.2, 35.1], [-3.9, 35.2], [-5.3, 35.9]];
  var OCEAN = [[-13, 56], [-13, 27], [-9.8, 30], [-9.6, 32], [-8.5, 33.3], [-6.8, 34], [-5.9, 35.8], [-5.6, 36.1], [-6.3, 36.8], [-7.4, 37.2], [-8.9, 37], [-8.8, 38.5], [-9.5, 38.8], [-8.9, 40], [-8.8, 41.8], [-9.3, 43], [-8, 43.7], [-5.8, 43.6], [-3.8, 43.4], [-1.8, 43.4], [-1.4, 44.6], [-1.2, 46], [-2.2, 47.1], [-4.5, 47.9], [-4.5, 48.6], [-1.6, 48.7], [-1.4, 49.7], [0.2, 49.4], [1.6, 50.2], [1.9, 51], [3.5, 51.5], [4.5, 52.3], [5, 53], [7, 53.5], [8.6, 53.9], [8.6, 56]];
  var BLACK = [[28, 41.2], [28.6, 43.4], [28.6, 44.3], [29.6, 45.2], [30.7, 46.5], [31.8, 46.6], [33.5, 46], [32.5, 45.4], [33.5, 44.5], [35.4, 45], [36.6, 45.3], [38, 47], [39.3, 47], [38, 46], [37.5, 44.7], [39, 44.2], [41.5, 42], [40, 41], [37, 41.1], [35.1, 42.1], [33.3, 42], [31.3, 41.1], [29.1, 41.2]];
  var ISLES = [
    [[-5.7, 50.1], [-3.5, 50.3], [-1, 50.8], [1.4, 51.2], [1.7, 52.6], [0.3, 53.4], [-0.4, 54.5], [-1.6, 55.6], [-2, 57], [-5, 57], [-5, 55], [-3, 54.5], [-3.1, 53.3], [-4.6, 53.3], [-4.2, 52.2], [-5.2, 51.7], [-3.2, 51.4], [-4.2, 51.2]],
    [[-10, 54.5], [-6, 55.3], [-5.5, 54], [-6.2, 52.2], [-9.5, 51.6], [-10.3, 53.4]],
    [[12.4, 38.1], [13.3, 38.2], [15.6, 38.3], [15.1, 37.1], [15.1, 36.7], [14.3, 37], [12.4, 37.8]],
    [[8.4, 40.9], [9.2, 41.2], [9.8, 40.5], [9.6, 39.1], [8.9, 38.9], [8.4, 39.1], [8.5, 40]],
    [[9.4, 43], [9.5, 42], [9.2, 41.4], [8.6, 41.7], [8.7, 42.6]],
    [[23.5, 35.3], [24.3, 35.6], [26.3, 35.3], [26, 35], [24.7, 34.9], [23.6, 35.2]],
    [[32.3, 34.7], [33, 35.4], [34.6, 35.7], [34, 35], [33, 34.6]],
    [[2.4, 39.6], [3.4, 39.8], [3.2, 39.3], [2.5, 39.4]],
    [[23.2, 38.9], [24.2, 38.6], [24.5, 38], [23.6, 38.4]]];
  var NILE = [[31.2, 30], [31.3, 28], [32.5, 25]];
  function path(ctx, pts) { ctx.beginPath(); pts.forEach(function (p, i) { var q = pj(p); i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }); ctx.closePath(); }
  // region tints (muted mosaic stones), one per region in data order
  var TINT = ['#c9b48a', '#d8a86f', '#d9b27a', '#b9ad7e', '#e0b98a', '#d7a066', '#c4aa7a', '#e3c49a', '#dfb37c', '#d5a777', '#cfae80', '#e2bf86'];
  var SEA = ['#1f4e8c', '#24589a', '#2a62a6', '#1b467f', '#2f6db0', '#22508f'];
  function hash(i, j, k) { var h = (i * 73856093) ^ (j * 19349663) ^ (k * 83492791); h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
  function shade(hex, f) { var n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255; var c = function (x) { return Math.max(0, Math.min(255, Math.round(x * f))); }; return 'rgb(' + c(r) + ',' + c(g) + ',' + c(b) + ')'; }
  window.VTART = {
    W: W, H: H,
    // render the mosaic once; returns a data URL (or null when canvas is unavailable, e.g. jsdom)
    mosaic: function (D, scale) {
      scale = scale || 2;
      var cv = document.createElement('canvas'); cv.width = W * scale; cv.height = H * scale;
      var ctx = cv.getContext && cv.getContext('2d'); if (!ctx) return null;
      // 1. mask: land = 1, sea = 0 (drawn at 1x into a small canvas)
      var mk = document.createElement('canvas'); mk.width = W; mk.height = H; var m = mk.getContext('2d');
      m.fillStyle = '#fff'; m.fillRect(0, 0, W, H); m.fillStyle = '#000';
      [MED, OCEAN, BLACK].forEach(function (p) { path(m, p); m.fill(); });
      m.fillStyle = '#fff'; ISLES.forEach(function (p) { path(m, p); m.fill(); });
      var md = m.getImageData(0, 0, W, H).data;
      var land = function (x, y) { x = Math.max(0, Math.min(W - 1, x | 0)); y = Math.max(0, Math.min(H - 1, y | 0)); return md[(y * W + x) * 4] > 128; };
      // 2. regions: nearest city (within reach) tints the land
      var cities = D.CITIES.filter(function (c) { return c.p; }), pidx = {}; D.PROVS.forEach(function (p, i) { pidx[p.id] = i; });
      var region = function (x, y) { var best = -1, bd = 95 * 95; cities.forEach(function (c) { var d = (c.x - x) * (c.x - x) + (c.y - y) * (c.y - y); if (d < bd) { bd = d; best = pidx[c.p]; } }); return best; };
      ctx.fillStyle = '#4a3a2c'; ctx.fillRect(0, 0, cv.width, cv.height);   // grout
      var S = 9, nx = Math.ceil(W / S), ny = Math.ceil(H / S), cell = [];
      for (var j = 0; j < ny; j++) { cell[j] = []; for (var i = 0; i < nx; i++) { var cx = i * S + S / 2, cy = j * S + S / 2; cell[j][i] = land(cx, cy) ? 1 + region(cx, cy) + 1 : 0; } }
      for (var j2 = 0; j2 < ny; j2++) for (var i2 = 0; i2 < nx; i2++) {
        var v = cell[j2][i2], r1 = hash(i2, j2, 1), r2 = hash(i2, j2, 2), r3 = hash(i2, j2, 3), col;
        var coast = false, border = false;
        [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) { var row = cell[j2 + d[1]]; if (!row) return; var w = row[i2 + d[0]]; if (w == null) return; if ((w === 0) !== (v === 0)) coast = true; else if (v && w && w !== v) border = true; });
        if (v === 0) col = coast ? shade('#d9e6ee', 0.92 + r1 * 0.12) : shade(SEA[(r1 * SEA.length) | 0], 0.9 + r2 * 0.2);
        else if (coast) col = shade('#6b4a2e', 0.85 + r1 * 0.3);
        else if (border) col = shade('#8a5a36', 0.9 + r1 * 0.2);
        else col = shade(v >= 2 ? TINT[(v - 2) % TINT.length] : '#d8c7a0', 0.86 + r1 * 0.22);
        var jx = (r2 - 0.5) * 1.6, jy = (r3 - 0.5) * 1.6, g = 1.1, x0 = (i2 * S + g + jx) * scale, y0 = (j2 * S + g + jy) * scale, sz = (S - 2 * g) * scale;
        ctx.fillStyle = col; ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(x0, y0, sz, sz, 1.6 * scale); else ctx.rect(x0, y0, sz, sz);
        ctx.fill();
        // a glint on each tile: light from the top left, like glazed stone
        ctx.fillStyle = 'rgba(255,255,255,' + (0.06 + r1 * 0.08) + ')'; ctx.fillRect(x0 + scale, y0 + scale, sz * 0.45, sz * 0.18);
      }
      // the Nile in blue tesserae
      ctx.strokeStyle = '#2a62a6'; ctx.lineWidth = 3 * scale; ctx.setLineDash([4 * scale, 2 * scale]); ctx.beginPath(); NILE.forEach(function (p, i) { var q = pj(p); i ? ctx.lineTo(q[0] * scale, q[1] * scale) : ctx.moveTo(q[0] * scale, q[1] * scale); }); ctx.stroke(); ctx.setLineDash([]);
      // border: two rows of dark and cream tesserae with a red key stone every few tiles
      for (var k = 0; k < Math.ceil((W + H) * 2 / 10); k++) {
        var t = k * 10, x, y;
        if (t < W) { x = t; y = 0; } else if (t < W + H) { x = W - 10; y = t - W; } else if (t < 2 * W + H) { x = W - (t - W - H) - 10; y = H - 10; } else { x = 0; y = H - (t - 2 * W - H) - 10; }
        ctx.fillStyle = k % 6 === 0 ? '#a8322a' : (k % 2 ? '#2b2018' : '#efe4cc'); ctx.fillRect((x + 1) * scale, (y + 1) * scale, 8 * scale, 8 * scale);
      }
      try { return cv.toDataURL('image/jpeg', 0.86); } catch (e) { return null; }
    },
    pj: pj
  };
})();
