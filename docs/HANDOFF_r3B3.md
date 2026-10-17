# HANDOFF r3B3 (2026-10-17): Athens pace + repeatable jam/pace GO
1. Cause: road-follow aimed at the nearest street point, ped streets included; at the Ermou/Athinas hub it cut the corner into the Ermou/Mitropoleos/Kapnikareas/Aiolou pedestrian maze (dead ends, 0 km/h at (1640,-1571)). Mitropoleos (ped) also dead-ended 40 m short of the hub.
2. Data: athNetLink() (51_city_net.js) ties Mitropoleos' east end to the Ermou/Athinas hub key. cityAt(x,z,skip,np) can skip ped; rfSnap prefers drivable streets (ped only as fallback); new rfAim() (70_roam_world.js) aims 14 m along the street and moves on to the next street at a street end.
3. (c) Speed caps: none found that bite; on avenues (Athinas, 3is Septemvriou, Marni) the car reaches 130-170 km/h, so no limiter was relaxed.
4. GO: pace/jam now run 3 times from the same start and judge the MEDIAN (all three printed), secs:200 budget. Athens median pace ~105, jam ~100; Frankfurt pace ~117, jam ~108.
5. Left: ped streets are still drivable for players (dead ends Aiolou (1644,-1574) etc. remain); 99c_checklist.js is 204 KB (limit 204.8 KB).
