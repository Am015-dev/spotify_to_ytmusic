# Final Approach: newcomer review (frozen build)

Played as a first-timer on a phone (390x763 portrait, also 375x553 and 844x390 landscape) and on a 1366x768 desktop. I flew the guided first flight (won), a Foxmere flight as Pilot with the computer (won), a Seabright Bay flight as Co-pilot (lost on speed), a random-placement flight (lost in round 1) and two hot-seat rounds.
Screenshots are in `/tmp/claude-0/-home-user-spotify-to-ytmusic/5a36d2af-8697-5203-aeea-a0f2a3329615/scratchpad/review-fa/` (written `R/` below).

## Problems, worst first

1. **Mandatory slots are unmarked and nothing stops an instant loss.** I put all four of my dice on gear, axis, brakes and concentration, left the Engines empty, and the flight ended in round 1 with "An engine die was missing at the end of the round" (`R/n06-end.png`).
   - Nothing warned me when my last die was the only thing that could still fill an empty Engines or Axis slot.
   - The result card then shows five red crosses (no planes left, gear, flaps, axis, speed) that are irrelevant to a round-1 loss, and it never says whose die was missing.
   - Fix:
     - When the dice you hold equal the empty mandatory slots, grey out every other slot and say "Keep this die for the Engines".
     - Pulse the empty Engines/Axis slots when you have one or two dice left.
     - Show only the checklist rows that apply, and name the seat in the loss line.

2. **Control slots are unlabelled except gear, flaps and brakes** (`R/g03.png`, `R/g09.png`).
   - Axis, Engines, Radio and Concentration are bare blue, orange or grey squares.
   - The only way to learn which is which is the hidden accessibility label, or the "Fits: Axis, Engines, Radio…" list after selecting a die. That list names slots but does not say where they are.
   - The tip sheets explain each control but never highlight it (`R/g06.png`, `R/g07.png`).
   - Fix:
     - Print small captions inside or under each slot ("AXIS", "ENGINE", "RADIO", "COFFEE").
     - Add a one-line "what this die will do" under the selected die, for example "Engines: 4 + ? against markers 5 | 8".
     - Have each guided tip pulse its control.
     - Add a long-press tooltip on slots for touch.

3. **The altitude-track labels overlap on a phone (confirmed)** (`R/g03.png`, `R/s01-title.png`).
   - They read "6000 Pi5000 Co4000 Pi…", with each label colliding with the next.
   - "Pi" and "Co" are never explained, and "first:" is missing (desktop shows "first: Pi" in `R/d04b.png`).
   - At 844x390 the labels are fine; the desktop view also has "APPROACH", "ALTITUDE" and a landing checklist that the phone lacks.
   - Fix:
     - Show only the current altitude and "You place first" or "Ravi places first".
     - Drop the full seven-label strip on narrow screens, or make it a compact seven-dot strip.
     - Spell out "Pilot" and "Co-pilot", or use the blue and orange avatar icons.

4. **The guided tip sheet covers the thing it is explaining.**
   - At 390x763 it takes about 40% of the screen. It hides the briefing phrases, the Roll button, the dice tray, Reroll and Hint, and the pilot and co-pilot cards (`R/g03.png`, `R/g05.png`).
   - At 375x553 it covers the dice tray entirely (`R/s07.png`).
   - In landscape the tip text is clipped and needs scrolling (`R/l03-guided.png`).
   - Fix:
     - Make tips a one- or two-line banner above the dock, with a "More" link.
     - Never overlap the tray.
     - Use shorter copy.

5. **The briefing and dock are cramped on small phones.**
   - At 375x553 only a sliver of the dock is visible. The "Fits: …" text, coffee buttons and hint are below the fold with no scroll cue (`R/s09.png`, `R/s10-sel.png`).
   - At 390x763 the coffee buttons wrap and are cut off by the Reroll/Hint bar (`R/g21-coffee.png`, `R/g26.png`).
   - The briefing phrase list (14 buttons) is mostly hidden, and the Hint toast covers the Reroll/Hint buttons (`R/g19b-hint.png`).
   - Fix:
     - Make the dock scrollable with a fade and a "more" arrow.
     - Move Reroll/Hint into the header, or make the bar sticky above the content.
     - Give coffee a single-row stepper (- / value / +).
     - Show the "Fits" line first.

6. **The Busy Sky traffic-die icons are invisible.** At Foxmere and Seabright Bay the DOM icon (⚄) has opacity 0 and is not redrawn in the canvas layer (`R/f04-track.png`, the CSS rule `html.fapx .sp .tf{opacity:0}`).
   - Players cannot see which spaces roll the traffic die, so planes appear unexplained.
   - Fix: draw the icons in the Pixi layer, or exclude `.tf` and `.tb` from the opacity rule.

