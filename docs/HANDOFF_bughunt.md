# HANDOFF bughunt (2026-10-22)
1. Commit: tools/bughunt.js (new gate) + docs/BUGHUNT_x1000.md + docs/shots/bughunt/ (10 shots, hunt.json with every hit and repro). No game code.
2. Gate: `node tools/bughunt.js --hours 2 --city fra` = one PASS/FAIL line per detector in 4 min 17 s (build included); covers ~17 sim-min, the INFO line says so.
3. Measured: 3.8 clean sim-h (fra 2.17 h, ath 1.59 h). Strict score 11/100. Worst/h: fra hill slope slides 71, ath stuck ladder 32, ath UNSTUCK 13.8, ath NPC sideways 15-31 m/s 8.2.
4. x1000 impossible here: the game frame is 20-27 ms of JS with no rendering (streets step ~11 ms), so ~4x real time per page. The first 28 h fra run was discarded (fast-travel loader froze the game while sim time counted; fixed).
5. Left: fix-first lanes 1-5 in docs/BUGHUNT_x1000.md section 4; then re-run the full hunt (--hours 20 --city both --budget 1900) and compare per-hour rates.
