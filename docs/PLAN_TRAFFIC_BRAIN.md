# PLAN · one traffic brain (gap 3 of docs/WHY_NOT_2K.md; unblocks L2 car hits in docs/PLAN_CORE_LOOP.md)

Lane traffic-brain-plan-r22d8, 2026-10-21. Design only, no code. Line numbers are on trunk `57d31cb`.

## 1. What Alex sees, and why

- **Invisible / pass-through cars.** On phones an undrawn car is not solid (`NC_hid`, src/98nc_npc_collide.js:27: pose-cull slot < 0 means no contact). The pose cull and the contact test use different rules, so a car you can nearly see is air. Cars longer than 5.2 m (bus, truck, van) are skipped by the collide pick (`NC_pick` :36, `OB_cdim(c.k)[1]>2.6`), and `HT_hit` (src/70_roam_world.js:165) only tests cars whose centre is < 5 m away, which misses a bus end or a corner.
- **Sideways dodges and overlaps.** Five modules move a car sideways for different reasons, and two of them add on top of each other after the smoother: yield `c.yo` (98ayd), the life-3 lane change `c.l3s` (98l3), the bump shove `c.lane` (95_drive_flow W10_bump), the lane clamp `c.lane` (98ct) and the HT_lat residual (70). The NC rate cap (98nc:32) clips the result *after* the fact, so the car still moves, just more slowly.
- **Not solid.** Speed has 7 writers (below). There is no single "leader" per car: follow distance is enforced only at junctions (CV), at edge hand-off (`HT_blocked`, 3 s cap then it goes anyway) and behind dead-end queues. Mid-edge, two cars in the same lane can close up and overlap, and the player is a "leader" only within 9 m of a probe point (`HT_speed` :116).

## 2. Who writes a traffic car each frame (HUB.cars, Frankfurt + Athens roam)

Call order: `hubTrafficStep` (70:90) is wrapped 12 times, in load order (the last is outermost): 80_story_m1:421, 90_fixes_cv_ju:328 (CV_pre/CV_post), 95_drive_flow:122, 98ayd_yield:27, 98bp_warmall:237, 98ct_city_lego:50, 98l3_life3:93, 98qs_speed:59, 98rb_roam_budget:15, 98rd_roads:55 + :77, 98tr_terrain:130. The core then runs `HT_cars` (70:97), and per car `HT_car` (70:110) → `HT_speed` (:116) → `c.t += c.cv·dt/L` → `HT_next` → `HT_pose` (:157) → `HT_hit` (:165) → `HT_smash` / `W10_bump` (:167).

| field | writers (file:line) | what for |
|---|---|---|
| `c.v` (target speed) | 98qs_speed:56 (class speed, city/Autobahn), 90_fixes_cv_ju:314 (CV light/junction cap, restored in CV_post), 98l3_life3:52 (stop-line guard, restored :94), 98rd_roads:53 (pedestrian hold = 0), 98l_lively:219 (parked), 90:473 (test freeze) | 4 caps that each save and restore `c.v`: the last one to restore wins |
| `c.cv` (actual speed) | 70:116 HT_speed (ease to target, player ahead), 70:110 (dead-end queue = 0), 90:314, 98l3:52, 98rd:53, 98ayd:8/19/21 (brake while dodging), 98nc:32/43 (brake when the dodge is capped), 95_drive_flow:147 (bump momentum) | 8 writers, no arbitration |
| `c.t`, `c.a/b` (along the edge) | 70:110 (integrate), 70:106 HT_blocked (hold at node), 98rd_roads:72 RD_unstack, 98qs, 98bp, 98sp, 99cl_loop (spawn density) | position along the road |
| lateral (`c.lane`, `c.l3s`, `c.yo`, HT_lat `c.lrx/lrz`) | 98l3_life3:20 L3_tick (lane change), 98ayd:7 AYD_pre (`c.yo` dodge), 95_drive_flow:142 W10_bump (shove), 95:124 (reset to .36), 98ct_city_lego:54 (wide-car clamp every frame), 98nc:19/32 (rate caps), 70:134 HT_laneOff + HT_lat residual | **5 sideways sources**, the main cause of the "switch" |
| alive / hit | 70:167 HT_smash, 98nc NC_jam (knock away), 10_core3:145 (`hitT` on every car < 40 m), 98of_onfoot (4×), 85_audio_feel_sp_otg (3× dead), 70:101 HT_dead respawn + HT_canPop pop rules (60_city_build6:172/176) | hit-stop, tumble, respawn |

