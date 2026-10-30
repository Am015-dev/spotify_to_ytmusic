# Gauntlet r30c2-d

2026-10-30T04:36Z · `node tools/gauntlet.js --build out/r30c2-d --ver r30c2-d --only drive,hit` · 247 s wall · **4 FAIL** of 15 rows. How to read and extend: [docs/GAUNTLET.md](../../../GAUNTLET.md).

| row | what the player does | number | bar | result | shot |
|---|---|---|---|---|---|
| boot/playVisible | page open → PLAY button visible | 18.0 s lab | INFO (lab, software GL) | INFO | [fra_0_title.jpg](fra_0_title.jpg) |
| boot/toControl | PLAY tap → first control of the car | 90.1 s lab (6x CPU) | <= 8 s lab | **FAIL** | [fra_1_first_control.jpg](fra_1_first_control.jpg) |
| boot/menu | race menu never shows after PLAY (hr/boot) | 0 samples | 0 | PASS |  |
| boot/loader | loader never covers a controllable car (hr/boot) | 0 samples | 0 | PASS |  |
| hud/overControls | HUD text over the touch buttons (first control) | 0 overlaps | 0 | PASS | [fra_1_first_control.jpg](fra_1_first_control.jpg) |
| hud/minText | smallest visible text (first control) | 0 items < 12 px | 0 (CLAUDE.md: 12 px minimum) | PASS |  |
| drive/time | 2 min street drive, gas held, following streets | 120 s game, 1.84 km, avg 56 km/h | >= 110 s game and >= 1.0 km | PASS | [fra_2_street_at_speed.jpg](fra_2_street_at_speed.jpg) |
| drive/frustration | time under 10 km/h with GAS held | 4 % | <= 15 % (bughunt frustration limit) | PASS |  |
| drive/pop | traffic car pops on screen (in view, 6-60 m) | 4 jumps > 2 m, 0 appear < 40 m<br><small>jump 7.9m@8m T27.2 (k3 61>62@0.01 -> 61>62@0.01 cv10.5); jump 8.2m@8m T89.1 (k7 19>18@0.80 -> 18>19@0.00 cv16.0); jump 12.4m@8m T89.9 (k7 19>18@0.57 -> 19>18@0.65 cv4.5)</small> | 0 jumps > 2 m; 0 appear < 40 m | **FAIL** |  |
| drive/onStreet | bot check: share of the drive on a street (a bot off the street makes the drive rows meaningless) | 76 % | >= 80 % (script validity) | **FAIL** |  |
| drive/near | traffic near the player (HITRUN_GAP gap 8) | 2.5 cars within 40 m (avg)<br><small>avg cars per frame by distance: <40 2.5, 40-80 4.3, 80-150 14.0, 150-300 23.4, >300 13.4; parked 4.8, dead 12.7; standing (<150 m, cv<1) 3.3; cars 75, hour 10.8, hourK 1.00, trHour 1; far(>240 m) cars</small> | >= 2.5 (hr/near) | PASS |  |
| hit/contact | nose into 5 traffic cars ahead that close on me (oncoming/slower), GAS held in the last 18 m | 3/5 contacts<br><small>target vanished at 7.84 m, hit at 62.8 km/h, miss, closest 29 m, hit at 60.4 km/h, hit at 60.8 km/h</small> | >= 4/5 (hr/hit: contact in >= 9/10) | **FAIL** | [fra_3_hit_2.jpg](fra_3_hit_2.jpg) |
| hit/react | hit car reacts: its HUB position velocity changes > 2 m/s within 0.3-1.2 s | 0/3 contacts<br><small>Δv 0 m/s, Δv 0 m/s, Δv 0 m/s</small> | INFO: this read misses thrown cars (shots show them tumbling); judge by the hit shots | INFO |  |
| hit/noBrake | our speed lost between 12 m and contact (no braking against nothing) | max -12 % | <= 5 % (HITRUN_GAP gap 1) | PASS |  |
| hud/overControls2 | HUD text over the touch buttons (later in roam) | 0 overlaps | 0 | PASS |  |
| page/reload | page never reloads | 0 reloads | 0 | PASS |  |
| page/jsErrors | no JS errors (pageerror + console.error) | 0 errors | 0 | PASS |  |
| page/memory | JS heap high-water (performance.memory) | 26 MB | INFO (phone cap 700 MB process, NIGHTRUN_LOG) | INFO |  |
