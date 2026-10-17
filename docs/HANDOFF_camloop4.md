# HANDOFF camloop4 (2026-10-17), alex/integ84 + od-int2 merged
- Test hook: `window.__swapDelayFrames` (src/20_race_world.js vehMode) delays the PLAYER's car<->4x4/boat body swap by N frames; unset/0 in production. GO cam/stable sets 45 for its run (override `window.__camstDelay`), then restores.
- Judge tightened (src/99c5_camstable.js): a flip window with 2 fits more than 0.3 m apart = FAIL (trunk re-fits 0.5-1.8 m apart in every window; the fix always fits once per flip). Teleports still judged.
- Measured on the BUILT page (out/camloop4), cam/stable fra+ath: trunk camera code + delay 45 = RED both cities; fix + delay 45 = GREEN both; fix + delay 0 = GREEN both.
- Unit 0 FAIL; TAG suites: see the coordinator message / commit.
- Left: nothing for the camera; the phone root cause (why the swap lands late) was NOT searched, as ordered.
