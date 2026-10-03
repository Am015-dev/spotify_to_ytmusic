// ===================== part 2: rendering (table, belt, dock) =====================
const isPh = () => document.documentElement.classList.contains('ph');
function focusSeat() { const v = viewSeat(); if (v >= 0) UI.focus = v; return UI.focus || 0; }
function render() {
  if (!G || !UI.started) return;
  renderBar(); renderTable(); renderBelt(); renderDock();
  try { renderDrawers(); } catch (e) { }
  try { netRenderHook(); } catch (e) { }
  if (PX.on) pxDirty();
}
function renderBar() {
  const s = $('#barstat'); if (!s) return;
  const re = UI.fz && UI.fz.roundEnd, rd = re ? (G.phase === 'over' ? D.rounds : G.round - 1) : G.round;
  s.textContent = G.phase === 'over' && !re ? 'Game over' : re ? 'Round ' + rd + ' of ' + D.rounds + ' · scoring' : 'Round ' + G.round + ' of ' + D.rounds + ' · Turn ' + G.turn + ' of ' + G.hand;
}
function bankedOf(s) {
  const fzEnd = UI.fz && UI.fz.tables && UI.fz.roundEnd;
  const list = fzEnd ? G.rs.slice(0, -1) : G.rs;
  return list.reduce((a, r) => a + r[s].total, 0);
}
function totalOf(s, info) {
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
    const ctrW = cw - shw - sl - 22;
    let pd = Math.min(rowH - (isMe ? 34 : 32), ctrW / (isMe ? 7.2 : 5.6) - 6, isMe ? 84 : 68); pd = Math.max(24, Math.round(pd));
    const dm = { av, shw, sl, pd, cmp };
    const sg = seatSig(s, tab, info, pcs, isMe, dm) + '|' + sigAll;
    const old = oldSeats[s];
    if (old && old.dataset.sg === sg) { els.push(old); continue; }
    const e = seatEl(s, tab, info, pcs, isMe, dm); e.dataset.rk = s; e.dataset.sg = sg; els.push(e);
  }
  let same = tbl.children.length === els.length; if (same) for (let i = 0; i < els.length; i++) if (tbl.children[i] !== els[i]) { same = false; break; }
  if (!same) tbl.replaceChildren(...els);
  UI.land = null;
  if (!tbl.__ap) { tbl.__ap = 1; try { KIT.applyTable($('#bd'), 'day'); } catch (e) { } }
}
function seatSig(s, tab, info, pcs, isMe, dm) {
  const p = G.players[s], fz = UI.fz && UI.fz.slots, sl = fz ? JSON.stringify(fz[s]) : (G.phase === 'pick' ? (p.picked ? 'p' : 'w') : 'x');
  const lnd = UI.land ? [...UI.land].filter(x => x.startsWith(s + '|')).join(',') : '';
  return [s, isMe ? 1 : 0, totalOf(s, info), info.rs.map(r => r.icons).join('/'), tab[s].map(e => e.id + ':' + e.w).join(','), pcs[s], sl, lnd, dm.av, dm.shw, dm.sl, dm.pd, dm.cmp ? 1 : 0, p.name, p.ai || '', G.phase === 'pick' && !p.picked && !UI.fz ? 'c' : '', s === viewSeat() ? 'v' : '', G.phase].join('|');
}
function seatEl(s, tab, info, pcs, isMe, dm) {
  const p = G.players[s], col = pcol(s), picking = G.phase === 'pick' && !p.picked && !UI.fz;
  const gs = groupsOf(s, tab, info), total = totalOf(s, info);
  const el = h('section.seat' + (isMe ? '.me' : '') + (picking ? '.choose' : ''), { 'data-seat': s, 'aria-label': p.name + (p.ai ? ', computer' : '') + ', ' + total + ' points' });
  el.style.setProperty('--pd', dm.pd + 'px'); el.style.setProperty('--shw', dm.shw + 'px'); el.style.setProperty('--av', dm.av + 'px'); el.style.setProperty('--sl', dm.sl + 'px'); el.style.setProperty('--ctr', counterURL(s));
  const av = h('div.av' + (picking ? '.act' : '')); av.appendChild(avN(s, 96));
  av.appendChild(h('span.sc', String(total)));
  const sh = h('button.sh', { type: 'button', 'data-a': 'seat', 'data-seat': s, 'aria-label': p.name + (p.ai ? ' (computer ' + p.ai + ')' : '') + ': ' + total + ' points. Open details.' }, av, h('span.nm', p.name));
  el.appendChild(sh);
  const ctr = h('div.ctr');
  const land = UI.land || new Set();
  for (const g of gs.list) ctr.appendChild(grpEl(g, dm.pd, land.has(s + '|' + g.k)));
  ctr.appendChild(shelfEl(s, pcs[s], dm.pd, land.has(s + '|pud')));
  if (!gs.list.length && !pcs[s]) ctr.insertBefore(h('span.none', G.phase === 'pick' ? 'Nothing served yet' : ''), ctr.firstChild);
  el.appendChild(ctr);
  el.appendChild(slotEl(s, dm.sl, dm.cmp));
  return el;
}
function grpEl(g, pd, landing) {
  const layers = Math.min(g.n, 3);
  const b = h('button.grp.' + g.cls + (g.pulse ? '.waitf' : '') + (landing ? '.land' : ''), { type: 'button', 'data-a': 'grp', 'data-seat': g.seat, 'data-k': g.k, 'data-type': g.type, 'data-on': g.on || null, 'data-n': g.n, 'data-pts': g.pts, 'aria-label': g.tip, title: g.tip });
  const pl = h('div.pl'); pl.style.width = (pd + 6 * (layers - 1)) + 'px';
  for (let i = 0; i < layers; i++) pl.appendChild(plateN(g.type, pd, g.on));
  b.appendChild(pl);
  if (g.n > 1 || g.k === 'roll') b.appendChild(h('span.bg', (g.k === 'roll' ? '' : '×') + g.n));
  b.appendChild(h('span.hn', g.hint));
  return b;
}
function shelfEl(s, n, pd, landing) {
  const tip = n + ' Custard Cup' + (n === 1 ? '' : 's') + ' kept for the end of the game (most scores 6, fewest loses 6; no penalty with 2 players).';
  const b = h('button.grp.shelf' + (landing ? '.land' : ''), { type: 'button', 'data-a': 'grp', 'data-seat': s, 'data-k': 'pud', 'data-type': 'pudding', 'data-n': n, 'data-pts': 0, 'aria-label': tip, title: tip });
  const pl = h('div.pl'); pl.appendChild(plateN('pudding', pd)); if (!n) pl.style.opacity = '.45';
  b.appendChild(pl); b.appendChild(h('span.bg', String(n))); b.appendChild(h('span.hn', 'custard'));
  return b;
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
  const m = Math.max(G.hand, 1), avail = beltWidth() - 20;
  const land = ph && boardSize().w >= boardSize().h; const hw = Math.max(ph ? (land || innerHeight < 700 ? 54 : 60) : 62, Math.min(ph ? 74 : 104, Math.floor((avail - (m - 1) * 6) / m)));
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
    const b = h('button.hc' + (selPos >= 0 ? '.sel' : '') + (rec.indexOf(id) >= 0 ? '.rec' : '') + (can ? '' : '.locked'), { type: 'button', 'data-a': 'hcard', 'data-i': idx, 'data-id': id, 'data-owner': v, 'data-up': '1', 'aria-pressed': selPos >= 0 ? 'true' : 'false', 'aria-label': TY[ty].name + '. ' + TY[ty].ruleText + (can ? '. Tap to lift it' + (selPos >= 0 ? ', tap again to serve' : '') : '') });
    b.style.setProperty('--k', k);
    b.appendChild(cardNode(ty, hw));
    if (g != null) b.appendChild(h('span.gn' + (g > 0 ? '' : '.z'), g > 0 ? '+' + g : '0'));
    if (UI.twin && selPos >= 0) b.appendChild(h('span.pn', String(selPos + 1)));
    if (enter) b.classList.add('ent-' + enter);
    b.dataset.rk = key; b.dataset.sg = sg;
    frag.push(b);
  });
  if (!hand.length) frag.push(h('div.beltnote', G.phase === 'over' ? 'The meal is over.' : (v >= 0 ? 'The belt is empty: new plates are coming.' : 'Watching the belt.')));
  { let same = belt.children.length === frag.length; if (same) for (let i = 0; i < frag.length; i++) if (belt.children[i] !== frag[i]) { same = false; break; } if (!same) belt.replaceChildren(...frag); }
  belt.dataset.hidden = hidden ? '1' : '0';
  if (enter) UI.pxEnter = enter;
  UI.enter = '';
  belt.scrollLeft = sl;
  try { const s = belt.querySelector('.hc.sel'); if (s) { const bl = belt.getBoundingClientRect(), sr = s.getBoundingClientRect(); if (sr.left < bl.left) belt.scrollLeft += sr.left - bl.left - 8; else if (sr.right > bl.right) belt.scrollLeft += sr.right - bl.right + 8; } } catch (e) { }
}
// ---------- the dock ----------
function promptText() {
  if (!G) return '';
  if (G.phase === 'over') return isPh() ? 'The meal is over.' : (G.winText || 'The meal is over.');
  const v = viewSeat();
  if (UI.fz && UI.fz.say) return isPh() ? (UI.fz.slots ? (UI.fz.slots[0] && UI.fz.slots[0].mode === 'faces' ? 'Reveal!' : 'Plates are covered…') : UI.fz.roundEnd ? 'Round over!' : 'Plates land. Hands pass left.') : UI.fz.say;
  if (UI.cards.length && UI.cards[0].kind === 'pass') return 'Pass the device to ' + pname(UI.cards[0].seat) + '.';
  if (watching()) return 'The computers are choosing a plate…';
  if (hotSeat() && v < 0) return 'Pass the device to the next diner.';
  const pend = KK.pending(G).filter(s => s !== v).map(pname);
  if (v >= 0 && G.players[v].picked) return pend.length ? 'Served. Waiting for ' + (isPh() && pend.length > 2 ? pend.length + ' diners' : nameList(pend)) + '…' : 'Served. Here come the plates…';
  if (v >= 0) {
    const nm = hotSeat() ? pname(v) + ', ' : '';
    if (UI.twin) return nm + 'Twin Sticks: pick two plates, then serve them.';
    if (UI.sel.length) return nm + (UI.prefs.tap2 ? 'Tap it again, or press Serve.' : 'Press Serve to send it to your seat.');
    return nm + 'pick a plate: tap it to lift it.';
  }
  return '';
}
function placePrompt() {
  const p = $('#prompt'); if (!p) return;
  const tgt = document.documentElement.classList.contains('ph-p') ? $('#barprompt') : $('#promptDock');
  if (tgt && p.parentNode !== tgt) tgt.appendChild(p);
}
function renderDock() {
  const pr = $('#prompt'); if (pr) { const t = promptText(); pr.textContent = t; const v = viewSeat(); pr.className = canPick() && v >= 0 ? 'mine' : ''; }
  const dt = document.querySelector('.gx-dt'); if (dt) dt.textContent = G.phase === 'over' ? 'Game over' : (canPick() ? 'Your turn' : 'Table');
  // round track
  const rt = $('#rt'); if (rt) { const re = UI.fz && UI.fz.roundEnd; rt.innerHTML = KIT.roundTrackSVG(Math.min(re ? (G.phase === 'over' ? D.rounds : G.round - 1) : G.round, D.rounds), { size: isPh() ? 24 : 30 }); rt.appendChild(h('span', G.phase === 'over' && !re ? 'Final' : re ? 'Round scoring' : 'Turn ' + G.turn + ' of ' + G.hand + ' · pass left')); }
  // roster chips
  const ro = $('#roster'); if (ro) {
    const tab = tables(), info = seatScoreInfo(tab), v = viewSeat(), f = focusSeat();
    const rsg = [v, f, G.phase, isPh() ? 1 : 0, UI.fz && UI.fz.slots ? 1 : 0].concat(G.players.map((p, s) => [p.name, p.picked ? 1 : 0, totalOf(s, info)].join(':')).concat([UI.fz ? 'f' : ''])).join('|');
    if (ro.dataset.sg !== rsg) { ro.dataset.sg = rsg; ro.replaceChildren();
    for (let k = 0; k < G.np; k++) {
      const s = (f + k) % G.np, p = G.players[s], busyFz = !!UI.fz, rdy = G.phase === 'pick' && p.picked && !busyFz, tot = totalOf(s, info);
      const ph = isPh();
      const ch = h('button.chip' + (s === v ? '.me' : '') + (rdy ? '.rd' : G.phase === 'pick' && !busyFz ? '.wt' : ''), { type: 'button', 'data-a': 'chip', 'data-seat': s, 'aria-label': p.name + (p.ai ? ' (computer)' : '') + ': ' + tot + ' points, ' + (G.phase !== 'pick' || busyFz ? '' : rdy ? 'has chosen' : 'is choosing') },
        (() => { const e = h('span.cav'); e.appendChild(avN(s, 96)); return e; })(), h('span.ct', h('b', p.name + (s === v && p.name !== 'You' ? ' (you)' : '')), h('i', (rdy ? '✓ ' : G.phase === 'pick' && !busyFz ? '… ' : '') + (ph ? tot : tot + ' pts' + (rdy ? ' · ready' : G.phase === 'pick' && !busyFz ? ' · choosing' : '')))));
      ro.appendChild(ch);
    }
    }
  }
  renderSel(); renderActs(); renderCheat();
}
function renderCheat() {
  const c = $('#cheat'); if (!c || c.firstChild || isPh()) return;
  c.appendChild(h('b', 'Scoring at a glance'));
  [['pair', 'tempura', 'Two Crispy Prawns = 5'], ['set', 'sashimi', 'Three Fish Slices = 10'], ['ladder', 'dumpling', 'Steam Buns: 1, 3, 6, 10, 15'], ['most', 'roll1', 'Rolls: most icons 6, second 3'], ['v2', 'salmon', 'Nigiri 1, 2 or 3 (triple on Fire Paste)'], ['x3', 'wasabi', 'Fire Paste: next nigiri x3'], ['swap', 'chop', 'Twin Sticks: serve two plates later'], ['dessert', 'pudding', 'Custard at the end: most +6, fewest -6']].forEach(r => c.appendChild(h('div.cr', { html: iconS(r[0], 26, r[1]) }, r[2])));
}
function renderSel() {
  const el = $('#selinfo'); if (!el) return;
  const rl = document.documentElement.classList; rl.toggle('kk-sel', UI.sel.length > 0 && canPick()); rl.toggle('kk-short', innerHeight < 700); el.innerHTML = ''; el.className = '';
  const v = viewSeat(); const ph = isPh();
  if (G.phase === 'over') { el.className = 'idle'; el.appendChild(h('div.si', h('span', G.winText))); return; }
  if (v >= 0 && canPick() && UI.sel.length) {
    const hand = G.players[v].hand, ids = UI.sel.map(i => hand[i]).filter(x => x != null);
    if (ids.length) {
      const cw = ph ? 56 : 92; const box = h('div.sc1'); const rows = h('div.si');
      if (ids.length === 1) { box.appendChild(cardNode(tkey(ids[0]), cw)); const ty = tkey(ids[0]); const g = gainOf(v, ids); add(rows, [h('b', TY[ty].name), h('span', TY[ty].ruleText), h('span.sm', g > 0 ? 'Scores +' + g + ' for you right now.' : 'Scores nothing yet.'), ph ? null : h('span.why', whyPick(ids))]); }
      else { const two = h('div'); two.style.cssText = 'display:flex;gap:2px'; ids.forEach(id => two.appendChild(cardNode(tkey(id), Math.round(cw * .7)))); box.appendChild(two); const g = gainOf(v, ids); add(rows, [h('b', 'Twin Sticks: ' + ids.map(i => TY[tkey(i)].l[0]).join(' + ')), h('span.sm', g > 0 ? 'Both together score +' + g + ' for you right now.' : 'Both together score nothing yet.'), ph ? null : h('span.why', whyPick(ids))]); }
      el.append(box, rows); return;
    }
  }
  el.className = 'idle';
  let t;
  if (UI.cards.length && UI.cards[0].kind === 'pass') t = 'The hands are hidden until the device is passed.';
  else if (watching()) t = 'Sit back: the computers play all three rounds. Hands slide to the left every turn.';
  else if (v >= 0 && G.players[v].picked) t = 'Your plate is on its way to your seat under a cover. Everyone reveals together.';
  else if (v >= 0 && canPick()) t = UI.twin ? 'Tap two plates on the belt, then press Serve.' : 'Tap a plate on your belt to lift it' + (UI.prefs.tap2 ? ', then tap it again to serve it.' : ', then press Serve.');
  else t = 'Revealing the plates…';
  el.appendChild(h('div.si', h('span', t)));
}
function renderActs() {
  const a = $('#acts'); if (!a) return; a.innerHTML = '';
  const v = viewSeat();
  if (!G || G.phase === 'over') return;
  if (v >= 0 && canPick()) {
    const p = G.players[v], chop = KK._.hasChop(p) && p.hand.length >= 2;
    const n = UI.sel.length;
    if (n) { const ids = UI.sel.map(i => p.hand[i]); const g = gainOf(v, ids); a.appendChild(h('button.btn.go', { 'data-a': 'serve', type: 'button' }, n === 2 ? 'Serve both' + (g > 0 ? ' (+' + g + ')' : '') : 'Serve' + (g > 0 ? ' (+' + g + ')' : ''))); }
    if (chop) a.appendChild(h('button.btn' + (UI.twin ? '.on' : '.alt'), { 'data-a': 'twin', type: 'button', 'aria-pressed': UI.twin ? 'true' : 'false' }, UI.twin ? 'Twin Sticks: on' : 'Use Twin Sticks'));
    a.appendChild(h('button.btn.alt', { 'data-a': 'hint', type: 'button' }, 'Hint'));
    if (n) a.appendChild(h('button.btn.alt', { 'data-a': 'unsel', type: 'button', 'aria-label': 'Put the plate back' }, 'Cancel'));
  }
}
// ---------- pop-up beside the board: details of one group of plates ----------
function openGroup(seat, k) {
  const tab = tables(), info = seatScoreInfo(tab), gs = groupsOf(seat, tab, info).list, g = gs.find(x => x.k === k);
  const p = G.players[seat];
  let type, title, tip, ids = [];
  if (k === 'pud') { type = 'pudding'; title = 'Custard Cups'; const n = pudCounts()[seat]; tip = n + ' kept' + (n === 1 ? '' : '') + '. ' + TY.pudding.ruleText + '. Custard stays on the table for all three rounds.'; }
  else if (g) { type = g.k === 'roll' ? 'roll2' : g.type; title = g.k === 'roll' ? 'Seaweed Rolls' : g.on ? 'Fire Paste + ' + TY[g.on].name : TY[g.type].name + (g.n > 1 ? 's' : ''); tip = g.tip; }
  else return;
  UI.pop = { kind: 'group', seat, k };
  const pp = $('#ppop'); pp.hidden = false; pp.innerHTML = '';
  const cw = isPh() ? 80 : 120;
  const body = h('div.ph-body', h('div.cwrap', h('div.cardbox', cardDiv(type, cw, g && g.on)), h('div.cinfo', h('p', tip), h('p.sm', TY[type].ruleText))));
  if (g && g.k === 'roll') { const mk = info.mk; body.appendChild(h('div.kv', h('span', 'Icons per diner'), h('b', G.players.map((q, i) => q.name + ' ' + info.rs[i].icons).join(' · ')))); }
  pp.append(h('div.ph-head', h('div.ph-t', h('b', title), h('span', p.name)), h('button.px', { 'data-a': 'popx', type: 'button', 'aria-label': 'Close' }, '×')), body);
}
function closePop() { UI.pop = null; const pp = $('#ppop'); if (pp) { pp.hidden = true; pp.innerHTML = ''; } }
