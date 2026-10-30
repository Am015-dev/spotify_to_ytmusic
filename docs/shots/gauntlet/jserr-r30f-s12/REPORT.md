# Gauntlet jserr-r30f-s12

2026-10-30T13:13Z · `node tools/gauntlet.js --build out/jserr-r30f --ver jserr-r30f-s12 --seed 12 --only boot,perf,hud,steer,drive,hit,drift,wall,mission,world,race,pause,ath,portrait,boost` · 1280 s wall · **11 FAIL** of 45 rows. How to read and extend: [docs/GAUNTLET.md](../../../GAUNTLET.md).

| row | what the player does | number | bar | result | shot |
|---|---|---|---|---|---|
| boot/playVisible | page open → PLAY button visible | 17.8 s lab | INFO (lab, software GL) | INFO | [fra_0_title.jpg](fra_0_title.jpg) |
| boot/toControl | PLAY tap → first control of the car | 91.5 s lab (6x CPU) | <= 8 s lab | **FAIL** | [fra_1_first_control.jpg](fra_1_first_control.jpg) |
| boot/menu | race menu never shows after PLAY (hr/boot) | 0 samples | 0 | PASS |  |
| boot/loader | loader never covers a controllable car (hr/boot) | 0 samples | 0 | PASS |  |
| hud/overControls | HUD text over the touch buttons (first control) | 0 overlaps | 0 | PASS | [fra_1_first_control.jpg](fra_1_first_control.jpg) |
| hud/minText | smallest visible text (first control) | 0 items < 12 px | 0 (CLAUDE.md: 12 px minimum) | PASS |  |
| perf/frame | frame time while driving (real clock, 6x CPU, software GL) | p95 1233 ms, 10/10 frames > 50 ms | INFO (lab GL; iPhone truth = perf/ios-reveal) | INFO |  |
| world/pickup | drive at the garage 🔧: the icon is readable on the way into its ring | opacity 40 m 1 · 25 m 1 · 12 m 1 | >= 0.75 at 25 m and 12 m (REVIEW_2K_28: 0.31 at 26 m) | PASS | [world_garage_25m.jpg](world_garage_25m.jpg) |
| world/quests | 3 quests started by real input (beacon, prompt, LET'S GO): anything drawn inside my car? | 0/3 started, 0 objects in the car body<br><small>q_pigeons d344m v71 no card; q_thief d266m v130 no card; q_wedding d423m v136 no card</small> | 3/3 started, 0 (gauntlet seen/prop-on-car) | **FAIL** | [world_quest1_start.jpg](world_quest1_start.jpg) |
| world/glance | drive past a kiosk/sign/stall 2.5 m to its side at ~40 km/h: the lens inside a drawn object | 0/14 frames inside a prop (fence, closest 5.0 m); 0 frames inside a building (INFO) | 0 frames (gauntlet seen/camera-in-props) | PASS | [world_glance_kiosk.jpg](world_glance_kiosk.jpg) |
| world/birds | scattered pigeons seen from the car at >= 55 km/h (real drive) | 0/56 bird samples at camera height (0 %), 6 samples | <= 10 % at camera height (REVIEW_2K_28: grey drones 3-8 m up) | PASS | [world_birds_speed.jpg](world_birds_speed.jpg) |
| steer/buttons | hold GAS + ◀ (or ▶) for 1.2 s at ~30-50 km/h turns the car that way | ◀ left 0°, left 29° · ▶ right 0°, right 0°<br><small>no setup (script) at 113.3 km/h, from 46.8 km/h, no setup (script) at 36.4 km/h, no setup (script) at 97.5 km/h</small> | each >= 20° the pressed way | **FAIL** |  |
| drive/time | 2 min street drive, gas held, following streets | 120 s game, 2.22 km, avg 67 km/h | >= 110 s game and >= 1.0 km | PASS | [fra_2_street_at_speed.jpg](fra_2_street_at_speed.jpg) |
| drive/frustration | time under 10 km/h with GAS held | 1 % | <= 15 % (bughunt frustration limit) | PASS |  |
| drive/pop | traffic car pops on screen (in view, 6-60 m) | 0 jumps > 2 m, 0 appear < 40 m | 0 jumps > 2 m; 0 appear < 40 m | PASS |  |
| drive/onStreet | bot check: share of the drive on a street (a bot off the street makes the drive rows meaningless) | 81 % | >= 80 % (script validity) | PASS |  |
| drive/offLane | in-view traffic sideways off its lane (junction hand-off residual, 6-60 m; REVIEW_2K_30 rev/latres) | >2 m 8.4 %, >4 m 1.03 % of 1843 samples, 0 samples > 2 m for > 3 s, max 5.11 m (k3 120>119@0.00 d57) | INFO | INFO |  |
| drive/near | traffic near the player (HITRUN_GAP gap 8) | 0.6 cars within 40 m (avg)<br><small>avg cars per frame by distance: <40 0.6, 40-80 1.2, 80-150 7.2, 150-300 22.3, >300 26.8; parked 4.9, dead 12.1; standing (<150 m, cv<1) 1.7; cars 75, hour 10.8, hourK 1.00, trHour 1; far(>240 m) cars:</small> | >= 2.5 (hr/near) | **FAIL** |  |
| boost/fra | BOOST tapped every 3 s for 2 min down busy streets (real taps, GAS+◀▶ like a player): a SMASH lunge only when the press has the arrow held toward a car beside | 41 BOOST presses, 0 lunges; a car in the window in 11/1200 samples; 0 presses had the arrow held toward a car beside | lunges <= presses with the arrow toward a car beside (0 unwanted) | PASS |  |
| hit/contact | nose into 5 traffic cars ahead that close on me (oncoming/slower), GAS held in the last 18 m | 3/5 contacts<br><small>miss, closest 61 m, hit at 62.2 km/h, no car in front, hit at 66.8 km/h, hit at 65.8 km/h</small> | >= 4/5 (hr/hit: contact in >= 9/10) | **FAIL** | [fra_3_hit_2.jpg](fra_3_hit_2.jpg) |
| hit/react | hit car reacts: its HUB position velocity changes > 2 m/s within 0.3-1.2 s | 0/3 contacts<br><small>Δv 1.5 m/s, Δv 0 m/s, Δv 0 m/s</small> | INFO: this read misses thrown cars (shots show them tumbling); judge by the hit shots | INFO |  |
| hit/noBrake | our speed lost between 12 m and contact (no braking against nothing) | max 0 % | <= 5 % (HITRUN_GAP gap 1) | PASS |  |
| drift/start | BRAKE + steer at ~50 km/h starts a drift | 2/3 (peak slip 40.1°, 40.1°, no setup)<br><small>1 setups never reached 46-64 km/h (script) · 53.3->50.7 km/h, 51.4->111.8 km/h</small> | 3/3 with slip >= 15° | **FAIL** | [fra_4_drift_1.jpg](fra_4_drift_1.jpg) |
| drift/tap | a 0.15 s BRAKE tap in a corner never slides | 0/0 slid (peak no setup, no setup, no setup) | 0 slid, 3 valid setups | **FAIL** |  |
| wall/glance | glance a wall at 20-45° at ~40 km/h | 0/4 keep >= 60 % & no damage (37° 27 km/h 32% -12hp; 3 not set up (script)) | 4/4 | **FAIL** | [fra_5_glance_3.jpg](fra_5_glance_3.jpg) |
| wall/headon | head-on into a wall at ~45 km/h slows hard | 0/2 (no wall reached; 2 not set up (script)) | 2/2 keep <= 35 % | **FAIL** |  |
| pause/resume | ❚❚ opens pause (car + traffic stand still for 1 s), ▶ RESUME drives on | open true, car moved 0.00 m, traffic moved 0.00 m, resumed true | open, 0 m / 0 m, resumed | PASS | [fra_9_pause.jpg](fra_9_pause.jpg) |
| mission/reach | drive to the nearest mission marker (ball "The Giant Ball", 593 m) | 77 s game, tapped the TAP TO OPEN prompt | reached <= 60 s game | **FAIL** |  |
| mission/card | mission card before START: name + ONE line (buttons not counted) | name 3 words + line 6 words: "⚽ The Giant Ball / Push the ball into the goal" | name <= 4 words, objective line <= 6 words, nothing else (Alex: a 40-word card; Hit & Run shows 3; gui-r30a: stars, times, rewards and the long brief are behind DETAILS) | PASS | [fra_6_mission_card.jpg](fra_6_mission_card.jpg) |
| mission/details | DETAILS is one tap away and shows the stars / times / rewards | 52 words after the tap<br><small>SIDE QUEST ⚽ Paul (8) · The Giant Ball ★★★ NOT PLAYED YET “My giant LEGO ball rolled away! Push it b</small> | a DETAILS tap shows > 6 words (and START is still on the card) | PASS | [fra_6a_mission_details.jpg](fra_6a_mission_details.jpg) |
| mission/cover | HUD/cards over the touch buttons at mission start | 0 overlaps | 0 | PASS | [fra_6_mission_card.jpg](fra_6_mission_card.jpg) |
| mission/objective | first objective text after START (largest text line) | 13 words: "⚽ Push the giant red ball into the goal. The ball has a ⚽ ma"<br><small>Paul (8) / ⚽ Push the giant red ball into the goal. The ball has a ⚽ ma / 00:00.0</small> | <= 6 words (hr/mstart) | **FAIL** | [fra_6b_mission_start.jpg](fra_6b_mission_start.jpg) |
| mission/toast | the coach toast over the road after START | on screen 3.5 s game (from 1.5 s after START) | <= 4 s on screen (the objective lives in the one-line HUD slot) | PASS | [fra_7a_toast_3s.jpg](fra_7a_toast_3s.jpg) |
| mission/end | mission ends with a fail screen that offers RETRY | fail screen with RETRY<br><small>THE GIANT BALL / TIME UP / No stars this time · try again / ↺ RETRY / ✕ QUIT</small> | RETRY visible | PASS | [fra_8_mission_end.jpg](fra_8_mission_end.jpg) |
| mission/retry | RETRY from the fail screen puts me back in the mission | 0.2 s game, 0.1 s lab | back driving <= 2 s game | PASS |  |
| hud/overControls2 | HUD text over the touch buttons (later in roam) | 0 overlaps | 0 | PASS |  |
| menu/tiles | every race tile has a preview image and its full name at >= 12 px | 11/11 tiles ok | 0 tiles blank, cut, < 12 px, drawn as > 4 separate pieces, or with a name below the screen and no scroll container (gui-r30a, REVIEW_2K_27) | PASS | [fra_10_race_menu.jpg](fra_10_race_menu.jpg) |
| race/start | pause → QUIT TO TITLE → RACES → START reaches the grid | countdown | countdown or race | PASS | [fra_10_race_menu.jpg](fra_10_race_menu.jpg) |
| race/rollBoth | race touch: ▶ held does not roll; ▶ + ◀ together does (the SMASH roll) | one arrow no roll, both arrows ROLL | no roll / ROLL | PASS |  |
| race/rollTaps | one full race steered like a player (bot taps ◀/▶ to hold the lane): steer presses and would-be double-taps (same side twice within .35 s game time; the lab clock cannot fire the real-time detector, CRSM.acc 0) | 70 steer presses, 3 would-be double-taps = accidental rolls | INFO (a roll needs a deliberate gesture if this is > 0) | INFO |  |
| race/finish | race finishes with a result screen | results after 130 s game<br><small>2ND PLACE</small> | #results visible <= 480 s game | PASS | [fra_12_race_finish.jpg](fra_12_race_finish.jpg) |
| ath/boot | Athens: PLAY → first control | 130.0 s lab, city ath | control, city ath | PASS | [ath_1_first_control.jpg](ath_1_first_control.jpg) |
| boost/ath | BOOST tapped every 3 s for 2 min down busy streets (real taps, GAS+◀▶ like a player): a SMASH lunge only when the press has the arrow held toward a car beside | 41 BOOST presses, 0 lunges; a car in the window in 128/1200 samples; 0 presses had the arrow held toward a car beside | lunges <= presses with the arrow toward a car beside (0 unwanted) | PASS |  |
| ath/drive | Athens: 60 s drive following streets | 60 s game, 1 % under 10 km/h, 0 pops | >= 55 s, <= 15 % slow, 0 pops | PASS | [ath_2_drive.jpg](ath_2_drive.jpg) |
| ath/race | Athens: pause → QUIT → RACES → START reaches the grid | quit true races true start true grid true | grid reached | PASS | [ath_3_race_start.jpg](ath_3_race_start.jpg) |
| portrait/boot | portrait 390x844: PLAY → control (1x CPU) | 35.6 s lab | control reached | PASS | [portrait_1_first_control.jpg](portrait_1_first_control.jpg) |
| portrait/band | portrait: the 3D view reaches the bottom of the screen (no flat pale band under the road) | mean brightness of the 84-88 % rows 56 | < 140 (the beta.164 band measures 174: pale blue, no road; gui-r30a near-plane fix) | PASS | [portrait_1_first_control.jpg](portrait_1_first_control.jpg) |
| portrait/hud | portrait: HUD text over the touch buttons | 0 overlaps, 0 texts < 12 px | 0 / 0 | PASS | [portrait_1_first_control.jpg](portrait_1_first_control.jpg) |
| page/reload | page never reloads | 0 reloads | 0 | PASS |  |
| page/jsErrors | no JS errors (pageerror + console.error) | 0 errors | 0 | PASS |  |
| page/memory | JS heap high-water (performance.memory) | 54 MB | INFO (phone cap 700 MB process, NIGHTRUN_LOG) | INFO |  |
