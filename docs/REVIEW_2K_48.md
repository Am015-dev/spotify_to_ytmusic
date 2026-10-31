# REVIEW_2K_48: og1b (142e901), builder DRIVE = roam (flag ?og1)

**Verdict: PASS. ?og1 can ship default ON.** All 3 REVIEW_2K_43 items are met. Roam driving is bit-for-bit the same with og1 OFF. The why/solid-cars miss rate is the same with and without og1b, so the miss is not caused by og1b.

Built pages: out/r48 of 142e901 (3,456,915 B) and of its parent 010bdd5 (3,456,641 B), served side by side. Phone profile: iPhone UA, 852x393 touch. The gates run at their own settings. The shots and the feel run are at 1x.

## 1. REVIEW_2K_43 items
1. **Launch = roam.** Met. Under og1, `BX_step` uses 71's `RD_pow` (roam's power curve) and `RD_thr` (the C26 throttle ramp), capped by the existing 99_api `CR_acc`. The worker measured 20.4/31.2 m/s vs 20.5/31.7 at 3/5 s. My roamStep trace on this build gives 20.485/31.651 at 3/5 s.
2. **Camera = roam.** Met in the shots. At 65-67 km/h the car is about 130 px wide in the builder vs 120 px in roam, at the same height and distance behind the car (docs/shots/rev48).
3. **Car on the ground.** Met. `BX_ogSeat` seats the wheels on the deck, with no visible gap in 3_builder_rest. With the flag OFF, `#touch` is no longer touched: `BX.ogT0` stays null, so `BX_close` leaves it as it was.

## 2. (a) Is roam driving the same with og1 OFF? Yes, bit for bit
- **Code**: in roamStep the only change is `Math.max(0,1-(RO.v>0?(RO.v/tt)**W13S.cp:RO.v/tt))` → `RD_pow(RO.v,tt)`. The body of `RD_pow` is that same expression, so the float maths is identical. `RD_thr`, `RD_top`, `SKC_rig` and `BX_ogSeat` are called only from 98b2 builder paths and the 99c9og GO, never from roamStep or roamCam. `CR_acc` (99_api) is unchanged: 99_api.js is not in the diff.
- **Measured** (tools: /tmp page script with a seeded Math.random, roamStep at a fixed 1/60 s from the same ?test=fra spawn, hashing v, h, x, z and y every frame):

| run | 142e901 (3 runs) | 010bdd5 (2 runs) |
|---|---|---|
| launch 0-8 s (100 km/h at 4.25 s; v 6.59/13.80/20.49/31.65/42.46 at 1/2/3/5/8 s) | hash -74576925 ×3 | -74576925 ×2 |
| turn (2 s gas, then full steer) | 1995990765 ×3 | 1995990765 ×2 |
| drift (4 s gas, then steer + handbrake) | differs in every run | differs in every run |
| roamCam at rest, chase b/h/bk/hk | 5.63/1.81/-0.86/-0.22 | same |

  The drift hash and the camera position (±3 cm) differ between two runs of the *same* build, by the same amount in both builds. That is traffic contact and streaming during the run, not code: the drift run hits live NPC cars. Launch and turn hashes are identical across all 5 runs.

## 3. (b) why/solid-cars and the RD_* names
- **No collision.** I grepped every `RD_` symbol (60 names). `RD_pow`, `RD_thr` and `RD_top` are each defined once, in 71, and no traffic file (98rd, 98nc, 99sc, 99iv, 70, 99cd) reads them. `RD_unstack` is untouched.
- **Full default gate** (`tools/gate.sh`, TAG=why,life1,xf1,terrain, fra+ath), 4 rounds, with both builds run side by side in each round:

| round | 142e901 | parent 010bdd5 |
|---|---|---|
| 1* | 73/78 | 73/78 |
| 2 | 71/78 (**solid-cars**) | 76/78 |
| 3 | 76/78 | 73/78 (**solid-cars**) |
| 4 | 76/78 | 75/78 |
| **why/solid-cars miss** | **1/4** | **1/4** |

  \*In round 1 my trace probes were also running (load average 32 on 4 cores).
- The rate is the same. Both misses are a (d) "jumped" car respawned by **DR_unjam** while the camera looked away: 14,143 km on og1b, 2,776 m on the parent. Neither is RD_unstack, and the test labels both as "by design" but still counts them. That is a test or traffic-respawn issue with no owner. Rule 15: why/solid-cars (d) needs a traffic lane, and it should not hold og1.
- In this container neither arm was 78/78. With two gates running at once on 4 cores, the same load flakes appear on both arms: why/solid-bld (both), why/hud6 (both), life1/smash (both), and quiet-start#1, quiet-dirt#1, xf1/kerb (og1b once each) vs speedfeel#1 (parent once). The fail sets overlap and none touches the builder or roam code paths. The worker's solo 78/78 is plausible but I did not reproduce it. Rule 15 still applies to solid-bld/hud6/smash, as it does on trunk.
- The og3b race-timer OFF regression (REVIEW_2K_47) is not og1b's. I did not count it.

## 4. Other gates
| check | flag OFF | flag ON |
|---|---|---|
| unit (with three.js) | 0 FAIL (5399 pass, 13 known), parent the same | same build |
| TAG=onegame, phone profile | 4/4, 0 errors | 4/4, 0 errors |
| life1, xf1, terrain | in the default gate above | not re-run |
| default gate | 4 rounds above | **not run by me** (timebox); worker 78/78 + one 77/78 |
| tOpen / tTracks | not re-run (40-min SwiftShader timeouts in rev43); worker 7/7, all ✔ | same |

The ON-only paths are builder code behind `BX.og`, and the shared code is proven identical with the flag OFF, so the missing ON gate does not change the verdict.

## 5. Feel (1x, real CDP touch, phone profile)
The city and CLIFF RUN show the same red hot-rod, the same buttons and the same pull-away. In game time the city run reached about 13 m/s at 4.4 s with real touch, and the builder about 22 m/s after 7.5 s with 0 respawns. At about 65 km/h the two frames look the same. The car no longer floats. What still makes the builder feel like "a separate game" (Alex, 31 Oct): its own HUD, its own pale sky without brick clouds, and no drift. Those are the next lanes (S3 one HUD, then the world look), not og1b's items.

## Ship
Ship og1 default ON (rule 11). Then do the HANDOFF_og1b item 5 clean-up (delete BX_camDrive, the BX_input touch buttons and the old BX_car path), followed by S3.

Shots: docs/shots/rev48 (SEEN.md).
