# BALANCE W263: the on-foot fight, tuned with the gauntlet (29 Oct 2026)

Method: `qa/streetsim.js`, bots playing the real street sim (stepped, no drawing). Three blocks of seeds (`SEED0` = 4321, 9001, 20011; seeds are `SEED0 + i x 7919`),
each run at RUNS=12 and at RUNS=40, base / live / new on the same blocks. The same seed always gives the same run (the determinism gate passes), so repeating one block
three times shows nothing; three different blocks show the real spread. Reproduce: `SEED0=9001 RUNS=40 NODE_PATH=$(npm root -g) node games-src/nightrun/qa/streetsim.js`.
Base = 3999148 (the base the W248 merge started from, as the W248 handoff names it), live = 91af04f, new = this branch.

## What the knobs do (all in the file that owns them)
| knob | file | value (was) | what it does |
|---|---|---|---|
| `SH.HPK.gunner` | street/streethard.js | 0.9 (1.2) | Gunner health multiplier. A gunner is hittable only while it pops up, so 3 pistol shots instead of 4 means the gunner-first player actually removes it in one pop. The casual player (shoots the nearest foe) hardly meets gunners, so this moves gunner-first by about +17 points and nearest-first by about 0. Cliff: 1.0 and below is 3 shots, above is 4. |
| `ZTF` | street/foot.js (`melee`) | 0.21 (the player's 0.15) | How far apart in depth a foe's melee still reaches Kai. `ZT` 0.15 stays for Kai's own shots and strikes. Stepping out of a lane is the dodge player's whole edge (it avoided 64% of attacks that way); 0.21 keeps it a real tool but not a free pass. Very steep: 0.18-0.20 gave dodge 86-89%, 0.22 gave 42%, 0.21 gives 69%. |
| rusher `rest` drift | street/street2.js | 4 px/s back (0) | A rusher recovering from its lunge used to stand perfectly still for 0.5 s (W196 "stand still" 22%). It now drifts back 2 px: still punishable, below the run-pose threshold (5 px/s), never frozen. Stand-still 22% -> 12%. Not a difficulty knob (pose and punish window are the same). |
| unchanged: `INV`/`HITGAP` 1.1 s, `MAXATK` 2, `C.SLOTS` 2, `C.RESTT` 3, rusher `HPK` 1.4, heavy `HPK` 1, `CROUCH` .75 | | | Tried and rejected, see below. |

Tried and rejected (12-run or 40-run blocks, same seeds):
- Rusher `HPK` 1.4 -> 1.2: gfirst 97%, dodge 98%, nearest 60%. Rusher hp x 3 = 4.2 vs 3.6 pistol shots (5 vs 4): a cliff, the fight becomes a walkover.
- `CROUCH` .75 -> .55 / .6: gfirst collapses to 15%, then at .7 nearest rises to 48%. Not monotonic (the lunge timing interacts with the bots), so it is left at .75.
- `C.RESTT` 3 -> 1.5, heavy `HPK` .8 / 1.3, gunner open-fire cooldown 2.2 -> 1.6: no measurable change (the 2-attacker cap and cover gunners decide those fights).
- `ZT` .15 -> .2 (all depth checks): Kai's own shots miss more, nearest unchanged, gfirst 87%, dodge 96%. Wrong direction.
- The `MAXATK` branch that zeroes a waiting foe's speed (W243): giving it its old speed back changed nothing, because the stand-still came from the rusher rest, not from this branch. Left alone.

## Gauntlet numbers (clear rate; spread = min..max over the three seed blocks)
| gate | band | base RUNS=40 | live RUNS=40 | new RUNS=40 | new RUNS=12 |
|---|---|---|---|---|---|
| idle clears | 0% | 0% (all 3 blocks) | 0% | 0% | 0% |
| gfirst | 75 +-8 | 72.5% (68..75) | 72.5% (70..75) | **79.2%** (78..80) | 83.3% (75..92) |
| dodge | 65 +-8 | 66.7% (60..70) | 71.7% (68..75) | **69.2%** (68..70) | 72.2% (67..75) |
| nearest | 25-40 | 39.2% (38..42) | 40.8% (28..48) | **40.8%** (35..48) **FAIL by 0.8 pooled** | 44.4% (25..67) |
| kill order (gfirst - nearest >= 15) | | 33 | 32 | 38 | 39 |
| W196 stand still < 20% (base 16.8-18.8) | | 17.8% (16.8..18.8) | 22.0% (21.2..22.7) FAIL | **11.8%** (11.4..12.3) | 12.4% (10.3..15.6) |
| max foes attacking at once <= 2 | | 4 (FAIL) | 2 | 2 | 2 |
| min gap between hurts >= 1.1 s | | 1.30 s | 1.10 s | 1.10 s | 1.10 s |

Two things the gauntlet showed that a single RUNS=12 block hides:
1. The "live nearest 67%, dodge 75%" in the task was the first 12 seeds. Pooled over 120 runs the live build is not far from base (nearest 40.8% vs 39.2%, dodge 71.7% vs 66.7%).
   The live build's real regressions are the stand-still (22% vs 18%) and the base's missing attacker cap. RUNS=12 has a step of 8.3 points: one run moves a gate by 8.
2. Block-to-block spread at RUNS=40 is up to 20 points for nearest (28..48 on live). Every number above is therefore reported pooled with its min and max.

Still failing, honestly: **nearest 40.8% pooled (blocks 48 / 40 / 35)**, gate 25-40. It is 0.8 points over on the pooled number (base pooled 39.2% sits just under the line, so this is where base already was, not a regression).
No knob tried moved nearest-first without moving gunner-first with it (gunner-first is the same bot with a different target choice). Also failing on base, live and new: threat peak
(51-54% vs 82-88%: the sampled weight of live foes; the stage has never reached it, W243 said the same) and cover hits per run (0.3-0.5 vs 3). Not touched.

## seed == real time
Fails on base, live and new (idle, seed 4321: the first hurt agrees to 0.01 s, the third diverges by 1.8 s). The stepped run swaps `Math.random` for a seeded
generator and draws nothing; the real-time page also renders, and render code (particles, shake) pulls from the same `Math.random` stream, so the foe timers drift after the first
frames. Gameplay itself is deterministic (the same-seed-twice gate passes every time). Making real time match would mean a separate gameplay random stream in every
street part (about 40 call sites); that is a game-wide change for a test-only check, so it is documented here and not changed. Not verified by an experiment that disables the
render path, only by reading the code: say so if you need it proven.

## Real-time sanity (qa/street-rt-test.js, real loop, real key events)
One run each of idle / button masher / skilled, phone 390x763 (keys on a keyboard; the on-screen pad was not driven) and PC 1440x860, wall clock, 170 s cap:
- idle: PC dies at 20.4 s game time (6 hits). Phone dies at 111 s: the touch layout shoots by itself (auto-fire), so an idle phone player kills 32 foes and still loses.
- button masher (random keys, 8/s): does not clear on either screen; both are still alive at the 170 s cap (4 hearts left, 47 and 46 kills, 12 and 10 hits).
- skilled bot (gunner first, depth lanes, jump on lunge): **died in both of its 2 tries on both screens** (PC 131 s and 111 s, phone 85 s and 41 s). So "a player can win through real input" is
  NOT proven by this run. The stepped bots (79% / 69%) are stronger and react in 0.1 s; this one polls every 45 ms over the debug protocol and has no cover play. Either the bot is too
  crude or the real-time fight is harder than the stepped one. A human or a better real-time bot has to settle it; the owner's play is the check.
