# Hollowbough: clarity report (Oct 2026)

Preview: `games/hollowbough-next/index.html` (built from `game/`, copyright-stamped). The live file `games/hollowbough/index.html` was not touched.
Method: blind newcomer playtests on a 390x763 phone through `games-src/scripts/drive-serve.js`. Each tester was a fresh agent with no repo access. In each round, one "casual" tester played the guided game and one "impatient" tester skipped the guide and played vs computer (normal). Full logs are in `playtest/`, and the tester brief is in `playtest/TESTER-BRIEF.md`.

## Scores

| Round | Build | Casual (guided) | Impatient (vs normal) | Average | Could explain goal + round | Unexplained point changes |
|---|---|---|---|---|---|---|
| 1 (before) | preview as found | 3.3 (won 52–13) | 3.5 (won 48–36) | **3.40** | yes / yes | many: every rival jump, every bonus, "You prepares" |
| 2 | first fix batch | 3.4 (won 56–36) | 3.5 (won 46–27) | **3.45** | yes / yes | 1 own −1 at a season change (fixed after the round) |
| 3 | second fix batch | 3.3 (tie 38–38) | 3.5 (won 48–43) | **3.40** | yes / yes | own changes: none reported; rival changes were in "Since your turn" |

The target of 3.5 average was **not met** after the 3 allowed rounds. This is the best version, shipped with the notes below. All six testers could explain the goal and a round, and all six could say where their points came from. The round-3 games were close (a tie, and 48–43), where round 1 was a 52–13 rout.

## What testers hit before (round 1)

- **Effects with no cause.**
  - Scores jumped (6→9, 29→46, 13→18→36) or dropped (13→11) with no message.
  - Bonuses on purple cards and Long Road points were invisible until the end screen.
  - The log said "You prepares", "You places", "You wins".
- **Pass looked like the main action.** It was the big green button from turn 1, while the tip said to place a worker.
- **Things were hidden on the phone.**
  - The "Since your turn" strip pushed the hand off the bottom.
  - The hand and city rows ran off the right edge.
  - The Continue button covered the score total on the final card.
  - Choice grids ran below the fold.
- **Wrong prompt.** In the last season it said "Prepare for the end", but Prepare was greyed out.
- **No board legend.** The top rows were icon-only, and "109 / 0 / 2-5", flags and stars were never explained.
- **No stakes.** The guided ("easy") rival raced through the seasons, passed at 13 points, and the game became a blowout. In node, easy averaged 19.5 against normal's 48.1 and won 0 of 12.
- **Weak hints.** The Hint reason repeated the place text, and decision hints used names that are not ours.

## What changed

Rules are unchanged. The engine changed in two places only: the wording of its log text, and the easy computer's choices.

1. **Bugs, each with a failing test first:**
   - log grammar for "You" (`rules-test.js`);
   - the "Prepare for the end" prompt;
   - the Continue button covering the score total;
   - Pass as the main button;
   - our own names in decision hints (`clarity-test.js`);
   - a crash when tapping event tiles that I introduced mid-round and caught with a new tile test.
2. **Cause → effect.**
   - Every point change for every seat is explained ("Bramble +5 ★: Long Road", "+3 Goodwife Vole bonus", "−2 Hoard Cellar left the city"). These lines go in "Since your turn".
   - Your own moves show a banner with what you got: resources, cards, workers, points with causes, and rivals you hit.
   - The season-change card shows what Preparing gave you.
   - `clarity-test.js` plays a full game and checks that every point change has a cause.
3. **Score race always visible.** The top bar shows "★14 You / ★11 Bramble", with ✓ for players who have passed. The pass log line says the player takes no more turns.
4. **One thing at a time on phones.**
   - Hand and City are two tabs instead of two stacked strips.
   - Card sizes are computed so a full hand of 8 fits at 390px.
   - The "Since your turn" line is cut to whole words.
   - Card sheets use the whole dock.
   - Long sheets show "▼ more below".
   - Decision sheets show your resources and hand.
   - Choices keep their place between picks, so a card no longer slides under your finger, and Done comes first.
   - Long Road spots are in a 2×2 grid.
5. **Plain words.**
   - A one-card board map ("How to win") appears at the start of every non-guided game.
   - The guided game shows the same map.
   - Clearer prompts, plus hand-full warnings on draw places and on Summer.
6. **Trustworthy suggestions.**
   - Hint now says which hand or meadow cards a move makes affordable ("Then you can pay for Brother Moss, Hostler Hedgehog").
   - Suggestions appear by themselves only in your first two seasons. After that they appear when you press Hint, so later decisions are yours.
   - The city tab shows ★ and opens when the suggestion is in your city.
7. **Stakes and pace.**
   - Easy now plays like normal with noise most turns, instead of rushing the seasons. In the gauntlet it wins 22.5% against normal, averaging 31 to 41.
   - In the guided game, effects that fire together resolve in the helper's order instead of asking every time.
   - Pass stays quiet until it is the sensible move.

## What is still weak (honest)

- **The board is a dense icon grid.** All six testers named it. Tapping a tile explains it, and the map card helps, but there are no words on the tiles. 13px labels do not fit at 46px tiles. The real fix is a board redesign or larger tiles in portrait.
- **Fun is about 3.4.**
  - Casual testers said they followed the suggestions more than they decided. Auto-suggestions are now limited to the first two seasons.
  - Autumn production asks for an order card by card in normal games.
  - Effects that do nothing (a draw with a full hand) still give no message.
- **Possible rules question (not changed).** Echo Mole copying a rival's Reedpunt Toad counts the rival's Bramble Allotments (the engine passes the copied card's owner), so it gave 0 twigs to a tester who owned 2 Allotments. `rules-notes.md` does not settle this, so I left the rules alone. It needs a ruling.
- **The helper sometimes suggests weak moves:** a draw place with a full hand, or a 0-point last city card.
- **Driver limit.** The test driver cannot scroll. Some "unreachable" reports in rounds 2–3 were sheets that scroll, now marked "more below".

## Tests (final build)

See the table at the end of this file, filled in from the final run.
