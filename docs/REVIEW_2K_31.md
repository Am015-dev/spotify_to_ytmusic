# REVIEW_2K_31: world-r30b rounds 1+2 (5063c2f + 90f612f) (2026-10-30)
Reviewer lane review-r30-5. Built page `out/rev31` = trunk 90f612f (page 3,492,258 B), served at 127.0.0.1:8831. Phone profile everywhere (iPhone UA, 852x393 touch, dpr 2, 6x CPU for boot). Old build for the GO A/B: 5063c2f with the new `99c6wr_world_go.js` copied in (`out/rev31old`).
Probe: `docs/shots/rev31/gauntlet_rev31.js.txt` = tools/gauntlet.js plus a read-only `rev` part: slow quest approach with brake pulses, and every FC hide sorted into "on the car-to-camera line" or "hidden in plain view". Shots I looked at: `docs/shots/rev31/`.

## Verdict: **FAIL. Send it back to world-r30b.**
The icon and bird fixes work. Three things block it:
1. GO `world/camprop` is red in Athens on 2 of 3 gate runs on this build (rule 15).
2. The gauntlet row `world/glance` passes without a glance (closest 17.9 m).
3. Quest START (e) is still not checked by real input.

| point | verdict | evidence |
|---|---|---|
| (a) icon readable from 40 m into its ring, not floating | **PASS** | Gauntlet `world/pickup`, real GAS drive: opacity **1 / 1 / 1** at 40 / 25 / 12 m. In the shots (`garage_40_25_12m.jpg`) the wrench sits on a short post over the ring centre with no gap, so it is not floating. Reads clearly at 25 and 12 m. At 40 m it is ~20 px and dark, so you see "a dot in a ring" more than a wrench (watch item, not a block). |
| (b) birds read as birds, never in front of the camera | **PASS** | Gauntlet `world/birds` real drive: **8 %** of samples at camera height (5/62). Bar ≤ 10 %; REVIEW_2K_28 had 71 %. In `birds105_quest1.jpg` (105 km/h) the pigeons are small specks high in the sky, with nothing at the lens. Code: vy ≥ 4 m/s with no level-off, and a 6 m push away from the lens. |
| (c) debris lands and is cleaned up | **PASS (code + GO), not seen by real input** | updDebris: gravity 32, floor bounce, life 2.2-2.8 s, so a piece lands by ~1.4 s. CL_burst still overrides life to 1.7-2.3 s, which is also enough at vy 6-11. My smash probe was cut by the timebox. One shot (`birds105_quest1.jpg`, top right) has a white 2x2 brick about 2 m up beside the road at 105 km/h. It is probably a piece in flight from a smash, but that is not proven. |
| (d) glance keeps the car visible, the prop comes back, nothing vanishes in plain view | **FAIL** | (1) **GO world/camprop ath red on 2 of 3 runs** on 90f612f: lens inside `im:29/Group{bvL,cd,pc} 4.5m`, a building-variety instance. The GO's 'bld' tag only reads the parent's userData, so it counts this piece as a prop. The camera pull-in does not cover it. The same piece fails on 5063c2f (5 frames), so this is not new, but it is red now. (2) Gauntlet `world/glance` **PASS with "closest 17.9 m"**: the script never got 2.5 m from the prop, and the bar has no distance condition. (3) Code read, not measured by real input: when the lens or the 75 % point comes within r+0.8 m of any café/stall prop, `C.mv=1` and LV moves the **whole cluster with its people** to a far corner. They do not come back, so a café disappears in view. FC_clear at START hides every grid prop within 4.5 + min(r,3) m of the car's next 12 m, which is up to 7.5 m to the side and in plain view. FC_step's `f.t=FC.t` overwrites the t=1e9 of a START-hidden prop, which can bring it back after 0.4 s while the car is still at START. (4) Probe shot `probe_minifig_at_lens.jpg`: a walker minifig fills the lower-left lens and overlaps the ◀ ▶ buttons. Walkers are not handled by FC_step. |
| (e) quest START x3 by real input, nothing on/in the car | **NOT VERIFIED** | Gauntlet `world/quests` 0/3 started (`d356m v53 no card; q_thief d399m v113; q_photo d409m v139`). The touch drive overshoots because GAS is on by default, so releasing the button does not slow the car. My probe brakes actively and still did not reach q_pigeons in 2 runs (551-615 m away; the router stuck the car against a building). Only GO world/mstart (DOM click on START, staged car) is green. The gauntlet row also logged a LIFE piece (`lf`, 1.8 m) inside the car body while driving at 53 km/h. |
| (f) are the GOs honest? | **partly** | Same GO file on 5063c2f: **pickup FAIL fra+ath** (opacity 0.29/0.12/0.12) and **birds FAIL fra+ath** (25.9 % / 73.2 %), both honest. mstart and roof PASS on both builds, so they cannot tell the two commits apart (FC_clear was already in 5063c2f). camprop: the Athens red is the same on both builds. Other gaps: world/birds says "~80 km/h" but measured at 137-140 km/h, and it sets RO.v (a state write). world/mstart never checks what disappears in plain view. |

## Gates
| check | result |
|---|---|
| `tools/build.sh rev31` | BUILD_OK, page 3,492,258 B (under the 3.6 MB cap) |
| `node tools/unit/run.js` (three installed) | UNIT OK 5622, **0 FAIL**, 13 known |
| `TAG=life1,xf1,terrain,world tools/gate.sh` fra+ath | **FAIL 55/56**: `world/camprop#1` (ath). Re-runs with `TAG=world`: FAIL 13/14 (camprop ath again), then PASS 14/14. Flaky red |
| gauntlet full + world, label `rev31-r30b` | world/pickup PASS, world/quests FAIL (not reached), world/glance PASS (invalid, see d), world/birds PASS. The other FAIL rows match the earlier baselines (boot/toControl 128 s under load, steer/buttons no setup, drive/near 0.5, hit/contact 2/5, drift/tap, wall/glance + headon script, mission/reach). Athens + portrait were still running at the timebox, so there is no REPORT.md |

## Not blocking (asked)
- **black-face**: still there. A big black face on the long green building left of the fra spawn, in all three garage shots. Not fixed; owner as in the handoff.
- **byteLength TypeError**: live beta.164 (`out/live164` from alex/brave-carson-rbpmlk), gauntlet `--only drive,hit` seed 7 (120 s game drive + 5 hit runs): **page/jsErrors 0**, so it did not show on live in that run. The full trunk run (rev31-r30b) had not reached its page/jsErrors row when the timebox ended (Athens + portrait still running), so I have no trunk count for comparison. That run is not proof either way, because the handoff saw it only on long drives. Live run rows: drive/pop 1 jump, hit/contact 2/5, drive/near 0.5 (all the same as trunk, so they are baseline).

## Ask for the worker (Sonnet, ~60 min)
1. world/camprop ath: decide what `bvL` 4.5 m instances are. If they are buildings, have the pull-in cover them and tag them 'bld' by the instance's own userData. If they are props, have FC hide them. Then 5/5 green runs.
2. Gauntlet world/glance: the bar must require closest ≤ 4 m. Fix the approach so it gets there.
3. Café cluster at the lens: hide it while the lens is there, then bring it back, as for grid props. Do not move it away for good. In FC_step, do not overwrite the t of START-hidden (`ms`) props.
4. Quest START x3 by real input: approach with brake pulses (GAS is on by default on touch) and a short route to the nearest quest. Look at the 3 START shots.
