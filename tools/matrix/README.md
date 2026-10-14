# tools/matrix: generated player-experience matrix (no real-time play)
`node tools/matrix/run.js --quick` (≈2.3k cases, ~3.5 min on 4 cores) · `--full` (≈20k cases, ~16 min on 4 cores, 6 warm pages: fra/ath × phone 852×393 / portrait 393×852 / desktop 1280×720).
Flags: `--city fra,ath --profiles phone,portrait,desktop --rides N|--ids a,b --starts N --fam builder,roam,spot,foot,race --jobs 4`.
One warm page per (city, profile) from tools/hot.js's server (current src, no build). The game's rAF loop is stopped; `MX.frame()` runs one real frame when a check needs the DOM. State checks run in 10-50 ms each.
Output: one `FAIL <check>: <n> cases · e.g. …` line per root cause, console errors, then `MATRIX OK|FAIL: cases · failing · root causes · errors · seconds`; raw rows in out/matrix/matrix.json. Exit 1 on any FAIL.
- builder (track × ride × profile): spawn heading vs path, DRAWN car faces travel direction (ride front = local -z, as roam), camera behind, 2 s gas: progress > 5 m, no reverse, grounded, no respawn, HUD pad.
- roam / spot (every street start from a 150 m grid + every quest spot/taxi/garage/landmark): heading vs road, not in a wall, above ground, tyre gap ≤ 5 cm, visual facing, camera behind, 1 in 60: 1.5 s gas progress, HUD per profile.
- foot (get out of the car): walking, figure 1.80 m ±3 %, on ground, not in wall, parked car tyres, walk progress, camera behind.
- race (each city track): countdown reached, race HUD, ≥ 6 ships, 2.5 s of sim: progress, no wrong-way flag, drawn car faces travel, camera behind, rivals ≥ 5 moving.
Caught on beta.22 and HEAD: **bx-visual-facing** (every builder track × ride): BX_car poses the ride with +z as front, rides have their front on -z → drawn 180° backwards.
Known limits: not covered yet: story missions, garage-exit / respawn starts, tyre gap on the race grid. Roam far-out Athens starts (camera 0.8 m behind the car) and ~4 % of Frankfurt starts inside a collider are real findings of the current data.
