// ===================== part 4: step cards (one at a time), guide tips, round score pad, final result =====================
function pushCard(c) { UI.cards.push(c); if (UI.cards.length === 1) drawCard(); }
function nextCard() { UI.cards.shift(); drawCard(); if (!UI.cards.length) { render(); schedule(); } }
function drawCard() {
  const pc = $('#pc'); if (!pc) return;
  const c = UI.cards[0];
  if (!c) { pc.hidden = true; pc.innerHTML = ''; pc.dataset.card = ''; return; }
  closePop(); pc.hidden = false; pc.innerHTML = ''; pc.dataset.card = c.kind;
  const bs = (c.buttons || [{ label: 'Got it', a: 'cont' }]).map(b => h('button.btn' + (b.cls ? '.' + b.cls : ''), { type: 'button', 'data-a': b.a }, b.label));
  pc.append(h('div.ph-head', h('div.ph-t', h('b', c.title), h('span', c.sub || '')), c.kind === 'pass' ? null : h('button.px', { 'data-a': 'cont', type: 'button', 'aria-label': 'Close' }, '×')), h('div.ph-body', c.body, h('div.cbtns', bs)));
  if (c.kind === 'pass') { try { const b = pc.querySelector('[data-a=take]'); if (b) b.focus({ preventScroll: true }); } catch (e) { } }
}
// ---- guide: short tips that explain each card the first time it appears
const TIP_EXTRA = {
  tempura: 'They score in pairs: two make 5 points, a lone one scores nothing.',
  sashimi: 'They score in sets of three: three make 10 points, one or two score nothing. Go for it only if more are coming.',
  dumpling: 'Each bun is worth more than the last: 1, 3, 6, 10, then 15 points for five.',
  roll1: 'A roll race: whoever has the most roll icons when the round ends scores 6, second most 3. This one has 1 icon.',
  roll2: 'A roll race: whoever has the most roll icons when the round ends scores 6, second most 3. This one has 2 icons.',
  roll3: 'A roll race: whoever has the most roll icons when the round ends scores 6, second most 3. This one has 3 icons.',
  salmon: 'Worth 2 points at once, or 6 if it lands on your Fire Paste.',
  squid: 'The best nigiri: 3 points, or 9 if it lands on your Fire Paste.',
  egg: 'The smallest nigiri: 1 point, or 3 on Fire Paste.',
  wasabi: 'Scores nothing by itself: the next nigiri you serve lands on it and scores triple.',
  chop: 'Keep them: on a later turn you may serve two plates at once. The sticks then go back into the hand and pass on with it.',
  pudding: 'Kept for the whole game. At the end, whoever has the most gets 6' + ' and the fewest loses 6 (no loss with 2 diners).'
};
// tips sit in the dock beside the belt (never over the hand) and need no "Got it"; only the opening one is a card
function coachTip(key, title, text, type) {
  UI.coach.seen[key] = 1; UI.coach.turn = G.round + '.' + G.turn;
  if (key === 'welcome') {
    const body = h('div', h('p', h('b', 'Goal: '), 'the most points after 3 rounds wins.'), h('p', h('b', 'Each turn: '), 'tap a plate on your belt, press Serve. Everyone reveals at the same time, then every hand passes one seat to the left.'), h('p', h('b', 'Scoring: '), 'plates score in pairs, sets and races. The green +N on a plate is what it scores you right now.'));
    pushCard({ kind: 'coach', title, sub: 'How it works', body, buttons: [{ label: 'Let\'s eat', a: 'cont' }] }); return;
  }
  UI.tip = { key, title, text, type, turn: UI.coach.turn }; render();
}
function coachCheck() {
  const lv = UI.coach.level; if (lv === 'off' || !G || G.phase !== 'pick') return false;
  const v = viewSeat(); if (v < 0 || !canPick() || UI.cards.length) return false;
  const turn = G.round + '.' + G.turn; if (UI.coach.turn === turn) return false;
  const seen = UI.coach.seen, p = G.players[v];
  if (!seen.welcome && lv === 'full') { coachTip('welcome', 'Welcome to the belt', ''); return true; }
  if (!seen.pick && lv === 'full') { coachTip('pick', 'Your move:', 'tap a plate to lift it and read what it does, then press Serve.'); return true; }
  const types = Array.from(new Set(p.hand.map(tkey))).sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b));
  if (lv === 'full' || lv === 'light') {
    for (const t of types) { if (seen[t]) continue; if (lv === 'light' && !['wasabi', 'chop', 'pudding'].includes(t)) continue; coachTip(t, 'New: ' + TY[t].name + '.', TIP_EXTRA[t] || '', t); return true; }
  }
  const c = KK.tableCounts(p.table);
  if (!seen.pasteReady && c.wasabiUnused && p.hand.some(id => NIG[tkey(id)])) { coachTip('pasteReady', 'Fire Paste is waiting:', 'serve a nigiri now and it lands on your paste and scores triple (look for +3, +6 or +9).', 'wasabi'); return true; }
  if (!seen.twinReady && c.chop && p.hand.length >= 2) { coachTip('twinReady', 'Twin Sticks ready:', 'press "Use Twin Sticks" to serve two plates this turn. The sticks then go back into the hand and pass on.', 'chop'); return true; }
  if (!seen.endRound && G.turn >= G.hand) { coachTip('endRound', 'Last plate of the round:', 'then the round is scored, including the roll race. Everything but custard is cleared and new hands are dealt.'); return true; }
  return false;
}
// ---- round score pad
const CATROWS = [
  { k: 'maki', l: 'Seaweed rolls', ic: ['most', 'roll1'], sub: s => s.icons + ' icon' + (s.icons === 1 ? '' : 's'), tip: 'Roll race: most roll icons scores 6, second most 3.' },
  { k: 'tempura', l: 'Crispy Prawns', ic: ['pair', 'tempura'], sub: null, tip: '5 points for every pair.' },
  { k: 'sashimi', l: 'Fish Slices', ic: ['set', 'sashimi'], sub: null, tip: '10 points for every set of three.' },
  { k: 'dumpling', l: 'Steam Buns', ic: ['ladder', 'dumpling'], sub: null, tip: '1, 3, 6, 10, 15 points for 1 to 5 or more buns.' },
  { k: 'nigiri', l: 'Nigiri', ic: ['v2', 'salmon'], sub: null, tip: 'Sunset 2, Moon 3, Sun 1 point each.' },
  { k: 'wasabi', l: 'Fire Paste bonus', ic: ['x3', 'wasabi'], sub: null, tip: 'The extra points a nigiri scored by landing on Fire Paste (triple).' }];
