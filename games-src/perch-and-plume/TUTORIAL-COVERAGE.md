# Perch & Plume: tutorial coverage (guided first game)

The tutorial is one short real game: 1 round of 4 turns against Pip, then the score, then a real game. Every core rule is taught
in order, one step at a time. Each step is one sentence of 12 words or fewer (Aunt Ottilie's bubble, `src/story.js` `STORY.coach`)
and one highlighted thing to tap (`.tutpoint`). While a step waits, taps elsewhere are blocked and the target pulses. There is no
"learn later" list: every rule below comes up in every run, because the board, hand, food and feeder are fixed (`src/tutor.js`):
- 2 forest birds already placed: a tuck-and-draw bird (right) and a store-food bird (left), so the forest chain shows right to left;
- 1 grassland bird with 1 egg, so the first bird costs 1 egg in space 2;
- the first bird in hand is a grassland bird with a white (when played) power and a 1-food cost you can pay;
- a pink "lay an egg when someone lays eggs" bird on Pip's board.

Proof: `tests/tutorial-end.js phone|small|pc` taps only the highlighted target of each step and checks every step below appears,
in this order, with one sentence of 12 words or fewer and exactly one highlight, then that the last tap starts a real game.

## Steps (rule id = the step; logic: `src/coach.js` TSTEPS)
2. step `play` (one step, four taps, one sentence each): play a bird (Play a bird), the bird's food cost, the leftmost empty space, spaces 2-3 cost 1 egg and 4-5 cost 2 (tap Play).
3. step `white`: a white power works once, when played (tap the new bird).
4. step `food` (two sub-lines): get food, the forest takes feeder dice, one die = one food, more forest birds = more food (tap Get food, then two dice).
5. step `tuck`: brown powers fire right to left; tuck a card (tap a hand card).
6. step `cache`: tucked cards and stored food are 1 point each (tap the forest row).
7. step `twofor1`: any 2 food pay for 1; some spaces trade food for an egg (tap the food).
8. step `eggs` (two sub-lines): lay eggs in the grassland; each egg is 1 point, up to the nest limit (tap Lay eggs, then a bird per egg).
9. step `pink`: pink powers react between turns (tap Pip's chip after Pip's bird laid an egg).
10. step `cards` (two sub-lines): draw birds in the wetland; tray or deck, the tray refills after the turn (tap Draw birds, then a tray card).
11. step `final`: final score = birds + eggs + round goal + bonus card + stored food + tucked cards; tie = most food left (tap the total).
12. step `real`: a real game keeps 5 cards, then 8, 7, 6, 5 actions per round; start it (tap Play again).

Covered by the in-game instruction bar instead of a step (they depend on dice luck in a real game): the bonus-space trades,
rerolling an all-same feeder, the empty-feeder reroll. The rules drawer explains each.

(W602) The `goal` step is gone: the goal is a permanent line on screen ("Finish with more points than Pip."). Each step now shows a bold tap instruction (STORY.coachDo) plus one short reason; after each tap a green line says what happened. The guided game hides the feeder, food, tray, deck, goal chips and the 3 unused actions until a step needs them (`coachLayers`, body.tutlite). Proof: `tests/newcomer-run.js phone|pc` follows only the glowing target.