7. **The crash screen's "Look at the panel" shows nothing** (`R/n07-panel.png`). After a loss the crash backdrop covers the panel: only text labels remain and the slots and dice are gone, so you cannot see what went wrong.
   - Fix: fade the crash layer out when that button is pressed.

8. **The computer partner's actions are silent and fast.** Its placements resolve instantly with no animation or banner.
   - The only record is the Log drawer, which is newest-first and not auto-shown (`R/g17-log.png`).
   - It spends the reroll token mid-round and then asks you to "Confirm reroll (none)" when you have no dice left (`R/g27.png`). The status line is truncated: "tap the dice you want to reroll (none is fine…".
   - Its radio use was sensible, but I could only tell by reading the log.
   - Fix:
     - Add a toast per computer action ("Ravi: 4 on Radio, clears space 5") and a short pause.
     - Auto-skip the reroll prompt when you have no unplaced dice.
     - Let the status line wrap.

9. **Round resolution is invisible.** The round ended and reset instantly with no summary of axis result, plane movement or collisions.
   - The plane jumps while you are still placing: after both engine dice are down the marker moves at once (`R/g13.png`). That is faithful to the real game but not explained.
   - Fix: add an end-of-round recap card ("Axis: 5 v 3 tilts 2 right. Speed 7: moved 1 space").

10. **Hot-seat needs a pass screen for every single die.** I tapped 18 pass screens in the first two rounds (`R/h04_pass2.png`). The Port Alder intro card also stacks over the first pass card (`R/h01.png`).
    - Fix:
      - Offer a "friends at the same table" mode where your dice are covered by a hold-to-peek tray instead of a full-screen pass.
      - Batch consecutive turns.
      - Show the intro card before the pass card.

11. **Other panel clutter.**
    - "markers 4 | 8" sits on top of the dial needle and wraps in landscape (`R/l05.png`).
    - "▲ you" overlaps the plane token.
    - The "Airport ▲ you" label collides with the token (`R/g23.png`).
    - The "CO-PILOT" label overlaps the coffee tokens (`R/c03.png`).
    - The Tight Corridor tabs ("L1 C", "L2 L1 C") sit on top of plane tokens and are never explained (`R/c03.png`, `R/c04.png`).
    - The leftmost slot (Radio) has its glow clipped at the screen edge (`R/g14.png`).
    - Fix: give each readout its own non-overlapping row, and explain L1/L2/C in the intro card.

12. **The scenario picker says "no extras" for Foxmere and Seabright Bay**, but the rules drawer and the intro card list Busy Sky and Tight Corridor (`R/d03-guided.png`). Fix: use the same module list in both places.

13. **Rules and wording mismatches.**
    - The engine tip says "moving past a space that still holds a plane is a collision". The rules drawer says leaving a space that holds a plane (`R/g08_*.png`). Make the tip say "leaving".
    - The last-round brake check is "no more than" in the drawer and win card, but the Icy Runway text says "stay under the marker". Check this is intended (the original uses strictly less).
    - The crew is called Ravi in tips and "Okoro" in the briefing log and setup card; Marlow and Ines have the same split.
    - The "Reroll (1)" and "Hint" buttons are never explained before first use.
    - The Pi/Co labels and the "×1" reroll icon are unexplained.

14. **A small coffee preview bug.** After picking a coffee modifier the die still shows its old face; only the header says "Die 4 → 6" (`R/g26.png`).

15. **Guided tips never mention the Hint button.** A newcomer wins the guided flight by following Hint blindly and learns little. The step-by-step tips arrive after the event they describe: "The altitude track" tip appeared after round 1.

## The five things that most need fixing

1. The unlabelled slots (items 2 and 1): label Axis, Engines, Radio and Concentration, add a "what this die will do" line, and warn when a mandatory slot is about to be missed.
2. The mobile altitude track and status layout (items 3 and 11).
3. The tip sheet and dock covering the tray, and the coffee/hint clipping (items 4 and 5).
4. The invisible traffic-die icons and the empty "Look at the panel" screen (items 6 and 7).
5. The silent partner and round resolution, plus the hot-seat pass spam (items 8, 9 and 10).

## The three best things

1. **The result card.** It gives a green/red checklist of every landing condition and plain language for why you lost ("Too fast: speed 3 is above the brakes (2)"), plus Fly again, Next airport and Look at the panel (`R/g28.png`, `R/c05-end.png`).
2. **Selecting a die lists where it fits** ("Fits: Axis, Engines, Radio, Landing gear 2, Concentration"), glows the legal slots, and gives an explained error when you misplace one. Hint says why ("A 2 on the radio clears a plane on space 3").
3. **The guided flight, setup, intro cards and hot-seat pass screen.** The pass screen is clean, the intro card lists the day's extra rules, and the tip text is clear apart from its placement. The painted art and the desktop layout are clear: the desktop panel has the track labels, "first: Pi" and a live landing checklist.
