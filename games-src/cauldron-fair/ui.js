// ===================== part 1: globals, helpers, small model helpers, sound, save / load =====================
var ANIM = 1, AIDELAY = 650;
var G = null;
var UI = { started: false, mode: 'vs', cfg: null, holder: -1, focus: 0, pop: null, seq: 0, evN: 0, over: null, overShown: false, rep: false, repLog: 0, repV: [], repDay: 0, tm: {}, tipq: [], tipShown: {}, tip: null,
  coach: { level: 'full', seen: {} }, prefs: { sound: true, music: true, gfx: 'auto', hint: true }, busy: false, shopSel: [], legal: {}, sim: false, rsOpen: false, aiHold: {} };
const D = CF.DATA;
const KIT = window.KIT;
// painted art: CF_ART (data URIs made by build.py) -> blob URLs so the many chip <svg>s only carry a short link. Without blob URLs
// (old browsers, jsdom) the kit keeps its own vector drawings.
(function () {
  try {
    if (typeof CF_ART === 'undefined' || /jsdom/i.test(navigator.userAgent || '') || !window.URL || !URL.createObjectURL || !window.Blob || !window.atob) return;
    const m = {};
    for (const k in CF_ART) { const p = CF_ART[k].split(','), mime = (/data:([^;]+)/.exec(p[0]) || [0, 'image/webp'])[1], bin = atob(p[1]), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); m[k] = URL.createObjectURL(new Blob([u], { type: mime })); }
    KIT.setArt(m);
  } catch (e) { }
})();
const $ = s => /^#[\w-]+$/.test(s) ? document.getElementById(s.slice(1)) : document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const PN = D.CHARS.map(c => c.name);
const TEMPER = ['normal', 'easy', 'hard', 'normal'];   // the default level of each fair-goer
const DEF = { np: 3, me: 0, seats: [1, 2], lvBy: { 1: 'easy', 2: 'hard', 3: 'normal', 0: 'normal' }, sets: 1 };
// tiny element builder: h('div.cls#id', {attr:..}, ...kids)
function h(sel, at) {
  const m = /^([a-z0-9]*)((?:[.#][\w-]+)*)$/i.exec(sel) || [0, 'div', ''];
  const e = document.createElement(m[1] || 'div');
  const cls = []; (m[2] || '').replace(/([.#])([\w-]+)/g, (_, k, v) => { if (k === '#') e.id = v; else cls.push(v); });
  if (cls.length) e.className = cls.join(' ');
  let i = 2;
  if (at && typeof at === 'object' && !(at instanceof Node) && !Array.isArray(at)) { for (const k in at) { const v = at[k]; if (v == null || v === false) continue; if (k === 'text') e.textContent = v; else if (k === 'html') e.innerHTML = v; else e.setAttribute(k, v === true ? '' : v); } }
  else i = 1;
  for (; i < arguments.length; i++) add(e, arguments[i]);
  return e;
}
function add(e, k) { if (k == null || k === false) return; if (Array.isArray(k)) k.forEach(x => add(e, x)); else e.appendChild(k instanceof Node ? k : document.createTextNode(String(k))); }
function svgEl(s) { const t = document.createElement('template'); t.innerHTML = s.trim(); return t.content.firstChild; }
const chipHTML = (key, size, o) => KIT.chipSVG(key[0], +key.slice(1), Object.assign({ size: size || 30 }, o || {}));
const chipN = (key, size) => svgEl(chipHTML(key, size));
const avHTML = (i, size) => KIT.avatarSVG(chefOf(i), { size: size || 40 });
const chefOf = s => G && G.players[s] ? G.players[s].char : s;
const ico = (n, s, a) => KIT.icon(n, s || 18, a);
const nameList = a => a.length <= 1 ? (a[0] || '') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1];
const plural = (n, w, p) => n + ' ' + (n === 1 ? w : (p || w + 's'));
const cname = key => D.COLORS[key[0]].name;
const keyName = key => D.COLORS[key[0]].name + ' ' + key.slice(1);
// ---- game helpers
const humans = () => G ? G.players.map((p, i) => p.ai ? -1 : i).filter(i => i >= 0) : [];
const hotSeat = () => !!G && !(typeof NET !== 'undefined' && NET.on) && humans().length > 1;
const watching = () => !!G && humans().length === 0;
function viewSeat() { if (!G) return -1; if (typeof NET !== 'undefined' && NET.on) return NET.mySeat; if (hotSeat()) return UI.holder; const hs = humans(); return hs.length ? hs[0] : -1; }
const pname = s => G && G.players[s] ? G.players[s].name : '?';
const pcol = s => D.CHARS[chefOf(s) % 4].css;
function focusSeat() { const v = viewSeat(); if (UI.focus == null || UI.focus < 0 || !G || UI.focus >= G.np) UI.focus = v >= 0 ? v : 0; return UI.focus; }
const P = s => G.players[s];
// chips of a seat in the bag, as counts {key:n}: only the viewing seat knows (its own bag contents; never the order)
function bagCounts(p) { const o = {}; for (const c of p.bag) { if (!c || !c.c) continue; const k = c.c + c.v; o[k] = (o[k] || 0) + 1; } return o; }
const bagN = p => p.bagN != null ? p.bagN : p.bag.length;
const holdN = p => p.holdN != null ? p.holdN : p.hold.length;
function seatState(p) {
  if (G.phase === 'over') return 'over';
  if (G.phase === 'prep') return p.q ? 'choose' : 'ready';
  if (G.phase === 'brew') { if (p.st === 'done') return p.boom ? 'boom' : 'done'; if (p.st === 'post') return 'post'; return p.q ? 'choose' : p.lock ? 'locked' : (p.ai && !p.pot.length ? 'idle' : 'draw'); }
  return p.q ? 'choose' : 'wait';
}
function isMine(s) { const v = viewSeat(); return v >= 0 && s === v; }
const mvList = s => (G && s >= 0) ? CF.moves(G, s) : [];
const mvOf = (s, t) => mvList(s).find(m => m.t === t);
// ---- sound: shared gameaudio samples, with a tiny synthesized fallback when Web Audio exists but a sample does not
const SND_MAP = { click: { s: 'click', vol: .5 }, draw: { s: 'draw', vol: .55 }, plop: { s: 'plop', vol: .6 }, splash: { s: 'splash', vol: .55 }, boom: { s: 'boom', vol: .8 }, flask: { s: 'flask', vol: .6 }, ruby: { s: 'ruby', vol: .6 },
  coin: { s: 'coin', vol: .6 }, tick: { s: 'tick', vol: .4 }, die: { s: 'die', vol: .6 }, page: { s: 'page', vol: .5 }, round: { s: 'round', vol: .7 }, win: { s: 'win', vol: .8 }, error: { s: 'error', vol: .5 }, buy: { s: 'buy', vol: .6 }, bubble: { s: 'bubble', vol: .35 }, pass: { s: 'pass', vol: .5 } };
let _ac = null;
function synth(name) {
  try {
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC || /jsdom/i.test(navigator.userAgent || '')) return; _ac = _ac || new AC(); const c = _ac, t = c.currentTime;
    const tone = (f0, f1, d, type, v) => { const o = c.createOscillator(), g = c.createGain(); o.type = type || 'sine'; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(30, f1), t + d); g.gain.setValueAtTime(v || .12, t); g.gain.exponentialRampToValueAtTime(.0008, t + d); o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + d + .02); };
    if (name === 'boom') { tone(160, 40, .5, 'sawtooth', .2); tone(90, 30, .6, 'square', .12); } else if (name === 'plop' || name === 'draw') tone(520, 220, .12, 'sine', .14); else if (name === 'ruby' || name === 'coin') { tone(880, 1320, .15, 'triangle', .12); } else if (name === 'die') tone(300, 500, .1, 'square', .08); else if (name === 'win' || name === 'round') { tone(523, 784, .35, 'triangle', .14); } else if (name === 'error') tone(180, 140, .12, 'square', .1); else tone(660, 440, .06, 'sine', .06);
  } catch (e) { }
}
function snd(name, o) {
  try {
    if (UI.prefs && UI.prefs.sound === false) return; if (UI.sim) return;
    const m = SND_MAP[name] || { s: name, vol: 1 };
    if (m.s && window.GA && GA.has(m.s)) { const oo = Object.assign({}, o || {}); oo.vol = (oo.vol != null ? oo.vol : 1) * (m.vol != null ? m.vol : 1); GA.play(m.s, oo); return; }
    if (window.GA && GA.state && GA.state().ctx) synth(name);
  } catch (e) { }
}
function sndMusic() {
  try {
    if (!window.GA) return;
    if (UI.prefs.music === false || !G || !UI.started) { GA.music(null); GA.stopLoop && GA.stopLoop('bubbling'); return; }
    GA.music('main', { vol: .3 }); if (GA.has && GA.has('bubbling') && GA.loop) GA.loop('bubbling', { vol: .12, fade: 1.5 });
  } catch (e) { }
}
document.addEventListener('click', e => { const t = e.target.closest('button'); if (t && !t.disabled && !t.matches('.drawb,.stopb,[data-a=mv]')) snd('click'); }, true);
// ---- prefs and the saved game (localStorage in try/catch; never online)
function savePrefs() { try { localStorage.setItem('cf_prefs', JSON.stringify({ p: UI.prefs, aid: AIDELAY, coach: UI.coach.level })); } catch (e) { } }
function loadPrefs() { try { const o = JSON.parse(localStorage.getItem('cf_prefs') || 'null'); if (o) { Object.assign(UI.prefs, o.p || {}); if (o.aid != null) AIDELAY = o.aid; if (o.coach) UI.coach.level = o.coach; } } catch (e) { } }
const SAVEV = 1;
function hasSave() { try { const s = localStorage.getItem('cf_save'); if (!s) return false; const o = JSON.parse(s); return !!(o && o.v === SAVEV && o.G && o.G.phase !== 'over'); } catch (e) { return false; } }
function save() { try { if (!G || (typeof NET !== 'undefined' && NET.on) || G.phase === 'over') return false; localStorage.setItem('cf_save', JSON.stringify({ v: SAVEV, G, mode: UI.mode, cfg: UI.cfg, chefs: UI.chefs, focus: UI.focus, holder: UI.holder })); return true; } catch (e) { return false; } }
function clearSave() { try { localStorage.removeItem('cf_save'); } catch (e) { } }
function toast(t) { const e = $('#toast'); if (!e) return; e.textContent = t; e.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => e.classList.remove('on'), 2400); }
// ===================== part 2: render (board, thumbnails, dock, risk, questions) =====================
// Text for every question the engine can ask (title, explanation). Options come from CF.moves().
const QINFO = {
  pick: ['Pedlar\'s Pick', () => 'Take one: a Cinder Moth chip, any 2-chip, or 3 rubies.'],
  swap: ['Swap Stall', () => 'Trade 1 ruby for a 1-chip, or keep your ruby.'],
  clear: ['Clear the Pods', () => 'Score 4 points, or take one white 1 out of your bag for good.'],
  bribe: ['Rat Bribe', (p, d) => 'Move your rat stone back (up to ' + d.max + ') and take a ruby for every space.'],
  bounty: ['Rat Bounty', p => 'Take any 4-chip, or score 1 point for each rat tail you trail the leader by (you trail by ' + (p.ratTails || 0) + ').'],
  fork: ['Fork in the Road', () => 'Move your droplet 2 spaces, or take a Dusk Sigh chip.'],
  haggle: ['Haggler\'s Hour', () => 'You drew these chips. You may swap one for the next higher chip of its colour; they all go back in the bag afterwards.'],
  crow: ['Wren Feather: pick one', () => 'You drew these extra chips. Place one as your next chip (its power works at once) or none; the rest go back in the bag.'],
  peek: ['Peek and Pick', () => 'You drew these chips. Place one after your last chip, or none.'],
  y1: ['Kind cut', () => 'Put the white chip before it back in the bag? Its space stays empty and your score stays where it is.'],
  restart: ['Do-Over', () => 'Tip every chip back into the bag and start the day again? You can do this once.'],
  side: ['Scarlet Cap beside the pot', () => 'Add it after your last chip, keep it beside the pot for another day, or put it back in the bag.'],
  gift: ['Spilled Brew', () => 'A neighbour\'s cauldron exploded. Take any 2-chip.'],
  g2: ['Mossback gift', () => 'Choose the free chip this green chip earns.'],
  g4: ['Drip moss', (p, d) => 'Pay 1 ruby per green chip for a droplet step (up to ' + d.max + ').'],
  p1: ['Gentle sigh', d => 'You may take any of the rewards up to your ' + d.n + ' purple chips. Pass up the best one if the lower one suits you.'],
  g3: ['Lucky-seven moss', d => 'Your white chips total exactly 7. Slide the last chip ' + d.s + ' spaces, or stay and keep the ruby on your space.'],
  p2: ['Trade wind', () => 'Hand in purple chips for rewards (they are discarded). Each reward once; you may keep your chips instead.'],
  p4: ['Upgrade sigh', () => 'Swap one chip of your pot for a bigger one of the same colour. The new chip goes into your bag; today your scoring space stays as it is.'],
  de: ['Your cauldron exploded', (p, d) => 'Choose: take the ' + d.vp + ' victory point' + (d.vp === 1 ? '' : 's') + ' on your space, or shop with its ' + d.coins + ' coins.'],
  shop: ['The fair stalls', (p, d) => 'You have ' + d.coins + ' coins. Buy one or two chips of different colours.'],
  ruby: ['Rubies', () => 'Spend 2 rubies for a droplet step or to refill your flask, or keep them.']
};
const EVAL_Q = { gift: 1, g2: 1, g4: 1, p1: 1, g3: 1, p2: 1, p4: 1, de: 1, shop: 1, ruby: 1 };
function qKeys(m, p) {   // chips to show on an option button
  const out = [];
  if (m.items) m.items.forEach(k => out.push(k));
  else if (m.o && /^[A-Z][1-4]$/.test(m.o)) out.push(m.o);
  else if (m.to) out.push(m.to);
  else if (typeof m.idx === 'number' && m.idx >= 0 && p.hold[m.idx] && p.hold[m.idx].c) out.push(p.hold[m.idx].c + p.hold[m.idx].v);
  return out;
}
function moveBtn(m, p, cls) {
  const keys = qKeys(m, p);
  return h('button.btn.alt' + (cls ? '.' + cls : ''), { 'data-a': 'mv', 'data-i': UI.legal[p.seat].indexOf(m), type: 'button' }, keys.length ? h('span.cb', keys.map(k => chipN(k, 26))) : null, m.label);
}
function waitingNames() { return G.players.filter(p => (G.phase === 'brew' ? p.st !== 'done' : !!p.q) && !isMine(p.seat)).map(p => p.name); }
function promptInfo() {
  if (!G) return { text: '' };
  if (G.phase === 'over') return { text: UI.rsOpen && UI.rsMode === 'final' ? '' : G.winText };
  const v = viewSeat(); const wn = waitingNames();
  if (v < 0) return { text: G.phase === 'brew' ? 'The computers are brewing.' : 'The fair goes on.' };
  const p = G.players[v];
  if (hotSeat() && UI.holder < 0) return { text: 'Pass the device.' };
  if (p.q && !EVAL_Q[p.q.h]) return { text: QINFO[p.q.h][0] + ': ' + QINFO[p.q.h][1](p, p.q.d), mine: true };
  if (G.phase === 'brew') {
    if (p.st === 'draw' && p.lock) return { text: 'You have decided. ' + (wn.length ? 'Waiting for ' + nameList(G.players.filter(q => q.st === 'draw' && !q.lock && !isMine(q.seat)).map(q => q.name)) + ', then everybody reveals together (Stir!).' : 'Revealing...') };
    if (p.st === 'draw') { const rk = CF.risk(G, v); return { text: (G.round === 9 ? 'Last day: choose Draw or Stop. Nobody sees your choice until everybody has chosen. ' : '') + (p.pot.length ? 'Draw another chip, or stop and keep your score.' : 'Tap Draw to pull your first chip from the bag.'), mine: true }; }
    return { text: (p.boom ? 'Your cauldron exploded. ' : 'You stopped. ') + (wn.length ? 'Waiting for ' + nameList(wn) + '...' : 'Everyone is done.') };
  }
  if (G.phase === 'prep') return { text: wn.length ? 'Waiting for ' + nameList(wn) + ' to choose...' : 'The day begins.' };
  if (G.phase === 'eval') return { text: p.q ? QINFO[p.q.h][1](p, p.q.d) : (wn.length ? 'Waiting for ' + nameList(wn) + '...' : 'Counting the day.'), mine: !!p.q };
  return { text: '' };
}
function placePrompt() { }
function stateLabel(p) {
  switch (seatState(p)) { case 'draw': return 'drawing'; case 'locked': return 'decided'; case 'done': return 'stopped'; case 'boom': return 'exploded'; case 'post': return 'finishing'; case 'choose': return 'choosing'; case 'ready': return 'waiting'; case 'wait': return 'waiting'; case 'idle': return 'waiting'; default: return ''; }
}
// why the white limit is not 7 today (empty when it is 7)
function limitNote(p) {
  const lim = CF.limitOf(G, p); if (lim === D.limit) return ''; const why = [];
  if (G.fcard === 'thick') why.push('Thick Skin'); if (G.sets.Y === 3 && p.pot.some(c => c.c === 'Y')) why.push('Sunroot');
  return 'White limit ' + lim + ' today' + (why.length ? ' (' + why.join(' + ') + ')' : '');
}
function seatCls(p) { const s = seatState(p); return s === 'draw' || s === 'choose' || s === 'post' ? 'dr' : s === 'boom' ? 'bm' : s === 'done' ? 'dn' : ''; }
function potOpts(p, mini) {
  const shown = p.pot.length > 0 || G.phase === 'brew';
  return { pot: p.pot, droplet: p.droplet, rat: p.rat > 0 && p.rat > p.droplet ? p.rat : 0, space: shown && (p.pot.length || !mini) ? CF.spaceOf(p) : null, boom: p.boom, mini: !!mini, uid: p.seat, label: p.name + '\'s cauldron' };
}
// ---------- board ----------
function renderOthers() {
  const o = $('#others'); if (!o) return; const f = focusSeat(); o.innerHTML = '';
  for (const p of G.players) {
    if (p.seat === f) continue;
    const t = h('button.th' + (seatCls(p) ? '.' + seatCls(p) : ''), { 'data-a': 'focus', 'data-seat': p.seat, type: 'button', 'aria-label': p.name + ': ' + p.vp + ' points, ' + stateLabel(p) + '. Tap to look at this cauldron.' });
    t.append(h('span.av', { html: avHTML(p.seat, 26) }), h('span.tp', { html: KIT.potSVG(potOpts(p, true)).replace(/width="\d+" height="\d+"/, '') }),
      h('span.ti', h('b', p.name), h('span.tv', h('span', { html: ico('vp', 15) }), p.vp, h('span', { html: ico('ruby', 15) }), p.rubies), h('span.ts', stateLabel(p) + (p.pot.length ? ' · ' + p.pot.length : ''))));
    o.appendChild(t);
  }
  o.style.display = G.np > 1 && o.children.length ? '' : 'none';
}
function renderMe() {
  const f = focusSeat(), p = G.players[f], v = viewSeat(), mine = f === v; const me = $('#me'); if (!me) return;
  const lim = CF.limitOf(G, p), ws = CF.whiteSum(p), hot = ws >= lim - 1;
  const sp = p.pot.length ? CF.spaceOf(p) : null;
  me.innerHTML = '';
  me.append(h('span.av', { html: avHTML(f, 32) }), h('span.nm', mine ? 'You' : p.name),
    h('span.st', { title: 'Victory points' }, h('span', { html: ico('vp', 18) }), h('b', p.vp)),
    h('span.st', { title: 'Rubies' }, h('span', { html: ico('ruby', 18) }), h('b', p.rubies)),
    h('span.st', { title: 'Droplet: where your first chip starts' }, h('span', { html: ico('drop', 18) }), h('b', p.droplet)),
    h('span.st.fl', { title: p.flask ? 'Flask ready' : 'Flask used' }, h('span', { html: ico('flask', 18, p.flask) })),
    h('span.st.gauge' + (hot ? '.hot' : ''), { title: 'White chips in the pot: ' + ws + ' of ' + lim + ' allowed' }, h('span', { html: KIT.chipSVG('W', 0, { size: 18 }) }), h('b.w', ws + '/' + lim)));
  if (lim !== D.limit) { const g = me.querySelector('.gauge'); if (g) { g.classList.add('chg'); g.title = limitNote(p) + ': ' + ws + ' white now'; } }
  if (sp != null && !document.documentElement.classList.contains('ph')) me.append(h('span.st', { title: 'Where you would score now' }, 'Space ' + sp + ': ' + D.COINS[sp] + ' coins, ' + D.VP[sp] + ' VP' + (D.RUBY[sp] ? ' + ruby' : '')));
}
function renderStage() {
  const f = focusSeat(), p = G.players[f], cp = $('#cpot'); if (!cp) return;
  const sig = JSON.stringify([f, p.pot.map(c => c.i + ':' + c.pos), p.droplet, p.rat, p.boom, G.phase === 'brew' ? 1 : 0]);
  if (UI.potSig !== sig) { UI.potSig = sig; cp.innerHTML = KIT.potSVG(potOpts(p, false)); cp.setAttribute('aria-label', (f === viewSeat() ? 'Your' : p.name + '\'s') + ' cauldron: ' + p.pot.length + ' chips'); }
  const bi = $('#bagi'); if (bi) bi.innerHTML = ico('bag', 34) + '<b style="color:#f8eed8;font-size:15px;text-shadow:0 1px 2px #000">' + bagN(p) + '</b>';
  const cb = $('#cbad'); if (cb) { cb.hidden = !p.boom; cb.className = 'cbad' + (p.prot ? ' prot' : ''); cb.textContent = p.prot ? 'Exploded, but safe!' : 'Exploded!'; }
  if (typeof pxDirty === 'function') pxDirty();
}
// ---------- dock ----------
function renderRisk() {
  const rk = $('#risk'); if (!rk) return; const f = focusSeat(), v = viewSeat(), p = G.players[f];
  rk.innerHTML = ''; rk.hidden = false; rk.removeAttribute('data-priv');
  const sp = p.pot.length ? CF.spaceOf(p) : null, lim = CF.limitOf(G, p), ws = CF.whiteSum(p);
  const here = sp != null ? h('div.rk', h('span', { html: ico('coin', 16) }), h('b', D.COINS[sp]), ' coins ', h('span', { html: ico('vp', 16) }), h('b', D.VP[sp]), ' points', D.RUBY[sp] ? [h('span', { html: ico('ruby', 16) }), ' ruby'] : null, h('span.sm', ' (space ' + sp + ')')) : null;
  if (f !== v || v < 0 || p.bag.length && !p.bag[0] && p.bagN != null) {
    rk.append(h('div.rk', h('b', p.name + '\'s cauldron'), ' white ', h('b', ws + ' of ' + lim), ' · ' + plural(bagN(p), 'chip') + ' left in the bag'), ...(here ? [here] : []));
    if (p.boom) rk.append(h('div.rk.hi', 'Exploded.'));
    return;
  }
  rk.setAttribute('data-priv', f);
  const r = CF.risk(G, f);
  const pct = Math.round(r.pBoom * 100), lv = pct < 15 ? 'lo' : pct < 30 ? 'mid' : 'hi';
  if (G.phase === 'brew' && p.st === 'draw') {
    const n = Math.max(1, r.n), nb = r.boom, ny = r.whites - r.boom, nk = r.n - r.whites;
    const bar = h('div.rb', { 'aria-hidden': 'true' }, h('i', { style: 'width:' + (100 * nk / n) + '%;background:#7fd65a' }), h('i', { style: 'width:' + (100 * ny / n) + '%;background:#f2b81e' }), h('i', { style: 'width:' + (100 * nb / n) + '%;background:#d6392f' }));
    rk.append(h('div.rk', h('span', { html: ico('bag', 18) }), h('b', r.n), ' chips in the bag: ', h('b', r.whites), ' white'), bar,
      h('div.rk', 'Next chip explodes it: ', h('span.big.' + lv, pct + '%'), h('span.sm', ' (' + nb + ' of ' + r.n + ' chips would explode)'), h('span.sm', ' · white total ' + r.ws + ' of ' + r.limit)), ...(limitNote(p) ? [h('div.rk.hi', limitNote(p) + '.')] : []), ...(here ? [here] : []));
    const fl = p.flask ? (p.f.canFlask && p.pot.length && p.pot[p.pot.length - 1].c === 'W' ? 'The flask can put your last white chip back.' : 'Flask ready: it can put back a white chip you just drew.') : 'Flask used this day.';
    rk.append(h('div.sm.fl', fl));
  } else {
    const cs = bagCounts(p), parts = Object.keys(cs).sort().map(k => h('span.cb', chipN(k, 20), '×' + cs[k]));
    rk.append(h('div.rk', h('span', { html: ico('bag', 18) }), h('b', bagN(p)), ' chips in your bag:'), h('div.rk', parts), ...(here ? [here] : []));
  }
}
function renderFort() {
  const e = $('#fort'); if (!e) return; const c = D.FORTUNE.find(x => x.id === G.fcard);
  if (!c || G.phase === 'over') { e.hidden = true; return; } e.hidden = false; e.className = c.kind;
  e.innerHTML = ''; e.setAttribute('data-a', 'fort'); e.append(h('span.fk', c.kind === 'blue' ? 'ALL DAY' : 'NOW'), h('div', h('b', 'Fortune: ' + c.name + ' '), h('span.fx', c.text)));
}
function renderRoster() {
  const r = $('#roster'); if (!r) return; r.innerHTML = '';
  for (const p of G.players) {
    const b = h('button.rc' + (isMine(p.seat) ? '.me' : '') + (seatCls(p) ? '.' + seatCls(p) : ''), { 'data-a': 'focus', 'data-seat': p.seat, type: 'button', 'aria-label': p.name + ' ' + stateLabel(p) });
    b.append(h('span.cav', { html: avHTML(p.seat, 28) }), h('span.ct', h('b', isMine(p.seat) ? 'You' : p.name), h('i', stateLabel(p) + ' · ' + p.vp + ' VP')));
    r.appendChild(b);
  }
}
function renderActs() {
  const a = $('#acts'), qb = $('#qbox'); if (!a || !qb) return; a.innerHTML = ''; qb.innerHTML = ''; qb.hidden = true;
  const v = viewSeat(); if (v < 0 || !G || G.phase === 'over') return;
  if (hotSeat() && UI.holder < 0) return;
  const p = G.players[v]; const legal = mvList(v); UI.legal[v] = legal;
  if (typeof NET !== 'undefined' && NET.on && NET.pend && Date.now() - NET.pendT < 700) { /* a move is in flight */ }
  if (p.q && !EVAL_Q[p.q.h]) { renderQ(p, legal, qb); return; }
  if (G.phase !== 'brew' || p.st !== 'draw' || p.q) return;
  const mk = (t, cls, label, icon) => { const m = legal.find(x => x.t === t); if (!m) return null; return h('button.btn' + cls, { 'data-a': 'mv', 'data-i': legal.indexOf(m), type: 'button' }, icon ? h('span', { html: icon }) : null, label); };
  const draw = mk('draw', '.drawb', 'Draw', ico('bag', 26)), stop = mk('stop', '.stopb', 'Stop');
  if (!p.lock) {   // the one line that matters: how likely is the next chip to explode, and what am I worth right now
    const r = CF.risk(G, v), pct = Math.round(r.pBoom * 100), lv = pct < 15 ? 'lo' : pct < 30 ? 'mid' : 'hi', sp = CF.spaceOf(p), ln = limitNote(p);
    const fm = legal.find(x => x.t === 'flask');
    const sr = h('div.sumrow', { 'data-priv': v }, h('span.s1', h('b.' + lv, pct + '%'), ' to explode'), h('span.s2', { title: 'If you stop now' }, h('span', { html: ico('coin', 16) }), h('b', D.COINS[sp]), h('span', { html: ico('vp', 16) }), h('b', D.VP[sp]), D.RUBY[sp] ? h('span', { html: ico('ruby', 16) }) : null),
      fm ? h('button.btn.alt.flb', { 'data-a': 'mv', 'data-i': legal.indexOf(fm), type: 'button', 'aria-label': 'Flask: put the last white chip back in the bag', title: 'Flask: put the last white chip back' }, h('span', { html: ico('flask', 20, true) }), 'Flask') : null,
      ln ? h('div.s3', ln + ': it explodes above ' + r.limit + '.') : null);
    a.appendChild(sr);
  }
  const rowTop = [mk('froth', '.alt.sec', 'Put the first white chip back (free)'), mk('restart', '.alt.sec', 'Do-over: start the day again')].filter(Boolean);
  if (rowTop.length) rowTop.forEach(b => a.appendChild(b));
  const rat = legal.filter(m => m.t === 'ratset');
  if (rat.length) { const d = h('details', { style: 'flex:1 1 100%' }, h('summary.sm', { style: 'min-height:44px;display:flex;align-items:center;cursor:pointer' }, 'Rat stone: ' + (p.rat - p.droplet) + ' spaces ahead. Use fewer?')); const row = h('div', { style: 'display:flex;gap:6px;flex-wrap:wrap' }); rat.forEach(m => row.appendChild(h('button.btn.alt', { 'data-a': 'mv', 'data-i': legal.indexOf(m), type: 'button' }, m.n + ''))); d.appendChild(row); a.appendChild(d); }
  if (draw) a.appendChild(draw); if (stop) a.appendChild(stop);
}
function renderQ(p, legal, qb) {
  const q = p.q, info = QINFO[q.h]; qb.hidden = false;
  qb.append(h('div.qt', h('b', info[0]), h('div', info[1](p, q.d))));
  if (p.hold.length && p.hold[0] && p.hold[0].c) qb.append(h('div.hold', { 'data-priv': p.seat }, p.hold.map((c, i) => h('span.cb', chipN(c.c + c.v, 34)))));
  const opts = h('div.opts' + (legal.length > 3 ? '.g2' : ''));
  legal.forEach(m => opts.appendChild(moveBtn(m, p)));
  qb.append(opts);
}
function renderBar() {
  const bs = $('#barstat'); if (!bs) return; bs.innerHTML = '';
  if (!G) return; bs.append(h('span.dayn', isPh() ? 'Day ' + G.round + '/' + D.rounds : 'Day ' + G.round + ' of ' + D.rounds));
  const dt = document.querySelector('.gx-dt'); if (dt) { const v = viewSeat(); dt.textContent = G.phase === 'over' ? 'Game over' : (v >= 0 && (G.phase === 'brew' ? G.players[v].st === 'draw' : !!G.players[v].q)) ? 'Your turn' : 'Waiting'; }
}
let rndT = 0;
function render() {
  if (!G || !UI.started) return;
  try {
    focusSeat(); placePrompt();
    renderBar(); renderOthers(); renderMe(); renderStage(); renderActs(); renderRisk(); renderFort(); renderRoster();
    const pi = promptInfo(), pr = $('#prompt'); if (pr) { pr.textContent = pi.text; pr.className = pi.mine ? 'mine' : ''; }
    renderHint(); renderLegend(); renderBlg(); renderDrawers(); renderNetBadge && renderNetBadge();
  } catch (e) { console.error(e); if (window.__cfErr) window.__cfErr.push(String(e.stack || e)); }
}
function renderHint() { const e = $('#hint'); if (e) { e.hidden = true; e.innerHTML = ''; } }  // tips live in #pc (the tip card)
// ===================== part 3: flow: new game, computer players, applying moves, events, hot-seat, save / load =====================
function cfgOf(o) {
  const c = Object.assign({}, DEF, UI.opt || {}, o || {});
  c.seats = (c.seats || DEF.seats).slice(); c.lvBy = Object.assign({}, DEF.lvBy, c.lvBy || {});
  return c;
}
// players: seat 0 = you (or the first person), the others follow
function newGame(mode, o) {
  if (mode !== 'guided' && !UI.prefs.played) { UI.prefs.played = true; try { savePrefs(); } catch (e) { } }
  o = o || {}; const c = cfgOf(o); clearTimeout(UI.tm0); Object.keys(UI.tm).forEach(k => clearTimeout(UI.tm[k])); UI.tm = {}; UI.seq++;
  let np = Math.max(2, Math.min(4, c.np || 3)); const me = c.me != null ? c.me : 0;
  let chars = [me]; for (const s of c.seats) { if (chars.length >= np) break; if (chars.indexOf(s) < 0) chars.push(s); } for (let k = 0; chars.length < np; k++) if (chars.indexOf(k) < 0) chars.push(k);
  np = chars.length; let ai = [], sets = c.sets; const lvOf = ch => (c.lvBy && c.lvBy[ch]) || TEMPER[ch];
  if (mode === 'guided') { np = 2; sets = 1; chars = [me, me === 1 ? 2 : 1]; ai = [null, 'easy']; }
  else if (mode === 'hot') ai = new Array(np).fill(null);
  else if (mode === 'ai') ai = chars.map(ch => lvOf(ch));
  else ai = chars.map((ch, i) => i === 0 ? null : lvOf(ch));
  const names = chars.map(ch => PN[ch]);
  const seed = UI.seed != null ? UI.seed : (Date.now() ^ (Math.random() * 1e9)) | 0; UI.seed = null;
  G = CF.newGame({ players: np, seed, names, ai, chars, setMode: sets === 'random' ? 'random' : sets, guided: mode === 'guided', firstCard: mode === 'guided' ? 'lucky7' : undefined });
  UI.mode = mode; UI.cfg = c; UI.started = true; UI.holder = -1; UI.focus = 0; UI.evN = G.evN; UI.over = null; UI.overShown = false; UI.rsOpen = false; UI.repSeen = 0; UI.shopSel = []; UI.potSig = ''; UI.tip = null; UI.tipRound = {}; UI.tipMark = null; UI.tipOpen = false; UI.hotShared = 0; UI.tipq = []; UI.tipShown = {};
  UI.coach = { level: mode === 'guided' ? 'full' : (UI.coach.level === 'full' && mode !== 'guided' ? 'light' : UI.coach.level), seen: {} };
  if (mode === 'guided' && UI.coach.level === 'off') UI.coach.level = 'full';
  window.G = G; try { const st = $('#start'); if (st) st.hidden = true; } catch (e) { }
  closeRS && closeRS(true); try { GX.close(); } catch (e) { }
  if (mode !== 'ai') save();
  afterApply(true);
  sndMusic();
  if (mode === 'guided') tipStart();
  return G;
}
const stripM = m => { const o = Object.assign({}, m); delete o.label; return o; };
// the local click path: apply a move for a seat on this machine (host or offline) -- clients send it to the host instead
function act(m, seat) {
  if (!G || G.phase === 'over') return false;
  seat = seat == null ? viewSeat() : seat; if (seat < 0) return false;
  if (typeof NET !== 'undefined' && NET.on && !isHost()) { return netAct(stripM(m)); }
  return commit(seat, stripM(m));
}
function commit(seat, m) {
  const r = CF.apply(G, seat, m);
  if (!r.ok) { if (!UI.sim) console.warn('refused', JSON.stringify(m), r.error); snd('error'); return false; }
  afterApply(false); return true;
}
function afterApply(first) {
  playEvents(first);
  if (UI.mode !== 'ai' && !(typeof NET !== 'undefined' && NET.on)) { if (G.phase === 'over') clearSave(); else save(); }
  updateHolder();
  if (typeof netPush === 'function' && typeof NET !== 'undefined' && NET.on && isHost()) netPush(false);
  tipCheck();
  checkReport();
  if (!UI.sim) render();
  checkFinal();
  schedule();
}
// ---------- events: sounds, animations, floating numbers ----------
function playEvents(first) {
  const evs = G.events.filter(e => e.n > UI.evN); UI.evN = G.evN; if (first || !evs.length) return;
  for (const e of evs) {
    try {
      switch (e.t) {
        case 'draw': if (e.how !== 'side') snd('draw'); break;
        case 'place': snd(e.ruby ? 'ruby' : 'plop'); setTimeout(() => snd('splash'), 120); if (typeof pxEvent === 'function') pxEvent(e); break;
        case 'side': if (typeof pxEvent === 'function') pxEvent(e); break;
        case 'boom': snd('boom'); if (typeof pxEvent === 'function') pxEvent(e); if (isMine(e.seat) && !UI.sim) toast(e.prot ? 'Boom! But safe harbour saves your points.' : 'Your cauldron exploded!'); break;
        case 'flask': snd('flask'); if (typeof pxEvent === 'function') pxEvent(e); break;
        case 'restart': snd('page'); if (typeof pxEvent === 'function') pxEvent(e); break;
        case 'die': snd('die'); break;
        case 'gain': if (e.k === 'ruby') snd('ruby'); else if (e.k === 'vp') snd('coin'); else if (e.k === 'drop') snd('plop'); if (typeof pxEvent === 'function') pxEvent(e); break;
        case 'buy': snd('buy'); break;
        case 'fortune': snd('page'); break;
        case 'round': snd('pass'); break;
        case 'eval': snd('round'); break;
        case 'gameEnd': snd('win'); break;
      }
    } catch (x) { console.error(x); }
  }
}
// ---------- the computer players ----------
function aiOK() { return !(typeof NET !== 'undefined' && NET.on && !isHost()); }
function schedule() {
  if (!G || !UI.started || G.phase === 'over' || !aiOK()) return;
  const pend = CF.pending(G);
  for (const s of pend) {
    const p = G.players[s]; if (!p.ai || UI.tm[s]) continue;
    if (UI.rsOpen && G.phase !== 'eval' && !UI.sim) continue;               // hold the next day until the report is closed
    if (UI.mode === 'guided' && (UI.tip && UI.tip.block) && !UI.sim) continue;
    if (UI.sim) { aiStep(s); continue; }
    let d = AIDELAY * (0.55 + Math.random() * 0.9); if (G.phase === 'brew' && p.st === 'draw' && p.pot.length === 0) d *= 0.7; if (G.phase !== 'brew') d *= 0.6;
    const seq = UI.seq; UI.tm[s] = setTimeout(() => { UI.tm[s] = 0; if (seq !== UI.seq) return; aiStep(s); }, d);
  }
}
function aiStep(s) {
  if (!G || G.phase === 'over' || !G.players[s] || !G.players[s].ai) return;
  if (CF.pending(G).indexOf(s) < 0) return;
  if (UI.rsOpen && G.phase !== 'eval' && !UI.sim) return;
  let m; try { m = CF.AI.choose(G, s); } catch (e) { console.error(e); m = null; }
  if (!m) { const l = CF.moves(G, s); m = l[0]; }
  if (!m) return;
  if (!commit(s, stripM(m))) { const l = CF.moves(G, s); if (l.length) commit(s, stripM(l[0])); }
}
// test hook: run every computer step at once (UI.sim = true skips animations and timers); returns when nothing is left for a computer to do
UI.simAll = function (max) { UI.sim = true; let n = 0; try { for (; n < (max || 2000); n++) { const pend = CF.pending(G).filter(s => G.players[s].ai); if (!pend.length) break; aiStep(pend[0]); } } finally { UI.sim = false; } render(); return n; };
// ---------- hot-seat: whose turn is it on the device ----------
function updateHolder() {
  if (!hotSeat()) { UI.pass = null; return; }
  const pend = CF.pending(G).filter(s => !G.players[s].ai);
  if (UI.holder >= 0 && pend.indexOf(UI.holder) >= 0) { UI.pass = null; return; }
  if (!pend.length) { if (UI.holder >= 0 && G.phase === 'over') UI.holder = -1; UI.pass = null; return; }
  const order = pend.slice().sort((a, b) => ((a - G.start + G.np) % G.np) - ((b - G.start + G.np) % G.np));
  UI.holder = -1; UI.pass = order[0]; UI.focus = order[0];
}
function takeDevice() { if (UI.pass == null) return; UI.holder = UI.pass; UI.focus = UI.pass; UI.pass = null; render(); checkReport(); }
// ---------- save / load ----------
function loadSave() {
  try {
    const o = JSON.parse(localStorage.getItem('cf_save') || 'null'); if (!o || o.v !== SAVEV || !o.G) return false;
    Object.keys(UI.tm).forEach(k => clearTimeout(UI.tm[k])); UI.tm = {}; UI.seq++;
    G = o.G; window.G = G; UI.mode = o.mode || 'vs'; UI.cfg = o.cfg; UI.started = true; UI.holder = -1; UI.focus = o.focus || 0; UI.evN = G.evN; UI.rsOpen = false; UI.repSeen = G.rep ? G.rep.round : 0; UI.over = null; UI.overShown = false; UI.potSig = ''; UI.tip = null; UI.tipq = [];
    UI.coach = { level: UI.coach.level, seen: {} }; const st = $('#start'); if (st) st.hidden = true; closeRS && closeRS(true);
    afterApply(true); sndMusic(); toast('Welcome back.'); return true;
  } catch (e) { console.error(e); return false; }
}
// ===================== part 4: the day report (and its decisions), the shop, the pass card, the final screen, the guided tips =====================
function closeRS(quiet) { const rs = $('#rs'); if (rs) { rs.hidden = true; rs.innerHTML = ''; } UI.rsOpen = false; UI.rsMode = ''; if (!quiet && typeof schedule === 'function') schedule(); }
function checkReport() {
  if (!G || !UI.started) return;
  if (hotSeat() && UI.pass != null && !(G.phase === 'eval' && G.rep && UI.hotShared !== G.rep.round)) { showPass(UI.pass); return; }
  if (UI.rsMode === 'pass') closeRS(true);
  if (UI.rsMode === 'final') return;
  const R = G.rep;
  const v0 = viewSeat(), needs = G.phase === 'eval' && v0 >= 0 && G.players[v0].q && EVAL_Q[G.players[v0].q.h];   // a decision of mine is waiting: its report must be open (hot-seat: after the pass card, online: after a rejoin)
  if (R && ((UI.repSeen !== R.round && (G.phase === 'eval' || G.round > R.round || G.phase === 'over')) || (needs && !UI.rsOpen))) { UI.repSeen = R.round; UI.rsOpen = true; UI.rsMode = 'report'; }
  if (UI.rsOpen && UI.rsMode === 'report') renderReport();
}
function checkFinal() {
  if (!G || G.phase !== 'over') return;
  if (UI.rsMode === 'report' && UI.rsOpen) return;       // the last day's report first
  if (!UI.overShown) { UI.overShown = true; UI.rsMode = 'final'; UI.rsOpen = true; showFinal(); }
}
function dayRow(p, R) {
  if (G.phase === 'eval' && p.res && G.round === R.round) { const r = p.res; return { space: r.space, boom: p.boom, prot: p.prot, mode: r.mode, bought: r.bought, die: r.die, chips: r.chips, white: r.white, gain: p.vp - r.vp0, live: true }; }
  const hh = G.hist.find(x => x.round === R.round && x.seat === p.seat); if (!hh) return null;
  return { space: hh.space, boom: hh.boom, prot: hh.prot, mode: hh.mode, bought: hh.bought, die: hh.die, chips: hh.chips, white: hh.white, gain: hh.gain };
}
function renderReport() {
  const rs = $('#rs'); if (!rs || !G || !G.rep) return; const R = G.rep; rs.hidden = false;
  const v = viewSeat(), me = v >= 0 ? G.players[v] : null, myq = me && me.q && EVAL_Q[me.q.h] ? me.q : null;
  const oldBody = rs.querySelector('.rsbody'), keepTop = oldBody ? oldBody.scrollTop : 0;
  const hotShared = hotSeat() && G.phase === 'eval' && UI.hotShared !== R.round, hotPriv = hotSeat() && !!myq && !hotShared;   // hot-seat: the table is shown once to everybody, then each maker decides in private
  const box = h('div.rsbox.fix', { role: 'dialog', 'aria-label': 'Day ' + R.round + ' report' }); UI.rsFoot = null;
  box.appendChild(h('h2', h('span', { html: ico('coin', 30) }), hotPriv ? 'Day ' + R.round + ': ' + me.name : 'Day ' + R.round + ' report'));
  box.appendChild(h('div#rstip.tipb', { hidden: true }));
  const body = h('div.rsbody');
  const tab = h('table.rt-tab'); tab.appendChild(h('tr', h('th', 'Cauldron'), h('th', 'Reached'), h('th', 'Result'), h('th', '+VP'), h('th', 'Total')));
  for (const p of G.players) {
    const r = dayRow(p, R); if (!r) continue; const sp = r.space;
    const res = r.boom ? (r.prot ? [h('span.ok', 'exploded, safe')] : [h('span.bad', 'exploded'), h('div.sm', (r.mode === 'buy' ? 'went shopping' : r.mode === 'vp' ? 'took points' : '...') + ' (white ' + r.white + ' went over the limit)')]) : [h('span.ok', 'stopped'), r.die && r.die.length ? h('div.sm.dieb' + (r.live ? '.roll' : ''), { title: 'Bonus die' }, r.die.map(f => h('span', { html: KIT.ICON.die(24, f) }))) : null];
    tab.appendChild(h('tr' + (p.seat === v ? '.me' : ''), h('td', h('span.nm', h('span', { html: avHTML(p.seat, 28) }), p.seat === v ? 'You' : p.name)),
      h('td', h('b', D.COINS[sp]), h('span', { html: ico('coin', 14) }), h('div.sm', D.VP[sp] + ' VP' + (D.RUBY[sp] ? ' + ruby' : ''))), h('td', res), h('td', h('b', r.gain >= 0 ? '+' + r.gain : r.gain)), h('td', h('b', p.vp))));
  }
  if (!hotPriv) body.appendChild(tab);
  const lines = hotPriv ? [] : G.log.filter(l => l.i > R.logFrom && (!R.logTo || l.i <= R.logTo)); if (lines.length) { const ev = h('div.evlog', { role: 'log', 'aria-label': 'What happened' }); lines.forEach(l => ev.appendChild(h('div', l.t))); body.appendChild(ev); setTimeout(() => { ev.scrollTop = ev.scrollHeight; }, 0); }
  if (hotShared) body.appendChild(h('p.sm', 'Everybody has seen the table. Next, each maker makes the private choices (shop, rubies) while the others look away.'));
  else if (myq) body.appendChild(decisionBox(me, myq));
  else if (G.phase === 'eval') { const w = G.players.filter(p => p.q && p.seat !== v).map(p => p.name); body.appendChild(h('p.sm', w.length ? 'Waiting for ' + nameList(w) + '...' : 'Counting up...')); }
  const done = G.phase !== 'eval' && !myq && !hotShared;
  const next = G.phase === 'over' ? 'See the final scores' : 'On to day ' + G.round;
  box.appendChild(body);
  const foot = h('div.rsfoot');
  if (UI.rsFoot) UI.rsFoot.forEach(e => foot.appendChild(e));
  else if (hotShared) foot.appendChild(h('div.cbtns', h('button.btn.go', { 'data-a': 'hotgo', type: 'button' }, 'Next: private choices')));
  else { const btns = h('div.cbtns', { style: 'display:flex;gap:8px;flex-wrap:wrap;align-items:center' });
    btns.appendChild(h('button.btn.go' + (done ? '' : '.off'), { 'data-a': 'rscont', type: 'button', disabled: done ? null : true }, done ? next : 'Choose above first'));
    if (typeof NET !== 'undefined' && NET.on && done) btns.appendChild(h('span.sm', 'Closes by itself in a moment.'));
    foot.appendChild(btns); }
  box.appendChild(foot);
  rs.innerHTML = ''; rs.appendChild(box);
  if (keepTop) { const nb = rs.querySelector('.rsbody'); if (nb) nb.scrollTop = keepTop; }
  tipCheck();
  if (typeof NET !== 'undefined' && NET.on && done && !UI.repAuto) { UI.repAuto = setTimeout(() => { UI.repAuto = 0; if (UI.rsMode === 'report' && G.phase !== 'eval') repContinue(); }, 30000); }
}
function repContinue() {
  if (G.phase === 'eval' && (viewSeat() >= 0 && G.players[viewSeat()].q)) return;
  closeRS(true); UI.rsMode = ''; if (G.phase === 'over') { checkFinal(); } else { render(); checkReport(); schedule(); }
}
// ---------- decisions inside the report ----------
function decisionBox(p, q) {
  const info = QINFO[q.h], legal = mvList(p.seat); UI.legal[p.seat] = legal;
  const box = h('div.dec', h('h3', info[0]), h('div.sm', info[1](p, q.d)));
  if (q.h === 'shop') { box.appendChild(shopUI(p, q, legal)); return box; }
  if (q.h === 'ruby') {
    box.appendChild(h('div.sm', 'You have ' + p.rubies + ' rubies. Droplet at ' + p.droplet + '. Flask ' + (p.flask ? 'full' : 'empty') + '.'));
    const row = h('div.opts', { style: 'display:flex;flex-direction:column;gap:5px' }); legal.forEach(m => row.appendChild(moveBtn(m, p))); box.appendChild(row); return box;
  }
  if (q.h === 'de') {
    const row = h('div.opts', { style: 'display:flex;flex-direction:column;gap:5px' }); legal.forEach(m => row.appendChild(moveBtn(m, p)));
    box.append(h('div.sm', 'Space ' + p.res.space + ': ' + q.d.coins + ' coins or ' + q.d.vp + ' VP.'), row); return box;
  }
  const row = h('div.opts', { style: 'display:flex;flex-direction:column;gap:5px' }); legal.forEach(m => row.appendChild(moveBtn(m, p))); box.appendChild(row); return box;
}
function shopUI(p, q, legal) {
  const wrap = h('div'); const coins = q.d.coins, sel = UI.shopSel = (UI.shopSel || []).filter(k => G.supply[k] > 0);
  const cost = sel.reduce((a, k) => a + CF.price(G, k[0], +k.slice(1)), 0);
  const books = h('div.books');
  for (const c of D.SHOP_COLORS) {
    const out = CF.bookOut(G, c), bk = c === 'O' ? D.BOOKS.O[0] : c === 'K' ? D.BOOKS.K[0] : D.BOOKS[c][G.sets[c]];
    const card = h('div.bk' + (out ? '' : '.locked'));
    card.appendChild(h('div.bh', chipN(c + '1', 34), h('b', D.COLORS[c].name, h('div.sm', c === 'O' || c === 'K' ? bk.title : bk.title + ' (' + D.SET_NAMES[G.sets[c]].toLowerCase() + ')'))));
    card.appendChild(h('details', h('summary.sm', { style: 'min-height:34px;display:flex;align-items:center;cursor:pointer' }, out ? 'How it works' : 'Opens day ' + D.BOOK_ROUND[c]), h('div.bx', bk.text)));
    const pr = h('div.pr');
    D.COLORS[c].vals.forEach(val => {
      if (c === 'W' || (c === 'O' && val !== 1)) return; const key = c + val, price = CF.price(G, c, val), left = G.supply[key];
      const on = sel.indexOf(key) >= 0; const others = sel.filter(k => k[0] !== c).reduce((a, k) => a + CF.price(G, k[0], +k.slice(1)), 0);
      const dis = !out || left < 1 || price + others > coins;
      pr.appendChild(h('button' + (on ? '.on' : ''), { 'data-a': 'shopsel', 'data-k': key, type: 'button', disabled: dis && !on ? true : null, 'aria-pressed': on ? 'true' : 'false', 'aria-label': keyName(key) + ' for ' + price + ' coins' + (left < 1 ? ', sold out' : '') }, chipN(key, 24), h('span.pc', h('span', { html: ico('coin', 13) }), price + (left > 0 && left <= 4 ? ' (' + left + ' left)' : left < 1 ? ' sold out' : ''))));
    });
    card.appendChild(pr); books.appendChild(card);
  }
  wrap.appendChild(books);
  const cart = h('div.cart', h('span', 'Cart:'), sel.length ? sel.map(k => h('span.cb', chipN(k, 28), CF.price(G, k[0], +k.slice(1)))) : h('span.sm', 'nothing yet'), h('span', cost + ' of ' + coins + ' coins'));
  UI.rsFoot = [cart, h('div.cbtns', { style: 'display:flex;gap:8px;flex-wrap:wrap' }, h('button.btn.go', { 'data-a': 'shopbuy', type: 'button' }, sel.length ? 'Buy ' + sel.length + (sel.length > 1 ? ' chips' : ' chip') : 'Buy nothing'), sel.length ? h('button.btn.alt', { 'data-a': 'shopclear', type: 'button' }, 'Clear') : null)];
  wrap.appendChild(h('p.sm', 'Leftover coins are lost. Bought chips go into your bag.'));
  return wrap;
}
function shopToggle(key) {
  const c = key[0]; let sel = UI.shopSel.slice(); const i = sel.indexOf(key);
  if (i >= 0) sel.splice(i, 1); else { sel = sel.filter(k => k[0] !== c); sel.push(key); if (sel.length > 2) sel.shift(); }
  UI.shopSel = sel; snd('click'); renderReport();
}
function shopBuy() { const v = viewSeat(); if (v < 0) return; const items = UI.shopSel.slice(); UI.shopSel = []; if (!act({ t: 'buy', items }, v)) toast('That purchase did not work.'); }   // on success afterApply() has already redrawn the report (or put up the pass card in hot-seat)
// ---------- pass the device (hot-seat) ----------
function showPass(seat) {
  const rs = $('#rs'); if (!rs) return; rs.hidden = false; UI.rsMode = 'pass'; UI.rsOpen = true;
  const p = G.players[seat]; const what = G.phase === 'eval' ? 'to make your decisions' : G.phase === 'prep' ? 'to choose' : 'to brew';
  rs.innerHTML = ''; rs.appendChild(h('div.passc', { role: 'dialog', 'aria-label': 'Pass the device' }, h('span.av', { html: avHTML(seat, 96) }), h('h2', 'Pass the device to ' + p.name), h('p', 'Only ' + p.name + ' should look ' + what + '. Your bag stays hidden from the others.'),
    h('button.btn.go', { 'data-a': 'take', type: 'button', style: 'min-width:200px;font-size:18px' }, 'I am ' + p.name + ': take the device')));
}
// ---------- the final screen ----------
function showFinal() {
  const rs = $('#rs'); if (!rs || !G) return; rs.hidden = false; UI.rsMode = 'final'; UI.rsOpen = true;
  const order = G.players.slice().sort((a, b) => b.vp - a.vp || b.last9 - a.last9);
  const box = h('div.rsbox', { role: 'dialog', 'aria-label': 'Final scores' });
  const body = h('div.rsbody'); const wn = G.winners.map(s => pname(s));
  body.appendChild(h('div.win', h('span', { html: avHTML(G.winners[0], 52) }), h('div', G.winText)));
  const t = h('table.fin-tab'); const head = h('tr', h('th', 'Cauldron')); for (let r = 1; r <= D.rounds; r++) head.appendChild(h('th', 'D' + r)); head.append(h('th', 'Extra'), h('th', 'Total')); t.appendChild(head);
  for (const p of order) {
    const gains = []; let sum = 0; for (let r = 1; r <= D.rounds; r++) { const hh = G.hist.find(x => x.round === r && x.seat === p.seat); const gn = hh ? hh.gain : 0; gains.push(gn); sum += gn; }
    const row = h('tr' + (G.winners.indexOf(p.seat) >= 0 ? '.w' : ''), h('td', p.name)); gains.forEach(x => row.appendChild(h('td', x))); row.append(h('td', p.vp - sum), h('td', h('b', p.vp))); t.appendChild(row);
  }
  body.appendChild(h('div', { style: 'overflow-x:auto' }, t));
  body.appendChild(h('p.sm', 'D1 to D9 are the points each day brought. Extra: fortune cards, the 2 rubies for 1 point conversion at the end and points before the brewing began. Tie: the cauldron that went furthest on the last day wins.'));
  const cfg = UI.cfg || {};
  const online = typeof NET !== 'undefined' && NET.on;
  box.appendChild(body);
  box.appendChild(h('div.rsfoot', h('div.cbtns', { style: 'display:flex;gap:8px;flex-wrap:wrap' }, (!online || isHost()) ? h('button.btn.go', { 'data-a': 'again', type: 'button' }, 'Play again') : h('span.sm', 'The host can start a new game.'), h('button.btn.alt', { 'data-a': 'look', type: 'button' }, 'Look at the table'), h('button.btn.alt', { 'data-a': 'menu', type: 'button' }, online ? 'Lobby' : 'Menu'))));
  const conf = h('div.conf'); const cols = ['#f2b81e', '#d6392f', '#3fa04a', '#3b82d6', '#8a55c4']; for (let i = 0; i < 26; i++) { const c = h('i'); c.style.cssText = 'left:' + Math.random() * 100 + '%;background:' + cols[i % 5] + ';animation-delay:' + Math.random() * 2 + 's;animation-duration:' + (2 + Math.random() * 2) + 's'; conf.appendChild(c); }
  rs.innerHTML = ''; rs.appendChild(box); if (!UI.sim) rs.appendChild(conf);
}
// ---------- guided tips (one at a time, in the dock) ----------
const TIPS = [
  { id: 'welcome', t: 'Welcome to the fair', x: () => 'Everyone brews at the same time. Your bag holds 9 chips. Press Draw to pull one out and keep drawing until you decide to stop. The further your chips climb the spiral, the more coins and points you earn.', when: () => G.round === 1 && mineP() && mineP().pot.length === 0 },
  { id: 'place', t: 'Where chips land', x: () => 'A chip lands as many spaces along the dotted path as its number. The big number on a space is its coins, the small brown badge its victory points. The gold ring is where you score if you stop now.', when: () => mineP() && mineP().pot.length >= 1 },
  { id: 'white', t: 'White Fizzpods', x: () => 'Add up the white numbers in your cauldron. If the total goes over the limit (7, unless a fortune card changes it: the counter and the line above Draw say so) the cauldron explodes.', when: () => mineP() && CF.whiteSum(mineP()) > 0 },
  { id: 'risk', t: 'Reading the odds', x: () => 'The line above Draw and Stop shows the chance that the next chip explodes the cauldron, and what you score if you stop now. Under about a quarter is a fair gamble.', when: () => { const p = mineP(); return p && p.st === 'draw' && p.pot.length >= 3 && CF.risk(G, p.seat).pBoom >= .15; } },
  { id: 'flask', t: 'The flask', x: () => 'The Flask button puts the last white chip back into the bag, once a day. Use it right after a white chip moves you close to the limit. Rubies refill it later.', when: () => { const p = mineP(); return p && p.st === 'draw' && p.flask && p.f.canFlask && CF.whiteSum(p) >= 4; } },
  { id: 'stop', t: 'When to stop', x: () => 'Happy with your spiral? Press Stop to keep it. A high space gives coins to shop with and points for the track.', when: () => { const p = mineP(); return p && p.st === 'draw' && p.pot.length >= 4; } },
  { id: 'boom', modal: true, light: true, t: 'Boom!', x: () => 'Your cauldron exploded. You still reach a scoring space, but you must choose: take its victory points OR shop with its coins. Not both, and no bonus die.', when: () => { const p = mineP(); return p && p.boom && UI.rsOpen; } },
  { id: 'report', modal: true, t: 'The day report', x: () => 'When everybody has stopped the day is counted: the furthest cauldron that did not explode rolls the bonus die, chip powers happen, rubies on your space are yours, points move you along the track and the coins buy chips.', when: () => UI.rsOpen && UI.rsMode === 'report' },
  { id: 'shop', modal: true, light: true, t: 'The shop', x: () => 'Coins buy new chips for your bag: pick one or two chips of different colours. Bigger numbers move you further, and every book has its own power: open "How it works" first. Leftover coins are lost.', when: () => { const p = mineP(); return p && p.q && p.q.h === 'shop' && UI.rsOpen; } },
  { id: 'rubies', modal: true, t: 'Rubies', x: () => 'Spend 2 rubies to start every day one space further on, or to refill your flask. On the last day 2 rubies are worth a point.', when: () => { const p = mineP(); return p && p.q && p.q.h === 'ruby' && UI.rsOpen; } },
  { id: 'day2', t: 'Rats and new stalls', x: () => 'From day 2 a player behind the leader gets a rat stone: the first chip starts one space further on for every rat tail between you and the leader. The Sunroot stall opens today, the Dusk Sigh stall on day 3.', when: () => G.round === 2 && G.phase !== 'eval' && !UI.rsOpen },
  { id: 'last', t: 'The last day', x: () => 'No shopping today. Everybody secretly chooses Draw or Stop and all choices are revealed together. Every 5 coins and every 2 rubies you hold turn into a victory point.', when: () => G.round === 9 && G.phase !== 'eval' && !UI.rsOpen }
];
const mineP = () => { const v = viewSeat(); return G && v >= 0 ? G.players[v] : null; };
const tipInRs = () => !!(UI.rsOpen && UI.rsMode === 'report');
function tipSafe(t) { try { return !!t.when(); } catch (e) { return false; } }
function tipStart() { tipCheck(); render(); }
// one tip at a time, in the dock (or at the top of the day report for the report/shop/rubies/boom tips), never over the board or Draw:
// dock tips are spaced out (3 on day 1, 1 on later days, not within 10 log lines of the last one); a tip whose moment has passed is dropped
function tipCheck() {
  if (!G) return;
  if (UI.coach.level === 'off') { UI.tip = null; renderTip(); return; }
  if (UI.tip && (!!UI.tip.modal !== tipInRs() || !tipSafe(UI.tip))) UI.tip = null;
  if (!UI.tip) {
    const lvl = UI.coach.level, guided = UI.mode === 'guided'; UI.tipRound = UI.tipRound || {};
    if (guided || lvl === 'light' || lvl === 'full') for (const t of TIPS) {
      if (UI.tipShown[t.id] || UI.coach.seen[t.id]) continue;
      if (!guided && lvl === 'light' && !t.light) continue;
      if (!guided && lvl === 'full' && t.id === 'welcome') continue;
      if (!!t.modal !== tipInRs()) continue;
      if (!t.modal) { const m = UI.tipMark; if (m && m.round === G.round && G.logN - m.log < 10) continue; if ((UI.tipRound[G.round] || 0) >= (G.round === 1 ? 3 : 1)) continue; }
      if (tipSafe(t)) { UI.tipShown[t.id] = 1; UI.tip = t; UI.coach.seen[t.id] = 1; if (!t.modal) UI.tipRound[G.round] = (UI.tipRound[G.round] || 0) + 1; break; }
    }
  }
  renderTip();
}
function renderTip() {
  const pc = $('#pc'), rt = $('#rstip'), t = UI.tip, on = !!t && UI.coach.level !== 'off';
  const target = on ? (t.modal ? rt : pc) : null;
  for (const e of [pc, rt]) if (e && e !== target) { e.hidden = true; e.innerHTML = ''; }
  document.documentElement.classList.toggle('tipon', !!(on && !t.modal));
  if (!target) return;
  const n = TIPS.filter(x => UI.tipShown[x.id]).length, open = !isPh() || t.modal || !!UI.tipOpen;
  target.hidden = false; target.innerHTML = ''; target.className = 'tipb';
  target.appendChild(h('div.tl', h('span.tt', h('b', 'Tip ' + n + ' of ' + TIPS.length + ': ' + t.t)),
    isPh() && !t.modal ? h('button.btn.alt.tb', { 'data-a': 'tipmore', type: 'button', 'aria-expanded': open ? 'true' : 'false' }, open ? 'Less' : 'More') : null,
    h('button.btn.go.tb', { 'data-a': 'tipok', type: 'button' }, 'Got it')));
  if (open) target.appendChild(h('div.tx', h('p', t.x()), h('button.tlink2', { 'data-a': 'tipoff', type: 'button' }, 'No more tips')));
}
function tipOk() { UI.tip = null; UI.tipMark = { round: G.round, log: G.logN }; tipCheck(); render(); schedule(); }
// ===================== part 5: drawers (scores, log, cards, rules, menu), start screens, events, phone mode, boot =====================
function logHTML() { const e = h('div.logl'); for (let i = G.log.length - 1; i >= Math.max(0, G.log.length - 160); i--) e.appendChild(h('div.ll', h('span.lt', 'D' + G.log[i].round), ' ' + G.log[i].t)); return e; }
function buildRules() {
  const root = h('div.rules');
  const sec = (t, ...k) => { root.appendChild(h('h3', t)); k.forEach(x => root.appendChild(x)); };
  const li = a => a.map(t => h('li', t));
  sec('Turn in one minute', h('ol', ...li([
    'Draw chips from your bag one by one. Each lands that many spaces along the dotted path in your cauldron.',
    'The white chips must add up to 7 or less. Over 7 and the cauldron explodes.',
    'Stop whenever you like. Your last chip decides your space: the big number is coins, the small brown badge is victory points.',
    'Then the day is counted: spend coins on new chips for your bag, spend rubies, and the next day begins.',
    'After day 9 the most victory points wins.'])), h('p.sm', 'The full rules follow.'));
  sec('The goal', h('p', 'You are a travelling potion-maker at the village fair. Over nine days you brew in your cauldron, sell what you make and stock your bag with better ingredients. The most victory points after day 9 wins.'));
  sec('How a day goes', h('ol', ...li([
    'The fair\'s seer turns up a fortune card. Purple cards happen at once, blue cards last all day.',
    'From day 2, anyone behind the leader gets a rat stone: your first chip starts one space further for every rat tail between you and the leader on the score track.',
    'Everybody brews at the same time. Draw a chip from your bag, it lands on the spiral as many spaces after the last chip as its number. Then decide: draw again, or stop.',
    'When everyone has stopped, the day is counted: the bonus die, chip powers, rubies, points, shopping.',
    'Spend rubies if you like, then the next day begins. Everything you drew goes back in your bag together with what you bought.'])));
  sec('Brewing and explosions', h('p', 'The white chips (Fizzpods) are dangerous. If the white numbers in your cauldron add up to more than 7, the cauldron explodes. The last chip stays, you must stop, and you must choose later: take the victory points of your space or shop with its coins, not both. Only white chips count towards the limit.'),
    h('p', 'Your flask can put the last white chip back into the bag (not the chip that exploded you), once per day. It stays empty until you refill it with 2 rubies.'),
    h('p', 'In the last day everybody secretly chooses Draw or Stop, and all choices are revealed together (Stir!). You can also draw at the same moment on every other day: the computers draw while you think.'));
  sec('The spiral', h('p', 'Your scoring space is the one right after your last chip. It shows coins (the big number, for shopping), victory points (the small brown number) and sometimes a ruby. Reach the last space and you get the spoon: 15 points and 35 coins.'));
  sec('Counting the day', h('ol', ...li([
    'Bonus die: among the cauldrons that did not explode, the one whose space has the most coins rolls the die (a tie on coins goes to the one further along the path; if even that is equal, they all roll). It gives 1 or 2 points, a ruby, one step further on for your droplet (your start marker), or a Marrow chip.',
    'Chip powers: black, green and purple chips act now (books say how).',
    'Rubies: a ruby on your scoring space gives you 1 ruby, even if you exploded.',
    'Points: you score the victory points of your space (exploded players choose points or shopping).',
    'Shopping: spend up to the coins of your space on one or two chips of different colours. Leftover coins are lost. Sold-out chips are gone.',
    'Rubies: 2 rubies move your droplet one space (your first chip starts further along every day) or refill the flask.'])));
  sec('The ingredient books', h('p', 'Orange and black are always in the shop. Green, blue and red come from the chosen set (1 to 4); yellow opens before day 2 and purple before day 3. Every colour has its own power: blue, red and yellow act when drawn, green, purple and black after the brew. Open the Cards drawer to read every book.'));
  sec('The last day and the end', h('p', 'On day 9 there is no shopping: every 5 coins and every 2 rubies you hold become 1 victory point. The most points wins; a tie goes to the cauldron that reached furthest on day 9.'));
  sec('Playing it', h('ul', ...li([
    'The ring on the spiral marks where you would score now. The box under the buttons shows the chance that the next chip explodes you.',
    'The small cauldrons at the top are the other players: tap one to watch it. Hot-seat plays one cauldron after the other with a pass screen, online everybody brews in parallel and the host collects every stop.',
    'The Guide in the menu can be Full, Light or Off.'])));
  root.appendChild(h('div', { html: typeof CF_CREDITS !== 'undefined' ? CF_CREDITS : '' }));
  root.appendChild(h('p.sm', 'Cauldron Fair is an original game. Names, text and art are original; the rules follow the box.'));
  return root;
}
// the card reference: every chip, book, fortune card, the track
function buildRef() {
  const root = h('div.rules');
  const sec = (t, open, ...k) => { const d = h('details.refsec', open ? { open: true } : {}, h('summary', t)); k.forEach(x => d.appendChild(x)); root.appendChild(d); return d; };
  const supply = [['W', 'W1', 'W2', 'W3'], ['O', 'O1'], ['G', 'G1', 'G2', 'G4'], ['B', 'B1', 'B2', 'B4'], ['R', 'R1', 'R2', 'R4'], ['Y', 'Y1', 'Y2', 'Y4'], ['P', 'P1'], ['K', 'K1']];
  const t1 = h('table.reft'); t1.appendChild(h('tr', h('th', 'Chip'), h('th', 'In the box'), h('th', 'Where it comes from')));
  for (const row of supply) { const c = row[0]; t1.appendChild(h('tr', h('td', h('span.cb', chipN(c + (D.COLORS[c].vals[0]), 26), D.COLORS[c].name)), h('td', row.slice(1).map(k => k.slice(1) + ': ' + D.SUPPLY[k]).join(' · ')), h('td', c === 'W' ? 'Your starting bag (4 x 1, 2 x 2, 1 x 3) and a white 1 on day 6' : c === 'O' ? 'Shop, bonus die' : (c === 'Y' ? 'Shop from day 2' : c === 'P' ? 'Shop from day 3' : 'Shop')))); }
  sec('Reading the cauldron', true, h('ul', ...[ 'The big number on a space is its coins (what you can spend in the shop).', 'The small brown badge is its victory points; no badge means none.', 'A pink space with a ruby gives you a ruby when it is your scoring space.', 'The dotted path with arrows runs from the droplet (start) outwards to the spoon (15 VP and 35 coins).', 'The gold ring is the space you score if you stop now. A chip lands as many spaces further along as its number.'].map(x => h('li', x))));
  sec('Chips and how many exist (215)', true, h('p.sm', 'You start with 4 white 1, 2 white 2, 1 white 3, 1 Marrow and 1 Mossback. When a kind runs out it cannot be bought.'), t1);
  const bk = h('div'); const sets = G ? G.sets : { G: 1, B: 1, R: 1, Y: 1, P: 1 };
  const bookRow = (c, set, active) => { const b = c === 'O' ? D.BOOKS.O[0] : c === 'K' ? D.BOOKS.K[0] : D.BOOKS[c][set]; const pr = b.price.map((x, i) => [1, 2, 4][i] + ': ' + x).join(' · '); return h('div.rcard', chipN(c + '1', 40), h('div.rt', h('b', D.COLORS[c].name + (c === 'O' || c === 'K' ? '' : ' · ' + D.SET_NAMES[set]) + ' — ' + b.title + (active ? ' (in this game)' : '')), h('div.sm', 'Costs ' + pr + ' coins'), h('div', b.text))); };
  bk.appendChild(h('p.sm', 'The books of this game' + (G ? '' : ' (set 1 shown)') + ':')); ['O', 'K', 'G', 'B', 'R', 'Y', 'P'].forEach(c => bk.appendChild(bookRow(c, sets[c] || 1, true)));
  sec('Ingredient books in this game', true, bk);
  for (let s = 1; s <= 4; s++) { const d = h('div'); ['G', 'B', 'R', 'Y', 'P'].forEach(c => d.appendChild(bookRow(c, s, G && sets[c] === s))); sec(D.SET_NAMES[s] + ': all five books', false, d); }
  const fc = h('div'); D.FORTUNE.forEach(c => fc.appendChild(h('div.rcard', h('span', { style: 'flex:0 0 auto;width:44px;height:44px;border-radius:10px;color:#fff;font-weight:900;display:flex;align-items:center;justify-content:center;font-size:12px;background:' + (c.kind === 'blue' ? '#3b82d6' : '#7a4ab5') }, c.kind === 'blue' ? 'DAY' : 'NOW'), h('div.rt', h('b', c.name + ' (1)'), h('div', c.text)))));
  sec('Fortune cards (24: 11 blue, 13 purple)', false, h('p.sm', 'Blue cards last the whole day, purple cards happen at once. Options that name yellow or purple chips only work once that stall is open.'), fc);
  const tt = h('table.reft'); tt.appendChild(h('tr', h('th', 'Space'), h('th', 'Coins'), h('th', 'VP'), h('th', 'Ruby')));
  for (let i = 1; i < D.TRACK_LEN; i++) tt.appendChild(h('tr', h('td', i === D.SPOON ? '53 (spoon)' : i), h('td', D.COINS[i]), h('td', D.VP[i]), h('td', D.RUBY[i] ? '◆' : '')));
  sec('The cauldron spiral (spaces 1 to 53)', false, h('p.sm', 'Chips sit on spaces 1 to 52. Your scoring space is the one after your last chip. Past 52 the chip stays on 52 and you score the spoon.'), tt);
  const dg = h('div.rcard', h('div.rt', h('b', 'The bonus die (6 faces)'), h('div', D.DIE.map(f => D.DIE_TEXT[f]).join(', ') + '.'), h('div.sm', 'Rolled by the cauldron on the highest coin number among those that did not explode.')));
  sec('Bonus die and rat tails', false, dg, h('div.rcard', h('div.rt', h('b', 'Rat tails'), h('div', 'The score track has a rat tail after every even number of victory points. Count the tails between you and the leader: that many spaces ahead of the droplet is where your first chip starts (from day 2).'))));
  return root;
}
function renderScores() {
  const b = $('#scorebody'); if (!b || !G) return; b.innerHTML = '';
  const order = G.players.slice().sort((a, c) => c.vp - a.vp);
  const mx = Math.max(20, ...G.players.map(p => p.vp));
  const t = h('table.reft'); t.appendChild(h('tr', h('th', 'Cauldron'), h('th', 'VP'), h('th', 'Rubies'), h('th', 'Droplet'), h('th', 'Flask'), h('th', 'Bag')));
  for (const p of order) t.appendChild(h('tr', h('td', h('span.nm', { style: 'display:flex;align-items:center;gap:6px' }, h('span', { html: avHTML(p.seat, 26) }), isMine(p.seat) ? 'You' : p.name)), h('td', h('b', p.vp)), h('td', p.rubies), h('td', p.droplet), h('td', p.flask ? 'full' : 'empty'), h('td', bagN(p))));
  b.appendChild(t);
  b.appendChild(h('h3', 'Score track'));
  for (const p of order) { const w = Math.min(100, 100 * p.vp / mx); b.appendChild(h('div', { style: 'display:flex;align-items:center;gap:8px;margin:5px 0' }, h('span', { style: 'width:62px;font-weight:800;font-size:13px' }, p.name), h('div', { style: 'flex:1;height:16px;border-radius:8px;background:#e9dcc0;overflow:hidden' }, h('i', { style: 'display:block;height:100%;border-radius:8px;width:' + w + '%;background:' + pcol(p.seat) })), h('b', p.vp))); }
  const ro = G.rep ? G.rep.round : 0; const days = []; for (let r = 1; r <= D.rounds; r++) if (G.hist.some(x => x.round === r)) days.push(r);
  if (days.length) { b.appendChild(h('h3', 'Each day')); const dt = h('table.reft'); const hr = h('tr', h('th', 'Cauldron')); days.forEach(r => hr.appendChild(h('th', 'D' + r))); dt.appendChild(hr); for (const p of G.players) { const rw = h('tr', h('td', p.name)); days.forEach(r => { const x = G.hist.find(y => y.round === r && y.seat === p.seat); rw.appendChild(h('td', x ? (x.boom ? '✖ ' : '') + '+' + x.gain : '')); }); dt.appendChild(rw); } b.appendChild(h('div', { style: 'overflow-x:auto' }, dt)); b.appendChild(h('p.sm', '✖ = the cauldron exploded that day.')); }
}
function renderDrawers() {
  if (!GX.open || !G) return;
  if (GX.open === 'logd') { const b = $('#logbody'); b.innerHTML = ''; b.appendChild(logHTML()); }
  if (GX.open === 'scored') renderScores();
  if (GX.open === 'setd') renderMenu();
  if (GX.open === 'refd') { const b = $('#refbody'); if (b && !b.dataset.k) { b.dataset.k = '1'; b.innerHTML = ''; b.appendChild(buildRef()); } }
}
function renderMenu() {
  const b = $('#setbody'); b.innerHTML = '';
  const online = typeof NET !== 'undefined' && NET.on;
  const row = (l, ...k) => b.appendChild(h('div.mrow', h('div.lbl', l), h('div.mbt', k)));
  const tog = (name, on, label) => h('button.btn' + (on ? '' : '.alt'), { 'data-a': name, type: 'button', 'aria-pressed': on ? 'true' : 'false' }, label + ': ' + (on ? 'On' : 'Off'));
  if (online) row('Online', h('button.btn', { 'data-a': 'netopen', type: 'button' }, 'Lobby'), h('button.btn.alt', { 'data-a': 'netleave', type: 'button' }, isHost() ? 'Close the room' : 'Leave the room'));
  else row('Game', h('button.btn', { 'data-a': 'menu', type: 'button' }, 'New game'), h('button.btn.alt', { 'data-a': 'save', type: 'button' }, 'Save'), h('button.btn.alt' + (hasSave() ? '' : '.dis'), { 'data-a': 'loadsave', type: 'button', disabled: hasSave() ? null : true }, 'Load'));
  if (!online) row('Computer speed', ...[['Fast', 150], ['Normal', 650], ['Slow', 1300]].map(([n, v]) => h('button.btn' + (AIDELAY === v ? '' : '.alt'), { 'data-a': 'speed', 'data-v': v, type: 'button' }, n)));
  if (!online) row('Guide', ...['full', 'light', 'off'].map(n => h('button.btn' + (UI.coach.level === n ? '' : '.alt'), { 'data-a': 'guide', 'data-v': n, type: 'button' }, n[0].toUpperCase() + n.slice(1))));
  row('Sound', tog('sound', UI.prefs.sound, 'Sound effects'), tog('music', UI.prefs.music, 'Music'));
  { const gp = typeof gfxPref === 'function' ? gfxPref() : 'auto'; row('Graphics' + (typeof PX !== 'undefined' && PX.on ? (gp === 'auto' ? ' (now ' + PX.q + ')' : '') : ' (simple view)'), ...[['auto', 'Auto'], ['high', 'High'], ['medium', 'Medium'], ['low', 'Low']].map(([v, n]) => h('button.btn' + (gp === v ? '' : '.alt'), { 'data-a': 'gfx', 'data-v': v, type: 'button', 'aria-pressed': gp === v ? 'true' : 'false' }, n))); }
  let sp = ''; try { sp = window.PerfHUD && PerfHUD.buttonsHTML ? PerfHUD.buttonsHTML('btn alt') : ''; } catch (e) { }
  row('Info', h('button.btn.alt', { 'data-a': 'rules', type: 'button' }, 'How to play'), h('span.tinyc', { html: sp }));
  b.appendChild(h('p.sm', 'Cauldron Fair is an original game. Names, text and art are original; the audio credits are in How to play.'));
}
// ---------- start screens: painted title -> setup (character cards) / online ----------
const SETCHOICES = [[1, 'Beginner set', 'Set 1: easiest to learn, recommended for a first game.'], [2, 'Set 2', 'Safe harbour, side pockets, double steps.'], [3, 'Set 3', 'Lucky sevens, pod pushers, roomier pots.'], [4, 'Set 4', 'Ruby treasure, upgrades, stretching roots.'], ['random', 'Random mix', 'Every colour gets a random set 1 to 4.']];
function optObj() { const o = UI.opt = UI.opt || Object.assign({}, DEF, { seats: DEF.seats.slice(), lvBy: Object.assign({}, DEF.lvBy) }); o.np = o.seats.length + 1; return o; }
function setNp(n) { const o = optObj(), want = Math.max(1, Math.min(3, n - 1)); const st = o.seats.slice().filter(c => c !== o.me); while (st.length > want) st.pop(); for (let c = 0; c < 4 && st.length < want; c++) if (c !== o.me && st.indexOf(c) < 0) st.push(c); o.seats = st; o.np = st.length + 1; }
function toggleChar(c) { const o = optObj(); if (c === o.me) return; const st = o.seats.slice(), i = st.indexOf(c); if (i >= 0) { if (st.length > 1) st.splice(i, 1); else { toast('At least one other maker joins you.'); return; } } else { if (st.length >= 3) st.shift(); st.push(c); } o.seats = st; o.np = st.length + 1; }
function setMe(c) { const o = optObj(); if (c === o.me) return; o.me = c; o.seats = o.seats.filter(x => x !== c); for (let k = 0; k < 4 && o.seats.length < Math.max(1, o.np - 1); k++) if (k !== c && o.seats.indexOf(k) < 0) o.seats.push(k); o.np = o.seats.length + 1; }
function logoSVG() { return '<svg viewBox="0 0 24 24"><circle cx="12" cy="13.5" r="9" fill="#2a8a80" stroke="#fff6dc" stroke-width="1.6"/><ellipse cx="12" cy="8.5" rx="8" ry="3" fill="#5fc6a8" stroke="#fff6dc" stroke-width="1.2"/><circle cx="9" cy="14.5" r="1.8" fill="#fff6dc"/><circle cx="14.5" cy="16.5" r="1.3" fill="#fff6dc"/><circle cx="15" cy="5.5" r="1.4" fill="#fff6dc" opacity=".8"/></svg>'; }
function tableLine(o) { const nm = o.seats.map(c => PN[c]); return 'You (' + PN[o.me] + ') + ' + nameList(nm) + ' · ' + o.np + ' makers'; }
function renderStart() {
  const s = $('#start'); s.hidden = false; s.innerHTML = '';
  const rs = $('#rs'); if (rs && !UI.rsOpen) { rs.hidden = true; }
  if (typeof NET !== 'undefined' && NET.on) { s.dataset.v = 'net'; netStartScreen(s); return; }
  if (!UI.sv) UI.sv = UI.onl ? 'online' : 'title';
  s.dataset.v = UI.sv;
  if (UI.sv === 'title') { s.appendChild(titleEl()); return; }
  if (KIT.ART.title) s.appendChild(h('img.ttl-bg.dim', { src: KIT.ART.title, alt: '' }));
  if (UI.sv === 'online') { s.appendChild(onlineEl()); return; }
  s.appendChild(setupEl());
}
function titleEl() {
  const bg = KIT.ART.title ? h('img.ttl-bg', { src: KIT.ART.title, alt: '' }) : h('div.ttl-bg.ttl-plain');
  const sv = hasSave();
  return h('div.ttl', bg, h('div.ttl-in',
    h('div', h('h1.logo', h('span.ic', { html: logoSVG() }), h('span', 'Cauldron Fair')), h('p.tag', 'Brew bold. Stop wise.')),
    h('div.tbtns',
      h('button.tbtn.go', { 'data-a': 'play', type: 'button' }, h('b', 'Play'), h('span', 'against the computer makers')),
      h('button.tbtn', { 'data-a': 'online', type: 'button' }, h('b', 'Online'), h('span', 'with friends, free')),
      sv ? h('button.tbtn', { 'data-a': 'loadsave', type: 'button' }, h('b', 'Resume'), h('span', 'your saved fair')) : null,
      h('button.tlink', { 'data-a': 'rules', type: 'button' }, 'How to play'))));
}
function charCard(c, o) {
  const ch = D.CHARS[c], me = c === o.me, on = me || o.seats.indexOf(c) >= 0, lv = (o.lvBy && o.lvBy[c]) || TEMPER[c];
  const card = h('article.dcard' + (on ? '.on' : ''), { 'aria-label': ch.name + (me ? ', you' : on ? ', at the table' : ', not at the table') }); card.style.setProperty('--dc', ch.css);
  card.append(h('div.dtop', h('div.dimg', { html: avHTML(c, 120).replace(/chefOf/, '') }), h('h3', ch.name, h('small', ch.title + (me ? ' · you' : on ? ' · ' + lv : '')))),
    h('div.dtx', h('p.story', ch.story), h('p.enjoy', ch.like),
      h('div.drow', me ? h('span.sm', 'You play this maker.') : h('button.chipb' + (on ? '.on' : ''), { 'data-a': 'seatchar', 'data-c': c, type: 'button', 'aria-pressed': on ? 'true' : 'false' }, on ? 'At the table ✓' : 'Invite'),
        !me && on ? h('span.lvs', ['easy', 'normal', 'hard'].map(v => h('button.chipb' + (lv === v ? '.on' : ''), { 'data-a': 'lv', 'data-c': c, 'data-v': v, type: 'button', 'aria-pressed': lv === v ? 'true' : 'false', 'aria-label': ch.name + ' plays ' + v }, v))) : null,
        !me ? h('button.chipb', { 'data-a': 'setme', 'data-c': c, type: 'button', 'aria-label': 'I want to play ' + ch.name }, 'Be ' + ch.name) : null)));
  return card;
}
function setupEl() {
  const o = optObj(), ph = isPh(), open = !!UI.cfgOpen;
  const head = h('div.shead', h('button.px.sback', { 'data-a': 'title', type: 'button', 'aria-label': 'Back to the title' }, '‹'), h('h2', 'Who brews at the fair?'));
  const sum = h('div.ssum', h('div.sfaces', [o.me].concat(o.seats).map(c => h('span', { html: avHTML(c, 64) }))), h('span.sline', tableLine(o) + ' · ' + (SETCHOICES.find(x => x[0] === o.sets) || SETCHOICES[0])[1]), h('button.btn.alt', { 'data-a': 'cfgopen', type: 'button', 'aria-expanded': open ? 'true' : 'false' }, 'Configure'));
  const cfg = h('div.cfg#cfg', { hidden: ph && !open ? true : null, role: ph ? 'dialog' : null, 'aria-label': ph ? 'Configure the table' : null },
    ph ? h('div.cfghead', h('b', 'Configure the table')) : null,
    h('div.seg', h('span.lbl', 'Table for'), [2, 3, 4].map(v => h('button.chipb' + (o.np === v ? '.on' : ''), { 'data-a': 'opt', 'data-k': 'np', 'data-v': v, type: 'button', 'aria-pressed': o.np === v ? 'true' : 'false' }, v))),
    h('div.seg', h('span.lbl', 'Ingredient books'), h('div.setpick', SETCHOICES.map(([v, n]) => h('button.chipb' + (o.sets === v ? '.on' : ''), { 'data-a': 'opt', 'data-k': 'sets', 'data-v': v, type: 'button', 'aria-pressed': o.sets === v ? 'true' : 'false' }, n)))),
    h('p.sm', (SETCHOICES.find(x => x[0] === o.sets) || SETCHOICES[0])[2]),
    h('div.dgrid', [0, 1, 2, 3].map(c => charCard(c, o))),
    ph ? h('div.cfgfoot', h('button.btn.go', { 'data-a': 'cfgclose', type: 'button' }, 'Done')) : null);
  const first = !UI.prefs.played;
  const bStart = h('button.sbtn' + (first ? '' : '.big'), { 'data-start': 'vs', 'data-a': 'start', 'data-m': 'vs', type: 'button' }, h('b', 'Start the fair'), h('span', 'You against ' + nameList(o.seats.map(c => PN[c]))));
  const bGuide = h('button.sbtn' + (first ? '.big' : ''), { 'data-start': 'guided', 'data-a': 'guided', type: 'button' }, h('b', 'Guided first game'), h('span', first ? 'New here? Two makers, beginner books and short tips' : 'Two makers, beginner books, tips'));
  const go = h('div.sgo', first ? [bGuide, bStart] : [bStart],
    h('div.sgrid3', first ? null : bGuide,
      h('button.sbtn', { 'data-start': 'hot', 'data-a': 'start', 'data-m': 'hot', type: 'button' }, h('b', 'Hot-seat'), h('span', o.np + ' people, one device')),
      h('button.sbtn', { 'data-start': 'ai', 'data-a': 'start', 'data-m': 'ai', type: 'button' }, h('b', 'Watch'), h('span', 'the makers play'))));
  return h('div.setup.scard', head, ph ? sum : h('p.ssub', 'Pick who is at the fair and choose a book set. Every maker has a temper; change their level if you like.'), cfg, go);
}
function onlineEl() {
  return h('div.setup.scard.onlv', h('div.shead', h('button.px.sback', { 'data-a': 'title', type: 'button', 'aria-label': 'Back to the title' }, '‹'), h('h2', 'Play online')),
    h('p.ssub', 'Host a fair and send friends the code or the link. Every browser connects directly; nobody sees your bag. Everybody brews at the same time. Empty seats go to the computer makers.'),
    h('details.online#onl', { open: true }, h('summary', 'Free, peer to peer'), h('div#netblock', netInner())));
}
function showStart() { try { GX.close(); } catch (e) { } UI.sv = 'title'; UI.cfgOpen = false; const pc = $('#pc'); if (pc) { pc.hidden = true; pc.innerHTML = ''; } closeRS(true); Object.keys(UI.tm).forEach(k => clearTimeout(UI.tm[k])); UI.tm = {}; renderStart(); }
// ---------- events ----------
document.addEventListener('click', ev => {
  const t = ev.target.closest('[data-a],[data-start]'); if (!t) return;
  const a = t.dataset.a, d = t.dataset;
  if (typeof netClick === 'function' && netClick(a, t)) return;
  if (d.start && !a) { newGame(d.start); return; }
  switch (a) {
    case 'mv': {
      const v = viewSeat(); const m = (UI.legal[v] || [])[+d.i];
      if (m) {
        if (m.t === 'flask') { const pl = G.players[v], wc = pl.pot.filter(c => c.c === 'W').length; if (wc <= 1 && UI.flaskArm !== pl.ver) { UI.flaskArm = pl.ver; toast('That is your only white chip. Tap Flask again to put it back.'); break; } }
        if (UI.tip && !UI.tip.modal && (m.t === 'draw' || m.t === 'stop')) { UI.tip = null; UI.tipMark = { round: G.round, log: G.logN }; renderTip(); }
        act(m, v);
      }
      break;
    }
    case 'hotgo': if (G && G.rep) { UI.hotShared = G.rep.round; closeRS(true); updateHolder(); checkReport(); render(); } break;
    case 'legx': UI.prefs.legendOff = true; savePrefs(); renderLegend(); break;
    case 'blgx': UI.prefs.blgSeen = true; savePrefs(); renderBlg(); break;
    case 'tipmore': UI.tipOpen = !UI.tipOpen; renderTip(); break;
    case 'fort': t.classList.toggle('open'); break;
    case 'focus': UI.focus = +d.seat; UI.potSig = ''; render(); break;
    case 'rscont': repContinue(); break;
    case 'shopsel': shopToggle(d.k); break;
    case 'shopbuy': shopBuy(); break;
    case 'shopclear': UI.shopSel = []; renderReport(); break;
    case 'take': takeDevice(); break;
    case 'tipok': tipOk(); break;
    case 'tipoff': UI.coach.level = 'off'; tipOk(); savePrefs(); break;
    case 'again': { const m = UI.mode, c = UI.cfg || {}; closeRS(true); UI.overShown = false; newGame(m === 'net' ? 'vs' : m, c); break; }
    case 'look': closeRS(true); UI.overShown = true; render(); break;
    case 'play': UI.sv = 'setup'; renderStart(); break;
    case 'online': UI.sv = 'online'; UI.onl = true; renderStart(); break;
    case 'title': UI.sv = 'title'; UI.cfgOpen = false; renderStart(); break;
    case 'cfgopen': UI.cfgOpen = true; renderStart(); break;
    case 'cfgclose': UI.cfgOpen = false; renderStart(); break;
    case 'seatchar': toggleChar(+d.c); renderStart(); break;
    case 'setme': setMe(+d.c); renderStart(); break;
    case 'gfx': setGfx && setGfx(d.v); renderMenu(); break;
    case 'menu': showStart(); break;
    case 'start': newGame(d.m, optObj()); break;
    case 'guided': newGame('guided', optObj()); break;
    case 'opt': { const o = optObj(); if (d.k === 'np') setNp(+d.v); else if (d.k === 'sets') o.sets = d.v === 'random' ? 'random' : +d.v; renderStart(); break; }
    case 'lv': { const o = optObj(); o.lvBy = Object.assign({}, o.lvBy); o.lvBy[+d.c] = d.v; renderStart(); break; }
    case 'rules': GX.show('rulesd'); break;
    case 'save': toast(save() ? 'Game saved.' : 'Could not save.'); break;
    case 'loadsave': if (!loadSave()) toast('No saved game.'); break;
    case 'speed': AIDELAY = +d.v; savePrefs(); renderMenu(); break;
    case 'guide': UI.coach.level = d.v; savePrefs(); renderMenu(); tipCheck(); break;
    case 'sound': UI.prefs.sound = !UI.prefs.sound; savePrefs(); try { if (window.GA) GA.setSfx(UI.prefs.sound); } catch (e) { } renderMenu(); break;
    case 'music': UI.prefs.music = !UI.prefs.music; savePrefs(); try { if (window.GA) GA.setMusic(UI.prefs.music); } catch (e) { } sndMusic(); renderMenu(); break;
  }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') { if (UI.rsMode === 'final' && UI.overShown) closeRS(true); else if (UI.rsMode === 'report' && G && G.phase !== 'eval') repContinue(); } });
// ---------- phone mode ----------
function renderLegend() {
  const e = $('#legend'); if (!e) return; const on = G && UI.started && !UI.prefs.legendOff && (G.round <= 2 || UI.mode === 'guided') && G.phase !== 'over';
  e.hidden = !on; if (!on) { e.innerHTML = ''; return; } if (e.dataset.k) return; e.dataset.k = 1;
  e.append(h('span.lg', h('span.lgn', '12'), 'coins'), h('span.lg', h('span.lgb', '3'), 'VP'), h('span.lg', h('span', { html: ico('ruby', 16) }), 'ruby'), h('span.lg', 'path \u2192'), h('button.lgx', { 'data-a': 'legx', type: 'button', 'aria-label': 'Hide this key' }, '\u00d7'));
}
function renderBlg() {
  const e = $('#blg'); if (!e) return; const on = G && UI.started && isPh() && !UI.prefs.blgSeen && G.round === 1 && G.phase !== 'over';
  e.hidden = !on; if (!on || e.dataset.k) return; e.dataset.k = 1;
  e.append(h('div', h('b', 'Top buttons, left to right: '), 'Scores, Log, Chips and cards, How to play, Menu.'), h('button.btn.go', { 'data-a': 'blgx', type: 'button' }, 'OK'));
}
function isPh() { return document.documentElement.classList.contains('ph'); }
function applyPhone() {
  const q = /[?&]phone=(\d)/.exec(location.search); const w = innerWidth, hh = innerHeight, short = Math.min(w, hh);
  let ph = short <= 500 || (window.matchMedia && matchMedia('(pointer:coarse)').matches && short <= 600);
  if (q) ph = q[1] === '1';
  const r = document.documentElement.classList, was = r.contains('ph');
  const shortP = ph && w < hh && hh < 600; r.toggle('ph', ph); r.toggle('ph-short', shortP); document.documentElement.style.setProperty('--dockh', (shortP ? 140 : Math.max(150, Math.min(196, Math.round(hh * .25)))) + 'px'); r.toggle('ph-p', ph && w < hh); r.toggle('ph-l', ph && w >= hh);
  document.documentElement.style.setProperty('--rail', Math.max(220, Math.min(292, Math.round(w * .33))) + 'px');
  document.documentElement.style.setProperty('--gx-sheet-h', (ph ? 'var(--dockh)' : '46dvh'));
  placePrompt(); if (was !== ph) { if (G && UI.started) render(); const st = $('#start'); if (st && !st.hidden && !(typeof NET !== 'undefined' && NET.on) && UI.sv === 'setup') renderStart(); }
}
let rzT = 0;
function onResize() { clearTimeout(rzT); rzT = setTimeout(() => { applyPhone(); if (G && UI.started) { UI.potSig = ''; render(); } }, 60); }
// ---------- boot ----------
function boot() {
  GX.init({ key: 'cf' });
  GX.drawer('rulesd', 'How to play', buildRules(), true);
  GX.drawer('refd', 'Chips, books and cards', h('div#refbody'), true);
  GX.drawer('logd', 'Log', h('div#logbody'));
  GX.drawer('scored', 'Scores and players', h('div#scorebody'));
  GX.drawer('setd', 'Menu', h('div#setbody'));
  GX.onShow = id => { renderDrawers(); };
  loadPrefs(); applyPhone();
  addEventListener('resize', onResize); addEventListener('orientationchange', onResize);
  const bd = $('#board'); if (window.ResizeObserver) new ResizeObserver(() => { if (G && UI.started) { clearTimeout(rzT); rzT = setTimeout(() => { if (G && UI.started) { UI.potSig = ''; render(); } }, 40); } }).observe(bd);
  try { if (window.GA) { const A = typeof GA_DATA !== 'undefined' ? GA_DATA : {}; GA.init({ sfx: A.sfx || {}, music: A.music || {}, key: 'cf' }); GA.setSfx(UI.prefs.sound); GA.setMusic(UI.prefs.music); } } catch (e) { }
  if (typeof pxPerfReg === 'function') pxPerfReg();
  if (typeof pxInit === 'function') pxInit().then(ok => { if (ok) { pxPerfReg(); if (G && UI.started) render(); } });
  if (/[?&]seed=(\d+)/.test(location.search)) UI.seed = +RegExp.$1;
  if (typeof netInit === 'function') netInit();
  renderStart();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
// ===================== part 7: the painted cauldron (PixiJS 8: WebGL, else Pixi's canvas renderer, else the plain SVG view) =====================
// The DOM stays the layout / hit / accessibility layer (thumbnails, buttons, the invisible SVG cauldron). When the Pixi cauldron is on (html.px)
// the SVG pot is hidden and this layer draws the painted cauldron, the spiral spaces, the chips and the droplet at the same place, reading the
// box of #cwrap after every render(). Each chip that lands flies out of the bag in an arc with a splash and rising bubbles; the potion bubbles
// more the fuller the pot gets; an explosion is a puff of smoke, a red flash and a shake; a flask puts the chip back into the bag.
// Nothing here changes the game state: it only follows it (so hidden information stays hidden: a sprite only shows what the pot shows).
const PX = { on: false, app: null, q: 'high', res: 1, kind: '', cv: null, L: {}, tex: {}, img: {}, chips: new Map(), tweens: [], parts: [], amb: [], t: 0, last: 0, dirty: true, err: '', ready: false, raf: 0,
  S: 0, cx: 0, cy: 0, k: 1, seat: -1, flyIds: {}, backIds: {}, snap: true, bag: { x: 0, y: 0 }, moving: false, frames: 0, shake: 0, flash: 0, boomSeat: -1, board: null, texKey: '' };
const PXQ = { high: { pr: 2, fx: 1, parts: 1 }, medium: { pr: 1.5, fx: .55, parts: .5 }, low: { pr: 1, fx: 0, parts: 0 } };
const pxRM = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };
function gfxAuto() { const n = navigator.hardwareConcurrency || 4, mem = navigator.deviceMemory || 4, ph = isPh(); if (n <= 2 || mem <= 2) return 'low'; if (PX.soft) return 'low'; return ph ? 'medium' : 'high'; }
function gfxPref() { return UI.prefs.gfx || 'auto'; }
function gfxLevel() { const p = gfxPref(); return p === 'auto' ? (PX.autoQ || gfxAuto()) : p; }
// ---- boot ----
async function pxInit() {
  try {
    if (/jsdom/i.test(navigator.userAgent || '') || /[?&]px=0/.test(location.search) || typeof CF_ART === 'undefined' || !KIT.ART.cauldron) return false;
    if (!window.PIXI) { const src = document.getElementById('pixi-src'); if (!src) return false; const s = document.createElement('script'); s.textContent = src.textContent; document.head.appendChild(s); }
    if (!window.PIXI || !PIXI.Application) return false;
    const bd = $('#bd'); const cv = document.createElement('canvas'); cv.id = 'pxc'; cv.setAttribute('aria-hidden', 'true'); bd.insertBefore(cv, bd.firstChild);
    PX.q = gfxLevel(); PX.res = pxBasePR();
    const want = /[?&]px=canvas/.test(location.search) ? ['canvas'] : ['webgl', 'canvas']; let app = null;
    for (const pref of want) {
      try {
        const a = new PIXI.Application();
        await a.init({ canvas: cv, backgroundAlpha: 0, antialias: false, resolution: PX.res, autoDensity: true, preference: pref, autoStart: false, sharedTicker: false, width: Math.max(16, bd.clientWidth), height: Math.max(16, bd.clientHeight), powerPreference: 'low-power', failIfMajorPerformanceCaveat: false });
        app = a; PX.kind = (a.renderer && a.renderer.name) || pref; break;
      } catch (e) { PX.err += pref + ': ' + (e && e.message || e) + '; '; }
    }
    if (!app) { cv.remove(); return false; }
    PX.app = app; PX.cv = cv;
    try { const gl = app.renderer.gl; if (gl) { const ext = gl.getExtension('WEBGL_debug_renderer_info'); const r = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : ''; if (/swiftshader|llvmpipe|software/i.test(r)) PX.soft = true; PX.gpu = r; } } catch (e) { }
    if (gfxPref() === 'auto') { PX.q = gfxLevel(); pxSetRes(pxBasePR()); }
    cv.addEventListener('webglcontextlost', e => { e.preventDefault(); pxOff('context lost'); });
    await pxTextures();
    const st = app.stage, C = () => new PIXI.Container();
    PX.root = C(); st.addChild(PX.root);
    PX.L = { board: C(), amb: C(), chips: C(), mark: C(), fly: C(), fx: C() };
    for (const k of ['board', 'amb', 'chips', 'mark', 'fly', 'fx']) PX.root.addChild(PX.L[k]);
    PX.boardSp = new PIXI.Sprite(PIXI.Texture.EMPTY); PX.L.board.addChild(PX.boardSp);
    PX.flashG = new PIXI.Graphics(); PX.L.fx.addChild(PX.flashG);
    PX.ring = new PIXI.Graphics(); PX.L.mark.addChild(PX.ring);
    PX.drop = new PIXI.Sprite(PX.tex.droplet); PX.drop.anchor.set(.5, .62); PX.L.mark.addChild(PX.drop);
    PX.rat = new PIXI.Sprite(PX.tex.rat); PX.rat.anchor.set(.5, .6); PX.rat.visible = false; PX.L.mark.addChild(PX.rat);
    PX.on = true; PX.ready = true; document.documentElement.classList.add('px'); $('#bd').classList.add('hasart');
    pxApplyQ();
    if (window.ResizeObserver) new ResizeObserver(() => { pxResize(); }).observe(bd);
    pxResize(); pxLoop();
    return true;
  } catch (e) { console.warn('painted cauldron off:', e); pxOff(String(e && e.message || e)); return false; }
}
function pxOff(why) {
  PX.on = false; PX.err += (why || '') + ';'; document.documentElement.classList.remove('px');
  try { if (PX.cv) PX.cv.remove(); } catch (e) { }
  try { if (G && UI.started) { UI.potSig = ''; render(); } } catch (e) { }
}
function pxBasePR() { const d = window.devicePixelRatio || 1; const q = PXQ[PX.q] || PXQ.high; const w = Math.min(q.pr, d); return window.PerfHUD && PerfHUD.pixelRatio ? PerfHUD.pixelRatio(w) : w; }
function pxSetRes(v) { PX.res = v; if (PX.app && PX.app.renderer) { try { PX.app.renderer.resolution = v; pxResize(true); } catch (e) { } } }
function pxApplyQ() { PX.q = gfxLevel(); pxSetRes(pxBasePR()); PX.texKey = ''; PX.dirty = true; if (PX.on) pxDirty(); }
function setGfx(v) { UI.prefs.gfx = v; savePrefs(); PX.autoQ = null; if (PX.on) { pxApplyQ(); pxPerfReg(); } }
// ---- textures ----
function pxLoadImg(url) { return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; }); }
async function pxTextures() {
  const ids = Object.keys(KIT.ART);
  await Promise.all(ids.map(async k => { try { const im = await pxLoadImg(KIT.ART[k]); PX.img[k] = im; PX.tex[k] = PIXI.Texture.from(im); } catch (e) { } }));
  const mk = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); return PIXI.Texture.from(c); };
  const radial = stops => (x, w, h) => { const g = x.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); stops.forEach(s => g.addColorStop(s[0], s[1])); x.fillStyle = g; x.fillRect(0, 0, w, h); };
  PX.tex.shadow = mk(64, 64, radial([[0, 'rgba(20,8,24,.55)'], [.6, 'rgba(20,8,24,.28)'], [1, 'rgba(20,8,24,0)']]));
  PX.tex.glow = mk(64, 64, radial([[0, 'rgba(255,225,120,.95)'], [.5, 'rgba(255,190,60,.4)'], [1, 'rgba(255,170,40,0)']]));
  PX.tex.red = mk(64, 64, radial([[0, 'rgba(255,120,60,.95)'], [.55, 'rgba(230,60,30,.45)'], [1, 'rgba(200,30,20,0)']]));
}
// the painted chip with its number (the same look as the SVG chip), cached per colour/value
function pxChipTex(key) {
  const k = 'chip:' + key; if (PX.tex[k]) return PX.tex[k];
  const c = key[0], v = +key.slice(1), D2 = 128, cv = document.createElement('canvas'); cv.width = cv.height = D2; const x = cv.getContext('2d');
  const im = PX.img['chip-' + c]; if (im) x.drawImage(im, 0, 0, D2, D2); else { x.fillStyle = D.COLORS[c].css; x.beginPath(); x.arc(64, 64, 60, 0, 7); x.fill(); }
  x.font = '900 ' + (c === 'W' ? 56 : 58) + 'px Nunito,Trebuchet MS,Segoe UI,sans-serif'; x.textAlign = 'center'; x.textBaseline = 'alphabetic'; x.lineJoin = 'round';
  const light = c === 'W' || c === 'Y'; x.lineWidth = light ? 5 : 8; x.strokeStyle = light ? '#fff' : '#2a1608'; x.fillStyle = light ? '#3a2616' : '#fff';
  const ty = Math.round(D2 * (c === 'W' ? .79 : .75)); x.strokeText(String(v), 64, ty); x.fillText(String(v), 64, ty);
  return PX.tex[k] = PIXI.Texture.from(cv);
}
const BANDS = { n0: '#efe6cf', n1: '#f3efd0', n5: '#e3efc8', n10: '#cde6c4', ruby: '#f4c6cc', spoon: '#f0d8a0' };
function padKind(i) { return i === D.SPOON ? 'spoon' : D.RUBY[i] ? 'ruby' : D.VP[i] >= 10 ? 'n10' : D.VP[i] >= 5 ? 'n5' : D.VP[i] >= 1 ? 'n1' : 'n0'; }
// the static board: painted cauldron + the 54 spaces with their numbers, drawn once per size into one texture
function pxBuildBoard(S) {
  const r = Math.min(2.2, Math.max(1, PX.res)), W = Math.max(64, Math.round(S * r)), cv = document.createElement('canvas'); cv.width = cv.height = W; const x = cv.getContext('2d'); const R = KIT.GEO.R, u = W / (2 * R);
  const cauldron = PX.img.cauldron; if (cauldron) x.drawImage(cauldron, 0, 0, W, W); else { x.fillStyle = '#2a8a80'; x.beginPath(); x.arc(W / 2, W / 2, W / 2 - 4, 0, 7); x.fill(); }
  const pads = {}, pd = Math.round(.98 * u); for (const kd in BANDS) { const c = document.createElement('canvas'); c.width = c.height = pd; const y = c.getContext('2d'); if (PX.img.pad) y.drawImage(PX.img.pad, 0, 0, pd, pd); else { y.fillStyle = '#f4ecd2'; y.beginPath(); y.arc(pd / 2, pd / 2, pd / 2, 0, 7); y.fill(); } y.globalCompositeOperation = 'source-atop'; y.globalAlpha = .6; y.fillStyle = BANDS[kd]; y.fillRect(0, 0, pd, pd); pads[kd] = c; }
  const ff = 'Nunito,Trebuchet MS,Segoe UI,sans-serif';
  { const P0 = KIT.GEO.pts; x.save(); x.strokeStyle = 'rgba(255,246,220,.5)'; x.lineWidth = Math.max(1.5, .09 * u); x.setLineDash([.1 * u, .12 * u]); x.beginPath(); P0.forEach((q, i) => { const X = W / 2 + q.x * u, Y = W / 2 + q.y * u; i ? x.lineTo(X, Y) : x.moveTo(X, Y); }); x.stroke(); x.restore(); }
  for (let i = 0; i < KIT.GEO.pts.length; i++) {
    const p = KIT.GEO.pts[i], X = W / 2 + p.x * u, Y = W / 2 + p.y * u;
    x.globalAlpha = i === 0 ? .85 : .96; x.drawImage(pads[padKind(i)], X - pd / 2, Y - pd / 2); x.globalAlpha = 1;
    if (i === 0) continue;
    x.textAlign = 'center'; x.fillStyle = '#4a2a22';
    if (i === D.SPOON) { x.font = '900 ' + Math.round(.27 * u) + 'px ' + ff; x.fillStyle = '#6a3a12'; x.fillText('15 VP', X, Y - .02 * u); x.fillText('35', X, Y + .3 * u); continue; }
    x.font = '900 ' + Math.round(.46 * u) + 'px ' + ff; x.fillText(String(D.COINS[i]), X, Y + .16 * u);
    if (D.VP[i] > 0) { x.fillStyle = '#7a4a1a'; const bw = .52 * u, bh = .36 * u, bx = X + .06 * u, by = Y - .62 * u; x.beginPath(); (x.roundRect ? x.roundRect(bx, by, bw, bh, .07 * u) : x.rect(bx, by, bw, bh)); x.fill(); x.strokeStyle = '#fff6dc'; x.lineWidth = Math.max(1, .03 * u); x.stroke(); x.fillStyle = '#fff6dc'; x.font = '900 ' + Math.round(.31 * u) + 'px ' + ff; x.fillText(String(D.VP[i]), bx + bw / 2, by + bh * .8); }
    if (D.RUBY[i]) { const rb = PX.img.ruby, sz = .36 * u; if (rb) x.drawImage(rb, X - .52 * u, Y - .6 * u, sz, sz); }
  }
  { const P0 = KIT.GEO.pts; x.fillStyle = 'rgba(255,246,220,.85)'; for (let i = 1; i < P0.length - 1; i += 2) { const a = P0[i], b = P0[i + 1], mx = W / 2 + (a.x + b.x) / 2 * u, my = W / 2 + (a.y + b.y) / 2 * u, ang = Math.atan2(b.y - a.y, b.x - a.x); x.save(); x.translate(mx, my); x.rotate(ang); x.beginPath(); x.moveTo(-.1 * u, -.1 * u); x.lineTo(.12 * u, 0); x.lineTo(-.1 * u, .1 * u); x.closePath(); x.fill(); x.restore(); } }
  return PIXI.Texture.from(cv);
}
// ---- layout read ----
let pxQueued = false;
function pxDirty() { if (!PX.on || pxQueued) return; pxQueued = true; requestAnimationFrame(() => { pxQueued = false; try { pxSync(); } catch (e) { console.error(e); } }); }
function pxResize(force) {
  if (!PX.app) return; const bd = $('#bd'); const w = Math.max(16, bd.clientWidth), h = Math.max(16, bd.clientHeight);
  if (force || w !== PX.w || h !== PX.h) { PX.w = w; PX.h = h; try { PX.app.renderer.resize(w, h, PX.res); } catch (e) { } PX.dirty = true; }
  pxDirty();
}
const pxPos = i => { const p = KIT.GEO.pts[Math.max(0, Math.min(D.TRACK_LEN - 1, i))]; return { x: PX.cx + p.x * PX.k, y: PX.cy + p.y * PX.k }; };
function pxClear() { for (const [, o] of PX.chips) { try { o.sp.destroy(); o.sh.destroy(); } catch (e) { } } PX.chips.clear(); PX.L.chips && PX.L.chips.removeChildren(); if (PX.boardSp) PX.boardSp.visible = false; if (PX.ring) PX.ring.visible = false; if (PX.drop) PX.drop.visible = false; if (PX.rat) PX.rat.visible = false; PX.seat = -1; }
function pxSync() {
  if (!PX.on) return;
  if (!G || !UI.started) { pxClear(); PX.dirty = true; return; }
  const bd = $('#bd'), cw = $('#cwrap'); if (!cw) return; const B = bd.getBoundingClientRect(), r = cw.getBoundingClientRect(); if (r.width < 20) return;
  const S = Math.round(Math.min(r.width, r.height)), cx = r.left - B.left + r.width / 2, cy = r.top - B.top + r.height / 2;
  const f = focusSeat(), p = G.players[f], snapAll = PX.seat !== f || !ANIM || pxRM() || UI.sim;
  const q = PXQ[PX.q], keyT = S + '|' + PX.res;
  if (PX.texKey !== keyT) { PX.texKey = keyT; try { if (PX.boardSp.texture && PX.boardSp.texture !== PIXI.Texture.EMPTY) PX.boardSp.texture.destroy(true); } catch (e) { } PX.boardSp.texture = pxBuildBoard(S); }
  PX.S = S; PX.cx = cx; PX.cy = cy; PX.k = S / (2 * KIT.GEO.R);
  PX.boardSp.visible = true; PX.boardSp.width = PX.boardSp.height = S; PX.boardSp.x = cx - S / 2; PX.boardSp.y = cy - S / 2;
  const bi = $('#bagi'); if (bi) { const b = bi.getBoundingClientRect(); PX.bag = { x: b.left - B.left + 18, y: b.top - B.top + 20 }; }
  const csz = .98 * PX.k;
  if (PX.seat !== f) { pxClearChips(); PX.seat = f; PX.snap = true; }
  // chips: reconcile sprites with the pot
  const want = new Map(); p.pot.forEach((c, idx) => want.set(c.i, { c, idx }));
  for (const [id, o] of PX.chips) {
    if (want.has(id)) continue;
    // left the pot: flew back (flask, put back, restart, end of the day) or simply vanished
    PX.chips.delete(id); o.gone = true;
    const back = PX.backIds[id] || snapAll === false; delete PX.backIds[id];
    if (snapAll || !q.fx && !back) { pxKill(o); continue; }
    const t0 = performance.now() + (o.stagger || 0) * 45;
    PX.tweens.push({ t0, dur: 420, from: { x: o.sp.x, y: o.sp.y, s: o.sp.scale.x }, to: { x: PX.bag.x, y: PX.bag.y, s: csz / 128 * .55 }, arc: -PX.k * 1.4, obj: o, ease: pxEase, kill: true, back: true });
  }
  let n = 0;
  for (const [id, w] of want) {
    let o = PX.chips.get(id); const tp = pxPos(w.c.pos);
    if (!o) {
      o = pxMakeChip(w.c); PX.chips.set(id, o); o.pos = w.c.pos;
      const fly = PX.flyIds[id]; delete PX.flyIds[id];
      if (fly && !snapAll) { o.sp.x = PX.bag.x; o.sp.y = PX.bag.y; o.sp.scale.set(csz / 128 * 1.5); o.sp.rotation = -.6; o.sp.alpha = 0; o.sh.visible = false; o.flying = true; o.tx = tp.x; o.ty = tp.y;
        PX.nFly = (PX.nFly || 0) + 1; PX.tweens.push({ t0: performance.now(), dur: 520, from: { x: PX.bag.x, y: PX.bag.y, s: csz / 128 * 1.5, r: -.6 }, to: { x: tp.x, y: tp.y, s: csz / 128, r: 0 }, arc: -PX.k * 2.6, obj: o, ease: pxEase, land: true }); }
      else { o.sp.x = tp.x; o.sp.y = tp.y; o.sp.scale.set(csz / 128); }
    } else if (o.pos !== w.c.pos) {
      o.pos = w.c.pos; if (snapAll) { o.sp.x = tp.x; o.sp.y = tp.y; } else PX.tweens.push({ t0: performance.now(), dur: 380, from: { x: o.sp.x, y: o.sp.y, s: o.sp.scale.x }, to: { x: tp.x, y: tp.y, s: csz / 128 }, obj: o, ease: pxEase });
    }
    o.tx = tp.x; o.ty = tp.y; o.stagger = n++;
    if (!o.flying) { o.sp.scale.set(csz / 128); if (!PX.tweens.some(t => t.obj === o)) { o.sp.x = tp.x; o.sp.y = tp.y; } }
    o.sh.x = o.sp.x + csz * .07; o.sh.y = o.sp.y + csz * .12; o.sh.width = csz * 1.15; o.sh.height = csz * 1.05;
  }
  // droplet, rat stone, the ring on the scoring space
  PX.drop.visible = true; const dp = pxPos(p.droplet); pxMoveMark(PX.drop, dp.x, dp.y, csz * .86, snapAll);
  const hasRat = p.rat > 0 && p.rat > p.droplet; PX.rat.visible = hasRat; if (hasRat) { const rp = pxPos(p.rat); pxMoveMark(PX.rat, rp.x, rp.y - csz * .08, csz * 1.0, snapAll); }
  PX.ringAt = pxPos(CF.spaceOf(p)); PX.ring.visible = !!PX.ringAt;
  PX.boomNow = !!p.boom; PX.boardSp.tint = p.boom ? 0xffb090 : 0xffffff;
  PX.snap = false; PX.dirty = true; PX.chipsN = p.pot.length;
}
function pxMoveMark(sp, x, y, d, snap) {
  const w = sp.texture.width || 96; sp.scale.set(d / w);
  if (snap || sp.__x == null) { sp.x = x; sp.y = y; sp.__x = x; sp.__y = y; return; }
  if (Math.abs(sp.__x - x) > .5 || Math.abs(sp.__y - y) > .5) { PX.tweens.push({ t0: performance.now(), dur: 340, from: { x: sp.x, y: sp.y }, to: { x, y }, obj: { sp, mark: 1 }, ease: pxEase }); sp.__x = x; sp.__y = y; }
}
function pxClearChips() { for (const [, o] of PX.chips) pxKill(o); PX.chips.clear(); PX.tweens = PX.tweens.filter(t => !(t.obj && t.obj.gone)); }
function pxKill(o) { try { o.sp.destroy(); o.sh.destroy(); } catch (e) { } o.dead = true; }
function pxMakeChip(c) {
  const sp = new PIXI.Sprite(pxChipTex(c.c + c.v)); sp.anchor.set(.5); const sh = new PIXI.Sprite(PX.tex.shadow); sh.anchor.set(.5);
  PX.L.chips.addChild(sh); PX.L.chips.addChild(sp); return { id: c.i, sp, sh, key: c.c + c.v };
}
const pxEase = t => 1 - Math.pow(1 - t, 3);
// ---- events from the engine (playEvents) ----
function pxEvent(e) {
  if (!PX.on || !G) return; const f = focusSeat(); if (e.seat !== f) { return; }
  const q = PXQ[PX.q];
  if (e.t === 'place' || e.t === 'side') { if (e.t === 'place') PX.flyIds[e.chip.i] = 1; }
  else if (e.t === 'flask') { PX.backIds[e.chip.i] = 1; }
  else if (e.t === 'restart') { const p = G.players[f]; p.pot.forEach(c => { PX.backIds[c.i] = 1; }); }
  else if (e.t === 'boom') { if (ANIM && !UI.sim) { PX.nBoom = (PX.nBoom || 0) + 1; PX.boomSeat = f; PX.flash = 1; PX.shake = .65; if (q.parts) for (let i = 0; i < Math.round(12 * q.parts); i++) pxPuff(PX.cx + (Math.random() - .5) * PX.S * .3, PX.cy + (Math.random() - .5) * PX.S * .3, i); } }
  else if (e.t === 'gain') { if (e.k === 'ruby' || e.k === 'vp') pxFloat((e.k === 'ruby' ? '+' + e.n + ' ruby' : '+' + e.n + ' VP'), e.k === 'ruby' ? 0xff7a8a : 0xffe08a); }
  pxDirty();
}
function pxPuff(x, y, i) { if (!PX.tex.puff) return; const sp = new PIXI.Sprite(PX.tex.puff); sp.anchor.set(.5); sp.x = x; sp.y = y; sp.alpha = 0; const s0 = PX.k * (.8 + Math.random() * .5); sp.scale.set(s0 / 160 * 1.2); PX.L.fx.addChild(sp); PX.parts.push({ sp, kind: 'puff', t: -i * .04, life: 1.1 + Math.random() * .5, vx: (Math.random() - .5) * PX.k * 2.6, vy: -PX.k * (1 + Math.random() * 2), s0: s0 / 160, s1: s0 / 160 * (2.2 + Math.random()) }); }
function pxSplash(x, y) {
  const q = PXQ[PX.q]; if (!q.parts || !PX.tex.splash) return; PX.nSplash = (PX.nSplash || 0) + 1; const sp = new PIXI.Sprite(PX.tex.splash); sp.anchor.set(.5); sp.x = x; sp.y = y; sp.alpha = .95; sp.scale.set(PX.k * .6 / 160); PX.L.fx.addChild(sp);
  PX.parts.push({ sp, kind: 'splash', t: 0, life: .55, s0: PX.k * .6 / 160, s1: PX.k * 2.4 / 160 });
  const nb = Math.round(4 * q.parts); for (let i = 0; i < nb; i++) { if (!PX.tex.bubble) break; const b = new PIXI.Sprite(PX.tex.bubble); b.anchor.set(.5); b.x = x + (Math.random() - .5) * PX.k * .8; b.y = y + (Math.random() - .5) * PX.k * .4; b.alpha = .9; const s0 = PX.k * (.16 + Math.random() * .2) / 96; b.scale.set(s0); PX.L.fx.addChild(b); PX.parts.push({ sp: b, kind: 'bub', t: -Math.random() * .12, life: .8 + Math.random() * .5, vy: -PX.k * (.9 + Math.random() * 1.2), vx: (Math.random() - .5) * PX.k, s0, s1: s0 * 1.6 }); }
}
function pxFloat(text, col) {
  const q = PXQ[PX.q]; if (!q.parts || !ANIM || UI.sim || !PIXI.Text) return;
  try { const t = new PIXI.Text({ text, style: { fontFamily: 'Nunito, Trebuchet MS, sans-serif', fontSize: Math.max(16, Math.round(PX.k * .6)), fontWeight: '900', fill: col, stroke: { color: 0x2a1608, width: 5 } } }); t.anchor.set(.5); t.x = PX.cx + (Math.random() - .5) * PX.S * .2; t.y = PX.cy - PX.S * .08; PX.L.fx.addChild(t); PX.parts.push({ sp: t, kind: 'txt', t: 0, life: 1.2, vy: -PX.k * 1.1 }); } catch (e) { }
}
// ---- the frame ----
function pxStepTweens(now) {
  const keep = [];
  for (const tw of PX.tweens) {
    if (tw.obj && tw.obj.dead) continue;
    const u0 = (now - tw.t0) / tw.dur; if (u0 < 0) { keep.push(tw); if (tw.obj && tw.obj.sp && tw.land) tw.obj.sp.alpha = 0; continue; }
    const u = Math.min(1, u0), e = (tw.ease || pxEase)(u), o = tw.obj, sp = o.sp; if (!sp || sp.destroyed) continue;
    sp.x = tw.from.x + (tw.to.x - tw.from.x) * e; sp.y = tw.from.y + (tw.to.y - tw.from.y) * e + (tw.arc ? tw.arc * Math.sin(Math.PI * e) : 0);
    if (tw.from.s != null && tw.to.s != null) sp.scale.set(tw.from.s + (tw.to.s - tw.from.s) * e);
    if (tw.from.r != null) sp.rotation = tw.from.r + (tw.to.r - tw.from.r) * e;
    if (tw.land) { sp.alpha = Math.min(1, u * 5); }
    if (tw.kill) sp.alpha = 1 - e * e;
    if (o.sh && !o.sh.destroyed) { o.sh.x = sp.x + 3; o.sh.y = sp.y + 6; }
    if (u < 1) keep.push(tw);
    else {
      if (tw.land) { PX.nLand = (PX.nLand || 0) + 1; o.flying = false; sp.alpha = 1; sp.rotation = 0; o.sh.visible = true; pxSplash(sp.x, sp.y); PX.pulse = 1; }
      if (tw.kill) pxKill(o);
    }
  }
  PX.tweens = keep;
}
function pxStepParts(dt) {
  const keep = [];
  for (const p of PX.parts) {
    p.t += dt; if (p.t < 0) { keep.push(p); continue; }
    const u = Math.min(1, p.t / p.life);
    if (p.kind === 'puff') { p.sp.x += p.vx * dt; p.sp.y += p.vy * dt; p.sp.scale.set(p.s0 + (p.s1 - p.s0) * u); p.sp.alpha = (u < .15 ? u / .15 : 1) * (1 - u) * .85; }
    else if (p.kind === 'splash') { p.sp.scale.set(p.s0 + (p.s1 - p.s0) * pxEase(u)); p.sp.alpha = .95 * (1 - u); }
    else if (p.kind === 'bub') { p.sp.x += p.vx * dt; p.sp.y += p.vy * dt; p.sp.scale.set(p.s0 + (p.s1 - p.s0) * u); p.sp.alpha = .9 * (1 - u * u); }
    else if (p.kind === 'txt') { p.sp.y += p.vy * dt; p.sp.alpha = u < .7 ? 1 : 1 - (u - .7) / .3; }
    if (u < 1) keep.push(p); else { try { p.sp.destroy(); } catch (e) { } }
  }
  PX.parts = keep;
}
function pxAmbient(dt) {
  const q = PXQ[PX.q]; const want = q.parts && PX.on && G && UI.started && !UI.sim ? Math.round((3 + Math.min(14, (PX.chipsN || 0) * 1.1)) * q.parts) : 0;
  while (PX.amb.length < want && PX.amb.length < 16 && PX.tex.bubble) { const b = new PIXI.Sprite(PX.tex.bubble); b.anchor.set(.5); b.__ph = Math.random(); b.__a = Math.random() * 6.28; b.__r = Math.sqrt(Math.random()) * .8; b.__sp = .25 + Math.random() * .4; PX.L.amb.addChild(b); PX.amb.push(b); }
  while (PX.amb.length > want) { const b = PX.amb.pop(); try { b.destroy(); } catch (e) { } }
  const hot = PX.boomNow ? 1.8 : 1;
  for (const b of PX.amb) { b.__ph += dt * b.__sp * hot; if (b.__ph > 1) { b.__ph = 0; b.__a = Math.random() * 6.28; b.__r = Math.sqrt(Math.random()) * .8; } const u = b.__ph, rr = b.__r * KIT.GEO.R * PX.k; b.x = PX.cx + Math.cos(b.__a) * rr; b.y = PX.cy + Math.sin(b.__a) * rr - u * PX.k * .4; const s = Math.sin(Math.PI * u); b.scale.set(PX.k * (.12 + .26 * s) / 96); b.alpha = .55 * s; b.tint = PX.boomNow ? 0xffc89a : 0xffffff; }
}
function pxFrame(ts) {
  if (!PX.on) return;
  const now = performance.now(), dt = Math.min(.05, Math.max(0, (now - (PX.last || now)) / 1000)); PX.last = now; PX.t += dt;
  const q = PXQ[PX.q], snap = !ANIM || pxRM() || UI.sim;
  pxStepTweens(now); pxStepParts(dt); pxAmbient(dt);
  let moving = PX.tweens.length > 0 || PX.parts.length > 0 || PX.amb.length > 0;
  // the scoring ring pulses; the pot "pops" when a chip lands; shake and flash after an explosion
  if (PX.ring && PX.ring.visible && PX.ringAt) { const a = .65 + .3 * Math.sin(PX.t * 4); PX.ring.clear(); PX.ring.circle(PX.ringAt.x, PX.ringAt.y, PX.k * .62).stroke({ width: Math.max(2.5, PX.k * .11), color: 0xf2b81e, alpha: q.fx ? a : .9 }); if (q.fx) moving = true; }
  if (PX.pulse > 0) { PX.pulse = Math.max(0, PX.pulse - dt * 3); const s = 1 + .018 * PX.pulse; PX.L.board.scale.set(s); PX.L.board.pivot.set(PX.cx, PX.cy); PX.L.board.position.set(PX.cx, PX.cy); moving = true; if (PX.pulse === 0) { PX.L.board.scale.set(1); PX.L.board.pivot.set(0, 0); PX.L.board.position.set(0, 0); } }
  if (PX.shake > 0) { PX.shake = Math.max(0, PX.shake - dt); PX.root.x = (Math.random() - .5) * 10 * PX.shake / .65; PX.root.y = (Math.random() - .5) * 8 * PX.shake / .65; moving = true; if (PX.shake === 0) { PX.root.x = 0; PX.root.y = 0; } }
  if (PX.flash > 0) { PX.flash = Math.max(0, PX.flash - dt * 2.4); moving = true; PX.flashG.clear(); if (PX.flash > 0) PX.flashG.circle(PX.cx, PX.cy, PX.S / 2 - 2).fill({ color: 0xff5030, alpha: PX.flash * .5 }); else PX.flashG.clear(); }
  PX.moving = moving;
  if (moving || PX.dirty || PerfHUDtesting()) { PX.dirty = false; try { PX.app.renderer.render(PX.app.stage); PX.frames = (PX.frames || 0) + 1; } catch (e) { pxOff('render: ' + (e && e.message)); } }
}
const PerfHUDtesting = () => !!(window.PerfHUD && PerfHUD.testing);
function pxLoop() {
  const PH = window.PerfHUD && PerfHUD.live ? PerfHUD : null;
  const tick = ts => { PX.raf = (PH ? PH.raf : requestAnimationFrame)(tick); try { pxFrame(ts); } catch (e) { console.error(e); } };
  PX.raf = (PH ? PH.raf : requestAnimationFrame)(tick);
}
// ---- PerfHUD: levels, pixel ratio cap, "something is moving" for the idle saver
function pxPerfReg() {
  try {
    if (!window.PerfHUD || !PerfHUD.register) return;
    const shim = PX.on ? { getPixelRatio: () => PX.res, setPixelRatio: v => pxSetRes(v), get domElement() { return PX.cv; }, getContext: () => PX.app && PX.app.renderer && PX.app.renderer.gl || null } : null;
    PerfHUD.register({ game: 'Cauldron Fair', anchor: '.gx-board', corner: 'tl', renderer: shim, levels: ['high', 'medium', 'low'],
      getLevel: () => PX.q, isAuto: () => gfxPref() === 'auto',
      setLevel: (l, why) => { if (why === 'apply') setGfx(l); else { PX.autoQ = l; pxApplyQ(); } try { if (GX.open === 'setd') renderMenu(); } catch (e) { } },
      basePR: () => { const d = window.devicePixelRatio || 1; return Math.min((PXQ[PX.q] || PXQ.high).pr, d); }, onPixelRatio: v => pxSetRes(v),
      isAnimating: () => !!PX.tweens.length || !!PX.parts.length, idleMode: PX.on ? 'throttle' : 'demand', idleFps: 10 });
  } catch (e) { }
}
// test hooks (px-test.js): what the Pixi layer is showing
PX.sprites = () => Array.from(PX.chips.values()).filter(o => !o.dead && !o.gone).map(o => ({ id: o.id, key: o.key, x: Math.round(o.sp.x), y: Math.round(o.sp.y), visible: o.sp.visible, alpha: o.sp.alpha }));
PX.busy = () => PX.tweens.length > 0 || PX.parts.some(p => p.kind !== 'bub' && p.kind !== 'splash') || PX.flying;
PX.target = i => { const p = pxPos(i); return { x: Math.round(p.x), y: Math.round(p.y) }; };

