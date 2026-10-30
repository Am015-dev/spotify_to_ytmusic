# Gauntlet world-r30f-g

2026-10-30T13:31Z · `node tools/gauntlet.js --build out/w30f --ver world-r30f-g --only boot,world` · 615 s wall · **1 FAIL** of 12 rows. How to read and extend: [docs/GAUNTLET.md](../../../GAUNTLET.md).

| row | what the player does | number | bar | result | shot |
|---|---|---|---|---|---|
| boot/playVisible | page open → PLAY button visible | 38.4 s lab | INFO (lab, software GL) | INFO | [fra_0_title.jpg](fra_0_title.jpg) |
| boot/toControl | PLAY tap → first control of the car | 216.2 s lab (6x CPU) | <= 8 s lab | **FAIL** | [fra_1_first_control.jpg](fra_1_first_control.jpg) |
| boot/menu | race menu never shows after PLAY (hr/boot) | 0 samples | 0 | PASS |  |
| boot/loader | loader never covers a controllable car (hr/boot) | 0 samples | 0 | PASS |  |
| hud/overControls | HUD text over the touch buttons (first control) | 0 overlaps | 0 | PASS | [fra_1_first_control.jpg](fra_1_first_control.jpg) |
| hud/minText | smallest visible text (first control) | 0 items < 12 px | 0 (CLAUDE.md: 12 px minimum) | PASS |  |
| world/quests | 3 quest(s) started by real input (beacon, prompt, LET'S GO): anything drawn inside my car? | 3/3 started, 0 objects in the car body<br><small>q_pigeons d7m v0 opened tapped LET'S GO ▶ started; (abandoned); q_photo d7m v0 opened tapped LET'S GO ▶ started; (abandoned); q_wedding d7m v0 opened tapped LET'S GO ▶ started; (abandoned)</small> | 3/3 started, 0 (gauntlet seen/prop-on-car) | PASS | [world_quest1_start.jpg](world_quest1_start.jpg) |
| world/pickup | drive at the garage 🔧: the icon is readable on the way into its ring | opacity 40 m 1 · 25 m 1 · 12 m 1 | >= 0.75 at 25 m and 12 m (REVIEW_2K_28: 0.31 at 26 m) | PASS | [world_garage_25m.jpg](world_garage_25m.jpg) |
| world/glance | drive past a kiosk/sign/stall 2.5 m to its side at ~40 km/h: the lens inside a drawn object | 0/39 frames inside a prop (tlight, closest 2.8 m); 0 frames inside a building (INFO) | passes <= 4 m from the prop (REVIEW_2K_31), 0 frames (gauntlet seen/camera-in-props) | PASS | [world_glance_kiosk.jpg](world_glance_kiosk.jpg) |
| world/birds | scattered pigeons seen from the car at >= 55 km/h (real drive) | 0/42 bird samples at camera height (0 %), 6 samples | <= 10 % at camera height (REVIEW_2K_28: grey drones 3-8 m up) | PASS | [world_birds_speed.jpg](world_birds_speed.jpg) |
| hud/overControls2 | HUD text over the touch buttons (later in roam) | 0 overlaps | 0 | PASS |  |
| page/reload | page never reloads | 0 reloads | 0 | PASS |  |
| page/jsErrors | no JS errors (pageerror + console.error) | 0 errors | 0 | PASS |  |
| page/memory | JS heap high-water (performance.memory) | 21 MB | INFO (phone cap 700 MB process, NIGHTRUN_LOG) | INFO |  |
