# HANDOFF: W122 (fast smoke gate)
- smoke.sh 648 s -> 414 s (target 300 not reached). hub 217 -> 95 s, sprites 218 -> 114 s via `SMOKE=1` (hub: 390x763 only, hangar tabs ship/forge/shop; sprites: every 5th sheet decoded, 3 on-foot actors). Nightly run = leave SMOKE unset.
- Left to reach 300: fingerprint 49 s, ui-align 3 x 27 s (mostly page start + sleeps), hub 95 s, sprites 114 s (sim page d8 ~40 s, on-foot decode ~15 s).
- labfull: the repro replay spawns 400 ms after the lab starts and the bomber flies on; the test looked at one instant (flaky). Now polls up to 6 s.
- musicpack/stamp tests go through the hub (PLAY, PROFILE > Settings > More). stamp-test uses `cp -rL` (a symlinked GAME_DIR let `rm` delete the real mp3s).
- hud-cover 375x553: the "now playing" line (music title, 4 s after a song starts) took 21.2% vs 19.3% without it (flaky by timing). It is no longer drawn when innerHeight < 600 (c.js, diet.js). 4/4 runs 19.3%.
- Strip (`?strip=1`): still 21.0% and 5 band cells at 375x553 -> stays OFF. layout/ui-align not run with it.
- STILL RED, not mine: fingerprint 8/8 scenarios differ from fingerprints.json (frozen at the freeze commit; behaviour changed since, owner must approve UPDATE=1). ui-align 844x390 story-stage: canvas "1 - FIRST RUN" overlaps card text (434 px2).
