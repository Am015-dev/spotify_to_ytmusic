// Twin Thrones coached first game: a REAL duel (stacked decks, fixed seed, the real computer) with free choices from move 1.
// One forced step (the first wonder), then the guide Ione speaks just-in-time, one bubble at a time, never blocking input, always dismissable.
// Rules that never came up are listed on a "Things you'll meet later" card after the final scoring walk. All text: campaign.json -> prologue. (FLAG: none)
(function () {
  if (typeof GXT === 'undefined' || !window.TT_UI) return;
  var UI = TT_UI, U = UI.U, E = UI.E, BY = UI.BY, $ = UI.$, GAME = 'twin-thrones';
  var PRO = (window.CAMPAIGN && window.CAMPAIGN.prologue) || { coach: {}, later: {}, walk: {}, intro: [] };
  var COACH = PRO.coach || {}, LATER = PRO.later || {}, WALK = PRO.walk || {};
  var CORE = ['draft', 'pyramid', 'tension', 'free', 'coin', 'paid', 'shield', 'loot', 'chain-mark', 'chain', 'sci', 'pair', 'sell', 'wonder', 'age', 'guild'];
  var T = { seen: {}, q: [], cur: null, tm: 0, iv: 0, active: false, then: null, av0: [], sellPoor: false, laterShown: [], walked: false };
  var SEED = 5;
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function av() { return E.available(U.G).filter(function (c) { return !c.taken; }); }
  // ---------------------------------------------------------------- the one bubble
  function box() {
    var b = $('coach');
    if (!b) {
      b = document.createElement('div'); b.id = 'coach'; b.className = 'coach'; b.setAttribute('role', 'status'); b.setAttribute('aria-live', 'polite'); document.body.appendChild(b);
      b.addEventListener('click', function (e) {
        var x = e.target.closest && e.target.closest('[data-cx]'); if (x) { e.stopPropagation(); var f0 = T.curNext; hide(); if (f0) f0(); else pump(); return; }
        var n = e.target.closest && e.target.closest('[data-cn]'); if (n) { e.stopPropagation(); var f = T.curNext; hide(); if (f) f(); }
      });
    }
    return b;
  }
  function hide() { clearTimeout(T.tm); T.cur = null; T.curNext = null; var b = $('coach'); if (b) { b.hidden = true; b.innerHTML = ''; } }
  function show(text, next) {
    var b = box(); T.cur = text; T.curNext = next || null; b.hidden = false;
    b.innerHTML = '<span class="ci" aria-hidden="true">I</span><span class="ct">' + esc(text) + '</span>' + (next ? '<button type="button" class="cn" data-cn="1">' + (next.label || 'Next') + '</button>' : '') + '<button type="button" class="cx" data-cx="1" aria-label="Dismiss">&times;</button>';
    if (!next) { clearTimeout(T.tm); T.tm = setTimeout(function () { hide(); pump(); }, 9000); }
  }
  function pump() { if (!T.active || T.cur || !T.q.length || T.walking || (GXT.running && GXT.running())) return; show(T.q.shift()); }
  // the four story chapters frame the one game: draft, Age I, Age II, Age III
  function chapter(n) { var c = (PRO.chapters || [])[n]; if (!c || T.seen['ch' + n]) return; T.seen['ch' + n] = 1; T.q.push('Chapter ' + (n + 1) + ', ' + c.title + ': ' + ((c.open && c.open[0] && c.open[0].text) || '')); pump(); }
  function say(id) { if (T.seen[id] || !COACH[id]) return; T.seen[id] = 1; T.q.push(COACH[id]); pump(); }
  // ---------------------------------------------------------------- the staged (but free) game
  // a SHORT real duel: Age I is the full pyramid, Ages II and III are small pyramids (9 and 5 cards) so the whole game fits a first sitting and the cards stay big
  var LAYOUT0 = null;
  function shortLayout(on) {
    var L = TT.LAYOUT;
    if (on) { if (!LAYOUT0) LAYOUT0 = { 2: L[2], 3: L[3] }; L[2] = [{ xs: [-3, -1, 1, 3], up: 1 }, { xs: [-2, 0, 2], up: 0 }, { xs: [-1, 1], up: 1 }]; L[3] = [{ xs: [-1, 1], up: 1 }, { xs: [-2, 0, 2], up: 1 }]; }
    else if (LAYOUT0) { L[2] = LAYOUT0[2]; L[3] = LAYOUT0[3]; LAYOUT0 = null; }
  }
  function stack() {
    var g = U.G, order = ['a1-rock-face', 'a1-lookout', 'a1-herb-garden', 'a1-remedy-shop', 'a1-roadside-inn', 'a1-open-stage'];
    g.decks[1] = g.decks[1].filter(function (id) { return order.indexOf(id) < 0; }).slice(0, 14).concat(order);
    g.decks[2] = g.decks[2].filter(function (id) { return id !== 'a2-herbarium' && id !== 'a2-star-gazers'; }).slice(0, 7).concat(['a2-herbarium', 'a2-star-gazers']);
    g.decks[3] = ['g-builders'].concat(g.decks[3].filter(function (id) { return id !== 'g-builders'; }).slice(0, 4));
    g.firstSeat = 0;
  }
  // ---------------------------------------------------------------- just-in-time hooks (called by ui.js)
  function beforePlayerMove(g, m) {
    T.av0 = av().map(function (c) { return c.i; }); T.sellPoor = false;
    if (m && m.t === 'discard' && m.i != null) { try { var bi = E.buildInfo(g, 0, BY[g.pyr[m.i].id]); T.sellPoor = !!(bi.ok && bi.coins === 0); } catch (e) { } }
  }
  function afterMove(g, evs, p, snap, m) {
    if (!T.active) return;
    evs.forEach(function (ev) {
      if (ev.t === 'build') {
        var c = BY[ev.id];
        if (ev.p === 0) { if (ev.chain) say('chain'); else if (ev.paid > 0) say('paid'); else say('free'); if (c.coin) say('coin'); if (c.gives) say('chain-mark'); if (c.sci) say('sci'); if (c.col === 'purple') say('guild'); }
        if (c.shields) say('shield');
      }
      if (ev.t === 'discard' && ev.p === 0) { if (T.sellPoor && !T.seen['sell-poor']) { T.seen['sell-poor'] = 1; T.seen.sell = 1; T.q.push(COACH['sell-poor']); pump(); } else say('sell'); }
      if (ev.t === 'wonder' && ev.p === 0) say('wonder');
      if (ev.t === 'loot') say('loot');
      if (ev.t === 'age') { say('age'); chapter(ev.age); }
    });
    var pd = g.pend[0]; if (pd && pd.type === 'token' && pd.from !== 'lib' && pd.pl === 0) say('pair');
    if (p === 1 && m && m.i != null && T.av0.length && T.av0.indexOf(m.i) < 0) say('tension');
  }
  function onTurn(g) { if (!T.active) return; if (g.phase === 'draft') { chapter(0); say('draft'); } else if (g.phase === 'play' && E.sideToAct(g) === 0) { chapter(g.age); say('pyramid'); } }
  // ---------------------------------------------------------------- the final scoring walk + the "later" card
  var LAB = { blue: 'Civic', green: 'Science', yellow: 'Trade', guild: 'Guilds', wonder: 'Wonders', token: 'Tokens', coins: 'Coins', mil: 'Conflict', total: 'Total' };
  function onResult(g) {
    if (!T.active || T.walked) return;
    T.walked = true;
    if (!g.final) { later(); return; }
    T.walking = true; T.q = []; hide();
    var keys = ['blue', 'green', 'yellow', 'guild', 'wonder', 'token', 'coins', 'mil', 'total'], i = 0, f = g.final[0], r = g.final[1];
    function hl(k) { var rows = document.querySelectorAll('#res table tr'); for (var j = 0; j < rows.length; j++) rows[j].classList.toggle('hl', j === k + 1); }
    function step() {
      if (i >= keys.length) { hl(-2); hide(); T.walking = false; later(); return; }
      var k = keys[i]; hl(i);
      var txt = LAB[k] + ': you ' + f[k] + ', ' + (U.rivalName || 'Rival') + ' ' + r[k] + '. ' + (WALK[k] || '');
      i++; step.label = i >= keys.length ? 'Done' : 'Next'; show(txt, step);
    }
    setTimeout(step, 1300);
  }
  function later() {
    var ids = CORE.filter(function (id) { return !T.seen[id]; }).map(function (id) { return { id: id, t: COACH[id] }; }).concat(Object.keys(LATER).map(function (id) { return { id: id, t: LATER[id] }; }));
    T.laterShown = ids.map(function (x) { return x.id; });
    var d = document.createElement('div'); d.className = 'gxt-end'; d.id = 'laterCard'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true'); d.setAttribute('aria-label', "Things you'll meet later");
    d.innerHTML = '<div class="gxt-endc later"><div class="gxt-et">Things you\'ll meet later</div><ul>' + ids.map(function (x) { return '<li>' + esc(x.t) + '</li>'; }).join('') + '</ul><div class="gxt-eb"><button type="button" class="gxt-b pri" data-later="play">Quick game</button><button type="button" class="gxt-b" data-later="story">Story mode</button></div></div>';
    document.body.appendChild(d);
    d.addEventListener('click', function (e) { var b = e.target.closest && e.target.closest('[data-later]'); if (!b) return; d.remove(); finish(b.dataset.later); });
  }
  function finish(choice) {
    T.active = false; T.finished = true; shortLayout(false); clearInterval(T.iv); hide(); U.tut = false; U.rivalName = null; try { GXT.markDone(GAME); } catch (e) { }
    $('res').hidden = true; var f = T.then; T.then = null; if (f) { f(); return; }
    if (choice === 'story' && window.GXC && window.CAMPAIGN) { UI.showStart(); GXC.open(); } else UI.newGame('cpu');
  }
  // ---------------------------------------------------------------- start
  var RUN = 0;
  function scene(lines, my) { return ((window.GXC && GXC.scene) ? GXC.scene(lines || [], { title: '', last: 'Start the duel' }) : Promise.resolve()).then(function () { if (my !== RUN) return false; try { if (window.GXC) GXC.close(); } catch (e) { } return true; }); }
  function begin() {
    var my = RUN;
    U.tut = true; U.rivalName = 'Pell'; shortLayout(true); UI.newGame('cpu', SEED); U.fingerDone = true; stack();
    T.active = true; T.finished = false; T.walked = false; T.walking = false; T.seen = {}; T.q = []; T.laterShown = []; hide();
    clearInterval(T.iv); T.iv = setInterval(function () { if (my !== RUN) return; pump(); }, 600);
    var first = PRO.first || ['Ione', 'Claim the glowing wonder.'];
    GXT.start({ game: GAME, story: false, endTitle: (PRO.playon && PRO.playon.title) || 'Your move, always', endText: (PRO.playon && PRO.playon.text) || '', endButtons: [{ id: 'go', label: 'Play on' }],
      steps: [{ id: 'first', title: first[0], say: first[1], onEnter: function () { T.seen.first = 1; }, target: function () { return document.querySelector('.wcard.go'); },
        wait: { type: 'tap', match: function (a) { return a.kind === 'pick'; } }, ready: function () { return !!U.G && !U.busy && !U.narr && E.sideToAct(U.G) === 0 && U.G.phase === 'draft' && !!document.querySelector('.wcard.go'); } }],
      setup: function () { },
      onDone: function () { },
      onExit: function () { T.active = false; shortLayout(false); clearInterval(T.iv); hide(); U.tut = false; U.rivalName = null; if (T.then) { var f = T.then; T.then = null; f(); } else UI.showStart(); } });
  }
  function start(o) {
    T.then = (o && o.then) || null; var my = ++RUN; U.lvl = 'easy';
    $('res').hidden = true; $('start').hidden = true;
    scene(PRO.intro, my).then(function (ok) { if (ok) begin(); });
  }
  function coverage() { return { all: CORE.concat(Object.keys(LATER)).concat(['first']), seen: Object.keys(T.seen), later: T.laterShown.slice() }; }
  Object.defineProperty(window, 'GXCOACH', { configurable: true, get: function () { return { running: !!T.active, explained: Object.keys(T.seen).filter(function (k) { return !/^ch\d/.test(k); }), done: !!T.finished }; } });
  window.TT_TUTOR = { start: start, cancel: function () { RUN++; T.active = false; shortLayout(false); clearInterval(T.iv); hide(); }, coverage: coverage, beforePlayerMove: beforePlayerMove, afterMove: afterMove, onTurn: onTurn, onResult: onResult, takeReaction: function () { return null; }, steps: [] };
})();
