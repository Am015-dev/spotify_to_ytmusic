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

## STATUS at handoff (2026-10-09 12:30 UTC; session stopped by the coordinator at 447k context)
Branch alex/od-quick = v88z src merged with origin/alex/od-world (v88x live, merge clean). Last code change: QS_clear also moves cars on
ramp streets that are close but out of view (LV_seen). Test outputs are committed under qa_ramp/ qa_speed/ qa_mix/ qa_turn/ qa_std/ (force-added).

**Ramps** (qa_ramp/*.log; tools/tRamp.js). Straight run-up from 55 m: 68/68 launch (fra 47, ath 21). Validator log: qa_ramp/fit_{fra,ath}.log
(Athens widths 6.5-7.5 m, Höchst out of the river, 0 'bad'). Route test (ROUTE=1, GPS road path from 150 m back): first full sweep 49/68.
Retry2 of the failures on the latest build, bot waits 12 s behind stopped traffic: ath 8, 9, 14 now launch; ath 11, 17 still fail (3-5 hits,
not stuck); fra 11 launches; fra 0 (Eiserner Steg footbridge deck: the route test starts on a street, the deck may not connect), 6, 7, 14, 18, 19,
20, 21 stuck. Shots of the stuck cases (DBG=1): qa_ramp/fra_stuck6.jpg, fra_stuck7.jpg, fra_stuck19.jpg: the bot rear-ends traffic
queued at a red light ~130 m before the ramp. That is a test-driver limit (no overtaking, my bot), NOT proof the ramp is blocked, but it
is UNPROVEN: next worker should make the route bot overtake/pass on the other lane (like tSpeed's lane offset) and rerun:
  ROUTE=1 node tools/tRamp.js "http://127.0.0.1:8766/local_dbg.html?fast=1" qa_ramp fra 0 6 7 14 18 19 20 21
  ROUTE=1 node tools/tRamp.js "http://127.0.0.1:8766/local_dbg.html?fast=1" qa_ramp ath 11 17
Before-fix evidence: qa_ramp/fra_stuck2.jpg (traffic queued on the ramp itself). Airborne-after-ramp shots: qa_ramp/{fra_ramp0,6,11,14,ath_ramp8,9,17}.jpg.

**Speeds** (qa_speed_dbg.log, qa_speed/hud_*.jpg; tools/tSpeed.js, DEBUG=1 for per-second log). Hot Rod (sports 230/290): Autobahn 230 reached
at ~38 s (then hit something at x≈4064 z≈-3362 at 44 s, so Autobahn boost top not measured); city top 193 (target 189; peaks 214 downhill), city
boost 234 (target 238). 4×4 (SUV 165/195 × 0.93 asphalt): Autobahn 157 / boost 184; city 138. 0-100 km/h 4.1-4.8 s (unchanged).
Turn rate vs speed (qa_turn/v88w_h05.log vs v88z_h05.log, tools/tTurn.js HOLD=30): identical within 0.3 °/s at 50/100/150 km/h for both forms
(car 43.4/18.9/12.4 °/s). Steering code reads the old RO.top, not the class.

**Traffic** (qa_mix/*.json, tools/tMix.js, 2-min drive). Frankfurt live 75: before 28 heavy (37 %), 7 police, 0 bus → after truck 3, delivery 5,
van 6, bus 3, police 2; traffic 58→49 km/h avg (max 86→58). Athens fleet: before taxis 30/75, scooters 8 → after taxis 15/78, scooters 16,
trolleybus 6; traffic 67→43 km/h. Shot qa_mix/after_fra.jpg.

**tPlay** (qa_tplay88z/, MIN=3 phone, merged build) vs v88x live (qa_tplay88x/ 1 min, qa_tplay88x3/ Athens 3 min): fails that live ALSO fails:
stuck fra 19.8 % (live 22.1), stuck ath 5.9 % (live 16.8), Athens reload + loading screen (live too), DRIFT hidden after rotation (live too).
Athens walls 1.99/min vs live 1.2 (all at the Akropolis Cup start x≈2040 z≈-1640, a live hotspot too); Frankfurt walls 0.62 PASS.
perf: fra 213 calls / 1.35 M tris (live 216 / 1.33 M), ath 202 / 0.99 M (live 227 / 1.25 M): no worse.

**Standard shots** (qa_std/, t4/g11drive.js ATH=1): 01_start, 02_frankfurt_drive, 03_side_traffic, 04_side_tyres, 05_athens_start,
06_athens_drive (looked at: fine). Tyre gap: player max 0.03 m, traffic max 0.04 m, 0 over 0.05.
Commands: `ATH=1 node t4/g11drive.js http://127.0.0.1:8766/local_dbg.html qa_std` · `MIN=3 SHOTS=1 tools/tplay_fast.sh <url> <out>` ·
`tools/build.sh v88z --local` (setup: python3 -m http.server 8766 in the repo root; v88w/v88x baselines: git worktree wt_v88w (f0a4e32) / wt_v88x (origin/alex/od-world), build --local inside).

**Left:** route-bot overtaking + rerun the 10 ramps above; Autobahn boost top shot; HUD shots at top/boost for 2 classes are qa_speed/hud_ship_city_*.jpg
and hud_offroad_*.jpg (Autobahn ship shots show the crash, retake); REVIEW (include the turn-rate table, the traffic-off-ramp-streets change and
fra_stuck2.jpg as evidence per the coordinator); then merge/changelog/out/v88z/DEPLOY message.
