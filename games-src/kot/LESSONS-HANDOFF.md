# Crown City Smash scenario lessons: handoff (W689)
Done: lessons.js (10 lessons: keep, enter, claws, city, heal, buy, sweep, yield, win20, game) on shell/gx-scenario-tutor.js, wired in build.py/body2.html.
The old dimming guided game is retired: tutStart opens the lesson picker, storyOpen goes straight to the chapter map (tutor.js).
Dice and rivals are scripted while a lesson runs (reroll/startRoll wrappers in lessons.js); nothing is saved over the real game; the last lesson uses real dice.
Test: `NODE_PATH=$(npm root -g) node games-src/kot/lessons-test.js [WxH]` (needs a --quick build first; BUDGET=ms raises the time cap). Proof: kot/proof/lessons-*.
Open: the whole test takes 60-80 s per size on this container (CPU-bound rendering), over the 60 s goal.
build-all --quick: 4 failures are not from this change: menu overflow check (energy chip text cut in .pchip), 3 visual baselines missing.
Not covered by a lesson (rules drawer only): Harbor (5-6 monsters), evolutions, Brainjack, curses, expansions, each card's own text, one-shot cards (only the buy lesson's fail message).
No interface-tour HUD map card yet.

## W698 (24 Nov)
- build-all --quick: menu clip fixed (the kit's Lessons button squeezed the phone header chips; on phone it now opens from Menu, board.css). 12/15; the 3 left are
  visual baselines missing on ui-baselines for this game (the live game lacks them too).
- lessons-test: 26 s at 402x874, 17 s at 1366x768 (budget 60 s per size). Logic runs with --disable-3d-apis: ?gl=0 never stopped the 3D arena and software WebGL
  cost ~0.5 s per tap. GL=1 keeps 3D.
- Open: on the no-WebGL board at 1366x768 the dice row overlaps the monster cards and the hint line overlaps SMASH (all 10 cells of lessons-1366x768-sheet.jpg).
  contact-sheet.js was not run (starting the local servers was blocked in this container).
