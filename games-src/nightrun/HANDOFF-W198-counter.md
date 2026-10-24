# W198 counter (feints, unblockable heavy slam, flankers): flag OFF, gates NOT met

Part: parts/street/streetcounter.js (`?counter=1` turns it on; default off). Telemetry: S.cn, printed by qa/streetsim.js (BOTS=parry).
What it does: (1) 55-85% of rushers feint (crouch, stand up with a steady amber outline for 0.45 s, then lunge; a guard raised into the fake rests 0.5 s);
(2) every 2nd heavy attack is a slam: 0.9 s wind-up and slam under a steady red outline, the guard does nothing (step in depth or dash);
(3) after 3 guard uses in 10 s one rusher at a time circles Kai along the far depth lane (amber outline) and attacks from behind.

Measured (RUNS=20, same seeds):
| setting | sloppy parry (PJ=.3) clear / hearts | sharp parry clear / hearts | nearest / gfirst / dodge |
| old (counter off) | 100% / 1.6 | 100% / 0.1 | 40 / 65 / 75 |
| this branch (slam every 2nd, counter=1) | 100% / 1.3 | 100% / 0.6 | 60 / 85 / 85 |
| slam every heavy attack | 45-55% / 5.1-5.4 | 0-5% / 6.2-6.4 | nearest 40, gfirst 5, dodge 45 |
Only "slam every heavy attack" meets the parry gates, but it breaks the other bots (none of them step in depth or dash, so they eat every slam).
Feints barely cost the parry bot: ~12 per run, only ~1-2 connect (the rest are shot dead in the pause, or the bot stands on a crate and the lunge passes under).

Left to do: give the dodge/gfirst bots a depth-step or dash answer to the red-outlined slam (then raise C.SLEVERY to 1), re-tune feint rate (C.FP/C.FPG),
run footvis, streetdraw and focus tests (not run), and look at phone + PC screenshots of a feint and of the slam tell (not taken).
