# Release check, branch nr/W282-rc (from nr/W281-boss-hp), 30 Oct 2026. Not deployed.
Logs and shots (not committed): `/tmp/claude-0/-home-user-spotify-to-ytmusic/a3f01345-05bc-5980-86c5-93f31a03fca5/scratchpad/` (street/dodger*, street/bad, chk/*.txt, shots/, shots/flight, shots/flight12).
One browser at a time, all on this one machine, 60 min limit: **seed counts are far below the 8 asked for**; every shortfall is in the table.
## Recommendation: DO NOT SHIP
Flight stage 1 (the first thing the focus-mode player plays) was cleared by 0 of 16 real-input runs here (W273 measured 11 of 18 with the same bots); the street boss is cleared 1/3 on phone and 2/3 on PC by the dodger bot. Boss head clearance on phone is still unmeasured. Not shippable until the flight result is explained (regression or harness drift).
## Checks
| # | Check | Result | Number |
|---|---|---|---|
| 1 | Street full stage from title, dodger, TS 2, phone touch 390x763 | NOT RUN to 8 | 3 seeds: CLEARED 1/3 (s0 341 s, 14 hits); died s1 276 s boss 32 hp left (13 hits), s2 237 s boss 149 left (11 hits). Boss reached 3/3 at 144 s. Hearts lost to bigheavy shots 6/5/4 |
| 2 | Same, PC keyboard+mouse 1440x860 | NOT RUN to 8 | 3 seeds: CLEARED 2/3 (226 s, 225 s); s0 died 118 s before the boss (3 gunner + 5 rusher hits) |
| 3 | Phone vs PC cause | NOT FOUND | 1/3 vs 2/3 is inside noise at n=3. Only difference seen: phone takes more boss-shot hits (6/5/4 vs 2/4). No change made, no gate run for one |
| 4 | Street idle / random / masher must die | PASS, 1 seed each (not 3) | phone died 97 / 114 / 64 s; PC died 20 / 65 / 120 s; 0 clears (TS 4) |
| 5 | Flight stage 1 dodger+shooter, qa/gauntlet-flight.js, defaults, 3 seeds/device | **FAIL** | 0 boss kills in 12 runs, boss seen 0, 4 lives lost in 9; 0 errors |
| 6 | Same with W273 settings (STEPS=12 WALL=420), 4 seeds/device | **FAIL** | 0 clears in 16 runs, boss seen 5 (phone 1, PC 3 dodger/shooter), 0 page errors, 0 rejections. 4 phone/PC runs ended early with the harness "stuck 20 s, score 0, 0 enemies" flag (t=20-21): not explained, may be a harness artefact |
| 7 | HUD under result screen (defect b) | PASS (fixed) | streetlook.js slHud draws nothing when S.end is set; bossbar-layout-test asserts 0 HUD boxes with the result up at 3 sizes. Same check fails on W281 (4 boxes) |
| 8 | Boss head >= 8 px below name bar (defect a) | NOT FIXED | the new measurement printed -71 px phone / -108 px landscape / -21 px PC, but the 1440 shot shows the head ~70 px below the bar, so the measurement counts an effect image: left as INFO in the test. Phone shot (W282 pc/phone dodger boss.jpg) shows ~5-10 px by eye |
| 9 | flake8 E9,F63,F7,F82 | PASS | 0 |
| 10 | build | PASS | build.py rc 0 |
| 11 | qa/flow-test.js | PASS | 61 pass, 0 fail |
| 12 | qa/gauntlet-shell.js | PASS | 399 pass, 0 fail |
| 13 | qa/claims-check.js | PASS | 17 pass |
| 14 | qa/bossbar-layout-test.js | PASS (boss bar / overlap / result HUD), head clearance INFO | 6 of 6 asserted lines PASS; NUDGE test moves the head reading by 20 px |
| 15 | focus-test | PASS | 15 pass |
| 16 | preload-test | PASS | 15 pass |
| 17 | streetsong 3 of 3 | PASS | RUNS=3, 6 pass |
| 18 | streetdraw | PASS | 3 pass |
| 19 | footvis | NOT RUN | needs git history (ref 58585ec51) that this shallow clone lacks; fetch failed |
| 20 | streetsim RUNS=40 x3 (4321 / 9001 / 17003) | PASS (balance gates) | gfirst 73/78/78, dodge 68/70/65, nearest 40/40/33, idle 0/40 (19.6 s). Still FAIL as on W280: threat peak (62%), cover >= 3 (0.3); block 17003 also D3 depth spread and real-time equality |
| 21 | smoke.sh | NOT RUN | no time left; its fingerprint-test would also need the missing git ref. flow, shell and ui checks above were run individually |
| 22 | Page loads 0 errors 390x763 touch, 844x390, 1440x860 | PASS | 0 page errors in bossbar-layout-test (3 sizes), flow, shell, focus runs; flight and street gauntlets 0 errors |
| 23 | Shots at 3 sizes of title, flight 10 s, flight boss, street 10 s, boss, pause, results | PARTLY | looked at: phone street boss, phone street clear result, PC street boss, phone result after the fix, phone flight 10 s, phone flight death screen. Not taken: 844x390 and 1440x860 for most screens, pause, flight boss, title |
## Looked at, ranked by what a new player sees first
1. Flight stage 1: the ship dies four times in a row to the bots, and the death screen text is dense (STAGE FAILED, 8 lines, then 2 buttons and a feedback row) over a dimmed game.
2. Street boss on phone: boss name bar and HUD stack take the top ~150 px; the boss head sits right under the bar (about 5-10 px), cramped.
3. Phone street result: the HUD no longer shows through (fixed); the pause button still shows above the overlay; the achievement toast overlaps the controls.
4. 1440x860 street: fine, boss head clear; the OVERDRIVE label sits next to the hearts panel and reads small.
## Known issues (severity for a player)
- Flight stage 1 not cleared by bots here (high: the main game).
- Street boss clear rate phone 1/3 and PC 2/3 with the dodger; the state-aware bot never clears (bot problem, W281) (medium).
- Phone boss head close to the name bar (low to medium).
- Pause button above the result overlay (low).
- Seeds far below target for every row; nothing here is a clear rate with an interval.
