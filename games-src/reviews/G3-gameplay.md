# G3 strict gameplay review (8 Nov 2026)

Scored by games-src/reviews/GAMEPLAY-RUBRIC.md. Each game was built from its own branch, served next to its media folder, and played by touch (Playwright touchscreen) at 390x844 and 375x667 as a new player: tutorial to the end, then a full game to the result screen. Rules were checked against the published rulebook (notes kept local). Where the reviewer changed a playtest score, the row says so.

| Game | Total | Result | Lowest rows |
|---|---|---|---|
| Emberclimb | 4.0 (raw 5.5) | FAIL, stopper | Rules 4, Phone 4, Turn clarity 5, Bugs 5 |
| Kaiten Kitchen | 7.3 | FAIL | AI and pacing 5 |
| Sunglaze | 7.5 | FAIL | Phone 6, AI and pacing 6 |

## Emberclimb (branch shelf/W485-emberclimb-bench)
Played: Tutorial done by touch (29 coached steps, ending at "the run is yours now"). Then a Quick game, 1 act, played by touch: died to the act boss on floor 10 of 10 after 9 rooms (2 fights, 2 elites, 2 events, 1 chest, 1 rest, boss), about 11 minutes. 0 console errors, 0 page errors, 0 hard stuck states. Layout checked at 390x844 and 375x667.
| # | Row | Score | Why (one line) |
|---|-----|-------|----------------|
| 1 | Rules fidelity | 4 | The core loop is right (3 energy, draw 5, discard, block resets, intents, pick 1 of 3, potions, elites, boss), but Vulnerable doubles damage, Weak takes off a flat 3, rest heals 9 not 30%, the map is only 10 floors, the boss never splits, and the Iron Bangle relic does nothing. |
| 2 | Tutorial teaches | 6 | It has a real guided fight with one line and one tap per step, but then 7 Next taps of map lecture in a row, explains Ethereal and Retain with no such card in hand, and has a dead tap on a glowing room. |
| 3 | First 10 seconds | 7 | The title has one big "New here?" button, and Quick game opens on a short goal card. |
| 4 | Turn clarity | 5 | Card numbers ignore Strength, hand cards hide side effects (Anvil Blow+ shows only "Deal 11."), an intent showed 8 and hit for 28, potions fire with no description, and event results are vague. |
| 5 | Phone play | 4 | At 375x667 the potion bar covers the enemy intent; potion and relic buttons are 36px; HP, names and card titles are 12.5-13px; card names split mid-word; result-screen relics sit under the buttons. |
| 6 | AI and pacing | 6 | Enemies follow clear patterns and turns are quick (about 1.5 s), but early fights are trivial (a 12 HP foe on floor 6) and the elites, the boss and the 9 HP rest made the boss unwinnable for my run. |
| 7 | Feel | 7 | Damage numbers, cards flying, a hit shake, a boss splash and strong art, but upgrades, events and the rare-card gift give almost no feedback. |
| 8 | Bugs | 5 | No errors or crashes, but a relic does nothing, one tutorial tap was dead, a quick second tap during a card's flight is dropped, intent damage is under-shown, and relics overlap the buttons. |
| | Total | 4.0 | FAIL (stopper? yes: a broken relic rule and the intent hidden at 375x667 cap the total at 4; the raw average is 5.5) |
### Findings
- Row 5/4: did open a fight at 375x667; happened: the enemy intent badge is drawn under the top potion slots, so you cannot see or tap the enemy's next move (`elementFromPoint` at the badge returns `pot`). Enemy intents are a core rule. `games-src/reviews/G3-shots/emberclimb-01-375-intent-hidden-under-potions.png`
- Row 1/8: did take Iron Bangle ("Start fights with 4 Block") and enter the boss fight; happened: there was no block on the hero. In the engine, `startBattle` gives 4 Block, and then `beginRound` and `startHeroTurn` set `h.blk = 0` straight away, so the relic never works. `games-src/reviews/G3-shots/emberclimb-11-boss-no-bangle-block.png`
- Row 4/1: did block for 10 against the elite's intent of 8 plus Vulnerable; happened: I took 18 (a 28-point hit). The enemy applies Vulnerable before its own hit (in `act()`), which doubles that same hit, and `previewHit` leaves this out, so the intent number is badly under-stated. In the original game the damage lands first and the debuff comes after. (no shot; the HP drop was 63 to 45 in the log)
- Row 1: did rest at the campfire with 30/80 HP; happened: it offers "Rest: heal 9" (11%) instead of 30% (24 HP). With the start-of-fight Heal 6 relic, this is why the boss could not be survived. `games-src/reviews/G3-shots/emberclimb-05-rest-heals-9-not-30pct.png`
- Row 1/2: did the tutorial's Vulnerable and Weak steps; happened: it teaches "Vulnerable: double damage" and "Weak: 3 less damage" (an intent of 3 dropped to 0). The original uses +50% and -25%. Dice-roll cards and a shared enemy die are also added, the Act 1 map has 10 floors and 4 columns (the tutorial map has 6 floors and 2 columns), and the act boss never splits at half HP. `games-src/reviews/G3-shots/emberclimb-09-tut-vulnerable-double.png`
- Row 2/8: did the tutorial map step "Tap a glowing room. The run is yours now."; happened: both rooms glow, but tapping Fight does nothing, because only Chest is allowed. Also, steps 22-28 are 7 Next-only lecture lines in a row (rest, shop, event, elite, boss, three acts), and step 16 explains Ethereal and Retain with no such card in play. `games-src/reviews/G3-shots/emberclimb-02-tut-map-fight-tap-ignored.png`
- Row 4: did gain Strength 4 and look at my hand; happened: Cinder Strike still says "Deal 6." (the original shows the real number). Upgraded Anvil Blow+ in hand shows "Deal 11." and hides its Vulnerable. `games-src/reviews/G3-shots/emberclimb-10-card-text-ignores-strength.png`
- Row 4/7: did take the "Take a rare card" gift, "Upgrade a card" at an event, and "Bet 30 gold, roll"; happened: the game never shows which rare card I got, the upgrade only says "Done.", and the bet says "Rolled 3." with the gold unchanged and no win/lose line. `games-src/reviews/G3-shots/emberclimb-03-rare-card-not-shown.png`
- Row 4: did open the upgrade picker; happened: it is a long scrolling grid of mostly empty cards with no before/after preview, and Anvil Blow is below the fold. `games-src/reviews/G3-shots/emberclimb-04-upgrade-picker-no-preview.png`
- Row 5: did open the final result screen; happened: the relic row (y=788) sits under the Play again / Title buttons (y=766-812). The summary also says "Floors 9 / 9" while the map said 10. `games-src/reviews/G3-shots/emberclimb-07-result-relics-under-buttons.png`
- Row 5: did measure text and targets; happened: potion and relic buttons are 36x36 (or 38x38); the HUD HP and gold are 12.5px; hero and enemy names, HP numbers and card titles are 13px. Card names wrap mid-word ("Sweepin g Arc", "Intimidat ing Roar"), Berserk Roll's text is cut off on the reward card, and the edge cards in hand hang off the screen (x=-24 and x=414). `games-src/reviews/G3-shots/emberclimb-12-reward-text-cut.png`
- Row 4/1: did tap a potion in a fight; happened: it is drunk at once, with no description and no Drink/Discard choice, and a targeted potion always hits the first enemy. `games-src/reviews/G3-shots/emberclimb-11-boss-no-bangle-block.png`
- Row 8: did select a card and tap it again within about 0.5 s; happened: the second tap is dropped while the last card is still flying (`UI.busy`), so a fast "tap twice" sometimes needs a third tap.
- Row 8: did take the reward potion and then tap where a card had been; happened: the cards jump up about 100px when the potion is taken, so my tap landed on Skip and I lost the card pick. Leaving a chest with Continue also drops an untaken relic with no warning.
- Row 5: did open the shop at 375x667; happened: it works (bought an item, gold went from 400 to 350), but shop cards are tiles with only a name and picture until tapped, and the second row is cut off at the fold. `games-src/reviews/G3-shots/emberclimb-08-375-shop.png`
- Row 7 (positive): the boss intro splash, damage pop-ups and art are strong. `games-src/reviews/G3-shots/emberclimb-06-boss-intro.png`

