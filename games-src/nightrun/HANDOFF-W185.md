# HANDOFF W185: three more street foes from existing sheets (24 Oct 2026)

Flag `?morefoes=1`, off by default. Code: the second block of `parts/street/streetfoe.js` (the shield guard block above it is unchanged; its default stays OFF, see below).

## What was built
One rule for all three, each with its own tell and answer: **make it miss, then hit it**. A foe whose attack misses is OPEN (yellow "OPEN"; the first time "MISSED: HIT IT NOW"). One whose attack reaches Kai (even during his blink after a hit) recovers at once.
- `sninja` (ninja sheet: block/dash/slash): the guard stops every frontal shot (the knife goes through); 0.5 s wind-up, then a dash through Kai in the depth line he stood in. Walking up to it starts the dash at once. A missed dash: OPEN 1.5 s. Tired after 7 s (no guard, no dash).
- `shound` (hound sheet: run/pounce/bite): only an OPEN or tired hound can be hit (shots fly past it to the foes behind); it runs along the back of the band, crouches 0.6 s, then lunges low along the road into Kai's line and past him. Any jump clears it. A missed pounce: OPEN 2.2 s. Tired after 6 s.
- `sflamer` (flamer sheet: walk/spray/hit): armour stops 80% of every hit; it steps into Kai's line, winds up 0.6 s, then sprays a 230-unit flame for 1.5 s (drawn as a tongue of fire from the nozzle). A spray that burns nobody: venting, OPEN 2 s, triple damage. Tired after 10 s.
- Placement (street3 waves, flag on only; at most 1 new type per wave): hound in waves 3, 7, 11; ninja in 5 and 9; flamer in 6 and 10. Each takes the place of rushers worth hound 3, ninja 4, flamer 4.
- `qa/streetsim.js`: time to kill for the new ids, a W185 gate block (only with `Q=&morefoes=1`), and the dodge bot's answers (it jumps the hound's pounce and stays out of a burning line). With the flag off, the bot code paths are unchanged.
- `qa/footvis-test.js`: the new foes are checked on their own lines.

## Gates (streetsim RUNS=50 per bot, stepped, on beta.183 merged: knife combo on)
| | casual (nearest) | gfirst | dodge |
|---|---|---|---|
| flag off (today's live game) | 30% | 68% | 68% |
| `?morefoes=1` | 6% | 54% | 96% |

- PASS >= 6 live foe types in hearts by source (rusher, gunner, heavy, sninja, shound, sflamer)
- PASS ninja time to kill: dodge 2.16 s vs gfirst 4.2 s (nearest 7.21 s)
- PASS hound time to kill: dodge 3.13 s vs gfirst 6.2 s
- FAIL flamer time to kill: dodge 4.69 s vs gfirst 6.54 s (28%; the gate needs 30%)
- FAIL casual clear 25-40% (6%) and dodge 60-80% (96%): answering the tells matters a lot now. The casual bot dies to the gunners and rushers left in a wave while it shoots foes it can't hurt yet.
- No NaN / stuck / page errors. Threat peak, cover and depth-spread gates also fail with the flag off (not this change).
- simhunt (flight stages, untouched): the same 2 severe kinds as the committed 22 Oct report (unexplained ship deaths).
- footvis-test: PASS, every new foe drawn solid (alpha 1.00) on phone and PC, fresh and stale strips.
- Shield guard (`?shieldfoe=1`): its own W171 gate FAILS (guard time to kill: dodge 3.77 s, gfirst 4.22 s, nearest 3.68 s), so its default was NOT flipped.

## Tried and dropped
- Chip damage (the guard and a running hound take 25%): casual 10%, but the ninja and hound time-to-kill gaps disappeared (2.6 s vs 2.6 s). Reverted.
- Fewer new foes, longer pauses after a landed hit: little change to the casual rate.

## Next (Opus, one task): bring casual back to 25-40% without losing the counter gaps
Levers not tried yet:
1. Let the casual bot (and a human) see a better target: aim assist could skip a guarded ninja or a running hound and pick the nearest foe that can be hurt.
2. Give fewer rushers and gunners in the waves that hold a new foe (today a new foe replaces rushers only; the gunner stays).
3. A heal dropped by an OPEN-window kill (rewards the answer and helps a player who learns it).
Then re-run: `RUNS=50 Q='&morefoes=1' node qa/streetsim.js`.
