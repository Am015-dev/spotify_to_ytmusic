/* Vale of Banners page: board-first UI (market + your estate on the board, dice/storage/goods in the dock),
   title (Story / Quick game / How to play), tutorial (gx-tutor), Story (gx-campaign), help (gx-help), music slots (gx-music), synth sfx. */
var G = null;
var UI = { sel: null, die: null, busy: false, mode: 'quick', hints: true, mute: false, music: true, fast: false, view: 0, chain: 0, lastHuman: -1, aiT: 0, camp: false, over: false };
var $ = function (s, r) { return (r || document).querySelector(s); };
function h(tag, attrs, kids) {
  var p = tag.split('.'), e = document.createElement(p[0] || 'div'); if (p.length > 1) e.className = p.slice(1).join(' ');
  if (attrs) for (var k in attrs) { if (attrs[k] == null) continue; if (k === 'text') e.textContent = attrs[k]; else if (k === 'html') e.innerHTML = attrs[k]; else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), attrs[k]); else e.setAttribute(k, attrs[k]); }
  (kids || []).forEach(function (c) { if (c != null) e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
  return e;
}
try { UI.hintsOn = localStorage.getItem('vob_hints') !== '0'; } catch (e) { UI.hintsOn = true; }   /* hints ON until the player turns them off (R21: a newcomer never found the switch) */
try { UI.mute = localStorage.getItem('vob_mute') === '1'; UI.music = localStorage.getItem('vob_music') !== '0'; } catch (e) { }
var QS = new URLSearchParams(location.search); if (QS.get('fast') === '1') UI.fast = true;

/* ---------------- sound: tiny synth, mute-able ---------------- */
var SND = { ctx: null };
function sfx(kind) {
  if (UI.mute || UI.fast) return;
  try {
    if (!SND.ctx) SND.ctx = new (window.AudioContext || window.webkitAudioContext)();
    var c = SND.ctx, t = c.currentTime, seq = { take: [[520, .07]], place: [[330, .06], [494, .09]], score: [[523, .08], [659, .08], [784, .14]], dice: [[200, .04], [260, .04], [180, .05]], chain: [[587, .07], [740, .07], [880, .07], [1175, .16]], sell: [[700, .06], [940, .1]], end: [[392, .1]], bad: [[150, .15]] }[kind] || [[440, .05]];
    seq.forEach(function (n, i) {
      var o = c.createOscillator(), g = c.createGain(); o.type = kind === 'dice' ? 'square' : 'triangle'; o.frequency.value = n[0];
      var st = t + i * 0.07; g.gain.setValueAtTime(0.0001, st); g.gain.exponentialRampToValueAtTime(0.12 * (GX.pref ? GX.pref('sfx') * GX.pref('master') : 1) + 0.0001, st + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, st + n[1]);
      o.connect(g); g.connect(c.destination); o.start(st); o.stop(st + n[1] + 0.02);
    });
  } catch (e) { }
}
function musicSlot() { if (!G || $('#start') && !$('#start').hidden) return ['title', 0]; if (G.over) return [G.winner === UI.view ? 'victory' : 'defeat', 1]; return [G.phase >= G.nPhases - 1 ? 'finale' : 'main', 0]; }
function musicInit() {
  try {
    var m = {}; (window.VB_MUSIC || []).forEach(function (n) { m[n] = 'url:music/' + n + '.mp3'; });
    GA.init({ sfx: {}, music: m, key: 'vob' });
    GXMUS.init({ key: 'vob', slots: [['title', 'Title'], ['main', 'Game'], ['finale', 'Last season'], ['victory', 'Victory'], ['defeat', 'Defeat']], loops: ['title', 'main', 'finale'], slot: musicSlot, on: function () { return UI.music && !UI.mute && (window.VB_MUSIC || []).length > 0; } });
    if (GX.applyPrefs) GX.applyPrefs();
  } catch (e) { }
}
function musSync() { try { GXMUS.sync(); } catch (e) { } }

/* ---------------- helpers ---------------- */
var GLYPH = { castle: '🏰', mine: '⛏️', know: '📜', ship: '⛵', hall: '🏛️', carp: '🪚', chapel: '🔔', mkt: '🎪', inn: '🍺', mint: '🪙', tower: '🗼', store: '🌾', sheep: '🐑', goat: '🐐', pig: '🐖', goose: '🪿' };
var GCOL = ['', '#f7f4ec', '#f6dc92', '#f3c27e', '#f0b0a0', '#c7dbf2', '#e6e6e6'];
var SHORT = { hall: 'Moot Hall', carp: 'Joiner', chapel: 'Chapel', mkt: 'Fair', inn: 'Inn', mint: 'Mint', tower: 'Beacon', store: 'Granary' };
function tlabel(t) { if (!t) return ''; if (t.t === 'bld') return SHORT[t.k] || VB.BLD[t.k].name.split(' ')[0]; if (t.t === 'pas') return t.n + ' ' + VB.ANIMALS[t.k]; return VB.COLNAME[t.t]; }
function labelled(b, t) { b.appendChild(h('span.tlab', { text: tlabel(t), 'aria-hidden': 'true', 'data-short': t.t === 'bld' ? (TINY[t.k] || '') : '' })); b.classList.add('lab'); return b; }
var TINY = { hall: 'Hall', store: 'Barn', chapel: 'Abbey', tower: 'Tower', carp: 'Saw' };   /* whole words for narrow stalls: a label is never cut mid-word */
function fitLabels() { document.querySelectorAll('.tlab[data-short]').forEach(function (e) { var sh = e.getAttribute('data-short'); if (sh && e.scrollWidth > e.clientWidth + 1) e.textContent = sh; }); }
function glyph(t) { return t.t === 'bld' || t.t === 'pas' ? GLYPH[t.k] : GLYPH[t.t]; }
var TERRAIN = { castle: 'tile-keep', mine: 'tile-mine', ship: 'tile-barge', know: 'tile-lore-k1', pas: 'tile-pas-sheep-2', bld: 'tile-bld-hall' };
function hexEl(t, opt) {
  opt = opt || {}; var col = t ? VB.COLHEX[t.t] : (opt.col ? VB.COLHEX[opt.col] : '#ccc');
  var e = h('div.hx', { style: 'background-color:' + col + (opt.size ? ';--hex:' + opt.size + 'px' : '') });
  if (t) {
    var stem = VB.tileStem(t); e.setAttribute('data-art', stem);
    if (ART.img[stem]) { e.style.backgroundImage = 'url(media/' + stem + '.webp)'; e.classList.add('hasart'); }
    e.appendChild(h('span.gl', { 'data-g': glyph(t), 'aria-hidden': 'true' }));
    if (t.t === 'pas') e.appendChild(h('span.nn', { text: '×' + t.n }));
  } else if (opt.col && TERRAIN[opt.col] && ART.img[TERRAIN[opt.col]]) {   /* empty space: the tile art as a faint printed texture */
    e.appendChild(h('span.ter', { 'aria-hidden': 'true', style: 'background-image:url(media/' + TERRAIN[opt.col] + '.webp)' })); e.classList.add('terr');
  }
  return e;
}
function toast(msg, ms) {   /* toast lane = the dock title row: it never covers score chips or the board */
  var t = $('#toast'), hd = document.querySelector('.gx-dock-head'), r = hd && hd.getBoundingClientRect();
  if (r && r.width) { t.style.left = (r.left + 4) + 'px'; t.style.top = (r.top + 1) + 'px'; t.style.width = (r.width - 8) + 'px'; t.style.height = Math.max(26, r.height - 2) + 'px'; }
  if (typeof G !== 'undefined' && G && !G.over && !isHuman(VB.actor(G))) { setCap(msg); return; }
  if (typeof G !== 'undefined' && G && !popupsOk()) { lineSay(msg, ms); return; }   /* Play mode: no pop-ups; the instruction line says it */
  var dh = document.querySelector('.gx-dock-head');
  t.textContent = msg; ms = Math.max(ms || 0, readMs(msg)); t.classList.add('on'); dh && dh.classList.add('toasting'); clearTimeout(toast.t); toast.t = setTimeout(function () { t.classList.remove('on'); dh && dh.classList.remove('toasting'); }, ms || 1800);
}
function popupsOk() { return !!UI.hintsOn && UI.mode !== 'tutorial' && UI.mode !== 'story'; }   /* pop-ups only with Hints on in a Quick game; Learn uses Odo, Play the line */
function lineSay(msg, ms) {   /* show a note in the instruction line for a readable time, then go back to the instruction */
  var pr = $('#prompt'); if (!pr) return; UI.note = msg; pr.textContent = msg; starAdd(pr); pr.classList.add('note'); clearTimeout(lineSay.t);
  lineSay.t = setTimeout(function () { UI.note = null; pr.classList.remove('note'); if (G) { pr.textContent = promptText(); starAdd(pr); } }, Math.max(ms || 0, readMs(msg)));
}
function starAdd(pr) { try { var sl = G && !G.over && isHuman(VB.actor(G)) && starLine(); if (sl) pr.appendChild(h('span.starwhy', { text: sl })); } catch (e) { } }
function readMs(txt) { return 4000 + 100 * String(txt || '').split(/\s+/).length; }   /* owner: a message stays 4 s + 1 s per 10 words */
function countUp(tb) {   /* totals tick up from 0 so the result lands as a beat (instant with fast / reduced motion) */
  if (UI.fast || document.documentElement.classList.contains('gx-reduce')) return;
  [].slice.call(tb.querySelectorAll(tb.querySelector('tr.tot') ? 'tr.tot td:not(:first-child)' : 'td:last-child')).forEach(function (td) { var n = +td.textContent, t0 = Date.now(); td.textContent = '0'; (function f() { var k = Math.min(1, (Date.now() - t0) / 900); td.textContent = String(Math.round(n * k)); if (k < 1) requestAnimationFrame(f); })(); });
}
function toastPos() {
  var t = $('#toast'), hd = document.querySelector('.gx-dock-head'), r = hd && hd.getBoundingClientRect();
  if (r && r.width) { t.style.left = (r.left + 4) + 'px'; t.style.top = (r.top + 1) + 'px'; t.style.width = (r.width - 8) + 'px'; t.style.height = Math.max(26, r.height - 2) + 'px'; }
}
function toastOff() { clearTimeout(toast.t); $('#toast').classList.remove('on'); var dh = document.querySelector('.gx-dock-head'); dh && dh.classList.remove('toasting'); }
/* one caption line = what is happening now (rival steps) */
function setCap(msg) { UI.cap = msg; var pr = $('#prompt'); if (pr && G && !isHuman(VB.actor(G))) pr.textContent = msg; }
function say(text, who) {   /* a character speaks: code-drawn portrait + one line (story beats, reactions) */
  if (!text || UI.fast || QS.get('scn')) return; var c = who || VSTORY.guide, g = $('#guide');   /* test scenarios (?scn=) audit the still board */
  if (!g) { g = h('div', { id: 'guide', role: 'status', 'aria-live': 'polite' }); document.body.appendChild(g); }
  g.innerHTML = ''; g.appendChild(h('span.gp', { 'aria-hidden': 'true', style: '--pc:' + (c.color || '#7a5c3e'), text: c.initial || (c.name || '?')[0] }));
  g.appendChild(h('span.gt', {}, [h('b', { text: c.name + ' ' }), document.createTextNode(text)]));
  g.appendChild(h('button.gx', { type: 'button', 'aria-label': 'Dismiss', text: '×', onclick: function () { g.classList.remove('on'); clearTimeout(say.t); if (UI.cBusy) { clearTimeout(UI.cT); UI.cBusy = false; coachPump(); } } }));
  g.classList.remove('on'); void g.offsetWidth; g.classList.add('on'); clearTimeout(say.t); var dur = readMs((c.name || '') + ' ' + text) + 600; say.until = Date.now() + dur; say.t = setTimeout(function () { g.classList.remove('on'); }, dur);
}
/* ---- coached first game: Odo explains each rule the first time it matters (one bubble at a time, never blocking) ---- */
function coach(id, text) {
  if (UI.mode !== 'tutorial' || !G) return; UI.seen = UI.seen || {}; if (id && UI.seen[id]) return; if (id) UI.seen[id] = 1;
  UI.cq = UI.cq || []; UI.cq.push(text || (VSTORY.coach[id] && VSTORY.coach[id].say)); UI.coachLog = (UI.coachLog || 0) + 1; coachPump();
}
function coachPump() {
  if (UI.cBusy || !UI.cq || !UI.cq.length) return; var t = UI.cq.shift(); if (!t) return coachPump();
  UI.cBusy = true; var tutOn = false; try { tutOn = typeof GXT !== 'undefined' && GXT.active(); } catch (e) { } if (tutOn) lineSay(VSTORY.guide.name + ': ' + t); else say(t); UI.cT = setTimeout(function () { UI.cBusy = false; coachPump(); }, UI.fast ? 0 : readMs(VSTORY.guide.name + ' ' + t) + 900);
}
function coachCheck(m, s, evs) {   /* after a move (m by seat s, events evs) and at turn starts (m null) */
  if (UI.mode !== 'tutorial' || !G || (typeof GXT !== 'undefined' && GXT.running())) return;
  var me0 = isHuman(s), p = G.P[0], top = pend(), vm = !G.over && isHuman(VB.actor(G)) ? VB.validMoves(G) : [];
  (evs || []).forEach(function (ev) {
    if (ev.e === 'score' && ev.why === 'region') { if (ev.p === 0) coach('region'); else { coach('rv-region', VSTORY.coachRival.region); UI.seen.region || coach('region'); } }
    if (ev.e === 'score' && ev.why === 'colour') coach('colour');
    if (ev.e === 'sell' && ev.p !== 0) coach('rv-sell', VSTORY.coachRival.sell);
    if (ev.e === 'place' && ev.p === 0) { var t = ev.tile; if (t.t === 'bld') coach('bld'); if (t.t === 'know') coach('lore'); if (t.t === 'mine') coach('mine'); if (t.t === 'pas') coach('pas'); if (ev.chain) coach('good-chain', VSTORY.coachGood.chain); }
    if (ev.e === 'place' && ev.p !== 0 && ev.chain) coach('rv-chain', VSTORY.coachRival.chain);
  });
  if (m && me0 && m.k === 'workers' && UI.wasBuild) coach('poor-workers', VSTORY.coachPoor.workers);
  if (m && me0 && m.k === 'workers') coach('workers');
  if (top && isHuman(VB.actor(G))) { if (top.t === 'castle') coach('keep'); if (top.t === 'hall') coach('hall'); if (top.t === 'ship') coach('barge'); if (top.t === 'discard') coach('discard'); }
  if (!G.over && !isHuman(VB.actor(G))) coach('rival');
  if (vm.length && !top) {
    var pp = G.P[VB.actor(G)];
    if (vm.some(function (x) { return x.k === 'place'; })) coach('build');
    if (vm.some(function (x) { return x.k === 'sell'; })) coach('sell');
    if (vm.some(function (x) { return x.k === 'take' && x.w > 0; })) coach('bend');
    if (vm.some(function (x) { return x.k === 'buy'; })) coach('back');
    if (VB.goodsTypes(pp).length >= 3) coach('kinds');
    if (G.round >= 1) coach('white');
    if (pp.used[0] && pp.used[1]) coach('end');
    if (vm.some(function (x) { return x.k === 'take' && G.depots[x.v][x.slot] && G.depots[x.v][x.slot].t === 'pas'; })) coach('pas');
  }
  if (G.over) coach('season');
}
function stepMs() { return UI.fast ? 0 : UI.quick ? 90 : animMs(300); }   /* rival beats: brisk (~2 s a turn), a tap makes them near-instant */
function turnBanner() {
  if (!G || G.over) return; var a = VB.actor(G), hu = G.seats.filter(function (s) { return s.human; }).length;
  var txt = isHuman(a) ? (hu > 1 ? G.seats[a].name + ', your turn' : 'Your turn') : G.seats[a].name + '\'s turn';
  var b = $('#tbanner'); if (!b) { b = h('div', { id: 'tbanner', 'aria-hidden': 'true' }); document.body.appendChild(b); }
  b.innerHTML = ''; b.appendChild(h('span', { text: txt })); b.appendChild(h('span.rds', {}, G.P[a].dice.map(function (v) { return h('span.rd', { text: v }); }))); b.style.setProperty('--sc', VB.SEATCOL[a] || '#2a2014');
  try { var orr = $('#opp').getBoundingClientRect(); if (orr.height) { b.style.top = Math.round(orr.top + orr.height / 2) + 'px'; b.classList.add('top'); } else if (L.tiny) { var brr = document.querySelector('.gx-bar').getBoundingClientRect(); b.style.top = Math.round(brr.top + brr.height / 2) + 'px'; b.classList.add('top'); } } catch (e) { }   /* very short phones (no strip): over the top bar; it lets taps through */   /* sit over the rival strip: never over a glowing target */
  UI.hold = UI.fast ? 0 : Date.now() + animMs(isHuman(a) ? 900 : 500);
  if (UI.fast || QS.get('scn')) return; b.classList.remove('on'); void b.offsetWidth; b.classList.add('on'); sfx('dice'); rollDice(b, G.P[a].dice);
}
function describe(m, s) {
  var n = G.seats[s].name, p = G.P[s], t;
  if (m.k === 'take' || m.k === 'grab') { t = G.depots[m.v][m.slot]; return n + ' takes ' + aName(t) + ' from stall ' + m.v + (m.w ? ', using ' + m.w + ' worker' + (m.w > 1 ? 's' : '') : ''); }
  if (m.k === 'buy') return n + ' buys ' + aName(G.black[m.slot]) + ' for silver';
  if (m.k === 'place') return n + ' builds ' + aName(p.store[m.s]) + (m.die === 'x' ? ' for free' : ' on a ' + m.v);
  if (m.k === 'sell') return n + ' sells goods with a ' + m.v;
  if (m.k === 'workers') return n + ' hires 2 workers';
  if (m.k === 'ship') return n + ' loads goods from stall ' + m.v;
  if (m.k === 'discard') return n + ' throws a tile away';
  if (m.k === 'skip') return n + ' skips the free action';
  if (m.k === 'end') return n + ' is done';
  return n + ' is thinking...';
}
function aiPlay(m) {
  var s = VB.actor(G); setCap(describe(m, s)); if (L.tabs && (m.k === 'take' || m.k === 'grab' || m.k === 'buy') && UI.tab !== 'market' && !UI.pinTab) { UI.tab = 'market'; render(); }
  var id = (m.k === 'take' || m.k === 'grab') ? 'mt-' + m.v + '-' + m.slot : m.k === 'buy' ? 'bl-' + m.slot : null, el = id && document.getElementById(id);
  if (el) el.classList.add('aipick');
  UI.busy = true;
  setTimeout(function () { UI.busy = false; if (el) el.classList.remove('aipick'); if (!G || G.over || isHuman(VB.actor(G))) return; doMove(m); }, m.k === 'end' ? Math.round(stepMs() * .6) : stepMs());
}
/* ---------------- turn flow + scoring you can see (tracker, sources, previews, best badges, move rating, beats) ---------------- */
var SRC_LBL = { region: 'regions', colour: 'colours', animals: 'animals', goods: 'goods sold', tower: 'tower', lore: 'lore', other: 'mines & lore', e_silver: 'silver left', e_goods: 'goods left', e_workers: 'workers', e_lore: 'end lore', end: 'end count' };
var SRC_ORDER = ['region', 'colour', 'animals', 'goods', 'tower', 'lore', 'other', 'e_silver', 'e_goods', 'e_workers', 'e_lore', 'end'];
function hints() { return UI.mode === 'tutorial' || !!UI.hintsOn; }   /* PLAY is clean; HINTS (top-bar toggle, off by default) or LEARN TO PLAY show previews, badges, ratings */
function hintSync() {
  var b = $('#hintT'); if (b) { b.setAttribute('aria-pressed', UI.hintsOn ? 'true' : 'false'); b.classList.toggle('on', !!UI.hintsOn); var sp = b.querySelector('span'); if (sp) sp.textContent = UI.hintsOn ? 'Hints on' : 'Hints'; }
  var bl = $('#bulbbtn'); if (bl) bl.style.display = hints() ? '' : 'none';
  try { GXH.setEnabled(popupsOk()); } catch (e) { }
}
function hintToggle() { UI.hintsOn = !UI.hintsOn; try { localStorage.setItem('vob_hints', UI.hintsOn ? '1' : '0'); } catch (e) { } PV = { key: '' }; hintSync(); if (G) render(); }
function showGoal() {   /* PLAY: one card before turn 1 with the aim and how points come */
  var tv = $('#tv'); tv.innerHTML = '';
  var c = h('div.card.goal', { role: 'dialog', 'aria-label': 'Goal' });
  c.appendChild(h('h2', { text: 'Build the best estate in ' + G.nPhases + ' season' + (G.nPhases > 1 ? 's' : '') }));
  c.appendChild(h('ol', {}, [h('li', { text: 'You roll two dice. Each die does one thing.' }), h('li', { text: 'Drag a die onto the stall with its number. Take a tile.' }), h('li', { text: 'Build it on your estate: same colour, a die\'s number.' }), h('li', { text: 'Fill every space inside an outline to score. Early pays more.' })]));
  c.appendChild(h('p.tip', { text: 'Stuck? Drag a worker onto a die to change it by one.' }));
  c.appendChild(h('div.acts', {}, [h('button.btn', { type: 'button', id: 'goalB', text: 'Let\'s play', onclick: function () { closeTile(); turnBanner(); } })]));
  tv.appendChild(c); tv.hidden = false; tv.onclick = null;
}
function nRounds() { return G.nRounds || 5; }
function srcAdd(s, why, n) { G.src = G.src || {}; var o = G.src[s] = G.src[s] || {}; o[why] = (o[why] || 0) + n; }
function srcLogAdd(ev) {   /* the last few reasons each player scored, for the score chip explanation */
  G.srcLog = G.srcLog || {}; var l = G.srcLog[ev.p] = G.srcLog[ev.p] || [], txt = '+' + ev.n + ' ' + (WHY[ev.why] || 'points');
  if (ev.why === 'region' && ev.cell != null) { var rg = VB.REGIONS[VB.CELLS[ev.cell].reg], bz = VB.PHASE_BONUS[Math.min(4, G.phase)]; txt += ' (' + (ev.n - bz) + ' for size, ' + bz + ' early bonus)'; }
  l.push(txt); if (l.length > 4) l.shift();
}
function scoreWhy(s) {
  var p = G.P[s], l = (G.srcLog && G.srcLog[s]) || [], who = s === UI.view && isHuman(s) ? 'You' : G.seats[s].name;
  if (!p.vp) return who + ': no points yet.';
  return who + ': ' + p.vp + ' points. Last: ' + (l.length ? l[l.length - 1].replace(/ \(.*\)/, '') : 'season bonus') + '.';
}
function srcOf(s) {   /* points by source: the score chips and the result table both read this, so they always agree */
  var o = Object.assign({}, (G.src && G.src[s]) || {}), sum = 0; for (var k in o) sum += o[k];
  var p = G.P[s], rest = p.vp - sum;
  if (G.over && p.end && rest > 0) { [['e_silver', 'silver'], ['e_goods', 'goods'], ['e_workers', 'workers'], ['e_lore', 'lore']].forEach(function (x) { var n = Math.min(rest, p.end[x[1]] || 0); if (n > 0) { o[x[0]] = n; rest -= n; } }); }
  if (rest > 0) o[G.over ? 'end' : 'other'] = (o[G.over ? 'end' : 'other'] || 0) + rest; return o;
}
function trackerEl() {
  var a = VB.actor(G), p = G.P[a] || me(), hu = G.seats.filter(function (x) { return x.human; }).length;
  var who = G.over ? 'Game over' : isHuman(a) ? (hu > 1 ? G.seats[a].name + '\'s turn' : 'Your turn') : G.seats[a].name + '\'s turn';
  var left = G.over ? 0 : p.used.filter(function (x) { return !x; }).length;
  var kids = [h('span.ttr', { text: 'Round ' + Math.min(G.round + 1, nRounds()) + ' of ' + nRounds() }), h('span.ttw', { text: who, style: G.over ? null : '--sc:' + (VB.SEATCOL[a] || '#c9a24a') })];
  if (!G.over) {
    kids.push(h('span.ttd', { text: left ? left + (left > 1 ? ' dice left' : ' die left') : 'no dice left' }));
    p.dice.forEach(function (v, i) { kids.push(h('span.tok' + (p.used[i] ? '.spent' : '') + (isHuman(a) && UI.die === i ? '.sel' : ''), { text: v, 'aria-label': 'Die ' + v + (p.used[i] ? ' spent' : ' left') })); });
  }
  return h('div', { id: 'tt', role: 'group', 'aria-label': 'Turn tracker' }, kids);
}
function sim(m) { var c = VB.fclone(G), s = VB.actor(G), r = VB.performMove(c, m); return r.ok ? { G: c, ev: r.ev, s: s } : null; }
function valOf(m, base) { var r = sim(m); return r ? VB.evalSeat(r.G, r.s) - base : -99; }
var PV = { key: '' };
function pvKey() { return G.seq + ':' + UI.sel + ':' + UI.die + ':' + VB.actor(G); }
function pvReset() { if (PV.key !== pvKey()) PV = { key: pvKey(), base: G.over ? 0 : VB.evalSeat(G, VB.actor(G)), cell: {}, take: null }; return PV; }
function previewPlace(m) {   /* points this build adds right now, region progress, and its value for the best-spot star */
  var P0 = pvReset(), k = m.cell + '/' + m.s + '/' + m.die; if (P0.cell[k]) return P0.cell[k];
  var r = sim(m); if (!r) return null; var n = 0, why = [];
  r.ev.forEach(function (ev) { if (ev.p !== r.s) return; if (ev.e === 'score') { n += ev.n; why.push('+' + ev.n + ' ' + (WHY[ev.why] || 'points')); } if (ev.e === 'silver') why.push('+' + ev.n + ' silver'); if (ev.e === 'workers') why.push('+' + ev.n + ' workers'); if (ev.e === 'track') why.push('banner up the track'); });
  var t = G.P[r.s].store[m.s]; if (t && t.t === 'castle') why.push('a free extra action'); if (t && t.t === 'bld' && t.k === 'hall') why.push('a free extra build');
  var reg = VB.REGIONS[VB.CELLS[m.cell].reg], f = reg.cells.filter(function (x) { return r.G.P[r.s].estate[x]; }).length;
  return (P0.cell[k] = { n: n, why: why, f: f, size: reg.cells.length, val: VB.evalSeat(r.G, r.s) - P0.base });
}
function hardMove() {   /* the look-ahead best move for the human (cached per state); drives every ★ and the bulb */
  if (!G || G.over || !myTurn() || UI.mode === 'tutorial') return null;
  var P0 = pvReset(); if (P0.hard !== undefined) return P0.hard;
  try { P0.hard = VB.aiMove(VB.fclone(G), 'normal'); } catch (e) { P0.hard = null; } return P0.hard;
}
function takeValues() {   /* value of every legal take for the best-pick badge */
  var P0 = pvReset(); if (P0.take) return P0.take; var o = {}, best = null;
  VB.validMoves(G).forEach(function (m) { if (m.k !== 'take' && m.k !== 'grab' && m.k !== 'buy') return; if (UI.die != null && m.die != null && m.die !== UI.die) return; var id = m.k === 'buy' ? 'bl-' + m.slot : 'mt-' + m.v + '-' + m.slot, v = valOf(m, P0.base) - (m.w || 0) * 0.6; if (o[id] == null || v > o[id]) o[id] = v; });
  for (var id in o) if (best == null || o[id] > o[best]) best = id;
  if (UI.mode === 'tutorial') best = null;   /* Learn to play: tutStarPaint puts the star on the coach's target only */
  /* the star follows the look-ahead pick (whole turn), not the one-step greedy value: no star when taking is not the best move */
  var hm = hardMove();
  if (hm) { var hid = hm.k === 'buy' ? 'bl-' + hm.slot : (hm.k === 'take' || hm.k === 'grab') ? 'mt-' + hm.v + '-' + hm.slot : null;
    if (hid && o[hid] != null) { var top = o[best]; best = hid; o[hid] = Math.max(o[hid], top) + 0.01; }
    else if (UI.die == null || (hm.die != null && hm.die === UI.die)) best = null; }
  return (P0.take = { v: o, best: best });
}
/* move rating: every action of a human turn is compared with the greedy best action at that moment */
function rateBefore(m) {
  if (!myTurn() || m.k === 'end' || m.k === 'skip' || m.k === 'discard') return;
  var s = VB.actor(G), base = VB.evalSeat(G, s), best = -99, bm = null, got = valOf(m, base);
  var hm = hardMove(), fol = !!(hm && ['k', 'v', 'slot', 'cell', 's', 'die'].every(function (f) { return hm[f] === m[f]; })); if (fol) got = 1e9;
  UI.moveN = (UI.moveN || 0) + 1; if (fol) UI.starN = (UI.starN || 0) + 1;   /* the result tip must fit: a ★ follower is not told to follow ★ */   /* following ★ always rates as a best move */
  VB.validMoves(G).forEach(function (x) { if (x.k === 'end' || x.k === 'skip') return; var v = valOf(x, base); if (v > best) { best = v; bm = x; } });
  var R = UI.rate = UI.rate || { got: 0, best: 0, miss: 0, alt: '' };
  if (got >= 1e9) got = best;
  R.got += Math.max(0, got); R.best += Math.max(0, best);
  if (best - got > R.miss) { R.miss = best - got; R.alt = describe(bm, s).replace(G.seats[s].name + ' ', '').replace(/^(\w+?)s\b/, '$1'); }
}
function rateLine() {
  var R = UI.rate; UI.rate = null; if (!R || R.best <= 0.5) return { k: 'okay', t: 'Fine. Nothing big was on offer.' };
  var q = R.got / R.best;
  if (q >= 0.85 || R.miss < 1) return { k: 'good', t: 'Great turn. Those were the best moves.' };
  if (q >= 0.55) return { k: 'okay', t: 'Okay. Better was: ' + R.alt + '.' };
  return { k: 'poor', t: 'Weak turn. Much better was: ' + R.alt + '.' };
}
function beat(title, line, cls, ms) { UI.beats = UI.beats || []; UI.beats.push({ title: title, line: line, cls: cls || '', ms: ms }); }
function beatsRun(then) {   /* show queued beat cards one after another; the next turn waits for them */
  var q = UI.beats || []; UI.beats = []; if (q.length && !popupsOk() && !UI.fast && !QS.get('scn')) { var b0 = q[q.length - 1]; lineSay(b0.title + '. ' + (b0.line || '').split('\n').join(' ')); UI.lastBeat = b0; then && then(); return 0; }
  if (UI.fast || QS.get('scn') || !q.length) { q.forEach(function (b) { UI.lastBeat = b; }); then && then(); return 0; }
  var total = 0; q.forEach(function (b) { b.ms = animMs(Math.max(b.ms || 0, readMs(b.title + ' ' + (b.line || '')))); total += b.ms; });
  UI.hold = Date.now() + total + animMs(1000);
  var el = $('#beat'); if (!el) { el = h('div', { id: 'beat', role: 'status', 'aria-live': 'polite' }); document.body.appendChild(el); el.addEventListener('click', function () { UI.beatSkip && UI.beatSkip(); }); }
  var i = 0;
  (function next() {
    clearTimeout(UI.beatT); if (i >= q.length) { el.classList.remove('on'); UI.beatSkip = null; then && then(); return; }
    var b = q[i++]; UI.lastBeat = b; el.className = 'on ' + b.cls; el.innerHTML = '';
    el.appendChild(h('b', { text: b.title })); if (b.line) b.line.split('\n').forEach(function (ln) { el.appendChild(h('span', { text: ln })); });
    UI.beatSkip = next; UI.beatT = setTimeout(next, b.ms);
  })();
  return total;
}
function rolled(p) { return p.dice[0] + ' and ' + p.dice[1]; }
function dieCan(i) {   /* what die i can do right now without workers: take / build / sell */
  var p = G.P[VB.actor(G)], v = p.dice[i], vm = VB.validMoves(G).filter(function (m) { return m.die === i && !m.w; });
  var o = []; if (vm.some(function (m) { return m.k === 'take'; })) o.push('take a tile from stall ' + v);
  if (vm.some(function (m) { return m.k === 'place'; })) o.push('build a stored tile on a ' + v + '-space');
  if (vm.some(function (m) { return m.k === 'sell'; })) o.push('sell your ' + v + ' goods');
  return o;
}
function me() { return G.P[UI.view]; }
function isHuman(s) { return G.seats[s] && G.seats[s].human; }
function myTurn() { return G && !G.over && isHuman(VB.actor(G)) && !UI.busy && !tvOpen(); }
function tvOpen() { return !$('#tv').hidden; }
function animMs(x) { if (UI.fast) return 0; var k = rivalNow() ? (UI.quick ? 0.15 : 0.55) : 1; try { return Math.round(GX.animMs(x) * k); } catch (e) { return Math.round(x * k); } }
function rivalNow() { try { return !!G && !G.over && !isHuman(VB.actor(G)) && !(UI.mode === 'tutorial' && !UI.tutAi); } catch (e) { return false; } }   /* rival animations run at about half length */
function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
function save() { try { if (G && !G.over && UI.mode === 'quick') localStorage.setItem('vob_save', JSON.stringify(G)); } catch (e) { } }
function hasSave() { try { return !!localStorage.getItem('vob_save'); } catch (e) { return false; } }
function pend() { return G.pend[G.pend.length - 1] || null; }
var DIEF = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

/* best human move among candidates: fewest workers, then the selected die, then the die that matches exactly */
function pick(list) {
  if (!list.length) return null;
  var p = G.P[VB.actor(G)];
  list.sort(function (a, b) { return (a.w || 0) - (b.w || 0) || ((UI.die === b.die) - (UI.die === a.die)) || ((p.dice[a.die] === a.v ? 0 : 1) - (p.dice[b.die] === b.v ? 0 : 1)); });
  return list[0];
}
function movesWhere(f) { return VB.validMoves(G).filter(function (m) { return f(m) && bumpOk(m) && (UI.die == null || m.die === 'x' || m.die == null || m.die === UI.die || (G.P[VB.actor(G)].dice[0] === G.P[VB.actor(G)].dice[1])); }); }

/* ---------------- layout ---------------- */
var L = {};
function layout() {
  var b = $('#bd'), W = b.clientWidth, H = b.clientHeight; if (!W || !H) return;
  var cmp = portraitPhone() && innerHeight <= 700; $('#opp').classList.toggle('cmp', cmp);   /* short portrait phones: score chips only (the dock title and dice row say whose turn and which dice) */
  var tiny = cmp && innerHeight <= 600; L.tiny = tiny;   /* very short phones (375x553): no score strip; the view tabs carry the points */
  var oppH = tiny ? 6 : cmp ? 50 : (H < 420 ? 84 : innerWidth >= 1024 ? 102 : 92) - (hints() ? 0 : innerWidth >= 1024 ? 18 : 14), pad = 6, n = G ? VB.depotSize(G) : 2;
  var wide = W > H * 1.15 && !portraitPhone();   /* a tall dock must not flip a portrait phone into the landscape layout */
  var mk = $('#mk'), es = $('#es'), opp = $('#opp'); mk.classList.toggle('ph', !wide); if (!UI.tab) UI.tab = 'estate'; if (wide || !phoneTabs()) { L.tabs = false; mk.style.display = ''; es.style.display = ''; var t1 = $('#tabs'); if (t1) t1.remove(); var r1 = $('#rv'); if (r1) r1.style.display = 'none'; mk.classList.remove('big'); } var two = !wide && n > 2; mk.classList.toggle('two', two);
  opp.style.cssText = (tiny ? 'display:none;' : '') + 'left:' + pad + 'px;top:' + pad + 'px;right:' + pad + 'px;height:' + (oppH - 6) + 'px';
  if (wide) {   /* market as a 2-column block on the left, estate on the right */
    var mw = Math.min(W * 0.4, 470), cols = 3, rows = 3;
    var hexM = Math.max(30, Math.min(84, Math.floor((mw - 8 * cols) / cols - 10), Math.floor(((H - oppH - pad * 2) / rows - 60) / (n * 1.18))));
    mk.style.cssText = 'left:' + pad + 'px;top:' + oppH + 'px;width:' + mw + 'px;grid-template-columns:repeat(' + cols + ',1fr);--hex:' + hexM + 'px';
    var ew = W - mw - pad * 3, eh = H - oppH - pad;
    L.ex = mw + pad * 2; L.ey = oppH; L.ew = ew; L.eh = eh;
  } else if (phoneTabs()) {   /* phone portrait: one big view at a time (estate / market / rival) behind tabs */
    var tabsY = oppH, top = oppH + 50, avail = H - top - pad; ensureTabs(tabsY, pad);
    mk.style.display = UI.tab === 'market' ? '' : 'none'; es.style.display = UI.tab === 'estate' ? '' : 'none'; var rv = ensureRival(); rv.style.display = UI.tab === 'rival' ? '' : 'none';
    var cw3 = Math.floor((W - pad * 2 - 2 * 6) / 3), hexB = Math.max(40, Math.min(58, Math.floor(cw3 / Math.min(n, 2) - 12), Math.floor((avail - 40) / 3 / (Math.ceil(n / 2) * 1.2 + 0.9))));
    mk.classList.remove('two', 'small'); mk.classList.add('big'); mk.classList.toggle('two', n > 2);
    mk.style.cssText = (UI.tab === 'market' ? '' : 'display:none;') + 'left:' + pad + 'px;top:' + top + 'px;right:' + pad + 'px;grid-template-columns:repeat(3,1fr);gap:6px;--hex:' + hexB + 'px';
    rv.style.cssText = (UI.tab === 'rival' ? '' : 'display:none;') + 'left:' + pad + 'px;top:' + top + 'px;right:' + pad + 'px;height:' + avail + 'px';
    L.ex = pad; L.ey = top; L.ew = W - pad * 2; L.eh = avail; L.tabs = true;
  } else {
    var rowsT = two ? Math.ceil(n / 2) : n, cw = Math.floor((W - pad * 2 - 5 * 4) / 6), hexP = Math.max(24, Math.min(46, Math.floor((two ? cw / 2 - 3 : cw - 10)), Math.floor((H - oppH) * 0.4 / (rowsT * 1.2 + 2.2))));
    var stallH = 26 + rowsT * (hexP * 1.1547 + 3) + 24;
    mk.style.cssText = 'left:' + pad + 'px;top:' + oppH + 'px;right:' + pad + 'px;grid-template-columns:repeat(6,1fr);--hex:' + hexP + 'px'; mk.classList.toggle('small', hexP < 34);
    L.ex = pad; L.ey = oppH + stallH + 6; L.ew = W - pad * 2; L.eh = H - L.ey - pad;
  }
  /* estate hex size: pointy-top, 7 columns, 7 rows => width = 7*sqrt3*s, height = 11*s */
  var s = Math.min(L.ew / (7 * 1.732 + 0.4), L.eh / 11.1);
  L.s = Math.max(14, s);
  es.style.cssText = 'left:' + L.ex + 'px;top:' + L.ey + 'px;width:' + L.ew + 'px;height:' + L.eh + 'px;--hex:' + Math.floor(L.s * 1.732 + 1) + 'px';
}
function cellXY(c, s, w, hgt) { var x = s * 1.732 * (c.q + c.r / 2), y = s * 1.5 * c.r; return { x: w / 2 + x, y: hgt / 2 + y }; }

/* ---------------- render ---------------- */
function render() {
  if (!G) return;
  document.body.classList.toggle('gx-myturn', !!myTurn()); document.body.classList.toggle('gx-selecting', UI.sel != null && !!myTurn());
  renderDock(); layout(); renderBar(); renderOpp(); renderMarket(); fitMarket(); fitEstate(); renderEstate(); renderScores(); fitMarket();   /* the dock first: on phones it is as tall as its rows and the board gets the rest */
  autoZoom();
  if (L.tabs) { ensureTabs(parseInt($('#tabs').style.top, 10) || 50, 6); renderRival(); }
  try { markBest(); } catch (e) { } try { tutStarPaint(); } catch (e) { }
  try { fitLabels(); } catch (e) { }
  try { artApply(); } catch (e) { }
  toastPos();
  try { GXH.phase(myTurn() && !UI.camp || myTurn() ? helpPhase() : null); } catch (e) { }
}
/* every ★ says why (R21): one short reason line under the prompt, also in the tile card and the bulb */
var TWHY = { castle: 'a free action when built', mine: 'pays silver every season', ship: 'loads goods, banner up the track', pas: 'animals score when the region fills', know: 'bends one rule for you',
  hall: 'build one more tile at once', carp: 'then take any Building', chapel: 'then take a Keep, Mine or Lore', mkt: 'then take a Barge or Pasture', inn: 'gives 4 workers', mint: 'gives 2 silver', tower: 'scores 4 points', store: 'sell goods with any die' };
function tileWhy(t) { return t ? (t.t === 'bld' ? TWHY[t.k] : TWHY[t.t]) || 'more land' : ''; }
function starWhy(m) {
  if (!m) return ''; if (m.k === 'end') return 'Nothing better left: end your turn.'; if (m.k === 'skip') return 'Skip: nothing here helps you.';
  var r = sim(m); if (!r) return ''; var s = r.s, pts = 0, sil = 0, wk = 0, what = [];
  r.ev.forEach(function (ev) { if (ev.p !== s) return; if (ev.e === 'score') { pts += ev.n; if (WHY[ev.why] && what.indexOf(WHY[ev.why]) < 0) what.push(WHY[ev.why]); } if (ev.e === 'silver' && ev.n > 0) sil += ev.n; if (ev.e === 'workers' && ev.n > 0) wk += ev.n; });
  var cost = m.w ? ', costs ' + m.w + ' worker' + (m.w > 1 ? 's' : '') : '';
  var gain = (pts ? '+' + pts + ' pts' + (what.length ? ', ' + what.join(', ') : '') : '') + (sil ? (pts ? ', ' : '') + '+' + sil + ' silver' : '');
  if (m.k === 'take' || m.k === 'grab' || m.k === 'buy') {
    var t = m.k === 'buy' ? G.black[m.slot] : G.depots[m.v][m.slot], si = r.G.P[s].store.length - 1;
    var fits = VB.validMoves(r.G).some(function (x) { return x.k === 'place' && x.s === si && !x.w; });
    return (m.k === 'buy' ? 'Buy ' : 'Take ') + VB.tileName(t) + ': ' + tileWhy(t) + cost + '.' + (fits ? ' Fits a space now.' : '');
  }
  if (m.k === 'place') { var q = previewPlace(m), t2 = G.P[s].store[m.s]; return 'Build ' + VB.tileName(t2) + ': ' + (gain || (q ? 'region ' + q.f + ' of ' + q.size + ' filled' : tileWhy(t2))) + (wk ? ', +' + wk + ' workers' : '') + cost + '.'; }
  if (m.k === 'sell') return 'Sell your ' + VB.GOODS[m.v] + ': ' + (gain || 'silver') + cost + '.';
  if (m.k === 'ship') return 'Load these goods: sell them later for points.';
  if (m.k === 'workers') return 'Take workers: change a die by one later.';
  if (m.k === 'discard') return 'Throw away ' + VB.tileName(G.P[s].store[m.s]) + ': least useful now.';
  return gain ? gain + '.' : '';
}
function starLine() { if (!hints() || UI.mode === 'tutorial') return ''; var m = hardMove(); return m ? '★ ' + (m.k === 'end' ? 'End turn: no useful move left. Saves your workers for later.' : starWhy(m)) : ''; }
function tutStarPaint() {   /* Learn to play: exactly one star, always on the coach's target (never a second opinion) */
  if (!G || UI.mode !== 'tutorial') return; var id = null;
  try { var st = GXT.current(), e = st && st.target ? st.target() : null; if (e && e.id && /^(mt-|bl-|ec-|st-|gd-|gs-)/.test(e.id)) id = e.id; } catch (e) { }
  [].slice.call(document.querySelectorAll('.bestt,.bestx,.cell.best')).forEach(function (e) { if (e.id !== id) e.classList.remove('bestt', 'bestx', 'best'); });
  [].slice.call(document.querySelectorAll('.bestb,.bestq')).forEach(function (e) { if (!id || !e.parentElement || e.parentElement.id !== id) e.remove(); });
  var el = id && document.getElementById(id); if (!el) return;
  if (/^ec-/.test(id)) { el.classList.add('best'); return; }
  if (!el.querySelector(':scope > .bestq')) { el.classList.add('bestx'); el.appendChild(h('span.bestq', { text: '★', 'aria-hidden': 'true' })); }
}
/* one ★ on every decision, never only on market picks: the look-ahead move is shown on whatever you tap next
   (stored tile, glowing space, goods, worker swap, crates, Skip, End turn), and on the tab that hides it */
function markBest() {
  document.querySelectorAll('.bestx').forEach(function (e) { e.classList.remove('bestx'); var b = e.querySelector(':scope > .bestq'); if (b) b.remove(); });
  if (!hints() || !myTurn() || UI.busy || UI.mode === 'tutorial') return;
  var m = hardMove(); if (!m) return; var p = G.P[VB.actor(G)], top = pend(), id = null;
  if (m.k === 'take' || m.k === 'grab') id = 'mt-' + m.v + '-' + m.slot;
  else if (m.k === 'buy') id = 'bl-' + m.slot;
  else if (m.k === 'place') { if (UI.sel === m.s || (UI.sel == null && UI.die != null && document.querySelector('#es .cell.best'))) return; id = 'st-' + m.s; }
  else if (m.k === 'discard') id = 'st-' + m.s;
  else if (m.k === 'sell') id = 'gd-' + m.v;
  else if (m.k === 'ship') id = 'gs-' + m.v;
  else if (m.k === 'end') id = 'endB';
  else if (m.k === 'skip') id = 'skipB';
  else if (m.k === 'workers') { if (m.die === 'x') id = 'wkxB'; else { var i0 = !p.used[0] && p.dice[0] === p.dice[m.die] ? 0 : m.die; id = 'wk' + i0;   /* the dock draws one button per unused die value */ } }
  var el = id && document.getElementById(id); if (!el) return;
  var tab = el.closest('#mk') ? 'market' : el.closest('#es') ? 'estate' : null, tb = tab && document.getElementById('tab-' + tab);
  if (tb && !tb.classList.contains('on') && !tb.querySelector('.bestq')) { tb.classList.add('bestx'); tb.appendChild(h('span.bestq', { text: '★', 'aria-hidden': 'true' })); }   /* the ★ sits on a closed tab: that tab wears it too */
  if (el.querySelector('.bestb')) return;   /* the market already wears its ★ Best badge */
  el.classList.add('bestx'); el.appendChild(h('span.bestq', { text: '★', 'aria-hidden': 'true' }));
  el.setAttribute('aria-label', (el.getAttribute('aria-label') || el.textContent) .replace(/, best move$/, '') + ', best move');
}
function renderBar() {
  $('#barstat').textContent = G.over ? 'Game over' : (innerWidth <= 640 ? VB.PHASES[Math.min(G.phase, 4)] + ' ' + (G.phase + 1) + '/' + G.nPhases : VB.PHASES[Math.min(G.phase, 4)] + ' · season ' + (G.phase + 1) + ' of ' + G.nPhases);   /* phones: the short form fits the bar, no clipped text */
}
function renderOpp() {   /* turn tracker (round, whose turn, dice left as tokens) + score chips with points by source */
  var o = $('#opp'); o.innerHTML = ''; o.classList.toggle('clean', !hints()); if (!o.classList.contains('cmp')) o.appendChild(trackerEl());
  var seats = G.n <= 2 ? [UI.view].concat(G.order.filter(function (s) { return s !== UI.view; })) : [UI.view, rivalSeat()];
  var top = Math.max.apply(null, G.P.map(function (p) { return p.vp; })), tie = G.P.filter(function (p) { return p.vp === top; }).length > 1;
  var row = h('div.scl');
  seats.forEach(function (s) {
    var p = G.P[s], now = !G.over && VB.actor(G) === s, lead = p.vp === top && !tie && top > 0, src = srcOf(s);
    var parts = Object.keys(src).filter(function (k) { return src[k] > 0; }).sort(function (a, b) { return src[b] - src[a]; }).map(function (k) { return (SRC_LBL[k] || k) + ' ' + src[k]; });
    row.appendChild(h('button.och' + (now ? '.now' : '') + (lead ? '.lead' : ''), { type: 'button', 'data-seat': s, 'aria-label': G.seats[s].name + ' ' + p.vp + ' points' + (lead ? ', leading' : '') + (parts.length ? ': ' + parts.join(', ') : ''), onclick: function () { showSeat(s); } },
      [h('span.oh', {}, [h('span.ban', { style: 'background:' + VB.SEATCOL[s] }), h('b', { text: G.seats[s].name }), h('span.pts', { text: p.vp + ' pts' }), lead ? h('span.lead', { text: '★ leads' }) : null]),
       hints() ? h('span.why', { text: parts.length ? parts.slice(0, 2).join(', ') + (parts.length > 2 ? ' …' : '') : 'no points yet' }) : null]));
    row.lastChild.title = scoreWhy(s);
  });
  o.appendChild(row);
}
function legalTakeFor(d, slot) {
  var top = pend();
  if (top && top.t === 'grab') return VB.validMoves(G).filter(function (m) { return m.k === 'grab' && m.v === d && m.slot === slot; });
  if (top && top.t !== 'castle') return [];
  return movesWhere(function (m) { return m.k === 'take' && m.v === d && m.slot === slot; });
}
function costTip() {   /* the dark number on a tile has a legend the first time it shows in a game */
  if (UI.costTipDone || UI.mode === 'tutorial' || !myTurn() || (L.tabs && UI.tab !== 'market')) return; UI.costTipDone = true;
  setTimeout(function () { lineSay('A number on a tile = workers it costs to take with your dice.', 4000); }, 50);
}
function renderMarket() {
  var mk = $('#mk'); mk.innerHTML = ''; var mt = myTurn(), top = pend();
  /* free picks glow first: a tile that costs workers keeps its cost badge and still works, it just does not call for the tap */
  var mp = G.P[VB.actor(G)] || me(), fitT = function (t) { try { return VB.placeTargets(mp, t, 0).length > 0; } catch (e) { return true; } };
  var fm = mt && !top ? movesWhere(function (m) { return m.k === 'take' && !m.w; }) : [], freeMk = fm.length > 0, fitMk = fm.some(function (m) { return fitT(G.depots[m.v][m.slot]); });
  for (var d = 1; d <= 6; d++) (function (d) {
    var st = h('div.stall', { 'data-stall': d });
    st.appendChild(h('div.sth', {}, [h('span.pip', { text: d, 'aria-label': 'Stall ' + d })]));
    var tl = h('div.sttiles');
    G.depots[d].forEach(function (t, k) {
      if (!t) { tl.appendChild(h('div.hx.empty', { style: 'background:rgba(255,255,255,.08)', 'aria-hidden': 'true' })); return; }
      var lg = mt ? legalTakeFor(d, k) : [], b = h('button.tilebtn' + (lg.length && (!freeMk || lg.some(function (m) { return !m.w; })) && (!fitMk || fitT(t)) ? '.glow' : ''), { type: 'button', id: 'mt-' + d + '-' + k, 'data-drag': lg.length && !pend() ? 'mtile' : null, 'data-idx': d * 10 + k, 'aria-label': VB.tileName(t) + ' in stall ' + d, onclick: function () { tapMarket(d, k); } }, [hexEl(t)]); labelled(b, t);
      var best = pick(lg.slice()); if (best && best.w) { b.appendChild(h('span.cost', { text: '' + best.w, title: 'Costs ' + best.w + ' worker' + (best.w > 1 ? 's' : '') })); costTip(); }
      if (lg.length && hints() && takeValues().best === 'mt-' + d + '-' + k) { b.classList.add('bestt', 'glow'); b.appendChild(h('span.bestb', { text: '★ Best', title: 'Best pick for you right now' })); }
      tl.appendChild(b);
    });
    st.appendChild(tl);
    var gd = h('div.stgoods' + (mt && top && top.t === 'ship' && G.goodsAt[d].length ? '.glow' : ''), { id: 'gs-' + d });
    G.goodsAt[d].forEach(function (g) { gd.appendChild(h('span.gchip', { text: g, title: VB.GOODS[g], style: 'background-color:' + GCOL[g] })); });
    if (mt && top && top.t === 'ship' && G.goodsAt[d].length) { gd.setAttribute('role', 'button'); gd.setAttribute('tabindex', '0'); gd.setAttribute('aria-label', 'Load goods from stall ' + d); gd.addEventListener('click', function () { doMove({ k: 'ship', v: d }); }); }
    st.appendChild(gd);
    mk.appendChild(st);
  })(d);
  var lane = h('div.stall.lane', { id: 'lane' }); lane.appendChild(h('div.sth', { text: G.noBlack ? 'Closed' : '🪙' + VB.blackCost(G.P[VB.actor(G)] || G.P[0]) }));
  var lt = h('div.sttiles');
  G.black.forEach(function (t, k) {
    if (!t) return; var ok = mt && !top && VB.validMoves(G).some(function (m) { return m.k === 'buy' && m.slot === k; });
    lt.appendChild(h('button.tilebtn' + (ok ? '.glow' : '') + (ok && hints() && takeValues().best === 'bl-' + k ? '.bestt' : ''), { type: 'button', id: 'bl-' + k, 'aria-label': VB.tileName(t) + ' in the back lane', onclick: function () { tapBlack(k); } }, [hexEl(t)]));
    labelled(lt.lastChild, t);
  });
  lane.appendChild(lt); mk.appendChild(lane);
}
function startTab() {   /* a turn opens where the first move is: the Market when nothing in storage can be built yet */
  try { var M = VB.validMoves(G); if (!M.some(function (m) { return m.k === 'place'; }) && M.some(function (m) { return m.k === 'take' && !m.w; })) return 'market'; } catch (e) { }
  return 'estate';
}
function placeTargets() {   /* cells glowing for the selected storage tile */
  if (!myTurn() || (UI.sel == null && (UI.die == null || pend()))) return {};
  var o = {}; VB.validMoves(G).forEach(function (m) { if (m.k === 'place' && bumpOk(m) && (UI.sel == null ? m.die === UI.die : m.s === UI.sel && (UI.die == null || m.die === 'x' || m.die === UI.die))) { var c = o[m.cell]; if (!c || (m.w || 0) < (c.w || 0) || ((m.w || 0) === (c.w || 0) && UI.sel == null && previewPlace(m).val > previewPlace(c).val)) o[m.cell] = m; } });
  return o;
}
function renderEstate(box, seat, s) {
  var es = box || $('#es'), p = G.P[seat == null ? UI.view : seat], S = s || L.s, W = box ? S * 7 * 1.732 + 4 : L.ew, HH = box ? S * 11 : L.eh;
  es.innerHTML = ''; var tg = box ? {} : placeTargets(), pv = {}, bestC = null;
  if (hints()) Object.keys(tg).forEach(function (ci) { var x = previewPlace(tg[ci]); if (!x) return; x.val -= (tg[ci].w || 0) * 0.6; pv[ci] = x; if (bestC == null || x.val > pv[bestC].val) bestC = ci; });
  if (UI.mode === 'tutorial') bestC = null;
  if (hints() && !box) { var hm2 = hardMove(); if (hm2 && hm2.k === 'place' && pv[hm2.cell] && (UI.sel == null || hm2.s === UI.sel)) bestC = String(hm2.cell); }
  if (box) { es.style.width = W + 'px'; es.style.height = HH + 'px'; es.style.setProperty('--hex', Math.floor(S * 1.732 + 1) + 'px'); }
  var host = es; if (!box) { host = h('div', { id: 'esin', style: 'width:' + W + 'px;height:' + HH + 'px' }); es.appendChild(host); camClamp(); camApply(host); }
  var cb = !box && FEEL.combo, freeC = Object.keys(tg).some(function (k) { return !tg[k].w; });
  VB.CELLS.forEach(function (c) {
    var xy = cellXY(c, S, W, HH), t = p.estate[c.i], m = tg[c.i] || (cb && cb[c.i]);
    var b = h((box ? 'div.cell' : 'button.cell') + (t ? '.built' : '') + (m && (!freeC || !m.w || String(c.i) === String(bestC)) ? '.glow' : ''), { type: box ? null : 'button', id: box ? null : 'ec-' + c.i, 'data-ci': c.i, style: 'left:' + xy.x + 'px;top:' + xy.y + 'px', 'aria-label': (t ? VB.tileName(t) : 'Empty ' + VB.COLNAME[c.col] + ' space ' + c.num) + (m ? ', build here' : '') });
    var hx = t ? hexEl(t) : hexEl(null, { col: c.col });
    if (!t && !m) hx.style.filter = 'saturate(.7) brightness(1.1)';
    b.appendChild(hx); b.appendChild(h('span.num' + (c.col === 'castle' || c.col === 'ship' || c.col === 'mine' ? '.lt' : ''), { text: c.num }));
    if (m && m.w) b.appendChild(h('span.cost', { text: '' + m.w }));
    var q = pv[c.i]; if (q) { b.classList.add('pv'); if (String(c.i) === String(bestC)) b.classList.add('best');
      b.appendChild(h('span.pvb' + (q.n ? '.pts' : ''), { text: q.n ? '+' + q.n : q.f + '/' + q.size, title: q.why.join(', ') || 'region ' + q.f + ' of ' + q.size + ' filled' }));
      b.setAttribute('aria-label', b.getAttribute('aria-label') + ': ' + (q.n ? 'scores +' + q.n + ' (' + q.why.join(', ') + ')' : 'region ' + q.f + ' of ' + q.size + ' filled' + (q.why.length ? ', ' + q.why.join(', ') : '')) + (String(c.i) === String(bestC) ? ', best spot' : '')); }
    if (!box) b.addEventListener('click', function () { tapCell(c.i); });
    host.appendChild(b);
  });
  host.insertAdjacentHTML('beforeend', regionSvg(S, W, HH, p));
}
function dockSeat() { var a = VB.actor(G); return G.over ? me() : G.P[isHuman(a) ? a : UI.view]; }
function renderDock() {
  var a = VB.actor(G), p = G.over ? me() : G.P[isHuman(a) ? a : UI.view], top = pend(), mt = myTurn();
  if (!G.over && isHuman(a)) UI.view = a;
  var gc = !G.over && goalChips(), dt = $('#docktitle');
  if (gc) { dt.innerHTML = ''; dt.appendChild(gc); dt.classList.add('goals'); } else dt.classList.remove('goals');
  if (!gc) dt.textContent = G.over ? 'Game over' : isHuman(a) ? 'Your move' : G.seats[a].name + '\'s turn · tap to speed up';
  var pr0 = $('#prompt'); pr0.textContent = UI.note || promptText(); var sl0 = starLine(); if (sl0) pr0.appendChild(h('span.starwhy', { text: sl0 })); pr0.classList.remove('full'); pr0.onclick = function () { pr0.classList.toggle('full'); };   /* short phones clamp the line: tap to read it all */
  var cb = $('#chainb'), ph = portraitPhone(), hd0 = document.querySelector('.gx-dock-head'), rr0 = $('#resrow');   /* portrait phones: silver, workers and the chain note sit in the dock's title row */
  if (ph && cb.parentNode !== hd0) { hd0.insertBefore(cb, dt.nextSibling); hd0.appendChild(rr0); }
  else if (!ph && cb.parentNode === hd0) { var db0 = $('#dockbody'); db0.insertBefore(cb, $('#prompt').nextSibling); $('#dicerow').parentNode.appendChild(rr0); }
  if (UI.chain > 1 && mt) { cb.textContent = 'Chain of ' + UI.chain + (ph ? ': build again' : '. Build again'); cb.classList.add('on'); } else cb.classList.remove('on');
  /* dice */
  var dr = $('#dicerow'); dr.innerHTML = ''; var theirs = !G.over && !isHuman(a);
  dr.classList.toggle('theirs', theirs);
  if (theirs) { dr.appendChild(h('span.dlab', { text: G.seats[a].name + '\'s dice' })); G.P[a].dice.forEach(function (v, i) { dr.appendChild(h('span.die.rv' + (G.P[a].used[i] ? '.used' : ''), { 'aria-label': G.seats[a].name + ' die ' + v + (G.P[a].used[i] ? ' used' : ''), text: v })); }); }
  else p.dice.forEach(function (v, i) {
    var bk = !p.used[i] && bumpOf(i), ev0 = bk ? wrap6(v + bk) : v;
    dr.appendChild(h('button.die' + (p.used[i] ? '.used' : '') + (UI.die === i ? '.sel' : '') + (bk ? '.bumped' : ''), { type: 'button', id: 'die-' + i, 'data-drag': p.used[i] || !mt ? null : 'die', 'data-idx': i, 'aria-label': 'Die ' + ev0 + (bk ? ' (rolled ' + v + ', moved by a worker)' : '') + (p.used[i] ? ' used' : ''), 'aria-pressed': UI.die === i ? 'true' : 'false', onclick: function () { tapDie(i); } }, [h('span', { text: ev0 }), bk ? h('span.bk', { text: (bk > 0 ? '+' : '') + bk }) : null]));
  });
  dr.appendChild(h('span.die.white', { title: 'White die: this round\'s goods went to this stall', 'aria-label': 'White die ' + G.white, text: G.white }));
  /* storage */
  var st = $('#store'); st.innerHTML = '';
  for (var i = 0; i < VB.cap(p); i++) (function (i) {
    var t = p.store[i], slot = h('div.slot' + (UI.sel === i ? '.sel' : ''));
    if (t) {
      var ok = mt && storeLegal(i);
      slot.appendChild(h('button.tilebtn' + (ok ? '.glow' : ''), { type: 'button', id: 'st-' + i, 'data-drag': ok && !(top && top.t === 'discard') ? 'store' : null, 'data-idx': i, 'aria-label': VB.tileName(t) + ' in storage', onclick: function () { tapStore(i); } }, [hexEl(t)]));
      labelled(slot.lastChild, t);
    }
    st.appendChild(slot);
  })(i);
  if (p.store.length > VB.cap(p)) { var t4 = p.store[VB.cap(p)]; st.appendChild(h('div.slot.sel', {}, [h('button.tilebtn.glow', { type: 'button', id: 'st-' + VB.cap(p), onclick: function () { tapStore(VB.cap(p)); }, 'aria-label': VB.tileName(t4) }, [hexEl(t4)])])); }
  /* goods */
  var gd = $('#goods'); gd.innerHTML = '';
  var gt = VB.goodsTypes(p); gd.classList.toggle('many', gt.length >= 4); if (!gt.length) gd.appendChild(h('span.tip', { text: 'No goods' }));
  gt.forEach(function (g) {
    var ok = mt && VB.validMoves(G).some(function (m) { return m.k === 'sell' && m.v === g; });
    gd.appendChild(h('button.gbtn' + (ok ? '.glow' : ''), { type: 'button', id: 'gd-' + g, 'aria-label': p.goods[g] + ' ' + VB.GOODS[g] + ', sell with a ' + g, onclick: function () { tapGoods(g); } }, [h('span.gchip', { text: g, style: 'background-color:' + GCOL[g] }), h('span.gw', {}, [document.createTextNode(String(p.goods[g])), h('span.gn', { text: ' ' + VB.GOODS[g] })])]));
  });
  /* resources */
  var rr = $('#resrow'); rr.innerHTML = '';
  var RESTIP = { silver: 'Silver buys back-lane tiles. 1 point each at the end.', workers: 'Drag a worker onto a die to change it by one.', vp: 'Your points so far.', pos: 'Banner track. Barges move you up and first.' };
  function resTap(k) { return function () { toast(RESTIP[k], 2600); }; }
  rr.appendChild(h('span.res', { id: 'r-silver', title: 'Silver', 'aria-label': RESTIP.silver, onclick: resTap('silver'), 'data-engine': 'dockSeat().silver' }, [h('span.rw', { text: p.silver + ' silver' })]));
  var wl = p.workers - (mt ? bumpUsed() : 0);
  rr.appendChild(h('span.res.meep' + (mt && wl > 0 ? '.can' : ''), { id: 'r-workers', title: 'Workers', 'data-drag': mt && wl > 0 ? 'meeple' : null, 'data-idx': 0, 'aria-label': RESTIP.workers + ' You have ' + wl + '.', onclick: resTap('workers') }, [h('i', { html: MEEPLE }), h('span.rw', { text: wl + (wl === 1 ? ' worker' : ' workers') })]));
  rr.appendChild(h('span.res.vpchip', { id: 'r-vp', title: 'Points', 'aria-label': RESTIP.vp, onclick: resTap('vp') }, [h('span.rw', { text: p.vp + ' pts' })]));
  /* actions */
  var ac = $('#acts'); ac.innerHTML = '';
  if (G.over) { ac.appendChild(h('button.btn', { type: 'button', id: 'resB', text: 'See the result', onclick: showResult })); return; }
  if (!mt) return;
  if (top) {
    if (top.t !== 'discard') ac.appendChild(h('button.btn.alt', { type: 'button', id: 'skipB', text: top.t === 'castle' ? 'Skip it' : 'Skip', onclick: function () { doMove({ k: 'skip' }); } }));
    if (top.t === 'castle') ac.appendChild(h('button.btn.alt', { type: 'button', id: 'wkxB', text: 'Hire 2 workers', onclick: function () { doMove({ k: 'workers', die: 'x', w: 0 }); } }));
    return;
  }
  var seen = {};
  [0, 1].forEach(function (i) { if (p.used[i] || seen[p.dice[i]]) return; seen[p.dice[i]] = 1; ac.appendChild(h('button.btn.alt', { type: 'button', id: 'wk' + i, text: p.dice[i] + ' → ' + (2 + (p.know['wk+1'] ? 1 : 0)) + ' workers', 'aria-label': 'Swap your ' + p.dice[i] + ' for ' + (2 + (p.know['wk+1'] ? 1 : 0)) + ' workers', onclick: function () { doMove(pick(VB.validMoves(G).filter(function (m) { return m.k === 'workers' && m.die === i; }))); } })); });
  if (p.used[0] && p.used[1]) { var eb = h('button.btn', { type: 'button', id: 'endB', text: 'End turn', onclick: function () { doMove({ k: 'end' }); } }); ac.appendChild(eb);
    requestAnimationFrame(function () { try { var r = eb.getBoundingClientRect(); if (r.bottom > innerHeight || r.top < 0) eb.scrollIntoView({ block: 'nearest' }); } catch (e) { } }); }   /* small phones: the dock body scrolls; never leave End turn below the fold */
}
function storeLegal(i) {
  var top = pend();
  if (top && top.t === 'discard') return true;
  return VB.validMoves(G).some(function (m) { return m.k === 'place' && m.s === i && bumpOk(m); });
}
function promptText() {
  if (G.over) return 'Game over. Let\'s count the points.';
  var a = VB.actor(G); if (!isHuman(a)) return UI.cap || G.seats[a].name + ' is thinking...';
  var top = pend(), p = G.P[a];
  if (top) return { castle: 'Your keep gives a free action. Any number works.', hall: 'Moot Hall: build one more tile now, any number.', grab: 'Pick any glowing tile. It is free.', store: 'Granary: sell one kind of goods for free.', ship: 'Barge: tap a glowing stall to load its goods.', discard: 'Storage is full. Tap a tile to throw away.' }[top.t];
  if (UI.sel != null) { try { coach('preview'); } catch (e) { } return hints() ? 'Glowing spaces: +N scores now, 2/5 is region progress.' : 'Put it on a glowing space. Tap it again to cancel.'; }
  if (p.used[0] && p.used[1]) return 'Both dice used. Tap End turn.';
  var sm = UI.die == null && hints() ? hardMove() : null;   /* with hints on, the line names the same move as the star (R21: never two instructions) */
  if (sm && (sm.k === 'take' || sm.k === 'grab') && !sm.w) return 'Drag your ' + sm.v + ' onto stall ' + sm.v + ' to take a tile.';
  if (sm && sm.k === 'sell' && !sm.w) return 'Drag your ' + sm.v + ' onto your ' + sm.v + ' goods to sell.';
  if (sm && sm.k === 'place') return 'Tap a stored tile, then a glowing space.';
  if (sm && sm.k === 'buy') return 'The back lane sells a tile for silver.';
  if (sm && sm.k === 'workers') return 'Swap a die for workers with the buttons below.';
  if (sm && sm.w) return 'Drag a worker onto a die: one up or down.';
  var di = UI.die != null && !p.used[UI.die] ? UI.die : [0, 1].filter(function (i) { return !p.used[i]; }).sort(function (x, y) { return dieCan(y).length - dieCan(x).length; })[0];
  var v = effDie(di), vm = VB.validMoves(G).filter(function (m) { return m.die === di && bumpOk(m) && (bumpOf(di) || !m.w); });
  var tk = vm.some(function (m) { return m.k === 'take'; }), bd = vm.some(function (m) { return m.k === 'place'; }), sl = vm.some(function (m) { return m.k === 'sell'; });
  if (tk && bd) return 'Drag your ' + v + ' to stall ' + v + ', or to a glowing ' + v + '.';
  if (tk) return 'Drag your ' + v + ' onto stall ' + v + ' to take a tile.';
  if (bd) return 'Drag your ' + v + ' onto a glowing ' + v + ' on your estate.';
  if (sl) return 'Drag your ' + v + ' onto your ' + v + ' goods to sell.';
  var any = VB.validMoves(G).some(function (m) { return (m.k === 'take' || m.k === 'place' || m.k === 'sell') && m.w > 0 && m.w <= p.workers; });
  return any ? 'No match. Drag a worker onto a die to change it.' : 'Nothing fits. Swap a die for 2 workers.';
}
function renderScores() {
  var b = $('#scorebody'); if (!b) return; b.innerHTML = '';
  var tb = h('table.rtab'); tb.appendChild(h('tr', {}, ['Player', 'Points', 'Silver', 'Workers', 'Land', 'Track'].map(function (x) { return h('th', { text: x }); })));
  G.order.forEach(function (s) { var p = G.P[s]; tb.appendChild(h('tr', {}, [G.seats[s].name, p.vp, p.silver, p.workers, VB.estateFilled(p) + '/37', p.pos].map(function (x) { return h('td', { text: String(x) }); }))); });
  b.appendChild(tb);
  b.appendChild(h('p.tip', { text: 'Turn order follows the banner track. Barges move you up. Goods still to come this season: ' + (G.rg.filter(Boolean).map(function (g) { return VB.GOODS[g]; }).join(', ') || 'none') + '.' }));
  b.appendChild(h('p.tip', { text: 'Tap a name at the top to see that estate.' }));
}

/* ---------------- big tile view (every tile can be read large) ---------------- */
function showTile(t, acts, note) {
  var tv = $('#tv'); tv.innerHTML = '';
  var c = h('div.card', { role: 'dialog', 'aria-label': VB.tileName(t) });
  var big = hexEl(t, { size: 110 });
  c.appendChild(h('div.tbig', {}, [big, h('div', {}, [h('h2', { text: VB.tileName(t) }), h('p', { text: VB.COLNAME[t.t] })])]));
  plainText(t).forEach(function (ln) { c.appendChild(h('p', { text: ln })); });
  if (note) c.appendChild(h('p.tip', { text: note }));
  var ac = h('div.acts');
  (acts || []).forEach(function (x) { ac.appendChild(h('button.btn' + (x.alt ? '.alt' : ''), { type: 'button', text: x.label, onclick: function () { closeTile(); x.fn(); } })); });
  ac.appendChild(h('button.btn.alt', { type: 'button', id: 'tvClose', text: 'Close', onclick: closeTile }));
  c.appendChild(ac); tv.appendChild(c); tv.hidden = false;
  tv.onclick = function (e) { if (e.target === tv) closeTile(); };
  try { artApply(tv); } catch (e) { }
}
var PLAIN = { 'Take one extra action at once, as if you had a die showing any number you like.': 'Take one extra action now. Any number works.',
  'Take all goods from one market stall, and move 1 step up the banner track.': 'Take all goods from one stall. Move 1 step up the track.',
  'Place one more tile from your storage at once, on any free space of its colour next to your land (any number).': 'Build one more stored tile now. Any number works.',
  'Take a Keep, Mine or Lore tile from a market stall into your storage.': 'Take a Keep, Mine or Lore tile from any stall.',
  'Take a Barge or Pasture tile from a market stall into your storage.': 'Take a Barge or Pasture tile from any stall.',
  'A quarter may not hold two of the same Building.': 'No two of the same building in one region.' };
function plainText(t) { return (VB.tileText(t) || '').split(/(?<=[.!?])\s+(?=[A-Z])/).reduce(function (o, s) { var k = Object.keys(PLAIN).filter(function (x) { return s.indexOf(x) === 0; })[0]; o.push(k ? PLAIN[k] : s); return o; }, []); }
function closeTile() { $('#tv').hidden = true; render(); schedule(); }
function dieLabel(m) { return m.die === 'x' ? 'free' : 'die ' + G.P[VB.actor(G)].dice[m.die] + (m.w ? ', ' + m.w + ' worker' + (m.w > 1 ? 's' : '') : ''); }
function optionsFor(list, verb) {   /* one button per die (cheapest first) */
  var by = {}; list.forEach(function (m) { var k = m.die; if (!by[k] || m.w < by[k].w) by[k] = m; });
  return Object.keys(by).map(function (k) { return by[k]; }).sort(function (a, b) { return a.w - b.w; }).slice(0, 2).map(function (m) { return { label: verb + ' (' + dieLabel(m) + ')', fn: function () { doMove(m); } }; });
}
function needNote(v, kind) {
  var p = G.P[VB.actor(G)]; if (!isHuman(VB.actor(G))) return 'Not your turn yet.';
  var free = p.dice.filter(function (x, i) { return !p.used[i]; });
  if (!free.length) return 'Both dice are used.';
  var c = Math.min.apply(null, free.map(function (x) { return VB.cost(p, x, v, kind); }));
  return 'Needs a ' + v + '. That costs ' + c + ' worker' + (c === 1 ? '' : 's') + ', you have ' + p.workers + '.';
}

/* ---------------- taps ---------------- */
function tutOk(x) { if (typeof GXT === 'undefined' || !GXT.active() || UI.mode !== 'tutorial') return true; return GXT.act(Object.assign({ type: 'tap' }, x)); }
function tapMarket(d, k) {
  var t = G.depots[d][k]; if (!t) return;
  if (!tutOk({ what: 'market', d: d, k: k })) return;
  var lg = myTurn() ? legalTakeFor(d, k) : [], top = pend();
  if (lg.length && top && top.t === 'grab') { showTile(t, [{ label: 'Take it, free', fn: function () { doMove(lg[0]); } }]); return; }
  if (lg.length && top && top.t === 'castle') { showTile(t, [{ label: 'Take it, free', fn: function () { doMove(lg[0]); } }]); return; }
  if (lg.length && hints() && UI.mode !== 'tutorial') { var hmt = hardMove(), mine0 = hmt && (hmt.k === 'take' || hmt.k === 'grab') && hmt.v === d && hmt.slot === k; return showTile(t, optionsFor(lg, 'Take to storage'), mine0 ? '★ ' + starWhy(hmt) : VB.tileName(t) + ': ' + tileWhy(t) + '.' + (hmt ? ' The ★ move is worth more.' : '')); }
  showTile(t, lg.length ? optionsFor(lg, 'Take to storage') : [], lg.length ? null : (myTurn() && !top ? (G.P[VB.actor(G)].store.length >= VB.cap(G.P[VB.actor(G)]) ? 'Storage is full, so you would throw one away. ' : '') + needNote(d, 'take') : null));
}
function tapBlack(k) {
  var t = G.black[k]; if (!t) return; if (!tutOk({ what: 'black', k: k })) return; var ok = myTurn() && !pend() && VB.validMoves(G).some(function (m) { return m.k === 'buy' && m.slot === k; });
  var p = G.P[VB.actor(G)] || me();
  showTile(t, ok ? [{ label: 'Buy for ' + VB.blackCost(p) + ' silver', fn: function () { doMove({ k: 'buy', slot: k }); } }] : [], ok ? 'No die needed. Once per turn.' : (p.bought ? 'You already bought one this turn.' : 'Costs ' + VB.blackCost(p) + ' silver. No die needed.'));
}
function tapStore(i) {
  var p = G.P[VB.actor(G)], t = p.store[i], top = pend(); if (!t) return;
  if (!tutOk({ what: 'store', s: i })) return;
  if (myTurn() && top && top.t === 'discard') { showTile(t, [{ label: 'Throw this away', fn: function () { doMove({ k: 'discard', s: i }); } }]); return; }
  var can = myTurn() && storeLegal(i);
  if (can && (UI.sel === i)) { UI.sel = null; render(); return; }
  if (can) { UI.sel = i; UI.tab = 'estate'; UI.pinTab = null; render(); return; }
  var c = VB.CELLS.filter(function (x) { return x.col === t.t && !p.estate[x.i]; });
  showTile(t, [], !c.length ? 'No empty ' + VB.COLNAME[t.t] + ' space left.' : VB.placeTargets(p, t, 0).length ? 'Goes on a ' + VB.COLNAME[t.t] + ' space touching your land. Use that space\'s number.' : 'No ' + VB.COLNAME[t.t] + ' space touches your land yet.');
}
function tapCell(ci) {
  var p = me(), t = p.estate[ci];
  var tg = placeTargets(); if (tg[ci]) {
    if (!tutOk({ what: 'cell', cell: ci })) return;
    var list = UI.sel == null ? [tg[ci]] : VB.validMoves(G).filter(function (m) { return m.k === 'place' && m.s === UI.sel && m.cell === ci; });
    UI.sel = null; doMove(pick(list)); return;
  }
  if (t) showTile(t, [], t.home ? 'Your castle. Build out from here.' : null);
  else if (UI.sel == null && hints()) toast(VB.COLNAME[VB.CELLS[ci].col] + ' space ' + VB.CELLS[ci].num);
}
function tapGoods(g) {
  var lg = myTurn() ? movesWhere(function (m) { return m.k === 'sell' && m.v === g; }) : [];
  if (!tutOk({ what: 'goods', g: g })) return;
  var p = G.P[VB.actor(G)] || me(), n = p.goods[g] || 0;
  var tv = $('#tv'); tv.innerHTML = '';
  var c = h('div.card', { role: 'dialog', 'aria-label': VB.GOODS[g] });
  c.appendChild(h('h2', { text: n + ' × ' + VB.GOODS[g] }));
  c.appendChild(h('p', { text: 'Sell them all with a ' + g + ': ' + VB.saleVP(G, p, n) + ' points and 1 silver.' }));
  var ac = h('div.acts');
  optionsFor(lg, 'Sell').forEach(function (x) { ac.appendChild(h('button.btn', { type: 'button', text: x.label, onclick: function () { closeTile(); x.fn(); } })); });
  if (!lg.length) c.appendChild(h('p.tip', { text: needNote(g, 'sell') }));
  ac.appendChild(h('button.btn.alt', { type: 'button', id: 'tvClose', text: 'Close', onclick: closeTile })); c.appendChild(ac); tv.appendChild(c); tv.hidden = false;
  tv.onclick = function (e) { if (e.target === tv) closeTile(); };
}
function tapDie(i) { var p = me(); if (p.used[i]) return; if (bumpOf(i)) { delete UI.bump[i]; toast('Worker back.'); render(); return; } UI.die = UI.die === i ? null : i; sfx('take'); render(); }
function showSeat(s) {
  var d = $('#seatbody'); if (!d) return; d.innerHTML = ''; var p = G.P[s];
  d.appendChild(h('p.why', { text: scoreWhy(s) }));
  d.appendChild(h('p', { text: p.vp + ' points, ' + p.silver + ' silver, ' + p.workers + (p.workers === 1 ? ' worker.' : ' workers.') }));
  d.appendChild(h('p', { text: 'Goods: ' + (VB.goodsTypes(p).map(function (g) { return p.goods[g] + ' ' + VB.GOODS[g]; }).join(', ') || 'none') + '.' }));
  d.appendChild(h('p', { text: 'Storage: ' + (p.store.map(VB.tileName).join(', ') || 'empty') }));
  var lore = Object.keys(p.estate).map(function (k) { return p.estate[k]; }).filter(function (t) { return t.t === 'know'; }).map(VB.tileName);
  if (lore.length) d.appendChild(h('p', { text: 'Lore: ' + lore.join(', ') }));
  var box = h('div.minies'); d.appendChild(box);
  var w = Math.min(460, innerWidth - 60); renderEstate(box, s, w / (7 * 1.732 + 0.4));
  GX.drawer('seatd', s === 0 && G.seats[0].human ? 'Your estate' : G.seats[s].name + (/s$/i.test(G.seats[s].name) ? "' estate" : "'s estate")); GX.show('seatd');
}

/* ---------------- moves, animation ---------------- */
function rectOf(id) { var e = document.getElementById(id); if (!e) return null; var r = e.getBoundingClientRect(); return r.width ? r : null; }
function srcFor(m, s) {
  if (FEEL.from && isHuman(s)) { var fr = FEEL.from; FEEL.from = null; return fr; }
  if (m.k === 'take' || m.k === 'grab') return rectOf('mt-' + m.v + '-' + m.slot);
  if (m.k === 'buy') return rectOf('bl-' + m.slot);
  if (m.k === 'place') return s === UI.view ? rectOf('st-' + m.s) : null;
  return null;
}
function fly(from, toId, tile) {
  var to = typeof toId === 'string' ? rectOf(toId) : toId; var ms = animMs(420); if (!from || !to || !ms) return Promise.resolve();
  var e = hexEl(tile, { size: Math.round(from.width) }); e.classList.add('fly');
  e.style.left = from.left + 'px'; e.style.top = from.top + 'px'; document.body.appendChild(e);
  var sc = to.width / from.width;
  requestAnimationFrame(function () { e.style.transform = 'translate(' + (to.left - from.left) + 'px,' + (to.top - from.top) + 'px) scale(' + sc + ')'; });
  return wait(ms + 40).then(function () { e.remove(); });
}
function popAt(r, txt) { if (!r || UI.fast) return; var n = document.querySelectorAll('.popn').length; var e = h('div.popn', { text: txt, style: 'left:' + Math.max(90, Math.min(innerWidth - 90, r.left + r.width / 2)) + 'px;top:' + Math.max(60, r.top - n * 34) + 'px' }); document.body.appendChild(e); setTimeout(function () { e.remove(); }, 4000); }
function ribbon(a, b) {
  if (!a || !b || UI.fast) return; var x1 = a.left + a.width / 2, y1 = a.top + a.height / 2, x2 = b.left + b.width / 2, y2 = b.top + b.height / 2;
  var len = Math.hypot(x2 - x1, y2 - y1), ang = Math.atan2(y2 - y1, x2 - x1);
  var e = h('div.ribbon', { style: 'left:' + x1 + 'px;top:' + y1 + 'px;width:' + len + 'px;--a:' + ang + 'rad' }); document.body.appendChild(e); setTimeout(function () { e.remove(); }, 800);
}
var WHY = { region: 'region full', colour: 'colour finished', animals: 'animals', goods: 'goods sold', tower: 'beacon', lore: 'lore' };
function doMove(m) {
  if (!m || UI.busy) return Promise.resolve();
  var s = VB.actor(G), src = srcFor(m, s), prevCell = UI.lastCell; UI.wasBuild = isHuman(s) && VB.validMoves(G).some(function (x) { return x.k === 'place'; });
  try { if (isHuman(s) && GX.undo) { } } catch (e) { }
  try { if (hints()) rateBefore(m); } catch (e) { }
  var r = VB.performMove(G, m); if (!r.ok) { sfx('bad'); toast('That move is not allowed.'); render(); return Promise.resolve(); }
  r.ev.forEach(function (ev) { if (ev.e === 'score') { srcAdd(ev.p, ev.why, ev.n); srcLogAdd(ev); if (UI.tutAi && ev.p !== 0) { var rt = UI.rvTut = UI.rvTut || { pts: 0, region: 0, colour: 0 }; rt.pts += ev.n; if (ev.why === 'region') rt.region++; if (ev.why === 'colour') rt.colour++; } } });
  if (m.k === 'end' && isHuman(s)) { var rl = UI.mode === 'tutorial' ? { k: 'okay', t: '' } : rateLine(); UI.lastRate = rl; try { coach('turnover'); } catch (e) { } if (hints() && UI.mode !== 'tutorial') beat('Turn over', rl.t, 'turn ' + rl.k); }
  if (UI.die != null && G.P[s].used[UI.die]) UI.die = null;
  if (UI.bump && typeof m.die === 'number' && G.P[s].used[m.die]) delete UI.bump[m.die]; if (m.k === 'end') UI.bump = {};
  UI.busy = true; UI.sel = null;
  if (m.k === 'place') { UI.chain = m.die === 'x' ? UI.chain + 1 : 1; } else if (m.k === 'end') UI.chain = 0;
  if (L.tabs && isHuman(s) && (m.k === 'take' || m.k === 'buy' || m.k === 'grab') && !(typeof GXT !== 'undefined' && GXT.running())) UI.tab = 'estate';
  try { if (UI.mode === 'tutorial' && typeof GXT !== 'undefined' && GXT.active() && isHuman(s)) { GXT.act({ type: 'event', what: m.k }); if (GXT.active()) GXT.act({ type: 'tap', what: 'do-' + m.k }); } } catch (e) { }
  render();
  var chainNow = UI.chain;
  var seq = Promise.resolve();
  r.ev.forEach(function (ev) {
    seq = seq.then(function () {
      if (ev.e === 'take') { sfx('take'); return fly(src, ev.p === UI.view ? 'st-' + (G.P[ev.p].store.indexOf(ev.tile)) : (chipRect(ev.p) || 'opp'), ev.tile); }
      if (ev.e === 'place') {
        sfx(ev.chain ? 'chain' : 'place'); UI.lastCell = ev.cell;
        if (ev.p !== UI.view) { setCap(G.seats[ev.p].name + ' builds ' + aName(ev.tile) + (ev.chain ? ', for free' : '')); return rivalPeek(ev); }
        var dst = 'ec-' + ev.cell, el = document.getElementById(dst); if (el) el.style.visibility = 'hidden';
        if (ev.chain && prevCell != null) ribbon(rectOf('ec-' + prevCell), rectOf(dst));
        var z0 = FEEL.cam.z; if (L.tabs && (UI.autoZ || z0 <= 1.02)) UI.autoZ = 'anim';   /* an animation zoom is not a hand zoom: autoZoom may undo it */
        return (L.tabs ? camTo(ev.cell, Math.max(z0, 1.3)) : camTo(ev.cell)).then(function () { if (!src) src = rectOf('st-0'); return fly(src, rectOf(dst), ev.tile); }).then(function () { buzz(10); if (el) { el.style.visibility = ''; el.animate && el.animate([{ transform: 'translate(-50%,-50%) scale(1.25)' }, { transform: 'translate(-50%,-50%) scale(1)' }], { duration: animMs(260) || 1 }); } if (ev.chain && chainNow > 1) popAt(rectOf(dst), 'Chain of ' + chainNow); if (L.tabs && z0 <= 1.01) setTimeout(function () { if (!(FEEL.drag && FEEL.drag.on)) camReset(true); }, animMs(700)); });
      }
      if (ev.e === 'score') { sfx('score'); var rr = ev.cell != null && ev.p === UI.view ? rectOf('ec-' + ev.cell) : rectOf('r-vp'); if (ev.p !== UI.view) { var pc = UI.peekCell && ev.cell != null ? UI.peekCell.getBoundingClientRect() : null, oc = document.querySelector('.och[data-seat="' + ev.p + '"]'); rr = pc || (oc && oc.getBoundingClientRect()); } var why = '+' + ev.n + ' ' + (WHY[ev.why] || 'points'); if (ev.why === 'region' && ev.cell != null && hints()) { var bz = VB.PHASE_BONUS[Math.min(4, G.phase)]; why += ' (' + (ev.n - bz) + ' size + ' + bz + ' early)'; } if (ev.why === 'region' && ev.cell != null) flashRegion(ev.cell, ev.p); popAt(rr, why); if (ev.p !== UI.view) setCap(G.seats[ev.p].name + ': ' + why); return Promise.all([flyPts(rr, scoreEl(ev.p), '+' + ev.n), wait(UI.quick ? 80 : animMs(ev.why === 'region' ? 900 : 550))]).then(function () { renderOpp(); }); }
      if (ev.e === 'sell') { sfx('sell'); return wait(animMs(200)); }
      if (ev.e === 'die') { return null; }
      if (ev.e === 'end') { sfx('end'); return null; }
      return null;
    });
  });
  return seq.then(function () {
    UI.busy = false; peekOff(); if (L.tabs && m.k === 'end') camReset(true);
    if (m.k === 'end') onTurnChange();
    save(); render(); schedule(); try { coachCheck(m, s, r.ev); } catch (e) { }
    if (G.over) setTimeout(gameOver, Math.max(animMs(500), UI.fast ? 0 : (say.until || 0) - Date.now() + 300));
  });
}
function onTurnChange() {
  if (G.over) return; var a = VB.actor(G);
  if (G.turn % G.n === 0 && G.ti === 0) {
    sfx('dice'); var gd = G.goodsAt[G.white], crate = gd && gd.length ? gd[gd.length - 1] : 0;
    if (G.round === 0 && G.phase > 0) {
      var mines = G.order.map(function (s) { var n = 0; for (var k in G.P[s].estate) if (G.P[s].estate[k].t === 'mine') n++; return G.seats[s].name + ' +' + n; }).join(', ');
      beat(VB.PHASES[G.phase - 1] + ' is over', 'Mines paid silver: ' + mines + '.\nFull regions now +' + VB.PHASE_BONUS[Math.min(4, G.phase)] + ' extra.', 'round', 3000);
    } else if (G.round > 0) beat('Round ' + (G.round + 1) + ' of ' + nRounds(), 'Everyone rolls again.' + (crate ? '\nNew ' + VB.GOODS[crate] + ' crate at stall ' + G.white + '.' : ''), 'round', 2000);
  }
  var humans = G.seats.filter(function (s) { return s.human; }).length;
  if (humans > 1 && isHuman(a) && UI.lastHuman !== a) toast('Pass the device to ' + G.seats[a].name, 2000);
  UI.bump = {}; if (isHuman(a)) { UI.lastHuman = a; UI.quick = false; UI.cap = ''; if (L.tabs && !UI.pinTab) UI.tab = startTab(); }
  beatsRun(turnBanner);
}
function schedule() {
  clearTimeout(UI.aiT); if (!G || G.over || UI.busy || tvOpen()) return;
  var a = VB.actor(G);
  if (isHuman(a)) { try { GX.showDock(); } catch (e) { } return; }
  if (UI.mode === 'tutorial' && typeof GXT !== 'undefined' && GXT.active() && !UI.tutAi) return;
  var dl = UI.fast ? 5 : Math.max(UI.quick ? 60 : (GX.aiDelay ? GX.aiDelay(180) : 180), UI.quick ? 0 : (UI.hold || 0) - Date.now());
  UI.aiT = setTimeout(function () { if (UI.busy || !G || G.over || isHuman(VB.actor(G))) return; aiPlay(VB.aiMove(G)); }, dl);
}

/* ---------------- game start / end ---------------- */
function startGame(o) {
  o = o || {}; clearTimeout(UI.aiT);
  var n = o.n || 2, seats = [];
  for (var i = 0; i < n; i++) seats.push(i === 0 ? { name: o.myName || 'You', human: true } : { name: (o.names && o.names[i]) || VB.SEATNAME[i], human: !!(o.hot && o.hot[i]), ai: o.ai || 'normal', style: o.style || null });
  G = VB.newGame({ n: n, teams: !!o.teams, seed: o.seed, phases: o.phases || 5, rounds: o.rounds, seats: seats, bonus: o.bonus, noBlack: o.noBlack });
  UI.view = 0; UI.sel = null; UI.die = null; UI.chain = 0; UI.busy = false; UI.costTipDone = false; UI.autoZ = null; UI.mode = o.mode || 'quick'; UI.camp = UI.mode === 'story'; UI.lastHuman = -1; UI.moveN = 0; UI.starN = 0;
  $('#start').hidden = true; $('#rs').hidden = true; $('#tv').hidden = true;

  UI.quick = false; UI.cap = ''; UI.pinTab = null; UI.tab = 'estate'; UI.bump = {}; FEEL.cam = { z: 1, x: 0, y: 0 }; save(); render(); musSync(); sfx('dice'); hintSync(); if (UI.mode === 'quick' && !UI.fast && !QS.get('scn')) showGoal(); else { if (UI.mode !== 'quick') toast(VB.PHASES[0] + ' begins', 1600); turnBanner(); } schedule();
}
function resume() { try { G = JSON.parse(localStorage.getItem('vob_save')); } catch (e) { G = null; } if (!G) return showTitle(); UI.mode = 'quick'; UI.camp = false; UI.busy = false; $('#start').hidden = true; render(); musSync(); schedule(); }
function marginLine(won) {   /* the words match the gap: never 'close one' after a 50-point loss */
  var vs = G.P.map(function (p) { return p.vp; }), me = vs[0], others = vs.slice(1), ref = won ? Math.max.apply(null, others) : Math.max.apply(null, vs);
  var n = Math.abs(me - ref), set = won ? VSTORY.quickWin : VSTORY.quickLose, k = n <= 8 ? 'close' : n <= 25 ? 'clear' : 'big';
  if (G.teams) n = Math.abs(G.teamVP[0] - G.teamVP[1]), k = n <= 8 ? 'close' : n <= 25 ? 'clear' : 'big';
  if (n === 0) return won ? 'Tied on points: you win the tie-break.' : 'Tied on points: lost on the tie-break.';
  var line = set[k].replace('N', n + (n === 1 ? ' point' : ' points'));
  if (!won && (UI.moveN || 0) >= 3 && UI.starN / UI.moveN >= 0.5) line = line.replace(/ ?(Follow the ★ Best hint next time\.|Try a gentler rival, or follow ★ Best\.)/, k === 'big' && !G.seats.some(function (x) { return x.ai === 'gentle'; }) ? ' Try a gentler rival, or build toward regions earlier.' : ' Build toward regions earlier next time.');
  return G.seats.some(function (x) { return x.ai === 'gentle'; }) ? line.replace('Try a gentler rival, or follow', 'Follow') : line;
}
function gameOver() { try { localStorage.removeItem('vob_save'); } catch (e) { } musSync(); showResult(); }
function showResult() {
  var rs = $('#rs'); toastOff(); rs.innerHTML = ''; UI.cq = []; clearTimeout(UI.cT); UI.cBusy = false; var gd0 = $('#guide'); if (gd0) gd0.classList.remove('on'); var c = h('div.card', { role: 'dialog', 'aria-label': 'Result' });
  var w = G.winner, you = G.seats.filter(function (s) { return s.human; }).length === 1, won = G.teams ? w % 2 === 0 : w === 0; c.classList.add(won || !you ? 'rwin' : 'rlose'); setTimeout(function () { sfx(won ? 'score' : 'bad'); }, 150);
  c.appendChild(h('div', { 'data-art': won && you ? 'ui-result-win' : 'ui-result-lose', style: 'height:8px' }));
  c.appendChild(h('h2', { text: G.solo ? (won ? 'Every space built. You win.' : 'So close: ' + G.soloFilled + ' of 37 spaces') : G.teams ? (won ? 'Your team wins, ' + G.teamVP[0] + ' to ' + G.teamVP[1] : G.seats[1].name + ' and ' + G.seats[3].name + ' win, ' + G.teamVP[1] + ' to ' + G.teamVP[0]) : you ? (w === 0 ? 'You win!' : G.seats[w].name + ' wins this time') : G.seats[w].name + ' wins' }));
  var tb = h('table.rsrc'), SR = G.rank.map(function (s) { return srcOf(s); });
  tb.appendChild(h('tr', {}, [''].concat(G.rank.map(function (s) { return G.seats[s].name; })).map(function (x) { return h('th', { text: x }); })));
  SRC_ORDER.forEach(function (k) { if (!SR.some(function (o) { return o[k] > 0; })) return; tb.appendChild(h('tr', {}, [h('td', { text: SRC_LBL[k] })].concat(SR.map(function (o) { return h('td', { text: String(o[k] || 0) }); })))); });
  tb.appendChild(h('tr.tot', {}, [h('td', { text: 'Total' })].concat(G.rank.map(function (s) { return h('td', { text: String(G.P[s].vp) }); }))));
  c.appendChild(tb); countUp(tb);
  var p0 = G.P[0]; var pl = function (n, a, b) { return n + ' ' + (n === 1 ? a : b); };
  c.appendChild(h('p.tip', { text: 'You filled ' + pl(p0.stat.regions, 'region', 'regions') + ' and sold ' + pl(p0.stat.sales, 'time', 'times') + '.' }));
  if (UI.mode === 'tutorial') {   /* the final count, rule by rule with your real numbers, then what you have not met yet */
    var e0 = G.P[0].end || {}, ul0 = h('ul.walk');
    [['Points during the game', G.P[0].vpPlay], ['Silver, 1 each (' + G.P[0].silver + ')', e0.silver], ['Unsold goods, 1 each', e0.goods], ['Workers, 1 per 2 (' + G.P[0].workers + ')', e0.workers], ['Lore scrolls', e0.lore]].forEach(function (x) { ul0.appendChild(h('li', { text: x[0] + ': ' + (x[1] || 0) })); });
    ul0.appendChild(h('li', { text: 'Total: ' + G.P[0].vp + '. A tie goes to the emptier estate.' }));
    c.appendChild(h('h3', { text: 'How your score adds up' })); c.appendChild(ul0); UI.seen = UI.seen || {}; UI.seen.final = 1; UI.seen.tie = 1;
    c.appendChild(h('p.voice', {}, [h('b', { text: VSTORY.guide.name + ': ' }), document.createTextNode(won ? VSTORY.tut.result.win : VSTORY.tut.result.lose)]));
    try { GXT.markDone('vale-of-banners'); } catch (e) { }
  }
  var vline = UI.mode === 'tutorial' ? null : G.solo ? (won ? VSTORY.soloWin : VSTORY.soloLose) : UI.camp ? null : marginLine(won);
  if (vline) c.appendChild(h('p.voice', { text: vline }));
  var cd = null; try { cd = UI.camp && GXC.active(); } catch (e) { }
  if (cd) {   /* Story: say which goal decided the chapter and which star goals were met */
    var M = metrics(G), ok0 = false; try { ok0 = !!GXC.isWonNow ? GXC.isWonNow(G, cd) : (M.won && testOk(cd.stars[0].test, M)); } catch (e) { }
    c.appendChild(h('p', { style: 'font-weight:800;margin:8px 0 2px', text: ok0 ? 'Chapter won: ' + cd.goal.text.replace(/\.$/, '') + ' ✓' : 'Not yet: ' + cd.goal.text.replace(/\.$/, '') + ' ✗ (win the game too)' }));
    var ul = h('ul', { style: 'margin:2px 0;padding-left:20px' }); cd.stars.forEach(function (st, i) { var g = testOk(st.test, M); ul.appendChild(h('li', { text: (g ? '★ ' : '☆ ') + st.text + (g ? ', done' : ', not yet') + (i === 0 ? ' (main goal)' : '') })); });
    c.appendChild(ul);
    var lo = !ok0 && VSTORY.storyLose[cd.id]; if (lo) { var who = (CAMPAIGN.cast && CAMPAIGN.cast[lo.who]) || {}; c.appendChild(h('p.voice', {}, [h('b', { text: (who.name || 'Odo') + ': ' }), document.createTextNode(lo.text)])); }
  }
  var ac = h('div.acts', { style: 'display:flex;gap:8px;flex-wrap:wrap;margin-top:10px' });
  if (UI.camp && typeof GXC !== 'undefined' && GXC.active()) ac.appendChild(h('button.btn', { type: 'button', id: 'campfin', text: 'Continue the story', onclick: function () { rs.hidden = true; try { GXC.finish(G); } catch (e) { console.error(e); } } }));
  else if (UI.mode === 'tutorial') { ac.appendChild(h('button.btn', { type: 'button', id: 'realB', text: 'Play a real game', onclick: function () { UI.mode = 'quick'; UI.lastOpts = { n: 2, ai: 'gentle' }; startGame(UI.lastOpts); } })); }
  else ac.appendChild(h('button.btn', { type: 'button', id: 'again', text: 'Play again', onclick: function () { startGame(UI.lastOpts || {}); } }));
  ac.appendChild(h('button.btn.alt', { type: 'button', id: 'lookB', text: 'Look at the board', onclick: function () { rs.hidden = true; } }));
  if (!UI.camp) ac.appendChild(h('button.btn.alt', { type: 'button', id: 'titleB', text: 'Title', onclick: showTitle }));
  c.appendChild(ac); rs.appendChild(c); rs.hidden = false; try { artApply(rs); } catch (e) { }
  try { if (!UI.camp && window.GNS && GNS.result) GNS.result({ game: 'vale-of-banners', mode: 'quick', won: won, score: p0.vp }); } catch (e) { }
}

/* ---------------- title + quick setup ---------------- */
var SET = { n: 2, ai: 'gentle', hot: 0, teams: 0 };
function showTitle() {
  clearTimeout(UI.aiT); try { GXT.stop(); } catch (e) { } try { GXC.close(); } catch (e) { } GX.close && GX.close();
  var st = $('#start'); st.innerHTML = ''; st.hidden = false; $('#rs').hidden = true; $('#tv').hidden = true;
  var c = h('div.tcard');
  c.appendChild(h('h1', { text: 'Vale of Banners' }));
  c.appendChild(h('p.sub', { text: 'Roll two dice. Grab tiles. Build the best estate.' }));
  c.appendChild(h('button.big.btn', { type: 'button', id: 'quickB', 'data-a': 'start', text: '▶ Play', onclick: showSetup }));
  c.appendChild(h('button.btn.sec', { type: 'button', id: 'storyB', text: '📖 Story', onclick: storyOpen }));
  if (hasSave()) c.appendChild(h('button.btn.alt', { type: 'button', id: 'resumeB', text: 'Continue saved game', onclick: resume }));
  c.appendChild(h('button.btn.alt', { type: 'button', id: 'tutB', 'data-a': 'tut', text: (tutDone() ? 'Learn to play' : 'New? Learn to play'), onclick: function () { tutStart(); } }));
  c.appendChild(h('button.btn.alt', { type: 'button', id: 'howB', text: 'How to play', onclick: function () { GX.show('rulesd'); } }));
  st.appendChild(c); try { artApply(st); } catch (e) { } musSync();
}
function showSetup() {
  var st = $('#start'); st.innerHTML = ''; var c = h('div.tcard');
  c.appendChild(h('h1', { text: 'Quick game' }));
  function seg(label, opts, cur, set) {
    var r = h('div.srow', {}, [h('span', { text: label })]), s = h('div.seg');
    opts.forEach(function (o) { s.appendChild(h('button' + (cur === o[0] ? '.on' : '') + (SET.pulse === label + '|' + o[0] ? '.pulse' : ''), { type: 'button', text: o[1], 'aria-pressed': cur === o[0] ? 'true' : 'false', onclick: function () { if (cur === o[0]) { SET.tick = (SET.tick || 0) + 1; SET.note = label + ': ' + o[1] + (SET.tick % 2 ? ' is already chosen. Tap Start.' : ' is chosen. Tap Start to play.'); SET.pulse = label + '|' + o[0]; showSetup(); return; } SET.note = ''; SET.pulse = ''; set(o[0]); showSetup(); } })); });
    r.appendChild(s); return r;
  }
  c.appendChild(seg('Players', [[1, 'Solo'], [2, '2'], [3, '3'], [4, '4']], SET.n, function (v) { SET.n = v; SET.hot = Math.max(0, Math.min(SET.hot, v - 1)); }));
  if (SET.n > 1) {
    c.appendChild(seg('Computer players', [['gentle', 'Gentle'], ['easy', 'Easy'], ['normal', 'Normal'], ['hard', 'Hard']], SET.ai, function (v) { SET.ai = v; }));
    var hs = [[0, 'None']]; for (var i = 1; i < SET.n; i++) hs.push([i, String(i)]);
    c.appendChild(seg('Friends on this device', hs, SET.hot, function (v) { SET.hot = v; }));
    if (SET.n === 4) c.appendChild(seg('Teams', [[0, 'Each alone'], [1, '2 v 2']], SET.teams, function (v) { SET.teams = v; }));
  }
  c.appendChild(h('p.tip', { text: SET.note ? SET.note : SET.n === 1 ? 'Solo: 25 rounds. Fill all 37 spaces to win.' : SET.n === 4 && SET.teams ? 'You and Saffron against Azure and Violet. Partners share everything.' : SET.hot ? 'Pass the device when it tells you to.' : 'You against ' + (SET.n - 1) + ' computer player' + (SET.n > 2 ? 's' : '') + '.' }));
  c.appendChild(h('button.btn.big', { type: 'button', id: 'goB', 'data-a': 'start', text: 'Start', onclick: function () { SET.note = ''; SET.pulse = '';
    var hot = {}, names = {}; for (var k = 1; k <= SET.hot; k++) { hot[k] = true; names[k] = 'Friend ' + k; }
    UI.lastOpts = { n: SET.n, ai: SET.ai, hot: hot, names: names, teams: SET.n === 4 && !!SET.teams }; startGame(UI.lastOpts);
  } }));
  c.appendChild(h('button.btn.alt', { type: 'button', id: 'backB', text: 'Back', onclick: showTitle }));
  st.appendChild(c);
}

/* ---------------- rules / scores / menu drawers ---------------- */
var RULES_HTML = '<div class="rules"><h3>How a turn works</h3><ol class="howturn">' +
  '<li>You roll two dice. Each die does one thing.</li>' +
  '<li><b>Take</b>: drag a die onto the stall with its number.</li>' +
  '<li><b>Build</b>: drag a stored tile onto a glowing space.</li>' +
  '<li>The space must match the tile colour and a die.</li>' +
  '<li>It must also touch land you already built.</li>' +
  '<li>No match? Drag a worker onto a die: one up or down.</li>' +
  '<li>Both dice used? Tap End turn.</li></ol>' +
  '<p>You can also tap instead of dragging. Two fingers zoom the estate.</p>' +
  '<h3>Other things a die can do</h3>' +
  '<ul><li><b>Sell</b>: a die sells all your goods with its number. You get points and 1 silver.</li>' +
  '<li><b>Hire</b>: swap any die for 2 workers.</li>' +
  '<li><b>Back lane</b>: once a turn, buy a tile there for 2 silver. No die needed.</li></ul>' +
  '<p>6 and 1 touch. A worker can turn a 6 into a 1.</p>' +
  '<h3>Tiles</h3><ul><li><b>Keep</b> (dark green): one free action, any number.</li><li><b>Mine</b> (grey): 1 silver after every season.</li>' +
  '<li><b>Lore</b> (yellow): changes one rule for you, all game.</li>' +
  '<li><b>Buildings</b> (tan): work as soon as you build them. No two the same inside one outline. The <b>Moot Hall</b> lets you build again straight away.</li>' +
  '<li><b>Pasture</b> (light green): points for every animal of that kind nearby.</li>' +
  '<li><b>Barge</b> (blue): take one stall\'s goods. Move up the track.</li></ul>' +
  '<h3>Points</h3><p>The light outlines on your estate mark regions. Fill every space in one to score it. Bigger regions pay more: 1 space pays 1, 8 spaces pay 36.</p><p>Season 1 adds 10 extra. Later seasons add 8, 6, 4, 2.</p>' +
  '<p>First to fill every space of one colour gets 5 to 7 points. Second gets 2 to 4.</p>' +
  '<p>Each round the white die puts new goods on its stall.</p>' +
  '<p>At the end: +1 per silver, +1 per unsold crate, +1 per 2 workers, plus lore. Most points wins. A tie goes to the emptier estate.</p>' +
  '<h3>Solo and teams</h3>' +
  '<p><b>Solo</b>: 25 rounds. You win only if you build all 37 spaces. <b>Teams</b> (4 players): partners share silver, workers and goods.</p>' +
  '<h3>Our own changes</h3><ul><li>The estate map and its numbers are ours.</li><li>All tiles come from one shuffled pile.</li><li>The 26 lore tiles are ours.</li><li>A fourth kind of goods does not fit and is lost.</li><li>Goods come from one bag.</li></ul></div>';
function drawers() {
  var r = h('div', { html: RULES_HTML }); GX.drawer('rulesd', 'How to play', r);
  var tr = h('button.btn.alt', { type: 'button', text: 'Play the lesson game', style: 'margin-top:8px', onclick: function () { GX.close(); tutStart(); } }); r.appendChild(tr);
  GX.drawer('scored', 'Scores', h('div', { id: 'scorebody' }));
  GX.drawer('seatd', 'Estate', h('div', { id: 'seatbody' }), true);
  try {
    GX.settings({
      id: 'setd', title: 'Menu',
      game: function (S) {
        S.appendChild(GX.row('This game', [
          h('button.btn.alt', { type: 'button', text: 'Rules', onclick: function () { GX.show('rulesd'); } }),
          h('button.btn.alt', { type: 'button', text: 'Tutorial', onclick: function (e) { var b = e.currentTarget; if (G && !G.over && !b.dataset.sure) { b.dataset.sure = '1'; b.textContent = 'Leave this game? Tap again'; return; } GX.close(); tutStart(); } }),
          h('button.btn.alt', { type: 'button', text: 'Restart', onclick: function () { GX.close(); if (UI.camp && GXC.active()) { var d = GXC.active(); startChapter(d); } else startGame(UI.lastOpts || {}); } }),
          h('button.btn.alt', { type: 'button', text: 'Title', onclick: function () { GX.close(); showTitle(); } })]));
      },
      sound: function (S) {
        S.appendChild(GX.row('Sound', GX.onoff(!UI.mute, function (v) { UI.mute = !v; try { localStorage.setItem('vob_mute', UI.mute ? '1' : '0'); } catch (e) { } musSync(); })));
        S.appendChild(GX.row('Music', [GX.onoff(UI.music, function (v) { UI.music = v; try { localStorage.setItem('vob_music', v ? '1' : '0'); } catch (e) { } musSync(); }), h('button.btn.alt', { type: 'button', text: 'Songs', onclick: function () { try { GXMUS.open(); } catch (e) { } } })], (window.VB_MUSIC || []).length ? null : 'Songs come in a later update.'));
      },
      help: function (S) { try { var w = h('div'); w.innerHTML = GXH.settingsHTML({ rowClass: 'mrow', btnClass: 'btn alt' }); while (w.firstChild) S.appendChild(w.firstChild); } catch (e) { } },
      about: { name: 'Vale of Banners', version: '1.0', text: 'A dice and tiles estate game. Temporary tile icons: game-icons.net (Delapouite, Lorc, Skoll, Willdabeast), CC BY 3.0.' }
    });
  } catch (e) { console.error(e); }
}

/* ---------------- help (coach bubbles + bulb) ---------------- */
function helpPhase() { var t = pend(); if (t) return 'p-' + t.t; if (UI.sel != null) return 'build'; var p = G.P[VB.actor(G)]; return p.used[0] && p.used[1] ? 'end' : 'dice'; }
function helpInit() {
  try {
    GXH.init({ game: 'vale-of-banners', defaultOn: true, avoid: '#acts button,.glow,.och', steps: {
      end: { target: function () { return $('#endB'); }, title: 'Done', text: 'Both dice used. Tap End turn.' },
      'p-castle': { target: function () { return $('#mk'); }, title: 'Free action', text: 'Your keep gives a free action. Any number works.' },
      'p-hall': { target: function () { return $('#store'); }, title: 'Build again', text: 'Moot Hall: build another stored tile now.' },
      'p-ship': { target: function () { return $('#mk'); }, title: 'Barge', text: 'Load all goods from one stall.' }
    }, rules: [{ title: 'Dice', text: 'A die can take, build, sell or hire.' }, { title: 'Regions', text: 'Fill an outlined region. Early pays more.' }] });
    GXH.bulb({ el: '#bulbbtn', suggest: function () {
      if (!myTurn()) return null; var m = hardMove(); if (!m) return null;
      var tgt = m.k === 'take' || m.k === 'grab' ? $('#mt-' + m.v + '-' + m.slot) : m.k === 'place' ? $('#st-' + m.s) : m.k === 'sell' ? $('#gd-' + m.v) : m.k === 'buy' ? $('#bl-' + m.slot) : m.k === 'end' ? $('#endB') : m.k === 'workers' ? $('#acts .btn') : $('#acts');
      return { target: tgt || $('#dock'), why: starWhy(m) || VB.why(G, m) };
    }, rulesFor: helpPhase });
  } catch (e) { console.error(e); }
}

/* ---------------- tutorial: a staged first game ---------------- */
function tutDone() { try { return GXT.isDone('vale-of-banners'); } catch (e) { return false; } }
function tutSetup() {
  UI.seen = {}; UI.cq = []; UI.cBusy = false; UI.coachLog = 0; UI.stacked = 0;
  startGame({ n: 2, seed: 77, phases: 2, rounds: 5, ai: 'easy', mode: 'tutorial', names: { 1: VSTORY.rival.name } });
  G.P[0].arr = 2; G.P[1].arr = 1; G.P[0].workers = 1; G.P[1].workers = 2; G.order = [0, 1]; G.ti = 0;   /* you start, as the first player */
  UI.tut = {}; tutStage(1);
}
/* The tutorial is a guided first game: every core rule in order, one short line and one glowing tap per step (TUT_STEPS).
   Before each of your turns the table is staged (your dice, storage, goods, stalls) so the rule of that step comes up.
   The rival plays real turns in between. After the last step a real game starts. TUTORIAL-COVERAGE.md lists the steps. */
function fromBag(f) { for (var i = 0; i < G.bag.length; i++) if (f(G.bag[i])) return G.bag.splice(i, 1)[0]; return null; }
function fromBagB(f) { var b = G.bagB || []; for (var i = 0; i < b.length; i++) if (f(b[i])) return b.splice(i, 1)[0]; return null; }
function putStall(d, k, f) { var t = fromBag(f); if (!t) return null; var old = G.depots[d][k]; if (old) G.bag.push(old); G.depots[d][k] = t; return t; }
function setStore(fs) { var p = G.P[0]; p.store.forEach(function (t) { G.bag.push(t); }); p.store = []; fs.forEach(function (f) { var t = fromBag(f); if (t) p.store.push(t); }); }
function storeIdx(f) { var s = G.P[0].store; for (var i = 0; i < s.length; i++) if (f(s[i])) return i; return -1; }
function tutStage(n) {   /* stage your next turn so this lesson's rule comes up */
  var p = G.P[0]; p.used = [false, false]; p.bought = false; UI.bump = {}; UI.sel = null; UI.die = null;
  var is = function (t, k) { return function (x) { return x.t === t && (!k || x.k === k); }; };
  if (n === 1) { p.dice = [4, 2]; putStall(4, 0, is('mine')); setStore([]); p.goods = { 3: 2, 1: 1 }; p.silver = 1; }
  if (n === 2) { p.dice = [3, 5]; p.goods = { 3: 2, 1: 1 }; }
  if (n === 3) { p.dice = [1, 3]; putStall(2, 0, is('castle')); setStore([is('pas', 'sheep')]); p.silver = Math.max(2, p.silver); p.workers = Math.max(2, p.workers);
    var hb = fromBagB(is('bld', 'hall')) || fromBag(is('bld', 'hall')); if (hb) { if (G.black[0]) (G.bagB || G.bag).push(G.black[0]); G.black[0] = hb; } }
  if (n === 4) { p.dice = [1, 4]; setStore([is('know'), is('ship')]); var gk = VB.goodsTypes(p); p.goods = {}; gk.slice(0, 1).forEach(function (g) { p.goods[g] = 1; });
    for (var d = 1; d <= 6; d++) if (G.goodsAt[d].length) { UI.tut.gd = d; break; } if (!UI.tut.gd) { UI.tut.gd = 2; G.goodsAt[2] = [4, 5]; } }
  if (n === 5) { p.dice = [5, 3]; setStore([is('castle'), is('bld', 'tower'), is('bld', 'mint')]); putStall(3, 0, is('pas')); }
  render();
}
function rivalThen(n) {   /* real rival turns (captions, banner), then stage your next turn */
  return function () {
    UI.tutAi = true; UI.quick = true; UI.rvTut = { pts: 0, region: 0, colour: 0 };   /* tutorial rival turns run at speed: the lesson waits under 3 s, never 10 s in silence */
    try { toast(G.seats[1].name + ' plays its turns…', 1800); } catch (e) { }
    return new Promise(function (res) {
      schedule();
      (function poll() {
        if (!G || G.over || (n === 'season' && G.phase >= 1 && isHuman(VB.actor(G)) && !UI.busy)) { UI.tutAi = false; res(); return; }
        if (n !== 'season' && isHuman(VB.actor(G)) && !UI.busy) { UI.tutAi = false; if (n) tutStage(n); res(); return; }
        setTimeout(poll, 250);
      })();
    });
  };
}
/* every step: one sentence of 12 words or fewer + one glowing tap. rule = the core rule it teaches (tut-walk.js checks them all). */
function tutSteps() {
  var tapW = function (what, f) { return { type: 'tap', match: function (a) { return a.what === what && (!f || f(a)); } }; };
  var ev = function (what) { return { type: 'event', match: function (a) { return a.what === what; } }; };
  var btn = function (txt) { return function () { var b = [].slice.call(document.querySelectorAll('#tv .acts .btn:not(.alt)')); return b.filter(function (x) { return !txt || x.textContent.indexOf(txt) >= 0; })[0] || null; }; };
  var id = function (s) { return function () { return document.getElementById(typeof s === 'function' ? s() : s); }; };
  var st = function (f) { return function () { var i = storeIdx(f); return i < 0 ? null : document.getElementById('st-' + i); }; };
  var stw = function (f) { return tapW('store', function (a) { return a.s === storeIdx(f); }); };
  var is = function (t, k) { return function (x) { return x.t === t && (!k || x.k === k); }; };
  return [
    { id: 'dice', rule: 'dice', tab: 'estate', say: 'You rolled two dice. Each die is one action.', target: id('dicerow'), wait: null },
    { id: 'goal', rule: 'goal', tab: 'estate', say: 'Build your estate. Most points after five seasons wins.', target: id('es'), wait: null },
    { id: 'take', rule: 'take', tab: 'market', say: 'Your 4 takes a tile from stall 4. Tap the mine.', target: id('mt-4-0'), wait: tapW('market', function (a) { return a.d === 4; }) },
    { id: 'take2', rule: 'take', tab: 'market', say: 'Tap Take. It goes into your storage.', target: btn('Take'), wait: ev('take') },
    { id: 'store', rule: 'storage', tab: 'estate', say: 'Storage holds three tiles. Tap your mine to build it.', target: st(is('mine')), wait: stw(is('mine')) },
    { id: 'build', rule: 'build', tab: 'estate', say: 'Build next to your land: same colour, same number as a die.', target: id('ec-12'), wait: tapW('cell', function (a) { return a.cell === 12; }) },
    { id: 'region', rule: 'region', tab: 'estate', say: 'A full outlined region scores. Early seasons pay a bigger bonus.', target: id('r-vp'), wait: null },
    { id: 'end1', rule: 'end', tab: 'estate', say: 'Both dice used. Tap End turn.', target: id('endB'), wait: ev('end') },
    { id: 'order', rule: 'order', tab: 'estate', say: 'Your rival played. Higher on the banner track plays first.', target: id('opp'), wait: null, ai: rivalThen(2) },
    { id: 'white', rule: 'white', tab: 'market', say: 'Each round the white die puts a goods crate on a stall.', target: function () { return document.getElementById('gs-' + G.white); }, wait: null },
    { id: 'sell', rule: 'sell', tab: 'estate', say: 'Your 3 can sell your kind-3 goods. Tap them.', target: id('gd-3'), wait: tapW('goods', function (a) { return a.g === 3; }) },
    { id: 'sell2', rule: 'sell', tab: 'estate', say: 'Sell all of them: one silver, two points each.', target: btn('Sell'), wait: ev('sell') },
    { id: 'workers', rule: 'workers', tab: 'estate', say: 'Any die can become two workers. Tap your 5.', target: id('wk1'), wait: ev('workers') },
    { id: 'end2', rule: 'end', tab: 'estate', say: 'Tap End turn.', target: id('endB'), wait: ev('end') },
    { id: 'kinds', rule: 'kinds', tab: 'estate', say: 'You can keep at most three kinds of goods.', target: id('goods'), wait: null, ai: rivalThen(3) },
    { id: 'rvscore', rule: 'order', tab: 'estate', say: function () { var r = UI.rvTut || { pts: 0, region: 0, colour: 0 }, nm = String(G.seats[1].name).split(' ')[0], pr = [];
        if (r.region) pr.push(r.region + (r.region > 1 ? ' regions' : ' region')); if (r.colour) pr.push(r.colour + ' colour bonus');
        return r.pts ? nm + ' scored ' + r.pts + (pr.length ? ': ' + pr.join(', ') : '') + '.' : nm + ' has not scored yet.'; }, target: id('opp'), wait: null },
    { id: 'bend', rule: 'bend', tab: 'market', say: 'A worker moves a die one step. Tap the keep.', target: id('mt-2-0'), wait: tapW('market', function (a) { return a.d === 2; }) },
    { id: 'bend2', rule: 'bend', tab: 'market', say: 'Pay one worker: your 1 becomes a 2.', target: btn('die 1'), wait: ev('take') },
    { id: 'wrap', rule: 'wrap', tab: 'estate', say: 'Six and one are neighbours too: a worker turns 6 into 1.', target: id('r-workers'), wait: null },
    { id: 'buy', rule: 'back', tab: 'market', say: 'The back lane costs two silver, no die. Tap it.', target: id('bl-0'), wait: tapW('black', function (a) { return a.k === 0; }) },
    { id: 'buy2', rule: 'back', tab: 'market', say: 'Buy it. Only one back-lane tile per turn.', target: btn('Buy'), wait: ev('buy') },
    { id: 'keep', rule: 'keep', tab: 'estate', say: 'Tap your keep. Keeps give one free action.', target: st(is('castle')), wait: stw(is('castle')) },
    { id: 'keep2', rule: 'keep', tab: 'estate', say: 'Build it on the glowing 3.', target: id('ec-17'), wait: tapW('cell', function (a) { return a.cell === 17; }) },
    { id: 'free', rule: 'keep', tab: 'estate', say: 'Free action, any number: tap your Moot Hall.', target: st(is('bld', 'hall')), wait: stw(is('bld', 'hall')) },
    { id: 'free2', rule: 'building', tab: 'estate', say: 'Build it here. Any number works for a free action.', target: id('ec-11'), wait: tapW('cell', function (a) { return a.cell === 11; }) },
    { id: 'bld', rule: 'building', tab: 'estate', say: 'Buildings act once when built. No two alike per region.', target: id('ec-11'), wait: null },
    { id: 'hall', rule: 'hall', tab: 'estate', say: 'Moot Hall builds one more tile now. Tap your sheep.', target: st(is('pas')), wait: stw(is('pas')) },
    { id: 'pas', rule: 'pasture', tab: 'estate', say: 'Pastures score their animals. Build it on the glow.', target: id('ec-13'), wait: tapW('cell', function (a) { return a.cell === 13; }) },
    { id: 'pas2', rule: 'pasture', tab: 'estate', say: 'Later sheep in this meadow score these sheep again.', target: id('ec-13'), wait: null },
    { id: 'end3', rule: 'end', tab: 'estate', say: 'Tap End turn.', target: id('endB'), wait: ev('end') },
    { id: 'lore', rule: 'lore', tab: 'estate', say: 'Lore tiles bend one rule for you. Tap yours.', target: st(is('know')), wait: stw(is('know')), ai: rivalThen(4) },
    { id: 'lore2', rule: 'lore', tab: 'estate', say: 'Build it on the glowing 1.', target: id('ec-23'), wait: tapW('cell', function (a) { return a.cell === 23; }) },
    { id: 'barge', rule: 'barge', tab: 'estate', say: 'Barges carry goods and move you up the track. Tap it.', target: st(is('ship')), wait: stw(is('ship')) },
    { id: 'barge2', rule: 'barge', tab: 'estate', say: 'Build it on the glowing 4.', target: id('ec-22'), wait: tapW('cell', function (a) { return a.cell === 22; }) },
    { id: 'barge3', rule: 'barge', tab: 'market', say: 'Take every crate from one stall. Tap the glowing crates.', target: function () { return document.querySelector('.stgoods.glow'); }, wait: ev('ship') },
    { id: 'end4', rule: 'end', tab: 'estate', say: 'Tap End turn.', target: id('endB'), wait: ev('end') },
    { id: 'full', rule: 'discard', tab: 'market', say: 'Storage is full. Take this tile anyway with your 3.', target: id('mt-3-0'), wait: tapW('market', function (a) { return a.d === 3; }), ai: rivalThen(5) },
    { id: 'full2', rule: 'discard', tab: 'market', say: 'Tap Take.', target: btn('Take'), wait: ev('take') },
    { id: 'discard', rule: 'discard', tab: 'estate', say: 'Too many tiles: throw one away. Tap the mint.', target: st(is('bld', 'mint')), wait: stw(is('bld', 'mint')) },
    { id: 'discard2', rule: 'discard', tab: 'estate', say: 'Throw it away. Lost tiles score nothing.', target: btn('Throw'), wait: ev('discard') },
    { id: 'colour', rule: 'colour', tab: 'estate', say: 'Tap your keep. It fills every keep space you have.', target: st(is('castle')), wait: stw(is('castle')) },
    { id: 'colour2', rule: 'colour', tab: 'estate', say: 'Build it on the glowing 5 for a colour bonus.', target: id('ec-24'), wait: tapW('cell', function (a) { return a.cell === 24; }) },
    { id: 'colour3', rule: 'colour', tab: 'estate', say: 'First to fill a colour gets 5 points, second gets 2.', target: id('r-vp'), wait: null },
    { id: 'hire', rule: 'keep', tab: 'estate', say: 'Another free action. Take two workers this time.', target: id('wkxB'), wait: ev('workers') },
    { id: 'end5', rule: 'end', tab: 'estate', say: 'Tap End turn.', target: id('endB'), wait: ev('end') },
    { id: 'season', rule: 'season', tab: 'estate', say: 'Five rounds end a season. Each mine pays one silver.', target: id('r-silver'), wait: null, ai: rivalThen('season') },
    { id: 'refill', rule: 'season', tab: 'market', say: 'New season: fresh tiles fill every stall. Crates stay.', target: id('mk'), wait: null },
    { id: 'final', rule: 'final', tab: 'estate', say: 'At the end, silver, goods and worker pairs score one each.', target: id('resrow'), wait: null },
    { id: 'tie', rule: 'tie', tab: 'estate', say: 'A tie goes to the estate with more empty spaces.', target: id('es'), wait: null }
  ];
}

/* Learn to play: the coach bubble never covers the instruction line (#prompt). The shared tutor places a bubble around the glowing target only;
   when that lands on the prompt, slide it to the nearest free spot that touches neither the prompt nor any glowing ring. */
function tutBubFix(b) {
  try {
    if (!b || b.dataset.pfix === (b.style.left + '|' + b.style.top)) return;
    var pr = $('#prompt'); if (!pr) return; var pq = pr.getBoundingClientRect(); if (pq.width < 4 || pq.height < 4) return;
    var br = b.getBoundingClientRect(), W = innerWidth, H = innerHeight, pad = 6;
    function hit(a, c) { return a.left < c.right && a.right > c.left && a.top < c.bottom && a.bottom > c.top; }
    var P = { left: pq.left - 2, right: pq.right + 2, top: pq.top - 2, bottom: pq.bottom + 2 };
    var rings = [].slice.call(document.querySelectorAll('.gxt-ring')).map(function (e) { var r = e.getBoundingClientRect(); return { left: r.left - 8, right: r.right + 8, top: r.top - 8, bottom: r.bottom + 8 }; });
    function ok(c) { if (c.left < pad || c.right > W - pad || c.top < 36 || c.bottom > H - pad) return false; if (hit(c, P)) return false; for (var i = 0; i < rings.length; i++) if (hit(c, rings[i])) return false; return true; }
    var cur = { left: br.left, right: br.right, top: br.top, bottom: br.bottom };
    if (!hit(cur, P)) { b.dataset.pfix = b.style.left + '|' + b.style.top; return; }
    var w = br.width, h = br.height, best = null, bd = 1e9, xs = [br.left, pad, W - w - pad, (W - w) / 2];
    xs.forEach(function (x) { for (var y = 36; y <= H - pad - h; y += 4) { var c = { left: x, right: x + w, top: y, bottom: y + h }; if (!ok(c)) continue; var d = Math.abs(x - br.left) * 0.5 + Math.abs(y - br.top); if (d < bd) { bd = d; best = c; } } });
    if (!best) return;
    b.style.left = Math.round(best.left) + 'px'; b.style.top = Math.round(best.top) + 'px';
    var ring = rings[0], arr = b.querySelector('.gxh-arr');
    if (ring && arr) { var cx = (ring.left + ring.right) / 2, cy = (ring.top + ring.bottom) / 2, sd = best.bottom <= ring.top + 10 ? 'bottom' : best.top >= ring.bottom - 10 ? 'top' : best.right <= ring.left + 10 ? 'right' : 'left';
      b.className = b.className.replace(/\bgxh-a-\w+/g, '').trim() + ' gxh-a-' + sd; arr.style.left = arr.style.top = '';
      if (sd === 'top' || sd === 'bottom') arr.style.left = Math.round(Math.max(14, Math.min(w - 26, cx - best.left - 6))) + 'px'; else arr.style.top = Math.round(Math.max(14, Math.min(h - 26, cy - best.top - 6))) + 'px'; }
    b.dataset.pfix = b.style.left + '|' + b.style.top;
  } catch (e) { }
}
function tutBubWatch() {
  if (tutBubWatch.on || typeof MutationObserver === 'undefined') return; tutBubWatch.on = 1;
  var busy = 0; new MutationObserver(function () { if (busy) return; busy = 1; requestAnimationFrame(function () { try { [].slice.call(document.querySelectorAll('.gxt-bub')).forEach(tutBubFix); } catch (e) { } busy = 0; }); })
    .observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style'] });
}
function tutStart(o) {
  tutBubWatch();
  if (typeof GXT === 'undefined') return;
  $('#start').hidden = true;
  var steps = tutSteps();
  steps.forEach(function (stp) {
    var en0 = stp.onEnter, tab = stp.tab;
    stp.title = '';
    stp.onEnter = function () { if (L.tabs) UI.tab = tab; if (G) render(); if (en0) en0(); };
    stp.ready = function () { if (!G || UI.busy) return false; if (L.tabs && UI.tab !== tab && !G.over && !tvOpen()) { UI.tab = tab; render(); } return true; };
  });
  GXT.start({ game: 'vale-of-banners', story: true, endTitle: VSTORY.endTitle, endText: VSTORY.endText, setup: tutSetup, steps: steps, onDone: function (r) {
    UI.mode = 'quick'; try { GXT.markDone('vale-of-banners'); } catch (e) { }
    if (r && r.choice === 'story') storyOpen(); else { UI.lastOpts = { n: 2, ai: 'gentle' }; startGame(UI.lastOpts); }
  }, onExit: function () { UI.mode = 'quick'; showTitle(); } });
}

/* ---------------- Story (gx-campaign) ---------------- */
function storyOpen() { $('#start').hidden = true; try { GXC.open(); } catch (e) { console.error(e); showTitle(); } }
function startChapter(def) {
  var tw = def.twist, bonus = {}, setup = def.setup || {}, o = def.opponent || {};
  if (tw) {
    if (tw.id === 'boss-silver') bonus[1] = { silver: tw.param || 0 };
    if (tw.id === 'boss-workers') bonus[1] = { workers: tw.param || 0 };
    if (tw.id === 'boss-vp') bonus[1] = { vp: tw.param || 0 };
    if (tw.id === 'boss-first') bonus[1] = { first: true };
    if (tw.id === 'you-workers') bonus[0] = { workers: -(tw.param || 1) };
  }
  var n = setup.players || 2, names = {}; for (var i = 1; i < n; i++) names[i] = i === 1 ? o.name : VB.SEATNAME[i];
  UI.lastOpts = { n: n, phases: setup.phases || 5, ai: o.aiLevel || 'normal', style: o.aiStyle || null, names: names, bonus: bonus, noBlack: tw && tw.id === 'no-black', mode: 'story', hints: !!def.hints };
  startGame(UI.lastOpts);
}
function metrics(G) {
  var p = G.P[0], best = 0; G.P.forEach(function (q, i) { if (i) best = Math.max(best, q.vp); });
  return { won: G.winner === 0, score: p.vp, margin: p.vp - best, regions: p.stat.regions, land: VB.estateFilled(p), sales: p.stat.sales, chain: p.stat.chain, silver: p.silver, winSales: G.winner === 0 ? p.stat.sales : 0, winChain: G.winner === 0 ? p.stat.chain : 0 };
}
function testOk(t, M) { if (!t) return true; var v = M[t.k], op = t.op || '>=', x = t.v; if (x == null) return !!v; return op === '>=' ? v >= x : op === '<=' ? v <= x : op === '>' ? v > x : op === '<' ? v < x : v === x; }

/* live chapter goals: chips in the dock title row (Story only), with counters */
var GSHORT = { won: 'Win', sales: 'Sold', land: 'Built', score: 'Score', chain: 'Chain', regions: 'Regions', margin: 'Lead', winSales: 'Sold', winChain: 'Chain' };
function goalChips() {
  var d = null; try { d = UI.camp && GXC.active(); } catch (e) { } if (!d || !G) return null;
  var M = metrics(G), wrap = h('span.gchips', { 'aria-label': 'Chapter goals' });
  d.stars.forEach(function (s, i) {
    var t = s.test, cur = M[t.k], ok = testOk(t, M), lab = GSHORT[t.k] || 'Goal', txt;
    if (t.k === 'won') txt = ok ? 'Winning' : 'Behind'; else { txt = lab + ' ' + Math.max(cur, t.k === 'margin' ? -99 : 0) + '/' + t.v; if (t.k === 'winSales' || t.k === 'winChain') { M = metrics(G); txt = lab + ' ' + (t.k === 'winSales' ? M.sales : M.chain) + '/' + t.v + ' + win'; } }
    var okNow = (t.k === 'winSales' || t.k === 'winChain') ? (M[t.k === 'winSales' ? 'sales' : 'chain'] >= t.v && M.margin > 0) : ok;
    wrap.appendChild(h('span.gchip' + (okNow ? '.ok' : '') + (i === 0 ? '.main' : ''), { title: (i === 0 ? 'Chapter goal: ' : 'Star goal: ') + s.text, text: (okNow ? '✓ ' : (i === 0 ? '◆ ' : '☆ ')) + txt }));
  });
  return wrap;
}
function storyInit() {
  try {
    GXC.init({
      game: 'vale-of-banners', data: window.CAMPAIGN, startChapter: startChapter,
      isWon: function (G, def) { var M = metrics(G), g = def.goal || {}; var base = g.winNotNeeded ? true : M.won;
        /* ONE rule for every chapter: you must win the game AND meet the chapter goal (= first star) */
        if (g.type === 'score') return M.won && M.score >= g.value; if (g.type === 'margin') return M.won && M.margin >= g.value;
        return M.won && testOk(def.stars[0].test, M); },
      metrics: metrics,
      portrait: function (who) { var st = String(who || ''); if (st.indexOf('portrait-') !== 0 && st.indexOf('boss-') !== 0) st = 'portrait-' + st; return ART.img[st] ? 'media/' + st + '.webp' : null; },
      onExit: function () { showTitle(); },
      scores: function (G) { return G.P.map(function (p) { return p.vp; }); },
      seats: function (G) { return G.seats.map(function (s, i) { return { name: s.name, me: i === 0, ai: s.human ? null : s.ai }; }); },
      headButtons: function () { var b = document.createElement('button'); b.type = 'button'; b.className = 'gxc-ib'; b.textContent = 'Tutorial'; b.addEventListener('click', function () { GXC.close(); tutStart(); }); return [b]; }
    });
  } catch (e) { console.error(e); }
}

/* ---------------- boot ---------------- */
function boot() {
  GX.init({ key: 'vob' });
  drawers(); helpInit(); storyInit(); musicInit(); feelInit();
  var ht = $('#hintT'); if (ht) ht.addEventListener('click', hintToggle); hintSync();
  setInterval(function () { if (G && UI.mode === 'tutorial') { try { tutStarPaint(); } catch (e) { } } }, 250);   /* steps change without a render */
  GX.onResize(function () { if (G) render(); });
  addEventListener('resize', function () { if (G) render(); });
  try { artLoad(); } catch (e) { }
  /* Story map: a tap on any chapter or head button always answers (locked chapters say why) */
  document.addEventListener('click', function (e) {
    var n = e.target.closest && e.target.closest('.gxc-node,.gxc-ib'); if (!n) return;
    var lab = n.getAttribute('aria-label') || n.textContent || ''; n.setAttribute('data-tapped', '1');
    setTimeout(function () { var m = [].slice.call(document.querySelectorAll('.gxc-node,.gxc-ib')).filter(function (x) { return x.getAttribute('aria-label') === lab || x.textContent === n.textContent; })[0]; if (m) m.setAttribute('data-tapped', String(Date.now() % 100000)); }, 80);
    setTimeout(function () { toast(/lock/i.test(lab) || n.disabled || n.classList.contains('locked') ? 'Win the previous chapter to open this one' : lab.split(',')[0].trim()); }, 30);
  }, true);
  document.addEventListener('pointerdown', function () { try { GA.unlock(); } catch (e) { } musSync(); }, { once: true });
  document.addEventListener('pointerdown', function () { if (typeof G !== 'undefined' && G && !G.over && !isHuman(VB.actor(G)) && !UI.quick) { UI.quick = true; } }, true);
  if (window.GXS && GXS.on) return;   /* a scenario builds its own state */
  G = null; showTitle();
  if (!tutDone() && !hasSave()) { try { var st = GXT.status('vale-of-banners'); if (!st.seen) { $('#tutB') && $('#tutB').classList.add('glow'); } } catch (e) { } }
}
UI.forceEnd = function () { VB.forceEnd(G); render(); gameOver(); };
UI.redraw = function () { if (G) render(); };
window.startGame = startGame; window.showResult = showResult;
boot();
