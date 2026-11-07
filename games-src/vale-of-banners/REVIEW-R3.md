# Vale of Banners: R3 player review

Reviewed 7 Nov 2026, 18:26 to 18:38 UTC. Build: scratchpad `vale-of-banners.html` (354 KB, single file), loaded from file://.
I played with real input: phone 390x763 (touch, `locator.tap`) and PC 1440x860 (mouse clicks). Storage was cleared first.
Sequence played: first launch, then the tutorial to its end card, then one full Quick game per device (2 players, Normal computer, `?fast=1`, all 25 rounds by taps, to the result screen), then Story chapter 1 on both devices and chapter 2 on PC, then every title button, bar button, drawer, Menu tab, hint bulb, tile view, opponent estate, dock hide, Continue after reload, and phone landscape.
I chose moves from the glowing legal targets. Console: **0 page errors, 0 console errors, 0 failed requests** in every run.
For comparison I opened Cauldron Fair (`games/cauldron-fair/index.html`): its art loaded locally (80 media files, 0 failed requests).

## 1. Scores

| Row | Score | Why |
|---|---|---|
| First minute | 4 | The title is a plain cream card on flat dark green, in the browser's default serif font, with no picture, logo art or mood. Cauldron Fair opens on a full illustrated scene. |
| Rules clarity | 5 | The rules drawer is complete and well written. In play, though, the coin, worker, star and flag counters, the dashed white die, the "+1" market badges and the "N x1" goods chips have no labels anywhere. The tutorial covers only take, build and end turn, then says "You know the rules". |
| Fun moment | 5 | The dice-to-stall-to-hex loop works, and selling or chaining has some pull. Still, every game uses the same fixed estate with the same numbers, and nothing in a normal turn feels like a big moment. |
| Feedback / juice | 4 | Tiles are emoji on flat hexes. A toast line ("Azure builds Keep") is the main feedback. Win and loss share the same plain table card: no celebration, no defeat beat, no score count-up. |
| Computer opponent | 7 | It is legal, quick and plays a strong game: it beat my glowing-first play 162-70 and 96-85, and the easy Story opponent won 37-29. But you never see its estate change, so its turns feel like toasts rather than a rival. |
| Phone | 4 | The Rules and Menu buttons sit off-screen in a top bar you have to swipe sideways. The estate hexes are 30x35 px and the market tiles 35x40 px. Toasts cover the score chips. Landscape is unplayable. |
| PC | 6 | Clean, readable and roomy: hexes are about 80 px and the dock is clear. But the right dock is two-thirds empty, the board has no art, and the same toast overlap appears. |
| Structure parity (title/Story/tutorial/help/menu) | 5 | Story map, chapter cards, Menu tabs, rules drawer, hint bulb and Continue are all present and work. Missing next to the old games: title art, Menu or settings on the title, a table-size choice on the title, and Online. Story portraits are emoji (a scroll for "Wren"). There is no in-game tracker for chapter goals. |
| **Average** | **5.00** | (4+5+5+4+7+4+6+5)/8. I would not show this to a paying player yet. |

## 2. Bugs

**B1. Phone: Rules and Menu buttons are off-screen (major, close to blocking).** Device: phone.
1. Open the game at 390x763 and tap Quick game, then Start.
2. Look at the top bar. It shows Hint and Scores, and "Ru" is cut off. Menu is not visible.
3. Measured: `.gx-bar` has scrollWidth 469 and clientWidth 390 (overflow-x: auto). The Menu button sits at x 415 to 459. The only way to reach Menu (Restart, Title, Sound, Tutorial) is to swipe the bar sideways, and nothing hints at that.

**B2. Phone landscape: the dock covers the board, so the game cannot be played (major).** Device: phone.
1. Start a Quick game on a phone and rotate to 763x390.
2. The dock fills about 2/3 of the screen. The market and estate are a sliver behind it, and the estate is cut off.

**B3. Toasts cover the score chips (major).** Devices: phone and PC.
1. Start a Quick game.
2. Each computer action ("Azure builds Keep", "Tap a glowing space", "Round 5: new dice") is drawn on top of the second player's chip. On phone the chip's name and points become unreadable for most of the game.
3. At game over a stale toast ("Round 5: new dice") is still on screen behind the result card.

