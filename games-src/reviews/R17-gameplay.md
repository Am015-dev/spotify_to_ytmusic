# R17 strict gameplay re-review (12 Nov 2026)

Scored by games-src/reviews/GAMEPLAY-RUBRIC.md. Each game was built from its own branch with its own build.py, served next to
its games/<slug>/media folder, and played by Playwright touch only at 390x844 and 375x667 (tutorial to the end, then a full
game to the result screen). Earlier findings come from the last review on each game (R10 hollowbough, R8 cauldron-fair,
R2 and G2 vinegrave). Rules were checked against the published rules online; notes stayed local.

| Game | Total | Verdict | Lowest rows |
|---|---:|---|---|
| hollowbough | 7.3 | FAIL | Phone play 6 |

## hollowbough (branch shelf/W482-hollowbough @ 1b6f0e70): 7.3 FAIL

Build: the game's own build.py, served over http next to games/hollowbough/{media,models,music,cards}. I played with Playwright touch only (isMobile, hasTouch, page.touchscreen.tap), with fresh storage, as a new player. Each size started on the title: "New here? Learn in 5 minutes" → the tutorial to its end → "Play a real game" → goal card → a full game vs computer on the default level → result screen. The game speed was left at its default (no AI delay shortened). In the real game my player followed the hint for about 65% of taps and tapped a random glowing target for the rest. Tutorial: 27 steps, 35 taps, 38 s at each size. Games: at 390x844 I won 40-34 (69 taps, 77 s). At 375x667 I won 44-41 (78 taps, 90 s). Both runs had 0 page errors, 0 console errors, 0 stuck states and 0 covered or dead targets. Rival waits: 26 and 32 waits, median 1.1 s, max 1.5 s at 390 and 1.7 s at 375, none over 2 s. I checked every visible, uncovered text node's computed font size and every visible tap target with my own script every 8 taps and on every new choice. I also ran a separate early-tap test on tutorial steps 1-10. I checked the rules against the published rules online (notes are local only).

| # | Row | Score | Why |
|---|-----|------:|-----|
| 1 | Rules fidelity | 8 | No change since R10, and still right. At 2 players there are 8 basic places + 3 forest places + the Haven (2 cards for any 1), and a 2-4 worker year (2, then +1 Spring, +1 Summer, +2 Autumn). You hold up to 8 cards and the city holds 15. The Journey is Autumn only, 2-5 points, with an exact discard count. 4 special events, unique and common cards, and ties go to most events. Every choice I hit was in the rules. |
| 2 | Tutorial teaches | 7 | 27 steps in rule order, one short line each, 77x44 Next, ending on "You know the rules → Play a real game". Still: you start with 3 prebuilt cards and 6 points you never earned ("Your city: 4 of 15" after your first build). A tap 150 ms after a bubble appears is still silently ignored on 7 of 10 early steps. At 375 the bubble covers the score chips, the goods row and the tabs. Autumn is never played ("Real games end in Autumn. Tap Pass twice to end now"). |
| 3 | First 10 seconds | 7 | One clear title with "New here? Learn in 5 minutes". The goal card has 3 short lines, then "Place a worker" with the places glowing and a ghost finger. The title tagline is 13 px. |
| 4 | Turn clarity | 7 | Fixed: the two seat chips sit side by side and both scores always show. The Journey prompt says "0 of 3 discarded. Tap 3 more." Belfry, Ranger, cellar and give choices all have plain one-line prompts with full-width buttons. Still: the prompt is a small corner pill, and at 375 it gets cut ("Tap cards to discard, then tap…"). "Pick which effect goes first" glows two city cards but never says what either effect does. |
| 5 | Phone play | 6 | The size bar is now met: every play label measured 14 px or more at both sizes (only 2 title lines are 13 px), and every target I measured is 44 px or more. The 4x3 board at 375 fits. But things are still cut off or overlapping. The "Prepare after 1 more worker" button text overflows its box at 375 (58 px of text in a 46 px box, "worker" cut). The "+2 points" and "-1" pills sit over place names, the tabs and the rival chip. Journey meeples cover "Autumn only · 2-". At 390 the last goal text runs under the hand. At 375 the cellar choice bar hides the 5th city row, and the achievements line is cut on the result screen. Only 3 of 5-8 hand cards show without a sideways swipe. |
| 6 | AI and pacing | 8 | Fixed: no rival wait over 2 s (max 1.7 s, median 1.1 s) at both sizes. A part-random new player won both games on the default level, and both were close (40-34, 44-41). The rival plays sensibly: it builds, takes goals and uses the Journey (11 points in one game). A full year takes about 1.5 minutes, which is short but complete. |
| 7 | Feel | 7 | Painted places with name plates, meeples on places, cards fly to the city, the number pops on the score, and the result has painted art and a breakdown. The floating point pills linger over the board in most screenshots and look pasted on. |
| 8 | Bugs | 8 | 2 tutorials and 2 full games to the result: 0 errors, 0 stuck states, 0 dead taps. Display faults only (the text overflow and clipping listed under row 5). |
| | **Total** | **7.3 FAIL** | Row 5 is below 7: text is big enough now, but buttons, goals, the city and the result still cut or cover content at phone sizes. |

