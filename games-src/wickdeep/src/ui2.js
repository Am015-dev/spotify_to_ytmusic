
// Wickdeep page, part 2: card text, the dock (pick cards, play halves, answer questions), event playback, sound.
var ELC = { fire: '#ff7a2a', ice: '#8fd8ff', air: '#cfe6d0', earth: '#9bc46a', light: '#ffe27a', dark: '#a98cff' };
var ELL = { fire: 'F', ice: 'I', air: 'W', earth: 'E', light: 'L', dark: 'D' };
function bonusText(b) {
  var m;
  if ((m = /^\+(\d+)$/.exec(b))) return '+' + m[1];
  if ((m = /^\+(\d+)r$/.exec(b))) return '+' + m[1] + ' range';
  if ((m = /^\+(\d+)t$/.exec(b))) return '+' + m[1] + ' foe';
  if ((m = /^xp(\d+)$/.exec(b))) return '+' + m[1] + ' XP';
  if ((m = /^h(\d+)$/.exec(b))) return 'heal ' + m[1];
  if ((m = /^push(\d+)$/.exec(b))) return 'push ' + m[1];
  return D.COND_NAME[b] || b;
}
function condWords(list) { return (list || []).map(function (c) { return D.COND_NAME[c]; }).join(', '); }
// one action -> {txt, tag}
function actText(a, mon) {
  var v = a.v, sgn = function (x) { return mon && a.rel ? (x >= 0 ? '+' + x : '' + x) : x; }, use = a.use ? ' (' + D.EL_NAME[a.use.e] + ': ' + bonusText(a.use.b) + ')' : '';
  switch (a.t) {
    case 'move': return { txt: (a.jump ? 'Jump ' : 'Move ') + sgn(v) };
    case 'atk': {
      var s = 'Hit ' + sgn(v);
      if (a.r) s += ' · range ' + (a.rrel && a.r > 0 ? '+' : '') + a.r;
      if (a.tg > 1) s += ' · ' + a.tg + ' foes';
      if (a.all) s += ' · all next to you';
      if (a.splash) s += ' · + its neighbours';
      if (a.pierce) s += ' · pierce ' + a.pierce;
      if (a.push) s += ' · push ' + a.push; if (a.pull) s += ' · pull ' + a.pull;
      if (a.cond) s += ' · ' + condWords(a.cond);
      return { txt: s + use };
    }
    case 'heal': return { txt: 'Heal ' + v + (a.all ? ' · all in range ' + a.r : a.r ? ' · range ' + a.r : mon ? '' : ' yourself') + use };
    case 'shield': return { txt: 'Shield ' + v + (a.r ? ' · friends in ' + a.r : '') };
    case 'retal': return { txt: 'Hit back ' + v };
    case 'loot': return { txt: 'Loot ' + (v <= 1 ? 'next to you' : 'range ' + v) };
    case 'infuse': return { tag: '+' + D.EL_NAME[a.e], el: a.e };
    case 'xp': return { tag: '★' + v, xp: 1 };
    case 'lost': return { tag: 'LOST', lost: 1 };
    case 'summon': return { txt: 'Call ' + (D.SUMMON[a.id] ? D.SUMMON[a.id].n : D.MON[a.id] ? D.MON[a.id].n : a.id) };
    case 'selfc': return { txt: a.c === 'inv' ? 'Hide (foes lose you)' : a.c === 'str' ? 'Get Strong' : D.COND_NAME[a.c] };
    case 'pers': return { txt: { atk: 'Next ' + a.n + ' hits +' + v, shd: 'Shield ' + v + ' for ' + a.n + ' hits', ret: 'Hit back ' + v + ', ' + a.n + ' times', mov: 'Next ' + a.n + ' moves +' + v }[a.k] };
    case 'recover': return { txt: 'Take back ' + v + ' played card' };
    case 'blessall': return { txt: 'Bless the party' };
    case 'special': return { txt: 'Special ' + v };
  }
  return { txt: '?' };
}
function halfHTML(text, mon) {
  var lines = [], tags = '';
  E.parse(text).forEach(function (a) { var t = actText(a, mon); if (t.txt) lines.push('<span class="ln">' + esc(t.txt) + '</span>'); if (t.tag) tags += '<span class="tag ' + (t.lost ? 'lost' : t.xp ? 'xp' : 'el') + '"' + (t.el ? ' style="color:' + ELC[t.el] + '"' : '') + '>' + esc(t.tag) + '</span>'; });
  return lines.join('') + (tags ? '<span class="ln">' + tags + '</span>' : '');
}
function halfWords(text) { return E.parse(text).map(function (a) { var t = actText(a); return t.txt || t.tag; }).join(', '); }
function cardEl(id, o) {
  o = o || {};
  var c = D.CARD[id], el = document.createElement(o.play ? 'div' : 'button');
  if (!o.play) el.type = 'button';
  el.className = 'cd' + (o.sel ? ' sel' : '') + (o.play ? ' play' : '') + (o.dim ? ' dis' : '') + (o.lost ? ' lostc' : '');
  el.dataset.c = id;
  el.setAttribute('aria-label', c.n + ', initiative ' + c.i + '. Top: ' + halfWords(c.top) + '. Bottom: ' + halfWords(c.bot));
  var top = '<div class="half top' + (o.play ? ' ' + (o.play.top || 'no') : '') + '" data-h="top"' + (o.play && o.play.top === 'can' ? ' role="button" tabindex="0" aria-label="Play top: ' + esc(halfWords(c.top)) + '"' : '') + '>' + halfHTML(c.top) + '</div>';
  var bot = '<div class="half bot' + (o.play ? ' ' + (o.play.bot || 'no') : '') + '" data-h="bot"' + (o.play && o.play.bot === 'can' ? ' role="button" tabindex="0" aria-label="Play bottom: ' + esc(halfWords(c.bot)) + '"' : '') + '>' + halfHTML(c.bot) + '</div>';
  el.innerHTML = '<span class="in">' + c.i + '</span><span class="lv">' + (c.lvl === '1' ? '' : 'L' + c.lvl) + '</span><div class="nm">' + esc(c.n) + '</div>' + top + bot + (o.ord ? '<span class="ord1">' + o.ord + '</span>' : '');
  if (o.basic) { var b = document.createElement('div'); b.className = 'basic'; b.innerHTML = '<button type="button" data-b="top" class="' + (o.basic.top ? 'can' : '') + '"' + (o.basic.top ? '' : ' disabled') + '>Hit 2</button><button type="button" data-b="bot" class="' + (o.basic.bot ? 'can' : '') + '"' + (o.basic.bot ? '' : ' disabled') + '>Move 2</button>'; el.appendChild(b); }
  return el;
}

