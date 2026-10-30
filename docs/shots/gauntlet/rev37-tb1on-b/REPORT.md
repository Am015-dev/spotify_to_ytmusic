# Gauntlet rev37-tb1on-b

2026-10-30T18:36Z · `node tools/gauntlet.js --url http://localhost:8812/index.html?tb1=1 --ver rev37-tb1on-b --seed 36 --only hit,drift,wall,mission,race,pause,boost,ath` · 774 s wall · **12 FAIL** of 26 rows. How to read and extend: [docs/GAUNTLET.md](../../../GAUNTLET.md).

| row | what the player does | number | bar | result | shot |
|---|---|---|---|---|---|
| boot/playVisible | page open → PLAY button visible | 15.5 s lab | INFO (lab, software GL) | INFO | [fra_0_title.jpg](fra_0_title.jpg) |
| boot/toControl | PLAY tap → first control of the car | 57.3 s lab (6x CPU) | <= 36 s lab at 6x (= ~5 s on an iPhone: 5 s x 7.2-7.3, REVIEW_2K_33, docs/GAUNTLET.md) | **FAIL** | [fra_1_first_control.jpg](fra_1_first_control.jpg) |
| boot/menu | race menu never shows after PLAY (hr/boot) | 0 samples | 0 | PASS |  |
| boot/loader | loader never covers a controllable car (hr/boot) | 0 samples | 0 | PASS |  |
| hud/overControls | HUD text over the touch buttons (first control) | 0 overlaps | 0 | PASS | [fra_1_first_control.jpg](fra_1_first_control.jpg) |
| hud/minText | smallest visible text (first control) | 0 items < 12 px | 0 (CLAUDE.md: 12 px minimum) | PASS |  |
| boost/fra | BOOST tapped every 3 s for 2 min down busy streets (real taps, GAS+◀▶ like a player): a SMASH lunge only when the press has the arrow held toward a car beside | 41 BOOST presses, 10 lunges; a car in the window in 0/1200 samples; 0 presses had the arrow held toward a car beside | lunges <= presses with the arrow toward a car beside (0 unwanted) | **FAIL** |  |
| hit/contact | nose into 5 traffic cars ahead that close on me (oncoming/slower), GAS held in the last 18 m | 0/5 contacts<br><small>miss, closest 10.3 m, no car in front, miss, closest 18.9 m, miss, closest 32 m, miss, closest 16.4 m</small> | >= 4/5 (hr/hit: contact in >= 9/10) | **FAIL** |  |
| hit/react | hit car reacts: its HUB position velocity changes > 2 m/s within 0.3-1.2 s | 0/0 contacts | INFO: this read misses thrown cars (shots show them tumbling); judge by the hit shots | INFO |  |
| hit/noBrake | our speed lost between 12 m and contact (no braking against nothing) | n/a (no contact) | <= 5 % (HITRUN_GAP gap 1) | **FAIL** |  |
| drift/start | BRAKE + steer at ~50 km/h starts a drift | 0/3 (peak slip no setup, no setup, no setup)<br><small>3 setups never reached 46-64 km/h (script) · </small> | 3/3 with slip >= 15° | **FAIL** |  |
| drift/tap | a 0.15 s BRAKE tap in a corner never slides | 0/0 slid (peak no setup, no setup, no setup) | 0 slid, 3 valid setups | **FAIL** |  |
| wall/glance | glance a wall at 20-45° at ~40 km/h | 0/4 keep >= 60 % & no damage (no wall reached; 4 not set up (script)) | 4/4 | **FAIL** |  |
| wall/headon | head-on into a wall at ~45 km/h slows hard | 0/2 (no wall reached; 2 not set up (script)) | 2/2 keep <= 35 % | **FAIL** |  |
| pause/resume | ❚❚ opens pause (car + traffic stand still for 1 s), ▶ RESUME drives on | open true, car moved 0.00 m, traffic moved 0.00 m, resumed true | open, 0 m / 0 m, resumed | PASS | [fra_9_pause.jpg](fra_9_pause.jpg) |
| mission/reach | drive to the nearest mission marker (collect "Opa’s Golden Bricks", 97 m) | no card in 90 s | reached <= 60 s game | **FAIL** |  |
| hud/overControls2 | HUD text over the touch buttons (later in roam) | 0 overlaps | 0 | PASS |  |
| menu/tiles | every race tile has a preview image and its full name at >= 12 px | 11/11 tiles ok | 0 tiles blank, cut, < 12 px, drawn as > 4 separate pieces, or with a name below the screen and no scroll container (gui-r30a, REVIEW_2K_27) | PASS | [fra_10_race_menu.jpg](fra_10_race_menu.jpg) |
| race/start | pause → QUIT TO TITLE → RACES → START reaches the grid | countdown | countdown or race | PASS | [fra_10_race_menu.jpg](fra_10_race_menu.jpg) |
| race/rollOverlap | race touch hand-over: ◀ held 0.3 s, ▶ lands while ◀ is still down (1-3 frames, 33-100 ms), ◀ lifts: no roll | 0/10 rolled | 0/10 (REVIEW_2K_32 point 3) | PASS |  |
| race/rollBoth | race touch chord: ◀ and ▶ land together (one touch event): the SMASH roll fires | 0/10 fired | 10/10 | **FAIL** |  |
| race/rollTaps | one full race steered like a player (bot taps ◀/▶ to hold the lane): steer presses and would-be double-taps (same side twice within .35 s game time; the lab clock cannot fire the real-time detector, CRSM.acc 27) | 98 steer presses, 4 would-be double-taps = accidental rolls | INFO (a roll needs a deliberate gesture if this is > 0) | INFO |  |
| race/finish | race finishes with a result screen | results after 145 s game<br><small>4TH PLACE</small> | #results visible <= 480 s game | PASS | [fra_12_race_finish.jpg](fra_12_race_finish.jpg) |
| ath/boot | Athens: PLAY → first control | 109.4 s lab (6x CPU), city ath | control in city ath, <= 36 s lab at 6x (same bar as Frankfurt, REVIEW_2K_33 (i)) | **FAIL** | [ath_1_first_control.jpg](ath_1_first_control.jpg) |
| boost/ath | BOOST tapped every 3 s for 2 min down busy streets (real taps, GAS+◀▶ like a player): a SMASH lunge only when the press has the arrow held toward a car beside | 41 BOOST presses, 8 lunges; a car in the window in 0/1200 samples; 0 presses had the arrow held toward a car beside | lunges <= presses with the arrow toward a car beside (0 unwanted) | **FAIL** |  |
| ath/drive | Athens: 60 s drive following streets | 60 s game, 1 % under 10 km/h, 0 pops | >= 55 s, <= 15 % slow, 0 pops | PASS | [ath_2_drive.jpg](ath_2_drive.jpg) |
| ath/race | Athens: pause → QUIT → RACES → START reaches the grid | quit true races true start true grid true | grid reached | PASS | [ath_3_race_start.jpg](ath_3_race_start.jpg) |
| page/reload | page never reloads | 0 reloads | 0 | PASS |  |
| page/jsErrors | no JS errors (pageerror + console.error) | 0 errors | 0 | PASS |  |
| page/memory | JS heap high-water (performance.memory) | 87 MB | INFO (phone cap 700 MB process, NIGHTRUN_LOG) | INFO |  |
