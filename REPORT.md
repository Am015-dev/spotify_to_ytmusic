# od-scale: real-world scale for free roam (pSC1.py + sc.js)

Owner feedback (iPhone 16): "Humans, the spaceship and cars are huge, so when I turn I hit the buildings all the time." Measured on v82 and fixed.

## Patch order
Base: `alex/od-release-82` @d820164 (phase 2). pSC1.py goes after pDR* (od-drive) and before pSM* (od-seamless):
```
./reapply.sh pAU1.py pAU2.py pOG1.py pOB1.py pOB2.py pOB3.py pOC1.py pCV1.py pCV2.py pRL1.py pJU1.py pRL2.py pGB1.py [pDR*] pSC1.py [pSM*]  → REAPPLY_OK
```
Anchors are listed in ANCHORS.md: 8 one-line edits plus wrapped functions. All the knobs are in one table, `SC_K` at the top of sc.js. Races and the garage preview are unchanged; the scaling applies only in roam.

## Before → after (metres, measured in-game by tSC.js; reference car 4.3 × 1.8, person 1.8, lane 3.6 m in Frankfurt / 3.75 m in Athens, storey ~3.2)
| thing | v82 | now | v82 ratio | now ratio |
|---|---|---|---|---|
| player ship L × W × H | 7.35 × 7.33 × 1.72 | 5.00 × 2.24 × 1.17 | 1.71× / 4.07× car | 1.16× / 1.24× car |
| ship width / lane | 7.33 m | 2.24 m | 2.0 lanes (Fra) / 1.95 (Ath) | 0.62 / 0.60 lane |
| collision hull | one 4.4 m circle | 3 circles, 2.3 × 5.0 m box | — | matches the mesh |
| boat / 4×4 mode | 11.05 × 4.6 / 4.74 × 4.59 | 7.52 × 2.34 / 3.22 × 2.34 | | |
| garage-built car + driver | scale with the ship (they live in `userData.m`) | same | | |
| traffic sedan (L × W) | 4.6 × 1.95 * | 4.6 × 1.95 | 1.07× / 1.08× | unchanged |
| traffic van/police/delivery/truck width | 3.45–3.68 | ≤ 2.1 | 1.9–2.0× | ≤ 1.17× |
| pedestrian height | 2.6 | 2.0 | 1.53× person | 1.12× |
| quest / passenger minifig | 6.8 | 2.0 | 3.79× person | 1.11× |
| chase camera (stopped) back / height | 14 / 5.0 | 9.9 / 3.6 | car length / distance 0.53 | 0.51 (same framing) |

\* The release-82 base already shrank some km cars (sedan, taxi, suv). sc.js now only shrinks cars to caps (width 2.1 m, length 4.9 m, vans 5.9 m, trucks 6.6–7 m), so cars that are already the right size stay as they are.

The ship's wings fold to the pod line in roam (stock wings, fins and kit wings), and the whole ship is scaled ×0.68 (width ×0.75 more). The hover gap, ground glow, shadow and shield scale with it. Sprint rivals get the same treatment. Turning rate, top speed and acceleration are unchanged. The camera presets in RCAM and the juice camera drop and pull limit (ju.js) are scaled ×0.72, so the car fills the screen as it did in v82. FOV is unchanged. The near-miss band in ju.js moved from 4.8–8 m to 2.9–5.5 m to fit the narrower cars. Car hit boxes are ownerbugs' OBB (OB_HW/OB_HL 1.25 × 2.45), which already match the new 2.24 × 5.0 m car.

## 90° corner bot (tSC.js)
8 real 90° street corners per city, each with buildings at the corner, found on the GPS street graph. A keyboard bot (pure pursuit) holds the speed through each corner. The test counts building bounces and corners where the visible car outline overlapped a building. "Before" is the same build with SC off before roam loads, which is exactly the v82 sizes, collision and camera.
| city | speed | v82 bounces / clipped corners | now |
|---|---|---|---|
| Frankfurt | 15 / 20 / 25 m/s | 0/0 · 0/0 · 0/0 | 0/0 · 0/0 · 0/0 |
| Athens A | 15 / 20 / 25 m/s | 0/1 · 0/1 · 9/3 | 0/0 · 0/0 · 1/1 |

## Tests (unsplit build; split build boot checked)
| test | result |
|---|---|
| `node tSC.js .` | TSC PASS 27/0 (sizes, lane ratio, hull, corners at 15 and 20 m/s, 25 m/s no worse, camera framing, 0 errors) |
| `node smoke.js .` | SMOKE PASS 12/12 (smoke/sheet.png) |
| tools/tBA.js | ALL PASS 30/30 |
| tools/tBF.js | 9/1: BF3 is the known harmless terrain failure, the same as on release-82 |
| tools/tOut.js on `split_km.py` output | OUTBOOT PASS (km blob loaded, car drives, 0 errors); page 1,769,892 + km.js 1,961,521 bytes |

Screenshots (phone landscape 1000×460 @2x = 2000×920, same spot): `scale/fra_before.jpg`, `scale/fra_after.jpg`, `scale/athA_before.jpg`, `scale/athA_after.jpg`. Raw numbers: `scale/table.json`.

## Known gaps
- Athens at 25 m/s (90 km/h) through a tight 7.5 m street corner still clips 1 of 8 corners (v82: 3 of 8, with 9 bounces).
- Top speed in the city is unchanged (~50 m/s flat out). The smaller car makes speed feel higher. Not retuned, because the mission timers depend on it.
- Race mode ships (48 m tracks) and the garage preview keep the old size on purpose.
- The `!` sprite over quest minifigs scales with them (now about 0.8 m). The mark beacons still show from afar.
- Not yet tested together with pDR (od-drive). pSC1's anchors don't touch traffic density, breakables or the HUD.
