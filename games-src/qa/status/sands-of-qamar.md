# H3 status: sands-of-qamar
Date: 2026-11-08 · Viewport for live check: 390x844 · Nothing deployed, no code changed.

1. logic-test (`node games-src/ft/logic-test.js`): **PASS** — 119 rules, 119 pass, 0 fail. (Build dir is `ft/src`; the test lives in `ft/`.)
2. build-all `--quick sands-of-qamar`: **FAIL** — BUILT, then scenarios: none ran. Cause: pinned @playwright/test 1.56.1 wants chromium_headless_shell-1194, the environment has 1243 (`browserType.launch` executable missing). Phone-check skipped by `--quick`.
3. asset-usage (`--no-write`): **FAIL** — 0/202 requests (0%), gate 90%; glb 0/10. Same browser error: qa-bot could not launch Chromium, so no requests were logged.
4. Live page https://am015-dev.github.io/spotify_to_ytmusic/sands-of-qamar/ at 390x844: **PASS** — HTTP 200, 0 console errors, 0 failed requests.
