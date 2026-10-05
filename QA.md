# QA — human-play pass on the v83 candidate (alex/od-release-82 @ c46eaac)

Build under test: the latest candidate in RELEASE.md, **v83** = v82 candidate order + pSC1 + pSM1–6, split with `tools/split_km.py`.
`out83/` exists on the branch but holds only `km.js` (its `overdrive.html` was never committed), so the page was rebuilt with `reapply.sh` and split here.
The rebuilt page is byte-identical in size to RELEASE.md (1,793,546 B) and its `km.js` matches `out83/km.js`. The rebuilt v82 split also matches the deployed `out/overdrive.html`.

## How it was played (tools/tPlay.js)
- **Phone:** iPhone 16 landscape, 852×393 CSS px, DPR 3, `hasTouch`, CPU throttled 4×.
  All driving uses real CDP multi-touch on the on-screen controls: GAS held, ◀ ▶ steering, BRAKE, DRIFT, BOOST, ❚❚, MENU, map drag and pinch.
- **Desktop:** 1440×900 with the real keyboard (arrows, X drift, Shift boost) and mouse clicks.
- **Entry:** STORY → Slot 1 → NEW GAME (Frankfurt), or STORY → CONTINUE on an Athens save, which reloads into Athens.
  Intro cards are tapped away. There are no warps, no `enterRoam()` and no clicks on hidden UI.
- **Driver:** follows the on-screen arrow and NEXT pill like a person, with a GPS route when the target is out of sight.
  It drives straight at a target in line of sight. Human imperfections: 0.25 s reaction lag, ±15° slow heading wobble, a held brake before sharp corners, occasional boost and drift.
  When stuck it reverses with opposite lock.
- **Time:** the box renders with software GL at seconds per frame. tPlay therefore drives `requestAnimationFrame` itself, at exactly 60 frames per game second.
  The real game loop runs unchanged: frame → roamStep, loading screens, HUD, camera, juice. Drawing is skipped except for screenshots.
- **Not measured:** real FPS. Software GL says nothing about an iPhone, so draw calls, triangles and JS ms per frame are reported instead.

**Harness bugs found and fixed while building tPlay** (they made the first phone runs useless, so they are listed for whoever extends it):
- CDP does not lift a finger that is merely missing from a `touchMove`. The brake stayed pressed, and the car reversed at −65 km/h with GAS held.
- A brake tap within 320 ms real time of the previous one is the PARK gesture.

## Before / after (tPlay, split build, 5 game-minutes per city, same driver and same seed)
"v83" = the release candidate. "+QA" = v83 + pQA1 + pQA2 (+ the camera guard in qa.js).
pQA3 and the last CSS/text-hint tweaks landed after these runs; they are covered by the final smoke and a short tPlay check (see the end).

| run | build | drive min | wall/building hits | hits that cut speed > 50 % | all speed losses (by cause) | stuck | avg km/h | loading screens | camera in building | smashes /min | cars within 120 m | HUD on touch control | draws / tris / JS ms per frame* |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| phone fra | v83 | 4.07 | 4 (0.98/min) | 13 | 30 (wall 4, mission/other 26) | 0 % | 99.5 | 0 | 0 % | 7.9 | 1.2 | 0 | 418 / 1.47 M / 15.8 |
| phone fra | +QA | 4.07 | 3 (0.74/min) | 14 | 29 (wall 3, other 25, landing 1) | 0 % | 91.7 | 0 | 0 % | 5.7 | 2.1 | 0 | 553 / 1.94 M / 19.1 |
| phone ath | v83 | 5.07 | **62 (12.2/min)** | 31 | 73 (wall 62, other 8, traffic 2, ped 1) | 0.9 % | 39 | 0 | 0.4 % | 8.9 | 4.0 | **6** | 286 / 1.23 M / 32 |
| phone ath | +QA | 4.08 | **38 (9.3/min)** | 31 | 66 (wall 38, other 20, ped 5, traffic 2) | 0 % | 68.8 | 0 | 0 % | 21.3 | 5.8 | 0 | 377 / 1.40 M / 26.8 |
| desk fra | v83 | 5.05 | 1 (0.2/min) | 5 | 19 | 0.8 % | 107.6 | 0 | 0 % | 5.9 | 1.2 | – | 536 / 1.87 M / 10.2 |
| desk fra | +QA | 5.01 | 4 (0.8/min) | 5 | 21 | 0 % | 109.8 | 0 | 0 % | 7.0 | 1.2 | – | 627 / 1.99 M / 22.3 |
| desk ath | v83 | 5.02 | **40 (8.0/min)** | 27 | 71 | 0 % | 93.8 | 0 | 0.4 % | 19.9 | 4.4 | – | 347 / 1.35 M / 37.3 |
| desk ath | +QA | 5.01 | **31 (6.2/min)** | 19 | 65 | 0 % | 93.4 | 0 | 0 % | 22.5 | 4.1 | – | 272 / 1.26 M / 27.5 |

