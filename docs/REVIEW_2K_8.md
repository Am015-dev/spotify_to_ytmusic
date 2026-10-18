# Strict review #8: Mainhattan Overdrive trunk `bcd0382` (= beta.104 + phone-1) vs LEGO 2K Drive

Reviewer session rev8, 2026-10-18. Build: `tools/build.sh r8`: BUILD_OK, page 3.24 MB, split. Served from `out/r8` (python http.server).
The rubric and the 12 aspects are the same as reviews #6 and #7 (`alex/rev7:docs/REVIEW_2K_7.md`), so the scores compare.
SwiftShader, 4 CPUs. Every result below is a state assert from a script, not a real-time judgement.

Scripts. Everything is on this branch; no game code changed.
- `tools/rv8/probe.js <url> <city> <wander|road|ram|sweep> <secs> [seed] [WxH]`: stepped 60 s free roam from the city spawn, gas held. It logs:
  - stuck episodes (< 2 m/s for ≥ 1 s);
  - teleports (> 6 m in one step), tagged nudge-hop, rebuild or other;
  - wrecks, banners, hard stops, smashes, min HP and step exceptions;
  - a road-blockage scan: drivable `CITY_S` points that `roamHit` reports as solid.
  `sweep` warps to 12 random drivable streets and scans 350 m around each.
- `tools/rv8/hud.js <url> <city> <WxH> <out>`: covers the menu (cold boot), the roam HUD and the race HUD (bot, 20 s). It records visible text under 12 px and ellipsised text, then drives over every race item box and catches exceptions.
- `tools/tRv2k2.js` (fixed since r7, now slices from `tkRock`): races and shots.
- `tools/perf1/tFrame.js` (perf-3 harness): one run per city, alone on the machine.
- An ad-hoc `DEST` poll (Athens, real time, 300 s).

Shots I looked at:
- 852×393: `ath_roam` (spawn), `ath_drive`, `fra_roam`, `fra_drive`, `akropolis_bot_0`, `westend_bot_0`, `river_bot_1`, `builder`, menu (`ath_852x393_menu`).
- 1280×720: `ath_1280x720_race`.
- Reference: `docs/race_ref/05_pack_5th_boost.jpg`.

**Overall: 5.3 / 10 against 2K Drive** (mean of the same 12 aspects; r7 5.1, r6 4.8).

**What got better:**
- **Races:**
  - 4 of 4 bot races finished: Akropolis 1st in 101.6 s with 7 lead changes, Westend 1st in 124.8 s, River Run 2nd in 203.9 s (r7 DNF 1 of 2), Grand Prix 1st in 90 s.
  - The car got stuck 0 times and hit 0 walls.
  - The race HUD now reads like 2K's: a big "1ST /2" place number, a CHECKPOINT n/5 box, the timer, and the gap to the named rival.
- **Free roam is clean in both cities.** Across 6 runs of 60 s at both viewports (wander, road and wall-ram):
  - 0 stuck episodes over 1 s;
  - **0 teleports or respawns** and 0 wrecks;
  - 0 JS errors and 0 step exceptions;
  - **0 blocked street points**: 2,780 drivable points in the Athens sweep, plus ~1,000 around both spawns.
  - Road-follow speed: Athens 123 km/h, Frankfurt 155 km/h.
  - Hard stops: Athens 0 (wander), 0 (road), 3 (ram); Frankfurt 3 (wander), 0 (road), 0 (ram).
- **Destructibles work:** 8–14 smashes per minute with no extra stops. Wall-ram with no steering still covers 1.26 km in Athens and 2.37 km in Frankfurt, because the walls slide the car along.
- **Race items:** every box was driven over (24 per race): 26–32 pickups, **0 exceptions**, and the race kept running.
- **Allocation is down:** Athens 117 MB/s (r7 188), Frankfurt 138 MB/s (r7 186). Frankfurt max frame 158 ms (r7 329–363).
- **Speed streaks are now on** in Frankfurt at 168 km/h and in races. That was a r7 "not ranked" item.

