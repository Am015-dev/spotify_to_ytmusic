// ui1: helpers, state, ink-and-gold drawing (tiles, dice, icons), rendering of score, stalls, estate and tray
function $(s, r) { return (r || document).querySelector(s); }
function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
var G = null;
var UI = { mode: 'vs', lvl: 'easy', human: [true, false], view: 0, sel: null, stoSel: -1, disc: null, busy: false, started: false, R: 28, tut: false, peek: false };
window.ANIM = true; window.AIDELAY = 650;
var COLHEX = { K: '#3e6b48', F: '#8fae54', L: '#e2b843', B: '#3d6aa8', T: '#d8bd88', Q: '#8a8680' };
var COLINK = { K: '#f3e6c4', F: '#24320e', L: '#3a2606', B: '#f3e6c4', T: '#2b1d10', Q: '#f3e6c4' };
var COLNAME = { K: 'Keep', F: 'Pasture', L: 'Lore', B: 'Barge', T: 'Town', Q: 'Quarry' };
function nameOf(s) { return s === 0 ? 'You' : (UI.mode === 'hot' ? 'Player 2' : 'Rival'); }
function isHuman(s) { return UI.human[s]; }
function T(id) { return VS.TILES[id]; }
function P(s) { return G.p[s]; }
function later(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
function ams(ms) { if (!window.ANIM) return 0; try { return GX.animMs(ms); } catch (e) { return ms; } }
// ---------- drawing
function hexPts(cx, cy, R) { var p = []; for (var k = 0; k < 6; k++) { var a = Math.PI / 180 * (60 * k - 90); p.push((cx + R * Math.cos(a)).toFixed(1) + ',' + (cy + R * Math.sin(a)).toFixed(1)); } return p.join(' '); }
function iconKey(t) { if (t.col === 'K') return 'castle'; if (t.col === 'B') return 'ship'; if (t.col === 'Q') return 'mine'; if (t.col === 'L') return 'lore'; return t.k; }
function iconG(key, x, y, sz, fill) { var d = ICONS[key]; if (!d) return ''; var sc = sz / 512; return '<path d="' + d + '" fill="' + fill + '" transform="translate(' + (x - sz / 2).toFixed(1) + ',' + (y - sz / 2).toFixed(1) + ') scale(' + sc.toFixed(4) + ')"/>'; }
function pipsG(n, x, y, s, fill) { // die face pips centred at x,y in a box of size s
  var o = s * 0.28, P0 = { 1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]], 5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]] }[n] || [];
  var r = s * 0.11; return P0.map(function (p) { return '<circle class="pip" cx="' + (x + p[0] * o).toFixed(1) + '" cy="' + (y + p[1] * o).toFixed(1) + '" r="' + r.toFixed(1) + '" fill="' + (fill || '#2b1d10') + '"/>'; }).join('');
}
function dieSVG(n, opt) { opt = opt || {}; return '<svg viewBox="0 0 40 40"><rect x="1" y="1" width="38" height="38" rx="7" fill="' + (opt.bg || '#fffdf5') + '" stroke="' + (opt.st || 'none') + '"/>' + pipsG(n, 20, 20, 40, opt.pip || '#2b1d10') + '</svg>'; }
// one tile as a little hex (stall, storage, reference)
function tileSVG(t, opt) {
  opt = opt || {};
  var R = 46, cx = 50, cy = 55, ink = COLINK[t.col];
  var s = '<svg viewBox="0 0 100 110"><polygon class="hx" points="' + hexPts(cx, cy, R) + '" fill="' + COLHEX[t.col] + '" stroke="' + (t.ink ? '#111' : '#2b1d10') + '" stroke-width="' + (t.ink ? 6 : 3) + '"/>';
  s += '<polygon points="' + hexPts(cx, cy, R - 7) + '" fill="none" stroke="' + ink + '" stroke-opacity=".35" stroke-width="1.5"/>';
  s += iconG(iconKey(t), cx, cy - (t.col === 'F' || t.col === 'L' ? 6 : 0), 54, ink);
  if (t.col === 'F') s += '<text x="50" y="92" text-anchor="middle" font-family="Alegreya Sans,sans-serif" font-weight="700" font-size="24" fill="' + ink + '">' + t.a + '</text>';
  if (t.col === 'L') s += '<text x="50" y="92" text-anchor="middle" font-family="Alegreya Sans,sans-serif" font-weight="700" font-size="20" fill="' + ink + '">' + t.a + '</text>';
  return s + '</svg>';
}
function goodsChip(d, big) { var g = VS.GOODS[d]; return '<svg viewBox="0 0 24 24" width="' + (big ? 24 : 13) + '" height="' + (big ? 24 : 13) + '"><rect x="1" y="1" width="22" height="22" rx="3" fill="' + g.c + '" stroke="#1a120a" stroke-width="1.5"/>' + pipsG(d, 12, 12, 22, '#fff8e8') + '</svg>'; }
function icon(key, col, sz) { return '<svg viewBox="0 0 512 512" width="' + (sz || 20) + '" height="' + (sz || 20) + '"><path d="' + ICONS[key] + '" fill="' + (col || 'currentColor') + '"/></svg>'; }
// ---------- layout
function layout() {
  var b = $('#board'); if (!b) return;
  var W = b.clientWidth - 8, H = b.clientHeight - 8, bd = $('#bd');
  var land = W > H * 1.25 && W < 1100;
  bd.classList.toggle('land', land);
  var stallW = land ? Math.min(W * 0.48, 420) : W;
  var unit = (stallW - 24) / 7.7, ts = Math.floor(Math.max(27, Math.min(unit - 6, 40, Math.max(27, ((land ? H : H) * (land ? 0.42 : 0.27) - 40) / 2.2))));
  document.documentElement.style.setProperty('--ts', ts + 'px');
  var ss = Math.max(30, Math.min(44, Math.floor(ts * 1.15)));
  document.documentElement.style.setProperty('--ss', ss + 'px');
  var u = Math.max(30, Math.min(44, Math.floor((stallW - 24) / 8.1)));
  document.documentElement.style.setProperty('--u', u + 'px');
  UI.land = land;
  if (land && !$('#lcol')) { var lc = document.createElement('div'); lc.id = 'lcol'; bd.insertBefore(lc, $('#estwrap')); lc.appendChild($('#stalls')); lc.appendChild($('#tray')); }
  if (!land && $('#lcol')) { var l = $('#lcol'); bd.insertBefore($('#stalls'), l); bd.insertBefore($('#tray'), l.nextSibling); l.remove(); bd.appendChild($('#tray')); }
  if (land) $('#lcol').style.width = stallW + 'px';
}
// ---------- score line (top bar)
function renderScore() {
  var cur = G.over ? -1 : VSE.side(G);
  $('#score').innerHTML = '<span class="ch" title="Chapter and round">' + VS.CHAPTERS[G.ph] + '·' + (G.rd + 1) + '/5</span>' +
    [0, 1].map(function (s) { return '<span class="sc ' + (s === 0 ? 'me' : 'op') + (s === cur ? ' now' : '') + '"><i></i><span data-engine="G.p.' + s + '.vp">' + P(s).vp + '</span> <small>' + (s === 0 ? 'You' : nameOf(1)) + '</small></span>'; }).join('');
}
// ---------- stalls
function renderStalls(tg) {
  var html = '';
  for (var n = 1; n <= 6; n++) {
    var st = G.st[n];
    html += '<div class="stall" data-st="' + n + '"><div class="sh" title="Stall ' + n + '">' + dieSVG(n, { bg: '#fffdf5', st: '#2b1d10' }) + '</div><div class="tl">';
    st.t.forEach(function (id) { html += tileBtn(id, n, tg); });
    html += '</div><div class="gd' + (tg && tg.ship[n] ? ' gtgt' : '') + '" data-ship="' + n + '">' + st.g.map(function (d) { return '<span class="gchip" style="background:' + VS.GOODS[d].c + '" title="' + VS.GOODS[d].n + '"></span>'; }).join('') + '</div></div>';
  }
  html += '<div class="stall blk" data-st="0"><div class="sh"><b>Ink</b></div><div class="tl">' + G.blk.map(function (id) { return tileBtn(id, 0, tg); }).join('') + '</div><div class="gd"></div></div>';
  $('#stalls').innerHTML = html;
}
function tileBtn(id, st, tg) {
  var t = T(id), m = tg && tg.tile[id], cls = 'tile' + (m ? ' tgt' : '') + (UI.sel && UI.sel.kind === 'tile' && UI.sel.key === id ? ' sel' : '');
  var wb = m ? minW(m) : 0;
  return '<button class="' + cls + '" data-tile="' + id + '" data-st="' + st + '" aria-label="' + VS.tileName(t) + '">' + tileSVG(t) + (wb ? '<span class="wb">' + wb + '</span>' : '') + '</button>';
}
function minW(ms) { var w = 99; ms.forEach(function (m) { w = Math.min(w, m.w || 0); }); return w === 99 ? 0 : w; }
// ---------- estate (SVG hex map)
function hexXY(hx, R) { var w = Math.sqrt(3) * R; return { x: (hx.x + 0.5) * w + 2, y: R + hx.r * 1.5 * R + 2 }; }
function renderEstate(tg) {
  var R = UI.R, s = UI.view, Pl = P(s), w = Math.sqrt(3) * R, W = 7 * w + 4, H = 11 * R + 4;
  var out = '<svg id="esvg" width="' + W.toFixed(0) + '" height="' + H.toFixed(0) + '" viewBox="0 0 ' + W.toFixed(1) + ' ' + H.toFixed(1) + '"><defs>' +
    '<linearGradient id="goldleaf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff2b0"/><stop offset=".45" stop-color="#e2b13c"/><stop offset=".7" stop-color="#fbe48e"/><stop offset="1" stop-color="#9a6a14"/></linearGradient>' +
    '<filter id="glow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>';
  VS.HEX.forEach(function (hx) {
    var c = hexXY(hx, R), id = Pl.est[hx.i], t = id != null ? T(id) : null, m = s === UI.view && tg && tg.hex[hx.i];
    var cls = 'hcell' + (t ? ' full' : ' empty') + (m ? ' tgt' : '') + (UI.sel && UI.sel.kind === 'hex' && UI.sel.key === hx.i ? ' tgtsel' : '');
    out += '<g class="' + cls + '" data-h="' + hx.i + '">';
    if (t) {
      out += '<polygon class="hx" points="' + hexPts(c.x, c.y, R - 0.5) + '" fill="' + COLHEX[t.col] + '"/>';
      out += '<polygon points="' + hexPts(c.x, c.y, R * 0.84) + '" fill="none" stroke="#f6dc84" stroke-width="' + Math.max(1, R * 0.06).toFixed(1) + '"/>';
      out += iconG(iconKey(t), c.x, c.y - (t.col === 'F' ? R * 0.12 : 0), R * 1.05, COLINK[t.col]);
      if (t.col === 'F') out += '<text x="' + c.x.toFixed(1) + '" y="' + (c.y + R * 0.68).toFixed(1) + '" text-anchor="middle" font-weight="700" font-size="' + (R * 0.42).toFixed(1) + '" fill="' + COLINK[t.col] + '">' + t.a + '</text>';
    } else {
      out += '<polygon class="hx" points="' + hexPts(c.x, c.y, R - 0.5) + '" fill="' + COLHEX[VSE.colAt(Pl, hx.i)] + '" fill-opacity=".38"/>';
      out += pipsG(hx.d, c.x, c.y, R * 0.95, '#2b1d10');
    }
    if (m) { var wb = minW(m); if (wb) out += '<circle cx="' + (c.x + R * 0.55).toFixed(1) + '" cy="' + (c.y - R * 0.55).toFixed(1) + '" r="' + (R * 0.28).toFixed(1) + '" fill="#b3261e"/><text x="' + (c.x + R * 0.55).toFixed(1) + '" y="' + (c.y - R * 0.45).toFixed(1) + '" text-anchor="middle" font-weight="700" font-size="' + (R * 0.34).toFixed(1) + '" fill="#fff">' + wb + '</text>'; }
    out += '</g>';
  });
  // gold-leaf overlays for gilding a completed region
  VS.HEX.forEach(function (hx) { var c = hexXY(hx, R); out += '<polygon class="gild" data-gh="' + hx.i + '" points="' + hexPts(c.x, c.y, R - 1) + '"/>'; });
  // region borders: thick ink between different regions
  var dirs = [[0, -0.5, -1, 5, 0], [0, 0.5, -1, 0, 1], [0, 1, 0, 1, 2], [0, 0.5, 1, 2, 3], [0, -0.5, 1, 3, 4], [0, -1, 0, 4, 5]];
  var path = '', ro = VSE.board(Pl).regOf;
  VS.HEX.forEach(function (hx) {
    var c = hexXY(hx, R);
    dirs.forEach(function (d) {
      var nb = VS.HEX.filter(function (o) { return o.r === hx.r + d[2] && o.x === hx.x + d[1]; })[0];
      if (nb && ro[nb.i] === ro[hx.i]) return;
      if (nb && nb.i < hx.i) return;
      var a1 = Math.PI / 180 * (60 * d[3] - 90), a2 = Math.PI / 180 * (60 * d[4] - 90);
      path += 'M' + (c.x + R * Math.cos(a1)).toFixed(1) + ' ' + (c.y + R * Math.sin(a1)).toFixed(1) + 'L' + (c.x + R * Math.cos(a2)).toFixed(1) + ' ' + (c.y + R * Math.sin(a2)).toFixed(1);
    });
  });
  out += '<path class="reg" d="' + path + '" stroke-width="' + Math.max(2, R * 0.11).toFixed(1) + '"/>';
  out += '</svg>';
  $('#estate').innerHTML = out;
  if (UI.zoomed) $('#esttabs').innerHTML = '<button class="etab back" data-a="unzoom" aria-label="Show the stalls">&#9650; Stalls</button>';
  else $('#esttabs').innerHTML = UI.view === 0 ? '<button class="etab op" data-view="1" aria-label="See the ' + nameOf(1) + '\u2019s estate"><i style="background:var(--opp)"></i>' + nameOf(1) + ' \u25b8</button>' :
    '<button class="etab on" data-view="0" aria-label="Back to your estate">\u25c2 <i style="background:var(--me)"></i>You</button>';
  var seals = Pl.seals.length ? Pl.seals.length + ' seal' + (Pl.seals.length > 1 ? 's' : '') : '';
  var est = $('#estseal'); if (!est) { est = document.createElement('div'); est.id = 'estseal'; $('#estwrap').appendChild(est); }
  est.textContent = (Pl.board > 1 ? 'Board ' + Pl.board : '') + (seals ? (Pl.board > 1 ? ' \u00b7 ' : '') + seals : '');
}
// ---------- tray: dice, workers, silver, storage, goods (always the seat being viewed, which is you unless you peek)
function renderTray(tg) {
  var s = UI.view, Pl = P(s), me = s === VSE.side(G) && isHuman(s), html = '';
  html += '<div class="grp" id="dice">' + [0, 1].map(function (i) {
    var used = Pl.used[i]; var tgt = tg && tg.die[i];
    return '<button class="die' + (used ? ' used' : '') + (UI.dieSel === i ? ' on' : (tgt ? ' tgt' : '')) + '" data-die="' + i + '" aria-label="Die ' + Pl.dice[i] + (used ? ' used' : '') + '">' + dieSVG(Pl.dice[i] || 1, { bg: s === 0 ? '#fffdf5' : '#fbe9e4' }) + '</button>';
  }).join('') + '</div>';
  html += '<div class="grp"><button class="wkb' + (tg && tg.work ? ' tgt' : '') + (tg && tg.stuck ? ' hot' : '') + '" data-work="1" aria-label="Workers ' + Pl.wk + '">' + icon('worker', '#2b1d10', 18) + '<span data-engine="G.p.' + s + '.wk">' + Pl.wk + '</span></button>' +
    '<button class="svb" data-silver="1" aria-label="Silver ' + Pl.silver + '">' + icon('coin', '#6b6f78', 18) + '<span data-engine="G.p.' + s + '.silver">' + Pl.silver + '</span></button></div>';
  var sto = [0, 1, 2].map(function (k) {
    var id = Pl.sto[k], c = (tg && (tg.sto[k] || (UI.disc && tg.disc[k]))) ? ' tgt' : '';
    if (id == null) return '<button class="sto" data-sto="' + k + '" aria-label="Empty storage"><svg viewBox="0 0 100 110"><polygon points="' + hexPts(50, 55, 44) + '" fill="rgba(90,65,38,.08)" stroke="#5a4126" stroke-width="3" stroke-dasharray="6 5"/></svg></button>';
    return '<button class="sto' + c + (UI.stoSel === k ? ' sel' : '') + '" data-sto="' + k + '" aria-label="Stored ' + VS.tileName(T(id)) + '">' + tileSVG(T(id)) + '</button>';
  }).join('');
  $('#stobox').innerHTML = sto;
  html += '<div class="grp" id="goods">' + [0, 1, 2].map(function (k) {
    var g = Pl.goods[k];
    if (!g) return '<span class="gstk empty"><span class="gbox"></span></span>';
    return '<button class="gstk' + (tg && tg.goods[g.d] ? ' tgt' : '') + '" data-goods="' + g.d + '" aria-label="' + g.n + ' ' + VS.GOODS[g.d].n + '"><span class="gbox" style="background:' + VS.GOODS[g.d].c + '">' + g.n + '</span><svg viewBox="0 0 24 24" width="16" height="16">' + pipsG(g.d, 12, 12, 22, '#2b1d10') + '</svg></button>';
  }).join('') + '</div>';
  $('#tray').innerHTML = html;
}
// ---------- targets: what the human can tap now, from the engine's legal moves
function targets() {
  var tg = { tile: {}, hex: {}, goods: {}, ship: {}, sto: {}, disc: {}, die: {}, work: null, skip: null, end: null, any: false };
  if (!G || G.over || UI.busy || !isHuman(VSE.side(G)) || UI.view !== VSE.side(G)) return tg;
  var ms = VSE.validMoves(G), s = VSE.side(G), Pl = P(s);
  if (UI.disc) { UI.disc.forEach(function (m) { tg.disc[m.disc] = (tg.disc[m.disc] || []).concat([m]); }); tg.any = true; return tg; }
  var push = function (o, k, m) { (o[k] = o[k] || []).push(m); };
  ms.forEach(function (m) {
    if (m.t === 'take' || m.t === 'buy' || m.t === 'grab') push(tg.tile, m.tile, m);
    else if (m.t === 'place') { if (UI.stoSel < 0 || UI.stoSel === m.s) push(tg.hex, m.h, m); push(tg.sto, m.s, m); }
    else if (m.t === 'sell') push(tg.goods, m.v, m);
    else if (m.t === 'start') push(tg.hex, m.h, m);
    else if (m.t === 'ship') push(tg.ship, m.st, m);
    else if (m.t === 'work') { tg.work = (tg.work || []).concat([m]); }
    else if (m.t === 'skip') tg.skip = m;
    else if (m.t === 'end') tg.end = m;
    if (m.die === 0 || m.die === 1) tg.die[m.die] = true;
  });
  tg.any = true;
  return tg;
}
function render() {
  if (!G) return;
  layout();
  var tg = targets(); UI.tg = tg;
  renderScore(); renderStalls(tg); renderTray(tg); renderDock(tg);
  var bd = $('#bd'), ew = $('#estwrap'), side = 47;
  var fitR = function () { return Math.max(12, Math.floor(Math.min((ew.clientHeight - 4) / 11, (ew.clientWidth - side - 6) / 12.124) * 10) / 10); };
  bd.classList.remove('ez'); UI.R0 = fitR();
  UI.small = Math.sqrt(3) * UI.R0 < 44;
  var hk = Object.keys(tg.hex).length, ok = Object.keys(tg.tile).length + Object.keys(tg.ship).length + Object.keys(tg.goods).length;
  UI.zoomed = !!(UI.small && tg.any && !UI.disc && (UI.ez || (hk && !ok && !UI.ezNo))); UI.offOk = ok > 0; // never hide glowing stall tiles behind the zoom unless a space glows too
  if (UI.zoomed) { bd.classList.add('ez'); UI.R = fitR(); } else UI.R = UI.R0;
  $('#estate').style.marginRight = side + 'px';
  renderEstate(tg);
  estBanner();
  try { GXH.phase(G.over ? null : (isHuman(VSE.side(G)) && !UI.busy ? (G.pend.length ? 'pend' : 'turn') : null)); } catch (e) { }
}

// a clear banner whenever the board shows the rival's estate (and a short one when it comes back to yours)
function estBanner() {
  var b = $('#estban'); if (!b) return;
  var v = UI.view, changed = UI.lastView !== v; UI.lastView = v;
  $('#estwrap').classList.toggle('opp', v !== 0);
  if (v !== 0) { UI.lastWasOpp = true; if (changed) { clearTimeout(UI.banT); b.textContent = nameOf(v) + '\u2019s estate'; b.className = ''; void b.offsetWidth; b.className = 'on'; UI.banT = setTimeout(function () { b.className = ''; }, 1500); } return; }
  if (changed && UI.lastWasOpp) { b.textContent = 'Your estate'; b.className = ''; void b.offsetWidth; b.className = 'on me'; clearTimeout(UI.banT); UI.banT = setTimeout(function () { b.className = ''; }, 1300); }
  else if (changed) b.className = '';
  UI.lastWasOpp = false;
}
