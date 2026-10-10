// ===================== part 2: the board (shared Elderheart area): layout + render =====================
const FIC = {
  forest_berry_thicket: [['berry', 2], ['card', 1]], forest_foragers_crossing: [['any', 2]], forest_rummage_hollow: [['discard', '*'], ['card', '2ea']],
  forest_echoing_meadow: [['copy', ''], ['card', 1]], forest_quarry_burrow: [['pebble', 1], ['card', 3]], forest_mixed_glade: [['twig', 1], ['resin', 1], ['berry', 1]],
  forest_bumper_bramble: [['berry', 3]], forest_sapwell_copse: [['resin', 2], ['twig', 1]], forest_postbag_clearing: [['card', 2], ['any', 1]],
  forest_barter_stump: [['discard', '3'], ['any', '']], forest_meadow_bazaar: [['meadow', '2']]
};
const EVT = { production: 'production', destination: 'destination', governance: 'governance', traveler: 'traveler' };
function items(list, px) {
  const w = h('div.its' + (list.length > 2 ? '.its3' : ''));
  const p = list.length > 2 ? Math.round(px * .78) : list.length === 1 ? Math.min(px + 6, Math.round(px * 1.2)) : px;
  for (const [k, n] of list) { const num = (n !== '' && n !== 1) ? (/^\d+$/.test(String(n)) ? '×' : '') + n : null; w.appendChild(h('span.it', ic(k, p), num ? h('b.bd', num) : null)); }
  return w;
}
function basicItems(i) { const b = D.basic[i], l = []; for (const r of RESK) if (b.gain[r]) l.push([r, b.gain[r]]); if (b.draw) l.push(['card', b.draw]); if (b.pts) l.push(['point', b.pts]); return l; }
// ---- layout: one absolute rect for every item. #bd fills the whole play area (bar excluded).
// Portrait: scores strip, 3 rows of places, the meadow, my city, my stock, my hand, the action row.
// Wide (landscape / desktop): places + meadow on the left, a rail on the right with the same things stacked.
const CARD_AR = 1.406;
// how many cards of what size fit a strip of W x H (cards may overlap sideways; more rows only when the strip is tall)
function fitStrip(n, W, H, baseW) {
  n = Math.max(1, n);
  for (let cw = Math.min(baseW, Math.floor(H / CARD_AR)); cw >= 30; cw -= 2) {
    const ch = Math.round(cw * CARD_AR);
    for (let rows = 1; rows <= 4; rows++) {
      if (rows * ch + (rows - 1) * 2 > H) break;
      const per = Math.ceil(n / rows);
      let step = per > 1 ? (W - cw) / (per - 1) : 0;
      if (step > cw + 4) step = cw + 4;
      if (per === 1 || step >= cw * 0.42) return { cw, ch, rows, per, step };
    }
  }
  const cw = 30, ch = 42, st = cw * 0.42, per = Math.max(1, Math.floor((W - cw) / st) + 1);
  return { cw, ch, rows: Math.ceil(n / per), per, step: st };
}
// the hand and my city can be tucked into one thin bar (tap to raise them again); they stay up whenever a card of mine is a target
function handHidden() {
  if (!UI.handHide || !G || G.phase === 'over' || (UI.cfg && UI.cfg.tutorial) || document.documentElement.classList.contains('ph-l')) return false;
  if (innerWidth >= innerHeight) return false;
  try { return !G.q && !myMoves().some(m => m.type === 'play' || String(tgOf(m)).startsWith('d:')); } catch (e) { return false; }
}
function boardLayout(W, H) {
  const wide = W >= H * 1.0 || (document.documentElement.classList.contains('ph-l'));
  const tall = !wide, g = 2, pad = 4;
  const R = { W, H, tall, tiles: [], meadow: [], g, slots: false };
  const tl = (kind, i, x, y, w, hh, ex) => { const t = { kind, i, x, y, w, h: hh }; if (ex) Object.assign(t, ex); R.tiles.push(t); return t; };
  const nf = G.forest.length;
  const r3 = []; for (let i = 0; i < nf; i++) r3.push(['forest', i]); r3.push(['haven', 0], ['journey', 0]);
  const sup = [['deck', 0], ['tree', 0]]; if (nf === 3) sup.push(['disc', 0]);
  const evs = []; G.bev.forEach((e, i) => evs.push(['bev', i])); G.sev.forEach((e, i) => evs.push(['sev', i]));
  const nCity = Math.max(1, G.players[Math.max(0, focusSeat())].city.length + visitList().length);
  const nHand = Math.max(1, (viewSeat() >= 0 ? G.players[viewSeat()].hand.length : 5));
  if (tall) {
    // bands from the top: scores, event pennants, 2 rows of basic places (1 row when short), forest/haven/road, the meadow bench, my stock; the
    // table under the picture: my city strip, my fanned hand, the action row. Every band shrinks until the meadow cards are readable.
    const col = handHidden();
    const meas = (mode, t) => {
      const L = (a, b) => Math.round(b + (a - b) * t), tight = mode === 'tight';
      const m = { mode, t, chip: L(36, 30), ev: L(46, 30), br: tight ? L(46, 36) : L(58, 42), r3: L(60, 40), res: L(34, 26), hand: col ? 0 : L(100, 60), city: col ? 0 : L(46, 32), bar: col ? 28 : 0, acts: L(46, 40), rg: tight ? 0 : 7, sg: tight ? 3 : 5, rows: tight ? 1 : 2 };
      let y = 3 + m.chip + m.sg; m.evY = y; y += m.ev + m.sg; m.bY = y; y += m.rows * m.br + (m.rows - 1) * m.rg + m.sg; m.r3Y = y; y += m.r3 + m.sg + 3; m.mTop = y;
      let yb = H - pad; m.actsY = yb - m.acts; yb = m.actsY - 3; if (col) { m.barY = yb - m.bar; yb = m.barY - 3; } m.handY = yb - m.hand; if (!col) yb = m.handY - 3; m.cityY = yb - m.city; m.sceneB = m.cityY - 3;
      m.resY = m.sceneB - 3 - m.res; m.mBot = m.resY - 3;
      const bp = 5, avail = m.mBot - m.mTop - 2 * bp - 4; m.ch = avail / 2; m.cw = Math.min(104, m.ch / CARD_AR, (W - 2 * pad - 2 * bp - 3 * 6) / 4);
      return m;
    };
    const pick = mode => { let b = null; for (let t = 1; t > -0.001; t -= .1) { b = meas(mode, Math.max(0, t)); if (b.cw >= 80) return b; } return b; };
    let m = H >= 600 ? pick('roomy') : null; if (!m || m.cw < 62) { const m2 = pick('tight'); if (!m || m2.cw > m.cw) m = m2; }
    const tight = m.mode === 'tight'; R.mode = m.mode;
    R.chips = { x: pad, y: 3, w: W - 2 * pad, h: m.chip };
    // event pennants on a rope
    const ne = Math.max(1, evs.length), ew = (W - 2 * pad - 14) / ne, ewd = Math.min(ew - 2, 52), evX = [];
    evs.forEach((e, i) => { const cx = pad + 7 + ew * (i + .5); evX.push(cx); tl(e[0], e[1], cx - ewd / 2, m.evY, ewd, m.ev, { ip: 20, ps: 18 }); });
    R.rope = { y: m.evY + 3, xs: evX, h: m.ev };
    // basic places
    const rowsArr = [], cg = tight ? 3 : 8, cols = tight ? 8 : 4, bw = (W - 2 * pad - (cols - 1) * cg) / cols;
    const ipB = tight ? Math.max(16, Math.min(22, Math.floor((bw - 5) / 2))) : Math.min(32, Math.floor(m.br * .6));
    for (let r = 0; r < m.rows; r++) rowsArr.push([]);
    for (let i = 0; i < 8; i++) { const row = Math.floor(i / cols); rowsArr[row].push(tl('basic', i, pad + (i % cols) * (bw + cg), m.bY + row * (m.br + m.rg), bw, m.br, { ip: ipB, ps: Math.round(Math.min(28, m.br * .56)) })); }
    // forest places, the haven and the road
    const n3 = r3.length, w3 = Math.min(78, (W - 2 * pad - (n3 - 1) * cg) / n3), x3 = (W - (n3 * w3 + (n3 - 1) * cg)) / 2, row3 = [];
    r3.forEach((e, k) => row3.push(tl(e[0], e[1], x3 + k * (w3 + cg), m.r3Y, w3, m.r3, { ip: Math.min(28, Math.floor((w3 - 4) / 2)), ps: Math.round(Math.min(26, m.r3 * .52)) })));
    rowsArr.push(row3);
    // draw pile, seasons and discards sit at the end of the stock row
    const stw = Math.min(40, m.res + 6), nS = sup.length, tilesW = nS * stw + (nS - 1) * 3;
    R.res = { x: pad, y: m.resY, w: W - 2 * pad - tilesW - 4, h: m.res };
    sup.forEach((e, k) => tl(e[0], e[1], W - pad - tilesW + k * (stw + 3), m.resY, stw, m.res, { ip: Math.max(14, Math.min(20, m.res - 10)) }));
    // the meadow bench
    const bp = 5, cw = m.cw, chh = cw * CARD_AR, gm = 6, totW = 4 * cw + 3 * gm, mx = (W - totW) / 2, tot = 2 * chh + 4, avail = m.mBot - m.mTop, my0 = m.mTop + Math.max(bp, (avail - tot) / 2);
    for (let s = 0; s < 8; s++) R.meadow.push({ i: s, x: mx + (s % 4) * (cw + gm), y: my0 + Math.floor(s / 4) * (chh + 4), w: cw, h: chh });
    R.bench = { x: mx - bp - 2, y: my0 - bp, w: totW + 2 * bp + 4, h: tot + 2 * bp };
    R.stream = { h: true, y: m.r3Y + m.r3 + (m.sg + 3) / 2 };
    R.path = []; rowsArr.forEach((row, k) => (k % 2 ? row.slice().reverse() : row).forEach(t => R.path.push({ x: t.x + t.w / 2, y: t.y + t.h / 2 })));
    R.scene = { x: 0, y: 0, w: W, h: m.sceneB }; R.tbl = { x: 0, y: m.sceneB, w: W, h: H - m.sceneB };
    R.city = { x: pad, y: m.cityY, w: W - 2 * pad, h: m.city }; R.hand = { x: pad, y: m.handY, w: W - 2 * pad, h: m.hand }; R.acts = { x: pad, y: m.actsY, w: W - 2 * pad, h: m.acts };
    R.slots = true; R.fan = true; R.col = col; if (col) R.hbar = { x: pad, y: m.barY, w: W - 2 * pad, h: m.bar };
    const cw0 = Math.max(10, Math.min(40, Math.floor((m.city - 6) / CARD_AR))), nSl = Math.max(15, nCity), stp = Math.min(cw0 + 2, (R.city.w - 10 - cw0 - 40) / (nSl - 1));
    R.fanDrop = tight ? 7 : 9;
    R.strip = { hand: fitStrip(nHand, R.hand.w - 22, R.hand.h - R.fanDrop - 3, 70), city: { cw: cw0, ch: Math.round(cw0 * CARD_AR), rows: 1, per: nSl, step: stp, x0: 5, n: nSl } };
  } else {
    const rail = Math.round(Math.max(236, Math.min(340, W * .32))), LW = W - rail - pad;
    const chipH = 34, actH = 44, resH = 30;
    const gp = Math.max(6, Math.round(LW * .012)), Lw = Math.round(LW * .40), tw = (Lw - 3 * g) / 4;
    const th = Math.min(tw * 1.3, (H - 3 * g - 8) / 4), ipw = Math.max(18, Math.min(34, Math.floor(Math.min(tw * .4, th * .46)))), psw = Math.round(Math.max(20, Math.min(30, th * .4)));
    const rowsArr = [[], [], []];
    for (let i = 0; i < 8; i++) rowsArr[Math.floor(i / 4)].push(tl('basic', i, (i % 4) * (tw + g), Math.floor(i / 4) * (th + g), tw, th, { ip: ipw, ps: psw }));
    const y2 = 2 * (th + g) + 6, rowB = r3.concat(sup);
    rowB.forEach((e, i) => { const t = tl(e[0], e[1], (i % 4) * (tw + g), y2 + Math.floor(i / 4) * (th + g), tw, th, { ip: ipw, ps: psw }); if (i < 4) rowsArr[2].push(t); });
    const x0 = Lw + gp * 2, Rw = LW - x0; let cw = Math.min((Rw - 3 * g * 2) / 4, 170);
    const evh = Math.max(40, Math.min(th * .9, 70));
    let ch = cw * CARD_AR; const maxch = (H - 2 * evh - 4 * g - 10) / 2; if (ch > maxch) { ch = maxch; cw = ch / CARD_AR; }
    const gm = Math.min(g * 3, (Rw - 4 * cw) / 3);
    const mx = x0 + (Rw - (4 * cw + 3 * gm)) / 2;
    for (let s = 0; s < 8; s++) R.meadow.push({ i: s, x: mx + (s % 4) * (cw + gm), y: Math.floor(s / 4) * (ch + g * 2), w: cw, h: ch });
    const ey = 2 * ch + g * 4 + 8, etw = (Rw - 3 * g) / 4;
    evs.forEach((e, i) => tl(e[0], e[1], x0 + (i % 4) * (etw + g), ey + Math.floor(i / 4) * (evh + g), etw, evh, { ip: 20, ps: 18 }));
    let mxy = 0; R.tiles.forEach(t => mxy = Math.max(mxy, t.y + t.h)); R.meadow.forEach(t => mxy = Math.max(mxy, t.y + t.h));
    const off = Math.max(0, Math.min(80, (H - mxy) / 2)); if (off > 1) { R.tiles.forEach(t => t.y += off); R.meadow.forEach(t => t.y += off); }
    // the rail
    const rx = LW + pad, rw = rail - pad - 2;
    R.chips = { x: rx, y: 3, w: rw, h: chipH };
    let yb = H - 2; R.acts = { x: rx, y: yb - actH, w: rw, h: actH }; yb -= actH + g;
    const left = yb - (chipH + g + resH + g + g), hh = Math.max(60, Math.min(left * .56, 260)), hc = Math.max(60, left - hh);
    R.res = { x: rx, y: chipH + g + 3, w: rw, h: resH };
    R.city = { x: rx, y: chipH + g + resH + g + 3, w: rw, h: hc };
    R.hand = { x: rx, y: R.city.y + hc + g, w: rw, h: yb - (R.city.y + hc + g) };
    R.strip = { hand: fitStrip(nHand, R.hand.w - 4, R.hand.h - 2, 74), city: fitStrip(nCity, R.city.w - 4, R.city.h - 2, 74) };
    R.scene = { x: 0, y: 0, w: rx - 2, h: H }; R.tbl = { x: rx - 2, y: 0, w: W - rx + 2, h: H };
    const bp = 6; R.bench = { x: mx - bp, y: R.meadow[0].y - bp, w: 4 * cw + 3 * gm + 2 * bp, h: 2 * ch + g * 2 + 2 * bp };
    R.stream = { h: false, x: Lw + gp };
    R.path = []; rowsArr.forEach((row, k) => (k % 2 ? row.slice().reverse() : row).forEach(t => R.path.push({ x: t.x + t.w / 2, y: t.y + t.h / 2 })));
  }
  return R;
}
// who stands where
function placements() {
  const out = [];
  G.players.forEach((p, s) => p.dep.forEach(pl => out.push({ s, pl })));
  if (G.grim) { const gr = G.grim; if (gr.bi >= 0) out.push({ s: 'G', pl: { k: 'basic', i: gr.bi } }); if (gr.fi >= 0) out.push({ s: 'G', pl: { k: 'forest', i: gr.fi } }); if (gr.ji >= 0) out.push({ s: 'G', pl: { k: 'journey', i: gr.ji } }); }
  return out;
}
function workersAt(kind, i) {
  const o = [];
  for (const { s, pl } of placements()) {
    if (kind === 'haven' && pl.k === 'haven') o.push(s);
    else if ((kind === 'basic' || kind === 'forest') && pl.k === kind && pl.i === i) o.push(s);
    else if (kind === 'journey' && pl.k === 'journey') o.push(s);
  }
  return o;
}
function wmoveKey(m) { return m.k + ':' + (m.k === 'dest' ? m.c : m.k === 'event' ? m.e + m.i : m.i == null ? '' : m.i); }
// legal worker moves of the human whose turn it is
function myMoves() {
  if (!G || G.phase === 'over') return [];
  const a = HB.actor(G), p = G.players[a];
  if (!p || p.ai || a !== viewSeat() || UI.cards.length) return [];
  if (UI.mmc && UI.mmc.k === G.logN + ':' + a) return UI.mmc.v;
  const v = movesFor(a); UI.mmc = { k: G.logN + ':' + a, v }; return v;
}
function tileInfo(kind, i) {
  switch (kind) {
    case 'basic': { const b = D.basic[i]; return { name: b.name, text: b.text, shared: b.shared, key: 'basic:' + i }; }
    case 'forest': { const f = D.forest[G.forest[i]]; return { name: f.name, text: f.text, shared: false, key: 'forest:' + i }; }
    case 'haven': return { name: D.haven.name, text: D.haven.text, shared: true, key: 'haven:' };
    case 'journey': return { name: D.journeyName, text: 'Autumn only. Discard 5, 4, 3 or 2 cards from your hand; that worker stays for the rest of the game and scores the same number of points.', shared: false, key: 'journey:' };
    case 'bev': { const e = D.basicEvents[G.bev[i].k]; return { name: e.name, text: e.text, key: 'event:b' + i }; }
    case 'sev': { const e = D.specialEvents[G.sev[i].k]; return { name: e.name, text: e.text, key: 'event:s' + i }; }
  }
  return {};
}
function tileFace(t, big) {
  const px = big ? 28 : (t.ip || 20); let f = h('div.face');
  const key = t.kind === 'basic' ? D.basic[t.i].key : t.kind === 'forest' ? D.forest[G.forest[t.i]].key : t.kind === 'bev' ? D.basicEvents[G.bev[t.i].k].key : t.kind === 'sev' ? D.specialEvents[G.sev[t.i].k].key : '';
  f.innerHTML = spotArt(t.kind, key, t.i);
  switch (t.kind) {
    case 'basic': f.appendChild(items(basicItems(t.i), px)); break;
    case 'forest': f.appendChild(items(FIC[D.forest[G.forest[t.i]].key] || [['any', '']], px)); break;
    case 'haven': f.appendChild(items([['haven', ''], ['any', '']], px)); break;
    case 'journey': f.appendChild(items([['road', ''], ['point', '2-5']], px)); break;
    case 'deck': f.appendChild(h('div.its', h('span.it', ic('deck', px), h('b', G.deck.length)))); break;
    case 'disc': f.appendChild(h('div.its', h('span.it', ic('discard', px), h('b', G.discard.length)))); break;
    case 'tree': { const s = G.players[Math.max(0, viewSeat() >= 0 ? viewSeat() : (G.phase === 'over' ? 0 : HB.actor(G)))]; f.appendChild(h('div.its', h('span.it', HBKit.season(SEAS[s ? s.season : 0], px + 4)))); break; }
    case 'bev': { const e = G.bev[t.i], dd = D.basicEvents[e.k], need = Object.keys(dd.need)[0]; const col = HBKit.TYPES[need] ? HBKit.TYPES[need].c : '#888'; f.style.setProperty('--ec', col); f.appendChild(h('div.its', h('span.it', ic('flag', px), h('b.bd', dd.pts)))); break; }
    case 'sev': { const e = G.sev[t.i], dd = D.specialEvents[e.k]; f.style.setProperty('--ec', '#7f5496'); f.appendChild(h('div.its', h('span.it', ic('star', px), h('b.bd', dd.pts ? dd.pts : '?')))); break; }
  }
  if (big) { const nm = t.kind === 'deck' ? 'Draw pile' : t.kind === 'disc' ? 'Discards' : t.kind === 'tree' ? 'Seasons' : (tileInfo(t.kind, t.i).name || ''); f.appendChild(h('div.nm', nm)); }
  return f;
}
// ---- targets: every tappable thing on the board has a key; a move belongs to exactly one key
function tgOf(m) {
  if (!m) return '';
  if (m.type === 'worker') {
    if (m.k === 'basic' || m.k === 'forest') return 'w:' + m.k + ':' + m.i;
    if (m.k === 'haven') return 'w:haven';
    if (m.k === 'journey') return 'w:journey';
    if (m.k === 'event') return 'w:' + (m.e === 'b' ? 'bev' : 'sev') + ':' + m.i;
    if (m.k === 'dest') return 'd:' + m.c;
  }
  if (m.type === 'play') return 'p:' + m.from + ':' + m.card;
  if (m.type === 'prepare') return 'prep';
  if (m.type === 'pass') return 'pass';
  if (m.type === 'choose') return 'q:' + m.i;
  return '';
}
function tileTg(kind, i) { return kind === 'basic' || kind === 'forest' ? 'w:' + kind + ':' + i : kind === 'haven' ? 'w:haven' : kind === 'journey' ? 'w:journey' : kind === 'bev' || kind === 'sev' ? 'w:' + kind + ':' + i : ''; }
// open destinations in rival cities that I may visit
function visitList() {
  const v = viewSeat(); if (v < 0) return [];
  return myMoves().filter(m => m.type === 'worker' && m.k === 'dest' && m.o !== v).map(m => ({ id: m.c, o: m.o }));
}
function frameRect(el) {
  const b = $('#board'); if (!el || !b) return null;
  const r = el.getBoundingClientRect(), br = b.getBoundingClientRect();
  return { x: r.left - br.left, y: r.top - br.top, w: r.width, h: r.height };
}
function wordsCap(s, n) { const w = String(s || '').replace(/\s*\([^)]*\)/g, '').replace(/[:?].*$/, '').trim().split(/\s+/); return w.slice(0, n || 8).join(' '); }
function posStripCard(box, fit, n, i) {
  const rowsUsed = Math.ceil(n / fit.per), row = Math.floor(i / fit.per), inRow = Math.min(fit.per, n - row * fit.per);
  const rowW = fit.cw + fit.step * (inRow - 1), x = (box.w - 4 - rowW) / 2 + 2 + (i % fit.per) * fit.step;
  const totH = rowsUsed * fit.ch + (rowsUsed - 1) * 2, y = Math.max(1, (box.h - totH) / 2) + row * (fit.ch + 2);
  return { x, y };
}
function placeBox(e, b) { e.style.cssText += `;left:${b.x}px;top:${b.y}px;width:${b.w}px;height:${b.h}px`; return e; }
function renderBoard() {
  const host = $('#board'), bd = $('#bd'); if (!host || !G) return;
  const W = host.clientWidth || 390, H = host.clientHeight || 470;
  const R = boardLayout(W, H); UI.lay = R;
  bd.innerHTML = ''; bd.style.width = W + 'px'; bd.style.height = H + 'px';
  bd.className = (R.tall ? 'tall ' : 'wide ') + (R.mode || '');
  UI.tgEls = {}; UI.cr = {}; UI.tiles = {};
  const mm = myMoves(), mine = mm.length > 0, v = viewSeat();
  const okw = new Set(mm.filter(m => m.type === 'worker').map(tgOf));
  const okp = new Set(mm.filter(m => m.type === 'play').map(tgOf));
  const qm = G.q && mine ? mm.filter(m => m.type === 'choose') : [];
  const qCard = new Map(); qm.forEach(m => { if (m.card !== undefined && !qCard.has(m.card)) qCard.set(m.card, m.i); });
  const qShown = new Set(), qLoc = new Map();
  if (qm.length) G.q.opts.forEach((o, i) => { let loc = o.d && o.d.loc; if (!loc && o.d && o.d.j != null && o.d.seat != null && G.players[o.d.seat] && (o.h === 'rangerTo' || o.h === 'recallGo')) loc = G.players[o.d.seat].dep[o.d.j]; const tg = loc ? tgOf(Object.assign({ type: 'worker' }, loc)) : ''; if (tg && !qLoc.has(tg)) qLoc.set(tg, i); });
  const big = !R.tall && R.tiles.some(t => t.kind === 'basic' && t.w >= 84 && t.h >= 70);
  bd.classList.toggle('big', big);
  if (UI.sel && (UI.sel.logN !== G.logN || !UI.sel.ms.every(m => mm.some(x => sameM(x, m))))) UI.sel = null;
  if (UI.cityOpen && UI.cityOpen.logN !== G.logN) UI.cityOpen = null;
  const ov = !!UI.cityOpen;
  const regTg = (tg, e) => { if (tg) { e.setAttribute('data-t', tg); e.setAttribute('data-a', 't'); UI.tgEls[tg] = e; } };
  bd.appendChild(sceneEls(R));
  // ---- places
  for (const t of R.tiles) {
    const info = tileInfo(t.kind, t.i), tg = tileTg(t.kind, t.i);
    const e = h('button.tile.t-' + t.kind, { 'data-zoom': 'tile:' + t.kind + ':' + t.i, 'data-k': t.kind, 'data-i': t.i, type: 'button', 'aria-label': info.name || (t.kind === 'deck' ? 'Draw pile' : t.kind === 'disc' ? 'Discard pile' : 'Seasons') });
    e.style.cssText = `left:${t.x}px;top:${t.y}px;width:${t.w}px;height:${t.h}px`;
    e.appendChild(tileFace(t, big));
    UI.tiles[t.kind + ':' + t.i] = { x: t.x, y: t.y, w: t.w, h: t.h };
    const legal = tg && okw.has(tg);
    if (legal) { e.classList.add('glow'); regTg(tg, e); }
    else if (tg && qLoc.has(tg)) { e.classList.add('glow'); regTg('q:' + qLoc.get(tg), e); qShown.add(qLoc.get(tg)); }
    else if (tg) { e.setAttribute('data-a', 't'); e.setAttribute('data-t', 'x:' + tg); if (mine) e.classList.add('no'); }
    if (UI.sel && UI.sel.tg === tg) e.classList.add('sel');
    if (t.kind === 'bev' || t.kind === 'sev') {
      const ev = (t.kind === 'bev' ? G.bev : G.sev)[t.i];
      if (ev.o !== -1 && ev.o != null) { e.classList.add('done'); e.appendChild(h('div.pw', pawn(ev.o, t.ps || 18))); }
    } else if (/basic|forest|haven|journey/.test(t.kind)) {
      const ws = workersAt(t.kind, t.i);
      if (ws.length) { const pw = h('div.pw'); ws.slice(0, 4).forEach(s => pw.appendChild(pawn(s, t.ps || 22))); e.appendChild(pw); if (!info.shared && t.kind !== 'journey' && t.kind !== 'haven') e.classList.add('taken'); }
    }
    bd.appendChild(e);
  }
  // ---- meadow
  const blocked = G.grim ? G.grim.mb : [];
  for (const m of R.meadow) {
    const id = G.meadow[m.i], e = h('button.mc', { type: 'button', 'aria-label': id >= 0 ? 'Meadow card: ' + cname(id) : 'Empty meadow space' });
    e.style.cssText = `left:${m.x}px;top:${m.y}px;width:${m.w}px;height:${m.h}px`;
    if (id >= 0) {
      e.setAttribute('data-zoom', 'card:' + id); e.setAttribute('data-id', id);
      e.appendChild(cardEl(id, Math.round(m.w)));
      UI.cr['m' + id] = { x: m.x, y: m.y, w: m.w, h: m.h };
      const ptg = 'p:meadow:' + id;
      if (okp.has(ptg)) { e.classList.add('glow'); regTg(ptg, e); }
      else if (qCard.has(id)) { e.classList.add('glow'); regTg('q:' + qCard.get(id), e); qShown.add(qCard.get(id)); }
      else { e.setAttribute('data-a', 't'); e.setAttribute('data-t', 'x:m' + id); }
      if (UI.sel && UI.sel.tg === ptg) e.classList.add('sel');
    } else e.classList.add('empty');
    if (blocked.indexOf(m.i) >= 0) { e.classList.add('blocked'); e.appendChild(h('span.lock', '⛔')); }
    bd.appendChild(e);
  }
  // ---- scores strip (tap = look at that player's city)
  { const c = placeBox(h('div.chips'), R.chips), n = G.np + (G.grim ? 1 : 0); c.setAttribute('data-n', n);
    for (let s = 0; s < G.np; s++) c.appendChild(chipEl(s, n));
    if (G.grim) c.appendChild(chipEl('G', n));
    bd.appendChild(c); }
  // ---- my city (and rival open destinations I may visit): a compact strip of 15 slots; a tap opens it full screen
  const fs = focusSeat(), me = G.players[fs], cityBox = R.city, vis = visitList();
  const cityList = me.city.map(e => ({ id: e.id, e, own: true })).concat(vis.map(x => ({ id: x.id, o: x.o })));
  // one glow rule for a city card, in the strip or in the full-screen view
  const cityCard = (b, it, live, plain) => {
    const tg = 'd:' + it.id;
    if (live && okw.has(tg)) { b.classList.add('glow'); regTg(tg, b); }
    else if (live && qLoc.has(tg)) { b.classList.add('glow'); regTg('q:' + qLoc.get(tg), b); qShown.add(qLoc.get(tg)); }
    else if (live && qCard.has(it.id)) { b.classList.add('glow'); regTg('q:' + qCard.get(it.id), b); qShown.add(qCard.get(it.id)); }
    else if (!plain) { b.setAttribute('data-a', 'city'); b.setAttribute('data-t', 'x:c' + it.id); }
  };
  if (R.col) {
    const hb = placeBox(h('button.handbar', { 'data-a': 'handtog', type: 'button', 'aria-label': 'Show my hand and city' }), R.hbar); bd.appendChild(hb);
    hb.appendChild(h('span', '\u25B4 Hand ' + (v >= 0 ? G.players[v].hand.length : 0) + '/8 \u00B7 City ' + me.city.length + '/15'));
  } else { const strip = placeBox(h('div.strip.city'), cityBox); bd.appendChild(strip);
    const fit = R.strip.city, n = cityList.length;
    if (R.slots) for (let i = 0; i < fit.n; i++) { const sl = h('i.slot'); sl.style.cssText = `left:${fit.x0 + i * fit.step}px;top:${Math.max(1, (cityBox.h - fit.ch) / 2)}px;width:${fit.cw}px;height:${fit.ch}px`; strip.appendChild(sl); }
    strip.appendChild(h('span.scount', (me.city.length) + '/15'));
    const open = h('button.cityopen', { 'data-a': 'city', type: 'button', 'aria-label': 'Open my city' }); placeBox(open, cityBox); open.appendChild(h('span.cx', { 'aria-hidden': 'true', html: '<svg viewBox="0 0 24 24"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" fill="none" stroke="currentColor" stroke-width="2.600" stroke-linecap="round" stroke-linejoin="round"/></svg>' })); bd.appendChild(open);
    cityList.forEach((it, i) => {
      const p = R.slots ? { x: fit.x0 + i * fit.step, y: Math.max(1, (cityBox.h - fit.ch) / 2) } : posStripCard(cityBox, fit, n, i);
      const b = h('button.sc', { 'data-zoom': 'card:' + it.id, 'data-id': it.id, type: 'button', 'aria-label': cname(it.id) }, cardEl(it.id, fit.cw, { entry: it.e }));
      if (it.o != null) b.appendChild(h('span.vb', pawn(it.o, 16)));
      b.style.cssText = `left:${cityBox.x + p.x}px;top:${cityBox.y + p.y}px;width:${fit.cw}px;height:${fit.ch}px;z-index:${i + 2}`;
      UI.cr['c' + it.id] = { x: cityBox.x + p.x, y: cityBox.y + p.y, w: fit.cw, h: fit.ch };
      cityCard(b, it, !ov, false);
      bd.appendChild(b);
    }); }
  // ---- my stock
  { const r = placeBox(h('div.resrow'), R.res), show = v >= 0 || watching();
    const rp = R.res.w < 300 ? 18 : R.res.w < 380 ? 19 : 22;
    for (const k of RESK) r.appendChild(h('span.rs', { 'data-res': k }, ic(k, rp), h('b', show ? me.res[k] : '?')));
    r.appendChild(h('span.rs.pt', { 'data-res': 'point' }, ic('point', rp), h('b', me.pts)));
    r.appendChild(h('span.rs.wk', { 'data-res': 'worker' }, pawn(fs, rp - 2), h('b', availW(me) + '/' + me.workers)));
    bd.appendChild(r); }
  // ---- my hand (a fan at the bottom)
  if (!R.col) { const handBox = R.hand, strip = placeBox(h('div.strip.hand'), handBox); bd.appendChild(strip);
    const hand = v >= 0 ? G.players[v].hand : [], fit = R.strip.hand, n = hand.length;
    strip.appendChild(R.tall && v >= 0 ? h('button.scount.htog', { 'data-a': 'handtog', type: 'button', 'aria-label': 'Hide my hand' }, '\u25BE ' + n + '/8') : h('span.scount', v >= 0 ? n + '/8' : ''));
    if (v < 0) strip.appendChild(h('span.sempty', { 'aria-hidden': 'true', html: ICO.card }));
    else if (!n) strip.appendChild(h('span.sempty', { 'aria-hidden': 'true', html: ICO.card }));
    // readable chips in a sideways-scrolling row: picture thumbnail + name + cost + points (tap = zoom)
    const vert = handBox.h >= 150, chH = vert ? 56 : Math.max(46, handBox.h - 4), thW = Math.min(40, Math.floor((chH - 6) / 1.406)), chW = vert ? handBox.w - 8 : thW + 160, x0 = vert ? 4 : 40, gapc = 4;
    const hs = placeBox(h('div.hscroll'), handBox), hin = h('div.hin'); hin.style.cssText = vert ? `width:${handBox.w}px;height:${n * (chH + gapc) + 22}px` : `width:${x0 + n * (chW + gapc) + 2}px;height:${handBox.h}px`; if (vert) hs.classList.add('vert'); hs.appendChild(hin); bd.appendChild(hs);
    hand.forEach((id, i) => {
      const tg = 'p:hand:' + id, sp = spec(id);
      const b = h('button.sc.hc', { 'data-zoom': 'card:' + id, 'data-id': id, type: 'button', 'aria-label': cname(id) });
      const th = cardEl(id, thW); th.classList.add('hct'); b.appendChild(th);
      b.appendChild(h('span.hcx', h('b.hcn', sp.name), h('span.hcr', costEl(sp.cost, 14), h('span.hcp', ic('point', 13), h('b', sp.points || 0)))));
      const left = vert ? x0 : x0 + i * (chW + gapc), top = vert ? 20 + i * (chH + gapc) : 2;
      b.style.cssText += `;left:${left}px;top:${top}px;width:${chW}px;height:${chH}px;z-index:${i + 2}`;
      UI.cr['h' + id] = { x: handBox.x + left, y: handBox.y + top, w: chW, h: chH };
      if (okp.has(tg)) { b.classList.add('glow'); regTg(tg, b); }
      else if (qCard.has(id)) { b.classList.add('glow'); regTg('q:' + qCard.get(id), b); qShown.add(qCard.get(id)); }
      else { b.setAttribute('data-a', 't'); b.setAttribute('data-t', 'x:h' + id); }
      if (UI.sel && UI.sel.tg === tg) b.classList.add('sel');
      hin.appendChild(b);
    });
    hs.addEventListener('scroll', () => { UI.hsx = hs.scrollLeft; UI.hsy = hs.scrollTop; }, { passive: true }); hs.scrollLeft = UI.hsx || 0; hs.scrollTop = UI.hsy || 0;
    { const g = (UI.rec && UI.rec.m && UI.tgEls && UI.tgEls[tgOf(UI.rec.m)]) || hin.querySelector('.glow'); if (g && g.closest('.hscroll') === hs) hscrollTo(g); } }
  // ---- action row / tray
  renderActs(mm, qm, qShown);
  if (UI.sel) bd.querySelectorAll('.glow:not(.tchip)').forEach(e => e.classList.remove('glow'));
  if (ov) { bd.querySelectorAll('.glow:not(.tchip)').forEach(e => e.classList.remove('glow')); cityOverlay(me, cityList, cityCard); }
  renderPrompt();
  renderBar();
  placeFinger();
  if (typeof hlpMarks === 'function' && G.phase !== 'over') hlpMarks();
}
// the whole city, full screen: 15 slots in a grid. Usable destinations glow here just as in the strip; tap outside to close.
function cityOverlay(me, list, cityCard) {
  const bd = $('#bd'), W = UI.lay.W, H = UI.lay.H, o = h('div#cityov', { role: 'dialog', 'aria-label': 'My city' });
  o.appendChild(h('div.cvscrim', { 'data-a': 'cityx' }));
  const nSl = Math.max(15, list.length), cols = 5, rows = Math.ceil(nSl / cols), gp = 6, top = 46;
  const cw = Math.max(40, Math.min(112, Math.floor(Math.min((W - 24 - (cols - 1) * gp) / cols, (H - top - 70 - (rows - 1) * gp) / rows / CARD_AR)))), ch = Math.round(cw * CARD_AR);
  const pn = h('div.cvpanel', { 'data-a': 'noop' }); o.appendChild(pn);
  pn.appendChild(h('div.cvhead', h('b', 'My city'), h('span', me.city.length + '/15')));
  const grid = h('div.cvgrid'); grid.style.cssText = `grid-template-columns:repeat(${cols},${cw}px);gap:${gp}px`;
  for (let i = 0; i < nSl; i++) {
    const it = list[i], cell = h('div.cvcell'); cell.style.cssText = `width:${cw}px;height:${ch}px`;
    if (it) {
      const b = h('button.cvc', { 'data-zoom': 'card:' + it.id, 'data-id': it.id, type: 'button', 'aria-label': cname(it.id) }, cardEl(it.id, cw, { entry: it.e }));
      b.style.cssText = `width:${cw}px;height:${ch}px`;
      if (it.o != null) b.appendChild(h('span.vb', pawn(it.o, 18)));
      cityCard(b, it, true, true); cell.appendChild(b);
    }
    grid.appendChild(cell);
  }
  pn.appendChild(grid);
  pn.appendChild(h('button.btn.cvx', { 'data-a': 'cityx', type: 'button', 'aria-label': 'Close my city' }, 'Done'));
  bd.appendChild(o);
}
const isPh = () => document.documentElement.classList.contains('ph');
function focusSeat() { const v = viewSeat(); if (v >= 0) return v; if (UI.focus != null && UI.focus < G.np) return UI.focus; return Math.max(0, G.phase === 'over' ? 0 : Math.min(G.np - 1, G.cur)); }
function chipEl(s, n) {
  const grim = s === 'G', p = grim ? null : G.players[s];
  const pts = grim ? HB.grimScore(G).total : score(s).total;
  const cards = grim ? G.grim.city.length : HB.cityCount(G, s);
  const turn = G.phase !== 'over' && !grim && HB.actor(G) === s;
  const e = h('button.chip' + (turn ? '.turn' : '') + (s === viewSeat() ? '.me' : ''), { 'data-a': 'chip', 'data-seat': s, type: 'button', 'aria-label': pname(s) + ': ' + pts + ' points, ' + cards + ' cards in city' + (grim ? '' : ', ' + availW(p) + ' workers free') });
  e.style.borderColor = pcolor(s).c;
  const nm = pname(s), short = n >= 4 ? '' : n === 3 ? nm.slice(0, 5) : nm.slice(0, 8);
  e.appendChild(h('span.cn', pawn(s, 18), short ? h('b', short) : null, p && p.passed ? h('i', 'out') : null, p ? h('span.cs', HBKit.season(SEAS[p.season], 16)) : null));
  e.appendChild(h('span.cl', h('span.cp', '★' + pts), h('span', '▢' + cards), (p && n <= 3) ? h('span', '⚑' + availW(p)) : null));
  return e;
}
// ---- action row: Prepare / Pass / Undo, or (when something needs choosing) the choices as chips
function trayChip(m, i, tg) {
  let inner;
  if (m.type === 'play') {
    const c = cdef(m.card);
    if (m.how === 'pay') inner = [costEl(c.cost, 20)];
    else if (m.how === 'occupy') inner = [h('b', 'free'), cardEl(m.via, 26)];
    else inner = [h('b', ({ innkeeper: 'Inn −3', crane: 'Crane −3', dungeon: 'Cells −3', judge: 'Swap' })[m.how] || 'Play'), m.via != null ? cardEl(m.via, 26) : null];
  } else if (m.type === 'worker' && m.k === 'journey') inner = [ic('road', 22), h('b', D.journey[m.i].points)];
  else if (m.type === 'choose') {
    if (m.card !== undefined) inner = [cardEl(m.card, UI.trayCw || 44)];
    else if (m.res !== undefined) inner = [ic(m.res, 26)];
    else inner = [h('b', wordsCap(m.label, 6) || 'OK')];
  } else inner = [h('b', wordsCap(m.label, 5))];
  const b = h('button.tchip.glow' + (m.type === 'choose' && m.card !== undefined ? '.tcard' : ''), { 'data-a': 'tm', 'data-mi': i, type: 'button', title: m.label || '' }, inner);
  if (m.label) b.setAttribute('aria-label', m.label);
  UI.tgEls[tg] = b; return b;
}
function renderActs(mm, qm, qShown) {
  const R = UI.lay; if (!R || !G) return;
  const old = $('#acts'); if (old) old.remove();
  const box = R.acts, a = placeBox(h('div#acts'), box); $('#bd').appendChild(a);
  if (G.phase === 'over') return;
  mm = mm || myMoves(); qm = qm || []; qShown = qShown || new Set();
  const act = HB.actor(G), p = G.players[act], mine = mm.length > 0;
  // choices (a question, or a card / place with several ways to use it)
  let chips = [];
  UI.tm2 = [];
  // many card choices: shrink the cards until every one fits above the buttons (no scrolling inside the tray)
  { const trayMs = UI.sel ? UI.sel.ms : qm.filter(m => !qShown.has(m.i)), nc = trayMs.filter(m => m.type === 'choose' && m.card !== undefined).length; UI.trayCw = 44;
    if (nc && trayMs.length > 5) { const availH = Math.max(120, Math.min(R.H * .6, box.y + box.h - 120)); for (const c of [44, 38, 34, 30, 26, 22]) { const per = Math.max(1, Math.floor((box.w - 8) / (c + 12 + 6))), rows = Math.ceil(trayMs.length / per); UI.trayCw = c; if (rows * (Math.round(c * CARD_AR) + 14) + 10 <= availH) break; } } }
  if (UI.sel) UI.sel.ms.forEach(m => { const i = UI.tm2.push(m) - 1; chips.push(trayChip(m, i, 'o:' + i)); });
  else if (qm.length) qm.forEach(m => { if (!qShown.has(m.i)) { const i = UI.tm2.push(m) - 1; chips.push(trayChip(m, i, 'q:' + m.i)); } });
  if (chips.length) {
    a.classList.add('tray');
    const nCards = chips.filter(c => c.classList.contains('tcard')).length, hasCard = nCards > 0, many = chips.length > 3 && !hasCard && qShown.size === 0;
    if (hasCard || many) {
      let rows;
      if (hasCard) { const per = Math.max(1, Math.floor((box.w - 8) / (UI.trayCw + 12 + 6))); rows = Math.ceil(chips.length / per); } else rows = Math.min(3, Math.ceil(chips.length * 92 / Math.max(120, box.w)));
      const hh = hasCard ? rows * (Math.round(UI.trayCw * CARD_AR) + 14) + 10 : Math.max(box.h, rows * 50 + 6);
      a.style.top = (box.y + box.h - hh) + 'px'; a.style.height = hh + 'px'; a.classList.add('tall', 'wrap');
    }
    chips.forEach(c => a.appendChild(c));
    if (UI.sel) a.appendChild(h('button.tchip.tx', { 'data-a': 'selx', type: 'button', 'aria-label': 'Cancel' }, '×'));
    return;
  }
  if (!mine && !(GX.undo.can())) { return; }
  const prep = mm.find(m => m.type === 'prepare'), pass = mm.find(m => m.type === 'pass');
  if (GX.undo.can() && !(NET.on)) a.appendChild(h('button.btn.alt.undo', { 'data-a': 'undo', type: 'button', 'aria-label': 'Undo my last step' }, '↶'));
  if (mine) {
    if (prep) { const e = h('button.btn.prep.glow', { type: 'button', 'aria-label': 'Prepare for ' + SEASN[p.season + 1] }, HBKit.season(SEAS[p.season + 1], 22), h('span', 'Prepare')); UI.tgEls.prep = e; e.setAttribute('data-a', 't'); e.setAttribute('data-t', 'prep'); a.appendChild(e); }
    else a.appendChild(h('button.btn.prep.dis', { type: 'button', disabled: true, 'aria-label': 'Prepare (workers still out)' }, HBKit.season(SEAS[Math.min(3, p.season + 1)], 22), h('span', 'Prepare')));
    if (pass) { const armed = UI.passArm && Date.now() - UI.passArm < 2600; const e = h('button.btn.pass' + (armed ? '.armed' : ''), { type: 'button' }, armed ? 'Sure?' : 'Pass'); UI.tgEls.pass = e; e.setAttribute('data-a', 't'); e.setAttribute('data-t', 'pass'); a.appendChild(e); }
  }
}
function renderPrompt() {
  const pr = $('#prompt'); if (!pr || !G) return;
  pr.textContent = promptText();
  pr.classList.toggle('mine', !!(G.phase !== 'over' && !G.players[HB.actor(G)].ai && (!NET.on || HB.actor(G) === viewSeat())));
}
function renderBar() { }
function renderDock() { renderPrompt(); }
function placePrompt() { }
function promptText() {
  if (!G) return '';
  if (G.phase === 'over') return 'Game over.';
  const a = HB.actor(G), p = G.players[a];
  if (UI.cards.length) return '';
  if (NET.on && !p.ai && a !== viewSeat()) return p.name + ' is deciding…';
  if (hotSeat() && UI.holder !== a && !p.ai) return 'Pass the device to ' + p.name + '.';
  if (p.ai) return p.name + ' is playing…';
  if (G.q) return qShort(G.q);
  const n = availW(p);
  const pre = hotSeat() || humans().length > 1 ? p.name + ': ' : 'Your turn: ';
  return pre + (n > 0 ? 'tap a glowing spot.' : 'play a card, Prepare or Pass.');
}
// the short line for a pending decision (8 words at most; the long wording stays in the log)
function qShort(q) {
  const m = ({ discard: 'Tap cards to discard, then Done.', resource: 'Pick a resource.', meadow: 'Tap a meadow card.', production: 'Tap a card to activate next.', ruins: 'Tap a building to raze.', recipient: 'Pick a rival.', give: 'Pick what to give.', stack: 'How many to place?', trigger: 'Tap the effect to resolve first.', queen: 'Tap a card to play free.', inn: 'Tap a meadow card to play.', university: 'Tap a card to disband.', cemetery: 'Tap a card, or choose.', copy: 'Pick a place to copy.', prisoner: 'Tap a critter to lock up.', clear: 'Tap a meadow card to clear.', recall: 'Tap a worker to recall.', ranger: 'Pick a worker or a place.', tuck: 'Tap a critter to tuck.', cityDisc: 'Tap a city card to discard.', banish: 'Tap a card to remove.', teach: 'Tap the card to keep.', pigeon: 'Play a revealed card?', waive: 'Choose what to cut.', judge: 'Choose which resource to swap.', spend: 'Spend for point tokens?', trade: 'Trade resources?', bazaar: 'Play one for 1 less?', scroll: 'Keep it or tuck it?', clock: 'Repeat a place?', mole: 'Pick a card to mimic.', chip: 'Pick a card to re-run.', stock: 'Pick a stack to add.' })[q.kind];
  return m || wordsCap(q.title, 8);
}
