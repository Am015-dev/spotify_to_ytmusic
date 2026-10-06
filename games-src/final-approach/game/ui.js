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
const clamp8 = t => { const w = String(t).trim().split(/\s+/); return w.length > 8 ? w.slice(0, 8).join(' ').replace(/[.,:;·]+$/, '') + '…' : String(t); };
function toast(t) { const e = $('#toast'); if (!e) return; t = clamp8(t); e.textContent = t; e.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => e.classList.remove('on'), 2600); }
// ---------- names, wording ----------
const SEATN = ['Pilot', 'Co-pilot'], SEATC = ['#2f6fd0', '#e8821f'];
const SAYT = { adv0: 'Hold position this round', adv1: 'Move one space', adv2: 'Move two spaces', plane: 'Clear the traffic', level: 'Level the axis', gear: 'Landing gear next', flaps: 'Flaps next', brakes: 'Brakes soon', coffee: 'We need coffee', slow: 'Keep the speed low', fuel: 'Watch the fuel', trainee: 'Train the trainee', first: 'I would like to go first', ok: 'All good here' };
const SLOTG = { axis: 'Axis', engines: 'Engines', radio: 'Radio', gear: 'Landing gear', flaps: 'Flaps', brakes: 'Brakes', conc: 'Coffee', kero: 'Fuel', intern: 'Trainee', ice: 'Icy-runway brakes' };
function slotName(k) { const S = FA.SLOT[k]; return SLOTG[S.grp] + (S.grp === 'gear' || S.grp === 'flaps' || S.grp === 'brakes' ? ' ' + (S.ix + 1) : S.grp === 'ice' ? ' column ' + (S.ix + 1) + (S.row ? ' (lower)' : ' (upper)') : ''); }
function slotNeed(k) { const S = FA.SLOT[k]; if (S.vals) return S.vals.length === 1 ? 'needs a ' + S.vals[0] : 'needs ' + S.vals.join(' or '); return 'any die'; }
const name = s => (D.crew[s] && D.crew[s].short) || SEATN[s];   // one short name everywhere in play (tips, log lines, dock, cards); the full name only on the story / crew cards
const fullName = s => (G && G.names && G.names[s]) || D.crew[s].name;
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
// hot-seat: decisions that need nobody's hidden dice (the briefing, placing the public trainee token or cross-check die) are made on the shared
// screen without a pass card; the device is only handed over when the next decision needs a player's own dice.
function hiddenFree() { return !!G && !G.result && (G.phase === 'brief' || !!(G.pend && (G.pend.h === 'intern' || G.pend.h === 'sync'))); }
function sharedSeat() { if (!G || UI.mode !== 'hot' || UI.holder >= 0 || !hiddenFree()) return -1; const p = FA.pending(G).filter(s => !G.ai[s]); return p.length ? p[0] : -1; }
// actSeat: the seat this device acts for now (the viewer, or in hot-seat the seat deciding on the shared screen)
function actSeat() { const v = viewSeat(); if (UI.mode === 'hot' && (typeof v !== 'number' || v < 0)) { const s = sharedSeat(); if (s >= 0) return s; } return v; }
const isHuman = s => !!G && !G.ai[s];
function mayAct(s) {      // may this device make seat s's moves right now?
  if (!G || G.result || !UI.started) return false;
  if (UI.mode === 'net') return typeof NET !== 'undefined' && NET.mySeat === s && !G.ai[s];
  if (UI.mode === 'hot') return !G.ai[s] && (UI.holder === s || (UI.holder < 0 && sharedSeat() === s));
  if (UI.mode === 'watch') return false;
  return s === UI.seat && !G.ai[s];
}
const mySeatMoves = () => { const v = actSeat(); return typeof v === 'number' && v >= 0 && mayAct(v) ? FA.validMoves(G, v) : []; };
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
function legalSlotsFor(d, c) { return FA.validMoves(G, actSeat()).filter(m => m.t === 'place' && m.d === d && (m.c || 0) === c).map(m => m.to); }
function pendFor() { const v = actSeat(); return G && G.pend && typeof v === 'number' ? G.pend : null; }
// ===================== part 2: render the panel (DOM hit layer) and the dock =====================
const PLANE_SVG = '<svg viewBox="0 0 24 24" width="12" height="12"><path d="M12 2l2 7 8 4v2l-8-2-1 6 3 2v1l-4-1-4 1v-1l3-2-1-6-8 2v-2l8-4z" fill="#fff"/></svg>';
function tabText(a) { return a.slice().sort((x, y) => x - y).map(n => n === 0 ? 'C' : (n < 0 ? 'L' : 'R') + Math.abs(n)).join(' '); }
// the 60 s clock of the Against the Clock module: one element in the altitude line (portrait phones) or the HUD (landscape / desktop)
function rtEl() { if (!UI.rt || !G.mods.real || G.result) return null; const s = Math.max(0, Math.ceil(UI.rt.left / 1000)); return h('span.rtleft' + (s <= 10 && G.phase === 'place' ? '.low' : ''), { role: 'timer', 'aria-label': s + ' seconds left this round' }, '⏱ ' + s + ' s'); }
function css(el, r) { el.style.left = r.x + 'px'; el.style.top = r.y + 'px'; el.style.width = r.w + 'px'; el.style.height = r.h + 'px'; return el; }
// the plain look of a die: a number in a rounded square
function dvEl(v, cls) { return h('span.dv' + (cls ? '.' + cls.trim().replace(/ +/g, '.') : ''), String(v)); }
// slot faces: one line icon per control (the name is in the aria-label); gear / flaps / brakes also show the dice values they take
const ICO = {
  axis: '<path d="M12 4v15M7 19h10M4 8l8-2 8 2M4 8l-2.5 6a3.2 3.2 0 0 0 5 0zM20 8l-2.5 6a3.2 3.2 0 0 0 5 0z"/>',
  engines: '<circle cx="12" cy="12" r="1.8"/><path d="M12 10.2C11.5 6 13 3.5 15.5 3.5c.5 3-1 5.5-3.5 6.7zM13.8 12c4.2-.5 6.7 1 6.7 3.5-3 .5-5.500-1-6.700-3.500zM12 13.8c.5 4.200-1 6.700-3.500 6.700-.500-3 1-5.500 3.500-6.700zM10.200 12C6 12.500 3.500 11 3.500 8.500c3-.500 5.500 1 6.700 3.500z"/>',
  radio: '<path d="M12 11v9M9 20h6"/><circle cx="12" cy="9" r="1.6"/><path d="M8.300 5.700a5.200 5.200 0 0 0 0 6.600M15.700 5.700a5.200 5.200 0 0 1 0 6.600M5.400 3a9.200 9.200 0 0 0 0 12M18.600 3a9.200 9.200 0 0 1 0 12"/>',
  gear: '<circle cx="12" cy="15" r="6"/><circle cx="12" cy="15" r="2"/><path d="M12 3v6"/>',
  flaps: '<path d="M2.500 9.500c6-2.500 13-2.500 19-.5l-1 3.500H5z"/><path d="M7 15.500l-2 4.500M13 15.500l-1 5M19 13.500l1.500 5.500"/>',
  brakes: '<circle cx="12" cy="12" r="8.500"/><circle cx="12" cy="12" r="3"/><path d="M12 3.500v3M12 17.500v3M3.500 12h3M17.500 12h3"/>',
  conc: '<path d="M4.500 9h11v6a4 4 0 0 1-4 4h-3a4 4 0 0 1-4-4zM15.500 11h2a2.200 2.200 0 0 1 0 4.400h-2M8 3c0 2 2 2 2 4M12 3c0 2 2 2 2 4"/>',
  kero: '<path d="M12 3c4 5 6.500 8 6.500 11a6.500 6.500 0 0 1-13 0c0-3 2.500-6 6.500-11z"/>',
  intern: '<path d="M12 4l9.500 4.500L12 13 2.500 8.500zM6.500 11v5c3.500 2.500 7.500 2.500 11 0v-5"/>',
  ice: '<path d="M12 3v18M4.200 7.500l15.600 9M19.800 7.500l-15.600 9"/>'
};
const icoEl = grp => h('i.ic', { 'aria-hidden': 'true', html: '<svg viewBox="0 0 24 24">' + (ICO[grp] || '') + '</svg>' });
// mandatory spaces of seat a that are still empty, and how many dice it has left: warn before a missing Axis / Engine die loses the flight
function mandInfo(a) { if (!G || typeof a !== 'number' || a < 0 || G.phase !== 'place' || G.result) return null; const need = ['ax' + a, 'en' + a].filter(k => !G.slots[k]), left = FA.unusedDice(G, a).length; return { need, left, tight: need.length > 0 && left > 0 && left <= need.length, lost: need.length > left }; }
const needNames = need => need.map(k => FA.SLOT[k].grp === 'axis' ? 'Axis' : 'Engines').join(' and ');
const SLOTLAB = k => { const S = FA.SLOT[k]; if (S.grp === 'gear' || S.grp === 'flaps') return S.vals.join('-'); if (S.grp === 'brakes' || S.grp === 'ice') return String(S.vals[0]); return ''; };
function selectedLegal() {
  const v = actSeat(); if (typeof v !== 'number' || v < 0 || !mayAct(v)) return [];
  const p = G.pend;
  if (p && (p.h === 'intern' || p.h === 'sync') && UI.sel === 'p') return FA.validMoves(G, v).filter(m => m.t === 'place' && m.d === 'p' && (m.c || 0) === UI.cof).map(m => m.to);
  if (typeof UI.sel === 'number' && UI.sel >= 0 && !p) return legalSlotsFor(UI.sel, UI.cof);
  return [];
}
function render() {
  if (!G || !UI.started) return;
  const bd = $('#bd'), pz = $('#pz'); if (!bd || !pz) return;
  if (isPh()) applyPhone();
  let W = bd.clientWidth, Hh = bd.clientHeight;
  if ((W < 10 || Hh < 10) && /jsdom/i.test(navigator.userAgent || '')) { const iw = innerWidth || 1100, ih = innerHeight || 700; W = iw < ih ? iw : Math.round(iw * .7); Hh = iw < ih ? Math.round(ih * .55) : ih - 48; }   // no layout engine in jsdom: pretend the board has a plausible size
  if (W < 10 || Hh < 10) return;
  const v = viewSeat(), me = typeof v === 'number' ? v : -1, act = actSeat();
  feedTick();
  const pos = dispPos();
  const LY = UI.LY = FA.layout(W, Hh, { mods: G.mods, me }); UI.W = W;
  resultFx(LY.r);
  const legal = selectedLegal(), r = LY.r, rows = altRows(), tr = trackOf(), size = tr.sp.length;
  pz.innerHTML = '';
  const dieSz = Math.max(30, Math.min(LY.k * 72, 80));
  // ---- approach window
  { const w = css(h('div.w.appr', { 'aria-label': 'Approach track' }, h('span.tl', 'Approach')), r.appr), cw = Math.max(Math.min((r.appr.w - 4) / size, 130), 46), tot = cw * size;
    const strip = h('div.strip', { style: 'position:absolute;left:0;top:0;bottom:0;width:' + tot + 'px;transition:transform .5s ease' });
    const off = tot <= r.appr.w - 4 ? (r.appr.w - 4 - tot) / 2 : -Math.max(0, Math.min(tot - r.appr.w, (pos - 1.4) * cw)); strip.style.transform = 'translateX(' + Math.round(off) + 'px)'; UI.stripOff = off; UI.cw = cw; UI.stripCalc = { tot, aw: r.appr.w, cw };
    for (let i = 0; i < size; i++) {
      const s = tr.sp[i], n = G.planes[i], b = h('button.sp' + (i + 1 === pos ? '.you' : '') + (i === size - 1 ? '.air' : ''), { type: 'button', 'data-a': 'space', 'data-i': i, style: 'left:' + i * cw + 'px;width:' + cw + 'px', 'aria-label': 'Space ' + (i + 1) + (i === size - 1 ? ' (airport)' : '') + ', ' + n + ' plane' + (n === 1 ? '' : 's') + (s[1] ? ', traffic die x' + s[1] : '') + (s[2] ? ', corridor ' + tabText(s[2]) : '') + (i + 1 === pos ? ', your plane is here' : '') });
      const pls = h('div.pls'); for (let k = 0; k < n; k++) pls.appendChild(h('i.pl', { html: PLANE_SVG }));
      // badges on top of the space (traffic-die icons, corridor tab), planes in the middle, the number at the bottom: nothing sits on a plane token
      if (s[2] && G.mods.tabs) b.appendChild(h('div.bdg', h('i.tb', tabText(s[2]))));
      b.append(pls, h('div.bot', h('span.nm', i === size - 1 ? 'Airport' : String(i + 1)), s[1] ? h('i.tf', { 'data-n': s[1], title: 'Traffic die: ' + s[1] + ' roll' + (s[1] > 1 ? 's' : '') + ' when a round starts here' }, h('i.tfd', '⚄'), s[1] > 1 ? h('b', '×' + s[1]) : null) : null)); strip.appendChild(b);
    }
    w.appendChild(strip); pz.appendChild(w);
  }
  // ---- altitude window: who places first is shown by colour and name (blue Pilot, orange Co-pilot), a purple dot = a reroll token comes aboard
  { const w = css(h('div.w.altw', { 'aria-label': 'Altitude track: ' + rows.slice(G.row0).map((R, i) => R[0] + ' ft, ' + name(R[1]) + ' first' + (R[2] ? ', reroll token' : '') + (i === G.round ? ' (now)' : '')).join('; '), 'data-a': 'altinfo' }, h('span.tl', 'Altitude')), r.alt), n = rows.length - G.row0;
    const fw = who;
    if (isPh() && LY.mode === 'P') {
      const R = rows[G.round + G.row0];
      w.classList.add('altc');
      const tm = rtEl();
      w.appendChild(h('div.altnow', h('b', R[0] + ' ft'), tm, h('span.fp.' + (R[1] ? 'c' : 'p'), fw(R[1]) + ' first')));
      // one dot per round: colour and letter (P = Pilot, C = Co-pilot) say who places first, so colour is never the only cue
      const dots = h('div.altdots', { title: 'Round ' + (G.round + 1) + ' of ' + n }); for (let i = 0; i < n; i++) { const Q = rows[i + G.row0]; dots.appendChild(h('i.ad.' + (Q[1] ? 'c' : 'p') + (i === G.round ? '.cur' : i < G.round ? '.past' : '') + (Q[2] ? '.rr' : ''), Q[1] ? 'C' : 'P')); } w.appendChild(dots);
    } else {
      const cw = r.alt.w / n;
      for (let i = 0; i < n; i++) { const R = rows[i + G.row0]; const el = h('div.ar' + (i === G.round ? '.cur' : (i < G.round ? '.past' : '')), { style: 'left:' + i * cw + 'px;width:' + cw + 'px;top:' + (isPh() ? 3 : 12) + 'px;bottom:0' }, h('span', String(R[0]), h('u', ' ft'), R[2] ? h('i.rr', { title: 'reroll token' }) : null), h('small', h('i.fpd.' + (R[1] ? 'c' : 'p')), h('span.fp.' + (R[1] ? 'c' : 'p'), fw(R[1])))); w.appendChild(el); }
    }
    pz.appendChild(w); }
  // ---- slots
  const mi = mayAct(act) ? mandInfo(act) : null, just = UI.just && UI.just.until > Date.now() ? UI.just.k : null, dead = UI.dead = deadlySlots(act, legal);
  for (const k of G.keys) {
    const S = FA.SLOT[k], q = r[k]; if (!q) continue; const d = G.slots[k];
    const isNeed = mi && mi.need.includes(k), dim = mi && mi.tight && legal.includes(k) && !isNeed;
    const cls = 'slot ' + (S.s === 0 ? 'p' : S.s === 1 ? 'c' : 'n') + (d ? ' full' : '') + (legal.includes(k) ? ' legal' : '') + (dim ? ' dim' : '') + (isNeed && mi.left <= mi.need.length + 1 ? ' need' : '') + (just === k ? ' just' : '') + (dead[k] ? ' deadly' : '');
    const b = css(h('button.' + cls.replace(/ /g, '.'), { type: 'button', 'data-a': 'slot', 'data-slot': k, 'aria-label': slotName(k) + (dead[k] ? ' (this die here ends the flight)' : '') + ', ' + (d ? 'holds a ' + d.v : slotNeed(k) + (S.s === 0 ? ', pilot' : S.s === 1 ? ', co-pilot' : ', either crew')) }), q);
    b.style.setProperty('--u', Math.round(q.w) + 'px');
    if (d) b.appendChild(dvEl(d.v, d.k === 'i' ? 't' : d.k === 'x' ? 'k' : (d.s === 0 ? 'b' : 'o'))); else { const lab = SLOTLAB(k); b.classList.add(lab ? 'hasv' : 'nov'); b.appendChild(h('span.r1', (S.s === 0 || S.s === 1) ? h('i.seat.' + (S.s ? 'c' : 'p'), { 'aria-hidden': 'true' }, S.s ? 'C' : 'P') : null, icoEl(S.grp))); if (lab) b.appendChild(h('span.sl', lab)); }
    const swOn = S.grp === 'gear' && G.pl.sw.lg[S.ix] || S.grp === 'flaps' && G.pl.sw.fl[S.ix] || S.grp === 'brakes' && G.pl.sw.br[S.ix];
    if (swOn) { b.appendChild(h('i.sw.on')); if (!d) { b.classList.add('done'); b.appendChild(h('i.dn', { 'aria-hidden': 'true' }, '✓')); b.setAttribute('aria-label', b.getAttribute('aria-label') + ', done'); } } else if (['gear', 'flaps', 'brakes'].includes(S.grp)) b.appendChild(h('i.sw'));
    pz.appendChild(b);
  }
  // ---- dial, gauge, brake readout
  { const a = G.pl.axis, dl = h('div.dial.axd', { 'aria-label': 'Axis: ' + (a === 0 ? 'level' : Math.abs(a) + ' toward the ' + (a < 0 ? 'pilot' : 'co-pilot')) }, h('i', { style: 'transform:rotate(' + (a * 24) + 'deg)' + (UI.axA && Date.now() - UI.axA.t0 < 900 ? ';animation:axtilt .9s cubic-bezier(.3,1.5,.5,1) both;animation-delay:-' + (Date.now() - UI.axA.t0) + 'ms;--af:' + (UI.axA.from * 24) + 'deg;--at:' + (UI.axA.to * 24) + 'deg' : '') }), h('span', { style: 'position:relative;margin-top:44%' }, a === 0 ? 'level' : Math.abs(a) + (a < 0 ? ' left' : ' right'), a !== 0 ? h('small.spn', 'spin at 3') : null));
    pz.appendChild(css(dl, r.dial));
    // speed gauge: the blue marker (up to it the plane stays) and the orange marker (up to it one space, above it two) in their own corners, clear of the needles
    pz.appendChild(css(h('div.gau', { 'data-b': G.pl.aeroB, 'data-o': G.pl.aeroO, 'data-s': UI.gSpd || 0, 'aria-label': 'Speed gauge: engine sum up to ' + G.pl.aeroB + ' stays, up to ' + G.pl.aeroO + ' moves one space, more moves two' + (G.speed >= 0 ? '; last speed ' + G.speed : '') }, h('span.mk.b', { title: 'Blue marker: a sum up to this stays put' }, '≤' + G.pl.aeroB), h('span.mk.o', { title: 'Orange marker: up to this moves 1, above moves 2' }, '≤' + G.pl.aeroO)), r.gauge));
    const bv = FA.brakeVal(G);
    if (r.brk) pz.appendChild(css(h('div.badge.brk', { 'aria-label': 'Brake value ' + bv + ': the last-round speed must be no more than this' }, h('span', 'Brakes'), h('b', String(bv))), r.brk));
  }
  // ---- coffee, rerolls
  { const cf = h('div.chipr'); for (let i = 0; i < 3; i++) cf.appendChild(h('i.tk.cf' + (i < G.coffee ? '' : '.off'))); pz.appendChild(css(cf, r.coffee));
    pz.appendChild(css(h('div.badge.rrb', { 'aria-label': G.rrHand + ' reroll tokens' }, h('i.tk.rr'), h('b', '×' + G.rrHand)), r.rerolls)); }
  if (G.mods.fuel && r.fuel) { const f = Math.max(0, Math.min(1, G.pl.kero / D.keroStart)); pz.appendChild(css(h('div.bar', { 'aria-label': 'Fuel ' + G.pl.kero }, h('i', { style: 'width:' + f * 100 + '%' }), h('span', 'Fuel ' + G.pl.kero)), r.fuel)); }
  if (G.mods.wind && r.wind) pz.appendChild(css(h('div.dial.wnd', { style: 'background:#3e8fd8', 'aria-label': 'Wind ' + FA.windMod(G) }, h('span', 'Wind ' + (FA.windMod(G) >= 0 ? '+' : '') + FA.windMod(G))), r.wind));
  if (G.mods.intern && r.tokens) { const t = h('div.tokrow', { 'aria-label': 'Trainee tokens left: ' + G.intern.join(', ') }); G.intern.forEach(x => t.appendChild(h('i.ch', String(x)))); pz.appendChild(css(t, r.tokens)); }
  // ---- trays
  for (const s of [0, 1]) {
    const q = s === 0 ? r.trayP : r.trayC, show = v === 'all' || v === s, nd = 4, gap = 6, ds = Math.min(80, (q.w - 12 - gap * (nd - 1)) / nd, q.h - 8);
    const tr2 = css(h('div.tray.' + (s === 0 ? 'p' : 'c'), { 'aria-label': pname(s) + "'s dice" + (show ? '' : ' (hidden behind the screen)') }, h('span.who', pname(s))), q);
    const rrmode = G.pend && G.pend.h === 'rr' && me === s && mayAct(s) && !G.pend.d.m[s];
    for (let i = 0; i < 4; i++) {
      const d = G.dice[s][i], used = d.u || G.phase !== 'place', sel = UI.sel === i && me === s, cv = sel && UI.cof ? d.v + UI.cof : d.v;   // coffee changes the face shown
      const b = h('button.die' + (used ? '.used' : '') + (show && !used && mayAct(s) ? '' : '.cover') + (sel ? '.sel' : '') + (show && !used && !sel && mayAct(s) && !G.result && FA.pending(G).includes(s) && G.phase === 'place' && (!G.pend || G.pend.h === 'rr') ? '.can' : '') + (rrmode && UI.rrm[i] ? '.rrm' : ''), { type: 'button', 'data-a': 'die', 'data-s': s, 'data-d': i, style: 'width:' + ds + 'px;height:' + ds + 'px', 'aria-label': used ? 'used' : (show ? pname(s) + ' die showing ' + cv + (cv !== d.v ? ' (with coffee, rolled ' + d.v + ')' : '') : pname(s) + ' die, hidden'), disabled: (used || !(show && mayAct(s))) ? true : null });
      b.appendChild(dvEl(show ? cv : '?', (s === 0 ? 'b' : 'o') + (show ? '' : ' q') + (show && cv !== d.v ? ' cof' : ''))); tr2.appendChild(b);
    }
    if (G.pend && (G.pend.h === 'intern' && G.pend.d.seat === s || G.pend.h === 'sync' && s === 1) && (show || sharedSeat() === s)) { const val = G.pend.d.val + (UI.sel === 'p' && G.pend.h === 'sync' ? UI.cof : 0); tr2.appendChild(h('button.die' + (UI.sel === 'p' ? '.sel' : ''), { type: 'button', 'data-a': 'die', 'data-s': s, 'data-d': 'p', style: 'width:' + ds + 'px;height:' + ds + 'px', 'aria-label': (G.pend.h === 'intern' ? 'Trainee token ' : 'Traffic die ') + val }, dvEl(val, (G.pend.h === 'intern' ? 't' : 'k') + (val !== G.pend.d.val ? ' cof' : '')))); }
    pz.appendChild(tr2);
  }
  // ---- hud
  if (r.hud) { const row = rows[G.round + G.row0]; pz.appendChild(css(h('div.hudc', h('b', 'Round ' + (G.round + 1) + ' of ' + (D.rounds - G.row0) + (isPh() ? '' : ' · ' + row[0] + ' ft')), (tm => isPh() && tm ? tm : [h('span', G.result ? 'Flight over' : G.phase === 'brief' ? 'Briefing' : (G.pend ? pendLabel() : (G.turn === 0 ? 'Pilot' : 'Co-pilot') + ' places')), tm])(rtEl())), r.hud)); }   // phones: two short lines, the clock replaces the turn line (the prompt says whose turn it is)
  renderDock(); renderBar(); phPost();
  if (typeof pxSync === 'function') pxSync();
  if (typeof netRenderHook === 'function') netRenderHook();
}
function pendLabel() { const p = G.pend; return p.h === 'rr' ? 'Reroll: choose dice' : p.h === 'intern' ? 'Trainee token' : p.h === 'sync' ? 'Cross-check die' : 'Hand-over'; }
// ---------- what just happened: a short line per move in the dock (the partner's placements included), a slot flash, the plane held back while the speed
// is announced, and a recap card at the end of each round. Built from the public log, so it works the same online.
const who = s => UI.mode !== 'hot' && UI.mode !== 'watch' && s === actSeat() ? 'You' : name(s);   // hot-seat and watch: two people (or none) read the screen, so always names
function feedText(t) { t = plainLog(t); return t.replace(/^(Co-pilot|Pilot) (puts|has|flips|spends)/, (m, r, v) => who(r === 'Pilot' ? 0 : 1) + ' ' + (who(r === 'Pilot' ? 0 : 1) === 'You' && v === 'puts' ? 'put' : who(r === 'Pilot' ? 0 : 1) === 'You' && v === 'has' ? 'have' : who(r === 'Pilot' ? 0 : 1) === 'You' && v === 'flips' ? 'flip' : who(r === 'Pilot' ? 0 : 1) === 'You' && v === 'spends' ? 'spend' : v)).replace(/ \((pilot|co-pilot)\)/, ''); }
// the engine's log lines in plain words for the screen (the log itself stays the same, tests and online peers read it)
function plainLog(t) {
  return t.replace(/level dice, no change \(now level\)/, 'equal dice, still level').replace(/level dice, no change \(now (\d) (left|right)\)/, 'equal dice, the tilt stays at $1 $2')
    .replace(/\(coffee ([+-])(\d)\)/, (m, sg, n) => '(' + n + ' shared coffee token' + (n > 1 ? 's' : '') + ' spent: ' + (sg === '+' ? 'up' : 'down') + ' ' + n + ')')
    .replace(/ on concentration/, ' on Coffee').replace(/^Concentration: a coffee token\./, 'Coffee space: +1 coffee token for later.').replace(/^Concentration:/, 'Coffee space:')
    .replace(/Blue marker at (\d+)\./, 'Blue marker now $1: a sum up to $1 now stays put.').replace(/Orange marker at (\d+)\./, 'Orange marker now $1: two spaces now need more than $1.');
}
const RECAP_RE = /^(Pilot spends a reroll|Co-pilot spends a reroll|Axis:|Speed |Landing speed|Radio: a plane|Landing gear|Flaps \d|Brakes:|Fuel|Nobody used|Icy runway|Concentration: a coffee|Wind dial|Cross-check|Hand-Over|The trainee|Twin Thrust|Steady Hands|A reroll token is spent)/;
function feedTick() {
  if (!G) return; const now = Date.now();
  if (UI.feedG !== G.sid + ':' + G.seed + ':' + (UI.mode || '') || UI.feedN == null || G.logN < UI.feedN) { UI.feedG = G.sid + ':' + G.seed + ':' + (UI.mode || ''); UI.feedN = G.logN; UI.feed = []; UI.lastPos = G.pl.pos; UI.lastRound = G.round; UI.prevSlots = Object.keys(G.slots); UI.hold = null; UI.just = null; hideRecap(); return; }
  if (G.logN > UI.feedN) {
    const fresh = G.log.filter(l => l.i > UI.feedN && !/^(Briefing for|Round \d+ of)/.test(l.t)); UI.feedN = G.logN;
    if (fresh.length) { UI.feed = fresh.slice(-3).map(l => feedText(l.t)); UI.feedK = (UI.feedK || 0) + 1; }
  }
  if (G.round === UI.lastRound) {
    const ks = Object.keys(G.slots), nk = ks.filter(k => !(UI.prevSlots || []).includes(k));
    for (const k of nk) if (G.slots[k].s !== actSeat()) UI.just = { k, until: now + 1800 };   // the flash is a one-shot CSS animation: no extra render needed
    UI.prevSlots = ks;
    if (G.pl.pos !== UI.lastPos && ANIM && !G.result) { UI.hold = { pos: UI.lastPos, until: now + 1100 }; clearTimeout(UI.holdT); UI.holdT = setTimeout(releaseHold, 1150); }
  } else {
    if (!G.result && ANIM) {
      const cl = G.log.filter(l => l.r === UI.lastRound + 1 && /^Concentration: a coffee/.test(l.t)).length;
      if (G.pl.pos !== UI.lastPos) { UI.hold = { pos: UI.lastPos, until: now + 800 }; clearTimeout(UI.holdT); UI.holdT = setTimeout(releaseHold, 850); }
      showRecap(UI.lastRound, { axis: UI.lastAxis != null ? UI.lastAxis : G.pl.axis, pos: UI.lastPos, coffee: UI.lastCoffee != null ? UI.lastCoffee : G.coffee, coffeeLines: cl, planes: UI.lastPlanes != null ? UI.lastPlanes : 0, slots: UI.prevSlots || [] });
    }
    UI.prevSlots = Object.keys(G.slots); if (!(G.pl.pos !== UI.lastPos && ANIM && !G.result)) UI.hold = null;
  }
  UI.lastPos = G.pl.pos; UI.lastRound = G.round; UI.lastAxis = G.pl.axis; UI.lastCoffee = G.coffee; UI.lastPlanes = FA.planesOnTrack(G);
  if (G.phase === 'place' && UI.recapR != null && UI.recapR < G.round) hideRecap();
}
// after the speed was announced the plane moves on: only the strip and the plane marker change (no full re-render, so buttons the player is about to tap stay put)
function releaseHold() {
  UI.hold = null; if (!G || !UI.started) return; const st = $('#pz .strip'), c = UI.stripCalc; if (!st || !c) return;
  const off = c.tot <= c.aw - 4 ? (c.aw - 4 - c.tot) / 2 : -Math.max(0, Math.min(c.tot - c.aw, (G.pl.pos - 1.4) * c.cw)); st.style.transform = 'translateX(' + Math.round(off) + 'px)'; UI.stripOff = off;
  $$('#pz .sp.you').forEach(e => e.classList.remove('you')); const e = document.querySelector('#pz .sp[data-i="' + (G.pl.pos - 1) + '"]'); if (e) e.classList.add('you');
  if (typeof pxSync === 'function') setTimeout(pxSync, 520);   // after the strip slid
}
function dispPos() { return UI.hold && UI.hold.until > Date.now() ? UI.hold.pos : G.pl.pos; }
// the round summary is not a card any more: the board shows it (axis tilts, plane flies, coffee pops) and one short line follows (roundFx in ui8.js)
function showRecap(r, info) { roundFx(r, info || {}); }
function hideRecap() { const el = $('#recap'); if (el) { el.hidden = true; el.innerHTML = ''; } UI.recapR = null; clearTimeout(UI.recapT); }
// ---------- the dock: what to do now ----------
function promptText() { return phPrompt(); }
function renderDock() {
  const v = actSeat(), pr = promptText(), mine = typeof v === 'number' && v >= 0 && mayAct(v) && FA.pending(G).includes(v);
  const p = $('#prompt'); if (p) { p.textContent = pr; p.className = mine ? 'mine' : ''; } const bp = $('#barprompt'); if (bp) { bp.textContent = pr; }
  // what just happened
  const fd = $('#feed'); if (fd) { const k = String(UI.feedK || 0) + (UI.coach && UI.coach.tip ? 't' : '') + (UI.sel != null && UI.sel !== -1 ? 's' : ''); if (fd.dataset.k !== k || !UI.feed || !UI.feed.length) { fd.innerHTML = ''; fd.dataset.k = k; fd.hidden = !(UI.feed && UI.feed.length) || !!G.result || !!(UI.coach && UI.coach.tip) || (UI.sel != null && UI.sel !== -1); if (UI.feed) for (const t of UI.feed) fd.appendChild(h('div.fl', t)); fd.classList.remove('anim'); void fd.offsetWidth; if (ANIM) fd.classList.add('anim'); } }
  // roadmap
  const rt = $('#rt'); if (rt) { rt.innerHTML = ''; const n = D.rounds - G.row0; for (let i = 0; i < n; i++) rt.appendChild(h('span.rd' + (i === G.round ? '.cur' : (i < G.round ? '.done' : '')), { 'aria-label': 'Round ' + (i + 1) }, String(i + 1))); rt.appendChild(h('span', G.phase === 'brief' ? 'Briefing' : G.result ? 'Done' : 'Placing dice')); }
  // briefing phrases
  const sy = $('#says'); if (sy) { sy.innerHTML = ''; if (G.phase !== 'brief') UI.sayAll = false; if (G.phase === 'brief') {
    if (isPh() && document.documentElement.classList.contains('ph-p')) sy.appendChild(h('p.srule', 'After the roll: silence. Your placed dice do the talking.' + (G.ai[1 - (typeof v === 'number' && v >= 0 ? v : 0)] ? ' ' + name(1 - (typeof v === 'number' && v >= 0 ? v : 0)) + ' (computer) goes by the panel, not by phrases.' : '')));
    for (const s of [0, 1]) for (const c of G.say[s]) sy.appendChild(h('span.sbub.' + (s ? 'c' : 'p'), (who(s) === 'You' ? 'You said' : name(s) + ' says') + ': “' + SAYT[c] + '”'));   // what was said first, so a tapped phrase never just vanishes
    // the phrases that fit this round first (the same advice the computer crew would give), at most four unless "More phrases" is open
    if (typeof v === 'number' && v >= 0 && mayAct(v)) { const mv = FA.validMoves(G, v).filter(m => m.t === 'say').map(m => m.c); let top = []; try { top = FA.AI.say(G, v).filter(c => mv.includes(c)); } catch (e) { }
      const all = top.concat(mv.filter(c => !top.includes(c))), show = UI.sayAll ? all : all.slice(0, !isPh() ? 4 : document.documentElement.classList.contains('ph-p') ? 3 : 1);
      for (const c of show) sy.appendChild(h('button.say' + (top.includes(c) ? '.rec' : ''), { type: 'button', 'data-a': 'say', 'data-c': c }, SAYT[c]));
      if (all.length > show.length) sy.appendChild(h('button.say.more', { type: 'button', 'data-a': 'saymore' }, 'More phrases…'));
    } } }
  // roster (+ the landing checklist button on phones)
  const ro = $('#roster'); if (ro) { ro.innerHTML = ''; for (const s of [0, 1]) { const st = G.result ? (G.result.win ? 'landed' : 'flight over') : G.phase === 'brief' ? (G.ready[s] ? 'ready' : 'briefing') : (FA.pending(G).includes(s) ? 'deciding' : 'waiting'); ro.appendChild(h('div.chip.' + (s ? 'c' : 'p') + (v === s ? '.me' : '') + (st === 'deciding' || st === 'briefing' ? '.wt' : '') + (st === 'ready' ? '.rdy' : ''), h('span.cav', ART['crew-' + s] ? h('img', { src: ART['crew-' + s], alt: '' }) : ''), h('span.ct', h('b', name(s)), h('i', pname(s) + (G.ai[s] ? ' (computer)' : '') + ' · ' + FA.unusedDice(G, s).length + ' dice · ' + st)))); }
  }
  // the goal: the route and the landing conditions, always on screen (tap for the full checklist)
  const gl = $('#goal'); if (gl) { gl.innerHTML = ''; gl.hidden = !!G.result; if (!G.result) gl.appendChild(goalEl()); }
  // selected die: only the coffee stepper (no advice text; the board glows, the status line says what to do)
  const si = $('#selinfo'); if (si) { si.innerHTML = ''; si.className = 'idle'; si.hidden = true;
    if (typeof v === 'number' && v >= 0 && mayAct(v) && !G.result && G.phase === 'place') {
      const sel = UI.sel, pend = G.pend;
      if ((sel === 'p' || (typeof sel === 'number' && sel >= 0 && !pend)) && (sel !== 'p' || pend.h === 'sync') && G.coffee > 0) {
        si.className = ''; si.hidden = false; const val = sel === 'p' ? pend.d.val : G.dice[v][sel].v, lo = -Math.min(G.coffee, val - 1), hi = Math.min(G.coffee, 6 - val);
        si.append(h('div.cof', h('span.lab', { 'aria-label': G.coffee + ' coffee tokens', title: 'Coffee tokens' }, '☕' + G.coffee), h('button.chipb', { type: 'button', 'data-a': 'cof', 'data-c': Math.max(lo, UI.cof - 1), disabled: UI.cof <= lo ? true : null, 'aria-label': 'One less' }, '−'), h('span.cv', String(val + UI.cof)), h('button.chipb', { type: 'button', 'data-a': 'cof', 'data-c': Math.min(hi, UI.cof + 1), disabled: UI.cof >= hi ? true : null, 'aria-label': 'One more' }, '+')));
      }
    }
  }
  // actions
  const ac = $('#acts'); if (ac) { ac.innerHTML = ''; ac.appendChild(actions(v));
  }
  renderCheat(); fitDock();
}
const shortPh = () => isPh() && document.documentElement.classList.contains('ph-p') && !!window.matchMedia && matchMedia('(max-height:620px)').matches;
function fitDock() {
  const R = document.documentElement; R.classList.toggle('fabrief', G.phase === 'brief' && !G.result); R.classList.toggle('faover', !!G.result && !UI.rsOpen);
  const sel = UI.sel != null && UI.sel !== -1 && !G.result;
  R.classList.remove('selx', 'selc', 'selt'); if (!isPh() || !sel || !UI.LY) return;
  if (!R.classList.contains('ph-p')) { R.classList.add('selc'); return; }   // landscape rail: compact only, the board keeps its size
  // a die is chosen: first drop the roster and the feed from the dock; only if the die card still does not fit, the dock grows over the tray
  R.classList.add('selc'); const b = $('#dockbody'); if (!b || b.scrollHeight <= b.clientHeight + 1) return;
  const LY = UI.LY, r = LY.r, bh = (UI.LY.H || 0), top = Math.min(r.trayP.y, r.trayC.y);
  const need = b.scrollHeight - b.clientHeight + 6;   // grow only as much as needed, at most over the whole tray
  R.style.setProperty('--selx', Math.max(0, Math.round(Math.min(need, bh - top + 2))) + 'px'); R.classList.add('selx');
  if (b.scrollHeight > b.clientHeight + 1 && UI.coach && UI.coach.tip) {   // still too tall with a tip up: the tip comes first, the die card after Got it
    R.classList.add('selt'); R.classList.remove('selx'); if (b.scrollHeight > b.clientHeight + 1) { R.style.setProperty('--selx', Math.round(Math.min(b.scrollHeight - b.clientHeight + 6, bh - top + 2)) + 'px'); R.classList.add('selx'); } }
}
// who spent the reroll token that is being answered now
function rrBy(v) { const by = G.pend && G.pend.d ? G.pend.d.by : null; return by == null ? 'A reroll token was spent.' : by === v && who(v) === 'You' ? 'You spent a reroll token.' : name(by) + ' spent a reroll token.'; }
// the route and the landing conditions as one tappable strip at the top of the dock
function goalEl() { return goalStrip(); }
function goalFull() {
  const size = trackOf().sp.length, pos = G.pl.pos, left = FA.planesOnTrack(G), ax = G.pl.axis, bv = FA.brakeVal(G), last = D.rounds - G.row0;
  const gs = G.pl.sw.lg.reduce((a, x) => a + x, 0), fs = G.pl.sw.fl.reduce((a, x) => a + x, 0), fin = FA.isFinal(G);
  const moves = last - 1 - G.round - (G.slots.en0 && G.slots.en1 ? 1 : 0);   // rounds in which the engines can still move the plane (not the landing round)
  const need = size - pos, route = fin ? 'Landing now: the plane stays put, speed must be ≤ brakes' : pos >= size ? 'At the airport: hold here (engine sum ≤ ' + G.pl.aeroB + ') until round ' + last : need + ' space' + (need > 1 ? 's' : '') + ' to the airport, ' + Math.max(0, moves) + ' round' + (moves === 1 ? '' : 's') + ' left to fly there' + (need > 2 * Math.max(0, moves) ? ' (too far!)' : need > Math.max(0, moves) ? ' (some 2-space moves needed)' : '');
  const c = (ok, t, warn) => h('span.c' + (ok ? '.ok' : warn ? '.bad' : ''), t + (ok ? ' ✓' : ''));
  const chips = [c(left === 0, left === 0 ? 'No planes' : left + ' plane' + (left > 1 ? 's' : '') + ' to clear'), c(gs === 3, 'Gear ' + gs + '/3'), c(fs === 4, 'Flaps ' + fs + '/4'),
    c(ax === 0, ax === 0 ? 'Level' : 'Tilt ' + Math.abs(ax) + (ax < 0 ? ' left' : ' right') + ': level it to land, 3 = spin', Math.abs(ax) >= 2), c(false, 'Brakes ' + bv, fin && bv < 2)];
  if (G.mods.intern) chips.push(c(G.intern.length === 0, 'Trainee ' + (6 - G.intern.length) + '/6')); if (G.mods.ice) chips.push(c(G.pl.ice === 4, 'Ice ' + G.pl.ice + '/4'));
  if (G.mods.fuel || G.mods.leak) chips.push(c(false, 'Fuel ' + G.pl.kero, G.pl.kero < 8));
  // the one trap that kills most new crews: a plane on your own space when the engines are about to move you
  const here = !fin && pos <= size && G.planes[pos - 1] > 0 && !(G.slots.en0 && G.slots.en1) ? 'A plane is on your space: radio it away (a 1 on a Radio) before both engine dice are down, or keep the engine sum ≤ ' + G.pl.aeroB + ' so you stay put.' : '';
  const late = behind();
  return h('button.goalb' + (UI.ckOpen ? '.on' : ''), { type: 'button', 'data-a': 'ckopen', 'aria-expanded': UI.ckOpen ? 'true' : 'false', 'aria-label': 'Goal: be on the airport when round ' + last + ' starts. ' + route + '. To land at the end of round ' + last + ': ' + chips.map(x => x.textContent).join(', ') + '. Tap for the full checklist.' },
    h('span.gr', h('b', fin ? 'Round ' + last + ' · ' : 'Be at the airport by round ' + last + ' · '), route), h('span.grs', h('b', fin ? 'Landing round' : 'Airport by round ' + last), fin ? '' : ': ' + (pos >= size ? 'there, hold' : (size - pos) + ' spaces, ' + Math.max(0, moves) + ' rounds')), h('span.gc', ...chips), here || late ? h('span.dg', '⚠ ' + (here || late)) : null);
}
// gear / flaps that can no longer wait: each needs its own die, gear and flaps take only certain values, flaps strictly in order
function behind() {
  if (G.result || FA.isFinal(G)) return ''; const rl = D.rounds - G.row0 - G.round, fl = G.pl.sw.fl.indexOf(0), gl = G.pl.sw.lg.filter(x => !x).length, fLeft = fl < 0 ? 0 : 4 - fl;
  const FV = ['1-2', '2-3', '4-5', '5-6'], out = [];
  if (fLeft && fLeft >= rl - 1) out.push('Flaps ' + (4 - fLeft) + '/4 with ' + rl + ' rounds left: ' + (UI.seat === 1 && UI.mode !== 'hot' ? 'you need' : name(1) + ' needs') + ' a ' + FV[fl] + ' for the next flap (they go in order). Coffee tokens can bend a die into range.');
  if (gl && gl >= rl - 1) out.push('Gear ' + (3 - gl) + '/3 with ' + rl + ' rounds left: ' + (UI.seat === 0 && UI.mode !== 'hot' ? 'you need' : name(0) + ' needs') + ' the missing gear values (1-2, 3-4, 5-6).');
  return out.join(' ');
}
// placing this die here ends the flight at once (collision, overshoot, spin, too fast, missing Axis/Engines): try it on a copy of the public state
function lossIf(v, m) {
  try { const S = FA.cloneLite(G); if (FA.performMove(S, m, v, true).ok && S.result && !S.result.win) return S.result; } catch (e) { }
  return null;
}
function deadlySlots(v, legal) {
  const o = {}; if (!legal.length || typeof v !== 'number' || v < 0 || G.result) return o;
  for (const k of legal) { const R = lossIf(v, { t: 'place', d: UI.sel, to: k, c: UI.cof }); if (R) o[k] = 'this ends the flight. ' + (R.msg || '') + ' Tap it twice if you really mean it.'; }
  return o;
}
// one line saying what the selected die would do on the mandatory spaces
function effectLine(v, val) {
  const o = 1 - v, ax = G.slots['ax' + o], en = G.slots['en' + o];
  const parts = [], last = FA.isFinal(G);
  // the last round: the plane does not move, the engine sum is the landing speed and must be no more than the brakes
  if (last && !G.slots['en' + v]) { const bv = FA.brakeVal(G), wm = FA.windMod(G); parts.push('Landing speed: ' + val + (en ? ' + ' + en.v + (wm ? ' + wind ' + wm : '') + ' = ' + (val + en.v + wm) + (val + en.v + wm <= bv ? ', within' : ', above') + ' the brakes ' + bv : ' + ?' + (wm ? ' + wind ' + wm : '') + ' must be no more than the brakes ' + bv)); }
  else if (!G.slots['en' + v]) { const sm = en ? val + en.v + FA.windMod(G) : 0, adv = sm <= G.pl.aeroB ? 0 : sm <= G.pl.aeroO ? 1 : 2;
    parts.push('Engines: ' + val + (en ? ' + ' + en.v + ' = ' + sm + (FA.windMod(G) ? ' with wind' : '') + ': the plane ' + (adv ? 'moves ' + adv + ' space' + (adv > 1 ? 's' : '') + ' right away' : 'stays put') : ' + ' + name(o) + ': ≤' + G.pl.aeroB + ' stays, ≤' + G.pl.aeroO + ' moves 1, more moves 2')); }
  if (legalHas(v, val, 'radio')) { const at = G.pl.pos + val - 1, n = at >= 1 && at <= G.planes.length ? G.planes[at - 1] : 0, air = at === G.planes.length; parts.push('Radio: reaches ' + (val === 1 ? 'your space' : air ? 'the airport' : 'space ' + at) + (n ? ', clears a plane' : ', no plane there') + (!(G.slots.en0 && G.slots.en1) && !FA.isFinal(G) ? ' (from here, before the engines move you)' : '')); }
  for (const g of ['gear', 'flaps', 'brakes']) { const sw = G.pl.sw[g === 'gear' ? 'lg' : g === 'flaps' ? 'fl' : 'br'], k = legalKeys(v, val).find(k => FA.SLOT[k].grp === g); if (k && sw[FA.SLOT[k].ix]) parts.push(SLOTG[g] + ' ' + (FA.SLOT[k].ix + 1) + ' is already done: a die there changes nothing'); }
  if (!G.slots['ax' + v] && ax) { const nx = G.pl.axis + (v === 0 ? ax.v - val : val - ax.v); parts.push('Axis: ' + val + ' against ' + ax.v + (nx === G.pl.axis ? ' keeps it' : ' makes it ' + (nx === 0 ? 'level' : Math.abs(nx) + (nx < 0 ? ' left' : ' right'))) + (Math.abs(nx) >= 3 ? ' (spin!)' : last && nx !== 0 ? ' (it must be level to land!)' : '')); }
  return parts.join(' · ');
}
const legalKeys = (v, val) => selectedLegal();
const legalHas = (v, val, grp) => selectedLegal().some(k => FA.SLOT[k].grp === grp);
function actions(v) {
  const f = document.createDocumentFragment();
  if (G.result && UI.overShown && !UI.rsOpen) { const b = (txt, a, cls) => f.appendChild(h('button.btn' + (cls ? '.' + cls : ''), { type: 'button', 'data-a': a }, txt));
    if (UI.mode !== 'net' || (typeof isHost === 'function' && isHost())) b('Fly again', 'again', 'go'); if (UI.mode !== 'net' && G.result.win) b('Next airport', 'nextsc'); return f; }
  if (G.result || typeof v !== 'number' || v < 0 || !mayAct(v)) return f;
  const mv = FA.validMoves(G, v), has = t => mv.filter(m => m.t === t);
  const b = (txt, a, cls, extra) => f.appendChild(h('button.btn' + (cls ? '.' + cls : ''), Object.assign({ type: 'button', 'data-a': a }, extra || {}), txt));
  if (G.phase === 'brief') { if (has('ready').length) b(UI.mode === 'hot' && UI.holder < 0 ? 'Roll: ' + name(v) + ' is ready' : 'Roll my dice', 'ready', 'go'); return f; }
  if (G.pend && G.pend.h === 'rr' && has('rrpick').length) { const n = UI.rrm.filter(x => x).length; b(n ? 'Reroll ' + n + (n > 1 ? ' dice' : ' die') : 'Keep my dice', 'rrpick', 'go'); return f; }
  if (G.pend) return f;
  const selD = typeof UI.sel === 'number' && UI.sel >= 0;
  // free actions (any time, also on the partner's turn)
  if (has('rr').length) b(UI.rrAsk ? 'Spend 1 of ' + G.rrHand + ' rerolls?' : 'Reroll (' + G.rrHand + ')', 'rr', UI.rrAsk ? 'go' : 'alt', { title: 'Spend a reroll token: both crew may reroll any unplaced dice once' });
  if (has('adapt').length && selD) b('Flip this die', 'adapt', 'alt');
  if (has('wt').length && selD) b('Hand-over with this die', 'wt', 'alt');
  if (G.turn !== v) return f;
  if (has('antic').length && selD) b('Second look: reroll this die', 'antic', 'alt');
  if (has('toss').length && selD) b('No space fits: put it aside', 'toss', 'alt');
  return f;
}
// the landing conditions as [ok (true / false / null = not yet), text]
function landList() {
  const o = [], left = FA.planesOnTrack(G);
  o.push([left === 0, 'No planes left on the track (' + left + ' to go)']);
  o.push([G.pl.sw.lg.every(Boolean) && G.pl.sw.fl.every(Boolean), 'All gear (' + G.pl.sw.lg.reduce((a, x) => a + x, 0) + '/3) and flaps (' + G.pl.sw.fl.reduce((a, x) => a + x, 0) + '/4) down']);
  o.push([G.pl.axis === 0, 'Axis level (now ' + (G.pl.axis === 0 ? 'level' : Math.abs(G.pl.axis) + (G.pl.axis < 0 ? ' left' : ' right')) + ')']);
  o.push([FA.brakeVal(G) >= 2 ? true : null, 'Last-round speed no more than the brakes (' + FA.brakeVal(G) + ')']);
  if (G.mods.intern) o.push([G.intern.length === 0, 'Trainee finished (' + G.intern.length + ' tokens left)']);
  if (G.mods.ice) o.push([G.pl.ice === 4, 'Icy-runway track finished (' + G.pl.ice + '/4)']);
  return o;
}
function renderCheat() {
  const c = $('#cheat'); if (!c) return; c.innerHTML = ''; c.classList.toggle('open', !!UI.ckOpen); const ck = (ok, t) => c.appendChild(h('div.cr', h('span.ck' + (ok === true ? '.ok' : ok === false ? '.no' : ''), ok === true ? '✓' : ok === false ? '!' : ''), t));
  c.appendChild(h('b', 'Landing checklist'));
  for (const [ok, t] of landList()) ck(ok, t);
}
function renderBar() {
  const bs = $('#barstat'); if (!bs || !G) return; bs.textContent = (G.result ? 'Flight over' : 'Round ' + (G.round + 1) + '/' + (D.rounds - G.row0)) + ' · ' + D.airports[scenOf().ap].name;
}
// ===================== part 3: game flow (new game, computer crew, human actions, hot-seat, timer, end) =====================
const mkey = m => JSON.stringify(m);
function newGame(mode, o) {
  o = o || {}; clearTimeout(UI.tm); UI.seq++;
  const cfg = UI.cfg = Object.assign({ scenario: 'g1', role: 0, level: 'normal', abil: [] }, UI.opt || {}, o);
  const sc = FA.scen(cfg.scenario);
  const abil = (cfg.abil && cfg.abil.length ? cfg.abil : suggestAbil(sc)).slice(0, sc.ab);
  const ai = [null, null], lv = cfg.level || 'normal';
  if (mode === 'vs' || mode === 'guided') ai[1 - cfg.role] = lv; else if (mode === 'watch') { ai[0] = lv; ai[1] = lv; }
  else if (mode === 'net') { (cfg.ai || []).forEach((l, i) => ai[i] = l || null); }
  const seed = (UI.seed != null ? UI.seed : (Date.now() ^ (Math.random() * 1e9)) | 0);
  const names = [D.crew[0].name, D.crew[1].name];
  G = FA.newGame({ scenario: sc.id, seed, abil: mode === 'guided' ? [] : abil, names, ai });
  if (mode === 'guided') { G.script = GUIDED_SCRIPT.slice(); }
  if (o.camp && typeof campTwist === 'function') campTwist(G, o.camp.twist);
  UI.mode = mode; UI.seat = mode === 'guided' ? 0 : cfg.role; UI.holder = mode === 'hot' ? -1 : UI.seat; UI.started = true; UI.sel = -1; UI.cof = 0; UI.hint = null; UI.over = null; UI.overShown = false; UI.rrm = [false, false, false, false];
  UI.coach = { level: o.tipsOff ? 'off' : mode === 'guided' ? 'full' : (UI.prefs.guide || 'off'), seen: {}, tip: '', queue: [] }; UI.lastPlace = null; UI.rt = G.mods.real ? { left: 60000, last: 0 } : null;
  const st = $('#start'); if (st) st.hidden = true; closeRS(); try { GX.close(); } catch (e) { } closePass(); hideRecap();
  { const pc = $('#pc'); if (pc) { pc.hidden = true; pc.innerHTML = ''; } }   // a tip left over from the last flight
  if (mode === 'guided' && typeof hlpInit === 'function') { hlpInit(); if (typeof GXH !== 'undefined') { GXH.setEnabled(true); GXH.reset(); } }   // the guided flight: every bubble on, again
  $$('#fx .endb').forEach(e => e.remove()); UI.rfx = null; clearSave(); render(); sndMusic(); coachTick(); schedule();
  if (mode !== 'guided' && mode !== 'watch' && UI.prefs.story !== false && !o.camp && !isPh()) showStory();
}
function suggestAbil(sc) { const order = ['mastery', 'control', 'antic', 'together', 'sync', 'adapt']; return order.slice(0, sc.ab); }
// ---- applying a move (every route goes through here: a human tap, the computer, a remote player)
function commit(seat, m) {
  if (!G || G.result) return false;
  const was = { round: G.round, phase: G.phase, slots: Object.assign({}, G.slots), axis: G.pl.axis, pos: G.pl.pos, planes: FA.planesOnTrack(G), sw: JSON.stringify(G.pl.sw) };
  UI.lastPlace = m.t === 'place' ? { seat, to: m.to, d: m.d } : null;
  const r = FA.performMove(G, m, seat); if (!r.ok) { if (mayAct(seat)) toast(r.error); return false; }
  sfxFor(m, was); UI.sel = -1; UI.cof = 0; UI.hint = null; if (m.t === 'rrpick') UI.rrm = [false, false, false, false];
  if (G.round !== was.round) { UI.rt = G.mods.real ? { left: 60000, last: 0 } : null; UI.sel = -1; }
  saveGame(); if (typeof netPush === 'function') netPush(); coachTick(); render(); schedule();
  return true;
}
function sfxFor(m, was) {
  try {
    if (m.t === 'place') { snd('dieland'); if (G.pl.axis !== was.axis) snd('axis'); if (G.pl.pos !== was.pos) snd('engine'); if (FA.planesOnTrack(G) < was.planes) snd('radio'); if (JSON.stringify(G.pl.sw) !== was.sw) snd('switch'); if (FA.SLOT[m.to].grp === 'conc') snd('coffee'); }
    else if (m.t === 'ready' && G.phase === 'place') snd('roll'); else if (m.t === 'rrpick' && !G.pend) snd('roll'); else if (m.t === 'say') snd('click');
    if (G.round !== was.round && !G.result) snd('round');
  } catch (e) { }
}
// ---- the scheduler: asks the computer for its move, waits for humans, shows pass screens
function schedule() {
  clearTimeout(UI.tm); if (!G || !UI.started) return;
  if (G.result) { onEnd(); return; }
  if (UI.mode === 'net' && typeof isClient === 'function' && isClient()) return;
  const seats = FA.pending(G); if (!seats.length) return;
  const myUi = seats.filter(s => !G.ai[s]);
  // hot-seat: hand the device over only when the next decision needs a player's hidden dice; the briefing and public tokens are done on the shared screen
  if (UI.mode === 'hot') { if (hiddenFree() && (G.phase === 'brief' || !myUi.includes(UI.holder))) { if (UI.holder >= 0) { UI.holder = -1; UI.sel = -1; render(); } } else if (myUi.length && !myUi.includes(UI.holder)) { showPass(myUi[0]); return; } }
  const aiSeat = seats.find(s => G.ai[s]);
  if (aiSeat != null) {
    const seq = UI.seq, delay = G.phase === 'brief' ? Math.min(AIDELAY, 500) : AIDELAY, aiS = aiSeat;
    UI.tm = setTimeout(() => { if (seq !== UI.seq || !G || G.result) return; try { const m = FA.AI.move(G, aiS, G.ai[aiS], {}); if (!m) { console.warn('no AI move'); return; } commit(aiS, m); } catch (e) { console.error(e); } }, ANIM || UI.mode === 'net' ? delay : 0);
  }
}
// ---- human actions
function dieTap(s, d) {
  if (!mayAct(s)) { if (G.phase === 'place' && !G.result) toast(s === viewSeat() ? 'Not your move yet.' : 'Those dice are hidden behind the screen.'); return; }
  const v = actSeat(); if (v !== s) return;
  if (G.pend && G.pend.h === 'rr') { if (!G.pend.d.m[s] && typeof d === 'number' && !G.dice[s][d].u) { UI.rrm[d] = !UI.rrm[d]; render(); } return; }
  if (G.pend && G.pend.h === 'wt' && G.pend.d.a !== s) { const m = { t: 'wt2', d }; if (FA.validMoves(G, s).some(x => x.t === 'wt2' && x.d === d)) commit(s, m); return; }
  if (G.turn !== s && !(G.pend && (G.pend.h === 'intern' || G.pend.h === 'sync'))) { toast('Not your move yet.'); return; }
  if (G.dice[s][d] && G.dice[s][d].u && d !== 'p') return;
  UI.sel = UI.sel === d ? -1 : d; UI.cof = 0; UI.hint = null; UI.warnK = null; snd('click'); render(); coachTick();
}
function slotTap(k) {
  const v = actSeat(); if (typeof v !== 'number' || v < 0 || !mayAct(v)) { if (G && !G.result) toast('Wait for your turn.'); return; }
  if (G.slots[k]) { toast(slotName(k) + ' is taken.'); return; }
  if (UI.sel === -1 || UI.sel == null) { toast('Pick a die first.'); return; }
  const m = { t: 'place', d: UI.sel, to: k, c: UI.cof };
  if (FA.validMoves(G, v).some(x => x.t === 'place' && x.d === m.d && x.to === k && (x.c || 0) === m.c)) {
    // the last dice are needed on the empty Axis / Engines: a second tap on the same space places anyway
    const mi = mandInfo(v); if (UI.sel !== 'p' && mi && mi.tight && !mi.lost && !mi.need.includes(k) && UI.warnK !== k) { UI.warnK = k; snd('error'); toast(needNames(mi.need) + ' still empty. Tap again.'); return; }
    // this die here ends the flight at once: the first tap only explains, a second tap places it
    if (UI.dead && UI.dead[k] && UI.warnK !== k) { UI.warnK = k; snd('error'); toast('This ends the flight. Tap again.'); return; }
    UI.warnK = null; sendMove(v, m); return; }
  const val = (UI.sel === 'p' ? G.pend.d.val : G.dice[v][UI.sel].v) + UI.cof; const S = FA.SLOT[k];
  const why = S.s !== null && S.s !== v ? 'That space belongs to the ' + (S.s === 0 ? 'pilot' : 'co-pilot') + '.' : (S.grp === 'flaps' && S.ix > 0 && !G.pl.sw.fl[S.ix - 1]) ? 'Flaps go in order: use the one above first.' : (S.grp === 'brakes' && S.ix > 0 && !G.pl.sw.br[S.ix - 1]) ? 'Brakes go in order: 2, then 4, then 6.' : (S.grp === 'ice' && S.ix !== G.pl.ice) ? 'Only the next icy-runway column can be used.' : (S.grp === 'intern' && G.intern.length && val === (v === 0 ? G.intern[0] : G.intern[G.intern.length - 1])) ? 'The die must differ from the next trainee token.' : S.vals ? slotName(k) + ' ' + slotNeed(k) + ' (your die shows ' + val + ').' : 'That does not fit.';
  snd('error'); toast(why);
}
// route: online clients send to the host, everybody else applies at once
function sendMove(seat, m) { if (UI.mode === 'net' && typeof isClient === 'function' && isClient()) { if (typeof netAct === 'function') netAct(m); UI.sel = -1; UI.cof = 0; render(); return; } commit(seat, m); }
function doAction(a, t) {
  const v = actSeat(); if (typeof v !== 'number' || v < 0) return;
  const mv = FA.validMoves(G, v);
  switch (a) {
    case 'ready': sendMove(v, { t: 'ready' }); break;
    case 'say': sendMove(v, { t: 'say', c: t.dataset.c }); break;
    case 'rr': if (!UI.rrAsk) { UI.rrAsk = true; render(); toast('Spend a token? Tap again.'); clearTimeout(UI.rrAskT); UI.rrAskT = setTimeout(() => { UI.rrAsk = false; if (G && UI.started) render(); }, 5000); break; }
      UI.rrAsk = false; sendMove(v, { t: 'rr' }); break;
    case 'rrpick': sendMove(v, { t: 'rrpick', m: UI.rrm.slice() }); break;
    case 'antic': case 'adapt': case 'wt': case 'toss': if (typeof UI.sel === 'number' && UI.sel >= 0) sendMove(v, { t: a, d: UI.sel }); break;
    case 'cof': UI.cof = +t.dataset.c; render(); break;
  }
}
// ---- pass-the-device screens (hot-seat)
function showPass(seat) {
  UI.holder = -1; const el = $('#pass'); if (!el) return; el.hidden = false; el.innerHTML = '';
  const waiting = G.pend && G.pend.h === 'rr' ? 'reroll choice' : G.pend && G.pend.h === 'wt' ? 'hand-over choice' : 'turn';
  el.appendChild(h('div.passbox', ART['crew-' + seat] ? h('img', { src: ART['crew-' + seat], alt: '' }) : null, h('h2', 'Pass to ' + name(seat)), h('p', name(seat) + ', ' + pname(seat) + ' (' + (seat ? 'orange' : 'blue') + '): it is your ' + waiting + '. Make sure only you can see the screen.'), h('p.sm', 'Your dice are hidden until you tap the button.'), h('button.btn.go', { type: 'button', 'data-a': 'take', 'data-s': seat }, "I'm " + name(seat) + ' – show my dice')));
  render();
}
function takeDevice(seat) { UI.holder = seat; closePass(); render(); schedule(); }
function closePass() { const el = $('#pass'); if (el) { el.hidden = true; el.innerHTML = ''; } }
// ---- real-time module: a 60 s timer that only runs while someone is deciding
setInterval(() => {
  if (!G || !UI.started || G.result || !UI.rt || G.phase !== 'place') return; if (UI.mode === 'net' && typeof isClient === 'function' && isClient()) { return; }
  const now = Date.now(); if (!UI.rt.last) { UI.rt.last = now; return; } const dt = now - UI.rt.last; UI.rt.last = now;
  const seats = FA.pending(G), human = seats.some(s => !G.ai[s]); if (!human) return; if (UI.mode === 'hot' && UI.holder < 0) return;
  UI.rt.left -= dt; const sec = Math.max(0, Math.ceil(UI.rt.left / 1000));
  for (const e of $$('.rtleft')) { e.textContent = '⏱ ' + sec + ' s'; e.classList.toggle('low', sec <= 10); e.setAttribute('aria-label', sec + ' seconds left this round'); }
  if (sec <= 10 && sec !== UI.rtBeep) { UI.rtBeep = sec; try { snd('click'); } catch (e) { } }
  if (UI.rt.left <= 0) { UI.rt = null; toast('Time is up!'); commit(seats[0], { t: 'timeout' }); }
}, 250);
// ---- the end
function onEnd() {
  if (UI.overShown) return; UI.overShown = true; clearSave(); hideRecap();   // no round card over the ending picture
  const win = G.result.win; try { if (win) { UI.won[G.sid] = 1; savePrefs(); } snd(win ? 'win' : 'lose'); } catch (e) { }
  const fin = () => { if (typeof campOn === 'function' && campOn()) campFinish(); else showEndBoard(); };
  if (typeof pxEnd === 'function' && ANIM && typeof PX !== 'undefined' && PX.on) { pxEnd(win, fin); } else setTimeout(fin, ANIM ? 500 : 0);
}
// ===================== part 4: guided first flight script, end card, drawers =====================
var GUIDED_SCRIPT = [[[6,4,6,3],[4,3,4,4]],[[1,5,2,3],[4,1,5,5]],[[4,2,1,6],[3,1,2,4]],[[2,4,2,4],[2,5,4,1]],[[6,5,2,2],[6,2,1,4]],[[1,1,5,5],[2,6,6,2]],[[4,2,4,3],[5,6,4,6]]];   // found by guided-search.js: each control has a die to teach with, and two computer crews win 80% of 60 flights
// (the old tip cards are gone: the help kit in ui10.js gives the coach bubbles, the lightbulb and the rules cards)
// one control tip per die you place: the next one waits until you have placed a die, and control tips come when the die you picked fits that control
function myPlaced() { const v = actSeat(); return typeof v === 'number' && v >= 0 ? Object.values(G.slots).filter(d => d.s === v && d.k !== 'i' && d.k !== 'x').length : 0; }
function selFits(grp) { return typeof UI.sel === 'number' && UI.sel >= 0 && !G.pend && selectedLegal().some(k => FA.SLOT[k].grp === grp); }
const tval = v => typeof v === 'function' ? v() : v;
function myTurn() { const v = actSeat(); return typeof v === 'number' && v >= 0 && mayAct(v) && FA.pending(G).includes(v); }
function coachTick() { }   // kept so older call sites stay valid; see ui10.js
function applyHL() { }
// ---------- end card ----------
// ---- the story card at the start of a flight (airport, what is special today, how the colours work)
function showStory() {
  const rs = $('#rs'); if (!rs || !G || G.result) return; const sc = scenOf(), ap = D.airports[sc.ap], band = D.diffs[sc.col] || {};
  UI.rsOpen = true; rs.hidden = false; rs.innerHTML = ''; rs.className = 'story';
  const mods = sc.mods.map(m => D.mods[m]).concat(G.mods.traffic ? [D.mods.traffic] : []).concat(G.mods.tabs ? [D.mods.turns] : []);
  const box = h('div.rsbox.stbox', { role: 'dialog', 'aria-label': 'Flight story' },
    ART['end-land'] ? h('img.stimg', { src: ART['end-land'], alt: '' }) : null,
    h('h2', ap.name + ': ' + sc.title), h('p.sm.muted', (band.name || sc.col) + ' · ' + ap.wx + ', ' + ap.tod + ' · ' + name(0) + ' (Pilot, blue) and ' + name(1) + ' (Co-pilot, orange)'),
    h('p', sc.text), h('p.sm', ap.blurb),
    mods.length ? h('div', h('b', 'Today'), ...mods.map(m => h('div.why', h('b', m.name + ': '), m.text))) : h('p.sm', 'No extra rules today: just the panel, the track and each other.'),
    ...G.abil.map(a => h('div.why', h('b', D.abilities[a].name + ': '), D.abilities[a].text)),
    h('div.cbtns', h('button.btn.go', { type: 'button', 'data-a': 'rsclose' }, 'To the briefing')));
  rs.appendChild(box);
}
function closeRS() { const rs = $('#rs'); if (rs) { rs.hidden = true; rs.innerHTML = ''; rs.className = ''; } UI.rsOpen = false; if (G && G.result) { if (typeof pxClearEnd === 'function') pxClearEnd(); hideRecap(); if (UI.started) render(); } }   // 'Look at the panel': the ending picture goes and the final panel is drawn again
function checkRows(c) {
  const rows = [['planes', 'No planes left on the approach track'], ['gear', 'All landing gear down'], ['flaps', 'All flaps out'], ['axis', 'Axis level'], ['speed', 'Speed no more than the brakes'], ['intern', 'Trainee fully trained'], ['ice', 'Icy-runway brakes finished']];
  return rows.filter(r => r[0] in c).map(r => h('div.chk', h('i.' + (c[r[0]] ? 'ok' : 'no'), c[r[0]] ? '✓' : '×'), r[1]));
}
const LANDED_WHY = ['landed', 'checks', 'speed'];
const LOSS_T = { mandatory: 'an Axis or Engines space was empty', spin: 'the plane tilted into a spin', collision: 'collision with a plane on the approach', overshoot: 'the plane overshot the airport', corridor: 'the axis was outside the corridor', fuel: 'out of fuel', short: 'not at the airport when the last altitude began', timeout: 'out of time' };
const LOSS_TIP = { mandatory: 'Every round both crew must put a die on the Axis and on the Engines. The panel warns you (red pulse) when your last dice are needed there.', spin: 'A tilt of 3 either way is a spin. Watch the dial and answer your crewmate’s axis die with a close value.', collision: 'Clear a plane with the Radio before you leave its space: a die showing n clears the space n - 1 ahead of you.', overshoot: 'Near the airport keep the engine sum at or under the blue marker: the plane then stays where it is.', corridor: 'On a space with a corridor tab the axis must be in one of its positions when you leave (C = level, L/R = tilted toward the Pilot/Co-pilot).', fuel: 'Use the fuel space every round (any die burns its value; skipping burns 6), or keep the engine dice close when fuel leaks.', short: 'You must be on the airport space when the last altitude starts: plan the moves round by round.' };
function lossText(R) {
  if (R.why === 'mandatory' && Array.isArray(R.miss) && R.miss.length) return R.miss.map(k => name(+k[2]) + ' (' + pname(+k[2]) + ') had no die on the ' + (k[0] === 'a' ? 'Axis' : 'Engines')).join('; ') + ' at the end of the round.';
  return R.msg;
}
function showFinal() {
  const rs = $('#rs'); if (!rs || !G || !G.result) return; UI.rsOpen = true; rs.hidden = false; rs.innerHTML = ''; rs.className = '';
  const R = G.result, sc = scenOf(), ap = D.airports[sc.ap];
  const stats = G.used || {};
  const box = h('div.rsbox.' + (R.win ? 'win' : 'lose'), { role: 'dialog', 'aria-label': 'Flight debrief' },
    h('h2', R.win ? 'Landed at ' + ap.name + '!' : 'Flight lost'),
    h('p', R.win ? 'The passengers applaud. ' + sc.title + ' is done' + (UI.mode === 'guided' ? ': you have flown the first flight.' : '.') : lossText(R)),
    // the landing checklist only when the landing itself was judged; an earlier loss shows just what went wrong and how to avoid it
    LANDED_WHY.includes(R.why) ? h('div', checkRows(R.checks || {})) : h('div', h('div.chk', h('i.no', '×'), h('span', 'Round ' + (G.round + 1) + ' at ' + altRows()[G.round + G.row0][0] + ' ft: ' + (LOSS_T[R.why] || 'flight lost'))), LOSS_TIP[R.why] ? h('p.sm', LOSS_TIP[R.why]) : null),
    h('div.kv', h('span', 'Rounds flown'), h('b', (G.round + 1) + ' of ' + (D.rounds - G.row0))), h('div.kv', h('span', 'Coffee earned'), h('b', String(stats.coffeeGain || 0))), h('div.kv', h('span', 'Planes cleared by radio'), h('b', String(stats.radioClear || 0))), h('div.kv', h('span', 'Rerolls spent'), h('b', String(stats.rerollUse || 0))),
    h('div.cbtns', UI.mode === 'net' ? (typeof isHost === 'function' && isHost() ? h('button.btn.go', { type: 'button', 'data-a': 'again' }, 'Fly again') : h('span.sm', 'The host can start another flight.')) : h('button.btn.go', { type: 'button', 'data-a': 'again' }, 'Fly again'), UI.mode !== 'net' && R.win ? h('button.btn', { type: 'button', 'data-a': 'nextsc' }, 'Next airport') : null, h('button.btn.alt', { type: 'button', 'data-a': 'rsclose' }, 'Look at the panel'), h('button.btn.alt', { type: 'button', 'data-a': 'menu' }, 'Menu')));
  rs.appendChild(box);
}
// ---------- drawers ----------
// the log grouped by round (newest first, the current round open), without the "(pilot)" / "(co-pilot)" suffixes
function logHTML() {
  const e = h('div.logl'), by = new Map(); for (const l of G.log.slice(-200)) { const r = l.r || 0; if (!by.has(r)) by.set(r, []); by.get(r).push(l.t.replace(/ \((pilot|co-pilot)\)/g, '')); }
  const rows = altRows(), rs = [...by.keys()].sort((a, b) => b - a);
  rs.forEach((r, i) => { const R = r > 0 ? rows[r - 1 + G.row0] : null; const d = h('details.lgr', { open: i === 0 ? true : null }, h('summary', r > 0 ? 'Round ' + r + (R ? ' · ' + R[0] + ' ft' : '') : 'Before the flight', h('span.lgn', ' (' + by.get(r).length + ')')));
    by.get(r).slice().reverse().forEach(t => d.appendChild(h('div.ll', t))); e.appendChild(d); });
  return e;
}
function buildRules() {
  const root = h('div.rules'), sec = (t, ...k) => { root.appendChild(h('h3', t)); k.forEach(x => root.appendChild(x)); };
  sec('The goal', h('p', 'You and your crewmate fly an airliner onto the runway. You are the Pilot (blue) and the Co-pilot (orange). You win or lose together. The game lasts seven rounds, one altitude row each. The plane must already be on the airport when the last round starts (rounds 1 to 6 are for flying there; arriving early is fine, you then hold). The last round is the landing: by its end the track must be clear, the gear and flaps down, the axis level, and the engine total no more than the brakes.'));
  sec('How a round goes', h('ol', ...['Round start: the altitude row appears (it may bring a reroll token), and the traffic die may add planes.', 'Briefing: talk strategy, never dice values. Then both crew roll four dice behind their screens.', 'Silence. The first player (shown on the altitude row) puts one die on a free space of their colour, then you alternate until all eight dice are used.', 'End of round: both axis and both engine dice must be there. The plane sinks one row and the dice come back.'].map(t => h('li', t))));
  sec('Every control', h('ul', ...[
    'Axis (both, mandatory): the plane tilts toward the higher die by the difference. Tilt of 3 = spin = lost. It never resets.',
    'Engines (both, mandatory): the sum against the two markers (blue starts at 4, orange at 8): 0, 1 or 2 spaces. Leaving a space with a plane is a collision; passing the airport is an overshoot.',
    'Radio: pilot one space, co-pilot two, any value. It removes a plane from the space that many steps ahead (1 = your own space).',
    'Landing gear (pilot): 1-2, 3-4, 5-6 in any order. Each raises the blue marker by one.',
    'Flaps (co-pilot): 1-2, 2-3, 4-5, 5-6 strictly in order. Each raises the orange marker by one.',
    'Brakes (pilot): exactly 2, then 4, then 6. They only count in the last round.',
    'Concentration: any die, a coffee token (up to 3). Spend tokens to add or subtract 1 from any die you place (1 to 6, no wrapping).',
    'Reroll token: either crew may spend it at any time while dice are unplaced (also on the partner’s turn): both crew may reroll any of their unplaced dice once.'].map(t => h('li', t))));
  sec('The last round', h('p', 'The plane does not move. Your engine total must be no more than the brake value (and the brakes must be at least 2). At the end of the round you win only if every one of these holds: no planes left, all gear and flaps down, the axis level, and that speed check passed.'));
  sec('You lose at once if', h('ul', ...['the tilt reaches 3', 'an axis or engine die is missing at the end of a round', 'you leave a space that holds a plane, or pass the airport', 'the last altitude starts and you are not at the airport', 'the fuel runs out (fuel scenarios)', 'your final speed is above the brakes'].map(t => h('li', t))));
  sec('Modules', h('div', ...Object.keys(D.mods).map(k => h('div.rcard', h('div.rt', h('b', D.mods[k].name), h('div', D.mods[k].text))))));
  sec('Ability cards', h('div', ...Object.keys(D.abilities).map(k => h('div.rcard', h('div.rt', h('b', D.abilities[k].name), h('div', D.abilities[k].text))))));
  sec('Playing on a phone', h('ul', ...['Tap a die in your tray, then tap a glowing space. Tap the die again to put it back.', 'Coffee buttons appear under the selected die when you hold tokens.', 'Hot-seat: a pass screen hides everything between turns. Online: you only ever see your own dice.', 'Hint shows what the computer crew would do and why, under the selected die (never over the buttons).', 'Each control space is labelled (Axis, Engine, Radio, Gear, Flap, Brake, Coffee). The altitude strip colour shows who places first. The ✓ button lists the landing checklist.'].map(t => h('li', t))));
  root.appendChild(h('div', { html: '<section class="credits-audio"><h3>Credits</h3><p>Sound effects and jingles by Kenney (kenney.nl, CC0); ambience and music from OpenGameArt contributors under CC0 (full list in the licence log). Painted art is original and made by the generator in the repository. Names, text and art are original; the rules follow the rulebook.</p></section>' }));
  return root;
}
function buildRef() {
  const root = h('div.rules'), tr = (t, ...k) => { root.appendChild(h('h3', t)); k.forEach(x => root.appendChild(x)); };
  tr('Every airport and scenario (21)', h('div', ...['green', 'yellow', 'red', 'black'].map(col => h('div', h('div.band', h('i', { style: 'background:' + D.diffs[col].c }), D.diffs[col].name + ' (' + D.scenarios.filter(s => s.col === col).length + ')'), ...D.scenarios.filter(s => s.col === col).map(s => { const t = D.tracks[s.trk]; return h('div.rcard', h('div.rt', h('b', D.airports[s.ap].name + ': ' + s.title), h('div.sm', t.size + ' spaces, ' + t.sp.reduce((a, x) => a + x[0], 0) + ' planes at the start' + (scExtras(s).length ? ', ' + scExtras(s).join(', ') : '') + (s.ab ? ', ' + s.ab + ' ability card' + (s.ab > 1 ? 's' : '') : '')))); })))));
  tr('Components', h('ul', ...['4 blue dice (pilot) and 4 orange dice (co-pilot), rolled behind screens', '1 traffic die with faces 2, 3, 3, 4, 4, 5', '12 plane tokens, 3 coffee tokens, 3 reroll tokens', 'Blue and orange engine markers, a red brake marker', 'Approach strips (21) and two altitude tracks: green/yellow (rerolls at 6000 and 2000 ft) and red/black (reroll at 6000 ft)', 'Module parts: fuel track (starts at 20), wind dial, six trainee tokens, icy-runway brake track, 60-second timer', 'Six ability cards'].map(t => h('li', t))));
  tr('Spaces on the panel', h('ul', ...['Axis 1+1, Engines 1+1 (mandatory)', 'Radio 1 pilot + 2 co-pilot', 'Landing gear 3 (pilot): 1-2, 3-4, 5-6', 'Flaps 4 (co-pilot): 1-2, 2-3, 4-5, 5-6, in order', 'Brakes 3 (pilot): 2, 4, 6, in order', 'Concentration 3 (either)', 'Fuel 1 (either), Trainee 1+1, Icy-runway brakes 4 columns x 2'].map(t => h('li', t))));
  return root;
}
function renderCrew() {
  const b = $('#crewbody'); if (!b || !G) return; b.innerHTML = ''; const sc = scenOf(), ap = D.airports[sc.ap];
  // phones: the long goal, the landing checklist and the briefing phrases live here, not on the board
  if (isPh()) {
    if (UI.camp && UI.camp.goal) b.appendChild(h('div.why', h('b', 'Chapter goal: '), UI.camp.goal.text));
    b.appendChild(h('h3.drh', 'Goal')); b.appendChild(h('div.drgoal', goalFull()));
    b.appendChild(h('h3.drh', 'Landing checklist')); for (const [ok, t] of landList()) b.appendChild(h('div.cr', h('span.ck' + (ok === true ? '.ok' : ok === false ? '.no' : ''), ok === true ? '✓' : ok === false ? '!' : ''), t));
    const v = actSeat();
    if (G.phase === 'brief' && !G.result) { b.appendChild(h('h3.drh', 'Briefing phrases')); b.appendChild(h('p.sm', 'Before the roll you may say one thing. After the roll: silence, your placed dice do the talking.'));
      const sy = h('div.sayrow'); for (const s of [0, 1]) for (const c of G.say[s]) sy.appendChild(h('span.sbub.' + (s ? 'c' : 'p'), (who(s) === 'You' ? 'You said' : name(s) + ' says') + ': “' + SAYT[c] + '”'));
      if (typeof v === 'number' && v >= 0 && mayAct(v)) for (const m of FA.validMoves(G, v).filter(m => m.t === 'say')) sy.appendChild(h('button.say', { type: 'button', 'data-a': 'say', 'data-c': m.c }, SAYT[m.c])); b.appendChild(sy); }
    b.appendChild(h('h3.drh', 'The airport'));
  }
  b.appendChild(h('div.kv', h('span', 'Airport'), h('b', ap.name))); b.appendChild(h('p', ap.blurb)); b.appendChild(h('div.kv', h('span', 'Scenario'), h('b', sc.title + ' (' + D.diffs[sc.col].name + ')'))); b.appendChild(h('p.sm', sc.text));
  b.appendChild(h('div.kv', h('span', 'Weather'), h('b', ap.wx + ', ' + ap.tod))); if (G.mods) for (const m of sc.mods) b.appendChild(h('div.why', h('b', D.mods[m].name + ': '), D.mods[m].text));
  if (G.mods.tabs) b.appendChild(h('div.why', h('b', D.mods.turns.name + ': '), D.mods.turns.text)); if (G.mods.traffic) b.appendChild(h('div.why', h('b', D.mods.traffic.name + ': '), D.mods.traffic.text));
  for (const a of G.abil) b.appendChild(h('div.why', h('b', D.abilities[a].name + ': '), D.abilities[a].text));
  for (const s of [0, 1]) b.appendChild(h('div.rcard', ART['crew-' + s] ? h('img.ri', { src: ART['crew-' + s], alt: '' }) : null, h('div.rt', h('b', D.crew[s].name + (G.ai[s] ? ' (computer ' + G.ai[s] + ')' : '')), h('div.sm', D.crew[s].story))));
}
function renderMenu() {
  const b = $('#setbody'); b.innerHTML = ''; const row = (l, ...k) => b.appendChild(h('div.mrow', h('div.lbl', l), h('div.mbt', k)));
  const tog = (n, on, label) => h('button.btn' + (on ? '' : '.alt'), { 'data-a': n, type: 'button', 'aria-pressed': on ? 'true' : 'false' }, label + ': ' + (on ? 'On' : 'Off'));
  if (typeof NET !== 'undefined' && NET.on) row('Online', h('button.btn', { 'data-a': 'netopen', type: 'button' }, 'Lobby'), h('button.btn.alt', { 'data-a': 'netleave', type: 'button' }, typeof isHost === 'function' && isHost() ? 'Close the room' : 'Leave the room'));
  else row('Game', h('button.btn', { 'data-a': 'menu', type: 'button' }, 'New flight'), h('button.btn.alt', { 'data-a': 'save', type: 'button' }, 'Save'), h('button.btn.alt' + (hasSave() ? '' : '.dis'), { 'data-a': 'loadsave', type: 'button', disabled: hasSave() ? null : true }, 'Load'));
  if (!(typeof NET !== 'undefined' && NET.on)) { row('Computer speed', ...[['Fast', 150], ['Normal', 650], ['Slow', 1300]].map(([n, v]) => h('button.btn' + (AIDELAY === v ? '' : '.alt'), { 'data-a': 'speed', 'data-v': v, type: 'button' }, n))); row('Flight story card', ...[[true, 'On'], [false, 'Off']].map(([v, n]) => h('button.btn' + ((UI.prefs.story !== false) === v ? '' : '.alt'), { 'data-a': 'story', 'data-v': v ? '1' : '0', type: 'button' }, n))); }
  if (typeof hlpInit === 'function') { hlpInit(); if (typeof GXH !== 'undefined') { const w = document.createElement('div'); w.innerHTML = GXH.settingsHTML({ rowClass: 'mrow', btnClass: 'btn' }); while (w.firstChild) b.appendChild(w.firstChild); } }
  row('Sound', tog('sound', UI.prefs.sound, 'Sound effects'), tog('music', UI.prefs.music, 'Music'));
  { const g = UI.prefs.gfx || 'auto'; row('Graphics' + (typeof PX !== 'undefined' && PX.on ? (g === 'auto' ? ' (now ' + PX.q + ')' : '') : ' (simple view)'), ...[['auto', 'Auto'], ['high', 'High'], ['medium', 'Medium'], ['low', 'Low']].map(([v, n]) => h('button.btn' + (g === v ? '' : '.alt'), { 'data-a': 'gfx', 'data-v': v, type: 'button', 'aria-pressed': g === v ? 'true' : 'false' }, n))); }
  let sp = ''; try { sp = window.PerfHUD && PerfHUD.buttonsHTML ? PerfHUD.buttonsHTML('btn alt') : ''; } catch (e) { }
  row('Info', h('button.btn.alt', { 'data-a': 'rules', type: 'button' }, 'How to play'), h('span.tinyc', { html: sp }));
  b.appendChild(h('p.sm', 'Final Approach is an original co-operative landing game. Names, text and art are original; audio credits are in How to play.'));
}
function renderDrawers() { if (!GX.open || !G) return; if (GX.open === 'logd') { const b = $('#logbody'); b.innerHTML = ''; b.appendChild(logHTML()); } if (GX.open === 'crewd') renderCrew(); if (GX.open === 'setd') renderMenu(); }
// ===================== part 5: start screens, events, phone mode, boot =====================
function optObj() { return UI.opt = UI.opt || { scenario: 'g1', role: 0, level: 'normal', abil: [] }; }
function logoSVG() { return '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10.5" fill="#2c5f6c" stroke="#fff4dc" stroke-width="1.4"/><path d="M12 3l2.4 7 6.6 2.4-6.6 1.8L12 21l-2.4-6.8L3 12.4 9.6 10z" fill="#fff4dc"/></svg>'; }
function renderStart() {
  const s = $('#start'); s.hidden = false; s.innerHTML = '';
  const rs = $('#rs'); if (rs && !UI.rsOpen) rs.hidden = true;
  if (typeof NET !== 'undefined' && NET.on) { s.dataset.v = 'net'; netStartScreen(s); return; }
  if (!UI.sv) UI.sv = UI.onl ? 'online' : 'title';
  s.dataset.v = UI.sv;
  if (UI.sv === 'title') { s.appendChild(titleEl()); return; }
  if (ART.title) s.appendChild(h('img.ttl-bg.dim', { src: ART.title, alt: '' }));
  if (UI.sv === 'online') { s.appendChild(onlineEl()); return; }
  s.appendChild(setupEl());
}
function titleEl() {
  const bg = ART.title ? h('img.ttl-bg', { src: ART.title, alt: '' }) : h('div.ttl-bg.ttl-plain'), sv = hasSave();
  return h('div.ttl', bg, h('div.ttl-in', h('h1.logo', h('span.ic', { html: logoSVG() }), h('span', 'Final Approach')), h('p.tag', 'Two seats. Eight dice. One runway.'),
    h('div.tbtns', typeof campLine === 'function' && window.CAMPAIGN ? h('button.tbtn.go.story', { 'data-a': 'camp', type: 'button' }, h('b', 'Story'), h('span', campLine())) : null, h('button.tbtn' + (window.CAMPAIGN ? '' : '.go'), { 'data-a': 'play', type: 'button' }, h('b', 'Play'), h('span', 'fly with a computer crewmate')), h('button.tbtn', { 'data-a': 'online', type: 'button' }, h('b', 'Online'), h('span', 'with a friend, free')), sv ? h('button.tbtn', { 'data-a': 'loadsave', type: 'button' }, h('b', 'Resume'), h('span', 'your saved flight')) : null),
    h('button.tlink', { 'data-a': 'rules', type: 'button' }, 'How to play')));
}
function roleCard(s) {
  const o = optObj(), c = D.crew[s], on = o.role === s;
  return h('button.rcardx' + (on ? '.on' : ''), { type: 'button', 'data-a': 'role', 'data-r': s, style: '--dc:' + SEATC[s], 'aria-pressed': on ? 'true' : 'false' }, h('div.top', ART['crew-' + s] ? h('img', { src: ART['crew-' + s], alt: '' }) : null, h('h3', c.role + ': ' + c.short + (on ? ' ✓' : ''))), h('p', c.story), h('p.enjoy', c.enjoy));
}
// the same extras the story card and the rules list: scenario modules, plus Busy Sky / Tight Corridor when the airport's strip has traffic icons / corridor tabs
function scExtras(sc) { const t = D.tracks[sc.trk]; return sc.mods.map(m => D.mods[m].name).concat(t.sp.some(x => x[1]) ? [D.mods.traffic.name] : []).concat(t.sp.some(x => x[2]) ? [D.mods.turns.name] : []); }
function scLine(sc) { const ex = scExtras(sc).concat(sc.ab ? [sc.ab + ' ability card' + (sc.ab > 1 ? 's' : '')] : []); return D.airports[sc.ap].name + (ex.length ? ' · ' + ex.join(', ') : ' · no extras'); }
function setupEl() {
  const o = optObj(), ph = isPh(), open = !!UI.cfgOpen, sc = FA.scen(o.scenario);
  const head = h('div.shead', h('button.px.sback', { 'data-a': 'title', type: 'button', 'aria-label': 'Back to the title' }, '‹'), h('h2', 'Choose your flight'));
  const sum = h('div.ssum', h('span.sline', D.crew[o.role].role + ' · ' + D.airports[sc.ap].name + ' (' + sc.title + ') · computer ' + o.level), h('button.btn.alt', { 'data-a': 'cfgopen', type: 'button', 'aria-expanded': open ? 'true' : 'false' }, 'Configure'));
  const scn = h('div'); for (const col of ['green', 'yellow', 'red', 'black']) { scn.appendChild(h('div.band', h('i', { style: 'background:' + D.diffs[col].c }), D.diffs[col].name)); const g = h('div.scn'); for (const s of D.scenarios.filter(x => x.col === col)) g.appendChild(h('button.scb' + (o.scenario === s.id ? '.on' : ''), { type: 'button', 'data-a': 'scen', 'data-id': s.id, style: 'border-left-color:' + D.diffs[col].c, 'aria-pressed': o.scenario === s.id ? 'true' : 'false' }, UI.won[s.id] ? h('i.ld', '✓') : null, h('b', D.airports[s.ap].name + ': ' + s.title), h('span', scLine(s)))); scn.appendChild(g); }
  const ab = h('div.seg', h('span.lbl', 'Ability cards'));
  if (sc.ab) { const ids = Object.keys(D.abilities), cur = o.abil && o.abil.length ? o.abil : suggestAbil(sc); ids.forEach(id => ab.appendChild(h('button.chipb' + (cur.includes(id) ? '.on' : ''), { type: 'button', 'data-a': 'abil', 'data-id': id, title: D.abilities[id].text, 'aria-pressed': cur.includes(id) ? 'true' : 'false' }, D.abilities[id].name))); ab.appendChild(h('span.sm', 'Take ' + sc.ab + '. ' + cur.map(a => D.abilities[a].name + ': ' + D.abilities[a].text).join(' ') )); }
  else ab.appendChild(h('span.sm', 'This scenario uses no ability cards.'));
  const cfg = h('div.cfg#cfg', { hidden: ph && !open ? true : null, role: ph ? 'dialog' : null, 'aria-label': ph ? 'Configure the flight' : null },
    ph ? h('div.cfghead', h('b', 'Configure the flight'), h('button.btn', { 'data-a': 'cfgclose', type: 'button' }, 'Done')) : null,
    h('div.rolegrid', roleCard(0), roleCard(1)),
    h('div.seg', h('span.lbl', 'Computer crewmate'), ['easy', 'normal', 'hard'].map(v => h('button.chipb' + (o.level === v ? '.on' : ''), { 'data-a': 'level', 'data-v': v, type: 'button', 'aria-pressed': o.level === v ? 'true' : 'false' }, v))),
    scn, ab, ph ? h('div.cfgfoot', h('button.btn.go', { 'data-a': 'cfgclose', type: 'button' }, 'Done')) : null);
  const go = h('div.sgo', h('button.sbtn.big', { 'data-start': 'vs', 'data-a': 'start', 'data-m': 'vs', type: 'button' }, h('b', 'Start the flight'), h('span', D.airports[sc.ap].name + ': you as ' + D.crew[o.role].role + ' with a computer ' + D.crew[1 - o.role].role.toLowerCase())),
    h('div.sgrid3', h('button.sbtn', { 'data-start': 'guided', 'data-a': 'guided', type: 'button' }, h('b', 'Guided first flight'), h('span', 'Port Alder, one control at a time')), h('button.sbtn', { 'data-start': 'hot', 'data-a': 'start', 'data-m': 'hot', type: 'button' }, h('b', 'Hot-seat'), h('span', 'two people, one device')), h('button.sbtn', { 'data-start': 'ai', 'data-a': 'start', 'data-m': 'watch', type: 'button' }, h('b', 'Watch'), h('span', 'a computer crew flies it'))));
  return h('div.setup.scard', head, ph ? sum : h('p.ssub', 'Pick an airport, your seat and how sharp the computer crewmate is. New to the game? Start with the guided first flight.'), cfg, go);
}
function onlineEl() {
  return h('div.scard.onlv', h('div.shead', h('button.px.sback', { 'data-a': 'title', type: 'button', 'aria-label': 'Back to the title' }, '‹'), h('h2', 'Play online')),
    h('p.ssub', 'Host a flight and send a friend the code or the link. Browsers connect directly; each of you only ever sees your own dice. An empty seat goes to the computer.'),
    h('details.online#onl', { open: true }, h('summary', 'Free, peer to peer'), h('div#netblock', netInner())));
}
function showStart() { try { GX.close(); } catch (e) { } closePass(); const pc = $('#pc'); if (pc) { pc.hidden = true; pc.innerHTML = ''; } UI.sv = 'title'; UI.cfgOpen = false; closeRS(); clearTimeout(UI.tm); UI.seq++; renderStart(); }
function loadSave() { try { const o = JSON.parse(localStorage.getItem('fa_save')); if (!o || !o.G) return false; G = o.G; UI.mode = o.mode; UI.seat = o.seat; UI.holder = o.mode === 'hot' ? -1 : o.seat; UI.cfg = o.cfg; UI.started = true; UI.sel = -1; UI.cof = 0; UI.over = null; UI.overShown = false; UI.coach = { level: UI.prefs.guide || 'off', seen: {}, tip: '' }; UI.rt = G.mods.real ? { left: 60000, last: 0 } : null; const st = $('#start'); if (st) st.hidden = true; render(); sndMusic(); schedule(); return true; } catch (e) { return false; } }
// ---------- events ----------
document.addEventListener('click', ev => {
  const t = ev.target.closest('[data-a],[data-start]'); if (!t) return;
  const a = t.dataset.a, d = t.dataset;
  if (typeof netClick === 'function' && netClick(a, t)) return;
  if (d.start && !a) { newGame(d.start); return; }
  switch (a) {
    case 'die': dieTap(+d.s, d.d === 'p' ? 'p' : +d.d); break;
    case 'slot': slotTap(d.slot); break;
    case 'ready': case 'say': case 'rr': case 'rrpick': case 'antic': case 'adapt': case 'wt': case 'toss': case 'cof': doAction(a, t); break;
    case 'unsel': UI.sel = -1; UI.cof = 0; UI.warnK = null; render(); break;
    case 'debrief': showFinal(); break;
    case 'lookpanel': lookPanel(); break;
    case 'ckopen': UI.ckOpen = !UI.ckOpen; render(); break;
    case 'saymore': UI.sayAll = true; render(); break;
    case 'recapx': hideRecap(); break;
    case 'altinfo': { const R = altRows()[G.round + G.row0]; toast(R[0] + ' ft · round ' + (G.round + 1) + ' of ' + (D.rounds - G.row0)); break; }
    case 'space': { const i = +d.i, s = trackOf().sp[i]; toast((i === trackOf().sp.length - 1 ? 'Airport' : 'Space ' + (i + 1)) + ': ' + G.planes[i] + ' plane' + (G.planes[i] === 1 ? '' : 's')); break; }
    case 'take': takeDevice(+d.s); break;
    case 'rsclose': closeRS(); break;
    case 'again': { const c = UI.cfg || {}; const m = UI.mode, off = UI.coach && UI.coach.level === 'off'; closeRS(); if (m === 'net') { netStart(); break; } newGame(m === 'guided' ? 'vs' : m, { scenario: c.scenario, role: c.role, level: c.level, abil: c.abil, tipsOff: off }); break; }
    case 'nextsc': { const c = UI.cfg || {}, i = D.scenarios.findIndex(s => s.id === c.scenario), n = D.scenarios[(i + 1) % D.scenarios.length]; closeRS(); const m = UI.mode === 'guided' ? 'vs' : UI.mode; UI.opt = Object.assign({}, UI.opt, { scenario: n.id, abil: [] }); newGame(m, { scenario: n.id, role: c.role, level: c.level, abil: [] }); break; }
    case 'play': UI.sv = 'setup'; renderStart(); break;
    case 'camp': campOpen(); break;
    case 'goalopen': GX.show('crewd'); break;
    case 'online': UI.sv = 'online'; UI.onl = true; renderStart(); break;
    case 'title': UI.sv = 'title'; UI.cfgOpen = false; renderStart(); break;
    case 'cfgopen': UI.cfgOpen = true; renderStart(); break;
    case 'cfgclose': UI.cfgOpen = false; renderStart(); break;
    case 'role': optObj().role = +d.r; renderStart(); break;
    case 'level': optObj().level = d.v; renderStart(); break;
    case 'scen': { const o = optObj(); o.scenario = d.id; o.abil = []; renderStart(); break; }
    case 'abil': { const o = optObj(), sc = FA.scen(o.scenario); let cur = (o.abil && o.abil.length ? o.abil : suggestAbil(sc)).slice(); const i = cur.indexOf(d.id); if (i >= 0) cur.splice(i, 1); else { cur.push(d.id); if (cur.length > sc.ab) cur.shift(); } o.abil = cur; renderStart(); break; }
    case 'menu': showStart(); break;
    case 'start': newGame(d.m); break;
    case 'guided': newGame('guided', { scenario: 'g1', role: 0 }); break;
    case 'rules': GX.show('rulesd'); break;
    case 'save': toast(saveGame() ? 'Flight saved.' : 'Could not save.'); break;
    case 'loadsave': if (!loadSave()) toast('No saved flight.'); break;
    case 'speed': AIDELAY = +d.v; savePrefs(); renderMenu(); break;
    case 'story': UI.prefs.story = d.v === '1'; savePrefs(); renderMenu(); break;
    case 'gfx': if (typeof setGfx === 'function') setGfx(d.v); UI.prefs.gfx = d.v; savePrefs(); renderMenu(); break;
    case 'sound': UI.prefs.sound = !UI.prefs.sound; savePrefs(); try { if (window.GA) GA.setSfx(UI.prefs.sound); } catch (e) { } renderMenu(); break;
    case 'music': UI.prefs.music = !UI.prefs.music; savePrefs(); try { if (window.GA) GA.setMusic(UI.prefs.music); } catch (e) { } sndMusic(); renderMenu(); break;
  }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') { hideRecap(); if (UI.rsOpen && G && G.result) closeRS(); else if (UI.sel !== -1 && UI.sel != null) { UI.sel = -1; UI.cof = 0; render(); } } });
// ---------- phone mode ----------
function applyPhone() {
  const q = /[?&]phone=(\d)/.exec(location.search), vm = (window.GXV ? GXV.now() : { w: innerWidth, h: innerHeight }), w = vm.w, hh = vm.h, short = Math.min(w, hh);
  let ph = short <= 500 || (window.matchMedia && matchMedia('(pointer:coarse)').matches && short <= 600);
  if (q) ph = q[1] === '1';
  const r = document.documentElement.classList, was = r.contains('ph');
  r.toggle('ph', ph); document.documentElement.style.setProperty('--dockh', (ph && w < hh ? (hh < 650 ? 132 : 136) : Math.max(172, Math.min(212, Math.round(hh * .25)))) + 'px'); r.toggle('ph-p', ph && w < hh); r.toggle('ph-l', ph && w >= hh);
  if (was !== ph) { if (G && UI.started) render(); const st = $('#start'); if (st && !st.hidden && !(typeof NET !== 'undefined' && NET.on) && UI.sv === 'setup') renderStart(); }
}
let rzT = 0;
function onResize() { clearTimeout(rzT); rzT = setTimeout(() => { applyPhone(); if (G && UI.started) render(); }, 60); }
// ---------- boot ----------
function boot() {
  GX.init({ key: 'fa' });
  const rules = buildRules(); rules.appendChild(h('h2', { style: 'margin-top:18px' }, 'Reference')); rules.appendChild(buildRef());
  GX.drawer('rulesd', 'How to play', rules, true);
  GX.drawer('logd', 'Log', h('div#logbody'));
  GX.drawer('crewd', 'Flight briefing', h('div#crewbody'));
  GX.drawer('setd', 'Menu', h('div#setbody'));
  GX.onShow = id => { renderDrawers(); };
  prefs(); applyPhone();
  if (window.GXV) GXV.watch(() => { applyPhone(); if (G && UI.started) render(); else { const st = $('#start'); if (st && !st.hidden && UI.sv === 'setup') renderStart(); } }); else { addEventListener('resize', onResize); addEventListener('orientationchange', onResize); }
  const bd = $('#board'); if (window.ResizeObserver) new ResizeObserver(() => { if (G && UI.started) { clearTimeout(rzT); rzT = setTimeout(() => { if (G && UI.started) render(); }, 40); } }).observe(bd);
  try { if (window.GA) { const A = typeof GA_DATA !== 'undefined' ? GA_DATA : {}; GA.init({ sfx: A.sfx || {}, music: A.music || {}, key: 'fa' }); GA.setSfx(UI.prefs.sound); GA.setMusic(UI.prefs.music); } } catch (e) { }
  if (typeof pxPerfReg === 'function') pxPerfReg();
  if (typeof pxInit === 'function') pxInit().then(ok => { if (ok) { if (typeof pxPerfReg === 'function') pxPerfReg(); if (G && UI.started) render(); } });
  if (/[?&]seed=(\d+)/.test(location.search)) UI.seed = +RegExp.$1;
  if (typeof netInit === 'function') netInit();
  window.render_game_to_text = () => G ? FA.toText(G, viewSeat()) : 'no game';
  renderStart();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
// ===================== part 6: sound (shared gameaudio samples; silent without Web Audio) =====================
// SND_MAP: one line per event. s:null = silent. The user has not auditioned these by ear: re-tune vol here.
const SND_MAP = { click: { s: 'click', vol: .5 }, dieland: { s: 'dieland', vol: .8 }, axis: { s: 'whoosh', vol: .5 }, engine: { s: 'engine', vol: .55 }, radio: { s: 'beep', vol: .6 }, switch: { s: 'switch', vol: .7 },
  coffee: { s: 'coffee', vol: .6 }, roll: { s: 'roll', vol: .75 }, round: { s: 'round', vol: .6 }, win: { s: 'win', vol: .8 }, lose: { s: 'lose', vol: .8 }, error: { s: 'error', vol: .5 }, alarm: { s: 'alarm', vol: .6 }, crash: { s: 'boom', vol: .8 } };
function snd(name, o) {
  try {
    if (UI.prefs && UI.prefs.sound === false) return;
    const m = SND_MAP[name] || { s: name, vol: 1 }; if (!m.s || !window.GA || !GA.has(m.s)) return;
    const oo = Object.assign({}, o || {}); oo.vol = (oo.vol != null ? oo.vol : 1) * (m.vol != null ? m.vol : 1); GA.play(m.s, oo);
  } catch (e) { }
}
function sndMusic() {
  try {
    if (!window.GA) return;
    if (UI.prefs.music === false || !G || !UI.started) { GA.music(null); GA.stopLoop && GA.stopLoop('hum'); return; }
    GA.music('main', { vol: .28 }); if (GA.loop) GA.loop('hum', { vol: .12, fade: 1.5 });
  } catch (e) { }
}
document.addEventListener('click', e => { const t = e.target.closest('button'); if (t && !t.disabled && !t.matches('.die,.slot')) snd('click'); }, true);
// ===================== part 7: the painted panel (PixiJS 8: WebGL, else Pixi's canvas renderer, else the plain DOM view) =====================
// The DOM stays the layout, hit and accessibility layer. When the Pixi panel is on (html.fapx) the DOM pieces keep their text but hide their own look;
// after every render() this layer reads their boxes and paints: plate, wells, frames, dice (they fly from the tray into the slot, spin when rolled,
// squash when they land), switches, tokens, dial needle, speed gauge, fuel bar, a scrolling approach window with plane tokens, and the landing / crash ending.
// Nothing here changes game state. A sprite only shows what its DOM button shows, so hidden dice stay hidden.
const PX = { on: false, app: null, q: 'high', res: 1, kind: '', cv: null, L: {}, objs: new Map(), tex: {}, img: {}, tw: [], parts: [], t: 0, last: 0, dirty: true, err: '', ready: false, frames: 0, vanished: [], seq: 0, endA: null, nLand: 0, nRoll: 0 };
const PXQ = { high: { pr: 2, fx: 1 }, medium: { pr: 1.5, fx: .5 }, low: { pr: 1, fx: 0 } };
const pxRM = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };
function gfxAuto() { const n = navigator.hardwareConcurrency || 4, mem = navigator.deviceMemory || 4; if (n <= 2 || mem <= 2 || PX.soft) return 'low'; return isPh() ? 'medium' : 'high'; }
function gfxPref() { return UI.prefs.gfx || 'auto'; }
function gfxLevel() { const p = gfxPref(); return p === 'auto' ? (PX.autoQ || gfxAuto()) : p; }
function pxLoadImg(url) { return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; }); }
async function pxInit() {
  try {
    if (/jsdom/i.test(navigator.userAgent || '') || /[?&]px=0/.test(location.search) || !ART.dice) return false;
    if (!window.PIXI) { const src = document.getElementById('pixi-src'); if (!src) return false; const s = document.createElement('script'); s.textContent = src.textContent; document.head.appendChild(s); }
    if (!window.PIXI || !PIXI.Application) return false;
    const bd = $('#bd'), cv = document.createElement('canvas'); cv.id = 'pxc'; cv.setAttribute('aria-hidden', 'true'); bd.insertBefore(cv, bd.firstChild);
    PX.q = gfxLevel(); PX.res = pxBasePR();
    const want = /[?&]px=canvas/.test(location.search) ? ['canvas'] : ['webgl', 'canvas']; let app = null;
    for (const pref of want) {
      try { const a = new PIXI.Application(); await a.init({ canvas: cv, backgroundAlpha: 0, antialias: false, resolution: PX.res, autoDensity: true, preference: pref, autoStart: false, sharedTicker: false, width: Math.max(16, bd.clientWidth), height: Math.max(16, bd.clientHeight), powerPreference: 'low-power', failIfMajorPerformanceCaveat: false, hello: false }); app = a; PX.kind = (a.renderer && a.renderer.name) || pref; break; }
      catch (e) { PX.err += pref + ': ' + (e && e.message || e) + '; '; }
    }
    if (!app) { cv.remove(); return false; }
    PX.app = app; PX.cv = cv;
    try { const gl = app.renderer.gl; if (gl) { const ext = gl.getExtension('WEBGL_debug_renderer_info'), r = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : ''; if (/swiftshader|llvmpipe|software/i.test(r)) PX.soft = true; PX.gpu = r; } } catch (e) { }
    if (gfxPref() === 'auto') { PX.q = gfxLevel(); pxSetRes(pxBasePR()); }
    cv.addEventListener('webglcontextlost', e => { e.preventDefault(); pxOff('context lost'); });
    await pxTextures();
    const st = app.stage, C = () => new PIXI.Container();
    PX.L = { bg: C(), win: C(), plane: C(), well: C(), mark: C(), dice: C(), fx: C(), end: C() };
    PX.pm = new PIXI.Graphics(); st.addChild(PX.pm); PX.L.plane.mask = PX.pm;
    for (const k of ['bg', 'win', 'plane', 'well', 'mark', 'dice', 'fx', 'end']) st.addChild(PX.L[k]);
    PX.bgS = new PIXI.Sprite(PX.tex.plate); PX.L.bg.addChild(PX.bgS);
    PX.on = true; PX.ready = true; document.documentElement.classList.add('fapx');
    if (window.ResizeObserver) new ResizeObserver(() => { pxResize(); }).observe(bd);
    pxResize(); pxLoop();
    return true;
  } catch (e) { console.warn('painted panel off:', e); pxOff(String(e && e.message || e)); return false; }
}
function pxOff(why) { PX.on = false; PX.err += (why || '') + ';'; document.documentElement.classList.remove('fapx'); try { if (PX.cv) PX.cv.remove(); } catch (e) { } try { if (G && UI.started) render(); } catch (e) { } }
function pxBasePR() { const d = window.devicePixelRatio || 1, q = PXQ[PX.q] || PXQ.high, w = Math.min(q.pr, d); return window.PerfHUD && PerfHUD.pixelRatio ? PerfHUD.pixelRatio(w) : w; }
function pxSetRes(v) { PX.res = v; if (PX.app && PX.app.renderer) { try { PX.app.renderer.resolution = v; pxResize(true); } catch (e) { } } }
function pxApplyQ() { PX.q = gfxLevel(); pxSetRes(pxBasePR()); PX.dirty = true; }
function setGfx(v) { UI.prefs.gfx = v; savePrefs(); PX.autoQ = null; if (PX.on) { pxApplyQ(); pxPerfReg(); } }
function pxResize(force) {
  if (!PX.app) return; const bd = $('#bd'); if (!bd) return; const w = bd.clientWidth, h = bd.clientHeight; if (w < 8 || h < 8) return;
  if (force || PX.w !== w || PX.h !== h) { PX.w = w; PX.h = h; try { PX.app.renderer.resize(w, h); } catch (e) { } if (PX.bgS) { PX.bgS.width = w; PX.bgS.height = h; } PX.dirty = true; if (G && UI.started) setTimeout(pxSync, 0); }
}
// ---- textures ----
async function pxTextures() {
  await Promise.all(Object.keys(ART).map(async k => { try { const im = await pxLoadImg(ART[k]); PX.img[k] = im; PX.tex[k] = PIXI.Texture.from(im); } catch (e) { } }));
  const cut = (id, name) => { const at = FA_ATLAS[id], im = PX.img[id]; if (!at || !im) return; const i = at.names.indexOf(name); if (i < 0) return; const c = at.cols, x = (i % c) * at.cw, y = Math.floor(i / c) * at.ch; PX.tex[id + ':' + name] = new PIXI.Texture({ source: PX.tex[id].source, frame: new PIXI.Rectangle(x, y, at.cw, at.ch) }); };
  for (const id of ['dice', 'tokens', 'icons']) if (FA_ATLAS[id]) for (const n of FA_ATLAS[id].names) cut(id, n);
  const mk = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); return PIXI.Texture.from(c); };
  const radial = stops => (x, w, h) => { const g = x.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); stops.forEach(s => g.addColorStop(s[0], s[1])); x.fillStyle = g; x.fillRect(0, 0, w, h); };
  PX.tex.shadow = mk(64, 64, radial([[0, 'rgba(0,0,0,.55)'], [.6, 'rgba(0,0,0,.28)'], [1, 'rgba(0,0,0,0)']]));
  PX.tex.glow = mk(64, 64, radial([[0, 'rgba(255,214,90,.95)'], [.5, 'rgba(255,190,60,.45)'], [1, 'rgba(255,170,40,0)']]));
  PX.tex.puff = mk(48, 48, radial([[0, 'rgba(255,255,255,.9)'], [.5, 'rgba(255,255,255,.45)'], [1, 'rgba(255,255,255,0)']]));
  PX.tex.violet = mk(64, 64, radial([[0, 'rgba(170,120,255,.95)'], [.5, 'rgba(140,90,230,.45)'], [1, 'rgba(120,70,220,0)']]));
}
// ---- objects ----
function pxRect(el) { const b = $('#bd').getBoundingClientRect(), r = el.getBoundingClientRect(); return { x: r.left - b.left, y: r.top - b.top, w: r.width, h: r.height }; }
const tx = n => PX.tex[n] || PIXI.Texture.EMPTY;
function pxObj(key, kind, make) { let o = PX.objs.get(key); if (!o) { o = make(); o.key = key; o.kind = kind; o.seen = 0; o.fresh = true; PX.objs.set(key, o); } else o.fresh = false; o.seen = PX.seq; return o; }
function pxSprite(layer, texName, anchor) { const s = new PIXI.Sprite(tx(texName)); s.anchor.set(anchor == null ? .5 : anchor); layer.addChild(s); return s; }
function dieTexName(dv) {
  const v = dv.textContent.trim(), c = dv.classList;
  if (c.contains('t')) return 'dice:t' + v;
  if (c.contains('k')) return 'dice:k' + Math.max(2, Math.min(5, +v || 2));
  const col = c.contains('b') ? 'b' : 'o';
  return v === '?' ? 'dice:' + col + 'b' : 'dice:' + col + (+v || 1);
}
function pxDie(key, dv, rect, ctx) {
  const o = pxObj(key, 'die', () => { const c = new PIXI.Container(), sh = new PIXI.Sprite(tx('shadow')), gl = new PIXI.Sprite(tx('glow')), sp = new PIXI.Sprite(PIXI.Texture.EMPTY); sh.anchor.set(.5); gl.anchor.set(.5); sp.anchor.set(.5); c.addChild(sh, gl, sp); PX.L.dice.addChild(c); return { c, sh, gl, sp, x: 0, y: 0, s: 1, rot: 0, sq: 0, lift: 0, a: 1 }; });
  const name = dieTexName(dv), cx = rect.x + rect.w / 2, cy = rect.y + rect.h / 2, size = Math.max(rect.w, rect.h) * (ctx.slot ? 1.0 : 1.22);
  const changed = o.name && o.name !== name && !o.fresh;
  o.name = name; o.sp.texture = tx(name); o.tx = cx; o.ty = cy; o.size = size; o.sel = ctx.sel; o.can = ctx.can; o.rrm = ctx.rrm; o.cof = ctx.cof; o.seat = ctx.seat; o.val = dv.textContent.trim(); o.col = dv.classList.contains('b') ? 'b' : dv.classList.contains('o') ? 'o' : dv.classList.contains('t') ? 't' : 'k';
  if (o.fresh) {
    o.x = cx; o.y = cy;
    if (ctx.slot) {
      // the die that left a tray flies to the slot; the partner's hidden die ('?') flies too, so their placements are seen, not just appear
      let vi = PX.vanished.findIndex(v => v.col === o.col && v.val === o.val); if (vi < 0) vi = PX.vanished.findIndex(v => v.col === o.col && v.val === '?'); const from = vi >= 0 ? PX.vanished.splice(vi, 1)[0] : null;
      if (from && ANIM && !pxRM()) { o.x = from.x; o.y = from.y; o.size0 = from.size; pxTween(o, { x: [from.x, cx], y: [from.y, cy], rot: [0, (from.x < cx ? 1 : -1) * .35 * 0], s: [1.25, 1] }, 480, 0, () => { o.sq = 1; pxLanded(o); }, true); }
      else if (ANIM) { o.sq = 0; }
    } else if (ANIM && !pxRM() && ctx.roll) {
      o.x = cx + (ctx.seat === 0 ? -1 : 1) * 40; o.y = -60 - (PX.seqRoll++ % 4) * 30; const dly = (ctx.i || 0) * 70 + (ctx.seat || 0) * 40;
      o.a = 0; pxTween(o, { x: [o.x, cx], y: [o.y, cy], rot: [(ctx.seat ? 1 : -1) * 2.6, 0], s: [1.3, 1], a: [1, 1] }, 520, dly, () => { o.sq = 1; PX.nRoll++; }, true);
    }
  } else if (changed && ANIM && !pxRM()) { pxTween(o, { rot: [0, Math.PI * 2], s: [1.35, 1] }, 420, 0, () => { o.sq = .6; }, false); }
  return o;
}
PX.seqRoll = 0;
function pxLanded(o) { PX.nLand++; if (PXQ[PX.q].fx) { for (let i = 0; i < 6; i++) pxPuff(o.tx, o.ty, i); } PX.dirty = true; }
function pxPuffs(x, y) { if (PXQ[PX.q].fx) for (let i = 0; i < 6; i++) pxPuff(x, y, i); }
function pxPuff(x, y, i) { const s = new PIXI.Sprite(tx('puff')); s.anchor.set(.5); s.x = x; s.y = y; s.alpha = .8; s.width = s.height = 16; PX.L.fx.addChild(s); const a = i / 6 * Math.PI * 2 + Math.random(); PX.parts.push({ s, vx: Math.cos(a) * 60, vy: Math.sin(a) * 60 - 20, life: .5, t: 0 }); }
function pxTween(o, props, dur, delay, done, fly) { PX.tw = PX.tw.filter(t => t.o !== o); o.fly = !!fly; PX.tw.push({ o, props, dur, delay: delay || 0, t: 0, done }); }
const ease = t => 1 - Math.pow(1 - t, 3);
// ---- sync: read the DOM after each render ----
function pxSync() {
  if (!PX.on || !PX.app) return; const pz = $('#pz'); if (!pz) return; PX.seq++; if (G && !G.result && (PX.endA || $('#bd').classList.contains('ending'))) pxClearEnd();
  const prevKeys = new Set(PX.objs.keys()); PX.vanished = [];
  const q = PXQ[PX.q];
  // window frames, sky and terrain
  const ap = FA.DATA.airports[(FA.scen(G.sid) || {}).ap] || {}, skyId = 'sky-' + (ap.tod || 'dawn'), terId = 'ter-' + (ap.ter || 'plain');
  const wa = pz.querySelector('.w.appr'), wl = pz.querySelector('.w.altw');
  if (wa) {
    const r = pxRect(wa), o = pxObj('win', 'win', () => { const c = new PIXI.Container(), sky = new PIXI.TilingSprite({ texture: tx(skyId), width: 10, height: 10 }), ter = new PIXI.TilingSprite({ texture: tx(terId), width: 10, height: 10 }), m = new PIXI.Graphics(), fr = new PIXI.NineSliceSprite({ texture: tx('frame'), leftWidth: 16, rightWidth: 16, topHeight: 16, bottomHeight: 16 }); c.addChild(sky, ter, fr); c.addChild(m); c.mask = m; fr.mask = null; PX.L.win.addChild(c); return { c, sky, ter, m, fr }; });
    if (o.skyId !== skyId) { o.skyId = skyId; o.sky.texture = tx(skyId); } if (o.terId !== terId) { o.terId = terId; o.ter.texture = tx(terId); }
    o.c.x = r.x; o.c.y = r.y; o.sky.width = r.w; o.sky.height = r.h; o.sky.tileScale.set(r.h / 192); o.ter.width = r.w; o.ter.height = r.h * .38; o.ter.y = r.h * .62; o.ter.tileScale.set(o.ter.height / 96);
    o.fr.width = r.w; o.fr.height = r.h; o.m.clear(); o.m.roundRect(0, 0, r.w, r.h, 14).fill(0xffffff); o.r = r; o.off = UI.stripOff || 0; o.dirty = 1; PX.pm.clear(); PX.pm.roundRect(r.x + 4, r.y + 4, r.w - 8, r.h - 8, 12).fill(0xffffff);
  }
  if (wl) { const r = pxRect(wl), o = pxObj('winalt', 'win2', () => { const fr = new PIXI.NineSliceSprite({ texture: tx('frame'), leftWidth: 16, rightWidth: 16, topHeight: 16, bottomHeight: 16 }); PX.L.win.addChild(fr); return { fr, c: fr }; }); o.fr.x = r.x; o.fr.y = r.y; o.fr.width = r.w; o.fr.height = r.h; }
  // planes on the approach track
  const youEl = pz.querySelector('.sp.you');
  pz.querySelectorAll('.sp').forEach((sp, si) => {
    const pl = sp.querySelectorAll('.pl'); pl.forEach((p, k) => {
      const r = pxRect(p), sz = Math.max(20, Math.min(30, r.h + 12)), cx = r.x + r.w / 2, cy = r.y + r.h / 2;
      const o = pxObj('pl:' + si + ':' + k, 'tok', () => { const s = new PIXI.Sprite(tx('tokens:plane')); s.anchor.set(.5); PX.L.plane.addChild(s); return { c: s, s0: s, x: cx, y: cy, size: sz, a: 1, s: 1, rot: 0 }; }); o.tx = cx; o.ty = cy; o.size = sz; if (o.fresh) { o.x = cx; o.y = cy; }
    });
  });
  // traffic-die icons on the approach strip (the DOM keeps the "×n" count)
  pz.querySelectorAll('.sp .tfd').forEach((e, i) => { const r = pxRect(e), sz = Math.max(14, Math.min(22, r.h + 2)); const o = pxObj('tf:' + i, 'tok', () => { const sp = new PIXI.Sprite(tx('dice:k5')); sp.anchor.set(.5); PX.L.plane.addChild(sp); return { c: sp, s0: sp, x: 0, y: 0, a: 1, s: 1, rot: 0 }; }); o.tx = r.x + r.w / 2; o.ty = r.y + r.h / 2; o.size = sz; if (o.fresh) { o.x = o.tx; o.y = o.ty; } });
  if (youEl) { const r = pxRect(youEl), sz = Math.min(r.w * .9, 58), cx = r.x + r.w / 2, cy = r.y + r.h * .5; const o = pxObj('you', 'tok', () => { const s = new PIXI.Sprite(tx('tokens:you')); s.anchor.set(.5); PX.L.plane.addChild(s); return { c: s, s0: s, x: cx, y: cy, size: sz, a: 1, s: 1, rot: 0 }; }); o.tx = cx; o.ty = cy; o.size = sz; if (o.fresh) { o.x = cx; o.y = cy; } o.bob = 1; }
  // wells under every slot, gold ring on the legal ones, switches
  const slotDice = [];
  pz.querySelectorAll('.slot').forEach(b => {
    const k = b.dataset.slot, r = pxRect(b), cls = b.classList.contains('p') ? 'wellB' : b.classList.contains('c') ? 'wellO' : 'wellN';
    const o = pxObj('well:' + k, 'well', () => { const c = new PIXI.Container(), w = pxSprite(c, 'tokens:' + cls), g = new PIXI.Sprite(tx('glow')); g.anchor.set(.5); c.addChild(g); PX.L.well.addChild(c); return { c, w, g, x: 0, y: 0, s: 1, a: 1 }; });
    o.tx = o.x = r.x + r.w / 2; o.ty = o.y = r.y + r.h / 2; o.size = r.w; o.w.width = o.w.height = r.w; o.legal = b.classList.contains('legal') && !b.classList.contains('dim') && !b.classList.contains('deadly') && !b.classList.contains('done'); o.g.width = o.g.height = r.w * 1.45;
    o.c.x = o.x; o.c.y = o.y;
    const sw = b.querySelector('.sw');
    if (sw) { const rr = pxRect(sw), on = sw.classList.contains('on'); const so = pxObj('sw:' + k, 'sw', () => { const s = new PIXI.Sprite(tx('tokens:swoff')); s.anchor.set(.5); PX.L.mark.addChild(s); return { c: s, s0: s, x: 0, y: 0, a: 1, s: 1, rot: 0, on }; }); so.tx = so.x = rr.x + rr.w / 2; so.ty = so.y = rr.y + rr.h / 2; so.size = Math.max(16, rr.w + 4); so.s0.texture = tx(on ? 'tokens:swon' : 'tokens:swoff'); if (!so.fresh && so.on !== on && ANIM) pxTween(so, { s: [1.5, 1] }, 260, 0, null, false); so.on = on; }
    const dv = b.querySelector('.dv');
    if (dv && b.classList.contains('full')) slotDice.push([k, dv, r]);
  });
  // dice in the trays
  {
    pz.querySelectorAll('.tray').forEach(tr => {
      const r = pxRect(tr), seat = tr.classList.contains('p') ? 0 : 1;
      const o = pxObj('tray' + seat, 'tray', () => { const s = new PIXI.NineSliceSprite({ texture: tx('tray'), leftWidth: 40, rightWidth: 40, topHeight: 40, bottomHeight: 40 }); PX.L.well.addChild(s); return { c: s, s0: s }; }); o.s0.x = r.x; o.s0.y = r.y; o.s0.width = r.w; o.s0.height = r.h; o.s0.tint = seat ? 0xffd9a8 : 0xb9d4ff;
    });
    pz.querySelectorAll('.die').forEach(b => {
      const s = +b.dataset.s, d = b.dataset.d, dv = b.querySelector('.dv'); if (!dv || b.classList.contains('used')) return;
      const key = 'die:' + s + ':' + d; const roll = !PX.objs.has(key) && !!(G && G.phase === 'place' && PX.rollRound !== G.round + ':' + G.sid);
      pxDie(key, dv, pxRect(b), { seat: s, i: +d || 0, can: b.classList.contains('can'), sel: b.classList.contains('sel'), rrm: b.classList.contains('rrm'), cof: dv.classList.contains('cof'), roll: roll });
    });
    if (G && G.phase === 'place' && [...PX.objs.keys()].some(k => /^die:/.test(k))) PX.rollRound = G.round + ':' + G.sid; }
  for (const k of prevKeys) { const o = PX.objs.get(k); if (o && o.seen !== PX.seq && /^die:/.test(k)) { PX.vanished.push({ col: o.col, val: o.val, x: o.x, y: o.y, size: o.size }); pxKill(k, o); } }
  for (const [k, dv, r] of slotDice) pxDie('slot:' + k, dv, r, { slot: true, seat: 0 });
  // dial, gauge, fuel, trainee tokens, coffee, rerolls
  pz.querySelectorAll('.dial').forEach((d, i) => {
    const r = pxRect(d), nd = d.querySelector('i');
    if (nd) { const o = pxObj('dial', 'dial', () => { const c = new PIXI.Container(), f = pxSprite(c, 'dial'), n = new PIXI.Graphics(); c.addChild(n); PX.L.mark.addChild(c); return { c, f, n, ang: 0, x: 0, y: 0 }; }); o.tx = o.x = r.x + r.w / 2; o.ty = o.y = r.y + r.h / 2; o.size = r.w; o.f.width = o.f.height = r.w * 1.06; o.c.x = o.x; o.c.y = o.y; const m = /rotate\((-?[\d.]+)deg/.exec(nd.style.transform || ''); o.want = m ? +m[1] : 0; if (o.fresh) o.ang = o.want; }
    else { const o = pxObj('wind', 'tok', () => { const s = new PIXI.Sprite(tx('tokens:wind')); s.anchor.set(.5); PX.L.mark.addChild(s); return { c: s, s0: s, x: 0, y: 0, a: 1, s: 1, rot: 0 }; }); o.tx = o.x = r.x + r.w / 2; o.ty = o.y = r.y + r.h / 2; o.size = r.w * 1.05; }
  });
  { const g = pz.querySelector('.gau'); if (g) { const r = pxRect(g), o = pxObj('gauge', 'gauge', () => { const c = new PIXI.Container(), f = pxSprite(c, 'gauge', 0), n = new PIXI.Graphics(), n2 = new PIXI.Graphics(); c.addChild(n, n2); PX.L.mark.addChild(c); return { c, f, n, n2, spv: 0, spw: 0, spd: -1 }; }); o.c.x = r.x; o.c.y = r.y; o.f.width = r.w; o.f.height = r.h; o.f.x = 0; o.f.y = 0; o.r = r;
    o.b = +g.dataset.b || 4; o.o = +g.dataset.o || 8; o.dirty = 1; const sp = +g.dataset.s || 0; if (sp !== o.spw) { o.spw = sp; if (ANIM && !pxRM() && !o.fresh) o.spv = 0; else o.spv = sp; } } }
  { const b = pz.querySelector('.bar'); if (b) { const r = pxRect(b), i = b.querySelector('i'), f = i ? parseFloat(i.style.width) / 100 : 0; const o = pxObj('fuel', 'bar', () => { const c = new PIXI.Container(), g = new PIXI.Graphics(), fr = new PIXI.NineSliceSprite({ texture: tx('pillbar'), leftWidth: 20, rightWidth: 20, topHeight: 12, bottomHeight: 12 }); c.addChild(g, fr); PX.L.mark.addChild(c); return { c, g, fr }; }); o.c.x = r.x; o.c.y = r.y; o.fr.width = r.w; o.fr.height = r.h; o.g.clear(); o.g.roundRect(5, 4, Math.max(2, (r.w - 10) * f), r.h - 8, (r.h - 8) / 2).fill(f < .3 ? 0xe8553a : 0x2fc4b2); } }
  pz.querySelectorAll('.chipr .tk').forEach((e, i) => { const r = pxRect(e), off = e.classList.contains('off'); const o = pxObj('cf' + i, 'tok', () => { const s = new PIXI.Sprite(tx('tokens:coffee')); s.anchor.set(.5); PX.L.mark.addChild(s); return { c: s, s0: s, x: 0, y: 0, a: 1, s: 1, rot: 0 }; }); o.tx = o.x = r.x + r.w / 2; o.ty = o.y = r.y + r.h / 2; o.size = Math.max(26, r.w * 1.5); o.a = off ? .28 : 1; });
  { const e = pz.querySelector('.badge .tk.rr'); if (e) { const r = pxRect(e); const o = pxObj('rr', 'tok', () => { const s = new PIXI.Sprite(tx('tokens:reroll')); s.anchor.set(.5); PX.L.mark.addChild(s); return { c: s, s0: s, x: 0, y: 0, a: 1, s: 1, rot: 0 }; }); o.tx = o.x = r.x + r.w / 2; o.ty = o.y = r.y + r.h / 2; o.size = Math.max(28, r.w * 1.4); } }
  pz.querySelectorAll('.tokrow .ch').forEach((e, i) => { const r = pxRect(e), v = +e.textContent || 1; const o = pxObj('tr' + i + ':' + v, 'tok', () => { const s = new PIXI.Sprite(tx('dice:t' + v)); s.anchor.set(.5); PX.L.mark.addChild(s); return { c: s, s0: s, x: 0, y: 0, a: 1, s: 1, rot: 0 }; }); o.tx = o.x = r.x + r.w / 2; o.ty = o.y = r.y + r.h / 2; o.size = Math.max(26, r.h); });
  // sweep objects not seen this sync; trays dice that vanished become fly-in candidates
  for (const k of prevKeys) { const o = PX.objs.get(k); if (!o || o.seen === PX.seq || o.dying) continue;
    if (/^pl:/.test(k) && ANIM && !pxRM() && !PX.endA) { o.dying = 1; o.seen = PX.seq; o.tx = o.x; o.ty = o.y; pxPuffs(o.x, o.y); pxTween(o, { a: [1, 0], s: [1, 2.2], rot: [0, .9] }, 650, 0, () => pxKill(k, o), false); PX.dirty = true; continue; }   // a cleared plane swells and fades out
    pxKill(k, o); }
  PX.dirty = true;
}
function pxKill(k, o) { try { o.c.destroy({ children: true }); } catch (e) { } if (o.fr && o.fr !== o.c) try { o.fr.destroy(); } catch (e) { } PX.tw = PX.tw.filter(t => t.o !== o); PX.objs.delete(k); }
// ---- the loop ----
function pxLoop() {
  const step = ts => { PX.raf = requestAnimationFrame(step); const dt = Math.min(.25, (ts - (PX.last || ts)) / 1000); PX.last = ts; if (PX.on) pxTick(dt); }; PX.raf = requestAnimationFrame(step);
}
function pxMoving() { return PX.tw.length > 0 || PX.parts.length > 0 || !!PX.endA || [...PX.objs.values()].some(o => o.legal || o.can || o.bob || (o.size && o.tx != null && (Math.abs((o.x || 0) - o.tx) > .4 || Math.abs((o.y || 0) - o.ty) > .4)) || (o.want != null && Math.abs(o.ang - o.want) > .2)); }
function pxTick(dt) {
  PX.t += dt; const q = PXQ[PX.q], kf = 1 - Math.pow(.0005, dt), snap = !ANIM || pxRM();
  // tweens
  for (const t of PX.tw.slice()) {
    t.t += dt * 1000; if (t.t < t.delay) continue; const p = Math.min(1, (t.t - t.delay) / t.dur), e = ease(p);
    for (const k in t.props) { const [a, b] = t.props[k]; t.o[k] = a + (b - a) * e; }
    if (t.props.y && t.o.fly) t.o.y -= Math.sin(p * Math.PI) * 38;
    if (p >= 1) { t.o.fly = false; PX.tw.splice(PX.tw.indexOf(t), 1); if (t.done) t.done(); }
  }
  let any = PX.tw.length > 0;
  for (const o of PX.objs.values()) {
    if (o.kind === 'die') {
      const flying = PX.tw.some(t => t.o === o);
      if (!flying) { o.x += (o.tx - o.x) * kf; o.y += (o.ty - o.y) * kf; if (Math.abs(o.x - o.tx) > .4 || Math.abs(o.y - o.ty) > .4) any = true; else { o.x = o.tx; o.y = o.ty; } }
      const c = o.c; c.x = o.x; c.y = o.y; c.rotation = o.rot || 0; c.alpha = Math.max(0, o.a == null ? 1 : o.a);
      const lift = (o.sel ? 1 : 0); o.lift += (lift - o.lift) * Math.min(1, kf * 1.4); if (Math.abs(lift - o.lift) > .01) any = true;
      o.sq += (0 - o.sq) * kf * .7; if (o.sq > .02) any = true;
      const sc = (o.s || 1) * (1 + o.lift * .1), sz = o.size * sc;
      o.sp.width = sz * (1 + o.sq * .18); o.sp.height = sz * (1 - o.sq * .16); o.sp.y = -o.lift * o.size * .12;
      o.sh.width = sz * 1.2; o.sh.height = sz * 1.0; o.sh.x = 2; o.sh.y = sz * .14 + o.lift * 6; o.sh.alpha = .55;
      o.gl.width = o.gl.height = sz * 1.35; o.gl.texture = o.rrm ? tx('violet') : tx('glow'); o.gl.alpha = (o.sel || o.rrm) ? (.4 + (q.fx ? .2 * Math.sin(PX.t * 5) : 0)) : o.can ? (.28 + (q.fx ? .22 * Math.sin(PX.t * 4) : 0)) : (o.cof ? .3 : 0); if (o.sel || o.rrm || o.can) any = true;
    } else if (o.kind === 'well') {
      o.g.alpha = o.legal ? (q.fx ? .55 + .3 * Math.sin(PX.t * 5) : .65) : 0; if (o.legal) any = true;
    } else if (o.kind === 'tok' || o.kind === 'sw') {
      if (!snap) { o.x += (o.tx - o.x) * kf; o.y += (o.ty - o.y) * kf; } else { o.x = o.tx; o.y = o.ty; } if (Math.abs(o.x - o.tx) > .4 || Math.abs(o.y - o.ty) > .4) any = true;
      const bob = o.bob && q.fx ? Math.sin(PX.t * 2.2) * 2.5 : 0; if (o.bob && q.fx) any = true;
      o.c.x = o.x; o.c.y = o.y + bob; o.c.width = o.c.height = o.size * (o.s || 1); o.c.alpha = o.a == null ? 1 : o.a; o.c.rotation = o.rot || 0;
    } else if (o.kind === 'dial') {
      o.ang += (o.want - o.ang) * (snap ? 1 : kf * .7); if (Math.abs(o.want - o.ang) > .1) any = true; else o.ang = o.want;
      const r = o.size * .4, a = (o.ang - 90) * Math.PI / 180; o.n.clear(); o.n.moveTo(0, 0).lineTo(Math.cos(a) * r, Math.sin(a) * r).stroke({ width: Math.max(3, o.size * .03), color: 0xffe08a, cap: 'round' }); o.n.circle(0, 0, o.size * .04).fill(0xffe08a);
      // horizon tilt: rotate the whole face a little so the art shows the bank
      o.f.rotation = o.ang * Math.PI / 180 * .5;
    } else if (o.kind === 'gauge') {
      if (Math.abs(o.spw - o.spv) > .02) { o.spv += (o.spw - o.spv) * (snap ? 1 : kf * .32); any = true; } else o.spv = o.spw;
      if (o.spd !== o.spv && o.r) { o.spd = o.spv; const r = o.r, cx = r.w / 2, cy = r.h - 8, R = Math.min(r.w * .46, r.h * .9), a = Math.PI * (1 - Math.max(0, Math.min(12, o.spv)) / 12); o.n2.clear(); if (o.spw > 0) { o.n2.moveTo(cx, cy).lineTo(cx + Math.cos(a) * R * .96, cy - Math.sin(a) * R * .96).stroke({ width: 4, color: 0xffffff, cap: 'round' }); o.n2.circle(cx, cy, 4).fill(0xffffff); } }
      if (!o.dirty) continue;
      o.dirty = 0; const r = o.r, cx = r.w / 2, cy = r.h - 8, R = Math.min(r.w * .46, r.h * .9); o.n.clear();
      const ang = v => Math.PI * (1 - Math.max(0, Math.min(12, v)) / 12);
      for (let v = 0; v <= 12; v++) { const a = ang(v), l = v % 4 === 0 ? .14 : .08; o.n.moveTo(cx + Math.cos(a) * R * (1 - l), cy - Math.sin(a) * R * (1 - l)).lineTo(cx + Math.cos(a) * R, cy - Math.sin(a) * R).stroke({ width: 2, color: 0xcfd8e0, alpha: .8 }); }
      for (const [v, col] of [[o.b, 0x4a86e8], [o.o, 0xf29a3e]]) { const a = ang(v); o.n.moveTo(cx, cy).lineTo(cx + Math.cos(a) * R * .9, cy - Math.sin(a) * R * .9).stroke({ width: 5, color: col, cap: 'round' }); }
      o.n.circle(cx, cy, 6).fill(0xe9eef2);
    } else if (o.kind === 'win') {
      const r = o.r; if (r) { const sc = (UI.cw || 80); o.sky.tilePosition.x = (o.off || 0) * .25; o.ter.tilePosition.x = (o.off || 0) * .6; }
    }
  }
  // particles
  for (const p of PX.parts.slice()) { p.t += dt; p.s.x += p.vx * dt; p.s.y += p.vy * dt; p.s.alpha = Math.max(0, .8 * (1 - p.t / p.life)); if (p.t >= p.life) { p.s.destroy(); PX.parts.splice(PX.parts.indexOf(p), 1); } }
  if (PX.parts.length) any = true;
  if (PX.endA) { pxEndTick(dt); any = true; }
  if (any || PX.dirty || (window.PerfHUD && PerfHUD.testing)) { PX.dirty = false; try { PX.app.renderer.render(PX.app.stage); PX.frames++; } catch (e) { pxOff('render: ' + (e && e.message)); } }
}
// ---- the ending: landing / crash ----
function pxEnd(win, cb) {
  if (!PX.on || pxRM()) { setTimeout(cb, 400); return; }
  try {
    const L = PX.L.end, W = PX.w, H = PX.h; L.removeChildren(); $('#bd').classList.add('ending');
    const bgT = tx(win ? 'end-land' : 'end-crash'), bg = new PIXI.Sprite(bgT); const sc = Math.max(W / bgT.width, H / bgT.height); bg.scale.set(sc); bg.x = (W - bgT.width * sc) / 2; bg.y = (H - bgT.height * sc) / 2; bg.alpha = 0;
    const plane = new PIXI.Sprite(tx(win ? 'planegear' : 'planeside')); plane.anchor.set(.5); const pw = Math.min(W * .5, 420); plane.width = pw; plane.height = pw * .39;
    const flash = new PIXI.Graphics(); flash.rect(0, 0, W, H).fill(0xff3322); flash.alpha = 0;
    L.addChild(bg, plane, flash); PX.endA = { t: 0, win, cb, bg, plane, flash, W, H, done: false };
  } catch (e) { setTimeout(cb, 300); }
}
function pxEndTick(dt) {
  const a = PX.endA; a.t += dt; const t = a.t, W = a.W, H = a.H;
  a.bg.alpha = Math.min(1, t / .6);
  if (a.win) { const p = Math.min(1, Math.max(0, (t - .3) / 2.2)), e = ease(p); a.plane.x = W * (.18 + .55 * e); a.plane.y = H * (.22 + .5 * e); a.plane.rotation = -.12 * (1 - e) + .02; a.plane.scale.x = a.plane.scale.y = Math.abs(a.plane.scale.x) * 1; a.plane.alpha = 1 - Math.max(0, (t - 2.3) / .5) * 0; if (t > 3.0 && !a.done) { a.done = true; PX.endA = null; a.cb(); } }   // the picture stays until the next flight (pxClearEnd)
  else { const p = Math.min(1, Math.max(0, (t - .3) / 1.4)), e = p * p; a.plane.x = W * (.2 + .45 * p); a.plane.y = H * (.2 + .55 * e); a.plane.rotation = .1 + .9 * e; a.flash.alpha = t > 1.7 ? Math.max(0, .6 - (t - 1.7) * 1.2) : 0; if (t > 1.7 && q_fx()) { PX.L.end.x = (Math.random() - .5) * 8 * Math.max(0, 1 - (t - 1.7)); PX.L.end.y = (Math.random() - .5) * 8 * Math.max(0, 1 - (t - 1.7)); } if (t > 3.0 && !a.done) { a.done = true; PX.endA = null; PX.L.end.x = PX.L.end.y = 0; a.cb(); } }
}
const q_fx = () => PXQ[PX.q].fx > 0;
function pxClearEnd() { PX.endA = null; try { $('#bd').classList.remove('ending'); } catch (e) { } try { PX.L.end.removeChildren(); PX.L.end.x = PX.L.end.y = 0; } catch (e) { } }
// ---- PerfHUD ----
function pxPerfReg() {
  try {
    if (!window.PerfHUD || !PerfHUD.register) return;
    const shim = PX.on ? { getPixelRatio: () => PX.res, setPixelRatio: v => pxSetRes(v), get domElement() { return PX.cv; }, getContext: () => PX.app && PX.app.renderer && PX.app.renderer.gl || null } : null;
    PerfHUD.register({ game: 'Final Approach', anchor: '.gx-board', corner: 'tl', renderer: shim, levels: ['high', 'medium', 'low'],
      getLevel: () => PX.q, isAuto: () => gfxPref() === 'auto',
      setLevel: (l, why) => { if (why === 'apply') setGfx(l); else { PX.autoQ = l; pxApplyQ(); } try { if (GX.open === 'setd') renderMenu(); } catch (e) { } },
      basePR: () => { const d = window.devicePixelRatio || 1; return Math.min((PXQ[PX.q] || PXQ.high).pr, d); }, onPixelRatio: v => pxSetRes(v),
      isAnimating: () => !!UI.busy || PX.tw.length > 0 || PX.parts.length > 0 || !!PX.endA, idleMode: PX.on ? 'throttle' : 'demand', idleFps: 10 });
  } catch (e) { }
}
function pxPainted() { try { const c = PX.app.renderer.extract.canvas({ target: PX.app.stage, resolution: .25 }); const x = c.getContext('2d'), d = x.getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 20) n++; return +(n / (d.length / 4)).toFixed(3); } catch (e) { return -1; } }
PX.state = () => ({ on: PX.on, kind: PX.kind, q: PX.q, res: PX.res, frames: PX.frames, err: PX.err, tweens: PX.tw.length, parts: PX.parts.length, moving: pxMoving(), nLand: PX.nLand, nRoll: PX.nRoll, ending: !!PX.endA, canvasOK: pxPainted(),
  objs: [...PX.objs.values()].map(o => ({ key: o.key, kind: o.kind, x: Math.round(o.x || 0), y: Math.round(o.y || 0), name: o.name || null })), dice: [...PX.objs.values()].filter(o => o.kind === 'die').map(o => ({ key: o.key, val: o.val, x: Math.round(o.x), y: Math.round(o.y) })) });