// ---------- top bar, order strip, goal chip ----------
var EL_SVG = { fire: '<path d="M12 3c2 4 6 6 6 11a6 6 0 0 1-12 0c0-3 2-5 3-7 0 2 1 3 2 3 0-3 0-5 1-7z"/>', ice: '<path d="M12 2v20M3 7l18 10M21 7L3 17"/>', air: '<path d="M3 9h11a3 3 0 1 0-3-3M3 15h15a3 3 0 1 1-3 3"/>',
  earth: '<path d="M3 20l6-10 4 6 3-4 5 8z"/>', light: '<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/>', dark: '<path d="M15 3a9 9 0 1 0 6 13A7 7 0 0 1 15 3z"/>' };
function renderBar() {
  var sc = D.SCEN[G.sc];
  $('sctitle').textContent = 'Round';
  $('roundc').textContent = G.round;
  $('els').innerHTML = E.EL.map(function (e) { var s = G.el[e]; return '<button type="button" class="el s' + s + '" style="color:' + ELC[e] + '" data-el="' + e + '" aria-label="' + D.EL_NAME[e] + (s === 2 ? ' strong' : s === 1 ? ' fading' : ' off') + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4">' + EL_SVG[e] + '</svg></button>'; }).join('');
}
function renderOrder() {
  var o = $('order'); o.innerHTML = '';
  var list = G.phase === 'turns' || G.phase === 'endround' ? G.order : E.liveHeroes(G).map(function (f) { return { id: f.id, init: G.sel[f.id] ? (f.lrest ? 99 : '✓') : '?' }; });
  list.forEach(function (x, i) {
    var d = document.createElement('div'), f = x.id ? E.fig(G, x.id) : null;
    d.className = 'ord' + (x.mt ? ' mon' : '') + (G.phase === 'turns' && i === G.ti ? ' now' : '') + (G.phase === 'turns' && i < G.ti ? ' done' : '');
    var tile = x.mt ? (D.MON[x.mt] ? D.MON[x.mt].tile : D.BOSS[x.mt].tile) : figTile(f);
    d.appendChild(tileCanvas(tile, x.mt && D.BOSS[x.mt] ? 'rgba(160,30,20,.25)' : ''));
    var b = document.createElement('b'); b.textContent = x.init; d.appendChild(b);
    o.appendChild(d);
  });
}
function goalLine() {
  var sc = D.SCEN[G.sc], g = sc.goal;
  if (g.t === 'survive') return 'Hold ' + Math.min(G.round, g.n) + '/' + g.n;
  if (g.t === 'loot') return 'Chests ' + (G.treasure || 0) + '/' + g.n;
  if (g.t === 'objs') return 'Altars ' + (G.objKilled || 0) + '/' + g.n;
  if (g.t === 'boss') return 'Kill the boss';
  if (g.t === 'escape') return 'All to EXIT';
  if (g.t === 'reach') return 'Reach EXIT';
  return 'Kill all';
}
function renderGoal() { $('goalchip').textContent = goalLine(); }

// ---------- glows for the current question ----------
function computeGlow() {
  UI.glow = {}; UI.tglow = {}; UI.preview = null;
  if (!G || !G.ask || UI.busy) return;
  var A = G.ask, f = curFig();
  if (A.h === 'move' || A.h === 'summon') A.hexes.forEach(function (k) { UI.glow[k] = 'mv'; });
  if (A.h === 'target') A.ids.forEach(function (id) { var t = E.fig(G, id); UI.glow[t.pos] = 'atk'; UI.tglow[id] = previewHit(f, t, A.a); });
  if (A.h === 'heal') A.ids.forEach(function (id) { var t = E.fig(G, id); UI.glow[t.pos] = 'heal'; });
  if ((A.h === 'first' || A.h === 'second') && UI.pick) {
    var c = D.CARD[UI.pick.c], text = UI.pick.basic ? (UI.pick.h === 'top' ? 'a2' : 'm2') : c[UI.pick.h];
    var acts = E.parse(text), mv = acts.filter(function (a) { return a.t === 'move'; })[0], at = acts.filter(function (a) { return a.t === 'atk'; })[0];
    if (mv && f && !f.cond.imm) { var R = E.reach(G, f, mv.v, { jump: mv.jump, hero: 1 }); Object.keys(R).forEach(function (k) { if (k !== f.pos && !E.figAt(G, k) && G.hex[k].t !== 'o') UI.glow[k] = 'mv'; }); }
    else if (at && f) E.attackTargets(G, f, at).forEach(function (t) { UI.glow[t.pos] = 'atk'; });
  }
}
function previewHit(f, t, a) {
  var base = a.v + (t.cond.poi ? 1 : 0), sh = Math.max(0, E.shieldOf(G, t) - (a.pierce || 0)), d = Math.max(0, base - sh);
  return { txt: d >= t.hp ? 'KO?' : '−' + d, kill: d >= t.hp };
}

// ---------- the dock ----------
function setPrompt(text, btns) {
  var tip = UI.tut ? coachLine() : '';
  $('prompt').textContent = tip || text;
  var pb = $('pbtns'); pb.innerHTML = '';
  (btns || []).forEach(function (b) { var x = document.createElement('button'); x.type = 'button'; x.className = 'btn' + (b.cls ? ' ' + b.cls : ''); x.textContent = b.t; if (b.id) x.id = b.id; if (b.dis) x.disabled = true; x.addEventListener('click', b.fn); pb.appendChild(x); });
}
function renderDock() {
  var tray = $('tray'); tray.innerHTML = '';
  if (!G) return;
  if (UI.tut && !UI.busy && !G.done && !UI.insp && G.ask && typeof nextLesson === 'function') { var ls = nextLesson(); if (ls) { UI.seen[ls.k] = 1; UI.insp = { t: ls.t, h: ls.h, lesson: 1 }; } }
  var lg = $('legend'); if (lg) { var showLg = !UI.legendOff && G.round <= 1 && G.ask && (G.ask.h === 'sel' || G.ask.h === 'first') && !UI.insp; lg.hidden = !showLg; }
  if (UI.insp && !UI.busy && !G.done) { setPrompt(UI.insp.t, [{ t: UI.insp.lesson ? 'Got it' : 'Close', cls: UI.insp.lesson ? 'go' : '', id: 'inspx', fn: closeInsp }]); var d = document.createElement('div'); d.className = 'inspd'; d.innerHTML = UI.insp.h; tray.appendChild(d); return; }
  if (G.done) { setPrompt(G.done.won ? 'Victory!' : 'Defeat', [{ t: 'Continue', cls: 'go', fn: showResult }]); return; }
  var A = G.ask; if (!A || UI.busy) { setPrompt(UI.busy ? '' : '…', []); return; }
  var f = curFig(), H = f ? D.HERO[f.cls] : null;
  switch (A.h) {
    case 'sel': return dockSelect();
    case 'first': case 'second': return dockPlay(f);
    case 'stunned': setPrompt(H.n + ' is stunned', [{ t: 'OK', cls: 'go', fn: function () { doMove({ t: 'ok' }); } }]); return;
    case 'move': setPrompt(H.n + ': move up to ' + A.v, [{ t: 'Skip', fn: function () { doMove({ t: 'skip' }); } }]); itemsCol(f); return;
    case 'target': setPrompt(H.n + ': tap a red foe' + (A.left > 1 ? ' (' + A.left + ')' : ''), [{ t: 'Skip', fn: function () { doMove({ t: 'skip' }); } }]); itemsCol(f); return;
    case 'heal': setPrompt('Heal ' + A.a.v + ': tap a friend', [{ t: 'Skip', fn: function () { doMove({ t: 'skip' }); } }]); return;
    case 'summon': setPrompt('Place your ' + D.SUMMON[A.sid].n, [{ t: 'Skip', fn: function () { doMove({ t: 'skip' }); } }]); return;
    case 'recover': setPrompt('Take one card back', [{ t: 'Skip', fn: function () { doMove({ t: 'skip' }); } }]); A.cs.forEach(function (c) { var el = cardEl(c); el.addEventListener('click', function () { doMove({ t: 'card', c: c }); }); tray.appendChild(el); }); return;
    case 'lrest': setPrompt(H.n + ' rests: lose one card', []); f.disc.forEach(function (c) { var el = cardEl(c); el.addEventListener('click', function () { doMove({ t: 'lose', c: c }); }); tray.appendChild(el); }); return;
    case 'srest': {
      if (!A.must && f.hand.length >= 4 && !UI.tut) { setTimeout(function () { if (G && G.ask === A) doMove({ t: 'nosrest' }); }, 0); setPrompt('', []); return; }
      setPrompt(H.n + ': short rest?', [{ t: 'Rest', cls: 'go', fn: function () { doMove({ t: 'srest' }); } }].concat(A.must ? [] : [{ t: 'No', fn: function () { doMove({ t: 'nosrest' }); } }]));
      tray.appendChild(infoP('Lose 1 random played card. Get the other ' + (f.disc.length - 1) + ' back.')); return;
    }
    case 'srest2': {
      var vm = E.validMoves(G);
      setPrompt('Lose this card?', [{ t: 'OK', cls: 'go', fn: function () { doMove({ t: 'srest' }); } }].concat(vm.some(function (m) { return m.t === 'srest-redo'; }) ? [{ t: 'Swap (−1 HP)', fn: function () { doMove({ t: 'srest-redo' }); } }] : []));
      tray.appendChild(cardEl(A.pick, { lost: true })); return;
    }
    case 'block': {
      setPrompt(H.n + ': ' + A.n + ' damage knocks you out', [{ t: 'Take it', cls: 'warn', fn: function () { doMove({ t: 'take' }); } }].concat(f.disc.length >= 2 ? [{ t: 'Lose 2 played', fn: function () { doMove({ t: 'block2' }); } }] : []));
      E.validMoves(G).filter(function (m) { return m.t === 'block'; }).forEach(function (m) { var el = cardEl(m.c); el.addEventListener('click', function () { doMove(m); }); tray.appendChild(el); });
      tray.insertBefore(infoP('Lose a card to ignore the hit:'), tray.firstChild); return;
    }
  }
}
function infoP(t) { var p = document.createElement('p'); p.className = 'info'; p.textContent = t; return p; }
function heroTabs() {
  var heroes = E.liveHeroes(G); if (heroes.length < 2) return null;
  var d = document.createElement('div'); d.className = 'htabs side';
  heroes.forEach(function (f, i) {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'itm' + (i === UI.tab ? ' tut' : '') + (G.sel[f.id] ? ' used' : '');
    b.style.borderColor = D.HERO[f.cls].col; b.setAttribute('aria-label', D.HERO[f.cls].n + (G.sel[f.id] ? ' ready' : ''));
    var cv = tileCanvas(D.HERO[f.cls].tile); cv.style.width = cv.style.height = '28px'; b.appendChild(cv);
    b.addEventListener('click', function () { UI.tab = i; renderDock(); });
    d.appendChild(b);
  });
  return d;
}
function dockSelect() {
  var heroes = E.liveHeroes(G);
  if (UI.tab >= heroes.length) UI.tab = 0;
  if (G.sel[heroes[UI.tab].id]) { var nx = heroes.findIndex(function (h) { return !G.sel[h.id]; }); if (nx >= 0) UI.tab = nx; }
  var f = heroes[UI.tab], H = D.HERO[f.cls], picked = UI.sel[f.id] || [], tray = $('tray');
  var canRest = f.disc.length >= 2, canPlay = f.hand.length >= 2;
  var btns = [];
  if (canRest) btns.push({ t: 'Rest', id: 'lrbtn', fn: function () { UI.sel[f.id] = []; doMove({ t: 'lrest', id: f.id }); } });
  if (picked.length < 2 && canPlay) btns.push({ t: 'Hint', id: 'hintbtn', fn: function () { var h = hintSel(f); if (h) { UI.sel[f.id] = h.slice(); toast('Suggested: ' + h.map(function (c) { return D.CARD[c].n; }).join(' + ')); renderDock(); } } });
  btns.push({ t: 'Ready', cls: 'go', id: 'readybtn', dis: picked.length !== 2, fn: function () { var p = UI.sel[f.id]; UI.sel[f.id] = []; doMove({ t: 'sel', id: f.id, cards: p.slice() }); } });
  setPrompt(!canPlay ? H.n + ': must rest' : picked.length === 2 ? H.n + ': ready?' : H.n + ': pick ' + (2 - picked.length) + ' card' + (picked.length ? '' : 's'), btns);
  var tabs = heroTabs(); if (tabs) tray.appendChild(tabs);
  f.hand.forEach(function (c) {
    var i = picked.indexOf(c), el = cardEl(c, { sel: i >= 0, ord: i >= 0 ? i + 1 : 0 });
    el.addEventListener('click', function () {
      var p = UI.sel[f.id] = (UI.sel[f.id] || []).slice(), j = p.indexOf(c);
      if (j >= 0) p.splice(j, 1); else { if (p.length >= 2) p.shift(); p.push(c); }
      sfx('tick'); renderDock();
    });
    tray.appendChild(el);
  });
  // hand / played / lost counts
  var st = document.createElement('div'); st.className = 'side';
  st.innerHTML = '<span class="chip">HP ' + f.hp + '/' + f.max + '</span><span class="chip">Played ' + f.disc.length + '</span><span class="chip">Lost ' + f.lost.length + '</span>';
  tray.appendChild(st);
}
// the helper's pick for one hero (same evaluation the test games use)
function hintSel(f) {
  var save = G.sel, m; G.sel = {}; Object.keys(save).forEach(function (k) { G.sel[k] = save[k]; });
  E.liveHeroes(G).forEach(function (h) { if (h.id !== f.id) G.sel[h.id] = 1; });
  try { m = AI.choose(G); } catch (e) { m = null; }
  G.sel = save;
  return m && m.t === 'sel' ? m.cards : null;
}
function dockPlay(f) {
  var A = G.ask, tray = $('tray'), H = D.HERO[f.cls], opts = E.validMoves(G).filter(function (m) { return m.t === 'half'; });
  var can = function (c, h, basic) { return opts.some(function (m) { return m.c === c && m.h === h && !!m.basic === !!basic; }); };
  var pk = UI.pick;
  var txt = A.h === 'first' ? H.n + ': tap a top or bottom' : H.n + ': tap the other half';
  var btns = [];
  if (!pk) btns.push({ t: 'Hint', id: 'hintbtn', fn: function () { var m = AI.choose(G); if (m && m.t === 'half') { UI.pick = { c: m.c, h: m.h, basic: m.basic }; refresh(); } } });
  if (pk) btns.push({ t: 'Play', cls: 'go', id: 'playbtn', fn: function () { var m = { t: 'half', c: pk.c, h: pk.h }; if (pk.basic) m.basic = 1; UI.pick = null; doMove(m); } });
  setPrompt(pk ? (pk.basic ? (pk.h === 'top' ? 'Hit 2' : 'Move 2') : halfWords(D.CARD[pk.c][pk.h])) : txt, btns);
  f.sel.forEach(function (c) {
    var used = G.act.used.indexOf(c) >= 0; if (used) return;
    var st = function (h) { return can(c, h) ? 'can' + (pk && pk.c === c && pk.h === h && !pk.basic ? ' pick' : '') : 'no'; };
    var el = cardEl(c, { play: { top: st('top'), bot: st('bot') }, basic: { top: can(c, 'top', 1), bot: can(c, 'bot', 1) } });
    el.querySelectorAll('.half.can').forEach(function (hd) { hd.addEventListener('click', function () { UI.pick = null; sfx('tick'); doMove({ t: 'half', c: c, h: hd.dataset.h }); }); });
    el.querySelectorAll('.basic button.can').forEach(function (bb) { bb.addEventListener('click', function () { UI.pick = null; doMove({ t: 'half', c: c, h: bb.dataset.b, basic: 1 }); }); });
    tray.appendChild(el);
  });
  itemsCol(f);
}
function itemsCol(f) {
  var im = E.validMoves(G).filter(function (m) { return m.t === 'item'; }); if (!im.length) return;
  var col = document.createElement('div'); col.className = 'side';
  im.forEach(function (m) { var it = D.ITEM_BY[f.items[m.i].id], b = document.createElement('button'); b.type = 'button'; b.className = 'itm'; b.textContent = it.n.split(' ').slice(-1)[0]; b.title = it.n + ': ' + it.text; b.setAttribute('aria-label', 'Use ' + it.n + ': ' + it.text); b.addEventListener('click', function () { doMove(m); toast(it.n + ': ' + it.text); }); col.appendChild(b); });
  $('tray').appendChild(col);
}

// ---------- board taps ----------
function onBoardTap(k) {
  if (!G) return;
  if (UI.busy) { UI.fast = true; return; }
  var A = G.ask;
  if (A && (A.h === 'move' || A.h === 'summon') && A.hexes.indexOf(k) >= 0) return doMove({ t: 'hex', k: k });
  var f = E.figAt(G, k);
  if (A && A.h === 'target' && f && A.ids.indexOf(f.id) >= 0) return doMove({ t: 'tgt', id: f.id });
  if (A && A.h === 'heal' && f && A.ids.indexOf(f.id) >= 0) return doMove({ t: 'tgt', id: f.id });
  if (f) return showFig(f);
  var h = G.hex[k]; if (h && E.seen(G, k)) showHex(k);
}
function showInsp(title, html) {
  if (G && UI.mode === 'play' && !UI.busy) { UI.insp = { t: title, h: html }; renderDock(); return; }
  var p = $('insp'); p.innerHTML = '<button class="x" type="button" aria-label="Close">×</button><h3>' + esc(title) + '</h3>' + html; p.hidden = false;
  p.querySelector('.x').addEventListener('click', closeInsp);
}
function closeInsp() { $('insp').hidden = true; if (UI.insp) { UI.insp = null; renderDock(); } }
function showFig(f) {
  var conds = Object.keys(f.cond).map(function (c) { return D.COND_NAME[c] + ': ' + D.COND_TIP[c]; });
  if (f.kind === 'hero') {
    showInsp(D.HERO[f.cls].n, '<p>HP ' + f.hp + '/' + f.max + ' · Hand ' + f.hand.length + ' · Played ' + f.disc.length + ' · Lost ' + f.lost.length + '</p>' + (conds.length ? '<p>' + conds.map(esc).join('<br>') + '</p>' : '') + (f.goal ? '<p>Secret goal: ' + esc(D.GOAL_BY[f.goal].text) + '</p>' : '') + '<p>' + esc(D.HERO[f.cls].role) + '</p>');
    return;
  }
  var st = f.kind === 'mon' ? D.monStats(f.type, G.L, f.elite) : null, info = E.monInfo(G, f), lines = [];
  lines.push('HP ' + f.hp + '/' + f.max + ' · Move ' + info.mv + ' · Hit ' + info.atk + (info.rng ? ' · Range ' + info.rng : ''));
  var sh = E.shieldOf(G, f); if (sh) lines.push('Shield ' + sh);
  if (st && st.ret) lines.push('Hits back ' + st.ret);
  if (info.fly) lines.push('Flies');
  if (st && st.poi) lines.push('Bites poison');
  if (f.kind === 'boss') { lines.push('Immune: ' + D.BOSS[f.type].imm.map(function (c) { return D.COND_NAME[c]; }).join(', ')); D.BOSS[f.type].sp.forEach(function (s, i) { lines.push('Special ' + (i + 1) + ': ' + s.text); }); }
  var md = G.md[f.type]; if (md && md.cur != null) { var mc = D.MDECK[md.fam][md.cur]; lines.push('This round (' + mc.i + '): ' + monCardText(f.type, mc)); }
  var tip = f.kind === 'mon' ? D.MON[f.type].tip : f.kind === 'boss' ? D.BOSS[f.type].tip : f.kind === 'obj' ? 'Smash it to win.' : 'Your ally.';
  showInsp(figName(f), lines.map(function (l) { return '<p>' + esc(l) + '</p>'; }).join('') + (conds.length ? '<p>' + conds.map(esc).join('<br>') + '</p>' : '') + '<p style="color:var(--dim)">' + esc(tip) + '</p>');
}
function showHex(k) {
  var h = G.hex[k], t = { trap: 'Trap: ' + D.trapDmg(G.L) + ' damage, then gone.', haz: 'Brine: ' + Math.floor(D.trapDmg(G.L) / 2) + ' damage each time you enter.', diff: 'Rubble: costs 2 moves.', o: 'Blocks movement. You can see past it.', door: h.open ? 'An open door.' : 'Step in to open it.', f: 'Stone floor.' }[h.t] || '';
  if (h.tr) t += ' A treasure chest: step on it or loot it.'; if (h.coin) t += ' ' + h.coin + ' coin here.'; if (h.ex) t += ' The exit.';
  showInsp('Hex', '<p>' + esc(t) + '</p>');
}
// monster card words with this level's real numbers
function monCardText(type, mc) {
  var isBoss = !!D.BOSS[type];
  var n = isBoss ? { mv: D.BOSS[type].mv, atk: D.bossAtk(type, G.L), rng: D.BOSS[type].rng || 0 } : D.monStats(type, G.L, false);
  var el = isBoss ? null : D.monStats(type, G.L, true);
  return E.parse(mc.a).map(function (a) {
    if (a.t === 'move') return 'Move ' + Math.max(0, n.mv + a.v);
    if (a.t === 'atk') { var r = (a.r != null && !a.rrel) ? a.r : (n.rng ? n.rng + (a.r || 0) : 0); return 'Hit ' + (n.atk + a.v) + (el ? ' (elite ' + (el.atk + a.v) + ')' : '') + (r ? ' · range ' + r : '') + (a.tg > 1 ? ' · ' + a.tg + ' foes' : '') + (a.all ? ' · all next to it' : '') + (a.push ? ' · push ' + a.push : '') + (a.cond ? ' · ' + condWords(a.cond) : '') + (a.use ? ' (' + D.EL_NAME[a.use.e] + ': ' + bonusText(a.use.b) + ')' : ''); }
    if (a.t === 'special') return D.BOSS[type].sp[a.v - 1].text;
    var t = actText(a, true); return t.txt || t.tag;
  }).join(' · ');
}

// ---------- moves and playback ----------
function snapView() {
  var m = {}; G.figs.forEach(function (f) { if (f.pos) m[f.id] = { id: f.id, kind: f.kind, team: f.team, cls: f.cls, type: f.type, elite: f.elite, num: f.num, hp: f.hp, max: f.max, pos: f.pos, cond: Object.assign({}, f.cond), rnd: Object.assign({}, f.rnd), name: f.name }; });
  return { m: m, list: function () { var self = this; return Object.keys(self.m).map(function (k) { return self.m[k]; }); } };
}
function doMove(mv) {
  if (UI.busy || !G || G.done) return;
  closeInsp();
  var legal = E.validMoves(G).some(function (x) { return JSON.stringify(x) === JSON.stringify(mv); });
  if (!legal) { toast('Not now'); return; }
  UI.view = snapView(); UI.pick = null;
  try { E.apply(G, mv); } catch (e) { console.error(e); toast('Oops: ' + e.message); UI.view = null; refresh(); return; }
  var evs = G.ev.splice(0);
  if (mv.t === 'sel' || mv.t === 'lrest') { var hs = E.liveHeroes(G), nx = hs.findIndex(function (h) { return !G.sel[h.id]; }); if (nx >= 0) UI.tab = nx; }
  save();
  play(evs);
}
async function play(evs) {
  UI.busy = true; UI.fast = false; refresh();
  for (var i = 0; i < evs.length; i++) { try { await playEv(evs[i]); } catch (e) { console.error(e); } }
  UI.busy = false; UI.view = null; UI.actId = null; $('modc').hidden = true;
  if (CAM.fit) fitCam();
  refresh();
  if (G.done) setTimeout(showResult, speed(700));
  else if (G.ask && G.ask.h === 'sel' && evs.some(function (e) { return e.e === 'round'; })) toast('Round ' + G.round + ': pick cards');
}
function vf(id) { return UI.view && UI.view.m[id]; }
function float(id, text, cls) {
  var v = vf(id), f = v || E.fig(G, id), pos = (v && v.pos) || (f && f.pos); if (!pos) return;
  var s = toScreen(pos), d = document.createElement('div'); d.className = 'fl ' + (cls || 'info'); d.textContent = text; d.style.left = s.x + 'px'; d.style.top = (s.y - CAM.z * 0.6) + 'px';
  $('floats').appendChild(d); setTimeout(function () { d.remove(); }, 950);
}
function modHTML(v) { var cls = v === 'x2' ? 'crit' : v === 'null' ? 'miss' : v > 0 ? 'good' : v < 0 ? 'bad' : ''; var t = v === 'x2' ? '×2' : v === 'null' ? 'MISS' : (v > 0 ? '+' + v : '' + v); return { cls: cls, t: t }; }
function logLine(t) { UI.log = UI.log || []; UI.log.push(t); if (UI.log.length > 300) UI.log.shift(); }
async function playEv(e) {
  var v, f;
  switch (e.e) {
    case 'round': renderOrder(); renderBar(); logLine('— Round ' + e.n + ' —'); return;
    case 'turn': UI.actId = e.id; renderOrder(); f = E.fig(G, e.id); if (f && f.pos && !CAM.fit) follow(f.pos); draw(); logLine(figName(f) + "'s turn"); return sleep(speed(160));
    case 'mturn': {
      UI.actId = null; renderOrder();
      var md = G.md[e.type], mc = D.MDECK[md.fam][e.card], name = D.MON[e.type] ? D.MON[e.type].n : D.BOSS[e.type].n;
      var tray = $('tray'); tray.innerHTML = ''; setPrompt(name + ' acts', []);
      var box = document.createElement('div'); box.className = 'mcardv';
      box.appendChild(tileCanvas(D.MON[e.type] ? D.MON[e.type].tile : D.BOSS[e.type].tile, D.BOSS[e.type] ? 'rgba(160,30,20,.25)' : ''));
      var tx = document.createElement('div'); tx.innerHTML = '<div class="t">' + esc(name) + ' · ' + mc.i + '</div><div class="a">' + esc(monCardText(e.type, mc)) + '</div>'; box.appendChild(tx); tray.appendChild(box);
      logLine(name + ': ' + monCardText(e.type, mc));
      sfx('card'); return sleep(speed(850));
    }
    case 'half': { f = E.fig(G, e.id); logLine(figName(f) + ' plays ' + (e.basic ? (e.h === 'top' ? 'Hit 2' : 'Move 2') : D.CARD[e.c].n + ' (' + (e.h === 'top' ? 'top' : 'bottom') + ')')); return; }
    case 'move': {
      v = vf(e.id); if (!v) return;
      for (var i = 1; i < e.path.length; i++) {
        var a = toScreen(e.path[i - 1]), b = toScreen(e.path[i]), steps = UI.fast || !ANIM ? 1 : 5;
        for (var s = 1; s <= steps; s++) { v.dxy = { x: a.x + (b.x - a.x) * s / steps, y: a.y + (b.y - a.y) * s / steps }; draw(); await sleep(speed(e.jump ? 16 : 22)); }
        v.pos = e.path[i]; v.dxy = null; sfx('step');
      }
      draw(); return;
    }
    case 'door': sfx('door'); toast('A door opens'); if (CAM.fit) fitCam(); draw(); logLine('A door opens.'); return sleep(speed(350));
    case 'reveal': return;
    case 'spawn': case 'summon': if (UI.view && e.f) { UI.view.m[e.id] = Object.assign({}, e.f, { cond: {}, rnd: {} }); } draw(); return sleep(speed(e.e === 'summon' ? 300 : 60));
    case 'atk': {
      var at = vf(e.a) || E.fig(G, e.a), tg = vf(e.t) || E.fig(G, e.t); if (!at || !tg) return;
      var mc = $('modc'); mc.innerHTML = ''; mc.hidden = false;
      var cards = [e.mod].concat(e.other ? [e.other] : []);
      cards.forEach(function (set, si) { set.forEach(function (x) { var mm = modHTML(x), d = document.createElement('div'); d.className = 'mod ' + mm.cls + (si === 1 ? ' off' : ''); d.innerHTML = mm.t + '<small>' + (si === 0 ? (e.adv ? 'best' : e.dis ? 'worst' : '') : 'other') + '</small>'; mc.appendChild(d); }); });
      var lab = document.createElement('div'); lab.className = 'modlab'; var mv0 = cards[0].map(function (x) { return modHTML(x).t; }).join(' ');
      lab.textContent = e.nul ? 'Miss!' : (e.x2 ? 'Hit ' + e.base + ' ×2' : 'Hit ' + e.base + ' ' + mv0) + (e.sh ? ' − shield ' + e.sh : '') + ' = ' + e.dmg; mc.appendChild(lab);
      sfx(e.x2 ? 'crit' : e.nul ? 'miss' : 'hit');
      var ts = toScreen(tg.pos), as = toScreen(at.pos), ranged = E.dist(at.pos, tg.pos) > 1;
      FX.play(ranged ? 'impact' : 'slash', ts.x, ts.y, ranged ? { angle: Math.atan2(ts.y - as.y, ts.x - as.x) } : { facing: ts.x >= as.x ? 1 : -1 });
      logLine(figName(at) + ' hits ' + figName(tg) + ': ' + e.base + ' ' + cards[0].map(function (x) { return modHTML(x).t; }).join(' ') + ' → ' + (e.nul ? 'miss' : e.dmg));
      await sleep(speed(e.x2 || e.nul ? 900 : 700));
      return;
    }
    case 'dmg': v = vf(e.id); if (v) v.hp = e.hp; float(e.id, '−' + e.n, 'dmg'); if (v) { v.flash = 1; draw(); await sleep(speed(90)); v.flash = 0; } draw(); try { GX.buzz && GX.buzz(20); } catch (x) { } return sleep(speed(150));
    case 'heal': v = vf(e.id); if (v) v.hp = Math.min(v.max, v.hp + e.n); if (e.n > 0) { float(e.id, '+' + e.n, 'heal'); var hp = toScreen((v || E.fig(G, e.id) || {}).pos || '0,0'); FX.play('heal', hp.x, hp.y + CAM.z * 0.5, { count: 8 }); sfx('heal'); } draw(); return sleep(speed(e.n > 0 ? 300 : 0));
    case 'cure': float(e.id, 'Cured', 'heal'); v = vf(e.id); if (v) { delete v.cond.poi; delete v.cond.wnd; } return;
    case 'die': v = vf(e.id); float(e.id, '✝', 'info'); sfx('die'); if (UI.view) delete UI.view.m[e.id]; draw(); logLine(figName(v || { kind: e.kind, type: e.type }) + ' is defeated.'); return sleep(speed(250));
    case 'exh': if (UI.view) delete UI.view.m[e.id]; f = E.fig(G, e.id); toast(figName(f) + ' is out!'); logLine(figName(f) + ' is exhausted.'); sfx('die'); draw(); return sleep(speed(600));
    case 'cond': v = vf(e.id); if (v) v.cond[e.c] = 1; float(e.id, D.COND_NAME[e.c], 'info'); draw(); return sleep(speed(120));
    case 'immune': float(e.id, 'Immune', 'info'); return;
    case 'shield': v = vf(e.id); if (v) v.rnd.shd = (v.rnd.shd || 0) + e.v; float(e.id, 'Shield ' + e.v, 'info'); f = v || E.fig(G, e.id); if (f && f.pos) { var sp = toScreen(f.pos); FX.play('shield', sp.x, sp.y, {}); } draw(); return sleep(speed(200));
    case 'retal': v = vf(e.id); if (v) v.rnd.ret = (v.rnd.ret || 0) + e.v; float(e.id, 'Hit back ' + e.v, 'info'); return sleep(speed(150));
    case 'retal-hit': float(e.a, 'Hits back!', 'info'); return sleep(speed(200));
    case 'infuse': case 'consume': renderBar(); if (e.e === 'consume') toast(D.EL_NAME[e.el] + ' used'); return sleep(speed(120));
    case 'coin': float(e.id, '+' + e.n + ' coin', 'info'); sfx('coin'); return sleep(speed(150));
    case 'treasure': float(e.id, e.t.item ? D.ITEM_BY[e.t.item].n : '+' + (e.t.gold || 0) + ' gold', 'info'); sfx('coin'); toast('Treasure!'); return sleep(speed(500));
    case 'trap': case 'haz': float(e.id, (e.e === 'trap' ? 'Trap ' : 'Brine ') + '−' + e.v, 'dmg'); sfx('hit'); return sleep(speed(200));
    case 'wound': float(e.id, 'Wound', 'dmg'); return sleep(speed(150));
    case 'block': float(e.id, 'Blocked', 'info'); logLine(figName(E.fig(G, e.id)) + ' loses ' + e.cards.map(function (c) { return D.CARD[c].n; }).join(' + ') + ' to ignore ' + e.n + '.'); return sleep(speed(300));
    case 'lrest': toast(figName(E.fig(G, e.id)) + ' long rests'); logLine(figName(E.fig(G, e.id)) + ' rests, loses ' + (e.lost ? D.CARD[e.lost].n : 'nothing') + '.'); return sleep(speed(300));
    case 'srest': logLine(figName(E.fig(G, e.id)) + ' short rests, loses ' + D.CARD[e.lost].n + '.'); return;
    case 'xp': float(e.id, '+' + e.n + '★', 'info'); return sleep(speed(80));
    case 'stunned': float(e.id, 'Stunned', 'info'); return sleep(speed(250));
    case 'special': toast(e.text); logLine(figName(E.fig(G, e.id)) + ': ' + e.text); return sleep(speed(600));
    case 'pers': float(e.id, 'Lasting bonus', 'info'); return;
    case 'item': float(e.id, D.ITEM_BY[e.item].n, 'info'); return sleep(speed(150));
    case 'endround': renderBar(); return;
    case 'noop': float(e.id, e.why, 'info'); toast(e.why); return sleep(speed(700));
    case 'over': return;
  }
}
function refresh() { computeGlow(); renderBar(); renderOrder(); renderGoal(); renderDock(); draw(); }
function toast(t) { var el = $('toast'); el.textContent = t; el.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(function () { el.classList.remove('on'); }, 1600); }

// ---------- sound (our own tiny synth) ----------
var AC = null, SOUND = true;
function sfx(n) {
  if (!SOUND) return;
  try {
    var vol = 1; try { var p = GX.pref ? GX.pref() : null; if (p) vol = (p.master == null ? 1 : p.master) * (p.sfx == null ? 1 : p.sfx); } catch (x) { }
    if (vol <= 0) return;
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    var t = AC.currentTime, o = AC.createOscillator(), g = AC.createGain(); o.connect(g); g.connect(AC.destination);
    var P = { tick: [660, 0.04, 'square', 0.04], step: [110, 0.05, 'triangle', 0.05], hit: [140, 0.14, 'sawtooth', 0.12], crit: [90, 0.35, 'sawtooth', 0.18], miss: [300, 0.12, 'sine', 0.06], heal: [520, 0.3, 'sine', 0.08], die: [70, 0.4, 'square', 0.1], door: [80, 0.3, 'triangle', 0.12], coin: [990, 0.12, 'square', 0.05], card: [420, 0.08, 'triangle', 0.06], win: [523, 0.8, 'triangle', 0.12] }[n] || [440, 0.1, 'sine', 0.05];
    o.type = P[2]; o.frequency.setValueAtTime(P[0], t); if (n === 'heal' || n === 'win' || n === 'coin') o.frequency.exponentialRampToValueAtTime(P[0] * 1.5, t + P[1]); else o.frequency.exponentialRampToValueAtTime(Math.max(30, P[0] * 0.6), t + P[1]);
    g.gain.setValueAtTime(P[3] * vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + P[1]); o.start(t); o.stop(t + P[1] + 0.02);
  } catch (e) { }
}
