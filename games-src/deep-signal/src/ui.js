/* Deep Signal UI: board-first table. Tap a glowing card to play it, tap anything else to see it large, hold any card to zoom. */
var NAMES = ['You', 'Ines', 'Bram', 'Kito', 'Odile'], SEATCOL = ['#3fd0c9', '#3a8ee0', '#3fb36b', '#f0b429', '#e8577a'];
var POSTXT = { top: '▲ highest', only: '● only', bot: '▼ lowest', '?': '? unknown' };
var TOKTXT = { '1': 'must be done first', '2': 'must be done second', '3': 'must be done third', '4': 'must be done fourth', '5': 'must be done fifth', '>': 'before >> and >>>', '>>': 'after >, before >>>', '>>>': 'after > and >>', '>>>>': 'after all other arrows', 'O': 'must be the very last task' };
var G = null, AIDELAY = 650, ANIM = true, ME = 0;   // ME = the seat whose hand the screen shows (hot-seat: whoever holds the device)
var UI = { mode: 'quick', level: 'normal', sigMode: false, flareMode: 0, hold: false, sigDone: {}, timer: null, fast: /[?&]fast=1/.test(location.search), lastTricks: 0, players: 4, mission: 1, flareFree: false, ended: false, humans: [0], hot: false, nh: 1 };
if (UI.fast) AIDELAY = 60;
var $ = function (s) { return document.querySelector(s); };
function mk(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
function ls(k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || 'null'); localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } }
function hname(p) { var n = (ls('ds-names') || [])[p]; return n && String(n).trim() ? String(n).trim().slice(0, 12) : 'Diver ' + (p + 1); }
function nm(p) { return p === G.dummy ? 'Drone' : UI.hot && isHuman(p) ? hname(p) : NAMES[p]; }
function askPending() { return !!G && G.phase === 'play' && !G.tricks.length && !G.trick.length && canFlare(G) && !UI.flareAsked && !UI.tut && !UI.flareMode; }
function suitWord(l) { return SUIT_NAME[suitOf(l + '1')]; }
function isHuman(s) { return UI.humans.indexOf(s) >= 0; }
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
    slot: function () { if (!G || $('#title').classList.contains('on')) return ['menu', 0]; if (G.result) return [G.result.ok ? 'victory' : 'defeat', 1]; var left = G.hands[ME].length; return [left <= 2 ? 'tense' : 'dive', 0]; },
    on: function () { return MUSIC_ON && (window.DS_MUSIC || []).length > 0; } }); } catch (e) { }
}
function musicSync() { try { GXMUS.sync(); } catch (e) { } }
// ---------------------------------------------------------------- start a mission
function startGame(o) {
  o = o || {}; clearTimeout(UI.timer);
  if (o.mode === 'tut') { if (UI.fastSave == null) UI.fastSave = UI.fast; UI.fast = false; UI.aiSave = AIDELAY; AIDELAY = 650; }   // the staged game keeps real timing so every step is shown
  else { if (UI.fastSave != null) { UI.fast = UI.fastSave; AIDELAY = UI.aiSave; UI.fastSave = null; } try { if (window.GXT && GXT.active()) GXT.stop(); } catch (e) { } } UI.mode = o.mode || 'quick'; UI.level = o.level || 'normal'; UI.flareFree = !!o.flareFree; UI.sigDone = {}; UI.flareAsked = !!o.noFlareOffer; UI.sigMode = false; UI.flareMode = 0; UI.hold = false; UI.ended = false; UI.lastTricks = 0; UI.tut = o.tut || null;
  UI.players = o.players || UI.players; UI.mission = o.mission || UI.mission;
  var nh = Math.max(1, Math.min(o.humans || 1, UI.players)); UI.humans = []; for (var hh = 0; hh < nh; hh++) UI.humans.push(hh); UI.hot = nh > 1; ME = 0; $('#pass').classList.remove('on');
  AIX.seed((o.seed || Date.now()) & 0xffff);
  G = newGame({ players: UI.players, mission: UI.mission, seed: o.seed, deal: o.deal, taskCards: o.taskCards, names: UI.hot ? [0, 1, 2, 3, 4].map(function (i) { return isHuman(i) ? hname(i) : NAMES[i]; }) : null });
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
  if (G.phase === 'play' && canFlare(G) && !UI.flareAsked && !UI.tut && !UI.flareMode) { flareOffer(); return; }   // the crew may send a flare before anyone signals
  if (G.phase === 'play' && !G.trick.length && !UI.sigDone[G.tricks.length]) {
    UI.sigDone[G.tricks.length] = true; var any = false;
    if (!UI.tut) for (var p = 0; p < G.n; p++) { if (p === G.dummy || isHuman(p)) continue; var c = AIX.commPick(G, p); if (c && performMove(G, { t: 'comm', c: c }, p)) { any = true; popAt(seatEl(p), '📡 ' + cardName(c)); pingFx(seatEl(p)); sfx('ping'); } }
    if (UI.tut && UI.tut.sig && G.tricks.length === 0) { var s1 = UI.tut.sig; performMove(G, { t: 'comm', c: s1.c }, s1.p); any = true; popAt(seatEl(s1.p), '📡 ' + cardName(s1.c)); }
    render(); if (any) return later(step, AIDELAY * 1.6);
  }
  var s = sideToAct(G);
  if (isHuman(s) && s !== ME) return showPass(s);
  render();
  if (isHuman(s)) return;
  later(aiMove, G.phase === 'play' ? AIDELAY : AIDELAY * .8);
}
function showPass(s) {
  closeZoom(); var ps = $('#pass'); $('#passH').textContent = 'Pass the device to ' + nm(s); $('#passB').textContent = 'I am ' + nm(s); ps.classList.add('on');
  $('#passB').onclick = function () { ME = s; ps.classList.remove('on'); UI.lastPh = null; render(); step(); };
}
function aiMove() {
  if (!G || G.result || UI.hold) return; var s = sideToAct(G); if (isHuman(s)) return render();
  var mv = (UI.tut && UI.tut.pick && UI.tut.pick(G, s)) || AIX.act(G, s, UI.level); if (!mv) return;
  apply(mv, s);
}
function apply(mv, s) {
  var before = G.tricks.length, from = null;
  if (mv.t === 'play') from = G.turn === ME || (G.turn === G.dummy && G.ctrl[G.dummy] === ME) ? handCardEl(mv.c) : seatEl(G.turn);
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
    popAt(seatEl(t.winner), nm(t.winner) + (t.winner === ME && !UI.hot ? ' win' : ' wins')); var se = document.getElementById('seat' + t.winner); if (se && !UI.fast) se.classList.add('bump');
    var last = G.result && G.result.ok;
    newly.forEach(function (x) { var ce = document.querySelector('#trick .cd[data-c="' + x.card + '"]'); if (x.wonBy === x.owner) { sfx('task'); popAt(seatEl(x.owner), '✓ ' + cardName(x.card)); var mm = document.querySelector('#seat' + x.owner + ' .mini[data-c="' + x.card + '"], #mytasks .mini[data-c="' + x.card + '"]'); if (mm && !UI.fast) { mm.classList.add('done', 'popin'); } if (ce) ce.classList.add(last ? 'clutch' : 'got'); } else { sfx('fail'); if (ce) ce.classList.add('lostc'); } });
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
  
  if (UI.sigMode) { if (commPos(G, ME, c) && tutOk({ type: 'tap', what: 'signal', id: c })) { performMove(G, { t: 'comm', c: c }, ME); UI.sigMode = false; sfx('ping'); popAt(handCardEl(c), '📡 Signal sent'); pingFx(handCardEl(c)); render(); } else zoomCard(c); return; }
  if (UI.flareMode) { if (c[0] !== 'r') doFlare(c); else zoomCard(c); return; }
  if (askPending()) { nudge(); zoomCard(c); return; }
  if (G.phase === 'play' && sideToAct(G) === ME && legalCards(G, G.turn).indexOf(c) >= 0) { if (UI.tut && UI.tut.only && c !== UI.tut.only || !tutOk({ type: 'tap', what: 'card', id: c })) { nudge(); popAt(handCardEl(c), UI.tut && UI.tut.only ? 'Tap the glowing ' + cardName(UI.tut.only) : 'Not yet'); sfx('tap'); return; } apply({ t: 'play', c: c }, ME); return; }
  zoomCard(c);
}
function tutOk(a) { try { if (window.GXT && GXT.active()) return GXT.act(a); } catch (e) { } return true; }
function onPoolTap(i) {
  if (!G) return; var t = G.pool[i];
  if (G.phase === 'draft' && sideToAct(G) === ME && !UI.hold) { if (!tutOk({ type: 'tap', what: 'task', id: t.card })) return; apply({ t: 'take', i: i }, ME); return; }
  zoomTask(t);
}
function onSeatTap(p) {
  if (!G) return;
  if (G.phase === 'ask' && askWho(G) < 0 && G.cap === ME && chooseTargets(G).indexOf(p) >= 0) { apply({ t: 'choose', p: p }, ME); return; }
  zoomSeat(p);
}
function flareOffer() {
  render(); var a = $('#askp'); a.innerHTML = ''; a.appendChild(mk('p', null, 'Before the first trick the crew may send one flare: everyone passes a card.'));
  var r = mk('div', 'row'), d = mk('button', 'btn pri', 'Dive on'), f = mk('button', 'btn', '🔥 Send a flare'); d.id = 'diveB';
  d.onclick = function () { UI.flareAsked = true; a.classList.remove('on'); step(); }; f.onclick = function () { UI.flareAsked = true; a.classList.remove('on'); $('#flareB').onclick(); };
  r.appendChild(d); r.appendChild(f); a.appendChild(r); a.style.top = ($('#pool').style.top || '140px'); a.classList.add('on'); $('#msg').textContent = 'Flare or dive on?';
}
function doFlare(c) {
  var dir = UI.flareMode, picks = []; crew(G).forEach(function (p) { if (p === ME) picks[p] = c; else { var h = G.hands[p].filter(function (x) { return x[0] !== 'r'; }); picks[p] = h.sort(function (a, b) { return rankOf(a) - rankOf(b); })[0]; } });
  UI.flareMode = 0; if (performMove(G, { t: 'flare', dir: dir, picks: picks }, ME)) { sfx('ping'); popAt($('#hand'), '🔥 Cards passed ' + (dir > 0 ? 'left' : 'right')); } render(); step();
}
// ---------------------------------------------------------------- rendering
function seatEl(p) { return p === ME ? $('#hand') : document.getElementById('seat' + p) || $('#board'); }
function handCardEl(c) { return document.querySelector('#hand .cd[data-c="' + c + '"]'); }
function poolEl(i) { return document.querySelectorAll('#pool .tcard')[i]; }
function others() { var o = []; for (var i = 1; i < G.n; i++) o.push((ME + i) % G.n); return o; }
function render(anim) {
  if (!G) return; var B = $('#board'), W = B.clientWidth, H = B.clientHeight, s = sideToAct(G), sq = $('#seats'); sq.innerHTML = '';
  var os = others(), k = os.length, land = innerHeight < 500 && W > 600, sw = land ? Math.min(280, Math.floor(W / k) - 8) : Math.min(W >= 1000 ? 190 : 96, Math.floor(W / k) - 6); B.classList.toggle('land', land);
  var choosing = G.phase === 'ask' && askWho(G) < 0 && G.cap === ME, targets = choosing ? chooseTargets(G) : [];
  var panelBottom = 0;
  os.forEach(function (p, i) {
    var e = mk('div', 'seat'); e.id = 'seat' + p; e.style.left = (W * (i + .5) / k) + 'px'; e.style.setProperty('--sw', sw + 'px');
    if ((G.phase === 'play' && G.turn === p) || (G.phase === 'draft' && G.draftTurn === p) || (G.phase === 'ask' && askWho(G) === p)) e.classList.add('turn');
    if (targets.indexOf(p) >= 0) e.classList.add('pick');
    var av = mk('div', 'av', p === G.dummy ? '🤖' : UI.hot && isHuman(p) ? hname(p)[0].toUpperCase() : NAMES[p][0]); av.style.background = SEATCOL[p]; av.setAttribute('data-art', p === G.dummy ? 'portrait-drone' : 'portrait-' + NAMES[p].toLowerCase()); e.appendChild(av);
    e.appendChild(mk('div', 'nm', nm(p)));
    e.appendChild(mk('div', 'st', (p === G.dummy ? '' : '<span class="bk" data-art="card-back"></span>' + G.hands[p].length + ' ') + '<span class="tw">won</span> ' + G.won[p]));
    if (G.cmd === p) { var cp = mk('span', 'cap', 'Captain'); cp.setAttribute('data-art', 'token-captain'); e.appendChild(cp); }
    if (G.phase === 'ask' && G.answers[p] != null) e.appendChild(mk('span', 'badge' + (G.answers[p] ? '' : ' no'), G.answers[p] ? 'Yes' : 'No'));
    if (G.chosen === p && /notrick|onetrick/.test(G.mission.sp || '')) e.appendChild(mk('span', 'badge', /notrick/.test(G.mission.sp) ? '0 tricks' : '1 trick'));
    var tk = mk('div', 'tk'); G.tasks.forEach(function (t) { if (t.owner === p) tk.appendChild(miniEl(t.card, tokHtml(t.tok))).classList.toggle('done', !!t.done); });
    e.appendChild(tk);
    if (G.comm[p]) { var sr = mk('div', 'sgrow'); sr.appendChild(mk('span', 'sgl', '📡 ' + (land ? POSTXT[G.comm[p].pos].split(' ')[0] : POSTXT[G.comm[p].pos]))); sr.appendChild(miniEl(G.comm[p].c)); e.appendChild(sr); } e.addEventListener('click', function () { onSeatTap(p); }); sq.appendChild(e);
    panelBottom = Math.max(panelBottom, e.offsetTop + e.offsetHeight);
  });
  var dr = $('#drone'); dr.innerHTML = ''; dr.style.display = G.dummy >= 0 ? '' : 'none';
  if (G.dummy >= 0) {
    dr.style.top = (panelBottom + 6) + 'px'; var dturn = G.phase === 'play' && G.turn === G.dummy, dleg = dturn && G.ctrl[G.dummy] === ME && s === ME && !UI.hold ? legalCards(G, G.dummy) : [];
    dr.classList.toggle('turn', dturn); dr.appendChild(mk('div', 'dl', '🤖 Drone\u2019s face-up stacks' + (G.ctrl[G.dummy] === ME ? ' (you play for it)' : ' (' + nm(G.ctrl[G.dummy]) + ' plays for it)')));
    var row = mk('div', 'drow');
    G.stacks.forEach(function (st) { var w = mk('div', 'stk' + (st.length > 1 ? ' deep' : '')); if (st.length) { var c = st[st.length - 1], m = miniEl(c); var tk2 = taskOfCard(c); if (tk2 && !tk2.done) m.classList.add('tsk'); if (dleg.indexOf(c) >= 0) { m.classList.add('legal'); m.addEventListener('click', function (ev) { ev.stopPropagation(); onHandTap(c, ev); }); } else m.addEventListener('click', function () { zoomCard(c); }); w.appendChild(m); } else w.classList.add('empty'); row.appendChild(w); });
    dr.appendChild(row); panelBottom = dr.offsetTop + dr.offsetHeight;
  }
  var top = panelBottom + 8, cx = W / 2, cy = top + (H - top) / 2, cw = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--cw')) || 58, ch = cw * 1.48;
  // task pool
  var pl = $('#pool'); pl.innerHTML = ''; pl.style.top = top + 'px';
  G.pool.forEach(function (t, i) { var e = mk('div', 'tcard s-' + t.card[0], '<span class="rk">' + rankOf(t.card) + '</span><span class="ic">' + ICON[t.card[0]] + '</span>' + tokHtml(t.tok)); e.dataset.c = t.card; e.setAttribute('data-art', 'task-' + SUITART[t.card[0]].slice(5));
    e.setAttribute('role', 'button'); e.setAttribute('aria-label', 'Task ' + cardName(t.card));
    if (G.phase === 'draft' && s === ME && !UI.hold) e.classList.add('legal'); e.addEventListener('click', function () { onPoolTap(i); }); holdZoom(e, function () { zoomTask(t); }); pl.appendChild(e); });
  // trick
  var tr = $('#trick'); tr.innerHTML = ''; var cards = UI.showTrick ? UI.showTrick.cards : G.trick;
  cards.forEach(function (x) {
    var pos = slot(x.p, W, cx, cy, cw, ch, k), e = cardEl(x.c); e.style.left = (pos.x - cw / 2) + 'px'; e.style.top = (pos.y - ch / 2) + 'px';
    var tk = taskOfCard(x.c); if (tk) { e.classList.add('task'); e.appendChild(mk('span', 'own', tk.owner === ME && !UI.hot ? 'yours' : 'for ' + nm(tk.owner))); }
    var wl = mk('span', 'who', nm(x.p)); wl.style.background = SEATCOL[x.p] || '#9aa'; e.appendChild(wl);
    e.addEventListener('click', function () { zoomCard(x.c); }); tr.appendChild(e);
    if (anim && anim.fly === x.c && ANIM && !UI.fast) { var r = e.getBoundingClientRect(); e.style.transition = 'none'; e.style.transform = 'translate(' + (anim.from.left - r.left) + 'px,' + (anim.from.top - r.top) + 'px)'; void e.offsetWidth; e.style.transition = ''; e.style.transform = ''; }
  });
  askPanel(top);
  // dock: line, tasks, buttons, hand
  $('#msg').textContent = line(s);
  var mt = $('#mytasks'); mt.innerHTML = ''; var mine = G.tasks.filter(function (t) { return t.owner === ME; });
  if (mine.length) mt.appendChild(mk('span', null, 'Yours:')); mine.forEach(function (t) { var m = miniEl(t.card, tokHtml(t.tok)); if (t.done) m.classList.add('done'); m.addEventListener('click', function () { zoomTask(t); }); mt.appendChild(m); });
  if (G.chosen === ME && /notrick|onetrick/.test(G.mission.sp || '')) mt.appendChild(mk('span', null, /notrick/.test(G.mission.sp) ? 'Win no tricks' : 'Win one trick'));
  if (G.comm[ME]) { var sr0 = mk('span', 'sgrow'); sr0.appendChild(mk('span', 'sgl', '📡 ' + POSTXT[G.comm[ME].pos])); sr0.appendChild(miniEl(G.comm[ME].c)); mt.appendChild(sr0); }
  if (!mine.length && !G.comm[ME] && G.cmd === ME) mt.appendChild(mk('span', null, 'You are the captain'));
  var sb = $('#sigB'); sb.disabled = !canComm(G, ME) || UI.hold || !!UI.tut && !UI.tut.allowSig; sb.classList.toggle('pri', UI.sigMode); sb.style.display = (spHas(G, 'nocomm')) ? 'none' : '';
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
  if ($('#board').classList.contains('land')) { var od = others().concat([ME]), ix = od.indexOf(p); return { x: cx + (ix - (od.length - 1) / 2) * (cw + 16), y: cy + 8 }; }
  if (p === ME) return { x: cx, y: cy + ch * .62 };
  var i = others().indexOf(p), px = W * (i + .5) / k, dx = (px - cx) * .62; dx = Math.max(-(cw * 1.6), Math.min(cw * 1.6, dx));
  return { x: cx + dx, y: cy - ch * .5 - (k > 2 && (i === 0 || i === k - 1) ? -ch * .18 : 0) };
}
function drawHand() {
  var hd = $('#hand'); hd.innerHTML = ''; var droneMine = G.dummy >= 0 && G.turn === G.dummy && G.ctrl[G.dummy] === ME && G.phase === 'play';
  var who = droneMine ? G.dummy : ME, h = G.hands[who], s = sideToAct(G); hd.classList.toggle('drone', droneMine);
  hd.onclick = function (ev) { if (ev.target === hd) nudge(); };
  var W = hd.clientWidth || 360, cw = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--cw')) || 58, n = h.length;
  var fit = function (m) { return m > 1 ? Math.min(cw + 6, (W - cw - 8) / (m - 1)) : 0; }, rows = n > 1 && fit(n) < 46 ? 2 : 1, hrows = rows > 1 || UI.twoG === G && !droneMine ? 2 : 1, per = Math.ceil(n / rows), rowOff = Math.round(cw * 0.9);
  var y0 = droneMine ? 14 : 8; hd.style.height = (y0 + 6 + parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--ch')) + (hrows - 1) * rowOff) + 'px'; hd.classList.toggle('two', rows > 1); if (rows > 1 && !droneMine) UI.twoG = G;   // keeps the two-row height for the mission: the hand never jumps
  var legal = G.phase === 'play' && s === ME && !UI.hold && !UI.sigMode && !UI.flareMode && !askPending() ? legalCards(G, G.turn) : [];
  if (UI.tut && UI.tut.only && legal.indexOf(UI.tut.only) >= 0) legal = [UI.tut.only];
  h.forEach(function (c, i) {
    var r = Math.floor(i / per), j = i - r * per, m = Math.min(per, n - r * per), stepX = fit(m), x0 = Math.max(4, (W - (stepX * (m - 1) + cw)) / 2);
    var e = cardEl(c); e.style.left = (x0 + j * stepX) + 'px'; e.style.top = (y0 + r * rowOff) + 'px'; e.style.zIndex = i + 1;
    if (legal.indexOf(c) >= 0) e.classList.add('legal'); else if (legal.length) e.classList.add('dim');
    if (UI.sigMode && commPos(G, ME, c)) e.classList.add('sigok');
    if (UI.flareMode && c[0] !== 'r') e.classList.add('sigok');
    var tk = taskOfCard(c); if (tk && !tk.done) { e.classList.add('task'); e.appendChild(mk('span', 'own', tk.owner === ME && !UI.hot ? 'yours' : 'for ' + nm(tk.owner))); }
    e.setAttribute('role', 'button'); e.addEventListener('click', function (ev) { if (e._held) { e._held = false; return; } e.setAttribute('data-tap', '1'); onHandTap(c, ev); }); holdZoom(e, function () { zoomCard(c); });
    hd.appendChild(e);
  });
}
function holdZoom(e, f) { var t = null; e.addEventListener('pointerdown', function () { t = setTimeout(function () { e._held = true; f(); }, 480); }); ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (ev) { e.addEventListener(ev, function () { clearTimeout(t); }); }); e.addEventListener('contextmenu', function (ev) { ev.preventDefault(); }); }
function line(s) {
  if (G.result) return G.result.ok ? 'Mission complete!' : 'Mission lost';
  if (UI.hold) return 'Trick to ' + nm(UI.showTrick ? UI.showTrick.winner : G.lead);
  if (UI.sigMode) return 'Tap a white-glow card to signal it';
  if (UI.flareMode) return 'Tap a card to pass ' + (UI.flareMode > 0 ? 'left' : 'right');
  if (G.phase === 'draft') return s === ME ? 'Tap a task card to take it' : nm(G.draftTurn) + ' is choosing a task';
  if (G.phase === 'ask') { var q = askWho(G); if (q === ME) return 'Answer the captain: yes or no'; if (q < 0) return G.cap === ME ? 'Tap the crew mate who gets it' : 'The captain is deciding'; return nm(q) + ' is answering'; }
  if (G.phase === 'play') { if (s !== ME) return nm(G.turn) + ' is playing'; var dr = G.turn === G.dummy ? 'Drone: ' : ''; if (askPending()) return 'Dive on, or send a flare first?'; if (G.trick.length) { var led = G.trick[0].c[0], has = G.hands[G.turn].some(function (c) { return c[0] === led; }); return dr + (has ? 'Follow suit: tap a glowing card' : 'No ' + suitWord(led) + ' left: play any card'); } return dr + 'Your lead: tap a glowing card'; }
  return '';
}
function askPanel(top) {
  var a = $('#askp'); if (G.phase === 'play' && canFlare(G) && !UI.flareAsked && !UI.tut) return; a.innerHTML = ''; a.classList.remove('on'); if (G.phase !== 'ask' || UI.hold) return;
  var q = askWho(G), k = G.ask.kind, cards = k === 'dist' ? G.pool.slice(0, 1) : G.pool, txt;
  if (k === 'notrick') txt = 'Captain: who can stay out of every trick?'; else if (k === 'onetrick') txt = 'Captain: who can win exactly one trick?';
  else txt = k === 'dist' ? 'Captain: who takes this task?' : 'Captain: who carries all ' + cards.length + ' task' + (cards.length > 1 ? 's' : '') + '?';
  a.appendChild(mk('p', null, txt));
  if (cards.length) { var r0 = mk('div', 'row'); cards.forEach(function (t) { var m = miniEl(t.card, tokHtml(t.tok)); m.addEventListener('click', function () { zoomTask(t); }); r0.appendChild(m); }); a.appendChild(r0); }
  var r = mk('div', 'row'); r.style.marginTop = '8px';
  if (q === ME) { var y = mk('button', 'btn pri', 'Yes, me'), n = mk('button', 'btn', 'No'); y.onclick = function () { apply({ t: 'answer', p: ME, yes: true }, ME); }; n.onclick = function () { apply({ t: 'answer', p: ME, yes: false }, ME); }; r.appendChild(y); r.appendChild(n); }
  else if (q < 0 && G.cap === ME) chooseTargets(G).forEach(function (p) { var b = mk('button', 'btn' + (G.answers[p] ? ' warm' : ''), (p === ME ? 'Me' : nm(p)) + (G.answers[p] == null ? '' : G.answers[p] ? ' ✓' : ' ✗')); b.onclick = function () { apply({ t: 'choose', p: p }, ME); }; r.appendChild(b); });
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
function closeZoom() { var was = $('#zoom').classList.contains('on'); $('#zoom').classList.remove('on'); if (was && G && UI.flareAsked && !UI.flareMode && G.phase === 'play' && !G.tricks.length && !G.trick.length && !G.result) later(step, 60); }
function cardText(c) {
  var t = '<b>' + cardName(c) + '</b><br>'; t += c[0] === 'r' ? 'Sonar: beats every coloured card. Higher sonar beats lower sonar.' : 'Follow suit if you can. The highest ' + SUIT_NAME[c[0]] + ' wins unless a sonar is played.';
  var tk = taskOfCard(c); if (tk) t += '<br>Task card: ' + nm(tk.owner) + ' must win the trick holding it' + (tk.tok ? ' (' + (tk.tok === 'O' ? 'Ω' : tk.tok) + ': ' + TOKTXT[tk.tok] + ')' : '') + '.';
  return t;
}
function zoomCard(c) {
  var btns = [];
  if (G && G.phase === 'play' && sideToAct(G) === ME && legalCards(G, G.turn).indexOf(c) >= 0 && !UI.hold) btns.push(['Play it', function () { onHandTap(c); }, true]);
  if (G && canComm(G, ME) && commPos(G, ME, c) && G.hands[ME].indexOf(c) >= 0 && !UI.tut) btns.push(['Signal: ' + POSTXT[isDead(G) ? '?' : commPos(G, ME, c)], function () { UI.sigMode = true; onHandTap(c); }]);
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
    if (UI.mode === 'campaign' && window.GXC && GXC.active()) { var why = !G.result.ok && G.result.why; GXC.finish(G); if (why) whyOnResult(why, 0); return; }
    showResult();
  }, UI.fast ? 80 : 1900);
}
function whyOnResult(why, n) {   // the Story result card says why the mission failed (the shared card has no reason line)
  var h = document.querySelector('.gxc-res h2'); if (h && !document.querySelector('.gxc-res .ds-why')) { var p = mk('p', 'ds-why', why + '.'); h.insertAdjacentElement('afterend', p); return; }
  if (n < 40) setTimeout(function () { whyOnResult(why, n + 1); }, 100);
}
function showResult() {
  var ok = G.result.ok; var rs = $('#res'); rs.classList.remove('hasart'); rs.style.backgroundImage = ''; rs.setAttribute('data-art', ok ? 'result-complete' : 'result-lost'); artApply();
  $('#resH').textContent = ok ? 'Mission ' + G.mission.n + ' complete' : 'Mission ' + G.mission.n + ' lost';
  $('#resP').textContent = ok ? 'Every task went to the right crew mate in ' + G.tricks.length + ' tricks.' + (G.flare ? ' (A flare was used.)' : '') : G.result.why + '.';
  var X = $('#resX'); X.innerHTML = '';
  if (ok) { var sigs = G.commUsed.filter(function (u) { return u; }).length, st = [true, !G.flare, sigs <= 2], n = st.filter(Boolean).length;
    X.appendChild(mk('div', 'rstars', st.map(function (v) { return v ? '★' : '<i>★</i>'; }).join(''))); X.appendChild(mk('p', null, n + ' of 3 stars: complete' + (st[1] ? ', no flare' : '') + (st[2] ? ', 2 or fewer signals' : ''))); }
  else if (G.tricks.length) { var lt = G.tricks[G.tricks.length - 1], rp = mk('div', 'rreplay'); rp.appendChild(mk('b', null, 'The trick that failed (trick ' + G.tricks.length + ')')); var rt = mk('div', 'rt');
    lt.cards.forEach(function (x) { var tk = taskOfCard(x.c), f = mk('figure', tk && tk.wonBy !== tk.owner ? 'bad' : x.p === lt.winner ? 'win' : ''); f.appendChild(miniEl(x.c)); f.appendChild(mk('figcaption', null, nm(x.p) + (x.p === lt.winner ? ' won' : ''))); rt.appendChild(f); });
    rp.appendChild(rt); X.appendChild(rp); }
  var r = $('#resRow'); r.innerHTML = '';
  var b1 = mk('button', 'btn pri big', ok ? 'Next mission' : 'Try again'); b1.id = 'again'; b1.onclick = function () { startGame({ players: UI.players, mission: ok ? Math.min(50, G.mission.n + 1) : G.mission.n, humans: UI.humans.length, level: UI.level }); };
  var b2 = mk('button', 'btn', 'Change setup'); b2.onclick = showSetup; var b3 = mk('button', 'btn', 'Title'); b3.onclick = showTitle;
  r.appendChild(b1); r.appendChild(b2); r.appendChild(b3); $('#res').classList.add('on');
}
// ---------------------------------------------------------------- title, setup
function showTitle() { clearTimeout(UI.timer); try { if (window.GXT && GXT.active()) GXT.stop(); } catch (e) { } ['setup', 'res'].forEach(function (id) { $('#' + id).classList.remove('on'); }); $('#title').classList.add('on'); tutMenu(); musicSync(); }
function showSetup() {
  $('#title').classList.remove('on'); $('#res').classList.remove('on'); $('#setup').classList.add('on');
  var sg = $('#segP'); sg.innerHTML = ''; [2, 3, 4, 5].forEach(function (n) { var b = mk('button', n === UI.players ? 'on' : '', String(n)); b.setAttribute('aria-label', n + ' crew'); b.onclick = function () { UI.players = n; ls('ds-pl', n); showSetup(); }; sg.appendChild(b); });
  UI.nh = Math.min(UI.nh || 1, UI.players);
  var sh = $('#segH'); sh.innerHTML = ''; for (var hn = 1; hn <= UI.players; hn++) (function (hn) { var b = mk('button', hn === UI.nh ? 'on' : '', String(hn)); b.setAttribute('aria-label', hn + ' at this device'); b.onclick = function () { UI.nh = hn; showSetup(); }; sh.appendChild(b); })(hn);
  var nr = $('#nameRow'); if (!nr) { nr = mk('div', 'setrow'); nr.id = 'nameRow'; $('#segH').parentNode.insertAdjacentElement('afterend', nr); } nr.innerHTML = ''; nr.style.display = UI.nh > 1 ? '' : 'none';
  if (UI.nh > 1) { nr.appendChild(mk('label', null, 'Names')); var nl = ls('ds-names') || []; for (var q = 0; q < UI.nh; q++) (function (q) { var inp = mk('input', 'nmin'); inp.type = 'text'; inp.maxLength = 12; inp.placeholder = 'Diver ' + (q + 1); inp.value = nl[q] || ''; inp.setAttribute('aria-label', 'Name of diver ' + (q + 1)); inp.oninput = function () { var a = ls('ds-names') || []; a[q] = inp.value; ls('ds-names', a); }; nr.appendChild(inp); })(q); }
  var sl = $('#segL'); sl.innerHTML = ''; [['easy', 'Easy'], ['normal', 'Normal'], ['hard', 'Hard']].forEach(function (x) { var b = mk('button', x[0] === UI.qlevel ? 'on' : '', x[1]); b.onclick = function () { UI.qlevel = x[0]; ls('ds-lv', x[0]); showSetup(); }; sl.appendChild(b); });
  var m = DS_MISSIONS[UI.mission - 1]; $('#mNum').textContent = UI.mission; $('#mdesc').textContent = m.title + ': ' + m.log + (m.rule ? ' ' + m.rule : '') + (UI.players === 2 ? ' (2 crew: a drone plays face-up cards.)' : '');
  var lb = ls('ds-log') || {}, L = $('#logbook'); L.innerHTML = ''; for (var i = 1; i <= 50; i++) { var s = mk('span', lb[i] ? 'ok' : '', String(i)); L.appendChild(s); }
}
// ---------------------------------------------------------------- hint (bulb), coach bubbles, rules
function phaseId() { if (!G || G.result || UI.hold) return null; var s = sideToAct(G); if (s !== ME) return null; if (G.phase === 'draft') return 'draft'; if (G.phase === 'ask') return 'ask'; if (G.phase === 'play') return G.trick.length ? 'follow' : 'lead'; return null; }
function suggest() {
  if (!G || G.phase !== 'play' || sideToAct(G) !== ME || UI.hold) { if (G && G.phase === 'draft' && sideToAct(G) === ME) { var i = AIX.draftPick(G, G.draftTurn); return { target: function () { return poolEl(i); }, why: 'Your hand can win this task most easily.' }; } return null; }
  var c = AIX.choosePlay(G, G.turn, 'normal'), tk = taskOfCard(c), why = 'The crew simulation completes the mission most often with this card.';
  if (tk && tk.owner === ME) why = 'This card is your task: play it when you can win it.'; else if (tk) why = 'Pass this task card to ' + nm(tk.owner) + ' while they can win.';
  else if (!G.trick.length) why = 'A safe lead that keeps your crew on track.';
  return { target: function () { return handCardEl(c); }, why: why };
}
function rp(cards, extra) { return '<div class="rpic">' + cards.map(function (c) { return typeof c === 'string' && /^[ckta r]\d/.test(c) ? miniEl(c).outerHTML : c; }).join('') + (extra || '') + '</div>'; }
function rlab(t) { return '<span class="lab">' + t + '</span>'; }
var RULES = [
  { phase: ['lead', 'follow', 'draft'], title: 'The goal', text: 'Every task card must be won by its owner: they win the trick that holds it. Then the mission is complete.', pic: function () { return rp(['c7', rlab('task: its owner must win it')]); } },
  { phase: ['follow', 'lead'], title: 'Follow suit', text: 'The leader plays any card. Others must play the same colour if they can. Highest of that colour wins. No card of that colour? Play any card.', pic: function () { return rp(['c4', 'c9', 'c2', rlab('Coral 9 wins')]); } },
  { phase: ['follow', 'lead'], title: 'Sonar cards', text: 'Sonar 1-4 beat every colour. The captain holds Sonar 4 and leads the first trick.', pic: function () { return rp(['a9', 'r1', rlab('Sonar 1 beats Amber 9')]); } },
  { phase: 'draft', title: 'Taking tasks', text: 'Before play, starting with the captain, each diver takes one task card in turn until none are left. Take tasks your hand can win: high cards and sonars.', pic: function () { return rp([miniEl('k8').outerHTML, rlab('tap a task card to take it')]); } },
  { phase: 'draft', title: 'Order marks', text: '1-5: those tasks must be done in that exact order. Arrows (>, >>, >>>): in arrow order. Ω: the very last task. Unmarked tasks can come any time.', pic: function () { return rp(['<span class="tag">1</span>', '<span class="tag">2</span>', '<span class="tag">Ω</span>', rlab('first, second, last')]); } },
  { phase: 'lead', title: 'Signals', text: 'Once per mission, before a trick, show one colour card to the crew and say if it is your ▲ highest, ● only or ▼ lowest of that colour. Sonars cannot be signalled.', pic: function () { return rp(['<span class="tag">▲ highest</span>', '<span class="tag">● only</span>', '<span class="tag">▼ lowest</span>']); } },
  { phase: 'lead', title: 'Flare', text: 'Before the first trick the crew may send one flare: everyone passes one colour card left or right. It costs the No flare star.', pic: function () { return rp([rlab('🔥 flare'), miniEl('t2').outerHTML, rlab('→ next diver')]); } },
  { phase: 'follow', title: 'Winning the trick', text: 'The winner leads the next trick. A task card won by the wrong diver, or out of order, ends the mission.', pic: function () { return rp(['k3', 'k9', rlab('Kelp 9 wins, leads next')]); } },
  { phase: 'ask', title: 'Special missions', text: 'Some missions add a rule: the captain picks who carries tasks or who must win no tricks, silence (no signals), dead zone (signals hide the position), or sonars that must win. Answer the captain honestly.', pic: function () { return rp([rlab('Captain asks: Yes / No')]); } },
  { phase: ['draft', 'lead'], title: 'Two divers', text: 'With 2 crew a drone plays face-up cards from 7 stacks, shown on the board under the crew. The captain plays for it; when a top card is played the card under it turns face up.', pic: function () { return rp(['r2', 'c5', 'a8', rlab('drone stacks')]); } }];
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
      game: function (S) { S.appendChild(GX.row('This game', [b('Rules', function () { GXH.rules(); }), b('Tutorial', function () { startTutorial(false); }), b('Restart', function () { if (G) startGame({ players: UI.players, mission: G.mission.n, mode: UI.mode === 'tut' ? 'quick' : UI.mode, level: UI.level, humans: UI.humans.length }); }), b('Title', showTitle)])); },
      sound: function (S) { S.appendChild(GX.row('Sound effects', GX.onoff(SND.on, function (v) { SND.on = v; ls('ds-snd', v); }))); S.appendChild(GX.row('Music', [GX.onoff(MUSIC_ON, function (v) { MUSIC_ON = v; ls('ds-mus', v); musicSync(); }), b('Pick music', function () { try { GXMUS.open(); } catch (e) { } })], (window.DS_MUSIC || []).length ? '' : '')); },
      help: function (S) { try { S.appendChild(GXH.settingsRow()); } catch (e) { } },
      about: { name: 'Deep Signal', version: '1.0', text: 'Original names, missions and art for the Game Night Shelf. Temporary icons: game-icons.net by Lorc and Delapouite, CC BY 3.0.' } });
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
      metrics: function (G) { return { won: !!(G.result && G.result.ok), noflare: !G.flare || UI.flareFree, signals: G.sig.filter(function (s) { return !isHuman(s.p); }).length, tricks: G.tricks.length }; },
      onExit: showTitle,
      portrait: function (who) { var c = (window.CAMPAIGN.cast || {})[who], f = c && c.portrait ? c.portrait.replace('.webp', '') : who; return artHas(f) ? 'media/' + f + '.webp' : null; },
      scores: function (G) { return [G.result && G.result.ok ? 1 : 0]; }, seats: function (G) { return [{ name: 'You', me: true }]; } });
  } catch (e) { console.warn(e); }
}
// ---------------------------------------------------------------- boot
function boot() {
  UI.players = ls('ds-pl') || 4; UI.qlevel = ls('ds-lv') || 'normal'; menuInit(); helpInit(); campaignInit(); musicInit(); artLoad();
  $('#storyB').onclick = function () { $('#title').classList.remove('on'); GXC.open(); };
  $('#quickB').onclick = showSetup; $('#howB').onclick = function () { GXH.rules(); };
  $('#setBack').onclick = showTitle; $('#startB').onclick = function () { startGame({ players: UI.players, mission: UI.mission, humans: UI.nh, level: UI.qlevel }); };
  $('#mMinus').onclick = function () { UI.mission = UI.mission > 1 ? UI.mission - 1 : 50; showSetup(); }; $('#mPlus').onclick = function () { UI.mission = UI.mission < 50 ? UI.mission + 1 : 1; showSetup(); };
  $('#helpB').onclick = function () { GXH.rules(phaseId() || undefined); };
  $('#sigB').onclick = function () { if (!G || !canComm(G, ME)) return; if (!tutOk({ type: 'tap', what: 'sigB' })) return; UI.sigMode = !UI.sigMode; UI.flareMode = 0; render(); };
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
