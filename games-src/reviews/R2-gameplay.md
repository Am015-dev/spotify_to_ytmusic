# R2 gameplay re-review (8 Nov 2026)

Strict re-review by the rubric (`GAMEPLAY-RUBRIC.md`). I built each branch with its own build.py and served it next to its
`games/<slug>/media`. I played with real touch taps only (Playwright `touchscreen.tap`, no game calls) at 390x844 and 375x667.
Screenshots are in `R2-shots/`.

| Game | Branch | First review | R2 total | Result | Lowest rows |
|---|---|---|---|---|---|
| vinegrave | shelf/W490-vinegrave-bench (586a64bd) | 5.9 | **5.6** | **FAIL** | Tutorial 5, Turn clarity 5, Phone 5, AI 5 |
| thornbound | shelf/W489-thornbound-rules (546c2244) | 4.0 | **4.0** (raw 4.8, capped) | **FAIL** | AI 3, Bugs 3, Tutorial 4, Feel 4 |

## 1. vinegrave (branch shelf/W490-vinegrave-bench, 586a64bd)

| # | Row | Score |
|---|-----|-------|
| 1 | Rules fidelity | 6 |
| 2 | Tutorial teaches | 5 |
| 3 | First 10 seconds | 6 |
| 4 | Turn clarity | 5 |
| 5 | Phone play | 5 |
| 6 | AI and pacing | 5 |
| 7 | Feel | 6 |
| 8 | Bugs | 7 |
| | **Total** | **5.6** |
| | **Result** | **FAIL** (no stopper, but 7 rows under 7) |

How I tested: I did the tutorial to the end by touch at 390x844 and at 375x667, tapping only the lit target or the bubble
button. I then played a full 5-round game against the default rival (easy) to "Game over" at 390x844. I got 0 page errors and
0 console errors in every run.

### First-review findings

1. **R1, starting cards used the main action: FIXED.** Tutorial step 2 says "Starting cards are free to play... Your turn goes on".
   In the real game, tapping Patron Letter twice gave +1 coin and the Pass button stayed, so it was still my turn.
   Shot: `R2-shots/vg-s-00.jpg`.
2. **R1, played cards go to the discard pile or under the deck: FIXED (matches the rulebook).** The round-end bubble now says
   "Played cards shuffle under your deck", and the rules notes cite logic-test B11.
3. **R2/R8, dead tap on "Tap again: up one row": FIXED.** The bubble now says "Tap the Climb button: up one row". The step moved
   on with one tap at both sizes. Shot: `R2-shots/vg-t-41.jpg`.
4. **R2, Next-only steps and untaught rules: PARTLY.** Plane travel, deep ruins (6 compasses) and the icon swap are now taught, but
   only as Next text. Of 29 steps, 16 are Next-only: win, one main action, travel, plane, deep ruins, idols, guardian wakes, boons,
   shrines, notebook, temple, Dread, round end and 3 count steps. You never use a boon, set an idol in a shrine, buy a temple tile,
   take a Dread or pay with a plane. It teaches one round, then says "A full game has 5 rounds". Shot: `R2-shots/vg-s-fin.jpg`.
5. **R4, about 12 things glowing during a one-tap step: FIXED.** Every tutorial step I logged had exactly 1 spotlight ring and 0
   soft rings. Market cards still show only cost and icon numbers ("3 +1"), with no words.
6. **R5, 375x667 hand half off screen, 11px labels, dark vertical line: PARTLY.** I saw no vertical line. Every tutorial step still
   has 8 text elements under 14px. Labels are clipped at 375: "eep ruins", "uins", "amp", "Clear Sprin", "Hollow Tre", and the
   Research header reads "ESEARC". At 390, "Clear Sprin" and "RESEARC" are cut too. At 375 the tutorial bubble covers most of the
   board. Shots: `R2-shots/vg-s-36.jpg`, `R2-shots/vg-g-result.jpg`.
