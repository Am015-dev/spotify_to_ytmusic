// Onyx Atelier UI: title, board, jewel pyramid, player strips, card sheet, rival turns, hints, patrons, result, rules. (FLAG: none)
var UI = (function () {
  var E = OE, A = OAI, $ = function (s) { return document.querySelector(s); };
  var NAME = { w: 'Diamond', u: 'Sapphire', g: 'Emerald', r: 'Ruby', k: 'Onyx', p: 'Pearl', o: 'Gold' };
  var TIER = ['Ring', 'Brooch', 'Tiara'], ROMAN = ['I', 'II', 'III'];
  var ABN = { again: 'Encore', token: 'Polish', priv: 'Favour', steal: 'Pinch' };
  var ABT = { again: 'Take another turn right after this one.', token: 'Take one more gem of this colour from the board.', priv: 'Gain a Favour scroll.', steal: 'Take one gem or pearl from your rival.' };
  var PAT = [{ n: 'The Impresario' }, { n: 'The Duchess' }, { n: 'The Banker' }, { n: 'The Countess' }];
  var HOW = { points: '20 points', crowns: '10 crowns' };
  var U = { G: null, sel: [], mode: null, resGold: null, busy: false, level: 'normal', tut: null, snd: true };
  var LS = function (k, v) { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { return null; } };
  function delay(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function aiMs(ms) { return typeof window.AIDELAY === 'number' ? Math.min(ms, window.AIDELAY) : ms; }
  function G() { return U.G; }
  function human() { var g = G(); return g && !g.over && g.turn === 0 && !U.busy; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function plural(n, w) { return n + ' ' + w + (n === 1 ? '' : 's'); }

  // ---------- sound: short synth clinks (Web Audio, no files) ----------
  var ctx = null;
  function tone(f, t, d, v, type) { if (!U.snd) return; try { ctx = ctx || new (window.AudioContext || window.webkitAudioContext)(); var o = ctx.createOscillator(), g = ctx.createGain(), s = ctx.currentTime + t; o.type = type || 'sine'; o.frequency.value = f; g.gain.setValueAtTime(0, s); g.gain.linearRampToValueAtTime(v || .12, s + .01); g.gain.exponentialRampToValueAtTime(.0005, s + d); o.connect(g); g.connect(ctx.destination); o.start(s); o.stop(s + d + .05); } catch (e) { } }
  var SND = { clink: function (n) { for (var i = 0; i < (n || 1); i++) { tone(2100 + i * 230, i * .07, .25, .07); tone(3150 + i * 300, i * .07 + .01, .18, .04); } },
    buy: function () { [523, 659, 784, 1047].forEach(function (f, i) { tone(f, i * .06, .5, .08, 'triangle'); }); },
    tap: function () { tone(1400, 0, .06, .05); }, win: function () { [523, 659, 784, 1047, 1319].forEach(function (f, i) { tone(f, i * .12, .9, .09, 'triangle'); }); },
    bad: function () { tone(220, 0, .2, .06, 'square'); } };
  function buzz(ms) { try { if (navigator.vibrate) navigator.vibrate(ms || 12); } catch (e) { } }

  // ---------- pieces ----------
  function cardHtml(id, extra) {
    var c = E.card(id), P = G() && G().pl[0], h = '';
    h += '<svg class="fan" viewBox="0 0 100 100" aria-hidden="true"><use href="#fan"/></svg>';
    if (c.pts) h += '<span class="pt">' + c.pts + '</span>';
    if (c.cr) { h += '<span class="crs">'; for (var i = 0; i < c.cr; i++) h += OART.icon('crown'); h += '</span>'; }
    if (c.b) { if (c.n === 2) h += OART.gm(c.b, 'bg2'); h += OART.gm(c.b, 'bg'); }
    if (c.ab) h += OART.icon('ab-' + c.ab, 'ab');
    h += '<span class="cost">';
    ['w', 'u', 'g', 'r', 'k', 'p'].forEach(function (k) { if (c.c[k]) h += '<i class="chip c-' + k + '">' + c.c[k] + '</i>'; });
    h += '</span>';
    return h;
  }
  function cardLabel(id) { var c = E.card(id); return TIER[c.lvl - 1] + ', ' + (c.b === 'x' ? 'matches a colour' : c.b ? NAME[c.b] : 'no colour') + (c.pts ? ', ' + plural(c.pts, 'point') : '') + (c.cr ? ', ' + plural(c.cr, 'crown') : ''); }
  function costWords(pay, gold) { var a = []; Object.keys(pay).forEach(function (k) { a.push(pay[k] + ' ' + NAME[k]); }); if (gold) a.push(gold + ' Gold'); return a.length ? a.join(', ') : 'nothing'; }
  function chips(pay, gold) { var h = ''; Object.keys(pay).forEach(function (k) { h += '<i class="chip c-' + k + '">' + pay[k] + '</i>'; }); if (gold) h += '<i class="chip c-o">' + gold + '</i>'; return h || '<i>free</i>'; }

  // ---------- selection rules (taking up to 3 gems in a line) ----------
  function runFor(cells) { var s = cells.slice().sort(function (a, b) { return a - b; }).join(','); var L = E.lines(); for (var i = 0; i < L.length; i++) { if (L[i].length === cells.length && L[i].slice().sort(function (a, b) { return a - b; }).join(',') === s && L[i].every(function (x) { var t = G().board[x]; return t && t !== 'o'; })) return L[i]; } return null; }
  function legalMove(m) { return E.legal(G(), m); }
  function canTakeAny() { return E.validMoves(G()).some(function (m) { return m.t === 'take'; }); }
  function canReserve() { return E.validMoves(G()).some(function (m) { return m.t === 'reserve'; }); }
  function canRefill() { return E.validMoves(G()).some(function (m) { return m.t === 'refill'; }); }
  function onlyRefill() { var v = E.validMoves(G()); return v.length && v.every(function (m) { return m.t === 'refill' || m.t === 'fav'; }) && v.some(function (m) { return m.t === 'refill'; }); }
  function cellGlow(i) {
    var g = G(), t = g.board[i]; if (!t || !human()) return false;
    if (g.pend) return g.pend.h === 'tok' && t === g.pend.c;
    if (U.tut && U.tut.cells && U.tut.cells.indexOf(i) < 0) return false;
    if (U.mode === 'fav') return t !== 'o';
    if (U.mode === 'res') return false;
    if (t === 'o') return !U.sel.length && canReserve();
    if (U.sel.indexOf(i) >= 0) return false;
    return U.sel.length < 3 && !!runFor(U.sel.concat([i]));
  }

  // ---------- render ----------
  function render() {
    var g = G(); if (!g) return; window.G = g;
    strip(1); strip(0); pyr(); board(); side(); status(); layout();
    if (U.tut && U.tut.onRender) U.tut.onRender();
    if (window.OST) OST.render();
  }
  function strip(p) {
    var g = G(), P = g.pl[p], el = $(p ? '#rival' : '#me'), b = E.bonuses(P), bc = E.bestColour(P), q = g.pend, me = p === 0, h = '';
    el.classList.toggle('turn', g.turn === p && !g.over);
    h += '<div class="top"><button class="pbtn" data-panel="' + p + '" aria-label="' + (me ? 'Your' : 'Rival') + ' panel: gems, bonuses, kept jewels"><span class="av"><span class="nm">' + (me ? 'You' : 'Rival') + '</span><b class="sc">' + E.points(P) + '</b></span></button><span class="race">' +
      '<span title="Points: 20 wins" aria-label="' + E.points(P) + ' of 20 points"><b data-engine="OA_TEST.pts.' + p + '">' + E.points(P) + '</b>/20 pts</span>' +
      '<span title="Crowns: 10 wins" aria-label="' + E.crowns(P) + ' of 10 crowns">' + OART.icon('crown') + '<b>' + E.crowns(P) + '</b>/10</span>' +
      '<span title="Points on jewels of one colour: 10 wins" aria-label="' + bc.v + ' of 10 points on one colour">' + OART.gm(bc.c) + '<b>' + bc.v + '</b>/10</span></span><span class="favs">';
    if (P.fav) { var fl = P.fav > 1 ? '<b class="fx">' + P.fav + '</b>' : ''; h += me ? '<button class="favb' + (human() && !g.pend && !g.refilled && !(U.tut && U.tut.noFav) ? ' glow' : '') + '" data-fav="1" aria-label="Use a Favour (' + P.fav + ')">' + OART.icon('scroll') + fl + '</button>' : '<span class="favb">' + OART.icon('scroll') + fl + '</span>'; }
    h += '</span>';
    if (me) h += '<span class="resb" aria-label="Gems held, max 10">' + E.tokens(P) + '/10</span>';
    h += me ? '<button class="resb" id="resbtn"' + (P.res.length ? '' : ' disabled') + ' aria-label="Your reserved jewels">Kept ' + P.res.length + '/3</button>' : '<span class="resb" aria-label="Rival reserved">Kept ' + P.res.length + '/3</span>';
    h += '</div><div class="cols">';
    E.TOK.forEach(function (c) {
      var gl = false;
      if (q && g.turn === 0 && !U.busy) {
        if (me && q.h === 'disc' && P.t[c] > 0) gl = true;
        if (me && q.h === 'wild' && c !== 'p' && c !== 'o' && P.cards.some(function (id) { return E.card(id).b === c; })) gl = true;
        if (!me && q.h === 'steal' && c !== 'o' && P.t[c] > 0) gl = true;
      }
      var bn = b[c] || 0, tag = gl ? 'button' : 'div';
      h += '<' + tag + ' class="col' + (gl ? ' glow' : '') + '" data-c="' + c + '" data-p="' + p + '"' + (gl ? ' aria-label="' + NAME[c] + '"' : '') + '>' + OART.gm(c) +
        '<b class="tn' + (P.t[c] ? '' : ' z') + '" data-engine="G.pl.' + p + '.t.' + c + '">' + P.t[c] + '</b>' +
        (c !== 'p' && c !== 'o' ? '<span class="bn' + (bn ? '' : ' z') + '">+' + bn + '</span>' : '') + '</' + tag + '>';
    });
    h += '</div>';
    el.innerHTML = h;
  }
  function pyr() {
    var g = G(), el = $('#pyr'), h = '';
    var buy = {}, res = {}; if (human() && !g.pend) E.validMoves(g).forEach(function (m) { if (m.t === 'buy' && m.res === undefined) buy[m.l + ':' + m.i] = 1; if (m.t === 'reserve') res[m.deck ? 'd' + m.l : m.l + ':' + m.i] = 1; });
    for (var l = 2; l >= 0; l--) {
      h += '<div class="prow" data-l="' + l + '">';
      var dn = g.decks[l].length, rg = U.mode === 'res' && res['d' + l];
      h += '<button class="card back' + (dn ? '' : ' none') + (rg ? ' glow' : '') + '" data-deck="' + l + '" aria-label="Tier ' + ROMAN[l] + ' deck, ' + dn + ' left"><span class="tier">' + ROMAN[l] + '</span><span class="left">' + dn + '</span></button>';
      g.pyr[l].forEach(function (id, i) {
        if (id === null) { h += '<div class="card empty"></div>'; return; }
        var k = l + ':' + i, cls = 'card t' + (l + 1) + (U.mode === 'res' ? (res[k] ? ' glow' : '') : buy[k] ? ' can' : '');
        if (U.tut && U.tut.card !== undefined && U.tut.card !== id) cls = cls.replace(' can', '').replace(' glow', '');
        h += '<button class="' + cls + '" data-l="' + l + '" data-i="' + i + '" data-id="' + id + '" aria-label="' + esc(cardLabel(id)) + '">' + cardHtml(id) + '</button>';
      });
      h += '</div>';
    }
    el.innerHTML = h;
  }
  function board() {
    var g = G(), el = $('#board'), h = '';
    g.board.forEach(function (t, i) {
      var gl = cellGlow(i), sel = U.sel.indexOf(i) >= 0 || U.resGold === i;
      h += '<button class="cell' + (gl ? ' glow' : '') + (sel ? ' sel' : '') + '" data-cell="' + i + '" aria-label="' + (t ? NAME[t] : 'empty') + '"' + (t ? '' : ' tabindex="-1"') + '>' + (t ? OART.gm(t) : '') + '</button>';
    });
    el.innerHTML = h;
  }
  function side() {
    var g = G(), el = $('#side'), h = '', P = g.pl[0];
    h += '<button class="sbox" data-info="fav" aria-label="Favours left in supply: tap to learn">Favours in supply<div class="row">';
    for (var i = 0; i < 3; i++) h += OART.icon(i < g.fav ? 'scroll' : 'scroll0');
    h += '</div></button>';
    if (U.sel.length && human()) {
      var run = runFor(U.sel), got = U.sel.map(function (s) { return g.board[s]; }), warn = got.length === 3 && got[0] === got[1] && got[1] === got[2] || got.filter(function (x) { return x === 'p'; }).length >= 2;
      h += '<button class="btn pri" id="takebtn"' + (run ? '' : ' disabled') + '>Take ' + got.length + '<span class="pv">' + got.map(function (c) { return OART.gm(c); }).join('') + '</span>' + (warn ? '<small>Rival gets a Favour</small>' : '') + (E.tokens(P) + got.length > 10 ? '<small>Over 10: return ' + (E.tokens(P) + got.length - 10) + '</small>' : '') + '</button>';
      h += '<button class="btn" id="clearbtn">Cancel</button>';
    } else if (U.mode === 'res' || U.mode === 'fav') {
      h += '<button class="btn" id="clearbtn">Cancel</button>';
    } else {
      h += '<div class="sbox">Patrons<div class="row">';
      for (i = 0; i < 4; i++) h += '<button class="pat' + (g.royals.indexOf(i) < 0 ? ' gone' : '') + '" data-pat="' + i + '" aria-label="' + PAT[i].n + '"><svg viewBox="0 0 48 48"><use href="#patron"/></svg></button>';
      h += '</div></div>';
    }
    var rf = human() && !g.pend && canRefill() && !U.sel.length && !U.mode;
    h += '<button class="btn' + (rf && onlyRefill() ? ' pri glow' : '') + '" id="refillbtn"' + (rf ? '' : ' disabled') + '>Refill<small>Bag ' + g.bag.length + ' · rival +1 Favour</small></button>';
    el.innerHTML = h;
  }
  function status() {
    var g = G(), s = '', el = $('#status'), q = g.pend; el.classList.remove('rv');
    if (U.say) { s = U.say; el.classList.toggle('rv', !!U.sayRv); }
    else if (g.over) s = g.over.winner === 0 ? 'You win!' : 'Rival wins';
    else if (g.turn === 1 || U.busy) { s = 'Rival is choosing…'; el.classList.add('rv'); }
    else if (U.recap && !q && !U.mode && !U.sel.length) { s = U.recap; el.classList.add('rv'); }
    else if (q) s = q.h === 'wild' ? 'Tap a colour to match' : q.h === 'tok' ? 'Take one more ' + NAME[q.c] : q.h === 'steal' ? "Tap a rival's gem to take" : q.h === 'royal' ? 'Choose a patron' : 'Tap your gems to return ' + q.n;
    else if (U.mode === 'fav') s = 'Tap any gem to take it';
    else if (U.mode === 'res') s = 'Gold: now tap a jewel to keep';
    else if (U.sel.length) s = U.sel.length < 3 ? 'Add gems in line, or Take' : 'Tap Take';
    else if (onlyRefill()) s = 'No moves: refill the board';
    else s = 'Take gems, or buy a jewel';
    el.textContent = s;
  }
  function layout() {
    var app = $('#app'), W = Math.min(app.clientWidth - 12, 548), H = app.clientHeight;
    var used = $('#bar').offsetHeight + $('#rival').offsetHeight + $('#me').offsetHeight + 12;
    var avail = H - used, cellMax = Math.floor(Math.min((W - 90 - 16) / 5, 58));
    var cell = Math.max(40, Math.min(cellMax, Math.floor((avail - 18 - (3 * 66 + 16)) / 5)));
    document.documentElement.style.setProperty('--cell', cell + 'px');
    var ph = H - used - (cell * 5 + 18), rowH = Math.floor((ph - 12) / 3);
    var ch = Math.max(44, Math.min(rowH, 118)), cw = Math.floor(Math.min((W - 5 * 4) / 6, ch < 70 ? ch * 1.3 : ch * 0.8));
    var r = document.documentElement.style; r.setProperty('--ch', ch + 'px'); r.setProperty('--cw', cw + 'px'); r.setProperty('--rg', Math.max(3, Math.min(10, (ph - ch * 3) / 4)) + 'px');
  }

  // ---------- fx ----------
  function rectOf(el) { return el ? el.getBoundingClientRect() : null; }
  function fly(fromR, html, toEl, w) {
    if (!fromR || !toEl) return; var to = rectOf(toEl); if (!to) return;
    var d = document.createElement('div'); d.className = 'fly'; w = w || Math.min(fromR.width, 40);
    d.style.cssText += ';left:' + (fromR.left + fromR.width / 2 - w / 2) + 'px;top:' + (fromR.top + fromR.height / 2 - w / 2) + 'px;width:' + w + 'px;height:' + w + 'px';
    d.innerHTML = html; document.body.appendChild(d);
    requestAnimationFrame(function () { requestAnimationFrame(function () { d.style.transform = 'translate(' + (to.left + to.width / 2 - fromR.left - fromR.width / 2) + 'px,' + (to.top + to.height / 2 - fromR.top - fromR.height / 2) + 'px) scale(.8)'; }); });
    setTimeout(function () { d.style.opacity = '0'; }, 420); setTimeout(function () { d.remove(); }, 560);
  }
  function pop(el, txt) { var r = rectOf(el); if (!r) return; var d = document.createElement('div'); d.className = 'pop'; d.textContent = txt; d.style.left = (r.left + r.width / 2 - 14) + 'px'; d.style.top = (r.top - 6) + 'px'; document.body.appendChild(d); setTimeout(function () { d.remove(); }, 1050); }
  function toast(t) { var el = $('#toast'); el.textContent = t; el.classList.remove('on'); void el.offsetWidth; el.classList.add('on'); }
  function colEl(p, c) { return document.querySelector((p ? '#rival' : '#me') + ' .col[data-c="' + c + '"]'); }

  // ---------- doing a move (both sides) with its animation ----------
  function doMove(m) {
    var g = G(), p = g.turn, pre = {}, bagR = rectOf($('#refillbtn'));
    if (m.cells) m.cells.forEach(function (s) { pre[s] = rectOf(document.querySelector('.cell[data-cell="' + s + '"]')); });
    if (m.cell !== undefined) pre.c = rectOf(document.querySelector('.cell[data-cell="' + m.cell + '"]'));
    if (m.gold !== undefined) pre.g = rectOf(document.querySelector('.cell[data-cell="' + m.gold + '"]'));
    var srcCard = m.t === 'buy' || m.t === 'reserve' ? (m.res !== undefined ? $('#resbtn') : m.deck ? document.querySelector('.card.back[data-deck="' + m.l + '"]') : document.querySelector('.card[data-l="' + m.l + '"][data-i="' + m.i + '"]')) : null;
    var cardR = rectOf(srcCard), stealR = m.t === 'steal' ? rectOf(colEl(1 - p, m.c)) : null;
    var before = { pts: E.points(g.pl[p]), cr: E.crowns(g.pl[p]) };
    var ev = E.performMove(g, m);
    U.sel = []; U.mode = null; U.resGold = null; U.say = null; if (p === 0) U.recap = null;
    render();
    var P = g.pl[p];
    if (ev.got) { var got = [].concat(ev.got); got.forEach(function (t, i) { var fr = m.cells ? pre[m.cells[i]] : m.t === 'steal' ? stealR : pre.c; setTimeout(function () { fly(fr, OART.gm(t), colEl(p, t), 34); }, i * 70); }); SND.clink(got.length); }
    if (m.t === 'reserve') { fly(pre.g, OART.gm('o'), colEl(p, 'o'), 34); if (cardR) fly(cardR, '<div class="card back" style="--cw:40px;--ch:52px"></div>', p ? document.querySelector('#rival .resb') : $('#resbtn'), 40); SND.clink(1); }
    if (m.t === 'buy') {
      var c = E.card(ev.id), col = E.colourOf(P, ev.id) || 'o';
      if (cardR) fly(cardR, '<div class="card t' + c.lvl + '" style="--cw:' + cardR.width + 'px;--ch:' + cardR.height + 'px">' + cardHtml(ev.id) + '</div>', colEl(p, c.b && c.b !== 'x' ? c.b : 'o'), cardR.width);
      var bagEl = $('#refillbtn'); Object.keys(ev.pay.pay).forEach(function (k, i) { setTimeout(function () { fly(rectOf(colEl(p, k)), OART.gm(k), bagEl, 26); }, 120 + i * 60); });
      if (ev.pay.gold) setTimeout(function () { fly(rectOf(colEl(p, 'o')), OART.gm('o'), bagEl, 26); }, 200);
      SND.buy(); buzz(18);
      var dp = E.points(P) - before.pts, dc = E.crowns(P) - before.cr, nm = document.querySelector((p ? '#rival' : '#me') + ' .race');
      if (dp > 0) setTimeout(function () { pop(nm, '+' + dp); }, 380);
      if (dc > 0) setTimeout(function () { pop(nm.children[1], '+' + dc + ' crown'); }, 600);
    }
    if (m.t === 'refill') SND.clink(3);
    if (m.t === 'disc') { fly(rectOf(colEl(p, m.c)), OART.gm(m.c), $('#refillbtn'), 30); toast((p ? 'Rival returns ' : 'Returned ') + NAME[m.c]); }
    if (m.t === 'royal') { SND.win(); toast(PAT[m.id].n); }
    if (ev.fav) setTimeout(function () { toast(p ? 'You get a Favour' : 'Rival gets a Favour'); }, 300);
    if (ev.again) setTimeout(function () { toast(p ? 'Rival goes again' : 'Encore! Go again'); }, 450);
    save();
    if (U.tut && U.tut.onMove) U.tut.onMove(m, ev);
    return ev;
  }
  function after() {
    var g = G();
    if (g.over) { save(true); setTimeout(result, 900); return; }
    if (g.turn === 1) { aiTurn(); return; }
    if (g.pend && g.pend.h === 'royal') patronPick();
    render();
  }
  function act(m) { if (!human() || !legalMove(m)) { SND.bad(); return; } if (U.tut && U.tut.allow && !U.tut.allow(m)) { SND.bad(); return; } closeSheet(); logMove(m, 0); doMove(m); after(); }
  function logMove(m, p) { try { var g = G(); (U.hist = U.hist || []).push((p ? 'Rival ' : 'You ') + rivalLine(m, g).replace(/^Rival /, '')); if (U.hist.length > 60) U.hist.shift(); } catch (e) { } }

  // ---------- the rival ----------
  function rivalLine(m, g) {
    if (m.t === 'take') { var a = {}; m.cells.forEach(function (s) { var t = g.board[s]; a[t] = (a[t] || 0) + 1; }); return 'Rival takes ' + Object.keys(a).map(function (k) { return a[k] + ' ' + NAME[k]; }).join(', '); }
    if (m.t === 'buy') return 'Rival buys a ' + TIER[E.card(m.res !== undefined ? g.pl[1].res[m.res] : g.pyr[m.l][m.i]).lvl - 1];
    if (m.t === 'reserve') return m.deck ? 'Rival keeps a hidden jewel' : 'Rival keeps a jewel';
    if (m.t === 'refill') return 'Rival refills: you get a Favour';
    if (m.t === 'fav') return 'Rival uses a Favour';
    if (m.t === 'steal') return 'Rival takes your ' + NAME[m.c] + '!';
    if (m.t === 'tok') return 'Rival takes a ' + NAME[g.board[m.cell]];
    if (m.t === 'royal') return 'Rival wins ' + PAT[m.id].n;
    if (m.t === 'disc') return 'Rival returns a ' + NAME[m.c];
    if (m.t === 'wild') return 'Rival matches ' + NAME[m.c];
    return 'Rival passes';
  }
  function rivalShow(m) {
    var g = G(); U.say = rivalLine(m, g); U.sayRv = true; status();
    if (m.cells) m.cells.forEach(function (s) { var e = document.querySelector('.cell[data-cell="' + s + '"]'); if (e) e.classList.add('rv'); });
    if (m.cell !== undefined || m.gold !== undefined) { var e = document.querySelector('.cell[data-cell="' + (m.cell !== undefined ? m.cell : m.gold) + '"]'); if (e) e.classList.add('rv'); }
    if ((m.t === 'buy' || m.t === 'reserve') && m.res === undefined) { var c = m.deck ? document.querySelector('.card.back[data-deck="' + m.l + '"]') : document.querySelector('.card[data-l="' + m.l + '"][data-i="' + m.i + '"]'); if (c) c.classList.add('rvp'); }
  }
  var aiRun = 0;
  function aiTurn() {
    var run = ++aiRun, lines = []; U.busy = true; U.recap = null; render();
    (async function () {
      await delay(aiMs(250));
      while (run === aiRun && G() && G().turn === 1 && !G().over) {
        var seq = A.pick(G(), U.level);
        if (!seq.length) break;
        for (var i = 0; i < seq.length && run === aiRun; i++) {
          logMove(seq[i], 1); rivalShow(seq[i]); lines.push(rivalLine(seq[i], G()).replace(/^Rival /, '').replace(/^takes /, 'took ').replace(/^buys /, 'bought ').replace(/^keeps /, 'kept ').replace(/^refills/, 'refilled').replace(/^uses /, 'used ').replace(/^wins /, 'won ').replace(/^returns /, 'returned ').replace(/^matches /, 'matched '));
          await delay(aiMs(seq[i].t === 'take' || seq[i].t === 'buy' ? 750 : 550));
          if (run !== aiRun) return;
          doMove(seq[i]); U.say = null; await delay(aiMs(300));
        }
      }
      if (run !== aiRun) return;
      U.recap = lines.length ? 'Rival ' + lines.join(', then ') + '. Your turn' : null;
      U.busy = false; U.say = null; render(); after();
    })();
  }

  // ---------- sheets / modals ----------
  function closeSheet() { ['#sheet', '#scrim', '.modal'].forEach(function (s) { var e = document.querySelectorAll(s); [].forEach.call(e, function (x) { x.remove(); }); }); }
  function sheet(html, modal) {
    closeSheet(); var s = document.createElement('div'); s.id = 'scrim'; document.body.appendChild(s);
    var d = document.createElement('div'); if (modal) d.className = 'modal'; else d.id = 'sheet';
    d.setAttribute('role', 'dialog'); d.innerHTML = '<button class="ib x" data-close aria-label="Close"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg></button>' + html;
    document.body.appendChild(d);
    s.addEventListener('click', function () { if (!d.hasAttribute('data-lock')) closeSheet(); });
    return d;
  }
  function zoom(src) {
    var g = G(), P = g.pl[0], id = src.res !== undefined ? P.res[src.res] : g.pyr[src.l][src.i], c = E.card(id), pr = E.price(P, id);
    var buyM = src.res !== undefined ? { t: 'buy', res: src.res } : { t: 'buy', l: src.l, i: src.i };
    var gold = U.resGold !== null ? U.resGold : g.board.indexOf('o');
    var resM = src.res === undefined && gold >= 0 ? { t: 'reserve', gold: gold, l: src.l, i: src.i } : null;
    var canBuy = human() && !g.pend && legalMove(buyM), canRes = human() && !g.pend && resM && legalMove(resM);
    if (U.tut && U.tut.allow) { if (canBuy && !U.tut.allow(buyM)) canBuy = false; if (canRes && !U.tut.allow(resM)) canRes = false; }
    var h = '<div class="zoom"><div class="card t' + c.lvl + '">' + cardHtml(id) + '</div><div class="info"><h3>' + TIER[c.lvl - 1] + ' · ' + ROMAN[c.lvl - 1] + '</h3>';
    if (c.b === 'x') h += '<p>Matches one of your colours: +1 of it.</p>'; else if (c.b) h += '<p>Gives +' + c.n + ' ' + NAME[c.b] + ' on every buy.</p>'; else h += '<p>No colour. Worth points only.</p>';
    if (c.pts || c.cr) h += '<p>' + [c.pts ? plural(c.pts, 'point') : '', c.cr ? plural(c.cr, 'crown') : ''].filter(Boolean).join(' · ') + '</p>';
    if (c.ab) h += '<p><b>' + ABN[c.ab] + ':</b> ' + ABT[c.ab] + '</p>';
    if (pr.why === 'wild') h += '<p>You need a coloured jewel first.</p>';
    else if (pr.ok) h += '<div class="pay">You pay: ' + chips(pr.pay, pr.gold) + '</div>';
    else h += '<div class="pay">Short by ' + pr.short + '. Cost after bonus: ' + chips(pr.pay, pr.gold) + '</div>';
    h += '</div></div><div class="acts"><button class="btn pri" data-buy' + (canBuy ? '' : ' disabled') + '>Buy</button>';
    if (src.res === undefined) h += '<button class="btn" data-res' + (canRes ? '' : ' disabled') + '>Keep<small>+1 Gold</small></button>';
    h += '</div>';
    var d = sheet(h);
    var b = d.querySelector('[data-buy]'); if (b) b.onclick = function () { act(buyM); };
    var r = d.querySelector('[data-res]'); if (r) r.onclick = function () { act(resM); };
  }
  function deckInfo(l) { var g = G(); sheet('<div class="zoom"><div class="card back" style="--cw:90px;--ch:118px"><span class="tier">' + ROMAN[l] + '</span><span class="left">' + g.decks[l].length + '</span></div><div class="info"><h3>' + TIER[l] + ' deck</h3><p>' + g.decks[l].length + ' left.</p><p>Tap a gold coin, then this deck, to keep the top jewel unseen.</p></div></div>'); }
  function bar(v, max) { return '<div class="meter"><i style="width:' + Math.min(100, v / max * 100) + '%"></i></div>'; }
  function playerPanel(p) {
    var g = G(), P = g.pl[p], me = p === 0, b = E.bonuses(P), bc = E.bestColour(P), h = '';
    h += '<h2>' + (me ? 'You' : 'Rival') + '</h2><div class="goals">' +
      '<div><span>Points</span><b>' + E.points(P) + '/20</b>' + bar(E.points(P), 20) + '</div>' +
      '<div><span>Crowns</span><b>' + E.crowns(P) + '/10</b>' + bar(E.crowns(P), 10) + '</div>' +
      '<div><span>One colour (' + NAME[bc.c] + ')</span><b>' + bc.v + '/10</b>' + bar(bc.v, 10) + '</div></div>' +
      '<h3>Gems ' + E.tokens(P) + '/10 · Favours ' + P.fav + '</h3><div class="pcols">';
    E.TOK.forEach(function (c) { h += '<div class="pc">' + OART.gm(c) + '<b>' + P.t[c] + '</b><span>' + (c === 'p' || c === 'o' ? '&nbsp;' : '+' + (b[c] || 0) + ' bonus') + '</span></div>'; });
    h += '</div><h3>Jewels owned: ' + P.cards.length + '</h3><p>Each jewel gives a permanent discount in its colour.</p>';
    h += '<h3>Kept jewels ' + P.res.length + '/3</h3>';
    if (!P.res.length) h += '<p>None.</p>';
    else if (me) { h += '<div class="pats">'; P.res.forEach(function (id, i) { var c = E.card(id); h += '<button class="card t' + c.lvl + (E.price(P, id).ok && human() ? ' can' : '') + '" style="--cw:70px;--ch:92px" data-r="' + i + '" aria-label="' + esc(cardLabel(id)) + '">' + cardHtml(id) + '</button>'; }); h += '</div><p>Tap a kept jewel to buy it.</p>'; }
    else h += '<p>The rival keeps ' + P.res.length + ' jewel' + (P.res.length === 1 ? '' : 's') + '.</p>';
    if (P.roy.length) h += '<h3>Patrons</h3><div class="pats">' + P.roy.map(function (i) { return patHtml(i); }).join('') + '</div>';
    var d = sheet(h, true);
    [].forEach.call(d.querySelectorAll('[data-r]'), function (b2) { b2.onclick = function () { zoom({ res: +b2.dataset.r }); }; });
  }
  function logPanel() {
    var L = (U.hist || []).slice(-30).reverse();
    sheet('<h2>Game log</h2>' + (L.length ? '<ol class="log">' + L.map(function (l) { return '<li>' + esc(l) + '</li>'; }).join('') + '</ol>' : '<p>No moves yet.</p>'), true);
  }
  function infoPanel(k) {
    var T = { fav: '<h2>Favours</h2><p>A Favour lets you take any one gem or pearl (never gold) before your move, and goes back to the supply when used. The second player starts with one.</p><p>You gain one when your rival refills the board, or takes three of one colour or two pearls.</p>',
      refill: '<h2>Refill</h2><p>Put every token from the bag back on the board. Your rival gains a Favour. Only possible while the bag is not empty, and before you spend a Favour.</p>' };
    sheet(T[k] || '', true);
  }
  function reserved() {
    var g = G(), P = g.pl[0]; if (!P.res.length) return;
    var h = '<h2>Kept jewels</h2><p style="text-align:center">Tap one to buy it.</p><div class="pats">';
    P.res.forEach(function (id, i) { var c = E.card(id); h += '<button class="card t' + c.lvl + (E.price(P, id).ok && human() ? ' can' : '') + '" style="--cw:70px;--ch:92px" data-r="' + i + '" aria-label="' + esc(cardLabel(id)) + '">' + cardHtml(id) + '</button>'; });
    var d = sheet(h + '</div>', true);
    [].forEach.call(d.querySelectorAll('[data-r]'), function (b) { b.onclick = function () { zoom({ res: +b.dataset.r }); }; });
  }
  function patHtml(i, btn) { var R = OD.ROYALS[i]; return '<' + (btn ? 'button' : 'div') + ' class="patc' + (btn ? ' glow' : '') + '" data-pick="' + i + '"><svg viewBox="0 0 48 48"><use href="#patron"/></svg><b>' + PAT[i].n + '</b>' + R.pts + ' points' + (R.ab ? '<br>' + ABN[R.ab] + ': ' + ABT[R.ab].replace('.', '') : '') + '</' + (btn ? 'button' : 'div') + '>'; }
  function patronInfo() { var g = G(), h = '<h2>Patrons</h2><p>' + OD.TXT.crowns + '</p><div class="pats">'; g.royals.forEach(function (i) { h += patHtml(i); }); sheet(h + '</div>', true); }
  function patronPick() {
    var g = G(), h = '<h2>Choose a patron</h2><div class="pats">'; g.royals.forEach(function (i) { h += patHtml(i, true); });
    var d = sheet(h + '</div>', true); d.setAttribute('data-lock', '1'); var x = d.querySelector('[data-close]'); if (x) x.remove();
    [].forEach.call(d.querySelectorAll('[data-pick]'), function (b) { b.onclick = function () { act({ t: 'royal', id: +b.dataset.pick }); }; });
  }
  function result() {
    var g = G(); if (!g.over) return; if (U.camp && window.OST) return OST.over(g); var me = g.over.winner === 0, P = g.pl[g.over.winner];
    var how = g.over.how === 'colour' ? '10 points in ' + NAME[E.bestColour(P).c] : HOW[g.over.how];
    if (me) SND.win();
    var d = sheet('<h2>' + (me ? 'You win!' : 'Rival wins') + '</h2><p style="text-align:center">' + (me ? 'You' : 'Rival') + ' reached ' + how + '.</p><p style="text-align:center">You ' + E.points(g.pl[0]) + ' pts · Rival ' + E.points(g.pl[1]) + ' pts</p><div class="acts"><button class="btn pri" data-again>Play again</button><button class="btn" data-menu>Menu</button></div>', true);
    d.querySelector('[data-again]').onclick = function () { closeSheet(); newGame(U.level); };
    d.querySelector('[data-menu]').onclick = function () { closeSheet(); showTitle(); };
  }
  function rules() {
    var X = OD.TXT;
    var h = '<h2>How to play</h2>' + (window.OTUT ? '<button class="btn" data-mapbtn>? Screen map: what each part is</button>' : '') + '<h3>How you win</h3><p>' + X.win + '</p>' +
      '<h3>Your turn</h3><p>' + X.order + '</p><ul><li>' + X.fav + '</li><li>' + X.refill + '</li>' +
      '<li>' + X.take + '</li><li>' + X.takeFav + '</li><li>' + X.keep + '</li><li>' + X.buy + '</li><li>' + X.bonus + '</li><li>' + X.limit + '</li>' +
      '<li>The game ends the moment you reach a goal at the end of your own turn, so there are no ties. You can keep at most 3 jewels. If the bag is empty and nothing else is possible you pass.</li><li>If you can do nothing else, you must refill. Gold only comes from keeping a jewel. A Favour you spend goes back to the supply.</li></ul>' +
      '<h3>Jewel powers</h3><p>' + X.power + '</p><ul><li><b>Encore:</b> take another turn.</li><li><b>Polish:</b> take a gem of that colour from the board.</li><li><b>Favour:</b> gain a Favour.</li><li><b>Pinch:</b> take a gem or pearl from your rival.</li><li><b>Matching jewel</b> (rainbow gem): you need a coloured jewel to buy it; it joins one colour you own.</li></ul>' +
      '<h3>Crowns and patrons</h3><p>' + X.crowns + '</p>' +
      '<h3>Everything in the box</h3><p>25 board spaces. 4 each of Diamond, Sapphire, Emerald, Ruby, Onyx. 2 Pearls, 3 Gold. 3 Favours. 4 Patrons. 67 jewels: 30 Rings, 24 Brooches, 13 Tiaras.</p><div class="pats">' + [0, 1, 2, 3].map(function (i) { return patHtml(i); }).join('') + '</div>';
    [1, 2, 3].forEach(function (l) { h += '<h3>' + TIER[l - 1] + 's (' + OD.CARDS.filter(function (c) { return c.lvl === l; }).length + ')</h3><div class="ref">'; OD.CARDS.forEach(function (c) { if (c.lvl === l) h += '<div class="card t' + l + '" role="img" aria-label="' + esc(cardLabel(c.id)) + '">' + cardHtml(c.id) + '</div>'; }); h += '</div>'; });
    h += '<h3>Credits</h3><p>Game design adapted; names, art and code original. Fonts: Limelight and Josefin Sans (SIL Open Font License). All art drawn in code.</p>';
    var d = sheet(h, true), mb = d.querySelector('[data-mapbtn]'); if (mb) mb.onclick = function () { closeSheet(); OTUT.mapOnly(); };
  }
  function menu() {
    var d = sheet('<h2>Menu</h2><div style="display:flex;flex-direction:column;gap:8px"><button class="btn pri" data-a="resume">Resume</button><button class="btn" data-a="new">New game</button>' + (window.OST ? '<button class="btn" data-a="story">Story map</button>' : '') + '<button class="btn" data-a="learn">Learn to play</button><button class="btn" data-a="rules">How to play</button><button class="btn" data-a="snd">Sound: ' + (U.snd ? 'on' : 'off') + '</button><button class="btn" data-a="title">Title screen</button></div>', true);
    [].forEach.call(d.querySelectorAll('[data-a]'), function (b) { b.onclick = function () { var a = b.dataset.a; closeSheet();
      if (a === 'new') newGame(U.level); else if (a === 'learn') startTut(); else if (a === 'rules') rules(); else if (a === 'snd') { U.snd = !U.snd; LS('oa_snd', U.snd ? '1' : '0'); } else if (a === 'title') showTitle(); else if (a === 'story' && window.OST) OST.open(); }; });
  }

  // ---------- hint (same evaluation as the normal rival) ----------
  function hint() {
    if (!human()) return; var g = G(), seq = A.hint(g), m = seq[0]; if (!m) return;
    U.sel = []; U.mode = null; U.resGold = null;
    if (m.t === 'take') { U.sel = m.cells.slice(); render(); }
    else if (m.t === 'fav') { U.mode = 'fav'; render(); mark('.cell[data-cell="' + m.cell + '"]'); }
    else if (m.t === 'buy') { render(); if (m.res !== undefined) mark('#resbtn'); else mark('.card[data-l="' + m.l + '"][data-i="' + m.i + '"]'); U.say = 'Hint: buy the bouncing jewel'; status(); U.say = null; return; }
    else if (m.t === 'reserve') { U.resGold = m.gold; U.mode = 'res'; render(); mark(m.deck ? '.card.back[data-deck="' + m.l + '"]' : '.card[data-l="' + m.l + '"][data-i="' + m.i + '"]'); }
    else if (m.t === 'refill') { render(); mark('#refillbtn'); }
    else if (m.t === 'tok') mark('.cell[data-cell="' + m.cell + '"]');
    else if (m.t === 'steal' || m.t === 'disc' || m.t === 'wild') mark((m.t === 'steal' ? '#rival' : '#me') + ' .col[data-c="' + m.c + '"]');
    else if (m.t === 'royal') mark('[data-pick="' + m.id + '"]');
  }
  function mark(sel) { var e = document.querySelector(sel); if (e) { e.classList.remove('hint'); void e.offsetWidth; e.classList.add('hint'); } }

  // ---------- input ----------
  function onTap(e) {
    var t = e.target.closest('button'); if (!t || t.disabled) return;
    if (t.hasAttribute('data-close')) { closeSheet(); return; }
    if (t.closest('#sheet,.modal,#title,#coach')) return;
    var g = G(); if (!g) return;
    if (U.recap && t.closest('#board,#pyr,#me,#side')) U.recap = null;
    if (t.id === 'menubtn') return menu();
    if (t.id === 'logbtn') return logPanel();
    if (t.closest('[data-panel]')) return playerPanel(+t.closest('[data-panel]').dataset.panel);
    if (t.dataset.info) return infoPanel(t.dataset.info);
    if (t.id === 'rulesbtn') return rules();
    if (t.id === 'hintbtn') return hint();
    if (t.id === 'resbtn') return reserved();
    if (t.dataset.pat !== undefined) return patronInfo();
    if (t.dataset.deck !== undefined) { if (U.mode === 'res' && human()) return act({ t: 'reserve', gold: U.resGold, l: +t.dataset.deck, deck: true }); return deckInfo(+t.dataset.deck); }
    if (t.dataset.l !== undefined && t.classList.contains('card')) { var l = +t.dataset.l, i = +t.dataset.i; if (U.mode === 'res' && human()) return act({ t: 'reserve', gold: U.resGold, l: l, i: i }); return zoom({ l: l, i: i }); }
    if (!human()) return;
    var q = g.pend;
    if (t.classList.contains('col')) {
      var c = t.dataset.c;
      if (q && q.h === 'disc') return act({ t: 'disc', c: c });
      if (q && q.h === 'wild') return act({ t: 'wild', c: c });
      if (q && q.h === 'steal') return act({ t: 'steal', c: c });
      return;
    }
    if (t.dataset.fav) { if (U.tut && U.tut.noFav) return; U.sel = []; U.resGold = null; U.mode = U.mode === 'fav' ? null : 'fav'; SND.tap(); render(); return; }
    if (t.id === 'clearbtn') { U.sel = []; U.mode = null; U.resGold = null; render(); return; }
    if (t.id === 'takebtn') { var run = runFor(U.sel); if (run) act({ t: 'take', cells: run.slice() }); return; }
    if (t.id === 'refillbtn') { if (U.tut && U.tut.allow && !U.tut.allow({ t: 'refill' })) return; return act({ t: 'refill' }); }
    if (t.dataset.cell !== undefined) {
      var s = +t.dataset.cell, tk = g.board[s]; if (!tk) return;
      if (q) { if (q.h === 'tok') act({ t: 'tok', cell: s }); return; }
      if (U.mode === 'fav') { if (tk !== 'o') act({ t: 'fav', cell: s }); return; }
      if (tk === 'o') { if (!canReserve()) { SND.bad(); return; } U.sel = []; if (U.mode === 'res' && U.resGold === s) { U.mode = null; U.resGold = null; } else { U.mode = 'res'; U.resGold = s; } SND.tap(); render(); return; }
      if (U.mode === 'res') { U.mode = null; U.resGold = null; }
      var k = U.sel.indexOf(s);
      if (k >= 0) { U.sel.splice(k, 1); if (U.sel.length && !runFor(U.sel)) U.sel = []; }
      else if (cellGlow(s)) U.sel.push(s);
      else if (runFor([s])) U.sel = [s];
      else { SND.bad(); return; }
      SND.tap(); buzz(8); render();
    }
  }

  // ---------- game flow ----------
  function save(clear) { if (U.tut || U.camp || (window.GXS && GXS.on)) return; if (clear) LS('oa_save', null); else LS('oa_save', JSON.stringify({ G: U.G, level: U.level })); }
  function newGame(level, seed, first) {
    aiRun++; U.busy = false; U.tut = null; U.camp = null; closeSheet(); var c = document.getElementById('coach'); if (c) c.remove();
    U.level = level || U.level; LS('oa_level', U.level);
    seed = seed || (Math.random() * 1e9) | 0;
    U.G = E.newGame(seed, first === undefined ? (Math.random() < .5 ? 0 : 1) : first);
    U.sel = []; U.mode = null; U.resGold = null; U.say = null;
    $('#title').hidden = true; render(); save();
    if (U.G.turn === 1) aiTurn(); else toast('You start');
  }
  function resume() { try { var s = JSON.parse(LS('oa_save')); U.G = s.G; U.level = s.level || 'normal'; } catch (e) { return newGame(U.level); } $('#title').hidden = true; render(); after(); }
  function startTut() { if (window.OTUT) { $('#title').hidden = true; OTUT.start(); } else newGame('easy'); }
  function showTitle() {
    aiRun++; U.busy = false; closeSheet(); var c = document.getElementById('coach'); if (c) c.remove(); U.tut = null;
    if (U.camp) { U.camp = null; U.level = LS('oa_level') || U.level; if (window.OST) OST.render(); }
    var t = $('#title'), sv = LS('oa_save'), seen = LS('oa_seen');
    t.innerHTML = '<svg class="sun" viewBox="0 0 100 100" aria-hidden="true"><use href="#fan"/></svg><h1>Onyx<br>Atelier</h1><div class="sub">A jeweller\'s duel</div><div class="gems">' + ['w', 'u', 'g', 'r', 'k', 'p', 'o'].map(function (k) { return OART.gm(k); }).join('') + '</div>' +
      (sv ? '<button class="btn pri" data-t="cont">Continue</button>' : '') +
      '<button class="btn' + (sv ? '' : ' pri') + '" data-t="play">' + (seen ? 'Play' : 'Play: first game teaches you') + '</button>' +
      '<div class="seg" role="group" aria-label="Rival strength">' + ['easy', 'normal', 'hard'].map(function (l) { return '<button class="btn" data-lv="' + l + '" aria-pressed="' + (U.level === l) + '">' + l[0].toUpperCase() + l.slice(1) + '</button>'; }).join('') + '</div>' +
      (window.OST ? '<button class="btn" data-t="story">Story</button>' : '') + '<button class="btn" data-t="learn">Learn to play</button><button class="btn" data-t="rules">How to play</button>';
    t.hidden = false;
    t.onclick = function (e) { var b = e.target.closest('button'); if (!b) return;
      if (b.dataset.lv) { U.level = b.dataset.lv; LS('oa_level', U.level); [].forEach.call(t.querySelectorAll('[data-lv]'), function (x) { x.setAttribute('aria-pressed', x === b); }); return; }
      var a = b.dataset.t; if (a === 'cont') resume(); else if (a === 'play') { if (!seen) startTut(); else newGame(U.level); } else if (a === 'learn') startTut(); else if (a === 'rules') rules(); else if (a === 'story' && window.OST) OST.open(); };
  }
  function boot() {
    OART.mount(); U.level = LS('oa_level') || 'easy'; U.snd = LS('oa_snd') !== '0';
    document.addEventListener('click', onTap);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { var m = document.querySelector('.modal[data-lock]'); if (!m) closeSheet(); } });
    window.addEventListener('resize', function () { if (U.G) layout(); });
    if (window.GXS && GXS.on) return;   // a test scenario builds its own state
    showTitle();
  }
  window.OA_TEST = { E: E, AI: A, U: U, newGame: newGame, act: act, render: render, doMove: doMove, zoom: zoom, closeSheet: closeSheet, showTitle: showTitle, result: result,
    pts: { get 0() { return E.points(U.G.pl[0]); }, get 1() { return E.points(U.G.pl[1]); } } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  return { U: U, render: render, act: act, newGame: newGame, doMove: doMove, after: after, aiTurn: aiTurn, toast: toast, sheet: sheet, closeSheet: closeSheet, showTitle: showTitle, layout: layout, NAME: NAME, LS: LS, human: human };
})();
