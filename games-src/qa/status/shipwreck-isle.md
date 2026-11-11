# H3 status: shipwreck-isle
Date: 2026-11-08 · Viewport for live check: 390x844 · Nothing deployed, no code changed.

1. logic-test (`node games-src/rc/logic-test.js`): **FAIL** — 273 pass, 1 fail of 274 (3 rules not testable headless). Failing rule: `A16: expected no Soldier among 2 castaways even when asked for, got true`.
2. build-all `--quick shipwreck-isle`: **FAIL** — BUILT, then scenarios: none ran. Cause: pinned Playwright 1.56.1 wants chromium_headless_shell-1194; environment has 1243.
3. asset-usage (`--no-write`): **FAIL** — 0/127 requests (0%), gate 90%; glb 0/22. qa-bot could not launch Chromium (same browser error), so no requests were logged.
4. Live page https://am015-dev.github.io/spotify_to_ytmusic/shipwreck-isle/ at 390x844: **PASS** — HTTP 200, 0 console errors, 0 failed requests.
