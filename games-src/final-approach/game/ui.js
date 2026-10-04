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
// ===================== part 2: render the panel (DOM hit layer) and the dock =====================
const PLANE_SVG = '<svg viewBox="0 0 24 24" width="12" height="12"><path d="M12 2l2 7 8 4v2l-8-2-1 6 3 2v1l-4-1-4 1v-1l3-2-1-6-8 2v-2l8-4z" fill="#fff"/></svg>';
function tabText(a) { return a.slice().sort((x, y) => x - y).map(n => n === 0 ? 'C' : (n < 0 ? 'L' : 'R') + Math.abs(n)).join(' '); }
function css(el, r) { el.style.left = r.x + 'px'; el.style.top = r.y + 'px'; el.style.width = r.w + 'px'; el.style.height = r.h + 'px'; return el; }
// the plain look of a die: a number in a rounded square
function dvEl(v, cls) { return h('span.dv' + (cls ? '.' + cls.trim().replace(/ +/g, '.') : ''), String(v)); }
const SLOTLAB = k => { const S = FA.SLOT[k]; if (S.grp === 'gear' || S.grp === 'flaps') return S.vals.join('-'); if (S.grp === 'brakes' || S.grp === 'ice') return String(S.vals[0]); return ''; };
function selectedLegal() {
  const v = viewSeat(); if (typeof v !== 'number' || !mayAct(v)) return [];
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
  const v = viewSeat(), me = typeof v === 'number' ? v : -1;
  const LY = UI.LY = FA.layout(W, Hh, { mods: G.mods, me }); UI.W = W;
  const legal = selectedLegal(), r = LY.r, rows = altRows(), tr = trackOf(), size = tr.sp.length;
  pz.innerHTML = '';
  const dieSz = Math.max(30, Math.min(LY.k * 72, 80));
  // ---- approach window
  { const w = css(h('div.w.appr', { 'aria-label': 'Approach track' }, h('span.tl', 'Approach')), r.appr), cw = Math.max(Math.min((r.appr.w - 4) / size, 130), 46), tot = cw * size;
    const strip = h('div.strip', { style: 'position:absolute;left:0;top:0;bottom:0;width:' + tot + 'px;transition:transform .5s ease' });
    const off = tot <= r.appr.w - 4 ? (r.appr.w - 4 - tot) / 2 : -Math.max(0, Math.min(tot - r.appr.w, (G.pl.pos - 1.4) * cw)); strip.style.transform = 'translateX(' + Math.round(off) + 'px)'; UI.stripOff = off; UI.cw = cw;
    for (let i = 0; i < size; i++) {
      const s = tr.sp[i], n = G.planes[i], b = h('button.sp' + (i + 1 === G.pl.pos ? '.you' : '') + (i === size - 1 ? '.air' : ''), { type: 'button', 'data-a': 'space', 'data-i': i, style: 'left:' + i * cw + 'px;width:' + cw + 'px', 'aria-label': 'Space ' + (i + 1) + (i === size - 1 ? ' (airport)' : '') + ', ' + n + ' plane' + (n === 1 ? '' : 's') + (s[1] ? ', traffic die x' + s[1] : '') + (s[2] ? ', corridor ' + tabText(s[2]) : '') + (i + 1 === G.pl.pos ? ', your plane is here' : '') });
      const pls = h('div.pls'); for (let k = 0; k < n; k++) pls.appendChild(h('i.pl', { html: PLANE_SVG }));
      if (s[1]) pls.appendChild(h('i.tf', '⚄' + (s[1] > 1 ? '×' + s[1] : ''))); if (s[2] && G.mods.tabs) pls.appendChild(h('i.tb', tabText(s[2])));
      b.append(pls, h('span.nm', i === size - 1 ? 'Airport' : String(i + 1))); if (i + 1 === G.pl.pos) b.append(h('span.nm.you', { style: 'color:var(--gold)' }, '▲ you')); strip.appendChild(b);
    }
    w.appendChild(strip); pz.appendChild(w);
  }
  // ---- altitude window
  { const w = css(h('div.w.altw', { 'aria-label': 'Altitude track' }, h('span.tl', 'Altitude')), r.alt), n = rows.length - G.row0, cw = r.alt.w / n;
    for (let i = 0; i < n; i++) { const R = rows[i + G.row0]; const el = h('div.ar' + (i === G.round ? '.cur' : (i < G.round ? '.past' : '')), { style: 'left:' + i * cw + 'px;width:' + cw + 'px;top:' + (isPh() ? 3 : 12) + 'px;bottom:0' }, h('span', String(R[0]), h('u', ' ft'), R[2] ? h('i.rr', { title: 'reroll token' }) : null), h('small', h('i.fx', 'first: '), h('span.fp.' + (R[1] ? 'c' : 'p'), R[1] ? 'Co' : 'Pi'))); w.appendChild(el); }
    pz.appendChild(w); }
  // ---- slots
  for (const k of G.keys) {
    const S = FA.SLOT[k], q = r[k]; if (!q) continue; const d = G.slots[k];
    const cls = 'slot ' + (S.s === 0 ? 'p' : S.s === 1 ? 'c' : 'n') + (d ? ' full' : '') + (legal.includes(k) ? ' legal' : '');
    const b = css(h('button.' + cls.replace(/ /g, '.'), { type: 'button', 'data-a': 'slot', 'data-slot': k, 'aria-label': slotName(k) + ', ' + (d ? 'holds a ' + d.v : slotNeed(k) + (S.s === 0 ? ', pilot' : S.s === 1 ? ', co-pilot' : ', either crew')) }), q);
    if (d) b.appendChild(dvEl(d.v, d.k === 'i' ? 't' : d.k === 'x' ? 'k' : (d.s === 0 ? 'b' : 'o'))); else b.appendChild(h('span.sl', SLOTLAB(k)));
    if (S.grp === 'gear' && G.pl.sw.lg[S.ix] || S.grp === 'flaps' && G.pl.sw.fl[S.ix] || S.grp === 'brakes' && G.pl.sw.br[S.ix]) b.appendChild(h('i.sw.on')); else if (['gear', 'flaps', 'brakes'].includes(S.grp)) b.appendChild(h('i.sw'));
    pz.appendChild(b);
  }
  // ---- dial, gauge, brake readout
  { const a = G.pl.axis, dl = h('div.dial', { 'aria-label': 'Axis: ' + (a === 0 ? 'level' : Math.abs(a) + ' toward the ' + (a < 0 ? 'pilot' : 'co-pilot')) }, h('i', { style: 'transform:rotate(' + (a * 24) + 'deg)' }), h('span', { style: 'position:relative;margin-top:44%' }, a === 0 ? 'level' : Math.abs(a) + (a < 0 ? ' left' : ' right')));
    pz.appendChild(css(dl, r.dial));
    const lastSpd = G.speed >= 0 ? 'speed ' + G.speed : '';
    pz.appendChild(css(h('div.gau', { 'aria-label': 'Speed gauge' }, h('span', 'markers ' + G.pl.aeroB + ' | ' + G.pl.aeroO + (G.mods.wind ? ' · wind ' + (FA.windMod(G) >= 0 ? '+' : '') + FA.windMod(G) : '') + (lastSpd ? ' · ' + lastSpd : ''))), r.gauge));
    const bv = FA.brakeVal(G);
    const lastB = r.br2 || r.ib3; if (lastB) pz.appendChild(css(h('div.badge.brk', 'Brakes ' + bv), { x: lastB.x + lastB.w + 4, y: lastB.y + lastB.h / 2 - 11, w: 82, h: 22 }));
  }
  // ---- coffee, rerolls
  { const cf = h('div.chipr'); for (let i = 0; i < 3; i++) cf.appendChild(h('i.tk.cf' + (i < G.coffee ? '' : '.off'))); pz.appendChild(css(cf, r.coffee));
    pz.appendChild(css(h('div.badge', { 'aria-label': G.rrHand + ' reroll tokens' }, h('i.tk.rr'), h('b', '×' + G.rrHand)), r.rerolls)); }
  if (G.mods.fuel && r.fuel) { const f = Math.max(0, Math.min(1, G.pl.kero / D.keroStart)); pz.appendChild(css(h('div.bar', { 'aria-label': 'Fuel ' + G.pl.kero }, h('i', { style: 'width:' + f * 100 + '%' }), h('span', 'Fuel ' + G.pl.kero)), r.fuel)); }
  if (G.mods.wind && r.wind) pz.appendChild(css(h('div.dial', { style: 'font-size:12px;background:#3e8fd8' }, 'Wind ' + (FA.windMod(G) >= 0 ? '+' : '') + FA.windMod(G)), r.wind));
  if (G.mods.intern && r.tokens) { const t = h('div.tokrow', { 'aria-label': 'Trainee tokens left: ' + G.intern.join(', ') }); G.intern.forEach(x => t.appendChild(h('i.ch', String(x)))); pz.appendChild(css(t, r.tokens)); }
  // ---- trays
  for (const s of [0, 1]) {
    const q = s === 0 ? r.trayP : r.trayC, show = v === 'all' || v === s, nd = 4, gap = 6, ds = Math.min(80, (q.w - 12 - gap * (nd - 1)) / nd, q.h - 8);
    const tr2 = css(h('div.tray.' + (s === 0 ? 'p' : 'c'), { 'aria-label': pname(s) + "'s dice" + (show ? '' : ' (hidden behind the screen)') }, h('span.who', pname(s))), q);
    const rrmode = G.pend && G.pend.h === 'rr' && me === s && mayAct(s) && !G.pend.d.m[s];
    for (let i = 0; i < 4; i++) {
      const d = G.dice[s][i], used = d.u || G.phase !== 'place';
      const b = h('button.die' + (used ? '.used' : '') + (show && !used && mayAct(s) ? '' : '.cover') + (UI.sel === i && me === s ? '.sel' : '') + (rrmode && UI.rrm[i] ? '.rrm' : ''), { type: 'button', 'data-a': 'die', 'data-s': s, 'data-d': i, style: 'width:' + ds + 'px;height:' + ds + 'px', 'aria-label': used ? 'used' : (show ? pname(s) + ' die showing ' + d.v : pname(s) + ' die, hidden'), disabled: (used || !(show && mayAct(s))) ? true : null });
      b.appendChild(dvEl(show ? d.v : '?', (s === 0 ? 'b' : 'o') + (show ? '' : ' q'))); tr2.appendChild(b);
    }
    if (G.pend && (G.pend.h === 'intern' && G.pend.d.seat === s || G.pend.h === 'sync' && s === 1) && (show)) { const val = G.pend.d.val; tr2.appendChild(h('button.die' + (UI.sel === 'p' ? '.sel' : ''), { type: 'button', 'data-a': 'die', 'data-s': s, 'data-d': 'p', style: 'width:' + ds + 'px;height:' + ds + 'px', 'aria-label': (G.pend.h === 'intern' ? 'Trainee token ' : 'Traffic die ') + val }, dvEl(val, G.pend.h === 'intern' ? 't' : 'k'))); }
    pz.appendChild(tr2);
  }
  // ---- hud
  if (r.hud) { const row = rows[G.round + G.row0]; pz.appendChild(css(h('div.hudc', h('b', 'Round ' + (G.round + 1) + ' of ' + (D.rounds - G.row0) + ' · ' + row[0] + ' ft'), h('span', G.result ? 'Flight over' : G.phase === 'brief' ? 'Briefing' : (G.pend ? pendLabel() : (G.turn === 0 ? 'Pilot' : 'Co-pilot') + ' places')), UI.rt && G.mods.real ? h('span', { id: 'rtleft' }, '⏱ ' + Math.ceil(UI.rt.left / 1000) + ' s') : null), r.hud)); }
  renderDock(); renderBar();
  if (typeof pxSync === 'function') pxSync();
  if (typeof netRenderHook === 'function') netRenderHook();
}
function pendLabel() { const p = G.pend; return p.h === 'rr' ? 'Reroll: choose dice' : p.h === 'intern' ? 'Trainee token' : p.h === 'sync' ? 'Cross-check die' : 'Hand-over'; }
// ---------- the dock: what to do now ----------
function promptText() {
  if (!G) return '';
  if (G.result) return G.result.win ? 'Landed! Well flown.' : 'The flight is over.';
  const v = viewSeat(), pend = FA.pending(G);
  if (G.phase === 'brief') {
    if (typeof v === 'number' && mayAct(v)) return G.ready[v] ? 'Waiting for your crewmate to be ready.' : 'Talk strategy, no dice values. Then Roll.';
    return G.ready.every(Boolean) ? 'Rolling...' : 'Briefing: ' + pend.map(name).join(' and ') + ' getting ready.';
  }
  if (G.pend) {
    const p = G.pend;
    if (p.h === 'rr') return typeof v === 'number' && mayAct(v) && !p.d.m[v] ? 'Reroll: tap the dice you want to reroll (none is fine), then Confirm.' : 'Reroll: waiting for ' + pend.map(name).join(' and ') + ' to choose.';
    if (p.h === 'intern') return typeof v === 'number' && v === p.d.seat && mayAct(v) ? 'Trainee: place token ' + p.d.val + ' on any space (not Concentration). Tap the token, then a space.' : name(p.d.seat) + ' is placing the trainee token.';
    if (p.h === 'sync') return typeof v === 'number' && v === 1 && mayAct(1) ? 'Cross-check: place the traffic die (' + p.d.val + ') on any empty space.' : 'The co-pilot is placing the cross-check die.';
    if (p.h === 'wt') return typeof v === 'number' && v === 1 - p.d.a && mayAct(v) ? 'Hand-over: pick one of your dice to swap values.' : 'Hand-over: waiting for ' + name(1 - p.d.a) + ' to pick a die.';
  }
  if (typeof v === 'number' && v >= 0 && mayAct(v) && G.turn === v) return (UI.sel === -1 || UI.sel == null ? 'Your turn, ' + pname(v) + ': tap one of your dice.' : 'Tap a glowing space to place the die.');
  if (v === 'all') return name(G.turn) + ' is placing.';
  return 'Waiting for ' + name(G.turn) + '...';
}
function renderDock() {
  const v = viewSeat(), pr = promptText(), mine = typeof v === 'number' && v >= 0 && mayAct(v) && FA.pending(G).includes(v);
  const p = $('#prompt'); if (p) { p.textContent = pr; p.className = mine ? 'mine' : ''; } const bp = $('#barprompt'); if (bp) { bp.textContent = pr; }
  // roadmap
  const rt = $('#rt'); if (rt) { rt.innerHTML = ''; const n = D.rounds - G.row0; for (let i = 0; i < n; i++) rt.appendChild(h('span.rd' + (i === G.round ? '.cur' : (i < G.round ? '.done' : '')), { 'aria-label': 'Round ' + (i + 1) }, String(i + 1))); rt.appendChild(h('span', G.phase === 'brief' ? 'Briefing' : G.result ? 'Done' : 'Placing dice')); }
  // briefing phrases
  const sy = $('#says'); if (sy) { sy.innerHTML = ''; if (G.phase === 'brief') {
    if (typeof v === 'number' && v >= 0 && mayAct(v)) { const mv = FA.validMoves(G, v); for (const m of mv) if (m.t === 'say') sy.appendChild(h('button.say', { type: 'button', 'data-a': 'say', 'data-c': m.c }, SAYT[m.c])); }
    for (const s of [0, 1]) for (const c of G.say[s]) sy.appendChild(h('span.sbub.' + (s ? 'c' : 'p'), name(s).split(' ').pop() + ': “' + SAYT[c] + '”')); } }
  // roster
  const ro = $('#roster'); if (ro) { ro.innerHTML = ''; for (const s of [0, 1]) { const st = G.result ? (G.result.win ? 'landed' : 'flight over') : G.phase === 'brief' ? (G.ready[s] ? 'ready' : 'briefing') : (FA.pending(G).includes(s) ? 'deciding' : 'waiting'); ro.appendChild(h('div.chip.' + (s ? 'c' : 'p') + (v === s ? '.me' : '') + (st === 'deciding' || st === 'briefing' ? '.wt' : '') + (st === 'ready' ? '.rdy' : ''), h('span.cav', ART['crew-' + s] ? h('img', { src: ART['crew-' + s], alt: '' }) : ''), h('span.ct', h('b', name(s)), h('i', pname(s) + (G.ai[s] ? ' (computer)' : '') + ' · ' + FA.unusedDice(G, s).length + ' dice · ' + st)))); } }
  // selected die info
  const si = $('#selinfo'); if (si) { si.innerHTML = ''; si.className = 'idle';
    if (typeof v === 'number' && v >= 0 && mayAct(v) && !G.result && G.phase === 'place') {
      const sel = UI.sel, pend = G.pend;
      if (pend && pend.h === 'rr' && !pend.d.m[v]) { si.className = ''; si.append(h('b', 'Reroll'), h('span', 'Both crew may reroll any of their unplaced dice once. Tapped dice are marked purple.')); }
      else if (sel === 'p' || (typeof sel === 'number' && sel >= 0 && !pend)) {
        si.className = ''; const val = sel === 'p' ? pend.d.val : G.dice[v][sel].v; const lg = selectedLegal();
        si.append(h('b', (sel === 'p' ? (pend.h === 'intern' ? 'Trainee token ' : 'Traffic die ') : 'Die ') + val + (UI.cof ? ' → ' + (val + UI.cof) : '')));
        if (sel !== 'p' || pend.h === 'sync') { const cw = h('div.cof', h('span.lab', 'Coffee (' + G.coffee + '):')); for (let c = -Math.min(G.coffee, val - 1); c <= Math.min(G.coffee, 6 - val); c++) cw.appendChild(h('button.chipb' + (UI.cof === c ? '.on' : ''), { type: 'button', 'data-a': 'cof', 'data-c': c, 'aria-pressed': UI.cof === c ? 'true' : 'false' }, c === 0 ? 'as is' : (val + c) + (c > 0 ? ' (+' + c + ')' : ' (' + c + ')'))); if (G.coffee > 0) si.append(cw); }
        si.append(h('span', lg.length ? 'Fits: ' + lg.map(slotName).filter((x, i, a) => a.indexOf(x) === i).join(', ') + '. Tap a glowing space.' : 'No space takes this value right now. Try coffee or another die.'));
        if (UI.hint && UI.hint.d === sel) si.append(h('div.why', UI.hint.why));
      } else if (G.turn === v && !pend) { si.append(h('span', 'Tap one of your dice behind the screen. Hint shows what the computer would do.')); if (UI.hint) si.append(h('div.why', UI.hint.why)); }
      else si.append(h('span', 'Not your move yet.'));
    } else if (G.phase === 'brief') si.append(h('span', 'Silence rule: from the roll to the end of the round you do not talk. Placing a die is how you talk now.'));
    else si.append(h('span', G.result ? '' : 'Watch the panel.'));
  }
  // actions
  const ac = $('#acts'); if (ac) { ac.innerHTML = ''; ac.appendChild(actions(v)); }
  renderCheat();
}
function actions(v) {
  const f = document.createDocumentFragment(); if (G.result || typeof v !== 'number' || v < 0 || !mayAct(v)) return f;
  const mv = FA.validMoves(G, v), has = t => mv.filter(m => m.t === t);
  const b = (txt, a, cls, extra) => f.appendChild(h('button.btn' + (cls ? '.' + cls : ''), Object.assign({ type: 'button', 'data-a': a }, extra || {}), txt));
  if (G.phase === 'brief') { if (has('ready').length) b('Roll my dice', 'ready', 'go'); return f; }
  if (G.pend && G.pend.h === 'rr' && has('rrpick').length) { b('Confirm reroll' + (UI.rrm.some(x => x) ? ' (' + UI.rrm.filter(x => x).length + ')' : ' (none)'), 'rrpick', 'go'); return f; }
  if (G.pend) return f;
  if (G.turn !== v) return f;
  if (has('rr').length) b('Reroll (' + G.rrHand + ')', 'rr', 'alt');
  if (has('antic').length && typeof UI.sel === 'number' && UI.sel >= 0) b('Second look: reroll this die', 'antic', 'alt');
  if (has('adapt').length && typeof UI.sel === 'number' && UI.sel >= 0) b('Flip this die', 'adapt', 'alt');
  if (has('wt').length && typeof UI.sel === 'number' && UI.sel >= 0) b('Hand-over with this die', 'wt', 'alt');
  if (has('toss').length && typeof UI.sel === 'number' && UI.sel >= 0) b('No space fits: put it aside', 'toss', 'alt');
  b('Hint', 'hint', 'alt');
  return f;
}
function renderCheat() {
  const c = $('#cheat'); if (!c) return; c.innerHTML = ''; const ck = (ok, t) => c.appendChild(h('div.cr', h('span.ck' + (ok === true ? '.ok' : ok === false ? '.no' : ''), ok === true ? '✓' : ok === false ? '!' : ''), t));
  c.appendChild(h('b', 'Landing checklist'));
  const left = FA.planesOnTrack(G); ck(left === 0, 'No planes left on the track (' + left + ' to go)');
  ck(G.pl.sw.lg.every(Boolean) && G.pl.sw.fl.every(Boolean), 'All gear (' + G.pl.sw.lg.reduce((a, x) => a + x, 0) + '/3) and flaps (' + G.pl.sw.fl.reduce((a, x) => a + x, 0) + '/4) down');
  ck(G.pl.axis === 0, 'Axis level (now ' + (G.pl.axis === 0 ? 'level' : G.pl.axis) + ')');
  ck(FA.brakeVal(G) >= 2 ? true : null, 'Last-round speed no more than the brakes (' + FA.brakeVal(G) + ')');
  if (G.mods.intern) ck(G.intern.length === 0, 'Trainee finished (' + G.intern.length + ' tokens left)');
  if (G.mods.ice) ck(G.pl.ice === 4, 'Icy-runway track finished (' + G.pl.ice + '/4)');
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
  UI.mode = mode; UI.seat = mode === 'guided' ? 0 : cfg.role; UI.holder = mode === 'hot' ? -1 : UI.seat; UI.started = true; UI.sel = -1; UI.cof = 0; UI.hint = null; UI.over = null; UI.overShown = false; UI.rrm = [false, false, false, false];
  UI.coach = { level: mode === 'guided' ? 'full' : (UI.prefs.guide || 'off'), seen: {}, tip: '', queue: [] }; UI.lastPlace = null; UI.rt = G.mods.real ? { left: 60000, last: 0 } : null;
  const st = $('#start'); if (st) st.hidden = true; closeRS(); try { GX.close(); } catch (e) { } closePass();
  clearSave(); render(); sndMusic(); coachTick(); schedule();
  if (mode !== 'guided' && mode !== 'watch' && UI.prefs.story !== false) showStory();
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
  if (UI.mode === 'hot') { if (myUi.length && !myUi.includes(UI.holder)) { showPass(myUi[0]); return; } }
  const aiSeat = seats.find(s => G.ai[s]);
  if (aiSeat != null) {
    const seq = UI.seq, delay = G.phase === 'brief' ? Math.min(AIDELAY, 500) : AIDELAY, aiS = aiSeat;
    UI.tm = setTimeout(() => { if (seq !== UI.seq || !G || G.result) return; try { const m = FA.AI.move(G, aiS, G.ai[aiS], {}); if (!m) { console.warn('no AI move'); return; } commit(aiS, m); } catch (e) { console.error(e); } }, ANIM || UI.mode === 'net' ? delay : 0);
  }
}
// ---- human actions
function dieTap(s, d) {
  if (!mayAct(s)) { if (G.phase === 'place' && !G.result) toast(s === viewSeat() ? 'Not your move yet.' : 'Those dice are hidden behind the screen.'); return; }
  const v = viewSeat(); if (v !== s) return;
  if (G.pend && G.pend.h === 'rr') { if (!G.pend.d.m[s] && typeof d === 'number' && !G.dice[s][d].u) { UI.rrm[d] = !UI.rrm[d]; render(); } return; }
  if (G.pend && G.pend.h === 'wt' && G.pend.d.a !== s) { const m = { t: 'wt2', d }; if (FA.validMoves(G, s).some(x => x.t === 'wt2' && x.d === d)) commit(s, m); return; }
  if (G.turn !== s && !(G.pend && (G.pend.h === 'intern' || G.pend.h === 'sync'))) { toast('Not your move yet.'); return; }
  if (G.dice[s][d] && G.dice[s][d].u && d !== 'p') return;
  UI.sel = UI.sel === d ? -1 : d; UI.cof = 0; UI.hint = null; snd('click'); render();
}
function slotTap(k) {
  const v = viewSeat(); if (typeof v !== 'number' || v < 0 || !mayAct(v)) { if (G && !G.result) toast('Wait for your turn.'); return; }
  if (G.slots[k]) { toast(slotName(k) + ' is taken this round.'); return; }
  if (UI.sel === -1 || UI.sel == null) { toast('Pick a die first.'); return; }
  const m = { t: 'place', d: UI.sel, to: k, c: UI.cof };
  if (FA.validMoves(G, v).some(x => x.t === 'place' && x.d === m.d && x.to === k && (x.c || 0) === m.c)) { sendMove(v, m); return; }
  const val = (UI.sel === 'p' ? G.pend.d.val : G.dice[v][UI.sel].v) + UI.cof; const S = FA.SLOT[k];
  const why = S.s !== null && S.s !== v ? 'That space belongs to the ' + (S.s === 0 ? 'pilot' : 'co-pilot') + '.' : (S.grp === 'flaps' && S.ix > 0 && !G.pl.sw.fl[S.ix - 1]) ? 'Flaps go in order: use the one above first.' : (S.grp === 'brakes' && S.ix > 0 && !G.pl.sw.br[S.ix - 1]) ? 'Brakes go in order: 2, then 4, then 6.' : (S.grp === 'ice' && S.ix !== G.pl.ice) ? 'Only the next icy-runway column can be used.' : (S.grp === 'intern' && G.intern.length && val === (v === 0 ? G.intern[0] : G.intern[G.intern.length - 1])) ? 'The die must differ from the next trainee token.' : S.vals ? slotName(k) + ' ' + slotNeed(k) + ' (your die shows ' + val + ').' : 'That does not fit.';
  snd('error'); toast(why);
}
// route: online clients send to the host, everybody else applies at once
function sendMove(seat, m) { if (UI.mode === 'net' && typeof isClient === 'function' && isClient()) { if (typeof netAct === 'function') netAct(m); UI.sel = -1; UI.cof = 0; render(); return; } commit(seat, m); }
function doAction(a, t) {
  const v = viewSeat(); if (typeof v !== 'number' || v < 0) return;
  const mv = FA.validMoves(G, v);
  switch (a) {
    case 'ready': sendMove(v, { t: 'ready' }); break;
    case 'say': sendMove(v, { t: 'say', c: t.dataset.c }); break;
    case 'rr': sendMove(v, { t: 'rr' }); break;
    case 'rrpick': sendMove(v, { t: 'rrpick', m: UI.rrm.slice() }); break;
    case 'antic': case 'adapt': case 'wt': case 'toss': if (typeof UI.sel === 'number' && UI.sel >= 0) sendMove(v, { t: a, d: UI.sel }); break;
    case 'cof': UI.cof = +t.dataset.c; render(); break;
    case 'hint': showHint(); break;
  }
}
function showHint() {
  const v = viewSeat(); if (typeof v !== 'number' || !mayAct(v)) return;
  try {
    const m = FA.AI.move(G, v, 'normal', { noMC: true }); if (!m) { toast('No suggestion.'); return; }
    let why = whyMove(m, v), d = m.d;
    UI.hint = { d: m.t === 'place' || m.t === 'toss' ? d : null, why };
    if (m.t === 'place') { UI.sel = d; UI.cof = m.c || 0; } toast('Hint: ' + why);
  } catch (e) { console.error(e); }
  render();
}
function whyMove(m, v) {
  if (m.t === 'ready') return 'Roll when you have finished the briefing.';
  if (m.t === 'rr') return 'Spend a reroll token: your hand does not fit the jobs that are waiting.';
  if (m.t === 'toss') return 'Nothing takes this die, so put it aside.';
  if (m.t !== 'place') return m.t + ' looks useful here.';
  const val = (m.d === 'p' ? G.pend.d.val : G.dice[v][m.d].v) + (m.c || 0), S = FA.SLOT[m.to], pre = m.c ? 'With a coffee making it ' + val + ', ' : 'A ' + val + ' ';
  switch (S.grp) {
    case 'radio': { const at = G.pl.pos + val - 1, n = at >= 1 && at <= G.planes.length ? G.planes[at - 1] : 0; return n ? pre + 'on the radio clears a plane on space ' + at + '.' : pre + 'on the radio would clear nothing; only use it as a spare die.'; }
    case 'axis': return pre + 'on the axis ' + (G.slots.ax0 || G.slots.ax1 ? 'finishes the pair and keeps the plane safe (it must end level in the last round).' : 'goes first: a middle value is easy for your crewmate to match.');
    case 'engines': return pre + 'on the engines ' + (G.slots.en0 || G.slots.en1 ? 'finishes the speed. Check the markers: ' + G.pl.aeroB + ' and ' + G.pl.aeroO + '.' : 'sets the speed for the round; your crewmate completes it.');
    case 'gear': return pre + 'lowers a landing gear (needed to land); the blue marker moves up.';
    case 'flaps': return pre + 'extends a flap (needed to land); the orange marker moves up.';
    case 'brakes': case 'ice': return pre + 'sets a brake: the last-round speed must stay under the brake value.';
    case 'conc': return pre + 'on Concentration earns a coffee token to bend a later die by one.';
    case 'kero': return pre + 'on the fuel space burns ' + val + '; skipping it would burn 6.';
    case 'intern': return pre + 'trains the trainee: take the next token and place it too.';
  }
  return 'Good use of this die.';
}
// ---- pass-the-device screens (hot-seat)
function showPass(seat) {
  UI.holder = -1; const el = $('#pass'); if (!el) return; el.hidden = false; el.innerHTML = '';
  const waiting = G.phase === 'brief' ? 'briefing' : G.pend && G.pend.h === 'rr' ? 'reroll choice' : 'turn';
  el.appendChild(h('div.passbox', ART['crew-' + seat] ? h('img', { src: ART['crew-' + seat], alt: '' }) : null, h('h2', 'Pass to ' + name(seat)), h('p', pname(seat) + ' (' + (seat ? 'orange' : 'blue') + '), it is your ' + waiting + '. Make sure only you can see the screen.'), h('p.sm', 'Your dice are hidden until you tap the button.'), h('button.btn.go', { type: 'button', 'data-a': 'take', 'data-s': seat }, "I'm " + pname(seat) + ' – show my dice')));
  render();
}
function takeDevice(seat) { UI.holder = seat; closePass(); render(); schedule(); }
function closePass() { const el = $('#pass'); if (el) { el.hidden = true; el.innerHTML = ''; } }
// ---- real-time module: a 60 s timer that only runs while someone is deciding
setInterval(() => {
  if (!G || !UI.started || G.result || !UI.rt || G.phase !== 'place') return; if (UI.mode === 'net' && typeof isClient === 'function' && isClient()) { return; }
  const now = Date.now(); if (!UI.rt.last) { UI.rt.last = now; return; } const dt = now - UI.rt.last; UI.rt.last = now;
  const seats = FA.pending(G), human = seats.some(s => !G.ai[s]); if (!human) return; if (UI.mode === 'hot' && UI.holder < 0) return;
  UI.rt.left -= dt; const e = $('#rtleft'); if (e) e.textContent = '⏱ ' + Math.max(0, Math.ceil(UI.rt.left / 1000)) + ' s';
  if (UI.rt.left <= 0) { UI.rt = null; toast('Time is up: unplaced dice are ignored.'); commit(seats[0], { t: 'timeout' }); }
}, 250);
// ---- the end
function onEnd() {
  if (UI.overShown) return; UI.overShown = true; clearSave();
  const win = G.result.win; try { if (win) { UI.won[G.sid] = 1; savePrefs(); } snd(win ? 'win' : 'lose'); } catch (e) { }
  if (typeof pxEnd === 'function' && ANIM && typeof PX !== 'undefined' && PX.on) { pxEnd(win, () => showFinal()); } else setTimeout(showFinal, ANIM ? 500 : 0);
}
// ===================== part 4: guided first flight (tips), end card, drawers =====================
var GUIDED_SCRIPT = [[[6,4,6,3],[4,3,4,4]],[[1,5,2,3],[4,1,5,5]],[[4,2,1,6],[3,1,2,4]],[[2,4,2,4],[2,5,4,1]],[[6,5,2,2],[6,2,1,4]],[[1,1,5,5],[2,6,6,2]],[[4,2,4,3],[5,6,4,6]]];   // found by guided-search.js: each control has a die to teach with, and two computer crews win 80% of 60 flights
const TIPS = [
  { id: 'welcome', g: 1, when: () => G.phase === 'brief' && G.round === 0, t: 'Welcome aboard', x: 'You are Captain Ines Marlow, the Pilot (blue). Your co-pilot, Ravi, plays the orange side. Land the plane in seven rounds, one altitude row per round. This first flight is Port Alder, the friendliest airport. I will introduce one control at a time.' },
  { id: 'brief', g: 1, when: () => G.phase === 'brief' && G.round === 0, t: 'The briefing', x: 'Before each roll you may talk strategy: "we need to clear traffic", "let us move two spaces". You never say dice values. Tap a phrase to tell Ravi your plan, then press Roll. After the roll both of you stay silent: the dice you place are your only words.' },
  { id: 'dice', g: 1, when: () => G.phase === 'place' && G.round === 0, t: 'Your dice', x: 'Your four blue dice sit behind your screen at the bottom: only you can see them. Ravi’s orange dice are hidden from you. Players alternate: tap a die, then tap a glowing space on the panel. You must place every die.' },
  { id: 'axis', g: 1, when: () => G.phase === 'place' && G.round === 0 && myTurn(), t: 'Control 1: the axis', x: 'Each round both crew must put one die on the Axis. The plane tilts toward the higher die by the difference (5 against 3 tilts 2). Equal dice keep it level. A tilt of 3 is a spin: you lose at once. The tilt carries over, and the plane must be level when it lands.' },
  { id: 'engines', g: 1, when: () => G.phase === 'place' && G.round === 0 && myTurn(), t: 'Control 2: the engines', x: 'Both crew also put one die on the Engines. Add them: up to the blue marker the plane stays put, up to the orange marker it moves one space, above it moves two. Moving past a space that still holds a plane is a collision, and moving past the airport is an overshoot.' },
  { id: 'track', g: 1, when: () => G.phase === 'place' && G.round === 0, t: 'The approach track', x: 'The strip at the top is your route. Your plane is the glowing space. Planes in your way must be cleared before you leave their space. The airport is the last space: you must be there when the last altitude starts.' },
  { id: 'radio', g: 1, when: () => G.phase === 'place' && G.round === 0 && myTurn(), t: 'Control 3: the radio', x: 'A die on the Radio, any value, clears one plane. Count from your own space as 1: a 3 clears the plane on the space two ahead of you. The pilot has one radio space, the co-pilot has two.' },
  { id: 'alt', g: 1, when: () => G.round === 1 && G.phase === 'brief', t: 'The altitude track', x: 'Every round the plane sinks one row. The row also says who places first and whether a reroll token comes aboard. Seven rows, seven rounds: there is no waiting.' },
  { id: 'gear', g: 1, when: () => G.round === 1 && G.phase === 'place' && myTurn(), t: 'Control 4: landing gear', x: 'The pilot lowers the landing gear: any of the three spaces, a 1-2, a 3-4 and a 5-6. All three must be down to land. Each gear raises the blue engine marker, so slow speeds become easier and one-space moves harder.' },
  { id: 'flaps', g: 1, when: () => G.round === 2 && G.phase === 'place', t: 'Control 5: flaps', x: 'The co-pilot extends the flaps, in order from the top: 1-2, then 2-3, then 4-5, then 5-6. All four must be out to land. Each flap raises the orange marker, so a two-space move needs a bigger sum. Ravi handles these; watch how the markers move.' },
  { id: 'brakes', g: 1, when: () => G.round === 3 && G.phase === 'place' && myTurn(), t: 'Control 6: brakes', x: 'The brakes only matter in the last round, but they need exact values in order: a 2, then a 4, then a 6. In the final round your engine total must be no more than the brake value. Set them early.' },
  { id: 'conc', g: 1, when: () => G.round === 4 && G.phase === 'place' && myTurn(), t: 'Control 7: concentration and coffee', x: 'A die you cannot use anywhere can go on Concentration for a coffee token. Spend tokens on any later die to add or subtract 1 (never wrapping 1 to 6). Pick a die, then use the coffee buttons under it.' },
  { id: 'rr', g: 1, when: () => G.round >= 4 && G.rrHand > 0 && G.phase === 'place' && myTurn() && !G.pend, t: 'Reroll tokens', x: 'A reroll token lets both crew reroll any of their unplaced dice, once, behind their screens. Tokens come from the altitude track. Use one when your hand does not fit the jobs that are waiting.' },
  { id: 'final', g: 1, when: () => G.round === 6 && G.phase === 'brief', t: 'The landing round', x: 'This is the last round. The plane does not move: your engine total is compared with the brakes. To win by the end of the round: no planes left, all gear and flaps down, the axis exactly level, and the speed no greater than the brakes.' },
  { id: 'welcome2', g: 0, when: () => G.phase === 'brief' && G.round === 0, t: 'Briefing and silence', x: 'Talk strategy before you roll, never dice values. After the roll stay silent: your placements are your words.' }
];
function myTurn() { const v = viewSeat(); return typeof v === 'number' && v >= 0 && mayAct(v) && FA.pending(G).includes(v); }
function coachTick() {
  const c = UI.coach; if (!G || !UI.started || G.result || c.level === 'off') return;
  if (UI.mode === 'net' || UI.mode === 'hot' && UI.holder < 0) return;
  if (c.tip) return;
  for (const t of TIPS) { if (c.seen[t.id]) continue; if (t.g === 0 ? c.level === 'light' : (UI.mode === 'guided' || c.level === 'full' && t.g)) { let ok = false; try { ok = t.when(); } catch (e) { } if (ok) { if (c.level === 'light' && t.g) continue; c.tip = t.id; showTip(t); return; } } }
}
function showTip(t) {
  const pc = $('#pc'); if (!pc) return; pc.hidden = false; pc.innerHTML = '';
  const ids = TIPS.filter(x => x.g === 1).map(x => x.id), n = ids.indexOf(t.id) + 1;
  pc.append(h('div.ph-head', h('div.ph-t', h('b', t.t), h('span', t.g && n ? 'First flight, step ' + n + ' of ' + ids.length : 'Tip')), h('button.px', { type: 'button', 'data-a': 'tipok', 'aria-label': 'Close tip' }, '×')), h('div.ph-body', h('p', t.x), h('div.cbtns', h('button.btn.go', { type: 'button', 'data-a': 'tipok' }, 'Got it'), h('button.btn.alt', { type: 'button', 'data-a': 'tipoff' }, 'No more tips'))));
}
function tipOk() { const c = UI.coach, pc = $('#pc'); if (c.tip) c.seen[c.tip] = 1; c.tip = ''; if (pc) { pc.hidden = true; pc.innerHTML = ''; } setTimeout(coachTick, 150); }
// ---------- end card ----------
// ---- the story card at the start of a flight (airport, what is special today, how the colours work)
function showStory() {
  const rs = $('#rs'); if (!rs || !G || G.result) return; const sc = scenOf(), ap = D.airports[sc.ap], band = D.diffs[sc.col] || {};
  UI.rsOpen = true; rs.hidden = false; rs.innerHTML = ''; rs.className = 'story';
  const mods = sc.mods.map(m => D.mods[m]).concat(G.mods.tabs ? [D.mods.turns] : []).concat(G.mods.traffic ? [D.mods.traffic] : []);
  const box = h('div.rsbox.stbox', { role: 'dialog', 'aria-label': 'Flight story' },
    ART['end-land'] ? h('img.stimg', { src: ART['end-land'], alt: '' }) : null,
    h('h2', ap.name + ': ' + sc.title), h('p.sm.muted', (band.name || sc.col) + ' · ' + ap.wx + ', ' + ap.tod),
    h('p', sc.text), h('p.sm', ap.blurb),
    mods.length ? h('div', h('b', 'Today'), ...mods.map(m => h('div.why', h('b', m.name + ': '), m.text))) : h('p.sm', 'No extra rules today: just the panel, the track and each other.'),
    ...G.abil.map(a => h('div.why', h('b', D.abilities[a].name + ': '), D.abilities[a].text)),
    h('div.cbtns', h('button.btn.go', { type: 'button', 'data-a': 'rsclose' }, 'To the briefing')));
  rs.appendChild(box);
}
function closeRS() { const rs = $('#rs'); if (rs) { rs.hidden = true; rs.innerHTML = ''; rs.className = ''; } UI.rsOpen = false; if (typeof pxClearEnd === 'function' && G && G.result) pxClearEnd(); }
function checkRows(c) {
  const rows = [['planes', 'No planes left on the approach track'], ['gear', 'All landing gear down'], ['flaps', 'All flaps out'], ['axis', 'Axis level'], ['speed', 'Speed no more than the brakes'], ['intern', 'Trainee fully trained'], ['ice', 'Icy-runway brakes finished']];
  return rows.filter(r => r[0] in c).map(r => h('div.chk', h('i.' + (c[r[0]] ? 'ok' : 'no'), c[r[0]] ? '✓' : '×'), r[1]));
}
function showFinal() {
  const rs = $('#rs'); if (!rs || !G || !G.result) return; UI.rsOpen = true; rs.hidden = false; rs.innerHTML = ''; rs.className = '';
  const R = G.result, sc = scenOf(), ap = D.airports[sc.ap];
  const stats = G.used || {};
  const box = h('div.rsbox.' + (R.win ? 'win' : 'lose'), { role: 'dialog', 'aria-label': 'Flight debrief' },
    h('h2', R.win ? 'Landed at ' + ap.name + '!' : 'Flight lost'),
    h('p', R.win ? 'The passengers applaud. ' + sc.title + ' is done' + (UI.mode === 'guided' ? ': you have flown the first flight.' : '.') : R.msg),
    h('div', checkRows(R.checks || {})),
    h('div.kv', h('span', 'Rounds flown'), h('b', (G.round + 1) + ' of ' + (D.rounds - G.row0))), h('div.kv', h('span', 'Coffee earned'), h('b', String(stats.coffeeGain || 0))), h('div.kv', h('span', 'Planes cleared by radio'), h('b', String(stats.radioClear || 0))), h('div.kv', h('span', 'Rerolls spent'), h('b', String(stats.rerollUse || 0))),
    h('div.cbtns', UI.mode === 'net' ? (typeof isHost === 'function' && isHost() ? h('button.btn.go', { type: 'button', 'data-a': 'again' }, 'Fly again') : h('span.sm', 'The host can start another flight.')) : h('button.btn.go', { type: 'button', 'data-a': 'again' }, 'Fly again'), UI.mode !== 'net' && R.win ? h('button.btn', { type: 'button', 'data-a': 'nextsc' }, 'Next airport') : null, h('button.btn.alt', { type: 'button', 'data-a': 'rsclose' }, 'Look at the panel'), h('button.btn.alt', { type: 'button', 'data-a': 'menu' }, 'Menu')));
  rs.appendChild(box);
}
// ---------- drawers ----------
function logHTML() { const e = h('div.logl'); for (let i = G.log.length - 1; i >= Math.max(0, G.log.length - 150); i--) e.appendChild(h('div.ll', h('span.lt', 'R' + G.log[i].r), ' ' + G.log[i].t)); return e; }
function buildRules() {
  const root = h('div.rules'), sec = (t, ...k) => { root.appendChild(h('h3', t)); k.forEach(x => root.appendChild(x)); };
  sec('The goal', h('p', 'You and your crewmate fly an airliner onto the runway. You are the Pilot (blue) and the Co-pilot (orange). You win or lose together. The game lasts seven rounds, one altitude row each. By the end of the last round the plane must be on the airport with a clear track, the gear and flaps down, a level axis, and a slow enough speed.'));
  sec('How a round goes', h('ol', ...['Round start: the altitude row appears (it may bring a reroll token), and the traffic die may add planes.', 'Briefing: talk strategy, never dice values. Then both crew roll four dice behind their screens.', 'Silence. The first player (shown on the altitude row) puts one die on a free space of their colour, then you alternate until all eight dice are used.', 'End of round: both axis and both engine dice must be there. The plane sinks one row and the dice come back.'].map(t => h('li', t))));
  sec('Every control', h('ul', ...[
    'Axis (both, mandatory): the plane tilts toward the higher die by the difference. Tilt of 3 = spin = lost. It never resets.',
    'Engines (both, mandatory): the sum against the two markers (blue starts at 4, orange at 8): 0, 1 or 2 spaces. Leaving a space with a plane is a collision; passing the airport is an overshoot.',
    'Radio: pilot one space, co-pilot two, any value. It removes a plane from the space that many steps ahead (1 = your own space).',
    'Landing gear (pilot): 1-2, 3-4, 5-6 in any order. Each raises the blue marker by one.',
    'Flaps (co-pilot): 1-2, 2-3, 4-5, 5-6 strictly in order. Each raises the orange marker by one.',
    'Brakes (pilot): exactly 2, then 4, then 6. They only count in the last round.',
    'Concentration: any die, a coffee token (up to 3). Spend tokens to add or subtract 1 from any die you place (1 to 6, no wrapping).',
    'Reroll token: both crew may reroll any of their unplaced dice once.'].map(t => h('li', t))));
  sec('The last round', h('p', 'The plane does not move. Your engine total must be no more than the brake value (and the brakes must be at least 2). At the end of the round you win only if every one of these holds: no planes left, all gear and flaps down, the axis level, and that speed check passed.'));
  sec('You lose at once if', h('ul', ...['the tilt reaches 3', 'an axis or engine die is missing at the end of a round', 'you leave a space that holds a plane, or pass the airport', 'the last altitude starts and you are not at the airport', 'the fuel runs out (fuel scenarios)', 'your final speed is above the brakes'].map(t => h('li', t))));
  sec('Modules', h('div', ...Object.keys(D.mods).map(k => h('div.rcard', h('div.rt', h('b', D.mods[k].name), h('div', D.mods[k].text))))));
  sec('Ability cards', h('div', ...Object.keys(D.abilities).map(k => h('div.rcard', h('div.rt', h('b', D.abilities[k].name), h('div', D.abilities[k].text))))));
  sec('Playing on a phone', h('ul', ...['Tap a die in your tray, then tap a glowing space. Tap the die again to put it back.', 'Coffee buttons appear under the selected die when you hold tokens.', 'Hot-seat: a pass screen hides everything between turns. Online: you only ever see your own dice.', 'Hint shows what the computer crew would do and why.'].map(t => h('li', t))));
  root.appendChild(h('div', { html: '<section class="credits-audio"><h3>Credits</h3><p>Sound effects and jingles by Kenney (kenney.nl, CC0); ambience and music from OpenGameArt contributors under CC0 (full list in the licence log). Painted art is original and made by the generator in the repository. Names, text and art are original; the rules follow the rulebook.</p></section>' }));
  return root;
}
function buildRef() {
  const root = h('div.rules'), tr = (t, ...k) => { root.appendChild(h('h3', t)); k.forEach(x => root.appendChild(x)); };
  tr('Every airport and scenario (21)', h('div', ...['green', 'yellow', 'red', 'black'].map(col => h('div', h('div.band', h('i', { style: 'background:' + D.diffs[col].c }), D.diffs[col].name + ' (' + D.scenarios.filter(s => s.col === col).length + ')'), ...D.scenarios.filter(s => s.col === col).map(s => { const t = D.tracks[s.trk]; return h('div.rcard', h('div.rt', h('b', D.airports[s.ap].name + ': ' + s.title), h('div.sm', t.size + ' spaces, ' + t.sp.reduce((a, x) => a + x[0], 0) + ' planes at the start' + (s.mods.length ? ', ' + s.mods.map(m => D.mods[m].name).join(', ') : '') + (t.sp.some(x => x[2]) ? ', ' + D.mods.turns.name : '') + (t.sp.some(x => x[1]) ? ', ' + D.mods.traffic.name : '') + (s.ab ? ', ' + s.ab + ' ability card' + (s.ab > 1 ? 's' : '') : '')))); })))));
  tr('Components', h('ul', ...['4 blue dice (pilot) and 4 orange dice (co-pilot), rolled behind screens', '1 traffic die with faces 2, 3, 3, 4, 4, 5', '12 plane tokens, 3 coffee tokens, 3 reroll tokens', 'Blue and orange engine markers, a red brake marker', 'Approach strips (21) and two altitude tracks: green/yellow (rerolls at 6000 and 2000 ft) and red/black (reroll at 6000 ft)', 'Module parts: fuel track (starts at 20), wind dial, six trainee tokens, icy-runway brake track, 60-second timer', 'Six ability cards'].map(t => h('li', t))));
  tr('Spaces on the panel', h('ul', ...['Axis 1+1, Engines 1+1 (mandatory)', 'Radio 1 pilot + 2 co-pilot', 'Landing gear 3 (pilot): 1-2, 3-4, 5-6', 'Flaps 4 (co-pilot): 1-2, 2-3, 4-5, 5-6, in order', 'Brakes 3 (pilot): 2, 4, 6, in order', 'Concentration 3 (either)', 'Fuel 1 (either), Trainee 1+1, Icy-runway brakes 4 columns x 2'].map(t => h('li', t))));
  return root;
}
function renderCrew() {
  const b = $('#crewbody'); if (!b || !G) return; b.innerHTML = ''; const sc = scenOf(), ap = D.airports[sc.ap];
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
  if (!(typeof NET !== 'undefined' && NET.on)) { row('Computer speed', ...[['Fast', 150], ['Normal', 650], ['Slow', 1300]].map(([n, v]) => h('button.btn' + (AIDELAY === v ? '' : '.alt'), { 'data-a': 'speed', 'data-v': v, type: 'button' }, n))); row('Guide', ...['full', 'light', 'off'].map(n => h('button.btn' + ((UI.coach.level || UI.prefs.guide) === n ? '' : '.alt'), { 'data-a': 'guide', 'data-v': n, type: 'button' }, n[0].toUpperCase() + n.slice(1)))); row('Flight story card', ...[[true, 'On'], [false, 'Off']].map(([v, n]) => h('button.btn' + ((UI.prefs.story !== false) === v ? '' : '.alt'), { 'data-a': 'story', 'data-v': v ? '1' : '0', type: 'button' }, n))); }
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
    h('div.tbtns', h('button.tbtn.go', { 'data-a': 'play', type: 'button' }, h('b', 'Play'), h('span', 'fly with a computer crewmate')), h('button.tbtn', { 'data-a': 'online', type: 'button' }, h('b', 'Online'), h('span', 'with a friend, free')), sv ? h('button.tbtn', { 'data-a': 'loadsave', type: 'button' }, h('b', 'Resume'), h('span', 'your saved flight')) : null),
    h('button.tlink', { 'data-a': 'rules', type: 'button' }, 'How to play')));
}
function roleCard(s) {
  const o = optObj(), c = D.crew[s], on = o.role === s;
  return h('button.rcardx' + (on ? '.on' : ''), { type: 'button', 'data-a': 'role', 'data-r': s, style: '--dc:' + SEATC[s], 'aria-pressed': on ? 'true' : 'false' }, h('div.top', ART['crew-' + s] ? h('img', { src: ART['crew-' + s], alt: '' }) : null, h('h3', c.role + ': ' + c.name.split(' ').slice(-1)[0] + (on ? ' ✓' : ''))), h('p', c.story), h('p.enjoy', c.enjoy));
}
function scLine(sc) { const ex = sc.mods.map(m => D.mods[m].name).concat(sc.ab ? [sc.ab + ' ability card' + (sc.ab > 1 ? 's' : '')] : []); return D.airports[sc.ap].name + (ex.length ? ' · ' + ex.join(', ') : ' · no extras'); }
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
    case 'ready': case 'say': case 'rr': case 'rrpick': case 'antic': case 'adapt': case 'wt': case 'toss': case 'cof': case 'hint': doAction(a, t); break;
    case 'space': { const i = +d.i, s = trackOf().sp[i]; toast('Space ' + (i + 1) + (i === trackOf().sp.length - 1 ? ' (airport)' : '') + ': ' + G.planes[i] + ' plane' + (G.planes[i] === 1 ? '' : 's') + (s[1] ? ', ' + s[1] + ' traffic die roll' + (s[1] > 1 ? 's' : '') + ' when a round starts here' : '') + (s[2] && G.mods.tabs ? ', corridor: axis must be ' + tabText(s[2]) + ' to leave' : '')); break; }
    case 'take': takeDevice(+d.s); break;
    case 'tipok': tipOk(); break;
    case 'tipoff': UI.coach.level = 'off'; tipOk(); UI.prefs.guide = 'off'; savePrefs(); break;
    case 'rsclose': closeRS(); break;
    case 'again': { const c = UI.cfg || {}; const m = UI.mode; closeRS(); if (m === 'net') { netStart(); break; } newGame(m, { scenario: c.scenario, role: c.role, level: c.level, abil: c.abil }); break; }
    case 'nextsc': { const c = UI.cfg || {}, i = D.scenarios.findIndex(s => s.id === c.scenario), n = D.scenarios[(i + 1) % D.scenarios.length]; closeRS(); const m = UI.mode === 'guided' ? 'vs' : UI.mode; UI.opt = Object.assign({}, UI.opt, { scenario: n.id, abil: [] }); newGame(m, { scenario: n.id, role: c.role, level: c.level, abil: [] }); break; }
    case 'play': UI.sv = 'setup'; renderStart(); break;
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
    case 'guide': UI.coach.level = d.v; UI.prefs.guide = d.v; savePrefs(); renderMenu(); coachTick(); break;
    case 'gfx': if (typeof setGfx === 'function') setGfx(d.v); UI.prefs.gfx = d.v; savePrefs(); renderMenu(); break;
    case 'sound': UI.prefs.sound = !UI.prefs.sound; savePrefs(); try { if (window.GA) GA.setSfx(UI.prefs.sound); } catch (e) { } renderMenu(); break;
    case 'music': UI.prefs.music = !UI.prefs.music; savePrefs(); try { if (window.GA) GA.setMusic(UI.prefs.music); } catch (e) { } sndMusic(); renderMenu(); break;
  }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') { if (UI.rsOpen && G && G.result) closeRS(); else if (UI.sel !== -1 && UI.sel != null) { UI.sel = -1; UI.cof = 0; render(); } } });
