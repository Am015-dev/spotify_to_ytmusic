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
    if (p.st === 'draw') { const rk = CF.risk(G, v); return { text: (G.round === 9 ? 'Last day: choose Draw or Stop. Nobody sees your choice until everybody has chosen. No shop today: at the end every 5 coins and every 2 rubies become 1 point. ' : '') + (p.pot.length ? 'Draw another chip, or stop and keep your score.' : 'Tap Draw to pull your first chip from the bag.'), mine: true }; }
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
  const mk = (t, cls, label, icon) => { const m = legal.find(x => x.t === t); if (!m) return null; return h('button.btn' + cls, { 'data-a': 'mv', 'data-i': legal.indexOf(m), type: 'button' }, icon ? h('span', { html: icon }) : null, label); };
  const draw = mk('draw', '.drawb', 'Draw', ico('bag', 26)), stop = mk('stop', '.stopb', 'Stop') || (draw ? h('button.btn.stopb.off', { type: 'button', disabled: true, title: 'Draw your first chip first' }, 'Stop') : null);   // Stop keeps its place so Draw never moves
  if (!p.lock) {   // the one line that matters: how likely is the next chip to explode, and what am I worth right now
    const r = CF.risk(G, v), pct = Math.round(r.pBoom * 100), lv = pct < 15 ? 'lo' : pct < 30 ? 'mid' : 'hi', sp = CF.spaceOf(p), ln = limitNote(p);
    const fm = legal.find(x => x.t === 'flask');
    const sr = h('div.sumrow', { 'data-priv': v }, h('span.s1', h('b.' + lv, pct + '%'), ' to explode'), h('span.s2', { title: 'If you stop now' }, h('span', { html: ico('coin', 16) }), h('b', D.COINS[sp]), h('span', { html: ico('vp', 16) }), h('b', D.VP[sp]), D.RUBY[sp] ? h('span', { html: ico('ruby', 16) }) : null),
      fm ? h('button.btn.alt.flb', { 'data-a': 'mv', 'data-i': legal.indexOf(fm), type: 'button', 'aria-label': 'Flask: put the last white chip back in the bag', title: 'Flask: put the last white chip back' }, h('span', { html: ico('flask', 20, true) }), 'Flask') : null,
      ln ? h('div.s3', ln + ': it explodes above ' + r.limit + '.') : null);
    a.appendChild(sr);
  }
  const rowTop = [mk('froth', '.alt.sec', 'Put the first white chip back (free)'), mk('restart', '.alt.sec', 'Do-over (today\'s fortune, once): tip your 5 chips back and start again')].filter(Boolean);
  if (rowTop.length) rowTop.forEach(b => a.appendChild(b));
  const rat = legal.filter(m => m.t === 'ratset');
  if (rat.length) { const k = p.rat - p.droplet; const d = h('details.ratd', { style: 'flex:1 1 100%' }, h('summary.sm', { style: 'min-height:44px;display:flex;align-items:center;cursor:pointer' }, h('span', h('b', 'Head start: '), 'you trail the leader, so your first chip lands ' + plural(k, 'space') + ' further on (the grey rat). ', h('u', 'Use less')))); const row = h('div', { style: 'display:flex;gap:6px;flex-wrap:wrap' }); rat.forEach(m => row.appendChild(h('button.btn.alt', { 'data-a': 'mv', 'data-i': legal.indexOf(m), type: 'button' }, m.n ? 'Only ' + plural(m.n, 'space') : 'No head start'))); d.appendChild(row); a.appendChild(d); }
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
