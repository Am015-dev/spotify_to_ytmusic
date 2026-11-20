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

# F2 fixer round (20 Nov 2026)

## What changed
1. Rival valley always visible. PC: every rival's valley sits live in a left panel with its score, landscape chips and cards; it plays its
   turn there with blue rings. Phone: the rival's turn shows its valley under a blue "Rival's valley · playing now" banner; tapping a
   rival's name opens it with a "Back to mine" button. Tap anywhere during the rival's turn to speed it up.
2. Live score chips (trees, mountains, fields, buildings, river/islands, animals, spirit) for you and the leading rival, always on screen.
   Every change flies "+N" from the hex into its chip with a reason ("Rival +5 buildings: 3 colours touch it", "+3 river: river 4 long").
3. End countdown once the end is about 3 turns away: "~3 turns left: Rival has 11 empty hexes. End at 2." Then "Last round! This is
   your final turn." Pouch end has its own line.
4. Card planning: every card shows "Fits now", "Needs N tokens" or "No room left". The card sheet says what is missing ("Needs 3 fields,
   1 trunk, 1 leaf: about 2 turns") and shows your valley with dashed hexes and "+1 field" labels; a held card does the same on the board.
   Risky cards say why and the button becomes "Invite anyway". A tap on a dashed hex says what to build there.
5. "Any order" beside your three tokens; "Tap a pocket: take all 3 tokens."
6. Easy rival keeps the game close: careful (it uses the strongest planner) when behind the best human, loose when ahead. Easy is now the
   default. Results add one line saying why you won or lost.
7. Rules: see rules-notes.md "Fixer F2". Solo suns settled from the official rulebook text (+1 side A, +2 no spirit, +1 groups spirit,
   +0 count spirit; the rulebook example is a test); 75 animal cubes added and asserted. Still unknowable: side B shape and hex counts,
   which spirit card carries which icon, each card as printed (and so the track-length mix), what happens if cubes run out.
8. PC (1366x768, 1920x1080, mouse): three columns, rivals left, your valley centre, your cards and the invite row right without tabs,
   text >= 12 px, no page scroll. Phone layout kept (text >= 11 px, taps >= 44 px).

## Balance (200 seeds, hint-follower = strongest planner vs Easy, 2 players)
Hint-follower wins 103, Easy 90, 7 ties (51.5%). Median margin +1, median gap 8 points, 62% of games within 10. Average 81-78.

## Gates
build-all --quick PASS (8/8 scenarios); --full PASS twice (phone-check 6/6 sizes and rotations, rules sweep). rules-test 82/82 full.
tut-check: tutorial completes with real taps. 0 infinite animations; text check: no text under 12 px on PC or 11 px on phone.

## Cold play (independent tester, no history; phone by touch + PC by mouse), verdict as-is
Could you play? Yes, both sessions, start to results. Phone tutorial was fine. Session 1 on the phone ended Rival 96, me 36 (default
setting). Session 2 on PC ended Rival 59, me 38 (I found no Easy option, so I used the default). Nothing crashed or got stuck.
Fun 3/5. The loop is pleasant: place a 3-tile set, settle animals, score. Pastel look and the pop-up "+N" score hints are lovely. But the
rival's animal scores snowballed (animals 52 vs my 10) and I never saw how to stop it.
Would you play again? Maybe once more, to learn animal cards properly. A newcomer losing 36-96 would probably not.
Understood why? Only partly. The results table and the line "Its animals beat yours by 42" helped. But I didn't see how an animal's big
score is earned, and I scored 0 buildings/fields in some games.
Confused: the tutorial doesn't teach choosing animal cards; tiny number rows and "N tokens away" cryptic; "Settle animals?" when nothing
can be settled; rival's turn about 8 s and not skippable; taps on dashed hexes silently did nothing; token order in the hand; "Can't build".
Phone vs PC: phone board small, End turn moved when a banner appeared. PC much better: rival's board left, cards right, all readable and clickable.
Most exciting: PC game tied 17-17 mid-game, then a jump to 38 with mountain peaks and a Butterfly.

Fixed after that verdict (once): the default was Normal, now the close-game Easy (the tester lost to Normal both times); tap to speed up
the rival; "All placed." only offers settling when an animal can move in; dashed-hex taps explain what to build; badges say "Needs N tokens"
/ "No room left"; the pockets/hand row keeps a fixed height so End turn no longer moves; the tutorial's card step says to pick cards that
fit ("Invite animals that need few tokens"). Not re-tested cold after these fixes. The 4/5 goal is not proven.

## Proof
proof/first-3-min.webm (375x667, final build), proof/1-title.png, 2-settle-animal.png, 3-animal-card.png, 4-results.png,
proof/pc-1366x768.png, proof/pc-1920x1080.png (script: pcshot.js).
