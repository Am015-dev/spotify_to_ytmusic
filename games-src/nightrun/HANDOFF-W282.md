# W282 release check (branch nr/W282-rc from nr/W281-boss-hp). 30 Oct 2026. Not deployed. Numbers and table: RELEASE-CHECK-2026-10-30.md. Result: DO NOT SHIP.
Logs and shots (not committed): `/tmp/claude-0/-home-user-spotify-to-ytmusic/a3f01345-05bc-5980-86c5-93f31a03fca5/scratchpad/`.
## Code
- parts/street/streetlook.js slHud: no HUD when S.end is set (result overlay up). parts/street/streetfeel.js: overdrive bar guard S.end.
- qa/bossbar-layout-test.js: asserts 0 HUD boxes under the result screen (can fail: W281 draws 4); boss head clearance measured, INFO only (unverified, reads -21 px on a screen where the shot shows ~70 px).
## Not done
Boss head fix (owner purefoot.js dE0 / boss scale); 8 seeds on any row; flight 0/16 not explained (check the "stuck 20 s, score 0" runs first); footvis, smoke; shots at 844x390.
## Next (one task, sonnet): rerun qa/gauntlet-flight.js on nr/W273 and on this branch with the same seeds and STEPS=12 to see whether the flight clear rate fell; then measure the head on opaque pixels only.
