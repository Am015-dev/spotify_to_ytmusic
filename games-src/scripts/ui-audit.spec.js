// Independent UI audit (owner, 14 Oct 2026): strict, LIVE-build check of rules A-F per game x size x surface. It never fixes anything and saves no screenshots
// (page.screenshot buffers are analysed in memory). Reuses: playwright.config.js projects (phone-s phone tablet pc wide), shell/gx-scenario.js (GXS.menuList /
// menuOpen / boardAudit open and walk every surface), the existing ?scn=menu page hook.
//   GX_URL=https://am015-dev.github.io/spotify_to_ytmusic SCN_SLUGS=sunglaze UA_OUT=.staging/ui-audit \
//     node_modules/.bin/playwright test scripts/ui-audit.spec.js --project=phone --project=pc --workers=4
// Result per test: $UA_OUT/<slug>-<project>.json  {rule: [{surface, msg, sel}]}; scripts/ui-audit-table.js turns them into the HANDOFF table.
//   A  every visible text node >= 13px (phone) / >= 16px (>= 1024 wide)
//   B  text over a busy / low-contrast background (text hidden, in-memory screenshot of its box: median contrast, edge density)
//   C  stretched img / CSS background (> 1.5x natural on an axis, or aspect off > 5%)
//   D  three.js scenes (captured with an Object.prototype setter on isScene / isCamera, no game edit): untextured meshes among textured siblings, near-black
//      untextured meshes, label sprites/planes whose projected text height is < 13/16px
//   E  dead buttons: real tap on every visible enabled button (UA_E_SIZES, default phone,pc,wide); alive = DOM mutation / navigation within 1.5 s
//   F  top bar > 5 buttons; title with != 1 big primary button; > 1 instruction line on the board
const { test } = require('@playwright/test');
const fs = require('fs'), path = require('path');
const SLUGS = (process.env.SCN_SLUGS || 'cauldron-fair,crown-city-smash,doorkick-dungeon,final-approach,hollowbough,kaiten-kitchen,lantern-dive,nebula-aces,rampart-and-vine,sands-of-qamar,shipwreck-isle,short-fuse,sunglaze,thornbound,tidewake').split(',');
const BASE = (process.env.GX_URL || 'https://am015-dev.github.io/spotify_to_ytmusic').replace(/\/+$/, '');
const OUT = path.resolve(process.env.UA_OUT || '.staging/ui-audit');
const E_SIZES = (process.env.UA_E_SIZES || 'phone,pc,wide').split(',');
const MAX_BTN = +process.env.UA_MAX_BTN || 14;

// Capture three.js scenes/cameras/renderers before any game script runs (three sets this.isScene = true etc. in constructors; a setter on the prototype sees it).
const HOOK = () => {
  window.__ua3 = { scenes: [], cams: [] };
  const trap = (name, list) => Object.defineProperty(Object.prototype, name, { configurable: true, set(v) { if (v === true && list.indexOf(this) < 0) list.push(this); Object.defineProperty(this, name, { value: v, writable: true, configurable: true, enumerable: false }); }, get() { return undefined; } });
  try { trap('isScene', window.__ua3.scenes); trap('isPerspectiveCamera', window.__ua3.cams); trap('isOrthographicCamera', window.__ua3.cams); } catch (e) { }
};

