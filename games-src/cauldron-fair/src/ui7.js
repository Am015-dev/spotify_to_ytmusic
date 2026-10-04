// ===================== part 7: the painted cauldron (PixiJS 8: WebGL, else Pixi's canvas renderer, else the plain SVG view) =====================
// The DOM stays the layout / hit / accessibility layer (thumbnails, buttons, the invisible SVG cauldron). When the Pixi cauldron is on (html.px)
// the SVG pot is hidden and this layer draws the painted cauldron, the spiral spaces, the chips and the droplet at the same place, reading the
// box of #cwrap after every render(). Each chip that lands flies out of the bag in an arc with a splash and rising bubbles; the potion bubbles
// more the fuller the pot gets; an explosion is a puff of smoke, a red flash and a shake; a flask puts the chip back into the bag.
// Nothing here changes the game state: it only follows it (so hidden information stays hidden: a sprite only shows what the pot shows).
const PX = { on: false, app: null, q: 'high', res: 1, kind: '', cv: null, L: {}, tex: {}, img: {}, chips: new Map(), tweens: [], parts: [], amb: [], t: 0, last: 0, dirty: true, err: '', ready: false, raf: 0,
  S: 0, cx: 0, cy: 0, k: 1, seat: -1, flyIds: {}, backIds: {}, snap: true, bag: { x: 0, y: 0 }, moving: false, frames: 0, shake: 0, flash: 0, boomSeat: -1, board: null, texKey: '' };
