
/* ------------------------------------------------------------------ particles (two pools: normal + additive) */
var PCAP = 900;
function makePool(additive) {
  var geo = new THREE.BufferGeometry(); var pos = new Float32Array(PCAP * 3), sz = new Float32Array(PCAP), col = new Float32Array(PCAP * 4);
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('aSize', new THREE.BufferAttribute(sz, 1)); geo.setAttribute('aCol', new THREE.BufferAttribute(col, 4));
  var mat = new THREE.ShaderMaterial({
    uniforms: { uScale: { value: 600 } }, transparent: true, depthWrite: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
    vertexShader: 'attribute float aSize;attribute vec4 aCol;varying vec4 vC;uniform float uScale;void main(){vC=aCol;vec4 mv=modelViewMatrix*vec4(position,1.);gl_PointSize=max(0.,aSize*uScale/-mv.z);gl_Position=projectionMatrix*mv;}',
    fragmentShader: 'varying vec4 vC;void main(){vec2 p=gl_PointCoord-.5;float d=length(p);float a=smoothstep(.5,.12,d);gl_FragColor=vec4(vC.rgb,vC.a*a);}'
  });
  var pts = new THREE.Points(geo, mat); pts.frustumCulled = false; pts.renderOrder = 8; K.gFx.add(pts);
  var P = []; for (var i = 0; i < PCAP; i++) P.push({ on: false, x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, t: 0, l: 1, s0: .1, s1: .1, r: 1, g: 1, b: 1, a: 1, gr: 0, dr: 0 });
  return { geo: geo, p: P, i: 0, material: mat, points: pts, pos: pos, sz: sz, col: col };
}
function buildParticles() { K.pt = { n: makePool(false), a: makePool(true) }; }
function pool(add) { return add ? K.pt.a : K.pt.n; }
function emitP(add, x, y, z, vx, vy, vz, life, s0, s1, rgb, a, gr, dr) {
  if (!K.pt) return; var P = pool(add), n = GFX[K.q].parts; if (n < 1 && Math.random() > n) return;
  var p = P.p[P.i]; P.i = (P.i + 1) % PCAP; p.on = true; p.x = x; p.y = y; p.z = z; p.vx = vx; p.vy = vy; p.vz = vz; p.t = 0; p.l = life; p.s0 = s0; p.s1 = s1; p.r = rgb[0]; p.g = rgb[1]; p.b = rgb[2]; p.a = a; p.gr = gr || 0; p.dr = dr || 0;
}
function updParticles(dt) {
  if (!K.pt) return;
  [K.pt.n, K.pt.a].forEach(function (P) {
    var any = false;
    for (var i = 0; i < PCAP; i++) {
      var p = P.p[i];
      if (!p.on) { P.sz[i] = 0; continue; }
      p.t += dt; if (p.t >= p.l) { p.on = false; P.sz[i] = 0; any = true; continue; }
      var k = p.t / p.l, dr = Math.max(0, 1 - p.dr * dt);
      p.vy -= p.gr * dt; p.vx *= dr; p.vz *= dr; p.vy *= (p.gr ? 1 : dr);
      p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
      if (p.gr && p.y < .02) { p.y = .02; p.vy *= -.15; p.vx *= .5; p.vz *= .5; }
      P.pos[i * 3] = p.x; P.pos[i * 3 + 1] = p.y; P.pos[i * 3 + 2] = p.z; P.sz[i] = lerp(p.s0, p.s1, k);
      P.col[i * 4] = p.r; P.col[i * 4 + 1] = p.g; P.col[i * 4 + 2] = p.b; P.col[i * 4 + 3] = p.a * (k < .12 ? k / .12 : 1 - Math.pow((k - .12) / .88, 1.5)); any = true;
    }
    P.geo.attributes.position.needsUpdate = P.geo.attributes.aSize.needsUpdate = P.geo.attributes.aCol.needsUpdate = true;
  });
}
var WHITE = [.96, .98, .97], FOAM = [.82, .96, .93], WOOD = [.62, .38, .18], WOOD2 = [.36, .2, .1], SMOKE = [.36, .36, .38], FIRE = [1, .62, .18], GOLDC = [1, .78, .3], VIOL = [.72, .45, 1], CY = [.45, 1, .95];
var rippleP = [];
function ripple(x, z, r1, dur, rgb, w) {
  if (!K.on) return; var m = null; for (var i = 0; i < rippleP.length; i++) if (!rippleP[i].userData.on) { m = rippleP[i]; break; }
  if (!m) { if (rippleP.length > 28) return; m = new THREE.Mesh(new THREE.RingGeometry(.86, 1, 40), new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, side: THREE.DoubleSide })); m.rotation.x = -Math.PI / 2; m.renderOrder = 6; K.gFx.add(m); rippleP.push(m); }
  m.userData.on = true; m.visible = true; m.position.set(x, .045, z); m.material.color.setRGB(rgb ? rgb[0] : .9, rgb ? rgb[1] : 1, rgb ? rgb[2] : 1); var th = w || .14;
  tween(dur, function (e, k) { var rr = Math.max(.01, r1 * e); m.scale.set(rr, rr, rr); m.material.opacity = (1 - k) * .75; }, EASE.out).then(function () { m.userData.on = false; m.visible = false; });
}
var FX = {
  splash: function (x, z, s) {
    s = s || 1; if (K.on) { ripple(x, z, .55 * s, .8, FOAM); ripple(x, z, .9 * s, 1.1, WHITE); }
    for (var i = 0; i < 26; i++) { var a = Math.random() * 6.283, v = (.5 + Math.random() * 1) * s; emitP(false, x, .06, z, Math.cos(a) * v * .7, 1.8 * s + Math.random() * 1.6, Math.sin(a) * v * .7, .8 + Math.random() * .4, .06 * s, .02, WHITE, .95, 7, 0); }
    for (var j = 0; j < 8; j++) emitP(false, x + (Math.random() - .5) * .3, .07, z + (Math.random() - .5) * .3, 0, .15, 0, 1.2, .12 * s, .26 * s, FOAM, .7, 0, 1);
    if (K.q === 'high') R2fx('splash', x, z, s);
    emit('splash', { x: x, z: z, s: s });
  },
  chips: function (x, z, n) { for (var i = 0; i < (n || 22); i++) { var a = Math.random() * 6.283, v = .6 + Math.random() * 1.4; emitP(false, x, .12 + Math.random() * .1, z, Math.cos(a) * v, 1.5 + Math.random() * 2, Math.sin(a) * v, 1 + Math.random() * .6, .045 + Math.random() * .03, .03, Math.random() < .5 ? WOOD : WOOD2, 1, 8, .2); } },
  smoke: function (x, y, z, n, s) { for (var i = 0; i < (n || 8); i++) emitP(false, x + (Math.random() - .5) * .08, y, z + (Math.random() - .5) * .08, (Math.random() - .5) * .25, .35 + Math.random() * .4, (Math.random() - .5) * .25, 1.4 + Math.random(), .08 * (s || 1), .4 * (s || 1), SMOKE, .6, 0, .8); },
  sparks: function (x, y, z, n, rgb) { for (var i = 0; i < (n || 20); i++) { var a = Math.random() * 6.283, b = Math.random() * 3.14, v = 1 + Math.random() * 2.2; emitP(true, x, y, z, Math.cos(a) * Math.sin(b) * v, Math.cos(b) * v + 1, Math.sin(a) * Math.sin(b) * v, .5 + Math.random() * .5, .07, .01, rgb || GOLDC, 1, 5, .5); } },
  bubbles: function (x, z, n) { for (var i = 0; i < (n || 8); i++) emitP(false, x + (Math.random() - .5) * .3, .05, z + (Math.random() - .5) * .3, 0, .4 + Math.random() * .5, 0, .8 + Math.random() * .6, .05, .09, CY, .6, 0, 0); },
  flash: function (x, y, z, s, rgb) { emitP(true, x, y, z, 0, 0, 0, .28, .5 * s, 1.3 * s, rgb || FIRE, .9, 0, 0); emitP(true, x, y, z, 0, 0, 0, .18, .3 * s, .7 * s, [1, 1, .9], 1, 0, 0); }
};
function R2fx(kind, x, z, s) { if (K.mode === '2d') R2.fx(kind, x, z, s); }
TWKit.fx = function (kind, x, z, s) { var f = FX[kind]; if (f) { if (K.on) f(x, z, s); else R2.fx(kind, x, z, s); } };

