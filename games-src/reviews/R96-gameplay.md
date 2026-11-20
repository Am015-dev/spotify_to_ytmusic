# R96 strict gameplay review: hollowbough (PLAY1 rework)

- Branch reviewed: `origin/shelf/W550-hollowbough-play` at **f2604a4660ccbf1b8f607fa45e2ad5d33806fd2d**
- Date: 20 Nov 2026. Reviewer only, no game code changed.
- **Verdict: FAIL.** Average 7.0. Row 5 (Phone) scores 6, and the final-score screen runs one infinite animation. No stopper.

## Gates (2 runs each, run alone in the foreground)
| Gate | Run 1 | Run 2 |
|---|---|---|
| `build-all.py --quick hollowbough` | PASS (13/13 scenarios) | PASS (13/13) |
| `build-all.py --full hollowbough` | PASS (sweep PASS, guard ok) | PASS (sweep PASS) |
`games/lab.html` was rewritten by --full and then restored. It is not committed.

## Clutter (sampled once a second)
- `calm-audit.js` (20 s for each path): **loops=0, maxHelpers=1** (`hb-board` plus the bulb, and the guided path).
- My own touch probes, tutorial plus a full game at 375x667 and at 375x553 (272 and 301 samples): **max 1 helper** at any moment. Fingers, bubbles, nudges and rings were counted by class. Up to 8 or 14 `.glow` targets light up at once; these are the moves you can make, not helpers.
- **1 infinite animation**: `img.hero-tree {treesway}` on the final-score card (`game/head.html:288`, used from `ui5.js:187`). The tree sways forever on the result screen.
- The ghost finger appears on the first 2 moves only, as designed. In the look sheet the finger is hidden behind the sheet.

## The five PLAY1 gaps: are they closed?
| Gap | Status | Evidence |
|---|---|---|
| 1 Blind commit | **Closed** | Tapping a place, card or goal opens a sheet with big art, the card or place text, and "Send worker / Build it / Claim it" next to "Not now". 30-33 sheets per game in my probes. Commits without a sheet were only choice prompts and drags. |
| 2 No preview | **Mostly closed** | The sheet shows "WHAT HAPPENS +2 resin". An unaffordable card shows its text plus "You need 2 more berries". The meadow-pick and choice screens (Summer take-2, Meadow Bazaar, Cranny Market) still show only cost and colour, not what the card does. |
| 3 Competing taps | **Closed** | Prepare is a dashed "Prepare / 2 workers left" until you can press it. Then it reads "Prepare for Spring, +1 worker. Your green cards pay." Never more than 1 helper. |
| 4 Opaque rival | **Partly closed** | A blue line ("Bramble went to Sapwell Copse", "Bramble built Pulley Lift") stays up for 2.6 s and is readable at 17 px. But it sits over the Places/Meadow/City tabs (top:164px), and the rival's worker never visibly moves on the board. Resource gifts are now logged (`engine.js:130`). Card gifts (`giveCard`, `engine.js:129`) are still silent. |
| 5 No payoff | **Partly closed** | "+N points" rises once from your score chip and the chip bumps. Green cards paying in Spring/Autumn, a critter moving in free, and a goal claimed have no moment of their own. |

## Rules vs the original (engine and every player-facing text)
The engine matches. `logic-test`/`rules-test` pass in the gates, and RULES-CHECKLIST sections A-H were spot-checked against `rules-notes.md`. The new PLAY1 text matches: SEASON_GIVES Spring +1 and production, Summer +1 and up to 2 meadow cards, Autumn +2 and production; "Your workers come home". Mismatches:
1. `game/src/ui13.js:193`: the turn-over toast says "All workers are out. You can play a card, Prepare or Pass." Before Autumn, Pass is not legal. After the Autumn Prepare, Prepare is not legal. Name only the actions that really exist this season.
2. `game/src/engine.js:793` with `game/src/ui2.js:533` (also `ui2.js:241`): the label "Done trading (take N new resource(s))" has nested parentheses. The `\([^)]*\)` strip turns it into the button **"Done trading)"** (Haggle Magpie trade, 375x667, screenshot in the repro below).
3. Still open from RULES-AUDIT: Goodman Vole costs 3 berries in our data, and one reviewer remembers 2. Not settled.
4. Unclear text, not wrong: the goal card's title "Win the Elderheart Oak" (`ui13.js:145-146`) does not say what you are trying to do. The lines under it do.
No rule that stops play is broken.

