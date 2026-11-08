# Vinegrave: reviewer R1 FAIL (8 Nov 03:00 UTC). Fix all, in order.
Scores: look 5, feel 5, aim 8, pop-ups 5, readable 4, words 4, playable 8, art 6, impeccable 5, design 5. feel-audit a13 b2 c31 d65 e3.
1. Deployed art is stale and mixed: run `python3 -I games-src/vinegrave/free-art/install.py --force` and commit games/vinegrave/media (one sepia scrapbook style).
2. Plays like a spreadsheet: 14 near-identical photo tiles in 3 rows split over Map/Market/Research tabs; no explorer pieces. Make ONE board: explorer pawns that move to sites, drag a card or pawn onto a glowing site, the play resolves on the board (no "Play it" bottom sheet as the main way).
3. Words: Learn ends on a ~170-word wall: max 3 short lines. "Tamsin edged it" after a 3-14 loss is wrong. "Turn over: you used your one action" during your own turn. Site sheet "pays with 2 coins (plane) · No goods now: it sets up later turns" -> plain table talk. 31 lines over 12 words.
4. Phone: 65 texts under 14px; names/rules cut off ("Creeping D…"); icon-soup rows ("2 ◎ 0 ⊕ 0 ▤ ...") -> words + big numbers ("2 coins").
5. Pop-ups: two messages at once in Learn; Learn bubble shows in Play with Hints off on fresh storage; 3 overlaps in market rules text after 10 turns.
6. End screen is an 8-row table: count up big numbers per category with icons, winner first.
7. PC: market row cut off at the bottom; research track tiny icons over a murky photo.
8. Title (phone): only Learn to play / Play / Story; settings behind one button.
Shots: games-src/vinegrave/playable-shots/review/r1-*.png
