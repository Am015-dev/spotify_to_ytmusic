#!/usr/bin/env node
// Nightrun UI alignment test: every label sits inside its painted plate / button, nothing overlaps, nothing is clipped, hidden or off-screen.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/ui-align-test.js
//   env: VP=390x763 (one viewport)  ONLY=title,garage (some screens)  SHOTS=dir (save a screenshot of every screen with a finding)  JSON=1  GAME_DIR=...  QUERY=...
// Viewports: 390x763, 375x553 (phones, upright), 844x390 (phone, landscape), 1280x800, 1920x1080.
// Screens: title, settings, story map, stage intro + HUD (canvas), pause, pit stop shop, boss chest, results, game over, garage tabs, market, LAB tabs.
// DOM text (every text node of every visible element) is checked for:
//   clipped / offscreen    the text is cut by an ancestor with overflow:hidden, or lies outside the screen (a scrolled-away part of a scroll box is fine)
//   overflow-plate         the text is not inside the button / card that carries it
//   offset                 a centred button label is off the centre of its painted plate (more than 10% of the plate)
//   overlap                two different texts cover each other
//   covered                another element (image, panel) sits on top of the text
//   small-font             below 11 px on a phone-size screen
//   contrast               below 4.5:1 against the pixels behind it (3:1 for large text), measured on the real screenshot
//   truncated              a button label ends in "..." (text-overflow) or is cut by its own box
// Canvas text (HUD, banners, boss bar) is recorded per frame (fillText + UIK.plate) and checked: inside the screen, not straddling a plate edge, not overlapping other text.
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process'), fs = require('fs'), os = require('os');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const VPS = [[390, 763, 1], [375, 553, 1], [844, 390, 1], [1280, 800, 0], [1920, 1080, 0]].filter(v => !process.env.VP || process.env.VP === v[0] + 'x' + v[1]);
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null, SHOTS = process.env.SHOTS;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';

