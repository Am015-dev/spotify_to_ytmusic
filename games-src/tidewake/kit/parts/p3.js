
/* ------------------------------------------------------------------ tween / events */
function tween(dur, fn, ease) { return new Promise(function (res) { K.tw.push({ t: 0, d: Math.max(1e-3, dur), fn: fn, e: ease || EASE.io, res: res }); K.dirty = true; }); }
function delay(s) { return tween(s, function () {}, EASE.lin); }
function updTw(dt) {
  var a = K.tw; if (!a.length) return;
  for (var i = 0; i < a.length;) {
    var w = a[i]; w.t += dt; var k = Math.min(1, w.t / w.d);
    try { w.fn(w.e(k), k); } catch (e) { if (global.console) console.warn('TWKit tween', e); k = 1; }
    if (k >= 1) { a.splice(i, 1); w.res(); } else i++;
  }
}
function emit(name, data) { var l = K.listeners[name]; if (l) l.forEach(function (f) { try { f(data || {}); } catch (e) {} }); var a = K.listeners['*']; if (a) a.forEach(function (f) { try { f(name, data || {}); } catch (e) {} }); }
/* TWKit.on(name|'*', fn): fx events for audio hooks: splash, place, spawn, sail, collide, sink, destroy, dice, cannon, rift, wave, whirl, roar */
TWKit.on = function (n, f) { (K.listeners[n] = K.listeners[n] || []).push(f); };
TWKit.off = function (n, f) { var l = K.listeners[n]; if (l) { var i = l.indexOf(f); if (i >= 0) l.splice(i, 1); } };
TWKit.setSpeed = function (s) { K.speed = clamp(+s || 1, .05, 1000); return K.speed; };
TWKit.setHooks = function (h) { for (var k in h) K.hooks[k] = h[k]; };       // onFrame(stats), onQuality(q)
TWKit.isAnimating = function () { return K.tw.length > 0 || (K.pt && K.pt.some && false) || !!K.shk; };

/* ------------------------------------------------------------------ 3D setup */
TWKit.init = function (canvas, opts) {
  opts = opts || {}; K.opts = opts; K.canvas = canvas; K.fallback = opts.fallback || null;
  if (opts.onHover) K.onHover = opts.onHover; if (opts.onClick) K.onClick = opts.onClick;
  injectFonts(opts);
  try { var v = localStorage.getItem('tw_gfx'); if (v && (GFX[v] || v === 'auto')) K.pref = v; } catch (e) {}
  if (opts.quality) K.pref = opts.quality;
  if (!hasGL() || opts.force2D) return go2D();
  try { setup3D(canvas, opts); } catch (e) { if (global.console) console.warn('TWKit 3D init failed, using 2D', e); try { K.on = false; } catch (e2) {} return go2D(); }
  return { ok: true, mode: '3d', quality: K.q };
};
function go2D() { K.mode = '2d'; K.on = false; if (K.canvas && K.canvas.style) K.canvas.style.display = 'none'; if (K.fallback) { K.fallback.style.display = 'block'; R2.build(); } K.loopOn = true; raf(loop); return { ok: false, mode: '2d' }; }
function injectFonts(opts) {
  if (opts.fonts === false || typeof document === 'undefined') return;
  try { if (!document.querySelector('link[data-tw-fonts]')) { var l = document.createElement('link'); l.rel = 'stylesheet'; l.setAttribute('data-tw-fonts', '1'); l.href = 'https://fonts.googleapis.com/css2?family=IM+Fell+English+SC&family=Cormorant+Garamond:wght@500;700&display=swap'; document.head.appendChild(l); } } catch (e) {}
  var done = false;
  TWKit.ready = new Promise(function (res) {
    var fin = function () { if (done) return; done = true; if (K.on) repaintAll(); res(); };
    try { Promise.all([document.fonts.load("32px 'IM Fell English SC'"), document.fonts.load("700 32px 'Cormorant Garamond'")]).then(function () { setTimeout(fin, 30); }, fin); } catch (e) { fin(); }
    setTimeout(fin, opts.fontTimeout || 2500);
  });
}
TWKit.ready = Promise.resolve();
function autoQ() { var small = false; try { small = Math.min(innerWidth, innerHeight) < 600 || (matchMedia('(pointer:coarse)').matches && Math.max(innerWidth, innerHeight) < 1300); } catch (e) {} return small ? 'medium' : 'high'; }

