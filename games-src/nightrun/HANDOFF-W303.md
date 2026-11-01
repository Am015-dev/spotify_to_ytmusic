# HANDOFF W303: integration of the round-1 branches (branch nr/W303-integrate, from alex/brave-carson-rbpmlk, not deployed)
Merged with --no-ff in this order, all with NO conflicts (git merged every file itself): W297-hygiene, W295-copy, W292-progression, W301-bosses,
W293-decision, W299-gold-tune (waves.js equals W299's: `git diff origin/nr/W299-gold-tune -- parts/waves/waves.js` is empty), W298-sell (contains W294-store).
Not merged: W296-sprites, W302-flight-look, W300-duel2, W304, W305. Generated index.html / sw.js were rebuilt, not committed.

## Fixes made on top of the merge (3 commits after the merges)
1. parts/hud/c.js (ONE-CLOCK #1): in a run `fbT` now advances inside the stepped `update` loop (`fbT+=s`); on the title/attract it still advances by render dt.
2. parts/hangar/upgrades.js (ONE-CLOCK #5): bubble burst cooldown uses run time `G.t` (with a reset guard), not wall time.
3. parts/qa-hooks/g.js: REAL BUG from W295. `?chk=1` gating also removed `#titleRow2`, the row that WEAPONS (g.js) and FLIGHT SCHOOL (drills/tut.js) are added to, so
   both buttons vanished for players and hub "weapon pick" broke. The row is now always built; only the checklist button needs `?chk=1`.
4. Tests that were stale after the merge: qa/gauntlet-shell.js (FLIGHT label now carries "Stage N"), qa/focus-test.js (stage row digits, NEXT STAGE on the result),
   hub-test.js (W297 left the story-log door index at the old child number).
ONE-CLOCK not applied: #2 street/foot.js beatPos (the street worker's, left); #3 power.js judge(performance.now()) equals judge() (no change in behaviour: not touched);
#4 power.js wall stamps (log only); #6, #7 acceptable.

## Test table (live = alex/brave-carson-rbpmlk built here, merged = this branch). pass/fail counts
| test | live | merged |
|---|---|---|
| flake8 E9,F63,F7,F82 | 0 | 0 |
| build | ok | ok |
| qa/flow-test.js | 61/0 | 91/0 |
| qa/gauntlet-shell.js | 399/0 | 399/0 (after the label fix; 396/3 before) |
| qa/claims-check.js | 17/0 | 17/0 |
| qa/copy-test.js | n/a (new) | 15/0 |
| qa/bossbar-layout-test.js | 10/0 | 10/0 |
| qa/focus-test.js | 15/0 | 13/2: FAIL "flight: exactly one song ever playing: stage1,stage2" (see wrong list) |
| qa/preload-test.js | 15/0 | 15/0 |
| qa/streetsong-test.js x3 | 6/0 x3 | 6/0 x3 |
| qa/streetdraw-test.js | 3/0 | 3/0 |
| qa/footvis-test.js | 171/0 | 171/0 |
| hub-test.js (SMOKE=1, the smoke.sh row) | 54/0 | 53/0 (after the g.js fix; 48/5 before) |
| smoke.sh (W297 version, TMO) | old version hangs on fingerprint: not run to the end | 8 PASS, 1 FAIL = the hub row above (before the g.js fix); NOT RERUN as a whole after the fix; fingerprint skipped = PRE-EXISTING |
| qa/push-gate.js 1,4,6 | n/a (W293) | RUNS=8: 5/7 lines; RUNS=16: 4 PASS 2 FAIL (CHOOSE clear 50% < HOLD 73%; PUSH 42% > CHOOSE-15). W299's own branch built alone in this container gives the same shape (CHOOSE 52% vs HOLD 63%, PUSH 56%), so NOT a merge regression; W299's 6/6 did not reproduce here |
| qa/streetsim.js RUNS=40 x3 | gfirst 73, dodge 68, idle 0, nearest 40, still 11.8%; 4 gate FAILs | identical numbers; the same 4 gate FAILs (threat peak 62% vs 82-88, cover 0.3, depth spread 28%, one-seed real-time) = PRE-EXISTING (run 2 and 3 of merged show 3: the real-time check passes) |
Console errors: 0 page errors at 390x763 touch, 844x390 touch, 1440x860 (title, flight start, ON FOOT start; /tmp/proof.js).
Real input: FLIGHT started by touch tap (phone, 844x390) and mouse click (PC): stage 1 running. ON FOOT started by touch tap and click, story-card SKIP tapped, street at S.time 10 s on both.
Stage chain 1 -> 2 -> 3 by real touch taps on #srNext (phone): NEXT STAGE shown on each result, stage 2 and 3 started. (Stages were cleared with ST.clear, not played.)
NOT RUN: labfull (BROKEN per test-status.tsv), fingerprint, W298 release/ tests (iframe-test, launch-test).

## Shots (not committed): /home/user/spotify_to_ytmusic/shots-w303/ title-{phone,pc}, flight10s-{phone,pc}, result-nextstage-{phone,pc}, street10s-{phone,pc}
## What is wrong (looked at the shots)
- Result screen at 1440x860: the achievement toast ("BRONZE ACHIEVEMENT First Light") sits on top of the FUN / SAME AGAIN / BORING feedback row and hides it.
- Flight at 10 s on both sizes: no foe on screen yet, only the ship and its shots; the first screen is quiet. Result of a forced clear shows "36 PERFECT hits (you: 0)" and score 0 (artifact of ST.clear).
- Phone street at 10 s: the tutorial line "Push the stick right" is the only guidance; Kai alone, no foe in view yet.
- focus-test "one song ever playing": stage 2's song name is sampled in a flight run that was started from the stage 1 retry. Not investigated: either the next stage's music is prepared on the result screen (W292) or the test's own startStage('stage2') probe is now sampled. Owner: W292 / menus/focus.js.
- push-gate 6/6 not reproducible here (see table); needs W299 to confirm on its own container or loosen to more seeds.
- The tests still carry old hub MENU expectations in places; hub-test is the only one fixed.
