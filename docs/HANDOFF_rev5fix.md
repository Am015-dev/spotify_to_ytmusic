# HANDOFF rev5fix (review #5 visual fixes)
1. Athens spawn walls: not a stray mesh. `TR_bldFix` pass 2 (85_audio_feel_sp_otg.js) lifted the land-ground tile `gk` vertices in lifted-building footprints by trOff, doubling 630 vertices (6-90 m up). Fix: skip `userData.gk` meshes there. Shots docs/shots/rev5fix/ath_{before,after}.jpg.
2. Smash debris fades within 4 m of the camera (0 at <= 1.5 m) in `updDebris` (30_race.js, `DEB_near`). The debris shot (deb_*.jpg) is a staged burst, not the real 25 % race frame; the GO asserts the scales.
3. Speed gauge `#roamGauge` hidden while `#spRes` / `#results` / `#chRes` show (99ui_hud.js CSS).
4. GOs rev5fix/ath-ground, deb-near, spd-hide live in src/99c7_rev5fix.js (lazy), not 99c_checklist.js: that file sits at 204 789 B and the 200 KB module cap (lint_meta) would fail.
5. Gate on built page: unit 0 FAIL; TAG=rev5fix 4/4; TAG=life1,xf1,terrain,smash2 44/44, 0 errors. Left: no OD_CHANGELOG entry (coordinator adds it at deploy).
