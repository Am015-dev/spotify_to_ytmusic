# rev47 SEEN: og3b (HUD kit round 2), BUILT page out/rev47 (3,456,093 B), phone profile (iPhone UA, touch), Frankfurt
Files: `{ON,OFF}_{1roam,2race,3builder}_{land,port}.jpg` (6x CPU), montages `land_ON_over_OFF.jpg` (top row ON) and `port_ON_left_OFF_right.jpg` (left 3 ON), `*_4roam_after_builder_land.jpg`, `feel_ON_race_strip.jpg` (race at speed, 1x), `feel_ON_race_1x.jpg` (frame 16 s into the 1x run: still at countdown "4", see the 1x note). Reference: `ref2k_any_race_street_01.jpg`. ON = `?og1=1&og3=1`. Harness: `shots_rev47.js`, `feel_rev47.js`, `strip_rev47.js`, `reveal_rev47.js`.

Reference (2K race): place top-left, lap and time small top-right, minimap bottom-left, one thin bar on the bottom edge, nothing on the car.

## Landscape 852x393
- **ON is one game.** Roam: the top strip is empty (no "--", no FREE stopwatch); only the thin "4 KM/H" strip with its boost bar sits on the bottom edge. Race: "8TH/8 · LAP 1/1 · 00:00.0" top centre plus the same bottom strip. Builder: "LAP 1/2 · 00:00.6" top centre plus the same strip. Same font, same places. The bottom strip now reads like 2K's thin bar.
- **OFF is still three HUDs**: a top-right "4 KM/H" in roam, the neon race HUD ("00:00.0 8TH/8", "000 KPH"), and the builder's "0 km/h · CAR · CP 0/3 · LAP 1/2" line with a "-/6" plate.
- **Car vs strip.** Race at speed (`feel_ON_race_strip.jpg`): the strip sits under the rear bumper, and the car is fully visible. Measured: the projected car box (`__og3.car()`) ends at y 371–372 and the strip starts at 369, so the boxes touch by 2–3 px (wheel bottoms). That doesn't show in the image. The GO passes because it samples before the chase cam settles.
- Double boost meter gone: no `#boostCells` in any ON view.
- Over the controls: 0 HUD rects over the touch buttons in all 6 ON views (probe `overTouch: []`). OFF builder: the countdown `#bxCd` overlaps `#bxG`, as in rev45.

## Portrait 390x844
- ON: the strip is top centre and the speed pill is top-right under it, in all 3 modes. The builder pill sits under its BUILD/PAUSE/RESPAWN row. Consistent; nothing on the controls. The race pill lies over the 3D start gantry (busy but readable).
- Text: ON has 0 elements under 12 px in all 6 views. OFF race still has "KPH" at 6.24 px.

## Behaviour
- Builder → close → roam: `#touch` is shown and GAS is visible, ON and OFF (`AFTER_BUILDER … gasVis:true`). 0 page errors in all runs.
- **OFF race timer is frozen**: OFF, `raceT` 0.4 s and climbing, but `#tRace` reads "00:00.0" the whole race (`feel_rev47.js OFF`). Cause: og3b dropped `setT(hudEl.tRace,…)` from `updHud` unconditionally (src/40_hud_input_menu.js), not behind `!OG3`. ON is unaffected: `#hkTime` counts.
- 1x on this container: software GL runs game time at about 1/20 of real time (16 s of wall clock = 0.7 s of race), so a real-time feel drive is not possible here. Measured under og3 with GAS held from the countdown: GO at 73 km/h ("PERFECT START"), and the car climbs to 83 km/h while held. Lifting drops it to about 41 km/h, then it climbs again on press. OFF (auto), no touch.
