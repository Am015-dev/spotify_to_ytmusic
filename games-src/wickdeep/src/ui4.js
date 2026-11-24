// ui4: play-screen redesign. Active-hero bar docked above the hand; the instruction is a bubble with an arrow
// next to its target (UI-BAR rule 10), never a line at the bottom. The bubble never takes taps.
(function () {
  var bub = document.createElement('div'); bub.id = 'coach'; bub.setAttribute('aria-hidden', 'true'); bub.innerHTML = '<span class="ct"></span><i class="ca"></i>'; document.body.appendChild(bub);
  var _sp = setPrompt; setPrompt = function (text, btns) { _sp(text, btns); placeCoach(); };
  var _rd = renderDock; renderDock = function () { _rd(); heroBar(); placeCoach(); };
  function heroBar() {
    var dock = $('dockbody'); if (!dock) return; var hb = $('herobar');
    if (!hb) { hb = document.createElement('div'); hb.id = 'herobar'; dock.appendChild(hb); } else if (hb !== dock.lastElementChild) dock.appendChild(hb);
    if (!G || G.done) { hb.hidden = true; return; }
    var hs = E.liveHeroes(G); if (!hs.length) { hb.hidden = true; return; } hb.hidden = false;
    var act = (G.ask && G.ask.id && E.fig(G, G.ask.id)) || (G.ask && G.ask.h === 'sel' ? hs[UI.tab] || hs[0] : null);
    hb.innerHTML = '';
    hs.forEach(function (f) {
      var H = D.HERO[f.cls], c = document.createElement('div'); c.className = 'hcard' + (act && act.id === f.id ? ' on' : ''); c.style.setProperty('--hc', H.col);
      var cv = tileCanvas(H.tile); cv.className = 'hp-por'; c.appendChild(cv);
      var t = document.createElement('div'); t.className = 'hinfo';
      t.innerHTML = '<b>' + esc(H.n) + '</b><span class="hpb"><span style="width:' + Math.round(100 * Math.max(0, f.hp) / f.max) + '%"></span></span>' +
        '<span class="hst">' + Math.max(0, f.hp) + '/' + f.max + ' HP · ' + f.hand.length + ' cards</span>';
      c.appendChild(t); hb.appendChild(c);
    });
  }
  function target() {
    var gk = Object.keys(UI.glow || {});
    if (gk.length) {
      var k = UI.doorBest && UI.glow[UI.doorBest] ? UI.doorBest : null, f = curFig();
      if (!k) { var atk = gk.filter(function (x) { return UI.glow[x] === 'atk'; }); var pool = atk.length ? atk : gk; k = pool[0];
        if (f && f.pos && !atk.length) { var fp = hexWorld(f.pos); pool.forEach(function (x) { var a = hexWorld(x), b = hexWorld(k); if (Math.hypot(a.x - fp.x, a.y - fp.y) > Math.hypot(b.x - fp.x, b.y - fp.y)) k = x; }); } }
      var s = toScreen(k), r = $('cv').getBoundingClientRect(), R = CAM.z * 0.9; return { left: r.left + s.x - R, right: r.left + s.x + R, top: r.top + s.y - R, bottom: r.top + s.y + R };
    }
    var sel = ['#readybtn:not([disabled])', '#tray .cd.tut', '#tray .half.tut', '#tray .half.can', '#tray .basic button.can', '#tray .cd:not(.sel)', '#pbtns .btn.go', '#pbtns .btn'];
    if (G && G.ask && ['sel', 'first', 'second', 'lrest', 'recover', 'block'].indexOf(G.ask.h) < 0) sel.unshift('#pbtns .btn.go');
    if (G && G.ask && G.ask.h === 'sel') { var hs = E.liveHeroes(G), h = hs[UI.tab]; if (!h || (UI.sel[h.id] || []).length < 2) sel.shift(); }
    for (var i = 0; i < sel.length; i++) { var e = document.querySelector(sel[i]); if (e && e.offsetParent) { var b = e.getBoundingClientRect(); if (b.width) return b; } }
    return null;
  }
  var raf = 0;
  function placeCoach() { if (raf) return; raf = requestAnimationFrame(function () { raf = 0; place(); }); }
  window.placeCoach = placeCoach; window.coachTarget = function () { var t = target(); return t ? { x: (t.left + t.right) / 2, y: (t.top + t.bottom) / 2, w: t.right - t.left, h: t.bottom - t.top } : null; };
  function place() {
    var txt = ($('prompt') && $('prompt').textContent || '').trim(), blocked = !G || G.done || UI.busy || !$('start').hidden || !$('camp').hidden || !$('rs').hidden;
    var t = blocked || !txt ? null : target();
    document.body.classList.toggle('coach-on', !!t);
    if (!t) { bub.style.display = 'none'; return; }
    bub.style.display = 'block'; bub.querySelector('.ct').textContent = txt;
    var vw = innerWidth, vh = innerHeight, bw = Math.min(300, vw - 24); bub.style.width = bw + 'px';
    var bh = bub.offsetHeight, cx = (t.left + t.right) / 2, dk = $('dock').getBoundingClientRect(), inDock = t.top >= dk.top - 1 && t.left >= dk.left - 1;
    var top0 = inDock ? Math.min(t.top, dk.top + (innerWidth >= 800 ? t.top - dk.top : 0)) : t.top;
    if (inDock && innerWidth < 800) top0 = dk.top;
    var above = top0 - bh - 14 >= 56, y = above ? top0 - bh - 14 : t.bottom + 14;
    if (!above && y + bh > vh - 8) y = Math.max(56, t.top - bh - 14);
    bub.classList.remove('left');
    if (inDock && innerWidth >= 800 && dk.left > bw + 30) { var ly = Math.max(56, Math.min(vh - bh - 8, (t.top + t.bottom) / 2 - bh / 2)); bub.style.left = (dk.left - bw - 16) + 'px'; bub.style.top = ly + 'px'; bub.classList.add('left'); bub.classList.remove('below'); var la = bub.querySelector('.ca'); la.style.left = ''; la.style.top = Math.max(10, Math.min(bh - 30, (t.top + t.bottom) / 2 - ly - 10)) + 'px'; return; }
    bub.querySelector('.ca').style.top = '';
    var x = Math.max(12, Math.min(vw - bw - 12, cx - bw / 2));
    bub.style.left = x + 'px'; bub.style.top = y + 'px'; bub.classList.toggle('below', !above);
    var a = bub.querySelector('.ca'); a.style.left = Math.max(14, Math.min(bw - 28, cx - x - 9)) + 'px';
  }
  var _dn = drawNow; drawNow = function () { _dn(); placeCoach(); };
  addEventListener('resize', placeCoach);
})();