\* One frame drawn with software GL at the end of the city; JS ms is the game's own PERF.js average under 4× CPU throttle. The route differs a little between builds, so draw counts are not a before/after comparison.
"other" speed losses are mostly scripted: stage "GO!" resets, mission cars, cut-ins. They are reported, not gated.

**tPlay gate:** v83 **FAIL 3** (Athens wall hits phone + desk; phone HUD over touch controls) → +QA **FAIL 2** (Athens wall hits phone + desk).
- Console/page errors: 0 in all 8 runs.
- Athens loading screens and page reloads: 0 while driving (v83 already has od-seamless).
- Pedestrians: 1.9 m against 4.6–4.9 m cars (0.96–0.98× adult scale). Player ship 5.0 × 2.3 m. pSC1 fixed scale; the v82 sizes are in od-scale's REPORT (pedestrians 2.6 m, ship 7.35 × 7.33 m).
- Map drag + pinch: work on touch. Pause/resume: works. Garage: opens and SAVE & DRIVE returns to play. It is hidden during events.
- Missions: the first story mission in each city failed in **every** human-like attempt.
  - Frankfurt, Hot Drop: 6 finished attempts in the final runs, all "A GETAWAY CAR ESCAPED" at stage 2.
  - Athens, Koulouri Rush: 7 finished attempts, all "THE VAN ESCAPED".


## Issues, ranked by how much they hurt play
Columns: what the player feels · evidence · status. "Owner" = another branch already owns it (numbers sent to the coordinator).

1. **Athens: you keep hitting buildings.** 6–12 wall/building hits per minute in Athens vs < 1/min in Frankfurt with the same driver. 19–31 of them cut speed by more than half (151→22 km/h is typical).
   Streets in Plaka/Psyrri are narrow, building faces sit right at the kerb, and a hit is a dead stop. pQA1's round corners cut this by about 25 % (12.2→9.3 phone, 8.0→6.2 desk); the rest is setback and wall response.
   Evidence: `qa/v83_phone_ath_wallhit*.jpg`, `qa/after_phone_ath_wallhit.jpg`. **Owner: od-scale (pSC2: 3 m setback + forgiving glancing hits).**
2. **Chase camera inside buildings (Athens), up to half the time.** The bug-sweep camera guard only ran in Frankfurt, and the juice camera adds its drop/pull-in *after* it.
   tPlay measured the camera inside a building collider in 40.9 % and 53.9 % of Athens frames in two early phone runs (car reversing out of corners; `qa/v83_phone_ath_camera_low_in_garden.jpg`) and 0.4 % in the final runs. **Fixed (qa.js guard, outermost, all cities): 0 % in every +QA run.**
3. **The first mission in each city cannot be finished by a normal driver.**
   - Frankfurt Hot Drop: the human-like driver fails stage 2 "ram Kaiser's goons" in every attempt.
   - Athens Koulouri Rush: the van escapes in every attempt.
   - A perfect-pursuit bot with no reaction lag clears Hot Drop stages 1–2, then loses Kaiser in stage 3 (allowed distance 180 m) after one wall hit.
   Not fixed (tuning/design): give the getaway cars a speed cap tied to the player's, or a catch-up "they slow when > 120 m ahead".
4. **Phone HUD pile-up (iPhone 16 landscape).** Measured rectangles at 852×393:
   - The NPC dialog `#npcSay` (84–387 × 8–126) covered the minimap, the STAGE/timer bar, the district plate and the NEXT arrow, and its text was cut off under the minimap.
   - The tutorial card and the pop-up challenge sat on the minimap.
   - The "TAP TO OPEN" prompt sat on **HOP and BOOST**: tPlay's touch-overlap failure in v83 Athens.
   - The area banner and the STUD RUSH panel covered the NEXT pill.
   - The pause menu ran off the top and bottom of the screen.
   **Fixed (pQA2):** HUD-over-touch-control is 0 in every +QA run. Evidence: `qa/v83_phone_*`, `qa/after_phone_*`.
5. **Event tracker drawn on top of the open map** (the Hot Drop bar covered the map). **Fixed (pQA2, map z-index).**
6. **Invisible building corners.** Colliders were "box grown into a bigger square": every building corner reached ~0.5 m (0.41 × the 1.15 m car circle) past the visible wall, diagonally. That is exactly the slight-turn-at-a-corner crash. **Fixed (pQA1, true box+circle distance).**
   No collider covers paved road: tPlay checked 1,450–1,920 road points ≥ 1.5 m inside the kerb per city at start and end, and found 0 blocked.
7. **Double-tap BRAKE parks the car at any speed** (60 m/s² stop). Two quick brake taps before a corner, a normal thumb move, stopped the car dead mid-street.
   Found because tPlay's first driver did exactly that. **Fixed (pQA3: park only below 15 km/h).**
