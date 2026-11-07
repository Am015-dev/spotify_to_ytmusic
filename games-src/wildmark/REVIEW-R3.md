# Wildmark: player review R3 (7 Nov 2026, 18:26-18:50 UTC)

Build reviewed: the single-file `wildmark.html` (scratchpad build), loaded over file://, `?fast=1`. All input was real: taps
(390x763, hasTouch, isMobile) and mouse clicks (1440x860). Moves were chosen from the glowing targets on screen, mostly with the
game's own normal-level plan.

What I played: first launch with empty storage, then the tutorial (21 steps, phone and PC), then a full Quick game vs 1 normal rival
to the result screen on phone (90-91, lost) and on PC (88-99, lost). Then Story from a fresh launch: the prologue tutorial, chapter 1
(84 and 94 on phone, 83 on PC, all 3 stars) and chapter 2 vs Pip (lost 87-88 on phone, won 85-84 on PC). I also opened every
title button, every top-bar button (hint, Scores, Rules, Menu), the menu sections, the tile and card popups, the zoom buttons, the
rival's board view, Back after picking, and Resume.

Console: 0 page errors and 0 console errors in every run, on both devices.
Comparison: the old shelf game `games/cauldron-fair` loads its art over file:// with 0 failed requests. Its title is a full
illustrated scene with a table-size picker, Story and Online. Wildmark has no media at all: its title is a text card on a gradient.

AI levels, measured separately (60 AI-vs-AI games per pairing, 2 players, seats alternate):

| Pairing | Win rate of the first level | Average score |
|---|---|---|
| easy vs normal | 13% | 82.0 vs 93.2 |
| normal vs hard | 48% | 92.0 vs 91.6 |
| easy vs hard | 5% | 81.6 vs 93.1 |

## 1. Scores

| Area | Score | Why |
|---|---|---|
| First minute | 5 | You start fast (2 taps to play), but the title is a plain text card with no art. In the tutorial, two bubbles say the same thing on top of each other. |
| Rules clarity | 6 | The tutorial is good: it teaches with real taps, one action per step. But the rules and cards are text only, with no pattern pictures. The live score leaves out habitat bonuses. One hint says "Turn it" for a tile that cannot turn. |
| Fun moment | 5 | The bear pair lights up and "+4 Twin Dens" pops. But the score pop-ups stack into faded, unreadable text. You never see the rival play, and the result screen is just a table. |
| Feedback / juice | 5 | There are score pop-ups, glows and toasts, but no animation for placing tiles or tokens. Pop-ups linger and overlap. The stars on "Chapter won!" are drawn wrong. |
| Computer opponent | 5 | Normal is a fair fight (close games every time). Hard plays no better than Normal (48% / 92.0 vs 91.6). Easy averages 82, which is too strong for a new player in Story chapter 2. |
| Phone | 6 | Everything fits with no page scroll, and the main buttons are 44 px. The animal icons on market tiles are about 12 px. Toasts and coach bubbles cover the chips and the map. The menu chips are 36 px tall and one label is clipped. |
| PC | 6 | It plays cleanly. The market sits as a 2x2 block at the top of the right panel, so the bottom half of that panel is empty. The score is shown twice in the header ("Score 83" and "You 83"). |
| Structure parity with the old shelf games | 4 | All the parts are there: title, Story map, tutorial, help, menu, Resume. But it has no art at all: every portrait is a grey silhouette, there is no title scene, and Story rewards unlock "portraits" that are silhouettes. There is no Online or table-size quick start like the old games have. |
| **Average** | **5.25** | I would not show this to a paying player yet. |

## 2. Bugs

No bug stops play: every flow above reaches its end, with no errors. Bug 1 blocks release.

1. **No art: silhouette portraits and an art-free title and Story** (phone + PC), **blocking for release**
   1. Clear storage, open the game: the title is a text card on a green gradient, while old shelf games show a full scene.
   2. Tap Story, finish or skip the prologue: Ward Elder Rowan is a grey person silhouette.
   3. Play chapter 1 to "Chapter won!": the reward is "Rowan's portrait", which is the same silhouette.
   4. Open the Story map: the boss nodes (3, 6, ...) show silhouettes too.
2. **Hard is no harder than Normal** (both devices), **major**
   1. Quick game, Rival skill = Hard, then play a game against Normal.
   2. Both play the same way. In 60 AI-vs-AI games, normal vs hard was 48% wins with averages 92.0 vs 91.6.
