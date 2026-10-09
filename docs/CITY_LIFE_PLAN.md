# CITY_LIFE_PLAN: ramps, streaming, speeds, traffic, time-of-day life, props, police, army, jobs and bank

Written 2026-10-09 against base f0a4e32b (v88w src). Docs only; nothing in src/ is changed.
- Companion doc: `docs/ON_FOOT_PLAN.md` (on foot, car-jacking, fights, wanted level).
- Sources are numbered [n] at the end. Research facts were checked online on 2026-10-09; **[derived]** marks my own arithmetic.
- Code facts were measured on a headless build of this commit (scripts are in the worker scratchpad).

Alex (2026-10-09): "lot of ramps are not accessible; load the areas you are driving around to save capacity; realistic speeds of cars incl. boost to max speeds reasonable cars with nitro get; city lively based on location and time; traffic has a lot of trucks, should be more realistic; empty green areas → shops, kiosks, trees etc (smashable); police patrol realistic, not full of police; a police station; army in case of serious condition; restaurants, gym, barber shops; collecting money doing jobs, bank."

Each phase below lists:
- controls and HUD
- systems it reuses, and where it hooks in (hook points)
- performance budget
- tPlay thresholds (tPlay = `tools/tPlay.js` on origin/alex/od-qa, real touch input)
- risks
- an estimate

**Perf baseline** (v88w, measured the perf.js way): Frankfurt **195 draws**, Athens **205** (10_core.js:19). Targets are ≤200 and ≤210.
- A full-frame count that includes the shadow and post passes reads higher: 321 draws / 1.98 M tris in Frankfurt, 228 / 1.26 M in Athens.
- Always compare like with like.

---

## 1. Ramps (Q3)
**What the code does**
- Every ramp is made by `addRamp(x,z,h,len,hgt,w,col,Y0)` (70_roam_world.js:127–130).
- Sources:
  - `rfRamps()` (70:118): ≤20 per city, size 24×7×16 m.
  - long jumps lj1/lj2 (70:143)
  - Taunus ×4 (70:145)
  - Autobahn every 3rd sample (70:168)
  - `LAZY[].ramps` (60_city_build.js:684–768)
  - dynamic ramps (not in the static list): OG pop-up and roof ramps (85_audio_feel_sp_otg.js:533–536, 615), M1 story (80:83), lively roadside ramps (98l_lively.js:253)
- Launch logic: 71_roam_drive.js:58–66 → `CR_rampLaunch` (10_core.js:101).

**Measured:** 47 static ramps in Frankfurt and 21 in Athens. Each was driven straight at its own heading from 60 m with real ArrowUp: **68/68 launch**. So "not accessible" is not a solid wall on the ramp line. These are the causes found:

| # | Cause | Where | Effect on the player |
|---|---|---|---|
| R1 | Ramp **16 m wide on 7.5–8.5 m Athens streets**: the edges overlap building colliders | Athens #0, #2, #7, #13, #17, #18, #20 (only 6.5 m clear at #2/#13/#17) | Coming from a side lane or a turn, you clip a wall or the ramp edge instead of the face |
| R2 | **Flat base on a slope**: the lip floats or is buried | Frankfurt #12 floats 2.4 m, #22 1.5 m, #24 1.2 m, #32 1.1 m; #23 buried 1.7 m | It only works because of the 8 m "pop" rule. It looks like a wall or a floating slab, so players avoid it |
| R3 | **In the water** | Frankfurt #44 Höchst (60:728), y0 −3.2, 13/15 approach samples `inRiver` | Unreachable by car |
| R4 | **Off-road** | Frankfurt #40 Homburg, about 290 m from any road | Only reachable across country |
| R5 | Placed 0.22·w right of the centreline, 420 m apart, **heading only along the street** | all rfRamps | Turning into the street at a junction leaves too little run-up to line up |
| R6 | Dynamic ramps are untested (roof ramps lead onto low rooftops) | 85:533–536, 98l:253 | These are the most likely "can't get on" cases: a roof ramp ends at a building collider |

