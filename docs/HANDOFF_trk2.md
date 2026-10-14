# HANDOFF trk-2 (builder tracks lane), 2026-10-14

Branch: `alex/od-int2` (trunk). Code: `src/98b2_builder2.js` (builder + race), `src/99c_checklist.js` (bxT items + GO).
Background on the pieces and tools: `docs/HANDOFF_trk1.md` (its trk-2 sections at the end).

## Done
- **Alex beta.22, "the car drives backwards"**
  - `BX_car` drew the ride 180° backwards: rides face local -z. Inner yaw is now `+Math.PI` (0ea4e6f).
  - A car pinned nose-first on the rail had no yaw authority, because yaw scales with speed. Now the rail slides the nose along the course, and `BX_wrongWay` turns the car to face the course after 2.5 s facing backwards or stuck (a6377ea).
- **"No race methods": race mode MVP** (e47ebe8). Block at the end of 98b2: `BX_raceStart` / `BX_raceSetup` / `BX_raceTick` / `BX_raceResults`.
  - 3-2-1-GO countdown with the car held.
  - 5 rivals using the city team rides on `BX_racePath`, which is the dry lane, with a curve speed profile.
  - `#bxPos` position, lap timer, and a `#bxRes` results card.
  - Overlays must be children of `#bx`, because builder mode hides every other body child.
  - Race-menu tracks start a race.
- **Visuals** (67e0004)
  - "Tan cardboard wedges": these were the boost V-bars. Boost pads are now blue tiles with orange chevrons.
  - Kickers have a yellow/black lip.
  - "Giant poles": raised-deck flags are now 3 m pennants.
  - Pillars stay 9 m clear of lower roads.
  - The track check asserts 0 view blockers.
- **Grid 40 → 56 cells, 448 m** (592efa6)
  - `bxCh(w,c,L,o=BX_OFF)`: old 40-grid cells keep their metres; new layouts pass `o=0`.
  - Saved tracks migrate on load (log v3).
  - `tools/bx/plan.js` takes 56-grid layouts; use `OLD=1` for 40-grid files.
- **Distinct layouts**
  - CANYON SPLIT: unchanged snail.
  - LAGOON SPLASH (402c33d): figure-8 over the sea with a 12 m bridge over the start straight; split = sea splash (boat) vs banked detour.
  - TWO-LEVEL CITY (5697c5e): downtown square ring, west side on a 12 m viaduct over the lake; split = kicker straight vs infield detour. The blocks (`BX_CITY`) and the lake (city world f) were moved.
- **Unit-suite chain "gaps" were the lake boat crossings** (397c52e). `tools/unit/lint_tracks.js` now uses the same water rule as the in-game check.
- `BX_DEMOS_SHOW=true` (f265128, after matrix 96/96 phone+desktop with the default 12 rides).

## Tests
- `node tools/bx/tData.js [ids]`: track data plus a 12 s phone-profile drive with no steering.
  - Heading within 20° of the course ≥ 90 % of samples, camera behind, progress > 150 m.
  - A forced backwards spin recovers within 4 s.
- `node tools/bx/tRace.js`: countdown 3, 2, 1, GO with the car held; 5 rivals ≥ 100 m in 10 s; position = ranking; 6-row results card.
  - The finish is forced by setting the lap count to 2; nobody drives 2 real laps.
- `node tools/matrix/run.js --city fra --profiles phone,desktop [--rides N]`: facing, camera, progress, laps for every demo × ride.
- `node tools/unit/run.js`: about 1 s.
- Layout design: generator scripts were in the session scratchpad (gen.js for the figure-8, gen2.js for the ring), lost with the container.
  - Re-derive a layout as a piece list and check it with `tools/bx/plan.js`: closed, oob 0, overlaps 0 except the SPLIT junction, bldg hits 0.
  - Then install it as `bxCh(world, c0, list, 0)`.

## Environment gotchas
- After a container restart: `npm i --no-save --no-package-lock three@0.164.1` (the unit suite needs it) and `python3 -m http.server 8766` (lib.js pages).
- The page boot sometimes times out once (180 s wait for `#bxMenuBtn`); a retry passes. Run long suites in the background with a long timeout.
- Verify every push with `git branch -r --contains HEAD`; one early "PUSHED" never reached origin.

## Open (next owner)
1. Rivals on the split lanes and boats (they take the dry lane only), plus light rubber-banding.
2. The race HUD duplicates "LAP x/2" (top status line + timer); trim it to the phone-HUD rule (minimap + speed + one objective line).
3. The matrix has no race-HUD case; tRace covers it on CLIFF RUN only.
