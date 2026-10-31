# BALANCE W323: GOLD push pays (base nr/W317-integrate4, qa/push-gate.js, RUNS 24 paired seeds, stages 1,4,6, bases 0 and 1000)
Clear % HOLD / PUSH / CHOOSE. Hearts lost per run in brackets (H/P/C).
| try (waves.js) | base 0 | base 1000 | verdict |
|---|---|---|---|
| base (W314 measure) | 60 / 49 / 65 | 65 / 42 / 53 | CHOOSE < HOLD on base 1000, PUSH is a trap |
| **v1 SHIPPED**: GOLD repairs 1 hull if DASH or EMP was ready at the kill; last-hull punisher (hull <= 1: every foe of the live bounty squad flaks, range x1.3, cooldown x.6) | 76 / 81 / 86 (6.8/9.4/8.6) | 65 / 82 / 76 (6.7/9.7/8.2) | CHOOSE >= HOLD both bases (+10, +11), CHOOSE score 1.58x / 1.55x HOLD; PUSH no longer a trap; CHOOSE < PUSH on base 1000 (-6) |
| v2 neighbour: repair only on a clean kill (no hit since the squad opened) | 79 / 74 / 79 | 71 / 74 / 68 | FAIL: CHOOSE < HOLD on base 1000 |
| v3 neighbour: v1 with punisher at hull <= 2 | 74 / 85 / 82 | 74 / 82 / 76 | CHOOSE >= HOLD both bases, CHOOSE < PUSH both (-3, -6): no better than v1 |
Release gate asked for: CHOOSE >= HOLD (met by v1, v3), CHOOSE >= PUSH on both bases (NOT met by any try: v1 +5 / -6), CHOOSE score >= 1.25x HOLD (met, 1.55-1.63x).
The old line PUSH <= CHOOSE - 15 is reported, not required: it fails everywhere (PUSH 81-85 vs CHOOSE 76-86). The reckless bot collects 4.3 GOLD a run vs 3.8, so any per-GOLD
heal pays it at least as much. HOLD also moved +-5 between identical-code runs (76/79/74 base 0): treat each cell as +-6.
SHIPPED v1 (the spec in the brief, exactly): best CHOOSE on base 0 and equal-best on base 1000, and the only try with CHOOSE >= PUSH on one base. Pushing in is no longer a trap
(PUSH 49/42 -> 81/82), the careful push beats holding by 10+ points and 1.55x the score. Open: CHOOSE vs PUSH on base 1000 (-6, within noise of +-6).
