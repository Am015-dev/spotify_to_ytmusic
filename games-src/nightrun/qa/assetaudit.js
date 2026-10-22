#!/usr/bin/env node
// ASSET AUDIT: how every picture is really drawn (hooks drawImage + reads the DOM <img>s). Scenes: title, hangar, lab ASSETS pages, stages 1 / 6 / 14, a boss, the street (zeil).
// For every image id: native size, drawn size in DEVICE px, aspect, and four flags:
//   BLUR   drawn > 1.25x native in device px (upscaled)           DIST   drawn aspect differs > 4% from the picture's (a constant offset; squash-and-stretch that moves is listed as 'anim', not flagged)
//   OPAQUE a sprite that should be transparent has an opaque background (>= 3 corners opaque, or > 30% of the border opaque), measured on the bitmap the game really draws
//   THUMB  a small file is drawn while a larger file of the same stem exists in media/
//   WHITE  a street/backdrop layer with an enclosed near-white gap (area > 0.05% of the picture) that should be transparent
//   (info) 'unresolved canvas draws' = drawImage of a cached canvas whose picture could not be found (glow caches, text); not judged
//   NODE_PATH=$(npm root -g) node games-src/nightrun/qa/assetaudit.js            env: Q='&artfix=0' (extra URL flags), VP=phone|desk|both (default both), OUT=<report.json>, SHOTS=<dir> (pngs, keep out of git), SCENES=title,hangar,lab,s1,s6,s14,boss,street
// Prints one summary line per scene + the flagged ids, then 'FLAGS blur=N dist=N opaque=N thumb=N'. Exit 0 always (it is a measurement).
const PW = require(process.env.PW || 'playwright'), path = require('path'), cp = require('child_process'), fs = require('fs'), os = require('os'), net = require('net');
const ROOT = path.resolve(__dirname, '../../..'), GAME = path.join(ROOT, 'games/mainhattan-nightrun'), MEDIA = path.join(GAME, 'media');
const Q = process.env.Q || '', VPS = { phone: { w: 390, h: 763, dpr: 2, touch: true }, desk: { w: 1440, h: 860, dpr: 1, touch: false } };
const VPW = (process.env.VP || 'both') === 'both' ? ['phone', 'desk'] : [process.env.VP];
const SC = (process.env.SCENES || 'title,hangar,lab,s1,s6,s14,boss,street').split(',');
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
// sprites that are SUPPOSED to be opaque (backdrops, full-screen plates, bars)
const OPAQUE_OK = /^((ship|boss)-[a-z-]+$|foot\/bg-|ly-|bg-(athina|bankenviertel|mainufer|messe|ostend)|foot\/bg-sky|title|garage|pause|end-|event-|ui-|card-back|card-frame|diff-|soon-|story-|cin-|splash|poster|tile-|icon-|anim-boss-)/;
// seeded RNG + virtual clock (as fingerprint-test.js) so the stage scenes are the same every run; __au collects the drawImage calls while __auOn
const INIT = `(()=>{let a=7|0;Math.random=function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
  window.__vt=0;const T0=Date.UTC(2026,9,21,12,0,0);performance.now=()=>window.__vt;Date.now=()=>T0+window.__vt;
  window.__raf=[];window.requestAnimationFrame=f=>(window.__raf.push(f),window.__raf.length);window.cancelAnimationFrame=()=>{};})();`;
