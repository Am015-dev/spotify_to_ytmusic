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

## 30 Oct ~14:30 (REVIEW_2K_34)
- PASS: jserr-r30f 6b8da29 (drift trail was managed by memFree as static; 0 jsErrors on seeds 31-33 fra+ath+portrait; census: no other memFree-managed mesh is rewritten). Deploy blocker cleared.
- Reviewed PASS and waiting for beta.165: gui-r30a (1584590, 1c1e191), traffic-r30c2 (1fb1138, fc3bda4), boot-r30e (330a5fb, 6bc9823), jserr-r30f (6b8da29).
- Still on trunk with a FAILED review, reworks running: touchdrive (0aa5fa4..d094be2) and world-r30b (5063c2f, 90f612f). beta.165 waits for both (to avoid a multi-commit revert); if either fails again, revert it before the build.
- Tools-only follow-ups for boot-r30g: gauntlet.js:373 WARN sampler print commented out; gauntlet.js:391 can crash before the jsErrors row if the portrait boot throws (guard Q).

## 30 Oct ~16:10
- world-r30h pushed c7a7842 + d10705c (round-3 patch + 3 foliage-cam root causes; sq_tv_1 fig not reproduced, persistent START clear added). Gates green; gauntlet FAIL rows = trunk baseline. Needs an OPUS review after review-r30-9 (touchdrive) finishes.
- Running: links-r30i (SONNET, late shader links), tilebuild-r30j (OPUS design plan for boot ≤ 36 s, session_01RR7mnb5U1JRaBr7aPxJqRz), reviewer review-r30-9.
- beta.165 still waits for world + touchdrive verdicts.

## 30 Oct ~16:25
- tilebuild-r30j done: docs/DESIGN_tiled_city_build.md (b3256db). tb1 (SONNET, session_01RR7mnbL8oRMHJiL4MmTEsK) started: fra toControl ≤ 58 s behind ?tb1.
- touchdrive round 3 FAIL (REVIEW_2K_35): (a) chord uses performance.now() fallback, so late touches roll; compare raw e.timeStamp; (d) portrait tip 400 px on 390 px, cut and over the car; plus decide touch smash in city QUICK RACE ('roam'). Round 4 (~30 min, same worker session_01RR7mnXYxNGypZruSqUdFZx) starts when a worker slot frees (links-r30i or tb1). If beta.165 is ready first, ship it with touchdrive reverted.
- review-r30-10 (OPUS, session_01RR7mnb21PbB4bMneoNFPxV) reviewing world-r30b+r30h.

## 30 Oct ~17:05
- world-r30b+r30h FAIL (REVIEW_2K_36) and touchdrive r1-3 FAIL (REVIEW_2K_35): game code reverted in 4d432e4 (src only; docs, GO tools, gauntlet kept; touchdrive gauntlet rows boost/race will read FAIL until it returns). Each lane resumes from its own commits (revert the revert) in round 4.
- Deploy blocker: unit page/size-headroom red even after the revert (beta.165 page 3,505,383 B vs 3.5e6). Next free worker slot: size-r30k (SONNET) moves a GO-only module into src/LAZY (≥ 8 KB headroom). beta.165 changelog drafted (gui, traffic, boot, jserr).
- New top bug (Alex's own complaint "the game refreshed 5 times in 5 minutes"): REVIEW_2K_36 saw the Athens page reload itself at quest START under 6x in 2/2 runs. Bug lane reload-r30l (SONNET, 90 min) after size-r30k: reproduce on 4d432e4, fix root cause, GO mem/no-reload extended to ath quest START.
- Then: touchdrive round 4 (3 items in REVIEW_2K_35), world round 4 (3 items in REVIEW_2K_36), tb2..tb5.

## 30 Oct ~18:25
- Done: links-r30i 8b3eca7 (phone reveal links 0: fra 5/5, ath 3/3; TWG_late under the curtain, ~1 s at 6x) → needs OPUS review after tb1's. size-r30k a28ed13 (245 old changelog entries → docs archive, page 3.44 MB; unit green) → small, ships on green gates (rule 17).
- Running: review-r30-11 (tb1, can ?tb1 default ON), reload-r30l (SONNET, Athens self-reload at quest START), touchdrive-r30m (SONNET, round 4: re-apply + 3 items).
- beta.165 = gui, traffic, boot-r30e/g, jserr, size, links (if review PASS), tb1 ON (if review says so).
