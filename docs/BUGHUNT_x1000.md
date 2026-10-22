# BUGHUNT x1000: automated, strict bug hunt from the player's seat (2026-10-22, trunk 60dd915)

Tool: `tools/bughunt.js` (new, gate). Data: `docs/shots/bughunt/hunt.json` (every hit with repro), shots `docs/shots/bughunt/*.jpg` (393x852).
No game code changed in this lane.

## 0. Honest limits first
- **x1000 is not reachable on this container.** The game's own frame costs ~20-27 ms of JS with no rendering (the streets step `hubTrafficStep` alone ~11 ms, `roamStep` ~6 ms, `roamCam` ~4 ms). So one page runs **~3-4x real time**, not x1000. That cost is itself a perf finding: the sim alone is over a 16.7 ms frame here. This container's CPU is slower than an iPhone 17, so treat it as a ratio, not a phone number.
- **Clean sim time: 3.8 h** (Frankfurt 2.17 h / 238 km, Athens 1.59 h / 56 km, 16 seeds, dt 0.05 = a 20 fps phone), not the 30 h asked. A first 28 h Frankfurt run was **thrown away**: a far fast travel shows a loader that runs on real rAF, and the captured loop kept counting sim time while the game stood still. Fixed (the hunter now hands back to the loader).
- Rates are per sim hour of this bot, which spends ~25 % of its time doing non-driving things (pause, foot, pins, fast travel). Per-hour rates for driving bugs are therefore a floor.
- dt 0.05 is coarser than a phone at 30-60 fps. Two detectors scale with dt (y jump > 2 m in one step, speed drop > 6 m/s in one step). Read those as "verify at dt 1/30" (`--dt 0.0333`).
- Detectors that count frames (NaN, bounds, y jump, launch) are converted to events below (one event per 25 m cell per episode).

## 1. Strict scorecard: **11 / 100** (player's seat)
| Area | Score | Why |
|---|---|---|
| Stability | 7 / 15 | 0 JS errors, 0 NaN, 0 lazy-chunk errors in 3.8 h; pause, RESET CAR, map and FAST TRAVEL all work with real touch taps. But the car pops 2 m up at a standstill in Athens and falls 8-15 m under the ground line in Frankfurt. |
| Driving flow | 2 / 25 | Athens: the stuck ladder fires **~32 times an hour** (39 reverse-assists + 12 lifts in 1.6 h), plus **14 "UNSTUCK"/h** and **7.5 "BACK ON THE ROAD"/h**. Frankfurt hills: **71 slope slides an hour** (the car standing on a > 30° slope slides back down; ~2.6 per hill attempt). 12 % of gas time in Athens is under 10 km/h. |
| Traffic | 1 / 20 | NPC cars slide sideways at **15-31 m/s** next to the player (Athens), and cars **teleport 4-7 km into view** 50 m ahead. At the Frankfurt start junction NPCs jump 8-11 m in one 50 ms step, again and again (same cell, 3 seeds). |
| World | 1 / 20 | Off the city the world is an empty white/green void (shots: `fra_bounds_4917_-5195.jpg`, `fra_yJump_-2026_3607.jpg`): a bored player drives 5 km to the world edge and sits on it. |
| Interruptions | 0 / 10 | Cards with buttons appear mid-drive without a tap: LEVEL UP, "GATE CRASHER · NO MEDAL! TIME UP ↻ RETRY" from an event the player never meant to start, a garage card. ~2-4/h. |
| Fun | 0 / 10 | Nothing in 3.8 h of bored driving asked the player to do anything: the toasts the bot saw are "STUDS ×1" (511x), "NEAR MISS" (167x), "+3 XP traffic smash" (153x), NPC shouts. No goal, no chase, no reason to go anywhere. |

## 2. Counts per hour per detector per city
Events per sim hour (raw count in brackets). Limits are the gate's (section 5).
| Detector | Frankfurt (2.17 h) | Athens (1.59 h) | Limit |
|---|---|---|---|
| JS errors / XC.err / NaN / out-of-world-box | 0 / 0 / 0 / **0.5** (1 episode, 60 frames at the south edge) | 0 / 0 / 0 / 0 | 0 |
| player stuck (gas held, < 3 km/h > 2 s) | 0 | 0 (the stuck ladder rescues first, at 1.2 s; see next rows) | 4/h |
| stuck ladder fired (SKH reverse-assist + lift) | 4.1 (9) | **32 (51)** | - |
| "UNSTUCK" (71_roam_drive crTurn) | 0 | **13.8 (22)** | - |
| steep-slope slide (SKH) | **71 (154)** | 1.9 (3) | - |
| BACK ON THE ROAD | 0.5 (1) | **7.5 (12)** | 6/h |
| frustration: gas time under 10 km/h | 4.1 % | **11.7 %** | 15 % |
| NPC overlap > 0.25 m for 3 frames | 0 | 0 | 2/h |
| NPC lateral > 3 m/s within 30 m | 1.4 (3) | **8.2 (13)** | 3/h |
| NPC pop / teleport in view < 60 m | **7.4 (16)** | 3.1 (5) | 6/h |
| below ground > 1 m for 3 frames | **1.4 (3)** | 0 | 0 |
| y jump > 2 m in one step | **4.6 (10 cells)** down, at 166-227 km/h | **1.3 (2)** UP, at 1 km/h | 0 |
| launched > 15 m/s up | **3.7 (8 cells)** | 0.6 (1 cell) | 0 |
| stopped by nothing (-22..-54 km/h in one step, no NPC, no collider, no slope) | 2.3 (5) | **6.3 (10)** | 1/h |
| world contacts per km / NPC per km | 0.01 / 0.01 | 0.63 / 0.16 | - |
| card/popup with no tap in the last 2 s | 1.8 (4) | **3.8 (6)** | 2/h |
| dead buttons (real touch: ❚❚, RESET CAR, map, FAST TRAVEL) | 0 | 0 (fast travel 4 s) | 0 |

