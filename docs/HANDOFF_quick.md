# HANDOFF_quick: v88z quick wins (ramps, speeds, traffic mix), branch alex/od-quick (draft PR #76 → alex/od-src)

Base: v88w src f0a4e32 (live). Brief: coordinator Q1–Q3 = docs/CITY_LIFE_PLAN.md on alex/od-onfoot (fc80664b), sections 1, 3, 4.
All new code is in `src/98qs_speed.js` (prefix `QS_`, in ORDER right before 99t_tune.js). Small hooks elsewhere (one line each):
- 60_city_build.js: `const k=QS_kind(i)` (weighted type pick), `v:QS_v0(k)` and the Athens scooter speed.
- 93_cars_lego.js: `case'bus':A=BC_bus()` (the city bus reuses the big-car bus; HCAR 'garbage-truck' → 'bus' at load, same draw count).
- 90_fixes_cv_ju.js: OB_cdim knows 'bus'; CV turn pre-choice skips `QS_shut` edges.
- 70_roam_world.js: traffic next-edge skips `QS_shut`; addRamp's base = min(ground at centre, ground at entry); RO.ramps entries carry `col`.
- 71_roam_drive.js: `tt=TUNE.spOn?QS_tt(lvl,fit*V85OFF):…old…`.
- 99_api.js: the weight layer cap `vm` = RO.qsV / RO.qsVB (was the fixed CR_VMAX 174 / CR_VBOOST 224 km/h: THE reason no car ever went faster).
- 98l_lively.js: parked cars never on a ramp run-up (`QS_rampNear`).
- 99t_tune.js: knob rows (Engine: sp*, Life: tr*, rampClear, rampFit). tune.json + docs/TUNE.md "v88z" section.
  (TUNE.md still describes my first speed design, real tops with ×0.66 city; update it to the plan's table below.)

## What it does
1. Speeds (roam only), per class [roam top, boost top] km/h, open road + Autobahn; city streets × spCityK 0.82:
   sports (Hot Rod, tuners, roadster, coupe) 230/290 · supercar (Poseidon GT, Gold Rush, hypercar) 260/330 · SUV/4×4/limo 165/195 ·
   van/monster 130/150 · truck/bus 90/100 · city car 150/175 · boat 90/105. Level + BOOSTER upgrade multiply, cap spMax 345.
   Steering/camera still use the OLD RO.top → same handling at a given speed.
2. Traffic: weighted mix, even slots (the half DR_traffic keeps) carry the exact mix. Frankfurt [sedan50,hyper6,taxi12,van12,truck6,
   delivery9,police3,timecoupe18,bus6,tuner15,roadster13]/150 → trucks 4 %, buses 4 %, police 2 %. Athens [taxi30,sedan35,van10,suv15,
   delivery5,sports5,troll7,scoot33,tuner5,tuner5] → scooters 22 %, taxis 20 %. Cruise: city 55±10 % (heavy 45, scooter 45), Autobahn
   100-130 (trucks 80-90), set per edge in QS_clear. trHour: live count × QS_hourK/1.2 (rush 1.2, day 1, evening .7, night .35; Athens 15h 1.2,
   night .5) by hiding far cars (c.dead 20-40 s).
3. Ramps: ROOT CAUSE found with tRamp ROUTE=1 (fra_stuck2.jpg): traffic queued on the ramps' run-ups (ramps sit across the lanes).
   Fix: QS_shut closes the street edges under a ramp's run-up/ramp/landing to traffic; cars on one out of sight move off; no parking there.
   Plus the plan's validator (QS_rampFit wraps addRamp, Y0==null ramps except OTG roof): snaps to the nearest road (city/LZ/Taunus,
   ≤400 m), heading = road, width ≤ road−1 m (Athens ramps now 6.5-7.5 m), run-up 30 m + landing 40 m free of colliders/water/junctions,
   slides ±160 m along the road; Autobahn shoulder ramps kept. Log: `__qs.ramps()`; tools/tFit.js prints it (qa_ramp/fit_*.log:
   Höchst ramp moved out of the river 244 m; 0 'bad' in fra/ath after the last change, 2 Taunus ramps on slopes accepted).

## Tests (tools/, all real keyboard/touch input; warps only to start a measurement)
- `tools/tRamp.js <url> <out> fra|ath [ids]` (ROUTE=1 = drive the GPS road route from 150 m back; DBG=1 shots when stuck).
- `tools/tSpeed.js <url> <out> ship,offroad` (Autobahn + longest city street; SHOTS=1 HUD shots; changes lanes around traffic).
- `tools/tMix.js <url> <city> 2 [shot]` (2-min drive, unique traffic within 120 m by type). Before = wt_v88w/local_dbg.html (git worktree of
  f0a4e32, excluded in .git/info/exclude).
- Running at handoff: tRamp ROUTE both cities → qa_ramp/{fra,ath}.log; tSpeed → qa_speed.log; tMix before/after → qa_mix/*.json.
- Last speed result (before the plan values): city 167 / boost 195 km/h; Autobahn reached 249, then the run fell to ~50 (cause not yet found:
  rerun with DEBUG=1 and read the per-second log; the car is not wrecked).

## Still to do
1. Read the runs above; fix any ramp that fails ROUTE; check Autobahn speed drop.
2. tPlay on the split build (`FAST=1 node tools/tPlay.js` per the gate): wall hits ≤1/min with the faster city (0.82 × 230 = 189 km/h).
3. perf: draws/tris vs v88w (tPlay prints perf per city).
4. FULL review shots 852×393 (standard set + 3 previously unreachable ramps driven onto + HUD at top and boost top for 2 classes + traffic mix
   per city + tyre gap), LOOK at them, then REVIEW to session_01Y6FYerWwxv43FuKUcaUT4v with the ramp and speed tables.
5. After PASS: merge latest alex/od-world, alex/od-garage12 (if pushed) and live; rebuild on CURRENT live; OD_CHANGELOG v88z entry + checklist;
   `tools/build.sh v88z`; `git add -f out/v88z`; push; DEPLOY message to the coordinator (session_017iH3DB4VyxwKSdMwsco4Ut). Never deploy.sh.
Gotcha: never `pkill -f <pattern>` in a command whose own text contains the pattern (it kills the shell: exit 144).
