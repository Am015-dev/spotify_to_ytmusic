// One Playwright test per game scenario (`?scn=<id>`, shell/gx-scenario.js); the check protocol lives in scn-run.js (shared with scenario-mutate.js).
// Config: ../playwright.config.js (projects phone | phone-s | pc). Env: SCN_SLUGS (games), SCN_LIST (set by the config), SCN_NOINV=1 (own checks only).
// Look check (axe-core, replaces the hand-rolled contrast / tap-size / no-label checks of look-check.js): when LOOK_OUT is set, the settled scenario page is also
// scanned with axe and the SEVERE findings are written to $LOOK_OUT/<slug>/<scn-id>-<project>.json ([[rule, selector, text], ...]); build-all.py compares them
// with the live game's and blocks only on new ones. Severe = contrast < 2:1, a tap target under 24 px (axe's limit), a button with no name. AXE_ONLY=1 skips the checks.
const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;
const fs = require('fs'), path = require('path');
const { checkScenario } = require('./scn-run.js');
const list = JSON.parse(process.env.SCN_LIST || '{}'), BASE = process.env.GX_URL.replace(/\/+$/, '');

async function axeSevere(page) {
  const res = await new AxeBuilder({ page }).withRules(['color-contrast', 'target-size', 'button-name', 'input-button-name']).analyze(), severe = [];
  for (const v of res.violations) for (const n of v.nodes) {
    if (v.id === 'color-contrast' && !(n.any[0] && n.any[0].data && n.any[0].data.contrastRatio < 2)) continue;   // 2..4.5:1 is only a warning on our scale
    severe.push([v.id, String(n.target[0]).slice(0, 80), n.html.replace(/<[^>]*>/g, '').trim().slice(0, 24)]);
  }
  return severe;
}

for (const [slug, scns] of Object.entries(list)) test.describe(slug, () => {
  if (!scns.length) test('no scenarios registered', () => { expect(scns.length, 'every game needs at least a board scenario and a zoom scenario').toBeGreaterThan(0); });
  for (const sc of scns) test(sc.id, async ({ page }, ti) => {
    const phone = !!ti.project.use.isMobile;
    test.skip((sc.sizes === 'phone' && !phone) || (sc.sizes === 'pc' && phone), 'scenario is not for this size');
    let fails = [], inv = [];
    if (process.env.AXE_ONLY) {
      await page.goto(`${BASE}/${slug}/?scn=${encodeURIComponent(sc.id)}`, { waitUntil: 'load', timeout: 45000 });
      await page.waitForFunction(() => window.GXSCN && window.GXSCN.ready, null, { timeout: 30000 }).catch(() => { });
      await page.waitForTimeout(800);
    } else { const r = await checkScenario(page, BASE, slug, sc.id, phone); fails = r.fails; inv = r.invFails; }
    if (sc.id === 'menu' && !process.env.AXE_ONLY) {   // axe on every menu surface (tap targets >= 24 px, contrast >= 2:1, named buttons): the shared menu scenario opens them one by one
      const n = await page.evaluate(() => window.GXS.menuList().length).catch(() => 0);
      for (let i = 0; i < n; i++) {
        const nm = await page.evaluate(i => window.GXS.menuOpen(i), i); await page.waitForTimeout(600);
        for (const f of await axeSevere(page).catch(() => [])) fails.push(`[${nm}] axe ${f[0]}: ${f[1]} "${f[2]}"`);
      }
      await page.evaluate(() => window.GXS.menuOpen(0));
    }
    if (process.env.LOOK_OUT) {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      const severe = await axeSevere(page).catch(() => []);
      const dir = path.join(path.resolve(process.env.LOOK_OUT), slug); fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, `${sc.id}-${ti.project.name}.json`), JSON.stringify(severe));
    }
    if (inv.length && process.env.INV_OUT) {   // invariants (text < 11 px, clipping, ...) also flag OLD problems: written aside, build-all.py warns on them; only the scenario's own checks fail the test
      const dir = path.join(path.resolve(process.env.INV_OUT), slug); fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, `${sc.id}-${ti.project.name}.json`), JSON.stringify(inv));
    } else if (inv.length) fails.push(...inv);
    expect(fails, fails.slice(0, 3).join(' | ')).toEqual([]);
  });
});
