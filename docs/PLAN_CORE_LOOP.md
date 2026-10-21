# PLAN_CORE_LOOP: one city core, one loop, minute one (WHY_NOT_2K gap 9)
Lane core-loop-plan-r22d4, 2026-10-21. Design plan only, no code. Builds on drive-first (r22d1), terrain-flat (r22d2), hud-cam (r22d3), sidequest opt-in (r22q).
Recommended options taken without asking (standing order): Frankfurt core = Altstadt + Innenstadt + Bankenviertel + the Main quays; Athens parked, not removed.

## 1. Decision in one paragraph
The first experience is **Frankfurt's dense core, about 1.55 × 1.5 km, and one loop: drive → smash props for studs → drive into event markers → studs buy the next car**.
Everything else (Athens, 8 menu modes, story, builder, on foot, split screen) stays in the build and reachable because `ALL_OPEN=true` (src/10_core3.js:41), but it is not on the PLAY path and not on the minimap.
Nothing is deleted. The world outside the core still exists (no invisible wall) but it is thinned, unmarked and quiet, so the player is pulled back to the core.

## 2. The core (bounds from the existing data)
World coords as in `#rf-data` (src/02_data_json.html): x east, z north, 1 unit = 1 m (SC real scale). The Main runs at z ≈ −220…−450 here.

**CORE box: x ∈ [−1100, 470], z ∈ [−720, 800]** (1.57 × 1.52 km). Centre ≈ (−315, 40), the Paulskirche area.
Why this box: it is the area inside and around the Anlagenring (`ring`, 11 of its 16 points are inside) plus the north quay and the first block of Sachsenhausen, so the river and three road bridges are part of the core.

| kind | inside the core (name, coords) |
|---|---|
| landmarks (`lm`) | Commerzbank (−530,−60), Main Tower (−707,215), Römer (−75,−5), Ostzeile (80,−15), Kaiserdom (228,11), Paulskirche (−93,66), Alte Oper (−790,700), Deutsche Bank (−1007,343), Goethe-Haus (−321,66), Hauptwache (−200,354), Eschenheimer Turm (−185,675), Euro-Skulptur (−500,−200), Werkstatt Konstablerwache = garage (440,505) |
| streets (points inside) | Kaiserstraße 4/5, Zeil 3/4, Freßgass 3/3, Berliner Straße 4/4, Kurt-Schumacher-Straße 4/4, Neue Mainzer Straße 4/4, Anlagenring 11/16, Gutleutstraße 2/5, Schweizer Straße 2/4 |
| plazas | Römerberg, Paulsplatz, Hauptwache, Opernplatz, Konstablerwache, Willy-Brandt-Platz, Domplatz, Schweizer Platz |
| bridges | Untermainbrücke (−386,−453), Eiserner Steg (0,−276, foot), Alte Brücke (400,−221), Holbeinsteg (−728,−730, foot, on the edge) |
| districts (`districts`) | Altstadt, Bankenviertel, Innenstadt, west half of Sachsenhausen's quay strip |
| existing event spots (`spots`) | sm3 smash (420,380), cl1 collect (150,100), cl3 collect (330,440), cl2 collect (300,−650), lj1 long jump (Eiserner Steg), tk1 (−950,−200), cp1 checkpoint (−1100,−300, on the west edge), ROSSI rival (−1000,350), quests q_cider/q_thief/q_pigeons/q_wedding/q_photo |

Not in the core (stay in the world, unmarked under the flag): Hauptbahnhof, Messe, Festhalle, Westend Tower, Henninger Turm, EZB, Osthafen, the stadium, all `e1…e6` events, zone/arena/derby/junction/tt/daily, sm1, sm2, dz1/dz2, sp2/sp3.
The current Frankfurt dense box is `CITYCFG.fra.box=[-3000,3000,-1800,2600]` (src/51_city_net.js:43): 6 × 4.4 km, about 11× the core area. That is the density we spread too thin.

## 3. The ONE minute-one loop (the 5-minute session script a GO replays)
Spawn: Paulsplatz on Berliner Straße (≈ −120, 100), heading east, gas on (drive-first already gives control in frame 1, src/99fd_drivefirst.js).

