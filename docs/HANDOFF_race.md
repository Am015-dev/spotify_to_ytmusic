# HANDOFF race (race worker, 2026-10-09): "the races are boring" → NOW: wide open race courses

## >>> READ FIRST (RO5 finisher, 2026-10-09 ~18:40; HEAD 4a80ce9+)
- RO5 done: terrain dressing (tree line, bushes, tufts, flowers, Athens cypresses), painted route arrows at each fork + 1.6x SHORTCUT sign, smaller island trees. All in `src/98ro_open.js` (OPN_build).
- Gate side-by-sides `qa_race/ro5/sbs/1..8` (force-added) sent to the coordinator; waiting for its OK → then REVIEW → DEPLOY.
- tRace (final build, ro5f, fast=1 → 1 lap): fra 2/8, ath 6/8; 0 wall/min, 0 errors, vis2 94.5/100 %, AI alt share 50/29 %.
- Placed-shot envs: `qa_race/ro5g/gate_*.env`. Do NOT place AI by o.dist (they vanish); use tRace shots for the pack. A 5-frame setup hides the car in the transform effect; use ≥40 frames.
- DEPLOY: merge origin/alex/od-stream (live v89e bd26d579) first, then take the next free letter (garage may take v89f).

## >>> READ FIRST (open-course builder session, 2026-10-09 ~18:30; HEAD = this commit)
- NEW module `src/98ro_open.js` (ORDER: after 98rf, before 99_api). Prefix `OPN_` (`RO` is the roam state!). Two courses, both in the RACE menu:
  `fra_ufer` "Riverbank Rally" (Frankfurt tab) and `ath_akti` "Coast Rally" (Athens tab). Built on race entry by a `loadTrack` wrap (no city build, no download).
- Design: ribbon W=96 (HALF 48, MARGIN 46.5). Road |x|≤7.2 (yellow centre line). Terrain by sector (`def.ro.ter`): grass/dirt/sand → 4×4 (top ×.9/.93/.86), cobble → car (×.97).
  Routes (`def.ro.routes`, cp index a→b, side = inside of the bend): an island at |x| 9–14 with rounded noses (`OPN_b` lateral limits), lane beyond = dirt (4×4) or water (boat), lane top ×1.1, boost pads (`OPN_pads`).
  Cliffs (`def.ro.cliffs`, outside of the bend): no wall past the lip (lip 20 m, tapers to the edge over 70 m); past it → `OPN_fall` (air fall) → after 1.4 s `crashJump` (dead 1.6) → respawn x=0 at the same dist (place kept). Banner: "OFF THE CLIFF! SPAWN IN 3 · TAP" (tap or R = now; wraps RF_rsp/RF_rspNow).
  Jumps: def.jumps `pit` full width (gap 40–44 m) with a hazard kicker. Grid: 4 wide, player last. No civilian traffic, forward only.
- Tests: `tools/tOpen.js` (start via startRace, placed shots: env SHOTS="name~frames~setup~cam@@…", HOLD, INFO, RUN). Shot envs: `qa_race/ro1/shots_fra.env`, `shots_ath.env`.
  tRace prints `open{vis2Pct,plRoutes,aiByRoute,aiRouteShare,respawnsPl,cliffFallsPl/AI,offRoadPct,waterPct,seg}`; env ROUTE=road makes the bot skip the alt routes (`window.__roAlt=false`).
  Solo route timing: `qa_race/ro3/seg_run.js` (RUN= for tOpen; scripted steering through each route road vs alt, real physics, render off).
- Measured (ro2/ro3, 1 lap, phone, real touch): 0 errors, 0 wall hits/min, rivals ≥2 on screen 100 % of the time, bot used both alt routes, AI took alt routes 21–43 % of route-laps, tyre p50 road −0.01 / dirt 0.00–0.01 / boat hull 0.15, tris 0.93 M vs city 1.0–1.19 M, calls 135 vs 185–220.
- Verified in a browser: cliff fall → respawn (fra + ath), STUCK! SPAWN IN 3 banner. WRONG WAY cannot happen: race physics caps the heading at ±1.5 rad (cos > −0.1). Upside-down: no roll in race physics; wrecks already go to the respawn banner. Deep water without the boat: n/a (auto boat).
- Route tuning DONE (RO4): lane factor `r.kf||1.2` (fra water kf 1.45). Solo timing (qa_race/ro3/seg_run.js, alt vs road): ath water −0.70 s, ath dirt −0.49, fra dirt −0.65, fra water ≈−0.4 (its road baseline read 10.17 twice, then 11.18 once: unexplained). tRace with the pack NOT re-run since the tuning.
- Coordinator FYI: live is v89d (src alex/od-p2 08f37b5e): merge it before DEPLOY; the version is assigned then.
- Visual nits seen: grass reads as a flat carpet in some shots (blotches added in RO2, not re-shot); cliff lip has a red/white kerb (not re-shot).
- NEXT: (1) re-run tRace both courses (LAPS=2, MAXMIN=7) and placed shots (`env $(cat qa_race/ro1/shots_fra.env) node tools/tOpen.js URL qa_race/roN`; TRACK=ath_akti with shots_ath.env) and LOOK, (2) gate shots next to refs (`tools/sideBySide.py out ours ref caption`): start pack, wide terrain, shortcut, water/boat, jump, cliff respawn, finish → coordinator FIRST, (3) REVIEW, (4) DEPLOY msg (OD_CHANGELOG + checklist items).

