# Strict review #4: Mainhattan Overdrive v90m-beta.85 + dest4 (trunk `ab53298`) vs LEGO 2K Drive

Reviewer session review2k-4, 2026-10-17. Build: trunk `ab53298` (beta.85 `b33faed` + dest4 destructibles/shortcuts, ON by default), built with `tools/build.sh v90m-beta.85d`, served locally. The coordinator moved the target from `b33faed` to trunk HEAD mid-review, and Alex reported beta.86 Athens as "unplayable, full of bugs", so Athens carries extra weight here.
Shots: `docs/shots/review2k4/` (the 11 I looked at).
Scripts: `tools/tRv2k2.js <url> <out> fra|ath|por` (same as review #3), iPhone memory `tools/crash2/tMem2.js` (852×393, DPR 3, iOS UA = low-mem tier), and two new probes (copies are in the review session only, the method is described below): **tRv4** (iPhone UA, 120 s road-follow: avg km/h, stops > 3 s, teleports > 25 m per step, camera distance swings ≥ 2 m, smash counters SM2.n, Westend with the bot) and **tAth** (Athens, 90 s road-follow from 3 starts, logs every stop, teleport and hit with its position). Software GL, 4–5 browsers on 4 CPUs, so boots took 115–186 s (not comparable). I looked at 9 landscape and 2 portrait shots (listed per row). Console errors: 0 in every run.

**Overall: 4.8 / 10 against 2K Drive** (mean of 12 scored aspects; review #3 was 4.4).
The biggest change: **the Akropolis final is now won in a real play-through** (1st, 115.8 s, 5 lead changes, 38 m median gap), and Westend Split still plays as a real race (1st, 5 changes, 32 m). Frankfurt road-follow holds 94–121 km/h with 0 stops > 3 s. iPhone memory at 5 min is 644 MB in Frankfurt (was ~856 MB in crash-2 and 653 MB in crash-6).
Still not 2K: two of the four races are still DNF. Athens streets are empty near the start (5 cars within 120 m, 1 moving). In Athens the car rams traffic all the time (171 car taps + 34 car smashes in 2 min). The Athens camera swings in and out 7.5 times a minute (Frankfurt: 1). The builder is still a black void in the play-through. A LEVEL UP card covers the garage.

## Measurements (trunk ab53298; r3 = beta.81)
| what | r4 | r3 |
|---|---|---|
| Road-follow 30 s from spawn, Frankfurt | 94 / 110 km/h (2 runs), 0 hits, lowest health 91 | 116–127 |
| Road-follow 30 s from spawn, Athens | **66 km/h**; ends at (1609,-1712), inside the Ermou/Mitropoleos pedestrian maze | 29 |
| tRv4 road-follow 120 s, Frankfurt / Athens | 121 / 92 km/h; stops > 3 s: 0 / 0; teleports: 1 / 1 | – |
| tAth 90 s ×3, Athens | 97 / 120 / 119 km/h; teleports at (1039,-1893)→(1041,-1924) and (-83,-1904)→(-64,-1883); hits 117 km/h at (1041,-1924), 83 km/h at (1114,-1864) | – |
| Camera distance (5 / 50 / 95 %), swings ≥ 2 m per min | Fra 5.9 / 6.5 / 7.2 m, **1.0**/min · Ath 5.8 / 6.7 / 7.4 m, **7.5/min** | – |
| Traffic contacts in 120 s (SM2.n) | Fra 54 taps / 83 car smashes · **Ath 171 taps / 34 car smashes**; props: Fra 1 tap / 0 smash, Ath 5 taps / 14 smashes | – |
| Street life at the start (tRv2k2) | Fra 17 cars ≤ 120 m (12 moving), 29 after 30 s · **Ath 5 (1 moving), 0 after 30 s** | Fra 32/27 (GO) |
| Westend Split, bot | **1st 2:17.4**, 5 lead changes, gap median 32 m, 1 wall | 1st, 5, 21 m |
| Westend Split, hands-off | DNF (good) | DNF |
| Main River Run, bot | **DNF**, 0 changes, gap median 1247 m | DNF 1238 m |
| Grand Prix Quick Race, bot | **DNF 4th**, 10 lead changes, gap median 238 m (max 624 behind) | DNF 4th |
| Akropolis final, bot, after 30 s Athens roam | **1st 1:55.8, 5 lead changes, gap median 38 m, 0 walls, 0 stuck** | DNF 709 m |
| iPhone memory, Frankfurt, 5 min (tMem2) | 467 → 539 (60 s) → **644 MB** (heap 427 + GPU 217), +19 % after 60 s; canvas 1278×589, pr 1.5, 63 cars | crash-2: 856 |
| iPhone memory, Athens, 60 s | 604 → **707 MB** (heap 560 + GPU 148), 31 cars | crash-6 boot peak 765 |
| Garage UI | 156 cards, 0 text < 12 px | – |
| Result panel | car 34 km/h under the panel, "~02:20.50" for the rival, no STORY pill | 101–117 km/h |

## Alex's open complaints
| complaint | verdict | evidence |
|---|---|---|
| Phone crashes / memory | **partly fixed** | 644 MB after 5 min in Frankfurt and 707 MB at 60 s in Athens (heap alone 560 MB) under emulation. Still +19 % growth after 60 s, and Athens is +31 % over Frankfurt at the same time point. A real iPhone may still kill the tab in Athens. No device number. |
| Athens loading on the phone | **open (not measured on device)** | Athens 60 s total 707 MB; boot 151 s here under load (Frankfurt 134 s on the same box). No cold phone timing. |
| Camera far/close loop | **open, Athens** | 7.5 camera-distance swings ≥ 2 m per minute in Athens vs 1.0 in Frankfurt (same road-follow law). `westend_bot_1.jpg`: the race camera sits high above the road with the car off the bottom edge. The likely source is the fcam-2 pull-in (snaps in, eases out 0.8/s) firing against Athens building meshes. |
| Athens walls blocking roads | **partly fixed** | ath/roads-clear audit 1 → 0 colliders on streets (athroads). But tAth logs two 20–31 m position jumps followed by hits at 117 and 83 km/h at (1041,-1924) and (1114,-1864): a push-out by a wall or terrain step on the road. |
| Too-frequent respawn | **mostly fixed in roam** | 1 teleport per 2 min in each city (tRv4), 0 to 1 per 90 s in tAth. The jumps are 20–31 m push-outs, not full respawns. |
| Items stopping the car dead | **open by design** | An AI item hit sets `RO.v *= .55` (98tk_city_duel.js:150): −45 % at once. Not counted in a race this time (the tRv4 race step did not finish in the timebox). |
| Destructibles and shortcuts | **landed, visual unverified** | dest4 is ON. The dest GOs passed for the worker. My live-loop shot (`r4_dest_shortcut.jpg`, without `draw=0`) booted into the STORY Hot Drop sky intro (white screen, 150 km/h), so no arrows are visible. **Unverified in both workers' shots.** Frankfurt props in 2 min: 1 tap, 0 smashes. Athens: 5 taps, 14 smashes. |
| Smash on a light touch | **fixed for props, open for traffic** | smash2 gate: props smash only ≥ 28/45 km/h. But road-follow at 92–121 km/h racks up 83 (Fra) and 34 (Ath) car smashes plus 54/171 taps in 2 min: the car rams traffic about once a second in Athens. |
| Fair takedowns | **fixed in the duel** | fair2 ON: shove cap 4 %, takedown = boost or ≥ 12 m/s closing (fair2 GOs green for the worker). Westend and Akropolis are now won with 5 lead changes each. |

## Scores vs 2K Drive
| # | aspect | r4 | r3 | evidence (shot) | single highest-impact fix |
|---|---|---|---|---|---|
| 1 | First 60 s / onboarding | **5** | 5 | Not re-measured cold (5 browsers). Portrait roam: STORY pill + "HIT FAST = SMASH" hint, clear (`por_fra_roam.jpg`). | Cold STORY → first frame on a phone. |
| 2 | Free-roam driving feel | **5** | 4 | Fra 94–121 km/h, 0 stops > 3 s (`fra_drive.jpg`, 138 km/h through traffic). Athens 66 km/h from spawn (pedestrian maze), 92–120 elsewhere. But constant traffic contact (Ath 171 taps / 2 min). | Athens: traffic lane-yield + spawn on an avenue. |
| 4 | Story / side quest | **4** | 3 | The gascard fix (r3B) closes an auto card after 0.35 s of gas. No card froze the car in any run (0 stops > 3 s). | – |
| 5 | Races | **5** | 4 | Westend 1st (`westend_bot_2.jpg` result: 1ST, 2 stars, 34 km/h), Akropolis 1st (`akropolis_bot_1.jpg`, 132 km/h, lively avenue). River Run DNF 1247 m, Grand Prix DNF 4th. In `westend_bot_1.jpg` I see no place/gap pill. | Pace River Run and the Grand Prix like Westend. |
| 6 | Builder | **3** | 3 | `builder.jpg`: "MY TRACK · 1 pieces" (START seed) but still a **black void**, no ground or grid in the play-through path (GO rv2k3/builder passed for r3E). | Grid/ground must show on the BUILD entry the player uses (garage → BUILD). |
| 7 | Garage | **4** | 5 | `garage.jpg`: a **LEVEL UP card covers the top centre** of the garage on open. Ride labels still cut ("Orange Street…", "Midnight Street…"). The EXIT tile overlaps the first card row. Rarity tags fit now. | Queue LEVEL UP until garage close; two-line names with no ellipsis. |
| 8 | Vehicle transform | **6** | 6 | `river_bot_1.jpg`: the boat reads well, but the water is still pale blue/white. | Deeper water colour. |
| 9 | Traffic / pedestrians | **5** | 6 | Fra 17/12 near the start, 29 after 30 s. **Athens 5 near, 1 moving, 0 after 30 s** (`ath_drive.jpg`: an empty dirt lane through grass). The Akropolis avenue is lively (`akropolis_bot_1.jpg`). | Athens traffic/people density around the spawn and centre. |
| 10 | HUD / menus | **5** | 4 | Result panel clean: no STORY pill, projected rival time, car slows to 34 km/h. The 🐞 and ✔ chip still show in roam (`fra_drive.jpg`, `por_*`). No race place/gap pill in `westend_bot_1.jpg`. | Confirm the race pill shows for the whole race. |
| 11 | Performance / memory | **4** | 3 | Fra 644 MB at 5 min (+19 % after 60 s); Ath 707 MB at 60 s. Boot not comparable. | Athens heap 560 MB at 60 s: cut LIFE/LF in the Athens low-mem tier. |
| 13 | World art | **6** | 6 | Deep sky, brick clouds, lively Athens avenue (`akropolis_bot_1.jpg`). `ath_drive.jpg`: big yellow-green leaf slabs float over grass on the right, and the spawn street is a dirt path. | Clean up Athens spawn lane foliage. |
| 14 | Portrait | **5** | 4 | `por_fra_drive.jpg` 107 km/h: clear HUD, 0 debris, but the car fills ~40 % of the screen (camera too close). `por_fra_roam.jpg`: STORY pill truncated ("Hot Dr… Garage …"). | Portrait camera pull-back. |

Mean, 12 scored (1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 13, 14): (5+5+4+5+3+4+6+5+5+4+6+5)/12 = **4.75 → 4.8**.

## Review #3 TOP 10 re-check
| r3 # | GO | evidence now | verdict |
|---|---|---|---|
| 1 | rv2k3/akro-play | (no GO code) play-through after 30 s Athens roam: **1st, 115.8 s, 5 changes, gap 38 m** (target 1st/2nd, ≤ 60 m) | **FIXED** (1 run, not 3) |
| 2 | rv2k3/jam | tRv4: 0 stops > 3 s in both cities, avg 121 / 92 km/h; Athens from spawn 66 km/h | **FIXED Fra / PARTLY Ath** |
| 3 | rv2k3/races | River Run DNF 1247 m, Grand Prix DNF 4th 238 m (10 changes) | **OPEN** |
| 4 | rv2k3/racepop | r3C: level-up queued during a race; no card in my race shots | **FIXED** (but the LEVEL UP now lands on the garage) |
| 5 | rv2k3/finish | 34 km/h under the result panel (`westend_bot_2.jpg`) | **FIXED** |
| 6 | rv2k3/gascard | 0 stops > 3 s with gas held across 5 road-follow runs | **FIXED** |
| 7 | rv2k3/pos | r3C added the pill; it is **not visible** in `westend_bot_1.jpg` (high camera) | **PARTLY** |
| 8 | rv2k3/devui2 | 🐞/✔ no longer over panels (garage shot clear); still drawn in roam | **FIXED** (by its test) |
| 9 | rv2k3/builder | GO passed for r3E; the play-through shot is still black | **PARTLY (GO green, play red)** |
| 10 | rv2k3/debris-por | `por_fra_drive.jpg`: no slabs in portrait | **FIXED** |
GO lines from my combined runner did not complete in the timebox (the first tChkGo run timed out at boot under 5-browser load; see the status file). The verdicts above come from the play-throughs and probes.

## NEW TOP 10 by impact on fun (Athens first, as Alex asked; ver `rv2k4`)
| rank | problem | evidence (positions) | acceptance test (pass line) | GO id |
|---|---|---|---|---|
| 1 | **Athens camera far/close loop** | 7.5 swings ≥ 2 m/min in Athens vs 1.0 in Frankfurt (same driver); race camera high above the car (`westend_bot_1.jpg`) | 120 s Athens road-follow from spawn: camera-distance swings ≥ 2 m ≤ 1.5/min and car centre inside the frame every sampled frame | `rv2k4/ath-cam` |
| 2 | **Athens car rams traffic constantly** | 171 taps + 34 car smashes in 120 s road-follow (Fra 54 + 83); the spawn lane is empty but the centre isn't | 120 s Athens road-follow: SM2.n.carTap + carSmash ≤ 30 and avg ≥ 90 km/h | `rv2k4/ath-traf` |
| 3 | **Athens spawn is a pedestrian maze / dirt lane** | 30 s from spawn 66 km/h, ends at (1609,-1712) (Ermou/Mitropoleos ped net); `ath_drive.jpg` dirt lane, floating leaf slabs | 30 s road-follow from the Athens spawn: avg ≥ 90 km/h, ends on a non-ped street class | `rv2k4/ath-spawn` |
| 4 | **Athens road push-outs (wall/step on the road)** | 31 m jump (1039,-1893)→(1041,-1924), then a hit at 117 km/h; hit 83 km/h at (1114,-1864); jump (-83,-1904)→(-64,-1883) | Warp to each of the 3 spots, 60 km/h road-follow 10 s: 0 position jumps > 10 m/step, 0 speed halvings | `rv2k4/ath-push` |
| 5 | **Athens is empty around the start** | 5 cars ≤ 120 m, 1 moving; 0 after 30 s of driving | Athens spawn + after 30 s: ≥ 15 cars ≤ 120 m, ≥ 10 moving, ≥ 15 people ≤ 60 m | `rv2k4/ath-life` |
| 6 | **Athens memory on iPhone** | 707 MB at 60 s (heap 560) vs Fra 539 MB at 60 s | tMem2 ath 3 min, low-mem: total ≤ 650 MB at 60 s and ≤ +10 % 60 s → end | `mem/ath-60` |
| 7 | Two races still unwinnable | River Run DNF 1247 m, Grand Prix DNF 4th 238 m | Human-like bot on River Run and the Grand Prix: finishes, ≥ 2 lead changes, gap median ≤ 60 m (= `rv2k3/races`, still no GO code) | `rv2k3/races` |
| 8 | Item hit = instant −45 % speed | `RO.v*=.55` on an AI item hit (98tk_city_duel.js:150) | Westend bot run: every item hit leaves ≥ 70 % of pre-hit speed, back to 90 % within 1.5 s | `rv2k4/item-hit` |
| 9 | Builder still black in the real path | `builder.jpg`: black canvas, 1 piece | Garage → BUILD (the tRv2k2 path): centre 50 % of the canvas < 20 % pure-black pixels | `rv2k3/builder` (extend to this path) |
| 10 | Shortcuts/smash visuals unverified + garage LEVEL UP | dest shots blank (dest4 upside-down, mine in the Hot Drop intro); LEVEL UP card over the garage (`garage.jpg`) | Shot 852×393 at a shortcut entrance shows ≥ 2 arrow meshes in frustum (state assert: `DEST.scGrp` children visible & projected on screen); garage open: 0 cards over the garage panel | `rv2k4/dest-vis`, `rv2k4/garage-pop` |

## Other bugs seen
- `ath_life_after`: 0 cars within 120 m after 30 s of Athens driving (traffic doesn't follow the player into the ped area).
- Garage: EXIT tile overlaps the first ride card; names still "…" truncated.
- Portrait STORY pill truncated ("STORY · Hot Dr… Garage …").
- dest4 shot path: `?test=fra` without `draw=0` drops into the STORY Hot Drop intro, so a live-loop shot needs the intro skipped first (`r4_dest_shortcut.jpg`).
- Frankfurt start traffic 17 ≤ 120 m (review #3 GO: 32) after crash-5 low-mem LIFE/LF delays; recovers to 29 after 30 s.
