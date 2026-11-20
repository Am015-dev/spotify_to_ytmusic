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
    { say: 'Tap a gold coin. Gold keeps a jewel.', noFav: true, cells: null, at: '.cell[data-cell="12"]', allow: function (m) { return m.t === 'reserve'; } },
    { say: 'Tap your Favour scroll, then any gem.', at: '#me .favb', cells: null, allow: function (m) { return m.t === 'fav'; } },
    { say: 'Now take gems or buy. Your move!', cells: null, allow: function () { return true; } },
    { say: 'Win: 20 points, 10 crowns, or 10 in one colour.', info: 'Got it' },
    { say: 'Crowns win patrons. Refilling gives your rival a Favour.', info: 'Play on' }
  ];
  function coach(text, btn) {
    var c = $('#coach'); if (!c) { c = document.createElement('div'); c.id = 'coach'; document.body.appendChild(c); }
    var r = $('#rival').getBoundingClientRect(); c.style.top = Math.max(46, r.top) + 'px';
    c.innerHTML = '<span class="t">' + text + '</span>' + (btn ? '<button class="btn" data-next>' + btn + '</button>' : '') + '<button class="btn" data-skip>Skip</button>';
    c.querySelector('[data-skip]').onclick = end;
    var n = c.querySelector('[data-next]'); if (n) n.onclick = function () { go(step + 1); };
  }
  function finger(sel) {
    var f = $('.finger'); if (f) f.remove(); if (!sel) return;
    var e = $(sel); if (!e) return; var r = e.getBoundingClientRect();
    f = document.createElement('div'); f.className = 'finger'; f.style.left = (r.left + r.width / 2 - 17) + 'px'; f.style.top = (r.top + r.height / 2 - 17) + 'px'; document.body.appendChild(f);
  }
  function go(i) {
    step = i; var s = STEPS[i]; if (!s) return end();
    T.cells = s.cells || null; T.card = s.card; T.noFav = !!s.noFav; T.allowStep = s.allow;
    coach(s.say, s.info); fingerFor = s.at || null;
    UI.render();
  }
  function end() {
    var c = $('#coach'); if (c) c.remove(); finger(null); U.tut = null; UI.LS('oa_seen', '1'); UI.render();
    if (U.G && U.G.turn === 1 && !U.G.over) UI.aiTurn();
  }
  function start() {
    T = { allow: function (m) { if (/^(wild|tok|steal|royal|disc)$/.test(m.t)) return true; var ok = !T.allowStep || T.allowStep(m); if (ok && /^(take|buy|reserve)$/.test(m.t)) T.lastOk = step; return ok; },
      onMove: function (m, ev) {
        if (ev && ev.p === 1) return;   // the rival's moves never advance the lesson
        var s = STEPS[step]; if (!s || s.info) return;
        if (m.t === 'fav' && step === 3) { go(4); return; }
        if (T.lastOk === step && /^(take|buy|reserve)$/.test(m.t)) { T.lastOk = -1; T.waitRival = step + 1; }
      },
      onRender: function () {
        if (T.waitRival !== undefined && U.G.turn === 0 && !U.busy && !U.G.pend) { var n = T.waitRival; T.waitRival = undefined; go(n); return; }
        if (U.G.turn === 0 && !U.busy) finger(U.mode === 'res' && step === 2 ? '.card.glow' : U.sel.length === 3 && step === 0 ? '#takebtn' : document.querySelector('#sheet [data-buy]:not([disabled])') ? '#sheet [data-buy]' : fingerFor);
        else finger(null);
        var c = $('#coach .t');
        if (c && step === 2 && U.mode === 'res') c.textContent = 'Now tap any jewel to keep it.';
        if (c && step === 0 && U.sel.length === 3) c.textContent = 'Tap Take.';
      } };
    UI.newGame('easy', 1, 0); U.tut = T; U.G = setup(); U.sel = []; U.mode = null;
    var t0 = document.getElementById('toast'); if (t0) t0.classList.remove('on');
    go(0);
    // the Buy button sits in a sheet: point at it when it opens
    document.addEventListener('click', function () { if (U.tut) setTimeout(function () { if (U.tut) U.tut.onRender(); }, 60); });
  }
  return { start: start, setup: setup, steps: STEPS };
})();
