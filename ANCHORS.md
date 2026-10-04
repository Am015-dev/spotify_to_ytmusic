# M2 (Frankfurt Chapter 2 · Die Hafenbande) — merge anchors

Base: `base.html` from `alex/overdrive-devkit` (already contains m1.js). Patch order: `pM21.py`. Rebuild: `./reapply.sh pM21.py` → REAPPLY_OK.

## Exact-string replacements
| # | patch | anchor (old string, exact, count 1) | what happens |
|---|---|---|---|
| 1 | pM21.py | `window.__mho={` | the whole of `m2.js` is inserted immediately **before** it (i.e. right after the end of m1.js). Nothing else changes. |

That is the only text anchor. No HTML/CSS anchors: m2.js creates nothing in the DOM (it reuses M1's cutscene layer, NEXT pill, HP bar, item UI).

## Runtime registrations into the M1 system (data, not anchors)
- `M1_STORY`: inserts `marked, river, crane, m2duel` right after `'duel'` (splice, so it works whatever else was appended).
  Story steps: 4 Marked Man · 5 River Rampage · 6 Crane Crash · 7 Harbour Duel → step 8 = chapter 2 done.
- `M1_DEF`, `M1_SC`, `M1_RADIO`, `M1_END`, `M1_WHO` get new keys (Object.assign). `M1_WHO` gains `WEBER`, `MOREAU`, `HAAK`.
- Save state (`mho_m1`, per slot/city): on the duel win `M2_done=1`, `plough=1`; smashed walls in `m2w:{k:1}`. Flag `WEBER=1` → Mainschiff (`v_weber`) unlocked.
  **Chapter 3 should key off `M1_st().M2_done===1`** (or `step>=M1_STORY.indexOf('m2duel')+1`).

## Re-bound functions (`fn=(f=>function(...){...f(...)})(fn)`; non-M2 calls fall straight through)
M1 functions: `M1_setup, M1_stage, M1_goonStep, M1_loseCrate, M1_hooks, M1_restore, M1_clear, M1_rivalStep, M1_hint, M1_mkMark, M1_done`.
Engine functions (already wrapped by M1, wrapped again on top): `qvTgt, qvFail, qvHud, qvMiniQ, qvTick`.
They must stay `function` declarations / `let` (not `const`) with the same signatures.

Globals read: `MAINR` (river polyline), `TEAMS`, `teamLocked`, `flags`, `store`, `storyShow`, `qvGraph/qvPath/qvCum/qvAt/qvSnap/qvMk`, `roamHit`, `inRiver`,
`groundY/groundAt`, `box`, `debris`, `burst`, `studBurst`, `studGain`, `hitPop`, `feed`, `say`, `angDiff`, `pl`, `RO`, `CID`.

New globals: `M2`, `M2_*`, `window.__m2` (test API).
