// Twin Thrones prologue: ONE real short game (fixed seed, stacked decks), four chapters, played against the real computer to the result screen.
// All the story text lives in campaign.json -> prologue. Each step makes the player do the real action; the guide (Ione) and the rival (Pell) react in the captions. (FLAG: none)
// Teaches: draft, pyramid cover/uncover, build free / paid / bought resources, chain, sell, wonder, conflict pawn, science pair + token, guild, final scoring.
(function () {
  if (typeof GXT === 'undefined' || !window.TT_UI) return;
  var UI = TT_UI, U = UI.U, E = UI.E, BY = UI.BY, $ = UI.$, GAME = 'twin-thrones', AI = TT.AI;
  var PRO = (window.CAMPAIGN && window.CAMPAIGN.prologue) || { chapters: [], steps: {}, pell: {}, end: {} };
  var T = { ch: 0, reserved: {}, freed: [], av0: [], react: null, seen: {}, lines: {}, then: null };
  var SEED = 5, KEY = 'tt_tut_ch', RES = ['a1-rock-face', 'a1-roadside-inn', 'a1-lookout', 'a1-herb-garden', 'a1-remedy-shop', 'a2-herbarium', 'a2-star-gazers', 'g-builders'];
  RES.forEach(function (id) { T.reserved[id] = 1; });
  function lsGet() { try { return +localStorage.getItem(KEY) || 0; } catch (e) { return 0; } }
  function lsSet(n) { try { localStorage.setItem(KEY, String(n)); } catch (e) { } }
  function G() { return U.G; }
  function av() { return E.available(U.G).filter(function (c) { return !c.taken; }); }
  function cellEl(i) { return $('c' + i); }
  function cellOf(id) { var l = U.G.pyr.filter(function (c) { return c.id === id && !c.taken; }); return l.length ? l[0] : null; }
  function mine() { return U.tut && !U.busy && !U.narr && E.sideToAct(U.G) === 0 && !U.G.pend.length && U.G.phase === 'play' && !U.G.over; }
  function sel(i) { U.sel = i; UI.renderPyr(); UI.dock(); }
  function other() { return av().filter(function (c) { return !T.reserved[c.id]; }).sort(function (a, b) { return a.i - b.i; })[0] || null; }
  var SY = PRO.steps || {};
  function say(id) { return (SY[id] && SY[id].say) || ''; }
  function ttl(id) { return (SY[id] && SY[id].title) || 'Ione'; }
  function react(id) { return SY[id] && SY[id].react ? { tag: 'Ione', text: SY[id].react } : null; }
  // ---------------------------------------------------------------- the staged game
  function stack() {
    var g = U.G, d1 = g.decks[1], row4 = ['a1-rock-face', 'a1-roadside-inn', 'a1-lookout', 'a1-herb-garden', 'a1-remedy-shop', 'a1-open-stage'];
    // bottom row left to right: free card, coin card, red card, glass-hungry green card, chain green card, one for the rival
    var order = ['a1-rock-face', 'a1-lookout', 'a1-herb-garden', 'a1-remedy-shop', 'a1-roadside-inn', 'a1-open-stage'];
    g.decks[1] = d1.filter(function (id) { return order.indexOf(id) < 0; }).slice(0, 14).concat(order);
    g.decks[2] = g.decks[2].filter(function (id) { return id !== 'a2-herbarium' && id !== 'a2-star-gazers'; }).slice(0, 18).concat(['a2-herbarium', 'a2-star-gazers']);
    var d3 = g.decks[3].filter(function (id) { return id !== 'g-builders' && id !== 'a3-bastion'; }); g.decks[3] = ['g-builders', 'a3-bastion'].concat(d3.slice(0, 18));
    g.firstSeat = 0;
  }
  function easyMove(g) { return AI.pick(g, 'easy', function () { return E.rnd(g); }); }
  function auto(untilFn, cap) { var g = U.G, k = 0; while (!g.over && !untilFn(g) && k++ < (cap || 400)) E.apply(g, easyMove(g)); }
  function untaken(g) { return g.pyr.filter(function (c) { return !c.taken; }).length; }
  // state at the start of chapter n (0 = draft, 1 = Age I, 2 = Age II, 3 = Age III last cards): reached by the guided path or rebuilt for a resumed tutorial
  function prep(n, fresh) {
    var g;
    if (fresh) { UI.newGame('cpu', SEED); U.tut = true; U.rivalName = 'Pell'; U.fingerDone = true; g = U.G; stack(); }
    g = U.G; U.tut = true;
    if (n >= 1 && g.phase === 'draft') { clearTimeout(U.aiTimer); auto(function (x) { return x.phase === 'play'; }); g.turn = 0; }
    if (n >= 2 && g.age === 1) {
      if (fresh) { var P = g.players[0]; ['a1-rock-face', 'a1-roadside-inn', 'a1-lookout', 'a1-herb-garden', 'a1-remedy-shop'].forEach(function (id) { if (P.cards.indexOf(id) < 0) P.cards.push(id); }); g.mil = 1; }
      auto(function (x) { return x.age === 2; }); if (g.pend.length && g.pend[0].type === 'first') E.apply(g, { t: 'first', who: 0 });
      g.turn = 0; g.players[0].coins = Math.max(g.players[0].coins, 12);
    }
    if (n >= 3 && g.age === 2) {
      if (fresh) { var P2 = g.players[0]; ['a2-herbarium', 'a2-star-gazers'].forEach(function (id) { if (P2.cards.indexOf(id) < 0) P2.cards.push(id); }); }
      auto(function (x) { return x.age === 3 && untaken(x) <= 2 && !x.pend.length; }); g.players[0].coins = 60; g.players[1].coins = Math.min(g.players[1].coins, 12);
    }
    if (n >= 1) { U.busy = false; U.sel = null; U.narr = false; clearTimeout(U.nt); }
    UI.render(); if (n >= 1 && E.sideToAct(U.G) === 1 && !U.G.over) UI.after();
  }
  // the computer in the guide: it takes the card the player just uncovered (to show the tension), sells it, and never takes a card the guide needs
  function aiMove(g) {
    var a = av(), pool = a.filter(function (c) { return !T.reserved[c.id]; }), pick = null;
    if (!pool.length) pool = a;
    var nowAv = a.map(function (c) { return c.i; }), freed = pool.filter(function (c) { return T.av0.indexOf(c.i) < 0; });
    if (freed.length) { pick = freed[0]; T.react = { tag: 'Pell', text: (PRO.pell && PRO.pell.freed) ? PRO.pell.freed.replace(/^Pell: /, '') : 'Thank you for uncovering that!' }; T.lastFreed = BY[pick.id].nm; }
    if (!pick) { pick = pool.sort(function (x, y) { return x.i - y.i; })[0]; }
    if (G().phase === 'play' && E.sideToAct(g) === 1) return { t: 'discard', i: pick.i };
    return AI.pick(g, 'easy', function () { return E.rnd(g); });
  }
  // ---------------------------------------------------------------- step builders
  function seen(id) { return function () { T.seen[id] = 1; var lt = $('instr'); }; }
  function tapAct(a) { return { type: 'tap', match: function (x) { return x.kind === 'act' && x.a === a; } }; }
  function reactOn(id, base) { return { type: 'tap', match: function (x) { var ok = base(x); if (ok) T.react = react(id); return ok; } }; }
  function info(id, target, ready, textFn) { return { id: id, title: ttl(id), say: textFn || say(id), target: target, wait: null, ready: ready || function () { return mine(); }, onEnter: seen(id) }; }
  function take(id, cardId, pred) {
    return { id: id, title: ttl(id), say: say(id), onEnter: function () { T.seen[id] = 1; T.av0 = av().map(function (c) { return c.i; }); },
      target: function () { var c = pred ? pred() : cellOf(cardId); return c ? cellEl(c.i) : null; },
      wait: { type: 'tap', match: function (a) { var c = pred ? pred() : cellOf(cardId); return a.kind === 'card' && c && a.i === c.i; } },
      ready: function () { var c = pred ? pred() : cellOf(cardId); return mine() && c && cellEl(c.i) && U.sel == null; } };
  }
  function act(id, a, takeId, pred) {
    return { id: id, title: ttl(id), say: say(id), onEnter: seen(id),
      target: function () { return document.querySelector(a === 'wonder' ? '#zoom [data-a="wonder"]:not([disabled])' : '#zoom [data-a="' + a + '"]:not([disabled])'); },
      wait: reactOn(id, function (x) { return x.kind === 'act' && x.a === a; }),
      ready: function () { return mine() && U.sel != null && !!document.querySelector(a === 'wonder' ? '#zoom [data-a="wonder"]:not([disabled])' : '#zoom [data-a="' + a + '"]:not([disabled])'); } };
  }
  var ch1 = [
    info('crowns', function () { return $('s0'); }, function () { return !!U.G && !U.busy && !U.narr && E.sideToAct(U.G) === 0 && U.G.phase === 'draft'; }),
    { id: 'draft', title: ttl('draft'), say: say('draft'), onEnter: seen('draft'), target: function () { return document.querySelector('.wcard.go'); },
      wait: { type: 'tap', times: 4, match: function (a) { if (a.kind !== 'pick') return false; T.react = react('draft'); return true; } },
      ready: function () { return !!U.G && !U.busy && !U.narr && E.sideToAct(U.G) === 0 && U.G.phase === 'draft' && !!document.querySelector('.wcard.go'); } }
  ];
  var ch2 = [
    info('pyramid', function () { return $('pyr'); }),
    take('take-free', 'a1-rock-face'), act('build-free', 'build'),
    take('take-inn', 'a1-roadside-inn'), act('build-inn', 'build'),
    take('take-red', 'a1-lookout'), act('build-red', 'build'),
    info('pawn', function () { return $('mil'); }),
    take('take-buy', 'a1-herb-garden'), act('build-buy', 'build'),
    take('take-chain', 'a1-remedy-shop'), act('build-chain', 'build'),
    take('take-sell', null, other), act('sell', 'discard'),
    info('tension', function () { return $('pyr'); }, null, null),
    take('take-wonder', null, other), act('wonder', 'wonder')
  ];
  ch2[ch2.length - 2].onEnter = function () { T.seen['take-wonder'] = 1; T.av0 = av().map(function (c) { return c.i; }); var P = U.G.players[0]; if (P.coins < 14) { P.coins = 14; UI.render(); } };
  ch2[14].say = function () { return 'Pell grabbed ' + (T.lastFreed || 'the card you uncovered') + '. Before you take a card, check what it frees for him.'; };
  var ch3 = [
    info('years', function () { return $('pyr'); }),
    take('take-pair', 'a2-herbarium'), act('build-pair', 'build'),
    { id: 'token', title: ttl('token'), say: say('token'), onEnter: seen('token'), target: function () { return document.querySelector('#acts .tk'); },
      wait: { type: 'tap', match: function (a) { if (a.kind !== 'token') return false; T.react = react('token'); return true; } },
      ready: function () { return !U.busy && !U.narr && !!U.G.pend[0] && U.G.pend[0].type === 'token' && E.sideToAct(U.G) === 0 && !!document.querySelector('#acts .tk'); } },
    info('sci', function () { return $('s0'); }),
    take('take-chain2', 'a2-star-gazers'), act('build-chain2', 'build')
  ];
  var ch4 = [
    info('age3', function () { return $('pyr'); }),
    take('take-guild', 'g-builders'), act('build-guild', 'build'),
    { id: 'scoring', title: ttl('scoring'), say: say('scoring'), onEnter: seen('scoring'), target: function () { return document.querySelector('#res table'); }, wait: null, ready: function () { return !!U.G && U.G.over && !$('res').hidden && !!document.querySelector('#res table') ; } },
    { id: 'verdict', title: ttl('verdict'), say: say('verdict'), onEnter: seen('verdict'), target: function () { return document.querySelector('#res h2'); }, wait: null, ready: function () { return !!U.G && U.G.over && !$('res').hidden; } }
  ];
  var CHS = [ch1, ch2, ch3, ch4];
  // ---------------------------------------------------------------- chapters
  function scene(lines) { return ((window.GXC && GXC.scene) ? GXC.scene(lines || [], { title: '', last: 'Continue' }) : Promise.resolve()).then(function () { try { if (window.GXC) GXC.close(); } catch (e) { } }); }
  function runChapter(n, fresh, resumed) {
    T.ch = n; lsSet(n); var meta = (PRO.chapters || [])[n] || { title: 'Chapter ' + (n + 1), open: [], close: [] };
    var go = function () {
      GXT.start({ game: GAME, steps: CHS[n], story: false, endTitle: n === 3 ? (PRO.end && PRO.end.title || 'The first crown is claimed') : 'Chapter ' + (n + 1) + ' done: ' + meta.title,
        endText: n === 3 ? (PRO.end && PRO.end.text || '') : ((meta.close && meta.close[0] && meta.close[0].text) || ''),
        endButtons: n === 3 ? [{ id: 'play', label: 'Quick game' }, { id: 'story', label: 'Story mode' }] : [{ id: 'next', label: 'Next chapter' }, { id: 'leave', label: 'Leave for now' }],
        setup: function () { prep(n, !!fresh); },
        onDone: function (r) { finishChapter(n, r && r.choice); }, onExit: function () { U.tut = false; U.rivalName = null; if (T.then) { var f = T.then; T.then = null; f(); } else UI.showStart(); } });
    };
    $('res').hidden = true; $('start').hidden = true;
    scene(meta.open).then(go);
  }
  function finishChapter(n, choice) {
    if (n < 3) {
      if (choice === 'leave') { lsSet(n + 1); U.tut = false; U.rivalName = null; UI.showStart(); return; }
      lsSet(n + 1); var meta = PRO.chapters[n]; scene(meta.close.slice(1)).then(function () { runChapter(n + 1, false, false); }); return;
    }
    lsSet(0); U.tut = false; U.rivalName = null; $('res').hidden = true;
    var f = T.then; T.then = null; if (f) { f(); return; }
    if (choice === 'story' && window.GXC && window.CAMPAIGN) { UI.showStart(); GXC.open(); } else UI.newGame('cpu');
  }
  function dialog(n) {
    var d = document.createElement('div'); d.className = 'gxt-end'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true'); d.setAttribute('aria-label', 'Tutorial');
    d.innerHTML = '<div class="gxt-endc"><div class="gxt-et">Welcome back</div><div class="gxt-ex">Continue with chapter ' + (n + 1) + ': ' + esc((PRO.chapters[n] || {}).title || '') + '?</div><div class="gxt-eb"><button type="button" class="gxt-b pri" data-r="resume">Continue chapter ' + (n + 1) + '</button><button type="button" class="gxt-b" data-r="again">Start from chapter 1</button></div></div>';
    document.body.appendChild(d);
    d.addEventListener('click', function (e) { var b = e.target.closest && e.target.closest('[data-r]'); if (!b) return; d.remove(); if (b.dataset.r === 'resume') runChapter(n, true, true); else runChapter(0, true, false); });
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function start(o) {
    T.then = o && o.then || null; T.seen = {}; var n = lsGet();
    if (o && o.chapter != null) { runChapter(o.chapter, true, o.chapter > 0); return; }
    if (n > 0 && n < 4 && !(o && o.fresh)) dialog(n); else runChapter(0, true, false);
  }
  function coverage() { var ids = []; CHS.forEach(function (c) { c.forEach(function (s) { ids.push(s.id); }); }); return { all: ids, seen: Object.keys(T.seen) }; }
  window.TT_TUTOR = { start: start, aiMove: aiMove, steps: CHS, coverage: coverage, takeReaction: function () { var r = T.react; T.react = null; return r; }, beforePlayerMove: function () { T.av0 = av().map(function (c) { return c.i; }); } };
})();
