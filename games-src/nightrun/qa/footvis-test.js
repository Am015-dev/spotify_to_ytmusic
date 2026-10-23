#!/usr/bin/env node
// FOOTVIS: the on-foot characters are solid and visible (owner 23 Oct 2026: "the on foot sprites are invisible", "all enemies are transparent"). PASS/FAIL lines only.
//   a  every FOOT.q.draw call of Kai and of each foe that is drawn: its strongest drawImage has globalAlpha 1.00 (a lower alpha in the same call is the frame blend).
//      Not checked: pose 'die' (the death fade, art.js) and a foe with no sheet (the flat box, no drawImage: shown as PASS, b still applies)
//   b  the box around the feet (2.4 h wide, 3 h tall above the feet) changes by > 30 in RGB for >= 500 px in the median call, for Kai and each foe
//   c  stale strips: fresh context, serviceWorkers blocked, the old strips of commit 58585ec51 answer media/anim/*-strip.webp requests WITHOUT '?r='
//      (requests with '?r=' go through): __mnr.ART.stale > 0 and a + b still pass
//   four runs: phone 390x763 and PC 1440x860, each fresh and stale. Play is SECS (3) of real time after FOOT.start('zeil') with every foe the stage defines spawned.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/qa/footvis-test.js     env: GAME_DIR (default: a fresh build of parts/), SECS=3
const path = require('path'), fs = require('fs'), os = require('os'), cp = require('child_process');
const NR = path.resolve(__dirname, '..'), ROOT = path.resolve(NR, '../..'), OLD_REF = '58585ec51', SECS = +process.env.SECS || 3, MIN_PX = 500;
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'footvis-'));
// one fresh build, as qa.sh does, unless GAME_DIR is given; the old strips come out of git into TMP
if (!process.env.GAME_DIR) {
  const G = path.join(ROOT, 'games/mainhattan-nightrun'), B = path.join(TMP, 'game');
  fs.mkdirSync(B);
  cp.execFileSync('python3', [path.join(NR, 'parts/build.py')], { env: { ...process.env, NR_OUT: path.join(B, 'index.html') }, stdio: 'ignore' });
  for (const d of ['media', 'music', 'icons']) fs.symlinkSync(path.join(G, d), path.join(B, d));
  for (const f of ['manifest.webmanifest', 'sw.js', 'offline.json']) fs.copyFileSync(path.join(G, f), path.join(B, f));
  process.env.GAME_DIR = B;
}
cp.execSync(`git archive ${OLD_REF} games/mainhattan-nightrun/media/anim | tar -x -C "${TMP}"`, { cwd: ROOT, stdio: 'ignore', shell: '/bin/bash' });
const OLD_ANIM = path.join(TMP, 'games/mainhattan-nightrun/media/anim');
const { boot, sleep, ok, done, UA } = require('./lib.js');

// a fresh page at W x H; stale = old strips for requests without '?r=' and no service worker
async function openCase(b, { W, H, touch, stale }) {
  const ctx = await b.br.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, hasTouch: touch, isMobile: touch, userAgent: touch ? UA : undefined, serviceWorkers: stale ? 'block' : 'allow' });
  await ctx.addInitScript(() => { if (!sessionStorage.getItem('__qa')) { sessionStorage.setItem('__qa', '1'); try { localStorage.setItem('mnr_tipdone', 'true'); localStorage.setItem('mnr_fscard', '99'); localStorage.setItem('mnr_story', JSON.stringify({ stars: { 1: 3, 2: 3, 3: 2 }, snap: {}, all: false, v30: 1, v40: 1 })); localStorage.setItem('mnr_tut', '2'); } catch (e) { } } });
  const p = await ctx.newPage(); p.errs = []; p.on('pageerror', e => p.errs.push(String(e.message).slice(0, 200)));
  await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  if (stale) await p.route(/\/media\/anim\/.*-strip\.webp/, async r => {
    const u = new URL(r.request().url()), rel = decodeURIComponent(u.pathname.split('/media/anim/')[1] || ''), f = path.join(OLD_ANIM, rel);
    if (u.searchParams.has('r') || !fs.existsSync(f)) return r.continue();
    return r.fulfill({ path: f, contentType: 'image/webp' });
  });
  await p.goto(b.base + '?nomusic=1', { waitUntil: 'domcontentloaded' });
  await p.waitForFunction(() => window.__mnr, null, { timeout: 15000 });
  await p.waitForFunction(() => document.documentElement.classList.contains('rdy'), null, { timeout: 15000 }).catch(() => { });
  await sleep(500); return p;
}

// the street start of loadgate.js: More -> Foot -> close the tale cards -> FOOT.start('zeil')
async function startStreet(p) {
  await p.evaluate(() => document.getElementById('moreBtn').click()); await sleep(300);
  await p.evaluate(() => document.getElementById('footBtn').click()); await sleep(300);
  for (let i = 0; i < 6; i++) { await p.evaluate(() => { const c = document.getElementById('taleCard'); if (c && !c.hidden) (document.getElementById('taleTc') || c).click(); }); await sleep(250); }
  await p.evaluate(() => { FOOT.stop && FOOT.stop(); FOOT.start('zeil'); });
  await sleep(2500);   // Kai's sheets decode (loadgate: Kai drawn within 3.5 s); the stale reloads finish in the same time
}

