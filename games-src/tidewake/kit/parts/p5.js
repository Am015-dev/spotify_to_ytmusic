
/* ------------------------------------------------------------------ current tiles (3D) */
var tgeo = null;
function tileGeo() {
  if (tgeo) return tgeo; var bt = .014, g = new THREE.ExtrudeGeometry(rrShape(.932, .932, .07), { depth: .056, bevelEnabled: true, bevelThickness: bt, bevelSize: bt, bevelSegments: 2, curveSegments: 5 });
  g.rotateX(-Math.PI / 2); g.translate(0, bt, 0); var pos = g.attributes.position, uv = g.attributes.uv; for (var i = 0; i < pos.count; i++) uv.setXY(i, pos.getX(i) + .5, .5 - pos.getZ(i));
  tgeo = g; return g;
}
var TILE_TOP = .084;
function tsize() { return K.q === 'low' ? 256 : 512; }
function tileMat(map, emap) {
  var o = { map: map, roughness: .5, metalness: 0 }; if (emap) { o.emissiveMap = emap; o.emissive = new THREE.Color('#ffffff'); o.emissiveIntensity = .3; }
  return GFX[K.q].phys ? new THREE.MeshPhysicalMaterial(Object.assign(o, { clearcoat: .6, clearcoatRoughness: .35 })) : new THREE.MeshStandardMaterial(o);
}
function retexTile(T) {
  var s = tsize(), sg = sig(T.paths);
  var map = ctex('cur:' + sg + ':' + s, s, s, function (x, w) { paintCurrent(x, w, T.paths, 'map'); }), em = ctex('curg:' + sg + ':' + s, s, s, function (x, w) { paintCurrent(x, w, T.paths, 'glow'); });
  if (T.mesh.material) T.mesh.material.dispose(); T.mesh.material = tileMat(map, em);
}
function retexLev(L) { var s = tsize(); L.mesh.material.dispose(); L.mesh.material = tileMat(ctex('levt:' + JSON.stringify(L.arrows) + s, s, s, function (x, w) { paintLeviTile(x, w, L.arrows); })); L.mesh.material.emissive = new THREE.Color('#102a30'); }
function slabMesh() { var m = new THREE.Mesh(tileGeo(), new THREE.MeshStandardMaterial()); m.castShadow = m.receiveShadow = true; return m; }
/* placeTile(c,r,{paths,rot,animate=true}) -> Promise (resolves when landed). paths = 4 port pairs; rot applies 90deg cw turns. */
TWKit.placeTile = function (c, r, o) {
  o = o || {}; var paths = rotPaths(normPaths(o.paths), o.rot || 0), key = c + ',' + r;
  if (S.tiles[key]) TWKit.removeTile(c, r, { silent: true });
  var T = S.tiles[key] = { c: c, r: r, paths: paths, cps: paths.map(function (p) { return cp(p[0], p[1]); }), id: o.id };
  if (K.mode === '2d' || !K.on) { R2.tile(T); emit('place', { c: c, r: r }); return Promise.resolve(); }
  T.mesh = slabMesh(); retexTile(T); T.mesh.position.set(c - 2.5, 0, r - 2.5); K.gTiles.add(T.mesh);
  if (o.animate === false) { T.mesh.position.y = .004; return Promise.resolve(); }
  T.landing = true; T.mesh.position.y = 1.4; T.mesh.rotation.set(.35, .6, -.2);
  var cx = c - 2.5, cz = r - 2.5;
  return tween(.55, function (e) { T.mesh.position.y = .004 + (1 - e) * 1.4; T.mesh.rotation.set(.35 * (1 - e), .6 * (1 - e), -.2 * (1 - e)); }, EASE.in).then(function () {
    T.mesh.position.y = .004; T.mesh.rotation.set(0, 0, 0); T.landing = false; FX.splash(cx, cz, .65); emit('place', { c: c, r: r });
    return tween(.3, function (e) { T.mesh.position.y = .004 + Math.sin(e * Math.PI) * .05; }, EASE.lin);
  });
};
TWKit.removeTile = function (c, r) {
  var key = c + ',' + r, T = S.tiles[key]; if (!T) return Promise.resolve(); delete S.tiles[key];
  if (K.mode === '2d' || !K.on) { R2.untile(T); return Promise.resolve(); }
  K.gTiles.remove(T.mesh); T.mesh.material.dispose(); return Promise.resolve();
};
/* destroyTile(c,r): the tile (or leviathan tile) cracks, shakes, sinks and shatters into foam and splinters */
TWKit.destroyTile = function (c, r) {
  var key = c + ',' + r, T = S.tiles[key] || S.levs[key]; if (!T) return Promise.resolve(); var isLev = !S.tiles[key]; if (isLev) delete S.levs[key]; else delete S.tiles[key];
  var cx = c - 2.5, cz = r - 2.5; emit('destroy', { c: c, r: r });
  if (K.mode === '2d' || !K.on) { R2.destroy(T, isLev); return delay(.5); }
  var m = T.mesh, grp = T.group; TWKit.shake(.05, 500);
  if (T.cps) T.cps.forEach(function (P) { for (var i = 0; i < 8; i++) { var q = bez(P, i / 7); emitP(true, wx(c, q[0]), .12, wz(r, q[1]), (Math.random() - .5) * 2, 1.6 + Math.random() * 1.4, (Math.random() - .5) * 2, .8, .06, .01, CY, 1, 4, .5); } });
  return tween(.5, function (e, k) { m.position.x = cx + Math.sin(k * 70) * .018; m.position.z = cz + Math.cos(k * 60) * .014; if (m.material.emissive) m.material.emissive.setRGB(.5 * e, .25 * e, .08 * e); }, EASE.lin).then(function () {
    FX.chips(cx, cz, 30); FX.splash(cx, cz, 1.2); FX.sparks(cx, .15, cz, 16, WHITE); FX.flash(cx, .2, cz, 1, [.8, 1, 1]);
    return tween(.7, function (e) { m.position.set(cx, .004 - e * .7, cz); m.rotation.set(e * .9, e * 1.7, e * -.6); m.scale.setScalar(1 - e * .5); if (grp) grp.position.y = TILE_TOP - e * 1.2; }, EASE.in);
  }).then(function () { K.gTiles.remove(m); if (grp) K.gMisc.remove(grp); m.material.dispose(); });
};
TWKit.clearBoard = function () {
  Object.keys(S.tiles).slice().forEach(function (k) { var a = k.split(','); TWKit.removeTile(+a[0], +a[1]); });
  Object.keys(S.levs).slice().forEach(function (k) { var a = k.split(','); TWKit.removeLeviathan(+a[0], +a[1], { silent: true }); });
  Object.keys(S.ships).slice().forEach(function (id) { TWKit.removeShip(id); });
  TWKit.ghost(null); TWKit.setLegal([]); TWKit.clearDice(); TWKit.highlightLine(null);
  Object.keys(S.gates).slice().forEach(function (k) { var a = k.split(','); TWKit.riftGate(+a[0], +a[1], false); });
  Object.keys(S.mael).slice().forEach(function (k) { var a = k.split(','); TWKit.maelstrom(+a[0], +a[1], false); });
};

