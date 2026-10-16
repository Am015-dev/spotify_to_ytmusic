# HANDOFF stuck-1 (2026-10-16)
- Monkey stuck on built page out/stuck1: Fra 0/23.6 min, Ath 5/23.8 min = 0.21/min (before fix 0.38-0.46/min). Fix is in tools/qa/monkey_page.js only: gas must be held the full 3 s window; traffic car within 7 m = jam (log.jam).
- Every record replayed (6 m back and exact spot) drives away 17-118 m: no collider/terrain cause, so no game code changed. Recurring Athens spot x -2466, z -1512 (beside a 19 m house) still shows up, 3 of 5.
- Unit 0 FAIL (4674 pass, 13 known). NOT done: two combined TAG=rv2k runs and the before/after shot (no game change, timebox); Athens needs 2 pages at once to load, run Fra and Ath monkeys one after the other.
- Left: combined TAG=rv2k x2 verdicts; look at the Athens -2466,-1512 spot.
