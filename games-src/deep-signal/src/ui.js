/* Deep Signal UI: board-first table. Tap a glowing card to play it, tap anything else to see it large, hold any card to zoom. */
var NAMES = ['You', 'Ines', 'Bram', 'Kito', 'Odile'], SEATCOL = ['#3fd0c9', '#3a8ee0', '#3fb36b', '#f0b429', '#e8577a'];
var POSTXT = { top: '▲ highest', only: '● only', bot: '▼ lowest', '?': '? unknown' };
var TOKTXT = { '1': 'must be done first', '2': 'must be done second', '3': 'must be done third', '4': 'must be done fourth', '5': 'must be done fifth', '>': 'before >> and >>>', '>>': 'after >, before >>>', '>>>': 'after > and >>', '>>>>': 'after all other arrows', 'O': 'must be the very last task' };
var G = null, AIDELAY = 650, ANIM = true;
var UI = { mode: 'quick', level: 'normal', sigMode: false, flareMode: 0, hold: false, sigDone: {}, timer: null, fast: /[?&]fast=1/.test(location.search), lastTricks: 0, players: 4, mission: 1, flareFree: false, ended: false };
if (UI.fast) AIDELAY = 60;
var $ = function (s) { return document.querySelector(s); };
function mk(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
function ls(k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || 'null'); localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } }
function nm(p) { return p === G.dummy ? 'Drone' : NAMES[p]; }
function isHuman(s) { return s === 0; }
// ---------------------------------------------------------------- pictures (code-drawn placeholders; art slots fill them)
var ICON = {
  c: '<svg viewBox="0 0 24 24"><path d="M12 22V12M12 12C9 9 6 10 5 6M12 12c3-3 6-2 7-6M12 15c-2-1-4 0-6-2M12 15c2-1 4 0 6-2" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round"/></svg>',
  k: '<svg viewBox="0 0 24 24"><path d="M12 22C8 16 8 9 12 2c4 7 4 14 0 20zM12 22V6" stroke="#fff" stroke-width="2" fill="rgba(255,255,255,.35)" stroke-linejoin="round"/></svg>',
  t: '<svg viewBox="0 0 24 24"><path d="M2 9c3-3 5 3 8 0s5 3 8 0 3-2 4-1M2 15c3-3 5 3 8 0s5 3 8 0 3-2 4-1" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round"/></svg>',
  a: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" fill="#2b1a00"/><path d="M12 1v4M12 19v4M1 12h4M19 12h4M4 4l3 3M17 17l3 3M4 20l3-3M17 7l3-3" stroke="#2b1a00" stroke-width="2.2" stroke-linecap="round"/></svg>',
  r: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="2.5" fill="#fff"/><circle cx="12" cy="12" r="6.5" stroke="#fff" stroke-width="2" fill="none"/><circle cx="12" cy="12" r="10.5" stroke="#fff" stroke-width="1.6" fill="none" opacity=".7"/></svg>' };
var SUITART = { c: 'card-coral', k: 'card-kelp', t: 'card-tide', a: 'card-amber', r: 'card-sonar' };
function cardEl(c, cls) { var e = mk('div', 'cd s-' + c[0] + (cls ? ' ' + cls : ''), '<span class="rk">' + rankOf(c) + '</span><span class="ic">' + ICON[c[0]] + '</span>'); e.dataset.c = c; e.setAttribute('data-art', SUITART[c[0]]); e.setAttribute('role', 'img'); e.setAttribute('aria-label', cardName(c)); return e; }
function miniEl(c, extra) { var e = mk('span', 'mini s-' + c[0], String(rankOf(c))); e.dataset.c = c; if (extra) e.insertAdjacentHTML('beforeend', extra); return e; }
function tokHtml(t) { return t ? '<span class="tok" data-art="' + (t === 'O' ? 'token-final' : t[0] === '>' ? 'token-relative' : 'token-order') + '">' + (t === 'O' ? 'Ω' : t) + '</span>' : ''; }
// ---------------------------------------------------------------- sound (synth, mute-able)
var SND = { on: ls('ds-snd') !== false, ctx: null };
function sfx(k) {
  if (!SND.on || UI.fast) return; try { var C = SND.ctx || (SND.ctx = new (window.AudioContext || window.webkitAudioContext)()); var t = C.currentTime;
    var seq = { play: [[520, .05]], win: [[660, .08], [880, .12]], task: [[740, .08], [988, .1], [1318, .16]], fail: [[220, .25], [160, .35]], done: [[523, .1], [659, .1], [784, .1], [1046, .3]], ping: [[1200, .06], [900, .12]], tap: [[400, .03]] }[k] || [[440, .05]];
    seq.forEach(function (n, i) { var o = C.createOscillator(), g = C.createGain(); o.type = k === 'ping' ? 'sine' : 'triangle'; o.frequency.value = n[0]; o.connect(g); g.connect(C.destination); var s = t + i * .09; g.gain.setValueAtTime(.0001, s); g.gain.exponentialRampToValueAtTime(.18, s + .01); g.gain.exponentialRampToValueAtTime(.0001, s + n[1] + .05); o.start(s); o.stop(s + n[1] + .08); });
  } catch (e) { }
}
// ---------------------------------------------------------------- music slots (silent until files exist in games/deep-signal/music/)
var MUSIC_ON = ls('ds-mus') !== false;
function musicInit() {
  try { var m = {}; (window.DS_MUSIC || []).forEach(function (n) { m[n] = 'url:music/' + n + '.mp3'; }); if (window.GA) GA.init({ sfx: {}, music: m, key: 'ds' }); } catch (e) { }
  try { GXMUS.init({ key: 'ds', slots: [['menu', 'Menu'], ['dive', 'Dive'], ['tense', 'Last tricks'], ['victory', 'Mission complete'], ['defeat', 'Mission lost']], loops: ['menu', 'dive', 'tense'],
    slot: function () { if (!G || $('#title').classList.contains('on')) return ['menu', 0]; if (G.result) return [G.result.ok ? 'victory' : 'defeat', 1]; var left = G.hands[0].length; return [left <= 2 ? 'tense' : 'dive', 0]; },
    on: function () { return MUSIC_ON && (window.DS_MUSIC || []).length > 0; } }); } catch (e) { }
}
function musicSync() { try { GXMUS.sync(); } catch (e) { } }
// ---------------------------------------------------------------- start a mission
function startGame(o) {
  o = o || {}; clearTimeout(UI.timer);
  if (o.mode === 'tut') { if (UI.fastSave == null) UI.fastSave = UI.fast; UI.fast = false; UI.aiSave = AIDELAY; AIDELAY = 650; }   // the staged game keeps real timing so every step is shown
  else { if (UI.fastSave != null) { UI.fast = UI.fastSave; AIDELAY = UI.aiSave; UI.fastSave = null; } try { if (window.GXT && GXT.active()) GXT.stop(); } catch (e) { } } UI.mode = o.mode || 'quick'; UI.level = o.level || 'normal'; UI.flareFree = !!o.flareFree; UI.sigDone = {}; UI.sigMode = false; UI.flareMode = 0; UI.hold = false; UI.ended = false; UI.lastTricks = 0; UI.tut = o.tut || null;
  UI.players = o.players || UI.players; UI.mission = o.mission || UI.mission;
  AIX.seed((o.seed || Date.now()) & 0xffff);
  G = newGame({ players: UI.players, mission: UI.mission, seed: o.seed, deal: o.deal, taskCards: o.taskCards });
  ['title', 'setup', 'res'].forEach(function (id) { $('#' + id).classList.remove('on'); }); closeZoom();
  var st = $('#stamp'); st.className = ''; st.innerHTML = '';
  $('#mname').textContent = 'Mission ' + G.mission.n + ': ' + (G.mission.title || '');
  render(); musicSync(); later(step, UI.fast ? 30 : 500);
}
function later(f, ms) { clearTimeout(UI.timer); UI.timer = setTimeout(f, ms); }
// ---------------------------------------------------------------- the driver: computer seats act, the player's seat waits for a tap
function step() {
  if (!G || UI.hold) return;
  if (G.result) return endMission();
  if (G.phase === 'play' && !G.trick.length && !UI.sigDone[G.tricks.length]) {
    UI.sigDone[G.tricks.length] = true; var any = false;
    if (!UI.tut) for (var p = 1; p < G.n; p++) { if (p === G.dummy) continue; var c = AIX.commPick(G, p); if (c && performMove(G, { t: 'comm', c: c }, p)) { any = true; popAt(seatEl(p), '📡 ' + cardName(c)); pingFx(seatEl(p)); sfx('ping'); } }
    if (UI.tut && UI.tut.sig && G.tricks.length === 0) { var s1 = UI.tut.sig; performMove(G, { t: 'comm', c: s1.c }, s1.p); any = true; popAt(seatEl(s1.p), '📡 ' + cardName(s1.c)); }
    render(); if (any) return later(step, AIDELAY * 1.6);
  }
  var s = sideToAct(G); render();
  if (isHuman(s)) return;
  later(aiMove, G.phase === 'play' ? AIDELAY : AIDELAY * .8);
}
function aiMove() {
  if (!G || G.result || UI.hold) return; var s = sideToAct(G); if (isHuman(s)) return render();
  var mv = (UI.tut && UI.tut.pick && UI.tut.pick(G, s)) || AIX.act(G, s, UI.level); if (!mv) return;
  apply(mv, s);
}
function apply(mv, s) {
  var before = G.tricks.length, from = null;
  if (mv.t === 'play') from = G.turn === 0 || (G.turn === G.dummy && G.ctrl[G.dummy] === 0) ? handCardEl(mv.c) : seatEl(G.turn);
  if (mv.t === 'take') from = poolEl(mv.i);
  var fr = from ? from.getBoundingClientRect() : null, seatP = G.turn;
  if (!performMove(G, mv, s)) { render(); return false; }
  if (mv.t === 'play') sfx('play'); else sfx('tap');
  if (mv.t === 'answer') popAt(seatEl(mv.p), mv.yes ? 'Yes' : 'No');
  if (mv.t === 'choose') popAt(seatEl(mv.p), '⭐ chosen');
  if (G.tricks.length > before) return trickDone(fr, seatP);
  render(fr && mv.t === 'play' ? { fly: mv.c, from: fr } : null);
  later(step, UI.fast ? 20 : 120);
  return true;
}
function trickDone(fr, seatP) {
  var t = G.tricks[G.tricks.length - 1]; UI.hold = true; UI.showTrick = t; render(fr ? { fly: t.cards[t.cards.length - 1].c, from: fr } : null);
  var newly = G.tasks.filter(function (x) { return x.done && x.trick === G.tricks.length; });
  later(function () {
    var wc = t.cards.filter(function (x) { return x.p === t.winner; })[0]; var we = document.querySelector('#trick .cd[data-c="' + wc.c + '"]'); if (we) we.classList.add('win');
    popAt(seatEl(t.winner), nm(t.winner) + (t.winner === 0 ? ' win' : ' wins'));
    var last = G.result && G.result.ok;
    newly.forEach(function (x) { var ce = document.querySelector('#trick .cd[data-c="' + x.card + '"]'); if (x.wonBy === x.owner) { sfx('task'); popAt(seatEl(x.owner), '✓ ' + cardName(x.card)); if (ce) ce.classList.add(last ? 'clutch' : 'got'); } else { sfx('fail'); if (ce) ce.classList.add('lostc'); } });
    if (last && !UI.fast) popAt($('#trick'), 'Final task home!');
    if (!newly.length) sfx('win');
    later(function () {   // sweep to the winner
      var dst = seatEl(t.winner).getBoundingClientRect();
      document.querySelectorAll('#trick .cd').forEach(function (e) { var r = e.getBoundingClientRect(); e.style.transform = 'translate(' + (dst.left + dst.width / 2 - r.left - r.width / 2) + 'px,' + (dst.top + dst.height / 2 - r.top - r.height / 2) + 'px) scale(.35)'; e.style.opacity = '0'; });
      later(function () { UI.hold = false; UI.showTrick = null; try { if (window.GXT && GXT.active()) GXT.act({ type: 'event', what: 'trick', n: G.tricks.length }); } catch (e) { } step(); }, UI.fast ? 30 : 420);
    }, UI.fast ? 30 : (G.result && G.result.ok ? 1900 : newly.length ? 1300 : 900));
  }, UI.fast ? 30 : 450);
}
// ---------------------------------------------------------------- player input
function onHandTap(c, e) {
  if (!G || UI.hold || G.result) return zoomCard(c);
  var me = G.turn === G.dummy && G.ctrl[G.dummy] === 0 ? G.dummy : 0;
  if (UI.sigMode) { if (commPos(G, 0, c) && tutOk({ type: 'tap', what: 'signal', id: c })) { performMove(G, { t: 'comm', c: c }, 0); UI.sigMode = false; sfx('ping'); popAt(handCardEl(c), '📡 Signal sent'); pingFx(handCardEl(c)); render(); } else zoomCard(c); return; }
  if (UI.flareMode) { if (c[0] !== 'r') doFlare(c); else zoomCard(c); return; }
  if (G.phase === 'play' && sideToAct(G) === 0 && legalCards(G, G.turn).indexOf(c) >= 0) { if (!tutOk({ type: 'tap', what: 'card', id: c })) return; apply({ t: 'play', c: c }, 0); return; }
  zoomCard(c);
}
function tutOk(a) { try { if (window.GXT && GXT.active()) return GXT.act(a); } catch (e) { } return true; }
function onPoolTap(i) {
  if (!G) return; var t = G.pool[i];
  if (G.phase === 'draft' && sideToAct(G) === 0 && !UI.hold) { if (!tutOk({ type: 'tap', what: 'task', id: t.card })) return; apply({ t: 'take', i: i }, 0); return; }
  zoomTask(t);
}
function onSeatTap(p) {
  if (!G) return;
  if (G.phase === 'ask' && askWho(G) < 0 && G.cap === 0 && chooseTargets(G).indexOf(p) >= 0) { apply({ t: 'choose', p: p }, 0); return; }
  zoomSeat(p);
}
function doFlare(c) {
  var dir = UI.flareMode, picks = []; crew(G).forEach(function (p) { if (p === 0) picks[p] = c; else { var h = G.hands[p].filter(function (x) { return x[0] !== 'r'; }); picks[p] = h.sort(function (a, b) { return rankOf(a) - rankOf(b); })[0]; } });
  UI.flareMode = 0; if (performMove(G, { t: 'flare', dir: dir, picks: picks }, 0)) { sfx('ping'); popAt($('#hand'), '🔥 Cards passed ' + (dir > 0 ? 'left' : 'right')); } render(); step();
}
// ---------------------------------------------------------------- rendering
function seatEl(p) { return p === 0 ? $('#hand') : document.getElementById('seat' + p) || $('#board'); }
function handCardEl(c) { return document.querySelector('#hand .cd[data-c="' + c + '"]'); }
function poolEl(i) { return document.querySelectorAll('#pool .tcard')[i]; }
function others() { var o = []; for (var i = 1; i < G.n; i++) o.push(i); return o; }
function render(anim) {
  if (!G) return; var B = $('#board'), W = B.clientWidth, H = B.clientHeight, s = sideToAct(G), sq = $('#seats'); sq.innerHTML = '';
  var os = others(), k = os.length, sw = Math.min(W >= 1000 ? 150 : 96, Math.floor(W / k) - 6);
  var choosing = G.phase === 'ask' && askWho(G) < 0 && G.cap === 0, targets = choosing ? chooseTargets(G) : [];
  var panelBottom = 0;
  os.forEach(function (p, i) {
    var e = mk('div', 'seat'); e.id = 'seat' + p; e.style.left = (W * (i + .5) / k) + 'px'; e.style.setProperty('--sw', sw + 'px');
    if ((G.phase === 'play' && G.turn === p) || (G.phase === 'draft' && G.draftTurn === p) || (G.phase === 'ask' && askWho(G) === p)) e.classList.add('turn');
    if (targets.indexOf(p) >= 0) e.classList.add('pick');
    var av = mk('div', 'av', p === G.dummy ? '🤖' : NAMES[p][0]); av.style.background = SEATCOL[p]; av.setAttribute('data-art', p === G.dummy ? 'portrait-drone' : 'portrait-' + NAMES[p].toLowerCase()); e.appendChild(av);
    e.appendChild(mk('div', 'nm', nm(p)));
    e.appendChild(mk('div', 'st', (p === G.dummy ? '' : '<span class="bk" data-art="card-back"></span>' + G.hands[p].length + ' ') + '<span class="bk tw" data-art="icon-trick">★</span>' + G.won[p]));
    if (G.cmd === p) { var cp = mk('span', 'cap', 'Captain'); cp.setAttribute('data-art', 'token-captain'); e.appendChild(cp); }
    if (G.phase === 'ask' && G.answers[p] != null) e.appendChild(mk('span', 'badge' + (G.answers[p] ? '' : ' no'), G.answers[p] ? 'Yes' : 'No'));
    if (G.chosen === p && /notrick|onetrick/.test(G.mission.sp || '')) e.appendChild(mk('span', 'badge', /notrick/.test(G.mission.sp) ? '0 tricks' : '1 trick'));
    var tk = mk('div', 'tk'); G.tasks.forEach(function (t) { if (t.owner === p) tk.appendChild(miniEl(t.card, tokHtml(t.tok))).classList.toggle('done', !!t.done); });
    if (G.comm[p]) { var sg = miniEl(G.comm[p].c, '<span class="pos" data-art="token-signal">' + POSTXT[G.comm[p].pos].split(' ')[0] + '</span>'); sg.style.borderStyle = 'dashed'; tk.appendChild(sg); }
    if (p === G.dummy && G.ctrl[p] !== 0) G.hands[p].forEach(function (c) { tk.appendChild(miniEl(c)); });
    e.appendChild(tk); e.addEventListener('click', function () { onSeatTap(p); }); sq.appendChild(e);
    panelBottom = Math.max(panelBottom, e.offsetTop + e.offsetHeight);
  });
  var top = panelBottom + 8, cx = W / 2, cy = top + (H - top) / 2, cw = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--cw')) || 58, ch = cw * 1.48;
  // task pool
  var pl = $('#pool'); pl.innerHTML = ''; pl.style.top = top + 'px';
  G.pool.forEach(function (t, i) { var e = mk('div', 'tcard s-' + t.card[0], '<span class="rk">' + rankOf(t.card) + '</span><span class="ic">' + ICON[t.card[0]] + '</span>' + tokHtml(t.tok)); e.dataset.c = t.card; e.setAttribute('data-art', 'task-' + SUITART[t.card[0]].slice(5));
    e.setAttribute('role', 'button'); e.setAttribute('aria-label', 'Task ' + cardName(t.card));
    if (G.phase === 'draft' && s === 0 && !UI.hold) e.classList.add('legal'); e.addEventListener('click', function () { onPoolTap(i); }); holdZoom(e, function () { zoomTask(t); }); pl.appendChild(e); });
  // trick
  var tr = $('#trick'); tr.innerHTML = ''; var cards = UI.showTrick ? UI.showTrick.cards : G.trick;
  cards.forEach(function (x) {
    var pos = slot(x.p, W, cx, cy, cw, ch, k), e = cardEl(x.c); e.style.left = (pos.x - cw / 2) + 'px'; e.style.top = (pos.y - ch / 2) + 'px';
    var tk = taskOfCard(x.c); if (tk) { e.classList.add('task'); e.appendChild(mk('span', 'own', 'for ' + nm(tk.owner))); }
    e.addEventListener('click', function () { zoomCard(x.c); }); tr.appendChild(e);
    if (anim && anim.fly === x.c && ANIM && !UI.fast) { var r = e.getBoundingClientRect(); e.style.transition = 'none'; e.style.transform = 'translate(' + (anim.from.left - r.left) + 'px,' + (anim.from.top - r.top) + 'px)'; void e.offsetWidth; e.style.transition = ''; e.style.transform = ''; }
  });
  askPanel(top);
  // dock: line, tasks, buttons, hand
  $('#msg').textContent = line(s);
  var mt = $('#mytasks'); mt.innerHTML = ''; var mine = G.tasks.filter(function (t) { return t.owner === 0; });
  if (mine.length) mt.appendChild(mk('span', null, 'Yours:')); mine.forEach(function (t) { var m = miniEl(t.card, tokHtml(t.tok)); if (t.done) m.classList.add('done'); m.addEventListener('click', function () { zoomTask(t); }); mt.appendChild(m); });
  if (G.chosen === 0 && /notrick|onetrick/.test(G.mission.sp || '')) mt.appendChild(mk('span', null, /notrick/.test(G.mission.sp) ? 'Win no tricks' : 'Win one trick'));
  if (G.comm[0]) { var m0 = miniEl(G.comm[0].c, '<span class="pos">' + POSTXT[G.comm[0].pos].split(' ')[0] + '</span>'); m0.style.borderStyle = 'dashed'; mt.appendChild(m0); }
  if (!mine.length && !G.comm[0] && G.cmd === 0) mt.appendChild(mk('span', null, 'You are the captain'));
  var sb = $('#sigB'); sb.disabled = !canComm(G, 0) || UI.hold || !!UI.tut && !UI.tut.allowSig; sb.classList.toggle('pri', UI.sigMode); sb.style.display = (spHas(G, 'nocomm')) ? 'none' : '';
  var fb = $('#flareB'); fb.disabled = !canFlare(G) || UI.hold || !!UI.tut; fb.style.display = G.tricks.length ? 'none' : '';
  drawHand();
  var tot = G.np <= 3 ? 13 : 40 / G.np;
  $('#mtrick').textContent = (G.phase === 'play' || G.phase === 'over' ? 'Trick ' + Math.min(G.tricks.length + (G.result ? 0 : 1), tot) + ' of ' + tot + ' · ' : '') + (G.mission.k ? G.tasks.filter(function (t) { return t.done; }).length + '/' + G.mission.k + ' tasks' : 'Special rule') + (G.mission.rule ? ' · ' + shortRule() : '');
  try { var ph = phaseId(); if (window.GXH && !(window.GXT && GXT.active()) && ph !== UI.lastPh) { UI.lastPh = ph; GXH.phase(ph); } } catch (e) { }
  musicSync();
}
function shortRule() { var s = G.mission.sp || ''; return s.split('-').map(function (x) { return { notrick: 'one diver wins nothing', onetrick: 'one diver wins one', decide: 'captain decides', dist: 'captain shares', dead: 'dead zone', nocomm: 'silence', late2: 'signals from trick 2', late3: 'signals from trick 3', sonar1: 'sonar 1 must win', sonars: 'every sonar wins' }[x] || x; }).join(', '); }
function taskOfCard(c) { for (var i = 0; i < G.tasks.length; i++) if (G.tasks[i].card === c) return G.tasks[i]; return null; }
function slot(p, W, cx, cy, cw, ch, k) {
  if (p === 0) return { x: cx, y: cy + ch * .62 };
  var i = others().indexOf(p), px = W * (i + .5) / k, dx = (px - cx) * .62; dx = Math.max(-(cw * 1.6), Math.min(cw * 1.6, dx));
  return { x: cx + dx, y: cy - ch * .5 - (k > 2 && (i === 0 || i === k - 1) ? -ch * .18 : 0) };
}
function drawHand() {
  var hd = $('#hand'); hd.innerHTML = ''; var droneMine = G.dummy >= 0 && G.turn === G.dummy && G.ctrl[G.dummy] === 0 && G.phase === 'play';
  var who = droneMine ? G.dummy : 0, h = G.hands[who], s = sideToAct(G); hd.classList.toggle('drone', droneMine);
  var W = hd.clientWidth || 360, cw = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--cw')) || 58, n = h.length;
  var stepX = n > 1 ? Math.min(cw + 6, (W - cw - 4) / (n - 1)) : 0, x0 = (W - (stepX * (n - 1) + cw)) / 2;
  var legal = G.phase === 'play' && s === 0 && !UI.hold && !UI.sigMode && !UI.flareMode ? legalCards(G, G.turn) : [];
  h.forEach(function (c, i) {
    var e = cardEl(c); e.style.left = (x0 + i * stepX) + 'px'; e.style.top = droneMine ? '14px' : '8px'; e.style.zIndex = i + 1;
    if (legal.indexOf(c) >= 0) e.classList.add('legal'); else if (legal.length) e.classList.add('dim');
    if (UI.sigMode && commPos(G, 0, c)) e.classList.add('sigok');
    if (UI.flareMode && c[0] !== 'r') e.classList.add('sigok');
    var tk = taskOfCard(c); if (tk && !tk.done) { e.classList.add('task'); e.appendChild(mk('span', 'own', 'for ' + nm(tk.owner))); }
    e.setAttribute('role', 'button'); e.addEventListener('click', function (ev) { if (e._held) { e._held = false; return; } onHandTap(c, ev); }); holdZoom(e, function () { zoomCard(c); });
    hd.appendChild(e);
  });
}
function holdZoom(e, f) { var t = null; e.addEventListener('pointerdown', function () { t = setTimeout(function () { e._held = true; f(); }, 480); }); ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (ev) { e.addEventListener(ev, function () { clearTimeout(t); }); }); e.addEventListener('contextmenu', function (ev) { ev.preventDefault(); }); }
function line(s) {
  if (G.result) return G.result.ok ? 'Mission complete!' : 'Mission lost';
  if (UI.hold) return 'Trick to ' + nm(UI.showTrick ? UI.showTrick.winner : G.lead);
  if (UI.sigMode) return 'Tap a white-glow card to signal it';
  if (UI.flareMode) return 'Tap a card to pass ' + (UI.flareMode > 0 ? 'left' : 'right');
  if (G.phase === 'draft') return s === 0 ? 'Tap a task card to take it' : nm(G.draftTurn) + ' is choosing a task';
  if (G.phase === 'ask') { var q = askWho(G); if (q === 0) return 'Answer the captain: yes or no'; if (q < 0) return G.cap === 0 ? 'Tap the crew mate who gets it' : 'The captain is deciding'; return nm(q) + ' is answering'; }
  if (G.phase === 'play') { if (s !== 0) return nm(G.turn) + ' is playing'; var dr = G.turn === G.dummy ? 'Drone: ' : ''; return dr + (G.trick.length ? 'Follow suit: tap a glowing card' : 'Your lead: tap a glowing card'); }
  return '';
}
function askPanel(top) {
  var a = $('#askp'); a.innerHTML = ''; a.classList.remove('on'); if (G.phase !== 'ask' || UI.hold) return;
  var q = askWho(G), k = G.ask.kind, cards = k === 'dist' ? G.pool.slice(0, 1) : G.pool, txt;
  if (k === 'notrick') txt = 'Captain: who can stay out of every trick?'; else if (k === 'onetrick') txt = 'Captain: who can win exactly one trick?';
  else txt = k === 'dist' ? 'Captain: who takes this task?' : 'Captain: who carries all ' + cards.length + ' task' + (cards.length > 1 ? 's' : '') + '?';
  a.appendChild(mk('p', null, txt));
  if (cards.length) { var r0 = mk('div', 'row'); cards.forEach(function (t) { var m = miniEl(t.card, tokHtml(t.tok)); m.addEventListener('click', function () { zoomTask(t); }); r0.appendChild(m); }); a.appendChild(r0); }
  var r = mk('div', 'row'); r.style.marginTop = '8px';
  if (q === 0) { var y = mk('button', 'btn pri', 'Yes, me'), n = mk('button', 'btn', 'No'); y.onclick = function () { apply({ t: 'answer', p: 0, yes: true }, 0); }; n.onclick = function () { apply({ t: 'answer', p: 0, yes: false }, 0); }; r.appendChild(y); r.appendChild(n); }
  else if (q < 0 && G.cap === 0) chooseTargets(G).forEach(function (p) { var b = mk('button', 'btn' + (G.answers[p] ? ' warm' : ''), (p === 0 ? 'Me' : nm(p)) + (G.answers[p] == null ? '' : G.answers[p] ? ' ✓' : ' ✗')); b.onclick = function () { apply({ t: 'choose', p: p }, 0); }; r.appendChild(b); });
  a.appendChild(r); a.style.top = top + 'px'; a.classList.add('on');
}
function popAt(el, text) { if (!el || UI.fast) return; var r = el.getBoundingClientRect(), b = $('#app').getBoundingClientRect(), p = mk('div', 'pop', text); p.style.left = (r.left + r.width / 2 - b.left) + 'px'; p.style.top = (r.top - b.top + 10) + 'px'; $('#app').appendChild(p); setTimeout(function () { p.remove(); }, 1300); }
// ---------------------------------------------------------------- zoom (tap a card to see it large with its full text)
function zoomShow(card, text, btns, task) {
  var z = $('#zoom'), b = $('#zbig'); b.innerHTML = ''; if (card) { var e = task ? mk('div', 'tcard s-' + card[0], '<span class="rk">' + rankOf(card) + '</span>' + tokHtml(task.tok)) : cardEl(card); if (task) { e.style.width = '150px'; e.style.height = '220px'; e.setAttribute('data-art', 'task-' + SUITART[card[0]].slice(5)); } else e.style.position = 'relative'; b.appendChild(e); }
  b.style.display = card ? '' : 'none'; $('#ztxt').innerHTML = text; var r = $('#zrow'); r.innerHTML = '';
  (btns || []).concat([['Close', closeZoom]]).forEach(function (x) { var bt = mk('button', 'btn' + (x[2] ? ' pri' : ''), x[0]); bt.onclick = function () { closeZoom(); if (x[1] !== closeZoom) x[1](); }; r.appendChild(bt); });
  z.classList.add('on');
}
function closeZoom() { $('#zoom').classList.remove('on'); }
function cardText(c) {
  var t = '<b>' + cardName(c) + '</b><br>'; t += c[0] === 'r' ? 'Sonar: beats every coloured card. Higher sonar beats lower sonar.' : 'Follow suit if you can. The highest ' + SUIT_NAME[c[0]] + ' wins unless a sonar is played.';
  var tk = taskOfCard(c); if (tk) t += '<br>Task card: ' + nm(tk.owner) + ' must win the trick holding it' + (tk.tok ? ' (' + (tk.tok === 'O' ? 'Ω' : tk.tok) + ': ' + TOKTXT[tk.tok] + ')' : '') + '.';
  return t;
}
function zoomCard(c) {
  var btns = [];
  if (G && G.phase === 'play' && sideToAct(G) === 0 && legalCards(G, G.turn).indexOf(c) >= 0 && !UI.hold) btns.push(['Play it', function () { onHandTap(c); }, true]);
  if (G && canComm(G, 0) && commPos(G, 0, c) && G.hands[0].indexOf(c) >= 0 && !UI.tut) btns.push(['Signal: ' + POSTXT[isDead(G) ? '?' : commPos(G, 0, c)], function () { UI.sigMode = true; onHandTap(c); }]);
  zoomShow(c, cardText(c), btns);
}
function zoomTask(t) {
  var who = t.owner == null ? 'Not taken yet. Whoever takes it must win the trick that holds ' + cardName(t.card) + '.' : nm(t.owner) + ' must win the trick that holds ' + cardName(t.card) + '.';
  zoomShow(t.card, '<b>Task: ' + cardName(t.card) + '</b><br>' + who + (t.tok ? '<br>' + (t.tok === 'O' ? 'Ω' : t.tok) + ': ' + TOKTXT[t.tok] + '.' : '') + (t.done ? '<br>Done ✓' : ''), [], t);
}
function zoomSeat(p) {
  var tx = '<b>' + nm(p) + '</b>' + (G.cmd === p ? ' (captain)' : '') + '<br>' + (p === G.dummy ? 'The drone plays face-up cards; ' + nm(G.ctrl[p]) + ' plays for it.' : G.hands[p].length + ' cards in hand, ' + G.won[p] + ' tricks won.');
  var ts = G.tasks.filter(function (t) { return t.owner === p; }); if (ts.length) tx += '<br>Tasks: ' + ts.map(function (t) { return cardName(t.card) + (t.done ? ' ✓' : ''); }).join(', ');
  if (G.comm[p]) tx += '<br>Signal: ' + cardName(G.comm[p].c) + ' is their ' + POSTXT[G.comm[p].pos] + (G.comm[p].pos === '?' ? '' : ' ' + SUIT_NAME[G.comm[p].c[0]]);
  zoomShow(null, tx, []);
}
// ---------------------------------------------------------------- end of a mission
function endMission() {
  if (UI.ended) return; UI.ended = true; render(); var ok = G.result.ok, st = $('#stamp');
  st.innerHTML = (ok ? 'MISSION COMPLETE' : 'MISSION LOST') + '<small>' + (ok ? 'Mission ' + G.mission.n + ' logged' : G.result.why) + '</small>'; st.className = ok ? '' : 'fail'; st.setAttribute('data-art', ok ? 'stamp-complete' : 'stamp-lost'); st.style.backgroundImage = ''; artApply(); void st.offsetWidth; st.classList.add('on');
  sfx(ok ? 'done' : 'fail'); musicSync();
  if (ok) { var lb = ls('ds-log') || {}; lb[G.mission.n] = 1; ls('ds-log', lb); }
  later(function () {
    if (UI.mode === 'tut') { try { GXT.act({ type: 'event', what: 'done' }); } catch (e) { } return; }
    if (UI.mode === 'campaign' && window.GXC && GXC.active()) { GXC.finish(G); return; }
    showResult();
  }, UI.fast ? 80 : 1900);
}
function showResult() {
  var ok = G.result.ok; var rs = $('#res'); rs.classList.remove('hasart'); rs.style.backgroundImage = ''; rs.setAttribute('data-art', ok ? 'result-complete' : 'result-lost'); artApply();
  $('#resH').textContent = ok ? 'Mission ' + G.mission.n + ' complete' : 'Mission ' + G.mission.n + ' lost';
  $('#resP').textContent = ok ? 'Every task went to the right crew mate in ' + G.tricks.length + ' tricks.' + (G.flare ? ' (A flare was used.)' : '') : G.result.why + '.';
  var r = $('#resRow'); r.innerHTML = '';
  var b1 = mk('button', 'btn pri big', ok ? 'Next mission' : 'Try again'); b1.id = 'again'; b1.onclick = function () { startGame({ players: UI.players, mission: ok ? Math.min(50, G.mission.n + 1) : G.mission.n }); };
  var b2 = mk('button', 'btn', 'Change setup'); b2.onclick = showSetup; var b3 = mk('button', 'btn', 'Title'); b3.onclick = showTitle;
  r.appendChild(b1); r.appendChild(b2); r.appendChild(b3); $('#res').classList.add('on');
}
// ---------------------------------------------------------------- title, setup
function showTitle() { clearTimeout(UI.timer); try { if (window.GXT && GXT.active()) GXT.stop(); } catch (e) { } ['setup', 'res'].forEach(function (id) { $('#' + id).classList.remove('on'); }); $('#title').classList.add('on'); tutMenu(); musicSync(); }
function showSetup() {
  $('#title').classList.remove('on'); $('#res').classList.remove('on'); $('#setup').classList.add('on');
  var sg = $('#segP'); sg.innerHTML = ''; [2, 3, 4, 5].forEach(function (n) { var b = mk('button', n === UI.players ? 'on' : '', String(n)); b.setAttribute('aria-label', n + ' crew'); b.onclick = function () { UI.players = n; ls('ds-pl', n); showSetup(); }; sg.appendChild(b); });
  var m = DS_MISSIONS[UI.mission - 1]; $('#mNum').textContent = UI.mission; $('#mdesc').textContent = m.title + ': ' + m.log + (m.rule ? ' ' + m.rule : '') + (UI.players === 2 ? ' (2 crew: a drone plays face-up cards.)' : '');
  var lb = ls('ds-log') || {}, L = $('#logbook'); L.innerHTML = ''; for (var i = 1; i <= 50; i++) { var s = mk('span', lb[i] ? 'ok' : '', String(i)); L.appendChild(s); }
}
// ---------------------------------------------------------------- hint (bulb), coach bubbles, rules
function phaseId() { if (!G || G.result || UI.hold) return null; var s = sideToAct(G); if (s !== 0) return null; if (G.phase === 'draft') return 'draft'; if (G.phase === 'ask') return 'ask'; if (G.phase === 'play') return G.trick.length ? 'follow' : 'lead'; return null; }
function suggest() {
  if (!G || G.phase !== 'play' || sideToAct(G) !== 0 || UI.hold) { if (G && G.phase === 'draft' && sideToAct(G) === 0) { var i = AIX.draftPick(G, 0); return { target: function () { return poolEl(i); }, why: 'Your hand can win this task most easily.' }; } return null; }
  var c = AIX.choosePlay(G, G.turn, 'normal'), tk = taskOfCard(c), why = 'The crew simulation completes the mission most often with this card.';
  if (tk && tk.owner === 0) why = 'This card is your task: play it when you can win it.'; else if (tk) why = 'Pass this task card to ' + nm(tk.owner) + ' while they can win.';
  else if (!G.trick.length) why = 'A safe lead that keeps your crew on track.';
  return { target: function () { return handCardEl(c); }, why: why };
}
var RULES = [
  { title: 'The goal', text: 'Every task card must be won by its owner: they win the trick that holds it. Then the mission is complete.' },
  { title: 'Follow suit', text: 'The leader plays any card. Others must play the same colour if they can. Highest of that colour wins.' },
  { title: 'Sonar cards', text: 'Sonar 1-4 beat every colour. The captain holds Sonar 4 and leads the first trick.' },
  { phase: 'draft', title: 'Taking tasks', text: 'Starting with the captain, each diver takes one task card in turn until none are left.' },
  { phase: 'draft', title: 'Order marks', text: '1-5 must be done in that exact order. Arrows: in arrow order. Ω: the very last task.' },
  { phase: 'lead', title: 'Signals', text: 'Once per mission, before a trick, show one card: your highest, only or lowest of that colour.' },
  { phase: 'lead', title: 'Flare', text: 'Before the first trick everyone may pass one card left or right. It costs the No flare star.' },
  { phase: 'follow', title: 'Winning the trick', text: 'The winner leads the next trick. Losing a task card to the wrong diver ends the mission.' },
  { phase: 'ask', title: 'Captain decides', text: 'Some missions let the captain pick who carries tasks, or who must win no tricks. Answer honestly.' },
  { title: 'Two divers', text: 'With 2 crew a drone plays face-up cards from 7 stacks. The captain plays for it.' }];
