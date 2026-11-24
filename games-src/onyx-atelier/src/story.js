// Onyx Atelier story mode (shell/gx-campaign.js): campaign.json chapters -> real duels on the normal engine. (FLAG: none)
// Twists only change the starting state (rival-gems, rival-favours, rival-ring); rival play styles are extra AI weights (G.sty, ai.js).
var OST = (function () {
  var D = window.CAMPAIGN, E = OE;
  if (!window.GXC || !D) return null;
  function U() { return UI.U; }
  function camp() { return U().camp; }
  // count my turns, keeps and Favours on the live game only (the AI's look-ahead uses clones)
  var pm = E.performMove;
  E.performMove = function (G, m) {
    var c = camp();
    if (c && G === U().G && G.turn === 0 && !G.pend) {
      if (m.t === 'take' || m.t === 'reserve' || m.t === 'buy') c.mine++;
      if (m.t === 'reserve') c.kept++;
      if (m.t === 'fav') c.favUsed++;
    }
    return pm(G, m);
  };
  function metrics(G) {
    var P = G.pl[0], c = camp() || { mine: 0, kept: 0, favUsed: 0 }, b = E.bonuses(P), mb = 0;
    E.COLS.forEach(function (k) { mb = Math.max(mb, b[k]); });
    return { won: !!(G.over && G.over.winner === 0), turns: c.mine, kept: c.kept, favUsed: c.favUsed, crowns: E.crowns(P), points: E.points(P),
      jewels: P.cards.length, patrons: P.roy.length, favours: P.fav, bonus: mb, crownWin: G.over && G.over.winner === 0 && G.over.how === 'crowns' ? 1 : 0,
      powers: P.cards.filter(function (id) { return E.card(id).ab; }).length };
  }
  function goalOk(def, m) {
    var g = def.goal;
    if (g.type !== 'custom') return true;
    var v = m[g.key];
    return (g.max == null || v <= g.max) && (g.min == null || v >= g.min);
  }
  function isWon(G, def) { var m = metrics(G); return m.won && goalOk(def, m); }
  // ---------- start a chapter: a normal new game, then the chapter's starting changes
  function start(def) {
    var s = def.setup || {}, tw = def.twist, prev = UI.LS('oa_level');
    UI.newGame(def.opponent.aiLevel, s.seed || ((Math.random() * 1e9) | 0), s.first || 0);
    if (prev != null) UI.LS('oa_level', prev);   // a chapter never changes the quick-game strength
    var G = U().G, i;
    U().camp = { def: def, mine: 0, kept: 0, favUsed: 0 }; strip(true);
    for (i = 0; i < (s.favours || 0); i++) E.gainFav(G, 0);
    if (tw && tw.id === 'rival-gems') for (var n = 0, i = 0; i < 25 && n < tw.param; i++) { var t = G.board[i]; if (t && t !== 'o' && t !== 'p') { G.pl[1].t[t]++; G.board[i] = null; n++; } }
    if (tw && tw.id === 'rival-favours') for (i = 0; i < tw.param; i++) E.gainFav(G, 1);
    if (tw && tw.id === 'rival-ring') for (i = 0; i < tw.param; i++) {
      var d = G.decks[0], k = d.findIndex(function (id) { var c = E.card(id); return c.b && c.b !== 'x' && !c.ab; });
      if (k >= 0) G.pl[1].cards.push(d.splice(k, 1)[0]);
    }
    G.sty = def.opponent.ai ? { 1: def.opponent.ai } : null;
    E.checkInvariants(G);
    UI.render();
    if (G.turn === 1) UI.aiTurn();
    return G;
  }
  // ---------- the floating objective card (never takes taps)
  function strip(on) {   // reserve a strip under the bar for the goal card (inline, so layout() measures it at once)
    var bar = document.getElementById('bar'); document.documentElement.classList.toggle('camp', on);
    if (bar) { bar.style.flexBasis = on ? '88px' : ''; bar.style.paddingBottom = on ? '44px' : ''; }
    var again = function () { if (U().G) UI.layout(); };   // again once any transition on the bar has finished
    if (bar) bar.addEventListener('transitionend', again, { once: true }); setTimeout(again, 1500);
  }
  function render() {
    var c = camp(), el = document.getElementById('obj');
    var root = document.documentElement, want = !!(c && U().G);
    if (root.classList.contains('camp') !== want) { strip(want); if (U().G) UI.layout(); }
    if (!want) { if (el) el.remove(); return; }
    if (!el) { el = document.createElement('div'); el.id = 'obj'; el.setAttribute('aria-live', 'polite'); document.body.appendChild(el); }
    var def = c.def, g = def.goal, m = metrics(U().G), n = D.chapters.findIndex(function (x) { return x.id === def.id; }) + 1, prog = '';
    if (g.type === 'custom' && g.key === 'turns') prog = 'Turn ' + Math.min(m.turns + 1, 99) + ' of ' + g.max;
    else if (g.type === 'custom' && g.key === 'kept') prog = m.kept ? 'You kept a jewel: goal missed' : 'Kept jewels: 0';
    else if (g.type === 'custom' && g.key === 'crownWin') prog = 'Crowns ' + m.crowns + ' of 10';
    else prog = 'Turn ' + (m.turns + 1);
    el.innerHTML = '';
    var h = document.createElement('b'); h.textContent = 'Chapter ' + n + ' · ' + def.goal.text; el.appendChild(h);
    var p = document.createElement('span'); p.textContent = def.tip && m.turns < 3 ? def.tip : prog; el.appendChild(p);
    el.classList.toggle('bad', g.key === 'kept' && m.kept > 0 || g.key === 'turns' && m.turns > g.max);
    UI.layout();   // places the card under the title
  }
  function over(G) {
    var c = camp(); U().camp = null; render();
    if (!GXC.active()) return UI.showTitle();
    return GXC.finish(G, { turns: c ? c.mine : 0 }).then(cardback);
  }
  // ---------- story outcome line and a Next chapter button on the shared result screen
  var res0 = GXC.result;
  GXC.result = function (r) {
    return new Promise(function (done) {
      res0(r).then(done);
      var box = document.querySelector('.gxc-res'); if (!box) return;
      var def = r.def, src = D.chapters.filter(function (x) { return x.id === def.id; })[0] || def, i = D.chapters.indexOf(src), nxt = D.chapters[i + 1];
      var line = document.createElement('p'); line.className = 'oa-story-out';
      line.textContent = r.won ? (src.outro[0].text) : (src.lose || 'Not this time. Try a different plan.');
      var h2 = box.querySelector('h2'); if (h2) h2.after(line);
      if (r.won && nxt) {
        var row = box.querySelector('.gxc-row'), cont = [].filter.call(row.children, function (b) { return b.textContent === 'Continue'; })[0];
        if (cont) cont.className = 'gxc-btn ghost';
        var b = document.createElement('button'); b.type = 'button'; b.className = 'gxc-btn go'; b.textContent = 'Next chapter';
        b.onclick = function () { GXC.scene(src.outro, { def: def, title: src.title, last: 'Next chapter' }).then(function () { done('next'); }); };
        row.appendChild(b); b.focus();
      }
    });
  };
  // ---------- portraits: a drawn monogram on the character's colour (the owner's art replaces it later)
  function portrait(who, size, c) {
    var col = (c && c.color) || '#8f7231', nm = (c && c.name) || 'Story', ini = nm.replace(/^(The|Lady|Mistress)\s+/, '').split(/\s+/).map(function (w) { return w.charAt(0); }).join('').slice(0, 2).toUpperCase();
    var ns = 'http://www.w3.org/2000/svg', s = document.createElementNS(ns, 'svg');
    s.setAttribute('viewBox', '0 0 40 40'); s.setAttribute('class', 'oa-pt'); s.setAttribute('aria-hidden', 'true');
    s.innerHTML = '<circle cx="20" cy="20" r="19.5" fill="#d8b45a"/><circle cx="20" cy="20" r="17.6" fill="' + col + '"/><circle cx="20" cy="20" r="14.5" fill="none" stroke="#f1d68c" stroke-opacity=".45" stroke-width=".6"/>' +
      '<text x="20" y="25" text-anchor="middle" font-size="' + (ini.length > 1 ? 12 : 15) + '" fill="#f3ead6" font-weight="700" font-family="Josefin Sans,sans-serif">' + ini + '</text>';
    return s;
  }
  // ---------- rewards: the newest card back unlocked tints every card back
  function cardback() {
    var cb = GXC.unlocked().filter(function (u) { return u.type === 'cardback'; }).pop();
    var col = cb && D.cardbacks && D.cardbacks[cb.id];
    if (col) document.documentElement.style.setProperty('--cbk', col);
  }
  GXC.init({
    game: 'onyx-atelier', data: D, startChapter: start, isWon: isWon, metrics: metrics, portrait: portrait,
    onExit: function () { UI.showTitle(); },
    headButtons: function () { var b = document.createElement('button'); b.type = 'button'; b.className = 'gxc-ib'; b.textContent = 'Lessons'; b.setAttribute('aria-label', 'Learn to play: the coached lessons'); b.addEventListener('click', function () { GXC.close(); document.getElementById('title').hidden = true; if (window.OTUT) OTUT.start(); }); return [b]; },
    scores: function (G) { return [E.points(G.pl[0]), E.points(G.pl[1])]; },
    seats: function () { var c = camp(); return [{ name: 'You', me: true }, { name: c ? c.def.opponent.name : 'Rival', ai: 'story' }]; }
  });
  cardback();
  // ---------- scenarios: the map and three chapter starts
  if (window.GXS && GXS.add) {
    var on = function () { return typeof OA_TEST !== 'undefined' && !!GXC.data(); };
    GXS.add({ id: 'oa-story-map', name: 'Story: chapter map', ask: 'Can you see the road of chapters, stars and locks?', when: on,
      setup: function () { window.AIDELAY = 0; GXC.open(); return new Promise(function (r) { setTimeout(r, 300); }); },
      checks: [{ kind: 'visible', sel: '.gxc-node.open', name: 'first chapter open' }, { kind: 'visible', sel: '.gxc-node.locked', name: 'locked chapter' }] });
    [1, 6, 12].forEach(function (n) {
      GXS.add({ id: 'oa-story-ch' + n, name: 'Story: chapter ' + n + ' start', ask: 'Is the goal card readable without blocking the board?', when: on,
        setup: function () { window.AIDELAY = 0; start(GXC.resolve(D.chapters[n - 1])); return new Promise(function (r) { setTimeout(r, 300); }); },
        checks: [{ kind: 'visible', sel: '#obj', name: 'goal card' }, { kind: 'fn', name: 'goal card ignores taps', fn: function () { return getComputedStyle(document.getElementById('obj')).pointerEvents === 'none' || 'goal card takes taps'; } }] });
    });
  }
  return { start: start, render: render, over: over, metrics: metrics, isWon: isWon, open: function () { GXC.open(); } };
})();
