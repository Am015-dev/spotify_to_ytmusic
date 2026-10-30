# W283 flight bisect (branch nr/W283-flight-bisect from nr/W282-rc). 30 Oct 2026. Not deployed. One code change: qa/gauntlet-flight.js.
Logs/shots (not committed): /tmp/claude-0/-home-user-spotify-to-ytmusic/04fb8369-0397-5dc9-8385-7e1a07f750cb/scratchpad/ (out/*.txt, shots/).
## Result: no game regression. The harness lost every run on a fast machine.
Old harness (STEPS=12 WALL=420, PC dodger, 4 seeds, one browser) on the W272 CONTROL (e61f544, the build W273 measured 5/5 on PC) = **0/4** (deaths 4/4/1/4, "stuck 20 s, score 0, 0 enemies" at t=21 in every run, wall 17-25 s per 150 sim-s).
Same control, same seeds, with a 300 ms pause per decision: cleared (s2, 0 deaths). With two rAF frames painted after each input burst and no pause: cleared 2/2 (s1, s2). So the outcome depends on wall time between the input and the next stepped burst, not on the code. W273 ran 2-4 browsers at once (slow), the W282 box was fast: same harness, opposite results.
Cause inside the game: NOT isolated. `K[code]` is set synchronously in the keydown handler (core/b.js:42), so a plain key press is not the whole story; the stepped loop (`__mnr.step`, hud/c.js:285) skips the render path that the real loop runs. Left for a later task.
## Bisect table (PC, dodger, fixed harness unless noted; clears = result screen after the boss)
| build | harness | clears/runs | note |
|---|---|---|---|
| W272 control e61f544 | old | 0/4 | stuck-at-t=21 flag, 4 lives lost |
| W272 control | old + 300 ms/decision (s2 only, PAR 2, 2 seeds started) | 1/1 finished | 0 deaths, boss killed |
| W272 control | fixed | 2/2 (s1, s2) | 0 deaths |
| W281 703854408 | fixed | 4/4 | 0 deaths |
| W282-rc 44334df | fixed | 4/4 | deaths 1/0/2/0 before the clear |
| W274, W276, W277, W278, W279, W280 | - | NOT RUN | no first bad commit exists, so no bisect; the stopped chain left them unmeasured |
The control was not re-run at the end with the fixed harness over 4 seeds (time); it cleared 2/2 above.
## Fix (owner: qa/gauntlet-flight.js)
`frames(p)` after every move/dash/EMP burst: two requestAnimationFrame ticks before the next `__mnr.step` burst. No game code touched.
Not changed: the `bossKilled` counter (it already counts the kill the iteration before the result screen shows; "boss 1/2" printed on some runs was my own double count and was reverted).
## Fixed release candidate, flight stage 1 (STEPS=12 WALL=420, FOCUS on, one browser, 0 page errors, 0 rejections)
| device | strategy | clears/runs |
|---|---|---|
| PC | dodger | 4/4 |
| phone | dodger | 0/4 (4 lives lost each, boss seen 2-3 times) |
| phone | shooter | 2/4 (s1, s4 cleared with 0 deaths; s2, s3 lost 4 lives) |
Phone gate (>= 40%) NOT met: 2/8 = 25%. W273 measured 6/13 (46%) on the W272 build with the same bots, but under load and with the broken stepping, so it is not comparable. A phone control on W272 with the fixed harness was NOT run (time): that is the next measurement; if it also gives ~2/8, the phone boss is just hard for these bots and the release check's flight row is a balance question, not a regression.
PC 8 seeds: see the PC line at the end of this file if the run finished.
## Not done
footvis (needs the full ref; the fetch is complete now) and smoke.sh were not run (time). Phone shots at the boss not looked at. Seeds below 8 on every row.
## Next (one task, sonnet): fixed harness, phone dodger+shooter 8 seeds on W272 (control) and on W282-rc; if equal, close as bot difficulty; if W282-rc is lower, bisect W274..W281 on phone.
