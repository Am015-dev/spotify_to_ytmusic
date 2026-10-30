# Gauntlet r30c2-h

2026-10-30T05:47Z · `node tools/gauntlet.js --build out/r30c2-h --ver r30c2-h --seed 9` · 858 s wall · **9 FAIL** of 31 rows. How to read and extend: [docs/GAUNTLET.md](../../../GAUNTLET.md).

| row | what the player does | number | bar | result | shot |
|---|---|---|---|---|---|
| boot/playVisible | page open → PLAY button visible | 20.1 s lab | INFO (lab, software GL) | INFO | [fra_0_title.jpg](fra_0_title.jpg) |
| boot/toControl | PLAY tap → first control of the car | 147.7 s lab (6x CPU) | <= 8 s lab | **FAIL** | [fra_1_first_control.jpg](fra_1_first_control.jpg) |
| boot/menu | race menu never shows after PLAY (hr/boot) | 0 samples | 0 | PASS |  |
| boot/loader | loader never covers a controllable car (hr/boot) | 0 samples | 0 | PASS |  |
| hud/overControls | HUD text over the touch buttons (first control) | 0 overlaps | 0 | PASS | [fra_1_first_control.jpg](fra_1_first_control.jpg) |
| hud/minText | smallest visible text (first control) | 0 items < 12 px | 0 (CLAUDE.md: 12 px minimum) | PASS |  |
| perf/frame | frame time while driving (real clock, 6x CPU, software GL) | p95 2500 ms, 6/6 frames > 50 ms | INFO (lab GL; iPhone truth = perf/ios-reveal) | INFO |  |
| steer/buttons | hold GAS + ◀ (or ▶) for 1.2 s at ~30-50 km/h turns the car that way | ◀ left 55°, left 62° · ▶ right 54°, right 63°<br><small>from 45.2 km/h, from 46.7 km/h, from 46.9 km/h, from 40.8 km/h</small> | each >= 20° the pressed way | PASS |  |
| drive/time | 2 min street drive, gas held, following streets | 120 s game, 3.18 km, avg 97 km/h | >= 110 s game and >= 1.0 km | PASS | [fra_2_street_at_speed.jpg](fra_2_street_at_speed.jpg) |
| drive/frustration | time under 10 km/h with GAS held | 0 % | <= 15 % (bughunt frustration limit) | PASS |  |
| drive/pop | traffic car pops on screen (in view, 6-60 m) | 0 jumps > 2 m, 0 appear < 40 m | 0 jumps > 2 m; 0 appear < 40 m | PASS |  |
| drive/onStreet | bot check: share of the drive on a street (a bot off the street makes the drive rows meaningless) | 37 % | >= 80 % (script validity) | **FAIL** |  |
| drive/near | traffic near the player (HITRUN_GAP gap 8) | 0.1 cars within 40 m (avg)<br><small>avg cars per frame by distance: <40 0.1, 40-80 0.9, 80-150 5.5, 150-300 16.3, >300 35.2; parked 5.0, dead 12.0; standing (<150 m, cv<1) 1.5; cars 75, hour 10.8, hourK 1.00, trHour 1; far(>240 m) cars:</small> | >= 2.5 (hr/near) | **FAIL** |  |
| hit/contact | nose into 5 traffic cars ahead that close on me (oncoming/slower), GAS held in the last 18 m | 2/5 contacts<br><small>miss, closest 17.6 m, hit at 132.4 km/h, no car in front, hit at 146.7 km/h, miss, closest 10.9 m</small> | >= 4/5 (hr/hit: contact in >= 9/10) | **FAIL** | [fra_3_hit_2.jpg](fra_3_hit_2.jpg) |
| hit/react | hit car reacts: its HUB position velocity changes > 2 m/s within 0.3-1.2 s | 0/2 contacts<br><small>Δv 0 m/s, Δv 0.2 m/s</small> | INFO: this read misses thrown cars (shots show them tumbling); judge by the hit shots | INFO |  |
| hit/noBrake | our speed lost between 12 m and contact (no braking against nothing) | max -4 % | <= 5 % (HITRUN_GAP gap 1) | PASS |  |
| drift/start | BRAKE + steer at ~50 km/h starts a drift | 1/3 (peak slip 40.1°, no setup, no setup)<br><small>2 setups never reached 46-64 km/h (script) · 49.4->55.2 km/h</small> | 3/3 with slip >= 15° | **FAIL** | [fra_4_drift_1.jpg](fra_4_drift_1.jpg) |
| drift/tap | a 0.15 s BRAKE tap in a corner never slides | 1/2 slid (peak 1.3°, no setup, 28.7°) | 0 slid, 3 valid setups | **FAIL** |  |
| wall/glance | glance a wall at 20-45° at ~40 km/h | 0/4 keep >= 60 % & no damage (29° 37 km/h 54% -0hp, 37° 27 km/h 0% -0hp; 2 not set up (script)) | 4/4 | **FAIL** | [fra_5_glance_2.jpg](fra_5_glance_2.jpg) |
| wall/headon | head-on into a wall at ~45 km/h slows hard | 0/2 (no wall reached; 2 not set up (script)) | 2/2 keep <= 35 % | **FAIL** |  |
| pause/resume | ❚❚ opens pause (car + traffic stand still for 1 s), ▶ RESUME drives on | open true, car moved 0.00 m, traffic moved 0.00 m, resumed true | open, 0 m / 0 m, resumed | PASS | [fra_9_pause.jpg](fra_9_pause.jpg) |
| mission/reach | drive to the nearest mission marker (deliver "Ebbelwoi Express", 171 m) | no card in 90 s | reached <= 60 s game | **FAIL** |  |
| hud/overControls2 | HUD text over the touch buttons (later in roam) | 0 overlaps | 0 | PASS |  |
| menu/tiles | every race tile has a preview image and its full name at >= 12 px | 11/11 tiles ok | 0 tiles blank, cut, < 12 px, drawn as > 4 separate pieces, or with a name below the screen and no scroll container (gui-r30a, REVIEW_2K_27) | PASS | [fra_10_race_menu.jpg](fra_10_race_menu.jpg) |
| race/start | pause → QUIT TO TITLE → RACES → START reaches the grid | countdown | countdown or race | PASS | [fra_10_race_menu.jpg](fra_10_race_menu.jpg) |
| race/finish | race finishes with a result screen | results after 133 s game<br><small>4TH PLACE</small> | #results visible <= 480 s game | PASS | [fra_12_race_finish.jpg](fra_12_race_finish.jpg) |
| ath/boot | Athens: PLAY → first control | 109.3 s lab, city ath | control, city ath | PASS | [ath_1_first_control.jpg](ath_1_first_control.jpg) |
| ath/drive | Athens: 60 s drive following streets | 60 s game, 1 % under 10 km/h, 0 pops | >= 55 s, <= 15 % slow, 0 pops | PASS | [ath_2_drive.jpg](ath_2_drive.jpg) |
| ath/race | Athens: pause → QUIT → RACES → START reaches the grid | quit true races true start true grid true | grid reached | PASS | [ath_3_race_start.jpg](ath_3_race_start.jpg) |
| portrait/boot | portrait 390x844: PLAY → control (1x CPU) | 27.2 s lab | control reached | PASS | [portrait_1_first_control.jpg](portrait_1_first_control.jpg) |
| portrait/band | portrait: the 3D view reaches the bottom of the screen (no flat pale band under the road) | mean brightness of the 84-88 % rows 56 | < 140 (the beta.164 band measures 174: pale blue, no road; gui-r30a near-plane fix) | PASS | [portrait_1_first_control.jpg](portrait_1_first_control.jpg) |
| portrait/hud | portrait: HUD text over the touch buttons | 0 overlaps, 0 texts < 12 px | 0 / 0 | PASS | [portrait_1_first_control.jpg](portrait_1_first_control.jpg) |
| page/reload | page never reloads | 0 reloads | 0 | PASS |  |
| page/jsErrors | no JS errors (pageerror + console.error) | 0 errors | 0 | PASS |  |
| page/memory | JS heap high-water (performance.memory) | 78 MB | INFO (phone cap 700 MB process, NIGHTRUN_LOG) | INFO |  |
