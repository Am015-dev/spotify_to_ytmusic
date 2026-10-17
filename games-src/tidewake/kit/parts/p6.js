
/* ------------------------------------------------------------------ junks (ships) */
var hullG = null;
function hullGeo() {
  if (hullG) return hullG; var NT = 20, NS = 10, L0 = -.27, L1 = .32, pos = [], uv = [], idx = [], dp = [], di = [];
  var W = function (t) { return .105 * (.62 + .38 * Math.sin(Math.PI * Math.pow(t, .9))) * (1 - Math.pow(t, 3.2)); }, YT = function (t) { return .098 + .075 * Math.pow(t, 2.4) + .055 * Math.max(0, 1 - t / .22); }, YB = function (t) { return .012 + .045 * Math.pow(t, 2.2); };
  for (var i = 0; i <= NT; i++) {
    var t = i / NT, x = lerp(L0, L1, t), w = W(t), yt = YT(t), yb = YB(t);
    for (var j = 0; j <= NS; j++) { var an = j / NS * Math.PI, z = -w * Math.cos(an), y = yt - (yt - yb) * Math.pow(Math.sin(an), .75); pos.push(x, y, z); uv.push(t * 2.5, j / NS); }
    dp.push(x, yt - .008, -w * .96, x, yt - .008, w * .96);
  }
  for (var a = 0; a < NT; a++) for (var b = 0; b < NS; b++) { var p = a * (NS + 1) + b, q = p + NS + 1; idx.push(p, p + 1, q, q, p + 1, q + 1); }
  // stern cap
  var cs = pos.length / 3, ctr = (YT(0) + YB(0)) / 2; pos.push(L0, ctr, 0); uv.push(0, .5); for (var j2 = 0; j2 <= NS; j2++) { idx.push(cs, j2 + 1 < NS + 1 ? j2 + 1 : j2, j2); }
  var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
  for (var k = 0; k < NT; k++) { var o = k * 2; di.push(o, o + 1, o + 2, o + 2, o + 1, o + 3); }
  var d = new THREE.BufferGeometry(); d.setAttribute('position', new THREE.Float32BufferAttribute(dp, 3)); d.setIndex(di); d.setAttribute('uv', new THREE.Float32BufferAttribute(dp.filter(function (_, i) { return i % 3 !== 1; }), 2)); d.computeVertexNormals();
  hullG = { hull: g, deck: d, W: W, YT: YT }; return hullG;
}
var sailG = null;
function sailGeo(w, h, bulge) { var g = new THREE.PlaneGeometry(w, h, 5, 7), p = g.attributes.position; for (var i = 0; i < p.count; i++) { var u = p.getX(i) / w + .5, v = p.getY(i) / h + .5; p.setZ(i, bulge * Math.sin(Math.PI * u) * (.35 + .65 * v) + .01 * Math.sin(v * 24)); /* batten ripple */ } g.computeVertexNormals(); return g; }
function buildShip3D(s) {
  var col = SHIP_COLORS[s.color % 8], H = hullGeo(), g = new THREE.Group(), q = GFX[K.q];
  var wood = ctex('shipwood', 256, 128, function (x, w, h) { paintWood(x, w, h, '#8a5a34', '40,20,8', 31, false); x.strokeStyle = 'rgba(30,14,5,.5)'; x.lineWidth = 2; for (var i = 1; i < 6; i++) { x.beginPath(); x.moveTo(0, i * h / 6); x.lineTo(w, i * h / 6); x.stroke(); } });
  wood.wrapS = wood.wrapT = THREE.RepeatWrapping;
  var hullM = new THREE.MeshStandardMaterial({ map: wood, roughness: .5, metalness: .05, side: THREE.DoubleSide, envMapIntensity: .6 });
  var hull = new THREE.Mesh(H.hull, hullM); g.add(hull);
  var deck = new THREE.Mesh(H.deck, new THREE.MeshStandardMaterial({ map: wood, color: '#e9c48f', roughness: .6, side: THREE.DoubleSide })); g.add(deck);
  var trimM = new THREE.MeshStandardMaterial({ color: col.trim, roughness: .4, metalness: .15 }), sailC = new THREE.Color(col.sail);
  // painted gunwale bands
  [-1, 1].forEach(function (sd) {
    var pts = []; for (var i = 0; i <= 14; i++) { var t = i / 14; pts.push(new THREE.Vector3(lerp(-.27, .32, t), H.YT(t) + .003, sd * H.W(t) * 1.0)); }
    var tb = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 28, .0105, 6), trimM); g.add(tb);
    var pts2 = pts.map(function (p) { return new THREE.Vector3(p.x, p.y - .035, p.z * .97); }); g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts2), 28, .007, 5), trimM));
  });
  // stern castle with tiled roof, bow prow
  var cas = new THREE.Mesh(new THREE.BoxGeometry(.11, .07, .13), new THREE.MeshStandardMaterial({ map: wood, color: '#d9a96d', roughness: .55 })); cas.position.set(-.2, .2, 0); g.add(cas);
  var roof = new THREE.Mesh(new THREE.CylinderGeometry(.075, .085, .13, 3), trimM); roof.rotation.set(Math.PI / 2, 0, Math.PI / 2); roof.position.set(-.2, .265, 0); roof.scale.set(1, 1, 1.15); g.add(roof);
  var prow = new THREE.Mesh(new THREE.ConeGeometry(.026, .09, 6), trimM); prow.position.set(.335, .16, 0); prow.rotation.z = -1.1; g.add(prow);
  var lant = new THREE.Mesh(new THREE.SphereGeometry(.014, 8, 8), new THREE.MeshBasicMaterial({ color: '#ffd27a' })); lant.position.set(-.27, .24, 0); g.add(lant);
  var lantG = new THREE.Mesh(new THREE.SphereGeometry(.045, 8, 8), new THREE.MeshBasicMaterial({ color: '#ffb84a', transparent: true, opacity: .25, blending: THREE.AdditiveBlending, depthWrite: false })); lantG.position.copy(lant.position); g.add(lantG);
  // masts + paper sails with battens
  var mastM = new THREE.MeshStandardMaterial({ color: '#5a3b22', roughness: .6 });
  var sailTex = ctex('sail:' + col.sail, 256, 384, function (x, w, h) { paintSail(x, w, h, col.sail, hashStr(col.sail)); });
  var sailM = new THREE.MeshStandardMaterial({ map: sailTex, side: THREE.DoubleSide, roughness: .85, emissive: sailC, emissiveMap: sailTex, emissiveIntensity: .22 });
  s.sails = [];
  [[-.03, .46, .23, .38, .06], [.15, .34, .15, .26, .05]].forEach(function (m, i) {
    var mast = new THREE.Mesh(new THREE.CylinderGeometry(.009, .012, m[1], 6), mastM); mast.position.set(m[0], .1 + m[1] / 2, 0); g.add(mast);
    var sail = new THREE.Mesh(sailGeo(m[2], m[3], m[4]), sailM); sail.position.set(m[0] - m[2] * .5 + .02, .1 + .035 + m[3] / 2 + (i ? .0 : .04), 0); sail.rotation.y = 0; var pv = new THREE.Group(); pv.position.set(m[0], 0, 0); sail.position.x = -m[2] / 2 + .012; pv.add(sail); sail.position.y = .14 + m[3] / 2 + (i ? 0 : .02); g.add(pv); s.sails.push(pv);
    var yard = new THREE.Mesh(new THREE.CylinderGeometry(.006, .006, m[2] + .03, 5), mastM); yard.rotation.x = Math.PI / 2; yard.rotation.z = 0; yard.rotation.set(0, 0, Math.PI / 2); yard.position.set(-m[2] / 2 + .012, .14 + m[3] + (i ? 0 : .02) + .0, 0); pv.add(yard);
  });
  var flag = new THREE.Mesh(new THREE.PlaneGeometry(.1, .05, 4, 1), new THREE.MeshStandardMaterial({ color: col.sail, side: THREE.DoubleSide, roughness: .8, emissive: col.sail, emissiveIntensity: .3 })); flag.position.set(-.03 - .055, .1 + .46 - .02, 0); g.add(flag); s.flag = flag;
  g.traverse(function (o) { if (o.isMesh) { o.castShadow = q.shadows; } });
  s.g = g; s.cann = new THREE.Group(); g.add(s.cann); K.gShips.add(g); setCannons3D(s);
  // wake ribbon
  var N = 30, geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 2 * 3), 3)); geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(N * 2 * 4), 4));
  var ix = []; for (var i2 = 0; i2 < N - 1; i2++) { var a = i2 * 2; ix.push(a, a + 1, a + 2, a + 2, a + 1, a + 3); } geo.setIndex(ix);
  if (!K.wakeMat) K.wakeMat = new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.NormalBlending });
  s.wake = new THREE.Mesh(geo, K.wakeMat); s.wake.frustumCulled = false; s.wake.renderOrder = 3; s.wake.visible = false; K.gShips.add(s.wake);
  s.ring = new THREE.Mesh(new THREE.RingGeometry(.2, .26, 28), new THREE.MeshBasicMaterial({ color: '#d8fff2', transparent: true, opacity: .3, depthWrite: false })); s.ring.rotation.x = -Math.PI / 2; s.ring.renderOrder = 3; K.gShips.add(s.ring);
}
function setCannons3D(s) {
  if (!s.cann) return; while (s.cann.children.length) s.cann.remove(s.cann.children[0]);
  var m = new THREE.MeshStandardMaterial({ color: '#b98a3a', metalness: .85, roughness: .3 }), n = Math.min(5, s.cannons | 0);
  for (var i = 0; i < n; i++) { var sd = i % 2 ? 1 : -1, x = -.12 + Math.floor(i / 2) * .1 + (n === 1 ? .1 : 0); var b = new THREE.Mesh(new THREE.CylinderGeometry(.012, .017, .08, 8), m); b.rotation.x = Math.PI / 2; b.position.set(x, .135, sd * .06); s.cann.add(b); var w = new THREE.Mesh(new THREE.CylinderGeometry(.018, .018, .016, 8), new THREE.MeshStandardMaterial({ color: '#4a2d16' })); w.rotation.x = Math.PI / 2; w.position.set(x, .12, sd * .06); s.cann.add(w); }
}
function colorIdx(c) { if (typeof c === 'number') return ((c % 8) + 8) % 8; for (var i = 0; i < 8; i++) if (SHIP_COLORS[i].id === c || SHIP_COLORS[i].name === c) return i; return 0; }
/* addShip(id,{color:0..7|'jade',c,r,port,splash=true,cannons=0}) -> Promise (after the spawn splash). Position: square (c,r) + port 0..7 (edge starts are on outer ports). */
TWKit.addShip = function (id, o) {
  o = o || {}; if (S.ships[id]) TWKit.removeShip(id);
  var pw = portWorld(o.c, o.r, o.port), n = NORM[o.port];
  var s = S.ships[id] = { id: id, color: colorIdx(o.color), c: o.c, r: o.r, port: o.port, x: pw[0], z: pw[1], h: Math.atan2(n[1], n[0]), scale: 1, y: 0, roll: 0, pitch: 0, sink: 0, alive: true, cannons: o.cannons | 0, moving: false, trail: [], phase: Math.random() * 6, yaw: 0 };
  if (K.mode === '2d' || !K.on) { R2.ship(s); }
  else buildShip3D(s);
  if (o.splash === false) return Promise.resolve();
  s.scale = .01; s.y = .9;
  return tween(.7, function (e, k) { s.scale = Math.max(.01, e); s.y = (1 - EASE.in(Math.min(1, k * 1.15))) * .9; s.pitch = (1 - k) * .3; }, EASE.out).then(function () { s.scale = 1; s.y = 0; s.pitch = 0; FX.splash(s.x, s.z, .8); emit('spawn', { id: id, x: s.x, z: s.z }); return tween(.25, function (e, k) { s.y = Math.sin(k * Math.PI) * .03; }, EASE.lin); });
};
TWKit.removeShip = function (id) { var s = S.ships[id]; if (!s) return; delete S.ships[id]; s.alive = false; if (K.on) { K.gShips.remove(s.g); if (s.wake) { K.gShips.remove(s.wake); s.wake.geometry.dispose(); } if (s.ring) K.gShips.remove(s.ring); } else R2.unship(s); };
TWKit.setCannons = function (id, n) { var s = S.ships[id]; if (!s) return; s.cannons = n | 0; if (K.on) setCannons3D(s); else R2.ship(s, true); };
/* setShipAt(id,{c,r,port}): teleport without animation */
TWKit.setShipAt = function (id, p) { var s = S.ships[id]; if (!s) return; var pw = portWorld(p.c, p.r, p.port); s.c = p.c; s.r = p.r; s.port = p.port; s.x = pw[0]; s.z = pw[1]; s.trail = []; };
function routePts(steps) { var pts = []; steps.forEach(function (st, i) { var P = cp(st.from, st.to); for (var k = i ? 1 : 0; k <= 18; k++) { var q = bez(P, k / 18); pts.push([wx(st.c, q[0]), wz(st.r, q[1])]); } }); return pts; }
function angDiff(a, b) { var d = (b - a) % (Math.PI * 2); if (d > Math.PI) d -= Math.PI * 2; if (d < -Math.PI) d += Math.PI * 2; return d; }
/* moveShip(id, steps:[{c,r,from,to}], {dur,speed}) -> Promise<{c,r,port}>. Glides along every in-tile current in order (eased), leaving a foam wake. */
TWKit.moveShip = function (id, steps, o) {
  o = o || {}; var s = S.ships[id]; if (!s || !steps || !steps.length) return Promise.resolve(null);
  var pts = routePts(steps); if (Math.hypot(pts[0][0] - s.x, pts[0][1] - s.z) > .03) pts.unshift([s.x, s.z]);
  var cum = [0]; for (var i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])); var len = cum[cum.length - 1] || .01, ix = 1;
  var dur = (o.dur || (.5 + .34 * len)) / (o.speed || 1); s.moving = true; emit('sail', { id: id, len: len });
  return tween(dur, function (e) {
    var d = e * len; while (ix < pts.length - 1 && cum[ix] < d) ix++; var a = pts[ix - 1], b = pts[ix], f = (d - cum[ix - 1]) / Math.max(1e-6, cum[ix] - cum[ix - 1]);
    s.x = lerp(a[0], b[0], f); s.z = lerp(a[1], b[1], f);
    var j = Math.min(pts.length - 1, ix + 2), tgt = Math.atan2(pts[j][1] - pts[Math.max(0, j - 3)][1], pts[j][0] - pts[Math.max(0, j - 3)][0]); s.h += angDiff(s.h, tgt) * Math.min(1, (K.dt || .016) * 9);
    s.pitch = .045 * Math.sin(Math.PI * Math.min(1, e));
  }, EASE.sine).then(function () { var l = steps[steps.length - 1]; s.moving = false; s.pitch = 0; s.c = l.c; s.r = l.r; s.port = l.to; return { c: l.c, r: l.r, port: l.to }; });
};
/* collide(idA,idB) -> Promise: both junks lunge, crack, shower splinters. Follow with sinkShip. */
TWKit.collide = function (a, b, o) {
  var A = S.ships[a], B = S.ships[b]; if (!A || !B) return Promise.resolve();
  var mx = (A.x + B.x) / 2, mz = (A.z + B.z) / 2, dx = B.x - A.x, dz = B.z - A.z, L = Math.hypot(dx, dz) || 1, ux = dx / L, uz = dz / L, ax = A.x, az = A.z, bx = B.x, bz = B.z, hit = false;
  A.h = Math.atan2(uz, ux); B.h = Math.atan2(-uz, -ux);
  return tween(.55, function (e, k) {
    var lun = k < .45 ? EASE.in(k / .45) : 1 - EASE.out((k - .45) / .55) * 1; var off = lun * Math.max(0, L / 2 - .18);
    A.x = ax + ux * off; A.z = az + uz * off; B.x = bx - ux * off; B.z = bz - uz * off;
    A.roll = B.roll = Math.sin(k * Math.PI) * .25; A.pitch = -Math.sin(k * Math.PI) * .12; B.pitch = A.pitch;
    if (k > .42 && !hit) { hit = true; FX.chips(mx, mz, 26); FX.flash(mx, .2, mz, 1.1, [1, .85, .5]); FX.sparks(mx, .2, mz, 12); if (K.on) { ripple(mx, mz, .8, .7, WHITE); TWKit.shake(.07, 420); } emit('collide', { a: a, b: b, x: mx, z: mz }); }
  }, EASE.lin).then(function () { A.roll = B.roll = A.pitch = B.pitch = 0; return { x: mx, z: mz }; });
};
/* sinkShip(id,{how:'crash'|'leviathan'|'maelstrom'|'wave'|'cannon', at:{c,r}, keep}) -> Promise. The junk lists, splinters and slips under; removed afterwards unless keep. */
TWKit.sinkShip = function (id, o) {
  o = o || {}; var s = S.ships[id]; if (!s) return Promise.resolve(); var how = o.how || 'crash', sx = s.x, sz = s.z, cx = sx, cz = sz, h0 = s.h, dir = (hashStr(id) & 1) ? 1 : -1;
  if (how === 'maelstrom' && o.at) { cx = o.at.c - 2.5; cz = o.at.r - 2.5; }
  s.moving = false; emit('sink', { id: id, how: how, x: sx, z: sz }); FX.splash(sx, sz, .9); var bub = 0;
  return tween(how === 'maelstrom' ? 1.9 : 1.6, function (e, k) {
    s.sink = e; s.roll = dir * e * .9; s.pitch = -e * .5; s.scale = 1 - e * .35;
    if (how === 'maelstrom') { var ang = Math.atan2(sz - cz, sx - cx) + e * 9, rad = Math.hypot(sx - cx, sz - cz) * (1 - e); s.x = cx + Math.cos(ang) * rad; s.z = cz + Math.sin(ang) * rad; s.h = h0 + e * 12; }
    if (how === 'leviathan') { s.y = Math.sin(Math.min(1, k * 3) * Math.PI) * .12; }
    if (Math.random() < .35) emitP(false, s.x, .06, s.z, (Math.random() - .5) * .3, .5, (Math.random() - .5) * .3, .9, .05, .1, CY, .6, 0, 0);
    if (how === 'cannon' && Math.random() < .3) FX.smoke(s.x, .2, s.z, 1, .8);
  }, EASE.io).then(function () { FX.splash(s.x, s.z, .6); FX.bubbles(s.x, s.z, 8); if (!o.keep) TWKit.removeShip(id); else { s.alive = false; if (s.g) s.g.visible = false; } });
};
/* reviveShip(id): bring a kept (sunk) junk back */
TWKit.reviveShip = function (id, o) { var s = S.ships[id]; if (!s) return; s.alive = true; s.sink = 0; s.roll = s.pitch = 0; s.scale = 1; if (s.g) s.g.visible = true; };

