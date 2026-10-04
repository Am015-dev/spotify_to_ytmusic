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
function build(mode, LW, LH, mods) {
  const r = {}, S = 88;   // slot size
  mods = mods || {};
  const slot = (k, cx, cy) => { r[k] = R(cx, cy, S, S); };
  if (mode === 'L') {
    const e = (LH - 620) / 280;   // 0 (compact) .. 1 (tall)
    const wh = 82 + 40 * e;                                  // window height
    const A = 170 + 30 * e + (wh - 82) * 0.4, B = A + 110 + 36 * e, C = B + 110 + 36 * e;   // row centres
    r.appr = { x: 20, y: 10, w: 700, h: wh }; r.alt = { x: 740, y: 10, w: 640, h: wh };
    // pilot side
    slot('ra0', 90, A); slot('lg0', 150, B); slot('lg1', 250, B); slot('lg2', 350, B);
    if (mods.ice) { for (let i = 0; i < 4; i++) { slot('it' + i, 110 + i * 100, C - 40 + 0); slot('ib' + i, 110 + i * 100, C + 62); } }
    else { slot('br0', 150, C); slot('br1', 250, C); slot('br2', 350, C); }
    // centre: axis, engines, concentration
    slot('ax0', 535, A); slot('ax1', 865, A); r.dial = R(700, A, 150, 150);
    slot('en0', 535, B); slot('en1', 865, B); r.gauge = R(700, B + 6, 240, 120);
    slot('co0', 600, C); slot('co1', 700, C); slot('co2', 800, C); r.coffee = R(700, C + 62, 300, 30);
    // co-pilot side
    slot('ra1', 1190, A); slot('ra2', 1290, A);
    slot('fl0', 1010, B); slot('fl1', 1110, B); slot('fl2', 1210, B); slot('fl3', 1310, B);
    // modules
    r.rerolls = R(1100, C, 150, 60);
    if (mods.kero) { slot('ke', 400, A); r.fuel = { x: 200, y: A - 12, w: 170, h: 24 }; }
    else if (mods.leak) r.fuel = { x: 200, y: A - 12, w: 240, h: 24 };
    if (mods.wind) r.wind = R(mods.kero ? 270 : 330, A, 96, 96);
    if (mods.intern) { slot('in0', 1010, C); slot('in1', 1310, C); r.tokens = { x: 1050, y: C - 24, w: 220, h: 48 }; }
    // trays (dice behind the screens)
    const T = LH - 56;
    r.trayP = { x: 30, y: T - 48, w: 440, h: 96 }; r.trayC = { x: 930, y: T - 48, w: 440, h: 96 };
    r.hud = R(700, T, 380, 90);
    r.lw = LW; r.lh = LH;
  } else {
    const e = (LH - 1050) / 450;
    const wh = 96;
    const A = 300 + 20 * e, B = A + 150 + 22 * e, Cc = B + 150 + 22 * e;
    r.appr = { x: 14, y: 8, w: LW - 28, h: wh }; r.alt = { x: 14, y: 112, w: LW - 28, h: 74 };
    slot('ax0', 230, A); slot('ax1', 570, A); r.dial = R(400, A, 170, 170);
    slot('en0', 230, B); slot('en1', 570, B); r.gauge = R(400, B + 6, 240, 120);
    // pilot column (left) / co-pilot column (right)
    const P1 = Cc + 10, P2 = P1 + 100;
    slot('ra0', 60, P1); slot('lg0', 160, P1); slot('lg1', 260, P1); slot('lg2', 360, P1);
    if (mods.ice) { for (let i = 0; i < 4; i++) { slot('it' + i, 60 + i * 100, P2); slot('ib' + i, 60 + i * 100, P2 + 100); } }
    else { slot('br0', 60, P2); slot('br1', 160, P2); slot('br2', 260, P2); }
    slot('fl0', 440, P1); slot('fl1', 540, P1); slot('fl2', 640, P1); slot('fl3', 740, P1);
    slot('ra1', 640, P2); slot('ra2', 740, P2);
    const C2 = P2 + (mods.ice ? 200 : 100);
    slot('co0', 300, C2); slot('co1', 400, C2); slot('co2', 500, C2); r.coffee = R(400, C2 + 56, 300, 24); r.rerolls = R(660, C2, 150, 60);
    if (mods.kero) { slot('ke', 440, P2); r.fuel = { x: 20, y: C2 - 12, w: 220, h: 24 }; } else if (mods.leak) r.fuel = { x: 20, y: C2 - 12, w: 220, h: 24 };
    if (mods.wind) r.wind = R(mods.ice ? 130 : 130, C2, 90, 90);
    if (mods.intern) { slot('in0', 440, P2 + (mods.kero ? 100 : 0)); slot('in1', 740, P2 + (mods.kero ? 100 : 0)); r.tokens = { x: 480, y: P2 + (mods.kero ? 100 : 0) - 22, w: 220, h: 44 }; }
    const T = LH - 58;
    r.trayP = { x: 14, y: T - 50, w: 380, h: 100 }; r.trayC = { x: 406, y: T - 50, w: 380, h: 100 };
    r.hud = R(400, T - 112, 380, 50);
    r.lw = LW; r.lh = LH;
  }
  return r;
}
function layout(W, H, opt) {
  opt = opt || {}; W = Math.max(60, W); H = Math.max(60, H);
  const mode = opt.mode || (W / H >= 1.08 ? 'L' : 'P');
  let LW, minH, maxH;
  if (mode === 'L') { LW = 1400; minH = 610; maxH = 900; } else { LW = 800; minH = 1060; maxH = 1500; }
  // widest scale that fits: width-limited first, then height-limited
  let k = W / LW, LH = H / k;
  if (LH < minH) { k = H / minH; LH = minH; }
  if (LH > maxH) LH = maxH;
  const lw = LW, ox = (W - lw * k) / 2, oy = (H - LH * k) / 2;
  const rl = build(mode, lw, LH, opt.mods), r = {};
  for (const n of Object.keys(rl)) { const q = rl[n]; if (q && typeof q === 'object') r[n] = { x: ox + q.x * k, y: oy + q.y * k, w: q.w * k, h: q.h * k }; }
  return { mode, k, ox, oy, lw, lh: LH, r, die: 72 * k, logical: rl, W, H };
}
FA.layout = layout; FA.layoutLogical = (mode, LH, mods) => build(mode, mode === 'L' ? 1400 : 800, LH, mods);
if (typeof module === 'object' && module.exports) module.exports = FA;
})(typeof globalThis !== 'undefined' ? globalThis : this);