8. **Keyboard hints on the phone:** "Hold DRIFT **(X)**", "BOOST **(SHIFT)**", "HOP **(SPACE)**", "RETRY **(Y)**". **Fixed (qa.js strips them from touch HUD text).**
9. **Too many breakables / too much traffic (Athens).** 9–22 smashes per minute in Athens vs 6–8 in Frankfurt. 4–6 traffic cars within 120 m in Athens vs 1–2 in Frankfurt.
   Not changed here (tuning). Suggest halving Athens street props on main roads and capping Athens traffic at about 3 cars within 120 m.
10. **Tiny text on the phone:** 8–9 px labels: KM/H, the chapter subtitle, NEXT, event split timers, TAP TO OPEN. Not changed (readable but small on a 6.1" screen).
11. **"Smuggler Chase" does not exist in the build.** Athens chapter 1 is Koulouri Rush, Moped Swarm, Acropolis Climb and the Pappas duel; "Smuggler(s)" only appears in Frankfurt chapter 2 (m2.js). Nothing to test.
12. **Loading screens in Athens:** 0 in all v83 drives, which crossed districts A/B. v83 carries od-seamless (pSM1–6). The live v82 (no pSM) was not re-measured here. **Owner: od-seamless.**
13. **Speed-effect wash-out:** at 150+ km/h the juice chromatic/speed-line effect washes out the whole view on the phone (`qa/v83_phone_ath_hud_pileup.jpg`). Not changed (juice tuning).
14. **❚❚ on the phone opens Settings, not the pause menu.** The pause menu (restart/abandon event, map, garage) is only reachable via MENU. Not changed (minor).
15. **Performance proxy:** 270–630 draw calls and 1.2–2.0 M triangles per frame; game JS 10–37 ms per frame under 4× CPU throttle, worst in Athens.
    Not a real FPS number. A device check on the iPhone is still needed.


## Patches (apply after the v83 order)
```
./reapply.sh pAU1.py pAU2.py pOG1.py pOB1.py pOB2.py pOB3.py pOC1.py pCV1.py pCV2.py pRL1.py pJU1.py pRL2.py pGB1.py pDR1.py pDR2.py pSC1.py pSM1.py pSM2.py pSM3.py pSM4.py pSM5.py pSM6.py pQA1.py pQA2.py pQA3.py   → REAPPLY_OK
```
| patch | anchor(s) | what |
|---|---|---|
| pQA1.py | `function bHit(...)` (whole line) | Collider = box grown by the car radius with **round** corners. It used to be a bigger square: an invisible corner up to 0.41 × r (≈0.5 m) beyond the visual at every building corner. |
| pQA2.py | `</style>` (CSS appended) · `window.__mho={` (qa.js) | Phone HUD layout (NPC dialog, tutorial card, pop-up challenge, TAP TO OPEN prompt, pause menu fit). Map above the event tracker. Keyboard hints hidden on touch. **Chase-camera guard in every city**, as the outermost `roamCam` wrapper (after juice). |
| pQA3.py | the touch BRAKE handler `if(state==='roam'&&n-(TOUCH.bT||-1e9)<320){parkSet(true)…` | A quick double tap on BRAKE parks the car only below 15 km/h, instead of stopping it dead at full speed. |

pSC2 (od-scale) and od-seamless also wrap `roamCam` / touch the HUD. qa.js is inserted last, before `window.__mho={`, so its camera guard stays outermost whatever order the others take.

## tPlay — the new release gate
`node tools/tPlay.js http://127.0.0.1:<port>/local_dbg.html <outdir>`
- env `MODE=phone|desk|both`, `MIN` = minutes per city, `CITIES=fra,ath`, `THROTTLE=4`, `SHOTS=1`.
- Use `tools/mktestdir.sh <name> <port> split` for the split build.
- It writes `<outdir>/tPlay.json` plus screenshots (start, drive, wall hits, HUD overlaps, map, pause, garage, end).

It fails on any of these:
- more than 1 wall/building hit per minute
- stuck more than 3 % of the time
- any console or page error
- the page reloading during play
- any loading screen in Athens
- pedestrians more than 1.2 × adult scale relative to the cars
- any visible HUD element on a touch control (phone)
- any collider on the paved road
- the chase camera inside a building in more than 2 % of frames
- any HUD text under 12 px on the phone

## Final build check (v83 + pQA1–3, split with tools/split_km.py: page 1,797,344 B + km.js 1,961,521 B)
- `node smoke.js` on the split pages: **SMOKE PASS 12/12**, 0 console errors (`qa/smoke_sheet_final_split.png`).
- `tPlay` phone, 2.5 game-minutes per city: **FAIL 1**.
  - Frankfurt: 0.39 wall hits/min, 0 % stuck, no HUD on controls, camera never inside a building.
  - Athens: **7.6 wall hits/min** (31 big speed drops), the only failing gate. 0 % stuck, 0 loading screens, 0 reloads, no HUD on controls, camera 0 %.
  - 0 console errors (`qa/tPlay_final_phone.json`).
- The remaining failure is Athens wall contact. It belongs to od-scale (pSC2: setback and forgiving glancing hits) and should be re-run through tPlay once pSC2 lands.
