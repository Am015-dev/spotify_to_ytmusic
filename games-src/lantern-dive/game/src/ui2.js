// ===================== part 2: the deep-sea table (seats, trick, job pool, hand, action tray) =====================
// Play happens on the table: divers sit around it with their job tokens, the trick lies in the middle, your hand is along the bottom.
// There is no text panel: one short status line (8 words or fewer) in the top bar, glows on what can be tapped, badges on the seats.
const isPh = () => document.documentElement.classList.contains('ph');
function actorSeat() {
  if (!G || G.phase === 'over') return -1;
  switch (G.phase) {
    case 'assign': return G.as.actor;
    case 'distress': return G.cap;
    case 'predict': { const t = G.tasks.find(t => TASKS[t.id].k === 'pred' && t.pn < 0); return t ? t.owner : -1; }
    case 'signal': return G.sig.actor;
    case 'play': return G.trick ? G.trick.turn : -1;
  }
  return -1;
}
// ---- sizes: hand card width (CSS variable); the table's own geometry comes from tableGeo() once the hand has its height ----
function layoutVars() {
  const bd = $('#bd'); if (!bd) return; const W = bd.clientWidth || 360, H = bd.clientHeight || 600, ph = isPh(), vw = GXV.now(), land = ph && vw.w > vw.h;
  let hw = ph ? (land ? Math.max(44, Math.min(48, Math.round(H * .13))) : Math.max(48, Math.min(62, Math.round(H * .092)))) : Math.max(60, Math.min(104, Math.round(H * .125)));
  const short = ph && !land && vw.h < 640; document.documentElement.classList.toggle('ph-short', short); if (short) hw = 44;
  bd.classList.toggle('side', W > H * 1.45);
  document.documentElement.style.setProperty('--hw', hw + 'px');
  if (KIT.ART.table && !document.documentElement.style.getPropertyValue('--tableimg')) document.documentElement.style.setProperty('--tableimg', 'url("' + KIT.ART.table + '")');
}
// ---- the bar: dive name, flare, clock; the status line sits next to it ----
function renderBar() {
  const bs = $('#barstat'); if (!bs) return; bs.innerHTML = '';
  if (G && UI.started) {
    bs.append(h('span', diveLabel() + (UI.mode === 'descent' ? '' : ' · attempt ' + G.att)));
    if (G.distress) bs.append(h('span', { html: KIT.flareSVG({ size: 20, on: true }), title: 'Distress flare is lit' }));
    if (G.clock) { const t = h('span.tm' + (UI.clockLeft != null && UI.clockLeft < 20 ? '.low' : ''), clockText()); t.id = 'clk'; bs.append(t); }
  }
  placePrompt();
}
function clockText() { const s = Math.max(0, Math.round(UI.clockLeft != null ? UI.clockLeft : (G ? G.clock : 0))); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
function placePrompt() { const bp = $('#barprompt'), pr = $('#prompt'); if (bp && pr && pr.parentNode !== bp) bp.appendChild(pr); }
// ---- job tokens ----
const TICK_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5L9.5 18L20 6"/></svg>', CROSS_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke-linecap="round"><path d="M6 6L18 18M18 6L6 18"/></svg>';
function jobChip(i, o) {
  o = o || {}; const st = jobSt(i), d = jobDef(i);
  // chips on another diver's seat are plain tokens (the seat is the tap target); only your own chips are buttons
  const cls = '.jc' + (st > 0 ? '.ok' : st < 0 ? '.bad' : '') + (o.me ? '.me' : '') + (o.opp ? '.opp' : '');
  const lab = { 'aria-label': jobShort(i) + (st > 0 ? ', done' : st < 0 ? ', failed' : ', open'), 'data-job': i };
  const b = o.opp ? h('span' + cls, lab) : h('button' + cls, Object.assign({ type: 'button', 'data-a': 'job', 'data-i': i }, lab));
  const sm = h('span.sm'); if (st > 0) sm.innerHTML = TICK_SVG; else if (st < 0) sm.innerHTML = CROSS_SVG; else sm.innerHTML = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3.4" fill="#fff" stroke="none"/></svg>';
  b.append(sm, h('span.t', d.s));
  if (o.me) { const df = h('span.df'); for (let k = 0; k < jobDiff(i); k++) df.append(h('i')); b.append(df); }
  if (st !== 0) {   // a stamp lands on the token the first time it shows
    UI.stampSeen = UI.stampSeen || {}; const k = G.seed + ':' + G.att + ':' + i + ':' + st, nw = !UI.stampSeen[k]; UI.stampSeen[k] = 1;
    b.append(h('span.stamp' + (st > 0 ? '.ok' : '.bad') + (nw ? '.new' : ''), { html: st > 0 ? TICK_SVG : CROSS_SVG, 'aria-hidden': 'true' }));
  }
  return b;
}
// ---- the divers (and the drone) ----
function pingTok(s, size) {
  const p = G.players[s]; if (p.helper) return null;
  if (G.comm === 'none') return h('span.tok', { html: KIT.pingSVG({ size, spent: true }), title: 'No signalling in this dive' });
  if (G.comm === 'narc') return null;
  return h('span.tok', { html: KIT.pingSVG({ size, spent: !!p.pingUsed }), title: p.pingUsed ? 'Ping used' : 'Ping ready' });
}
function shownEl(s) {
  const sh = shownBy(s); if (!sh.length) return null;
  const w = h('span.shownw', { style: 'display:flex;gap:3px' });
  sh.slice(0, 2).forEach(p => w.append(h('span.spill', { style: 'background:' + D.suits[suitOf(p.c)].c + ';color:' + (suitOf(p.c) === 3 || suitOf(p.c) === 4 ? '#1b1405' : '#fff'), title: cname(p.c) + (p.k === 'high' ? ' (their highest)' : p.k === 'low' ? ' (their lowest)' : p.k === 'only' ? ' (their only one)' : '') }, String(valOf(p.c)) + (p.k === 'high' ? '\u25B2' : p.k === 'low' ? '\u25BD' : p.k === 'only' ? '\u25CF' : ''))));
  return w;
}
const CARD_ICO = '<svg viewBox="0 0 12 16" aria-hidden="true"><rect x="1" y="1" width="10" height="14" rx="2.2"/><path d="M4 5.5h4M4 8.5h4"/></svg>', TRICK_ICO = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.2l2 4.4 4.8.5-3.6 3.2 1 4.7L8 11.6l-4.2 2.4 1-4.7L1.2 6.1 6 5.6z"/></svg>';
// who may be voted for / is still deciding, shown on the seats instead of a roster
function seatMarks() {
  const m = { vote: new Set(), pend: new Set(), ready: new Set() };
  if (!G || G.phase === 'over') return m;
  const v = viewSeat();
  if (G.phase === 'assign' && G.as.mode === 'vote' && iMustAct() && !UI.busy) myMoves().forEach(x => { if (x.t === 'vote') m.vote.add(x.f); });
  if (G.phase === 'pass') { const pend = new Set(LD.pending(G)); G.players.forEach(p => { if (p.helper) return; (pend.has(p.seat) ? m.pend : m.ready).add(p.seat); }); }
  return m;
}
function seatEl(s, act, mk) {
  const p = G.players[s]; if (p.helper) return droneEl(s, act, mk);
  const won = tricksWon()[s], cm = s === G.cap, vote = mk.vote.has(s);
  const b = h('button.seat' + (act === s ? '.act' : '') + (vote ? '.glow' : '') + (mk.pend.has(s) ? '.pend' : '') + (mk.ready.has(s) && G.phase === 'pass' ? '.rdy' : ''), { type: 'button', 'data-a': 'seat', 'data-seat': s, 'aria-label': p.name + (cm ? ', Commander' : '') + ', ' + p.hand.length + ' cards' });
  const av = h('span.av', { html: avatarS(s, 80), 'data-key': 'seat' + s }); if (cm) av.append(h('span.cm', { html: KIT.cmdSVG({ size: 17 }), title: 'Commander' }));
  const t = pingTok(s, 18); if (t) { t.classList.add('pk'); av.append(t); }
  b.append(h('span.top', av, h('span.nm', p.name)), h('span.bdgs', h('span.bdg.n', { html: CARD_ICO + '<b>' + p.hand.length + '</b>', title: p.hand.length + ' cards left' }), h('span.bdg.t', { html: TRICK_ICO + '<b>' + won + '</b>', title: won + ' tricks won' })));
  const sh = shownEl(s); if (sh) b.append(h('span.pg', sh));
  const js = jobs(s), jb = h('span.jobs'); js.slice(0, 2).forEach(i => jb.append(jobChip(i, { opp: 1 }))); if (js.length > 2) jb.append(h('span.jc.more', '+' + (js.length - 2)));
  b.append(jb);
  return b;
}
function droneEl(s, act, mk) {
  const p = G.players[s], v = viewSeat();
  const b = h('div.seat.drone' + (act === s ? '.act' : ''), { 'data-seat': s });
  const av = h('span.av', { html: avatarS(s, 80), 'data-key': 'seat' + s });
  const won = tricksWon()[s];
  const top = h('span.top', av, h('span.who', h('span.nm', p.name), h('span.bdgs', h('span.bdg.n', { html: CARD_ICO + '<b>' + p.hand.length + '</b>' }), h('span.bdg.t', { html: TRICK_ICO + '<b>' + won + '</b>' }))));
  const js = jobs(s); const jb = h('span.jobs.dj');
  js.slice(0, 3).forEach(i => jb.append(jobChip(i, { opp: 1 }))); if (js.length > 3) jb.append(h('span.jc.more', '+' + (js.length - 3)));
  b.append(h('div.dhead', h('button.dseat', { type: 'button', 'data-a': 'seat', 'data-seat': s, 'aria-label': 'Drone ' + p.name }, top), jb));
  const row = h('div.drow');
  const myTurn = G.phase === 'play' && G.trick.turn === s && G.cap === v && !UI.fz;
  const legal = myTurn ? LD.playable(G, s) : [];
  (p.stacks || []).forEach(st => {
    const top2 = st[0], hasBot = st[1] !== -1;
    const w = h('div.dstack', h('div.dbk' + (hasBot ? '' : '.none')));
    if (top2 >= 0) {
      const can = legal.includes(top2);
      const c = h('button.dc' + (can ? '.can.glow' : (myTurn ? '.dim' : '')) + (UI.sel === top2 ? '.sel' : ''), { type: 'button', 'data-a': 'dcard', 'data-id': top2, 'data-px': 'card', 'data-pk': 'h:' + top2, 'aria-label': cname(top2) + (can ? ', playable' : '') });
      c.append(cardN(top2, 46)); w.append(c);
    }
    row.append(w);
  });
  b.append(row); return b;
}
// ---- the table's geometry: where each seat sits and where each diver's card lies in the trick ----
function tableGeo() {
  const T = $('#table'), bd = $('#bd'); if (!T) return null;
  const W = T.clientWidth || 360, H = T.clientHeight || 400, n = G.np, k = n - 1, ph = isPh();
  const side = !!(bd && bd.classList.contains('side')), small = !side && H < 420, boss = !!(G.boss && G.phase !== 'assign');
  const drone = G.players.findIndex(p => p.helper);
  const compact = side || small;
  const av = side ? 28 : (small ? 28 : 32), jr = Math.min(2, Math.max(1, Math.ceil(G.tasks.length / Math.max(1, G.np))));
  const seatW = side ? 132 : Math.round(Math.min(90, W * .23)), seatH = side ? 76 : (small ? 100 : 116);
  const y0 = 4 + (boss ? (small || side ? 34 : 40) : 0), bottom = side ? 52 : 54;
  const geo = { W, H, k, side, small, compact, seatW, seatH, av, jr, boss, seats: [], slots: [] };
  const dw = Math.max(30, Math.min(small ? 38 : (ph ? 46 : 58), Math.floor((side ? Math.min(W * .4, 340) : W - 16) / 7) - 4)), droneW = side ? Math.min(W * .42, 340) : W - 8;
  geo.dw = dw; geo.droneW = droneW; geo.dh = 44 + Math.round(dw * 1.4) + 14;
  // trick area
  let top, zl = 0, zr = W;
  if (side) { top = y0; zl = seatW + 12; zr = W - seatW - 12; if (drone >= 0) zr = W - droneW - 12; } else top = y0 + (drone >= 0 ? Math.max(seatH, geo.dh) : seatH) + 4;
  const zoneH = Math.max(80, H - top - bottom), cy = top + zoneH / 2, cx = side ? (zl + zr) / 2 : W / 2;
  let cw = Math.floor(zoneH / (side ? 3.8 : 4.4)); const cwMax = ph ? 70 : 112;
  if (!side && k >= 3) cw = Math.min(cw, Math.floor((W / 2 - seatW - 8) / 1.5));
  if (side) cw = Math.min(cw, Math.floor((zr - zl) / 4.6));
  cw = Math.max(30, Math.min(cwMax, cw)); const ch = Math.round(cw * 1.4);
  geo.pl = side ? zl : ((k >= 3 || drone >= 0) ? seatW + 8 : 6); geo.pr = side ? zr : ((k >= 3 || drone >= 0) ? W - seatW - 8 : W - 6);
  geo.cw = cw; geo.ch = ch; geo.cx = cx; geo.cy = cy; geo.top = top; geo.zoneH = zoneH;
  const rx = Math.round(cw * (side ? 1.5 : 1.05)), ry = Math.round(ch * (side ? .86 : 1.0));
  for (let rel = 0; rel < n; rel++) { const th = rel * 2 * Math.PI / n; geo.slots.push([Math.round(cx - Math.sin(th) * rx), Math.round(cy + Math.cos(th) * ry)]); }
  // seats: i = 1..k clockwise from you (left side first, then the top, then the right side)
  const L = seatW / 2 + 5, R = W - seatW / 2 - 5, mid = cy - seatH / 2 + 8;
  geo.L = L; geo.R = R; geo.mid = mid; geo.y0 = y0;
  return geo;
}
// seat anchors for the seat list (clockwise from `from`)
function seatSpots(geo, list) {
  const { W, k, side, seatW, seatH, cy, y0, L, R, mid } = geo, out = [], droneIdx = list.findIndex(s => G.players[s].helper);
  const sp = (x, y, w) => ({ x: Math.round(x), y: Math.round(y), w: w || seatW });
  if (side) {
    const dW = geo.droneW; const colL = [], colR = [];
    if (droneIdx >= 0) { list.forEach((s, i) => { if (i === droneIdx) colR.push(s); else colL.push(s); }); }
    else { const half = Math.ceil(list.length / 2); list.forEach((s, i) => { if (i < half) colL.push(s); else colR.push(s); }); }
    const put = (col, x, w, up) => { const m = col.length, order = up ? col.slice().reverse() : col; order.forEach((s, j) => { const h0 = G.players[s].helper ? geo.dh : seatH, gap = 6; const tot = m * h0 + (m - 1) * gap, y = cy - tot / 2 + j * (h0 + gap); out[list.indexOf(s)] = sp(x, Math.max(2, Math.min(geo.H - h0 - 2, y)), w); }); };
    put(colL, seatW / 2 + 3, seatW, true);   // bottom to top: the seat next to you (clockwise) is the lowest
    put(colR, geo.W - (droneIdx >= 0 ? dW / 2 + 4 : seatW / 2 + 3), droneIdx >= 0 ? dW : seatW, false);
    return out;
  }
  const kk = list.length;
  if (droneIdx >= 0) {
    list.forEach((s, i) => { if (i === droneIdx) out[i] = sp(W / 2, y0, W - 8); else out[i] = sp(i < droneIdx ? L : R, mid, seatW); });
    return out;
  }
  if (kk === 2) { out[0] = sp(W * .24, y0); out[1] = sp(W * .76, y0); }
  else if (kk === 3) { out[0] = sp(L, mid); out[1] = sp(W / 2, y0); out[2] = sp(R, mid); }
  else { out[0] = sp(L, mid + 18); out[1] = sp(W * .31, y0); out[2] = sp(W * .69, y0); out[3] = sp(R, mid + 18); }
  return out;
}
function renderOpp(v) {
  const box = $('#opp'); box.innerHTML = ''; if (!G) return;
  const geo = UI.geo; if (!geo) return;
  const act = G.phase === 'play' && G.trick ? G.trick.turn : actorSeat(), mk = seatMarks();
  const from = v >= 0 ? v : 0, list = seatsClockwise(from), spots = seatSpots(geo, list);
  list.forEach((s, i) => {
    const el = seatEl(s, act, mk), sp = spots[i]; if (!sp) return;
    el.style.left = (sp.x - sp.w / 2) + 'px'; el.style.top = sp.y + 'px'; el.style.width = sp.w + 'px';
    box.append(el);
  });
}
// ---- the felt: trick slots in the middle, the job cards while they are handed out ----
function playsShown() { if (UI.fz && UI.fz.plays) return UI.fz.plays; return G && G.phase === 'play' && G.trick ? G.trick.plays : (G && G.phase === 'over' && G.trick ? G.trick.plays : []); }
function renderFelt(v) {
  const felt = $('#felt'), slots = $('#slots'), pool = $('#pool'), lead = $('#lead'), pile = $('#pile'); if (!felt) return;
  slots.innerHTML = ''; pool.innerHTML = ''; lead.innerHTML = ''; pile.innerHTML = '';
  const geo = UI.geo; if (!geo) return;
  const from = v >= 0 ? v : 0;
  const assign = G.phase === 'assign';
  pool.hidden = !assign || !G.tasks.some(t => t.owner < 0); slots.hidden = !(G.phase === 'play' || G.phase === 'over' || UI.fz);
  { const cm = $('#cenmark'); if (cm) { cm.innerHTML = ''; cm.hidden = G.phase !== 'distress'; if (!cm.hidden) { cm.style.left = geo.cx + 'px'; cm.style.top = geo.cy + 'px'; cm.innerHTML = KIT.flareSVG({ size: Math.min(110, geo.zoneH * .5), on: !!G.distress }); } } }
  if (!pool.hidden) {
    const mv = myMoves(), mineTurn = iMustAct() && assign && !UI.busy, free = G.tasks.filter(t => t.owner < 0).length;
    const pw = Math.max(120, geo.pr - geo.pl);
    pool.style.left = geo.pl + 'px'; pool.style.right = 'auto'; pool.style.width = pw + 'px'; pool.style.top = geo.top + 'px'; pool.style.height = geo.zoneH + 'px';
    const cols = free <= 1 ? 1 : (pw < 260 ? 2 : (free <= 4 ? 2 : 3)), tw = Math.max(86, Math.min(150, Math.floor((pw - 4 - 8 * (cols - 1)) / cols)));
    G.tasks.forEach((t, i) => {
      if (t.owner >= 0) return; const d = TASKS[t.id], can = mineTurn && mv.some(m => m.t === 'take' && m.i === i);
      const c = h('button.jcard' + (can ? '.glow' : (mineTurn && mv.some(m => m.t === 'take') ? '.no' : '.off')), { type: 'button', 'data-a': 'pool', 'data-i': i, 'data-key': 'job' + i, style: 'width:' + tw + 'px', 'aria-label': d.s + ', difficulty ' + jobDiff(i) + (can ? '' : ', not available') });
      const dd = h('span.dd', ...Array.from({ length: jobDiff(i) }, () => h('i')));
      c.append(h('b', d.s), dd);
      if (!d.cap) c.append(h('span.nocap', { title: 'Not for the Commander', html: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5" fill="none" stroke-width="2.4"/><path d="M6 6L18 18" stroke-width="2.4"/></svg>' }));
      pool.append(c);
    });
    return renderLead(lead, pile, v);
  }
  const n = G.np, shown = playsShown(), act = G.phase === 'play' && G.trick && !UI.fz ? G.trick.turn : -1;
  const winS = UI.fz && UI.fz.winner != null && UI.fz.win ? UI.fz.winner : -1;
  felt.style.setProperty('--cw', geo.cw + 'px');
  for (let rel = 0; rel < n; rel++) {
    const s = (from + rel) % n, [x, y] = geo.slots[rel];
    const slot = h('div.tslot' + (act === s ? '.turn' : '') + (winS === s ? '.winner' : ''), { 'data-seat': s, style: 'left:' + x + 'px;top:' + y + 'px;width:' + geo.cw + 'px;height:' + geo.ch + 'px' });
    const pl = shown.find(p => p.s === s);
    if (pl) { const tc = h('div.tc', { 'data-px': 'card', 'data-id': pl.c, 'data-pk': 't:' + pl.c, 'data-seat': s, role: 'img', 'aria-label': pname(s) + ' played ' + cname(pl.c) }); tc.append(cardN(pl.c, 80)); slot.append(tc); }
    if (winS === s) { const lan = UI.fz.plays.some(p => p.s === s && suitOf(p.c) === 4); slot.append(h('span.wtag', pname(s) === 'You' ? 'You win!' : pname(s) + ' wins', lan ? h('i', '★') : null)); }
    slots.append(slot);
  }
  renderLead(lead, pile, v);
}
function renderLead(lead, pile, v) {
  const geo = UI.geo;
  lead.style.left = (geo ? geo.cx : 0) + 'px'; lead.style.top = (geo ? geo.cy : 0) + 'px';
  if (G.phase === 'play' && G.trick && G.trick.plays.length) { const ls = G.trick.ls; lead.append(h('span', { html: KIT.emblemSVG(ls, 26) }), h('span', ls === 4 ? 'Lanterns' : D.suits[ls].name)); lead.classList.add('on'); }
  else lead.classList.remove('on');
  if (G.tricks.length) pile.append(h('button.pbtn', { type: 'button', 'data-a': 'last', 'aria-label': 'Last trick' }, h('span', { html: KIT.iconSVG('book', 20) }), h('span', 'Last')));
}
// ---- my seat and my jobs ----
function renderMine(v) {
  const box = $('#mine'); box.innerHTML = ''; if (!G) return;
  const s = v >= 0 ? v : 0, p = G.players[s], act = (G.phase === 'play' && G.trick ? G.trick.turn : actorSeat()), cm = s === G.cap, mk = seatMarks();
  const me = h('button.me' + (act === s ? '.act' : '') + (mk.vote.has(s) ? '.glow' : '') + (mk.pend.has(s) ? '.pend' : '') + (mk.ready.has(s) && G.phase === 'pass' ? '.rdy' : ''), { type: 'button', 'data-a': 'seat', 'data-seat': s, 'aria-label': 'Your seat' });
  const av = h('span.av', { html: avatarS(s, 80), 'data-key': 'seat' + s }); if (cm) av.append(h('span.cm', { html: KIT.cmdSVG({ size: 18 }) }));
  me.append(av, h('span.who', h('span.nm', v >= 0 && (UI.mode !== 'hot' && !NET.on) ? 'You' : p.name), h('span.bdgs', h('span.bdg.t', { html: TRICK_ICO + '<b>' + tricksWon()[s] + '</b>', title: tricksWon()[s] + ' tricks won' }))));
  box.append(me);
  const t = pingTok(s, 30); if (t) box.append(t);
  if (G.comm === 'narc') box.append(h('span.pbtn.pool', { html: KIT.pingSVG({ size: 22 }) + '<b>' + G.pool + '</b>' }));
  const mj = h('div.mjobs'); const js = jobs(s);
  js.forEach(i => mj.append(jobChip(i, { me: true })));
  if (G.two && G.cap === s) { const hj = jobs(G.helper); hj.forEach(i => { const c = jobChip(i, { me: true }); c.prepend(h('span.dnl', { html: KIT.droneSVG({ size: 16 }) })); mj.append(c); }); }
  box.append(mj);
}
// ---- my hand ----
function legalCards(v) {
  if (v < 0 || !G || UI.busy) return null;
  const ph = G.phase;
  if (ph === 'play' && G.trick && ctlSeat(G.trick.turn) === v && !UI.pingSel) { const own = !G.players[G.trick.turn].helper; const t1 = tutOnly(); if (own && t1 >= 0) return new Set([t1]); return own ? new Set(LD.playable(G, G.trick.turn)) : new Set(); }
  if (UI.pingSel) return new Set(LD.pingMoves(G, v).map(m => m.c));
  if (ph === 'pass' && LD.moves(G, v).length) return new Set(LD.moves(G, v).map(m => m.c));
  return null;
}
const ctlSeat = s => G.players[s].helper ? G.cap : s;
// the cards of my hand that carry a ping spot right now (a signal round, or between tricks when it is my turn to lead)
function pingSpots(v) {
  const m = new Map(); if (v < 0 || !G || UI.busy || UI.mode === 'guided' || G.phase === 'over' || !iMustAct()) return m;
  if (G.phase === 'signal' || (G.phase === 'play' && G.trick && G.trick.plays.length === 0)) myMoves().forEach(x => { if (x.t === 'ping') m.set(x.c, x.k); });
  return m;
}
function renderHand(v) {
  const box = $('#hand'); box.innerHTML = ''; box.style.height = ''; box.style.minHeight = ''; box.classList.remove('two'); if (!G) return;
  if (v < 0 || (hotSeat() && UI.holder < 0)) { box.append(h('div.handnote', G.phase === 'over' ? '' : (watching() ? 'Watching the divers.' : 'Take the device.'))); return; }
  const hand = G.players[v].hand; if (!hand.length) { box.append(h('div.handnote', '')); return; }
  const legal = legalCards(v), pinged = new Set(G.pings.filter(p => p.seat === v && !G.pl[p.c]).map(p => p.c)); const pk = new Map(G.pings.filter(p => p.seat === v).map(p => [p.c, p.k]));
  const spots = pingSpots(v);
  // the card(s) that came to me in the distress pass: the difference between my hand while passing and my hand afterwards
  if (G.phase === 'pass') UI.passSnap = { key: G.seed + ':' + G.att + ':' + v, hand: hand.slice() };
  let got = new Set(); if (UI.passSnap && UI.passSnap.key === G.seed + ':' + G.att + ':' + v && G.phase !== 'pass' && G.phase !== 'assign' && G.phase !== 'distress' && !G.tricks.length && !(G.trick && G.trick.plays.some(p => p.s === v))) got = new Set(hand.filter(c => !UI.passSnap.hand.includes(c)));
  const btns = [];
  hand.forEach((c, i) => {
    const dim = legal && !legal.has(c), glow = legal && legal.has(c);
    const cls = 'hc' + (UI.sel === c ? '.sel' : '') + (dim ? '.dim' : '') + (glow ? '.glow' : '') + (pinged.has(c) ? '.pinged' : '') + (UI.pingSel && glow ? '.pk' : '') + (UI.giveSel === c ? '.sel' : '') + (got.has(c) ? '.got' : '');
    const b = h('button.' + cls.split('.').filter(Boolean).join('.'), { type: 'button', 'data-a': 'hcard', 'data-id': c, 'data-px': 'card', 'data-pk': 'h:' + c, 'aria-label': cname(c) + (dim ? ', not allowed now' : '') + (pinged.has(c) ? ', shown to the team' : '') + (got.has(c) ? ', you got this card in the flare pass' : ''), 'aria-pressed': UI.sel === c ? 'true' : 'false' });
    b.append(cardN(c, 84));
    if (pinged.has(c)) b.append(h('span.rm', { html: KIT.pingSVG({ size: 26, k: pk.get(c) }), title: 'You showed this card' }));
    if (spots.has(c)) b.append(h('span.pspot', { 'data-a': 'pingc', 'data-id': c, role: 'button', 'aria-label': 'Show ' + cname(c) + ' to the team', html: KIT.pingSVG({ size: 30, k: spots.get(c) }) }));
    if (got.has(c)) b.append(h('span.gotb', 'New'));
    btns.push(b);
  });
  // Layout (absolute): one row when every card keeps >= 44 px (and >= 55 % of its width) visible, else two rows. A tap in the middle of a card always lands on that card.
  const hw = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hw')) || 60, W = Math.max(200, box.clientWidth - 12), n = hand.length, ch = hw * 1.4;
  const short = document.documentElement.classList.contains('ph-short') || (box.parentNode.parentNode.classList.contains('side')), need = short ? 32 : Math.max(44, hw * .55), maxP = hw * 1.04;
  const pitchFor = m => m > 1 ? Math.min(maxP, (W - hw) / (m - 1)) : 0;
  const rows = n > 1 && pitchFor(n) < need && n >= 7 ? 2 : 1, per = rows === 2 ? Math.ceil(n / 2) : n, pitch = pitchFor(per);
  const rowStep = Math.round(ch * .64), padTop = document.documentElement.classList.contains('ph-short') ? 14 : 20;
  box.classList.toggle('two', rows === 2); box.style.setProperty('--rs', rowStep + 'px');
  box.style.height = Math.round(padTop + ch + (rows === 2 ? rowStep : 0) + 4) + 'px'; box.style.minHeight = box.style.height;
  btns.forEach((b, i) => {
    const r = rows === 2 && i >= per ? 1 : 0, k = r ? i - per : i, m = r ? n - per : per;
    const rowW = hw + (m - 1) * pitch, x = Math.round((box.clientWidth - rowW) / 2 + k * pitch), y = padTop + r * rowStep;
    if (r) b.classList.add('r2'); b.style.left = x + 'px'; b.style.top = y + 'px'; b.style.zIndex = String(1 + i); box.append(b);
  });
  box.dataset.rows = rows; box.dataset.pitch = Math.round(pitch);
  if (UI.sel >= 0) { const sb = box.querySelector('.hc.sel'); if (sb) sb.style.zIndex = '40'; }
}
// ---- what to do now: one short line (8 words or fewer) and, for real yes/no decisions only, a few buttons ----
function actModel(v) {
  const ph = G.phase, mv = v >= 0 ? LD.moves(G, v) : [], must = iMustAct(), M = { p: '', acts: [], cls: '', warn: 0 };
  const act = actorSeat(), who = act >= 0 ? pname(act) : '';
  const btn = (label, a, o) => M.acts.push(Object.assign({ label, a }, o || {}));
  if (!G) return M;
  if (ph === 'over') { M.p = G.result && G.result.ok ? 'Dive complete!' : 'The dive failed.'; btn('Result', 'result'); return M; }
  if (hotSeat() && UI.holder < 0 && ph !== 'distress') { M.p = 'Pass the device on.'; return M; }
  switch (ph) {
    case 'assign': {
      const A = G.as;
      if (A.mode === 'vote') { M.cls = must && mv.length ? 'mine' : ''; M.p = must && mv.length ? 'Tap who takes every job.' : 'Waiting for the votes…'; return M; }
      if (!must || !mv.length) { M.p = who ? who + (A.mode === 'cmd' && A.stage === 'ask' ? ' decides…' : ' is choosing…') : 'Handing out the jobs…'; return M; }
      M.cls = 'mine';
      if (A.mode === 'cmd') {
        if (A.stage === 'keep') { M.p = 'Keep every job, or offer?'; if (mv.some(m => m.t === 'keep')) btn('Keep every job', 'keep', { cls: 'go' }); btn('Offer them', 'offer'); }
        else { M.p = 'Take every job?'; btn('Yes', 'accept', { cls: 'go' }); btn('No', 'decline', { cls: 'alt' }); }
        return M;
      }
      if (A.mode === 'vol') { M.p = A.need === 1 ? 'Take every job? Yes or no.' : 'Volunteer with a partner?'; btn('Yes', 'yes', { cls: 'go' }); if (mv.some(m => m.t === 'no')) btn('No', 'no', { cls: 'alt' }); return M; }
      if (A.mode === 'free') M.p = 'Take your jobs, then Done.';
      else if (A.mode === 'hardfirst') M.p = 'Take the hardest job first.';
      else if (A.mode === 'split') M.p = 'Share the jobs fairly.';
      else M.p = G.players[act] && G.players[act].helper ? 'Tap a job for the drone.' : 'Tap a job to take it.';
      if (mv.some(m => m.t === 'pass')) btn('Pass', 'pass', { cls: 'alt' });
      if (mv.some(m => m.t === 'done')) btn('Done', 'done', { cls: 'go' });
      return M;
    }
    case 'distress': {
      if (!must) { M.p = who === 'You' ? 'Decide about the flare…' : who + ' decides on the flare…'; return M; }
      M.cls = 'mine'; const lit = G.distress;
      M.p = lit ? 'Pass cards again?' : 'Light the distress flare?';
      btn(lit ? 'No passing' : 'No flare', 'dist', { on: false, cls: 'alt' });
      const two = G.hn === 2; if (two) btn(lit ? 'Pass a card' : 'Light it', 'dist', { on: true, dir: 1, cls: 'alt' });
      else { btn('Pass left', 'dist', { on: true, dir: 1, cls: 'alt' }); btn('Pass right', 'dist', { on: true, dir: -1, cls: 'alt' }); }
      return M;
    }
    case 'pass': {
      if (!must || !mv.length) { M.p = 'Waiting for the others…'; return M; }
      M.cls = 'mine'; M.p = 'Tap a card to pass it.'; return M;
    }
    case 'predict': {
      if (!must || !mv.length) { M.p = who + ' is predicting…'; return M; }
      M.cls = 'mine'; const o = G.tasks[mv[0].i]; M.p = G.players[o.owner].helper ? 'How many tricks for the drone?' : 'How many tricks will you win?';
      mv.forEach(m => btn(String(m.n), 'predict', { n: m.n, i: m.i, cls: UI.predN === m.n ? 'go' : 'alt' })); return M;
    }
    case 'signal': {
      if (!must) { M.p = who + ' may signal…'; return M; }
      M.cls = 'mine'; const pm = mv.filter(m => m.t === 'ping');
      M.p = pm.length ? 'Tap a ping spot, or skip.' : 'Nothing to signal.';
      btn('No signal', 'nosig', { cls: pm.length ? 'alt' : 'go' });
      return M;
    }
    case 'play': {
      const T = G.trick, turn = T.turn, helper = G.players[turn].helper, ctl2 = ctlSeat(turn);
      const myTurn = v >= 0 && ctl2 === v;
      if (myTurn) {
        M.cls = 'mine';
        M.p = helper ? 'Tap a drone card.' : (T.plays.length ? 'Your turn: play a card.' : 'You lead: play a card.');
        { const k = G.seed + ':' + G.logN + ':' + G.att + ':' + G.tricks.length + ':' + T.plays.length + ':' + v; if (UI.abk !== k) { UI.abk = k; let r = null; try { r = LD.AI.allBreak(G, v); } catch (e) { } UI.ab = r; }
          if (UI.ab) { M.p = 'Every card breaks a ' + (UI.ab.job >= 0 ? 'job.' : 'rule.'); M.warn = 1; } }
      } else M.p = who ? who + (G.players[turn].ai ? ' is thinking…' : ' to play.') : '';
      return M;
    }
  }
  return M;
}
function renderActs(v) {
  const pr = $('#prompt'), ac = $('#acts'); if (!pr || !ac) return;
  const M = actModel(v); pr.className = (M.cls || '') + (M.warn ? ' warn' : '');
  pr.textContent = M.p || '';
  const tr = $('#table'); if (tr) tr.classList.toggle('myturn', M.cls === 'mine');
  { const pl = $('#pile'); ac.classList.toggle('wide', !(G.phase === 'play' && iMustAct() && !UI.busy && UI.mode !== 'guided') && !(pl && pl.childNodes.length)); }
  ac.classList.toggle('many', M.acts.length > 5); ac.innerHTML = '';
  M.acts.forEach(a => { const b = h('button.btn' + (a.cls ? '.' + a.cls : '') + (a.dis ? '.dis' : ''), { type: 'button', 'data-a': a.a, disabled: a.dis ? true : null }, a.label); for (const k of ['c', 'i', 'n', 'f', 'on', 'dir']) if (a[k] !== undefined) b.dataset[k] = a[k]; ac.append(b); });
}
function renderTip() { }   // no tip cards: play happens on the table
function render() {
  if (!G || !UI.started) return;
  layoutVars();
  const v = viewSeat();
  renderBar(); renderMine(v); renderHand(v);
  UI.geo = tableGeo(); if (UI.geo) { const r = document.documentElement.style; r.setProperty('--cw', UI.geo.cw + 'px'); r.setProperty('--dw', UI.geo.dw + 'px'); r.setProperty('--av', UI.geo.av + 'px'); r.setProperty('--seatw', UI.geo.seatW + 'px'); r.setProperty('--ch', UI.geo.ch + 'px'); }
  renderOpp(v); renderFelt(v); try { bossBar(); } catch (e) { console.error(e); }
  renderActs(v);
  try { placeFinger(); } catch (e) { console.error(e); }
  try { hlpAfter(); } catch (e) { console.error(e); }
  try { netRenderHook(); } catch (e) { }
  try { pxDirty(); } catch (e) { }
}
