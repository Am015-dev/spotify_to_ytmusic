// ===================== part 2: render (bar, other divers, felt, my seat, hand, dock) =====================
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
// ---- sizes: hand card width, trick card width, drone card width, portrait size (CSS variables) ----
function layoutVars() {
  const bd = $('#bd'); if (!bd) return; const W = bd.clientWidth || 360, H = bd.clientHeight || 600, ph = isPh(), land = ph && innerWidth > innerHeight;
  let hw = ph ? (land ? Math.max(44, Math.min(48, Math.round(H * .13))) : Math.max(48, Math.min(60, Math.round(H * .092)))) : Math.max(60, Math.min(104, Math.round(H * .125)));
  const np = G ? G.np : 4, opp = np - 1;
  let cw = ph ? Math.max(40, Math.min(56, Math.round(hw * .95))) : Math.max(60, Math.min(124, Math.round(Math.min(H * .165, W * .1))));
  const dw = ph ? Math.max(40, Math.min(46, Math.floor((W - 16) / 7) - 4)) : Math.max(46, Math.min(60, Math.floor((W - 40) / 7) - 6));
  const short = ph && !land && innerHeight < 640; document.documentElement.classList.toggle('ph-short', short); if (short) hw = 44;
  const av = ph ? (land || short ? 30 : 34) : 44;
  const r = document.documentElement.style; r.setProperty('--hw', hw + 'px'); r.setProperty('--cw', cw + 'px'); r.setProperty('--dw', dw + 'px'); r.setProperty('--av', av + 'px');
  if (KIT.ART.table && !document.documentElement.style.getPropertyValue('--tableimg')) r.setProperty('--tableimg', 'url("' + KIT.ART.table + '")');
}
// ---- the bar ----
function renderBar() {
  const bs = $('#barstat'); if (!bs) return; bs.innerHTML = '';
  if (G && UI.started) {
    bs.append(h('span', diveLabel() + ' · attempt ' + G.att));
    if (G.distress) bs.append(h('span', { html: KIT.flareSVG({ size: 20, on: true }), title: 'Distress flare is lit' }));
    if (G.clock) { const t = h('span.tm' + (UI.clockLeft != null && UI.clockLeft < 20 ? '.low' : ''), clockText()); t.id = 'clk'; bs.append(t); }
  }
  placePrompt(); placePile();
}
function clockText() { const s = Math.max(0, Math.round(UI.clockLeft != null ? UI.clockLeft : (G ? G.clock : 0))); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
function placePrompt() {
  const bp = $('#barprompt'), pr = $('#prompt'); if (!bp || !pr) return;
  if (document.documentElement.classList.contains('ph-p')) { if (pr.parentNode !== bp) bp.appendChild(pr); } else { const pd = $('#promptDock'); if (pd && pr.parentNode !== pd) pd.appendChild(pr); }
}
// Last trick / Won buttons and the "Follow ..." line live in the felt's bottom strip; on a landscape phone they move into the dock so they can never cover a card
function placePile() {
  const pile = $('#pile'), lead = $('#lead'), felt = $('#felt'), dp = $('#dockpile'); if (!pile || !lead || !felt || !dp) return;
  const into = document.documentElement.classList.contains('ph-l') ? dp : felt;
  if (pile.parentNode !== into) { into.appendChild(lead); into.appendChild(pile); }
}
// ---- job chips ----
function jobChip(i, o) {
  o = o || {}; const st = jobSt(i), d = jobDef(i);
  // chips on another diver's panel are plain text (the panel itself is the tap target and opens that diver's jobs); only your own chips are buttons
  const cls = '.jc' + (st > 0 ? '.ok' : st < 0 ? '.bad' : '') + (o.me ? '.me' : '') + (o.opp ? '.opp' : '');
  const b = o.opp ? h('span' + cls, { 'aria-label': jobShort(i) + (st > 0 ? ', done' : st < 0 ? ', failed' : ', open') }) : h('button' + cls, { type: 'button', 'data-a': 'job', 'data-i': i, 'aria-label': jobShort(i) + (st > 0 ? ', done' : st < 0 ? ', failed' : ', open') });
  const sm = h('span.sm'); if (st > 0) sm.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5L9.5 18L20 6"/></svg>'; else if (st < 0) sm.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke-linecap="round"><path d="M6 6L18 18M18 6L6 18"/></svg>'; else sm.innerHTML = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3.4" fill="#fff" stroke="none"/></svg>';
  b.append(sm, h('span.t', d.s));
  if (o.me) { const df = h('span.df'); for (let k = 0; k < jobDiff(i); k++) df.append(h('i')); b.append(df); }
  return b;
}
// ---- the other divers (and the drone) ----
function pingTok(s, size) {
  const p = G.players[s]; if (p.helper) return null;
  if (G.comm === 'none') return h('span.tok', { html: KIT.pingSVG({ size, spent: true }), title: 'No signalling in this dive' });
  if (G.comm === 'narc') return null;
  return h('span.tok', { html: KIT.pingSVG({ size, spent: !!p.pingUsed }), title: p.pingUsed ? 'Ping used' : 'Ping ready' });
}
function shownEl(s) {
  const sh = shownBy(s); if (!sh.length) return null;
  if (document.documentElement.classList.contains('ph-short')) {   // small phones: a colour pill ("3 low") instead of a mini card
    const w = h('span.shownw', { style: 'display:flex;gap:3px' });
    sh.slice(0, 2).forEach(p => w.append(h('span.spill', { style: 'background:' + D.suits[suitOf(p.c)].c + ';color:' + (suitOf(p.c) === 3 || suitOf(p.c) === 4 ? '#1b1405' : '#fff'), title: cname(p.c) }, String(valOf(p.c)) + (p.k === 'high' ? '\u25B2' : p.k === 'low' ? '\u25BD' : p.k === 'only' ? '\u25CF' : ''))));
    return w;
  }
  const wrap = h('span.shownw', { style: 'display:flex;gap:3px' });
  sh.slice(0, 3).forEach(p => { const e = h('span.shown', { title: cname(p.c) + (p.k === 'high' ? ' (their highest)' : p.k === 'low' ? ' (their lowest)' : p.k === 'only' ? ' (their only one)' : '') }); e.append(cardN(p.c, 30)); if (p.k) e.append(h('span.mk', { html: KIT.pingSVG({ size: 19, k: p.k }) })); wrap.append(e); });
  return wrap;
}
function oppEl(s, act) {
  const p = G.players[s], won = tricksWon()[s], cm = s === G.cap;
  if (p.helper) return droneEl(s, act);
  const b = h('button.op' + (act === s ? '.act' : ''), { type: 'button', 'data-a': 'seat', 'data-seat': s, 'data-key': 'seat' + s, 'aria-label': p.name + (cm ? ', Commander' : '') + ', ' + p.hand.length + ' cards' });
  const av = h('span.av', { html: avatarS(s, 80) }); if (cm) av.append(h('span.cm', { html: KIT.cmdSVG({ size: 19 }), title: 'Commander' }));
  const top = h('span.top', av, h('span.who', h('span.nm', p.name), h('span.cnt', h('span', h('b', p.hand.length), p.hand.length === 1 ? ' card' : ' cards'), h('span', h('b', won), won === 1 ? ' trick' : ' tricks'))));
  b.append(top);
  const pg = h('span.pg'); const t = pingTok(s, 22); if (t) pg.append(t); const sh = shownEl(s); if (sh) pg.append(sh);
  if (pg.childNodes.length) b.append(pg);
  const js = jobs(s); const jb = h('span.jobs');
  const shown = js.slice(0, 2); shown.forEach(i => jb.append(jobChip(i, { opp: 1 }))); if (js.length > 2) jb.append(h('span.jc.more', '+' + (js.length - 2) + ' more'));
  b.append(jb);
  return b;
}
function droneEl(s, act) {
  const p = G.players[s], v = viewSeat();
  const b = h('div.op.drone' + (act === s ? '.act' : ''), { 'data-seat': s, 'data-key': 'seat' + s });
  const av = h('span.av', { html: avatarS(s, 80) });
  const top = h('span.top', av, h('span.who', h('span.nm', p.name + ' (drone)'), h('span.cnt', h('span', h('b', p.hand.length), ' cards'), h('span', h('b', tricksWon()[s]), tricksWon()[s] === 1 ? ' trick' : ' tricks'))));
  const js = jobs(s); const jb = h('span.jobs', { style: 'flex:1;min-width:0;flex-direction:row;flex-wrap:wrap;gap:3px;margin-left:6px' });
  js.slice(0, 3).forEach(i => { const c = jobChip(i); c.style.width = 'auto'; jb.append(c); }); if (js.length > 3) jb.append(h('span.jc.more', '+' + (js.length - 3)));
  const head = h('div', { style: 'display:flex;align-items:center;gap:4px' }, h('button.op', { type: 'button', 'data-a': 'seat', 'data-seat': s, style: 'flex:0 0 auto;max-width:none;background:transparent;border-color:transparent;padding:0', 'aria-label': 'Drone ' + p.name }, top), jb);
  b.append(head);
  const row = h('div.drow');
  const myTurn = G.phase === 'play' && G.trick.turn === s && G.cap === v && !UI.fz;
  const legal = myTurn ? LD.playable(G, s) : [];
  (p.stacks || []).forEach(st => {
    const top2 = st[0], hasBot = st[1] !== -1;
    const w = h('div.dstack', h('div.dbk' + (hasBot ? '' : '.none')));
    if (top2 >= 0) {
      const can = legal.includes(top2);
      const c = h('button.dc' + (can ? '.can' : (myTurn ? '.dim' : '')) + (UI.sel === top2 ? '.sel' : ''), { type: 'button', 'data-a': 'dcard', 'data-id': top2, 'data-px': 'card', 'data-pk': 'h:' + top2, 'aria-label': cname(top2) + (can ? ', playable' : '') });
      c.append(cardN(top2, 46)); w.append(c);
    }
    row.append(w);
  });
  b.append(row); return b;
}
function renderOpp(v) {
  const box = $('#opp'); box.innerHTML = ''; if (!G) return;
  box.style.setProperty('--jr', String(Math.min(2, Math.max(1, Math.ceil(G.tasks.length / Math.max(1, G.np))))));
  const act = G.phase === 'play' && G.trick ? G.trick.turn : actorSeat();
  const from = v >= 0 ? v : 0;
  for (const s of seatsClockwise(from)) box.append(oppEl(s, act));
}
// ---- the felt: trick slots, the pool of jobs, status lines ----
function slotPos(rel, n, W, H, ch) {
  // rel 0 = the bottom seat (me); seats go clockwise (to the left first). Returns centre in px.
  const th = rel * 2 * Math.PI / n, rx = Math.max(40, W * (n > 4 ? .36 : .31)), ry = Math.max(20, Math.min(H * .27, ch ? (H - ch) / 2 : 999));
  return [W / 2 - Math.sin(th) * rx, H / 2 + (n > 2 ? Math.cos(th) * ry : Math.cos(th) * ry)];
}
function playsShown() { if (UI.fz && UI.fz.plays) return UI.fz.plays; return G && G.phase === 'play' && G.trick ? G.trick.plays : (G && G.phase === 'over' && G.trick ? G.trick.plays : []); }
function renderFelt(v) {
  const felt = $('#felt'), slots = $('#slots'), pool = $('#pool'), txt = $('#felttxt'), lead = $('#lead'), pile = $('#pile'); if (!felt) return;
  slots.innerHTML = ''; pool.innerHTML = ''; lead.innerHTML = ''; pile.innerHTML = '';
  const from = v >= 0 ? v : 0;
  const assign = G.phase === 'assign' || (G.phase === 'distress' && false);
  pool.hidden = !assign || !G.tasks.some(t => t.owner < 0); slots.hidden = assign && !pool.hidden;
  // status line
  let line = '';
  if (assign) { const n = G.tasks.filter(t => t.owner < 0).length; line = n + ' job' + (n === 1 ? '' : 's') + ' left to hand out · every job must be done'; }
  else if (G.phase === 'play' || G.phase === 'signal') { const nd = G.tasks.filter((t, i) => jobSt(i) > 0).length; line = 'Trick ' + Math.min(G.ntr, G.tricks.length + 1) + ' of ' + G.ntr + ' · jobs done ' + nd + ' of ' + G.tasks.length + (G.phase === 'signal' ? ' · signal round' : ''); }
  else if (G.phase === 'distress') line = 'The jobs are taken. Before the dive: the distress flare';
  else if (G.phase === 'pass') line = 'Everyone passes one card';
  else if (G.phase === 'predict') line = 'Predictions';
  else if (G.phase === 'over') line = G.result && G.result.ok ? 'Dive complete' : 'Dive failed';
  txt.textContent = line;
  if (!pool.hidden) {
    G.tasks.forEach((t, i) => {
      if (t.owner >= 0) return; const d = TASKS[t.id], mineTurn = iMustAct() && G.phase === 'assign';
      const c = h('button.jcard' + (UI.job === i ? '.sel' : '') + (mineTurn ? '' : '.off'), { type: 'button', 'data-a': 'pool', 'data-i': i, 'data-key': 'job' + i, 'aria-pressed': UI.job === i ? 'true' : 'false' });
      const dd = h('span.dd', { title: 'How hard the job is (dots). The jobs on the table add up to the dive\'s difficulty.' }, 'Difficulty ', ...Array.from({ length: jobDiff(i) }, () => h('i')));
      c.append(h('b', d.s), h('span', d.t), dd);
      if (!d.cap) c.append(h('span', { style: 'font-weight:800;color:#8a3a10' }, 'Not for the Commander'));
      pool.append(c);
    });
    return renderLead(lead, pile, v);
  }
  const W = felt.clientWidth || 300, H = felt.clientHeight || 160, n = G.np;
  const shown = playsShown(), act = G.phase === 'play' && G.trick && !UI.fz ? G.trick.turn : -1;
  const winS = UI.fz && UI.fz.winner != null && UI.fz.win ? UI.fz.winner : -1;
  const small = document.documentElement.classList.contains('ph-short'), strip = (isPh() && innerWidth > innerHeight) || small ? 0 : 46, top = small ? 26 : 20;   // small phones: Last trick sits in the felt's top corner, not in a bottom strip   // the bottom strip holds Last trick / Won (never over a played card)
  for (let rel = 0; rel < n; rel++) {
    const s = (from + rel) % n; const [x, y0] = slotPos(rel, n, W, Math.max(60, H - strip - top), (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--cw')) || 56) * 1.4 + 4), y = y0 + top;
    const slot = h('div.tslot' + (act === s ? '.turn' : '') + (winS === s ? '.win' : ''), { 'data-seat': s, style: 'left:' + x + 'px;top:' + y + 'px' });
    const pl = shown.find(p => p.s === s);
    if (pl) { const tc = h('div.tc', { 'data-px': 'card', 'data-id': pl.c, 'data-pk': 't:' + pl.c, 'data-seat': s, role: 'img', 'aria-label': pname(s) + ' played ' + cname(pl.c) }); tc.append(cardN(pl.c, 80)); slot.append(tc); }
    slots.append(slot);
  }
  renderLead(lead, pile, v);
}
function renderLead(lead, pile, v) {
  if (G.phase === 'play' && G.trick && G.trick.plays.length) { const ls = G.trick.ls; lead.append(h('span', { html: KIT.emblemSVG(ls, 22) }), h('span', ls === 4 ? 'Lanterns led: follow with a Lantern' : 'Follow ' + D.suits[ls].name)); }
  else if (G.phase === 'play' && G.trick) { lead.append(h('span', pname(G.trick.turn) === 'You' ? 'You lead' : pname(G.trick.turn) + ' leads')); }
  if (G.tricks.length) pile.append(h('button.pbtn', { type: 'button', 'data-a': 'last' }, 'Last trick'));
}
// ---- my seat and my jobs ----
function renderMine(v) {
  const box = $('#mine'); box.innerHTML = ''; if (!G) return;
  const s = v >= 0 ? v : 0, p = G.players[s], act = (G.phase === 'play' && G.trick ? G.trick.turn : actorSeat()), cm = s === G.cap;
  const me = h('button.me' + (act === s ? '.act' : ''), { type: 'button', 'data-a': 'seat', 'data-seat': s, 'data-key': 'seat' + s, 'aria-label': 'Your seat' });
  const av = h('span.av', { html: avatarS(s, 80) }); if (cm) av.append(h('span.cm', { html: KIT.cmdSVG({ size: 18 }) }));
  me.append(av, h('span.who', h('span.nm', v >= 0 && (UI.mode !== 'hot' && !NET.on) ? 'You' : p.name), h('span.cnt', tricksWon()[s] + (tricksWon()[s] === 1 ? ' trick' : ' tricks'))));
  box.append(me);
  const t = pingTok(s, 30); if (t) box.append(t);
  if (G.comm === 'narc') box.append(h('span.pbtn', { style: 'cursor:default' }, 'Pool ' + G.pool));
  const mj = h('div.mjobs'); const js = jobs(s);
  if (!js.length && G.phase !== 'assign') mj.append(h('span.sm', 'No jobs for you: help the others.'));
  js.forEach(i => mj.append(jobChip(i, { me: true })));
  if (G.two && G.cap === s) { const hj = jobs(G.helper); hj.forEach(i => { const c = jobChip(i, { me: true }); c.prepend(h('span', { style: 'font-size:12px;opacity:.75' }, 'Drone:')); mj.append(c); }); }
  box.append(mj);
}
// ---- my hand ----
function legalCards(v) {
  if (v < 0 || !G || UI.busy) return null;
  const ph = G.phase;
  if (ph === 'play' && G.trick && ctlSeat(G.trick.turn) === v && !UI.pingSel) { const own = !G.players[G.trick.turn].helper; return own ? new Set(LD.playable(G, G.trick.turn)) : new Set(); }
  if (UI.pingSel) return new Set(LD.pingMoves(G, v).map(m => m.c));
  if (ph === 'pass' && LD.moves(G, v).length) return new Set(LD.moves(G, v).map(m => m.c));
  return null;
}
const ctlSeat = s => G.players[s].helper ? G.cap : s;
function renderHand(v) {
  const box = $('#hand'); box.innerHTML = ''; box.style.height = ''; box.style.minHeight = ''; box.classList.remove('two'); if (!G) return;
  if (v < 0 || (hotSeat() && UI.holder < 0)) { box.append(h('div.handnote', G.phase === 'over' ? 'The dive is over.' : (watching() ? 'Watching the computer divers.' : 'Waiting for the next diver to take the device.'))); return; }
  const hand = G.players[v].hand; if (!hand.length) { box.append(h('div.handnote', G.phase === 'over' ? '' : 'No cards left.')); return; }
  const legal = legalCards(v), pinged = new Set(G.pings.filter(p => p.seat === v && !G.pl[p.c]).map(p => p.c)); const pk = new Map(G.pings.filter(p => p.seat === v).map(p => [p.c, p.k]));
  // the card(s) that came to me in the distress pass: the difference between my hand while passing and my hand afterwards
  if (G.phase === 'pass') UI.passSnap = { key: G.seed + ':' + G.att + ':' + v, hand: hand.slice() };
  let got = new Set(); if (UI.passSnap && UI.passSnap.key === G.seed + ':' + G.att + ':' + v && G.phase !== 'pass' && G.phase !== 'assign' && G.phase !== 'distress' && !G.tricks.length && !(G.trick && G.trick.plays.some(p => p.s === v))) got = new Set(hand.filter(c => !UI.passSnap.hand.includes(c)));
  const btns = [];
  hand.forEach((c, i) => {
    const dim = legal && !legal.has(c);
    const cls = 'hc' + (UI.sel === c ? '.sel' : '') + (dim ? '.dim' : '') + (pinged.has(c) ? '.pinged' : '') + (UI.pingSel && legal && legal.has(c) ? '.pk' : '') + (UI.giveSel === c ? '.sel' : '') + (got.has(c) ? '.got' : '');
    const b = h('button.' + cls.split('.').filter(Boolean).join('.'), { type: 'button', 'data-a': 'hcard', 'data-id': c, 'data-px': 'card', 'data-pk': 'h:' + c, 'aria-label': cname(c) + (dim ? ', not allowed now' : '') + (pinged.has(c) ? ', shown to the team' : '') + (got.has(c) ? ', you got this card in the flare pass' : ''), 'aria-pressed': UI.sel === c ? 'true' : 'false' });
    b.append(cardN(c, 84));
    if (pinged.has(c)) b.append(h('span.rm', { html: KIT.pingSVG({ size: 26, k: pk.get(c) }), title: 'You showed this card' }));
    if (got.has(c)) b.append(h('span.gotb', 'New'));
    btns.push(b);
  });
  // Layout (absolute): one row when every card keeps >= 44 px (and >= 55 % of its width) visible, else two rows. A tap in the middle of a card always lands on that card.
  const hw = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hw')) || 60, W = Math.max(200, box.clientWidth - 12), n = hand.length, ch = hw * 1.4;
  const need = Math.max(44, hw * .55), maxP = hw * 1.04;
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
// ---- the dock: what to do now ----
function dockModel(v) {
  const ph = G.phase, mv = v >= 0 ? LD.moves(G, v) : [], must = iMustAct(), M = { p: '', sub: '', info: '', acts: [], cls: '' };
  const act = actorSeat(), who = act >= 0 ? pname(act) : '';
  const btn = (label, a, o) => M.acts.push(Object.assign({ label, a }, o || {}));
  if (!G) return M;
  if (ph === 'over') { M.p = G.result && G.result.ok ? 'Dive complete!' : 'The dive failed.'; M.sub = G.result ? G.result.why : ''; btn('Result', 'result'); return M; }
  if (UI.busy) { M.p = 'The cards move…'; return M; }
  if (hotSeat() && UI.holder < 0 && G.phase !== 'distress') { M.p = 'Pass the device on.'; return M; }
  switch (ph) {
    case 'assign': {
      const A = G.as; const left = G.tasks.filter(t => t.owner < 0).length;
      if (A.mode === 'vote') {
        if (must && mv.length) { M.p = 'Vote: which diver takes every job?'; M.sub = 'No talk about cards. A tie goes to the Commander\'s vote.'; M.cls = 'mine'; G.players.filter(p => !p.helper).forEach(p => btn(p.seat === v && p.name !== 'You' ? p.name + ' (you)' : p.name, 'vote', { f: p.seat })); }
        else { M.p = 'Waiting for the other votes…'; }
        return M;
      }
      if (!must || !mv.length) { M.p = who ? who + (A.mode === 'cmd' && A.stage === 'ask' ? ' is deciding whether to take every job…' : ' is choosing…') : 'Handing out the jobs…'; M.sub = left + ' job' + (left === 1 ? '' : 's') + ' left'; return M; }
      M.cls = 'mine';
      if (A.mode === 'cmd') {
        if (A.stage === 'keep') { M.p = 'Commander\'s call: keep every job, or offer them?'; M.sub = 'If you offer them, a willing diver takes all of them and all signalling happens before the first trick.'; if (mv.some(m => m.t === 'keep')) btn('Keep every job', 'keep', { cls: 'go' }); btn('Offer them to the team', 'offer'); }
        else { M.p = 'Will you take every job?'; btn('Yes, I take them', 'accept', { cls: 'go' }); btn('No', 'decline', { cls: 'alt' }); }
        return M;
      }
      if (A.mode === 'vol') { M.p = A.need === 1 ? 'Will you take every job? Answer yes or no only.' : 'Will you volunteer to take the jobs with another diver? Yes or no only.'; btn('Yes', 'yes', { cls: 'go' }); if (mv.some(m => m.t === 'no')) btn('No', 'no', { cls: 'alt' }); else M.sub = 'You are the last one: you have to say yes.'; return M; }
      if (A.mode === 'free') { M.p = 'Open briefing: take the jobs you want, then press Done.'; M.sub = 'Talk about jobs, never about cards.'; }
      else if (A.mode === 'hardfirst') { M.p = 'The Commander takes the most difficult job first.'; }
      else if (A.mode === 'split') { M.p = 'Share the jobs with your partner (at least one each).'; }
      else { M.p = act === v || (G.players[act] && G.players[act].helper) ? (G.players[act].helper ? 'Pick a job for the drone.' : 'Your turn: pick a job.') : 'Pick a job.'; M.sub = left + ' job' + (left === 1 ? '' : 's') + ' left. Tap a job card on the table.'; }
      const sel = UI.job >= 0 && G.tasks[UI.job] && G.tasks[UI.job].owner < 0 ? UI.job : -1;
      if (sel >= 0) { const ok = mv.find(m => m.t === 'take' && m.i === sel); M.info = '<b>' + esc(jobShort(sel)) + '</b>: ' + esc(jobText(sel)) + ' Difficulty ' + jobDiff(sel) + '.' + (ok ? '' : !TASKS[G.tasks[sel].id].cap && act === G.cap ? ' The Commander may not take this job.' : ' You cannot take this one.'); btn('Take this job', 'take', { i: sel, cls: 'go', dis: !ok }); }
      else if (mv.some(m => m.t === 'take')) btn('Take this job', 'take', { dis: true, cls: 'go' });
      if (mv.some(m => m.t === 'pass')) btn('Pass', 'pass', { cls: 'alt' });
      if (mv.some(m => m.t === 'done')) btn('Done', 'done', { cls: 'alt' });
      return M;
    }
    case 'distress': {
      if (!must) { M.p = (who === 'You' ? 'You' : 'The Commander, ' + who) + ' decides about the flare…'; M.sub = 'If it is lit, every diver passes one card. Nobody else has to choose yet.'; return M; }
      M.cls = 'mine'; const lit = G.distress;
      M.p = lit ? 'Pass cards again this attempt?' : 'Light the distress flare?'; M.sub = lit ? 'The flare stays lit until the dive is won.' : 'Every diver passes one card (not a Lantern). The dive then counts one extra attempt.';
      btn(lit ? 'No passing' : 'No flare', 'dist', { on: false, cls: 'alt' });
      M.eq = 1;
      const two = G.hn === 2; if (two) btn(lit ? 'Pass a card' : 'Light the flare', 'dist', { on: true, dir: 1, cls: 'alt' });
      else { btn('Pass left', 'dist', { on: true, dir: 1, cls: 'alt' }); btn('Pass right', 'dist', { on: true, dir: -1, cls: 'alt' }); }
      return M;
    }
    case 'pass': {
      if (!must || !mv.length) { M.p = 'Waiting for the others to pass a card…'; return M; }
      M.cls = 'mine'; const dir = G.pass.dir; M.p = 'Pick a card to pass ' + (G.hn === 2 ? 'to your partner.' : (dir > 0 ? 'to your left.' : 'to your right.')); M.sub = 'Lanterns cannot be passed.';
      const sel = UI.giveSel >= 0 && mv.some(m => m.c === UI.giveSel) ? UI.giveSel : -1;
      btn(sel >= 0 ? 'Pass ' + cname(sel) : 'Pass the card', 'give', { c: sel, dis: sel < 0, cls: 'go' }); return M;
    }
    case 'predict': {
      if (!must || !mv.length) { M.p = who + ' is predicting their tricks…'; return M; }
      M.cls = 'mine'; const o = G.tasks[mv[0].i], open = TASKS[o.id].open; M.p = (G.players[o.owner].helper ? 'Predict the drone\'s tricks' : 'How many tricks will you win?'); M.sub = open ? 'Everybody will see your number.' : 'Your number stays secret until the end.';
      mv.forEach(m => btn(String(m.n), 'predict', { n: m.n, i: m.i, cls: UI.predN === m.n ? 'go' : 'alt' })); return M;
    }
    case 'signal': {
      if (!must) { M.p = who + ' may signal…'; M.sub = 'Signal round: each diver can show a card or skip.'; return M; }
      M.cls = 'mine'; { const again = G.sig && G.pings.some(p => p.n === G.tricks.length && p.seat !== v); M.p = again ? 'Someone just signalled. Signal now, or skip again?' : 'Signal: show a card, or skip.'; M.sub = again ? 'The signal round goes on until everyone skips in a row.' : 'Show your highest, lowest or only card of a colour. Once per dive.'; }
      const pm = mv.filter(m => m.t === 'ping');
      if (UI.pingSel) { const sel = UI.sel >= 0 ? pm.find(m => m.c === UI.sel) : null; M.p = sel ? 'Show ' + cname(sel.c) + (sel.k === 'high' ? ' as your highest?' : sel.k === 'low' ? ' as your lowest?' : sel.k === 'only' ? ' as your only one?' : '?') : 'Tap the card you want to show.'; M.sub = 'The green-ringed cards can be shown.'; btn(sel ? 'Show it' : 'Show the card', 'doping', { dis: !sel, cls: 'go' }); btn('Cancel', 'noping', { cls: 'alt' }); }
      else { if (pm.length) btn('Signal…', 'signal', { cls: 'go' }); btn('No signal', 'nosig', { cls: pm.length ? 'alt' : 'go' }); }
      return M;
    }
    case 'play': {
      const T = G.trick, turn = T.turn, helper = G.players[turn].helper, ctl2 = ctlSeat(turn);
      const myTurn = v >= 0 && ctl2 === v;
      const pm = mv.filter(m => m.t === 'ping');
      if (UI.pingSel && pm.length) { const sel = UI.sel >= 0 ? pm.find(m => m.c === UI.sel) : null; M.cls = 'mine'; M.p = sel ? 'Show ' + cname(sel.c) + (sel.k === 'high' ? ' as your highest?' : sel.k === 'low' ? ' as your lowest?' : sel.k === 'only' ? ' as your only one?' : '?') : 'Tap the card you want to show.'; M.sub = 'Signals happen between tricks. The green-ringed cards can be shown.'; btn(sel ? 'Show it' : 'Show the card', 'doping', { dis: !sel, cls: 'go' }); btn('Cancel', 'noping', { cls: 'alt' }); return M; }
      if (myTurn) {
        M.cls = 'mine';
        const sel = UI.sel >= 0 ? UI.sel : -1; const legal = helper ? new Set(LD.playable(G, turn)) : new Set(LD.playable(G, turn));
        M.p = helper ? 'You fly ' + pname(turn) + ': tap one of its face-up cards.' : (T.plays.length ? 'Your turn: play a card.' : 'You lead: play any card.');
        M.sub = T.plays.length ? (T.ls === 4 ? 'Follow with a Lantern if you can.' : 'Follow ' + D.suits[T.ls].name + ' if you can. With no ' + D.suits[T.ls].name + ' left you may play anything, and a Lantern would win.') : '';
        { const k = G.seed + ':' + G.logN + ':' + G.att + ':' + G.tricks.length + ':' + T.plays.length + ':' + v; if (UI.abk !== k) { UI.abk = k; let r = null; try { r = LD.AI.allBreak(G, v); } catch (e) { } UI.ab = r; }
          if (UI.ab) { const j = UI.ab.job; M.p = 'Careful: every card you can play breaks ' + (j >= 0 ? 'a job.' : 'the dive rule.'); M.sub = j >= 0 ? 'Whatever you play, \u201c' + TASKS[G.tasks[j].id].t.replace(/\.$/, '') + '\u201d will fail. Try Hint to see the least bad card.' : 'Whatever you play, the dive rule is broken.'; M.warn = 1; } }
        if (UI.hint && UI.hint.c != null) M.info = '<b>Suggestion: ' + esc(cname(UI.hint.c)) + '.</b> ' + esc(UI.hint.why || '');
        btn(sel >= 0 && legal.has(sel) ? 'Play ' + cname(sel) : 'Play the card', 'playcard', { c: sel, dis: !(sel >= 0 && legal.has(sel)), cls: 'go' });
        if (pm.length) btn('Signal…', 'signal', { cls: 'alt' });
        btn('Hint', 'hint', { cls: 'alt' });
      } else {
        M.p = who ? who + (G.players[turn].ai ? ' is thinking…' : ' to play.') : ''; M.sub = T.plays.length ? 'Following ' + (T.ls === 4 ? 'Lanterns' : D.suits[T.ls].name) + '.' : '';
        if (pm.length) btn('Signal…', 'signal', { cls: 'alt' });
      }
      return M;
    }
  }
  return M;
}
function renderDock(v) {
  const pr = $('#prompt'), ac = $('#acts'), inf = $('#info'), ro = $('#roster'); if (!pr) return;
  const M = dockModel(v); pr.className = M.cls || '';
  pr.innerHTML = ''; pr.append(M.p || ''); const ps = $('#psub'), phn = isPh(); if (M.sub && !phn) pr.append(h('small', M.sub)); if (ps) { ps.innerHTML = ''; ps.hidden = !(phn && M.sub); if (phn && M.sub) ps.textContent = M.sub; }
  { const nw = $('#news'); if (nw) { const L = (UI.news || []).slice(isPh() ? -1 : -3); nw.innerHTML = ''; nw.hidden = !L.length || G.phase === 'over' || (isPh() && !!(UI.hint && UI.hint.c != null && G.phase === 'play' && iMustAct())); L.forEach((t, k) => nw.append(h('div' + (k === L.length - 1 ? '.nw1' : ''), t))); } }
  inf.hidden = !M.info; inf.className = M.info ? 'why' : ''; inf.innerHTML = M.info || '';
  ac.classList.toggle('many', M.acts.length > 6); ac.innerHTML = ''; M.acts.forEach(a => { const b = h('button.btn' + (a.cls ? '.' + a.cls : '') + (a.dis ? '.dis' : ''), { type: 'button', 'data-a': a.a, disabled: a.dis ? true : null }, a.label); for (const k of ['c', 'i', 'n', 'f', 'on', 'dir']) if (a[k] !== undefined) b.dataset[k] = a[k]; ac.append(b); });
  // who is still deciding (simultaneous phases)
  ro.innerHTML = ''; if (G.phase === 'pass' || (G.phase === 'assign' && G.as.mode === 'vote')) { const pend = new Set(LD.pending(G)); G.players.filter(p => !p.helper).forEach(p => ro.append(h('span.rchip' + (pend.has(p.seat) ? '.w' : '.r'), { html: avatarS(p.seat, 48) }, p.name + (pend.has(p.seat) ? ' …' : ' ✓')))); }
  { const fe = $('#felt'); if (fe) fe.classList.toggle('roston', ro.childNodes.length > 0); }
  // desktop: the dock lists every job (who has it, done / failed / open) instead of sitting empty
  const js = $('#jobsum'); if (js) { js.innerHTML = ''; js.hidden = isPh() || !G.tasks.length; if (!js.hidden) {
    js.append(h('div.jsh', 'All jobs' + (G.mission.d ? ' · difficulty ' + G.mission.d : '')));
    G.tasks.forEach((t, i) => { const st = jobSt(i), own = t.owner; js.append(h('button.jsr' + (st > 0 ? '.ok' : st < 0 ? '.bad' : ''), { type: 'button', 'data-a': 'job', 'data-i': i, 'aria-label': jobShort(i) },
      h('span.jav', { html: own >= 0 ? avatarS(own, 48) : '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" fill="none" stroke="#b9d2ee" stroke-width="2" stroke-dasharray="3 3"/></svg>' }),
      h('span.jtx', h('b', own >= 0 ? pname(own) : 'On the table'), h('span', TASKS[t.id].t)),
      h('span.jst', { html: st > 0 ? KIT.iconSVG('tick', 22) : st < 0 ? KIT.iconSVG('cross', 22) : '' }))); }); } }
  const dt = document.querySelector('.gx-dt'); if (dt) dt.textContent = M.cls === 'mine' ? 'Your turn' : 'What is happening';
  const bp = $('#barprompt'); if (bp && !bp.contains(pr)) { /* desktop: prompt stays in the dock */ }
  renderTip();
}
function renderTip() {
  const t = $('#tip'); if (!t) return; t.innerHTML = ''; document.documentElement.classList.toggle('tipon', !!UI.tip);
  if (!UI.tip) return;
  const c = h('div.tipcard', h('div.th', h('b', UI.tip.title), h('button.btn.small', { type: 'button', 'data-a': 'tipok' }, UI.tip.btn || 'Got it')), h('p', UI.tip.body));
  t.append(c);
}
function render() {
  if (!G || !UI.started) return;
  layoutVars();
  const v = viewSeat();
  renderBar(); renderOpp(v); renderFelt(v); renderMine(v); renderHand(v); renderDock(v);
  try { netRenderHook(); } catch (e) { }
  try { pxDirty(); } catch (e) { }
  const rg = $('#start'); if (rg && !rg.hidden && UI.started && !NET.on) { /* start screen closes in newGame */ }
}