**What did not:**
- **Athens has no shortcuts in practice (new, high).** The shortcut finder publishes nothing until it has scanned every road node. After 300 s it was at node 670 of 22,700 (~2.2 nodes/s at 63 fps), so it would take about 2.8 h. Frankfurt shows 9.
- **The never-finishing Athens finder is now the top Athens allocator.** `roamHit`/`roamTerr`/`cityAt`/`DEST_open` under `DEST_find` allocate ~280 MB per 30 s, every frame, forever.
- **The cyan ellipse at the Athens spawn is still there** (r7 #7), and the **Athens quest pill still truncates** its distance (r7 #6): "CH 1 · Koulouri Ru… Taverna Giorgos · Festival Delivery → 28…".
- **Athens median frame JS is 20.4 ms** in this single run (r7 15.0, 3 runs). That may be variance; perf-16 owns it.

## Alex's complaints vs what I measured
| complaint | verdict | evidence |
|---|---|---|
| Athens unplayable: bugs, buildings blocking roads | **not reproduced on drivable streets** | Sweep: 12 random Athens streets, 2,780 centre points, 0 inside a collider. 60 s wander / road / ram from spawn: 0 stuck, 0 teleports, 0 errors. The only Athens "walled-in" report in the 🐞 db (beta.60, pos 1724,131) was a grass lot off-road. Blockage may still happen off the street centre (kerb props, LIFE pieces) or in tiles that had not streamed in yet; the scan reads colliders only. |
| Crashes on items | **fixed for race items and props** | Race items: 0 exceptions over 24 boxes × 4 runs. Props: dest-4 slide/smash is live; hard stops are 0–3/min. |
| More destructibles and shortcuts | **destructibles yes; shortcuts Frankfurt only** | 8–14 smashes/min. Shortcuts: Frankfurt 9; **Athens 0, never** (Bug 1). |
| No early respawn | **not reproduced** | 0 teleports in 6 × 60 s, including 60 s of steering-free wall-ram per city. The city's only hop is the 4 s pinned nudge (`71_roam_drive.js` `RO.stkT>4`), and it never fired. The 2 s / 2.5 s no-progress respawn of `98fs_flagship` / builder tracks (HANDOFF_trk5) was not exercised. That is the likely source; ask for a 🐞 report with a position. |
| Heavy lag on PC | **lanes perf-16 / phone-1 own it** | Athens 20.4 / 41.5 / 86 (p99) / 264 ms, 43 frames > 50 ms per 30 s, 973 calls, 2.8 M tris. Frankfurt 18.6 / 36.2 / 60 / 158, 35 frames > 50 ms. **For perf-16:** Athens' top allocator is `DEST_find` (Bug 1). Frankfurt's are `gndGen` 307 MB, the new `LF_gyB` from perf-14 at 251 MB (+124 MB `tauH`), and `ART7_far` at 158 MB. |
| iPhone 17 freeze, rotate reloads graphics | **phone-1 owns it** | Not re-diagnosed. Trunk `bcd0382` already carries the debounced resize and DPR cap. |

## Side by side vs 2K Drive (`05_pack_5th_boost.jpg` vs `akropolis_bot_0` / `westend_bot_0` / `river_bot_1`)
- **Race HUD: close to 2K now.** A big place number top-centre (2K puts it top-left), a checkpoint box, the timer and the rival gap. The minimap sits top-left (2K: bottom-left), and there is no position list of the whole pack.
- **Speed: close.** At 142–180 km/h there are blue speed streaks and an FOV punch. At the Akropolis, though, **the RGB-split fringing at the screen edges is too strong**: red and blue ghosts on every building on the left. 2K has none.
- **The pack is thin:** races are 1 vs 1 ("/2"), while 2K runs 6 cars with constant contact.
- **World:** the deep blue sky, brick clouds and crowds on the kerb read like 2K.
- **Defects:**
  - a big translucent cyan arc and blob over the right half and the bottom-left of `westend_bot_0`;
  - the cyan ellipse under the car at the Athens spawn;
  - a near tree canopy filling the top-left quarter of `ath_1280x720_race`.

## Scores vs 2K Drive
| # | aspect | r8 | r7 | evidence | single highest-impact fix |
|---|---|---|---|---|---|
| 1 | First 60 s / onboarding | **5** | 5 | Boot 38–56 s alone (70 s with 2 browsers). Clear PLAY menu with credits. Athens spawn still has the cyan ellipse and the truncated pill (`ath_roam`). | Pill plus ellipse (#3, #4) |
| 2 | Free-roam driving feel | **6** | 6 | 0 stuck, 0 teleports, walls slide; 123 / 155 km/h; streaks on. Lag holds it at 6. | Perf lanes |
| 4 | Story / side quest | **4** | 4 | Pop-ups, collectibles ("Greek amphora set 2/5") and challenges fire during roam. Not deeper than r7. | – |
| 5 | Races | **7** | 6 | 4/4 finishes, River fixed, 2K-style HUD, items safe. Only 1 rival. | More rivals (not top 6) |
| 6 | Builder | **5** | 4 | `builder.jpg`: clean track builder with big readable tiles and a grid on the Main. One tile label ("LONG RAMP UP") is cut off at the scroll edge. | – |
| 7 | Garage | **4** | 4 | 153 tiles, 0 tiny text (`garage_ui`). Not re-judged visually. | – |
| 8 | Vehicle transform | **6** | 6 | car/offroad/boat switches in races (`veh`). | – |
| 9 | Traffic / pedestrians | **6** | 6 | Athens 18 → 30 near (78 cars), Frankfurt 16 → 21 (75). | – |
| 10 | HUD / menus | **5** | 5 | 852×393: 0 text under 12 px in the menu, roam and race. 1280×720: "KM/H" at 11 px and the speed box drawn over the car. The race gap box ellipsises "THANOS DR…", and the Athens quest pill truncates. | #3, #5 |
| 11 | Performance / memory | **4** | 4 | Allocation −35 %, Frankfurt max −55 %; Athens median up (single run); still 35–43 frames > 50 ms per 30 s. | perf-16 |
| 13 | World art | **6** | 6 | Strong sky and streets. Cyan artefacts, RGB fringing and the near canopy hold it back. | #4, #6 |
| 14 | Portrait | **5** | 5 | Not re-measured (carried). | – |

Mean: (5+6+4+7+5+4+6+6+5+4+6+5)/12 = 63/12 = **5.25 → 5.3**.

## Bug list (built page `out/r8`, trunk `bcd0382`)
| # | sev | bug | repro |
|---|---|---|---|
| 1 | **High** | **Athens never shows shortcuts**, and the scan allocates ~9 MB/s for as long as the game runs | `?test=ath`, poll `__tk.q('({scI:DEST.scI,N:HUB.nodes.length,sc:DEST.sc})')` every 15 s. At 300 s: `scI 670 / N 22700, found 5, sc null`. `DEST_find` (`src/98dest_destruct.js:44`) publishes `DEST.sc` only when `scI>=N.length`. perf-12 cut the budget to 1.5 ms per frame. Frankfurt finishes (`sc 9`). The heap sampler (`CITY=ath … tFrame.js`) shows ≈ 280 MB per 30 s under `DEST_find`. |
| 2 | Med | **Cyan ellipse over the bottom third at the Athens spawn** (carried from r7) | `tools/tRv2k2.js <url> out ath` → `ath_roam.jpg` at 0 km/h; gone once driving. A probe found no regular scene mesh with a radius over 2.5 m within 12 m of the car, so the source is an InstancedMesh, Points/Sprite or a DOM/canvas overlay. |
| 3 | Med | **Translucent cyan arc and blob over the race frame** | `tRv2k2 … fra` → `westend_bot_0.jpg` (Westend Split, checkpoint 4/5, 142 km/h). It may be the same source as #2. |
| 4 | Med | **The Athens quest pill truncates the distance** (carried from r7; pillclip / pill2 fixed only the Frankfurt "Hot Drop" case) | `?test=ath`, 852×393, at spawn: "CH 1 · Koulouri Ru… │ Taverna Giorgos · Festival Delivery → 28…" |
| 5 | Med | **Chromatic aberration (RGB split) too strong at speed** | `akropolis_bot_0.jpg`, 180 km/h: red and blue ghosts on the left buildings and the HUD-side car |
| 6 | Low | **PC HUD:** the speed box is drawn over the car, "KM/H" is 11 px, and the rival name is ellipsised ("THANOS DR…") | `node tools/rv8/hud.js <url> ath 1280x720 out` → `tiny:["KM/H@11px"]`, `clipped:["THANOS DRAKOS"]`, `ath_1280x720_race.jpg` |
| 7 | Low | **A near tree canopy covers the top-left quarter** during the Athens race at PC size | `ath_1280x720_race.jpg`, Akropolis Cup Final at t ≈ 20 s, checkpoint 2/5 |
| 8 | Low | **A hands-off race reports `fin:true, dnf:true, place:2`** at once (carried from r6) | `tRv2k2` `akropolis_handsoff` / `westend_handsoff`. `TK.last` holds a place for a DNF, so the results screen may show "2nd" for a DNF. |
| 9 | Low | The builder tile label "LONG RAMP UP" is cut off at the bottom of the tile list (852×393) | `tRv2k2 … fra` → `builder.jpg` |
| – | info | Respawn and blockage complaints **not reproduced** (see the table above) | – |

## TOP 6 fixes (ranked by score gain per effort; each is ONE ~30 min fixer task)
| rank | fix | files | GO assert that proves it (`src/99c_checklist.js`) | gain |
|---|---|---|---|---|
| 1 | **Athens shortcuts appear within 60 s, and the scan stops allocating.** Publish each passing candidate as soon as it is found (incremental `DEST_mark`, keep the 250 m spacing and the 9 cap), and scan nodes nearest the player first: sort `HUB.nodes` indices by distance once, or limit to a 600 m ring that refills when the player moves 300 m. Stop scanning at 9 found. | `src/98dest_destruct.js` (`DEST_find`, `DEST_mark`) | `dest/sc-time`: `?test=ath`, 60 s of stepped `roamStep` → `DEST.sc.length>=3` and every `sc` passes `DEST_open`. Also, `DEST.scI` stops advancing once 9 are found. Keep `dest/shortcut` green in both cities. | Alex's ask plus Athens alloc: aspects 2, 11 (+0.5) |
| 2 | **Athens quest pill never cuts the "→ N m".** Drop the chapter prefix when the pill is wider than the free space, and put the distance in its own non-shrinking span (`flex:0 0 auto`). | `src/93_cars_lego.js` (CR_hud pill), `src/41_career_quests.js` (label text) | `hud/pill-dist`: `?test=ath` at 852×393 and 393×852 → `#roamTop` (or `#m1Next`) has `scrollWidth<=clientWidth+1` on every child, and its text matches `/→ \d+ m$/` | 1, 10 |
| 3 | **Find and kill the cyan near-camera ellipse/arc.** Bisect with `scene.traverseVisible` toggles at the Athens spawn, including InstancedMesh, Points and Sprite, plus DOM `#hud` overlays. The likely culprits are a drift/boost ring, a spawn pad decal or a water plane. Hide it near the camera, or fix its depthWrite or scale. | found by bisect: start in `src/71_roam_drive.js` (spawn/boost ring), `src/85_audio_feel_sp_otg.js` (feel FX), `src/98fs_flagship.js` (loop) | `art/no-near-cyan`: at the Athens spawn and at Westend CP 4, read back the frame (`renderer.readRenderTargetPixels` on the composer target): fewer than 3 % of the bottom-third pixels have b>220, g>200, r<200. Also: no visible transparent mesh whose bounding sphere is within 4 m of the camera except the player car. | 1, 13 |
| 4 | **Tone down the RGB split at speed.** Cap the aberration offset, for example at 0.0015 UV, and fade it in only above 85 % of top speed; on phones turn it off. | the post shader that holds the chromatic offset (grep `aberr\|rgbShift\|chroma` in `src/`), plus its speed driver | `fx/chroma-cap`: set `RO.v` to max, step 30 frames → aberration uniform ≤ cap; on phone (`isMobile`) = 0 | 13 |
| 5 | **PC HUD tidy-up.** At ≥ 1000 px wide, move the speed box below the car (bottom-centre, clear of the car's projected bbox) and make "KM/H" 12 px. Let the race gap box fit a 13-char name: shrink the font to 12 px before ellipsising, or show the first name only. | `src/71_roam_drive.js` (`roamHud`), HUD CSS in `base.html`/`src/10_core*.js` (grep `KM/H`), `src/70_roam_world.js` (`raceHud` gap box) | `hud/pc-12px`: at 1280×720 in roam and race, no visible text node under 12 px; no ellipsised text in the race boxes; the speed box rect does not intersect the player car's screen-projected bbox | 10 |
| 6 | **Fade near foliage.** A tree canopy within ~10 m of the camera and above the car goes to 30 % opacity, or is culled, as walls are faded (r7 near-wall clip). | the tree instancing / near-fade code (grep `near.*fade\|camFade` in `src/`), `src/71_roam_drive.js` `roamCam` | `cam/near-canopy`: Akropolis race at t = 20 s (bot) → no opaque tree mesh whose bounding sphere intersects the camera frustum within 8 m of the camera | 13, 5 |

Not ranked:
- Bug 8: hands-off `fin`+`dnf`+place.
- Bug 9: builder label.
- More than 1 rival per city race: the biggest gap left in race feel vs 2K, but it is design-sized, not 30 min.
- An early-respawn repro is needed from Alex (🐞 button, with position) before any respawn change.

## Raw (r8)
| what | Athens | Frankfurt |
|---|---|---|
| Boot (`tq.ready`, 1 browser) | 43–56 s | 38 s |
| 60 s wander, 852×393 | 727 m, 44 km/h avg, 0 stuck, 0 teleports, 0 hard stops, 13 smashes | 913 m, 54 km/h, 0 stuck, 0 teleports, 3 hard stops, 11 smashes |
| 60 s road-follow, 1280×720 | 2,046 m, 123 km/h, min HP 86 | 2,589 m, 155 km/h, min HP 96 |
| 60 s ram (no steering) | 1,261 m, 75 km/h, 1 s stuck, 3 hard stops, min HP 75 | 2,371 m, 142 km/h, 0 stops |
| Blocked street points | 0 / 159 at spawn, 0 / 2,780 in the 12-street sweep | 0 / 134 at spawn |
| Shortcuts (`DEST.sc`) | null after 300 s (670 / 22,700 nodes) | 9 |
| Races (bot) | Akropolis 1st, 101.6 s, 7 lead changes | Westend 1st 124.8 s · River 2nd 203.9 s · GP 1st 90 s |
| Race items | 24 boxes, 28 fired, 0 errors | 24 boxes, 26–32 fired, 0 errors |
| Text under 12 px | 852: none · 1280: KM/H 11 px | same |
| tFrame q=high 30 s (median / p95 / p99 / max ms, frames > 50 ms) | 20.4 / 41.5 / 86.2 / 264, 43 | 18.6 / 36.2 / 60 / 158, 35 |
| Calls / tris, allocation | 973 / 2.83 M, 3.5 GB per 30 s ≈ 117 MB/s | 771 / 3.71 M, 4.1 GB ≈ 138 MB/s |
| JS errors (all runs) | 0 | 0 |
