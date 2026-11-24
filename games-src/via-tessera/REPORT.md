# NEW3 report: Via Tessera (via-tessera)

Roman-mosaic adaptation of the top-ranked Roman-era economic card game, for 2 players vs a computer opponent (Easy / Normal / Hard), plus hot-seat.
Branch `shelf/W562-new-mosaic`. Not deployed, no shelf card (the owner watches the video first).

## Gates
- `VIS_SLUGS="," build-all.py --quick via-tessera`: PASS (8/8 ?scn= scenarios on the final code).
- `build-all.py --full via-tessera`, run twice, each alone: PASS both (phone-check 6/6 sizes and rotations, LAB test, rules-test). games/lab.html not committed.
- `node rules-test.js`: 75 checks pass (component counts, one check per rule, 40-game gauntlet with invariants after every move).
- Balance: Normal vs Normal 17-23 over 40 games (seat 2 gets 6 coins + the Grand Governor tile, as in the original). Hint-follower vs Easy in the real page: 5 of 6 won; Normal beats Easy 8 of 12 in node.

## Rules and components
Identical to the original 2-player game: 7 starting cards each, market decks I and II (15 cards), all actions, costs, slot surcharges,
storehouse rule, Grand Governor (the original's tile that doubles the bonus good), Laurel (7-point end card), all six patron scorings,
30 city tokens by letter (A7 B8 C10 D5), 12 regions, 44 roads and 35 sea lanes. See rules-notes.md, COMPONENTS.md, RULES-CHECKLIST.md.
Nothing is simplified. Deviations and unknowns (orchestrator please note):
- [deviation] The original lists its Mediterranean map for 3-5 players and a smaller Italian map for 2-4. The brief asked for the Mediterranean map, so it is used at 2 players. The Italian map's topology was not found.
- [unverified] City-token mix per letter (only totals are published); coin side of the region bonus markers (only 1 or 2 coins seen; we use brick 1, grain 1, tools 2, wine 2, cloth 1).
- Optional beginner rule (intermediate scoring on the first Herald) not included.

## Assets (all free)
- 26 icons from game-icons.net by Delapouite, Lorc and Sbed, CC BY 3.0 (credited in the game's Credits and THIRD-PARTY.md).
- Mosaic map (canvas tesserae: sea, land, coasts, regions, Nile, border), cards, houses, pieces: our code art. Sounds: generated WebAudio.
- Fonts: Cinzel and Alegreya Sans (SIL OFL, shared shell fonts).

## Cold play (independent subagents with no knowledge of the build)
Round 1 found: rival score jumps unexplained, camera drifting during builds, wasted moves, buy-panel feedback, hint finger off target.
Fixed: rival turn recap line, steady camera, stops that allow a build show a house, "Need 1 brick" on unaffordable cards, finger re-placed after
the camera moves, score breakdown on tapping a score. Round 2 final verdict, as-is:

> I played one full game against the computer from "Learn to play", about 27 of my own turns. The rival won 151 to 80.
> Could I play a full turn without reading much? Mostly yes, after 2 or 3 turns. The loop is easy to learn: tap a card, tap "Play X", then tap one button. The Governor (produce or taxes), Trader ("Suggest" then "Trade") and Envoy ("Copy") turns are smooth. The Builder turn is the hard one.
> Fun: 3 out of 5. The mosaic map looks lovely and turns go fast. But I never felt in control of the score. The rival's score went up by 9 to 15 a turn and mine went up by 2 to 5, and I couldn't see why.
> Exciting moment: building two houses in one Builder turn, which gave me +8. Buying cards in the Patron shop also felt good, with a clear "Bought Reaper: it is in your hand" message.
> What confused me, worst first: 1. Scoring is hidden until the end. 2. The Builder turn: several times I moved and got "Nothing more to build". 3. The market counter ran down to 0 and the game ended with no warning. 4. "Taxes +0" was offered as my last move. 5. Herald quietly swaps my hand.
> After the first minute: about 8 dead taps and about 6 lost moments.
> Goal in one sentence: ship goods around an ancient map and build houses to collect cards whose symbols score at the end.
> Would I play again? Maybe once, to try to beat it.

After round 2 (not re-tested by a third tester): a "Points" button and a learn-mode tip open the live patron scores; the market counter warns
at 2 cards left and its label says the game ends at 0; Builder says why nothing can be built ("Need 1 brick to build" / "No new city next to
your pieces"); map taps during a move explain what to tap; the Herald says "Played cards back in hand". The fun score is 3/5 from a tester,
which is below the owner's bar: the scoring is the weak spot (patrons need to be felt during play, e.g. a live "this card is worth +6 now" tag).

## Proof
- games-src/via-tessera/proof/first-3-minutes.webm (375x667, a Learn game following the hints at human pace)
- games-src/via-tessera/proof/1-title.png, 2-first-turn.png, 3-building.png, 4-market.png
