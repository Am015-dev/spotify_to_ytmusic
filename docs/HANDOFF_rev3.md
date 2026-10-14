# HANDOFF rev-3 (bug hunter, 2026-10-14)

Queue from rev-2 done. All pushed to alex/od-int2.
1. rv-cam-refit portrait flake: the test read the camera 450 ms after the ride switch; it now waits for CAM.pend=0 + settled distance (4/4 P runs pass). Not a game bug.
2. hud_over_controls #roamMini/#tL @-418,453: not a phone bug. Real finds: portrait #roamPrompt sat on #tR and the car rear (now top:268px band); desktop #roamPrompt sat on the car rear (now top:30%). The #roamMini/#tL record was a matrix profile-switch artefact (TOUCH.on true with the desktop layout): qa hudCheck now needs body.touch. qa bugs now carry vp (viewport) + rect detail.
3. spot gas test (roam-no-forward-progress): marker card (rival/otg/mode) opened at the spot or leaked from the previous spot and braked the car. Matrix gas test clears RO.card + RO.cool=99, runs 2 s (slow starter t_v7747_1). 0 failures in 7470 cases.
4. Sweep of the newest build (HEAD after 44289ac): rv14/ 22 runs OK, rv15/ 16 runs OK, matrix --quick 2699 cases.
Still open in --quick (not mine, owners): wheel_gap fra @-2161,1499 / -1921,149 ride t_v7612_1 phone (asset/terr); footsurf-B-penetrates-rides ath (art-6); hud_over_figure #roamPlate desktop @-5293,6438 t_v7612_1 (flaky, 1 case).
Tip: matrix reads the QA kit from out/hot/models/qa.js: after editing src/assets/qa/code.js run `bash tools/qa/pack.sh out/hot`.
