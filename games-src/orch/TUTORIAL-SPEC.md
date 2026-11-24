# Scenario tutorial spec (GXST) for our single-file games

Owner verdict (24 Nov): text popups plus a checklist do not teach. A tutorial is a set of short GAMES: real moves on the real
board toward one goal; the rule is learned from the consequence. Evidence and sources: orch/TUTORIAL-RESEARCH.md.
Engine: shell/gx-scenario-tutor.js + .css (docs shell/GXST.md). Worked example: kaiten/game/lessons.js (`?lessons=1`).
Test: `node shell/gxst-test.js` (402x874 and 1366x768).

## 1. The three layers (in this order)
1. Lessons: 6-10 scripted mini-scenarios, one rule each, tiny stacked board, single objective, decided in 1-3 moves.
2. Guided first game vs the easiest AI with fading hints (existing coach / bulb; hints stop once the player shows the skill).
3. Free play with on-demand help: hint bulb, hold-to-read, rules reference, the `Lessons` button to replay any lesson.

## 2. Scenario data schema
```
{ id: 'paste',                      // stable, used for progress and tests
  title: 'Fire Paste',              // <= 3 words, shown in picker and card header
  rule: 'Fire Paste triples the next nigiri you take. Take the paste first.',   // the rule taught, shown on win
  goal: 'Score 9 points with one Moon Nigiri.',   // ONE objective, <= 12 words, an outcome not a click instruction
  setup: function () { return stack({...}); },     // builds the position with the game's own engine; may return a Promise
  success: function () { return bool; },           // judged on the real game state, only when the game has settled
  fail: function () { return false | 'message'; }, // the consequence in one sentence: what happened and why it lost
  par: 2,                                          // moves an expert needs; over par costs one star
  moves: function () { return n; },                // moves made so far (for par)
  hints: ['nudge: a question or pointer, no answer', { say: 'show: the answer', target: selector | fn -> element }],
  debrief: 'Paste first, nigiri after: 3 x 3 = 9.' }  // one line, the reason it worked
```
- setup: use the game's ?scn= helpers or engine setup (Kaiten `stack()`: name the dishes in each hand and on each tray; every
  card id is still used once, so the engine's invariants hold). Script the opponent's picks (wrap the AI's choose while
  `GXST.active()`), never freeze the board.
- Never save lesson games over the player's real game (wrap autoSave while `GXST.active()`).

## 3. Player loop
- Picker: list of lessons with best stars; the first unsolved is outlined. Tap one to start. `Lessons` button reopens it.
- Play: floating objective card (goal, Hint, Restart). It never dims, never blocks taps outside itself, and keeps off the
  hinted target. Drag by the header (position saved), `-` folds to a chip showing the goal, `x` closes.
- Hint bulb: 1st press = nudge text, 2nd = show (text + pulse ring on the target, pointer-events none). Each costs a star.
- Judge: every 250 ms, only when `settled()` (animations done, so the player sees the consequence first).
- Win card: stars (3 minus hints, minus 1 if over par, min 1), debrief, `Rule:` line, Retry / Next lesson.
- Fail card: `Not quite.` + the consequence message, Retry (restarts the setup instantly) / Lessons.
- Progress: `localStorage['gxst-'+game] = {best:{id:stars}, pos}`.
- Events: window `gxst` CustomEvent, `detail.type` = picker | start | hint | win | fail | retry | close.

## 4. Converting a rule list into scenarios (author template, ~2-3 h per game)
1. List the rules a new player must know to finish a game (rules-check/<game>.md, the game's rules drawer). Keep 6-10;
   merge trivia, drop edge cases (they go to the reference).
2. Order them so each needs only earlier ones: take/move -> each scoring type -> interaction (blocking, passing) -> special pieces.
3. For each rule write the smallest position where ONE move shows the rule: the right move wins, the tempting wrong move
   visibly loses (the fail message names the consequence). Give 2-4 choices, not 1 (no forced click-the-glow) and not 10.
4. Fill the schema: goal as an outcome, fail message as cause -> effect, nudge as a pointer, show as the answer, debrief.
5. Add the scripted solution to the test's SOLVE table and one wrong move.
Checklist per scenario: one rule; decided within 3 moves; at least one wrong move fails with a message; nothing outside the
card is blocked; no line over 12 words; no original game name; the player can still open rules/menu mid-lesson.
Cost: engine is shared (0). Per game: lessons file ~80-120 lines + a `stack()` helper (30-60 min), 7 scenarios (60-90 min),
test SOLVE table and proof shots (30 min).

## 5. Reviewer checklist (automatic: shell/gxst-test.js pattern)
- [ ] Every rule in the game's rule list maps to a scenario id (table in the lessons file header).
- [ ] Each scenario is solved by its scripted solution with real taps (win phase reached, 3 stars with no hint).
- [ ] A wrong move ends in `fail` with a non-empty message; Retry restarts to `play`.
- [ ] Every tap lands on the element tapped (elementFromPoint), no board item is under the card, a non-lesson button works.
- [ ] Show-me hint draws a ring on a visible target and the card does not cover it.
- [ ] Minimise/chip, drag (saved), close, Lessons reopen; progress saved for every lesson; 0 JS errors.
- [ ] Contact sheet of every lesson start at 402x874 and 1366x768 read by a human: the goal and the relevant pieces are visible.
