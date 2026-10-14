// One Playwright test per game scenario (`?scn=<id>`, shell/gx-scenario.js); the check protocol lives in scn-run.js (shared with scenario-mutate.js).
// Config: ../playwright.config.js (projects phone | phone-s | pc). Env: SCN_SLUGS (games), SCN_LIST (set by the config), SCN_NOINV=1 (own checks only).
const { test, expect } = require('@playwright/test');
const { checkScenario } = require('./scn-run.js');
const list = JSON.parse(process.env.SCN_LIST || '{}'), BASE = process.env.GX_URL.replace(/\/+$/, '');

for (const [slug, scns] of Object.entries(list)) test.describe(slug, () => {
  if (!scns.length) test('no scenarios registered', () => { expect(scns.length, 'every game needs at least a board scenario and a zoom scenario').toBeGreaterThan(0); });
  for (const sc of scns) test(sc.id, async ({ page }, ti) => {
    const phone = !!ti.project.use.isMobile;
    test.skip((sc.sizes === 'phone' && !phone) || (sc.sizes === 'pc' && phone), 'scenario is not for this size');
    const { fails } = await checkScenario(page, BASE, slug, sc.id, phone);
    expect(fails, fails.slice(0, 3).join(' | ')).toEqual([]);
  });
});
