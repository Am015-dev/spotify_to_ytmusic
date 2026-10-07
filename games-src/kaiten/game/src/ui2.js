// ===================== part 2: rendering (table, belt, dock) =====================
const isPh = () => document.documentElement.classList.contains('ph');
function focusSeat() { const v = viewSeat(); if (v >= 0) UI.focus = v; return UI.focus || 0; }
function render() {
  if (!G || !UI.started) return;
  renderBar(); renderTable(); renderBelt(); renderDock();
  try { renderDrawers(); } catch (e) { }
  try { netRenderHook(); } catch (e) { }
  try { boardFX(); } catch (e) { }
  try { hlpAfter(); } catch (e) { }
  if (PX.on) pxDirty();
}
function renderBar() {
  const s = $('#barstat'); if (!s) return;
  // fz.scoring: the engine has already scored this round and dealt the next, but the last reveal is still on screen
  const re = UI.fz && (UI.fz.roundEnd || UI.fz.scoring), rd = re ? (G.phase === 'over' ? D.rounds : G.round - 1) : G.round;
  s.textContent = G.phase === 'over' && !re ? 'Game over' : re ? (isPh() ? 'Round ' + rd + '/' + D.rounds : 'Round ' + rd + ' of ' + D.rounds) + (UI.fz.roundEnd ? ' · scoring' : ' · last turn') : (isPh() ? 'Round ' + G.round + '/' + D.rounds + ' · Turn ' + G.turn + '/' + G.hand : 'Round ' + G.round + ' of ' + D.rounds + ' · Turn ' + G.turn + ' of ' + G.hand + ' · most points after round 3 wins');
}
function bankedOf(s) {
  const fzEnd = UI.fz && UI.fz.tables && (UI.fz.roundEnd || UI.fz.scoring);   // that round is already in G.rs: don't count it twice
  const list = fzEnd ? G.rs.slice(0, -1) : G.rs;
  return list.reduce((a, r) => a + r[s].total, 0);
}
function totalOf(s, info) {
  if (UI.fz && UI.fz.tally) return bankedOf(s) + UI.fz.tally[s];   // the round-end count: chips climb as each set scores
  if (G.phase === 'over' && !(UI.fz && UI.fz.tables)) return G.final.totals[s];
  return bankedOf(s) + (G.phase === 'over' && !(UI.fz && UI.fz.tables) ? 0 : info.rs[s].total);
}
function boardSize() { const b = $('#board'); const w = b ? b.clientWidth : 0, hh = b ? b.clientHeight : 0; return { w: w || 900, h: hh || 640 }; }
function layoutNums(np, hasMe, tblH) {
  const { w, h: hgt } = boardSize(), ph = isPh(), land = ph && w >= hgt;
  const o = hasMe ? np - 1 : np, meW = hasMe ? 1.35 : 0;
  let cols = 2;
  if (w < 560 && !land) cols = 1;
  else for (const c of [1, 2, 3]) { if (c > Math.max(1, o)) break; const rows = Math.ceil(o / c) + meW; if ((tblH - 6 * (Math.ceil(o / c) + (hasMe ? 1 : 0))) / rows >= 86) { cols = c; break; } if (c === 3) cols = 2; }
  if (o <= 1) cols = 1;
  return { w, h: hgt, cols, orows: Math.ceil(o / cols), ph, land };
}
function renderTable() {
  const tbl = $('#tbl'); if (!tbl) return;
  const np = G.np, v = viewSeat(), hasMe = v >= 0, f = focusSeat();
  const tab = tables(), info = seatScoreInfo(tab), pcs = pudCounts();
  const beltH = $('#beltz') ? $('#beltz').offsetHeight : 0;
  const L0 = boardSize(), tblH0 = Math.max(120, L0.h - (beltH || (isPh() ? 150 : 210)) - 10);
  const L = layoutNums(np, hasMe, tblH0);
  const order = []; if (hasMe) { for (let k = 1; k < np; k++) order.push((f + k) % np); order.push(f); } else for (let k = 0; k < np; k++) order.push(k);
  tbl.style.setProperty('--cols', L.cols);
  const meW = 1.35, rowsTpl = hasMe ? (L.orows ? 'repeat(' + L.orows + ',minmax(0,1fr)) minmax(0,' + meW + 'fr)' : 'minmax(0,1fr)') : 'repeat(' + L.orows + ',minmax(0,1fr))';
  tbl.style.gridTemplateRows = rowsTpl;
  const tblH = Math.max(120, L.h - (beltH || (L.ph ? 150 : 210)) - 10), tblW = L.w - 16;
  const nrow = L.orows + (hasMe ? meW : 0), rH = Math.max(44, (tblH - 6 * (L.orows + (hasMe ? 1 : 0))) / nrow);
  const rowOther = rH, rowMe = rH * meW;
  const els = [], oldSeats = {}; for (const c of tbl.children) if (c.dataset && c.dataset.sg) oldSeats[c.dataset.rk] = c;
  const sigAll = [L.cols, np, hasMe ? 1 : 0].join(',');
  for (const s of order) {
    const isMe = hasMe && s === f;
    const rowH = isMe ? rowMe : rowOther, cw = isMe ? tblW : tblW / L.cols;
    const av = Math.max(34, Math.min(isMe ? 60 : 52, Math.round(rowH * .46)));
    const cmp = rowH < 88, shw = av + 14, sl = Math.max(30, Math.min(58, Math.round((rowH - (cmp ? 12 : 36)) / 1.4)));
    const ctrW = cw - shw - sl - 25;
    // plates on the counter: one row, or two rows of bigger plates when the seat is tall enough (nothing clipped, labels readable)
    // (a layout that fits wins over bigger plates that overflow past the edge)
    const ng = groupsOf(s, tab, info).list.length + (pcs[s] || !isPh() ? 1 : 0), cap = isMe ? 84 : 68, slotW = p => Math.max(p + 18, 58);   // a group is never narrower than its tag ("need 2 more")
    let tight = false;
    const sw = p => tight ? Math.max(p + 12, 48) : slotW(p), gp = () => tight ? 12 : 18;
    const fit = (rows, hgt) => { const k = Math.ceil(ng / rows); let p = Math.max(24, Math.min(hgt, cap)); if (k * sw(p) > ctrW) p = Math.max(24, (ctrW / k) - gp()); return { p, ok: sw(p) * k <= ctrW + 4 && hgt >= 24 }; };
    const f1 = fit(1, rowH - (isMe ? 34 : 32)), f2 = ng > 2 ? fit(2, (rowH - 12) / 2 - 30) : { p: 0, ok: false };
    const wrap = f2.ok && (!f1.ok || f2.p > f1.p + 4);
    let pd = Math.max(24, Math.round(wrap ? f2.p : f1.p)), wrapF = wrap;
    if (!wrap && !f1.ok && ng >= 4) { tight = true; const g1 = fit(1, rowH - (isMe ? 34 : 32)), g2 = ng > 2 ? fit(2, (rowH - 12) / 2 - 30) : { p: 0, ok: false }; if (g2.ok && (!g1.ok || g2.p > g1.p + 4)) { wrapF = true; pd = Math.max(24, Math.round(g2.p)); } else { wrapF = false; pd = Math.max(24, Math.round(g1.p)); } }
    const dm = { av, shw, sl, pd, cmp, wrap: wrapF, tight };
    const sg = seatSig(s, tab, info, pcs, isMe, dm) + '|' + sigAll;
    const old = oldSeats[s];
    if (old && old.dataset.sg === sg) { els.push(old); continue; }
    const e = seatEl(s, tab, info, pcs, isMe, dm); e.dataset.rk = s; e.dataset.sg = sg; els.push(e);
  }
  let same = tbl.children.length === els.length; if (same) for (let i = 0; i < els.length; i++) if (tbl.children[i] !== els[i]) { same = false; break; }
  if (!same) tbl.replaceChildren(...els);
  if (UI.land && PX.on) for (const k of UI.land) PX.landSet.add(k);
  UI.land = null;
  if (!tbl.__ap) { tbl.__ap = 1; try { KIT.applyTable($('#bd'), 'day'); } catch (e) { } }
}
function seatSig(s, tab, info, pcs, isMe, dm) {
  const p = G.players[s], fz = UI.fz && UI.fz.slots, sl = fz ? JSON.stringify(fz[s]) : (G.phase === 'pick' ? (p.picked ? 'p' : 'w') : 'x');
  const lnd = UI.land ? [...UI.land].filter(x => x.startsWith(s + '|')).join(',') : '';
  return [s, isMe ? 1 : 0, totalOf(s, info), info.rs.map(r => r.icons).join('/'), tab[s].map(e => e.id + ':' + e.w).join(','), pcs.join('/'), sl, lnd, dm.av, dm.shw, dm.sl, dm.pd, dm.cmp ? 1 : 0, dm.wrap ? 1 : 0, dm.tight ? 1 : 0, newsSig(s), G.phase === 'over' && (G.winners || []).indexOf(s) >= 0 && (UI.overShown || (UI.fz && UI.fz.crown)) ? 'W' : '', p.name, p.ai || '', G.phase === 'pick' && !p.picked && !UI.fz ? 'c' : '', s === viewSeat() ? 'v' + (twinReady() ? 't' + (UI.twin ? 1 : 0) : '') : '', G.phase].join('|');
}
function seatEl(s, tab, info, pcs, isMe, dm) {
  const p = G.players[s], col = pcol(s), picking = G.phase === 'pick' && !p.picked && !UI.fz;
  const gs = groupsOf(s, tab, info), total = totalOf(s, info);
  const el = h('section.seat' + (isMe ? '.me' : '') + (picking ? '.choose' : '') + (dm.wrap ? '.wrap' : '') + (dm.tight ? '.tight' : ''), { 'data-seat': s, 'aria-label': p.name + (p.ai ? ', computer' : '') + ', ' + total + ' points' });
  el.style.setProperty('--pd', dm.pd + 'px'); el.style.setProperty('--shw', dm.shw + 'px'); el.style.setProperty('--av', dm.av + 'px'); el.style.setProperty('--sl', dm.sl + 'px'); el.style.setProperty('--ctr', counterURL(s));
  const crowned = G.phase === 'over' && (G.winners || []).indexOf(s) >= 0 && (UI.overShown || (UI.fz && UI.fz.crown));
  const av = h('div.av' + (picking ? '.act' : '') + (crowned ? '.win' : '')); av.appendChild(avN(s, 96));
  av.appendChild(h('span.sc', String(total)));
  if (crowned) av.appendChild(h('span.crown', { html: KIT.iconSVG('crown', { size: 26 }) }));
  { const nd = newsDelta(s); if (nd) av.appendChild(h('span.dl' + (nd > 0 ? '' : '.neg'), (nd > 0 ? '+' : '−') + Math.abs(nd))); }
  const sh = h('button.sh', { type: 'button', 'data-a': 'seat', 'data-seat': s, 'aria-label': p.name + (p.ai ? ' (computer ' + p.ai + ')' : '') + ': ' + total + ' points. Open details.' }, av, h('span.nm', p.name));
  el.appendChild(sh);
  const ctr = h('div.ctr');
  const land = UI.land || new Set();
  const gl = gs.list.slice(); if (isMe && twinReady()) gl.sort((x, y) => (y.k === 'chop') - (x.k === 'chop'));   // the glowing Twin Sticks come first, never scrolled out of the tray
  for (const g of gl) ctr.appendChild(grpEl(g, dm.pd, land.has(s + '|' + g.k)));
  if (pcs[s] || !isPh()) ctr.appendChild(shelfEl(s, pcs[s], dm.pd, land.has(s + '|pud')));   // phones: the custard spot appears with the first cup (the dock lists custard)
  if (!gs.list.length && !pcs[s]) ctr.insertBefore(h('span.none', G.phase === 'pick' ? 'Nothing served yet' : ''), ctr.firstChild);
  el.appendChild(ctr);
  el.appendChild(slotEl(s, dm.sl, dm.cmp));
  return el;
}
function grpEl(g, pd, landing) {
  const layers = Math.min(g.n, 3);
  const sticks = g.k === 'chop' && twinReady() && g.seat === viewSeat();
  const b = h('button.grp.' + g.cls + (g.pulse ? '.waitf' : '') + (landing ? '.land' : '') + (sticks ? '.usable' + (UI.twin ? '.on' : '') : ''), { type: 'button', 'data-a': sticks ? 'twin' : 'grp', 'data-seat': g.seat, 'data-k': g.k, 'data-type': g.type, 'data-on': g.on || null, 'data-n': g.n, 'data-pts': g.pts, 'aria-label': g.tip, title: g.tip });
  const pl = h('div.pl'); pl.style.width = (pd + 6 * (layers - 1)) + 'px';
  for (let i = 0; i < layers; i++) pl.appendChild(plateN(g.type, pd, g.on));
  b.appendChild(pl);
  if (g.n > 1 || g.k === 'roll') b.appendChild(h('span.bg', (g.k === 'roll' ? '' : '×') + g.n));
  b.appendChild(h('span.hn', sticks ? (UI.twin ? 'tap 2 dishes' : 'tap: grab 2') : g.hint));
  return b;
}
const twinReady = () => { const v = viewSeat(); return v >= 0 && canPick() && KK._.hasChop(G.players[v]) && G.players[v].hand.length >= 2; };
function shelfEl(s, n, pd, landing) {
  const tip = n + ' Custard Cup' + (n === 1 ? '' : 's') + ' kept for the end of the game (most scores 6, fewest loses 6; no penalty with 2 players).';
  const b = h('button.grp.shelf' + (landing ? '.land' : ''), { type: 'button', 'data-a': 'grp', 'data-seat': s, 'data-k': 'pud', 'data-type': 'pudding', 'data-n': n, 'data-pts': 0, 'aria-label': tip, title: tip });
  const pl = h('div.pl'); pl.appendChild(plateN('pudding', pd)); if (!n) pl.style.opacity = '.45';
  const st = pudStand(s); b.appendChild(pl); b.appendChild(h('span.bg', String(n))); b.appendChild(h('span.hn' + (st[0] === '−' ? '.neg' : st[0] === '+' ? '.pos' : ''), st));
  return b;
}
// the custard race as it stands now (scored at the end of the game): most +6, fewest −6
function pudStand(s) {
  const pc = pudCounts(), mx = Math.max(...pc), mn = Math.min(...pc), n = pc[s];
  if (mx === mn) return 'dessert';
  if (n === mx) return '+6';
  if (n === mn && G.np > 2) return '−6';
  return 'dessert';
}
function slotEl(s, sl, cmp) {
  const p = G.players[s], fz = UI.fz && UI.fz.slots;
  const box = h('div.sbox'), wrap = h('div.slot', box);
  const cover = () => { box.innerHTML = KIT.clocheSVG({ w: sl }); };
  if (fz) {
    const m = fz[s];
    if (m && m.mode === 'cover') { cover(); if (!cmp) wrap.appendChild(h('span.st.rd', 'ready')); }
    else if (m && (m.mode === 'faces' || m.mode === 'shown')) {
      const ids = m.cards, cw = ids.length > 1 ? Math.round(sl * .5) : sl; box.className = 'sbox two';
      const host = h('div.two'); box.appendChild(host);
      ids.forEach(c => { const hh = h('div.hostc'); hh.style.cssText = 'position:relative;width:' + cw + 'px;height:' + Math.round(cw * 1.4) + 'px'; hh.appendChild(cardNode(c.key, cw)); host.appendChild(hh); hh.dataset.host = s; });
      if (!cmp) wrap.appendChild(h('span.st', m.cards.map(c => TY[c.key].l[0]).join(' + ')));
    }
    return wrap;
  }
  if (UI.fz) { box.className = 'sbox'; }
  else if (G.phase === 'pick' && p.picked) { cover(); if (!cmp) wrap.appendChild(h('span.st.rd', 'ready')); }
  else if (G.phase === 'pick') { box.className = 'sbox empty' + (s === viewSeat() ? ' mine' : ''); box.textContent = '…'; box.setAttribute('aria-label', p.name + ' is choosing'); }
  else box.className = 'sbox';
  return wrap;
}
// ---------- the belt (your hand) ----------
function beltWidth() { return boardSize().w; }
function renderBelt() {
  const belt = $('#belt'); if (!belt) return;
  const v = viewSeat(), f = focusSeat(), np = G.np, ph = isPh();
  const next = (f + 1) % np, prev = (f + np - 1) % np;
  $('#beltTo').textContent = '◀ passes to ' + pname(next);
  $('#beltFrom').textContent = 'from ' + pname(prev) + ' ◀';
  const sl = belt.scrollLeft;
  const hand = v >= 0 ? dispHand() : (G.phase === 'over' ? [] : new Array(UI.fz && UI.fz.backN != null ? UI.fz.backN : G.players[f].hand.length).fill(-1));
  const hidden = v < 0;
  const m = Math.max(hand.length, 1), avail = beltWidth() - 20;
  const land = ph && boardSize().w >= boardSize().h; const hwMax = ph ? (land ? 74 : 84) : Math.max(84, Math.min(118, Math.floor((boardSize().h * .3 - 34) / 1.4))); let hw = Math.max(ph ? (land || innerHeight < 700 ? 54 : 60) : 62, Math.min(hwMax, Math.floor((avail - (m - 1) * 6) / m)));
  // a tall phone: two rows of plates instead of a belt that scrolls sideways and hides plates off the edge
  const one = Math.floor((avail - (m - 1) * 6) / m), two = ph && !land && one < 72 && boardSize().h >= 440 && m > 4 && G.phase !== 'over';   // sized for a full hand all round: the belt and the dishes never jump between turns
  if (two) { const k = Math.ceil(m / 2); hw = Math.max(54, Math.min(boardSize().h < 500 ? 62 : 80, Math.floor((avail - (k - 1) * 6) / k))); }
  else if (ph && hand.length && land) { const fitN = Math.floor((avail - (hand.length - 1) * 6) / hand.length); if (fitN < hw) hw = Math.max(44, fitN); }   // shrink a little rather than hide plates past the edge
  // the belt never takes more than about half the board: the counters stay readable on short phones
  if (ph && !land) { const H2 = boardSize().h * .5, cap = Math.floor(two ? (H2 - 92) / 2.8 : (H2 - 84) / 1.4); if (cap < hw) hw = Math.max(44, cap); }
  belt.classList.toggle('two', !!two);
  $('#bd').style.setProperty('--hw', hw + 'px');
  if (!belt.__bt) { belt.__bt = 1; try { const bt = KIT.beltEl({ h: 72, period: 96, seconds: 6 }); bt.style.height = '60px'; $('#beltw').insertBefore(bt, belt); bt.style.bottom = '8px'; } catch (e) { } }
  const frag = [], oldC = new Map(); for (const c of belt.children) if (c.dataset && c.dataset.rk) oldC.set(c.dataset.rk, c);
  const hp = v >= 0 ? G.players[v] : null, can = canPick();
  const rec = UI.rec && !UI.noRec ? UI.rec.ids : [];
  const enter = UI.enter;
  hand.forEach((id, k) => {
    if (id < 0) { const key = 'b' + k, sg = 'b' + hw; const o = oldC.get(key); if (o && o.dataset.sg === sg && !enter) { frag.push(o); return; } const b = h('div.hc.back', { 'data-up': '0', 'aria-hidden': 'true' }); b.style.setProperty('--k', k); b.appendChild(backN(hw)); if (enter) b.classList.add('ent-' + enter); b.dataset.rk = key; b.dataset.sg = sg; frag.push(b); return; }
    const idx = hp && !UI.fz ? hp.hand.indexOf(id) : -1;
    const ty = tkey(id), selPos = UI.sel.indexOf(idx);
    const g = UI.prefs.hint && can ? gainOf(v, [id]) : null;
    const key = 'c' + id, sg = [id, idx, selPos, rec.indexOf(id) >= 0 ? 1 : 0, can ? 1 : 0, g, UI.twin ? 1 : 0, hw, UI.prefs.tap2 ? 1 : 0].join('|');
    const o = oldC.get(key); if (o && o.dataset.sg === sg && !enter) { frag.push(o); return; }
    const b = h('button.hc' + (selPos >= 0 ? '.sel' : '') + (rec.indexOf(id) >= 0 ? '.rec' : '') + (can ? '' : '.locked'), { type: 'button', 'data-a': 'hcard', 'data-i': idx, 'data-id': id, 'data-owner': v, 'data-up': '1', 'aria-pressed': selPos >= 0 ? 'true' : 'false', 'aria-label': TY[ty].name + '. ' + TY[ty].ruleText + (can ? (UI.prefs.grab1 === false ? '. Tap to lift it' + (selPos >= 0 ? (UI.prefs.tap2 ? ', tap again to serve' : ', then press Serve') : '') : '. Tap to grab it') : '') });
    b.style.setProperty('--k', k);
    b.appendChild(cardNode(ty, hw));
    if (g != null) b.appendChild(ty === 'pudding' ? h('span.gn.z', { title: 'Custard scores at the end of the game' }, pudLead(v) ? 'end +6' : 'end') : h('span.gn' + (g > 0 ? '' : '.z'), g > 0 ? '+' + g : zeroTag(v, ty)));
    if (UI.twin && selPos >= 0) b.appendChild(h('span.pn', String(selPos + 1)));
    if (enter) b.classList.add('ent-' + enter);
    b.dataset.rk = key; b.dataset.sg = sg;
    frag.push(b);
  });
  if (!hand.length && !(UI.fz && (UI.fz.roundEnd || UI.fz.tally))) frag.push(h('div.beltnote', G.phase === 'over' ? 'The meal is over.' : (v >= 0 ? 'The belt is empty: new plates are coming.' : 'Watching the belt.')));
  { let same = belt.children.length === frag.length; if (same) for (let i = 0; i < frag.length; i++) if (belt.children[i] !== frag[i]) { same = false; break; } if (!same) belt.replaceChildren(...frag); }
  belt.dataset.hidden = hidden ? '1' : '0';
  if (enter) UI.pxEnter = enter;
  UI.enter = '';
  belt.scrollLeft = sl;
  try { const s = belt.querySelector('.hc.sel') || belt.querySelector('.hc.rec'); if (s) { const bl = belt.getBoundingClientRect(), sr = s.getBoundingClientRect(); if (sr.left < bl.left) belt.scrollLeft += sr.left - bl.left - 8; else if (sr.right > bl.right) belt.scrollLeft += sr.right - bl.right + 8; } } catch (e) { }
}
// would one more custard put this diner alone in front (worth +6 at the end of the game)?
function pudLead(v) { const pc = pudCounts(); return pc.every((n, i) => i === v || n < pc[v] + 1) && !pc.every((n, i) => i === v || n < pc[v]); }
// a dish that scores nothing yet shows what it is building towards instead of a bare 0
function zeroTag(v, ty) {
  const c = KK.tableCounts(tables()[v]);
  const pips = (n, of) => '●'.repeat(n) + '○'.repeat(of - n);   // how far this dish takes the set
  if (ty === 'tempura') return pips((c.tempura + 1) % 2 || 2, 2);
  if (ty === 'sashimi') return pips((c.sashimi + 1) % 3 || 3, 3);
  if (ty === 'wasabi') return '×3';
  if (ty === 'chop') return '×2';
  if (ICONS[ty]) return '0';
  return '0';
}
// ---------- the dock ----------
function promptText() {
  // one short line (8 words at most): the board shows the rest
  if (!G) return '';
  if (UI.fz && UI.fz.msg) return UI.fz.msg;
  if (G.phase === 'over' && (!UI.fz || UI.fz.crown)) return winLine();
  const v = viewSeat();
  if (UI.fz && UI.fz.say) return UI.fz.slots ? (UI.fz.slots[0] && UI.fz.slots[0].mode === 'faces' ? 'Reveal!' : 'Everyone has chosen…') : UI.fz.roundEnd ? 'Round over!' : 'Hands pass along the belt';
  if (UI.cards.length && UI.cards[0].kind === 'pass') return 'Pass the device to ' + pname(UI.cards[0].seat) + '.';
  if (UI.busy) return 'Hands pass along the belt';
  if (watching()) return 'The chefs are choosing…';
  if (hotSeat() && v < 0) return 'Pass the device on.';
  const pend = KK.pending(G).filter(s => s !== v).map(pname);
  if (v >= 0 && G.players[v].picked) return pend.length ? 'Waiting for ' + (pend.length > 1 ? pend.length + ' diners' : pend[0]) + '…' : 'Reveal!';
  if (v >= 0) {
    const nm = hotSeat() ? pname(v) + ': ' : '';
    if (UI.twin) return nm + (UI.sel.length ? 'Now tap a second dish' : 'Twin Sticks: tap two dishes');
    if (UI.sel.length && UI.prefs.grab1 === false) return nm + (UI.prefs.tap2 ? 'Tap it again to serve' : 'Press Serve to grab it');
    return nm + 'Tap a dish to grab it';
  }
  return '';
}
function placePrompt() {
  const p = $('#prompt'); if (!p) return;
  const tgt = document.documentElement.classList.contains('ph-p') ? $('#labmid') : $('#promptDock');
  if (tgt && p.parentNode !== tgt) tgt.appendChild(p);
}
function renderDock() {
  const pr = $('#prompt'); if (pr) { const t = promptText(); pr.textContent = t; const v = viewSeat(); pr.className = canPick() && v >= 0 ? 'mine' : ''; }
  renderLabActs();
  const dt = document.querySelector('.gx-dt'); if (dt) dt.textContent = G.phase === 'over' ? 'Game over' : (canPick() ? 'Your turn' : 'Table');
  // round track
  const rt = $('#rt'); if (rt) { const re = UI.fz && (UI.fz.roundEnd || UI.fz.scoring); rt.innerHTML = KIT.roundTrackSVG(Math.min(re ? (G.phase === 'over' ? D.rounds : G.round - 1) : G.round, D.rounds), { size: isPh() ? 24 : 30 }); rt.appendChild(h('span', G.phase === 'over' && !re ? 'Final' : re ? 'Round scoring' : 'Turn ' + G.turn + ' of ' + G.hand + ' · hands pass on')); }
  // roster chips
  const ro = $('#roster'); if (ro) {
    const tab = tables(), info = seatScoreInfo(tab), v = viewSeat(), f = focusSeat();
    const rsg = [v, f, G.phase, isPh() ? 1 : 0, UI.fz && UI.fz.slots ? 1 : 0, pudCounts().join(',')].concat(G.players.map((p, s) => [p.name, p.picked ? 1 : 0, totalOf(s, info)].join(':')).concat([UI.fz ? 'f' : ''])).join('|');
    if (ro.dataset.sg !== rsg) { ro.dataset.sg = rsg; ro.replaceChildren();
    for (let k = 0; k < G.np; k++) {
      const s = (f + k) % G.np, p = G.players[s], busyFz = !!UI.fz, rdy = G.phase === 'pick' && p.picked && !busyFz, tot = totalOf(s, info);
      const ph = isPh();
      const ch = h('button.chip' + (s === v ? '.me' : '') + (G.np >= 4 ? '.nn' : '') + (rdy ? '.rd' : G.phase === 'pick' && !busyFz ? '.wt' : ''), { type: 'button', 'data-a': 'chip', 'data-seat': s, 'aria-label': p.name + (p.ai ? ' (computer)' : '') + ': ' + tot + ' points, ' + (G.phase !== 'pick' || busyFz ? '' : rdy ? 'has chosen' : 'is choosing') },
        (() => { const e = h('span.cav'); e.appendChild(avN(s, 96)); return e; })(), h('span.ct', h('b', p.name + (s === v && p.name !== 'You' ? ' (you)' : '')), h('i', (rdy ? '✓ ' : '') + (ph ? tot + (G.np <= 2 ? ' pts' : '') : tot + ' pts' + (rdy ? ' · ready' : G.phase === 'pick' && !busyFz ? ' · choosing' : '')))));
      ro.appendChild(ch);
    }
    }
  }
  renderSel(); renderActs(); renderCheat();
}
function renderCheat() { const c = $('#cheat'); if (c) c.replaceChildren(); }   // no scoring cheat sheet: the trays show what scores
function renderSel() {
  // no text panel: what a dish scores is on the dish itself (+N badge); press and hold a dish for two words more
  const el = $('#selinfo'); if (!el) return;
  const rl = document.documentElement.classList; rl.toggle('kk-sel', UI.sel.length > 0 && canPick()); rl.toggle('kk-short', innerHeight < 700);
  el.replaceChildren(); el.className = 'idle';
}
function renderActs() {
  const a = $('#acts'); if (!a) return; a.innerHTML = '';
  const v = viewSeat();
  if (!G || G.phase === 'over') return;
  if (v >= 0 && canPick()) {
    const p = G.players[v], chop = KK._.hasChop(p) && p.hand.length >= 2;
    const n = UI.sel.length;
    if (n && (UI.prefs.grab1 === false || n === 2)) { const ids = UI.sel.map(i => p.hand[i]); const g = gainOf(v, ids); a.appendChild(h('button.btn.go', { 'data-a': 'serve', type: 'button' }, n === 2 ? 'Serve both' + (g > 0 ? ' (+' + g + ')' : '') : 'Serve' + (g > 0 ? ' (+' + g + ')' : ''))); }
    if (n) a.appendChild(h('button.btn.alt', { 'data-a': 'unsel', type: 'button', 'aria-label': 'Put the plate back' }, 'Cancel'));
  }
}
// ---------- pop-up beside the board: details of one group of plates ----------
function openGroup(seat, k) {
  // tap a pile on a tray: its dish and one short line (what it scores now)
  const tab = tables(), info = seatScoreInfo(tab), gs = groupsOf(seat, tab, info).list, g = gs.find(x => x.k === k);
  const p = G.players[seat];
  let type, title, line;
  if (k === 'pud') { type = 'pudding'; title = 'Custard Cups'; line = 'End: most +6, fewest −6'; }
  else if (g) { type = g.k === 'roll' ? 'roll2' : g.type; title = g.k === 'roll' ? 'Seaweed Rolls' : g.on ? 'Fire Paste + ' + TY[g.on].name : TY[g.type].name + (g.n > 1 ? 's' : ''); line = /^= /.test(g.hint) ? 'Scores ' + g.hint.slice(2) + ' now' : g.hint.charAt(0).toUpperCase() + g.hint.slice(1); if (g.k === 'wasabi') line = 'Next nigiri scores triple'; if (g.k === 'chop') line = 'Later: grab two dishes'; }
  else return;
  UI.pop = { kind: 'group', seat, k }; clearTimeout(UI.popT); UI.popT = setTimeout(() => { if (UI.pop && UI.pop.k === k) closePop(); }, 3500);
  const pp = $('#ppop'); pp.hidden = false; pp.innerHTML = '';
  const cw = isPh() ? 64 : 96;
  const body = h('div.ph-body', h('div.cwrap', h('div.cardbox', cardDiv(type, cw, g && g.on)), h('div.cinfo', h('p', line))));
  pp.append(h('div.ph-head', h('div.ph-t', h('b', title), h('span', p.name)), h('button.px', { 'data-a': 'popx', type: 'button', 'aria-label': 'Close' }, '×')), body);
}
function closePop() { UI.pop = null; const pp = $('#ppop'); if (pp) { pp.hidden = true; pp.innerHTML = ''; } }
