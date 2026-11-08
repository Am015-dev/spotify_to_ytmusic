# G4 strict gameplay review (8 Nov 2026)

Reviewer G4. I scored by `GAMEPLAY-RUBRIC.md`. I did not change any game code.

**Method.** I built each game from its own branch with `build-all.py <slug>` and served it next to `games/<slug>/media`.
I played it in Playwright with `isMobile` and `hasTouch` at 390x844 and at 375x667. Every action was a `touchscreen.tap`.
I read the game only to find where the highlighted target was. I checked the published rules online first; those notes are
kept locally and are not committed. For each game I touch-walked the tutorial to the end, then played one full game to the
result screen as a new player. Screenshots are in `G4-shots/`.

**Limits of this review.** The full games were played by a touch bot that taps the first glowing or legal thing. So the bot's
own scores say nothing about AI strength against a person. I judged Feel from still screenshots and the flow of the game,
not from watching the animations at full speed.

## Summary

| Game | Total | Result | Lowest rows |
|---|---|---|---|
| perch-and-plume | **4.0** (capped; 5.4 before the cap) | **FAIL** (stopper: dead tap) | Bugs 3, Phone 4, Turn clarity 5 |
| sands-of-qamar | **6.5** | **FAIL** | Turn clarity 5, Phone 5 |
| lantern-dive | **7.0** | **FAIL** | Turn clarity 6, Feel 6 |

---

## 1. perch-and-plume (branch shelf/W508-perch-gameplay @ 3b07c037)

| # | Row | Score |
|---|-----|-------|
| 1 | Rules fidelity | 7 |
| 2 | Tutorial teaches | 6 |
| 3 | First 10 seconds | 6 |
| 4 | Turn clarity | 5 |
| 5 | Phone play | 4 |
| 6 | AI and pacing | 6 |
| 7 | Feel | 6 |
| 8 | Bugs | 3 |
| | **Total** | **4.0** (average 5.4, capped at 4 by a stopper) |
| | **Result** | **FAIL** |

What matches the published game: 4 rounds with 8/7/6/5 actions, 4 actions, egg cost by column, habitat rows getting stronger
as birds fill them, a dice feeder (reroll when all dice match), a 3-card tray, round goals, a secret bonus card, a starting
hand of 5 split between birds and food, brown powers firing right to left, pink powers, tucking and caching. I did not see
the row bonus trade (pay a card or egg for one extra) offered anywhere.

Findings:

1. **Row 8, STOPPER: dead tap.** I tapped Quick game, then Start the year, then Keep these. My first tap on "Play a bird" did
   nothing; the second tap worked. This happened 3 times out of 3. `elementFromPoint(100,745)` returns `DIV#pop.pop`, an
   invisible layer that eats the first tap after the game starts. Shot: `G4-shots/perch-390-f-tap-play.jpg`.
2. **Rows 4 and 5: the Play button is hidden, and the card shows a stale instruction.** I tapped Play a bird, then a card,
   then the glowing slot. The prompt changed to "Play <bird>?" and the confirm button (Play) appeared at y=511, under the
   dock's sticky "Your turn" header. Only its top edge shows. The card still says "Now tap a glowing space on your board"
   when no space glows any more. A new player is lost here and has to scroll the dock up. It is the same at 375x667.
   Shots: `G4-shots/perch-390-play-STUCK.jpg`, `G4-shots/perch-375-play-zz-result.jpg`.
3. **Row 5: key controls start below the fold.** At 390x844 the hand opens at y=883, off screen, so every turn needs a dock
   scroll (5 forced scrolls in one game). At 375x667 the board slot targets are 42x48, under 44px.
   Shot: `G4-shots/perch-390-play-0041.jpg`.
4. **Row 2: the tutorial marker appears late.** At step 7 ("White power") the highlight takes more than 3 s to appear after
   the bird is played. In that gap I tapped the bird, as the bubble says. That opened the card zoom, and the step stalled
   until I closed it. Steps 15 ("pink") and 18 ("goalr") have the same gap with no marker. Shots:
   `G4-shots/perch-390-tut-08-white.jpg`, `G4-shots/perch-390-tut-STUCK-white.jpg`, `G4-shots/perch-390-tut-21-pink.jpg`.
5. **Rows 2 and 3: the tutorial contradicts itself.** Step 1 says "Most points after 4 rounds wins" and step 2 says "Rounds
   give 8, 7, 6, then 5". The header shows "Round 1 of 1" and "4 actions left". The dock is busy from the first second:
   score bar, food chips, tray, three rows, a round box, food line, bonus card, coach bubble and actions all at once.
   Shot: `G4-shots/perch-390-tut-01-goal.jpg`. Apart from these points, the 21 steps do teach one rule each by tapping, and
   they end in a real game (`G4-shots/perch-390-tut-zz-end.jpg`).
6. **Row 6: the default rival is strong.** The Normal rival "Fern" scored 81. Its row was birds 41, bonus 8, goals 18,
   eggs 10. My naive bot scored 21. I cannot confirm from this that a new player can beat Normal.
   Shot: `G4-shots/perch-390-play-zz-result.jpg`.
7. **Row 8: no errors otherwise.** A full game reached the result screen at 390x844: 368 taps, 0 page errors, 0 console
   errors.

---

## 2. sands-of-qamar (branch shelf/W497-sands-gameplay, source games-src/ft)

The build needs `games-src/node_modules/three`. A fresh worktree fails with FileNotFoundError until you run `npm i three`.

| # | Row | Score |
|---|-----|-------|
| 1 | Rules fidelity | 8 |
| 2 | Tutorial teaches | 7 |
| 3 | First 10 seconds | 7 |
| 4 | Turn clarity | 5 |
| 5 | Phone play | 5 |
| 6 | AI and pacing | 6 |
| 7 | Feel | 6 |
| 8 | Bugs | 8 |
| | **Total** | **6.5** |
| | **Result** | **FAIL** (rows 4, 5, 6 and 7 are under 7) |

