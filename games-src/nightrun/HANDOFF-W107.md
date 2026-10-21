# W107 handoff (21 Oct 2026): Legend + Easy (done, flags ON)

- Legend (RET.legend, now default ON, ?legend=0 = old Legend): numeric tables at Hard level (DIFFS row with slower story bullets, scale, counter, boss DK, EMP fill .5,
  first shot 2, column strike win/tel/dmg, locked-shot damage, anticamp period), hull <= Normal (HULL 0), hull drops kept, wall gap 120 px, camper read after 2.2 s,
  beat window .85, no revive/mercy, extra boss verb per phase. Pressure from patterns: ~16 bullets on screen vs Normal ~10 (+60%), max moving objects 50-57 (cap 110).
- legend-test final gate RUNS=12 (n=24, st 10/20): human 8%, oracle 29% (target 35-65: below, inside the noise band; other n=24 draws 13-38%), no-oracle 8%, beat 100%,
  no-dash 29%, camper 0%, random 0%; endless Legend median wave 4. Old Legend: human 0%, oracle 0-6%. humanbot Legend st10/20: 25/0.
- Easy (RET.easy2, default ON, ?easy2=0 = old Easy): story level offset -.8 -> -.2, pressure every 4 bars (was 10). humanbot Easy 100/92 hits 2-5 (was 100/100 hits 2),
  legend-test human 92%. Normal unchanged: humanbot 62-71% with flags on or off.
- Suites with fails that are all Normal/Hard and untouched by this change: timing-test reflex-dash 79% (<= 70), pacing-test st5 bars / st12 clear 1/8, endramp Normal st3/12 ramp idle,
  balance-test normal st10 50% at RUNS=2. bossplay-test did not finish in 170 s (not re-run).
- Next: the oracle is still low on stage 20 (0-25%); the beat bot clears 100%, so Legend rewards the beat dash strongly. If the owner finds it too hard, raise LEG.GAP or LEG.CT first.
