# HANDOFF r1 (R1 quick polish → v88b), 2026-10-08

Branch `alex/od-r1` (PR #66, draft, base alex/od-src). Source = v88a (merged alex/od-bug23; `tools/verify_live.sh` = LIVE_MATCH 010e09f before edits).
Commits: fad2cd9 (R1 code + probes + after-shots), next (before-shots qa_r1/base, this doc).

## Done (src/)
1. Race mood: `30_race.js` menuMood default 'brick' (+ one-time migration key `r1_mood` resets a stored 'night' once); setupRace fallback 'brick';
   `10_core.js` RIVAL_EV ROSSI mood 'brick'. Career e1 "After Hours" (night story) untouched.
2. Stat chips: `10_core.js` gbRender bar() → chips −3…+3 (R1_chip: 1 step ≈ 4 % vs team base) as 6 pips + "+2" pill; weight badge R1_weight(bricks.length),
   thresholds 0/40/70/110/160/230 = SUPER LIGHT…MASSIVE (unverified vs real build sizes, check in garage shot). No garage module (92–98*) touched.
3. Athens lamps: `60_city_build.js` kmProps: CID==='ath' → lamp geo scaled 7.43→5.5 m, cloned material darkened (#5a5a52). `90_fixes_cv_ju.js` OC_RANGE lamp Athens [4.5,6.5] target 5.5. Measured h=5.5.
4. Buggy swap: `85_audio_feel_sp_otg.js` FL_VEH dirt:'ship' (was 'offroad'). Repro before: road→dirt at 107 km/h swapped to offroad (FL.log). After: no swaps, stays ship. Water→boat kept (car can't drive on water); 4×4 = manual pick only.
5. HUD slot: new `src/91_r1_polish.js` (in ORDER before 99_api): #npcSay (Hilde radio) and #roamTut share top-centre slot, top 80px phone / 84px desktop, hidden tutorial while radio up; compact card. Measured phone: card y 80–156, car y≈293, no overlap with touch controls/boost bar. Also chip CSS.

## Tests (local build r1dev, 852×393 touch)
- `tools/tR1.js <url> <out> fra|ath touch` (GRASS=1 for the grass run): shots qa_r1/base (v88a) vs qa_r1/new. No console errors.
- `tools/tR1b.js <url> <out>`: menu → quick race start shot + mood, garage stat box shot. RUNNING at handoff (output: qa_r1/new/race_start.png, garage_stats.png).

## Todo
- Look at race_start + garage_stats shots; tune weight thresholds if badge looks wrong. Desktop (non-touch) check of the HUD slot.
- tPlay once on the split build (item 4 = driving): `node tools/tPlay.js http://127.0.0.1:8766/local_dbg.html qa_r1/tplay` (FAST=1), background.
- Tyre gap ≤0.05 m measurement; REVIEW to session_01Y6FYerWwxv43FuKUcaUT4v with shots (race start, stat chips, Athens lamps + boost bar, grass at speed, Hilde card).
- After PASS: rebuild on CURRENT live HEAD (verify_live), prepend OD_CHANGELOG v88b, tools/build.sh v88b, copy tune.json + music/*.mp3 from live, push out/v88b, send coordinator DEPLOY.