// ===================== part 8: board-first layer (one short line, round animation, drag a die onto a space, ghost finger) =====================
// The board is the screen. The dock holds a thin goal strip, ONE line of at most 8 words, and one row of buttons. Explanations, the log and the phrases live in the drawers.
function phPrompt() {
  if (!G) return '';
  if (G.result) return endWords();
  const v = actSeat(), pend = FA.pending(G), mine = typeof v === 'number' && v >= 0 && mayAct(v);
  if (G.phase === 'brief') return mine ? (G.ready[v] ? 'Waiting for your crewmate.' : 'Tap Roll to start.') : 'Crew getting ready.';
  if (G.pend) {
    const p = G.pend, me = mine && pend.includes(v);
    if (p.h === 'rr') return me && !p.d.m[v] ? 'Tap dice to reroll, or keep.' : 'Waiting for the reroll.';
    if (p.h === 'intern') return me && v === p.d.seat ? 'Tap the token, then a space.' : 'Trainee token being placed.';
    if (p.h === 'sync') return me && v === 1 ? 'Place the cross-check die.' : 'Cross-check die being placed.';
    if (p.h === 'wt') return me && v === 1 - p.d.a ? 'Pick one die to swap.' : 'Waiting for the hand-over.';
  }
  if (mine && G.turn === v) { const mi = mandInfo(v); if (mi && mi.lost) return 'Too few dice left!'; if (mi && mi.tight && (UI.sel === -1 || UI.sel == null)) return 'Save a die for Axis and Engines.'; return UI.sel === -1 || UI.sel == null ? 'Drag a die onto a space.' : 'Drop it on a glowing space.'; }
  if (v === 'all') return name(G.turn) + ' is placing.';
  return name(G.turn) + ' is placing...';
}
// the thin goal / race strip
function goalStrip() {
  const size = trackOf().sp.length, pos = G.pl.pos, last = D.rounds - G.row0, fin = FA.isFinal(G), need = size - pos;
  const t = fin ? 'Landing round · speed ≤ brakes ' + FA.brakeVal(G) : pos >= size ? 'At the airport · hold to round ' + last : 'Land by round ' + last + ' · ' + need + ' to go';
  return h('button.goalb.gstrip', { type: 'button', 'data-a': 'goalopen', 'aria-label': t + '. Tap for the full goal and checklist.' }, h('span', t), h('i.gi', { 'aria-hidden': 'true' }, 'i'));
}
// ---------- the overlay layer: round animation, ghost finger, dragged die ----------
function fxLayer() { const bd = $('#bd'); if (!bd) return null; let f = $('#fx'); if (!f) { f = h('div#fx', { 'aria-hidden': 'true' }); bd.appendChild(f); } return f; }
const bdRect = () => $('#bd').getBoundingClientRect();
function relRect(el) { if (!el) return null; const b = bdRect(), r = el.getBoundingClientRect(); return { x: r.left - b.left, y: r.top - b.top, w: r.width, h: r.height, cx: r.left - b.left + r.width / 2, cy: r.top - b.top + r.height / 2 }; }
function fxPop(x, y, txt, cls, delay) {
  const f = fxLayer(); if (!f) return; const e = h('div.pop' + (cls ? '.' + cls : ''), { style: 'left:' + Math.round(x) + 'px;top:' + Math.round(y) + 'px;animation-delay:' + (delay || 0) + 'ms' }, txt);
  f.appendChild(e); setTimeout(() => { try { e.remove(); } catch (er) { } }, 2400 + (delay || 0));
}
// the plane flies from space a to space b of the approach strip
function fxPlane(a, b) {
  const f = fxLayer(), LY = UI.LY; if (!f || !LY || a === b || !UI.cw) return; const ap = LY.r.appr, cw = UI.cw, off = UI.stripOff || 0;
  const px = i => ap.x + 2 + off + (i - .5) * cw, y = ap.y + ap.h * .42, ax = Math.max(ap.x + 8, Math.min(ap.x + ap.w - 8, px(a))), bx = Math.max(ap.x + 8, Math.min(ap.x + ap.w - 8, px(b)));
  const e = h('div.fxplane', { style: 'left:' + Math.round(ax) + 'px;top:' + Math.round(y) + 'px;--dx:' + Math.round(bx - ax) + 'px', html: PLANE_SVG.replace('width="12" height="12"', 'width="34" height="34"') });
  f.appendChild(e); setTimeout(() => { try { e.remove(); } catch (er) { } }, 1500);
}
// ---------- results on the board: every change shows where it happens (needle, tilt, plane, coffee, altitude); no report card ----------
const LOSS_S = { mandatory: 'Empty Axis or Engines', spin: 'Spin! The tilt was too big', collision: 'Collided with a plane', overshoot: 'Overshot the airport', corridor: 'Axis outside the corridor', fuel: 'Out of fuel', short: 'Missed the airport', timeout: 'Out of time' };
const CHK_S = { speed: 'Too fast to stop', planes: 'Planes still on the track', gear: 'Landing gear still up', flaps: 'Flaps not out', axis: 'Not level at landing', intern: 'Trainee not trained', ice: 'Icy brakes unfinished' };
function endWords() {
  const R = G.result; if (!R) return ''; if (R.win) return 'Landed! Well flown.';
  if (R.why === 'checks' || R.why === 'speed') { const bad = Object.keys(R.checks || {}).filter(k => !R.checks[k]); if (bad.length) return CHK_S[bad[0]] || 'The landing failed'; }
  return LOSS_S[R.why] || 'The flight is over';
}
function engineEv() { if (!G || !G.events) return null; for (let i = G.events.length - 1; i >= 0; i--) if (G.events[i].t === 'engine') return G.events[i]; return null; }
// called from render(): compares the engine's numbers with the last picture and pops what changed on the part that changed
function resultFx(r) {
  const e = engineEv(), k = G.sid + ':' + G.seed + ':' + (UI.mode || ''), cur = { k, axis: G.pl.axis, n: e ? e.n : 0, planes: FA.planesOnTrack(G) };
  UI.gSpd = e ? e.s : 0; const was = UI.rfx; UI.rfx = cur;
  if (!was || was.k !== k || !ANIM || !r) return;
  if (cur.axis !== was.axis && r.dial) fxPop(r.dial.x + r.dial.w / 2, r.dial.y + r.dial.h * .08, cur.axis === 0 ? 'level' : 'tilt ' + Math.abs(cur.axis) + (cur.axis < 0 ? ' left' : ' right'), 'tilt', 80);
  if (e && cur.n !== was.n && r.gauge) fxPop(r.gauge.x + r.gauge.w / 2, r.gauge.y - 6, e.final ? 'landing speed ' + e.s : 'speed ' + e.s + (e.adv ? ' · +' + e.adv : ' · hold'), 'spd', 200);
  if (cur.planes < was.planes && r.appr) fxPop(r.appr.x + r.appr.w * .5, r.appr.y + r.appr.h * .3, cur.planes === 0 ? 'track clear' : '− plane', 'rad', 150);
}
// the round just ended: the plane flies, coffee pops where it was earned, the altitude window announces the new height
function roundFx(r, info) {
  if (!G || G.result || !ANIM) return;
  const rows = altRows(), N = rows[G.round + G.row0], cr = UI.LY && UI.LY.r;
  if (info.axis !== G.pl.axis) { UI.axA = { from: info.axis, to: G.pl.axis, t0: Date.now() }; setTimeout(() => { if (UI.axA && Date.now() - UI.axA.t0 >= 900) UI.axA = null; }, 1000); }
  if (info.pos !== G.pl.pos) setTimeout(() => fxPlane(info.pos, G.pl.pos), 350);
  if (info.coffee < G.coffee || info.coffeeLines) { const n = Math.max(1, info.coffeeLines || (G.coffee - info.coffee)), ks = (info.slots || []).filter(k => /^co/.test(k)); for (let i = 0; i < n; i++) { const q = ks.length && cr && cr[ks[Math.min(i, ks.length - 1)]] ? cr[ks[Math.min(i, ks.length - 1)]] : (cr && cr.coffee); if (q) fxPop(q.x + q.w / 2 + (ks.length ? 0 : (i - (n - 1) / 2) * 40), q.y - 4, '+1 ☕', 'cof', 150 + i * 200); } }
  if (N && cr && cr.alt) fxPop(cr.alt.x + cr.alt.w * .5, cr.alt.y + 2, N[0] + ' ft', 'alt', 900);
}
// ---------- ghost finger: one hand shows the first move (die, then the space) while hints are on ----------
// the ghost finger shows the move on the first round of a first flight (and on the guided flight), later only after the Hint button
function hintsOn() { return !!G && !G.result && (!!UI.hint || UI.mode === 'guided' || (UI.camp ? !!UI.camp.hints : !Object.keys(UI.won || {}).length && G.round < 1)); }
function ghostPlan() {
  const v = actSeat(); if (!hintsOn() || typeof v !== 'number' || v < 0 || !mayAct(v) || G.phase !== 'place' || G.pend || G.turn !== v || UI.dragging) return null;
  const key = G.sid + ':' + G.seed + ':' + G.round + ':' + Object.keys(G.slots).length + ':' + (UI.mode || '');
  if (UI.gk !== key) { UI.gk = key; UI.gm = null; try { const m = FA.AI.move(G, v, 'normal', { noMC: true }); if (m && m.t === 'place' && typeof m.d === 'number') UI.gm = m; } catch (e) { } }
  return UI.gm && !G.dice[v][UI.gm.d].u ? { v, m: UI.gm } : null;
}
function drawGhost() {
  const f = fxLayer(); if (!f) return; $$('#fx .gh').forEach(e => e.remove());
  const p = ghostPlan(); if (!p) return; const sel = UI.sel;
  const die = relRect($('#pz .die[data-s="' + p.v + '"][data-d="' + p.m.d + '"]')), slot = relRect($('#pz .slot[data-slot="' + p.m.to + '"]'));
  if (!die) return;
  const hand = '<svg viewBox="0 0 32 32" width="44" height="44"><path d="M12 3a2.5 2.5 0 0 1 5 0v10l2-.6a2.4 2.4 0 0 1 3 1.5l.3.9 1.6-.2a2.3 2.3 0 0 1 2.6 2l.5 5.2c.3 3.3-2.2 6.2-5.5 6.2h-4.6a5.5 5.5 0 0 1-4.4-2.2L7 20.3a2.2 2.2 0 0 1 3.4-2.8L12 19.2z" fill="#fff" stroke="#14202c" stroke-width="1.6" stroke-linejoin="round"/></svg>';
  if (sel === p.m.d && slot) f.appendChild(h('div.gh.go', { style: 'left:' + Math.round(die.cx) + 'px;top:' + Math.round(die.cy) + 'px;--dx:' + Math.round(slot.cx - die.cx) + 'px;--dy:' + Math.round(slot.cy - die.cy) + 'px', html: hand }));
  else if (sel === -1 || sel == null) f.appendChild(h('div.gh.tap', { style: 'left:' + Math.round(die.cx) + 'px;top:' + Math.round(die.cy) + 'px', html: hand }));
}
// ---------- drag a die onto a space ----------
(function () {
  let dr = null;
  const ghostDie = d => { const f = fxLayer(), s = +d.dataset.s, e = h('div.gdie.' + (s ? 'o' : 'b'), { style: 'width:' + Math.round(d.getBoundingClientRect().width * 1.05) + 'px;height:' + Math.round(d.getBoundingClientRect().width * 1.05) + 'px' }, (d.querySelector('.dv') || {}).textContent || ''); f.appendChild(e); return e; };
  const at = (x, y) => { const e = document.elementFromPoint(x, y); return e && e.closest ? e.closest('.slot') : null; };
  const place = (e, x, y) => { const b = bdRect(); e.style.left = Math.round(x - b.left) + 'px'; e.style.top = Math.round(y - b.top - 26) + 'px'; };
  document.addEventListener('pointerdown', ev => {
    if (dr || !G || !UI.started || (ev.pointerType === 'mouse' && ev.button !== 0)) return; const d = ev.target.closest && ev.target.closest('#pz .die:not(.used):not(.cover)'); if (!d) return;
    dr = { el: d, s: +d.dataset.s, d: d.dataset.d === 'p' ? 'p' : +d.dataset.d, x: ev.clientX, y: ev.clientY, on: false, g: null, id: ev.pointerId };
  }, true);
  window.addEventListener('pointermove', ev => {
    if (!dr || ev.pointerId !== dr.id) return;
    if (!dr.on) { if (Math.hypot(ev.clientX - dr.x, ev.clientY - dr.y) < 9) return; dr.on = true; UI.dragging = true; UI.dragged = Date.now();
      if (UI.sel !== dr.d) dieTap(dr.s, dr.d);   // picking it up selects it: the legal spaces glow
      if (UI.sel !== dr.d) { dr = null; UI.dragging = false; return; }
      const nd = $('#pz .die[data-s="' + dr.s + '"][data-d="' + dr.d + '"]'); if (nd) { dr.el = nd; nd.classList.add('drag'); } dr.g = ghostDie(dr.el); $$('#fx .gh').forEach(e => e.remove()); }
    if (dr.g) { place(dr.g, ev.clientX, ev.clientY); const s = at(ev.clientX, ev.clientY); $$('#pz .slot.over').forEach(e => { if (e !== s) e.classList.remove('over'); }); if (s && s.classList.contains('legal')) s.classList.add('over'); }
  }, true);
  const end = ev => {
    if (!dr || ev.pointerId !== dr.id) return; const o = dr; dr = null; if (!o.on) return;
    UI.dragging = false; if (o.g) o.g.remove(); $$('#pz .slot.over,#pz .die.drag').forEach(e => e.classList.remove('over', 'drag'));
    if (ev.type === 'pointerup') { const s = at(ev.clientX, ev.clientY); if (s && s.dataset.slot) { slotTap(s.dataset.slot); return; } }
    render();
  };
  window.addEventListener('pointerup', end, true); window.addEventListener('pointercancel', end, true);
  // a drag ends with a click on the die: swallow that one so it does not un-select the die
  document.addEventListener('click', ev => { if (UI.dragged && Date.now() - UI.dragged < 400 && ev.target.closest && ev.target.closest('#pz .die')) { ev.stopPropagation(); ev.preventDefault(); UI.dragged = 0; } }, true);
})();
// ---------- post-render hook (called at the end of render) ----------
function phPost() {
  const R = document.documentElement.classList; if (!G) return;
  fxLayer(); drawGhost();
  const ac = $('#acts'), si = $('#selinfo');
  if (isPh() && ac && si) { const cof = si.querySelector('.cof'); if (cof) ac.insertBefore(cof, ac.firstChild); }
  if (GX && (GX.open === 'crewd' || GX.open === 'logd')) { try { renderDrawers(); } catch (e) { } }
  R.toggle('fabrief', G.phase === 'brief' && !G.result);
  try { hlpAfter(); } catch (e) { console.error(e); }
}

