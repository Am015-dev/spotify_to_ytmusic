// ===================== part 7: the painted table (PixiJS 8: WebGL, else Pixi's canvas renderer, else the plain DOM view) =====================
// The DOM stays the layout, hit and accessibility layer: every card in your hand, every card on the table and every drone card is still a real
// <button> / box with data-px="card". When the Pixi table is on (html.ldpx) those boxes keep their place but hide their own SVG pictures, and
// pxSync() (after every render()) moves painted card sprites to their boxes. Cards ease to new places, a card you play flies from your hand
// to its slot, other divers' cards fly from their portrait, a finished trick is swept to the winner. Sprites only mirror what the DOM shows,
// so hidden hands stay hidden: a sprite exists only for a card the DOM shows face up.
const PX = { on: false, app: null, q: 'high', res: 1, kind: '', B: null, cv: null, L: {}, objs: new Map(), tweens: [], parts: [], tex: {}, img: {}, faceP: {}, dirty: true, t: 0, last: 0, err: '', ready: false, raf: 0, nPlay: 0, nSweep: 0 };
const PXQ = { high: { pr: 2, fx: 1, blur: true, parts: 1, bub: 1 }, medium: { pr: 1.5, fx: .55, blur: false, parts: .5, bub: .6 }, low: { pr: 1.5, fx: 0, blur: false, parts: 0, bub: 0 } };
const pxRM = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };
function gfxAuto() { const n = navigator.hardwareConcurrency || 4, mem = navigator.deviceMemory || 4, ph = isPh(); if (n <= 2 || mem <= 2) return 'low'; if (PX.soft) return 'low'; return ph ? 'medium' : 'high'; }
function gfxPref() { return UI.prefs.gfx || 'auto'; }
function gfxLevel() { const p = gfxPref(); return p === 'auto' ? (PX.autoQ || gfxAuto()) : p; }
// ---- boot: inject the stored Pixi source, make the renderer, load the textures ----
async function pxInit() {
  try {
    if (/jsdom/i.test(navigator.userAgent || '') || /[?&]px=0/.test(location.search) || typeof LD_ART === 'undefined' || !KIT.ART.emb0) return false;
    if (!window.PIXI) { const src = document.getElementById('pixi-src'); if (!src) return false; const s = document.createElement('script'); s.textContent = src.textContent; document.head.appendChild(s); }
    if (!window.PIXI || !PIXI.Application) return false;
    const bd = $('#bd'); const cv = document.createElement('canvas'); cv.id = 'pxc'; cv.setAttribute('aria-hidden', 'true'); bd.insertBefore(cv, bd.firstChild);
    PX.q = gfxLevel(); PX.res = pxBasePR();
    const want = /[?&]px=canvas/.test(location.search) ? ['canvas'] : ['webgl', 'canvas'];
    let app = null;
    for (const pref of want) {
      try { const a = new PIXI.Application(); await a.init({ canvas: cv, backgroundAlpha: 0, antialias: false, resolution: PX.res, autoDensity: true, preference: pref, autoStart: false, sharedTicker: false, width: Math.max(16, bd.clientWidth), height: Math.max(16, bd.clientHeight), powerPreference: 'low-power', failIfMajorPerformanceCaveat: false, hello: false }); app = a; PX.kind = (a.renderer && a.renderer.name) || pref; break; }
      catch (e) { PX.err += pref + ': ' + (e && e.message || e) + '; '; }
    }
    if (!app) { cv.remove(); return false; }
    PX.app = app; PX.cv = cv;
    try { const gl = app.renderer.gl; if (gl) { const ext = gl.getExtension('WEBGL_debug_renderer_info'); const r = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : ''; if (/swiftshader|llvmpipe|software/i.test(r)) PX.soft = true; PX.gpu = r; } } catch (e) { }
    if (gfxPref() === 'auto') { PX.q = gfxLevel(); pxSetRes(pxBasePR()); }
    cv.addEventListener('webglcontextlost', e => { e.preventDefault(); pxOff('context lost'); });
    await pxTextures();
    const st = app.stage; const C = () => new PIXI.Container();
    PX.L = { felt: C(), amb: C(), hand: C(), trick: C(), fly: C(), fx: C() };
    for (const k of ['felt', 'amb', 'hand', 'trick', 'fly', 'fx']) st.addChild(PX.L[k]);
    PX.L.hand.sortableChildren = true; PX.L.trick.sortableChildren = true;
    PX.handMask = new PIXI.Graphics(); st.addChild(PX.handMask); PX.L.hand.mask = PX.handMask;
    PX.handBg = new PIXI.Sprite(PX.tex.handgrad); PX.L.felt.addChild(PX.handBg);
    PX.mat = new PIXI.Graphics(); PX.L.felt.addChild(PX.mat);
    PX.caus = new PIXI.TilingSprite({ texture: PX.tex.caustic, width: 10, height: 10 }); PX.caus.alpha = .5; PX.L.felt.addChild(PX.caus);
    PX.on = true; PX.ready = true; document.documentElement.classList.add('ldpx');
    pxApplyQ();
    const hd = $('#hand'); if (hd) hd.addEventListener('scroll', pxDirty, { passive: true });
    if (window.ResizeObserver) new ResizeObserver(() => { pxResize(); }).observe(bd);
    pxResize(); pxLoop();
    return true;
  } catch (e) { console.warn('painted table off:', e); pxOff(String(e && e.message || e)); return false; }
}
function pxOff(why) {
  PX.on = false; PX.err += (why || '') + ';'; document.documentElement.classList.remove('ldpx');
  try { if (PX.cv) PX.cv.remove(); } catch (e) { }
  try { if (G && UI.started) render(); } catch (e) { }
}
function pxBasePR() { const d = window.devicePixelRatio || 1; const q = PXQ[PX.q] || PXQ.high; const w = Math.min(q.pr, d); return window.PerfHUD && PerfHUD.pixelRatio ? PerfHUD.pixelRatio(w) : w; }
function pxSetRes(v) { PX.res = v; if (PX.app && PX.app.renderer) { try { PX.app.renderer.resolution = v; pxResize(true); } catch (e) { } } }
function pxApplyQ() {
  PX.q = gfxLevel(); pxSetRes(pxBasePR());
  const q = PXQ[PX.q];
  try { PX.L.fx.filters = q.blur ? [new PIXI.BlurFilter({ strength: 1.4, quality: 2 })] : null; } catch (e) { }
  if (PX.caus) PX.caus.visible = !!q.fx;
  if (!q.bub) { for (const p of PX.parts) if (p.kind === 'bub') p.life = 0; }
  PX.dirty = true;
}
function setGfx(v) { UI.prefs.gfx = v; savePrefs(); PX.autoQ = null; if (PX.on) { pxApplyQ(); pxPerfReg(); } }
// ---- textures: painted pictures (blob URLs from LD_ART) + small generated sprites ----
function pxLoadImg(url) { return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; }); }
async function pxTextures() {
  const ids = Object.keys(KIT.ART);
  await Promise.all(ids.map(async k => { try { const im = await pxLoadImg(KIT.ART[k]); PX.img[k] = im; PX.tex[k] = PIXI.Texture.from(im); } catch (e) { } }));
  const mk = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); return PIXI.Texture.from(c); };
  const radial = stops => (x, w, h) => { const g = x.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); stops.forEach(s => g.addColorStop(s[0], s[1])); x.fillStyle = g; x.fillRect(0, 0, w, h); };
  PX.tex.shadow = mk(64, 64, radial([[0, 'rgba(0,8,24,.6)'], [.55, 'rgba(0,8,24,.3)'], [1, 'rgba(0,8,24,0)']]));
  PX.tex.glow = mk(64, 64, radial([[0, 'rgba(255,224,130,.95)'], [.5, 'rgba(255,200,80,.4)'], [1, 'rgba(255,190,60,0)']]));
  PX.tex.puff = mk(48, 48, radial([[0, 'rgba(220,244,255,.9)'], [.45, 'rgba(200,236,255,.5)'], [1, 'rgba(200,236,255,0)']]));
  PX.tex.spark = mk(32, 32, (x, w, h) => { x.translate(w / 2, h / 2); x.fillStyle = '#fff3b0'; x.strokeStyle = '#0b2038'; x.lineWidth = 1.5; x.beginPath(); for (let i = 0; i < 8; i++) { const r = i % 2 ? 4 : 14, a = i / 8 * Math.PI * 2; x.lineTo(Math.cos(a) * r, Math.sin(a) * r); } x.closePath(); x.fill(); x.stroke(); });
  PX.tex.bub = mk(24, 24, (x, w, h) => { x.strokeStyle = 'rgba(220,244,255,.85)'; x.lineWidth = 2; x.beginPath(); x.arc(w / 2, h / 2, 9, 0, Math.PI * 2); x.stroke(); x.fillStyle = 'rgba(255,255,255,.7)'; x.beginPath(); x.arc(w / 2 - 3, h / 2 - 3, 2.4, 0, Math.PI * 2); x.fill(); });
  PX.tex.ring = mk(96, 96, (x, w, h) => { x.strokeStyle = 'rgba(255,224,130,.95)'; x.lineWidth = 6; x.beginPath(); x.arc(w / 2, h / 2, 40, 0, Math.PI * 2); x.stroke(); });
  PX.tex.cardShadow = mk(80, 108, (x, w, h) => { x.filter = 'blur(6px)'; x.fillStyle = 'rgba(0,6,20,.6)'; x.beginPath(); x.roundRect ? x.roundRect(12, 12, w - 24, h - 24, 8) : x.rect(12, 12, w - 24, h - 24); x.fill(); });
  PX.tex.cardGlow = mk(96, 124, (x, w, h) => { x.filter = 'blur(8px)'; x.fillStyle = 'rgba(255,216,115,.95)'; x.beginPath(); x.roundRect ? x.roundRect(14, 14, w - 28, h - 28, 10) : x.rect(14, 14, w - 28, h - 28); x.fill(); });
  PX.tex.handgrad = mk(4, 64, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(2,10,24,0)'); g.addColorStop(.3, 'rgba(2,10,24,.5)'); g.addColorStop(1, 'rgba(2,10,24,.6)'); x.fillStyle = g; x.fillRect(0, 0, w, h); });
  // caustics: soft light pools only (filled radial blobs, no outlines)
  PX.tex.caustic = mk(256, 256, (x, w, h) => { x.clearRect(0, 0, w, h); let s = 7; const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; for (let i = 0; i < 16; i++) { const cx = r() * w, cy = r() * h, rr = 22 + r() * 40; for (const [ox, oy] of [[0, 0], [w, 0], [-w, 0], [0, h], [0, -h]]) { const g = x.createRadialGradient(cx + ox, cy + oy, 0, cx + ox, cy + oy, rr); g.addColorStop(0, 'rgba(170,230,255,.16)'); g.addColorStop(1, 'rgba(170,230,255,0)'); x.fillStyle = g; x.beginPath(); x.ellipse(cx + ox, cy + oy, rr, rr * .7, 0, 0, 7); x.fill(); } } });
}
function svgImgP(svg) { return pxLoadImg('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)); }
// a card face at w CSS px, drawn straight on a canvas (no SVG decoding, so it is ready at once): paper, frame, the painted emblem, crisp numerals
function pxFace(id, w) {
  const r = Math.min(2, Math.max(1, window.devicePixelRatio || 1)), key = id + '|' + w + '|' + r;   // faces are always drawn at the screen's own sharpness (2x phones), whatever the graphics level
  if (PX.tex['f:' + key]) return PX.tex['f:' + key];
  const s = suitOf(id), v = valOf(id), lan = s === 4, su = D.suits[s], H = Math.round(w * 1.4);
  const c = document.createElement('canvas'); c.width = Math.round(w * r); c.height = Math.round(H * r); const x = c.getContext('2d'); x.scale(r, r);
  const rad = w * .085, bw = Math.max(1.6, w * .026), INK = '#0b1f3a';
  const rr = (X, Y, W2, H2, R) => { x.beginPath(); if (x.roundRect) x.roundRect(X, Y, W2, H2, R); else x.rect(X, Y, W2, H2); };
  const g = x.createLinearGradient(0, 0, w, H); g.addColorStop(0, lan ? '#16336b' : '#fffaf0'); g.addColorStop(1, lan ? '#0a1730' : '#e9dfc2');
  rr(bw / 2, bw / 2, w - bw, H - bw, rad); x.fillStyle = g; x.fill(); x.lineWidth = bw; x.strokeStyle = INK; x.stroke();
  rr(w * .05, w * .05, w * .9, H - w * .1, rad * .7); x.lineWidth = Math.max(1.2, w * .02); x.strokeStyle = lan ? '#d9b04a' : su.c; x.globalAlpha = .85; x.stroke(); x.globalAlpha = 1;
  if (lan) { x.fillStyle = '#9fd0ff'; for (let i = 0; i < 9; i++) { x.globalAlpha = .5; x.beginPath(); x.arc(w * (.12 + ((i * 37) % 76) / 100), H * (.1 + ((i * 53) % 80) / 100), w * (.008 + (i % 3) * .004), 0, 7); x.fill(); } x.globalAlpha = 1; }
  const im = PX.img['emb' + s]; const ew = w * .56;
  // the painting is an opaque square: clip it to a framed rounded square (centre) or a disc (corner pip) so it reads as a picture on the card
  const framed = (X, Y, S, big) => { x.save(); x.beginPath(); if (big) rr(X, Y, S, S, S * .14); else x.arc(X + S / 2, Y + S / 2, S / 2, 0, 7); x.clip(); x.drawImage(im, X, Y, S, S); x.restore();
    x.beginPath(); if (big) rr(X, Y, S, S, S * .14); else x.arc(X + S / 2, Y + S / 2, S / 2 - w * .006, 0, 7); x.lineWidth = Math.max(1, S * (big ? .035 : .06)); x.strokeStyle = big ? '#d9b04a' : 'rgba(255,255,255,.9)'; x.stroke(); };
  if (im) framed((w - ew) / 2, H * .5 - ew * .5, ew, true);
  const FAM = "Nunito,'Trebuchet MS','Segoe UI',system-ui,'DejaVu Sans',sans-serif";
  const corner = rot => { x.save(); if (rot) { x.translate(w / 2, H / 2); x.rotate(Math.PI); x.translate(-w / 2, -H / 2); }
    x.font = '900 ' + (w * .3) + 'px ' + FAM; x.textBaseline = 'alphabetic'; x.textAlign = 'left'; x.lineJoin = 'round'; x.lineWidth = w * .04; x.strokeStyle = lan ? INK : '#fff'; x.strokeText(String(v), w * .15, w * .36); x.fillStyle = lan ? '#ffd873' : su.dk; x.fillText(String(v), w * .15, w * .36);
    if (im) framed(w * .1, w * .41, w * .2, false); x.restore(); };
  corner(false); corner(true);
  const tex = PIXI.Texture.from(c); PX.tex['f:' + key] = tex; return tex;
}
function pxBack(w) {
  const r = Math.min(2, Math.max(1, PX.res)), key = 'bk|' + w + '|' + r; if (PX.tex[key]) return PX.tex[key];
  const H = Math.round(w * 1.4), c = document.createElement('canvas'); c.width = Math.round(w * r); c.height = Math.round(H * r); const x = c.getContext('2d'); x.scale(r, r);
  const rr = w * .085; x.beginPath(); x.roundRect ? x.roundRect(1, 1, w - 2, H - 2, rr) : x.rect(1, 1, w - 2, H - 2); x.save(); x.clip(); if (PX.img.back) x.drawImage(PX.img.back, 0, 0, w, H); else { x.fillStyle = '#12356c'; x.fillRect(0, 0, w, H); } x.restore();
  x.lineWidth = Math.max(1.2, w * .026); x.strokeStyle = '#0b1f3a'; x.stroke();
  const t = PIXI.Texture.from(c); PX.tex[key] = t; return t;
}
// make every card face for the sizes in use ahead of time, in small chunks, so a card never flies in without its picture
function pxPrewarm() {
  if (!PX.on) return; const hw = Math.round(parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hw')) || 60), cw = Math.round(parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--cw')) || 50), dw = Math.round(parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--dw')) || 44);
  const key = hw + '|' + cw + '|' + dw + '|' + PX.res; if (PX.warm === key) return; PX.warm = key; const ws = [...new Set([hw, cw, dw])]; let i = 0; const all = []; for (const w of ws) for (let id = 0; id < 40; id++) all.push([id, w]);
  const step = () => { if (!PX.on || PX.warm !== key) return; for (let k = 0; k < 14 && i < all.length; k++, i++) pxFace(all[i][0], all[i][1]); if (i < all.length) setTimeout(step, 16); }; step();
}
// ---- the layout read: one pass over the DOM after each render ----
let pxQueued = false;
function pxDirty() { if (!PX.on || pxQueued) return; try { if (window.PerfHUD && PerfHUD.wake) PerfHUD.wake(); } catch (e) { } pxQueued = true; requestAnimationFrame(() => { pxQueued = false; try { pxSync(); } catch (e) { console.error(e); } }); }
function pxResize(force) {
  if (!PX.app) return; const bd = $('#bd'); const w = Math.max(16, bd.clientWidth), h = Math.max(16, bd.clientHeight);
  if (force || w !== PX.w || h !== PX.h) { PX.w = w; PX.h = h; try { PX.app.renderer.resize(w, h, PX.res); } catch (e) { } PX.dirty = true; }
  pxDirty();
}
function pxRect(el, B) { const r = el.getBoundingClientRect(); return { x: r.left - B.left, y: r.top - B.top, w: r.width, h: r.height }; }
function pxDrawFelt(R) {
  const g = PX.mat; g.clear(); if (!R) return;
  g.roundRect(R.x + 4, R.y + 2, R.w - 8, R.h - 4, 22).fill({ color: 0x0d3b6e, alpha: .5 });
  g.roundRect(R.x + 4, R.y + 2, R.w - 8, R.h - 4, 22).stroke({ color: 0x8fcdf5, alpha: .3, width: 2 });
  g.roundRect(R.x + 12, R.y + 9, R.w - 24, R.h - 18, 16).stroke({ color: 0xffd873, alpha: .16, width: 1.5 });
  PX.caus.x = R.x + 4; PX.caus.y = R.y + 2; PX.caus.width = Math.max(1, R.w - 8); PX.caus.height = Math.max(1, R.h - 4);
  PX.feltR = R;
}
function pxSeatRect(s, B) { const e = document.querySelector('[data-key="seat' + s + '"]'); return e ? pxRect(e, B) : null; }
function pxSync() {
  if (!PX.on || !G || !UI.started) { if (PX.on) pxClear(); return; }
  try { if (window.PerfHUD && PerfHUD.wake) PerfHUD.wake(); } catch (e) { }   // a table change must never wait for the idle-frame saver
  const bd = $('#bd'); const B = bd.getBoundingClientRect(); PX.B = B;
  const seen = new Set(), now = performance.now();
  const ent = UI.enter || ''; UI.enter = ''; const exit = UI.pxExit; UI.pxExit = null;
  pxPrewarm(); const fl = $('#felt'); if (fl) pxDrawFelt(pxRect(fl, B));
  const hz = $('#handz'); PX.handR = hz ? pxRect(hz, B) : null;
  const els = [...document.querySelectorAll('#bd [data-px=card]')];
  let hi = 0;
  els.forEach(el => {
    const key = el.dataset.pk, R = pxRect(el, B), id = +el.dataset.id; seen.add(key);
    const isTrick = key[0] === 't', isHand = key[0] === 'h';
    let o = PX.objs.get(key), fresh = false;
    if (!o && isTrick) { const old = PX.objs.get('h:' + id); if (old && !seen.has('h:' + id)) { PX.objs.delete('h:' + id); old.key = key; old.detached = false; old.c.parent && old.c.parent.removeChild(old.c); PX.L.trick.addChild(old.c); old.layer = 'trick'; PX.objs.set(key, old); o = old; PX.nPlay++; if (ANIM) pxTween(o, { x: R.x, y: R.y, w: R.w, a: 1 }, 440, 'out'); } }
    if (!o) { o = pxCardObj(key, isTrick ? 'trick' : 'hand'); fresh = true; }
    o.id = id; o.sel = el.classList.contains('sel'); o.dim = el.classList.contains('dim'); o.pk = el.classList.contains('pk'); o.pinged = el.classList.contains('pinged'); o.gw = el.classList.contains('glow');
    o.tx = R.x; o.ty = R.y; o.tw = R.w; o.seatOf = +(el.dataset.seat || -1); o.drone = el.classList.contains('dc');
    if (isHand) { o.z = ++hi; o.c.zIndex = o.z; } else o.c.zIndex = 50 + (o.idx || 0);
    if (fresh) {
      if (isTrick) {
        const sr = o.seatOf >= 0 ? pxSeatRect(o.seatOf, B) : null;
        if (sr && ANIM) { o.x = sr.x + sr.w / 2 - R.w * .3; o.y = sr.y + sr.h / 2 - R.w * .4; o.w = R.w * .6; o.a = 0; PX.nPlay++; pxTween(o, { x: R.x, y: R.y, w: R.w, a: 1 }, 500, 'out'); } else { o.x = R.x; o.y = R.y; o.w = R.w; }
      } else if (ANIM && ent === 'deal' && !o.drone) { o.x = PX.w / 2 - R.w / 2; o.y = -R.w * 1.6; o.w = R.w * .7; o.delay = now + hi * 32; o.rot = -.4 + hi * .06; o.flip = 1; o.flipUntil = now + 1100 + hi * 40; }
      else { o.x = R.x; o.y = R.y; o.w = R.w; }
    }
    pxCardTex(o);
  });
  for (const [key, o] of [...PX.objs]) {
    if (seen.has(key) || o.detached) continue;
    if (!ANIM || !PX.ready) { pxKill(o); continue; }
    o.detached = true; o.c.parent && o.c.parent !== PX.L.fly && (o.c.parent.removeChild(o.c), PX.L.fly.addChild(o.c)); o.c.zIndex = 100;
    if (key[0] === 't' && exit && exit.seat != null) {
      const sr = pxSeatRect(exit.seat, B); PX.nSweep++;
      if (sr) { const idx = o.seatOf; pxTween(o, { x: sr.x + sr.w / 2 - o.w * .2, y: sr.y + sr.h / 2 - o.w * .3, w: o.w * .4, a: 0 }, 480, 'in', () => pxKill(o), { delay: 0 }); continue; }
    }
    pxTween(o, { a: 0, y: o.y + 18 }, 240, 'in', () => pxKill(o));
  }
  if (PX.handR && PX.handBg) { PX.handBg.x = PX.handR.x; PX.handBg.y = PX.handR.y; PX.handBg.width = PX.handR.w; PX.handBg.height = PX.handR.h; }
  if (PX.handR) { PX.handMask.clear(); PX.handMask.rect(PX.handR.x, PX.handR.y - 40, PX.handR.w, PX.handR.h + 44).fill(0xffffff); }
  // ripples and sparks requested by the UI
  if (UI.pxPing != null) { const sr = pxSeatRect(UI.pxPing, B); UI.pxPing = null; if (sr) pxRipple(sr.x + sr.w / 2, sr.y + sr.h / 2); }
  if (UI.pxSpark != null) { const e = document.querySelector('[data-i="' + UI.pxSpark + '"]'); UI.pxSpark = null; if (e) { const r = pxRect(e, B); pxBurst(r.x + r.w / 2, r.y + r.h / 2); } }
  PX.dirty = true;
}
function pxClear() { for (const [, o] of PX.objs) pxKill(o); if (PX.mat) PX.mat.clear(); PX.dirty = true; }
// ---- cards ----
function pxCardObj(key, layer) {
  const c = new PIXI.Container(); const sh = new PIXI.Sprite(PX.tex.cardShadow), gl = new PIXI.Sprite(PX.tex.cardGlow), lg = new PIXI.Sprite(PX.tex.glow), sp = new PIXI.Sprite(PIXI.Texture.EMPTY);
  sh.anchor.set(.5); gl.anchor.set(.5); lg.anchor.set(.5); sp.anchor.set(.5); gl.alpha = 0; lg.alpha = 0; c.addChild(sh, gl, lg, sp);
  const o = { key, kind: 'card', layer, c, sh, gl, lg, sp, x: 0, y: 0, w: 60, tx: 0, ty: 0, tw: 60, a: 1, s: 1, sq: 0, rot: 0, flip: 0, lift: 0, idx: 0 };
  (layer === 'trick' ? PX.L.trick : PX.L.hand).addChild(c); PX.objs.set(key, o); return o;
}
function pxCardTex(o) {
  const w = Math.round(o.tw || 60); const t = pxFace(o.id, w);
  if (t) { o.face = t; } o.faceW = w; o.backT = pxBack(w);
}
function pxKill(o) { PX.objs.delete(o.key); for (const t of PX.tweens) if (t.o === o) t.dead = true; PX.tweens = PX.tweens.filter(t => !t.dead); try { o.c.destroy({ children: true }); } catch (e) { } PX.dirty = true; }
// ---- tweens ----
const EASE = { out: t => 1 - Math.pow(1 - t, 3), in: t => t * t * t, io: t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2, back: t => { const c = 1.6; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); } };
function pxTween(o, to, ms, ease, done, extra) {
  const k = ANIM && !pxRM() ? Math.max(.5, AIDELAY > 0 ? Math.min(1.6, AIDELAY / 650) : .5) : 0;
  const tw = Object.assign({ o, to, from: {}, t0: performance.now() + ((extra && extra.delay) || 0), ms: Math.max(1, ms * (k || 0)), ease: EASE[ease] || EASE.out, done }, extra || {});
  for (const p in to) tw.from[p] = o[p];
  PX.tweens.push(tw); o.busy = (o.busy || 0) + 1; PX.dirty = true; return tw;
}
function pxStepTweens(now) {
  const done = [];
  for (const tw of PX.tweens.slice()) {
    if (tw.dead || now < tw.t0) continue;
    const u = Math.min(1, (now - tw.t0) / tw.ms), e = tw.ease(u), o = tw.o;
    for (const p in tw.to) o[p] = tw.from[p] + (tw.to[p] - tw.from[p]) * e;
    if (tw.arc) o.y -= Math.sin(u * Math.PI) * tw.arc;
    if (tw.step) tw.step(u);
    if (u >= 1) { tw.dead = true; done.push(tw); }
  }
  if (done.length) PX.tweens = PX.tweens.filter(t => !t.dead);
  for (const tw of done) { tw.o.busy = Math.max(0, (tw.o.busy || 0) - 1); if (tw.done) try { tw.done(); } catch (er) { console.error(er); } }
}
// ---- effects ----
function pxPart(kind, x, y, o) {
  const q = PXQ[PX.q]; if (!q.parts && kind !== 'bub') return; if (kind === 'bub' && !q.bub) return; if (PX.parts.length > 120) return;
  const sp = new PIXI.Sprite(PX.tex[kind === 'ring' ? 'ring' : kind]); sp.anchor.set(.5); sp.x = x; sp.y = y;
  (o.noFilter || kind === 'bub' ? PX.L.amb : PX.L.fx).addChild(sp);
  PX.parts.push(Object.assign({ sp, kind, t: 0, vx: 0, vy: 0, g: 0, life: 1, s0: 1, s1: 1, a0: 1, rot: 0 }, o)); PX.dirty = true;
}
function pxStepParts(dt) {
  const keep = [];
  for (const p of PX.parts) {
    p.t += dt; const u = p.t / p.life; if (u >= 1) { p.sp.destroy(); continue; }
    p.vy += p.g * dt; p.sp.x += p.vx * dt; p.sp.y += p.vy * dt; p.sp.rotation += p.rot * dt;
    const s = p.s0 + (p.s1 - p.s0) * u; p.sp.scale.set(s); p.sp.alpha = p.a0 * (u < .15 ? u / .15 : 1 - (u - .15) / .85);
    keep.push(p);
  }
  PX.parts = keep;
}
function pxBurst(x, y) { const q = PXQ[PX.q]; const n = q.parts ? Math.round(10 * q.parts) + 4 : 0; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2 + Math.random() * .4, sp = 50 + Math.random() * 60; pxPart('spark', x, y, { vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 40, g: 120, life: .7 + Math.random() * .3, s0: .5 + Math.random() * .4, s1: .2, rot: (Math.random() - .5) * 6, noFilter: true }); } }
function pxRipple(x, y) { if (!PXQ[PX.q].parts) return; pxPart('ring', x, y, { life: 1, s0: .2, s1: 1.4, a0: .9, noFilter: true }); pxPart('ring', x, y, { life: 1.3, s0: .1, s1: 2.0, a0: .6, noFilter: true }); }
function pxAmbient(dt) {
  const q = PXQ[PX.q]; if (!q.bub || pxRM() || !PX.feltR) return;
  PX.amb = (PX.amb || 0) + dt; if (PX.amb < .55 / q.bub) return; PX.amb = 0;
  const R = PX.feltR; const x = 6 + Math.random() * (PX.w - 12), y = PX.h - 10;
  pxPart('bub', x, y, { vx: (Math.random() - .5) * 10, vy: -(24 + Math.random() * 30), life: 6 + Math.random() * 4, s0: .5 + Math.random() * .7, s1: .6 + Math.random() * .8, a0: .5, noFilter: true });
}
// ---- the frame ----
function pxLoop() {
  const PH = window.PerfHUD && PerfHUD.live ? PerfHUD : null;
  const tick = ts => { PX.raf = (PH ? PH.raf : requestAnimationFrame)(tick); try { pxFrame(ts); } catch (e) { console.error(e); } };
  PX.raf = (PH ? PH.raf : requestAnimationFrame)(tick);
}
function pxMoving() { return PX.tweens.length > 0 || [...PX.objs.values()].some(o => !o.detached && (Math.abs(o.x - o.tx) > .5 || Math.abs(o.y - o.ty) > .5 || Math.abs(o.w - o.tw) > .5)); }
const PerfHUDtesting = () => !!(window.PerfHUD && PerfHUD.testing);
function pxFrame(ts) {
  if (!PX.on) return;
  const now = performance.now(), dt = Math.min(.05, Math.max(0, (now - (PX.last || now)) / 1000)); PX.last = now; PX.t += dt;
  const q = PXQ[PX.q], snap = !ANIM || pxRM();
  pxStepTweens(now); pxStepParts(dt); pxAmbient(dt);
  let moving = PX.tweens.length > 0 || PX.parts.length > 0;
  if (PX.caus && PX.caus.visible && !snap) { PX.caus.tilePosition.x += dt * 9; PX.caus.tilePosition.y += dt * 5; moving = true; }
  const kf = snap ? 1 : 1 - Math.exp(-dt * 13);
  for (const [, o] of PX.objs) {
    if (o.kind !== 'card') continue;
    if (!o.detached && !o.busy && !(o.delay && now < o.delay)) { o.x += (o.tx - o.x) * kf; o.y += (o.ty - o.y) * kf; o.w += (o.tw - o.w) * kf; if (o.flip && (Math.abs(o.y - o.ty) < 6 || (o.flipUntil && now > o.flipUntil))) o.flip = 0; if (o.rot && !o.busy) o.rot *= (1 - kf); if (o.a < 1 && !o.detached) o.a += (1 - o.a) * kf; }
    if (o.delay && now >= o.delay) o.delay = 0;
    if (!o.detached && (Math.abs(o.x - o.tx) > .4 || Math.abs(o.y - o.ty) > .4 || Math.abs(o.w - o.tw) > .4 || o.a < .99)) moving = true;
    const lift = o.sel && !o.detached ? 1 : 0; o.lift += (lift - o.lift) * (snap ? 1 : 1 - Math.exp(-dt * 16));
    const w = o.w, h = w * 1.4, c = o.c;
    c.x = o.x + w / 2; c.y = o.y + h / 2; c.rotation = o.rot || 0; c.alpha = o.a * (o.delay ? 0 : 1);
    const tex = o.flip ? o.backT : o.face; if (tex && o.sp.texture !== tex) o.sp.texture = tex;
    const sc = (o.s || 1) * (1 + o.lift * .05);
    o.sp.width = w * sc; o.sp.height = h * sc; o.sp.alpha = tex ? 1 : 0;
    o.sp.tint = o.dim && !o.detached && o.layer === 'hand' ? 0xa9b8d0 : 0xffffff;
    o.sh.width = w * 1.25; o.sh.height = h * 1.18; o.sh.x = 3 + o.lift * 4; o.sh.y = 5 + o.lift * 8; o.sh.alpha = tex ? .55 + o.lift * .2 : 0;
    const lan = o.id >= 36, pulse = .8 + .2 * Math.sin(PX.t * 3 + o.id);
    o.gl.width = w * (o.pk ? 1.14 : 1.5); o.gl.height = h * (o.pk ? 1.1 : 1.35); o.gl.tint = o.pk ? 0x35c27b : 0xffffff; o.gl.alpha = tex ? (o.lift * (q.fx ? .9 : .6) + (o.pk ? .55 : 0) + (o.gw && !o.detached && o.layer === 'hand' ? .5 : 0)) * pulse : 0;
    o.lg.width = w * 1.9; o.lg.height = w * 1.9; o.lg.alpha = lan && q.fx && !o.dim ? .28 * pulse : 0;
    if (o.lift > .01 && o.lift < .99) moving = true; if (o.pk || o.gw || (lan && q.fx)) moving = true;
  }
  PX.moving = moving;
  if (moving || PX.dirty || PerfHUDtesting()) { PX.dirty = false; try { PX.app.renderer.render(PX.app.stage); PX.frames = (PX.frames || 0) + 1; } catch (e) { pxOff('render: ' + (e && e.message)); } }
}
// ---- PerfHUD: levels, pixel ratio cap, "something is moving" for the idle saver
function pxPerfReg() {
  try {
    if (!window.PerfHUD || !PerfHUD.register) return;
    const shim = PX.on ? { getPixelRatio: () => PX.res, setPixelRatio: v => pxSetRes(v), get domElement() { return PX.cv; }, getContext: () => PX.app && PX.app.renderer && PX.app.renderer.gl || null } : null;
    PerfHUD.register({ game: 'Lantern Dive', anchor: '.gx-board', corner: 'tl', renderer: shim, levels: ['high', 'medium', 'low'],
      getLevel: () => PX.q, isAuto: () => gfxPref() === 'auto',
      setLevel: (l, why) => { if (why === 'apply') setGfx(l); else { PX.autoQ = l; pxApplyQ(); } try { if (GX.open === 'setd') renderMenu(); } catch (e) { } },
      basePR: () => { const d = window.devicePixelRatio || 1; return Math.min((PXQ[PX.q] || PXQ.high).pr, d); }, onPixelRatio: v => pxSetRes(v),
      isAnimating: () => !!UI.busy || !!PX.tweens.length || !!PX.parts.length || !!PX.moving, idleMode: PX.on ? 'throttle' : 'demand', idleFps: 10 });
  } catch (e) { }
}
// share of painted (non-transparent) pixels in the canvas: the table is never blank
function pxPainted() { try { const c = PX.app.renderer.extract.canvas({ target: PX.app.stage, resolution: .25 }); const x = c.getContext('2d'), d = x.getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 20) n++; return +(n / (d.length / 4)).toFixed(3); } catch (e) { return -1; } }
// test hook: where every sprite is and whether anything still moves (px-test.js)
PX.state = () => ({ nPlay: PX.nPlay || 0, nSweep: PX.nSweep || 0, on: PX.on, kind: PX.kind, q: PX.q, res: PX.res, tweens: PX.tweens.length, parts: PX.parts.length, moving: pxMoving(), frames: PX.frames || 0, err: PX.err, blur: !!(PX.L.fx && PX.L.fx.filters && PX.L.fx.filters.length), canvasOK: pxPainted(),
  objs: [...PX.objs.values()].filter(o => !o.detached).map(o => ({ key: o.key, id: o.id, layer: o.layer, x: o.x, y: o.y, w: o.w, tx: o.tx, ty: o.ty, tw: o.tw, face: !!o.face && o.sp.texture === o.face, alpha: o.c.alpha })) });