function helpInit() {
  try {
    GXH.init({ game: 'deep-signal', defaultOn: true, avoid: '.legal,#askp .btn,.seat.pick',
      steps: { draft: { target: function () { return $('#pool'); }, title: 'Task cards', text: 'You must win the trick that holds the task card you take.' },
        lead: { target: function () { return $('#hand'); }, title: 'Your lead', text: 'Glow means legal. Any card may lead a trick.' },
        follow: { target: function () { return $('#hand'); }, title: 'Following', text: 'The colour that was led must be followed if you can. Highest wins.' },
        ask: { target: function () { return $('#askp'); }, title: 'Captain asks', text: 'Say yes only if your hand can do it.' } },
      rules: RULES });
    GXH.bulb({ el: '#bulbbtn', suggest: suggest, rulesFor: function () { return phaseId() || 'lead'; } });
  } catch (e) { }
}
// ---------------------------------------------------------------- menu (shared settings drawer)
function menuInit() {
  try {
    GX.init({ key: 'ds' });
    var b = function (label, f) { var x = mk('button', 'btn', label); x.type = 'button'; x.onclick = function () { GX.close(); f(); }; return x; };
    GX.settings({ id: 'setd', title: 'Menu',
      game: function (S) { S.appendChild(GX.row('This game', [b('Rules', function () { GXH.rules(); }), b('Tutorial', function () { startTutorial(false); }), b('Restart', function () { if (G) startGame({ players: UI.players, mission: G.mission.n, mode: UI.mode === 'tut' ? 'quick' : UI.mode, level: UI.level }); }), b('Title', showTitle)])); },
      sound: function (S) { S.appendChild(GX.row('Sound effects', GX.onoff(SND.on, function (v) { SND.on = v; ls('ds-snd', v); }))); S.appendChild(GX.row('Music', [GX.onoff(MUSIC_ON, function (v) { MUSIC_ON = v; ls('ds-mus', v); musicSync(); }), b('Pick music', function () { try { GXMUS.open(); } catch (e) { } })], (window.DS_MUSIC || []).length ? '' : 'Music files arrive later; silent for now.')); },
      help: function (S) { try { S.appendChild(GXH.settingsRow()); } catch (e) { } },
      about: { name: 'Deep Signal', version: '1.0', text: 'Original game design, names and art for the Game Night Shelf.' } });
    GX.onPref && GX.onPref(function (k) { if (k === 'ai') AIDELAY = UI.fast ? 60 : GX.aiDelay(650); });
    if (GX.aiDelay && !UI.fast) AIDELAY = GX.aiDelay(650);
  } catch (e) { console.warn(e); }
}
// ---------------------------------------------------------------- story (the 50-mission logbook)
function campaignInit() {
  try {
    GXC.init({ game: 'deep-signal', data: window.CAMPAIGN,
      startChapter: function (def) { if (def.setup.mission === 1 && !def.easy) return startTutorial(true); startGame({ players: def.setup.players || 4, mission: def.setup.mission, mode: 'campaign', level: def.opponent.aiLevel === 'hard' ? 'hard' : 'normal', flareFree: !!def.setup.flareFree }); },
      isWon: function (G) { return !!(G.result && G.result.ok); },
      metrics: function (G) { return { won: !!(G.result && G.result.ok), noflare: !G.flare || UI.flareFree, signals: G.sig.filter(function (s) { return s.p !== 0; }).length, tricks: G.tricks.length }; },
      onExit: showTitle,
      portrait: function (who) { var c = (window.CAMPAIGN.cast || {})[who], f = c && c.portrait ? c.portrait.replace('.webp', '') : who; return artHas(f) ? 'media/' + f + '.webp' : null; },
      scores: function (G) { return [G.result && G.result.ok ? 1 : 0]; }, seats: function (G) { return [{ name: 'You', me: true }]; } });
  } catch (e) { console.warn(e); }
}
// ---------------------------------------------------------------- boot
function boot() {
  UI.players = ls('ds-pl') || 4; menuInit(); helpInit(); campaignInit(); musicInit(); artLoad();
  $('#storyB').onclick = function () { $('#title').classList.remove('on'); GXC.open(); };
  $('#quickB').onclick = showSetup; $('#howB').onclick = function () { GXH.rules(); };
  $('#setBack').onclick = showTitle; $('#startB').onclick = function () { startGame({ players: UI.players, mission: UI.mission }); };
  $('#mMinus').onclick = function () { UI.mission = UI.mission > 1 ? UI.mission - 1 : 50; showSetup(); }; $('#mPlus').onclick = function () { UI.mission = UI.mission < 50 ? UI.mission + 1 : 1; showSetup(); };
  $('#helpB').onclick = function () { GXH.rules(phaseId() || undefined); };
  $('#sigB').onclick = function () { if (!G || !canComm(G, 0)) return; if (!tutOk({ type: 'tap', what: 'sigB' })) return; UI.sigMode = !UI.sigMode; UI.flareMode = 0; render(); };
  $('#flareB').onclick = function () { if (!G || !canFlare(G)) return; zoomShow(null, '<b>Flare</b><br>Everyone passes one card (not a sonar) to the same side. You lose the "No flare" star.', [['Pass left', function () { UI.flareMode = 1; render(); }, true], ['Pass right', function () { UI.flareMode = -1; render(); }]]); };
  $('#zoom').addEventListener('click', function (e) { if (e.target.id === 'zoom') closeZoom(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeZoom(); });
  window.addEventListener('resize', function () { if (G) render(); });
  ['#board', '#hand', '#dock'].forEach(function (sel) { $(sel).addEventListener('click', function (e) { if (e.target === e.currentTarget || e.target.id === 'trick' || e.target.id === 'seats' || e.target.id === 'mine') nudge(); }); });
  document.addEventListener('click', function (e) { var c = e.target.closest && e.target.closest('.gx-set-nav .gx-chip'); if (c) { c.classList.toggle('ds-hit'); c.dataset.hit = (+c.dataset.hit || 0) + 1; } });
  tutMenu();
}
function pingFx(el) { if (!el || UI.fast) return; var r = el.getBoundingClientRect(), f = mk('div', 'pingfx'); f.setAttribute('data-art', 'fx-ping'); f.style.left = (r.left + r.width / 2) + 'px'; f.style.top = (r.top + r.height / 2) + 'px'; document.body.appendChild(f); artApply(); setTimeout(function () { f.remove(); }, 900); }
function nudge() { var m = $('#msg'); m.classList.remove('flash'); void m.offsetWidth; m.classList.add('flash'); setTimeout(function () { m.classList.remove('flash'); }, 700); }
function tutMenu() { try { $('#tutSlot').innerHTML = GXT.menuHTML({ game: 'deep-signal', first: !ls('ds-played'), cls: 'btn', launch: function () { startTutorial(false); } }); } catch (e) { } }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