// ---- in-page DOM audit: rules A, C, F (and the text boxes B needs) ----
const DOM_AUDIT = async ({ isBoard, isTitle }) => {
  const W = innerWidth, H = innerHeight, minFs = W >= 1024 ? 16 : 13, out = { A: [], C: [], F: [], texts: [] };
  const sel = e => { let s = '', n = 0; for (let x = e; x && x !== document.body && n < 3; x = x.parentElement, n++) s = (x.tagName.toLowerCase() + (x.id ? '#' + x.id : '') + (typeof x.className === 'string' && x.className.trim() ? '.' + x.className.trim().split(/\s+/)[0] : '')) + (s ? '>' + s : ''); return s; };
  const shown = e => { for (let x = e; x && x !== document.documentElement; x = x.parentElement) { const s = getComputedStyle(x); if (s.display === 'none' || s.visibility === 'hidden' || +s.opacity < 0.05 || x.hidden) return false; } return true; };
  const skip = e => e.closest('#gxscn-tag,#gxlab-bar,[data-gx-skip],script,style,noscript,option,[aria-hidden=true] svg');
  // A + text boxes
  const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n; (n = tw.nextNode());) {
    const t = n.nodeValue.replace(/\s+/g, ' ').trim(), e = n.parentElement; if (!t || !e || skip(e) || !shown(e)) continue;
    const r = document.createRange(); r.selectNodeContents(n); const rs = [].slice.call(r.getClientRects()).filter(q => q.width > 2 && q.height > 2 && q.right > 0 && q.bottom > 0 && q.left < W && q.top < H);
    if (!rs.length) continue;
    const q = rs[0], cx = Math.min(W - 1, Math.max(1, q.left + q.width / 2)), cy = Math.min(H - 1, Math.max(1, q.top + q.height / 2)), top = document.elementFromPoint(cx, cy);
    if (top && top !== e && !e.contains(top) && !top.contains(e) && getComputedStyle(top).pointerEvents !== 'none') continue;   // covered by something else: judged where it is on top
    const cs = getComputedStyle(e), fs = parseFloat(cs.fontSize);
    if (fs < minFs) out.A.push({ msg: '"' + t.slice(0, 28) + '" ' + Math.round(fs * 10) / 10 + 'px (min ' + minFs + ')', sel: sel(e), fs });
    const m = cs.color.match(/[\d.]+/g) || [0, 0, 0, 1];
    out.texts.push({ t: t.slice(0, 28), sel: sel(e), fs, bold: +cs.fontWeight >= 700, c: [+m[0], +m[1], +m[2], m[3] === undefined ? 1 : +m[3]], r: rs.map(q => [q.left, q.top, q.width, q.height]).slice(0, 3) });
  }
  // C: img + CSS backgrounds
  const nat = {}; const load = u => nat[u] || (nat[u] = new Promise(res => { const i = new Image(); i.onload = () => res([i.naturalWidth, i.naturalHeight]); i.onerror = () => res(null); i.src = u; setTimeout(() => res(null), 2500); }));
  const els = [].slice.call(document.querySelectorAll('body *')).filter(e => !skip(e) && shown(e));
  for (const e of els) {
    const b = e.getBoundingClientRect(), cs = getComputedStyle(e); if (b.width < 24 || b.height < 24 || b.right < 0 || b.left > W || b.bottom < 0 || b.top > H) continue;
    let nw, nh, rw = b.width, rh = b.height, fit = 'fill', what = '';
    if (e.tagName === 'IMG') {
      if (!e.complete || !e.naturalWidth || /\.svg(\?|$)|^data:image\/svg/.test(e.currentSrc)) continue; nw = e.naturalWidth; nh = e.naturalHeight; fit = cs.objectFit; what = 'img ' + (e.currentSrc.split('/').pop() || '').slice(0, 30);
      rw -= parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight); rh -= parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
    } else {
      const bg = cs.backgroundImage, m = bg && bg.match(/url\(["']?([^"')]+)["']?\)/); if (!m || /\.svg(\?|$)|^data:image\/svg|gradient/.test(m[1]) || cs.borderImageSource !== 'none' && cs.borderImageSource) continue;
      const d = await load(m[1]); if (!d || !d[0]) continue; [nw, nh] = d; what = 'bg ' + m[1].split('/').pop().slice(0, 30);
      const sz = cs.backgroundSize.split(',')[0].trim(); fit = sz;
      const pw = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight), ph = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom); const bw = b.width, bh = b.height; void pw; void ph;
      let dw, dh;
      if (sz === 'cover') { const s = Math.max(bw / nw, bh / nh); dw = nw * s; dh = nh * s; } else if (sz === 'contain') { const s = Math.min(bw / nw, bh / nh); dw = nw * s; dh = nh * s; } else if (sz === 'auto' || sz === 'auto auto') { dw = nw; dh = nh; } else {
        const p = sz.split(/\s+/), px = (v, full) => v === 'auto' ? null : v.endsWith('%') ? parseFloat(v) / 100 * full : parseFloat(v); dw = px(p[0], bw); dh = px(p[1] || 'auto', bh);
        if (dw == null && dh == null) { dw = nw; dh = nh; } else if (dw == null) dw = dh * nw / nh; else if (dh == null) dh = dw * nh / nw;
      }
      rw = dw; rh = dh; fit = sz === 'cover' || sz === 'contain' || sz === 'auto' ? 'keep' : 'fill';
    }
    if (fit === 'contain' || fit === 'cover' || fit === 'scale-down' || fit === 'none' || fit === 'keep') { if (e.tagName === 'IMG') { const s = fit === 'cover' ? Math.max(rw / nw, rh / nh) : fit === 'none' ? 1 : Math.min(rw / nw, rh / nh); rw = nw * s; rh = nh * s; } }
    const sx = rw / nw, sy = rh / nh, aspect = Math.abs((rw / rh) / (nw / nh) - 1);
    if (sx > 1.5 || sy > 1.5) out.C.push({ msg: what + ' drawn ' + Math.round(rw) + 'x' + Math.round(rh) + ' from ' + nw + 'x' + nh + ' (' + Math.round(Math.max(sx, sy) * 100) / 100 + 'x)', sel: sel(e) });
    else if (aspect > 0.05) out.C.push({ msg: what + ' aspect off ' + Math.round(aspect * 100) + '% (' + Math.round(rw) + 'x' + Math.round(rh) + ' vs ' + nw + 'x' + nh + ')', sel: sel(e) });
  }
  // F: top bar + big primary + instruction lines
  const btns = [].slice.call(document.querySelectorAll('button,[role=button]')).filter(b => !skip(b) && shown(b) && b.getBoundingClientRect().width > 3 && b.getBoundingClientRect().height > 3);
  const bar = btns.filter(b => { const r = b.getBoundingClientRect(); return r.top < 72 && r.bottom < 100 && r.top > -4 && r.width < 140 && r.left < W && r.right > 0; });
  if (bar.length > 5) out.F.push({ msg: 'top bar has ' + bar.length + ' buttons (max 5): ' + bar.map(b => (b.getAttribute('aria-label') || b.textContent.trim() || b.id || '?').slice(0, 12)).join(', '), sel: sel(bar[0]) });
  if (isTitle) {
    const big = btns.filter(b => { const r = b.getBoundingClientRect(); return r.width >= Math.min(220, W * 0.5) && r.height >= 44 && r.top >= 72; });
    const primary = big.filter(b => parseFloat(getComputedStyle(b).fontSize) >= 18 || /primary|bigb|start|play/i.test(b.className + b.id));
    if (primary.length !== 1) out.F.push({ msg: 'title has ' + primary.length + ' big primary buttons (want 1): ' + primary.map(b => (b.textContent.trim() || b.id).slice(0, 14)).join(', '), sel: primary[0] ? sel(primary[0]) : 'body' });
  }
  if (isBoard && window.GXS && GXS.boardAudit) { const m = GXS.boardAudit().filter(s => /^instruction lines/.test(s)); m.forEach(s => out.F.push({ msg: s.slice(0, 160), sel: 'board' })); }
  return out;
};

