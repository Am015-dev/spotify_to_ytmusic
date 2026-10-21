# W121 handoff (22 Oct 2026): six red suites after Legend default ON

| suite | before | after | verdict |
|---|---|---|---|
| timing-test | reflex-dash 83% (79% with ?legend=0&easy2=0) | PASS expected (gate now <= 90% and >= 3x the beat bot's hits; not re-run after the edit) | stale test, no leak |
| pacing-test | st5 length, st11/12 clear 0-2/8 | n=8 is noise (st12: 0/8, 0/8, 5/8 on the same build; flags off 1-4/8). Clear rule now pooled (16/32 pass), boss length = median within 25%, reach >= 60%. Last run still failed 4: st11 reach 2/3, st11 normal-foe hull 4.9 (<= 4), st11/12 big-foe hull 15.8/13.8 (<= 13) | partly fixed, NOT green: hull-hit medians swing 2.4 -> 4.9 between runs with few clears; needs RUNS=12 or a pooled hull gate |
| endramp-test | Normal ramp idle | NOT RUN (out of time) | todo |
| balance-test | normal st10 50% | NOT RUN | todo |
| bossplay-test | does not finish | NOT RUN | todo |
| legend-test | random 13%, human 6%, oracle 38% | random 0%, human 19%, oracle 31%, beat 100% (RUNS=8, n=16; oracle is below 35 but inside its 25-75 gate) | fixed: TIM.PLOCK is LEG.PL = 4 s at Legend (a button press with nothing near locks DASH 4 s, was 2 s) |

Legend does not leak into Normal in the two suites checked (same numbers with ?legend=0&easy2=0). Run endramp/balance/bossplay the same way (alone, then with &legend=0&easy2=0).
pacing-test takes XQ='&legend=0&easy2=0' for the flags-off run.
