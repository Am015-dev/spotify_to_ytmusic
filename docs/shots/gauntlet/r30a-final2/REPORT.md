# Gauntlet r30a-final2

2026-10-30T01:16Z · `node tools/gauntlet.js --build out/r30b --ver r30a-final2 --only mission,race,portrait` · 303 s wall · **6 FAIL** of 27 rows. How to read and extend: [docs/GAUNTLET.md](../../../GAUNTLET.md).

| row | what the player does | number | bar | result | shot |
|---|---|---|---|---|---|
| boot/playVisible | page open → PLAY button visible | 14.8 s lab | INFO (lab, software GL) | INFO | [fra_0_title.jpg](fra_0_title.jpg) |
| boot/toControl | PLAY tap → first control of the car | 75.2 s lab (6x CPU) | <= 8 s lab | **FAIL** | [fra_1_first_control.jpg](fra_1_first_control.jpg) |
| boot/menu | race menu never shows after PLAY (hr/boot) | 0 samples | 0 | PASS |  |
| boot/loader | loader never covers a controllable car (hr/boot) | 0 samples | 0 | PASS |  |
| hud/overControls | HUD text over the touch buttons (first control) | 0 overlaps | 0 | PASS | [fra_1_first_control.jpg](fra_1_first_control.jpg) |
| hud/minText | smallest visible text (first control) | 0 items < 12 px | 0 (CLAUDE.md: 12 px minimum) | PASS |  |
| mission/reach | drive to the nearest mission marker (collect "Stud Rush: Bankenviertel", 45 m) | 8 s game, tapped the TAP TO OPEN prompt | reached <= 60 s game | PASS |  |
| mission/card | mission card before START: name + ONE line (buttons not counted) | name 3 words + line 4 words: "Stud Rush: Bankenviertel / Collect the golden bricks" | name <= 4 words, objective line <= 6 words, nothing else (Alex: a 40-word card; Hit & Run shows 3; gui-r30a: stars, times, rewards and the long brief are behind DETAILS) | PASS | [fra_6_mission_card.jpg](fra_6_mission_card.jpg) |
| mission/details | DETAILS is one tap away and shows the stars / times / rewards | 120 words after the tap<br><small>SIDE CHALLENGE Stud Rush: Bankenviertel ★★★ NOT PLAYED YET Golden bricks hidden in three districts. </small> | a DETAILS tap shows > 6 words (and START is still on the card) | PASS | [fra_6a_mission_details.jpg](fra_6a_mission_details.jpg) |
| mission/cover | HUD/cards over the touch buttons at mission start | 0 overlaps | 0 | PASS | [fra_6_mission_card.jpg](fra_6_mission_card.jpg) |
| mission/objective | first objective text after START (largest text line) | 4 words: "STUD RUSH: BANKENVIERTEL · 1/3 ·"<br><small>STUD RUSH: BANKENVIERTEL · 1/3 · / ➤ / Go · left in 20 m / 02:27.6</small> | <= 6 words (hr/mstart) | PASS | [fra_6b_mission_start.jpg](fra_6b_mission_start.jpg) |
| mission/toast | the coach toast over the road after START | on screen 3.5 s game (from 1.5 s after START) | <= 4 s on screen (the objective lives in the one-line HUD slot) | PASS | [fra_7a_toast_3s.jpg](fra_7a_toast_3s.jpg) |
| mission/end | mission ends with a fail screen that offers RETRY | fail screen with RETRY<br><small>STUD RUSH: BANKENVIERTEL / TIME UP / No stars this time · try again / 0/3 stages · 4.6 km · ★★★ 03:05.0 · 🏎 RIVAL / ↺ R</small> | RETRY visible | PASS | [fra_8_mission_end.jpg](fra_8_mission_end.jpg) |
| mission/retry | RETRY from the fail screen puts me back in the mission | 0.2 s game, 0.1 s lab | back driving <= 2 s game | PASS |  |
| hud/overControls2 | HUD text over the touch buttons (later in roam) | 0 overlaps | 0 | PASS |  |
| menu/tiles | every race tile has a preview image and its full name at >= 12 px | 11/11 tiles ok | 0 tiles blank, cut or < 12 px (gui-r30a) | PASS | [fra_10_race_menu.jpg](fra_10_race_menu.jpg) |
| race/start | pause → QUIT TO TITLE → RACES → START reaches the grid | countdown | countdown or race | PASS | [fra_10_race_menu.jpg](fra_10_race_menu.jpg) |
| race/finish | race finishes with a result screen | results after 144 s game<br><small>6TH PLACE</small> | #results visible <= 480 s game | PASS | [fra_12_race_finish.jpg](fra_12_race_finish.jpg) |
| portrait/boot | portrait 390x844: PLAY → control (1x CPU) | 23.4 s lab | control reached | PASS | [portrait_1_first_control.jpg](portrait_1_first_control.jpg) |
| portrait/band | portrait: the 3D view reaches the bottom of the screen (no flat pale band under the road) | mean brightness of the 84-88 % rows 56 | < 140 (the beta.164 band measures 174: pale blue, no road; gui-r30a near-plane fix) | PASS | [portrait_1_first_control.jpg](portrait_1_first_control.jpg) |
| portrait/hud | portrait: HUD text over the touch buttons | 0 overlaps, 0 texts < 12 px | 0 / 0 | PASS | [portrait_1_first_control.jpg](portrait_1_first_control.jpg) |
| page/reload | page never reloads | 0 reloads | 0 | PASS |  |
| page/jsErrors | no JS errors (pageerror + console.error) | 0 errors | 0 | PASS |  |
| page/memory | JS heap high-water (performance.memory) | 21 MB | INFO (phone cap 700 MB process, NIGHTRUN_LOG) | INFO |  |
| seen/floating-pickup | wrench pickup hovers ~3 m above the road ahead in the very first drivable frame (HITRUN_GAP gap 2: pickups at car height) | seen in the shot | nothing sloppy on screen | **FAIL** | [fra_1_first_control.jpg](fra_1_first_control.jpg) |
| seen/roof-seam | magenta seam along the long green building's roof edge, left of the first frame (also in portrait) | seen in the shot | nothing sloppy on screen | **FAIL** | [fra_1_first_control.jpg](fra_1_first_control.jpg) |
| seen/sky-debris | grey blocky flocks over the park and the Athens street read as floating debris, not birds | seen in the shot | nothing sloppy on screen | **FAIL** | [fra_2_street_at_speed.jpg](fra_2_street_at_speed.jpg) |
| seen/prop-on-car | at the mission start a flat beige slab and a black/red/yellow block sit on the road overlapping my car | seen in the shot | nothing sloppy on screen | **FAIL** | [fra_6b_mission_start.jpg](fra_6b_mission_start.jpg) |
| seen/camera-in-props | glancing a kiosk puts the camera inside a giant minifig head and an umbrella: the car is hidden | seen in the shot | nothing sloppy on screen | **FAIL** | [fra_5_glance_4.jpg](fra_5_glance_4.jpg) |
