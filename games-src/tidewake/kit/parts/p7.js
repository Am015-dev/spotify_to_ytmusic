
/* ------------------------------------------------------------------ dice */
var DIEV = [3, 4, 1, 6, 2, 5], dieG = null;
var DIEK = { gold: { f: ['#f3c957', '#c8912a'], p: ['#5c3a12', '#241004'] }, blue: { f: ['#4a82da', '#1e4aa0'], p: ['#fff8e2', '#d6cca4'] } };
function dieGeo() {
  if (dieG) return dieG; var h = .15, r = .045, inn = h - r, g = new THREE.BoxGeometry(.3, .3, .3, 5, 5, 5), p = g.attributes.position, nm = g.attributes.normal, v = new THREE.Vector3(), d = new THREE.Vector3();
  for (var i = 0; i < p.count; i++) { v.set(p.getX(i), p.getY(i), p.getZ(i)); var ix = clamp(v.x, -inn, inn), iy = clamp(v.y, -inn, inn), iz = clamp(v.z, -inn, inn); d.set(v.x - ix, v.y - iy, v.z - iz); var L = d.length(); if (L > 1e-6) { d.divideScalar(L); p.setXYZ(i, ix + d.x * r, iy + d.y * r, iz + d.z * r); nm.setXYZ(i, d.x, d.y, d.z); } }
  dieG = g; return g;
}
function dieMesh(kind) {
  var k = DIEK[kind] || DIEK.gold, mats = DIEV.map(function (v) { var t = ctex('die:' + kind + v, 128, 128, function (x, w) { paintDie(x, w, v, k.f, k.p, .095); }); var o = { map: t, roughness: .32, metalness: kind === 'gold' ? .35 : .05 }; return GFX[K.q].phys ? new THREE.MeshPhysicalMaterial(Object.assign(o, { clearcoat: .8, clearcoatRoughness: .2 })) : new THREE.MeshStandardMaterial(o); });
  var m = new THREE.Mesh(dieGeo(), mats); m.castShadow = true; m.scale.setScalar(1.7); return m;
}
function dieQuat(v, yaw) { var i = DIEV.indexOf(v), ns = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]][i], q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(ns[0], ns[1], ns[2]), new THREE.Vector3(0, 1, 0)); return new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw).multiply(q); }
function diceSide() { return (K.w / K.h) > 1.25 ? 'right' : 'bottom'; }
function setDiceRegion(on) { if (!K.on) return; var side = diceSide(); if (side === 'right') return; K.view = on ? { region: side === 'right' ? [-HALF - .35, HALF + 2.5, -HALF - .25, HALF + .25] : [-HALF - .35, HALF + .35, -HALF - .25, HALF + 1.5] } : null; fitCam(false); }
/* rollDice([{kind:'gold'|'blue',value:1..6}...],{at:{x,z}}) -> Promise<values>. Dice tumble in, bounce and settle showing the given faces. Gold = 1st die, blue = 2nd by convention. */
TWKit.rollDice = function (dice, o) {
  o = o || {}; TWKit.clearDice(true); dice = (dice || []).map(function (d) { return { kind: d.kind || 'gold', value: clamp(d.value | 0 || 1, 1, 6) }; });
  if (K.mode === '2d' || !K.on) { S.dice = dice.map(function (d) { return { kind: d.kind, value: d.value }; }); R2.dice(S.dice); emit('dice', { n: dice.length }); return delay(.55).then(function () { return dice.map(function (d) { return d.value; }); }); }
  setDiceRegion(true); var side = diceSide(), at = o.at || (side === 'right' ? { x: HALF + 1.5, z: -.6 } : { x: 0, z: HALF + .85 }), jobs = [];
  dice.forEach(function (d, i) {
    var m = dieMesh(d.kind); K.gMisc.add(m); S.dice.push({ mesh: m, kind: d.kind, value: d.value });
    var tx = at.x + (side === 'right' ? (i % 2 ? .3 : -.3) : (i - (dice.length - 1) / 2) * .85) + (Math.random() - .5) * .1, tz = at.z + (side === 'right' ? (i - (dice.length - 1) / 2) * .85 : (Math.random() - .5) * .15), yaw = Math.random() * 6.28, fin = dieQuat(d.value, yaw);
    var sx = side === 'right' ? tx + 4 : tx + (i % 2 ? 3.5 : -3.5), sz = side === 'right' ? tz : tz + 2.4, ax = new THREE.Vector3(Math.random() - .5, Math.random() - .5, Math.random() - .5).normalize(), qs = new THREE.Quaternion(), hit = 0;
    m.visible = false;
    jobs.push(delay(i * .13).then(function () {
      m.visible = true; return tween(1.25, function (e, k) {
        var gx = lerp(sx, tx, EASE.out(k)), gz = lerp(sz, tz, EASE.out(k)); var y = .26 + 1.7 * 4 * k * (1 - k) * Math.pow(1 - k, .5) + (k > .62 ? .2 * Math.abs(Math.sin((k - .62) / .38 * Math.PI * 1.5)) * (1 - k) * 2.6 : 0);
        m.position.set(gx, y, gz); var ang = Math.pow(1 - EASE.out(k), 1.4) * 17; qs.setFromAxisAngle(ax, ang); m.quaternion.copy(qs).multiply(fin);
        if ((k > .55 && hit === 0) || (k > .78 && hit === 1)) { hit++; emit('dice', { i: i, bounce: hit }); FX.sparks(m.position.x, .1, m.position.z, 4, GOLDC); }
      }, EASE.lin);
    }).then(function () { m.position.set(tx, .26, tz); m.quaternion.copy(fin); }));
  });
  return Promise.all(jobs).then(function () { return dice.map(function (d) { return d.value; }); });
};
TWKit.clearDice = function (keepRegion) { S.dice.forEach(function (d) { if (d.mesh && K.gMisc) { K.gMisc.remove(d.mesh); } }); var had = S.dice.length; S.dice = []; if (K.mode === '2d') R2.dice([]); else if (K.on && had && !keepRegion) setDiceRegion(false); };

