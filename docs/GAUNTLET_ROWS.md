# GAUNTLET_ROWS: the red rows, script or game (gscript-r30o, 2026-10-30)
Runs: trunk cf75233 + tools/gauntlet.js 305daa3, built page, phone profile, seed 7, `docs/shots/gauntlet/r30o-a` (793 s, 5 FAIL) and `r30o-b` (808 s, 7 FAIL). The r30m-full baseline had 12 FAIL.
**Not all rows are stable yet.** Rows marked "unstable" gave different verdicts in A and B and are NOT closed; the two wall rows are only partly fixed.

| row | verdict | evidence | new value (A / B) |
|---|---|---|---|
| steer/buttons | script, fixed | was 0/4 at 90-103 km/h: the follower braked with an arrow held, and BRAKE + arrow is a drift that gains speed (drift/start 61 → 114 km/h). `pace()` now lifts GAS first and brakes only > pace + 25, never with an arrow | PASS 54-63° both ways / PASS 54-65° |
| drive/time, drive/frustration, drive/onStreet | script, fixed (same cause) | avg speed 100 km/h and 0-30 % on street before; now avg 51 km/h, 1.70 km | onStreet 99 % / 98 % |
| drive/near | **game** | now trustworthy (bot on street 98 %): 0.5-0.7 cars within 40 m, 5.9-6.0 at 80-150 m, 75 cars total, hour 10.8. Repro: `node tools/gauntlet.js --only drive` | 0.5 / 0.7 (bar 2.5). For the coordinator: traffic density near the player |
| hit/contact | script, fixed | target rules of REVIEW_2K_32 (my street, closing >= 3 m/s, cv >= 2, re-pick on edge change, hitT vanish = smash, no target in 4 windows is not a miss). Real nose-ins only | PASS 4/4 (+1 no target) / PASS 4/4 (+1 no target) |
| hit/noBrake | **unstable** | A max -2 %, B max 16 %. B had two smashes (Δv 140 = thrown car), so the speed read at 12 m vs contact is probably a lunge/prop before the car. Not proven game or script | PASS / FAIL 16 % |
| drift/start, drift/tap | script, fixed (same cause as steer) | 3/3 slip 40°, 0/3 slid | PASS / PASS (both) |
| wall/glance, wall/headon | **partly script, partly game** | Setups now aim at tall facades (solid at car height and +5 m, three probes on one line) and use the measured wall angle. Still 2-3 of 4 glances and 1 of 2 head-ons "not set up" (few facades within 40 m of the street). Where set up: glance 41° 37 km/h kept 0 % (A), 21° kept 70 %, 35° kept 97 %; head-on 42→47 km/h and 43→28, 42→23 (B): the car is NOT stopped by the facade. Shot `dev-m/fra_5_head_2` (not kept; reproduce with `--only wall`): camera inside a pale facade at 44 km/h | A 1/4, 0/2 / B 1/4, 0/2. **Game: head-on does not stop the car; a 41° glance stops it.** Needs a game lane; setup coverage needs one more script lane |
| mission/reach | **unstable (script)** | same quest sq_gn_1 498 m: A card in 25 s, B no card in 90 s although the prompt was tapped. Cause not found: the router/stuck logic or the open-prompt timing | PASS 25 s / FAIL 90 s |
| boot/toControl, ath/boot | game (known) | 73-74 s and 101-105 s at 6x CPU vs bar 36 s | unchanged |

Stable verdicts across A and B: steer, drive/time/frustration/onStreet, hit/contact, drift/start, drift/tap = PASS (script fixed); drive/near, boot/toControl, ath/boot, wall/headon = FAIL (game). Unstable, not closed: hit/noBrake, mission/reach, wall/glance setup.
Game list for the coordinator: (1) traffic density near the player (drive/near); (2) head-on into a facade does not stop the car, glance at ~40° stops it; (3) boot (known).
