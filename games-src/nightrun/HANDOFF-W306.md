# HANDOFF W306: integration pass 2 (branch nr/W306-integrate2, from nr/W303-integrate, not deployed)
Merged --no-ff: nr/W305-flight-proof (2 conflicts), nr/W304-duel3 (no conflicts). Then ONE-CLOCK #2. Build: 0 warnings from guard.py after every step.

## Conflicts (2, both in the W305 merge)
1. parts/render/calm.js `draw` (boss/rule chip): W295 (HEAD) and W305 both rewrote it. Kept BOTH: W295 text fitting (font floor 16 px for the warn chip, boss name kept when the line is too long) + W305 look (warn chip 32 high, red text #ff6070, baseline .7).
2. qa/gauntlet-flight.js (perf line): identical meaning on both sides (NOCTL skips the perf sample); kept HEAD's form.
Deleted files (lit.js, pcbright.js, bulletart.js) are not referenced by build.py or any test; only a comment in render/readable.js mentions "bulletart" (left, harmless).

## ONE-CLOCK #2 (parts/street/foot.js beatPos)
The song position is read from the wall (`bpos(performance.now())`) ONCE per run as an anchor (`S.bA`), then follows the stepped street time `S.time / spb`. Re-anchors if S.time goes backwards. streetsong-test 6/0 x3.
SIDE EFFECT (see streetsim row): before the change the sim's beat was the real wall beat (random vs S.time); now it is stepped and reproducible, so on-beat checks of the bots changed: gfirst 85 -> 98 %, dodge 68 -> 35 %. Same seeds, W304 branch and the merge WITHOUT this commit give identical numbers (85/68/43), so this commit is the only cause. NOT tuned (no tuning allowed). Owner/street worker: re-balance dodge/gfirst on the stepped beat or accept.

## Table (live = origin/alex/brave-carson-rbpmlk built in /tmp, merged = this branch; pass/fail)
| test | live | merged |
|---|---|---|
| flake8 E9,F63,F7,F82 | 0 | 0 |
| build warnings | 0 | 0 |
| flow-test | 61/0 | 91/0 |
| gauntlet-shell | 399/0 | 399/0 |
| claims-check | 17/0 | 17/0 |
| copy-test | n/a | 15/0 |
| bossbar-layout | 10/0 | 10/0 |
| focus-test | 15/0 | 13/2 (PRE-EXISTING from W303: "flight: exactly one song ever playing: stage1,stage2") |
| preload-test | 15/0 | 15/0 |
| streetsong x3 | 6/0 | 6/0 x3 |
| streetdraw | 3/0 | 3/0 |
| footvis-test | cannot run | cannot run: needs commit 58585ec51 (git archive) which this shallow clone lacks; same on live. ENV, not a game result |
| smoke.sh (TMO=120) | n/a | PASS 0 failed, 346 s (hud-cover, ui-align x3, hub 53, story 31, flow 91, gunnertele, nocaps 15; fingerprint/labfull skipped as the script says) |
| push-gate RUNS=8 | n/a (file not on live) | 4/3: FAIL "CHOOSE clear 58% >= HOLD 63%", "PUSH 48% <= CHOOSE 58% - 15" (W293 gate on stages 1-6; not re-run on W293 alone, see wrong) |
| streetsim RUNS=40 | 21/4 (gfirst 73, dodge 68, nearest 40, idle 0) | 19/6 (gfirst 98, dodge 35, nearest 38, idle 0, still-foes 12.1 % PASS) |
| gauntlet-flight phone dodger SEEDS=4 (W305 settings: NOCTL=1 PAR=2 WALL=900 STAGES=1) | n/a | boss killed 4/4, minStage 2, stuck 0, hud 0/100, 0 rej |
| gauntlet-flight phone shooter SEEDS=4 | n/a | boss killed 4/4, minStage 2, stuck 0, hud 0/101 |
| stage chain by real taps on #srNext (dodger, STAGES=3, 2 seeds) | n/a | next 3 / next 2: stage 1->2->3(->4), boss 2/2, err 0 |
| real-input starts + console errors (own script, not committed: touch tap 390x763 and 844x390, mouse click 1440x860; title, FLIGHT, ON FOOT) | | 9/9 start+0 console errors (ON FOOT needs a tap on the story card #taleTc first) |

## Wrong / pre-existing / not run
- streetsim: dodge 35 % and the old W243/cover gates FAIL on the merge; caused by ONE-CLOCK #2 (above). Also FAIL on W304 itself: best-bot 60-80 band, threat peak 82-88, cover >= 3, D3 spread, real-time equals stepped (6 of 7 listed gates are PRE-EXISTING).
- push-gate: not run on the W293 / W303 branch alone (time), so I cannot say if the 2 FAILs come from the merge or the branch. Run it on origin/nr/W303-integrate first.
- The 4 gauntlet-flight runs with the default 150 s wall cap stop at stage 1 (slow on this box); use WALL=900.
- Console 404 "script" in flight runs = sw.js missing from my /tmp build dir (harness), not the game; with sw.js copied: err 0.
- Not run: gauntlet-flight pc, 8 seeds, fingerprint, labfull, sprites, footvis (see above).