## Kaiten Kitchen (branch shelf/W499-kaiten-gameplay)
Played: tutorial done by touch (27 steps, about 2 min, won 37-16). Six full 3-diner games by touch to the result screen (390x844 and 375x667), about 4.6 min each. A simple sensible strategy lost 4 of 4 (best 47 vs 50). Stronger play won 51-35-33. Errors: 0 console, 0 page errors, 0 stuck states.
| # | Row | Score | Why (one line) |
|---|---|---|---|
| 1 | Rules fidelity | 8 | Hand sizes, set scores, roll race ties, Fire Paste, Twin Sticks and custard all match the real rules. I checked 2 games by hand and they were exact. One custard chip shows the wrong number. |
| 2 | Tutorial teaches | 8 | One line and one tap per step, rules taught in order, then "Play a real game". The end-of-game custard rules are only shown, not played. |
| 3 | First 10 seconds | 7 | Clear start buttons and a 3-line "how you win" card, but the title screen has a big empty parchment panel in the middle that looks like missing art (reviewer lowered 8 to 7). |
| 4 | Turn clarity | 7 | The phase banner and +N badges help. The result shows totals only, with no breakdown, and once the plate art did not match its labels. |
| 5 | Phone play | 7 | Targets 44px+, text 14px+ (measured), no side scroll at either size. The result buttons sit on cut-off plate graphics and look clumsy. |
| 6 | AI and pacing | 5 | The rivals play well. But each tap is followed by about 9.5 s of forced reveal and pass animation at default speed, and casual sensible play lost 4 of 4. A new player cannot win on default (reviewer lowered 6 to 5). |
| 7 | Feel | 8 | Cards fly to a reveal stage, covers lift, hands slide along the belt, confetti on a win. |
| 8 | Bugs | 8 | 7 full runs, 0 errors, 0 stuck. One art/label mix-up at 375 and a messy half-faded reveal frame. |
| | Total | 7.3 | FAIL (stopper? no) |
### Findings
- Row 3: opened the game as a new player; the title shows a large blank parchment panel above the buttons, like an image that never loaded. `games-src/reviews/G3-shots/kaiten-00-title-empty-panel.png`
- Row 6: timed a tap until the next pick was possible; it took 9.5 s every turn at default speed (sequential "covers lift one by one", then "hands pass"). That is 27 x ~10 s of waiting per game. A Fast option exists only in the menu. `games-src/reviews/G3-shots/kaiten-01-reveal-wait.png`, `games-src/reviews/G3-shots/kaiten-02-hands-pass-9s.png`
- Row 6: played 4 games with a sensible greedy strategy (complete sets, buns, custard); lost all 4 to the normal chefs (21-40, 27-53, 41-48, 47-50). Only near-optimal play won. A new player will probably lose their first games. `games-src/reviews/G3-shots/kaiten-03-loss-no-breakdown.png`
- Row 4: lost a game and opened the result; it shows only the three totals. There is no per-round or category breakdown and no custard line, so the player cannot see why they lost. `games-src/reviews/G3-shots/kaiten-03-loss-no-breakdown.png`
- Row 1/4: two diners tied for fewest custard. The engine correctly took 3 each (38 to 35, 36 to 33), but the chip on their tables said "−6". `games-src/reviews/G3-shots/kaiten-04-win-custard-chip-minus6.png`
- Row 8/4: at 375x667, with Seaweed Rolls, unused Fire Paste and Twin Sticks on my table, the "tap: grab 2" glow and label sat on the roll stack. The sticks plate carried the "1st +6" label and the Fire Paste plate was missing (only "×3" showed). Not reproduced in 2 retries. `games-src/reviews/G3-shots/kaiten-05-375-art-label-mismatch.png`
- Row 8/7: 0.9 s into a reveal, half-faded ghost cards lie over Kofi's table and the "You/Odile/Kofi" tags. It looks messy for a moment. `games-src/reviews/G3-shots/kaiten-06-reveal-ghost-overlap.png`
- Row 5: on the result card, "Play again" and "Menu" are pushed to the left on big cut-off plate shapes. This looks unfinished. `games-src/reviews/G3-shots/kaiten-04-win-custard-chip-minus6.png`
- Row 3: before the tutorial, the setup screen says "Normal game"; after it, the same button says "Start the meal". The "how you win" card also shows again right after finishing the tutorial. `games-src/reviews/G3-shots/kaiten-12-375-setup-names.png`, `games-src/reviews/G3-shots/kaiten-10-coach-after-tutorial.png`
- Row 2 (good): every step is one short line on the glowing target, and the progress bar shows x/27. Twin Sticks and scoring are taught by doing them. `games-src/reviews/G3-shots/kaiten-07-tutorial-first-pick.png`, `games-src/reviews/G3-shots/kaiten-08-tutorial-sticks.png`, `games-src/reviews/G3-shots/kaiten-09-tutorial-scoring.png`
- Row 5 (good): the 375x667 board fits with no overlap, and the hand cards are about 75x110 px. `games-src/reviews/G3-shots/kaiten-11-375-board.png`, `games-src/reviews/G3-shots/kaiten-13-round-scored.png`, `games-src/reviews/G3-shots/kaiten-14-start.png`

