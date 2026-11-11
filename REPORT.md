# OG — Bricklandia-density open world (tag OG)

## What changed
`og.js` is a self-contained module, inserted by `pOG1.py` with one anchor (see ANCHORS.md). It hooks in by re-binding `roamStep`, `roamLanded` and `drawRoamMap`.
- **On-the-go events (8 types):** Gate Crasher, Boost Rings, Drift Zone, Stunt Jump (land on a target), Stud Rush, Smash Count, Ghost Race and Long Jump.
  - An event starts the moment you drive through its coloured ring. There is no card or menu.
  - The route runs in your direction of travel along the street graph.
  - Each event has a 20–60 s time limit (jumps: a 25 s window) and bronze/silver/gold tiers shown live in the HUD.
  - Retry is instant with **Y** or the ↻ button, both during the event and on the result banner.
  - The finish has a medal pop, sparks and a stud burst. The payout is 250/500/900 studs per new tier, and 15 % on replays.
- **Collectibles:**
  - Golden bricks sit in the air behind the city's jump ramps, on hill tops, and on rooftops. A rooftop brick has a yellow roof ramp, and the roof becomes a drivable deck.
  - Unique Collectibles come in up to 5 per area, preferring dead ends. Frankfurt areas rotate between Bembel jugs, pretzels, apple-wine glasses, green-sauce herbs and skyline bricks. Athens has one theme per district: A amphorae, B owl coins, C komboloi, D olive branches.
  - The collection screen opens with **U** or from the map panel.
- **Placement:** procedural on the qv street graph.
  - Road samples every 20 m. A greedy cover keeps rings 60–105 m apart, then a fix-up pass fills any gap over 140 m.
  - Event types are balanced per area. Jump events only go where the road is straight for ≥ 110 m both ways.
  - Nothing is placed within 55 m of a district gate or 45 m of a mission mark or garage. Spots under mission marks that appear later are pruned at runtime.
- **Area completion:** each `districtAt` area gets a % from events, golden bricks (OG ones plus the existing 30), collectibles and story marks.
  - The map shows a per-area % on the canvas plus an "AREA COMPLETION" panel; in Athens the panel also lists districts A–D.
  - Crossing into an area shows a pop-up.
  - 100 % grants a locked livery and 5.000 studs, once.
  - Progress is saved in `mho_og` (per slot and per city).
- **No clutter:** at most 10 markers are drawn, via 3 InstancedMeshes with a per-instance alpha fade between 150 and 270 m. Markers are hidden (and cannot trigger) near the NEXT/GPS path, gates and mission marks. During an event every other marker is hidden.

Counts: Frankfurt 1123 spots (970 events, 52 golden, 101 collectibles, 29 areas, built in 190 ms). Athens A/B/C/D: 211/255/482/532 spots.

## Patch order
`./reapply.sh pOG1.py` → REAPPLY_OK. The page is 3.40 MB.

## Tests (`node tOG.js` → 39 pass, 0 fail; `node smoke.js .` → SMOKE PASS)
- **D density.** 300 random road points each in Frankfurt and Athens A–D: no point was more than 150 m from an unfinished activity (worst 141/129/110/100/111 m, mean 46–49 m).
  - 0 spots on gates or mission starts.
  - Markers drawn after warping next to marks and gates were never on them, and never more than 10 were visible.
  - No marker within 15 m of an active NEXT/GPS route.
- **E events.** For all 8 types, a bot drove through the ring using real keys (`__mho.K` arrows / KeyX / Shift plus `roamSim`). Every type started without a menu and reached bronze, silver and gold, depending on bot speed or drift time.
  - Retry worked by key and by button.
  - 38 events finished, with tiers none/B/S/G = 6/11/9/12.
- **C completion.** Completing an event raised the area % and was saved. A collectible picked up by driving was saved.
  - The pop-up appeared on crossing an area.
  - The map panel and collection screen both rendered.
  - The % survived a page reload.
  - Reaching 100 % gave the reward exactly once (+5.300 studs, livery).
- **P perf.** `renderer.info` draw calls at 6 spots, OG drawn vs hidden: worst +1.32 % (e.g. 731 vs 729). This is OG on/off in the same build, not a separate base build.
- No page or console errors in any run.

## Known gaps
- Rooftop bricks only appear on axis-aligned 3.5–14 m buildings; Frankfurt has 6, Athens none, because its buildings sit on terrain. Athens has no OG hill-top bricks either; its hill tops are covered by the existing 30 golden bricks, which count toward the %.
- Tier thresholds were calibrated with the bot. Drift points depend on the spot, so gold needs about 24 m/s of sustained drifting.
- Story missions are not anchored ahead of time, so OG spots can sit where a later M1 mission mark appears. Those spots are pruned when the mark shows up.
- Rooftop and hill-top golden bricks were not driven to by the bot (a collectible was). Rooftop reachability is untested.
