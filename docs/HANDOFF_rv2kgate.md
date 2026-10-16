# HANDOFF rv2k-gate (2026-10-16)
- Runner awaits rv2k long GOs on a fake clock (tools/tChkGo.js); combined TAG=rv2k was 9/11 (race + foliage failed); race fixed (late DNF verdict + sprint abort), solo PASS 2ND.
- objectives did not regress (passes in the combined run). Monkey ignores pause/card windows and world-edge/off-map positions (tools/qa/monkey_page.js), NOT re-measured.
- Unit 0 FAIL. Two consecutive combined gate runs NOT finished (timebox): re-run `TAG=rv2k,life1,life3,xf1,terrain bash tools/tGo.sh <url> <out>` twice.
- Left: monkey rerun to confirm <=0.3/min; foliage (fcam-2); onboard (boot-2).
