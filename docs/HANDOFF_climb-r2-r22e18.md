1. GO clb/climb passes BOTH lines now (36 deg top in 2.1 s, 37 deg/28 m line top in 3.2 s, max 41 deg, wall 0 m): no crest change was needed, so none was made.
2. tools/bughunt.js got `--q <query>` (extra URL query, e.g. `--q clb=1`), used for the A/B.
3. Measured fra, 3 paired runs (seeds 40/80/120, 65-67 sim min each): hill+offroad slides clb=0 9 (0.14/min) vs clb=1 23 (0.35/min) = WORSE; yJump 2 vs 29 (28 in one run), launch 6 vs 9, wallClimb 0/0. All slides 130 vs 99 (-24 %), short of the -40 % bar.
4. Decision: ?clb stays default OFF (kill switch unchanged), ath bughunt not run. Bar not met, yJump rose.
5. Next: find the yJump cluster of clb run 3 (seed 120) before another try; per the 2-lane rule this target needs a design plan or should be dropped.
