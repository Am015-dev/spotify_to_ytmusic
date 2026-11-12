// ===================== part 9: the day end on the table: tally, market stall, ruby board, short texts, long-press =====================
// The end of a day is a short sequence ON the table, not a report: every cauldron's scoring space lights up in turn, its points fly to the
// maker's chip, rubies drop, the bonus die rolls. Tap anywhere to speed it up. Then the market stall (tap a chip: it flies into your bag)
// or the ruby board (tap the droplet's next space, tap the flask). Nothing here changes the rules: it shows the same engine numbers
// and sends the same moves (act() with CF.moves()).
const STG = { run: false, round: 0, tm: [], iv: [], dirty: false };
const FORT_SHORT = {
  lucky7: 'Exactly 7 white: droplet moves one.', spilled: 'If you boom, left rival takes a 2-chip.', doover: 'After chip 5: restart once.', twice: 'Bonus die rolls twice today.',
  thick: 'White limit is 9 today.', marrowfair: 'Orange chips move one extra today.', peek: 'Stop safely: draw 5, place one.', glint: 'Ruby space scores 2 points, even boomed.',
  spring: 'Flasks refill free tonight.', froth: 'First white chip may go back.', spark: 'Ruby space gives one extra ruby.', pick: 'Black chip, any 2-chip, or 3 rubies.',
  slide: 'Droplet moves one space.', swap: 'Trade 1 ruby for a 1-chip.', alms: 'Fewest rubies take 1 ruby.', underdog: 'Fewest points take a green 1.',
  clear: 'Score 4 points, or drop a white 1.', swarm: 'Rat stone moves by your rat tails.', dip: 'Draw 5: lowest gets blue 2.', bribe: 'Rat back 1 to 3 spaces for rubies.',
  bounty: 'Take a 4-chip, or points per tail.', fork: 'Droplet +2, or take a purple chip.', dice: 'Everyone rolls the bonus die once.', haggle: 'Draw 4: swap one for a bigger chip.'
};
const BOOK_SHORT = {
  O: 'No power. Cheap filler.', K: 'Most black chips: droplet moves, maybe ruby.',
  G: { 1: 'Last two chips green: 1 ruby each.', 2: 'Last-two greens give free chips.', 3: 'White exactly 7: greens push you on.', 4: 'Last-two greens: 1 ruby moves droplet.' },
  B: { 1: 'On landing, peek chips, place one.', 2: 'Keeps your points if you boom.', 3: 'On a ruby space: take 1 ruby.', 4: 'On a ruby space: points equal its number.' },
  R: { 1: 'Slides extra for oranges in your pot.', 2: 'Set aside, add after your last chip.', 3: 'Adds the white chip before it.', 4: 'Later white 1s move 2 spaces.' },
  Y: { 1: 'After a white: put that white back.', 2: 'Next chip moves twice as far.', 3: 'White limit grows to 8 or 9.', 4: 'Each yellow moves extra: 1, 2, 3.' },
  P: { 1: 'After brewing: purples give points, rubies.', 2: 'Hand in purples for chips and rewards.', 3: 'Purples score by how far they sit.', 4: 'Purples upgrade a pot chip.' }
};
function chipShort(key) { const c = key[0], b = BOOK_SHORT[c]; return typeof b === 'string' ? b : (b && G ? b[G.sets[c]] : '') || ''; }
function fortShort(c) { return FORT_SHORT[c.id] || c.text.split(/\s+/).slice(0, 8).join(' '); }
// ---------- long-press: an icon and a few words about the thing under the finger ----------
const LP = { t: 0, fired: 0, el: null, x: 0, y: 0, hide: 0 };
function lpHide() { const b = $('#lpb'); if (b) b.remove(); clearTimeout(LP.hide); }
function lpShow(el) {
  const k = el.dataset.lp || ''; let icon = '', title = '', text = '', full = false;
  if (k.indexOf('chip:') === 0) { const key = k.slice(5); icon = chipHTML(key, 40); title = D.COLORS[key[0]].name; text = chipShort(key); }
  else if (k === 'fort') { const c = D.FORTUNE.find(x => x.id === (G && G.fcard)); if (!c) return; icon = '<span class="lpk ' + c.kind + '">' + (c.kind === 'blue' ? 'ALL DAY' : 'NOW') + '</span>'; title = c.name; text = fortShort(c); full = c.text; icon = '<img class="lpimg" src="media/fortune-' + c.id + '.webp" alt="" onerror="this.remove()">' + icon; }
  else return;
  if (UI.rsOpen && !el.closest('#rs')) return;   // W471: never on top of the day report
  lpHide(); const b = h('div#lpb', { role: 'dialog', 'aria-modal': 'true', 'aria-label': title }, h('span.lpi', { html: icon }), h('div.lpt', h('b', title), h('div', text), full && full !== text ? h('div.lpfull', full) : null));
  document.body.appendChild(b);
  const r = el.getBoundingClientRect(), bw = b.offsetWidth, bh = b.offsetHeight; let x = r.left + r.width / 2 - bw / 2, y = r.top - bh - 8; if (y < 6) y = r.bottom + 8;
  x = Math.max(8, Math.min(innerWidth - bw - 8, x)); y = Math.max(6, Math.min(innerHeight - bh - 6, y)); b.style.left = x + 'px'; b.style.top = y + 'px';
  LP.src = el;   // W471: stays until the next tap (owner rule: no message leaves before it can be read)
}
(function () {
  const clr = () => { clearTimeout(LP.t); LP.t = 0; };
  document.addEventListener('pointerdown', e => {
    const t = e.target.closest && e.target.closest('[data-lp]'); const inB = e.target.closest && e.target.closest('#lpb'); if (!inB) lpHide();
    clr(); if (!t) return; LP.el = t; LP.x = e.clientX; LP.y = e.clientY;
    LP.t = setTimeout(() => { LP.t = 0; LP.fired = Date.now(); snd('click'); lpShow(t); }, 420);
  }, true);
  document.addEventListener('pointermove', e => { if (LP.t && Math.hypot(e.clientX - LP.x, e.clientY - LP.y) > 12) clr(); }, true);
  ['pointerup', 'pointercancel', 'scroll'].forEach(n => document.addEventListener(n, clr, true));
  document.addEventListener('contextmenu', e => { if (e.target.closest && e.target.closest('[data-lp]')) e.preventDefault(); }, true);
  document.addEventListener('click', e => { if (LP.fired && Date.now() - LP.fired < 900) { LP.fired = 0; e.stopPropagation(); e.preventDefault(); } }, true);   // the press that opened the bubble is not a tap
})();
// ---------- the numbers one cauldron brings to the end of the day ----------
function stgData(p, R) {
  const r = dayRow(p, R); if (!r) return null; const live = !!r.live, sp = r.space, hh = live ? null : G.hist.find(x => x.round === R.round && x.seat === p.seat) || {};
  const start = dayStart(p.seat, R.round), after = live ? p.vp : (hh.after != null ? hh.after : p.vp), rg = live ? (p.res ? p.rubies - p.res.ru0 : 0) : (hh.rgain || 0);
  return { p, r, live, sp, coins: D.COINS[sp] || 0, vp: D.VP[sp] || 0, start, after, gain: after - start, rg: Math.max(0, rg), boom: !!r.boom, prot: !!r.prot, mode: r.mode, die: (r.die || []).slice(), bought: (r.bought || []).slice() };
}
function stgPot(d, ring) {
  const p = d.p, o = potOpts(p, true); o.pot = d.live ? p.pot : []; o.space = ring ? d.sp : null; o.boom = d.boom && !d.prot; o.droplet = p.droplet;
  return KIT.potSVG(o).replace(/width="\d+" height="\d+"/, '');
}
function stgRow(d, v, anim) {
  const p = d.p, me = p.seat === v, q = !anim && me && p.q && p.q.h === 'de' ? p.q : null, lose = d.boom && !d.prot;
  const row = h('div.ds' + (me ? '.me' : '') + (lose ? '.bm' : '') + (anim ? '.pre' : '.lit'), { 'data-seat': p.seat });
  const tot = h('b.tn', anim ? d.start : d.after);
  row.appendChild(h('div.dchip', h('span.dav', { html: avHTML(p.seat, 42) }), h('b.dn', me ? 'You' : p.name), h('span.dtot', { html: ico('vp', 17) }, tot), h('span.drb', { html: ico('ruby', 14) }, h('b', p.rubies))));
  row.appendChild(h('div.dpot', { html: stgPot(d, !anim) }));
  const tile = h('div.dtile');
  if (q) {
    const legal = mvList(p.seat); UI.legal[p.seat] = legal; const dec = h('div.dec.dec-de');
    legal.forEach(m => dec.appendChild(h('button.dpick.pickglow' + (m.o === 'vp' ? '.dpv' : '.dpc'), { 'data-a': 'mv', 'data-i': legal.indexOf(m), type: 'button', 'aria-label': m.o === 'vp' ? 'Take ' + q.d.vp + ' points' : 'Shop with ' + q.d.coins + ' coins' }, h('span', { html: ico(m.o === 'vp' ? 'vp' : 'coin', 34) }), h('b', m.o === 'vp' ? '+' + q.d.vp : q.d.coins), h('small.dpl', m.o === 'vp' ? 'Take points' : 'Take coins'))));
    tile.appendChild(dec); try { sugMark(dec, p, q, legal); } catch (e) { }
  } else {
    const dimC = lose && d.mode === 'vp', dimV = lose && d.mode === 'buy';
    tile.appendChild(h('span.dp.dpc' + (dimC ? '.dim' : ''), { html: ico('coin', 22) }, h('b', d.coins)));
    if (d.vp > 0) tile.appendChild(h('span.dp.dpv' + (dimV ? '.dim' : ''), { html: ico('vp', 22) }, h('b', d.vp)));
    if (D.RUBY[d.sp]) tile.appendChild(h('span.dp.dpr', { html: ico('ruby', 22) }));
  }
  row.appendChild(tile);
  const out = h('div.dout');
  if (lose) out.appendChild(h('span.dboom', { html: ico('boom', 30), title: 'Exploded' }));
  else if (d.boom) out.appendChild(h('span.dboom.safe', { html: ico('check', 26), title: 'Boom, but safe' }));
  if (d.die.length) out.appendChild(h('span.ddie' + (anim ? '.pend' : ''), { 'aria-label': 'Bonus die' }, d.die.map(f => h('i', { html: KIT.ICON.die(30, anim ? null : f) }))));
  if (d.bought.length && !anim) out.appendChild(h('span.dbag', { html: ico('bag', 20) }, d.bought.slice(0, 2).map(k => chipN(k, 24))));
  row.appendChild(out);
  return row;
}
// ---------- the sequence ----------
function stgAbort() { STG.run = false; STG.tm.forEach(clearTimeout); STG.iv.forEach(clearInterval); STG.tm = []; STG.iv = []; $$('.dfly').forEach(e => e.remove()); }
function stgFinish() {
  if (!STG.run) return; stgAbort(); STG.dirty = false; renderReport();
}
function stgFlyTo(fromEl, toEl, html, cls, ms, delay, after) {
  const a = fromEl.getBoundingClientRect(), b = toEl.getBoundingClientRect(); const e = h('div.dfly' + (cls ? '.' + cls : ''), { html, 'aria-hidden': 'true' }); document.body.appendChild(e);
  const w = e.offsetWidth, hh = e.offsetHeight, x0 = a.left + a.width / 2 - w / 2, y0 = a.top + a.height / 2 - hh / 2, x1 = b.left + b.width / 2 - w / 2, y1 = b.top + b.height / 2 - hh / 2;
  e.style.left = x0 + 'px'; e.style.top = y0 + 'px'; e.style.opacity = '0';
  try { const an = e.animate([{ transform: 'translate(0,0) scale(.5)', opacity: 0 }, { transform: 'translate(' + (x1 - x0) * .3 + 'px,' + ((y1 - y0) * .3 - 36) + 'px) scale(1.25)', opacity: 1, offset: .35 }, { transform: 'translate(' + (x1 - x0) + 'px,' + (y1 - y0) + 'px) scale(.8)', opacity: 1 }], { duration: ms, delay: delay || 0, easing: 'ease-in-out', fill: 'both' }); an.onfinish = () => { e.remove(); if (after) after(); }; }
  catch (x) { e.remove(); if (after) after(); }
}
function stgCount(el, from, to, ms) {
  if (from === to) { el.textContent = to; return; } const t0 = Date.now(), n = Math.abs(to - from), iv = setInterval(() => { const u = Math.min(1, (Date.now() - t0) / ms); el.textContent = Math.round(from + (to - from) * u); if (u >= 1) { clearInterval(iv); } }, Math.max(30, Math.round(ms / n)));
  STG.iv.push(iv);
}
function stgPlay(box, ds, R) {
  STG.run = true; STG.round = R.round; STG.tm = []; STG.iv = []; STG.dirty = false;
  const rows = [...box.querySelectorAll('.ds')], n = rows.length, step = Math.max(440, Math.min(700, Math.round(1500 / Math.max(1, n))));
  const at = (ms, fn) => STG.tm.push(setTimeout(() => { if (STG.run && STG.round === R.round) { try { fn(); } catch (e) { console.error(e); } } }, ms));
  const FACES = ['vp1', 'vp2', 'ruby', 'drop', 'orange', 'vp1'];
  let t = 200, last = 0;
  rows.forEach((row, i) => {
    const d = ds[i]; const T0 = t; const potEl = row.querySelector('.dpot'), tile = row.querySelector('.dtile'), tn = row.querySelector('.tn'), chip = row.querySelector('.dtot'), drb = row.querySelector('.drb');
    at(T0, () => { row.classList.remove('pre'); row.classList.add('lit', 'in'); potEl.innerHTML = stgPot(d, true); snd('plop'); });
    let tt = T0 + 300;
    if (d.die.length) {
      const dd = row.querySelector('.ddie');
      at(tt, () => { dd.classList.add('roll'); snd('click'); let k = 0; const iv = setInterval(() => { [...dd.children].forEach((c, j) => { c.innerHTML = KIT.ICON.die(30, FACES[(k + j * 2) % FACES.length]); }); k++; }, 75); STG.iv.push(iv); setTimeout(() => clearInterval(iv), 440); });
      at(tt + 480, () => { dd.classList.remove('roll', 'pend'); [...dd.children].forEach((c, j) => { c.innerHTML = KIT.ICON.die(30, d.die[j]); }); snd('coin'); });
      tt += 560;
    }
    at(tt, () => {
      if (d.gain !== 0 && tile) stgFlyTo(tile, chip, ico('vp', 22) + '<b>' + (d.gain > 0 ? '+' : '') + d.gain + '</b>', 'dfv', 420, 0, () => { chip.classList.add('pop'); snd('coin'); stgCount(tn, d.start, d.after, 320); });
      else tn.textContent = d.after;
      if (d.rg > 0 && tile) for (let k = 0; k < Math.min(3, d.rg); k++) stgFlyTo(tile, drb, ico('ruby', 20), 'dfr', 460, 120 + k * 90, k === 0 ? () => { drb.classList.add('pop'); snd('ruby'); } : null);
      if (d.boom && !d.prot) row.classList.add('shake');
    });
    last = tt + 480; t += (d.die.length ? step + 300 : step);
  });
  at(Math.max(last, t) + 160, () => { stgFinish(); });
}
// ---------- W471: the points race under the day's pots: every maker's total as a bar, today's gain lit, who leads in one line
function stgRace(ds, v, play, R) {
  const top = Math.max(1, ...ds.map(d => d.after)), ord = ds.slice().sort((a, b) => b.after - a.after), lead = ord[0], second = ord[1];
  const box = h('div.drace', { 'aria-label': 'Points after day ' + R.round });
  const line = !second ? '' : lead.after === second.after ? 'Level at ' + lead.after + ' points.' : (lead.p.seat === v ? 'You lead' : lead.p.name + ' leads') + ' by ' + (lead.after - second.after) + '.';
  const lc = D.CHARS[chefOf(lead.p.seat) % 4], tie = second && lead.after === second.after;
  const por = h('img.drpor', { src: 'media/camp-' + lc.id + '.webp', alt: '', width: 112, height: 112, draggable: 'false', style: '--rc:' + lc.css }); por.onerror = () => por.remove();
  box.appendChild(h('div.drhero', tie ? null : por, h('div.drhl', h('b', 'Points after day ' + R.round), line ? h('span', line) : null)));
  ds.forEach(d => {
    const me = d.p.seat === v, w0 = Math.round(100 * d.start / top), w1 = Math.round(100 * d.after / top);
    const bar = h('span.drbar', h('i.drold', { style: 'width:' + w0 + '%' }), h('i.drnew', { style: '--w0:' + w0 + '%;--w1:' + (play ? w0 : w1) + '%' }));
    const num = h('b.drn', play ? d.start : d.after);
    box.appendChild(h('div.drrow' + (me ? '.me' : ''), h('span.drav', { html: avHTML(d.p.seat, 32) }), h('span.drnm', me ? 'You' : d.p.name), bar, num, h('span.drg' + (d.gain > 0 ? '.up' : ''), d.gain > 0 ? '+' + d.gain : '')));
  });
  if (!play && STG.raced !== R.round) { STG.raced = R.round; setTimeout(() => box.querySelectorAll('.drrow').forEach((r, i) => { const d = ds[i], n = r.querySelector('.drn'); if (n && d.gain) { n.textContent = d.start; stgCount(n, d.start, d.after, 700); } }), 60); box.classList.add('grow'); }
  return box;
}
// ---------- the day end screen ----------
function stgSeats(v) {   // thin chips of every maker (the same chips the points flew into)
  return h('div.dseats', G.players.map(p => h('span.dsc' + (p.seat === v ? '.me' : ''), { html: avHTML(p.seat, 26), title: p.name }, h('span', { html: ico('vp', 15) }), h('b', p.vp))));
}
function stageDecision(me, myq, R, hotPriv) {   // -> { body, kind }
  const legal = mvList(me.seat); UI.legal[me.seat] = legal;
  if (myq.h === 'de' && !hotPriv) return { body: null, kind: 'tally' };      // the two choices sit on your own scoring tile
  if (myq.h === 'shop') { const m = marketEl(me, myq); return { body: m, kind: 'market' }; }
  if (myq.h === 'ruby') { const el = rubyBoard(me); UI.rsFoot = [h('div.shopfoot', h('button.btn.go.confirm', { 'data-a': 'rubygo', type: 'button' }, nextLabel()))]; return { body: el, kind: 'ruby' }; }
  return { body: decisionBox(me, myq), kind: 'sheet' };
}
function stgScreen(R, v, me, myq, hotShared, hotPriv, play) {
  const ds = hotPriv ? [] : G.players.map(p => stgData(p, R)).filter(Boolean);
  const dec = !!myq && !hotShared && !play;      // while the sequence plays the choices wait
  UI.rsFoot = null;
  const sd = dec ? stageDecision(me, myq, R, hotPriv) : null, kind = sd ? sd.kind : 'tally';
  const box = h('div.rsbox.fix.stg.stg-' + kind, { role: 'dialog', 'aria-label': 'Day ' + R.round });
  const head = h('div.sthead', h('h2', { html: ico('coin', 24) }, hotPriv ? 'Day ' + R.round + ': ' + me.name : 'Day ' + R.round), kind === 'tally' || kind === 'sheet' ? null : stgSeats(v));
  box.appendChild(head); box.appendChild(h('div#rstip.tipb', { hidden: true }));
  const body = h('div.rsbody'); box.appendChild(body);
  if (kind === 'market' || kind === 'ruby') body.appendChild(sd.body);
  else {
    if (!hotPriv) { const tab = h('div.dtable'); ds.forEach(d => tab.appendChild(stgRow(d, v, play))); body.appendChild(tab); }
    if (!hotPriv && kind === 'tally' && ds.length && !(myq && myq.h === 'de')) body.appendChild(stgRace(ds, v, play, R));   // the boom choice needs the room
    if (kind === 'sheet') { const sh = h('div.dsheet'); sh.appendChild(sd.body); body.appendChild(sh); }
    if (hotShared) body.appendChild(h('div.dwait', 'Next: private choices'));
  }
  const foot = h('div.rsfoot');
  const done = G.phase !== 'eval' && !myq && !hotShared;
  const next = G.phase === 'over' ? 'See the final scores' : 'On to day ' + G.round;
  if (play) { foot.hidden = true; }
  else if (UI.rsFoot) UI.rsFoot.forEach(e => foot.appendChild(e));
  else if (hotShared) foot.appendChild(h('div.cbtns', h('button.btn.go', { 'data-a': 'hotgo', type: 'button' }, 'Next: private choices')));
  else {
    const btns = h('div.cbtns', { style: 'display:flex;gap:8px;flex-wrap:wrap;align-items:center' });
    const adv = done && UI.advFor === R.round && !hotSeat() && !(typeof NET !== 'undefined' && NET.on);
    const w = G.players.filter(p => p.q && p.seat !== v).map(p => p.name);
    if (myq && !done) { foot.hidden = true; } else btns.appendChild(h('button.btn.go' + (done && !adv ? '' : '.off'), { 'data-a': 'rscont', type: 'button', disabled: done && !adv ? null : true }, adv ? next + '…' : done ? next : (myq ? 'Choose above first' : (w.length ? 'Waiting for ' + w[0] + '…' : 'Counting up…'))));
    foot.appendChild(btns);
  }
  box.appendChild(foot);
  return { box, ds, kind };
}
// ---------- the market stall ----------
// what each stall's chip does, in plain words short enough for a 375px phone (tap a chip for the full text)
const STALL_DO = { none: 'No power, cheapest', black: 'Most moths: droplet', g1: 'In last 2: a ruby', g2: 'In last 2: free chip', g3: 'Whites at 7: slide on', g4: 'In last 2: buy droplet',
  b1: 'Peek, then pick one', b2: 'Shields next chips', b3: 'On a ruby: +1 ruby', b4: 'On a ruby: points', r1: '+1 after an orange', r2: 'Set aside, add later', r3: 'After a white: jumps', r4: 'White 1s move 2',
  y1: 'After a white: undo it', y2: 'Next chip moves ×2', y3: 'Raises your limit', y4: 'Moves extra spaces', p1: 'Points at the count', p2: 'Trade in for prizes', p3: 'Far out: points', p4: 'Upgrades a chip' };