7. **R6, a new player unlikely to win on default: NOT FIXED on my run.** The default is now easy. The fixer claims a scripted new
   player wins 52% of the time. By touch I lost 15-39. Tamsin went 5 → 20 → 39 over rounds 3-5, the same late jump the first
   review saw (25 points in the last round). In a second run Tamsin had 31 against my 7 after round 3. My driver was a simple
   glow-follower, so this does not prove a careful new player loses. But nothing on screen warns you about the late jump, and
   by round 4 my hand was still all starting cards with 0 coins and 0 compasses.
   Shots: `R2-shots/vg-g-45.jpg`, `R2-shots/vg-g-stuck.jpg`, `R2-shots/vg-g-result.jpg`.
8. **R7, guardian splash, card lift and painted map: still there.** The painted board is good. Most of a turn, though, is two taps
   and a text line in the dock. Tamsin's turns are a line of text ("Tamsin sends an explorer to Old Wreck") with little movement.

### New findings

- **Row 3. Skip tutorial, then Play, puts you back in the tutorial.** As a new player I tapped Play, which started the tutorial.
  I tapped "Skip tutorial", which went back to the title. I tapped Play again and got tutorial step 1/29 again. A player who
  skips cannot start a real game without finishing the tutorial.
  Shots: `R2-shots/vg-g-skip.jpg`, `R2-shots/vg-g-site1.jpg`.
- **Row 4. The Pass button disappears.** I tapped the research track when I could not pay. The dock changed to "Research: you
  cannot pay the next row yet. Details", and Pass was gone. It only came back after I tapped an empty part of the board, which
  nothing tells you to do. This happened twice in one game. Shot: `R2-shots/vg-g-nopass.jpg`.
- **Row 4. Text bug.** During the start-of-game card the dock read "You is choosing. Tap to skip ahead." Shot: `R2-shots/vg-g-start.jpg`.
- **Row 2. Bubble and button disagree.** On the last count step, tapping off the button shows "Tap Next." but the button says
  "Finish". Shot: `R2-shots/vg-t-54.jpg`.
- **Row 1. Rules gaps against the published game.** The assistants on the research track are left out (the rules notes say so).
  In the base game they are a core reward of the notebook. The idol slot values and temple tile costs are the fixer's own
  guesses. Moves, travel icons, discovery, guardians and Dread, under-deck reshuffle, items to the bottom of the deck, free artifact
  use and the market exile all match.
- **Row 8. No stopper.** I found no stuck state, no dead tap on a lit target, and 0 errors. The "Your turn" line, the hidden Pass
  button and the "You is" text are flaws, not stoppers.

## 2. thornbound (branch shelf/W489-thornbound-rules, 546c2244)

| # | Row | Score |
|---|-----|-------|
| 1 | Rules fidelity | 7 |
| 2 | Tutorial teaches | 4 |
| 3 | First 10 seconds | 5 |
| 4 | Turn clarity | 6 |
| 5 | Phone play | 6 |
| 6 | AI and pacing | 3 |
| 7 | Feel | 4 |
| 8 | Bugs | 3 |
| | **Total** | **4.8 average, capped at 4 (stoppers: the tutorial can get stuck for good, and "Tap to go on" taps do nothing)** |
| | **Result** | **FAIL** |

How I tested: real touch taps only (touchscreen.tap) at 390x844 and 375x667. I did the tutorial to the end at both sizes, with each tap timed. I played one full 5-round Quick game (me vs 2 computers, Normal) to the result screen at 390x844. I got 0 page errors and 0 console errors.

### First-review findings