**Fix:** wrap `addRamp` in a new module `src/98cl_ramps.js` (prefix `RMP_`).
1. Snap (x,z) to the nearest road centreline with `rfSnap`/`hubRoads`, or `athRoadD` in Athens. Set h = road tangent.
2. Set w = min(w, roadW − 1 m).
3. Pitch the ramp so that y0 = `groundAt(entry)`. Reject it when |ground(entry) − ground(lip)| > 0.5 m.
4. Reject (move to the next road sample) if `roamHit` or `inRiver` hits anything in the **30 m × w run-up corridor or the 40 m landing zone**.
5. No ramp within 60 m after a junction.
6. Dynamic roof and lively ramps go through the same validator. Roof ramps need the roof `roofAt` ≤ lip height + 1 m.

- **Perf:** 0 draws.
- **tPlay:** for every static and dynamic ramp in both cities, run a human-steered approach from the nearest junction (not on the ramp line).
  - Launch rate ≥95 %.
  - 0 ramps with |lip float| > 0.3 m.
  - No ramp with collider overlap.
  - Wall hits ≤1/min on the run.
- **Risks:** fewer ramps after rejection. Log how many were rejected and refill from other road samples, keeping ≥15 per city.
- **Estimate:** 0.5–1 session (3 h), including a shot of each Athens ramp.

## 2. Streaming: load and unload cells around the player (Q4)
**Today**
- The WB 320 m cells (98wb_world_batch.js:58) handle *drawing*:
  - Near ≤190 m: grouped instanced proxies.
  - Far: one clustered mesh per cell, built in the background in ~5 ms slices.
  - 2×2 super cells beyond 700 m.
- Nothing is ever *disposed*:
  - "Nothing is ever disposed" (60:610).
  - Lazy biomes build within 2200 m at 3.5 ms/frame (`lazyStep` 60:616).
  - `hubCullStep` (70:5–10) only hides by distance.
- Measured: JS heap **410 MB in Frankfurt and 521 MB in Athens**. Athens has 4014 uploaded geometries.
- iOS Safari has no official per-tab WebGL cap.
  - Reported failures: a canvas memory cap of 224–384 MB [1][2], and the content process killed at about 1.25 GB [3].
  - Unity WebGL on iOS crashed once the heap grew past roughly 300–500 MB [4].
  - So **Athens at 521 MB is in the danger zone.**

**Reference**
- Open-world engines load fixed-size grid cells inside a radius around a streaming source. Epic's example uses 256 m cells and a 768 m loading range [5].
- Rule of thumb: loading range ≥2× cell size, 3–4× for fast vehicles [6].
- GTA SA streams IPL sectors in and out, and creates and destroys objects per sector [7]. GTA V streams several LODs with no loading screen, and fast aircraft outrun the streamer [8].
- So boost speed sets our radius.

**Design**
- **Rings around the player, in 320 m WB cell units, with hysteresis:**
  - **Near (≤190 m):** unchanged. Full instanced models, colliders and props.
  - **Mid (≤1.2 km):** unchanged. Clustered far meshes and super cells.
  - **Load ring for lazy content:** build within 1.6 km (was 2200 m). At 224 km/h boost (62 m/s) that is 26 s of look-ahead.
  - **Unload ring at 2.4 km:** for lazy biome meshes, props and colliders (`HUB.grid` entries), call `geometry.dispose()`, remove them from the scene and mark the LAZY region unbuilt so it rebuilds on return.
  - The 800 m gap stops load/unload thrash.
- Core city buildings stay resident: they are already batched and are needed for the minimap. Only the LAZY regions (21 in Frankfurt, 5 in Athens), peds, parked cars and props stream.
- Hook points:
  - Wrap `lazyStep` (60:616) to add `STR_unload()`.
  - `lzFinish` records each region's mesh, collider and prop handles.
  - The WB near-set update (98wb:160) is unchanged.
- Module: `src/98cl_stream.js` (prefix `STR_`).

**Targets**
- JS heap ≤350 MB in both cities after a 10-minute drive.
- Uploaded geometries in Athens ≤2000.
- Draws stay ≤200 in Frankfurt and ≤210 in Athens.
- No frame over 50 ms when a region builds or unloads (keep the 3.5 ms/frame slice).

**tPlay**
- A 10-minute loop that crosses 3 lazy regions and comes back.
- Heap growth over the loop ≤30 MB, so no leak.
- No pop-in inside 190 m: the shot at the region edge shows its trees.
- 0 loading screens, 0 errors.