/* flowing foam dots along every placed current path (High/Medium) */
function buildFlow() {
  var cap = 36 * 4 * 3, g = new THREE.CircleGeometry(.5, 8), m = new THREE.MeshBasicMaterial({ color: '#cffff4', transparent: true, opacity: .9, blending: THREE.AdditiveBlending, depthWrite: false });
  var mesh = new THREE.InstancedMesh(g, m, cap); mesh.frustumCulled = false; mesh.count = 0; mesh.renderOrder = 4; K.gMisc.add(mesh); K.flow = { mesh: mesh, cap: cap, d: new THREE.Object3D() };
}
function updFlow(t) {
  var F = K.flow; if (!F || !F.mesh.visible) return; var n = 0, d = F.d;
  Object.keys(S.tiles).forEach(function (k) {
    var T = S.tiles[k]; if (!T.mesh || T.landing || n >= F.cap - 12) return; var y = T.mesh.position.y + .098;
    T.cps.forEach(function (P, pi) { for (var j = 0; j < 3; j++) { var ph = (t * .22 + j / 3 + pi * .17) % 1, q = bez(P, ph), sc = .045 * Math.sin(Math.PI * ph) + .004; d.position.set(wx(T.c, q[0]), y, wz(T.r, q[1])); d.rotation.set(-Math.PI / 2, 0, 0); d.scale.set(sc, sc, sc); d.updateMatrix(); F.mesh.setMatrixAt(n++, d.matrix); } });
  });
  F.mesh.count = n; F.mesh.instanceMatrix.needsUpdate = true;
}

