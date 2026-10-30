# Gauntlet v90m-beta.164

2026-10-30T01:35Z · `node tools/gauntlet.js --build out/rev27` · 912 s wall · **17 FAIL** of 40 rows. How to read and extend: [docs/GAUNTLET.md](../../../GAUNTLET.md).

| row | what the player does | number | bar | result | shot |
|---|---|---|---|---|---|
| boot/playVisible | page open → PLAY button visible | 20.8 s lab | INFO (lab, software GL) | INFO | [fra_0_title.jpg](fra_0_title.jpg) |
| boot/toControl | PLAY tap → first control of the car | 101.3 s lab (6x CPU) | <= 8 s lab | **FAIL** | [fra_1_first_control.jpg](fra_1_first_control.jpg) |
| boot/menu | race menu never shows after PLAY (hr/boot) | 0 samples | 0 | PASS |  |
| boot/loader | loader never covers a controllable car (hr/boot) | 0 samples | 0 | PASS |  |
| hud/overControls | HUD text over the touch buttons (first control) | 0 overlaps | 0 | PASS | [fra_1_first_control.jpg](fra_1_first_control.jpg) |
| hud/minText | smallest visible text (first control) | 0 items < 12 px | 0 (CLAUDE.md: 12 px minimum) | PASS |  |
| perf/frame | frame time while driving (real clock, 6x CPU, software GL) | p95 1233 ms, 11/11 frames > 50 ms | INFO (lab GL; iPhone truth = perf/ios-reveal) | INFO |  |
| steer/buttons | hold GAS + ◀ (or ▶) for 1.2 s at ~30-50 km/h turns the car that way | ◀ left 54°, left 62° · ▶ right 42°, right 51°<br><small>from 47.3 km/h, from 47.7 km/h, from 44.3 km/h, from 46.6 km/h</small> | each >= 20° the pressed way | PASS |  |
| drive/time | 2 min street drive, gas held, following streets | 120 s game, 1.62 km, avg 48 km/h | >= 110 s game and >= 1.0 km | PASS | [fra_2_street_at_speed.jpg](fra_2_street_at_speed.jpg) |
| drive/frustration | time under 10 km/h with GAS held | 1 % | <= 15 % (bughunt frustration limit) | PASS |  |
| drive/pop | traffic car pops on screen (in view, 6-60 m) | 0 jumps > 2 m, 0 appear < 40 m | 0 jumps > 2 m; 0 appear < 40 m | PASS |  |
| drive/onStreet | bot check: share of the drive on a street (a bot off the street makes the drive rows meaningless) | 92 % | >= 80 % (script validity) | PASS |  |
| drive/near | traffic near the player (HITRUN_GAP gap 8) | 1.0 cars within 40 m (avg) | >= 2.5 (hr/near) | **FAIL** |  |
| hit/contact | nose into 5 traffic cars ahead that close on me (oncoming/slower), GAS held in the last 18 m | 1/5 contacts<br><small>no car in front, no car in front, no car in front, hit at 69.3 km/h, no car in front</small> | >= 4/5 (hr/hit: contact in >= 9/10) | **FAIL** | [fra_3_hit_4.jpg](fra_3_hit_4.jpg) |
| hit/react | hit car reacts: its HUB position velocity changes > 2 m/s within 0.3-1.2 s | 0/1 contacts<br><small>Δv 0 m/s</small> | INFO: this read misses thrown cars (shots show them tumbling); judge by the hit shots | INFO |  |
| hit/noBrake | our speed lost between 12 m and contact (no braking against nothing) | max -29 % | <= 5 % (HITRUN_GAP gap 1) | PASS |  |
| drift/start | BRAKE + steer at ~50 km/h starts a drift | 0/3 (peak slip 0.1°, 0°, 0°)<br><small>52.7->0 km/h, 46.5->0 km/h, 49.8->0 km/h</small> | 3/3 with slip >= 15° | **FAIL** | [fra_4_drift_1.jpg](fra_4_drift_1.jpg) |
| drift/tap | a 0.15 s BRAKE tap in a corner never slides | 0/3 slid (peak 0.4°, 1.4°, 0.3°) | 0 slid, 3 valid setups | PASS |  |
| wall/glance | glance a wall at 20-45° at ~40 km/h | 0/4 keep >= 60 % & no damage (37° 27 km/h 0% -0hp, 45° 35 km/h 0% -0hp; 2 not set up (script)) | 4/4 | **FAIL** | [fra_5_head_1.jpg](fra_5_head_1.jpg) |
| wall/headon | head-on into a wall at ~45 km/h slows hard | 1/2 (42->10 km/h -0hp; 1 not set up (script)) | 2/2 keep <= 35 % | **FAIL** |  |
| pause/resume | ❚❚ opens pause (car + traffic stand still for 1 s), ▶ RESUME drives on | open true, car moved 0.00 m, traffic moved 0.00 m, resumed true | open, 0 m / 0 m, resumed | PASS | [fra_9_pause.jpg](fra_9_pause.jpg) |
| mission/reach | drive to the nearest mission marker (undefined "Last Train", 394 m) | no card in 90 s | reached <= 60 s game | **FAIL** |  |
| hud/overControls2 | HUD text over the touch buttons (later in roam) | 0 overlaps | 0 | PASS |  |
| menu/tiles | every race tile has a preview image and its full name at >= 12 px | 11/11 tiles ok | 0 tiles blank, cut or < 12 px (gui-r30a) | PASS | [fra_10_race_menu.jpg](fra_10_race_menu.jpg) |
| race/start | pause → QUIT TO TITLE → RACES → START reaches the grid | countdown | countdown or race | PASS | [fra_10_race_menu.jpg](fra_10_race_menu.jpg) |
| race/finish | race finishes with a result screen | no results (state race, lap 0, 21 s game)<br><small>3RD/8</small> | #results visible <= 480 s game | **FAIL** | [fra_12_race_finish.jpg](fra_12_race_finish.jpg) |
| ath/boot | Athens: PLAY → first control | 154.6 s lab, city ath | control, city ath | PASS | [ath_1_first_control.jpg](ath_1_first_control.jpg) |
| ath/drive | Athens: 60 s drive following streets | 60 s game, 1 % under 10 km/h, 0 pops | >= 55 s, <= 15 % slow, 0 pops | PASS | [ath_2_drive.jpg](ath_2_drive.jpg) |
| ath/race | Athens: pause → QUIT → RACES → START reaches the grid | quit true races true start true grid true | grid reached | PASS | [ath_3_race_start.jpg](ath_3_race_start.jpg) |
| portrait/boot | portrait 390x844: PLAY → control (1x CPU) | 41.8 s lab | control reached | PASS | [portrait_1_first_control.jpg](portrait_1_first_control.jpg) |
| portrait/band | portrait: the 3D view reaches the bottom of the screen (no flat pale band under the road) | mean brightness of the 84-88 % rows 56 | < 140 (the beta.164 band measures 174: pale blue, no road; gui-r30a near-plane fix) | PASS | [portrait_1_first_control.jpg](portrait_1_first_control.jpg) |
| portrait/hud | portrait: HUD text over the touch buttons | 0 overlaps, 0 texts < 12 px | 0 / 0 | PASS | [portrait_1_first_control.jpg](portrait_1_first_control.jpg) |
| page/reload | page never reloads | 0 reloads | 0 | PASS |  |
| page/jsErrors | no JS errors (pageerror + console.error) | 0 errors | 0 | PASS |  |
| page/memory | JS heap high-water (performance.memory) | 61 MB | INFO (phone cap 700 MB process, NIGHTRUN_LOG) | INFO |  |
| seen/floating-pickup | wrench pickup hovers ~3 m above the road ahead in the very first drivable frame (HITRUN_GAP gap 2: pickups at car height) | seen in the shot | nothing sloppy on screen | **FAIL** | [fra_1_first_control.jpg](fra_1_first_control.jpg) |
| seen/roof-seam | magenta seam along the long green building's roof edge, left of the first frame (also in portrait) | seen in the shot | nothing sloppy on screen | **FAIL** | [fra_1_first_control.jpg](fra_1_first_control.jpg) |
| seen/sky-debris | grey blocky flocks over the park and the Athens street read as floating debris, not birds | seen in the shot | nothing sloppy on screen | **FAIL** | [fra_2_street_at_speed.jpg](fra_2_street_at_speed.jpg) |
| seen/prop-on-car | at the mission start a flat beige slab and a black/red/yellow block sit on the road overlapping my car | seen in the shot | nothing sloppy on screen | **FAIL** | [fra_6b_mission_start.jpg](fra_6b_mission_start.jpg) |
| seen/card-wordy | mission card is 26 words + 3 time boxes + 2 reward chips ("Unlocks in Chapter 2 · The Harbour Gang (2 flags)" on a side quest I can play now) | seen in the shot | nothing sloppy on screen | **FAIL** | [fra_6_mission_card.jpg](fra_6_mission_card.jpg) |
| seen/coach-toast | "BAUARBEITER JENS ▸ TAP FOR MORE / Smash wall 1/3" box stays over the top of the road while driving (still there > 4 s after START) | seen in the shot | nothing sloppy on screen | **FAIL** | [fra_7_mission_hud.jpg](fra_7_mission_hud.jpg) |
| seen/empty-tiles | 4 race tiles have black previews and cut names (CLIFF RUN, TWO-L…, CANYO…, LAGOO…) | seen in the shot | nothing sloppy on screen | **FAIL** | [fra_10_race_menu.jpg](fra_10_race_menu.jpg) |
| seen/camera-in-props | glancing a kiosk puts the camera inside a giant minifig head and an umbrella: the car is hidden | seen in the shot | nothing sloppy on screen | **FAIL** | [fra_5_glance_4.jpg](fra_5_glance_4.jpg) |
| seen/portrait-band | portrait: the bottom quarter is a flat pale-blue band under the road, behind the buttons | seen in the shot | nothing sloppy on screen | **FAIL** | [portrait_1_first_control.jpg](portrait_1_first_control.jpg) |