function marketEl(p, q) {
  const wrap = h('div.mkt'); const coins = q.d.coins, sel = UI.shopSel = (UI.shopSel || []).filter(k => G.supply[k] > 0);
  const cost = sel.reduce((a, k) => a + CF.price(G, k[0], +k.slice(1)), 0);
  wrap.appendChild(h('div.awn', h('span.pur', { html: ico('coin', 30) }, h('b', coins - cost))));
  const stalls = h('div.stalls');
  for (const c of D.SHOP_COLORS) {
    const out = CF.bookOut(G, c), st = h('div.stall.c' + c + (out ? '' : '.locked'), { 'data-lp': 'chip:' + c + D.COLORS[c].vals[0] });
    const bk = c === 'O' ? D.BOOKS.O[0] : c === 'K' ? D.BOOKS.K[0] : D.BOOKS[c][G.sets[c]];
    st.appendChild(h('div.sth', h('b', D.COLORS[c].name), out ? null : h('span.slock', 'day ' + D.BOOK_ROUND[c])));
    st.appendChild(h('div.sdo', bk ? (STALL_DO[bk.eff] || bk.title) : ''));   // what the chip does, in a few words (long-press or tap it for the full text)
    const row = h('div.toks');
    D.COLORS[c].vals.forEach(val => {
      if (c === 'W' || (c === 'O' && val !== 1)) return; const key = c + val, price = CF.price(G, c, val), left = G.supply[key];
      const on = sel.indexOf(key) >= 0; const others = sel.filter(k => k[0] !== c).reduce((a, k) => a + CF.price(G, k[0], +k.slice(1)), 0);
      const dis = !out || left < 1 || price + others > coins;
      row.appendChild(h('div.tokw', { 'data-lp': 'chip:' + key }, h('button.tok' + (on ? '.on' : '') + (dis && !on ? '' : '.tglow'), { 'data-a': 'shopsel', 'data-k': key, type: 'button', disabled: dis && !on ? true : null, 'aria-pressed': on ? 'true' : 'false', 'aria-label': keyName(key) + ' for ' + price + ' coins' + (left < 1 ? ', sold out' : '') },
        chipN(key, 44), h('span.pc', h('span', { html: ico('coin', 13) }), left < 1 ? '—' : price))));
    });
    st.appendChild(row); stalls.appendChild(st);
  }
  if (p.rubies >= D.rubySpend && G.round < LASTD()) { rubyPick(p); stalls.appendChild(rubyBar(p)); UI.rubyShown = true; } else UI.rubyShown = false;
  const more = h('button.smore', { type: 'button', hidden: true, 'aria-label': 'Scroll down to more stalls' });
  more.addEventListener('click', ev => { ev.stopPropagation(); stalls.scrollBy({ top: stalls.clientHeight * .8, behavior: 'smooth' }); });
  wrap.appendChild(h('div.stw', stalls, more)); stalls.addEventListener('scroll', () => smoreUpd(stalls, more), { passive: true });
  requestAnimationFrame(() => smoreUpd(stalls, more));
  { const k = sel[sel.length - 1], bk = k ? (k[0] === 'O' ? D.BOOKS.O[0] : k[0] === 'K' ? D.BOOKS.K[0] : D.BOOKS[k[0]][G.sets[k[0]]]) : null;
    const ri = UI.shopInfo && UI.rubyShown ? RUBY_INFO[UI.shopInfo] : null;
    wrap.appendChild(h('div.sinfo', ri ? h('span', h('b', ri.split(':')[0] + ':'), ri.slice(ri.indexOf(':') + 1)) : bk ? h('span', h('b', keyName(k) + ': '), bk.text) : 'Tap a chip to see what it does. Buy up to 2, different colours.')); }
  const bagArt = KIT.ART.bag ? h('img.sbimg', { src: KIT.ART.bag, alt: '' }) : h('span.sbimg', { html: ico('bag', 56) });
  const bagz = h('div.shopbag', { 'aria-label': 'Your bag' }, bagArt, h('div.sbin', sel.length ? sel.map(k => h('button.sbc', { 'data-a': 'shopsel', 'data-k': k, type: 'button', 'aria-label': 'Take ' + keyName(k) + ' out again' }, chipN(k, 40))) : h('span.sbe', { html: ico('bag', 22) })));
  UI.rsFoot = [h('div.shopfoot', bagz, h('button.btn.go.confirm', { 'data-a': 'shopbuy', type: 'button' }, nextLabel()))];
  try { sugMark(wrap, p, q, []); } catch (e) { }
  return wrap;
}
// R8: at 375 the stalls scroll; say how many are below and fade the bottom edge
function smoreUpd(st, btn) {
  if (!st.isConnected) return; const b = st.getBoundingClientRect().bottom, n = [...st.children].filter(c => c.getBoundingClientRect().bottom > b + 6).length;
  st.classList.toggle('more', n > 0); btn.hidden = !n; if (n) btn.textContent = n + ' more stall' + (n > 1 ? 's' : '') + ' \u25BC';
}
// ---------- rubies: tap the droplet's next space, tap the flask ----------
function rubyState(p) {
  const sel = rubyPick(p), mx = Math.floor(p.rubies / D.rubySpend), opts = rubyOpts(p), has = o => opts.some(x => rubyKey(x) === rubyKey(o));
  const keyFor = (drop, flask) => { let o = { drop, flask: !!flask }; if (!has(o)) o = { drop, flask: false }; return has(o) ? rubyKey(o) : null; };
  const nextDrop = () => { for (const d of [sel.drop + 1, 0]) { const o = { drop: d, flask: sel.flask }; if (has(o) && rubyKey(o) !== rubyKey(sel)) return rubyKey(o); } return null; };
  const flaskKey = () => { if (p.flask) return null; let o = { drop: sel.drop, flask: !sel.flask }; if (has(o)) return rubyKey(o); o = { drop: sel.drop - 1, flask: !sel.flask }; return o.drop >= 0 && has(o) ? rubyKey(o) : null; };
  return { sel, mx, keyFor, nextDrop, flaskKey, cost: (sel.drop + (sel.flask ? 1 : 0)) * D.rubySpend };
}
function rubyGems(p, cost, compact) {
  if (compact) return h('span.rgems.cmp', { 'aria-label': p.rubies + ' rubies' }, h('i', { html: ico('ruby', 22) }), h('b', '×' + p.rubies), cost ? h('b.rcs', '−' + cost) : null);
  const n = p.rubies, out = h('span.rgems', { 'aria-label': n + ' rubies' }); const show = Math.min(n, 10);
  for (let i = 0; i < show; i++) out.appendChild(h('i' + (i >= n - cost ? '.spent' : ''), { html: ico('ruby', 20) }));
  if (n > show) out.appendChild(h('b', '+' + (n - show)));
  return out;
}
function rubyBar(p) {   // the ruby stall of the market: plain words on each button, a tap explains it in the line below
  const S = rubyState(p), n = D.rubySpend, el = h('div.rbar.rubyp', h('div.rbh', h('b', 'Rubies'), rubyGems(p, S.cost, true)));
  const dk = S.nextDrop(), fk = S.flaskKey(), undoDrop = dk && S.sel.drop && +dk[0] === 0;
  const dropTxt = undoDrop ? 'Drop moved +' + S.sel.drop : 'Move your drop +' + (S.sel.drop + 1), flaskTxt = p.flask ? 'Flask is full' : S.sel.flask ? 'Flask refilled' : 'Refill flask';
  el.appendChild(h('button.rbt.rdrop.rwd' + (S.sel.drop ? '.on' : '') + (dk ? '.tglow' : ''), { 'data-a': 'rubysel', 'data-k': dk || '', 'data-ri': 'drop', type: 'button', disabled: dk ? null : true, 'aria-label': dropTxt + ': ' + n + ' rubies' }, h('span', { html: ico('drop', 24) }), h('span.rwt', h('b', dropTxt), h('em', undoDrop ? 'tap to undo' : n + ' rubies'))));
  el.appendChild(h('button.rbt.rflask.rwd' + (S.sel.flask ? '.on' : '') + (fk ? '.tglow' : ''), { 'data-a': 'rubysel', 'data-k': fk || '', 'data-ri': 'flask', type: 'button', disabled: fk ? null : true, 'aria-label': p.flask ? 'Flask is full' : flaskTxt + ': ' + n + ' rubies' }, h('span', { html: ico('flask', 24, p.flask || S.sel.flask) }), h('span.rwt', h('b', flaskTxt), p.flask ? null : h('em', S.sel.flask ? 'tap to undo' : n + ' rubies'))));
  const best = el.querySelector('[data-k="' + UI.rubyBest + '"]'); if (best) best.classList.add('sug');
  return el;
}
const RUBY_INFO = { drop: 'Move your drop: 2 rubies push your droplet 1 space further. Every brew from now on starts there, so each chip lands further out.',
  flask: 'Refill flask: 2 rubies refill your flask. In the next brew you can put back one white chip you just drew.' };
