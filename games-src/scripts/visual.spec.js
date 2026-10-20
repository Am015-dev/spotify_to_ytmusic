// Visual baselines (owner, 14 Oct 2026: "yes baselines with no cost of tokens"): a MACHINE-ONLY regression gate. Images are compared by Playwright
// (toHaveScreenshot) and never opened by a model. Baselines live in games-src/.baselines/ (git-ignored here, stored on the orphan branch ui-baselines;
// see scripts/baselines.sh) and are recorded only for screens the owner approved (build-all.py --approve-visual <slug>).
// Per game: title, Menu panel (first top-bar panel), board after start. Reuses: playwright.config.js projects (phone, tablet, wide), ?scn=menu (seeded RNG,
// private storage) and GXS.menuList / menuOpenSf (shell/gx-scenario.js). A missing baseline FAILS (config updateSnapshots 'none'); never auto-recorded.
//   VIS_SLUGS=rampart-and-vine node_modules/.bin/playwright test scripts/visual.spec.js --project=phone --project=tablet --project=wide
//   add --update-snapshots to record (done by build-all.py --approve-visual only). env: GX_URL (default: local server of games/), VIS_SEED
const { test, expect } = require('@playwright/test');
const SLUGS = (process.env.VIS_SLUGS || process.env.SCN_SLUGS || '').split(',').filter(Boolean);
const BASE = (process.env.GX_URL || '').replace(/\/+$/, '');
// volatile regions painted over (timers, dice, AI-move pops, coach bubble, scenario/lab tags, score pops): masked, never compared
const MASK = ['#gxscn-tag', '#gxlab-bar', '[data-gx-skip]', '[data-volatile]', '[class*=timer i]', '[id*=timer i]', '[class*=clock i]', '[class*=dice i]', '[id*=dice i]',
  '[class*=coach i]', '[id*=coach i]', '[class*=bubble i]', '[id*=bubble i]', '[class*=toast i]', '[class*=finger i]', '[class*=ghost i]', '[class*=pop i]'].join(',');

for (const slug of SLUGS) test.describe(slug, () => {
  for (const step of ['title', 'menu', 'board']) test(step, async ({ page }, ti) => {
    test.skip(!BASE, 'GX_URL not set');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`${BASE}/${slug}/?scn=menu`, { waitUntil: 'load', timeout: 45000 });
    await page.waitForFunction(() => window.GXSCN && window.GXSCN.ready, null, { timeout: 60000 });
    await page.evaluate(() => { try { document.fonts.ready; } catch (e) { } });
    const name = await page.evaluate(step => {   // open the surface (the list is rebuilt from the live page on every call)
      const l = GXS.menuList(); let sf = step === 'title' ? l[0] : step === 'board' ? l.find(x => x.board) : l.find(x => /^panel /.test(x.name));
      return sf ? GXS.menuOpenSf(sf) : null;
    }, step);
    test.skip(!name, `${slug} has no "${step}" surface`);
    await page.waitForTimeout(step === 'board' ? 3000 : 1000);
    await expect(page).toHaveScreenshot(`${slug}/${step}.png`, { animations: 'disabled', caret: 'hide', maxDiffPixelRatio: 0.01, mask: [page.locator(MASK)], maskColor: '#ff00ff', timeout: 15000 });
  });
});
