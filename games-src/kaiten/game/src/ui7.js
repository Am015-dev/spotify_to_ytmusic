// ===================== part 7: the painted table (PixiJS 8: WebGL, else Pixi's canvas renderer, else the plain DOM view) =====================
// The DOM stays the layout, hit and accessibility layer: every plate on the belt and every group on a counter is still a real <button>.
// When the Pixi table is on (html.kkpx), those buttons keep their text badges but hide their own pictures; this layer reads their boxes
// after every render() and moves painted sprites there: cards ease to their new places (FLIP-style re-flow), served cards fly to the seat,
// plates land on the counters with a squash, hands slide along the belt, steam / flames / sparkles and a burst when a plate scores.
// Nothing here changes the game state; it only follows the DOM (so hidden hands stay hidden: a sprite only shows what its button shows).
const PX = { on: false, app: null, q: 'high', res: 1, kind: '', B: null, cv: null, L: {}, objs: new Map(), tweens: [], parts: [], tex: {}, img: {}, faceP: {}, hw: 0, dirty: true, t: 0, last: 0, beltX: 0, seats: new Map(), err: '', ready: false, raf: 0, landQ: [] };
const PXQ = { high: { pr: 2, fx: 1, blur: true, parts: 1, belt: 1 }, medium: { pr: 1.5, fx: .55, blur: false, parts: .5, belt: 1 }, low: { pr: 1, fx: 0, blur: false, parts: 0, belt: 0 } };
const pxRM = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };
function gfxAuto() {
  const n = navigator.hardwareConcurrency || 4, mem = navigator.deviceMemory || 4, ph = isPh();
  if (n <= 2 || mem <= 2) return 'low';
  if (PX.soft) return 'low';
  return ph ? 'medium' : 'high';
}
function gfxPref() { return UI.prefs.gfx || 'auto'; }
function gfxLevel() { const p = gfxPref(); return p === 'auto' ? (PX.autoQ || gfxAuto()) : p; }
// ---- boot: inject the stored Pixi source, make the renderer, load the textures ----
async function pxInit() {
  try {
    if (/jsdom/i.test(navigator.userAgent || '') || /[?&]px=0/.test(location.search) || typeof KK_ART === 'undefined' || !KIT.ART.tempura) return false;
    if (!window.PIXI) { const src = document.getElementById('pixi-src'); if (!src) return false; const s = document.createElement('script'); s.textContent = src.textContent; document.head.appendChild(s); }
    if (!window.PIXI || !PIXI.Application) return false;
    const bd = $('#bd'); const cv = document.createElement('canvas'); cv.id = 'pxc'; cv.setAttribute('aria-hidden', 'true'); bd.insertBefore(cv, bd.firstChild);
    PX.q = gfxLevel(); PX.res = pxBasePR();
    const want = /[?&]px=canvas/.test(location.search) ? ['canvas'] : ['webgl', 'canvas'];
    let app = null;
    for (const pref of want) {
      try {
        const a = new PIXI.Application();
        await a.init({ canvas: cv, backgroundAlpha: 0, antialias: false, resolution: PX.res, autoDensity: true, preference: pref, autoStart: false, sharedTicker: false, width: Math.max(16, bd.clientWidth), height: Math.max(16, bd.clientHeight), powerPreference: 'low-power', failIfMajorPerformanceCaveat: false, hello: false });
        if (pref === 'webgl' && a.renderer && a.renderer.type !== undefined && a.renderer.name && !/webgl/i.test(a.renderer.name)) { }
        app = a; PX.kind = (a.renderer && a.renderer.name) || pref; break;
      } catch (e) { PX.err += pref + ': ' + (e && e.message || e) + '; '; }
    }
    if (!app) { cv.remove(); return false; }
    PX.app = app; PX.cv = cv;
    try { const gl = app.renderer.gl; if (gl) { const ext = gl.getExtension('WEBGL_debug_renderer_info'); const r = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : ''; if (/swiftshader|llvmpipe|software/i.test(r)) PX.soft = true; PX.gpu = r; } } catch (e) { }
    if (gfxPref() === 'auto') { PX.q = gfxLevel(); pxSetRes(pxBasePR()); }
    cv.addEventListener('webglcontextlost', e => { e.preventDefault(); pxOff('context lost'); });
    await pxTextures();
    const st = app.stage; const C = () => new PIXI.Container();
    PX.L = { seat: C(), belt: C(), plate: C(), hand: C(), fly: C(), fx: C() };
    for (const k of ['seat', 'belt', 'plate', 'hand', 'fly', 'fx']) st.addChild(PX.L[k]);
    PX.handMask = new PIXI.Graphics(); st.addChild(PX.handMask); PX.L.hand.mask = PX.handMask;
    PX.beltBg = new PIXI.Graphics(); PX.L.belt.addChild(PX.beltBg);
    PX.belt = new PIXI.TilingSprite({ texture: PX.tex.belt, width: 10, height: 10 }); PX.L.belt.addChild(PX.belt);
    PX.beltShade = new PIXI.Graphics(); PX.L.belt.addChild(PX.beltShade);
    PX.on = true; PX.ready = true; document.documentElement.classList.add('kkpx');
    pxApplyQ();
    const bdEl = $('#belt'); if (bdEl) bdEl.addEventListener('scroll', pxDirty, { passive: true });
    document.addEventListener('scroll', e => { if (e.target && e.target.classList && e.target.classList.contains('ctr')) pxDirty(); }, { passive: true, capture: true });
    if (window.ResizeObserver) new ResizeObserver(() => { pxResize(); }).observe(bd);
    pxResize(); pxLoop();
    return true;
  } catch (e) { console.warn('painted table off:', e); pxOff(String(e && e.message || e)); return false; }
}
function pxOff(why) {
  PX.on = false; PX.err += (why || '') + ';'; document.documentElement.classList.remove('kkpx');
  try { if (PX.cv) PX.cv.remove(); } catch (e) { }
  try { if (G && UI.started) render(); } catch (e) { }
}
function pxBasePR() { const d = window.devicePixelRatio || 1; const q = PXQ[PX.q] || PXQ.high; const w = Math.min(q.pr, d); return window.PerfHUD && PerfHUD.pixelRatio ? PerfHUD.pixelRatio(w) : w; }
function pxSetRes(v) { PX.res = v; if (PX.app && PX.app.renderer) { try { PX.app.renderer.resolution = v; pxResize(true); } catch (e) { } } }
function pxApplyQ() {
  PX.q = gfxLevel(); pxSetRes(pxBasePR());
  // High: real blur on the steam and the glow; Medium: pre-blurred textures only; Low: no particles, still belt, no filters
  const q = PXQ[PX.q];
  try { PX.L.fx.filters = q.blur ? [new PIXI.BlurFilter({ strength: 1.6, quality: 2 })] : null; } catch (e) { }
  PX.dirty = true;
}
function setGfx(v) { UI.prefs.gfx = v; savePrefs(); PX.autoQ = null; if (PX.on) { pxApplyQ(); pxPerfReg(); } }
// ---- textures: painted pictures (blob URLs from KK_ART) + small generated sprites ----
function pxLoadImg(url) { return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; }); }
async function pxTextures() {
  const ids = Object.keys(KIT.ART);
  await Promise.all(ids.map(async k => { try { const im = await pxLoadImg(KIT.ART[k]); PX.img[k] = im; PX.tex[k] = PIXI.Texture.from(im); } catch (e) { } }));
  const mk = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); return PIXI.Texture.from(c); };
  const radial = (stops) => (x, w, h) => { const g = x.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); stops.forEach(s => g.addColorStop(s[0], s[1])); x.fillStyle = g; x.fillRect(0, 0, w, h); };
  PX.tex.shadow = mk(64, 64, radial([[0, 'rgba(42,18,8,.55)'], [.55, 'rgba(42,18,8,.3)'], [1, 'rgba(42,18,8,0)']]));
  PX.tex.glow = mk(64, 64, radial([[0, 'rgba(255,214,90,.95)'], [.5, 'rgba(255,190,60,.45)'], [1, 'rgba(255,170,40,0)']]));
  PX.tex.puff = mk(48, 48, radial([[0, 'rgba(255,255,255,.95)'], [.45, 'rgba(255,255,255,.55)'], [1, 'rgba(255,255,255,0)']]));
  PX.tex.flame = mk(32, 48, (x, w, h) => { const g = x.createRadialGradient(w / 2, h * .7, 1, w / 2, h * .6, h * .55); g.addColorStop(0, 'rgba(255,240,150,1)'); g.addColorStop(.35, 'rgba(255,150,40,.95)'); g.addColorStop(.7, 'rgba(230,70,30,.5)'); g.addColorStop(1, 'rgba(200,40,20,0)'); x.fillStyle = g; x.beginPath(); x.moveTo(w / 2, 0); x.bezierCurveTo(w * .9, h * .4, w, h * .75, w / 2, h); x.bezierCurveTo(0, h * .75, w * .1, h * .4, w / 2, 0); x.fill(); });
  PX.tex.spark = mk(32, 32, (x, w, h) => { x.translate(w / 2, h / 2); x.fillStyle = '#fff3b0'; x.strokeStyle = '#c98a10'; x.lineWidth = 1.5; x.beginPath(); for (let i = 0; i < 8; i++) { const r = i % 2 ? 4 : 14, a = i / 8 * Math.PI * 2; x.lineTo(Math.cos(a) * r, Math.sin(a) * r); } x.closePath(); x.fill(); x.stroke(); });
  PX.tex.coin = mk(32, 32, (x, w, h) => { x.fillStyle = '#ffd25a'; x.strokeStyle = '#8a5a12'; x.lineWidth = 2.5; x.beginPath(); x.arc(w / 2, h / 2, 12, 0, Math.PI * 2); x.fill(); x.stroke(); x.fillStyle = '#fff6c8'; x.beginPath(); x.arc(w / 2 - 4, h / 2 - 4, 3.5, 0, Math.PI * 2); x.fill(); });
  PX.tex.cardShadow = mk(80, 108, (x, w, h) => { x.filter = 'blur(6px)'; x.fillStyle = 'rgba(30,12,4,.55)'; x.beginPath(); x.roundRect ? x.roundRect(12, 12, w - 24, h - 24, 8) : x.rect(12, 12, w - 24, h - 24); x.fill(); });
  PX.tex.cardGlow = mk(96, 124, (x, w, h) => { x.filter = 'blur(8px)'; x.fillStyle = 'rgba(255,205,70,.95)'; x.beginPath(); x.roundRect ? x.roundRect(14, 14, w - 28, h - 28, 10) : x.rect(14, 14, w - 28, h - 28); x.fill(); });
}
function svgImgP(svg) { return pxLoadImg('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)); }
// a card face at w CSS px: the kit's mat, the painted plate, the kit's name chit + rule badge (so text stays >= 13 px like the DOM cards)
function pxFace(type, w, on) {
  const r = Math.min(2, Math.max(1, PX.res)), key = type + '|' + (on || '') + '|' + w + '|' + r;
  if (PX.tex['f:' + key]) return PX.tex['f:' + key];
  if (!PX.faceP[key]) PX.faceP[key] = (async () => {
    const o = on ? { variant: 'nigiri', on } : {};
    const [m, t] = await Promise.all([svgImgP(KIT.cardSVG(type, Object.assign({ w, standalone: true, part: 'mat' }, o))), svgImgP(KIT.cardSVG(type, Object.assign({ w, standalone: true, part: 'top' }, o)))]);
    const H = Math.round(w * 1.4), c = document.createElement('canvas'); c.width = Math.round(w * r); c.height = Math.round(H * r); const x = c.getContext('2d'); x.scale(r, r);
    x.drawImage(m, 0, 0, w, H); const ak = type === 'wasabi' && on ? 'wasabi-nigiri' : type, im = PX.img[ak];
    if (im) { const Ly = KIT.cardLayout(w), D2 = Ly.D * 1.1; x.drawImage(im, Ly.cx - D2 / 2, Ly.cy - D2 / 2, D2, D2); }
    x.drawImage(t, 0, 0, w, H);
    const tex = PIXI.Texture.from(c); tex.__w = w; PX.tex['f:' + key] = tex; PX.dirty = true; pxDirty(); return tex;
  })().catch(() => null);
  return null;
}
function pxBack(w) {
  const r = Math.min(2, Math.max(1, PX.res)), key = 'bk|' + w + '|' + r; if (PX.tex[key]) return PX.tex[key];
  const H = Math.round(w * 1.4), c = document.createElement('canvas'); c.width = Math.round(w * r); c.height = Math.round(H * r); const x = c.getContext('2d'); x.scale(r, r);
  const rr = w * .085; x.beginPath(); x.roundRect ? x.roundRect(1, 1, w - 2, H - 2, rr) : x.rect(1, 1, w - 2, H - 2); x.save(); x.clip(); if (PX.img.back) x.drawImage(PX.img.back, 0, 0, w, H); else { x.fillStyle = '#223a6e'; x.fillRect(0, 0, w, H); } x.restore();
  x.lineWidth = Math.max(1.2, w * .014); x.strokeStyle = '#4a2a22'; x.stroke();
  const t = PIXI.Texture.from(c); PX.tex[key] = t; return t;
}
// ---- the layout read: one pass over the DOM after each render ----
let pxQueued = false;
function pxDirty() { if (!PX.on || pxQueued) return; pxQueued = true; requestAnimationFrame(() => { pxQueued = false; try { pxSync(); } catch (e) { console.error(e); } }); }
function pxResize(force) {
  if (!PX.app) return; const bd = $('#bd'); const w = Math.max(16, bd.clientWidth), h = Math.max(16, bd.clientHeight);
  if (force || w !== PX.w || h !== PX.h) { PX.w = w; PX.h = h; try { PX.app.renderer.resize(w, h, PX.res); } catch (e) { } PX.dirty = true; }
  pxDirty();
}
function pxRect(el, B) { const r = el.getBoundingClientRect(); return { x: r.left - B.left, y: r.top - B.top, w: r.width, h: r.height }; }
function pxSync() {
  if (!PX.on || !G || !UI.started) { if (PX.on) pxClear(); return; }
  const bd = $('#bd'); const B = bd.getBoundingClientRect(); PX.B = B;
  const seen = new Set(), now = performance.now();
  const ent = UI.pxEnter || ''; UI.pxEnter = '';
  // --- seats: panel + counter
  const seatSeen = new Set();
  for (const se of document.querySelectorAll('#tbl .seat')) {
    const s = +se.dataset.seat, ctr = se.querySelector('.ctr'); if (!ctr) continue; seatSeen.add(s);
    let o = PX.seats.get(s); if (!o) { o = pxSeatObj(s); PX.seats.set(s, o); }
    const R = pxRect(se, B), Cr = pxRect(ctr, B), me = se.classList.contains('me'), ch = se.classList.contains('choose');
    const sig = [R.x, R.y, R.w, R.h, Cr.x, Cr.y, Cr.w, Cr.h, me, ch, chefOf(s)].map(v => typeof v === 'number' ? Math.round(v) : v).join(',');
    if (o.sig !== sig) { o.sig = sig; pxDrawSeat(o, s, R, Cr, me, ch); }
    o.choose = ch; o.R = R; o.ctr = Cr;
    const sl = se.querySelector('.slot .sbox'); o.slot = sl ? pxRect(sl, B) : null;
    const av = se.querySelector('.sh .av'); o.av = av ? pxRect(av, B) : null;
  }
  for (const [s, o] of PX.seats) if (!seatSeen.has(s)) { o.c.destroy({ children: true }); o.mask && o.mask.destroy(); PX.seats.delete(s); }
  // --- plates on the counters
  for (const g of document.querySelectorAll('#tbl .grp')) {
    const s = +g.dataset.seat, k = g.dataset.k, key = 'g:' + s + '|' + k, pl = g.querySelector('.pl'); if (!pl) continue;
    const R = pxRect(pl, B), so = PX.seats.get(s);
    const type = g.dataset.type || (k === 'pud' ? 'pudding' : 'tempura'), on = g.dataset.on || '', n = +(g.dataset.n || 1), pts = +(g.dataset.pts || 0);
    const layers = Math.min(Math.max(n, 1), 3), dim = k === 'pud' && n === 0;
    seen.add(key);
    let o = PX.objs.get(key), fresh = false;
    if (!o) { o = pxPlateObj(key, s); fresh = true; }
    const landing = g.classList.contains('land') && !o.landedSig;
    o.seat = s; o.type = type; o.on = on; o.layers = layers; o.dim = dim; o.pulse = g.classList.contains('waitf'); o.tw = R.w ? R.h : o.tw; o.tx = R.x; o.ty = R.y; o.d = R.h; o.vis = so ? pxVisIn(R, so.ctr) : 1; o.k = k;
    if (o.pts == null) o.pts = pts;
    if (landing && ANIM && so && so.slot) {   // the plate lands from this seat's reveal slot
      o.landedSig = 1; const from = so.slot, gain = pts - (o.pts || 0);
      pxFlyPlate(o, from, fresh, gain);
    } else if (!g.classList.contains('land')) o.landedSig = 0;
    o.pts = pts;
    if (fresh && !landing) { o.x = o.tx; o.y = o.ty; o.w = o.d; if (ANIM && !ent && G.phase === 'pick') { o.s = .6; o.a = 0; } }
    pxPlateTex(o);
  }
  // --- the hand on the belt
  const belt = $('#belt'), bw = $('#beltw');
  if (bw) { const Rw = pxRect(bw, B); PX.beltR = Rw; const Rz = pxRect($('#beltz'), B); PX.beltZ = Rz; pxDrawBelt(Rz, Rw); }
  const cards = belt ? [...belt.querySelectorAll('.hc')] : [];
  const hw = cards.length ? Math.round(cards[0].offsetWidth) : PX.hw; if (hw) PX.hw = hw;
  cards.forEach((el, i) => {
    const id = el.dataset.id, key = id != null ? 'h:' + id : 'b:' + i, R = pxRect(el, B);
    seen.add(key);
    let o = PX.objs.get(key), fresh = false;
    if (!o) { o = pxCardObj(key); fresh = true; }
    o.type = id != null ? tkey(+id) : null; o.back = id == null; o.sel = el.classList.contains('sel'); o.locked = el.classList.contains('locked'); o.rec = el.classList.contains('rec');
    o.tx = R.x; o.ty = R.y; o.tw = R.w; o.idx = i;
    if (fresh) {
      if (ANIM && ent === 'pass' && PX.beltR) { o.x = PX.beltR.x + PX.beltR.w + 30 + i * (R.w * .5); o.y = R.y; o.w = R.w; o.delay = now + i * 45; o.rot = .05; }
      else if (ANIM && ent === 'deal' && PX.beltR) { o.x = PX.w / 2 - R.w / 2; o.y = -R.w * 1.6; o.w = R.w * .7; o.delay = now + i * 60; o.rot = -.4 + i * .08; o.flip = 1; }
      else { o.x = R.x; o.y = R.y; o.w = R.w; }
    }
    pxCardTex(o);
  });
  // --- everything that left the DOM: hand cards slide on / out, plates clear away
  for (const [key, o] of PX.objs) {
    if (seen.has(key) || o.detached) continue;
    if (!ANIM || !PX.ready) { pxKill(o); continue; }
    o.detached = true;
    if (o.kind === 'plate') pxTween(o, { a: 0, s: .5 }, 260, 'in', () => pxKill(o));
    else pxTween(o, { a: 0, s: .7, y: o.y + 20 }, 220, 'in', () => pxKill(o));
  }
  if (PX.beltR) { PX.handMask.clear(); PX.handMask.rect(PX.beltR.x, PX.beltR.y - 40, PX.beltR.w, PX.beltR.h + 44).fill(0xffffff); }
  PX.dirty = true;
}
function pxClear() { for (const [, o] of PX.objs) pxKill(o); for (const [, o] of PX.seats) o.c.destroy({ children: true }); PX.seats.clear(); if (PX.beltBg) { PX.beltBg.clear(); PX.belt.visible = false; PX.beltShade.clear(); } PX.dirty = true; }
function pxVisIn(R, C) { if (!C) return 1; const cx = R.x + R.w / 2; return cx >= C.x - 2 && cx <= C.x + C.w + 2 ? 1 : 0; }
// ---- seat panel + counter
function pxSeatObj(s) { const c = new PIXI.Container(); PX.L.seat.addChild(c); const o = { s, c, g: new PIXI.Graphics(), ctrT: new PIXI.TilingSprite({ texture: PX.tex.counter || PIXI.Texture.WHITE, width: 10, height: 10 }), top: new PIXI.Graphics(), glow: new PIXI.Sprite(PX.tex.glow) };
  o.glow.anchor.set(.5); o.glow.alpha = 0; c.addChild(o.glow, o.g, o.ctrT, o.top); return o; }
function pxDrawSeat(o, s, R, Cr, me, ch) {
  const col = parseInt(pcol(s).c.slice(1), 16);
  o.g.clear(); o.g.roundRect(R.x, R.y, R.w, R.h, 12).fill({ color: 0xfffaf0, alpha: me ? .5 : .28 });
  if (me) o.g.roundRect(R.x, R.y, R.w, R.h, 12).stroke({ color: 0x4a2a22, alpha: .35, width: 2 });
  o.ctrT.x = Cr.x + 1; o.ctrT.y = Cr.y + 1; o.ctrT.width = Math.max(1, Cr.w - 2); o.ctrT.height = Math.max(1, Cr.h - 2);
  const k = Math.max(.2, (Cr.h - 2) / 256 * 1.7); o.ctrT.tileScale.set(k, k); o.ctrT.tilePosition.x = -s * 211;
  o.top.clear();
  // cloth runner in the diner's colour, a soft shade from the belt above, an ink rim
  const rh = Math.max(10, Math.min(Cr.h * .5, 46)), rx = Cr.x + 8, ry = Cr.y + Cr.h * .5 - rh / 2 + 2, rw = Cr.w - 16;
  o.top.roundRect(rx + 2, ry + 3, rw, rh, 6).fill({ color: 0x2a120c, alpha: .16 });
  o.top.roundRect(rx, ry, rw, rh, 6).fill({ color: col, alpha: .34 });
  o.top.rect(rx, ry + 4, rw, 2).fill({ color: 0xffffff, alpha: .3 }); o.top.rect(rx, ry + rh - 6, rw, 2).fill({ color: 0xffffff, alpha: .3 });
  o.top.rect(Cr.x + 2, Cr.y + 2, Cr.w - 4, Math.min(10, Cr.h * .14)).fill({ color: 0x2a120c, alpha: .14 });
  o.top.roundRect(Cr.x, Cr.y, Cr.w, Cr.h, 10).stroke({ color: 0x4a2a22, width: 2 });
  if (PX.q !== 'low') { if (!o.mask) { o.mask = new PIXI.Graphics(); PX.app.stage.addChild(o.mask); } o.mask.clear(); o.mask.roundRect(Cr.x + 1, Cr.y + 1, Cr.w - 2, Cr.h - 2, 9).fill(0xffffff); o.ctrT.mask = o.mask; }
  else if (o.mask) { o.ctrT.mask = null; o.mask.destroy(); o.mask = null; }
  o.glow.x = R.x + R.w / 2; o.glow.y = R.y + R.h / 2; o.glow.width = R.w * 1.15; o.glow.height = R.h * 1.6;
}
function pxDrawBelt(Rz, Rw) {
  const g = PX.beltBg; g.clear(); g.rect(Rz.x, Rz.y, Rz.w, Rz.h).fill(0x2f1f1a); g.rect(Rz.x, Rz.y, Rz.w, 3).fill(0x1c1210);
  const ch = PX.hw ? PX.hw * 1.4 : 100, bh = Math.max(40, Math.min(Rw.h - 14, ch * .62)), by = Rw.y + Rw.h - bh - 6;
  PX.belt.visible = true; PX.belt.x = Rw.x; PX.belt.y = by; PX.belt.width = Rw.w; PX.belt.height = bh; const k = bh / 128; PX.belt.tileScale.set(k, k);
  PX.beltShade.clear(); PX.beltShade.rect(Rw.x, by - 4, Rw.w, 4).fill({ color: 0x000000, alpha: .35 }); PX.beltShade.rect(Rw.x, by + bh, Rw.w, 4).fill({ color: 0x000000, alpha: .3 });
}
// ---- plates (groups on a counter): up to 3 stacked painted plates
function pxPlateObj(key, s) {
  const c = new PIXI.Container(); const sh = new PIXI.Sprite(PX.tex.shadow); sh.anchor.set(.5); c.addChild(sh);
  const o = { key, kind: 'plate', seat: s, c, sh, sp: [], x: 0, y: 0, w: 40, tx: 0, ty: 0, d: 40, a: 1, s: 1, sq: 0, rot: 0, layers: 1, hideTop: 0 };
  PX.L.plate.addChild(c); PX.objs.set(key, o); return o;
}
function pxPlateTex(o) {
  const ak = o.type === 'wasabi' && o.on ? 'wasabi-nigiri' : o.type, t = PX.tex[ak] || PIXI.Texture.WHITE;
  while (o.sp.length < 3) { const sp = new PIXI.Sprite(t); sp.anchor.set(.5); o.c.addChild(sp); o.sp.push(sp); }
  o.sp.forEach(sp => { if (sp.texture !== t) sp.texture = t; });
}
// ---- hand cards
function pxCardObj(key) {
  const c = new PIXI.Container(); const sh = new PIXI.Sprite(PX.tex.cardShadow), gl = new PIXI.Sprite(PX.tex.cardGlow), sp = new PIXI.Sprite(PIXI.Texture.EMPTY);
  sh.anchor.set(.5); gl.anchor.set(.5); sp.anchor.set(.5); gl.alpha = 0; c.addChild(sh, gl, sp);
  const o = { key, kind: 'card', c, sh, gl, sp, x: 0, y: 0, w: 60, tx: 0, ty: 0, tw: 60, a: 1, s: 1, sq: 0, rot: 0, flip: 0, lift: 0 };
  PX.L.hand.addChild(c); PX.objs.set(key, o); return o;
}
function pxCardTex(o) {
  const w = Math.round(o.tw || PX.hw || 60); let t;
  if (o.back) t = pxBack(w); else t = pxFace(o.type, w);
  if (t) { o.face = t; o.sp.alpha = 1; } else if (!o.face) o.sp.alpha = 0;
  o.backT = pxBack(w);
}
function pxKill(o) { PX.objs.delete(o.key); PX.tweens = PX.tweens.filter(t => t.o !== o); try { o.c.destroy({ children: true }); } catch (e) { } PX.dirty = true; }
// ---- tweens
const EASE = { out: t => 1 - Math.pow(1 - t, 3), in: t => t * t * t, io: t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2, back: t => { const c = 1.6; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); } };
function pxTween(o, to, ms, ease, done, extra) {
  const k = ANIM && !pxRM() ? Math.max(.5, AIDELAY > 0 ? Math.min(1.6, AIDELAY / 650) : .5) : 0;
  const tw = Object.assign({ o, to, from: {}, t0: performance.now() + ((extra && extra.delay) || 0), ms: Math.max(1, ms * (k || 0)), ease: EASE[ease] || EASE.out, done }, extra || {});
  for (const p in to) tw.from[p] = o[p];
  PX.tweens.push(tw); o.busy = (o.busy || 0) + 1; PX.dirty = true; return tw;
}
function pxStepTweens(now) {
  const keep = [];
  for (const tw of PX.tweens) {
    if (now < tw.t0) { keep.push(tw); continue; }
    const u = Math.min(1, (now - tw.t0) / tw.ms), e = tw.ease(u), o = tw.o;
    for (const p in tw.to) o[p] = tw.from[p] + (tw.to[p] - tw.from[p]) * e;
    if (tw.arc) o.y -= Math.sin(u * Math.PI) * tw.arc;
    if (tw.spin) o.rot = tw.spin * Math.sin(u * Math.PI);
    if (tw.flipAt != null) o.flip = u < tw.flipAt ? 0 : 1;
    if (tw.step) tw.step(u);
    if (u >= 1) { o.busy--; if (tw.done) try { tw.done(); } catch (er) { console.error(er); } } else keep.push(tw);
  }
  PX.tweens = keep;
}
// ---- the moments ----
// a served plate flies from the belt to the diner's covered slot (face down halfway), then slips under the cover
function pxServe() {
  if (!PX.on || !ANIM) return false;
  const v = viewSeat(), so = PX.seats.get(v); if (!so || !so.slot) return false;
  const sels = [...document.querySelectorAll('#belt .hc.sel')]; if (!sels.length) return false;
  sels.forEach((el, n) => {
    const o = PX.objs.get('h:' + el.dataset.id); if (!o) return;
    o.detached = true; o.c.parent && o.c.parent.removeChild(o.c); PX.L.fly.addChild(o.c);
    const S = so.slot, tw = S.w * (n ? .9 : 1);
    pxTween(o, { x: S.x + S.w / 2 - tw / 2 + n * 6, y: S.y + n * 4, w: tw }, 520, 'io', () => { o.sq = .25; pxTween(o, { sq: 0, a: 0 }, 260, 'out', () => pxKill(o)); }, { arc: 46, spin: n ? -.25 : .25, flipAt: .5, delay: n * 70 });
  });
  return true;
}
// a plate lands from the reveal slot onto its group (new group, or one more plate on the stack)
function pxFlyPlate(o, from, fresh, gain) {
  const d0 = Math.min(from.w, from.h / 1.4) * .9;
  if (fresh) { o.x = from.x + from.w / 2 - d0 / 2; o.y = from.y + from.h / 2 - d0 / 2; o.w = d0; o.a = 1; }
  else o.hideTop = 1;
  const fly = fresh ? o : pxPlateObj('fly:' + o.key + ':' + performance.now(), o.seat);
  if (!fresh) { fly.type = o.type; fly.on = o.on; fly.layers = 1; pxPlateTex(fly); fly.x = from.x + from.w / 2 - d0 / 2; fly.y = from.y + from.h / 2 - d0 / 2; fly.w = d0; fly.d = d0; fly.detached = true; fly.c.parent.removeChild(fly.c); PX.L.fly.addChild(fly.c); }
  fly.flying = true;
  const land = () => {
    fly.flying = false;
    if (!fresh) { pxKill(fly); o.hideTop = 0; }
    o.sq = .3; pxTween(o, { sq: 0 }, 300, 'out');
    if (gain > 0) pxBurst(o.tx + o.d / 2, o.ty + o.d / 2, gain);
    if (typeof snd === 'function' && gain > 0) snd('coin', { vol: .35 });
  };
  const toX = () => o.tx, toY = () => o.ty;
  const tw = pxTween(fly, { x: toX(), y: toY(), w: o.d }, 560, 'io', land, { arc: 60, spin: .5, delay: 40 + o.seat * 40 });
  tw.step = () => { tw.to.x = o.tx; tw.to.y = o.ty; tw.to.w = o.d; };
}
// every hand slides one seat on: the belt carries the hand away to the left
function pxPassOut() {
  if (!PX.on || !ANIM) return Promise.resolve();
  const hs = [...PX.objs.values()].filter(o => o.kind === 'card' && !o.detached);
  if (!hs.length) return Promise.resolve();
  return new Promise(res => {
    let left = hs.length; const L0 = PX.beltR ? PX.beltR.x : 0;
    hs.sort((a, b) => a.x - b.x).forEach((o, i) => { o.detached = true; pxTween(o, { x: L0 - o.w * 1.6 - i * 8, rot: -.08 }, 520, 'in', () => { pxKill(o); if (!--left) res(); }, { delay: i * 25 }); });
    setTimeout(res, 1600);
  });
}
// packets of face-down cards travel from each seat to the next one around the table
function pxPackets(sizes) {
  if (!PX.on || !ANIM) return false;
  const np = G.np; let any = false;
  for (let s = 0; s < np; s++) {
    const a = PX.seats.get(s), b = PX.seats.get((s + 1) % np); if (!a || !b || !a.av || !b.av) continue;
    any = true; const w = 30;
    const o = { key: 'pk:' + s + ':' + performance.now(), kind: 'pkt', c: new PIXI.Container(), x: a.av.x + a.av.w / 2 - w / 2, y: a.av.y + a.av.h / 2 - w * .7, w, a: 0, s: 1, sq: 0, rot: 0 };
    const back = new PIXI.Sprite(pxBack(w)); back.anchor.set(.5); const back2 = new PIXI.Sprite(pxBack(w)); back2.anchor.set(.5); back2.x = 3; back2.y = -3; back2.rotation = .12;
    o.c.addChild(back, back2);
    if (sizes && sizes[s] != null) { const t = new PIXI.Text({ text: String(sizes[s]), style: { fontFamily: 'Nunito, Trebuchet MS, sans-serif', fontSize: 16, fontWeight: '900', fill: 0xffffff, stroke: { color: 0x2a1206, width: 4 } } }); t.anchor.set(.5); o.c.addChild(t); }
    o.sp = back; o.single = true; o.detached = true; PX.L.fly.addChild(o.c); PX.objs.set(o.key, o);
    pxTween(o, { a: 1 }, 120, 'out');
    pxTween(o, { x: b.av.x + b.av.w / 2 - w / 2, y: b.av.y + b.av.h / 2 - w * .7 }, 760, 'io', () => pxTween(o, { a: 0 }, 140, 'out', () => pxKill(o)), { arc: 40, spin: .6, delay: 100 });
  }
  return any;
}
// +N and a ring of sparks / coins where a plate scored
function pxBurst(x, y, gain) {
  const q = PXQ[PX.q]; const n = q.parts ? Math.round(10 * q.parts) + 4 : 0;
  for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2 + Math.random() * .4, sp = 50 + Math.random() * 60; pxPart(i % 3 ? 'spark' : 'coin', x, y, { vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 40, g: 120, life: .7 + Math.random() * .3, s0: .5 + Math.random() * .4, s1: .2, rot: (Math.random() - .5) * 6, noFilter: true }); }
  const t = new PIXI.Text({ text: '+' + gain, style: { fontFamily: 'Nunito, Trebuchet MS, sans-serif', fontSize: 22, fontWeight: '900', fill: 0xfff3b0, stroke: { color: 0x5b3221, width: 5 } } });
  t.anchor.set(.5); t.x = x; t.y = y; PX.L.fly.addChild(t);
  const o = { key: 'txt:' + performance.now() + Math.random(), kind: 'txt', c: t, x, y, a: 1, s: .6, detached: true, single: true }; PX.objs.set(o.key, o);
  pxTween(o, { s: 1.15 }, 180, 'back'); pxTween(o, { y: y - 42, a: 0 }, 900, 'in', () => pxKill(o), { delay: 250 });
}
function pxPart(kind, x, y, o) {
  if (!PXQ[PX.q].parts || PX.parts.length > 140) return;
  const sp = new PIXI.Sprite(PX.tex[kind]); sp.anchor.set(.5); sp.x = x; sp.y = y;
  (o.noFilter ? PX.L.fly : PX.L.fx).addChild(sp);
  PX.parts.push(Object.assign({ sp, t: 0, vx: 0, vy: 0, g: 0, life: 1, s0: 1, s1: 1, a0: 1, rot: 0 }, o)); PX.dirty = true;
}
function pxStepParts(dt) {
  const keep = [];
  for (const p of PX.parts) {
    p.t += dt; const u = p.t / p.life; if (u >= 1) { p.sp.destroy(); continue; }
    p.vy += p.g * dt; p.sp.x += p.vx * dt; p.sp.y += p.vy * dt; p.sp.rotation += p.rot * dt;
    const s = p.s0 + (p.s1 - p.s0) * u; p.sp.scale.set(s * (p.sx || 1), s); p.sp.alpha = p.a0 * (u < .15 ? u / .15 : 1 - (u - .15) / .85);
    keep.push(p);
  }
  PX.parts = keep;
}
// ambient life: steam over buns, flames on waiting Fire Paste, a glint on paste + nigiri
function pxAmbient(dt) {
  const q = PXQ[PX.q]; if (!q.fx || pxRM()) return;
  PX.amb = (PX.amb || 0) + dt; if (PX.amb < .12) return; const step = PX.amb; PX.amb = 0;
  for (const [, o] of PX.objs) {
    if (o.detached || o.flying || !o.vis) continue;
    const isPlate = o.kind === 'plate', d = isPlate ? o.d : o.w, cx = o.x + d / 2, cy = isPlate ? o.y + d / 2 : o.y + o.w * .55;
    const type = o.type; if (!type) continue;
    if (type === 'dumpling' && Math.random() < step * 2.2 * q.fx) pxPart('puff', cx + (Math.random() - .5) * d * .4, cy - d * .25, { vx: (Math.random() - .5) * 8, vy: -26 - Math.random() * 14, life: 1.4, s0: d / 160, s1: d / 70, a0: .55 });
    if (type === 'wasabi' && !o.on && (o.pulse || !isPlate) && Math.random() < step * 3 * q.fx) pxPart('flame', cx + (Math.random() - .5) * d * .45, cy - d * .12, { vx: (Math.random() - .5) * 10, vy: -34 - Math.random() * 20, life: .55, s0: d / 90, s1: d / 260, a0: .9, noFilter: true });
    if (type === 'wasabi' && o.on && Math.random() < step * 1.2 * q.fx) pxPart('spark', cx + (Math.random() - .5) * d * .6, cy + (Math.random() - .5) * d * .6, { life: .7, s0: .1, s1: d / 110, a0: 1, rot: 2, noFilter: true });
  }
}
// ---- the frame ----
function pxLoop() {
  const PH = window.PerfHUD && PerfHUD.live ? PerfHUD : null;
  const tick = ts => { PX.raf = (PH ? PH.raf : requestAnimationFrame)(tick); try { pxFrame(ts); } catch (e) { console.error(e); } };
  PX.raf = (PH ? PH.raf : requestAnimationFrame)(tick);
}
function pxMoving() { return PX.tweens.length > 0 || PX.parts.length > 0 || [...PX.objs.values()].some(o => !o.detached && (Math.abs(o.x - o.tx) > .5 || Math.abs(o.y - o.ty) > .5 || Math.abs(o.w - (o.kind === 'plate' ? o.d : o.tw)) > .5)); }
function pxFrame(ts) {
  if (!PX.on) return;
  const now = performance.now(), dt = Math.min(.05, Math.max(0, (now - (PX.last || now)) / 1000)); PX.last = now; PX.t += dt;
  const q = PXQ[PX.q], snap = !ANIM || pxRM();
  pxStepTweens(now); pxStepParts(dt); pxAmbient(dt);
  let moving = PX.tweens.length > 0 || PX.parts.length > 0;
  // belt scroll (right to left, like the hands); still on Low and with reduced motion
  if (PX.belt && PX.belt.visible && q.belt && !snap) { PX.belt.tilePosition.x -= dt * 26; moving = true; }
  const kf = snap ? 1 : 1 - Math.exp(-dt * 13);
  for (const [, o] of PX.objs) {
    if (o.kind === 'card') {
      if (!o.detached && !(o.delay && now < o.delay)) { const tw = o.tw; o.x += (o.tx - o.x) * kf; o.y += (o.ty - o.y) * kf; o.w += (tw - o.w) * kf; if (o.flip && Math.abs(o.y - o.ty) < 6) o.flip = 0; if (o.rot && !o.busy) o.rot *= (1 - kf); }
      if (o.delay && now >= o.delay) o.delay = 0;
      if (Math.abs(o.x - o.tx) > .4 || Math.abs(o.y - o.ty) > .4) moving = moving || !o.detached;
      const lift = o.sel && !o.detached ? 1 : 0; o.lift += (lift - o.lift) * (snap ? 1 : 1 - Math.exp(-dt * 16));
      const w = o.w, h = w * 1.4, c = o.c;
      c.x = o.x + w / 2; c.y = o.y + h / 2; c.rotation = o.rot || 0; c.alpha = o.a;
      const sc = (o.s || 1) * (1 + o.lift * .05), sq = o.sq || 0;
      const tex = o.flip ? o.backT : o.face; if (tex && o.sp.texture !== tex) o.sp.texture = tex;
      o.sp.width = w * sc * (1 + sq * .35); o.sp.height = h * sc * (1 - sq * .3); o.sp.alpha = tex ? 1 : 0;
      o.sp.tint = o.locked && !o.detached ? 0xb9b1a6 : 0xffffff;
      o.sh.width = w * 1.25; o.sh.height = h * 1.18; o.sh.x = 3 + o.lift * 4; o.sh.y = 5 + o.lift * 10; o.sh.alpha = .55 + o.lift * .2;
      o.gl.width = w * 1.5; o.gl.height = h * 1.35; o.gl.alpha = o.lift * (q.fx ? .9 : .6) * (.8 + .2 * Math.sin(PX.t * 4));
      if (o.lift > .01 && o.lift < .99) moving = true;
    } else if (o.kind === 'plate') {
      if (!o.detached && !o.flying && !o.busy) { o.x += (o.tx - o.x) * kf; o.y += (o.ty - o.y) * kf; o.w += (o.d - o.w) * kf; if (Math.abs(o.x - o.tx) > .4 || Math.abs(o.y - o.ty) > .4) moving = true; }
      if (o.s != null && o.s < 1 && !o.busy && !o.detached) { o.s += (1 - o.s) * kf; o.a += (1 - o.a) * kf; moving = true; }
      const d = o.w, c = o.c, sq = o.sq || 0, pul = o.pulse && q.fx && !snap ? 1 + .05 * Math.sin(PX.t * 4.5) : 1;
      c.x = o.x + d / 2; c.y = o.y + d / 2; c.alpha = (o.dim ? .45 : 1) * (o.a == null ? 1 : o.a) * (o.vis === 0 && !o.flying ? 0 : 1); c.rotation = o.rot || 0;
      const sc = (o.s == null ? 1 : o.s) * pul;
      const nL = Math.max(1, o.layers - (o.hideTop ? 1 : 0));
      o.sp.forEach((sp, i) => { sp.visible = i < nL; sp.x = i * 6 * d / 44 - (nL - 1) * 3 * d / 44; sp.y = -i * 2 * d / 44; sp.width = d * 1.12 * sc * (1 + sq * .3); sp.height = d * 1.12 * sc * (1 - sq * .25); });
      o.sh.width = d * 1.4 * sc; o.sh.height = d * 1.3 * sc; o.sh.x = 3; o.sh.y = 5;
    } else if (o.single) { o.c.x = o.x + (o.w || 0) / 2; o.c.y = o.y + (o.w || 0) * .7; o.c.alpha = o.a; o.c.rotation = o.rot || 0; o.c.scale.set(o.s || 1); }
  }
  // the choosing diners breathe a soft gold glow (High / Medium)
  for (const [, so] of PX.seats) { const want = so.choose && q.fx ? .28 + .12 * Math.sin(PX.t * 3) : 0; so.glow.alpha += (want - so.glow.alpha) * kf; if (so.choose && q.fx) moving = true; }
  PX.moving = moving;
  if (moving || PX.dirty || PerfHUDtesting()) { PX.dirty = false; try { PX.app.renderer.render(PX.app.stage); PX.frames = (PX.frames || 0) + 1; } catch (e) { pxOff('render: ' + (e && e.message)); } }
}
const PerfHUDtesting = () => !!(window.PerfHUD && PerfHUD.testing);
// ---- PerfHUD: levels, pixel ratio cap, "something is moving" for the idle saver
function pxPerfReg() {
  try {
    if (!window.PerfHUD || !PerfHUD.register) return;
    const shim = PX.on ? { getPixelRatio: () => PX.res, setPixelRatio: v => pxSetRes(v), get domElement() { return PX.cv; }, getContext: () => PX.app && PX.app.renderer && PX.app.renderer.gl || null } : null;
    PerfHUD.register({ game: 'Kaiten Kitchen', anchor: '.gx-board', corner: 'tl', renderer: shim, levels: ['high', 'medium', 'low'],
      getLevel: () => PX.q, isAuto: () => gfxPref() === 'auto',
      setLevel: (l, why) => { if (why === 'apply') setGfx(l); else { PX.autoQ = l; pxApplyQ(); } try { if (GX.open === 'setd') renderMenu(); } catch (e) { } },
      basePR: () => { const d = window.devicePixelRatio || 1; return Math.min((PXQ[PX.q] || PXQ.high).pr, d); }, onPixelRatio: v => pxSetRes(v),
      isAnimating: () => !!UI.busy || !!PX.tweens.length || !!PX.parts.length, idleMode: PX.on ? 'throttle' : 'demand', idleFps: 10 });
  } catch (e) { }
}
// test hook: where every sprite is and whether anything still moves (px-test.js)
PX.state = () => ({ on: PX.on, kind: PX.kind, q: PX.q, res: PX.res, tweens: PX.tweens.length, parts: PX.parts.length, moving: pxMoving(), frames: PX.frames || 0, err: PX.err,
  objs: [...PX.objs.values()].filter(o => !o.detached).map(o => ({ key: o.key, kind: o.kind, type: o.type || null, x: o.x, y: o.y, w: o.kind === 'plate' ? o.w : o.w, tx: o.tx, ty: o.ty, tw: o.kind === 'plate' ? o.d : o.tw, layers: o.layers || 0, shown: o.kind === 'plate' ? o.sp.filter(s => s.visible).length : 1, back: !!o.back, face: o.kind === 'card' ? (o.sp.texture === o.face && !!o.face) : null, alpha: o.c.alpha, vis: o.vis })) });
