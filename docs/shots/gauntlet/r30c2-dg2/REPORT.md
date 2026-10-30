# Gauntlet r30c2-dg2

2026-10-30T04:43Z · `node tools/gauntlet.js --build out/r30c2-dg --ver r30c2-dg2 --only drive,hit` · 237 s wall · **2 FAIL** of 15 rows. How to read and extend: [docs/GAUNTLET.md](../../../GAUNTLET.md).

| row | what the player does | number | bar | result | shot |
|---|---|---|---|---|---|
| boot/playVisible | page open → PLAY button visible | 16.9 s lab | INFO (lab, software GL) | INFO | [fra_0_title.jpg](fra_0_title.jpg) |
| boot/toControl | PLAY tap → first control of the car | 98.6 s lab (6x CPU) | <= 8 s lab | **FAIL** | [fra_1_first_control.jpg](fra_1_first_control.jpg) |
| boot/menu | race menu never shows after PLAY (hr/boot) | 0 samples | 0 | PASS |  |
| boot/loader | loader never covers a controllable car (hr/boot) | 0 samples | 0 | PASS |  |
| hud/overControls | HUD text over the touch buttons (first control) | 0 overlaps | 0 | PASS | [fra_1_first_control.jpg](fra_1_first_control.jpg) |
| hud/minText | smallest visible text (first control) | 0 items < 12 px | 0 (CLAUDE.md: 12 px minimum) | PASS |  |
| drive/time | 2 min street drive, gas held, following streets | 120 s game, 1.49 km, avg 45 km/h | >= 110 s game and >= 1.0 km | PASS | [fra_2_street_at_speed.jpg](fra_2_street_at_speed.jpg) |
| drive/frustration | time under 10 km/h with GAS held | 5 % | <= 15 % (bughunt frustration limit) | PASS |  |
| drive/pop | traffic car pops on screen (in view, 6-60 m) | 1 jumps > 2 m, 0 appear < 40 m<br><small>jump 7.7m@8m T118.4 (k5 63>64@1.00 -> 64>731@0.00 cv10.4 w:x7.5 HT_pose<http://127.0.0.1:42127/index.html:16701:205<http://127.0.0.1:42127/index.html:17662:140<http://127.0.0.1:42127/index.html:17704:</small> | 0 jumps > 2 m; 0 appear < 40 m | **FAIL** |  |
| drive/onStreet | bot check: share of the drive on a street (a bot off the street makes the drive rows meaningless) | 94 % | >= 80 % (script validity) | PASS |  |
| drive/near | traffic near the player (HITRUN_GAP gap 8) | 5.2 cars within 40 m (avg)<br><small>avg cars per frame by distance: <40 5.2, 40-80 7.1, 80-150 18.7, 150-300 16.2, >300 10.6; parked 4.6, dead 12.6; standing (<150 m, cv<1) 7.9; cars 75, hour 10.8, hourK 1.00, trHour 1; far(>240 m) cars</small> | >= 2.5 (hr/near) | PASS |  |
| hit/contact | nose into 5 traffic cars ahead that close on me (oncoming/slower), GAS held in the last 18 m | 5/5 contacts<br><small>hit at 55.5 km/h, hit at 52.2 km/h, hit at 63.4 km/h, hit at 52.5 km/h, hit at 60.2 km/h</small> | >= 4/5 (hr/hit: contact in >= 9/10) | PASS | [fra_3_hit_2.jpg](fra_3_hit_2.jpg) |
| hit/react | hit car reacts: its HUB position velocity changes > 2 m/s within 0.3-1.2 s | 1/5 contacts<br><small>Δv 140 m/s, Δv 0 m/s, Δv 0 m/s, Δv 0 m/s, Δv 1.9 m/s</small> | INFO: this read misses thrown cars (shots show them tumbling); judge by the hit shots | INFO |  |
| hit/noBrake | our speed lost between 12 m and contact (no braking against nothing) | max 4 % | <= 5 % (HITRUN_GAP gap 1) | PASS |  |
| hud/overControls2 | HUD text over the touch buttons (later in roam) | 0 overlaps | 0 | PASS |  |
| page/reload | page never reloads | 0 reloads | 0 | PASS |  |
| page/jsErrors | no JS errors (pageerror + console.error) | 0 errors | 0 | PASS |  |
| page/memory | JS heap high-water (performance.memory) | 20 MB | INFO (phone cap 700 MB process, NIGHTRUN_LOG) | INFO |  |
