# BALANCE W278: a fair street boss fight (30 Oct 2026). STATUS: opt-in only (?bossadds=1&sbhp=5); the PC gate fails, defaults unchanged.

Problem (W277, measured): no bot beat the big heavy on phone or PC; 53 of 57 hearts went to street foes that kept joining during the fight.
Player decision: during the boss the player picks when to punish (after a charge into the wall the big heavy is OPEN and takes full damage)
and when to back off from its wind-ups (charge, barrel, pound). The boss's telegraphs are the whole threat; there is no add to juggle.
Rule (one owner, `parts/street/street3.js` wave loop): with `RET.bossadds` on (`?bossadds=1`), no street foe joins once `S.bossOn`;
foes already alive stay, and held waves just wait. Boss hp: the existing knob `HPK` in `parts/street/streetboss.js` (`?sbhp=`, default 8).
Sweep: boss fight on its own (JUMP=152 puts Kai at the arena; every unspawned wave of the stage is queued, so it OVERSTATES adds vs a full run),
real touch / keys, TS 4, state-aware bot (tactician), 8 seeds each. Clears / boss hp left of the max at death:
| adds during boss | boss hp | phone | PC |
|---|---|---|---|
| 1 at a time, 6 s apart, none in wind-up/charge | x8 (288) | 0/8 (175-248 left; rushers took 3-7 hearts a run) | not run |
| none | x8 (288) | 1/8 (102-149) | not run |
| none | x5 (180) | 5/8 twice (48-66) | 1/8 (105-148) |
Choice: no adds at all (cap 1 measured worse). x5 meets the phone gate (>= 30%, <= 90%); PC 1/8 misses >= 50%, so both stay opt-in (rule: ON only if the gates hold).
PC cause (seen in hurtBy): boss melee 4-5 hearts per run; PC has no auto-fire, so a bot backing off faces away and does not shoot. The bot now
turns to shoot every other 0.4 s; that lifted PC damage (boss left 105-148 instead of 153-176) but not the clear rate. A PC human aims; the bot does not.
Trivial check (flags on, 3 seeds): phone idle never dies (1 heart lost in 300 s) and a PC masher cleared: the flags are NOT shippable as they stand.
