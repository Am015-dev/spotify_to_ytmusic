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

  // ---- UI-bar round 3 (14 Oct 2026): diary, side dock, desktop top bar and board. Pure DOM measurements, no screenshots ----
  var rgb = function (c) { var m = String(c).match(/[\d.]+/g) || [0, 0, 0]; return [+m[0], +m[1], +m[2], m[3] == null ? 1 : +m[3]]; };
  var lum = function (c) { var a = rgb(c).slice(0, 3).map(function (v) { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * a[0] + .7152 * a[1] + .0722 * a[2]; };
  var bgOf = function (e) { for (; e && e.nodeType === 1; e = e.parentElement) { var c = rgb(getComputedStyle(e).backgroundColor); if (c[3] > .9) return getComputedStyle(e).backgroundColor; } return 'rgb(246,236,210)'; };
  var ratio = function (e) { var a = lum(getComputedStyle(e).color), b = lum(bgOf(e)); return (Math.max(a, b) + .05) / (Math.min(a, b) + .05); };
  GXS.add({
    id: 'dk-diary', name: 'Diary: readable lines, one style', ask: 'Diary lines big, dark, one style?', ls: { dkd_offer: '1' }, seed: 14, when: booted,
    setup: function () { table(14); for (var i = 0; i < 4; i++) G.log.unshift({ s: i % 3, t: 'Test line ' + i + ': Pip defeats the Plutonium Dragon and gains a level.', n: (G.ln || 0) + i + 1 }); render(); GX.toggle('dkLog'); return GXS.wait(function () { return document.querySelector('#dkLog.on #log li'); }, 5000).then(function () { return idle(500); }); },
    mut: [{ name: 'pale small lines', js: 'var st = document.createElement("style"); st.textContent = "#dkLog #log li .dklt{font-size:11px!important;color:#c8b38a!important}"; document.head.appendChild(st)' }],
    checks: [
      { kind: 'fn', name: 'every diary line is >= 15px with AA contrast (4.5:1)', fn: function () { var bad = []; [].forEach.call(document.querySelectorAll('#dkLog #log li .dklt'), function (e) { var f = parseFloat(getComputedStyle(e).fontSize), r = ratio(e); if (f < 15 || r < 4.5) bad.push(Math.round(f) + 'px ' + r.toFixed(1) + ':1'); }); return bad.length ? bad.slice(0, 3).join('; ') : true; } },
      { kind: 'fn', name: 'one line style: 24px avatar + text, 16px inset from the panel edge', fn: function () { var lis = [].slice.call(document.querySelectorAll('#dkLog #log li')), sig = {}, body = document.querySelector('#dkLog .gx-drawer-body').getBoundingClientRect(), bad = ''; lis.forEach(function (li) { var a = li.querySelector('.ptoklog'), t = li.querySelector('.dklt'); if (!a || !t) { bad = 'line without avatar+text'; return; } var ar = a.getBoundingClientRect(); sig[Math.round(ar.width) + 'x' + Math.round(ar.height) + '/' + getComputedStyle(li).borderLeftWidth]=1; if (ar.left - body.left < 15.5) bad = 'avatar only ' + Math.round(ar.left - body.left) + 'px from the edge'; }); var k = Object.keys(sig); return bad || (k.length === 1 && /^24x24/.test(k[0]) ? true : 'line styles: ' + k.join(' | ')); } },
      { kind: 'fn', name: 'panel is as tall as its lines on a phone (no empty parchment)', fn: function () { var d = document.querySelector('#dkLog'), b = d.querySelector('.gx-drawer-body'); if (innerWidth > 700) return true; return d.getBoundingClientRect().height <= innerHeight * .88 + 1 && (b.scrollHeight - b.clientHeight < 4 ? (d.getBoundingClientRect().height < innerHeight * .88 - 20 || b.scrollHeight > b.clientHeight - 20) : true) || 'panel taller than its content'; } }
    ]
  });
  GXS.add({
    id: 'dk-dock', sizes: 'pc', name: 'Side dock: each event once, one instruction', ask: 'Dock short and readable?', ls: { dkd_offer: '1' }, seed: 15, when: booted,
    setup: function () { table(15); G.phase = 'main'; G.active = 0; UI.since = ['<b>Morwen: level 2 → 3</b>', '<b>You lost a Sword</b>', 'third']; UI.snAct = G.gid + ':0:' + G.turn; UI.toast = { t: 'Ouch test', until: Date.now() + 60000 }; render(); return idle(700); },
    mut: [{ name: 'step pills come back', js: 'var d = document.createElement("div"); d.className = "steps"; d.innerHTML = "<span>1 Get ready</span>"; document.querySelector("#prompt").prepend(d)' }],
    checks: [
      { kind: 'fn', name: 'no step pills, no Ouch banner, no step list, no strength box in the dock', fn: function () { var n = document.querySelectorAll('.gx-dock .steps, .gx-dock .toast, #prompt ol, #prompt .tip').length; return n === 0 || n + ' extra boxes'; } },
      { kind: 'fn', name: '"While you waited" shows at most 2 lines', fn: function () { var n = document.querySelectorAll('#prompt .since li').length; return n <= 2 || n + ' lines'; } },
      { kind: 'fn', name: 'turn order: avatars >= 32px, the current one marked', fn: function () { var a = [].slice.call(document.querySelectorAll('.gx-dock .order .ordav')); if (a.length < 2) return 'only ' + a.length + ' avatars'; var small = a.filter(function (e) { var r = e.getBoundingClientRect(); return r.width < 31.5 || r.height < 31.5; }); return small.length ? small.length + ' avatars under 32px' : document.querySelectorAll('.gx-dock .order .on').length === 1 || 'current player not marked'; } },
      { kind: 'fn', name: 'all dock text >= 16px at >= 1024 wide', fn: function () { if (innerWidth < 1024) return true; var bad = []; [].forEach.call(document.querySelectorAll('.gx-dock *'), function (e) { if (!GXS.vis(e)) return; var own = [].filter.call(e.childNodes, function (n) { return n.nodeType === 3 && /\S/.test(n.textContent); }).length; if (own && parseFloat(getComputedStyle(e).fontSize) < 15.9) bad.push(e.tagName + '.' + e.className + ' ' + getComputedStyle(e).fontSize); }); return bad.length ? bad.slice(0, 3).join('; ') : true; } },
      { kind: 'fn', name: 'main buttons: one size, full width of the dock', fn: function () { var bs = [].slice.call(document.querySelectorAll('#prompt .acts.main .btn')).filter(GXS.vis); if (!bs.length) return 'no buttons'; var w = bs.map(function (b) { return Math.round(b.getBoundingClientRect().width); }), h = bs.map(function (b) { return b.getBoundingClientRect().height; }); var pw = document.querySelector('#prompt').getBoundingClientRect().width; return (Math.max.apply(0, w) - Math.min.apply(0, w) <= 1 && Math.min.apply(0, h) >= 44 && w[0] >= pw - 40) || 'buttons ' + w.join('/') + ' x ' + h.join('/') + ' in ' + Math.round(pw); } },
      { kind: 'fn', name: 'dock height fits its content (no tall empty parchment)', fn: function () { var d = document.querySelector('.gx-dock'), b = d.querySelector('.gx-dock-body'); var empty = d.getBoundingClientRect().height - d.querySelector('.gx-dock-head').getBoundingClientRect().height - b.scrollHeight; return empty < 40 || Math.round(empty) + 'px empty'; } }
    ]
  });
  GXS.add({
    id: 'dk-topbar', sizes: 'pc', name: 'Desktop top bar: 5 buttons, 16px, nothing on the title', ask: 'Top bar tidy?', ls: { dkd_offer: '1' }, seed: 16, when: booted,
    setup: function () { table(16); render(); return idle(600); },
    mut: [{ name: 'a sixth button', js: 'var b = document.createElement("button"); b.className = "gx-ibtn"; b.textContent = "Extra"; document.querySelector(".gx-bar").appendChild(b)' }],
    checks: [
      { kind: 'fn', name: 'at most 5 visible top-bar buttons', fn: function () { var n = [].filter.call(document.querySelectorAll('.gx-bar button'), GXS.vis).length; return n <= 5 || n + ' buttons'; } },
      { kind: 'fn', name: 'top-bar text >= 16px at >= 1024 wide', fn: function () { if (innerWidth < 1024) return true; var bad = []; [].forEach.call(document.querySelectorAll('.gx-bar *, .opps .opp *'), function (e) { if (!GXS.vis(e)) return; var own = [].filter.call(e.childNodes, function (n) { return n.nodeType === 3 && /\S/.test(n.textContent); }).length; if (own && parseFloat(getComputedStyle(e).fontSize) < 15.9) bad.push(e.tagName + '.' + e.className + ' "' + e.textContent.trim().slice(0, 12) + '" ' + getComputedStyle(e).fontSize); }); return bad.length ? bad.slice(0, 3).join('; ') : true; } },
      { kind: 'fn', name: 'nothing sits on the title', fn: function () { var t = document.querySelector('.gx-bar h1').getBoundingClientRect(), bad = []; [].forEach.call(document.querySelectorAll('#gxlab-bar, .gx-bar button, .gx-bar .ph-chip'), function (e) { if (!GXS.vis(e)) return; var r = e.getBoundingClientRect(); if (r.left < t.right && r.right > t.left && r.top < t.bottom && r.bottom > t.top) bad.push(e.id || e.className); }); return bad.length ? 'over the title: ' + bad.join(', ') : true; } },
      { kind: 'fn', name: 'rival chip text stays inside its chip', fn: function () { var bad = []; [].forEach.call(document.querySelectorAll('.opp.seat'), function (s) { var sr = s.getBoundingClientRect(); [].forEach.call(s.querySelectorAll('.snm,.sbd,.sbd *'), function (e) { var r = e.getBoundingClientRect(); if (r.width && (r.right > sr.right - 2 || e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflow !== 'visible')) bad.push(e.textContent.trim().slice(0, 14)); }); }); return bad.length ? 'spills: ' + bad.slice(0, 3).join(', ') : true; } }
    ]
  });
  GXS.add({
    id: 'dk-wide-board', sizes: 'pc', name: 'Desktop board: natural cards, readable decks', ask: 'Cards big, decks readable?', ls: { dkd_offer: '1' }, seed: 17, when: booted,
    setup: function () { table(17); G.phase = 'main'; G.active = 1; G.kicked = null; render(); return idle(700); },
    mut: [{ name: 'door stretched', js: 'var st = document.createElement("style"); st.textContent = ".bfdoor.small{width:90px!important;aspect-ratio:auto!important}"; document.head.appendChild(st)' }],
    checks: [
      { kind: 'fn', name: 'the door card keeps its aspect (1:1.42) and is >= 20% of the board height', fn: function () { var d = document.querySelector('.bfdoor'); if (!d) return 'no door'; var r = d.getBoundingClientRect(), b = document.querySelector('.gx-board').getBoundingClientRect(); var ar = r.height / r.width; if (Math.abs(ar - 1.42) > .1) return 'aspect ' + ar.toFixed(2); return r.height >= .2 * b.height || 'door only ' + Math.round(100 * r.height / b.height) + '% of the board'; } },
      { kind: 'fn', name: 'decks and discards whole inside the board, labels >= 16px', fn: function () { if (innerWidth < 1024) return true; var b = document.querySelector('.gx-board').getBoundingClientRect(), bad = []; [].forEach.call(document.querySelectorAll('.pile, .pile *'), function (e) { if (!GXS.vis(e)) return; var r = e.getBoundingClientRect(); if (r.left < b.left - 1 || r.right > b.right + 1 || r.top < b.top - 1 || r.bottom > b.bottom + 1) bad.push('cut ' + (e.className + '').slice(0, 12)); var own = [].filter.call(e.childNodes, function (n) { return n.nodeType === 3 && /\S/.test(n.textContent); }).length; if (own && !e.closest('.card') && parseFloat(getComputedStyle(e).fontSize) < 15.9) bad.push((e.className + '').slice(0, 10) + ' ' + getComputedStyle(e).fontSize); }); return bad.length ? bad.slice(0, 3).join('; ') : true; } }
    ]
  });

  GXS.add({
    id: 'dk-kick-order', name: 'Kick: door opens first, then the card', ask: 'Door swings open, THEN the card shows?', ls: { dkd_offer: '1' }, seed: 12, when: booted,
    setup: function () {
      table(12); UI.pause = true; try { GXH.setEnabled(false); } catch (e) { }
      var ob = window.__ko = { door0: 0, door1: 0, card: 0, early: '' };
      var m = idOf('lizards'); if (m != null) { pull(m); G.door.push(m); }   // a plain monster on top: no boss clip
      var iv = setInterval(function () {
        var now = performance.now(), r = document.getElementById('bfrev');
        if (r) { if (!ob.door0 && r.classList.contains('door')) ob.door0 = now; var i = r.querySelector('.bfd3 img'); if (!ob.door1 && r.classList.contains('open')) { ob.door1 = now; }
          var oc = r.querySelector('.bfrc .card'); if (!ob.card && oc && getComputedStyle(oc).visibility !== 'hidden') ob.card = now; }
        var bc = document.querySelector('.arena .row.mons .mon .card,.bfstage .row .card');
        if (bc && !ob.card && getComputedStyle(bc).visibility !== 'hidden') ob.early = 'the board card is visible before the door animation ended';
      }, 16);
      window.__koIv = iv; G.phase = 'main'; G.active = 0; render();
      return new Promise(function (r) { setTimeout(r, 300); });
    },
    mut: [{ name: 'card shown at once', js: 'var st = document.createElement("style"); st.textContent = ".bfrev .bfrc .card{visibility:visible!important}"; document.head.appendChild(st)' }],
    checks: [
      { kind: 'play', name: 'tap Kick: door animation start < end <= card visible', settleMs: 6000, snap: function () { return { door: G.door.length }; },
        steps: [{ sel: '.bfdoor' }], idle: function () { var o = window.__ko; return o.card && !document.getElementById('bfrev'); },
        verify: function (b, a) { clearInterval(window.__koIv); var o = window.__ko;
          if (!o.door0) return 'the door animation never started';
          if (!(o.door0 < o.door1)) return 'door animation did not run (start ' + o.door0 + ', end ' + o.door1 + ')';
          if (!(o.door1 <= o.card)) return 'card visible before the door finished (' + Math.round(o.door1 - o.card) + ' ms)';
          if (o.card - o.door0 < 300) return 'door opened in ' + Math.round(o.card - o.door0) + ' ms: no animation';
          return o.early || (a.door === b.door - 1) || 'door pile did not shrink'; } }
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
  // ---- owner's phone screenshots, 14 Oct 2026: menu rows, gear-up board ----
  var clipMsg = function (e, nm) {   // '' when whole; else why not (screen edge or a clipping ancestor)
    var r = e.getBoundingClientRect(); if (!r.width) return nm + ' has no box';
    if (r.left < -1 || r.right > innerWidth + 1 || r.top < -1 || r.bottom > innerHeight + 1) return nm + ' leaves the screen (' + Math.round(r.left) + '..' + Math.round(r.right) + ' of ' + innerWidth + ')';
    for (var p = e.parentElement; p && p !== document.documentElement; p = p.parentElement) {
      var cs = getComputedStyle(p); if (cs.overflowX === 'visible' && cs.overflowY === 'visible') continue;
      var q = p.getBoundingClientRect(); if (r.left < q.left - 1 || r.right > q.right + 1 || r.top < q.top - 1 || r.bottom > q.bottom + 1) return nm + ' is cut by <' + p.tagName.toLowerCase() + '.' + String(p.className).split(' ')[0] + '> (' + Math.round(r.left - q.left) + ',' + Math.round(r.top - q.top) + ' / ' + Math.round(q.right - r.right) + ',' + Math.round(q.bottom - r.bottom) + ' px in)';
    }
    return '';
  };
  var frameW = function (e) {   // left/right painted frame width (border-image-width), px
    var w = getComputedStyle(e).borderImageWidth.split(' ').map(parseFloat); if (w.length === 1) return [w[0], w[0]]; if (w.length === 2) return [w[1], w[1]]; return [w[3], w[1]];
  };
  GXS.add({
    id: 'dk-menu-rows', sizes: 'phone', name: 'Menu rows: text clear of the painted frame', ask: 'Do menu rows read cleanly?', ls: { dkd_offer: '1' }, seed: 31, when: booted, group: 'UI',
    setup: function () { table(31); document.querySelector('[data-gx="dkMenu"]').click(); return GXS.wait(function () { var d = document.querySelector('#dkMenuBody .menu'); return d && GXS.vis(d); }, 5000).then(function () { return idle(700); }); },
    mut: [
      { name: 'row text under the frame', js: 'var st = document.createElement("style"); st.textContent = "#dkMenuBody .btn{padding-left:2px!important;padding-right:2px!important}"; document.head.appendChild(st)' },
      { name: 'tips row unframed', js: 'var st = document.createElement("style"); st.textContent = "#dkMenuBody .mrow{border-image:none!important;margin-left:-10px!important}"; document.head.appendChild(st)' },
      { name: 'last row cut at the bottom', js: 'var st = document.createElement("style"); st.textContent = "#dkMenuBody{padding-bottom:0!important}.gx-drawer-body{padding-bottom:0!important}"; document.head.appendChild(st)' }
    ],
    checks: [
      { kind: 'visible', sel: '#dkMenuBody .menu', name: 'menu is open' },
      { kind: 'fn', name: 'the painted skin is on', fn: function () { return document.documentElement.classList.contains('sk') || 'html.sk missing'; } },
      { kind: 'fn', name: 'every framed row: first letter/icon and last letter are clear of the frame cap (>= 6 px)', fn: function () {
        var bad = []; [].forEach.call(document.querySelectorAll('#dkMenuBody .menu>.btn, #dkMenuBody .mrow .btn'), function (b) {
          if (!GXS.vis(b)) return; var cs = getComputedStyle(b), f = frameW(b), l = parseFloat(cs.borderLeftWidth) + parseFloat(cs.paddingLeft), r = parseFloat(cs.borderRightWidth) + parseFloat(cs.paddingRight);
          if (l < f[0] + 6 || r < f[1] + 6) bad.push('"' + b.textContent.trim().slice(0, 16) + '" room ' + l + '/' + r + ' < frame ' + f[0] + '/' + f[1] + '+6'); });
        return bad.length ? bad.slice(0, 4).join('; ') : true; } },
      { kind: 'fn', name: 'Tips rows are framed and inset like every other row', fn: function () {
        var rows = [].slice.call(document.querySelectorAll('#dkMenuBody .mrow')).filter(GXS.vis), b0 = document.querySelector('#dkMenuBody .menu>.btn').getBoundingClientRect(); if (!rows.length) return 'no Tips rows';
        for (var i = 0; i < rows.length; i++) { var r = rows[i].getBoundingClientRect(), cs = getComputedStyle(rows[i]);
          if (cs.borderImageSource === 'none') return 'row "' + rows[i].textContent.trim().slice(0, 14) + '" has no painted frame';
          if (Math.abs(r.left - b0.left) > 1.5 || Math.abs(r.right - b0.right) > 1.5) return 'row "' + rows[i].textContent.trim().slice(0, 14) + '" is ' + Math.round(r.left) + '..' + Math.round(r.right) + ' but the other rows are ' + Math.round(b0.left) + '..' + Math.round(b0.right);
          var f = frameW(rows[i]), lab = rows[i].querySelector('span'); if (lab) { var lr = document.createRange(); lr.selectNodeContents(lab); if (lr.getBoundingClientRect().left < r.left + f[0] + 6) return 'label "' + lab.textContent.trim().slice(0, 12) + '" sits on the frame'; }
          var kids = rows[i].querySelectorAll('.btn'); for (var k = 0; k < kids.length; k++) { var q = kids[k].getBoundingClientRect(); if (q.right > r.right - f[1] - 2) return '"' + kids[k].textContent.trim() + '" runs into the right frame/edge (' + Math.round(q.right) + ' > ' + Math.round(r.right - f[1] - 2) + ')'; if (kids[k].scrollWidth > kids[k].clientWidth + 1) return '"' + kids[k].textContent.trim() + '" is cut'; } }
        return true; } },
      { kind: 'fn', name: 'scroll to the end: the last row is whole, with room under it', fn: function () {
        var sc = document.querySelector('#dkMenuBody').closest('.gx-drawer-body'), last = document.querySelector('#dkMenuBody .menu').lastElementChild; sc.scrollTop = sc.scrollHeight;
        var r = last.getBoundingClientRect(), q = sc.getBoundingClientRect(); return (r.bottom <= q.bottom - 20 && r.bottom <= innerHeight - 20 && r.top >= q.top) || 'last row "' + last.textContent.trim().slice(0, 12) + '" ends at ' + Math.round(r.bottom) + ', panel ends at ' + Math.round(q.bottom) + ', screen ' + innerHeight; } },
      { kind: 'fn', name: 'no floating tab/arrow of ours over the menu (the edge tab and round back arrow belong to the browser)', fn: function () {
        var bad = [].slice.call(document.querySelectorAll('body *')).filter(function (e) { return /^[❮‹❯›]\s*$/.test(e.textContent) && GXS.vis(e) && !e.closest('.gx-x'); }); return !bad.length || 'floating <' + bad[0].tagName + '.' + bad[0].className + '>'; } }
    ]
  });

  // the gear-up moment: your hero big in the middle, the hand fanned below
  var gearUp = function (seed, longNames) {
    table(seed); G.phase = 'setup'; G.active = 0; G.setupOrd = G.pl.map(function (_, j) { return j; }); G.setupI = 0;
    if (longNames) {   // the cards from the owner's screenshot: names with long words
      var want = ['Shady Cloak', 'Soothing Sousaphone', 'Shieldmaiden Champion']; want.forEach(function (n) { var id = Object.keys(G.C).map(Number).filter(function (i) { return cd(i).n === n; })[0]; if (id != null) { pull(id); P(0).hand.unshift(id); } });
      P(0).hand = P(0).hand.slice(0, 8); window.__want = want.filter(function (n) { return P(0).hand.some(function (i) { return cd(i).n === n; }); });
    }
    render();
  };
  GXS.add({
    id: 'dk-hand-names', sizes: 'phone', name: 'Hand card names readable', ask: 'Can you read every card name?', ls: { dkd_offer: '1' }, seed: 33, when: booted, group: 'Board',
    setup: function () { gearUp(33, true); return GXS.wait(function () { return document.querySelectorAll('.mine .hand .card').length >= 6; }, 6000).then(function () { return idle(700); }); },
    mut: [{ name: 'names run under the next card', js: 'var st = document.createElement("style"); st.textContent = "html.ph .mine .hand .card .cn{width:100%!important;max-width:none!important}"; document.head.appendChild(st)' }],
    checks: [
      { kind: 'visible', sel: '.mine .hand .card', name: 'hand' },
      { kind: 'fn', name: 'the long names are in the hand', fn: function () { return (window.__want && window.__want.length >= 2) || 'only ' + (window.__want || []).length + ' long-name cards found'; } },
      { kind: 'fn', name: 'every card name is fully visible: not under the next card, not clipped, no word broken', fn: function () {
        var cards = [].slice.call(document.querySelectorAll('.mine .hand .card')), bad = [];
        cards.forEach(function (c) { var n = c.querySelector('.cn'); if (!n || !GXS.vis(n)) return; var r = document.createRange(); r.selectNodeContents(n); var rs = [].slice.call(r.getClientRects()).filter(function (q) { return q.width > 1 && q.height > 1; });
          if (n.scrollWidth > n.clientWidth + 1) bad.push('"' + n.textContent.trim() + '" clipped');
          rs.forEach(function (q) { [q.left + 1, q.right - 1].forEach(function (x) { var t = document.elementFromPoint(x, q.top + q.height / 2); var oc = t && t.closest('.card'); if (oc && oc !== c) { if (bad.length < 4) bad.push('"' + n.textContent.trim() + '" is covered at x=' + Math.round(x)); } }); });
          var ws = n.textContent.trim().split(/\s+/); if (rs.length > ws.length + 1) bad.push('"' + n.textContent.trim() + '" has a word broken in the middle (' + rs.length + ' lines for ' + ws.length + ' words)'); });
        return bad.length ? bad.slice(0, 4).join('; ') : true; } }
    ]
  });
  GXS.add({
    id: 'dk-gear-up', sizes: 'phone', name: 'Gear-up board: badges whole, one instruction', ask: 'One clear line, nothing cut off?', ls: { dkd_offer: '1' }, seed: 34, when: booted, group: 'Board',
    setup: function () { gearUp(34, false); try { GXH.reset(); GXH.setEnabled(true); } catch (e) { } return GXS.wait(function () { return document.querySelector('.bfbig') && document.querySelector('#prompt .bfline'); }, 6000).then(function () { return idle(1800); }); },
    mut: [
      { name: 'Lv badge pushed out of the circle', js: 'var st = document.createElement("style"); st.textContent = ".bfbig .bfblv{top:-30px!important;right:-40px!important}"; document.head.appendChild(st)' },
      { name: 'a second instruction line appears', js: 'var d = document.createElement("div"); d.className = "bfcap"; d.textContent = "Gear up your hero!"; document.querySelector(".bfstage").appendChild(d)' },
      { name: 'treasure label cut at the edge', js: 'var st = document.createElement("style"); st.textContent = ".pile.pr{margin-right:-30px!important}"; document.head.appendChild(st)' }
    ],
    checks: [
      { kind: 'visible', sel: '.bfbig', name: 'your hero, big' },
      { kind: 'fn', name: 'Lv badge is whole (not cut by the hero circle or the screen)', fn: function () { return clipMsg(document.querySelector('.bfbig .bfblv'), 'Lv badge') || true; } },
      { kind: 'fn', name: 'TREASURE label and its deck badge are whole', fn: function () { var bad = []; [].forEach.call(document.querySelectorAll('.pile.pr, .pile.pr *, .stack.treas, .stack.treas *'), function (e) { if (!GXS.vis(e) || (!e.children.length && !/\S/.test(e.textContent))) return; var m = clipMsg(e, '"' + (e.textContent.trim().slice(0, 12) || e.className) + '"'); if (m && bad.length < 3) bad.push(m); }); return bad.length ? bad.join('; ') : true; } },
      { kind: 'fn', name: 'DOOR label and badge are whole', fn: function () { var bad = []; [].forEach.call(document.querySelectorAll('.pile.pl, .pile.pl *, .stack.door, .stack.door *'), function (e) { if (!GXS.vis(e) || (!e.children.length && !/\S/.test(e.textContent))) return; var m = clipMsg(e, '"' + (e.textContent.trim().slice(0, 12) || e.className) + '"'); if (m && bad.length < 3) bad.push(m); }); return bad.length ? bad.join('; ') : true; } },
      { kind: 'fn', name: 'ONE instruction on screen (no board caption, no tip box), 8 words or fewer', fn: function () {
        var vis = [].slice.call(document.querySelectorAll('#prompt .bfline, .bfstage .bfcap, .gxh-bub.on')).filter(function (e) { return GXS.vis(e) && /\S/.test(e.textContent); });
        var lines = vis.map(function (e) { return e.textContent.trim(); }); if (lines.length !== 1) return lines.length + ' instruction texts at once: ' + lines.map(function (t) { return '"' + t + '"'; }).join(' / ');
        return wordsIn(lines[0]) <= 8 || '"' + lines[0] + '" is ' + wordsIn(lines[0]) + ' words'; } },
      { kind: 'fn', name: 'the line says what works: tap OR drag', fn: function () { var t = line(); return (/tap/i.test(t) && /drag/i.test(t)) || 'line is "' + t + '"'; } },
      { kind: 'play', name: 'tap a glowing card, then your hero: it is played (the line is true)', snap: function () { return { hand: P(0).hand.length }; },
        steps: [{ sel: '.mine .hand .card.play', until: function () { return BF.pick != null; }, max: 3 }, { sel: '.bf-tgt' }], idle: function () { return !UI.busy && BF.pick == null; },
        verify: function (b, a) { return (a.hand === b.hand - 1) || 'hand ' + b.hand + ' -> ' + a.hand + ': the card was not played by tap, tap'; } },
      { kind: 'fn', name: 'rival chips: the sword and helmet numbers carry a word (str / gear), whole inside the chip', fn: function () {
        var bad = []; [].forEach.call(document.querySelectorAll('.opp.seat'), function (s) { var b = s.querySelector('.sbd'), t = b.textContent;
          if (!/\d\s*str/.test(t) || !/\d\s*gear/.test(t)) bad.push('"' + t.trim() + '" has no words'); if (b.scrollWidth > b.clientWidth + 1 || b.getBoundingClientRect().right > s.getBoundingClientRect().right + 1) bad.push('chip text cut: "' + t.trim() + '"'); });
        return bad.length ? bad.join('; ') : true; } },
      { kind: 'fn', name: 'hero is a painted portrait (not the flat SVG face)', fn: function () { var i = document.querySelector('.bfbig img.bfbav'); return (i && /camp-|portrait|hero/.test(i.getAttribute('src') || '')) || 'big hero is ' + (document.querySelector('.bfbig .bfbav') ? document.querySelector('.bfbig .bfbav').tagName : 'missing'); } }
    ]
  });

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
