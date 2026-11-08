/* Wildmark feel (shell/gx-feel.js, FEEL.md): drag a market pair onto your valley, drag the animal onto a tile, flights from
   the market, the rival's tile and token flying into its valley, the camera leaning in on each placement, points flying to
   the animal chips, keyboard play. Tap-to-place stays exactly as before. Rules engine untouched. */
var WMF = (function () {
  if (!window.GXF) return null;
  var F = window.GXF, q = new URLSearchParams(location.search);
  if (q.get('fast')) F.off = true;
  F.mute = function () { return !!UI.prefs.mute; };
  function canDrag() { return myTurn() && UI.mode !== 'tutorial' && !(window.GXT && GXT.running && GXT.running()); }
  // screen rect of a map cell (the hex drawn at the current pan/zoom)
  function cellRect(c) {
    var b = $('#board').getBoundingClientRect(), p = pix(c), z = UI.pan, s = SZ * z.z;
    return { left: b.left + p[0] * z.z + z.tx - s * 0.87, top: b.top + p[1] * z.z + z.ty - s, width: s * 1.74, height: s * 2 };
  }
  function tokNode(a, px) { var d = document.createElement('div'); d.innerHTML = mkTok(a); d.firstChild.style.cssText = 'width:100%;height:100%'; return d.firstChild; }
  function tileNode(t, rot) { var d = document.createElement('div'); d.innerHTML = mkTile(t, 30); return d.firstChild; }
  // camera: lean in on one cell (keeps the player's own pan if they moved the map in the last 4 s)
  function focusCell(c, z) {
    if (!F.ms(300) || Date.now() - (UI.userPan || 0) < 4000) return;
    var wh = boardWH(), p = pix(c), zz = Math.max(UI.pan.z, Math.min(2.2, z || UI.pan.z * 1.25));
    var t = { z: zz, tx: wh[0] / 2 - p[0] * zz, ty: wh[1] * 0.46 - p[1] * zz }, f = Object.assign({}, UI.pan), t0 = performance.now(), D = F.ms(420);
    cancelAnimationFrame(UI.panT);
    (function an(n) { var k = Math.min(1, (n - t0) / D), e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; UI.pan = { z: f.z + (t.z - f.z) * e, tx: f.tx + (t.tx - f.tx) * e, ty: f.ty + (t.ty - f.ty) * e }; applyPan(); if (k < 1) UI.panT = requestAnimationFrame(an); })(t0);
  }
  function hexSize() { var s = Math.max(70, Math.min(150, SZ * UI.pan.z * 2.1)); return { w: s * 0.9, h: s }; }   // a lifted piece at the valley's scale
  function hexEl(c) { return $('#map .hx[data-c="' + c + '"]'); }

  // ---------------------------------------------------------------- drag 1: a market pair onto a free spot of your valley
  F.drag({
    items: '#mk .mt, #mk .mk',
    data: function (el) { if (!canDrag() || G.stage !== 'pick' || UI.wipe || UI.free) return null; var i = +el.dataset.i; return G.market.tiles[i] && G.market.toks[i] ? { i: i } : null; },
    ghost: function (el, d) { var w = document.createElement('div'); w.className = 'wmf-pair'; w.innerHTML = mkTile(G.market.tiles[d.i], 30) + '<span>' + mkTok(G.market.toks[d.i]) + '</span>'; return w; },
    size: hexSize,
    start: function (d) { UI.dragSpots = true; drawMap(); },
    targets: function () { return $$('#map .spot[data-c]').map(function (e) { return { el: e, c: e.getAttribute('data-c') }; }); },
    over: function (d, t) { UI.hov = t ? t.c : null; },
    drop: function (d, t) {
      UI.dragSpots = false; UI.hov = null;
      if (!tutOK({ what: 'take', i: d.i })) { drawMap(); return false; }
      var from = mkRects(d.i);
      // three short tasks instead of one long one on slow phones: the drop (now), the take (next frame), the ghost (the frame after)
      UI.dropBusy = true;
      requestAnimationFrame(function () {
        UI.dropBusy = false; if (!G || !myTurn() || G.stage !== 'pick') return;
        take({ t: 'take', i: d.i, viaDrag: 1 });
        if (G.stage !== 'tile') return;
        if (WM.spots(G.seats[G.cur].env).indexOf(t.c) < 0 || !tutOK({ what: 'spot', c: t.c })) return;
        UI.ghost = { c: t.c, rot: bestRot(t.c) };
        requestAnimationFrame(function () {
          if (!G || G.stage !== 'tile' || !UI.ghost) return; render();
          var g = $('#map .ghost'); if (g) F.settle(g);
          flyTok(from && from.k, G.hold && G.hold.tok);
        });
      });
      return true;
    },
    end: function (d, ok) { if (UI.dragSpots) { UI.dragSpots = false; UI.hov = null; drawMap(); } }
  });
  // ---------------------------------------------------------------- drag 2: move the ghost tile to another spot before placing
  F.drag({
    items: '#map .ghost',
    data: function () { return canDrag() && G.stage === 'tile' && UI.ghost ? { c: UI.ghost.c } : null; },
    ghost: function () { return tileNode(G.hold.tile); }, size: hexSize,
    start: function () { UI.dragSpots = true; drawMap(); },
    targets: function () { return $$('#map .spot[data-c]').map(function (e) { return { el: e, c: e.getAttribute('data-c') }; }); },
    drop: function (d, t) { UI.dragSpots = false; if (!tutOK({ what: 'spot', c: t.c })) { drawMap(); return false; } UI.ghost = { c: t.c, rot: t.c === d.c ? UI.ghost.rot : bestRot(t.c) }; render(); return true; },
    end: function () { if (UI.dragSpots) { UI.dragSpots = false; drawMap(); } }
  });
  // ---------------------------------------------------------------- drag 3: the animal onto a tile (places the tile first if it is still a ghost)
  F.drag({
    items: '#acts .htok',
    data: function () { return canDrag() && (G.stage === 'tok' || (G.stage === 'tile' && UI.ghost)) ? { tok: G.hold.tok } : null; },
    ghost: function (el, d) { return tokNode(d.tok); }, size: function () { var s = Math.max(44, SZ * UI.pan.z * 0.95); return { w: s, h: s }; },
    start: function () { UI.dragTok = true; drawMap(); },
    targets: function () {
      var t = $$('#map .ring.dropt[data-c]').map(function (e) { return { el: e, c: e.getAttribute('data-c') }; });
      if (G.stage === 'tile' && UI.ghost && G.hold.tile.a.indexOf(G.hold.tok) >= 0) { var g = $('#map .ghost .gring'); if (g) t.push({ el: g, c: UI.ghost.c }); }
      t.push({ el: $('#mk'), back: 1 });   // drop on the market to return it
      return t;
    },
    drop: function (d, t) {
      UI.dragTok = false;
      var tok = function () {
        if (!G || G.stage !== 'tok') return false;
        if (t.back) { if (!WM.moves(G).some(function (m) { return m.t === 'back'; })) return false; act({ t: 'back' }); return true; }
        var x = G.seats[G.cur].env[t.c]; if (!x || x.tok || x.a.indexOf(G.hold.tok) < 0 || !tutOK({ what: 'tok', c: t.c })) { drawMap(); return false; }
        act({ t: 'tok', c: t.c }); setTimeout(function () { F.hop(hexEl(t.c)); }, 30); return true;
      };
      if (G.stage === 'tile') {   // the tile settles first, the animal lands on the next frame (two short tasks, not one long one)
        if (!tutOK({ what: 'ok' })) { drawMap(); return false; }
        var x0 = t.c && t.c !== UI.ghost.c ? G.seats[G.cur].env[t.c] : null; if (t.c && t.c !== UI.ghost.c && (!x0 || x0.tok || x0.a.indexOf(G.hold.tok) < 0)) { drawMap(); return false; }
        confirmPlace(); if (G.stage !== 'tok') return true;
        requestAnimationFrame(function () { tok(); }); return true;
      }
      return tok();
    },
    end: function () { if (UI.dragTok) { UI.dragTok = false; drawMap(); } }
  });

  // ---------------------------------------------------------------- flights on the tap path too
  function mkRects(i) { var t = $('#mk .mt[data-i="' + i + '"]'), k = $('#mk .mk[data-i="' + i + '"]'); return { t: t && t.getBoundingClientRect(), k: k && k.getBoundingClientRect(), ti: i, ki: i }; }
  function flyTok(fromR, tok) { var to = $('#acts .htok'); if (!fromR || !to || !tok) return; to.style.opacity = '0'; F.fly(fromR, to, { node: tokNode(tok), ms: 420 }).then(function () { to.style.opacity = ''; F.hop(to); }); }
  // the move rating (score.js, ~60 ms on a slow phone: it plans the best move) runs one task later on a snapshot, so a
  // pick never blocks a frame for long; it only reads the state and writes PV.turn, which is read when the turn ends
  var pvStart0 = window.pvTurnStart;
  if (pvStart0) {
    window.pvTurnStart = function (m) {
      if (!G || G.seats[G.cur].ai) return; UI.rivalMsg = null;
      var snap = WM.clone(G), mm = Object.assign({}, m);
      setTimeout(function () { var live = G; G = snap; try { pvStart0(mm); } catch (e) { } finally { G = live; } }, 0);
    };
    pvTurnStart = window.pvTurnStart;
  }
  var take0 = window.take;
  window.take = function (m) {
    var a = m.t === 'take' ? mkRects(m.i) : m.t === 'free' ? { t: ($('#mk .mt[data-i="' + m.ti + '"]') || {}).getBoundingClientRect && $('#mk .mt[data-i="' + m.ti + '"]').getBoundingClientRect(), k: ($('#mk .mk[data-i="' + m.ki + '"]') || null) && $('#mk .mk[data-i="' + m.ki + '"]').getBoundingClientRect() } : null;
    var r = take0.apply(this, arguments);
    if (a && !m.viaDrag && G && G.hold) {   // tap path: the pair flies from the market into your hand
      var tt = $('#acts .held svg'); if (a.t && tt) F.fly(a.t, tt, { node: tileNode(G.hold.tile), ms: 420 });
      flyTok(a.k, G.hold.tok);
    }
    return r;
  };
  take = window.take;
  var act0 = window.act;
  window.act = function (m) {
    var from = (m.t === 'tok') ? ($('#acts .htok') || {}).getBoundingClientRect && $('#acts .htok').getBoundingClientRect() : null, tok = G.hold && G.hold.tok;
    var seat = G.cur, before = WM.final(G)[seat];
    var r = act0.apply(this, arguments);
    if (m.t === 'place') { setTimeout(function () { F.settle(hexEl(m.c)); }, 20); F.tick('drop'); }
    if (m.t === 'tok' && tok) {
      var to = cellRect(m.c), h = hexEl(m.c);
      if (from && from.width) F.fly(from, to, { node: tokNode(tok), ms: 380, scale: 0.6 }).then(function () { F.hop(hexEl(m.c)); F.sfx('hop'); });
      else F.hop(h);
      var after = WM.final(G)[seat], best = null;
      WM.ANI.forEach(function (a) { var d = after.ani[a] - before.ani[a]; if (d > 0 && (!best || d > best.d)) best = { a: a, d: d }; });
      if (best) setTimeout(function () { var chip = $('#cards .cc[data-card="' + best.a + '"]'); if (!chip || !chip.offsetParent) chip = $('#seats .seat[data-seat="' + seat + '"] b') || $('#barstat'); F.points(cellRect(m.c), chip, '+' + best.d); F.buzz('score'); }, F.ms(380));   // clean Play hides the animal chips: fly to your score
    }
    return r;
  };
  act = window.act;
  var render0 = window.render;
  window.render = function () { var r = render0.apply(this, arguments); try { F.rollAll($('#board')); } catch (e) { } return r; };
  render = window.render;
  var step0 = window.step;
  window.step = function () { if (G && G.over && !UI.beatDone) { UI.beatDone = true; F.thump($('#seats') || $('#barstat')); } if (G && !G.over) UI.beatDone = false; return step0.apply(this, arguments); };
  step = window.step;
  var newGame0 = window.newGame;
  window.newGame = function () { F.rollReset(); return newGame0.apply(this, arguments); };
  newGame = window.newGame;

  // ---------------------------------------------------------------- keyboard (PC): 1-4 pick, arrows move, R turn, Enter place, Z back, B return, +/- zoom
  function cycle(list, curr, dir) { if (!list.length) return null; list = list.slice().sort(function (a, b) { var p = pix(a), q2 = pix(b); return p[1] - q2[1] || p[0] - q2[0]; }); var i = list.indexOf(curr); return list[(i + dir + list.length) % list.length]; }
  F.keys({
    digit: function (n) { if (!myTurn() || G.stage !== 'pick' || n > 4) return false; onMarket(UI.free && UI.free.ti != null ? 'k' : 't', n - 1); },
    ArrowRight: function () { return mv(1); }, ArrowDown: function () { return mv(1); }, ArrowLeft: function () { return mv(-1); }, ArrowUp: function () { return mv(-1); },
    r: function () { if (!myTurn() || G.stage !== 'tile' || !UI.ghost) return false; rotate(); },
    ' ': function () { if (!myTurn() || G.stage !== 'tile' || !UI.ghost) return false; rotate(); },
    Enter: function () {
      if (!myTurn()) return false;
      if (G.stage === 'tile' && UI.ghost) { confirmPlace(); return; }
      if (G.stage === 'tok' && UI.kf) { var c = UI.kf; UI.kf = null; onCell(c, false); setTimeout(function () { F.hop(hexEl(c)); }, 30); return; }
      return false;
    },
    z: function () { if (!UI.undo) return false; undoTake(); }, Backspace: function () { if (!UI.undo) return false; undoTake(); },
    b: function () { var b = $('#backB'); if (!b) return false; b.click(); },
    Escape: function () { var c = $('#cancelB') || $('#acornX'); if (!c) return false; c.click(); },
    '+': function () { var wh = boardWH(); zoomAt(1.15, wh[0] / 2, wh[1] / 2); UI.userPan = Date.now(); }, '=': function () { var wh = boardWH(); zoomAt(1.15, wh[0] / 2, wh[1] / 2); UI.userPan = Date.now(); },
    '-': function () { var wh = boardWH(); zoomAt(1 / 1.15, wh[0] / 2, wh[1] / 2); UI.userPan = Date.now(); }, '0': function () { UI.userPan = 0; fitView(); }
  }, { when: function () { return !!G && $('#start').hidden; } });
  function mv(dir) {
    if (!myTurn()) return false;
    if (G.stage === 'tile') { var c = cycle(WM.spots(G.seats[G.cur].env), UI.ghost && UI.ghost.c, dir); if (!c) return false; UI.ghost = { c: c, rot: bestRot(c) }; F.sfx('hover'); render(); return; }
    if (G.stage === 'tok') { var t = cycle(WM.tokSpots(G.seats[G.cur].env, G.hold.tok), UI.kf, dir); if (!t) return false; UI.kf = t; drawMap(); return; }
    return false;
  }

  // ---------------------------------------------------------------- the rival's turn: its pair flies from the market into its valley, step by step
  return {
    grab: function (col) { return { t: ($('#mk .mt[data-i="' + col[0] + '"]') || null) && $('#mk .mt[data-i="' + col[0] + '"]').getBoundingClientRect(), k: ($('#mk .mk[data-i="' + col[1] + '"]') || null) && $('#mk .mk[data-i="' + col[1] + '"]').getBoundingClientRect(), tile: G.market.tiles[col[0]], tok: G.market.toks[col[1]] }; },
    aiTile: function (fx, c) {
      if (!fx || !fx.tile) return; var h = hexEl(c); if (h) h.style.opacity = '0';
      setTimeout(function () {   // after the camera has framed the valley
        focusCell(c, 1.35);
        F.fly(fx.t, cellRect(c), { node: tileNode(fx.tile), ms: 560, arc: 90 }).then(function () { var h2 = hexEl(c); if (h2) { h2.style.opacity = ''; F.settle(h2); } F.sfx('drop'); });
      }, F.ms(380));
      setTimeout(function () { var h3 = hexEl(c); if (h3) h3.style.opacity = ''; }, 1600);   // never leave it hidden
    },
    aiTok: function (fx, m2) {
      if (!fx || !fx.tok) return;
      if (m2.t !== 'tok') { F.sfx('deny'); return; }
      focusCell(m2.c, 1.35);
      F.fly(fx.k || cellRect(m2.c), cellRect(m2.c), { node: tokNode(fx.tok), ms: 520, arc: 80, scale: 0.6 }).then(function () { F.hop(hexEl(m2.c)); F.sfx('hop'); });
    },
    focus: focusCell, cellRect: cellRect
  };
})();
