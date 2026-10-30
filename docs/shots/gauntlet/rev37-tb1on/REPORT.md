# Gauntlet rev37-tb1on

2026-10-30T18:23Z · `node tools/gauntlet.js --url http://localhost:8812/index.html?tb1=1 --ver rev37-tb1on --seed 36` · 466 s wall · **5 FAIL** of 19 rows. How to read and extend: [docs/GAUNTLET.md](../../../GAUNTLET.md).

| row | what the player does | number | bar | result | shot |
|---|---|---|---|---|---|
| boot/playVisible | page open → PLAY button visible | 15.3 s lab | INFO (lab, software GL) | INFO | [fra_0_title.jpg](fra_0_title.jpg) |
| boot/toControl | PLAY tap → first control of the car | 57.2 s lab (6x CPU) | <= 36 s lab at 6x (= ~5 s on an iPhone: 5 s x 7.2-7.3, REVIEW_2K_33, docs/GAUNTLET.md) | **FAIL** | [fra_1_first_control.jpg](fra_1_first_control.jpg) |
| boot/menu | race menu never shows after PLAY (hr/boot) | 0 samples | 0 | PASS |  |
| boot/loader | loader never covers a controllable car (hr/boot) | 0 samples | 0 | PASS |  |
| hud/overControls | HUD text over the touch buttons (first control) | 0 overlaps | 0 | PASS | [fra_1_first_control.jpg](fra_1_first_control.jpg) |
| hud/minText | smallest visible text (first control) | 0 items < 12 px | 0 (CLAUDE.md: 12 px minimum) | PASS |  |
| perf/frame | frame time while driving (real clock, 6x CPU, software GL) | p95 917 ms, 20/20 frames > 50 ms | INFO (lab GL; iPhone truth = perf/ios-reveal) | INFO |  |
| steer/buttons | hold GAS + ◀ (or ▶) for 1.2 s at ~30-50 km/h turns the car that way | ◀ left 55°, left 54° · ▶ right 62°, right 47°<br><small>from 46.1 km/h, from 47.9 km/h, from 45.6 km/h, from 44.7 km/h</small> | each >= 20° the pressed way | PASS |  |
| drive/time | 2 min street drive, gas held, following streets | 120 s game, 1.63 km, avg 48 km/h | >= 110 s game and >= 1.0 km | PASS | [fra_2_street_at_speed.jpg](fra_2_street_at_speed.jpg) |
| drive/frustration | time under 10 km/h with GAS held | 2 % | <= 15 % (bughunt frustration limit) | PASS |  |
| drive/pop | traffic car pops on screen (in view, 6-60 m) | 0 jumps > 2 m, 0 appear < 40 m | 0 jumps > 2 m; 0 appear < 40 m | PASS |  |
| drive/onStreet | bot check: share of the drive on a street (a bot off the street makes the drive rows meaningless) | 94 % | >= 80 % (script validity) | PASS |  |
| drive/offLane | in-view traffic sideways off its lane (junction hand-off residual, 6-60 m; REVIEW_2K_30 rev/latres) | >2 m 2.0 %, >4 m 0.00 % of 2976 samples, 0 samples > 2 m for > 3 s, max 3.21 m (k10 1767>1602@0.42 d38) | INFO | INFO |  |
| drive/near | traffic near the player (HITRUN_GAP gap 8) | 1.3 cars within 40 m (avg)<br><small>avg cars per frame by distance: <40 1.3, 40-80 1.9, 80-150 9.0, 150-300 30.4, >300 15.9; parked 4.3, dead 12.2; standing (<150 m, cv<1) 2.9; cars 75, hour 10.8, hourK 1.00, trHour 1; far(>240 m) cars:</small> | >= 2.5 (hr/near) | **FAIL** |  |
| run/fra | Frankfurt run finished without a script error | Error: page.evaluate: ReferenceError: CRB_side is not defined | no error | **FAIL** |  |
| ath/boot | Athens: PLAY → first control | 113.5 s lab (6x CPU), city ath | control in city ath, <= 36 s lab at 6x (same bar as Frankfurt, REVIEW_2K_33 (i)) | **FAIL** | [ath_1_first_control.jpg](ath_1_first_control.jpg) |
| run/ath | Athens run finished without a script error | Error: page.evaluate: ReferenceError: CRB_side is not defined | no error | **FAIL** |  |
| portrait/boot | portrait 390x844: PLAY → control (1x CPU) | 21.7 s lab | control reached | PASS | [portrait_1_first_control.jpg](portrait_1_first_control.jpg) |
| portrait/band | portrait: the 3D view reaches the bottom of the screen (no flat pale band under the road) | mean brightness of the 84-88 % rows 56 | < 140 (the beta.164 band measures 174: pale blue, no road; gui-r30a near-plane fix) | PASS | [portrait_1_first_control.jpg](portrait_1_first_control.jpg) |
| portrait/hud | portrait: HUD text over the touch buttons | 0 overlaps, 0 texts < 12 px | 0 / 0 | PASS | [portrait_1_first_control.jpg](portrait_1_first_control.jpg) |
| boot/toControl1x | PLAY tap → first control, unthrottled (1x CPU, software GL) | 25.9 s lab (1x) | INFO: <= 15 s (5 s x 2.9, docs/GAUNTLET.md); not a gate | INFO | [fra1x_1_first_control.jpg](fra1x_1_first_control.jpg) |
| page/reload | page never reloads | 0 reloads | 0 | PASS |  |
| page/jsErrors | no JS errors (pageerror + console.error) | 0 errors | 0 | PASS |  |
| page/memory | JS heap high-water (performance.memory) | 0 MB | INFO (phone cap 700 MB process, NIGHTRUN_LOG) | INFO |  |
