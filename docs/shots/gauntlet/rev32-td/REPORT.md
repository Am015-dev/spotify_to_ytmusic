# Gauntlet rev32-td

2026-10-30T09:45Z · `node tools/gauntlet.js --url http://127.0.0.1:8833/index.html --ver rev32-td --seed 11 --only boost,race` · 224 s wall · **2 FAIL** of 14 rows. How to read and extend: [docs/GAUNTLET.md](../../../GAUNTLET.md).

| row | what the player does | number | bar | result | shot |
|---|---|---|---|---|---|
| boot/playVisible | page open → PLAY button visible | 14.6 s lab | INFO (lab, software GL) | INFO | [fra_0_title.jpg](fra_0_title.jpg) |
| boot/toControl | PLAY tap → first control of the car | 77.7 s lab (6x CPU) | <= 8 s lab | **FAIL** | [fra_1_first_control.jpg](fra_1_first_control.jpg) |
| boot/menu | race menu never shows after PLAY (hr/boot) | 0 samples | 0 | PASS |  |
| boot/loader | loader never covers a controllable car (hr/boot) | 0 samples | 0 | PASS |  |
| hud/overControls | HUD text over the touch buttons (first control) | 0 overlaps | 0 | PASS | [fra_1_first_control.jpg](fra_1_first_control.jpg) |
| hud/minText | smallest visible text (first control) | 0 items < 12 px | 0 (CLAUDE.md: 12 px minimum) | PASS |  |
| boost/fra | BOOST tapped every 3 s for 2 min down busy streets (real taps, GAS+◀▶ like a player): a SMASH lunge only when the press has the arrow held toward a car beside | 41 BOOST presses, 0 lunges; a car in the window in 12/1200 samples; 0 presses had the arrow held toward a car beside | lunges <= presses with the arrow toward a car beside (0 unwanted) | PASS |  |
| hud/overControls2 | HUD text over the touch buttons (later in roam) | 0 overlaps | 0 | PASS |  |
| menu/tiles | every race tile has a preview image and its full name at >= 12 px | 11/11 tiles ok | 0 tiles blank, cut, < 12 px, drawn as > 4 separate pieces, or with a name below the screen and no scroll container (gui-r30a, REVIEW_2K_27) | PASS | [fra_10_race_menu.jpg](fra_10_race_menu.jpg) |
| race/start | pause → QUIT TO TITLE → RACES → START reaches the grid | countdown | countdown or race | PASS | [fra_10_race_menu.jpg](fra_10_race_menu.jpg) |
| race/rollBoth | race touch: ▶ held does not roll; ▶ + ◀ together does (the SMASH roll) | one arrow no roll, both arrows ROLL | no roll / ROLL | PASS |  |
| race/rollOverlap | REVIEW_2K_32 probe: 10 hard L<->R corrections with two thumbs overlapping 1-3 frames (33-100 ms) | 10/10 rolled<br><small>1f:ROLL 2f:ROLL 3f:ROLL 1f:ROLL 2f:ROLL 3f:ROLL 1f:ROLL 2f:ROLL 3f:ROLL 1f:ROLL</small> | 0 (a correction is not a SMASH) | **FAIL** |  |
| race/rollTaps | one full race steered like a player (bot taps ◀/▶ to hold the lane): steer presses and would-be double-taps (same side twice within .35 s game time; the lab clock cannot fire the real-time detector, CRSM.acc 0) | 65 steer presses, 0 would-be double-taps = accidental rolls | INFO (a roll needs a deliberate gesture if this is > 0) | INFO |  |
| race/finish | race finishes with a result screen | results after 136 s game<br><small>3RD PLACE</small> | #results visible <= 480 s game | PASS | [fra_12_race_finish.jpg](fra_12_race_finish.jpg) |
| page/reload | page never reloads | 0 reloads | 0 | PASS |  |
| page/jsErrors | no JS errors (pageerror + console.error) | 0 errors | 0 | PASS |  |
| page/memory | JS heap high-water (performance.memory) | 21 MB | INFO (phone cap 700 MB process, NIGHTRUN_LOG) | INFO |  |