/* ------------------------------------------------------------------ expansion: Rift Gate */
var SWIRL_V = 'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}';
function swirlMat(frag, c1, c2) { return new THREE.ShaderMaterial({ transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, uniforms: { uT: { value: 0 }, uC1: { value: new THREE.Color(c1) }, uC2: { value: new THREE.Color(c2) }, uO: { value: 1 } }, vertexShader: SWIRL_V, fragmentShader: frag }); }
var FRAG_RIFT = 'varying vec2 vUv;uniform float uT,uO;uniform vec3 uC1,uC2;void main(){vec2 p=vUv-.5;float r=length(p)*2.;float a=atan(p.y,p.x);float sp=sin(a*3.+r*9.-uT*3.4)*.5+.5;float sp2=sin(a*5.-r*6.+uT*2.1)*.5+.5;float core=smoothstep(.55,0.,r);vec3 c=mix(uC1,uC2,sp*.7+sp2*.3);float edge=smoothstep(1.,.82,r);float al=edge*(.45+.55*sp)*(.55+core*.9);gl_FragColor=vec4(c*(.8+core*1.4),al*uO);}';
var FRAG_MAEL = 'varying vec2 vUv;uniform float uT,uO;uniform vec3 uC1,uC2;void main(){vec2 p=vUv-.5;float r=length(p)*2.;float a=atan(p.y,p.x);float s=sin(a*3.-log(r+.04)*7.+uT*3.2)*.5+.5;float arms=smoothstep(.45,.9,s);float edge=smoothstep(1.,.78,r);vec3 deep=vec3(.01,.06,.1);vec3 c=mix(deep,mix(uC1,uC2,s),arms*smoothstep(.04,.5,r));c=mix(c,vec3(.95,1.,.98),arms*.5*smoothstep(.3,.9,r));gl_FragColor=vec4(c,edge*(.55+.45*smoothstep(0.,.6,r))*uO);}';
/* riftGate(c,r,on=true,{color:'violet'|'cyan'|'gold'}) : portal swirl standing on the square; use the same colour for a linked pair */
TWKit.riftGate = function (c, r, on, o) {
  o = o || {}; on = on !== false; var key = c + ',' + r, G_ = S.gates[key];
  if (!on) { if (!G_) return Promise.resolve(); delete S.gates[key]; if (K.mode === '2d' || !K.on) { R2.gate(c, r, false); return Promise.resolve(); } return tween(.5, function (e) { G_.g.scale.setScalar(1 - e + .001); }, EASE.in).then(function () { K.gMisc.remove(G_.g); }); }
  var pal = { violet: ['#9b5cff', '#35e0ff'], cyan: ['#35e0ff', '#7dffb8'], gold: ['#ffcf5a', '#ff7a3a'] }[o.color || 'violet'] || ['#9b5cff', '#35e0ff'];
  G_ = S.gates[key] = { c: c, r: r, color: o.color || 'violet', pal: pal };
  if (K.mode === '2d' || !K.on) { R2.gate(c, r, true, G_); emit('rift', { c: c, r: r }); return Promise.resolve(); }
  var g = new THREE.Group(), gold = new THREE.MeshStandardMaterial({ color: '#d7a63f', metalness: .9, roughness: .28 });
  var ring = new THREE.Mesh(new THREE.TorusGeometry(.34, .04, 12, 40), gold); ring.castShadow = true;
  var ring2 = new THREE.Mesh(new THREE.TorusGeometry(.4, .012, 6, 40), new THREE.MeshBasicMaterial({ color: pal[1] })); var disc = new THREE.Mesh(new THREE.CircleGeometry(.33, 40), swirlMat(FRAG_RIFT, pal[0], pal[1]));
  var up = new THREE.Group(); up.add(ring, ring2, disc); up.position.y = .5; up.rotation.x = -.55; g.add(up);
  var runes = new THREE.Group(); for (var i = 0; i < 8; i++) { var rn = new THREE.Mesh(new THREE.BoxGeometry(.04, .01, .06), new THREE.MeshBasicMaterial({ color: pal[1] })); var a = i / 8 * 6.283; rn.position.set(Math.cos(a) * .4, Math.sin(a) * .4, 0); rn.rotation.z = a; runes.add(rn); } up.add(runes);
  var base = new THREE.Mesh(new THREE.CylinderGeometry(.3, .34, .06, 16), new THREE.MeshStandardMaterial({ color: '#2c3038', roughness: .85 })); base.position.y = .03; base.castShadow = true; g.add(base);
  var glow = new THREE.Mesh(new THREE.CircleGeometry(.5, 24), new THREE.MeshBasicMaterial({ color: pal[0], transparent: true, opacity: .16, blending: THREE.AdditiveBlending, depthWrite: false })); glow.rotation.x = -Math.PI / 2; glow.position.y = .065; g.add(glow);
  g.position.set(c - 2.5, TILE_TOP, r - 2.5); G_.g = g; G_.up = up; G_.disc = disc; G_.runes = runes; G_.glow = glow; K.gMisc.add(g); g.scale.setScalar(.001); emit('rift', { c: c, r: r });
  return tween(.7, function (e) { g.scale.setScalar(Math.max(.001, e)); }, EASE.back);
};
/* riftWarp(id,fromGate{c,r},toGate{c,r}) -> Promise: the junk is swallowed by one gate and emerges from the other */
TWKit.riftWarp = function (id, a, b, o) {
  var s = S.ships[id]; if (!s) return Promise.resolve(); var ax = a.c - 2.5, az = a.r - 2.5, bx = b.c - 2.5, bz = b.r - 2.5, x0 = s.x, z0 = s.z, h0 = s.h; emit('rift', { id: id, from: a, to: b, warp: true });
  return tween(.7, function (e) { s.x = lerp(x0, ax, e); s.z = lerp(z0, az, e); s.scale = 1 - e * .97; s.h = h0 + e * 8; s.y = e * .35; }, EASE.in).then(function () {
    FX.sparks(ax, .5, az, 24, VIOL); FX.flash(ax, .5, az, 1.2, VIOL); s.trail = []; K.on && ripple(ax, az, .9, .6, VIOL); s.x = bx; s.z = bz; FX.sparks(bx, .5, bz, 24, CY); FX.flash(bx, .5, bz, 1.2, CY); K.on && ripple(bx, bz, .9, .6, CY);
    var nb = o && o.heading != null ? o.heading : h0; return tween(.7, function (e) { s.scale = .03 + e * .97; s.h = nb + (1 - e) * -8; s.y = (1 - e) * .35; }, EASE.out);
  }).then(function () { s.scale = 1; s.y = 0; s.c = b.c; s.r = b.r; if (o && o.port != null) s.port = o.port; });
};

