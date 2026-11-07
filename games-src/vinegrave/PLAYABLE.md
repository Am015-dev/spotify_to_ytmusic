# Vinegrave: playable by a first-time human (W378, 7 Nov 2026)

Method: fresh-storage screenshots at 390x763 and 1440x860 (title, tutorial steps 1-3, end card, first turn, inspector, the rival's turn
in 4 frames 0.7 s apart, result), looked at as a newcomer, impeccable critique heuristics (visibility of system status, match with
the real world, recognition over recall, one thing at a time). Benchmarks: games/cauldron-fair and games/hollowbough (turn banner,
plain one-line instruction, a caption per rival move).

## The 10 worst problems (before)

| # | Problem (as a newcomer sees it) | Where |
|--:|---|---|
| 1 | The rival's turn is invisible: after 0.65 s its whole move is applied in one frame; the dock still says "Your turn" while a toast reports "Tamsin Reed buys Dented Canteen". You cannot see what changed or where. | rival turn, phone + pc |
| 2 | No turn banner: nothing says whose turn it is when the turn changes; "Your turn" is a small grey label. | every turn |
| 3 | The instruction line says "Pick one action: tap a glowing thing." It never says which things or what they do. | dock |
| 4 | Almost everything glows at once (5 camp sites, 3 hand cards, the market, the track) and nothing dims, so there is no focus. | first turn |
| 5 | After your own move nothing explains the result: resources change silently in a chip row, points change silently in the strip. No "+1 compass" or "+3 points: idol" pop. | after every action |
| 6 | Phone hand and market cards show no names: a cost chip, a travel icon, a temp glyph (boot / coin / compass) and tiny effect icons. "1 [compass]" under a boot means nothing. | phone hand + market |
| 7 | Phone map rows have no labels: three rows of icon boxes ("[boot][boot] 3 [compass]") with no hint that the bottom row is where you dig and the upper rows are ruins you discover with compasses. | phone map |
| 8 | The tutorial is 14 steps and 7 of them are read-and-press-Next pages (goal, watch, guardian, idol, research, fleeing, end) with 25-30 word texts; the first step is a wall of text over a dimmed board. | tutorial |
| 9 | Help opens on the full rules; there is no short "how a turn works" first. | help / rules drawer |
| 10 | Result table: the third column header is cut to "Dr", no line says by how much you won or lost, and the rows (Research, Temple tiles, Card points) are not explained. | result |

## After (re-shot at the same sizes, critiqued again)

