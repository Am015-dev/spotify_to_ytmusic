# Gauntlet rev30-probe-old

2026-10-30T06:24Z · `node tools/gauntlet.js --url http://127.0.0.1:8812/index.html?latsplit=0 --ver rev30-probe-old --seed 11 --only drive,ath` · 1330 s wall · **3 FAIL** of 16 rows. How to read and extend: [docs/GAUNTLET.md](../../../GAUNTLET.md).

| row | what the player does | number | bar | result | shot |
|---|---|---|---|---|---|
| boot/playVisible | page open → PLAY button visible | 61.9 s lab | INFO (lab, software GL) | INFO | [fra_0_title.jpg](fra_0_title.jpg) |
| boot/toControl | PLAY tap → first control of the car | 312.8 s lab (6x CPU) | <= 8 s lab | **FAIL** | [fra_1_first_control.jpg](fra_1_first_control.jpg) |
| boot/menu | race menu never shows after PLAY (hr/boot) | 0 samples | 0 | PASS |  |
| boot/loader | loader never covers a controllable car (hr/boot) | 0 samples | 0 | PASS |  |
| hud/overControls | HUD text over the touch buttons (first control) | 0 overlaps | 0 | PASS | [fra_1_first_control.jpg](fra_1_first_control.jpg) |
| hud/minText | smallest visible text (first control) | 0 items < 12 px | 0 (CLAUDE.md: 12 px minimum) | PASS |  |
| drive/time | 2 min street drive, gas held, following streets | 120 s game, 2.18 km, avg 65 km/h | >= 110 s game and >= 1.0 km | PASS | [fra_2_street_at_speed.jpg](fra_2_street_at_speed.jpg) |
| drive/frustration | time under 10 km/h with GAS held | 4 % | <= 15 % (bughunt frustration limit) | PASS |  |
| drive/pop | traffic car pops on screen (in view, 6-60 m) | 0 jumps > 2 m, 0 appear < 40 m | 0 jumps > 2 m; 0 appear < 40 m | PASS |  |
| rev/latres | REVIEW probe: sideways HT_LAT residual on in-view cars 6-60 m | n 3015 >1m 14.3% >2m 7.4% >4m 1.29% max 5.17 m (k9 120>119@0.00 d7 T25.8) long>3s 0 | INFO | INFO |  |
| drive/onStreet | bot check: share of the drive on a street (a bot off the street makes the drive rows meaningless) | 55 % | >= 80 % (script validity) | **FAIL** |  |
| drive/near | traffic near the player (HITRUN_GAP gap 8) | 0.9 cars within 40 m (avg)<br><small>avg cars per frame by distance: <40 0.9, 40-80 1.8, 80-150 6.6, 150-300 24.1, >300 24.9; parked 4.8, dead 12.0; standing (<150 m, cv<1) 1.0; cars 75, hour 10.8, hourK 1.00, trHour 1; far(>240 m) cars:</small> | >= 2.5 (hr/near) | **FAIL** |  |
| hud/overControls2 | HUD text over the touch buttons (later in roam) | 0 overlaps | 0 | PASS |  |
| ath/boot | Athens: PLAY → first control | 221.3 s lab, city ath | control, city ath | PASS | [ath_1_first_control.jpg](ath_1_first_control.jpg) |
| rev/latres-ath | REVIEW probe Athens | n 0 >1m 0.0% >2m 0.0% >4m 0.00% max 0 m () long>3s 0 | INFO | INFO |  |
| ath/drive | Athens: 60 s drive following streets | 60 s game, 1 % under 10 km/h, 0 pops | >= 55 s, <= 15 % slow, 0 pops | PASS | [ath_2_drive.jpg](ath_2_drive.jpg) |
| ath/race | Athens: pause → QUIT → RACES → START reaches the grid | quit true races true start true grid true | grid reached | PASS | [ath_3_race_start.jpg](ath_3_race_start.jpg) |
| page/reload | page never reloads | 0 reloads | 0 | PASS |  |
| page/jsErrors | no JS errors (pageerror + console.error) | 0 errors | 0 | PASS |  |
| page/memory | JS heap high-water (performance.memory) | 78 MB | INFO (phone cap 700 MB process, NIGHTRUN_LOG) | INFO |  |
