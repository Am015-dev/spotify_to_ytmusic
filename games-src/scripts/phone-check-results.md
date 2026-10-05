# Phone check results

Generated 2026-10-05T06:36:49.467Z by games-src/scripts/phone-check.js (mobile Chromium, DSF 3, touch). Scenarios: 390x763, 375x553, 844x390, P>L, L>P, stale. Screenshots: games-src/scripts/phone-check-shots/<game>/<scenario>.png

| game | 390x763 | 375x553 | 844x390 | P>L | L>P | stale | errors |
|---|---|---|---|---|---|---|---|
| crown-city-smash-next | PASS | PASS | PASS | PASS | PASS | PASS | none |
| nebula-aces-next | FAIL: slow 869ms | PASS | PASS | PASS | PASS | PASS | none |
| rampart-and-vine-next | PASS | PASS | PASS | PASS | PASS | PASS | none |
| sands-of-qamar | PASS | PASS | PASS | PASS | FAIL: crash: touchscreen.tap: Target page, context or browser has been closed | FAIL: timeout (3 min game limit) | none |
| shipwreck-isle-next | PASS | PASS | PASS | PASS | PASS | PASS | none |
| short-fuse-next | PASS | PASS | PASS | FAIL: slow 860ms | PASS | PASS | none |

## Detail (moves, median tap latency)

**crown-city-smash-next**
- 390x763: PASS (6mv, 154ms)
- 375x553: PASS (6mv, 115ms)
- 844x390: PASS (6mv, 167ms)
- P>L: PASS (9mv, 154ms)
- L>P: PASS (9mv, 162ms)
- stale: PASS (9mv, 130ms)

**nebula-aces-next**
- 390x763: FAIL slow 869ms (6mv, 179ms)
- 375x553: PASS (6mv, 152ms)
- 844x390: PASS (6mv, 233ms)
- P>L: PASS (9mv, 169ms)
- L>P: PASS (9mv, 154ms)
- stale: PASS (9mv, 178ms)

**rampart-and-vine-next**
- 390x763: PASS (6mv, 133ms)
- 375x553: PASS (6mv, 149ms)
- 844x390: PASS (6mv, 140ms)
- P>L: PASS (9mv, 117ms)
- L>P: PASS (9mv, 142ms)
- stale: PASS (9mv, 141ms)

**sands-of-qamar**
- 390x763: PASS (6mv, 369ms)
- 375x553: PASS (6mv, 322ms)
- 844x390: PASS (6mv, 334ms)
- P>L: PASS (9mv, 281ms)
- L>P: FAIL crash: touchscreen.tap: Target page, context or browser has been closed (7mv, 369ms)
- stale: FAIL timeout (3 min game limit)

**shipwreck-isle-next**
- 390x763: PASS (6mv, 167ms)
- 375x553: PASS (6mv, 172ms)
- 844x390: PASS (6mv, 151ms)
- P>L: PASS (9mv, 154ms)
- L>P: PASS (9mv, 146ms)
- stale: PASS (9mv, 135ms)

**short-fuse-next**
- 390x763: PASS (6mv, 126ms)
- 375x553: PASS (6mv, 177ms)
- 844x390: PASS (6mv, 268ms)
- P>L: FAIL slow 860ms (9mv, 175ms)
- L>P: PASS (9mv, 170ms)
- stale: PASS (9mv, 164ms)

