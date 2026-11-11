# Playtest: Kaiten Kitchen ("skipper" persona: skips every tutorial)
Screens are in scratchpad/pt3/skipper/ (abbreviated below as S/NNN-*.png)

## Per-screen log
(what I think is happening | what I'd do | confidence 1-5 | confusion | fun 1-5)
- 001 title | it's a sushi-belt card game, tap Play | 5 | none. Text-tap on "Play" timed out in the driver, coordinate tap worked | 4
- 003 who is at the counter | guided game is the big red recommended button, I skip it and press "Normal game" (me vs Odile + Kofi) | 5 | "Configure" is there but I didn't need it | 3
- 004 R1 T1 hand of 9 plates | pick one card per turn, hands pass around (conveyor-sushi drafting). Green +N badges = points now, "end" = scored later | 4 | the "custard" dotted slot on my belt before I own any custard; what the bells next to the opponents do; the "..." box | 4
- 005 card lifted | Serve / Hint / Cancel, info panel explains Fire Paste (x3 next nigiri) | 5 | none, very clear | 4
- 007 hand passed | Kofi's hand reaches me, opponents' picks show on their belts with +3/+1, last-turn log at bottom | 4 | "The hands pass one seat to the left" but the label says "passes to Odile" (who is ABOVE me). Left/up mismatch | 4
- 008 lifted Seaweed Roll | all badges switch to "what it would be worth" and Serve shows (+6) | 5 | nice, I could compare cards by tapping one and reading the others | 4
- 013 Moon Nigiri on paste = +9 | the combo pays out, log explains it ("+3 nigiri, +6 Fire Paste x3") | 5 | none | 5
- 016-019 | denying nigiri to Odile, who has a paste | 4 | my score went 17 -> 15 after I scored +1: Kofi overtook the roll race and I dropped to 2nd ("2nd now +3"). Explained, but scores going down mid-round surprises you | 4
- 026 served Custard Cup | the -3 in the log is about the roll race, not the custard | 3 | my custard never showed up on my belt (Odile's did), so I couldn't see I owned one. Only the text line "Custard... You 1" told me | 3
- 032/033 Round 1 scoring | per-category table counts up, then an order slip with R1/R2/R3/Custard/Total | 5 | none, good screen. Me 18, Odile 14, Kofi 18 | 4
- 035 R2 T1 | the custard now shows on my belt with count 1 | 4 | the bottom log still shows the last turn of the previous round | 4
- 045-047 Twin Sticks | "Use Twin Sticks (serve 2)" button shows up, I pick 2 buns, "Serve both (+3)" | 5 | 4 buttons squeezed into one row with tiny text; my custard slot gets cut off ("cus...") | 4
- 055-061 | roll race labels "2 behind", "tied 1st now +3" | 3 | "1 behind" on Kofi's belt with no subject (behind on what? rolls) | 3
- 064 Round 2 scoring | Odile 20 thanks to prawns and fish. Roll tie rule explained in plain words | 5 | none | 4
- 066 R3 T1 | I'm tied 2-2 on custard, so I take custard | 4 | none | 4
- 082-084 Twin Sticks on 2 Fish Slices, gambling on a 3rd | 4 | none | 4
- 090 | opponent belts overflow; the right side is cut off ("cu", "=") | 3 | I can't see everything opponents own | 3
- 091/092 tapped "..." and the bell | nothing happens | 2 | the bell and "..." look tappable but do nothing | 2
- 098 Round 3 scoring | 50-50 with Odile before custard | 5 | none | 5
- 100 Game over | "You win with 56 points", custard +6 for me, -6 for Odile | 5 | confetti covers the numbers a bit | 5
- 101 Log | full history | 4 | the log says "Puddings" while the game calls them "Custard Cups" everywhere else | 3

## Final report
### (1) Goal and what a round is
Get the most points over 3 rounds by drafting plates. In each round everyone gets 9 plates, keeps 1 each turn and passes the rest on, so a round is 9 turns. Sets score at the end of the round (rolls race, prawn pairs, fish triples, buns stepping up, nigiri, Fire Paste triples your next nigiri). Custard cups pile up across all rounds and are scored once at the end: most gets +6, fewest gets -6.

### (2) Top 10 confusion moments
1. My Custard Cup didn't appear on my belt after I served it in R1 (Odile's did). S/026-wait.png, S/029-wait.png
2. A dotted "custard" slot with 0 sits on my belt before I own any custard. S/004-195_413.png
3. "Hands pass one seat to the left" vs "passes to Odile", who sits above me. S/007-wait.png
4. Bells next to the opponents look interactive but do nothing. S/092-362_79.png
5. The "..." box at the end of my belt does nothing when tapped. S/091-355_216.png
6. Opponent belts overflow and the rightmost items are cut off. S/090-wait.png
7. My total drops mid-round (17 -> 15) right after I scored. S/019-wait.png
8. Bare roll-race labels like "1 behind" / "2 behind" with no subject. S/055-wait.png, S/058-wait.png
9. The log says "Puddings", the game says "Custard". S/101-266_22.png
10. The bottom "Last turn" panel still shows the previous round's turn at the start of a new round. S/035-wait.png

### (3) "What just happened?" moments
- 17 -> 15 after scoring +1 (I lost the roll lead). Explained only by the small "2nd now +3" chip.
- Served custard and saw "-3" in the log. That was the roll race again, not the custard.
- Odile's score jumped to 20 in R2 with 10 for prawns and 10 for fish. The last-turn set completions were easy to miss.
- In R3 Odile's chips showed "x2 = 4" and "x2 = 6", but the scoring table listed Steam Buns 1 and Nigiri 10. I couldn't connect the chips to the table.

### (4) Too much on screen
At 390px each belt row packs a score bubble, delta badge, chips, a custard slot, "..." and a bell. The 4-button row during Twin Sticks is cramped. The bottom panel stacks the score chips, the custard line and a 3-line log, so it's very text-heavy. Confetti partly covers the final table.

### (5) Final score
I won with 56 to Odile 44 and Kofi 41 (rounds 18/15/17, custard +6). Points came from the roll race (1st twice, tied 1st once), the Moon Nigiri on Fire Paste combo (+9), a fish triple in R3 (+10, set up with Twin Sticks) and 4 buns in R2 (+10). I took the most custard (4), and Odile's fewest (2) cost her -6, which decided a 50-50 tie. I lost points by dropping out of roll leads and from having no prawns at all.

### (6) Unreached
I didn't open Configure (number or type of opponents), Diners and scores, How to play, Menu, Online or Hot-seat (persona). Bell and "..." did nothing. Driver text-tap on "Play" timed out, but the coordinate tap worked.

### (7) Fun verdict: 4/5
I learned it without any tutorial because the projected +N badges on every card make each choice readable, and the end-game custard swing gave me a tense, satisfying win. The belts are just too crowded on a phone.