/* ------------------------------------------------------------------ expansion: Maelstrom */
/* maelstrom(c,r,on=true): a whirlpool sits on the square; pass sinkShip(id,{how:'maelstrom',at:{c,r}}) to drag a junk in */
TWKit.maelstrom = function (c, r, on) {
  on = on !== false; var key = c + ',' + r, M_ = S.mael[key];
  if (!on) { if (!M_) return Promise.resolve(); delete S.mael[key]; if (K.mode === '2d' || !K.on) { R2.mael(c, r, false); return Promise.resolve(); } return tween(.6, function (e) { M_.g.scale.setScalar(1 - e + .001); M_.mat.uniforms.uO.value = 1 - e; }, EASE.io).then(function () { K.gMisc.remove(M_.g); }); }
  M_ = S.mael[key] = { c: c, r: r }; if (K.mode === '2d' || !K.on) { R2.mael(c, r, true); emit('whirl', { c: c, r: r }); return Promise.resolve(); }
  var seg = 40, rings = 10, geo = new THREE.CircleGeometry(.47, seg, 0, Math.PI * 2); // funnel: rebuild as polar grid
  var pos = [], uv = [], idx = []; for (var i = 0; i <= rings; i++) for (var j = 0; j <= seg; j++) { var rr = i / rings, an = j / seg * Math.PI * 2, R_ = rr * .47; pos.push(Math.cos(an) * R_, -.1 * Math.pow(1 - rr, 1.6) * 1.0, Math.sin(an) * R_); uv.push(.5 + Math.cos(an) * rr * .5, .5 + Math.sin(an) * rr * .5); }
  for (var a = 0; a < rings; a++) for (var b = 0; b < seg; b++) { var p = a * (seg + 1) + b, q = p + seg + 1; idx.push(p, p + 1, q, q, p + 1, q + 1); }
  geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); geo.setIndex(idx);
  var mat = swirlMat(FRAG_MAEL, '#2fb0b0', '#c8fff0'); mat.blending = THREE.NormalBlending; var m = new THREE.Mesh(geo, mat); m.renderOrder = 4; var g = new THREE.Group(); g.add(m); g.position.set(c - 2.5, TILE_TOP + .02, r - 2.5); K.gMisc.add(g); M_.g = g; M_.mat = mat; g.scale.setScalar(.001); emit('whirl', { c: c, r: r });
  return tween(.8, function (e) { g.scale.setScalar(Math.max(.001, e)); }, EASE.out);
};