## >>> READ FIRST (finisher session, 2026-10-09 ~16:50; HEAD = this commit)
- The scope changed at 16:34. Alex scored the narrow city races 2/10. The coordinator's brief is in `docs/RACE_PLAN.md` §3: open courses, 3-vehicle swap, respawn, rivals on alt routes, gate shots next to the reference. **Do not ship the narrow version.**
- Done this session:
  - Reviewer FAIL fixes (all 3 carry into the new build):
    - The checklist chip is parked under LAP while racing and hidden only during the FINISH text.
    - On the results card the chip sits at the top-right (clear of the studs line).
    - The ▲ place pop sits 8 px left of ⚙. The old check used offsetParent, which is null for fixed elements.
    - Verified at 852×393 in `qa_race/rf7` (grand_mid/end/results, akro_results).
  - RF8 respawn banner `#rfRsp` (98rf_race_fun.js tail). NOT yet run in a browser: test it first, with a wrong-way U-turn and a stopped car.
- Still owed for release (reviewer item 1): an OD_CHANGELOG entry (next free version at deploy) + 3 OD_CHECKLIST items (start 8th → can reach top 3; boost refills, faster behind a rival; podium on results) + items for the open course/respawn.
- tRace on the narrow tracks (rf5/rf6/rf7) gave bot places of 3–8/8: the bot loses ~200 m to crashes/slow water. near20 50–82 s, 11–26 place changes, dead ≤16 s, tyre p50 0.000–0.003 m, 0 errors. It's noisy; don't tune further for narrow tracks.
- NEXT (in order):
  1. Build the open course per RACE_PLAN §3.2. A def with `open:1,w15:96` and its own RO_build ground/scenery instead of buildCity, plus a surface-by-x hook in R15_ter. Start with `fra_ufer`.
  2. Respawn on a cliff fall.
  3. AI inside-terrain routes.
  4. `ath_akti`.
  5. tRace metrics (≥2 rivals on screen %, route choices, respawns).
  6. Side-by-side shots vs `docs/race_ref` → coordinator → REVIEW → DEPLOY message.
  Write a handoff at ~120k context.


- Branch: `alex/od-race`, draft PR #78 (base `alex/od-cam`).
- It started from live src v89b1 (alex/od-cam 72822916); `tools/verify_live.sh` gave LIVE_MATCH.
- Coordinator: session_017iH3DB4VyxwKSdMwsco4Ut. Reviewer: session_01Y6FYerWwxv43FuKUcaUT4v.
- Workers never deploy. **Version:** v89c is taken by streaming; at DEPLOY time take the next free letter after the newest live OD_CHANGELOG entry.

## Reference (read `docs/RACE_PLAN.md` §0 for the trait table)
- The video download was blocked (YouTube bot check).
- Storyboard: 65 frames, ~4.7 s apart, via `yt-dlp --js-runtimes node --extractor-args "youtube:player_client=web_safari" -f sb0`. Then curl the signed `Content-location` URLs from the .mhtml (the email-parse route corrupted the jpgs).
- Frames in `docs/race_ref/`:
  - `hd_countdown_8th_pack.jpg`, `hd_intro_card.jpg`, `hd_jump_wrongway_lap3.jpg`, `hd_finish_crowd_podium.jpg` (1280×720);
  - `01_intro_card` … `11_results_prizes` (tiles ×4);
  - `storyboard_0..2.jpg`.
- Key traits:
  - the player starts 8th at the back and climbs to 1st in ~25 s of racing;
  - boost jets in ~60 % of frames;
  - the pack stays close (lap 2 drops to 6th, then back);
  - the countdown camera sits beside the car;
  - the finish has an orbit cam, RIVAL BEATEN!, and a podium crowd.

## Code (all in `src/98rf_race_fun.js`, listed in ORDER before 99_api.js, plus 3 one-line hooks)
- `30_race.js` stepSim: the race rubber band is now `s.rubber=RF_rub(s,gap,ld)`.
- `30_race.js` physAI: `aiLat*=RF_lat(s)` (rubber² on AI grip, so the band also acts in corners; before, it only scaled top speed).
- `99c_checklist.js` pinCd: the checklist strip folds to its chip during the countdown, the race and the finish (it covered the FINISH banner).
- RF module:
  - The grid puts the player LAST, the best AI on pole (`RC.type==='race'` only).
  - `RF_rub`:
    - AI ahead of the player by more than 30 m: up to −20 % at 230 m, 50 % of that after 70 % of the race.
    - AI behind: up to +9 % at 240 m, fading to 20 % of that over the last 25 % (no stolen wins at the line).
    - Plus up to +3 % toward the leader.
  - ▲/▼ place pop under `#pos` (`#rfPop`, 22 px, 1.3 s).
  - Countdown cam swing (nose → behind the car). Finish orbit cam.
  - Results: top-3 podium strip (`#rfPod`) + RIVAL BEATEN!/RIVAL AHEAD in rival races.
  - Player boost refill in races: +3/s passive, +10/s in a rival's slipstream (4–30 m behind, |dx|<7).
  - Probe: `window.__rf.st()`.
