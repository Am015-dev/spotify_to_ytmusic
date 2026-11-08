# R4 gameplay re-review (strict), 8 Nov 2026

Reviewer R4. Scored by `games-src/reviews/GAMEPLAY-RUBRIC.md`. No game code was changed.
Each game was built from its own branch head and served next to its `games/<slug>/media` folder. I played it with Playwright real touch
(taps and CDP touch drags) at 390x844 and 375x667. I re-checked every finding of the first review, then did the tutorial to the end and
played full games to the result screen. I checked the rules against the published rulebook online. Notes are kept outside the repo.
Screenshots: `games-src/reviews/R4-shots/`.

| Game | First review | R4 total | Verdict | Lowest rows | Stopper |
|---|---|---|---|---|---|
| hollowbough | 6.9 | 6.5 | FAIL | Turn clarity 5, Phone play 5, Feel 6 | none |
| rampart-and-vine | 6.8 | 6.9 | FAIL | Turn clarity 6, Phone play 6, AI and pacing 6 | none |
| final-approach | 4.0 (capped) | 4.0 (capped, raw 6.3) | FAIL | Rules fidelity 5, Tutorial 6, First 10 s 6, Turn clarity 6, Phone 6 | yes: speed is checked against the brakes at round end, not when the engine dice are placed |

Final-approach brake rule: the fix asked for is real. Speed equal to the last brake now lands, and with no brakes set the plane never lands
(engine and UI agree, seen in play). But the published rule checks speed against the brakes when the engine dice are placed. This game checks
at the end of the round. So a brake set after the engines still saves the landing, and the tutorial teaches this. That is a rule break, so it stays a stopper.

---

## hollowbough (branch shelf/W482-hollowbough @ f9e1a18a): 6.5 FAIL
I built the game with game/build.py and served it next to games/hollowbough/media. I played by touch only (taps and CDP drags) on a phone (isMobile). I did the tutorial to the end at 390x844 and 375x667: 27/27 steps, 0 errors. I played two full games vs computer (Normal) to the result screen: at 390x844 I lost 46-50 (164 s, 16 drags, 47 taps), and at 375x667 I won 32-25 (139 s). Both games had 0 page errors and 0 stuck states. I checked the rules against the published rulebook.

