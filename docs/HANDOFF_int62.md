# HANDOFF int-62 (beta.62 build, NOT pushed)

Status: build green, unit 0 FAIL, not pushed (rv2k red after one fix attempt). Changelog entry is uncommitted in src/10_core2.js.

Fix applied: src/99c_checklist.js foliage GO now sets `rc.camera=camera` on its Raycaster. Result: `rv2k/card` and the Raycaster.camera console error are gone.

Still red on built page (out/int2dev/qa_rv2/fra/tChkGo.json, `res` array), all three are SLOW timeouts, no assertion text, `errs: []`, no stack:
- rv2k/race-handsoff: `📍 HANDS-OFF RACE · do NOT touch anything until the result… · SLOW 20.6 s > 10 s ❌` (state race)
- rv2k/walls: `📍 ROAD-FOLLOW · driving 60 s… · SLOW 20.6 s > 10 s ❌` (state roam)
- rv2k/objectives: `📍 OBJECTIVE NOISE · driving 60 s… · SLOW 40.5 s > 10 s ❌` (state roam)

Same three reds on the first run before the fix, so they are not caused by the foliage change. Cause unknown; the tests reach their end state but take 2-4x the 10 s budget, which points at frame rate or load in this sandbox (two gate batches ran at once). Not yet checked: rerunning rv2k alone, and comparing against the beta.61 build on the same machine.

Known reds, unchanged: rv2k/garage-car (7 % of screen, needs 12 %), rv2k/drawer (5 wall/prop hits/min, ≤1.5), rv2k/foliage (0 tiles, labels check). life1,xf1,terrain: 35/36, only life1/ath-density (known).

Next: run rv2k alone (TAG=rv2k) on an idle box and compare the three SLOW times. If they pass alone, the build is fine and the gate needs a load fix. If they still fail, bisect the beta.62 changes against beta.61.
