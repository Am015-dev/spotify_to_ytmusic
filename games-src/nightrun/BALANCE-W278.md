# BALANCE W278: a fair street boss fight (30 Oct 2026)

Problem (W277, measured): the big heavy was not beatable by any bot on phone or PC; 53 of 57 hearts went to street foes that kept joining during the fight.
Player decision: during the boss the player chooses when to punish the big heavy (after a charge into the wall it is OPEN and takes full damage) and
when to spend that time clearing the one add on the road. The boss's wind-ups are the main threat; an add is an optional risk.
Rule (one owner, `parts/street/street3.js`, `S3.T.bAdd`, flag `RET.bossadds`, `?bossadds=0` = old):
- while the boss is on, at most `cap` street foes besides the boss at once;
- a new add waits `gap` s after the previous one;
- no add enters while the boss winds up (`wind`) or charges.
Waves that are held stay queued (the stage plan is unchanged before the boss).
Numbers: see the sweep table below (boss fight isolated with JUMP=152, real touch / keys, TS 4, 8 seeds).