// ---- rule B in the page: contrast + edge density of the pixels behind each text box (text hidden), from an in-memory screenshot ----
const PIXELS = async ({ b64, texts, dpr }) => {
  const img = await createImageBitmap(await (await fetch('data:image/png;base64,' + b64)).blob()), cv = document.createElement('canvas'); cv.width = img.width; cv.height = img.height;
  const cx = cv.getContext('2d', { willReadFrequently: true }); cx.drawImage(img, 0, 0); const sc = img.width / innerWidth, bad = [];
  const lin = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }, lum = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  const seen = {};
  for (const t of texts) for (const q of t.r) {
    const x = Math.max(0, Math.floor(q[0] * sc)), y = Math.max(0, Math.floor(q[1] * sc)), w = Math.min(img.width - x, Math.ceil(q[2] * sc)), h = Math.min(img.height - y, Math.ceil(q[3] * sc)); if (w < 4 || h < 4) continue;
    const d = cx.getImageData(x, y, w, h).data, L = new Float32Array(w * h), R = [], G = [], B = [];
    for (let i = 0; i < w * h; i++) { L[i] = lum(d[i * 4], d[i * 4 + 1], d[i * 4 + 2]); R.push(d[i * 4]); G.push(d[i * 4 + 1]); B.push(d[i * 4 + 2]); }
    const sorted = Array.from(L).sort((a, b) => a - b), med = sorted[sorted.length >> 1], p10 = sorted[Math.floor(sorted.length * 0.1)], p90 = sorted[Math.floor(sorted.length * 0.9)];
    const mid = a => a.sort((x, y) => x - y)[a.length >> 1], mr = mid(R), mg = mid(G), mb = mid(B), a = t.c[3];
    const fr = t.c[0] * a + mr * (1 - a), fg = t.c[1] * a + mg * (1 - a), fb = t.c[2] * a + mb * (1 - a), lt = lum(fr, fg, fb), hi = Math.max(lt, med), lo = Math.min(lt, med), cr = (hi + 0.05) / (lo + 0.05);
    let edges = 0; for (let yy = 0; yy < h - 1; yy++) for (let xx = 0; xx < w - 1; xx++) { const i = yy * w + xx; if (Math.abs(L[i] - L[i + 1]) > 0.12 || Math.abs(L[i] - L[i + w]) > 0.12) edges++; }
    const edge = edges / (w * h), range = p90 - p10, need = t.fs >= 24 && t.bold ? 3 : 4.5, key = t.sel + t.t;
    let why = ''; if (cr < need) why = 'contrast ' + cr.toFixed(2) + ':1 (<' + need + ')'; else if (edge > 0.08 && range > 0.25) why = 'busy background (edges ' + Math.round(edge * 100) + '%, lum spread ' + range.toFixed(2) + ')';
    if (why && !seen[key]) { seen[key] = 1; bad.push({ msg: '"' + t.t + '" ' + why, sel: t.sel, score: cr < need ? need - cr + 10 : edge * 10 }); }
  }
  return bad;
};

