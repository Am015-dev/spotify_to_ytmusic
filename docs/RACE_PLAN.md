# RACE PLAN (race worker, 2026-10-09): "we have functionalities but the races are boring"

## 0. The reference
Video: youtube.com/watch?v=UDpcEFCvkEo, "Lego 2K Drive – Rival Race Max Speed, Chasm Crossing, Hauntsborough – Story Mode", 308 s.
- The video download itself was blocked here (YouTube bot check, HTTP 403).
- What I did get:
  - the 4 HD thumbnails (start, 25 %, 50 %, 75 %);
  - the full YouTube storyboard: 65 frames, one every ~4.7 s, 160×90, via yt-dlp `-f sb0`.
- Saved in `docs/race_ref/`:
  - `hd_*.jpg` (1280×720);
  - `01…11_*.jpg` (storyboard tiles upscaled ×4, blurry but readable);
  - `storyboard_0..2.jpg` (the raw sheets).
- Web: speedrun.com lists Chasm Crossing (best 2:07.81 for 3 laps, so ~43 s per lap).
- Reviews (2023) describe the 2K Drive race systems:
  - Boost fills from smashing and drifting; a full meter gives a ram state.
  - Glowing item orbs.
  - Rubber-banding, criticised as "lose first place at the last moment through no fault of your own" (ramblingbrick, gamespot, godisageek, checkpointgaming).

### Traits seen in the frames (frame index × 4.7 s ≈ video time)
| trait | what the frames show | frame |
|---|---|---|
| Pre-race | Intro card: track name, RIVAL portrait and name, first-place prizes, PRESS TO START, a glowing start ring on the ground. Then a ~20 s flyover of the track with a big title logo | 1–6, hd_intro_card |
| Countdown | The camera sits beside the player's car (side and front view of the car), with a huge yellow "3"; at "1" it is behind the car, the start gate ahead and rivals' name tags with position numbers | 7, hd_countdown |
| Grid | **The player starts 8TH, at the back**, with the whole pack ahead in view | 8, hd_countdown |
| First minute | 8th → 7th → 5th → 4th → 1st in ~25 s of racing: overtakes through the pack are the opening act | 8–12 |
| Boost | Twin boost jets visible in ~60 % of race frames: boost is used constantly, not rationed | 9–50 |
| Mid race | Mostly 1st, but lap 2 drops to 2nd/3rd/4th/6th/3rd (items, pack fights), then back to 1st: the pack stays close | 30–42 |
| HUD | Big ordinal position top-left (8TH), 8-name standings list (desktop), LAP 1/3 + race time top-right, minimap bottom-left, boost arc bottom-centre | all |
| Track | Cobble/dirt road ~3–4 cars wide, grass and hills at the edges (no walls), fences, pumpkins, white bracket checkpoint gates, chevron boards at corners | 12–50 |
| Air | Jumps off ledges with long air time; WRONG WAY + respawn timer | 46, hd_jump |
| Laps | 3 short laps (~45 s each) | 7–51 |
| Finish | "1ST" big letters + an orbiting camera around the car → "YOU WON A FLAG!" → "RIVAL BEATEN!" (rival minifig) → RESULTS + PRIZES → back in the world: a crowd of minifigs cheering around a podium disc | 51–55, hd_finish |

## 1. Our races before (live v89b1 src, `tools/tRace.js` phone 852×393, real touch, fast mode, HQ shots in `qa_race/base`)
| | grand (Frankfurt) | hafen (Frankfurt) | akro (Athens) |
|---|---|---|---|
| race length (1 lap) | 120 s | 80 s | 114 s |
| player place every 10 s | 1 1 1 3 2 1 1 1 1 1 1 2 | 1 1 2 2 2 2 4 | 1 1 1 3 3 1 1 1 2 6 6 |
| final place | 2/8 | 5/8 | 6/8 |
| time with a rival within 20 m | 37 s (31 %) | 36 s (45 %) | 60 s (52 %) |
| field spread 1st→last at 60 s | 365 m | 257 m | 145 m |
| overtakes (all cars) / player place changes | 45 / 6 | 31 / 12 | 53 / 14 |
| jumps / boosts / items | 5 / 14 / 8 | 3 / 7 / 3 | 1 / 14 / 4 |
| dead stretches ≥6 s (nothing near, no event) | 7.3, 6.7, 9.8 s | 7.2 s | 7.0, 6.3, 6.6 s |

