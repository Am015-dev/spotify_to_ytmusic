# HANDOFF W310: the first 10 seconds (branch nr/W310-open, base nr/W303-integrate, not deployed)

## Done
- Flight, first stage-1 run: the NEWPLAYER warm-up (`NP.T` in parts/difficulty/density.js, review 10 F11) blocked every aimed enemy shot for 15 s, so the
  opening drones fired into nothing and the first screen never shot back. `NP.T` 15 -> 4 s. After it, as before, only every 3rd aimed shot until 45 s.
  No enemy, table or spawn changed. The first foe was already in view at 2.10 s (stage1fun.js bar 1), so the flight schedule is unchanged.
- Street: street3.js kept 8 beats of calm before wave 1. Now only wave 1 (two rushers, the weakest wave) starts after `S3.T.w0` = 4 beats; waves 2-12 keep
  the 8-beat schedule. Making all 12 waves earlier (beats 8 -> 4) cost the gunner-first bot 15 points (73 -> 58%), so it was dropped.
- np-gate-test.js reads the quiet window from `NP.T` instead of a hard-coded 15 s.
- New: qa/open-probe.js (stepped clock: first foe, first aimed shot or ram, street in view and in reach; GATE=1 checks the W310 targets),
  qa/open-shots.js (3 / 6 / 10 s shots of flight and street, phone + PC, writes to /tmp only).

## Numbers (qa/open-probe.js, game seconds from run start, 8 seeds flight x phone+PC, 4 seeds street x phone+PC; worst = maximum over runs)
| measure | target | before | after |
|---|---|---|---|
| flight: first foe fully on screen | <= 3.0 | 2.10 (all 16) | 2.10 (all 16) |
| flight: first aimed shot or ram (alive.js charge) | <= 6.0 | none in 10 s in 6/16 runs (no ram); 0 enemy bullets in 10 s on all 16 runs; rams 6.20-8.30 | aimed shot 4.05-5.85, worst 5.85; 1-8 enemy bullets per run in 10 s |
| street, walks right: first foe in view | <= 5.0 | 4.72 phone / 4.67 PC | 2.43 / 2.38 |
| street, walks right: first foe in reach (in view, <= 420 px of Kai) | <= 8.0 | 4.72 / 4.90 | 2.43 / 2.62 |
| street, idle: in view / in reach | - | 4.77 / 5.82 | 2.48 / 3.53 |

Gates (one at a time):
- qa/gauntlet-flight.js phone, NOAUDIO=1, dodger 4 + shooter 4: boss killed 4/4 and 4/4, 0 deaths, 0 stuck, 0 errors (W305 had 8/8). One finding on all 8 runs:
  "NEXT STAGE click did not start stage 2" (focus mode, #srNext). That is result-screen code W310 doesn't touch; not checked against the base build.
- qa/streetsim.js RUNS=40: idle 0/40 cleared (dies 40/40), gfirst 75% (base 73%), dodge 73% (base 68%), nearest 28% (base 40%, still inside its 25-40 band).
  FAILs on base and after alike: threat peak 82-88% (63.6% vs 62.3%), cover >= 3 hits (0.3 both), D3 depth spread (26% vs 28%).
- qa/flow-test.js 91 PASS 0 FAIL; qa/gauntlet-shell.js 399/0; qa/claims-check.js 17/0; qa/copy-test.js 15/0.
- np-gate-test.js (parked new player alive at 45 s) is noisy run to run. Base: 2/6 + 2/6 (min death 27.8 s). After: 6/6 + 6/6 (min 47.5 s), then 3/6 + 3/6 (min 23.8 s);
  aimed shots inside NP.T: 0. It FAILs before and after; W310 doesn't make it worse.

## What is on screen (looked at; /tmp/w310/after, seed fixed, no input)
- Flight 3 s (phone + PC): ship, autofire, two drones up front, chip "GOLD 5s · fly in close, kill the squad". No enemy bullets yet.
- Flight 6 s: 2 drones + 1 more weaving in; 3 pink enemy bullets coming at the ship; hull still full. Before W310 the 6 s shot had 0 enemy bullets.
- Flight 10 s: chip "GOLD LOST · too far: kill them up close"; drones up front, a row of 3 small fliers and pink shots; idle ship has lost 1 hull pip.
  The probe counted 0 live foes at that moment while the shot shows foes: unexplained (dying or leaving foes?).
- Street PC 3 s: Kai at left, the first rusher with a knife walking in mid-screen, line "GUARD: hold I to block hits from the front". The tutorial overlaps the first foe.
- Street PC 10 s: idle Kai pushed to the left edge, 3 of 6 hearts, "D or → to run". Probe says 1 foe in view but none is visible. Also a white ellipse at Kai's feet that no caption explains (not added by W310).
- Street phone 3 s: Kai aiming right, line "GUARD: hold to block hits from the front"; the rusher is at the very right edge, not visible. By 6 s it is dead (score 180),
  so on phone the first foe is killed at the edge before the player sees it. Phone 6 s and 10 s: Kai alone, "Push the stick right".

## What is wrong / next
1. Phone street: the first rusher dies at the right edge (Kai's gun reaches past the narrow 330-unit view). Next: let it walk in to about 60% of the view before Kai can hit it,
   or spawn it inside the view. Owners: street3.js (spawn x) or foot.js (shot range vs view).
2. Street 7-14 s is still empty after wave 1 (wave 2 at about 16 s). A third rusher or wave 2 at ~9 s would fill it; needs another streetsim check (nearest bot is at 28%).
3. The flight ram is random (alive.js charge clock and autofire). The aimed shot now meets the 6 s target, the ram doesn't.
4. Not run: simhunt (rule 11), gauntlet-flight PC and idle/random bots, real-audio timing (all numbers use the stepped beat clock, NOAUDIO).

## Files
parts/difficulty/density.js (NP.T), parts/street/street3.js (S3.T.w0, first wave time), np-gate-test.js, qa/open-probe.js, qa/open-shots.js, HANDOFF-W310.md.
