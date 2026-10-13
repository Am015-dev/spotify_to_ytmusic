# models-7 handoff (build-10 stands down, 2026-10-13). Branch alex/od-models. Read HANDOFF_models6.md for v90j contents and test notes.
Coordinator session_017iH3DB4VyxwKSdMwsco4Ut, reviewer session_01Y6FYerWwxv43FuKUcaUT4v.

## v90j (see the end of this file for REVIEW/READY status)
- = models6 contents + facing-1 (od-facing f64131a: drivers face front, 1991/3180/4208/621/6633 turned) + veh-3's 21 rides (came in through facing-1's
  merge of od-mdl-veh 4e5d807; audited: gap ≤ 0.004 m, 0 errs, qa/v90j_aud3). So veh-3 is DONE in v90j, not v90k.
- GRID docs/shots/v90j/GRID.jpg (64 tiles). tPlay docs/shots/v90j/tPlay_v90j.json.
- tPlay final: fra walls 1.49/min (v90i 0.5), ath walls 2.97/min (v90i 1.49), ath hits cluster at (1745,-1350)/(1730,-1265) = same Koulouri Rush
  zone as v90i (1750-1786,-1300). Memory "leak" fails = garage trip's one-off +geoms (same total as v90i). Heap 162 MB = v90i.
- Athens START shot (qa/v90j_tp/phone_ath_start.jpg): camera upside down / car flipped right after spawn (wall hit f=130). Second Athens run:
  qa/v90j_tp2 (result at the end of this file).

## v90k queue (next integrator)
- track-2 builder: alex/od-builder 0146a18 (reviewer QUICK-plus PASS). ORDER: 98tb_track_builder.js right after 98ro_open.js; 98ro_open.js OPN_ROAD let.
  Conditions: OD_CHANGELOG v90k lines (NEW Track builder: home → 🛠 BUILDER…; NEW ⧉ EXPORT/IMPORT track codes), checklist items
  (BUILDER opens · EXPORT→COPY · IMPORT shows in MY TRACKS + TEST races it · PC and phone), page ≤ 3.6 MB after split, models.js + models/ ship.
- STUNT CUP: alex/od-track deb7b1c (code 52734f8) has a reviewer FULL-gate PASS, labelled v90l (after v90k home/builder). It CONTAINS od-builder 0146a18,
  so v90k's builder diff is a subset. Adds src/98ts_track_stunts.js (ORDER right after 98tb_track_builder.js), 98ro_open.js builder-only hills, its own
  OD_CHANGELOG v90l + 5 checklist items. Keep labels unique; page ≤ 3.6 MB after merging all slices (tr2j alone 2.997 MB); models.js + models/ ship.
- roads-1 (alex/od-roads: map connectivity, traffic rules, scooters/bikes) and home-1 (alex/od-home 39d31f2 WIP, Home save point + boost gating):
  only after a reviewer PASS.
- Athens start flip (if it reproduced): own it or route it (driving/feel → Opus worker).

## Status
