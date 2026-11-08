# H3 status: thornbound
Date: 2026-11-08 · Viewport for live check: 390x844 · Nothing deployed, no code changed.

1. logic-test: **NOT RUN** — no `logic-test.js` in `games-src/thornbound/game/` (its tests are `sweep.js`, `rules-test.js`, etc.; not run here).
2. build-all `--quick thornbound`: **FAIL** — BUILT, then scenarios: none ran. Cause: pinned Playwright 1.56.1 wants chromium_headless_shell-1194; environment has 1243.
3. asset-usage (`--no-write`): **FAIL** — 0/83 requests (0%), gate 90%; glb 0/4. qa-bot could not launch Chromium, so no requests were logged.
4. Live page https://am015-dev.github.io/spotify_to_ytmusic/thornbound/ at 390x844: **PASS** — HTTP 200, 0 console errors, 0 failed requests.
