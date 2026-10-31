# REVIEW_2K_46: og2 round 2 (og2b, 148fe71)

**Verdict: the og2b round PASSES (all 3 rev44 blockers are fixed and seen with real touch), but ?og2 does NOT ship default ON yet.** With the flag ON, `why/drive-start` (ath) is red in 2 of 3 runs; OFF it passes in both runs. Rule 15: no shipping through a red. Fix that one item (plus 2 small ones below) and og2 can go ON.

Built page out/rev46: 3,463,034 B (the worker's 3,463,033 B plus 1). Phone profile: iPhone UA, 852x393 touch. The play ran at 6x CPU (fra + ath) and at 1x (fra, for feel). The gates are unthrottled, as tChkGo runs them.

## 1. Diff (4 src files, about 10 lines)
- **Flag OFF is unchanged.** The level-up gate is `&&OD_FLAG('og2')`. With the flag OFF, the pause label is set to 'MENU', which is its existing text. `OG2_laps` is only used on og2 cards. The GO changes are test-only.
- **Blocker 1 (level-up wall) is fixed.** `R3_upPump` holds the queue while `state==='results'&&RO.fromRoam`. In the city it then shows as the existing mini toast (pointer-events none, about 2–4 s). That is 0 extra taps, not 1.
- **Blocker 2 (card laps) is fixed.** The card uses the same `CR_RK` scaling as setupRace: "1 lap", and the race shows LAP 1/1. The GO asserts card laps == RC.laps.
- **Blocker 3 (pause label) is fixed.** "🌍 BACK TO CITY" shows when `RO.fromRoam`.
- **The GO is honest now.** `OG2_tap` fails when the element is hidden or covered (it checks `elementFromPoint`), and it runs on a fresh save where the level-up really fires (lv1>2) and on a used save.
- **The 10 s cap is not hiding slowness, but it is a dead check.** The return wait itself stops at 8 s (`wait(...,8000)`), so `ms>10000` can never fire. The real times I measured with real taps are 0.6–1.5 s at 6x CPU, and 0–0.1 s at 1x. In the GO they are 0 ms. Put the cap back to 3 s (item 3).

## 2. Play (real CDP touch, fresh save xp 0; harness play_rev46.js)
| run | trip | result |
|---|---|---|
| fra 6x | Grand Prix, finish | card "1 lap", 1 tap PLAY, results with no level-up, 1 tap BACK → city 0.6 s, 0 m / 0 rad |
| fra 6x | Westhafen, quit mid-race | pause → "BACK TO CITY", 1 tap → city 0.9 s, 0.02 m |
| fra 1x | same two trips | city 0.0 s / 0.1 s, 0 m |
| ath 6x | Akropolis, finish | same as fra; back 1.5 s; the LEVEL UP toast shows in the city (ath_back.jpg) |
| ath 6x | quit | not completed with real touch: my straight GAS run toward Syntagma left the road and stuck on a kerb (ath_synt_stuck.jpg, a harness fault); a second try was still loading at the timebox. The GO covers the ath quit (PAPPAS, fresh + used: 1 tap, 0 m) |
Page errors: 0 in every run.

Confusing moments:
- **(a)** At the Grand Prix ring in fra, the chip offers "EISERNER STEG LEAP · TAP TO OPEN", a neighbouring marker (fra_chip_wrong.jpg). A player who stops at the race ring is offered the wrong thing. My harness opened the card by eval in every trip, so chip → card is not covered by real touch.
- **(b)** The race is still a neon night track with no GAS pad. That is og3/S3 work, but it is the biggest reason the races still feel like "2 separate games".

## 3. Gates (BUILT page, phone profile; TAG=onegame,race/racemode-all,race/one-speedo,racefree,why,life1,xf1,terrain = the lane tags + the default gate)
| | flag OFF | flag ON (`?og2=1`) |
|---|---|---|
| unit | 0 FAIL (5022 pass, 13 known) | same build |
| batch fra+ath | **PASS 88/88**, 0 errors | **FAIL 87/88**: `why/drive-start#1` (ath), 0 errors |
| onegame/race-roundtrip | PASS | PASS: fra + ath, 12 trips, fresh lv1>2 + used, 2 taps, 0 m / 0 rad, hub reused |
| why/drive-start ath re-runs | 1/1 PASS | 1 PASS, 1 FAIL ("hint pill shown on a fresh save (0x0)") |
On trunk (= 148fe71) the red is ON-only, so og2 introduces it. The OFF batch is also cleaner than rev44 (no why/hud6, no why/solid-bld).
Likely cause, not proven: the hint pill hides while `RO.card`/`RO.ch` is set (99fd_drivefirst.js:29). The Athens og2 markers (4 races + 6 rivals) sit around the spawn, so a marker chip or card may hold the pill hidden for the GO's 500 ms check.

## To ship ON (one SONNET lane, about 30 min)
1. **why/drive-start green with ?og2=1 in ath (3 runs in a row).** Find out why the hint pill is 0x0 under og2 (an og2 marker or chip near the ath spawn?). Fix the product, not the check: no og2 marker within the chip radius of the free-roam spawn.
2. **At an og2 race ring, the chip names that race.** At the fra Grand Prix ring, the chip must not offer the neighbouring Eiserner Steg leap: prefer the og2 marker the car is inside, or move the marker off the leap. Add a GO: drive into each og2 ring, then chip text == marker title.
3. **Make the GO time check real again.** Set the return cap to 3 s, with a wait longer than the cap.
Then the coordinator flips og2 ON (rule 11).
