# HANDOFF trk-4 (track builder lane), 2026-10-14

Branch: `alex/od-int2` (trunk). Code: `src/98b2_builder2.js`, `src/99c_checklist.js` (ver `trk4` items + GO). Reference: `docs/TRACKS_REF.md` + `docs/shots/trk4/ref_*.jpg`.

## Alex's complaint
"Track builder is very bad ... very limited spaces to drive around, no freedom compared to 2K Drive tracks ... unplayable tracks, no buttons."

## What changed (flag `BX_OPEN`, default ON; `?bxopen=0` = the trk-3 corridor)
- **24 m decks** (`BXRW` 6.5 → 11.5, `BX_HW` = outer half-width). Every old hard-coded width (profile, rails, carve, clamp, dressing, gates, pillars, chevrons, kicker band, containment) is now derived from `BXRW` and `BX_HW`.
- **Rails only on high decks** (`BX_railOf`): a rail only where the deck is > 3 m over ground (or > 6 m over water), and never where the deck overlaps another, non-chained deck. Next to a SPLIT, a rail on one branch was a wall across the other branch; the AI got stuck there on CANYON route 0. Loops and walls keep rails. Lateral containment only runs on railed pieces.
- **Open verges** (`BX_carve`): an 8 m flat verge on each side, then 22° banks instead of 39° cut walls. Low ground (not water, not more than 6 m below the deck) is raised into an earth bank. Each verge is carved to its own edge height, so banked corners get banked embankments. `BX_clampRoads` keeps the ground flat for 2 m past the edge, then lets it rise gently.
- **Banks at half angle** (`BX_BK` = .5) on 24 m decks.
- **Kicker lip 1.5 m** (`BX_KJ`, 20.6°): 1.1–1.7 s of air. trk-1's 0.9 m lip gave 0.7–0.9 s.
- **WIDE SPLIT / WIDE MERGE** (`fk2`/`mg2`): two lanes 32 m apart, 3 cells long. `bxW2()` replaces 10 straight cells: the right lane has a kicker, the left a boost. Each demo now has 2 route choices.
- **Race buttons**: GAS above BRAKE; 🔥 BOOST (spends a third of its meter, which fills in 8 s and faster in the air; the button fills orange); ⏸ PAUSE opens a card with RESUME, RESTART and BUILD (`BX.hold`). All buttons are at least 40 px. In portrait the HUD line sits under the race box.
- **Builder buttons**: the top row is 40 px. The palette and action column start 50 px down (they overlapped SAVE/LOAD).
- **Autopilot** (`BX_autoInp`): the GO of `bx-o-jumps`/`bx-o-ai` lets the AI drive the lap you watch. `BX_sim(ch)` runs the real `BX_step` at 120 Hz with no rendering, about 4 s per lap.

## Tests (all PASS at handoff)
`node tools/bx/tOpen.js <built page url> [ids]` runs trk4 ids, or `bxT/<id>` for the older builder checks.
- `bx-o-width` ≥ 24 m on ≥ 90 % of the lap. `bx-o-routes` ≥ 2 splits, and both ways close the lap. `bx-o-open` ≥ 8 m of open verge on ≥ 30 % of the lap. CLIFF RUN is the tightest at 39 %/34 %: its 30 m hairpin is a railed viaduct.
- `bx-o-jumps` ≥ 3 jumps of ≥ 1 s per demo. `bx-o-ai` fast-sim lap on both routes, no stuck time over 2 s, 0 respawns, 0 rescues.
- `bx-o-btn` / `bx-o-ui` run in landscape 852×393 and portrait 393×852 with real CDP taps: BOOST, PAUSE→RESUME, the LAND/TRACK tabs.
- `node tools/unit/run.js` must show 0 FAIL. `tools/unit/lint_tracks.js` sandbox now includes `BX_OPEN BX_HW BX_KJ BX_BK bxW2`.
- Shots: `node tools/bx/tShotsOpen.js <url> <outdir>` takes every view in ONE session (`ONE=1` = a dry run on the first demo).

## Open / next
- CLIFF RUN openness is the lowest of the four (the mountain hairpin is elevated). If Alex wants more, lower the hairpin viaduct.
- The rivals (`BX_racePath`) still take the dry lane only, not the wide-split lanes or the water.
- `bx-race-hud`'s list of other buttons does not include `bxG`/`bxBo`/`bxPz`; `bx-o-btn` covers their overlap.
