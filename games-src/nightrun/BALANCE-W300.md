# W300 street boss duel, final constants (code: parts/street/streetboss.js tuning block; W290 design kept, BALANCE-W290.md items 1-14 still hold)
Player decision: read the word over the big heavy and press that control (GUARD / DASH / JUMP) before its bar runs out; right = it is OPEN x2 for 1.6 s, so hit it.

| constant | W290 | W300 | why |
|---|---|---|---|
| TEL (telegraph start -> hit, s) swing / charge / pound | .85 / .95 / 1.0 | 1.0 / 1.05 / 1.1 | longer show of each pose, more time to see the word |
| READ end (TEL - CUT, s) | .60 / .75 / .85 | .56 / .66 / .82 | the boss tracks Kai until here, then commits to that side |
| GRACE (answer still counts after READ end, s) | 0 | .13 | last moment an answer counts: .69 / .79 / .95 s (the bar over the boss empties then) |
| TGRACE (extra on a touch screen, s) | 0 | .04 | tap latency: .73 / .83 / .99 s on a phone |
| first answer counts | yes | yes | a later press never changes it; a first press after the bar = TOO LATE |
| PUN (OPEN after a right answer, s, x2 damage) | 1.6 | 1.6 | |
| damage swing / charge / pound (hearts) | 1 / 2 / 1 | 1 / 2 / 1 | |
| REC / GAPT / CAMP (s) | .9 / .9 / 4 | .9 / .9 / 4 | |
| HP | 36 x 6 = 216 | 216 | |
| POUND rise (px) | 26 | 40 | reads as a jump-up from far |
| drawn pose shape (x, y scale; the owner's frames only, 17h) | none | swing melee frame 1.10 x 1.10, charge crouch frame 1.16 x .84, pound idle frame .94 x 1.16 (grows over the READ part); OPEN = hit frame | the three telegraphs read apart; purefoot.js used to force the 'shoot' frame on every telegraph (e.tele > 0), the boss no longer sets e.tele |

Drawn (streetboss.js SB.draw, called by purefoot.js after the HUD): the answer over the boss in the attack's colour (PC: GUARD [I] / DASH [SHIFT] / JUMP [K];
phone: the button's own label GUARD! / DASH! / JUMP!), a bar under it that empties at the last moment the answer counts (white word = too late), a tick / cross
for the answer given; right: OPEN x2 in green with a 1.6 s bar and "<PARRY!|DODGED!|CLEARED!> HIT IT NOW"; wrong / late: a 0.22 s red flash over the street and
"WRONG: <answer>" / "TOO LATE: <answer>". The old street tips (step to dodge, run right, the guard tip) and the touch ghost hand are muted while the boss lives.

Tuning trail (boss-only late reader, 4 seeds each, PC / phone): accept .75/.85/.95 = 4/4 / 3/4; .68/.78/.95 = 1/4 / 0/4; .70/.82 = 3/4 / 0/4; .70/.80 + touch .08 = 4/4 / 4/4; final .69/.79/.95 + touch .04 = 1/4 / 0/4 (phone runs ended with the boss at 2-100 hp).
The late reader (fixed 600 ms) is a knife edge: a few hundredths of a second swing it from 0 to 100%, so the band needs 8+ seeds per cell, which did not fit.
