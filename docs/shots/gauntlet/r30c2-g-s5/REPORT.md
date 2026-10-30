# Gauntlet r30c2-g-s5

2026-10-30T05:20Z · `node tools/gauntlet.js --build out/r30c2-g --ver r30c2-g-s5 --seed 5 --only drive,hit,ath` · 617 s wall · **6 FAIL** of 18 rows. How to read and extend: [docs/GAUNTLET.md](../../../GAUNTLET.md).

| row | what the player does | number | bar | result | shot |
|---|---|---|---|---|---|
| boot/playVisible | page open → PLAY button visible | 22.1 s lab | INFO (lab, software GL) | INFO | [fra_0_title.jpg](fra_0_title.jpg) |
| boot/toControl | PLAY tap → first control of the car | 125.7 s lab (6x CPU) | <= 8 s lab | **FAIL** | [fra_1_first_control.jpg](fra_1_first_control.jpg) |
| boot/menu | race menu never shows after PLAY (hr/boot) | 0 samples | 0 | PASS |  |
| boot/loader | loader never covers a controllable car (hr/boot) | 0 samples | 0 | PASS |  |
| hud/overControls | HUD text over the touch buttons (first control) | 0 overlaps | 0 | PASS | [fra_1_first_control.jpg](fra_1_first_control.jpg) |
| hud/minText | smallest visible text (first control) | 0 items < 12 px | 0 (CLAUDE.md: 12 px minimum) | PASS |  |
| drive/time | 2 min street drive, gas held, following streets | 120 s game, 2.33 km, avg 72 km/h | >= 110 s game and >= 1.0 km | PASS | [fra_2_street_at_speed.jpg](fra_2_street_at_speed.jpg) |
| drive/frustration | time under 10 km/h with GAS held | 4 % | <= 15 % (bughunt frustration limit) | PASS |  |
| drive/pop | traffic car pops on screen (in view, 6-60 m) | 0 jumps > 2 m, 0 appear < 40 m | 0 jumps > 2 m; 0 appear < 40 m | PASS |  |
| drive/onStreet | bot check: share of the drive on a street (a bot off the street makes the drive rows meaningless) | 67 % | >= 80 % (script validity) | **FAIL** |  |
| drive/near | traffic near the player (HITRUN_GAP gap 8) | 2.5 cars within 40 m (avg)<br><small>avg cars per frame by distance: <40 2.5, 40-80 4.5, 80-150 13.9, 150-300 17.3, >300 19.0; parked 4.9, dead 13.0; standing (<150 m, cv<1) 2.4; cars 75, hour 10.8, hourK 1.00, trHour 1; far(>240 m) cars</small> | >= 2.5 (hr/near) | **FAIL** |  |
| hit/contact | nose into 5 traffic cars ahead that close on me (oncoming/slower), GAS held in the last 18 m | 2/5 contacts<br><small>hit at 61.4 km/h, hit at 64.3 km/h, no car in front, no car in front, no car in front</small> | >= 4/5 (hr/hit: contact in >= 9/10) | **FAIL** | [fra_3_hit_1.jpg](fra_3_hit_1.jpg) |
| hit/react | hit car reacts: its HUB position velocity changes > 2 m/s within 0.3-1.2 s | 0/2 contacts<br><small>Δv 0 m/s, Δv 0 m/s</small> | INFO: this read misses thrown cars (shots show them tumbling); judge by the hit shots | INFO |  |
| hit/noBrake | our speed lost between 12 m and contact (no braking against nothing) | max -10 % | <= 5 % (HITRUN_GAP gap 1) | PASS |  |
| hud/overControls2 | HUD text over the touch buttons (later in roam) | 0 overlaps | 0 | PASS |  |
| ath/boot | Athens: PLAY → first control | 118.6 s lab, city ath | control, city ath | PASS | [ath_1_first_control.jpg](ath_1_first_control.jpg) |
| ath/drive | Athens: 60 s drive following streets | 60 s game, 1 % under 10 km/h, 1 pops | >= 55 s, <= 15 % slow, 0 pops | **FAIL** | [ath_2_drive.jpg](ath_2_drive.jpg) |
| ath/race | Athens: pause → QUIT → RACES → START reaches the grid | quit true races true start true grid true | grid reached | PASS | [ath_3_race_start.jpg](ath_3_race_start.jpg) |
| page/reload | page never reloads | 0 reloads | 0 | PASS |  |
| page/jsErrors | no JS errors (pageerror + console.error) | 1 errors<br><small>frame threw: TypeError: Cannot read properties of null (reading 'byteLength')</small> | 0 | **FAIL** |  |
| page/memory | JS heap high-water (performance.memory) | 78 MB | INFO (phone cap 700 MB process, NIGHTRUN_LOG) | INFO |  |
