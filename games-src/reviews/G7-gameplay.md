# G7 gameplay review (strict, 8 Nov 2026)

Phone touch play at 390x844 and 375x667 on each game's branch build (tutorial to the end, then full games to the result screen). Scored by games-src/reviews/GAMEPLAY-RUBRIC.md.

| Game | Total | Result |
|---|---|---|
| vale-of-banners | 6.6 | FAIL |
| crown-city-smash | 6.9 | FAIL |
| tidewake | 4.0 (stopper cap; 6.0 uncapped) | FAIL |

## vale-of-banners

Build: branch shelf/W505-vale-gameplay @ 505c08c3, build-all.py PASS. Played on Playwright touch (hasTouch/isMobile, touchscreen taps only):
tutorial to the end card at 390x844 and 375x667, then three full Quick games (2 players, default Normal) to the result screen
(one at 375x667, two at 390x844), playing as a new player who follows the glowing targets and the "★ Best" hint.

| # | Row | Score | Why |
|---|-----|-------|-----|
| 1 | Rules fidelity | 8 | 5 seasons x 5 rounds, 2 dice + white goods die, take/build/sell/workers, worker +-1 with 6/1 wrap, 2-silver back lane once per turn, storage 3, max 3 goods kinds, region 1-36 + season bonus, colour bonus, mine silver, end scoring and tie-break all match the published rules. Own on purpose: lore set, estate map, stalls drawn at random instead of the colour-coded stall spaces. |
| 2 | Tutorial teaches | 7 | 48 steps, one short line + one tap each, all core rules in order (dice > goal > take > build > region > ... > final > tie), ends on "Play a real game" which starts a real 5-season game. Long (about 4-5 min for a person) and a second coach bubble pops over it; crate target is tiny. |
| 3 | First 10 seconds | 7 | Title line is clear and Play is obvious, but Play leads to a setup screen and then a 4-point "Build the best estate" card plus a "Stuck?" line before the board; the prompt then says "Drag your 3 onto stall 3" when a tap is what a new player tries. |
| 4 | Turn clarity | 7 | Whose turn, dice left, prompt line, glowing legal targets, "+N" previews and the tile card ("Take to storage (die 3, 2 workers)") are good. The red worker-cost badge on market tiles is never explained on the board; the big "X's turn" banner sits over the estate. |
| 5 | Phone play | 5 | 390x844 is fine (market tiles 49x57, estate cells 55x61). At 375x667 estate cells are 34-37 px wide, stall goods crates 24x20 px, market switches to 6 cramped columns where worker badges sit on the tile names and the last column's labels touch the screen edge. |
| 6 | AI and pacing | 5 | Rival waits ~7 s per turn (170 s of waiting over 25 rival turns) unless you tap to speed up. A new player following the ★ Best hint lost all three Normal games: 70-120, 114-117, 57-128. Not shown that a new player can win on the default level. |
| 7 | Feel | 7 | Dice, tiles and workers can be dragged, tiles fly, region outlines flash, turn banner, score count-up on the result, 3D estate art. Feels like a game; AI turns are mostly waiting. |
| 8 | Bugs | 7 | 0 page errors, 0 stuck states, 0 dead taps in tutorial x2 and 3 full games. Wrong-state copy: the result says "Close one. Try again?" after a 50-point loss; in the tutorial a coach popup stacks on top of the tutorial bubble. |

Total: 6.6 — FAIL (rows 5 and 6 below 7; no stopper)

