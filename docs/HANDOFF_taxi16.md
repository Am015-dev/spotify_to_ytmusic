# garage-16 handoff (2026-10-10): 40468 taxi, coordinator fixes. Branch alex/od-taxi (PR #87). Build v89r --local (not deployed).

## Done (commits 1baf384 and later)
- **DRIVE 0 km/h, root cause:** the test, not the car. t4/taxi15.js tapped "TAP TO CONTINUE", which started HOT DROP, so the shot was taken during the event's start
  countdown (timer frozen at 04:20.0, EXIT shown). Game time runs ~6× slower than wall time on swiftshader. The same flow with Hot Rod reads 4 km/h.
  Real-touch probe `t4/tx16drive.js` (CAR=<id>, RIDES → card → SAVE → STORY): taxi 30 km/h, rod 31 km/h at the same moment.
- **"Long, low, flat", root causes:** (1) roam squeezes every car to 75 % width (SC_K.shipX in 96_scale_qa, made for the winged ships), so the true 6-wide
  taxi drew at 1.44 m wide. src/98tx: a GB_attach wrapper marks builds that contain `tx12` (the TAXI door) and an SC_ship wrapper keeps their x scale = y.
  Now 4.19 × 1.88 m (real car ≈ 1.8 m); collision unchanged. (2) the cabin/sign in the low side shot sat behind the 99c "1/5" QA popup (camera framing).
  (3) glass TC '#dfe9f0' over an open yellow cabin read as body. Glass is now '~#b4dcff', with black seats + dash inside (b22 ×2, p12 ×2: a readability deviation, the real
  cabin is empty). Overall size matches LEGO's official 6 × 13 × 5 cm (ours ≈ 6.7 × 13 × 5).
- Tyre gap 0.03 m on all 4 wheels (taxi15 run, s3). Roof sign visible in the chase cam.
- **NUDGE real-touch PASS:** `t4/tx16nudge.js`: RIDES → taxi → BUILD → LAYER off → SELECT → tap hood → ✥ NUDGE → ↑ ↑ ⤒ → cp24 ox 0, oz −0.5, oy +0.5, tip shown.
  (With LAYER mode on, the hood can't be picked: expected.)
- **tPlay:** `tools/tPlay.js` got `CAR=<preset id>` (real taps: garage → RIDES → scroll → card → SAVE). `CAR=t_taxi tools/tplay_fast.sh …`:
  Frankfurt: stuck 6.2 % (live v89q baseline 8–20 %, pre-existing FAIL), walls 0.25/min, 0 errors, rotation PASS, player 4.19 × 1.88 m.
  Leak check FAIL glMB 4.89 MB/min. Compare with the rod baseline on the same build: qa_tx16/tp_rod.txt (was running).
  Athens crashed in the harness ("Must send a TouchStart first" in rotTrip): rerun `CAR=t_taxi CITIES=ath tools/tplay_fast.sh http://127.0.0.1:8766/local_dbg.html qa_tx16/tp_taxi_ath`.
- Sheet v2: `docs/shots/taxi40468/sheet_40468_v2.jpg` (tools/txSheet.py): box art + PDF p.41 vs in-game 3/4 front, side, chase, 3/4 rear, garage side, box-art render.
  The in-game cars are small in frame; a closer 3/4 front (cam ~3.5 m, look target above the car so the QA popup doesn't cover the roof) would be better.

## Still to do
1. Read tp_rod.txt: if the rod also shows the glMB leak → pre-existing; if not → investigate (the taxi has 123 parts).
2. Athens taxi tPlay rerun (above).
3. REVIEW to session_01Y6FYerWwxv43FuKUcaUT4v: "REVIEW alex/od-taxi <commit> <shots>". Shots: tPlay phone_*_start/drive jpgs (qa_tx16/tp_taxi/*),
   docs/shots/taxi40468/s3/ (d_side = low side, d_traffic_low = traffic car, g_* = garage), sheet v2, gap 0.03 m.
4. After PASS: verify_live.sh, rebuild on CURRENT live, OD_CHANGELOG entry (NEW Yellow Taxi 40468 in RIDES; NEW NUDGE + LEGO ids on tiles; FIXED tipped parts drew as boxes),
   99c checklist item, `git add -f out/<next free ver>`, push, DEPLOY to coordinator session_017iH3DB4VyxwKSdMwsco4Ut with 3 bullets + sheet v2 path.
   Say there is no chequer stripe (the real set has none). Never run deploy.sh.
