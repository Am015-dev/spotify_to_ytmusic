# HANDOFF W293 (branch nr/W293-decision, not deployed)

Built: the W247 push-or-hold decision as the default (`RET.gold`, `?gold=0` = off, kept only for before/after tests; delete the
off-branch once it has shipped 3 days, rule 18b). Files: parts/waves/waves.js (bounty, flak, chip, result line), parts/waves/slice.js
(each scripted group opens a bounty, 2 lines), humanbot.js (`H.home`, `POLICY=hold|push|choose`, gold/mode/score in the JSON),
qa/push-gate.js (new), qa/gauntlet-flight.js (prints the result's GOLD line). Rule 18e: removed the stale `RET.waves` flag note in waves.js.

State: push-gate 4/6 on the final run (score 1.68x, switches, squad modes, abilities PASS; both clear gates FAIL, noisy and capped
because stages 2-3 = 100% and 5 = 0% for every policy). All numbers: BALANCE-W293.md. Feature off = base on waves-test and the
calibration. fps within the base spread. Phone GOLD chip, toast and result line readable.

Wrong / open:
1. Stage 6: the gunship flak kills both PUSH and CHOOSE (0% clear). Remove flak from gunships, or lower FN there, after the owner plays.
2. The clear gates need more discriminating stages (or 16+ seeds) to be meaningful. Rule 16e: the owner plays stage 1 and 4 first.
3. Rules changed from the design doc (close kills required, one GOLD per fifth, flak), each one measured. See BALANCE-W293.md
   "Why the design doc's rule had to change".
4. Gauntlet findings (NEXT STAGE in focus mode, fire control probe) are W292's area and were not checked against base.
Run: `NODE_PATH=$(npm root -g) RUNS=8 TABLE=1 node games-src/nightrun/qa/push-gate.js` (~1.5 min).