function setup3D(canvas, opts) {
  var q = K.pref === 'auto' ? autoQ() : K.pref; K.q = GFX[q] ? q : 'high';
  var r = new THREE.WebGLRenderer({ canvas: canvas, antialias: GFX[K.q].aa, alpha: false, powerPreference: 'high-performance', preserveDrawingBuffer: !!opts.preserveDrawingBuffer });
  K.r = r; K.aniso = Math.min(8, r.capabilities.getMaxAnisotropy());
  r.outputColorSpace = THREE.SRGBColorSpace; r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.0; r.shadowMap.type = THREE.PCFSoftShadowMap;
  var sc = K.scene = new THREE.Scene(); sc.background = new THREE.Color('#10191c'); sc.fog = new THREE.Fog(0x10191c, 22, 48);
  K.cam = new THREE.PerspectiveCamera(32, 1.6, .5, 120); K.cs = { look: new THREE.Vector3(), pos: new THREE.Vector3(0, 12, 9), tgt: null, tilt: 56, yaw: 0, zoom: 1 };
  K.ray = new THREE.Raycaster(); K.ndc = new THREE.Vector2();
  K.envTex = envMap(r); sc.environment = K.envTex;
  K.hemi = new THREE.HemisphereLight(0xcfeeea, 0x4a3524, .55); sc.add(K.hemi);
  K.key = new THREE.DirectionalLight(0xffe9c8, 1.8); K.key.position.set(-6, 14, 9); K.key.shadow.bias = -.0004; K.key.shadow.normalBias = .03;
  var sh = K.key.shadow.camera; sh.left = -6.5; sh.right = 6.5; sh.top = 6.5; sh.bottom = -6.5; sh.near = 4; sh.far = 34; sc.add(K.key, K.key.target);
  K.rim = new THREE.DirectionalLight(0x9fd8ff, .9); K.rim.position.set(8, 6, -12); sc.add(K.rim);
  K.gBoard = new THREE.Group(); K.gTiles = new THREE.Group(); K.gShips = new THREE.Group(); K.gFx = new THREE.Group(); K.gMisc = new THREE.Group(); sc.add(K.gBoard, K.gTiles, K.gMisc, K.gShips, K.gFx);
  buildTable(); buildBoard(); buildParticles(); buildFlow(); buildMarkers();
  K.on = true; K.mode = '3d'; applyQ(K.q, true);
  var w = canvas.clientWidth || canvas.width || 800, h = canvas.clientHeight || canvas.height || 600; if (opts.width) { w = opts.width; h = opts.height; }
  K.w = w; K.h = h; resizeInternal(w, h);
  // replay model state into the scene (init after API calls is allowed)
  K.loopOn = true; raf(loop);
  canvas.addEventListener('pointermove', function (e) { if (K.onHover) { var p = TWKit.hover(e.clientX, e.clientY); K.onHover(p, e); } });
  canvas.addEventListener('click', function (e) { if (K.onClick) K.onClick(TWKit.pick(e.clientX, e.clientY), e); });
  canvas.addEventListener('pointerleave', function () { TWKit.hover(null); if (K.onHover) K.onHover(null); });
  canvas.addEventListener('webglcontextlost', function (e) { e.preventDefault(); K.lost = true; }, false);
  canvas.addEventListener('webglcontextrestored', function () { K.lost = false; }, false);
}
function applyQ(q, first) {
  K.q = q; var c = GFX[q], r = K.r; if (!r) return;
  r.setPixelRatio(Math.min(global.devicePixelRatio || 1, c.dpr));
  r.shadowMap.enabled = c.shadows; K.key.castShadow = c.shadows;
  if (c.shadows) { K.key.shadow.mapSize.set(c.map, c.map); if (K.key.shadow.map) { K.key.shadow.map.dispose(); K.key.shadow.map = null; } }
  if (K.flow) K.flow.mesh.visible = c.flow;
  K.hemi.intensity = q === 'low' ? 1.25 : .55; K.r.toneMappingExposure = q === 'low' ? 1.15 : 1.0;
  K.scene.environment = q === 'low' ? null : K.envTex; if (K.scene.fog) K.scene.fog.near = q === 'low' ? 1e5 : 22; if (K.scene.fog) K.scene.fog.far = q === 'low' ? 2e5 : 48;
  if (!first && K.boardTexQ !== c.board) { repaintAll(); }
  if (K.scene) K.scene.traverse(function (o) { if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(function (m) { m.needsUpdate = true; }); });
  if (K.w) resizeInternal(K.w, K.h);
  K.dirty = true;
}
TWKit.setQuality = function (q) { K.pref = (GFX[q] || q === 'auto') ? q : 'auto'; try { localStorage.setItem('tw_gfx', K.pref); } catch (e) {} if (K.on) { applyQ(K.pref === 'auto' ? autoQ() : K.pref); if (K.hooks.onQuality) K.hooks.onQuality(K.q); } return K.q; };
TWKit.getQuality = function () { return { pref: K.pref, active: K.q, mode: K.mode }; };
TWKit.getMode = function () { return K.mode; };
function repaintAll() {
  if (!K.on) return;
  Object.keys(texCache).forEach(function (k) { texCache[k].dispose(); delete texCache[k]; });
  if (K.boardMesh) { K.boardMesh.material.map = boardTex(); K.boardMesh.material.needsUpdate = true; }
  Object.keys(S.tiles).forEach(function (k) { var t = S.tiles[k]; if (t.mesh) { retexTile(t); } });
  Object.keys(S.levs).forEach(function (k) { var t = S.levs[k]; if (t.mesh) retexLev(t); });
  Object.keys(S.ships).forEach(function (k) { var s = S.ships[k]; if (s.g) { K.gShips.remove(s.g); s.g = null; buildShip3D(s); } });
  K.dirty = true;
}
function envMap(r) {
  var s = new THREE.Scene(), g = new THREE.SphereGeometry(20, 40, 20), pos = g.attributes.position, col = new Float32Array(pos.count * 3);
  var top = new THREE.Color('#bfe0ea'), hor = new THREE.Color('#ffe6bf'), bot = new THREE.Color('#2a5a60'), c = new THREE.Color();
  for (var i = 0; i < pos.count; i++) { var y = pos.getY(i) / 20; if (y > 0) c.copy(hor).lerp(top, Math.pow(y, .6)); else c.copy(hor).lerp(bot, Math.min(1, -y * 2.5)); c.toArray(col, i * 3); }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3)); s.add(new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide })));
  var box = function (x, y, z, w, h, k) { var m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(k, k * .95, k * .85), side: THREE.DoubleSide })); m.position.set(x, y, z); m.lookAt(0, 0, 0); s.add(m); };
  box(-8, 15, 8, 12, 8, 5); box(10, 9, -9, 8, 5, 2.2); box(0, 4, 18, 18, 3, 1.4);
  var pm = new THREE.PMREMGenerator(r); var rt = pm.fromScene(s, .03); pm.dispose(); return rt.texture;
}
function boardTex() { K.boardTexQ = GFX[K.q].board; return ctex('board', K.boardTexQ, K.boardTexQ, function (x, w) { paintBoard(x, w); }); }
function buildTable() {
  var t = ctex('table', 512, 512, function (x, w, h) { paintWood(x, w, h, '#5a3d28', '28,14,6', 21, false); }, { repeat: true }); t.repeat.set(7, 7);
  var m = new THREE.Mesh(new THREE.PlaneGeometry(90, 90), new THREE.MeshStandardMaterial({ map: t, roughness: .62, metalness: 0 })); m.rotation.x = -Math.PI / 2; m.position.y = -.31; m.receiveShadow = true; K.gBoard.add(m); K.table = m;
}
function rrShape(w, h, r) { var s = new THREE.Shape(), x = -w / 2, y = -h / 2; s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h); s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s; }
function buildBoard() {
  var wood = ctex('boardwood', 512, 512, function (x, w, h) { paintWood(x, w, h, '#6b2f20', '30,8,4', 5, false); });
  var g = new THREE.ExtrudeGeometry(rrShape(9.6, 9.6, .26), { depth: .26, bevelEnabled: true, bevelThickness: .045, bevelSize: .045, bevelSegments: 3, curveSegments: 6 }); g.rotateX(-Math.PI / 2); g.translate(0, -.36, 0);
  var pos = g.attributes.position, uv = g.attributes.uv; for (var i = 0; i < pos.count; i++) uv.setXY(i, pos.getX(i) / 4 + .5, pos.getZ(i) / 4 + .5);
  var slab = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map: wood, roughness: .35, metalness: .05 })); slab.castShadow = slab.receiveShadow = true; K.gBoard.add(slab);
  var plane = new THREE.Mesh(new THREE.PlaneGeometry(HALF * 2, HALF * 2), new THREE.MeshStandardMaterial({ map: boardTex(), roughness: .85, metalness: 0, color: '#a9bcbc' })); plane.rotation.x = -Math.PI / 2; plane.position.y = .004; plane.receiveShadow = true; K.gBoard.add(plane); K.boardMesh = plane;
  // gilt inner rim
  var rim = new THREE.Mesh(new THREE.TorusGeometry(1, 1, 4, 4), new THREE.MeshBasicMaterial()); rim.visible = false;
  [[0, 1], [0, -1], [1, 0], [-1, 0]].forEach(function (d) {
    var long = new THREE.Mesh(new THREE.BoxGeometry(d[0] ? .09 : HALF * 2 + .09, .05, d[0] ? HALF * 2 + .09 : .09), new THREE.MeshStandardMaterial({ color: '#d7a63f', metalness: .85, roughness: .32 }));
    long.position.set(d[0] * (HALF + .04), .022, d[1] * (HALF + .04)); long.castShadow = true; K.gBoard.add(long);
  });
}