What matches the published game, checked in play: turn-order bidding, with 2 markers each and 11 camels each for 2 players.
Equal bids go to the later bidder. Moving follows the rules: drop one per tile, no diagonals, no straight backtrack, and the
last meeple must land on its own colour. Emptied tiles get your camel. All five tribe actions work (Advisors score 1 each plus
10 per rival with fewer; Sages 2 each). Stall costs 3 for one of the first three goods; Grand Bazaar costs 6 for two of the
first six. Hamlet gives a palace (5), Oasis a palm (3), and Shrines summon djinns with 2 Sages. Goods sets score 1/3/7/13.
The game ends on the last camel.

Findings:

1. **Row 4: you cannot see who stands on a tile.** Each tile shows its point value as a big number, plus unexplained "+1",
   "+2", "★" and "+7" badges. The people on it, the information every move depends on, are one small blurred figure, and
   their count is not shown. Shots: `G4-shots/sands-390-tut-06-lift.jpg`, `G4-shots/sands-375-play-0041.jpg`. A floating
   "— +10" chip covers the board with no label (same shot).
2. **Row 5: small targets.** Bid spots are 36x34 (34x34 at 375). Djinn and goods choice rows are 30px tall. The sell goods
   chips are 42x38: the sell step needed 4 taps. At 375 the tile names are cut off ("Haml…").
   Shots: `G4-shots/sands-390-tut-02-bid.jpg`, `G4-shots/sands-390-tut-17-sell.jpg`.
3. **Row 2: the tutorial is long and ends in a loss.** The guided game has 48 steps plus 5 scoring pages, every rule in
   order, one line and one highlighted tap each. That is good. But it runs about 8 minutes, and after you follow every
   step the scripted game ends "Farid wins with 124" against your 108. Teaching a newcomer through a forced loss feels bad.
4. **Row 6: the default AI is strong.** The default AI "Teal" scored 247 and 244 in two games. Even allowing for my bot,
   that is a large margin for a new player to close. A game was brisk: about 3.5 min of taps.
5. **Row 7: the result text does not fit the margin.** The result screen says "So close! Want another game?" after a 69 to
   247 loss. A stray "— +6" chip sits on the result art. Shot: `G4-shots/sands-390-play-zz-result.jpg`.
6. **Row 4: the meeple chooser is clear.** The "Pick who stays on this tile" chooser is clear, and so is the Bid / Move /
   Take / Sell phase strip. Shot: `G4-shots/sands-390-play-STUCK.jpg`. The STUCK in that file name is my bot looping, not
   the game.
7. **Row 8: no errors.** Full games reached the result screen at 390x844 (294 taps) and at 375x667 (338 taps), with 0 errors
   and no stuck states. Shot: `G4-shots/sands-375-play-zz-result.jpg`.

---

## 3. lantern-dive (branch shelf/W504-lantern-gameplay)

| # | Row | Score |
|---|-----|-------|
| 1 | Rules fidelity | 8 |
| 2 | Tutorial teaches | 7 |
| 3 | First 10 seconds | 7 |
| 4 | Turn clarity | 6 |
| 5 | Phone play | 7 |
| 6 | AI and pacing | 7 |
| 7 | Feel | 6 |
| 8 | Bugs | 8 |
| | **Total** | **7.0** |
| | **Result** | **FAIL** (rows 4 and 7 are under 7) |

What matches the published game: a 40-card deck (4 colours 1 to 9, plus 4 trumps). The holder of the top trump is Captain
and leads first. Players must follow suit; trumps win. Jobs are taken before play, and one failed job ends the attempt. Each
diver signals one card as highest, lowest or only of its colour, between tricks. There is a distress flare that costs an
attempt, and the dive ends as soon as every job is done.

Findings:

1. **Row 2: two signal limits are not taught.** The 18-step tutorial runs to the end with one line and one tap or Next per
   step, then offers a real game. Good. But it never says that each diver may signal only once per dive, or that trump cards
   cannot be signalled. Also, 12 of the 18 steps are Next-only reading steps, not actions. Shots: `G4-shots/lantern-390-t02.jpg`,
   `G4-shots/lantern-390-t07.jpg`, `G4-shots/lantern-390-t99-end.jpg`.
2. **Row 4: unlabelled header icons.** The header has 4 icon-only buttons (sheet, book, ?, menu). While playing I hit one
   and the Log sheet covered most of the table. Cards use a small suit icon plus a colour name; which suit is trump is only
   implied by the art. Shot: `G4-shots/lantern-390-play-0041.jpg`.
3. **Row 7: the table is mostly empty.** Mid-dive, most of the screen is dark blue space and the trick area is small. The
   still shots give little sense of cards flying or tricks being collected.
   Shot: `G4-shots/lantern-390-play-0041.jpg`.
4. **Row 6: the quick game is very short.** A Free play quick game is one dive: it was won after 6 tricks in 56 s at 390.
   At 375 my naive lead broke "never lead Coral/Kelp" after 13 taps. The failure screen explains exactly why the dive
   failed, which is good. Shots: `G4-shots/lantern-390-play-zz-result.jpg`, `G4-shots/lantern-375-play-zz-result.jpg`.
5. **Row 3: the title screen is clear.** It shows "Dive together. Do not talk about your cards." and one big "New here?"
   button. Shot: `G4-shots/lantern-00-start.jpg`.
6. **Row 8: no errors.** The tutorial and full dives at both sizes reached the result screen with 0 errors, no stuck state
   and no dead tap.
