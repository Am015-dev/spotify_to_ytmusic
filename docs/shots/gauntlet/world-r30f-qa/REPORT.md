# Gauntlet world-r30f-qa

2026-10-30T14:29Z · `node tools/gauntlet.js --build out/w30f --ver world-r30f-qa --only ath,athq` · 4822 s wall · **2 FAIL** of 12 rows. How to read and extend: [docs/GAUNTLET.md](../../../GAUNTLET.md).

| row | what the player does | number | bar | result | shot |
|---|---|---|---|---|---|
| boot/playVisible | page open → PLAY button visible | 52.1 s lab | INFO (lab, software GL) | INFO | [fra_0_title.jpg](fra_0_title.jpg) |
| boot/toControl | PLAY tap → first control of the car | 271.4 s lab (6x CPU) | <= 8 s lab | **FAIL** | [fra_1_first_control.jpg](fra_1_first_control.jpg) |
| boot/menu | race menu never shows after PLAY (hr/boot) | 0 samples | 0 | PASS |  |
| boot/loader | loader never covers a controllable car (hr/boot) | 0 samples | 0 | PASS |  |
| hud/overControls | HUD text over the touch buttons (first control) | 0 overlaps | 0 | PASS | [fra_1_first_control.jpg](fra_1_first_control.jpg) |
| hud/minText | smallest visible text (first control) | 0 items < 12 px | 0 (CLAUDE.md: 12 px minimum) | PASS |  |
| hud/overControls2 | HUD text over the touch buttons (later in roam) | 0 overlaps | 0 | PASS |  |
| ath/boot | Athens: PLAY → first control | 328.0 s lab, city ath | control, city ath | PASS | [ath_1_first_control.jpg](ath_1_first_control.jpg) |
| world/quests-ath | 1 quest(s) started by real input (beacon, prompt, LET'S GO): anything drawn inside my car? | 0/1 started, 0 objects in the car body<br><small>atc_koulouri d704m v-5 no card</small> | 1/1 started, 0 (gauntlet seen/prop-on-car) | **FAIL** | [ath_quest1_start.jpg](ath_quest1_start.jpg) |
| ath/drive | Athens: 60 s drive following streets | 60 s game, 1 % under 10 km/h, 0 pops | >= 55 s, <= 15 % slow, 0 pops | PASS | [ath_2_drive.jpg](ath_2_drive.jpg) |
| ath/race | Athens: pause → QUIT → RACES → START reaches the grid | quit true races true start true grid true | grid reached | PASS | [ath_3_race_start.jpg](ath_3_race_start.jpg) |
| page/reload | page never reloads | 0 reloads | 0 | PASS |  |
| page/jsErrors | no JS errors (pageerror + console.error) | 0 errors | 0 | PASS |  |
| page/memory | JS heap high-water (performance.memory) | 468 MB | INFO (phone cap 700 MB process, NIGHTRUN_LOG) | INFO |  |
