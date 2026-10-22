# HANDOFF E1 (22 Oct 2026): alive enemies + lit scene

Files: parts/enemies/alive.js (flag RET.alive, ?alive=0 old), parts/render/lit.js (flag RET.lit, ?lit=0 old), qa/alive-test.js, two PARTS_EXTRA lines.

## Numbers (qa/alive-test.js, stepped sim, human bot, stages 1-3, RUNS=6 on / 4 off)
| | old (?alive=0) | alive |
|---|---|---|
| mean enemy speed on screen | 138 px/s | 209 px/s |
| enemy-time idle (< 20 px/s) | 30% | 3% |
| longest idle stretch | 6.9-7.6 s | 0.4 s |
| enemy shots / enemy / 10 s | 5.9 | ~17 |
| mean enemy bullet speed | ~130-160 | ~280 |
| human-bot hits / run | 0.5 | 2.7 |
| human-bot clear | 100% | 100%  (GATE (d) FAILS: target 60-85%) |

## Not done / next
- Clear rate still 100%: the bot takes ~3 hits/run on stages 2-3 but heals (hull drops, bounty repair) and EMPs bullets away. Pushing shot volume
  further (21 shots/enemy/10 s) did not lower it either and starts to look like bullet hell. Next lever: fewer repairs on stages 1-3 or the
  charge hitting harder (2 hull), not more bullets. Tune AL.CD (fire cooldown per stage) / AL.CHR (charge range) only.
- The 0.35 s fire tell uses the existing hull glow (e.arm): with bursts every ~1.3 s, gunships look white a lot of the time on phone stage 6.
  A coloured tell (muzzle spark) would read better.
- lit: render time on the phone at stage 6 is 21 ms max per frame here vs 16 ms with ?lit=0&alive=0 (software chromium); the soft-light pass
  over the whole canvas is the cost. Budget (16 ms) not proven. Depth haze is a sky-colour disc over far foes; contact shadows are simple ellipses.

## Gates (22 Oct ~18:15 UTC)
- build.py ok; 0 page errors in the clip captures (phone 390x763 dpr2 + 1440x860, stages 1 and 6, on and off), loadgate PASS, guard ok.
- fingerprint with ?alive=0&lit=0: fly6 FAILS on the base branch too (stale baseline); endless10 state identical, its draw hash is UNSTABLE run to run
  on this build (TWICE=1) while stable on the base: not found in time. With the flags on, state changes as expected.
- simhunt: 2 severe kinds (unexplained deaths on stages 38-44, outside the wave stages this layer touches), no page-error kind.
