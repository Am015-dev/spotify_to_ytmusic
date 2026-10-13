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

  GXS.add({
    id: 'cc-smash', name: 'SMASH! over the city', ask: 'Tap SMASH! over the city', ls: LS, seed: 21, when: booted,
    setup: function () { return table(21); },
    checks: [
      { kind: 'visible', sel: '#ob [data-act="resolve"]', name: 'SMASH! button' },
      { kind: 'fn', name: 'SMASH! hangs inside the central board', fn: function () { return inBoard('#ob [data-act="resolve"]'); } },
      { kind: 'text', sel: '#ob [data-act="resolve"]', re: /smash/i, name: 'SMASH! label' },
      { kind: 'fn', name: 'it is YOUR roll', fn: function () { return (humanTurn() && G.phase === 'roll') || 'phase ' + G.phase; } },
      { kind: 'tap', sel: '#ob [data-act="resolve"]', name: 'tap SMASH!', state: function () { return G.phase + '/' + G.step; }, expect: function (a, b) { return (a.split('/')[0] === 'roll' && b.split('/')[0] !== 'roll') || 'resolve the dice (phase still ' + b + ')'; } }
    ]
  });

  var MKT = {
    id: 'cc-market', name: 'Cards for sale on the board', ask: 'Hold a card, then tap it', ls: LS, seed: 22, when: booted,
    setup: function () {
      return marketTable(22).then(function () {
        var q = cur(), sg = suggestCard(q), a = G.market.map(function (_, j) { return j; }).filter(function (j) { return canBuy(q, j); });
        window.__k = a.filter(function (j) { return j !== sg; })[0]; if (window.__k == null) window.__k = a[0];
        MKT.checks.forEach(function (c) { if (c.sel === '#KSEL') c.sel = '#ob #pshop [data-shop="' + window.__k + '"]'; });
      });
    },
    checks: [
      { kind: 'visible', sel: '#ob #pshop .obc', name: 'card for sale' },
      { kind: 'fn', name: 'at least 2 painted cards inside the board', fn: function () { var n = document.querySelectorAll('#ob #pshop .obc'); if (n.length < 2) return 'only ' + n.length + ' cards'; for (var i = 0; i < n.length; i++) { if (!n[i].querySelector('img.cpic')) return 'card ' + i + ' has no painting'; } return inBoard('#ob #pshop .obc'); } },
      { kind: 'hold', sel: '#ob #pshop .obc', ms: 700, name: 'hold a card', state: function () { return { big: document.getElementById('obcard').classList.contains('on'), own: owned() }; },
        expect: function (a, b) { return (b.big && b.own === a.own) || (!b.big ? 'show the big card' : 'a hold bought the card'); } },
      { kind: 'fn', name: 'big card gone after release, nothing bought', fn: function () { return !document.getElementById('obcard').classList.contains('on') || 'big card stayed'; } },
      { kind: 'tap', sel: '#KSEL', name: 'tap a card (touch: picks it)', state: function () { return { sel: BF.sel, own: owned() }; },
        expect: function (a, b) { return navigator.maxTouchPoints > 0 ? (b.sel === window.__k && b.own === a.own) || 'first tap picks the card (sel ' + b.sel + ')' : (b.own !== a.own) || 'a click should buy'; } },
      { kind: 'tap', sel: '#KSEL', name: 'tap again (touch: buys it)', state: function () { return owned(); }, expect: function (a, b) { return navigator.maxTouchPoints > 0 ? (b !== a) || 'second tap should buy the card' : true; } }
    ]
  };
  GXS.add(MKT);

  GXS.add({
    id: 'cc-dice-end', name: 'Dice and rolling on the board', ask: 'Keep a die, roll, then smash', ls: LS, seed: 23, when: booted,
    setup: function () { return table(23); },
    checks: [
      { kind: 'visible', sel: '#ob #dice .die[data-die="0"]', name: 'first die' },
      { kind: 'fn', name: 'all 6 dice are inside the board', fn: function () { for (var i = 0; i < 6; i++) { var r = inBoard('#ob #dice .die[data-die="' + i + '"]'); if (r !== true) return r; } return !(document.querySelector('.gx-dock #dice, .gx-dock #pacts')) || 'dice or buttons still in the panel'; } },
      { kind: 'tap', sel: '#ob #dice .die[data-die="0"]', name: 'tap a die to keep it', state: function () { return !!G.dice[0].k; }, expect: function (a, b) { return (!a && b) || 'die 0 should be kept'; } },
      { kind: 'visible', sel: '#ob [data-act="reroll"]', name: 'Roll button' },
      { kind: 'tap', sel: '#ob [data-act="reroll"]', name: 'tap Roll', state: function () { return G.rolls; }, expect: function (a, b) { return b === a - 1 || 'rolls left ' + a + ' -> ' + b; } },
      { kind: 'fn', name: 'the kept die did not change', fn: function () { return !!G.dice[0].k || 'die 0 lost its keep'; } }
    ]
  });

  GXS.add({
    id: 'cc-end-turn', name: 'End turn from the board', ask: 'Tap End turn on the board', ls: LS, seed: 24, when: booted,
    setup: function () { return marketTable(24); },
    checks: [
      { kind: 'visible', sel: '#ob [data-act="end"]', name: 'End turn button' },
      { kind: 'fn', name: 'End turn is inside the board', fn: function () { return inBoard('#ob [data-act="end"]'); } },
      { kind: 'tap', sel: '#ob [data-act="end"]', name: 'tap End turn', state: function () { return G.tid + '/' + G.phase + '/' + G.active; }, expect: function (a, b) { return a !== b || 'the turn did not end'; } }
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
