# W281 boss hp sweep (branch nr/W281-boss-hp from nr/W280-street-close). 30 Oct 2026. Numbers: BALANCE-W281.md. Not deployed. Result: hp stays 288; band 40-80% NOT reached.
Logs and shots (not committed): `/tmp/claude-0/-home-user-spotify-to-ytmusic/8c1a8acc-a6a3-5dec-a9fb-3c7f83b5abee/scratchpad/w281/` (sweep-tactician.txt, verify.txt, v2.txt, ss-*.txt streetsim, out/<cell>/ per run, hud/hud-*.png, out/full-phone|full-pc shots).
## Code
- parts/street/streetlook.js: boss bar HUD box recorded without the second t0 subtraction (recording only; the draw was right).
- qa/bossbar-layout-test.js: boss bar found by width, vw returned, built-in detector self-check, OVERLAP=1 deliberate failure, DBG=1 prints boxes. Passes at 390x763, 844x390, 1440x860.
- parts/street/street2.js: comment on the heavyDef line only, value unchanged (120 = boss hp 288).
## Findings
- Sweep 180-288, state-aware bot TS 2, 3 seeds per cell: PC 0/18, phone 3/18 (hp 200, 220, 260). The dodger-only bot (1 seed) cleared PC at both hp values, so it is stronger than the state-aware bot on PC: the bot is the problem, not the hp.
- The PC state-aware bot deals about 45 boss hp per run at any hp (frontal hits heal the heavy 70%, street2.js onHit). Phone loses 4-8 hearts per run to charges.
- Lower hp breaks the nearest-first gate (hp 260: 45%, 200: 53%, band 25-40), so hp stays 288.
- Full stage from the title: phone died in the boss (226 left), PC died at 33 s to rushers (bot). 1 seed each.
- Looked at: phone boss shot (boss head sits under the name bar, HUD stack takes the top 190 px of 763), phone result screen (RETRY and TITLE visible; the dimmed HUD name bar shows through above YOU WENT DOWN), 844x390 HUD (hint line crowds the hearts panel edge; Kai is nearly invisible against the dark street). NOT taken: wind-up, charge, kill shots; 1440x860 shots.
## NOT done
8 seeds per cell (3 done), dodger at 8 seeds, idle/random 3 seeds (1 done), masher 8 seeds (1 done), streetsim 3 blocks at the final build (1 done), full stage 5 seeds per device (1 done), shots of the wind-up / charge / kill.
## Next (one task, sonnet): fix the tactician (shoot the heavy from behind or while stunned, no frontal kiting, jump or dash the charge) so it out-plays the dodger, then re-sweep hp 180-288 with 8 seeds; keep hp 288 until then.