/* ------------------------------------------------------------------ hover / legal / ghost markers */
function buildMarkers() {
  var tx = ctex('sqglow', 128, 128, function (x, w) { var g = x.createRadialGradient(w / 2, w / 2, w * .2, w / 2, w / 2, w * .5); g.addColorStop(0, 'rgba(255,226,140,.0)'); g.addColorStop(.75, 'rgba(255,214,110,.22)'); g.addColorStop(1, 'rgba(255,214,110,.0)'); x.fillStyle = g; x.fillRect(0, 0, w, w); x.strokeStyle = 'rgba(255,230,150,.95)'; x.lineWidth = 5; x.strokeRect(10, 10, w - 20, w - 20); x.strokeStyle = 'rgba(255,255,255,.5)'; x.lineWidth = 2; x.strokeRect(16, 16, w - 32, w - 32); });
  K.sqTex = tx; K.mHover = new THREE.Mesh(new THREE.PlaneGeometry(.98, .98), new THREE.MeshBasicMaterial({ map: tx, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0 })); K.mHover.rotation.x = -Math.PI / 2; K.mHover.renderOrder = 5; K.gMisc.add(K.mHover);
  K.legalMat = new THREE.MeshBasicMaterial({ map: tx, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: .6, color: '#9bffe8' }); K.legalMeshes = [];
}
TWKit.hover = function (x, y) {
  if (K.mode === '2d') return R2.hover(x, y);
  if (!K.on) return null; var p = x == null ? null : pickAt(x, y, true); S.hover = p && p.kind === 'square' ? { c: p.c, r: p.r } : null; K.dirty = true; return p;
};
/* squares the player may legally choose: [{c,r}] (pulsing teal frames); [] clears */
TWKit.setLegal = function (list) { S.legal = (list || []).map(function (s) { return { c: s.c, r: s.r }; }); if (K.mode === '2d') return R2.legal(); if (!K.on) return; K.legalMeshes.forEach(function (m) { m.visible = false; });
  S.legal.forEach(function (s, i) { var m = K.legalMeshes[i]; if (!m) { m = new THREE.Mesh(new THREE.PlaneGeometry(.98, .98), K.legalMat); m.rotation.x = -Math.PI / 2; m.renderOrder = 5; K.gMisc.add(m); K.legalMeshes.push(m); } m.visible = true; m.position.set(s.c - 2.5, .1, s.r - 2.5); }); };
function updMarkers(t) {
  if (K.mHover) { var h = S.hover, tg = h ? .95 : 0; K.mHover.material.opacity = lerp(K.mHover.material.opacity, tg, .25); if (h) K.mHover.position.set(h.c - 2.5, .115, h.r - 2.5); K.mHover.visible = K.mHover.material.opacity > .01; }
  if (K.legalMat) K.legalMat.opacity = .45 + .25 * Math.sin(t * 4);
}

/* ------------------------------------------------------------------ picking */
function ndc(x, y) { var rc = K.canvas.getBoundingClientRect(); K.ndc.set(((x - rc.left) / rc.width) * 2 - 1, -((y - rc.top) / rc.height) * 2 + 1); }
function groundHit() { K.ray.setFromCamera(K.ndc, K.cam); var o = K.ray.ray.origin, d = K.ray.ray.direction; if (Math.abs(d.y) < 1e-5) return null; var t = -o.y / d.y; if (t < 0) return null; return [o.x + d.x * t, o.z + d.z * t]; }
function pickAt(cx, cy, noShip) {
  ndc(cx, cy); applyCam(); K.cam.updateMatrixWorld(); var g = groundHit(); if (!g) return null; return pickWorld(g[0], g[1], noShip);
}
function pickWorld(x, z, noShip) {
  if (!noShip) { var best = null, bd = .3; Object.keys(S.ships).forEach(function (id) { var s = S.ships[id]; if (!s.alive) return; var d = Math.hypot(s.x - x, s.z - z - 0); if (d < bd) { bd = d; best = s; } }); if (best) return { kind: 'ship', id: best.id, c: best.c, r: best.r, port: best.port }; }
  // start marks (outer ports)
  for (var c = 0; c < 6; c++) for (var r = 0; r < 6; r++) {
    if (c && c < 5 && r && r < 5) continue;
    for (var p = 0; p < 8; p++) { var e = TWKit.portEdge(c, r, p); if (!e) continue; var pw = portWorld(c, r, p); if (Math.hypot(pw[0] - x, pw[1] - z) < .16) return { kind: 'start', c: c, r: r, port: p, edge: e.edge, index: e.index }; }
  }
  var cc = Math.floor(x + G), rr = Math.floor(z + G);
  if (cc >= 0 && cc < 6 && rr >= 0 && rr < 6) return { kind: 'square', c: cc, r: rr, tile: !!S.tiles[cc + ',' + rr], leviathan: !!S.levs[cc + ',' + rr] };
  return null;
}
/* pick(clientX, clientY) -> {kind:'ship'|'start'|'square', ...} | null */
TWKit.pick = function (x, y) { if (K.mode === '2d') return R2.pick(x, y); if (!K.on) return null; return pickAt(x, y, false); };
TWKit.pick2D = function (el) { return R2.pickEl(el); };