| # | Row | Score | Why (one line) |
|---|-----|------:|----------------|
| 1 | Rules fidelity | 8 | Matches the rulebook: 2-player setup with 3 forest places, 5/6 starting cards, seasons, free paired critter, Haven 2:1, Journey 5/4/3 one worker each and 2 shared in Autumn only, events, hand of 8, city of 15, tie-break. |
| 2 | Tutorial teaches | 7 | 27 short steps in rule order, one tap each, ends with "Play a real game". Unique vs common is never taught, it starts with a 3-card city you never built, Next is 38 px tall, and a tap in the first ~1 s of a step is silently ignored. |
| 3 | First 10 seconds | 7 | A clear painted goal card, then Start. The first-turn instruction "Place a worker" is almost invisible, but the glowing places carry it. |
| 4 | Turn clarity | 5 | The top instruction line is pale yellow (#ffd77a) on a cream bar, about 1.2:1 contrast, so it is unreadable on every turn. The Belfry choice draws a legal option as "Taken". The city count disagrees between the header and the City tab. |
| 5 | Phone play | 5 | Card names are still cut at 375 (city: "Brambl Allotme", "Goodma Vole"; hand: "2 berrie", "1 pebbl"). Goal names are cut at both sizes. The "+1 point" fly-up still overlaps the tabs. The tutorial Prepare button overflows at 375. |
| 6 | AI and pacing | 7 | The rival plays quickly and sensibly. It beat a player who followed the lightbulb (46-50) and lost the other game (25-32). A year takes about 2.5 min. |
| 7 | Feel | 6 | Places are still a grid of identical discs with text labels and no place names. Workers are tiny meeples beside the tiles. Gain pills, fly-ups and the result table help. |
| 8 | Bugs | 7 | Two full games and two tutorials ran with 0 errors and 0 stuck states. Two display bugs: the city count mismatch, and the Belfry option shown as "Taken". |
| | **Total** | **6.5 FAIL** | Rows 4, 5 and 7 are below 7. |

### First-review findings
| Finding | Status | Evidence (screenshot) |
|---|---|---|
| Belfry "Repeat a place?" header cut, board greyed, no line saying what to tap | Partly fixed. The prompt now reads "Belfry token: repeat a place, or skip." and the button says "Skip: repeat nothing". But the prompt is unreadable (yellow on cream), and of the 2 legal places only one is lit. The other (Twig Heap) shows grey "Taken", yet tapping it does repeat it. | games-src/reviews/R4-shots/hb-belfry-390.jpg, games-src/reviews/R4-shots/hb-belfry2-390.jpg |
| Autumn discard header cut ("Tap cards to discard, ...") | Partly fixed. The whole text "Tap cards to discard, then tap Done." now wraps onto 2 lines, but it is pale yellow on cream and very hard to read. There is no count of cards chosen and no preview of what you gain. | games-src/reviews/R4-shots/hb-discard-390.jpg |
| Goals show "Goal · ? points"; names cut | Partly fixed. The points are now real ("2 per berry, up to 6", "3 per critter tucked"). Names are still cut at both sizes ("Harvest Gatherin", "Wayfarer Fair", "Wanderer Moot"). Special events do not show which 2 cards they need until you tap them. | games-src/reviews/R4-shots/hb-goals-390.jpg, games-src/reviews/R4-shots/hb-goals-375.jpg |
| "Pick a resource" icon-only buttons | Fixed. Four 44 px buttons with words: "Take 1 twig / resin / pebble / berry". | games-src/reviews/R4-shots/hb-pick-375.jpg |
| Card names cut in city and hand at 375 | Not fixed. City: "Brambl Allotme", "Goodma Vole", "Goodwi Vole". Hand: "2 berrie", "1 pebbl", and "Slate Schoolmarm" shrunk to about 11 px. At 390 the city also cuts "Spyglass Perch" and "Footsore Drifter". | games-src/reviews/R4-shots/hb-city-375.jpg, games-src/reviews/R4-shots/hb-mid-375.jpg, games-src/reviews/R4-shots/hb-city-390.jpg |
| Floating "+1 points" overlaps the score bar | Partly fixed. There is now a clean "+2" card pill on the place. The "+1 point" pill still floats over the Meadow/City tab labels. | games-src/reviews/R4-shots/hb-flyup-390.jpg |
| Goals tab grey text on grey, ~13 px | Partly fixed. The text is darker and readable, but still small and cut. | games-src/reviews/R4-shots/hb-goals-390.jpg |
| Board places are identical discs with text labels | Not fixed (known). The places have no names on the board, though the tutorial says "Tap Twig Heap". The worker that lands is drawn as "Taken" plus a tiny meeple. | games-src/reviews/R4-shots/hb-turn1-390.jpg, games-src/reviews/R4-shots/hb-landing-390.jpg |
| Result screen shows only two totals | Fixed. There is a breakdown table with the winner first: cards, purple bonuses, tokens, goals, journey, total. | games-src/reviews/R4-shots/hb-result-390.jpg, games-src/reviews/R4-shots/hb-result-375.jpg |
| Normal AI maybe too easy | Fixed / OK. A player following the lightbulb lost 46-50 at 390 and won 32-25 at 375. | games-src/reviews/R4-shots/hb-result-390.jpg |
| Tutorial good (27 steps) | Still good. 27/27 at both sizes, 0 errors. Small issues: Next is 38 px tall, and fast taps are ignored. | games-src/reviews/R4-shots/hb-tut-375-14.jpg, games-src/reviews/R4-shots/hb-tut-end-390.jpg |
| First screen clear | Still clear. | games-src/reviews/R4-shots/hb-first-390.jpg, games-src/reviews/R4-shots/hb-open-390.jpg |

### New findings
| Row | What I did | What happened | Screenshot |
|---|---|---|---|
| 4 | Started my first turn and read the top line | "Place a worker" is #ffd77a text on a cream bar (rgb 243,227,196 under a cream overlay), about 1.2:1 contrast. Every prompt ("Tap a meadow card to take it.", "Tap cards to discard, then tap Done.", "Pick the resource you want to gain.") is close to invisible at both sizes. | games-src/reviews/R4-shots/hb-turn1-390.jpg, games-src/reviews/R4-shots/hb-turn1-375.jpg, games-src/reviews/R4-shots/hb-mid-390.jpg |
| 4 | Prepared with a Belfry and workers on Gossip Glade and Twig Heap | Only Gossip Glade glows. Twig Heap is grey with "Taken", but tapping it repeats it (twigs went from 3 to 6). A legal choice looks disabled. | games-src/reviews/R4-shots/hb-belfry-390.jpg, games-src/reviews/R4-shots/hb-belfry2-390.jpg |
| 8 | Played Footsore Drifter (no city space), and a Goodwife onto a Goodman | The header says "4/15 city" and "2/15 city", but the City tab says "5 of 15" and "3 of 15". The two counts disagree. | games-src/reviews/R4-shots/hb-city-390.jpg, games-src/reviews/R4-shots/hb-city-375.jpg |
| 2 | Tapped Next or the ringed target about 0.8 s after a tutorial step appeared | Nothing happened, with no feedback. It worked after about 1.5 s. Twice the "Your turn" step needed two Next taps. | games-src/reviews/R4-shots/hb-tut-375-14.jpg |
| 2 | Opened the tutorial | It starts with 3 cards already in your city and 6 points you never earned. "Your city holds 4 of 15" after your first build is confusing. Unique vs common cards is never taught. | games-src/reviews/R4-shots/hb-tut-375-22.jpg |
| 5 | Tutorial at 375x667 | The Prepare button squeezes "Prepare after 4 more workers" into 3-4 lines. The coach bubble covers the hand. The rival box reads "done · 0/15 cit". | games-src/reviews/R4-shots/hb-tut-375-22.jpg |
| 5 | Board at 375x667 | The top row of places is clipped at the panel edge (the "shared" tags are cut off). The Haven tile has no "shared" tag, although it is shared. | games-src/reviews/R4-shots/hb-pick-375.jpg |
| 7 | Placed workers | The worker does not sit on the place. The tile turns grey "Taken" and a meeple about 15 px tall stands beside it, so it is hard to see where your workers are. | games-src/reviews/R4-shots/hb-landing-390.jpg |
| 4 | Discarded for the Ballad Finch, the Journey and the Haven | The chosen cards just leave the hand. There is no counter ("2 chosen, +1 resource") before "Done discarding". | games-src/reviews/R4-shots/hb-discard-390.jpg |

---

## rampart-and-vine (branch shelf/W487-rampart-clean @ 5e58fd48): 6.9 FAIL
Built with games-src/carc/game/src/build.py (three r158 installed locally) and served next to games/rampart-and-vine/media. Played on Chromium phone contexts with touch taps and CDP touch drags only: the tutorial to the end, two full games vs the default rival (Easy, Cobalt) to the result screen at 390x844, and the title, opening and 4 turns at 375x667. The 71 rule logic tests pass.

| # | Row | Score | Why (one line) |
|---|---|---|---|
| 1 | Rules fidelity | 8 | Matches the published rules: edge matching, one follower on the new tile, no follower on a claimed feature, roads 1, towns 2 + banners, priory 9, farmers 3 per finished town, end scoring. 71/71 logic tests pass. |
| 2 | Tutorial teaches | 7 | Covers every core rule, now with 5 Next bubbles. Still 24 steps. Rule steps wait for a tap on the lit tile, but the text never says "tap". Majority and ties are told, not shown. |
| 3 | First 10 seconds | 7 | Clear title, Easy is the default, "Turn, then place on a glow" plus glowing squares. |
| 4 | Turn clarity | 6 | Nothing says what the rival did. The result screen shows only totals, with no roads/towns/priories/farms breakdown. In the tutorial the status says "Your turn" during Hob's step. |
| 5 | Phone play | 6 | Chips are 44px and names are full now. The tile counter and follower counts are still 13px. Follower spots are 48px with labels crowding the tile. The end-scoring camera shows only a corner of the board. |
| 6 | AI and pacing | 6 | Easy Cobalt beat a casual new player 54-16 and 59-35. Turns are brisk (rival about 3 s) and a game is a sensible length. A first-timer still is unlikely to win. |
| 7 | Feel | 7 | Dragging the tile snaps with a preview, meeples stand on painted tiles, and points pop at scoring. The rival's turn goes by with nothing to follow. End counting takes about 8 s over an off-centre board. |
| 8 | Bugs | 8 | 0 page errors and 0 console errors. Tutorial and 2 full games reached the end with no stuck state or dead tap. One copy slip: "Tap Next." shows over a "Finish" button. |
| | **Total** | **6.9 FAIL** | Rows 4, 5 and 6 are below 7. No stopper. |

### First-review findings
| Finding | Status | Evidence (screenshot) |
|---|---|---|
| Row 5: score chips cut off at 375 ("Cob...") | Fixed. "You 0" and "Cobalt 0" show in full. | games-src/reviews/R4-shots/rv-s-t1.jpg |
| Row 5: tile counter 13px | Not fixed. Tile counter and follower counts measure 13px. | games-src/reviews/R4-shots/rv-g-t20.jpg |
| Row 5: title chips 40px tall | Fixed. All chips measure 44px at 390 and 375. | games-src/reviews/R4-shots/rv-01-title.jpg, games-src/reviews/R4-shots/rv-s-title.jpg |
| Row 6: default rival too strong (86-23) | Partly fixed. Easy is the default now, but it still won 54-16 and 59-35 against casual play. | games-src/reviews/R4-shots/rv-h-result.jpg |
| Row 4/7: placing takes tap, "Tap again", "Place here" | Partly fixed. Tap a glow, then "Place here". The text is clearer. Dragging the tile places it in one move. Following a follower tap there is no extra confirm. | games-src/reviews/R4-shots/rv-m-sel.jpg, games-src/reviews/R4-shots/rv-drag-mid.jpg |
| Row 4/7: rival turns fast, little to follow | Not fixed. The status only says "Watch their tile go down." No caption says what Cobalt laid, claimed or scored. | games-src/reviews/R4-shots/rv-s-fig3.jpg |
| Row 2: 24 steps, about 8 Next bubbles | Partly fixed. Next bubbles are down to 5 (goal, no fit, priory scored, final, winner). Still 24 steps. Rule steps need a tap on the lit tile, which only a finger ring shows. | games-src/reviews/R4-shots/rv-tut-computer.jpg, games-src/reviews/R4-shots/rv-tut-endtut.jpg |
| Fixer claim: follower spots always visible and tappable | Partly. They show in play. In the tutorial the bubble covers the second spot. | games-src/reviews/R4-shots/rv-m-fig.jpg, games-src/reviews/R4-shots/rv-tut-wrongtap.jpg |
| Fixer claim: points fly on phone, followers hop home, tile thud | Partly verified. Score pops show at scoring and end counting. I could not see a hop home in frame grabs, and I could not hear the thud. | games-src/reviews/R4-shots/rv-h-end1.jpg |

### New findings
| Row | What I did | What happened | Screenshot |
|---|---|---|---|
| 4 | Finished a full game | The result card shows "You 35, Cobalt 59" only. No breakdown, so a new player can't tell why they lost. | games-src/reviews/R4-shots/rv-h-result.jpg |
| 5/7 | Waited at game end | "Counting the points..." for about 8 s. The camera is off-centre, "+6 priory" floats over bare wood, and a label is cut under the status bar. | games-src/reviews/R4-shots/rv-g-result.jpg |
| 2 | Tutorial step "Hob takes a turn" | The bubble has no instruction. You must tap Hob's lit tile to go on; taps on other tiles do nothing. The status bar says "Your turn" at the same time, and a "Hob +2" tag sits on an empty glow. | games-src/reviews/R4-shots/rv-tut-computer.jpg |
| 2 | Tutorial steps "Most followers" and "Ties" | The rule is only told. The board shows no example of two followers sharing a road or town. | games-src/reviews/R4-shots/rv-tut-final.jpg |
| 8 | Last tutorial step, tapped the board | The nudge text says "Tap Next." but the button says "Finish". | games-src/reviews/R4-shots/rv-tut-winner.jpg |
| 5 | Claiming a follower | Spots are 48px, and "road +2 when finished" or "field" labels overlap the tile and each other. One field label is half hidden by a meeple. | games-src/reviews/R4-shots/rv-tut-fig_road.jpg, games-src/reviews/R4-shots/rv-tut-fig_farmer.jpg |
| 6 | Two full games, sensible claims, random-ish tile spots | Easy Cobalt won both, by 38 and 24. The rival takes about 3 s a turn, and the bot game ran about 4 min. | games-src/reviews/R4-shots/rv-h-t8.jpg |
| 7 | Dragged the hand tile onto a glow with a touch drag | It follows the finger and snaps into place. This is the best moment in the game. | games-src/reviews/R4-shots/rv-drag-mid.jpg |

---

## final-approach (branch shelf/W506-final-approach-gameplay @ cb8cb025): 4.0 FAIL
Built with games-src/final-approach/game/build.py and served next to games/final-approach/media. Played by touch only (Playwright, isMobile+hasTouch): 2 tutorials (390x844 and 375x667) and 13 full Quick games to the result screen (7 at 390x844, 6 at 375x667), each following the game's own advice.
| # | Row | Score | Why (one line) |
|---|-----|-------|----------------|
| 1 | Rules fidelity | 5 | Speed equal to the brakes now lands and no brakes never lands, in engine and UI. But the landing is judged at the end of the round, so a brake set after the engines still counts. The published rule checks speed against brakes when the engine dice go down. The tutorial teaches the wrong version. |
| 2 | Tutorial teaches | 6 | 27 one-tap steps (about 60 s) cover every core rule, then lead to a real game. Step 26 says "Brake 6 makes speed 4 safe" after the engines, but speed 4 was already safe with brakes 4. |
| 3 | First 10 seconds | 6 | Title and "New here?" offer are clear. The Goal card is still the same 4-bullet text block, plus weather icons, over the board before the first tap. |
| 4 | Turn clarity | 6 | Reroll is now a small side button, and a "What should I do?" button and a teammate plan line were added. But the advice gives nothing 2-6 times a game (whenever the best move needs coffee). Once it pointed at Coffee and left my Axis empty. |
| 5 | Phone play | 6 | Slot labels are now 15 px and the hidden-dice tray is a 137x58 target. The checklist chips still clip at 375 in the last round ("Flaps 4/"). The prompt and plan lines cut off with "..." at both sizes. |
| 6 | AI and pacing | 7 | I won 9 of 13 by following the advice (6/7 at 390, 3/6 at 375). A game takes about 2 minutes. The teammate is brisk and only blunders once the game is already lost. |
| 7 | Feel | 7 | Painted cockpit, dice fly to their spaces, "Ravi used X" banners, distinct landed and crashed scenes. |
| 8 | Bugs | 7 | 0 console or page errors, 0 stuck states and 0 dead taps caused by the game, over 13 games and 2 tutorials. The tutorial text contradicts the rule, and a stale screen-reader label says "must be below this". |
| **Total** | | **4.0** | Capped: rule broken (brakes set after the engine dice still count for the landing; the published rule judges at engine placement, and the tutorial teaches it). Raw average 6.3. |

### First-review findings
| Finding | Status | Evidence (screenshot) |
|---|---|---|
| Speed equal to the last brake crashed (rule stopper) | Fixed. engine.js `slowOk` is `brakeVal >= 2 && s <= brakeVal`. The UI chip, cap, good and caption all use `<=`. Engine probe: 6/6, 4/4 and 2/2 land, 7/6 crashes, no brakes never lands. In play: "Landing speed 6 against brakes 6", LANDED. | games-src/reviews/R4-shots/fa-375-landed-speed6-brakes6.jpg |
| Teammate and advice lose most games | Fixed. Won 9 of 13 following the advice (earlier 1 of 5). | games-src/reviews/R4-shots/fa-390-landed.jpg, games-src/reviews/R4-shots/fa-375-loss-speed7.jpg |
| Checklist chip row clipped | Partly fixed. Fits at 390 and in early rounds at 375. Clips again at 375 in the final round once "Speed ≤6" shows ("Flaps 4/"). | games-src/reviews/R4-shots/fa-375-final-chips-clipped.jpg |
| About 12 px painted panel labels | Fixed. Slot labels measure 15 px, checklist chips 14 px, prompt 17 px. | games-src/reviews/R4-shots/fa-375-first-turn-labels.jpg |
| 27x27 hidden partner dice | Fixed. The dice are still 28 px, but the whole tray is a 137x58 tap target that explains them. Its line is cut off at 375 ("Wa..."). | games-src/reviews/R4-shots/fa-375-hidden-tray-tap.jpg |
| Stale "Sets the brakes to 6." tooltip after the tutorial | Fixed. Not seen when going from the tutorial into a real game at 375. | games-src/reviews/R4-shots/fa-goal-card-375.jpg |
| Reroll was the primary bar | Fixed. The bar now holds a small "Reroll token: 1" button and "What should I do?". | games-src/reviews/R4-shots/fa-first-turn-bar.jpg |
| No briefing or teammate plan | Partly fixed. Each round has a plan line ("Ravi: Move one space, then clear the traffic"). It is cut off at 390, the player can't answer with a plan, and in the last round it still says "brakes soon" after brakes 6 are set. | games-src/reviews/R4-shots/fa-390-brief-plan-line-cut.jpg |
| Goal card is a text wall | Not fixed. Same 4 bullets plus weather line before the first tap. | games-src/reviews/R4-shots/fa-goal-card-375.jpg |

### New findings
| Row | What I did | What happened | Screenshot |
|---|---|---|---|
| 1 / 2 | Checked the landing timing against the published rulebook, then did tutorial step 26 by touch. | The published rule compares speed with the brakes when the second engine die is placed: "your speed is less than your brakes when you placed your engine dice". This game judges at the end of the round, so a brake placed after the engines still saves the landing (engine.js line 237 comment, RULES-CHECKLIST 163-164). The tutorial teaches this: "Brake 6 makes speed 4 safe. Last die, then we land." It comes after the engines, while brakes 4 already made speed 4 safe by the game's own rule. The Rules sheet doesn't list this as a house rule. | games-src/reviews/R4-shots/fa-tut-brake6-after-engines.jpg |
| 4 / 6 | Final round at 375, followed the advice (green outline) for my last two dice. | The advice put a 5 and then a 6 on Coffee and left my Axis empty. The game warned "Axis still empty. Tap again." A second tap lost at once: "Missing: the Pilot's axis die". The game was already lost (flaps 3/4), but the advice led to a confusing ending. | games-src/reviews/R4-shots/fa-375-hint-leaves-axis-empty.jpg |
| 4 | Asked for advice on every turn of 13 games. | In 2-6 turns per game the advice gives nothing (hlpPlan returns null and the "What should I do?" button is gone), always when the best move needs coffee. That's the moment a newcomer needs help most. | games-src/reviews/R4-shots/fa-375-first-turn-labels.jpg |
| 5 | Read the status line at both sizes. | Long lines are cut off with "...": the teammate plan at 390 ("clear the traf...") and the hidden-tray explanation at 375 ("Wa..."). | games-src/reviews/R4-shots/fa-390-brief-plan-line-cut.jpg |
| 1 | Read the in-game Rules sheet. | It covers axis, engines, radio, gear, flaps, brakes, coffee, reroll, all losses and the last round, with "no more than the brakes" wording. Missing: the brake timing above, that a die of 1 on the radio hits your own space, and that coffee can't push a die past 1 or 6. "A die that fits nowhere is thrown away" is listed as a house rule. | games-src/reviews/R4-shots/fa-tut-coffee.jpg |
| 2 (positive) | Tutorial by touch at 390 and 375. | Every step is one line and one tap, 0 errors, and it ends with "Play a real game". | games-src/reviews/R4-shots/fa-tut-end.jpg |
