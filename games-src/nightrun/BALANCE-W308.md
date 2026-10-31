# BALANCE W308: GOLD decision gate (branch nr/W308-gold, base nr/W303-integrate). RESULT: gate NOT met; no game constant changed.

Setup: `qa/push-gate.js` STAGES=1,4,6 RUNS=16 PAR=4 (about 2 min a full run on this container). New: env `SEEDBASE=n` (humanbot.js) shifts the seeds so two gate runs can use different seeds.
Noise: the HOLD cell alone moved 56 / 63 / 65 / 71% across runs of identical code (48 runs per cell: +-10 points). One lucky run proves nothing.

| try (constants, waves.js) | CHOOSE vs HOLD clear | PUSH vs CHOOSE-15 | verdict |
|---|---|---|---|
| W303 base (FCD 1.0, FT .6, FN 16, FS 190, GT0 1.5, CLOSE .5) | 48-58 vs 56-63 | PUSH 54-56 | FAIL, FAIL |
| FCD 1.0 -> 0.6 | 48 vs 60 | 52 | FAIL, FAIL (flak is read and dodged: no lever) |
| FT .6 -> .35 | 56 vs 56 | 54 | pass, FAIL |
| FT .35, FN 24, FS 220 | 44 vs 56 | 29 | FAIL, pass |
| + GT0 1.5 -> 2.5 (reused HOLD 56) | 58 vs 56 | 33 | looked 6/6 on one run |
| same, full gate, 4 fresh policies, seed base 0 / 100 | 60 vs 65 / 54 vs 71 | 44 / 48 | FAIL (not reproducible: the W299 pattern) |
| GPK 3, CLOSE .35, GT0 3 | 54-60 | 44-56 | no lever |
| NEW GHP: +1 hull on every GOLD | 85-88 vs 63-65 | PUSH 85-92 | CHOOSE wins, but PUSH too: FAIL |
| GHP only on a clean GOLD (no hull lost since the squad appeared) | 77 vs 63 | 75 | PUSH just as clean |
| clean GOLD from the 3rd / 4th of a stage (GHN) | 58 / 56 vs 63 | 58 / 44 | heal too rare, CHOOSE back to HOLD |
| clean GOLD from the 2nd (GHN 2) + ring FT .3 FN 32 FS 240 FCD .8 | 65-81 vs 63 | 58-77 | best shape: CHOOSE >= HOLD in 5 of 6 runs, PUSH gap only 6-14 |
| GHN 2 + GT0 2.5 / 1.0 / 0.5; FR 240 / 300; heal only at hull >= 2 | 60-81 | 58-77 | gap never held >= 15 in 3 seed bases |
| last candidate, seed base 300 / 400 | 65 vs 71 / 69 vs 60 | 71 / 75 | FAIL |

## What the numbers say
1. Without a hull reward CHOOSE can at best equal HOLD, because it spends hull on the same collisions; HOLD is 100% on stage 4 (an easy stage where pushing buys nothing) so
   the pooled CHOOSE >= HOLD line sits on stage 4 noise.
2. With a hull reward CHOOSE beats HOLD clearly (+10 to +25 points), but the bot that always pushes (PUSH) collects golds at 67-70% and the heal makes its collisions free.
   Flak (ring size, speed, telegraph, cooldown, radius) did not separate them once the heal was on: PUSH reads and dodges, and its real cost is collision, which the heal pays back.
3. The reckless bot needs a cost the careful bot does not pay, not a different number: candidates NOT tried: (a) the bounty squad hits harder when the ship has less than 2 hull (squad speed or fire rate +x while a bounty is live and hull <= 1); (b) GOLD heals only if the kill was made with DASH/EMP ready (rewards the safety net); (c) charger squads inside a bounty always aim at the ship; (d) a per-stage HOLD handicap on stage 4 (it clears 100% and sets the bar).
Not changed: no game constant (waves.js is identical to W303). Changed: humanbot.js (SEEDBASE), qa/push-gate.js (header note).
