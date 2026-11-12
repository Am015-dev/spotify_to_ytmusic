# R17 strict gameplay re-review (12 Nov 2026)

Scored by games-src/reviews/GAMEPLAY-RUBRIC.md. Each game was built from its own branch with its own build.py, served next to
its games/<slug>/media folder, and played by Playwright touch only at 390x844 and 375x667 (tutorial to the end, then a full
game to the result screen). Earlier findings come from the last review on each game (R10 hollowbough, R8 cauldron-fair,
R2 and G2 vinegrave). Rules were checked against the published rules online; notes stayed local.

| Game | Total | Verdict | Lowest rows |
|---|---:|---|---|
| hollowbough | 7.3 | FAIL | Phone play 6 |
| cauldron-fair | 7.0 | FAIL | Tutorial 6, Phone play 6, Bugs 6 |
| vinegrave | 6.8 | FAIL | Turn clarity 6, Phone play 6, Feel 6 |

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

---

## cauldron-fair (branch shelf/W503-cauldron-gameplay @ e7f1a4c8): 7.0 FAIL

How I tested: I built the branch with the game's own build.py and served the page next to games/cauldron-fair/media. I played with Playwright touch only (isMobile, hasTouch, page.touchscreen.tap at the element centre, after an elementFromPoint check). I did the guided tutorial from "New here? Learn in 5 minutes" to its end card twice. At 390x844 it took 26 steps, 31 taps and 65 s. At 375x667 it took 26 steps, 30 taps and 58 s. Both had 0 errors and 0 stuck steps, but 3 and 2 taps on the glowing bag were ignored. I then played 2 full 9-day games against the default rival (2 players, easy) from the title to the result screen, as a naive new player: draw until the whites reach 5 (sometimes stop at 4), buy the dearest chip I can afford plus sometimes a second colour, and spend rubies on the droplet. At 390x844 I won 41-25 (120 taps, 160 s). At 375x667 I won 33-26 (106 taps, 110 s, 3 scrolls in the shop). Both games had 0 page errors, 0 console errors and 0 stuck states. The longest wait with nothing to tap was 6.7 s, at the day-9 count. The other gaps were 1-5 s. At every decision point I measured every visible text node (computed font size, clipping) and every control. I also opened the Rules screen. I checked the rules against the published rulebook online (notes are local only).