/* ------------------------------------------------------------------ camera */
function applyCam() {
  var c = K.cam, s = K.cs; if (s.tgt) { var k = Math.min(1, (now() - s.tgt.t0) / s.tgt.d), e = EASE.io(k); s.look.lerpVectors(s.tgt.l0, s.tgt.l1, e); s.pos.lerpVectors(s.tgt.p0, s.tgt.p1, e); if (k >= 1) s.tgt = null; }
  c.position.copy(s.pos); if (K.shk) { var kk = (now() - K.shk.t0) / K.shk.d; if (kk >= 1) K.shk = null; else { var a = K.shk.amp * Math.pow(1 - kk, 2); c.position.x += Math.sin(kk * 60) * a; c.position.y += Math.cos(kk * 47) * a * .6; } }
  c.lookAt(s.look);
}
function viewRegion() {
  var x0 = -HALF - .12, x1 = HALF + .12, z0 = -HALF - .08, z1 = HALF + .1;
  if (K.view && K.view.region) return K.view.region;
  return [x0, x1, z0, z1];
}
/* fit the region on the ground into the viewport (minus reserved UI margins), keep tilt/yaw */
function fitCam(immediate, focus) {
  if (!K.cam) return; var s = K.cs, c = K.cam, rg = viewRegion(), R = K.reserve;
  var asp = K.w / K.h; c.aspect = asp; c.updateProjectionMatrix();
  var cx = (rg[0] + rg[1]) / 2, cz = (rg[2] + rg[3]) / 2; var look = new THREE.Vector3(cx, 0, cz); var zm = s.zoom || 1;
  if (focus) { look.set(focus.x, 0, focus.z); zm = focus.zoom || 2.2; }
  var tilt = s.tilt * Math.PI / 180, yaw = s.yaw * Math.PI / 180;
  var dir = new THREE.Vector3(Math.sin(yaw) * Math.cos(tilt), Math.sin(tilt), Math.cos(yaw) * Math.cos(tilt));
  var pts = focus ? null : [[rg[0], 0, rg[2]], [rg[1], 0, rg[2]], [rg[0], 0, rg[3]], [rg[1], 0, rg[3]], [rg[0], .3, rg[2]], [rg[1], .3, rg[2]]];
  var tmp = new THREE.PerspectiveCamera(c.fov, asp, c.near, c.far), v = new THREE.Vector3();
  var lo = 3, hi = 80, inside = function (d) {
    tmp.position.copy(look).addScaledVector(dir, d); tmp.lookAt(look); tmp.updateMatrixWorld(); tmp.updateProjectionMatrix(); tmp.matrixWorldInverse.copy(tmp.matrixWorld).invert();
    for (var i = 0; i < pts.length; i++) { v.set(pts[i][0], pts[i][1], pts[i][2]).applyMatrix4(tmp.matrixWorldInverse).applyMatrix4(tmp.projectionMatrix); if (v.x < -1 + 2 * R.l || v.x > 1 - 2 * R.r || v.y < -1 + 2 * R.b || v.y > 1 - 2 * R.t) return false; }
    return true;
  };
  var d;
  if (focus) { var half = 6 / zm / 2; d = half / Math.tan(c.fov * Math.PI / 360) / Math.min(1, asp) * 1.0; }
  else { for (var i = 0; i < 22; i++) { var m = (lo + hi) / 2; if (inside(m)) hi = m; else lo = m; } d = hi / zm; }
  // shift look so the region is centred in the free (unreserved) viewport
  var pos = look.clone().addScaledVector(dir, d);
  if (!focus) { var ox = (R.l - R.r) * .5, oy = (R.b - R.t) * .5; if (ox || oy) { var right = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), dir).normalize(), up = new THREE.Vector3().crossVectors(dir, right).normalize(); var wh = Math.tan(c.fov * Math.PI / 360) * d * 2; look.addScaledVector(right, -ox * wh * asp).addScaledVector(up, -oy * wh); pos = look.clone().addScaledVector(dir, d); } }
  if (immediate || !K.cs.init) { s.look.copy(look); s.pos.copy(pos); K.cs.init = true; s.tgt = null; }
  else s.tgt = { t0: now(), d: 650, l0: s.look.clone(), l1: look, p0: s.pos.clone(), p1: pos };
}
function resizeInternal(w, h) { K.w = w; K.h = h; if (!K.r) return; if (!K.cs.userTilt) K.cs.tilt = w / h < .8 ? 76 : 61; K.r.setSize(w, h, false); fitCam(true); if (K.pt) K.pt.n.material.uniforms.uScale.value = K.pt.a.material.uniforms.uScale.value = h * (global.devicePixelRatio ? Math.min(global.devicePixelRatio, GFX[K.q].dpr) : 1) / (2 * Math.tan(K.cam.fov * Math.PI / 360)) * 1.8; K.dirty = true; }
TWKit.resize = function (w, h) { K.w = w; K.h = h; if (K.on) resizeInternal(w, h); else if (K.mode === '2d') R2.resize(w, h); };
/* setView({tilt,yaw,zoom,reserve:{l,r,t,b}(fractions of the viewport hidden under UI),region:[x0,x1,z0,z1]|null}) */
TWKit.setView = function (v) {
  v = v || {}; if (v.tilt != null) { K.cs.tilt = clamp(v.tilt, 20, 90); K.cs.userTilt = true; } if (v.yaw != null) K.cs.yaw = v.yaw; if (v.zoom != null) K.cs.zoom = clamp(v.zoom, .5, 3);
  if (v.reserve) { K.reserve = { l: v.reserve.l || 0, r: v.reserve.r || 0, t: v.reserve.t || 0, b: v.reserve.b || 0 }; if (K.mode === '2d' && K.fallback) { var fs_ = K.fallback.style, R_ = K.reserve; fs_.boxSizing = 'border-box'; fs_.paddingLeft = R_.l * 100 + '%'; fs_.paddingRight = R_.r * 100 + '%'; fs_.paddingTop = R_.t * 100 + '%'; fs_.paddingBottom = R_.b * 100 + '%'; } }
  if ('region' in v) K.view = v.region ? { region: v.region } : null;
  if (K.on) fitCam(!!v.immediate);
};
TWKit.focus = function (c, r, zoom) { if (!K.on) return; var p = c == null ? null : { x: c - 2.5, z: r - 2.5, zoom: zoom || 2.2 }; fitCam(false, p); };
TWKit.shake = function (amp, ms) { K.shk = { t0: now(), d: ms || 450, amp: amp || .08 }; };
