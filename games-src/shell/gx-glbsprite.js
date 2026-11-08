// GXSPR: draws an owner .glb (via gx-glb.js + THREE) once to a transparent sprite and hands back a blob URL.
// Weak devices / no WebGL / load error: resolves null and the caller keeps the @512 render it already shows.
//   GXSPR.use('models/piece-hog', {size:256, pitch:.5, yaw:-.5}).then(url => url && (img.src = url))
//   GXSPR.on(name, fn)  fn(url) is called now if the sprite exists, else when it is ready.
(function () {
  var S = window.GXSPR = { cache: {}, subs: {}, q: Promise.resolve(), R: null };
  var small = function () { try { return Math.min(innerWidth, innerHeight) < 600 || (matchMedia('(pointer:coarse)').matches && Math.max(innerWidth, innerHeight) < 1200); } catch (e) { return false; } };
  S.weak = function () { var n = navigator; return (n.deviceMemory && n.deviceMemory < 3) || (n.hardwareConcurrency && n.hardwareConcurrency < 3) || /[?&]nosprite/.test(location.search); };
  S.ok = function () { return !!(window.THREE && window.GXGLB) && !S.weak(); };
  function renderer(size) {
    if (S.R) return S.R;
    var cv = document.createElement('canvas'); cv.width = cv.height = size;
    var r = new THREE.WebGLRenderer({ canvas: cv, alpha: true, antialias: true, preserveDrawingBuffer: true });
    if (!r.getContext()) throw new Error('nogl');
    r.setSize(size, size, false); r.setClearColor(0, 0); r.outputColorSpace = THREE.SRGBColorSpace; r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.05;
    return (S.R = r);
  }
  function draw(url, o) {
    var size = o.size || 256, r = renderer(size);
    return GXGLB.load(url).then(function (src) {
      var m = GXGLB.prep(src, { h: 1, yaw: o.yaw || 0, env: .8 }), sc = new THREE.Scene(), g = new THREE.Group();
      if (o.lie) m.rotation.x = -Math.PI / 2;
      g.add(m); g.rotation.y = o.spin || 0; sc.add(g); sc.updateMatrixWorld(true);
      var b = new THREE.Box3().setFromObject(g), c = b.getCenter(new THREE.Vector3()), sz = b.getSize(new THREE.Vector3());
      if (o.tint) g.traverse(function (n) { if (n.isMesh && n.material) { n.material = n.material.clone(); n.material.color.multiply(new THREE.Color(o.tint)); } });
      sc.add(new THREE.HemisphereLight(0xffffff, 0x8a7a68, 1.25)); var d = new THREE.DirectionalLight(0xffffff, 2.1); d.position.set(-2, 4, 3); sc.add(d);
      var cam = new THREE.PerspectiveCamera(28, 1, .01, 50), rad = Math.max(sz.x, sz.y, sz.z) * .5, dist = rad / Math.tan(14 * Math.PI / 180) * 1.18, p = o.pitch == null ? .45 : o.pitch;
      cam.position.set(c.x, c.y + Math.sin(p) * dist, c.z + Math.cos(p) * dist); cam.lookAt(c);
      r.render(sc, cam);
      return new Promise(function (ok) { r.domElement.toBlob(function (bl) { sc.traverse(function (n) { if (n.material && n.material.color && o.tint) n.material.dispose(); }); ok(bl ? URL.createObjectURL(bl) : null); }, 'image/png'); });
    });
  }
  S.use = function (base, o) {
    o = o || {}; var key = base + (o.tint || '') + (o.pitch || '') + (o.lie ? 'L' : '');
    if (S.cache[key] !== undefined) return S.cache[key];
    if (!S.ok()) return (S.cache[key] = Promise.resolve(null));
    var file = base + (small() ? '-lite' : '') + '.glb';
    var p = S.q = S.q.then(function () { return draw(file, o); }).catch(function () { return null; });
    S.cache[key] = p; p.then(function (u) { if (u) (S.subs[key] || []).forEach(function (f) { try { f(u); } catch (e) { } }); });
    return p;
  };
  S.on = function (base, o, fn) { o = o || {}; var key = base + (o.tint || '') + (o.pitch || '') + (o.lie ? 'L' : ''); S.use(base, o).then(function (u) { if (u) fn(u); }); };
})();
