# HANDOFF race-1 (2026-10-14)
- Race: auto-steer feed-forward fades to 30 % after 2.5 s hands-off (30_race2.js idF); player pinned/backwards 2.5 s is reset on the road; DNF 40 s after first rival finishes or at 235 s (30_race3.js). Hands-off rival race now ends 2nd (was 1st ★★★).
- Walls: glancing < 32 km/h = sparks only, per-hit cap 12 %, 1.2 s i-frames, terrain banks cost no health, clipped traffic free, head-on smash flat 4 % (98dmg_damage.js). Road-follow 60 s Fra: 7/min -> 0/min, lowest health 96. Flags: TUNE.dmgGlance/dmgCap/dmgInv/terrDmg/smashDmg.
- Stuck: roamHit ignores colliders < 1.3 m (TUNE.lowProp); 2 s stuck hops to nearest clear spot (TUNE.nudge). rv2k/stuck Fra spot passes (5.0 m / 1.2 s). Monkey rerun (<= 0.3/min) NOT measured; Athens road-follow NOT measured.
- Tests: unit 0 FAIL; life1/xf1/terrain 35/36 (life1/ath-density = known load CPU line). Long GOs need a fake-clock driver (real clock too slow in software GL); the race GO had a bug (iv.r on a number) fixed in 99c_checklist.js.
- Left: monkey stuck rerun, Athens walls, remaining rv2k items (objectives, devui, garage, drawer, foliage, card) are other lanes.
