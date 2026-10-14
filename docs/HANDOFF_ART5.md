# art-5 handoff (liveliness / variety lane), 2026-10-14

Branch: trunk `alex/od-int2`. My commits: 030137a, c49be5c. Shots: `qa_art5/ctb_row.jpg`, `qa_art5/ctb_row2.jpg`.

## Done
- **CTB LEGO-set buildings, default ON** (`?ctb=0` turns them off), in src/98ct_city_lego.js:
  - Root cause of the old fallback: models.js had not loaded the sets when the city was built. Fix: `CTB_ids` prefetch at boot, and `roamLoad` waits for the current city's chunks before `buildHubG` (15 s cap, measured 0 ms). `CTB.wait` holds the wait.
  - Slopes: a set sits at its HIGH corner on a light-grey plinth (`CTB_plinth`, one InstancedMesh). Slopes over 3 m keep the old building (`CTB.st.slope`).
  - Frankfurt pool: bank, 6372 ×3 colours, 6683, cg, plus 6362 shop, 6374 Holiday Home and 4956 house. The picker (`CTB_pick`) takes the LEGO family least used within 45/100 m and in the slot's row so far.
  - Frankfurt sets register with BV (`BV_add`, fac `lego:<id>`, `ctb:1`, `yb` = base y). BV_life counts a set as a shopfront and adds only a café, a kiosk, or a roof billboard on legs. Athens slots are registered by CV_put as before.
  - Tests (src/99c_checklist.js, 📍 GO): `ctb/fra-row`, `ctb/collide` (real gas, 5 s) and `ctb/perf` (warm-up + min of 3 interleaved rounds) all PASS under tGo load.
  - `tools/ct/tMemCTB.js <url> <city>`: Frankfurt heap +27 MB (Athens +5 MB), boot not slower.
  - Counts: Frankfurt 6.4k sets, Athens 5.9k.
- **bv1/fra** regressed with CTB on and is fixed (above). Real numbers (`node tools/tBV.js <hot url> out fra`): blocks with ≥ 3 facades 98.5% near and 99.2% city-wide; street life 55 items in 4 kinds.
- **Athens CE_dec shops** go into BV.L (`HUB.ceS`, 60_city_build3), done from the art-4 queue.

## Next
1. District themes (art-3 Next #2): Sachsenhausen apple-wine taverns, Bahnhof neon, Osthafen murals. This is a BIG feature (> 1 h). Send the coordinator a one-paragraph spec, 3 tests and ONE mock-up shot FIRST, and build nothing before the yes.
2. The pink panel on a black pole near the Athens Festival start: only if a reviewer flags it.
3. Optional: give the cg (castle) set its own row slot. Its 79k near tris are fine at gap 260 m.

## Gotchas
- `bv1/*` GO verdicts are async ("measuring…"). tChkGo counts them as PASS, so use tBV.js for real numbers.
- `v90k/rv-scale` is SLOW (14–37 s) whenever any forced draw (`__tq.draw`, ctb/perf) runs before it in a fresh test page. It does the same with `?ctb=0`, so this is a test-mode artifact, not CTB.
- `v90m/ath-boot` (≤ 30 s) and `rv14/rv-cam-refit` fail on the `ctb=0` baseline too under parallel load.
- Hot reload: `__ctb.go` calls the functions by name, so `hot reload src/98ct_city_lego.js` picks up GO changes. New top-level functions still need `reboot`.
- `alex/od-int2` has no common history with `main`, so no PR can be opened from it.
