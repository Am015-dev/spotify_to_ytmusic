# Gauntlet world-r30d-w

2026-10-30T06:17Z · `node tools/gauntlet.js --build out/w30d --ver world-r30d-w --only boot,world` · 605 s wall · **3 FAIL** of 12 rows. How to read and extend: [docs/GAUNTLET.md](../../../GAUNTLET.md).

| row | what the player does | number | bar | result | shot |
|---|---|---|---|---|---|
| boot/playVisible | page open → PLAY button visible | 36.4 s lab | INFO (lab, software GL) | INFO | [fra_0_title.jpg](fra_0_title.jpg) |
| boot/toControl | PLAY tap → first control of the car | 235.4 s lab (6x CPU) | <= 8 s lab | **FAIL** | [fra_1_first_control.jpg](fra_1_first_control.jpg) |
| boot/menu | race menu never shows after PLAY (hr/boot) | 0 samples | 0 | PASS |  |
| boot/loader | loader never covers a controllable car (hr/boot) | 0 samples | 0 | PASS |  |
| hud/overControls | HUD text over the touch buttons (first control) | 0 overlaps | 0 | PASS | [fra_1_first_control.jpg](fra_1_first_control.jpg) |
| hud/minText | smallest visible text (first control) | 0 items < 12 px | 0 (CLAUDE.md: 12 px minimum) | PASS |  |
| world/pickup | drive at the garage 🔧: the icon is readable on the way into its ring | opacity 40 m 1 · 25 m 1 · 12 m 1 | >= 0.75 at 25 m and 12 m (REVIEW_2K_28: 0.31 at 26 m) | PASS | [world_garage_25m.jpg](world_garage_25m.jpg) |
| world/quests | 3 quests started by real input (beacon, prompt, LET'S GO): anything drawn inside my car? | 0/3 started, 1 objects in the car body (q_pigeons:Mesh<Group{lz,pcN,pcV}{lf,lfR,nsh} 2.1m)<br><small>q_pigeons d325m v74 no card; q_thief d208m v78 no card; q_photo d339m v102 no card</small> | 3/3 started, 0 (gauntlet seen/prop-on-car) | **FAIL** | [world_quest1_start.jpg](world_quest1_start.jpg) |
| world/glance | drive past a kiosk/sign/stall 2.5 m to its side at ~40 km/h: the lens inside a drawn object | 1/24 frames inside a prop (stop, closest 75.1 m) Mesh<Group{lz,pcN,pcV}{lf,lfR,nsh} 5.1m; 0 frames inside a building (INFO) | 0 frames (gauntlet seen/camera-in-props) | **FAIL** |  |
| world/birds | scattered pigeons seen from the car at >= 55 km/h (real drive) | 0/60 bird samples at camera height (0 %), 6 samples | <= 10 % at camera height (REVIEW_2K_28: grey drones 3-8 m up) | PASS | [world_birds_speed.jpg](world_birds_speed.jpg) |
| hud/overControls2 | HUD text over the touch buttons (later in roam) | 0 overlaps | 0 | PASS |  |
| page/reload | page never reloads | 0 reloads | 0 | PASS |  |
| page/jsErrors | no JS errors (pageerror + console.error) | 0 errors | 0 | PASS |  |
| page/memory | JS heap high-water (performance.memory) | 22 MB | INFO (phone cap 700 MB process, NIGHTRUN_LOG) | INFO |  |