## 3. Top 20 bugs, ranked by hits per player hour
Repro = `index.html?test=<city>&at=x,z` (+ seed and sim second from `hunt.json`). Owner = suspected module (grep).
| # | /h | City | Bug | Repro | Suspected owner |
|---|---|---|---|---|---|
| 1 | 71 | fra | Can't climb hills: standing on a > 30° slope with gas held, the car is slid back down (2.6 slides per hill attempt) | hill mode anywhere in the Taunus, e.g. `?test=fra&at=-2026,3607` | 99skh_stuck.js `SKH_post` slide, 98tr_terrain.js slopes |
| 2 | 32 | ath | Stuck ladder fires (reverse-assist / lift): the car wedges constantly | `hunt.json` ath cells; e.g. `?test=ath&at=-1276,-920` | 99skh_stuck.js, 98esc_escape.js; the wedge geometry (Athens colliders / 52a_terr_ath.js) |
| 3 | 13.8 | ath | "UNSTUCK" auto-reverse fires (crTurn found no way out for 2 s) | ath, any narrow street | 71_roam_drive.js:73 |
| 4 | 8.2 | ath | NPC slides sideways 15-31 m/s within 30 m | `?test=ath&at=489,-1613` (5 hits, seed 506 t 5235 s), `?test=ath&at=-2546,1506` | 98ayd_yield.js (c.yo dodge), 95_drive_flow.js W10_bump shove, 98rd_roads.js RD_unstack, 98nc_npc_collide.js NC.latV |
| 5 | 7.5 | ath | BACK ON THE ROAD re-place (12 different cells: the world is still a trap) | `?test=ath&at=-133,-1701`, `?test=ath&at=31,-1759`, `?test=ath&at=-2313,176` | 99skh_stuck.js `ESC_lift`; the cells themselves |
| 6 | 7.4 | fra | NPC jumps 8-11 m in one step in view at the start junction (same cell in 3 seeds) | `?test=fra&at=-359,454`, `?test=fra&at=-1446,720` | 95_drive_flow.js DR_unjam, 98rd_roads.js RD_unstack, 90_fixes_cv_ju.js CV signals |
| 7 | 6.3 | ath | Car stopped dead by nothing (no NPC, no collider, no slope ahead) | `?test=ath&at=-129,-1958`, `?test=ath&at=-1326,-882`, `?test=ath&at=-2530,1612` | 99c6_athpush.js, 71_roam_drive.js speed clamps |
| 8 | 4.6 | fra | Car drops > 2 m in one step at 166-227 km/h downhill (glued to terrain instead of flying; dt-scaled) | `?test=fra&at=6821,3899`, `?test=fra&at=-2026,3607` | 71_roam_drive.js terrain follow, 98tr_terrain.js |
| 9 | 3.8 | ath | Cards mid-drive with no tap: LEVEL UP (3x), ghost race HUD, Kolonaki garage card | `?test=ath&at=-2512,1341`, `?test=ath&at=630,-1450` | 98v_r3_levels.js / 98r3e_r3e.js (r3Up), 85_audio_feel_sp_otg.js (ogHud), 70_roam_world.js (roamCard) |
| 10 | 3.7 | fra | Launched up at 17 m/s (river banks: "BANK HOP" fires 8/h; check it is meant to) | `?test=fra&at=1957,-1757`, `?test=fra&at=2809,-805`, `?test=fra&at=-963,-154` | 71_roam_drive.js BANK HOP |
| 11 | 3.1 | ath | NPC teleports 4-7 km into view 50 m ahead (recycled car placed in the player's view) | `?test=ath&at=-386,-1988` (seed 503 t 2679 s), `?test=ath&at=608,-1485` | 70_roam_world.js hubTrafficStep recycle, 98w_w13_traffic.js |
| 12 | 2.3 | fra | Speed loss of 22-54 km/h in one step on the Main (boat transform at the bank?) | `?test=fra&at=2240,-1674`, `?test=fra&at=1954,-1748` | 98xf_xform.js (BOAT), 71_roam_drive.js |
| 13 | 1.8 | fra | Event result card "GATE CRASHER · NO MEDAL! TIME UP ↻ RETRY" for an event the player drove into by accident; LEVEL UP card | `?test=fra&at=-619,-385`, `?test=fra&at=-2686,1` | 85_audio_feel_sp_otg.js (OG gates), 98v_r3_levels.js |
| 14 | 1.4 | fra | NPC slides sideways 3.1-3.3 m/s at the start junction (same cell as #6) | `?test=fra&at=-358,451` | as #4 |
| 15 | 1.4 | fra | Car 7.6 m under the ground line at 202 km/h (2 more hits are the boat under a bridge: likely false) | `?test=fra&at=4091,-3386` | 53_terrain_roads.js roamTerr, 98tr_terrain.js |
| 16 | 1.3 | ath | Car pops 2.1-2.6 m UP in one step at 1 km/h (a rescue lift < 12 m sideways?) | `?test=ath&at=-34,-1878`, `?test=ath&at=-2429,1340` | 99skh_stuck.js SKH_post / ESC_lift |
| 17 | 0.6 | ath | Launched 17 m/s up at 111 km/h | `?test=ath&at=-1420,-930` | 52a_terr_ath.js / 99c6_athpush.js |
| 18 | 0.5 | fra | Drove 5 km through an empty void to the south world edge and sat on it (60 frames) | `?test=fra&at=4917,-5195` | 60_city_build4.js far biomes, 98tr_terrain.js |
| 19 | 0.5 | fra | BACK ON THE ROAD | `?test=fra&at=2444,-2687` | 99skh_stuck.js |
| 20 | perf | both | Streets step ~11 ms per frame with no rendering (whole frame 20-27 ms JS) | any | 70_roam_world.js hubTrafficStep + its 15 wrappers (98l3, 98ayd, 98rd, 98l, 95, 90, 98ct, 98qs, 98tr) |

Not found (good): 0 JS errors, 0 NaN, 0 NPC-box overlaps (npc-collide-r22c holds), 0 dead buttons, 0 stuck > 2 s that the ladder did not catch.

## 4. Fix first: 5 lanes that remove the most bug-hits per hour
1. **Athens is a trap (removes ~54/h: #2, #3, #5, #16).** Take the 12 BACK ON THE ROAD cells and the stuck-ladder cells from `hunt.json` (`det` backOnRoad / the SKH counters), fix the geometry that wedges the car (kerb/collider/terrain step), not the rescue. Owner: Athens terrain + colliders (52a_terr_ath.js, 99c6_athpush.js, 99skh_stuck.js). Gate: `node tools/bughunt.js --city ath` backOnRoad < 2/h, SKH fires < 5/h.
2. **Let cars climb (removes ~71/h: #1, #8).** 2K Drive lets you drive up anything; ours slides you back on > 30° slopes. Raise the climb limit or flatten the Taunus slopes where roads are not. Owner: 99skh_stuck.js SKH_post, 98tr_terrain.js.
3. **Traffic must never slide or teleport in view (removes ~20/h: #4, #6, #11, #14).** One rule in the traffic step: no car moves > v·dt + 0.5 m or sideways > 3 m/s within 60 m of the camera; recycle only behind the camera. Owner: 98ayd_yield.js, 98rd_roads.js, 95_drive_flow.js DR_unjam, 70_roam_world.js.
4. **Invisible stops (removes ~9/h: #7, #12).** Log the reason of every one-step speed loss > 20 km/h in roamStep (which clamp did it) and remove the ones with nothing drawn. Owner: 99c6_athpush.js, 71_roam_drive.js, 98xf_xform.js (boat).
5. **No card without a tap (removes ~6/h: #9, #13).** LEVEL UP and event results become toasts while driving; events start only after a confirm. Owner: 98v_r3_levels.js, 85_audio_feel_sp_otg.js. (The empty outer world, #18, needs a design lane, not a bug fix.)

## 5. The gate
`node tools/bughunt.js --hours 2 --city fra` prints one PASS/FAIL line per detector, an INFO line (sim minutes actually covered, km, seeds) and a final PASS/FAIL line, in < 5 min wall (`--budget 270`, boot included; builds `out/bughunt` from src/ when stale). Exit code 1 on any FAIL.
At ~4x real time the 5-minute gate covers ~10-15 sim minutes, not 2 h: the INFO line says so. For the full hunt: `node tools/bughunt.js --hours 20 --city both --budget 1900 --shots 10 --json docs/shots/bughunt/hunt.json` (~32 min). Shots only: `--shotat 'ath:npcLateral:489,-1613,3.77'`.
Limits: NaN, bounds, JS errors, below ground, y jump, launch, dead buttons = 0; stuck 4/h, NPC overlap 2/h, NPC lateral 3/h, NPC pop 6/h, BACK ON THE ROAD 6/h, invisible stops 1/h, popups 2/h, frustration 15 %.
Today trunk FAILS it in both cities (Frankfurt: bounds, below ground, y jump, launch, NPC pop, invisible; Athens: y jump, launch, NPC lateral, BACK ON THE ROAD, invisible, popups).