PX.state = () => ({ pend: !!pxQueued || !!PX.dirty, on: PX.on, kind: PX.kind, q: PX.q, res: PX.res, tweens: PX.tweens.length, parts: PX.parts.filter(p => p.kind !== 'bub').length, amb: PX.amb.length, nFly: PX.nFly || 0, nLand: PX.nLand || 0, nBoom: PX.nBoom || 0, nSplash: PX.nSplash || 0, frames: PX.frames || 0,
  objs: Array.from(PX.chips.values()).filter(o => !o.dead && !o.gone).map(o => ({ id: o.id, key: o.key, x: o.sp.x, y: o.sp.y, tx: o.tx, ty: o.ty, visible: o.sp.visible, alpha: o.sp.alpha, flying: !!o.flying })),
  drop: PX.drop ? { x: PX.drop.x, y: PX.drop.y, vis: PX.drop.visible } : null, filters: [PX.root, PX.L.board, PX.L.chips, PX.L.amb, PX.L.fx, PX.L.mark].filter(c => c && c.filters && c.filters.length).length, S: PX.S, cx: PX.cx, cy: PX.cy });
PX.canvasInk = () => { try { const c = PX.app.renderer.extract.canvas(PX.app.stage); const x = c.getContext('2d'), w = c.width, h = c.height; const d = x.getImageData(0, 0, w, h).data; let n = 0, tot = 0; for (let i = 3; i < d.length; i += 4 * 37) { tot++; if (d[i] > 20) n++; } return n / Math.max(1, tot); } catch (e) { return -1; } };
