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
1. step `goal`: most points wins; the practice is one short round (tap the score line).
2. step `turns`: one action per turn; practice has 4 actions, real games 4 rounds (tap the turn tracker).
3. step `play`: action 1, play a bird (tap Play a bird).
4. step `cost`: a bird's food cost is paid from your supply (tap the bird).
5. step `slot`: the leftmost empty space of its habitat (tap the glowing space).
6. step `pay`: spaces 2-3 cost 1 egg, 4-5 cost 2 (tap Play).
7. step `white`: a white power works once, when played (tap the new bird).
8. step `food`: action 2, get food: the forest takes feeder dice (tap Get food).
9. step `die`: one die = one food (tap a die).
10. step `die2`: more forest birds = more food (tap a second die).
11. step `tuck`: brown powers fire right to left; tuck a card (tap a hand card).
12. step `cache`: tucked cards and stored food are 1 point each (tap the forest row).
13. step `eggs`: action 3, lay eggs in the grassland (tap Lay eggs).
14. step `nest`: each egg is 1 point, up to the nest limit (tap a bird, per egg).
15. step `pink`: pink powers react between turns (tap Pip's chip after Pip's bird laid an egg).
16. step `cards`: action 4, draw birds in the wetland (tap Draw birds).
17. step `tray`: tray or deck; the tray refills after the turn (tap a tray card).
18. step `goalr`: the round goal is scored at round end (tap the round-goal line of the score).
19. step `bonus`: the secret bonus card scores at the end (tap its line).
20. step `final`: final score = birds + eggs + goals + bonus + stored food + tucked cards; tie = most food left (tap the total).
21. step `real`: start a real game (tap Play again).

Covered by the in-game instruction bar instead of a step (they depend on dice luck in a real game): the bonus-space trades,
rerolling an all-same feeder, the empty-feeder reroll. The rules drawer explains each.
