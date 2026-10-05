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
function save() { try { if (!G || UI.camp || (typeof NET !== 'undefined' && NET.on) || G.phase === 'over') return false; localStorage.setItem('cf_save', JSON.stringify({ v: SAVEV, G, mode: UI.mode, cfg: UI.cfg, chefs: UI.chefs, focus: UI.focus, holder: UI.holder })); return true; } catch (e) { return false; } }
function clearSave() { try { localStorage.removeItem('cf_save'); } catch (e) { } }
// log lines name every maker; the viewer reads "You" instead of their maker's name ("Wynne takes" -> "You take")
function youText(t) {
  const v = viewSeat(); if (v < 0 || !G || hotSeat()) return t; const nmv = G.players[v].name; if (!nmv || t.indexOf(nmv) < 0) return t;
  const verb = w => w === 'has' ? 'have' : w === 'is' ? 'are' : w === 'was' ? 'were' : /[^aeiou]ies$/.test(w) ? w.slice(0, -3) + 'y' : /(sh|ch|x|ss)es$/.test(w) ? w.slice(0, -2) : /s$/.test(w) && !/ss$/.test(w) ? w.slice(0, -1) : w;
  const esc = nmv.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return t.replace(new RegExp('^' + esc + '\'s\\b'), 'Your').replace(new RegExp('\\b' + esc + '\'s\\b', 'g'), 'your')
    .replace(new RegExp('\\b' + esc + ' ([a-z]+)\\b', 'g'), (a, w) => 'You ' + verb(w)).replace(new RegExp('\\b' + esc + '\\b', 'g'), 'you').replace(/^you\b/, 'You').replace(/([.:!] )you\b/g, '$1You').replace(/^(You [a-z]+ .*? and )(starts|takes|scores|moves|puts)\b/, (a, b, w) => b + w.slice(0, -1));
}
// points a maker gained on a day (fortune points before the brew included), and where they came from (from the log)
function dayStart(seat, round) { const prev = G.hist.find(x => x.seat === seat && x.round === round - 1); return prev ? prev.after : 0; }
function dayWhy(p, round) {
  const re = new RegExp('^' + p.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ' (scores|loses) (\\d+) points?(?: \\((.*)\\))?'), out = [];
  const short = r => !r ? 'other' : /scoring space/.test(r) ? 'space' : /bonus die/.test(r) ? 'die' : /coins/.test(r) ? 'coins' : r;
  for (const l of G.log) if (l.round === round && !/rubies at 2 to 1/.test(l.t)) { const m = re.exec(l.t); if (m) out.push((m[1] === 'loses' ? '-' : '+') + m[2] + ' ' + short(m[3])); }
  return out;
}
function toast(t) { const e = $('#toast'); if (!e) return; e.textContent = t; e.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => e.classList.remove('on'), Math.min(7000, 2000 + 45 * t.length)); }
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
  ruby: ['Rubies', () => 'Spend 2 rubies to move your droplet one space (every later day starts further on) or to refill your flask, or keep them.']
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
  if (G.phase === 'over') return { text: UI.rsOpen && UI.rsMode === 'final' ? '' : youText(G.winText) };
  const v = viewSeat(); const wn = waitingNames();
  if (v < 0) return { text: G.phase === 'brew' ? 'The computers are brewing.' : 'The fair goes on.' };
  const p = G.players[v];
  if (hotSeat() && UI.holder < 0) return { text: 'Pass the device.' };
  if (p.q && !EVAL_Q[p.q.h]) return { text: QINFO[p.q.h][0] + ': ' + QINFO[p.q.h][1](p, p.q.d), mine: true };
  if (G.phase === 'brew') {
    if (p.st === 'draw' && p.lock) return { text: 'You have decided. ' + (wn.length ? 'Waiting for ' + nameList(G.players.filter(q => q.st === 'draw' && !q.lock && !isMine(q.seat)).map(q => q.name)) + ', then everybody reveals together (Stir!).' : 'Revealing...') };
    if (p.st === 'draw') { const rk = CF.risk(G, v); return { text: (G.round === 9 ? 'Last day, no shop: everyone picks Draw or Stop in secret, then all reveal. At the end 5 coins or 2 rubies = 1 point. ' : '') + (p.pot.length ? 'Draw another chip, or stop and keep your score.' : 'Tap Draw to pull your first chip from the bag.' + (G.round <= 2 ? ' Everyone brews at the same time, so the others are drawing too.' : '')), mine: true }; }
    return { text: (p.boom ? 'Your cauldron exploded. ' : 'You stopped. ') + (wn.length ? 'Waiting for ' + nameList(wn) + '...' : 'Everyone is done.') };
  }
  if (G.phase === 'prep') return { text: wn.length ? 'Waiting for ' + nameList(wn) + ' to choose...' : 'The day begins.' };
  if (G.phase === 'eval') return { text: p.q ? QINFO[p.q.h][1](p, p.q.d) : (wn.length ? 'Waiting for ' + nameList(wn) + '...' : 'Counting the day.'), mine: !!p.q };
  return { text: '' };
}
function placePrompt() { }
function stateLabel(p) {
  switch (seatState(p)) { case 'draw': return 'brewing'; case 'locked': return 'decided'; case 'done': return 'finished'; case 'boom': return 'exploded'; case 'post': return 'finishing'; case 'choose': return 'choosing'; case 'ready': return 'waiting'; case 'wait': return 'waiting'; case 'idle': return 'waiting'; default: return ''; }
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
      h('span.ti', h('b', p.name), h('span.tv', h('span', { html: ico('vp', 15) }), p.vp, h('span', { html: ico('ruby', 15) }), p.rubies), h('span.ts', stateLabel(p) + (p.pot.length && seatState(p) === 'draw' ? ' · ' + plural(p.pot.length, 'chip') : ''))));
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
  const here = sp != null ? h('div.rk', h('span', { html: ico('coin', 16) }), h('b', D.COINS[sp]), ' coins ', h('span', { html: ico('vp', 16) }), h('b', D.VP[sp]), ' points', D.RUBY[sp] ? [h('span', { html: ico('ruby', 16) }), ' ruby'] : null, h('span.sm', ' if you stop now')) : null;
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
    if (isPh()) { rk.append(h('div.rk', h('span', { html: ico('bag', 18) }), h('b', r.n), ' chips in the bag: ', h('b', r.whites), ' white'), bar); return; }
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
  if (focusSeat() !== v) { a.appendChild(h('button.btn.go.backb', { 'data-a': 'focus', 'data-seat': v, type: 'button' }, 'Back to your cauldron')); return; }
  if (G.phase !== 'brew' || p.st !== 'draw' || p.q) return;
  a.appendChild(brewDeck(p, v, legal));
}
function renderQ(p, legal, qb) {
  const q = p.q, info = QINFO[q.h]; if (qb.hidden) UI.qT = Date.now(); qb.hidden = false;
  const fromCard = { pick: 1, swap: 1, clear: 1, bribe: 1, bounty: 1, fork: 1, haggle: 1, peek: 1, gift: 1, restart: 1 }[q.h];
  qb.append(h('div.qt', h('b', (fromCard ? 'Today\'s fortune card: ' : '') + info[0]), h('div.qx', info[1](p, q.d))));
  if (p.hold.length && p.hold[0] && p.hold[0].c) qb.append(h('div.hold', { 'data-priv': p.seat }, p.hold.map((c, i) => h('span.cb', chipN(c.c + c.v, 34)))));
  const opts = h('div.opts' + (legal.length > 3 ? '.g2' : ''));
  legal.forEach(m => opts.appendChild(moveBtn(m, p)));
  qb.append(opts);
  if (typeof sugMark === 'function') sugMark(qb, p, q, legal);
}
function renderBar() {
  const bs = $('#barstat'); if (!bs) return; bs.innerHTML = '';
  if (!G) return; const dtxt = isPh() ? 'Day ' + G.round + '/' + D.rounds : 'Day ' + G.round + ' of ' + D.rounds;
  bs.append(UI.camp ? h('button.dayn.gchip', { 'data-a': 'campgoal', type: 'button', 'aria-label': 'Day ' + G.round + '. Tap for the chapter goal' }, '\ud83c\udfaf ' + dtxt) : h('span.dayn', dtxt));
  const v0 = viewSeat(), f0 = focusSeat(), q0 = G.players[f0 >= 0 ? f0 : 0];
  if (isPh() && q0) bs.append(h('span.bst', { title: (f0 === v0 ? 'Your' : q0.name + '\'s') + ' points, rubies and flask' }, UI.camp ? null : h('span.bav', { html: avHTML(f0, 24) }), h('span', { html: ico('vp', 17) }), h('b', q0.vp), h('span', { html: ico('ruby', 16) }), h('b', q0.rubies), h('span.bfl', { html: ico('flask', 17, q0.flask) })));
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
    bfHeat(); const db = $('#dockbody'); if (db) db.classList.toggle('deckon', !!document.querySelector('#acts .bdeck')); requestAnimationFrame(bfGhost);
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
  const names = chars.map(ch => PN[ch]); if (o.camp && o.camp.opponent && o.camp.opponent.name) names[1] = o.camp.opponent.name.split(' ').pop();   // short name for the table (the boss card shows the full one)
  const seed = UI.seed != null ? UI.seed : (Date.now() ^ (Math.random() * 1e9)) | 0; UI.seed = null;
  G = CF.newGame({ players: np, seed, names, ai, chars, setMode: sets === 'random' ? 'random' : sets, guided: mode === 'guided', firstCard: mode === 'guided' ? 'lucky7' : (o.camp && o.camp.setup && o.camp.setup.firstCard) || undefined });
  if (o.camp) campTwist(G, o.camp.twist);
  UI.camp = o.camp || null; UI.mode = mode; UI.cfg = c; UI.started = true; UI.holder = -1; UI.focus = 0; UI.evN = G.evN; UI.over = null; UI.overShown = false; UI.rsOpen = false; UI.repSeen = 0; UI.shopSel = []; UI.potSig = ''; UI.tip = null; UI.tipRound = {}; UI.tipMark = null; UI.tipOpen = false; UI.hotShared = 0; UI.tipq = []; UI.tipShown = {};
  UI.coach = { level: mode === 'guided' ? 'full' : (UI.coach.level === 'full' && mode !== 'guided' ? 'light' : UI.coach.level), seen: {} };
  if (mode === 'guided' && UI.coach.level === 'off') UI.coach.level = 'full';
  campCoach(o.camp || null);
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
function newsLines(first) {
  const v = viewSeat(), from = UI.newsN || 0; if (first || UI.sim) { UI.newsN = G.logN; return; }
  if (v < 0 || hotSeat() || G.phase === 'eval' || G.phase === 'over' || UI.rsOpen) return;   // the report tells those; today's news waits until it closes
  UI.newsN = G.logN;
  const nm = G.players[v].name, out = G.log.filter(l => l.i > from && l.round === G.round && (l.t.indexOf(nm) >= 0 || /^Day \d/.test(l.t)) && !/ draws a | has decided| places the | stops\.$|^Stir!|^Everyone brews/.test(l.t)).map(l => youText(l.t));
  if (!out.length) return;
  if (isPh()) {   // phones: a short headline, the full lines stay in the log
    const sh = out.map(t => { let m = /fortune card "([^"]+)"/.exec(t); if (m) return '\u2728 ' + m[1]; m = /head start of (\d+) space/.exec(t); if (m) return '\ud83d\udc00 Head start +' + m[1]; if (/^Day \d/.test(t)) return ''; return t.length <= 48 ? t : ''; }).filter(Boolean);
    if (sh.length) toast(sh.slice(-3).join('  \u00b7  ')); return;
  }
  toast(out.slice(-3).join(' '));
}
function playEvents(first) {
  newsLines(first);
  const evs = G.events.filter(e => e.n > UI.evN); UI.evN = G.evN; if (first || !evs.length) return;
  for (const e of evs) {
    try {
      switch (e.t) {
        case 'draw': if (e.how !== 'side') snd('draw'); break;
        case 'place': if (typeof bfEvent === 'function') bfEvent(e); { const dl = typeof PX !== 'undefined' && e.chip && typeof PX.flyIds[e.chip.i] === 'number' ? PX.flyIds[e.chip.i] : 0; const rb = e.ruby; setTimeout(() => snd(rb ? 'ruby' : 'plop'), dl); setTimeout(() => snd('splash'), 120 + dl); } if (typeof pxEvent === 'function') pxEvent(e); break;
        case 'side': if (typeof pxEvent === 'function') pxEvent(e); break;
        case 'boom': if (!(typeof bfAnim === 'function' && bfAnim() && (isMine(e.seat) || e.seat === focusSeat()))) snd('boom'); if (typeof bfEvent === 'function') bfEvent(e); if (typeof pxEvent === 'function') pxEvent(e); if (isMine(e.seat) && !UI.sim && !(typeof bfAnim === 'function' && bfAnim())) { const bp = G.players[e.seat]; toast((e.prot ? 'Boom! But safe harbour saves your points. ' : 'Your cauldron exploded! ') + 'White total ' + CF.whiteSum(bp) + ' is over the limit of ' + CF.limitOf(G, bp) + '.'); } break;
        case 'flask': snd('flask'); if (typeof pxEvent === 'function') pxEvent(e); if (isMine(e.seat) && !UI.sim && !e.free) toast('Flask used: the white chip went back into your bag. Rubies can refill the flask after the day.'); break;
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
    G = o.G; window.G = G; UI.camp = null; UI.mode = o.mode || 'vs'; UI.cfg = o.cfg; UI.started = true; UI.holder = -1; UI.focus = o.focus || 0; UI.evN = G.evN; UI.rsOpen = false; UI.repSeen = G.rep ? G.rep.round : 0; UI.over = null; UI.overShown = false; UI.potSig = ''; UI.tip = null; UI.tipq = [];
    UI.coach = { level: UI.coach.level, seen: {} }; const st = $('#start'); if (st) st.hidden = true; closeRS && closeRS(true);
    afterApply(true); sndMusic(); toast('Welcome back.'); return true;
  } catch (e) { console.error(e); return false; }
}
// ===================== part 4: the day report (and its decisions), the shop, the pass card, the final screen, the guided tips =====================
function closeRS(quiet) { const rs = $('#rs'); if (rs) { rs.hidden = true; rs.innerHTML = ''; } UI.rsOpen = false; UI.rsMode = ''; if (!quiet && typeof schedule === 'function') schedule(); }
function checkReport() {
  if (!G || !UI.started) return;
  if (typeof BF !== 'undefined' && Date.now() < BF.fxUntil && !UI.rsOpen) { clearTimeout(BF.repT); BF.repT = setTimeout(checkReport, BF.fxUntil - Date.now() + 30); return; }
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
  box.appendChild(h('h2', h('span', { html: ico('coin', 30) }), hotPriv ? 'Day ' + R.round + ': ' + me.name : 'Day ' + R.round));
  box.appendChild(h('div#rstip.tipb', { hidden: true }));
  const body = h('div.rsbody');
  const tab = h('table.rt-tab'); tab.appendChild(h('tr', h('th', 'Cauldron'), h('th', 'Score space'), h('th', 'Result'), h('th', 'Points today'), h('th', 'Total')));
  const sumParts = [], cards = h('div.dcards');
  for (const p of G.players) {
    const r = dayRow(p, R); if (!r) continue; const sp = r.space;
    const gain = (r.live ? p.vp : (G.hist.find(x => x.round === R.round && x.seat === p.seat) || {}).after || p.vp) - dayStart(p.seat, R.round), gTxt = gain >= 0 ? '+' + gain : '' + gain, why = dayWhy(p, R.round);
    const res = r.boom ? (r.prot ? [h('span.ok', 'exploded, safe')] : [h('span.bad', 'exploded'), h('div.sm', (r.mode === 'buy' ? 'went shopping' : r.mode === 'vp' ? 'took points' : 'choosing') + ' (white ' + r.white + ' was over the limit)')]) : [h('span.ok', 'stopped'), r.die && r.die.length ? h('div.sm.dieb' + (r.live ? '.roll' : ''), { title: 'Bonus die' }, r.die.map(f => h('span', { html: KIT.ICON.die(24, f) }))) : null];
    tab.appendChild(h('tr' + (p.seat === v ? '.me' : ''), h('td', h('span.nm', h('span', { html: avHTML(p.seat, 28) }), p.seat === v ? 'You' : p.name)),
      h('td', h('b', D.COINS[sp]), h('span', { html: ico('coin', 14) }), h('div.sm', D.VP[sp] + ' VP' + (D.RUBY[sp] ? ' + ruby' : ''))), h('td', res), h('td', h('b', gTxt), why.length ? h('div.sm.why', why.join(' ')) : null), h('td', h('b', p.vp))));
    sumParts.push((p.seat === v ? 'You' : p.name) + ' ' + gTxt);
    cards.appendChild(h('div.dc' + (p.seat === v ? '.me' : '') + (r.boom && !r.prot ? '.bm' : ''), h('span.dav', { html: avHTML(p.seat, 44) }), h('b.dn', p.seat === v ? 'You' : p.name),
      h('span.dg', { html: ico('vp', 18) + ' ' + esc(gTxt) }), h('span.dr', r.boom ? (r.prot ? 'boom, safe' : 'boom! ★ or 🪙, not both') : 'stopped'), h('span.dt', 'total ' + p.vp)));
  }
  if (G.players.some(p => { const r = dayRow(p, R); return r && r.die && r.die.length; })) tab.appendChild(h('tr', h('td.sm', { colspan: '5' }, 'The boxed number is the bonus die: the furthest cauldron that did not explode rolls it (a tie: all of them).')));
  const lines = hotPriv ? [] : G.log.filter(l => l.i > R.logFrom && (!R.logTo || l.i <= R.logTo) && !/ has decided\.$|^Stir!/.test(l.t)); let ev = null;
  if (lines.length) { ev = h('div.evlog', { role: 'log', 'aria-label': 'What happened' }); lines.forEach(l => ev.appendChild(h('div', youText(l.t)))); setTimeout(() => { ev.scrollTop = ev.scrollHeight; }, 0); }
  const fold = !!myq && !hotShared;   // a choice is waiting: put it first and fold today's results into one line
  if (fold) {
    body.appendChild(decisionBox(me, myq));
    if (!hotPriv) { const d = h('details.rsum', h('summary', h('b', 'Today: '), sumParts.join(' · '), h('span.sm', ' (tap for details)')), tab); if (ev) d.appendChild(ev); body.appendChild(d); }
  } else {
    if (!hotPriv) { body.appendChild(cards); const d = h('details.rsum', h('summary', 'Details'), tab); if (ev) d.appendChild(ev); body.appendChild(d); }
    if (hotShared) body.appendChild(h('p.sm', 'Everybody has seen the table. Next, each maker makes the private choices (shop, rubies) while the others look away.'));
    else if (G.phase === 'eval') { const w = G.players.filter(p => p.q && p.seat !== v).map(p => p.name); body.appendChild(h('p.sm', w.length ? 'Waiting for ' + nameList(w) + '...' : 'Counting up...')); }
  }
  const done = G.phase !== 'eval' && !myq && !hotShared;
  const next = G.phase === 'over' ? 'See the final scores' : 'On to day ' + G.round;
  box.appendChild(body);
  const foot = h('div.rsfoot');
  if (UI.rsFoot) UI.rsFoot.forEach(e => foot.appendChild(e));
  else if (hotShared) foot.appendChild(h('div.cbtns', h('button.btn.go', { 'data-a': 'hotgo', type: 'button' }, 'Next: private choices')));
  else { const btns = h('div.cbtns', { style: 'display:flex;gap:8px;flex-wrap:wrap;align-items:center' });
    btns.appendChild(h('button.btn.go' + (done ? '' : '.off'), { 'data-a': 'rscont', type: 'button', disabled: done ? null : true }, done ? next : (myq ? 'Choose above first' : 'Waiting…')));
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
  closeRS(true); UI.rsMode = ''; if (G.phase === 'over') { checkFinal(); } else { render(); checkReport(); if (!UI.rsOpen) newsLines(false); schedule(); }
}
// ---------- decisions inside the report ----------
const DEC_SHORT = { shop: 'Shop: tap chips for your bag', ruby: 'Spend rubies?', de: 'Boom! Points OR shopping?' };
function tileBtn(m, p, big, small, icons) { return h('button.btn.alt.tile', { 'data-a': 'mv', 'data-i': UI.legal[p.seat].indexOf(m), type: 'button', 'aria-label': m.label }, h('span.ti1', { html: icons }), h('b.ti2', big), small ? h('span.ti3', small) : null); }
// a glowing "best" on the choice a good maker would take, so no choice screen is a guess
function sugMark(box, p, q, legal) {
  try {
    if (q.h === 'shop') {
      const keys = CF.AI.shopChoice(G, p, q.d.coins, 'normal', () => 0.5) || []; const left = keys.slice();
      box.querySelectorAll('.stalls .tok').forEach(b => { const i = left.indexOf(b.dataset.k); if (i >= 0 && !b.disabled) { left.splice(i, 1); b.classList.add('sug'); } });
      return;
    }
    let m = CF.AI.choose(G, p.seat, 'normal'); if (!m) return; if (q.h === 'crow' && m.idx >= 0 && p.hold[m.idx] && p.hold[m.idx].c === 'W') m = legal.find(x => x.idx === -1) || m; const js = JSON.stringify(stripM ? stripM(m) : m);
    const i = legal.findIndex(x => JSON.stringify(stripM ? stripM(x) : x) === js); if (i < 0) return;
    const b = box.querySelector('[data-a=mv][data-i="' + i + '"]'); if (b) b.classList.add('sug');
  } catch (e) {}
}
function decisionBox(p, q) { const box = decisionBox0(p, q); sugMark(box, p, q, UI.legal[p.seat] || []); return box; }
function decisionBox0(p, q) {
  const info = QINFO[q.h], legal = mvList(p.seat); UI.legal[p.seat] = legal;
  const short = DEC_SHORT[q.h];
  const box = h('div.dec.dec-' + q.h, h('h3', short || info[0]), short ? null : h('div.sm', info[1](p, q.d)));
  if (q.h === 'shop') { box.appendChild(shopUI(p, q, legal)); return box; }
  if (q.h === 'de') {
    const row = h('div.tiles');
    legal.forEach(m => row.appendChild(m.o === 'vp' ? tileBtn(m, p, '+' + q.d.vp, 'points', ico('vp', 40)) : tileBtn(m, p, q.d.coins, 'coins to shop', ico('coin', 40))));
    box.appendChild(row); return box;
  }
  if (q.h === 'ruby') {
    box.appendChild(h('div.rhave', h('span', { html: ico('ruby', 22) }), h('b', p.rubies), h('span', { html: ico('drop', 20) }), 'start ' + p.droplet, h('span', { html: ico('flask', 20, p.flask) }), p.flask ? 'full' : 'empty'));
    const row = h('div.tiles');
    legal.forEach(m => { const cost = (m.drop + (m.flask ? 1 : 0)) * 2; row.appendChild(cost ? tileBtn(m, p, '−' + cost, (m.drop ? '+' + m.drop + ' start' : '') + (m.drop && m.flask ? ', ' : '') + (m.flask ? 'refill flask' : ''), ico('ruby', 26) + (m.drop ? ico('drop', 30) : '') + (m.flask ? ico('flask', 30, true) : '')) : tileBtn(m, p, 'Keep', 'my rubies', ico('ruby', 32))); });
    box.appendChild(row); return box;
  }
  const row = h('div.opts', { style: 'display:flex;flex-direction:column;gap:5px' }); legal.forEach(m => row.appendChild(moveBtn(m, p))); box.appendChild(row); return box;
}
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
  body.appendChild(h('div.win', h('span', { html: avHTML(G.winners[0], 52) }), h('div', youText(G.winText))));
  const t = h('table.fin-tab'); const head = h('tr', h('th', 'Cauldron')); for (let r = 1; r <= D.rounds; r++) head.appendChild(h('th', 'D' + r)); head.append(h('th', 'Extra'), h('th', 'Total')); t.appendChild(head);
  for (const p of order) {
    const gains = []; let sum = 0; for (let r = 1; r <= D.rounds; r++) { const hh = G.hist.find(x => x.round === r && x.seat === p.seat); const gn = hh ? hh.after - dayStart(p.seat, r) : 0; gains.push(gn); sum += gn; }
    const row = h('tr' + (G.winners.indexOf(p.seat) >= 0 ? '.w' : ''), h('td', p.seat === viewSeat() ? 'You' : p.name)); gains.forEach(x => row.appendChild(h('td', x))); row.append(h('td', p.vp - sum), h('td', h('b', p.vp))); t.appendChild(row);
  }
  body.appendChild(h('div', { style: 'overflow-x:auto' }, t));
  body.appendChild(h('p.sm', 'D1 to D9 are the points each day brought (fortune cards included). Extra: leftover rubies, 2 rubies for 1 point at the end. Tie: the cauldron that went furthest on the last day wins.'));
  const cfg = UI.cfg || {};
  const online = typeof NET !== 'undefined' && NET.on;
  box.appendChild(body);
  box.appendChild(h('div.rsfoot', h('div.cbtns', { style: 'display:flex;gap:8px;flex-wrap:wrap' }, UI.camp && typeof GXC !== 'undefined' && GXC.active() ? h('button.btn.go', { 'data-a': 'campfin', type: 'button' }, 'Continue the story') : (!online || isHost()) ? h('button.btn.go', { 'data-a': 'again', type: 'button' }, 'Play again') : h('span.sm', 'The host can start a new game.'), h('button.btn.alt', { 'data-a': 'look', type: 'button' }, 'Look at the table'), (UI.camp ? null : h('button.btn.alt', { 'data-a': 'menu', type: 'button' }, online ? 'Lobby' : 'Menu')))));
  const conf = h('div.conf'); const cols = ['#f2b81e', '#d6392f', '#3fa04a', '#3b82d6', '#8a55c4']; for (let i = 0; i < 26; i++) { const c = h('i'); c.style.cssText = 'left:' + Math.random() * 100 + '%;background:' + cols[i % 5] + ';animation-delay:' + Math.random() * 2 + 's;animation-duration:' + (2 + Math.random() * 2) + 's'; conf.appendChild(c); }
  rs.innerHTML = ''; rs.appendChild(box); if (!UI.sim) rs.appendChild(conf);
}
// ---------- guided tips (one at a time, in the dock) ----------
const TIPS = [
  { id: 'welcome', t: 'Welcome to the fair', x: () => 'Pull chips from the bag. Stop before the whites boil over.', when: () => G.round === 1 && mineP() && mineP().pot.length === 0 },
  { id: 'place', t: 'Where chips land', x: () => 'Further along the spiral = more coins and points.', when: () => mineP() && mineP().pot.length >= 1 },
  { id: 'white', t: 'White Fizzpods', x: () => 'White chips heat the pot. Over the limit: boom!', when: () => mineP() && CF.whiteSum(mineP()) > 0 },
  { id: 'risk', t: 'Reading the odds', x: () => 'The meter shows the danger. Red? Think about Stop.', when: () => { const p = mineP(); return p && p.st === 'draw' && p.pot.length >= 3 && CF.risk(G, p.seat).pBoom >= .15; } },
  { id: 'flask', t: 'The flask', x: () => 'The flask puts that white chip back. Once a day.', when: () => { const p = mineP(); return p && p.st === 'draw' && p.flask && p.f.canFlask && CF.whiteSum(p) >= 4; } },
  { id: 'stop', t: 'When to stop', x: () => 'Stop keeps the points and coins under the ring.', when: () => { const p = mineP(); return p && p.st === 'draw' && p.pot.length >= 4; } },
  { id: 'boom', modal: true, light: true, t: 'Boom!', x: () => 'Boom! Now choose: the points OR the shopping.', when: () => { const p = mineP(); return p && p.boom && UI.rsOpen; } },
  { id: 'report', modal: true, t: 'The day report', x: () => 'Everyone stopped. Here is how the day went.', when: () => UI.rsOpen && UI.rsMode === 'report' },
  { id: 'shop', modal: true, light: true, off: true, t: 'The shop', x: () => 'Tap chips to drop them in your bag.', when: () => { const p = mineP(); return p && p.q && p.q.h === 'shop' && UI.rsOpen; } },
  { id: 'rubies', modal: true, t: 'Rubies', x: () => 'Rubies: start further on, or refill the flask.', when: () => { const p = mineP(); return p && p.q && p.q.h === 'ruby' && UI.rsOpen; } },
  { id: 'day2', t: 'Rats and new stalls', x: () => 'Behind? A rat gives you a head start.', when: () => G.round === 2 && G.phase !== 'eval' && !UI.rsOpen },
  { id: 'last', t: 'The last day', x: () => 'Last day: no shop. Leftovers become points.', when: () => G.round === 9 && G.phase !== 'eval' && !UI.rsOpen }
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
      if (t.off || UI.tipShown[t.id] || UI.coach.seen[t.id]) continue;
      if (!guided && lvl === 'light' && !t.light) continue;
      if (!guided && lvl === 'full' && t.id === 'welcome') continue;
      if (!!t.modal !== tipInRs()) continue;
      if (!t.modal) { const m = UI.tipMark; if (m && m.round === G.round && G.logN - m.log < 10) continue; if ((UI.tipRound[G.round] || 0) >= (G.round === 1 ? 3 : 1)) continue; }
      if (t.modal && G.rep && UI.tipRep === G.rep.round) continue;
      if (tipSafe(t)) { if (t.modal && G.rep) UI.tipRep = G.rep.round; UI.tipShown[t.id] = 1; UI.tip = t; UI.coach.seen[t.id] = 1; if (!t.modal) UI.tipRound[G.round] = (UI.tipRound[G.round] || 0) + 1; break; }
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
  target.hidden = false; target.innerHTML = ''; target.className = 'tipb';
  target.appendChild(h('div.tl', h('span.tt', t.x()), h('button.btn.go.tb', { 'data-a': 'tipok', type: 'button', 'aria-label': 'Got it' }, 'OK')));
}
function tipOk() { UI.tip = null; UI.tipMark = { round: G.round, log: G.logN }; tipCheck(); render(); schedule(); }
// ===================== part 5: drawers (scores, log, cards, rules, menu), start screens, events, phone mode, boot =====================
function logHTML() { const e = h('div.logl'); for (let i = G.log.length - 1; i >= Math.max(0, G.log.length - 160); i--) e.appendChild(h('div.ll', h('span.lt', 'D' + G.log[i].round), ' ' + youText(G.log[i].t))); return e; }
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
  row('Info', h('button.btn.alt', { 'data-a': 'rules', type: 'button' }, 'How to play'), h('button.btn.alt', { 'data-a': 'drawer', 'data-v': 'logd', type: 'button' }, 'Log'), h('button.btn.alt', { 'data-a': 'drawer', 'data-v': 'refd', type: 'button' }, 'Chips and cards'), h('span.tinyc', { html: sp }));
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
      h('button.tbtn.story', { 'data-a': 'story', type: 'button' }, h('b', '\u2728 Story'), h('span', campLine() || 'Ten chapters, three bosses')),
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
  const bGuide = h('button.sbtn' + (first ? '.big' : ''), { 'data-start': 'guided', 'data-a': 'guided', type: 'button' }, h('b', 'Guided first game'), h('span', first ? 'New here? You and one computer maker, beginner books and short tips' : 'You and one computer maker, beginner books, tips'));
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
  const t = ev.target.closest('[data-a],[data-start]');
  if (!t) { if (ev.target.closest('#cwrap,#caul')) { const b = document.querySelector('.bagb:not([disabled])'); if (b) b.click(); } return; }   // tapping your own pot pulls a chip too
  const a = t.dataset.a, d = t.dataset;
  if (typeof netClick === 'function' && netClick(a, t)) return;
  if (d.start && !a) { newGame(d.start); return; }
  switch (a) {
    case 'mv': {
      const v = viewSeat(); if (UI.qT && Date.now() - UI.qT < 450 && t.closest('#qbox')) break;   // a pop-up that just opened under a finger ignores that tap
      if (BF.pulling) { if (t.classList.contains('bagb')) BF.fast = true; break; }   // during the pull: a tap on the bag hurries it, nothing else counts
      const m = (UI.legal[v] || [])[+d.i];
      if (m) {
        if (m.t === 'flask') { const pl = G.players[v], wc = pl.pot.filter(c => c.c === 'W').length; if (wc <= 1 && UI.flaskArm !== pl.ver) { UI.flaskArm = pl.ver; toast('That is your only white chip. Tap Flask again to put it back.'); break; } }
        if (m.t === 'draw') UI.drawT = Date.now();
        else if (t.closest && t.closest('#qbox') && Date.now() - (UI.drawT || 0) < 600) break;   // a second quick tap on Draw must not pick the option that just appeared under the finger
        if (UI.tip && !UI.tip.modal && (m.t === 'draw' || m.t === 'stop')) { UI.tip = null; UI.tipMark = { round: G.round, log: G.logN }; renderTip(); }
        if (m.t === 'draw' && !UI.prefs.drew) { UI.prefs.drew = true; savePrefs(); }
        if (m.t === 'stop' && !UI.prefs.stopped) { UI.prefs.stopped = true; savePrefs(); }
        if (m.t === 'draw') { bfPull(m, v); break; }
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
    case 'story': campOpen(); break;
    case 'campfin': closeRS(true); campFinish(); break;
    case 'campgoal': campGoalToast(); break;
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
    case 'drawer': GX.show(d.v); break;
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
  e.append(h('span.lg.lgk', 'Spaces:'), h('span.lg', h('span.lgn', '12'), 'coins'), h('span.lg', h('span.lgb', '3'), 'VP'), h('span.lg', h('span', { html: ico('ruby', 16) }), 'ruby'), h('span.lg', 'path \u2192'), h('button.lgx', { 'data-a': 'legx', type: 'button', 'aria-label': 'Hide this key' }, '\u00d7'));
}
function renderBlg() {
  const e = $('#blg'); if (!e) return; const on = false;   // the header buttons carry their names on phones now
  e.hidden = !on; if (!on || e.dataset.k) return; e.dataset.k = 1;
  e.append(h('div', h('b', 'Top buttons, left to right: '), 'Scores, Log, Chips and cards, How to play, Menu.'), h('button.btn.go', { 'data-a': 'blgx', type: 'button' }, 'OK'));
}
function isPh() { return document.documentElement.classList.contains('ph'); }
function applyPhone() {
  const q = /[?&]phone=(\d)/.exec(location.search); const w = innerWidth, hh = innerHeight, short = Math.min(w, hh);
  let ph = short <= 500 || (window.matchMedia && matchMedia('(pointer:coarse)').matches && short <= 600);
  if (q) ph = q[1] === '1';
  const r = document.documentElement.classList, was = r.contains('ph');
  const shortP = ph && w < hh && hh < 600; r.toggle('ph', ph); r.toggle('ph-short', shortP); document.documentElement.style.setProperty('--dockh', (shortP ? 156 : Math.max(176, Math.min(214, Math.round(hh * .27)))) + 'px'); r.toggle('ph-p', ph && w < hh); r.toggle('ph-l', ph && w >= hh);
  document.documentElement.style.setProperty('--rail', Math.max(220, Math.min(292, Math.round(w * .33))) + 'px');
  document.documentElement.style.setProperty('--gx-sheet-h', (ph ? 'var(--dockh)' : '46dvh'));
  placePrompt(); if (was !== ph) { if (G && UI.started) render(); const st = $('#start'); if (st && !st.hidden && !(typeof NET !== 'undefined' && NET.on) && UI.sv === 'setup') renderStart(); }
}
let rzT = 0, rzT2 = 0, rzSig = '';
// One relayout path for window resize, orientationchange, visualViewport and the board's ResizeObserver. Each event used to cancel the
// others' timer, so the observer (which only re-rendered) could cancel applyPhone and leave the portrait layout classes on a landscape screen.
function relayout(force) {
  const bd = $('#board'), sig = innerWidth + 'x' + innerHeight + '|' + (bd ? bd.clientWidth + 'x' + bd.clientHeight : '');
  if (!force && sig === rzSig) return; rzSig = sig;
  applyPhone(); if (G && UI.started) { UI.potSig = ''; render(); }
  if (typeof pxResize === 'function') { try { pxResize(true); } catch (e) { } }
}
function onResize() { clearTimeout(rzT); clearTimeout(rzT2); rzT = setTimeout(() => relayout(), 60); rzT2 = setTimeout(() => relayout(), 420); }   // iOS reports the old size for a moment after orientationchange
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
  const bd = $('#board'); if (window.ResizeObserver) new ResizeObserver(() => { if (G && UI.started) onResize(); }).observe(bd);
  if (window.visualViewport) visualViewport.addEventListener('resize', onResize);
  try { if (window.GA) { const A = typeof GA_DATA !== 'undefined' ? GA_DATA : {}; GA.init({ sfx: A.sfx || {}, music: A.music || {}, key: 'cf' }); GA.setSfx(UI.prefs.sound); GA.setMusic(UI.prefs.music); } } catch (e) { }
  if (typeof pxPerfReg === 'function') pxPerfReg();
  if (typeof pxInit === 'function') pxInit().then(ok => { if (ok) { pxPerfReg(); if (G && UI.started) render(); } });
  if (/[?&]seed=(\d+)/.test(location.search)) UI.seed = +RegExp.$1;
  if (typeof netInit === 'function') netInit();
  renderStart();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
// ===================== part 6: board first: the bag, the pull, the danger meter, the boil, the explosion, the ghost finger, the shop =====================
// The brew is played on the bag: tap it, a hand rummages (longer when the pot is risky), the chip pops out of the bag and flies onto the
// spiral. The danger meter under it ticks up with every white chip; the pot boils harder as the risk grows. Stop is the one big button.
// Nothing here changes the rules: it only times and shows the same moves (act() / CF.moves()).
const BF = { pulling: false, fast: false, seq: 0, lastWs: {}, fxUntil: 0, heat: 0, launch: null, repT: 0 };
const bfAnim = () => ANIM && !UI.sim && !(typeof pxRM === 'function' && pxRM()) && !/jsdom/i.test(navigator.userAgent || '');
// how long the hand rummages in the bag: a short beat, longer when the next chip may explode the pot
function pullMs(p) { if (!bfAnim() || UI.pullMs === 0) return 0; const r = CF.risk(G, p.seat); return Math.round(480 + 820 * Math.min(1, r.pBoom * 2.4)); }
function heatOf(p) { if (!p || !G) return 0; const lim = CF.limitOf(G, p), ws = CF.whiteSum(p); if (p.boom) return 1; let pb = 0; try { if (G.phase === 'brew' && p.st === 'draw' && p.bag.length && p.bag[0]) pb = CF.risk(G, p.seat).pBoom; } catch (e) { } return Math.max(0, Math.min(1, Math.max(ws / Math.max(1, lim + 1), pb * 2.2))); }
const bfHand = () => '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M22 60 C14 50 12 40 16 30 L18 14 C18 10 24 10 24 14 L25 28 L27 8 C27 3 34 3 34 8 L34 27 L37 10 C37 5 44 5 44 10 L42 29 L46 18 C47 13 53 14 52 19 L48 40 C46 50 42 56 38 60 Z" fill="#f3d2b0" stroke="#5a3a1a" stroke-width="2.4" stroke-linejoin="round"/></svg>';
function bfPull(m, v) {
  if (BF.pulling) { BF.fast = true; return; }              // a second tap hurries the hand, it never draws twice
  const p = G.players[v], ms = pullMs(p);
  if (!ms) { act(m, v); return; }
  BF.pulling = true; BF.fast = false; BF.seq = UI.seq; document.documentElement.classList.add('pulling');
  $$('.bagb').forEach(b => b.classList.add('pull')); snd('draw'); if (ms > 900) setTimeout(() => { if (BF.pulling) snd('tick'); }, ms * .55);
  const t0 = Date.now();
  const step = () => {
    if (BF.seq !== UI.seq || !G || G.phase !== 'brew') { bfEndPull(); return; }
    if (!BF.fast && Date.now() - t0 < ms) { setTimeout(step, 30); return; }
    bfEndPull(); const dm = mvList(v).find(x => x.t === 'draw'); if (dm) act(dm, v); else render();
  };
  setTimeout(step, 30);
}
function bfEndPull() { BF.pulling = false; BF.fast = false; document.documentElement.classList.remove('pulling'); $$('.bagb').forEach(b => b.classList.remove('pull')); }
// the chip pops out of the bag, hangs for a beat, then the painted layer flies it onto the spiral
function bfReveal(chip) {
  if (!bfAnim()) return 0; const bag = document.querySelector('.bagb'); if (!bag) return 0;
  const r = bag.getBoundingClientRect(); if (r.width < 4) return 0;
  const key = chip.c + chip.v, sz = Math.round(Math.min(84, Math.max(56, r.height * .8)));
  const x0 = r.left + r.width / 2, y0 = r.top + r.height * .35, x1 = x0, y1 = Math.max(70, r.top - sz * .9);
  const e = h('div.bfchip' + (chip.c === 'W' ? '.w' : ''), { html: chipHTML(key, sz), 'aria-hidden': 'true' });
  e.style.left = (x1 - sz / 2) + 'px'; e.style.top = (y1 - sz / 2) + 'px'; document.body.appendChild(e);
  const dy = y0 - y1;
  try {
    e.animate([{ transform: 'translateY(' + dy + 'px) scale(.3) rotate(-30deg)', opacity: 0 }, { transform: 'translateY(-8px) scale(1.25) rotate(6deg)', opacity: 1, offset: .45 }, { transform: 'translateY(0) scale(1.1) rotate(0)', opacity: 1, offset: .7 }, { transform: 'translateY(0) scale(1.1)', opacity: 1 }], { duration: 560, easing: 'cubic-bezier(.2,.8,.3,1)', fill: 'forwards' });
    setTimeout(() => { try { e.animate([{ opacity: 1 }, { opacity: 0, transform: 'translateY(-14px) scale(.9)' }], { duration: 160, fill: 'forwards' }); } catch (x) { } setTimeout(() => e.remove(), 180); }, 560);
  } catch (x) { setTimeout(() => e.remove(), 700); }
  const bd = $('#bd'); if (bd) { const B = bd.getBoundingClientRect(); BF.launch = { x: x1 - B.left, y: y1 - B.top, t: Date.now() }; }
  return 520;
}
// ---------- the brew deck: one line, the danger meter, the bag and Stop ----------
function bfLine(p, r, fm) {
  if (!p.pot.length) return G.round === 1 ? 'Tap the bag to pull a chip!' : 'Tap the bag to start brewing';
  if (p.lock) return 'Decided. Waiting for the others…';
  const pct = Math.round(r.pBoom * 100);
  if (fm && p.pot[p.pot.length - 1].c === 'W' && CF.whiteSum(p) >= r.limit - 2) return 'Too hot? The flask puts it back';
  if (pct >= 40) return 'Very risky! Stop now?';
  if (pct >= 20) return 'Risky… one more, or Stop?';
  if (pct > 0) return 'Pull again, or Stop and keep it';
  return 'Safe! Pull another chip';
}
function bfMeter(p, v, fm, legal) {
  const lim = CF.limitOf(G, p), ws = CF.whiteSum(p), r = CF.risk(G, v), pct = Math.round(r.pBoom * 100);
  const prev = BF.lastWs[p.seat + ':' + G.round] || 0; BF.lastWs[p.seat + ':' + G.round] = ws;
  const lv = ws > lim ? 'over' : ws >= lim - 1 ? 'hi' : ws >= lim - 3 ? 'mid' : 'lo';
  const cells = h('span.mcells', { 'aria-hidden': 'true' });
  const n = Math.max(lim, ws);
  for (let i = 1; i <= n; i++) { const c = h('i' + (i <= ws ? '.on' : '') + (i > lim ? '.x' : '') + (i <= ws && i > prev ? '.new' : '')); if (i <= ws && i > prev) c.style.animationDelay = ((i - prev - 1) * 110) + 'ms'; cells.appendChild(c); }
  cells.appendChild(h('b.mboom', { html: ico('boom', 22) }));
  const m = h('div.meter.' + lv + (ws > prev ? '.up' : ''), { 'data-priv': v, role: 'meter', 'aria-valuemin': 0, 'aria-valuemax': lim, 'aria-valuenow': ws, 'aria-label': 'White chips ' + ws + ' of ' + lim + '. Next chip: ' + pct + '% to explode.' },
    h('span.mw', { html: KIT.chipSVG('W', 0, { size: 22 }) }), cells, h('span.mn', h('b', ws), '/' + lim),
    G.phase === 'brew' && p.st === 'draw' && !p.lock ? h('span.mp.' + (pct < 15 ? 'lo' : pct < 30 ? 'mid' : 'hi'), pct + '%') : null,
    fm ? h('button.flb', { 'data-a': 'mv', 'data-i': legal.indexOf(fm), type: 'button', 'aria-label': 'Flask: put the last white chip back in the bag', title: 'Flask: put the last white chip back' }, h('span', { html: ico('flask', 22, true) })) : null);
  return m;
}
function brewDeck(p, v, legal) {
  const dm = legal.find(x => x.t === 'draw'), sm = legal.find(x => x.t === 'stop'), fm = legal.find(x => x.t === 'flask');
  const r = CF.risk(G, v), sp = CF.spaceOf(p), heat = heatOf(p);
  const deck = h('div.bdeck' + (heat > .7 ? '.hot' : ''));
  deck.appendChild(h('div.bline', { 'aria-live': 'polite' }, bfLine(p, r, fm)));
  deck.appendChild(bfMeter(p, v, p.lock ? null : fm, legal));
  const extras = [legal.find(x => x.t === 'froth') ? h('button.btn.alt.sec', { 'data-a': 'mv', 'data-i': legal.indexOf(legal.find(x => x.t === 'froth')), type: 'button' }, '↩ White chip back, free') : null,
    legal.find(x => x.t === 'restart') ? h('button.btn.alt.sec', { 'data-a': 'mv', 'data-i': legal.indexOf(legal.find(x => x.t === 'restart')), type: 'button' }, 'Do-over: tip the chips back, once') : null].filter(Boolean);
  const rat = legal.filter(x => x.t === 'ratset');
  if (rat.length) { const k = p.rat - p.droplet; const d = h('details.ratd', h('summary', h('span', { html: ico('rat', 18) }), 'Head start +' + k)); const row = h('div.ratrow'); rat.forEach(x => row.appendChild(h('button.btn.alt', { 'data-a': 'mv', 'data-i': legal.indexOf(x), type: 'button' }, x.n ? 'Only +' + x.n : 'None'))); d.appendChild(row); extras.push(d); }
  const bagArt = KIT.ART.bag ? h('img.bagimg', { src: KIT.ART.bag, alt: '' }) : h('span.bagimg', { html: ico('bag', 80) });
  const bag = dm ? h('button.btn.drawb.bagb' + (BF.pulling ? '.pull' : ''), { 'data-a': 'mv', 'data-i': legal.indexOf(dm), type: 'button', 'aria-label': 'Draw: pull a chip from your bag (' + bagN(p) + ' chips inside)' },
    h('span.bagwrap', bagArt, h('span.hand', { html: bfHand() }), h('span.bagn', bagN(p))), h('span.bl', 'Draw'))
    : h('button.btn.drawb.bagb.off', { type: 'button', disabled: true }, h('span.bagwrap', bagArt, h('span.bagn', bagN(p))), h('span.bl', p.lock ? 'Waiting' : 'Draw'));
  const keep = h('small.keep', h('span', { html: ico('vp', 15) }), D.VP[sp], h('span', { html: ico('coin', 15) }), D.COINS[sp], D.RUBY[sp] ? h('span', { html: ico('ruby', 15) }) : null);
  const stop = sm ? h('button.btn.stopb', { 'data-a': 'mv', 'data-i': legal.indexOf(sm), type: 'button', disabled: BF.pulling ? true : null, 'aria-label': 'Stop and keep ' + D.VP[sp] + ' points and ' + D.COINS[sp] + ' coins' }, h('b', 'Stop'), keep)
    : h('button.btn.stopb.off', { type: 'button', disabled: true, title: 'Pull your first chip first' }, h('b', 'Stop'), p.pot.length ? keep : h('small.keep', 'after a chip'));
  deck.appendChild(h('div.brow', bag, stop));
  if (extras.length) deck.appendChild(h('div.bextra', extras));   // below Draw/Stop, so the two big buttons never move
  return deck;
}
// ---------- the boil: the pot reacts to the risk (CSS on #cwrap, the painted layer reads BF.heat) ----------
function bfHeat() {
  const cw = $('#cwrap'); if (!cw || !G) return; const f = focusSeat(), p = G.players[f];
  const ht = G.phase === 'brew' || p.boom ? heatOf(p) : 0; BF.heat = ht;
  cw.style.setProperty('--heat', ht.toFixed(2)); cw.dataset.heat = ht > .75 ? 3 : ht > .5 ? 2 : ht > .25 ? 1 : 0;
}
// ---------- the explosion ----------
function bfBoom(e) {
  if (!bfAnim()) return; const mine = isMine(e.seat), f = focusSeat(); if (e.seat !== f && !mine) return;
  const big = mine, T = big ? 460 : 220, TOT = big ? 1600 : 1000;           // a tension beat on the deciding draw, then the bang, then the result
  BF.fxUntil = Date.now() + TOT + 40; clearTimeout(BF.repT);
  const o = h('div.boomfx' + (e.prot ? '.prot' : '') + (big ? '' : '.small'), { 'aria-hidden': 'true' }, h('div.btense'), h('div.bflash'), h('div.bword', e.prot ? 'BOOM… safe!' : 'BOOM!'), h('div.bsub', 'White ' + CF.whiteSum(G.players[e.seat]) + ' > ' + CF.limitOf(G, G.players[e.seat])));
  o.style.setProperty('--T', T + 'ms'); o.style.setProperty('--S', big ? 1 : .6);
  const cols = ['#f8f2e0', '#ff8a2a', '#7fd65a', '#ffd23a', '#8a5cf0'], n = big ? 30 : 16;
  for (let i = 0; i < n; i++) {
    const w = i % 5 === 0 ? h('i.shard.chipy') : h('i.shard'); const a = -Math.PI / 2 + (Math.random() - .5) * 2.6, d = (big ? 140 : 90) + Math.random() * (big ? 260 : 150);
    w.style.setProperty('--dx', Math.round(Math.cos(a) * d) + 'px'); w.style.setProperty('--dy', Math.round(Math.sin(a) * d * 1.2 + d * .5) + 'px'); w.style.setProperty('--c', cols[i % cols.length]);
    w.style.animationDelay = (T + Math.round(Math.random() * 140)) + 'ms'; o.appendChild(w);
  }
  document.body.appendChild(o);
  const cw = $('#cwrap'), app = document.querySelector('.gx-app'); let done = false;
  const end = skip => { if (done) return; done = true; o.remove(); if (cw) cw.classList.remove('tense'); if (app) app.classList.remove('quake'); if (skip) { BF.fxUntil = 0; if (typeof checkReport === 'function') checkReport(); } };
  o.addEventListener('click', () => end(true)); o.style.pointerEvents = 'auto';  // a tap skips it
  if (cw) cw.classList.add('tense'); snd('tick'); setTimeout(() => { if (!done) snd('tick'); }, T * .55);
  setTimeout(() => {
    if (done) return; if (cw) cw.classList.remove('tense'); snd('boom'); o.classList.add('bang');
    if (app) { app.classList.remove('quake'); void app.offsetWidth; app.classList.add('quake'); }
    try { if (navigator.vibrate) navigator.vibrate([90, 40, 160]); } catch (x) { }
  }, T);
  setTimeout(() => end(false), TOT);
}
// ---------- events: called from playEvents ----------
function bfEvent(e) {
  if (!G || UI.sim) return;
  if (e.t === 'place' && isMine(e.seat) && focusSeat() === e.seat && e.chip) { const d = bfReveal(e.chip); if (d && typeof PX !== 'undefined') PX.flyIds[e.chip.i] = d; }
  else if (e.t === 'boom') bfBoom(e);
}
// ---------- the ghost finger: shows the very first moves, then goes away ----------
function bfGhost() {
  let g = $('#ghost'); const tgt = bfGhostTarget();
  if (!tgt) { if (g) g.hidden = true; return; }
  if (!g) { g = h('div#ghost', { 'aria-hidden': 'true', html: bfHand() }); document.body.appendChild(g); }
  const r = tgt.getBoundingClientRect(); if (r.width < 4) { g.hidden = true; return; }
  g.hidden = false; g.style.left = Math.round(Math.min(innerWidth - 52, r.left + r.width * .62)) + 'px'; g.style.top = Math.round(Math.min(innerHeight - 64, r.top + r.height * .5)) + 'px';
}
function bfGhostTarget() {
  if (!G || !UI.started || G.phase === 'over' || hotSeat() || UI.coach.level === 'off') return null;
  const p = mineP(); if (!p) return null; const fresh = UI.mode === 'guided' || !UI.prefs.drew;
  if (UI.rsOpen && UI.rsMode === 'report') {
    if (p.q && p.q.h === 'shop' && !UI.prefs.shopped && !(UI.shopSel || []).length) return document.querySelector('#rs .tok.sug:not([disabled])') || document.querySelector('#rs .tok:not([disabled])');
    if (p.q && p.q.h === 'shop' && !UI.prefs.shopped && (UI.shopSel || []).length) return document.querySelector('#rs [data-a=shopbuy]');
    return null;
  }
  if (UI.rsOpen || G.phase !== 'brew' || p.st !== 'draw' || p.lock || p.q || focusSeat() !== p.seat) return null;
  if (fresh && !p.pot.length && G.round === 1 && !BF.pulling) return document.querySelector('#acts .bagb:not([disabled])');
  if (UI.mode === 'guided' && G.round === 1 && !UI.prefs.stopped && p.pot.length >= 3 && CF.risk(G, p.seat).pBoom >= .2 && !BF.pulling) return document.querySelector('#acts .stopb:not([disabled])');
  return null;
}
// ---------- the shop: tap a chip, it drops into your bag ----------
function shopUI(p, q, legal) {
  const wrap = h('div.shop'); const coins = q.d.coins, sel = UI.shopSel = (UI.shopSel || []).filter(k => G.supply[k] > 0);
  const cost = sel.reduce((a, k) => a + CF.price(G, k[0], +k.slice(1)), 0);
  wrap.appendChild(h('div.purse', h('span', { html: ico('coin', 30) }), h('b', coins - cost), h('span.pl', sel.length ? ' left' : ' coins to spend')));
  const stalls = h('div.stalls');
  for (const c of D.SHOP_COLORS) {
    const out = CF.bookOut(G, c), bk = c === 'O' ? D.BOOKS.O[0] : c === 'K' ? D.BOOKS.K[0] : D.BOOKS[c][G.sets[c]];
    const st = h('div.stall' + (out ? '' : '.locked'));
    st.appendChild(h('details.sth', h('summary', { 'aria-label': D.COLORS[c].name + ': how it works' }, h('b', D.COLORS[c].name), h('span.bi', { 'aria-hidden': 'true' }, out ? 'i' : 'day ' + D.BOOK_ROUND[c])), h('div.bx', bk.title + ': ' + bk.text)));
    const row = h('div.toks');
    D.COLORS[c].vals.forEach(val => {
      if (c === 'W' || (c === 'O' && val !== 1)) return; const key = c + val, price = CF.price(G, c, val), left = G.supply[key];
      const on = sel.indexOf(key) >= 0; const others = sel.filter(k => k[0] !== c).reduce((a, k) => a + CF.price(G, k[0], +k.slice(1)), 0);
      const dis = !out || left < 1 || price + others > coins;
      row.appendChild(h('button.tok' + (on ? '.on' : ''), { 'data-a': 'shopsel', 'data-k': key, type: 'button', disabled: dis && !on ? true : null, 'aria-pressed': on ? 'true' : 'false', 'aria-label': keyName(key) + ' for ' + price + ' coins' + (left < 1 ? ', sold out' : '') },
        chipN(key, 40), h('span.pc', h('span', { html: ico('coin', 12) }), left < 1 ? '—' : price)));
    });
    st.appendChild(row); stalls.appendChild(st);
  }
  wrap.appendChild(stalls);
  const bagArt = KIT.ART.bag ? h('img.sbimg', { src: KIT.ART.bag, alt: '' }) : h('span.sbimg', { html: ico('bag', 56) });
  const bagz = h('div.shopbag', { 'aria-label': 'Your bag' }, bagArt, h('div.sbin', sel.length ? sel.map(k => h('button.sbc', { 'data-a': 'shopsel', 'data-k': k, type: 'button', 'aria-label': 'Take ' + keyName(k) + ' out again' }, chipN(k, 40))) : h('span.sbe', 'Tap chips to drop them in')));
  UI.rsFoot = [h('div.shopfoot', bagz, h('button.btn.go', { 'data-a': 'shopbuy', type: 'button' }, sel.length ? 'Done' : 'Buy nothing'))];
  return wrap;
}
function bfFly(fromR, toEl, key, size) {
  if (!bfAnim() || !fromR || !toEl) return; const to = toEl.getBoundingClientRect(); if (to.width < 4) return;
  const e = h('div.bfchip', { html: chipHTML(key, size || 40), 'aria-hidden': 'true' }); e.style.left = fromR.left + 'px'; e.style.top = fromR.top + 'px'; document.body.appendChild(e);
  toEl.style.visibility = 'hidden';
  try { const a = e.animate([{ transform: 'translate(0,0) scale(1)' }, { transform: 'translate(' + ((to.left - fromR.left) / 2) + 'px,' + ((to.top - fromR.top) / 2 - 60) + 'px) scale(1.3)', offset: .5 }, { transform: 'translate(' + (to.left - fromR.left) + 'px,' + (to.top - fromR.top) + 'px) scale(1)' }], { duration: 420, easing: 'ease-in-out' }); a.onfinish = () => { e.remove(); toEl.style.visibility = ''; }; }
  catch (x) { e.remove(); toEl.style.visibility = ''; }
}
function shopToggle(key) {
  const c = key[0]; let sel = UI.shopSel.slice(); const i = sel.indexOf(key), adding = i < 0;
  const src = document.querySelector('#rs .tok[data-k="' + key + '"] svg'), fromR = src ? src.getBoundingClientRect() : null;
  if (i >= 0) sel.splice(i, 1); else { sel = sel.filter(k => k[0] !== c); sel.push(key); if (sel.length > 2) sel.shift(); }
  UI.shopSel = sel; snd(adding ? 'coin' : 'click'); renderReport();
  if (adding) { const t = document.querySelector('#rs .sbc[data-k="' + key + '"]'); bfFly(fromR, t, key, 40); setTimeout(() => snd('plop'), 380); }
  bfGhost();
}
function shopBuy() {
  const v = viewSeat(); if (v < 0) return; const items = UI.shopSel.slice();
  const go = () => { UI.shopSel = []; UI.prefs.shopped = true; savePrefs(); if (!act({ t: 'buy', items }, v)) toast('That purchase did not work.'); };
  const cs = $$('#rs .sbc'), img = document.querySelector('#rs .sbimg');
  if (!items.length || !bfAnim() || !cs.length || !img) { go(); return; }
  if (UI.buying) return; UI.buying = true;
  const ir = img.getBoundingClientRect();
  cs.forEach((c, k) => { const r = c.getBoundingClientRect(); try { c.animate([{ transform: 'none', opacity: 1 }, { transform: 'translate(' + (ir.left + ir.width / 2 - r.left - r.width / 2) + 'px,' + (ir.top + ir.height * .3 - r.top - r.height / 2 - 40) + 'px) scale(.8)', offset: .55 }, { transform: 'translate(' + (ir.left + ir.width / 2 - r.left - r.width / 2) + 'px,' + (ir.top + ir.height * .45 - r.top - r.height / 2) + 'px) scale(.2)', opacity: 0 }], { duration: 520, delay: k * 120, fill: 'forwards', easing: 'ease-in' }); } catch (x) { } });
  try { img.animate([{ transform: 'none' }, { transform: 'scale(1.12,.9)' }, { transform: 'none' }], { duration: 300, delay: 480 + (cs.length - 1) * 120 }); } catch (x) { }
  snd('buy'); setTimeout(() => { UI.buying = false; go(); }, 720 + (cs.length - 1) * 120);
}
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
  const bi = $('#bagi'), bb = document.querySelector('#acts .bagb'); if (bb && bb.getBoundingClientRect().width > 4) { const b = bb.getBoundingClientRect(); PX.bag = { x: Math.max(10, Math.min(B.width - 10, b.left - B.left + b.width / 2)), y: Math.min(B.height - 8, b.top - B.top + b.height * .3) }; } else if (bi && bi.getBoundingClientRect().width > 4) { const b = bi.getBoundingClientRect(); PX.bag = { x: b.left - B.left + 18, y: b.top - B.top + 20 }; } else PX.bag = { x: B.width / 2, y: B.height - 8 };
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
      if (fly && !snapAll) { const L0 = typeof BF !== 'undefined' && BF.launch && Date.now() - BF.launch.t < 1500 ? BF.launch : PX.bag, dl = typeof fly === 'number' && fly > 1 ? fly * .9 : 0; if (L0 === (typeof BF !== 'undefined' && BF.launch)) BF.launch = null;
        o.sp.x = L0.x; o.sp.y = L0.y; o.sp.scale.set(csz / 128 * 1.5); o.sp.rotation = -.6; o.sp.alpha = 0; o.sh.visible = false; o.flying = true; o.tx = tp.x; o.ty = tp.y;
        PX.nFly = (PX.nFly || 0) + 1; PX.tweens.push({ t0: performance.now() + dl, dur: 520, from: { x: L0.x, y: L0.y, s: csz / 128 * 1.7, r: dl ? 0 : -.6 }, to: { x: tp.x, y: tp.y, s: csz / 128, r: 0 }, arc: -PX.k * 2.6, obj: o, ease: pxEase, land: true }); }
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
  else if (e.t === 'boom') { if (ANIM && !UI.sim) { PX.nBoom = (PX.nBoom || 0) + 1; PX.boomSeat = f; PX.flash = 1.4; PX.shake = 1.1; if (q.parts) for (let i = 0; i < Math.round(22 * q.parts); i++) pxPuff(PX.cx + (Math.random() - .5) * PX.S * .3, PX.cy + (Math.random() - .5) * PX.S * .3, i); } }
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
    if (tw.land) { sp.alpha = tw.from.r === 0 ? 1 : Math.min(1, u * 5); }
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
  const q = PXQ[PX.q]; const HT = typeof BF !== 'undefined' ? BF.heat || 0 : 0; const want = q.parts && PX.on && G && UI.started && !UI.sim ? Math.round(Math.min(16, 3 + Math.min(6, (PX.chipsN || 0) * .6) + 10 * HT) * Math.max(.6, q.parts)) : 0;
  while (PX.amb.length < want && PX.amb.length < 16 && PX.tex.bubble) { const b = new PIXI.Sprite(PX.tex.bubble); b.anchor.set(.5); b.__ph = Math.random(); b.__a = Math.random() * 6.28; b.__r = Math.sqrt(Math.random()) * .8; b.__sp = .25 + Math.random() * .4; PX.L.amb.addChild(b); PX.amb.push(b); }
  while (PX.amb.length > want) { const b = PX.amb.pop(); try { b.destroy(); } catch (e) { } }
  const hot = PX.boomNow ? 1.8 : 1 + 2.4 * HT;
  for (const b of PX.amb) { b.__ph += dt * b.__sp * hot; if (b.__ph > 1) { b.__ph = 0; b.__a = Math.random() * 6.28; b.__r = Math.sqrt(Math.random()) * .8; } const u = b.__ph, rr = b.__r * KIT.GEO.R * PX.k; b.x = PX.cx + Math.cos(b.__a) * rr; b.y = PX.cy + Math.sin(b.__a) * rr - u * PX.k * .4; const s = Math.sin(Math.PI * u); b.scale.set(PX.k * (.12 + (.26 + .22 * HT) * s) / 96); b.alpha = (.55 + .3 * HT) * s; b.tint = PX.boomNow ? 0xffc89a : HT > .7 ? 0xffd2b0 : 0xffffff; }
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
  const ht = typeof BF !== 'undefined' ? BF.heat || 0 : 0;
  if (PX.shake > 0) { PX.shake = Math.max(0, PX.shake - dt); PX.root.x = (Math.random() - .5) * 18 * PX.shake; PX.root.y = (Math.random() - .5) * 14 * PX.shake; moving = true; if (PX.shake === 0) { PX.root.x = 0; PX.root.y = 0; } }
  else if (ht > .6 && q.fx && !snap && !PX.boomNow) { const a = (ht - .6) * 4; PX.root.x = Math.sin(PX.t * 37) * a; PX.root.y = Math.cos(PX.t * 29) * a * .7; moving = true; }
  else if (PX.root.x || PX.root.y) { PX.root.x = 0; PX.root.y = 0; }
  if (PX.flash > 0) { PX.flash = Math.max(0, PX.flash - dt * 2.4); moving = true; PX.flashG.clear(); if (PX.flash > 0) PX.flashG.circle(PX.cx, PX.cy, PX.S / 2 - 2).fill({ color: 0xff5030, alpha: Math.min(1, PX.flash) * .6 }); else PX.flashG.clear(); }
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
// ===================== part 8: Story mode (campaign.json + the shared chapter kit gx-campaign.js) =====================
// A chapter is a normal game with the chapter's table, AI level, books and coach setting, plus one optional twist applied once
// right after CF.newGame (before any chip is drawn). The twists only exist here: the normal game's rules never change.
UI.camp = null;
const CAMP_CHAR = { wynne: 0, odo: 1, tamsin: 2, mirabel: 3, vesper: 2 };      // who sits where (cast id -> maker)
const CAMP_THIRD = { c5: 'wynne', c9: 'mirabel' };                              // the 3rd pot in the 3-player chapters
const CAMP_ME = [3, 2, 1, 0];                                                    // your maker: the first one not already a rival
function campTwist(g, tw) {
  if (!tw || !tw.id) return;
  const boss = g.players[1], me = g.players[0], n = tw.param;
  switch (tw.id) {
    case 'boss-rubies': boss.rubies += n; break;
    case 'boss-chip': CF._.give(g, boss, n, true); break;
    case 'boss-droplet': boss.droplet = n; break;
    case 'boss-lead': boss.vp = n; break;
    case 'crowded-bag': for (let k = 0; k < n; k++) CF._.give(g, me, 'W1', true); break;
  }
}
// act 1 teaches with the full coach; later acts have none. The player's own guide setting comes back outside the story.
function campCoach(def) {
  if (def) { if (UI.coachPref == null) UI.coachPref = UI.coach.level; UI.coach.level = def.hints ? 'full' : 'off'; }
  else if (UI.coachPref != null) { UI.coach.level = UI.coachPref; UI.coachPref = null; }
}
function campMetrics(g) {
  const mine = g.hist.filter(x => x.seat === 0), won = g.winner === 0, vp = g.players[0].vp;
  const best = Math.max.apply(null, g.players.slice(1).map(p => p.vp));
  return { won, score: vp, margin: vp - best, winScore: won ? vp : 0, booms: mine.filter(x => x.boom).length,
    best: mine.reduce((a, x) => Math.max(a, x.space || 0), 0), bought: mine.reduce((a, x) => a + ((x.bought && x.bought.length) || 0), 0), rounds: g.round };
}
function campIsWon(g, def) {
  const m = campMetrics(g), gl = def.goal || {}, needWin = !gl.winNotNeeded;
  if (needWin && !m.won) return false;
  switch (gl.type) {
    case 'score': return m.score >= gl.value;
    case 'margin': return m.margin >= gl.value;
    case 'custom': return m.bought >= gl.value;      // c2: buy chips
    default: return m.won;
  }
}
function campStart(def) {
  const s = def.setup || {}, op = def.opponent || {}, np = s.players || 2, lv = op.aiLevel || 'normal';
  const rv = [CAMP_CHAR[op.cast] != null ? CAMP_CHAR[op.cast] : 1];
  if (np > 2) { const t = CAMP_CHAR[CAMP_THIRD[def.id]]; rv.push(t != null && rv.indexOf(t) < 0 ? t : [0, 1, 2, 3].find(c => rv.indexOf(c) < 0)); }
  const me = CAMP_ME.find(c => rv.indexOf(c) < 0), lvBy = {}; rv.forEach(c => lvBy[c] = lv);
  UI.seed = s.seed != null ? s.seed : null;
  return newGame('vs', { camp: def, np, me, seats: rv, lvBy, sets: s.setMode != null ? s.setMode : 1 });
}
function campFinish() { try { GXC.finish(G); } catch (e) { console.error(e); } }
function campOpen() { if (typeof GXC === 'undefined') return; GXC.open(); }
function campGoalToast() { const d = UI.camp; if (d) toast('Goal: ' + d.goal.text + (d.twist ? ' ' + d.twist.text : '')); }
function campLine() {
  try {
    if (typeof GXC === 'undefined' || !window.CAMPAIGN) return '';
    const p = GXC.progress(), ch = window.CAMPAIGN.chapters, n = ch.filter(c => p.ch[c.id] && p.ch[c.id].beaten).length;
    return n ? n + ' of ' + ch.length + ' chapters done' : '';
  } catch (e) { return ''; }
}
function campInit() {
  if (typeof GXC === 'undefined' || !window.CAMPAIGN) return;
  GXC.init({
    game: 'cauldron', data: window.CAMPAIGN,
    startChapter: campStart,
    isWon: campIsWon, metrics: campMetrics,
    onExit: () => { UI.camp = null; campCoach(null); showStart(); },
    scores: g => g.players.map(p => p.vp),
    seats: g => g.players.map((p, i) => ({ name: i === 0 ? 'You' : p.name, me: i === 0, ai: p.ai || undefined }))
  });
}
campInit();
