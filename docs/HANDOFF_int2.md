# HANDOFF int-2 → next integrator (2026-10-13 ~21:45)

Role: long-lived INTEGRATOR. Coordinator = session_017iH3DB4VyxwKSdMwsco4Ut. Fixers: dev-2 (builder) on `alex/od-dev1` (session_01Tm3swkugPmwhuyFgAfdp6G),
dev-3 (bugs) on `alex/od-dev3` (not pushed yet at handoff). dev-1 (session_01BXzEM8tCDGJn3FXEYxMxtG) has handed off.
Never touch live, never run deploy.sh, never ask Alex. Push + one line to the coordinator at least every 10 min.

## State
- Branch `alex/od-int2`, head `ff50683` = **v90m-beta.1** (`out/v90m-beta.1`): v90l + dev-2 ded0603/28b5681 (3 built-in builder tracks, WIP).
  tChkGo **220/223, 0 errors** (fails: v90k/shadow, v90g/bigrig, v90i/palms; see open items). Grid `qa_v90m-beta.1/grid.jpg` (looked: OK except the parked-car shot, player still in the car); BUILD line for beta.1 not sent by int-2.
- `out/v90l` (9351831) = last full BUILD sent to the coordinator (217/220, 0 errors, grid `qa_v90l/grid_v90l.jpg`).
- `out/v90k` (8ee95ab) = the coordinator's live candidate (dev1 2ced33a + lag fix).
- `alex/od-int2-tq` = the ?test= work (now fully merged into od-int2; no need to use it).

## Loop (JOB 2, every ≤ 30 min when a fixer pushed)
```
git fetch origin alex/od-dev1 alex/od-dev3
git checkout alex/od-int2 && git merge --no-edit origin/alex/od-dev1 && git merge --no-edit origin/alex/od-dev3
#   conflict in docs/MODULES.md → git checkout --theirs docs/MODULES.md && python3 tools/modmap.py   (generated file)
#   conflict in src/ → prefer the fixer's side for their own module; ask the fixer (send_message) if unsure
# prepend ONE OD_CHANGELOG entry at the top of src/10_core.js (const OD_CHANGELOG=[ …), 2–4 plain lines FIXED/NEW/CHANGED, label v90m-beta.N
tools/build.sh v90m-beta.N            # split build out/v90m-beta.N; check BUILD_OK, page < 3.6 MB; it already fails without ALL_OPEN=true / "by Alex"
rm -rf out/int2dev && cp -r out/v90m-beta.N out/int2dev
(cd out/int2dev && python3 -m http.server 8811 &)   # restart the server after replacing the dir (old server serves a deleted dir)
node tools/tChkGo.js http://localhost:8811/index.html <scratch>/goN > <scratch>/goN.log      # ~4.5 min: run in background, wait for the notification
node tools/tShots6.js http://localhost:8811/index.html <scratch>/shotsN                       # ~3 min, ONE browser: s1..s6
python3 tools/grid.py <dir>/grid.jpg "v90m-beta.N" s1_fra_drive.jpg s2_checklist.jpg s3_map.jpg s4_parked.jpg s5_builder.jpg s6_ath_drive.jpg
# LOOK at the grid. Copy grid + tChkGo log into qa_<ver>/ (git add -f), commit, push.
```
Message to the coordinator (one line):
`BUILD alex/od-int2 <commit> out/<ver>, GO x/y, errors n, grid qa_<ver>/grid.jpg, open rv: tests: …, changes: …`
(Live-candidate builds the coordinator names explicitly: label it, same steps, send `DEPLOY …` only if the session is allowed to; int-2 was blocked by a permission check on that message.)

## Tools made by int-2
- **`?test=fra|ath[&car=<ride id>][&at=x,z][&go=<ver/id>][&draw=0]`** (prelude `TQ` in `src/10_core.js` + `src/98tq_test_quick.js`): boots straight into free roam on throwaway slot 9 (wiped each load), low quality, no warm-up passes, story/tutorial popups skipped. `window.__tq.ready` = drivable; `__tq.st` = loader stage timings; `__tq.o.draw=1` turns drawing on (with `&draw=0` nothing is drawn, incl. the builder/garage render loops).
  Checklist 📍 GO from the wrong city / not driving reloads into `?test=<city>&go=<id>`.
- **`tools/tChkGo.js <url> <outdir> [filter]`**: every GO item (fra, then builder `bx`, then ath), PASS/FAIL per line + JSON summary (boots, errors). Garage-only/“drive here” items are run once and copied. Survives a lost page.
- **`tools/tShots6.js <url> <outdir>`**: the 6 integrator shots in one browser session.
- Boot to driving (headless, `&draw=0`): Frankfurt 20–37 s, **Athens 75–79 s**.

## Open items
- GO FAIL v90k/shadow: "No traffic car nearby" right after arrival (traffic not spawned yet) → dev-3.
- GO FAIL v90g/bigrig: Big Rig removed from traffic in v90k → item is stale (retire it or point GO at the garage) → dev-3.
- GO FAIL v90i/palms: GO gives no message and does not start a race within 1.2 s → dev-3.
- Parked-car GO (v90k/park-sit): in the grid shot the player is still in the car 2.5 s after GO (no exit) → dev-3.
- In Athens the checklist chip shows a Frankfurt item.

## JOB 3: Athens boot speed (not done)
CPU profile of `?test=ath&draw=0` (Chrome Profiler, 86 s total): athShelfY 15.7 s self (17.8 M calls; 15 M via `tH` in gndBuild/TR_res,
2.8 M via groundY), TR_G 5.9 s, TR_Y 5.2 s, GC 5.2 s, gndBuild 4.5 s, SM_shC 4.3 s, cityAt 4.0 s, BK_cand 2.2 s.
Loader stages: "Raising Athens" → "Laying the ground" 26–31 s; "Planting trees & lamps" ~17 s.
Tried: exact (x,z) memo on TR_Y during gndBuild → SLOWER (92 s; low hit rate + GC). Reverted, not committed.
Next idea: a precomputed height raster for the shelf blend (e.g. 2 m grid, bilinear) used only by gndBuild/TR_res (the ground MESH), keeping the exact
athShelfY for groundY/collision; verify the tyre-to-road gap ≤ 0.05 m and no z-fighting of the draped streets (+4.5 cm) in Athens shots.
Also: `nextFrame` is a `const` (72_roam_map_loop_boot.js) — reassigning it kills the page; the loader yields to rAF every 12 ms.
