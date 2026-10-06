// ===================== part 2: render (board, thumbnails, dock, risk, questions) =====================
// Text for every question the engine can ask (title, explanation). Options come from CF.moves().
const QINFO = {
  pick: ['Pedlar\'s Pick', () => 'Take a chip or 3 rubies'],
  swap: ['Swap Stall', () => 'Trade 1 ruby for a chip'],
  clear: ['Clear the Pods', () => 'Score 4, or drop a white 1'],
  bribe: ['Rat Bribe', (p, d) => 'Rat back up to ' + d.max + ', rubies each'],
  bounty: ['Rat Bounty', p => 'Take a 4-chip or points'],
  fork: ['Fork in the Road', () => 'Droplet +2, or a Dusk Sigh'],
  haggle: ['Haggler\'s Hour', () => 'Swap one chip for a higher one'],
  crow: ['Wren Feather: pick one', () => 'Place one as your next chip'],
  peek: ['Peek and Pick', () => 'Place one chip, or none'],
  y1: ['Kind cut', () => 'Return the white chip to the bag?'],
  restart: ['Do-Over', () => 'Restart the day? Once only'],
  side: ['Scarlet Cap beside the pot', () => 'Add it, keep it, or return it'],
  gift: ['Spilled Brew', () => 'Take any 2-chip'],
  g2: ['Mossback gift', () => 'Pick your free chip'],
  g4: ['Drip moss', (p, d) => '1 ruby per step, up to ' + d.max],
  p1: ['Gentle sigh', d => 'Take up to ' + d.n + ' rewards'],
  g3: ['Lucky-seven moss', d => 'Slide ' + d.s + ' spaces, or stay'],
  p2: ['Trade wind', () => 'Trade purple chips for rewards'],
  p4: ['Upgrade sigh', () => 'Swap one pot chip for a bigger'],
  de: ['Your cauldron exploded', (p, d) => 'Take ' + d.vp + ' points or shop'],
  shop: ['The fair stalls', (p, d) => 'Buy up to 2 chips'],
  ruby: ['Rubies', () => 'Rubies: move droplet +1']
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
    if (p.st === 'draw' && p.lock) return { text: wn.length ? 'Decided. Waiting for others...' : 'Revealing...' };
    if (p.st === 'draw') return { text: (G.round === 9 ? 'Last day: Draw or Stop, secretly.' : p.pot.length ? 'Draw another, or stop.' : 'Tap Draw for your first chip.'), mine: true };
    return { text: (p.boom ? 'Your cauldron exploded. ' : 'You stopped. ') + (wn.length ? 'Waiting for others...' : 'Everyone is done.') };
  }
  if (G.phase === 'prep') return { text: wn.length ? 'Waiting for others...' : 'The day begins.' };
  if (G.phase === 'eval') return { text: p.q ? QINFO[p.q.h][1](p, p.q.d) : (wn.length ? 'Waiting for others...' : 'Counting the day.'), mine: !!p.q };
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
// a computer's brew, draw by draw: its chips as little coins, the newest one pops in
UI.potN = UI.potN || {};
function liveChips(p) {
  const prev = UI.potN[p.seat + ':' + G.round] || 0; UI.potN[p.seat + ':' + G.round] = p.pot.length;
  const row = h('span.lchips', { 'aria-label': p.name + ' has drawn ' + plural(p.pot.length, 'chip') + ', white ' + CF.whiteSum(p) });
  p.pot.slice(-6).forEach((c, i, a) => { if (!c || !c.c) return; const d = h('i.lc' + (p.pot.length > prev && i === a.length - 1 ? '.pop' : ''), { html: chipHTML(c.c + c.v, 15) }); row.appendChild(d); });
  return row;
}
UI.thN = UI.thN || {};
function renderOthers() {
  const o = $('#others'); if (!o) return; const f = focusSeat(); o.innerHTML = '';
  for (const p of G.players) {
    if (p.seat === f) continue;
    const kN = p.seat + ':' + G.round, pulled = G.phase === 'brew' && UI.thN[kN] != null && p.pot.length > UI.thN[kN]; UI.thN[kN] = p.pot.length;   // a computer's pull pops its little cauldron
    const t = h('button.th' + (seatCls(p) ? '.' + seatCls(p) : '') + (pulled ? '.pulled' : ''), { 'data-a': 'focus', 'data-seat': p.seat, type: 'button', 'aria-label': p.name + ': ' + p.vp + ' points, ' + stateLabel(p) + '. Tap to look at this cauldron.' });
    t.append(h('span.av', { html: avHTML(p.seat, 26) }), h('span.tp', { html: KIT.potSVG(potOpts(p, true)).replace(/width="\d+" height="\d+"/, '') }),
      h('span.ti', h('b', p.name), h('span.tv', h('span', { html: ico('vp', 15) }), p.vp, h('span', { html: ico('ruby', 15) }), p.rubies), h('span.ts', seatState(p) === 'draw' && p.pot.length ? liveChips(p) : stateLabel(p))));
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
  let fc = $('#fortchip'); if (!fc) { const bd = $('#bd'); if (bd) { fc = h('button#fortchip', { type: 'button', 'data-a': 'fortchip', 'data-lp': 'fort' }); bd.appendChild(fc); } }
  if (!c || G.phase === 'over') { e.hidden = true; if (fc) fc.hidden = true; return; } e.hidden = false; e.className = c.kind; e.setAttribute('data-lp', 'fort');
  e.innerHTML = ''; e.setAttribute('data-a', 'fort'); e.append(h('span.fk', c.kind === 'blue' ? 'ALL DAY' : 'NOW'), h('div', h('b', 'Fortune: ' + c.name + ' '), h('span.fx', fortShort(c))));
  if (fc) { fc.hidden = false; fc.className = c.kind; fc.setAttribute('aria-label', 'Fortune card ' + c.name + ': ' + fortShort(c)); fc.innerHTML = ''; fc.append(h('span.fk', c.kind === 'blue' ? 'ALL DAY' : 'NOW'), h('b', c.name)); }
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
  const a = $('#acts'), qb = $('#qbox'); if (!a || !qb) return; a.innerHTML = ''; qb.innerHTML = ''; qb.hidden = true; renderRat(null);
  const v = viewSeat(); if (v < 0 || !G || G.phase === 'over') return;
  if (hotSeat() && UI.holder < 0) return;
  const p = G.players[v]; const legal = mvList(v); UI.legal[v] = legal;
  if (typeof NET !== 'undefined' && NET.on && NET.pend && Date.now() - NET.pendT < 700) { /* a move is in flight */ }
  if (p.q && !EVAL_Q[p.q.h]) { renderQ(p, legal, qb); return; }
  if (focusSeat() !== v) { const fp = G.players[focusSeat()]; if (G.phase === 'brew' && fp && fp.ai && fp.st === 'draw' && !fp.boom) a.appendChild(h('div.bline.watch', fp.name + ' draws… tap to hurry')); a.appendChild(h('button.btn.go.backb', { 'data-a': 'focus', 'data-seat': v, type: 'button' }, 'Back to your cauldron')); return; }
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
function autoWatch() {   // once I have stopped, watch the computer that is still drawing; go back to my own pot when the day ends
  const v = viewSeat(); if (v < 0 || hotSeat() || !bfAnim()) return; const me = G.players[v];
  if (UI.autoF && (G.phase !== 'brew' || UI.autoF !== G.round)) { if (UI.focus !== v && UI.autoF) UI.focus = v; UI.autoF = 0; UI.fastAI = false; return; }
  if (!UI.autoF && G.phase === 'brew' && (me.lock || me.st === 'done') && UI.focus === v) { const c = G.players.find(q => q.ai && q.st === 'draw' && !q.boom && q.seat !== v); if (c) { UI.focus = c.seat; UI.autoF = G.round; } }
  if (UI.autoF && UI.focus !== v) { const c = G.players[UI.focus]; if (c && c.st !== 'draw') { const n = G.players.find(q => q.ai && q.st === 'draw' && !q.boom && q.seat !== v); if (n) UI.focus = n.seat; } }
}
function render() {
  if (!G || !UI.started) return;
  try {
    autoWatch(); focusSeat(); placePrompt();
    renderBar(); renderOthers(); renderMe(); renderStage(); renderActs(); renderRisk(); renderFort(); renderRoster();
    const pi = promptInfo(), pr = $('#prompt'); if (pr) { pr.textContent = pi.text; pr.className = pi.mine ? 'mine' : ''; }
    renderHint(); renderLegend(); renderBlg(); renderDrawers(); renderNetBadge && renderNetBadge();
    bfHeat(); const db = $('#dockbody'); if (db) db.classList.toggle('deckon', !!document.querySelector('#acts .bdeck')); requestAnimationFrame(bfGhost);
  } catch (e) { console.error(e); if (window.__cfErr) window.__cfErr.push(String(e.stack || e)); }
}
function renderHint() { const e = $('#hint'); if (e) { e.hidden = true; e.innerHTML = ''; } }  // tips live in #pc (the tip card)
