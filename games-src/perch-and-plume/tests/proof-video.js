// Proof video (F2): the first 3 minutes of a newcomer at 375x667 by real touch: title -> "New here?" tutorial (tapping the marked
// target, ~1.2 s per step, like a person reading the goal line) -> the real game (tapping the glowing Best target).
//   node tests/proof-video.js [stageDir=/tmp/x] [out=proof/first-3-min-375x667.webm] [seconds=180]
const path = require('path'), fs = require('fs');
const ROOT = path.join(__dirname, '..', '..');
const gx = require(path.join(ROOT, 'scripts', 'gx-serve.js'));
const { chromium } = require(path.join(ROOT, 'node_modules', 'playwright'));
const STAGE = process.argv[2] || '/tmp/x', OUT = path.resolve(process.argv[3] || path.join(__dirname, '..', 'proof', 'first-3-min-375x667.webm')), SEC = +(process.argv[4] || 180);
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const srv = await gx.startServer({ stage: STAGE }), base = srv.base.replace(/\/+$/, '');
  const vdir = fs.mkdtempSync('/tmp/ppvid-');
  const b = await chromium.launch(), ctx = await b.newContext({ viewport: { width: 375, height: 667 }, hasTouch: true, isMobile: true, recordVideo: { dir: vdir, size: { width: 375, height: 667 } } });
  const p = await ctx.newPage(); const t0 = Date.now(), left = () => SEC * 1000 - (Date.now() - t0);
  const tapEl = async sel => { const c = await p.evaluate(sel => { const e = [...document.querySelectorAll(sel)].find(x => x.getBoundingClientRect().width > 2); if (!e) return null; e.scrollIntoView({ block: 'nearest' }); const r = e.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + Math.min(r.height / 2, 30) }; }, sel); if (c) await p.touchscreen.tap(c.x, c.y); return !!c; };
  const tapText = async re => { const c = await p.evaluate(src => { const re = new RegExp(src, 'i'); const e = [...document.querySelectorAll('button')].find(x => x.offsetParent && re.test(x.textContent)); if (!e) return null; e.scrollIntoView({ block: 'center' }); const r = e.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }, re.source); if (c) await p.touchscreen.tap(c.x, c.y); return !!c; };
  await p.goto(base + '/perch-and-plume/'); await p.evaluate(() => localStorage.clear()); await p.goto(base + '/perch-and-plume/'); await sleep(2500);
  await tapText(/new here|learn/); await sleep(2000);
  while (left() > 0) {
    const s = await p.evaluate(() => ({ step: window.GXCOACH && GXCOACH.step, mode: UI.mode })).catch(() => null); if (!s) break;
    if (s.mode !== 'tutfree' || s.step === null) break;
    if (s.step === 'real') { await sleep(1500); await tapEl('#result #again'); await sleep(2500); break; }
    if (await p.evaluate(() => !!document.querySelector('.tutpoint'))) { await sleep(1200); await tapEl('.tutpoint'); await sleep(700); } else await sleep(400);
  }
  if (await tapText(/keep these/)) await sleep(2500);
  while (left() > 0) {
    await sleep(500);
    const st = await p.evaluate(() => ({ mine: typeof myTurn === 'function' && myTurn() && !UI.busy, pop: !$('#pop').hidden, sum: !!document.querySelector('.rvsum'), over: G && G.phase === 'over' })).catch(() => ({}));
    if (st.over) break;
    if (st.pop) { await tapEl('#pop [data-a="popx"]'); continue; }
    if (!st.mine) continue;
    await sleep(700);
    if (!(await tapEl('.glow'))) if (!(await tapEl('[data-legal]'))) if (!(await tapEl('#acts [data-a="playgo"]'))) await tapEl('#acts [data-a="mv"]');
  }
  const v = p.video(); await ctx.close(); const src = await v.path(); fs.mkdirSync(path.dirname(OUT), { recursive: true }); fs.copyFileSync(src, OUT);
  console.log('video ' + OUT + ' ' + Math.round(fs.statSync(OUT).size / 1024) + ' KB, ' + Math.round((Date.now() - t0) / 1000) + ' s');
  await b.close(); srv.close(); process.exit(0);
})();
