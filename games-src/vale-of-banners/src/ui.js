/* Vale of Banners page: board-first UI (market + your estate on the board, dice/storage/goods in the dock),
   title (Story / Quick game / How to play), tutorial (gx-tutor), Story (gx-campaign), help (gx-help), music slots (gx-music), synth sfx. */
var G = null;
var UI = { sel: null, die: null, busy: false, mode: 'quick', hints: true, mute: false, music: true, fast: false, view: 0, chain: 0, lastHuman: -1, aiT: 0, camp: false, over: false };
var $ = function (s, r) { return (r || document).querySelector(s); };
function h(tag, attrs, kids) {
  var p = tag.split('.'), e = document.createElement(p[0] || 'div'); if (p.length > 1) e.className = p.slice(1).join(' ');
  if (attrs) for (var k in attrs) { if (attrs[k] == null) continue; if (k === 'text') e.textContent = attrs[k]; else if (k === 'html') e.innerHTML = attrs[k]; else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), attrs[k]); else e.setAttribute(k, attrs[k]); }
  (kids || []).forEach(function (c) { if (c != null) e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
  return e;
}
try { UI.mute = localStorage.getItem('vob_mute') === '1'; UI.music = localStorage.getItem('vob_music') !== '0'; } catch (e) { }
var QS = new URLSearchParams(location.search); if (QS.get('fast') === '1') UI.fast = true;

/* ---------------- sound: tiny synth, mute-able ---------------- */
var SND = { ctx: null };
function sfx(kind) {
  if (UI.mute || UI.fast) return;
  try {
    if (!SND.ctx) SND.ctx = new (window.AudioContext || window.webkitAudioContext)();
    var c = SND.ctx, t = c.currentTime, seq = { take: [[520, .07]], place: [[330, .06], [494, .09]], score: [[523, .08], [659, .08], [784, .14]], dice: [[200, .04], [260, .04], [180, .05]], chain: [[587, .07], [740, .07], [880, .07], [1175, .16]], sell: [[700, .06], [940, .1]], end: [[392, .1]], bad: [[150, .15]] }[kind] || [[440, .05]];
    seq.forEach(function (n, i) {
      var o = c.createOscillator(), g = c.createGain(); o.type = kind === 'dice' ? 'square' : 'triangle'; o.frequency.value = n[0];
      var st = t + i * 0.07; g.gain.setValueAtTime(0.0001, st); g.gain.exponentialRampToValueAtTime(0.12 * (GX.pref ? GX.pref('sfx') * GX.pref('master') : 1) + 0.0001, st + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, st + n[1]);
      o.connect(g); g.connect(c.destination); o.start(st); o.stop(st + n[1] + 0.02);
    });
  } catch (e) { }
}
function musicSlot() { if (!G || $('#start') && !$('#start').hidden) return ['title', 0]; if (G.over) return [G.winner === UI.view ? 'victory' : 'defeat', 1]; return [G.phase >= G.nPhases - 1 ? 'finale' : 'main', 0]; }
function musicInit() {
  try {
    var m = {}; (window.VB_MUSIC || []).forEach(function (n) { m[n] = 'url:music/' + n + '.mp3'; });
    GA.init({ sfx: {}, music: m, key: 'vob' });
    GXMUS.init({ key: 'vob', slots: [['title', 'Title'], ['main', 'Game'], ['finale', 'Last season'], ['victory', 'Victory'], ['defeat', 'Defeat']], loops: ['title', 'main', 'finale'], slot: musicSlot, on: function () { return UI.music && !UI.mute && (window.VB_MUSIC || []).length > 0; } });
    if (GX.applyPrefs) GX.applyPrefs();
  } catch (e) { }
}
function musSync() { try { GXMUS.sync(); } catch (e) { } }

/* ---------------- helpers ---------------- */
var GLYPH = { castle: '🏰', mine: '⛏️', know: '📜', ship: '⛵', hall: '🏛️', carp: '🪚', chapel: '🔔', mkt: '🎪', inn: '🍺', mint: '🪙', tower: '🗼', store: '🌾', sheep: '🐑', goat: '🐐', pig: '🐖', goose: '🪿' };
var GCOL = ['', '#f7f4ec', '#f6dc92', '#f3c27e', '#f0b0a0', '#c7dbf2', '#e6e6e6'];
function glyph(t) { return t.t === 'bld' || t.t === 'pas' ? GLYPH[t.k] : GLYPH[t.t]; }
function hexEl(t, opt) {
  opt = opt || {}; var col = t ? VB.COLHEX[t.t] : (opt.col ? VB.COLHEX[opt.col] : '#ccc');
  var e = h('div.hx', { style: 'background-color:' + col + (opt.size ? ';--hex:' + opt.size + 'px' : '') });
  if (t) {
    var stem = VB.tileStem(t); e.setAttribute('data-art', stem);
    if (ART.img[stem]) { e.style.backgroundImage = 'url(media/' + stem + '.webp)'; e.classList.add('hasart'); }
    e.appendChild(h('span.gl', { 'data-g': glyph(t), 'aria-hidden': 'true' }));
    if (t.t === 'pas') e.appendChild(h('span.nn', { text: '×' + t.n }));
  }
  return e;
}
function toast(msg, ms) { var t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(function () { t.classList.remove('on'); }, ms || 1800); }
function me() { return G.P[UI.view]; }
function isHuman(s) { return G.seats[s] && G.seats[s].human; }
function myTurn() { return G && !G.over && isHuman(VB.actor(G)) && !UI.busy && !tvOpen(); }
function tvOpen() { return !$('#tv').hidden; }
function animMs(x) { if (UI.fast) return 0; try { return GX.animMs(x); } catch (e) { return x; } }
function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
function save() { try { if (G && !G.over && UI.mode === 'quick') localStorage.setItem('vob_save', JSON.stringify(G)); } catch (e) { } }
function hasSave() { try { return !!localStorage.getItem('vob_save'); } catch (e) { return false; } }
function pend() { return G.pend[G.pend.length - 1] || null; }
var DIEF = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

/* best human move among candidates: fewest workers, then the selected die, then the die that matches exactly */
function pick(list) {
  if (!list.length) return null;
  var p = G.P[VB.actor(G)];
  list.sort(function (a, b) { return (a.w || 0) - (b.w || 0) || ((UI.die === b.die) - (UI.die === a.die)) || ((p.dice[a.die] === a.v ? 0 : 1) - (p.dice[b.die] === b.v ? 0 : 1)); });
  return list[0];
}
function movesWhere(f) { return VB.validMoves(G).filter(function (m) { return f(m) && (UI.die == null || m.die === 'x' || m.die == null || m.die === UI.die || (G.P[VB.actor(G)].dice[0] === G.P[VB.actor(G)].dice[1])); }); }

/* ---------------- layout ---------------- */
var L = {};
function layout() {
  var b = $('#bd'), W = b.clientWidth, H = b.clientHeight; if (!W || !H) return;
  var oppH = 46, pad = 6, n = G ? VB.depotSize(G) : 2;
  var wide = W > H * 1.15;
  var mk = $('#mk'), es = $('#es'), opp = $('#opp'); mk.classList.toggle('ph', !wide);
  opp.style.cssText = 'left:' + pad + 'px;top:' + pad + 'px;right:' + pad + 'px;height:' + (oppH - 6) + 'px';
  if (wide) {   /* market as a 2-column block on the left, estate on the right */
    var mw = Math.min(W * 0.42, 420), cols = 4, rows = 2;
    var hexM = Math.max(30, Math.min(56, Math.floor((mw - 8 * cols) / cols - 10), Math.floor(((H - oppH - pad * 2) / rows - 60) / (n * 1.18))));
    mk.style.cssText = 'left:' + pad + 'px;top:' + oppH + 'px;width:' + mw + 'px;grid-template-columns:repeat(' + cols + ',1fr);--hex:' + hexM + 'px';
    var ew = W - mw - pad * 3, eh = H - oppH - pad;
    L.ex = mw + pad * 2; L.ey = oppH; L.ew = ew; L.eh = eh;
  } else {
    var cw = Math.floor((W - pad * 2 - 5 * 4) / 6), hexP = Math.max(26, Math.min(46, cw - 10, Math.floor((H - oppH) * 0.4 / (n * 1.2 + 2.2))));
    var stallH = 26 + n * (hexP * 1.1547 + 3) + 24, maxMk = (H - oppH) * 0.42;
    if (stallH > maxMk) { hexP = Math.max(24, Math.floor((maxMk - 50) / n / 1.19)); stallH = 26 + n * (hexP * 1.1547 + 3) + 24; }
    mk.style.cssText = 'left:' + pad + 'px;top:' + oppH + 'px;right:' + pad + 'px;grid-template-columns:repeat(6,1fr);--hex:' + hexP + 'px';
    L.ex = pad; L.ey = oppH + stallH + 6; L.ew = W - pad * 2; L.eh = H - L.ey - pad;
  }
  /* estate hex size: pointy-top, 7 columns, 7 rows => width = 7*sqrt3*s, height = 11*s */
  var s = Math.min(L.ew / (7 * 1.732 + 0.4), L.eh / 11.1);
  L.s = Math.max(14, s);
  es.style.cssText = 'left:' + L.ex + 'px;top:' + L.ey + 'px;width:' + L.ew + 'px;height:' + L.eh + 'px;--hex:' + Math.floor(L.s * 1.732 - 2) + 'px';
}
function fitEstate() {   /* phone: the estate takes what the market leaves */
  var b = $('#bd'), mk = $('#mk'), W = b.clientWidth, H = b.clientHeight; if (W > H * 1.15) return;
  L.ey = mk.offsetTop + mk.offsetHeight + 4; L.eh = Math.max(80, H - L.ey - 4);
  L.s = Math.max(12, Math.min(L.ew / (7 * 1.732 + 0.4), L.eh / 11.1));
  $('#es').style.cssText = 'left:' + L.ex + 'px;top:' + L.ey + 'px;width:' + L.ew + 'px;height:' + L.eh + 'px;--hex:' + Math.floor(L.s * 1.732 - 2) + 'px';
}
function cellXY(c, s, w, hgt) { var x = s * 1.732 * (c.q + c.r / 2), y = s * 1.5 * c.r; return { x: w / 2 + x, y: hgt / 2 + y }; }

/* ---------------- render ---------------- */
function render() {
  if (!G) return;
  layout(); renderBar(); renderOpp(); renderMarket(); fitEstate(); renderEstate(); renderDock(); renderScores();
  try { artApply(); } catch (e) { }
  try { GXH.phase(myTurn() && !UI.camp || myTurn() ? helpPhase() : null); } catch (e) { }
}
function renderBar() {
  $('#barstat').textContent = G.over ? 'Game over' : VB.PHASES[Math.min(G.phase, 4)] + ' · round ' + (G.round + 1) + '/5' + (G.nPhases < 5 ? ' · season ' + (G.phase + 1) + '/' + G.nPhases : '');
}
function renderOpp() {
  var o = $('#opp'); o.innerHTML = '';
  G.order.forEach(function (s, k) {
    var p = G.P[s], now = !G.over && VB.actor(G) === s;
    o.appendChild(h('button.och' + (now ? '.now' : ''), { type: 'button', 'data-seat': s, 'aria-label': G.seats[s].name + ' ' + p.vp + ' points', onclick: function () { showSeat(s); } },
      [h('span.ban', { style: 'background:' + VB.SEATCOL[s] }), h('b', { text: (k + 1) + '. ' + G.seats[s].name }), h('span', { text: p.vp + ' pts' })]));
  });
}
function legalTakeFor(d, slot) {
  var top = pend();
  if (top && top.t === 'grab') return VB.validMoves(G).filter(function (m) { return m.k === 'grab' && m.v === d && m.slot === slot; });
  if (top && top.t !== 'castle') return [];
  return movesWhere(function (m) { return m.k === 'take' && m.v === d && m.slot === slot; });
}
function renderMarket() {
  var mk = $('#mk'); mk.innerHTML = ''; var mt = myTurn(), top = pend();
  for (var d = 1; d <= 6; d++) (function (d) {
    var st = h('div.stall', { 'data-stall': d });
    st.appendChild(h('div.sth', {}, [h('span.pip', { text: d, 'aria-label': 'Stall ' + d })]));
    var tl = h('div.sttiles');
    G.depots[d].forEach(function (t, k) {
      if (!t) { tl.appendChild(h('div.hx.empty', { style: 'background:rgba(255,255,255,.08)', 'aria-hidden': 'true' })); return; }
      var lg = mt ? legalTakeFor(d, k) : [], b = h('button.tilebtn' + (lg.length ? '.glow' : ''), { type: 'button', id: 'mt-' + d + '-' + k, 'aria-label': VB.tileName(t) + ' in stall ' + d, onclick: function () { tapMarket(d, k); } }, [hexEl(t)]);
      var best = pick(lg.slice()); if (best && best.w) b.appendChild(h('span.cost', { text: '+' + best.w + '👷' }));
      tl.appendChild(b);
    });
    st.appendChild(tl);
    var gd = h('div.stgoods' + (mt && top && top.t === 'ship' && G.goodsAt[d].length ? '.glow' : ''), { id: 'gs-' + d });
    G.goodsAt[d].forEach(function (g) { gd.appendChild(h('span.gchip', { text: g, title: VB.GOODS[g], style: 'background-color:' + GCOL[g], 'data-art': 'goods-' + g })); });
    if (mt && top && top.t === 'ship' && G.goodsAt[d].length) { gd.setAttribute('role', 'button'); gd.setAttribute('tabindex', '0'); gd.setAttribute('aria-label', 'Load goods from stall ' + d); gd.addEventListener('click', function () { doMove({ k: 'ship', v: d }); }); }
    st.appendChild(gd);
    mk.appendChild(st);
  })(d);
  var lane = h('div.stall.lane', { id: 'lane' }); lane.appendChild(h('div.sth', { text: G.noBlack ? 'Closed' : '🪙' + VB.blackCost(G.P[VB.actor(G)] || G.P[0]) }));
  var lt = h('div.sttiles');
  G.black.forEach(function (t, k) {
    if (!t) return; var ok = mt && !top && VB.validMoves(G).some(function (m) { return m.k === 'buy' && m.slot === k; });
    lt.appendChild(h('button.tilebtn' + (ok ? '.glow' : ''), { type: 'button', id: 'bl-' + k, 'aria-label': VB.tileName(t) + ' in the back lane', onclick: function () { tapBlack(k); } }, [hexEl(t)]));
  });
  lane.appendChild(lt); mk.appendChild(lane);
}
function placeTargets() {   /* cells glowing for the selected storage tile */
  if (UI.sel == null || !myTurn()) return {};
  var o = {}; VB.validMoves(G).forEach(function (m) { if (m.k === 'place' && m.s === UI.sel && (UI.die == null || m.die === 'x' || m.die === UI.die)) { if (!o[m.cell] || (m.w || 0) < (o[m.cell].w || 0)) o[m.cell] = m; } });
  return o;
}
function renderEstate(box, seat, s) {
  var es = box || $('#es'), p = G.P[seat == null ? UI.view : seat], S = s || L.s, W = box ? S * 7 * 1.732 + 4 : L.ew, HH = box ? S * 11 : L.eh;
  es.innerHTML = ''; var tg = box ? {} : placeTargets();
  if (box) { es.style.width = W + 'px'; es.style.height = HH + 'px'; es.style.setProperty('--hex', Math.floor(S * 1.732 - 2) + 'px'); }
  VB.CELLS.forEach(function (c) {
    var xy = cellXY(c, S, W, HH), t = p.estate[c.i], m = tg[c.i];
    var b = h('button.cell' + (t ? '.built' : '') + (m ? '.glow' : ''), { type: 'button', id: box ? null : 'ec-' + c.i, style: 'left:' + xy.x + 'px;top:' + xy.y + 'px', 'aria-label': (t ? VB.tileName(t) : 'Empty ' + VB.COLNAME[c.col] + ' space ' + c.num) + (m ? ', build here' : '') });
    var hx = t ? hexEl(t) : hexEl(null, { col: c.col });
    if (!t && !m) hx.style.filter = 'saturate(.55) brightness(1.18)';
    b.appendChild(hx); b.appendChild(h('span.num' + (c.col === 'castle' || c.col === 'ship' || c.col === 'mine' ? '.lt' : ''), { text: c.num }));
    if (m && m.w) b.appendChild(h('span.cost', { text: '+' + m.w + '👷' }));
    if (!box) b.addEventListener('click', function () { tapCell(c.i); });
    es.appendChild(b);
  });
}
function renderDock() {
  var a = VB.actor(G), p = G.over ? me() : G.P[isHuman(a) ? a : UI.view], top = pend(), mt = myTurn();
  if (!G.over && isHuman(a)) UI.view = a;
  $('#docktitle').textContent = G.over ? 'Game over' : isHuman(a) ? (G.seats.filter(function (s) { return s.human; }).length > 1 ? G.seats[a].name + ': your turn' : 'Your turn') : G.seats[a].name + ' is playing';
  $('#prompt').textContent = promptText();
  var cb = $('#chainb'); if (UI.chain > 1 && mt) { cb.textContent = 'Chain ×' + UI.chain + '! Keep building'; cb.classList.add('on'); } else cb.classList.remove('on');
  /* dice */
  var dr = $('#dicerow'); dr.innerHTML = '';
  p.dice.forEach(function (v, i) {
    dr.appendChild(h('button.die' + (p.used[i] ? '.used' : '') + (UI.die === i ? '.sel' : ''), { type: 'button', id: 'die-' + i, 'aria-label': 'Die ' + v + (p.used[i] ? ' used' : ''), 'aria-pressed': UI.die === i ? 'true' : 'false', onclick: function () { tapDie(i); } }, [h('span', { text: v })]));
  });
  dr.appendChild(h('span.die.white', { title: 'White die: where this round\'s goods went', 'aria-label': 'White die ' + G.white, text: G.white }));
  /* storage */
  var st = $('#store'); st.innerHTML = '';
  for (var i = 0; i < VB.cap(p); i++) (function (i) {
    var t = p.store[i], slot = h('div.slot' + (UI.sel === i ? '.sel' : ''));
    if (t) {
      var ok = mt && storeLegal(i);
      slot.appendChild(h('button.tilebtn' + (ok ? '.glow' : ''), { type: 'button', id: 'st-' + i, 'aria-label': VB.tileName(t) + ' in storage', onclick: function () { tapStore(i); } }, [hexEl(t)]));
    }
    st.appendChild(slot);
  })(i);
  if (p.store.length > VB.cap(p)) { var t4 = p.store[VB.cap(p)]; st.appendChild(h('div.slot.sel', {}, [h('button.tilebtn.glow', { type: 'button', id: 'st-' + VB.cap(p), onclick: function () { tapStore(VB.cap(p)); }, 'aria-label': VB.tileName(t4) }, [hexEl(t4)])])); }
  /* goods */
  var gd = $('#goods'); gd.innerHTML = '';
  var gt = VB.goodsTypes(p); if (!gt.length) gd.appendChild(h('span.tip', { text: 'No goods yet' }));
  gt.forEach(function (g) {
    var ok = mt && VB.validMoves(G).some(function (m) { return m.k === 'sell' && m.v === g; });
    gd.appendChild(h('button.gbtn' + (ok ? '.glow' : ''), { type: 'button', id: 'gd-' + g, 'aria-label': p.goods[g] + ' ' + VB.GOODS[g] + ', needs a ' + g, onclick: function () { tapGoods(g); } }, [h('span.gchip', { text: g, style: 'background-color:' + GCOL[g], 'data-art': 'goods-' + g }), h('span', { text: '×' + p.goods[g] })]));
  });
  /* resources */
  var rr = $('#resrow'); rr.innerHTML = '';
  rr.appendChild(h('span.res', { id: 'r-silver', title: 'Silver', 'data-engine': 'silver' }, [h('i', { text: '🪙' }), String(p.silver)]));
  rr.appendChild(h('span.res', { id: 'r-workers', title: 'Workers' }, [h('i', { text: '👷' }), String(p.workers)]));
  rr.appendChild(h('span.res', { id: 'r-vp', title: 'Points' }, [h('i', { text: '⭐' }), String(p.vp)]));
  rr.appendChild(h('span.res', { title: 'Banner track' }, [h('i', { text: '🚩' }), String(p.pos)]));
  /* actions */
  var ac = $('#acts'); ac.innerHTML = '';
  if (G.over) { ac.appendChild(h('button.btn', { type: 'button', id: 'resB', text: 'See the result', onclick: showResult })); return; }
  if (!mt) return;
  if (top) {
    if (top.t !== 'discard') ac.appendChild(h('button.btn.alt', { type: 'button', id: 'skipB', text: top.t === 'castle' ? 'Skip the free action' : 'Skip', onclick: function () { doMove({ k: 'skip' }); } }));
    if (top.t === 'castle') ac.appendChild(h('button.btn.alt', { type: 'button', id: 'wkxB', text: 'Take workers (free)', onclick: function () { doMove({ k: 'workers', die: 'x', w: 0 }); } }));
    return;
  }
  var seen = {};
  [0, 1].forEach(function (i) { if (p.used[i] || seen[p.dice[i]]) return; seen[p.dice[i]] = 1; ac.appendChild(h('button.btn.alt', { type: 'button', id: 'wk' + i, text: '👷 +' + (2 + (p.know['wk+1'] ? 1 : 0)) + ' workers (die ' + p.dice[i] + ')', onclick: function () { doMove(pick(VB.validMoves(G).filter(function (m) { return m.k === 'workers' && m.die === i; }))); } })); });
  if (p.used[0] && p.used[1]) ac.appendChild(h('button.btn', { type: 'button', id: 'endB', text: 'End turn', onclick: function () { doMove({ k: 'end' }); } }));
}
function storeLegal(i) {
  var top = pend();
  if (top && top.t === 'discard') return true;
  return VB.validMoves(G).some(function (m) { return m.k === 'place' && m.s === i; });
}
function promptText() {
  if (G.over) return 'The valley is built. See who flies the highest banner.';
  var a = VB.actor(G); if (!isHuman(a)) return G.seats[a].name + ' is thinking…';
  var top = pend(), p = G.P[a];
  if (top) return { castle: 'Keep built! One free action, any number.', hall: 'Moot Hall! Build a stored tile, any number.', grab: 'Pick a glowing tile from the stalls.', store: 'Granary: sell one kind of goods.', ship: 'Barge: load goods from a glowing stall.', discard: 'Storage full: tap a tile to drop.' }[top.t];
  if (UI.sel != null) return 'Tap a glowing space to build.';
  if (p.used[0] && p.used[1]) return 'Dice used. Buy from the back lane or end.';
  return 'Use a die: take, build, sell or workers.';
}
function renderScores() {
  var b = $('#scorebody'); if (!b) return; b.innerHTML = '';
  var tb = h('table'); tb.appendChild(h('tr', {}, ['Player', 'Points', 'Silver', 'Workers', 'Land', 'Track'].map(function (x) { return h('th', { text: x }); })));
  G.order.forEach(function (s) { var p = G.P[s]; tb.appendChild(h('tr', {}, [G.seats[s].name, p.vp, p.silver, p.workers, VB.estateFilled(p) + '/37', p.pos].map(function (x) { return h('td', { text: String(x) }); }))); });
  b.appendChild(tb);
  b.appendChild(h('p.tip', { text: 'Turn order follows the banner track: Barges move you up. Coming goods this season: ' + (G.rg.filter(Boolean).map(function (g) { return VB.GOODS[g]; }).join(', ') || 'none') + '.' }));
  b.appendChild(h('p.tip', { text: 'Tap a player in the top row to see their estate.' }));
}

/* ---------------- big tile view (every tile can be read large) ---------------- */
function showTile(t, acts, note) {
  var tv = $('#tv'); tv.innerHTML = '';
  var c = h('div.card', { role: 'dialog', 'aria-label': VB.tileName(t) });
  var big = hexEl(t, { size: 110 });
  c.appendChild(h('div.tbig', {}, [big, h('div', {}, [h('h2', { text: VB.tileName(t) }), h('p', { text: VB.COLNAME[t.t] + ' tile' })])]));
  c.appendChild(h('p', { text: VB.tileText(t) }));
  if (note) c.appendChild(h('p.tip', { text: note }));
  var ac = h('div.acts');
  (acts || []).forEach(function (x) { ac.appendChild(h('button.btn' + (x.alt ? '.alt' : ''), { type: 'button', text: x.label, onclick: function () { closeTile(); x.fn(); } })); });
  ac.appendChild(h('button.btn.alt', { type: 'button', id: 'tvClose', text: 'Close', onclick: closeTile }));
  c.appendChild(ac); tv.appendChild(c); tv.hidden = false;
  tv.onclick = function (e) { if (e.target === tv) closeTile(); };
  try { artApply(tv); } catch (e) { }
}
function closeTile() { $('#tv').hidden = true; render(); schedule(); }
function dieLabel(m) { return m.die === 'x' ? 'free' : 'die ' + G.P[VB.actor(G)].dice[m.die] + (m.w ? ', ' + m.w + ' worker' + (m.w > 1 ? 's' : '') : ''); }
function optionsFor(list, verb) {   /* one button per die (cheapest first) */
  var by = {}; list.forEach(function (m) { var k = m.die; if (!by[k] || m.w < by[k].w) by[k] = m; });
  return Object.keys(by).map(function (k) { return by[k]; }).sort(function (a, b) { return a.w - b.w; }).slice(0, 2).map(function (m) { return { label: verb + ' (' + dieLabel(m) + ')', fn: function () { doMove(m); } }; });
}
function needNote(v, kind) {
  var p = G.P[VB.actor(G)]; if (!isHuman(VB.actor(G))) return 'Wait for your turn.';
  var free = p.dice.filter(function (x, i) { return !p.used[i]; });
  if (!free.length) return 'Both dice are used this turn.';
  var c = Math.min.apply(null, free.map(function (x) { return VB.cost(p, x, v, kind); }));
  return 'Needs a die showing ' + v + '. You would need ' + c + ' worker' + (c === 1 ? '' : 's') + ' (you have ' + p.workers + ').';
}

/* ---------------- taps ---------------- */
function tutOk(x) { if (typeof GXT === 'undefined' || !GXT.active() || UI.mode !== 'tutorial') return true; return GXT.act(Object.assign({ type: 'tap' }, x)); }
function tapMarket(d, k) {
  var t = G.depots[d][k]; if (!t) return;
  if (!tutOk({ what: 'market', d: d, k: k })) return;
  var lg = myTurn() ? legalTakeFor(d, k) : [], top = pend();
  if (lg.length && top && top.t === 'grab') { showTile(t, [{ label: 'Take it (free)', fn: function () { doMove(lg[0]); } }]); return; }
  if (lg.length && top && top.t === 'castle') { showTile(t, [{ label: 'Take it (free action)', fn: function () { doMove(lg[0]); } }]); return; }
  showTile(t, lg.length ? optionsFor(lg, 'Take to storage') : [], lg.length ? null : (myTurn() && !top ? (G.P[VB.actor(G)].store.length >= VB.cap(G.P[VB.actor(G)]) ? 'Storage is full: you would drop one. ' : '') + needNote(d, 'take') : null));
}
function tapBlack(k) {
  var t = G.black[k]; if (!t) return; var ok = myTurn() && !pend() && VB.validMoves(G).some(function (m) { return m.k === 'buy' && m.slot === k; });
  var p = G.P[VB.actor(G)] || me();
  showTile(t, ok ? [{ label: 'Buy for ' + VB.blackCost(p) + ' silver', fn: function () { doMove({ k: 'buy', slot: k }); } }] : [], ok ? 'The back lane needs no die. Once per turn.' : (p.bought ? 'You already bought this turn.' : 'Costs ' + VB.blackCost(p) + ' silver, once per turn, no die needed.'));
}
function tapStore(i) {
  var p = G.P[VB.actor(G)], t = p.store[i], top = pend(); if (!t) return;
  if (!tutOk({ what: 'store', s: i })) return;
  if (myTurn() && top && top.t === 'discard') { showTile(t, [{ label: 'Drop this tile', fn: function () { doMove({ k: 'discard', s: i }); } }]); return; }
  var can = myTurn() && storeLegal(i);
  if (can && (UI.sel === i)) { UI.sel = null; render(); return; }
  if (can) { UI.sel = i; render(); toast('Tap a glowing space'); return; }
  var c = VB.CELLS.filter(function (x) { return x.col === t.t && !p.estate[x.i]; });
  showTile(t, [], !c.length ? 'No free ' + VB.COLNAME[t.t] + ' space left on your estate.' : VB.placeTargets(p, t, 0).length ? 'Build it on a ' + VB.COLNAME[t.t] + ' space next to your land; the die must show that space\'s number.' : 'No ' + VB.COLNAME[t.t] + ' space touches your land yet.');
}
function tapCell(ci) {
  var p = me(), t = p.estate[ci];
  var tg = placeTargets(); if (tg[ci]) {
    if (!tutOk({ what: 'cell', cell: ci })) return;
    var list = VB.validMoves(G).filter(function (m) { return m.k === 'place' && m.s === UI.sel && m.cell === ci; });
    UI.sel = null; doMove(pick(list)); return;
  }
  if (t) showTile(t, [], t.home ? 'Your home keep: build next to it.' : null);
  else if (UI.sel == null) toast(VB.COLNAME[VB.CELLS[ci].col] + ' space ' + VB.CELLS[ci].num);
}
function tapGoods(g) {
  var lg = myTurn() ? movesWhere(function (m) { return m.k === 'sell' && m.v === g; }) : [];
  if (!tutOk({ what: 'goods', g: g })) return;
  var p = G.P[VB.actor(G)] || me(), n = p.goods[g] || 0;
  var tv = $('#tv'); tv.innerHTML = '';
  var c = h('div.card', { role: 'dialog', 'aria-label': VB.GOODS[g] });
  c.appendChild(h('h2', { text: n + ' × ' + VB.GOODS[g] }));
  c.appendChild(h('p', { text: 'Sell all of one kind with a die showing ' + g + ': ' + VB.saleVP(G, p, n) + ' points and 1 silver.' }));
  var ac = h('div.acts');
  optionsFor(lg, 'Sell').forEach(function (x) { ac.appendChild(h('button.btn', { type: 'button', text: x.label, onclick: function () { closeTile(); x.fn(); } })); });
  if (!lg.length) c.appendChild(h('p.tip', { text: needNote(g, 'sell') }));
  ac.appendChild(h('button.btn.alt', { type: 'button', text: 'Close', onclick: closeTile })); c.appendChild(ac); tv.appendChild(c); tv.hidden = false;
  tv.onclick = function (e) { if (e.target === tv) closeTile(); };
}
function tapDie(i) { var p = me(); if (p.used[i]) return; UI.die = UI.die === i ? null : i; sfx('take'); render(); }
function showSeat(s) {
  var d = $('#seatbody'); if (!d) return; d.innerHTML = ''; var p = G.P[s];
  d.appendChild(h('p', { text: G.seats[s].name + ': ' + p.vp + ' points · ' + p.silver + ' silver · ' + p.workers + ' workers · goods ' + (VB.goodsTypes(p).map(function (g) { return p.goods[g] + ' ' + VB.GOODS[g]; }).join(', ') || 'none') }));
  d.appendChild(h('p', { text: 'Storage: ' + (p.store.map(VB.tileName).join(', ') || 'empty') }));
  var lore = Object.keys(p.estate).map(function (k) { return p.estate[k]; }).filter(function (t) { return t.t === 'know'; }).map(VB.tileName);
  if (lore.length) d.appendChild(h('p', { text: 'Lore: ' + lore.join(', ') }));
  var box = h('div.minies'); d.appendChild(box);
  var w = Math.min(460, innerWidth - 60); renderEstate(box, s, w / (7 * 1.732 + 0.4));
  GX.drawer('seatd', G.seats[s].name + "'s estate"); GX.show('seatd');
}

/* ---------------- moves, animation ---------------- */
function rectOf(id) { var e = document.getElementById(id); if (!e) return null; var r = e.getBoundingClientRect(); return r.width ? r : null; }
function srcFor(m, s) {
  if (m.k === 'take' || m.k === 'grab') return rectOf('mt-' + m.v + '-' + m.slot);
  if (m.k === 'buy') return rectOf('bl-' + m.slot);
  if (m.k === 'place') return s === UI.view ? rectOf('st-' + m.s) : null;
  return null;
}
function fly(from, toId, tile) {
  var to = rectOf(toId); var ms = animMs(420); if (!from || !to || !ms) return Promise.resolve();
  var e = hexEl(tile, { size: Math.round(from.width) }); e.classList.add('fly');
  e.style.left = from.left + 'px'; e.style.top = from.top + 'px'; document.body.appendChild(e);
  var sc = to.width / from.width;
  requestAnimationFrame(function () { e.style.transform = 'translate(' + (to.left - from.left) + 'px,' + (to.top - from.top) + 'px) scale(' + sc + ')'; });
  return wait(ms + 40).then(function () { e.remove(); });
}
function popAt(r, txt) { if (!r || UI.fast) return; var e = h('div.popn', { text: txt, style: 'left:' + (r.left + r.width / 2) + 'px;top:' + (r.top) + 'px' }); document.body.appendChild(e); setTimeout(function () { e.remove(); }, 1300); }
function ribbon(a, b) {
  if (!a || !b || UI.fast) return; var x1 = a.left + a.width / 2, y1 = a.top + a.height / 2, x2 = b.left + b.width / 2, y2 = b.top + b.height / 2;
  var len = Math.hypot(x2 - x1, y2 - y1), ang = Math.atan2(y2 - y1, x2 - x1);
  var e = h('div.ribbon', { style: 'left:' + x1 + 'px;top:' + y1 + 'px;width:' + len + 'px;--a:' + ang + 'rad' }); document.body.appendChild(e); setTimeout(function () { e.remove(); }, 800);
}
var WHY = { region: 'region done!', colour: 'colour bonus!', animals: 'animals', goods: 'sold', tower: 'beacon', lore: 'lore' };
function doMove(m) {
  if (!m || UI.busy) return;
  var s = VB.actor(G), src = srcFor(m, s), prevCell = UI.lastCell;
  try { if (isHuman(s) && GX.undo) { } } catch (e) { }
  var r = VB.performMove(G, m); if (!r.ok) { sfx('bad'); toast('Not allowed'); render(); return; }
  if (UI.die != null && G.P[s].used[UI.die]) UI.die = null;
  UI.busy = true; UI.sel = null;
  if (m.k === 'place') { UI.chain = m.die === 'x' ? UI.chain + 1 : 1; } else if (m.k === 'end') UI.chain = 0;
  try { if (UI.mode === 'tutorial' && typeof GXT !== 'undefined' && GXT.active()) GXT.act({ type: 'event', what: m.k }); } catch (e) { }
  render();
  var chainNow = UI.chain;
  var seq = Promise.resolve();
  r.ev.forEach(function (ev) {
    seq = seq.then(function () {
      if (ev.e === 'take') { sfx('take'); return fly(src, ev.p === UI.view ? 'st-' + (G.P[ev.p].store.indexOf(ev.tile)) : 'opp', ev.tile); }
      if (ev.e === 'place') {
        sfx(ev.chain ? 'chain' : 'place'); UI.lastCell = ev.cell;
        if (ev.p !== UI.view) { toast(G.seats[ev.p].name + ' builds ' + VB.tileName(ev.tile) + (ev.chain ? ' (chain!)' : ''), 1400); return wait(animMs(500)); }
        var dst = 'ec-' + ev.cell, el = document.getElementById(dst); if (el) el.style.visibility = 'hidden';
        if (ev.chain && prevCell != null) ribbon(rectOf('ec-' + prevCell), rectOf(dst));
        return fly(src, dst, ev.tile).then(function () { if (el) { el.style.visibility = ''; el.animate && el.animate([{ transform: 'translate(-50%,-50%) scale(1.25)' }, { transform: 'translate(-50%,-50%) scale(1)' }], { duration: animMs(260) || 1 }); } if (ev.chain && chainNow > 1) popAt(rectOf(dst), 'Chain ×' + chainNow); });
      }
      if (ev.e === 'score') { sfx('score'); var rr = ev.cell != null && ev.p === UI.view ? rectOf('ec-' + ev.cell) : rectOf('r-vp'); if (ev.p !== UI.view) { var oc = document.querySelector('.och[data-seat="' + ev.p + '"]'); rr = oc && oc.getBoundingClientRect(); } popAt(rr, '+' + ev.n + ' ' + (WHY[ev.why] || '')); return wait(animMs(ev.why === 'region' ? 650 : 250)); }
      if (ev.e === 'sell') { sfx('sell'); return wait(animMs(200)); }
      if (ev.e === 'die') { return null; }
      if (ev.e === 'end') { sfx('end'); return null; }
      return null;
    });
  });
  seq.then(function () {
    UI.busy = false;
    if (m.k === 'end') onTurnChange();
    save(); render(); schedule();
    if (G.over) setTimeout(gameOver, animMs(500));
  });
}
function onTurnChange() {
  if (G.over) return; var a = VB.actor(G);
  if (G.turn % G.n === 0 && G.ti === 0) { sfx('dice'); toast((G.round === 0 ? VB.PHASES[G.phase] + ' begins! ' : '') + 'Round ' + (G.round + 1) + ': new dice', 1600); }
  var humans = G.seats.filter(function (s) { return s.human; }).length;
  if (humans > 1 && isHuman(a) && UI.lastHuman !== a) toast('Pass to ' + G.seats[a].name, 2000);
  if (isHuman(a)) UI.lastHuman = a;
}
function schedule() {
  clearTimeout(UI.aiT); if (!G || G.over || UI.busy || tvOpen()) return;
  var a = VB.actor(G);
  if (isHuman(a)) { try { GX.showDock(); } catch (e) { } return; }
  if (UI.mode === 'tutorial' && typeof GXT !== 'undefined' && GXT.active() && !UI.tutAi) return;
  UI.aiT = setTimeout(function () { if (UI.busy || !G || G.over || isHuman(VB.actor(G))) return; doMove(VB.aiMove(G)); }, UI.fast ? 5 : (GX.aiDelay ? GX.aiDelay(620) : 620));
}

/* ---------------- game start / end ---------------- */
function startGame(o) {
  o = o || {}; clearTimeout(UI.aiT);
  var n = o.n || 2, seats = [];
  for (var i = 0; i < n; i++) seats.push(i === 0 ? { name: o.myName || 'You', human: true } : { name: (o.names && o.names[i]) || VB.SEATNAME[i], human: !!(o.hot && o.hot[i]), ai: o.ai || 'normal', style: o.style || null });
  G = VB.newGame({ n: n, seed: o.seed, phases: o.phases || 5, seats: seats, bonus: o.bonus, noBlack: o.noBlack });
  UI.view = 0; UI.sel = null; UI.die = null; UI.chain = 0; UI.busy = false; UI.mode = o.mode || 'quick'; UI.camp = UI.mode === 'story'; UI.lastHuman = -1;
  $('#start').hidden = true; $('#rs').hidden = true; $('#tv').hidden = true;
  try { GXH.setEnabled(o.hints !== false && (UI.mode !== 'story' || !!o.hints)); } catch (e) { }
  save(); render(); musSync(); sfx('dice'); toast(VB.PHASES[0] + ' begins: roll the dice!', 1600); schedule();
}
function resume() { try { G = JSON.parse(localStorage.getItem('vob_save')); } catch (e) { G = null; } if (!G) return showTitle(); UI.mode = 'quick'; UI.camp = false; UI.busy = false; $('#start').hidden = true; render(); musSync(); schedule(); }
function gameOver() { try { localStorage.removeItem('vob_save'); } catch (e) { } musSync(); showResult(); }
function showResult() {
  var rs = $('#rs'); rs.innerHTML = ''; var c = h('div.card', { role: 'dialog', 'aria-label': 'Result' });
  var w = G.winner, you = G.seats.filter(function (s) { return s.human; }).length === 1;
  c.appendChild(h('div', { 'data-art': w === 0 && you ? 'ui-result-win' : 'ui-result-lose', style: 'height:8px' }));
  c.appendChild(h('h2', { text: you ? (w === 0 ? 'Your banner flies highest!' : G.seats[w].name + ' wins the valley') : G.seats[w].name + ' wins!' }));
  var tb = h('table'); tb.appendChild(h('tr', {}, ['', 'Play', 'Silver', 'Workers', 'Goods', 'Lore', 'Total'].map(function (x) { return h('th', { text: x }); })));
  G.rank.forEach(function (s) { var p = G.P[s], e = p.end || { silver: 0, workers: 0, goods: 0, lore: 0 }; tb.appendChild(h('tr', {}, [G.seats[s].name, p.vpPlay, e.silver, e.workers, e.goods, e.lore, p.vp].map(function (x) { return h('td', { text: String(x) }); }))); });
  c.appendChild(tb);
  var p0 = G.P[0]; c.appendChild(h('p.tip', { text: 'You finished ' + p0.stat.regions + ' regions, sold ' + p0.stat.sales + ' times and chained ' + p0.stat.chain + ' builds.' }));
  var ac = h('div.acts', { style: 'display:flex;gap:8px;flex-wrap:wrap;margin-top:10px' });
  if (UI.camp && typeof GXC !== 'undefined' && GXC.active()) ac.appendChild(h('button.btn', { type: 'button', id: 'campfin', text: 'Continue the story', onclick: function () { rs.hidden = true; try { GXC.finish(G); } catch (e) { console.error(e); } } }));
  else ac.appendChild(h('button.btn', { type: 'button', id: 'again', text: 'Play again', onclick: function () { startGame(UI.lastOpts || {}); } }));
  ac.appendChild(h('button.btn.alt', { type: 'button', id: 'lookB', text: 'Look at the board', onclick: function () { rs.hidden = true; } }));
  if (!UI.camp) ac.appendChild(h('button.btn.alt', { type: 'button', id: 'titleB', text: 'Title', onclick: showTitle }));
  c.appendChild(ac); rs.appendChild(c); rs.hidden = false; try { artApply(rs); } catch (e) { }
  try { if (!UI.camp && window.GNS && GNS.result) GNS.result({ game: 'vale-of-banners', mode: 'quick', won: w === 0, score: p0.vp }); } catch (e) { }
}

/* ---------------- title + quick setup ---------------- */
var SET = { n: 2, ai: 'normal', hot: 0 };
function showTitle() {
  clearTimeout(UI.aiT); try { GXT.stop(); } catch (e) { } try { GXC.close(); } catch (e) { } GX.close && GX.close();
  var st = $('#start'); st.innerHTML = ''; st.hidden = false; $('#rs').hidden = true; $('#tv').hidden = true;
  var c = h('div.tcard');
  c.appendChild(h('h1', { text: 'Vale of Banners' }));
  c.appendChild(h('p.sub', { text: 'Roll two dice, build your estate, raise your banner over the valley.' }));
  c.appendChild(h('button.big.btn', { type: 'button', id: 'storyB', text: '📖 Story', onclick: storyOpen }));
  c.appendChild(h('button.btn.sec', { type: 'button', id: 'quickB', text: 'Quick game', onclick: showSetup }));
  if (hasSave()) c.appendChild(h('button.btn.alt', { type: 'button', id: 'resumeB', text: 'Continue saved game', onclick: resume }));
  c.appendChild(h('button.btn.alt', { type: 'button', id: 'tutB', text: (tutDone() ? 'Tutorial' : 'Tutorial (start here)'), onclick: function () { tutStart(); } }));
  c.appendChild(h('button.btn.alt', { type: 'button', id: 'howB', text: 'How to play', onclick: function () { GX.show('rulesd'); } }));
  st.appendChild(c); try { artApply(st); } catch (e) { } musSync();
}
function showSetup() {
  var st = $('#start'); st.innerHTML = ''; var c = h('div.tcard');
  c.appendChild(h('h1', { text: 'Quick game' }));
  function seg(label, opts, cur, set) {
    var r = h('div.srow', {}, [h('span', { text: label })]), s = h('div.seg');
    opts.forEach(function (o) { s.appendChild(h('button' + (cur === o[0] ? '.on' : ''), { type: 'button', text: o[1], 'aria-pressed': cur === o[0] ? 'true' : 'false', onclick: function () { set(o[0]); showSetup(); } })); });
    r.appendChild(s); return r;
  }
  c.appendChild(seg('Players', [[2, '2'], [3, '3'], [4, '4']], SET.n, function (v) { SET.n = v; SET.hot = Math.min(SET.hot, v - 1); }));
  c.appendChild(seg('Computer stewards', [['easy', 'Easy'], ['normal', 'Normal'], ['hard', 'Hard']], SET.ai, function (v) { SET.ai = v; }));
  var hs = [[0, 'None']]; for (var i = 1; i < SET.n; i++) hs.push([i, String(i)]);
  c.appendChild(seg('Friends on this device', hs, SET.hot, function (v) { SET.hot = v; }));
  c.appendChild(h('p.tip', { text: SET.hot ? 'Pass the device when it says so. Everything on the table is open.' : 'You against ' + (SET.n - 1) + ' computer steward' + (SET.n > 2 ? 's' : '') + '.' }));
  c.appendChild(h('button.btn.big', { type: 'button', id: 'goB', text: 'Start', onclick: function () {
    var hot = {}, names = {}; for (var k = 1; k <= SET.hot; k++) { hot[k] = true; names[k] = 'Friend ' + k; }
    UI.lastOpts = { n: SET.n, ai: SET.ai, hot: hot, names: names }; startGame(UI.lastOpts);
  } }));
  c.appendChild(h('button.btn.alt', { type: 'button', id: 'backB', text: 'Back', onclick: showTitle }));
  st.appendChild(c);
}

/* ---------------- rules / scores / menu drawers ---------------- */
var RULES_HTML = '<div class="rules">' +
  '<p>Five seasons of five rounds. Every round each steward rolls <b>two dice</b>. On your turn use each die for one action:</p>' +
  '<ul><li><b>Take</b> a tile from the market stall with the die\'s number into your storage (3 spaces).</li>' +
  '<li><b>Build</b> a stored tile on an empty space of its colour that shows the die\'s number and touches your land.</li>' +
  '<li><b>Sell</b> all your goods of the die\'s number: points per tile (players + 1) and 1 silver.</li>' +
  '<li><b>Workers</b>: take 2 workers with any die.</li></ul>' +
  '<p>Each <b>worker</b> turns a die up or down by 1 (6 and 1 are neighbours). Once per turn you may <b>buy</b> a tile from the back lane for 2 silver, with no die.</p>' +
  '<h3>Tiles</h3><ul><li><b>Keep</b> (dark green): one free extra action with any number.</li><li><b>Mine</b> (grey): 1 silver at the end of every season.</li>' +
  '<li><b>Lore</b> (yellow): bends one rule for you for the rest of the game (26 kinds).</li>' +
  '<li><b>Buildings</b> (tan): an instant effect; never two of the same kind in one quarter. The <b>Moot Hall</b> lets you build again at once: chain several tiles in one turn!</li>' +
  '<li><b>Pasture</b> (light green): score every animal of that kind in that meadow.</li>' +
  '<li><b>Barge</b> (blue): take all goods from one stall and move up the banner track (turn order).</li></ul>' +
  '<h3>Scoring</h3><p>Fill a whole region: 1/3/6/10/15/21/28/36 points for 1-8 spaces, plus 10/8/6/4/2 for doing it in season 1-5. First to fill every space of one colour gets a bonus (second gets less). Each round one goods tile goes to the stall shown by the white die.</p>' +
  '<p>Game end: +1 per silver, +1 per unsold goods tile, +1 per 2 workers, plus Lore scrolls. Most points wins; a tie goes to the higher banner.</p></div>';
function drawers() {
  var r = h('div', { html: RULES_HTML }); GX.drawer('rulesd', 'How to play', r);
  var tr = h('button.btn.alt', { type: 'button', text: 'Play the tutorial', style: 'margin-top:8px', onclick: function () { GX.close(); tutStart(); } }); r.appendChild(tr);
  GX.drawer('scored', 'Scores and turn order', h('div', { id: 'scorebody' }));
  GX.drawer('seatd', 'Estate', h('div', { id: 'seatbody' }), true);
  try {
    GX.settings({
      id: 'setd', title: 'Menu',
      game: function (S) {
        S.appendChild(GX.row('This game', [
          h('button.btn.alt', { type: 'button', text: 'Rules', onclick: function () { GX.show('rulesd'); } }),
          h('button.btn.alt', { type: 'button', text: 'Tutorial', onclick: function () { GX.close(); tutStart(); } }),
          h('button.btn.alt', { type: 'button', text: 'Restart', onclick: function () { GX.close(); if (UI.camp && GXC.active()) { var d = GXC.active(); startChapter(d); } else startGame(UI.lastOpts || {}); } }),
          h('button.btn.alt', { type: 'button', text: 'Title', onclick: function () { GX.close(); showTitle(); } })]));
      },
      sound: function (S) {
        S.appendChild(GX.row('Sound', GX.onoff(!UI.mute, function (v) { UI.mute = !v; try { localStorage.setItem('vob_mute', UI.mute ? '1' : '0'); } catch (e) { } musSync(); })));
        S.appendChild(GX.row('Music', [GX.onoff(UI.music, function (v) { UI.music = v; try { localStorage.setItem('vob_music', v ? '1' : '0'); } catch (e) { } musSync(); }), h('button.btn.alt', { type: 'button', text: 'Songs', onclick: function () { try { GXMUS.open(); } catch (e) { } } })], (window.VB_MUSIC || []).length ? null : 'Songs arrive with the next update.'));
      },
      help: function (S) { try { var w = h('div'); w.innerHTML = GXH.settingsHTML({ rowClass: 'mrow', btnClass: 'btn alt' }); while (w.firstChild) S.appendChild(w.firstChild); } catch (e) { } },
      about: { name: 'Vale of Banners', version: '1.0', text: 'An original dice-and-tiles estate game.' }
    });
  } catch (e) { console.error(e); }
}

/* ---------------- help (coach bubbles + bulb) ---------------- */
function helpPhase() { var t = pend(); if (t) return 'p-' + t.t; if (UI.sel != null) return 'build'; var p = G.P[VB.actor(G)]; return p.used[0] && p.used[1] ? 'end' : 'dice'; }
function helpInit() {
  try {
    GXH.init({ game: 'vale-of-banners', defaultOn: true, avoid: '#acts button,.glow,.och', steps: {
      end: { target: function () { return $('#endB'); }, title: 'Done', text: 'Both dice used. Buy from the back lane or end your turn.' },
      'p-castle': { target: function () { return $('#mk'); }, title: 'Free action', text: 'Your Keep gives one free action: any number at all.' },
      'p-hall': { target: function () { return $('#store'); }, title: 'Chain!', text: 'Moot Hall: pick a stored tile and build it at once.' },
      'p-ship': { target: function () { return $('#mk'); }, title: 'Barge', text: 'Load all goods from one stall, then sell them with a matching die.' }
    }, rules: [{ title: 'Dice', text: 'Take, build, sell or take workers.' }, { title: 'Regions', text: 'Fill a region early for big points.' }] });
    GXH.bulb({ el: '#bulbbtn', suggest: function () {
      if (!myTurn()) return null; var c = VB.fclone(G), m = VB.aiMove(c, 'normal'); if (!m) return null;
      var tgt = m.k === 'take' || m.k === 'grab' ? $('#mt-' + m.v + '-' + m.slot) : m.k === 'place' ? $('#st-' + m.s) : m.k === 'sell' ? $('#gd-' + m.v) : m.k === 'buy' ? $('#bl-' + m.slot) : m.k === 'end' ? $('#endB') : m.k === 'workers' ? $('#acts .btn') : $('#acts');
      return { target: tgt || $('#dock'), why: VB.why(G, m) };
    }, rulesFor: helpPhase });
  } catch (e) { console.error(e); }
}

/* ---------------- tutorial: a staged first game ---------------- */
function tutDone() { try { return GXT.isDone('vale-of-banners'); } catch (e) { return false; } }
function tutSetup() {
  startGame({ n: 2, seed: 77, phases: 1, ai: 'easy', mode: 'tutorial', names: { 1: 'Odo' } });
  var p = G.P[0], home = VB.CELLS[VB.HOME];
  /* a pasture space next to home; the stored sheep fits it; die 1 = that number; die 2 matches a stall holding a Moot Hall */
  var nb = home.nb.map(function (i) { return VB.CELLS[i]; }).filter(function (c) { return c.col === 'pas' || c.col === 'bld' || c.col === 'ship'; })[0] || VB.CELLS[home.nb[0]];
  var tl = { id: 'tut1', t: nb.col }; if (nb.col === 'pas') { tl.k = 'sheep'; tl.n = 3; } if (nb.col === 'bld') tl.k = 'tower';
  G.bag.push(tl); p.store = [tl]; G.bag.pop();
  var sd = nb.num === 4 ? 2 : 4; G.depots[sd][0] = { id: 'tut2', t: 'mine' };
  p.dice = [sd, nb.num]; p.used = [false, false]; p.workers = 2;
  G.order = [0, 1]; G.ti = 0; UI.tut = { stall: sd, cell: nb.i };
  G.bag = G.bag.filter(function (t) { return t.id !== 'tut1' && t.id !== 'tut2'; });
  render();
}
function tutStart(o) {
  if (typeof GXT === 'undefined') return;
  $('#start').hidden = true;
  GXT.start({ game: 'vale-of-banners', story: true, setup: tutSetup, steps: [
    { id: 'hi', title: 'Welcome, steward', say: 'This is your estate. Your home keep sits in the middle.', target: function () { return $('#ec-' + VB.HOME); }, wait: null },
    { id: 'dice', title: 'Two dice', say: 'Every round you roll two dice. Each die is one action.', target: function () { return $('#dicerow'); }, wait: null },
    { id: 'take', title: 'Take a tile', say: 'Tap the glowing tile in the stall matching your first die.', target: function () { return $('#mt-' + UI.tut.stall + '-0'); }, wait: { type: 'tap', match: function (a) { return a.what === 'market' && a.d === UI.tut.stall; } } },
    { id: 'take2', title: 'Into storage', say: 'Tap Take to put it into your storage.', target: function () { return $('#tv .btn'); }, wait: { type: 'event', match: function (a) { return a.what === 'take'; } } },
    { id: 'pick', title: 'Build', say: 'Now tap the stored tile to build it.', target: function () { return $('#st-0'); }, wait: { type: 'tap', match: function (a) { return a.what === 'store'; } } },
    { id: 'cell', title: 'Next to your land', say: 'Its space must touch your land and match your second die.', target: function () { return $('#ec-' + UI.tut.cell); }, wait: { type: 'tap', match: function (a) { return a.what === 'cell'; } } },
    { id: 'score', title: 'Regions score', say: 'Fill a whole region of one colour for big points. Earlier seasons pay more.', target: function () { return $('#es'); }, wait: null },
    { id: 'end', title: 'End your turn', say: 'Both dice used. Tap End turn.', target: function () { return $('#endB'); }, wait: { type: 'event', match: function (a) { return a.what === 'end'; } } },
    { id: 'more', title: 'You are ready', say: 'Workers bend dice by one. Keeps and Moot Halls let you chain builds. Good luck!', target: function () { return $('#dock'); }, wait: null }
  ], onDone: function (r) {
    UI.mode = 'quick'; try { GXT.markDone('vale-of-banners'); } catch (e) { }
    if (r && r.choice === 'story') storyOpen(); else { UI.lastOpts = { n: 2, ai: 'easy' }; startGame(UI.lastOpts); }
  }, onExit: function () { UI.mode = 'quick'; showTitle(); } });
}

/* ---------------- Story (gx-campaign) ---------------- */
function storyOpen() { $('#start').hidden = true; try { GXC.open(); } catch (e) { console.error(e); showTitle(); } }
function startChapter(def) {
  var tw = def.twist, bonus = {}, setup = def.setup || {}, o = def.opponent || {};
  if (tw) {
    if (tw.id === 'boss-silver') bonus[1] = { silver: tw.param || 0 };
    if (tw.id === 'boss-workers') bonus[1] = { workers: tw.param || 0 };
    if (tw.id === 'boss-vp') bonus[1] = { vp: tw.param || 0 };
    if (tw.id === 'boss-first') bonus[1] = { first: true };
    if (tw.id === 'you-workers') bonus[0] = { workers: -(tw.param || 1) };
  }
  var n = setup.players || 2, names = {}; for (var i = 1; i < n; i++) names[i] = i === 1 ? o.name : VB.SEATNAME[i];
  UI.lastOpts = { n: n, phases: setup.phases || 5, ai: o.aiLevel || 'normal', style: o.aiStyle || null, names: names, bonus: bonus, noBlack: tw && tw.id === 'no-black', mode: 'story', hints: !!def.hints };
  startGame(UI.lastOpts);
}
function metrics(G) {
  var p = G.P[0], best = 0; G.P.forEach(function (q, i) { if (i) best = Math.max(best, q.vp); });
  return { won: G.winner === 0, score: p.vp, margin: p.vp - best, regions: p.stat.regions, land: VB.estateFilled(p), sales: p.stat.sales, chain: p.stat.chain, silver: p.silver };
}
function testOk(t, M) { if (!t) return true; var v = M[t.k], op = t.op || '>=', x = t.v; if (x == null) return !!v; return op === '>=' ? v >= x : op === '<=' ? v <= x : op === '>' ? v > x : op === '<' ? v < x : v === x; }
function storyInit() {
  try {
    GXC.init({
      game: 'vale-of-banners', data: window.CAMPAIGN, startChapter: startChapter,
      isWon: function (G, def) { var M = metrics(G), g = def.goal || {}; var base = g.winNotNeeded ? true : M.won;
        if (g.type === 'score') return M.won && M.score >= g.value; if (g.type === 'margin') return M.margin >= g.value;
        if (g.type === 'custom') return base && testOk(def.stars[0].test, M); return base && testOk(def.stars[0].test, M); },
      metrics: metrics,
      portrait: function (who) { var st = String(who || ''); if (st.indexOf('portrait-') !== 0 && st.indexOf('boss-') !== 0) st = 'portrait-' + st; return ART.img[st] ? 'media/' + st + '.webp' : null; },
      onExit: function () { showTitle(); },
      scores: function (G) { return G.P.map(function (p) { return p.vp; }); },
      seats: function (G) { return G.seats.map(function (s, i) { return { name: s.name, me: i === 0, ai: s.human ? null : s.ai }; }); },
      headButtons: function () { var b = document.createElement('button'); b.type = 'button'; b.className = 'gxc-ib'; b.textContent = 'Tutorial'; b.addEventListener('click', function () { GXC.close(); tutStart(); }); return [b]; }
    });
  } catch (e) { console.error(e); }
}

/* ---------------- boot ---------------- */
function boot() {
  GX.init({ key: 'vob' });
  drawers(); helpInit(); storyInit(); musicInit();
  GX.onResize(function () { if (G) render(); });
  addEventListener('resize', function () { if (G) render(); });
  try { artLoad(); } catch (e) { }
  /* Story map: a tap on any chapter or head button always answers (locked chapters say why) */
  document.addEventListener('click', function (e) {
    var n = e.target.closest && e.target.closest('.gxc-node,.gxc-ib'); if (!n) return;
    var lab = n.getAttribute('aria-label') || n.textContent || ''; n.setAttribute('data-tapped', '1');
    setTimeout(function () { var m = [].slice.call(document.querySelectorAll('.gxc-node,.gxc-ib')).filter(function (x) { return x.getAttribute('aria-label') === lab || x.textContent === n.textContent; })[0]; if (m) m.setAttribute('data-tapped', String(Date.now() % 100000)); }, 80);
    setTimeout(function () { toast(/lock/i.test(lab) || n.disabled || n.classList.contains('locked') ? 'Win the chapter before to open this one' : lab.split(',')[0].trim()); }, 30);
  }, true);
  document.addEventListener('pointerdown', function () { try { GA.unlock(); } catch (e) { } musSync(); }, { once: true });
  if (window.GXS && GXS.on) return;   /* a scenario builds its own state */
  G = null; showTitle();
  if (!tutDone() && !hasSave()) { try { var st = GXT.status('vale-of-banners'); if (!st.seen) { $('#tutB') && $('#tutB').classList.add('glow'); } } catch (e) { } }
}
UI.forceEnd = function () { VB.forceEnd(G); render(); gameOver(); };
UI.redraw = function () { if (G) render(); };
window.startGame = startGame; window.showResult = showResult;
boot();