// ---- rule D in the page ----
const THREE_AUDIT = () => {
  const out = [], H = innerHeight, minFs = innerWidth >= 1024 ? 16 : 13, st = window.__ua3; if (!st || !st.scenes.length) return { out, scenes: 0 };
  const cam = st.cams[st.cams.length - 1], vec = window.THREE && THREE.Vector3; if (!cam || !vec) return { out, scenes: st.scenes.length, note: 'no camera/THREE global' };
  const kinds = {}, labels = [];
  const name = o => (o.name || o.geometry && o.geometry.type || o.type || '').replace(/[\d_\-. ]+$/g, '') + '|' + (o.parent && o.parent.name || '').replace(/[\d_\-. ]+$/g, '');
  const vis = o => { for (let x = o; x; x = x.parent) if (x.visible === false) return false; return true; };
  st.scenes.forEach(sc => sc.traverse(o => {
    if (!vis(o) || !(o.isMesh || o.isSprite)) return; const mats = [].concat(o.material || []).filter(Boolean); if (!mats.length) return; const m = mats[0];
    const tex = m.map || null, img = tex && tex.image, isLabel = o.isSprite || (img && img.getContext && /canvas/i.test(img.constructor.name));
    if (isLabel && tex) { labels.push(o); return; }
    const k = name(o); (kinds[k] = kinds[k] || []).push({ o, m, tex });
  }));
  Object.keys(kinds).forEach(k => {
    const a = kinds[k], textured = a.filter(x => x.tex), bare = a.filter(x => !x.tex && !x.m.vertexColors && x.m.opacity > 0.5);
    if (textured.length && bare.length) out.push({ msg: bare.length + '/' + a.length + ' "' + k + '" meshes have no map while ' + textured.length + ' siblings do', sel: 'three:' + k });
    bare.forEach(x => { const c = x.m.color; if (c && c.r + c.g + c.b < 0.1 && !(x.m.emissive && x.m.emissive.r + x.m.emissive.g + x.m.emissive.b > 0.1) && a.length >= 2) out.push({ msg: 'near-black untextured mesh in "' + k + '"', sel: 'three:' + k }); });
  });
  const seen = {};
  labels.forEach(o => {
    const img = o.material.map && o.material.map.image; let frac = 1;
    try { const c = img.getContext('2d'), w = img.width, h = img.height, d = c.getImageData(0, 0, w, h).data; let y0 = h, y1 = -1; for (let y = 0; y < h; y++) for (let x = 0; x < w; x += 2) if (d[(y * w + x) * 4 + 3] > 40) { if (y < y0) y0 = y; if (y > y1) y1 = y; break; } if (y1 < 0) return; frac = (y1 - y0 + 1) / h; } catch (e) { }
    const bb = new THREE.Box3().setFromObject(o), mn = bb.min, mx = bb.max, ys = [];
    [mn.x, mx.x].forEach(x => [mn.y, mx.y].forEach(y => [mn.z, mx.z].forEach(z => { const v = new vec(x, y, z).project(cam); ys.push((1 - v.y) / 2 * H); })));
    const hh = (Math.max.apply(null, ys) - Math.min.apply(null, ys)) * frac; if (!(hh > 0)) return;
    if (hh < minFs) { const nm = o.name || o.type, key = nm + Math.round(hh); if (!seen[key]) { seen[key] = 1; out.push({ msg: 'label "' + nm + '" text ~' + Math.round(hh * 10) / 10 + 'px tall on screen (min ' + minFs + ')', sel: 'three:label' }); } }
  });
  return { out, scenes: st.scenes.length };
};

