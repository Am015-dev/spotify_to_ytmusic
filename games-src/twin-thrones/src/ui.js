// Twin Thrones UI: title, draft, pyramid, cities, military track, tokens, animations, result. All pictures go through TTA slots. (FLAG: none)
var TT_TEST = {};
(function () {
  var E = TT.E, AI = TT.AI, BY = TT.BYID;
  var U = { G: null, mode: 'cpu', lvl: 'normal', ai: [false, true], busy: false, sel: null, seq: 0, logs: [], aiTimer: 0 };
  var COLN = { brown: 'Raw', grey: 'Goods', blue: 'Civic', green: 'Science', yellow: 'Trade', red: 'War', purple: 'Guild' };
  var SYM = { wheel: 'Wh', scale: 'Sc', quill: 'Qu', mortar: 'Mo', sundial: 'Su', globe: 'Gl', law: 'La' };
  var RS = { wood: 'W', clay: 'C', stone: 'S', glass: 'G', papyrus: 'P' };
  var AGE = ['', 'I', 'II', 'III'];
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function slot(stem, cls) { return '<i class="art' + (cls ? ' ' + cls : '') + '" data-s="' + stem + '"></i>'; }
  function fillArt(root) { root.querySelectorAll('.art[data-s]').forEach(function (el) { TTA.fill(el, el.dataset.s); }); }
  function bgSlot(el, stem) { var u = TTA.url(stem); if (u && el) { el.style.backgroundImage = 'url("' + u + '")'; } }
  function delay() { return typeof window.AIDELAY === 'number' ? window.AIDELAY : 850; }
  function isAI(p) { return U.mode === 'watch' ? true : U.mode === 'cpu' ? p === 1 : false; }
  function name(p) { return U.mode === 'cpu' ? (p === 0 ? 'You' : 'Computer') : U.mode === 'two' ? 'Player ' + (p + 1) : (p === 0 ? 'Gold' : 'Teal') + ' (' + U.lvl + ')'; }
  function toast(t, ms) { var e = $('toast'); e.textContent = t; e.style.display = 'block'; clearTimeout(toast.t); toast.t = setTimeout(function () { e.style.display = 'none'; }, ms || 1600); }

  // ---------- card faces
  function costHtml(cost) {
    var h = ''; Object.keys(cost).forEach(function (k) { h += k === 'coin' ? '<span class="chip r-coin">$' + cost[k] + '</span>' : '<span class="chip r-' + k + '">' + RS[k] + (cost[k] > 1 ? cost[k] : '') + '</span>'; });
    return h || '<span class="chip r-free">free</span>';
  }
  function fxHtml(c) {
    var h = '';
    if (c.prod) for (var r in c.prod) h += '<span class="bdg pr">' + RS[r] + (c.prod[r] > 1 ? c.prod[r] : '') + '</span>';
    if (c.choice) h += '<span class="bdg pr">' + c.choice.map(function (r) { return RS[r]; }).join('/') + '</span>';
    if (c.price) h += '<span class="bdg pr">' + RS[c.price[0]] + ' $1</span>';
    if (c.shields) h += '<span class="bdg sh">' + c.shields + '</span>';
    if (c.sci) h += '<span class="bdg sc">' + SYM[c.sci] + '</span>';
    if (c.coin) h += '<span class="bdg co">$' + c.coin + '</span>';
    if (c.vp) h += '<span class="bdg vp">' + c.vp + '</span>';
    if (c.guild) h += '<span class="bdg vp">*</span>';
    return h;
  }
  var GLY = {
    brown: '<rect x="8" y="30" width="48" height="12" rx="6"/><rect x="14" y="16" width="36" height="12" rx="6"/>',
    grey: '<path d="M26 8h12v16l14 28a4 4 0 0 1-4 6H16a4 4 0 0 1-4-6l14-28z"/>',
    blue: '<rect x="12" y="10" width="40" height="8"/><rect x="18" y="20" width="8" height="32"/><rect x="38" y="20" width="8" height="32"/><rect x="10" y="52" width="44" height="6"/>',
    green: '<circle cx="32" cy="32" r="20"/><path d="M32 12v40M12 32h40" stroke="#fff" stroke-width="3" fill="none"/>',
    yellow: '<circle cx="32" cy="32" r="22"/><circle cx="32" cy="32" r="12" fill="none" stroke="#fff" stroke-width="3"/>',
    red: '<path d="M32 4l6 36H26zM20 40h24v6H20zM29 46h6v14h-6z"/>',
    purple: '<path d="M32 4l8 18 20 2-15 14 5 20-18-10-18 10 5-20L4 24l20-2z"/>'
  };
  function cardHtml(c, cw) {
    return '<div class="band">' + esc(c.nm) + '</div>' + slot(c.stem) + '<div class="glyph"><svg viewBox="0 0 64 64" fill="' + 'var(--cc)' + '" opacity=".55">' + (GLY[c.col] || '') + '</svg></div><div class="fx">' + fxHtml(c) + '</div><div class="costs">' + costHtml(c.cost) + (c.from ? '<span class="chip r-free" title="chain">&#8734;</span>' : '') + '</div>';
  }
  function cardEl(c, cw) {
    var d = document.createElement('div'); d.className = 'card'; d.style.setProperty('--cw', cw + 'px'); d.style.setProperty('--cc', 'var(--c-' + c.col + ')'); d.innerHTML = cardHtml(c, cw); fillArt(d); return d;
  }
  function describe(c) {
    var t = []; if (c.prod) for (var r in c.prod) t.push('makes ' + c.prod[r] + ' ' + r);
    if (c.choice) t.push('makes 1 of ' + c.choice.join('/') + ' each turn'); if (c.price) t.push('your ' + c.price[0] + ' costs 1 coin to trade');
    if (c.shields) t.push(c.shields + ' shield' + (c.shields > 1 ? 's' : '')); if (c.sci) t.push('science: ' + c.sci); if (c.coin) t.push('+' + c.coin + ' coins');
    if (c.perCol) t.push('coins for cards in your city'); if (c.guild) t.push('guild: points from the biggest city'); if (c.vp) t.push(c.vp + ' points');
    if (c.from) t.push('free if you own a chain symbol'); return t.join(', ') || 'a city card';
  }

  // ---------- board skeleton (built once per game so the pawn can slide)
  function buildBoard() {
    var bd = $('bd'); bd.innerHTML = '<div class="strip" id="s1"></div><div class="tokrow" id="tokrow"></div><div id="mil"></div><div id="pyr"></div><div class="strip" id="s0"></div>';
    var m = $('mil'), h = '<div class="cells">';
    for (var i = -9; i <= 9; i++) { var a = Math.abs(i); h += '<div class="c ' + (i === 0 ? 'mid' : a <= 2 ? 'z1' : a <= 5 ? 'z2' : a <= 8 ? 'z3' : 'z4') + '"></div>'; }
    h += '</div>'; var pos = function (v) { return (4 + 92 * (v + 9.5) / 19); };
    [-6, -3, 3, 6].forEach(function (v) { h += '<span class="tg" id="tg' + v + '" style="left:' + pos(v) + '%">' + (Math.abs(v) === 3 ? '2' : '5') + '$</span>'; });
    h += '<span class="nm" style="left:5%">' + esc(name(1)) + '</span><span class="nm" style="right:5%">' + esc(name(0)) + '</span><div id="pawn" class="art-host">' + slot('military-pawn') + '<i></i></div>';
    m.innerHTML = h; fillArt(m); bgSlot($('board'), 'table-bg');
  }
  function layoutDims() {
    var P = $('pyr'), W = P.clientWidth, H = P.clientHeight, rows = TT.LAYOUT[U.G.age] || TT.LAYOUT[1], n = rows.length, xm = 0;
    rows.forEach(function (r) { r.xs.forEach(function (x) { xm = Math.max(xm, Math.abs(x)); }); });
    var span = 2 * xm + 1.9, u = Math.min(W / span, H / (2.5 * (1 + 0.52 * (n - 1))), 60), w = 1.9 * u, h = 1.32 * w;
    return { u: u, w: w, h: h, step: h * 0.52, W: W, H: H, n: n, ox: W / 2, oy: (H - (h + (n - 1) * h * 0.52)) / 2 };
  }

  // ---------- render
  function strip(p) {
    var G = U.G, P = G.players[p], el = $('s' + p), sc = E.score(G, p), fp = E.fixedProd(G, p), ch = E.choiceProd(G, p), cur = E.sideToAct(G) === p;
    el.classList.toggle('act', cur);
    var h = '<button class="pill vp who" data-city="' + p + '" style="min-width:0">' + esc(name(p)) + '</button><span class="pill coin">$' + P.coins + '</span><span class="pill vp">' + sc.total + ' pts</span>';
    ['wood', 'clay', 'stone', 'glass', 'papyrus'].forEach(function (r) { var n = fp[r] || 0; h += '<span class="chip r-' + r + (n ? '' : ' empty') + '" style="--cw:130px;' + (n ? '' : 'opacity:.3') + '">' + RS[r] + n + '</span>'; });
    if (ch.length) h += '<span class="pill pill-ch vp">+' + ch.length + ' any</span>';
    var sci = E.sciCounts(G, p); Object.keys(sci).forEach(function (s) { h += '<span class="pill vp" style="background:#2d7a52">' + SYM[s] + (sci[s] > 1 ? 'x' + sci[s] : '') + '</span>'; });
    P.tokens.forEach(function (t) { h += '<button class="tok mini" data-tok="' + t + '" title="' + esc(BY[t].nm) + '"><span>' + esc(BY[t].nm.slice(0, 2)) + '</span>' + slot(BY[t].stem) + '</button>'; });
    h += '<span style="flex:1"></span>'; TT.COLS.forEach(function (c) { var n = E.count(G, p, c); if (n) h += '<span class="pill p-' + c + '" title="' + COLN[c] + '">' + n + '</span>'; });
    h += '<div class="wrow">'; P.wonders.forEach(function (w) {
      var d = BY[w.id]; h += '<button class="wt' + (w.card ? ' built' : G.built >= 7 ? ' dead' : '') + '" data-wonder="' + w.id + '"><span>' + esc(d.nm) + '</span>' + slot(d.stem) + '</button>';
    });
    for (var k = P.wonders.length; k < 4; k++) h += '<span class="wt dead" style="opacity:.15"></span>'; h += '</div>';
    el.innerHTML = h; fillArt(el);
  }
  function renderMil() {
    var G = U.G, pw = $('pawn'); pw.style.left = (4 + 92 * (G.mil + 9.5) / 19) + '%';
    [[3, 0], [6, 1]].forEach(function (z) { var a = $('tg' + z[0]), b = $('tg' + (-z[0])); if (a) a.style.visibility = G.loot[0][z[1]] ? 'hidden' : 'visible'; if (b) b.style.visibility = G.loot[1][z[1]] ? 'hidden' : 'visible'; });
  }
  function renderTokens() {
    var h = ''; U.G.tokensUp.forEach(function (t) { var d = BY[t]; h += '<button class="tok" data-tok="' + t + '" title="' + esc(d.nm + ': ' + d.text) + '"><span>' + esc(d.nm.slice(0, 3)) + '</span>' + slot(d.stem) + '</button>'; });
    $('tokrow').innerHTML = h; fillArt($('tokrow'));
  }
  function renderPyr(flips) {
    var G = U.G, P = $('pyr'), d = layoutDims(); P.innerHTML = '';
    var av = E.available(G).map(function (c) { return c.i; }), human = canAct();
    G.pyr.forEach(function (cell) {
      var c = BY[cell.id], e = document.createElement('div');
      e.className = 'card'; e.id = 'c' + cell.i; e.style.setProperty('--cw', d.w + 'px'); e.style.setProperty('--cc', 'var(--c-' + c.col + ')');
      e.style.width = d.w + 'px'; e.style.height = d.h + 'px'; e.style.left = (d.ox + cell.x * d.u - d.w / 2) + 'px'; e.style.top = (d.oy + cell.r * d.step) + 'px'; e.style.zIndex = cell.r + 1;
      if (cell.taken) e.classList.add('taken');
      else if (!cell.up) { e.classList.add('down', 'a' + G.age); var b = document.createElement('div'); b.className = 'back'; e.appendChild(b); }
      else { e.innerHTML = cardHtml(c, d.w); fillArt(e); }
      if (flips && flips.indexOf(cell.i) >= 0) e.classList.add('pop');
      if (!cell.taken && av.indexOf(cell.i) >= 0) {
        if (cell.up || true) { e.classList.add('av'); if (!human) e.classList.add('dim'); e.setAttribute('role', 'button'); e.tabIndex = 0; if (U.sel === cell.i) e.classList.add('sel'); }
      }
      P.appendChild(e);
    });
    if (human && U.G.turn === 0 && G.log.length === 0 && U.sel == null && av.length && !U.fingerDone) {
      var f = document.createElement('div'); f.id = 'finger'; f.textContent = '☝'; var t = $('c' + av[0]); f.style.left = (parseFloat(t.style.left) + d.w / 2 - 10) + 'px'; f.style.top = (parseFloat(t.style.top) + d.h / 2) + 'px'; P.appendChild(f);
    }
  }
  function renderDraft() {
    var G = U.G, P = $('pyr'), human = canAct(); P.innerHTML = '';
    var d = document.createElement('div'); d.id = 'draft';
    G.draft.avail.forEach(function (id) {
      var w = BY[id], b = document.createElement('button'); b.className = 'wcard'; b.dataset.pick = id; if (!human) b.disabled = true;
      b.innerHTML = slot(w.stem) + '<b>' + esc(w.nm) + '</b><small>' + esc(w.text) + '</small><div class="costs">' + costHtml(w.cost) + '</div>'; d.appendChild(b);
    });
    P.appendChild(d); fillArt(d);
  }
  function canAct() { return !U.busy && U.G && !U.G.over && !isAI(E.sideToAct(U.G)); }
  function dock() {
    var G = U.G, p = E.sideToAct(G), msg = $('msg'), sub = $('sub'), acts = $('acts'), dt = $('dt'); acts.innerHTML = ''; sub.textContent = '';
    if (G.over) { dt.textContent = 'Game over'; msg.textContent = 'Final result'; return; }
    var human = canAct(), pd = G.pend[0];
    dt.textContent = human ? (U.mode === 'two' ? name(p) + ': your move' : 'Your move') : isAI(p) ? name(p) + ' thinks' : 'Wait';
    if (!human) { msg.textContent = isAI(p) ? name(p) + ' is thinking...' : 'Wait...'; return; }
    var M = E.validMoves(G);
    if (pd && pd.type === 'first') {
      msg.textContent = 'Age ' + AGE[G.age] + ': who starts?';
      acts.innerHTML = '<button class="btn" data-first="' + p + '">I start</button><button class="btn alt" data-first="' + (1 - p) + '">Rival starts</button>';
    } else if (pd && pd.type === 'token') {
      msg.textContent = 'Pick a progress token'; var l = pd.from === 'lib' ? pd.list : G.tokensUp;
      acts.innerHTML = '<div class="picker">' + l.map(function (t) { var d = BY[t]; return '<button class="tk" data-token="' + t + '"><b>' + esc(d.nm) + '</b>' + esc(d.text) + '</button>'; }).join('') + '</div>';
    } else if (pd && pd.type === 'destroy') {
      msg.textContent = 'Discard a rival card';
      acts.innerHTML = '<div class="picker">' + pd.list.map(function (t) { var d = BY[t]; return '<button class="tk" data-destroy="' + t + '"><b>' + esc(d.nm) + '</b>' + esc(COLN[d.col]) + '</button>'; }).join('') + '</div>';
    } else if (pd && pd.type === 'revive') {
      msg.textContent = 'Revive a discarded card';
      acts.innerHTML = '<div class="picker">' + G.discard.map(function (t) { var d = BY[t]; return '<button class="tk" data-revive="' + t + '"><b>' + esc(d.nm) + '</b>' + esc(describe(d)) + '</button>'; }).join('') + '</div>';
    } else if (G.phase === 'draft') {
      msg.textContent = 'Pick a wonder'; sub.textContent = 'Each of you takes four.';
    } else if (U.sel != null) {
      var cell = G.pyr[U.sel], c = BY[cell.id], bi = E.buildInfo(G, p, c), has = function (t, w) { return M.some(function (m) { return m.t === t && m.i === cell.i && (w == null || m.w === w); }); };
      msg.textContent = c.nm; sub.textContent = describe(c) + '. Cost: ' + (bi.chain ? 'free by chain' : bi.coins + ' coin' + (bi.coins === 1 ? '' : 's') + (bi.trade ? ' (' + bi.trade + ' for trade)' : ''));
      var h = '<button class="btn" data-a="build"' + (has('build') ? '' : ' disabled') + '>Build' + (bi.chain ? ' free' : ' · ' + bi.coins + '$') + '</button>';
      h += '<button class="btn alt" data-a="discard">Sell +' + E.discardGain(G, p) + '$</button>';
      G.players[p].wonders.forEach(function (w) { if (w.card) return; var wi = E.wonderInfo(G, p, w.id); h += '<button class="btn alt" data-a="wonder" data-w="' + w.id + '"' + (has('wonder', w.id) ? '' : ' disabled') + '>' + esc(BY[w.id].nm) + ' · ' + wi.coins + '$</button>'; });
      acts.innerHTML = h;
    } else {
      msg.textContent = 'Tap a glowing card'; sub.textContent = 'Build it, sell it for coins, or use it for a wonder.';
    }
  }
  function render(flips) {
    var G = U.G; if (!G) return;
    strip(0); strip(1); renderMil(); renderTokens();
    if (G.phase === 'draft') renderDraft(); else renderPyr(flips);
    dock(); logRender();
    if (G.over) showResult();
  }

  // ---------- moves + animation
  function rectOf(id) { var e = $(id); return e ? e.getBoundingClientRect() : null; }
  function flyCard(fromRect, html, to) {
    if (!fromRect || !to) return; var g = document.createElement('div'); g.className = 'card ghost'; g.style.cssText = 'left:' + fromRect.left + 'px;top:' + fromRect.top + 'px;width:' + fromRect.width + 'px;height:' + fromRect.height + 'px;--cw:' + fromRect.width + 'px';
    g.innerHTML = html; document.body.appendChild(g); var tr = to.getBoundingClientRect();
    var dx = tr.left + tr.width / 2 - (fromRect.left + fromRect.width / 2), dy = tr.top + tr.height / 2 - (fromRect.top + fromRect.height / 2);
    var a = g.animate([{ transform: 'none', opacity: 1 }, { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(.2)', opacity: .15 }], { duration: Math.max(60, Math.min(520, delay() * 0.7 + 80)), easing: 'ease-in' });
    a.onfinish = function () { g.remove(); };
  }
  function popNum(txt, near) {
    var r = near.getBoundingClientRect(), e = document.createElement('div'); e.className = 'pop-n'; e.textContent = txt; e.style.left = (r.left + r.width / 2 - 14) + 'px'; e.style.top = (r.top) + 'px'; document.body.appendChild(e); setTimeout(function () { e.remove(); }, 1000);
  }
  function lineOf(ev, G) {
    var nm = function (p) { return name(p); };
    switch (ev.t) {
      case 'pick': return nm(ev.p) + ' takes ' + BY[ev.w].nm;
      case 'build': return nm(ev.p) + ' builds ' + BY[ev.id].nm + (ev.paid ? ' (' + ev.paid + '$)' : ev.chain ? ' (chain)' : '');
      case 'discard': return nm(ev.p) + ' sells ' + BY[ev.id].nm + ' (+' + ev.n + '$)';
      case 'wonder': return nm(ev.p) + ' raises ' + BY[ev.w].nm;
      case 'token': return nm(ev.p) + ' takes ' + BY[ev.id].nm;
      case 'mil': return 'Conflict pawn moves ' + ev.n + ' toward ' + nm(ev.p);
      case 'loot': return nm(ev.p) + ' loses ' + ev.n + ' coins to looting';
      case 'destroy': return BY[ev.id].nm + ' is discarded from ' + nm(ev.p);
      case 'revive': return nm(ev.p) + ' revives ' + BY[ev.id].nm;
      case 'age': return 'Age ' + AGE[ev.age] + ' begins';
      case 'first': return nm(ev.who) + ' will start the age';
      case 'end': return 'Game over: ' + ev.reason;
    }
    return '';
  }
  function doMove(m) {
    var G = U.G, p = E.sideToAct(G), prevUp = {}, pre = null, preHtml = '';
    if (m.i != null) { pre = rectOf('c' + m.i); var c = BY[G.pyr[m.i].id]; preHtml = cardHtml(c, pre ? pre.width : 60); var ghostCol = c.col; }
    G.pyr.forEach(function (c) { prevUp[c.i] = c.up; });
    E.apply(G, m); U.sel = null; U.fingerDone = true; U.seq++;
    var flips = []; G.pyr.forEach(function (c) { if (c.up && !prevUp[c.i] && !c.taken) flips.push(c.i); });
    G.ev.forEach(function (ev) { var l = lineOf(ev, G); if (l) { U.logs.push(l); G.log.push(l); } });
    render(flips);
    G.ev.forEach(function (ev) {
      var tgt = $('s' + p);
      if (ev.t === 'build' || ev.t === 'wonder') { if (pre) flyCard(pre, preHtml.replace(/class="/g, 'class="'), tgt); if (ev.paid) popNum('-' + ev.paid + '$', tgt); }
      else if (ev.t === 'discard') { if (pre) flyCard(pre, preHtml, tgt); popNum('+' + ev.n + '$', tgt); }
      else if (ev.t === 'loot') popNum('-' + ev.n + '$', $('s' + ev.p));
      else if (ev.t === 'mil') { $('pawn').classList.add('slide'); setTimeout(function () { $('pawn').classList.remove('slide'); }, 900); }
      else if (ev.t === 'age') toast('Age ' + AGE[ev.age] + ' begins', 1800);
    });
    if (G.ev.some(function (e) { return e.t === 'age'; })) $('pyr').querySelectorAll('.card').forEach(function (e) { e.classList.add('pop'); });
    after();
  }
  function after() {
    var G = U.G; if (G.over) return;
    var p = E.sideToAct(G); clearTimeout(U.aiTimer);
    if (isAI(p)) {
      U.busy = true; render0();
      U.aiTimer = setTimeout(function () {
        var seq = U.seq, rng = function () { return E.rnd(G); }, lv = U.mode === 'watch' ? U.lvl : U.lvl, m = AI.pick(G, lv, rng);
        if (!m) { U.busy = false; return; }
        if (m.i != null) { var e = $('c' + m.i); if (e) e.classList.add('aipick'); }
        setTimeout(function () { if (seq !== U.seq || U.G !== G) return; U.busy = false; doMove(m); }, Math.min(500, delay() * 0.6 + 40));
      }, delay());
    } else { U.busy = false; render0(); }
  }
  function render0() { dock(); if (U.G.phase !== 'draft') { var P = $('pyr'); P.querySelectorAll('.card.av').forEach(function (e) { e.classList.toggle('dim', !canAct()); }); } else renderDraft(); strip(0); strip(1); }

  // ---------- screens
  function showStart() {
    var s = $('start'); clearTimeout(U.aiTimer); U.busy = true; $('res').hidden = true; s.hidden = false; bgSlot(s, 'title-bg');
    var lv = U.lvl; s.innerHTML = '<h1>Twin Thrones</h1><p>Two rival cities, one pyramid of cards. Out-build, out-think, or out-march your rival.</p>' +
      '<div class="seg" id="lvls">' + ['easy', 'normal', 'hard'].map(function (l) { return '<button class="btn alt' + (l === lv ? ' on' : '') + '" data-lvl="' + l + '">' + l + '</button>'; }).join('') + '</div>' +
      '<button class="btn" data-start="1">Play vs computer</button><button class="btn alt" data-start="2">Two players, one device</button><button class="btn alt" data-start="0">Watch two computers</button>' +
      '<button class="btn alt" data-gx="rulesd" style="max-width:300px">How to play</button>';
  }
  function newGame(mode, seed) {
    U.mode = mode; U.ai = [mode === 'watch', mode !== 'two']; U.G = E.newGame({ seed: seed }); U.logs = []; U.sel = null; U.fingerDone = false; U.busy = false; U.seq++;
    $('start').hidden = true; $('res').hidden = true; buildBoard(); toast('Draft four wonders each', 1800); render(); after();
  }
  function reasonText(G) {
    return { military: 'Military supremacy: the conflict pawn reached the rival capital.', science: 'Science supremacy: six different symbols.', points: 'Victory on points.', tiebreak: 'Won the tie on civic points.', draw: 'A perfect draw.' }[G.reason] || G.reason;
  }
  function showResult() {
    var G = U.G, r = $('res'); if (!r.hidden) return; clearTimeout(U.aiTimer); U.busy = true; r.hidden = false;
    var win = G.winner >= 0 && (U.mode !== 'cpu' || G.winner === 0); bgSlot(r, win ? 'result-victory' : 'result-defeat');
    var head = G.winner < 0 ? 'A draw' : U.mode === 'cpu' ? (G.winner === 0 ? 'You win!' : 'Computer wins') : name(G.winner) + ' wins!';
    var h = '<h2>' + esc(head) + '</h2><p>' + esc(reasonText(G)) + '</p>';
    if (G.final) { var a = G.final[0], b = G.final[1]; h += '<table><tr><th></th><th>' + esc(name(0)) + '</th><th>' + esc(name(1)) + '</th></tr>';
      [['Civic', 'blue'], ['Science', 'green'], ['Trade', 'yellow'], ['Guilds', 'guild'], ['Wonders', 'wonder'], ['Tokens', 'token'], ['Coins', 'coins'], ['Conflict', 'mil'], ['Total', 'total']].forEach(function (k) { h += '<tr><td>' + k[0] + '</td><td>' + a[k[1]] + '</td><td>' + b[k[1]] + '</td></tr>'; }); h += '</table>'; }
    h += '<button class="btn" data-again="1">Play again</button><button class="btn alt" data-title="1">Title</button>'; r.innerHTML = h;
  }

  // ---------- drawers
  function logRender() { var b = $('logbox'); b.innerHTML = '<ol>' + U.logs.slice(-80).reverse().map(function (l) { return '<li>' + esc(l) + '</li>'; }).join('') + '</ol>'; }
  function cardsRender() {
    var b = $('cardsbox'); if (b.dataset.done) return; b.dataset.done = 1; var h = '';
    [1, 2, 3].forEach(function (a) { h += '<h3>Age ' + AGE[a] + '</h3><div class="ref" id="ref' + a + '"></div>'; }); b.innerHTML = h;
    TT.CARDS.forEach(function (c) { var w = document.createElement('div'); w.className = 'rc'; w.appendChild(cardEl(c, 86)); $('ref' + c.age).appendChild(w); });
  }
  function rulesRender() {
    $('rulesbox').innerHTML = '<h3>The goal</h3><p>Win by marching the conflict pawn to the rival capital, by collecting six different science symbols, or by having the most points after Age III.</p><h3>Your turn</h3><p>Take one uncovered card from the pyramid. <b>Build</b> it by paying its cost (missing resources are bought from the bank at 2 coins plus what your rival produces), <b>sell</b> it for 2 coins plus 1 per trade card you own, or <b>use it to raise a wonder</b>. Face-down cards flip when nothing covers them.</p><h3>Chains</h3><p>A card with an infinity mark is free when you own the matching symbol.</p><h3>Conflict</h3><p>Shields push the pawn toward your rival. Passing the marked spaces loots coins from them.</p><h3>Science</h3><p>A matching pair of symbols lets you pick a progress token.</p><h3>Wonders</h3><p>Four each, but only seven can ever be built in total.</p>';
  }
  function showCity(p) {
    var G = U.G, b = $('cityd').querySelector('.gx-drawer-body'), h = '<h3>' + esc(name(p)) + '</h3><div class="ref" id="cityref"></div>'; b.innerHTML = h; var c = $('cityref');
    G.players[p].cards.concat(G.players[p].wonders.filter(function (w) { return w.card; }).map(function (w) { return w.id; })).forEach(function (id) { var w = document.createElement('div'); w.className = 'rc'; w.appendChild(cardEl(BY[id], 86)); c.appendChild(w); });
    if (!c.children.length) c.textContent = 'No cards yet.'; GX.show('cityd');
  }

  // ---------- input
  function step(m) { if (!canAct()) return; doMove(m); }
  document.addEventListener('click', function (ev) {
    var t = ev.target, q = function (s) { return t.closest ? t.closest(s) : null; }, b;
    if ((b = q('[data-lvl]'))) { U.lvl = b.dataset.lvl; $('lvls').querySelectorAll('.btn').forEach(function (x) { x.classList.toggle('on', x === b); }); return; }
    if ((b = q('[data-start]'))) { var k = b.dataset.start; var sd = +(new URLSearchParams(location.search).get('seed')) || undefined; newGame(k === '1' ? 'cpu' : k === '2' ? 'two' : 'watch', U.first ? undefined : sd); U.first = true; return; }
    if ((b = q('[data-again]'))) { newGame(U.mode); return; }
    if (q('[data-title]')) { showStart(); return; }
    if (q('#menubtn')) { GX.show('menud'); return; }
    if (q('[data-menu="title"]')) { GX.close(); showStart(); return; }
    if (!U.G) return;
    if ((b = q('[data-city]'))) { showCity(+b.dataset.city); return; }
    if ((b = q('[data-tok]'))) { var d = BY[b.dataset.tok]; toast(d.nm + ': ' + d.text, 2600); return; }
    if ((b = q('[data-wonder]'))) { var w = BY[b.dataset.wonder]; toast(w.nm + ': ' + w.text, 2800); return; }
    if ((b = q('[data-pick]'))) { step({ t: 'pick', w: b.dataset.pick }); return; }
    if ((b = q('[data-first]'))) { step({ t: 'first', who: +b.dataset.first }); return; }
    if ((b = q('[data-token]'))) { step({ t: 'token', id: b.dataset.token }); return; }
    if ((b = q('[data-destroy]'))) { step({ t: 'destroy', id: b.dataset.destroy }); return; }
    if ((b = q('[data-revive]'))) { step({ t: 'revive', id: b.dataset.revive }); return; }
    if ((b = q('[data-a]'))) { if (b.disabled || U.sel == null) return; var a = b.dataset.a; step(a === 'wonder' ? { t: 'wonder', i: U.sel, w: b.dataset.w } : { t: a, i: U.sel }); return; }
    if ((b = q('.card.av')) && canAct() && !U.G.pend.length && U.G.phase === 'play') {
      var i = +b.id.slice(1); U.sel = U.sel === i ? null : i; U.fingerDone = true; renderPyr(); dock(); GX.showDock && GX.showDock(); return;
    }
  });
  document.addEventListener('keydown', function (e) { if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('card') && e.target.classList.contains('av')) { e.preventDefault(); e.target.click(); } });
  window.addEventListener('resize', function () { if (U.G && U.G.phase !== 'draft' && !U.G.over) renderPyr(); });
  if (window.GX) GX.onResize(function () { if (U.G && U.G.phase !== 'draft' && $('pyr').children.length) renderPyr(); });

  // ---------- boot
  function boot() {
    GX.init({ key: 'tt' });
    ['cardsbox','logbox','rulesbox'].forEach(function (i) { $(i).hidden = false; });
    GX.drawer('cardsd', 'All cards', $('cardsbox'), true); GX.drawer('logd', 'Log', $('logbox')); GX.drawer('rulesd', 'How to play', $('rulesbox'));
    var cd = GX.drawer('cityd', 'City', null); var md = document.createElement('div'); md.innerHTML = '<p><button class="btn alt" data-menu="title">Back to title</button></p>'; GX.drawer('menud', 'Menu', md);
    rulesRender(); var oldShow = GX.onShow; GX.onShow = function (id) { if (id === 'cardsd') cardsRender(); if (oldShow) oldShow(id); };
    showStart();
  }
  TT_TEST.U = U; TT_TEST.E = E;
  TT_TEST.forceEnd = function (seat) { var G = U.G; G.over = true; G.winner = seat; G.reason = 'military'; G.pend = []; render(); };
  TT.U = U;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