function updShips(dt, t) {
  Object.keys(S.ships).forEach(function (id) {
    var s = S.ships[id], g = s.g; if (!g) return;
    var wv = K.waveFx && K.waveFx.row != null ? waveLift(s) : 0;
    var bob = Math.sin(t * 1.7 + s.phase) * .011, rl = Math.sin(t * 1.3 + s.phase * 1.7) * .035;
    g.visible = s.alive || s.sink < 1; g.position.set(s.x, .1 + bob + s.y - s.sink * .42 + wv, s.z); g.rotation.order = 'YZX'; g.rotation.set(rl + s.roll, -s.h, s.pitch + Math.cos(t * 1.1 + s.phase) * .02 + wv * .5);
    g.scale.setScalar(Math.max(.01, s.scale) * 1.45);
    s.sails.forEach(function (p, i) { p.rotation.y = .16 + Math.sin(t * 1.4 + s.phase + i) * .07; });
    if (s.flag) { s.flag.rotation.y = Math.sin(t * 6 + s.phase) * .35; }
    s.ring.position.set(s.x, .091, s.z); var rp = .5 + .5 * Math.sin(t * 1.7 + s.phase); s.ring.scale.setScalar(1.05 + .1 * rp * (1 - s.sink)); s.ring.material.opacity = .22 * (1 - s.sink) * s.scale; s.ring.visible = s.alive;
    updTrail(s, dt);
  });
}
function updTrail(s, dt) {
  var tr = s.trail, N = 30; for (var i = tr.length - 1; i >= 0; i--) { tr[i].a += dt; if (tr[i].a > 1.7) tr.splice(i, 1); }
  if (s.moving) { var l = tr[tr.length - 1]; var sx = s.x - Math.cos(s.h) * .2, sz = s.z - Math.sin(s.h) * .2; if (!l || Math.hypot(l.x - sx, l.z - sz) > .045) { tr.push({ x: sx, z: sz, a: 0 }); if (tr.length > N) tr.shift(); if (Math.random() < .5) emitP(false, sx, .1, sz, (Math.random() - .5) * .15, .05, (Math.random() - .5) * .15, 1, .07, .13, FOAM, .55, 0, 1.5); } }
  var m = s.wake; if (tr.length < 2) { m.visible = false; return; } m.visible = true;
  var pos = m.geometry.attributes.position.array, col = m.geometry.attributes.color.array, n = tr.length;
  for (var j = 0; j < N; j++) {
    var p = tr[Math.min(j, n - 1)], pr = tr[Math.max(0, Math.min(j, n - 1) - 1)], nx = tr[Math.min(n - 1, Math.min(j, n - 1) + 1)], dx = nx.x - pr.x, dz = nx.z - pr.z, L = Math.hypot(dx, dz) || 1, px = -dz / L, pz = dx / L, age = p.a / 1.7, w = .025 + age * .11 + .02 * (1 - Math.min(1, j / n)) * 0, al = (j >= n ? 0 : (1 - age) * .75) * (j < 2 ? j / 2 : 1);
    pos[j * 6] = p.x + px * w; pos[j * 6 + 1] = .097; pos[j * 6 + 2] = p.z + pz * w; pos[j * 6 + 3] = p.x - px * w; pos[j * 6 + 4] = .097; pos[j * 6 + 5] = p.z - pz * w;
    for (var k = 0; k < 2; k++) { col[j * 8 + k * 4] = .9; col[j * 8 + k * 4 + 1] = 1; col[j * 8 + k * 4 + 2] = .96; col[j * 8 + k * 4 + 3] = al; }
  }
  m.geometry.attributes.position.needsUpdate = m.geometry.attributes.color.needsUpdate = true;
}
