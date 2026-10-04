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
      h('span.dg', { html: ico('vp', 18) + ' ' + esc(gTxt) }), h('span.dr', r.boom ? (r.prot ? 'boom, safe' : 'boom!') : 'stopped'), h('span.dt', 'total ' + p.vp)));
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
    btns.appendChild(h('button.btn.go' + (done ? '' : '.off'), { 'data-a': 'rscont', type: 'button', disabled: done ? null : true }, done ? next : 'Choose above first'));
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
    const m = CF.AI.choose(G, p.seat, 'normal'); if (!m) return; const js = JSON.stringify(stripM ? stripM(m) : m);
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
  box.appendChild(h('div.rsfoot', h('div.cbtns', { style: 'display:flex;gap:8px;flex-wrap:wrap' }, (!online || isHost()) ? h('button.btn.go', { 'data-a': 'again', type: 'button' }, 'Play again') : h('span.sm', 'The host can start a new game.'), h('button.btn.alt', { 'data-a': 'look', type: 'button' }, 'Look at the table'), h('button.btn.alt', { 'data-a': 'menu', type: 'button' }, online ? 'Lobby' : 'Menu'))));
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
