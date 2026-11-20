# R105 strict gameplay review: kaiten-kitchen

Reviewed commit: **25147aba07e71745dc58a6948a69192abae97648** (origin/shelf/W581-kaiten-strict head, 20 Nov 2026).
Reviewer did not change the game.

**Verdict: FAIL. Average 6.5.** Rows 4, 5 and 6 are below 7. There is no stopper. The cold player could play and rated it 4/5.

| # | Row | Score |
|---|-----|-------|
| 1 | Rules fidelity | 7 |
| 2 | Tutorial teaches | 7 |
| 3 | First 10 seconds | 8 |
| 4 | Turn clarity | 6 |
| 5 | Phone and PC | 4 |
| 6 | AI and pacing | 6 |
| 7 | Feel | 7 |
| 8 | Bugs | 7 |

## Gates (one run each, foreground)
- `build-all.py --quick --out /tmp/x kaiten-kitchen`: **PASS**. Scenarios 9/9. One warning: a button is covered by `#art-bub` ("Odile").
- `build-all.py --full --out /tmp/x kaiten-kitchen`: **PASS**. Phone-check passes. The sweep is clean (3 overflow turns, 27 turns, Twin Sticks and bulb used). The lab warns that its rows and the scenarios list differ.
- `logic-test.js`: 81/81 rules. `game/rules-test.js`: 90/90.
- `tut-walk.js 375x667,375x553`: PASS. The tutorial has 27 steps covering 27 rules, followed by a real game played by touch.
- `calm-audit.js`: **loops=0, maxHelpers=1** on both the play and guided paths. My own check sampled 16 s after a bulb tap at 375x553, 375x667, 1366x768, 1920x1080 and 910x512. The bubble stayed up for all 16 samples, with 1 helper and 0 infinite animations each time.

## Rules vs the original (engine plus player-facing text)
**Engine: no mismatch.** I checked the deck (108 cards), the hand sizes (10/9/8/7), 3 rounds, passing left, roll race ties (a tie for most means no second place), custard most and fewest (no fewest penalty with 2 diners, and nobody scores when all are equal), Fire Paste, Twin Sticks going back into the hand, and the custard tie-break (`engine.js`, `data.js`).

**Player-facing text mismatches** (paths under games-src/kaiten/):
1. `game/src/ui2.js:42`: the roll-race toast always says "your N icons now beat X's M. You +d" whenever your roll points rise. This is false when you climb to 2nd place or into a shared place. The cold player saw "your 4 icons now beat Odile's 6. You +1" on PC, and "your 5 icons" when they had 7. **Highest-priority text bug.**
2. `game/src/ui2.js:371`: the custard shelf popup says "End: most +6, fewest −6" in 2-diner games too, where nobody loses points for fewest.
3. `game/src/ui8.js:56`: the press-and-hold peek for custard (SHORT.pudding) has the same 2-diner error.
4. `kit/parts/p1.js:32`: the custard card face and its aria-label (ruleText) say "End of game: most +6, fewest -6" with no 2-diner exception. This text is printed on every card.
5. `game/src/ui10.js:25`: "Sticks go back" help says "put back into your hand, so the next diner can use them". This is misleading: the sticks pass on as a card, and the next diner must take them and wait for a later turn.
6. `game/src/story.js:95` (tut.penalty): "With three diners, the fewest cups LOSES 6." The rule applies with 3 to 5 diners, and this line is shown inside the 2-player tutorial.
7. `campaign.json:266`: "he can only take one plate a turn. Same as you." This is wrong, because Twin Sticks let anyone take two.
8. `campaign.json:94` with `game/src/ui9.js:17`: the chapter 3 goal says "the 6-point roll prize". The check counts a shared first place (3 points each) as a win.
9. Minor flavour text: `campaign.json:83` ("hands pass round faster", 3 diners) and `campaign.json:239`.

