# NPC collide (npc-collide-r22c, 2026-10-21)

Alex, beta.142: "cars of NPC I can pass through when slow; they move like switches away from me".

## Repro (no graphics, real roamStep at dt 1/60)
`__nc.go('col')` / GO `collide/slow-pass`: the player drives at 10 and 25 km/h into a stopped NPC car from behind, the side and head-on.
Before (`?npccol=0`): Frankfurt 244 and Athens 144 frames with the boxes > 0.25 m inside each other, up to 2.6 m deep (side 10 km/h: straight through).

## Root causes
1. **No separation below smash speed.** `W10_bump` (95_drive_flow.js) only trades momentum. Nothing pushes the two boxes apart, and smash-2 (98sm2_smash2.js) gives the player back 85 % of the speed the bump took. With the gas held, the player keeps driving into the car.
2. **5 m centre gate.** `HT_hit` only tested cars whose centres are less than 5 m apart. A corner touch of two 4.8 m cars happens at 5.4 m, and the ends of buses, trucks and vans were never tested.
3. **Sideways snaps.** (a) A side bump in W10_bump shoves the NPC's `c.lane` by 0.13-0.5 m per frame, 7-30 m/s sideways (Athens GO: 27 m/s). (b) The 98ayd yield (c.yo) eases up to 3.9 m sideways at a rate of 6/s, about 20 m/s sideways at its start, right in front of the player. This is the "switches away" effect. Smashed cars tumbling away (L3_jam: gas held against a car for > 1.2 s) are on purpose and were not changed.

## Fix (98nc_npc_collide.js, `NC.on`, `?npccol=0` turns it off)
- After a below-smash bump the player is pushed out along the minimum-overlap axis (by at most 1.2 m, and never into a building: roamHit). The player's speed into the car is cut to the car's own speed along that axis.
- The contact test now covers every car whose boxes can touch (half-length plus half-width of both).
- The side shove (c.lane) and c.yo each change by at most 2.4 m/s (the traffic/behaviour limit is 2.5). Within 15 m of the player the cap is 1.5 m/s, so with the lane smoother (0.9 m/s) the total stays at or below 3 m/s. A dodging car ahead of a closing player that gets capped brakes instead.
- Jam release: a real block could wedge the player, and the bot's stuck detector fires after 1 s. Gas held against a car under 15 km/h for 0.7 s now knocks the car away (smash fx). W10_pin and L3_jam were meant to do this, but neither fires while driving (DMG is on, and RO.foot is 'car').

## Result
After the fix: 0 overlap frames in all 12 approaches (both cities). The NPC's sideways speed within 6 m of the player is at most 1.5-2.4 m/s (it was 27-40 m/s from the side shove).
At speed, 150 s TLW_measure (one run per city, before -> after): cars into the player Frankfurt 2 -> 1 and Athens 6 -> 5; kerb car-frames 1025 -> 646 and 0 -> 1; pass-through pairs 113 -> 59 and 135 -> 119. These were measured with a 3 m/s cap; the final cap is 2.4 m/s, and traffic/law still passes in both cities with it.
Gate failures that are already on trunk (base build, same TAG): ctb/collide, traffic/fit (both cities), Athens bot/nav#1. Chain flakes that pass solo: xf1/slope and terr SLOW (timing), xf1/grass, Frankfurt bot/nav max step.

## Left
- The NPC box uses the edge direction, not the pose heading on corner curves (c.hdx/hdz). This is a small error on curves.
- Smash-2 still keeps 85 % of the player's speed in a bump. The separation now stops the pass-through, but bumping still feels light. That is a feel call for Alex's review.

## Invisible cars (Alex, same lane): hitting something where no car is drawn
Checked (headless, both cities):
- Traffic cars solid while not drawn (mesh missing, hidden parent, j >= count, scale 0, matrix off): 0 of 88 nearby cars, and 0 of 102 contacts during a 120 s ghost drive.
- Static NPC cars (CR_NPCS): none exist in roam.
- Phone-tier perf-5 compaction (98pc_compact, quality low/min): it re-packs which traffic instances are drawn every 10 frames. Within 40 m of the player, 0 undrawn cars in 3,600 frames per city, because its 60 m keep radius covers that range.
**Root cause: the boxes are bigger than the drawn car.** Scooter 1.0 x 2.2 m vs drawn 0.61 x 1.46; su:* cars 2.3 x 4.8 vs 2.0 x 4.0; bus 12 vs 10.3 m long; truck 2.6 vs 2.1 m wide. Now that a bump really blocks, the player stopped 0.4-0.9 m short of the visible car, which looks like hitting air.
Fix: CT_dim (read by OB_cdim) clamps each kind's box to its drawn geometry (+5 cm). It never grows a box, and it re-reads the geometry when a lazy model swaps in. On phones, a traffic car with no draw slot is not solid (visible = solid).
GO collide/npc-box: kinds with a box > 0.1 m outside the drawn car went from 4 to 0 in Frankfurt and from 4 to 0 in Athens.