/* ------------------------------------------------------------------ leviathans: tube creatures */
function makeTube(N, Rr) {
  var np = (N + 1) * (Rr + 1), pos = new Float32Array(np * 3), uv = new Float32Array(np * 2), idx = [];
  for (var i = 0; i <= N; i++) for (var j = 0; j <= Rr; j++) { uv[(i * (Rr + 1) + j) * 2] = j / Rr * 3; uv[(i * (Rr + 1) + j) * 2 + 1] = i / N * 9; }
  for (var a = 0; a < N; a++) for (var b = 0; b < Rr; b++) { var p = a * (Rr + 1) + b, q = p + Rr + 1; idx.push(p, q, p + 1, q, q + 1, p + 1); }
  var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); g.setIndex(idx);
  var P = [], T = []; for (var k = 0; k <= N; k++) { P.push(new THREE.Vector3()); T.push(new THREE.Vector3()); }
  var n = new THREE.Vector3(), bn = new THREE.Vector3(), ref = new THREE.Vector3();
  return {
    geo: g, P: P, T: T, update: function (fn, rad) {
      for (var i = 0; i <= N; i++) { var v = fn(i / N); P[i].set(v[0], v[1], v[2]); }
      for (var i2 = 0; i2 <= N; i2++) { var a2 = P[Math.max(0, i2 - 1)], b2 = P[Math.min(N, i2 + 1)]; T[i2].subVectors(b2, a2).normalize(); }
      ref.set(1, 0, 0); if (Math.abs(T[0].x) > .9) ref.set(0, 0, 1); n.crossVectors(T[0], ref).normalize();
      for (var i3 = 0; i3 <= N; i3++) {
        var t = T[i3]; n.addScaledVector(t, -n.dot(t)).normalize(); bn.crossVectors(t, n); var r = rad(i3 / N);
        for (var j = 0; j <= Rr; j++) { var an = j / Rr * Math.PI * 2, cs = Math.cos(an) * r, sn = Math.sin(an) * r, o = (i3 * (Rr + 1) + j) * 3; pos[o] = P[i3].x + n.x * cs + bn.x * sn; pos[o + 1] = P[i3].y + n.y * cs + bn.y * sn; pos[o + 2] = P[i3].z + n.z * cs + bn.z * sn; }
      }
      g.attributes.position.needsUpdate = true; g.computeVertexNormals(); g.computeBoundingSphere();
    }
  };
}
var LEV_PAL = { serpent: { a: '#1f9a8a', b: '#0b4a56', fin: '#e3b24b', eye: '#ffd76b' }, dragon: { a: '#c8402f', b: '#5a1410', fin: '#f0c14b', eye: '#fff0a0' } };
function buildLevCreature(L) {
  var pal = LEV_PAL[L.kind], N = GFX[K.q].parts >= 1 ? 42 : 28, Rr = K.q === 'low' ? 8 : 12; L.tube = makeTube(N, Rr);
  var sc = ctex('scales:' + L.kind, 256, 256, function (x, w, h) { paintScales(x, w, h, pal.a, pal.b); }, { repeat: true });
  var body = new THREE.Mesh(L.tube.geo, new THREE.MeshStandardMaterial({ map: sc, roughness: .38, metalness: .15, emissive: new THREE.Color(pal.b), emissiveIntensity: .25 })); body.frustumCulled = false;
  var g = new THREE.Group(); g.add(body); L.body = body;
  var head = new THREE.Group(), hm = new THREE.MeshStandardMaterial({ color: pal.a, roughness: .35, metalness: .2, map: sc }), em = new THREE.MeshBasicMaterial({ color: pal.eye });
  var sk = new THREE.Mesh(new THREE.SphereGeometry(.058, 16, 12), hm); sk.scale.set(1.55, .88, .9); head.add(sk);
  var sn = new THREE.Mesh(new THREE.SphereGeometry(.04, 12, 10), hm); sn.scale.set(1.5, .7, .8); sn.position.set(.07, -.008, 0); head.add(sn);
  var jaw = new THREE.Mesh(new THREE.SphereGeometry(.04, 12, 10), new THREE.MeshStandardMaterial({ color: pal.b, roughness: .5 })); jaw.scale.set(1.9, .5, .8); jaw.position.set(.045, -.04, 0); jaw.rotation.z = -.2; head.add(jaw); L.jaw = jaw;
  [-1, 1].forEach(function (sd) {
    var e = new THREE.Mesh(new THREE.SphereGeometry(.015, 8, 8), em); e.position.set(.035, .026, sd * .042); head.add(e);
    var h2 = new THREE.Mesh(new THREE.ConeGeometry(.014, L.kind === 'dragon' ? .1 : .06, 6), new THREE.MeshStandardMaterial({ color: '#f2e2b4', roughness: .4 })); h2.position.set(-.035, .06, sd * .03); h2.rotation.set(sd * .35, 0, .9); head.add(h2);
    if (L.kind === 'dragon') { var cu = new THREE.CatmullRomCurve3([new THREE.Vector3(.09, -.01, sd * .015), new THREE.Vector3(.14, -.05, sd * .09), new THREE.Vector3(.1, -.11, sd * .15), new THREE.Vector3(.17, -.14, sd * .2)]); head.add(new THREE.Mesh(new THREE.TubeGeometry(cu, 14, .004, 4), new THREE.MeshStandardMaterial({ color: pal.fin, roughness: .4, metalness: .4 }))); }
    else { var fn = new THREE.Mesh(new THREE.ConeGeometry(.03, .09, 4), new THREE.MeshStandardMaterial({ color: pal.fin, roughness: .45, metalness: .3 })); fn.position.set(-.05, 0, sd * .06); fn.rotation.set(sd * 1.2, 0, 1.2); head.add(fn); }
  });
  g.add(head); L.head = head; L.fins = [];
  var fm = new THREE.MeshStandardMaterial({ color: pal.fin, roughness: .4, metalness: .45, emissive: new THREE.Color(pal.fin), emissiveIntensity: .12 });
  for (var i = 0; i < 11; i++) { var f = new THREE.Mesh(new THREE.ConeGeometry(.026, .09, 4), fm); g.add(f); L.fins.push(f); }
  g.traverse(function (o) { if (o.isMesh) o.castShadow = true; });
  return g;
}
function levPoint(s, t, L) {
  var turns = 1.05, ang = L.a0 + s * turns * 6.283 + Math.sin(t * .6 + L.ph) * .3;
  var rad = .15 * (1 - .3 * s) + .018 * Math.sin(s * 12 - t * 2.4 + L.ph) + .09 * sstep(.78, 1, s) + .03 * L.roar;
  var H = (.6 + .16 * L.roar) * L.rise, y = -.34 + (.34 + H) * Math.pow(s, .88) - .08 * sstep(.88, 1, s) * L.rise;
  return [Math.cos(ang) * rad, y, Math.sin(ang) * rad];
}
var _vx = null, _vy = null;
function updLev(L, t) {
  if (!L.group || !L.group.visible) return; var tube = L.tube; if (!_vx) { _vx = new THREE.Vector3(1, 0, 0); _vy = new THREE.Vector3(0, 1, 0); }
  tube.update(function (s) { return levPoint(s, t, L); }, function (s) { return .078 * (1 - .42 * s) * (.5 + .5 * Math.min(1, s * 14 + .3)); });
  var P = tube.P, N = P.length - 1, hp = P[N], ht = tube.T[N]; L.head.position.copy(hp).addScaledVector(ht, .03);
  var dir = ht.clone(); dir.y -= .05 + .05 * L.roar; dir.normalize(); L.head.quaternion.setFromUnitVectors(_vx, dir); L.jaw.rotation.z = -.2 - .55 * L.roar - .06 * Math.sin(t * 2);
  L.fins.forEach(function (f, i) { var s = .1 + i / 10 * .78, idx = Math.round(s * N), p = P[idx]; var out = new THREE.Vector3(p.x, 0, p.z).normalize().multiplyScalar(.7).add(new THREE.Vector3(0, .75, 0)).normalize(); f.position.copy(p).addScaledVector(out, .042 * (1 - .4 * s)); f.quaternion.setFromUnitVectors(_vy, out); f.scale.setScalar(.45 + .4 * Math.sin(Math.PI * s)); f.visible = L.rise > .05; });
}
/* placeLeviathan(c,r,{arrows:[{dir:0..7,n:1..6}],kind:'serpent'|'dragon',rot,animate}) -> Promise (after it has risen).
 * dir 0 = north, 1 = north-east ... 7 = north-west; arrows are printed on the tile and the leviathan coils up out of the water. */
