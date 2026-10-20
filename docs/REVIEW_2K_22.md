# Review #22: why Alex scored the Beta 10/100 (graphics, Athens roads, driving), measured (trunk od-int2 `074f9bc`, built as `rv22`)

Alex played for 5 minutes and wrote: "Athens is a mess; buildings and non-existent huge blocks you pass through; palm trees; roads unusable; NPC cars switch left/right with no brain; cities busy day and night; graphics horrible; driving awful."
Lanes already working on part of this: collide-r21i, flora-r21j, traffic-r21k, density-r21l, athperf-r21m, roads-r21g (graph), escape-r21h. This review covers only what is left: **graphics, the road surface, and driving**.

## How I measured
- **Shots** (I looked at all 12): `docs/shots/rev22/{fra,ath}_{852x393,402x812}_{day,dusk,night}.jpg`, phone emulation (touch, DPR 1), the golden-tool spots (fra boot street, Athens street 1883,-3170), with the time set through `__fl.setT` (.45 / .74 / .05). `probe.json` holds the lights, tone mapping, fog, bloom and image stats (mean luminance, contrast, saturation, black share) for each shot.
- **Road scan** (`scripts/rdscan*.js`, `roadscan_ath.json`): every Athens street in `CITY_S` (1,266 runs, 317 km), one sample every 2 m. For each sample it records the centreline bump (second difference of `groundAt` > 8 cm), the cross step between the centre and 1 m inside each edge (> 25 cm), and `roamHit` (r 1.0 m) at the centre and at ±w/4. A second script (`ramp_in.js`, `ramp_ath.json`) records each `RO.ramps` entry against its nearest street.
- **Tier probe** (`tier_in.js`): `LK_lvl`, `SET.q`, `GFX.tier`, shadow casters and pixel ratio on an 852×393 page with touch and DPR 3.
- **Feel GOs** on the built page: feel/fov, feel/lines and feel/handling **PASS** in both cities (FOV +12°, car 17.5 % of the width in fra and 29 % in ath, yaw 0.51 / 0.34 rad/s at 100 / 150 km/h, slip 0.51 rad at 0.4 s). The review-21 handling fixes are live, so the feel problems below come from the **world**, not the car.
- Caveat: this box renders with SwiftShader. Colours and lighting are as on a phone, but the frame rate is not.

## What the numbers say
| What | Measured | 2K Drive / Forza Horizon reference (described) |
|---|---|---|
| Athens stunt ramps (7 m high, 24 m long) | **33 of 33 sit on a street; 18 cover the full carriageway** (6.5 m ramp on a 7.5 m street, 10 m on 11 m). The **60 worst centreline steps in Athens are all at these ramps** (up to **4.3 m in 2 m**). | Stunt ramps sit off the racing line or beside it, never as a wall across a street |
| Centreline bumps away from ramps | 0 of 60 (the road surface is otherwise smooth) | — |
| Colliders on the carriageway | **0** hits in 167,684 samples (centre and ±w/4) | — |
| Cross step inside the carriageway > 25 cm | 493 samples (about 1 km) on 53 streets; worst **6.8 m** at Vasilissis Amalias 959,-1845 | Flat carriageway; kerbs ≈ 15 cm, only at the edge |
| Street width | **66 % of Athens runs (833 / 1,266) are 7.5–8 m** with two-way traffic; **0 one-way streets** in the data | 2K Drive streets are about 4–5 car widths; narrow alleys are one-way |
| Dusk (t = .74) vs noon (t = .45) | **The same lights**: sun 4.2 `#ffd9a8`, hemi 0.8, exposure 1.0, same sky; screen luminance 95.0 vs 93.6 | Horizon at dusk: orange key light at about 2,500 K, long shadows, pink horizon |
| Phone tier (touch emulation) | `LK_lvl` = **min**, `SET.q` low, `GFX.tier` off: **0 shadow casters**, no sun shadow, pixel ratio **1 on a DPR-3 screen**, no AA, bloom off | Every car and brick sits in a dark contact shadow; edges are clean |
| Asphalt texture (80×40 px crop, no lines, Athens day) | luminance SD **12.6** (flat grey), mean 87 | Textured asphalt or brick tiles, SD about 20–30, decals |
| Night road vs facades (Athens) | road luminance **29**, buildings 65 | Warm lamp pools every 25–30 m; the road is the brightest band |
| Saturation (day) | 0.56 (ath) / 0.63 (fra) | ✅ in range (2K Drive ≈ 0.6) |
| Sky | deep blue, 2 brick-cloud groups visible | ✅ near 2K Drive style |
| Top-HUD area at 852×393 | the quest pill, hint pill, minimap, speed widget and settings button cover **about 20 %** of the screen above the horizon | 2K Drive: about 10 % |

