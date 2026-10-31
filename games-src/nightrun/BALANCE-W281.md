# BALANCE W281: street boss hp sweep (30 Oct 2026). Branch nr/W281-boss-hp from nr/W280-street-close. Not deployed.
Method: built game copied per hp with only `heavyDef(<hp>/2.4,...)` changed in the copy (boss hp = value x0.3 x HPK 8). qa/gauntlet-foot.js, STRATS=tactician (state-aware), boss isolated (JUMP=152),
TS 2, real input (CDP touch 390x763 / keyboard+mouse 1440x860), one browser at a time. **3 seeds per cell, not the 8 asked for**: one run is ~45 s real, 96 runs did not fit the 60 min limit.
## State-aware bot, TS 2 (clears / 3, clear time, hearts lost per run (of 6), boss hp left on the failed runs)
| hp | phone | PC |
|---|---|---|
| 180 | 0/3, -, 5 5 6, left 92 89 78 | 0/3, -, 7 6 6, left 121 149 132 |
| 200 | 1/3, 222 s, 5 6 5, left 126 52 | 0/3, -, 5 6 5, left 149 158 138 |
| 220 | 1/3, 220 s, 5 6 6, left 132 86 | 0/3, -, 4 5 6, left 172 195 215 |
| 240 | 0/3, -, 4 8 6, left 161 74 141 | 0/3, -, 5 7 5, left 193 239 226 |
| 260 | 1/3, 242 s, 6 5 4, left 101 163 | 0/3, -, 6 7 6, left 244 260 204 |
| 288 | 0/3, -, 6 4 5, left 111 224 152 | 0/3, -, 6 9 5, left 234 288 234 |
Read: no cell is in 40-80% on both devices. PC never clears; on PC the bot removes about 40-60 boss hp per run whatever the hp (left = hp - ~45), so hp is not what limits PC. Cause (code read, not tested):
onHit in street2.js heals the heavy by 70% of every frontal hit; the bot "kites and shoots" from the front, and keys/mouse fire lands fewer stun/back hits than the phone auto-fire. Phone loses all 6 hearts too (4-8 per run).
## Dodger-only bot (STRATS=dodger, TS 2, boss isolated, 1 seed per cell: NOT 8, so only indicative)
| hp | phone | PC |
|---|---|---|
| 288 | died 186 s, boss 229 left, 4 hearts | CLEARED 256 s, 1 heart |
| 200 | died 182 s, boss 149 left, 4 hearts | CLEARED 244 s, 7 hits |
The dodger does NOT clear less than the state-aware bot (PC 1/1 vs 0/3 at both hp). The expected ordering is not shown; the state-aware bot is the weaker player on PC. Next worker: fix the bot first (stop kiting in front of the heavy), then re-sweep.
## Decision
Chosen hp 288 (unchanged, heavyDef(120,...), comment on the line). Rule 2: nothing fits 40-80% on both devices; best min(phone, PC) is 0/3 in every cell, so the tie goes to the highest hp. Distance from the band: PC 0 (target 40), phone 0-33.
Lowering hp also breaks the casual gate on streetsim block 4321 (nearest-first clear %): hp 288 40, 260 45, 240 48, 200 53 (band 25-40), gfirst 73-75 and dodge 68 do not move. So 288 is the only tested hp that holds the gates.
## Checks at hp 288
- streetsim RUNS=40, block 4321 (this build): gfirst 73, dodge 68, nearest 40, idle 0/40, stand-still 19.6 s, W191 reach PASS. W280's three blocks (73/78/78, 68/70/65, 40/40/33) stand: the only code changes since are the HUD box recording and qa. Blocks 9001 / 17003 at hp 200 (for the table): gfirst 80 / 83, nearest 40 / 43, dodge 70 / 65.
- idle (TS 4, 1 seed, not 3): phone died 174 s boss 223 left; PC died 176 s boss 288 left. random (TS 4, 1 seed): phone died 198 s; PC died 198 s. masher (TS 4, 1 seed, not 8): phone died 196 s, boss 232 left; PC died 222 s, boss 173 left. All die; masher <= 10% shown only by 0/2.
- Full stage from the title, tactician TS 2, 1 seed per device (not 5): phone died at 180 s (boss on at 144 s, boss 226 left, 20 hits: rusher 11, gunner 4, heavy 1, boss 4; the 6 hearts refill by pickups), 0 console errors, result screen with RETRY and TITLE both visible.
  PC died at 33 s, 7 hits all from rushers before the boss (the bot, not the boss; not investigated). 0/2 clears.
## Bossbar test (qa/bossbar-layout-test.js): PASS at 390x763, 844x390, 1440x860
The offset was only in the recording: slHud boxes are stored relative to t0 by box() and the boss bar call subtracted t0 again (streetlook.js, one call fixed). The drawn bar was already in the right place.
The test also failed at 844x390 because it searched for a bar <= 40 px tall in view units (the bar is 42 there); it now matches the bar by width (0.7 x view width). OVERLAP=1 adds a deliberate overlap and the test then FAILS at all three sizes (proved);
each run also checks that its detector sees a 6-unit nudged copy of the bar.