**Risks**
- Unloading colliders while a ped or traffic car stands on them. Unload only beyond 2.4 km, and recycle traffic there.
- Dispose must also free InstancedMesh attributes.

**Estimate:** 1 session (4–5 h).

## 3. Car speeds and boost (Q2)
**Today** (HUD km/h = |RO.v|×3.6, 71:295)
- Roam top = stats.top×0.8×level×zone. Zone is ×0.82 in the city and ×1.22 on the Autobahn.
- The default Pro class gives about **115 km/h in the city, 140 open and 170 on the Autobahn**.
- Hard caps: `CR_VMAX` 174 and `CR_VBOOST` 224 km/h (99_api.js:47–52).
- Boost adds +25–30 % (98k_boost2k.js).
- Every car class shares the same caps, so a city car and a supercar feel alike.

**Real world**

| Car | Top speed |
|---|---|
| Fiat 500 hybrid | 155 km/h [9] |
| VW Polo 80 hp | 171 km/h [10] |
| VW Polo 110 hp | 195 km/h [11] |
| Porsche 911 Carrera (992) | 293 km/h [12] |
| Lamborghini Revuelto | >350 km/h [13] |
| Bugatti Chiron | 420 km/h, limited [14] |
| Mercedes Sprinter | 145 km/h [15] |
| Trucks >3.5 t | limited to **90 km/h** |
| Buses (>8 passenger seats) | limited to **100 km/h** (Directive 2002/85/EC) [16] |

- Nitrous "shots" of 50–150 hp add about 45–130 hp at the wheels [17].
- A 100 hp shot on a 300 hp car is +33 % power **[derived]**. Top speed is drag-limited (power ∝ v³), so that is only about **+10 % top speed** **[derived]**. Real nitro mostly adds acceleration.
- Other games:
  - LEGO 2K Drive: boost refills over time, from smashing and from drifting [18].
  - NFS Unbound: burst nitrous fills from jumps, drifts, drafting and near misses [19].
  - GTA SA: nitro comes in 2×/5×/10× charges for $200, $500 and $1,000 [20].

**Proposed speed table (km/h).** Roam top is in the open; the city is ×0.82 as now. Boost top is the class's real top or slightly above.

| Class (our cars) | Roam top | Boost top | Real reference |
|---|---|---|---|
| City car (sedan, taxi, Fiat-like) | 150 | 175 | 155–195 |
| Van, delivery | 130 | 150 | 145 |
| Truck, garbage truck, bus | 90 | 100 | limiter 90 / 100 |
| SUV | 165 | 195 | — |
| Sports (911-like, Supra) | 230 | 290 | 293 |
| Supercar (player SPEEDSTER / top builds) | 260 | 330 | 350+ |
| Trolleybus / scooter (Athens traffic) | 50 / 70 | — | — |

- Make it per-class caps in `src/98cl_speed.js` (prefix `SPD_`):
  - Replace the global `CR_VMAX`/`CR_VBOOST` with `SPD_cap(car)`. Hook it where 99_api.js:47–52 clamps.
  - Map garage builds to a class by their `stats.top`.
- Boost keeps today's LEGO 2K-style fill sources: time, smash and drift.
- Boost gives **strong acceleration** (`bPush` 20 m/s², unchanged) up to the boost top.
- Traffic speeds stay within real city limits:
  - city 50–60 km/h (14–17 m/s, lowered from 14–24)
  - Autobahn cars 100–130 km/h
  - Autobahn trucks 80–90 km/h
- **Perf:** 0 draws.
- **tPlay:** with a supercar build, wall hits ≤1/min in the city loop, which is the risk at higher top speeds. No streaming pop-in at 330 km/h on the Autobahn (see §2 load ring; check that 26 s of look-ahead holds). Truck top ≤100 km/h.
- **Risks:** players who are used to a 224 km/h boost in the city. The city ×0.82 zone factor still applies.
- **Estimate:** 0.5 session (2 h).

## 4. Traffic mix and time of day (Q1)
**Today**
- 150 cars (60:968). `DR_traffic` halves that, so about 75 are live.
- Frankfurt picks types `i%11` with equal weights over sedan, sports, taxi, van, truck, delivery, police, suv, garbage truck and Supra×2. That makes **about 36 % heavy vehicles and 9 % police, with no buses**.
- Athens (`ATH_K`): taxi 41 %, sedan 15 %, scooter 11 %, and so on.

