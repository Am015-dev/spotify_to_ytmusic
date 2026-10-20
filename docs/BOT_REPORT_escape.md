# Escape bot report (bot/escape, escape-r21h2: stateless trapped test)

## Root cause of the two failed reviews
1. The ladder ran on timers and an anchor (`E.age`, `E.ax`, the 8 s bound `E.t0`), so a lift could fire on a frame where the car was really moving: the age had been built up earlier, and the clears only looked back through cached ring and fast values.
2. The bot never really drove. It set `CTL.thr=1`, but `roamStep` rebuilds `CTL` from the keys every frame (src/71_roam_drive.js:38). ESC_unstick, which runs before physics, saw "gas held", but the car got no throttle. So every pit row was a car sitting still and freed by the 4 s reset, and every "must not reset" row was a coasting car. The reviewer's script holds `K.ArrowUp`, which is the real path, and that is why only it saw the false lifts.

## Design (src/98esc_escape.js)
- No timers or anchors. Each frame pushes a raw sample `[t,x,z,v,heading,±1]` into `E.H` (last 6 s of this episode). The episode is cleared when the gas is released, on a road, on any `roamWarp`, on a lift, on a jump > 8 m between frames, and outside free roam.
- **GATE** (recomputed from `E.H` on the lift frame, nothing cached): `|v| <= 8 m/s` now, AND at least 2 s of samples, AND no sample of the last 2 s is 20 m or more from the car's position now. A lift is impossible on any other frame.
- **TRAPPED**, any one of:
  - **pinned**: in the last 3 s, < 4 m of progress along the intended direction and a mean *ground* speed (path / time) < 3 m/s, AND in a hole (boxed by walls steeper than 29° 6-10 m out, or every heading rises > 2.5 m within 60 m).
  - **stuck**: the same as pinned held for 5 s, anywhere off the road.
  - **rocking**: the last 5 s stay within 6 m of their centroid, with at least 2 reversals of v.
- Assist (once per episode), clear landing, manual rescue (#tU, keys U/R), races (TR8_unstick) and `?esc=0` are unchanged.
- Departure from the brief, noted: the brief's strict terrain clause ("every direction within 6-10 m rises beyond the climbable slope") matched none of the real trap cells, so the car would stay stuck forever. The motion tests alone already rule out a moving car, and the gate is the hard guarantee, so the terrain test is wider (depth, or 5 s), and rocking has none.

## Results (built page, the reviewer's code path: K.ArrowUp + roamStep(1/30); every lift audited on its own frame from the harness's own samples)
- Reviewer repro `docs/shots/rev22/scripts/run_in_page.js`: fra 2100,400 from rest / at 20 / circling, fra 300,1780, and ath -2530,1300 at 20 / -1990,820 circling: **no lift**. ath -2530,1300 from rest: lifted at 5.0 s as rocking with v 3.4 m/s and 0.8 m moved in the last 2 s. A per-frame trace shows the car spinning in place at -2524,1333 (< 1 m in 3 s, wheel speed 3-9 m/s), so it is a genuine stuck lift. Parked with no gas: no lift.
- GO bot/escape: see the rows below. Every pit is now driven with real gas. Most "pits" from the scan are drive-outs at 25-30 m/s; the real traps are lifted by pinned, rocking or stuck.

| city | cell | depth m | freed by | t s |
|---|---|---|---|---|
| fra | 2100,400 | 9.6 | drove out | 2.9 |
| fra | -420,640 | 8.7 | lift/pinned | ~9 |
| fra | 1140,160 | 6.8 | drove out | 2.7 |
| fra | 180,-1160 | 6.6 | lift/pinned | ~8.5 |
| fra | -780,1480 | 5.7 | drove out | 3.0 |
| fra | 300,1780 | 5.5 | drove out | 2.1 |
| fra | -7320,6160 | 5.3 | drove out | 2.2 |
| fra | -540,-1160 | 5.2 | lift/pinned (backward slide = no progress) | ~8 |
| fra | -180,880 | 5.0 | assist | 3.5 |
| fra | 2220,880 | 3.4 | drove out | 2.1 |
| fra | -2100,1600 | 3.4 | drove out | 2.0 |
| fra | 780,1720 | 3.3 | lift/rocking | 5.5 |
| ath | 770,-2300 | 7.5 | drove out | 2.8 |
| ath | 2990,-500 | 6.3 | lift/pinned | 3.9 |
| ath | 1970,-1700 | 3.9 | lift/rocking | 6.2 |
| ath | -70,-2120 | 3.3 | drove out | 2.4 |
| ath | 1010,-1820 | 3.1 | drove out | 2.0 |
| ath | 590,-1760 | 2.1 | lift/stuck | 5.0 |

The reviewer's cases inside GO (same parameters as esc_repro_in.js, 8 s): fra 5/5, ath 4/4. Free dips (rest / 20 m/s / circling): fra 9/9, ath 12/12. Zero lifts at |v| > 8 m/s or >= 20 m in 2 s across all runs. The Athens scan finds 7 pits deeper than 2 m on today's trunk (the old table listed 12, from before the ramp and road changes); the GO needs >= 6 rows.
