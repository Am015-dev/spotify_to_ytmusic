# R20 strict gameplay re-review (12 Nov 2026)

Rubric: games-src/reviews/GAMEPLAY-RUBRIC.md. Each game built from its own branch, served next to its media folder, played by Playwright touch (hasTouch, isMobile, page.touchscreen.tap) at 390x844 and 375x667. Reviewer did not edit game code. Rulebook notes kept local only.

## 1. sands-of-qamar (branch shelf/W497-sands-gameplay @ 8ff4e8d3): 6.6 FAIL

Build: `npm i three` in games-src, then `build-all.py sands-of-qamar` PASS; the staged page served next to games/sands-of-qamar/{media,models,music}. Played by touch only (Playwright isMobile/hasTouch, page.touchscreen.tap, elementFromPoint checked on every target, a state diff within 1.5 s after every tap counts as "responded"). Guided game from the title "New here? Learn by playing" to "Play a real game" at 390x844 (41 steps, 53 taps, 72 s at bot speed with a 0.7 s read pause per step) and 375x667 (41 steps, 53 taps, 94 s). 0 errors. Then 23 full 2-player games from the title ("Play vs computer", default settings: rival easy, Hints off) through the Goal card to the result screen, all by touch:
- 7 games taking the hint move half the time, otherwise a random glowing target or chooser button (4 at 390, 3 at 375);
- 4 games like that but always picking the chooser's lit "best" option (2 at 390, 2 at 375);
- 6 games using only what glows, no hint at all (Hints are off by default, so this is the real new player);
- 2 games always taking the hint move (control).
0 page errors, 0 console errors, 0 stuck states, 0 dead taps in all runs. Rules re-checked against the published rulebook text online (notes kept locally only).

| # | Row | Score | Why |
|---|-----|-------|-----|
| 1 | Rules fidelity | 8 | Checked again against the rulebook: 3 free bid spots with the later 0-bidder first, Hamlet (village) palace and Oasis palm compulsory, Stall 3 coins / Bazaar 6 coins optional, Shrine 2 Sages or 1 Sage + 1 Mystic, sale table 1/3/7/13/21/30/40/50/60, Shadow reach 1 tile per Shadow plus 1 per Mystic, Shadows can take a rival's Advisor or Sage, Advisors 1 + 10 per rival with fewer, last camel ends the round. One small gap: when a player has no legal walk the engine logs "has no legal move and passes" but does not end the game, which the rulebook does (never happened in 23 games). |
| 2 | Tutorial teaches | 7 | Fixed: step 30 now says "Tap Farid's glowing box." and only Farid's box glows (1 glow, 1 highlight) at both sizes. One bubble per step, every target 43-44 px or bigger, every step took the first tap. Still long (41 steps, 53 taps), several lines pack two rules ("Advisors: 1 each, +10 per rival with fewer. Oasis: palm, 3 points."), and the Mystic that buys extra Shadow reach is never done. |
| 3 | First 10 seconds | 7 | Unchanged: one big "New here? Learn by playing" button; Play vs computer opens a 4-line Goal card, then "Tap a glowing spot to bid". The board is still a wall of 30 busy painted tiles. |
| 4 | Turn clarity | 6 | Fixed: score pops now carry words ("+4 You keep 2 Sages", "+13 You keep 3 Advisors"); 0 of 200+ pops had the label hidden. New problems: "−1 You loses points", "−8 You loses points", "+2 You gains 2 coins" (broken grammar, and the minus pops never say why); the rival's pops ("+3 Teal's Traders bring 2 cards") land during your own turn over the tab bar, and "Teal −5 pts" covers Teal's seat chip. "Sensible" bids include 8 and 12 coins on round 1 (anything up to a quarter of your coins glows), so glow does not mean "good". Hints stay off by default. |
| 5 | Phone play | 6 | Good: 0 visible text under 14 px at any tutorial step, buttons 44 px+, no sideways scroll, no feed ribbon cut at the edge (0 in 23 games). Weak: the meeple figures are still 11x13 px at 375 (13x15 at 390); some glowing tiles are only 36-38 px tall at 375 (Hamlet, Stall, Shrine, Oasis); the bid row sits 8 px above the bottom edge (bottom 659 of 667, 836 of 844); score pops cover the seat chip and the tab bar. |
| 6 | AI and pacing | 5 | Waits are brisk (average 2.7-3.9 s, max 9.5 s), games 2-3 min. But the default rival is NOT beatable for a new player. Hint half the time: won 1 of 7 (lost by 39, 70, 103, 35, 16, 27; won 183-173). Hint half the time and always the chooser's lit "best": won 0 of 4 (lost by 36, 14, 16, 20). Only what glows (the real default, Hints off): won 1 of 6, losing by 124, 83, 74, 119 with a random chooser pick and by 111 / won 149-124 with the lit "best" pick. Always the hint move: won 2 of 2 (195-130, 180-160). The fixer's "5/12" was not reproduced, and this is worse than R10. |
| 7 | Feel | 6 | Meeples drop tile by tile, labelled pops fly, painted result card. But pops pile up and collide with the HUD, the rival's pops arrive late during your turn, and the board still reads as a grid of cards. |
| 8 | Bugs | 8 | 23 games and 2 tutorials: 0 errors, 0 stuck states, 0 dead taps (every tap changed the state within 1.5 s). "Onyx wins" is gone. Only text bugs ("You loses", "You gains"). |
| | **Total** | **6.6** | **FAIL** (rows 4, 5, 6 and 7 below 7; no stopper) |

