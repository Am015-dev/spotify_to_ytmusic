# Worker 16 (boost-2K) handoff

Branch `alex/od-boost16` (from od-garage7 = live v87p, verify_live LIVE_MATCH at start).

## What is in it
- NEW `src/98k_boost2k.js` (in `src/ORDER` before `99_api.js`). All the logic is here:
  - Drift: GAS+BRAKE+steer (two fingers, or ONE thumb on the seam between BRAKE and GAS, or keys Up+Down+steer) sets `c.hb` in a
    `ctlPlayer` wrapper. Drift speed ≥ 12 m/s (`window.B2K_DMIN`). A pink drift bar fills (slip and speed weighted) and pays ×0.55 into
    the boost meter when the drift ends. The old drift trickle (8/s, and 6 per tier at the end) is taken back in the roamStep wrapper.
    The mini-turbo is unchanged. Pink ribbon trail from the rear tyres.
  - Smash: `FL_smash` wrapper adds +4 on top of the FL chain bonus, plus a "+N BOOST" pop by the meter and a cyan burst. The old `#flPop` is hidden (duplicate).
  - Meter HUD `#b2kM`: pink bar over a cyan 10-segment bar, bottom centre above the speed readout; dims if `#roamPrompt` overlaps it.
    Roam regen is net 4/s (FL_RECH 9 − 5).
  - Boost on a FULL meter: burst (0.4 s turbo, FOV kick, shake, "FULL BOOST!"). Turbines pop out while boosting. They are a scene-level group
    synced to `car.matrixWorld` in `onBeforeRender`, because race cars are 1.5× bigger and face −z.
  - Brickbash: boost held 2 s. Gold meter + "BRICKBASH!", +turbo 0.12, drain refunded to 14/s, short invulnerability. Roam traffic within 7.5 m
    tumbles (`CR_tumbleStart` + debris). Races expose `B2K.bash()` (race 15 got the API message).
  - Hop: swipe up on GAS (≥26 px within 0.5 s, measured from where the thumb last rested, so a thumb held on GAS for minutes still works).
    In roam it sets `pressed.fire` (existing hop, works on water too). In races `B2K.hop()` returns it (race items keep `pressed.fire`).
  - Touch hint text: NPC/tutorial "Hold DRIFT" becomes "Hold GAS+BRAKE" and "HOP" becomes "HOP (swipe GAS ▲)" (wraps `QA_untouchKeys`).
- ONE hook in `src/71_roam_drive.js` line 25: `sp>(window.B2K_DMIN||22)` (was `sp>22`), marked `// B2K hook`.

## Tests (t16/)
- `node t16/b2k.js <url?fast=1> <out> [fra|ath]` runs the roam scenario `t16/scen.js` (real CDP touch: accelerate, boost to Brickbash, smash,
  two-finger drift, seam-thumb drift, GAS swipe hop) and writes shots + res.json.
- `SC=./scen_water.js node t16/b2k.js …` drives to the Main, then hops as a boat. `SC=./scen_perf.js` gives ms/frame + tyre gap.
- `node t16/race.js <url?fast=1> <out>`: quick race, touch drift + boost + Brickbash, shots.
- `t16/tPlayDbg.js` = tools/tPlay.js + a dump of the B2K counters (tPlay never drifts or hops on phone: DRIFT is hidden and it never holds GAS+BRAKE).

## Numbers (fra, phone, real touch)
Drift 1.0 s → bar 25–29 → +14–16 boost, slip avg 20–28°, max 40–48°. Seam-thumb drift 1.7 s → bar 36. Smash +8–10 each.
Brickbash after 1.83 s held, 55 → 183 km/h. Hop 2.4 m ground, 2.35 m water (boat). Race drift 1.14 s → +16.9, slip 22°/41°.

## tPlay (MIN=4, FAST) live vs new
Run-to-run noise is large (the same build gave Athens walls 0.97 and 3.62). The 1.1 s full-boost turbo made tPlay 23% faster in fra (more traffic and wall hits),
so it is now 0.4 s. Results after that are in qa16/tpG.out.