**Real world**
- Germany's fleet: 80.9 % cars, 6.2 % trucks *including vans ≤3.5 t*, 8.2 % motorcycles [21] [derived %].
- Heavy vehicles in Berlin city-street traffic: **5.5 %** on average, peaking **09:00–12:00** on weekdays and low at weekends [22]. A residential or shopping street can be under 2 % [23].
- Attica's fleet: about **69 % cars and about 24 % two-wheelers**. Athens holds 44 % of Greece's motorcycles [24].
- Athens peaks: about 39 min per 10 km in both the morning and evening rush, with congestion at its highest around 15:00 [25].

**Proposed mix (weights per 100 traffic slots)**

| | Frankfurt | Athens |
|---|---|---|
| Sedan / SUV / sports / Supra | 62 | 38 |
| Taxi | 8 | 20 (yellow taxis are iconic) |
| Van + delivery | 14 | 10 |
| Truck + garbage truck | **4** (09–12h: 6, night: 2) | **3** |
| Bus / trolleybus | 4 (reuse the 98bc bus geometry) | 5 |
| Scooter / motorbike | 6 | **22** |
| Police patrol | **2** (see §6) | **2** |

**Time of day**
- Live traffic count = base 75 × hour factor:
  - 07–09 and 16–19: ×1.2
  - 10–15: ×1.0
  - 20–23: ×0.7
  - 00–05: ×0.35
- Athens: 15:00 is ×1.2 and nights are ×0.5, because the city stays out late (§5).
- The hour comes from the existing 24-minute `FL_DAY` cycle (85:152).
- Hook: wrap `hubRecycle`, so a recycled car takes a new type from the weighted table and the count follows `TRF_target()`.
- Module: `src/98cl_traffic.js` (prefix `TRF_`).

- **Perf:** an extra traffic type (the bus) adds +1 instanced draw. The scooter type exists only in Athens; adding it to Frankfurt is +1. Total +2 → Frankfurt 197.
- **tPlay:** in 5 minutes of driving, heavy vehicles on screen are ≤8 % of traffic, measured by sampling `HUB.cars` within 150 m. Police on screen: at most 1 at a time. 0 errors.
- **Risks:** fewer trucks means less to smash. Keep the garbage truck and box truck as smash targets in the pop-up events.
- **Estimate:** 0.5 session (2 h). **This is the quickest win.**

## 5. City life by location × time of day
**Today:** crowd density is not time-based. 98l places 70–110 peds within 35–170 m of the player, plus clusters, stalls and cafés (`LV_pn` 98l:20, `TUNE.life`). Day/night only changes lights (85:168–198).

**Reference**
- Pedestrian counts peak at lunch and in the early afternoon, then fall after shops close. Saturday evenings are busier than weekday evenings [26].
- Greeks lunch around 13:30–15:00 and dine around **21:00–22:00** [27].
- Athens bars fill from 22:00, and Psyrri is busiest from 00:00 to 02:00. Gazi clubs peak **02:30–05:00** [28].
- Frankfurt's Alt-Sachsenhausen apple-wine taverns run into the evening, and some bars open until 03:00–05:00 at weekends [29].
- GTA SA's `popcycle.dat` sets peds, cars and cop percentages per **zone type × 2-hour slot**, with separate weekday and weekend tables [30]. We copy that shape.

**Design:** module `src/98cl_life.js` (prefix `LIF_`).
- A zone tag per district. Districts are already named in 70_roam_world.js. The zone types are:
  - **office:** Bankenviertel/Westend; Athens Syntagma/Kolonaki
  - **old town:** Römer/Sachsenhausen; Plaka/Monastiraki
  - **night:** Sachsenhausen taverns; Psyrri/Gazi
  - **residential**
  - **park**
- A popcycle table gives a density multiplier per zone × 2-hour slot (12 values each), for example:
  - office: 08–10 = 1.3, 12–14 = 1.2, 18–20 = 0.8, 22–06 = 0.15
  - night (Athens): 00–02 = 1.4, 02–04 = 1.2, 10–14 = 0.4
