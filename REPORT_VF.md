# VF: v82 regression fixes (BF1, BF5)

Patch: `pVF1.py` (one anchor `window.__mho={`, inserts `vf.js`). Build: `bash reapply.sh pVF1.py`.

## Root causes and fixes
- **BF1 (garage):** v82's garage module (`gbOpen` guard) refuses the builder during events, but the pause-menu GARAGE button
  closed the pause menu *before* calling `gbOpen`. The result: no overlay was open, so the world kept running (the car drove 56 m and the clock
  ran 2 s). The test's next Escape then reopened the pause menu, which is why "map closed: clock runs again" read dt 0, BF3 drove 0, and the run ended in the
  **Node crash**: the pause menu intercepted the `#rcGo` click until timeout. That crash was a game bug, not a test bug.
  Fix: a capture-phase click guard refuses the garage while the pause menu stays open. There is also a general hold: the world is
  held whenever any full-screen overlay is visible (`#gbx` incl. the brick builder, `#settings`, `#profile`, `#journal`, `#roamMap`, `#roamPause`).
- **BF5 (camera in buildings):** the BF camera push-out ran *before* the juice camera wrapper, whose lower height at speed, pull-in and kick
  then moved the eye back into buildings. City variety also rescales roof heights (`b.h*=f`), so roofs are now taller.
  Fix: a final `roamCam` pass for all cities. If the eye is inside any building collider (`roamHit`, 0.6 m pad, real height), it slides along the
  eye→car line to the first free point, or lifts above the car. The offset is removed before the next frame, so it never feeds the camera smoothing.

## Tests
- `node smoke.js .` → **SMOKE PASS** (593 s), sheet checked visually.
- `tools/tBF.js` → **9/10**. BF1 ×3 pass (moved 0, dt 0; map closed dt 1.02). BF5 **0/4314** frames inside. BF4/BF6 pass, no Node crash, no page errors.
  The only failure is the known-harmless BF3 (`in0:false`: with terrain the warp no longer lands inside the building).
- `tools/tBA.js` → **30/30**.
- `tVF.js` (new) → 3/3: the builder opened outside events holds the world (real click + held key); after closing, the car drives again.

## Gaps
- The hold list is explicit ids. A future full-screen overlay must be added to `VF_OV` in vf.js.
