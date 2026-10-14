// Standard Playwright Test config for the ?scn= scenario tests (scripts/scenarios.spec.js) and the axe look check (scripts/look.spec.js).
//   node_modules/.bin/playwright test [--project phone|phone-s|pc] [--grep <scn-id>]      env: SCN_SLUGS=a,b (games), GX_URL (build-all sets it), JOBS (workers)
// "phone" (390x763) is the fast gate; "phone-s" (375x553) and "pc" (1366x768) only run with --full (build-all passes --project accordingly).
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
  use: { serviceWorkers: 'block', launchOptions: { args: ['--no-sandbox', '--force-color-profile=srgb'] } },
  projects: [
    { name: 'phone', use: phone(390, 763) },
    { name: 'phone-s', use: phone(375, 553) },
    { name: 'pc', use: { viewport: { width: 1366, height: 768 } } },
  ],
  webServer: external ? undefined : { command: `node scripts/gx-serve.js .staging ${PORT}`, port: PORT, reuseExistingServer: true },
});
