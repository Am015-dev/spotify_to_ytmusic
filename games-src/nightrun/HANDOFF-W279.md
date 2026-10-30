# W279 street boss final (branch nr/W279-boss-final from nr/W278-boss-fair). 30 Oct 2026. STATUS: NOT DONE, do not merge/deploy as is.
Numbers, sweep, gates: BALANCE-W279.md. Logs, results.json, auto shots (not committed): `/tmp/claude-0/-home-user-spotify-to-ytmusic/cb911ec6-787c-5dbe-adc6-638917e8cbdb/scratchpad/w279/`
(swA, swB-phone-log.txt, swBpc-log.txt, swC-log.txt, swD-log.txt, triv/ with per-run shots, pcidle/ boss trace, streetsim1.md, streetsim-9001.md, streetsim-17003.md).
## What changed (code)
- `parts/street/streetboss.js`: named tuning block (WIND, OPEN, ROAR, LEAPT, HPK=8, CHDMG=2, GAP=200, BACKV=110). New `back()`: when its attack is due and Kai is
  closer than GAP, the boss backs off (110 px/s) to a 200 px run-up or the screen edge, then winds up. The charge's reach covers the front of the drawn figure (fw).
  Throw and leap wind-ups 0.7/0.6 -> 0.8 s. `?sbhp` deleted.
- `parts/street/street3.js`: no street foe joins once the boss is on, always; `RET.bossadds`/`?bossadds` deleted (WORKER-RULES 18).
- `qa/gauntlet-foot.js`: touch ids reused (lowest free, <= 10) and a lifted finger is sent as touchMove of the fingers still down (the masher no longer crashes
  CDP); tactician dodges a heavy's charge aimed at Kai whatever Kai's facing (PC bug: 80 charge hits in 8 runs); `BOSSADDS` knob removed; `BTRACE=1` boss trace.
## Results (all boss isolated with JUMP=152; full stage from the title NOT run)
- Root cause found and fixed: the passive boss was charging into the screen edge from 19 px (phone idle now dies at 57 s, boss 142/288).
- State-aware bot at TS 2 (equal reaction phone/PC): clears hp 180 (PC 3/3), 234 (phone 3/3), 288 (phone 3/3, PC 1/1). 40-80% band NOT reached in 180-288.
- FAIL: PC idle does not die (2 hits in 216 s: every charge stops 50 px from a still PC Kai and goes OPEN, cause not found). PC masher cleared 1/1.
- FAIL: streetsim gfirst 43/48/60% vs base 83/80/83 (dodge 68/70/63, idle 0, nearest 38/30/25, stand-still 19.6 s held). streetsim includes the boss.
- NOT run: 8-seed final runs, dodger, full-stage runs from the title, wind-up/charge/kill shots, landscape. Looked at: phone boss start (GUARD tip + OVERDRIVE
  label still overlap the BIG HEAVY name bar; boss figure overlaps Kai) and phone result screen (RETRY/TITLE visible, fine).
## Next step (one task, opus)
1. Find why the PC charge stops 50 px from a still Kai (BTRACE=1 PLAT=pc STRATS=idle; log the charge's x, the melee box and pbox each frame); fix so idle dies.
2. gfirst regression: dump where streetsim's gfirst dies (DUMP=) - if at the boss, decide whether its bot should dodge charges or the boss is too hard for it.
3. Then the 8-seed sweep at TS 2 incl. a faster cadence or shorter OPEN if the bot still clears every hp; masher/random/idle/dodger; full stage x8 per device.
