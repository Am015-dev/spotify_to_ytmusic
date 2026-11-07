# Lantern Dive: playable pass (W390, 7 Nov 2026)

Owner's own painted art and music kept as is (no art touched). Co-operative trick game: "the rival's turn" = each crewmate's card play.
Screens judged at 390x763 and 1440x860 as a first-time player (impeccable critique: hierarchy, clarity, feedback, copy, contrast).

## The 10 worst problems found, and what happened (before -> after)
| # | Problem (first minute) | Result |
|---|---|---|
| 1 | A crewmate's card just appeared; the only words were "Nerea is thinking…". No idea who did what. | FIXED: caption bar per play, ~0.9 s each ("Nerea plays Kelp 4"), tap the table/caption to speed up. |
| 2 | A trick ended with a sweep and a "+1"; why that diver won was never said. | FIXED: "Bram wins the trick with Kelp 9" + one plain reason ("Highest card of the led colour wins" / "The Lantern beats every colour"), shown 1.1 s, then "+1 trick" flies to the winner. |
| 3 | Jobs flipped to a green tick or red cross silently; a broken job loses the dive. | FIXED: caption "Job done: <job text>" / "Job broken: <job text>" with whose job it is and what happens next (1.3 s). |
| 4 | No turn banner; the top line was easy to miss. | FIXED: a pill on the table says "Your turn" (gold) or "Nerea's turn" at all times in play; the top line keeps the exact instruction ("You lead: play a card.") and stays under 2 lines. |
| 5 | Help bubble + pointing finger sat on top of the Rules drawer and hid the text. | FIXED: bubble and finger are hidden while a drawer is open (tutorial bubble unaffected). |
| 6 | Help opened with "The goal" paragraph, no quick how-to. | FIXED: Rules now open with "How a turn works" in 5 short lines. |
| 7 | Story map: title wrapped mid-word ("The Drow ned Road"), act banner text clipped. | FIXED: title no longer breaks words (17 px), banner 52 px tall. |
| 8 | Seat names (Nerea/Bram/Sumi) 2.9:1 contrast on the portrait plate. | FIXED: solid dark plate behind the name, 4.5:1+. |
| 9 | Hand: 13 cards in two overlapping rows, small corners. | PARTLY: cards 10 % bigger on phones (cap 62 -> 68 px). Cards are still fanned in two rows: a single row would hide values. Dim cards = blocked, glowing = legal (already there). Left as is, no scroll. |
| 10 | The tutorial said it covered every rule but taught no "Last" (look at the previous trick) and nothing about special dives. | PARTLY: "Last trick" is now two steps (21 steps in total). Special dives (hand-over, vote, volunteer, murky water, narcosis, clock, predictions, drone) are NOT in the tutorial: listed honestly in TUTORIAL-COVERAGE.md. |

Also fixed on the way: a tap outside an open popup closed it during the tutorial and left the "Close it" step stuck (popup outside-tap is ignored while the tutorial runs).

## Audit (games-src/scripts/ui-audit.spec.js on the staged build, A-F counts)
phone A1 B10 C0 D0 E0 F0; phone-s A1 B9 C0 D0 E0 F0; pc A18 B15 C0 D0 E0 F0. NOT zero, honest status: B are mostly measured on the rules/menu drawers and seat names;
by direct pixel check the seat-name plate is dark navy with white text (about 17:1) and the drawer is flat navy, so these look like audit-timing artefacts, but the audit does not agree and
I did not get to the bottom of it. pc A (text under 16 px on 1440 wide) is the shared drawer/menu text, not changed here. A1 on phone is the 12 px sub-line of the tutorial button in the Menu (shared kit). Left for the next pass.
The old `game/tutor-test.js` still reports the same 5 stale items as before this work (it expects "Tutorial ✓" in a title menu that no longer has that label, and a story-menu selector that moved); the new scripts above replace it for the tutorial-to-end proof.

## What was checked (all pass unless noted)
- `game/playable-tutorial-end.js`: fresh storage, tap the centre of every spotlit element, elementFromPoint must be the target, all 21 steps shown, end card, "done" remembered: 390x763 and 1440x860.
- `game/playable-play.js`: Quick game (Free play) and Story stage 1, played to the result sheet by touch taps on visible, uncovered UI only, 390x763, 0 console errors.
- `game/rules-test.js` 104/104; `build-all.py --quick lantern-dive` PASS (phone-check, 7 scenarios, sweep).
- Rules check (branch shelf/W384-rules-check, games-src/rules-check/lantern-dive.md): WRONG 0. MISSING 2: (a) the Commander may choose where the 2-player drone sits (low impact; needs a new choice UI, deferred); (b) the reminder card after a ping: the shown card already carries the ping token marker in the hand (`.rm`), so the memory aid exists in another form.