// ---- rule E: real tap on every visible enabled button ----
const BUTTONS = () => {
  const skip = e => e.closest('#gxscn-tag,#gxlab-bar,[data-gx-skip]'), W = innerWidth, H = innerHeight;
  const sel = e => { let s = '', n = 0; for (let x = e; x && x !== document.body && n < 3; x = x.parentElement, n++) s = (x.tagName.toLowerCase() + (x.id ? '#' + x.id : '') + (typeof x.className === 'string' && x.className.trim() ? '.' + x.className.trim().split(/\s+/)[0] : '')) + (s ? '>' + s : ''); return s; };
  return [].slice.call(document.querySelectorAll('button,[role=button],a[href]')).filter(b => { const r = b.getBoundingClientRect(), s = getComputedStyle(b); return !skip(b) && !b.disabled && b.getAttribute('aria-disabled') !== 'true' && r.width > 6 && r.height > 6 && s.visibility !== 'hidden' && s.display !== 'none' && +s.opacity > 0.05 && r.right > 0 && r.left < W && r.bottom > 0 && r.top < H && !b.closest('[hidden]'); })
    .map((b, i) => { b.setAttribute('data-ua', i); const r = b.getBoundingClientRect(), x = Math.min(W - 1, Math.max(1, r.left + r.width / 2)), y = Math.min(H - 1, Math.max(1, r.top + r.height / 2)), t = document.elementFromPoint(x, y); return { i, x, y, label: (b.getAttribute('aria-label') || b.textContent.trim() || b.title || b.id || b.className).toString().replace(/\s+/g, ' ').slice(0, 24), sel: sel(b), covered: !!t && t !== b && !b.contains(t) && !t.contains(b), href: b.tagName === 'A' ? b.getAttribute('href') : '' }; });
};
const WATCH = () => {
  const key = n => { const e = n.nodeType === 1 ? n : n.parentElement; return e ? e.tagName + '#' + e.id + '.' + (typeof e.className === 'string' ? e.className : '') : '?'; };
  window.__uaM = { base: {}, hit: 0, phase: 'base' };
  const mo = new MutationObserver(ms => ms.forEach(m => { if (m.type === 'attributes' && m.attributeName === 'style') return; const k = key(m.target) + '|' + m.type + (m.attributeName || ''); if (window.__uaM.phase === 'base') window.__uaM.base[k] = 1; else if (!window.__uaM.base[k]) window.__uaM.hit++; }));
  mo.observe(document.body, { subtree: true, childList: true, attributes: true, characterData: true }); window.__uaM.mo = mo; window.__uaM.href = location.href;
};

async function openSurface(page, name) {
  return page.evaluate(nm => { const l = GXS.menuList(), i = l.findIndex(s => s.name === nm); if (i < 0) return 'missing'; const r = GXS.menuOpen(i); return r; }, name);
}
async function gather(page, ctx, surface, proj) {
  const r = { A: [], B: [], C: [], D: [], E: [], F: [] }, tag = x => Object.assign({ surface }, x);
  const dom = await page.evaluate(DOM_AUDIT, ctx).catch(e => ({ A: [], C: [], F: [{ msg: 'audit threw ' + e.message.slice(0, 80), sel: '' }], texts: [] }));
  r.A = dom.A.map(tag); r.C = dom.C.map(tag); r.F = dom.F.map(tag);
  try {   // B: hide the text, shoot in memory, analyse in the page
    await page.addStyleTag({ content: '*{color:transparent!important;-webkit-text-fill-color:transparent!important;text-shadow:none!important;caret-color:transparent!important}text,tspan{fill:transparent!important;stroke:none!important}', }).then(async h => {
      const buf = await page.screenshot({ scale: 'css', animations: 'allow', caret: 'hide' }); await h.evaluate(e => e.remove());
      r.B = (await page.evaluate(PIXELS, { b64: buf.toString('base64'), texts: dom.texts })).sort((a, b) => b.score - a.score).map(tag);
    });
  } catch (e) { r.B = [tag({ msg: 'pixel check threw ' + e.message.slice(0, 80), sel: '' })]; }
  if (ctx.isBoard || ctx.isTitle) { const d = await page.evaluate(THREE_AUDIT).catch(() => ({ out: [] })); r.D = d.out.map(tag); r.scenes = d.scenes; }
  return r;
}
async function deadButtons(page, surface, reopen) {
  const dead = []; const list = await page.evaluate(BUTTONS).catch(() => []);
  for (const b of list.slice(0, MAX_BTN)) {
    if (b.covered) continue;   // hidden behind a modal / scrim: not a button the player can see
    await page.evaluate(WATCH).catch(() => { }); await page.waitForTimeout(250);
    await page.evaluate(() => { window.__uaM.phase = 'tap'; });
    const url0 = page.url();
    try { if (page.context()._options.hasTouch) await page.touchscreen.tap(b.x, b.y); else await page.mouse.click(b.x, b.y); } catch (e) { }
    let alive = false;
    for (let t = 0; t < 8 && !alive; t++) { await page.waitForTimeout(190); if (page.url() !== url0) { alive = true; break; } alive = await page.evaluate(() => !window.__uaM || window.__uaM.hit > 0 || location.href !== window.__uaM.href).catch(() => true); }
    if (!alive) dead.push({ surface, msg: 'dead button: ' + b.label, sel: b.sel });
    if (!(await reopen(page.url() !== url0))) break;
  }
  return dead;
}