**B4. Story stars contradict the result (major).** Device: phone (chapter 1) and PC (chapter 2).
1. Story chapter 1 "First Furrow": lose 29-37 against the easy opponent.
2. The card says "Not this time" with 0 stars. "Score 25 or more" is left unlit although the score was 29.
3. Story chapter 2 "Market Day": lose 22-57, with "Dilly Hart wins the valley" on the result.
4. The next card says "Chapter won!" with 1 star (sold 3 times) and unlocks a title.
5. So the same loss is a failure in one chapter and a win in the next. The player is never told which goal decides the chapter.

**B5. Chapter goals are not shown during play (major).** Device: both.
1. Start Story chapter 2.
2. The prompt says only "Use a die: take, build, sell or workers." There is no "Sold 0/3" counter. The goals appear only on the result card.

**B6. Phone touch targets under 40 px (major).** Device: phone.
1. Start a Quick game on a phone.
2. Estate spaces `#ec-*` measure 30x35 px. Market tiles `#mt-*` and back-lane tiles `#bl-*` measure 35x40 px. These are the main play targets, and they sit below the 44 px bar.

**B7. "You's estate" (minor).** Device: phone and PC.
1. During a Quick game, open Scores and tap your own chip (or tap your chip in the top row).
2. The drawer title reads "You's estate".

**B8. Result table header "Play" (minor).** Device: both.
1. Finish any game.
2. The first column of the result table is headed "Play". It means points from play, but it reads as a typo or a truncated word.
3. The summary line also says "chained 1 builds" and "finished 1 regions" (wrong plurals).

**B9. "Spring begins: roll the dice!" but there is nothing to roll (minor).** Device: both.
1. Start a Quick game or the tutorial (with or without `?fast=1`).
2. The toast asks you to roll, but the dice are already showing and there is no roll button or roll moment.

**B10. Dock hide button does nothing on phone (minor).** Device: phone.
1. During a Quick game, tap the panel-hide button (the right-tab arrow) in the dock header.
2. The dock stays exactly as it was (screenshot `phone-x-04-dockhidden.png`).

**B11. Menu tab "Accessibility" overflows its pill (minor).** Device: phone.
1. Open Menu on a phone.
2. The "Accessibility" label runs past both edges of its pill and touches the "About" pill.

**B12. Menu > Tutorial during a game drops the game without asking (minor).** Device: both.
1. Start a Quick game, then open Menu and tap Tutorial.
2. The tutorial starts at once with a new board. There is no "leave this game?" check.

**B13. The tutorial oversells (minor, design).** Device: both.
1. Play the tutorial.
2. It has 9 steps: take one tile, build it, see the region score, end the turn. Then the card says "You know the rules". Sell, workers, the back lane, Keep, Moot Hall, Barges and the banner track are never shown.

**B14. Scores drawer is a bare table (minor).** Device: phone.
1. Open Scores on a phone.
2. A small 6-column table sits in a full-height sheet that is 75% empty, and the toast overlaps the drawer title.

Not bugs (checked and working): Continue saved game after reload; the hint bulb ("Take Keep for your storage. How does this work?"); the tile read view with action buttons; tapping the opponent's chip shows their estate; locked chapters stay locked after a loss; all Menu tabs open; the How to play drawer from the title. There were no stuck states in four full games, and no errors.

## 3. Top 5 changes, ranked

1. **Fix the phone shell: put every bar button in view without swiping and make the tap targets 44 px.** Collapse Scores and Rules into Menu, or drop the title text on narrow screens. Grow the estate hexes to at least 44 px by letting the dock collapse to one row while the player picks a target. Give toasts their own lane that never covers the score chips, and make landscape work (dock at the side).
2. **Art pass on the title and board.** The 92 slots are already prompted in ASSETS.md. At minimum add a title scene, the board background and real tile faces in place of emoji, plus a real display font. Without this the game reads as a prototype next to Cauldron Fair.
3. **Make Story goals honest and visible.** Show the chapter goals in the dock during play, with live counters. Award each star by its own goal whether or not you win. Use one rule for "chapter won" across all chapters, and say on the result card which goal decided it.
4. **Teach the whole game.** Extend the tutorial by two more turns (sell, workers bending a die, the back lane, one Keep or Moot Hall chain). Add labels or tooltips to the coin, worker, star and flag counters, the white die, "+1" and "N x1". Drop "You know the rules" until it is true.
5. **Add juice to the payoff moments.** Give win and loss different result screens (banner raise, count-up). Add a dice-roll moment at the start of each round. Show the opponent's build briefly on a mini estate, and make region completion and selling feel big (burst, sound, score fly-up).
