// ===================== part 7: the painted panel (PixiJS 8: WebGL, else Pixi's canvas renderer, else the plain DOM view) =====================
// The DOM stays the layout, hit and accessibility layer. When the Pixi panel is on (html.fapx) the DOM pieces keep their text but hide their own look;
// after every render() this layer reads their boxes and paints: plate, wells, frames, dice (they fly from the tray into the slot, spin when rolled,
// squash when they land), switches, tokens, dial needle, speed gauge, fuel bar, a scrolling approach window with plane tokens, and the landing / crash ending.
// Nothing here changes game state. A sprite only shows what its DOM button shows, so hidden dice stay hidden.
const PX = { on: false, app: null, q: 'high', res: 1, kind: '', cv: null, L: {}, objs: new Map(), tex: {}, img: {}, tw: [], parts: [], t: 0, last: 0, dirty: true, err: '', ready: false, frames: 0, vanished: [], seq: 0, endA: null, nLand: 0, nRoll: 0 };
const PXQ = { high: { pr: 2, fx: 1 }, medium: { pr: 1.5, fx: .5 }, low: { pr: 1, fx: 0 } };
const pxRM = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };
function gfxAuto() { const n = navigator.hardwareConcurrency || 4, mem = navigator.deviceMemory || 4; if (n <= 2 || mem <= 2 || PX.soft) return 'low'; return isPh() ? 'medium' : 'high'; }
function gfxPref() { return UI.prefs.gfx || 'auto'; }
function gfxLevel() { const p = gfxPref(); return p === 'auto' ? (PX.autoQ || gfxAuto()) : p; }
function pxLoadImg(url) { return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; }); }
async function pxInit() {
  try {
    if (/jsdom/i.test(navigator.userAgent || '') || /[?&]px=0/.test(location.search) || !ART.dice) return false;
    if (!window.PIXI) { const src = document.getElementById('pixi-src'); if (!src) return false; const s = document.createElement('script'); s.textContent = src.textContent; document.head.appendChild(s); }
    if (!window.PIXI || !PIXI.Application) return false;
    const bd = $('#bd'), cv = document.createElement('canvas'); cv.id = 'pxc'; cv.setAttribute('aria-hidden', 'true'); bd.insertBefore(cv, bd.firstChild);
    PX.q = gfxLevel(); PX.res = pxBasePR();
    const want = /[?&]px=canvas/.test(location.search) ? ['canvas'] : ['webgl', 'canvas']; let app = null;
    for (const pref of want) {
      try { const a = new PIXI.Application(); await a.init({ canvas: cv, backgroundAlpha: 0, antialias: false, resolution: PX.res, autoDensity: true, preference: pref, autoStart: false, sharedTicker: false, width: Math.max(16, bd.clientWidth), height: Math.max(16, bd.clientHeight), powerPreference: 'low-power', failIfMajorPerformanceCaveat: false, hello: false }); app = a; PX.kind = (a.renderer && a.renderer.name) || pref; break; }
      catch (e) { PX.err += pref + ': ' + (e && e.message || e) + '; '; }
    }
    if (!app) { cv.remove(); return false; }
    PX.app = app; PX.cv = cv;
    try { const gl = app.renderer.gl; if (gl) { const ext = gl.getExtension('WEBGL_debug_renderer_info'), r = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : ''; if (/swiftshader|llvmpipe|software/i.test(r)) PX.soft = true; PX.gpu = r; } } catch (e) { }
    if (gfxPref() === 'auto') { PX.q = gfxLevel(); pxSetRes(pxBasePR()); }
    cv.addEventListener('webglcontextlost', e => { e.preventDefault(); pxOff('context lost'); });
    await pxTextures();
    const st = app.stage, C = () => new PIXI.Container();
    PX.L = { bg: C(), win: C(), plane: C(), well: C(), mark: C(), dice: C(), fx: C(), end: C() };
    PX.pm = new PIXI.Graphics(); st.addChild(PX.pm); PX.L.plane.mask = PX.pm;
    for (const k of ['bg', 'win', 'plane', 'well', 'mark', 'dice', 'fx', 'end']) st.addChild(PX.L[k]);
    PX.bgS = new PIXI.Sprite(PX.tex.plate); PX.L.bg.addChild(PX.bgS);
    PX.on = true; PX.ready = true; document.documentElement.classList.add('fapx');
    if (window.ResizeObserver) new ResizeObserver(() => { pxResize(); }).observe(bd);
    pxResize(); pxLoop();
    return true;
  } catch (e) { console.warn('painted panel off:', e); pxOff(String(e && e.message || e)); return false; }
}
function pxOff(why) { PX.on = false; PX.err += (why || '') + ';'; document.documentElement.classList.remove('fapx'); try { if (PX.cv) PX.cv.remove(); } catch (e) { } try { if (G && UI.started) render(); } catch (e) { } }
function pxBasePR() { const d = window.devicePixelRatio || 1, q = PXQ[PX.q] || PXQ.high, w = Math.min(q.pr, d); return window.PerfHUD && PerfHUD.pixelRatio ? PerfHUD.pixelRatio(w) : w; }
function pxSetRes(v) { PX.res = v; if (PX.app && PX.app.renderer) { try { PX.app.renderer.resolution = v; pxResize(true); } catch (e) { } } }
function pxApplyQ() { PX.q = gfxLevel(); pxSetRes(pxBasePR()); PX.dirty = true; }
function setGfx(v) { UI.prefs.gfx = v; savePrefs(); PX.autoQ = null; if (PX.on) { pxApplyQ(); pxPerfReg(); } }
function pxResize(force) {
  if (!PX.app) return; const bd = $('#bd'); if (!bd) return; const w = bd.clientWidth, h = bd.clientHeight; if (w < 8 || h < 8) return;
  if (force || PX.w !== w || PX.h !== h) { PX.w = w; PX.h = h; try { PX.app.renderer.resize(w, h); } catch (e) { } if (PX.bgS) { PX.bgS.width = w; PX.bgS.height = h; } PX.dirty = true; if (G && UI.started) setTimeout(pxSync, 0); }
}
// ---- textures ----
async function pxTextures() {
  await Promise.all(Object.keys(ART).map(async k => { try { const im = await pxLoadImg(ART[k]); PX.img[k] = im; PX.tex[k] = PIXI.Texture.from(im); } catch (e) { } }));
  const cut = (id, name) => { const at = FA_ATLAS[id], im = PX.img[id]; if (!at || !im) return; const i = at.names.indexOf(name); if (i < 0) return; const c = at.cols, x = (i % c) * at.cw, y = Math.floor(i / c) * at.ch; PX.tex[id + ':' + name] = new PIXI.Texture({ source: PX.tex[id].source, frame: new PIXI.Rectangle(x, y, at.cw, at.ch) }); };
  for (const id of ['dice', 'tokens', 'icons']) if (FA_ATLAS[id]) for (const n of FA_ATLAS[id].names) cut(id, n);
  const mk = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); return PIXI.Texture.from(c); };
  const radial = stops => (x, w, h) => { const g = x.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); stops.forEach(s => g.addColorStop(s[0], s[1])); x.fillStyle = g; x.fillRect(0, 0, w, h); };
  PX.tex.shadow = mk(64, 64, radial([[0, 'rgba(0,0,0,.55)'], [.6, 'rgba(0,0,0,.28)'], [1, 'rgba(0,0,0,0)']]));
  PX.tex.glow = mk(64, 64, radial([[0, 'rgba(255,214,90,.95)'], [.5, 'rgba(255,190,60,.45)'], [1, 'rgba(255,170,40,0)']]));
  PX.tex.puff = mk(48, 48, radial([[0, 'rgba(255,255,255,.9)'], [.5, 'rgba(255,255,255,.45)'], [1, 'rgba(255,255,255,0)']]));
  PX.tex.violet = mk(64, 64, radial([[0, 'rgba(170,120,255,.95)'], [.5, 'rgba(140,90,230,.45)'], [1, 'rgba(120,70,220,0)']]));
}
// ---- objects ----
function pxRect(el) { const b = $('#bd').getBoundingClientRect(), r = el.getBoundingClientRect(); return { x: r.left - b.left, y: r.top - b.top, w: r.width, h: r.height }; }
const tx = n => PX.tex[n] || PIXI.Texture.EMPTY;
function pxObj(key, kind, make) { let o = PX.objs.get(key); if (!o) { o = make(); o.key = key; o.kind = kind; o.seen = 0; o.fresh = true; PX.objs.set(key, o); } else o.fresh = false; o.seen = PX.seq; return o; }
function pxSprite(layer, texName, anchor) { const s = new PIXI.Sprite(tx(texName)); s.anchor.set(anchor == null ? .5 : anchor); layer.addChild(s); return s; }
function dieTexName(dv) {
  const v = dv.textContent.trim(), c = dv.classList;
  if (c.contains('t')) return 'dice:t' + v;
  if (c.contains('k')) return 'dice:k' + Math.max(2, Math.min(5, +v || 2));
  const col = c.contains('b') ? 'b' : 'o';
  return v === '?' ? 'dice:' + col + 'b' : 'dice:' + col + (+v || 1);
}
function pxDie(key, dv, rect, ctx) {
  const o = pxObj(key, 'die', () => { const c = new PIXI.Container(), sh = new PIXI.Sprite(tx('shadow')), gl = new PIXI.Sprite(tx('glow')), sp = new PIXI.Sprite(PIXI.Texture.EMPTY); sh.anchor.set(.5); gl.anchor.set(.5); sp.anchor.set(.5); c.addChild(sh, gl, sp); PX.L.dice.addChild(c); return { c, sh, gl, sp, x: 0, y: 0, s: 1, rot: 0, sq: 0, lift: 0, a: 1 }; });
  const name = dieTexName(dv), cx = rect.x + rect.w / 2, cy = rect.y + rect.h / 2, size = Math.max(rect.w, rect.h) * (ctx.slot ? 1.0 : 1.22);
  const changed = o.name && o.name !== name && !o.fresh;
  o.name = name; o.sp.texture = tx(name); o.tx = cx; o.ty = cy; o.size = size; o.sel = ctx.sel; o.can = ctx.can; o.rrm = ctx.rrm; o.cof = ctx.cof; o.seat = ctx.seat; o.val = dv.textContent.trim(); o.col = dv.classList.contains('b') ? 'b' : dv.classList.contains('o') ? 'o' : dv.classList.contains('t') ? 't' : 'k';
  if (o.fresh) {
    o.x = cx; o.y = cy;
    if (ctx.slot) {
      // the die that left a tray flies to the slot; the partner's hidden die ('?') flies too, so their placements are seen, not just appear
      let vi = PX.vanished.findIndex(v => v.col === o.col && v.val === o.val); if (vi < 0) vi = PX.vanished.findIndex(v => v.col === o.col && v.val === '?'); const from = vi >= 0 ? PX.vanished.splice(vi, 1)[0] : null;
      if (from && ANIM && !pxRM()) { o.x = from.x; o.y = from.y; o.size0 = from.size; pxTween(o, { x: [from.x, cx], y: [from.y, cy], rot: [0, (from.x < cx ? 1 : -1) * .35 * 0], s: [1.25, 1] }, 480, 0, () => { o.sq = 1; pxLanded(o); }, true); }
      else if (ANIM) { o.sq = 0; }
    } else if (ANIM && !pxRM() && ctx.roll) {
      o.x = cx + (ctx.seat === 0 ? -1 : 1) * 40; o.y = -60 - (PX.seqRoll++ % 4) * 30; const dly = (ctx.i || 0) * 70 + (ctx.seat || 0) * 40;
      o.a = 0; pxTween(o, { x: [o.x, cx], y: [o.y, cy], rot: [(ctx.seat ? 1 : -1) * 2.6, 0], s: [1.3, 1], a: [1, 1] }, 520, dly, () => { o.sq = 1; PX.nRoll++; }, true);
    }
  } else if (changed && ANIM && !pxRM()) { pxTween(o, { rot: [0, Math.PI * 2], s: [1.35, 1] }, 420, 0, () => { o.sq = .6; }, false); }
  return o;
}
PX.seqRoll = 0;
function pxLanded(o) { PX.nLand++; if (PXQ[PX.q].fx) { for (let i = 0; i < 6; i++) pxPuff(o.tx, o.ty, i); } PX.dirty = true; }
function pxPuffs(x, y) { if (PXQ[PX.q].fx) for (let i = 0; i < 6; i++) pxPuff(x, y, i); }
function pxPuff(x, y, i) { const s = new PIXI.Sprite(tx('puff')); s.anchor.set(.5); s.x = x; s.y = y; s.alpha = .8; s.width = s.height = 16; PX.L.fx.addChild(s); const a = i / 6 * Math.PI * 2 + Math.random(); PX.parts.push({ s, vx: Math.cos(a) * 60, vy: Math.sin(a) * 60 - 20, life: .5, t: 0 }); }
function pxTween(o, props, dur, delay, done, fly) { PX.tw = PX.tw.filter(t => t.o !== o); o.fly = !!fly; PX.tw.push({ o, props, dur, delay: delay || 0, t: 0, done }); }
const ease = t => 1 - Math.pow(1 - t, 3);
// ---- sync: read the DOM after each render ----
function pxSync() {
  if (!PX.on || !PX.app) return; const pz = $('#pz'); if (!pz) return; PX.seq++; if (G && !G.result && (PX.endA || $('#bd').classList.contains('ending'))) pxClearEnd();
  const prevKeys = new Set(PX.objs.keys()); PX.vanished = [];
  const q = PXQ[PX.q];
  // window frames, sky and terrain
  const ap = FA.DATA.airports[(FA.scen(G.sid) || {}).ap] || {}, skyId = 'sky-' + (ap.tod || 'dawn'), terId = 'ter-' + (ap.ter || 'plain');
  const wa = pz.querySelector('.w.appr'), wl = pz.querySelector('.w.altw');
  if (wa) {
    const r = pxRect(wa), o = pxObj('win', 'win', () => { const c = new PIXI.Container(), sky = new PIXI.TilingSprite({ texture: tx(skyId), width: 10, height: 10 }), ter = new PIXI.TilingSprite({ texture: tx(terId), width: 10, height: 10 }), m = new PIXI.Graphics(), fr = new PIXI.NineSliceSprite({ texture: tx('frame'), leftWidth: 16, rightWidth: 16, topHeight: 16, bottomHeight: 16 }); c.addChild(sky, ter, fr); c.addChild(m); c.mask = m; fr.mask = null; PX.L.win.addChild(c); return { c, sky, ter, m, fr }; });
    if (o.skyId !== skyId) { o.skyId = skyId; o.sky.texture = tx(skyId); } if (o.terId !== terId) { o.terId = terId; o.ter.texture = tx(terId); }
    o.c.x = r.x; o.c.y = r.y; o.sky.width = r.w; o.sky.height = r.h; o.sky.tileScale.set(r.h / 192); o.ter.width = r.w; o.ter.height = r.h * .38; o.ter.y = r.h * .62; o.ter.tileScale.set(o.ter.height / 96);
    o.fr.width = r.w; o.fr.height = r.h; o.m.clear(); o.m.roundRect(0, 0, r.w, r.h, 14).fill(0xffffff); o.r = r; o.off = UI.stripOff || 0; o.dirty = 1; PX.pm.clear(); PX.pm.roundRect(r.x + 4, r.y + 4, r.w - 8, r.h - 8, 12).fill(0xffffff);
  }
  if (wl) { const r = pxRect(wl), o = pxObj('winalt', 'win2', () => { const fr = new PIXI.NineSliceSprite({ texture: tx('frame'), leftWidth: 16, rightWidth: 16, topHeight: 16, bottomHeight: 16 }); PX.L.win.addChild(fr); return { fr, c: fr }; }); o.fr.x = r.x; o.fr.y = r.y; o.fr.width = r.w; o.fr.height = r.h; }
  // planes on the approach track
  const youEl = pz.querySelector('.sp.you');
  pz.querySelectorAll('.sp').forEach((sp, si) => {
    const pl = sp.querySelectorAll('.pl'); pl.forEach((p, k) => {
      const r = pxRect(p), sz = Math.max(20, Math.min(30, r.h + 12)), cx = r.x + r.w / 2, cy = r.y + r.h / 2;
      const o = pxObj('pl:' + si + ':' + k, 'tok', () => { const s = new PIXI.Sprite(tx('tokens:plane')); s.anchor.set(.5); PX.L.plane.addChild(s); return { c: s, s0: s, x: cx, y: cy, size: sz, a: 1, s: 1, rot: 0 }; }); o.tx = cx; o.ty = cy; o.size = sz; if (o.fresh) { o.x = cx; o.y = cy; }
    });
  });
  // traffic-die icons on the approach strip (the DOM keeps the "×n" count)
  pz.querySelectorAll('.sp .tfd').forEach((e, i) => { const r = pxRect(e), sz = Math.max(14, Math.min(22, r.h + 2)); const o = pxObj('tf:' + i, 'tok', () => { const sp = new PIXI.Sprite(tx('dice:k5')); sp.anchor.set(.5); PX.L.plane.addChild(sp); return { c: sp, s0: sp, x: 0, y: 0, a: 1, s: 1, rot: 0 }; }); o.tx = r.x + r.w / 2; o.ty = r.y + r.h / 2; o.size = sz; if (o.fresh) { o.x = o.tx; o.y = o.ty; } });
  if (youEl) { const r = pxRect(youEl), sz = Math.min(r.w * .9, 58), cx = r.x + r.w / 2, cy = r.y + r.h * .5; const o = pxObj('you', 'tok', () => { const s = new PIXI.Sprite(tx('tokens:you')); s.anchor.set(.5); PX.L.plane.addChild(s); return { c: s, s0: s, x: cx, y: cy, size: sz, a: 1, s: 1, rot: 0 }; }); o.tx = cx; o.ty = cy; o.size = sz; if (o.fresh) { o.x = cx; o.y = cy; } o.bob = 1; }
  // wells under every slot, gold ring on the legal ones, switches
  const slotDice = [];
  pz.querySelectorAll('.slot').forEach(b => {
    const k = b.dataset.slot, r = pxRect(b), cls = b.classList.contains('p') ? 'wellB' : b.classList.contains('c') ? 'wellO' : 'wellN';
    const o = pxObj('well:' + k, 'well', () => { const c = new PIXI.Container(), w = pxSprite(c, 'tokens:' + cls), g = new PIXI.Sprite(tx('glow')); g.anchor.set(.5); c.addChild(g); PX.L.well.addChild(c); return { c, w, g, x: 0, y: 0, s: 1, a: 1 }; });
    o.tx = o.x = r.x + r.w / 2; o.ty = o.y = r.y + r.h / 2; o.size = r.w; o.w.width = o.w.height = r.w; o.legal = b.classList.contains('legal') && !b.classList.contains('dim') && !b.classList.contains('deadly') && !b.classList.contains('done'); o.g.width = o.g.height = r.w * 1.45;
    o.c.x = o.x; o.c.y = o.y;
    const sw = b.querySelector('.sw');
    if (sw) { const rr = pxRect(sw), on = sw.classList.contains('on'); const so = pxObj('sw:' + k, 'sw', () => { const s = new PIXI.Sprite(tx('tokens:swoff')); s.anchor.set(.5); PX.L.mark.addChild(s); return { c: s, s0: s, x: 0, y: 0, a: 1, s: 1, rot: 0, on }; }); so.tx = so.x = rr.x + rr.w / 2; so.ty = so.y = rr.y + rr.h / 2; so.size = Math.max(16, rr.w + 4); so.s0.texture = tx(on ? 'tokens:swon' : 'tokens:swoff'); if (!so.fresh && so.on !== on && ANIM) pxTween(so, { s: [1.5, 1] }, 260, 0, null, false); so.on = on; }
    const dv = b.querySelector('.dv');
    if (dv && b.classList.contains('full')) slotDice.push([k, dv, r]);
  });
  // dice in the trays
  {
    pz.querySelectorAll('.tray').forEach(tr => {
      const r = pxRect(tr), seat = tr.classList.contains('p') ? 0 : 1;
      const o = pxObj('tray' + seat, 'tray', () => { const s = new PIXI.NineSliceSprite({ texture: tx('tray'), leftWidth: 40, rightWidth: 40, topHeight: 40, bottomHeight: 40 }); PX.L.well.addChild(s); return { c: s, s0: s }; }); o.s0.x = r.x; o.s0.y = r.y; o.s0.width = r.w; o.s0.height = r.h; o.s0.tint = seat ? 0xffd9a8 : 0xb9d4ff;
    });
    pz.querySelectorAll('.die').forEach(b => {
      const s = +b.dataset.s, d = b.dataset.d, dv = b.querySelector('.dv'); if (!dv || b.classList.contains('used')) return;
      const key = 'die:' + s + ':' + d; const roll = !PX.objs.has(key) && !!(G && G.phase === 'place' && PX.rollRound !== G.round + ':' + G.sid);
      pxDie(key, dv, pxRect(b), { seat: s, i: +d || 0, can: b.classList.contains('can'), sel: b.classList.contains('sel'), rrm: b.classList.contains('rrm'), cof: dv.classList.contains('cof'), roll: roll });
    });
    if (G && G.phase === 'place' && [...PX.objs.keys()].some(k => /^die:/.test(k))) PX.rollRound = G.round + ':' + G.sid; }
  for (const k of prevKeys) { const o = PX.objs.get(k); if (o && o.seen !== PX.seq && /^die:/.test(k)) { PX.vanished.push({ col: o.col, val: o.val, x: o.x, y: o.y, size: o.size }); pxKill(k, o); } }
  for (const [k, dv, r] of slotDice) pxDie('slot:' + k, dv, r, { slot: true, seat: 0 });
  // dial, gauge, fuel, trainee tokens, coffee, rerolls
  pz.querySelectorAll('.dial').forEach((d, i) => {
    const r = pxRect(d), nd = d.querySelector('i');
    if (nd) { const o = pxObj('dial', 'dial', () => { const c = new PIXI.Container(), f = pxSprite(c, 'dial'), n = new PIXI.Graphics(); c.addChild(n); PX.L.mark.addChild(c); return { c, f, n, ang: 0, x: 0, y: 0 }; }); o.tx = o.x = r.x + r.w / 2; o.ty = o.y = r.y + r.h / 2; o.size = r.w; o.f.width = o.f.height = r.w * 1.06; o.c.x = o.x; o.c.y = o.y; const m = /rotate\((-?[\d.]+)deg/.exec(nd.style.transform || ''); o.want = m ? +m[1] : 0; if (o.fresh) o.ang = o.want; }
    else { const o = pxObj('wind', 'tok', () => { const s = new PIXI.Sprite(tx('tokens:wind')); s.anchor.set(.5); PX.L.mark.addChild(s); return { c: s, s0: s, x: 0, y: 0, a: 1, s: 1, rot: 0 }; }); o.tx = o.x = r.x + r.w / 2; o.ty = o.y = r.y + r.h / 2; o.size = r.w * 1.05; }
  });
  { const g = pz.querySelector('.gau'); if (g) { const r = pxRect(g), o = pxObj('gauge', 'gauge', () => { const c = new PIXI.Container(), f = pxSprite(c, 'gauge', 0), n = new PIXI.Graphics(), n2 = new PIXI.Graphics(); c.addChild(n, n2); PX.L.mark.addChild(c); return { c, f, n, n2, spv: 0, spw: 0, spd: -1 }; }); o.c.x = r.x; o.c.y = r.y; o.f.width = r.w; o.f.height = r.h; o.f.x = 0; o.f.y = 0; o.r = r;
    o.b = +g.dataset.b || 4; o.o = +g.dataset.o || 8; o.dirty = 1; const sp = +g.dataset.s || 0; if (sp !== o.spw) { o.spw = sp; if (ANIM && !pxRM() && !o.fresh) o.spv = 0; else o.spv = sp; } } }
  { const b = pz.querySelector('.bar'); if (b) { const r = pxRect(b), i = b.querySelector('i'), f = i ? parseFloat(i.style.width) / 100 : 0; const o = pxObj('fuel', 'bar', () => { const c = new PIXI.Container(), g = new PIXI.Graphics(), fr = new PIXI.NineSliceSprite({ texture: tx('pillbar'), leftWidth: 20, rightWidth: 20, topHeight: 12, bottomHeight: 12 }); c.addChild(g, fr); PX.L.mark.addChild(c); return { c, g, fr }; }); o.c.x = r.x; o.c.y = r.y; o.fr.width = r.w; o.fr.height = r.h; o.g.clear(); o.g.roundRect(5, 4, Math.max(2, (r.w - 10) * f), r.h - 8, (r.h - 8) / 2).fill(f < .3 ? 0xe8553a : 0x2fc4b2); } }
  pz.querySelectorAll('.chipr .tk').forEach((e, i) => { const r = pxRect(e), off = e.classList.contains('off'); const o = pxObj('cf' + i, 'tok', () => { const s = new PIXI.Sprite(tx('tokens:coffee')); s.anchor.set(.5); PX.L.mark.addChild(s); return { c: s, s0: s, x: 0, y: 0, a: 1, s: 1, rot: 0 }; }); o.tx = o.x = r.x + r.w / 2; o.ty = o.y = r.y + r.h / 2; o.size = Math.max(26, r.w * 1.5); o.a = off ? .28 : 1; });
  { const e = pz.querySelector('.badge .tk.rr'); if (e) { const r = pxRect(e); const o = pxObj('rr', 'tok', () => { const s = new PIXI.Sprite(tx('tokens:reroll')); s.anchor.set(.5); PX.L.mark.addChild(s); return { c: s, s0: s, x: 0, y: 0, a: 1, s: 1, rot: 0 }; }); o.tx = o.x = r.x + r.w / 2; o.ty = o.y = r.y + r.h / 2; o.size = Math.max(28, r.w * 1.4); } }
  pz.querySelectorAll('.tokrow .ch').forEach((e, i) => { const r = pxRect(e), v = +e.textContent || 1; const o = pxObj('tr' + i + ':' + v, 'tok', () => { const s = new PIXI.Sprite(tx('dice:t' + v)); s.anchor.set(.5); PX.L.mark.addChild(s); return { c: s, s0: s, x: 0, y: 0, a: 1, s: 1, rot: 0 }; }); o.tx = o.x = r.x + r.w / 2; o.ty = o.y = r.y + r.h / 2; o.size = Math.max(26, r.h); });
  // sweep objects not seen this sync; trays dice that vanished become fly-in candidates
  for (const k of prevKeys) { const o = PX.objs.get(k); if (!o || o.seen === PX.seq || o.dying) continue;
    if (/^pl:/.test(k) && ANIM && !pxRM() && !PX.endA) { o.dying = 1; o.seen = PX.seq; o.tx = o.x; o.ty = o.y; pxPuffs(o.x, o.y); pxTween(o, { a: [1, 0], s: [1, 2.2], rot: [0, .9] }, 650, 0, () => pxKill(k, o), false); PX.dirty = true; continue; }   // a cleared plane swells and fades out
    pxKill(k, o); }
  PX.dirty = true;
}
function pxKill(k, o) { try { o.c.destroy({ children: true }); } catch (e) { } if (o.fr && o.fr !== o.c) try { o.fr.destroy(); } catch (e) { } PX.tw = PX.tw.filter(t => t.o !== o); PX.objs.delete(k); }
// ---- the loop ----
function pxLoop() {
  const step = ts => { PX.raf = requestAnimationFrame(step); const dt = Math.min(.25, (ts - (PX.last || ts)) / 1000); PX.last = ts; if (PX.on) pxTick(dt); }; PX.raf = requestAnimationFrame(step);
}
function pxMoving() { return PX.tw.length > 0 || PX.parts.length > 0 || !!PX.endA || [...PX.objs.values()].some(o => o.legal || o.can || o.bob || (o.size && o.tx != null && (Math.abs((o.x || 0) - o.tx) > .4 || Math.abs((o.y || 0) - o.ty) > .4)) || (o.want != null && Math.abs(o.ang - o.want) > .2)); }
function pxTick(dt) {
  PX.t += dt; const q = PXQ[PX.q], kf = 1 - Math.pow(.0005, dt), snap = !ANIM || pxRM();
  // tweens
  for (const t of PX.tw.slice()) {
    t.t += dt * 1000; if (t.t < t.delay) continue; const p = Math.min(1, (t.t - t.delay) / t.dur), e = ease(p);
    for (const k in t.props) { const [a, b] = t.props[k]; t.o[k] = a + (b - a) * e; }
    if (t.props.y && t.o.fly) t.o.y -= Math.sin(p * Math.PI) * 38;
    if (p >= 1) { t.o.fly = false; PX.tw.splice(PX.tw.indexOf(t), 1); if (t.done) t.done(); }
  }
  let any = PX.tw.length > 0;
  for (const o of PX.objs.values()) {
    if (o.kind === 'die') {
      const flying = PX.tw.some(t => t.o === o);
      if (!flying) { o.x += (o.tx - o.x) * kf; o.y += (o.ty - o.y) * kf; if (Math.abs(o.x - o.tx) > .4 || Math.abs(o.y - o.ty) > .4) any = true; else { o.x = o.tx; o.y = o.ty; } }
      const c = o.c; c.x = o.x; c.y = o.y; c.rotation = o.rot || 0; c.alpha = Math.max(0, o.a == null ? 1 : o.a);
      const lift = (o.sel ? 1 : 0); o.lift += (lift - o.lift) * Math.min(1, kf * 1.4); if (Math.abs(lift - o.lift) > .01) any = true;
      o.sq += (0 - o.sq) * kf * .7; if (o.sq > .02) any = true;
      const sc = (o.s || 1) * (1 + o.lift * .1), sz = o.size * sc;
      o.sp.width = sz * (1 + o.sq * .18); o.sp.height = sz * (1 - o.sq * .16); o.sp.y = -o.lift * o.size * .12;
      o.sh.width = sz * 1.2; o.sh.height = sz * 1.0; o.sh.x = 2; o.sh.y = sz * .14 + o.lift * 6; o.sh.alpha = .55;
      o.gl.width = o.gl.height = sz * 1.35; o.gl.texture = o.rrm ? tx('violet') : tx('glow'); o.gl.alpha = (o.sel || o.rrm) ? (.4 + (q.fx ? .2 * Math.sin(PX.t * 5) : 0)) : o.can ? (.28 + (q.fx ? .22 * Math.sin(PX.t * 4) : 0)) : (o.cof ? .3 : 0); if (o.sel || o.rrm || o.can) any = true;
    } else if (o.kind === 'well') {
      o.g.alpha = o.legal ? (q.fx ? .55 + .3 * Math.sin(PX.t * 5) : .65) : 0; if (o.legal) any = true;
    } else if (o.kind === 'tok' || o.kind === 'sw') {
      if (!snap) { o.x += (o.tx - o.x) * kf; o.y += (o.ty - o.y) * kf; } else { o.x = o.tx; o.y = o.ty; } if (Math.abs(o.x - o.tx) > .4 || Math.abs(o.y - o.ty) > .4) any = true;
      const bob = o.bob && q.fx ? Math.sin(PX.t * 2.2) * 2.5 : 0; if (o.bob && q.fx) any = true;
      o.c.x = o.x; o.c.y = o.y + bob; o.c.width = o.c.height = o.size * (o.s || 1); o.c.alpha = o.a == null ? 1 : o.a; o.c.rotation = o.rot || 0;
    } else if (o.kind === 'dial') {
      o.ang += (o.want - o.ang) * (snap ? 1 : kf * .7); if (Math.abs(o.want - o.ang) > .1) any = true; else o.ang = o.want;
      const r = o.size * .4, a = (o.ang - 90) * Math.PI / 180; o.n.clear(); o.n.moveTo(0, 0).lineTo(Math.cos(a) * r, Math.sin(a) * r).stroke({ width: Math.max(3, o.size * .03), color: 0xffe08a, cap: 'round' }); o.n.circle(0, 0, o.size * .04).fill(0xffe08a);
      // horizon tilt: rotate the whole face a little so the art shows the bank
      o.f.rotation = o.ang * Math.PI / 180 * .5;
    } else if (o.kind === 'gauge') {
      if (Math.abs(o.spw - o.spv) > .02) { o.spv += (o.spw - o.spv) * (snap ? 1 : kf * .32); any = true; } else o.spv = o.spw;
      if (o.spd !== o.spv && o.r) { o.spd = o.spv; const r = o.r, cx = r.w / 2, cy = r.h - 8, R = Math.min(r.w * .46, r.h * .9), a = Math.PI * (1 - Math.max(0, Math.min(12, o.spv)) / 12); o.n2.clear(); if (o.spw > 0) { o.n2.moveTo(cx, cy).lineTo(cx + Math.cos(a) * R * .96, cy - Math.sin(a) * R * .96).stroke({ width: 4, color: 0xffffff, cap: 'round' }); o.n2.circle(cx, cy, 4).fill(0xffffff); } }
      if (!o.dirty) continue;
      o.dirty = 0; const r = o.r, cx = r.w / 2, cy = r.h - 8, R = Math.min(r.w * .46, r.h * .9); o.n.clear();
      const ang = v => Math.PI * (1 - Math.max(0, Math.min(12, v)) / 12);
      for (let v = 0; v <= 12; v++) { const a = ang(v), l = v % 4 === 0 ? .14 : .08; o.n.moveTo(cx + Math.cos(a) * R * (1 - l), cy - Math.sin(a) * R * (1 - l)).lineTo(cx + Math.cos(a) * R, cy - Math.sin(a) * R).stroke({ width: 2, color: 0xcfd8e0, alpha: .8 }); }
      for (const [v, col] of [[o.b, 0x4a86e8], [o.o, 0xf29a3e]]) { const a = ang(v); o.n.moveTo(cx, cy).lineTo(cx + Math.cos(a) * R * .9, cy - Math.sin(a) * R * .9).stroke({ width: 5, color: col, cap: 'round' }); }
      o.n.circle(cx, cy, 6).fill(0xe9eef2);
    } else if (o.kind === 'win') {
      const r = o.r; if (r) { const sc = (UI.cw || 80); o.sky.tilePosition.x = (o.off || 0) * .25; o.ter.tilePosition.x = (o.off || 0) * .6; }
    }
  }
  // particles
  for (const p of PX.parts.slice()) { p.t += dt; p.s.x += p.vx * dt; p.s.y += p.vy * dt; p.s.alpha = Math.max(0, .8 * (1 - p.t / p.life)); if (p.t >= p.life) { p.s.destroy(); PX.parts.splice(PX.parts.indexOf(p), 1); } }
  if (PX.parts.length) any = true;
  if (PX.endA) { pxEndTick(dt); any = true; }
  if (any || PX.dirty || (window.PerfHUD && PerfHUD.testing)) { PX.dirty = false; try { PX.app.renderer.render(PX.app.stage); PX.frames++; } catch (e) { pxOff('render: ' + (e && e.message)); } }
}
// ---- the ending: landing / crash ----
function pxEnd(win, cb) {
  if (!PX.on || pxRM()) { setTimeout(cb, 400); return; }
  try {
    const L = PX.L.end, W = PX.w, H = PX.h; L.removeChildren(); $('#bd').classList.add('ending');
    const bgT = tx(win ? 'end-land' : 'end-crash'), bg = new PIXI.Sprite(bgT); const sc = Math.max(W / bgT.width, H / bgT.height); bg.scale.set(sc); bg.x = (W - bgT.width * sc) / 2; bg.y = (H - bgT.height * sc) / 2; bg.alpha = 0;
    const plane = new PIXI.Sprite(tx(win ? 'planegear' : 'planeside')); plane.anchor.set(.5); const pw = Math.min(W * .5, 420); plane.width = pw; plane.height = pw * .39;
    const flash = new PIXI.Graphics(); flash.rect(0, 0, W, H).fill(0xff3322); flash.alpha = 0;
    L.addChild(bg, plane, flash); PX.endA = { t: 0, win, cb, bg, plane, flash, W, H, done: false };
  } catch (e) { setTimeout(cb, 300); }
}
function pxEndTick(dt) {
  const a = PX.endA; a.t += dt; const t = a.t, W = a.W, H = a.H;
  a.bg.alpha = Math.min(1, t / .6);
  if (a.win) { const p = Math.min(1, Math.max(0, (t - .3) / 2.2)), e = ease(p); a.plane.x = W * (.18 + .55 * e); a.plane.y = H * (.22 + .5 * e); a.plane.rotation = -.12 * (1 - e) + .02; a.plane.scale.x = a.plane.scale.y = Math.abs(a.plane.scale.x) * 1; a.plane.alpha = 1 - Math.max(0, (t - 2.3) / .5) * 0; if (t > 3.0 && !a.done) { a.done = true; PX.endA = null; a.cb(); } }   // the picture stays until the next flight (pxClearEnd)
  else { const p = Math.min(1, Math.max(0, (t - .3) / 1.4)), e = p * p; a.plane.x = W * (.2 + .45 * p); a.plane.y = H * (.2 + .55 * e); a.plane.rotation = .1 + .9 * e; a.flash.alpha = t > 1.7 ? Math.max(0, .6 - (t - 1.7) * 1.2) : 0; if (t > 1.7 && q_fx()) { PX.L.end.x = (Math.random() - .5) * 8 * Math.max(0, 1 - (t - 1.7)); PX.L.end.y = (Math.random() - .5) * 8 * Math.max(0, 1 - (t - 1.7)); } if (t > 3.0 && !a.done) { a.done = true; PX.endA = null; PX.L.end.x = PX.L.end.y = 0; a.cb(); } }
}
const q_fx = () => PXQ[PX.q].fx > 0;
function pxClearEnd() { PX.endA = null; try { $('#bd').classList.remove('ending'); } catch (e) { } try { PX.L.end.removeChildren(); PX.L.end.x = PX.L.end.y = 0; } catch (e) { } }
// ---- PerfHUD ----
function pxPerfReg() {
  try {
    if (!window.PerfHUD || !PerfHUD.register) return;
    const shim = PX.on ? { getPixelRatio: () => PX.res, setPixelRatio: v => pxSetRes(v), get domElement() { return PX.cv; }, getContext: () => PX.app && PX.app.renderer && PX.app.renderer.gl || null } : null;
    PerfHUD.register({ game: 'Final Approach', anchor: '.gx-board', corner: 'tl', renderer: shim, levels: ['high', 'medium', 'low'],
      getLevel: () => PX.q, isAuto: () => gfxPref() === 'auto',
      setLevel: (l, why) => { if (why === 'apply') setGfx(l); else { PX.autoQ = l; pxApplyQ(); } try { if (GX.open === 'setd') renderMenu(); } catch (e) { } },
      basePR: () => { const d = window.devicePixelRatio || 1; return Math.min((PXQ[PX.q] || PXQ.high).pr, d); }, onPixelRatio: v => pxSetRes(v),
      isAnimating: () => !!UI.busy || PX.tw.length > 0 || PX.parts.length > 0 || !!PX.endA, idleMode: PX.on ? 'throttle' : 'demand', idleFps: 10 });
  } catch (e) { }
}
function pxPainted() { try { const c = PX.app.renderer.extract.canvas({ target: PX.app.stage, resolution: .25 }); const x = c.getContext('2d'), d = x.getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 20) n++; return +(n / (d.length / 4)).toFixed(3); } catch (e) { return -1; } }
PX.state = () => ({ on: PX.on, kind: PX.kind, q: PX.q, res: PX.res, frames: PX.frames, err: PX.err, tweens: PX.tw.length, parts: PX.parts.length, moving: pxMoving(), nLand: PX.nLand, nRoll: PX.nRoll, ending: !!PX.endA, canvasOK: pxPainted(),
  objs: [...PX.objs.values()].map(o => ({ key: o.key, kind: o.kind, x: Math.round(o.x || 0), y: Math.round(o.y || 0), name: o.name || null })), dice: [...PX.objs.values()].filter(o => o.kind === 'die').map(o => ({ key: o.key, val: o.val, x: Math.round(o.x), y: Math.round(o.y) })) });