### Earlier findings (R10)
| Finding | Status | Evidence |
|---|---|---|
| Row 5: place names 11-12 px, rewards/shared/chip counts 11-12 px, goals 13 px | **Fixed.** No play label under 14 px at 375 or 390. Only the title tagline and the online note are 13 px. | games-src/reviews/R17-shots/hb-game-390-first.jpg, games-src/reviews/R17-shots/hb-game-375-mid.jpg |
| Row 4/5: own chip grows over the rival chip and hides the score | **Fixed.** Both chips sit side by side with scores visible during every choice. | games-src/reviews/R17-shots/hb-game-375-q-trigger.jpg, games-src/reviews/R17-shots/hb-game-390-q-discard.jpg |
| Row 5: 4th city row half hidden behind the hand bar at 375 | **Partly fixed.** The city is 3 across and the trigger choice shows the cards. With 14 cards, the cellar choice bar hides the 5th row. | games-src/reviews/R17-shots/hb-game-375-q-stock.jpg |
| Row 4: Journey "Tap more, or Done" with no Done button | **Fixed.** "0 of 3 discarded. Tap 3 more." The free-count discard has a real "Done discarding" button. | games-src/reviews/R17-shots/hb-game-390-q-discard.jpg, games-src/reviews/R17-shots/hb-game-375-q-discard.jpg |
| Row 4: Inn says "Do not pay 1 resin" on a berry card | **Not seen.** The Inn did not come up in my 2 games, so I cannot confirm it. | none |
| Row 6: one 15.3 s rival turn | **Fixed.** Max wait 1.5 s (390) and 1.7 s (375), out of 58 waits. | games-src/reviews/R17-shots/hb-game-375-result.jpg |
| Row 7: "+2 points" pill lands on the tab bar, not the score | **Not fixed.** The score number now pops, but the pills still float over tabs, place names and the rival chip. | games-src/reviews/R17-shots/hb-game-375-q-ranger.jpg, games-src/reviews/R17-shots/hb-game-375-q-discard.jpg |
| Row 2/5: tutorial Next 68x38 | **Fixed** (77x44). | games-src/reviews/R17-shots/hb-tut-375-s5.jpg |
| Row 2: early taps ignored silently | **Not fixed.** At 150 ms, 7 of 10 early steps (Next and target steps) ignored the tap with no feedback, at both sizes. | games-src/reviews/R17-shots/hb-tut-375-s5.jpg |
| Row 2: 3 prebuilt cards and 6 unearned points | **Not fixed.** Step 5 shows "You 3/15 ★6" before you have built anything, and step 8 says "Your city: 4 of 15". | games-src/reviews/R17-shots/hb-tut-375-s5.jpg, games-src/reviews/R17-shots/hb-tut-375-s9.jpg |
| Row 2/5: at 375 the bubble covers the tabs and top row | **Partly fixed.** The top row of places shows. The bubble still covers the goods row and tabs. | games-src/reviews/R17-shots/hb-tut-375-s5.jpg |

### New findings
| Row | What I did | What happened | Screenshot |
|---|---|---|---|
| 5 | Tutorial step 5 at 375x667 | The "Prepare after 1 more worker" button wraps to 3 lines in a 149x50 box (text 58 px tall, box 46 px), so "worker" is cut at the bottom. At 390 it overflows by 3 px. | games-src/reviews/R17-shots/hb-tut-375-s5.jpg |
| 4/5 | A Spring discard choice at 375 | The prompt pill is cut: "Tap cards to discard, then tap…". A "+2 points" pill sits on the rival chip and hides "1/15". | games-src/reviews/R17-shots/hb-game-375-q-discard.jpg |
| 5 | Opened Goals during the Journey discard at 390 | Journey meeples cover "Autumn only · 2-". A "+3 points" pill covers "Wayfarers' Fair". The last goal line ("…tucked, up to 6") runs under the hand bar. | games-src/reviews/R17-shots/hb-game-390-q-discard.jpg |
| 5 | A cellar choice with 14 cards in the city at 375 | The 4 choice buttons cover the 5th city row. Cards 13-14 show only their top edge. | games-src/reviews/R17-shots/hb-game-375-q-stock.jpg |
| 5 | Won at 375x667 | The achievements line ("First city, Top of the tree, Fifteen roofs") is cut by the Play again / Look at the board buttons. | games-src/reviews/R17-shots/hb-game-375-result.jpg |
| 4 | Got "Pick which effect goes first" at 375 | Two city cards glow (Tallyshop Mouse, Chronicle Owl), but no text says what either effect does, so a new player picks blind. | games-src/reviews/R17-shots/hb-game-375-q-trigger.jpg |
| 7 | Watched points and goods change during play | "-1" and "+1 point" pills stay on screen over the tabs and place names in most mid-game shots and look pasted on. | games-src/reviews/R17-shots/hb-game-375-mid.jpg, games-src/reviews/R17-shots/hb-game-375-q-ranger.jpg |
| 6 (works) | Played 2 default games as a part-random new player | Won 40-34 and 44-41, max rival wait 1.7 s, 0 errors. The result names the winner with a per-category table. | games-src/reviews/R17-shots/hb-game-390-result.jpg, games-src/reviews/R17-shots/hb-game-375-result.jpg |
| 3 (works) | Started a real game from the tutorial end card | "You know the rules → Play a real game", the goal card, then "Place a worker" with glowing places and a ghost finger. | games-src/reviews/R17-shots/hb-tut-end-375.jpg, games-src/reviews/R17-shots/hb-game-390-first.jpg |