| # | Status | What changed (files) |
|--:|---|---|
| 1 | Fixed | Rival turns run in steps (ui2.js aiStep): dock title "Tamsin Reed's turn", a caption of the move ("Tamsin sends an explorer to Lookout Cliff to dig."), the target pulses orange for 0.9 s, then the move is applied with its animation and a pop, and the result stays 1 s before the next step. Tap anywhere on the board to speed up (turnWait/speedUp). |
| 2 | Fixed | Turn banner (#tbanner) "Your turn" / "Tamsin Reed's turn" for 1.1 s every time the turn changes; the dock title is bold and coloured on your turn. |
| 3 | Fixed | The instruction line names the real choices now: "One action: play a card, go to a site or buy a card. Tap what glows." (built from the legal moves, at most 2 lines). After your move it shows what you did. |
| 4 | Fixed | On your turn every non-legal site, card and the track turns grey (grayscale, no opacity, so text keeps its contrast); only legal targets glow. |
| 5 | Fixed | After every move (yours and the rival's): the card glides to where it goes (380 ms), sites/track bounce (420 ms), then a pop says what it gave, e.g. "+1 coin +1 compass" and "+3 points: idol" / "-1 point: Dread card". |
| 6 | Fixed | Phone cards show their name at 13 px on a solid backing (2-3 lines, long words split with a soft hyphen); the squashed picture is hidden on phone (slot kept for real art; PC keeps it). PC cards add a plain one-line effect ("Gain 1 compass.") on a solid backing. Tapping still opens the big card. |
| 7 | Fixed | Every map row has a label on phone and PC: "Camp: dig here for goods", "Ruins: explore for 3 compasses", "Deep ruins: explore for 6 compasses". |
| 8 | Fixed | The tutorial is now the story's prologue (ADDENDUM 1 + 3): a real 2-round game to the final count, in 17 steps, each one a real action (play, discover, set an idol in a shrine, overcome the guardian, use its boon, buy, pass, dig, pass, then the count). Pell gives a reason in every bubble and reacts to the last move. Texts are about 2 lines, with no "tap here" wording. Ends on the result screen, then a card whose button starts a real game. tut-test.js checks every step was shown. Coverage: TUTORIAL-COVERAGE.md. |
| 9 | Fixed | Rules / How to play open with "How a turn works" in 5 short lines; the full rules sit behind "Show all the rules". The help cards start with the same summary. |
| 10 | Fixed | Result: column headers use the first real name word (no "Dr"), the line says the margin ("You scored 32: 26 short." / "You won by 9."), rows say what they count ("Idols (3 each)", "Dread (-1 each)"). |

Toasts now sit above the dock, so they never cover the instruction line.

## Gate (final build)
- `VIS_SLUGS="," build-all.py --quick vinegrave`: PASS (8/8 scenarios incl. the menu walker).
- rules-test 200 AI games PASS; smoke phone + pc PASS (0 errors); playtest.js both PASS (its tutorial check now expects >= 7 steps).
- tut-test.js (fresh storage, taps each spotlit centre, elementFromPoint is the target, end card starts a real game): PASS 390x763 and 1440x860, 7 steps, 0 errors.
- tap-play.js (taps only on visible, uncovered UI; rivals sped up by tapping the board) at 390x763: Quick game to the result PASS (154 s), Story stage 1 from title -> Story -> map -> stage to the result PASS (96 s, won), 0 console/page errors.
- ui-audit (staged build, local server): phone A0 B0 C0 D0 E0 F0; pc A0 B0 C0 D0 E0 F0; phone-s A0 B1 C0 D0 E0 F0.
  The phone-s B1 is "Master volume" inside the shared Menu drawer (gx-kit), scrolled out of view at 375x553; the audit clamps a scrolled-out
  text box to the drawer edge (same cause as the R4 note). Shared kit / audit spec, not this folder.

## Addenda (orchestrator, 7 Nov)
- ADDENDUM 1: the tutorial is a real guided game. Rules done in play are ticked in TUTORIAL-COVERAGE.md; 9 rules are explained but not played (listed there honestly). Resuming part-way is not possible: the shared tutor kit only offers Restart.
- ADDENDUM 2: rules-check fixed 2/2 (WRONG 1: a Boat pays a Boot; MISSING 1: empty shrine slots score 1/1/1/2). Each has rules-test cases named after the item. The 5 SIMPLIFIED items are listed in the rules drawer under "Simplified on purpose".
- ADDENDUM 3: STORY.md (cast, 3 acts). The prologue text is in V.STORY (src/data.js). Every Story chapter now has a win and a loss line. Quick games open with a flavour line and end with a result line in the game's voice. The final count climbs.

- Free CC0 art kit (orchestrator, 21:37): merged and installed (170 pictures), and every gate re-run with it. Desktop card pictures show in full, with the effect line under the picture instead of over it. The kit's Boot, Jeep, Plane, arrowhead and jewel icons are the same blank hexagon, less clear than the code-drawn shapes, so those 5 slots keep the code glyph (WEAK_ART in src/ui1.js; delete an entry when real art arrives). Phone cards still hide the card picture: it would be about 50x14 px there. The name is clearer, and a tap shows the big card with its picture. Solid backings were added behind the track numbers, site names and row labels that now sit over art.

## Phone layout redo (owner bug report 21:53: "tiny everything, very badly organised")
Before: map, market row, research track, hand and dock all on one 390x763 screen. Market cards were 58 px wide with icon-only effects, the track was a 56 px strip, and hand cards were 66 px (shot: playable-shots/layout-before-phone.webp).
After (playable-shots/layout-after-{map,row,track}-phone.webp):
- ONE big area at a time behind three 44 px tabs: **Map** (the default: sites fill the width, row labels on solid backing), **Market** (6 cards in a 3x2 grid, each about 120 px wide with name, picture and the plain effect in words), **Research** (full-width track with each row's cost and a one-line "how it works").
  A gold dot marks a tab that holds something you can do now.
- Your hand is a bottom tray: each card is 31% of the screen wide (more than 30%), showing its name, picture and plain effect. Swipe for the rest; tap a card for the big view.
- Rival turns open the tab their move happens in (e.g. Market when Tamsin buys), then go back to the Map when your turn starts. Each tutorial step opens the tab its target is in.
- Phone base text 14 px (cards, labels, chips); tabs, explorer chips, Pass and tags are at least 44 px tall. The instruction stays at most 2 lines.
- Gate: build-all --quick PASS (the scenarios now open the Market / Research tab before checking). Tutorial-to-end PASS at 390x763 and 1440x860 (17 steps). Quick game by UI taps PASS at 390x763 (the tapper also uses the tabs). Smoke PASS. qa-bot phone: 0 blockers, 1 major, 27 minors (before: 0 / 0 / 48). The one major is "stuck overlay without any button: div#iscrim" in the fuzz phase on tutorial step 2 (screenshot: big card open, "Play it" spotlit and tappable, Skip tutorial visible). qa-bot's own report filter (STALE in qa-bot.js) drops stuck-overlay findings on a scrim as a bot artefact; it is not a soft lock.

## ADDENDUM 4: a coached first game, not tap-tap
- The tutorial is a real 2-round game against the real computer (easy). It has only 2 forced steps (Trail Notes, Play it); after that every legal move is allowed and the tutor draws nothing over the board.
- Pell speaks just in time, in one non-blocking bubble with a ×. He explains a rule the first time it becomes an option or happens, comments on 2 of your moves (good move / tip, from the hard AI's reasoning), and explains the rival's first move and first pass.
- After the game: 3 steps walk through the final scoring with your real numbers. The end card lists "Things you'll meet later" for every rule that did not come up, then starts a real game.
- tut-test.js plays the coached game through the UI with free legal choices and asserts every rule id was explained in play or listed on the end card. Run: phone 17/27 explained in play, pc 14/27, the rest listed. Coverage table: TUTORIAL-COVERAGE.md.

## Remaining
- Phone market cards still show effects as icons (no room for a sentence at 58 px); the name is readable and a tap opens the full text.
- The vp badge on a phone market card can touch the cost icon on 4-coin cards.
- Painted art is still owner work; temp glyphs are hidden on phone cards.