/* ------------------------------------------------------------------ expansion: Rogue Wave */
var waveG = null;
function waveGeo() {
  if (waveG) return waveG; var s = new THREE.Shape(); var P = [[-.5, 0], [-.35, .06], [-.2, .2], [-.05, .42], [.06, .56], [.16, .6], [.27, .56], [.34, .46], [.35, .36], [.3, .3], [.22, .33], [.2, .27], [.26, .18], [.34, .1], [.5, 0]];
  s.moveTo(P[0][0], P[0][1]); for (var i = 1; i < P.length; i++) s.lineTo(P[i][0], P[i][1]); s.lineTo(.5, -.02); s.lineTo(-.5, -.02);
  var g = new THREE.ExtrudeGeometry(s, { depth: .9, bevelEnabled: true, bevelSize: .03, bevelThickness: .03, bevelSegments: 2, curveSegments: 6 }); g.translate(0, 0, -.45);
  var p = g.attributes.position, col = new Float32Array(p.count * 3), c1 = new THREE.Color('#0f6f7e'), c2 = new THREE.Color('#3fb6b4'), c3 = new THREE.Color('#ffffff'), c = new THREE.Color();
  for (var k = 0; k < p.count; k++) { var y = p.getY(k) / .6, x = p.getX(k); c.copy(c1).lerp(c2, clamp(y * 1.1, 0, 1)); var lip = (x > .05 && y > .72) || (x > .3 && y > .28 && y < .62 && p.getZ(k) !== 0); if (lip) c.lerp(c3, .75 * sstep(.28, .75, y)); c.toArray(col, k * 3); p.setZ(k, p.getZ(k) + Math.sin(x * 9 + p.getY(k) * 6) * .018); }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.computeVertexNormals(); waveG = g; return g;
}
function waveMesh(len) { var m = new THREE.Mesh(waveGeo(), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .25, metalness: .05, emissive: new THREE.Color('#136b78'), emissiveIntensity: .35 })); m.castShadow = true; m.scale.z = len / .9; m.material.emissiveIntensity = .15; return m; }
/* rogueWaveTile(c,r,on=true): the big wave tile sits on a square (breaking crest, foam spray) */
TWKit.rogueWaveTile = function (c, r, on) {
  on = on !== false; var key = c + ',' + r, W = S.waveTiles[key];
  if (!on) { if (!W) return Promise.resolve(); delete S.waveTiles[key]; if (K.on) { K.gTiles.remove(W.mesh); K.gMisc.remove(W.g); } else R2.waveTile(c, r, false); return Promise.resolve(); }
  S.waveTiles[key] = W = { c: c, r: r }; if (!K.on) { R2.waveTile(c, r, true); return Promise.resolve(); }
  W.mesh = slabMesh(); var s = tsize(); W.mesh.material = tileMat(ctex('wavetile' + s, s, s, function (x, w) { paintCurrent(x, w, [], 'map'); x.strokeStyle = 'rgba(240,255,250,.7)'; x.lineWidth = w * .02; for (var i = 0; i < 6; i++) { x.beginPath(); x.arc(w * .5, w * (.75 + i * .05), w * (.18 + i * .07), Math.PI * 1.1, Math.PI * 1.9); x.stroke(); } })); W.mesh.position.set(c - 2.5, .004, r - 2.5); K.gTiles.add(W.mesh);
  var g = new THREE.Group(); var m = waveMesh(.8); m.scale.set(.8, .8, 1); g.add(m); g.position.set(c - 2.5, TILE_TOP, r - 2.5); g.rotation.y = 0; K.gMisc.add(g); W.g = g; W.m = m; g.scale.setScalar(.001);
  return tween(.8, function (e) { g.scale.setScalar(Math.max(.001, e)); }, EASE.back);
};
/* rogueMarker(edge,index,on=true): gold+blue wave token placed beside the numbered edge square */
TWKit.rogueMarker = function (edge, index, on) {
  on = on !== false; var k = 'm' + edge + index, M0 = S.markers[k]; Object.keys(S.markers).forEach(function (kk) { var mm = S.markers[kk]; if (kk !== k || !on) { delete S.markers[kk]; if (K.on) K.gMisc.remove(mm.g); else R2.marker(mm.edge, mm.index, false); } });
  if (!on) return; S.markers[k] = M0 = { edge: edge, index: index }; if (!K.on) { R2.marker(edge, index, true); return; }
  var pos = { top: [index - 3.5, -G - .85], bottom: [index - 3.5, G + .85], left: [-G - .85, index - 3.5], right: [G + .85, index - 3.5] }[edge], rot = { top: Math.PI / 2, bottom: -Math.PI / 2, left: 0, right: Math.PI }[edge];
  var tx = ctex('rogueTok', 256, 256, function (x, w) { var g = x.createRadialGradient(w / 2, w / 2, 10, w / 2, w / 2, w / 2); g.addColorStop(0, '#2c6fd0'); g.addColorStop(1, '#173f8f'); x.fillStyle = g; x.fillRect(0, 0, w, w); x.strokeStyle = '#ffe9a8'; x.lineWidth = 9; x.lineCap = 'round'; for (var i = 0; i < 3; i++) { x.beginPath(); x.arc(w * .42, w * (.62 + i * .0), w * (.12 + i * .075), Math.PI * 1.05, Math.PI * 1.9); x.stroke(); } x.fillStyle = '#ffe9a8'; x.beginPath(); x.moveTo(w * .78, w * .5); x.lineTo(w * .62, w * .36); x.lineTo(w * .62, w * .64); x.closePath(); x.fill(); });
  var g = new THREE.Group(), body = new THREE.Mesh(new THREE.CylinderGeometry(.26, .27, .09, 28), [new THREE.MeshStandardMaterial({ color: '#e0b04a', metalness: .85, roughness: .3 }), new THREE.MeshStandardMaterial({ map: tx, roughness: .4 }), new THREE.MeshStandardMaterial({ color: '#e0b04a', metalness: .85, roughness: .3 })]); body.castShadow = true; body.rotation.y = rot; g.add(body);
  var glow = new THREE.Mesh(new THREE.CircleGeometry(.5, 24), new THREE.MeshBasicMaterial({ color: '#4aa0ff', transparent: true, opacity: .35, blending: THREE.AdditiveBlending, depthWrite: false })); glow.rotation.x = -Math.PI / 2; glow.position.y = -.03; g.add(glow);
  g.position.set(pos[0], .14, pos[1]); M0.g = g; M0.glow = glow; K.gMisc.add(g); g.scale.setScalar(.001); tween(.5, function (e) { g.scale.setScalar(Math.max(.001, e)); }, EASE.back);
};
/* highlightLine({row:0..5}|{col:0..5}|null, {color}) : glowing strip across a row/column */
TWKit.highlightLine = function (l, o) {
  if (S.line && S.line.m && K.on) { K.gMisc.remove(S.line.m); S.line.m.material.dispose(); } S.line = l ? { row: l.row, col: l.col } : null; if (K.mode === '2d') return R2.line();
  if (!K.on || !l) return; var horiz = l.row != null, m = new THREE.Mesh(new THREE.PlaneGeometry(horiz ? 6 : .98, horiz ? .98 : 6), new THREE.MeshBasicMaterial({ color: (o && o.color) || '#5ab8ff', transparent: true, opacity: .3, blending: THREE.AdditiveBlending, depthWrite: false, map: K.sqTex }));
  m.rotation.x = -Math.PI / 2; m.position.set(horiz ? 0 : l.col - 2.5, .12, horiz ? l.row - 2.5 : 0); m.renderOrder = 5; K.gMisc.add(m); S.line.m = m;
};
function waveLift(s) { var w = K.waveFx; if (!w) return 0; var perp = w.axis === 'x' ? s.z : s.x, along = w.axis === 'x' ? s.x : s.z; if (Math.abs(perp - w.lane) > .6) return 0; var d = Math.abs(along - w.pos); return Math.max(0, 1 - d / .9) * .16; }
/* rogueWaveSweep({edge:'left'|'right'|'top'|'bottom', index:1..6}) or ({row|col, dir:1|-1}) -> Promise: a huge wave crashes across the row/column */
TWKit.rogueWaveSweep = function (o) {
  o = o || {}; var axis, lane, dir;
  if (o.edge) { var i = o.index - 1; if (o.edge === 'left' || o.edge === 'right') { axis = 'x'; lane = i - 2.5; dir = o.edge === 'left' ? 1 : -1; } else { axis = 'z'; lane = i - 2.5; dir = o.edge === 'top' ? 1 : -1; } }
  else if (o.row != null) { axis = 'x'; lane = o.row - 2.5; dir = o.dir || 1; } else { axis = 'z'; lane = o.col - 2.5; dir = o.dir || 1; }
  emit('wave', { axis: axis, lane: lane, dir: dir }); if (!K.on) { R2.sweep(axis, lane, dir); return delay(1.6); }
  var g = new THREE.Group(), m = waveMesh(1.0); g.add(m); K.gFx.add(g); var start = -dir * (HALF + .8), end = dir * (HALF + .8); g.rotation.y = axis === 'x' ? (dir > 0 ? 0 : Math.PI) : (dir > 0 ? -Math.PI / 2 : Math.PI / 2);
  K.waveFx = { axis: axis, lane: lane, pos: start, row: 0 }; TWKit.shake(.06, 2400);
  return tween(2.4, function (e, k) {
    var p = lerp(start, end, e), sc = (.3 + .9 * sstep(0, .22, k)) * (1 - .6 * sstep(.86, 1, k)); g.position.set(axis === 'x' ? p : lane, .0, axis === 'x' ? lane : p); g.scale.set(sc * 1.15, sc * 1.4, 1);
    K.waveFx.pos = p; if (Math.random() < .9) { for (var j = 0; j < 3; j++) { var oz = (Math.random() - .5) * .9, cx = axis === 'x' ? p + dir * .3 : lane + oz, cz = axis === 'x' ? lane + oz : p + dir * .3; emitP(false, cx, .35 + Math.random() * .4, cz, (axis === 'x' ? dir : 0) * (1 + Math.random()), 1 + Math.random(), (axis === 'x' ? 0 : dir) * (1 + Math.random()), .8, .1, .04, WHITE, .9, 5, 0); } }
  }, EASE.sine).then(function () { K.gFx.remove(g); K.waveFx = null; });
};

