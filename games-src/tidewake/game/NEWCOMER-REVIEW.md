# Tidewake newcomer review

Played from the frozen page only, with Playwright screenshots.

- Guided game, 1366x768: played twice, lost both times, in 11 and 6 turns.
- 4-player game with all four expansions, 1366x768: lost on turn 19.
- Solo game with all expansions, 390x844: lost on turn 11.
- Computers drove every other seat.
- Not seen: a Rift Gate interrupt, a human-turn Rogue Wave capsize roll, the interrupt timer. Item 19 covers this.
- Screenshots are in `$SP/nc/` (`g1-*`, `g2-*`, `g4-*`, `m-*`).

## Items

1. **Setup, guided game, "Choose start marks".** Four sets of 12 near-identical chips (Top/Right/Bottom/Left, 1a-6b), plus tiny gold dots on the board edge. I did not know what "a/b" means, which start is good, or that a start next to a corner can trap me. The text "numbers 1 to 6 are what the dice point at" means nothing yet. The leviathans are already on the board and nobody explains them. **Major.** Fix: highlight the legal marks with big pulsing pips on the board, and label a/b as "left/right of the number". Recommend a start and say why (middle of an edge, away from leviathans). Tell the player the dice come later.
   **Status: Fixed: big pulsing gold pips on the board for every legal start, labelled L/R (U/D on the side edges), a green 'best' pip plus a one-sentence recommendation and a 'Start here' button; text says the dice come later and the leviathans are the creatures already on the board.**

2. **Guided game, my first turn.** I could not find my junk on the 3D board. It is a small red hull at the very edge and is easy to lose among the leviathans. **Minor.** Fix: ring or label my junk with "You" and a pulsing halo during my turn.
   **Status: Fixed: a pulsing ring and a gold 'You' tag on my junk during my turn; every junk carries a small name tag.**