Not traffic writers (checked, leave alone): `CTB_step` (98ct:123) instances building bricks; `CR_npcPush` (93_cars_lego:378) pushes race/story NPC groups (`CR_NPCS`), not HUB.cars; 99ctl_traffic_law / 99ctf_traffic_go / 99c9_collide are GO asserts only.

**Conflicts that cause the complaints**
1. Lateral: `c.yo` (dodge) + `c.l3s` (lane change) + W10 shove + 98ct clamp are summed in HT_pose; each module has its own easing and the NC cap trims the sum. Result: a car slides 1.5-2.4 m/s away from the player (r22c measure), which reads as dodging.
2. Speed: four modules save `c.v`, cap it and restore it in different wrapper layers; when two caps overlap, the restore order decides the speed. `c.cv` is written after HT_speed by three modules, so the brake a car "decided" can be overwritten in the same frame.
3. Solidity: contact uses the pose-cull slot (NC_hid) and a 5 m centre gate; collide pick skips anything > 5.2 m; the respawn rules (HT_canPop/HT_spotTaken) are a third notion of "is it there".
4. No mid-edge gap keeping: rear-end overlaps are prevented only at node hand-off and at junctions.

## 3. How the good ones do it (reference)

LEGO 2K Drive's open world and GTA-style ambient traffic share four rules: (a) a car is on a **lane spline** and never leaves it unless it is hit (no evasive swerve; the player is the one who swerves); (b) each car follows **one leader** (car, stop line, or the player) with a time gap, so queues form and never overlap; (c) the player gets a **reaction, not an escape**: brake, honk, flash lights, wait, then carry on; (d) on contact the car is a **physics body for a moment** (shoved, spun, in 2K Drive it bursts into bricks above a speed) and then either recovers onto its lane or is removed out of sight. Bigger vehicles are equally solid and heavier. Spawning/despawning happens only out of view.

## 4. The brain (one module, one owner of every car field)

New file `src/98tb_traffic_brain.js`, flag `TB.on` (default OFF, `?tb=1` on, later `?tb=0` off). When on, it **replaces** the per-car body of `HT_car` (speed, lane, hit) and the wrappers above become no-ops for traffic cars (each gets `if(TB.on)return f.apply(...)` or is deleted in its lane). Per car, once per frame, in this order:

1. **Sense (shared grid).** One 16 m spatial hash per frame (reuse `CV.G` from 90_fixes_cv_ju, it already exists) holding live cars + the player. Each car looks only at its own lane ahead, 40 m max.
2. **Pick ONE leader.** The nearest of: car ahead in the same lane (or on the next edge it already peeked, `HT_peek`), the stop line from CV signal state (`CV_st`, read only), a pedestrian on the crossing (RD rule, read only), or the player if the player's box is inside the lane corridor ahead. Store `c.ld` (kind + gap in metres).
3. **Speed = IDM.** Intelligent Driver Model, one formula for every case: desired speed `c.v` (QS class speed, the *only* `c.v` writer), time headway 1.2 s, min gap 2 m + half lengths, comfortable brake 3 m/s², hard brake 8 m/s². Writes `c.cv` once. Lights, peds, queues and the player are just leaders, so the four save/restore caps go away.
4. **Lane.** A car has an integer lane (`c.ln`: 0 = right, 1 = left on 2-lane-per-direction roads, from HT_laneOff geometry). It changes lane only (a) to take its turn at the next junction, or (b) to pass a car that has been slower than 60 % of its desired speed for 3 s, and only if the target gap is free (reuse `L3_free`). Change = a 2.5 s cubic slide, max 1.5 m/s sideways. **Never because of the player.** `c.yo`, the bump shove and the 98ct per-frame clamp are gone (the clamp becomes a one-time lane offset at spawn for wide cars).
5. **React to the player.** When the player is the leader within 25 m: brake (IDM does it), honk once (`AU.sfx('horn')`, 4 s cooldown, max 2 honks per 10 s city-wide), flash brake lights (CV blinker mesh). When the player is stopped across the lane > 4 s: the car waits; on a 2-lane road it may change lane by rule 4b. It never swerves out of the player's path.
6. **Contact (solid, size-true).** Contact is an OBB-vs-OBB test against the drawn size (`OB_cdim` clamped to geometry, r22c) for **every** car whose bounding circle can touch the player (radius = half-diagonal, so buses and trucks are included; drop the 5 m gate and the 5.2 m skip). Draw state does not matter: a car that exists is solid; instead the pose cull must never hide a car within 30 m of the player (Lane B4). On contact:
   - mass ratio from size class (scooter 0.3, car 1, van 1.6, truck/bus 3); the player gets the NC_mtv push-out (keep `NC_mtv`/`NC_sep`) and an impulse split by mass;
   - below smash speed: the car enters **knocked** state for 1.2 s: it moves as a rigid body (velocity + yaw rate from the impulse, friction 6 m/s²), off its lane; then it eases back onto the nearest lane point at ≤ 1 m/s, or if it is > 3 m off the road it waits and despawns out of sight;
   - above smash speed (core zone `?cl` / `CL_CORE`: 30 km/h for cars, 45 for trucks/buses; outside 45): brick burst (`TR_smashFx`, `CR_tumble`), hit-stop 50 ms, studs, player loses ≤ 30 % speed (L2 numbers), car → dead → respawn out of sight (HT_dead, unchanged).
   - NPC vs NPC: only the leader rule prevents overlap; in knocked state a car also tests the 8 nearest cars and pushes them (same OBB code, no chain beyond depth 1).