| # | Row | Score | Why |
|---|---|---|---|
| 1 | Rules fidelity | 8 | The turn, the explosion over 7 (the last chip stays), the flask (not on an explosion), rat tails from day 2, the bonus die for the furthest safe pot, points or shop after an explosion, 2 rubies for the droplet or the flask, yellow opening on day 2 and purple on day 3, and the last-day secret draw with 5 coins or 2 rubies = 1 point all match. The engine adds the day-6 white and stops on an empty bag. The Rules screen still mentions neither. |
| 2 | Tutorial teaches | 6 | 26 one-line steps in rule order. Red, yellow, blue, purple, the flask, the droplet and the refill are all done by tapping. But green and black are still only read from one Next card ("Stalls say what chips do"), and counting rat tails is never shown. "Hask added chips" still names someone the player never met. In every run 2-3 taps on the glowing bag, made about 0.5 s after the bubble appeared, did nothing, and I had to tap again. |
| 3 | First 10 seconds | 8 | The title leads with "New here? Learn in 5 minutes". A real game opens on a 3-line goal card ("Have the most points after 9 days"), then the board. The bar reads "YOUR TURN · Tap the bag to draw your first chip." |
| 4 | Turn clarity | 7 | Fixed: the ruby stall now says "Move your drop +1 · 2 rubies" and "Refill flask · 2 rubies". The YOUR TURN bar sits above the fortune sheet and no longer hides its title. Still: the yellow prompt and panel are titled "Kind cut", which means nothing. A fortune card's name shows 4 times at once (chip, YOUR TURN bar, NOW strip, sheet title). The Wren Feather "pick one" panel shows the peeked chips as tiny 1-icons. |
| 5 | Phone play | 6 | No text under 14 px anywhere. The shop's hint line is no longer clipped at 390, and the 375 shop has a "N more stalls ▼" cue. Still: the "Day N/9" button is 71-74x21 px in every game. The coach avatar still covers the first letter of every tutorial title ("top here", "lue chip", "oves and scores"). At 375 the half-visible bottom row of shop chips sits under the scroll fade and cue, and a tap on a chip there landed on the stall wrapper and did nothing. The choice sheet overlaps the bottom of the "NOW / ALL DAY Fortune" strip at both sizes. |
| 6 | AI and pacing | 8 | The naive policy won 2 of 2 (41-25 and 33-26), so a new player can win on default. The rival plays brisk, sensible pots (it exploded once, mid-game). A game is about 110-160 s and 106-120 taps. |
| 7 | Feel | 7 | Chips fly out of the bag onto the spiral, the ring and meter update, rival cauldrons show "exploded/finished", the count has a die, and the result has a painted card and a per-day table. Chips still fly across the choice sheet and cover button text for a moment. The shop still reads like a form. |
| 8 | Bugs | 6 | 2 tutorials and 2 games to the result with 0 errors and 0 stuck states. But the rubric needs 0 dead taps: 2-3 glowing-bag taps per tutorial run (about 0.5 s after the bubble, a normal pace) did nothing, and at 375 a tap on a half-visible shop chip did nothing. Play goes on after a second tap or a scroll, so this is not a stopper cap, but it is below 7. (Lead reviewer lowered this row from the run's 8.) |
| | **Total** | **7.0** | |
| | **Verdict** | **FAIL** | Tutorial (6), Phone play (6) and Bugs (6) are below 7. |

### Earlier findings (R8)
| Finding | Status | Evidence |
|---|---|---|
| Ruby stall only icons, no words; tapping it gives no words | **FIXED.** The buttons read "Move your drop +1 / 2 rubies", "Refill flask / 2 rubies", and after a tap "Drop moved +1 / tap to undo". The hint line under the stalls does not change after a ruby tap, but the words on the button are enough. | games-src/reviews/R17-shots/cf-shop-ruby-words-375.jpg |
| YOUR TURN banner covers the fortune card title and the top of the choice buttons | **FIXED.** The bar is above the sheet. "Today's fortune card: Clear the Pods" and both buttons are fully clear. New, smaller issue: the sheet overlaps the "NOW Fortune" strip (see below). | games-src/reviews/R17-shots/cf-fortune-choice-390.jpg |
| Shop at 375 scrolls with no cue; stalls hidden | **PARTLY FIXED.** A "1 / 2 / 4 more stalls ▼" button now shows. The half-visible bottom row of chips under it still looks tappable but swallows the tap (see New findings). | games-src/reviews/R17-shots/cf-shop-375-cue.jpg, games-src/reviews/R17-shots/cf-shop-ruby-words-375.jpg |
| Coach avatar covers the first letter of every tutorial title | **NOT FIXED.** elementFromPoint at the first letter of the title returns the portrait (tutpor) on all 26 steps at both sizes: "top here", "lue chip". | games-src/reviews/R17-shots/cf-tut-avatar-title-375.jpg |
| "Hask added chips", an unnamed character, at step 18 | **NOT FIXED.** Step 18 still reads "Hask added chips; draw, a red moves 1 extra after an orange." | games-src/reviews/R17-shots/cf-tut-avatar-title-375.jpg (same bubble style); text from the step log |
| "Day N/9" button 71x21 px | **NOT FIXED.** It measured 71x21 to 74x21 on every day of both games. | games-src/reviews/R17-shots/cf-brew-mid-375.jpg |
| Hint line clipped under the bottom bar at 390 | **FIXED.** "Tap a chip to see what it does. Buy up to 2, different colours." is fully visible at both sizes. | games-src/reviews/R17-shots/cf-shop-375-cue.jpg |
| Yellow prompt headed "Kind cut" | **NOT FIXED.** In a real game the bar reads "Kind cut: Return the white chip to the bag?" and the panel title is "Kind cut". | games-src/reviews/R17-shots/cf-kindcut-strip-375.jpg |
| Green and black only read, never done, in the tutorial | **NOT FIXED.** Step 11 ("Stalls say what chips do") is the only mention, a Next card. | games-src/reviews/R17-shots/cf-shop-ruby-words-375.jpg |
| Rat-tail counting never shown | **NOT FIXED.** Step 17 says "You trail, so your rat gives a head start", but nothing shows the tails being counted. | step log |
| Rules screen leaves out the extra white before day 6 and "empty bag means stop" | **NOT FIXED.** The How to play text mentions neither. | games-src/reviews/R17-shots/cf-rules-375.jpg |

### New findings
| Row | What I did | What happened | Screenshot |
|---|---|---|---|
| 2/8 | Tutorial at both sizes: tapped the glowing bag about 0.5 s after each draw step appeared | 3 of the bag taps at 390 and 2 at 375 (steps "keep", "redsaw", "yellow") did nothing: no draw, no shake. The step only moved on after a second tap 2.5 s later. A new player would think the game froze. | games-src/reviews/R17-shots/cf-tut-avatar-title-375.jpg (the bag is the spotlight target on these steps) |
| 5/8 | Day-3 shop at 375x667 with 12 coins: tapped the half-visible Sunroot 2 chip (12 coins, enabled) in the bottom row | elementFromPoint at the chip's centre was the stall wrapper (stw), not the chip. 3 taps selected nothing. Only after I scrolled the stall list did the chip take a tap. The row sits under the "2 more stalls ▼" cue and its fade, but its glowing rims still show. | games-src/reviews/R17-shots/cf-shop-375-cue.jpg |
| 5 | Got a fortune choice (390) and a yellow choice with an all-day fortune (375) | The choice sheet slides over the bottom half of the "NOW Fortune: Clear the Pods ▸" / "ALL DAY …tune: Lucky Seven ▸" strip, so that strip is cut. | games-src/reviews/R17-shots/cf-fortune-choice-390.jpg, games-src/reviews/R17-shots/cf-kindcut-strip-375.jpg |
| 4 | Read the fortune choice screen | The same card name shows 4 times at once: the board chip "NOW Clear the Pods", the YOUR TURN bar, the "NOW Fortune" strip and the sheet title. That is noise, not clarity. | games-src/reviews/R17-shots/cf-fortune-choice-390.jpg |
| 7/5 | Drew a blue Wren Feather (390) and a yellow chip (375) | The drawn chip flies across the choice sheet and for a moment covers the first button ("Place … ut them all back"). The peeked chips are shown as two tiny "1" icons above the buttons. | games-src/reviews/R17-shots/cf-wren-chip-over-button-390.jpg |
| 6 (works) | Played 2 default games as a naive new player | Won 41-25 at 390 and 33-26 at 375. 0 errors, waits of 1-5 s with one 6.7 s at the last count, 110-160 s per game. The result card names the winner and shows a per-day table. | games-src/reviews/R17-shots/cf-result-win-390.jpg, games-src/reviews/R17-shots/cf-result-win-375.jpg |
| 2 (works) | Finished the tutorial | The end card reads "Now a real game / You know every rule" with one "Play a real game" button, and the real game starts on the goal card. | games-src/reviews/R17-shots/cf-tut-end-390.jpg |

### Rules coverage
- Goal, most points after 9 days: covered (rules screen, tutorial, goal card).
- Fortune card each day, purple now, blue all day: covered (both, done in the tutorial).
- Rat tails give trailing players a head start from day 2: on the rules screen. The tutorial names it but never shows the counting.
- Draw blind, chip moves by its number, everyone at once: covered (both).
- Whites over 7 explode, the last chip stays, you must stop: covered (both).
- Flask returns the last white once a day, not on an explosion, refill for 2 rubies: covered (both).
- Score the space after the last chip, ruby on that space: covered (both).
- Bonus die for the furthest safe pot, ties all roll: covered (both).
- Green, purple and black act after the brew: rules screen. Only purple is done in the tutorial.
- Blue, red and yellow act when drawn: covered, all done in the tutorial.
- Exploded pot takes points or shop: covered (both, done).
- Buy 1 or 2 chips of different colours, leftover coins lost: covered (both, done).
- Yellow opens day 2, purple day 3: covered (both).
- 2 rubies move the droplet or refill the flask: covered (both, done, now in words).
- Extra white chip before day 6: tutorial only ("day 6 adds a white"), missing from the rules screen.
- Empty bag means stop: missing from the rules screen and the tutorial (the engine does it).
- Last day: secret draw/stop, no shop, 5 coins or 2 rubies = 1 point, tie goes to the furthest pot: covered (both).

---

## vinegrave (branch shelf/W490-vinegrave-bench @ cd755b6d): 6.8 FAIL

How I tested: built with the game's own build.py and served the page next to games/vinegrave/media. Playwright touch only (hasTouch, isMobile, page.touchscreen.tap, elementFromPoint checked before every tap). Tutorial from the title ("Learn to play") to the end card at 390x844 (35 steps, 35 taps, 86 s) and at 375x667 (35 steps, 35 taps, 87 s): every target took the first tap, 0 errors. Then 3 full 5-round games against the default rival (1 computer rival, easy) from the title (Learn to play, Skip tutorial, Play, Start the expedition) to the result screen, as a new player: play free cards first, then research, beat guardians, discover ruins, buy what I can afford, dig, else Pass. At 390x844 I won 34-30 (224 s, 126 taps) and 37-30 (214 s, 117 taps). At 375x667 I won 36-12 (188 s, 145 taps). 0 page errors, 0 console errors, 0 stuck states. Waits with nothing to do: median 0.3-2.9 s, max 24.3 s (390, twice) and 10.9 s (375). I checked every visible text node's computed size, clipped text (scrollWidth > clientWidth) and button sizes at every tutorial step. Rules checked against the published rulebook text online (notes kept locally only).

| # | Row | Score | Why |
|---|-----|------:|-----|
| 1 | Rules fidelity | 7 | The newly added rules match what I could check in the rulebook: assistants recruited and upgraded by the notebook, once a round, refreshed at round end; free-action items; travel boons; temple stacks sized by player count with the 6 and 11 point costs; a Lost Temple bonus tile; blocking tiles (5 at 2 players, 3 at 3, none at 4) leaving one space per camp; exile from hand or play area; starting cards free; played cards shuffled under the deck; item and artifact beside the divide exiled at round end; tie-break. Still the builder's own numbers: every card, idol slot value, temple costs and assistant effects beyond the 3 shown in the rulebook. |
| 2 | Tutorial teaches | 7 | Fixed: now 35 steps with only 4 Next-only (goal and 3 score steps). Every core rule is done by tapping: free cards, free items, Plane, discover, idol, shrine, guardian, boon, item, artifact, magnifier, notebook, assistant, temple, bonus tile, temple tile, Pass. Still: the rival is "out" for the whole tutorial, so you never see it take a place; goods are topped up between steps and the magnifier is teleported ("Practice jump"); Dread at round end, assistant upgrade, exile and the tablet cost of an artifact from hand are only words or not shown. Every action is "Tap X" then "Tap again". |
| 3 | First 10 seconds | 7 | Title: "Learn to play" first, then Play. A real game opens on a clean goal card ("Most points after 5 rounds wins", 3 icon lines, "Start the expedition"). Then the board with "Your turn: one main action". The dock still says "You are choosing. Tap to skip ahead." behind the goal card. |
| 4 | Turn clarity | 6 | Good: the dock says what a tapped thing costs and what is missing ("Rubber Dinghy. Gain 1 arrowhead + 1 compass. You need 3 coins."), Pass is always there. Bad: every market card glows even when you cannot pay, so glow means nothing. Sites show a Dig/Explore button, but market cards have no Buy button: you must tap the card a second time, which nothing says outside the tutorial. The research track's "A" badges are unexplained. Market effect lines are cut ("+1 arrow +1 compa", "Free: draw 1, +1 coi"). |
| 5 | Phone play | 6 | Fixed: no visible text under 14 px at either size, and no clipped labels on the board ("Deep", "Ruins", "Camp", "Research" all whole). Still: market effect lines are clipped at both sizes; the "+2 points" pill sits over the "You" chip and hides the label and score; the "+1 compass" toast covers the resource counts; hand cards overlap so the second card's name is cut ("Dented Canteen" under the next card); pawns are 34x46 and the score chips 179x40 at 375. The board at 375 is a dense field of small icon discs. |
| 6 | AI and pacing | 7 | Fixed for the new player: I won all 3 games on the default level (34-30, 37-30, 36-12). A game is 3.5-4 min and 43-54 of my turns, a sensible length. The rival still makes a late jump (17 to 30 in the last round, 2 games) and once scored only 12, so the default feels uneven. Two waits of 24 s with nothing to do at 390 after I passed while the rival kept playing. |
| 7 | Feel | 6 | The painted board, painted market art, guardian splash and result picture help. But most turns are tap a disc, read a line in the dock, tap again; the rival's turns are mostly text in the dock; the market is six thumbnail strips with icon numbers. It still reads more like a dashboard of chips than a jungle expedition: the owner's "spreadsheet like" complaint is only partly answered. |
| 8 | Bugs | 8 | 2 tutorials and 3 full games to the result: 0 errors, 0 stuck, 0 dead taps on real targets. The Pass bug and the Skip loop are gone. |
| | **Total** | **6.8 FAIL** | Rows 4, 5 and 7 are below 7. |

Rulebook note: the new rules were checked against a full rulebook summary online. The only PDF I could reach was a 2-page extract, so the page numbers quoted in rules-notes.md were not verified page by page.

### Earlier findings (R2, G2)
| Finding | Status | Evidence |
|---|---|---|
| R2 row 2 / G2 row 2: 16 of 29 steps Next-only; boons, shrines, temple, Dread, plane never done | **Fixed.** 4 of 35 Next-only; boon, shrine, plane, temple tile, assistant all done by tapping. Dread at round end is still only a sentence. | games-src/reviews/R17-shots/vg-tut-390-g-asst2.jpg, games-src/reviews/R17-shots/vg-tut-390-g-beat.jpg |
| R2 row 5 / G2 row 5: text under 14 px, clipped labels "eep ruins", "ESEARC", "Clear Sprin" | **Fixed** for size and board labels (0 text under 14 px; "Deep", "Research" whole). **Not fixed** for market effect lines, still cut at both sizes. | games-src/reviews/R17-shots/vg-tut-375-g-res.jpg |
| R2 row 6 / G2 row 6: new player loses to default rival, late jump | **Fixed** for winning (3 of 3 won). Late jump still there (rival +13 in round 5). | games-src/reviews/R17-shots/vg-game-390-result2.jpg, games-src/reviews/R17-shots/vg-game-375-result.jpg |
| R2 row 3: Skip tutorial then Play loops back to the tutorial | **Fixed.** After Skip, the title's big button is Play and starts a real 5-round game. | games-src/reviews/R17-shots/vg-skip-390.jpg |
| R2 row 4: Pass disappears after tapping research I cannot pay | **Fixed.** Dock says "Next row costs 1 tablet. You need 1 tablet more." and Pass stays. | games-src/reviews/R17-shots/vg-game-390-research-pass.jpg |
| R2 row 4: "You is choosing" | **Half fixed.** Now "You are choosing. Tap to skip ahead." behind the goal card, which still makes no sense to a player. | games-src/reviews/R17-shots/vg-title-390.jpg |
| R2 row 2: last step "Tap Next." vs Finish button | **Fixed.** End card "Prologue complete" with "Play a real game". | games-src/reviews/R17-shots/vg-tut-390-end.jpg |
| R2 row 1: assistants missing; idol slot and temple costs guessed | **Fixed** (12 assistants, recruit/upgrade by notebook, once a round). Slot values and temple costs are still the builder's own. | games-src/reviews/R17-shots/vg-tut-390-g-asst2.jpg |
| R2 row 4 / G2 row 4: market cards only icons, no words | **Fixed** in part: each card now has a one-line effect, but the line is clipped on most cards. | games-src/reviews/R17-shots/vg-game-375-r4.jpg |
| G2 row 1: starting cards used the main action | **Fixed** ("Starting cards are free to play... Your turn goes on"). | games-src/reviews/R17-shots/vg-tut-390-g-disc2.jpg |
| G2 row 2/8: dead tap "Tap again: up one row" | **Fixed.** Every step took one tap at both sizes. | games-src/reviews/R17-shots/vg-tut-375-g-res.jpg |
| G2 row 4: about 12 things glow in a one-tap step | **Fixed in the tutorial** (one spotlight). In real play every market card glows, affordable or not. | games-src/reviews/R17-shots/vg-game-390-research-pass.jpg |
| G2 row 5: hand half off screen at 375, dark vertical line | **Fixed.** Hand fits; no line seen. Cards overlap and cut each other's names. | games-src/reviews/R17-shots/vg-game-375-r4.jpg |

### New findings
| Row | What I did | What happened | Screenshot |
|---|---|---|---|
| 4 | In a real game I tapped a market card I could afford | No Buy button appears (sites show Dig or Explore). It buys only on a second tap of the card, which the real game never tells you. | games-src/reviews/R17-shots/vg-game-390-research-pass.jpg |
| 4 | Looked at the market on my turn with 2 coins | All 6 market cards glow with an orange frame, including ones costing 3-5 I cannot pay. | games-src/reviews/R17-shots/vg-game-390-research-pass.jpg |
| 5 | Read the market at 390 and 375 | Effect lines are cut: "+1 arrow +1 compa", "+2 compasses +1 co", "Free: draw 1, +1 coi". | games-src/reviews/R17-shots/vg-tut-375-g-res.jpg, games-src/reviews/R17-shots/vg-tut-390-g-beat.jpg |
| 5 | Scored points (tutorial and real game) | The "+2 points" / "+1 point" pill sits on the You chip and hides the name and score; resource toasts ("+3 coins") cover the resource counts. | games-src/reviews/R17-shots/vg-tut-390-g-beat.jpg, games-src/reviews/R17-shots/vg-game-375-r4.jpg |
| 5 | Held 5 cards at 375 | Cards fan over each other; the second card's name is covered ("Dented Canteen"). | games-src/reviews/R17-shots/vg-game-375-r4.jpg |
| 2 | Did the whole tutorial | The rival shows "out" from step 1 and never moves; goods appear between steps and the magnifier is moved near the top for you, so it feels staged. | games-src/reviews/R17-shots/vg-tut-390-g-asst2.jpg |
| 6 | Passed in round 4/5 at 390 | 24 s of rival turns with nothing to do (twice). | games-src/reviews/R17-shots/vg-game-390-result2.jpg |
| 6 | Played 3 default games | Won 34-30, 37-30, 36-12. Rival scores swing from 12 to 30, with +13 in the last round. | games-src/reviews/R17-shots/vg-game-375-result.jpg |
| 7 | Watched rival turns and my own | Turns are tap, read a dock line, tap again; the rival is mostly a dock line. Painted art is good but the screen is mostly small icon discs and number chips. | games-src/reviews/R17-shots/vg-game-375-r4.jpg |
| 3 (works) | Opened a real game | Clean goal card with 3 icon lines and one button. | games-src/reviews/R17-shots/vg-title-390.jpg |

### Rules check (against the rulebook text online; page numbers not checked)
- Starting coin and compass cards: rulebook says their effects are free actions. Game: free, turn goes on.
- Assistants: rulebook 12 tiles in 3 stacks of 4, recruited when the notebook reaches a marked row, upgraded on another, once a round, refreshed at round end. Game: same; which rows and 9 of the effects are the builder's own.
- Free-action items: rulebook some item effects are free actions; all artifact effects are main actions. Game: lightning items free, artifacts main actions.
- Guardian boons as travel: rulebook some boons are travel values used once. Game: built on 3 guardians.
- Temple: rulebook 6-point stacks pay two costs, 11-point pays all three, stacks limited. Game: same structure, costs its own.
- Lost Temple bonus tile: rulebook the magnifier reaching the top takes one bonus tile. Game: "First time in the temple: pick a bonus tile".
- Blocking tiles: rulebook setup, none at 4 players, some camps blocked at 3, all 5 at 2. Game: 5 / 3 / 0, one space per blocked camp.
- Exile: rulebook exile from hand or play area; round end exiles the item and artifact beside the divide. Game: same.
- End of round: rulebook says play area shuffled under the deck, hand cards may be kept, draw to 5, Fear for each explorer returning from a guardian site. Game: same.
- Tie-break: rulebook says first into the Lost Temple, then highest research. Game: same.
- Idol slots: rulebook says the idol goes to the leftmost free slot, pick one of 5 effects, empty slots score. Game: free bonus and empty-slot points; the slot values are its own.
