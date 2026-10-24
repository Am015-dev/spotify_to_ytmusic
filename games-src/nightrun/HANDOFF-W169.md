# W169 HIT FEEL (flag `?hitfeel=1`, off by default; rows F1-F4 of benchmark/STREET-BAR.md)

Branch `nr/W169-feel`. Files: `parts/street/streetfeel.js` (flag + `F.hitFeel` + recoil draw), `parts/street/foot.js` (4 one-line hooks), `qa/streetsim.js` (`DUMP=` writes every run's probe record), `qa/hitfeel-probe.js` + `qa/hitfeel-sum.py` (the gate).

## What the flag does
- F1: every landed bullet / knife hit freezes the game 3 frames (50 ms), 2 frames (33 ms) for HMG (damage < 1), 6 frames (100 ms) for a kill or a blow of >= 2 damage (rocket blast). Burn ticks and flamer streams are not hits and get none.
- F2: the foe rocks back 4-16 units (10 x damage) and eases home in 0.14 s. Not on bosses, kills, shotgun lv5 pellets (they already carry `kb`), or foes in a wind-up / lunge / charge / pop / stun. It is a DRAWN recoil (footDraw x offset), not a move of `e.x`.
- F3: no shotgun fire shake; a rocket / barrel blast shakes only if it hit a foe. Remaining shakes: Kai hurt, boss kill / phase, w > 60 kills.
- F4: Kai's hurt shove 240 -> 170 u/s x 0.35 s = 60 units (was 84).

## Why the recoil is drawn, not a real shove (decision to review)
Street foes are `ext` (their ai moves `e.x`), so bullet `kb` on `e.vx` never did anything. A real nudge of `e.x` (10 x damage, 4-16 units, 150 runs per bot) moved clear rates off today: dodge 86% -> 100%, nearest 21% -> 34%, gfirst 73% -> 60-72%. Halving it (3 x damage) still gave dodge 100%. The drawn recoil leaves every row inside +-3 points. If the owner wants a real shove, it needs a matching retune of the street (dodge bot is already above its 60-80% gate at 86%).

## Why the freeze is not applied inside `FOOT.sim()`
Under a stepped sim a freeze (dt x 0.05) only changes how many steps a bot samples per game second, not the game: with it applied the same street cleared nearest 44% / gfirst 79% / dodge 93% (today 21 / 73 / 86). So in `sim()` (`S.sim=1`) the hit freeze is recorded in `S.hf` (decays in `ftUpdate`) and not applied; real play applies it via `hitstop()`. The probe reads `max(S.hs, S.hf)`. The old hurt / slash / boss freezes still run in sim exactly as before.

## Gate results (RUNS=50 per bot, 200 runs, stepped x1700+, flag off -> on)
| row | before | after |
|---|---|---|
| F1 landed hits with 2-8 frames of freeze | 0.1% (0 frames on 17,000 hits) | 100% (3 f pistol/shotgun, 2 f HMG, 6 f kills / rockets) |
| F2 non-boss landed hits with a recoil | 0% (no knockback anywhere) | 81% (the rest are foes mid-attack, kills, bosses, by design) |
| F3 shakes on misses per run | 25.0 | 0.0 |
| F4 Kai hurt shove over 0.35 s | max 85 units (nominal 84) | max 61 (nominal 60) |
| streetsim clear % nearest / gfirst / dodge (150 runs) | 21 / 73 / 86 | 24 / 73 / 87 |
| streetsim gates (50 runs) | 10 pass | 12 pass (nearest-first and threat peak flip by noise; none worse) |
Other: streetdraw-test, footvis-test (139 PASS), streetsong-test (6), footlab-test (37), guard.py all pass with the flag on (streetdraw) or off. `qa/simhunt.js` reports 2 severe kinds, both "ship dies with no enemy bullet or body within 60 px" in the story stages, not the street; not touched by this change (flag off).
Flamer, HMG and shotgun feel were measured only as numbers, not played. Feel needs the owner's hands: try `?hitfeel=1` and check that 3 frames on a pistol feel right and the HMG does not stutter.

## Left
Nothing blocking. To ship: owner plays, then flip the default in `streetfeel.js` (`RET.hitfeel` line) and re-run streetsim.
