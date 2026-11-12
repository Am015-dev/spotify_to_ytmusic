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
    const cw0 = Math.max(24, Math.min(40, Math.floor((m.city - 6) / CARD_AR))), nSl = Math.max(15, nCity), stp = Math.min(cw0 + 2, (R.city.w - 10 - cw0 - 40) / (nSl - 1));
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
    case 'journey': return { name: D.journeyName, text: 'Autumn only. Discard 5, 4, 3 or 2 cards. The worker stays and scores that many points.', shared: false, key: 'journey:' };
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
    case 'sev': { const e = G.sev[t.i], dd = D.specialEvents[e.k]; f.style.setProperty('--ec', '#7f5496'); f.appendChild(h('div.its', h('span.it', ic('star', px), h('b.bd', dd.pts ? dd.pts : '★')))); break; }
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
// ---- the newcomer guide (R35): in a guided or vs game the ghost finger shows by default (off only when the player turned hints off),
// and on a plain turn only the 1-3 best places or cards glow; every other legal place still answers a tap, it just does not shine
function guideOn() {
  if (!G || G.phase === 'over' || (UI.cfg && UI.cfg.tutorial) || UI.camp || NET.on) return false;
  if (UI.mode === 'guided') return true;
  if (UI.mode !== 'vs' && UI.mode !== 'solo') return false;
  try { return localStorage.getItem('hb_hints') !== '0'; } catch (e) { return true; }
}
function guideTop() {
  const seat = viewSeat(), key = G.logN + ':' + G.turn + ':' + seat;
  if (UI.gtop && UI.gtop.k === key) return UI.gtop.v;
  const top = new Set(); let r = [];
  try { computeRec(true); if (UI.rec && UI.rec.m) { const t = tgOf(UI.rec.m); if (/^(w:|p:|d:)/.test(t)) top.add(t); } } catch (e) { }
  try { r = HB.AI.rank(G, seat).filter(x => x.m.type === 'worker' || x.m.type === 'play').sort((a, b) => b.v - a.v); } catch (e) { r = []; }
  const best = r.length ? r[0].v : 0;
  for (const x of r) { if (top.size >= 3) break; if (top.size && x.v < best - 1.5) break; top.add(tgOf(x.m)); }   // only places close to the best one shine
  UI.gtop = { k: key, v: top }; return top;
}
function guideTrim(myNow) {
  if (!myNow || !guideOn()) return;
  const top = new Set(guideTop()); if (!top.size) return;
  if (UI.rec && UI.rec.m) top.add(tgOf(UI.rec.m));   // the finger's target always shines
  for (const tg in UI.tgEls) { if (!/^(w:|p:|d:)/.test(tg)) continue; const e = UI.tgEls[tg];
    if (top.has(tg)) continue;
    if (e.classList.contains('glow')) { e.classList.remove('glow'); e.classList.add('cango'); } }
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
  if (PV_ON) { const r = pvRender(); try { fitNames(); } catch (e) { } return r; }   // W457 Play view (below); ?board=old keeps this board; G8: names fit
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
    if (kind === 'haven' || (kind === 'forest' && PV_SPECIAL[D.forest[G.forest[i]].key])) e.classList.add('pv-spec');   // board plate: the short name only; long-press tells the rest
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
    hb.appendChild(h('span', '\u25B4 Hand ' + (v >= 0 ? G.players[v].hand.length : 0) + '/8 \u00B7 City ' + HB.cityCount(G, fs) + '/15'));
  } else { const strip = placeBox(h('div.strip.city'), cityBox); bd.appendChild(strip);
    const fit = R.strip.city, n = cityList.length;
    if (R.slots) for (let i = 0; i < fit.n; i++) { const sl = h('i.slot'); sl.style.cssText = `left:${fit.x0 + i * fit.step}px;top:${Math.max(1, (cityBox.h - fit.ch) / 2)}px;width:${fit.cw}px;height:${fit.ch}px`; strip.appendChild(sl); }
    strip.appendChild(h('span.scount', { 'data-a': 'city' }, HB.cityCount(G, fs) + '/15'));
    const open = h('button.cityopen', { 'data-a': 'city', type: 'button', 'aria-label': 'Open my city' }); placeBox(open, cityBox); if (R.slots) { open.style.left = (cityBox.x + cityBox.w - 48) + 'px'; open.style.width = '48px'; } open.appendChild(h('span.cx', { 'aria-hidden': 'true', html: '<svg viewBox="0 0 24 24"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" fill="none" stroke="currentColor" stroke-width="2.600" stroke-linecap="round" stroke-linejoin="round"/></svg>' })); bd.appendChild(open);
    // target size: every city card keeps >= 24 css px of its own width uncovered (WCAG 2.2 target-size), even when the 15 slots are tighter
    const cStep = R.slots && n > 1 ? Math.max(fit.step, Math.min(24, (cityBox.w - fit.x0 - fit.cw - 40) / (n - 1))) : fit.step;
    cityList.forEach((it, i) => {
      const p = R.slots ? { x: fit.x0 + i * cStep, y: Math.max(1, (cityBox.h - fit.ch) / 2) } : posStripCard(cityBox, fit, n, i);
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
    const vert = handBox.h >= 150, chH = vert ? 56 : Math.max(46, handBox.h - 4), thW = Math.min(40, Math.floor((chH - 6) / 1.406)), x0 = vert ? 4 : 56, gapc = 4; let chW = vert ? handBox.w - 8 : thW + 160; if (!vert && n * (chW + gapc) + x0 > handBox.w) { const k = Math.max(1, Math.floor((handBox.w - x0) / (chW + gapc))); chW = Math.max(thW + 96, Math.floor((handBox.w - x0) / k) - gapc); }   // whole cards only: the last visible card is never cut by the scroller edge
    const hs = placeBox(h('div.hscroll'), handBox), hin = h('div.hin'); hin.style.cssText = vert ? `width:${handBox.w}px;height:${n * (chH + gapc) + 32}px` : `width:${x0 + n * (chW + gapc) + 2}px;height:${handBox.h}px`; if (vert) hs.classList.add('vert'); hs.appendChild(hin); bd.appendChild(hs);
    hand.forEach((id, i) => {
      const tg = 'p:hand:' + id, sp = spec(id);
      const b = h('button.sc.hc', { 'data-zoom': 'card:' + id, 'data-id': id, type: 'button', 'aria-label': cname(id) });
      const th = cardEl(id, thW); th.classList.add('hct'); b.appendChild(th);
      b.appendChild(h('span.hcx', h('b.hcn', sp.name), h('span.hcr', costEl(sp.cost, 14), h('span.hcp', ic('point', 13), h('b', sp.points || 0)))));
      const left = vert ? x0 : x0 + i * (chW + gapc), top = vert ? 30 + i * (chH + gapc) : 2;
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
  // R17: a choice tray that grows up over the hand: the hand steps out and the panel above takes its room, so the tray never covers a city row
  { const ae = document.getElementById('acts'); if (tall && ae && ae.classList.contains('tall')) { const top = parseFloat(ae.style.top); if (top > 0) { hs.style.display = 'none'; col.style.height = Math.max(200, top - 4) + 'px'; } } }
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
  pn.appendChild(h('div.cvhead', h('b', 'My city'), h('span', HB.cityCount(G, G.players.indexOf(me)) + '/15')));
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
  e.appendChild(h('span.cl', h('span.cp', '★' + pts + (!grim && G.players.length > 1 && pts > 0 && G.players.every((q, i) => i === s || score(i).total < pts) ? ' ♛' : '')), h('span', '▢' + cards), (p && n <= 3) ? h('span', '⚑' + availW(p)) : null));
  return e;
}
// a choice of which effect goes first: each option names the card and says in one line what it does
const effQ = () => !!(G && G.q && (G.q.kind === 'trigger' || G.q.kind === 'production'));
function effLine(id) { const w = String(cdef(id).text || '').replace(/\s*\([^)]*\)/g, '').split(/\s+/); return w.length > 10 ? w.slice(0, 9).join(' ') + '…' : w.join(' '); }
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
    if (m.card !== undefined && effQ()) inner = [h('b', cname(m.card)), h('span.eff', effLine(m.card))];
    else if (m.card !== undefined) inner = [cardEl(m.card, UI.trayCw || 44)];
    else if (m.res !== undefined) inner = [ic(m.res, 24), h('b', m.label ? chipText(m.label) : rname(m.res, 1))];
    else inner = [h('b', chipText(m.label) || 'OK')];
  } else inner = [h('b', chipText(m.label))];
  const b = h('button.tchip.glow' + (m.type === 'choose' && m.card !== undefined ? (effQ() ? '.teff' : '.tcard') : ''), { 'data-a': 'tm', 'data-mi': i, type: 'button', title: m.label || '' }, inner);
  if (m.label) b.setAttribute('aria-label', m.label);
  UI.tgEls[tg] = b; return b;
}
function renderActs(mm, qm, qShown) {
  const R = UI.lay; if (!R || !G) return;
  const old = $('#acts'); if (old) old.remove();
  const box = R.acts, a = placeBox(h('div#acts'), box); $('#bd').appendChild(a);
  if (G.phase === 'over') {   // R24: after "Look at the board" the result is always one tap away
    if (!UI.cards.length && !(UI.cfg && UI.cfg.tutorial)) { a.appendChild(h('button.btn.prep.glow', { 'data-a': 'reresult', type: 'button' }, h('span', 'See the result'))); if (!NET.on && !campOn()) a.appendChild(h('button.btn.pass', { 'data-a': 'again', type: 'button' }, h('span', 'Play again'))); }
    return; }
  mm = mm || myMoves(); qm = qm || []; qShown = qShown || new Set();
  const act = HB.actor(G), p = G.players[act], mine = mm.length > 0;
  // choices (a question, or a card / place with several ways to use it)
  let chips = [];
  UI.tm2 = [];
  // many card choices: shrink the cards until every one fits above the buttons (no scrolling inside the tray)
  { const trayMs = UI.sel ? UI.sel.ms : qm.filter(m => !qShown.has(m.i)), nc = trayMs.filter(m => m.type === 'choose' && m.card !== undefined).length; UI.trayCw = 44;
    if (nc && trayMs.length > 5) { const availH = Math.max(120, Math.min(R.H * .6, box.y + box.h - 120)); for (const c of [44, 38, 34, 30, 26, 22]) { const per = Math.max(1, Math.floor((box.w - 8) / (c + 12 + 6))), rows = Math.ceil(trayMs.length / per); UI.trayCw = c; if (rows * (Math.round(c * CARD_AR) + 14) + 10 <= availH) break; } } }
  if (UI.sel) UI.sel.ms.forEach(m => { const i = UI.tm2.push(m) - 1; chips.push(trayChip(m, i, 'o:' + i)); });
  else if (qm.length) { const eff = effQ(); qm.forEach(m => { if (eff || !qShown.has(m.i)) { const i = UI.tm2.push(m) - 1; chips.push(trayChip(m, i, 'q:' + m.i)); } }); }   // order-of-effects choices always list what each effect does
  if (chips.length) {
    a.classList.add('tray');
    const nCards = chips.filter(c => c.classList.contains('tcard')).length, hasCard = nCards > 0, many = chips.length > 3 && !hasCard && qShown.size === 0;
    if (hasCard || many) {
      let rows;
      if (hasCard) { const per = Math.max(1, Math.floor((box.w - 8) / (UI.trayCw + 12 + 6))); rows = Math.ceil(chips.length / per); } else rows = Math.min(4, Math.ceil(chips.length * 150 / Math.max(120, box.w)));   // G8: chips carry words now
      const hh = hasCard ? rows * (Math.round(UI.trayCw * CARD_AR) + 14) + 10 : Math.max(box.h, rows * 50 + 6);
      a.style.top = (box.y + box.h - hh) + 'px'; a.style.height = hh + 'px'; a.classList.add('tall', 'wrap');
    }
    chips.forEach(c => a.appendChild(c));
    if (a.classList.contains('wrap') && !hasCard && a.scrollHeight > a.clientHeight + 1) { const hh2 = a.scrollHeight + 6; a.style.top = (box.y + box.h - hh2) + 'px'; a.style.height = hh2 + 'px'; }   // G8: grow to fit every choice
    if (UI.sel) a.appendChild(h('button.tchip.tx', { 'data-a': 'selx', type: 'button', 'aria-label': 'Cancel' }, '×'));
    return;
  }
  if (!mine && !(GX.undo.can())) { return; }
  const prep = mm.find(m => m.type === 'prepare'), pass = mm.find(m => m.type === 'pass');
  if (GX.undo.can() && !(NET.on)) a.appendChild(h('button.btn.alt.undo', { 'data-a': 'undo', type: 'button', 'aria-label': 'Undo my last step' }, '↶'));
  if (mine) {
    if (prep) { const e = h('button.btn.prep.glow', { type: 'button', 'aria-label': 'Prepare for ' + SEASN[p.season + 1] }, seasonIcon(p.season + 1, 26), h('span', 'Prepare')); UI.tgEls.prep = e; e.setAttribute('data-a', 't'); e.setAttribute('data-t', 'prep'); a.appendChild(e); }
    else if (p.season < 3) { const n = availW(p); a.appendChild(h('button.btn.prep.dis', { type: 'button', disabled: true, 'aria-label': 'Prepare after your last worker' }, seasonIcon(p.season + 1, 26), h('span.prepw', n > 0 ? [h('b', 'Prepare'), h('small', n + ' worker' + (n > 1 ? 's' : '') + ' left')] : 'Prepare'))); }   // says why it is off
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
  if (p.ai) return UI.aiCap || p.name + ' is playing…';
  if (G.q) return qShort(G.q);
  const n = availW(p);
  if (isPh() && !hotSeat() && humans().length <= 1) return n > 0 ? 'Place a worker' : p.season < 3 ? 'Build or Prepare' : 'Build or Pass';   // phone: one short line (Pass only in Autumn)
  const pre = hotSeat() || humans().length > 1 ? p.name + ': ' : 'Your turn: ';
  const last = p.season < 3 ? 'Prepare' : 'Pass';
  return pre + (n > 0 ? (PV_ON ? 'place a worker.' : 'tap a glowing spot.') : (PV_ON ? 'build or ' + last + '.' : 'play a card or ' + last + '.'));
}
// the line for a pending decision: plain, whole, 12 words at most (wraps to 2 lines in the bar; the long wording stays in the log)
function qShort(q) {
  if (q.kind === 'discard') { const d = q.opts[0] && q.opts[0].d, c = (d && d.count) || 0, mx = d && d.max; if (c || (mx && mx < 9)) { const mn = (d && d.min) || 0, ex = mn && mn === mx; return c + (mx && mx < 9 ? ' of ' + mx : '') + ' discarded. ' + (ex ? 'Tap ' + (mx - c) + ' more.' : c >= mn ? 'Tap more, or Done.' : 'Tap ' + (mn - c) + ' more.'); } }   // a running count before Done
  const m = ({ discard: 'Tap cards to discard, then tap Done.', resource: 'Pick the resource you want to gain.', meadow: 'Tap a meadow card to take it.', production: 'Pick which green card works next.', ruins: 'Raze a building for its cost back.', recipient: 'Pick the rival who gets it.', give: 'Pick what to give away.', stack: 'Pick how many to put here.', trigger: 'Pick which effect goes first.', queen: 'Play a card worth up to 3 free.', inn: 'Play a meadow card 3 cheaper.', university: 'Remove a card for its cost back.', cemetery: 'Reveal 4 from the deck or discards?', copy: 'Tap a place to copy its reward.', prisoner: 'Tap a critter to lock in the cells.', clear: 'Tap a meadow card to clear away.', recall: 'Tap a worker to bring back to you.', ranger: 'Pick a worker, then where it goes.', tuck: 'Tuck a critter under the goal.', cityDisc: 'Tap a city card to discard.', banish: 'Tap a card to remove from the game.', teach: 'Keep one; your rival gets the other.', pigeon: 'Play a shown card free, or skip.', waive: 'Pick resources to leave off the cost.', judge: 'Pick a resource in the cost to swap.', spend: 'Spend goods for tokens, or stop.', trade: 'Trade up to 2 goods for any 2.', bazaar: 'Play one card you took for 1 less?', scroll: 'Keep it, or tuck it for 1 point?', clock: 'Belfry: repeat a place, or skip.', mole: 'Pick a rival green card to copy.', chip: 'Pick a green card to run again.', stock: 'Pick a stack for the cellar.' })[q.kind];
  const n = qLeft(q), t = m || wordsCap(q.title, 12);
  return n > 1 ? t.replace(/[.?]$/, '') + ': ' + n + ' left.' : t;
}
// a choice button: say plainly what it does, short enough to fit (no cut words)
function chipText(label) {
  let s = String(label || '');
  let m;
  if ((m = s.match(/^Do not use /))) return 'Skip: repeat nothing';
  if ((m = s.match(/^Spend a token: repeat (.*)$/))) s = 'Repeat ' + m[1];
  if ((m = s.match(/^Give 1 berry to (\S+) and take 2 point tokens/))) return 'Give ' + m[1] + ' a berry: +2 tokens';
  if ((m = s.match(/^Prepare for (\w+)/))) return 'Prepare for ' + m[1];
  if ((m = s.match(/^Trade away (.*)$/))) return 'Give ' + m[1];
  if ((m = s.match(/^Pass \(/))) return 'Pass: done for the game';
  if ((m = s.match(/^Tuck (.*) beneath the event \((\d) points?\)/))) return 'Tuck ' + m[1] + ': +' + m[2] + ' points';
  if ((m = s.match(/^Tuck it beneath the event/))) return 'Tuck it: +1 point';
  s = s.replace(/\s*\([^)]*\)/g, '').replace(/\s+-\s.*$/, '').replace(/:\s.*$/, '').replace(/\?$/, '').trim();
  const w = s.split(/\s+/); return w.length > 8 ? w.slice(0, 7).join(' ') + '…' : s;
}
// a special goal's real points: a fixed number, or "2 per twig, up to 6"
function sevPts(dd) {
  const s = dd.score, up = (String(dd.text || '').match(/up to (\d)/) || [])[1];
  const cap = (per, txt) => per + ' per ' + txt + (up ? ', up to ' + per * up : '');
  if (!s) return dd.key === 'grand_market' || /point tokens/.test(dd.text || '') ? '2 tokens per good, up to 6' : (dd.pts ? dd.pts + ' points' : 'see card');
  if (s.flat != null) return s.flat + ' points';
  if (s.per_twig_on_event) return cap(s.per_twig_on_event, 'twig');
  if (s.per_berry_on_event) return cap(s.per_berry_on_event, 'berry');
  if (s.per_card_beneath) return cap(s.per_card_beneath, 'card tucked');
  if (s.per_critter_beneath) return cap(s.per_critter_beneath, 'critter tucked');
  if (s.per_husband_wife_pair_in_all_cities) return s.per_husband_wife_pair_in_all_cities + ' per vole pair, all cities';
  if (s.per_dungeon_prisoner) return s.per_dungeon_prisoner + ' per prisoner';
  if (s.per_worker_in_monastery) return s.per_worker_in_monastery + ' per cloister worker';
  if (s.per_cemetery_worker) return s.per_cemetery_worker + ' per buried worker';
  if (s.per_token_on_chapel) return s.per_token_on_chapel + ' per shrine token';
  if (s.per_resource_on_event) return '1 or 2 per good, up to 6';
  return dd.pts ? dd.pts + ' points' : 'see card';
}
// how many picks this question still has (a repeated question: 3 cards to clear, 2 resources to take, 3 berries to spend); 0 when unknown
function qLeft(q) { const o = q && q.opts && q.opts.find(x => x && x.d && (x.d.left != null || x.d.n != null)); if (!o) return 0; const v = o.d.left != null ? o.d.left : o.d.n; return v > 0 && v < 20 ? v : 0; }
// ===================== part 14: the Play view (W457): one focus at a time =====================
// Phone: a top bar (scores, resource piles, worker meeples), ONE focus panel (Places | Meadow | City), a fanned hand, the action row.
// Wide: the same pieces side by side. Same contract as the old board (src/ui2.js renderBoard, kept behind ?board=old):
// UI.tgEls + data-a="t"/data-t targets, UI.tiles / UI.cr rects, UI.lay.{W,H,acts,hand}, and the classes the coach, help and tests
// look for (.tile.t-*, .mc, .sc, .hc, .chip[data-seat], .chips, .rs[data-res], .resrow, .strip.city, .strip.hand).
// PV_FEEL holds the game-agnostic feel bits (drag to a target, hop, vibrate) so they can move to the shell later.
const PV_ON = (() => { try { return new URLSearchParams(location.search).get('board') !== 'old'; } catch (e) { return true; } })();
const PV_FEEL = {
  tick(ms) { try { if (navigator.vibrate) navigator.vibrate(ms || 14); } catch (e) { } },
  // el hops in an arc from rect `from` (board coords) to where it is now
  hop(el, from, ms) {
    if (!el || !from || !ANIM) return; const to = frameRect(el); if (!to) return;
    const a = ctr(from), b = ctr(to), dx = a.x - b.x, dy = a.y - b.y, lift = Math.min(90, 40 + Math.hypot(dx, dy) * .18);
    el.style.zIndex = 70;
    const an = animate(el, [{ transform: `translate(${dx}px,${dy}px) scale(.85)` }, { transform: `translate(${dx / 2}px,${dy / 2 - lift}px) scale(1.3)`, offset: .5 },
      { transform: 'translate(0,-6px) scale(1.12,.9)', offset: .86 }, { transform: 'none' }], { duration: ms || 560, easing: 'cubic-bezier(.3,.7,.4,1)' });
    if (an) an.onfinish = () => { el.style.zIndex = ''; };
  },
  // a draggable thing: onStart(), onMove(x,y) -> element under the finger, onDrop(x,y,under) -> true when it landed
  drag: null
};
// ---- plain words for a place
function pvWord(k, n) {
  if (RESK.indexOf(k) >= 0) { n = +n || 1; return n + ' ' + rname(k, n); }
  if (k === 'card') return n === '2ea' ? '2 cards each' : ((+n || 1) + ((+n || 1) === 1 ? ' card' : ' cards'));
  if (k === 'any') return 'any ' + (n === '' ? 1 : n);
  if (k === 'point') return (+n || 1) + ((+n || 1) === 1 ? ' point' : ' points');
  return '';
}
const PV_SPECIAL = {
  forest_rummage_hollow: ['Swap cards', 'draw 2 per discard', 'card'], forest_echoing_meadow: ['Copy a place', '+ 1 card', 'copy'],
  forest_barter_stump: ['Cards to goods', '1 each, up to 3', 'any'], forest_meadow_bazaar: ['Take 2 meadow', 'play 1 for 1 less', 'meadow']
};
const PV_BOARD = { forest_rummage_hollow: 'Swap cards', forest_echoing_meadow: 'Copy a place', forest_barter_stump: 'Cards to goods', forest_mixed_glade: 'twig, resin, berry', forest_meadow_bazaar: 'Meadow card 1 off' };
const PV_TCOL = { production: 'green', destination: 'red', governance: 'blue', traveler: 'tan', prosperity: 'purple' };
function pvSpot(kind, i) {
  const join = l => { const w = l.map(([k, n]) => pvWord(k, n)).filter(Boolean); return { main: w.slice(0, 2).join(' + '), sub: w.slice(2).join(' + '), ico: l[0] ? l[0][0] : 'any' }; };
  if (kind === 'basic') { const o = join(basicItems(i)); if (D.basic[i].shared) o.sub = o.sub ? o.sub + ' · shared' : 'shared'; return o; }
  if (kind === 'forest') { const k = D.forest[G.forest[i]].key; if (PV_SPECIAL[k]) { const s = PV_SPECIAL[k]; return { main: s[0], sub: s[1], ico: s[2] }; } return join(FIC[k] || [['any', '']]); }
  if (kind === 'haven') return { main: 'Cards to goods', sub: '2 cards = any 1', ico: 'haven' };
  if (kind === 'journey') return { main: 'Journey', sub: 'Autumn only · 2-5\u00a0pts', ico: 'road' };
  if (kind === 'bev') { const dd = D.basicEvents[G.bev[i].k], t = Object.keys(dd.need || {})[0]; return { main: dd.name, sub: t ? 'Needs ' + dd.need[t] + ' ' + (PV_TCOL[t] || t) + ' · ' + dd.pts + '\u00a0pts' : dd.pts + '\u00a0pts', ico: 'flag' }; }
  if (kind === 'sev') { const dd = D.specialEvents[G.sev[i].k], nm = (dd.req || []).map(k => { const c = D.cards.find(x => x.key === k); return c ? c.name.split(' ').pop() : k; });   // last word of each name keeps the plate under 8 words; the full names show when the goal is held
    return { main: dd.name, sub: (nm.length ? 'Needs ' + nm.join(' + ') + ' · ' : '') + sevPts(dd), ico: 'star' }; }
  return { main: '', sub: '', ico: 'any' };
}
// ---- card faces: name, painted art, cost as big icons with numbers, points
// painted art is keyed by card key (every card has one); the drawn kit art is only a fallback
function pvArt(sp) { const a = h('div.pvc-art'); const u = HBKit.paintedHref && (HBKit.paintedHref(sp.key) || HBKit.paintedHref(sp.art)); if (u) a.style.backgroundImage = 'url("' + u + '")'; else { const g = HBKit.art(sp.art, 200); g.setAttribute('width', '100%'); g.setAttribute('height', '100%'); g.setAttribute('preserveAspectRatio', 'xMidYMid slice'); a.appendChild(g); } return a; }
function pvCost(cost, px, lead) {
  const w = h('span.pvc-cost'); let any = false, said = [];
  if (lead) w.appendChild(h('span.pvc-lead', 'Costs'));
  for (const r of RESK) if (cost && cost[r]) { any = true; said.push(cost[r] + ' ' + rname(r, cost[r])); w.appendChild(h('span.pvc-ci', { 'data-r': r }, ic(r, px), h('b', cost[r]), h('span.pvc-w', rname(r, cost[r])))); }   // words, not icon soup: "2 twigs"
  if (!any) w.appendChild(h('span.pvc-free', 'Free'));
  w.setAttribute('aria-label', any ? 'Costs ' + said.join(', ') : 'Free');
  return w;
}
const pvPts = (n, cls) => h('span.' + cls, { title: n + (n === 1 ? ' point' : ' points') }, h('b', n), h('span.pvc-w', n === 1 ? 'pt' : 'pts'));
function pvNeed(cost, res) { const a = []; for (const r of RESK) { const d = (cost && cost[r] || 0) - (res[r] || 0); if (d > 0) a.push(d + ' ' + rname(r, d)); } return a; }
function pvFace(id, o) {
  o = o || {}; const sp = spec(id), T = (HBKit.TYPES && HBKit.TYPES[sp.type]) || { c: '#a67c52', d: '#6b4a2a' };
  const f = h('div.pvc' + (o.small ? '.small' : ''), { style: `--tc:${T.c};--td:${T.d}` });
  f.appendChild(h('div.pvc-name', sp.name));
  const art = pvArt(sp); f.appendChild(art);
  art.appendChild(pvPts(sp.points || 0, 'pvc-pts'));
  if (o.small) f.appendChild(pvCost(sp.cost, 13));
  else { f.appendChild(h('div.pvc-row', pvCost(sp.cost, 24, true))); f.appendChild(h('div.pvc-type', (TYPEN[sp.type] || '') + (sp.unique ? ' · unique' : ''))); }
  if (o.state) f.appendChild(h('div.pvc-aff.' + o.state[0], o.state[1]));
  return f;
}
function pvMini(id, entry) {
  const sp = spec(id), T = (HBKit.TYPES && HBKit.TYPES[sp.type]) || { c: '#a67c52' };
  const f = h('div.pvm', { style: `--tc:${T.c}` }); const art = pvArt(sp); f.appendChild(art);
  f.appendChild(pvPts(sp.points || 0, 'pvm-pts'));
  if (entry && (entry.tok || entry.w)) f.appendChild(h('span.pvm-x', (entry.tok ? '+' + entry.tok : '') + (entry.w ? ' ⚑' + entry.w : '')));
  f.appendChild(h('span.pvm-name', sp.name)); return f;
}
// ---- panels (phone: one at a time)
const PV_TABS = [['places', 'Places'], ['meadow', 'Meadow'], ['city', 'City'], ['goals', 'Goals']];
function pvTall() { return !!document.querySelector('#bd.pv.tall'); }
function pvSetTab(v, quiet) {
  UI.pvTab = v; const bd = $('#bd'); if (!bd || !bd.classList.contains('pv')) return;
  bd.querySelectorAll('.pv-panel').forEach(p => p.classList.toggle('on', p.dataset.p === v));
  bd.querySelectorAll('.pv-tab').forEach(t => { const on = t.dataset.v === v; t.classList.toggle('on', on); t.setAttribute('aria-selected', on ? 'true' : 'false'); });
  if (!quiet) { const p = bd.querySelector('.pv-panel.on'); if (p) { p.classList.remove('pvin'); void p.offsetWidth; p.classList.add('pvin'); } }
  try { const p = bd.querySelector('.pv-panel.on'); if (p) pvFitWords(p); } catch (e) { }   // labels in a panel that was hidden at render are fitted now
  try { meadFix(); } catch (e) { }
  pvRects(); if (!quiet) { try { placeFinger(); } catch (e) { } }
}
// the meadow row scrolls sideways: bring the card the finger points at (else the first glowing one) fully into view, moving the row as little as possible
function meadFix() {
  const mead = document.querySelector('#bd .pv-mead'); if (!mead) return; const q = mead.getBoundingClientRect(); if (q.width < 4) return;
  const rt = UI.rec && UI.rec.m && UI.tgEls && UI.tgEls[tgOf(UI.rec.m)], want = rt && mead.contains(rt) ? rt : mead.querySelector('.glow'); if (!want) return;
  const r = want.getBoundingClientRect(); if (r.left >= q.left - 1 && r.right <= q.right + 1) return;
  mead.scrollLeft = Math.max(0, mead.scrollLeft + (r.left < q.left ? r.left - q.left - 8 : r.right - q.right + 8)); UI.pvMx = mead.scrollLeft;   // the smallest scroll that shows it whole
}
// where things are, for the flying pieces (a piece on a hidden panel flies to / from its tab)
function pvRects() {
  const bd = $('#bd'); if (!bd || !bd.classList.contains('pv')) return; UI.tiles = {}; UI.cr = {};
  const tabR = p => frameRect(bd.querySelector('.pv-tab[data-v="' + p + '"]'));
  const rr = el => { const r = frameRect(el); if (r && r.w > 2) return r; const p = el.closest('.pv-panel'); return (p && tabR(p.dataset.p)) || r; };
  bd.querySelectorAll('.tile').forEach(e => { UI.tiles[e.dataset.k + ':' + e.dataset.i] = rr(e); });
  bd.querySelectorAll('.mc[data-id]').forEach(e => { UI.cr['m' + e.dataset.id] = rr(e); });
  bd.querySelectorAll('.strip.city .sc[data-id]').forEach(e => { UI.cr['c' + e.dataset.id] = rr(e); });
  bd.querySelectorAll('.hc[data-id]').forEach(e => { UI.cr['h' + e.dataset.id] = rr(e); });
  if (UI.lay) UI.lay.hand = frameRect(bd.querySelector('.strip.hand'));
}
function pvChip(s, n) {
  const grim = s === 'G', p = grim ? null : G.players[s];
  const pts = grim ? HB.grimScore(G).total : score(s).total, cards = grim ? G.grim.city.length : HB.cityCount(G, s);
  const turn = G.phase !== 'over' && !grim && HB.actor(G) === s, me = s === focusSeat();
  const e = h('button.chip' + (turn ? '.turn' : '') + (s === viewSeat() ? '.me' : ''), { 'data-a': 'chip', 'data-seat': s, type: 'button', 'aria-label': pname(s) + ': ' + pts + ' points, ' + cards + ' of 15 in city' + (grim ? '' : ', ' + availW(p) + ' workers free') });
  e.style.setProperty('--pc', pcolor(s).c);
  const nm = s === viewSeat() && humans().length === 1 ? 'You' : pname(s);
  e.appendChild(pawn(s, 24));
  e.appendChild(h('span.pvch-t', h('b.pvch-n', n >= 4 ? nm.slice(0, 5) : nm), h('span.pvch-s', p && p.passed ? (innerWidth < 440 ? 'done' : cards + '/15 done') : cards + (innerWidth < 380 ? '/15' : '/15 city'))));
  e.appendChild(h('b.pvch-pt.cp' + (me ? '.rs' : ''), me ? { 'data-res': 'point' } : {}, h('span.pvch-star', '★'), String(pts)));
  return e;
}
// ---- the view
function pvRender() {
  const host = $('#board'), bd = $('#bd'); if (!host || !bd || !G) return;
  const W = host.clientWidth || 390, H = host.clientHeight || 600;
  const tall = W < H && !document.documentElement.classList.contains('ph-l');
  bd.setAttribute('data-board', ''); bd.innerHTML = ''; bd.style.width = W + 'px'; bd.style.height = H + 'px';
  const short = !tall && H < 560;   // phone landscape: the hand becomes a column on the right so the board keeps the height
  const tiny = tall && H < 600;   // short portrait phones (375x553): the board takes the hand's room; the hand is a one-row strip that opens on tap
  bd.className = 'pv ' + (tall ? 'tall' : 'wide') + (short ? ' short' : '') + (tiny ? ' tiny' : '');
  if (UI.handOpen && UI.handOpen !== G.logN) UI.handOpen = 0;
  { const fx = document.getElementById('fx'); if (fx) fx.toggleAttribute('data-help', tiny); }   // short phones: a coach tip may lie over fly-in cards and pills (passing pictures, no buttons)   // an open hand closes again once anything happens
  UI.tgEls = {}; UI.cr = {}; UI.tiles = {};
  const mm = myMoves(), mine = mm.length > 0, v = viewSeat(), fs = focusSeat(), me = G.players[fs];
  const okw = new Set(mm.filter(m => m.type === 'worker').map(tgOf));
  const okp = new Set(mm.filter(m => m.type === 'play').map(tgOf));
  const qm = G.q && mine ? mm.filter(m => m.type === 'choose') : [];
  const qCard = new Map(); qm.forEach(m => { if (m.card !== undefined && !qCard.has(m.card)) qCard.set(m.card, m.i); });
  const qShown = new Set(), qLoc = new Map();
  if (qm.length) G.q.opts.forEach((o, i) => { let loc = o.d && o.d.loc; if (!loc && o.d && o.d.j != null && o.d.seat != null && G.players[o.d.seat] && (o.h === 'rangerTo' || o.h === 'recallGo')) loc = G.players[o.d.seat].dep[o.d.j]; const tg = loc ? tgOf(Object.assign({ type: 'worker' }, loc)) : ''; if (tg && !qLoc.has(tg)) qLoc.set(tg, i); });
  if (UI.sel && (UI.sel.logN !== G.logN || !UI.sel.ms.every(m => mm.some(x => sameM(x, m))))) UI.sel = null;
  if (UI.cityOpen) { UI.cityOpen = null; UI.pvForce = 'city'; }
  const regTg = (tg, e) => { if (tg) { e.setAttribute('data-t', tg); e.setAttribute('data-a', 't'); UI.tgEls[tg] = e; } };
  const actsH = 54, R = { W, H, tall, acts: { x: 6, y: H - actsH, w: W - 12, h: actsH - 4 } }; UI.lay = R;
  const col = h('div.pv-col'); col.style.height = (H - actsH) + 'px'; bd.appendChild(col);
  // ---- top bar: scores, then my resource piles and my workers
  const hud = h('div.pv-hud'); col.appendChild(hud);
  { const c = h('div.chips'), n = G.np + (G.grim ? 1 : 0); c.setAttribute('data-n', n);
    for (let s = 0; s < G.np; s++) c.appendChild(pvChip(s, n)); if (G.grim) c.appendChild(pvChip('G', n));
    const sea = h('span.pvsea', { title: SEASN[me.season] }, seasonIcon(me.season, 30), h('b', SEASN[me.season])); c.appendChild(sea);
    hud.appendChild(c); }
  { const r = h('div.resrow' + (me.pts ? '.r5' : '')), show = v >= 0 || watching();
    // each pile says what it is: icon, big number, and the word under it ("3 / twigs")
    for (const k of RESK) { const n = show ? me.res[k] : 0; r.appendChild(h('span.rs' + (show && me.res[k] ? '' : '.zero'), { 'data-res': k, title: rname(k, 2), 'aria-label': (show ? n : 'hidden') + ' ' + rname(k, n === 1 ? 1 : 2) }, ic(k, 24), h('b', show ? n : '?'), h('i.rsw', rname(k, n === 1 ? 1 : 2)))); }
    if (me.pts) r.appendChild(h('span.rs.tok', { 'data-res': 'ptok', title: 'point tokens' }, ic('point', 22), h('b', me.pts), h('i.rsw', me.pts === 1 ? 'token' : 'tokens')));
    const wk = h('span.rs.wk' + (me.workers > 3 ? '.many' : ''), { 'data-res': 'worker' }), free = availW(me), canW = mine && okw.size > 0 && !G.q && !UI.sel;
    // at most 4 meeples drawn; the count says the rest
    for (let i = 0; i < Math.min(me.workers, tall ? 3 : 4); i++) { const m = h('span.pv-meeple' + (i < free ? '' : '.out') + (i < free && canW ? '.can' : ''), { 'aria-hidden': 'true' }, pawn(fs, 30)); wk.appendChild(m); }
    wk.appendChild(h('span.pv-wn', h('b', free), h('i.rsw', free === 1 ? 'worker' : 'workers')));
    if (canW) wk.setAttribute('title', 'Drag a worker to a glowing place');
    r.appendChild(wk); hud.appendChild(r);
    if (tiny) { r.setAttribute('data-help', ''); hud.querySelectorAll('.pvch-t,.pvch-pt,.pvsea').forEach(e => e.setAttribute('data-help', '')); } }   // short phones: a coach tip may lie over the counts (no buttons there; each chip's middle stays protected)
  // ---- tabs (phone)
  const tabs = h('div.pv-tabs', { role: 'tablist' }); if (tall) col.appendChild(tabs);
  const tabEl = {};
  for (const [k, l] of PV_TABS) { const t = h('button.pv-tab', { 'data-a': 'pvtab', 'data-v': k, type: 'button', role: 'tab' }, h('span', l), k === 'city' ? h('b.pv-tn', HB.cityCount(G, fs) + '/15') : k === 'meadow' ? h('b.pv-tn', G.meadow.filter(x => x >= 0).length) : k === 'goals' ? h('b.pv-tn', G.bev.concat(G.sev).filter(x => x.o === -1 || x.o == null).length) : h('b.pv-tn', availW(me))); tabEl[k] = t; tabs.appendChild(t); }
  const stage = h('div.pv-stage'); col.appendChild(stage);
  const panel = (k, title) => { const p = h('section.pv-panel', { 'data-p': k, 'aria-label': title }); if (!tall) p.appendChild(h('h2.pv-h', title)); stage.appendChild(p); return p; };
  // ---- places
  const pPl = panel('places', 'Places: send a worker'), spots = h('div.pv-spots.pv-scrolly'); pPl.appendChild(spots);
  const tile = (kind, i, small) => {
    const info = tileInfo(kind, i), tg = tileTg(kind, i), w = pvSpot(kind, i);
    const e = h('button.tile.t-' + kind + (small ? '.pv-small' : ''), { 'data-zoom': 'tile:' + kind + ':' + i, 'data-k': kind, 'data-i': i, type: 'button', 'aria-label': (info.name || '') + ': ' + w.main + (w.sub ? ', ' + w.sub : '') });
    { const key = kind === 'basic' ? D.basic[i].key : kind === 'forest' ? D.forest[G.forest[i]].key : kind === 'bev' ? D.basicEvents[G.bev[i].k].key : kind === 'sev' ? D.specialEvents[G.sev[i].k].key : kind;
      const ph = key && HBKit.paintedHref ? HBKit.paintedHref(key) : null; if (ph) { e.style.setProperty('--pa', 'url("' + ph + '")'); e.classList.add('pv-painted'); } }   // the place's own painting
    if (tall && (kind === 'basic' || kind === 'forest' || kind === 'haven')) {   // phone board plate: at most 2 short lines, "shared" as a small tag
      const fk = kind === 'forest' ? D.forest[G.forest[i]].key : '', sh = kind === 'haven' || /shared/.test(w.sub || '');
      e.classList.add('pv-place'); e.appendChild(h('span.pv-nm', info.name || ''));   // the place's name, printed on its painting like a board space
      const short = PV_BOARD[fk] || (kind === 'haven' ? '2 cards for any 1' : [w.main.replace(/ \+ /g, ', '), (w.sub || '').replace(/\s*·?\s*shared/, '')].filter(Boolean).join(', '));
      const parts = short.split(', '); e.appendChild(h('span.pv-tin', h('span.pv-sw', h('b', parts.length < 2 ? short : parts.flatMap((t, j) => j ? [' ', h('span.pv-it', t + (j < parts.length - 1 ? ',' : ''))] : [h('span.pv-it', t + (parts.length > 1 ? ',' : ''))])))));   // each item stays whole on its line
      if (sh) e.appendChild(h('span.pv-shtag', 'shared'));
      if (kind === 'haven' && HBKit.paintedHref) { const ph = HBKit.paintedHref('general_store'); if (ph) { e.style.setProperty('--pa', 'url("' + ph + '")'); e.classList.add('pv-painted'); } }   // the haven has no painting of its own: the trading post card fits it
    } else
    e.appendChild(h('span.pv-tin', h('span.pv-sico', ic(w.ico, small ? 22 : 26)), h('span.pv-sw', h('b', w.main), w.sub ? h('span', w.sub) : null)));
    const legal = tg && okw.has(tg);
    if (legal) { e.classList.add('glow'); regTg(tg, e); }
    else if (tg && qLoc.has(tg)) { e.classList.add('glow'); regTg('q:' + qLoc.get(tg), e); qShown.add(qLoc.get(tg)); }
    else if (tg) { e.setAttribute('data-a', 't'); e.setAttribute('data-t', 'x:' + tg); if (mine) e.classList.add('no'); }
    if (UI.sel && UI.sel.tg === tg) e.classList.add('sel');
    if (kind === 'bev' || kind === 'sev') { const ev = (kind === 'bev' ? G.bev : G.sev)[i]; if (ev.o !== -1 && ev.o != null) { e.classList.add('done'); e.appendChild(h('div.pw', pawn(ev.o, 22))); } }
    else { const ws = workersAt(kind, i); if (ws.length) { const pw = h('div.pw'); ws.slice(0, 4).forEach(s => pw.appendChild(pawn(s, tall ? 30 : 26))); e.appendChild(pw); if (!info.shared && kind !== 'journey' && kind !== 'haven' && !e.classList.contains('glow')) { e.classList.add('taken'); e.appendChild(h('span.pv-taken', 'Taken')); } } }
    return e;
  };
  const cell = e => spots.appendChild(h('div.pv-cell', e));   // a plain grid cell around each button: rows then size to the words
  for (let i = 0; i < D.basic.length; i++) cell(tile('basic', i));
  for (let i = 0; i < G.forest.length; i++) cell(tile('forest', i));
  cell(tile('haven', 0));
  // phone: the places are round clearings on the painted tree-stump table (owner art), not a grid of boxes; staggered so it reads as a board
  if (tiny) { spots.classList.add('pv-board', 'pv-board-s', 'pv-board-t', 'hscroll'); spots.style.setProperty('--cw', Math.floor((W - 16 - 8 - 12 - 16) / 4) + 'px'); }   // 4 whole columns, the 5th peeks in   // 3 across in a grid that fills the band: every place whole, none overlapping
  else if (tall) { const short = H < 640, nc = short ? 4 : 3, xs = short ? [13, 38, 62, 87] : [19, 50, 81]; spots.classList.add('pv-board'); if (short) spots.classList.add('pv-board-s');   // short phones: 4 across, 3 rows
    const n = spots.children.length, rows = Math.ceil(n / nc), y0 = short ? 15 : 13, yr = short ? 66 : 74;
    Array.from(spots.children).forEach((c, k) => { const r = Math.floor(k / nc), col = k % nc; c.style.left = xs[col] + '%'; c.style.top = (0.6 + r * 99 / rows + (short ? 0 : col % 2 ? 1.2 : 0)) + '%';   /* rows hang from the top of their band, so nothing overlaps or leaves the board */ }); }
  // ---- goals (events): their own panel, so Places fits one screen
  const pGo = panel('goals', 'Goals: first to qualify claims'), gl = h('div.pv-spots.pv-goals.pv-scrolly'); pGo.appendChild(gl);
  if (tall) gl.appendChild(h('div.pv-sub', 'Cards fit a goal? Send a worker.'));
  const gcell = e => gl.appendChild(h('div.pv-cell', e));
  gcell(tile('journey', 0, true)); G.bev.forEach((x, i) => gcell(tile('bev', i, true))); G.sev.forEach((x, i) => gcell(tile('sev', i, true)));
  // ---- meadow: a swipeable row of big readable cards
  const pMe = panel('meadow', 'Meadow: cards anyone can build'), mead = h('div.pv-mead.hscroll'); pMe.appendChild(mead);
  const blocked = G.grim ? G.grim.mb : [];
  G.meadow.forEach((id, mi) => {
    const e = h('button.mc', { type: 'button', 'aria-label': id >= 0 ? 'Meadow card: ' + cname(id) : 'Empty meadow space' });
    if (id >= 0) {
      const sp = spec(id), ptg = 'p:meadow:' + id, need = pvNeed(sp.cost, me.res);
      const st = qCard.has(id) ? ['ok', 'Tap to choose'] : okp.has(ptg) ? ['ok', 'Can build'] : need.length ? ['no', 'Need ' + need.join(', ')] : mine && availW(me) >= 0 && HB.cityCount(G, fs) >= 15 ? ['no', 'City is full'] : ['meh', mine ? 'Not now' : 'Affordable'];
      e.setAttribute('data-zoom', 'card:' + id); e.setAttribute('data-id', id); e.appendChild(pvFace(id, { state: st }));
      if (okp.has(ptg)) { e.classList.add('glow'); regTg(ptg, e); }
      else if (qCard.has(id)) { e.classList.add('glow'); regTg('q:' + qCard.get(id), e); qShown.add(qCard.get(id)); }
      else { e.setAttribute('data-a', 't'); e.setAttribute('data-t', 'x:m' + id); }
      if (UI.sel && UI.sel.tg === ptg) e.classList.add('sel');
    } else e.classList.add('empty');
    if (blocked.indexOf(mi) >= 0) { e.classList.add('blocked'); e.appendChild(h('span.lock', '⛔')); }
    mead.appendChild(e);
  });
  mead.appendChild(h('div.pv-deck', { role: 'img', 'aria-label': 'Draw pile: ' + G.deck.length + ' cards' }, h('b', G.deck.length + ' cards left')));
  mead.addEventListener('scroll', () => { UI.pvMx = mead.scrollLeft; }, { passive: true });
  // ---- city: 15 slots that fill with the cards' art
  const pCi = panel('city', 'My city'), vis = visitList();
  const city = h('div.strip.city'); pCi.appendChild(city);
  city.appendChild(h('div.pv-ch', h('b', (fs === viewSeat() ? 'My city' : pname(fs) + "'s city")), h('span', HB.cityCount(G, fs) + ' of 15 · ' + score(fs).total + ' points')));
  const grid = h('div.pv-grid.pv-scrolly'); city.appendChild(grid);
  const cityCard = (b, it) => {
    const tg = 'd:' + it.id;
    if (okw.has(tg)) { b.classList.add('glow'); regTg(tg, b); }
    else if (qLoc.has(tg)) { b.classList.add('glow'); regTg('q:' + qLoc.get(tg), b); qShown.add(qLoc.get(tg)); }
    else if (qCard.has(it.id)) { b.classList.add('glow'); regTg('q:' + qCard.get(it.id), b); qShown.add(qCard.get(it.id)); }
    else { b.setAttribute('data-a', 't'); b.setAttribute('data-t', 'x:c' + it.id); }
  };
  const nSl = Math.max(15, me.city.length);
  for (let i = 0; i < nSl; i++) {
    const it = me.city[i];
    if (!it) { grid.appendChild(h('i.pv-slot', { 'aria-hidden': 'true' }, i === me.city.length ? h('span', '+') : null)); continue; }
    const b = h('button.sc', { 'data-zoom': 'card:' + it.id, 'data-id': it.id, type: 'button', 'aria-label': cname(it.id) }, pvMini(it.id, it));
    cityCard(b, { id: it.id }); grid.appendChild(b);
  }
  if (vis.length) {
    const vr = h('div.pv-visit', h('span.pv-sub', 'Visit a rival’s place:')); city.appendChild(vr);
    vis.forEach(x => { const b = h('button.sc.pv-vc', { 'data-zoom': 'card:' + x.id, 'data-id': x.id, type: 'button', 'aria-label': 'Visit ' + cname(x.id) }, pvMini(x.id), h('span.vb', pawn(x.o, 18))); cityCard(b, x); vr.appendChild(b); });
  }
  city.appendChild(h('div.pv-drop', 'Drop here to build'));
  // ---- my hand: a fan at the bottom; drag a card up to build it, or tap it
  const hand = v >= 0 ? G.players[v].hand : [], nH = hand.length;
  const hs = h('div.strip.hand.hscroll'); col.appendChild(hs);
  // whole cards side by side, never overlapping (every name readable); more than fit -> the row scrolls sideways
  // phone: when not all fit, a whole number k of cards fills the row exactly (no card half off the edge); the row snaps card by card
  const HW = 104, gapH = 6, fits = nH * ((tall ? HW : 118) + gapH) <= W - 16, kFit = Math.max(1, Math.floor((W - 8) / (HW + gapH)));   // R10: 96+ wide so 14px names fit whole
  const mini = tiny && !UI.handOpen, hx = tiny ? 64 : 0;   // mini: name-only cards, 48 px high, after a Hand toggle on the left
  const cw = short ? 112 : mini ? 124 : !tall ? 118 : fits ? HW : Math.ceil((W - 8) / kFit) - gapH; let ch = tall ? Math.round(Math.min(cw, 86) * 1.5) : Math.round(cw * 1.22);
  if (mini) ch = 48;
  if (!short) hs.style.height = (ch + (mini ? 8 : tall ? 22 : 30)) + 'px';
  if (tiny) { hs.classList.add(mini ? 'mini' : 'open'); hs.appendChild(h('button.scount.hs-tg', { type: 'button', 'aria-expanded': mini ? 'false' : 'true', 'aria-label': (mini ? 'Show' : 'Hide') + ' hand cards' }, h('span', 'Hand'), h('b', nH + '/8 ' + (mini ? '▴' : '▾'))));
    hs.lastChild.addEventListener('click', e => { e.stopPropagation(); UI.handOpen = mini ? G.logN : 0; renderBoard(); }); }
  else hs.appendChild(h('span.scount', v >= 0 ? 'Hand ' + nH + '/8' + (fits ? '' : ' ›') : ''));
  { const sc = hs.lastChild; const keep = () => { sc.style.transform = 'translateX(' + hs.scrollLeft + 'px)'; }; hs.addEventListener('scroll', keep, { passive: true }); requestAnimationFrame(keep); }   // the Hand label stays put while the cards scroll
  const x0 = hx || (fits ? (W - nH * (cw + gapH) + gapH) / 2 : 8);
  const hin = h('div.hin'); hin.style.cssText = short ? `position:relative;width:100%;height:${24 + nH * (ch + gapH)}px` : `position:relative;width:${tiny ? hx + nH * (cw + gapH) + 4 : fits ? W - 4 : x0 * 2 + nH * (cw + gapH)}px;height:100%`; hs.appendChild(hin);
  hand.forEach((id, i) => {
    const tg = 'p:hand:' + id, off = i - (nH - 1) / 2;
    const b = h('button.sc.hc', { 'data-zoom': 'card:' + id, 'data-id': id, type: 'button', 'aria-label': cname(id) + ' (in hand)' }, pvFace(id, { small: true }));
    b.style.cssText = short ? `left:0;top:${20 + i * (ch + gapH)}px;width:${cw}px;height:${ch}px;--dy:0px;z-index:${i + 2}` : `left:${x0 + i * (cw + gapH)}px;width:${cw}px;height:${ch}px;--dy:${fits && tall && !tiny ? Math.round(off * off * 1.6) : 0}px;z-index:${i + 2}`;
    if (okp.has(tg)) { b.classList.add('glow'); regTg(tg, b); }
    else if (qCard.has(id)) { b.classList.add('glow'); regTg('q:' + qCard.get(id), b); qShown.add(qCard.get(id)); }
    else { b.setAttribute('data-a', 't'); b.setAttribute('data-t', 'x:h' + id); }
    if (UI.sel && UI.sel.tg === tg) b.classList.add('sel');
    hin.appendChild(b);
  });
  hs.addEventListener('scroll', () => { UI.hsx = hs.scrollLeft; }, { passive: true });
  if (!nH) hs.appendChild(h('span.sempty', v >= 0 ? 'No cards in hand' : ''));
  // ---- which panel is in front (phone): my turn starts on Places (or the Meadow when no worker is left); a pending choice shows its panel
  const myNow = mine && !G.q && !UI.sel;
  guideTrim(myNow);
  const glowIn = k => !!stage.querySelector('.pv-panel[data-p="' + k + '"] .glow');
  if (UI.pvCityN != null && fs === UI.pvSeat && me.city.length > UI.pvCityN && fs === viewSeat()) { UI.pvForce = 'city'; UI.pvCityAt = Date.now(); }
  UI.pvCityN = me.city.length; UI.pvSeat = fs;
  if (UI.pvForce) { UI.pvTab = UI.pvForce; UI.pvForce = null; }
  else if (myNow && !UI.pvMine) { UI.pvTab = availW(me) > 0 && okw.size ? 'places' : (glowIn('meadow') ? 'meadow' : 'places'); if (!glowIn(UI.pvTab)) { const k = PV_TABS.map(x => x[0]).find(glowIn); if (k) UI.pvTab = k; } }
  else if (mine && (G.q || UI.sel) && !glowIn(UI.pvTab || 'places')) { const k = PV_TABS.map(x => x[0]).find(glowIn); if (k) UI.pvTab = k; }
  UI.pvMine = myNow;
  if (UI.tutTab && typeof tutOn === 'function' && tutOn()) UI.pvTab = UI.tutTab;   // Learn: the panel the current step points at stays in front
  if (!UI.pvTab) UI.pvTab = 'places';
  for (const [k] of PV_TABS) if (glowIn(k)) tabEl[k].classList.add('hot');
  // ---- action row / choice tray (shared with the old board)
  renderActs(mm, qm, qShown);
  // R17: a choice tray that grows up over the hand: the hand steps out and the panel above takes its room, so the tray never covers a city row
  { const ae = document.getElementById('acts'); if (tall && ae && ae.classList.contains('tall')) { const top = parseFloat(ae.style.top); if (top > 0) { hs.style.display = 'none'; col.style.height = Math.max(200, top - 4) + 'px'; } } }
  if (UI.sel) bd.querySelectorAll('.glow:not(.tchip)').forEach(e => e.classList.remove('glow'));
  pvSetTab(UI.pvTab, true);
  mead.scrollLeft = UI.pvMx || 0;
  meadFix();   // R35: a glowing meadow card is never left off the edge
  { const sp = bd.querySelector('.pv-spots.pv-board:not(.pv-board-t):not(.pv-board-s)'); if (sp && sp.clientHeight) { const low = () => { const q = sp.getBoundingClientRect().top; let m = 0; for (const e of sp.querySelectorAll('.tile, .tile *')) { const r = e.getBoundingClientRect(); if (r.height) m = Math.max(m, r.bottom - q); } return m; };
    let over = low() - (sp.clientHeight - 2); if (over > 0) { sp.classList.add('pv-shrunk'); sp.style.setProperty('--pvph', Math.max(52, 64 - Math.ceil(over)) + 'px'); } } }   // every row of places fits the board (390x763: the last row was cut by 4-8 px)
  if (tiny) { spots.scrollLeft = UI.pvBx || 0; spots.addEventListener('scroll', () => { UI.pvBx = spots.scrollLeft; }, { passive: true });
    const gs = [...spots.querySelectorAll('.glow')], q = spots.getBoundingClientRect(), vis = e => { const r = e.getBoundingClientRect(); return r.left >= q.left - 1 && r.right <= q.right + 1; };
    if (gs.length && !gs.some(vis)) pvScrollTo(gs[0]); }   // a glowing place is always in view
  if (short) { hs.scrollTop = UI.hsy || 0; hs.addEventListener('scroll', () => { UI.hsy = hs.scrollTop; }, { passive: true }); const g = hs.querySelector('.glow'); if (g && (g.offsetTop < hs.scrollTop || g.offsetTop + g.offsetHeight > hs.scrollTop + hs.clientHeight)) hs.scrollTop = g.offsetTop - 20; }
  else hs.scrollLeft = fits ? 0 : (UI.hsx || 0); if (!short) { const g = (UI.rec && UI.rec.m && UI.tgEls[tgOf(UI.rec.m)]) || hs.querySelector('.glow'); if (g && g.closest('.strip.hand') === hs) hscrollTo(g); }
  if (guideOn()) { try { computeRec(); } catch (e) { } }   // the finger is there as soon as the turn is drawn
  renderPrompt(); renderBar(); pvFitWords(bd); placeFinger();
  if (typeof hlpMarks === 'function' && G.phase !== 'over') hlpMarks();
}
// no cut words on a phone: a label whose longest word is wider than its box (or that runs past its card) steps its font down, to 11 px at the least
function pvFitWords(root) {
  const clipOf = e => e.closest('.pvc,.pvm,.mc,.sc,.tile,.pv-tab,.chip');
  const over = e => { if (e.scrollWidth > e.clientWidth + 1) return true; const cs = getComputedStyle(e); if (/hidden|clip/.test(cs.overflow + cs.overflowY) && e.scrollHeight > e.clientHeight + 1) return true;
    const c = clipOf(e); if (!c || c === e) return false; const r = e.getBoundingClientRect(), q = c.getBoundingClientRect(); return r.right > q.right + 1 || r.left < q.left - 1; };
  root.querySelectorAll('.pvc-name,.pvm-name,.pvc-cost,.pvc-ci,.pvc-aff,.hcn,.pv-sw b,.pv-sw span,.pv-nm,.pvch-s,.pvch-n,.pv-tab span,.rsw').forEach(e => {
    if (!e.getClientRects().length || !over(e)) return; let f = parseFloat(getComputedStyle(e).fontSize); for (let k = 0; k < 10 && f > 14 && over(e); k++) { f = Math.max(14, f - 0.5); e.style.setProperty('font-size', f + 'px', 'important'); e.querySelectorAll('b,span,i').forEach(c => c.style.setProperty('font-size', f + 'px', 'important')); } });
}
// ---- hook into the existing game: board renderer, scroll-into-view, flights, rival moves, prompt words
// Play view part of hscrollTo (src/ui3.js): show the panel holding el, scroll it into view; true when el is in the meadow row (done)
function pvScrollTo(el) {
  const p = el && el.closest && el.closest('#bd.pv .pv-panel');
  if (p && pvTall() && !p.classList.contains('on')) pvSetTab(p.dataset.p, true);
  const sy = el && el.closest && el.closest('.pv-scrolly');
  if (sy) { const a = el.offsetTop, b = a + el.offsetHeight; if (a < sy.scrollTop) sy.scrollTop = a - 4; else if (b > sy.scrollTop + sy.clientHeight) sy.scrollTop = b - sy.clientHeight + 4; }
  const bt = el && el.closest && el.closest('.pv-board-t');   // short phones: the places scroll sideways
  if (bt) { const r = el.getBoundingClientRect(), q = bt.getBoundingClientRect(); if (r.left < q.left) bt.scrollLeft += r.left - q.left - 4; else if (r.right > q.right) bt.scrollLeft += r.right - q.right + 4; UI.pvBx = bt.scrollLeft; return true; }
  const hm = el && el.closest && el.closest('.pv-mead');
  if (hm) { const a = el.offsetLeft, b = a + el.offsetWidth; if (a < hm.scrollLeft) hm.scrollLeft = Math.max(0, a - 8); else if (b > hm.scrollLeft + hm.clientWidth) hm.scrollLeft = b - hm.clientWidth + 8; UI.pvMx = hm.scrollLeft; return true; }
  return false;
}
// Play view part of fxLand (src/ui3.js): true when it drew the landing
// G8: the worker settles with a ring; a built card flies into the city (or onto the City tab when the city is not shown)
function pvLand(m, seat, src, preChip) {
  if (!ANIM || !m || !$('#bd.pv')) return false;
  const mine = seat === viewSeat();
  if (m.type === 'worker' && m.k !== 'dest') {
    const sel = '.tile[data-k="' + (m.k === 'event' ? (m.e === 'b' ? 'bev' : 'sev') : m.k) + '"]' + (m.k === 'haven' || m.k === 'journey' ? '' : '[data-i="' + m.i + '"]');
    const t = $(sel); if (t) setTimeout(() => { pvRing(frameRect(t)); if (mine) PV_FEEL.tick(18); snd('place', { vol: .5 }); }, 520);
  } else if (m.type === 'play') {
    // :not(.pv-vc): the visit row shows rivals' cards with the same id; only my own city card may fly
    const inCity = $('#bd .strip.city .sc[data-id="' + m.card + '"]:not(.pv-vc)'), tab = $('#bd .pv-tab[data-v="city"]');
    const to = inCity ? frameRect(inCity) : mine ? frameRect(tab) : seatRect(seat);
    const from = src || (mine ? UI.lay && UI.lay.hand : seatRect(seat));
    if (!inCity && from && to) {
      const g = h('div.pv-ghost.pv-flycard', pvFace(m.card, { small: true }));
      fxFly(g, from, to, 620, () => { pvRing(to, 'gold'); if (tab && mine) { tab.classList.remove('bmp'); void tab.offsetWidth; tab.classList.add('bmp'); setTimeout(() => tab.classList.remove('bmp'), 500); } });
    } else if (inCity) setTimeout(() => pvRing(frameRect(inCity), 'gold'), 600);
    if (mine) PV_FEEL.tick(22);
  }
  if (m.type === 'worker' && m.k !== 'dest') {
    const sel = '.tile[data-k="' + (m.k === 'event' ? (m.e === 'b' ? 'bev' : 'sev') : m.k) + '"]' + (m.k === 'haven' || m.k === 'journey' ? '' : '[data-i="' + m.i + '"]');
    const t = $(sel), pw = t && t.querySelectorAll('.pw .pawnw'), mine = seat === viewSeat();
    const from = (mine && UI.pvDropAt) || (mine && frameRect($('#bd .rs.wk'))) || preChip || seatRect(seat); UI.pvDropAt = null;
    if (pw && pw.length && from) PV_FEEL.hop(pw[pw.length - 1], from, 600);
    if (t) { t.classList.add('pv-hit'); setTimeout(() => t.classList.remove('pv-hit'), 700); }
    return true;
  }
  if (m.type === 'play') { const el = $('#bd .strip.city .sc[data-id="' + m.card + '"]:not(.pv-vc)'); if (el) { if (src) flipFrom(el, src, 620); el.classList.add('pv-new'); setTimeout(() => el.classList.remove('pv-new'), 1500); } return true; }
  return false;
}
function pvRing(r, cls) {
  const L = fxLayer(); if (!L || !ANIM || !r) return;
  const c = ctr(r), e = h('div.pv-ring' + (cls ? '.' + cls : '')); e.style.left = c.x + 'px'; e.style.top = c.y + 'px'; L.appendChild(e);
  setTimeout(() => e.remove(), 900);
}
// ---- names fit their box: shrink the font a step at a time until no word is cut (never below 9px)
const FIT_SEL = '#bd .pvc-name, #bd .pvm-name, #bd .pv-sw b, #bd .pv-sw span, #bd .hcn, #bd .tchip b, #pc .ovt th';
function fitNames(root) {
  const els = (root || document).querySelectorAll(FIT_SEL);
  for (const e of els) {
    if (!e.clientWidth) continue;
    e.style.fontSize = '';
    let px = parseFloat(getComputedStyle(e).fontSize) || 14, n = 0;
    while (n++ < 10 && px > 14 && (e.scrollWidth > e.clientWidth + 1 || longestWord(e) > e.clientWidth + 1)) { px -= 1; e.style.fontSize = px + 'px'; }
  }
}
// width of the longest single word (a word wider than its box is what gets cut)
const FIT_CV = document.createElement('canvas').getContext('2d');
function longestWord(e) {
  const cs = getComputedStyle(e); FIT_CV.font = cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily;
  let m = 0; for (const w of (e.textContent || '').split(/\s+/)) m = Math.max(m, FIT_CV.measureText(w).width);
  return m + (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0);
}
