# tools/unit: fast test suite (no browser, no playing)
`node tools/unit/run.js [filter]` → one line per FAIL + summary, exit 1 on any NEW FAIL. ~1.6 s, 4300+ assertions. Run it first on every build.
- `--selftest` proves each check can fail: 18 seeded breaks (UT_SEED=<name>, see seeds.js) must each print their FAIL.
- `known.json` = ratchet of pre-existing data findings (shown as "known", not FAIL; a fixed one prints FIXED → delete it). `--update-known` rewrites it.
- lint_meta (page size <3.6 MB, ALL_OPEN, credits, ORDER, no model names, OD_CHANGELOG, checklist) · lint_roads (Frankfurt/Athens ways, dead ends, taxi/garage on road, landmarks off road)
  · lint_models (152 LDraw chunks: bricks, colours, ride fill/height/aspect/wheels, metres per ride) · lint_scale (pedestrian + moped 1.80 m) · lint_tracks (builder pieces, grade ≤22 %, rails, demo chains)
  · logic_core (real DMG_impact, DMG_traf burst rules, stick curve, settle tyre gap, CAM_solve; real three.js from node_modules).
- Not covered (needs runtime geometry/terrain, still in the browser checklist): quest-giver/on-foot/drvM heights, road grade ≤12 %, edges over grass, props ≤4 m from a road, building-vs-road overlap of generated blocks, collectibles inside buildings.
