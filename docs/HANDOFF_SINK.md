# sink-1 handoff (parked car sunk into road on foot, v90j-beta)
- Probe: `node tools/tSink.js "http://127.0.0.1:8766/local_dbg.html?fast=1" <outdir>` (after `tools/build.sh <ver> --local`, `python3 -m http.server 8766`). Runs in ~1 min.
- Result with the DEFAULT car (red box racer, real wheels with userData.r): gap 0.03 m on all 4 wheels in car AND on foot. NOT reproduced.
- Alex's car in the shot is the blue/white racer with big red wing (a LEGO/LDraw ride). Next slice: equip that ride (Garage → RIDES; set it via localStorage before load), drive on the Frankfurt main road, exit, rerun probe.
- Suspects: on foot `roamStep` is skipped entirely (98of_onfoot.js:187), so the body keeps its last pose; OF_lift only runs for borrowed bodies (`C.own` returns early, line 182). If that ride has no `userData.r` wheels, CR_carPose (93_cars_lego.js:425) does nothing and the pitch/height from roamPose at the exit frame (braking/squat) is frozen → rear sunk. Fix idea: in OF_exit, after stopping, re-level the own body (rotation.x/z=0) and run the OF_lift wheel-corner rule for own cars too.
- Not done: fix, checklist item + 📍 GO, orange floating box on the road ahead.
