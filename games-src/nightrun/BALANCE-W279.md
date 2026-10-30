# BALANCE W279: the street boss as the default (30 Oct 2026). STATUS: NOT DONE. The code on nr/W279-boss-final makes it the default, but the streetsim gfirst gate regresses (83 -> 43-60%) and PC idle/masher fail: do NOT merge or deploy as is.

Player decision: during the boss the player reads which attack is coming (charge / barrel / pound / leap, every wind-up 0.8 s) and picks its answer
(jump or dash the charge, step back from the barrel, jump the wave, leave the ring), then punishes the 1 s OPEN after each attack. There are no adds.

## Root cause of "the boss is too passive vs a still Kai" (measured, boss trace per 0.5 s, phone idle, W278 flags on)
After its first charge the big heavy stood 19 px from Kai, with Kai near the left screen edge. Every later charge pointed into that edge, the wall test
fired on the first frame (charge -> stun before its 0.12 s launch), so it never hit again: 1 heart in 300 s, while touch auto-fire wore it down.
A second cause: the charge stops when the DRAWN figure (fw 58) reaches the screen edge, 49 px short of a cornered Kai with the 54 px attack box.

## The change (one owner each; named constant block at the top of parts/street/streetboss.js)
| number | was | now | why |
|---|---|---|---|
| adds once the boss is on (street3.js wave loop) | opt-in ?bossadds=1 | none, always | W277/W278: adds cost 53 of 57 hearts; flag and its off-branch deleted |
| GAP: run-up before a charge | none | 200 px | when its attack is due and Kai is closer, the boss backs off (110 px/s) until 200 px or the screen edge, then winds up: a still or cornered Kai is charged every cycle |
| charge reach | 54 px body box | front of the drawn figure (fw) | a charge stopped by the screen edge lands on a cornered Kai; body hitbox (what Kai hits) unchanged |
| CHDMG: hearts per charge | 2 (in heavyDef) | 2 (now a named constant) | sweep: 1 let the phone bot clear 8/8 and an idle phone Kai outlast the boss |
| WIND throw / leap | 0.7 / 0.6 s | 0.8 / 0.8 s | every telegraph >= the 0.80 s phone reaction window (W277); charge and pound were already 0.8 |
| HPK (boss hp = 36 x HPK) | 8 (?sbhp= opt-in 5) | 8 = 288 | sweep below: 180 and 234 are cleared by the state-aware bot; ?sbhp deleted |
PC melee (task 2): the 4-5 hearts the PC bot lost to "mel:bigheavy" were the charge (2 hearts, 0.8 s wind-up, 1.1 s run, HITGAP 1.5 s already stops double hits).
The cause was the harness, not the attack: the tactician dodged a charge only if Kai FACED the boss (`front(hv)`); on PC Kai backs off facing away
(no auto-fire), so it never dodged (swA: 80 charge hits over 8 PC runs). Fixed in the bot (react to a heavy winding up toward Kai, any facing).
A second harness effect: PC frames are 50-66 ms at 1440x860, so at TS 4 the bot decides every ~0.26 s game time (a charge moves 146 px between looks).
PC and phone were therefore compared at TS 2 (phone ~0.14-0.16 s per decision, PC ~0.13 s).

## Sweep (boss isolated: JUMP=152, no adds, real touch 390x763 / keys 1440x860, state-aware bot, GAP 200 unless noted)
| cell | TS | phone clears | PC clears | notes |
|---|---|---|---|---|
| A hp 180, charge 1 (old bot) | 4 | 8/8 (41 hits taken in total) | 3/8, 0 deaths, 5 timeouts | PC bot never dodged a charge (front bug): 80 charge hits |
| B hp 180, charge 2 | 4 | 3/8 (dead with boss at 23-85 hp) | 0/2 (died boss 91-122) | TS 4 PC = slow bot, not counted |
| B hp 180, charge 2 | 2 | not run | 3/3 (1-2 hits) | |
| C hp 234, charge 2 | 2 | 3/3 (1-6 hits) | not run | |
| D hp 288, charge 2 (on the branch) | 2 | 3/3 (4-6 hits) | 1/1 (3 hits, 254 s fight) | PC seeds 2-3 cut for time |
Cells with fewer than 8 seeds were cut for time (60 min cap); see HANDOFF-W279.md.

## What the numbers say
With equal reaction time the state-aware bot beats every hp in 180-288 (hp is not the lever at TS 2); at TS 4 on the phone (slower decisions) hp 180 gives 3/8.
So the 40-80% band was NOT shown: the result depends more on the bot reaction speed than on hp. On the branch: hp 288 (unchanged, the
hardest allowed), with a boss that now attacks a still or cornered player. Trivial bots on the branch build (1 seed each, boss isolated, TS 4):
| bot | phone | PC |
|---|---|---|
| idle | died at 57 s of fight, boss 142/288 (was: never died) | NOT dead after 216 s, 2 hits: FAIL |
| random | died, boss 192/288 | died, boss 269/288 |
| masher | died, boss 217/288 (no touch crash: harness fix works) | CLEARED: FAIL |
PC idle trace: after the first hit every charge ends 50 px from the still Kai and goes to OPEN without a hit (stun at dx 50 each cycle), so
something still holds the boss off a still PC Kai (a body push or the guard rule are the suspects; not found in the time). Dodger bot: not run.

## Gates (streetsim RUNS=40, blocks SEED0 4321 / 9001 / 17003, branch build; base = W277/W278 numbers, base NOT re-run)
| gate | base | branch | |
|---|---|---|---|
| gfirst 75+-8 | 83 / 80 / 83 | 43 / 48 / 60 | REGRESSES: stops the change |
| dodge 65+-8 | 68 / 68 / 65 | 68 / 70 / 63 | held |
| idle 0 | 0/40 | 0/40 x3 | held |
| nearest 25-40 | 43 / 38 / 38 | 38 / 30 / 25 | held (moved down) |
| stand-still >= 17.8 s | 19.6 | 19.6 | held |
streetsim's clear rate includes the boss, so these are NOT pre-boss-only gates: the boss that now charges a still/cornered Kai beats the sim's gfirst bot
(it does not dodge charges well). Threat peak 50-52% and cover 0.3 fail as on base.
