// Onyx Atelier guided first game: a scripted opening that teaches taking gems, buying, keeping with gold, Favours, then the race. Then the real game goes on. (FLAG: none)
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
  var STEPS = [
    { say: 'Tap 3 gems in a straight line.', cells: [0, 1, 2], noFav: true, at: '.cell[data-cell="0"]', allow: function (m) { return m.t === 'take' && m.cells.slice().sort().join() === '0,1,2'; } },
    { say: 'You can afford the glowing jewel. Tap it.', card: TARGET, noFav: true, cells: [], at: '.card[data-id="' + TARGET + '"]', allow: function (m) { return m.t === 'buy' && m.l === 0 && U.G.pyr[0][m.i] === TARGET; } },
    { say: 'Your jewel makes Ruby 1 cheaper, forever.', info: 'Next', anchor: '#me .col[data-c="r"]' },
    { say: 'Tap a gold coin. Gold keeps a jewel.', noFav: true, gold: true, allow: function (m) { return m.t === 'reserve'; } },
    { say: 'A Favour scroll takes any one gem. Tap yours.', at: '#me .favb', cells: null, allow: function (m) { return m.t === 'fav'; } },
    { say: 'Your move. Stuck? Tap the bulb.', cells: null, at: '#hintbtn', anchor: '#hintbtn', allow: function () { return true; } },
    { say: 'Win: 20 points, 10 crowns, or 10 in one colour.', info: 'Got it', anchor: '#me .race' },
    { say: 'Crowns win patrons. The bulb shows a good move.', info: 'Play on', anchor: '#hintbtn' }
  ];
  var anchorSel = null, resMode = false;
  function R(sel) { var e = $(sel); return e ? e.getBoundingClientRect() : null; }
  function union(sels) { var o = null; sels.forEach(function (q) { var r = R(q); if (!r) return; o = o ? { left: Math.min(o.left, r.left), top: Math.min(o.top, r.top), right: Math.max(o.right, r.right), bottom: Math.max(o.bottom, r.bottom) } : { left: r.left, top: r.top, right: r.right, bottom: r.bottom }; }); return o; }
  function hit(a, b) { return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top; }
  // the bubble touches the target with an arrow, on the side that covers none of the choices
  function inSheetNow() { return !resMode && !!$('#sheet [data-buy]'); }
  function place() {
    var c = $('#coach'); if (!c) return; var s = STEPS[step] || {}, A = 10, W = innerWidth, H = innerHeight;
    var sels = [], choices = [];
    if (resMode) sels = [anchorSel];
    else if (step === 3 && U.mode === 'res' && T.at) sels = [T.at];
    else if (T.cells && T.cells.length) { (step === 0 ? T.cells : T.cells.slice(0, 1)).forEach(function (k) { sels.push('.cell[data-cell="' + k + '"]'); }); }
    else if (T.card !== undefined && T.card !== null && T.at) sels = [T.at];
    else sels = [anchorSel || s.at || s.anchor];
    var t = inSheetNow() ? R('#sheet [data-buy]') : (!resMode && (step === 0 || step === 5) && U.sel.length === 3) ? R('#takebtn') : union(sels);
    if (!resMode && (step === 0 || step === 5) && U.sel.length === 3) { sels = ['#takebtn']; }
    if (!t) { var fb = $('#hintbtn'); t = fb ? fb.getBoundingClientRect() : { left: 0, top: 46, right: W, bottom: 90 }; }
    // choices that the bubble must not cover: the target plus the enabled gems / glowing cards / buttons
    choices.push(t);
    if (!resMode) { document.querySelectorAll('.cell:not(.dim):not(.off), .card.glow, .card.can, .favb.glow, #takebtn:not([disabled]), #sheet [data-buy]').forEach(function (e) { if (e.id === 'takebtn' && U.sel.length !== 3) return; if (T.cells && e.classList.contains('cell') && T.cells.indexOf(+e.dataset.cell) < 0) return; var r = e.getBoundingClientRect(); if (r.width) choices.push(r); }); }
    c.style.width = Math.min(inSheetNow() ? 180 : 300, W - 16) + 'px'; c.style.left = '0px'; c.style.top = '0px';
    var bw = c.offsetWidth, bh = c.offsetHeight, cx = (t.left + t.right) / 2;
    var inSheet = !resMode && !!$('#sheet [data-buy]'), cy = (t.top + t.bottom) / 2;
    var left = Math.max(8, Math.min(W - 8 - bw, cx - bw / 2));
    var cand = [{ d: 'below', top: t.bottom + A, left: left, pen: inSheet ? 50 : 0 }, { d: 'above', top: t.top - A - bh, left: left, pen: inSheet ? 50 : 0 },
      { d: 'right', top: cy - bh / 2, left: t.right + A, pen: 1 }, { d: 'left', top: cy - bh / 2, left: t.left - A - bw, pen: 1 }];
    var best = null;
    cand.forEach(function (k) {
      var box = { left: k.left, right: k.left + bw, top: k.top, bottom: k.top + bh }, sc = k.pen;
      if (box.top < 46) sc += 1000 + (46 - box.top); if (box.bottom > H - 4) sc += 1000 + (box.bottom - H + 4);
      if (box.left < 6) sc += 1000 + (6 - box.left); if (box.right > W - 6) sc += 1000 + (box.right - W + 6);
      choices.forEach(function (r) { if (hit(box, r)) sc += 100; });
      k.sc = sc; if (!best || sc < best.sc) best = k;
    });
    c.style.left = best.left + 'px'; c.style.top = Math.max(46, Math.min(H - bh - 4, best.top)) + 'px';
    ['arr-up', 'arr-down', 'arr-l', 'arr-r'].forEach(function (k) { c.classList.remove(k); });
    c.classList.add({ below: 'arr-up', above: 'arr-down', right: 'arr-l', left: 'arr-r' }[best.d]);
    c.style.setProperty('--ax', Math.max(18, Math.min(bw - 18, cx - best.left)) + 'px');
    c.style.setProperty('--ay', Math.max(14, Math.min(bh - 14, cy - parseFloat(c.style.top))) + 'px');
  }
  function skipBtn() {
    var k = $('#coachskip'); if (!k) { k = document.createElement('button'); k.id = 'coachskip'; k.className = 'btn'; k.textContent = 'Skip guide'; k.onclick = end; document.body.appendChild(k); }
  }
  function coach(text, btn) {
    var c = $('#coach'); if (!c) { c = document.createElement('div'); c.id = 'coach'; document.body.appendChild(c); }
    c.classList.remove('res'); c.innerHTML = '<span class="t">' + text + '</span>' + (btn ? '<button class="btn" data-next>' + btn + '</button>' : '');
    var n = c.querySelector('[data-next]'); if (n) n.onclick = function () { go(step + 1); };
    skipBtn(); place();
  }
  function showRes() { if (!T.res) return; resMode = true; anchorSel = T.res[1]; coach(T.res[0]); $('#coach').classList.add('res'); var k = $('#coachskip'); if (k) k.style.visibility = 'visible'; }
  function finger(sel) {
    var f = $('.finger'); if (f) f.remove(); if (!sel) return;
    var e = $(sel); if (!e) return; var r = e.getBoundingClientRect();
    f = document.createElement('div'); f.className = 'finger'; f.style.left = (r.left + r.width / 2 - 17) + 'px'; f.style.top = (r.top + r.height / 2 - 17) + 'px'; document.body.appendChild(f);
  }
  function go(i) {
    step = i; var s = STEPS[i]; if (!s) return end();
    T.cells = s.cells || null; T.card = s.card; T.noFav = !!s.noFav; T.allowStep = s.allow; fingerFor = s.at || null; T.at = s.at || null; if (i === 3) { T.card = U.G.pyr[0][0]; T.at = fingerFor = '.card[data-id="' + T.card + '"]'; } resMode = false; anchorSel = s.anchor || null; T.res = null; T.favCell = undefined;
    if (s.gold) { T.cells = []; U.G.board.forEach(function (t, k) { if (t === 'o') T.cells.push(k); }); fingerFor = '.cell[data-cell="' + T.cells[0] + '"]'; }
    coach(s.say, s.info);
    UI.render();
  }
  function end() {
    var c = $('#coach'); if (c) c.remove(); var k = $('#coachskip'); if (k) k.remove(); finger(null); U.tut = null; UI.LS('oa_seen', '1'); UI.render();
    if (U.G && U.G.turn === 1 && !U.G.over) UI.aiTurn();
  }
  function start() {
    T = { allow: function (m) { if (/^(wild|tok|steal|royal|disc)$/.test(m.t)) return true; var ok = !T.allowStep || T.allowStep(m); if (ok && /^(take|buy|reserve)$/.test(m.t)) T.lastOk = step; return ok; },
      onMove: function (m, ev) {
        if (ev && ev.p === 1) return;   // the rival's moves never advance the lesson
        var s = STEPS[step]; if (!s || s.info) return;
        var P = U.G.pl[0], d = E.points(P) - (T.pts || 0), g = E.tokens(P) + ' of 10 gems kept';
        if (m.t === 'take') T.res = ['You took ' + m.cells.length + ' gems: ' + '+' + d + ' points, ' + g, '#me .cols'];
        else if (m.t === 'buy') T.res = ['You bought it: +' + d + ' points, ' + g, '#me .race'];
        else if (m.t === 'reserve') T.res = ['Gold keeps it for you: ' + P.res.length + ' of 3 kept', '#me .cols'];
        else if (m.t === 'fav') { T.res = ['You took a gem free: ' + g, '#me .cols']; showRes(); setTimeout(function () { if (U.tut) go(5); }, 1800); return; }
        if (T.res && step !== 4) showRes();
        if (m.t === 'fav' && step === 4) { return; }
        if (T.lastOk === step && /^(take|buy|reserve)$/.test(m.t)) { T.lastOk = -1; T.waitRival = step + 1; }
      },
      onRender: function () {
        if (T.waitRival !== undefined && U.G.turn === 0 && !U.busy && !U.G.pend) { var n = T.waitRival; T.waitRival = undefined; go(n); return; }
        if (U.G.turn === 0 && !U.busy) finger(U.mode === 'res' && step === 3 ? T.at : U.sel.length === 3 && (step === 0 || step === 5) ? '#takebtn' : document.querySelector('#sheet [data-buy]:not([disabled])') ? '#sheet [data-buy]' : fingerFor);
        else finger(null);
        var co = $('#coach'); if (co) co.style.visibility = (U.G.turn === 1 || U.busy) && !STEPS[step].info && !resMode ? 'hidden' : 'visible';
        var c = $('#coach .t');
        if (c && step === 3 && U.mode === 'res') c.textContent = 'Now tap any jewel to keep it.';
        if (c && (step === 0 || step === 5) && U.sel.length === 3 && !resMode) c.textContent = 'Tap Take.';
        if (step === 4 && U.mode === 'fav' && T.favCell === undefined) {
          T.favCell = U.G.board.findIndex(function (t) { return t && t !== 'o' && t !== 'p'; }); T.cells = [T.favCell]; fingerFor = '.cell[data-cell="' + T.favCell + '"]'; UI.render(); return;
        }
        T.pts = E.points(U.G.pl[0]);
        if (c && step === 4 && U.mode === 'fav') c.textContent = 'Tap this gem to take it.';
        if (c && step === 1 && !resMode && document.querySelector('#sheet [data-buy]')) c.textContent = 'Tap Buy.';
        place();
      } };
    UI.newGame('easy', 1, 0); U.tut = T; U.G = setup(); U.sel = []; U.mode = null;
    var t0 = document.getElementById('toast'); if (t0) t0.classList.remove('on');
    go(0); T.timer = setInterval(function () { if (!U.tut) return clearInterval(T.timer); place(); }, 200);
    // the Buy button sits in a sheet: point at it when it opens
    document.addEventListener('click', function () { if (U.tut) setTimeout(function () { if (U.tut) U.tut.onRender(); }, 60); });
  }
  return { start: start, setup: setup, steps: STEPS, anchor: function () { return resMode ? anchorSel : null; } };
})();