## First-timer play (touch only)
- Tutorial at 375x667 and at 375x553: finished both times in about 3-4 min, ending on the "You know the rules / Play a real game" card. At 3 steps (Prepare, Pass twice) no `.gxt-ring` was drawn, so a ring-follower had to find the button alone.
- Hint-following newcomer games (2 players, default Normal; the bot taps the bulb and then what it rings):
  | Size | Results |
  |---|---|
  | 375x667, always asks the bulb | WIN 51-34, WIN 55-49, WIN 39-34 |
  | 375x553, asks half the time | WIN 49-44, loss 37-39, WIN 36-34 |
  | My probe 375x667 (Play > Guided, from the title) | loss 39-44 |
  | My probe 375x553 | WIN 40-36 |
  | Cold player, by hand | loss 32-33 |
  That is 6 wins in 9 games, all of them close. That matches the "about half" target. 0 page errors, 0 stuck states.

## Phone (375x553 and 375x667)
- Text: 0 visible text nodes under 11 px. The card-title and look-sheet type is 13-22 px.
- Taps under 44 px: the `[data-a=t]` card targets in a choice strip are **56x29** (seen in 3 games: "Goodman Vole", "Reedpunt Toad", "Haggle Magpie"). "Next" in the tutorial is 72x44 (OK).
- Overlap: the **"1 left" chip sits on top of the card's "1 pt" badge** on meadow cards (Summer take-2, Meadow Bazaar). It also sits over the Echo Mole title during the Haggle Magpie trade.
- The rival line covers the tab bar for 2.6 s after every rival move. A tab tap in that window does nothing, which may be why the cold player said "a tap on the Places tab sometimes did nothing". It has `pointer-events:none`, but it hides which tab is active.
- No horizontal scroll at either size.

## Cold play (an independent agent with no history, 375x667, tutorial plus one full game). Quoted as-is:
> Could I play it? Yes. The "Learn in 5 minutes" tutorial walked me through taking resources, building, and passing. After that, the vs-computer game was clear enough to finish. The Hint (lightbulb) button was the most useful thing on screen.
>
> Fun? Pleasant and the art is lovely. I'd play again, but the Pass behaviour and score reveal put me off a bit.
>
> What confused me:
> - The tutorial seemed to end by dropping me back at the title with "Replay the coached first game". I wasn't sure it had finished.
> - I had to find my way from title to a real game: Play, then Guided / vs computer.
> - Hint said "Build Footsore Drifter" with a full 15/15 city. It was right, since travelers use no space, but it felt wrong at first.
> - "Purple bonuses" and "Journey" appeared only on the final score table. I didn't see them coming.
> - Text is small: the "workers" label is clipped, and some card costs are tiny.
>
> Dead taps / stuck moments:
> - Pass (bottom button) often did nothing on the first tap. It needed 2 taps, though the prompt said "tap Pass twice" only once.
> - Tapping a Place sometimes needed a second confirmation, and I had to tap the lower "Place worker" button, which I missed at first.
> - A tap on the Places tab while on Meadow sometimes did nothing.
> - A Cranny Market "swap" prompt popped up unexpectedly after a stray tap.
> - Tapping Pass while the AI was thinking did nothing.
>
> Result: LOST, 32 to 33 against Bramble. Real play was roughly 20 minutes.

