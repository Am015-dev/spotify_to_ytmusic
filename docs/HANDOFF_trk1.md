# HANDOFF trk-1 (builder tracks lane), 2026-10-14

Branch `alex/od-trk`; everything also merged into `alex/od-int2` (last push a3febc9).
Code: `src/98b2_builder2.js` (builder), `src/99c_checklist.js` (bxT items + GO).

## State
- Race menu shows CLIFF RUN, CANYON SPLIT, LAGOON SPLASH (`BX_DEMOS_SHOW=true`). TWO-LEVEL CITY has `hide:1`.
- Races are 2 laps (`BX_RACE_LAPS`).
- Check: `node tools/bx/tData.js` (~40 s, FAIL lines only; `V=1` for every line). It reads the track data:
  - rails, 14 m width, no open exits (exits into water are allowed: boat splash);
  - 3+ jumps, 2+ boosts, a shortcut that saves 50+ m, grade ≤ 25 %;
  - lap 1.5–2.7 km on both split routes, 20+ props per 200 m, a landmark;
  - plus GO → GAS 3 s → 15+ m forward, never backward.
  - All 3 shown tracks PASS.
- Coordinator rules: no laps, sloppy drivers or real-time drives as tests. At most one shot read per visual change. Push to od-int2 every ≤ 10 min.

## Pieces added (BX_P)
- `lu`/`ld` LONG RAMP.
- Every ramp eases in and out (`bxRamp`). Peak grade is 22 %; `up`/`dn` are now 24 m, `su`/`sd` 48 m.
- Legacy `up1`/`dn1`/`su1`/`sd1` are only for old saved tracks (`BX_mig` on load of log v < 2).
- `wbl`/`wbr` WIDE BANK, R36.
- `kj` KICKER, 0.6–1.5 s air with a flat landing.
- `mg` MERGE, the opposite of SPLIT.
  - Its entry is the left lane's end; the second entry is 2 cells to the right (`def.in`, `BX_ents`).
- Road is 14 m (`BXRW=6.5`) with a 1.4 m rail (`BX_RAIL`) on every piece except fk/mg.
- Lateral containment in `BX_step` (lim 5.4 m) makes the car slide along the rail. It is skipped where two decks overlap.

## Fixes found on the way
- The gate posts used a left-handed basis, which put a post in the middle of the road ("post fills the camera").
- On WIDE BANKs the ground poked through the low inner edge (`BX_carve` now uses the low edge).
- `route()` now follows the MERGE lane the car arrives on.
- Canyon's loop out and back overlapped the inner loop's road.
- `tools/bx/lib.js` (only used now for shots):
  - the touch holder lifts all fingers and re-presses (CDP dropped single releases, leaving the brake stuck);
  - BX.hold freezes the sim during shots.

## Tools
- `node tools/bx/plan.js <file>` plans offline, with no browser. It reports closure, length, grade, cut/fly vs terrain, open exits, overlaps (< 16 m), and building hits (city).
  - Check every layout here before building.
  - Layout files use `R(t,n)`; `tools/bx/tracks/v2.js` is old.
- `/tmp/.../shots.js`-style shots: warp the car for a visual only, never for a test.

## Open items
1. TWO-LEVEL CITY: no shortcut and the lap is 1.45 km. The city blocks (z = ±40), the lake and the 320 m edge leave no room for a loop out and back. Redesign it or drop it (coordinator's call).
2. Scenery is still plainer than 2K: props are big boxes and there's one landmark. Ideas: the tunnel mouth, crowds on stands.
3. Lap 60–90 s isn't possible in the 320 m grid. The coordinator approved 1.5–2.7 km laps with 2-lap races.

## trk-2 (2026-10-14)
- TWO-LEVEL CITY is shown again (4th race track). It is the lagoon snail turned 180° (`[26,37,5,1]`, re-anchor `[2,18,-1,2]`) on city ground: a 10 m viaduct over the inner loop, and a lake splash shortcut (54 m) in a stadium-shaped lake (`city` world f). BX_CITY blocks moved into the infields (plan.js: bldg hits 0; the bx-bridge test roads are clear too).
- tData now runs 4 tracks (`bx-t-city` added, with a checklist item + GO). All 4 PASS.
- Polish: each world has its own landmark (`BX_landmark`: city TV tower, islands lighthouse, canyon brick stack, otherwise the minifig). Banners are printed boards on legs (`BX.banMat`). Crowds are separate minifigs on a grey stand.
- Known: canyon, lagoon and city share one layout (different worlds and scenery). A distinct city layout needs a bigger grid (BXN=40 is global).

## trk-2, part 2 (Alex beta.22: "car drives backwards, no race methods")
- Root causes:
  - BX_car drew the ride 180° backwards: inner yaw is now +PI; matrix bx-visual-facing 8/8.
  - With the nose pinned into the rail the car had no yaw authority. The rail now slides the nose along the course, and BX_wrongWay turns the car to face the course after 2.5 s facing backwards or stuck.
- Race mode, at the end of 98b2: 3-2-1-GO countdown holding the car, 5 rivals (BX_racePath = the dry lane, curve speed profile), position + lap timer in #bxRace, results card #bxRes.
  - Overlays must live inside #bx: builder mode hides every other body child.
  - Checklist item bx-race; test tools/bx/tRace.js.
- Grid 40 -> 56 cells (BX_OFF=8):
  - bxCh(w,c,L,o=BX_OFF): old 40-grid cells keep their metres. New layouts pass o=0.
  - Saved tracks migrate on load (log v3).
  - plan.js takes 56-grid layouts; set OLD=1 for 40-grid files.
- Distinct layouts:
  - CANYON: the original snail.
  - LAGOON: a figure-8 over the sea with a 12 m bridge, splash vs detour.
  - CITY: a downtown square ring, viaduct over the lake, kicker lane vs detour; the blocks and lake were moved.
  - Generators live in the session scratchpad (gen.js figure-8, gen2.js ring). Layouts are checked with plan.js before install.
- Boost pads are blue tiles; kickers have a striped lip; there are 3 m rail pennants; pillars stay 9 m clear of lower roads. The track check asserts 0 view blockers.
- Env: if tools/unit crashes on three.module.js, run `npm i --no-save --no-package-lock three@0.164.1`. Restart `python3 -m http.server 8766` after a container restart. Page boot sometimes times out once; retry.
- Next: rivals on boats/split lanes, rubber-banding.