### Findings
- Row 5 — did: tutorial step "Take every crate from one stall" at 375x667 — happened: the glowing crate target is 24x20 px (38x30 at 390) — shot: games-src/reviews/G7-shots/vale-375-crates-24px.png
- Row 5 — did: built tiles on the estate at 375x667 (tutorial and full game) — happened: glowing build cells are 34-37 px wide, under 44 px — shot: games-src/reviews/G7-shots/vale-375-estate-34px.png
- Row 5 — did: opened the Market tab at 375x667 — happened: 6 narrow columns; red worker-cost badges cover tile names ("Chapel"), stall-6 labels touch the right edge — shot: games-src/reviews/G7-shots/vale-375-market-crowded.png
- Row 4 — did: my turn started at 375x667 — happened: the "Your turn" banner covers the middle of my estate while I need to read it — shot: games-src/reviews/G7-shots/vale-375-banner-over-estate.png
- Row 6 — did: played a full Normal game at 390x844 following ★ Best on every pick — happened: lost 70 to 120; result still says "Close one. Try again?" — shot: games-src/reviews/G7-shots/vale-result-close-one-50pt-loss.png
- Row 6 — did: full Normal game at 375x667 following ★ Best — happened: lost 114 to 117 (3 of 3 games lost on the default level) — shot: games-src/reviews/G7-shots/vale-375-result-3pt-loss.png
- Row 6 — did: waited through rival turns without tapping — happened: ~7 s per rival turn, about 3 of the 5 minutes of a game spent watching — shot: games-src/reviews/G7-shots/vale-ai-turn.png
- Row 2 — did: tutorial step 6 "Build next to your land" — happened: an "Old Odo" coach popup opens on top of the tutorial bubble, two bubbles at once covering the estate — shot: games-src/reviews/G7-shots/vale-tut-two-bubbles.png
- Row 2 — did: tutorial step 34 at 390x844 — happened: crate target 38x30 px, smaller than every other step's target — shot: games-src/reviews/G7-shots/vale-tut-small-crate.png
- Row 4 — did: tapped a market tile — happened: the card explains the worker cost in words ("die 3, 2 workers"), but the red badge on the board tile has no legend — shot: games-src/reviews/G7-shots/vale-tile-card-worker-cost.png

## crown-city-smash

Build: branch shelf/W500-crown-gameplay (c7917f76), built with build-all.py and served next to games/crown-city-smash/media. I played by touch only. I did the tutorial to its end card at 390x844, then three full games against 3 computer monsters on the default level: two at 390x844 (4.5 min each) and one at 375x667 (5.5 min). All three reached the result screen with 0 console errors and 0 page errors.

| # | Row | Score | Why |
|---|-----|-------|-----|
| 1 | Rules fidelity | 8 | Checked against the published rules. The core loop matches: 6 dice and 3 rolls, sets of 1s, 2s and 3s score (+1 per extra die), claws, hearts that don't heal Downtown, energy, +1 ★ for entering, +2 ★ for starting your turn Downtown, you choose to stay or yield only when hit, an empty Downtown must be filled, a second city space at 5+ players, and the game ends at 20 ★ or last monster standing. Power-card swaps cost 2 ⚡. Card effects I saw (stars lost to all, discard-for-energy) behave like the published cards. Nothing broken found. |
| 2 | Tutorial teaches | 7 | 26 steps, each one short line plus one tap on a spotlit target. It teaches the goal, keeping dice, rerolls, three of a kind, energy, entering Downtown, buying a card, permanent vs one-shot cards, rival attacks, stay, the +2 ★ start bonus, hitting everyone from Downtown, KO, Sweep, yield, healing outside, four of a kind and the win. It ends with "Play a real game". Two lessons don't carry over to the real game: tutorial cards show their text when tapped, real-game cards don't (see row 4), and the staged dice never show that 1s and 2s score less than 3s. |
| 3 | First 10 seconds | 8 | The title says "First to 20 ★ wins" and has one big "Play now". The intro card has 3 bullets and "Let's smash". The dice tray and the Roll / SMASH! buttons are obvious. |
| 4 | Turn clarity | 5 | Whose turn and what to do are clear: a pill like "Roll 1/3 · Keep dice, then Roll", narration of rival turns, and a good stay/yield dialog. But the buy step fails a newcomer: the pill says "Tap a card to read it", yet tapping a card only selects it (BUY 4⚡) and never shows its text. The text appears only on a hold, which nothing teaches. So a new player buys blind. The Shed Skin prompt text is cut to "discard a Keep card, get its..." so you can't tell what you'd get. |
| 5 | Phone play | 6 | Targets are all ≥44 px, text ≥14 px and nothing scrolls sideways at either size. But at 375x667 the dice tray covers Downtown during your whole roll, so the board (who holds the city) is hidden right when you choose claws or not. Rival names in the top chips are cut ("Boltb…", "Shroom…"). The score chips are 14 px and dense. |
| 6 | AI and pacing | 6 | Rivals play sensibly and fast (about 5 s a turn), and games run 4.5 to 5.5 min, a good length. I played a plain new-player strategy (keep sets, claws, energy; heal outside when low; buy what I can afford) and lost all 3 games on the default level: 3rd with 1 ★, 2nd with 14 ★ (knocked out), 2nd with 14 ★. In one game a rival won with 21 ★ while I was on 14. With 3 rivals at once, a newcomer's first win is not likely. |
| 7 | Feel | 7 | Dice tumble and lock with a padlock icon, bought cards fly to your chip, heart and star bursts show on the board, a narration pill describes each turn, and there's a big painted win banner. The board itself mostly sits there during play (the 3D city is busy and hard to read), so the action is in the tray, not on the board. |
| 8 | Bugs | 8 | Three full games plus the tutorial: 0 errors, 0 stuck states, 0 dead taps. Every prompt (stay/yield, sell a card, buy) answered. Not 9+ because of the misleading "tap to read" behaviour (row 4). |