const PXQ = { high: { pr: 2, fx: 1, parts: 1 }, medium: { pr: 1.5, fx: .55, parts: .5 }, low: { pr: 1, fx: 0, parts: 0 } };
const pxRM = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };
function gfxAuto() { const n = navigator.hardwareConcurrency || 4, mem = navigator.deviceMemory || 4, ph = isPh(); if (n <= 2 || mem <= 2) return 'low'; if (PX.soft) return 'low'; return ph ? 'medium' : 'high'; }
function gfxPref() { return UI.prefs.gfx || 'auto'; }
function gfxLevel() { const p = gfxPref(); return p === 'auto' ? (PX.autoQ || gfxAuto()) : p; }
// ---- boot ----
async function pxInit() {
  try {
    if (/jsdom/i.test(navigator.userAgent || '') || /[?&]px=0/.test(location.search) || typeof CF_ART === 'undefined' || !KIT.ART.cauldron) return false;
    if (!window.PIXI) { const src = document.getElementById('pixi-src'); if (!src) return false; const s = document.createElement('script'); s.textContent = src.textContent; document.head.appendChild(s); }
    if (!window.PIXI || !PIXI.Application) return false;
    const bd = $('#bd'); const cv = document.createElement('canvas'); cv.id = 'pxc'; cv.setAttribute('aria-hidden', 'true'); bd.insertBefore(cv, bd.firstChild);
    PX.q = gfxLevel(); PX.res = pxBasePR();
    const want = /[?&]px=canvas/.test(location.search) ? ['canvas'] : ['webgl', 'canvas']; let app = null;
    for (const pref of want) {
      try {
        const a = new PIXI.Application();
        await a.init({ canvas: cv, backgroundAlpha: 0, antialias: false, resolution: PX.res, autoDensity: true, preference: pref, autoStart: false, sharedTicker: false, width: Math.max(16, bd.clientWidth), height: Math.max(16, bd.clientHeight), powerPreference: 'low-power', failIfMajorPerformanceCaveat: false });
        app = a; PX.kind = (a.renderer && a.renderer.name) || pref; break;
      } catch (e) { PX.err += pref + ': ' + (e && e.message || e) + '; '; }
    }
    if (!app) { cv.remove(); return false; }
    PX.app = app; PX.cv = cv;
    try { const gl = app.renderer.gl; if (gl) { const ext = gl.getExtension('WEBGL_debug_renderer_info'); const r = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : ''; if (/swiftshader|llvmpipe|software/i.test(r)) PX.soft = true; PX.gpu = r; } } catch (e) { }
    if (gfxPref() === 'auto') { PX.q = gfxLevel(); pxSetRes(pxBasePR()); }
    cv.addEventListener('webglcontextlost', e => { e.preventDefault(); pxOff('context lost'); });
    await pxTextures();
    const st = app.stage, C = () => new PIXI.Container();
    PX.root = C(); st.addChild(PX.root);
    PX.L = { board: C(), amb: C(), chips: C(), mark: C(), fly: C(), fx: C() };
    for (const k of ['board', 'amb', 'chips', 'mark', 'fly', 'fx']) PX.root.addChild(PX.L[k]);
    PX.boardSp = new PIXI.Sprite(PIXI.Texture.EMPTY); PX.L.board.addChild(PX.boardSp);
    PX.flashG = new PIXI.Graphics(); PX.L.fx.addChild(PX.flashG);
    PX.ring = new PIXI.Graphics(); PX.L.mark.addChild(PX.ring);
    PX.drop = new PIXI.Sprite(PX.tex.droplet); PX.drop.anchor.set(.5, .62); PX.L.mark.addChild(PX.drop);
    PX.rat = new PIXI.Sprite(PX.tex.rat); PX.rat.anchor.set(.5, .6); PX.rat.visible = false; PX.L.mark.addChild(PX.rat);
    PX.on = true; PX.ready = true; document.documentElement.classList.add('px'); $('#bd').classList.add('hasart');
    pxApplyQ();
    if (window.ResizeObserver) new ResizeObserver(() => { pxResize(); }).observe(bd);
    pxResize(); pxLoop();
    return true;
  } catch (e) { console.warn('painted cauldron off:', e); pxOff(String(e && e.message || e)); return false; }
}
function pxOff(why) {
  PX.on = false; PX.err += (why || '') + ';'; document.documentElement.classList.remove('px');
  try { if (PX.cv) PX.cv.remove(); } catch (e) { }
  try { if (G && UI.started) { UI.potSig = ''; render(); } } catch (e) { }
}
function pxBasePR() { const d = window.devicePixelRatio || 1; const q = PXQ[PX.q] || PXQ.high; const w = Math.min(q.pr, d); return window.PerfHUD && PerfHUD.pixelRatio ? PerfHUD.pixelRatio(w) : w; }
function pxSetRes(v) { PX.res = v; if (PX.app && PX.app.renderer) { try { PX.app.renderer.resolution = v; pxResize(true); } catch (e) { } } }
function pxApplyQ() { PX.q = gfxLevel(); pxSetRes(pxBasePR()); PX.texKey = ''; PX.dirty = true; if (PX.on) pxDirty(); }
function setGfx(v) { UI.prefs.gfx = v; savePrefs(); PX.autoQ = null; if (PX.on) { pxApplyQ(); pxPerfReg(); } }
// ---- textures ----
function pxLoadImg(url) { return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; }); }
async function pxTextures() {
  const ids = Object.keys(KIT.ART);
  await Promise.all(ids.map(async k => { try { const im = await pxLoadImg(KIT.ART[k]); PX.img[k] = im; PX.tex[k] = PIXI.Texture.from(im); } catch (e) { } }));
  const mk = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); return PIXI.Texture.from(c); };
  const radial = stops => (x, w, h) => { const g = x.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); stops.forEach(s => g.addColorStop(s[0], s[1])); x.fillStyle = g; x.fillRect(0, 0, w, h); };
  PX.tex.shadow = mk(64, 64, radial([[0, 'rgba(20,8,24,.55)'], [.6, 'rgba(20,8,24,.28)'], [1, 'rgba(20,8,24,0)']]));
  PX.tex.glow = mk(64, 64, radial([[0, 'rgba(255,225,120,.95)'], [.5, 'rgba(255,190,60,.4)'], [1, 'rgba(255,170,40,0)']]));
  PX.tex.red = mk(64, 64, radial([[0, 'rgba(255,120,60,.95)'], [.55, 'rgba(230,60,30,.45)'], [1, 'rgba(200,30,20,0)']]));
}
// the painted chip with its number (the same look as the SVG chip), cached per colour/value
function pxChipTex(key) {
  const k = 'chip:' + key; if (PX.tex[k]) return PX.tex[k];
  const c = key[0], v = +key.slice(1), D2 = 128, cv = document.createElement('canvas'); cv.width = cv.height = D2; const x = cv.getContext('2d');
  const im = PX.img['chip-' + c]; if (im) x.drawImage(im, 0, 0, D2, D2); else { x.fillStyle = D.COLORS[c].css; x.beginPath(); x.arc(64, 64, 60, 0, 7); x.fill(); }
  x.font = '900 ' + (c === 'W' ? 56 : 58) + 'px Nunito,Trebuchet MS,Segoe UI,sans-serif'; x.textAlign = 'center'; x.textBaseline = 'alphabetic'; x.lineJoin = 'round';
  const light = c === 'W' || c === 'Y'; x.lineWidth = light ? 5 : 8; x.strokeStyle = light ? '#fff' : '#2a1608'; x.fillStyle = light ? '#3a2616' : '#fff';
  const ty = Math.round(D2 * (c === 'W' ? .79 : .75)); x.strokeText(String(v), 64, ty); x.fillText(String(v), 64, ty);
  return PX.tex[k] = PIXI.Texture.from(cv);
}
const BANDS = { n0: '#efe6cf', n1: '#f3efd0', n5: '#e3efc8', n10: '#cde6c4', ruby: '#f4c6cc', spoon: '#f0d8a0' };
function padKind(i) { return i === D.SPOON ? 'spoon' : D.RUBY[i] ? 'ruby' : D.VP[i] >= 10 ? 'n10' : D.VP[i] >= 5 ? 'n5' : D.VP[i] >= 1 ? 'n1' : 'n0'; }
// the static board: painted cauldron + the 54 spaces with their numbers, drawn once per size into one texture
function pxBuildBoard(S) {
  const r = Math.min(2.2, Math.max(1, PX.res)), W = Math.max(64, Math.round(S * r)), cv = document.createElement('canvas'); cv.width = cv.height = W; const x = cv.getContext('2d'); const R = KIT.GEO.R, u = W / (2 * R);
  const cauldron = PX.img.cauldron; if (cauldron) x.drawImage(cauldron, 0, 0, W, W); else { x.fillStyle = '#2a8a80'; x.beginPath(); x.arc(W / 2, W / 2, W / 2 - 4, 0, 7); x.fill(); }
  const pads = {}, pd = Math.round(.98 * u); for (const kd in BANDS) { const c = document.createElement('canvas'); c.width = c.height = pd; const y = c.getContext('2d'); if (PX.img.pad) y.drawImage(PX.img.pad, 0, 0, pd, pd); else { y.fillStyle = '#f4ecd2'; y.beginPath(); y.arc(pd / 2, pd / 2, pd / 2, 0, 7); y.fill(); } y.globalCompositeOperation = 'source-atop'; y.globalAlpha = .6; y.fillStyle = BANDS[kd]; y.fillRect(0, 0, pd, pd); pads[kd] = c; }
  const ff = 'Nunito,Trebuchet MS,Segoe UI,sans-serif';
  { const P0 = KIT.GEO.pts; x.save(); x.strokeStyle = 'rgba(255,246,220,.5)'; x.lineWidth = Math.max(1.5, .09 * u); x.setLineDash([.1 * u, .12 * u]); x.beginPath(); P0.forEach((q, i) => { const X = W / 2 + q.x * u, Y = W / 2 + q.y * u; i ? x.lineTo(X, Y) : x.moveTo(X, Y); }); x.stroke(); x.restore(); }
  for (let i = 0; i < KIT.GEO.pts.length; i++) {
    const p = KIT.GEO.pts[i], X = W / 2 + p.x * u, Y = W / 2 + p.y * u;
    x.globalAlpha = i === 0 ? .85 : .96; x.drawImage(pads[padKind(i)], X - pd / 2, Y - pd / 2); x.globalAlpha = 1;
    if (i === 0) continue;
    x.textAlign = 'center'; x.fillStyle = '#4a2a22';
    if (i === D.SPOON) { x.font = '900 ' + Math.round(.27 * u) + 'px ' + ff; x.fillStyle = '#6a3a12'; x.fillText('15 VP', X, Y - .02 * u); x.fillText('35', X, Y + .3 * u); continue; }
    x.font = '900 ' + Math.round(.46 * u) + 'px ' + ff; x.fillText(String(D.COINS[i]), X, Y + .16 * u);
    if (D.VP[i] > 0) { x.fillStyle = '#7a4a1a'; const bw = .52 * u, bh = .36 * u, bx = X + .06 * u, by = Y - .62 * u; x.beginPath(); (x.roundRect ? x.roundRect(bx, by, bw, bh, .07 * u) : x.rect(bx, by, bw, bh)); x.fill(); x.strokeStyle = '#fff6dc'; x.lineWidth = Math.max(1, .03 * u); x.stroke(); x.fillStyle = '#fff6dc'; x.font = '900 ' + Math.round(.31 * u) + 'px ' + ff; x.fillText(String(D.VP[i]), bx + bw / 2, by + bh * .8); }
    if (D.RUBY[i]) { const rb = PX.img.ruby, sz = .36 * u; if (rb) x.drawImage(rb, X - .52 * u, Y - .6 * u, sz, sz); }
  }
  { const P0 = KIT.GEO.pts; x.fillStyle = 'rgba(255,246,220,.85)'; for (let i = 1; i < P0.length - 1; i += 2) { const a = P0[i], b = P0[i + 1], mx = W / 2 + (a.x + b.x) / 2 * u, my = W / 2 + (a.y + b.y) / 2 * u, ang = Math.atan2(b.y - a.y, b.x - a.x); x.save(); x.translate(mx, my); x.rotate(ang); x.beginPath(); x.moveTo(-.1 * u, -.1 * u); x.lineTo(.12 * u, 0); x.lineTo(-.1 * u, .1 * u); x.closePath(); x.fill(); x.restore(); } }
  return PIXI.Texture.from(cv);
}
// ---- layout read ----
let pxQueued = false;
function pxDirty() { if (!PX.on || pxQueued) return; pxQueued = true; requestAnimationFrame(() => { pxQueued = false; try { pxSync(); } catch (e) { console.error(e); } }); }
function pxResize(force) {
  if (!PX.app) return; const bd = $('#bd'); const w = Math.max(16, bd.clientWidth), h = Math.max(16, bd.clientHeight);
  if (force || w !== PX.w || h !== PX.h) { PX.w = w; PX.h = h; try { PX.app.renderer.resize(w, h, PX.res); } catch (e) { } PX.dirty = true; }
  pxDirty();
}
const pxPos = i => { const p = KIT.GEO.pts[Math.max(0, Math.min(D.TRACK_LEN - 1, i))]; return { x: PX.cx + p.x * PX.k, y: PX.cy + p.y * PX.k }; };
function pxClear() { for (const [, o] of PX.chips) { try { o.sp.destroy(); o.sh.destroy(); } catch (e) { } } PX.chips.clear(); PX.L.chips && PX.L.chips.removeChildren(); if (PX.boardSp) PX.boardSp.visible = false; if (PX.ring) PX.ring.visible = false; if (PX.drop) PX.drop.visible = false; if (PX.rat) PX.rat.visible = false; PX.seat = -1; }
function pxSync() {
  if (!PX.on) return;
  if (!G || !UI.started) { pxClear(); PX.dirty = true; return; }
  const bd = $('#bd'), cw = $('#cwrap'); if (!cw) return; const B = bd.getBoundingClientRect(), r = cw.getBoundingClientRect(); if (r.width < 20) return;
  const S = Math.round(Math.min(r.width, r.height)), cx = r.left - B.left + r.width / 2, cy = r.top - B.top + r.height / 2;
  const f = focusSeat(), p = G.players[f], snapAll = PX.seat !== f || !ANIM || pxRM() || UI.sim;
  const q = PXQ[PX.q], keyT = S + '|' + PX.res;
  if (PX.texKey !== keyT) { PX.texKey = keyT; try { if (PX.boardSp.texture && PX.boardSp.texture !== PIXI.Texture.EMPTY) PX.boardSp.texture.destroy(true); } catch (e) { } PX.boardSp.texture = pxBuildBoard(S); }
  PX.S = S; PX.cx = cx; PX.cy = cy; PX.k = S / (2 * KIT.GEO.R);
  PX.boardSp.visible = true; PX.boardSp.width = PX.boardSp.height = S; PX.boardSp.x = cx - S / 2; PX.boardSp.y = cy - S / 2;
  const bi = $('#bagi'); if (bi) { const b = bi.getBoundingClientRect(); PX.bag = { x: b.left - B.left + 18, y: b.top - B.top + 20 }; }
  const csz = .98 * PX.k;
  if (PX.seat !== f) { pxClearChips(); PX.seat = f; PX.snap = true; }
  // chips: reconcile sprites with the pot
  const want = new Map(); p.pot.forEach((c, idx) => want.set(c.i, { c, idx }));
  for (const [id, o] of PX.chips) {
    if (want.has(id)) continue;
    // left the pot: flew back (flask, put back, restart, end of the day) or simply vanished
    PX.chips.delete(id); o.gone = true;
    const back = PX.backIds[id] || snapAll === false; delete PX.backIds[id];
    if (snapAll || !q.fx && !back) { pxKill(o); continue; }
    const t0 = performance.now() + (o.stagger || 0) * 45;
    PX.tweens.push({ t0, dur: 420, from: { x: o.sp.x, y: o.sp.y, s: o.sp.scale.x }, to: { x: PX.bag.x, y: PX.bag.y, s: csz / 128 * .55 }, arc: -PX.k * 1.4, obj: o, ease: pxEase, kill: true, back: true });
  }
  let n = 0;
  for (const [id, w] of want) {
    let o = PX.chips.get(id); const tp = pxPos(w.c.pos);
    if (!o) {
      o = pxMakeChip(w.c); PX.chips.set(id, o); o.pos = w.c.pos;
      const fly = PX.flyIds[id]; delete PX.flyIds[id];
      if (fly && !snapAll) { o.sp.x = PX.bag.x; o.sp.y = PX.bag.y; o.sp.scale.set(csz / 128 * 1.5); o.sp.rotation = -.6; o.sp.alpha = 0; o.sh.visible = false; o.flying = true; o.tx = tp.x; o.ty = tp.y;
        PX.nFly = (PX.nFly || 0) + 1; PX.tweens.push({ t0: performance.now(), dur: 520, from: { x: PX.bag.x, y: PX.bag.y, s: csz / 128 * 1.5, r: -.6 }, to: { x: tp.x, y: tp.y, s: csz / 128, r: 0 }, arc: -PX.k * 2.6, obj: o, ease: pxEase, land: true }); }
      else { o.sp.x = tp.x; o.sp.y = tp.y; o.sp.scale.set(csz / 128); }
    } else if (o.pos !== w.c.pos) {
      o.pos = w.c.pos; if (snapAll) { o.sp.x = tp.x; o.sp.y = tp.y; } else PX.tweens.push({ t0: performance.now(), dur: 380, from: { x: o.sp.x, y: o.sp.y, s: o.sp.scale.x }, to: { x: tp.x, y: tp.y, s: csz / 128 }, obj: o, ease: pxEase });
    }
    o.tx = tp.x; o.ty = tp.y; o.stagger = n++;
    if (!o.flying) { o.sp.scale.set(csz / 128); if (!PX.tweens.some(t => t.obj === o)) { o.sp.x = tp.x; o.sp.y = tp.y; } }
    o.sh.x = o.sp.x + csz * .07; o.sh.y = o.sp.y + csz * .12; o.sh.width = csz * 1.15; o.sh.height = csz * 1.05;
  }
  // droplet, rat stone, the ring on the scoring space
  PX.drop.visible = true; const dp = pxPos(p.droplet); pxMoveMark(PX.drop, dp.x, dp.y, csz * .86, snapAll);
  const hasRat = p.rat > 0 && p.rat > p.droplet; PX.rat.visible = hasRat; if (hasRat) { const rp = pxPos(p.rat); pxMoveMark(PX.rat, rp.x, rp.y - csz * .08, csz * 1.0, snapAll); }
  PX.ringAt = pxPos(CF.spaceOf(p)); PX.ring.visible = !!PX.ringAt;
  PX.boomNow = !!p.boom; PX.boardSp.tint = p.boom ? 0xffb090 : 0xffffff;
  PX.snap = false; PX.dirty = true; PX.chipsN = p.pot.length;
}
function pxMoveMark(sp, x, y, d, snap) {
  const w = sp.texture.width || 96; sp.scale.set(d / w);
  if (snap || sp.__x == null) { sp.x = x; sp.y = y; sp.__x = x; sp.__y = y; return; }
  if (Math.abs(sp.__x - x) > .5 || Math.abs(sp.__y - y) > .5) { PX.tweens.push({ t0: performance.now(), dur: 340, from: { x: sp.x, y: sp.y }, to: { x, y }, obj: { sp, mark: 1 }, ease: pxEase }); sp.__x = x; sp.__y = y; }
}
function pxClearChips() { for (const [, o] of PX.chips) pxKill(o); PX.chips.clear(); PX.tweens = PX.tweens.filter(t => !(t.obj && t.obj.gone)); }
function pxKill(o) { try { o.sp.destroy(); o.sh.destroy(); } catch (e) { } o.dead = true; }
function pxMakeChip(c) {
  const sp = new PIXI.Sprite(pxChipTex(c.c + c.v)); sp.anchor.set(.5); const sh = new PIXI.Sprite(PX.tex.shadow); sh.anchor.set(.5);
  PX.L.chips.addChild(sh); PX.L.chips.addChild(sp); return { id: c.i, sp, sh, key: c.c + c.v };
}
const pxEase = t => 1 - Math.pow(1 - t, 3);
// ---- events from the engine (playEvents) ----
function pxEvent(e) {
  if (!PX.on || !G) return; const f = focusSeat(); if (e.seat !== f) { return; }
  const q = PXQ[PX.q];
  if (e.t === 'place' || e.t === 'side') { if (e.t === 'place') PX.flyIds[e.chip.i] = 1; }
  else if (e.t === 'flask') { PX.backIds[e.chip.i] = 1; }
  else if (e.t === 'restart') { const p = G.players[f]; p.pot.forEach(c => { PX.backIds[c.i] = 1; }); }
  else if (e.t === 'boom') { if (ANIM && !UI.sim) { PX.nBoom = (PX.nBoom || 0) + 1; PX.boomSeat = f; PX.flash = 1; PX.shake = .65; if (q.parts) for (let i = 0; i < Math.round(12 * q.parts); i++) pxPuff(PX.cx + (Math.random() - .5) * PX.S * .3, PX.cy + (Math.random() - .5) * PX.S * .3, i); } }
  else if (e.t === 'gain') { if (e.k === 'ruby' || e.k === 'vp') pxFloat((e.k === 'ruby' ? '+' + e.n + ' ruby' : '+' + e.n + ' VP'), e.k === 'ruby' ? 0xff7a8a : 0xffe08a); }
  pxDirty();
}
function pxPuff(x, y, i) { if (!PX.tex.puff) return; const sp = new PIXI.Sprite(PX.tex.puff); sp.anchor.set(.5); sp.x = x; sp.y = y; sp.alpha = 0; const s0 = PX.k * (.8 + Math.random() * .5); sp.scale.set(s0 / 160 * 1.2); PX.L.fx.addChild(sp); PX.parts.push({ sp, kind: 'puff', t: -i * .04, life: 1.1 + Math.random() * .5, vx: (Math.random() - .5) * PX.k * 2.6, vy: -PX.k * (1 + Math.random() * 2), s0: s0 / 160, s1: s0 / 160 * (2.2 + Math.random()) }); }
function pxSplash(x, y) {
  const q = PXQ[PX.q]; if (!q.parts || !PX.tex.splash) return; PX.nSplash = (PX.nSplash || 0) + 1; const sp = new PIXI.Sprite(PX.tex.splash); sp.anchor.set(.5); sp.x = x; sp.y = y; sp.alpha = .95; sp.scale.set(PX.k * .6 / 160); PX.L.fx.addChild(sp);
  PX.parts.push({ sp, kind: 'splash', t: 0, life: .55, s0: PX.k * .6 / 160, s1: PX.k * 2.4 / 160 });
  const nb = Math.round(4 * q.parts); for (let i = 0; i < nb; i++) { if (!PX.tex.bubble) break; const b = new PIXI.Sprite(PX.tex.bubble); b.anchor.set(.5); b.x = x + (Math.random() - .5) * PX.k * .8; b.y = y + (Math.random() - .5) * PX.k * .4; b.alpha = .9; const s0 = PX.k * (.16 + Math.random() * .2) / 96; b.scale.set(s0); PX.L.fx.addChild(b); PX.parts.push({ sp: b, kind: 'bub', t: -Math.random() * .12, life: .8 + Math.random() * .5, vy: -PX.k * (.9 + Math.random() * 1.2), vx: (Math.random() - .5) * PX.k, s0, s1: s0 * 1.6 }); }
}
function pxFloat(text, col) {
  const q = PXQ[PX.q]; if (!q.parts || !ANIM || UI.sim || !PIXI.Text) return;
  try { const t = new PIXI.Text({ text, style: { fontFamily: 'Nunito, Trebuchet MS, sans-serif', fontSize: Math.max(16, Math.round(PX.k * .6)), fontWeight: '900', fill: col, stroke: { color: 0x2a1608, width: 5 } } }); t.anchor.set(.5); t.x = PX.cx + (Math.random() - .5) * PX.S * .2; t.y = PX.cy - PX.S * .08; PX.L.fx.addChild(t); PX.parts.push({ sp: t, kind: 'txt', t: 0, life: 1.2, vy: -PX.k * 1.1 }); } catch (e) { }
}
// ---- the frame ----
function pxStepTweens(now) {
  const keep = [];
  for (const tw of PX.tweens) {
    if (tw.obj && tw.obj.dead) continue;
    const u0 = (now - tw.t0) / tw.dur; if (u0 < 0) { keep.push(tw); if (tw.obj && tw.obj.sp && tw.land) tw.obj.sp.alpha = 0; continue; }
    const u = Math.min(1, u0), e = (tw.ease || pxEase)(u), o = tw.obj, sp = o.sp; if (!sp || sp.destroyed) continue;
    sp.x = tw.from.x + (tw.to.x - tw.from.x) * e; sp.y = tw.from.y + (tw.to.y - tw.from.y) * e + (tw.arc ? tw.arc * Math.sin(Math.PI * e) : 0);
    if (tw.from.s != null && tw.to.s != null) sp.scale.set(tw.from.s + (tw.to.s - tw.from.s) * e);
    if (tw.from.r != null) sp.rotation = tw.from.r + (tw.to.r - tw.from.r) * e;
    if (tw.land) { sp.alpha = Math.min(1, u * 5); }
    if (tw.kill) sp.alpha = 1 - e * e;
    if (o.sh && !o.sh.destroyed) { o.sh.x = sp.x + 3; o.sh.y = sp.y + 6; }
    if (u < 1) keep.push(tw);
    else {
      if (tw.land) { PX.nLand = (PX.nLand || 0) + 1; o.flying = false; sp.alpha = 1; sp.rotation = 0; o.sh.visible = true; pxSplash(sp.x, sp.y); PX.pulse = 1; }
      if (tw.kill) pxKill(o);
    }
  }
  PX.tweens = keep;
}
function pxStepParts(dt) {
  const keep = [];
  for (const p of PX.parts) {
    p.t += dt; if (p.t < 0) { keep.push(p); continue; }
    const u = Math.min(1, p.t / p.life);
    if (p.kind === 'puff') { p.sp.x += p.vx * dt; p.sp.y += p.vy * dt; p.sp.scale.set(p.s0 + (p.s1 - p.s0) * u); p.sp.alpha = (u < .15 ? u / .15 : 1) * (1 - u) * .85; }
    else if (p.kind === 'splash') { p.sp.scale.set(p.s0 + (p.s1 - p.s0) * pxEase(u)); p.sp.alpha = .95 * (1 - u); }
    else if (p.kind === 'bub') { p.sp.x += p.vx * dt; p.sp.y += p.vy * dt; p.sp.scale.set(p.s0 + (p.s1 - p.s0) * u); p.sp.alpha = .9 * (1 - u * u); }
    else if (p.kind === 'txt') { p.sp.y += p.vy * dt; p.sp.alpha = u < .7 ? 1 : 1 - (u - .7) / .3; }
    if (u < 1) keep.push(p); else { try { p.sp.destroy(); } catch (e) { } }
  }
  PX.parts = keep;
}
function pxAmbient(dt) {
  const q = PXQ[PX.q]; const want = q.parts && PX.on && G && UI.started && !UI.sim ? Math.round((3 + Math.min(14, (PX.chipsN || 0) * 1.1)) * q.parts) : 0;
  while (PX.amb.length < want && PX.amb.length < 16 && PX.tex.bubble) { const b = new PIXI.Sprite(PX.tex.bubble); b.anchor.set(.5); b.__ph = Math.random(); b.__a = Math.random() * 6.28; b.__r = Math.sqrt(Math.random()) * .8; b.__sp = .25 + Math.random() * .4; PX.L.amb.addChild(b); PX.amb.push(b); }
  while (PX.amb.length > want) { const b = PX.amb.pop(); try { b.destroy(); } catch (e) { } }
  const hot = PX.boomNow ? 1.8 : 1;
  for (const b of PX.amb) { b.__ph += dt * b.__sp * hot; if (b.__ph > 1) { b.__ph = 0; b.__a = Math.random() * 6.28; b.__r = Math.sqrt(Math.random()) * .8; } const u = b.__ph, rr = b.__r * KIT.GEO.R * PX.k; b.x = PX.cx + Math.cos(b.__a) * rr; b.y = PX.cy + Math.sin(b.__a) * rr - u * PX.k * .4; const s = Math.sin(Math.PI * u); b.scale.set(PX.k * (.12 + .26 * s) / 96); b.alpha = .55 * s; b.tint = PX.boomNow ? 0xffc89a : 0xffffff; }
}
function pxFrame(ts) {
  if (!PX.on) return;
  const now = performance.now(), dt = Math.min(.05, Math.max(0, (now - (PX.last || now)) / 1000)); PX.last = now; PX.t += dt;
  const q = PXQ[PX.q], snap = !ANIM || pxRM() || UI.sim;
  pxStepTweens(now); pxStepParts(dt); pxAmbient(dt);
  let moving = PX.tweens.length > 0 || PX.parts.length > 0 || PX.amb.length > 0;
  // the scoring ring pulses; the pot "pops" when a chip lands; shake and flash after an explosion
  if (PX.ring && PX.ring.visible && PX.ringAt) { const a = .65 + .3 * Math.sin(PX.t * 4); PX.ring.clear(); PX.ring.circle(PX.ringAt.x, PX.ringAt.y, PX.k * .62).stroke({ width: Math.max(2.5, PX.k * .11), color: 0xf2b81e, alpha: q.fx ? a : .9 }); if (q.fx) moving = true; }
  if (PX.pulse > 0) { PX.pulse = Math.max(0, PX.pulse - dt * 3); const s = 1 + .018 * PX.pulse; PX.L.board.scale.set(s); PX.L.board.pivot.set(PX.cx, PX.cy); PX.L.board.position.set(PX.cx, PX.cy); moving = true; if (PX.pulse === 0) { PX.L.board.scale.set(1); PX.L.board.pivot.set(0, 0); PX.L.board.position.set(0, 0); } }
  if (PX.shake > 0) { PX.shake = Math.max(0, PX.shake - dt); PX.root.x = (Math.random() - .5) * 10 * PX.shake / .65; PX.root.y = (Math.random() - .5) * 8 * PX.shake / .65; moving = true; if (PX.shake === 0) { PX.root.x = 0; PX.root.y = 0; } }
  if (PX.flash > 0) { PX.flash = Math.max(0, PX.flash - dt * 2.4); moving = true; PX.flashG.clear(); if (PX.flash > 0) PX.flashG.circle(PX.cx, PX.cy, PX.S / 2 - 2).fill({ color: 0xff5030, alpha: PX.flash * .5 }); else PX.flashG.clear(); }
  PX.moving = moving;
  if (moving || PX.dirty || PerfHUDtesting()) { PX.dirty = false; try { PX.app.renderer.render(PX.app.stage); PX.frames = (PX.frames || 0) + 1; } catch (e) { pxOff('render: ' + (e && e.message)); } }
}
const PerfHUDtesting = () => !!(window.PerfHUD && PerfHUD.testing);
function pxLoop() {
  const PH = window.PerfHUD && PerfHUD.live ? PerfHUD : null;
  const tick = ts => { PX.raf = (PH ? PH.raf : requestAnimationFrame)(tick); try { pxFrame(ts); } catch (e) { console.error(e); } };
  PX.raf = (PH ? PH.raf : requestAnimationFrame)(tick);
}
// ---- PerfHUD: levels, pixel ratio cap, "something is moving" for the idle saver
function pxPerfReg() {
  try {
    if (!window.PerfHUD || !PerfHUD.register) return;
    const shim = PX.on ? { getPixelRatio: () => PX.res, setPixelRatio: v => pxSetRes(v), get domElement() { return PX.cv; }, getContext: () => PX.app && PX.app.renderer && PX.app.renderer.gl || null } : null;
    PerfHUD.register({ game: 'Cauldron Fair', anchor: '.gx-board', corner: 'tl', renderer: shim, levels: ['high', 'medium', 'low'],
      getLevel: () => PX.q, isAuto: () => gfxPref() === 'auto',
      setLevel: (l, why) => { if (why === 'apply') setGfx(l); else { PX.autoQ = l; pxApplyQ(); } try { if (GX.open === 'setd') renderMenu(); } catch (e) { } },
      basePR: () => { const d = window.devicePixelRatio || 1; return Math.min((PXQ[PX.q] || PXQ.high).pr, d); }, onPixelRatio: v => pxSetRes(v),
      isAnimating: () => !!PX.tweens.length || !!PX.parts.length, idleMode: PX.on ? 'throttle' : 'demand', idleFps: 10 });
  } catch (e) { }
}
// test hooks (px-test.js): what the Pixi layer is showing
PX.sprites = () => Array.from(PX.chips.values()).filter(o => !o.dead && !o.gone).map(o => ({ id: o.id, key: o.key, x: Math.round(o.sp.x), y: Math.round(o.sp.y), visible: o.sp.visible, alpha: o.sp.alpha }));
PX.busy = () => PX.tweens.length > 0 || PX.parts.some(p => p.kind !== 'bub' && p.kind !== 'splash') || PX.flying;
PX.target = i => { const p = pxPos(i); return { x: Math.round(p.x), y: Math.round(p.y) }; };