for (const slug of SLUGS) test.describe(slug, () => {
  test('ui-audit', async ({ page }, ti) => {
    test.setTimeout(+process.env.UA_TIMEOUT || 420000);
    const proj = ti.project.name, res = { A: [], B: [], C: [], D: [], E: [], F: [], surfaces: [], proj, slug }, doE = E_SIZES.includes(proj), errs = [];
    page.on('pageerror', e => errs.push(e.message));
    await page.addInitScript(HOOK);
    const url = `${BASE}/${slug}/?scn=menu`;
    const boot = async () => { await page.goto(url, { waitUntil: 'load', timeout: 45000 }); await page.waitForFunction(() => window.GXS && GXS.menuList, null, { timeout: 30000 }); await page.waitForTimeout(1500); };
    await boot();
    const names = ['start'].concat(await page.evaluate(() => GXS.menuList().map(s => s.name).filter(n => n !== 'title')));
    res.surfaces = names;
    const plain = `${BASE}/${slug}/`;
    for (const nm of names) {
      const isBoard = nm === 'board', isTitle = nm === 'start';
      if (nm === 'start') { await page.goto(plain, { waitUntil: 'load', timeout: 45000 }); await page.waitForTimeout(2500); } else if (!isBoard) { const o = await openSurface(page, nm); if (o === 'missing') continue; } else { await openSurface(page, 'board'); await page.waitForTimeout(2500); }
      await page.waitForTimeout(700);
      const g = await gather(page, { isBoard, isTitle }, nm, proj);
      for (const k of ['A', 'B', 'C', 'D', 'F']) res[k].push(...g[k]);
      if (g.scenes != null) res.scenes = g.scenes;
      if (doE) {
        const reopen = async navigated => {
          if (nm === 'start') { await page.goto(plain, { waitUntil: 'load', timeout: 45000 }); await page.waitForTimeout(2000); return true; }
          if (navigated || !(await page.evaluate(() => !!window.GXS).catch(() => false))) { await boot(); if (isBoard) { await openSurface(page, 'board'); await page.waitForTimeout(2000); } else await openSurface(page, nm); }
          else if (isBoard) { await page.keyboard.press('Escape').catch(() => { }); await page.evaluate(() => [].slice.call(document.querySelectorAll('.gx-x,[data-gx-close],.gxc-x')).forEach(b => b.click())).catch(() => { }); }
          else await openSurface(page, nm);
          await page.waitForTimeout(500); return true;
        };
        res.E.push(...await deadButtons(page, nm, reopen));
      }
    }
    res.pageErrors = errs.slice(0, 5);
    fs.mkdirSync(OUT, { recursive: true }); fs.writeFileSync(path.join(OUT, `${slug}-${proj}.json`), JSON.stringify(res));
    const n = ['A', 'B', 'C', 'D', 'E', 'F'].map(k => k + res[k].length).join(' ');
    test.info().annotations.push({ type: 'audit', description: n });
    console.log(`${slug} ${proj}: ${n}`);
  });
});