/* ---- runs inside the page ---- */
function pageAudit(opts) {
  const vw = innerWidth, vh = innerHeight, out = [], items = [];
  const area = r => Math.max(0, r.right - r.left) * Math.max(0, r.bottom - r.top);
  const inter = (a, b) => ({ left: Math.max(a.left, b.left), top: Math.max(a.top, b.top), right: Math.min(a.right, b.right), bottom: Math.min(a.bottom, b.bottom) });
  const desc = e => e ? (e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (e.className && typeof e.className === 'string' ? '.' + e.className.trim().split(/\s+/).slice(0, 2).join('.') : '')) : '?';
  const visible = el => { for (let e = el; e && e !== document.documentElement; e = e.parentElement) { const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < .05 || e.hidden) return false; } return true; };
  const IGN = el => el.closest('#fpsEl,#nrChk,script,style,[data-ui-ignore]');
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n;
  while ((n = w.nextNode())) {
    const t = n.nodeValue.replace(/\s+/g, ' ').trim(); if (!t) continue; const el = n.parentElement; if (!el || IGN(el) || !visible(el)) continue;
    const rg = document.createRange(); rg.selectNodeContents(n); const rs = [...rg.getClientRects()].filter(q => q.width > .5 && q.height > .5); if (!rs.length) continue;
    const tr = { left: Math.min(...rs.map(q => q.left)), top: Math.min(...rs.map(q => q.top)), right: Math.max(...rs.map(q => q.right)), bottom: Math.max(...rs.map(q => q.bottom)) };
    const cs = getComputedStyle(el); items.push({ t, el, tr, cs, fs: parseFloat(cs.fontSize), col: cs.color, fw: +cs.fontWeight });
  }
  for (const it of items) {
    const { el, tr, t } = it, tag = `"${t.slice(0, 28)}" in ${desc(el)}`;
    // visible part: intersect with every clipping ancestor; a scroll box that merely scrolled the text away is fine
    let vr = { ...tr }, clipBy = null, scrolled = false, scrClip = false;
    for (let e = el; e && e !== document.documentElement; e = e.parentElement) {
      const cs = getComputedStyle(e); if (e === document.body) break;
      const ox = cs.overflowX, oy = cs.overflowY, clips = ox !== 'visible' || oy !== 'visible';
      if (clips) { const r = e.getBoundingClientRect(), nr = inter(vr, r); const scr = /auto|scroll/.test(ox + oy) && (e.scrollHeight > e.clientHeight + 1 || e.scrollWidth > e.clientWidth + 1);
        if (area(nr) < area(vr) * .98) { if (scr) { scrClip = true; if (area(inter(tr, r)) < 1) { scrolled = true; } } else if (!clipBy) clipBy = e; }
        vr = nr; }
    }
    if (scrolled) { it.skip = true; continue; }
    const fr = area(vr) / Math.max(1, area(tr));
    if (clipBy && fr < .9) out.push(['clipped', `${tag} is cut by ${desc(clipBy)} (${Math.round(fr * 100)}% visible)`]);
    const on = inter(tr, { left: 0, top: 0, right: vw, bottom: vh }); if (area(on) < area(tr) * .9 && !clipBy && !scrClip) out.push(['offscreen', `${tag} lies outside the screen`]);
    if (fr < .05 || area(on) < 1) { it.skip = true; continue; }
    // the plate: the button / card the text sits on
    const pl = el.closest('button,[role=button],.card,.chk,.sl,label');
    const badge = getComputedStyle(el).position === 'absolute';
    if (pl && visible(pl) && !badge) { const pr = pl.getBoundingClientRect(); const tol = 1.5;
      if (tr.left < pr.left - tol || tr.right > pr.right + tol || tr.top < pr.top - tol || tr.bottom > pr.bottom + tol) out.push(['overflow-plate', `${tag} sticks out of ${desc(pl)} [text ${Math.round(tr.left)},${Math.round(tr.top)},${Math.round(tr.right)},${Math.round(tr.bottom)} plate ${Math.round(pr.left)},${Math.round(pr.top)},${Math.round(pr.right)},${Math.round(pr.bottom)}]`]);
      if (pl.tagName === 'BUTTON' && pl.textContent.trim() === t && pl.children.length === 0 && getComputedStyle(pl).textAlign !== 'left') {
        const bx = (pr.left + pr.right) / 2, by = (pr.top + pr.bottom) / 2, cx = (tr.left + tr.right) / 2, cy = (tr.top + tr.bottom) / 2;
        if (Math.abs(cx - bx) > Math.max(5, pr.width * .1) || Math.abs(cy - by) > Math.max(5, pr.height * .18)) out.push(['offset', `${tag} is off the centre of its plate (dx ${Math.round(cx - bx)}, dy ${Math.round(cy - by)})`]); }
      if (pl.scrollWidth > pl.clientWidth + 2 && getComputedStyle(pl).overflowX !== 'visible') out.push(['truncated', `${tag}: ${desc(pl)} is wider inside (${pl.scrollWidth}) than outside (${pl.clientWidth})`]); }
    if (it.cs.textOverflow === 'ellipsis' && el.scrollWidth > el.clientWidth + 1 && el.closest('button')) out.push(['truncated', `${tag} ends in "..."`]);
    if (vw <= 900 && it.fs < 10.95) out.push(['small-font', `${tag} is ${it.fs.toFixed(1)} px`]);
    // covered by something else
    const px = [[.5, .5], [.2, .5], [.8, .5], [.5, .2], [.5, .8]], ins = inter(tr, vr); let cov = 0, by = null;
    for (const [fx, fy] of px) { const x = ins.left + (ins.right - ins.left) * fx, y = ins.top + (ins.bottom - ins.top) * fy; if (x < 0 || y < 0 || x >= vw || y >= vh) continue;
      const st = document.elementsFromPoint(x, y); let k = st.findIndex(e => e === el || e.contains(el) || el.contains(e)); if (k < 0) k = st.length;
      const above = st.slice(0, k).filter(e => { if (e.closest('#labP') && e.closest('#labP').contains(el)) return false; const c = getComputedStyle(e); return e.tagName === 'IMG' || e.tagName === 'CANVAS' || e.tagName === 'VIDEO' || e.tagName === 'svg' || (c.backgroundImage !== 'none') || (/rgba?\(/.test(c.backgroundColor) && !/rgba\(\d+, \d+, \d+, 0\)/.test(c.backgroundColor) && +(c.backgroundColor.split(',')[3] || 1) > .35); });
      if (above.length) { cov++; by = above[0]; } }
    if (cov >= 3) out.push(['covered', `${tag} is under ${desc(by)}`]);
    it.vis = ins;
  }
  // overlaps between different texts
  const live = items.filter(i => !i.skip && i.vis);
  for (let i = 0; i < live.length; i++) for (let j = i + 1; j < live.length; j++) { const a = live[i], b = live[j]; if (a.el === b.el || a.el.contains(b.el) || b.el.contains(a.el)) continue;
    const o = inter(a.vis, b.vis), ar = area(o); if (ar > 6 && ar > .12 * Math.min(area(a.vis), area(b.vis))) out.push(['overlap', `"${a.t.slice(0, 22)}" (${desc(a.el)}) overlaps "${b.t.slice(0, 22)}" (${desc(b.el)}) by ${Math.round(ar)} px2`]); }
  // contrast candidates (decided outside, on the screenshot)
  const cc = live.filter(i => !i.el.closest('.lock,:disabled')).map(i => ({ t: i.t.slice(0, 30), r: [i.vis.left, i.vis.top, i.vis.right, i.vis.bottom].map(Math.round), col: i.col, big: i.fs >= 24 || (i.fs >= 18.66 && i.fw >= 700), el: desc(i.el) }));
  return { out, cc };
}
/* the canvas side: texts and plates recorded of the last full frame */
function installCanvasSpy() {
  window.__ct = { cur: [], last: [], plates: [], lastPlates: [] };
  const P = CanvasRenderingContext2D.prototype, ft = P.fillText;
  P.fillText = function (t, x, y, mw) {
    try { if (this.canvas && this.canvas.id === 'game') { const m = this.getTransform(), fs = parseFloat(this.font.match(/(\d+(?:\.\d+)?)px/)?.[1] || 12), wd = this.measureText(String(t)).width, a = this.textAlign;
      const x0 = a === 'center' ? x - wd / 2 : a === 'right' || a === 'end' ? x - wd : x, y0 = y - fs * .8, y1 = y + fs * .22; const pts = [[x0, y0], [x0 + wd, y0], [x0, y1], [x0 + wd, y1]].map(([px, py]) => [m.a * px + m.c * py + m.e, m.b * px + m.d * py + m.f]);
      const k = this.canvas.getBoundingClientRect().width / this.canvas.width;
      window.__ct.cur.push({ t: String(t), r: [Math.min(...pts.map(p => p[0])) * k, Math.min(...pts.map(p => p[1])) * k, Math.max(...pts.map(p => p[0])) * k, Math.max(...pts.map(p => p[1])) * k], fs: fs * Math.hypot(m.a, m.b) * k, fill: String(this.fillStyle) }); } } catch (e) { }
    return ft.apply(this, arguments); };
  const raf = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = cb => raf(t => { const c = window.__ct; if (c.cur.length) { c.last = c.cur; c.lastPlates = c.plates; } c.cur = []; c.plates = []; cb(t); });
}
function wrapPlates() { const U = window.__mnr && window.__mnr.UIK; if (!U || U.__w) return; U.__w = 1; const o = U.plate; U.plate = function (c, name, x, y, w, h, cap, cd) { try { if (c.canvas && c.canvas.id === 'game') { const m = c.getTransform(), k = c.canvas.getBoundingClientRect().width / c.canvas.width, d = cd || 0;
    window.__ct.plates.push({ n: name, r: [(m.a * (x + d) + m.e) * k, (m.d * (y + d) + m.f) * k, (m.a * (x + w - d) + m.e) * k, (m.d * (y + h - d) + m.f) * k], o: [(m.a * x + m.e) * k, (m.d * y + m.f) * k, (m.a * (x + w) + m.e) * k, (m.d * (y + h) + m.f) * k] }); } } catch (e) { } return o.apply(this, arguments); }; }
