# Redline Rally: playable pass (W395)

Owner bar: a first-time player on a phone (390x763) understands what to do in 60 seconds, and can finish the tutorial, a Quick game and Story chapter 1.
Method: screenshots of title, tutorial, first turn, rival turn, result at 390x763 and 1440x860 (`shoot.js`, `shoot-tut.js`), looked at as a newcomer.

## The 10 worst problems found, and what was done (before / after)
| # | Before | After |
|---|---|---|
| 1 | Nobody said whose turn it was; rivals' moves were a flash of cards with no owner | Banner on the board: "Your turn" / "<Rival>'s turn" with the car's colour; dock title names the mover |
| 2 | Instruction line was a status, not an instruction ("Pick 1 more card") | Plain words, <= 8 words: "Pick a gear, then tap 2 cards." then "Speed 5: the corner is safe. Press Go!" |
| 3 | Cards were bare numbers; stress was a "?" with no meaning | Every card: type label (Speed / Heat / Stress), big number or drawn flame, one-line effect ("move 4", "dead", "random"), colour per type; labels >= 13px |
| 4 | Gear dial was "Gear 1 2 3 4" with a tiny "-1" | Buttons say "2 cards", "-1 heat"; label "Gear" |
| 5 | Heat/engine was three jargon chips ("Engine / In hand / Stress in hand / Deck / Discard") | "Engine heat" as 6 drawn dots + number, and "Dead heat in hand"; deck/discard counts removed |
| 6 | Everything looked equally clickable | Cards you can still pick glow, full-hand leftovers dim, heat cards are dead, Go glows only when ready |
| 7 | Rival turn: positions jumped, one caption at the end | One car at a time: banner, shift, cooldown, cards flip face up (name above), boost, adrenaline, drive animation with "+N spaces", corner result pop ("Clean corner" / "-2 heat"), slipstream, spin, "<Rival> is now 2nd". 0.7-1 s per step; tap anywhere to speed up |
| 8 | Dock changed height between planning and watching (layout jump) | Panel keeps its height on phones |
| 9 | Tutorial was 7 steps and one round, no story | Prologue "The Sunline Seat": a real 30-space lap vs Kit and Juno, 6 chapters, 32 steps, Coach Mara reacts to every action; each chapter can be started on its own (Menu > Guide chapters); ends on the result screen |
| 10 | Help started with rule details; result was a bare podium; the player car was called "Kit Marlow" (same as the story rival) | Help opens with "How a turn works" in 5 lines; result has a story line in the game's voice; the player is "You" |

## Gate (this branch)
- `build-all.py --quick` PASS and `--full` PASS (rules-test with W391's rulebook cases, phone-check, scenarios).
- `tut-test.js`: all 32 tutorial steps by real taps on the spotlit element's centre (elementFromPoint checked), PASS at 390x763 and 1440x860.
- `play-test.js`: a Quick game and Story chapter 1 played to the result by taps on visible, uncovered UI only (390x763), PASS, 0 console errors.
- ui-audit (staged build, phone / phone-s / pc): A0 C0 D0 E0 F0 on all three; B1 on phone-s and pc (padlock emoji of the shared campaign kit), B2 on phone (same padlock + one "Slipstream" bold word in the Rules sheet that reads 3.0:1 only during the sheet slide-in; the screenshot of the settled sheet is dark text on parchment).

## Not done (honest)
- The optional "discard before drawing" step (engine function `discardOptional`, rulebook case) has no button in the UI yet.
- Spin out, two-cars-per-space pushback and Upgrades are explained in Rules but not played in the tutorial (see TUTORIAL-COVERAGE.md).
- Story chapters 2-9 intro/outro text is still the short original text in campaign.json; no loss-variant outros. Portraits are code-drawn initials.
- The "locked chapter" padlock emoji contrast comes from the shared campaign kit (read-only here).