- Hook: wrap `LV_pn` (98l:20) to multiply `LV_walk`.
  - Cluster type follows the hour: coffee tables 08–12, taverna tables 19–24 in Athens (21–01), queues outside clubs 23–04.
  - Use the existing `LV_clInit` cluster kinds.
- Night look: lit kiosks and shopfront emissive. Reuse the OC night lights (90).
- **Perf:** 0 new draws, because these are the same instanced pools. The CPU cost scales with the count, which never exceeds today's maximum of 110 peds.
- **tPlay:**
  - Shots at Römer at 09:00 and 22:00, and at Psyrri at 14:00 and 01:00. Each pair must differ visibly (ped count ratio ≥1.5).
  - Humanoids ≤2.2 m. The fps floor is unchanged.
- **Risk:** night zones that look empty and dead. The floor is 0.15×, never 0.
- **Estimate:** 1 session (3–4 h).

## 6. Filling empty green areas: shops, kiosks, trees, benches (all smashable)
**Today**
- Smashable prop types already exist, one InstancedMesh each (53:276–277, 60:789, `buildHubProps` 60:870): lamp, tree, bench, bin, post, hydrant, stall, table, cone, barrier, crate, fence, pot, container, rock, bush.
- Kiosks sit at big corners, and café terraces are at Römer and Sachsenhausen (60:836).

**Design:** module `src/98cl_fill.js` (prefix `FIL_`).
- **Find the empty lots** once at build: sample a 40 m grid and keep the points that are:
  - ≥12 m from any road (`roadD`)
  - not `inRiver`
  - clear of `roamHit` colliders within 10 m
  - on ground with slope <10 %
  - not on a ramp run-up or landing zone (§1)
- **Fill each lot from 4 templates:**
  1. Pocket park: 4 trees, 2 benches, 1 bin.
  2. Kiosk corner: 1 kiosk, 2 tables, 1 parasol.
  3. Market: 3 stalls, crates.
  4. Shop row: 2 low shop boxes with signs.
- New prop types (kiosk, parasol, shop box) share **one merged "shop kit" InstancedMesh with vertex colours (+1 draw)**. Everything else reuses the existing pools, so 0 extra draws.
- Cap at 600 new instances per city. Props only exist inside the §2 load ring.
- **All of them are smashable** through the existing prop smash path, which gives studs and boost.
- Shop boxes double as the economy buildings (§8): restaurant, gym, barber, bank, each with an icon sign.
- **Perf:** Frankfurt 197 + 1 = **198**. Athens 205 + 2 (§4) + 1 = **208**. Tris +40 k.
- **Combined budget with ON_FOOT:** the on-foot extras (player fig, plus stud projectiles and lock ring merged into one pool) add ≤2 draws, so the totals are **≤200 in Frankfurt and ≤210 in Athens**. Anything new beyond that must pay for itself by merging something else first.
- **tPlay:**
  - In 5 minutes of driving: wall hits ≤1/min, so props must not create new walls. Smash only ≥1.2 m posts and trees.
  - Props on the road surface = 0, using tPlay's existing "no collider on the road" check.
  - No prop on a ramp corridor.
- **Risk:** clutter (lesson 5: "less on screen is better"). Keep density ≤1 template per 40 m lot and skip every second lot near the main roads.
- **Estimate:** 1 session (4 h).

## 7. Police patrol, police station, army
**Real world**
- Germany has about **301 police officers per 100k** people; Greece has about **525**, one of the highest in Europe [31][32].
- Frankfurt's police headquarters is at **Adickesallee 70** [33]. The city has numbered precincts up to the 18th, with mergers planned [34].
- Athens police HQ location is *not verified*; pick one in the next session.

**GTA reference**
- GTA V: 1–2★ patrols and backup, 3★ roadblocks and a helicopter, 4★ NOOSE, 5★ all units ram. The army appears only at Fort Zancudo [35][36].
- GTA III era: 4★ SWAT, 5★ FBI, **6★ army** with trucks and tanks [37].
- LEGO City Undercover's producer on military vehicles: "It just wouldn't be right" [38]. So our army stays a LEGO-ish army: green jeeps and trucks with brick blasters, no tanks.

