// ===================== part 1: globals, helpers, view model =====================
var ANIM = 1, AIDELAY = 650;
var G = null;
var UI = { started: false, mode: 'vs', cfg: null, holder: -1, sel: -1, job: -1, pingSel: false, giveSel: -1, pop: null, cards: [], fz: null, busy: false, seq: 0, over: null, overShown: false,
  coach: { level: 'full', seen: {}, keep: false }, prefs: { sound: true, music: true, gfx: 'auto', guide: 'full', timer: false, speed: 650 }, enter: '', tm: null, rq: [], chefs: null, hint: null, why: '', predN: -1, evN: 0, timerAt: 0 };
const D = LD.DATA, TASKS = D.tasks, KIT = LDKit;
const suitOf = D.suitOf, valOf = D.valOf;
// painted art: LD_ART (data URIs made by build.py) -> blob URLs so the card <svg>s carry short links. Without blob URLs (jsdom) the kit keeps its own vector drawings.
(function () {
  try {
    if (typeof LD_ART === 'undefined' || /jsdom/i.test(navigator.userAgent || '') || !window.URL || !URL.createObjectURL || !window.Blob || !window.atob) return;
    const m = {};
    for (const k in LD_ART) { const p = LD_ART[k].split(','), mime = (/data:([^;]+)/.exec(p[0]) || [0, 'image/webp'])[1], bin = atob(p[1]), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); m[k] = URL.createObjectURL(new Blob([u], { type: mime })); }
    KIT.setArt(m);
  } catch (e) { }
})();
const $ = s => /^#[\w-]+$/.test(s) ? document.getElementById(s.slice(1)) : document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const DEF = { np: 4, level: 'normal', lv: ['hard', 'normal', 'normal', 'easy'], seats: [0, 1, 2], mission: 1, kind: 'log', d: 6, cmt: 'normal', deep: 18, job: 1, timer: false };
const YOU = 4;     // diver portrait index of "you"
// tiny element builder: h('div.cls#id', {attr:..}, ...kids)
function h(sel, at) {
  const m = /^([a-z0-9]*)((?:[.#][\w-]+)*)$/i.exec(sel) || [0, 'div', ''];
  const e = document.createElement(m[1] || 'div');
  const cls = []; (m[2] || '').replace(/([.#])([\w-]+)/g, (_, k, v) => { if (k === '#') e.id = v; else cls.push(v); });
  if (cls.length) e.className = cls.join(' ');
  let i = 2;
  if (at && typeof at === 'object' && !(at instanceof Node) && !Array.isArray(at)) { for (const k in at) { const v = at[k]; if (v == null || v === false) continue; if (k === 'text') e.textContent = v; else if (k === 'html') e.innerHTML = v; else e.setAttribute(k, v === true ? '' : v); } } else i = 1;
  for (; i < arguments.length; i++) add(e, arguments[i]);
  return e;
}
function add(e, k) { if (k == null || k === false) return; if (Array.isArray(k)) k.forEach(x => add(e, x)); else e.appendChild(k instanceof Node ? k : document.createTextNode(String(k))); }
const _nodes = new Map();
function svgEl(s) { const t = document.createElement('template'); t.innerHTML = s.trim(); return t.content.firstChild; }
function artNode(key, strFn) { let t = _nodes.get(key); if (!t) { t = svgEl(strFn()); _nodes.set(key, t); } return t.cloneNode(true); }
const _art = new Map();
function cached(key, fn) { let v = _art.get(key); if (v === undefined) { v = fn(); _art.set(key, v); } return v; }
const cardN = (id, w, dim) => { const n = artNode('c|' + id + '|' + w + '|' + (dim ? 1 : 0), () => KIT.cardSVG(id, { w, dim })); n.classList.add('card'); return n; };
const backN = w => { const n = artNode('b|' + w, () => KIT.backSVG({ w })); n.classList.add('card'); return n; };
const cardS = (id, w) => cached('cs|' + id + '|' + w, () => KIT.cardSVG(id, { w }));
const iconS = (n, s) => cached('i|' + n + '|' + s, () => KIT.iconSVG(n, s));
const cname = id => D.cardName(id);
// portraits: a seat shows a diver portrait; the drone has its own
const chefOf = s => G && G.players[s] && G.players[s].helper ? -1 : (UI.chefs && UI.chefs[s] != null ? UI.chefs[s] : (s === 0 ? YOU : (s - 1) % 4));
const avatarS = (s, size) => { const c = chefOf(s); return c < 0 ? cached('dr|' + size, () => KIT.droneSVG({ size })) : cached('a|' + c + '|' + size, () => KIT.avatarSVG(c, { size })); };
const avatarC = (c, size) => cached('a|' + c + '|' + size, () => KIT.avatarSVG(c, { size }));
const avN = (s, size) => svgEl(avatarS(s, size));
// ---- game helpers ----
const humans = () => G ? G.players.map((p, i) => (p.ai || p.helper) ? -1 : i).filter(i => i >= 0) : [];
const hotSeat = () => !!G && !NET.on && humans().length > 1;
const watching = () => !!G && humans().length === 0;
function viewSeat() { if (!G) return -1; if (NET.on) return NET.mySeat; if (hotSeat()) { if (UI.holder < 0 && G.phase === 'distress' && !UI.cards.length) { const p = LD.pending(G).find(s => !G.players[s].ai && !G.players[s].helper); return p != null ? p : -1; } return UI.holder; } const hs = humans(); return hs.length ? hs[0] : -1; }
const pname = s => G && G.players[s] ? G.players[s].name : '?';
const nameList = a => a.length <= 1 ? (a[0] || '') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1];
const ntrOf = () => G ? G.ntr : 10;
const isOver = () => G && G.phase === 'over';
function jobs(s) { const o = []; G.tasks.forEach((t, i) => { if (t.owner === s) o.push(i); }); return o; }
const jobDef = i => TASKS[G.tasks[i].id];
const jobShort = i => TASKS[G.tasks[i].id].s;
const jobText = i => TASKS[G.tasks[i].id].t;
const jobDiff = i => TASKS[G.tasks[i].id].d[G.np - 3];
function jobSt(i) { if (!G) return 0; if (G.phase === 'over' && G.result) return G.result.tasks[i]; return LD.jobStatus(G, i); }
// tricks won per seat (public)
function tricksWon() { const a = new Array(G.np).fill(0); for (const k of G.tricks) a[k.w]++; return a; }
// the cards a seat has shown with the ping and not yet played
function shownBy(s) { return G.pings.filter(p => p.seat === s && !G.pl[p.c]); }
function seatsClockwise(from) { const o = []; for (let k = 1; k < G.np; k++) o.push((from + k) % G.np); return o; }
function myMoves() { const v = viewSeat(); return v >= 0 && G ? LD.moves(G, v) : []; }
function mvKey(m) { return m ? m.t + ':' + (m.c != null ? m.c : '') + ':' + (m.i != null ? m.i : '') + ':' + (m.n != null ? m.n : '') + ':' + (m.f != null ? m.f : '') + ':' + (m.on != null ? m.on : '') + ':' + (m.dir || '') + ':' + (m.k || '') : ''; }
function canAct() { const v = viewSeat(); return !!G && v >= 0 && !UI.busy && !UI.cards.length && !UI.fz && !isOver() && !(NET.on && NET.role === 'client' && !NET.hostPeer); }
function iMustAct() { const v = viewSeat(); return v >= 0 && G && !isOver() && LD.pending(G).includes(v); }
// the dive label in the bar
function diveLabel() {
  if (UI.mode === 'descent' && G.desc && typeof DESC !== 'undefined') { const Z = DESC[G.desc.zi]; return Z.name + ' · ' + (G.boss ? CHAR[G.boss.id].name : 'dive ' + (G.desc.si + 1) + ' of 3') + (G.desc.tryN > 1 ? ' · try ' + G.desc.tryN : ''); }
  const m = G.mission; if (m.kind === 'log') return 'Dive ' + m.id; if (m.kind === 'deep') return 'Deep dive ' + m.d; return m.name;
}
function toast(t) { const el = $('#toast'); if (!el) return; el.textContent = t; el.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove('on'), 2400); }
function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { } }
function loadPrefs() { try { const p = JSON.parse(lsGet('ld_prefs') || '{}'); Object.assign(UI.prefs, p); if (p.speed != null) AIDELAY = p.speed; } catch (e) { } }
function savePrefs() { lsSet('ld_prefs', JSON.stringify(Object.assign({}, UI.prefs, { speed: AIDELAY }))); }
const wait = ms => ANIM ? new Promise(r => setTimeout(r, ms * (AIDELAY > 0 ? Math.max(.35, AIDELAY / 650) : .35))) : Promise.resolve();
// ---- the logbook: progress saved on this device ----
const Prog = {
  d: null,
  load() { if (this.d) return this.d; let o = null; try { o = JSON.parse(lsGet('ld_prog') || 'null'); } catch (e) { } if (!o || o.v !== 1) o = { v: 1, cur: 1, att: {}, done: {}, flare: {}, deep: { level: D.deep.start, wins: 0, best: 0 }, tries: {} }; this.d = o; return o; },
  save() { lsSet('ld_prog', JSON.stringify(this.d)); },
  // an attempt of a logbook dive ended
  ended(G) {
    const p = this.load(), m = G.mission; if (G.noProg) return;
    if (m.kind === 'log') {
      p.tries[m.id] = (p.tries[m.id] || 0) + 1;
      if (G.distress) p.flare[m.id] = true;
      if (G.result.ok) { const n = (p.tries[m.id] || 1) + (p.flare[m.id] ? 1 : 0); if (!p.done[m.id] || n < p.done[m.id]) p.done[m.id] = n; p.att[m.id] = p.done[m.id]; p.cur = Math.max(p.cur, Math.min(33, m.id + 1)); p.tries[m.id] = 0; }
    } else if (m.kind === 'deep') {
      if (G.result.ok) { p.deep.wins++; p.deep.level = m.d + 1; p.deep.best = Math.max(p.deep.best, m.d); p.deep.flare = p.deep.flare || {}; p.deep.flare[m.d] = !!G.distress; }
    }
    this.save();
  },
  reset() { this.d = null; try { localStorage.removeItem('ld_prog'); } catch (e) { } this.load(); }
};
