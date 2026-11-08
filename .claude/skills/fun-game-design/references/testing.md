# Game testing that catches real problems

## 1. Real-input playthrough (mandatory before publishing)
- Launch Chromium via Playwright at phone size (390x800, device_scale_factor 2, has_touch).
- Drive ONLY with page.mouse / page.keyboard / clicks on real buttons. Read game state with
  page.evaluate for decisions (like a player looking at the screen), never to mutate it.
- For every scene/level: start from the real entry point (title -> Play), finish it, and assert
  the save/progress flag. Record time-to-first-control (dialogue taps before you can move).
- Watch for: dialogue walls; camera outside the map; controls hidden under the HUD; follow
  mechanics that stop when the finger runs ahead; "almost there" endpoints that never trigger;
  overlays that swallow taps; fixed-position CSS applied to every canvas (it once hid previews).

## 2. Solvers and invariants
- Grid/puzzle games: exhaustive placement solver. Require: solvable; no strict subset of the
  given items solves it; 1-4 solutions; a non-trivial path length.
- Physics/platform games: BFS over (surface, x-bucket) using the real physics step, to prove every
  goal, collectible and platform is reachable.
- Spatial link puzzles: links must not pass through obstacles (sample the segment).
- Maps: all rows the same length; no items inside walls; re-check after procedural decoration.

## 3. Difficulty and skill checks (only meaningful next to the user's score)
- Compare a careless bot with a careful bot. If both succeed equally, skill doesn't matter.
  If the careless bot always fails and the careful bot always wins, it may be too punishing.
- Luck check: expert vs beginner win rate. Around 70-85% suggests skill matters without being rote.

## 4. Visual review
- Screenshot each scene mid-play and at key moments (reveal, win, fail). Compare against the
  user's complaint list (dark? cluttered? nonsensical room? unreadable?).

## 5. Reporting
- Separate: bugs found and fixed / what the tests prove / what only the user can judge (fun).
