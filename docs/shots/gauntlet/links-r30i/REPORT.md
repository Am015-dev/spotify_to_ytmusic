# Gauntlet links-r30i

2026-10-30T17:26Z · `node tools/gauntlet.js --build out/r30i --ver links-r30i` · 760 s wall · **9 FAIL** of 35 rows. How to read and extend: [docs/GAUNTLET.md](../../../GAUNTLET.md).

| row | what the player does | number | bar | result | shot |
|---|---|---|---|---|---|
| boot/playVisible | page open → PLAY button visible | 14.5 s lab | INFO (lab, software GL) | INFO | [fra_0_title.jpg](fra_0_title.jpg) |
| boot/toControl | PLAY tap → first control of the car | 77.1 s lab (6x CPU) | <= 36 s lab at 6x (= ~5 s on an iPhone: 5 s x 7.2-7.3, REVIEW_2K_33, docs/GAUNTLET.md) | **FAIL** | [fra_1_first_control.jpg](fra_1_first_control.jpg) |
| boot/menu | race menu never shows after PLAY (hr/boot) | 0 samples | 0 | PASS |  |
| boot/loader | loader never covers a controllable car (hr/boot) | 0 samples | 0 | PASS |  |
| hud/overControls | HUD text over the touch buttons (first control) | 0 overlaps | 0 | PASS | [fra_1_first_control.jpg](fra_1_first_control.jpg) |
| hud/minText | smallest visible text (first control) | 0 items < 12 px | 0 (CLAUDE.md: 12 px minimum) | PASS |  |
| perf/frame | frame time while driving (real clock, 6x CPU, software GL) | p95 883 ms, 18/18 frames > 50 ms | INFO (lab GL; iPhone truth = perf/ios-reveal) | INFO |  |
| steer/buttons | hold GAS + ◀ (or ▶) for 1.2 s at ~30-50 km/h turns the car that way | ◀ left 55°, left 62° · ▶ right 56°, right 44°<br><small>from 44.6 km/h, from 46.6 km/h, from 46 km/h, from 42.2 km/h</small> | each >= 20° the pressed way | PASS |  |
| drive/time | 2 min street drive, gas held, following streets | 120 s game, 1.73 km, avg 52 km/h | >= 110 s game and >= 1.0 km | PASS | [fra_2_street_at_speed.jpg](fra_2_street_at_speed.jpg) |
| drive/frustration | time under 10 km/h with GAS held | 4 % | <= 15 % (bughunt frustration limit) | PASS |  |
| drive/pop | traffic car pops on screen (in view, 6-60 m) | 0 jumps > 2 m, 0 appear < 40 m | 0 jumps > 2 m; 0 appear < 40 m | PASS |  |
| drive/onStreet | bot check: share of the drive on a street (a bot off the street makes the drive rows meaningless) | 91 % | >= 80 % (script validity) | PASS |  |
| drive/offLane | in-view traffic sideways off its lane (junction hand-off residual, 6-60 m; REVIEW_2K_30 rev/latres) | >2 m 3.5 %, >4 m 0.03 % of 3947 samples, 0 samples > 2 m for > 3 s, max 4.06 m (k0 731>732@0.00 d36) | INFO | INFO |  |
| drive/near | traffic near the player (HITRUN_GAP gap 8) | 1.4 cars within 40 m (avg)<br><small>avg cars per frame by distance: <40 1.4, 40-80 2.6, 80-150 7.9, 150-300 30.8, >300 15.4; parked 4.9, dead 12.0; standing (<150 m, cv<1) 2.7; cars 75, hour 10.8, hourK 1.00, trHour 1; far(>240 m) cars:</small> | >= 2.5 (hr/near) | **FAIL** |  |
| boost/fra | BOOST tapped every 3 s for 2 min down busy streets (real taps, GAS+◀▶ like a player): a SMASH lunge only when the press has the arrow held toward a car beside | 41 BOOST presses, 1 lunges; a car in the window in 14/1200 samples; 1 presses had the arrow held toward a car beside | lunges <= presses with the arrow toward a car beside (0 unwanted) | PASS |  |
| hit/contact | nose into 5 traffic cars ahead that close on me (oncoming/slower), GAS held in the last 18 m | 2/5 contacts<br><small>no car in front, no car in front, miss, closest 26.6 m, hit at 52.5 km/h, hit at 60.5 km/h</small> | >= 4/5 (hr/hit: contact in >= 9/10) | **FAIL** | [fra_3_hit_4.jpg](fra_3_hit_4.jpg) |
| hit/react | hit car reacts: its HUB position velocity changes > 2 m/s within 0.3-1.2 s | 1/2 contacts<br><small>Δv 8.1 m/s, Δv 0 m/s</small> | INFO: this read misses thrown cars (shots show them tumbling); judge by the hit shots | INFO |  |
| hit/noBrake | our speed lost between 12 m and contact (no braking against nothing) | max -7 % | <= 5 % (HITRUN_GAP gap 1) | PASS |  |
| drift/start | BRAKE + steer at ~50 km/h starts a drift | 2/3 (peak slip 40.1°, 40.1°, no setup)<br><small>1 setups never reached 46-64 km/h (script) · 47.1->55.7 km/h, 51.7->103.7 km/h</small> | 3/3 with slip >= 15° | **FAIL** | [fra_4_drift_1.jpg](fra_4_drift_1.jpg) |
| drift/tap | a 0.15 s BRAKE tap in a corner never slides | 1/2 slid (peak 30.3°, no setup, 7.9°) | 0 slid, 3 valid setups | **FAIL** |  |
| wall/glance | glance a wall at 20-45° at ~40 km/h | 1/4 keep >= 60 % & no damage (29° 27 km/h 116% -0hp; 3 not set up (script)) | 4/4 | **FAIL** | [fra_5_head_1.jpg](fra_5_head_1.jpg) |
| wall/headon | head-on into a wall at ~45 km/h slows hard | 1/2 (42->15 km/h -0hp, 42->4 km/h -0hp) | 2/2 keep <= 35 % | **FAIL** |  |
| pause/resume | ❚❚ opens pause (car + traffic stand still for 1 s), ▶ RESUME drives on | open true, car moved 0.00 m, traffic moved 0.00 m, resumed true | open, 0 m / 0 m, resumed | PASS | [fra_9_pause.jpg](fra_9_pause.jpg) |
| mission/reach | drive to the nearest mission marker (chase "Gnome-napping (The Gnome Gang 1/3)", 310 m) | no card in 90 s | reached <= 60 s game | **FAIL** |  |
| hud/overControls2 | HUD text over the touch buttons (later in roam) | 0 overlaps | 0 | PASS |  |
| menu/tiles | every race tile has a preview image and its full name at >= 12 px | 11/11 tiles ok | 0 tiles blank, cut, < 12 px, drawn as > 4 separate pieces, or with a name below the screen and no scroll container (gui-r30a, REVIEW_2K_27) | PASS | [fra_10_race_menu.jpg](fra_10_race_menu.jpg) |
| race/start | pause → QUIT TO TITLE → RACES → START reaches the grid | countdown | countdown or race | PASS | [fra_10_race_menu.jpg](fra_10_race_menu.jpg) |
| race/rollOverlap | race touch hand-over: ◀ held 0.3 s, ▶ lands while ◀ is still down (1-3 frames, 33-100 ms), ◀ lifts: no roll | 0/10 rolled | 0/10 (REVIEW_2K_32 point 3) | PASS |  |
| race/rollBoth | race touch chord: ◀ and ▶ land together (one touch event): the SMASH roll fires | 10/10 fired | 10/10 | PASS |  |
| race/rollTaps | one full race steered like a player (bot taps ◀/▶ to hold the lane): steer presses and would-be double-taps (same side twice within .35 s game time; the lab clock cannot fire the real-time detector, CRSM.acc 0) | 62 steer presses, 0 would-be double-taps = accidental rolls | INFO (a roll needs a deliberate gesture if this is > 0) | INFO |  |
| race/finish | race finishes with a result screen | results after 140 s game<br><small>4TH PLACE</small> | #results visible <= 480 s game | PASS | [fra_12_race_finish.jpg](fra_12_race_finish.jpg) |
| ath/boot | Athens: PLAY → first control | 111.9 s lab (6x CPU), city ath | control in city ath, <= 36 s lab at 6x (same bar as Frankfurt, REVIEW_2K_33 (i)) | **FAIL** | [ath_1_first_control.jpg](ath_1_first_control.jpg) |
| boost/ath | BOOST tapped every 3 s for 2 min down busy streets (real taps, GAS+◀▶ like a player): a SMASH lunge only when the press has the arrow held toward a car beside | 41 BOOST presses, 0 lunges; a car in the window in 6/1200 samples; 0 presses had the arrow held toward a car beside | lunges <= presses with the arrow toward a car beside (0 unwanted) | PASS |  |
| ath/drive | Athens: 60 s drive following streets | 60 s game, 1 % under 10 km/h, 0 pops | >= 55 s, <= 15 % slow, 0 pops | PASS | [ath_2_drive.jpg](ath_2_drive.jpg) |
| ath/race | Athens: pause → QUIT → RACES → START reaches the grid | quit true races true start true grid true | grid reached | PASS | [ath_3_race_start.jpg](ath_3_race_start.jpg) |
| portrait/boot | portrait 390x844: PLAY → control (1x CPU) | 22.9 s lab | control reached | PASS | [portrait_1_first_control.jpg](portrait_1_first_control.jpg) |
| portrait/band | portrait: the 3D view reaches the bottom of the screen (no flat pale band under the road) | mean brightness of the 84-88 % rows 56 | < 140 (the beta.164 band measures 174: pale blue, no road; gui-r30a near-plane fix) | PASS | [portrait_1_first_control.jpg](portrait_1_first_control.jpg) |
| portrait/hud | portrait: HUD text over the touch buttons | 0 overlaps, 0 texts < 12 px | 0 / 0 | PASS | [portrait_1_first_control.jpg](portrait_1_first_control.jpg) |
| boot/toControl1x | PLAY tap → first control, unthrottled (1x CPU, software GL) | 27.2 s lab (1x) | INFO: <= 15 s (5 s x 2.9, docs/GAUNTLET.md); not a gate | INFO | [fra1x_1_first_control.jpg](fra1x_1_first_control.jpg) |
| page/reload | page never reloads | 0 reloads | 0 | PASS |  |
| page/jsErrors | no JS errors (pageerror + console.error) | 0 errors | 0 | PASS |  |
| page/memory | JS heap high-water (performance.memory) | 58 MB | INFO (phone cap 700 MB process, NIGHTRUN_LOG) | INFO |  |
