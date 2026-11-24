# GXST: scenario tutorials (shell/gx-scenario-tutor.js + gx-scenario-tutor.css)
Tutorials are games: each lesson stacks a tiny real position with ONE goal; the player makes real moves and learns the rule
from the consequence. Spec and authoring checklist: orch/TUTORIAL-SPEC.md. Global is GXST (GXS is the ?scn= registry).
- Build: add `gx-scenario-tutor.js` to the game's script ORDER/SRC and `gx-scenario-tutor.css` to its inlined CSS (see kaiten/game/build.py). ES5, no deps.
- `GXST.init({game, scenarios, storageKey?, settled?, keepClear?, qParent?})` once; adds a `Lessons` button (into `.gx-bar`, or `qParent`, else fixed bottom-left).
  `settled()` returns true when the game is idle (animations done); results are judged only then. `keepClear` = selectors the card keeps off (board areas the lesson is about). `goal` may be a function.
- Scenario: `{id, title, rule, goal, setup()->Promise?, success()->bool, fail()->false|'message', par?, moves?(), hints:[nudge, {say, target}], debrief}`.
- `GXST.picker()` `GXST.start(id|index)` `GXST.retry()` `GXST.next()` `GXST.hint()` `GXST.close()` `GXST.active()` (running scenario or null).
- Card: never dims, never blocks taps outside itself; drag by header (saved), `-` chip, `x` close. Win/fail are the same small card.
- Stars: 3 - hints used (- 1 if moves() > par), min 1. Storage `localStorage['gxst-'+game] = {best, pos}`.
- Events: window `gxst` CustomEvent `detail.type` = picker | start | hint | win | fail | retry | close.
- Tests: `GXST.state()` -> {open, phase, id, i, live, hint, stars, msg, best, min, pos, card, target, overlap, count}.
- Theme: override `--gxst-bg --gxst-ink --gxst-head --gxst-on --gxst-acc --gxst-ok --gxst-bad --gxst-star --gxst-ring --gxst-z`.
- Worked example: kaiten/game/lessons.js (`?lessons=1`, off by default). Test: `node shell/gxst-test.js`; proof in kaiten-kitchen/proof/.