- `tools/tRace.js`:
  - RACE_RESULT `fun{near20s,near50s,jumps,airSec,boosts,items,placeChanges,deadStretches,deadSec}`;
  - `RESSHOT=1` shoots the results screen after the finish.

## Numbers (tRace phone, real touch, 1 run per track; place every 10 s)
| build | grand | hafen | akro (Athens) |
|---|---|---|---|
| base (live) | pole→led 75 %, fin 2/8, near20 37 s, dead 24 s | fin 5/8, near20 36 s | led, then 1→6 in last 20 s, near20 60 s |
| rf1 (back of grid) | 6→1 by 40 s, then alone 100–290 m ahead, fin 1/8 | fin 5/8 | stuck 8th 60 s, leader 500 m ahead, fin 4/8 |
| rf2 (+corner rubber) | 8→1 by 50 s, fin 1/8, near20 46 s | fin 8/8 | fin 4/8 |
| rf3 (−20 % hold) | fin 3/8, near20 33 s | fin 7/8, near20 73 s, 25 place ch, dead 0 | fin 7/8, near20 88 s/120, 29 place ch, dead 0 |
| **rf4 (+boost refill) = current HEAD** | 6→3 by 40 s, 1st from 100 s, fin 3/8 (place at the probe after the line), near20 48 s, 18 place ch, spread at 90 s 215 m | 7→3, fin 3/8, near20 48 s, 25 place ch, dead 0 | 4→2, fin 2/8, near20 79 s/115, 23 place ch, dead 0 |
- Reading: rf3 gives close racing (near20 up to 73 % of the race, no dead stretches), but the tRace bot finishes 6th–8th on hafen/akro.
  - The bot only holds a line and never steers out to overtake, so it is stuck in the pack. A human overtakes.
  - Don't over-tune to the bot. The target is a decent human reaching the top 3 and fighting for 1st.

## Left (exact next steps)
1. rf4 looks right (the bot climbs from the back to the top 3, fights all race, no stolen wins). Confirm with a 2nd run per track (1 run is noisy). Only if the bot ends 7–8th again: add an overtake swerve to the tRace bot (steer ±6 m when a car is 5–25 m ahead within 4 m sideways) so it behaves like a person. Then re-run before touching the tuning again.
   Command: `for t in fra:grand fra:hafen ath:akro; do CITY=${t%%:*} TRACK=${t##*:} LAPS=9 MAXMIN=6 SHOTS=0 TAG=${t##*:}_ node tools/tRace.js http://127.0.0.1:8766/local_dbg.html qa_race/rfN > qa_race/rfN/${t##*:}.log & done`
   Setup: `python3 -m http.server 8766` in the repo root, then `tools/build.sh rfN --local`.
2. LOOK at shots still unchecked:
   - rf1 shots exist for start/mid; the countdown cam was seen working (front view of the car + minifig);
   - not yet seen: the finish orbit (`*_end.jpg`), the results podium (`RESSHOT=1`), the ▲ pop;
   - an iframe and a PC 1280×720 check.
3. Full review shots: `HQ=1 R17SHOTS=1 RESSHOT=1` per track. These give the grid, mid pack, boost, side_low (player + AI low side view), tyreRay (tyre gap ≤ 0.05 m), end, and results.
   Send `REVIEW alex/od-race <commit> <shots>` + tyre gap to the reviewer. Include 2–3 `docs/race_ref` frames next to our shots.
4. After the PASS:
   - merge the latest live src branch and rebuild on CURRENT live HEAD;
   - write the OD_CHANGELOG entry (next free letter) and a checklist item (99c OD_CHECKLIST: "start a race: you start last, catch the pack, boost fills faster behind a rival, the leader is catchable, and nobody passes you in the last seconds unless you slow down");
   - `tools/build.sh <ver>`, `git add -f out/<ver>`, push;
   - send the coordinator `DEPLOY alex/od-race <commit> out/<ver> <msg>` + 3 bullets + shots.
5. Not done, ideas ranked in RACE_PLAN §2.7: checkpoint gates with split gaps, a bigger ordinal position HUD, a crowd podium in the world.

## Gotcha
- Never wait with `pgrep -f tRace.js` inside a backgrounded bash: it matches its own command line and never ends. Use `ps aux | grep "node tools/tRace" | grep -v grep`, or `wait` in the same shell.