function padRows(upToRound, withPud) {
  const bank = G.players.map((p, i) => G.rs.map(r => r[i].total));
  return G.players.map((p, i) => ({ i: chefOf(i), name: p.name, rounds: [0, 1, 2].map(r => r < upToRound ? bank[i][r] : null), dessert: withPud ? G.final.puddingPts[i] : null, total: bank[i].slice(0, upToRound).reduce((a, b) => a + b, 0) + (withPud ? G.final.puddingPts[i] : 0), you: i === viewSeat() }));
}
function makiText(sc) {
  const s = sc.seats; const max = Math.max(...s.map(x => x.icons));
  if (max <= 0) return 'Nobody served a roll this round: no roll points.';
  const parts = s.filter(x => x.icons > 0).sort((a, b) => b.icons - a.icons).map(x => pname(x.seat) + ' ' + x.icons + ' icon' + (x.icons === 1 ? '' : 's') + (x.maki ? ' (+' + x.maki + ')' : ' (no points)'));
  const top = s.filter(x => x.icons === max).length;
  return 'Roll race: ' + parts.join(', ') + (top > 1 ? '. The most is tied, so 6 is split and nobody gets second place.' : '.');
}
function showRound(sc, ge) {
  const rs = $('#rs'); UI.rsOpen = true; rs.hidden = false; rs.innerHTML = '';
  const last = G.phase === 'over';
  const box = h('div.rsbox', { role: 'dialog', 'aria-label': 'Round ' + sc.round + ' scores' });
  box.appendChild(h('h2', h('span', { html: KIT.roundMarkerSVG(sc.round, 'done', { size: 34 }) }), 'Round ' + sc.round + ' scores'));
  const tb = h('table.cat');
  const hr = h('tr', h('th', ''));
  sc.seats.forEach(s => { const th = h('th'); th.appendChild(h('div', { html: avatarS(s.seat, 64) })); th.appendChild(h('span.sub', pname(s.seat))); hr.appendChild(th); });
  tb.appendChild(hr);
  const cells = [];
  CATROWS.forEach(r => {
    const tr = h('tr', { title: r.tip }); tr.appendChild(h('td', h('div.lc', { html: iconS(r.ic[0], 26, r.ic[1]) }, r.l)));
    sc.seats.forEach(s => { const td = h('td.n.z', { 'data-v': s[r.k] }, '·'); if (r.sub) td.appendChild(h('span.sub', r.sub(s))); tr.appendChild(td); cells.push(td); });
    tb.appendChild(tr);
  });
  const tt = h('tr.tot'); tt.appendChild(h('td', 'Round total')); sc.seats.forEach(s => { const td = h('td.n.z', { 'data-v': s.total }, '·'); tt.appendChild(td); cells.push(td); }); tb.appendChild(tt);
  box.appendChild(tb);
  box.appendChild(h('div.maki', makiText(sc)));
  const padHost = h('div.padw'); box.appendChild(padHost);
  const btns = h('div.cbtns', h('button.btn.alt#rsskip', { type: 'button', 'data-a': 'rsskip' }, 'Skip counting'), h('button.btn.go', { type: 'button', 'data-a': 'rsnext' }, last ? 'See the final result' : 'Next round'));
  box.appendChild(btns); rs.appendChild(box);
  UI.rsInfo = { sc, ge, skip: !ANIM, done: false };
  const showPad = () => { const w = Math.min(380, Math.max(260, (box.clientWidth || 340) - 24)); padHost.innerHTML = KIT.scorePadSVG({ w, round: sc.round, rows: padRows(sc.round, false) }); const sk = $('#rsskip'); if (sk) sk.hidden = true; UI.rsInfo.done = true; };
  const rows = []; for (let k = 0; k < cells.length; k += sc.seats.length) rows.push(cells.slice(k, k + sc.seats.length));
  const tok = UI.seq, info = UI.rsInfo;
  (async () => {
    if (ANIM) { snd('round', { duck: true }); await new Promise(r => setTimeout(r, 450)); }
    for (let ri = 0; ri < rows.length; ri++) {
      for (const td of rows[ri]) { const v = +td.dataset.v; const lead = td.firstChild; const sub = td.querySelector('.sub');
        const setN = n => { td.firstChild && td.firstChild.nodeType === 3 ? td.firstChild.nodeValue = String(n) : td.insertBefore(document.createTextNode(String(n)), td.firstChild); };
        if (!info.skip && v > 0) { const steps = Math.min(v, 12); for (let k = 1; k <= steps && !info.skip; k++) { setN(Math.round(v * k / steps)); snd('tick', { rate: .9 + k * .05, vol: .4 }); await new Promise(r => setTimeout(r, 32)); if (tok !== UI.seq) return; } }
        setN(v); td.classList.toggle('z', v === 0);
        if (v > 0 && !info.skip) snd('coin', { vol: .6 });
      }
      rows[ri].forEach(td => td.parentNode.classList.add('cur'));
      if (!info.skip) { await new Promise(r => setTimeout(r, 260)); if (tok !== UI.seq) return; }
      rows[ri].forEach(td => td.parentNode.classList.remove('cur'));
    }
    if (tok !== UI.seq || !UI.rsOpen) return;
    showPad();
  })();
  if (NET.on) { clearTimeout(UI.rsT); UI.rsT = setTimeout(() => { if (UI.rsOpen && UI.rsInfo === info) afterRound(ge); }, 30000); }
  try { box.querySelector('[data-a=rsnext]').focus({ preventScroll: true }); } catch (e) { }
}
function skipCount() { if (UI.rsInfo) { UI.rsInfo.skip = true; } }
function showFinal() {
  const rs = $('#rs'); UI.rsOpen = true; rs.hidden = false; rs.innerHTML = '';
  const F = G.final, np = G.np;
  const box = h('div.rsbox', { role: 'dialog', 'aria-label': 'Final result' });
  const ws = G.winners || [];
  const me = viewSeat(), iWin = me >= 0 && ws.includes(me);
  box.appendChild(h('h2', h('span', { html: KIT.iconSVG('crown', { size: 32 }) }), 'The meal is over'));
  const wn = h('div.win', h('span', { html: avatarS(ws[0] != null ? ws[0] : 0, 96) }), h('div', G.winText));
  box.appendChild(wn);
  // custard resolved
  const tb = h('table.cat'); const hr = h('tr', h('th', ''));
  for (let s = 0; s < np; s++) { const th = h('th'); th.appendChild(h('div', { html: avatarS(s, 64) })); th.appendChild(h('span.sub', pname(s))); hr.appendChild(th); }
  tb.appendChild(hr);
  const addRow = (label, vals, cls) => { const tr = h('tr' + (cls ? '.' + cls : ''), h('td', label)); vals.forEach(v => tr.appendChild(h('td.n', String(v)))); tb.appendChild(tr); };
  for (let r = 0; r < D.rounds; r++) addRow('Round ' + (r + 1), G.rs[r].map(x => x.total));
  addRow('Custard cups', F.pudding.map(String));
  addRow('Custard points', F.puddingPts.map(x => (x > 0 ? '+' : '') + x));
  addRow('Total', F.totals, 'tot');
  box.appendChild(tb);
  const best = Math.max(...F.pudding), worst = Math.min(...F.pudding);
  box.appendChild(h('div.maki', best === worst ? 'Everyone has the same number of custards, so nobody scores or loses for them.' : 'Custard: most (' + best + ') scores 6' + (np > 2 ? ', fewest (' + worst + ') loses 6' : ' (no penalty with two players)') + '; ties split the points, rounded down.'));
  const padHost = h('div.padw', { html: KIT.scorePadSVG({ w: Math.min(380, Math.max(260, (window.innerWidth || 380) - 48)), round: 4, rows: padRows(D.rounds, true) }) }); box.appendChild(padHost);
  const bs = NET.on ? netOverButtons() : [{ label: 'Play again', a: 'again' }, { label: 'Look at the table', a: 'cont', cls: 'alt' }, { label: 'Menu', a: 'menu', cls: 'alt' }];
  box.appendChild(h('div.cbtns', bs.map(b => h('button.btn' + (b.cls ? '.' + b.cls : ''), { type: 'button', 'data-a': b.a === 'cont' ? 'rsclose' : b.a }, b.label))));
  rs.appendChild(box);
  // confetti only when a person at this device won (or shares the win); otherwise a softer line
  const humanWin = NET.on ? iWin : ws.some(s => G.players[s] && !G.players[s].ai);
  if (humanWin) { snd('win', { duck: true }); celebrate(box); } else { snd('round', { duck: true }); if (humans().length || NET.on) wn.after(h('p.wp', 'Well played! Another meal?')); }
  UI.overShown = true; if (humans().length || NET.on) lsSet('kk_done', '1');
  if (UI.mode !== 'net') lsSet('kk_save', '');
}
function celebrate(box) {
  if (!ANIM) return; const c = h('div.conf'); const cols = ['#e5553a', '#e0a31c', '#2a97a0', '#7a5ac8', '#5aa83c', '#f4b6d2'];
  for (let i = 0; i < 40; i++) { const e = h('i'); e.style.left = Math.round(Math.random() * 100) + '%'; e.style.background = cols[i % cols.length]; e.style.animationDelay = (Math.random() * 2) + 's'; e.style.animationDuration = (2 + Math.random() * 2) + 's'; c.appendChild(e); }
  $('#rs').appendChild(c); setTimeout(() => c.remove(), 6000);
}
function closeRS() { const rs = $('#rs'); rs.hidden = true; rs.innerHTML = ''; UI.rsOpen = false; clearTimeout(UI.rsT); }
