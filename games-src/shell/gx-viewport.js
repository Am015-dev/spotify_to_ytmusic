// gx-viewport.js: one debounced relayout for every game. GXV.watch(fn) calls fn(size) when the visible size or safe-area key changes.
// Fed by resize, orientationchange, visualViewport resize, ResizeObserver(documentElement) and pageshow; re-measures at 120 and 420 ms
// (iOS reports the old size for a moment after a rotation). Size comes from a fixed full-screen probe, not innerWidth/innerHeight.
(function () {
  var fns = [], key = '', t1 = 0, t2 = 0, t3 = 0, probe = null;
  function mk() {
    if (probe || !document.body) return probe;
    probe = document.createElement('div');
    probe.setAttribute('aria-hidden', 'true');
    probe.style.cssText = 'position:fixed;left:0;top:0;width:100vw;height:100%;visibility:hidden;pointer-events:none;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);box-sizing:border-box;z-index:-1';
    document.body.appendChild(probe); return probe;
  }
  function measure() {
    var p = mk(), w = innerWidth, h = innerHeight, s = '';
    if (p) { w = p.offsetWidth || w; h = p.offsetHeight || h; var cs = getComputedStyle(p); s = cs.paddingTop + cs.paddingRight + cs.paddingBottom + cs.paddingLeft; }
    return { w: w, h: h, safe: s, key: w + 'x' + h + '|' + s };
  }
  function run(force) {
    var m = measure(); if (!force && m.key === key) return; key = m.key;
    fns.forEach(function (f) { try { f(m); } catch (e) { console.error(e); } });
  }
  function kick() { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); t1 = setTimeout(function () { run(); }, 40); t2 = setTimeout(function () { run(); }, 120); t3 = setTimeout(function () { run(); }, 420); }
  var wired = false;
  function wire() {
    if (wired) return; wired = true;
    addEventListener('resize', kick); addEventListener('orientationchange', kick); addEventListener('pageshow', kick);
    if (window.visualViewport) visualViewport.addEventListener('resize', kick);
    if (window.ResizeObserver) new ResizeObserver(kick).observe(document.documentElement);
  }
  window.GXV = { watch: function (fn) { fns.push(fn); wire(); run(true); return fn; }, now: measure, poke: function () { run(true); } };
})();
