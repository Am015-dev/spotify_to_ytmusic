# Crown City Smash scenario lessons: handoff (W689)
Done: lessons.js (10 lessons: keep, enter, claws, city, heal, buy, sweep, yield, win20, game) on shell/gx-scenario-tutor.js, wired in build.py/body2.html.
The old dimming guided game is retired: tutStart opens the lesson picker, storyOpen goes straight to the chapter map (tutor.js).
Dice and rivals are scripted while a lesson runs (reroll/startRoll wrappers in lessons.js); nothing is saved over the real game; the last lesson uses real dice.
Test: `NODE_PATH=$(npm root -g) node games-src/kot/lessons-test.js [WxH]` (needs a --quick build first; BUDGET=ms raises the time cap). Proof: kot/proof/lessons-*.
Open: the whole test takes 60-80 s per size on this container (CPU-bound rendering), over the 60 s goal.
build-all --quick: 4 failures are not from this change: menu overflow check (energy chip text cut in .pchip), 3 visual baselines missing.
Not covered by a lesson (rules drawer only): Harbor (5-6 monsters), evolutions, Brainjack, curses, expansions, each card's own text, one-shot cards (only the buy lesson's fail message).
No interface-tour HUD map card yet.
