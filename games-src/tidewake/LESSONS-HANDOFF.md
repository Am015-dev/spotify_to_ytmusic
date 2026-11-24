# Tidewake scenario lessons: handoff (W681)
Done: lessons.js (9 lessons: mark, lay, chain, push, wake, cannon, gate, wave, game) on shell/gx-scenario-tutor.js, wired in build.py/body.html;
old guided game entry points retired in ui10.js (tutStart opens the picker, storyOpen skips the prologue); no answer timer inside a lesson.
Test: `PW_DIR=$(npm root -g)/playwright node games-src/tidewake/game/lessons-test.js [WxH]` (ONLY=id,id limits it). Run 3 at 1366x768 solved lay, chain, push, wake, wave, game by real taps.
Open: cannon/gate wrong-move + gate question flow still stall the test (45-110 s, must be < 60 s total); 402x874 gate flow ("nothing to tap" q/place);
start-mark test now taps the board first (works both sizes). Not run: contact sheets (proof folder games-src/tidewake/proof/ empty), final clean run at both sizes.
Not covered by a lesson: 6 raises a leviathan, minimum of three, leviathan swims off, elimination-bonus swap, Maelstrom, teams, solo. No interface tour.
tutor-test.js / tutscript-test.js test the retired guided game and are stale. Missing scripts: scripts/turbo.js, scripts/contact-sheet.js.
