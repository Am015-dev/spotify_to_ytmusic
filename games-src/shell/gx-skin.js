/* GX skin loader: GXSK.init({dark:false, sets:{'sk-x':['file']}, icons:false, map:false, stars:false, banner:false}).
   Preloads the kit files from media/ and, once the core ones loaded, adds html.sk (+ switches). Missing files = the old CSS stays.
   RULE: the skin never changes an element's layout box. Painted plates go on as background / border-image (border-width 0, the plate drawn
   by border-image-width inside the element's own width, height and padding). GXSK.audit() proves it: it measures the visible buttons, bars and
   panels with the skin on, takes every skin class off, measures again, puts them back, and lists each element whose box moved by more than 2 px.
   phone-check.js runs it and fails the game on any entry. */
(function () {
  var H = document.documentElement, on = [], base = 'media/', core = ['ui-topbar', 'ui-iconbtn', 'ui-panel-c', 'ui-button-power-c', 'ui-drawer-head', 'ui-button-cream-c', 'ui-button-go-c', 'ui-node-open'];
  function load(names, cb) { var n = names.length, ok = 0; if (!n) return cb(true); names.forEach(function (f) { var i = new Image(); i.onload = function () { ok++; if (!--n) cb(ok === names.length); }; i.onerror = function () { if (!--n) cb(false); }; i.src = base + f + '.webp'; }); }
  function add(c) { if (on.indexOf(c) < 0) on.push(c); H.classList.add(c); }
  var SEL = 'button,.gx-ibtn,.gxc-btn,.gxc-ib,.gxc-act,[role=button],.gx-bar,.gx-drawer,.gxc-sheet,.gxc-scene,.gxc-boss,.gxc-res,.gxc-head,.dlg,.gxc-sheet';
  window.GXSK = {
    classes: function () { return on.slice(); },
    audit: function (sel, tol) {
      tol = tol == null ? 2 : tol; var els = [].filter.call(document.querySelectorAll(sel || SEL), function (e) { return e.offsetWidth > 0 && e.offsetHeight > 0; });
      if (!on.length) return { skinned: false, n: els.length, moved: [] };
      var st = document.createElement('style'); st.textContent = '*,*::before,*::after{transition:none!important;animation:none!important}'; document.head.appendChild(st);
      var P = ['width','height','minWidth','minHeight','paddingTop','paddingRight','paddingBottom','paddingLeft','marginTop','marginRight','marginBottom','marginLeft','borderTopWidth','borderRightWidth','borderBottomWidth','borderLeftWidth','display','flex','fontSize','whiteSpace','boxSizing','fontWeight','letterSpacing','textAlign','justifyContent','alignSelf','maxWidth','overflow','textShadow','fontFamily'];
      var cs = function (e) { var c = getComputedStyle(e), p = e.parentElement; return P.map(function (k) { return c[k]; }).concat([p ? p.offsetWidth + '/' + getComputedStyle(p).paddingLeft + '/' + getComputedStyle(p).borderLeftWidth : '']); };
      var a = els.map(function (e) { return [e.offsetWidth, e.offsetHeight]; }), ca = els.map(cs), cl = on.slice();
      cl.forEach(function (c) { H.classList.remove(c); }); void H.offsetWidth;
      var b = els.map(function (e) { return [e.offsetWidth, e.offsetHeight]; }), cb = els.map(cs);
      cl.forEach(function (c) { H.classList.add(c); }); void H.offsetWidth; st.remove();
      var moved = [];
      els.forEach(function (e, i) { if (!b[i][0] && !b[i][1]) return; var dw = a[i][0] - b[i][0], dh = a[i][1] - b[i][1];
        if (Math.abs(dw) > tol || Math.abs(dh) > tol) moved.push((e.id ? '#' + e.id : e.tagName.toLowerCase()) + '.' + String(e.className && e.className.baseVal === undefined ? e.className : '').trim().split(/\s+/).slice(0, 2).join('.') + ' ' + (e.textContent || '').trim().slice(0, 14) + ' ' + b[i].join('x') + '->' + a[i].join('x') + ' [' + P.concat(['parent']).filter(function (k, j) { return ca[i][j] !== cb[i][j]; }).map(function (k) { var j = P.concat(['parent']).indexOf(k); return k + ':' + cb[i][j] + '>' + ca[i][j]; }).join(' ') + ']'); });
      return { skinned: true, n: els.length, moved: moved };
    },
    init: function (o) {
      o = o || {}; var extra = [];
      if (o.map) extra.push('story-map'); if (o.stars) extra.push('ui-star-on', 'ui-star-off'); if (o.banner) extra.push('ui-act-banner-c');
      load(core, function (ok) {
        if (!ok) return;
        add('sk'); if (o.dark) add('sk-dark');
        load(extra, function () { if (o.map) add('sk-map'); if (o.stars) add('sk-stars'); if (o.banner) add('sk-banner'); });
        if (o.icons) load(o.icons.map(function (k) { return 'icon-' + k; }), function () { add('sk-icons'); });
        if (o.sets) Object.keys(o.sets).forEach(function (cls) { load(o.sets[cls], function (k) { if (k) add(cls); }); });
        if (o.cb) o.cb();
      });
    }
  };
})();
