# R109b re-check: kaiten-kitchen rows 4 and 5

- Commit checked: `9aa47cad43f9ab56970647306b9049eeb31bfe71` (shelf/W581-kaiten-strict, F7 head). Built with `--quick`: PASS, scenarios 9/9.
- Played with one-shot Playwright scripts: full games at 375x667 touch (2), 375x553 touch (1), 1366x768 mouse (1), 910x512 mouse (1), plus the 19-step tutorial at 375x667. 0 page errors, 0 stuck states, 0 dead taps. Following the bulb, 4 of 5 games were wins; the 910x512 game was a loss.
- No tracked file changed by the build (lab.html and scenarios.json untouched).

## Row 4, Turn clarity: **7** (was 6)
- Badge terms: the Goal card ("How you win") now has a legend line: "need N = N more scores a set; 1st +6 / tied 1st +3 = roll race; end +6 = custard; top 4 / behind = rank; grab 2 = Twin Sticks". Custard line now says "most cups wins 6, fewest loses 6 (3+ diners)".
- Bulb: read about 80 bulb texts over 4 games. "next best +N" was never larger than "+N now" (it becomes "sets up more" when the alternative is bigger). The buns text now says "up to five (15)". No self-contradiction seen.
- Tutorial step 3 ("Flip and pass") and step 8 ("Use the sticks"): exactly one bubble each, no dark tip on top. The first-time tip "Need 1: one more scores this set." appears only in real games, and sits over Odile's table, not over the hand labels.
- Whose turn: the green YOUR TURN bar, rival captions ("Kofi serves Crispy Prawn") and "Leftovers go to Odile" are clear.
- Why not higher: the legend shows once, on the Goal card, and is gone afterwards (no way back to it on the board). "dessert" (the ghost slot label) and "tied 2nd +1" are not in the legend. Wording such as "most this round scores 6: +3 now, next best +0" and "(sets up a later score)" stacked after a custard line is clumsy. The +N badges still invite taking the biggest number.

## Row 5, Phone and PC: **7** (was 6)
- Reveal at 375x667 and 375x553: the cream panel is gone. The reveal stage is dark, the board stays visible, the bar says "Picks are in / Covers lift one by one", and the three reveal cards show. The hand is hidden from the pick until the passed hand arrives (about 1.3 s). Judged acceptable: nothing is blank cream, the player is told what is happening, and there is nothing to tap in that moment anyway. For the first ~0.4 s the lower third is empty dark.
- Final table at 375x553: fits with no scrolling (no scrollable box; Play again / Menu below the table; all five "Where the points came from" rows visible).
- 375x667 and 375x553: no tap target under 44 px, no DOM text under 14 px, no page scroll, no console errors.
- 910x512 and 1366x768 by mouse: DOM text 13 px or more (the "Your turn" heading is now readable), no dead clicks, no page scroll, the table, side panel and hand use the width.
- Why not higher:
  1. 910x512, turn 1 of a 3-diner game (9 cards): the hand row is 626 px wide in a 610 px box, so the last card's right edge and its "+1" badge are clipped by about 6 px (it scrolls 16 px; the card is still tappable).
  2. At 375x553 neighbouring badges overlap ("end +6" half hidden by "tied 2nd +1").
  3. At 1366x768 the side-panel player boxes are large and mostly empty while the cards stay small.

## Repro for anything still under 7
Nothing is under 7. Nits for a later round:
1. 910x512 mouse, Quick game, turn 1: look at the right end of the hand (the 9th card's badge).
2. 375x553 touch, Quick game, a turn with many cards: look at the badge row on adjacent custard and roll cards.
3. Quick game: after "Got it" on the Goal card there is nowhere to re-read the badge legend ("dessert" is in none).

## Verdict: PASS (row 4 = 7, row 5 = 7)

Was it fun for you? Yes: it plays quickly and the choices are readable now, but I still mostly followed the bulb, so the fun is "pleasant and easy" more than "tense".