**Design** (shared with ON_FOOT_PLAN P4, module `98of_wanted.js`)
- **Patrol density at 0★:** ≤2 % of traffic slots, so at most 2 police cars within 1 km. Athens gets the same 2 % (at most 2) despite its higher real ratio, because gameplay outranks realism.
  - The minimap shows police as blue dots only when they are within 200 m.
  - Today's 9 % (1 in 11) in Frankfurt is the "full of police" Alex sees. **Fixed by §4 alone.**
- **Police station** building, one per city: Frankfurt at the Adickesallee site; Athens TBD.
  - A 3-garage block with a 🚓 sign, built with the §6 shop box geometry (0 extra draws).
  - Purpose: the BUSTED respawn point, the cop spawn origin, and the mission giver (Kommissar Becker moves here).
- **Escalation:**

  | Level | Response |
  |---|---|
  | 1★ | 1 car |
  | 2★ | 2 cars |
  | 3★ | 3 cars + roadblock |
  | 4★ | 4 cars + SWAT van |
  | **5★ only** | **army**: 2 green jeeps + 1 truck, spawned at 600 m and converging |

  - Hard caps: 5 police cars and 3 army vehicles at once.
  - Losing stars: line of sight broken for 15/25/35/45/60 s.
- **Perf:** police use the existing police instance. The army jeep and truck re-tint the SUV and truck geometry via instance colour, so +0 draws. If a new model is needed, +1 draw only while 5★ is active.
- **tPlay:**
  - Patrol cars within 300 m at 0★ ≤1, averaged over 5 minutes.
  - At 5★, ≤8 hostile vehicles, fps ≥ baseline −10 %, and you can lose the stars within 120 s by driving.
- **Estimate:** patrol density is inside §4. The station takes 1–2 h. Escalation is inside ON_FOOT P4.

## 8. Economy: jobs, bank, shops
**Today**
- The currency is **studs** (`season().cr`).
- Income:
  - Pickups: 10 normally, 100 for golden ones.
  - Events: `STAR_PAY` (30_race.js:616), e.g. sprint 1700, boss 4500.
  - Golden brick: 500. Story: 2000.
- Prices:
  - Upgrades: 4000–32000 (`UPC`).
  - Parts: 800–2500.
  - Ships: 25000 and 45000.
- `QUESTS` (41:21) already has **taxi**, **deliver** and **chase** kinds.

**Reference**
- GTA SA odd jobs pay out and grant perks: all 12 paramedic levels give $37,500 + 50 % health; vigilante gives $32,500 + 50 % armour; 50 taxi fares give nitro on all taxis [39].
- SA gym stamina +4 % per 14 s with a daily cap; food adds fat; barbers raise sex appeal [40]. That is too fiddly for a phone, so we keep one effect per shop.

**Design:** module `src/98cl_econ.js` (prefix `ECO_`). The jobs are repeatable `QUESTS` entries that start from a map icon.

| Job | Source | Pay (studs) | Perk at 10 completions |
|---|---|---|---|
| Taxi fare | existing `taxi` kind | 150–400 by distance | +10 % boost refill in taxis |
| Delivery | existing `deliver` | 200–500 | +1 heart (on foot) |
| Police chase ("Stop, Thief!") | existing `chase` | 500 | wanted cooldown −20 % |
| Street race | existing sprint events | `STAR_PAY` unchanged | — |

- The pay is pitched below event stars, so events stay the main income. A taxi fare takes about 1 minute; a sprint pays 1700.
- **Bank:** Frankfurt uses a Bankenviertel tower; Commerzbank Tower is 259 m to the roof [41]. Athens uses a building near Syntagma (*building not verified*).
  - Studs you **deposit** are safe from the 10 % loss on BUSTED or knock-out (ON_FOOT P3/P4).
  - Studs you carry are at risk. A 💰 counter by the speed shows carried studs only while you have stars.
  - No interest, and no robbery in the MVP. A heist can come later as a P5 mission.
- **Shops** (§6 shop boxes, tap ENTER on foot or stop beside them in the car):
  - **Restaurant** / souvlaki: 100 studs, full health (car `RO.hp` + hearts).
  - **Gym:** 300 studs, one-off +1 heart / +20 % sprint duration, max 3 visits.
  - **Barber:** 200 studs, opens the minifig hair/face picker (`GB_FIG` h/x, garage DRIVER tab).
  - **Garage:** the existing garage and parts.
