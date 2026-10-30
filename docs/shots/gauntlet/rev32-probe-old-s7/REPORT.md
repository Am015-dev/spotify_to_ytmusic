# Gauntlet rev32-probe-old-s7

2026-10-30T09:33Z · `node tools/gauntlet.js --url http://127.0.0.1:8832/index.html?ivnear=1&latsplit=0 --ver rev32-probe-old-s7 --seed 7 --only hit` · 227 s wall · **3 FAIL** of 10 rows. How to read and extend: [docs/GAUNTLET.md](../../../GAUNTLET.md).

| row | what the player does | number | bar | result | shot |
|---|---|---|---|---|---|
| boot/playVisible | page open → PLAY button visible | 19.2 s lab | INFO (lab, software GL) | INFO | [fra_0_title.jpg](fra_0_title.jpg) |
| boot/toControl | PLAY tap → first control of the car | 91.1 s lab (6x CPU) | <= 8 s lab | **FAIL** | [fra_1_first_control.jpg](fra_1_first_control.jpg) |
| boot/menu | race menu never shows after PLAY (hr/boot) | 0 samples | 0 | PASS |  |
| boot/loader | loader never covers a controllable car (hr/boot) | 0 samples | 0 | PASS |  |
| hud/overControls | HUD text over the touch buttons (first control) | 0 overlaps | 0 | PASS | [fra_1_first_control.jpg](fra_1_first_control.jpg) |
| hud/minText | smallest visible text (first control) | 0 items < 12 px | 0 (CLAUDE.md: 12 px minimum) | PASS |  |
| hit/contact | nose into 5 traffic cars ahead that close on me (oncoming/slower), GAS held in the last 18 m | 3/5 contacts<br><small>miss, closest 26.8 m, hit at 63.7 km/h, hit at 106 km/h, target vanished at 7.37 m, hit at 128.9 km/h</small> | >= 4/5 (hr/hit: contact in >= 9/10) | **FAIL** | [fra_3_hit_2.jpg](fra_3_hit_2.jpg) |
| hit/react | hit car reacts: its HUB position velocity changes > 2 m/s within 0.3-1.2 s | 0/3 contacts<br><small>Δv 0 m/s, Δv 0 m/s, Δv 0 m/s</small> | INFO: this read misses thrown cars (shots show them tumbling); judge by the hit shots | INFO |  |
| hit/noBrake | our speed lost between 12 m and contact (no braking against nothing) | max -2 % | <= 5 % (HITRUN_GAP gap 1) | PASS |  |
| hud/overControls2 | HUD text over the touch buttons (later in roam) | 0 overlaps | 0 | PASS |  |
| page/reload | page never reloads | 0 reloads | 0 | PASS |  |
| page/jsErrors | no JS errors (pageerror + console.error) | 1 errors<br><small>frame threw: TypeError: Cannot read properties of null (reading 'byteLength') at WebGLRenderer.<anonymous> (http://127.0.0.1:8832/index.html?ivnear=1&latsplit=0:9369:87) at WebGLRenderer.<anonymous> (</small> | 0 | **FAIL** |  |
| page/memory | JS heap high-water (performance.memory) | 26 MB | INFO (phone cap 700 MB process, NIGHTRUN_LOG) | INFO |  |