TWKit.placeLeviathan = function (c, r, o) {
  o = o || {}; var key = c + ',' + r; if (S.levs[key]) TWKit.removeLeviathan(c, r, { silent: true });
  var arrows = (o.arrows || []).map(function (a) { return { dir: ((a.dir + 2 * (o.rot || 0)) % 8 + 8) % 8, n: a.n }; });
  var L = S.levs[key] = { c: c, r: r, arrows: arrows, kind: o.kind || ((hashStr(key) & 1) ? 'dragon' : 'serpent'), rise: 0, roar: 0, a0: (hashStr(key) % 628) / 100, ph: (hashStr(key + 'p') % 628) / 100 };
  if (K.mode === '2d' || !K.on) { R2.lev(L); emit('place', { c: c, r: r, leviathan: true }); return Promise.resolve(); }
  L.mesh = slabMesh(); retexLev(L); L.mesh.position.set(c - 2.5, 0, r - 2.5); K.gTiles.add(L.mesh);
  L.group = buildLevCreature(L); L.group.position.set(c - 2.5, TILE_TOP - .002, r - 2.5); L.group.scale.setScalar(1.55); L.group.visible = false; K.gMisc.add(L.group); L.mesh.userData.lev = L; L.mesh.group = L.group;
  var cx = c - 2.5, cz = r - 2.5;
  if (o.animate === false) { L.rise = 1; L.group.visible = true; L.mesh.position.y = .004; return Promise.resolve(); }
  L.mesh.position.y = 1.4;
  return tween(.5, function (e) { L.mesh.position.y = .004 + (1 - e) * 1.4; }, EASE.in).then(function () {
    L.mesh.position.y = .004; FX.splash(cx, cz, .8); emit('place', { c: c, r: r, leviathan: true }); L.group.visible = true; emit('roar', { c: c, r: r }); TWKit.shake(.04, 400);
    return tween(1.5, function (e) { L.rise = e; if (Math.random() < .25) emitP(false, cx + (Math.random() - .5) * .4, TILE_TOP, cz + (Math.random() - .5) * .4, 0, .5, 0, .8, .05, .1, FOAM, .7, 0, 0); }, EASE.back);
  });
};
TWKit.removeLeviathan = function (c, r, o) {
  var key = c + ',' + r, L = S.levs[key]; if (!L) return Promise.resolve(); delete S.levs[key];
  if (K.mode === '2d' || !K.on) { R2.unlev(L); return Promise.resolve(); }
  if (o && o.silent) { K.gTiles.remove(L.mesh); K.gMisc.remove(L.group); return Promise.resolve(); }
  return tween(.9, function (e) { L.rise = 1 - e; }, EASE.io).then(function () { FX.splash(c - 2.5, r - 2.5, .6); K.gTiles.remove(L.mesh); K.gMisc.remove(L.group); });
};
/* leviathanRoar(c,r): rears up, jaw open, ripple (use when it eats a junk) */
TWKit.leviathanRoar = function (c, r) { var L = S.levs[c + ',' + r]; if (!L) return Promise.resolve(); emit('roar', { c: c, r: r }); if (!K.on) { R2.pulse(c, r); return delay(.6); } ripple(c - 2.5, r - 2.5, 1.2, 1, FOAM); TWKit.shake(.05, 500); return tween(1.1, function (e, k) { L.roar = Math.sin(k * Math.PI); }, EASE.lin).then(function () { L.roar = 0; }); };
