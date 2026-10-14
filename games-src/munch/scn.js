// Doorkick scenarios (see shell/gx-scenario.js): ?scn=<id> builds ONE state directly. Registered before the game scripts run; setup() runs after boot.
(function () {
  if (!window.GXS) return;
  // Known, owner-listed findings (games-src/HANDOFF.md "Scenario invariants"): the miniature cards in the fan and on the piles print their names at 7-8 px
  // (the big card is one tap away) and the fight side label "Pip (you) + Morwen" is cut by its box. They are skipped here so the invariants can gate everything else; fix them, then delete these lines.
  GXS.known.push({ re: /<(span\.(cn|dn|tag|kind|gold|cx)|small)>|span\.cn in span\.cn|span\.tag in span\.aw/, why: 'miniature card text under 11 px' }, { re: /span\.sl in span\.sl/, why: 'fight side label clipped' });
  var booted = function () { return typeof G !== 'undefined' && typeof newGame === 'function' && typeof render === 'function' && typeof startCombat === 'function' && typeof UI !== 'undefined'; };
  // a plain solo game, no menus: you (Pip) vs two computer heroes, animations on, seeded
  function table(seed, live) {
    var m = document.getElementById('modal'); if (m) { m.hidden = true; m.innerHTML = ''; }
    try { GX.close(); } catch (e) { }
    try { GXH.setEnabled(false); } catch (e) { }   // no coach bubbles over the scene
    setSeed(seed); newGame('solo', 3); UI.hints = false; UI.speed = 1; G.learn = false; G.active = 0; G.phase = 'main'; UI.info = false;
    clearTimeout(window.aiTimer); window.aiTimer = null; UI.pause = true;   // the computer waits: the scenario is about YOUR screen
    if (live) { UI.pause = false; UI.speed = 4; }   // ... unless the scenario plays on through the computer's turns
    render();
  }
  // the shared menu test's "board" surface (shell/gx-scenario.js): the play screen right after a game starts, tutorial tips on
  GXS.boardOpen = function () { if (!booted()) return; table(51); G.learn = true; UI.hints = true; try { GXH.reset(); GXH.setEnabled(true); GXH.phase(hlpPhase()); } catch (e) { } render(); };
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

  // the real buttons, found by their label
  var btnText = function (re) { return function () { return [].slice.call(document.querySelectorAll('button')).filter(function (b) { return re.test(b.textContent.trim()) && GXS.vis(b); })[0]; }; };
  var hearth = function () { return { you: G.cb ? sideStr(G.cb) : null, mon: G.cb ? monStr(G.cb) : null, hand: P(0).hand.length, lvl: P(0).lvl, turn: G.turn, td: G.td.length }; };
  GXS.add({
    id: 'dk-fight-bonus', name: 'Fight with bonuses', ask: 'Is YOU vs MONSTERS big and clear?', ls: { dkd_offer: '1' }, seed: 7, when: booted,
    setup: function () {
      table(7, true);
      // the staged deal: a plain level-2 monster on top of the door, one bonus card in hand, no more than 3 other cards (no charity round after the fight)
      var mon = Object.keys(G.C).map(Number).filter(function (i) { return G.door.indexOf(i) >= 0 && cd(i).t === 'monster' && cd(i).lvl === 2 && !cd(i).sp && !cd(i).vs; })[0];
      var os = Object.keys(G.C).map(Number).filter(function (i) { return cd(i).t === 'oneshot' && cd(i).b === 2 && !cd(i).sp && (G.tr.indexOf(i) >= 0 || P(0).hand.indexOf(i) >= 0); })[0];
      G.door.splice(G.door.indexOf(mon), 1); G.door.push(mon); pull(os); P(0).hand = P(0).hand.slice(0, 3); P(0).hand.push(os); P(0).lvl = 1;
      window.__mon = mon; window.__os = os; window.__val = cd(os).b;
      GXS.defs.forEach(function (d) { if (d.id === 'dk-fight-bonus') d.checks.forEach(function (c) { (c.steps || []).forEach(function (st) { if (st.sel === '#OS') st.sel = '.mine .hand [data-card="' + os + '"]'; }); }); });
      render(); return new Promise(function (r) { setTimeout(r, 500); });
    },
    mut: [
      { name: 'bonus card adds one too many', js: 'sideStr = (function (f) { return function (cb) { return f(cb) + (cb.pb ? 1 : 0) } })(sideStr)' },
      { name: 'the fight is judged wrong', js: 'winning = function () { return false }' },
      { name: 'a win gives no loot', js: 'monTr = function () { return 0 }' },
      { name: 'a win gives no level', js: 'gainLv = function () { }' }
    ],
    checks: [
      { kind: 'play', name: 'kick the door: the monster appears', snap: function () { return { door: G.door.length, ph: G.phase }; },
        steps: [{ sel: '.bfdoor' }], idle: function () { return G.cb && G.cb.stage === 'act' && !BF.kicking && !UI.busy; },
        verify: function (b, a) { return (G.cb.mons.length === 1 && G.cb.mons[0].id === window.__mon && a.door === b.door - 1 && document.querySelector('.arena .row.mons').textContent.indexOf(cd(window.__mon).n) >= 0) || 'expected ' + cd(window.__mon).n + ' on the table, got ' + G.cb.mons.map(function (m) { return cd(m.id).n; }) + ' (door ' + b.door + ' -> ' + a.door + ')'; } },
      { kind: 'play', name: 'play the bonus card: YOU grows by exactly its value', snap: hearth,
        steps: [{ sel: '#OS', until: function () { return BF.pick === window.__os; }, max: 2 }, { sel: '.bf-tgt[data-bfz="fh"]' }],
        idle: function () { return !UI.busy && P(0).hand.indexOf(window.__os) < 0; },
        verify: function (b, a) {
          if (a.you !== b.you + window.__val) return 'YOU ' + b.you + ' -> ' + a.you + ' but the card is worth +' + window.__val;
          if (a.mon !== b.mon) return 'MONSTERS changed ' + b.mon + ' -> ' + a.mon;
          if (a.hand !== b.hand - 1 || !G.cb.os.some(function (o) { return o.id === window.__os; })) return 'the card should leave your hand and sit on the table in the fight';
          return true; } },
      { kind: 'visible', sel: '.sline', name: 'scoreline' },
      { kind: 'text', sel: '.sline .sy i', re: /^YOU/, name: 'YOU label' },
      { kind: 'text', sel: '.sline .sm i', re: /MONSTERS/, name: 'MONSTERS label' },
      { kind: 'fn', name: 'numbers are big (>= 24 px)', fn: function () { var e = document.querySelector('.sline .n'); return parseFloat(getComputedStyle(e).fontSize) >= 24 || 'font ' + getComputedStyle(e).fontSize; } },
      { kind: 'eq', name: 'YOU total', sel: '.sline .sy .n', a: function () { return GXS.num('.sline .sy .n'); }, b: function () { return sideStr(G.cb); } },
      { kind: 'eq', name: 'MONSTERS total', sel: '.sline .sm .n', a: function () { return GXS.num('.sline .sm .n'); }, b: function () { return monStr(G.cb); } },
      { kind: 'eq', name: 'win/lose colour matches the engine', a: function () { return document.querySelector('.sline').classList.contains('win'); }, b: function () { return winning(G.cb); } },
      { kind: 'play', name: 'tap Fight!: the winner is decided right and the loot is given', snap: function () { var h = hearth(); h.win = h.you > h.mon; return h; },
        steps: [{ sel: '.fightb' }], idle: function () { return !G.cb && G.phase !== 'combat' && !UI.busy; },
        diag: function () { return 'phase ' + G.phase + ', stage ' + (G.cb && G.cb.stage) + ', side ' + sideToAct() + ', pause ' + UI.pause + ', busy ' + UI.busy + ', q ' + (G.q && G.q.kind) + ', buttons ' + [].map.call(document.querySelectorAll('button.primary,button.btn'), function (b) { return GXS.vis(b) ? b.textContent.trim().slice(0, 14) : ''; }).filter(Boolean).slice(0, 6).join('|'); },
        verify: function (b, a) {
          if (!G.out) return 'no fight result'; if (!!G.out.won !== b.win) return 'YOU ' + b.you + ' vs MONSTERS ' + b.mon + ' but the engine says won=' + G.out.won;
          if (!b.win) return true;
          if (P(0).lvl !== b.lvl + G.out.lv || G.out.lv < 1) return 'level ' + b.lvl + ' -> ' + P(0).lvl + ' but the fight gave ' + G.out.lv;
          if (a.hand !== b.hand + G.out.tr || G.out.tr < 1) return 'hand ' + b.hand + ' -> ' + a.hand + ' but the loot is ' + G.out.tr + ' treasure(s)';
          return true; } },
      { kind: 'play', name: 'End turn: the rivals play, then it is your turn again', snap: hearth,
        steps: [{ sel: btnText(/^End turn/) }], idle: function () { return G.turn > 1 && G.active === 0 && sideToAct() === 0 && !G.cb && !UI.busy && !G.winner; },
        verify: function (b, a) { return (a.lvl === b.lvl && validMoves(0).length > 0) || 'level ' + b.lvl + ' -> ' + a.lvl + ', ' + validMoves(0).length + ' valid moves'; } },
      { kind: 'play', name: 'Kick the next door: a valid next state', snap: function () { return { door: G.door.length + G.dd.length }; },
        steps: [{ sel: '.bfdoor' }], idle: function () { return !BF.kicking && !UI.busy && (G.cb || G.phase !== 'main'); },
        verify: function (b, a) { return (sideToAct() !== 0 || validMoves(0).length > 0) || 'dead end: no valid move after the kick'; } }
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
      return new Promise(function (r) { setTimeout(r, 400); });
    },
    mut: [
      { name: 'the boss clip never plays', js: 'bfBossClip = function () { return false }' },
      { name: 'the kicked monster never joins', js: 'enterMonster = function () { }' }
    ],
    checks: [
      { kind: 'play', name: 'tap the door: boss clip, then the monster card lands', settleMs: 12000, snap: function () { return { door: G.door.length }; },
        steps: [{ sel: '.bfdoor' }], idle: function () { var o = window.__obs; return o.card && !document.getElementById('bfclip') && !document.getElementById('bfrev'); },
        verify: function (b, a) { clearInterval(window.__obsIv); return (a.door === b.door - 1) || 'the door pile did not shrink (' + b.door + ' -> ' + a.door + ')'; } },
      { kind: 'fn', name: 'the boss clip showed before the card', fn: function () { return window.__obs.clip || 'no #bfclip appeared for a boss'; } },
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
      { kind: 'visible', sel: '.mine .hand', name: 'your hand' },
      { kind: 'fn', name: 'the hand on screen is the engine hand (same cards, same order)', fn: function () { var on = [].map.call(document.querySelectorAll('.mine .hand [data-card]'), function (e) { return +e.dataset.card; }); return JSON.stringify(on.slice().sort()) === JSON.stringify(P(0).hand.slice().sort()) || 'screen shows cards ' + on.join(',') + ', engine hand is ' + P(0).hand.join(','); } },
      { kind: 'fn', name: 'a rival seat for every rival', fn: function () { var n = document.querySelectorAll('.opp.seat').length; return n === G.pl.length - 1 || n + ' rival seats for ' + (G.pl.length - 1) + ' rivals'; } }
    ],
    mut: [
      { name: 'a card is missing from the hand', js: 'document.querySelector(".mine .hand [data-card]").remove()' },
      { name: 'a rival seat is missing', js: 'document.querySelector(".opp.seat").remove()' }
    ]
  });

  GXS.add({
    id: 'dk-zoom', name: 'Big card zoom', ask: 'Is the big card readable?', ls: { dkd_offer: '1' }, seed: 32, when: booted, group: 'Cards',
    mut: [{ name: 'the zoom shows another card', js: 'document.querySelector("#dkCard h2").textContent = "Wrong Card"' }],
    setup: function () { table(32); UI.zoom = P(0).hand[0]; render(); return GXS.wait(function () { return document.querySelector('#dkCard .zoom .card'); }, 5000).then(function () { return new Promise(function (r) { setTimeout(r, 400); }); }); },
    checks: [
      { kind: 'visible', sel: '#dkCard .zoom .card', name: 'big card' },
      { kind: 'text', sel: '#dkCard h2', re: /\S/, name: 'card name' },
      { kind: 'fn', name: 'the zoomed card is the one you picked', fn: function () { var t = document.querySelector('#dkCard h2').textContent; return t.indexOf(cd(P(0).hand[0]).n) >= 0 || 'zoom shows "' + t.trim() + '" but the card is ' + cd(P(0).hand[0]).n; } },
      { kind: 'visible', sel: '#dkCard .gx-x', name: 'Close button' },
      { kind: 'tap', sel: '#dkCard .gx-x', name: 'tap Close', state: function () { return UI.zoom != null; }, expect: function (a, b) { return (a === true && b === false) || 'close the card'; } }
    ]
  });
  var idle = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  var wordsIn = function (t) { return String(t).trim().split(/\s+/).filter(Boolean).length; };
  var line = function () { var e = document.querySelector('#prompt .bfline'); return e ? e.textContent : ''; };

  // the short status line: one line of 8 words or fewer, on the glow it says what to drag or tap
  GXS.add({
    id: 'dk-status-line', sizes: 'phone', name: 'Short drag/tap status line', ask: 'Is the line short and does it match?', ls: { dkd_offer: '1' }, seed: 41, when: booted, group: 'Board',
    setup: function () { table(41); return GXS.wait(function () { return document.querySelector('#prompt .bfline') && document.querySelector('.mine .hand .card'); }, 6000).then(function () { return idle(500); }); },
    checks: [
      { kind: 'visible', sel: '#prompt .bfline', name: 'status line' },
      { kind: 'text', sel: '#prompt .bfline', re: /\S/, name: 'status text', minPx: 12 },
      { kind: 'fn', name: 'line is 8 words or fewer', fn: function () { return wordsIn(line()) <= 8 || '"' + line() + '" is ' + wordsIn(line()) + ' words'; } },
      { kind: 'fn', name: 'line is a single line (no wrap past 2 rows)', fn: function () { var e = document.querySelector('#prompt .bfline'), px = parseFloat(getComputedStyle(e).lineHeight) || 16; return e.getBoundingClientRect().height <= px * 2.2 || 'line wraps to ' + Math.round(e.getBoundingClientRect().height / px) + ' rows'; } },
      { kind: 'tap', sel: '.mine .hand .card.play', name: 'tap a glowing card', state: function () { return line(); }, expect: function (a, b) { return (a !== b && wordsIn(b) <= 8 && /tap|drop|drag|glow/i.test(b)) || 'line after tap: "' + b + '"'; } },
      { kind: 'fn', name: 'the picked card glows exactly where the engine allows it', fn: function () { if (BF.pick == null) return 'no card picked'; var zones = {}; bfMoves(0, BF.pick).forEach(function (x) { zones[x.z] = 1; }); var shown = {}; [].forEach.call(document.querySelectorAll('.bf-tgt'), function (e) { shown[e.dataset.bfz] = 1; }); var a = Object.keys(zones).sort().join(','), b = Object.keys(shown).sort().join(','); return (a === b && a !== '') || 'engine zones [' + a + '] but glowing [' + b + ']'; } }
    ],
    mut: [{ name: 'no target glows', js: 'document.querySelectorAll(".bf-tgt").forEach(function (e) { e.classList.remove("bf-tgt"); e.removeAttribute("data-bfz") })' }]
  });

  // lightbulb help, first-time tips, rules cards and the Tips switch
  GXS.add({
    id: 'dk-tips', name: 'Lightbulb, tips, rules cards, Tips switch', ask: 'Do tips, bulb and rules cards work?', ls: { dkd_offer: '1' }, seed: 42, when: function () { return booted() && typeof GXH !== 'undefined' && typeof hlpPhase === 'function'; }, group: 'UI',
    setup: function () {
      table(42); try { GXH.reset(); GXH.setEnabled(true); } catch (e) { }
      var d = document.createElement('div'); d.id = 'tipsprobe'; d.style.cssText = 'position:fixed;left:8px;top:45%;width:230px;z-index:2147483000;background:#fff;color:#000;padding:4px;display:none'; d.innerHTML = GXH.settingsHTML({ rowClass: 'mrow', btnClass: 'btn' }); document.body.appendChild(d);
      try { GXH.phase(hlpPhase()); } catch (e) { }
      return idle(100).then(function () { return GXS.wait(function () { var b = document.querySelector('.gxh-bub.on'); return b && b.textContent.trim(); }, 8000); }).then(function () { return idle(400); });
    },
    checks: [
      { kind: 'visible', sel: '.gxh-bub.on', name: 'first-time tip bubble' },
      { kind: 'text', sel: '.gxh-bub.on', re: /\S/, name: 'tip text', minPx: 12 },
      { kind: 'fn', name: 'tip bubble is on screen', fn: function () { var r = document.querySelector('.gxh-bub.on').getBoundingClientRect(); return (r.left >= -2 && r.right <= innerWidth + 2 && r.top >= -2 && r.bottom <= innerHeight + 2) || 'bubble off screen'; } },
      { kind: 'visible', sel: '#bulbbtn', name: 'lightbulb button' },
      { kind: 'tap', sel: '#bulbbtn', name: 'tap the lightbulb', state: function () { var s = GXH.state(); return JSON.stringify([s.cur && s.cur.kind, s.rules]); }, expect: function (a, b) { return a !== b || 'lightbulb did nothing'; } },
      { kind: 'fn', name: 'rules card opens and reads', fn: function () { GXH.rules(); var c = document.querySelector('.gxh-card'); return (c && /\S/.test((document.querySelector('.gxh-rt') || {}).textContent || '') && /\S/.test((document.querySelector('.gxh-rx') || {}).textContent || '')) || 'rules card missing or empty'; } },
      { kind: 'tap', sel: '.gxh-x', name: 'tap Close on the rules card', state: function () { return !!document.querySelector('.gxh-card'); }, expect: function (a, b) { return (a === true && b === false) || 'rules card did not close'; } },
      { kind: 'fn', name: 'Tips switch is shown', fn: function () { document.getElementById('tipsprobe').style.display = 'block'; return true; } },
      { kind: 'visible', sel: '#tipsprobe [data-gxh=tips][data-v="0"]', name: 'Tips Off button' },
      { kind: 'tap', sel: '#tipsprobe [data-gxh=tips][data-v="0"]', name: 'tap Tips Off', state: function () { return GXH.enabled(); }, expect: function (a, b) { return (a === true && b === false) || 'Tips switch did not turn off'; } },
      { kind: 'fn', name: 'no tip bubble while Tips are off', fn: function () { return !document.querySelector('.gxh-bub.on') || 'bubble still shown'; } },
      { kind: 'tap', sel: '#tipsprobe [data-gxh=tips][data-v="1"]', name: 'tap Tips On', state: function () { return GXH.enabled(); }, expect: function (a, b) { return (a === false && b === true) || 'Tips switch did not turn on'; } }
    ]
  });
  // painted icons and 3D hero renders: every wired file loads, and each is applied where it belongs
  GXS.add({
    id: 'dk-art', name: 'Painted icons and 3D heroes', ask: 'Are the new icons and hero figures in place?', ls: { dkd_offer: '1' }, seed: 43, when: booted, group: 'Art',
    mut: [
      { name: 'hand emoji is back', js: 'document.documentElement.classList.remove("dk-hand")' },
      { name: 'level gem unpainted', js: 'var st = document.createElement("style"); st.textContent = "#artprobe .lv small{background-image:none!important}"; document.head.appendChild(st)' },
      { name: 'no 3D hero sprites', js: 'dkHero3d = function () { return "" }' }
    ],
    setup: function () {
      table(43);
      var h = document.createElement('div'); h.id = 'artprobe'; h.style.cssText = 'position:fixed;left:-999px;top:0;width:200px'; h.innerHTML = '<div class="mine"><span class="lv"><small>Lv</small> 1</span></div><div class="gxh-bub gxh-a-bottom"><i class="gxh-arr"></i></div>'; document.body.appendChild(h);
      var files = ['media/icon-hand', 'media/icon-level', 'media/ui-bubble-tail'].concat(['pip', 'morwen', 'grub', 'tansy'].map(function (k) { return 'models/hero-' + k; }), ['pip', 'morwen', 'grub', 'tansy'].map(function (k) { return 'models/hero-' + k + '@512'; }));
      window.__art = {};
      return Promise.all(files.map(function (f) { return new Promise(function (r) { var i = new Image(); i.onload = function () { window.__art[f] = i.naturalWidth > 0; r(); }; i.onerror = function () { window.__art[f] = false; r(); }; i.src = f + '.webp'; }); })).then(function () { return idle(900); });
    },
    checks: [
      { kind: 'fn', name: 'every wired file loads (naturalWidth > 0)', fn: function () { var bad = Object.keys(window.__art).filter(function (f) { return !window.__art[f]; }); return !bad.length || 'not loaded: ' + bad.join(', '); } },
      { kind: 'fn', name: 'hand icon replaces the hand emoji', fn: function () { return (document.documentElement.classList.contains('dk-hand') && handIc().indexOf('icon-hand.webp') > 0) || 'emoji still shown'; } },
      { kind: 'fn', name: 'level gem is painted on the Lv label', fn: function () { return getComputedStyle(document.querySelector('#artprobe .lv small')).backgroundImage.indexOf('icon-level.webp') > 0 || 'no gem'; } },
      { kind: 'fn', name: 'speech-bubble tail is painted', fn: function () { return getComputedStyle(document.querySelector('#artprobe .gxh-arr')).backgroundImage.indexOf('ui-bubble-tail.webp') > 0 || 'no tail'; } },
      { kind: 'fn', name: 'winner stands as a 3D hero (Pip, Morwen, Grub, Tansy)', fn: function () { var bad = ''; ['Pip', 'Morwen', 'Grub', 'Tansy'].forEach(function (n) { if (dkHero3d(n, 'win3d').indexOf('models/hero-' + n.toLowerCase()) < 0) bad = bad || n; }); return !bad || 'no 3D sprite for ' + bad; } },
      { kind: 'fn', name: 'heroes without a 3D model keep their painting', fn: function () { return dkHero3d('Bodkin', 'win3d') === '' && dkPortrait('Bodkin', 'winp').indexOf('camp-bodkin') > 0 || 'fallback broken'; } },
      { kind: 'fn', name: 'hand count line keeps its words (>= 12 px)', fn: function () { var e = document.querySelector('.mine .str'); return !e || parseFloat(getComputedStyle(e).fontSize) >= 12 || 'strength line ' + getComputedStyle(e).fontSize; } }
    ]
  });
})();
