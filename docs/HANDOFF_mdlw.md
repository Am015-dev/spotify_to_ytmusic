# build-5 world-prop converter handoff (2026-10-10). Branch alex/od-mdl-world (from alex/od-models).

## Done (all pushed; each one sent to build-3 as MODEL <sha> …)
| file | set | city | KB | notes |
|---|---|---|---|---|
| src/98ld_w.js | loader | both | 9 | registry LDW_P, merged mesh (CR_LO 2) + far LOD (big parts, >60 m), collider, wheels, water mode, scale s, road-facing spot |
| 98ld_w_6683.js | 6683 Burger Stand | fra | 30 | |
| 98ld_w_6601.js | 6601 Ice Cream Cart | fra | 25 | |
| 98ld_w_6402.js | 6402 Sidewalk Cafe | ath | 33 | bike dropped |
| 98ld_w_1632.js | 1632 Motor Boat | fra river | 36 | water:1 sink:3 |
| 98ld_w_6365.js | 6365 Summer Cottage | ath | 54 | |
| 98ld_w_6372.js | 6372 Town House | fra | 31 | --yaw 2 (open back away from street) |
| 98ld_w_30023.js | 30023 Lighthouse | ath | 13 | s:3 micro set: BREAKS the minifig-scale rule, build-3 asked to drop it from src/MODELS; then delete the file |
| 98ld_w_2882.js | 2882 Speedboat | fra river | 19 | sink:1 (Athens has no river reach in WATERS) |
| 98ld_w_6350.js | 6350 Pizza To Go | fra | 51 | --only pizzeria |
Removed: 7796 House (micro set at 2.5x, breaks the minifig-scale rule). Skipped: 10264 Corner Garage (543 KB, over budget), 6613 phone booth (hood malformed).
src/ORDER is NOT committed (shared): integrator adds 98ld_w.js then each 98ld_w_<set>.js right after 98ld_import.js.

## Loop (≈5 min per model)
1. `tools/ld/wOne.sh <set> <fra|ath> <r m> <angle°> "<ld2garage opts e.g. --only building --yaw 2>"` → ld/out, src/98ld_w_<set>.js (+placement line), local build, prop shot docs/shots/mdlw/w<set>.png, size. (needs ld/lib + ld/ours.json: MODEL_PIPELINE.md §5; :8766 server.)
2. LOOK at the shot. Front must be −z (camera side); else rerun with `--yaw 2`. Boats: edit the push line to `water:1,sink:N`; micro sets: `s:K`.
3. Optional in-world check: `WD=1.8 WH=1.0 node tools/ld/wWorld.js http://127.0.0.1:8766/local_dbg.html docs/shots/mdlw <fra|ath> w<set>` (roam works in this container).
4. git add the data file, ld/omr/<set>-1.mpd, shot; commit, push, message build-3.
OMR catalogue: /omr/sets?page=1..59 (1,469 sets); download https://library.ldraw.org/library/omr/<set>-1.mpd. Already downloaded, not converted: 4010, 6362, 1069, 6360, 3718, 4956.

## Budget
Local page with all of the above = 3.33 MB (base 3.03). Keep new models ≤ 30 KB; ask build-3 before bigger ones.

## Since 2026-10-10 15:50 (merged alex/od-models at 517c03f)
- **Data modules are no longer in the page:** build-3 lists them in `src/MODELS` → `out/<ver>/models.js`, run by `98ld_run.js` (each file only sees LD_MESH, LD_MODELS, GB_PC, G13_ID, GAR_SETS, GAR_set, LD_br, LDW_P, LDW_reg). The page budget is gone; the limit is the phone's triangle count (the Corner Garage is 77k tris: too many). wOne.sh still appends to src/ORDER: change it to src/MODELS (build-3 owns that file; local only).
- **NEW RULE (Alex):** buildings at TRUE minifig scale, the same as the game's humanoids. A game minifig must fit through the door and inside with headroom. **Every building needs a shot of a game minifig standing in its doorway.** No `s:` scaling for buildings. NOT yet checked: is LD_SW = 0.408 (car stud scale) the same as the humanoid scale? First job for the next session: doorway shots for 6683, 6402, 6365, 6372, 6350 with a game humanoid. If they don't match, fix LD_SW (or a per-prop factor) for every building.
- **Update from build-3 (15:54):** alex/od-models 248fe7e9 (v89x) renders all world buildings and stalls at LD_SW × LD_FIG (1.6, in 98ld_import.js; game people are 1.9–2.0 m, an LDraw minifig at LD_SW is 1.22 m). LDW_build1 uses SW=LD_SW*(P.s||(P.water?1:LD_FIG)). Merge alex/od-models first. Proof shot for each building: `node tools/ld/ldDoor.js http://127.0.0.1:8766/local_dbg.html?fast=1 <outdir> w<set>` (prints the door height). Doors must be ≥ 2.2 m, and a person must fit under the floors. Put the shot path in the MODEL message.

- **build-6 (2026-10-10):** merged alex/od-models (LD_FIG 1.6). 30023 dropped (file deleted, out of src/MODELS). 2882 added to src/MODELS. 6350 Pizza To Go DROPPED: its only door is a 1×3×3 hatch, 1.41 m at LD_FIG vs the 1.9 m figure (docs/shots/mdlw/door_w6350.png). New buildings: pick sets with 1×4×5/1×4×6 doors (≥ 2.2 m at LD_FIG); run ldDoor.js `<id>:1.6` for every one.