// wraps FOOT.q.draw once: per call, the strongest drawImage alpha and the pixels that changed in the box around the feet
const INSTALL = () => {
  if (window.__fv) return;
  const Q = FOOT.q, P = CanvasRenderingContext2D.prototype, di = P.drawImage, od = Q.draw;
  window.__fv = { on: false, cur: null, rec: [] };
  P.drawImage = function () { const c = window.__fv.cur; if (c) { c.n++; if (this.globalAlpha > c.a) c.a = this.globalAlpha; } return di.apply(this, arguments); };
  Q.draw = function (ctx, who, pose, x, y, h, flip, t) {
    const F = window.__fv;
    if (!F.on) return od.apply(this, arguments);
    const m = ctx.getTransform(), W = ctx.canvas.width, H = ctx.canvas.height;
    const xs = [], ys = [];
    for (const [X, Y] of [[x - 1.2 * h, y - 3 * h], [x + 1.2 * h, y - 3 * h], [x - 1.2 * h, y], [x + 1.2 * h, y]]) { xs.push(m.a * X + m.c * Y + m.e); ys.push(m.b * X + m.d * Y + m.f); }
    const bx = Math.max(0, Math.floor(Math.min(...xs))), by = Math.max(0, Math.floor(Math.min(...ys)));
    const bw = Math.min(W, Math.ceil(Math.max(...xs))) - bx, bh = Math.min(H, Math.ceil(Math.max(...ys))) - by;
    const fe = window.__mnr && __mnr.ART && __mnr.ART.fE, r = { who: fe && fe.id === 'guard' ? 'guard' : who, pose, n: 0, a: 0, px: 0 };   // W171: the street guard draws the shield sheet; checked on its own line
    const before = bw > 0 && bh > 0 ? ctx.getImageData(bx, by, bw, bh).data : null;
    F.cur = r; try { od.apply(this, arguments); } finally { F.cur = null; }
    if (before) {
      const after = ctx.getImageData(bx, by, bw, bh).data;
      for (let i = 0; i < before.length; i += 4) if (Math.abs(after[i] - before[i]) > 30 || Math.abs(after[i + 1] - before[i + 1]) > 30 || Math.abs(after[i + 2] - before[i + 2]) > 30) r.px++;
    }
    F.rec.push(r);
  };
};

// 3 s of play with every foe the stage defines spawned at once (FOOT.env.spawn: the same path the stage uses)
async function measure(p) {
  await p.evaluate(INSTALL);
  // one foe type at a time, alone, 150 units into the view (the phone view is ~330 units wide: spawning all at once put every 4th foe off screen or on top of another)
  const ids = await p.evaluate(() => { window.__fv.rec = []; window.__fv.on = true; return Object.keys(window.FOOT_ENEMIES || {}); });
  for (const id of ids) {
    await p.evaluate(id => { const S = FOOT.S; S.E.length = 0; const e = FOOT.env.spawn(id, S.camX + 150, null); if (e) e._sd = 1; }, id);   // emptied at once (flagged foes stayed in S.E, so env.spawn's 16-foe cap refused the last ids); _sd: street2 would move a foe born near Kai off screen
    await sleep(Math.max(500, SECS * 1000 / ids.length));
  }
  return p.evaluate(() => {
    window.__fv.on = false; const by = {};
    for (const r of window.__fv.rec) (by[r.who] = by[r.who] || []).push({ n: r.n, a: r.a, px: r.px, die: r.pose === 'die' });
    return { by, stale: (__mnr.ART && __mnr.ART.stale) || 0 };
  });
}

function verdict(res, tag, stale) {
  const kai = res.by.kai || [], foes = Object.keys(res.by).filter(w => w !== 'kai');
  const check = (who, calls) => {
    const px = calls.map(c => c.px).sort((x, y) => x - y), med = px[px.length >> 1] || 0;
    const sheet = calls.filter(c => c.n > 0 && !c.die), minA = Math.min(...sheet.map(c => c.a));
    if (who === 'kai' || sheet.length) ok(`${tag} ${who}: ${sheet.length} sheet draw calls (${calls.filter(c => c.die).length} death fades not checked), strongest drawImage alpha ${minA.toFixed(2)} or more in every call`, sheet.length > 0 && sheet.every(c => c.a >= 0.999), `min alpha ${minA.toFixed(2)}`);
    else ok(`${tag} ${who}: no sheet, flat box (${calls.length} calls, alpha not applicable)`, true);
    ok(`${tag} ${who}: median ${med} px change by > 30 (limit ${MIN_PX})`, calls.length > 0 && med >= MIN_PX, `median ${med}`);
  };
  check('kai', kai);
  ok(`${tag} foes drawn: ${foes.length}`, foes.length > 0);
  for (const w of foes) check('foe ' + w, res.by[w]);
  if (stale) ok(`${tag} stale strips: ${res.stale} old strips replaced by '?r=' reloads (ART.stale > 0)`, res.stale > 0);
}

(async () => {
  const b = await boot();
  try {
    for (const c of [
      { tag: 'phone 390x763', W: 390, H: 763, touch: true, stale: false },
      { tag: 'pc 1440x860', W: 1440, H: 860, touch: false, stale: false },
      { tag: 'phone stale', W: 390, H: 763, touch: true, stale: true },
      { tag: 'pc stale', W: 1440, H: 860, touch: false, stale: true },
    ]) {
      const p = await openCase(b, c);
      try {
        await startStreet(p);
        verdict(await measure(p), c.tag, c.stale);
        ok(`${c.tag}: no page errors`, !p.errs.length, p.errs.join(' | '));
      } finally { await p.context().close(); }
    }
  } finally { await b.close(); fs.rmSync(TMP, { recursive: true, force: true }); }
  done('footvis');
})();
