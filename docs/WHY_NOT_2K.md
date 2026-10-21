# Why Mainhattan Overdrive is not LEGO 2K Drive (yet): a gap analysis from the player's seat

2026-10-21, trunk `alex/od-int2` @ `544058d` (beta.144 + lazy split), built with `tools/build.sh why2k`.
Alex's score: **3/100, then 10/100** ("unplayable, nothing is fixed"). Our own review #20 scored the same game **8.0/10**.
That 70-point gap between our tests and the player is the first finding: **we measure the engineering, not what a player feels.**

## 1. How I looked
- **Tool:** `tools/tWhy2k.js <built dir> <outdir> land|por fra|ath`. It runs the built page with its own static server, touch emulation at 852×393 and 393×852, and software GL.
  - Frankfurt: a real boot (no `?test`). It polls what is on screen every 0.5 s and taps the obvious button the way a player would.
  - Athens: the `?test=ath` start, because a cold boot has no Athens entry.
  - Then it drives for 180 s with gas held, a steer pattern, and backing out when stuck.
  - Then it runs two staged checks: the steepest ground within 120 m (gas for 8 s), and a slow nose-in into the nearest NPC car.
  - Raw data: `docs/shots/why2k/{fra,ath}_{land,por}.json`.
- **Caveat:** the lab renders at **0.7–1.7 fps** (software GL), so the 180 s drive covers only about 10–20 s of game time, and the timings below are lab timings, not phone timings. Each shot is real and I looked at all 36. The 7 kept shots are in `docs/shots/why2k/`.
- **Research:** reviews and player threads, cited by name and URL in §2. IGN, Polygon, Metacritic and Reddit text could not be retrieved, so they are not cited.

## 2. What makes the good ones good (sources)
| Topic | What reviewers/players say | Source |
|---|---|---|
| Open world | 2K Drive's Bricklandia is "the game's best feature", "begging to be dismantled". Auto-morphing between road, off-road and water makes crossing the map "thrilling". | Game Informer, gameinformer.com/review/lego-2k-drive/stud-your-engines |
| Leaving the road | Even 2K Drive is criticised for a "brutal slow down" when you leave the track, and for intense missions getting in the way: the reviewer wanted "a more low-key approach to exploration". | Game Informer (same) |
| Smash loop | Most scenery is smashable and gives boost; side quests level you up for races. Handling is "a little on the heavy side", and drifting is rewarding once learned. | VGC, videogameschronicle.com/review/review-lego-2k-drive-is-a-light-hearted-treat-with-a-big-issue-at-launch |
| Monetisation / grind | "Typical 2K grindy microtransactions"; ~10 h of play yields about one car. | VGC; TechRadar, techradar.com/reviews/lego-2k-drive-review-one-of-the-best-racers-ever-built |
| Tech | Stutter once races start (Steam thread); the 2K Drive launch had a save wipe. | steamcommunity.com/app/1451810/discussions/0/3821912152393937483 |
| Activity overload | Forza Horizon 5's map is "overwhelmed with activities" at the start; the reviewer wanted events unlocked gradually. | Analog Stick, analogstickgaming.com/game-reviews/2021/11/22/forza-horizon-5 |
| Emptiness / props | FH5: you can cross the motorway without seeing an NPC car, and festival-goers are static. Mario Kart World's free roam is "relatively empty", with ~400 missions that are over in seconds. | racinggames.gg/forza/forza-horizon-5s-emptiness-is-a-real-problem; gfinityesports.com/article/mario-kart-world-review |
| No nagging | Mario Kart World: rewards are thin, but the lack of checklist nagging feels "refreshing". | Digital Trends, digitaltrends.com/gaming/mario-kart-world-free-roam-opinion |
| Events in the world | Burnout Paradise starts events by stopping at traffic lights, and mode switching is "remarkably seamless". The city is "built exclusively to cater to your destructive whims". Downside: a lost race means driving back to the start. | GameSpot review; Shacknews, shacknews.com/article/50843/burnout-paradise-review |
| One-button loop | Crazy Taxi: one big arrow, time bonuses for fares, extra pay for drifts, jumps and near-misses; "easy to learn, difficult to master". | en.wikipedia.org/wiki/Crazy_Taxi_(video_game) |
| Instant retry | Trackmania: one-button restart, so a mistake costs seconds; about 5 inputs in total. | news.ubisoft.com (Trackmania launch); pcgames.de Trackmania 2020 review |
| Too much AI | NFS Unbound: police "overabundance and sheer persistence ... doesn't feel necessary"; cars "stiff and sluggish". | shacknews.com/article/133357/need-for-speed-unbound-review-score |
| Browser precedent | Slow Roads: no objective, runs on low-power laptops with lower settings, "chilled vibes". Smashy Road: ~1-minute runs; complaints are ads and IAP. | jalopnik.com/slow-roads-best-browser-driving-game-1850304751; allaboutwindowsphone.com/reviews/item/21201_Smashy_Road_Wanted.php |

