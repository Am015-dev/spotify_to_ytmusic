/* gx-glb-view.js: show the owner's 3D models (models/<name>.glb, -lite on phones) as the real pieces in DOM games.
   Needs window.THREE and window.GXGLB (gx-glb.js). Shipped lazily as models/gx3d.js (scripts/make-gx3d.py); gx-glb-boot.js loads it.
   Zero changes to a game's markup: every <img src="models/<name>[@512].webp"> whose models/<name>.glb exists is replaced by a
   <canvas> with the same classes/style that draws the live model (slow turn). The <img> stays in the DOM, hidden, as the fallback:
   if WebGL, the file or the device fails, nothing changes. API: GXGLBV.scan(root), GXGLBV.snapshot(name, {size, yaw}) -> Promise<canvas>,
   GXGLBQ.push(fn(GXGLBV)) for code that runs before this file has loaded. */
(function () {
  'use strict';
  var T = window.THREE, GL = window.GXGLB; if (!T || !GL || window.GXGLBV) return;
  var phone = false; try { phone = Math.min(innerWidth, innerHeight) < 600 || (matchMedia('(pointer:coarse)').matches && Math.max(innerWidth, innerHeight) < 1200); } catch (e) {}
  var V = window.GXGLBV = { views: 0, models: {}, failed: {}, lite: phone };
  var rend, scene, cam, views = [], raf = 0, last = 0, cache = {};
  function ensure() {
    if (rend) return rend;
    rend = new T.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' }); rend.setClearColor(0x000000, 0);
    if ('outputColorSpace' in rend && T.SRGBColorSpace) rend.outputColorSpace = T.SRGBColorSpace;
    scene = new T.Scene(); scene.add(new T.HemisphereLight(0xfff4e0, 0x504030, 1.25));
    var k = new T.DirectionalLight(0xffffff, 1.9); k.position.set(2.2, 3.2, 3.6); scene.add(k);
    var r = new T.DirectionalLight(0x9fb8ff, .6); r.position.set(-3, 1.2, -2.5); scene.add(r);
    cam = new T.PerspectiveCamera(28, 1, .1, 50); return rend;
  }
  function load(name) {   // -> Promise of a prepared model (centred, longest side = 1) or null
    if (cache[name]) return cache[name];
    return cache[name] = GL.load('models/' + name + (phone ? '-lite' : '') + '.glb').then(function (g) {
      var p = GL.prep(g, { env: .8 }), s = p.userData.size, m = Math.max(s.x, s.y, s.z, 1e-4); p.scale.setScalar(1 / m); V.models[name] = 1; return p;
    }).catch(function () { V.failed[name] = 1; return null; });
  }
  function draw(v, t) {
    var cv = v.cv, w = cv.clientWidth, h = cv.clientHeight; if (!w || !h) return false;
    var dpr = Math.min(window.devicePixelRatio || 1, 2), pw = Math.round(w * dpr), ph = Math.round(h * dpr);
    if (cv.width !== pw || cv.height !== ph) { cv.width = pw; cv.height = ph; }
    var r = ensure(); r.setSize(pw, ph, false); cam.aspect = pw / ph; cam.updateProjectionMatrix();
    var d = 2.15 / Math.min(1, cam.aspect); cam.position.set(0, d * .12, d); cam.lookAt(0, 0, 0);
    var m = v.model.clone(true); m.rotation.y = v.yaw + (v.spin ? Math.sin((t - v.t0) * .0016) * .7 * v.spin : 0); /* sways about the front view, never shows the back */ scene.add(m); r.render(scene, cam); scene.remove(m);
    var c = v.ctx; c.clearRect(0, 0, pw, ph); c.drawImage(r.domElement, 0, 0, pw, ph); return true;
  }
  function loop(t) {
    raf = 0; views = views.filter(function (v) { return v.cv.isConnected; });
    if (!views.length || document.hidden) return start(true);
    if (t - last >= 33) { last = t; var vh = innerHeight; views.forEach(function (v) { sync(v); var b = v.cv.getBoundingClientRect(); if (b.bottom > -20 && b.top < vh + 20 && (v.spin || !v.done)) { if (draw(v, t)) v.done = 1; } }); }
    start();
  }
  function start(slow) { if (!raf && views.length) raf = slow ? setTimeout(function () { raf = 0; start(); }, 400) : requestAnimationFrame(loop); }
  function sync(v) {   // the hidden <img> keeps the layout (all the game's CSS applies to it); the canvas sits exactly on its box
    var i = v.img, c = v.cv; if (!i.isConnected || !i.offsetParent) return;
    var l = i.offsetLeft + 'px', tp = i.offsetTop + 'px', w = i.offsetWidth + 'px', h = i.offsetHeight + 'px';
    if (c.style.left !== l) c.style.left = l; if (c.style.top !== tp) c.style.top = tp; if (c.style.width !== w) c.style.width = w; if (c.style.height !== h) c.style.height = h;
  }
  function mount(img, model, name) {
    if (!img.isConnected || !img.parentNode) return;
    var cv = document.createElement('canvas'); cv.className = (img.className ? img.className + ' ' : '') + 'gx3d'; cv.setAttribute('aria-hidden', 'true'); cv.setAttribute('data-glb', name);
    cv.style.cssText = img.style.cssText; cv.style.position = 'absolute'; cv.style.margin = '0'; cv.style.maxWidth = cv.style.maxHeight = 'none'; cv.style.boxSizing = 'border-box';
    img.parentNode.insertBefore(cv, img.nextSibling); img.style.visibility = 'hidden';
    var v = { cv: cv, img: img, ctx: cv.getContext('2d'), model: model, yaw: +(img.getAttribute('data-yaw') || -.35), spin: img.getAttribute('data-spin') === '0' ? 0 : 1, done: 0, t0: performance.now() };
    sync(v); draw(v, 0); views.push(v); V.views++; start();
  }
  function upgrade(img) {
    if (img.__gx3d || img.tagName !== 'IMG') return;
    var m = (img.getAttribute('src') || '').match(/(?:^|\/)models\/([\w-]+?)(?:@512)?\.webp(?:\?.*)?$/); if (!m || V.failed[m[1]]) return;
    img.__gx3d = 1; var name = m[1];
    load(name).then(function (p) { if (p) mount(img, p, name); });
  }
  function scan(root) {
    root = root || document; if (root.tagName === 'IMG') return upgrade(root);
    if (root.querySelectorAll) Array.prototype.forEach.call(root.querySelectorAll('img[src*="models/"]'), upgrade);
  }
  V.scan = scan;
  V.snapshot = function (name, o) {   // one still render of a model as a transparent canvas (for Pixi/canvas games)
    o = o || {}; return load(name).then(function (p) {
      if (!p) return null; var sz = o.size || 512, cv = document.createElement('canvas'); cv.width = cv.height = sz; ensure();
      var v = { cv: cv, ctx: cv.getContext('2d'), model: p, yaw: o.yaw == null ? -.5 : o.yaw, spin: 0, t0: 0 };
      Object.defineProperty(cv, 'clientWidth', { value: sz }); Object.defineProperty(cv, 'clientHeight', { value: sz }); return draw(v, 0) ? cv : null;
    });
  };
  new MutationObserver(function (ms) { ms.forEach(function (m) { Array.prototype.forEach.call(m.addedNodes, function (n) { if (n.nodeType === 1) scan(n); }); }); }).observe(document.documentElement, { childList: true, subtree: true });
  scan(document);
  var q = window.GXGLBQ; window.GXGLBQ = { push: function (f) { try { f(V); } catch (e) {} } }; if (q && q.forEach) q.forEach(function (f) { try { f(V); } catch (e) {} });
})();
