// Look check, axe part: text contrast, tap-target size and unlabeled buttons on every scenario page (the game screens the owner is asked about), with axe-core
// (the standard tool; replaces the hand-rolled pixel contrast / tap-size / no-label checks of look-check.js). Writes the SEVERE findings of each scenario to
// $LOOK_OUT/<slug>/<scn-id>.json ([[rule, selector, text], ...]); build-all.py compares the staged set with the live game's set and blocks only on new ones.
// Severe = what look-check.js called severe: contrast < 2:1, a tap target under 24 px (axe's own limit), a button with no name. Anything else is ignored here.
const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;
const fs = require('fs'), path = require('path');
const list = JSON.parse(process.env.SCN_LIST || '{}'), BASE = process.env.GX_URL.replace(/\/+$/, '');
const OUT = path.resolve(process.env.LOOK_OUT || '.staging/.look-axe');

for (const [slug, scns] of Object.entries(list)) test.describe(slug, () => {
  for (const sc of scns) test(sc.id, async ({ page }, ti) => {
    const phone = !!ti.project.use.isMobile;
    test.skip((sc.sizes === 'phone' && !phone) || (sc.sizes === 'pc' && phone), 'scenario is not for this size');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`${BASE}/${slug}/?scn=${encodeURIComponent(sc.id)}`, { waitUntil: 'load', timeout: 45000 });
    await page.waitForFunction(() => window.GXSCN && window.GXSCN.ready, null, { timeout: 30000 });
    await page.waitForTimeout(800);   // let animations land
    const res = await new AxeBuilder({ page }).withRules(['color-contrast', 'target-size', 'button-name', 'input-button-name']).analyze();
    const severe = [];
    for (const v of res.violations) for (const n of v.nodes) {
      const sel = String(n.target[0]).slice(0, 80), text = (n.html.replace(/<[^>]*>/g, '') || '').trim().slice(0, 24);
      const ratio = v.id === 'color-contrast' && n.any[0] && n.any[0].data ? n.any[0].data.contrastRatio : null;
      if (v.id === 'color-contrast' && !(ratio < 2)) continue;   // 2..4.5 is a warning in our scale: not a gate
      severe.push([v.id, sel, text]);
    }
    fs.mkdirSync(path.join(OUT, slug), { recursive: true });
    fs.writeFileSync(path.join(OUT, slug, `${sc.id}-${ti.project.name}.json`), JSON.stringify(severe));
    expect(severe, 'axe: ' + severe.slice(0, 3).map(s => s.join(' ')).join(' | ')).toEqual([]);
  });
});
