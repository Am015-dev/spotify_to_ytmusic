# Release check, branch nr/W286-final (from nr/W285-deployable), 30 Oct 2026. Not deployed.
Logs and shots (not committed): /tmp/claude-0/-home-user-spotify-to-ytmusic/6c9bd49e-2dc3-5841-95e9-cfd53638cb70/scratchpad/ (chk/ = unit gates, g/ = smoke, flight and street runs, b0 b1 b2 b3 = boss bar shots before/after).
## Verdict: DO NOT SHIP
Reason: every automated gate passes except the two that also fail on the live branch (fingerprint 8 of 8, sprites 2 of 38), but the phone is weak: street full stage dodger cleared 0 of 4 on the phone (PC 3 of 4), flight phone dodger cleared 1 of 8 (shooter 5 of 8). Neither is worse than the earlier controls within noise, yet a phone player is unlikely to finish the street boss. Also NOT TAKEN: shots of title, pause and both result screens at 844x390, title and pause at the other sizes (see HANDOFF-W286.md).
## Boss head fix (W286)
Replaced the 40 % shrink: the name bar is one thin bar with the name on it (18 units, was name line + bar 30); on short wide screens (844x390) it sits in the free top row between the hearts panel and the score; on the phone it sits right under the panel with the hint line BELOW it; the boss is drawn at full size unless needed, never below 88 % (was 45 %); hitboxes unchanged. bossbar-layout-test: head clearance min 18.0 px phone, 43.8 px 844x390, 73.3 px PC (>= 8 asserted); NUDGE=1 FAILS (-2.5 px phone), OVERLAP=1 FAILS (4 lines). Shots looked at before/after at 390x763, 844x390, 1440x860: boss full size, head clear, wind-up glow and charge crouch readable.
## Checks
| # | Check | Result | Number |
|---|---|---|---|
| 1 | flake8 E9,F63,F7,F82 | PASS | 0 |
| 2 | build | PASS | rc 0 |
| 3 | flow-test | PASS | rc 0 (61 pass in W285) |
| 4 | gauntlet-shell | PASS | rc 0, 168 s |
| 5 | claims-check | PASS | rc 0 |
| 6 | bossbar-layout-test | PASS | 3 sizes, head clearance 18.0 / 43.8 / 73.3 px; NUDGE and OVERLAP fail as they must |
| 7 | focus-test | PASS | rc 0 |
| 8 | preload-test | PASS | 0 failed |
| 9 | streetsong RUNS=3 | PASS | rc 0 |
| 10 | streetdraw | PASS | rc 0 |
| 11 | footvis | PASS | 0 failed |
| 12 | smoke.sh: hud-cover, ui-align x3, hub, story, flow, labfull | PASS | all pass (ran while the flight and street runs used the CPU) |
| 13 | smoke.sh fingerprint | PRE-EXISTING FAIL | 8 of 8 scenarios differ from stored hashes (same on live); not regenerated |
| 14 | smoke.sh sprites | PRE-EXISTING FAIL | 2 of 38 (hoplite boss arrives; fx sheets not drawn): same on live |
| 15 | streetsim RUNS=40 seeds 4321 / 9001 / 17003 | PASS (gates) | gfirst 73 / 78 / 78 %, dodge 68 / 70 / 65 %, idle 0 % (died 19.6 s), nearest 40 / 40 / 33 %. Still FAIL as on W280: threat peak (62 %), cover >= 3 (0.3), D3 depth spread on 2 of 3 blocks (28 / 30 / 29 %). Stand-still of non-attacking foes 11.4-12.3 %. No numbers moved vs W285 |
| 16 | Page errors at 390x763 touch, 844x390, 1440x860 | PASS | 0 in bossbar-layout-test, focus, flow, shell, footvis and both gauntlets |
| 17 | Flight stage 1, PC dodger, 8 seeds, fixed harness | PASS | 8 of 8 cleared the stage (boss killed 8/8), 0 errors; gate 60 % |
| 18 | Flight stage 1, phone dodger, 8 seeds (W305, harness fixed) | PASS | boss killed 8 of 8; 5 of 8 with 0 game overs (62 %), 7 of 8 with at most 1; gate 40 %. The old 1 of 8 was the harness lifting the steering finger on every dash tap (HANDOFF-W305.md) |
| 19 | Flight stage 1, phone shooter, 8 seeds (W305, harness fixed) | PASS | boss killed 8 of 8; 7 of 8 with 0 game overs (88 %), s3 needed 2 retries; gate 60 % |
| 20 | Street full stage dodger, phone 390x763, 4 seeds | WEAK | 0 of 4 cleared (died 122 / 105 / 231 / 216 s; boss reached in 2, boss hp left 138 / 179) |
| 21 | Street full stage dodger, PC 1440x860, 4 seeds | PASS | 3 of 4 cleared (257 / 249 / 244 s), 1 died before the boss (137 s) |
| 22 | Street idle and random must die, 1 seed per device | PASS | idle died 107 s phone / 22 s PC; random 96 s phone / 49 s PC; 0 clears |
| 23 | Street masher | NOT RUN | the harness has no masher strategy (idle, random, aggressor, dodger only) |
| 24 | Shots: street boss phone, street result PC, flight boss phone and PC | LOOKED AT | see HANDOFF-W286.md |
| 25 | Shots: title, pause, flight 10 s, results at 844x390 | NOT TAKEN | out of time |
## Known issues (severity for a player)
- Phone street boss is hard to beat (0 of 4 for the bot): HIGH.
- Phone flight dodger-style play rarely clears stage 1 (1 of 8): was a harness bug, CLOSED by W305 (rows 18/19).
- Fingerprint hashes stale and sprite smoke fails (pre-existing, not player-visible): LOW.
- Streetsim: depth spread (28-30 %) and cover-hit count below gate: LOW.
- Boss hint line on the phone sits over the boss body for its few seconds on screen: LOW.
