// Onyx Atelier guided first game: one rule at a time (take, buy, keep, Favour, refill, power, patron, 10-gem limit, how you win); each lesson says the rule (OD.TXT, same words as the Rules panel), makes you do it, then confirms. (FLAG: none)
var OTUT = (function () {
  var E = OE, U = UI.U, step = 0, T = null, fingerFor = null;
  var TARGET = 1;   // a Ring: 1 Diamond, 1 Sapphire, 1 Emerald, 1 Onyx
  function $(s) { return document.querySelector(s); }
  function setup() {
    var G = E.newGame(424242, 1);   // the rival "starts", so you hold the starting Favour
    // gather every token, then lay out a teaching board (counts never change)
    var all = G.bag.slice(); G.board.forEach(function (t) { if (t) all.push(t); }); G.bag = []; G.board = G.board.map(function () { return null; });
    function take(c) { var i = all.indexOf(c); all.splice(i, 1); return c; }
    G.pl[0].t.u = 1; take('u'); G.pl[0].t.g = 1; take('g');
    G.board[0] = take('w'); G.board[1] = take('k'); G.board[2] = take('r');
    G.board[12] = take('o'); G.board[18] = take('p');
    E.shuffle(G, all);
    for (var i = 0; i < 25; i++) if (G.board[i] === null && all.length) G.board[i] = all.pop();
    G.bag = all;
    // put the teaching Ring in the middle of the bottom row
    var d = G.decks[0], at = d.indexOf(TARGET);
    if (at >= 0) { d[at] = G.pyr[0][2]; G.pyr[0][2] = TARGET; } else { var k = G.pyr[0].indexOf(TARGET); G.pyr[0][k] = G.pyr[0][2]; G.pyr[0][2] = TARGET; }
    G.turn = 0;
    E.checkInvariants(G);
    return G;
  }
  var X = OD.TXT;
  // ---- staging: before a lesson, put the board in the teaching position (every token and card stays accounted for)
  function pull(G, c, keep) {   // one token of colour c from the bag, the board (not a kept cell), or a player
    var i = G.bag.indexOf(c); if (i >= 0) { G.bag.splice(i, 1); return c; }
    for (i = 0; i < 25; i++) if (G.board[i] === c && !(keep && keep.indexOf(i) >= 0)) { G.board[i] = null; return c; }
    for (var p = 1; p >= 0; p--) if (G.pl[p].t[c] > 0) { G.pl[p].t[c]--; return c; }
    throw new Error('no ' + c);
  }
  function putCell(G, cell, c) { if (G.board[cell] === c) return; if (G.board[cell]) G.bag.push(G.board[cell]); G.board[cell] = null; G.board[cell] = pull(G, c, [cell]); }
  function hand(G, p, spec) {   // set the player's gems exactly
    var P = G.pl[p]; E.TOK.forEach(function (c) { for (var n = 0; n < P.t[c]; n++) G.bag.push(c); P.t[c] = 0; });
    Object.keys(spec).forEach(function (c) { for (var n = 0; n < spec[c]; n++) { pull(G, c); P.t[c]++; } });
  }
  function scrolls(G, mine) { G.pl[0].fav = mine; G.pl[1].fav = 0; G.fav = 3 - mine; }
  function pluck(G, id) {   // take jewel id out of wherever it is now (a deck, the pyramid, or a player: the rival may have bought or kept it)
    var l = E.card(id).lvl - 1, at = G.decks[l].indexOf(id);
    if (at >= 0) { G.decks[l].splice(at, 1); return; }
    var k = G.pyr[l].indexOf(id); if (k >= 0) { G.pyr[l][k] = G.decks[l].length ? G.decks[l].pop() : null; return; }
    G.pl.forEach(function (P) { [P.cards, P.res].forEach(function (a) { var j = a.indexOf(id); if (j >= 0) a.splice(j, 1); }); });
  }
  function place(G, id) {   // put jewel id in the middle slot of its row (the card that was there goes back to the deck)
    var l = E.card(id).lvl - 1; if (G.pyr[l][2] === id) return;
    pluck(G, id); var old = G.pyr[l][2]; G.pyr[l][2] = id; if (old !== null && old !== undefined) G.decks[l].push(old);
  }
  function own(G, ids) {    // give the player jewels straight from the decks/pyramid
    ids.forEach(function (id) { var P = G.pl[0]; if (P.cards.indexOf(id) >= 0) return; pluck(G, id); P.cards.push(id); });
  }
  function isMain(m) { return /^(take|buy|reserve)$/.test(m.t); }
  function boughtId(m) { return m.t === 'buy' && m.l !== undefined && U.G.pyr[m.l][m.i]; }
  var NM = { w: 'Diamond', u: 'Sapphire', g: 'Emerald', r: 'Ruby', k: 'Onyx' };
  // one lesson = a "do" step (the rule in one sentence, the player acts) + a "confirm" step (what just happened)
  var LESSONS = [
    { key: 'take', res: '#me .cols', say: X.take, at: '.cell[data-cell="0"]', cells: [0, 1, 2], noFav: true,
      allow: function (m) { return m.t === 'take' && m.cells.slice().sort().join() === '0,1,2'; },
      done: 'You took 3 gems in a line. ' + X.takeFav },
    { key: 'buy', res: '#me .cols', say: X.buy, card: TARGET, at: '.card[data-id="' + TARGET + '"]', cells: [], noFav: true,
      stage: function (G) { place(G, TARGET); },
      allow: function (m) { return m.t === 'buy' && m.l === 0 && U.G.pyr[0][m.i] === TARGET; },
      done: 'Bought. ' + X.bonus },
    { key: 'keep', res: '#me .col[data-c="o"]', say: X.keep, gold: true, noFav: true,
      stage: function (G) { putCell(G, 12, 'o'); },
      allow: function (m) { return m.t === 'reserve'; },
      done: 'Kept, and you took 1 gold. Gold pays for any one gem or pearl. Buy it later from the Kept button.' },
    { key: 'fav', res: '#me .cols', say: X.fav, at: '#me .favb', cells: null, free: true,
      stage: function (G) { scrolls(G, 1); G.refilled = false; },
      allow: function (m) { return m.t === 'fav'; },
      done: 'You took a gem and the scroll went back to the supply. You still have your move to make.' },
    { key: 'refill', res: '#refillbtn', say: X.refill, at: '#refillbtn', cells: null, free: true,
      stage: function (G) { [20, 21, 22].forEach(function (c) { if (G.board[c]) { G.bag.push(G.board[c]); G.board[c] = null; } }); },
      allow: function (m) { return m.t === 'refill'; },
      done: 'The board is full again and your rival got a Favour. Now no more Favours this turn.' },
    { key: 'power', res: '#me .cols', say: 'Buy the glowing jewel. ' + X.power, card: 13, at: '.card[data-id="13"]', cells: [],
      stage: function (G) { place(G, 13); hand(G, 0, { r: 2, k: 2 }); putCell(G, 7, 'w'); },
      allow: function (m) { return m.t === 'buy' && boughtId(m) === 13; },
      done: 'Polish: you took one more Diamond from the board. Powers happen when you buy the jewel.' },
    { key: 'patron', res: '#me .race', say: 'Buy the glowing jewel: it has a crown. ' + X.crowns, card: 11, at: '.card[data-id="11"]', cells: [],
      stage: function (G) { own(G, [3, 9]); place(G, 11); hand(G, 0, { u: 3 }); G.pl[0].rq1 = 0; },
      allow: function (m) { return m.t === 'buy' && boughtId(m) === 11; },
      done: 'Your patron joined you and its points count towards 20. A second patron comes at 6 crowns.' },
    { key: 'limit', res: '#me .cols', say: 'Take the 3 glowing gems. ' + X.limit, at: '.cell[data-cell="0"]', cells: [0, 1, 2],
      stage: function (G) { hand(G, 0, { w: 3, u: 2, g: 2, r: 1, k: 2 }); putCell(G, 0, 'w'); putCell(G, 1, 'u'); putCell(G, 2, 'g'); },
      allow: function (m) { return m.t === 'take' && m.cells.slice().sort().join() === '0,1,2'; },
      done: 'Back to 10. If you ever cannot do anything else, you must refill.' }
  ];
  var STEPS = [];
  LESSONS.forEach(function (L, i) {
    L.i = STEPS.length; STEPS.push(L);
    STEPS.push({ key: L.key + '-done', info: 'Next', lesson: L, say: L.done, anchor: L.res });
  });
  STEPS.push({ key: 'win', info: 'Play on', anchor: '#me .race', say: function () { var P = U.G.pl[0], bc = E.bestColour(P);
    return X.win + ' You have ' + E.points(P) + ' of 20 points, ' + E.crowns(P) + ' of 10 crowns, ' + bc.v + ' of 10 in ' + NM[bc.c] + '.'; } });
  // ---- placement: the bubble touches its target with an arrow, on the side that covers none of the choices
  var curSels = null;
  function R(q) { var e = $(q); return e ? e.getBoundingClientRect() : null; }
  function rectsOf(sels) { var out = []; sels.forEach(function (q) { document.querySelectorAll(q).forEach(function (e) { var r = e.getBoundingClientRect(); if (r.width) out.push(r); }); }); return out; }
  function union(rs) { var o = null; rs.forEach(function (r) { o = o ? { left: Math.min(o.left, r.left), top: Math.min(o.top, r.top), right: Math.max(o.right, r.right), bottom: Math.max(o.bottom, r.bottom) } : { left: r.left, top: r.top, right: r.right, bottom: r.bottom }; }); return o; }
  function hit(a, b) { return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top; }
  function placeBubble() {
    var c = $('#coach'); if (!c || !curSels) return; var A = 10, W = innerWidth, H = innerHeight, top0 = 46;
    var rs = rectsOf(curSels), t = union(rs); if (!t) return;
    var sheet = !!$('#sheet [data-buy]'), avoid = rs.slice();
    if (!STEPS[step].info) document.querySelectorAll('.cell.glow, .card.glow, .favb.glow, .patc, #takebtn:not([disabled]), #sheet [data-buy]').forEach(function (e) { var r = e.getBoundingClientRect(); if (r.width) avoid.push(r); });
    var best = null;
    (sheet ? [190] : [300, 230, 180]).forEach(function (w, wi) {
      w = Math.min(w, W - 16); c.style.width = w + 'px'; c.style.left = '0px'; c.style.top = '0px';
      var bw = c.offsetWidth, bh = c.offsetHeight, cx = (t.left + t.right) / 2, cy = (t.top + t.bottom) / 2;
      var left = Math.max(8, Math.min(W - 8 - bw, cx - bw / 2));
      [{ d: 'below', top: t.bottom + A, left: left, pen: 0 }, { d: 'above', top: t.top - A - bh, left: left, pen: 0 },
       { d: 'right', top: cy - bh / 2, left: t.right + A, pen: 1 }, { d: 'left', top: cy - bh / 2, left: t.left - A - bw, pen: 1 }].forEach(function (k) {
        var box = { left: k.left, right: k.left + bw, top: Math.max(top0, Math.min(H - bh - 4, k.top)), bottom: 0 }; box.bottom = box.top + bh;
        var sc = k.pen + wi * 2 + Math.abs(box.top - k.top) * 3;   // a bubble pushed away from its target is a worse place
        if (k.top < top0 || k.top + bh > H - 4) sc += 1000;
        if (box.left < 6) sc += 1000 + (6 - box.left); if (box.right > W - 6) sc += 1000 + (box.right - W + 6);
        rs.forEach(function (r) { if (hit(box, r)) sc += 400; });
        avoid.forEach(function (r) { if (hit(box, r)) sc += 100; });
        k.sc = sc; k.w = w; k.bw = bw; k.bh = bh; k.cx = cx; k.cy = cy; k.top2 = box.top; if (!best || sc < best.sc) best = k;
      });
    });
    c.style.width = best.w + 'px'; var bw = best.bw, bh = best.bh, cx = best.cx, cy = best.cy;
    c.style.left = best.left + 'px'; c.style.top = best.top2 + 'px';
    ['arr-up', 'arr-down', 'arr-l', 'arr-r'].forEach(function (k) { c.classList.remove(k); });
    c.classList.add({ below: 'arr-up', above: 'arr-down', right: 'arr-l', left: 'arr-r' }[best.d]);
    c.style.setProperty('--ax', Math.max(18, Math.min(bw - 18, cx - best.left)) + 'px');
    c.style.setProperty('--ay', Math.max(14, Math.min(bh - 14, cy - parseFloat(c.style.top))) + 'px');
  }
  function cellSels(cs) { return cs && cs.length ? cs.map(function (k) { return '.cell[data-cell="' + k + '"]'; }) : null; }
  function skipBtn() {
    var k = $('#coachskip'); if (!k) { k = document.createElement('button'); k.id = 'coachskip'; k.className = 'btn'; k.textContent = 'Skip guide'; k.onclick = end; document.body.appendChild(k); }
  }
  function coach(text, btn) {
    var c = $('#coach'); if (!c) { c = document.createElement('div'); c.id = 'coach'; document.body.appendChild(c); }
    c.innerHTML = '<span class="t">' + text + '</span>' + (btn ? '<button class="btn" data-next>' + btn + '</button>' : '');
    var n = c.querySelector('[data-next]'); if (n) n.onclick = function () { go(step + 1); };
    skipBtn(); placeBubble();
  }
  function finger(sel) {
    var f = $('.finger'); if (f) f.remove(); if (!sel) return;
    var e = $(sel); if (!e) return; var r = e.getBoundingClientRect();
    f = document.createElement('div'); f.className = 'finger'; f.style.left = (r.left + r.width / 2 - 17) + 'px'; f.style.top = (r.top + r.height / 2 - 17) + 'px'; document.body.appendChild(f);
  }
  function go(i) {
    step = i; var s = STEPS[i]; if (!s) return end();
    if (s.stage) { s.stage(U.G); E.checkInvariants(U.G); U.sel = []; U.mode = null; }
    T.cells = s.free ? [] : s.cells || null; T.card = s.card; T.noFav = !!s.noFav; T.allowStep = s.allow || (s.info ? function () { return false; } : null); fingerFor = s.at || null;
    if (s.gold) { T.cells = []; U.G.board.forEach(function (t, k) { if (t === 'o') T.cells.push(k); }); fingerFor = '.cell[data-cell="' + T.cells[0] + '"]'; }
    curSels = s.info ? [s.anchor] : cellSels(T.cells) || [fingerFor];
    coach(typeof s.say === 'function' ? s.say() : s.say, s.info);
    UI.render();
  }
  function end() {
    var c = $('#coach'); if (c) c.remove(); var k = $('#coachskip'); if (k) k.remove(); finger(null); U.tut = null; UI.LS('oa_seen', '1'); UI.render();
    if (U.G && U.G.turn === 1 && !U.G.over) UI.aiTurn();
  }
  function start() {
    T = { allow: function (m) { if (/^(wild|tok|steal|royal|disc)$/.test(m.t)) return true; var ok = !T.allowStep || T.allowStep(m); if (ok && isMain(m)) T.lastOk = step; return ok; },
      onMove: function (m, ev) {
        if (ev && ev.p === 1) return;   // the rival's moves never advance the lesson
        var s = STEPS[step]; if (!s || s.info) return;
        if (s.free && s.allow(m)) { go(step + 1); return; }   // Favour and refill: your move is still to come
        if (T.lastOk === step && isMain(m)) { T.lastOk = -1; T.waitRival = step + 1; }
      },
      onRender: function () {
        var s = STEPS[step], g = U.G, q = g.pend;
        if (T.waitRival !== undefined && g.turn === 0 && !U.busy && !q) { var n = T.waitRival; T.waitRival = undefined; go(n); return; }
        if (s.free) { var want = s.key === 'fav' && U.mode === 'fav' ? null : []; if ((T.cells === null) !== (want === null)) { T.cells = want; UI.render(); return; } }   // while the scroll or Refill is the lesson, no gem glows
        var f = fingerFor, say = null, sels = cellSels(T.cells && T.cells.length ? T.cells : null) || null;
        if (s.cells && s.cells.length === 3 && s.take !== false) {
          var nx = s.cells.filter(function (x) { return U.sel.indexOf(x) < 0; });
          if (nx.length) { if (U.sel.length) say = 'Tap the next glowing gem in the line.'; f = '.cell[data-cell="' + nx[0] + '"]'; } else { f = '#takebtn'; say = 'Tap Take.'; sels = ['#takebtn']; }
        }
        if (s.key === 'keep' && U.mode === 'res') { f = '.card.glow'; sels = [f]; say = 'Now tap any jewel to keep it.'; }
        if (s.key === 'fav' && U.mode === 'fav') { f = '#board .cell.glow'; sels = [f]; say = 'Now tap any gem on the board.'; }
        if (document.querySelector('#sheet [data-buy]:not([disabled])')) { f = '#sheet [data-buy]'; sels = [f]; if (!q) say = 'Tap Buy.'; }
        if (q && q.h === 'tok') { f = '#board .cell.glow'; sels = [f]; say = 'Polish: tap the glowing ' + NM[q.c] + '.'; }
        if (q && q.h === 'royal') { f = '.patc'; sels = [f]; say = 'Choose a patron. Any of them is fine.'; }
        if (q && q.h === 'disc') { f = '#me .col.glow'; sels = [f]; say = 'Tap your gems to return ' + q.n + '.'; }
        if (!s.info) curSels = sels || [f];
        if (g.turn === 0 && !U.busy) finger(f); else finger(null);
        var co = $('#coach'); if (co) co.style.visibility = (g.turn === 1 || U.busy) && !s.info ? 'hidden' : 'visible';
        var c = $('#coach .t'); if (c && say) c.textContent = say;
        placeBubble();
      } };
    UI.newGame('easy', 1, 0); U.tut = T; U.G = setup(); U.sel = []; U.mode = null;
    var t0 = document.getElementById('toast'); if (t0) t0.classList.remove('on');
    go(0); T.timer = setInterval(function () { if (!U.tut) return clearInterval(T.timer); placeBubble(); }, 250);
    // the Buy button sits in a sheet: point at it when it opens
    document.addEventListener('click', function () { if (U.tut) setTimeout(function () { if (U.tut) U.tut.onRender(); }, 60); });
  }
  return { start: start, setup: setup, steps: STEPS, target: function () { return curSels; }, stepNo: function () { return step; } };
})();