**Why it is boring, in numbers:**
1. **The player starts on POLE** (`setupRace`: the player is ship n−1, which is grid slot 0). He leads from the first metre: 1st in 75 % of the 10 s samples on grand. There is no one to chase and no opening climb.
2. **Then the rubber band steals the end.** AI behind the player got up to +13 % speed at 260 m. They catch up late and pass: akro went 1st → 6th in the last 20 s, hafen 2nd → 5th. This is exactly the 2K criticism ("lose first place at the last moment").
3. **The checklist strip** (Alex's test checklist) sits top-centre during the whole race and covers the "2ND FINISH" banner (shot `qa_race/base/grand_phone_end.jpg`).
4. The countdown is a plain chase view with a small number. The finish goes straight to a table: no car showcase, no podium.

## 2. Ranked changes (what the reference and the numbers support)
1. **Start at the back** of a tight grid (8th, best AI on pole): the 2K opening climb. *(done, RF)*
2. **Fair rubber band**:
   - In the first 65 % of the race, AI more than 35 m ahead wait (up to −10 %) so the pack stays reachable.
   - The catch-up from behind (up to +9 %) fades to 20 % over the last 25 %, so nobody steals the win at the line. *(done, RF_rub)*
3. **Place-change feedback**: ▲ 4TH / ▼ 5TH pop under the position counter. *(done)*
4. **Countdown showcase**: the camera swings from the car's nose to behind it during 3·2·1 (frame 7). *(done)*
5. **Finish**: orbit camera around the car, plus a top-3 podium strip on the results with RIVAL BEATEN! in rival races. *(done)*
6. **The checklist folds to its chip** during the countdown, the race and the finish. *(done)*
7. Next, not done (the numbers don't demand them yet; 5. in the lessons says less is more):
   - checkpoint gates with split gaps;
   - 2–3 shorter laps (tracks are 4–7 km, so a 1-lap race is already 80–120 s);
   - a bigger ordinal position HUD;
   - the crowd podium scene in the world.

## 3. After (RF build) — see the bottom of this file (filled in after the tRace runs)

## 3. NEW SCOPE (coordinator, 2026-10-09 16:34): wide open race courses (Alex scored the narrow city races 2/10)
Alex: "the screenshots give lot of freedom to run in the track with multiple roads and terrains/water to leverage the builds of all 3 cars. ours is quite narrow. When the car falls off a cliff it respawns, so the fun is kept."
Mandatory before REVIEW: (1) ≥1 open course per city outside the blocks: road ≥14 m, drivable terrain ≥30 m each side, ≥2 alternative routes (off-road shortcut + water), ≥2 big jumps, a cliff/drop; rounded colliders, walls only at the edges. (2) Auto 3-vehicle swap by surface (garage builds per slot). (3) Respawn: cliff, deep water, upside down 2 s, wrong way 3 s → "SPAWN IN 3" + tap/R; never end the race. (4) Rivals use the alt routes. (5) Loaded only on race entry; split ≤3.6 MB; phone fps ≥ city.
Gate: 852×393 shots NEXT TO the matching ref frame (start pack, wide mixed terrain, shortcut, water/boat swap, jump, cliff respawn, finish), sent to the coordinator BEFORE the REVIEW; tRace on the new course: % time ≥2 rivals on screen, route choices, respawns.

### 3.1 What already exists (code map, file:line in src/)
- Races are 1D: a car is `dist` along the centreline + lateral `x`; `frameAt(td,s)` 10_core.js:680; `buildTrackData` :653 (CatmullRom of `def.cp` [x,y,z,'SECTOR']). Width `W=R15_trackW(def)` = `def.w15||38` (20_race_world.js:361), HALF=W/2. "Walls" = clamp of x to `R15_b()` (31_race_r15.js), no colliders.
- Every race already has its own WORLD built by `loadTrack(id)` (20_race_world.js:362) on race entry → (5) streaming is satisfied by construction; keep the course procedural (tiny bytes).
- Surface: `waterStep` (20_race_world.js:299): `R15_ter(s)` first, else water when track y < WATER_Y=-5.5, dirt when the sector name has 'PISTE'. Sets s.boatMode/s.dirtMode → `vehMode` (:616) swaps car/4x4/boat; `CR_vis` (93_cars_lego.js:233) shows the garage brick model + per-form stats `CR_LOAD.car/4x4/boat` (garage slots `mho_gar.off/.boat`, 98_garage_driver.js:171-207). → (2) mostly exists; needs the LEGO poof + per-surface speed balance.
- Shortcuts: `R15_find` ≤2 corridors (water, dirt) inside bends, AI take them by skill roll (`R15_aiXt`). Jumps: def.jumps kinds river/pit/sky (10_core.js:668), `crashJump` 30_race.js:384 (dead=1.6, put at s1+30).
- Respawn: only after crashJump/explode (`dead` → revive in stepSim 30_race.js:486). Wrong way only shows text (`s.wrong`, :370). No roll (yaw clamped ±1.5) → "upside down" = wreck/explode case.
- Garage builds per slot: exist.

### 3.2 Design (in progress, module 98rf_race_fun.js unless it grows; then 98ro_open.js in ORDER before 99_api)
- OPEN COURSE = a track def with `open:1, w15:96` (HALF 48): asphalt road |x|≤7 (yellow centre line), drivable terrain 7–45 m each side (grass/dirt/sand by sector), rounded rock/fence edge at ±HALF only. No buildCity: own `RO_build()` makes a terrain ribbon + hills beyond ±HALF (heightfield along the frames), tree/rock clusters, a skyline silhouette (Frankfurt) / Parthenon + sea (Athens).
- Surface by x in R15_ter hook for open defs: |x|≤8 road → car; terrain → 4x4; sector 'WATER' (full width, river/sea crossing) → boat; 'CLIFF' sector: x beyond the cliff lip (one side) → fall: dead=1.6, respawn banner.
- Route choice matters: terrain inside of a bend is shorter (ds=v/(1-k·x) already) but bumpy (top ×0.94 for the 4x4 off its tuned top); water: boat lane with boost rings; each form tuned fastest on its own surface (car 1.0 road / 0.8 terrain impossible since auto-swap; so tune 4x4 top on terrain = 0.97 car-road top, boat on water = 0.95 + rings).
- Courses: `fra_ufer` "Main Riverbank Rally" (riverbank road, park hills, Main crossing by water, a quarry cliff, 2 ramps over a creek and a rail cut), `ath_akti` "Saronic Coast Rally" (coastal hill road, beach sand section, sea crossing, cliff above the sea, 2 ramps). Placed in their own WORLD, so coordinates are free (keep y via cp).
- AI: per-AI per-lap route roll by skill: inside-terrain line on bends (xt toward the inside up to 30 m) or road line; everyone boats across WATER.
- Respawn: DONE in RF8 (98rf): wrong way ≥3 s or stuck (<4 m/s) ≥3 s → "WRONG WAY! SPAWN IN 3 · TAP" banner (#rfRsp, 44 px, top centre), auto at 0; tap or R (capture listener; R otherwise restarts the race) → x=0, yaw 0, v=35 % top, inv 2, dist kept (place kept). During dead>0 (fall/wreck) the banner says "RESPAWN · TAP" and tap revives at once. Counter `RSP.n`.
- tRace metrics to add: % time ≥2 rivals on screen (project AI mesh positions with the camera), route choices (|x|>10 on terrain, water sectors), respawns (RSP.n via __rf.st()).
