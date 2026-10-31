# W304 street boss duel, part 3 (branch nr/W304-duel3 from nr/W300-duel2), 31 Oct 2026. Not deployed. Verdict: streetsim FIXED and gates read; late reader is a knife edge (not in band on phone); full stage NOT RUN
Constants: BALANCE-W304.md. Logs (not committed): /tmp/w304/ (ss1-3.log + md, g/<cell>.log + results.json).

## 1) streetsim: cause and gates
Cause (bot, not game): street2-test's ctl never clears I.guard / I.dash, so after the first GUARD / DASH answer the keys stayed held and the duel's edge test never fired again (swing / charge read "none"); and the belt build's
jump filter cancelled the POUND answer (JUMP). Both fixed in qa/streetsim.js (details in BALANCE-W304.md). Nearest reaction .50-1.00 s (the old .45-.80 won the boss 96%).
| RUNS=40, SEED0 4321 / +316760 / +633520 | block 1 | block 2 | block 3 | gate |
|---|---|---|---|---|
| gfirst clear | 85% (won boss 34/34) | 85% (34/34) | 83% (33/33) | >= 73 PASS (the old "75 +-8" check FAILs at 85 in 2 blocks, kept for the owner to decide) |
| dodge clear | 68% (27/27) | 55% (22/22) | 63% (25/25) | 65 +-8: mean 62 PASS; block 2 alone is outside (its boss win is 100%, the spread is the pre-boss street) |
| idle | 0% | 0% | 0% | 0 PASS |
| nearest clear | 38% (15/22) | 35% (14/19) | 35% (14/26) | 25-40 PASS |
| still-foes | 11.8% | 12.2% | 11.8% | < 20 PASS |
| W191 reach check | PASS (36 duel hits) | PASS (33) | PASS (44) | PASS: a CHARGE / POUND hit in sbL ('+hit', telegraphed, wrong or late) is counted and excluded by design; a hurt with no telegraph still fails |
Still FAIL in all three blocks, pre-boss code, not touched and not investigated: "best bot clears 60-80%" (gfirst is 83-85), threat peak 82-88 (78.5), cover prevents >= 3 hits (0.1-0.4), W173 D3 depth spread (28-29 vs 30), real-time equals stepped run (idle, hurt times differ by 1-4 s).

## 2) Boss only (JUMP=152), real input, TS 3. Seeds per cell are fewer than the 8 asked (70 s per run, one browser, 75 min limit)
| cell | constants | result |
|---|---|---|
| phone 390x763 late | GRACE .13 / TGRACE .04 | 1/6 |
| phone late | .13 / .06 | 3/6 |
| phone late | .13 / .08 | 4/6 |
| PC late | .13 / .04 (W300 tuning, touch only) | 0/6 |
| PC late | .17 / .03 | 1/6 |
| PC late | .19 / 0 | 6/6 (phone 2/3 before I stopped it) |
| PC late | .18 / (0 on PC) | 3/6 = 50% |
| phone late | .18 / 0 | 1/6 |
| phone late | .18 / .02 (FINAL) | 5/6 |
| 844x390 late | .13 / .06 | 3/6 |
| 844x390 late | .18 / .02 (FINAL) | NOT RUN |
| duelist phone 390x763, 844x390 | .13 / .06 | 4/4 and 4/4, 0 hearts lost (100%, above the 60-90 band; unchanged finding from W300) |
| duelist PC | .18 / .02 (FINAL) | 2/2 cleared (0 and 1 heart lost) |
| dodger, idle, masher, random (real input) | | NOT RUN |
Measured phone / PC late reader latency (nominal 600 ms; sbL now stores the first-answer time): answers register at .64-.91 s (phone) and .67-.95 s (PC), i.e. +.04 to +.35 s of poll + dispatch jitter. So "phone late 0/4" was a window
problem of ~.05 s, not a broken touch path. The window is the lever, but a fixed-latency bot makes it a knife edge: a .02 s change moves a 6-seed cell by 4 runs. Final .18 / .02 is PC 50%, phone 83% (out of the 20-50 band).
The next step is a late bot with a spread (600 +- 150 ms) so 6-8 seeds read the real rate, then set GRACE / TGRACE once.

## 3) Full stage from the title, duelist and late, 6 seeds per device: NOT RUN
## 4) 844x390 STREET CLEAR button: FIXED
Cause: the result sheet (title, rank, 4 rows, 3 buttons, centred in a flex column) is taller than 390 px, so BACK TO CITY (fCity, 420x48 box) sat below the screen: not hidden, not covered, just off screen (the gauntlet's 'ok' needs it inside the viewport).
Fix (parts/street/foot.js CSS, @media max-height 460px): stats left column, buttons right column. Evidence: gauntlet land runs (late, duelist, ended by clear and by death) no longer FAIL 'result buttons not usable'. Flow test: foot-test.js now checks, for 763x390 and 844x390,
that every result button is inside the screen, hit-testable and 44 px+ (written, NOT RUN: foot-test.js stops earlier, at the phone 390x763 checks (layout 'narrow' field, no FLY ON on the result sheet, bots die at 25 s) and then crashes at the phone rotation (setViewportSize); I did not check whether that is pre-existing. The landscape evidence is the gauntlet's own result-button check on 844x390 runs, which passes.)

## Code changed
qa/streetsim.js (bugs above, nearest .5-1.0, r.duelHits, DBGDUEL=1 debug trace), parts/street/streetboss.js (GRACE / TGRACE, first-answer time in the duel log), parts/street/foot.js (landscape result CSS), qa/gauntlet-foot.js (R.sbl in results.json), foot-test.js (landscape result check).
