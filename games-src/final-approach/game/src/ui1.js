// ===================== part 1: globals, helpers, prefs, text, view model =====================
var ANIM = 1, AIDELAY = 650;
var G = null;
var UI = { started: false, mode: 'vs', cfg: null, seat: 0, holder: -1, sel: -1, cof: 0, pop: null, busy: false, seq: 0, over: null, overShown: false, tm: null, rrm: [false, false, false, false],
  coach: { level: 'full', seen: {}, tip: '' }, prefs: { sound: true, music: true, gfx: 'auto', guide: 'full', diceShow: true }, hint: null, rt: null, lastPlace: null, seats: [0, 1], won: {}, ready: false };
const D = FA.DATA;
const $ = s => /^#[\w-]+$/.test(s) ? document.getElementById(s.slice(1)) : document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// painted art -> blob URLs (images in the DOM) and Image objects (Pixi). Without Blob URLs (jsdom) the DOM falls back to plain CSS.
const ART = {};
(function () {
  try {
    if (typeof FA_ART === 'undefined' || /jsdom/i.test(navigator.userAgent || '') || !window.URL || !URL.createObjectURL || !window.Blob || !window.atob) return;
    for (const k in FA_ART) { const p = FA_ART[k].split(','), mime = (/data:([^;]+)/.exec(p[0]) || [0, 'image/webp'])[1], bin = atob(p[1]), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); ART[k] = URL.createObjectURL(new Blob([u], { type: mime })); }
  } catch (e) { }
})();
function h(sel, at) {
  const m = /^([a-z0-9]*)((?:[.#][\w-]+)*)$/i.exec(sel) || [0, 'div', ''];
  const e = document.createElement(m[1] || 'div');
  const cls = []; (m[2] || '').replace(/([.#])([\w-]+)/g, (_, k, v) => { if (k === '#') e.id = v; else cls.push(v); });
  if (cls.length) e.className = cls.join(' ');
  let i = 2;
  if (at && typeof at === 'object' && !(at instanceof Node) && !Array.isArray(at)) { for (const k in at) { const v = at[k]; if (v == null || v === false) continue; if (k === 'text') e.textContent = v; else if (k === 'html') e.innerHTML = v; else if (k === 'style') e.style.cssText = v; else e.setAttribute(k, v === true ? '' : v); } }
  else i = 1;
  for (; i < arguments.length; i++) add(e, arguments[i]);
  return e;
}
function add(e, k) { if (k == null || k === false) return; if (Array.isArray(k)) k.forEach(x => add(e, x)); else e.appendChild(k instanceof Node ? k : document.createTextNode(String(k))); }
const isPh = () => document.documentElement.classList.contains('ph');
function toast(t) { const e = $('#toast'); if (!e) return; e.textContent = t; e.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => e.classList.remove('on'), 2600); }
// ---------- names, wording ----------
const SEATN = ['Pilot', 'Co-pilot'], SEATC = ['#2f6fd0', '#e8821f'];
const SAYT = { adv0: 'Hold position this round', adv1: 'Move one space', adv2: 'Move two spaces', plane: 'Clear the traffic', level: 'Level the axis', gear: 'Landing gear next', flaps: 'Flaps next', brakes: 'Brakes soon', coffee: 'We need coffee', slow: 'Keep the speed low', fuel: 'Watch the fuel', trainee: 'Train the trainee', first: 'I would like to go first', ok: 'All good here' };
const SLOTG = { axis: 'Axis', engines: 'Engines', radio: 'Radio', gear: 'Landing gear', flaps: 'Flaps', brakes: 'Brakes', conc: 'Concentration', kero: 'Fuel', intern: 'Trainee', ice: 'Icy-runway brakes' };
function slotName(k) { const S = FA.SLOT[k]; return SLOTG[S.grp] + (S.grp === 'gear' || S.grp === 'flaps' || S.grp === 'brakes' ? ' ' + (S.ix + 1) : S.grp === 'ice' ? ' column ' + (S.ix + 1) + (S.row ? ' (lower)' : ' (upper)') : ''); }
function slotNeed(k) { const S = FA.SLOT[k]; if (S.vals) return S.vals.length === 1 ? 'needs a ' + S.vals[0] : 'needs ' + S.vals.join(' or '); return 'any die'; }
const name = s => (G && G.names && G.names[s]) || SEATN[s];
const pname = s => SEATN[s];
// ---------- who sees what ----------
// viewSeat: the seat whose dice are shown face up. 'all' for watching computers, -1 when nobody may look (pass screen, spectators).
function viewSeat() {
  if (!G || !UI.started) return -1;
  if (UI.mode === 'net') return typeof NET !== 'undefined' && NET.mySeat >= 0 ? NET.mySeat : -1;
  if (UI.mode === 'hot') return UI.holder;
  if (UI.mode === 'watch') return 'all';
  return UI.seat;
}
const isHuman = s => !!G && !G.ai[s];
function mayAct(s) {      // may this device make seat s's moves right now?
  if (!G || G.result || !UI.started) return false;
  if (UI.mode === 'net') return typeof NET !== 'undefined' && NET.mySeat === s && !G.ai[s];
  if (UI.mode === 'hot') return !G.ai[s] && UI.holder === s;
  if (UI.mode === 'watch') return false;
  return s === UI.seat && !G.ai[s];
}
const mySeatMoves = () => { const v = viewSeat(); return typeof v === 'number' && v >= 0 && mayAct(v) ? FA.validMoves(G, v) : []; };
function prefs() { try { const p = JSON.parse(localStorage.getItem('fa_prefs') || '{}'); Object.assign(UI.prefs, p.prefs || {}); if (p.speed) AIDELAY = p.speed; UI.won = p.won || {}; } catch (e) { } }
function savePrefs() { try { localStorage.setItem('fa_prefs', JSON.stringify({ prefs: UI.prefs, speed: AIDELAY, won: UI.won })); } catch (e) { } }
function saveGame() { try { if (G && !G.result && UI.mode !== 'net') { localStorage.setItem('fa_save', JSON.stringify({ G, mode: UI.mode, seat: UI.seat, holder: UI.holder, cfg: UI.cfg })); return true; } } catch (e) { } return false; }
function hasSave() { try { return !!localStorage.getItem('fa_save'); } catch (e) { return false; } }
function clearSave() { try { localStorage.removeItem('fa_save'); } catch (e) { } }
// ---------- derived numbers for the panel ----------
const trackOf = () => D.tracks[G.tk];
const scenOf = () => FA.scen(G.sid);
function altRows() { return D.alt[G.alt]; }
function dieFace(v, hidden) { return hidden ? '?' : String(v); }
// legal slots for the selected die with the selected coffee change
function legalSlotsFor(d, c) { return FA.validMoves(G, viewSeat()).filter(m => m.t === 'place' && m.d === d && (m.c || 0) === c).map(m => m.to); }
function pendFor() { const v = viewSeat(); return G && G.pend && typeof v === 'number' ? G.pend : null; }