### Earlier findings (R10)
- Row 2/8, step 30 Shadows: no "Tap Farid", 16 tiles glow, tile tap opens a chooser the step refuses: **fixed**. "One tile per Shadow, or a rival's Advisor. Tap Farid's glowing box." with 1 glow at both sizes. Shots: games-src/reviews/R20-shots/sands-tut-30-shadows-390.jpg, games-src/reviews/R20-shots/sands-tut-30-shadows-375.jpg
- Row 4/7, score pop shows only "— +6" (label hidden by CSS): **fixed** for the label (0 hidden in all games: "+4 You keep 2 Sages"), but see the new grammar and overlap findings. Shot: games-src/reviews/R20-shots/sands-g1-t72-390.jpg
- Row 6, new player cannot win on default (0 of 5 at 50-75 % hints): **not fixed**. 1 of 7 at 50 % hints, 0 of 4 at 50 % hints with the lit "best" chooser option, 1 of 6 with glow only. Shots: games-src/reviews/R20-shots/sands-g1-result-390.jpg, games-src/reviews/R20-shots/sands-h3-result-390.jpg, games-src/reviews/R20-shots/sands-r4-result-375.jpg
- Row 5, "You +6 pts" feed ribbon cut at the left edge at 375: **fixed** (0 ribbons or pops past either edge in 23 games). Shot: games-src/reviews/R20-shots/sands-bid-375.jpg
- Row 4, Shadow chooser "+1🔮" icons with no words: **not re-seen** in the tutorial (the step now targets Farid's box directly, no chooser). The chooser now lights one option with a "best" tag.
- Row 8, "Onyx wins" under a "You win!" card: **fixed** ("You win with 183 points."). Shot: games-src/reviews/R20-shots/sands-h6-result-375.jpg
- Row 5, meeple figures 11x13 px at 375: **not fixed** (11x13 at 375, 13x15 at 390). Shot: games-src/reviews/R20-shots/sands-tut-5-lift-375.jpg
- Row 8, ~1 % taps on a glowing tile with no response: **fixed** (0 of ~3,000 taps).
- Row 3, clear title and bid start: **still true**. Shots: games-src/reviews/R20-shots/sands-title-390.jpg, games-src/reviews/R20-shots/sands-goal-375.jpg

### New findings
- Row 6 — did: 7 full games at 390 and 375 from the title, hint move half the time, random glowing target otherwise — happened: won 1 of 7; lost 141-180, 105-175, 96-199, 128-163, 151-167, 122-149 — shots: games-src/reviews/R20-shots/sands-g1-result-390.jpg, games-src/reviews/R20-shots/sands-h3-result-390.jpg
- Row 6 — did: 6 full games tapping only glowing things (Hints are off by default) — happened: won 1 of 6 (149-124 at 375); lost 73-197, 112-195, 70-144, 89-208, 80-191. In all, a new player who does not always follow the hint won 2 of 17 games, worse than R10 — shot: games-src/reviews/R20-shots/sands-r4-result-375.jpg
- Row 4 / Row 6 — did: first bid of a real game with 50 coins at 375 and 390 — happened: 12 and 8 coin spots glow as "sensible" next to Free and 1 coin; a newcomer who taps any glow overpays early — shot: games-src/reviews/R20-shots/sands-bid-375.jpg
- Row 4 — did: bid and walked in real games — happened: pops read "−1 You loses points", "−8 You loses points", "+2 You gains 2 coins (Khanjar)"; the minus pops never say what cost the points — shot: games-src/reviews/R20-shots/sands-g1-t44-390.jpg
- Row 5 / Row 7 — did: watched the board during my turn at 390 and the bid at 375 — happened: "+3 Teal's Traders bring 2 cards: Silk, Gold" lands on the tab bar during my Sell step; "Teal −5 pts" sits on Teal's seat chip and hides the name and coins — shots: games-src/reviews/R20-shots/sands-g1-t72-390.jpg, games-src/reviews/R20-shots/sands-bid-375.jpg
- Row 5 — did: measured every glowing target during walks at 375 — happened: some glowing tiles are 36-38 px tall (Hamlet, Stall, Shrine, Oasis), under the 44 px bar — shot: games-src/reviews/R20-shots/sands-tut-5-lift-375.jpg
- Row 1 (minor) — did: read the engine's turn start against the rulebook — happened: "has no legal move and passes" does not end the game as the rulebook says (not seen in play).
- Row 2 (works) — did: the whole guided game at both sizes — happened: one bubble, one highlighted target per step, 3-page count ending on "Play a real game" — shots: games-src/reviews/R20-shots/sands-tut-count-3-375.jpg, games-src/reviews/R20-shots/sands-tut-39-summon-390.jpg

---

## 2. tidewake (branch shelf/W498-tidewake-gameplay @ 7a6ea6ba, fix 2546246c): 7.3 FAIL

How I tested: built with games-src/scripts/build-all.py tidewake (PASS) and served the staged page next to games/tidewake/{media,models,music}. I used Playwright touch only (hasTouch, isMobile, page.touchscreen.tap at element centres, with an elementFromPoint check before each tap). I played the tutorial from the title button to the end card at 390x844 (30 steps, 35 taps, 73 s) and at 375x667 (30 steps, 35 taps, 78 s), with 0 dead taps and 0 errors. Then I played 34 Quick games (you vs 2 computers, default settings) from the title to the result screen, 18 at 390x844 and 16 at 375x667. Every game started with 6 leviathans, so the rulebook start is now the default. Four ways of playing, to see whether choices matter:
- **star**: always take the ★ tile (or "Use ★"). 15 games.
- **other**: a legal ✓/! tile that is not the ★. 13 games.
- **first**: the first ✓ tile. 3 games.
- **random**: a random tile and turn. 3 games.

Start marks were half "Safe start for me" and half a random gold mark. Across 34 games I saw 0 page errors, 0 console errors, 0 stuck states and 0 dead taps. Rules were re-checked against a rulebook summary online (notes kept locally only).

| # | Row | Score | Why (one line) |
|---|-----|-------|----------------|
| 1 | Rules fidelity | 8 | Fixed: the default start now has the rulebook's 6 leviathans for 3 players. "Calm sea start" is an unticked variant labelled "Not the rulebook start". The rest matches: roll first, 6/7/8 wakes them, a 6 on a leviathan's die raises a new one, at least 3 stay on the chart, placement bans unless forced, the blocked-start move to another mark, the swap with sunk crews' hands, last junk wins. |
| 2 | Tutorial teaches | 7 | Unchanged: 30 one-line steps, one tap each, base rules only, ending on "Play a real game". The danger case (step 22) and a rival sinking (step 28) are shown. The elimination swap is still one spoken line (step 29) with no swap shown. |
| 3 | First 10 seconds | 8 | The title shows the goal in 4 short lines, "New here? Learn in 5 minutes" comes first, and "Safe start for me" places the first junk. |
| 4 | Turn clarity | 7 | New and useful: a ★ on the best tile and a line under the tiles ("⚠ 27% chance a leviathan gets you before your next turn. ★ Best: tile 1 (7%). Use ★"). But the ★ often wins by nothing ("This way: 7%… ★ Best: tile 2 (7%)") while all three tiles show ✓. Once the line said "safe until your next turn" and a leviathan sank me on the next roll. After you sink, the button still reads "Skip to my turn". The blocked-start rescue lists every mark twice. |
| 5 | Phone play | 7 | Taps land at both sizes, tiles are about 70 px, and the result card fits at 375. Start marks are still about 16 px dots spaced 16 px apart, but tapping one opens a list of big "Top 1, left mark" buttons, so no dead tap. The blocked-start rescue list runs past the bottom of the 390x844 screen, and "Accept your fate" sits below the fold. |
| 6 | AI and pacing | 6 | Choices now matter: the ★ player won 7 of 15 (47%, fair share 33%) and other play won 4 of 19 (21%). But with 6 leviathans, early knock-outs got worse: in 6 of 34 games I was out after 1-2 decisions (one in 40 s while following the ★ at "7%"). Most games gave me only 1-14 decisions in 35-241 s, and I waited a median 8-17 s for rivals between my turns. |
| 7 | Feel | 7 | Unchanged: painted chart, gliding junks, leviathans moving with arrows, a path preview and red sink marks. The "Sunk!" card says why ("the leviathan Tidegrave swam onto it"). |
| 8 | Bugs | 8 | 2 tutorials and 34 games: 0 errors, 0 stuck, 0 dead taps. "(you) (you)" is gone (0 log lines in 34 games). Only wording slips (see findings). |
| | **Total** | **7.3** | **FAIL** (row 6 under 7; no stopper) |

### Earlier findings (R14, R5, G7)
| Finding | Status | Evidence |
|---|---|---|
| G7 stopper: dead Continue in tutorial waits | Fixed (still). Both tutorials ran 35 taps with 0 dead taps. | games-src/reviews/R20-shots/tide-390-tut-end.jpg, games-src/reviews/R20-shots/tide-375-tut-end.jpg |
| R14 row 1: default "Calm sea start" begins with 3 leviathans, not 6 | **Fixed.** All 34 Quick games started with 6 leviathans. Calm sea is an unticked variant. | games-src/reviews/R20-shots/tide-390-star-start.jpg |
| R14/R5 row 6: games short and decided by luck, knock-outs with no saving choice | **Half fixed.** Choices matter now (★ 47% vs other 21%). Early knock-outs are worse with 6 leviathans: 6 of 34 games ended for me after 1-2 decisions, one while following the ★. | games-src/reviews/R20-shots/tide-390-star-g4-sunk.jpg, games-src/reviews/R20-shots/tide-390-other-g1-sunk.jpg |
| R14 row 4: log "Vermilion (you) (you)" | **Fixed.** 0 duplicated lines in 34 games' logs; the feed reads "Vermilion (you) rolls 1+6=7." | games-src/reviews/R20-shots/tide-390-star-g5-sunk.jpg |
| R14/R5 row 2: elimination swap is one line, no card | **Not fixed.** Step 29 still says "Sink rivals with your tile, and swap tiles with their hands." with nothing shown. | games-src/reviews/R20-shots/tide-390-tut-29.jpg |
| R5 row 4: empty "Sunken crews' tiles" heading | Not checked: no game had me sink a rival with my own tile and get the swap question. | none |
| R5/R14 row 5: start marks about 15-16 px | **Not fixed** (about 16 px, 16 px apart). Tapping one opens a chooser of big buttons, and "Safe start for me" is there. | games-src/reviews/R20-shots/tide-390-star-start.jpg |
| R5 row 5: result stats line hidden at 375 | Fixed (still): "33 turns, 1 junk afloat, 42 leviathan moves." | games-src/reviews/R20-shots/tide-375-star-g1-result.jpg |

### New findings
| Row | What I did | What happened | Screenshot |
|---|---|---|---|
| 6 | Quick game at 390, took the ★ tile ("★ Best move: 7% chance…"). | A leviathan swam to my bow on Jade's 8 roll. I was sunk on turn 4 after one decision, 26 s in. Following the advice gave no way to save the junk. | games-src/reviews/R20-shots/tide-390-star-g4-sunk.jpg |
| 6 | 34 games across four ways of playing. | ★ every turn: 7 of 15 won (2/7 at 390, 5/8 at 375). Other legal tiles: 4 of 19 won. Out after 1-2 placements in 6 of 34 games. Games lasted 35-241 s with 1-14 of my placements. The median wait between my turns was 8-17 s (max 22 s). | games-src/reviews/R20-shots/tide-390-other-g1-sunk.jpg |
| 6 | Won a game at 375 following the ★. | 10 leviathans on the chart by turn 5; both rivals sank and I won after 2 placements in 35 s. Wins are as sudden as losses. | games-src/reviews/R20-shots/tide-375-star-g4-result.jpg |
| 4 | Tapped tiles at 375 to compare. | All three tiles show ✓. The line says "This way: 7% chance…" and "★ Best: tile 2 (7%). Use ★": the ★ is chosen by a hidden tie-break that the player cannot see or use. | games-src/reviews/R20-shots/tide-375-other-g4-line1.jpg |
| 4 | At 390 I took the ★ ("★ Best move: safe until your next turn."). | On Cobalt's next roll (4+3=7) a leviathan reached me and I sank. The "safe" claim was wrong at least once (cause not confirmed; it may count only some ways a leviathan can sink you). | games-src/reviews/R20-shots/tide-390-star-g5-sunk.jpg |
| 4 | Got sunk at 390 and watched the rest. | The only button is "Skip to my turn", though I have no turns left; in other games it reads "Skip". Skip does jump to the result quickly (sunk at 30 s, result at 41 s). Without it I watched up to 2 minutes (sunk at 91 s, result at 213 s). | games-src/reviews/R20-shots/tide-390-star-g4-sunk.jpg |
| 4/5 | A leviathan blocked my first move (390). | "Quick: your junk is in danger! Vermilion (you)'s junk is about to be lost…" lists "Relocate to column 1, row 1" twice, row 3 twice, row 4 twice and row 7 twice, with no way to tell the pairs apart. The list runs off the bottom of the screen, so "Accept your fate" and the "25 s left" note are below the fold. The rule itself matches the rulebook. | games-src/reviews/R20-shots/tide-390-other-g2-swap.jpg |
| 2 | Did the tutorial at both sizes. | It is the same 30 steps as R14; the fix did not touch it. Swap step unchanged. | games-src/reviews/R20-shots/tide-390-tut-29.jpg, games-src/reviews/R20-shots/tide-390-tut-22.jpg |
| 1 (good) | Opened Quick and Custom setup. | 6 leviathans at the start; "Variant: Calm sea start (off by default). Not the rulebook start." | games-src/reviews/R20-shots/tide-390-star-start.jpg |
| 8 (good) | Read every game's log. | No "(you) (you)" anywhere; 0 errors in 34 games. | games-src/reviews/R20-shots/tide-375-star-g1-result.jpg |

---

## 3. vinegrave (branch shelf/W490-vinegrave-bench @ ae27030d): 6.8 FAIL

How I tested: built with the game's own build.py (513,827 bytes, 173 pictures) and served the page next to games/vinegrave/media. Playwright touch only (hasTouch, isMobile, page.touchscreen.tap). Before every tap I checked with elementFromPoint that the target was on top. Tutorial from the title ("Learn to play") to the end card at 390x844 (35 steps, 31 taps + 4 Next, 90 s) and at 375x667 (35 steps, 31 taps + 4 Next, 89 s), with a 1.2 s read pause per step. Every target took the first tap, 0 errors. Then 5 full 5-round games against the default rival (1 computer rival, easy, hints off) from the title (Learn to play, Skip tutorial, Play, Start the expedition) to the result screen, played as a new player. 3 games tapped a random glowing thing after playing free cards first (390 twice, 375 once). 2 games tried sites first, then the market, then anything (390 and 375). I did not tap to speed up rival turns. Results: won 21-14, lost 23-29, 10-64, 14-20 and 25-73. Games took 115-268 s and 35-45 of my actions, 74-95 taps. 0 page errors, 0 console errors, 0 stuck states, 0 covered targets. On every one of my turns I measured whether market glow matched what I could pay, text under 14 px, clipped effect lines and hand-card name cover. I watched for pills overlapping the score chips and the resource row every 120 ms, and counted explorer walkers and flying pieces. Limitation: my research-track selector did not match, so the scripted players climbed research only 0-2 rows. That explains part of the losses (see row 6). Rules re-checked against a full rulebook summary online (notes local only).

| # | Row | Score | Why |
|---|-----|------:|-----|
| 1 | Rules fidelity | 7 | Unchanged since R17 and still right where I could check: starting resources by seat (2 coins / 1 coin + 1 compass / ...), 2 starting Dread in the deck, starting cards free, items under the deck, artifacts bought work at once while one played from hand costs 1 tablet, ruins 3 / deep ruins 6 compasses plus travel, Plane for 2 coins, guardians 5 points and once-per-game boons, Dread for unbeaten guardians, assistants, temple tiles, 5 rounds, tie-break. Card values, idol slots and temple costs are still the builder's own. |
| 2 | Tutorial teaches | 7 | Same 35 steps as R17: one line and one tap each, 4 Next-only steps, every core action done by tapping, ends on "Play a real game". Still staged: the rival is "out" all the way through, goods are topped up between steps, there is a "Practice jump" for the magnifier, and Dread at round end, assistant upgrade and exile are only words. New: the step counter says "16/33" and "19/33", but there are 35 steps. |
| 3 | First 10 seconds | 7 | Clean title (Learn to play, Play, Story) and a clean goal card: "Most points after 5 rounds wins" and 3 icon lines. The first real turn says "Your turn: one main action. Starting cards are free. Tap or drag what glows." The hidden dock behind the goal card still reads "You are choosing. Tap to skip ahead." |
| 4 | Turn clarity | 7 | Fixed: only market cards you can pay glow (0 wrong glows in 5 games, about 210 turns). The others carry a "Need N more" tag (about 190 tags seen per game). Tapping a card shows a priced button ("Buy · 4 compasses", "Buy · 1 coin"); sites show Dig / Explore / Fight. "Nothing left to do. Tap Pass." appears when true. Weak: market effect lines are terse jargon ("cheap buy", "Choose one", "+3 goods", "exile twice", "research draw 1") with no words for what they mean. The research track's "A" badges are still unexplained. |
| 5 | Phone play | 6 | Fixed: no text under 14 px and no clipped effect line at either size (checked on every turn). Score pills now sit under the chips (touching by 1 px) and no longer hide the name or score. Still: at 375 the hand fans the cards so names are cut ("Creep…" twice, under the next card and the -1 badge). The rival's pills ("+1 coin +1 compass", "+1 tablet") now land on the market's top row and cover its "Need N more" tags. At 375 the result card's buttons cover your own score breakdown. Market cards are thin strips where a "Need N more" bar covers most of the art. |
| 6 | AI and pacing | 6 | Rival turns are brisk and shown on the board: median wait 0.2-2.9 s, but max 16-38 s after I passed (375: 37.8 s). As a new player I won 1 of 5 on the default "easy" rival. The rival scored 64 and 73 in two games (R17 saw at most 30). My scripted players hardly used research (0-2 rows), which a real new player might also miss, but the R17 player who did research won 3 of 3. So the default rival is very uneven: 14 to 73 points in my 5 games. |
| 7 | Feel | 6 | Better: explorers now walk the trail to the site (14-18 walks per game), goods and cards fly (90-105 flights per game), counters bump, points count up, and rival moves have a caption on the board ("Tamsin sends an explorer to Old Wreck.") with an orange ring on the site. But the screen is still mostly a grid: 6 market strips that read like spreadsheet rows ("Need 2 more", "draw 2"), a research column of numbers, and a resource row. Most turns are: tap a glowing disc or strip, read a line, tap a priced button. It moves now but still looks like a dashboard. The owner's "spreadsheet like" is only partly answered. |
| 8 | Bugs | 8 | 2 tutorials and 5 full games to the result: 0 errors, 0 stuck states, 0 dead taps on real targets, Pass works. Small: wrong step counter (x/33 for 35 steps). The rival caption can still be on the board at the start of my turn. |
| | **Total** | **6.8 FAIL** | Rows 5, 6 and 7 are below 7. (7+7+7+7+6+6+6+8 = 54 / 8 = 6.75, shown as 6.8.) |

### Earlier findings (R17, R2, G2)
| Finding | Status | Evidence |
|---|---|---|
| R17 row 4: no Buy button; buy only by a second tap | **Fixed.** Priced button "Buy · 4 compasses" / "Buy · N coins"; seen in every game. | games-src/reviews/R20-shots/vg-tut-390-g-art2.jpg |
| R17 row 4 / G2 row 4: every market card glows, even unaffordable | **Fixed.** 0 unaffordable glows over 5 games; unaffordable cards show "Need N more". | games-src/reviews/R20-shots/vg-g2-375-t15.jpg, games-src/reviews/R20-shots/vg-g5-390-overlap.jpg |
| R17 row 5 / R2 / G2: market effect lines clipped | **Fixed.** Lines wrap to 2 rows; 0 clipped lines found at 390 and 375. | games-src/reviews/R20-shots/vg-g1-390-buy1.jpg |
| R17 row 5: "+2 points" pill on the You chip hides name and score | **Fixed.** Pills sit under the chip (1 px touch at most). New problem: they cover the market's top row. | games-src/reviews/R20-shots/vg-g5-390-overlap.jpg, games-src/reviews/R20-shots/vg-g2-375-t4.jpg |
| R17 row 5: resource toasts cover the counts | **Fixed.** Goods fly into the counter and it bumps; no pill on the resource row in 5 games. | games-src/reviews/R20-shots/vg-g1-390-buy1.jpg |
| R17 row 5: hand names covered at 375 | **Not fixed.** "Creeping Dread" shows as "Creep…" under the next card and its -1 badge. | games-src/reviews/R20-shots/vg-g2-375-t15.jpg |
| R17 row 2: rival "out" for the whole tutorial, goods topped up, practice jump | **Not fixed** (tutorial unchanged). | games-src/reviews/R20-shots/vg-tut-390-g-beat.jpg |
| R17 row 6: 24 s waits after passing | **Not fixed.** Max wait 16.5 s (390), 37.8 s (375) while the rival plays on. | none (timing log) |
| R17 row 6 / G2: rival scores swing, late jump | **Worse in my games.** Rival 14, 20, 29, 64, 73. | games-src/reviews/R20-shots/vg-s3-390-result.jpg, games-src/reviews/R20-shots/vg-g2-375-result.jpg |
| R17 row 7: rival turns are a dock line | **Fixed** in part: caption on the board plus a ringed site, cards fly from the rival chip. | games-src/reviews/R20-shots/vg-g1-390-rival.jpg, games-src/reviews/R20-shots/vg-g2-375-rival.jpg |
| R17 row 3 / R2: "You are choosing. Tap to skip ahead." | **Not fixed.** Still in the dock behind the goal card (read from the page text). | games-src/reviews/R20-shots/vg-g1-390-goal.jpg |
| R17 row 4: research "A" badges unexplained | **Not fixed.** | games-src/reviews/R20-shots/vg-g1-390-t30.jpg |
| R2/G2 items fixed in R17 (Skip loop, Pass disappearing, dead tutorial taps, text size) | Still fixed. | games-src/reviews/R20-shots/vg-tut-390-end.jpg |

### New findings
| Row | What I did | What happened | Screenshot |
|---|---|---|---|
| 6 | Played 5 default games as a new player (hints off), not speeding up the rival | Won 1 (21-14), lost 4 (23-29, 10-64, 14-20, 25-73). The "easy" rival hit 64 and 73 with the temple and research. A player who misses the research track gets crushed. | games-src/reviews/R20-shots/vg-s3-390-result.jpg, games-src/reviews/R20-shots/vg-g2-375-result.jpg, games-src/reviews/R20-shots/vg-g5-390-result.jpg, games-src/reviews/R20-shots/vg-s4-375-result.jpg |
| 7 | Watched my moves and the rival's moves | Explorers walk the trail, goods and bought cards fly, points count up, and a board caption names the rival's move. Still, the market is 6 text strips ("Need 2 more / draw 2"), so most of the screen reads as rows of numbers. | games-src/reviews/R20-shots/vg-g1-390-t30.jpg |
| 5 | Rival gained goods at 375 and 390 | Its pill ("+1 coin +1 compass", "+1 tablet") drops onto the market's top row and covers "Need 1 more" and the card effect for 1.7 s. | games-src/reviews/R20-shots/vg-g2-375-t4.jpg, games-src/reviews/R20-shots/vg-g5-390-overlap.jpg |
| 4 | Read market cards in real games | The effect words are shorthand: "cheap buy", "Choose one", "+3 goods", "exile twice", "research draw 1". A new player cannot tell what they do without opening Details. | games-src/reviews/R20-shots/vg-g5-390-overlap.jpg, games-src/reviews/R20-shots/vg-g2-375-t4.jpg |
| 5 | Lost at 375x667 | The result card's Play again / See the island / Title buttons cover your own score breakdown; only "You 10 points" shows. | games-src/reviews/R20-shots/vg-g2-375-result.jpg |
| 2 / 8 | Did the tutorial at both sizes | The counter reads "16/33", "19/33", but the tutorial has 35 steps. | games-src/reviews/R20-shots/vg-tut-390-g-item.jpg |
| 8 (minor) | Started my turn right after a rival move | The rival caption ("Tamsin sends an explorer to Old Wreck.") is still on the board while the dock says "Your turn". | games-src/reviews/R20-shots/vg-g1-390-t30.jpg |
| 4 (works) | Ran out of things to afford | Dock says "Nothing left to do. Tap Pass." and the Pass button works. | games-src/reviews/R20-shots/vg-g1-390-rival.jpg |
| 3 (works) | Opened a real game | Clean goal card, one button. | games-src/reviews/R20-shots/vg-g1-390-goal.jpg |

### Rules check (against a rulebook summary online; notes kept locally only)
- Starting deck and hand: rulebook says 2 coin cards, 2 compass cards and 2 Fear, draw 5. Game: 2 Patron Letter (coin), Trail Notes (compass), 2 Creeping Dread in the first hand. Matches.
- Starting resources by seat: rulebook says 2 coins / 1 coin + 1 compass / 2 coins + 1 compass / 1 coin + 2 compasses. Game table: identical.
- Main action vs free actions: rulebook says one main action; lightning cards, idol slot, boon and assistants are free. Game: same, and starting cards are free.
- Discover: rulebook says level I and II sites cost compasses plus travel, take an idol, and a guardian may appear. Game: 3 / 6 compasses plus travel, idol 3 points, guardian on discovery.
- Plane: rulebook says it pays any travel and costs 2 coins. Game: "2 coins buy a Plane".
- Buy: rulebook says items cost coins and go under the deck; artifacts cost compasses and resolve at once without the tablet cost, but cost a tablet when played from hand. Game: same (engine charges 1 tablet when an artifact is played from hand).
- Guardians: rulebook says pay the cost with an explorer there, 5 points each, boon once per game, 1 Fear per explorer returning from an unbeaten guardian at round end. Game: same.
- Research: rulebook says notebook never above magnifier, assistants on marked rows, temple tiles 6/6/11 once in the temple, bonus tile on reaching it. Game: same structure, its own costs.
- End of round: rulebook says exile the cards by the round marker, shuffle the play area under the deck, refresh assistants, draw to 5, 5 rounds. Game: same.
- Tie-break: rulebook says first into the temple, then research. Game: same.

---