| time | what the player does | what the game gives | owner code today |
|---|---|---|---|
| 0–5 s | holds gas, 40 km/h on Berliner Straße | a gold stud trail on the driving line, every pickup a "pick" tick and +boost | `RO.studs` placement src/70_roam_world.js:242-264; pickup → `studGain` src/71_roam_drive.js:135 |
| 5–25 s | hits the Römerberg / Domplatz market props (bins, cones, stalls, benches) | every hit ≥ 15 km/h bursts into bricks + studs, a 50 ms hit-stop, CHAIN ×2 after 5 | `smashCheck` src/60_city_build6.js:92-94 → `studBurst` :100 → `comboAdd` src/71_roam_drive.js:304; gate `SM2_smash` src/98sm2_smash2.js:10 |
| 25–40 s | sees the nearest beacon (a tall coloured light column + minimap icon), steers to it | one line "SMASH RUN · 350 m" in the one text slot, no card | `roamMarks` src/71_roam_drive.js:34, minimap `miniDraw` src/70_roam_world.js:59 |
| 40–75 s | drives through the marker ring: 3-2-1, 30 s event | event runs, results strip with ★ and studs, then straight back to free drive | `roamOpen` src/71_roam_drive.js:214 (card today), `chStart` src/70_roam_world.js:299, OTG goals src/41_career_quests.js:12-20 |
| 75 s–5 min | next beacon (≤ 400 m away, always one in view), repeat; stud bar fills | at ≈ 4000 studs (≈ min 3) a NEW CAR drives out of the Konstablerwache garage door, one tap to switch | `season().cr` (studs), cars `CR_*` src/93_cars_lego.js |

Targets for the GO (`why/loop5`): over a 5-minute scripted route ≥ 6000 studs, ≥ 4 events found and started, ≥ 1 car unlock, **0 dead stretches** (no 20 s window without a stud, a smash or an event), ≤ 1 text pill at any time, 0 modal cards.

What blocks this loop today (found in the code):
- Smash gate is too strict for 2K feel: a big prop needs ≥ 45 km/h head-on, a small one ≥ 28 km/h (src/98sm2_smash2.js:5,10). In the Altstadt the player drives at 30–50 km/h, so most hits are bumps.
- Studs decay: `streetMul` (src/71_roam_drive.js:134) halves stud gain after 1200 and cuts it to 0.2× after 3000 studs in ~4 min. That kills the loop at exactly minute 3.
- Studs placed by chance: `put` keeps only every 12th candidate (src/70_roam_world.js:255), so trails have gaps.
- Markers open a card (`roamOpen`, src/71_roam_drive.js:214) instead of starting on drive-in.
- `TEST_MODE=true` (src/10_core3.js:41) gives ∞ studs and every car, so studs buy nothing; the loop needs its own unlock ladder that works with TEST_MODE on.
- Events are spread over 6 × 4.4 km; only sm3, cl1-3, lj1, cp1 sit in the core and there is no drift or speed event in it.
- Menu lede still says "Anti-gravity racing through Frankfurt" (src/00_page.html:675).

## 4. Cut / parked (behind ALL_OPEN, reachable, still working)
| thing | where it goes | how it stays reachable |
|---|---|---|
| Athens (whole city) | off the PLAY path; menu "MORE → Athens" and the big-map travel pin | `athOpen()` src/10_core4.js:106 already true with ALL_OPEN; `?test=ath` keeps working; Athens GOs keep running in the gate |
| 8 menu modes (Race, Cup, TT, Zone, Arena, Derby, Crash Jct, Daily) | menu "MORE" sub-page | same buttons, one tap deeper; their roam marks (zone/arena/derby/junction/tt/daily spots) only on the big map |
| Story M1-M3, Hot Drop | big map + journal only | `?intro=1` (src/70_roam_world.js:394), the career map `cmBuild` src/72_roam_map_loop_boot.js:260 |
| ambient side quests | stay OFF | `QV_AUTO` (r22q), `?quests=auto` |
| quests q_* inside the core | hidden from the minimap under CL_CORE; still on the big map | big map / journal |
| builder garage, on foot, split screen, boats, flight | not offered in minute one; garage door is where new cars appear | menu / pause / big map as today |
| outer world (beyond the core box) | thinned: fewer props/peds/traffic, no event beacons | drive out freely; big map travel |

Rule: under the loop flags nothing is deleted and no mode loses its test; the flags only change what is offered, marked and dense.

## 5. Flags
One object `CL` in a new src/99cl_loop.js (ORDER after 99hc_hudcam.js), each key default OFF, read from `?cl=core,smash,…` or `?cl=all`, and from tune.json `cl.*` so the coordinator can flip one at deploy without a rebuild. A key flips ON in the default build only when its `why/*` GO passes on the BUILT page (rule 3). Every lane also adds its GO to `TAG=why`.