function rubyBoard(p) {   // the ruby-only screen: a zoomed cauldron, the droplet, its next spaces, the flask
  const S = rubyState(p), pts = KIT.GEO.pts, R = KIT.GEO.R, i0 = p.droplet, i1 = Math.min(D.TRACK_LEN - 1, p.droplet + S.mx);
  let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; for (let i = i0; i <= i1; i++) { x0 = Math.min(x0, pts[i].x); x1 = Math.max(x1, pts[i].x); y0 = Math.min(y0, pts[i].y); y1 = Math.max(y1, pts[i].y); }
  const sz = Math.max(6, Math.max(x1 - x0, y1 - y0) + 3), cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, vx = cx - sz / 2, vy = cy - sz / 2;
  const svg = KIT.potSVG({ pot: [], droplet: p.droplet + S.sel.drop, rat: 0, space: null, boom: false, mini: false, uid: 'rb', label: 'Your cauldron', size: 400 }).replace(/viewBox="[^"]*" width="\d+" height="\d+"/, 'viewBox="' + vx.toFixed(2) + ' ' + vy.toFixed(2) + ' ' + sz.toFixed(2) + ' ' + sz.toFixed(2) + '"');
  const wrap = h('div.rboard'); wrap.appendChild(h('div.rtop', rubyGems(p, S.cost), h('b.rcost', { html: S.cost ? ico('ruby', 20) : '' }, S.cost ? '−' + S.cost : '')));
  wrap.appendChild(h('div.rhelp', 'Spend ' + D.rubySpend + ' rubies: tap a glowing drop to start one space further, or tap the flask to refill it. Or keep them.'));
  const pot = h('div.rpot', { html: svg });
  for (let k = 0; k <= S.mx; k++) {
    const q = pts[p.droplet + k]; if (!q) break; const key = S.keyFor(k, S.sel.flask); if (!key) continue; const here = k === S.sel.drop;
    pot.appendChild(h('button.rtg.tglow' + (here ? '.here' : '') + (key === UI.rubyBest ? '.sug' : ''), { 'data-a': 'rubysel', 'data-k': key, type: 'button', 'aria-pressed': here ? 'true' : 'false', 'aria-label': k ? 'Start ' + k + ' further on' : 'Keep the droplet here', style: 'left:' + ((q.x - vx) / sz * 100).toFixed(2) + '%;top:' + ((q.y - vy) / sz * 100).toFixed(2) + '%;width:' + (1.15 / sz * 100).toFixed(2) + '%;height:' + (1.15 / sz * 100).toFixed(2) + '%' },
      here ? null : h('span.rgh', { html: ico('drop', 26) }), k ? h('i', { html: ico('ruby', 12) }, k * D.rubySpend) : null));
  }
  wrap.appendChild(pot);
  const fk = S.flaskKey();
  wrap.appendChild(h('div.rside', h('button.rbt.rflask.big' + (S.sel.flask ? '.on' : '') + (fk ? '.tglow' : '') + (fk && fk === UI.rubyBest ? '.sug' : ''), { 'data-a': 'rubysel', 'data-k': fk || '', type: 'button', disabled: fk ? null : true, 'aria-label': p.flask ? 'Flask is full' : 'Refill the flask for ' + D.rubySpend + ' rubies' }, h('span', { html: ico('flask', 54, p.flask || S.sel.flask) }), p.flask ? null : h('i', '−' + D.rubySpend), h('em.rlb', p.flask ? 'Flask full' : S.sel.flask ? 'Refilled' : 'Refill flask')),
    h('span.rdp', { html: ico('drop', 22) }, h('b', p.droplet + S.sel.drop), h('em.rlb', 'Start space'))));
  return wrap;
}
