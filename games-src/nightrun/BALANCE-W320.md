# BALANCE-W320: street boss checkpoint (RESUME FROM BOSS)

Build: branch nr/W320-checkpoint (from nr/W317-integrate4), 31 Oct 2026. Not deployed.
Bot: `late` (qa/gauntlet-foot.js: reacts .45-.75 s after a telegraph, attacks the nearest foe). Real input only, from the title's
ON FOOT button, one run at a time, game loop at x3 (TS=3). `RESUME=1` = after a death at the boss the bot taps RESUME FROM BOSS
(real tap / click) once. Seeds 0-2 per platform. Real input is not bit-exact: the same seed can differ between runs (PC seed 0 cleared
after a resume in a first single run and died after one resume in the table run).

## 1. Late bot, full stage from the title (qa/gauntlet-foot.js PLAT=pc,phone STRATS=late SEEDS=3 RESUME=1)
| run | reached boss | first-try clear | result |
|---|---|---|---|
| PC 1440x860 seed 0 | yes | no | died at boss (boss hp 91 left) -> RESUME -> died again (not cleared in one resume) |
| PC seed 1 | yes | yes | cleared t=233 s |
| PC seed 2 | yes | no | died -> RESUME -> cleared |
| phone 390x763 seed 0 | yes | yes | cleared t=229 s |
| phone seed 1 | yes | yes | cleared t=231 s |
| phone seed 2 | yes | no | died (boss hp 66) -> RESUME -> died again |

Reach 6/6. First-try clear 3/6. **Clear within one RESUME 4/6** (gate >= 4/6 met, exactly). The reviewer's baseline was 1/6 first-try.
Extra single run: PC seed 0 (before the copy line was added) died once, RESUME, cleared (t=225 s). 844x390 touch, late bot seeds 0-2:
3/3 first-try clears (no resume needed; those runs are in the table only as a layout check).

## 2. Duelist phone x2, RESUME off (unchanged path)
seed 0 died at t=122 s to rushers before the boss (no checkpoint involved); seed 1 reached and cleared (t=217 s). 1/2. W317 measured 3/4;
the pre-boss street is untouched by this change (the checkpoint code only runs once the boss is called or on a resumed run).

## 3. qa/streetsim.js RUNS=40 (unchanged gates)
idle: died 40/40, 0 clears (PASS: the checkpoint only exists after the boss is called, an idle player dies at ~17 s). Compared against a
build of the parent commit (W317): the same 7 lines FAIL in both (gfirst 90% vs 60-80, nearest 13% vs 25-40, threat peak 76.8%, W243 gfirst 90, cover
0.3, D3 26%), numbers identical. These fails predate W320 (streetsim never presses RESUME).

## 4. Other suites
See HANDOFF-W320.md (table of PASS/FAIL).

## 5. Screens (YOU WENT DOWN, RESUME FROM BOSS first)
- phone 390x763 (real run, late seed 2): three buttons 358x48 px at y 453-617, all inside, RESUME first, one explanation line above them, the dim game controls sit behind the overlay.
- 844x390 landscape: two columns, rows left, buttons right (370x48 at y 52-206 of 390), nothing cut off, no overlap.
- PC 1440x860: buttons 420x48 centred at y 505-669.
