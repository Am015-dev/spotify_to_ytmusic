// baseline-shots.js: the visual.spec.js screens (title, Menu panel, board after start) at phone / tablet / wide, saved as candidate
// baselines for the orchestrator to approve. It never touches games-src/.baselines (the approved set).
//   node baseline-shots.js [outDir=../proof/baselines-new]
const PW = require(process.env.PW || 'playwright'), path = require('path'), fs = require('fs');
const gx = require('../../scripts/gx-serve.js');
const OUT = path.resolve(process.argv[2] || path.join(__dirname, '..', 'proof', 'baselines-new'));
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1';
const PROJ = { phone: { viewport: { width: 390, height: 763 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: UA },
  tablet: { viewport: { width: 768, height: 1024 }, hasTouch: true }, wide: { viewport: { width: 1920, height: 1080 } } };
const MASK = ['#gxscn-tag', '#gxlab-bar', '[data-gx-skip]', '[data-volatile]', '[class*=timer i]', '[id*=timer i]', '[class*=clock i]', '[class*=dice i]', '[id*=dice i]',
  '[class*=coach i]', '[id*=coach i]', '[class*=bubble i]', '[id*=bubble i]', '[class*=toast i]', '[class*=finger i]', '[class*=ghost i]', '[class*=pop i]'].join(',');
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const URL = (process.env.URL || await gx.url('rampart-and-vine', { file: path.join(__dirname, 'rampart.html') })).replace(/\?.*$/, '').replace(/\/?$/, '/');
  const b = await PW.chromium.launch({ args: ['--no-sandbox'] });
  for (const [proj, use] of Object.entries(PROJ)) for (const step of ['title', 'menu', 'board']) {
    const ctx = await b.newContext({ ...use, reducedMotion: 'reduce' }), page = await ctx.newPage();
    await page.goto(URL + '?scn=menu', { waitUntil: 'load', timeout: 45000 });
    await page.waitForFunction(() => window.GXSCN && window.GXSCN.ready, null, { timeout: 60000 });
    const name = await page.evaluate(step => { const l = GXS.menuList(); const sf = step === 'title' ? l[0] : step === 'board' ? l.find(x => x.board) : l.find(x => /^panel /.test(x.name)); return sf ? GXS.menuOpenSf(sf) : null; }, step);
    await page.waitForTimeout(step === 'board' ? 3000 : 1000);
    const f = path.join(OUT, `${proj}-${step}.png`);
    if (name) await page.screenshot({ path: f, animations: 'disabled', caret: 'hide', mask: [page.locator(MASK)], maskColor: '#ff00ff' });
    console.log(proj, step, name ? path.relative(process.cwd(), f) : '(no surface)');
    await ctx.close();
  }
  await b.close();
})();