- **HUD:** none new. The shop opens as a compact card, reusing the DR_ mission card (95).
- **Perf:** 0 draws, since the buildings come from §6.
- **tPlay:**
  - A full loop of taxi job → bank deposit → restaurant heal in ≤5 minutes with real touch.
  - Every card is readable at 852×393 with 12 px minimum text and does not cover the controls.
- **Estimate:** 1.5 sessions (6 h).

## 9. Combined build order (both docs), quick wins first
| # | Item | Doc | Est. | Why here |
|---|---|---|---|---|
| 1 | **Q1 traffic mix + police share 9 %→2 %** | CL §4, §7 | 2 h | Fixes "lots of trucks" and "full of police" with a weight table |
| 2 | **Q2 per-class speed caps + boost tops** | CL §3 | 2 h | Fixes "realistic speeds"; no new assets |
| 3 | **Q3 ramp validator + dynamic ramps** | CL §1 | 3 h | Fixes "ramps not accessible" |
| 4 | **P1 exit/enter + walking** | OF P1 | 4 h | First on-foot feature Alex can play |
| 5 | **Q4 streaming unload ring** | CL §2 | 4–5 h | Athens heap 521 MB is in the iOS danger zone; also frees room for items 7–8 |
| 6 | P2 car-jacking | OF P2 | 3–4 h | |
| 7 | City life by zone × hour | CL §5 | 3–4 h | |
| 8 | Green-area fill + shop boxes | CL §6 | 4 h | Shops are needed for item 12 |
| 9 | P3 punch / knockdown into bricks | OF P3 | 5 h | |
| 10 | Police station + P4 blaster, wanted, police, army at 5★ | OF P4, CL §7 | 9–10 h | |
| 11 | P5 named characters | OF P5 | 6 h | |
| 12 | Jobs, bank, shops | CL §8 | 6 h | Needs items 8 and 10 |

- Total is about 52–56 h, or 13–14 worker sessions.
- Items 1–3 can ship as **one deploy** (about 7 h of work, 1–2 sessions).
- Run one worker at a time (cost rule). Each deploy needs a reviewer PASS plus tPlay on the split build.

