# W734 Wickdeep overhaul: results (24 Nov 2026)
- Lessons test (`lessons-test.js`, phone 402x874 + PC 1366x768 side by side): PASS 3 runs in a row, 30.0-30.3 s.
- Full game by real taps (`tap-play.js`): finishes at 402x874 (139 taps) and 1366x768, 0 JS errors.
- Always-visible HUD items in a real game: phone 17 -> 9, PC 18 -> 10 (6 element icons show only while charged; zoom buttons hidden on touch, pinch works).
- Contact sheets: before-*.jpg / after-*.jpg (title, 7 lessons, Log/Rules/Menu windows, game, end), 0 bad cells. Made by sheet-shots.js + sheet-compose.py.
- Blockers fixed: Ready was dead when two cards were picked out of hand order; 4th card off-screen (phone and PC); lesson card covered the hand; a retry kept the old pick;
  shield lesson numbers were wrong (crab's own card added shield 1); coin lesson never judged; coach bubble covered windows and lesson cards; lessons test hung (timers, lost regex).
- Not done: last bot game ends in a loss by exhaustion (random tapper); a deeper HUD redesign (hero HP/coins chip in the bar) is the next step.
