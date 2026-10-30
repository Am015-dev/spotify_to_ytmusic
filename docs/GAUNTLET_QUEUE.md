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

## 30 Oct ~05:00 status
- PASS, waiting for a deploy: gui-r30a 1584590 + 1c1e191 (REVIEW_2K_29).
- FAIL, rework queued for the next free worker slot: touchdrive-r29a 0aa5fa4 (REVIEW_2K_29 c: BOOST lunges into next-lane traffic 1 in 3; fix = BOOST + steer toward the car). Session session_01RR7mnXYxNGypZruSqUdFZx.
- Rework running: world-r30b (session_01RR7mnYsNgKumNtw8HdSvQe).
- Running: traffic-r30c2 OPUS (session_01RR7mnbHxaitimxqGvtVT8Q): near-car 7.9 m one-frame teleport (on trunk too) first, then the density patch v3 only with 0 pops. Rule 9: last lane on density.
- Gauntlet on trunk tip (rev29-r30a2): 1 FAIL, boot/toControl. Next lane after the reworks: boot-r30e.
- Deploy plan: one deploy (beta.165) once touchdrive and world pass review; otherwise revert the failed commit before building, as for beta.164.

## 30 Oct ~08:30
- world-r30b round 2 (90f612f) FAIL REVIEW_2K_31 (d): camera-in-props handling moves cafe clusters away for good in plain view; Athens world/camprop red 2/3; a walker fills the lens. Passed: icon, birds, debris, honest GOs. Rework queued for the next free slot, narrow scope: props only fade while between camera and car and always come back; walkers step aside; plus the gauntlet bot must brake into quest markers (GAS is default on touch) so quest START x3 is verified by real input.
- traffic-r30c2 rework running (hit/contact 9/10 with the teleport fix). touchdrive rework running (BOOST + steer toward the car).
- Open, no lane yet: black building face (HANDOFF_world-r30b), TypeError byteLength in three's buffer upload on long drives (trunk; 0 in a 120 s run on beta.164), boot/toControl, density ring.

## 30 Oct ~10:20 (REVIEW_2K_32)
- PASS: traffic-r30c2 1fb1138 + fc3bda4 (no near-car teleports; hit misses are the bot's target choice; script fix written in REVIEW_2K_32). Watch: turning cars slide 3-3.7 m across the centre line at 8-21 m.
- FAIL: touchdrive-r29b d094be2: (3) a two-thumb race correction (left still held 33-100 ms when right lands) rolls 10/10 -> needs a chord window; (2b) the SMASH hint never shows (body.fdq hides #crSmHint, 99fd_drivefirst.js:35). Rework queued (session_01RR7mnXYxNGypZruSqUdFZx).
- DEPLOY BLOCKER (rule 15): page/jsErrors 8x "byteLength" in a full gauntlet run on trunk, not caused by the traffic flags. Bug lane jserr-r30f OPUS gets the next free slot, before the touchdrive rework.
- Running: world-r30b round 3, boot-r30e.
- Next after these: gauntlet hit-target script fix (SONNET), density ring (rule 9 exception: repro exists), black building face.

## 30 Oct ~11:30 (REVIEW_2K_33)
- PASS: boot-r30e 330a5fb + 6bc9823 (A/B at 6x: fra -5 s, ath -12 s; 0 programs linked after control; no holes in 0-10 s).
- Bar APPROVED by the coordinator, confirmed by review (beta.151 re-measured: 7.3x vs Alex's iPhone 12.6 s): boot/toControl <= 36 s at 6x in fra AND ath (= ~5 s on an iPhone); 1x <= 15 s as INFO only. The code bar is still 8 s: the next boot lane sets it.
- Next boot lane boot-r30g SONNET (~45 min): set the gauntlet bar to 36 s; compile the far-street merged materials under the curtain (3 late program links ~3 s after reveal in 2 of 3 tIosReveal fra runs); make perf/ios-reveal boot via PLAY (its ?test= entry skips the prewarm, so it is red on trunk); add playMs to the iPhone beacon.
- New bug, own lane later: teacups/picnic group pops in ~1 s after control (on old builds too).
- Boot still ~76 s fra / 110 s ath at 6x vs 36: the big cost is buildHubG (~51 s). Needs a tiled city build design lane (OPUS, 4+ modules).
