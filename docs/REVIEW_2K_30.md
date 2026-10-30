# REVIEW_2K_30: traffic-r30c2 (1fb1138) (2026-10-30)
Reviewer lane review-r30-4. Built page `out/rev30` = 1fb1138 (trunk tip), served at 127.0.0.1:8812. Phone profile everywhere (iPhone UA, 852x393 touch, dpr 2, 6x CPU for the boot). The old behaviour was run on the **same build** with `?ivnear=1&latsplit=0`, so the A/B differs only in the two changed lines.
Probe: `docs/shots/rev30/gauntlet_rev30.js.txt` = tools/gauntlet.js plus one read-only row `rev/latres`. It records the sideways part of the HT_LAT residual (`c.lrx/lrz` against the lane direction) for in-view cars 6-60 m away. When such a car within 40 m is more than 2 m off its lane, it saves a shot.

## Verdict: **FAIL on point (b). Send it back to the same worker.**
The jump fix works: 0 on-screen jumps in every run. But the gauntlet's `hit/contact` row is red on 2 of 3 seeds with the new default. With the old flags on the same build and the same seeds it was green. Under rule 15, a red gauntlet row is not shipped through.

| point | verdict | measured |
|---|---|---|
| (a) no on-screen jumps > 2 m; no new junction artefacts | **PASS for jumps, plus one watch item** | drive/pop **0 jumps, 0 appear** in 4/4 fra drives (seeds 3, 5, 11, probe-new 11) and ath/drive **0 pops** in 4/4 Athens drives. page/jsErrors 0 in all runs. Lane drift (watch item): `rev/latres` new vs old flags, seed 11, fra. Cars more than 4 m sideways off their lane: **2.92 % vs 1.29 %** of in-view samples. Max offset **6.35 m vs 5.17 m**. Samples with a car more than 2 m off for over 3 s: **76 vs 0**. The old run drove only 55 % on the street, so it is a weaker sample (3015 vs 8686 samples). Shots LOOKED: new `junction_new_cars_across_centre.jpg` (black + orange car overlapping, diagonal across the centre line in a junction) and `junction_new_car_on_centreline.jpg` (car angled over the double yellow). The old-flag shots also show off-lane cars (`street_old_flags.jpg`: a yellow car on the kerb), so this is not proven to be new. It is the price of sliding instead of snapping (sideways part closes at ≤ 0.9 m/s, now for hand-offs up to 12 m). Athens probe read 0 samples (probe bug in my row, Athens not measured for this). |
| (b) does the 8 m clamp damp real collisions? | **FAIL** | When contact happens the reaction is full: every hit shot shows the car thrown with SMASH and bricks (`hit_new_s5_thrown.jpg`, `hit_new_s3_thrown.jpg`), because smashes and W10_bump shoves set crW/hitT, which stay exempt (code read). **Contact rate, same seeds:** new **5/10** (s3 2/5, s5 3/5) vs old flags **9/10** (s3 5/5, s5 4/5). Seed 11 new 4/5. Gauntlet `hit/contact` FAILs on s3 and s5 (bar ≥ 4/5). New misses: "miss, closest 7.1 m", "miss, closest 17.5 m", "target vanished at 8.29 m", "no car in front" ×2 (old: 1 "no car in front"). The cause is not isolated. The game's own randomness differs between runs (onStreet 80 % vs 98 % on s3), so this could be variance, but a 7.1 m near miss is exactly the zone the clamp now covers. Ask for the worker: run `--only hit` on ≥ 5 seeds with and without `?ivnear=1`; if the gap holds, find what the clamp does to a target car inside 8 m before hitT is set (e.g. yield dodge `c.yo`, NC separation). |
| (c) why/solid-cars + why/traffic-inview 5/5 fra + ath | **PASS** | gate run 1 (78/78) + 4 runs `TAG=why/solid-cars,why/traffic-inview` gate.sh: 4/4, 4/4, 4/4, 4/4. |
| (d) phone perf no worse | **PASS (claim not reproduced)** | `--only perf`, run alone, same build: new **p95 1000 ms** (16 frames) vs old flags **917 ms** (18 frames), boot 79 vs 81 s. Same within noise. The handoff's "917 vs 1050" is therefore noise, not a gain. Draw calls were not measured; the diff adds no mesh, material or car (code read: two condition changes). |

## Gates
| check | result |
|---|---|
| `tools/build.sh rev30` | BUILD_OK, page 3,489,954 B (under the 3.6 MB cap) |
| `node tools/unit/run.js` | UNIT OK 5245, **0 FAIL**, 13 known |
| `tools/gate.sh` (why,life1,xf1,terrain, fra + ath, phone) | **PASS 78/78** (242 s). A first attempt at load 39 (my 7 parallel runs) timed out at boot in both cities. That was my overload, not the game; it passed on rerun |
| `race/racemode-all` PHONE=1 fra + ath | **PASS 2/2** |
| gauntlet full, label `rev30-r30c2-s11` (seed 11) | 9 FAIL rows. Baseline/script rows: boot/toControl 270 s (load), drive/near 0.7, drive/onStreet 71 %, drift/start 2/3, wall/glance + headon (script), mission/reach. `run/ath` + `run/portrait` errors come from my 30-min background limit killing it during the Athens race (ath/boot + ath/drive had PASSED). hit/contact 4/5 PASS, drive/pop 0, jsErrors 0 |
| gauntlet `--only drive,hit,ath` seeds 3 and 5 (`rev30-r30c2-s3`, `-s5`) | drive/pop 0, ath/drive 0 pops, jsErrors 0; **hit/contact 2/5 and 3/5 FAIL** |
| A/B old flags seeds 3 and 5 (`rev30-old-s3`, `-old-s5`) | hit/contact 5/5, 4/5 PASS; drive/pop 0 |

Reports: `docs/shots/gauntlet/rev30-*/REPORT.md`. Seen in the shots (pre-existing, not this commit): the "SMASH!" popup renders doubled (as in REVIEW_2K_29), and one shot has a large translucent dark-blue polygon over the sky (`rev30-r30c2-s5/fra_3_hit_1.jpg`).
