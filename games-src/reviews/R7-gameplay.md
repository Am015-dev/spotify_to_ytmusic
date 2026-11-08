# R7 strict gameplay re-review (8 Nov 2026)

Reviewer R7. Scored by `games-src/reviews/GAMEPLAY-RUBRIC.md`. Each branch was built with `build-all.py <slug> --no-look` (all PASS)
and the staged page was served next to the branch's `games/<slug>/` files. I played with Playwright touch only (hasTouch/isMobile,
touchscreen taps and CDP touch drags) at 390x844 and 375x667, default settings. I re-checked every earlier finding myself and did
not use the fixers' notes as evidence. Rules were checked against the published rulebooks online (notes kept local, not committed).
Screenshots: `games-src/reviews/R7-shots/`.

| Game | Total | Verdict | Lowest rows |
|---|---|---|---|
| stitchwise | 7.0 | FAIL | 5 Phone 6 |
| crown-city-smash | 7.1 | FAIL | 6 AI/pacing 5 |
| emberclimb | 5.9 | FAIL | 2 Tutorial 4, 5 Phone 5, 1 Rules 6, 4 Turn clarity 6, 8 Bugs 6 |

---

## 1. stitchwise (shelf/W491-stitchwise-real @ 4611e2da)

Played: "Learn: your first game" to the end card at 390 (10 numbered steps, about 75 s by touch, real drag, Rotate, Flip and Sew).
Then two full games against the default "Easy computer" to the result card: 390 won 26-15 (via the tutorial's "Play a real game"),
375 lost 2-25 (Quick game > Easy). My new-player policy: buy the glowing patch with the most income, sew it where the ghost
lands, Rotate if it does not fit, else Advance. 0 page errors, 0 console errors, 0 stuck states.

| # | Row | Score | Why |
|---|-----|-------|-----|
| 1 | Rules fidelity | 8 | Matches the published rules: 5 buttons to start, 3 patches after the marker, furthest behind plays next, Advance = 1 button per space, income on button spots, first past a leather square gets the 1x1, first 7x7 = +7, end when both reach 53, score = buttons - 2 per empty square. The result card matches the engine. |
| 2 | Tutorial teaches | 7 | Fixed: one short line + one real action per step (tap patch, Rotate, drag into the gap, Sew, Advance, 1x1, Flip, drag, Sew), Sew stays disabled until the patch fits, and it ends on a positive score (+23 vs +15) and "Play a real game". Still a staged endgame: it starts at space 36 with the quilt already sewn, the counter shows "11/10", and the leather step says "sew it anywhere" but only one cell accepts the tap. |
| 3 | First 10 seconds | 7 | Clear goal line on the title. The highlighted button is "Story", not "Learn"; "Learn: your first game" is the 3rd button. First turn: "Tap a glowing patch to buy it" with a pointing hand. |
| 4 | Turn clarity | 7 | Glowing buyable patches, "no room" / "need 2 more" tags, "Advance +2 buttons", "Poppy is thinking… Tap to skip". The rival's name tag on the track is cut at the left edge ("arden 41/53") and the two tags overlap when the tokens are close ("Poppy 25/ You 25"). |
| 5 | Phone play | 6 | Fixed: card labels 14 px, numbers 15 px. Quilt squares while placing are 39 px at 390 and 37 px at 375 (under 44; the ghost auto-places and dragging works). Not fixed for reading: at 375 the idle quilt squares are about 24 px and the time-track squares 18x20 px; track tags overlap. This is the "everything so tiny on phone" complaint, still true for the board itself at 375. |
| 6 | AI and pacing | 7 | Fixed: rival waits average 1.1-1.2 s (max 2.8 s), measured from my action to my next turn. Easy is beatable (1 of 2 won with a naive policy that never moves the ghost). About 16 of my turns per game. |
| 7 | Feel | 7 | Fabric ghost with red stripes for no room, tokens walk the track, "+6 buttons" pops, result card with both quilts and a count-up. |
| 8 | Bugs | 7 | 0 errors, 0 stuck states. Visible glitches: "11/10" step counter, a silent tap on a different gold gap at the "sew it anywhere" step, and the cut-off track tag. |
| | **Total** | **7.0** | **FAIL**: row 5 is below 7. No stopper. |

### Earlier findings (R1)
| R1 finding | Status | Evidence |
|---|---|---|
| Row 2: staged slideshow, 4 "Skipping ahead" jumps | **Partly fixed**: no more jumps or Next-only taps, every step is an action. Still starts late in a pre-sewn game. | R7-shots/sw-tut-01-390.png |
| Row 2: Sew works without dragging | **Fixed**: Sew is disabled until the patch fits. | sw-tut-03-sew-early-390.png, sw-tut-13-sew-nodrag-390.png |
| Row 2: ends on "You -32, Marden -73" | **Fixed**: ends +23 vs +15. | sw-tut-15-end-390.png |
| Row 5: labels 12 px / numbers 13 px | **Fixed**: 14 / 15 px. | sw-game-01-390.png |
| Row 5: quilt squares 22-24 px, track 18-19 px | **Partly fixed**: 37-39 px while placing; idle quilt 24 px and track 18x20 px at 375. | sw-375-placing.png, sw-375-game-turn7.png |
| Row 6: rival waits 4.5-6.4 s, peaks 13-19 s | **Fixed**: 1.1-1.2 s average, 2.8 s max. | sw-game-turn7.png |

### New findings
- Row 2/8. Did: tutorial step after the Sew at 390. Happened: the counter reads "11/10" for four Advance taps. Shot: R7-shots/sw-tut-14-end-390.png
- Row 2. Did: at "You passed a leather space... sew it anywhere", tapped a gold gap other than the outlined one. Happened: nothing, no message; only one cell works. Shot: sw-tut-09-390.png
- Row 4/5. Did: watched the track in the tutorial and in the 390 game. Happened: "Marden 41/53" is cut to "arden 41/53" at the left edge; "Poppy 25/" and "You 25" overlap. Shots: sw-tut-07-390.png, sw-game-turn7.png
- Row 5. Did: played a full game at 375x667. Happened: the idle quilt is about 24 px per square and the track 18x20 px; reading both quilts and the track needs a squint. Shot: sw-375-game-turn7.png
- Row 3. Did: opened the title. Happened: "Story" is the highlighted primary button, "Learn" is third. Shot: sw-title-390.png
- Positive: result card. Shots: sw-game-result-390.png, sw-375-result.png

---

## 2. crown-city-smash (shelf/W500-crown-gameplay @ 338f489d)

Played: "New here? Learn in 5 minutes" to the end card at 390 (26 steps, about 90 s, 0 errors). Then two full games vs 3 computer
monsters on the default level (Customise shows **Easy** selected): 390 lost (4th, 15 ★, Squidrik won at 20 ★, 5.4 min),
375 lost (knocked out, 18 ★, Magmaw won at 23 ★, 4.7 min, 5 cards bought by tap-to-read then Buy). My policy: keep any
number with 2+ dice, claws and energy, hearts when below 7 ♥ outside Downtown, stay unless 5 ♥ or less, buy the first affordable
card. 0 page errors, 0 console errors, 0 stuck states, 0 dead taps.

| # | Row | Score | Why |
|---|-----|-------|-----|
| 1 | Rules fidelity | 8 | Unchanged and correct against the rulebook: 6 dice, 3 rolls, number sets (+1 per extra die), claws, hearts not in Downtown, +1 ★ entering, +2 ★ starting a turn there, stay/yield only when hit, 2 ⚡ sweep, 20 ★ or last standing. |
| 2 | Tutorial teaches | 7 | 26 one-tap steps in rule order, ends on "Play a real game". Fixed: cards are read by a tap in the tutorial and in the real game alike. Still not taught: 1s and 2s score less than 3s. At step 2 ("Tap the glowing one") the brightest ring stays on the die you already kept, so tapping it un-keeps it. |
| 3 | First 10 seconds | 8 | "First to 20 ★ wins", a big "New here?" button and "Play now (recommended)". The intro card has 3 bullets and "Let's smash". |
| 4 | Turn clarity | 7 | Fixed: tapping a card opens its art, PERMANENT/ONE-SHOT tag and full text with "Buy · 3 ⚡" and "Not now". The pill always says what to do. Small: before the first roll the pill says "Keep dice, then Roll" over faded dice. |
| 5 | Phone play | 7 | Fixed: at 375 a "👑 Downtown: Boltbox" tag sits above the tray while rolling. Targets ≥44 px, chip text 14 px. Not fixed: at 375 the Downtown holder's name is still cut ("Boltb…") in its chip. |
| 6 | AI and pacing | 5 | Easy is now the default, but I lost both games as a newcomer (4th and knocked out). The wait between my turns was 13.5-15.8 s on average (max 18.8 s): three rivals at about 5 s each, with nothing to do. |
| 7 | Feel | 7 | Dice tumble and lock, bought cards fly, heart/star bursts, painted win card. |
| 8 | Bugs | 8 | Tutorial + 2 full games: 0 errors, 0 stuck states, every prompt answered. |
| | **Total** | **7.1** | **FAIL**: row 6 is below 7. No stopper. |

### Earlier findings (G7)
| G7 finding | Status | Evidence |
|---|---|---|
| Row 4: tapping a card never shows its text (buy blind) | **Fixed**. | R7-shots/crown-375-shop.png, crown-375-cardtap-read.png |
| Row 4: Shed Skin prompt cut off | **Not seen** (the card never came up in my games). | n/a |
| Row 5: at 375 the tray hides Downtown during the roll | **Fixed** with the Downtown tag. | crown-375-roll-board.png |
| Row 5: rival names cut in chips at 375 | **Partly fixed**: fit at 390; "Boltb…" still cut at 375 when holding the crown. | crown-375-cardtap-read.png |
| Row 6: lost 3/3 on the default level | **Not fixed**: lost 2/2 on Easy. | crown-result-390.png, crown-result-375.png |
| Row 2: tutorial card read differs from the real game | **Fixed**. | crown-tut-12of26.png |
| Row 2: 1s and 2s never shown to score less | **Not fixed**. | crown-tut-4of26.png |

### New findings
- Row 6. Did: two full Easy games with a sensible newcomer policy. Happened: lost both (4th with 15 ★; knocked out with 18 ★). Shots: R7-shots/crown-result-390.png, crown-result-375.png
- Row 6. Did: timed from my End turn to my next Roll. Happened: 13.5-15.8 s average, up to 18.8 s, every turn. Shot: crown-game390-turn7.png
- Row 2. Did: tutorial step 2, "Tap both 3s", then "Tap the glowing one". Happened: the strong ring stays on the first (already kept) die and only a soft ring marks the second; tapping the bright one un-keeps the die. Shot: crown-tut-02-stuck-390.png
- Row 5. Did: looked at the chips at 375. Happened: "Boltb…" is cut when it holds the crown. Shot: crown-375-cardtap-read.png
- Positive: the tap-to-read card panel. Shot: crown-375-cardtap-read.png

---

## 3. emberclimb (shelf/W485-emberclimb-bench @ 734cc993)

Played: "New here? Learn in 5 minutes" at 390 (15 steps, 34 s) and at 375; at 375 I carried the tutorial run on to the end
(6 floors: fights, rest, elite, boss) and won ("CLIMB WON!", 27/80 HP). Then a Quick game at 390 (1 act; the default is 3 acts): gift event, a fight, two events and the upgrade picker by touch,
then I stopped at the time cap on floor 3, so the full game to a result is the 6-floor run at 375. 0 page errors, 0 console errors, 0 hard stuck states.

| # | Row | Score | Why |
|---|-----|-------|-----|
| 1 | Rules fidelity | 6 | Now follows the tabletop rules in the engine: dice cards, Vulnerable doubles, Weak takes off one step (3 at this scale), both cancel, act boss splits into slimes, Drink/Discard potions. But the scale is mixed: hero HP is 80 and cards deal 6-12 (video-game scale) while the campfire heals 3 x 3 = 9 (11%), so rests barely matter. |
| 2 | Tutorial teaches | 4 | 15 one-tap steps for a fight, Strength, Weak, potion and reward. Then step 13 lists all room types in one Next line, and the end card says "Rules you met on the way: 24 of 34" with a 10-item "Things you will meet later" list (multi-target attacks, die cards, Dazed, Frail, two heroes, Shivs, Orbs, Wrath, Scry, Retain). The rubric bans exactly this. |
| 3 | First 10 seconds | 7 | Big "New here? Learn in 5 minutes" button; Quick game opens on a 3-bullet goal card. |
| 4 | Turn clarity | 6 | "Incoming 11" on the hero, rare gift now names the card ("Gained rare card Pyre Heart"), victory line grades the fight. But at 375 the selected card's big preview covers the enemy's HP and the End turn button, and the bet event says "Rolled 4: Nothing changed" after "Bet 30 gold". |
| 5 | Phone play | 5 | At 375 the edge cards in hand still hang off the screen (x=-22 and x=397 on a 375 screen). The reward screen at 375 shows the card choices cut off by the bottom bar ("Intimidatin Roar" split mid-word). On the result screen the relic row sits under Play again / Title, and a "Relic: Dawnstone" toast covers the "Final deck" title. |
| 6 | AI and pacing | 6 | Foe turns are quick (about 1.5-2 s). I won the 6-floor tutorial run and the boss went down. The default Quick game is 3 acts, long for a phone session. |
| 7 | Feel | 7 | Damage pops, cards fly, victory grade, boss splash, strong art. |
| 8 | Bugs | 6 | 0 errors. On the reward screen, taking the potion makes the layout jump: my next tap at the relic's old spot hit the card row, and the card choice vanished with no message. Relics are still hidden under the result buttons. |
| | **Total** | **5.9** | **FAIL**: rows 1, 2, 4, 5, 6 and 8 are below 7. The G3 stoppers (dead Iron Bangle relic and the intent hidden under potions at 375) are gone: potions moved to the bottom bar and the intent reads "Incoming N". |

### Earlier findings (G3)
| G3 finding | Status | Evidence |
|---|---|---|
| Row 5/4 STOPPER: intent hidden under potions at 375 | **Fixed**: potions are in the bottom bar; "Incoming 5" shows on the hero. | R7-shots/ember375-fight.png |
| Row 1/8 STOPPER: Iron Bangle does nothing | **Not re-checked by play** (I took the potion/relic offered, not the Bangle). | n/a |
| Row 1: rest heals 9 not 30% | **Not fixed**: "Rest: heal 9" at 80 max HP (a stale coach toast also sits over the campfire). | ember375-run-scr7.png |
| Row 1: boss never splits | **Fixed in the engine** (split events); the boss I fought died before I saw it. | n/a |
| Row 2: dead tap on a glowing room | **Fixed**: the other glowing room (Fight) works at 375. | ember375-tut-map.png, ember375-tut-soft-room-tap.png |
| Row 2: 7 Next-only map lines; Ethereal/Retain with no card | **Partly fixed**: one Next line for rooms; Retain etc. moved to a "meet later" list. | ember375-result.png |
| Row 4: rare card not shown, upgrade "Done.", bet result vague | **Partly fixed**: rare card named; bet still "Rolled 4: Nothing changed". | ember-quick-03-rare-390.png, ember-quick-bet-390.png |
| Row 4: upgrade picker with no preview | **Fixed**: before/after preview (Anvil Blow 8 → Anvil Blow+ 11, Vulnerable shown) and an "Upgrade Anvil Blow" button. | ember-quick-upgrade-preview-390.png |
| Row 4/1: potions drunk at once | **Fixed**: a tap opens Drink (seen in the boss fight). | ember375-reward-scrolled.png |
| Row 5: edge cards off screen | **Not fixed** (-22 / 397 at 375). | ember375-fight.png |
| Row 5: result relics under buttons | **Not fixed**. | ember375-run5-result.png |
| Row 8: cards jump after taking the potion | **Not fixed**. | ember375-reward.png, ember375-reward-scrolled.png |

### New findings
- Row 2. Did: finished the tutorial run. Happened: "Rules you met on the way: 24 of 34" and a 10-item "Things you will meet later" list. Shot: R7-shots/ember375-result.png
- Row 8/5. Did: on the elite reward at 375 I tapped the potion, then the relic. Happened: the layout moved up after the potion; the second tap removed the card choices, and no message said what happened. Shots: ember375-reward.png, ember375-reward-scrolled.png
- Row 4/5. Did: tapped Plate Guard once at 375. Happened: the raised card covers the enemy's HP bar and the End turn button until played. Shot: ember375-relic-popup.png
- Row 5. Did: opened a fight at 375. Happened: the first and last cards in hand are cut by the screen edges. Shot: ember375-fight.png
- Row 5. Did: won the run at 375. Happened: relic icons sit under Play again / Title and a toast covers "Final deck". Shot: ember375-run5-result.png
- Row 1. Did: rested at the campfire on 80 max HP. Happened: "Rest: heal 9" (11%), with a leftover "Fully blocked" coach toast on top. Shot: ember375-run-scr7.png
- Row 6. Did: opened Quick game. Happened: "3 acts" is the default.
