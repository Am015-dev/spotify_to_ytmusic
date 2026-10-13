# city-3 handoff (2026-10-13). Branch alex/od-city. Module: src/98ct_city_lego.js (CTB). Status: code done, NOT measured/reviewed/READY.
Brief (coordinator): Alex wants the city buildings to be real LEGO builds at minifig scale, denser and better-looking than live, and fast on the phone.
Read docs/HANDOFF_city2.md first (CTB design, tools). Integrator is now build-9 (session_01GMDcFfTGnwQmyHKU8PFQfp), not build-7.
Shots go to the reviewer/coordinator as ONE grid: `python3 tools/grid.py docs/shots/city3/GRID.jpg "<title>" "label=path" ...` (before/after pairs side by side).

## Done (pushed)
- Merged alex/od-models (v90g in progress, live v90f) into od-city. Conflict handling: src/MODELS = union; OD_CHANGELOG/checklist hunks = od-models side;
  tools/ld/calib.json = union of both dicts; out/v90b = theirs. `tools/build.sh v90h --local` → BUILD_OK.
- Minifig door check (tools/ld/ldDoor.js, shots docs/shots/city3/door_*.png): m10182 2.35 m, m10243 2.9, m10185 2.62, m10218 2.62, m10251 2.9,
  w6360/w6349 2.35, w6376 open arches 2.35 m (no door part). All ≥ 2.2 m vs the 1.9 m figure. w6365/w6402 have no door (cottage/stall).
- Frankfurt height: CTB_ST + CTB_stack: each modular repeats its first upper floor (brick band [y0,y1) in plates, floor plate to floor plate) n×:
  m10182 [30,58,2], m10185 [33,60,2], m10218 [34,58,3], m10243 [32,56,3], m10251 [37,61,3] → ~24–27 m (was 13–18). Frankfurt uses only the tall
  versions (one geometry per model); Athens keeps the low originals. NOT yet looked at closely: check the stacked floors read right (tPlay drive shot
  shows a tall beige block that may look odd; take close-ups with ctbShot NB=…).
- 3718 + 6376 converted (ld2garage → ld/out → src/98ld_w_3718.js, 98ld_w_6376.js, in src/MODELS, no placement line):
  - 6376 Breezeway Café (Robert Paciorek): no 1×4 door, but its open arches are 2.35 m, so a minifig walks through and the 6350 doorway method isn't needed.
    Pools: Athens front (gap 90) + old town front (w 2).
  - 3718 (Philo) is a Fabuland outdoor café: table + chair + red parasol (Bonnie Bunny figure dropped: `--drop "3718 - bonnie.ldr"`; plain `--drop bonnie`
    matches the main file name and drops everything). Used as `fill`: a café terrace in the gap at the end of ~half the Athens rows (CTB_row fill arg).
- Athens draws: w6402 removed from all Athens pools (3718 terrace replaces the stall); tiny sets (<3k tris) get near mesh only, culled > CTB.tinyD 90 m (1 draw).
- OD_CHANGELOG v90h entry (NEW Frankfurt modulars 5–6 floors; CHANGED Athens whitewashed houses + Breezeway Café + terraces; doors minifig size) and
  checklist ctb-fra / ctb-ath / ctb-drive (99c_checklist.js). Rename v90h if build-9 numbers differently.
- Fresh container setup done here (redo in a new one): pip scipy pyfqmr; LDraw lib unzip → ld/lib; `node tools/ld/ld_dump.js <url> ld/ours.json`; :8766 server.

## Measured
- tPlay phone Frankfurt 1 min, FAST=1, v90h (new buildings): wall hits 0.87/min PASS (≤1), no collider on road PASS, cam inside building 0 % PASS,
  0 console errors, pedestrians/humanoids PASS. FAIL stuck 16.4 % (threshold 3 %) and FAIL rotation check (DRIFT "hidden"). Not yet compared with
  ctb=0. Run the same with `&ctb=0` to see whether the stuck % comes from the buildings or the route; json + shots in docs/shots/city3/tplay/.
- NOT measured: draws/GPU/heap A/B (both cities), Athens heap, Athens draws at the old-town cam, tPlay Athens.

## Blocker found: tools/ct/ctbShot.js hangs in this container
Roam never loads (25 min, also on the pre-merge 39f18ee build, so not caused by this work): on the game page `setTimeout` callbacks never fire while
requestAnimationFrame does (a blank page is fine; not /dev/shm, not GL flags, not ?fast=1). tPlay works because it drives rAF from the test
(INIT in tools/tPlay.js). Fix idea: give ctbShot tPlay's INIT clock (window.__tick) or check whether a game module starves timers. Root cause unknown.

## Next (fresh worker)
1. Make ctbShot work (above), then per city new vs `?ctb=0`: draws, tris, glMB, heap (3× gc, several runs) at start + Athens old-town cam
   (2092,40.2,-1676 → 2147.9,40.2,-1637.4). Budget: draws ≤ live, GPU ≤ live + 5 MB, heap flat.
2. LOOK at close-ups of the tall Frankfurt modulars and the Athens 6376 / 3718; fix stacking bands if a floor looks wrong.
3. tPlay both cities new vs ctb=0 (stuck %, wall hits).
4. GRID (before/after, Frankfurt + Athens, city-3 build) → REVIEW alex/od-city <sha> docs/shots/city3/GRID.jpg to the reviewer
   (session_01Y6FYerWwxv43FuKUcaUT4v) with the tyre gap; on PASS hand to build-9 and send the coordinator READY.

GRID now: docs/shots/city3/GRID.jpg (live vs city-2 shots for both cities + 2 city-3 Frankfurt tPlay shots; NO city-3 Athens shot yet: the
probe tool hang above blocked it).
