
## r11e (fixer)
- N5 FIXED: TICKERR was TRN_athRecolor (98tr_terrain.js) writing into a colour attribute whose array was already freed after GPU upload; array is re-allocated now. tBoot Athens: 0 TICKERR (was 2/2 runs). tBoot now prints the stack (note: run it as `node tools/perf1/tBoot.js out <ver>`).
- N3: the white upright shapes were Athens traffic scooters (white body + white rider, palette lerped to white). Now 7 colours (SCOOT_COL, 60_city_build6.js); GO r11e/scoot-colour. Not visually confirmed in a shot (no scooter in frame).
- N1: tkEtas() (98tk_city_duel.js): ≥0.5 s between rival ETAs when gaps differ; GO r11e/eta-spread. N4: end-race catch-up .25→.12 (leash left alone, a stronger cap broke pack5#2 River), start grid cleared of all traffic; GO r9a/pack5-warm#1 (Akropolis twice, ath) is a real repro and still RED (rival 254 m ahead at 100 s when the bot stalls in traffic); r9a/pack5 Westend is flaky on bot stalls.
