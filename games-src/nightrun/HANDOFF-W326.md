# HANDOFF W326 (integration pass 5). Branch nr/W326-rc2, from origin/nr/W319-rc. Pushed, NOT deployed.

## Merged (--no-ff, in order)
W322-store, W321-result, W324-readable, W323-gold3, W320-checkpoint. W325 NOT merged (branch nr/W325-casual does not exist on origin).

## Conflicts
- qa/copy-test.js (W321 vs W323): both add independent checks; kept both.
- parts/street/street3.js (W318 vs W320): kept W318's boss-call condition and added W320's S.bcp snapshot line after it.
- Others merged clean.

## Fixes on top of the merges
- ?lab=1 had 3 parsers (menus/focus.js, profile/feedback.js, lab/lab.js). Now ONE: RET.lab in profile/ret.js (rule 18).
- Boss bar label (W324) was 9.2 px on screen at 390 and 7.1 at 375 (hud-cover FAIL). Font now >= 11 px on screen (render/pureboss.js). bossbar-layout still 10/0.
- "POINTS MULTIPLIER" caption (W324) overlapped the stage banner at 844x390 (ui-align story-stage FAIL). Hidden while a banner/hint/boss bar is up (hud/multhud.js).

## Verification table (final branch)
| Check | Result |
|---|---|
| flake8 E9,F63,F7,F82 | 0 |
| build guard.py warnings | 0 |
| flow-test | 91/0 |
| gauntlet-shell | 401/0 |
| claims-check | 17/0 |
| copy-test | 29/0 |
| bossbar-layout-test | 10/0 |
| focus-test | 15/0 (title: FLIGHT, ON FOOT, SETTINGS without ?lab=1) |
| preload-test | 15/0 |
| streetsong-test x3 | 6/0 each |
| streetdraw-test | 3/0 |
| footvis-test | 171/0 |
| gauntlet-foot controls | 57/0 on the last 2 runs. Earlier runs showed flaky control FAILs (pc jump, overlap, "not started"); the W319 base build also flaked, on different checks |
| hud-cover-test | PASS after fix |
| ui-align core screens at 390x763, 375x553, 844x390 | 0 findings after fix |
| open-probe GATE=1 | 5/0 |
| smoke.sh whole | run BEFORE the two fixes: 2 FAIL (hud-cover, ui-align-844x390), rest PASS incl. labfull. NOT re-run whole after the fixes; both tests pass alone |
| streetsim RUNS=40 | idle 0% (died 40/40), gfirst 85%, dodge 65%, still-foes 17.5%, nearest 10% (W325 not merged, below 25-40: REPORT). Old W319-era gates also FAIL: gfirst 60-80 band, threat peak 79, cover hits 0.3, depth spread 26%, stepped vs real-time seed. No tuning done |
| push-gate | CHOOSE >= HOLD on both bases: base 0 88% vs 75%, base 1000 81% vs 68% (W323 met). FAIL "PUSH clear <= CHOOSE-15" (PUSH 82-83%): old design gate, not tuned |
| gauntlet-foot full strategies | NOT RUN to the end (seed hit the 500 s cap) |
| gauntlet-flight phone dodger x4 + shooter x4 (W324 boss bar under bots) | NOT RUN (hard stop) |
| full stage from title, late bot, PC x3 + phone x3 with one RESUME | NOT RUN |
| real-input FLIGHT / ON FOOT starts at 390x763, 844x390, 1440x860 + pause + both result screens + NEXT STAGE | NOT RUN |

## Next
Run the NOT RUN rows on this branch before any deploy. Merge W325 if it appears.
