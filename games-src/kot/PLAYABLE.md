# Playable pass: Crown City Smash (W386, 7 Nov 2026)

Method: the old game already has a step bar, a one-line board hint and a tutorial. I looked at title, first turn, my turn, a rival's turn, scoring and the
result at 390x763 and 1440x860 as a newcomer, then fixed what a first-time player still stumbles on. Before/after shots: `playable-shots/`.

## The 10 worst problems found (before) and what happened

| # | Problem (before) | Fix (after) | Status |
|--:|---|---|---|
| 1 | A new turn starts silently: nothing says whose turn it is except a thin outline on a tiny chip | Big animated banner "YOUR TURN" / "<Rival>'s turn" (1 s, slides in, then gets out of the way) | fixed |
| 2 | Dice are bare glyphs: three claw strokes, a bolt, a heart. Nothing says what a face does | Every die carries a word on it: STAR, ENERGY, HEAL, HIT (yellow KEEP-style when kept) | fixed |
| 3 | Score strip names were cut ("Voltu…", "Shroomh…") because a YOU badge took the room | The badge no longer eats the name; all four names show whole on the phone | fixed |
| 4 | A rival's turn is a silent sequence of dice; the pill said "<name>'s turn · tap to speed up" the whole time | The one line on the board now reads as a caption per step ("Squidrik rolls 6 dice.", "Squidrik +1★"), paced by the speed setting, tap to speed up | fixed |
| 5 | Instruction line never says how far into the turn you are | "Roll 2 of 3 · Tap dice to keep them, then Roll", "Buy phase · Tap a card to see it" | fixed |
| 6 | Help opened with "Win the city", the turn comes later; the Rules drawer had a 6-line wall of text | Help and the Rules drawer start with "How a turn works" in 5 short lines | fixed |
| 7 | The tutorial ended in the middle of a game ("Now play a real game!") and never showed scoring at the end | One full guided game in 4 chapters: first turn, Downtown, outside the city, finish at 20 stars and the real result screen (`TUTORIAL-COVERAGE.md`) | fixed |
| 8 | The tutorial's end had no proof it works to the end | `playable/tutorial.js` plays it from fresh storage at 390x763 and 1440x860, taps each spotlit target's centre, checks nothing covers it | fixed |
| 9 | Floating "-3♥" damage text landed on the "IN DOWNTOWN" ribbon in the 2D board (scenario overlap failures: cc-smash, cc-zoom, cc-end-turn, cc-art) | Pop text moved below the ribbon, at most two at once | fixed |
| 10 | Tips can stack: a "Got it" bubble, the intro card and the board hint show at once on the first turn | Not changed: they are the shared help kit's first-time coach; each is dismissible and the new banner does not appear while the intro card is open | explained |

Not done (time): per-step score pop with the plain reason ("+3 three trees in a row") exists as the board marks (`+3★`, `one more 3 → ★`) and the rival caption; a dedicated reason popup
for the human's own result was not added. Monster names are not drawn over the 3D figures on the phone.
