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

RESULTS_TABLE

## Issues, ranked by how much they hurt play
ISSUES

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