**Rules distilled.** Sourced where marked; rules 1, 5 and 8 are my inference from the sources.
1. Driving within seconds of the first tap, with no modal story first.
2. A dense small world beats a big one (FH5 and MKW emptiness complaints).
3. The world never punishes a mistake: no traps, and an instant reset (Trackmania; Game Informer's slowdown complaint).
4. Activities are found in the world and never pushed (Burnout, FH5, MKW).
5. Traffic is solid, readable and fun to hit (Burnout).
6. A light AI presence that never harasses you (NFS).
7. Minimal HUD on touch.
8. Stable frame rate before visual ambition (2K Drive's own stutter complaints).

## 3. What a player gets in our game (measured)
**Frankfurt, first launch, 852×393** (lab timings, software GL):
| t (lab s) | What is on screen | Player action |
|---|---|---|
| 8.7 | WELCOME + big ▶ PLAY "Hot Drop · your first drive" (clean, good) | tap PLAY at 21 s |
| 21.8 → 63 | Loader "RAISING…", tip text, credits | wait (~42 s lab; Alex: ~35 s on PC) |
| 63 → ~140 | Fly-over cutscene + **Oma Hilde dialogue cards** ("Late for your own job interview, rookie!…", "Pop the chute over the Messe, then follow my tow truck…"), each "TAP TO CONTINUE", with SKIP | tap, tap, parachute |
| ~140 | Driving at last: a **follow-the-tow-truck mission with a 04:20 timer**, the "HOT DROP · P1/5 · Follow 40 m" banner, and the "HIT FAST = SMASH" pill | the mission chooses the route |

- **Speed while driving, 180 s lab:** Frankfurt landscape spent 125 of 180 samples below 5 km/h; portrait spent 100. That is the cutscene time plus a slow follow start, and it covers only a few seconds of game time.
- **Athens test start:** 7 buttons to control, then it auto-assigns "Yiayia Froso · Koulouri Rush → 1491 m" and a "DRIFT HERE 0.0 / 4 s of drift" prompt that I never asked for.
- **HUD in roam:** 9–10 buttons (◀ ▶ GAS BRAKE BOOST ❚❚ ↺ ⚙ 🐞, plus ✓0/4 in Athens), a minimap, a mission banner, a hint pill, the speed and a boost bar. That is **14–15 elements**.
- **Slope check:** the steepest ground within 120 m of the start road is **37° (Athens landscape), 49° (Athens portrait) and 48° (Frankfurt)**. After 8 s of gas uphill the car had moved **4–15 m and showed 2–14 km/h**: it is stuck against the slope.
- **NPC nose-in at 14 km/h from 12 m, 4 runs:** the closest approach was **4 / 6.3 / 8.2 / 10.6 m**. The car never touched the target, because every target swerved or drove away (Alex: "NPC cars switch away from me abnormally").

**Shots** (2K Drive claim → our shot):
| # | Shot | 2K Drive reference (described) | Ours |
|---|---|---|---|
| 1 | `1_first_drive_fra_852.jpg` | Chunky glossy car on a road, deep blue sky, brick clouds, busy roadside | **Close.** Blue sky, brick clouds and a LEGO car read well; the roadside is busy. Our best picture. |
| 2 | `2_dialog_over_world_fra_852.jpg` | First minutes: you drive, and dialogue plays over driving | A modal dialogue card over a fly-over; no control yet |
| 3 | `3_street_ath_852.jpg` | Lively street, readable lanes | Wide empty avenue with apartment blocks; HUD pills over the sky; "DRIFT HERE" prompt unasked |
| 4 | `4_slope_trap_ath_852.jpg` | Off-road is a fun alternative (auto-morph), never a dead end | Car nosed into a building corner on a **37° grass slope**, 5 km/h, giant low-poly leaves and a bin in front of the camera. This is Alex's screenshot, reproduced. |
| 5 | `5_traffic_closeup_ath_852.jpg` | Traffic drives in lanes; you bash it and bricks fly | Taxi crossing the lanes 4 m from us; we never connect |
| 6 | `6_npc_overlap_fra_393.jpg` | Solid cars | Player car drawn **inside** an orange NPC car at 25 km/h |
| 7 | `7_hud_portrait_ath_393.jpg` | Small HUD: speed, minimap, objective | 3 stacked pills plus minimap, speed and checklist over the top 45 % of a portrait screen |

## 4. Top 10 gaps, ranked by player impact
Each gap lists the evidence, the root cause, a fix lane (model, ~40 min) and "good" as a state assert (a GO in `src/99c_checklist.js`).

**1. The world traps the car: slopes, wall corners, snags (Alex: "hills I cannot get out of").**
- Player feels: steer off the road and you are stuck against grass or a wall; the only way out is a reset.
- Evidence: shot 4; slopes of 37–49° within 120 m of the start in both cities; 2–14 km/h after 8 s of gas.
- Root cause: the terrain heightfield (`src/52a_terr_ath.js`, `src/52f_terr_fra.js`) is not flattened around building plots and roadsides. The auto-unstick in `src/71_roam_drive.js` waits for `stkT>4` (4 s).
- Fix lane: **SONNET** "terrain-flat". Clamp ground slope to ≤15° within 30 m of any street or plot, and auto-hop to the nearest road after 2 s at <5 km/h with gas held.
- Good: GO `why/no-trap` samples 500 points within 30 m of a street, 0 with a slope >15°; a stuck car is back on the road in ≤2.5 s of game time.

**2. Freezes, low fps, long boot (Alex: 35 s PC boot, 30 fps, multi-second freezes).**
- Player feels: the game feels broken before any design question comes up.
- Evidence: Alex's reports. Lab boot to control is 53–63 s (software GL). Reviews 20–21 show Athens shader links and long tasks of up to 18.7 s.
- Root cause: two full cities, 332 source modules, 7.2 MB of model chunks, and a 3.35 MB page.
- Fix lane: **OPUS** "budget". Set a frame and boot budget per city and cut whatever exceeds it; this is not tuning.
- Good: perf/ios-reveal green; drivable ≤10 s on PC; no frame >100 ms in 60 s of roam on PC.

**3. Traffic reads as props: swerves away, overlaps, pass-through, pop-in.**
- Evidence: 4/4 nose-ins never connected (closest 4–10.6 m); shot 6 overlap; Alex's report.
- Root cause: NPC cars run several stacked systems (yield `98ayd`, law `99ctl`, collide `99c9`, NPC push `CR_npcPush`) that each move the car. The evasive lane switch and the "undrawn = not solid" rule (r22c) fight the player's expectation.
- Fix lane: **OPUS** "one traffic brain" (design first, then a SONNET build). Cars keep their lane and do not dodge the player; on contact they are solid, bump, and shed bricks; no overlap ever.
- Good: GO `why/npc-hit` (nose-in at 10–40 km/h makes contact within 1.5 s, 0 frames with overlapping boxes, 0 lane switches caused by the player within 20 m).

**4. The first 5 minutes are a cutscene and a scripted escort, not driving.**
- Evidence: shot 2; about 2 dialogue cards, a fly-over, a parachute, then a 04:20 follow mission before free driving.
- Root cause: `src/80_story_m1.js` Hot Drop is forced on the first PLAY.
- Fix lane: **SONNET** "drive-first". The first PLAY spawns on a road with gas on and control from frame 1. Hot Drop becomes a marker the player can drive into.
- Good: GO `why/first-drive` (PLAY → RO.v>30 km/h with only gas in ≤8 s of game time, 0 modal cards before the first 60 s of driving).

**5. Unasked quests and prompts nag the player (Alex: "annoying pop-ups from useless side quests").**
- Evidence: shots 3 and 7. "Yiayia Froso · Koulouri Rush" is auto-assigned, plus DRIFT HERE, HIT FAST = SMASH and ✓0/4. There are 49 `hitPop(` and 64 `npcSay` call sites.
- Root cause: roam objectives auto-start and every system writes its own pill.
- Fix lane: **SONNET** "quiet roam". Objectives start only when the player enters a marker; one text slot on screen at a time; hints show once per save.
- Good: GO `why/quiet` (180 s roam without entering a marker: 0 auto-started objectives, ≤1 text pill in every sample).

**6. HUD clutter on the phone (14–15 elements).**
- Evidence: shot 7, and the HUD lists in the JSON files.
- Fix lane: **HAIKU/SONNET** "hud-6". Move ↺, ⚙ and 🐞 into pause; drop the ✓ chip and the hint pill; one objective line.
- Good: GO `why/hud` (roam touch: ≤6 buttons, plus speed and minimap; the top 30 % of portrait is ≤15 % covered).

**7. Camera blocked by foliage and walls (Alex's screenshot).**
- Evidence: shot 4, with leaves and a wall in the foreground.
- Root cause: `src/98fc_foliage_cam.js` hides only instanced or AS tree crowns on the car–camera line. Bushes, palms, ground leaves and building walls are not covered, and there is no camera collision pull-in.
- Fix lane: **SONNET** "cam-clear". Pull the camera in on a hit, and fade any mesh within 3 m of the camera.
- Good: GO `why/cam` (at 200 roam spots, the ray from the camera to the car hits no non-car mesh).

**8. Athens is a broken world (Alex: "extremely horrible").**
- Evidence: review 22. 33 stunt ramps sit on streets with steps of up to 4.3 m; big blocks you pass through; palms. Shots 3 and 4.
- Fix lane: **SONNET**. Apply review 22's ramp move, and hide Athens from new players until it passes gaps 1, 3 and 7.
- Good: review 22's asserts, plus gaps 1, 3 and 7 green in Athens.

**9. No clear core loop or identity.**
- Evidence: 8 menu modes (Race, Cup, TT, Zone, Arena, Derby, Crash Jct, Daily), plus Story, a builder and on-foot play. The menu lede still says "Anti-gravity racing through Frankfurt". There are 464 checklist items and 101 versions. 2K Drive's loop is simple: drive → smash bricks for studs and boost → events at markers → new cars.
- Fix lane: **OPUS** "core loop plan" (a doc). One loop, one area, and what gets cut.
- Good: a written loop with a 5-minute session script that a GO can replay (studs earned, events found, 0 dead time).

**10. Crash and smash payoff not measured (2K's core joy).**
- Evidence: not measured in this lab; the run never connected with traffic, see gap 3. VGC and Game Informer name smashable scenery as the hook.
- Fix lane: **SONNET** "smash-juice", after gap 3. Bricks, studs, a short hit-stop and a sound on every hit of ≥20 km/h.
- Good: GO `why/smash` (a hit at 30 km/h spawns ≥20 bricks and +studs, and speed loss is ≤30 %).

**Quick wins (<1 day):** 4 (drive-first), 5 (quiet roam), 6 (HUD), 7 (camera), 1b (the 2 s auto-reset part of gap 1).
**Structural:** 1a (terrain flattening), 2 (budget), 3 (traffic brain), 8 (Athens), 9 (loop and scope).

## 5. Next 5 lanes (start now, in this order)
1. **SONNET drive-first + quiet roam** (gaps 4 and 5). First PLAY → driving within 8 s; no auto quests, one text slot. Biggest feel change for the least code.
2. **SONNET terrain-flat + 2 s unstick** (gap 1). Removes "hills I cannot get out of" in both cities.
3. **SONNET hud-6 + cam-clear** (gaps 6 and 7). A clean phone view and no leaves in your face.
4. **OPUS core-loop + scope plan** (gap 9). Decide on one city and a dense ~1.5 km core with one loop, and list what is cut, including whether Athens is parked.
5. **OPUS one traffic brain, design** (gap 3). The build follows as a SONNET lane.

Each lane ships behind a flag that defaults OFF until its `why/*` GO passes, per rule 3.

## 6. Honest verdict
The parts are not the problem: shot 1 shows that Frankfurt can look like a LEGO driving game. The problem is everything around the road.
- A car that gets stuck the moment it leaves the road.
- Traffic that dodges and overlaps.
- A first launch that makes you watch and follow instead of drive.
- Pop-ups you never asked for, and a HUD that covers the world.
- Freezes on the phone.

On top of that, our process scores 8/10 on state asserts while the player scores 1/10, because no test asks "did the player have fun in minute one?"

Two big OSM cities plus 8 modes plus a story plus a builder is more surface than this production model (2 workers, 40-minute lanes) can make feel good. Every lane adds a system, and none of them gets polished.

**Re-scope:**
- **Keep:** Frankfurt only, a dense core of about 1.5×1.5 km with flattened terrain, solid traffic, smash for studs, and events at markers.
- **Park** Athens and the extra modes behind ALL_OPEN, still reachable but not the first experience.

With that scope I expect a **60–70/100 casual phone game in about 12–15 lanes**: the 5 above, then about 8 lanes of loop, smash and perf. Without the re-scope I do not see two-city parity reaching 70 at any reasonable lane count.