1. **"WATCH - Tap to go on" did nothing: NOT FIXED.** In the tutorial, the one tap now works at most WATCH steps, but not at 20/28 and 22/28, at both sizes. At 20/28 the tap did nothing for 8.6 s and the step then moved on by itself. At 22/28 the first tap did nothing for 7 s and a second tap worked. In a real game it is worse: 117 of my 161 taps on "Watch the board. Tap to go on." did nothing. Each WATCH lasted 5-25 s, and tapping the board did nothing either. The strip promises something the game does not do. Shots: R2-shots/tb-tut-watch-step20.jpg, R2-shots/tb-tut-watch-375.jpg, R2-shots/tb-game-watch-round4.jpg
2. **Tutorial length and scope: PARTLY.** The Heir/Herald wording is fixed ("Your Heir card is your strongest. Hide it in the Tablelands, where your Herald stands."). It is still 28 steps, and steps 1-4 are still Next-only bubbles about the goal, the kingdom, Tactics and hand size. It still teaches only one round, ends on "You know the rules", and drops you on a setup screen and then a goal card. A later Spring/Summer, ties and the final scoring are never played through. Shots: R2-shots/tb-tut-step1.jpg, R2-shots/tb-setup-375.jpg
3. **Hand cards and round numbers: FIXED.** Hand cards now show a number, a name and a one-word power (e.g. "10 Heir Rally", "5 Agent Deadly"), and a tap shows the full power text. The header "Round 4 of 5" matches the board's "ROUND 4". The score badge no longer covers the score. The power words are 12-13px. Shots: R2-shots/tb-first-screen-390.jpg, R2-shots/tb-game-watch-round4.jpg
4. **375x667 layout: PARTLY.** The pile chips now sit under the board, not over it. Cairn Field and Ossuary show in full, and the hand cards fit (bottom at 662 of 667). Still too small: chip labels are 13px with smaller sub-labels, location names render about 12-14px tall on a small board, and the board takes only about 300px of height. Shot: R2-shots/tb-first-screen-375.jpg
5. **Busy first screen and wordy goal card: NOT FIXED.** The first screen still has 5 icon buttons, 3 score bars, a Goal pill, 6 locations, 5 chips and 6 cards. The "Got it" card is now 4 lines of rules text (goal, Clash, Herald, bid). Shot: R2-shots/tb-goal-card-375.jpg
6. **New player beating the computer: NOT FIXED / unproven.** I followed every on-screen prompt and glow (no suggested moves were ever shown to follow). Final score: one computer 29, the other computer 3, me 0. One computer ran away with the game. A first-timer gets no help to compete. Shot: R2-shots/tb-result-390.jpg
7. **Feel: NOT FIXED.** Clashes are still number discs and "?" tokens changing on a static board. Most of the game is spent watching with nothing to tap.

### New findings

- **Row 8 / Row 2 (STOPPER), tutorial stuck for good at 6/28.** Step 5 says "Tap your 5" and step 6 says "Tap the crown spot". If you tap the lit crown spot within about 0.7 s of tapping the card (I tried 200, 400 and 600 ms), it never accepts a tap again. I tapped it for more than 70 s and the tutorial could not go on. At 800 ms or more it works. A quick player gets stuck in the tutorial. Shot: R2-shots/tb-tut-stuck-step6.jpg
- **Row 8, the result headline names the wrong winner.** The result screen says "The Court holds the gate this time" while the panel below says that the Lanterns take the throne (Lanterns 29, Court 3). Shot: R2-shots/tb-result-390.jpg
- **Row 6, pacing.** A full 5-round game took 10.5 min (rounds started at 0:03, 2:26, 4:40, 6:26, 8:17). Most of that was WATCH time that cannot be sped up. The computer turns themselves are fast.
- **Row 4, card choice sheet covers the board.** When a Kingdom Card or location reward asks you to choose (for example "choose any Location Reward to claim"), a list of 4-6 options in rules text covers the top half of the board. It works, but it reads like a rules page. Shot: R2-shots/tb-choice-sheet.jpg
- **Row 1, rules spot-check.** The real game includes the secret bid, taking a Kingdom Card, Herald placement, one hidden card per region, Supporters (+1), clash order, the clash, the location choice, the Herald bonus and steal, Govern, Journey with a Lore buy, an attrition discard, Winter cleanup and a 5-round end. The fixer's 165 rule tests all pass. The bid prompt only ever says "Tap a glowing Kingdom Card to take it". But my own bid card also glows next to the Kingdom Cards. Tapping it seems to take the bid back, with no label saying so; my glow-following run ended up with no Kingdom Cards that way. I never saw the steal option offered.

Rules coverage: the engine matches the published turn order. Gaps are in what the player is shown and taught. The tutorial never teaches a tied clash (play another card or pass), the steal and take-back bid options, that the last player picks the clash order, buying with Lore, or using the Favour. Attrition and the tiebreak are only one line of text each.
