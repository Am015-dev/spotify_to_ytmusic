/* Wildmark UI: title (Story / Quick game / How to play), the hex map (SVG, pan + pinch + wheel zoom), the market dock, computer turns,
   hot-seat, scoring pops, result screen, save/resume. Story = campaign.js, tutorial = tutor.js, help + bulb = help.js. */
var G = null, AIDELAY = 650, ANIM = true;
var UI = { view: 0, mode: 'quick', ghost: null, free: null, wipe: null, undo: null, pan: { z: 1, tx: 0, ty: 0 }, panT: null, userPan: 0, lit: null, busy: false, camp: null, humans: 1, cfg: null, prefs: {} };
var SZ = 40, SQ3 = Math.sqrt(3);
function $(s, r) { return (r || document).querySelector(s); }
function $$(s, r) { return [].slice.call((r || document).querySelectorAll(s)); }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
try { UI.prefs = JSON.parse(localStorage.getItem('wm-prefs') || '{}') || {}; } catch (e) { UI.prefs = {}; }
function savePrefs() { try { localStorage.setItem('wm-prefs', JSON.stringify(UI.prefs)); } catch (e) { } }
function an(a) { return (/^[AEIOU]/.test(WM.ANI_NAME[a]) ? 'an ' : 'a ') + WM.ANI_NAME[a]; }
function toast(t, ms) { var e = $('#toast'); e.textContent = t; e.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(function () { e.classList.remove('on'); }, ms || 2200); }
// ---------------------------------------------------------------- sound (synth; music slots via gx-music when files exist)
var SND = { ctx: null };
function sfxVol() { try { var p = GX.pref ? GX.pref() : {}; return (p.master == null ? 1 : p.master) * (p.sfx == null ? 0.8 : p.sfx); } catch (e) { return 0.8; } }
function sfx(kind) {
  if (UI.prefs.mute) return; var v = sfxVol(); if (!v) return;
  try {
    var c = SND.ctx || (SND.ctx = new (window.AudioContext || window.webkitAudioContext)()), t = c.currentTime;
    var notes = { tap: [[660, 0.05]], place: [[330, 0.08], [440, 0.08]], tok: [[520, 0.07], [780, 0.1]], score: [[660, 0.08], [880, 0.08], [1180, 0.16]], wipe: [[300, 0.06], [240, 0.06], [200, 0.1]], acorn: [[880, 0.06], [1320, 0.12]], end: [[392, 0.15], [523, 0.15], [659, 0.3]] }[kind] || [[440, 0.05]];
    notes.forEach(function (n, i) { var o = c.createOscillator(), g = c.createGain(); o.type = kind === 'wipe' ? 'triangle' : 'sine'; o.frequency.value = n[0]; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.18 * v, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + n[1]); o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + n[1] + 0.02); t += n[1] * 0.8; });
  } catch (e) { }
}
// ---------------------------------------------------------------- hex geometry
function pix(c) { var p = WM.pk(c); return [SZ * SQ3 * (p[0] + p[1] / 2), SZ * 1.5 * p[1]]; }
function corner(x, y, s, j) { var a = (30 - 60 * j) * Math.PI / 180; return [x + s * Math.cos(a), y - s * Math.sin(a)]; }
function poly(x, y, s, js) { return js.map(function (j) { var p = corner(x, y, s, ((j % 6) + 6) % 6); return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' '); }
// a hex tile (placed or in the market) as SVG at (x,y), size s
function tileSvg(tile, x, y, s, rot, opt) {
  opt = opt || {}; var out = '', r = rot || 0;
  if (tile.t.length === 1) out += '<polygon points="' + poly(x, y, s, [0, 1, 2, 3, 4, 5]) + '" fill="url(#pt-' + tile.t[0] + ')"/>';
  else {   // half A = corners r..r+3 (edges r, r+1, r+2), half B = the rest
    out += '<polygon points="' + poly(x, y, s, [r, r + 1, r + 2, r + 3]) + '" fill="url(#pt-' + tile.t[0] + ')"/>';
    out += '<polygon points="' + poly(x, y, s, [r + 3, r + 4, r + 5, r + 6]) + '" fill="url(#pt-' + tile.t[1] + ')"/>';
  }
  out += '<polygon points="' + poly(x, y, s, [0, 1, 2, 3, 4, 5]) + '" fill="none" stroke="' + (tile.key ? '#f2d27a' : 'rgba(20,30,20,.55)') + '" stroke-width="' + (tile.key ? s * 0.09 : s * 0.04) + '"/>';
  if (opt.tok) out += tokenSvg(opt.tok, x, y, s * 0.46);
  else if (!opt.noSlots) {   // the animals this tile accepts: small discs
    var n = tile.a.length, rr = s * (n === 1 ? 0.3 : 0.22), off = n === 1 ? [[0, 0]] : n === 2 ? [[-0.27, 0], [0.27, 0]] : [[-0.27, 0.16], [0.27, 0.16], [0, -0.3]];
    tile.a.forEach(function (a, i) { out += tokenSvg(a, x + off[i][0] * s, y + off[i][1] * s, rr, ' sm'); });
  }
  return out;
}
// ---------------------------------------------------------------- game start / save
function seatHuman(i) { return G && !G.seats[i].ai; }
function meSeat() { if (!G) return 0; if (UI.humans > 1) return seatHuman(G.cur) ? G.cur : UI.lastHuman || 0; return 0; }
function newGame(cfg) {
  cfg = Object.assign({ np: 2, ai: 'normal', humans: 1, seed: null, turns: 20 }, cfg || {});
  var ai = [], names = [];
  for (var i = 0; i < cfg.np; i++) { ai.push(i < cfg.humans ? null : (cfg.lvBy && cfg.lvBy[i]) || cfg.ai); names.push(i < cfg.humans ? (cfg.humans > 1 ? 'Ranger ' + (i + 1) : 'You') : (cfg.names && cfg.names[i]) || WM.RIVALS[(i - cfg.humans) % WM.RIVALS.length]); }
  if (cfg.humans === 1) names[0] = 'You';
  G = WM.newGame({ np: cfg.np, seed: cfg.seed, ai: ai, names: names, turns: cfg.turns, acorns: cfg.acorns, no3: cfg.no3 });
  UI.cfg = cfg; UI.humans = cfg.humans; UI.view = 0; UI.lastHuman = 0; UI.ghost = null; UI.free = null; UI.wipe = null; UI.undo = null; UI.lit = null; UI.userPan = 0; UI.passed = -1;
  $('#start').hidden = true; $('#rs').hidden = true; try { GX.close(); } catch (e) { }
  fitView(true); render(); step(); save(); musicSync();
  return G;
}
function save() { if (!G || UI.mode !== 'quick' || G.over) { if (G && G.over && UI.mode === 'quick') try { localStorage.removeItem('wm-save'); } catch (e) { } return; } try { localStorage.setItem('wm-save', JSON.stringify({ G: G, cfg: UI.cfg })); } catch (e) { } }
function loadSave() { try { var s = JSON.parse(localStorage.getItem('wm-save') || 'null'); return s && s.G && !s.G.over ? s : null; } catch (e) { return null; } }
function resume() { var s = loadSave(); if (!s) return; G = s.G; UI.cfg = s.cfg; UI.humans = s.cfg.humans || 1; UI.mode = 'quick'; UI.view = meSeat(); UI.ghost = UI.free = UI.wipe = UI.undo = null; UI.camp = null; $('#start').hidden = true; fitView(true); render(); step(); musicSync(); }
// ---------------------------------------------------------------- the flow
function step() {
  clearTimeout(UI.aiT);
  if (!G) return;
  if (G.over) { render(); setTimeout(showResult, ANIM ? 900 : 50); return; }
  if (G.seats[G.cur].ai) { UI.aiT = setTimeout(aiStep, UI.fast ? 30 : AIDELAY); return; }
  if (UI.humans > 1 && UI.passed !== G.cur && G.stage === 'pick') { showPass(); return; }
  UI.lastHuman = G.cur; if (UI.view !== G.cur) { UI.view = G.cur; fitView(); }
  render(); if (typeof tutFix === 'function') tutFix();
}
function aiStep() {
  if (!G || G.over || !G.seats[G.cur].ai || UI.tutor) return;
  var m = WM.AI.choose(G);
  if (G.stage === 'pick') {
    var col = m.t === 'take' ? [m.i, m.i] : m.t === 'free' ? [m.ti, m.ki] : null;
    if (col) { $$('#mk .mt[data-i="' + col[0] + '"], #mk .mk[data-i="' + col[1] + '"]').forEach(function (e) { e.classList.add('flash'); }); }
    var nm = G.seats[G.cur].name;
    setTimeout(function () {
      try { WM.apply(G, m); } catch (e) { console.error(e); return; }
      if (m.t === 'wipe3') { toast(nm + ' swept three tokens.'); sfx('wipe'); }
      else if (G.stage === 'tile') { var h = G.hold; m = WM.AI.choose(G); WM.apply(G, m); var m2 = WM.AI.choose(G); WM.apply(G, m2); UI.lastAI = { seat: G.last.seat, tok: h.tok, m2: m2 }; toast(nm + (m2.t === 'tok' ? ' placed ' + an(h.tok) + '.' : ' returned ' + an(h.tok) + '.'), 1600); if (G.last.acorn) sfx('acorn'); else sfx('place'); }
      render(); step();
    }, UI.fast ? 10 : Math.round(AIDELAY * 0.8));
    return;
  }
  WM.apply(G, m); render(); step();
}
function showPass() {
  var e = $('#pass'); e.hidden = false; e.innerHTML = '<div class="pbox"><h2>' + esc(G.seats[G.cur].name) + '</h2><p>Your turn. Pass the device.</p><button class="big" id="passB" type="button">I am ' + esc(G.seats[G.cur].name) + '</button></div>';
}
// ---------------------------------------------------------------- human actions
function act(m) {
  var before = G.seats[G.cur], sc0 = WM.score(before.env, before.acorns), at = null;
  WM.apply(G, m);
  if (m.t === 'place') { UI.ghost = null; sfx('place'); var g = WM.score(before.env, before.acorns).habT - sc0.habT; if (g > 0) pop(m.c, '+' + g + ' habitat', 'hab'); }
  if (m.t === 'tok' || m.t === 'back') {
    UI.undo = null; at = m.c;
    if (m.t === 'tok') {
      var sc1 = WM.score(before.env, before.acorns), best = null;
      WM.ANI.forEach(function (a) { var d = sc1.ani[a] - sc0.ani[a]; if (d && (!best || d > best.d)) best = { a: a, d: d }; });
      var tot = sc1.aniT - sc0.aniT;
      if (tot > 0) { var info = {}; WM.scoreAnimal(before.env, best.a, info); UI.lit = { cells: info.lit, a: best.a, until: Date.now() + 1600 }; pop(m.c, '+' + tot + ' ' + WM.CARDS[best.a].title, 'ani'); sfx('score'); setTimeout(function () { UI.lit = null; drawMap(); }, 1700); }
      else if (tot < 0) { pop(m.c, tot + ' points', 'neg'); sfx('tok'); } else sfx('tok');
      if (G.last && G.last.acorn) { setTimeout(function () { pop(m.c, '+1 acorn', 'acorn'); sfx('acorn'); }, 350); }
    } else sfx('tap');
    save();
  }
  render(); step();
}
function pop(c, text, cls) {   // floating points at a map cell (DOM, readable size)
  var b = $('#board').getBoundingClientRect(), p = pix(c), z = UI.pan, x = p[0] * z.z + z.tx, y = p[1] * z.z + z.ty;
  var e = document.createElement('div'); e.className = 'pop ' + (cls || ''); e.textContent = text; e.style.left = Math.max(60, Math.min(b.width - 60, x)) + 'px'; e.style.top = Math.max(30, y - 20) + 'px';
  $('#board').appendChild(e); setTimeout(function () { e.remove(); }, 1800);
}
function tutOK(x) { return typeof tutAct === 'function' ? tutAct(x) : true; }
function myTurn() { return G && !G.over && !G.seats[G.cur].ai && UI.view === G.cur && $('#pass').hidden; }
function onMarket(kind, i) {
  if (!myTurn() || G.stage !== 'pick') return;
  if (UI.wipe) { if (!G.market.toks[i]) return; if (!tutOK({ what: 'wsel', i: i })) return; var j = UI.wipe.indexOf(i); if (j >= 0) UI.wipe.splice(j, 1); else UI.wipe.push(i); sfx('tap'); render(); return; }
  if (UI.free) {
    if (!tutOK({ what: 'free' + kind, i: i })) return;
    if (kind === 't') UI.free.ti = i; else UI.free.ki = i; sfx('tap');
    if (UI.free.ti != null && UI.free.ki != null) { if (UI.free.ti === UI.free.ki) { UI.free = null; take({ t: 'take', i: i }); return; } var f = UI.free; UI.free = null; take({ t: 'free', ti: f.ti, ki: f.ki }); return; }
    render(); return;
  }
  if (!tutOK({ what: 'take', i: i })) return;
  take({ t: 'take', i: i });
}
function take(m) { UI.undo = WM.clone(G); sfx('tap'); WM.apply(G, m); UI.ghost = null; render(); fitView(); }
function onCell(c, isSpot) {
  var vx = G && G.seats[UI.view].env[c];
  if (vx && !isSpot && (!myTurn() || G.stage === 'pick' || (G.stage === 'tile' && !(UI.ghost && UI.ghost.c === c)))) { showBig('tile', vx, vx.tok); return; }
  if (!myTurn()) return;
  if (G.stage === 'tile') {
    if (UI.ghost && UI.ghost.c === c) { rotate(); return; }
    if (!isSpot) return;
    if (!tutOK({ what: 'spot', c: c })) return;
    UI.ghost = { c: c, rot: bestRot(c) }; sfx('tap'); render(); return;
  }
  if (G.stage === 'tok') {
    var x = G.seats[G.cur].env[c]; if (x && (x.tok || x.a.indexOf(G.hold.tok) < 0) && !isSpot) { showBig('tile', x, x.tok); return; } if (!x || x.tok || x.a.indexOf(G.hold.tok) < 0) { toast(an(G.hold.tok).replace(/^a/, 'A') + ' needs an empty tile showing it.'); return; }
    if (!tutOK({ what: 'tok', c: c })) return;
    act({ t: 'tok', c: c });
  }
}
function bestRot(c) {   // the rotation that joins the most matching edges (a friendly default; the player can turn it)
  var t = G.hold.tile; if (t.t.length === 1) return 0; var env = G.seats[G.cur].env, best = 0, bv = -1;
  for (var r = 0; r < 6; r++) { var v = 0, cell = { t: t.t, rot: r }; WM.nb(c).forEach(function (n, d) { if (env[n] && WM.edgeT(env[n], (d + 3) % 6) === WM.edgeT(cell, d)) v++; }); if (v > bv) { bv = v; best = r; } }
  return best;
}
function rotate() { if (!UI.ghost || !tutOK({ what: 'rot' })) return; if (G.hold.tile.t.length > 1) { UI.ghost.rot = (UI.ghost.rot + 1) % 6; sfx('tap'); } else toast('One terrain: no need to turn it.'); render(); }
function confirmPlace() { if (!UI.ghost || !tutOK({ what: 'ok' })) return; act({ t: 'place', c: UI.ghost.c, rot: UI.ghost.rot }); fitView(); }
function undoTake() { if (!UI.undo || !tutOK({ what: 'undo' })) return; G = UI.undo; UI.undo = null; UI.ghost = null; sfx('tap'); render(); fitView(); }
// ---------------------------------------------------------------- pan and zoom
function boardWH() { var b = $('#board'); return [b.clientWidth || 390, b.clientHeight || 500]; }
function fitView(now) {
  if (!G) return; var env = G.seats[UI.view].env, cells = Object.keys(env); if (G.stage === 'tile' && UI.view === G.cur && !G.seats[G.cur].ai) cells = cells.concat(WM.spots(env));
  var x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; cells.forEach(function (c) { var p = pix(c); x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); });
  // keep clear of the chips on top (cards, seats), the zoom column on the right and the status line at the bottom
  var wh = boardWH(), padT = G.np > 1 ? 106 : 62, padB = 56, padL = 8, padR = 60, w = x1 - x0 + SZ * 2.2, h = y1 - y0 + SZ * 2.4;
  var z = Math.max(0.3, Math.min(1.9, Math.min((wh[0] - padL - padR) / w, (wh[1] - padT - padB) / h)));
  var t = { z: z, tx: padL + (wh[0] - padL - padR) / 2 - (x0 + x1) / 2 * z, ty: padT + (wh[1] - padT - padB) / 2 - (y0 + y1) / 2 * z };
  if (now || !ANIM || UI.fast) { UI.pan = t; drawMap(); return; }
  var f = Object.assign({}, UI.pan), t0 = performance.now(), D = 380;
  cancelAnimationFrame(UI.panT);
  (function an(n) { var k = Math.min(1, (n - t0) / D), e = 1 - Math.pow(1 - k, 3); UI.pan = { z: f.z + (t.z - f.z) * e, tx: f.tx + (t.tx - f.tx) * e, ty: f.ty + (t.ty - f.ty) * e }; applyPan(); if (k < 1) UI.panT = requestAnimationFrame(an); })(t0);
}
function applyPan() { var v = $('#vp'); if (v) v.setAttribute('transform', 'translate(' + UI.pan.tx.toFixed(1) + ',' + UI.pan.ty.toFixed(1) + ') scale(' + UI.pan.z.toFixed(3) + ')'); }
function zoomAt(f, cx, cy) { var p = UI.pan, z = Math.max(0.3, Math.min(2.6, p.z * f)); f = z / p.z; p.tx = cx - (cx - p.tx) * f; p.ty = cy - (cy - p.ty) * f; p.z = z; applyPan(); }
(function wirePan() {
  var pts = {}, start = null, moved = false;
  function svgXY(e) { var r = $('#board').getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
  document.addEventListener('pointerdown', function (e) { if (!e.target.closest || !e.target.closest('#map')) return; pts[e.pointerId] = svgXY(e); moved = false; start = { p: Object.assign({}, UI.pan), pts: JSON.parse(JSON.stringify(pts)) }; });
  document.addEventListener('pointermove', function (e) {
    if (!(e.pointerId in pts) || !start) return; pts[e.pointerId] = svgXY(e); var ids = Object.keys(pts);
    if (ids.length === 1) { var a = start.pts[ids[0]], b = pts[ids[0]]; if (!a) return; var dx = b[0] - a[0], dy = b[1] - a[1]; if (Math.abs(dx) + Math.abs(dy) > 8) moved = true; if (moved) { UI.pan.tx = start.p.tx + dx; UI.pan.ty = start.p.ty + dy; applyPan(); UI.userPan = Date.now(); } }
    else if (ids.length >= 2) { var p0 = start.pts[ids[0]], p1 = start.pts[ids[1]]; if (!p0 || !p1) { start = { p: Object.assign({}, UI.pan), pts: JSON.parse(JSON.stringify(pts)) }; return; } var q0 = pts[ids[0]], q1 = pts[ids[1]];
      var d0 = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) || 1, d1 = Math.hypot(q1[0] - q0[0], q1[1] - q0[1]), z = Math.max(0.3, Math.min(2.6, start.p.z * d1 / d0)), mx = (p0[0] + p1[0]) / 2, my = (p0[1] + p1[1]) / 2, nx = (q0[0] + q1[0]) / 2, ny = (q0[1] + q1[1]) / 2;
      UI.pan = { z: z, tx: nx - (mx - start.p.tx) * z / start.p.z, ty: ny - (my - start.p.ty) * z / start.p.z }; applyPan(); moved = true; UI.userPan = Date.now(); }
  });
  function up(e) { if (e.pointerId in pts) { delete pts[e.pointerId]; start = Object.keys(pts).length ? { p: Object.assign({}, UI.pan), pts: JSON.parse(JSON.stringify(pts)) } : start; if (!Object.keys(pts).length) setTimeout(function () { start = null; }, 0); } }
  document.addEventListener('pointerup', up); document.addEventListener('pointercancel', up);
  document.addEventListener('wheel', function (e) { if (!e.target.closest || !e.target.closest('#map')) return; e.preventDefault(); var p = svgXY(e); zoomAt(e.deltaY < 0 ? 1.12 : 1 / 1.12, p[0], p[1]); UI.userPan = Date.now(); }, { passive: false });
  document.addEventListener('click', function (e) {
    var m = e.target.closest && e.target.closest('#map'); if (!m) return; if (moved) { moved = false; return; }
    var hx = e.target.closest('[data-c]'); if (!hx) return; onCell(hx.getAttribute('data-c'), hx.classList.contains('spot'));
  });
})();
// ---------------------------------------------------------------- rendering
function drawMap() {
  if (!G) return; var s = G.seats[UI.view], env = s.env, mine = myTurn(), out = '';
  var lit = UI.lit && UI.lit.until > Date.now() ? UI.lit.cells : [];
  var keys = Object.keys(env).sort(function (a, b) { return WM.pk(a)[1] - WM.pk(b)[1]; });
  keys.forEach(function (c) {
    var x = env[c], p = pix(c), tgt = mine && G.stage === 'tok' && !x.tok && x.a.indexOf(G.hold.tok) >= 0, isLast = G.last && G.last.seat === UI.view && (G.last.tile === c);
    out += '<g class="hx' + (tgt ? ' tgt' : '') + (lit.indexOf(c) >= 0 ? ' lit' : '') + (isLast ? ' last' : '') + '" data-c="' + c + '">' + tileSvg(x, p[0], p[1], SZ - 1, x.rot, { tok: x.tok }) + (tgt ? '<polygon class="ring" points="' + poly(p[0], p[1], SZ - 4, [0, 1, 2, 3, 4, 5]) + '"/>' : '') + '</g>';
  });
  if (mine && G.stage === 'tile') {
    WM.spots(env).forEach(function (c) { if (UI.ghost && UI.ghost.c === c) return; var p = pix(c); out += '<polygon class="spot" data-c="' + c + '" points="' + poly(p[0], p[1], SZ - 3, [0, 1, 2, 3, 4, 5]) + '"/>'; });
    if (UI.ghost) { var p = pix(UI.ghost.c); out += '<g class="ghost" data-c="' + UI.ghost.c + '">' + tileSvg(G.hold.tile, p[0], p[1], SZ - 1, UI.ghost.rot) + '<polygon class="gring" points="' + poly(p[0], p[1], SZ + 2, [0, 1, 2, 3, 4, 5]) + '"/></g>'; }
  }
  var wh = boardWH();
  $('#map').innerHTML = terrainDefs() + '<rect class="bgr" x="0" y="0" width="' + wh[0] + '" height="' + wh[1] + '" fill="transparent"/><g id="vp">' + out + '</g>';
  $('#map').setAttribute('viewBox', '0 0 ' + wh[0] + ' ' + wh[1]); applyPan();
}
function mkTile(t, s) { var w = s * SQ3, h = s * 2; return '<svg viewBox="' + (-w / 2 - 2) + ' ' + (-h / 2 - 2) + ' ' + (w + 4) + ' ' + (h + 4) + '" aria-hidden="true">' + terrainDefs() + tileSvg(t, 0, 0, s, t.t.length > 1 ? 1 : 0) + '</svg>'; }
function mkTok(a) { return '<svg viewBox="-12 -12 24 24" aria-hidden="true">' + tokenSvg(a, 0, 0, 11) + '</svg>'; }
function tileName(t) { return t.t.map(function (x) { return WM.TER_NAME[x]; }).join(' and ') + ' tile' + (t.key ? ' (keystone)' : '') + ', accepts ' + t.a.map(function (a) { return WM.ANI_NAME[a]; }).join(', '); }
function renderDock() {
  var mk = $('#mk'), mine = myTurn() && G.stage === 'pick', s = G.seats[G.cur], h = '';
  for (var i = 0; i < 4; i++) {
    var t = G.market.tiles[i], k = G.market.toks[i], fr = UI.free, sel = fr && (fr.ti === i), selk = fr && fr.ki === i, w = UI.wipe && UI.wipe.indexOf(i) >= 0;
    h += '<div class="pair' + (mine && !UI.free && !UI.wipe ? ' live' : '') + '" data-i="' + i + '">';
    h += t ? '<button type="button" class="mt' + (sel ? ' sel' : '') + '" data-i="' + i + '" aria-label="' + esc(tileName(t)) + '"' + (mine && !UI.wipe ? '' : ' disabled') + '>' + mkTile(t, 30) + '</button>' : '<span class="mt gone"></span>';
    h += k ? '<button type="button" class="mk' + (selk ? ' sel' : '') + (w ? ' wsel' : '') + '" data-i="' + i + '" aria-label="' + esc(WM.ANI_NAME[k]) + ' token"' + (mine ? '' : ' disabled') + '>' + mkTok(k) + '</button>' : '<span class="mk gone"></span>';
    h += '</div>';
  }
  mk.innerHTML = h;
  // actions
  var a = '', me = G.seats[G.cur];
  if (myTurn()) {
    if (G.stage === 'pick') {
      if (UI.wipe) a += '<button type="button" class="ab pri" id="wokB"' + (UI.wipe.length ? '' : ' disabled') + '>Replace ' + UI.wipe.length + '</button><button type="button" class="ab" id="cancelB">Cancel</button>';
      else if (UI.free) a += '<span class="hint1">Any tile, then any token</span><button type="button" class="ab" id="cancelB">Cancel</button>';
      else {
        if (!G.used3 && !G.opts.no3 && WM.triple(G)) a += '<button type="button" class="ab" id="w3B">Sweep 3 ' + esc(WM.ANI_NAME[WM.triple(G)]) + '</button>';
        if (me.acorns > 0) a += '<button type="button" class="ab" id="freeB">Acorn: free pick</button><button type="button" class="ab" id="wipeB">Acorn: replace</button>';
      }
    } else if (G.stage === 'tile') {
      a += '<span class="held">' + mkTile(G.hold.tile, 24) + mkTok(G.hold.tok) + '</span>';
      if (UI.ghost) { if (G.hold.tile.t.length > 1) a += '<button type="button" class="ab" id="rotB" aria-label="Turn the tile">&#8635; Turn</button>'; a += '<button type="button" class="ab pri" id="okB">Place</button>'; }
      if (UI.undo) a += '<button type="button" class="ab" id="undoB">Back</button>';
    } else if (G.stage === 'tok') {
      a += '<span class="held">' + mkTok(G.hold.tok) + '</span><button type="button" class="ab" id="backB">Return token</button>';
    }
  }
  $('#acts').innerHTML = a;
  $('#acorn').innerHTML = '<span class="acn" title="Acorns">' + mkTok('acorn') + '<b>' + G.seats[UI.view].acorns + '</b></span>';
}
function lineText() {
  if (!G) return '';
  if (G.over) return 'Season over';
  var s = G.seats[G.cur];
  if (UI.view !== G.cur && !s.ai) return '';
  if (UI.view !== meSeat() && !myTurn()) return 'Viewing ' + G.seats[UI.view].name + '. Tap You to return';
  if (s.ai) return s.name + ' is choosing';
  if (G.stage === 'pick') return UI.wipe ? 'Tap tokens to replace' : UI.free ? (UI.free.ti == null ? 'Pick any tile' : 'Now pick any token') : 'Pick a tile and token pair';
  if (G.stage === 'tile') return UI.ghost ? 'Turn it, then tap Place' : 'Tap a glowing spot';
  if (G.stage === 'tok') return WM.tokSpots(s.env, G.hold.tok).length ? 'Place the ' + WM.ANI_NAME[G.hold.tok] + ' on a glowing tile' : 'No room: return the token';
  return '';
}
function renderTop() {
  var me = G.seats[UI.view], sc = WM.score(me.env, me.acorns), h = '';
  WM.ANI.forEach(function (a) { h += '<button type="button" class="cc" data-card="' + a + '" aria-label="' + esc(WM.CARDS[a].title) + ' card, ' + sc.ani[a] + ' points">' + mkTok(a) + '<b>' + sc.ani[a] + '</b></button>'; });
  $('#cards').innerHTML = h;
  var sh = '';
  if (G.np > 1) G.seats.forEach(function (s, i) { var t = WM.score(s.env, s.acorns).total; sh += '<button type="button" class="seat' + (i === UI.view ? ' on' : '') + (i === G.cur ? ' cur' : '') + '" data-seat="' + i + '">' + esc(s.name) + ' <b>' + t + '</b></button>'; });
  $('#seats').innerHTML = sh; $('#seats').hidden = G.np < 2;
  var turn = Math.min(G.turns, G.seats[G.cur].done + 1);
  $('#barstat').innerHTML = '<span class="pill">Turn <b>' + turn + '/' + G.turns + '</b></span><span class="pill">Score <b>' + sc.total + '</b></span>';
  $('#line').textContent = lineText();
}
function render() {
  if (!G) return;
  renderDock(); renderTop(); drawMap();
  if (window.GXH && GXH.phase) try { GXH.phase(myTurn() ? (G.stage === 'pick' && G.seats[G.cur].acorns > 0 && !UI.prefs.seenAcorn ? 'acorn' : G.stage) : null); } catch (e) { }
  artApply();
}
UI.redraw = function () { if (G) render(); };
// ---------------------------------------------------------------- drawers: scores, rules, cards
function scoresHTML() {
  var sc = G.over ? G.res : WM.final(G), h = '<table class="st"><tr><th></th>' + G.seats.map(function (s) { return '<th>' + esc(s.name) + '</th>'; }).join('') + '</tr>';
  WM.ANI.forEach(function (a) { h += '<tr><td>' + mkTok(a) + ' ' + esc(WM.CARDS[a].title) + '</td>' + sc.map(function (x) { return '<td>' + x.ani[a] + '</td>'; }).join('') + '</tr>'; });
  WM.TER.forEach(function (t) { h += '<tr><td><i class="sw" style="background:' + WM.TER_COL[t] + '"></i> ' + WM.TER_NAME[t] + '</td>' + sc.map(function (x) { return '<td>' + x.hab[t] + (x.bonus[t] ? ' <small>+' + x.bonus[t] + '</small>' : '') + '</td>'; }).join('') + '</tr>'; });
  h += '<tr><td>Acorns</td>' + sc.map(function (x) { return '<td>' + x.acorns + '</td>'; }).join('') + '</tr>';
  h += '<tr class="tot"><td>Total</td>' + sc.map(function (x) { return '<td>' + x.total + '</td>'; }).join('') + '</tr></table>';
  return h + '<p class="note">' + (G.solo ? 'Solo: a habitat of 7 or more tiles earns 2 extra points.' : 'The largest habitat of each terrain earns a bonus (shown +).') + '</p>';
}
function cardsHTML() {
  var h = '<div class="cards">';
  WM.ANI.forEach(function (a) { var C = WM.CARDS[a]; h += '<div class="card"><div class="cart" data-art="card-' + a + '-a">' + mkTok(a) + '</div><div><h3>' + esc(C.title) + '</h3><p>' + esc(C.rule) + '</p><p class="pts">' + (C.pts ? C.pts.slice(1).map(function (p, i) { return (i + 1) + (i + 2 === C.pts.length ? '+' : '') + ': ' + p; }).join(' &middot; ') : '0 to 5 per fox') + '</p></div></div>'; });
  return h + '</div>';
}
var RULES_HTML = '<h3>Goal</h3><p>Over 20 turns, grow a valley of habitat tiles and settle animals on them. Most points wins.</p>' +
  '<h3>Your turn</h3><ol><li>Take one tile and the token under it from the market.</li><li>Place the tile next to your valley. Turn split tiles as you like.</li><li>Place the token on any empty tile that shows that animal, or return it.</li></ol>' +
  '<h3>Keystones and acorns</h3><p>Keystone tiles (gold rim) have one terrain. An animal on a keystone earns an acorn. Spend an acorn to take any tile with any token, or to replace any tokens in the market. Each acorn left is 1 point at the end.</p>' +
  '<h3>Crowded market</h3><p>Four matching tokens are replaced at once. With three matching tokens you may replace those three once per turn, for free.</p>' +
  '<h3>Scoring</h3><p>Each animal scores by its card (below). Each terrain scores 1 point per tile in your largest connected habitat of it (edges must match). The largest habitat of each terrain earns a bonus: 2 players 2 (tie 1), 3-4 players 3 for first and 1 for second. Solo: 2 for a habitat of 7+.</p>' +
  '<h3>Solo</h3><p>After each turn the rightmost tile and token left in the market are removed.</p>' +
  '<h3>Ties</h3><p>Most acorns left wins a tie.</p>';