PX.state = () => ({ pend: !!pxQueued || !!PX.dirty, on: PX.on, kind: PX.kind, q: PX.q, res: PX.res, tweens: PX.tweens.length, parts: PX.parts.filter(p => p.kind !== 'bub').length, amb: PX.amb.length, nFly: PX.nFly || 0, nLand: PX.nLand || 0, nBoom: PX.nBoom || 0, nSplash: PX.nSplash || 0, frames: PX.frames || 0,
  objs: Array.from(PX.chips.values()).filter(o => !o.dead && !o.gone).map(o => ({ id: o.id, key: o.key, x: o.sp.x, y: o.sp.y, tx: o.tx, ty: o.ty, visible: o.sp.visible, alpha: o.sp.alpha, flying: !!o.flying })),
  drop: PX.drop ? { x: PX.drop.x, y: PX.drop.y, vis: PX.drop.visible } : null, filters: [PX.root, PX.L.board, PX.L.chips, PX.L.amb, PX.L.fx, PX.L.mark].filter(c => c && c.filters && c.filters.length).length, S: PX.S, cx: PX.cx, cy: PX.cy });
PX.canvasInk = () => { try { const c = PX.app.renderer.extract.canvas(PX.app.stage); const x = c.getContext('2d'), w = c.width, h = c.height; const d = x.getImageData(0, 0, w, h).data; let n = 0, tot = 0; for (let i = 3; i < d.length; i += 4 * 37) { tot++; if (d[i] > 20) n++; } return n / Math.max(1, tot); } catch (e) { return -1; } };