## Sources
1. pqina, "Total canvas memory use exceeds the maximum limit" (384 MB iOS 15): https://www.pqina.nl/blog/total-canvas-memory-use-exceeds-the-maximum-limit/
2. Apple Developer Forums, 224 MB canvas limit on iOS 12: https://developer.apple.com/forums/thread/112218
3. Apple Developer Forums, Safari WebGL process killed at about 1.25 GB: https://developer.apple.com/forums/thread/668999
4. Unity forum, WebGL memory growth crash on iOS: https://discussions.unity.com/t/webgl-memory-increment-issue-and-crash-on-ios/894771
5. Epic, World Partition (256 m cells, 768 m loading range example): https://dev.epicgames.com/documentation/en-us/unreal-engine/world-partition-in-unreal-engine
6. StraySpark, UE5 World Partition deep dive (range ≥2× cell, 3–4× for vehicles): https://www.strayspark.studio/blog/ue5-world-partition-deep-dive-streaming-hlod
7. MTA wiki, GTA:SA resource streaming (IPL sectors): https://wiki.multitheftauto.com/wiki/GTA:SA_Resource_Streaming
8. Adrian Courrèges, GTA V graphics study part 2: https://adriancourreges.com/blog/2015/11/02/gta-v-graphics-study-part-2
9. cars-data, Fiat 500 Hybrid 2025: https://cars-data.com/en/fiat/500/2025-hatchback/hybrid-la-prima--111327
10. autotijd, VW Polo 1.0 MPI 80 hp: https://autotijd.be/en/performance/volkswagen/polo/10-mpi-80-pk-manuele-vijfbak-fwd
11. autotijd, VW Polo 1.0 TSI 110 hp: https://autotijd.be/en/performance/volkswagen/polo/10-tsi-110-pk-7-traps-dsg-automaat-fwd
12. Porsche Finder, 911 Carrera 992: https://finder.porsche.com/ca/en-CA/details/23P84Z
13. Lamborghini, Revuelto: https://lamborghini.com/models/revuelto
14. designboom, Bugatti Chiron 420 km/h: https://designboom.com/?p=321791
15. Guide Auto, Mercedes Sprinter 2023: https://www.guideautoweb.com/en/makes/mercedes-benz/sprinter/2023/specifications/cargo-van-standard-roof-144-inch-diesel-standard-output-rwd
16. Oireachtas, EU speed limiters (2002/85/EC: >3.5 t at 90, >8 passenger seats at 100): https://www.oireachtas.ie/en/debates/question/2006-03-07/49/
17. TP Auto Repair, nitrous horsepower gains: https://tpautorepair.net/how-much-horsepower-does-nitrous-oxide-add/
18. 2K, LEGO 2K Drive driving techniques (boost refill): https://lego.2k.com/drive/features/driving-techniques/
19. Gamer Journalist, NFS Unbound nitrous: https://gamerjournalist.com/how-to-manage-build-up-nitrous-in-need-for-speed-unbound/
20. Grand Theft Wiki, Nitrous (GTA SA): https://www.grandtheftwiki.com/Nitrous
21. elektroauto-news, KBA fleet 1 Jan 2024: https://www.elektroauto-news.net/news/kba-bestandsdaten-anfang-2024
22. Berlin Umweltatlas, traffic volumes (5.5 % trucks; 09–12 peak): https://berlin.de/umweltatlas/en/traffic-noise/traffic-volumes/1993/methodology
23. Werdohl traffic study (heavy vehicles under 2 %): https://www.werdohl.de/fileadmin/user_upload/Dokumente/Beteiligungsberichte/A6_B-Plan_11_8_Verkehrsuntersuchung_Ist-Zustand.pdf
24. NTUA, Attica fleet composition: https://www.nrso.ntua.gr/geyannis/wp-content/uploads/geyannis-cp439.pdf
25. TomTom Traffic Index, Athens: https://www.tomtom.com/traffic-index/athens-traffic/
26. Pedestrian counts by hour (Melbourne): https://people.utm.my/lylai/wp-content/uploads/sites/630/2017/06/page-76-3.pdf
27. The Daily Meal, dinner time in Greece: https://www.thedailymeal.com/1282379/dinner-time-greece-nocturnal-event
28. Athens Tourism, Athens nightlife: https://www.athenstourism.org/athens-nightlife/
29. Frankfurt.de, Old Sachsenhausen: https://frankfurt.de/english/discover-and-experience/sightseeing/historical-buildings/old-sachsenhausen
30. popcycle.dat (GTA SA zone × time population): https://huggingface.co/datasets/Opendsds/samp-data/blob/main/data/popcycle.dat
31. Statista, police officers per 100k in the EU: https://www.statista.com/chart/amp/16515/police-officers-per-100000-inhabitants-in-the-eu
32. Landgeist, police officers in Europe (Greece 525): https://landgeist.com/2022/12/14/police-officers-in-europe/
33. Baunetz Wissen, Polizeipräsidium Frankfurt (Adickesallee 70): https://www.baunetzwissen.de/sicherheitstechnik/objekte/behoerden-justiz/polizeipraesidium-in-frankfurt-am-main-72674
34. Journal Frankfurt, precinct mergers: https://www.journal-frankfurt.de/journal_news/Gesellschaft-2/Mehr-Polizeipraesenz-auf-den-Strassen-Frankfurter-Polizei-plant-Zusammenlegung-mehrerer-Reviere-35713.html
35. Grand Theft Wiki, Wanted Level in GTA V: https://www.grandtheftwiki.com/Wanted_Level_in_GTA_V
36. Grand Theft Wiki, NOOSE: https://www.grandtheftwiki.com/National_Office_of_Security_Enforcement
37. Grand Theft Wiki, Wanted Level in GTA III era (army at 6★): https://www.grandtheftwiki.com/Wanted_Level_in_GTA_III_Era
38. GamesBeat, LEGO City Undercover preview (military "wouldn't be right"): https://gamesbeat.com/lego-city-undercover-preview/
39. GTA Intel, San Andreas side-mission rewards: https://gtaintel.com/news/san-andreas-side-missions-rewards
40. GTA Intel, CJ stats explained: https://gtaintel.com/news/san-andreas-cj-stats-explained
41. Wikipedia, tallest buildings in Frankfurt (Commerzbank Tower 259 m): https://en.wikipedia.org/wiki/List_of_tallest_buildings_in_Frankfurt