## Sunglaze (branch shelf/W501-sunglaze-gameplay)
Played: tutorial done by touch (21 steps, 57 s). 3 full games by touch to the result on default settings (2 players, Easy). Won 43-32, lost 8-42 with a weak move picker, won 84-48 playing well. About 4 minutes per game. 0 console or page errors.
| # | Row | Score | Why (one line) |
|---|-----|-------|----------------|
| 1 | Rules fidelity | 9 | 20 of 20 round scorings match the real rules: adjacency, floor -1,-1,-2,-2,-2,-3,-3, floor at 0, +2/+7/+10 bonuses. Also correct: 5 kilns of 4 tiles, 100 tiles, blocked rows, Sun to whoever takes first from the middle. |
| 2 | Tutorial teaches | 8 | 21 steps in rule order, one line and one tap each, no "learn later" list, then a real game. Once, the bubble hides the rack it is talking about. |
| 3 | First 10 seconds | 7 | Begin leads to one goal card, but the title is a settings wall (players, 10 rival faces, level, Story) and "Learn to play" sits second, under Begin (reviewer lowered 8 to 7). |
| 4 | Turn clarity | 7 | Rows glow and blocked rows show an X; the floor cost and score gain are previewed. Empty wall spots look almost as strong as placed tiles. |
| 5 | Phone play | 6 | Kiln tiles are 34-35 px, rack rows 33-35 px tall and the score pills 36 px tall, all under 44 px. No text under 14 px and no overflow at 375x667 or 390x844. |
| 6 | AI and pacing | 6 | The default rival is beatable, but every rival turn takes 4.5-5 s, each round end takes about 20 s, and the result shows 18-25 s after the last move. |
| 7 | Feel | 8 | Tiles fly to the racks, leftovers slide to the middle, scores pop up, and there is a result card with art. |
| 8 | Bugs | 9 | 3 full games and the tutorial: 0 errors, 0 stuck states, 0 dead taps in play. Score totals and invariants held. |
| | Total | 7.5 | FAIL (stopper? no) |
### Findings
- Row 5: measured the tap targets at 375x667. Kiln tiles are 34 px, rack rows are 33 px tall (29 px for the rack itself), and the floor line is 32 px tall. All are under the 44 px bar on the main tap path. `games-src/reviews/G3-shots/sunglaze-01-small-targets-375.png`
- Row 6: a screenshot 3 s after the game ended still shows a rival-move banner and a stale score (18, real score 43). The result card took 18 s to appear in one game and 25 s in another. Rival turns wait 4.5-5 s each, and each round end takes about 20 s. `games-src/reviews/G3-shots/sunglaze-02-result-lag.png`
- Row 3: the title screen asks for players, rival and level before the goal; a new player taps Begin, not Learn to play. `games-src/reviews/G3-shots/sunglaze-00-title-settings-wall.png`
- Row 4: on a wall with 7 tiles placed, the empty printed spots are nearly as saturated as the placed tiles. At a glance you can't tell what you have built. Empty spots need to be much fainter. `games-src/reviews/G3-shots/sunglaze-03-wall-empty-vs-placed.png`
- Row 2: at step 6 ("Rack 3 is shut... Tap rack 4") the bubble sits over racks 2-3, so the shut rack it explains is hidden. `games-src/reviews/G3-shots/sunglaze-04-tutorial-bubble-covers-rack.png`
- Row 4: once a tile is picked, the rival's name pill shrinks to "T.". `games-src/reviews/G3-shots/sunglaze-05-turn-preview.png`
- Row 6: in one game the Easy rival put 17 points of tiles on its floor (34 points in my weak game). That is a beginner level that still loses tiles, which is fine for a default.
- Positives: one-card start `games-src/reviews/G3-shots/sunglaze-06-first-10s.png`; flying tiles `games-src/reviews/G3-shots/sunglaze-07-tiles-fly.png`; tutorial end card goes straight to a real game `games-src/reviews/G3-shots/sunglaze-08-tutorial-end.png`; result card `games-src/reviews/G3-shots/sunglaze-09-result-win.png`; works at 375 `games-src/reviews/G3-shots/sunglaze-10-intro-375.png`.
