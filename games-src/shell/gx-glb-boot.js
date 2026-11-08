/* gx-glb-boot.js (inlined in the game): after the page has loaded, fetch models/gx3d.js (three + gx-glb + gx-glb-view, built by
   scripts/make-gx3d.py) and let it swap the 3D render pictures for the real GLB models. Skipped on weak devices / no WebGL: the
   @512 pictures stay. On a software GL (SwiftShader) the models are drawn once, still. ?glb=0 turns it off, ?glb=1 forces it past the weak-device check. */
window.GXGLBQ = window.GXGLBQ || [];
(function () {
  var u = location.search; if (/[?&]glb=0/.test(u)) return;
  try {
    var n = navigator, weak = (n.deviceMemory && n.deviceMemory <= 2) || (n.hardwareConcurrency && n.hardwareConcurrency <= 2) || (n.connection && n.connection.saveData);
    if (weak && !/[?&]glb=1/.test(u)) return;
    var c = document.createElement('canvas'), gl = c.getContext('webgl2') || c.getContext('webgl'); if (!gl) return;
    var di = gl.getExtension('WEBGL_debug_renderer_info'), rn = di ? String(gl.getParameter(di.UNMASKED_RENDERER_WEBGL)) : '';
    var soft = /swiftshader|llvmpipe|software|basic render/i.test(rn);   // a software rasteriser: draw the models once, no animation
    var x = gl.getExtension('WEBGL_lose_context'); if (x) x.loseContext();
    window.GXGLB_SOFT = soft;   // software GL: the models are drawn once, still, instead of swaying every frame
  } catch (e) { return; }
  function go() { var s = document.createElement('script'); s.src = 'models/gx3d.js'; s.async = true; s.onerror = function () { }; document.head.appendChild(s); }
  if (document.readyState === 'complete') setTimeout(go, 300); else addEventListener('load', function () { setTimeout(go, 300); });
})();