const HOOK = `(()=>{const A=window.__au={calls:{},unk:0,unkN:{}};const pr=CanvasRenderingContext2D.prototype,di=pr.drawImage,rev=new WeakMap();window.__auOn=false;
  const parse=k=>{if(k.startsWith('a|'))return 'anim/'+k.slice(2).split('@')[0];if(/^[sth]\\|/.test(k))k=k.slice(2);return k.split('@')[0].split('|')[0];};
  const resolve=im=>{if(rev.has(im))return rev.get(im);let r=null;const M=window.__mnr,ART=M&&M.ART;
    if(im instanceof HTMLImageElement){const m=/media\\/(.+)\\.webp/.exec(im.src);if(m)r={id:m[1],o:im};}
    else if(ART){for(const k in ART.bm)if(ART.bm[k]===im){r={id:k,o:im};break;}
      if(!r)for(const k in ART.sc){const o=ART.sc[k];if(o&&o.c===im){r={id:parse(k),o:ART.bm[parse(k)]||null,derived:1};break;}}
      if(!r)for(const k in ART.big){if(ART.big[k]===im){r={id:parse(k),o:ART.bm[parse(k)]||null,derived:1};break;}}
      if(!r&&window.FA)for(const k in FA._im){const q=FA._im[k];if(q&&q.im===im){r={id:k.replace(/\\.webp$/,''),o:im};break;}}}
    rev.set(im,r);return r;};
  pr.drawImage=function(im,...a){if(window.__auOn&&im){try{const r=resolve(im);if(!r){A.unk++;const u=(im.width||0)+'x'+(im.height||0);A.unkN[u]=(A.unkN[u]||0)+1;}else{
      const T=this.getTransform(),sx=Math.hypot(T.a,T.b),sy=Math.hypot(T.c,T.d),iw=im.naturalWidth||im.width,ih=im.naturalHeight||im.height;
      let sw=iw,sh=ih,dw,dh;if(a.length>=8){sw=a[2];sh=a[3];dw=a[6];dh=a[7];}else if(a.length>=4){dw=a[2];dh=a[3];}else{dw=iw;dh=ih;}
      let nw=sw,nh=sh;const o=r.o;if(r.id.startsWith('anim/')){const m=window.__mnr.ART.ANIM.s[r.id.slice(5)];if(m){nw=m[2];nh=m[3];}}else if(r.derived&&o){nw=o.naturalWidth||o.width;nh=o.naturalHeight||o.height;}
      const dwd=Math.abs(dw)*sx,dhd=Math.abs(dh)*sy;if(nw>0&&nh>0&&dwd>0&&dhd>0){const e=A.calls[r.id]||(A.calls[r.id]={id:r.id,n:0,nat:[Math.round(nw),Math.round(nh)],dev:[0,0],up:0,asp:1e9,aspMax:0,derived:r.derived?1:0});
        e.n++;const up=Math.max(dwd/nw,dhd/nh);if(up>e.up){e.up=up;e.dev=[Math.round(dwd),Math.round(dhd)];}const asp=(dwd/dhd)/(nw/nh);e.asp=Math.min(e.asp,asp);e.aspMax=Math.max(e.aspMax,asp);}}}catch(e){}}
    return di.call(this,im,...a);};})();`;
