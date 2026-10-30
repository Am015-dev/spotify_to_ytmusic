# Gauntlet loop queue (coordinator session_01DuMYuyeSJqrdEzHVGGPmgj)
Alex, 29 Oct: "Continue development and make sure everything is working as described; do not bother me until you have a fully working game; use workers and the gauntlet loop; no AI sloppiness."
Loop: tools/gauntlet.js on the BUILT phone build -> FAIL rows -> fix lanes (2 workers + 1 reviewer, own sessions) -> review -> deploy -> re-run. Done = 0 FAIL rows and the shots look right to the coordinator.
Baseline beta.164: 16 FAIL / 43 (docs/shots/gauntlet/v90m-beta.164/REPORT.md).

| rows | lane | state |
|---|---|---|
| drift/start (+ double-tap smash lunge, hr-hit-2) | touchdrive-r29a SONNET | running |
| mission/card, card-wordy, coach-toast, empty-tiles, portrait-band | gui-r30a SONNET 1584590 | review FAIL (REVIEW_2K_27): Athens long card, GO blind, builder tile previews; rework running + hr/mstart flake |
| seen/floating-pickup, roof-seam, sky-debris, prop-on-car, camera-in-props | world-r30b OPUS 5063c2f | review FAIL (REVIEW_2K_28): icon fades to 31 % at 26 m; pigeons hang at camera height. Rework queued (session_01RR7mnYsNgKumNtw8HdSvQe) + seen rows black-building-face, floating smash debris |
| drive/pop (intermittent), drive/near (traffic density) | traffic-r30c SONNET | queued |
| wall/glance, wall/headon (script set-up first, then the reverted drivefeel redo: glances no damage) | wall-r30d SONNET | queued |
| boot/toControl 106 s lab | boot-r30e OPUS (measure unthrottled + perf/ios-reveal first; lab GL renders 2-3 fps) | queued |
| hit/react (INFO, read misses thrown cars) | gauntlet script fix inside wall-r30d | queued |
