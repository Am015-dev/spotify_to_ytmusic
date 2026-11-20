# [FIXED2 final-approach] report

I couldn't send this as a scheduled-task message because that permission was refused, so it is written here instead. The rules are unchanged; every fix is in UI or hints.

**Branch:** `shelf/W579-final-approach-strict`. The fixes are in commit 815412b2; this report is committed on top of it. `alex/brave-carson-rbpmlk` is merged in. Not deployed, no PR.

## Gates
All run from `games-src` with Playwright 1.63.0.

| Gate | Result |
|---|---|
| `build-all --quick` | PASS |
| `build-all --full`, run twice after the last change, each alone | PASS both times |
| `loops-test.js` | PASS: 0 infinite animations at 375x553 and 375x667; smallest space 44 and 45 px |
| `sweep.js 4` on its own | PASS |

Two `--full` runs failed earlier in this round, both in `sweep.js`:
- The first failed because the test expected slot previews only in hints mode. Previews in normal play are deliberate, so I updated that expectation. The altitude-text check also failed: my "Last round!" label replaced the "ft" text. The label now keeps it.
- A later run failed on warning lines longer than 8 words. I shortened them.

`games/lab.html` was restored after every run and is not committed. `px-test` was run but not checked: its output was unclear.

## Landing rate for a hint-follower
- **78 of 100** flights landed (`bench-land.js`, 100 games, quick game g1, normal partner).
- Losses: checks 15, spin 4, speed 2, mandatory 1.
- In every loss, the computer partner made the last placement.

## What changed
The code is in the files that own each function (`ui1`, `ui2`, `ui3`, `ui8`, `ui11`). The repo guard refuses any new layer file.

1. **Refused die.** The reason appears next to the finger, in 8 words or fewer, for example:
   - "Gear 5-6 needs 5 or 6, not 4." ("…: use coffee." when coffee can fix it)
   - "That is Ravi's space (orange)."
   - "Pick one of your blue dice first."
   - "Crash: too fast to stop. Tap again."
2. **Ownership.** Blue for you, orange for the co-pilot, everywhere:
   - each slot has an owner bar;
   - gear, flaps and brakes each sit in a group frame in the owner's colour;
   - the trays read "You · Pilot" and "Ravi · Co-pilot";
   - the goal card says who owns gear and who owns flaps, and the Gear and Flaps chips carry the owner's colour.
3. **Slots.**
   - Each group shows its word once ("Gear 1-2 · 3-4 · 5-6").
   - The slot label reads "Engines", not "Speed".
   - Previews of the result now show in normal play too, not only with hints: axis tilt, speed and spaces moved, radio, landing speed against the brakes.
   - A placement that would end the flight is marked with a red ✕ and needs a second tap.
4. **Calm.**
   - Pops play one at a time, after the plane moves. The altitude pop is gone, and coffee pops once per round.
   - Rings no longer pulse, and the Roll button no longer flashes.
   - The dashed outline shows only on the chosen die. Placed dice have a white ring.
5. **Round card and final screen.**
   - The round card sits below the banner and the altitude line and above the dock (checked at 375x667 and 375x553).
   - It opens only after the board stops moving. Its lines are shorter, with the stakes first.
   - The bottom line refits to two lines instead of being cut off.
   - The final screen says "Landed!" or "Crashed", gives the reason, shows "n / 6 landing checks", and has a ✓ or ✗ chip for each check.
6. **Bugs from the previous fixer.**
   - The goal card's boxes start empty.
   - Chips from an earlier round, including the last-round engine bubble, are cleared when the round or flight ends.
   - Chips no longer run past the screen edge.
   - Partner lines are shorter, so they are never cut off.
   - The hint button reads "Hint" on narrow screens when the coffee buttons are showing.
7. **Rising stakes.**
   - The altitude chip gets warmer in colour each round. In the last round it turns red and reads "Final".
   - Each new round plays a chime that rises in pitch, plus an alarm in the last round.
   - The round card's heading becomes "Last round: land it!".
8. **After the cold play.**
   - Both reroll taps now say what happened.
   - The reroll prompt names whose turn it is.
   - The radio preview shows in normal play.

## Cold-play verdict, as-is
An independent subagent played by touch only at 375x667: the tutorial plus 2 flights. This was before the fixes in item 8.

> **Could I play it? Mostly.** I finished the tutorial without trouble. In real flights I knew how to place dice, but not how to plan. I didn't see until round 5 or 6 that the flaps and most of the traffic were my crewmate's job, and by then neither of us could catch up. I used the Hint once, in flight 2, round 4, and it only lit up a Coffee space.
> **Fun: 3/5.** Best moment: last round of flight 2. I used coffee to turn a 1 into a 2, the axis preview changed from "1 right" to "level", and then "speed 10 · +2" popped up and we reached the airport.
> **Play again? Maybe.** The core puzzle is good, but I lost twice to a checklist item I never felt in control of.
> **Confusing:**
> - "Spend 1 of 2 rerolls?" did nothing on two taps; the button that worked was "Reroll token: 2".
> - With "Ravi's turn" showing I got "Tap dice to reroll, or keep"; after my first "Keep my dice" the reroll count dropped from 1 to 0 with no explanation, and I had to tap Keep twice.
> - In the final round I put a die on Radio: no message, and the plane stayed.
> - A tooltip at the left edge was cut to "…rs the plane ahead."; Ravi's log lines end in "…".
> - The refusal message was clear ("Gear 5-6 takes 5 or 6. Yours is 4. Coffee can fix it.") but covered the Axis/Engines area.
> - A lot happens on one screen; pop-ups sit on top of the dials.
> - Blue for me and orange for Ravi was clear.
> - Final screen: clear, "Crashed", the reason, and 6 ticks or crosses.
>
> **Flight 1:** crashed, "Landing failed: flaps not out", 4 of 6 checks.
> **Flight 2:** crashed, "Landing failed: planes still on the track", 4 of 6 checks.

## Still open
- Pops still appear over the dials.
- The refusal bubble can still cover the dials for up to 2.6 s; it is narrower now.
- No second cold play was run after the item 8 fixes.

## Proof
- `games-src/final-approach/proof/first-3-minutes.webm` (375x667, re-recorded this round); a smaller copy is `first-3-minutes-small.webm`.
- Cold-play screenshots, not committed: `/tmp/claude-0/cold/s102.png`, `s158.png`, `s192.png`.
