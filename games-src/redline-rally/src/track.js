/* Track geometry: closed Catmull-Rom loop through the waypoints, cut into N spaces of equal length (2 lanes each). */
var TK = {};
function buildTrack(id) {
  var def = TRACKDEFS[id], P = def.pts, n = P.length, dense = [], mark = [];
  function cr(a, b, c, d, t) { var t2 = t * t, t3 = t2 * t; return 0.5 * ((2 * b) + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3); }
  for (var i = 0; i < n; i++) {
    var p0 = P[(i + n - 1) % n], p1 = P[i], p2 = P[(i + 1) % n], p3 = P[(i + 2) % n];
    for (var k = 0; k < 28; k++) {
      var t = k / 28; if (k === 0 && p1[2]) mark.push({ d: dense.length, limit: p1[2] });
      dense.push([cr(p0[0], p1[0], p2[0], p3[0], t), cr(p0[1], p1[1], p2[1], p3[1], t)]);
    }
  }
  var cum = [0], L = 0;
  for (i = 1; i <= dense.length; i++) { var a = dense[i - 1], b = dense[i % dense.length]; L += Math.hypot(b[0] - a[0], b[1] - a[1]); cum.push(L); }
  var N = def.N, seg = L / N, corners = {}, list = [];
  mark.forEach(function (m) {
    var idx = Math.round(cum[m.d] / seg); if (idx < 4) idx = 4; while (corners[idx]) idx++; if (idx >= N) return;
    corners[idx] = m.limit; list.push({ idx: idx, limit: m.limit });
  });
  list.sort(function (a, b) { return a.idx - b.idx; });
  var T = { id: id, name: def.name, N: N, L: L, seg: seg, dense: dense, cum: cum, corners: corners, list: list };
  T.at = function (arc) {   /* point + heading at arc length (wraps) */
    arc = ((arc % L) + L) % L; var lo = 0, hi = T.cum.length - 1;
    while (hi - lo > 1) { var m = (lo + hi) >> 1; if (T.cum[m] <= arc) lo = m; else hi = m; }
    var A = T.dense[lo % T.dense.length], B = T.dense[(lo + 1) % T.dense.length], f = (arc - T.cum[lo]) / Math.max(1e-6, T.cum[lo + 1] - T.cum[lo]);
    return { x: A[0] + (B[0] - A[0]) * f, y: A[1] + (B[1] - A[1]) * f, a: Math.atan2(B[1] - A[1], B[0] - A[0]) };
  };
  T.space = function (p, lane) {   /* world point of (possibly fractional) space p in lane 0/1 */
    var q = T.at((p + 0.5) * seg), off = (lane ? 1 : -1) * 24;
    return { x: q.x - Math.sin(q.a) * off, y: q.y + Math.cos(q.a) * off, a: q.a };
  };
  return T;
}
for (var tid in TRACKDEFS) TK[tid] = buildTrack(tid);