## First-timer play (touch)
- Tutorial at 375x553: 27 steps, each one short line with a Next button or a tap, then "Play a real game". It teaches every rule, but **27 steps is long**.
  - The "Roll tie" step (`ui11.js:95`) is shown with no tie on the table. The table shows a lone "1st +6", so the step explains a rule the picture contradicts. (Known leftover, still present.)
  - The "Flip and pass" bubble sits over the top of the belt it points at. You can still read it, but it covers part of the target.
  - The cold player also saw the "Roll tie" and "Nigiri and paste" callouts covering their items.
- Three full games at 375x667 and three at 375x553 (default table: 3 diners, both Easy), following the bulb:
  - Won all six: 46-33-24, 51-34-32, 49-24-30, 43-35-33, 53-27-30 and 52-30-26. Games took 70 to 109 s of play.
  - 0 dead taps, 0 page errors, 0 stuck states.
  - Choices are previewed on every card: +N, "need 1", "1st +6", "tied 1st +3", "end +6" and "x3". Whose turn it is is clear ("YOUR TURN · Tap a dish to take it.").
- Rival reveals at 375 px: rival plates are about 22 px icons. You can read them through the chips ("=4", "2nd +3"), but you cannot see the dishes.
- Rival scores swing during a round (roll race and custard, live) with no explanation until a toast appears. The cold player reported this as confusing (item 5).
- Fair share of wins:
  - On the default (Easy) level, a newcomer who follows the bulb wins almost every game, by 10 to 25 points. That is generous, with little tension.
  - A player who follows the green +N numbers wins 34.5% (`bench-newplayer.js`), which is a fair share.
  - **But after the first win, the defaults switch to Normal opponents** (`ui1.js:25`, `ui4.js:183`). A sensible new player (normal chef with 25% slips) then wins 14.8%, down from 87.6% against Easy. With 50% slips it is 5.3%. A rough player (65% slips) goes from 56.6% to 3.4%. That is a difficulty cliff after a single win.

## Clutter
At most 1 helper and 0 infinite animations on every path. That includes the 15 s after a bulb tap; the bulb bubble stays up.

## Phone (375x667 and 375x553, touch)
- Smallest text on the board is 14 px. The result table is 12 px. All taps are 44 px or larger. No horizontal or vertical scroll. My probe found no clipped buttons.
- A hand of 9 now sits in two rows (5 + 4) of 58x81 cards with no overlap and no clipping. The lower row's names sit over the belt decoration at the bottom edge.
  - The cold player called the hand "crowded" and said the lower row looked clipped against the belt strip. It is visually tight, not cut off.
  - 6 cards are laid out 5 + 1 even though 6 would fit in one row.
- The empty band above the hand is 45 px, rising to 131 px at 375x553 turn 5 while the cards stay small.

## PC (mouse)
- **1366x768**: full game, won 57-37-36. Hand cards are 107-118 px wide, text 14 px or larger, no dead clicks, no scroll. The side panel uses the width. Good.
- **1920x1080**: full game, won 68-25-33. It works, but there is a ~200 px empty band between the rivals' row and your own table.
  - The side panel cards are large with one line of content, and the panel bottom is empty.
  - The "+3" badge covers Kofi's name label ("Kofi" reads "Kon").
- **910x512: FAILS.**
  - Repro: open the game in a 910x512 window, tap Play, then choose a quick game. The "Start the meal" button is below the fold, and the setup screen must be scrolled to reach it.
  - On the board, the side panel drops to the bottom and takes about 220 px. The rivals' tables and your own table are squashed into a ~60 px strip under the header. Their "Nothing served yet" labels print on top of each other, and dishes on the tables cannot be seen.
  - The game is still playable by clicking the hand (full game won 54-26-28, 0 dead clicks), but you cannot read the board. Smallest text is 13 px.
- Cold player on PC: a broken-image box appeared twice for about 1 s next to a "ready" label during the pass animation (near x=455,y=140 and x=995,y=130 at 1366x768). Not reproduced by me.