Total: 6.9 (FAIL: rows 4, 5 and 6 are below 7; no stopper)

### Findings
- Row 4: did: in my buy step I tapped an affordable card (Toxic Spittle, 4⚡) once, as the pill "Buy · Tap a card to read it" says. happened: the card only got a "BUY 4⚡" tag and the pill changed to "Tap BUY, or End turn". The card's effect text never appeared, so the player buys without knowing what the card does (the text shows only on a hold, which is never taught). shot: games-src/reviews/G7-shots/crown-shop-pill-read.png, games-src/reviews/G7-shots/crown-card-tap-no-text.png
- Row 4: did: started my turn at 375x667 holding Mega Brain and Shed Skin. happened: the prompt "Sell a card for ⚡?" explains the card as "Shed Skin: discard a Keep card, get its..." (cut off mid-sentence). shot: games-src/reviews/G7-shots/crown-shedskin-cut.png
- Row 5: did: rolled on my turn at 375x667. happened: the dice tray sits over the middle of the board and hides Downtown and who is in it for the whole roll. shot: games-src/reviews/G7-shots/crown-375-tray-covers-city.png
- Row 5: did: looked at and tapped the rival chips at 375x667. happened: names are cut ("Boltb…", "Shroom…"). The tap opens a clear detail sheet, but nothing teaches that tap. shot: games-src/reviews/G7-shots/crown-375-chip-names-cut.png
- Row 6: did: played three full default-level games as a newcomer. happened: lost all three (3rd with 1 ★, then 2nd with 14 ★ twice). One rival won with 21 ★, another as the last monster standing. Pace is good (4.5 to 5.5 min). shot: games-src/reviews/G7-shots/crown-result-390.png, games-src/reviews/G7-shots/crown-result-375.png
- Row 2 (works): the tutorial walks every core rule one tap at a time and ends on "Play a real game". The stay step and the end card are clean. shot: games-src/reviews/G7-shots/crown-tut-stay.png, games-src/reviews/G7-shots/crown-tut-end.png
- Row 3/4 (works): clear title and goal; the stay/yield dialog spells out the cost and gain of each choice. shot: games-src/reviews/G7-shots/crown-title.png, games-src/reviews/G7-shots/crown-stay-prompt.png, games-src/reviews/G7-shots/crown-turn-390.png

## tidewake

Build: branch shelf/W498-tidewake-gameplay (merge 7ced92b3), built with build-all.py, served beside games/tidewake/media. Played by touch: the tutorial to its end at 390x844 and at 375x667 (about 150 s each), then three Quick games against 2 computers on the default level, all to the result screen. 390x844: lost on turn 31 after 15 placements (5.5 min). 375x667: lost on turn 4, then won on turn 20 (4.5 min). 0 console errors and 0 page errors in all runs.

