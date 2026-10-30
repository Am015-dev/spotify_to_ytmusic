# Gauntlet rev29-r30a2

2026-10-30T04:31Z · `node tools/gauntlet.js --build out/rev29t --ver rev29-r30a2 --only mission,race,ath` · 818 s wall · **1 FAIL** of 22 rows. How to read and extend: [docs/GAUNTLET.md](../../../GAUNTLET.md).

| row | what the player does | number | bar | result | shot |
|---|---|---|---|---|---|
| boot/playVisible | page open → PLAY button visible | 27.8 s lab | INFO (lab, software GL) | INFO | [fra_0_title.jpg](fra_0_title.jpg) |
| boot/toControl | PLAY tap → first control of the car | 126.0 s lab (6x CPU) | <= 8 s lab | **FAIL** | [fra_1_first_control.jpg](fra_1_first_control.jpg) |
| boot/menu | race menu never shows after PLAY (hr/boot) | 0 samples | 0 | PASS |  |
| boot/loader | loader never covers a controllable car (hr/boot) | 0 samples | 0 | PASS |  |
| hud/overControls | HUD text over the touch buttons (first control) | 0 overlaps | 0 | PASS | [fra_1_first_control.jpg](fra_1_first_control.jpg) |
| hud/minText | smallest visible text (first control) | 0 items < 12 px | 0 (CLAUDE.md: 12 px minimum) | PASS |  |
| mission/reach | drive to the nearest mission marker (collect "Stud Rush: Bankenviertel", 45 m) | 15 s game, tapped the TAP TO OPEN prompt | reached <= 60 s game | PASS |  |
| mission/card | mission card before START: name + ONE line (buttons not counted) | name 3 words + line 4 words: "Stud Rush: Bankenviertel / Collect the golden bricks" | name <= 4 words, objective line <= 6 words, nothing else (Alex: a 40-word card; Hit & Run shows 3; gui-r30a: stars, times, rewards and the long brief are behind DETAILS) | PASS | [fra_6_mission_card.jpg](fra_6_mission_card.jpg) |
| mission/details | DETAILS is one tap away and shows the stars / times / rewards | 120 words after the tap<br><small>SIDE CHALLENGE Stud Rush: Bankenviertel ★★★ NOT PLAYED YET Golden bricks hidden in three districts. </small> | a DETAILS tap shows > 6 words (and START is still on the card) | PASS | [fra_6a_mission_details.jpg](fra_6a_mission_details.jpg) |
| mission/cover | HUD/cards over the touch buttons at mission start | 0 overlaps | 0 | PASS | [fra_6_mission_card.jpg](fra_6_mission_card.jpg) |
| mission/objective | first objective text after START (largest text line) | 4 words: "STUD RUSH: BANKENVIERTEL · 1/3 ·"<br><small>STUD RUSH: BANKENVIERTEL · 1/3 · / ➤ / Go · left in 20 m / 02:27.6</small> | <= 6 words (hr/mstart) | PASS | [fra_6b_mission_start.jpg](fra_6b_mission_start.jpg) |
| mission/toast | the coach toast over the road after START | never shown | <= 4 s on screen (the objective lives in the one-line HUD slot) | PASS |  |
| mission/end | mission ends with a fail screen that offers RETRY | fail screen with RETRY<br><small>STUD RUSH: BANKENVIERTEL / TIME UP / No stars this time · try again / 0/3 stages · 4.6 km · ★★★ 03:05.0 · 🏎 RIVAL / ↺ R</small> | RETRY visible | PASS | [fra_8_mission_end.jpg](fra_8_mission_end.jpg) |
| mission/retry | RETRY from the fail screen puts me back in the mission | 0.2 s game, 0.1 s lab | back driving <= 2 s game | PASS |  |
| hud/overControls2 | HUD text over the touch buttons (later in roam) | 0 overlaps | 0 | PASS |  |
| menu/tiles | every race tile has a preview image and its full name at >= 12 px | 11/11 tiles ok | 0 tiles blank, cut, < 12 px, drawn as > 4 separate pieces, or with a name below the screen and no scroll container (gui-r30a, REVIEW_2K_27) | PASS | [fra_10_race_menu.jpg](fra_10_race_menu.jpg) |
| race/start | pause → QUIT TO TITLE → RACES → START reaches the grid | countdown | countdown or race | PASS | [fra_10_race_menu.jpg](fra_10_race_menu.jpg) |
| race/finish | race finishes with a result screen | results after 131 s game<br><small>4TH PLACE</small> | #results visible <= 480 s game | PASS | [fra_12_race_finish.jpg](fra_12_race_finish.jpg) |
| ath/boot | Athens: PLAY → first control | 131.4 s lab, city ath | control, city ath | PASS | [ath_1_first_control.jpg](ath_1_first_control.jpg) |
| ath/drive | Athens: 60 s drive following streets | 60 s game, 1 % under 10 km/h, 0 pops | >= 55 s, <= 15 % slow, 0 pops | PASS | [ath_2_drive.jpg](ath_2_drive.jpg) |
| ath/race | Athens: pause → QUIT → RACES → START reaches the grid | quit true races true start true grid true | grid reached | PASS | [ath_3_race_start.jpg](ath_3_race_start.jpg) |
| page/reload | page never reloads | 0 reloads | 0 | PASS |  |
| page/jsErrors | no JS errors (pageerror + console.error) | 0 errors | 0 | PASS |  |
| page/memory | JS heap high-water (performance.memory) | 65 MB | INFO (phone cap 700 MB process, NIGHTRUN_LOG) | INFO |  |
