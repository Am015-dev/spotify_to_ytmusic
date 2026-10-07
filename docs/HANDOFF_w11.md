# Worker 11 (2026-10-07): evidence for the W10 fixes (brake twitch, traffic contact). No game code changed vs W10 631b589.
Probe: `tools/tW11.js` (TEST=wall|tyre|turn|slalom|side, FAST=1, phone 852×393, real CDP touch). Live = src ae536f3 (re-split v87j, byte-identical to live index.html), built in a worktree.
Files: docs/shots/w11/ (live_* vs w10_*; tPlay logs; JSON).

## 1. Athens tPlay (FAST=1, phone, MIN=1, 3 runs per build)
| run | live stuck % / avg km/h / walls/min | w10 stuck % / avg km/h / walls/min |
|---|---|---|
| 1 | 12.8 / 35.2 / 1.75 | 12.8 / 35.7 / 1.75 |
| 2 | 12.8 / 34.8 / 1.75 | 12.8 / 35.6 / 1.75 |
| 3 | 12.8 / 41.5 / 1.75 | 3.8 / 55.1 / 4.38 |
| mean | 12.8 / 37.2 / 1.75 | 9.8 / 42.1 / 2.63 |
The 12.8 % is the same Athens-start stall on both builds (pre-existing). W10 is not stuck more than live, so no extra UNSTUCK rescue was needed.
## Wall + hold GAS (20 km/h start, 5 m from a building wall, GAS held 5 s after contact; 3 walls × head-on/25°)
Both builds: every contact frees itself; max pinned (< 5 km/h) 0.33–0.35 s, the wall slide turns the car 45–90° and it drives off at 50–67 km/h; UNSTUCK never needed (live and w10 alike).
## 2. Per-tyre clearance (tyre bottom = wheel centre − r·scale, after a real render; the wheel clamp runs in onBeforeRender, which is why W10's FAST bbox probe read −0.14)
Game ground (gnd ray from 0.6 m above each tyre): 0.030 m on all 4 tyres, city / Autobahn / at 100 km/h / after a stop, live and w10 identical.
Visible road mesh ray, city: 0.012–0.031 m (live 0.012–0.027). Traffic wheels: 0.04 m both.
PRE-EXISTING (live too, not W10): on the Autobahn the road ribbon mesh is 0.33–0.39 m ABOVE the tyre bottoms (gnd follows the terrain, the ribbon sits higher) → cars look sunk into the Autobahn. Owner: world/art.
## 3. Drive feel (real touch)
90° right turn at a city junction: turned 94–96°, max slip 0.4° both, camera lag 0.08 s both. Slalom at 70 km/h on the Autobahn (traffic direction, no WRONG WAY): max slip 0.3° (live 0.3°), heading swing 15° (live 23°).
