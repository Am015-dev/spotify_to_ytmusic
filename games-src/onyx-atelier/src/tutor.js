// Onyx Atelier guide: a floating window (drag, minimise to a chip, close) that walks a new player through the game in play order:
// 1 goal + labelled screen map, 2 take gems, 3 read and buy a jewel, 4 bonuses, 5 keep with gold, 6 Favours and refills, 7 powers and patrons,
// 8 the three wins, 9 a practice game. It never dims or blocks: every tap still works; a pulse ring only suggests. (FLAG: none)
var OTUT = (function () {
  var E = OE, U = UI.U, X = OD.TXT, step = 0, T = null, ringSel = null, pos = null, mini = false, mapPick = null, hintKey = '', hintMove = null;
  var TARGET = 1;   // a Ring: 1 Diamond, 1 Sapphire, 1 Emerald, 1 Onyx
  function $(s) { return document.querySelector(s); }
  function setup() {
    var G = E.newGame(424242, 1);   // the rival "starts", so you hold the starting Favour
    var all = G.bag.slice(); G.board.forEach(function (t) { if (t) all.push(t); }); G.bag = []; G.board = G.board.map(function () { return null; });
    function take(c) { var i = all.indexOf(c); all.splice(i, 1); return c; }
    G.pl[0].t.u = 1; take('u'); G.pl[0].t.g = 1; take('g');
    G.board[0] = take('w'); G.board[1] = take('k'); G.board[2] = take('r');
    G.board[12] = take('o'); G.board[18] = take('p');
    E.shuffle(G, all);
    for (var i = 0; i < 25; i++) if (G.board[i] === null && all.length) G.board[i] = all.pop();
    G.bag = all;
    var d = G.decks[0], at = d.indexOf(TARGET);
    if (at >= 0) { d[at] = G.pyr[0][2]; G.pyr[0][2] = TARGET; } else { var k = G.pyr[0].indexOf(TARGET); G.pyr[0][k] = G.pyr[0][2]; G.pyr[0][2] = TARGET; }
    G.turn = 0;
    E.checkInvariants(G);
    return G;
  }
  // ---- staging: before a lesson, set up the teaching position (every token and card stays accounted for)
  function pull(G, c, keep) {
    var i = G.bag.indexOf(c); if (i >= 0) { G.bag.splice(i, 1); return c; }
    for (i = 0; i < 25; i++) if (G.board[i] === c && !(keep && keep.indexOf(i) >= 0)) { G.board[i] = null; return c; }
    if (G.pl[1].t[c] > 0) { G.pl[1].t[c]--; return c; }
    throw new Error('no ' + c);
  }
  function putCell(G, cell, c) { if (G.board[cell] === c) return; var old = G.board[cell]; G.board[cell] = null; G.board[cell] = pull(G, c, [cell]); if (old) G.bag.push(old); }
  function topUp(G, spec) { var P = G.pl[0]; Object.keys(spec).forEach(function (c) { while (P.t[c] < spec[c]) { pull(G, c); P.t[c]++; } }); }
  function trim(G) { var P = G.pl[0]; while (E.tokens(P) > 8) { var c = ['p', 'r', 'w', 'u', 'g', 'k'].filter(function (k) { return P.t[k] > 0; })[0]; if (!c) break; P.t[c]--; G.bag.push(c); } }
  function scrolls(G, mine) { G.pl[0].fav = mine; G.pl[1].fav = 0; G.fav = 3 - mine; }
  function pluck(G, id) {
    var l = E.card(id).lvl - 1, at = G.decks[l].indexOf(id);
    if (at >= 0) { G.decks[l].splice(at, 1); return true; }
    var k = G.pyr[l].indexOf(id); if (k >= 0) { G.pyr[l][k] = G.decks[l].length ? G.decks[l].pop() : null; return true; }
    return false;   // already owned or kept by someone: leave it
  }
  function place(G, id) { var l = E.card(id).lvl - 1; if (G.pyr[l][2] === id) return true; if (!pluck(G, id)) return false; var old = G.pyr[l][2]; G.pyr[l][2] = id; if (old !== null && old !== undefined) G.decks[l].push(old); return true; }
  function own(G, ids) { ids.forEach(function (id) { var P = G.pl[0]; if (P.cards.indexOf(id) < 0 && pluck(G, id)) P.cards.push(id); }); }
  function isMain(m) { return /^(take|buy|reserve)$/.test(m.t); }
  var NM = { w: 'Diamond', u: 'Sapphire', g: 'Emerald', r: 'Ruby', k: 'Onyx', p: 'pearl', o: 'gold' };
  function cardSel(id) { return '#pyr .card[data-id="' + id + '"]'; }

  // ---- the screen map: every part of the screen with a label and one sentence
  var MAP = [
    { sel: '#menubtn', name: 'Menu', say: 'New game, this guide, sound and the title screen.' },
    { sel: '#status', name: 'Status', say: 'Says whose turn it is and what you can do now.' },
    { sel: '#logbtn', name: 'Log', say: 'Every move so far, yours and your rival\'s.' },
    { sel: '#hintbtn', name: 'Hint', say: 'Shows you one good move.' },
    { sel: '#rulesbtn', name: 'Rules', say: 'All the rules on one page, and this map again.' },
    { sel: '#rival', name: 'Rival', say: 'Your rival\'s gems, bonuses, points and crowns.' },
    { sel: '#pyr', name: 'Jewels', say: 'Jewels for sale: Rings at the bottom, Tiaras on top. Tap one to see it up close.' },
    { sel: '#board', name: 'Gem board', say: 'Take gems from here: 1 to 3 touching, in one straight line.' },
    { sel: '#side .sbox[data-info="fav"]', name: 'Favours', say: 'Favours still in the supply. You get one when your rival refills or takes greedily.' },
    { sel: '#side .pat', name: 'Patrons', say: 'Patrons: you choose one at 3 crowns and another at 6.' },
    { sel: '#refillbtn', name: 'Refill', say: 'Refills the board from the bag. Your rival gets a Favour.' },
    { sel: '#me .cols', name: 'Your gems', say: 'Your gems, and the bonus your jewels give in each colour.' },
    { sel: '#me .race', name: 'Your race', say: 'Points, crowns and best colour: your three roads to a win.' }
  ];

  // ---- lessons, in the order a player really meets them. Each: one sentence + why + a checklist.
  var LESSONS = [
    { key: 'map', no: 1, title: 'Your goal and your screen', say: X.win, why: 'Gems buy jewels; jewels bring points and crowns. That is the whole game.', map: true,
      checks: ['Look over the labelled screen', 'Tap a label to learn that part'], next: 'Start' },
    { key: 'take', no: 2, title: 'Your first turn: take gems', say: X.take, why: 'Gems are the money you pay for jewels with. ' + X.limit, cells: [0, 1, 2],
      checks: ['Tap 3 touching gems in a line', 'Tap Take'], on: function (m) { return m.t === 'take'; } },
    { key: 'buy', no: 3, title: 'Read a jewel, then buy it', say: 'A jewel shows its cost at the bottom, its colour and points at the top, and any crowns or power.', why: X.buy,
      card: TARGET, checks: ['Tap the ringed jewel to see it up close', 'Check what you pay', 'Tap Buy'],
      stage: function (G) { if (place(G, TARGET)) topUp(G, { w: 1, u: 1, g: 1, k: 1 }); }, on: function (m) { return m.t === 'buy'; } },
    { key: 'bonus', no: 4, title: 'Bonuses make jewels cheaper', say: X.bonus, why: 'Cheap jewels early make the big ones nearly free later.', at: '#me .cols',
      checks: ['Find the bonus under your gems'], next: 'Next' },
    { key: 'keep', no: 5, title: 'Keep a jewel with gold', say: X.keep, why: 'Gold is the only wild token, and a kept jewel is safe from your rival.', gold: true,
      checks: ['Tap a gold on the board', 'Tap any jewel to keep it'], stage: function (G) { if (G.pl[0].res.length < 3) putCell(G, 12, 'o'); }, on: function (m) { return m.t === 'reserve'; } },
    { key: 'fav', no: 6, title: 'Favours and refills', say: X.fav + ' ' + X.refill, why: X.takeFav + ' So a refill or a greedy take hands your rival a free gem.', at: '#me .favb',
      checks: ['Tap your scroll, then a gem (a Favour)', 'If you like, tap Refill', 'Make your move'],
      stage: function (G) { scrolls(G, 1); G.refilled = false; [20, 21, 22].forEach(function (c) { if (G.board[c]) { G.bag.push(G.board[c]); G.board[c] = null; } }); }, on: isMain },
    { key: 'power', no: 7, title: 'Powers', say: X.power, why: 'A power happens once, the moment you buy the jewel.', card: 13,
      checks: ['Buy the ringed jewel', 'Take the gem its power gives you'],
      stage: function (G) { trim(G); if (place(G, 13)) { topUp(G, { r: 2, k: 2 }); putCell(G, 7, 'w'); } }, on: function (m) { return m.t === 'buy'; } },
    { key: 'patron', no: 7, title: 'Crowns bring patrons', say: X.crowns, why: 'A patron is free points, and some add a power.', card: 11,
      checks: ['Buy the ringed jewel: it has a crown', 'Choose any patron'],
      stage: function (G) { trim(G); if (place(G, 11)) { own(G, [3, 9]); topUp(G, { u: 3 }); G.pl[0].rq1 = 0; } }, on: function (m) { return m.t === 'buy'; } },
    { key: 'win', no: 8, title: 'Three ways to win', say: function () { var P = U.G.pl[0], bc = E.bestColour(P);
      return X.win + ' You have ' + E.points(P) + ' of 20 points, ' + E.crowns(P) + ' of 10 crowns, ' + bc.v + ' of 10 in ' + NM[bc.c] + '.'; },
      why: 'Watch all three: the fastest road changes every game.', at: '#me .race', checks: ['Read your three counters'], next: 'Next' },
    { key: 'practice', no: 9, title: 'Practice: finish this game', say: function () { return nowLine(); }, why: 'You know every rule now. The ring shows a good move, but any move is fine.',
      practice: true, checks: ['Play until someone wins'], next: 'End guide' }
  ];
  var STEPS = LESSONS;

  // ---- what to do now (practice): the normal-strength hint in plain words
  function hint() {
    var g = U.G, key = g.n + '|' + g.turn + '|' + JSON.stringify(g.pend) + '|' + g.refilled + '|' + g.board.join() + '|' + JSON.stringify(g.pl[0].t);
    if (key !== hintKey) { hintKey = key; try { hintMove = OAI.hint(g)[0] || null; } catch (e) { hintMove = null; } }
    return hintMove;
  }
  function nowLine() {
    var g = U.G; if (g.over) return g.over.winner === 0 ? 'You won! Close the guide when you are ready.' : 'Your rival won this one. Close the guide and play again.';
    if (g.turn !== 0 || U.busy) return 'Your rival is playing.';
    var m = hint(); if (!m) return 'Make any move.';
    return { take: 'Take the ringed gems: tap each, then Take.', buy: 'Buy the ringed jewel: tap it, then Buy.', reserve: 'Tap a gold, then the ringed jewel to keep it.',
      refill: 'Tap Refill: it is the only move left.', fav: 'Use your Favour: tap the scroll, then the ringed gem.', tok: 'Take the ringed gem your power gives.',
      steal: 'Take one of your rival\'s gems.', royal: 'Choose a patron.', disc: 'You have more than 10: tap your gems to return some.', wild: 'Choose the colour this jewel joins.',
      pass: 'Nothing is possible: pass.' }[m.t] || 'Make any move.';
  }
  function hintSel(m) {
    if (!m) return null;
    if (m.t === 'take') { var nx = m.cells.filter(function (c) { return U.sel.indexOf(c) < 0; }); return nx.length ? '.cell[data-cell="' + nx[0] + '"]' : '#takebtn'; }
    if (m.t === 'buy') return $('#sheet [data-buy]') ? '#sheet [data-buy]' : m.res !== undefined ? '#resbtn' : '.card[data-l="' + m.l + '"][data-i="' + m.i + '"]';
    if (m.t === 'reserve') return U.mode === 'res' ? (m.deck ? '.card.back[data-deck="' + m.l + '"]' : '.card[data-l="' + m.l + '"][data-i="' + m.i + '"]') : '.cell[data-cell="' + m.gold + '"]';
    if (m.t === 'refill') return '#refillbtn';
    if (m.t === 'fav') return U.mode === 'fav' ? '.cell[data-cell="' + m.cell + '"]' : '#me .favb';
    if (m.t === 'tok') return '.cell[data-cell="' + m.cell + '"]';
    if (m.t === 'steal') return '#rival .col[data-c="' + m.c + '"]';
    if (m.t === 'disc' || m.t === 'wild') return '#me .col[data-c="' + m.c + '"]';
    if (m.t === 'royal') return '[data-pick="' + m.id + '"]';
    return null;
  }

  // ---- the suggestion for the current lesson (only a ring: nothing else changes)
  function suggest() {
    var s = STEPS[step], g = U.G, q = g.pend;
    if (!s || g.over || g.turn !== 0 || U.busy) return null;
    if (s.practice) return hintSel(hint());
    if (q && q.h === 'tok') return '#board .cell.glow';
    if (q && q.h === 'royal') return '.patc';
    if (q && q.h === 'disc') return '#me .col.glow';
    if (q && q.h === 'wild') return '#me .col.glow';
    if (q && q.h === 'steal') return '#rival .col.glow';
    if ($('#sheet [data-buy]:not([disabled])')) return '#sheet [data-buy]';
    if (s.cells) { var nx = s.cells.filter(function (x) { return U.sel.indexOf(x) < 0; }); if (U.sel.length >= 3 || !nx.length) return '#takebtn'; return '.cell[data-cell="' + nx[0] + '"]'; }
    if (s.gold) { if (U.mode === 'res') return '#pyr .card.glow'; var gi = g.board.indexOf('o'); return gi >= 0 ? '.cell[data-cell="' + gi + '"]' : null; }
    if (s.key === 'fav') { if (U.mode === 'fav') return '#board .cell.glow'; if (s.ticks[0] && !g.refilled && g.bag.length) return '#refillbtn'; return g.pl[0].fav ? '#me .favb' : null; }
    if (s.card !== undefined) return $(cardSel(s.card)) ? cardSel(s.card) : null;
    return s.at || null;
  }
  // checklist ticks from what the player has done so far
  function tickFromState() {
    var s = STEPS[step], g = U.G; if (!s) return;
    if (s.key === 'take' && U.sel.length >= 3) s.ticks[0] = true;
    if ((s.key === 'buy') && $('#sheet [data-buy]')) { s.ticks[0] = true; s.ticks[1] = true; }
    if (s.key === 'keep' && U.mode === 'res') s.ticks[0] = true;
    if (s.key === 'map' && mapPick) s.ticks[1] = true;
    if (s.key === 'practice' && g.over) s.ticks[0] = true;
  }

  // ---- DOM: #coach is the root (the game ignores taps inside it); window, chip, ring and map live in it
  function root() {
    var c = $('#coach'); if (c) return c;
    c = document.createElement('div'); c.id = 'coach';
    c.innerHTML = '<svg class="tmap" aria-hidden="true"></svg><div class="tlabels"></div><div class="tring" aria-hidden="true"></div>' +
      '<div class="twin" role="dialog" aria-label="Guide"><div class="thead"><span class="tno"></span><button class="tb" data-tq aria-label="Show the screen map">?</button>' +
      '<button class="tb" data-tmin aria-label="Minimise the guide">&#8211;</button><button class="tb" data-tx aria-label="Close the guide">&#215;</button></div>' +
      '<b class="ttl"></b><p class="tsay"></p><p class="twhy"></p><div class="tleg"></div><ul class="tchk"></ul><div class="tfoot"><button class="btn" data-tnext></button></div></div>' +
      '<button class="tchip" data-tchip aria-label="Open the guide"></button>';
    document.body.appendChild(c);
    c.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.hasAttribute('data-tnext')) return next();
      if (b.hasAttribute('data-tx')) return end();
      if (b.hasAttribute('data-tmin')) { mini = true; return paint(); }
      if (b.hasAttribute('data-tchip')) { mini = false; return paint(); }
      if (b.hasAttribute('data-tq')) { showMap(!T.mapOn); return; }
      if (b.dataset.map !== undefined) { mapPick = +b.dataset.map; tickFromState(); paint(); }
    });
    drag(c.querySelector('.thead'), c.querySelector('.twin'));
    return c;
  }
  function drag(handle, w) {
    var sx, sy, ox, oy, on = false;
    handle.addEventListener('pointerdown', function (e) { if (e.target.closest('button')) return; on = true; sx = e.clientX; sy = e.clientY; ox = w.offsetLeft; oy = w.offsetTop; try { handle.setPointerCapture(e.pointerId); } catch (x) {} });
    handle.addEventListener('pointermove', function (e) { if (!on) return; pos = { left: clampX(ox + e.clientX - sx, w.offsetWidth), top: clampY(oy + e.clientY - sy, w.offsetHeight) }; w.style.left = pos.left + 'px'; w.style.top = pos.top + 'px'; });
    handle.addEventListener('pointerup', function () { on = false; });
  }
  function clampX(x, w) { return Math.max(4, Math.min(innerWidth - w - 4, x)); }
  function clampY(y, h) { return Math.max(4, Math.min(innerHeight - h - 4, y)); }
  function R(q) { var e = typeof q === 'string' ? $(q) : q; if (!e) return null; var r = e.getBoundingClientRect(); return r.width ? r : null; }
  function hit(a, b, pad) { pad = pad || 0; return a.left < b.right + pad && a.right > b.left - pad && a.top < b.bottom + pad && a.bottom > b.top - pad; }
  function area(a, b) { var w = Math.min(a.right, b.right) - Math.max(a.left, b.left), h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top); return w > 0 && h > 0 ? w * h : 0; }

  // the window goes where it covers neither the suggestion nor what the lesson explains; a spot the player dragged it to is kept while it is clear
  function placeWin(w, avoid, soft) {
    var W = innerWidth, H = innerHeight, bw = w.offsetWidth, bh = w.offsetHeight;
    function score(b) { var sc = 0; avoid.forEach(function (r) { sc += area(b, r) ? 1e6 + area(b, r) : 0; }); soft.forEach(function (r) { sc += area(b, r) / Math.max(400, (r.right - r.left) * (r.bottom - r.top)) * 1000; }); return sc; }
    if (pos) { var pb = { left: pos.left, top: pos.top, right: pos.left + bw, bottom: pos.top + bh }; if (score(pb) < 1e6) { w.style.left = pos.left + 'px'; w.style.top = pos.top + 'px'; return; } }
    var best = null, xs = [6, (W - bw) / 2, W - bw - 6], ys = [];
    for (var y = 48; y <= H - bh - 6; y += 24) ys.push(y); ys.push(H - bh - 6);
    xs.forEach(function (x) { ys.forEach(function (y) { var b = { left: x, top: y, right: x + bw, bottom: y + bh }; var sc = score(b) + Math.abs(y - (H - bh) / 2) * 0.01; if (!best || sc < best.sc) best = { sc: sc, b: b }; }); });
    w.style.left = Math.round(best.b.left) + 'px'; w.style.top = Math.round(best.b.top) + 'px';
  }
  function paintRing(sel) {
    var r = $('#coach .tring'), t = sel && R(sel);
    if (!t) { r.style.display = 'none'; return null; }
    r.style.display = 'block'; r.style.left = (t.left - 5) + 'px'; r.style.top = (t.top - 5) + 'px'; r.style.width = (t.width + 10) + 'px'; r.style.height = (t.height + 10) + 'px';
    return t;
  }
  // ---- map labels: each label sits near its part, clear of every other label and the window, with a leader line
  function layoutMap() {
    var c = root(), lab = c.querySelector('.tlabels'), svg = c.querySelector('.tmap'), w = c.querySelector('.twin'), leg = c.querySelector('.tleg');
    if (!T.mapOn) { lab.innerHTML = ''; svg.innerHTML = ''; leg.innerHTML = ''; return; }
    var W = innerWidth, H = innerHeight, items = MAP.map(function (m, i) { return { m: m, i: i, r: R(m.sel) }; }).filter(function (x) { return x.r; });
    // the part names are a tidy list inside the window; only the part you pick gets ONE callout on the board
    var lg = items.map(function (x) { return '<button class="tlab' + (mapPick === x.i ? ' on' : '') + '" data-map="' + x.i + '">' + x.m.name + '</button>'; }).join('');
    if (leg.innerHTML !== lg) leg.innerHTML = lg;
    lab.innerHTML = ''; svg.innerHTML = ''; svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    var pk = items.filter(function (x) { return x.i === mapPick; })[0]; if (!pk) return;
    var r = pk.r; lab.innerHTML = '<span class="tcall">' + pk.m.name + '</span>'; var el = lab.firstChild, bw = el.offsetWidth, bh = el.offsetHeight, wr = w.style.display === 'none' ? null : R(w), best = null;
    var cx = (r.left + r.right) / 2, cy = (r.top + r.bottom) / 2, cands = [];
    [8, 24, 48, 80].forEach(function (d) { cands.push([cx - bw / 2, r.bottom + d], [cx - bw / 2, r.top - d - bh], [r.right + d, cy - bh / 2], [r.left - d - bw, cy - bh / 2]); });
    cands.push([cx - bw / 2, r.top + 6]);
    cands.forEach(function (p) {
      var b = { left: p[0], top: p[1], right: p[0] + bw, bottom: p[1] + bh };
      if (b.left < 4 || b.right > W - 4 || b.top < 4 || b.bottom > H - 4) return;
      if (wr && hit(b, wr, 4)) return;
      var sc = Math.hypot((b.left + b.right) / 2 - cx, (b.top + b.bottom) / 2 - cy); if (!best || sc < best.sc) best = { sc: sc, b: b };
    });
    if (!best) { el.style.display = 'none'; return; }
    el.style.left = Math.round(best.b.left) + 'px'; el.style.top = Math.round(best.b.top) + 'px';
    var lx = (best.b.left + best.b.right) / 2, ly = (best.b.top + best.b.bottom) / 2, tx = Math.max(r.left + 3, Math.min(r.right - 3, lx)), ty = Math.max(r.top + 3, Math.min(r.bottom - 3, ly));
    svg.innerHTML = '<line x1="' + Math.max(best.b.left, Math.min(best.b.right, tx)) + '" y1="' + Math.max(best.b.top, Math.min(best.b.bottom, ty)) + '" x2="' + tx + '" y2="' + ty + '"/><circle cx="' + tx + '" cy="' + ty + '" r="4"/>';
  }
  function showMap(on) { T.mapOn = on; if (!on) mapPick = null; var lab = $('#coach .tlabels'); if (lab) lab.innerHTML = ''; paint(); }

  // ---- paint the window for the current step
  function paint() {
    if (!U.tut) return;
    var c = root(), s = STEPS[step], w = c.querySelector('.twin'), chip = c.querySelector('.tchip'); if (!s) return;
    tickFromState();
    c.querySelector('.tno').textContent = 'Lesson ' + s.no + ' of 9';
    c.querySelector('.ttl').textContent = s.title;
    var say = typeof s.say === 'function' ? s.say() : s.say;
    if (T.mapOn && mapPick !== null) say = MAP[mapPick].name + ': ' + MAP[mapPick].say;
    c.querySelector('.tsay').textContent = say;
    c.querySelector('.twhy').textContent = T.mapOn && mapPick !== null ? '' : 'Why: ' + s.why;
    var ul = c.querySelector('.tchk'), lis = s.checks.map(function (t, i) { return '<li' + (s.ticks[i] ? ' class="ok"' : '') + '>' + t + '</li>'; }).join('');
    if (ul.innerHTML !== lis) ul.innerHTML = lis;
    var nb = c.querySelector('[data-tnext]'); nb.textContent = s.next || 'Skip this step';
    chip.textContent = 'Guide ' + s.no + '/9';
    w.style.display = mini ? 'none' : ''; chip.style.display = mini ? '' : 'none';
    ringSel = suggest();
    var ring = paintRing(ringSel), avoid = [], soft = [];
    if (ring) avoid.push(ring);
    var ex = s.at && R(s.at); if (ex) avoid.push(ex);
    var sh = R('#sheet') || R('.modal'); if (sh) avoid.push(sh);
    if (s.cells) s.cells.forEach(function (k) { var r = R('.cell[data-cell="' + k + '"]'); if (r) avoid.push(r); });
    var tb = R('#takebtn'); if (tb) avoid.push(tb);
    if (innerWidth >= 1000) { var bd = R('#board'); if (bd && !T.mapOn) avoid.push(bd); ['#rival', '#pyr'].forEach(function (q) { var rv = R(q); if (rv && T.mapOn) avoid.push(rv); }); }   // PC: the guide never sits on the gem board
    if (T.mapOn) { if (mapPick !== null) { var pr = R(MAP[mapPick].sel); if (pr) avoid.push(pr); } ['#board', '#pyr', '#me', '#side'].forEach(function (q) { var r = R(q); if (r) soft.push(r); }); }
    else ['#board', '#pyr', '#me', '#side'].forEach(function (q) { var r = R(q); if (r) soft.push(r); });
    if (!mini) placeWin(w, avoid, soft);
    layoutMap();
  }

  function go(i) {
    step = i; var s = STEPS[i]; if (!s) return end();
    s.ticks = s.checks.map(function () { return false; });
    if (s.stage) { try { var g2 = E.clone(U.G); s.stage(g2); E.checkInvariants(g2); U.G = g2; } catch (e) { /* the position cannot be staged: the lesson still teaches by text */ } U.sel = []; U.mode = null; }
    if (s.map !== T.mapOn) showMap(!!s.map);
    UI.render(); paint();
  }
  function next() {
    var s = STEPS[step]; if (!s) return end();
    if (s.practice) return end();
    if (U.G.turn !== 0 || U.busy || U.G.pend) { T.waitNext = step + 1; return; }
    go(step + 1);
  }
  function end() {
    var c = $('#coach'); if (c) c.remove(); clearInterval(T && T.timer); U.tut = null; UI.LS('oa_seen', '1'); UI.render();
    if (U.G && U.G.turn === 1 && !U.G.over) UI.aiTurn();
  }
  function start() {
    T = { mapOn: false,
      onMove: function (m, ev) {
        if (ev && ev.p === 1) return;   // the rival's moves never advance a lesson
        var s = STEPS[step]; if (!s) return;
        if (s.key === 'take' && m.t === 'take') { s.ticks[0] = s.ticks[1] = true; }
        if (s.key === 'buy' && m.t === 'buy') s.ticks = [true, true, true];
        if (s.key === 'keep' && m.t === 'reserve') s.ticks = [true, true];
        if (s.key === 'fav') { if (m.t === 'fav') s.ticks[0] = true; if (m.t === 'refill') s.ticks[1] = true; if (isMain(m)) s.ticks[2] = true; }
        if (s.key === 'power') { if (m.t === 'buy') s.ticks[0] = true; if (m.t === 'tok') s.ticks[1] = true; }
        if (s.key === 'patron') { if (m.t === 'buy') s.ticks[0] = true; if (m.t === 'royal') s.ticks[1] = true; }
        if (s.on && s.on(m)) T.waitNext = step + 1;   // the lesson is done; the next one starts when it is your turn again
      },
      onRender: function () {
        var g = U.G;
        if (T.waitNext !== undefined && g.turn === 0 && !U.busy && !g.pend) { var n = T.waitNext; T.waitNext = undefined; go(n); return; }
        if (step === STEPS.length - 1 && g.over && !STEPS[step].ticks[0]) STEPS[step].ticks[0] = true;
        paint();
      } };
    UI.newGame('easy', 1, 0); U.tut = T; U.G = setup(); U.sel = []; U.mode = null; mini = false; pos = null; mapPick = null;
    var t0 = document.getElementById('toast'); if (t0) t0.classList.remove('on');
    root(); go(0);
    T.timer = setInterval(function () { if (!U.tut) return clearInterval(T.timer); paint(); }, 300);
    if (!start.hooked) { start.hooked = true; document.addEventListener('click', function () { setTimeout(function () { if (U.tut) paint(); }, 0); }); }   // a sheet opened by a tap moves the ring at once
  }
  // the screen map on its own (the ? in the Rules panel), outside the guide
  function mapOnly() {
    if (U.tut) { showMap(true); return; }
    var old = $('#coach'); if (old) old.remove();
    var c = document.createElement('div'); c.id = 'coach'; c.innerHTML = '<svg class="tmap" aria-hidden="true"></svg><div class="tlabels"></div>' +
      '<div class="twin" role="dialog" aria-label="Screen map"><div class="thead"><span class="tno">Screen map</span><button class="tb" data-tx aria-label="Close the map">&#215;</button></div><p class="tsay">Tap a part to see it on the board.</p><div class="tleg"></div></div>';
    document.body.appendChild(c);
    var saveT = T, pick = null; T = { mapOn: true };
    function draw() { var w = c.querySelector('.twin'); if (pick !== null) c.querySelector('.tsay').textContent = MAP[pick].name + ': ' + MAP[pick].say; mapPick = pick;
      var soft = []; MAP.forEach(function (m) { var r = R(m.sel); if (r) soft.push(r); }); var mp = pos; pos = null; placeWin(w, [], soft); pos = mp; layoutMap(); }
    c.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; if (b.hasAttribute('data-tx')) { c.remove(); T = saveT; mapPick = null; return; } if (b.dataset.map !== undefined) { pick = +b.dataset.map; draw(); } });
    drag(c.querySelector('.thead'), c.querySelector('.twin'));
    draw();
  }
  return { start: start, setup: setup, steps: STEPS, map: MAP, mapOnly: mapOnly, target: function () { return ringSel; }, stepNo: function () { return step; }, next: next };
})();