7. **Spawn/despawn.** Keep HT_dead/HT_place/HT_canPop/HT_spotTaken as the only spawn rules (they work, GO traffic/law). The brain adds one rule: never despawn a car the player can see within 60 m.

**Perf budget (6x CPU phone, perf/ios-reveal must stay green):** brain ≤ 1.0 ms/frame for 150 cars on a 6x throttle (today's HT_cars + wrappers measured cost is the baseline; the brain must be ≤ it, since it deletes 6 wrapper passes over HUB.cars). Rules: one grid build per frame, O(cars × ~6 neighbours); far cars (> 120 m) keep the r13a LOD (every 4th frame, summed dt, IDM still valid with big dt because it is clamped); OBB tests only for cars within half-diagonal + 6 m of the player (≤ 6 per frame typical); no allocations in the loop (preallocated scratch arrays, no `filter`/closures: HT_nx uses `filter` today, rewrite it as a loop).

## 5. Build lanes (all SONNET, one deliverable each, flag `TB.on` default OFF until lane B5)

Each lane: build with tools/build.sh, unit 0 FAIL, its TAG + `TAG=life1,xf1,terrain` on the built page; one 852×393 shot in `docs/shots/tb<n>/` and LOOK at it. GO asserts go in src/99c_checklist.js (or 98tb's own `C.GO` block) with a pass line, Frankfurt + Athens.

**B1 · brain skeleton + IDM speed** (`?tb=1`)
- Deliverable: src/98tb_traffic_brain.js with sense (shared grid), single leader pick, IDM speed; HT_car calls `TB_car` when `TB.on`; QS stays the only `c.v` writer.
- Files: new 98tb_traffic_brain.js, 70_roam_world.js (HT_car/HT_speed hook, HT_nx loop rewrite), tools build list.
- GO `why/tb-follow`: 60 s fixed-dt sim on the busiest cluster: 0 frames with two same-lane cars' OBBs overlapping; min bumper gap ≥ 1.5 m; ≥ 90 % of cars stopped at red stop lines (reuse L3_audit counts); `c.cv` written once per car per frame (debug counter).
- Shot: a queue of 4+ cars at a Frankfurt red light, evenly spaced.
- Deletes (behind `TB.on`, the code itself is deleted in B5): HT_speed, the CV_pre `c.v` cap (90:314) and its CV_post restore, L3_guard speed cap (98l3:52/:94), RD ped hold (98rd:53 → becomes a leader), HT_blocked 3 s hold.

**B2 · one lane model, no dodging**
- Deliverable: integer lane `c.ln` + rule-based lane change (turn side, pass slow car), one lateral writer.
- Files: 98tb_traffic_brain.js, 70_roam_world.js (HT_laneOff reads `c.ln`), 98ayd_yield.js, 98l3_life3.js (L3_tick lane part), 98ct_city_lego.js:50-54, 95_drive_flow.js:124/142.
- GO `why/tb-nododge` = the gap-3 metric: ghost player drives at 30/60/100 km/h behind and beside traffic for 60 s: 0 lane changes caused by the player within 20 m; max lateral speed of any car ≤ 1.5 m/s; 0 cars off-road (reuse TLW_measure off-road counter).
- Shot: player 10 m behind a car on a 2-lane Frankfurt street, car still in lane, brake lights on.
- Deletes: 98ayd_yield.js (whole file), L3_yieldP/L3_blocks/L3_tick lane code, the W10_bump `c.lane` shove, the 98ct per-frame clamp (spawn-time offset instead), the NC `c.yo` rate cap (98nc:32).

**B3 · solid contact, all sizes**
- Deliverable: one contact pass (OBB, mass ratio, knocked state, recover-or-despawn) for every car incl. bus/truck/van; existence = solid.
- Files: 98tb_traffic_brain.js, 98nc_npc_collide.js (keep NC_mtv/NC_sep, delete the rest), 70_roam_world.js:165-167 (HT_hit/W10_bump call), 95_drive_flow.js W10_bump.
- GO `why/npc-hit` (from WHY_NOT_2K gap 3): nose-in at 10-40 km/h into a car, a van, a bus and a truck: contact within 1.5 s in 16/16; 0 frames with player-vs-car overlap > 0.05 m; knocked car back in lane or despawned out of sight within 4 s; 0 NPC-vs-NPC overlaps after a knock.
- Shot: the player's car nosed into the side of a bus, bus shoved half a metre, bricks on the road.
- Deletes: NC_pick 5.2 m skip, NC_hid (undrawn ≠ air), the 5 m centre gate in HT_hit, W10_bump's speed/lane writes (95:142-149), NC_jam.

**B4 · player reaction + core-zone smash**
- Deliverable: honk / brake-light / wait reaction; L2 car smash thresholds in `CL_CORE` (30 km/h car, 45 truck/bus) with ≥ 20 bricks, ≥ 3 studs, 50 ms hit-stop, speed loss ≤ 30 %; pose cull never hides a car within 30 m of the player.
- Files: 98tb_traffic_brain.js, 99cl_loop.js (core thresholds), 98sm2_smash2.js (call into the brain's contact), the pose-cull pool (PC) keep-near rule.
- GO `why/tb-react`: a car with the player stopped across its lane brakes to 0 ≥ 3 m short, honks ≤ 2× in 10 s, never changes lane within 20 m of the player; GO `why/car-smash` in `?cl`: 30 km/h into a car = burst with the L2 numbers, 20 km/h = knock only.
- Shot: core-zone smash at Paulsplatz, brick burst and stud trail mid-frame.
- Deletes: 10_core3:145 blanket `hitT` on all cars < 40 m, the HT_speed 9 m probe (already off in B1).

**B5 · flip ON + cleanup + perf proof**
- Deliverable: `TB.on` default ON (`?tb=0` off for one deploy), delete the dead branches, perf proof.
- Files: everything above; changelog.
- GO: all of the above + existing traffic/law, traffic/behaviour, collide/slow-pass, rv2k2/close bot, perf/traffic-hitch, perf/roam-budget; perf/ios-reveal green; `why/tb-perf`: brain ms/frame on 6x throttle ≤ the B0 baseline recorded in B1.
- Shot: a busy Frankfurt street at 852×393 next to a LEGO 2K Drive reference shot (side-by-side, per rule 4).
- Deletes: the `!TB.on` paths left in 70/90/95/98ayd/98l3/98ct/98nc/98rd, and the wrapper layers that only touched traffic (98ayd:27, 98ct:50, the traffic half of 98l3:93 and 90:328).

Order: B1 → B2 → B3 (B3 can start after B1 if B2 is in review) → B4 → B5. Two lanes per target (rule 9): if B3 fails twice, the contact half goes back to design.

## 6. Risks
- rv2k2/close (Westend bot) DNF'd when cars stopped yielding by lane change (98ayd note). The bot must brake for traffic like the player; B2 owns fixing the bot's follow logic, not keeping the dodge.
- CV junction logic is large and works; the brain only **reads** its signal state. Do not rewrite CV.
- Athens streets < 14 m have one lane: lane change never fires there, passing does not exist, queues just wait (that is correct).
