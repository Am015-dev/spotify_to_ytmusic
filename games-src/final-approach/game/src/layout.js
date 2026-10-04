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
function build(mode, LW, LH, mods, me) {
  const r = {}, S = mode === 'L' ? 88 : 96;   // slot size
  mods = mods || {};
  const slot = (k, cx, cy) => { r[k] = R(cx, cy, S, S); };
  if (mode === 'L') {
    // landscape: both windows across the top (full width), then three rows of controls, then the dice trays. 1120 logical wide:
    // at the smallest landscape phone (750 wide, a 180 px rail) one logical unit is 0.51 px, so a slot (88) is 44.8 px.
    const ice = !!mods.ice, wh = 100;
    r.appr = { x: 10, y: 8, w: LW - 20, h: wh }; r.alt = { x: 10, y: wh + 14, w: LW - 20, h: 62 };
    const A = wh + 14 + 62 + 14 + 48, sp = 102, B = A + sp, C = B + sp;
    slot('ra0', 52, A); slot('lg0', 148, A); slot('lg1', 244, A); slot('lg2', 340, A);
    slot('ax0', 434, A); slot('ax1', 686, A); r.dial = R(560, A, 104, 104);
    slot('fl0', 776, A); slot('fl1', 872, A); slot('fl2', 968, A); slot('fl3', 1064, A);
    if (ice) { for (let i = 0; i < 4; i++) { slot('it' + i, 52 + i * 96, B); slot('ib' + i, 52 + i * 96, C); } }
    else { slot('br0', 52, B); slot('br1', 148, B); slot('br2', 244, B); if (mods.kero) slot('ke', 340, B); }
    slot('en0', 434, B); slot('en1', 686, B); r.gauge = R(560, B + 4, 162, 92);
    slot('ra1', 776, B); slot('ra2', 872, B); r.rerolls = R(1010, B, 130, 60);
    slot('co0', 464, C); slot('co1', 560, C); slot('co2', 656, C); r.coffee = R(560, C + 62, 290, 24);
    if (mods.intern) { slot('in0', 776, C); slot('in1', 1064, C); r.tokens = { x: 822, y: C - 22, w: 196, h: 44 }; }
    if (!ice) { if (mods.wind) r.wind = R(70, C, 84, 84); if (mods.kero || mods.leak) r.fuel = { x: mods.wind ? 124 : 30, y: C - 12, w: mods.wind ? 280 : 370, h: 26 }; }
    else { if (mods.wind) r.wind = R(790, C, 84, 84); if (mods.kero || mods.leak) r.fuel = { x: mods.wind ? 846 : 780, y: C - 12, w: mods.wind ? 250 : 316, h: 26 }; }
    const T = C + 130; r.ch = T + 58;
    r.trayP = { x: 12, y: T - 52, w: 460, h: 104 }; r.trayC = { x: 648, y: T - 52, w: 460, h: 104 };
    r.hud = R(560, T, 170, 100);
    r.lw = LW; r.lh = r.ch;
  } else {
    const ice = !!mods.ice, wh = 116;
    r.appr = { x: 14, y: 8, w: LW - 28, h: wh }; r.alt = { x: 14, y: wh + 10, w: LW - 28, h: 58 };
    const A = wh + 10 + 58 + 10 + 48, B = A + 104;
    slot('ax0', 230, A); slot('ax1', 570, A); r.dial = R(400, A, 120, 120);
    slot('en0', 230, B); slot('en1', 570, B); r.gauge = R(400, B + 8, 230, 108);
    // pilot column (left) / co-pilot column (right): eight slots across the 800 wide panel
    const P1 = B + 104, P2 = P1 + 100;
    slot('ra0', 50, P1); slot('lg0', 150, P1); slot('lg1', 250, P1); slot('lg2', 350, P1);
    if (ice) { for (let i = 0; i < 4; i++) { slot('it' + i, 50 + i * 100, P2); slot('ib' + i, 50 + i * 100, P2 + 100); } }
    else { slot('br0', 50, P2); slot('br1', 150, P2); slot('br2', 250, P2); }
    slot('fl0', 450, P1); slot('fl1', 550, P1); slot('fl2', 650, P1); slot('fl3', 750, P1);
    slot('ra1', 650, P2); slot('ra2', 750, P2);
    const R3 = P2 + (ice ? 200 : 100); let C2 = R3;
    if (mods.kero) slot('ke', 450, P2);
    if (mods.intern) { slot('in0', 150, R3); slot('in1', 650, R3); r.tokens = { x: 220, y: R3 - 22, w: 360, h: 44 }; C2 = R3 + 100; }
    slot('co0', 300, C2); slot('co1', 400, C2); slot('co2', 500, C2); r.coffee = R(400, C2 + 62, 300, 24); r.rerolls = R(680, C2 + 6, 150, 60);
    if (mods.wind) r.wind = R(110, C2, 90, 90);
    if (mods.kero || mods.leak) r.fuel = { x: 14, y: C2 + 52, w: 230, h: 26 };
    const T = C2 + 140; r.ch = T + 64;
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
  let rl = build(mode, lw, LH, opt.mods || {}, opt.me); const r = {};
  if (rl.ch > LH + .5) { LH = rl.ch; k = Math.min(k, H / LH); rl = build(mode, lw, LH, opt.mods || {}, opt.me); }
  if (rl.ch) LH = Math.min(LH, rl.ch); const oy = (H - LH * k) / 2, ox = (W - lw * k) / 2;
  for (const n of Object.keys(rl)) { const q = rl[n]; if (q && typeof q === 'object') r[n] = { x: ox + q.x * k, y: oy + q.y * k, w: q.w * k, h: q.h * k }; }
  return { mode, k, ox, oy, lw, lh: LH, r, die: 72 * k, logical: rl, W, H };
}
FA.layout = layout; FA.layoutLogical = (mode, LH, mods, me) => build(mode, mode === 'L' ? 1120 : 800, LH, mods || {}, me);
if (typeof module === 'object' && module.exports) module.exports = FA;
})(typeof globalThis !== 'undefined' ? globalThis : this);
