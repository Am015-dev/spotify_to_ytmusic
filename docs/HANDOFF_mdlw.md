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
| 98ld_w_30023.js | 30023 Lighthouse | ath | 13 | s:3 (micro set) |
| 98ld_w_2882.js | 2882 Speedboat | fra river | 19 | sink:1 (Athens has no river reach in WATERS) |
| 98ld_w_6350.js | 6350 Pizza To Go | fra | 51 | --only pizzeria |
| 98ld_w_7796.js | 7796 House | ath | 3 | s:2.5 |
Skipped: 10264 Corner Garage (543 KB, over budget), 6613 phone booth (hood malformed).
src/ORDER is NOT committed (shared): integrator adds 98ld_w.js then each 98ld_w_<set>.js right after 98ld_import.js.

## Loop (≈5 min per model)
1. `tools/ld/wOne.sh <set> <fra|ath> <r m> <angle°> "<ld2garage opts e.g. --only building --yaw 2>"` → ld/out, src/98ld_w_<set>.js (+placement line), local build, prop shot docs/shots/mdlw/w<set>.png, size. (needs ld/lib + ld/ours.json: MODEL_PIPELINE.md §5; :8766 server.)
2. LOOK at the shot. Front must be −z (camera side); else rerun with `--yaw 2`. Boats: edit the push line to `water:1,sink:N`; micro sets: `s:K`.
3. Optional in-world check: `WD=1.8 WH=1.0 node tools/ld/wWorld.js http://127.0.0.1:8766/local_dbg.html docs/shots/mdlw <fra|ath> w<set>` (roam works in this container).
4. git add the data file, ld/omr/<set>-1.mpd, shot; commit, push, message build-3.
OMR catalogue: /omr/sets?page=1..59 (1,469 sets); download https://library.ldraw.org/library/omr/<set>-1.mpd. Already downloaded, not converted: 4010, 6362, 1069, 6360, 3718, 4956.

## Budget
Local page with all of the above = 3.33 MB (base 3.03). Keep new models ≤ 30 KB; ask build-3 before bigger ones.
