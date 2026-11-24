// Plays the guided first game to its end by following the on-screen target (finger) and the coach's Next button. 402x874 touch, records a video.
// node proof/play-rules-tutorial.js [out.webm]   (needs: python3 build.py first)
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs');
const W = +process.env.W || 402, H = +process.env.H || 874; const OUT = process.argv[2] || path.join(__dirname, 'rules-402x874.webm'); const TMP = path.join(__dirname, '_vid');
(async () => {
  fs.rmSync(TMP, { recursive: true, force: true });
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: W, height: H }, hasTouch: true, isMobile: W < 700, deviceScaleFactor: 1, recordVideo: { dir: TMP, size: { width: W, height: H } } });
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto('file://' + path.join(__dirname, '..', 'onyx-atelier.html')); await pg.waitForTimeout(800);
  await pg.evaluate(() => { window.AIDELAY = 250; });
  await pg.tap('[data-t="learn"]'); await pg.waitForTimeout(600);
  const log = []; let last = '', same = 0, k = 0;
  while (k++ < 160) {
    const st = await pg.evaluate(() => { const c = document.querySelector('#coach .t'), n = document.querySelector('#coach [data-next]'), f = document.querySelector('.finger'), v = document.querySelector('#coach'); 
      return { gone: !U_ok(), say: c && v.style.visibility !== 'hidden' ? c.textContent : null, next: n ? n.getBoundingClientRect().toJSON() : null, nextTxt: n && n.textContent, f: f ? f.getBoundingClientRect().toJSON() : null, step: window.OTUT && OTUT.steps && document.querySelector('#coach') ? 1 : 0 };
      function U_ok() { return !!document.querySelector('#coach'); } });
    if (st.gone) break;
    if (st.say && st.say !== last) { log.push(st.say); last = st.say; same = 0; await pg.waitForTimeout(700); } else same++;
    if (st.say === null) { await pg.waitForTimeout(250); continue; }
    if (st.next) { await pg.touchscreen.tap(st.next.x + st.next.width / 2, st.next.y + st.next.height / 2); await pg.waitForTimeout(500); continue; }
    if (st.f) { await pg.touchscreen.tap(st.f.x + st.f.width / 2, st.f.y + st.f.height / 2); await pg.waitForTimeout(450); }
    else await pg.waitForTimeout(300);
    if (same > 25) { log.push('STUCK at: ' + last); break; }
  }
  await pg.waitForTimeout(1200);
  const end = await pg.evaluate(() => ({ coach: !!document.querySelector('#coach'), tut: !!OA_TEST.U.tut, turn: OA_TEST.U.G.turn }));
  const vp = pg.video(); await ctx.close(); await b.close(); fs.copyFileSync(await vp.path(), OUT); fs.rmSync(TMP, { recursive: true, force: true });
  console.log(log.map((l, i) => (i + 1) + '. ' + l).join('\n')); console.log('end', JSON.stringify(end), 'errors', errs.length ? errs : 'none', 'video', OUT);
  process.exit(end.coach || end.tut || errs.length || log.some(l => /^STUCK/.test(l)) ? 1 : 0);
})();
