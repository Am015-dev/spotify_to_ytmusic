# W107 handoff (21 Oct 2026, hard stop 22:06 UTC): Legend + Easy

- Easy: new flag RET.easy2 (parts/legend.js tail, default ON, ?easy2=0 = old Easy): story level offset -.8 -> -.2, pressure every 6 bars (was 10).
  Human-model Easy 92-94% (st 10/20, n=16-24, hits med 1-2), was 100% with 0-2 hits. Normal unchanged 75%.
- Legend (RET.legend, still default OFF): numeric tables now at Hard level (DIFFS row with slower bullets, scale, counter, boss DK, EMP fill .5, first shot 2),
  hull <= Normal (HULL 0), hull drops kept (HPK), gap 120 px, camper read after 2.2 s, beat window .85. Bots n=16: human 13-19% PASS, oracle 19-25% FAIL (35-65),
  beat 94%, no-dash/camper/random 0% PASS, bullets on screen ~16 vs Normal ~10 (+60%), max moving objects 56 (cap 110).
- Left: the oracle gap. Legend-only literal tables still harsher than Hard: fair.js ak/win/tel/dmg/S2 ev (s>=25), anticamp per 1.8, armour T, scale.js mercy 0.
  Try them one at a time (PRE= in legend-test.js works only for window globals; TUNE is not one). Not run in time: balance-test, humanbot, bossplay (timed out at 170 s), endless Legend.
- Suites run (all on Normal/Hard, untouched by this change): timing-test FAIL reflex-dash 79% (<= 70), pacing-test FAIL st5 bars / st12 clear 1/8, endramp FAIL Normal st12 ramp idle.
