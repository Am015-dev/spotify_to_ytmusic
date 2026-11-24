// ui5: the tutorial. A floating lesson window (drag by its title bar, minimise, close) that never dims the screen and never
// blocks a tap: everything stays playable. It opens with a labelled map of the real HUD (also on the ? button), then one
// lesson per rule in play order (one sentence + why), each ticked when you do it or press Next, then a practice finish.
(function () {
  var HUD = [
    ['#cv', 'Dungeon', 'The hex map: heroes, foes, doors, coins and traps live here; tap a figure to read it.'],
    ['#roundc', 'Round', 'The round counter; some goals have a round limit.'],
    ['#els', 'Elements', 'Six elements: lit ones are charged and can power a card bonus.'],
    ['#order', 'Turn order', 'Everyone this round, lowest initiative acts first.'],
    ['#goalchip', 'Goal', 'What you must do to win this scenario.'],
    ['#herobar', 'Heroes', 'Each hero with HP and cards left in hand.'],
    ['#tray', 'Your hand', 'Your ability cards: top half, initiative in the middle, bottom half.'],
    ['#pbtns', 'Actions', 'Ready, Rest, Hint and Skip appear here when you can use them.'],
    ['#zoombox', 'Zoom', 'Zoom the map in and out.'],
    ['[data-gx="logd"]', 'Log', 'Every move and dice-like card flip so far.'],
    ['[data-gx="rulesd"]', 'Rules', 'The full rules, any time.'],
    ['#tutq', 'Help', 'Reopens this map and the lessons.']
  ];
  var any = function (fn) { return G && G.figs.some(fn); };
  var seen = function (k) { return !!(UI.tseen && UI.tseen[k]); };
  var LS = [
    { k: 'map', t: 'Your screen', s: 'Tap any label to learn what that part does.', y: 'Knowing where things are makes every later step quicker.', map: 1 },
    { k: 'cards', t: 'Pick two cards', s: 'Each round every hero secretly picks 2 cards from hand.', y: 'Your two cards are your whole turn, so you plan before anyone moves.', tg: '#tray .cd', done: function () { return G && Object.keys(G.sel || {}).length > 0 || seen('first'); } },
    { k: 'init', t: 'Initiative', s: 'The number in the card\'s middle is its initiative; you act at the lower of your two.', y: 'Low cards act early, so you can strike before the foe does.', tg: '#tray .cd .in', done: function () { return seen('first') || seen('mturn'); } },
    { k: 'mcards', t: 'Foe cards', s: 'Then each foe type turns up a card that sets its initiative, move and attack.', y: 'Foes are not random each turn: their card tells you what they will do.', tg: '#order', done: function () { return seen('mturn') || seen('first'); } },
    { k: 'order', t: 'Turn order', s: 'Figures act from lowest initiative; a hero wins a tie with a foe.', y: 'Reading the track tells you who hits first.', tg: '#order', done: function () { return seen('first') || seen('half'); } },
    { k: 'halves', t: 'Top and bottom', s: 'On your turn play the top half of one card and the bottom half of the other, in either order.', y: 'Every card is two choices, so each pair gives you options.', tg: '#tray .half.can', done: function () { return seen('half') || seen('move'); } },
    { k: 'basic', t: 'Plain halves', s: 'Any top can be played as Attack 2 and any bottom as Move 2 instead.', y: 'You are never stuck with a half that does nothing useful.', tg: '#tray .basic', done: function () { return false; } },
    { k: 'move', t: 'Moving', s: 'A move lights the hexes you can reach; walls, obstacles and figures block, rubble costs 2.', y: 'Position decides who you can hit and who can hit you.', tg: '#cv', done: function () { return seen('move'); } },
    { k: 'attack', t: 'Attacking', s: 'An attack flips a modifier card: +1, −1, +2, −2, ×2 or MISS change the damage.', y: 'Hits are never certain, so plan a little spare damage.', tg: '#cv', done: function () { return seen('atk'); } },
    { k: 'adv', t: 'Advantage', s: 'Strong draws two modifiers and keeps the better; Muddle or a ranged shot at a neighbour keeps the worse.', y: 'Stack the odds before a big hit.', done: function () { return false; } },
    { k: 'shield', t: 'Shield and retaliate', s: 'Shield takes damage off each hit; retaliate hurts whoever hits that figure in reach.', y: 'Some foes punish careless melee.', done: function () { return seen('shield') || seen('retal'); } },
    { k: 'cond', t: 'Conditions', s: 'Poison (+1 damage taken), Wound, Stuck, Disarm, Stun, Muddle, Hidden, Strong, Curse and Bless last until the end of the figure\'s next turn; healing cures poison and wound.', y: 'A stunned foe loses a whole turn.', done: function () { return seen('cond'); } },
    { k: 'elem', t: 'Elements', s: 'Some halves charge an element at the end of your turn; another half can spend it for a bonus.', y: 'Charging for a friend who acts later is free power.', tg: '#els', done: function () { return seen('infuse'); } },
    { k: 'lost', t: 'Played and lost', s: 'Used cards go to your played pile; a half marked LOST removes its card for the scenario.', y: 'Lost cards are strong but shorten how long you last.', tg: '#herobar', done: function () { return seen('second'); } },
    { k: 'loot', t: 'Coins', s: 'You pick up coins under you at the end of your turn; each is gold after the scenario.', y: 'Gold buys items between scenarios.', done: function () { return seen('loot') || seen('coin'); } },
    { k: 'mturn', t: 'Foe turns', s: 'A foe targets the hero it can reach with the least movement, moves the least it must, then attacks.', y: 'You can predict and bait them.', done: function () { return seen('mturn'); } },
    { k: 'door', t: 'Doors', s: 'Step onto a door to open it; the next room and its foes appear and join this round.', y: 'Open doors when you are ready for the next fight.', done: function () { return seen('door') || seen('reveal'); } },
    { k: 'trap', t: 'Traps and terrain', s: 'A trap deals 2 + level once; brine hurts on each step in; jump and flying ignore terrain.', y: 'Push foes into traps, keep heroes out.', done: function () { return seen('trap') || seen('haz'); } },
    { k: 'endr', t: 'End of round', s: 'Elements fade a step, round shields end, and decks that drew ×2 or MISS reshuffle.', y: 'A charged element only lasts about a round.', done: function () { return seen('endround'); } },
    { k: 'srest', t: 'Short rest', s: 'At round end, with 2+ played cards, lose one random played card and take the rest back; once you may take 1 damage to swap it.', y: 'Resting buys more turns at the cost of a card.', done: function () { return seen('srest'); } },
    { k: 'lrest', t: 'Long rest', s: 'Instead of picking cards, Rest: act at initiative 99, choose the card to lose, heal 2 and refresh items.', y: 'Slower, but you keep your best card and heal.', done: function () { return seen('lrest'); } },
    { k: 'exh', t: 'Exhaustion', s: 'At 0 HP, or with too few cards to play 2 or rest, a hero is out; you may lose cards to stop a knockout hit.', y: 'Your hand is your clock: manage it.', done: function () { return seen('exh') || seen('block'); } },
    { k: 'win', t: 'Winning', s: 'When the goal is met you win at the end of that round; if every hero is out, you lose.', y: 'Finish the round safely even after the last kill.', tg: '#goalchip', done: function () { return !!(G && (G.goalMet || G.done)); } },
    { k: 'camp', t: 'After the scenario', s: 'Heroes keep XP and gold win or lose; levels bring a new card and a perk, gold buys items.', y: 'Even a loss makes you stronger for the retry.', done: function () { return !!(G && G.done); } },
    { k: 'practice', t: 'Practice run', s: 'Now finish this scenario on your own; the checklist ticks rules as they happen.', y: 'Doing it once is the best teacher.', done: function () { return !!(G && G.done); } }
  ];
  window.TUT_LESSONS = LS; window.TUT_HUD = HUD;
  var T = UI.tutor = { i: 0, done: {}, open: false, min: false, map: false, list: false, x: null, y: null };

  // never let the old in-dock lesson panel take over: the floating window replaces it
  var _nl = nextLesson; nextLesson = function () { return T.open || UI.tut ? null : _nl(); };
  var _pe = playEv; playEv = function (e) { (UI.tseen = UI.tseen || {})[e.e] = 1; return _pe(e); };
  var _st = startTutorial; startTutorial = function () { UI.tseen = {}; T.i = 0; T.done = {}; T.min = false; T.sig = null; _st(); openTutor(true); };

  var w = document.createElement('div'); w.id = 'tutor'; w.setAttribute('role', 'dialog'); w.setAttribute('aria-label', 'Lesson'); w.hidden = true; document.body.appendChild(w);
  var ring = document.createElement('div'); ring.id = 'tring'; ring.setAttribute('aria-hidden', 'true'); document.body.appendChild(ring);
  var map = document.createElement('div'); map.id = 'hudmap'; map.hidden = true; document.body.appendChild(map);
  var q = document.createElement('button'); q.type = 'button'; q.id = 'tutq'; q.className = 'gx-ibtn'; q.setAttribute('aria-label', 'Help: screen map and lessons'); q.title = 'Help'; q.innerHTML = '<b>?</b>';
  var bar = document.querySelector('.gx-bar'), lg = document.querySelector('[data-gx="logd"]'); if (bar && lg) bar.insertBefore(q, lg);
  q.addEventListener('click', function () { if (T.open && !T.min && T.map) { T.map = false; render(); return; } openTutor(true); });

  function cur() { return LS[T.i]; }
  function openTutor(withMap) { T.open = true; T.min = false; if (withMap) { T.map = true; T.i = Math.max(0, T.i); if (T.i === 0) T.map = true; } render(); }
  function advance() {
    T.done[cur().k] = 1; T.tip = null;
    var n = T.i + 1; while (n < LS.length && T.done[LS[n].k]) n++;
    T.i = Math.min(n, LS.length - 1); T.map = !!cur().map; render();
  }
  function goto(i) { T.i = i; T.map = !!LS[i].map; T.tip = null; T.list = false; render(); }

  function render() {
    w.hidden = !T.open; document.body.classList.toggle('tutor-on', T.open && !T.min);
    if (!T.open) { map.hidden = true; ring.style.display = 'none'; return; }
    var L = cur(), nd = Object.keys(T.done).length;
    w.className = T.min ? 'min' : '';
    var h = '<div class="tth" id="tutdrag"><span class="ttn">Lesson ' + (T.i + 1) + '/' + LS.length + '</span><b class="ttt">' + esc(L.t) + '</b>' +
      '<button type="button" id="tutmin" aria-label="' + (T.min ? 'Expand lesson' : 'Minimise lesson') + '">' + (T.min ? '▢' : '—') + '</button>' +
      '<button type="button" id="tutx" aria-label="Close lesson">✕</button></div>';
    if (!T.min) {
      h += '<div class="ttb"><p class="tts">' + esc(T.tip || L.s) + '</p>' + (T.tip ? '' : '<p class="tty"><i>Why:</i> ' + esc(L.y) + '</p>') +
        '<div class="ttf"><button type="button" class="btn" id="tutlist" aria-expanded="' + T.list + '">Checklist ' + nd + '/' + LS.length + '</button>' +
        (T.i < LS.length - 1 ? '<button type="button" class="btn go" id="tutnext">Next</button>' : '<button type="button" class="btn go" id="tutnext">Done</button>') + '</div>';
      if (T.list) h += '<ol class="ttl">' + LS.map(function (l, i) { return '<li><button type="button" data-li="' + i + '" class="' + (T.done[l.k] ? 'ok' : '') + (i === T.i ? ' now' : '') + '">' + (T.done[l.k] ? '✓ ' : '○ ') + esc(l.t) + '</button></li>'; }).join('') + '</ol>';
      h += '</div>';
    }
    w.innerHTML = h;
    $('tutmin').onclick = function () { T.min = !T.min; render(); };
    $('tutx').onclick = function () { T.open = false; T.map = false; render(); };
    if (!T.min) {
      $('tutnext').onclick = function () { if (T.i === LS.length - 1) { T.done[cur().k] = 1; T.open = false; render(); } else advance(); };
      $('tutlist').onclick = function () { T.list = !T.list; render(); };
      w.querySelectorAll('[data-li]').forEach(function (b) { b.onclick = function () { goto(+b.dataset.li); }; });
    }
    place(); drawMap();
  }
  function place() {
    var vw = innerWidth, vh = innerHeight, r = w.getBoundingClientRect();
    if (T.x == null) { var phone = vw < 700; T.x = phone ? 8 : vw - r.width - 12; T.y = phone ? 104 : 104; }
    T.x = Math.max(4, Math.min(vw - r.width - 4, T.x)); T.y = Math.max(4, Math.min(vh - r.height - 4, T.y));
    w.style.left = T.x + 'px'; w.style.top = T.y + 'px';
  }
  // drag by the title bar (pointer events: mouse and touch)
  w.addEventListener('pointerdown', function (e) {
    var hd = e.target.closest('#tutdrag'); if (!hd || e.target.closest('button')) return;
    var sx = e.clientX - T.x, sy = e.clientY - T.y; hd.setPointerCapture(e.pointerId);
    function mv(ev) { T.x = ev.clientX - sx; T.y = ev.clientY - sy; place(); }
    function up() { hd.removeEventListener('pointermove', mv); hd.removeEventListener('pointerup', up); hd.removeEventListener('pointercancel', up); }
    hd.addEventListener('pointermove', mv); hd.addEventListener('pointerup', up); hd.addEventListener('pointercancel', up);
  });

  // labelled HUD map: callouts with leader lines, laid out so no two labels overlap each other, the window, or leave the screen
  function vis(el) { if (!el) return null; var b = el.getBoundingClientRect(); return b.width > 2 && b.height > 2 && b.bottom > 0 && b.top < innerHeight ? b : null; }
  function hit(a, b, m) { return a.x < b.x + b.w + m && b.x < a.x + a.w + m && a.y < b.y + b.h + m && b.y < a.y + a.h + m; }
  function drawMap() {
    var show = T.open && !T.min && T.map; map.hidden = !show; if (!show) return;
    map.innerHTML = ''; var vw = innerWidth, vh = innerHeight, placed = [], wr = w.getBoundingClientRect();
    var keep = [{ x: wr.left, y: wr.top, w: wr.width, h: wr.height }];
    // labels never cover a control: every HUD target except the map itself, plus every button on screen
    HUD.map(function (H) { return H[0] === '#cv' ? null : vis(document.querySelector(H[0])); }).concat(Array.prototype.map.call(document.querySelectorAll('.gx-bar button, #pbtns button, #zoombox button, #goalchip, #prompt'), vis))
      .forEach(function (b) { if (b) keep.push({ x: b.left, y: b.top, w: b.width, h: b.height }); });
    var svg = '<svg width="' + vw + '" height="' + vh + '" viewBox="0 0 ' + vw + ' ' + vh + '">', labs = [];
    HUD.forEach(function (H) {
      var b = vis(document.querySelector(H[0])); if (!b) return;
      var lw = Math.min(140, 22 + H[1].length * 9), lh = 30;
      var ax = Math.max(b.left, Math.min(b.right, vw / 2)), ay = Math.max(b.top, Math.min(b.bottom, vh / 2));
      if (H[0] === '#cv') { ax = b.left + b.width / 2; ay = b.top + b.height * 0.4; }
      var best = null;
      for (var d = 30; d < 700 && !best; d += 14) for (var a = 0; a < 24 && !best; a++) {
        var ang = Math.PI * 2 * a / 24 + (ay < vh / 2 ? Math.PI / 2 : -Math.PI / 2), cx = ax + Math.cos(ang) * d, cy = ay + Math.sin(ang) * d;
        var rc = { x: cx - lw / 2, y: cy - lh / 2, w: lw, h: lh };
        if (rc.x < 4 || rc.y < 4 || rc.x + lw > vw - 4 || rc.y + lh > vh - 4) continue;
        if (placed.concat(keep).some(function (p) { return hit(rc, p, 4); })) continue;
        best = rc;
      }
      if (!best) return;
      placed.push(best);
      svg += '<line x1="' + ax + '" y1="' + ay + '" x2="' + (best.x + lw / 2) + '" y2="' + (best.y + lh / 2) + '"/><circle cx="' + ax + '" cy="' + ay + '" r="4"/>';
      labs.push([best, H]);
    });
    map.innerHTML = svg + '</svg>';
    labs.forEach(function (L) {
      var bt = document.createElement('button'); bt.type = 'button'; bt.className = 'hlab'; bt.textContent = L[1][1];
      bt.style.left = L[0].x + 'px'; bt.style.top = L[0].y + 'px'; bt.style.width = L[0].w + 'px';
      bt.setAttribute('aria-label', L[1][1] + ': explain');
      bt.addEventListener('click', function () { T.tip = L[1][1] + ': ' + L[1][2]; T.min = false; render(); });
      map.appendChild(bt);
    });
  }
  window.tutorMapRects = function () { return Array.prototype.map.call(map.querySelectorAll('.hlab'), function (b) { var r = b.getBoundingClientRect(); return { t: b.textContent, x: r.left, y: r.top, w: r.width, h: r.height }; }); };

  // pulse ring on the lesson's target, and auto-tick lessons whose action happened
  setInterval(function () {
    if (!T.open || !G) { ring.style.display = 'none'; return; }
    if (T.map && !T.min) {   // the HUD settles after the board opens: re-lay the map only when a target moved
      var sig = HUD.map(function (H) { var b = vis(document.querySelector(H[0])); return b ? [b.left, b.top, b.width, b.height].map(Math.round).join(',') : '-'; }).join('|') + innerWidth + 'x' + innerHeight;
      if (sig !== T.sig) { T.sig = sig; drawMap(); }
    }
    var changed = false;
    LS.forEach(function (l) { if (!T.done[l.k] && l.done && l.done()) { T.done[l.k] = 1; changed = true; } });
    if (changed && T.done[cur().k] && T.i < LS.length - 1) { advance(); return; }
    if (changed) render();
    var L = cur(), el = !T.min && L.tg && !UI.busy ? document.querySelector(L.tg) : null, b = vis(el);
    if (!b) { ring.style.display = 'none'; return; }
    var pad = 6; ring.style.display = 'block'; ring.style.left = (b.left - pad) + 'px'; ring.style.top = (b.top - pad) + 'px'; ring.style.width = (b.width + pad * 2) + 'px'; ring.style.height = (b.height + pad * 2) + 'px';
  }, 250);
  addEventListener('resize', function () { if (T.open) render(); });
  window.openTutor = openTutor;
})();