Three causes in the code:
1. Ramps: `buildRoam` places `rfRamps()` with `addRamp(x,z,h,24,7,16)` (`src/70_roam_world.js:199`). In Athens the width is clamped to the street, so the ramp fills the road. Driving the other way, `roamTerr` raises the ground to the ramp top as soon as the car enters the footprint. From the side or the back that is a 7 m wall, or a snap of up to 7 m.
2. Time of day: three layers write the lights in turn. `FL_apply` sets the mood (golden), then `ART_light` (`src/97_art.js:76`) overwrites it, then `GFX_light` (`src/98gx_gfx.js:14-29`) overwrites it again with fixed values whenever `FL.n ≤ .5`. So dusk and noon look the same.
3. Phone tier: below med, `GFX_tier()` returns off. There are no shadows at all, and nothing cheap replaces them, so cars and buildings float.

## Ranked items (player-visible impact per cost)

### 1. Athens stunt ramps block 18 streets with 7 m walls ("roads unusable", "huge blocks")
- **Problem:** see the table. Worst 10 by player impact (all 7 m high, all on the full carriageway): Dimofontos **2894,-2196** and **3084,-2628**; Solonos **676,-1559** (main road, 11 m); Maikina **-2354,-2020**, **-2213,-1966**, **-1625,-1715**; Ethnikis Antistasseos **-3850,2588**; Keiriadon **3122,-1987**; Alexandrou Papanastasiou **-2545,2026**; Kriezi **-5299,4083**. The full list is in `docs/shots/rev22/ramp_ath.json` (18 rows with `w ≥ rw−1`).
- **Target:** 0 ramps whose width is greater than the street width minus 4 m. Ramps only on streets ≥ 14 m wide (offset to one side so a ≥ 4 m lane stays clear) or in plazas. Entering a ramp footprint from the side or back never raises the ground by more than 0.3 m (use a collider there instead).
- **Assert (no graphics):** a unit test or GO `roads/ramps` that, for every `RO.ramps` entry, checks nearest `CITY_S.r.w − r.w ≥ 4` (or a plaza flag), plus a centreline scan of the main Athens component with every 2 m second difference ≤ 0.3 m (now **4.29 m max, 42 spots > 2 m**).
- **Model:** Sonnet. **Effort:** S (placement filter in `rfRamps` for Athens, plus the scan).

### 2. Dusk looks like noon: the time-of-day light is overwritten
- **Problem:** `GFX_light` writes a fixed sun, hemi, sky and fog for every "day" frame (FL.n ≤ .5), after `ART_light` has already overwritten the mood. Golden hour and dawn never show, so the day/night cycle is noon → sudden night.
- **Target:** one owner for daytime light. `GFX_light` takes colour and intensity from `FL_at(t)`. At t = .74: sun colour R/B ≥ 2.0 (≤ 3,000 K look), sun 2.4–3.2, hemi 0.5–0.7 tinted pink/violet, sky horizon R − B ≥ 0.3, screen mean luminance 0.75–0.9 × noon, and sun elevation ≤ 15° (long shadows). Noon stays as it is today.
- **Assert:** GO `gfx/tod`: `__fl.setT(.45/.74/.05)` + `__fl.apply()`, then read `moonL.color`, `moonL.intensity`, `hemi.intensity` and `SKYU.uHor`. The noon, dusk and night tuples must all differ and fall in the bands above. No pixels needed.
- **Model:** Sonnet (lighting and integration). **Effort:** M.

### 3. Phones get no shadows at all, and the picture is soft and jaggy
- **Problem:** on the phone tier (`LK_lvl` min / q low) the sun casts no shadow, there are 0 casters, no contact shadows, pixel ratio 1 on a 3× screen and no AA. Cars float on the road and buildings look like flat cards. This is the largest gap to 2K Drive in every shot. First check the real tier on iPhones in the telemetry session doc (`LK.log`): if iPhones sit on min, this is what Alex saw.
- **Target:** on **every** tier, a contact-shadow blob under the player and every traffic car (instanced, one draw call, opacity 0.35–0.5, follows the ground) and a dark AO strip at building bases (baked into the facade texture or vertex colour). On med: a 1024 sun shadow inside an 80 m radius. Render scale ≥ 1.5 on touch, unless the governor dropped it, or an FXAA pass when it is below 1.5. Must still pass perf/ios-reveal (6× CPU, 0 shader links after reveal).
- **Assert:** GO `gfx/contact`: every visible car (player + `TRF`) has a visible blob child, `renderer.getPixelRatio() ≥ 1.5` on touch with `LK.drop = 0`, and the perf/ios-reveal tag still passes.
- **Model:** Sonnet. **Effort:** M.

### 4. Streets too narrow for two-way traffic at speed
- **Problem:** 66 % of Athens runs are 7.5–8 m wide and carry two-way traffic, and the data marks none as one-way. With a car about 2.3 m wide (confirm `RO.cw`) and oncoming traffic, there is about 1 m clearance per side at 100 km/h. The player has no line to take, which also makes the traffic look erratic.
- **Target:** every res/sec street in the main drivable component either has a carriageway ≥ 10 m (Athens width scale about 1.3, with facades set back to match) or is one-way for traffic (`r.one = 1` on < 9 m streets, about 60 % of them, the way Plaka really is).
- **Assert:** a unit test over `CITY_S` in the main SCC (roads-r21e `scc.js`): every run has `w ≥ 10 || one`. Plus GO `traffic/oneway`: no traffic car on a `one` street drives against its direction.
- **Model:** Opus plan first (city-layout trade-off: building set-back, or one-way, and the graph), then Sonnet. Give it to roads-r21g once its graph target is done. **Effort:** L.

