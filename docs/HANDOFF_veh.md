# Vehicle converter lane handoff (veh-2, 2026-10-10; was build-8, build-4). Branch alex/od-mdl-veh. Integrator: build-9 (session_01GMDcFfTGnwQmyHKU8PFQfp; build-7 stood down, never send there). Every MODEL batch and status carries ONE labelled grid: python3 tools/grid.py docs/shots/veh/GRID_<n>.jpg "<title>" "label=path" ...

## Loop (≈ 3 min per model)
Setup in a fresh container: parts lib (`curl -o ld/c.zip https://library.ldraw.org/library/updates/complete.zip; unzip -q -d ld/lib ld/c.zip`),
`pip install scipy pyfqmr`, `python3 -m http.server 8766 &`, `tools/build.sh vveh --local`, `node tools/ld/ld_dump.js http://127.0.0.1:8766/local_dbg.html?fast=1 ld/ours.json`.
OMR file: `curl -o ld/omr/<set>-1.mpd https://library.ldraw.org/library/omr/<set>-1.mpd`. The full OMR list is ld/dl/omr_sets.tsv (git-ignored; scrape library.ldraw.org/omr/sets?page=1..62).
1. `python3 tools/ld/ld2garage.py ld/omr/<s>.mpd ld/out/v<s> --only "<set> - truck" --yaw 2`. If size [w,d] has w > d, use --yaw 1 (or 3 if the shot shows it backwards).
2. `python3 tools/ld/vehsrc.py <s> ld/out/v<s>.json "<Name>" <Kind> <perk> top acc han` writes src/98ld_v_<s>.js (data + GB_PC registration + GAR_SETS preset t_v<s with _>).
   Valid perks: armor drift heal luck refill shield slip start.
3. Add it to src/MODELS locally (do NOT commit MODELS, ORDER or MODULES.md: build-7 owns them), `tools/build.sh vveh --local`.
4. `SET=t_v<id> GONLY=1 SW=8000 VIEWS='{"g_34":null}' node tools/ld/tRides.js http://127.0.0.1:8766/local_dbg.html ld/shots/veh/<id>` and LOOK. Rerun once if the log says "car rod".
5. Copy the shot to docs/shots/veh/<s>_g.png, commit (module + mpd + shot), push, and send build-7 "MODEL <sha> <file> <name> <shot> <line>".

## Rules (coordinator)
Minifig-scale only: City, Classic Town, Speed Champions, Creator. NO Racers/Tiny Turbos (7611/7612/7613/8120/8121 were reverted). Trucks are fine (models.js is on demand); each module ≤ 200 KB.

## Done (58): 4436 30572 4914 7639 75892 75878 75893a/b 60017 3179 60059 3221 7731 3180 60054 30313 60083 7991 6633 1517 6503 1991 7942 7737 4433 4434 4200 7631 7990 60018 7635 7733 7747 7630 7634 604 606 620 622 623 7743 6505 6506 6533 6643 6666 6670 6656 6660 6521 6527 6530 6644 6514 6532
## Skipped: 621 (beacon floats), 7638 (converter TypeError), 6522 (converter IndexError), 75870 (25 wide, extra parts in main; try --only body,wheel,windscreen), 7242 (sweeper brushes -> blue box placeholders), 4208 (18x21 studs, warn 192), 7736/60065 (quads, no cab);
## To rescue-1 (session_01PjYpc3jdr9iB9myHSwGVAs, branch alex/od-rescue; never discard): 1572 6668 6526 6669 = shared DARK FLOOR PATCH (big dithered dark rectangle under/ahead of the car in the garage shot, deterministic, not part 4531, no common part): 1572 6668 6526 6669; floor patch routed to garage-18). Also 7242 (brushes -> blue boxes).
## Next: Classic Town bercik/others from the OMR list (scrape: library.ldraw.org/omr/sets?page=1..59, rows "id name theme year n"):
6531 6525 6524 6523 6509 6507 6512 6511 6650 6651 6652 6653 6658 6661 6667 6648-2 6607 6605 6609 6355 6354 6361 6352 625 6504 6608; City 4206-2 (truck; file names use 4206-2, scripts assume -1); Creator 7347 6911 (check minifig scale).

## veh-2 session (2026-10-10): 34 more done, sent to build-7/build-9; grid docs/shots/veh/GRID_veh2.jpg. 4288 fix affects no other ride (7242/75870 on alex/od-rescue do not use 4288).
6525 6524 6523 6509 6507 6512 6511 6650 6651 6652 6653 6658 6661 6667 6648-2 6607 6605 6609 6354 6361 625 6504 6608 4206-2 7347(small car) 7638(rescued) 6600 6602 6603 6501 6675 6430 6450 6480.
Skipped: 6531 (helicopter), 6352 (dock crane, no wheels), 6355 (horse cart), 6522 (motorbike), 6911 (OMR file 404 under every name), 7347 big truck (16 wide, not minifig scale).

## Faster flow (veh-2)
- `tools/ld/vehcv.sh <set-n> "<submodel>" [yaw]`: runs tools/ld/mpdroot.py (submodel becomes the root, unrotated, scene colour kept; fixes cars placed at 10-15 deg in the scene and colour-16 parts turning cream) then ld2garage; auto yaw = 2, or 3 when w > d. Writes ld/omr/<set-n>c.mpd (commit it with the module).
- Facing rule (verified on 10 sets): LDraw front -z -> yaw 2, +z -> yaw 0, +x -> yaw 1, -x -> yaw 3. Read the front from the part positions (grille, headlights, steering wheel ahead of seat, bucket; small wheels at the front of tractors):
  `awk 'index($0,"0 FILE <sub>.ldr")==1{f=1;next} /^0 FILE/{f=0} f' ld/omr/<s>.mpd | grep '^1 '` and look up titles in ld/lib/ldraw/parts (lower-case names).
  `python3 tools/ld/vehfront.py ld/out/v<s>.json` = steering-wheel-vs-seat hint (front = -z); wrong for loaders and convertibles, a hint only.
- In g_34 the front points RIGHT (camera sees the right side, slightly from the front).
- Module ids: vehsrc.py <set-n> -> src/98ld_v_<set-n>.js, preset t_v<set>_<n>.
- Converter fixes: 4288-style one-piece rubber wheels are tyres (11063ac); scaled inline primitives (cables, hoses) skipped, not a crash (cfdf040).
## Next (from ld/dl/omr_sets.tsv; downloaded already: 6535 6550 6470 1029)
6535 Dumper (dumper), 6550 Outback Racer (car; FILE names have trailing spaces), 6470 Mini Dump Truck, 1029 Milk Delivery Truck (car),
then 6553 6571 6581 6594 6431 6473 6481 6484 6545 3056 6406 4016 30283 30284 20011 10220 (Creator: check scale) 6742 6743 6753 31027.

## Tips (build-8)
- Orientation: most Classic Town LDraw cars (authors RainbowDolphin, bercik) need --yaw 3, not 1, when w > d. LOOK: grille/headlights/windscreen must face the camera (bottom-right) in g_34.
- Run at most 4 ld2garage.py in parallel; 13 in parallel corrupted a cache (JSONDecodeError), rerun fixes it.
- Trucks with trailers: --only "<set> - Truck" --drop trailer. When the cab is a sibling submodel (60018), use --drop worker,wheelbarrow,driver instead of --only.
- tools/ld/calib.json changes on every run; not committed.