function canvasAudit() {
  const c = window.__ct, out = [], vw = innerWidth, vh = innerHeight, cv = document.getElementById('game').getBoundingClientRect();
  const area = r => Math.max(0, r[2] - r[0]) * Math.max(0, r[3] - r[1]), inter = (a, b) => [Math.max(a[0], b[0]), Math.max(a[1], b[1]), Math.min(a[2], b[2]), Math.min(a[3], b[3])];
  const T = c.last.filter(t => t.t.trim() && t.r[0] > -1e6).map(t => ({ ...t, r: [t.r[0] + cv.left, t.r[1] + cv.top, t.r[2] + cv.left, t.r[3] + cv.top] })), PL = c.lastPlates.map(p => ({ ...p, r: [p.r[0] + cv.left, p.r[1] + cv.top, p.r[2] + cv.left, p.r[3] + cv.top], o: [p.o[0] + cv.left, p.o[1] + cv.top, p.o[2] + cv.left, p.o[3] + cv.top] }));
  for (const t of T) { const tag = `canvas "${t.t.slice(0, 26)}"`;
    if (t.r[0] < cv.left - 1 || t.r[2] > cv.right + 1 || t.r[1] < cv.top - 1 || t.r[3] > cv.bottom + 1) out.push(['offscreen', `${tag} is outside the canvas`]);
    if (vw <= 900 && t.fs < (vh < 600 && vh > vw ? 7.9 : 10.95)) out.push(['small-font', `${tag} is ${t.fs.toFixed(1)} px`]);   // a short upright phone (375x553) keeps only a 295 px wide playfield beside its button column: 8 px there
    for (const p of PL) { const o = inter(t.r, p.o), ar = area(o), ta = area(t.r); if (ta > 0 && ar > ta * .05) { const pad = 1.5; if (t.r[0] < p.r[0] - pad || t.r[2] > p.r[2] + pad || t.r[1] < p.r[1] - pad || t.r[3] > p.r[3] + pad) out.push(['overflow-plate', `${tag} is on the frame or outside of plate ${p.n} [text ${t.r.map(Math.round)} inner area ${p.r.map(Math.round)}]`]); } } }
  for (let i = 0; i < T.length; i++) for (let j = i + 1; j < T.length; j++) { const o = inter(T[i].r, T[j].r), ar = area(o); if (ar > 6 && ar > .12 * Math.min(area(T[i].r), area(T[j].r)) && T[i].t !== T[j].t) out.push(['overlap', `canvas "${T[i].t.slice(0, 20)}" overlaps "${T[j].t.slice(0, 20)}" by ${Math.round(ar)} px2`]); }
  return { out, cc: T.filter(t => t.fs > 0).map(t => ({ t: 'canvas ' + t.t.slice(0, 24), r: t.r.map(Math.round), col: t.fill, big: t.fs >= 24, el: 'canvas' })) };
}

