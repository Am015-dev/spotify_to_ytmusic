# sink-1 handoff (parked car sunk into road on foot, v90j-beta)
- Probe: `node tools/tSink.js "http://127.0.0.1:8766/local_dbg.html?fast=1" <outdir>` (after `tools/build.sh <ver> --local`, `python3 -m http.server 8766`). Runs in ~1 min.
- Result with the DEFAULT car (red box racer, real wheels with userData.r): gap 0.03 m on all 4 wheels in car AND on foot. NOT reproduced.
- Alex's car in the shot is the blue/white racer with big red wing (a LEGO/LDraw ride). Next slice: equip that ride (Garage → RIDES; set it via localStorage before load), drive on the Frankfurt main road, exit, rerun probe.
- Suspects: on foot `roamStep` is skipped entirely (98of_onfoot.js:187), so the body keeps its last pose; OF_lift only runs for borrowed bodies (`C.own` returns early, line 182). If that ride has no `userData.r` wheels, CR_carPose (93_cars_lego.js:425) does nothing and the pitch/height from roamPose at the exit frame (braking/squat) is frozen → rear sunk. Fix idea: in OF_exit, after stopping, re-level the own body (rotation.x/z=0) and run the OF_lift wheel-corner rule for own cars too.
- Not done: fix, checklist item + 📍 GO, orange floating box on the road ahead.

# sink-2 (WIP, NOT READY — do not ship as is)
- Added OF_settle/OF_gap/OF_corners in src/98of_onfoot.js (runs on exit + every 0.25 s on foot) and checklist item v90k/park-sit with a 📍 GO (T.fn support in goJump).
- Probe (default car, tSink.js now prints OF_gap): wheel gaps on foot [0.079,0.011,0.059,-0.028] (worse than 0.03 before), OF_gap box-corner min -0.156 even after the lift → the mesh box bottom isn't the tyre bottom (something hangs below, or CR_carPose re-lifts after). Next: use real wheels (userData.r) when present, box corners only as fallback; drop the extra premultiplied pitch when CR_carPose has wheels; then test the blue racer (garage id unknown yet; 't_beast' Blue Beast is a candidate).
