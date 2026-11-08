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
  // hooks: the owner functions in ui.js call these (take, act, render, step, newGame); feel.js never re-defines them
  function takeFrom(m) {   // before take(): where the pair sits in the market
    if (m.t === 'take') return mkRects(m.i);
    if (m.t !== 'free') return null; var t = $('#mk .mt[data-i="' + m.ti + '"]'), k = $('#mk .mk[data-i="' + m.ki + '"]');
    return { t: t && t.getBoundingClientRect(), k: k && k.getBoundingClientRect() };
  }
  function took(m, a) {   // after take(): tap path, the pair flies from the market into your hand
    if (!a || m.viaDrag || !G || !G.hold) return;
    var tt = $('#acts .held svg'); if (a.t && tt) F.fly(a.t, tt, { node: tileNode(G.hold.tile), ms: 420 });
    flyTok(a.k, G.hold.tok);
  }
  function actFrom(m) {   // before act(): the held animal and the score
    var h = m.t === 'tok' ? $('#acts .htok') : null;
    return { from: h ? h.getBoundingClientRect() : null, tok: G.hold && G.hold.tok, seat: G.cur, before: WM.final(G)[G.cur] };
  }
  function acted(m, fx) {   // after act(): the tile settles, the animal hops in, points fly to the score
    if (!fx) return;
    if (m.t === 'place') { setTimeout(function () { F.settle(hexEl(m.c)); }, 20); F.tick('drop'); }
    if (m.t !== 'tok' || !fx.tok) return;
    if (fx.from && fx.from.width) F.fly(fx.from, cellRect(m.c), { node: tokNode(fx.tok), ms: 380, scale: 0.6 }).then(function () { F.hop(hexEl(m.c)); F.sfx('hop'); });
    else F.hop(hexEl(m.c));
    var after = WM.final(G)[fx.seat], best = null;
    WM.ANI.forEach(function (a) { var d = after.ani[a] - fx.before.ani[a]; if (d > 0 && (!best || d > best.d)) best = { a: a, d: d }; });
    if (best) setTimeout(function () { var chip = $('#cards .cc[data-card="' + best.a + '"]'); if (!chip || !chip.offsetParent) chip = $('#seats .seat[data-seat="' + fx.seat + '"] b') || $('#barstat'); F.points(cellRect(m.c), chip, '+' + best.d); F.buzz('score'); }, F.ms(380));   // clean Play hides the animal chips: fly to your score
  }
  function rendered() {   // end of render(): counters roll; while Rowan speaks nothing else talks
    try { F.rollAll($('#board')); var pv = $('#pv'); if (pv && coachUp()) pv.hidden = true; var tl = $('#tline'); if (tl && coachUp()) tl.hidden = true; placeTline(); } catch (e) { }
  }
  // R5: one turn line under the board after every turn (yours and the rival's): "Bram +9: elk line, river".
  // It stays until tapped or the next turn's line replaces it (never a timer).
  function tline() { var e = $('#tline'); if (!e) { e = document.createElement('div'); e.id = 'tline'; e.setAttribute('role', 'status'); e.setAttribute('aria-live', 'polite'); e.hidden = true; e.addEventListener('click', function () { e.hidden = true; }); $('#board').appendChild(e); } return e; }
  function placeTline() { var e = $('#tline'), ln = $('#line'); if (!e || e.hidden || !ln) return; var b = $('#board').getBoundingClientRect(), r = ln.getBoundingClientRect(); e.style.bottom = Math.round(b.bottom - r.top + 8) + 'px'; }
  function turnStart() { if (!G || G.over) return null; var s = G.seats[G.cur]; return { key: G.cur + ':' + s.done, seat: G.cur, sc: pvScore(s.env, s.acorns), tot: WM.final(G)[G.cur].total }; }
  function turnSay(T) {
    if (!T || !G || UI.mode === 'coach' || UI.mode === 'tutorial') return;   // Learn has Rowan's bubble: one message at a time
    var s = G.seats[T.seat], d = WM.final(G)[T.seat].total - T.tot, parts = pvParts(T.sc, pvScore(s.env, s.acorns));
    if (s.acorns > T.sc.acorns) parts.push({ d: s.acorns - T.sc.acorns, a: null, t: null });
    var nm = T.seat === meSeat() && UI.humans === 1 ? 'You' : s.name, why = parts.length ? pvPop(parts) : '';
    var e = tline(); e.innerHTML = '<b>' + esc(nm) + (d > 0 ? ' +' + d : d < 0 ? ' ' + d : '') + '</b>' + (d === 0 ? ': no points this turn' : why && !hintsOn() ? ': ' + esc(why.replace(/^[+-]?\d+\s*/, '').replace(/, [+-]?\d+ /g, ', ')) : why ? ': ' + esc(why) : '');
    e.hidden = false; placeTline();
  }
  function stepped() {   // start of step(): the end beat; when the turn passed, say what it scored and remember the new one
    if (G && G.over && !UI.beatDone) { UI.beatDone = true; F.thump($('#seats') || $('#barstat')); } if (G && !G.over) UI.beatDone = false;
    try {
      var k = G && !G.over ? G.cur + ':' + G.seats[G.cur].done : 'over';
      if (UI.turnT && UI.turnT.key !== k) turnSay(UI.turnT);
      if (!UI.turnT || UI.turnT.key !== k) UI.turnT = turnStart();
    } catch (e) { UI.turnT = null; }
  }
  function reset() { F.rollReset(); UI.turnT = null; var t = $('#tline'); if (t) t.hidden = true; }   // newGame()

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
    focus: focusCell, cellRect: cellRect,
    takeFrom: takeFrom, took: took, actFrom: actFrom, acted: acted, rendered: rendered, stepped: stepped, reset: reset
  };
})();
