# REVIEW_2K_39: touchdrive-r30m round 4 (3b06d5c, 6d38412)

2026-10-30 · built page `out/rev39` (tools/build.sh, trunk 9e7d5fc), phone profile (iPhone UA, 852x393 touch and 390x844 portrait, dpr 2, CPU 6x after boot), real CDP touch events. Probes and logs in `docs/shots/rev39/`.

## Verdict: **PASS** (one small follow-up, does not block)

| check | verdict | evidence |
|---|---|---|
| 1. Late touches in a Cup race | **PASS** | `rev39race.js` (= r30m probe, STALL=2300 MODE=cup), fra, page main thread blocked before every pair; handler lag 1.9-13.8 s. 300 ms hand-overs at 20/40/60/80 ms overlap: **0/10, 0/10, 0/10, 0/10** (the first ~10 trials ran in `countdown`, the rest in `race`). Deliberate presses at 0/15/30/45 ms: **10/10 each**. Above the 60 ms window: 60 ms 2/6, 80 ms 0/6, 100 ms 1/6 (that one really landed 60 ms apart). `race_cup_fra_stall.txt`. |
| 2. No unwanted SMASH on a street run | **PASS** | `tools/touchdrive.js` fra x2 + ath x2: bd50/bd35/bd40 drift, bk50 no drift, tap100/200/300 at 40 and 60 km/h no slide, dbl/dblL 0 lunges, smashR/smashL 2/2, boostStraight/Away/AwayL/HeldSteer/SteerNoCar 0 lunges, errs []: **19/19 cases PASS on both cities**. Gauntlet boost rows: see below. |
| 3. Tip shots, portrait + landscape | **PASS on fit and placement**; 1 bug | 390x844: pill 360x48 at (6,253), inView, 0 control overlaps, not over the minimap, well above the car. 852x393: 360x48 at (22,118) / (464,118), inView, clear. City quick race and cup: tip 0/40 polls in both orientations. LOOKED, notes in `shots/rev39/SEEN.md`. Bug: portrait "placed RIGHT" still read **◀** (side 1): the text is not refreshed while the pill stays up. |
| 4. Gates + full gauntlet | **PASS for this lane** (one unrelated new red, below) | table below |
| 5. Feel | **PASS** | paragraph below |

## Gates (built page out/rev39, phone profile)
| gate | result |
|---|---|
| tools/build.sh rev39 | BUILD_OK, page 3,444,440 B |
| node tools/unit/run.js | 4996 assertions, **0 FAIL**, 13 known (three.js SKIPs) |
| TAG=touchdrive | **PASS 2/2**, errors 0 |
| TAG=life1,xf1,terrain | **PASS 42/42**, errors 0 |
| default gate (why,life1,xf1,terrain) | 77/78 under load (3 other browsers running): `life1/fra-density` frame-time mean 4.78 ms > 1.63. Re-run alone: **PASS 1/1**. So it's load-sensitive, not a regression: draws 14, inst 382, city windows 60/60. |
| full gauntlet `rev39-full` | 802 s, ran to the end, 10 FAIL of 35 (`docs/shots/gauntlet/rev39-full/REPORT.md`). **Lane rows all PASS**: boost/fra 41 presses 0 lunges (car in window 15/1201 samples), boost/ath 41 presses 0 lunges, race/rollOverlap 0/10, race/rollBoth 10/10, race/finish (141 s, 5th), race/rollTaps INFO 2 would-be double-taps (they no longer roll), portrait/boot/band/hud (0 overlaps, 0 texts < 12 px). FAIL rows vs **r30m-full (12)**: same boot/toControl 78.9 s, drive/onStreet 42 %, drive/near, drift/tap (0/1 slid, 2 not set up), wall/glance, wall/headon, mission/reach, ath/boot 114 s; gone: steer/buttons, drive/time, drive/frustration, hit/contact; **new: drift/start 2/3** (both valid setups drifted at 40° slip, 1 not set up = script) **and page/jsErrors 2** (see below). vs **rev36-full (10)**: same set minus hit/contact + hit/noBrake, plus page/jsErrors. |

**New red, not this lane (route a bug lane, rule 15):** `page/jsErrors` 2x in the Athens run: `THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size`. Between r30m-full (0 errors) and this run, src changed only by the OD_CHANGELOG line, so it's nondeterministic, not caused by 3b06d5c/6d38412 (they touch no geometry). Likely suspect from a grep (not proven): `src/98tr_terrain.js:147` recreates `color.array` with `p.count*3` when it is missing (the memFree zip family, cf. 6b8da29); a recreated array of another length gives exactly this error. Bug lane: Athens gauntlet with GTRAP, find the attribute, fix the root cause.

## Feel (touch)
I did not drive by hand (rule 4), so this rests on the measured cases and the shots. On touch the controls now do what the thumb means. BRAKE+steer drifts on purpose from 35-50 km/h on both cities. A 100-300 ms brake tap in a corner only brakes, so you can feather a corner without the tail kicking out, which was the core of "very sloppy". Steering alone, double steer taps, BOOST held while changing lanes and BOOST past traffic never lunge (0 in 82 gauntlet presses, 0 in all touchdrive cases). The race roll needs both thumbs landing together (≤ 45 ms 10/10). A hand-over correction never rolls, even when the phone handles the touches seconds late, so a hard correction no longer throws the car sideways. The SMASH tip is readable and stays out of the way. What still feels unfinished: in portrait the car beside you is off screen, so "toward the car" points at something you can't see. And in the city quick race (the menu default) SMASH is only arrow + BOOST at traffic, so the race chord there does nothing by design. I judge it deliberate rather than sloppy. Real iPhone reports from the Beta page are the final word (rule 10).

## Follow-ups (do not block this lane)
1. CRT_tick: while the tip is up, re-check `CRB_side(0)` each tick; update the arrow if the side flips, hide it if no car is beside you any more (seen: ◀ shown for a car on the right, portrait).
2. Process: 3b06d5c carries a `Co-Authored-By` trailer that names a model, which breaks CLAUDE.md. History on trunk is not rewritten; workers must use only the `Claude-Session` trailer.