3. **The live score leaves out habitat bonuses, but the Scores drawer and the result include them** (both), **major**
   1. PC Quick game: at turn 19 the chips read "You 83 / Bram 82", so it looks like you are winning.
   2. The result says 88 vs 99, because Bram got +8 in habitat bonuses.
   3. Phone, turn 3: the chip says "You 12" while the Scores drawer total says 16 for the same moment.
4. **Two bubbles on top of each other in the tutorial** (phone, most visible), **major** (it confuses the first minute)
   1. Clear storage, tap "New here? Learn in 5 minutes".
   2. Step 4 ("Place the tile"): the tutorial bubble and the coach bubble ("Place the tile ... Got it") are both on screen, overlapping the map.
   3. The first Story launch shows the same thing on step 1: "Got it", "Next" and "Skip tutorial" all at once.
5. **Story difficulty jumps between chapter 1 and chapter 2** (both), **major**
   1. Chapter 1's goal is "Score at least 50". With normal-level moves I scored 83-94, far above it.
   2. Chapter 2, Pip (labelled the easy, "takes whatever looks nice" rival): Pip scored 88 and beat my normal-level moves (87). Easy averages 82 in the simulations.
   3. A newcomer who just scraped 50-60 in chapter 1 will lose chapter 2 again and again.
6. **Score pop-ups linger and pile up** (both), **minor**
   1. Play to about turn 10 or later.
   2. "+4 Curious Fox", "+1 acorn", "+1 habitat" and older faded copies sit on top of each other over the tiles and are hard to read (`pc-g-07-t18`, `phone-g-07-t18`).
7. **The "Chapter won!" stars are drawn wrong** (both), **minor**
   1. Win Story chapter 1 or 2.
   2. The three stars are stacked vertically in a narrow orange pill, and each star has a chevron mark over it. They should sit in a row.
8. **The hint says "Turn it, then tap Place" for a tile that cannot turn** (phone), **minor**
   1. Quick game, take a single-terrain tile (for example the river keystone) and tap a spot.
   2. The hint says "Turn it, then tap Place", but there is no Turn button.
9. **Toasts cover other parts of the screen** (phone), **minor**
   1. Start Story chapter 1: the "Goal: Score at least 50 points." toast covers the animal score chips for several seconds.
   2. In a Quick game, open Scores while the rival is playing: the "Bram placed a Fox." toast overlaps the drawer title.
10. **Clipped label and short chips in the menu** (phone), **minor**
    1. In a game, tap Menu.
    2. "Accessibility" overflows its chip and touches Help and About. The chips are 36 px tall, under the 44 px minimum.
11. **You never see the rival play** (both), **minor**
    1. Quick game vs 1 rival.
    2. On the rival's turn you only get "Bram is choosing" and a toast like "Bram placed a Hawk". Your board stays on screen.
    3. Tapping "Bram" shows his board, but nothing says it is his. Only the chip highlight changes, and the market stays visible.
12. **A thin 1 px line crosses the board during the tutorial** (phone), **minor**
    1. In the tutorial, step 4 shows a horizontal line at y≈332 and step 15 a vertical line at x≈202. These look like seams in the spotlight overlay.
13. **Story outro and Music control oddities** (both), **minor**
    1. The last page of a chapter outro shows both "Skip" and "Back to the map", which do the same thing.
    2. In Menu > Sound, "Music" is a button labelled "Music" and not an On/Off toggle like "Sound effects". No music files exist, so it does nothing you can hear.

## 3. Top 5 changes (ranked)

1. **Art pass to reach shelf parity.** Add a title scene, real portraits for Rowan, Pip, the bosses and the map nodes, and textured
   terrain. Without it, Story rewards are meaningless and the game looks unfinished next to Cauldron Fair.
2. **One honest score everywhere.** Count the provisional habitat bonuses in the live chips, the same way the Scores drawer does.
   Also show the rival's move: briefly switch to their board, or animate their tile and token, with a "Bram's valley" label.
3. **Retune the AI levels.** Make Hard actually stronger (use acorns, deny the rival key tiles, look deeper), with a target of Hard
   ≥ 60% vs Normal. Make Easy weaker (it should average about 65-70), so chapter 2 is winnable after the tutorial. Add a
   level-vs-level check to `ai-gate.js`.
4. **Clean up the overlays.** No coach bubbles while the tutorial runs. Keep toasts away from the chips and open drawers. Fade
   score pop-ups quickly and don't let them stack. Put the stars in a row. Hide "Turn it" when the tile cannot turn.
5. **Show the patterns.** Add small hex pictures for each animal card in How to play and the card popup. Add a short line on the
   result screen saying why you won or lost (for example "Bram's 5 habitat bonuses: +8").
