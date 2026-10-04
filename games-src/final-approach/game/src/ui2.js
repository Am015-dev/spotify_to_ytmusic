// ===================== part 2: render the panel (DOM hit layer) and the dock =====================
const PLANE_SVG = '<svg viewBox="0 0 24 24" width="12" height="12"><path d="M12 2l2 7 8 4v2l-8-2-1 6 3 2v1l-4-1-4 1v-1l3-2-1-6-8 2v-2l8-4z" fill="#fff"/></svg>';
function tabText(a) { return a.slice().sort((x, y) => x - y).map(n => n === 0 ? 'C' : (n < 0 ? 'L' : 'R') + Math.abs(n)).join(' '); }
// the 60 s clock of the Against the Clock module: one element in the altitude line (portrait phones) or the HUD (landscape / desktop)
function rtEl() { if (!UI.rt || !G.mods.real || G.result) return null; const s = Math.max(0, Math.ceil(UI.rt.left / 1000)); return h('span.rtleft' + (s <= 10 && G.phase === 'place' ? '.low' : ''), { role: 'timer', 'aria-label': s + ' seconds left this round' }, '⏱ ' + s + ' s'); }
function css(el, r) { el.style.left = r.x + 'px'; el.style.top = r.y + 'px'; el.style.width = r.w + 'px'; el.style.height = r.h + 'px'; return el; }
// the plain look of a die: a number in a rounded square
function dvEl(v, cls) { return h('span.dv' + (cls ? '.' + cls.trim().replace(/ +/g, '.') : ''), String(v)); }
const SLOTCAP = { axis: 'Axis', engines: 'Engine', radio: 'Radio', gear: 'Gear', flaps: 'Flap', brakes: 'Brake', conc: 'Coffee', kero: 'Fuel', intern: 'Train', ice: 'Ice' };
// mandatory spaces of seat a that are still empty, and how many dice it has left: warn before a missing Axis / Engine die loses the flight
function mandInfo(a) { if (!G || typeof a !== 'number' || a < 0 || G.phase !== 'place' || G.result) return null; const need = ['ax' + a, 'en' + a].filter(k => !G.slots[k]), left = FA.unusedDice(G, a).length; return { need, left, tight: need.length > 0 && left > 0 && left <= need.length, lost: need.length > left }; }
const needNames = need => need.map(k => FA.SLOT[k].grp === 'axis' ? 'Axis' : 'Engines').join(' and ');
// which control a guided tip is about: those elements get a pulsing ring while the tip is up
const TIPHL = { axis: ['.slot[data-slot^=ax]', '.dial.axd'], engines: ['.slot[data-slot^=en]', '.gau'], track: ['.w.appr'], radio: ['.slot[data-slot^=ra]'], alt: ['.w.altw'], gear: ['.slot[data-slot^=lg]', '.gau'], flaps: ['.slot[data-slot^=fl]', '.gau'], brakes: ['.slot[data-slot^=br]', '.slot[data-slot^=it]', '.slot[data-slot^=ib]', '.badge.brk'], conc: ['.slot[data-slot^=co]', '.chipr'], rr: ['.badge.rrb'], dice: ['.tray'], 'n-dice': ['.tray'], 'n-mand': ['.slot[data-slot^=ax]', '.slot[data-slot^=en]'], hint: [], welcome: [], brief: [] };
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
      w.appendChild(h('div.altnow', h('b', R[0] + ' ft'), tm, h('span.fp.' + (R[1] ? 'c' : 'p'), fw(R[1]) + (tm ? ' first' : fw(R[1]) === 'You' ? ' go first' : ' goes first'))));
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
    if (d) b.appendChild(dvEl(d.v, d.k === 'i' ? 't' : d.k === 'x' ? 'k' : (d.s === 0 ? 'b' : 'o'))); else { const lab = SLOTLAB(k); b.appendChild(h('span.cap' + (lab ? '' : '.mid'), SLOTCAP[S.grp] || '')); if (lab) b.appendChild(h('span.sl', lab)); }
    const swOn = S.grp === 'gear' && G.pl.sw.lg[S.ix] || S.grp === 'flaps' && G.pl.sw.fl[S.ix] || S.grp === 'brakes' && G.pl.sw.br[S.ix];
    if (swOn) { b.appendChild(h('i.sw.on')); if (!d) { b.classList.add('done'); b.appendChild(h('i.dn', { 'aria-hidden': 'true' }, '✓')); b.setAttribute('aria-label', b.getAttribute('aria-label') + ', done'); } } else if (['gear', 'flaps', 'brakes'].includes(S.grp)) b.appendChild(h('i.sw'));
    if (!d && (S.s === 0 || S.s === 1)) { const sl = b.querySelector('.sl'); b.insertBefore(h('i.seat.' + (S.s ? 'c' : 'p'), { 'aria-hidden': 'true' }, S.s ? 'C' : 'P'), sl || null); }
    pz.appendChild(b);
  }
  // ---- dial, gauge, brake readout
  { const a = G.pl.axis, dl = h('div.dial.axd', { 'aria-label': 'Axis: ' + (a === 0 ? 'level' : Math.abs(a) + ' toward the ' + (a < 0 ? 'pilot' : 'co-pilot')) }, h('i', { style: 'transform:rotate(' + (a * 24) + 'deg)' }), h('span', { style: 'position:relative;margin-top:44%' }, a === 0 ? 'level' : Math.abs(a) + (a < 0 ? ' left' : ' right'), a !== 0 ? h('small.spn', 'spin at 3') : null));
    pz.appendChild(css(dl, r.dial));
    // speed gauge: the blue marker (up to it the plane stays) and the orange marker (up to it one space, above it two) in their own corners, clear of the needles
    pz.appendChild(css(h('div.gau', { 'data-b': G.pl.aeroB, 'data-o': G.pl.aeroO, 'aria-label': 'Speed gauge: engine sum up to ' + G.pl.aeroB + ' stays, up to ' + G.pl.aeroO + ' moves one space, more moves two' + (G.speed >= 0 ? '; last speed ' + G.speed : '') }, h('span.mk.b', { title: 'Blue marker: a sum up to this stays put' }, '≤' + G.pl.aeroB), h('span.mk.o', { title: 'Orange marker: up to this moves 1, above moves 2' }, '≤' + G.pl.aeroO)), r.gauge));
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
      const b = h('button.die' + (used ? '.used' : '') + (show && !used && mayAct(s) ? '' : '.cover') + (sel ? '.sel' : '') + (rrmode && UI.rrm[i] ? '.rrm' : ''), { type: 'button', 'data-a': 'die', 'data-s': s, 'data-d': i, style: 'width:' + ds + 'px;height:' + ds + 'px', 'aria-label': used ? 'used' : (show ? pname(s) + ' die showing ' + cv + (cv !== d.v ? ' (with coffee, rolled ' + d.v + ')' : '') : pname(s) + ' die, hidden'), disabled: (used || !(show && mayAct(s))) ? true : null });
      b.appendChild(dvEl(show ? cv : '?', (s === 0 ? 'b' : 'o') + (show ? '' : ' q') + (show && cv !== d.v ? ' cof' : ''))); tr2.appendChild(b);
    }
    if (G.pend && (G.pend.h === 'intern' && G.pend.d.seat === s || G.pend.h === 'sync' && s === 1) && (show || sharedSeat() === s)) { const val = G.pend.d.val + (UI.sel === 'p' && G.pend.h === 'sync' ? UI.cof : 0); tr2.appendChild(h('button.die' + (UI.sel === 'p' ? '.sel' : ''), { type: 'button', 'data-a': 'die', 'data-s': s, 'data-d': 'p', style: 'width:' + ds + 'px;height:' + ds + 'px', 'aria-label': (G.pend.h === 'intern' ? 'Trainee token ' : 'Traffic die ') + val }, dvEl(val, (G.pend.h === 'intern' ? 't' : 'k') + (val !== G.pend.d.val ? ' cof' : '')))); }
    pz.appendChild(tr2);
  }
  // ---- hud
  if (r.hud) { const row = rows[G.round + G.row0]; pz.appendChild(css(h('div.hudc', h('b', 'Round ' + (G.round + 1) + ' of ' + (D.rounds - G.row0) + (isPh() ? '' : ' · ' + row[0] + ' ft')), (tm => isPh() && tm ? tm : [h('span', G.result ? 'Flight over' : G.phase === 'brief' ? 'Briefing' : (G.pend ? pendLabel() : (G.turn === 0 ? 'Pilot' : 'Co-pilot') + ' places')), tm])(rtEl())), r.hud)); }   // phones: two short lines, the clock replaces the turn line (the prompt says whose turn it is)
  // the control the current guided tip talks about
  if (UI.coach && UI.coach.tip && TIPHL[UI.coach.tip]) for (const sel of TIPHL[UI.coach.tip]) pz.querySelectorAll(sel).forEach(e => e.classList.add('hl'));
  renderDock(); renderBar();
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
    if (!G.result && ANIM) showRecap(UI.lastRound);
    UI.prevSlots = Object.keys(G.slots); UI.hold = null;
  }
  UI.lastPos = G.pl.pos; UI.lastRound = G.round;
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
function showRecap(r) {
  const el = $('#recap'); if (!el) return; const rows = altRows(), R = rows[r + G.row0], N = rows[G.round + G.row0];
  const lines = G.log.filter(l => l.r === r + 1 && RECAP_RE.test(l.t)).map(l => feedText(l.t)).slice(-7);
  const traffic = G.log.filter(l => l.r === G.round + 1 && /^Traffic die/.test(l.t)).map(l => l.t);
  el.innerHTML = ''; el.hidden = false; UI.recapR = r;
  // grouped by control: axis / speed / radio / switches / other
  const GRP = [['Axis', /^(Axis|Wind dial|Steady Hands)/], ['Speed', /^(Speed|Landing speed|Twin Thrust)/], ['Radio', /^Radio/], ['Switches', /^(Landing gear|Flaps|Brakes|Icy runway)/], ['Other', /./]], grp = {};
  for (const t of lines) { const g = GRP.find(x => x[1].test(t)); (grp[g[0]] = grp[g[0]] || []).push(t); }
  const keep = UI.mode === 'guided' || !Object.keys(UI.won || {}).length;   // first flights: the card waits for a tap
  el.appendChild(h('div.rcp', { role: 'status' }, h('b', 'Round ' + (r + 1) + ' done at ' + R[0] + ' ft'), ...(lines.length ? GRP.filter(g => grp[g[0]]).map(g => h('div.rg', h('i', g[0]), h('div', ...grp[g[0]].map(t => h('div.rl', t))))) : [h('div.rl', 'A quiet round.')]), ...traffic.map(t => h('div.rl.tr', t)),
    N ? h('div.rn', 'Next: ' + N[0] + ' ft, ' + (who(N[1]) === 'You' ? 'you place first' : name(N[1]) + ' places first') + '.') : null, h('button.btn.alt.rx', { type: 'button', 'data-a': 'recapx' }, 'OK')));
  clearTimeout(UI.recapT); if (!keep) UI.recapT = setTimeout(hideRecap, 6500);
}
function hideRecap() { const el = $('#recap'); if (el) { el.hidden = true; el.innerHTML = ''; } UI.recapR = null; clearTimeout(UI.recapT); }
// ---------- the dock: what to do now ----------
function promptText() {
  if (!G) return '';
  if (G.result) return G.result.win ? 'Landed! Well flown.' : 'The flight is over.';
  const v = actSeat(), pend = FA.pending(G), hot = UI.mode === 'hot' && UI.holder < 0;
  if (G.phase === 'brief') {
    if (typeof v === 'number' && v >= 0 && mayAct(v)) return hot ? name(v) + ': talk strategy (no dice values), then Roll.' : G.ready[v] ? 'Waiting for your crewmate to be ready.' : 'Talk strategy, no dice values. Then Roll.';
    return G.ready.every(Boolean) ? 'Rolling...' : 'Briefing: ' + pend.map(name).join(' and ') + ' getting ready.';
  }
  if (G.pend) {
    const p = G.pend, me = typeof v === 'number' && v >= 0 && mayAct(v);
    if (p.h === 'rr') return me && !p.d.m[v] ? rrBy(v) + ' Tap dice to reroll them, or keep yours.' : 'Reroll: waiting for ' + pend.map(name).join(' and ') + '.';
    if (p.h === 'intern') return me && v === p.d.seat ? (hot ? name(v) + ': place' : 'Place') + ' trainee token ' + p.d.val + ': tap it, then a space.' : name(p.d.seat) + ' is placing the trainee token.';
    if (p.h === 'sync') return me && v === 1 ? (hot ? name(1) + ': place' : 'Place') + ' the cross-check die (' + p.d.val + ') on any empty space.' : name(1) + ' is placing the cross-check die.';
    if (p.h === 'wt') return me && v === 1 - p.d.a ? 'Hand-over: pick one of your dice to swap.' : 'Hand-over: waiting for ' + name(1 - p.d.a) + '.';
  }
  if (typeof v === 'number' && v >= 0 && mayAct(v) && G.turn === v) { const mi = mandInfo(v); if (mi && mi.lost) return 'Too few dice left for the ' + needNames(mi.need) + '!'; if (mi && mi.tight) return 'Keep your last ' + (mi.left > 1 ? mi.left + ' dice' : 'die') + ' for the ' + needNames(mi.need) + '.'; return (UI.sel === -1 || UI.sel == null ? 'Your turn: tap one of your dice.' : 'Tap a glowing space to place the die.'); }
  if (v === 'all') return name(G.turn) + ' is placing.';
  return 'Waiting for ' + name(G.turn) + '...';
}
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
  const gl = $('#goal'); if (gl) { gl.innerHTML = ''; gl.hidden = !!G.result || (isPh() && (!document.documentElement.classList.contains('ph-p') || innerHeight < 700) && (!!(UI.coach && UI.coach.tip) || (UI.sel != null && UI.sel !== -1)));   /* landscape and short phones: the tip or the die card needs the room */ if (!G.result) gl.appendChild(goalEl()); }
  // selected die info
  const si = $('#selinfo'); if (si) { si.innerHTML = ''; si.className = 'idle'; si.hidden = !!G.result;
    if (typeof v === 'number' && v >= 0 && mayAct(v) && !G.result && G.phase === 'place') {
      const sel = UI.sel, pend = G.pend, mi = mandInfo(v);
      if (pend && pend.h === 'rr' && !pend.d.m[v]) { si.className = ''; si.append(h('b', rrBy(v)), h('span', 'Both of you may now reroll any unplaced dice, once. Tap the dice you want to reroll (they turn purple), then Reroll. Happy with your dice? Keep them.')); }
      else if (sel === 'p' || (typeof sel === 'number' && sel >= 0 && !pend)) {
        si.className = ''; const val = sel === 'p' ? pend.d.val : G.dice[v][sel].v; const lg = selectedLegal();
        const php = isPh();   // phones: the coffee stepper shares the title row
        const shd = h('div.shd', h('b', (sel === 'p' ? (pend.h === 'intern' ? 'Trainee token ' : 'Traffic die ') : 'Die ') + val), sel !== 'p' ? h('button.btn.alt', { type: 'button', 'data-a': 'unsel' }, 'Change die') : null); si.append(shd);
        if (mi && mi.tight && !mi.lost && sel !== 'p') si.append(h('div.warn', 'Keep this die for the ' + needNames(mi.need) + ': ' + (mi.left === 1 ? 'it is your last one' : 'you have ' + mi.left + ' dice left') + ', and an empty Axis or Engines space at the end of the round loses the flight.'));
        if (mi && mi.lost) si.append(h('div.warn', 'Too few dice left: your ' + needNames(mi.need) + ' cannot all be filled. The flight will be lost at the end of the round.'));
        // coffee: one row, minus / value / plus
        if ((sel !== 'p' || pend.h === 'sync') && G.coffee > 0) { const lo = -Math.min(G.coffee, val - 1), hi = Math.min(G.coffee, 6 - val);
          const cofEl = h('div.cof', h('span.lab', php ? { 'aria-label': G.coffee + ' coffee tokens', title: 'Coffee tokens' } : {}, php ? '☕' + G.coffee : 'Coffee (' + G.coffee + ')'), h('button.chipb', { type: 'button', 'data-a': 'cof', 'data-c': Math.max(lo, UI.cof - 1), disabled: UI.cof <= lo ? true : null, 'aria-label': 'One less' }, '−'), h('span.cv', String(val + UI.cof)), h('button.chipb', { type: 'button', 'data-a': 'cof', 'data-c': Math.min(hi, UI.cof + 1), disabled: UI.cof >= hi ? true : null, 'aria-label': 'One more' }, '+')); if (php) shd.insertBefore(cofEl, shd.querySelector('[data-a=unsel]')); else si.append(cofEl); }
        if ((sel !== 'p' || pend.h === 'sync') && G.coffee > 0) si.append(h('span.eff.cofl', UI.cof ? 'Coffee: ' + val + ' → ' + (val + UI.cof) + ', uses ' + Math.abs(UI.cof) + ' of ' + G.coffee + ' shared tokens.' : 'Coffee: − / + change it by 1 per shared token.'));   // always one line, so the stepper never moves
        if (UI.hint && UI.hint.d === sel) si.append(h('div.why', UI.hint.why));
        const dk = Object.keys(UI.dead || {}); if (dk.length) si.append(h('div.warn.dead', 'Red space' + (dk.length > 1 ? 's' : '') + ' (' + dk.map(slotName).filter((x, i, a) => a.indexOf(x) === i).join(', ') + '): ' + UI.dead[dk[0]]));
        if (lg.length && sel !== 'p') { const eff = effectLine(v, val + UI.cof); if (eff) si.append(h('span.eff', eff)); }
        si.append(h('span.fits', lg.length ? 'Fits: ' + lg.map(slotName).filter((x, i, a) => a.indexOf(x) === i).join(', ') + '.' : 'No space takes this value right now. Try coffee or another die.'));
      } else if (G.turn === v && !pend) { if (mi && (mi.tight || mi.lost)) si.className = ''; if (mi && mi.lost) si.append(h('div.warn', 'Too few dice left: your ' + needNames(mi.need) + ' cannot all be filled this round.')); if (mi && mi.tight && !mi.lost) si.append(h('div.warn', 'Only ' + mi.left + ' ' + (mi.left > 1 ? 'dice' : 'die') + ' left and the ' + needNames(mi.need) + ' still empty: those spaces glow red. Fill them first.')); si.append(h('span', 'Tap one of your dice. Hint shows what the computer would do.')); if (UI.hint) si.append(h('div.why', UI.hint.why)); }
      else si.append(h('span', 'Not your move yet. You may still spend a reroll token or an ability below.'));
    } else if (G.phase === 'brief') si.append(h('span', 'Silence rule: from the roll to the end of the round you do not talk. Placing a die is how you talk now.'));
    else si.append(h('span', G.result ? '' : 'Watch the panel.'));
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
function goalEl() {
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
    if (UI.mode !== 'net' || (typeof isHost === 'function' && isHost())) b('Fly again', 'again', 'go'); if (UI.mode !== 'net' && G.result.win) b('Next airport', 'nextsc'); b('Debrief', 'debrief', 'alt'); return f; }
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
  b('Hint', 'hint', 'alt', { title: 'What the computer would do with your dice, and why' });
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
