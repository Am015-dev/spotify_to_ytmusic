// Records a video of the LIVE site (what the owner sees) at 402x874 touch, following buttons and glowing targets.
// usage: NODE_PATH=$(npm root -g) node games-src/scripts/live-record.js <slug> [<slug> ...]   (env OUT=dir, STEPS=n, BASE=url)
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const BASE = process.env.BASE || 'https://am015-dev.github.io/spotify_to_ytmusic';
const OUT = process.env.OUT || path.join(__dirname, '..', '..', 'games', 'proof', 'live');
const STEPS = +(process.env.STEPS || 30);
const stamp = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, '');
const BTN = /^(Next|Continue|Got it|OK|Okay|Start|Play|Quick game|Learn|New here|New game|Easy|Begin|Done)/i;
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const exe = fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined;
  const b = await chromium.launch(exe ? { executablePath: exe } : {});
  for (const slug of process.argv.slice(2)) {
    const tmp = fs.mkdtempSync('/tmp/lr-');
    const c = await b.newContext({ viewport: { width: 402, height: 874 }, hasTouch: true, isMobile: true, serviceWorkers: 'block', recordVideo: { dir: tmp, size: { width: 402, height: 874 } } });
    const p = await c.newPage(); const errs = [];
    p.on('pageerror', e => errs.push(String(e).slice(0, 100)));
    await p.goto(`${BASE}/${slug}/?v=${Date.now()}`); await p.waitForTimeout(2500);
    let taps = 0;
    for (let i = 0; i < STEPS; i++) {
      const done = await p.evaluate(re => {
        const vis = e => e && e.offsetParent && e.getBoundingClientRect().width > 8;
        const R = new RegExp(re, 'i');
        const bs = [...document.querySelectorAll('button,[role=button],a.btn')].filter(vis);
        const hit = bs.find(e => R.test((e.innerText || '').trim()));
        const glow = [...document.querySelectorAll('[class*=glow],[class*=hl],[class*=spot],[class*=target],[class*=pulse]')].filter(e => vis(e) && e.getBoundingClientRect().width < 360).sort((a, b) => a.getBoundingClientRect().width - b.getBoundingClientRect().width)[0];
        const t = hit || glow; if (!t) return null;
        const r = t.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
      }, BTN.source);
      if (done) { await p.touchscreen.tap(done.x, done.y); taps++; }
      await p.waitForTimeout(900);
    }
    await p.waitForTimeout(800);
    const v = p.video(); await c.close(); const src = await v.path();
    const dest = path.join(OUT, `${slug}-${stamp}.webm`); fs.copyFileSync(src, dest); fs.rmSync(tmp, { recursive: true, force: true });
    console.log(slug, 'taps', taps, 'errors', JSON.stringify(errs.slice(0, 2)), '->', path.basename(dest), (fs.statSync(dest).size / 1e6).toFixed(1) + 'MB');
  }
  await b.close();
})();
