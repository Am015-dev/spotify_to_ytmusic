# art-4 handoff (liveliness / variety lane), 2026-10-14

Branch: trunk `alex/od-int2`. My commits: b6d2b03d, 7586c590, 0e05758c (shots), e4fdd53f, b91da86a. Shots are in `qa_art4/`.
int-4 (session_01QewuGcL86b169339CDxRy9) was **inactive** for every push, so none of the PUSHED lines were delivered. The coordinator has them in the DONE message.

## Done (all behind flags; TAG=art:,lf1,rv14/rv-ath-fest,rv14/rv-black-wall,bv1,foot2/foot-surf = 14/14 PASS, 0 console errors; unit 0 FAIL)
- **rv14 brown slab + black square** (Festival / Ebbelwoi start):
  - Cause: quest cargo was a `pl.mesh` child at old-car coords. In roam, `pl.mesh` is world-aligned and the model child carries the heading and scale, so the crates floated beside the car and cast a black shadow on the road.
  - Fix: `qvCargoAt(g)` (41_career_quests) parents the crates to the model and lays them out on its roof toward the rear. Stale cargo groups are dropped.
  - `chEnd` (71) now removes `ch.objs` from their actual parent.
  - GO `rv14/rv-ath-fest` is automatic: it spawns the Festival marker if the rotation has none, then checks that the crates sit on the roof.
- **rv14 black facades**:
  - Cause: Kenney com/sub dark-glass texels (56-80 grey, about 4% linear) times the warm instance tints, lit only by hemi/π on the shade side, rendered flat black.
  - Fix: `KM_glass` (51_city_net) lifts neutral dark texels to a LEGO trans-clear blue and gives com/sub a glass-only emissive map. Glass glows sky-blue; walls keep 1/4 of their old glow. The base is 0.36 (FL day ×0.55, night ×2.65). `?kmg=0` turns it off.
  - GO `rv14/rv-black-wall` has an automatic texel check.
- **Patches cutting the on-foot figure**:
  - Patches whose tilted plane is off the terrain by more than 8 cm (`LF_resid`) now go into one indexed draped mesh per tile, with every vertex at groundY+3.5 cm and polygonOffset. That is about 6.9k patches, 192k verts in Frankfurt.
  - Even patches stay instanced.
  - Ponds whose rim varies by more than 15 cm are dropped. Beds that vary by more than 20 cm are dropped; the rest sit at their lowest corner.
  - `LF_patchY` ignores draped patches, so walk height = terrain. `?lfd=0` turns it off.
- **Unit off-road**:
  - Moved in 02_data_json: fra taxi 3 and 4, ath taxi 0, 1 and 3, garage a_hil, and lm g_kol, g_amp and arch (the in-game arch already used `nudge`).
  - known.json went from 20 to 13 entries. The rest are model, hairpin and teleport items, not mine.
- **fra-4 ridge**:
  - The lite cover (3b) now also runs in a `LF.rb` = 400 m band outside the city box, where terr-1's horizon ridges are. LF regions are extended to cover it.
  - Points within 30 m of a road edge get a second lite point.
  - `?lfr=0` turns this off.
  - Flat green went from 21% to 10% (the line is 8%). The rest is the junction corner at (−1673,−1695), which the themed-cell (CG) rule owns. A 10 m grid there did not help.
- **Frankfurt street life**: `BV_life` now also accepts buildings that face a filler-grid road (`fillAt`). 21 of 30 buildings at the bv1/fra spot were skipped before. Within 150 m it went from 10 to 18.
- **Athens rooftop billboards**:
  - On 1 in 10 flat poly roofs ≥ 12 m: 2 legs, a frame and a 2-band poster in the district palette. That is 891 in Athens.
  - They are recorded in `BV.RB`, which seeds `BV.L`. `?bvr=0` turns them off.
  - At 1 in 5 roofs with 6 boxes each, perf FAILED (+13% frame). The current setting passed twice.

## Waiting for a yes (sent to the coordinator)
- **Item 4, reuse LDraw/OMR:** turn on CTB (98ct_city_lego, `?ctb=1`).
  - It is broken today. At city build `models.js` hasn't loaded yet, so 3219 of 3219 slots fall back. Once the models are loaded, `CTB_kind` works (bank 12.5 × 6.3 × 6.2 m, etc.).
  - Work: re-fill the slots after the load (swap the Kenney instances and colliders), do the memory pass, then add OMR modular buildings.
  - Tests are in the DONE message. The mock-up is `qa_art4/ctb_mock.jpg`.
  - The sets are minifig scale (6-7 m tall). They suit low-rise filler streets.
- **No build work before the yes.**

## Next (if there is no yes)
1. District themes (art-3 Next #2): Sachsenhausen apple-wine taverns, Bahnhof neon, Osthafen murals.
2. Athens CE_dec shops are not recorded in `BV.L` yet.
3. The pink panel on a black pole near the Athens Festival start is not a BV piece. Find its owner if a reviewer flags it.

## Gotchas
- This is a shallow clone, so local `alex/od-int2` had unrelated history. I used `git checkout -B alex/od-int2 origin/alex/od-int2`; the old HEAD is kept as `backup-pre-art4`.
- After pulling, run `tools/build.sh hot`. Stale out/hot assets give a 404 for `models/xf.js` and count as a console error.
- `node tools/hot.js stop` kills the server that `tGo.sh` uses (`hot.html`). Restart with `node tools/hot.js status` before running tGo.
- Async GO verdicts (lf1 spots, bv1) print "measuring…" in `hot go`.
  - For real green %: `TQ.draw=1` around `LF_green()` in eval.
  - Use `tools/tBV.js <hot url> out fra` for bv1 numbers.
- For a fixed camera in shots, set `scene.onBeforeRender` to pin the camera, then run `hot shot`, then restore it.
- New functions can't be hot-reloaded ("X is not defined"). Use `reboot <city>`.
- Boots sometimes fail with `Failed to resolve module specifier "three"`. This is transient; reboot again.