/* ---- contrast on the screenshot (python + PIL) ---- */
function contrastCheck(png, cc) {
  const tmp = path.join(os.tmpdir(), 'ua-' + process.pid + '-' + Math.random().toString(36).slice(2)); fs.writeFileSync(tmp + '.json', JSON.stringify(cc));
  const py = `
import json,sys
from PIL import Image
im=Image.open(sys.argv[1]).convert('RGB');cc=json.load(open(sys.argv[2]));W,H=im.size
def lin(c):
    c/=255;return c/12.92 if c<=.03928 else ((c+.055)/1.055)**2.4
def L(p):return .2126*lin(p[0])+.7152*lin(p[1])+.0722*lin(p[2])
import re
def parse(s):
    m=re.findall(r'[\\d.]+',s)
    if len(m)<3:return (255,255,255,1)
    return (float(m[0]),float(m[1]),float(m[2]),float(m[3]) if len(m)>3 else 1)
out=[]
for c in cc:
    x0,y0,x1,y1=[int(v) for v in c['r']];x0=max(0,x0);y0=max(0,y0);x1=min(W,x1);y1=min(H,y1)
    if x1-x0<3 or y1-y0<3: continue
    px=list(im.crop((x0,y0,x1,y1)).getdata())
    f=parse(c['col'])
    lums=sorted(L(p) for p in px)
    # background = the median of the pixels farthest (in luminance) from the text colour
    fl=L(f[:3]);far=sorted(px,key=lambda p:-abs(L(p)-fl))[:max(1,len(px)//2)]
    bl=sorted(L(p) for p in far)[len(far)//2]
    fg=fl
    if f[3]<1:fg=f[3]*fl+(1-f[3])*bl
    hi,lo=max(fg,bl),min(fg,bl);r=(hi+.05)/(lo+.05)
    need=3 if c['big'] else 4.5
    if r<need:out.append([c['t'],round(r,2),need,c['el'],c['r']])
print(json.dumps(out))`;
  fs.writeFileSync(tmp + '.py', py); fs.writeFileSync(tmp + '.png', png);
  let res = []; try { res = JSON.parse(cp.execFileSync('python3', ['-I', '-W', 'ignore', tmp + '.py', tmp + '.png', tmp + '.json'], { encoding: 'utf8', maxBuffer: 1 << 26 })); } catch (e) { res = [['contrast tool failed: ' + String(e.message).slice(0, 80), 0, 0, '', []]]; }
  for (const f of [tmp + '.json', tmp + '.py', tmp + '.png']) try { fs.unlinkSync(f); } catch (e) { }
  return res.map(([t, r, need, el, rect]) => ['contrast', `"${t}" in ${el}: ${r}:1 (needs ${need}:1) at ${rect}`]);
}