| # | Row | Score | Why |
|---|-----|-------|-----|
| 1 | Rules fidelity | 7 | The core turn matches the published game: roll 2 dice, 6/7/8 wakes every leviathan, one die each (5 arrows, a 6 raises a new one), lay a tile at your bow, sail the line along with any other junk on it, draw back to 3. Edge and leviathan sinkings, the elimination swap bonus, the minimum of 3 leviathans and last-junk-wins are all in. The 6x6 board, the repeated tiles and the leviathan arrows are guesses, and they are documented. The title screen says "Two junks meet: both sink", but the source rule is that junks pass each other; the engine only sinks two junks forced onto one wake in the same direction. |
| 2 | Tutorial teaches | 5 | Its form is right: 33 steps, one short line and one tap each, a real game at the end. But three times it stops for about 20 s with no bubble while the roll card shows a Continue button that ignores taps. The lesson also teaches Rogue Wave and Deck Cannon, which are expansion pieces and do not appear in the default Quick game. The elimination bonus gets one line, and the real game then asks you to choose swaps blind. |
| 3 | First 10 seconds | 8 | The title gives the goal in 4 short lines, the big "New here? Learn in 5 minutes" button is the obvious tap, and Quick game first asks "Learn to play / Just play". "Safe start for me" places your first junk. |
| 4 | Turn clarity | 6 | Laying a tile is clear: ✓/✗ badges on each hand tile, a gold start→Stop route preview, Turn/Place buttons, a "Your turn" line and a numbered roll card. The elimination bonus is not: you get up to 10 buttons like "Swap your tile #1 for pool tile #2" with no picture of either tile, and "Keep your hand" sits below the fold. On game over the panel still says "Your turn: the dice roll first". |
| 5 | Phone play | 5 | The board fills the top half and all targets are at least 44 px. At 375x667 the result screen's button row overlaps: "See the board" covers "Play again" and "New game", and the row runs past the bottom of the screen. At 375x667, tutorial step 10/33 pushes the hand tiles off the bottom and the bubble covers them. The bonus list needs a scroll to reach "Keep your hand". |
| 6 | AI and pacing | 6 | The computers play sensibly. A new player can win (1 of 3 games) and a game lasts 4-6 min. But every round has a 15-25 s wait while the computers' moves and leviathan lines replay one at a time. One game ended on turn 4 after a single placement, with nothing I could do: dice luck the game does not soften. |
| 7 | Feel | 7 | A painted 3D sea chart, dice that tumble, junks that glide along the lines, leviathans that move with an arrow cue, torn tiles, a sunk card, sound and music. It feels like a game. |
| 8 | Bugs | 4 | 0 errors and no stuck state, but there are dead taps. During each tutorial wait, the Continue button is covered by an invisible tutor cell (DIV.gxt-cell gxt-clear, checked with elementFromPoint), so 7-11 taps in a row on it do nothing. On game over the status line is stale. |

Total: 6.0, capped to 4.0 by the stopper (a dead tap on a visible Continue button). FAIL

### Findings
- Row 8 / Row 2 (stopper). Did: in the tutorial, after "A leviathan on your start square?" (step 6/33), and again at steps 31/33 and 40/33, tapped the Continue button on the "Your roll" card. Happened: the tap lands on an invisible tutor cell (DIV.gxt-cell gxt-clear). Nothing happens for 7-11 taps over about 20 s, and no bubble explains the wait. Shot: games-src/reviews/G7-shots/tide-dead-continue-375.png, games-src/reviews/G7-shots/tide-tut-wait-390.png
- Row 5. Did: won a Quick game at 375x667. Happened: on the result screen "See the board" sits on top of "Play again" and "New game", and the button row is cut off at the bottom of the screen. Shot: games-src/reviews/G7-shots/tide-result-overlap-375.png (390x844 is fine: games-src/reviews/G7-shots/tide-result-390.png)
- Row 4 / Row 5. Did: sank a rival with my tile on turn 18 (375x667). Happened: "Elimination bonus" lists "Swap your tile #1 for pool tile #1/#2/#3…" with no picture of either tile, so the choice is blind, and "Keep your hand" is below the fold. Shot: games-src/reviews/G7-shots/tide-bonus-blind-375.png
- Row 5. Did: tutorial at 375x667, step 10/33 "These are your three tiles. This one would sink you." Happened: the hand tiles are pushed off the bottom of the screen (the target ring is only 27 px tall) and the bubble covers them. Shot: games-src/reviews/G7-shots/tide-tut-hand-cut-375.png
- Row 2 / Row 1. Did: followed the tutorial. Happened: it teaches the expansion Rogue Wave and Deck Cannon (steps 22-33), which the default Quick game does not use, while elimination swaps get one line. Shot: games-src/reviews/G7-shots/tide-tut-wave-390.png
- Row 1. Did: read the title screen. Happened: "Two junks meet: both sink" overstates the rule. The source rule says junks pass each other; only a forced same-wake, same-direction ending sinks both. Shot: games-src/reviews/G7-shots/tide-title-390.png
- Row 6. Did: played three default Quick games. Happened: there is a 15-25 s wait between my turns while every computer move and leviathan line replays. The 375 game ended on turn 4 after one placement, with no decision of mine involved. Shot: games-src/reviews/G7-shots/tide-turn-390.png
- Row 8 / Row 4. Did: got sunk off the edge on turn 31 (390x844). Happened: with the game already over, the panel still reads "Your turn: the dice roll first" with a Skip button, until the result card appears. Shot: games-src/reviews/G7-shots/tide-stale-status-390.png
