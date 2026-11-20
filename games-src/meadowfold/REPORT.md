# NEW6 meadowfold: report

Meadowfold: a paper-cut diorama adaptation of the recent top-ranked landscapes-and-animals game. Build tokens into rivers, peaks, trees,
fields and buildings, then settle animals whose habitats you shaped. Modes: vs computer (Easy/Normal/Hard, 1-3 rivals), solo (suns),
pass & play 2-4, board side A (river) or B (islands), spirit cards on/off, a guided 11-step tutorial. Not deployed, no shelf card.

## Rules and components
Identical to the original: 120 tokens (23/23/21/19/19/15), 5 pockets (solo 3), 32 animal cards with their exact habitats and tracks,
10 spirit cards, both board sides (23 and 25 hexes), every stacking rule, landscape scoring, end triggers, tie-break, solo with suns.
Nothing simplified. Digital conveniences only: undo inside your own turn, hint, score previews. See rules-notes.md, COMPONENTS.md, RULES-CHECKLIST.md.
[unverified]: mirror images (we allow rotation only), empty animal pile (row stays short), spirit cube in tie-break (not counted),
first player (you start), solo spirit sun bonus by kept spirit type, card data from a structured transcription (not checked against
printed art), side B column shape.

## Gates
- build-all --quick: PASS (8/8 scenarios). --full: PASS three times (phone-check 6/6 sizes and rotations, rules sweep).
- rules-test.js: 86/86 checks incl. a 24-game computer gauntlet (1-4 players, both sides, spirits; invariants after every move).
- scenario-mutate: 95% killed (behaviour 96%).
- tut-check.js: tutorial completes with real taps.
- Computer: Easy about 65 pts, Normal about 83, Hard about 85 per game (2-player self-play).

## Assets
All art is code-drawn SVG (paper layers, shadows, grain). Animal silhouettes: 42 icons from game-icons.net (Lorc, Delapouite,
Caro Asercion, Skoll), CC BY 3.0, credited in Menu > About, ASSETS.md and THIRD-PARTY.md. Sounds are WebAudio synth. Font: shelf Alegreya Sans (OFL).

## Cold play (independent tester, no build knowledge), final verdict as-is
Could you play? Yes. Nothing blocked me. Finished the 11-step tutorial, then a full Easy game. The game ended after 8 of my turns with no warning.
Was it fun? 3/5. Building a habitat and watching the animal move in feels good, and settling the same card again (tortoise 4 then 10,
newt 10 then 16) is a nice surprise. The "+2" previews help a lot. Downsides: the rival plays off-screen in about a second, so I never
saw its valley or felt pressure; the end came out of nowhere; the card art is tiny.
Confusing: tutorial end; buildings and fields scoring; a hint that named a card that did not glow; the ram icon; one animal per hex;
a rejected trunk stayed selected; the bar pushing the menu button; menu tab labels; Title screen without confirm.
Goal understood: partly (trees, mountains, rivers, animals yes; buildings and fields no). Result: tester won 54-41.

Fixed after that verdict: rival turn slower with a held recap ("Rival scored +11, settled Heron"), "Ending soon!" / "Last round!" warnings,
persistent hint outline, clearer ram, smaller score pills. Earlier fixes from the first tester (fun 3/5): token scoring tips in the
instruction line, reasons for rejected taps, steady selection, no automatic tab switch.
Not fixed (shared kit, not this game's files): menu tab labels overflowing ("Accessibility", "About").

## Proof
games-src/meadowfold/proof/first-3-min.webm (375x667), proof/1-title.png, 2-settle-animal.png, 3-animal-card.png, 4-results.png

# F1 fixer round (20 Nov 2026)

## Rules: the 7 [unverified] items
Settled, each with a rules-test assert: mirror images (all 42 habitats equal their own mirror image turned, so the rule never
changes a game), empty animal pile (row stays short), tie-break (spirit cube is not an animal cube), first player (table's choice; seat 1).
Still open: solo sun bonus by spirit type and the side A sun, card data vs printed art, side B shape. rules-test: 74/74 (full), 54/54 quick.

## The 5 reasons a person would still say no, and the fix
1. First 30 s: the title was a settings form and "Start game" sat below the fold at 375x667. Now: Learn to play + Play now, options folded.
2. Flat, pale look: small discs on white hexes, not a diorama. Now every token is a raised paper hex sheet; stacks lift sheet on sheet.
3. Cards unreadable, choice unclear: tiny habitat drawings. Now cards use the same colour sheets, bigger; "Fits now" on cards you can settle.
4. No payoff: a small "+4" pill. Now the animal hops out big and settles in, the card's new number pulses, and a finished card gets a banner.
5. Rival turn unreadable: valley swap plus a toast. Now blue rings mark each changed hex, a tinted "rival's turn" line, a held recap with
   where the points came from ("Rival +10: animals +6, trees +4").
Calm rules: the dashed ring animation is now 4 beats (no infinite animations), text >= 11 px, taps >= 44 px at 375x667 and 375x553.

## Cold play (independent tester, no history), verdict as-is
Could you play? Yes. Nothing blocked me. Fun 3/5: placing tokens and watching the score jump feels good; the rival's big jumps felt
unexplained; lost 52-56 on the last turn. Play again? Probably yes, once. Exciting moment: the rival settled two Herons in one turn and tied.
Confused: token order in the hand, end trigger, cards I could not build yet, field/building scoring, the rival's valley scoring.
Fixed after: the recap names where the rival's points came from, the end line says "Ends when a valley is full" / "Last round: a valley
is full", clearer field and building tips, steady score pills. (Not done: two text taps that failed were driver/label issues.)

## Proof
proof/first-3-min.webm (375x667, recorded before the tester's text fixes), proof/1-title.png, 2-settle-animal.png, 3-animal-card.png, 4-results.png
