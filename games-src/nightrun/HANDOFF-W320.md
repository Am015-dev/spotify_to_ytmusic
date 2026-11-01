# HANDOFF W320: street boss checkpoint

Branch nr/W320-checkpoint (from nr/W317-integrate4). Pushed, not deployed.

## What changed (3 files, ~15 lines)
- parts/street/street3.js (owner of the boss arrival): when the big heavy is called, `S.bcp` snapshots position, camera, stage clock, score, kills,
  hurts, hearts and weapon. On a resumed run (`S.bres`) the street waves are emptied and hearts = max(3, hearts at arrival).
- parts/street/foot.js (owner of runs and the result screen): `newRun(id,'boss')` restores the snapshot (same seed: the stage is the same, the boss spawns
  1.2 s after the restart at full hp); result screen shows RESUME FROM BOSS as the FIRST button when Kai went down after the boss was called, then RETRY and TITLE.
  One explanation line above the buttons ("Resume: back at the boss, boss at full health · Neon x0.75, no record"). The pause menu RETRY is unchanged (full street).
  This is the street's own existing FROM CHECKPOINT mechanism (`S.cp`, `begin(id,fromCp)`); no second mechanism.
- qa/gauntlet-foot.js: env `RESUME=n` (the bot taps RESUME FROM BOSS with a real tap/click up to n times; checks first button, >= 44 px, inside viewport); log line has reach= and resumes=.

## Score / Neon rule (matches the flight checkpoint)
Flight: marked run, Neon x0.75, no records, no hull-lost star. Street now: score, kills, time carried over; Neon (death pay and clear pay) x0.75 on a boss-resumed run
(`S.bossCp`); no best-score record; rank S is capped to A (the street's existing `cpUsed` rule). Unlimited resumes per run: each one restarts at the same arrival moment.
An idle / weak player never gets the checkpoint (it only exists after the boss is called): streetsim idle 0 clears.

## Decisions (no one to ask)
- The reviewer file games-src/nightrun/REVIEW-2026-10-31-R2.md is not on this branch; I worked from the brief's numbers.
- Hearts at arrival, minimum 3 (brief). The two heals the street drops as the boss walks in are given again on resume only if Kai is below max (same code path), so a resume can never leave him weaker than the first try.
- The song restarts from its beginning on resume (flight seeks to the bar; the street plays one 192 s song and the boss is at 144 s, a seek is a separate task).
- Resume is not offered after a pause-menu QUIT (no result screen) and not in the Lab (S.bcp is set but the Lab ends without a result menu).

## Verification (all real input / stepped as specified; details in BALANCE-W320.md)
| check | result |
|---|---|
| late bot PC x3 + phone x3 | reach 6/6, first-try clear 3/6, clear within one resume 4/6 (gate >= 4/6) |
| duelist phone x2 | 1/2 (seed 0 died to rushers before the boss; W317 had 3/4; pre-boss untouched) |
| streetsim RUNS=40 | idle 0 clears; same gate lines as parent commit (7 old FAILs identical, listed in BALANCE-W320.md) |
| streetsong-test x3 | PASS x3 |
| streetdraw-test, footvis-test, flow-test, gauntlet-shell, claims-check | PASS (footvis after `git fetch --deepen=2000`) |
| copy-test | 0 failed |
| screenshots | phone 390x763, 844x390, PC 1440x860 looked at: buttons inside, 48 px high, RESUME first, no overlap |

## Left for the orchestrator
- Rebuild after merging (generated files not committed). A 4/6 clear-within-one-resume is exactly at the gate; late bot dies at the boss with 66-91 hp left in the two failures: a boss tuning pass (not this task) would lift it.
