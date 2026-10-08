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

## LIVE: v88n (bf87d40, from 35aea865), 2026-10-08. The beta is republished. This session stops here; a fresh worker continues.

## Follow-up plan (next worker, in this order)
1. **Life clusters in the chase view (reviewer note a).** In 4 of 5 Frankfurt pairs the "after" barely differs from "before".
   - Groups of 3–6 peds at the nearest street corners 20–40 m ahead. They idle, chat and wave rather than walk. Use extra instances from the same ped pool (PED_N 110; 40 are free at lvPed 1).
   - At least one parked or moving car within 60 m on most streets: bias `LV_trNear` to 60–200 m ahead, in the outer lane only (DR rule).
   - Pigeon flocks 15–40 m ahead on the pavement (`LV_spot` range now 28–95).
   - Measure with `lv/shots.js` (counts in view ≤ 120 m) and the before/after pairs. Target: people in every chase shot, and a car in 3 of 5.
2. **Ped scale (reviewer note b):** 1.67 m minifig (SC_K.ped .44) vs Hot Rod 1.44 m = 1.16× (gate ≤ 1.2×; probe lv/q3.js; its carH reads the whole mesh box, so use the BIGCARS dims). Any new group or pose must keep the same scale.
3. **Life defaults vs phone FPS.** Life code costs 0.05–0.19 ms per frame. Draw calls: Frankfurt +9 (birds 2, flags 5, blimp 1, boats 1) + 2 racer kinds × 3. Once Alex answers checklist item `life-fps`: if PASS, raise `TUNE.life` to 1.3 (lvPed then gives 91 peds), in tune.json + docs/TUNE.md. If FAIL, drop the flags first (5 calls) and set boats to 0 in Athens.
4. **2K-style pop-up challenges.** In 2K Drive, On-the-Go events start when you drive through a blue holo-gate (LIVELY_2K.md L4/L8). We already have OG_* (85) and blue holo-gates. Next step: short roadside pop-ups that need no stop:
   - "smash 5 in 10 s", "drift 3 s", "jump", "near-miss 3 cars";
   - triggered by driving past a small floating icon, brick-burst juice + studs on success;
   - only the existing objective line as HUD (no new HUD), at most 1 active, at least 45 s apart, knob in TUNE → Life.
   Lesson 5: no clutter on the road.
5. **Rules learnt here:**
   - The Frankfurt HCAR list must keep an ODD length. DR halving drops every other car, so an even list empties every other kind.
   - Headless tick is slow (~0.25 sim steps/s at normal gfx). Spawning that waits on frame counters is barely visible in shots, so force-spawn for close-ups (lv/feat.js).

## v88p (2026-10-08, this session): life you SEE from the chase cam + roadside pop-ups
- Code: `src/98l_lively.js` sections 7-9 (LV_edges street points ahead, LV_cl* clusters, LV_park*, LVP_* pop-ups), `60_city_build.js` pedStep crowd branch (p.cw/cx/cz/ch/gs, LV_cwave), `70_roam_world.js` traffic target min(2,V), `95_drive_flow.js` DR_unjam skips c.pk, TUNE knobs lvCrowd/lvPark/lvPop/lvPopGap/lvPopRw (10_core, 99t, tune.json, TUNE.md), changelog v88p, 8 checklist items.
- Lessons: HUB nodes are sparse junctions (166 per 1.25 km²) and hubNear samples only 18 random nodes, so use LV_edges (points every 10 m on edges). In Athens EVERY node has n.g=1 (traffic lane W=0, so no parked cars there). cityAt() does NOT match the HUB graph; use the HUB edge (LVP_path). The headless sim runs ~0.3× and renders ~0.8 s per frame, so screenshots lag one frame. At 852×393 a minifig 40-60 m ahead is 9-13 px tall, which is why half the clusters go to 20-45 m after a teleport.
- Tools: lv/shots.js (chase spots), lv/pop.js (GATEONLY=1 rings; NOSHOT=1 logic), t4/g11drive.js SIDE=1 ATH=1 (drive set + tyre gap). Review sheets: lv/v88p/*.png.
- REVIEW sent for c73180ea. After PASS: fetch origin/alex/brave-carson-rbpmlk, merge live (garux v88o may have shipped; conflicts are likely only in 10_core changelog/TUNE, 99c, 99t, tune.json, TUNE.md), `tools/build.sh v88p`, `git add -f out/v88p`, push, then send coordinator session_017iH3DB4VyxwKSdMwsco4Ut "DEPLOY alex/od-lively <commit> out/v88p <msg>" + 3 bullets + shot paths.
- Open: pop-up completion untested headless (checklist pop-play/pop-each); Life master stays 1 until Alex answers life-fps / life-fps2.

## v88p status (2026-10-08 22:50): DEPLOY sent to the coordinator (alex/od-lively 4aee8a04, out/v88p, on live v88o = garux 0560e1d4, LIVE_MATCH d3eeb454)
- Review: full c73180ea FAIL (blue wedge = the drift ring kept up past its plane, so the camera flew through it) → fixed (the ring is decided at its plane; probe lv/p/q8.js) → QUICK PASS 4616fd8b with 2 conditions, both met: merged v88o; LV_onRoad road mask (clusters never on any carriageway, probe lv/p/q9.js: 0/87).
- Reviewer notes still open (for the next worker): Athens spots 1-2 (hilly corridors) are still sparse; pop-up completion is untested headless (checklist pop-play/pop-each); Life master stays 1 until Alex answers life-fps2.
- Next: after Alex's checklist answers, raise TUNE.life if FPS passes; more Athens plaza clusters (plazas are not HUB edges; use OG areas / squares).
