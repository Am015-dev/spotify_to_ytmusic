# Tidewake scenario lessons: handoff (W691)
Done: 9 lessons (mark, lay, chain, push, wake, cannon, gate, wave, game) in game/lessons.js on shell/gx-scenario-tutor.js; old guided game retired from entry points.
Test: `PW_DIR=$(npm root -g)/playwright node games-src/tidewake/game/lessons-test.js [WxH]` (ONLY=id,id limits, LAP=1 prints timings): PASS 402x874 46 s, 1366x768 47 s.
Fixes this round: a pending question now counts as settled (setup and judge), so bow/question lessons no longer wait 12 s; the card keeps off the top bar; test waits for the question, and the short game plays engine moves.
Proof: games-src/tidewake/proof/ (picker, fail, win, contact sheet of every lesson start, phone + pc).
Open: card still covers the row under Place on the phone in lay/chain/wave/game (buttons stay tappable). Build-all quick: 'title' baseline snapshot missing for the new screen (reported, not fixed).
Not covered by a lesson: 6 raises a leviathan, minimum of three, leviathan swims off, elimination-bonus swap, Maelstrom, teams, solo.
tutor-test.js / tutscript-test.js test the retired guided game and are stale.