/* ---- the screens ---- */
const clickText = async (p, sel, txt) => { const h = await p.$(`${sel}:has-text("${txt}")`); if (!h) throw new Error('no ' + sel + ' with ' + txt); await h.click({ force: true }); };
const SCREENS = [
  ['title', async p => { }],
  ['settings', async p => { await p.click('#setBtn'); await sleep(300); }],
  ['settings-scrolled', async p => { await p.click('#setBtn'); await sleep(300); await p.evaluate(() => { const b = document.getElementById('setBody'); if (b) b.scrollTop = b.scrollHeight; }); await sleep(200); }],
  ['story-map', async p => { await clickText(p, '#title button', 'STORY'); await sleep(500); }],
  ['story-stage', async p => { await p.evaluate(() => { __mnr.sSave.all = true; __mnr.startStory(1); }); await sleep(900); }, 'canvas'],
  ['hud-run', async p => { await p.click('#startBtn'); await p.waitForFunction(() => __mnr.running); await p.evaluate(() => { __mnr.god = true; }); await sleep(2500); }, 'canvas'],
  ['hud-boss', async p => { await p.click('#startBtn'); await p.waitForFunction(() => __mnr.running); await p.evaluate(() => { __mnr.god = true; __mnr.G.dt = 1e9; }); await p.waitForFunction(() => __mnr.G.boss && __mnr.G.boss.x <= 800, null, { timeout: 40000 }); await sleep(1800); }, 'canvas'],
  ['pause', async p => { await p.click('#startBtn'); await p.waitForFunction(() => __mnr.running); await sleep(800); await p.keyboard.press('Escape'); await sleep(400); }],
  ['pit-shop', async p => { await p.click('#startBtn'); await p.waitForFunction(() => __mnr.running); await p.evaluate(() => { __mnr.SH.neon = 200; __mnr.SH.pit(() => { }); }); await sleep(900); }],
  ['boss-chest', async p => { await p.evaluate(() => localStorage.setItem('mnr_chest', '1')); await p.click('#startBtn'); await p.waitForFunction(() => __mnr.running); await p.evaluate(() => { __mnr.G.bossDone = true; __mnr.SH.pit(() => { }); }); await sleep(900); }],
  ['story-results', async p => { await p.evaluate(() => { __mnr.sSave.all = true; __mnr.startStory(1); }); await sleep(700); await p.evaluate(() => { __mnr.ST.fail(); }); await sleep(900); }],
  ['game-over', async p => { await p.click('#startBtn'); await p.waitForFunction(() => __mnr.running); await p.evaluate(() => { __mnr.god = false; __mnr.hurt(99); __mnr.G.deadT = 9; }); await sleep(1800); }],
  ['garage', async p => { await p.click('#gaBtn'); await sleep(500); }],
  ['garage-tabs', null],
  ['lab-boss', async p => { await p.click('#labBtn'); await sleep(2500); }, 'canvas'],
  ['lab-foes', async p => { await p.click('#labBtn'); await sleep(900); await p.click('#labTab_foes'); await sleep(300); }],
  ['lab-items', async p => { await p.click('#labBtn'); await sleep(900); await p.click('#labTab_items'); await sleep(300); }],
  ['lab-cheats', async p => { await p.click('#labBtn'); await sleep(900); await p.click('#labTab_cheats'); await sleep(300); }],
];

