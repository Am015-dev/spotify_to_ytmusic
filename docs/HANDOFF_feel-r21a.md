# HANDOFF feel-r21a (review 21 fixes 1+2)
- Roam FOV widening now: speed ≤ +10, nitro +3, kick ≤ +2.5, hard cap +12° over rest (src/71_roam_drive.js:301, src/99c8_feel21a.js; was +37.6°). `?fov21=0` turns the cap off.
- Roam speed lines driven from roamCam: 0 below 60% of top, 0.15–0.30 at 80–100%, +0.12 on boost, 0.3 s fade (same file).
- GO feel/fov: boost +12.0° (≤ 15 target), car 17.5% of width at 852×393 (≥ 16). GO feel/lines: rest 0, 70% speed 0.07, boost 0.42, mesh visible. Both pass fra+ath. Shot: docs/shots/feel21a_boost.jpg.
- Unit 0 FAIL; TAG=life1,xf1,terrain: only xf1/grass (and xf1/water SLOW by 0.3 s) fail, identical on the untouched trunk build; the Athens run of xf1,terrain gives "no summary" on trunk too (this box).
- Left: no tune.json change (FOV constants live in code); portrait FOV not re-measured (pFov scaling applies to the cap).
