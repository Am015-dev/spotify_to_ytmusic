# HANDOFF race (race worker, 2026-10-09): "the races are boring"

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
