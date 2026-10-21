# HANDOFF garagefix (21 Oct 2026) - built and tested, NOT pushed
Files (uncommitted in the worker checkout): parts/garagefix.js (new), parts/upgrades.js (tuneDraw(tb) detached box), parts/build.py (garagefix.js after hub.js), garagefix-test.js, rebuilt index.html + sw.js.
Why not pushed: guard.py (c) "new override layer re-defines gaDraw". Decide: (1) guard.py --update-baseline (orchestrator only), or (2) move the wrapper into hub.js's existing gaDraw wrapper (hub.js:129) and the CSS/helpers into hub.js.
Done: garagefix-test.js 79/79 (390x763, 375x553), ui-align 390x763 0 findings. NOT run yet: ui-align 375x553, ret-test, hub-test, classes-test, hud-cover-test.
Known gap: WEAPONS stays 1 column (a 2-col try broke the grid, reverted); PILOT/FORGE keep their own layout (header + scroll memory only).
Headless Chromium does not reproduce the old jump (scroll stayed put with ?garagefix=0 too); the in-place patch is proven by node identity (cards not rebuilt).