### 5. Terrain steps inside the carriageway
- **Problem:** 53 streets have a > 25 cm height step between the centre and 1 m inside the edge (about 1 km in total). Worst: **Vasilissis Amalias 959,-1845 (6.8 m)** and 977,-1957; Kifisias **-3344,2595** (88 m long) and -2969,2041; Attiki Odos -4424,5767; Aristeidi Vekiareli **-3518,2827** (8 m street, 78 m long); Marathonodromou -3121,2305; Kallirois 1744,-3151. A car drifting toward the kerb hits a wall or rolls.
- **Target:** cross step ≤ 0.15 m across the carriageway everywhere (flatten the terrain under the road strip, `w/2 + 1 m`).
- **Assert:** the item-1 scan extended with the cross step: 0 samples > 0.15 m (now 493 > 0.25 m).
- **Model:** Sonnet. **Effort:** S–M.

### 6. Road surface reads as flat grey
- **Problem:** asphalt luminance SD is 12.6 in an 80×40 crop (Athens right lane), with no grain, joints or decals. 2K Drive roads carry a visible texture (tile or brick seams, patches, manholes) that also makes speed easier to read.
- **Target:** asphalt SD 18–28 in the same crop at 852×393 (no lines); lane markings ≥ 3:1 contrast to the asphalt; a decal (manhole, patch or crack) every ≤ 25 m on main roads. Texture via a tiled map (≤ 256 px, repeat ≤ 4 m), so there is no new shader.
- **Assert:** no graphics: road material has `map` set and repeat in range, and the decal count per km ≥ 40. One golden view (ath-street) updated after a look.
- **Model:** Sonnet. **Effort:** S.

### 7. Night streets are dark; the light sits on the facades
- **Problem:** at night the Athens road averages luminance 29 and the facades 65. The windows glow, but there are no lamp pools, so the drivable surface is the darkest thing on screen.
- **Target:** road luminance ≥ 45 within 30 m of the camera at night; lamp pools (emissive ground decals, not real lights) every ≤ 30 m on main/arterial/sec streets; keep bloom threshold 1, strength 0.75.
- **Assert:** count of lamp-pool decals per 100 m of main road ≥ 3, and `FL.n = 1` turns them on. The luminance check stays on the golden night view.
- **Model:** Sonnet. **Effort:** S–M.

### 8. Top HUD covers about 20 % of the landscape view
- **Problem:** at 852×393 the quest pill, the "HIT FAST = SMASH" hint, the minimap (100 px), the speed widget and the settings button take the top fifth of the screen, right where the road vanishes.
- **Target:** visible HUD area outside the touch-control zones ≤ 12 % of the viewport in landscape. The hint pill hides after 4 s of driving, and the quest pill shrinks to one line ≤ 300 px wide once driving.
- **Assert:** GO `ui/hud-area`: sum of the visible HUD rects (the same list as golden `DOMRULES`) ÷ viewport area ≤ 0.12 after 5 s of gas, at 852×393 and 402×812.
- **Model:** Sonnet (UI). **Effort:** S.

### 9. Unknown pale rectangle on the Athens carriageway
- **Problem:** a pale blue-white slab about 100 m ahead on the Athens boot street (all three times of day, both orientations; see `ath_852x393_day.jpg` at the centre of the horizon). It is either a water or puddle decal z-fighting with the road, or a flat prop. Alex's "blocks you pass through" may include it.
- **Target:** identify it and keep it only if it belongs there. No coplanar decal within 2 cm of the road without `polygonOffset`.
- **Assert:** a unit scan of hub meshes whose bounding box is flat and within 0.02 m of `groundAt` without `material.polygonOffset` returns 0.
- **Model:** Sonnet. **Effort:** S.

## Driving: what is fine and what to leave to other lanes
- The car's own feel passed its GOs today (FOV, speed lines, yaw at speed, drift snap). The rest of "driving awful" in Athens is items 1, 4 and 5 (walls, width, steps), traffic (traffic-r21k) and trap escape (escape-r21h, which also covers BOT_REPORT finding 2, the 4 s stuck rule).
- Props on the road do not stop cars: 0 colliders on any lane in 167,684 samples. The building pass-through problem belongs to collide-r21i.
- Palm trees belong to flora-r21j, and density by time of day to density-r21l.

## Order for the coordinator
Items 1 and 5 are one Sonnet lane pair (same scan, same file area, the biggest "roads unusable" win for the least cost). Then 2 and 3 (graphics: one owner for light, then shadows on phones; 3 needs the iPhone telemetry check first). 8 and 9 are small. 6 and 7 come after 3. Give 4 to an Opus plan once roads-r21g is done.