(async () => {
  const port = await freePort(); const srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  for (let i = 0; i < 50; i++) { try { if ((await fetch(`http://127.0.0.1:${port}/index.html`)).ok) break; } catch (e) { } await sleep(100); }
  const br = await PW.chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
  const all = []; let screens = 0;
  for (const [W, H, touch] of VPS) {
    const run = async (name, setup, mode) => {
      const ctx = await br.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, hasTouch: !!touch, isMobile: !!touch, userAgent: touch ? UA : undefined });
      const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
      await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
      await p.addInitScript(installCanvasSpy); await p.addInitScript(() => { try { localStorage.setItem('mnr_tipdone', 'true'); } catch (e) { } });
      await p.goto(`http://127.0.0.1:${port}/index.html` + (process.env.QUERY || ''), { waitUntil: 'domcontentloaded' });
      await p.waitForFunction(() => window.__mnr, null, { timeout: 15000 });
      await p.waitForFunction(() => document.documentElement.classList.contains('rdy'), null, { timeout: 15000 }).catch(() => { });
      await sleep(600); await p.evaluate(wrapPlates);
      let issues = [], tag = `${W}x${H} ${name}`;
      try { await setup(p); await sleep(300); await p.evaluate(wrapPlates);
        const d = await p.evaluate(pageAudit, {}); issues = d.out; let cc = d.cc;
        if (mode === 'canvas') { await sleep(500); const c = await p.evaluate(canvasAudit); issues = issues.concat(c.out); cc = cc.concat(c.cc); }
        const png = await p.screenshot(); issues = issues.concat(contrastCheck(png, cc));
        if (errs.length) issues.push(['pageerror', errs[0]]);
        if (issues.length && SHOTS) fs.writeFileSync(path.join(SHOTS, tag.replace(/[^a-z0-9]+/gi, '_') + '.png'), png);
      } catch (e) { issues.push(['setup', 'screen could not be reached: ' + String(e.message).split('\n')[0].slice(0, 120)]); }
      await ctx.close(); screens++;
      const seen = new Set(); issues = issues.filter(i => { const k = i[0] + i[1]; if (seen.has(k)) return false; seen.add(k); return true; });
      for (const i of issues) all.push({ vp: `${W}x${H}`, screen: name, kind: i[0], msg: i[1] });
      if (!process.env.JSON) console.log(`${issues.length ? 'FAIL' : 'ok  '} ${tag}${issues.length ? ' (' + issues.length + ')' : ''}`);
      if (!process.env.JSON) for (const i of issues.slice(0, +process.env.MAXPER || 12)) console.log(`      ${i[0]}: ${i[1]}`);
    };
    for (const [name, setup, mode] of SCREENS) {
      if (ONLY && !ONLY.some(o => name.startsWith(o))) continue;
      if (name === 'garage-tabs') { for (const tab of ['ships', 'crew', 'looks', 'load', 'mkt', 'soon']) { if (ONLY && !ONLY.some(o => 'garage-tabs'.startsWith(o) || ('garage-' + tab).startsWith(o))) continue;
          await run('garage-' + tab, async p => { await p.click('#gaBtn'); await sleep(400); const b = await p.$(`#garage .tabs button[data-t="${tab}"]`); if (!b) throw new Error('no garage tab ' + tab); await b.click(); await sleep(500); }); } continue; }
      await run(name, setup, mode);
    }
  }
  await br.close(); srv.kill();
  const by = {}; for (const f of all) by[f.kind] = (by[f.kind] || 0) + 1;
  if (process.env.JSON) console.log(JSON.stringify({ screens, findings: all }, null, 1)); else { console.log(`\n${screens} screens, ${all.length} findings`, by); }
  process.exit(all.length ? 1 : 0);
})();
