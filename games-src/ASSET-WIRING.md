# Asset wiring: how art gets from "made" to "verified in game"

Read this before any asset work. It applies to every game; Mainhattan Nightrun is the first one with a registry.

## 1. The rules (learnt the hard way)
1. **One source of truth:** `games-src/<game>/assets.registry.json`.
   - It is built by `python3 games-src/scripts/asset-registry.py`. Never edit it by hand, and re-run it after every asset change.
   - The old lists (`ASSETS-NEEDED*`, `ASSETS-PENDING-*`, `expected-assets.json`, `WIRING-TODO.md`) are inputs or views. They are not the truth.
2. **Fixed states.** A script sets the last three; nobody sets them by hand:
   - `needs-art` -> `generated` -> `approved` -> `delivered` -> `wired` -> `verified`
   - **delivered:** the full-size file is in the repo and passes the size check. A file of 256 px or less, or a viewer thumbnail, never counts.
   - **wired:** a code hook loads it (`slots[].hook = yes` + the code spot).
   - **verified:** a phone smoke test shows it drawn, the player drawn, no load errors and decoded memory under budget, with a screenshot saved.
3. **"Done" only means `verified`.** Every report quotes the registry counts (`ASSET-REGISTRY.md`), never a scan of one machine.
4. **Paint only `needs-art` rows.**
   - Anything that already exists, even only on the laptop, is never generated again.
   - Shapes drawn in code in place of art count as missing art. They have rows named `nr.*.code-*`.
5. **Delivery and push are separate steps.**
   - The laptop pushes only when the owner says so.
   - Art that changes what the game loads goes to a side branch first. Live comes after the smoke test passes.
6. **One id grammar:** `nr.<area>.<thing>[.<state>]`. Old names live in `aliases[]`.

## 2. Who does what
| Step | Laptop (art) | Linux (code) |
|---|---|---|
| make | Flow rounds from the registry's `needs-art` rows (two lanes), strip method for animations (`HANDOFF-SPRITES.md`) | - |
| approve | owner in the asset viewer | - |
| deliver | full-size originals into `games-src/<game>/incoming/<date>/`; sheets into `games-src/anims/<game>/sheets/<who>/<act>-strip.webp/.json` | `ingest-assets.py` from incoming -> `games/<game>/media/` |
| wire | - | write the hook for every `delivered` row whose slot says `hook: no` (code spot in the registry) |
| verify | - | phone smoke test per screen, then re-run `asset-registry.py` |
| merge | - | side branch -> live only after verify passes |

## 3. Linux worker checklist for a delivery
1. `git fetch && git merge`, then read the delivery note at `games-src/<game>/incoming/<date>/README.md`.
2. Copy the incoming files into `assets-inbox/<game>/`.
3. Run `python3 games-src/scripts/ingest-assets.py --check --slug <game>`. Fix name misses through the registry aliases, never by renaming art by hand.
4. Run the real ingest.
5. Sheets: copy `games-src/anims/<game>/sheets/<who>/*` into `games/<game>/media/anim/<who>/` as described in `HANDOFF-SPRITES.md`.
6. For every row now `delivered` with `hook: no`, write the code hook at the listed code spot.
   - Placeholders stay as the fallback (ASSET-POLICY.md).
   - Add no new shapes.
7. Smoke test on a 390x763 phone viewport for every screen touched:
   - the new art is drawn,
   - the player sprite is drawn on fly and street stages,
   - zero load errors,
   - no frame takes longer than 50 ms while loading.
   Save the screenshot.
8. Re-run `asset-registry.py`. Commit the registry together with the code.
9. Push to a side branch, report the registry counts, and merge after review.

## 4. Known traps
- **Player sprite disappears.** With the full-size ingest of 22 Oct (branch `nr/full-size-assets`), Kai is not drawn on the street stage: `FQ.miss.kai` keeps climbing.
  - It is NOT caused by the `foot/` entries alone.
  - Look at the `ART.anim` decode order and budget against the number of images `ready.json` makes the page fetch. See `nightrun/HANDOFF-FULLSIZE-2026-10-22.md`.
- **Street layers.** `FA.bg` is never called. The street engine asks for `foot/bg-street-*`, while the painted layers are `foot/bg-sky|far|mid|near|floor` (2048x1024).
- **Windows path bug.** `wiring_scan.py` checks `'/media' in dp`, which never matches on Windows. On the laptop it reports almost everything as wired.
- **Ship loop sheets.** Frames must be registered on the hull (`make_anim_sheets.hull_aligned`), not centred per frame; otherwise the ship shakes. `ship_jitter.py` must report 0 sheets over 3 px.
- **Character sheets: one body size.**
  - Sizes are metric: each character has a real size (`viewer/real_sizes.json`, e.g. bruiser 2 m), and every strip json carries `metres`, `px_per_m` and `body` (px of the standing height). One scale per strip, from its most upright frame; crouch/dash/land poses are shorter on purpose.
  - Rigid shapes (bosses, drone, turret, ...) are checked by feature matching (SIFT) of every state against every other state; all are within 3% of idle. Corrections live in `viewer/scale_cal.json`.
  - Every state of one character has the same cell height. Feet (or tracks) are on the bottom edge of the cell for characters and grounded bosses; flying bosses are centred.
  - **Do not scale or anchor per detected content (alpha bbox).** That re-introduces size jumps: crouch/dash frames get stretched, raised weapons or smoke shrink the body.
  - **Game drawing rule:** keep feet = bottom of cell. Draw at `gameHeight / body` (or `px_per_m`), one scale per character, identical for all its states. If `body`/`px_per_m` is missing, fall back to cell height = game height. The sheet already carries the pose difference: do not rescale crouch or jump cells in code.
