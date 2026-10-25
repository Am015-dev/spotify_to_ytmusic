# REVIEW_2K_25: gatereds-r25b (2026-10-25)
Reviewer lane rev-gatereds-r25b. Commits 868e8b42f (why/solid-cars) and 29cb86c59 (race/racefree), handoff docs/HANDOFF_gatereds-r25b.md.
Build: trunk tip 29cb86c59, `tools/build.sh rev25 --local` → `out/rev25` (page 3.50 MB, 202 publish files), served locally. Phone profile (iPhone UA, 852x393 touch, DPR 3) for every run.
Measuring script: docs/shots/rev25/rev25.js.txt (modes `race`, `sweep`, `sweepgo`, `oldgo`, `far`). It drives `stepSim` / `roamStep` the same way the GOs do, with no graphics.

## Verdicts
- **29cb86c59 (race/racefree: hull reset per sweep, rivals sit out): PASS.** This is an honest test fix. The drift the old GO caught does not show up in a real race (see (a)).
- **868e8b42f (why/solid-cars (d)): FAIL. Send it back.** Both halves of the change are wider than the handoff says, and half (ii) rests on a false premise (see (b)). Rule 15: a red is never made green by loosening its GO around something nobody has explained.
- **racemode-r25a (REVIEW_2K_23 FAIL): now PASS on this trunk.** race/racefree passes 5/5 in fra and ath with SKC_race on, and race/racemode-all passes in fra and ath. The old red came from the GO (hull worn to 0, rival shoves), not from the camera. A real race with SKC on gives no drift without contact (a).

## Gates on out/rev25 (built, phone profile)
| check | result |
|---|---|
| unit `node tools/unit/run.js` (three@0.164.1) | UNIT OK 5598 asserts, 0 FAIL, 13 known |
| `tools/gate.sh` (why, life1, xf1, terrain; fra + ath) | PASS 78/78, errors 0 |
| race/racefree x5 (fra + ath) | 5/5 PASS in both cities. Kerb reach 7/24 (worst 47 %) in run 1, 24/24 (worst 92 %) in runs 2-5 |
| race/racemode-all | PASS fra, PASS ath |
| race/one-speedo | PASS fra, PASS ath |
| mem/no-reload fra, THROTTLE=6 (rule 12 phone profile, same setup as REVIEW_2K_24) | PASS |
| mem/no-reload fra, unthrottled | FAIL 2/2 on the high-water only (733 and 710 MB, cap 700). Not this lane, which changed GO files only. Open item for the reload lane: the cap only holds at 6x. |

## (a) Can a player see the drift the old GO caught?
`race` mode: a real quick race (grand / akro) with the rivals racing, the hull left alone (it regenerates as in play), and touch steering. It steers at full lock until the car is 1.2 m from the kerb, lets go for 3 s and measures the drift back toward the line, judged the same way as the GO (|x| > 6 m, no lane or mouth). 60 episodes per run.
- fra run 1: 45 judged, max drift 1.81 m. fra run 2: 45 judged, one 5.57 m drift with a rival 3.4 m away (contact, hull 97, no death). ath: 41 judged, max 0.49 m.
- Across 131 judged episodes, 0 drifts over 2 m happened without contact and 0 cars were destroyed. A rival pushing the car on contact is normal racing physics, not a snap back to the line.
- `oldgo` mode is the OLD track check (no hull reset, rivals in), run on this trunk with SKC on: 0 reds in 3 runs. The default car never wore its hull to 0 here, so I could not watch the worker's hull mechanism fire. The fix is right either way. 48 full-lock wall sweeps wearing the hull down is damage the test itself causes, and a real player never meets it.

## (b) far cars may step 3.5 m: LOD or teleport?
The worker's reason was "HT_cars (perf-r13a) steps far cars with summed dt / waits past 24 steps". **That LOD is off.** `TUNE.htFar:0` in src/10_core.js ("OFF until tBoot shows a clear win"), so `HT_lo()` is false in the game and in the GO.
`far` mode wraps HT_car during SC_go (fra, TOUCH on), so every step it measured comes from the code that really runs:
- 157-202 sim steps over 2 m per run. Every one is a single frame (dt 0.017; steps with a summed dt: 0) at cv·dt ≈ 0.17-0.23 m. The cars move about 2.1-2.8 m in one frame, about 12x their speed, and they keep doing it over several frames in a row (e.g. 132→129→127→125 m).
- Drawn pose (instance matrix) in the view frustum, fra: 52 steps over 1 m per frame at 60-250 m, 34 of them over 2 m, and one 34 m pop at 147 m. ath: none at 60-250 m, three 5.2 m steps past 300 m.
- A 2 m hop at 150 m is about 6 px per frame on an 852 px screen. Repeated, that is a small car sliding much too fast in the distance. It is small, but it is not invisible LOD, and the new 3.5 m allowance within 120 m (the cars that (d) samples) hides exactly this.
- (i) the recycle exemption is also wider than "the respawn half". Once `e.us` is set, `ex` stays true for every later jump of that car, and the final check skips gone, other model, other colour, jumped and drawn for it. In one fra run, a recycled car later moved 35.9 m (sim) 24 m from the player. (d) did not sample it, so the run stayed green, but the GO would not have seen it if it had.
- **Fix for the next lane:** revert (ii). Find what moves far traffic 2+ m per frame at cv 10-13 m/s, from the per-frame `c.x` of the cars in `far` mode. Narrow (i) to the one sample where the parked car respawns out of sight (`!_scF.intersectsSphere` or more than 40 m), then clear `e.us`.

## (c) "One steer direction sometimes doesn't respond": a stuck key left by the test bot, not a player bug
- `sweep` mode: the GO's own sweep, per direction, on a fresh page. fra and ath: 0 weak directions out of 188 (reach >= 80 % of the half width every time).
- `sweepgo` mode: the full race/racefree GO first, then the sweep on the same page. Run 1 of 3: right steer dead on 21/24 samples (reach 0, the car even drifts left), left weak 1. Runs 2-3 had 0. After 4 more repeats: the weak run, and only that run, had **`K.ArrowDown` still true**.
- Forcing `K.ArrowDown=true` on a fresh page gives the same numbers exactly (weakL 1, weakR 21). The cause is RFG_city's tkBot, which presses ArrowDown (brake). RFG_city and RFG_reg's `finally` reset only ArrowUp, KeyW, ArrowLeft and ArrowRight, so the brake stays held, the car goes into reverse, and the right sweep that comes after fails.
- A touch player has no keyboard and cannot get a stuck brake key, and on PC a keyup releases it. **No player-visible steering bug.** It is a GO bug, and it hides a real assert: kerb reach is only info (`n>=10`). Next lane, small (Haiku-level): reset every K key (`for(const k in K)K[k]=false`) in RFG_city and the finally block. Then judge kerb reach (`ok>=0.9*n`, 24/24 measured when the key is not stuck) and drop the "after a city race" notes and the fra-only limit, since that open item in HANDOFF_racefree-r24l.md is this stuck key.

## Code notes
- 29cb86c59: the rivals are restored in `finally`, the hull reset is per sweep, and nothing in game code changed. Fine.
- 868e8b42f: the added `e.mi` diagnostics (v, cv, distance, flags) are useful; keep them when the fix comes.
