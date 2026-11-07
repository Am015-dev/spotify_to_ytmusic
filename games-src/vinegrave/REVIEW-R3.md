# Vinegrave: player review R3 (7 Nov 2026)

Build reviewed: `vinegrave.html` (single file, 393 KB, 0 pictures). Loaded from file://, Playwright, real input.
Phone 390x763 (hasTouch, isMobile, taps) and PC 1440x860 (mouse clicks), deviceScaleFactor 1.
Played: first launch (empty storage) -> guided round to its end card (18 bubbles / 14 steps) -> one full Quick game vs Normal computer
to the result on each device (phone: lost 48-85; PC: won 71-54; moves picked from legal targets, executed by taps/clicks, animation
fast mode on) -> Story stage 1 (lost 47-60, then won 68-32) and stage 2 (won 71-59) on phone -> every title button, top-bar
button (Hint, Scores, Log, How to play, Menu with all 6 tabs), All cards, hand-card and market-card large views, phone + PC.
One slow (no fast mode) game on phone to see the guardian moment. Old shelf comparison: games/cauldron-fair title on phone.
Console: 0 page errors, 0 console errors in every run. No stuck states, no illegal-move dead ends.
Screenshots: scratchpad `vinegrave-review/shots/` (not in the repo).

## 1. Scores

| Row | Score | Why |
|---|---|---|
| First minute | 5 | Tutorial is correctly offered first, but the title is a text box on a gradient and the first board is a wall of icon tiles and cards showing two-letter initials ("TN", "PL", "CD"), with both scores at -2. |
| Rules clarity | 6 | 14-step guided round, How to play drawer, card large view with full text and All cards reference are all good; tiles are icon-only, the -2 start score is never explained. |
| Fun moment | 4 | The guardian wake card is the only "moment" and it uses a generic ghost glyph for every guardian; discovering/overcoming feels like a ledger entry. |
| Feedback / juice | 4 | Glow on legal targets and toasts exist, but toasts sit on top of the ruins, the win/loss screen is a bare table with no celebration, no art anywhere. |
| Computer opponent | 6 | Fast, never stuck, plays a credible engine game (85 pts vs me on phone); but Story stage 1 "easy" Tamsin beat a player using the game's own normal-level choices 60-47, too sharp for a first chapter. |
| Phone | 5 | Fits 390x763 with no scroll and 44 px top buttons, but market cards are 59 px wide with initials, ruins/guardians are 20 px icons, Menu tabs overflow, toasts and hint bubbles cover the board. |
| PC | 6 | Card names visible and readable; section labels "Ruins"/"Camp" clipped, guardian token covers ruin names, board is a flat grid with lots of dead space and no picture. |
| Structure parity with old shelf games | 5 | Has title, Story map (3 acts, 10 stages, dialogue), guided round, help bulb, drawers, Menu, All cards; missing title art/logo, card art, music, Online, and a proper Story loss/outro screen; the old games feel finished next to it. |
| **Average** | **5.13** | Not showable to a paying player yet. |

## 2. Bugs

1. **No art anywhere: cards are two-letter initials, title has no illustration or logo** (phone + PC) - **blocking** (release)
   1. Clear storage, open the game. 2. Title is a text card on a plain green gradient (compare games/cauldron-fair: full painted scene + logo).
   3. Tap Learn to play / Play: every item, artifact and starting card face is a coloured block with initials ("SB", "JF", "CD"); ruins are a
   compass placeholder; guardians are one generic ghost glyph. The build itself reports 0 pictures present.

2. **Losing a Story stage shows "Continue the story" as the primary button, no loss message or Try again** (phone + PC) - **major**
   1. Title > Story > stage 1 > Play. 2. Lose the game (e.g. 47-60). 3. Result says "Tamsin Reed wins." with a big gold
   "Continue the story"; it returns to the map with stage 1 unbeaten and 0 stars. A player reads this as progress; there is no
   "Try again" and no outro/loss line from the cast.

3. **Story stage 1 is too hard for "easy"** (phone) - **major** (balance)
   1. Story > stage 1 (rival aiLevel easy). 2. Play every move as the game's own normal-level choice. 3. Lost 47-60 (Tamsin: research 25,
   temple 6). Second try with hard-level choices won 68-32. First chapter of a story should be winnable by a newcomer.

