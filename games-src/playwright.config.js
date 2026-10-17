// Standard Playwright Test config for the ?scn= scenario tests (scripts/scenarios.spec.js) and the axe look check (scripts/look.spec.js).
//   node_modules/.bin/playwright test [--project phone|phone-s|pc] [--grep <scn-id>]      env: SCN_SLUGS=a,b (games), GX_URL (build-all sets it), JOBS (workers)
// "phone" (390x763) is the fast gate; "phone-s" (375x553), "tablet" (768x1024), "pc" (1366x768), "wide" (1920x1080) run with --full or --project (build-all passes --project accordingly).
const { defineConfig } = require('@playwright/test');
const { execFileSync } = require('child_process');
const path = require('path');
const slugs = (process.env.SCN_SLUGS || '').split(',').filter(Boolean);
const PORT = +process.env.GX_PORT || 4173, external = !!process.env.GX_URL;
if (!external) process.env.GX_URL = `http://127.0.0.1:${PORT}`;   // the webServer below starts it; build-all.py passes its own
if (slugs.length && !process.env.SCN_LIST)   // scenario ids come from the page (?scn=list); list them once here, workers inherit the env
  process.env.SCN_LIST = execFileSync('node', [path.join(__dirname, 'scripts', 'scn-list.js'), ...slugs], { encoding: 'utf8', env: process.env });
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const phone = (w, h) => ({ viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: UA });
module.exports = defineConfig({
  testDir: 'scripts', testMatch: '*.spec.js', outputDir: '.staging/.pw-results',
  fullyParallel: true, retries: 0, workers: +process.env.JOBS || 3, reporter: [['list'], ['json', { outputFile: process.env.PW_JSON || '.staging/.pw-results.json' }]],
  timeout: 90000, expect: { timeout: 5000 },
  // visual.spec.js baselines: games-src/.baselines/<slug>/<step>-<project>.png (git-ignored; orphan branch ui-baselines via scripts/baselines.sh); a missing one fails, only --update-snapshots records
  snapshotPathTemplate: path.join(__dirname, '.baselines', '{arg}-{projectName}{ext}'), updateSnapshots: 'none',
  use: { serviceWorkers: 'block', launchOptions: { args: ['--no-sandbox', '--force-color-profile=srgb'] } },
  projects: [
    { name: 'phone', use: phone(390, 763) },
    { name: 'phone-s', use: phone(375, 553) },
    { name: 'tablet', use: { viewport: { width: 768, height: 1024 }, hasTouch: true } },
    { name: 'pc', use: { viewport: { width: 1366, height: 768 } } },
    { name: 'desk', use: { viewport: { width: 1280, height: 800 } } },
    { name: 'wide', use: { viewport: { width: 1920, height: 1080 } } },
  ],
  webServer: external ? undefined : { command: `node scripts/gx-serve.js ${process.env.GX_STAGE || '.staging'} ${PORT}`, port: PORT, reuseExistingServer: false },
});