## Cold play (independent subagent, no history; quoted as-is)
> Could I play it? Yes, on phone and PC, start to final result screen. I was never stuck.
> Fun: 4/5. Would play again: yes. Passing the hand, the live "need 1" / "2nd +3" labels and the custard end-bonus gave real decisions.
> What confused me: 1. Phone hand: the 2-row hand is crowded and sits at the screen bottom. The lower row's names and bottoms are clipped or overlap the conveyor strip. 2. The "Roll race" toast is sometimes stale or wrong. On PC it said "your 4 icons now beat Odile's 6. You +1" (4 is less than 6). 3. The tutorial's "Roll race (now 1st)" text overlaps the Seaweed Roll art in the reveal screen. 4. Tutorial callouts cover the item they are explaining (the "Roll tie" and "Nigiri and paste" steps). The step counter said 1/27 and the tutorial is long for "5 minutes". 5. Odile's score dropped from 6 to 4 mid-round with no clear reason. 6. Custard's -6/-3 penalty for the fewest cups is only visible on the dessert slot. I didn't understand it until the end table. 7. PC: a broken-image box appeared twice for about 1s near a player's "ready" label during the pass animation. 8. The "Next round" button shows faded for about 1s after round scoring.
> Dead taps: none in normal play. Waiting after each pick was 1.7-2.7s (up to 5-6s on the last turn of a round). It feels a little slow by turn 7-9 of each round.
> Phone is playable but cramped; PC is much roomier.

Recording: `games-src/reviews/R105-first-3-min-375x667.webm` (cold player, first 3 min at 375x667, touch).

## Rows under 7: what I did and what happened
- **Row 4, Turn clarity (6).**
  - Take a 2nd-place roll lead in a 3-diner game. The toast says your fewer icons "now beat" the leader's (`ui2.js:42`).
  - Rival scores drop mid-round with no reason shown.
  - The custard fewest penalty is visible only on the dessert slot, and is wrong in 2-diner games (`ui2.js:371`, `ui8.js:56`, `p1.js:32`).
- **Row 5, Phone and PC (4).**
  - 910x512 with a mouse: the setup screen needs scrolling to reach Start, and the board is squashed into a ~60 px strip so tables cannot be read.
  - 1920x1080: a ~200 px empty band in the middle of the board.
  - Phone is acceptable but tight.
- **Row 6, AI and pacing (6).**
  - Win one game, then start a new one: both chefs default to Normal, and a sensible newcomer's win rate falls from about 88% to about 15% (bench above).
  - Easy is so soft that bulb-followers win by 10 to 25 points.
  - AI waits of 1.7 to 2.7 s per pick feel slow late in a round.

## Prioritized fix list
1. **910x512 (short landscape PC) layout.** Keep the board readable: put the side panel to the right or collapse it, and never squash the tables below about 120 px. Make the setup screen fit without scrolling, so Start is above the fold.
2. **Roll-race toast** (`ui2.js:42`): word it from the actual place reached ("You're now 2nd in rolls: +3"), never "beat" when you are behind. Use the current icon count.
3. **Difficulty step after the first win** (`ui1.js:25`): go Easy, then Easy + Normal, then Normal, or step up only after 2 or 3 wins. Make Easy a little sharper so wins are closer.
4. **Custard text for 2 diners**: `ui2.js:371`, `ui8.js:56`, `kit/parts/p1.js:32` (card face). Also show the fewest-cups penalty somewhere a newcomer sees it before the end.
5. **Tutorial**:
   - Show a real tie on the "Roll tie" step (`ui11.js:95`), or reword it as "if two tie...".
   - Keep callouts off their targets ("Flip and pass", "Roll tie", "Nigiri and paste").
   - Trim the 27 steps where they can be merged.
6. **Other text**: `ui10.js:25` Twin Sticks help; `story.js:95` ("3 or more diners"); `campaign.json:266`; the chapter 3 metric versus its text (`ui9.js:17`).
7. **1920x1080**: close the empty middle band and slim down the side panel. Stop the "+3" badge from covering the rival's name.
8. **Phone hand**: lay out 6 cards in one row, and use the 45-131 px empty band to enlarge the cards.
9. **Feel**: shorten the AI wait late in a round. Investigate the broken-image flash during the pass animation on PC. Remove the 1 s faded "Next round" button.
