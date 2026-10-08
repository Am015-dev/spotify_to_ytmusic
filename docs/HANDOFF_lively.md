# HANDOFF lively (alex/od-lively, PR #73 draft → base alex/od-bigcars)

## State (2026-10-08)
- Base: v88i (5892dc26). Commit 575e3b9d holds the code; the version is v88n (provisional; the coordinator assigns the final one).
- Code: new `src/98l_lively.js` (in ORDER after 98bc). `60_city_build.js` changes: PED_N 110, and pedInit/pedStep/hubRecycle call LV_pedPut, LV_pedFar, LV_pn, LV_wave, LV_trFar and LV_trNear. `10_core.js`: Life defaults in TUNE plus the changelog entry. `99t_tune.js`: the 'Life' knob group. `99c_checklist.js`: 8 checklist items. `src/assets/tune.json` and `docs/TUNE.md`.
- Research and evidence: `docs/research/LIVELY_2K.md`. Before shots: `lv/before/*`, taken on the real v88i. After shots: `lv/after3/*` (final) and `lv/feat/sheet.png` (close-ups).
- Tools:
  - `lv/shots.js <url> <out> fra|ath` takes 5 fixed street spots and counts people, cars, birds and boats in view. `MS=1` adds the frame time. `LIFE=0` sets the master to 0.
  - `lv/feat.js` takes close-ups of the boat, pigeons, scatter, flag, blimp and people.
  - `lv/probe.js <url> <codefile> [ath]` evaluates code in roam.
- Numbers: LV.ms is 0.06–0.15 ms per frame. Frame CPU with render stubbed is 6.5→7.4 ms in Frankfurt and 8.9→8.3 ms in Athens, which is within noise. 0 console errors.

## Next
1. Read lv/after3 + lv/rv (g11drive SIDE ATH: start, FRA drive, side traffic, tyres, Athens; garage). LOOK at them. Tyre gap from drive.log (tyre_rest).
2. REVIEW to session_01Y6FYerWwxv43FuKUcaUT4v. After PASS: merge live HEAD (origin/alex/brave-carson-rbpmlk; garux v88j / supra v88k-l may have shipped), letter per coordinator, rebuild split out/<ver>, git add -f out/<ver>, DEPLOY msg to coordinator.

## Status (later)
- Coordinator: live = v88l (supra c7cfa776, merged), my version = **v88n**. Street racers are in traffic: FRA list has 11 kinds (it must stay ODD, because DR halving drops every other car and an even count empties half the kinds); ATH adds t_su and t_su_sky via ATH_K 8,9.
- Life 0 now keeps 70 pedestrians, spread out as in v88i.
- REVIEW sent to session_01Y6FYerWwxv43FuKUcaUT4v for 094992e6. Shot paths are listed in that message (lv/after3, lv/rv, lv/feat, lv/su).
- After PASS: fetch origin/alex/brave-carson-rbpmlk and compare it with the live version. If live moved past v88l, merge that worker's branch. Then `tools/build.sh v88n`, `git add -f out/v88n`, push, and send the coordinator "DEPLOY alex/od-lively <commit> out/v88n <msg>".

## Reviewer PASS (094992e6) + notes
- (a) The effect is subtle in the chase view. Follow-up: groups of 3–6 peds at the nearest corners within 20–40 m, a car within 60 m on most streets, pigeons on the pavement ahead; raise the Life defaults if the phone FPS allows.
- (b) Scale: ped 1.67 m (SC_K.ped .44, unchanged since v88i) vs Hot Rod 1.44 m H = 1.16×, under the 1.2× gate. No new humanoid.
- (c) The tutorial card is missing from the Athens after-shots only because the after-run seed sets tut:1 (lv/shots.js); no code hides it.
- (d) The checklist items are present: life-fps, life-pigeons, life-boats, life-sky (blimp), life-traffic (street racers).
