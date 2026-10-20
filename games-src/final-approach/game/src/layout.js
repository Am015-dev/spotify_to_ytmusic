// ===================== Final Approach: control panel geometry =====================
// One pure function describes where everything on the cockpit panel sits, for the painted background generator (paint/), the DOM hit layer and the Pixi scene.
//   FA.layout(boardW, boardH, {mods, track}) -> {mode:'L'|'P', k (px per logical unit), ox, oy, lw, lh, r:{name:{x,y,w,h}}, die (die size in px)}
// All rectangles are in board pixels. The logical panel is 1400 wide (landscape) or 800 wide (portrait); its height adapts to the board so
// the panel always fills the space. Slot spacing is 100 logical units; at the smallest phone sizes that is 44 px (the touch target size).
(function (g) {
'use strict';
const FA = g.FA = g.FA || {};
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const R = (cx, cy, w, h) => ({ x: cx - w / 2, y: cy - h / 2, w, h });
// lad = 0 (real game) or 1..6 (learning chapters): fewer slots, bigger in chapters 1-2; sceneH = height of the plane / approach window
function buildLad(LW, lad, me, wh) {   // portrait, chapters 1 and 2: a few big slots and two stacked trays (the partner's hand above yours)
  const r = {}, S = lad === 1 ? 148 : lad === 2 ? 132 : 118, R = (cx, cy, w, h) => ({ x: cx - w / 2, y: cy - h / 2, w, h });
  r.appr = { x: 14, y: 8, w: LW - 28, h: wh }; r.alt = { x: 14, y: wh + 14, w: LW - 28, h: 58 };
  let y = wh + 14 + 58 + 22; const rowH = S + 22;
  const A = y + S / 2; r.ax0 = R(190, A, S, S); r.ax1 = R(610, A, S, S); r.dial = R(400, A, lad === 1 ? 150 : 124, lad === 1 ? 150 : 124);
  let end = y + S;
  if (lad >= 2) { const B = A + rowH; r.en0 = R(190, B, S, S); r.en1 = R(610, B, S, S); r.gauge = R(400, B + 4, 230, 96); end = B + S / 2; }
  if (lad >= 3) { const C = A + 2 * rowH; r.ra0 = R(190, C, S, S); r.ra1 = R(545, C, S, S); r.ra2 = R(675, C, S, S); end = C + S / 2; }
  const oT = end + 40, oH = 92, mT = oT + oH + 34, mH = 150, other = { x: 8, y: oT, w: LW - 16, h: oH }, mine = { x: 8, y: mT, w: LW - 16, h: mH };
  if (me === 1) { r.trayC = mine; r.trayP = other; } else { r.trayP = mine; r.trayC = other; }
  r.ch = mT + mH + 14; r.lw = LW; r.lh = r.ch;
  return r;
}
function build(mode, LW, LH, mods, me, lad, sceneH) {
  const r = {}, S = mode === 'L' ? 88 : 96;   // slot size
  mods = mods || {}; lad = lad || 0;
  if (mode === 'P' && lad >= 1 && lad <= 3) return buildLad(LW, lad, me, Math.max(sceneH || 0, lad === 1 ? 250 : 200));
  const slot = (k, cx, cy) => { r[k] = R(cx, cy, S, S); };
  if (mode === 'L') {
    // landscape: both windows across the top (full width), then three rows of controls, then the dice trays. 1120 logical wide:
    // at the smallest landscape phone (750 wide, a 180 px rail) one logical unit is 0.51 px, so a slot (88) is 44.8 px.
    const ice = !!mods.ice, wh = sceneH || 100;
    r.appr = { x: 10, y: 8, w: LW - 20, h: wh }; r.alt = { x: 10, y: wh + 14, w: LW - 20, h: 62 };
    const A = wh + 14 + 62 + 14 + 48, sp = 102, B = A + sp, C = B + sp;
    slot('ra0', 52, A); slot('lg0', 148, A); slot('lg1', 244, A); slot('lg2', 340, A);
    slot('ax0', 434, A); slot('ax1', 686, A); r.dial = R(560, A, 104, 104);
    slot('fl0', 776, A); slot('fl1', 872, A); slot('fl2', 968, A); slot('fl3', 1064, A);
    // brakes (or the icy-runway columns) on the left with the brake readout (r.brk) right after them; the fuel space sits in the bottom row so the readout has room
    if (ice) { for (let i = 0; i < 4; i++) { slot('it' + i, 52 + i * 96, B); slot('ib' + i, 52 + i * 96, C); } r.brk = R(450, C, 116, 84); }
    else { slot('br0', 52, B); slot('br1', 148, B); slot('br2', 244, B); r.brk = R(339, B, 96, 84); if (mods.kero) slot('ke', 52, C); }
    slot('en0', 434, B); slot('en1', 686, B); r.gauge = R(560, B + 4, 162, 92);
    slot('ra1', 776, B); slot('ra2', 872, B); if (!lad || lad >= 6) r.rerolls = R(1010, B, 130, 60);
    const cx = ice ? 656 : 560; if (!lad || lad >= 6) { slot('co0', cx - 96, C); slot('co1', cx, C); slot('co2', cx + 96, C); r.coffee = R(cx, C + 62, 290, 24); }
    if (mods.intern) { slot('in0', 776, C); slot('in1', 1064, C); r.tokens = { x: 822, y: C - 22, w: 196, h: 44 }; }
    if (!ice) { const x0 = mods.kero ? 104 : 20; if (mods.wind) r.wind = R(x0 + 50, C, 84, 84); if (mods.kero || mods.leak) r.fuel = { x: mods.wind ? x0 + 100 : x0 + 10, y: C - 12, w: (mods.wind ? 410 - x0 - 100 : 410 - x0 - 10), h: 26 }; }
    else { if (mods.wind) r.wind = R(1064, C, 84, 84); if (mods.kero || mods.leak) r.fuel = { x: 812, y: C - 12, w: mods.wind ? 196 : 290, h: 26 }; }
    const T = C + 130; r.ch = T + 58;
    r.trayP = { x: 12, y: T - 52, w: 460, h: 104 }; r.trayC = { x: 648, y: T - 52, w: 460, h: 104 };
    r.hud = R(560, T, 170, 100);
    r.lw = LW; r.lh = r.ch;
  } else {
    const ice = !!mods.ice, wh = sceneH || 116, coffeeRow = !lad || lad >= 6;
    r.appr = { x: 14, y: 8, w: LW - 28, h: wh }; r.alt = { x: 14, y: wh + 10, w: LW - 28, h: 58 };
    const A = wh + 10 + 58 + 10 + 48, B = A + 104;
    slot('ax0', 230, A); slot('ax1', 570, A); r.dial = R(400, A, 120, 120);
    slot('en0', 230, B); slot('en1', 570, B); r.gauge = R(400, B + 4, 230, 96);
    // pilot column (left) / co-pilot column (right): eight slots across the 800 wide panel, kept 9 units in from the edges so a glow is never cut off
    const P1 = B + 104, P2 = P1 + 100, X = i => 57 + 98 * i;
    slot('ra0', X(0), P1); slot('lg0', X(1), P1); slot('lg1', X(2), P1); slot('lg2', X(3), P1);
    if (ice) { for (let i = 0; i < 4; i++) { slot('it' + i, X(i), P2); slot('ib' + i, X(i), P2 + 100); } }
    else { slot('br0', X(0), P2); slot('br1', X(1), P2); slot('br2', X(2), P2); }
    if (!lad || lad >= 5) r.brk = ice ? R(X(3) + 48 + 80, P2 + 100, 150, 84) : R(X(2) + 48 + 80, P2, 150, 84);   // two lines ("Brakes" over the value) in their own box, clear of the brake slots
    slot('fl0', X(4), P1); slot('fl1', X(5), P1); slot('fl2', X(6), P1); slot('fl3', X(7), P1);
    slot('ra1', X(6), P2); slot('ra2', X(7), P2);
    const R3 = P2 + (ice ? 200 : 100); let C2 = R3;
    if (mods.kero) slot('ke', X(5), P2);
    if (mods.intern) { slot('in0', X(1), R3); slot('in1', X(6), R3); r.tokens = { x: 220, y: R3 - 22, w: 360, h: 44 }; C2 = R3 + 100; }
    if (coffeeRow) { slot('co0', 290, C2); slot('co1', 400, C2); slot('co2', 510, C2); r.coffee = R(400, C2 + 62, 300, 24); r.rerolls = R(680, C2 + 6, 150, 60); }
    const fuel = mods.kero || mods.leak;
    if (mods.wind) r.wind = fuel ? R(58, C2, 84, 84) : R(110, C2, 90, 90);
    if (fuel) r.fuel = { x: mods.wind ? 106 : 14, y: C2 - 13, w: mods.wind ? 128 : 220, h: 26 };   // in the coffee row, clear of the tray labels
    const T = (coffeeRow ? C2 : C2 - 100) + 140 + (coffeeRow ? 0 : 0); r.ch = T + 64;
    const wm = 490, wo = 292, th = 124; if (me === 0) { r.trayP = { x: 8, y: T - 62, w: wm, h: th }; r.trayC = { x: 8 + wm + 6, y: T - 62, w: wo, h: th }; } else if (me === 1) { r.trayP = { x: 8, y: T - 62, w: wo, h: th }; r.trayC = { x: 8 + wo + 6, y: T - 62, w: wm, h: th }; } else { r.trayP = { x: 8, y: T - 62, w: 388, h: th }; r.trayC = { x: 404, y: T - 62, w: 388, h: th }; }
    r.lw = LW; r.lh = r.ch;
  }
  return r;
}
function layout(W, H, opt) {
  opt = opt || {}; W = Math.max(60, W); H = Math.max(60, H);
  const mode = opt.mode || (W / H >= 1.08 ? 'L' : 'P');
  let LW, minH, maxH;
  if (mode === 'L') { LW = 1120; minH = 300; maxH = 3000; } else { LW = 800; minH = 300; maxH = 3000; }
  // widest scale that fits: width-limited first, then height-limited
  let k = W / LW, LH = H / k;
  if (LH < minH) { k = H / minH; LH = minH; }
  if (LH > maxH) LH = maxH;
  const lw = LW;
  const lad = opt.lad || 0; let rl = build(mode, lw, LH, opt.mods || {}, opt.me, lad); const r = {};
  if (rl.ch > LH + .5) { LH = rl.ch; k = Math.min(k, H / LH); rl = build(mode, lw, LH, opt.mods || {}, opt.me, lad); }
  // spare height goes first to the plane / approach window (the picture of where the flight stands), then the rows below open up
  { const base = mode === 'P' ? 116 : 100, maxX = mode === 'P' ? (lad === 1 ? 420 : lad === 2 ? 340 : lad === 3 ? 300 : lad ? 240 : 200) : 110;
    if (rl.ch && LH > rl.ch + 24) { const ex = Math.min(maxX, (LH - rl.ch - 10) * (lad ? .95 : .55)); if (ex > 8) { rl = build(mode, lw, LH, opt.mods || {}, opt.me, lad, base + ex); opt.sceneExtra = ex; } } }
  // portrait with spare height: open the rows up (the windows stay on top, everything below spreads) so the panel fills the screen instead of floating in it
  if (mode === 'P' && rl.ch && LH > rl.ch + 20) {
    const A0 = rl.alt.y + rl.alt.h + 6, f = Math.min(1.34, (LH - A0) / (rl.ch - A0)); if (f > 1.02) { for (const n of Object.keys(rl)) { const q = rl[n]; if (q && typeof q === 'object' && n !== 'appr' && n !== 'alt') { const cy = q.y + q.h / 2; q.y = A0 + (cy - A0) * f - q.h / 2; } } rl.ch = A0 + (rl.ch - A0) * f; rl.lh = rl.ch; }
  }
  if (rl.ch) LH = Math.min(LH, rl.ch); const oy = (H - LH * k) / 2, ox = (W - lw * k) / 2;
  for (const n of Object.keys(rl)) { const q = rl[n]; if (q && typeof q === 'object') r[n] = { x: ox + q.x * k, y: oy + q.y * k, w: q.w * k, h: q.h * k }; }
  return { mode, k, ox, oy, lw, lh: LH, r, die: 72 * k, logical: rl, W, H };
}
FA.layout = layout; FA.layoutLogical = (mode, LH, mods, me, lad, sceneH) => build(mode, mode === 'L' ? 1120 : 800, LH, mods || {}, me, lad, sceneH);
if (typeof module === 'object' && module.exports) module.exports = FA;
})(typeof globalThis !== 'undefined' ? globalThis : this);
