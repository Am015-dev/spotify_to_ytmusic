// Twin Thrones UI: title, draft, pyramid, cities, military track, tokens, animations, result. All pictures go through TTA slots. (FLAG: none)
var TT_TEST = {};
(function () {
  var E = TT.E, AI = TT.AI, BY = TT.BYID;
  var U = { hintsOn: (function () { try { return localStorage.getItem('tt_hints') === '1'; } catch (e) { return false; } })(), G: null, mode: 'cpu', lvl: 'normal', ai: [false, true], busy: false, sel: null, seq: 0, logs: [], aiTimer: 0 };
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
  function name(p) { return U.mode === 'cpu' ? (p === 0 ? 'You' : (U.rivalName || (U.camp ? U.camp.opponent.name : 'Rival'))) : U.mode === 'two' ? 'Player ' + (p + 1) : (p === 0 ? 'Gold' : 'Teal') + ' (' + U.lvl + ')'; }
  function toast(t, ms) { var e = $('toast'); e.textContent = ''; e.textContent = t; e.style.display = 'block'; clearTimeout(toast.t); toast.t = setTimeout(function () { e.style.display = 'none'; }, ms || 1600); }

  // ---------- turn layer: the always-visible instruction line, the turn banner, and step-by-step captions (tap to speed up)
  function whoTag(p) { return isAI(p) ? name(p) + (U.mode === 'cpu' ? "'s turn" : ' plays') : U.mode === 'two' ? name(p) + "'s turn" : 'Your turn'; }
  function setInstr(tag, kind, text) { var e = $('instr'); if (!e) return; e.dataset.k = kind; e.querySelector('.tg').textContent = tag; e.querySelector('.tx').textContent = text; }
  function banner(text, kind, ms) {
    var b = $('banner'); if (!b) return; ms = ms || Math.max(560, delay() * 1.05); b.className = 'k-' + kind; b.textContent = text; b.style.display = 'block'; b.style.animation = 'none'; void b.offsetWidth; b.style.animation = 'bann ' + ms + 'ms ease forwards';
    clearTimeout(banner.t); banner.t = setTimeout(function () { b.style.display = 'none'; }, ms + 30);
  }
  function stepMs() { return U.fast ? 70 : Math.max(60, delay() * (U.tut ? 0.5 : 0.85)); }
  function narrate(items, done) {
    var i = 0, seq = U.seq; U.narr = true; U.fast = false; clearTimeout(U.nt);
    function next() {
      clearTimeout(U.nt); if (seq !== U.seq) { U.narr = false; return; }
      if (i >= items.length) { U.narr = false; U.skipNarr = null; if (done) done(); return; }
      var it = items[i++]; setInstr(it.tag, it.kind, it.text); if (it.fn) { try { it.fn(); } catch (e) { console.error(e); } }
      U.nt = setTimeout(next, U.fast ? 70 : delay() >= 300 ? readMs(it.text) : stepMs() + (it.extra || 0));
    }
    U.skipNarr = function () { U.fast = true; next(); }; next();
  }
  function readMs(t) { var w = String(t || '').split(/\s+/).length; return 4000 + 1000 * Math.ceil(w / 10); }
  function plural(n, w) { return n + ' ' + w + (n === 1 ? '' : 's'); }
  function snapState() { var G = U.G; return { av: E.available(G).map(function (c) { return c.i; }), sc: [E.score(G, 0).total, E.score(G, 1).total], coins: [G.players[0].coins, G.players[1].coins] }; }
  // the plain sentences of one move, in the order they are shown: what happened, why it scored, what moved, what is free now
  function moveItems(G, evs, p, snap) {
    var it = [], tag = function (q) { return q === 0 && U.mode === 'cpu' ? 'You' : name(q); }, kindOf = function (q) { return isAI(q) ? 'rival' : 'you'; };
    var who = function (q) { return U.mode === 'cpu' && q === 0 ? 'You' : name(q); }, verb = function (q, a, b) { return (U.mode === 'cpu' && q === 0) ? a : b; };
    evs.forEach(function (ev) {
      var k = kindOf(ev.p != null ? ev.p : p), tg = who(ev.p != null ? ev.p : p);
      if (ev.t === 'pick') it.push({ tag: tg, kind: k, text: fit(who(ev.p) + verb(ev.p, ' take ', ' takes ') + BY[ev.w].nm, BY[ev.w].text) });
      else if (ev.t === 'build') { var c = BY[ev.id]; it.push({ tag: tg, kind: k, text: who(ev.p) + verb(ev.p, ' build ', ' builds ') + c.nm + (ev.paid ? ', paying ' + plural(ev.paid, 'coin') + '.' : ev.chain ? ' free (chain symbol).' : ' free.') + ' ' + cap(describe(c)) + '.' }); }
      else if (ev.t === 'discard') it.push({ tag: tg, kind: k, text: who(ev.p) + verb(ev.p, ' sell ', ' sells ') + BY[ev.id].nm + ' for +' + plural(ev.n, 'coin') + '.' });
      else if (ev.t === 'wonder') it.push({ tag: tg, kind: k, text: fit(who(ev.p) + verb(ev.p, ' raise ', ' raises ') + BY[ev.w].nm, BY[ev.w].text) });
      else if (ev.t === 'token') it.push({ tag: tg, kind: k, text: fit(who(ev.p) + verb(ev.p, ' take ', ' takes ') + BY[ev.id].nm, BY[ev.id].text) });
      else if (ev.t === 'destroy') it.push({ tag: tg, kind: k, text: BY[ev.id].nm + ' is thrown away from ' + who(ev.p) + (ev.p === 0 && U.mode === 'cpu' ? 'r city.' : "'s city.") });
      else if (ev.t === 'revive') it.push({ tag: tg, kind: k, text: who(ev.p) + verb(ev.p, ' rebuild ', ' rebuilds ') + BY[ev.id].nm + ' for free.' });
      else if (ev.t === 'first') it.push({ tag: tg, kind: kindOf(ev.who), text: who(ev.who) + verb(ev.who, ' will start ', ' will start ') + 'the new age.' });
    });
    if (G.phase === 'play' && snap) {
      var d = E.score(G, p).total - snap.sc[p], act = evs.filter(function (e) { return e.t === 'build' || e.t === 'wonder' || e.t === 'token'; })[0];
      if (d > 0 && act) { var nmx = act.t === 'wonder' ? BY[act.w].nm : BY[act.id].nm; it.push({ tag: who(p), kind: kindOf(p), text: '+' + plural(d, 'point') + ' for ' + nmx + (act.t === 'wonder' ? ' (wonder)' : act.t === 'token' ? ' (progress token)' : ' (' + COLN[BY[act.id].col].toLowerCase() + ' card)') + '.', fn: function () { popNum('+' + d + ' ' + nmx, $('pts' + p) || $('s' + p), 'pts'); } }); }
      evs.forEach(function (ev) {
        if (ev.t === 'mil') it.push({ tag: 'Conflict', kind: kindOf(p), text: 'The pawn moves ' + plural(ev.n, 'step') + ' toward ' + (U.mode === 'cpu' ? (ev.p === 0 ? 'the rival city' : 'your city') : name(1 - ev.p) + "'s city") + '.' });
        if (ev.t === 'loot') it.push({ tag: 'Looted', kind: kindOf(p), text: who(ev.p) + verb(ev.p, ' lose ', ' loses ') + plural(ev.n, 'coin') + ': the pawn passed a marked space.', fn: function () { popNum('-' + ev.n + '$', $('s' + ev.p)); } });
      });
      var pdn = G.pend[0]; if (pdn && pdn.type === 'token' && pdn.from !== 'lib') it.push({ tag: who(pdn.pl), kind: kindOf(pdn.pl), text: 'A matching pair of symbols! ' + (isAI(pdn.pl) ? who(pdn.pl) + ' picks' : 'Pick') + ' a progress token.' });
      if (it.length < 4 && !evs.some(function (e) { return e.t === 'age'; })) {
        var fresh = E.available(G).filter(function (c) { return snap.av.indexOf(c.i) < 0; }).map(function (c) { return c.i; });
        if (fresh.length) it.push({ tag: 'Pyramid', kind: 'info', text: 'Now free to take: ' + fresh.slice(0, 3).map(function (i) { return BY[G.pyr[i].id].nm; }).join(', ') + (fresh.length > 3 ? '...' : '') + '.', fn: function () { fresh.forEach(function (i) { var e = $('c' + i); if (e) { e.classList.add('newfree'); setTimeout(function () { e.classList.remove('newfree'); }, 1400); } }); } });
      }
    }
    evs.forEach(function (ev) { if (ev.t === 'age') it.push({ tag: 'Age ' + AGE[ev.age], kind: 'info', text: 'Age ' + AGE[ev.age] + ' begins: a fresh pyramid.', }); });
    if (U.tut && window.TT_TUTOR && TT_TUTOR.takeReaction) { var rx = TT_TUTOR.takeReaction(); if (rx) it.push({ tag: rx.tag, kind: rx.tag === 'Pell' ? 'rival' : 'info', text: rx.text, extra: 500 }); }
    if (!it.length) it.push({ tag: who(p), kind: kindOf(p), text: '...' });
    return it;
  }
  function wtx(t) { return String(t).replace(/play again/g, 'take another turn'); }
  function fit(a, b) { b = wtx(b); var t = a + ': ' + b; return t.split(/\s+/).length <= 12 ? t + '.' : a + '.'; }
  function cap(t) { return t ? t.charAt(0).toUpperCase() + t.slice(1) : t; }
  // the rival's intention, said before it acts (the card is lifted while this shows)
  function intentLine(G, p, m) {
    var tg = name(p);
    if (m.t === 'pick') return tg + ' eyes ' + BY[m.w].nm + '.';
    if (m.t === 'first') return tg + ' decides who starts the age.';
    if (m.t === 'token') return tg + ' studies the progress tokens.';
    if (m.t === 'destroy') return tg + ' picks one of your cards to throw away.';
    if (m.t === 'revive') return tg + ' looks through the thrown-away cards.';
    var c = BY[G.pyr[m.i].id]; return tg + ' takes ' + c.nm + (m.t === 'build' ? ' to build it.' : m.t === 'discard' ? ' to sell it for coins.' : ' to raise a wonder.');
  }

  // ---------- card faces
  var RN = { wood: 'wood', clay: 'clay', stone: 'stone', glass: 'glass', papyrus: 'papyrus' };
  function costHtml(cost, words) {
    var h = ''; Object.keys(cost).forEach(function (k) { h += k === 'coin' ? '<span class="chip r-coin' + (words ? ' wd' : '') + '" title="coins">' + slot('coin') + '<b>' + cost[k] + (words ? ' coin' + (cost[k] > 1 ? 's' : '') : '') + '</b></span>' : '<span class="chip r-' + k + (words ? ' wd' : '') + '" title="' + RN[k] + '">' + slot('res-' + k) + '<b>' + cost[k] + (words ? ' ' + RN[k] : '') + '</b></span>'; });
    return h || '<span class="chip r-free">free</span>';
  }
  function costWords(cost) { var t = []; Object.keys(cost).forEach(function (k) { t.push(cost[k] + ' ' + (k === 'coin' ? 'coin' + (cost[k] > 1 ? 's' : '') : RN[k])); }); return t.join(', ') || 'nothing (free)'; }
  // one plain line for the middle of a card: the key number and what it does
  function shortFx(c) {
    if (c.prod) { var r = Object.keys(c.prod)[0]; return '+' + c.prod[r] + ' ' + r; }
    if (c.choice) return 'any of ' + c.choice.length;
    if (c.price) return c.price.length > 1 ? 'cheap trade' : 'cheap ' + c.price[0];
    if (c.shields) return c.shields + (c.shields > 1 ? ' shields' : ' shield');
    if (c.sci) return 'science';
    if (c.coin) return '+' + c.coin + ' coins';
    if (c.vp) return c.vp + ' points';
    if (c.perCol || c.perWonder) return 'coins now';
    if (c.guild) return 'guild';
    return '';
  }
  function fxHtml(c) {
    var h = '';
    if (c.prod) for (var r in c.prod) h += '<span class="chip r-' + r + '" title="makes ' + r + '">' + slot('res-' + r) + '<b>+' + c.prod[r] + '</b></span>';
    if (c.choice) h += c.choice.map(function (r) { return '<span class="chip r-' + r + '" title="' + r + '"><b>+1</b></span>'; }).join('');
    if (c.price) h += c.price.map(function (r) { return '<span class="chip r-' + r + '" title="trade ' + r + ' for 1 coin"><b>$1</b></span>'; }).join('');
    if (c.shields) h += '<span class="bdg sh">' + slot('icon-shield') + '<b>' + c.shields + '</b></span>';
    if (c.sci) h += '<span class="bdg sc" title="science: ' + c.sci + '">' + slot('sci-' + c.sci) + '<span class="l">' + SYM[c.sci] + '</span></span>';
    if (c.coin) h += '<span class="bdg co">' + slot('coin') + '<b>$' + c.coin + '</b></span>';
    if (c.vp) h += '<span class="bdg vp">' + slot('icon-vp') + '<b>' + c.vp + '</b></span>';
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
  function efHtml(c) {
    var ic = function (st, n, cls) { return '<span class="e1' + (cls ? ' ' + cls : '') + '">' + slot(st) + (n != null ? '<b>' + n + '</b>' : '') + '</span>'; }, h = '';
    if (c.prod) for (var r in c.prod) h += ic('res-' + r, '+' + c.prod[r]);
    else if (c.choice) h += c.choice.map(function (r) { return ic('res-' + r, null, 'sm'); }).join('<i class="or">/</i>');
    else if (c.price) h += c.price.map(function (r) { return ic('res-' + r, null, 'sm'); }).join('') + '<b class="tx">1$</b>';
    if (c.shields) h += '<span class="e1 sh"><svg viewBox="0 0 20 22" width="18" height="20" aria-hidden="true"><path d="M10 1l8 3v7c0 5-4 8.5-8 10C6 19.5 2 16 2 11V4z" fill="#fff"/><path d="M10 4l5 2v5c0 3.4-2.6 5.8-5 7z" fill="#c9463a"/></svg><b>' + c.shields + '</b></span>';
    if (c.sci) h += ic('sci-' + c.sci, null, 'sc');
    if (c.coin) h += ic('coin', '+' + c.coin);
    if (c.perCol || c.perWonder) h += ic('coin', '+');
    if (c.vp) h += '<span class="e1 vp"><b>' + c.vp + (c.sci ? '' : c.vp === 1 ? ' pt' : ' pts') + '</b></span>';
    if (c.guild && !c.vp) h += '<b class="tx">guild</b>';
    return h;
  }
  function prHtml(c) {
    var h = ''; Object.keys(c.cost).forEach(function (k) { h += '<span class="c1">' + slot(k === 'coin' ? 'coin' : 'res-' + k) + '<b>' + c.cost[k] + '</b></span>'; });
    return h || '<span class="fr">Free</span>';
  }
  var SUF = ['house', 'blower', 'gazers', 'ground', 'arium', 'ecary', 'nade', 'acks', 'enal', 'tain', 'ment', 'ory'];
  function nmHy(nm) { return esc(nm).split(' ').map(function (w) { if (w.length < 8 || w.indexOf("'") >= 0) return w; for (var i = 0; i < SUF.length; i++) { var k = w.toLowerCase().lastIndexOf(SUF[i]); if (k > 2 && k + SUF[i].length === w.length) return w.slice(0, k) + '&shy;' + w.slice(k); } return w.slice(0, w.length - 4) + '&shy;' + w.slice(-4); }).join(' '); }
  function cardHtml(c, cw, tag) {
    return slot(c.stem) + '<div class="nm">' + nmHy(c.nm) + '</div><div class="ef">' + efHtml(c) + '</div><div class="pr">' + (tag || prHtml(c)) + '</div>';
  }
  // what YOU would pay for an uncovered card right now
  function priceTag(G, c) {
    var bi = E.buildInfo(G, U.mode === 'two' ? E.sideToAct(G) : 0, c);
    if (bi.chain) return { k: 'free', h: '<span class="fr">Free</span>' };
    if (bi.coins === 0) return { k: 'free', h: '<span class="fr">Free</span>' };
    return { k: bi.ok ? 'pay' : 'no', h: '<span class="c1 pay">' + slot('coin') + '<b>' + bi.coins + '</b></span>' };
  }
  function cardHtml0(c, cw) {
    return '<div class="band">' + esc(c.nm) + '</div>' + slot(c.stem) + '<div class="glyph"><svg viewBox="0 0 64 64" fill="' + 'var(--cc)' + '" opacity=".3">' + (GLY[c.col] || '') + '</svg><span class="sfx">' + esc(shortFx(c)) + '</span></div><div class="fx">' + fxHtml(c) + '</div><div class="costs">' + costHtml(c.cost) + (c.from ? '<span class="chip r-free" title="chain">&#8734;</span>' : '') + '</div>';
  }
  function cardEl(c, cw) {
    var d = document.createElement('div'); d.className = 'card' + (cw < 100 ? ' sm' : ''); d.dataset.col = c.col; d.style.setProperty('--cw', cw + 'px'); d.style.setProperty('--cc', 'var(--c-' + c.col + ')'); d.classList.add('v4'); d.innerHTML = cardHtml(c, cw); fillArt(d); return d;
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
    var bd = $('bd'); bd.innerHTML = '<div id="instr" data-k="you" data-fa-skip="1" aria-live="polite"><span class="tg"></span><span class="tx"></span><span class="trk" id="trk"></span></div><button id="goal" data-goal="1"><b>Goal:</b> most points, or win early by war or science</button><div class="strip" id="s1"></div><div id="mil"></div><div class="tokrow" id="tokrow"></div><div id="pyr"></div><div class="strip" id="s0"></div>';
    var m = $('mil'), h = '<div class="cells">';
    for (var i = -9; i <= 9; i++) { var a = Math.abs(i); h += '<div class="c ' + (i === 0 ? 'mid' : a <= 2 ? 'z1' : a <= 5 ? 'z2' : a <= 8 ? 'z3' : 'z4') + '"></div>'; }
    h += '</div>'; var pos = function (v) { return (4 + 92 * (v + 9.5) / 19); };
    [-6, -3, 3, 6].forEach(function (v) { h += '<span class="tg" id="tg' + v + '" style="left:' + pos(v) + '%">' + (Math.abs(v) === 3 ? '2' : '5') + '$</span>'; });
    h += '<div id="pawn" class="art-host">' + slot('military-pawn') + '<i></i></div>';
    m.innerHTML = h; fillArt(m); bgSlot($('board'), 'table-wood'); bgSlot($('pyr'), 'table-bg'); bgSlot(m, 'military-board');
  }
  function layoutDims() {
    var P = $('pyr'), W = P.clientWidth, H = P.clientHeight, rows = TT.LAYOUT[U.G.age] || TT.LAYOUT[1], n = rows.length, xm = 0;
    rows.forEach(function (r) { r.xs.forEach(function (x) { xm = Math.max(xm, Math.abs(x)); }); });
    var span = 2 * xm + 1.9, w = Math.min(1.9 * W / span, 124), h = Math.min(1.95 * w, 186), ms = Math.max(70, 0.5 * h);
    if (h + (n - 1) * ms > H) { h = Math.max(1.3 * w * 0 + 40, H - (n - 1) * ms); if (h < 1.4 * w) { h = H / (1 + 0.5 * (n - 1)); ms = 0.5 * h; w = Math.min(w, h / 1.4); } }
    var step = Math.max(ms, Math.min(0.8 * h, (H - h) / Math.max(1, n - 1))), u = w / 1.9;
    return { u: u, w: w, h: h, step: step, W: W, H: H, n: n, ox: W / 2, oy: Math.max(0, (H - (h + (n - 1) * step)) / 2) };
  }

  // ---------- render
  var COLS = ['brown', 'grey', 'yellow', 'blue', 'green', 'red', 'purple'];
  function strip(p) {
    var G = U.G, P = G.players[p], el = $('s' + p), sc = E.score(G, p), cur = E.sideToAct(G) === p;
    el.classList.toggle('act', cur);
    var h = '<div class="plate"><span class="pt">' + slot('portrait-p' + (p + 1)) + '</span><button class="who" data-city="' + p + '" aria-label="' + esc(name(p)) + ': city">' + esc(p === 0 && U.mode === 'cpu' ? 'You' : name(p)) + '</button>';
    h += '<span class="coins" id="coins' + p + '" title="coins">' + slot('coin') + '<b>' + P.coins + '</b></span><button class="pts" id="pts' + p + '" data-score="' + p + '" aria-label="Points: tap for the breakdown"><b>' + sc.total + '</b> pts</button>';
    var sci = E.sciCounts(G, p); h += '<span class="scis">'; Object.keys(sci).forEach(function (k) { h += '<span class="sci" title="' + k + '">' + slot('sci-' + k) + (sci[k] > 1 ? '<b>' + sci[k] + '</b>' : '') + '</span>'; }); h += '</span>';
    h += '<div class="wrow">'; P.wonders.forEach(function (w) {
      var d = BY[w.id]; h += '<button class="wt' + (w.card ? ' built' : G.built >= 7 ? ' dead' : '') + '" data-wonder="' + w.id + '" aria-label="Wonder: ' + esc(d.nm) + (w.card ? ' (built)' : '') + '">' + slot(d.stem) + '</button>';
    });
    for (var k = P.wonders.length; k < 4; k++) h += '<span class="wt empty"></span>'; h += '</div></div>';
    var by = {}; P.cards.forEach(function (id) { var c = BY[id]; (by[c.col] = by[c.col] || []).push(c); });
    h += '<div class="tab" data-city="' + p + '">';
    var any = false; COLS.forEach(function (col) { var l = by[col]; if (!l) return; any = true; h += '<span class="stk" data-col="' + col + '" style="--cc:var(--c-' + col + ');--n:' + l.length + '">' + l.map(function (c, j) { return '<i class="mc" style="--j:' + j + '">' + slot(c.stem) + '</i>'; }).join('') + (l.length > 1 ? '<b>' + l.length + '</b>' : '') + '</span>'; });
    if (!any) h += '<span class="emp">' + (p === 0 && U.mode === 'cpu' ? 'Your city: built cards land here' : esc(name(p)) + "'s city") + '</span>';
    h += '</div>';
    el.innerHTML = h; fillArt(el); bgSlot(el.querySelector('.tab'), 'city-board-p' + (p + 1));
  }
  // ---------- score bar: civic / science / war / wonders / coins for both sides, leader marked, danger line, turn tracker
  function sbreak(G, p) { var s = E.score(G, p); return { civ: s.blue + s.yellow + s.guild, sci: s.green + s.token, war: s.mil, won: s.wonder, coin: s.coins, tot: s.total }; }
  function renderScore() {
    var G = U.G, a = sbreak(G, 0), b = sbreak(G, 1);
    [0, 1].forEach(function (p) { var e = $('pts' + p); if (e) e.classList.toggle('lead', (p ? b.tot > a.tot : a.tot > b.tot)); });
    var age = G.phase === 'draft' ? 'Wonder draft<br>pick ' + Math.min(8, G.draft.n + 1) + ' of 8' : 'Age ' + AGE[G.age] + ' of III<br>' + G.pyr.filter(function (c) { return !c.taken; }).length + ' cards left';
    var d = '', k = '', sc0 = Object.keys(E.sciCounts(G, 0)).length, sc1 = Object.keys(E.sciCounts(G, 1)).length, toLoss = 9 + G.mil, toWin = 9 - G.mil;
    if (G.phase === 'play' && !G.over) {
      if (toLoss <= 4) { d = '&#9888; Pawn ' + toLoss + ' step' + (toLoss === 1 ? '' : 's') + '<br>from your city'; k = 'bad'; }
      else if (sc1 >= 4) { d = '&#9888; Rival has<br>' + sc1 + ' of 6 symbols'; k = 'bad'; }
      else if (toWin <= 4) { d = '&#9733; Pawn ' + toWin + ' step' + (toWin === 1 ? '' : 's') + '<br>from victory'; k = 'ok'; }
      else if (sc0 >= 4) { d = '&#9733; You have<br>' + sc0 + ' of 6 symbols'; k = 'ok'; }
    }
    var t = $('trk'); t.className = 'trk' + (k ? ' ' + k : ''); t.innerHTML = d || age; $('instr').dataset.d = k;
  }
  // what a move would do, computed on a copy of the game: points, coins, pawn steps, science
  function preview(G, p, m) {
    var g = E.clone(G); try { E.apply(g, m); } catch (e) { return ''; }
    var t = [], dp = E.score(g, p).total - E.score(G, p).total, dc = g.players[p].coins - G.players[p].coins, dm = (p === 0 ? g.mil - G.mil : G.mil - g.mil);
    if (m.t === 'build') { var cc = BY[G.pyr[m.i].id]; if (cc.prod) { var rk = Object.keys(cc.prod)[0]; t.push('+' + cc.prod[rk] + ' ' + rk + ' each turn'); } else if (cc.choice) t.push('1 of ' + cc.choice.join('/') + ' each turn'); else if (cc.price) t.push('cheaper ' + cc.price.join('/')); if (cc.gives) t.push('chain mark'); }
    if (dp) t.push((dp > 0 ? '+' : '') + dp + ' pts'); if (dc) t.push((dc > 0 ? '+' : '') + dc + ' coins'); if (dm) t.push('pawn ' + (dm > 0 ? '+' : '') + dm);
    var pd = g.pend[0]; if (pd && pd.type === 'token' && pd.from !== 'lib' && pd.pl === p) t.push('science pair: pick a token');
    else { var c0 = E.sciCounts(G, p), c1 = E.sciCounts(g, p), nd = Object.keys(c1).length; Object.keys(c1).forEach(function (k) { if ((c1[k] || 0) > (c0[k] || 0)) t.push('science ' + nd + ' of 6' + (c1[k] === 2 ? ' (pair)' : '')); }); }
    if (g.over && g.winner === p) t.push('wins the game!');
    return t.length ? t.join(' \u00b7 ') : 'no change';
  }
  function moveName(G, m) {
    if (m.t === 'discard') return 'selling ' + BY[G.pyr[m.i].id].nm; if (m.t === 'build') return 'building ' + BY[G.pyr[m.i].id].nm;
    if (m.t === 'wonder') return 'raising ' + BY[m.w].nm; return 'that';
  }
  // rating of the move just played: rank by the computer's own evaluation of the position after each legal move
  function rateMove(G, p, m) {
    try {
      var M = E.validMoves(G).filter(function (x) { return x.i != null; }), best = null, bv = -1e9, mv = null;
      M.forEach(function (x) { var g = E.clone(G); try { E.apply(g, x); } catch (e) { return; } var v = AI.ev(g, p); if (v > bv) { bv = v; best = x; } if (x.t === m.t && x.i === m.i && (x.w || null) === (m.w || null)) mv = v; });
      if (mv == null || best == null) return null; var d = bv - mv, same = best.t === m.t && best.i === m.i && (best.w || null) === (m.w || null);
      if (same || d <= 1) return { g: 'good', t: 'Good move: ' + (same ? 'the best choice here.' : 'about as good as any.') };
      if (d <= 3.5) return { g: 'okay', t: 'Okay move: ' + moveName(G, best) + ' was a bit better.' };
      return { g: 'poor', t: 'Poor move: ' + moveName(G, best) + ' was clearly better.' };
    } catch (e) { return null; }
  }
  function renderMil() {
    var G = U.G, pw = $('pawn'); pw.style.left = (4 + 92 * (G.mil + 9.5) / 19) + '%';
    [[3, 0], [6, 1]].forEach(function (z) { var a = $('tg' + z[0]), b = $('tg' + (-z[0])); if (a) a.style.visibility = G.loot[0][z[1]] ? 'hidden' : 'visible'; if (b) b.style.visibility = G.loot[1][z[1]] ? 'hidden' : 'visible'; });
  }
  function renderTokens() {
    var h = ''; U.G.tokensUp.forEach(function (t) { var d = BY[t]; h += '<button class="tok" data-tok="' + t + '" aria-label="Science bonus: ' + esc(d.nm) + '">' + slot(d.stem) + '</button>'; });
    $('tokrow').innerHTML = '<span class="tl">Science bonus</span>' + h + '<span class="tsp"></span><span id="bank" aria-label="Bank: sell cards here">' + slot('coin', 'b1') + slot('coin', 'b2') + slot('coin', 'b3') + '<em>Bank</em></span>'; fillArt($('tokrow'));
  }
  function renderPyr(flips) {
    var G = U.G, P = $('pyr'), d = layoutDims(); P.innerHTML = ''; P.classList.toggle('tight', d.step < 68); P.classList.toggle('vtight', d.step < 44);
    var av = E.available(G).map(function (c) { return c.i; }), human = canAct(), hintCell = -1;
    var bestCell = -1; if (U.hintsOn && human && G.phase === 'play' && !G.pend.length) { try { var bm = AI.pick(G, 'normal', function () { return 0.5; }); if (bm && bm.i != null) bestCell = bm.i; } catch (e) { } }
    if (U.camp && U.camp.hints && human && !U.tut && G.phase === 'play' && !G.pend.length) { try { var hm = AI.pick(G, 'normal', function () { return 0.5; }); if (hm && hm.i != null) hintCell = hm.i; } catch (e) { } }
    G.pyr.forEach(function (cell) {
      var c = BY[cell.id], e = document.createElement('div');
      e.className = 'card v4' + (d.w < 76 ? ' sm' : ''); e.dataset.col = c.col; e.id = 'c' + cell.i; e.style.setProperty('--cw', d.w + 'px'); e.style.setProperty('--cc', 'var(--c-' + c.col + ')');
      e.style.width = d.w + 'px'; e.style.height = d.h + 'px'; e.style.left = (d.ox + cell.x * d.u - d.w / 2) + 'px'; e.style.top = (d.oy + cell.r * d.step) + 'px'; e.style.zIndex = cell.r + 1;
      if (cell.taken) e.classList.add('taken');
      else if (!cell.up) { e.classList.add('down', 'a' + G.age); e.innerHTML = slot('back-age' + G.age) + '<div class="dn">Age ' + AGE[G.age] + '</div>'; fillArt(e); }
      else { var pt = av.indexOf(cell.i) >= 0 ? priceTag(G, c) : null; e.innerHTML = cardHtml(c, d.w, pt && pt.h); if (pt) e.classList.add('p-' + pt.k); fillArt(e); }
      if (!cell.taken && cell.up && E.covered(G, cell)) e.classList.add('cov');
      if (flips && flips.indexOf(cell.i) >= 0) e.classList.add('pop');
      if (U.camp && U.camp.hints && human && !U.tut && hintCell === cell.i) e.classList.add('hint');
      if (bestCell === cell.i && !cell.taken && cell.up && !E.covered(G, cell)) { e.classList.add('best'); e.insertAdjacentHTML('beforeend', '<i class="bv" title="Best value">&#9733;</i>'); }
      if (!cell.taken && av.indexOf(cell.i) >= 0) {
        if (cell.up || true) { e.classList.add('av'); if (!human) e.classList.add('dim'); e.setAttribute('role', 'button'); e.tabIndex = 0; if (U.sel === cell.i) e.classList.add('sel'); }
      }
      P.appendChild(e);
    });
    fitNames(P); if (U.hintsOn && human && U.G.turn === 0 && G.log.length === 0 && U.sel == null && av.length && !U.fingerDone) {
      var f = document.createElement('div'); f.id = 'finger'; f.textContent = '☝'; var t = $('c' + av[0]); f.style.left = (parseFloat(t.style.left) + d.w / 2 - 10) + 'px'; f.style.top = (parseFloat(t.style.top) + d.h / 2) + 'px'; P.appendChild(f);
    }
  }
  function fitNames(root) { root.querySelectorAll('.card.v4 .nm').forEach(function (e) { if (e.scrollWidth > e.clientWidth + 1) { e.classList.add('t1'); if (e.scrollWidth > e.clientWidth + 1) e.classList.add('t2'); } }); }
  function renderDraft() {
    var G = U.G, P = $('pyr'), human = canAct(); P.innerHTML = '';
    var d = document.createElement('div'); d.id = 'draft';
    G.draft.avail.forEach(function (id) {
      var w = BY[id], b = document.createElement('button'); b.className = 'wcard' + (human ? ' go' : ''); b.dataset.pick = id; if (!human) b.disabled = true;
      b.innerHTML = slot(w.stem) + '<b>' + esc(w.nm) + '</b><small>' + esc(wtx(w.text)) + '</small><div class="costs">' + costHtml(w.cost, true) + '</div>'; d.appendChild(b);
    });
    P.appendChild(d); fillArt(d);
  }
  function canAct() { return !U.busy && U.G && !U.G.over && !isAI(E.sideToAct(U.G)); }
  function dock() { dock0(); zoomRender(); }
  function instr(p, text) { if (U.narr) return; setInstr(whoTag(p), isAI(p) ? 'rival' : 'you', text); }
  function dock0() {
    var G = U.G, p = E.sideToAct(G), msg = $('msg'), sub = $('sub'), acts = $('acts'), dt = $('dt'); acts.innerHTML = ''; sub.textContent = '';
    if (G.over) { dt.textContent = 'Game over'; msg.textContent = 'Final result'; return; }
    var human = canAct(), pd = G.pend[0];
    dt.textContent = human ? (U.mode === 'two' ? name(p) + ': your move' : 'Your move') : isAI(p) ? name(p) + ' thinks' : 'Wait';
    if (!human && !U.narr && !isAI(p)) setInstr('Please wait', 'info', 'One moment...');
    if (!human) { msg.textContent = U.narr ? 'Turn in progress' : isAI(p) ? name(p) + ' is thinking...' : 'Wait...'; return; }
    var M = E.validMoves(G);
    if (pd && pd.type === 'first') {
      msg.textContent = 'Age ' + AGE[G.age] + ': who starts?'; instr(p, 'Choose who plays first in this age.');
      acts.innerHTML = '<button class="btn" data-first="' + p + '">I start</button><button class="btn alt" data-first="' + (1 - p) + '">Rival starts</button>';
    } else if (pd && pd.type === 'token') {
      msg.textContent = 'Progress token'; instr(p, 'Pick a progress token: a bonus you keep for the whole game.'); var l = pd.from === 'lib' ? pd.list : G.tokensUp;
      acts.innerHTML = '<div class="picker">' + l.map(function (t) { var d = BY[t]; return '<button class="tk" data-token="' + t + '"><b>' + esc(d.nm) + '</b>' + esc(d.text) + '</button>'; }).join('') + '</div>';
    } else if (pd && pd.type === 'destroy') {
      msg.textContent = 'Discard a rival card'; instr(p, 'Pick one rival card to throw away.');
      acts.innerHTML = '<div class="picker">' + pd.list.map(function (t) { var d = BY[t]; return '<button class="tk" data-destroy="' + t + '"><b>' + esc(d.nm) + '</b>' + esc(COLN[d.col]) + '</button>'; }).join('') + '</div>';
    } else if (pd && pd.type === 'revive') {
      msg.textContent = 'Revive a discarded card'; instr(p, 'Pick a thrown-away card to build for free.');
      acts.innerHTML = '<div class="picker">' + G.discard.map(function (t) { var d = BY[t]; return '<button class="tk" data-revive="' + t + '"><b>' + esc(d.nm) + '</b>' + esc(describe(d)) + '</button>'; }).join('') + '</div>';
    } else if (G.phase === 'draft') {
      msg.textContent = 'Wonder draft'; sub.textContent = ''; instr(p, 'Pick a wonder. You get 4.');
    } else if (U.sel != null) {
      var cell = G.pyr[U.sel], c = BY[cell.id], bi = E.buildInfo(G, p, c), has = function (t, w) { return M.some(function (m) { return m.t === t && m.i === cell.i && (w == null || m.w === w); }); };
      msg.textContent = c.nm; sub.textContent = describe(c) + '. Cost: ' + (bi.chain ? 'free by chain' : bi.coins + ' coin' + (bi.coins === 1 ? '' : 's') + (bi.trade ? ' (' + bi.trade + ' for trade)' : ''));
      instr(p, 'Build it, sell it, or use it for a wonder.');
    } else {
      msg.textContent = 'Tap a glowing card'; sub.textContent = ''; instr(p, U.hintsOn ? 'Tap a glowing card. The star is best.' : 'Tap or drag a glowing card.');
    }
  }
  // ---------- zoom: the tapped card big, every detail, and the three ways to use it
  function chainLines(c) {
    var l = [];
    if (c.from) { var src = TT.CARDS.filter(function (x) { return x.gives === c.from; })[0]; l.push('Free to build if you own ' + (src ? src.nm : 'its chain card') + '.'); }
    if (c.gives) { var nx = TT.CARDS.filter(function (x) { return x.from === c.gives; }).map(function (x) { return x.nm; }); if (nx.length) l.push('Gives a chain symbol: ' + nx.join(', ') + ' will be free later.'); }
    return l;
  }
  // places on the table where a lifted card can go: your city (build), the bank (sell), your wonders
  function placeRects(z) {
    var p = E.sideToAct(U.G), pad = 3;
    return z.map(function (q) {
      var el = q.m.t === 'build' ? document.querySelector('#s' + p + ' .tab') : q.m.t === 'discard' ? $('bank') : document.querySelector('#s' + p + ' [data-wonder="' + q.m.w + '"]');
      var r = el ? el.getBoundingClientRect() : { left: 10, top: 10, width: 80, height: 44 }, w = Math.max(r.width + 2 * pad, q.m.t === 'wonder' ? 0 : 56), h = Math.max(r.height + 2 * pad, 46);
      return { l: r.left + r.width / 2 - w / 2, t: r.top + r.height / 2 - h / 2, w: w, h: h };
    });
  }
  function placesHtml(z, tag, attr) {
    return placeRects(z).map(function (r, k) {
      var q = z[k], a = attr(q, k);
      return '<' + tag + ' class="place k-' + q.m.t + (q.ok ? ' ok' : ' no') + '" ' + a + ' style="left:' + r.l + 'px;top:' + r.t + 'px;width:' + r.w + 'px;height:' + r.h + 'px"><span class="pl">' + q.h + '</span></' + tag + '>';
    }).join('');
  }
  function zoomRender() {
    var z = $('zoom'), G = U.G; if (!z) return;
    if (!G || U.sel == null || G.over || G.phase !== 'play' || G.pend.length || !canAct()) { if (!z.hidden) { z.hidden = true; z.innerHTML = ''; } return; }
    var p = E.sideToAct(G), cell = G.pyr[U.sel], c = BY[cell.id], zs = dropZones(cell.i);
    var pr = $('pyr').getBoundingClientRect(), cw = Math.min(150, Math.round(pr.width * 0.4)), ch = Math.round(cw * 1.4);
    var h = '<div class="lift" style="left:' + (pr.left + pr.width / 2 - cw / 2) + 'px;top:' + Math.max(pr.top + 6, pr.top + pr.height / 2 - ch / 2 - 24) + 'px;width:' + cw + 'px"><div class="zcard" id="zcard" style="height:' + ch + 'px"></div><p class="lt">' + esc(cap(describe(c))) + '</p></div>';
    h += placesHtml(zs, 'button', function (q) { return 'data-a="' + (q.m.t === 'discard' ? 'discard' : q.m.t) + '"' + (q.m.w ? ' data-w="' + q.m.w + '"' : '') + (q.ok ? '' : ' disabled') + ' aria-label="' + esc(q.h.replace(/<[^>]+>/g, ' ')) + '"'; });
    z.innerHTML = h; z.hidden = false; var ce = cardEl(c, cw); ce.style.width = cw + 'px'; ce.style.height = ch + 'px'; $('zcard').appendChild(ce);
  }
  function liftDust(i) { var u = TTA.url('fx-lift-dust'), e = $('c' + i); if (!u || !e) return; var r = e.getBoundingClientRect(), f = document.createElement('div'); f.className = 'fxa'; f.style.cssText = 'left:' + (r.left + r.width / 2 - 23) + 'px;top:' + (r.bottom - 30) + 'px;background-image:url("' + u + '")'; document.body.appendChild(f); setTimeout(function () { f.remove(); }, 1000); }
  function closeZoom() { if (U.sel == null) return; U.sel = null; renderPyr(); dock(); }
  function setClean() { var a = document.querySelector('.gx-app'); if (!a || !U.G) return false; var on = !U.tut && !(canAct() && U.G.pend.length) && !U.G.over, was = a.classList.contains('ttclean'); a.classList.toggle('ttclean', on); return on !== was; }
  function render(flips) {
    var G = U.G; if (!G) return; setClean();
    strip(0); strip(1); renderMil(); renderTokens(); renderScore();
    $('bd').classList.toggle('drafting', G.phase === 'draft');
    if (G.phase === 'draft') renderDraft(); else renderPyr(flips);
    dock(); logRender();
    SND.sync(); if (G.over) showResult();
  }

  // ---------- moves + animation
  function rectOf(id) { var e = $(id); return e ? e.getBoundingClientRect() : null; }
  function flyCard(fromRect, html, to) {
    if (!fromRect || !to) return; var g = document.createElement('div'); g.className = 'card v4 ghost'; g.style.cssText = 'left:' + fromRect.left + 'px;top:' + fromRect.top + 'px;width:' + fromRect.width + 'px;height:' + fromRect.height + 'px;--cw:' + fromRect.width + 'px';
    g.innerHTML = html; fillArt(g); document.body.appendChild(g); var tr = to.getBoundingClientRect(), sc = Math.max(0.25, Math.min(1, tr.height / fromRect.height));
    var dx = tr.left + tr.width / 2 - (fromRect.left + fromRect.width / 2), dy = tr.top + tr.height / 2 - (fromRect.top + fromRect.height / 2), ms = Math.max(60, Math.min(650, delay() * 0.7 + 80));
    var a = g.animate([{ transform: 'translateY(-12px) scale(1.12) rotate(-3deg)', opacity: 1 }, { transform: 'translate(' + dx * 0.55 + 'px,' + (dy * 0.55 - 30) + 'px) scale(' + (1 + sc) / 2 + ') rotate(4deg)', opacity: 1, offset: 0.6 }, { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(' + sc + ')', opacity: 0.9 }], { duration: ms, easing: 'cubic-bezier(.3,.7,.3,1)' });
    a.onfinish = function () { g.remove(); try { to.animate([{ transform: 'scale(1.15)' }, { transform: 'none' }], { duration: 220, easing: 'ease-out' }); } catch (e) { } };
  }
  function flyCoins(from, to, n) {
    if (!from || !to || !n) return; var a = from.getBoundingClientRect(), b = to.getBoundingClientRect(), u = TTA.url('coin'); if (!u) return;
    for (var k = 0; k < Math.min(5, n); k++) (function (k) {
      var c = document.createElement('i'); c.className = 'flycoin'; c.style.cssText = 'left:' + (a.left + a.width / 2 - 11) + 'px;top:' + (a.top + a.height / 2 - 11) + 'px;background-image:url("' + u + '")'; document.body.appendChild(c);
      var dx = b.left + b.width / 2 - a.left - a.width / 2, dy = b.top + b.height / 2 - a.top - a.height / 2;
      var an = c.animate([{ transform: 'none' }, { transform: 'translate(' + dx / 2 + 'px,' + (dy / 2 - 40) + 'px) scale(1.2)', offset: 0.5 }, { transform: 'translate(' + dx + 'px,' + dy + 'px)' }], { duration: Math.max(60, Math.min(560, delay() * 0.6 + 60)), delay: k * 70, easing: 'ease-in-out', fill: 'backwards' });
      an.onfinish = function () { c.remove(); };
    })(k);
  }
  function landAt(p, ev) { var s = $('s' + p); if (!s) return null; if (ev.t === 'wonder') return s.querySelector('[data-wonder="' + ev.w + '"]') || s; if (ev.t === 'discard') return $('bank') || s; var c = BY[ev.id]; return (c && s.querySelector('.stk[data-col="' + c.col + '"]')) || s.querySelector('.tab') || s; }
  function popNum(txt, near, kind) {
    var r = near.getBoundingClientRect(), e = document.createElement('div'); e.className = 'pop-n' + (kind ? ' ' + kind : ''); e.textContent = txt; document.body.appendChild(e);
    e.style.left = Math.max(4, Math.min(innerWidth - e.offsetWidth - 4, r.left + r.width / 2 - e.offsetWidth / 2)) + 'px'; e.style.top = Math.max(4, r.top - (kind ? 6 : 0)) + 'px'; setTimeout(function () { e.remove(); }, kind ? 4200 : 1000);
    var fu = TTA.url('fx-coin-burst'); if (fu) { var f = document.createElement('div'); f.className = 'fxa'; f.style.cssText = 'left:' + (r.left + r.width / 2 - 23) + 'px;top:' + (r.top - 10) + 'px;background-image:url("' + fu + '")'; document.body.appendChild(f); setTimeout(function () { f.remove(); }, 1000); }
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
    var G = U.G, p = E.sideToAct(G), prevUp = {}, pre = null, preHtml = '', snap = G.phase === 'play' ? snapState() : null;
    if (m.i != null) { pre = rectOf('c' + m.i); var c = BY[G.pyr[m.i].id]; preHtml = cardHtml(c, pre ? pre.width : 60); var ghostCol = c.col; }
    G.pyr.forEach(function (c) { prevUp[c.i] = c.up; });
    var rated = (U.hintsOn && U.mode === 'cpu' && p === 0 && G.phase === 'play' && !G.pend.length && m.i != null) ? rateMove(G, p, m) : null;
    if (U.tut && p === 0 && window.TT_TUTOR && TT_TUTOR.beforePlayerMove) TT_TUTOR.beforePlayerMove(G, m);
    E.apply(G, m); U.sel = null; U.fingerDone = true; U.seq++;
    U.busy = true; var flips = []; G.pyr.forEach(function (c) { if (c.up && !prevUp[c.i] && !c.taken) flips.push(c.i); });
    G.ev.forEach(function (ev) { var l = lineOf(ev, G); if (l) { U.logs.push(l); G.log.push(l); } });
    render(flips);
    G.ev.forEach(function (ev) {
      var tgt = $('s' + p);
      if (ev.t === 'build' || ev.t === 'wonder') { SND.play('take'); setTimeout(function () { SND.play(ev.t === 'wonder' ? 'wonder' : (ev.paid ? 'coin' : 'build')); }, 110); }
      else if (ev.t === 'discard') { SND.play('take'); setTimeout(function () { SND.play('coin'); }, 110); }
      else if (ev.t === 'loot') SND.play('coin'); else if (ev.t === 'mil') SND.play('pawn');
      if (ev.t === 'build' || ev.t === 'wonder') { if (pre) flyCard(pre, preHtml, landAt(p, ev)); if (ev.paid) { flyCoins($('coins' + p), $('bank'), ev.paid); popNum('-' + ev.paid + '$', $('coins' + p) || tgt); } }
      else if (ev.t === 'discard') { if (pre) flyCard(pre, preHtml, $('bank') || tgt); flyCoins($('bank'), $('coins' + p), ev.n); popNum('+' + ev.n + '$', $('coins' + p) || tgt); }
      else if (ev.t === 'loot') { flyCoins($('coins' + ev.p), $('bank'), ev.n); popNum('-' + ev.n + '$', $('coins' + ev.p) || $('s' + ev.p)); }
      else if (ev.t === 'mil') { $('pawn').classList.add('slide'); var gu = TTA.url('fx-pawn-glow'); if (gu) { var gl = document.createElement('i'); gl.className = 'pawnglow'; gl.style.backgroundImage = 'url("' + gu + '")'; $('pawn').appendChild(gl); setTimeout(function () { gl.remove(); }, 1000); } setTimeout(function () { $('pawn').classList.remove('slide'); }, 900); }
    });
    if (G.ev.some(function (e) { return e.t === 'age'; })) $('pyr').querySelectorAll('.card').forEach(function (e) { e.classList.add('pop'); });
    if (G.over) return;
    U.busy = true; var items = moveItems(G, G.ev.slice(), p, snap); if (!U.tut) { if (!isAI(p) && U.mode !== 'two') { var key = items.filter(function (x) { return /point|coin|pawn|Age|token/i.test(x.tag + ' ' + x.text) && x.tag !== 'Pyramid'; }); items = (key.length ? key : items).slice(0, 2); } else items = items.filter(function (x) { return x.tag !== 'Pyramid'; }).slice(0, 3); } if (rated) items.splice(Math.min(items.length, 2), 0, { tag: 'Rating', kind: 'info', text: rated.t, extra: 250 }); dock0Lock(); if (U.tut && window.TT_TUTOR && TT_TUTOR.afterMove) { try { TT_TUTOR.afterMove(G, G.ev.slice(), p, snap, m); } catch (e) { console.error(e); } }
    narrate(items, function () { U.busy = false; after(); });
  }
  function dock0Lock() { $('acts').innerHTML = ''; var z = $('zoom'); if (z && !z.hidden) { z.hidden = true; z.innerHTML = ''; } }
  function after() {
    var G = U.G; if (G.over) return;
    var p = E.sideToAct(G); clearTimeout(U.aiTimer);
    if (G.phase === 'play' && !G.pend.length && U.lastSide !== p) { U.lastSide = p; if (U.hintsOn) banner(whoTag(p), isAI(p) ? 'rival' : 'you'); }
    if (G.phase === 'play' && G.pend.length && U.lastSide !== p) U.lastSide = p;
    if (isAI(p)) {
      U.busy = true; render0(); var seq = U.seq;
      U.aiTimer = setTimeout(function () {
        if (seq !== U.seq || U.G !== G) return;
        var rng = function () { return E.rnd(G); }, lv = U.lvl, m = AI.pick(G, lv, rng);
        if (!m) { U.busy = false; return; }
        narrate([{ tag: whoTag(p), kind: 'rival', text: intentLine(G, p, m), fn: function () { if (m.i != null) { var e = $('c' + m.i); if (e) e.classList.add('aipick'); } else if (m.t === 'pick') { var w = document.querySelector('[data-pick="' + m.w + '"]'); if (w) w.classList.add('aipick'); } } }],
          function () { if (seq !== U.seq || U.G !== G) return; U.busy = false; doMove(m); });
      }, stepMs());
    } else { U.busy = false; render0(); if (U.tut && window.TT_TUTOR && TT_TUTOR.onTurn) TT_TUTOR.onTurn(G); }
  }
  // the star on the computer's best pick among the glowing cards (only on your turn)
  function markBest() {
    var P = $('pyr'); if (!P) return; P.querySelectorAll('.bv').forEach(function (e) { e.remove(); }); P.querySelectorAll('.card.best').forEach(function (e) { e.classList.remove('best'); });
    var G = U.G; if (!U.hintsOn || !G || G.phase !== 'play' || G.pend.length || !canAct()) return;
    try { var bm = AI.pick(G, 'normal', function () { return 0.5; }); if (bm && bm.i != null) { var e = $('c' + bm.i); if (e && e.classList.contains('av')) { e.classList.add('best'); e.insertAdjacentHTML('beforeend', '<i class="bv" title="Best value">&#9733;</i>'); } } } catch (er) { }
  }
  function render0() { if (setClean() && U.G.phase !== 'draft') renderPyr(); dock(); renderScore(); markBest(); if (U.G.phase !== 'draft') { var P = $('pyr'); P.querySelectorAll('.card.av').forEach(function (e) { e.classList.toggle('dim', !canAct()); }); } else renderDraft(); strip(0); strip(1); }

  // ---------- screens
  function showStart() {
    var s = $('start'); if (window.TT_TUTOR && TT_TUTOR.cancel) TT_TUTOR.cancel(); clearTimeout(U.aiTimer); U.busy = true; U.camp = null; $('res').hidden = true; s.hidden = false; bgSlot(s, 'table-wood'); $('zoom').hidden = true;
    var lv = U.lvl, prog = '';
    try { if (window.GXC && window.CAMPAIGN) { var p = GXC.progress(), n = window.CAMPAIGN.chapters.filter(function (c) { return p.ch[c.id] && p.ch[c.id].beaten; }).length; prog = n ? n + ' of ' + window.CAMPAIGN.chapters.length + ' chapters done' : 'The Twin Crowns: 10 chapters'; } } catch (e) { }
    s.innerHTML = '<div class="lid" id="lid"><h1>Twin Thrones</h1></div><p>Two rival cities, one pyramid of cards. Build the better city.</p>' +
      '<div class="seg" id="lvls">' + ['easy', 'normal', 'hard'].map(function (l) { return '<button class="btn alt' + (l === lv ? ' on' : '') + '" data-lvl="' + l + '" aria-pressed="' + (l === lv) + '">' + l + '</button>'; }).join('') + '</div>' +
      '<button class="btn go big" data-start="1" data-a="play">Quick game</button>' +
      '<div class="tgrid"><button class="btn alt sm" data-story="1"><b>Story</b><span>' + esc(prog) + '</span></button>' + tutBtn() + '<button class="btn alt sm" data-start="2">Two players</button><button class="btn alt sm" data-start="0">Watch</button><button class="btn alt sm" data-gx="rulesd">How to play</button><button class="btn alt sm snd" data-snd="1" aria-label="Sound">' + sndLabel() + '</button></div>';
    U.tut = false; SND.sync(); bgSlot($('lid'), 'title-bg');
    var tb = s.querySelector('[data-gxt-open]'); if (tb) tb.setAttribute('data-a', 'learn');   // Learn to play, for tutorial bots (feel-audit)
  }
  function sndLabel() { return 'Sound: ' + (SND.isOn() ? 'on' : 'off'); }
  function firstTime() { try { return !localStorage.getItem('tt_seen') && !GXT.isDone('twin-thrones'); } catch (e) { return false; } }
  function tutBtn() { return window.GXT ? GXT.menuHTML({ game: 'twin-thrones', first: firstTime(), cls: 'btn alt sm', launch: function () { GX.close && GX.close(); if (window.TT_TUTOR) TT_TUTOR.start(); } }) : ''; }
  var FLAVOUR = (window.CAMPAIGN && CAMPAIGN.quick && CAMPAIGN.quick.intro) || ['Two thrones stand empty. Draft your wonders, then out-build the rival.'];
  function newGame(mode, seed, camp) {
    try { localStorage.setItem('tt_seen', '1'); } catch (e) { } U.mode = mode; U.ai = [mode === 'watch', mode !== 'two']; U.G = E.newGame({ seed: seed }); U.camp = camp || null; U.finished = false; U.logs = []; var tw = camp && camp.twist; if (tw) { if (tw.id === 'extra-coins') U.G.players[1].coins += tw.param; if (tw.id === 'head-start') U.G.mil = -tw.param; } U.sel = null; U.fingerDone = false; U.busy = false; U.seq++; U.narr = false; U.lastSide = null; clearTimeout(U.nt); if (!U.tut) U.rivalName = null;
    $('start').hidden = true; $('res').hidden = true; buildBoard(); render();
    var fl = camp ? 'Goal: ' + camp.goal.text + (tw ? ' ' + tw.text : '') : FLAVOUR[Math.floor(Math.random() * FLAVOUR.length)];
    if (U.tut) { after(); return; }
    if (!camp && delay() >= 300) { U.busy = true; peek(goalHtml() + '<button class="btn" data-goalgo="1">Start the duel</button>', true); return; }
    U.busy = true; narrate([{ tag: 'The duel', kind: 'info', text: fl, extra: camp ? 1500 : 500 }], function () { U.busy = false; after(); });
  }
  // the climax: totals count up row by row (tap anywhere on the table to jump to the end)
  function countUp(r) {
    var cells = [].slice.call(r.querySelectorAll('.cu')), t0 = performance.now(), dur = Math.max(300, delay() * 1.6), seq = U.seq;
    function fin() { cells.forEach(function (c) { c.textContent = c.dataset.n; }); }
    function tick(now) { if (seq !== U.seq) return; var k = Math.min(1, (now - t0) / dur); cells.forEach(function (c) { c.textContent = Math.round(+c.dataset.n * k); }); if (k < 1) requestAnimationFrame(tick); else fin(); }
    var tb = r.querySelector('table'); if (tb) tb.addEventListener('click', fin); requestAnimationFrame(tick);
  }
  function resultLine(G) {
    var me = U.mode === 'cpu', w = G.winner, who = me ? name(1) : '';
    if (w < 0) return 'Neither crown falls. The river city and the hill city share the night.';
    if (!me) return name(w) + ' raises the crown and the other city kneels.';
    if (G.reason === 'military') return w === 0 ? 'Your banners reach their gate. ' + who + ' hands over the keys.' : 'Their banners reach your gate. The city falls before dawn.';
    if (G.reason === 'science') return w === 0 ? 'Six symbols, one great discovery. The scholars crown you.' : who + "'s scholars solve what yours could not.";
    return w === 0 ? 'The crown is yours. ' + who + ' bows to the better builder.' : who + ' wears the crown this time. Build faster next round.';
  }
  function reasonText(G) {
    var mine = U.mode === 'cpu' ? G.winner === 0 : true; return { military: mine ? 'Military supremacy: the conflict pawn reached the rival capital.' : 'Military supremacy: the conflict pawn reached your capital.', science: 'Science supremacy: six different symbols.', points: 'Victory on points.', tiebreak: 'Won the tie on civic points.', draw: 'A perfect draw.' }[G.reason] || G.reason;
  }
  function showResult() {
    var G = U.G, r = $('res'); if (!r.hidden) return; clearTimeout(U.aiTimer); U.busy = true;
    if (U.camp && window.GXC && GXC.active()) { if (!U.finished) { U.finished = true; if (!U.tut) SND.play(G.winner === 0 ? 'win' : 'lose'); var fin = function () { try { GXC.finish(G); } catch (e) { console.error(e); } }, def = U.camp; setTimeout(function () { if (G.winner !== 0 && def.outroLose && GXC.scene) GXC.scene(def.outroLose, { def: def, title: def.title, last: 'Continue' }).then(fin); else fin(); }, 900); } return; }
    r.hidden = false;
    var win = G.winner >= 0 && (U.mode !== 'cpu' || G.winner === 0); if (!U.tut) SND.play(win ? 'win' : 'lose');
    var head = G.winner < 0 ? 'A draw' : U.mode === 'cpu' ? (G.winner === 0 ? 'You win!' : name(1) + ' wins') : name(G.winner) + ' wins!';
    var h = '<div class="rbx"><i class="rart" id="rart"></i><h2>' + esc(head) + '</h2><p>' + esc(reasonText(G)) + '</p>';
    var a = G.final ? G.final[0] : E.score(G, 0), b = G.final ? G.final[1] : E.score(G, 1);
    h += '<table><tr><th></th><th>' + esc(U.mode === 'cpu' ? 'You' : name(0)) + '</th><th>' + esc(name(1)) + '</th></tr>';
    [['Civic cards', 'blue'], ['Science', 'green'], ['Trade cards', 'yellow'], ['Guilds', 'guild'], ['Wonders', 'wonder'], ['Science bonus', 'token'], ['Coins', 'coins'], ['War', 'mil']].forEach(function (k) { if (!a[k[1]] && !b[k[1]]) return; h += '<tr><td>' + k[0] + '</td><td class="cu" data-n="' + a[k[1]] + '">0</td><td class="cu" data-n="' + b[k[1]] + '">0</td></tr>'; });
    h += '<tr class="hl"><td>Points</td><td class="cu" data-n="' + a.total + '">0</td><td class="cu" data-n="' + b.total + '">0</td></tr></table>' + (G.reason && G.reason !== 'points' ? '<p class="sm">An early ' + (G.reason === 'military' ? 'war' : 'science') + ' win: points do not decide this game.</p>' : '');
    h += '<p class="line">' + esc(resultLine(G)) + '</p><button class="btn" data-again="1">Play again</button><button class="btn alt" data-title="1">Title</button></div>'; r.innerHTML = h; bgSlot($('rart'), win ? 'result-victory' : 'result-defeat'); countUp(r); if (U.tut && window.TT_TUTOR && TT_TUTOR.onResult) TT_TUTOR.onResult(G);
  }

  // ---------- drawers
  function logRender() { var b = $('logbox'); b.innerHTML = '<ol>' + U.logs.slice(-80).reverse().map(function (l) { return '<li>' + esc(l) + '</li>'; }).join('') + '</ol>'; }
  function cardsRender() {
    var b = $('cardsbox'); if (b.dataset.done) return; b.dataset.done = 1; var h = '';
    [1, 2, 3].forEach(function (a) { h += '<h3>Age ' + AGE[a] + '</h3><div class="ref" id="ref' + a + '"></div>'; }); b.innerHTML = h;
    TT.CARDS.forEach(function (c) { var w = document.createElement('div'); w.className = 'rc'; w.appendChild(cardEl(c, 86)); $('ref' + c.age).appendChild(w); });
  }
  // ---------- story mode (shared campaign kit)
  function campStart(def) {
    U.lvl = def.opponent.aiLevel || 'normal'; U.hints = !!def.hints; var sd = def.setup && def.setup.seed; newGame('cpu', sd == null ? undefined : sd, def);
  }
  function campIsWon(G, def) {
    if (G.winner !== 0) return false;
    if (def.goal.type === 'score') return E.score(G, 0).total >= def.goal.value;
    if (def.id === 'c5') return G.mil > 0 || G.reason === 'military';
    if (def.id === 'c9') return G.reason === 'military' || G.reason === 'science';
    return true;
  }
  function campMetrics(G) { var a = E.score(G, 0).total, b = E.score(G, 1).total; return { won: G.winner === 0, score: a, margin: a - b, military: G.reason === 'military', turns: G.log.length }; }
  function campInit() {
    if (!window.GXC || !window.CAMPAIGN) return;
    GXC.init({ game: 'twin-thrones', artBase: 'media/', data: window.CAMPAIGN,
      headButtons: function () { var b = document.createElement('button'); b.type = 'button'; b.className = 'gxc-ib'; b.textContent = 'How to play'; b.setAttribute('aria-label', 'How to play and the tutorial'); b.addEventListener('click', function () { GXC.close(); GX.show('rulesd'); }); return [b]; },
      startChapter: campStart, isWon: campIsWon, metrics: campMetrics,
      onExit: function () { U.camp = null; showStart(); },
      scores: function (G) { return [E.score(G, 0).total, E.score(G, 1).total]; },
      seats: function () { return [{ name: 'You', me: true }, { name: U.camp ? U.camp.opponent.name : 'Rival', ai: U.lvl }]; } });
    var go0 = GXC.open; GXC.open = function () { try { if (window.TT_TUTOR && TT_TUTOR.cancel) TT_TUTOR.cancel(); if (window.GXT && GXT.running && GXT.running()) { GXT.stop(); U.tut = false; U.rivalName = null; } } catch (e) { } if (U.tut) showStart(); return go0.apply(this, arguments); };
  }
  function menuRender() {
    var b = $('menubody'); if (!b) return;
    b.innerHTML = '<div class="mrow"><button class="btn" data-menu="rules">Rules</button>' + tutBtn() + '<button class="btn alt" data-menu="cards">All cards</button><button class="btn alt" data-menu="restart">Restart game</button><button class="btn alt" data-snd="1">' + sndLabel() + '</button>' + (SND.hasMusic() ? '<button class="btn alt" data-menu="music">Music</button>' : '') + '<button class="btn alt" data-menu="title">Back to title</button></div>';
  }
  function rulesRender() {
    $('rulesbox').innerHTML = '<div class="mrow">' + tutBtn() + '</div><h3>The goal</h3><p>Have the most points after Age III. War or 6 science symbols win at once.</p><h3>A turn</h3><ol class="turn5"><li>Take one glowing card. Covered cards must wait.</li><li>Tap it, or drag it to Build, Sell or a wonder.</li><li><b>Build</b>: pay its cost. Missing resources cost coins.</li><li><b>Sell</b>: get 2 coins, plus 1 per yellow card.</li><li><b>Wonder</b>: tuck the card under one of your wonders.</li></ol><h3>Chains</h3><p>A chain mark makes a later card free.</p><h3>War</h3><p>Shields push the pawn toward your rival. Marked spaces steal coins.</p><h3>Science</h3><p>Two matching symbols earn a bonus token.</p><h3>Wonders</h3><p>Four each. Only seven can be built in total.</p>';
  }

  function showCity(p) {
    var G = U.G, b = $('cityd').querySelector('.gx-drawer-body'), h = '<h3>' + esc(name(p)) + '</h3><div class="ref" id="cityref"></div>'; b.innerHTML = h; var c = $('cityref');
    G.players[p].cards.concat(G.players[p].wonders.filter(function (w) { return w.card; }).map(function (w) { return w.id; })).forEach(function (id) { var w = document.createElement('div'); w.className = 'rc'; w.appendChild(cardEl(BY[id], 86)); c.appendChild(w); });
    if (!c.children.length) c.textContent = 'No cards yet.'; GX.show('cityd');
  }

  function goalHtml() { return '<h3>How to win</h3><p class="gl">Have the most points after 3 ages.</p><ul class="gb"><li>Cards and wonders give points.</li><li>Shields push the pawn. Reach their city to end it early.</li><li>6 different science symbols also end it early.</li></ul>'; }
  function peek(html, noX) { var b = $('peek'); if (!b) { b = document.createElement('div'); b.id = 'peek'; document.body.appendChild(b); } b.innerHTML = '<div class="pk" role="dialog" aria-modal="true">' + html + (noX ? '' : '<button class="btn pkx" data-peekx="1">Close</button>') + '</div>'; b.hidden = false; fillArt(b); }
  function peekScore() {
    var G = U.G, a = sbreak(G, 0), b = sbreak(G, 1), rows = [['Civic and trade cards, guilds', 'civ'], ['Science cards and tokens', 'sci'], ['War: pawn on their side', 'war'], ['Wonders', 'won'], ['Coins (1 point per 3)', 'coin']];
    var h = '<h3>How the points add up</h3><table class="pkt"><tr><th></th><th>' + esc(U.mode === 'cpu' ? 'You' : name(0)) + '</th><th>' + esc(name(1)) + '</th></tr>';
    rows.forEach(function (r) { h += '<tr><td>' + r[0] + '</td><td' + (a[r[1]] > b[r[1]] ? ' class="lead"' : '') + '>' + a[r[1]] + '</td><td' + (b[r[1]] > a[r[1]] ? ' class="lead"' : '') + '>' + b[r[1]] + '</td></tr>'; });
    peek(h + '<tr class="tt"><td>Total</td><td>' + a.tot + '</td><td>' + b.tot + '</td></tr></table><p>Most points after Age III takes the crown. War or 6 science symbols end it early.</p>');
  }
  function peekItem(id, kind) {
    var d = BY[id], G = U.G, h = '<div class="pkh">' + slot(d.stem, 'pka ' + kind) + '<div><h3>' + esc(d.nm) + '</h3><span class="zt">' + (kind === 'w' ? 'Wonder' : 'Science bonus') + '</span></div></div><p>' + esc(wtx(d.text)) + '</p>';
    if (kind === 'w') { var own = G.players[0].wonders.some(function (w) { return w.id === id; }) ? 0 : 1, w = G.players[own].wonders.filter(function (x) { return x.id === id; })[0]; h += '<p class="zc">' + (w && w.card ? 'Built.' : G.built >= 7 ? 'Can no longer be built (7 wonders are up).' : 'Cost: ' + esc(costWords(d.cost)) + '. Build it by tucking any pyramid card under it.') + '</p>'; }
    else h += '<p class="zc">Get one by owning 2 matching science symbols.</p>';
    peek(h);
  }
  // ---------- input
  function step(m) { if (!canAct()) return; doMove(m); }
  document.addEventListener('click', function (ev) {
    var t = ev.target, q = function (s) { return t.closest ? t.closest(s) : null; }, b;
    if ((b = q('[data-lvl]'))) { U.lvl = b.dataset.lvl; $('lvls').innerHTML = ['easy', 'normal', 'hard'].map(function (l) { return '<button class="btn alt' + (l === U.lvl ? ' on' : '') + '" data-lvl="' + l + '" aria-pressed="' + (l === U.lvl) + '">' + l + '</button>'; }).join(''); return; }
    if (q('[data-story]')) { if (window.GXC && window.CAMPAIGN) GXC.open(); return; }
    if ((b = q('[data-start]'))) { var k = b.dataset.start; var sd = +(new URLSearchParams(location.search).get('seed')) || undefined; newGame(k === '1' ? 'cpu' : k === '2' ? 'two' : 'watch', U.first ? undefined : sd); U.first = true; return; }
    if ((b = q('[data-again]'))) { newGame(U.mode); return; }
    if (q('[data-title]')) { showStart(); return; }
    if (q('#menubtn')) { GX.show('menud'); return; }
    if ((b = q('#hintbtn'))) { U.hintsOn = !U.hintsOn; try { localStorage.setItem('tt_hints', U.hintsOn ? '1' : '0'); } catch (e) { } b.setAttribute('aria-pressed', U.hintsOn); b.classList.toggle('on', U.hintsOn); if (U.G && !U.G.over) { if (U.G.phase !== 'draft') renderPyr(); dock(); markBest(); } return; }
    if (q('[data-menu="cards"]')) { GX.close(); GX.show('cardsd'); return; }
    if (q('[data-menu="title"]')) { GX.close(); showStart(); return; }
    if ((b = q('[data-snd]'))) { SND.setOn(!SND.isOn()); SND.play('coin'); b.textContent = sndLabel(); return; }
    if (q('[data-menu="rules"]')) { GX.close(); GX.show('rulesd'); return; }
    if (q('[data-menu="music"]')) { SND.openPicker(); return; }
    if ((b = q('[data-menu="restart"]'))) {
      if (!b.dataset.sure) { b.dataset.sure = '1'; b.textContent = 'Tap again to restart this game'; setTimeout(function () { b.dataset.sure = ''; b.textContent = 'Restart game'; }, 3000); return; }
      GX.close(); newGame(U.mode); return;
    }
    if (!U.G) return;
    if (U.narr && U.skipNarr && !q('button') && (q('#instr') || q('#banner') || q('#pyr') || q('#bd'))) { U.skipNarr(); return; }
    if (q('[data-goalgo]')) { $('peek').hidden = true; U.busy = false; after(); return; }
    if ((q('[data-peekx]') || t.id === 'peek') && !$('peek').querySelector('[data-goalgo]')) { $('peek').hidden = true; return; }
    if (q('[data-goal]')) { peek(goalHtml()); return; }
    if ((b = q('[data-score]'))) { peekScore(); return; }
    if ((b = q('#sbar'))) { var a0 = sbreak(U.G, 0), b0 = sbreak(U.G, 1); toast('Civic = cards, Sci = green cards + tokens, War = pawn zone, Won = wonders, Coin = 1 per 3 coins. You ' + a0.tot + ', ' + name(1) + ' ' + b0.tot + '.', 4200); return; }
    if ((b = q('[data-city]'))) { showCity(+b.dataset.city); return; }
    if ((b = q('[data-tok]'))) { peekItem(b.dataset.tok, 't'); return; }
    if ((b = q('[data-wonder]'))) { peekItem(b.dataset.wonder, 'w'); return; }
    if ((b = q('[data-pick]'))) { if (window.GXT && GXT.act({ type: 'tap', kind: 'pick', id: b.dataset.pick }) === false) return; step({ t: 'pick', w: b.dataset.pick }); return; }
    if ((b = q('[data-first]'))) { if (window.GXT && GXT.act({ type: 'tap', kind: 'first' }) === false) return; step({ t: 'first', who: +b.dataset.first }); return; }
    if ((b = q('[data-token]'))) { if (window.GXT && GXT.act({ type: 'tap', kind: 'token', id: b.dataset.token }) === false) return; step({ t: 'token', id: b.dataset.token }); return; }
    if ((b = q('[data-destroy]'))) { if (window.GXT && GXT.act({ type: 'tap', kind: 'destroy' }) === false) return; step({ t: 'destroy', id: b.dataset.destroy }); return; }
    if ((b = q('[data-revive]'))) { if (window.GXT && GXT.act({ type: 'tap', kind: 'revive' }) === false) return; step({ t: 'revive', id: b.dataset.revive }); return; }
    if (q('[data-zclose]') || t.id === 'zoom' || q('#zoom .lift')) { if (window.GXT && GXT.act({ type: 'tap', kind: 'other' }) === false) return; closeZoom(); return; }
    if ((b = q('[data-a]'))) { if (b.disabled || U.sel == null) return; var a = b.dataset.a; if (window.GXT && GXT.act({ type: 'tap', kind: 'act', a: a, w: b.dataset.w || null }) === false) return; step(a === 'wonder' ? { t: 'wonder', i: U.sel, w: b.dataset.w } : { t: a, i: U.sel }); return; }
    if ((b = q('.card.av')) && canAct() && !U.G.pend.length && U.G.phase === 'play') {
      var i = +b.id.slice(1); if (window.GXT && GXT.act({ type: 'tap', kind: 'card', i: i }) === false) return;
      U.sel = i; U.fingerDone = true; SND.play('tick'); renderPyr(); dock(); liftDust(i); return;
    }
  });
  // ---------- drag a glowing card onto Build / Sell / a wonder (tap still opens the big card)
  var DR = null;
  function dropZones(i) {
    var G = U.G, p = E.sideToAct(G), c = BY[G.pyr[i].id], bi = E.buildInfo(G, p, c), M = E.validMoves(G), z = [];
    var ok = function (t, w) { return M.some(function (m) { return m.t === t && m.i === i && (w == null || m.w === w); }); };
    z.push({ m: { t: 'build', i: i }, ok: ok('build'), h: '<b>Build here</b><small>' + (!ok('build') ? 'need ' + plural(bi.coins, 'coin') : bi.chain || !bi.coins ? 'free' : 'pay ' + plural(bi.coins, 'coin')) + '</small>' });
    z.push({ m: { t: 'discard', i: i }, ok: true, h: '<b>Sell</b><small>+' + plural(E.discardGain(G, p), 'coin') + '</small>' });
    G.players[p].wonders.forEach(function (w) { if (w.card || G.built >= 7) return; z.push({ m: { t: 'wonder', i: i, w: w.id }, ok: ok('wonder', w.id), h: ok('wonder', w.id) ? (E.wonderInfo(G, p, w.id).coins ? '<b>' + E.wonderInfo(G, p, w.id).coins + '</b><small>' + (E.wonderInfo(G, p, w.id).coins === 1 ? 'coin' : 'coins') + '</small>' : '<b>Free</b>') : '<small>too</small><small>costly</small>' }); });
    return z;
  }
  document.addEventListener('pointerdown', function (ev) {
    var b = ev.target.closest && ev.target.closest('#pyr .card.av'); if (!b || !canAct() || U.G.pend.length || U.G.phase !== 'play' || U.tut) return;
    DR = { i: +b.id.slice(1), el: b, x: ev.clientX, y: ev.clientY, on: false, id: ev.pointerId };
  });
  document.addEventListener('pointermove', function (ev) {
    if (!DR || ev.pointerId !== DR.id) return;
    if (!DR.on) {
      if (Math.abs(ev.clientX - DR.x) + Math.abs(ev.clientY - DR.y) < 10) return;
      DR.on = true; closeZoom(); var r = DR.el.getBoundingClientRect(), g = DR.el.cloneNode(true); g.id = 'dragc'; g.classList.remove('sel'); g.style.cssText += ';position:fixed;left:' + r.left + 'px;top:' + r.top + 'px;z-index:80;pointer-events:none;transform:translateY(-8px) scale(1.18) rotate(-4deg);box-shadow:0 18px 28px rgba(0,0,0,.55)'; document.body.appendChild(g);
      DR.g = g; DR.dx = ev.clientX - r.left; DR.dy = ev.clientY - r.top; DR.el.style.opacity = '.25';
      var t = document.createElement('div'); t.id = 'tray'; DR.z = dropZones(DR.i);
      t.innerHTML = placesHtml(DR.z, 'div', function (q, k) { return 'data-dz="' + k + '"'; }).replace(/class="place/g, 'class="dz place');
      document.body.appendChild(t); DR.t = t; SND.play('tick'); try { navigator.vibrate && navigator.vibrate(6); } catch (e) { }
    }
    ev.preventDefault(); DR.g.style.left = (ev.clientX - DR.dx) + 'px'; DR.g.style.top = (ev.clientY - DR.dy) + 'px';
    var hit = document.elementFromPoint(ev.clientX, ev.clientY), dz = hit && hit.closest && hit.closest('.dz'), k = dz ? +dz.dataset.dz : -1;
    if (k !== DR.k) { DR.t.querySelectorAll('.dz').forEach(function (e) { e.classList.toggle('hov', +e.dataset.dz === k); }); DR.k = k; if (k >= 0 && DR.z[k].ok) { try { navigator.vibrate && navigator.vibrate(8); } catch (e) { } } }
  }, { passive: false });
  function endDrag(ev) {
    if (!DR || ev.pointerId !== DR.id) return; var d = DR; DR = null; if (!d.on) return;
    U.dragJust = Date.now(); var k = d.k, z = k >= 0 ? d.z[k] : null;
    d.g.remove(); d.t.remove(); d.el.style.opacity = '';
    if (z && z.ok && ev.type === 'pointerup') { try { navigator.vibrate && navigator.vibrate(20); } catch (e) { } if (window.GXT && GXT.act({ type: 'tap', kind: 'act', a: z.m.t, w: z.m.w || null }) === false) return; U.sel = d.i; step(z.m); }
  }
  document.addEventListener('pointerup', endDrag); document.addEventListener('pointercancel', endDrag);
  document.addEventListener('click', function (ev) { if (U.dragJust && Date.now() - U.dragJust < 400) { ev.stopPropagation(); ev.preventDefault(); } }, true);
  document.addEventListener('keydown', function (e) { var pk = $('peek'); if (e.key === 'Escape' && pk && !pk.hidden) { if (pk.querySelector('[data-goalgo]')) { pk.hidden = true; U.busy = false; after(); } else pk.hidden = true; } });
  document.addEventListener('keydown', function (e) { if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('card') && e.target.classList.contains('av')) { e.preventDefault(); e.target.click(); } });
  window.addEventListener('resize', function () { if (U.G && U.G.phase !== 'draft' && !U.G.over) renderPyr(); });
  if (window.GX) GX.onResize(function () { if (U.G && U.G.phase !== 'draft' && $('pyr').children.length) renderPyr(); });

  // ---------- boot
  function boot() {
    GX.init({ key: 'tt' });
    ['cardsbox','logbox','rulesbox'].forEach(function (i) { $(i).hidden = false; });
    GX.drawer('cardsd', 'All cards', $('cardsbox'), true); GX.drawer('logd', 'Log', $('logbox')); GX.drawer('rulesd', 'How to play', $('rulesbox'));
    var cd = GX.drawer('cityd', 'City', null); var md = document.createElement('div'); md.id = 'menubody'; GX.drawer('menud', 'Menu', md);
    rulesRender(); var oldShow = GX.onShow; GX.onShow = function (id) { if (id === 'cardsd') cardsRender(); if (id === 'menud') menuRender(); if (id === 'rulesd') rulesRender(); if (oldShow) oldShow(id); };
    var gbg = GX.bg; GX.bg = function (on) { gbg.call(GX, on); var st = $('start'); if (st) st.inert = !!on; document.body.classList.toggle('gxdrawer', !!on); };
    campInit();
    SND.initMusic(function () { var G = U.G; if (!G || !$('start').hidden) return ['menu', 0]; if (G.over) { var win = G.winner >= 0 && (U.mode !== 'cpu' || G.winner === 0); return [win ? 'victory' : 'defeat', 1]; } return ['age' + (G.age || 1), 0]; });
    var hb = $('hintbtn'); if (hb) { hb.setAttribute('aria-pressed', U.hintsOn); hb.classList.toggle('on', U.hintsOn); }
    showStart();
  }
  window.TT_UI = { after: function () { after(); }, campStart: campStart, U: U, E: E, BY: BY, $: $, canAct: canAct, newGame: newGame, renderPyr: renderPyr, dock: dock, render: render, showStart: showStart, closeZoom: closeZoom };
  TT_TEST.U = U; TT_TEST.E = E;
  TT_TEST.forceEnd = function (seat) { var G = U.G; G.over = true; G.winner = seat; G.reason = 'military'; G.pend = []; render(); };
  TT_TEST.newGame = newGame;
  TT_TEST.select = function (i) { U.sel = i; renderPyr(); dock(); };
  TT_TEST.toPlay = function (steps) { // test hook: let the AI draft and play on both seats until it is seat 0's turn
    var G = U.G, rng = function () { return E.rnd(G); }, k = 0; clearTimeout(U.aiTimer);
    while (!G.over && (G.phase === 'draft' || E.sideToAct(G) !== 0 || k < (steps || 0)) && k < 400) { E.apply(G, AI.pick(G, 'easy', rng)); k++; if (G.phase === 'play' && !G.pend.length && E.sideToAct(G) === 0 && k >= (steps || 0)) break; }
    U.busy = false; U.sel = null; U.fingerDone = true; render(); };
  TT.U = U;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