/* ------------------------------------------------------------------ expansion: Deck Cannon */
function cellPos(p) { if (typeof p === 'string') { var s = S.ships[p]; return s ? [s.x, s.z, s] : [0, 0]; } return [p.c - 2.5, p.r - 2.5]; }
/* cannonShot({from:shipId|{c,r}, to:shipId|{c,r}, hit:true}) -> Promise: muzzle flash, smoke, arcing ball, splash or splinters at the target */
TWKit.cannonShot = function (o) {
  var A = cellPos(o.from), B = cellPos(o.to), dist = Math.hypot(B[0] - A[0], B[1] - A[1]), dur = .6 + dist * .13, hit = o.hit !== false; emit('cannon', { from: o.from, to: o.to, hit: hit });
  var ang = Math.atan2(B[1] - A[1], B[0] - A[0]); if (A[2]) A[2].h = ang;
  var ball = null; if (K.on) { ball = new THREE.Mesh(new THREE.SphereGeometry(.075, 10, 8), new THREE.MeshStandardMaterial({ color: '#23262b', metalness: .7, roughness: .35 })); ball.castShadow = true; K.gFx.add(ball); }
  var mx = A[0] + Math.cos(ang) * .3, mz = A[1] + Math.sin(ang) * .3; FX.flash(mx, .25, mz, 1, FIRE); FX.smoke(mx, .25, mz, 12, 1.1); FX.sparks(mx, .25, mz, 10, [1, .7, .25]); if (K.on) TWKit.shake(.03, 250); if (A[2]) { A[2].pitch = -.1; tween(.3, function (e) { A[2].pitch = -.1 * (1 - e); }, EASE.out); }
  return tween(dur, function (e, k) { var x = lerp(A[0], B[0], e), z = lerp(A[1], B[1], e), y = .3 + Math.sin(k * Math.PI) * (.5 + dist * .22); if (ball) ball.position.set(x, y, z); if (Math.random() < .8) emitP(false, x, y, z, 0, .1, 0, .6, .05, .16, SMOKE, .45, 0, 1); }, EASE.lin).then(function () {
    if (ball) K.gFx.remove(ball); if (hit) { FX.chips(B[0], B[1], 20); FX.flash(B[0], .25, B[1], 1.3, FIRE); FX.sparks(B[0], .2, B[1], 18, [1, .7, .25]); FX.smoke(B[0], .2, B[1], 10, 1.3); if (K.on) { ripple(B[0], B[1], .7, .6, WHITE); TWKit.shake(.07, 420); } } else FX.splash(B[0], B[1], 1);
  });
};
