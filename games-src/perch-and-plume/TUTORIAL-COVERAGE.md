# Perch & Plume: tutorial coverage (coached first game)

The tutorial is a short real game: 1 round of 4 turns against Pip. There are no forced steps; every legal move is yours from
turn 1. Each turn Aunt Ottilie teaches ONE action in one sentence (turn 1 play a bird, 2 get food, 3 lay eggs, 4 draw birds) and
points at that action's big button; if you pick another action, the skipped lesson comes next turn. The seed and the hand are set so that:
- the bird in hand can be paid on turn 1 (seed + 1 egg);
- 2 forest birds whose brown powers chain when you get food;
- a pink "between turns" bird on Pip's board.
After each turn a one-line rating (good, okay or poor, with where the points came from) compares your move with the best-value estimate.

Aunt Ottilie, the story's guide (STORY.md), explains each rule the first time it matters. She also gives one line on a good or
poor move and on what Pip does. The coach bubble sits in the panel above the instruction bar, so it never covers the board. Only
one shows at a time, and the x dismisses it. Text: `src/story.js` (`STORY.coach`); logic: `src/coach.js`.

At the end, the result screen walks your score rule by rule with your real numbers. Rules that never came up are listed in a
"Things you'll meet later" card. Proof: `tests/tutorial-end.js phone|pc` plays the whole game by choosing any glowing legal move
through the UI. It asserts that each rule below was explained live or listed under "later", and that the core rules were
explained live.

## Rules -> when Ottilie explains them (rule id = the coach line)
- [x] rule `welcome`: turn 1 lesson: play a bird (one action per turn). When: your first turn.
- [x] rule `food`: turn 2 lesson: get food, more forest birds = more food. When: the turn you get food, or as the next lesson.
- [x] rule `feeder`: feeder dice, one die = one food. When: you first pick dice.
- [x] rule `feederRoll`: an empty (or all-same) feeder is rolled again. When: the first reroll.
- [x] rule `chain`: brown powers fire right to left after a row action. When: your forest birds first fire.
- [x] rule `cache`: cached food and tucked cards are 1 point each. When: your bird first caches or tucks.
- [x] rule `play`: leftmost free space of a row the bird lives in. When: you first pick a bird.
- [x] rule `pay`: food cost, any 2 for 1, egg cost by column (0, 1, 1, 2, 2). When: the first pay screen.
- [x] rule `white`: white powers work once, when played. When: you first play a white-power bird.
- [x] rule `eggs`: grassland lays eggs, 1 point each. When: your first grassland action.
- [x] rule `nest`: nest limit. When: the first time you place eggs.
- [x] rule `cards`: wetland draws birds. When: your first wetland action.
- [x] rule `tray`: tray or deck; the tray refills after your turn. When: the first draw choice.
- [x] rule `trade`: bonus-space trades. When: the first trade offer.
- [x] rule `choice`: a power asking you (tuck, spend an egg, second bird), always skippable. When: the first such question.
- [x] rule `pink`: pink powers between turns. When: Pip's pink bird (or yours) first fires.
- [x] rule `rival`: the rival's turn, step by step. When: Pip's first action.
- [x] rule `reroll`: you may reroll a feeder whose dice all match. When: the first time it happens on your turn.
- [x] rule `emptyHand`: draw when your hand is empty. When: your hand first runs out.
- [x] rule `goal`: the round goal is judged at round end. When: the end of round 1.
- [x] rule `round`: next round has one fewer action, the tray is replaced, the first player moves on. When: the tutorial has 1 round, so this is listed under "Things you'll meet later".
- [x] rule `final`: final score = birds + eggs + goals + bonus card + cached food + tucked cards. When: the result walk-through.
- [x] rule `tie`: tie-break is the most unused food. When: the result walk-through.

Rules that depend on luck (feederRoll, cache, trade, choice, reroll, emptyHand, sometimes white or pink) may not come up in a
given game. Then they appear in "Things you'll meet later" on the result screen, with the same line.

## Story beats
Ottilie's lines carry the prologue's voice: dawn in the Larchwood, Pip racing you to fill a notebook. The result has her verdict
on a win or a loss (STORY.tutResult), above the score walk-through.
