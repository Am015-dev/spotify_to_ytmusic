# HANDOFF W260 (flight gauntlet)
Done: `qa/gauntlet-flight.js` (controls probe, 4 strategies x phone/PC, seeded, UI audit, HUD check, perf sample). Table: GAUNTLET-FLIGHT-2026-10-29.md.
Not done: the 8-seed sweep through stages 1-10 + boss (too slow here, OPEN-1). No game code changed.
Next (sonnet): reduce cost per tick (decide every 8 frames, one browser at a time, PAR 1), run SEEDS=8 on phone first, view the shots, fix what real runs find.
Gate for ship: min stage reached >= 10 and boss killed for dodger/shooter on both devices, 0 errors/rejections, 0 stuck, 0 UI defects.
