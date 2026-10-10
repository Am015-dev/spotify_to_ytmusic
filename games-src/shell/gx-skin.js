/* GX skin loader: GXSK.init({dark:false, sets:{'sk-x':['file']}, icons:false, map:false, stars:false, banner:false}).
   Preloads the kit files from media/ and, once the core ones loaded, adds html.sk (+ switches). Missing files = the old CSS stays. */
(function () {
  var H = document.documentElement, base = 'media/', core = ['ui-topbar', 'ui-iconbtn', 'ui-panel-c', 'ui-button-power-c', 'ui-drawer-head', 'ui-button-cream-c', 'ui-button-go-c', 'ui-node-open'];
  function load(names, cb) { var n = names.length, ok = 0; if (!n) return cb(true); names.forEach(function (f) { var i = new Image(); i.onload = function () { ok++; if (!--n) cb(ok === names.length); }; i.onerror = function () { if (!--n) cb(false); }; i.src = base + f + '.webp'; }); }
  window.GXSK = {
    init: function (o) {
      o = o || {}; var extra = [];
      if (o.map) extra.push('story-map'); if (o.stars) extra.push('ui-star-on', 'ui-star-off'); if (o.banner) extra.push('ui-act-banner-c');
      load(core, function (ok) {
        if (!ok) return;
        H.classList.add('sk'); if (o.dark) H.classList.add('sk-dark');
        load(extra, function () { if (o.map) H.classList.add('sk-map'); if (o.stars) H.classList.add('sk-stars'); if (o.banner) H.classList.add('sk-banner'); });
        if (o.icons) load(o.icons.map(function (k) { return 'icon-' + k; }), function () { H.classList.add('sk-icons'); });
        if (o.sets) Object.keys(o.sets).forEach(function (cls) { load(o.sets[cls], function (k) { if (k) H.classList.add(cls); }); });
        if (o.cb) o.cb();
      });
    }
  };
})();
