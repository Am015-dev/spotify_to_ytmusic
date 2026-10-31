# W300 street boss duel, part 2 (branch nr/W300-duel2 from nr/W290-boss-duel), 31 Oct 2026. Not deployed. Verdict: DO NOT SHIP YET (streetsim gates, phone late)
Design + final constants: BALANCE-W300.md. Logs / shots (not committed): /tmp/w300/ (g/<run>.log + results.json, ss1-3.log + streetsim1-3.md, shots/).

## Code changed
- parts/street/streetboss.js (owner): SB.draw draws the duel: the answer word over the boss (PC key / phone button label), attack colour, a bar to the last
  accepted moment, tick / cross for the answer; OPEN x2 + 1.6 s bar + "PARRY!/DODGED!/CLEARED! HIT IT NOW"; red flash + WRONG / TOO LATE. Old tips + touch ghost
  muted while the boss lives (IN.hintOn / IN.ghost wrapped). The boss no longer sets e.tele (purefoot.js forced the 'shoot' frame on every telegraph = why the
  three poses looked the same); per-attack draw scale on the owner's melee / crouch / idle / hit frames. Windows: TEL 1.0/1.05/1.1, accepted until .69/.79/.95 s
  (+.04 s touch). S.sbL = this fight's log.
- parts/street/purefoot.js: two hook lines (e.dsc draw scale; F.SB.draw after the HUD). The pop list (S.pop / IN.pop) is still not drawn in purefoot: W290's pops
  were invisible for that reason; the duel draws its own words.
- qa/gauntlet-foot.js: duelist / late play the street as the W286 dodger (was tactician); the dodger answers telegraphs (300-450 ms).
- qa/streetsim.js: dead W167 / W186 boss answers removed; DUEL block answers sb_tel with per-bot reaction (nearest .45-.8, gfirst .3-.5, dodge .25-.4 s);
  reach check leaves out charge / pound band hits (body / ground, {beam:1}) by design. qa/bossduel-shots.js: clock frozen per shot, wrong-answer shots.
- Pre-boss untouched, proof: `git diff 9c261877 -- games-src/nightrun/parts/` (merge base with alex/brave-carson-rbpmlk) lists only streetboss.js and the two
  purefoot.js lines (both act only while the boss lives).

## Boss only (JUMP=152), real input, TS 3, final tuning unless noted
| cell | duelist | late | dodger | idle | masher | random |
|---|---|---|---|---|---|---|
| PC 1440x860 | 2/2 (+2/2 at accept .75/.85) | 1/4 | 1/1 | 0/1 | 0/1 | 0/1 |
| phone 390x763 | 2/2 | 0/4 (boss left 2/15/32/100 hp) | 0/1 | 0/1 | 0/1 | 0/1 |
| phone 844x390 | see /tmp/w300/g/d2.log (2 seeds, may be cut by the stop) | same | NOT RUN | NOT RUN | NOT RUN | NOT RUN |
8 seeds per cell NOT RUN (45 s per run; one browser; tuning took 4 late rounds, see BALANCE-W300.md trail). Duelist: 0 hearts lost in every boss-only run = 100%,
above the 60-90% band: a 250-350 ms reader never misses with these windows; the band would need attrition (adds, a faster second half), not shorter windows.

## Full stage from the title, real input, combined bot (dodger before the boss, duelist at it)
| | runs | cleared | deaths |
|---|---|---|---|
| PC duelist | 3 | 3/3 | none (hearts lost before the boss to rushers / gunners / heavies) |
| phone 390x763 duelist | 3 | 2/3 | seed 1 died at 111 s to rushers (10 rusher hits), never reached the boss |
| late, both devices | NOT RUN | | |
(The first PC run may have loaded the build before the last tuning step; duelist is unaffected by it.)

## streetsim RUNS=40 x3 (SEED0 4321 / +316760 / +633520)
reached the boss nearest 22,19,26 / gfirst 34,34,33 / dodge 27,22,25 of 40; WON THE BOSS 0 in every block -> nearest / gfirst / dodge clear 0% = FAIL x3.
The sim DUEL block is not taking effect (band hits also read 0, so S.sbL / the boss path is not reached as expected): not diagnosed. Idle dies 40/40 x3 PASS.
W196 'non-attacking foes stand still < 20%': 11.8 / 12.2 / 11.8% PASS. The "stand-still >= 17.8 s" in the W300 brief is this gate misread: it is a % of foe
time with gate < 20% (W263 baseline 17.8%, range 16.8-18.8); no 0.2 s is missing. W191 reach check: still FAIL (1420/1733 etc.): the 313 extra hurts are not the duel
bands (counted 0); not the duel's swing either (it goes through the reach test); not diagnosed.

## Shots (/tmp/w300/shots/, 390x763, 844x390, 1440x860: tele-swing/charge/pound, right-answer, punish-open, wrong-mark, wrong-flash, kill, result)
Looked at: words readable at all 3 sizes, colour per attack, bar visible; the 1440 kill shot is still missed (boss dies between polls). Before the last fix the
844x390 OPEN label was covered by the DODGED! pop (fixed: one line under OPEN). Pound stretch pushes the boss's head into the boss bar at 1440x860.

## Next (one task each)
1. Debug the streetsim DUEL block (print I.guard/dash/jump + e.state in one sim run at the boss) so the whole-street gates measure (sonnet).
2. Phone late reader 0/4: try touch grace .06 with 8 seeds per cell; then the 8-seed matrix incl. 844x390 (haiku, mechanical).
3. Decide with the owner whether duelist 100% boss-only is fine (full stage is 5/6 with the pre-boss attrition).