## 6. Build lanes (8, all SONNET, ~40 min, one deliverable each)
Order: L1 first (everything reads `CL_CORE`), then L2+L3 in parallel, L4+L5, L6+L7, L8 last. L2 car-hits depend on the traffic-brain build (gap 3, separate OPUS design); L2 covers props only until then.

**L1 · core-zone** (`CL.core`, `?cl=core`)
- Deliverable: CORE box constant + spawn at Paulsplatz heading east + density shift: props/peds/traffic inside the core ×1.5, outside ×0.5 (no wall).
- Files: new src/99cl_loop.js; hook `hubCullStep` src/70_roam_world.js:9 and the prop/traffic budget src/98rb_roam_budget.js; spawn via `roamWarp` (src/71_roam_drive.js); reads `CITYCFG.fra` src/51_city_net.js:43.
- GO `why/core`: fresh PLAY spawns inside the box on a road; smashable props per 100 m of street centreline inside ≥ 2× outside; drawn traffic inside ≥ 6 within 150 m; frame budget unchanged (perf/ios-reveal still green).
- Shot 852×393: spawn view on Berliner Straße towards the Dom, props on both pavements.
- 2K ref: Big Butte's town start — you spawn on a street already lined with smashable fences and crates; side-by-side with the 2K spawn shot.

**L2 · smash-everything** (`CL.smash`)
- Deliverable: in the core, small props smash at ≥ 15 km/h, big props/stalls at ≥ 30 km/h (traffic stays 45 until the traffic brain lands); each smash: ≥ 20 bricks, ≥ 3 studs, 50 ms hit-stop, speed loss ≤ 30 %.
- Files: src/98sm2_smash2.js:5-10 (`TUNE.sm2Small/sm2Big` per-zone), src/60_city_build6.js:92-94 (`studBurst` count), hit-stop via existing `slowmo` (as `qvFinale` src/41_career_quests.js:292).
- GO `why/smash` (as in WHY_NOT_2K gap 10): scripted 30 km/h hit on a bin and a stall in the core → both smashed, ≥ 20 bricks, +studs, loss ≤ 30 %; 20 km/h on a bin smashes, 10 km/h bumps; `smash2/tap` still PASS outside the core.
- Shot 852×393: mid-burst frame at Römerberg, bricks in the air, studs visible.
- 2K ref: hitting a fence/stall in 2K costs almost no speed and showers studs; side-by-side burst frames.

**L3 · stud-flow** (`CL.studs`)
- Deliverable: stud trails on the driving line of the 9 core streets (every 6 m, gap-free, 1 trail per street, big stud at each plaza) + remove the `streetMul` decay inside the core + HUD stud counter (12 px min, top-right, not over controls).
- Files: src/70_roam_world.js:242-264 (`buildRoam` `put`, drop the every-12th filter for core trails), src/71_roam_drive.js:134-135 (`streetMul`, `studGain`), HUD CSS src/00_page.html.
- GO `why/studs`: `__mho.roamSim` along Berliner Straße → Zeil (1 km at 50 km/h) collects ≥ 120 studs, no gap > 25 m; studs/min stays ≥ 90 % after 4 sim minutes (no decay); counter text ≥ 12 px and clear of the hud6 controls.
- Shot 852×393: Zeil with a gold trail ahead of the car and the counter.
- 2K ref: 2K's stud lines on roads that pull you along a racing line; side-by-side road shot.

**L4 · core-events** (`CL.events`)
- Deliverable: exactly 6 event markers in the core, one per type, drive-in start (3-2-1, no card): smash sm3 (420,380), collect cl1 (150,100), long jump lj1 (Eiserner Steg), checkpoint cp1 moved inside to (−1000,−260), NEW drift on the north Mainkai (≈ −300,−300), NEW speed trap on Kurt-Schumacher-Straße (≈ 330,150). Results strip → studs → back to driving in ≤ 2 s.
- Files: data `spots` in src/02_data_json.html (grep -o, never read whole), `rfMarks` src/70_roam_world.js:212, `roamMarks`/`roamOpen` src/71_roam_drive.js:34,214, `chStart` src/70_roam_world.js:299, goals `OTG_GOAL` src/41_career_quests.js:20.
- GO `why/events`: all 6 marks exist inside the box; warping 30 m before each and sim-driving through starts the event with 0 cards; each event's result pays studs; nearest mark from any core road point ≤ 400 m.
- Shot 852×393: the smash-event beacon seen from Konstablerwache, 200 m away.
- 2K ref: 2K on-the-go events (Smash Frenzy, Leap of Faith) start by driving through the gate; side-by-side gate shot.

