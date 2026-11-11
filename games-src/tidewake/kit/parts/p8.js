
/* ------------------------------------------------------------------ ghost preview + traced path */
function ribbon(pts, w, y, mat) {
  var n = pts.length, pos = new Float32Array(n * 2 * 3), idx = [];
  for (var i = 0; i < n; i++) { var a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz) || 1, px = -dz / L * w, pz = dx / L * w; pos.set([pts[i][0] + px, y, pts[i][1] + pz, pts[i][0] - px, y, pts[i][1] - pz], i * 6); if (i < n - 1) idx.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 2, i * 2 + 1, i * 2 + 3); }
  var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setIndex(idx); var m = new THREE.Mesh(g, mat); m.renderOrder = 7; return m;
}
/* ghost(c,r,paths,{rot,valid=true,enter:port,trace:[{c,r,from,to}...]}) : translucent preview of a tile placement with the resulting path traced in gold.
 * enter = the port the active junk would enter this square from; or pass `trace` (steps through several tiles, e.g. from TWKit.trace). ghost(null) clears. */
TWKit.ghost = function (c, r, paths, o) {
  if (S.ghost && S.ghost.g && K.on) { K.gMisc.remove(S.ghost.g); S.ghost.g.traverse(function (x) { if (x.material && x.material.dispose && x.material !== K.ghostRibMat) x.material.dispose(); if (x.isMesh && x.geometry && x.geometry !== tgeo) x.geometry.dispose(); }); }
  S.ghost = null; if (c == null) { if (K.mode === '2d') R2.ghost(); return; } o = o || {}; paths = rotPaths(normPaths(paths), o.rot || 0);
  var valid = o.valid !== false, trace = o.trace || (o.enter != null ? TWKit.trace((function () { var t = {}; t[c + ',' + r] = paths; return t; })(), c, r, o.enter, 1) : []);
  var G0 = S.ghost = { c: c, r: r, paths: paths, valid: valid, trace: trace };
  if (K.mode === '2d' || !K.on) { R2.ghost(); return; }
  var g = new THREE.Group(), s = tsize(), sg = sig(paths), m = slabMesh();
  m.material = new THREE.MeshStandardMaterial({ map: ctex('cur:' + sg + ':' + s, s, s, function (x, w) { paintCurrent(x, w, paths, 'map'); }), emissiveMap: ctex('curg:' + sg + ':' + s, s, s, function (x, w) { paintCurrent(x, w, paths, 'glow'); }), emissive: new THREE.Color(valid ? '#ffffff' : '#ff5a4a'), emissiveIntensity: .7, transparent: true, opacity: .8, roughness: .5, color: valid ? '#ffffff' : '#ff9a8a' }); m.castShadow = false; g.add(m); G0.mesh = m;
  g.position.set(c - 2.5, .16, r - 2.5);
  if (trace.length) { var pts = routePts(trace); K.ghostRibMat = K.ghostRibMat || new THREE.MeshBasicMaterial({ color: '#ffd978', transparent: true, opacity: .85, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }); var rib = ribbon(pts, .03, .2, K.ghostRibMat); rib.position.y = 0; K.gMisc.add(rib); G0.rib = rib; G0.pts = pts; }
  K.gMisc.add(g); G0.g = g; var oldRem = G0.g; G0.g = new THREE.Group(); G0.g.add(g); if (G0.rib) { K.gMisc.remove(G0.rib); G0.g.add(G0.rib); } K.gMisc.remove(g); K.gMisc.add(G0.g);
};
function updGhost(t, dt) {
  var G0 = S.ghost; if (!G0 || !G0.g || !K.on) return; G0.mesh.parent.position.y = .17 + Math.sin(t * 3) * .015;
  if (G0.pts && G0.pts.length > 1) { var u = (t * .6) % 1, f = u * (G0.pts.length - 1), i = Math.floor(f), a = G0.pts[i], b = G0.pts[Math.min(G0.pts.length - 1, i + 1)], k = f - i; emitP(true, lerp(a[0], b[0], k), .24, lerp(a[1], b[1], k), 0, .05, 0, .5, .09, .02, GOLDC, 1, 0, 0); }
}

/* ------------------------------------------------------------------ per-frame scene update */
function update3D(dt, t) {
  updShips(dt, t); updParticles(dt); updMarkers(t); updGhost(t, dt);
  Object.keys(S.levs).forEach(function (k) { updLev(S.levs[k], t); });
  if (K.q !== 'low') Object.keys(S.tiles).forEach(function (k) { var T = S.tiles[k]; if (T.mesh && T.mesh.material.emissiveIntensity != null) T.mesh.material.emissiveIntensity = .3 + .1 * Math.sin(t * 1.7 + T.c * .9 + T.r * 1.3); });
  updFlow(t);
  Object.keys(S.gates).forEach(function (k) { var G_ = S.gates[k]; if (!G_.disc) return; G_.disc.material.uniforms.uT.value = t; G_.runes.rotation.z = t * .6; G_.up.position.y = .5 + Math.sin(t * 1.5) * .02; G_.glow.material.opacity = .14 + .06 * Math.sin(t * 3); if (Math.random() < .25) { var a = Math.random() * 6.283; emitP(true, G_.g.position.x + Math.cos(a) * .35, G_.g.position.y + .5 + Math.sin(a) * .3, G_.g.position.z + .1, 0, .3, 0, 1, .05, .01, G_.pal && G_.color === 'gold' ? GOLDC : VIOL, 1, 0, 0); } });
  Object.keys(S.mael).forEach(function (k) { var M_ = S.mael[k]; if (M_.mat) M_.mat.uniforms.uT.value = t; });
  Object.keys(S.markers).forEach(function (k) { var m = S.markers[k]; if (m.g) { m.g.position.y = .14 + Math.sin(t * 2) * .02; m.glow.material.opacity = .3 + .12 * Math.sin(t * 3); } });
  Object.keys(S.waveTiles).forEach(function (k) { var W = S.waveTiles[k]; if (W.g) { W.m.rotation.z = Math.sin(t * 1.4) * .04; W.m.position.y = Math.sin(t * 1.8) * .02; if (Math.random() < .25) emitP(false, W.g.position.x + .3 + Math.random() * .1, .45, W.g.position.z + (Math.random() - .5) * .6, .4, .8, 0, .7, .06, .02, WHITE, .8, 3, 0); } });
  if (S.line && S.line.m) S.line.m.material.opacity = .22 + .12 * Math.sin(t * 4);
}

