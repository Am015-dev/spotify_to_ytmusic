# garage-15 handoff (2026-10-10): 40468 Yellow Taxi, steps 1 + 3 done. Branch alex/od-taxi. Next worker: steps 4–5 below.

## Done
- `src/98tx_taxi40468.js` (in ORDER after 98gb), tag TX_. Built v89r --local, 0 console errors.
  - Offsets ox/oz (studs) / oy (plates) on any brick (drawn only; cells unchanged). Kept on MOVE (98t SL_at) and MY PARTS copy (98pa).
  - NUDGE: ✥ NUDGE on #slBar → #txPad (← → ↑ ↓ ⤒ ⤓, ¼ stud / ½ plate); PC Alt+arrows, Alt+PgUp/PgDn. Mirror twin gets −x.
  - Colours '~#hex' = glass (CR_G), '*#hex' = lit (tail lights).
  - New parts: tx12 (TAXI print), lp12 (LDC-812), sg14g (BRICK OVEN! + pizza), sg14b (stars/taxi/statue), cp24 (88930), lh11 (41632), be24 (18892).
  - FIX: tipped parts ('<part>@xzq') were built from the chain BEFORE the 98gb tilt wrapper, so tipped G13 parts drew as plain boxes. Re-dispatched over the whole chain.
  - Preset t_taxi "Yellow Taxi (40468)", tier c, ref 40468: TX_CAR = every line of docs/TAXI_40468_STEPS.md = 119 parts
    (the table's "167" total doesn't match its own lines; the real set has 165 pieces, so some small parts are not in the table).
    Deviations: 1×3 front-wing tiles at z −7..−4 (the table had them overlapping the lamp holders); 2×3 hood tiles at z −5..−2; grille slats are vertical (CR grl geometry).
  - Alex (mid-task, 2026-10-10): "maybe including the lego ids would make it more easy to find the items" → every part tile shows its LEGO design id (top-left);
    the search box says "Part or LEGO id" (typing 3069 already found parts). Shot: docs/shots/taxi40468/ids.png.
- Shots: renders `docs/shots/taxi40468/r1/`; real-touch garage + drive `s2/` (t4/taxi15.js, WITHOUT ?fast=1: in fast mode the garage view freezes on the old car).
  Tyre-to-road gap **0.03 m** on all 4 wheels. Low side view: s2/d_side_low.png.
- **Sheet: `docs/shots/taxi40468/sheet_40468.jpg`** (tools/txSheet.py): box art + PDF p.41 vs our garage back / side / 3/4 rear, drive, box-art-angle render.
- Step 2 (full real-input step-by-step build test) NOT done: the preset is loaded through RIDES; NUDGE has only been checked through code, not driven by a real-input test.

## Still to do (in order)
1. Quick real-input check of NUDGE (BUILD → SELECT a part → ✥ NUDGE → tap ↑ etc., confirm `__gb.list()` ox/oz change + shot).
2. d_drive showed 0 km/h after 9 s holding GAS in t4/taxi15.js (probably the 1/5 QA popup or the story start). Confirm the taxi drives in tPlay.
3. tPlay on the split build: `tools/build.sh v89r --local`, `tools/tPlay.js` (alex/od-qa), smoke, 0 errors. Equip t_taxi first.
4. REVIEW to session_01Y6FYerWwxv43FuKUcaUT4v: "REVIEW alex/od-taxi <commit> <shots>": start, Frankfurt drive, Athens drive, low side of the taxi + a traffic car
   (traffic lookup in taxi15.js failed: `__mho.scene` is undefined; find the traffic mesh another way), garage, gap 0.03 m, sheet.
5. After PASS: rebuild on CURRENT live (verify_live.sh first), OD_CHANGELOG entry at the top of src/10_core.js
   (NEW: Yellow Taxi 40468 in RIDES, built from the real instructions; NEW: NUDGE tool + LEGO ids on part tiles; FIXED: tipped parts drew as boxes),
   99c checklist item, `git add -f out/<next free ver>`, push, DEPLOY to the coordinator session_017iH3DB4VyxwKSdMwsco4Ut with 3 bullets + the sheet path.
   Say in the DEPLOY that there is no chequer stripe because the real set has none. Never run deploy.sh.
