// Doorkick scenarios (see shell/gx-scenario.js): ?scn=<id> builds ONE state directly. Registered before the game scripts run; setup() runs after boot.
(function () {
  if (!window.GXS) return;
  var booted = function () { return typeof G !== 'undefined' && typeof newGame === 'function' && typeof render === 'function' && typeof startCombat === 'function' && typeof UI !== 'undefined'; };
  // a plain solo game, no menus: you (Pip) vs two computer heroes, animations on, seeded
  function table(seed) {
    var m = document.getElementById('modal'); if (m) { m.hidden = true; m.innerHTML = ''; }
    try { GX.close(); } catch (e) { }
    try { GXH.setEnabled(false); } catch (e) { }   // no coach bubbles over the scene
    setSeed(seed); newGame('solo', 3); UI.hints = false; UI.speed = 1; G.learn = false; G.active = 0; G.phase = 'main'; UI.info = false;
    clearTimeout(window.aiTimer); window.aiTimer = null; UI.pause = true;   // the computer waits: the scenario is about YOUR screen
    render();
  }
  var idOf = function (key) { return Object.keys(G.C).map(Number).find(function (i) { return G.C[i] === key; }); };
  var pull = function (id) { ['door', 'tr', 'dd', 'td'].forEach(function (z) { var i = G[z].indexOf(id); if (i >= 0) G[z].splice(i, 1); }); P(0).hand = P(0).hand.filter(function (x) { return x !== id; }); return id; };

  GXS.add({
    id: 'dk-tut-help', name: 'Tutorial: ask for help', ask: 'Can you read the Help button?', ls: { dkd_offer: '1' },
    when: function () { return booted() && typeof tutStart === 'function' && typeof GXT !== 'undefined'; },
    setup: function () {
      var m = document.getElementById('modal'); if (m) { m.hidden = true; m.innerHTML = ''; }
      tutStart();
      return GXS.wait(function () { return GXT.active() && G && G.tut; }, 8000).then(function () {
        // the staged deal: Pip plays Lizards from his hand against the door ("look for trouble"), then the Help step asks for the Help button
        var id = pull(idOf('lizards')); G.active = 0; G.phase = 'after'; G.fought = false; apply({ act: 'trouble', card: id }, 0); G.cb.stage = 'act'; render();
        GXT.goto('help');
        return GXS.wait(function () { var s = GXT.state(); return s.id === 'help' && s.shown; }, 8000);
      });
    },
    checks: [
      { kind: 'fn', name: 'tutorial is on the Help step', fn: function () { return GXT.state().id === 'help' || 'step is ' + GXT.state().id; } },
      { kind: 'visible', sel: '.fbtns .helpb', name: 'Help button' },
      { kind: 'text', sel: '.fbtns .helpb', re: /help/i, name: 'Help label' },
      { kind: 'fn', name: 'Help label is not covered by the painted plate cap', fn: function () { var e = document.querySelector('.fbtns .helpb'); if (!e) return 'no button'; var r = document.createRange(); r.selectNodeContents(e); var t = r.getBoundingClientRect(), b = e.getBoundingClientRect(); return (t.left >= b.left - 1 && t.right <= b.right + 1 && t.width > 8) || 'label box ' + Math.round(t.left) + '..' + Math.round(t.right) + ' outside button ' + Math.round(b.left) + '..' + Math.round(b.right); } },
      { kind: 'tap', sel: '.fbtns .helpb', name: 'tap Help', state: function () { return GXT.state().id; }, expect: function (a, b) { return b === 'who' || 'move on to "Pick a helper" (still ' + b + ')'; } }
    ]
  });

  GXS.add({
    id: 'dk-fight-bonus', name: 'Fight with bonuses', ask: 'Is YOU vs MONSTERS big and clear?', ls: { dkd_offer: '1' }, seed: 7, when: booted,
    setup: function () {
      table(7); P(0).lvl = 4;
      var mon = idOf('hatmuncher'); pull(mon); startCombat(0, mon, 'kick'); render();
      return GXS.wait(function () { return document.querySelector('.sline .n'); }, 5000).then(function () {
        window.__fly = GXS.spy(window, 'bfFly');
        var os = Object.keys(G.C).map(Number).filter(function (i) { return cd(i).t === 'oneshot' && G.tr.indexOf(i) >= 0; })[0];
        pull(os); P(0).hand.push(os); render(); apply({ act: 'play', card: os, tgt: 'p' }, 0); G.cb.help = 1; G.cb.pb += 3; render();
        return new Promise(function (r) { setTimeout(r, 900); });
      });
    },
    checks: [
      { kind: 'visible', sel: '.sline', name: 'scoreline' },
      { kind: 'text', sel: '.sline .sy i', re: /^YOU/, name: 'YOU label' },
      { kind: 'text', sel: '.sline .sm i', re: /MONSTERS/, name: 'MONSTERS label' },
      { kind: 'fn', name: 'numbers are big (>= 24 px)', fn: function () { var e = document.querySelector('.sline .n'); return parseFloat(getComputedStyle(e).fontSize) >= 24 || 'font ' + getComputedStyle(e).fontSize; } },
      { kind: 'eq', name: 'YOU total', a: function () { return GXS.num('.sline .sy .n'); }, b: function () { return sideStr(G.cb); } },
      { kind: 'eq', name: 'MONSTERS total', a: function () { return GXS.num('.sline .sm .n'); }, b: function () { return monStr(G.cb); } },
      { kind: 'eq', name: 'win/lose colour matches the engine', a: function () { return document.querySelector('.sline').classList.contains('win'); }, b: function () { return winning(G.cb); } },
      { kind: 'fn', name: 'a flying +N bonus was launched', fn: function () { return window.__fly.n > 0 || 'no bfFly call'; } }
    ]
  });

  GXS.add({
    id: 'dk-boss-reveal', name: 'Boss clip, then the card', ask: 'Boss clip, roar, then the monster card?', ls: { dkd_offer: '1' }, seed: 11, when: booted,
    setup: function () {
      table(11); P(0).lvl = 3; UI.pause = false; try { GXH.setEnabled(false); } catch (e) { }
      var obs = window.__obs = { clip: false, played: false, rev: false, card: false, sfx: 0, clipUrl: '' };
      var sf = window.sfx; window.sfx = function () { obs.sfx++; return sf && sf.apply(this, arguments); };
      var boss = idOf('wyrm'); pull(boss); G.door.push(boss);   // top of the door pile
      var iv = setInterval(function () {
        var c = document.getElementById('bfclip'); if (c) { obs.clip = true; var v = c.querySelector('video'); if (v) { obs.clipUrl = v.currentSrc || v.src; if (v.readyState >= 2 && !v.paused) obs.played = true; } }
        if (document.getElementById('bfrev')) obs.rev = true;
        if (!c && document.querySelector('.arena .row.mons .card')) obs.card = true; }, 60);
      window.__obsIv = iv;
      G.phase = 'main'; G.active = 0; UI.pause = true; render();
      bfKick();
      return GXS.wait(function () { return obs.card && !document.getElementById('bfclip') && !document.getElementById('bfrev'); }, 16000).then(function () { clearInterval(iv); UI.pause = true; });
    },
    checks: [
      { kind: 'fn', name: 'a boss clip or the card reveal showed', fn: function () { return window.__obs.clip || window.__obs.rev || 'neither #bfclip nor #bfrev appeared'; } },
      { kind: 'fn', name: 'the boss clip file loads over http', fn: function () { return window.__obs.clip ? (window.__obs.clipUrl.indexOf('http') === 0 || 'clip src ' + window.__obs.clipUrl) : true; } },
      { kind: 'fn', name: 'sound played (sfx calls)', fn: function () { return window.__obs.sfx > 0 || 'no sfx() call during the reveal'; } },
      { kind: 'fn', name: 'the monster is in the fight', fn: function () { return !!G.cb && G.cb.mons.length > 0 && G.C[G.cb.mons[0].id] === 'wyrm' || 'no wyrm in G.cb'; } },
      { kind: 'visible', sel: '.arena .row.mons .card', name: 'monster card landed' },
      { kind: 'eq', name: 'MONSTERS total', a: function () { return GXS.num('.sline .sm .n'); }, b: function () { return monStr(G.cb); } }
    ]
  });

  GXS.add({
    id: 'dk-board', name: 'Start of game board', ask: 'Is the table clear, with Help and Run?', ls: { dkd_offer: '1' }, seed: 31, when: booted, group: 'Board',
    setup: function () { table(31); return new Promise(function (r) { setTimeout(r, 500); }); },
    checks: [
      { kind: 'visible', sel: '[data-board]', name: 'table' },
      { kind: 'fn', name: 'table fills the screen', fn: function () { var r = document.querySelector('[data-board]').getBoundingClientRect(), f = r.width * r.height / (innerWidth * innerHeight); return f > (innerWidth < 600 ? .55 : .4) || 'table only ' + Math.round(f * 100) + '%'; } },
      { kind: 'visible', sel: '.arena .bfdoor', name: 'the door' },
      { kind: 'visible', sel: '.mine .hand', name: 'your hand' }
    ]
  });

  GXS.add({
    id: 'dk-zoom', name: 'Big card zoom', ask: 'Is the big card readable?', ls: { dkd_offer: '1' }, seed: 32, when: booted, group: 'Cards',
    setup: function () { table(32); UI.zoom = P(0).hand[0]; render(); return GXS.wait(function () { return document.querySelector('#dkCard .zoom .card'); }, 5000).then(function () { return new Promise(function (r) { setTimeout(r, 400); }); }); },
    checks: [
      { kind: 'visible', sel: '#dkCard .zoom .card', name: 'big card' },
      { kind: 'text', sel: '#dkCard h2', re: /\S/, name: 'card name' },
      { kind: 'visible', sel: '#dkCard .gx-x', name: 'Close button' },
      { kind: 'tap', sel: '#dkCard .gx-x', name: 'tap Close', state: function () { return UI.zoom != null; }, expect: function (a, b) { return (a === true && b === false) || 'close the card'; } }
    ]
  });
})();
