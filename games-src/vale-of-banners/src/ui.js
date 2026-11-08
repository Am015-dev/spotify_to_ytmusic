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
try { UI.hintsOn = localStorage.getItem('vob_hints') === '1'; } catch (e) { UI.hintsOn = false; }
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
function labelled(b, t) { b.appendChild(h('span.tlab', { text: tlabel(t), 'aria-hidden': 'true' })); b.classList.add('lab'); return b; }
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
  var pr = $('#prompt'); if (!pr) return; UI.note = msg; pr.textContent = msg; pr.classList.add('note'); clearTimeout(lineSay.t);
  lineSay.t = setTimeout(function () { UI.note = null; pr.classList.remove('note'); if (G) pr.textContent = promptText(); }, Math.max(ms || 0, readMs(msg)));
}
function readMs(txt) { return 4000 + 100 * String(txt || '').split(/\s+/).length; }   /* owner: a message stays 4 s + 1 s per 10 words */
function countUp(tb) {   /* totals tick up from 0 so the result lands as a beat (instant with fast / reduced motion) */
  if (UI.fast || document.documentElement.classList.contains('gx-reduce')) return;
  [].slice.call(tb.querySelectorAll('td:last-child')).forEach(function (td) { var n = +td.textContent, t0 = Date.now(); td.textContent = '0'; (function f() { var k = Math.min(1, (Date.now() - t0) / 900); td.textContent = String(Math.round(n * k)); if (k < 1) requestAnimationFrame(f); })(); });
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
  UI.cBusy = true; say(t); UI.cT = setTimeout(function () { UI.cBusy = false; coachPump(); }, UI.fast ? 0 : readMs(VSTORY.guide.name + ' ' + t) + 900);
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
function stepMs() { return UI.fast ? 0 : UI.quick ? 160 : animMs(800); }
function turnBanner() {
  if (!G || G.over) return; var a = VB.actor(G), hu = G.seats.filter(function (s) { return s.human; }).length;
  var txt = isHuman(a) ? (hu > 1 ? G.seats[a].name + ', your turn' : 'Your turn') : G.seats[a].name + '\'s turn';
  var b = $('#tbanner'); if (!b) { b = h('div', { id: 'tbanner', 'aria-hidden': 'true' }); document.body.appendChild(b); }
  b.innerHTML = ''; b.appendChild(h('span', { text: txt })); b.appendChild(h('span.rds', {}, G.P[a].dice.map(function (v) { return h('span.rd', { text: v }); }))); b.style.setProperty('--sc', VB.SEATCOL[a] || '#2a2014');
  UI.hold = UI.fast ? 0 : Date.now() + animMs(1000);
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
var SRC_LBL = { region: 'regions', colour: 'colours', animals: 'animals', goods: 'goods', tower: 'tower', lore: 'lore', other: 'mines & lore', end: 'end count' };
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
function srcOf(s) {
  var o = Object.assign({}, (G.src && G.src[s]) || {}), sum = 0; for (var k in o) sum += o[k];
  var rest = G.P[s].vp - sum; if (rest > 0) o[G.over ? 'end' : 'other'] = rest; return o;
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
function pvReset() { if (PV.key !== pvKey()) PV = { key: pvKey(), base: VB.evalSeat(G, VB.actor(G)), cell: {}, take: null }; return PV; }
function previewPlace(m) {   /* points this build adds right now, region progress, and its value for the best-spot star */
  var P0 = pvReset(), k = m.cell + '/' + m.s + '/' + m.die; if (P0.cell[k]) return P0.cell[k];
  var r = sim(m); if (!r) return null; var n = 0, why = [];
  r.ev.forEach(function (ev) { if (ev.p !== r.s) return; if (ev.e === 'score') { n += ev.n; why.push('+' + ev.n + ' ' + (WHY[ev.why] || 'points')); } if (ev.e === 'silver') why.push('+' + ev.n + ' silver'); if (ev.e === 'workers') why.push('+' + ev.n + ' workers'); if (ev.e === 'track') why.push('banner up the track'); });
  var t = G.P[r.s].store[m.s]; if (t && t.t === 'castle') why.push('a free extra action'); if (t && t.t === 'bld' && t.k === 'hall') why.push('a free extra build');
  var reg = VB.REGIONS[VB.CELLS[m.cell].reg], f = reg.cells.filter(function (x) { return r.G.P[r.s].estate[x]; }).length;
  return (P0.cell[k] = { n: n, why: why, f: f, size: reg.cells.length, val: VB.evalSeat(r.G, r.s) - P0.base });
}
function takeValues() {   /* value of every legal take for the best-pick badge */
  var P0 = pvReset(); if (P0.take) return P0.take; var o = {}, best = null;
  VB.validMoves(G).forEach(function (m) { if (m.k !== 'take' && m.k !== 'grab' && m.k !== 'buy') return; if (UI.die != null && m.die != null && m.die !== UI.die) return; var id = m.k === 'buy' ? 'bl-' + m.slot : 'mt-' + m.v + '-' + m.slot, v = valOf(m, P0.base) - (m.w || 0) * 0.6; if (o[id] == null || v > o[id]) o[id] = v; });
  for (var id in o) if (best == null || o[id] > o[best]) best = id;
  return (P0.take = { v: o, best: best });
}
/* move rating: every action of a human turn is compared with the greedy best action at that moment */
function rateBefore(m) {
  if (!myTurn() || m.k === 'end' || m.k === 'skip' || m.k === 'discard') return;
  var s = VB.actor(G), base = VB.evalSeat(G, s), best = -99, bm = null, got = valOf(m, base);
  VB.validMoves(G).forEach(function (x) { if (x.k === 'end' || x.k === 'skip') return; var v = valOf(x, base); if (v > best) { best = v; bm = x; } });
  var R = UI.rate = UI.rate || { got: 0, best: 0, miss: 0, alt: '' };
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
function animMs(x) { if (UI.fast) return 0; try { return GX.animMs(x); } catch (e) { return x; } }
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
  var oppH = (H < 420 ? 84 : innerWidth >= 1024 ? 102 : 92) - (hints() ? 0 : innerWidth >= 1024 ? 18 : 14), pad = 6, n = G ? VB.depotSize(G) : 2;
  var wide = W > H * 1.15;
  var mk = $('#mk'), es = $('#es'), opp = $('#opp'); mk.classList.toggle('ph', !wide); if (!UI.tab) UI.tab = 'estate'; if (wide || !phoneTabs()) { L.tabs = false; mk.style.display = ''; es.style.display = ''; var t1 = $('#tabs'); if (t1) t1.remove(); var r1 = $('#rv'); if (r1) r1.style.display = 'none'; mk.classList.remove('big'); } var two = !wide && n > 2; mk.classList.toggle('two', two);
  opp.style.cssText = 'left:' + pad + 'px;top:' + pad + 'px;right:' + pad + 'px;height:' + (oppH - 6) + 'px';
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
function phoneTabs() { var b = $('#bd'); return b.clientWidth <= 640 && b.clientWidth <= b.clientHeight * 1.15; }
function ensureTabs(y, pad) {
  var t = $('#tabs'); if (!t) { t = h('div', { id: 'tabs', role: 'tablist' }); $('#bd').appendChild(t); }
  t.style.cssText = 'left:' + pad + 'px;right:' + pad + 'px;top:' + y + 'px';
  var mt = myTurn(), mkHas = mt && !!document.querySelector('#mk .glow'), rvName = G ? G.seats[rivalSeat()].name : 'Rival';
  t.innerHTML = '';
  [['estate', 'Your estate'], ['market', 'Market'], ['rival', rvName]].forEach(function (x) {
    var on = UI.tab === x[0], has = x[0] === 'market' ? mkHas : x[0] === 'estate' ? (mt && UI.sel != null) : false;
    t.appendChild(h('button.tab' + (on ? '.on' : '') + (has && !on ? '.has' : ''), { type: 'button', id: 'tab-' + x[0], role: 'tab', 'aria-selected': on ? 'true' : 'false', text: x[1], onclick: function () { UI.tab = x[0]; UI.pinTab = null; render(); } }));
  });
}
function rivalSeat() { if (!G) return 1; var best = -1, bs = 1; for (var i = 0; i < G.n; i++) if (i !== UI.view && G.P[i].vp > best) { best = G.P[i].vp; bs = i; } return G.n === 1 ? 0 : bs; }
function ensureRival() { var r = $('#rv'); if (!r) { r = h('div', { id: 'rv', role: 'group', 'aria-label': 'Rival estate' }); $('#bd').appendChild(r); } return r; }
function renderRival() {
  var r = ensureRival(); if (!L.tabs || UI.tab !== 'rival') return; r.innerHTML = ''; var s = rivalSeat(), p = G.P[s];
  r.appendChild(h('div.rvh', { text: G.seats[s].name + ': ' + p.vp + ' points · ' + p.silver + ' silver · ' + p.workers + ' workers' + (G.n > 2 ? ' (tap a name above for the others)' : '') }));
  var box = h('div.minies'); r.appendChild(box); var hh = r.clientHeight - 40, w = r.clientWidth;
  var S = Math.min(w / (7 * 1.732 + 0.4), hh / 11.1); renderEstate(box, s, S);
}
function fitEstate() {   /* phone: the estate takes what the market leaves */
  var b = $('#bd'), mk = $('#mk'), W = b.clientWidth, H = b.clientHeight; if (W > H * 1.15) return;
  if (phoneTabs()) { L.s = Math.max(12, Math.min(L.ew / (7 * 1.732 + 0.4), L.eh / 11.1)); $('#es').style.cssText = (UI.tab === 'estate' ? '' : 'display:none;') + 'left:' + L.ex + 'px;top:' + L.ey + 'px;width:' + L.ew + 'px;height:' + L.eh + 'px;--hex:' + Math.floor(L.s * 1.732 + 1) + 'px'; return; }
  L.tabs = false; var t0 = $('#tabs'); if (t0) t0.remove(); var r0 = $('#rv'); if (r0) r0.style.display = 'none'; mk.classList.remove('big'); $('#es').style.display = '';
  L.ey = mk.offsetTop + mk.offsetHeight + 4; L.eh = Math.max(80, H - L.ey - 4);
  L.s = Math.max(12, Math.min(L.ew / (7 * 1.732 + 0.4), L.eh / 11.1));
  $('#es').style.cssText = 'left:' + L.ex + 'px;top:' + L.ey + 'px;width:' + L.ew + 'px;height:' + L.eh + 'px;--hex:' + Math.floor(L.s * 1.732 + 1) + 'px';
}
function cellXY(c, s, w, hgt) { var x = s * 1.732 * (c.q + c.r / 2), y = s * 1.5 * c.r; return { x: w / 2 + x, y: hgt / 2 + y }; }

/* ---------------- render ---------------- */
function render() {
  if (!G) return;
  document.body.classList.toggle('gx-myturn', !!myTurn()); document.body.classList.toggle('gx-selecting', UI.sel != null && !!myTurn());
  layout(); renderBar(); renderOpp(); renderMarket(); fitEstate(); renderEstate(); renderDock(); renderScores();
  if (L.tabs) { ensureTabs(parseInt($('#tabs').style.top, 10) || 50, 6); renderRival(); }
  try { artApply(); } catch (e) { }
  toastPos();
  try { GXH.phase(myTurn() && !UI.camp || myTurn() ? helpPhase() : null); } catch (e) { }
}
function renderBar() {
  $('#barstat').textContent = G.over ? 'Game over' : VB.PHASES[Math.min(G.phase, 4)] + ' · season ' + (G.phase + 1) + ' of ' + G.nPhases;
}
function renderOpp() {   /* turn tracker (round, whose turn, dice left as tokens) + score chips with points by source */
  var o = $('#opp'); o.innerHTML = ''; o.classList.toggle('clean', !hints()); o.appendChild(trackerEl());
  var seats = G.n <= 2 ? [UI.view].concat(G.order.filter(function (s) { return s !== UI.view; })) : [UI.view, rivalSeat()];
  var top = Math.max.apply(null, G.P.map(function (p) { return p.vp; })), tie = G.P.filter(function (p) { return p.vp === top; }).length > 1;
  var row = h('div.scl');
  seats.forEach(function (s) {
    var p = G.P[s], now = !G.over && VB.actor(G) === s, lead = p.vp === top && !tie && top > 0, src = srcOf(s);
    var parts = Object.keys(src).filter(function (k) { return src[k] > 0; }).sort(function (a, b) { return src[b] - src[a]; }).map(function (k) { return (SRC_LBL[k] || k) + ' ' + src[k]; });
    row.appendChild(h('button.och' + (now ? '.now' : '') + (lead ? '.lead' : ''), { type: 'button', 'data-seat': s, 'aria-label': G.seats[s].name + ' ' + p.vp + ' points' + (lead ? ', leading' : '') + (parts.length ? ': ' + parts.join(', ') : ''), onclick: function () { showSeat(s); } },
      [h('span.oh', {}, [h('span.ban', { style: 'background:' + VB.SEATCOL[s] }), h('b', { text: G.seats[s].name }), h('span.pts', { text: p.vp + ' pts' }), lead ? h('span.lead', { text: '★ leads' }) : null]),
       hints() ? h('span.why', { text: parts.length ? parts.join(' · ') : 'no points yet' }) : null]));
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
function renderMarket() {
  var mk = $('#mk'); mk.innerHTML = ''; var mt = myTurn(), top = pend();
  for (var d = 1; d <= 6; d++) (function (d) {
    var st = h('div.stall', { 'data-stall': d });
    st.appendChild(h('div.sth', {}, [h('span.pip', { text: d, 'aria-label': 'Stall ' + d })]));
    var tl = h('div.sttiles');
    G.depots[d].forEach(function (t, k) {
      if (!t) { tl.appendChild(h('div.hx.empty', { style: 'background:rgba(255,255,255,.08)', 'aria-hidden': 'true' })); return; }
      var lg = mt ? legalTakeFor(d, k) : [], b = h('button.tilebtn' + (lg.length ? '.glow' : ''), { type: 'button', id: 'mt-' + d + '-' + k, 'aria-label': VB.tileName(t) + ' in stall ' + d, onclick: function () { tapMarket(d, k); } }, [hexEl(t)]); labelled(b, t);
      var best = pick(lg.slice()); if (best && best.w) b.appendChild(h('span.cost', { text: '' + best.w, title: 'Costs ' + best.w + ' worker' + (best.w > 1 ? 's' : '') }));
      if (lg.length && hints() && takeValues().best === 'mt-' + d + '-' + k) { b.classList.add('bestt'); b.appendChild(h('span.bestb', { text: '★ Best', title: 'Best pick for you right now' })); }
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
function placeTargets() {   /* cells glowing for the selected storage tile */
  if (!myTurn() || (UI.sel == null && (UI.die == null || pend()))) return {};
  var o = {}; VB.validMoves(G).forEach(function (m) { if (m.k === 'place' && bumpOk(m) && (UI.sel == null ? m.die === UI.die : m.s === UI.sel && (UI.die == null || m.die === 'x' || m.die === UI.die))) { var c = o[m.cell]; if (!c || (m.w || 0) < (c.w || 0) || ((m.w || 0) === (c.w || 0) && UI.sel == null && previewPlace(m).val > previewPlace(c).val)) o[m.cell] = m; } });
  return o;
}
function renderEstate(box, seat, s) {
  var es = box || $('#es'), p = G.P[seat == null ? UI.view : seat], S = s || L.s, W = box ? S * 7 * 1.732 + 4 : L.ew, HH = box ? S * 11 : L.eh;
  es.innerHTML = ''; var tg = box ? {} : placeTargets(), pv = {}, bestC = null;
  if (hints()) Object.keys(tg).forEach(function (ci) { var x = previewPlace(tg[ci]); if (!x) return; x.val -= (tg[ci].w || 0) * 0.6; pv[ci] = x; if (bestC == null || x.val > pv[bestC].val) bestC = ci; });
  if (box) { es.style.width = W + 'px'; es.style.height = HH + 'px'; es.style.setProperty('--hex', Math.floor(S * 1.732 + 1) + 'px'); }
  var host = es; if (!box) { host = h('div', { id: 'esin', style: 'width:' + W + 'px;height:' + HH + 'px' }); es.appendChild(host); camClamp(); camApply(host); }
  var cb = !box && FEEL.combo;
  VB.CELLS.forEach(function (c) {
    var xy = cellXY(c, S, W, HH), t = p.estate[c.i], m = tg[c.i] || (cb && cb[c.i]);
    var b = h((box ? 'div.cell' : 'button.cell') + (t ? '.built' : '') + (m ? '.glow' : ''), { type: box ? null : 'button', id: box ? null : 'ec-' + c.i, 'data-ci': c.i, style: 'left:' + xy.x + 'px;top:' + xy.y + 'px', 'aria-label': (t ? VB.tileName(t) : 'Empty ' + VB.COLNAME[c.col] + ' space ' + c.num) + (m ? ', build here' : '') });
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
function renderDock() {
  var a = VB.actor(G), p = G.over ? me() : G.P[isHuman(a) ? a : UI.view], top = pend(), mt = myTurn();
  if (!G.over && isHuman(a)) UI.view = a;
  var gc = !G.over && goalChips(), dt = $('#docktitle');
  if (gc) { dt.innerHTML = ''; dt.appendChild(gc); dt.classList.add('goals'); } else dt.classList.remove('goals');
  if (!gc) dt.textContent = G.over ? 'Game over' : isHuman(a) ? 'Your move' : G.seats[a].name + '\'s turn · tap to speed up';
  $('#prompt').textContent = UI.note || promptText();
  var cb = $('#chainb'); if (UI.chain > 1 && mt) { cb.textContent = 'Chain of ' + UI.chain + '. Build again'; cb.classList.add('on'); } else cb.classList.remove('on');
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
  var gt = VB.goodsTypes(p); if (!gt.length) gd.appendChild(h('span.tip', { text: 'No goods' }));
  gt.forEach(function (g) {
    var ok = mt && VB.validMoves(G).some(function (m) { return m.k === 'sell' && m.v === g; });
    gd.appendChild(h('button.gbtn' + (ok ? '.glow' : ''), { type: 'button', id: 'gd-' + g, 'aria-label': p.goods[g] + ' ' + VB.GOODS[g] + ', sell with a ' + g, onclick: function () { tapGoods(g); } }, [h('span.gchip', { text: g, style: 'background-color:' + GCOL[g] }), h('span.gw', { text: p.goods[g] + ' ' + VB.GOODS[g] })]));
  });
  /* resources */
  var rr = $('#resrow'); rr.innerHTML = '';
  var RESTIP = { silver: 'Silver buys back-lane tiles. 1 point each at the end.', workers: 'Drag a worker onto a die to change it by one.', vp: 'Your points so far.', pos: 'Banner track. Barges move you up and first.' };
  function resTap(k) { return function () { toast(RESTIP[k], 2600); }; }
  rr.appendChild(h('span.res', { id: 'r-silver', title: 'Silver', 'aria-label': RESTIP.silver, onclick: resTap('silver'), 'data-engine': 'silver' }, [h('span.rw', { text: p.silver + ' silver' })]));
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
  if (p.used[0] && p.used[1]) ac.appendChild(h('button.btn', { type: 'button', id: 'endB', text: 'End turn', onclick: function () { doMove({ k: 'end' }); } }));
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
  if (UI.sel != null) { try { coach('preview'); } catch (e) { } return hints() ? 'Put it on a glowing space. +N is the points.' : 'Put it on a glowing space. Tap it again to cancel.'; }
  if (p.used[0] && p.used[1]) return 'Both dice used. Tap End turn.';
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
  if (lg.length && hints()) { var tvv = takeValues(), me1 = tvv.v['mt-' + d + '-' + k], bb = tvv.v[tvv.best]; return showTile(t, optionsFor(lg, 'Take to storage'), tvv.best === 'mt-' + d + '-' + k ? '★ Best pick right now.' : me1 >= bb - 1 ? 'Almost as good as the ★ pick.' : 'The ★ pick is worth more.'); }
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
  r.ev.forEach(function (ev) { if (ev.e === 'score') { srcAdd(ev.p, ev.why, ev.n); srcLogAdd(ev); } });
  if (m.k === 'end' && isHuman(s)) { var rl = rateLine(); UI.lastRate = rl; try { coach('turnover'); } catch (e) { } if (hints()) beat('Turn over', rl.t, 'turn ' + rl.k); }
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
        var z0 = FEEL.cam.z; return (L.tabs ? camTo(ev.cell, Math.max(z0, 1.3)) : camTo(ev.cell)).then(function () { if (!src) src = rectOf('st-0'); return fly(src, rectOf(dst), ev.tile); }).then(function () { buzz(10); if (el) { el.style.visibility = ''; el.animate && el.animate([{ transform: 'translate(-50%,-50%) scale(1.25)' }, { transform: 'translate(-50%,-50%) scale(1)' }], { duration: animMs(260) || 1 }); } if (ev.chain && chainNow > 1) popAt(rectOf(dst), 'Chain of ' + chainNow); if (L.tabs && z0 <= 1.01) setTimeout(function () { if (!(FEEL.drag && FEEL.drag.on)) camReset(true); }, animMs(700)); });
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
      beat(VB.PHASES[G.phase - 1] + ' is over', 'Mines pay silver: ' + mines + '.\nNew tiles in the market.\nA full region now gets +' + VB.PHASE_BONUS[Math.min(4, G.phase)] + ' extra.', 'round', 3000);
    } else if (G.round > 0) beat('Round ' + (G.round + 1) + ' of ' + nRounds(), 'Everyone rolls again.' + (crate ? '\nNew ' + VB.GOODS[crate] + ' crate at stall ' + G.white + '.' : ''), 'round', 2000);
  }
  var humans = G.seats.filter(function (s) { return s.human; }).length;
  if (humans > 1 && isHuman(a) && UI.lastHuman !== a) toast('Pass the device to ' + G.seats[a].name, 2000);
  UI.bump = {}; if (isHuman(a)) { UI.lastHuman = a; UI.quick = false; UI.cap = ''; if (L.tabs && !UI.pinTab) UI.tab = 'estate'; if (UI.mode === 'tutorial' && G.round >= 1 && G.round <= 4 && UI.stacked !== G.round) { UI.stacked = G.round; try { tutStack(G.round + 1); } catch (e) { } } }
  beatsRun(turnBanner);
}
function schedule() {
  clearTimeout(UI.aiT); if (!G || G.over || UI.busy || tvOpen()) return;
  var a = VB.actor(G);
  if (isHuman(a)) { try { GX.showDock(); } catch (e) { } return; }
  if (UI.mode === 'tutorial' && typeof GXT !== 'undefined' && GXT.active() && !UI.tutAi) return;
  var dl = UI.fast ? 5 : Math.max(UI.quick ? 120 : (GX.aiDelay ? GX.aiDelay(450) : 450), (UI.hold || 0) - Date.now());
  UI.aiT = setTimeout(function () { if (UI.busy || !G || G.over || isHuman(VB.actor(G))) return; aiPlay(VB.aiMove(G)); }, dl);
}

/* ---------------- game start / end ---------------- */
function startGame(o) {
  o = o || {}; clearTimeout(UI.aiT);
  var n = o.n || 2, seats = [];
  for (var i = 0; i < n; i++) seats.push(i === 0 ? { name: o.myName || 'You', human: true } : { name: (o.names && o.names[i]) || VB.SEATNAME[i], human: !!(o.hot && o.hot[i]), ai: o.ai || 'normal', style: o.style || null });
  G = VB.newGame({ n: n, teams: !!o.teams, seed: o.seed, phases: o.phases || 5, rounds: o.rounds, seats: seats, bonus: o.bonus, noBlack: o.noBlack });
  UI.view = 0; UI.sel = null; UI.die = null; UI.chain = 0; UI.busy = false; UI.mode = o.mode || 'quick'; UI.camp = UI.mode === 'story'; UI.lastHuman = -1;
  $('#start').hidden = true; $('#rs').hidden = true; $('#tv').hidden = true;

  UI.quick = false; UI.cap = ''; UI.pinTab = null; UI.tab = 'estate'; UI.bump = {}; FEEL.cam = { z: 1, x: 0, y: 0 }; save(); render(); musSync(); sfx('dice'); hintSync(); if (UI.mode === 'quick' && !UI.fast && !QS.get('scn')) showGoal(); else { if (UI.mode !== 'quick') toast(VB.PHASES[0] + ' begins', 1600); turnBanner(); } schedule();
}
function resume() { try { G = JSON.parse(localStorage.getItem('vob_save')); } catch (e) { G = null; } if (!G) return showTitle(); UI.mode = 'quick'; UI.camp = false; UI.busy = false; $('#start').hidden = true; render(); musSync(); schedule(); }
function gameOver() { try { localStorage.removeItem('vob_save'); } catch (e) { } musSync(); showResult(); }
function showResult() {
  var rs = $('#rs'); toastOff(); rs.innerHTML = ''; UI.cq = []; clearTimeout(UI.cT); UI.cBusy = false; var gd0 = $('#guide'); if (gd0) gd0.classList.remove('on'); var c = h('div.card', { role: 'dialog', 'aria-label': 'Result' });
  var w = G.winner, you = G.seats.filter(function (s) { return s.human; }).length === 1, won = G.teams ? w % 2 === 0 : w === 0; c.classList.add(won || !you ? 'rwin' : 'rlose'); setTimeout(function () { sfx(won ? 'score' : 'bad'); }, 150);
  c.appendChild(h('div', { 'data-art': won && you ? 'ui-result-win' : 'ui-result-lose', style: 'height:8px' }));
  c.appendChild(h('h2', { text: G.solo ? (won ? 'Every space built. You win.' : 'So close: ' + G.soloFilled + ' of 37 spaces') : G.teams ? (won ? 'Your team wins, ' + G.teamVP[0] + ' to ' + G.teamVP[1] : G.seats[1].name + ' and ' + G.seats[3].name + ' win, ' + G.teamVP[1] + ' to ' + G.teamVP[0]) : you ? (w === 0 ? 'You win!' : G.seats[w].name + ' wins this time') : G.seats[w].name + ' wins' }));
  var tb = h('table'); tb.appendChild(h('tr', {}, ['', 'Built', 'Silver', 'Workers', 'Goods', 'Lore', 'Total'].map(function (x) { return h('th', { text: x }); })));
  G.rank.forEach(function (s) { var p = G.P[s], e = p.end || { silver: 0, workers: 0, goods: 0, lore: 0 }; tb.appendChild(h('tr', {}, [G.seats[s].name, p.vpPlay, e.silver, e.workers, e.goods, e.lore, p.vp].map(function (x) { return h('td', { text: String(x) }); }))); });
  c.appendChild(tb); countUp(tb);
  var p0 = G.P[0]; var pl = function (n, a, b) { return n + ' ' + (n === 1 ? a : b); };
  c.appendChild(h('p.tip', { text: 'You filled ' + pl(p0.stat.regions, 'region', 'regions') + ' and sold ' + pl(p0.stat.sales, 'time', 'times') + '.' }));
  if (UI.mode === 'tutorial') {   /* the final count, rule by rule with your real numbers, then what you have not met yet */
    var e0 = G.P[0].end || {}, ul0 = h('ul.walk');
    [['Points during the game', G.P[0].vpPlay], ['Silver, 1 each (' + G.P[0].silver + ')', e0.silver], ['Unsold goods, 1 each', e0.goods], ['Workers, 1 per 2 (' + G.P[0].workers + ')', e0.workers], ['Lore scrolls', e0.lore]].forEach(function (x) { ul0.appendChild(h('li', { text: x[0] + ': ' + (x[1] || 0) })); });
    ul0.appendChild(h('li', { text: 'Total: ' + G.P[0].vp + '. A tie goes to the fuller estate.' }));
    c.appendChild(h('h3', { text: 'How your score adds up' })); c.appendChild(ul0); UI.seen = UI.seen || {}; UI.seen.final = 1; UI.seen.tie = 1;
    var lat = Object.keys(VSTORY.coach).filter(function (k) { return !UI.seen[k]; }); UI.later = lat;
    if (lat.length) { c.appendChild(h('h3', { text: VSTORY.laterTitle })); var ul1 = h('ul.walk'); lat.forEach(function (k) { ul1.appendChild(h('li', { text: VSTORY.coach[k].later })); }); c.appendChild(ul1); }
    c.appendChild(h('p.voice', {}, [h('b', { text: VSTORY.guide.name + ': ' }), document.createTextNode(won ? VSTORY.tut.result.win : VSTORY.tut.result.lose)]));
    try { GXT.markDone('vale-of-banners'); } catch (e) { }
  }
  var vline = UI.mode === 'tutorial' ? null : G.solo ? (won ? VSTORY.soloWin : VSTORY.soloLose) : UI.camp ? null : (won ? VSTORY.quickWin : VSTORY.quickLose);
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
  else if (UI.mode === 'tutorial') { ac.appendChild(h('button.btn', { type: 'button', id: 'realB', text: 'Play a real game', onclick: function () { UI.mode = 'quick'; UI.lastOpts = { n: 2, ai: 'easy' }; startGame(UI.lastOpts); } })); }
  else ac.appendChild(h('button.btn', { type: 'button', id: 'again', text: 'Play again', onclick: function () { startGame(UI.lastOpts || {}); } }));
  ac.appendChild(h('button.btn.alt', { type: 'button', id: 'lookB', text: 'Look at the board', onclick: function () { rs.hidden = true; } }));
  if (!UI.camp) ac.appendChild(h('button.btn.alt', { type: 'button', id: 'titleB', text: 'Title', onclick: showTitle }));
  c.appendChild(ac); rs.appendChild(c); rs.hidden = false; try { artApply(rs); } catch (e) { }
  try { if (!UI.camp && window.GNS && GNS.result) GNS.result({ game: 'vale-of-banners', mode: 'quick', won: won, score: p0.vp }); } catch (e) { }
}

/* ---------------- title + quick setup ---------------- */
var SET = { n: 2, ai: 'normal', hot: 0, teams: 0 };
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
    opts.forEach(function (o) { s.appendChild(h('button' + (cur === o[0] ? '.on' : ''), { type: 'button', text: o[1], 'aria-pressed': cur === o[0] ? 'true' : 'false', onclick: function () { set(o[0]); showSetup(); } })); });
    r.appendChild(s); return r;
  }
  c.appendChild(seg('Players', [[1, 'Solo'], [2, '2'], [3, '3'], [4, '4']], SET.n, function (v) { SET.n = v; SET.hot = Math.max(0, Math.min(SET.hot, v - 1)); }));
  if (SET.n > 1) {
    c.appendChild(seg('Computer players', [['easy', 'Easy'], ['normal', 'Normal'], ['hard', 'Hard']], SET.ai, function (v) { SET.ai = v; }));
    var hs = [[0, 'None']]; for (var i = 1; i < SET.n; i++) hs.push([i, String(i)]);
    c.appendChild(seg('Friends on this device', hs, SET.hot, function (v) { SET.hot = v; }));
    if (SET.n === 4) c.appendChild(seg('Teams', [[0, 'Each alone'], [1, '2 v 2']], SET.teams, function (v) { SET.teams = v; }));
  }
  c.appendChild(h('p.tip', { text: SET.n === 1 ? 'Solo: 25 rounds. Fill all 37 spaces to win.' : SET.n === 4 && SET.teams ? 'You and Saffron against Azure and Violet. Partners share everything.' : SET.hot ? 'Pass the device when it tells you to.' : 'You against ' + (SET.n - 1) + ' computer player' + (SET.n > 2 ? 's' : '') + '.' }));
  c.appendChild(h('button.btn.big', { type: 'button', id: 'goB', 'data-a': 'start', text: 'Start', onclick: function () {
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
  '<h3>Points</h3><p>The dark outlines on your estate mark regions. Fill every space in one to score it. Size 1 to 8 pays 1, 3, 6, 10, 15, 21, 28 or 36. Early regions pay more: +10 in season 1, then 8, 6, 4, 2.</p>' +
  '<p>First to fill every space of one colour gets 5 to 7 points. Second gets 2 to 4.</p>' +
  '<p>Each round the white die puts new goods on its stall.</p>' +
  '<p>At the end: +1 per silver, +1 per unsold crate, +1 per 2 workers, plus lore. Most points wins. A tie goes to the fuller estate.</p>' +
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
      if (!myTurn()) return null; var c = VB.fclone(G), m = VB.aiMove(c, 'normal'); if (!m) return null;
      var tgt = m.k === 'take' || m.k === 'grab' ? $('#mt-' + m.v + '-' + m.slot) : m.k === 'place' ? $('#st-' + m.s) : m.k === 'sell' ? $('#gd-' + m.v) : m.k === 'buy' ? $('#bl-' + m.slot) : m.k === 'end' ? $('#endB') : m.k === 'workers' ? $('#acts .btn') : $('#acts');
      return { target: tgt || $('#dock'), why: VB.why(G, m) };
    }, rulesFor: helpPhase });
  } catch (e) { console.error(e); }
}

/* ---------------- tutorial: a staged first game ---------------- */
function tutDone() { try { return GXT.isDone('vale-of-banners'); } catch (e) { return false; } }
function tutSetup() {
  UI.seen = {}; UI.cq = []; UI.cBusy = false; UI.coachLog = 0; UI.stacked = 0;
  startGame({ n: 2, seed: 77, phases: 1, rounds: 3, ai: 'easy', mode: 'tutorial', names: { 1: VSTORY.rival.name } });
  var p = G.P[0], home = VB.CELLS[VB.HOME];
  /* a pasture space next to home; the stored sheep fits it; die 1 = that number; die 2 matches a stall holding a Moot Hall */
  var nb = home.nb.map(function (i) { return VB.CELLS[i]; }).filter(function (c) { return c.col === 'pas' || c.col === 'bld' || c.col === 'ship'; })[0] || VB.CELLS[home.nb[0]];
  var tl = { id: 'tut1', t: nb.col }; if (nb.col === 'pas') { tl.k = 'sheep'; tl.n = 3; } if (nb.col === 'bld') tl.k = 'tower';
  G.bag.push(tl); p.store = [tl]; G.bag.pop();
  var sd = nb.num === 4 ? 2 : 4; G.depots[sd][0] = { id: 'tut2', t: 'mine' };
  p.dice = [sd, nb.num]; p.used = [false, false]; p.workers = 2;
  G.order = [0, 1]; G.ti = 0; UI.tut = { stall: sd, cell: nb.i, mc: 12 };
  G.bag = G.bag.filter(function (t) { return t.id !== 'tut1' && t.id !== 'tut2'; });
  render();
}
/* The tutorial is one real, short game (1 season = 3 rounds) against the real easy AI. Before each of your turns the table is
   stacked (tiles moved between the bag and the stalls, your dice set) so every case comes up once. TUTORIAL-COVERAGE.md lists them. */
function fromBag(f) { for (var i = 0; i < G.bag.length; i++) if (f(G.bag[i])) return G.bag.splice(i, 1)[0]; return null; }
function putStall(d, k, f) { var t = fromBag(f); if (!t) return null; var old = G.depots[d][k]; if (old) G.bag.push(old); G.depots[d][k] = t; return t; }
function adjTo(set, c) { return VB.CELLS[c].nb.some(function (n) { return set[n]; }); }
function tutStack(n) {
  var p = G.P[0], T = UI.tut; p.used = [false, false];
  if (n === 2) { p.dice = [3, 5]; var kinds = Object.keys(p.goods).filter(function (g) { return +g !== 3; }).slice(0, 2), ng = { 3: 2 }; kinds.forEach(function (g) { ng[g] = p.goods[g]; }); p.goods = ng; }
  if (n === 3) {
    var land = {}; Object.keys(p.estate).forEach(function (k) { land[k] = 1; });
    var kc = VB.placeTargets(p, { t: 'castle' }, 0)[0]; T.kc = kc; land[kc] = 1;
    var hc = null, cc = null, cols = ['know', 'pas', 'ship'];
    VB.placeTargets(Object.assign({}, p, { estate: Object.assign({}, p.estate, (function () { var o = {}; o[kc] = { t: 'castle' }; return o; })()) }), { t: 'bld', k: 'hall' }, 0).some(function (h1) {
      var l2 = Object.assign({}, land); l2[h1] = 1;
      for (var ci = 0; ci < cols.length; ci++) for (var i = 0; i < VB.CELLS.length; i++) { var c = VB.CELLS[i]; if (c.col === cols[ci] && !l2[i] && adjTo(l2, i) && c.num !== 2) { hc = h1; cc = i; return true; } }
      return false; });
    T.hc = hc; T.cc = cc; var kn = VB.CELLS[kc].num, x = kn === 1 ? 3 : 1; T.bend = x % 6 + 1; p.dice = [x, kn];
    putStall(T.bend, 0, function (t) { return t.t === 'castle'; }); T.free = T.bend === 6 ? 5 : T.bend + 1;
    putStall(T.free, 0, function (t) { return t.t === 'bld' && t.k === 'hall'; });
    var col = VB.CELLS[cc].col; var bt = fromBag(function (t) { return t.t === col; }); if (bt) { if (G.black[0]) G.bag.push(G.black[0]); G.black[0] = bt; }
    p.workers = Math.max(1, p.workers); p.silver = Math.max(2, p.silver); p.bought = false;
  }
  if (n === 4 && T.hc != null) { p.dice = [VB.CELLS[T.hc].num, VB.CELLS[T.mc].num]; }
  if (n === 5) { p.dice = [4, 6]; putStall(4, 0, function (t) { return t.t === 'pas'; }); }
  render();
}
function rivalThen(n) {   /* real rival turns (captions, banner), then stack your next turn */
  return function () {
    UI.tutAi = true;
    return new Promise(function (res) {
      schedule();
      (function poll() {
        if (!G || G.over) { UI.tutAi = false; res(); return; }
        if (isHuman(VB.actor(G)) && !UI.busy) { UI.tutAi = false; if (n) tutStack(n); res(); return; }
        setTimeout(poll, 250);
      })();
    });
  };
}
function tutStart(o) {
  if (typeof GXT === 'undefined') return;
  $('#start').hidden = true;
  var tapW = function (what, f) { return { type: 'tap', match: function (a) { return a.what === what && (!f || f(a)); } }; };
  var ev = function (what) { return { type: 'event', match: function (a) { return a.what === what; } }; };
  var tv = function () { return $('#tv .acts .btn'); }, my = function () { return myTurn(); };
  var st = function (k) { return function () { return $('#st-' + k); }; }, ec = function (f) { return function () { return $('#ec-' + f()); }; };
  var steps = [   /* only the very first action is spotlit (2 steps); then the game is free and Odo coaches */
    { id: 'take', title: '', say: '', target: function () { return $('#mt-' + UI.tut.stall + '-0'); }, wait: tapW('market', function (a) { return a.d === UI.tut.stall; }) },
    { id: 'take2', title: '', say: '', target: tv, wait: tapW('do-take') },
    { id: 'go', title: '', say: '', target: function () { return null; }, wait: null, onEnter: function () { setTimeout(function () { try { GXT.stop(); } catch (e) { } UI.tab = 'estate'; render(); coach('build'); schedule(); }, 0); } }
  ];
  steps.forEach(function (stp) {   /* story text: VSTORY.tut (src/story.js) */
    var tx = VSTORY.tut[stp.id]; if (!tx || stp.id === 'go') return; stp.title = tx.t; stp.say = tx.say;
    if (stp.pending) stp.pending = VSTORY.rival.name + ' is at work: watch the captions';
    if (stp.id === 'result') stp.pending = 'The bells ring for the harvest moot...';
    var mkStep = ['take', 'take2', 'bend', 'bend2', 'free', 'free2', 'buy', 'buy2', 'pas', 'pas2'].indexOf(stp.id) >= 0, en0 = stp.onEnter;
    stp.onEnter = function () { UI.tab = mkStep ? 'market' : 'estate'; if (G) render(); if (en0) en0(); };
    stp.ready = (function (r0) { return function () { if (G && L.tabs && UI.tab !== (mkStep ? 'market' : 'estate') && !G.over) { UI.tab = mkStep ? 'market' : 'estate'; render(); } return r0 ? r0() : true; }; })(stp.ready);
    stp.onDone = function () { var r = tx.react; if (r) say(r); };
  });
  GXT.start({ game: 'vale-of-banners', story: true, endTitle: VSTORY.endTitle, endText: VSTORY.endText, setup: tutSetup, steps: steps, onDone: function (r) {
    UI.mode = 'quick'; try { GXT.markDone('vale-of-banners'); } catch (e) { }
    if (r && r.choice === 'story') storyOpen(); else { UI.lastOpts = { n: 2, ai: 'easy' }; startGame(UI.lastOpts); }
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
