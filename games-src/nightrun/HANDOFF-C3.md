# HANDOFF C3: consolidation step 3 (fold wrappers into one home), 22 Oct 2026

Branch `nr/C3`, one commit per function. Each one passed: build.py, fingerprint-test 8/8 PASS (identical), simhunt same issue kinds and
0 page-error kinds, guard.py ok. No behaviour change.

## How it works now
- `a.js`: `hookable(name,get,set)` in the owner makes `HOOK[name]`; a layer registers with one line `HOOK.name(prev=>function(..){..prev..})`.
  The layer body is the old wrapper body, unchanged, and registers at the same moment as before, so the order is the same.
  `HOOKS[name]` is the runtime list of layers (first = innermost). zoo.js and leak.js register in `init()` at their first runStart, so they are outermost.
- `drawPickups` (draw.js) uses plain lists instead: `DRAW.pre` (polish governor) runs before the pickups, `DRAW.extra` runs after them in build order.
- `games-src/scripts/where.py` now writes a "Hooked functions" block into WHERE.md: each function's home file:line and its layers in build order.
  WHERE.md and MODULES-COMPACT.md are not committed here (rule 12). Rebuild them after the merge. WHERE.md was already over its 8192-byte
  limit (8242) before this change. With the new block it is 9226 bytes: trim it or raise LIMIT.

## Done (wrappers before -> after)
drawPickups 15 -> 0 (DRAW lists), DMG.hit 9 -> 0, drawEnemy 11 -> 0, DIR.spawnOne 6 -> 0, spawnBoss 6 -> 0, drawPlayer 13 -> 0 (incl. diet `sc`),
hurt 6 -> 0, SH.volley 6 -> 0, PW.draw 7 -> 0 (incl. diet `sc`), PW.give 5 -> 0, DMG.pass 5 -> 0.
Lines in parts/*.js that contain `=function`: 551 -> 465. Size of parts: +1.4 KB (owner comments and the hookable lines).

## Left (>= 4 reassignments each)
- `gaDraw` (10): upgrades.js, meta.js and hub.js:273 REPLACE the whole function (they do not wrap it), so the earlier bodies are dead.
  This needs a dead-code step: keep the last full definition plus the wrappers after it. Do not fold it mechanically.
- floater, SH.close, PW.hud, PW.glyph, FXV.bullets, ABIL.gain, ABIL.draw (4 each). The same fold works: add a `hookable` line after the owner's
  object or function, then run the folding script below. PW.glyph in upgrades.js:94 uses a separate `const gl=` (fold it by hand, as SH.volley in upgrades.js was).
  The comfort.js and diet.js PW.hud wrappers sit behind `if(window.PW&&...)`, and nothing sets `window.PW`, so they never run. Fold them anyway
  (that keeps behaviour identical), or delete them in step 7.
- Folding script used: a regex that turns `const X=NAME;NAME=function(A){BODY}` into `HOOK[KEY](X=>function(A){BODY})` and drops a lone `{..;}`
  wrapper block. Check that X is not used later in the same block.

## Noise seen
simhunt runs are not identical run to run (unexplained-death 62-79 runs over 9 runs of the same tree). Single `empty` (stage 1, 60 s) and
`draw-site` entries show up in some full runs. The PW.give check reproduced both on the build BEFORE the change, so they come from the run, not from this work.
