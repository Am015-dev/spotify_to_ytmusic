# W273 proof run (branch nr/W273-proof from nr/W272-integrate; base = origin/alex/brave-carson-rbpmlk b18dd91). 30 Oct 2026. No game code changed.
Time-boxed (50 min). Machine: 4 cores. I ran the fps table and the gauntlets at the same time, so the fps numbers are NOT valid (see 1).
SP = /tmp/claude-0/-home-user-spotify-to-ytmusic/c5e52e11-7608-5fef-9486-7b1509e4c411/scratchpad (scratchpad, not in the repo).

## 1. Phone fps (benchmark/playability-probe.js, 390x763, 4x CPU, 60 s, real time) - INVALID, no verdict
Only round 1 of base flight (20.8 fps, p95 133 ms) ran on a quiet machine; the other runs overlapped the flight/foot gauntlets (2-4 browsers).
| mode | build | run1 fps / p95 ms | run2 | run3 |
|---|---|---|---|---|
| flight | base | 20.8 / 133 | 7.5 / 350 | 6.1 / 417 |
| flight | integrated | 9.0 / 183 | 12.9 / 283 | 5.0 / 500 |
| street | base | 10.3 / 267 | 9.4 / 350 | 7.6 / 450 |
| street | integrated | 9.4 / 367 | 10.4 / 317 | 6.7 / 483 |
The spread inside one build (5.0-20.8) is larger than any base/integrated gap: "no regression beyond 5%" is neither shown nor disproved. Re-run alone on a quiet box (about 20 min). Raw: SP/fps/*.json.
benchmark/playability-load.js is a cold-load timer, not an fps tool; the fps tool is playability-probe.js.

## 2. FLIGHT stage 1 (integrated, FOCUS on, qa/gauntlet-flight.js, STEPS=12, WALL=420). Fewer than 8 seeds: stopped at the time limit
| device | strategy | runs done | boss killed + result screen | all 4 lives lost |
|---|---|---|---|---|
| phone (CDP touch) | dodger | 7 | 3 (s4, s5, s7) | 4 |
| phone | shooter | 6 | 3 (s3, s5, s6) | 3 |
| PC (keyboard) | dodger | 3 | 3 | 0 |
| PC | shooter | 2 | 2 | 0 |
Phone 6 of 13 cleared; PC 5 of 5 (small n). 0 page errors, 0 rejections, 0 UI defects in all 18 runs. Result screen showed in every clear. NEXT STAGE stays hidden in focus mode (by design, W270 D1).
"PC never kills the boss" (W270) did NOT reproduce: all 5 PC runs killed it. Not a defect.
Boss killable (SP/bosskill.js, invulnerable ship parked in front): boss appears at game t=122 s with 198 hp, dies at t=158 s. hp only goes down; armour phases pause damage for about 12 s; no hp restore. The runs that failed died first (4 lives lost).
Not run: 8 seeds, base-build flight sweep.

## 3. STREET (qa/gauntlet-foot.js, dodger only, 3 seeds per device, TS=4, MAXREAL=100, run under load)
| device | runs | cleared | died at | kills | furthest x |
|---|---|---|---|---|---|
| phone | 3 | 0 | 88-99 s | 19-23 | 7847 (all 3) |
| PC | 3 | 0 | 69-83 s | 8-13 | 5139 / 7361 / 8062 |
Level length is 11100 (street/foot.js) or 14600 (street/footstage.js): not checked which is live. BIG HEAVY never reached, so no boss hp. All three phone runs end at x=7847, which looks like a fixed point (lock or arena): not investigated. Frame p95 100-667 ms (machine overloaded), so game-time results are pessimistic.
"A player can win" is NOT proven. No stronger bot written (no time); aggressor/idle/random and seeds 4-8 not run. No balance change made.

## 4. smoke.sh: did not finish
fingerprint-test (the first test) printed nothing for 8+ min and the run was stopped; it hangs here. The other tests never ran, so no base comparison.

## 5. Real-input starts (SP/starts.js; mouse click on PC, CDP tap on phone; title -> FLIGHT / ON FOOT)
| device | flight | on foot |
|---|---|---|
| phone | running after 3.1 s | running after 7.2 s (story card skipped by one tap) |
| PC | running after 2.8 s | running after 17.1 s (machine under load; story card skipped) |
0 page errors, 0 console errors in all 4. My loading-message check found no text (selector guess), so "loading message appears" is NOT confirmed here; gauntlet-shell's veil test (W272) covers it. PC keyboard start from the title not tested.

## 6. Shots
Looked at (*) and not looked at, all in SP/shots/: title-phone.png*, title-pc.png, flight-10s-phone.png*, flight-10s-pc.png*, foot-10s-phone.png*, foot-10s-pc.png, pause-flight-phone.png*, pause-flight-pc.png.
Flight boss/result: SP/fl/shots/phone-dodger-4-boss1.png, SP/fl/shots/phone-dodger-4-result1.png, PC in SP/flpc/shots/ (not looked at). Street death/result: SP/foot/*-death.jpg, *-result-down.jpg (not looked at). Street boss: none, never reached. 1440x860 street shot of the boss and the result screens were not looked at.
What is wrong in what I saw:
- Phone flight: ship is about 70 px tall on 763 px and enemies are small against the big buildings; hard to read.
- Phone street at 10 s: no foe in view, empty street, only the caption "Push the stick right"; lower third is dark and flat.
- PC flight: player shots are pink dots that blend into the pink and purple city lights; the two white streaks next to an enemy are unexplained.
- Phone title and pause: clean, nothing overlaps.
Nothing deployed. Open owner decision: focus mode hides NEXT STAGE.
