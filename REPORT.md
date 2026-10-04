# CV — traffic lights & rules, city variety

Owner feedback: "no traffic lights or traffic rules; the city still looks flat, with no variety."

## What changed
**Signals and rules (both cities, every Athens district)** in `cv.js`:
- **Where signals go:** signalled junctions are street-graph junctions (`JUNC`) where two or more different main/arterial/ring streets meet. If a map has fewer than 8 of those, junctions of one major street with a `sec` street also count. Overlapping junctions merge into one box.
- **What they look like:** instanced poles with arm and housing (1 draw call), lamp spheres (1 draw call; red/amber/green plus a walk / don't-walk lamp, colour swaps only, no real lights), and painted stop lines (1 draw call).
- **How the phases run:** each approach gets its own green (8 s, or 12 s on wide avenues), then 2.5 s amber and 2 s all-red. Every cycle ends with a 9 s pedestrian walk phase. Each junction is offset by its position along its main approach / 13 m/s, which gives a green wave on avenues.
- **AI cars (cars within 320 m of the player, 10 Hz tick for car-following):**
  - Cars brake on a sqrt profile and stop at the line on red or amber when they can stop in time.
  - They queue behind the car ahead at a 7.5 m gap.
  - Junction-box rule: a car enters only if the box is empty or every car inside is on the same lane to the same exit, the car ahead is past the centre on its way out, or the exit is not blocked.
  - A car stuck more than 5 s inside a box and more than 50 m from the player is recycled, as the game already does for far cars.
  - At unsignalled junctions (Athens street junctions, Frankfurt filler-grid crossings) cars slow down and give way to crossing cars, with a 4 s cap.
  - Turn indicators: amber blinkers (1 instanced draw call) show on cars whose next node turns.
- **Pedestrians:** they wait at the kerb of a signalled junction, enter only in the first 3.5 s of the walk phase, and hurry across at 2.2× speed.
- **Player:** running a red pops "+10 studs DAREDEVIL" (+10 to the season's studs, 3 s cooldown). There is no penalty.

**City variety:**
- **Athens** (hooked into the `put` of the Athens building pass; the RNG stream is unchanged, so layout and positions are identical). A per-building seed sets:
  - Height: polykatoikia ±1–2 floors.
  - Colour: wider district palettes, and never the same colour plus height as the previous unit.
  - Polykatoikia balconies: coloured awnings, glass balustrades or planters, plus seeded shopfronts.
  - Neoclassical (Plaka, Kolonaki): pilasters and balconies.
  - Plaka / Anafiotika red-tile houses: coloured doors and shutters.
  - Kifisias: glass curtain-wall towers of 7–12 floors with spandrel bands and a rooftop plant.
  - Psychiko / Chalandri villas: lawn and hedges with a gate.
- **Frankfurt** (after the build, on the Kenney instances; only scale Y, tint and collider height change, base Y never does):
  - Bankenviertel: towers of mixed heights in glass colours, with stepped or pyramid crowns.
  - Altstadt / Römer / Sachsenhausen: half-timber beam overlay and pastel colours.
  - Westend / Nordend: sandstone Gründerzeit palette.
  - Ostend: taller modern offices.
  - Osthafen: low brick warehouses.
- **Street types:**
  - Tree-lined boulevard medians on wide arterial/ring roads, with smashable trees and planters (props). Medians are kept clear of junctions, bridges, hills and district gates.
  - Tiled pedestrian streets on `ped` streets (canvas tile texture, 1 draw call).
  - Fountains on plazas that lack one (merged, with collider).
  - Small parks: tree clumps and benches.

Not touched: ground height, terrain, building Y placement, `base.html`, `ALL_OPEN`, credits, UI and saves.

## Patch order
`pCV1.py` (cv.js before `window.__mho={`) → `pCV2.py` (Athens `put` hook). Build: `./reapply.sh pCV1.py pCV2.py` → `REAPPLY_OK`.
Anchors are listed in ANCHORS.md. Size: +27.6 KB (cv.js); the page is 3.385 MB built on base.

## Tests (`node tCV.js rules|perf|all`; perf needs `cvbase_dbg.html` = base.html with the dbg hook, see the end of this file)
Full run `tCV all` → **tCV ALL PASS**, then a final `tCV rules` run on the committed code → **tCV ALL PASS** (rules numbers below are from that final run):
- **Signals per map:** Frankfurt 24 junctions / 78 heads; Athens A 16/38, B 32/73, C 13/32, D 5/12. Unsignalled yield boxes: Frankfurt 441, Athens 700–1100 per district.
- **Stop on red (Frankfurt and Athens A):** in all 6 trials (3 junctions per city) the AI car stops with its front 0.31–0.32 m behind the line, the second car queues at a 7.5 m gap, and both enter the junction 2–6.2 s after green.
- **3 sim-minutes at the 3 busiest signals (Frankfurt and Athens A):** 0 AI collisions inside junctions. A collision is two cars crossing (|dot| < 0.7) closer than 2.6 m with at least one moving; cars teleported by the game's recycler in the last 3 s are ignored. Junction passes were 39 (Frankfurt) and 69 (Athens A); the deadlock fallback recycled 28 and 12 cars.
- **Pedestrians entering a signalled junction:** Frankfurt 22, Athens A 34, all on walk; 0 outside walk.
- **Real keys (ArrowUp / steer) through a red:** DAREDEVIL pop, +10 studs (Frankfurt and Athens A).
- **Neighbouring buildings differ:** Frankfurt 99.8 % (2562 pairs); Athens A–D 100 % (4452 / 7376 / 12786 / 9618 pairs).
- **Draw calls (renderer.info, same 6 spots, base vs patched):** Frankfurt 4046 → 4055 (+0.2 %), Athens 2232 → 2279 (+2.1 %); worst single spot +9.8 % (Chalandri). Triangles are about +13 % (medians, crowns, extra facade parts).
- `node smoke.js .` → SMOKE PASS (529 s, no console errors); `smoke/sheet.png` checked.
- Draw-call numbers are from the full run; the last change after it only narrowed the AI box rule to signal boxes (no rendering change).
- Before/after screenshots at 8 spots (`cvshots/before_*.jpg`, `cvshots/after_*.jpg`): Frankfurt Bankenviertel, Altstadt, Westend, Ostend; Athens Plaka, Kolonaki, Ambelokipi (Kifisias), Palaio Psychiko.

## Known gaps
- Turns at junctions follow the original street graph: random next node, with all-to-all links at Athens junctions. The box rule serialises conflicting paths, which costs throughput; Frankfurt queues can last one or two cycles (about 53 s at 3-approach junctions).
- Cars that deadlock inside a box away from the player are recycled. The final rules run reports 28 (Frankfurt) and 12 (Athens A) over the whole test session.
- Frankfurt has no `ped`-class streets, so its tiled pedestrian streets count is 0. Its plazas and parks get fountains and trees.
- Some median planter props render as a green pyramid in the road centre. They are smashable props, not colliders.
- Unsignalled yield behaviour is not tested separately; only the signalled rules are.

`cvbase_dbg.html` for perf: the base page passed through the same transform as `save()` (three.js paths and the `__dbg` hook). It is generated locally and not committed.