// in the page: the bitmap the game really draws (ART.bm[id], post-fix) -> corner + border alpha
const ANALYSE = (ids) => {
  const out = {}; const ART = window.__mnr.ART;
  const get = id => { const f = window.FA && FA._im[id + '.webp'], b = (f && f.ok && f.im) || ART.bm[id]; return b && b.width ? b : null; };   // the on-foot loader's copy first (it is the one drawn)
  for (const id of ids) {
    const b = get(id); if (!b) continue; const w = Math.min(b.width, /^(foot\/bg-|ly-)/.test(id) ? 512 : 256), h = Math.max(1, Math.round(b.height * w / b.width));
    const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(b, 0, 0, w, h); const d = g.getImageData(0, 0, w, h).data;
    const al = (x, y) => d[(y * w + x) * 4 + 3]; let corners = 0; for (const [x, y] of [[0, 0], [w - 1, 0], [0, h - 1], [w - 1, h - 1]]) if (al(x, y) > 240) corners++;
    let bo = 0, bn = 0; for (let x = 0; x < w; x++) { bn++; if (al(x, 0) > 240) bo++; } for (let y = 1; y < h - 1; y++) for (const x of [0, w - 1]) { bn++; if (al(x, y) > 240) bo++; }   // top and side edges (the bottom edge of a landscape layer is opaque by design)
    corners = (al(0, 0) > 240) + (al(w - 1, 0) > 240) + (al(0, h - 1) > 240) * .5 + (al(w - 1, h - 1) > 240) * .5;
    let transp = 0; for (let i = 3; i < d.length; i += 4) if (d[i] < 250) transp++; let wh = 0;
    if (/^(foot\/bg-(far|mid|near)|ly-)/.test(id) && transp > w * h * .2) { const seen = new Uint8Array(w * h), isW = p => d[p * 4] > 228 && d[p * 4 + 1] > 228 && d[p * 4 + 2] > 228 && d[p * 4 + 3] > 200;
      for (let s = 0; s < w * h; s++) { if (seen[s] || !isW(s)) continue; const st = [s]; seen[s] = 1; let n = 0; while (st.length) { const p = st.pop(); n++; const x = p % w; for (const q of [x > 0 ? p - 1 : -1, x < w - 1 ? p + 1 : -1, p >= w ? p - w : -1, p < w * h - w ? p + w : -1]) if (q >= 0 && !seen[q] && isW(q)) { seen[q] = 1; st.push(q); } } wh = Math.max(wh, n); } wh = +(wh / (w * h)).toFixed(4); }
    out[id] = { corners, border: +(bo / bn).toFixed(2), nat: [b.width, b.height], white: wh };
  }
  return out;
};
const DOMIMGS = () => { const dpr = devicePixelRatio, o = [];
  for (const im of document.images) { const r = im.getBoundingClientRect(); if (!r.width || !r.height || !im.naturalWidth) continue; const cs = getComputedStyle(im); if (cs.visibility === 'hidden' || cs.display === 'none') continue; const m = /media\/(.+)\.webp/.exec(im.src); if (!m) continue;
    const bw = r.width * dpr, bh = r.height * dpr, nw = im.naturalWidth, nh = im.naturalHeight, fit = cs.objectFit; let dw = bw, dh = bh;
    if (fit === 'contain' || fit === 'scale-down') { const k = Math.min(bw / nw, bh / nh); dw = nw * k; dh = nh * k; } else if (fit === 'cover') { const k = Math.max(bw / nw, bh / nh); dw = nw * k; dh = nh * k; }
    o.push({ id: m[1], nat: [nw, nh], dev: [Math.round(dw), Math.round(dh)], up: Math.max(dw / nw, dh / nh), asp: (dw / dh) / (nw / nh), dom: 1 }); }
  for (const el of document.querySelectorAll('*')) { const cs = getComputedStyle(el); const m = /media\/([^"')]+)\.webp/.exec(cs.backgroundImage || ''); if (!m) continue; const r = el.getBoundingClientRect(); if (!r.width || !r.height || cs.visibility === 'hidden') continue; const im = new Image(); im.src = 'media/' + m[1] + '.webp'; if (!im.naturalWidth) continue;
    const k = /contain/.test(cs.backgroundSize) ? Math.min(r.width * dpr / im.naturalWidth, r.height * dpr / im.naturalHeight) : Math.max(r.width * dpr / im.naturalWidth, r.height * dpr / im.naturalHeight); if (/\d/.test(cs.backgroundSize)) continue;
    o.push({ id: m[1], nat: [im.naturalWidth, im.naturalHeight], dev: [Math.round(im.naturalWidth * k), Math.round(im.naturalHeight * k)], up: k, asp: 1, dom: 1, bgimg: 1 }); }
  return o; };
const IDLE = async () => { const A = window.__mnr.ART; for (let i = 0; i < 300 && (A.q.length || A.lowN || A.pend); i++) await new Promise(r => setTimeout(r, 100)); };
// scene drivers (run in the page, virtual clock)
const STAGE = async (o) => { const m = window.__mnr, dt = 1 / 60; m.SET.diff = 'normal'; m.startStory(o.n); m.simOn(true); const G = m.G; let i = 0;
  const draw = () => { window.__auOn = true; try { m.render(); } catch (e) { } window.__auOn = false; };
  while (m.running && i < 900) { if (m.SH.active) m.SH.close(); if (m.ST.over) break; m.touchTo(220 + 70 * Math.sin(i * .009), 270 + 170 * Math.sin(i * .018)); if (i % 20 === 0) m.press('Fire'); window.__vt += 1000 / 60; m.step(dt); i++; if (i >= 90 && i % 30 === 0) draw(); if (G.dead) break; }
  window.__vt += 1; return { frames: i }; };
const BOSS = async () => { const m = window.__mnr, dt = 1 / 60; m.SET.diff = 'normal'; m.ST.on = false; document.getElementById('startBtn').click(); m.simOn(true); const G = m.G, P = m.P; let i = 0, bf = 0;
  const draw = () => { window.__auOn = true; try { m.render(); } catch (e) { } window.__auOn = false; };
  while (m.running && i < 3600) { if (m.SH.active) m.SH.close(); if (m.ST.over) break; if (i >= 60 && !G.boss && i % 30 === 0) m.bossNow(); P.hp = P.max; m.touchTo(220 + 70 * Math.sin(i * .009), 520); if (i % 20 === 0) m.press('Fire'); window.__vt += 1000 / 60; m.step(dt); i++; if (G.boss) { bf++; if (bf > 150 && bf % 30 === 0) draw(); if (bf > 420) break; } }
  return { frames: i, boss: bf }; };
const STREET = async () => { const m = window.__mnr, dt = 1 / 60; document.getElementById('fMenu') && (document.getElementById('fMenu').hidden = true); const sv = FOOT.save(); if (sv && sv.seen) sv.seen.b = 1; m.simOn(true); window.__god = 1; FOOT.start('zeil'); let i = 0;
  FOOT.ctl = (S, I) => { for (const k in I) I[k] = 0; I.r = 1; if (i % 70 === 35) { I.jump = 1; I.jumpP = 1; } I.fire = (i % 20) < 10 ? 1 : 0; };
  while (FOOT.S && !FOOT.S.end && i < 1100) { FOOT.S.P.hp = 99; window.__vt += 1000 / 60; i++; window.__auOn = i % 40 === 0 && i > 200; const q = window.__raf.splice(0); if (q.length) q.forEach(f => f(window.__vt)); else FOOT.sim(dt, dt); window.__auOn = false; }
  FOOT.ctl = null; return { frames: i, sec: FOOT.S && FOOT.S.cpN }; };

(async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'au-')); cp.execFileSync('python3', [path.join(__dirname, '../parts/build.py')], { env: { ...process.env, NR_OUT: path.join(tmp, 'index.html') }, stdio: 'ignore' });
  for (const d of ['media', 'music', 'icons']) try { fs.symlinkSync(path.join(GAME, d), path.join(tmp, d)); } catch (e) { }
  // file sizes for the THUMB check
  const sizes = JSON.parse(cp.execFileSync('python3', ['-c', `import os,json
from PIL import Image
r={}
for d,_,fs in os.walk(${JSON.stringify(MEDIA)}):
  for f in fs:
    if f.endswith('.webp'):
      p=os.path.join(d,f)
      try: r[os.path.relpath(p,${JSON.stringify(MEDIA)})[:-5]]=Image.open(p).size
      except Exception: pass
print(json.dumps(r))`], { maxBuffer: 1 << 26 }).toString());
  const stem = k => k.replace(/^.*\//, '').replace(/^(spr-|anim-|char-|foot-)/, ''), byStem = {}; for (const k in sizes) (byStem[stem(k)] = byStem[stem(k)] || []).push(k);
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', tmp], { stdio: 'ignore' }); await new Promise(r => setTimeout(r, 700));
  const br = await PW.chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] }), errs = [], report = {}, flags = { blur: 0, dist: 0, opaque: 0, thumb: 0, white: 0 };
  if (process.env.SHOTS) fs.mkdirSync(process.env.SHOTS, { recursive: true });
  const tag = process.env.TAG || 'run';
  for (const vp of VPW) {
    const V = VPS[vp];
    const mk = async (virt, query) => { const ctx = await br.newContext({ viewport: { width: V.w, height: V.h }, deviceScaleFactor: V.dpr, hasTouch: V.touch, isMobile: V.touch, userAgent: V.touch ? UA : undefined, serviceWorkers: 'block' }), p = await ctx.newPage();
      p.on('pageerror', e => errs.push(vp + ': ' + e.message.slice(0, 160))); await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
      await p.addInitScript(() => { try { localStorage.setItem('mnr_tipdone', 'true'); localStorage.setItem('mnr_fscard', '99'); localStorage.setItem('mnr_tut', '2'); localStorage.setItem('mnr_story', JSON.stringify({ stars: { 1: 3, 2: 3, 3: 2 }, snap: {}, all: false, v30: 1, v40: 1 })); } catch (e) { } });
      if (virt) await p.addInitScript(INIT); await p.addInitScript(HOOK);
      await p.goto(`http://127.0.0.1:${port}/index.html?${virt ? 'sim=1&all=1' : 'nomusic=1'}${query || ''}${Q}`, { waitUntil: 'domcontentloaded' });
      await p.waitForFunction(() => window.__mnr && __mnr.TR && __mnr.TR.list.length > 0, null, { timeout: 20000 }).catch(() => { });
      if (!virt) await p.evaluate(IDLE).catch(() => { }); else { await p.evaluate(IDLE).catch(() => { }); await p.evaluate(() => Promise.all([...document.images].map(im => im.complete ? 0 : new Promise(r => { im.onload = im.onerror = r; })))).catch(() => { }); }
      await p.waitForTimeout(500); return { ctx, p }; };
    const shot = (p, n) => process.env.SHOTS ? p.screenshot({ path: path.join(process.env.SHOTS, `${tag}-${n}-${vp}.png`) }).catch(() => { }) : 0;
    const finish = async (name, p, dom) => { const calls = await p.evaluate(() => Object.values(window.__au.calls)); const unk = await p.evaluate(() => ({ n: window.__au.unk, u: window.__au.unkN }));
      const all = calls.concat(dom || []); const ids = [...new Set(all.map(c => c.id))]; const an = await p.evaluate(ANALYSE, ids); const rows = [];
      for (const c of all) { const a = an[c.id] || {}, f = []; const key = c.id.replace(/^anim\//, '');
        const SPAN = /^(fx-(eb|w34|ft)-.*(beam|lane|col|rule|link)|fx-shield-link|ui-hud-)/.test(c.id); if (c.up > 1.25 && !(SPAN && /^(fx-|ui-hud-)/.test(c.id))) f.push('BLUR'); const stat = c.asp != null && c.aspMax != null ? (c.aspMax - c.asp < .03 && Math.abs(c.asp - 1) > .04) : (Math.abs(c.asp - 1) > .04); if (stat && !SPAN) f.push('DIST');
        if (!OPAQUE_OK.test(c.id) && !/^(fx-|nv-ev-)/.test(c.id) && !c.id.startsWith('anim/') && (a.corners >= 2.5 || a.border > .3)) f.push('OPAQUE'); if (a.white > .0005) f.push('WHITE');
        const nm = Math.max(...c.nat); if (nm <= 256 && !c.id.startsWith('anim/')) { const sib = (byStem[stem(c.id)] || []).filter(k => k !== c.id && Math.max(...sizes[k]) >= nm * 1.5); if (sib.length) { f.push('THUMB'); c.sib = sib.slice(0, 2).map(k => k + ' ' + sizes[k].join('x')); } }
        rows.push({ ...c, corners: a.corners, border: a.border, f }); }
      const key = vp + ' ' + name; report[key] = { rows, unk }; const fl = rows.filter(r => r.f.length);
      console.log(`${vp.padEnd(5)} ${name.padEnd(8)} images ${String(rows.length).padStart(3)}  BLUR ${rows.filter(r => r.f.includes('BLUR')).length}  DIST ${rows.filter(r => r.f.includes('DIST')).length}  OPAQUE ${rows.filter(r => r.f.includes('OPAQUE')).length}  THUMB ${rows.filter(r => r.f.includes('THUMB')).length}  WHITE ${rows.filter(r => r.f.includes('WHITE')).length}  unresolved canvas draws ${unk.n}`);
      for (const r of fl) console.log(`   ${r.f.join('+').padEnd(12)} ${r.id.padEnd(34)} native ${r.nat.join('x')} drawn ${r.dev.join('x')} (${(r.up).toFixed(2)}x) aspect ${r.asp > 1e8 ? '-' : r.asp.toFixed(2)}${r.aspMax && r.aspMax - r.asp > .03 ? ' anim ' + r.aspMax.toFixed(2) : ''}${r.corners != null ? ` corners ${r.corners} border ${r.border}${r.white ? ' white ' + r.white : ''}` : ''}${r.sib ? ' | bigger: ' + r.sib.join(', ') : ''}${r.dom ? ' [page img]' : ''}`); };
    const want = n => SC.includes(n);
    if (want('title')) { const { ctx, p } = await mk(false); await shot(p, 'title'); const dom = await p.evaluate(DOMIMGS); const calls = await p.evaluate(() => { window.__auOn = true; try { __mnr.render(); } catch (e) { } window.__auOn = false; }); await finish('title', p, dom); await ctx.close(); }
    if (want('hangar')) { const { ctx, p } = await mk(false); await p.evaluate(() => window.__ga ? __ga.openGarage('title') : document.getElementById('gaBtn').click()); await p.waitForTimeout(1200); await p.evaluate(IDLE); await shot(p, 'hangar'); const dom = await p.evaluate(DOMIMGS); await finish('hangar', p, dom); await ctx.close(); }
    if (want('lab')) { const { ctx, p } = await mk(false, '&lab=1'); await p.waitForFunction(() => __mnr.G && __mnr.G.lab, null, { timeout: 15000 }).catch(() => { }); await p.click('#labTab_assets').catch(() => { }); await p.waitForSelector('#laSecs button', { timeout: 8000 }).catch(() => { }); await p.waitForTimeout(400);
      const nsec = await p.evaluate(() => document.querySelectorAll('#laSecs button').length); let dom = []; const seen = new Set();
      for (let i = 0; i < nsec; i++) { await p.evaluate(i => document.querySelectorAll('#laSecs button')[i].click(), i); await p.waitForTimeout(500); if (i === 0 || i === Math.floor(nsec / 2)) await shot(p, 'lab' + i); for (const d of await p.evaluate(DOMIMGS)) if (!seen.has(d.id + d.dev.join())) { seen.add(d.id + d.dev.join()); dom.push(d); } }
      await finish('lab', p, dom); await ctx.close(); }
    for (const [name, o] of [['s1', { n: 1 }], ['s6', { n: 6 }], ['s14', { n: 14 }]]) if (want(name)) { const { ctx, p } = await mk(true); const r = await p.evaluate(STAGE, o); await shot(p, name); await finish(name, p); await ctx.close(); }
    if (want('boss')) { const { ctx, p } = await mk(true); const r = await p.evaluate(BOSS); await shot(p, 'boss'); console.log(`   boss on screen ${r.boss} frames`); await finish('boss', p); await ctx.close(); }
    if (want('street')) { const { ctx, p } = await mk(false); await p.evaluate(() => document.getElementById('moreBtn').click()); await p.waitForTimeout(300); await p.evaluate(() => document.getElementById('footBtn').click()); await p.waitForTimeout(300);
      for (let i = 0; i < 6; i++) { await p.evaluate(() => { const c = document.getElementById('taleCard'); if (c && !c.hidden) (document.getElementById('taleTc') || c).click(); }); await p.waitForTimeout(250); }
      await p.evaluate(() => { window.__god = 1; FOOT.stop && FOOT.stop(); FOOT.start('zeil'); }); await p.waitForFunction(() => window.FA && ['sky', 'far', 'mid', 'near', 'floor'].every(l => { const r = FA._im['foot/bg-' + l + '.webp']; return r && r.ok; }), null, { timeout: 30000 }).catch(() => { }); await p.waitForTimeout(4000);
      if (process.env.DEBUG) { await p.evaluate(() => { window.__h = {}; const di = CanvasRenderingContext2D.prototype.drawImage; CanvasRenderingContext2D.prototype.drawImage = function (im, ...a) { const w = a.length >= 8 ? a[6] : a[2]; if (w > 1000) { const k = im.constructor.name + ':' + (im.src || '').replace(/^.*media\//, '') + ' ' + im.width + 'x' + im.height + ' -> ' + Math.round(w) + 'x' + Math.round(a.length >= 8 ? a[7] : a[3]) + ' y=' + Math.round(a.length >= 8 ? a[5] : a[1]) + ' x=' + Math.round(a.length >= 8 ? a[4] : a[0]) + ' a=' + this.globalAlpha; window.__h[k] = (window.__h[k] || 0) + 1; } return di.call(this, im, ...a); }; }); await p.waitForTimeout(600); console.log(JSON.stringify(await p.evaluate(() => window.__h), null, 1)); }
      await p.evaluate(() => { window.__auOn = true; }); await p.waitForTimeout(2500); await p.evaluate(() => { window.__auOn = false; }); await shot(p, 'street'); console.log('   street: painted=' + (await p.evaluate(() => FOOT.look.paint)) + ' keyed=' + JSON.stringify(await p.evaluate(() => (typeof AFX !== 'undefined' ? AFX.log : null))) + ' layer=' + (await p.evaluate(() => ['sky', 'far', 'mid', 'near', 'floor'].map(l => { const r = FA._im['foot/bg-' + l + '.webp']; return r && r.im.constructor.name + (r.ok ? '' : '!'); }).join()))); await finish('street', p); await ctx.close(); }
  }
  await br.close(); srv.kill();
  const seenF = new Set(); for (const k in report) for (const r of report[k].rows) for (const f of r.f) { const u = f + '|' + r.id; if (seenF.has(u)) continue; seenF.add(u); flags[{ BLUR: 'blur', DIST: 'dist', OPAQUE: 'opaque', THUMB: 'thumb', WHITE: 'white' }[f]]++; }
  if (process.env.OUT) fs.writeFileSync(process.env.OUT, JSON.stringify(report, null, 1));
  if (errs.length) console.log('page errors: ' + [...new Set(errs)].slice(0, 4).join(' / '));
  console.log(`FLAGS (distinct ids, all scenes) blur=${flags.blur} dist=${flags.dist} opaque=${flags.opaque} thumb=${flags.thumb} white=${flags.white} pageErrors=${errs.length}`);
  process.exit(0);
})().catch(e => { console.log('FAIL assetaudit: ' + e.stack); process.exit(1); });