Cold-play verdict: **playable, and mildly fun ("pleasant", would play again)**. It is not the clear "fun" the owner wants. Video of its first 3 minutes: `games-src/reviews/R96-first-3-min-375x667.webm`.

## Scores (GAMEPLAY-RUBRIC, 8 rows)
| # | Row | Score | Why |
|--:|---|--:|---|
| 1 | Rules fidelity | 7 | The engine matches. Two text mismatches (ui13.js:193 Pass/Prepare toast, "Done trading)"); Goodman Vole cost still open |
| 2 | Tutorial teaches | 7 | Teaches the core loop in order, one line and one tap per step. Its end feels like being dropped at the title (cold player). Prepare and Pass steps have no ring |
| 3 | First 10 seconds | 7 | Goal card plus one bubble, then the board. "Win the Elderheart Oak" is vague. The Play button's label sits in the top-left corner of the button |
| 4 | Turn clarity | 7 | The look sheet fixes blind commits. Choice and meadow-pick screens still hide card text. The rival's move is a line over the tabs, with no movement on the board. Purple bonuses and Journey are a surprise at the end |
| 5 | Phone play | **6** | "1 left" chip overlaps the points badge and the card title; choice-strip card targets are 56x29; "Done trading)" label; the rival line covers the tabs |
| 6 | AI and pacing | 8 | 6 of 9 newcomer games won, all close. The rival is quick and sensible. A human game takes about 20 min |
| 7 | Feel | 7 | Sheet slide-up, +points pop and chip bump. No moment when green cards pay, a critter moves in free or a goal is claimed. The rival's worker does not move. A looping tree on the result screen |
| 8 | Bugs | 7 | 0 errors and 0 stuck states in 9 full games. The label bug. The Pass arm (2 taps) reads as a dead tap |
| | **Average** | **7.0** | **FAIL** (row 5 < 7; 1 infinite loop) |

## Repro steps for rows under 7
- **Row 5a, overlap**: 375x667, Play > Play now > Start, play to the Spring Prepare. When "Tap a meadow card to take it" shows, look at the first meadow card: the "1 left" chip is drawn over the "1 pt" badge. The same happens with Meadow Bazaar.
- **Row 5b, small target**: in a card-choice strip (Haggle Magpie or Cranny Market prompts, or a choose-a-critter prompt), each card's tap target measures 56x29 px (`[data-a=t]`).
- **Row 5c, label**: build Haggle Magpie, use it, give 1 good. The bottom button reads "Done trading)".
- **Loop**: finish any game. On the final-score card, `img.hero-tree` runs `treesway 5s infinite`.

## Prioritized fixes (for a fixer)
1. `head.html:288`: make `.hero-tree` sway a set number of times (e.g. `animation-iteration-count:2`) or not at all. That gets loops to 0.
2. Move the "1 left" chip on meadow cards to a free corner (left side, under the title) so it never covers the points badge or the title. Check the take-2, Bazaar and Magpie screens at 375x553.
3. Make choice-strip card targets at least 44 px tall.
4. `engine.js:793`: drop the nested parentheses (e.g. "Done: take N new goods"), or make `ui2.js:533/241` strip only the last balanced group.
5. `ui13.js:193`: say "Prepare" before Autumn and "play a card or Pass" after the Autumn Prepare.
6. Rival line: show it above the board (under the score chips, or over the hand strip), not on the tabs. Animate the rival's worker meeple to its place, or pulse that place for 1 s.
7. Log and show card gifts (`giveCard`) the same way resource gifts now are ("Bramble gave you a card").
8. Choice and meadow-pick screens: tapping a card opens the same look sheet with its text before "Take it".
9. Payoff moments: a one-line pop when green cards pay at a Prepare ("+3 goods from your green cards"), when a critter moves in free, and when a goal is claimed.
10. Tutorial end: one clear "Tutorial complete" beat before the title. Put a ring on the Prepare and Pass steps. Mention purple bonuses and the Journey once before Autumn.
