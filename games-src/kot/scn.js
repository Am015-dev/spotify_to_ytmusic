// Crown City Smash scenarios (see shell/gx-scenario.js): ?scn=<id> builds ONE state directly. Registered before the game scripts run; setup() runs after boot.
(function () {
  if (!window.GXS) return;
  // under the test runner (webdriver) the software 3D renderer would make every page crawl: the game falls back to its flat board, the DOM board on top is the same
  try { if (navigator.webdriver && GXS.on && !/[?&]gl=1/.test(location.search)) { var gc = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (t) { return /webgl/i.test(String(t)) ? null : gc.apply(this, arguments); }; var ce = console.error; console.error = function (m) { if (/WebGLRenderer/.test(String(m))) return; return ce.apply(console, arguments); }; } } catch (e) { }
  var LS = { ccs_tour2: '1', ccs_gfx: 'low', ccs_bf1: JSON.stringify({ keep: 1, roll: 1, done: 1, buy: 1 }) };   // tips done: no coach bubbles or ghost finger over the thing under test
  var booted = function () { return typeof G !== 'undefined' && typeof newGame === 'function' && typeof render === 'function' && typeof UI !== 'undefined' && typeof resolve === 'function' && typeof obShowCard === 'function'; };
  var $ = function (s) { return document.querySelector(s); };
  // a solo game (you vs 3 computer monsters), no menus or story card, waiting at YOUR roll
  function table(seed) {
    try { GXH.setEnabled(false); } catch (e) { }
    var m = document.getElementById('modal'); if (m) { m.hidden = true; m.innerHTML = ''; }
    try { GX.close(); } catch (e) { }
    AIDELAY = 60; GXS.seed(seed); UI.n = 4; UI.firstGame = false; UI.intro = false; UI.adv = false; UI.coach = -1; UI.freeze = false; UI.tour = false; UI.tipSeen = {}; UI.info = false;
    newGame('solo'); render();
    return GXS.wait(function () { return humanTurn() && G.phase === 'roll' && !UI.busy && !UI.choice && G.dice.length === 6; }, 12000).then(function () {
      return new Promise(function (r) { setTimeout(r, 700); });
    });
  }
  // the shared menu test's "board" surface (shell/gx-scenario.js): the play screen right after a game starts, tutorial tips on
  GXS.boardOpen = function () { if (!booted()) return; try { BF.tut = {}; localStorage.removeItem('ccs_bf1'); } catch (e) { } return table(51).then(function () { try { GXH.reset(); GXH.setEnabled(true); GXH.phase(hlpPhase()); } catch (e) { } render(); return new Promise(function (r) { setTimeout(r, 500); }); }); };
  // the same, then SMASH through the real engine and wait for the buying phase with plenty of energy
  function marketTable(seed) {
    return table(seed).then(function () {
      G.pl[G.active].en = Math.max(G.pl[G.active].en, 12); resolve();
      return GXS.wait(function () { return G.phase === 'buy' && humanTurn() && !UI.busy && !UI.choice; }, 20000);
    }).then(function () { cur().en = Math.max(cur().en, 20); render(); return new Promise(function (r) { setTimeout(r, 600); }); });
  }
  var owned = function () { var q = cur(); return q.cards.length + 100 * q.en; };
  var inBoard = function (sel) { var b = $('[data-board]'), e = $(sel); if (!b || !e) return 'missing ' + sel; var B = b.getBoundingClientRect(), r = e.getBoundingClientRect(); return (r.width > 3 && r.left >= B.left - 1 && r.right <= B.right + 1 && r.top >= B.top - 1 && r.bottom <= B.bottom + 1) || sel + ' is outside the board'; };
  var words = function (t) { return String(t).trim().split(/\s+/).filter(Boolean).length; };

  // Known, listed in HANDOFF.md: the 'PERMANENT' card tag on the PC market prints at 9.9 px
  GXS.known.push({ re: /span\.chip\.cK|span\.more|button\.newsbtn/, why: 'PC card tag under 11 px; PC player name overlaps its "· tap: how" hint' });
  GXS.glowSel += ',#ob [data-act].pulse';   // the pulsing SMASH! button is a glowing legal target: it must answer a real tap
  var faces = function (a, f) { return a.filter(function (x) { return x === f; }).length; };
  var hp = function () { return G.pl.map(function (p) { return p.hp; }); };
  // the rolled dice, resolved by the real SMASH! tap, must give exactly what the rules say (no cards owned at the start of a game)
  var smashSnap = function () { var q = cur(); return { ph: G.phase, step: G.step, f: G.dice.map(function (d) { return d.f; }), en: q.en, vp: q.vp, hp: q.hp, hps: hp(), act: G.active, inCity: G.pl.map(function (p) { return inCity(p.i); }), max: maxhp(q) }; };
  var smashVerify = function (b, a) {
    var E = faces(b.f, 'E'), C = faces(b.f, 'C'), H = faces(b.f, 'H'), vp = 0;
    ['1', '2', '3'].forEach(function (n) { var k = faces(b.f, n); if (k >= 3) vp += +n + (k - 3); });
    if (a.act !== b.act || a.ph === 'roll') return 'the dice were not resolved (phase ' + a.ph + ')';
    if (a.en - b.en !== E) return 'energy +' + (a.en - b.en) + ' but ' + E + ' energy dice were rolled';
    if (a.vp - b.vp < vp) return 'victory points +' + (a.vp - b.vp) + ' but number dice are worth ' + vp;
    if (!b.inCity[b.act]) { var heal = Math.min(b.max, b.hp + H); if (a.hp !== heal) return 'hearts: hp ' + b.hp + ' -> ' + a.hp + ' but ' + H + ' heart dice should give ' + heal; }
    for (var i = 0; i < b.hps.length; i++) {   // claws hit everyone else when you are in the city, else whoever is in it
      var victim = i !== b.act && (b.inCity[b.act] || b.inCity[i]) && b.hps[i] > 0, want = Math.max(0, b.hps[i] - C);
      if (victim && a.hps[i] !== want) return 'player ' + i + ' hp ' + b.hps[i] + ' -> ' + a.hps[i] + ' but ' + C + ' claws should leave ' + want;
    }
    return true;
  };
  var settled = function () { return G.phase !== 'roll' && !UI.busy && !UI.choice; };
  var diag = function () { return 'phase ' + G.phase + ', active ' + G.active + ', human ' + humanTurn() + ', busy ' + UI.busy + ', choice ' + !!UI.choice + ', winner ' + G.winner + ', alive ' + G.pl.map(function (p) { return p.alive ? 1 : 0; }).join('') + ', dice ' + G.dice.length; };
  var ask1 = function () { return UI.choice && document.querySelector('#choice [data-opt].primary, #choice [data-opt]'); };   // the game asks YOU something during the computer's turn (stay or yield?)
  var myRoll = function () { return humanTurn() && G.phase === 'roll' && !UI.busy && !UI.choice && G.dice.length === 6; };

  GXS.add({
    id: 'cc-smash', name: 'SMASH! over the city', ask: 'Tap SMASH! over the city', ls: LS, seed: 21, when: booted,
    setup: function () { return table(21); },
    mut: [
      { name: 'energy dice give nothing', js: 'gainE = function () { }' },
      { name: 'claws never hurt', js: 'applyLoss = function () { return 0 }' }
    ],
    checks: [
      { kind: 'visible', sel: '#ob [data-act="resolve"]', name: 'SMASH! button' },
      { kind: 'fn', name: 'SMASH! hangs inside the central board', fn: function () { return inBoard('#ob [data-act="resolve"]'); } },
      { kind: 'text', sel: '#ob [data-act="resolve"]', re: /smash/i, name: 'SMASH! label' },
      { kind: 'fn', name: 'it is YOUR roll', fn: function () { return (humanTurn() && G.phase === 'roll') || 'phase ' + G.phase; } },
      { kind: 'play', name: 'tap SMASH!: the dice do what the rules say', snap: smashSnap, steps: [{ sel: '#ob [data-act="resolve"]' }], idle: settled, verify: smashVerify }
    ]
  });

  var MKT = {
    id: 'cc-market', name: 'Buy a card from the board', ask: 'Tap a card twice to buy it', ls: LS, seed: 22, when: booted,
    setup: function () {
      return marketTable(22).then(function () {
        var q = cur(), sg = suggestCard(q), a = G.market.map(function (_, j) { return j; }).filter(function (j) { return canBuy(q, j) && CARDS[base(G.market[j])].t === 'K'; });
        var k = a.filter(function (j) { return j !== sg; })[0]; if (k == null) k = a[0];
        window.__k = k; window.__id = G.market[k]; window.__cost = costOf(q, G.market[k]);
        MKT.checks.forEach(function (c) { if (c.sel === '#KSEL') c.sel = '#ob #pshop [data-shop="' + k + '"]'; (c.steps || []).forEach(function (st) { if (st.sel === '#KSEL') st.sel = '#ob #pshop [data-shop="' + k + '"]'; }); });
      });
    },
    mut: [
      { name: 'cards cost 1 more', js: 'costOf = (function (f) { return function (p, id) { return f(p, id) + 1 } })(costOf)' },
      { name: 'bought card never arrives', js: 'acquire = function (p, id, a, done) { done() }' },
      { name: 'market is not refilled', js: 'refill = function () { }' }
    ],
    checks: [
      { kind: 'visible', sel: '#ob #pshop .obc', name: 'card for sale' },
      { kind: 'fn', name: 'at least 2 painted cards inside the board', fn: function () { var n = document.querySelectorAll('#ob #pshop .obc'); if (n.length < 2) return 'only ' + n.length + ' cards'; for (var i = 0; i < n.length; i++) { if (!n[i].querySelector('img.cpic')) return 'card ' + i + ' has no painting'; } return inBoard('#ob #pshop .obc'); } },
      { kind: 'hold', sel: '#ob #pshop .obc', ms: 700, name: 'hold a card', state: function () { return { big: document.getElementById('obcard').classList.contains('on'), own: owned() }; },
        expect: function (a, b) { return (b.big && b.own === a.own) || (!b.big ? 'show the big card' : 'a hold bought the card'); } },
      { kind: 'fn', name: 'big card gone after release, nothing bought', fn: function () { return !document.getElementById('obcard').classList.contains('on') || 'big card stayed'; } },
      { kind: 'play', name: 'tap the card (touch: twice): it is bought', settleMs: 12000,
        snap: function () { var q = cur(); return { en: q.en, cards: q.cards.slice(), mk: G.market.slice(), shown: GXS.num('header.gx-bar .pchip.me .e'), ph: G.phase }; },
        steps: [{ sel: '#KSEL', until: function () { return cur().cards.indexOf(window.__id) >= 0; }, max: 3 }],
        idle: function () { return !UI.busy && !UI.choice && !(G.q && G.q.length); },
        verify: function (b, a) {
          var q = cur(); if (b.en - a.en !== window.__cost) return 'energy ' + b.en + ' -> ' + a.en + ' but the card costs ' + window.__cost;
          if (a.cards.indexOf(window.__id) < 0) return 'the card is not in your hand of cards';
          if (a.mk.length !== 3 || a.mk.indexOf(window.__id) >= 0) return 'the market was not refilled with a new card (' + a.mk.join(',') + ')';
          if (document.querySelector('header.gx-bar .pchip.me .e') && GXS.num('header.gx-bar .pchip.me .e') !== q.en) return 'screen energy ' + GXS.num('header.gx-bar .pchip.me .e') + ' != engine ' + q.en;
          return true; } }
    ]
  };
  GXS.add(MKT);

  GXS.add({
    id: 'cc-dice-end', name: 'Dice and rolling on the board', ask: 'Keep a die, roll, then smash', ls: LS, seed: 23, when: booted,
    setup: function () { return table(23); },
    mut: [{ name: 'a rolled die ignores its keep', js: 'doReroll = (function (f) { return function () { var k = G.dice.map(function (d) { return d.k }); var r = f.apply(this, arguments); G.dice.forEach(function (d, i) { if (k[i]) d.f = d.f === "1" ? "2" : "1" }); return r } })(doReroll)' }],
    checks: [
      { kind: 'visible', sel: '#ob #dice .die[data-die="0"]', name: 'first die' },
      { kind: 'fn', name: 'all 6 dice are inside the board', fn: function () { for (var i = 0; i < 6; i++) { var r = inBoard('#ob #dice .die[data-die="' + i + '"]'); if (r !== true) return r; } return !(document.querySelector('.gx-dock #dice, .gx-dock #pacts')) || 'dice or buttons still in the panel'; } },
      { kind: 'play', name: 'keep a die, tap Roll: only the loose dice change', settleMs: 12000,
        snap: function () { return { rolls: G.rolls, f: G.dice.map(function (d) { return d.f; }), k: G.dice.map(function (d) { return !!d.k; }) }; },
        steps: [{ sel: '#ob #dice .die[data-die="0"]', until: function () { return !!G.dice[0].k; }, max: 2 }, { sel: '#ob [data-act="reroll"]' }],
        idle: function () { return !UI.busy && G.dice.length === 6; },
        verify: function (b, a) {
          if (!a.k[0]) return 'die 0 lost its keep'; if (a.rolls !== b.rolls - 1) return 'rolls left ' + b.rolls + ' -> ' + a.rolls;
          var kf = b.f[0]; if (a.f[0] !== kf) return 'the kept die changed from ' + kf + ' to ' + a.f[0];
          var moved = 0; for (var i = 1; i < 6; i++) if (a.f[i] !== b.f[i]) moved++; if (!moved) return 'no loose die was rolled again';
          return true; } },
      { kind: 'visible', sel: '#ob [data-act="resolve"]', name: 'SMASH! is still there to finish the turn' }
    ]
  });

  GXS.add({
    id: 'cc-end-turn', name: 'End turn from the board', ask: 'Tap End turn on the board', ls: LS, seed: 24, when: booted,
    setup: function () { return marketTable(24); },
    mut: [{ name: 'the next monster never starts its turn', js: 'startTurn = function () { }' }],
    checks: [
      { kind: 'visible', sel: '#ob [data-act="end"]', name: 'End turn button' },
      { kind: 'fn', name: 'End turn is inside the board', fn: function () { return inBoard('#ob [data-act="end"]'); } },
      { kind: 'play', name: 'tap End turn: three computer turns, then your new roll', settleMs: 12000,
        snap: function () { return { tid: G.tid, act: G.active, en: cur().en, alive: G.pl.filter(function (p) { return p.alive; }).length }; },
        steps: [{ sel: '#ob [data-act="end"]' }],
        idle: myRoll, diag: diag, assist: ask1,
        verify: function (b, a) { return (a.tid > b.tid && a.act === b.act && G.rolls > 0) || 'turn ' + b.tid + ' -> ' + a.tid + ' (expected the 3 computer monsters to play, then you again); rolls ' + G.rolls; } },
      { kind: 'play', name: 'tap SMASH! on the new turn: it goes on to buying', settleMs: 12000,
        snap: smashSnap, steps: [{ sel: '#ob [data-act="resolve"]' }], idle: settled, verify: smashVerify },
      { kind: 'play', name: 'End turn again: you are back on a fresh roll', settleMs: 12000,
        snap: function () { return { tid: G.tid }; }, steps: [{ sel: '#ob [data-act="end"]', ready: function () { return G.phase === 'buy'; } }],
        idle: myRoll, diag: diag, assist: ask1, verify: function (b, a) { return a.tid > b.tid || 'turn ' + b.tid + ' -> ' + a.tid; } }
    ]
  });

  GXS.add({
    id: 'cc-board', name: 'Start of game board', ask: 'Is the board clear and filled?', ls: LS, seed: 25, when: booted,
    setup: function () { return table(25); },
    checks: [
      { kind: 'visible', sel: '[data-board]', name: 'board' },
      { kind: 'fn', name: 'board fills the screen', fn: function () { var r = $('[data-board]').getBoundingClientRect(); var f = r.width * r.height / (innerWidth * innerHeight); return f > (innerWidth < 600 ? .55 : .45) || 'board only ' + Math.round(f * 100) + '% of the screen'; } },
      { kind: 'visible', sel: '#ob [data-act="resolve"]', name: 'SMASH!' },
      { kind: 'visible', sel: '#ob [data-act="reroll"]', name: 'Roll' },
      { kind: 'visible', sel: '#ob #dice .die[data-die="5"]', name: 'last die' },
      { kind: 'fn', name: 'no line of text over 8 words on the board', fn: function () { var bad = ''; [].forEach.call(document.querySelectorAll('#ob *'), function (e) { if (e.children.length || !GXS.vis(e)) return; var t = (e.textContent || '').trim(); if (words(t) > 8) bad = bad || '"' + t.slice(0, 40) + '" (' + words(t) + ' words)'; }); return !bad || bad; } },
      { kind: 'fn', name: 'painted skin moves no box', fn: function () { if (typeof GXSK === 'undefined') return true; var a = GXSK.audit(); return !a.moved.length || a.moved.slice(0, 2).join(' | '); } }
    ]
  });

  /* UI-BAR 4-6, 8: top-bar button count, text size in the dock and every top-bar panel, empty parchment, image aspect */
  var minPx = function () { return innerWidth >= 1024 ? 16 : 13; };
  var smallText = function (root) { var bad = []; [].forEach.call(root.querySelectorAll('*'), function (e) { if (!GXS.vis(e) || e.closest('svg,canvas') || getComputedStyle(e).fontSize === '0px') return; var own = [].filter.call(e.childNodes, function (n) { return n.nodeType === 3 && /\S{2}/.test(n.textContent); }).length; if (!own) return; var f = parseFloat(getComputedStyle(e).fontSize); if (f < minPx() - .01) bad.push((e.id || e.className || e.tagName) + ' ' + f + 'px'); }); return bad; };
  GXS.add({
    id: 'cc-uibar', name: 'UI bar: top bar, dock and panels', ask: 'Are bar, dock and panels clean?', ls: LS, seed: 27, when: booted,
    setup: function () { return table(27); },
    checks: [
      { kind: 'fn', name: 'top bar has at most 5 buttons', fn: function () { var n = [].filter.call(document.querySelectorAll('header.gx-bar .gx-ibtn'), GXS.vis).length; return n <= 5 || n + ' buttons in the top bar'; } },
      { kind: 'fn', name: 'dock text is big enough', fn: function () { var d = document.querySelector('.gx-dock'); var b = d ? smallText(d) : []; return !b.length || b.slice(0, 4).join(' | '); } },
      { kind: 'fn', name: 'every top-bar panel: text size, no tall empty parchment', fn: function () {
        var out = [];
        ['dr-market', 'dr-mine', 'dr-mons', 'dr-log', 'dr-menu', 'dr-rules'].forEach(function (id) {
          try { GX.show(id); } catch (e) { out.push(id + ' will not open'); return; }
          var el = document.getElementById(id); if (!el) { out.push(id + ' missing'); return; }
          var bad = smallText(el); if (bad.length) out.push(id + ' small text: ' + bad.slice(0, 3).join(', '));
          var body = el.querySelector('.gx-drawer-body,.gx-dbody') || el, top = body.getBoundingClientRect().top, bot = 0;
          [].forEach.call(body.querySelectorAll('*'), function (c) { if (GXS.vis(c)) bot = Math.max(bot, c.getBoundingClientRect().bottom); });
          var empty = body.getBoundingClientRect().bottom - Math.max(bot, top); if (empty > 220 && body.scrollHeight <= body.clientHeight + 2) out.push(id + ' empty space ' + Math.round(empty) + 'px');
        });
        try { GX.close(); } catch (e) { }
        return !out.length || out.join(' | ');
      } },
      { kind: 'fn', name: 'board images keep their natural aspect', fn: function () { var bad = []; [].forEach.call(document.querySelectorAll('[data-board] img'), function (i) { if (!GXS.vis(i) || !i.naturalWidth) return; var r = i.getBoundingClientRect(), cs = getComputedStyle(i); if (cs.objectFit === 'fill' && Math.abs(r.width / r.height - i.naturalWidth / i.naturalHeight) > .08) bad.push((i.className || i.src.slice(-20)) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height)); }); return !bad.length || bad.slice(0, 3).join(' | '); } }
    ]
  });

  GXS.add({
    id: 'cc-zoom', name: 'Big card zoom', ask: 'Is the big card readable?', ls: LS, seed: 26, when: booted,
    setup: function () { return marketTable(26).then(function () { obShowCard(G.market[0], ''); return new Promise(function (r) { setTimeout(r, 500); }); }); },
    checks: [
      { kind: 'visible', sel: '#obcard.on .obbig', name: 'big card' },
      { kind: 'text', sel: '#obcard.on .obbig h3', re: /\S/, name: 'card name' },
      { kind: 'text', sel: '#obcard.on .obbig p:not(.ty)', re: /\S/, name: 'card text', minPx: 13 },
      { kind: 'fn', name: 'a tap anywhere closes it', fn: function () { document.body.click(); return !document.getElementById('obcard').classList.contains('on') || 'big card still open'; } }
    ]
  });

  /* Help: the board scenario's table, then the rules cards (GXH.rules) */
  GXS.add({
    id: 'cc-help', name: 'Help: rules cards', ask: 'Can you read the help cards?', seed: 41, group: 'UI',
    when: function () { return typeof GXH !== 'undefined' && GXS.defs.some(function (x) { return x.id === 'cc-board' && (!x.when || x.when()); }); },
    setup: function () { var b = GXS.defs.filter(function (x) { return x.id === 'cc-board'; })[0]; return Promise.resolve(b.setup()).then(function () { GXH.rules(null); return GXS.wait(function () { return document.querySelector('.gxh-rules .gxh-card'); }, 5000); }).then(function () { return new Promise(function (r) { setTimeout(r, 400); }); }); },
    checks: [
      { kind: 'visible', sel: '.gxh-rules .gxh-card', name: 'help card' },
      { kind: 'text', sel: '.gxh-rules .gxh-rt', re: /\S/, name: 'card title' },
      { kind: 'text', sel: '.gxh-rules .gxh-rx', re: /\S/, name: 'card text' },
      { kind: 'visible', sel: '.gxh-rules .gxh-x', name: 'Close button' },
      { kind: 'tap', sel: '.gxh-rules .gxh-x', name: 'tap Close', state: function () { return !!document.querySelector('.gxh-rules'); }, expect: function (a, b) { return (a && !b) || 'help did not close'; } }
    ]
  });
  // painted art wired: each plate is painted on the element, its skin switch is on, the element visible
  function art(name, sel, file, pseudo, cls, hid) { return { kind: 'fn', name: name, fn: function () { var e = document.querySelector(sel); if (!e) return 'missing ' + sel; var r = e.getBoundingClientRect(); if (!hid && (r.width < 4 || r.height < 4)) return 'not visible'; var c = getComputedStyle(e, pseudo || null); if ((c.backgroundImage + ' ' + c.borderImageSource).indexOf(file) < 0) return file + ' not painted'; if (cls && GXSK.classes().indexOf(cls) < 0) return cls + ' not loaded'; return true; } }; }
  GXS.add({
    id: 'cc-art', name: 'Painted art: chips, tray, crown, buttons, tail', ask: 'Do the chips, dice tray and crown look painted?', seed: 5, sizes: 'phone', when: booted,
    setup: function () {
      return table(5).then(function () {
        var h = document.createElement('div'); h.id = 'artbox'; h.style.cssText = 'position:fixed;left:8px;top:120px;z-index:99;display:flex;gap:8px;flex-wrap:wrap;width:250px';
        h.innerHTML = '<i class="crn" id="artcrn">👑</i><button class="btn on" id="artpink" type="button">Chosen</button><button class="btn rec" id="artyel" type="button">Best move</button><button class="gx-reopen btn" id="artghost" type="button" style="position:static;display:inline-block">Panel</button>';
        document.body.appendChild(h);
        var b = document.createElement('div'); b.className = 'gxh-bub on gxh-a-bottom'; b.id = 'arttail'; b.style.cssText = 'left:16px;top:200px';
        b.innerHTML = '<i class="gxh-arr"></i><div class="gxh-tx">Tap dice to keep</div>'; document.body.appendChild(b);
        return new Promise(function (r) { setTimeout(r, 500); });
      });
    },
    checks: [
      art('monster chip plate painted', 'header.gx-bar .pchip:not(.on)', 'ui-hud-chip-c', '::before', 'sk-hudchip'),
      art('dice tray painted', '#dicewrap', 'ui-dice-tray-c', '::before', 'sk-tray'),
      art('painted crown', '#artcrn', 'icon-crown', null, 'sk-crown'),
      art('pink chosen button', '#artpink', 'ui-button-pink-c', null, 'sk-pink'),
      art('yellow recommended button', '#artyel', 'ui-button-yellow-c', null, 'sk-yellow'),
      art('see-through Panel button', '#artghost', 'ui-button-ghost-c', null, 'sk-ghost', true),
      art('bubble tail painted', '#arttail .gxh-arr', 'ui-bubble-tail', null, 'sk-tail'),
      { kind: 'text', sel: '#artpink', re: /chosen/i, name: 'pink label readable' },
      { kind: 'text', sel: '#artyel', re: /best/i, name: 'yellow label readable' },
      { kind: 'text', sel: '#arttail .gxh-tx', re: /dice/i, name: 'bubble text readable' }
    ]
  });
})();