// ---------- the ending, on the board: the picture plus at most 8 words; tap the banner to look at the panel ----------
function showEndBoard() {
  const f = fxLayer(); if (!f || !G || !G.result) return; try { render(); } catch (e) { }   // the Fly again / Next airport buttons come with the banner
  $$('#fx .endb').forEach(e => e.remove());
  f.appendChild(h('button.endb.' + (G.result.win ? 'win' : 'lose'), { type: 'button', 'data-a': 'lookpanel', 'aria-label': endWords() + '. Tap to look at the panel.' }, h('b', endWords())));
}
function lookPanel() { if (typeof pxClearEnd === 'function') pxClearEnd(); const b = $('#fx .endb'); if (b) b.classList.add('small'); render(); }
// ===================== part 9: Story mode (campaign.json + the shared chapter kit gx-campaign.js) =====================
// Each chapter is one airport with its own crew line-up and (at most) one twist. Twists exist only here; the normal rules never change.
// aiLevel is the co-pilot's skill (a sharper Ravi makes the landing EASIER), see CAMPAIGN-DESIGN.md.
UI.camp = null;
const CAMP_SEATS = () => [{ name: 'You', me: true }, { name: 'Ravi', ai: (UI.camp && UI.camp.opponent && UI.camp.opponent.aiLevel) || 'normal' }];
// applied right after FA.newGame (called from newGame in ui3.js)
function campTwist(g, t) {
  if (!t || !t.id) return; const n = +t.param || 0;
  switch (t.id) {
    case 'extra-plane': { const at = Math.min(3, g.planes.length - 1) - 1; if (at >= 0 && FA.planesOnTrack(g) + n <= D.planeSupply) g.planes[at] += n; break; }
    case 'short-fuel': if (g.mods.kero || g.mods.leak) g.pl.kero = D.keroStart - n; break;
    case 'red-altitude': g.alt = 'rb'; break;
    case 'held-reroll': g.rrHand = Math.max(0, g.rrHand - n); break;
    case 'tilted-start': g.pl.axis = n; break;
    case 'spare-coffee': g.coffee = Math.min(D.coffeeMax, n); break;
  }
}
function campWon(g) { return !!(g && g.result && g.result.win); }
function campMetrics(g) {
  const u = g.used || {};
  return { won: campWon(g), coffee: g.coffee, rerolls: g.rrHand, fuel: g.pl.kero, coffeeSpent: u.coffeeSpend || 0, radio: u.radioClear || 0, brakeMargin: g.landSpeed >= 0 ? FA.brakeVal(g) - g.landSpeed : 0 };
}
function campStart(def) {
  const s = def.setup || {}; UI.seed = s.seed != null ? s.seed : null;
  closeRS(); try { GX.close(); } catch (e) { }
  newGame('vs', { scenario: s.scenario || 'g1', role: s.role || 0, level: (def.opponent && def.opponent.aiLevel) || 'normal', abil: [], camp: def, tipsOff: !def.hints });
  UI.camp = def; UI.coach.level = def.hints ? 'full' : 'off';
  try { toast(def.goal.text.length > 70 ? def.goal.text.slice(0, 67) + '...' : def.goal.text); } catch (e) { }
}
function campFinish() { try { GXC.finish(G); } catch (e) { console.error(e); } }
function campOpen() { if (typeof GXC === 'undefined') return; closeRS(); GXC.open(); }
function campOn() { return !!(UI.camp && typeof GXC !== 'undefined' && GXC.active()); }
{ const _ng = newGame; newGame = function (mode, o) { if (!(o && o.camp)) UI.camp = null; return _ng.apply(this, arguments); }; }
function campLine() {
  try {
    if (typeof GXC === 'undefined' || !window.CAMPAIGN) return 'Ten airports, three bosses';
    const p = GXC.progress(), ch = window.CAMPAIGN.chapters, n = ch.filter(c => p.ch[c.id] && p.ch[c.id].beaten).length;
    return n ? n + ' of ' + ch.length + ' airports done' : 'Ten airports, three bosses';
  } catch (e) { return 'Ten airports, three bosses'; }
}
function campInit() {
  if (typeof GXC === 'undefined' || !window.CAMPAIGN) return;
  GXC.init({
    game: 'approach', data: window.CAMPAIGN, startChapter: campStart, isWon: g => campWon(g), metrics: campMetrics,
    onExit: () => { UI.camp = null; showStart(); },
    scores: g => [campWon(g) ? 1 : 0, 0], seats: () => CAMP_SEATS()
  });
}
campInit();
// ===================== part 10: help (gx-help kit): coach bubbles the first time, the lightbulb on demand, rules cards =====================
// Bubbles: once per phase, short, pointing at the panel. The bulb: the computer crew's own move (FA.AI.move, the same one the ghost finger uses) + a short why + rules cards.
// ---------------------------------------------------------------- pictures for the rules cards (inline SVG in the cockpit's colours)
const hB = '#2f6fd0', hO = '#e8821f', hK = '#14202c', hG = '#f2b92c', hC = '#fff4dc';
const HP = {
  plane: () => '<svg viewBox="0 0 64 64"><path d="M32 6l5 20 21 12v6l-21-4 0 12 6 5v4l-11-3-11 3v-4l6-5V40l-21 4v-6l21-12z" fill="#e8f0f6" stroke="' + hK + '" stroke-width="2.5" stroke-linejoin="round"/></svg>',
  strip: () => '<svg viewBox="0 0 64 64"><rect x="3" y="20" width="58" height="24" rx="5" fill="#2c3e4c" stroke="' + hK + '" stroke-width="2.5"/><path d="M22 20v24M42 20v24" stroke="#8f9daa" stroke-width="2"/><path d="M10 32l5-2v4zM29 28l3 4-3 4-3-4zM48 28l3 4-3 4-3-4z" fill="' + hC + '"/><rect x="47" y="14" width="12" height="6" rx="2" fill="' + hG + '"/></svg>',
  air: () => '<svg viewBox="0 0 64 64"><rect x="4" y="38" width="56" height="14" rx="3" fill="#44525e" stroke="' + hK + '" stroke-width="2.5"/><path d="M12 45h8M28 45h8M44 45h8" stroke="#fff" stroke-width="3" stroke-linecap="round"/><path d="M26 12l3 10 11 6v3l-11-2v6l3 2v2l-6-1.500-6 1.500v-2l3-2v-6l-11 2v-3l11-6z" fill="#e8f0f6" stroke="' + hK + '" stroke-width="2" stroke-linejoin="round" transform="translate(4 0) scale(.9)"/></svg>',
  die: (n, c) => '<svg viewBox="0 0 64 64"><rect x="10" y="10" width="44" height="44" rx="9" fill="' + (c === 'o' ? hO : hB) + '" stroke="' + hK + '" stroke-width="3"/><text x="32" y="43" text-anchor="middle" font-size="30" font-weight="800" fill="#fff" font-family="Arial,sans-serif">' + (n == null ? '?' : n) + '</text></svg>',
  dice2: () => '<svg viewBox="0 0 64 64"><rect x="4" y="16" width="30" height="30" rx="7" fill="' + hB + '" stroke="' + hK + '" stroke-width="2.5"/><rect x="32" y="22" width="28" height="28" rx="7" fill="' + hO + '" stroke="' + hK + '" stroke-width="2.5"/><circle cx="14" cy="26" r="2.500" fill="#fff"/><circle cx="24" cy="36" r="2.500" fill="#fff"/><circle cx="42" cy="32" r="2.500" fill="#fff"/><circle cx="50" cy="40" r="2.500" fill="#fff"/><circle cx="50" cy="32" r="2.500" fill="#fff"/><circle cx="42" cy="40" r="2.500" fill="#fff"/></svg>',
  speech: () => '<svg viewBox="0 0 64 64"><path d="M8 12h48a4 4 0 0 1 4 4v24a4 4 0 0 1-4 4H30l-12 12V44H8a4 4 0 0 1-4-4V16a4 4 0 0 1 4-4z" fill="' + hC + '" stroke="' + hK + '" stroke-width="3" stroke-linejoin="round"/><path d="M14 24h36M14 33h22" stroke="' + hB + '" stroke-width="4" stroke-linecap="round"/></svg>',
  mute: () => '<svg viewBox="0 0 64 64"><path d="M8 12h48a4 4 0 0 1 4 4v24a4 4 0 0 1-4 4H30l-12 12V44H8a4 4 0 0 1-4-4V16a4 4 0 0 1 4-4z" fill="' + hC + '" stroke="' + hK + '" stroke-width="3" stroke-linejoin="round"/><path d="M16 38L48 18M16 18l32 20" stroke="#d8402c" stroke-width="5" stroke-linecap="round"/></svg>',
  seatP: () => '<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="24" fill="' + hB + '" stroke="#fff" stroke-width="3"/><text x="32" y="43" text-anchor="middle" font-size="30" font-weight="800" fill="#fff" font-family="Arial,sans-serif">P</text></svg>',
  seatC: () => '<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="24" fill="' + hO + '" stroke="#fff" stroke-width="3"/><text x="32" y="43" text-anchor="middle" font-size="30" font-weight="800" fill="#fff" font-family="Arial,sans-serif">C</text></svg>',
  alt: () => '<svg viewBox="0 0 64 64"><rect x="6" y="6" width="52" height="11" rx="4" fill="' + hB + '"/><rect x="6" y="20" width="52" height="11" rx="4" fill="' + hO + '"/><rect x="6" y="34" width="52" height="11" rx="4" fill="' + hB + '"/><circle cx="50" cy="26" r="4" fill="#9a4fe0" stroke="#fff" stroke-width="1.500"/><path d="M12 52h40" stroke="' + hG + '" stroke-width="3" stroke-dasharray="4 4"/><path d="M32 60l-5-6h10z" fill="' + hG + '"/></svg>',
  axis: (tilt) => '<svg viewBox="0 0 64 64"><g transform="rotate(' + (tilt || 0) + ' 32 24)"><path d="M6 24h52" stroke="' + hK + '" stroke-width="4" stroke-linecap="round"/><path d="M6 24l-4 18h16zM58 24l-4 18h-16z" fill="#8f9daa" stroke="' + hK + '" stroke-width="2.500" stroke-linejoin="round"/></g><circle cx="32" cy="24" r="5" fill="' + hG + '" stroke="' + hK + '" stroke-width="2"/><path d="M32 29v24M20 56h24" stroke="' + hK + '" stroke-width="4" stroke-linecap="round"/></svg>',
  prop: () => '<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="26" fill="#2c3e4c" stroke="' + hK + '" stroke-width="2.500"/><path d="M32 32C26 22 28 10 32 8c4 2 6 14 0 24zM32 32c10-6 22-4 24 0-2 4-14 6-24 0zM32 32c6 10 4 22 0 24-4-2-6-14 0-24zM32 32c-10 6-22 4-24 0 2-4 14-6 24 0z" fill="#dbe3ea" stroke="' + hK + '" stroke-width="1.500"/><circle cx="32" cy="32" r="4" fill="' + hG + '"/></svg>',
  gauge: () => '<svg viewBox="0 0 64 64"><path d="M6 46a26 26 0 0 1 52 0z" fill="#1c2c38" stroke="' + hK + '" stroke-width="2.500"/><path d="M13 44a20 20 0 0 1 8-15" stroke="' + hB + '" stroke-width="5" fill="none"/><path d="M51 44a20 20 0 0 0-8-15" stroke="' + hO + '" stroke-width="5" fill="none"/><path d="M32 46L44 24" stroke="#fff" stroke-width="3" stroke-linecap="round"/><circle cx="32" cy="46" r="4" fill="' + hG + '"/><text x="14" y="58" font-size="11" font-weight="800" fill="' + hB + '" font-family="Arial,sans-serif">≤4</text><text x="40" y="58" font-size="11" font-weight="800" fill="' + hO + '" font-family="Arial,sans-serif">≤8</text></svg>',
  radio: () => '<svg viewBox="0 0 64 64"><circle cx="32" cy="38" r="5" fill="' + hG + '" stroke="' + hK + '" stroke-width="2"/><path d="M20 28a17 17 0 0 0 0 20M44 28a17 17 0 0 1 0 20M12 20a29 29 0 0 0 0 36M52 20a29 29 0 0 1 0 36" stroke="#fff" stroke-width="3.500" stroke-linecap="round" fill="none"/><path d="M32 43v14" stroke="#fff" stroke-width="3.500" stroke-linecap="round"/></svg>',
  gear: () => '<svg viewBox="0 0 64 64"><path d="M32 6v30M20 36h24" stroke="#8f9daa" stroke-width="5" stroke-linecap="round"/><circle cx="20" cy="46" r="9" fill="#2c3e4c" stroke="#e8f0f6" stroke-width="3"/><circle cx="44" cy="46" r="9" fill="#2c3e4c" stroke="#e8f0f6" stroke-width="3"/><circle cx="20" cy="46" r="3" fill="#8f9daa"/><circle cx="44" cy="46" r="3" fill="#8f9daa"/></svg>',
  flap: () => '<svg viewBox="0 0 64 64"><path d="M4 22L60 10v12L4 34z" fill="#e8f0f6" stroke="' + hK + '" stroke-width="2.500" stroke-linejoin="round"/><path d="M4 34L60 22v8L40 44 4 44z" fill="' + hO + '" stroke="' + hK + '" stroke-width="2.500" stroke-linejoin="round"/><path d="M10 52h44" stroke="' + hK + '" stroke-width="3" stroke-linecap="round" stroke-dasharray="3 5"/></svg>',
  brake: (n) => '<svg viewBox="0 0 64 64"><rect x="6" y="14" width="52" height="36" rx="9" fill="#5a2a22" stroke="#e8f0f6" stroke-width="3"/><text x="32" y="40" text-anchor="middle" font-size="26" font-weight="800" fill="#fff" font-family="Arial,sans-serif">' + (n == null ? '2' : n) + '</text></svg>',
  cup: () => '<svg viewBox="0 0 64 64"><path d="M12 22h34v18a14 14 0 0 1-14 14h-6a14 14 0 0 1-14-14z" fill="#e8f0f6" stroke="' + hK + '" stroke-width="3" stroke-linejoin="round"/><path d="M46 28h4a7 7 0 0 1 0 14h-6" fill="none" stroke="' + hK + '" stroke-width="3"/><path d="M22 6c-3 4 3 6 0 10M32 6c-3 4 3 6 0 10" stroke="#8f9daa" stroke-width="3" stroke-linecap="round" fill="none"/><path d="M16 30h26" stroke="#6b4a2a" stroke-width="5"/></svg>',
  plus: () => '<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="22" fill="#6b4a2a" stroke="#fff" stroke-width="3"/><path d="M32 20v24M20 32h24" stroke="#fff" stroke-width="5" stroke-linecap="round"/></svg>',
  reroll: () => '<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="24" fill="#8a4fd8" stroke="#fff" stroke-width="3"/><path d="M20 30a12 12 0 0 1 21-6M44 34a12 12 0 0 1-21 6" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M42 16v10H32zM22 48V38h10z" fill="#fff"/></svg>',
  tap: () => '<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="18" fill="rgba(242,185,44,.2)" stroke="' + hG + '" stroke-width="4"/><path d="M30 14v26l-6-5-4 4 14 14h14l4-20-8-2-4-4-4 1-2-4z" fill="#fff" stroke="' + hK + '" stroke-width="2.500" stroke-linejoin="round"/></svg>',
  aside: () => '<svg viewBox="0 0 64 64"><rect x="8" y="14" width="30" height="30" rx="7" fill="' + hB + '" stroke="' + hK + '" stroke-width="2.500"/><path d="M42 40l16 12M58 40L42 52" stroke="#d8402c" stroke-width="5" stroke-linecap="round"/><text x="23" y="36" text-anchor="middle" font-size="20" font-weight="800" fill="#fff" font-family="Arial,sans-serif">?</text></svg>',
  stop: () => '<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="24" fill="#d8402c" stroke="#fff" stroke-width="3"/><path d="M21 21l22 22M43 21L21 43" stroke="#fff" stroke-width="6" stroke-linecap="round"/></svg>',
  star: () => '<svg viewBox="0 0 64 64"><path d="M32 6l7.500 17 18.500 1.600-14 12 4.400 18.400L32 45l-16.400 10 4.400-18.400-14-12L24.500 23z" fill="' + hG + '" stroke="#8a6a1a" stroke-width="3" stroke-linejoin="round"/></svg>',
  token: () => '<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="22" fill="#2f9a4a" stroke="#fff" stroke-width="3"/><text x="32" y="41" text-anchor="middle" font-size="26" font-weight="800" fill="#fff" font-family="Arial,sans-serif">4</text></svg>',
  swap: () => '<svg viewBox="0 0 64 64"><rect x="4" y="20" width="22" height="22" rx="6" fill="' + hB + '" stroke="' + hK + '" stroke-width="2.500"/><rect x="38" y="20" width="22" height="22" rx="6" fill="' + hO + '" stroke="' + hK + '" stroke-width="2.500"/><path d="M28 26h8M32 22l4 4-4 4M36 38h-8M32 34l-4 4 4 4" stroke="' + hK + '" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>'
};
function hpics(items) { return '<div class="gxh-pics">' + items.map(it => it === '>' ? '<span class="gxh-ar">&rarr;</span>' : '<figure>' + (HP[it[0]] ? HP[it[0]](it[2], it[3]) : '') + (it[1] ? '<figcaption>' + it[1] + '</figcaption>' : '') + '</figure>').join('') + '</div>'; }
// ---------------------------------------------------------------- where each bubble points
const hq = s => () => document.querySelector(s);
const hfirst = (...sels) => () => { for (const s of sels) { const e = document.querySelector(s); if (e && e.getBoundingClientRect().width) return e; } return null; };
const hmine = () => document.querySelector('#pz .tray.' + (actSeat() === 1 ? 'c' : 'p'));
const HLP_STEPS = {
  brief: { target: hfirst('#says .say', '#acts [data-a=ready]'), title: 'Plan, then roll', text: 'Tap a phrase to tell your partner a plan, never dice values. Then tap Roll.', pic: () => HP.speech() },
  die: { target: hfirst('#pz .tray.p .die.can', '#pz .tray.c .die.can', '#pz .tray'), title: 'Pick a die', text: 'Only you see these dice. Tap one, then a glowing space.', pic: () => HP.dice2() },
  space: { target: hfirst('#pz .slot.legal'), title: 'Tap a glowing space', text: 'Tap a glowing space to place it. Tap the die again to undo.', pic: () => HP.tap() },
  rr: { target: hfirst('#acts [data-a=rrpick]', '#pz .tray .die.can'), title: 'Choose dice to reroll', text: 'Tap the dice you want to roll again, then tap the green button. None is fine.', pic: () => HP.reroll() },
  token: { target: hfirst('#pz .die[data-d=p]', '#pz .tray'), title: 'Place the extra die', text: 'This die must be placed too. Tap it, then a glowing space.', pic: () => HP.token() },
  swap: { target: hfirst('#pz .tray.p .die.can', '#pz .tray.c .die.can', '#pz .tray'), title: 'Hand-over swap', text: 'Your partner offered a die. Pick one of yours to swap with it.', pic: () => HP.swap() }
};
// ---------------------------------------------------------------- the rules cards (<= 20 words each, a picture each): every cockpit slot, in plain words
const HLP_RULES = [
  { title: 'How to win', text: 'Land together in the last round: clear all planes, lower gear and flaps, level the axis, slow down.', pic: () => hpics([['plane', 'Both crew'], '>', ['air', 'Land']]) },
  { title: 'One round', text: 'Share a plan, roll, then take turns placing one die each. You never say dice values.', pic: () => hpics([['speech', 'Plan'], '>', ['dice2', 'Roll'], '>', ['tap', 'Place']]) },
  { title: 'Win or lose together', text: 'A spin, a crash, an empty Axis or Engines space, or a failed landing loses for both.', pic: () => hpics([['stop', 'Any one']]) },
  { phase: 'brief', title: 'Talk plans, not dice', text: 'Tap a phrase to share a plan. Never say the values of your dice. Then tap Roll my dice.', pic: () => hpics([['speech', 'Plan'], '>', ['dice2', 'Roll']]) },
  { phase: 'brief', title: 'Then stay silent', text: 'After the roll your placed dice are your only words. Watch where your partner puts theirs.', pic: () => hpics([['mute', 'Silence'], '>', ['die', 'Your word', 4]]) },
  { phase: 'brief', title: 'Blue and orange', text: 'Pilot is blue, Co-pilot orange. Spaces marked P or C belong to that seat. Grey spaces take either.', pic: () => hpics([['seatP', 'Pilot'], ['seatC', 'Co-pilot']]) },
  { phase: 'brief', title: 'The altitude strip', text: 'One row per round. Its colour says who places first. A purple dot adds a reroll token.', pic: () => hpics([['alt', 'One per round'], ['reroll', 'Reroll']]) },
  { phase: 'die', title: 'Axis: every round', text: 'Both crew put a die on the Axis. The plane tilts toward the higher die. Tilt of 3 loses.', pic: () => hpics([['axis', 'Higher side', 12], ['axis', 'Equal: level', 0]]) },
  { phase: 'die', title: 'Engines: every round', text: 'Both fill the Engines. Sum: up to blue marker stays, up to orange moves 1, above moves 2.', pic: () => hpics([['prop', 'Two dice'], '>', ['gauge', 'Speed']]) },
  { phase: 'die', title: 'Radio clears planes', text: 'A die on the Radio clears one plane that many spaces ahead. Your own space counts as 1.', pic: () => hpics([['radio', 'Radio'], '>', ['strip', 'Clear a plane']]) },
  { phase: 'die', title: 'Rerolls and Coffee', text: 'A reroll token rerolls all unplaced dice, for both crew. Spare dice earn Coffee tokens.', pic: () => hpics([['reroll', 'Reroll'], ['cup', 'Coffee']]) },
  { phase: 'space', title: 'Gear and flaps', text: 'Pilot lowers three gears, Co-pilot extends four flaps in order. All must be done to land.', pic: () => hpics([['gear', 'Pilot: gear'], ['flap', 'Co-pilot: flaps']]) },
  { phase: 'space', title: 'Brakes: 2, then 4, then 6', text: 'Set the brakes in order, exact values. In the last round your engine total must stay within them.', pic: () => hpics([['brake', 'First', 2], ['brake', 'Then', 4], ['brake', 'Last', 6]]) },
  { phase: 'space', title: 'Coffee tokens', text: 'A die on a Coffee space earns a token. Spend tokens to change a later die by 1.', pic: () => hpics([['die', 'Spare', 2], '>', ['cup', 'Coffee'], '>', ['plus', '+1 / -1']]) },
  { phase: 'space', title: 'Nothing fits?', text: 'If no space takes the die, tap Put it aside. Coffee can change its value by one first.', pic: () => hpics([['aside', 'Put aside']]) },
  { phase: 'rr', title: 'Reroll tokens', text: 'Spending a token lets both crew reroll any unplaced dice, once. Either crew can spend one any time.', pic: () => hpics([['reroll', 'Token'], '>', ['dice2', 'New dice']]) },
  { phase: 'rr', title: 'Pick the odd ones', text: 'Tap only the dice that do not fit the open jobs. Tap the green button to confirm.', pic: () => hpics([['die', 'Keep', 3], ['die', 'Reroll', 1]]) },
  { phase: 'token', title: 'Extra die', text: 'Some twists give a die you must place right away. Tap it, then a glowing space.', pic: () => hpics([['token', 'Extra die'], '>', ['tap', 'Place it']]) },
  { phase: 'token', title: 'Same spaces as always', text: 'It goes on the same spaces as your other dice, with the same rules. Coffee can bend it.', pic: () => hpics([['token', 'Extra'], ['cup', 'Coffee']]) },
  { phase: 'swap', title: 'Hand-over', text: 'Both crew swap one die, without saying the values. Pick which of yours to give.', pic: () => hpics([['swap', 'Swap']]) },
  { phase: 'swap', title: 'Pick a spare', text: 'Give the die that fits your open jobs least. You still must place every die.', pic: () => hpics([['die', 'Give', 5], '>', ['die', 'Get', '?', 'o']]) }
];
// ---------------------------------------------------------------- phases: null when the player has nothing to decide
function hlpPhase() {
  try {
    if (!G || !UI.started || G.result) return null;
    const v = actSeat(); if (typeof v !== 'number' || v < 0 || !mayAct(v) || !myTurn()) return null;
    if (G.phase === 'brief') return 'brief';
    if (G.phase !== 'place') return null;
    if (G.pend) return G.pend.h === 'rr' ? 'rr' : G.pend.h === 'wt' ? 'swap' : 'token';
    if (G.turn !== v) return null;
    return typeof UI.sel === 'number' && UI.sel >= 0 ? 'space' : 'die';
  } catch (e) { return null; }
}
// ---------------------------------------------------------------- the advice: the computer crew's move, in a few words
function capW(t, n) { const w = String(t || '').replace(/\s+/g, ' ').trim().split(' '); return w.length <= n ? w.join(' ') : ''; }
function hlpWhy(m, v) {
  if (m.t === 'say') return 'A short plan helps your partner. Never say dice values.';
  if (m.t === 'ready') return 'Plans are shared. Roll your dice.';
  if (m.t === 'rr') return 'Your hand does not fit the open jobs: spend a reroll.';
  if (m.t === 'toss') return 'Nothing takes this die: put it aside.';
  if (m.t !== 'place') return '';
  const val = m.d === 'p' ? G.pend.d.val : G.dice[v][m.d].v, S = FA.SLOT[m.to], o = 1 - v;
  switch (S.grp) {
    case 'radio': { const at = G.pl.pos + val - 1, n = at >= 1 && at <= G.planes.length ? G.planes[at - 1] : 0; return n ? 'A ' + val + ' on the radio clears the plane on ' + (at === G.planes.length ? 'the airport' : 'space ' + at) + '.' : 'The radio clears nothing here: this just uses up a spare die.'; }
    case 'axis': { const x = G.slots['ax' + o]; if (x) { const nx = G.pl.axis + (v === 0 ? x.v - val : val - x.v); return 'Axis ' + val + ' against ' + x.v + ': the plane ends ' + (nx === 0 ? 'level' : 'tilted ' + Math.abs(nx) + (nx < 0 ? ' left' : ' right')) + '.'; } return 'The Axis goes first: a middle value leaves the most room.'; }
    case 'engines': { const x = G.slots['en' + o]; if (x) { const sm = val + x.v + FA.windMod(G); if (FA.isFinal(G)) return 'Landing speed ' + sm + ' against brakes ' + FA.brakeVal(G) + '.'; const adv = sm <= G.pl.aeroB ? 0 : sm <= G.pl.aeroO ? 1 : 2; return 'Engines total ' + sm + ': the plane ' + (adv ? 'moves ' + adv + (adv > 1 ? ' spaces' : ' space') : 'stays put') + '.'; } return 'Engines: you set half the speed, your partner adds the rest.'; }
    case 'gear': return 'Lowers a landing gear. All three must be down to land.';
    case 'flaps': return 'Extends a flap. All four must be out to land.';
    case 'brakes': case 'ice': return 'Sets a brake. The last-round speed must stay within it.';
    case 'conc': return 'A spare die on Coffee earns a token to bend a later die by one.';
    case 'kero': return 'Fuel space: this burns ' + val + ', skipping it burns ' + D.keroSkip + '.';
    case 'intern': return 'This trains the trainee: place the next token too.';
  }
  return '';
}
const hlpDie = (v, d) => document.querySelector(d === 'p' ? '#pz .die[data-d="p"]' : '#pz .die[data-s="' + v + '"][data-d="' + d + '"]');
// one plan for the glow, the finger and the bulb: { to: element getter, from: element getter | null, why }
function hlpPlan() {
  if (!G || G.result || UI.dragging) return null;
  const v = actSeat(); if (typeof v !== 'number' || v < 0 || !myTurn()) return null;
  let m = null; try { m = FA.AI.move(G, v, 'normal', { noMC: true }); } catch (e) { return null; }
  if (!m) return null;
  const why = capW(hlpWhy(m, v), 15); if (!why) return null;
  const sel = typeof UI.sel === 'number' ? UI.sel : -1;
  if (m.t === 'say') { const q = '#says [data-a=say][data-c="' + m.c + '"]'; return (e => e && e.getBoundingClientRect().width > 0)(document.querySelector(q)) ? { m, why, to: () => document.querySelector(q), from: null } : null; }
  if (m.t === 'ready') return { m, why, to: () => document.querySelector('#acts [data-a=ready]'), from: null };
  if (m.t === 'rr') return G.pend ? null : { m, why, to: () => document.querySelector('#acts [data-a=rr]'), from: null };
  if (m.t === 'toss') { if (!hlpDie(v, m.d)) return null; return sel === m.d && document.querySelector('#acts [data-a=toss]') ? { m, why, to: () => document.querySelector('#acts [data-a=toss]'), from: null } : { m, why, to: () => hlpDie(v, m.d), from: null }; }
  if (m.t !== 'place' || m.c || typeof m.d === 'undefined') return null;   // a coffee move needs two taps the finger cannot show: rules cards only
  if (!hlpDie(v, m.d) || !document.querySelector('#pz .slot[data-slot="' + m.to + '"]')) return null;
  return { m, why, to: () => document.querySelector('#pz .slot[data-slot="' + m.to + '"]'), from: sel === m.d ? null : () => hlpDie(v, m.d) };
}
function hlpSuggest() { const p = hlpPlan(); return p && p.to() ? { why: p.why, key: p.m.t + ':' + (p.m.to || p.m.c || p.m.d), target: p.to, from: p.from } : null; }
// ---------------------------------------------------------------- wiring
let _hlpInit = false;
function hlpInit() {
  if (_hlpInit || typeof GXH === 'undefined') return; _hlpInit = true;
  GXH.init({ game: 'final-approach', defaultOn: true, steps: HLP_STEPS, rules: HLP_RULES, avoid: '#pz .slot.legal,#pz .die.can,#pz .die.sel,#pz .die[data-d=p],#acts .btn,#says .say.rec' });
  GXH.bulb({ el: '#bulbbtn', suggest: hlpSuggest, rulesFor: () => hlpPhase() });
}
function hlpAfter() {
  hlpInit(); if (typeof GXH === 'undefined') return;
  const vis = id => { const e = document.getElementById(id); return !!(e && !e.hidden); };
  const busy = !G || !UI.started || G.result || UI.rsOpen || UI.dragging || UI.busy || UI.hold || vis('start') || vis('pass') || vis('rs') || vis('netbox') || (typeof GX !== 'undefined' && GX.open);
  GXH.phase(busy ? null : hlpPhase());
}
setInterval(() => { try { hlpAfter(); } catch (e) { } }, 500);
