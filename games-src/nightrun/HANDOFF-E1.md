# HANDOFF E1 (22 Oct 2026): alive enemies + lit scene

Files: parts/enemies/alive.js (flag RET.alive, ?alive=0 old), parts/render/lit.js (flag RET.lit, ?lit=0 old), qa/alive-test.js, two PARTS_EXTRA lines.

## Numbers (qa/alive-test.js, stepped sim, human bot, stages 1-3 Normal, RUNS=12 on and off, 18:00 UTC)
| | old (?alive=0) | alive |
|---|---|---|
| mean enemy speed on screen | 138 px/s | 210 px/s |
| enemy-time idle (< 20 px/s) | 30% | 3% |
| longest idle stretch | 7.7 s | 0.5 s |
| enemy shots / enemy / 10 s | 6.2 | 16.5 |
| mean enemy bullet speed | 135 | 282 |
| human-bot hits / run | 0.7 | 2.4 (lowest hull 2-7 of ~8) |
| human-bot EMPs / run | 1.3 | 3.1 |
| human-bot clear | 100% | 100%  -> GATE (d) FAILS (target 60-85%) |

## Not done / next
- Clear rate still 100%. The bot has ~8 hull, 1.5 s of mercy after each hit, and it now spends 3 EMPs a run clearing bullets. More volume
  does not help: the phone cap is 18 enemy bullets on screen (b.js ebCap), so extra bursts are thinned; a 3-way bracket aim without fans
  dropped hits to 1.4. Levers left for the orchestrator (outside this layer): fewer hull or EMPs on stages 1-3, or a higher bullet cap.
  Knobs in this layer: AL.CD (fire cooldown per stage), AL.CHR (charge range), AL.K (burst, spread, speed per type).
- Rams (2 hull) land only ~0.1-0.3 a run against the bot (it dashes); against people they will land more: watch it.
- lit: the blast light is still a soft puff; a sharper flash sprite would read better. Render time max per frame (sim, this machine):
  phone 5-13 ms on, 5-16 ms off; desktop 2-12 ms on. Depth haze and contact shadows are simple sprite discs.
- With a flag off its layer installs no wrapper at all (both on together shifted fingerprint state by frame-time sensitivity before this).

## Gates (18:00 UTC)
- build.py ok; 0 page errors in the clip captures (390x763 dpr2 + 1440x860, stages 1 and 6, on and off), loadgate PASS, guard ok.
- fingerprint ?alive=0&lit=0: same hashes as the base for all 8 (fly10 / street draw hashes flicker run to run on the base too).
- simhunt: 2 severe kinds = the same unexplained deaths on stages 38-45 as the committed SIMHUNT.md; no page-error kind.
