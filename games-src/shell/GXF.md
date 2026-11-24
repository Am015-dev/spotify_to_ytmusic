# GXF: floating tutorial kit (shell/gx-float.js + gx-float.css)
Owner design: a floating lesson window, never a spotlight. It never dims, never blocks taps, never makes one item the only tappable one.
Begins with a HUD map (labelled leader lines, tap a label for one sentence), then lessons with a checklist. The old staged kit (gx-tutor.js) is untouched.
- Build: add `gx-float.js` to the game's script ORDER/SRC and `gx-float.css` to its inlined CSS (see kaiten/game/build.py), ES5, no dependencies.
- `GXF.init({game, steps, hud, storageKey?, qParent?})` once; adds a `?` button (into `.gx-bar`, or `qParent`, else fixed bottom-right) that reopens the map.
- `steps: [{id, title, say, why?, target?: selector|fn->el, done?: ()=>bool, setup?: fn}]`: a lesson ends when `done()` turns true (polled every 300 ms) or on Next.
- `hud: [{sel, label, say}]`: one entry per HUD element; hidden elements are skipped; labels are auto-laid-out so they never overlap each other.
- `GXF.open()` opens on the HUD map; `GXF.hudMap()` same and un-minimises; `GXF.close()`; `GXF.next()` = the Next button.
- Window: drag by its header (position remembered), `-` folds it to a chip, `x` closes. It moves itself off the target rect; a dragged
  position is kept unless it would cover the target; if nowhere is free it folds to a chip until the target goes away.
- Suggestion: `.gxf-ring` pulse ring over the target, `pointer-events:none`, so the target and everything else stay tappable.
- Storage: `localStorage[storageKey || 'gxf-'+game] = {pos, min, i, done, complete}`.
- Events: `window` CustomEvent `'gxf'`, `detail.type` = open | map | info | step (id, i, by) | complete | close.
- Tests: `GXF.state()` -> {open, map, min, i, id, done[], complete, pos, win, target, overlap, labels[]} (rects in viewport px).
- Theme: override `--gxf-bg --gxf-ink --gxf-head --gxf-on --gxf-acc --gxf-ok --gxf-ring --gxf-z` in the game skin.
- Worked example: kaiten/game/float.js (open the game with `?gxf=1`; off by default). Test: `node shell/gxf-test.js` (402x874, 1366x768),
  shots in shell/proof/. Copy float.js, swap steps/hud/predicates for your game, add one ?scn= or test line, done.
- Rules for copy: say = one short sentence, why = the reason, title <= 4 words; never put an original game's name in any text.