// ---------- phone mode ----------
function applyPhone() {
  const q = /[?&]phone=(\d)/.exec(location.search), w = innerWidth, hh = innerHeight, short = Math.min(w, hh);
  let ph = short <= 500 || (window.matchMedia && matchMedia('(pointer:coarse)').matches && short <= 600);
  if (q) ph = q[1] === '1';
  const r = document.documentElement.classList, was = r.contains('ph');
  r.toggle('ph', ph); document.documentElement.style.setProperty('--dockh', (ph && w < hh ? Math.max(108, Math.min(320, Math.round(hh - 44 - FA.layoutLogical('P', 0, (G && G.mods) || {}, 0).ch * w / 800))) : Math.max(172, Math.min(212, Math.round(hh * .25)))) + 'px'); r.toggle('ph-p', ph && w < hh); r.toggle('ph-l', ph && w >= hh);
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
  addEventListener('resize', onResize); addEventListener('orientationchange', onResize);
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
  o.name = name; o.sp.texture = tx(name); o.tx = cx; o.ty = cy; o.size = size; o.sel = ctx.sel; o.rrm = ctx.rrm; o.cof = ctx.cof; o.seat = ctx.seat; o.val = dv.textContent.trim(); o.col = dv.classList.contains('b') ? 'b' : dv.classList.contains('o') ? 'o' : dv.classList.contains('t') ? 't' : 'k';
  if (o.fresh) {
    o.x = cx; o.y = cy;
    if (ctx.slot) {
      const vi = PX.vanished.findIndex(v => v.col === o.col && v.val === o.val); const from = vi >= 0 ? PX.vanished.splice(vi, 1)[0] : null;
      if (from && ANIM && !pxRM()) { o.x = from.x; o.y = from.y; o.size0 = from.size; pxTween(o, { x: [from.x, cx], y: [from.y, cy], rot: [0, (from.x < cx ? 1 : -1) * .35 * 0], s: [1.25, 1] }, 360, 0, () => { o.sq = 1; pxLanded(o); }, true); }
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
  if (youEl) { const r = pxRect(youEl), sz = Math.min(r.w * .9, 58), cx = r.x + r.w / 2, cy = r.y + r.h * .5; const o = pxObj('you', 'tok', () => { const s = new PIXI.Sprite(tx('tokens:you')); s.anchor.set(.5); PX.L.plane.addChild(s); return { c: s, s0: s, x: cx, y: cy, size: sz, a: 1, s: 1, rot: 0 }; }); o.tx = cx; o.ty = cy; o.size = sz; if (o.fresh) { o.x = cx; o.y = cy; } o.bob = 1; }
  // wells under every slot, gold ring on the legal ones, switches
  const slotDice = [];
  pz.querySelectorAll('.slot').forEach(b => {
    const k = b.dataset.slot, r = pxRect(b), cls = b.classList.contains('p') ? 'wellB' : b.classList.contains('c') ? 'wellO' : 'wellN';
    const o = pxObj('well:' + k, 'well', () => { const c = new PIXI.Container(), w = pxSprite(c, 'tokens:' + cls), g = new PIXI.Sprite(tx('glow')); g.anchor.set(.5); c.addChild(g); PX.L.well.addChild(c); return { c, w, g, x: 0, y: 0, s: 1, a: 1 }; });
    o.tx = o.x = r.x + r.w / 2; o.ty = o.y = r.y + r.h / 2; o.size = r.w; o.w.width = o.w.height = r.w; o.legal = b.classList.contains('legal'); o.g.width = o.g.height = r.w * 1.7;
    o.c.x = o.x; o.c.y = o.y;
    const sw = b.querySelector('.sw');
    if (sw) { const rr = pxRect(sw), on = sw.classList.contains('on'); const so = pxObj('sw:' + k, 'sw', () => { const s = new PIXI.Sprite(tx('tokens:swoff')); s.anchor.set(.5); PX.L.mark.addChild(s); return { c: s, s0: s, x: 0, y: 0, a: 1, s: 1, rot: 0, on }; }); so.tx = so.x = rr.x + rr.w / 2; so.ty = so.y = rr.y + rr.h / 2; so.size = Math.max(22, rr.w); so.s0.texture = tx(on ? 'tokens:swon' : 'tokens:swoff'); if (!so.fresh && so.on !== on && ANIM) pxTween(so, { s: [1.5, 1] }, 260, 0, null, false); so.on = on; }
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
      pxDie(key, dv, pxRect(b), { seat: s, i: +d || 0, sel: b.classList.contains('sel'), rrm: b.classList.contains('rrm'), cof: dv.classList.contains('cof'), roll: roll });
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
  { const g = pz.querySelector('.gau'); if (g) { const r = pxRect(g), o = pxObj('gauge', 'gauge', () => { const c = new PIXI.Container(), f = pxSprite(c, 'gauge', 0), n = new PIXI.Graphics(); c.addChild(n); PX.L.mark.addChild(c); return { c, f, n }; }); o.c.x = r.x; o.c.y = r.y; o.f.width = r.w; o.f.height = r.h; o.f.x = 0; o.f.y = 0; o.r = r;
    const m = /markers (\d+) \| (\d+)/.exec(g.textContent); o.b = m ? +m[1] : 4; o.o = m ? +m[2] : 8; o.dirty = 1; } }
  { const b = pz.querySelector('.bar'); if (b) { const r = pxRect(b), i = b.querySelector('i'), f = i ? parseFloat(i.style.width) / 100 : 0; const o = pxObj('fuel', 'bar', () => { const c = new PIXI.Container(), g = new PIXI.Graphics(), fr = new PIXI.NineSliceSprite({ texture: tx('pillbar'), leftWidth: 20, rightWidth: 20, topHeight: 12, bottomHeight: 12 }); c.addChild(g, fr); PX.L.mark.addChild(c); return { c, g, fr }; }); o.c.x = r.x; o.c.y = r.y; o.fr.width = r.w; o.fr.height = r.h; o.g.clear(); o.g.roundRect(5, 4, Math.max(2, (r.w - 10) * f), r.h - 8, (r.h - 8) / 2).fill(f < .3 ? 0xe8553a : 0x2fc4b2); } }
  pz.querySelectorAll('.chipr .tk').forEach((e, i) => { const r = pxRect(e), off = e.classList.contains('off'); const o = pxObj('cf' + i, 'tok', () => { const s = new PIXI.Sprite(tx('tokens:coffee')); s.anchor.set(.5); PX.L.mark.addChild(s); return { c: s, s0: s, x: 0, y: 0, a: 1, s: 1, rot: 0 }; }); o.tx = o.x = r.x + r.w / 2; o.ty = o.y = r.y + r.h / 2; o.size = Math.max(26, r.w * 1.5); o.a = off ? .28 : 1; });
  { const e = pz.querySelector('.badge .tk.rr'); if (e) { const r = pxRect(e); const o = pxObj('rr', 'tok', () => { const s = new PIXI.Sprite(tx('tokens:reroll')); s.anchor.set(.5); PX.L.mark.addChild(s); return { c: s, s0: s, x: 0, y: 0, a: 1, s: 1, rot: 0 }; }); o.tx = o.x = r.x + r.w / 2; o.ty = o.y = r.y + r.h / 2; o.size = Math.max(28, r.w * 1.4); } }
  pz.querySelectorAll('.tokrow .ch').forEach((e, i) => { const r = pxRect(e), v = +e.textContent || 1; const o = pxObj('tr' + i + ':' + v, 'tok', () => { const s = new PIXI.Sprite(tx('dice:t' + v)); s.anchor.set(.5); PX.L.mark.addChild(s); return { c: s, s0: s, x: 0, y: 0, a: 1, s: 1, rot: 0 }; }); o.tx = o.x = r.x + r.w / 2; o.ty = o.y = r.y + r.h / 2; o.size = Math.max(26, r.h); });
  // sweep objects not seen this sync; trays dice that vanished become fly-in candidates
  for (const k of prevKeys) { const o = PX.objs.get(k); if (!o || o.seen === PX.seq) continue; pxKill(k, o); }
  PX.dirty = true;
}
function pxKill(k, o) { try { o.c.destroy({ children: true }); } catch (e) { } if (o.fr && o.fr !== o.c) try { o.fr.destroy(); } catch (e) { } PX.tw = PX.tw.filter(t => t.o !== o); PX.objs.delete(k); }
// ---- the loop ----
function pxLoop() {
  const step = ts => { PX.raf = requestAnimationFrame(step); const dt = Math.min(.25, (ts - (PX.last || ts)) / 1000); PX.last = ts; if (PX.on) pxTick(dt); }; PX.raf = requestAnimationFrame(step);
}
function pxMoving() { return PX.tw.length > 0 || PX.parts.length > 0 || !!PX.endA || [...PX.objs.values()].some(o => o.legal || o.bob || (o.size && o.tx != null && (Math.abs((o.x || 0) - o.tx) > .4 || Math.abs((o.y || 0) - o.ty) > .4)) || (o.want != null && Math.abs(o.ang - o.want) > .2)); }
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
      o.gl.width = o.gl.height = sz * 1.35; o.gl.texture = o.rrm ? tx('violet') : tx('glow'); o.gl.alpha = (o.sel || o.rrm) ? (.4 + (q.fx ? .2 * Math.sin(PX.t * 5) : 0)) : (o.cof ? .3 : 0); if (o.sel || o.rrm) any = true;
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
    } else if (o.kind === 'gauge' && o.dirty) {
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
  if (a.win) { const p = Math.min(1, Math.max(0, (t - .3) / 2.2)), e = ease(p); a.plane.x = W * (.18 + .55 * e); a.plane.y = H * (.22 + .5 * e); a.plane.rotation = -.12 * (1 - e) + .02; a.plane.scale.x = a.plane.scale.y = Math.abs(a.plane.scale.x) * 1; a.plane.alpha = 1 - Math.max(0, (t - 2.3) / .5) * 0; if (t > 3.0 && !a.done) { a.done = true; PX.endA = null; PX.L.end.removeChildren(); a.cb(); } }
  else { const p = Math.min(1, Math.max(0, (t - .3) / 1.4)), e = p * p; a.plane.x = W * (.2 + .45 * p); a.plane.y = H * (.2 + .55 * e); a.plane.rotation = .1 + .9 * e; a.flash.alpha = t > 1.7 ? Math.max(0, .6 - (t - 1.7) * 1.2) : 0; if (t > 1.7 && q_fx()) { PX.L.end.x = (Math.random() - .5) * 8 * Math.max(0, 1 - (t - 1.7)); PX.L.end.y = (Math.random() - .5) * 8 * Math.max(0, 1 - (t - 1.7)); } if (t > 3.0 && !a.done) { a.done = true; PX.endA = null; PX.L.end.x = PX.L.end.y = 0; PX.L.end.removeChildren(); a.cb(); } }
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
