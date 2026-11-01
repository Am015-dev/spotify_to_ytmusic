# HANDOFF W315: integration pass 3 (branch nr/W315-integrate3, base nr/W306-integrate2, not deployed)

## Done
1. Reverted W306's ONE-CLOCK #2 (street/foot.js beatPos stepped, d889a27) with `git revert`. **Rule-18 debt stays open for beatPos**: street beatPos still reads the wall song clock, the stepped sim and a real-time run differ (streetsim "one seed equals a real-time run" FAILs, as on W304). The other ONE-CLOCK fixes are untouched.
2. Merged --no-ff in order: W311-tests, W312-touch, W307-result, W310-open. Build: 0 guard.py warnings after each.

## Conflicts: none (all four merged clean; no hand resolution needed)
Overlaps checked by hand: W312 (street/foot.js, streetlook.js, streetguard.js) vs W304/W300 duel code in W306: different hunks. W310 density.js NP.T / street3.js w0 vs W306: different hunks.

## 3a NEXT STAGE (#srNext)
The game is right, no code change. Real tap/click after a REAL clear works: flow-test 91/0 clicks #srNext on phone and PC at every stage; gauntlet-flight phone (NOAUDIO=1 NOCTL=1 PAR=2 WALL=900 STAGES=3) shows no "NEXT STAGE click did not start" finding: dodger next 2/2/3/3, shooter next 3/3/3/3. W310's finding came from its branch (older base, without W305/W306 flight changes) and does not reproduce on the merge. Harness waits only 300 ms + 30 steps after the click (flow-test waits 700 ms): if it ever shows again on a slow box, raise that sleep, not the game.
## 3b phone street opening (qa/open-probe.js, 4 seeds, measured, not redesigned)
Phone 390x763: walking right, first rusher in view 2.43 s and in reach 2.43 s; idle in view 2.48 s / reach 2.48 s. PC 1440x860: view 2.38-2.48, reach 2.62-3.53. The probe cannot see "dies at the right edge before it is seen": in view = in reach on the phone (the 330 view puts the rusher in reach the moment it appears), which matches the report. Empty street 7-16 s: wave 2 comes at about 16 s (W310 note); the idle bot's hurts land at 5.5, 7.5, 9.6, 11.7, 13.8, 16.0 s (one rusher every ~2.1 s), so the street is not empty for the idle bot, but nothing new spawns for a bot that kills the first rushers. Fix idea (not done): second wave at ~9 s, needs a streetsim check.

## Table (live = values of origin/alex/brave-carson-rbpmlk from the W306 table, same live ref, not re-run; merged = this branch, built in /tmp)
| test | live | merged |
|---|---|---|
| flake8 E9,F63,F7,F82 | 0 | 0 |
| build warnings | 0 | 0 |
| flow-test | 61/0 | 91/0 |
| gauntlet-shell | 399/0 | 399/0 |
| claims-check | 17/0 | 17/0 |
| copy-test | n/a | 15/0 |
| bossbar-layout | 10/0 | 10/0 |
| focus-test | 15/0 | 15/0 (W307 fixed the 13/2) |
| preload-test | 15/0 | 15/0 |
| streetsong x3 | 6/0 | 6/0 x3 |
| streetdraw | 3/0 | 3/0 |
| footvis-test | n/a | PASS 0 failed (after unshallow) |
| foot-test (W312 control rows) | n/a | 55/10; the 10 FAILs are the stale BOT assertions W311 documents (checkpoint, boss, 2-6 min, weapons level); control rows PASS (also gauntlet-foot controls: 44 px, no overlap, on screen at 390x763, 375x553, 844x390) |
| smoke.sh whole | n/a | 1 failed of 359 s: labfull FAIL ("saves differ: mnr_svauto0 mnr_svauto mnr_svinfo"). PRE-EXISTING: same FAIL on origin/nr/W306-integrate2 and on origin/nr/W311-tests when I built and ran them. All others PASS (hud-cover, ui-align x3, hub 53, story 31, flow 91, gunnertele 2, nocaps 15) |
| streetsim RUNS=40 | gfirst 73, dodge 68, nearest 40, idle 0 | gfirst 90, dodge 73, nearest 23 (FAIL band 25-40), idle 0, still-foes 16.9 (PASS <20) |
| open-probe GATE=1 | n/a | 4/4 PASS, 0 failed (flight first foe 2.10 s, aimed shot/dive worst 5.85 s, street in view 2.43 s, in reach 2.62 s) |
| gauntlet-flight phone dodger SEEDS=4 | n/a | boss killed 4/4, minStage 3, stuck 0, err 0, hud 0/353 |
| gauntlet-flight phone shooter SEEDS=4 | n/a | boss killed 4/4, minStage 4, stuck 0, err 0, hud 0/218 |
| gauntlet-foot dodger phone 390x763 + 844x390 SEEDS=2 | n/a | 0 failed; phone cleared 1/2 (died at the boss once), land 2/2; frame p95 16.8 ms |
| real-input starts + console errors (/tmp script, not committed) | | 9/9: title, FLIGHT, ON FOOT at 390x763 touch, 844x390 touch, 1440x860 mouse; 0 page errors, 0 failed requests |
| stage chain 1->2 by real tap after a real clear | | flow-test (phone+PC) and gauntlet-flight (above) PASS |

## Streetsim (the gate that is NOT back in band): bisect
- Merge without W310 (d8d23fe): nearest 43, gfirst 85, dodge 68 = the W304 numbers, so the revert restored them.
- With W310 (wave 1 at 4 beats, NP.T 15->4): nearest 23 (band 25-40, FAIL by 2 points), gfirst 90, dodge 73 (edge of 65 +- 8).
- W310 reported nearest 28 on its own base (W303, without W304's nearest-reaction change). So it is a W310 x W304 interaction, not a merge bug. Not tuned (brief). Options for the owner: accept 23 / revert only the street3.js `w0` line (flight NP.T change is independent) / move wave 1 to ~6 beats and re-run streetsim.
- Other streetsim FAILs, PRE-EXISTING on W304 (W306 table): best-bot 60-80 band (90), threat peak 82-88 (78.6), cover >= 3 (0.3), D3 spread (26 %), real-time equals stepped (beat clock, see item 1).

## Not run
push-gate (W293, 4/3 on W306, unattributed), fingerprint, sprites, gauntlet-flight pc, 8 seeds; live column was copied from the W306 table, not rebuilt.
