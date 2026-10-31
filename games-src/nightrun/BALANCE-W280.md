# BALANCE W280: street boss close (30 Oct 2026). Branch nr/W280-street-close from nr/W279-boss-final. Not deployed.
Logs (not committed): `/tmp/claude-0/-home-user-spotify-to-ytmusic/d6170001-44b9-5bf8-9a4b-e1db8e676850/scratchpad/w280/` (ss-*.txt per config/block, triv/, tac/, hud/, pcidle/, tools/chtrace.js).

## What the gates measure (qa/streetsim.js, headless FOOT.sim at 1440x860, whole street stage INCLUDING the boss)
gfirst / dodge / nearest = % of runs that CLEAR the stage (boss killed) for the gunner-first, telegraph-dodging and casual bots; idle = clears of a bot with no input
(0) and "stand-still" = its median death time (19.6 s). They count clears, not first hits. New INFO line per bot: reached boss / hearts at boss / boss-on time / boss won.
## Why gfirst fell 83 -> 43 (W279) and the fix
Pre-boss numbers are identical on base and on every branch config (block 4321: reached boss nearest 22/40, gfirst 34/40, dodge 27/40, 6 hearts, boss on at 144.2 s).
All of the drop was in the fight: gfirst won 17/34 vs 33/34. bossprobe: the pound was dodged 4% (base 78%). The bots jump the pound 0.18 s before its
wave spawns, which works with the boss close; W279's 200 px back-off before EVERY attack made the wave reach Kai as he landed.
Fix (streetboss.js back()): pick the attack first and back off only before a CHARGE.
## PC idle: why the charge stopped 50 px short (headless trace, tools/chtrace.js)
streetreach.js (W191) lands a foe melee only when the sprite's shoulder TIP (~18 px past the centre) reaches Kai's body edge; it ignores the rect, so W279's fw
widening in low() never applied. Knockback pins Kai 16 px from the screen edge; the fw clamp keeps the boss centre >= 58 px from it: 45-51 px apart, never hit.
Fix (streetboss.js pin()): when the charge reaches the edge with Kai in that strip, the boss steps into it (centre 28 px from Kai) for the slam. The hit still goes
through the reach check (W191 gate stays green; a first try that bypassed it with {beam} broke W191 and dropped gfirst to 20-28%: rejected). Jump / depth still avoid it.
## Sweep (streetsim RUNS=40, gfirst / nearest clear % per block 4321 / 9001 / 17003)
| config | gfirst | nearest | note |
|---|---|---|---|
| base (W278 defaults, re-run block 1) | 83 / - / - | 43 | dodge 68 |
| W279 branch | 43 / 48 / 60 (W279) | 38 | |
| back-off charge only, GAP 200, OPEN 1.0 | 80 / 80 / 85 | 50 / 40 / 35 | PC idle survives |
| same, OPEN .8 / .85 / .9 | 60-73 / 68-73 / 73-85 | 35-40 / 40-50 / 43-48 | noisy, non-monotonic |
| + pin via {beam} | 20 / 28 / 25 | 28 / 30 / 18 | W191 FAIL, rejected |
| + pin via reach, GAP 200 | 63 (blk 1) | 50 | |
| GAP 0 + pin | 78 (blk 1) | 43 | PC idle survives (charge starts at the edge, no 0.12 s launch) |
| GAP 120 + pin | 73 / 63 / 78 | 40 / 38 / 35 | PINDMG 1 identical |
| **GAP 150 + pin, PINDMG 2 (shipped)** | **73 / 78 / 78** | **40 / 40 / 33** | dodge 68 / 70 / 65 |
## Gates, shipped config (RUNS=40 x 3 blocks)
gfirst 73/78/78 (75+-8 PASS), dodge 68/70/65 (PASS), idle 0/40 x3 (PASS), nearest 40/40/33 (25-40 PASS), stand-still 19.6 s x3 (>= 17.8 PASS), W191 reach PASS.
Still failing as on base: threat peak (62-63%), cover >= 3 (0.3), W173 D3 depth spread (28-29%) in 2 blocks.
## Real input, boss isolated (JUMP=152), final build
| bot | phone 390x763 | PC 1440x860 |
|---|---|---|
| idle, TS 4, 1 seed | died at 174 s, boss 226/288 | died at 187 s, boss 288/288 (was: never died) |
| masher, TS 4, 1 seed | died at 183 s, boss 239/288 | died at 308 s, boss 42/288 (was: cleared) |
| state-aware (tactician), TS 2, 2 seeds | 0/2, died, boss 112 / 160 left | 0/2, 110 s real cap, boss 114 / 120 left |
## Decision
Shipped: the config that holds every gate and the idle/masher checks (table above). UNMET: the 40-80% clear target for the state-aware bot (0/4 at TS 2 with 2 seeds,
not 8; it loses 4-8 hearts to charges). Not run: dodger, 8 seeds, full stage from the title.
