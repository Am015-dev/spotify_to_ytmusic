# W280 street boss close (branch nr/W280-street-close from nr/W279-boss-final). 30 Oct 2026. Numbers: BALANCE-W280.md. Not deployed.
Logs and shots (not committed): `/tmp/claude-0/-home-user-spotify-to-ytmusic/d6170001-44b9-5bf8-9a4b-e1db8e676850/scratchpad/w280/` (triv/*-boss|death|result-down.jpg, tac/, hud/hud-*.png).
## Code
- parts/street/streetboss.js: back-off only before a charge (GAP 200 -> 150); pin(): a charge that reaches the screen edge slams a Kai pinned there (PINX 28, PINDMG 2);
  dead fw widening in low() removed (streetreach.js ignored it); constant block = shipped defaults, no flags; the always-true GAP guard removed.
- parts/street/purefoot.js tells(): the OVERDRIVE/GUARD edge meter goes under the boss name bar (it drew on top of BIG HEAVY's name).
- qa/streetsim.js: INFO phase line per bot (reached boss, hearts at boss, boss-on time, boss won). qa/bossbar-layout-test.js: new, see below.
## Status
- Gates all in band over RUNS=40 x3; PC idle dies; PC masher loses (boss 42/288 left: close). Phone idle/masher die.
- UNMET: state-aware bot 0/4 at TS 2 (target 40-80%); 2 seeds per device only. Not run: dodger, full stage from the title, 8 seeds.
- GUARD/OVERDRIVE overlap: fixed in the phone shot (hud/hud-390x763.png). qa/bossbar-layout-test.js FAILS: the HUD's recorded boxes (L.hud.hud, hint) are not
  in the coordinates they are drawn in (the boss box is offset by t0; hint vs panel overlap is reported though the shot shows none), and at 844x390 it finds no
  boss bar. Fix the recorded boxes in streetlook.js slHud (box(bx,by-t0,...) subtracts t0 twice), then the assertion means something.
- Shots looked at: phone boss start before/after (overlap fixed; the boss figure overlaps Kai at start). Wind-up / charge / kill shots and landscape: NOT taken.
## Next (one task, opus): the state-aware bot at TS 2 vs the pinned slam (it backs into the corner too); try PINDMG 1 or a jump answer in the bot, 8 seeds per device.
