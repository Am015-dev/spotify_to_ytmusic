// ===================== part 4: the day report (and its decisions), the shop, the pass card, the final screen, the guided tips =====================
function closeRS(quiet) { const rs = $('#rs'); if (rs) { rs.hidden = true; rs.innerHTML = ''; } UI.rsOpen = false; UI.rsMode = ''; if (!quiet && typeof schedule === 'function') schedule(); }
function checkReport() {
  if (!G || !UI.started) return;
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
  box.appendChild(h('h2', h('span', { html: ico('coin', 30) }), hotPriv ? 'Day ' + R.round + ': ' + me.name : 'Day ' + R.round + ' report'));
  box.appendChild(h('div#rstip.tipb', { hidden: true }));
  const body = h('div.rsbody');
  const tab = h('table.rt-tab'); tab.appendChild(h('tr', h('th', 'Cauldron'), h('th', 'Reached'), h('th', 'Result'), h('th', '+VP'), h('th', 'Total')));
  for (const p of G.players) {
    const r = dayRow(p, R); if (!r) continue; const sp = r.space;
    const res = r.boom ? (r.prot ? [h('span.ok', 'exploded, safe')] : [h('span.bad', 'exploded'), h('div.sm', (r.mode === 'buy' ? 'went shopping' : r.mode === 'vp' ? 'took points' : '...') + ' (white ' + r.white + ' went over the limit)')]) : [h('span.ok', 'stopped'), r.die && r.die.length ? h('div.sm.dieb' + (r.live ? '.roll' : ''), { title: 'Bonus die' }, r.die.map(f => h('span', { html: KIT.ICON.die(24, f) }))) : null];
    tab.appendChild(h('tr' + (p.seat === v ? '.me' : ''), h('td', h('span.nm', h('span', { html: avHTML(p.seat, 28) }), p.seat === v ? 'You' : p.name)),
      h('td', h('b', D.COINS[sp]), h('span', { html: ico('coin', 14) }), h('div.sm', D.VP[sp] + ' VP' + (D.RUBY[sp] ? ' + ruby' : ''))), h('td', res), h('td', h('b', r.gain >= 0 ? '+' + r.gain : r.gain)), h('td', h('b', p.vp))));
  }
  if (!hotPriv) body.appendChild(tab);
  const lines = hotPriv ? [] : G.log.filter(l => l.i > R.logFrom && (!R.logTo || l.i <= R.logTo)); if (lines.length) { const ev = h('div.evlog', { role: 'log', 'aria-label': 'What happened' }); lines.forEach(l => ev.appendChild(h('div', l.t))); body.appendChild(ev); setTimeout(() => { ev.scrollTop = ev.scrollHeight; }, 0); }
  if (hotShared) body.appendChild(h('p.sm', 'Everybody has seen the table. Next, each maker makes the private choices (shop, rubies) while the others look away.'));
  else if (myq) body.appendChild(decisionBox(me, myq));
  else if (G.phase === 'eval') { const w = G.players.filter(p => p.q && p.seat !== v).map(p => p.name); body.appendChild(h('p.sm', w.length ? 'Waiting for ' + nameList(w) + '...' : 'Counting up...')); }
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
  closeRS(true); UI.rsMode = ''; if (G.phase === 'over') { checkFinal(); } else { render(); checkReport(); schedule(); }
}
// ---------- decisions inside the report ----------
function decisionBox(p, q) {
  const info = QINFO[q.h], legal = mvList(p.seat); UI.legal[p.seat] = legal;
  const box = h('div.dec', h('h3', info[0]), h('div.sm', info[1](p, q.d)));
  if (q.h === 'shop') { box.appendChild(shopUI(p, q, legal)); return box; }
  if (q.h === 'ruby') {
    box.appendChild(h('div.sm', 'You have ' + p.rubies + ' rubies. Droplet at ' + p.droplet + '. Flask ' + (p.flask ? 'full' : 'empty') + '.'));
    const row = h('div.opts', { style: 'display:flex;flex-direction:column;gap:5px' }); legal.forEach(m => row.appendChild(moveBtn(m, p))); box.appendChild(row); return box;
  }
  if (q.h === 'de') {
    const row = h('div.opts', { style: 'display:flex;flex-direction:column;gap:5px' }); legal.forEach(m => row.appendChild(moveBtn(m, p)));
    box.append(h('div.sm', 'Space ' + p.res.space + ': ' + q.d.coins + ' coins or ' + q.d.vp + ' VP.'), row); return box;
  }
  const row = h('div.opts', { style: 'display:flex;flex-direction:column;gap:5px' }); legal.forEach(m => row.appendChild(moveBtn(m, p))); box.appendChild(row); return box;
}
function shopUI(p, q, legal) {
  const wrap = h('div'); const coins = q.d.coins, sel = UI.shopSel = (UI.shopSel || []).filter(k => G.supply[k] > 0);
  const cost = sel.reduce((a, k) => a + CF.price(G, k[0], +k.slice(1)), 0);
  const books = h('div.books');
  for (const c of D.SHOP_COLORS) {
    const out = CF.bookOut(G, c), bk = c === 'O' ? D.BOOKS.O[0] : c === 'K' ? D.BOOKS.K[0] : D.BOOKS[c][G.sets[c]];
    const card = h('div.bk' + (out ? '' : '.locked'));
    card.appendChild(h('div.bh', chipN(c + '1', 34), h('b', D.COLORS[c].name, h('div.sm', c === 'O' || c === 'K' ? bk.title : bk.title + ' (' + D.SET_NAMES[G.sets[c]].toLowerCase() + ')'))));
    card.appendChild(h('details', h('summary.sm', { style: 'min-height:34px;display:flex;align-items:center;cursor:pointer' }, out ? 'How it works' : 'Opens day ' + D.BOOK_ROUND[c]), h('div.bx', bk.text)));
    const pr = h('div.pr');
    D.COLORS[c].vals.forEach(val => {
      if (c === 'W' || (c === 'O' && val !== 1)) return; const key = c + val, price = CF.price(G, c, val), left = G.supply[key];
      const on = sel.indexOf(key) >= 0; const others = sel.filter(k => k[0] !== c).reduce((a, k) => a + CF.price(G, k[0], +k.slice(1)), 0);
      const dis = !out || left < 1 || price + others > coins;
      pr.appendChild(h('button' + (on ? '.on' : ''), { 'data-a': 'shopsel', 'data-k': key, type: 'button', disabled: dis && !on ? true : null, 'aria-pressed': on ? 'true' : 'false', 'aria-label': keyName(key) + ' for ' + price + ' coins' + (left < 1 ? ', sold out' : '') }, chipN(key, 24), h('span.pc', h('span', { html: ico('coin', 13) }), price + (left > 0 && left <= 4 ? ' (' + left + ' left)' : left < 1 ? ' sold out' : ''))));
    });
    card.appendChild(pr); books.appendChild(card);
  }
  wrap.appendChild(books);
  const cart = h('div.cart', h('span', 'Cart:'), sel.length ? sel.map(k => h('span.cb', chipN(k, 28), CF.price(G, k[0], +k.slice(1)))) : h('span.sm', 'nothing yet'), h('span', cost + ' of ' + coins + ' coins'));
  UI.rsFoot = [cart, h('div.cbtns', { style: 'display:flex;gap:8px;flex-wrap:wrap' }, h('button.btn.go', { 'data-a': 'shopbuy', type: 'button' }, sel.length ? 'Buy ' + sel.length + (sel.length > 1 ? ' chips' : ' chip') : 'Buy nothing'), sel.length ? h('button.btn.alt', { 'data-a': 'shopclear', type: 'button' }, 'Clear') : null)];
  wrap.appendChild(h('p.sm', 'Leftover coins are lost. Bought chips go into your bag.'));
  return wrap;
}
function shopToggle(key) {
  const c = key[0]; let sel = UI.shopSel.slice(); const i = sel.indexOf(key);
  if (i >= 0) sel.splice(i, 1); else { sel = sel.filter(k => k[0] !== c); sel.push(key); if (sel.length > 2) sel.shift(); }
  UI.shopSel = sel; snd('click'); renderReport();
}
function shopBuy() { const v = viewSeat(); if (v < 0) return; const items = UI.shopSel.slice(); UI.shopSel = []; if (!act({ t: 'buy', items }, v)) toast('That purchase did not work.'); }   // on success afterApply() has already redrawn the report (or put up the pass card in hot-seat)
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
  body.appendChild(h('div.win', h('span', { html: avHTML(G.winners[0], 52) }), h('div', G.winText)));
  const t = h('table.fin-tab'); const head = h('tr', h('th', 'Cauldron')); for (let r = 1; r <= D.rounds; r++) head.appendChild(h('th', 'D' + r)); head.append(h('th', 'Extra'), h('th', 'Total')); t.appendChild(head);
  for (const p of order) {
    const gains = []; let sum = 0; for (let r = 1; r <= D.rounds; r++) { const hh = G.hist.find(x => x.round === r && x.seat === p.seat); const gn = hh ? hh.gain : 0; gains.push(gn); sum += gn; }
    const row = h('tr' + (G.winners.indexOf(p.seat) >= 0 ? '.w' : ''), h('td', p.name)); gains.forEach(x => row.appendChild(h('td', x))); row.append(h('td', p.vp - sum), h('td', h('b', p.vp))); t.appendChild(row);
  }
  body.appendChild(h('div', { style: 'overflow-x:auto' }, t));
  body.appendChild(h('p.sm', 'D1 to D9 are the points each day brought. Extra: fortune cards, the 2 rubies for 1 point conversion at the end and points before the brewing began. Tie: the cauldron that went furthest on the last day wins.'));
  const cfg = UI.cfg || {};
  const online = typeof NET !== 'undefined' && NET.on;
  box.appendChild(body);
  box.appendChild(h('div.rsfoot', h('div.cbtns', { style: 'display:flex;gap:8px;flex-wrap:wrap' }, (!online || isHost()) ? h('button.btn.go', { 'data-a': 'again', type: 'button' }, 'Play again') : h('span.sm', 'The host can start a new game.'), h('button.btn.alt', { 'data-a': 'look', type: 'button' }, 'Look at the table'), h('button.btn.alt', { 'data-a': 'menu', type: 'button' }, online ? 'Lobby' : 'Menu'))));
  const conf = h('div.conf'); const cols = ['#f2b81e', '#d6392f', '#3fa04a', '#3b82d6', '#8a55c4']; for (let i = 0; i < 26; i++) { const c = h('i'); c.style.cssText = 'left:' + Math.random() * 100 + '%;background:' + cols[i % 5] + ';animation-delay:' + Math.random() * 2 + 's;animation-duration:' + (2 + Math.random() * 2) + 's'; conf.appendChild(c); }
  rs.innerHTML = ''; rs.appendChild(box); if (!UI.sim) rs.appendChild(conf);
}
// ---------- guided tips (one at a time, in the dock) ----------
const TIPS = [
  { id: 'welcome', t: 'Welcome to the fair', x: () => 'Everyone brews at the same time. Your bag holds 9 chips. Press Draw to pull one out and keep drawing until you decide to stop. The further your chips climb the spiral, the more coins and points you earn.', when: () => G.round === 1 && mineP() && mineP().pot.length === 0 },
  { id: 'place', t: 'Where chips land', x: () => 'A chip lands as many spaces along the dotted path as its number. The big number on a space is its coins, the small brown badge its victory points. The gold ring is where you score if you stop now.', when: () => mineP() && mineP().pot.length >= 1 },
  { id: 'white', t: 'White Fizzpods', x: () => 'Add up the white numbers in your cauldron. If the total goes over the limit (7, unless a fortune card changes it: the counter and the line above Draw say so) the cauldron explodes.', when: () => mineP() && CF.whiteSum(mineP()) > 0 },
  { id: 'risk', t: 'Reading the odds', x: () => 'The line above Draw and Stop shows the chance that the next chip explodes the cauldron, and what you score if you stop now. Under about a quarter is a fair gamble.', when: () => { const p = mineP(); return p && p.st === 'draw' && p.pot.length >= 3 && CF.risk(G, p.seat).pBoom >= .15; } },
  { id: 'flask', t: 'The flask', x: () => 'The Flask button puts the last white chip back into the bag, once a day. Use it right after a white chip moves you close to the limit. Rubies refill it later.', when: () => { const p = mineP(); return p && p.st === 'draw' && p.flask && p.f.canFlask && CF.whiteSum(p) >= 4; } },
  { id: 'stop', t: 'When to stop', x: () => 'Happy with your spiral? Press Stop to keep it. A high space gives coins to shop with and points for the track.', when: () => { const p = mineP(); return p && p.st === 'draw' && p.pot.length >= 4; } },
  { id: 'boom', modal: true, light: true, t: 'Boom!', x: () => 'Your cauldron exploded. You still reach a scoring space, but you must choose: take its victory points OR shop with its coins. Not both, and no bonus die.', when: () => { const p = mineP(); return p && p.boom && UI.rsOpen; } },
  { id: 'report', modal: true, t: 'The day report', x: () => 'When everybody has stopped the day is counted: the furthest cauldron that did not explode rolls the bonus die, chip powers happen, rubies on your space are yours, points move you along the track and the coins buy chips.', when: () => UI.rsOpen && UI.rsMode === 'report' },
  { id: 'shop', modal: true, light: true, t: 'The shop', x: () => 'Coins buy new chips for your bag: pick one or two chips of different colours. Bigger numbers move you further, and every book has its own power: open "How it works" first. Leftover coins are lost.', when: () => { const p = mineP(); return p && p.q && p.q.h === 'shop' && UI.rsOpen; } },
  { id: 'rubies', modal: true, t: 'Rubies', x: () => 'Spend 2 rubies to start every day one space further on, or to refill your flask. On the last day 2 rubies are worth a point.', when: () => { const p = mineP(); return p && p.q && p.q.h === 'ruby' && UI.rsOpen; } },
  { id: 'day2', t: 'Rats and new stalls', x: () => 'From day 2 a player behind the leader gets a rat stone: the first chip starts one space further on for every rat tail between you and the leader. The Sunroot stall opens today, the Dusk Sigh stall on day 3.', when: () => G.round === 2 && G.phase !== 'eval' && !UI.rsOpen },
  { id: 'last', t: 'The last day', x: () => 'No shopping today. Everybody secretly chooses Draw or Stop and all choices are revealed together. Every 5 coins and every 2 rubies you hold turn into a victory point.', when: () => G.round === 9 && G.phase !== 'eval' && !UI.rsOpen }
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
  if (UI.tip && (UI.tip.modal !== tipInRs() || !tipSafe(UI.tip))) UI.tip = null;
  if (!UI.tip) {
    const lvl = UI.coach.level, guided = UI.mode === 'guided'; UI.tipRound = UI.tipRound || {};
    if (guided || lvl === 'light' || lvl === 'full') for (const t of TIPS) {
      if (UI.tipShown[t.id] || UI.coach.seen[t.id]) continue;
      if (!guided && lvl === 'light' && !t.light) continue;
      if (!guided && lvl === 'full' && t.id === 'welcome') continue;
      if (!!t.modal !== tipInRs()) continue;
      if (!t.modal) { const m = UI.tipMark; if (m && m.round === G.round && G.logN - m.log < 10) continue; if ((UI.tipRound[G.round] || 0) >= (G.round === 1 ? 3 : 1)) continue; }
      if (tipSafe(t)) { UI.tipShown[t.id] = 1; UI.tip = t; UI.coach.seen[t.id] = 1; if (!t.modal) UI.tipRound[G.round] = (UI.tipRound[G.round] || 0) + 1; break; }
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
  const n = TIPS.filter(x => UI.tipShown[x.id]).length, open = !isPh() || t.modal || !!UI.tipOpen;
  target.hidden = false; target.innerHTML = ''; target.className = 'tipb';
  target.appendChild(h('div.tl', h('span.tt', h('b', 'Tip ' + n + ' of ' + TIPS.length + ': ' + t.t)),
    isPh() && !t.modal ? h('button.btn.alt.tb', { 'data-a': 'tipmore', type: 'button', 'aria-expanded': open ? 'true' : 'false' }, open ? 'Less' : 'More') : null,
    h('button.btn.go.tb', { 'data-a': 'tipok', type: 'button' }, 'Got it')));
  if (open) target.appendChild(h('div.tx', h('p', t.x()), h('button.tlink2', { 'data-a': 'tipoff', type: 'button' }, 'No more tips')));
}
function tipOk() { UI.tip = null; UI.tipMark = { round: G.round, log: G.logN }; tipCheck(); render(); schedule(); }
