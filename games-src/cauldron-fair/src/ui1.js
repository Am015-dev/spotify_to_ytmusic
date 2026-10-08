// ===================== part 1: globals, helpers, small model helpers, sound, save / load =====================
var ANIM = 1, AIDELAY = 650;
var G = null;
var UI = { started: false, mode: 'vs', cfg: null, holder: -1, focus: 0, pop: null, seq: 0, evN: 0, over: null, overShown: false, rep: false, repLog: 0, repV: [], repDay: 0, tm: {}, tipq: [], tipShown: {}, tip: null,
  coach: { level: 'full', seen: {} }, prefs: { sound: true, music: true, gfx: 'auto', hint: true }, busy: false, shopSel: [], legal: {}, sim: false, rsOpen: false, aiHold: {} };
const D = CF.DATA;
const LASTD = () => G ? CF.lastOf(G) : D.rounds;      // the number of days of the game on the table (9; the staged tutorial has 2)
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
function save() { try { if (!G || UI.camp || UI.mode === 'tutorial' || (typeof NET !== 'undefined' && NET.on) || G.phase === 'over') return false; localStorage.setItem('cf_save', JSON.stringify({ v: SAVEV, G, mode: UI.mode, cfg: UI.cfg, chefs: UI.chefs, focus: UI.focus, holder: UI.holder })); return true; } catch (e) { return false; } }
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
function toast(t) { const e = $('#toast'); if (!e || (typeof tutOn === 'function' && tutOn())) return; e.textContent = t; e.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => e.classList.remove('on'), Math.min(7000, 2000 + 45 * t.length)); }