4. **Guardian wake card lingers over the board into the next turn** (phone; PC not checked slow) - **major**
   1. Phone, Quick game, animations normal (no fast mode). 2. Discover a ruin. 3. "Canopy Wyrm wakes!" card covers rows 2-3 of the board and
   the market; 1.8 s later Tamsin has acted, the dock says "Pick one action" and the card is still covering the board.

5. **Toasts cover the deep-ruin row during your own turn** (phone + PC) - minor
   1. Any game. 2. At round start or after the rival acts, a toast ("Round 3 begins. The market shifts.", "Tamsin Reed digs at...") sits
   over the top row of ruins for ~2 s while it is your turn to tap them.

6. **Grammar in toasts and card text** (phone + PC) - minor
   1. Discover a ruin yourself: toast reads "You discovers Sunken Well!". 2. Tap Brass Sextant in the market: "Worth 1 points at the end".
   3. Rules > All cards: "1 coins · 0 points".

7. **Board section labels clipped by the tiles** (PC) - minor
   1. PC 1440x860, start any game. 2. Left labels read "Deep ruins", "Ruin", "Cam" - the second and third rows of tiles overlap the labels.

8. **Guardian token covers the ruin name** (PC + phone) - minor
   1. Discover a ruin (or `?scn=vg-overcome`). 2. The red guardian badge sits over the ruin title ("Root Gate" unreadable).
   On phone the guardian is a ~20 px icon inside a 59 px tile: the centrepiece is invisible on the board after the pop.

9. **Menu tab row overflows on phone; "Accessibility" spills over its neighbours** (phone) - minor
   1. Phone, in game, tap Menu. 2. Tab chips Game/Sound/Speed/Help/Accessibility/About: the Accessibility label is wider than its chip
   and overlaps Help and About.

10. **Hint bubble's pointing-hand icon covers the target card's cost and name** (phone) - minor
    1. Phone, in game, tap the lightbulb. 2. "Buy Box Camera to grow your deck." The hand glyph is drawn over the card's initials and
    cost; the bubble also covers the middle ruin row.

11. **All cards list: thumbnail icons overlap the initials** (phone) - minor
    1. Phone > How to play > All cards. 2. In each row thumbnail the coin/travel icons are drawn through the initials ("BM", "DC").

12. **Score starts at -2 with no explanation** (phone + PC) - minor
    1. Start any game. 2. Both chips show "-2" before anyone acts (two Dread cards in the starting deck). The guided round never says why;
    a new player reads it as a penalty for something they did.

13. **Phone header: leaf logo overlaps the "Stage 2 · Round 1/5" text** (phone) - minor
    1. Story > stage 2 > Play. 2. The leaf icon at top left is drawn over the "S" of "Stage".

14. **Story best score not saved** (phone) - minor
    1. Beat stage 1 (68 points) and stage 2 (71). 2. `gns-campaign-vinegrave` stores `"best": null` for both stages.

15. **Guided round: bubble title changes before its text** (phone) - minor (seen in the tutor state, not confirmed on screen)
    1. Learn to play. 2. At the "Tamsin's turn", "A guardian wakes!", "Research" and "Fleeing costs" steps the new title is shown with the
    previous step's sentence ("Tamsin's turn: Trail Notes gives a compass...") until the next update.

## 3. Top 5 changes (ranked)

1. **Art pass before anything else**: title illustration + logo, one picture per item/artifact family, one per guardian (15), ruin tile
   backs/fronts, camp sites. Replace the two-letter initials everywhere (hand, market, All cards). This alone moves first minute, phone,
   juice and parity.
2. **Make the guardian moment a real moment and fix the result screen**: full-width guardian card with its own art, a short shake/roar,
   dismiss on tap or before the next turn (bug 4); gold "Overcome!" card; result screen with a win/loss banner, stars and the cast's line.
3. **Story flow**: on a loss show "Try again" (primary) + a loss line; tune stage 1 rival down (bug 3); save best score; play the outro
   dialogue on a win.
4. **Phone board readability**: larger ruin/market tiles with names, guardian shown big on its ruin, toasts moved into the dock instead of
   over the board, hint hand off the target; fix label clipping (PC), guardian badge over names, Menu tab overflow, All cards thumbnails.
5. **Words**: fix "You discovers", "1 points", "1 coins"; explain the starting Dread (-2) in step 1 of the guided round; sync tutor bubble
   title and text.
