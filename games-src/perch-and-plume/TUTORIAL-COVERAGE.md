# Perch & Plume: tutorial coverage

The tutorial is one real, short game: 1 round of 8 actions against Pip (the computer), fixed seed and hand. It is played from the
start to the final score and the result screen. It has 5 chapters and 14 guided steps (`src/tutor.js`). After them, "Finish this
game" hands over: Pip plays with the real AI and you use your last actions. Then the round goal is scored, final scoring runs and
the result screen shows. Proof: `tests/tutorial-end.js phone|pc` taps every step and checks that every step id below was shown.
It then plays the rest of the year by visible taps only, to the result screen.

Chapters: 1 First turn, 2 Play a bird, 3 Eggs, 4 Cards, 5 Scoring (each step title starts with its chapter number).

## Rules (from rules-notes.md and the rules check) -> where they are taught
Each rule is taught by doing it or by seeing it in one step. "Seen in play" means the guided game reaches that moment and the
screen shows it with a caption or a pop.

- [x] Setup: keep 5 (birds + food), 1 of 2 bonus cards. Shown in step `setup` (the hand is picked for you; the keep screen itself is not played in the tutorial).
- [x] One action per turn. Done in step `forest`.
- [x] Forest = gain food, sized by the birds in the row. Done in step `forest`.
- [x] Birdfeeder dice; a die is one food; an empty feeder is rolled again. Done in step `die` (taking 2 dice).
- [x] Brown powers fire after a row action, right to left. Shown in step `chain` (your 2 forest birds have just fired, with pops).
- [x] Playing a bird is the other kind of turn; it fires no row. Done in step `select`.
- [x] Leftmost free space of a row the bird lives in. Done in step `slot`.
- [x] Food cost, any 2 food for 1, egg cost by column (0, 1, 1, 2, 2). Done in step `pay` (pays food + 1 egg).
- [x] Grassland = lay eggs; more birds in a row = a bigger action. Done in step `eggs`.
- [x] Nest limit; each egg is 1 point. Done in step `egg` (3 eggs placed).
- [x] Wetland = draw cards. Done in step `draw`.
- [x] Tray or deck; the tray refills after the turn. Done in step `tray`.
- [x] Round goal scored at the end of each round (most items scores most). Shown in step `goals`, then scored for real at the end of the guided game (pop + Goals drawer).
- [x] Final score = birds + eggs + goals + bonus card + cached food + tucked cards. Shown in step `score`, then seen on the result screen.
- [x] Tie-break: most unused food. Shown in step `score` (stated; a tie does not come up in the seeded game).
- [x] Rounds and actions: 8 / 7 / 6 / 5. Shown in step `finish` and on the banner ("N actions left this round").
- [x] The computer's turn, step by step. Shown in step `finish` and every rival turn (banner + captions; Pip draws cards while the guided steps run, then plays for real).
- [x] Caching food and tucking cards. Seen in play in step `chain` (the forest bird caches 1 seed, a pop shows it).

## Not covered by the guided game (said honestly)
- [ ] Bonus-space trades (card for food, food for egg, egg for card). Rows with 1 bird have them; the seeded rows have 0 or 2 birds. The Rules drawer explains them, and the first trade in a real game asks with a plain Yes / No thanks.
- [ ] Pink powers (between turns). Pip has no pink bird in the seeded game. The caption "Between turns: ..." shows when one fires in a real game.
- [ ] White "when played" powers that play a second bird or give bonus cards. The seeded bird in hand has none.
- [ ] Reroll when all dice match. It does not come up with this seed; a "Reroll the feeder" button appears when it does.
- [ ] Multi-round play: the first player rotates and the tray is replaced each round. The tutorial year is 1 round.
- [ ] Leaving mid-tutorial and resuming at a chapter: the shared tutorial kit restarts from step 1. The chapters are still marked in every step title.