// ---------------------------------------------------------------- large view: tap a placed tile (when it is not a target) or hold a market tile/token
function tileText(t, tok) {
  var h = '<p><b>' + t.t.map(function (x) { return WM.TER_NAME[x]; }).join(' and ') + '</b> tile' + (t.key ? ', a <b>keystone</b>: an animal placed here earns an acorn.' : (t.t.length > 1 ? '. Each half counts for its own terrain; edges must match to join a habitat.' : '.')) + '</p>';
  h += '<p>Accepts: ' + t.a.map(function (a) { return WM.ANI_NAME[a]; }).join(', ') + '.</p>';
  if (tok) h += '<p>Home to a <b>' + WM.ANI_NAME[tok] + '</b> (' + esc(WM.CARDS[tok].title) + ': ' + esc(WM.CARDS[tok].rule) + ')</p>';
  return h;
}
function showBig(kind, obj, tok) {
  var body = document.createElement('div'); body.className = 'bigv';
  if (kind === 'tile') body.innerHTML = '<div class="bigpic">' + mkTile(obj, 60) + '</div>' + tileText(obj, tok);
  else { var C = WM.CARDS[obj]; body.innerHTML = '<div class="bigpic">' + mkTok(obj) + '</div><h3>' + esc(WM.ANI_NAME[obj]) + ' token</h3><p>Scores by <b>' + esc(C.title) + '</b>: ' + esc(C.rule) + '</p><p class="pts">' + (C.pts ? C.pts.slice(1).map(function (p, i) { return (i + 1) + (i + 2 === C.pts.length ? '+' : '') + ': ' + p; }).join(' &middot; ') : '0 to 5 per fox') + '</p>'; }
  GX.drawer('bigd', kind === 'tile' ? 'Habitat tile' : 'Animal token', body, false); GX.show('bigd');
}
(function wireHold() {
  var t = null, held = false;
  document.addEventListener('pointerdown', function (e) { var b = e.target.closest && e.target.closest('#mk .mt, #mk .mk'); if (!b || !G) return; held = false; clearTimeout(t);
    t = setTimeout(function () { var i = +b.dataset.i; held = true; if (b.classList.contains('mt')) { if (G.market.tiles[i]) showBig('tile', G.market.tiles[i]); } else if (G.market.toks[i]) showBig('tok', G.market.toks[i]); }, 520); });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (ev) { document.addEventListener(ev, function () { clearTimeout(t); }, true); });
  document.addEventListener('click', function (e) { if (held && e.target.closest && e.target.closest('#mk')) { held = false; e.stopImmediatePropagation(); e.preventDefault(); } }, true);
  document.addEventListener('contextmenu', function (e) { if (e.target.closest && e.target.closest('#mk')) e.preventDefault(); });
})();
// ---------------------------------------------------------------- result
function showResult() {
  if (!G || !G.over || UI.resultShown === G.seed + ':' + G.logN) return; UI.resultShown = G.seed + ':' + G.logN;
  sfx('end'); save(); musicSync(); $('#toast').classList.remove('on');
  var sc = G.res, me = 0, title;
  if (G.solo) { var best = UI.prefs.best || 0; title = 'You scored ' + sc[0].total + (UI.mode === 'quick' && sc[0].total > best ? ': new best!' : best ? ' (best ' + best + ')' : ''); if (UI.mode === 'quick' && sc[0].total > best) { UI.prefs.best = sc[0].total; savePrefs(); } } else if (G.winner === -2) title = 'A shared win'; else title = (G.winner === me && UI.humans === 1 ? 'You win!' : G.seats[G.winner].name + ' wins!');
  var rs = $('#rs'); rs.hidden = false;
  var camp = UI.mode === 'camp' && window.GXC && GXC.active();
  rs.innerHTML = '<div class="rbox" data-art="' + (G.winner === 0 || G.solo ? 'result-win' : 'result-lose') + '"><h2 class="rbig">' + esc(title) + '</h2>' + scoresHTML() + '<div class="rbtn">' + (camp ? '<button type="button" class="big" id="campCont">Continue</button>' : '<button type="button" class="big" id="againB">Play again</button><button type="button" class="ab" id="titleB">Title</button>') + '</div></div>';
  try { if (!camp && window.GNS && GNS.result) GNS.result({ game: 'wildmark', mode: UI.mode === 'tutorial' ? 'tutorial' : G.solo ? 'solo' : 'vs', seats: G.seats.map(function (s, i) { return { name: s.name, me: i === 0, ai: s.ai || undefined }; }), winner: G.winner, scores: sc.map(function (x) { return x.total; }), turns: G.turns }); } catch (e) { }
}
// ---------------------------------------------------------------- title + setup
function showTitle() {
  clearTimeout(UI.aiT); UI.mode = 'quick'; UI.camp = null; try { GX.close(); } catch (e) { } $('#rs').hidden = true; $('#pass').hidden = true;
  var st = $('#start'), sv = loadSave(), c = UI.setup || (UI.setup = { opp: 1, ai: 'normal', humans: 1 });
  st.hidden = false;
  if (UI.sv === 'setup') {
    var seg = function (id, list, cur) { return '<div class="seg" data-k="' + id + '">' + list.map(function (o) { return '<button type="button" class="sg' + (o[0] === cur ? ' on' : '') + '" data-v="' + o[0] + '">' + o[1] + '</button>'; }).join('') + '</div>'; };
    st.innerHTML = '<div class="tbox"><h1 class="logo">Wildmark</h1><div class="lbl">Rival rangers</div>' + seg('opp', [[0, 'Solo'], [1, '1'], [2, '2'], [3, '3']], c.opp) +
      '<div class="lbl">Rival skill</div>' + seg('ai', [['easy', 'Easy'], ['normal', 'Normal'], ['hard', 'Hard']], c.ai) +
      '<div class="lbl">Players on this device</div>' + seg('humans', [[1, '1'], [2, '2'], [3, '3'], [4, '4']], c.humans) +
      '<p class="sum">' + esc(setupSum(c)) + '</p><button type="button" class="big" id="goB">Start</button><button type="button" class="ab" id="backT">Back</button></div>';
    return;
  }
  var p = window.GXC ? GXC.progress() : null, n = p && window.CAMPAIGN ? CAMPAIGN.chapters.filter(function (x) { return p.ch[x.id] && p.ch[x.id].beaten; }).length : 0;
  st.innerHTML = '<div class="tbox"><div class="crest" aria-hidden="true">' + mkTok('elk') + mkTok('fox') + mkTok('salmon') + '</div><h1 class="logo">Wildmark</h1><p class="tag">Grow a wild valley. Settle its animals.</p>' +
    '<button type="button" class="big" id="storyB">Story<small>' + (n ? n + ' of ' + CAMPAIGN.chapters.length + ' regions restored' : 'Restore three wild regions') + '</small></button>' +
    (sv ? '<button type="button" class="ab wide" id="resumeB">Resume game</button>' : '') +
    '<button type="button" class="ab wide" id="quickB">Quick game</button>' +
    (window.GXT ? GXT.menuHTML({ game: 'wildmark', first: !UI.prefs.played, cls: 'ab wide', launch: function () { tutStart(); } }) : '') +
    '<button type="button" class="ab wide" id="howB">How to play</button></div>';
}
function setupSum(c) { return c.opp === 0 && c.humans === 1 ? 'Solo: 20 turns, beat your best score.' : (c.humans > 1 ? c.humans + ' players on this device' : 'You') + (c.opp ? ' vs ' + c.opp + ' ' + c.ai + ' rival' + (c.opp > 1 ? 's' : '') : '') + ', 20 turns each.'; }
// ---------------------------------------------------------------- events
document.addEventListener('click', function (e) {
  var t = e.target.closest && e.target.closest('button'); if (!t) return;
  var id = t.id;
  if (t.classList.contains('mt')) return onMarket('t', +t.dataset.i);
  if (t.classList.contains('mk')) return onMarket('k', +t.dataset.i);
  if (t.classList.contains('sg')) { var k = t.parentNode.dataset.k, v = t.dataset.v; UI.setup[k] = k === 'ai' ? v : +v; if (UI.setup.humans + UI.setup.opp > 4) UI.setup.opp = 4 - UI.setup.humans; if (UI.setup.humans + UI.setup.opp < 1) UI.setup.opp = 0; showTitle(); return; }
  if (t.classList.contains('cc')) { openCards(); return; }
  if (t.classList.contains('seat')) { UI.view = +t.dataset.seat; render(); fitView(); return; }
  switch (id) {
    case 'storyB': storyOpen(); break;
    case 'quickB': UI.sv = 'setup'; showTitle(); break;
    case 'backT': UI.sv = 'title'; showTitle(); break;
    case 'howB': openRules(); break;
    case 'resumeB': resume(); break;
    case 'goB': UI.sv = 'title'; UI.mode = 'quick'; UI.prefs.played = 1; savePrefs(); var c = UI.setup; newGame({ np: c.humans + c.opp, humans: c.humans, ai: c.ai }); break;
    case 'againB': if (UI.mode === 'quick' && UI.cfg) newGame(Object.assign({}, UI.cfg, { seed: null })); else showTitle(); break;
    case 'titleB': UI.sv = 'title'; showTitle(); break;
    case 'campCont': $('#rs').hidden = true; try { GXC.finish(G); } catch (er) { console.error(er); } break;
    case 'passB': $('#pass').hidden = true; UI.passed = G.cur; UI.view = G.cur; fitView(true); step(); break;
    case 'w3B': if (!tutOK({ what: 'w3' })) break; WM.apply(G, { t: 'wipe3' }); sfx('wipe'); toast('Three tokens swept away.'); render(); break;
    case 'freeB': if (!tutOK({ what: 'freeB' })) break; UI.free = { ti: null, ki: null }; UI.prefs.seenAcorn = 1; savePrefs(); render(); break;
    case 'wipeB': if (!tutOK({ what: 'wipeB' })) break; UI.wipe = []; UI.prefs.seenAcorn = 1; savePrefs(); render(); break;
    case 'wokB': if (!UI.wipe || !UI.wipe.length || !tutOK({ what: 'wok' })) break; WM.apply(G, { t: 'wipe', idx: UI.wipe.slice() }); UI.wipe = null; sfx('wipe'); render(); break;
    case 'cancelB': UI.free = null; UI.wipe = null; render(); break;
    case 'rotB': rotate(); break;
    case 'okB': confirmPlace(); break;
    case 'undoB': undoTake(); break;
    case 'backB': if (!tutOK({ what: 'back' })) break; act({ t: 'back' }); break;
    case 'fitB': fitView(); break;
    case 'zinB': var wh = boardWH(); zoomAt(1.25, wh[0] / 2, wh[1] / 2); break;
    case 'zoutB': var wh2 = boardWH(); zoomAt(0.8, wh2[0] / 2, wh2[1] / 2); break;
  }
});
document.addEventListener('keydown', function (e) { if (!G || !myTurn()) return; if (e.key === 'r' || e.key === 'R') rotate(); if (e.key === 'Enter' && UI.ghost) confirmPlace(); });
function openCards() { GX.drawer('cardsd', 'Scoring cards', null, false); $('#cardsd .gx-drawer-body').innerHTML = cardsHTML(); artApply($('#cardsd')); GX.show('cardsd'); }
function openRules() { var b = $('#rulesd .gx-drawer-body'); b.innerHTML = RULES_HTML + '<h3>The animal cards</h3>' + cardsHTML(); artApply(b); GX.show('rulesd'); }
// ---------------------------------------------------------------- music (silent until files exist)
function musicSync() { try { if (window.GXMUS) GXMUS.sync(); } catch (e) { } }
// ---------------------------------------------------------------- boot
function boot() {
  GX.init({ key: 'wm' });
  var sb = document.createElement('div'); sb.id = 'scoresb'; GX.drawer('scored', 'Scores', sb, true);
  var rb = document.createElement('div'); GX.drawer('rulesd', 'How to play', rb, false);
  GX.onShow = function (id) { if (id === 'scored') $('#scoresb').innerHTML = G ? scoresHTML() : '<p>No game yet.</p>'; if (id === 'rulesd' && !$('#rulesd .gx-drawer-body').innerHTML.trim()) openRules(); };
  try {
    GX.settings({ id: 'setd', title: 'Menu',
      game: function (S) { var a = document.createElement('button'); a.type = 'button'; a.className = 'gx-sb'; a.textContent = 'Title screen'; a.onclick = function () { GX.close(); UI.sv = 'title'; showTitle(); }; var b2 = document.createElement('button'); b2.type = 'button'; b2.className = 'gx-sb'; b2.textContent = 'New game'; b2.onclick = function () { GX.close(); UI.sv = 'setup'; showTitle(); }; var rs = document.createElement('button'); rs.type = 'button'; rs.className = 'gx-sb'; rs.textContent = 'Restart'; rs.onclick = function () { GX.close(); if (UI.mode === 'camp' && UI.camp) campStart(UI.camp); else if (UI.cfg && UI.mode === 'quick') newGame(Object.assign({}, UI.cfg, { seed: null })); else { UI.sv = 'setup'; showTitle(); } }; S.appendChild(GX.row('This game', [rs, b2, a])); },
      sound: function (S) { S.appendChild(GX.row('Sound effects', GX.onoff(!UI.prefs.mute, function (v) { UI.prefs.mute = !v; savePrefs(); }))); if (window.GXMUS) { var m = document.createElement('button'); m.type = 'button'; m.className = 'gx-sb'; m.textContent = 'Music'; m.onclick = function () { GXMUS.open(); }; S.appendChild(GX.row('Music', [m])); } },
      help: function (S) { var r = document.createElement('button'); r.type = 'button'; r.className = 'gx-sb'; r.textContent = 'Rules'; r.onclick = function () { GX.close(); setTimeout(openRules, 50); }; var tu = document.createElement('button'); tu.type = 'button'; tu.className = 'gx-sb'; tu.textContent = 'Tutorial'; tu.onclick = function () { GX.close(); tutStart(); }; S.appendChild(GX.row('Read', [r, tu])); },
      about: { name: 'Wildmark', version: '1.0', text: 'Original names, rules text and art.' } });
    AIDELAY = GX.aiDelay ? GX.aiDelay(650) : 650; if (GX.onPref) GX.onPref(function (k) { if (k === 'ai') AIDELAY = GX.aiDelay(650); });
  } catch (e) { console.error(e); }
  try { if (window.GA) { var mus = {}; (window.WM_MUSIC || []).forEach(function (n) { mus[n] = 'url:music/' + n + '.mp3'; }); GA.init({ sfx: {}, music: mus, key: 'wm' }); if (GX.applyPrefs) GX.applyPrefs(); }
    if (window.GXMUS) GXMUS.init({ key: 'wm', slots: [['menu', 'Title'], ['main', 'Game'], ['victory', 'Victory'], ['defeat', 'Defeat']], loops: ['menu', 'main'], slot: function () { return !G || !$('#start').hidden ? ['menu', 0] : G.over ? [G.winner === 0 || G.solo ? 'victory' : 'defeat', 1] : ['main', 0]; }, on: function () { return !UI.prefs.mute && (window.WM_MUSIC || []).length > 0; } }); } catch (e) { }
  if (typeof helpInit === 'function') helpInit();
  if (typeof campInit === 'function') campInit();
  GX.onResize(function () { if (G) fitView(true); });
  artLoad();
  var q = new URLSearchParams(location.search); if (q.get('fast')) { UI.fast = true; AIDELAY = 30; ANIM = false; }
  if (q.get('scn')) return;
  UI.sv = 'title'; showTitle();
  if (!UI.prefs.played && !UI.prefs.offered && window.GXT && !GXT.isDone('wildmark')) { UI.prefs.offered = 1; savePrefs(); }
}
window.addEventListener('DOMContentLoaded', boot);
window.render_game_to_text = function () { return G ? WM.text(G) : 'title'; };
window.UI = UI;
