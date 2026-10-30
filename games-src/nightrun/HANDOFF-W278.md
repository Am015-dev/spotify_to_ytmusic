# W278 street boss fairness (branch nr/W278-boss-fair from nr/W277-phone-boss). 30 Oct 2026. STATUS: NOT DONE. Phone passes with the opt-in flags, PC does not. Defaults unchanged.
Logs, results.json and shots (not committed): `/tmp/claude-0/-home-user-spotify-to-ytmusic/a6a1be20-2d90-500d-a9ab-75e6bc021c53/scratchpad/w278/` (sweep2-4.txt, sw-*/, mi/).
## What changed
- `parts/street/street3.js` (wave loop, owner of street spawns): `RET.bossadds` (`?bossadds=1`, default OFF): no street foe joins once `S.bossOn`. One condition on the existing cap line.
- `parts/street/streetboss.js`: only the HPK comment (default stays 8; `?sbhp=5` is the measured candidate). No other game code changed.
- `qa/gauntlet-foot.js`: `masher` bot; per run boss hp left, stage time the boss came on, hearts lost by source (`hurtBy`); `BOSSADDS=0|1`; `Q=` extra query
  string. Tactician (state-aware) bot: steps back from the boss's barrel instead of jumping it, jumps the pound's ground wave only inside 120 px (it jumped at 200 px and
  landed on it), and when backing off the heavy turns to shoot every other 0.4 s (PC has no auto-fire).
## Measured (boss fight on its own: JUMP=152, real touch 390x763 / keys 1440x860, TS 4, 8 seeds): see BALANCE-W278.md
- adds 1 at a time: phone 0/8. No adds, hp x8: phone 1/8. No adds, hp x5: phone 5/8 (run twice, 5/8 both times), PC 1/8. 
- With no adds every heart lost is the boss's (barrel/pound "bul:bigheavy" and charge "mel:bigheavy"), so the add problem is solved; what is left is the boss vs the bot.
## NOT done (time: 55 min cap)
- Full stage from the title with the flags, 8 seeds x phone/PC x tactician/dodger: NOT run. The dodger was not run on the boss either.
- streetsim RUNS=40 x3 blocks with the flags: NOT run. With the defaults OFF the shipped game is identical to W277's except for the build,
  so W277's gates stand (gfirst 83/80/83, dodge 68/68/65, idle 0, nearest 43/38/38, stand-still 19.6 s).
- The random bot: not run. Shots of wind-up/charge/kill: not taken, not looked at (the harness wrote start/boss/death/result shots per run into the folders above, unviewed).
## Next step (one task, opus): PC. Find why the PC tactician loses 4-5 hearts to the boss's melee (charge) while the phone one loses 2-3: it is the same bot apart from
auto-fire. Check whether the turn-to-shoot walks Kai into the charge; then re-run PC 8 seeds with ?bossadds=1&sbhp=5, then the full stage, masher/idle/random, streetsim x3.
If PC reaches >= 50%: switch both defaults on (bossadds, HPK 5) and delete the off branch (WORKER-RULES 18).
