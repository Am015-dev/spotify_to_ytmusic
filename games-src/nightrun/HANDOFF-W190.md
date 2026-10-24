# W190 foot run / solid foes (hard stop 15:35 UTC, 24 Oct 2026)
Branch nr/W190-run, flag RET.footrun, OFF by default (?footrun=1 turns it on; the test passes it).
Done: parts/street/footrun.js (moving foe always shows run/walk, white hit flash <= 0.09 s, stand still against a wall), streetfeel.js (backing away plays the cycle in reverse), streetlook.js (steady wind-up glow), qa/footrun-test.js.
Result: qa/footrun-test.js SECS=60 on the build before the last merge: 55 PASS, 0 FAIL so far, relay skipped (no sheet); the run had not finished at the hard stop (final line not seen).
NOT run: footvis-test, streetsim RUNS=100, streetdraw, focus, guard.py, phone and PC screenshots, a rebuild after merging W191/W194 parts.
To do: run those gates, then flip the default (RET.footrun=!/[?&]footrun=0/) in footrun.js.
Left: rusher lunge still glides in one held melee pose (needs art or a leap); death fade of a corpse is not solid; idle cross-fade belongs to W194; flyers have one hover sheet.
Note: stride check compares speed with a stride estimated from the sheets (2 x foot spread, FOOT.FEEL.ST), so it proves the cycle follows the ground, not the feet themselves. The review's "heavy 0.3 body heights per cycle" did not reproduce: measured about 1.3 (streetfeel already ties frames to distance).