**L5 · beacon-minimap** (`CL.map`)
- Deliverable: minimap framed to the core (fixed north-up, 600 m view), event icons only (no quests/modes), a tall coloured light column at each event mark visible ≥ 300 m, one-line "NEXT · <event> · <m>" in the one text slot.
- Files: `miniPaint`/`miniDraw` src/70_roam_world.js:33,59, mark sprites in `buildRoam` src/70_roam_world.js:248, text slot arbiter `FD.arb` src/99fd_drivefirst.js.
- GO `why/beacon`: from 20 seeded core road points the nearest event icon is on the minimap and its beacon is in the camera frustum within one 90° turn; minimap shows 0 non-loop icons; ≤ 1 text pill.
- Shot 852×393: driving view with a beacon over the rooftops and the minimap with 6 icons.
- 2K ref: 2K's minimap with event icons and the light pillars over Bricklandia; side-by-side HUD shot.

**L6 · car-ladder** (`CL.cars`)
- Deliverable: a loop-only unlock ladder of 5 Speed-Champions presets at 4000 / 10000 / 18000 / 28000 / 40000 studs, stored in `mho_loop` (works with TEST_MODE on: TEST_MODE skips the price, the delivery still plays), stud bar "next car" under the counter, delivery = car rolls out of the Konstablerwache garage door (440,505) + one tap SWITCH.
- Files: src/99cl_loop.js, presets `CR_*` src/93_cars_lego.js, `cycleVehicle` src/71_roam_drive.js, `season()` studs.
- GO `why/unlock`: adding 4000 studs in the core sets ladder step 1, spawns the delivery car ≤ 30 m ahead, SWITCH puts the player in it; ladder survives a reload; with TEST_MODE the bar still moves.
- Shot 852×393: the new car in front of the garage door with the SWITCH button.
- 2K ref: 2K's "new vehicle" reveal after a stud/garage unlock; side-by-side reveal shot.

**L7 · menu-scope** (`CL.menu`)
- Deliverable: menu = PLAY (core loop), GARAGE, MORE; MORE holds Athens + the 8 modes + story + builder; lede "Smash Frankfurt in bricks. Drive, smash, collect studs, win cars."; credits untouched.
- Files: src/00_page.html:675 (lede + menu markup), src/40_hud_input_menu.js (menu wiring), `athOpen` src/10_core4.js:106 untouched.
- GO `why/menu`: PLAY lands in the core in roam; every one of the 8 modes and Athens opens in ≤ 2 taps from the menu; "Made with ❤ by Alex" and "3D models by Alex" present; 0 text < 12 px at 852×393 and 393×852.
- Shot 852×393: the new menu.
- 2K ref: 2K's main menu (Play / Garage / Shop): three big choices; side-by-side.

**L8 · loop5 session GO** (`CL` all keys ON for the test)
- Deliverable: the 5-minute session GO from §3 that replays a fixed route through the core with `__mho.roamSim` and asserts the loop numbers; it is the gate that flips `?cl=all` to default ON.
- Files: new src/99cl_loop_go.js (registers like `SM2_reg` src/98sm2_smash2.js:44), route = Paulsplatz → Domplatz → Konstablerwache (sm3) → Alte Brücke → Mainkai (drift) → Eiserner Steg (long jump) → Kaiserstraße → Alte Oper.
- GO `why/loop5`: ≥ 6000 studs, ≥ 4 events started, ≥ 1 car unlock, 0 dead 20 s windows, ≤ 1 text pill, 0 cards, no frame > 100 ms in the sim log; runs on the BUILT page in the gate.
- Shot 852×393: one frame per minute (5 shots) to LOOK at, plus the stud/time curve in the GO pass line.
- 2K ref: a 5-minute 2K Bricklandia session clip, counted the same way (studs, events, dead time); side-by-side numbers in the pass line note.

## 7. What this plan does not cover (other lanes)
- Traffic you can hit and that does not dodge: gap 3, OPUS design then SONNET build. L2 car-smash thresholds wait for it.
- Frame and boot budget: gap 2 (OPUS "budget"). L1 must not raise the core's draw calls; the iPhone gate (perf/ios-reveal) stays the truth.
- Athens repair (gap 8) is parked with Athens; its GOs keep running so it does not rot.

Expected result after L1-L8 + gap 3 build: the minute-one experience is the 2K loop in one dense, real Frankfurt core, with Athens and the modes one tap away under MORE.
