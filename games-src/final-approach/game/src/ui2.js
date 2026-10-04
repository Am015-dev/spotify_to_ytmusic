// ===================== part 2: render the panel (DOM hit layer) and the dock =====================
const PLANE_SVG = '<svg viewBox="0 0 24 24" width="12" height="12"><path d="M12 2l2 7 8 4v2l-8-2-1 6 3 2v1l-4-1-4 1v-1l3-2-1-6-8 2v-2l8-4z" fill="#fff"/></svg>';
function tabText(a) { return a.slice().sort((x, y) => x - y).map(n => n === 0 ? 'C' : (n < 0 ? 'L' : 'R') + Math.abs(n)).join(' '); }
function css(el, r) { el.style.left = r.x + 'px'; el.style.top = r.y + 'px'; el.style.width = r.w + 'px'; el.style.height = r.h + 'px'; return el; }
// the plain look of a die: a number in a rounded square
function dvEl(v, cls) { return h('span.dv' + (cls ? '.' + cls : ''), String(v)); }
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
  const W = bd.clientWidth, Hh = bd.clientHeight; if (W < 10 || Hh < 10) return;
  const LY = UI.LY = FA.layout(W, Hh, { mods: G.mods }); UI.W = W;
  const v = viewSeat(), me = typeof v === 'number' ? v : -1, legal = selectedLegal(), r = LY.r, rows = altRows(), tr = trackOf(), size = tr.sp.length;
  pz.innerHTML = '';
  const dieSz = Math.max(30, Math.min(LY.k * 72, 80));
  // ---- approach window
  { const w = css(h('div.w.appr', { 'aria-label': 'Approach track' }, h('span.tl', 'Approach')), r.appr), cw = Math.max(Math.min(r.appr.w / size, 130), 54), tot = cw * size;
    const strip = h('div.strip', { style: 'position:absolute;left:0;top:0;bottom:0;width:' + tot + 'px;transition:transform .5s ease' });
    const off = tot <= r.appr.w ? (r.appr.w - tot) / 2 : -Math.max(0, Math.min(tot - r.appr.w, (G.pl.pos - 1.4) * cw)); strip.style.transform = 'translateX(' + Math.round(off) + 'px)'; UI.stripOff = off; UI.cw = cw;
    for (let i = 0; i < size; i++) {
      const s = tr.sp[i], n = G.planes[i], b = h('button.sp' + (i + 1 === G.pl.pos ? '.you' : '') + (i === size - 1 ? '.air' : ''), { type: 'button', 'data-a': 'space', 'data-i': i, style: 'left:' + i * cw + 'px;width:' + cw + 'px', 'aria-label': 'Space ' + (i + 1) + (i === size - 1 ? ' (airport)' : '') + ', ' + n + ' plane' + (n === 1 ? '' : 's') + (s[1] ? ', traffic die x' + s[1] : '') + (s[2] ? ', corridor ' + tabText(s[2]) : '') + (i + 1 === G.pl.pos ? ', your plane is here' : '') });
      const pls = h('div.pls'); for (let k = 0; k < n; k++) pls.appendChild(h('i.pl', { html: PLANE_SVG }));
      if (s[1]) pls.appendChild(h('i.tf', '⚄' + (s[1] > 1 ? '×' + s[1] : ''))); if (s[2] && G.mods.tabs) pls.appendChild(h('i.tb', tabText(s[2])));
      b.append(pls, h('span.nm', i === size - 1 ? 'Airport' : String(i + 1)), i + 1 === G.pl.pos ? h('span.nm', { style: 'color:var(--gold)' }, '▲ you') : null); strip.appendChild(b);
    }
    w.appendChild(strip); pz.appendChild(w);
  }
  // ---- altitude window
  { const w = css(h('div.w.altw', { 'aria-label': 'Altitude track' }, h('span.tl', 'Altitude')), r.alt), n = rows.length - G.row0, cw = r.alt.w / n;
    for (let i = 0; i < n; i++) { const R = rows[i + G.row0]; const el = h('div.ar' + (i === G.round ? '.cur' : (i < G.round ? '.past' : '')), { style: 'left:' + i * cw + 'px;width:' + cw + 'px;top:' + (r.alt.h > 100 ? 12 : 10) + 'px;bottom:0' }, h('span', R[0] + ' ft', R[2] ? h('i.rr', { title: 'reroll token' }) : null), h('small', 'first: ', h('span.fp.' + (R[1] ? 'c' : 'p'), R[1] ? 'Co' : 'Pi'))); w.appendChild(el); }
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
    const brk = r.br1 || r.it1; if (brk) pz.appendChild(css(h('div.badge', 'Brakes ' + bv), { x: (r.br0 || r.it0).x, y: (r.br0 || r.it0).y - 22, w: Math.max(70, 70), h: 20 }));
  }
  // ---- coffee, rerolls
  { const cf = h('div.chipr'); for (let i = 0; i < 3; i++) cf.appendChild(h('i.tk.cf' + (i < G.coffee ? '' : '.off'))); pz.appendChild(css(cf, r.coffee));
    pz.appendChild(css(h('div.badge', { 'aria-label': G.rrHand + ' reroll tokens' }, h('i.tk.rr'), h('b', '×' + G.rrHand)), r.rerolls)); }
  if (G.mods.fuel && r.fuel) { const f = Math.max(0, Math.min(1, G.pl.kero / D.keroStart)); pz.appendChild(css(h('div.bar', { 'aria-label': 'Fuel ' + G.pl.kero }, h('i', { style: 'width:' + f * 100 + '%' }), h('span', 'Fuel ' + G.pl.kero)), r.fuel)); }
  if (G.mods.wind && r.wind) pz.appendChild(css(h('div.dial', { style: 'font-size:12px;background:#3e8fd8' }, 'Wind ' + (FA.windMod(G) >= 0 ? '+' : '') + FA.windMod(G)), r.wind));
  if (G.mods.intern && r.tokens) { const t = h('div.tokrow', { 'aria-label': 'Trainee tokens left: ' + G.intern.join(', ') }); G.intern.forEach(x => t.appendChild(h('i.ch', String(x)))); pz.appendChild(css(t, r.tokens)); }
  // ---- trays
  for (const s of [0, 1]) {
    const q = s === 0 ? r.trayP : r.trayC, show = v === 'all' || v === s, nd = 4, gap = 6, ds = Math.min(dieSz * 1.05, (q.w - 12 - gap * (nd - 1)) / nd, q.h - 14);
    const tr2 = css(h('div.tray.' + (s === 0 ? 'p' : 'c'), { 'aria-label': pname(s) + "'s dice" + (show ? '' : ' (hidden behind the screen)') }, h('span.who', pname(s) + (show ? '' : ' · hidden'))), q);
    const rrmode = G.pend && G.pend.h === 'rr' && me === s && mayAct(s) && !G.pend.d.m[s];
    for (let i = 0; i < 4; i++) {
      const d = G.dice[s][i], used = d.u || G.phase !== 'place';
      const b = h('button.die' + (used ? '.used' : '') + (show && !used && mayAct(s) ? '' : '.cover') + (UI.sel === i && me === s ? '.sel' : '') + (rrmode && UI.rrm[i] ? '.rrm' : ''), { type: 'button', 'data-a': 'die', 'data-s': s, 'data-d': i, style: 'width:' + ds + 'px;height:' + ds + 'px', 'aria-label': used ? 'used' : (show ? pname(s) + ' die showing ' + d.v : pname(s) + ' die, hidden'), disabled: used ? true : null });
      b.appendChild(dvEl(show ? d.v : '?', (s === 0 ? 'b' : 'o') + (show ? '' : ' q'))); tr2.appendChild(b);
    }
    if (G.pend && (G.pend.h === 'intern' && G.pend.d.seat === s || G.pend.h === 'sync' && s === 1) && (show)) { const val = G.pend.d.val; tr2.appendChild(h('button.die' + (UI.sel === 'p' ? '.sel' : ''), { type: 'button', 'data-a': 'die', 'data-s': s, 'data-d': 'p', style: 'width:' + ds + 'px;height:' + ds + 'px', 'aria-label': (G.pend.h === 'intern' ? 'Trainee token ' : 'Traffic die ') + val }, dvEl(val, G.pend.h === 'intern' ? 't' : 'k'))); }
    pz.appendChild(tr2);
  }
  // ---- hud
  { const row = rows[G.round + G.row0]; pz.appendChild(css(h('div.hudc', h('b', 'Round ' + (G.round + 1) + ' of ' + (D.rounds - G.row0) + ' · ' + row[0] + ' ft'), h('span', G.result ? 'Flight over' : G.phase === 'brief' ? 'Briefing' : (G.pend ? pendLabel() : (G.turn === 0 ? 'Pilot' : 'Co-pilot') + ' places')), UI.rt && G.mods.real ? h('span', { id: 'rtleft' }, '⏱ ' + Math.ceil(UI.rt.left / 1000) + ' s') : null), r.hud)); }
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
    if (typeof v === 'number' && mayAct(v)) return G.ready[v] ? 'Waiting for your crewmate to be ready.' : 'Briefing: talk strategy (never dice values), then press Roll.';
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
  const ro = $('#roster'); if (ro) { ro.innerHTML = ''; for (const s of [0, 1]) { const st = G.result ? 'landed' : G.phase === 'brief' ? (G.ready[s] ? 'ready' : 'briefing') : (FA.pending(G).includes(s) ? 'deciding' : 'waiting'); ro.appendChild(h('div.chip.' + (s ? 'c' : 'p') + (v === s ? '.me' : '') + (st === 'deciding' || st === 'briefing' ? '.wt' : '') + (st === 'ready' ? '.rdy' : ''), h('span.cav', ART['crew-' + s] ? h('img', { src: ART['crew-' + s], alt: '' }) : ''), h('span.ct', h('b', name(s)), h('i', pname(s) + (G.ai[s] ? ' (computer)' : '') + ' · ' + FA.unusedDice(G, s).length + ' dice · ' + st)))); } }
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
