# G7 gameplay review (strict, 8 Nov 2026)

Phone touch play at 390x844 and 375x667 on each game's branch build. Scored by games-src/reviews/GAMEPLAY-RUBRIC.md. Sections for the other games are added when their play is done.

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