3. **Placing a tile, preview path.** The ghost tile does appear on the board at my junk, with a red glow when it sinks me and a white glow otherwise. This is good. But the route is not drawn: every line on the tile is white, so "the gold line is exactly where you will sail" does not match what I see. The end square is not marked either (only the text "stops at column 3, row 6"). **Major.** Fix: draw the real route as a thick gold or coloured line from the junk through all connected tiles, with a ghost junk or flag at the stop square. Also say where the junk stands on the preview tile.
   **Status: Fixed: the real route (from the engine's path) is a thick gold dashed line through every connected tile, with a flag and label 'Stop: column c, row r' and a 'start' tag; red with 'Off the edge' / 'Hits X' / 'Collision' when it sinks.**

4. **Warning line "Tidegrave would be right next to you. / Tidegrave is next to you."** The same sentence appears twice, in red. I could not tell which of the six monsters Tidegrave is: names are not on the board. It also does not say whether "next to" is harmful. **Major.** Fix: show a single line ("Tidegrave is adjacent; if it moves onto you you sink"). Put name tags on the leviathans and highlight the named one when the line is hovered.
   **Status: Fixed: one line per leviathan ('Tidegrave is next to you. If the leviathans wake and it rolls 2 it moves onto you ... about 7% each turn' or 'cannot move onto you right now'); name tags on every leviathan, the named one lights up when the line is hovered; adjacent leviathans get a red outline.**

5. **Advisor: "Safest move... 0 of 9 placements would sink you".** It has no lookahead. In the guided game it walked me down into the bottom-left corner. Two turns later "12 of 12 placements would sink you" and I sailed off the edge. Following the lesson game's own advice lost the lesson game twice. **Blocker for onboarding.** Fix: have the advisor penalise edges and corners, and tell me how many safe moves I keep next turn. In guided mode, make the opponent and the dice gentle enough that a first game is winnable or at least long.
   **Status: Fixed: the Safest-move advisor is the hard computer's own evaluation (ai.js scoreMove / mcRisk / safeOpts / drawSafe) plus a two-turn trap look-ahead (surv2); it ranks any move that leaves no safe move next turn, or a trap within two turns, below every move that does not (0 violations in 1,400 decisions, tests: advtest.js). It states how many safe placements you keep next turn. The guided opponent stays 'easy'. Engine dice cannot be made gentler from the UI (see UI-REPORT).**

6. **Guided game over: "Victory!" shown when I lost.** The card says "Victory! Cobalt won." in the same panel where my own crew is struck through. In the guided game the first loss comes with no "here is what to try next". **Major.** Fix: say "You were sunk: your wake ran off the edge" and show a "Defeat" or neutral header. Offer "Replay the last turn" or "Try again with hints".
   **Status: Fixed: Victory only if you (or your team) won; otherwise 'Defeat' with 'You were sunk: <cause>', all crews listed, 'Rewind to my last move', 'Try the guided game again' and a tip.**

7. **Why I sank.** The only cause is a single sentence in the Log ("Vermilion's junk sailed off the edge of the chart."), and the main panel shows only the last placement line. In game 1 I did not know whether Cobalt's tile or a leviathan roll (2+4=6) did it, because my junk was still drawn on the board. In the 4-player game both Jade's and my loss were announced only in the Log. **Blocker.** Fix: a "Sunk!" card with cause (edge, leviathan, collision, wave, whirlpool), a red cross on the spot, and a zoom or pulse on the board. Remove the dead junk from the board.
   **Status: Fixed: a 'Sunk!' card with the cause (edge, leviathan, collision, wave, whirlpool, blocked) for every sunk crew, a red cross + name on the exact spot, and the junk is removed.**

8. **Leviathan roll.** "The leviathans stir!" appears for rolls 6-8, then the individual outcomes are only in the Log ("Brinemaw moves south", "Hollowmaw stays put: a new leviathan rises instead", "Abyssal Crown swims off the edge"). On the board I could not tell which monster moved, where it came from, or the die each one rolled. A moved monster could land next to me during an animation I could skip. Rolls of 6, 7, 8 as the trigger is explained only once, in a lesson card that shows before I have any context. **Major.** Fix: a step-by-step "Monsters wake" card (one line and one arrow per monster, in order), with each monster's name tag and its path drawn briefly. Show "Calm: nothing moves" on other rolls. Put the 6/7/8 trigger next to the dice at all times.
   **Status: Fixed: a 'Monster wake roll' card with the two dice, the 2..12 scale with 6/7/8 highlighted, then one numbered line per leviathan in order (die rolled and result, rises, swims off), each with its name tag lit and a pink arrow from old to new square; calm rolls say 'nothing moves'; the wake roll stays in the top bar.**

9. **The die lesson text vs. the dice.** "gold = column, blue = row" means "where new leviathans rise", but the dice are also used for other things (the Maelstrom, Rift Gate, the capsize roll). The word "Roll" appears in the top bar with "3+5" and no meaning. **Minor.** Fix: label the dice by purpose each time ("Monster wake roll: 8 -> they stir").
   **Status: Fixed: the dice are labelled 'Monster wake roll (two dice added together)'; the false 'gold = column, blue = row' text is gone (the engine only adds the dice).**

10. **Turn flow in the panel.** Four steps (Roll / Place / Sail / Draw) appear at the top. But "Place" is the only one I interact with, and "Roll" is done for me, so the roadmap suggests I do more. Between my turns the panel flashes "Watch the sea / Cobalt is thinking... / Skip animation" many times: eleven panel changes in two turns. **Minor.** Fix: explain "the computers play; you act in step 2" and speed up. Show one "Opponents" summary line, not a new card per opponent.
   **Status: Fixed: one stable 'Opponents' card (no new card per computer), a note 'you only act in step 2', faster result text.**

11. **"Not allowed while a safer placement exists" / "Place tile 1" greyed.** I did not know I was forbidden from a sinking move until I tried; the rule is only in the Rules drawer ("unless every placement does"). The button gives no hint what to do (use "Show the safest move"). The button is called "Set it up" in the guided game and "Show the safest move" in the normal game. **Major.** Fix: one name for the button, and put it directly under the error ("Try tile 2 turned 0 degrees: Show me"). Explain why the rule exists in one sentence.
   **Status: Fixed: one name everywhere ('Show me the safest move'), shown directly under the 'Not allowed: another tile is safer' line with the reason for the rule.**

12. **Tile hand labels "1 2 3".** Number badges only; no hint that these are the tiles to choose between (the panel heading says "lay a current"). The turn buttons "Left / Right" give no degree count. **Minor.** Fix: label "Your 3 tiles" and show the rotation (0/90/180/270).
   **Status: Fixed: 'Your 3 tiles' heading and 'turned 90 deg' label between Left and Right.**

13. **Expansions panel on a normal game.** The setup says "A portal tile that rescues a junk", but nothing says which expansions suit a first game or what "Deepwater Perils" means. Enabling them all starts the game with an unexplained "Choose: You drew a Deck Cannon. Keep it, or show it and discard it for a replacement?" prompt on an empty board with no start marks yet. The prompt shows Saffron selected (a computer) while the text says "You". **Major.** Fix: say who is being asked, delay the prompt until after the start marks, and explain what a Deck Cannon is the first time. Add "recommended for first game: none" in setup.
   **Status: Fixed: setup says 'recommended for a first game: none' and explains the four pieces; the Deck Cannon card names the right captain, explains the cannon and shows only to its owner. The engine asks it while dealing, before the start marks, so it cannot be delayed from the UI (reported in UI-REPORT).**

14. **Rogue Wave and Maelstrom on the board.** A semi-transparent band across row 6 and a blue medallion under column 2, plus a whirlpool tile, appeared with no label and no panel message. I could not tell they were the wave and the whirlpool, or that the whirlpool moves and destroys. The log said nothing at that moment. **Major.** Fix: label each piece with a floating tag ("Rogue Wave: row 6, strength 2"), announce arrival in a card, and show a threat zone.
   **Status: Fixed: floating labels 'Rogue Wave: row 6, strength 2', 'Maelstrom', 'Rift Gate' on the board, an announcement when each arrives, the highlighted band, and an 'On the board now' list in the Pieces drawer.**

15. **Deck Cannon.** When I had cannons the panel showed "Fire cannon at Krakenreach / Stormcoil / Krakenreach / Stormcoil" as four red buttons, listing each target twice (probably one per cannon). On a phone they pushed the tile picker off screen. I also did not know the cannon was optional. "Vermilion already holds two Deck Cannons and discards a third" appeared in the Log only. **Major.** Fix: one button per target, with "x2" if needed. Show the cannons in a separate row. Warn when a third cannon will be discarded.
   **Status: Fixed: one button per target ('Fire at X', with the count held), shown in its own optional row only when legal, a note about the two-cannon maximum.**

16. **Solo goal.** The setup says "One junk, six leviathans: outlast all ten." Ten what? The Rules say "outlast all ten leviathans", which only makes sense after reading the Leviathans section. During play nothing shows progress toward the win. The end screen says "Lost at sea / Nobody . The last junk went down." (stray space, "Nobody" with no name). **Major.** Fix: show a progress counter (e.g. "Leviathans left in pile: 4") in the top bar. Fix the end text. State the goal in the briefing ("Survive until the leviathan pile is empty").
   **Status: Fixed: top bar 'Still to rise N' and a goal line in solo, 'turn n of 24' in easy solo, the setup text states the goal; end text no longer says 'Nobody .'.**

17. **Header counters "Pile 50 / Leviathans 6 / Turn / Roll 3+5".** "Pile" is ambiguous (tile pile vs. leviathan pile). "Leviathans 6" counts monsters on the board but also falls (to 2, 3, 5) without a message when cannons or the maelstrom remove them. **Minor.** Fix: label them "Tiles left", "Monsters on board".
   **Status: Fixed: 'Tiles left' and 'Monsters on board' labels with tooltips.**

18. **Elimination feedback in multiplayer.** In the 4-player game two crews dropped out silently (crew chips turned grey and struck through; "Jade" lost her tile count). I only learned from the Log; the panel kept showing "Saffron is thinking...". Head-on collision at column 1 row 1 sank my junk and Cobalt's, with only "Cobalt lays a current at column 1, row 1." as the visible message. **Blocker (same as 7).** Fix: as in 7, a sinking card for every crew, not just me, and an "also sunk" line.
   **Status: Fixed: same Sunk! card and marker for every crew and for head-on collisions ('Both junks are out').**

19. **Interrupts.** The Rules say a human has a "short timer" for Rift Gate / Deck Cannon decisions out of turn. I never saw a timer, a countdown, or the chance to use the cannon in someone else's turn, so I could not check how clear it is. **Needs retest.** Fix: show a visible countdown and a "what would sink you" summary on the interrupt card.
   **Status: Fixed (retest in the p2p timeout run): a visible countdown text and bar on the interrupt card, 'If you do nothing, your junk sinks', the threatening leviathan lit on the board.**

20. **Mobile, 390x844: board too small.** The board is a tilted perspective box about 340 px wide in the top half; junks and tile lines are a few pixels across. The panel is a bottom sheet that scrolls: when a warning and fire buttons fill it, the tile picker and Left/Right buttons are scrolled out of view. Setup page: the Human/Computer toggle is clipped ("Compu"). **Major.** Fix: use a flatter, larger board on phones; pin the tile picker and Place button above the scrolling text; wrap the toggles.
   **Status: Fixed: flatter (top-down) larger board on phones (52% of the 390x844 screen, was 45%), the tile picker, Left/Right and Place are pinned at the top of the panel, setup toggles wrap.**

21. **Rules drawer.** It is accurate and has a good section order, but the first screen of the "How to play" text is long, and the "Our guesses (the published rules did not say)" section reads like developer notes, not like help. From the setup page the drawer text appears concatenated with the setup page contents. **Minor.** Fix: a short "How a round goes" card first, keep dev notes in a collapsed section, give the drawer its own scroll area.
   **Status: Fixed: 'How a round goes' first, our guesses collapsed, the drawer opens above the start screen with its own scroll.**

22. **Guide toggle.** "Guide: Full" looks like a label, not a switch; I did not know it was clickable. **Minor.** Fix: "Guide: Full (tap to turn down)".
   **Status: Fixed: 'Guide: Full (tap to turn down)' / 'Guide: Light (tap for lessons)'.**

## What works well

- The "Guided first game" button is the first and biggest button, and the guide cards arrive just when each rule matters: currents, edges, collisions, leviathans.
- The on-board ghost tile with a red/white glow, plus the red sentence "This tile sends you off the edge: Your junk would sink", does warn before placing.
- The "safest move" advisor with "N of M placements would sink you" is a useful number (it needs lookahead; see 5).
- The Log is complete and readable (every roll, every leviathan, every sinking). It is just not on the main surface.
- Computers play quickly, with "Skip animation" available.
- The Rules drawer is thorough and honest about what was invented.
- No console errors in any of the runs.
- Setup is easy to read on desktop. The expansions are separate checkboxes with one-line descriptions.
- Colour-coded crew chips, with the current player highlighted and eliminated crews struck through.
