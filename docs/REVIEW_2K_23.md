# REVIEW_2K_23: racemode-r25a + racehud-r25c (2026-10-25)
Reviewer lane rev-racemode-r25a. Built pages (tools/build.sh), phone profile (PHONE=1: iPhone UA, 852x393 touch), local http server. Builds: base 42e084c4, racemode head c524d2d6 (lane 9019f742..d2c228e5), racehud 83bdce54.

## Verdicts
- **racemode-r25a (9019f742, 9e756f08, 66a8c3a7, b9c330f8, d2c228e5): FAIL, send back for one fix.** The feature works: race/racemode-all PASSes in both cities, and the camera change is clean. But race/racefree goes red on about 40 % of runs with this lane and on 0 % of runs on its base. It stops going red with `?stkcam=0`. It is a new red, not a pre-existing one (details below).
- **racehud-r25c (83bdce54): PASS.** The one-line fix is correct and race/one-speedo PASSes in fra and ath. Its build still contains the racemode-r25a code, so the same race/racefree red shows up there too (1 of 2 runs). That red is not caused by this commit.

## Checks
- Unit (`node tools/unit/run.js`, three@0.164.1 installed): 5594 asserts, 0 FAIL.
- race/racemode-all on the c524d2d6 build: fra PASS, ath PASS (200 s and 195 s). There was 1 console error, `net::ERR_INSUFFICIENT_RESOURCES`. It comes from the environment: the disk was 91 % full.
- race/one-speedo on the 83bdce54 build: fra PASS, ath PASS.
- Shots I looked at: grandprix_fra_before/after and coastrally_ath_after. The car is framed the same, the camera is a bit closer and steady, and both cities show the brick look. The second "0 KM/H" speedo is visible in both the before and after shots, so it was already there. racehud-r25c fixes it.

## Gate reds: base vs head (TAG=life1,xf1,terrain + solid,racefree,cam/steady,tk1/water, then reruns)
| GO | 42e084c4 base | c524d2d6 (racemode) | 83bdce54 (racehud) | class |
|---|---|---|---|---|
| xf1/water | red (hull 0.18 m) | red 1/1 valid | green | pre-existing, flaky |
| xf1/land | green 2/2 | red 1/2 (tyre gap 0.06) | green | flaky. The lane does not touch roam/xf code |
| why/solid-cars | green 3/3 | red 1/3 (DR_unjam car jump 14e6 m) | green 2/2 | flaky traffic. Not the lane (roam traffic, roam camera) |
| tk1/water | red | green | n/a | pre-existing. Fixed by this lane (the rival counts at >= 90 %) |
| cam/steady#1 (ath) | red 1/2 (city race) | red 1/2 (free roam 8.7 deg/s) | n/a | pre-existing, flaky. Same rate on both builds |
| **race/racefree** (fra) | **green on all valid runs (about 8)** | **red on 4 of about 11 valid runs** (hands-off drift 16.3 / 2.3 / 16.3 / 16.3 m, limit 2) | red 1/2 (7.8 m) | **new with racemode-r25a** |

Note: the base rows were green in my runs. That differs from the "red on the base build too" in the HANDOFF and in the TRIAGE notes. The worker of racehud-r25c also saw xf1 and solid-cars green on its base. Some runs ended in `EVAL Error ... reading 'said'`. Those are harness hiccups and are not counted.

## Why racefree counts against this lane
- Same c524d2d6 build, 5 repeats each: `?stkcam=0` gave 0 drift reds in 4 valid runs. The default (SKC on) gave 1 drift red (16.3 m) in 4 valid runs. Over all my runs: SKC_race on, about 5 drift reds in 12 runs; SKC_race off or base, 0 in 12.
- The failing check is RFG_track (src/99crf_racefree_go.js:23-32). It starts race mode with startRace() and steps stepSim() with touch steering. I found no direct path from SKC_race into stepSim. My guess is that the updateCam wrapper (src/98sc_stkcam.js:51) changes some state that is read later: it runs on the startRace snap, or in the real-time frames between GO steps. That state could be camera.position, which the old rig's camPos/lookAt then works from, or something chunk/ground-related that is keyed to the camera. The check fails with a fixed value (16.3 m), so it is deterministic once the condition is hit.
- Rule 15: a red is never shipped through. Fix: find the coupling. If RFG_track turns out to depend on the camera, decouple it, or reset SKR plus camera/camPos when startRace runs. Then show race/racefree green 5/5 with SKC on.

## Code notes (racemode-r25a)
- SKC_race: one smoothed length and one FOV, rate-limited, with the direction kept from the old rig. The crash cam, the cockpit view and the attract cam are skipped. `?stkcam=0` brings back the old rig. The design is fine.
- 99cst `({CST_judge})`: a no-op expression whose only job is to keep CST_judge in the lazy export (LAZY `:CST_judge`). Fine.
- The GO is solid: real menu path, human-like bot, stepped clock, judging windows split at crash cuts. The "before" rows in RACEMODE_TRIAGE were judged by an older version of the GO (the doc says so). Every before row fails on the camera column alone, so the totals still hold.
- Open from the HANDOFF: the city-course spread in tk1/quick Athens, and the LEVEL UP card covering the next race's start.

## racehud-r25c
- startRace hides `#roam`. enterRoam / exit-to-roam paths show it again (src/70_roam_world.js:429, src/72_roam_map_loop_boot.js:268). City courses do not go through startRace, so #roamGauge stays their only speedo, and the GO counts that case too.
- The commit trailer names a model. CLAUDE.md says "no model names in files or commits". This is minor; keep it out of future commits.