/* ------------------------------------------------------------------ main loop, stats */
function loop(t) {
  if (!K.loopOn) return; raf(loop);
  var fr = K.frame, rdt = fr.last ? Math.min(5, (t - fr.last) / 1000) : .016, interval = fr.last ? t - fr.last : 16; fr.last = t;
  var dt = Math.min(.1, rdt) * K.speed; K.dt = dt; K.clock = (K.clock || 0) + dt;
  updTw(dt);
  if (K.on) {
    if (K.lost) return; update3D(dt, K.clock); applyCam(); var t0 = now(); K.r.info.autoReset = false; K.r.info.reset(); K.r.render(K.scene, K.cam); var rt = now() - t0;
    fr.hist.push(interval); if (fr.hist.length > 120) fr.hist.shift(); fr.rh.push(rt); if (fr.rh.length > 120) fr.rh.shift(); fr.n++;
    if (K.pref === 'auto' && fr.hist.length >= 60) { var bad = fr.bad || 0; if (interval > 55) bad += interval; else bad = Math.max(0, bad - interval * .5); fr.bad = bad; if (bad > 3000) { fr.bad = 0; var nq = K.q === 'high' ? 'medium' : K.q === 'medium' ? 'low' : null; if (nq) { applyQ(nq); if (K.hooks.onQuality) K.hooks.onQuality(nq); } } }
  } else { R2.update(dt, K.clock); fr.hist.push(interval); if (fr.hist.length > 120) fr.hist.shift(); fr.n++; }
  if (K.hooks.onFrame && fr.n % 30 === 0) { try { K.hooks.onFrame(TWKit.stats()); } catch (e) {} }
}
TWKit.stats = function () {
  var f = K.frame, avg = function (a) { if (!a || !a.length) return 0; var s = 0; for (var i = 0; i < a.length; i++) s += a[i]; return s / a.length; }, r = K.r ? K.r.info.render : {};
  return { mode: K.mode, quality: K.q, frameMs: +avg(f.hist).toFixed(2), renderMs: +avg(f.rh).toFixed(2), fps: f.hist.length ? +(1000 / avg(f.hist)).toFixed(1) : 0, draws: r.calls || 0, triangles: r.triangles || 0, frames: f.n };
};
TWKit.resetStats = function () { K.frame.hist = []; K.frame.rh = []; K.frame.n = 0; K.frame.bad = 0; };
TWKit.renderOnce = function () { if (K.on) { update3D(0, K.clock || 0); applyCam(); K.r.render(K.scene, K.cam); } };
/* advance(sec): step the simulation deterministically without waiting for frames (tests / screenshots) */
TWKit.advance = function (sec) { var n = Math.ceil(sec * 30); for (var i = 0; i < n; i++) { K.dt = 1 / 30; K.clock = (K.clock || 0) + 1 / 30; updTw(1 / 30); if (K.on) update3D(1 / 30, K.clock); else R2.update(1 / 30, K.clock); } if (K.on) { applyCam(); K.r.render(K.scene, K.cam); } };
TWKit.isAnimating = function () { return K.tw.length > 0 || Object.keys(S.ships).some(function (k) { return S.ships[k].moving; }); };
TWKit.getState = function () { return { tiles: Object.keys(S.tiles).map(function (k) { var t = S.tiles[k]; return { c: t.c, r: t.r, paths: t.paths }; }), leviathans: Object.keys(S.levs).map(function (k) { var t = S.levs[k]; return { c: t.c, r: t.r, arrows: t.arrows, kind: t.kind }; }), ships: Object.keys(S.ships).map(function (k) { var s = S.ships[k]; return { id: s.id, color: s.color, c: s.c, r: s.r, port: s.port, alive: s.alive }; }), gates: Object.keys(S.gates), maelstroms: Object.keys(S.mael), mode: K.mode }; };
TWKit.dispose = function () {
  K.loopOn = false; if (K.on) { K.scene.traverse(function (o) { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(function (m) { if (m.map) m.map.dispose(); m.dispose(); }); }); K.r.dispose(); } else if (K.fallback) K.fallback.innerHTML = '';
  K.on = false; Object.keys(texCache).forEach(function (k) { texCache[k].dispose(); delete texCache[k]; }); S.tiles = {}; S.levs = {}; S.ships = {}; S.gates = {}; S.mael = {}; S.dice = []; S.markers = {}; S.waveTiles = {}; K.tw = []; K.pt = null; hullG = null; tgeo = null; dieG = null; waveG = null; rippleP = [];
};
TWKit._K = K; TWKit._S = S;
