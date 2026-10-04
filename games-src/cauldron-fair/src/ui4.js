// ===================== part 4: the day report (and its decisions), the shop, the pass card, the final screen, the guided tips =====================
function closeRS(quiet) { const rs = $('#rs'); if (rs) { rs.hidden = true; rs.innerHTML = ''; } UI.rsOpen = false; UI.rsMode = ''; if (!quiet && typeof schedule === 'function') schedule(); }
function checkReport() {
  if (!G || !UI.started) return;
  if (hotSeat() && UI.pass != null) { showPass(UI.pass); return; }
  if (UI.rsMode === 'pass') closeRS(true);
  if (UI.rsMode === 'final') return;
  const R = G.rep;
  if (R && UI.repSeen !== R.round && (G.phase === 'eval' || G.round > R.round || G.phase === 'over')) { UI.repSeen = R.round; UI.rsOpen = true; UI.rsMode = 'report'; }
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
  const box = h('div.rsbox', { role: 'dialog', 'aria-label': 'Day ' + R.round + ' report' }); UI.rsFoot = null;
  box.appendChild(h('h2', h('span', { html: ico('coin', 30) }), 'Day ' + R.round + ' report'));
  const body = h('div.rsbody');
  const tab = h('table.rt-tab'); tab.appendChild(h('tr', h('th', 'Cauldron'), h('th', 'Reached'), h('th', 'Result'), h('th', '+VP'), h('th', 'Total')));
  for (const p of G.players) {
    const r = dayRow(p, R); if (!r) continue; const sp = r.space;
    const res = r.boom ? (r.prot ? [h('span.ok', 'exploded, safe')] : [h('span.bad', 'exploded'), h('div.sm', r.mode === 'buy' ? 'went shopping' : r.mode === 'vp' ? 'took points' : '...')]) : [h('span.ok', 'stopped'), r.die && r.die.length ? h('div.sm.dieb' + (r.live ? '.roll' : ''), { title: 'Bonus die' }, r.die.map(f => h('span', { html: KIT.ICON.die(24, f) }))) : null];
    tab.appendChild(h('tr' + (p.seat === v ? '.me' : ''), h('td', h('span.nm', h('span', { html: avHTML(p.seat, 28) }), p.seat === v ? 'You' : p.name)),
      h('td', h('b', D.COINS[sp]), h('span', { html: ico('coin', 14) }), h('div.sm', D.VP[sp] + ' VP' + (D.RUBY[sp] ? ' + ruby' : ''))), h('td', res), h('td', h('b', r.gain >= 0 ? '+' + r.gain : r.gain)), h('td', h('b', p.vp))));
  }
  body.appendChild(tab);
  const lines = G.log.filter(l => l.i > R.logFrom && (!R.logTo || l.i <= R.logTo)); if (lines.length) { const ev = h('div.evlog', { role: 'log', 'aria-label': 'What happened' }); lines.forEach(l => ev.appendChild(h('div', l.t))); body.appendChild(ev); setTimeout(() => { ev.scrollTop = ev.scrollHeight; }, 0); }
  if (myq) body.appendChild(decisionBox(me, myq));
  else if (G.phase === 'eval') { const w = G.players.filter(p => p.q && p.seat !== v).map(p => p.name); body.appendChild(h('p.sm', w.length ? 'Waiting for ' + nameList(w) + '...' : 'Counting up...')); }
  const done = G.phase !== 'eval' && !myq;
  const next = G.phase === 'over' ? 'See the final scores' : 'On to day ' + G.round;
  box.appendChild(body);
  const foot = h('div.rsfoot');
  if (UI.rsFoot) UI.rsFoot.forEach(e => foot.appendChild(e));
  else { const btns = h('div.cbtns', { style: 'display:flex;gap:8px;flex-wrap:wrap;align-items:center' });
    btns.appendChild(h('button.btn.go', { 'data-a': 'rscont', type: 'button', disabled: done ? null : true }, done ? next : 'Decide first'));
    if (typeof NET !== 'undefined' && NET.on && done) btns.appendChild(h('span.sm', 'Closes by itself in a moment.'));
    foot.appendChild(btns); }
  box.appendChild(foot);
  rs.innerHTML = ''; rs.appendChild(box);
  if (UI.mode === 'guided') tipCheck();
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
      pr.appendChild(h('button' + (on ? '.on' : ''), { 'data-a': 'shopsel', 'data-k': key, type: 'button', disabled: dis && !on ? true : null, 'aria-pressed': on ? 'true' : 'false', 'aria-label': keyName(key) + ' for ' + price + ' coins' + (left < 1 ? ', sold out' : '') }, chipN(key, 24), h('span', price + (left > 0 && left <= 4 ? ' (' + left + ' left)' : left < 1 ? ' sold out' : ''))));
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
function shopBuy() { const v = viewSeat(); if (v < 0) return; const items = UI.shopSel.slice(); UI.shopSel = []; if (!act({ t: 'buy', items }, v)) toast('That purchase did not work.'); else renderReport(); }
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
  { id: 'welcome', light: false, block: true, t: 'Welcome to the fair', x: () => 'Everyone brews at the same time. Your bag holds 9 chips. Press Draw to pull one out, and keep drawing until you decide to stop. The further your chips climb the spiral, the more coins and points you earn.', when: () => G.round === 1 && mineP() && mineP().pot.length === 0 },
  { id: 'place', t: 'Where chips land', x: () => 'Each chip lands as many spaces along the spiral as its number. The gold ring is where you would score if you stopped now. The panel shows what that is worth.', when: () => mineP() && mineP().pot.length >= 1 },
  { id: 'white', t: 'White Fizzpods', x: () => 'White chips are Fizzpods. Add up the white numbers in your cauldron: if the total goes over 7 the cauldron explodes. The meter in the bar shows your white total.', when: () => mineP() && CF.whiteSum(mineP()) > 0 },
  { id: 'risk', t: 'Reading the odds', x: () => 'The box under the buttons shows how likely your next chip is to explode the cauldron. Under about a quarter is a fair gamble. Higher, and stopping is often the better choice.', when: () => { const p = mineP(); return p && p.st === 'draw' && p.pot.length >= 3 && CF.risk(G, p.seat).pBoom >= .15; } },
  { id: 'flask', t: 'The flask', x: () => 'Your flask can put the last white chip back into the bag, once per day. Use it right after a white chip moves you close to the limit. Rubies refill it later.', when: () => { const p = mineP(); return p && p.st === 'draw' && p.flask && p.f.canFlask && CF.whiteSum(p) >= 4; } },
  { id: 'stop', t: 'When to stop', x: () => 'Happy with your spiral? Press Stop to keep it. Stopping on a high number gives coins to shop with and points for the track.', when: () => { const p = mineP(); return p && p.st === 'draw' && p.pot.length >= 4; } },
  { id: 'boom', light: true, t: 'Boom!', x: () => 'Your cauldron exploded. You still reach a scoring space, but you must choose: take its victory points OR shop with its coins. Not both, and no bonus die.', when: () => { const p = mineP(); return p && p.boom; } },
  { id: 'report', t: 'The day report', x: () => 'When everybody has stopped, the day is counted: the highest cauldron that did not explode rolls the bonus die, chip powers happen, rubies on your space are yours, points move you along the track and the coins buy chips.', when: () => UI.rsOpen && UI.rsMode === 'report' },
  { id: 'shop', light: true, t: 'The shop', x: () => 'Coins buy new chips for your bag. Choose one or two chips of different colours. Bigger numbers move you further, and every book has its own power: open "How it works" before you buy. Leftover coins are lost.', when: () => { const p = mineP(); return p && p.q && p.q.h === 'shop'; } },
  { id: 'rubies', t: 'Rubies', x: () => 'Spend 2 rubies to move your droplet (your first chip starts further along the spiral every day) or to refill your flask. In the last day 2 rubies are worth a point.', when: () => { const p = mineP(); return p && p.q && p.q.h === 'ruby'; } },
  { id: 'day2', t: 'Rats and new stalls', x: () => 'From day 2 players behind the leader get a rat stone: your first chip starts one space further for every rat tail between you and the leader. The Sunroot stall (yellow chips) opens today, the Dusk Sigh stall on day 3.', when: () => G.round === 2 && G.phase !== 'eval' && !UI.rsOpen },
  { id: 'last', t: 'The last day', x: () => 'No shopping today. Every 5 coins and every 2 rubies you hold turn into a victory point at the end. Push your luck, then stop.', when: () => G.round === 9 && G.phase !== 'eval' && !UI.rsOpen }
];
const mineP = () => { const v = viewSeat(); return G && v >= 0 ? G.players[v] : null; };
function tipStart() { tipCheck(); render(); }
function tipCheck() {
  if (!G || UI.coach.level === 'off' || UI.tip) return;
  if (UI.mode !== 'guided' && UI.coach.level !== 'full') { if (UI.mode === 'guided') return; }
  const lvl = UI.coach.level, guided = UI.mode === 'guided';
  if (!guided && lvl !== 'light' && lvl !== 'full') return;
  for (const t of TIPS) {
    if (UI.tipShown[t.id] || UI.coach.seen[t.id]) continue;
    if (!guided && lvl === 'light' && !t.light) continue;
    if (!guided && lvl === 'full' && t.id === 'welcome') continue;
    let ok = false; try { ok = !!t.when(); } catch (e) { }
    if (ok) { UI.tipShown[t.id] = 1; UI.tip = t; UI.coach.seen[t.id] = 1; break; }
  }
  renderTip();
}
function renderTip() {
  const pc = $('#pc'); if (!pc) return; const t = UI.tip;
  if (!t || UI.coach.level === 'off') { pc.hidden = true; pc.innerHTML = ''; return; }
  const n = TIPS.filter(x => UI.tipShown[x.id]).length;
  pc.hidden = false; pc.innerHTML = '';
  pc.appendChild(h('div.ph-head', h('div.ph-t', h('b', t.t), h('span', 'Tip ' + n + ' of ' + TIPS.length)), h('button.px', { 'data-a': 'tipok', type: 'button', 'aria-label': 'Close the tip' }, '×')));
  pc.appendChild(h('div.ph-body', h('p', t.x()), h('div.cbtns', { style: 'display:flex;gap:8px;flex-wrap:wrap' }, h('button.btn.go', { 'data-a': 'tipok', type: 'button' }, 'Got it'), h('button.btn.alt', { 'data-a': 'tipoff', type: 'button' }, 'No more tips'))));
}
function tipOk() { UI.tip = null; const pc = $('#pc'); if (pc) { pc.hidden = true; pc.innerHTML = ''; } tipCheck(); render(); schedule(); }
