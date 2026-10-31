# PROGRESSION W292 (design, 10 lines)
1. Save: the existing `mnr_story` record (story.js `sSave.stars`, written by `ST.finish`) is the only progress store; `load()` (core/a.js) already falls back on corrupt or null JSON (W262).
2. Highest cleared stage = the largest `n <= MAIN` with `stars[n] >= 1`. FLIGHT continues at `min(MAIN, highest + 1)`, lowered to the nearest `unlocked(n)` stage.
3. Result screen after a clear: NEXT STAGE, RETRY, TITLE (hidden only after the last stage, as before). STAGES (the map) stays hidden in focus mode.
4. focus.js no longer hides `#srNext`: the dead hiding rule is deleted, not flagged (rule 18).
5. Title: the FLIGHT button carries a small `Stage N` label (`#focStage`).
6. Under FLIGHT a stage row `#focStages` lists buttons 1..N (existing `.go.dim` style, current stage outlined, 44 px targets, scrolls sideways past ~8). Hidden while N = 1.
7. A row button calls `startStory(i)`; the same guard as FLIGHT (`running`) applies.
8. The row and label refresh whenever the title is shown again (MutationObserver on `#title[hidden]`).
9. ON FOOT, SETTINGS, LAB are unchanged; every other focus-mode door stays hidden.
10. Proof: qa/flow-test.js (chain 1 -> 2 -> 3 by clicks, reload, corrupt save) and qa/gauntlet-flight.js STARTS=1..10 (table in HANDOFF-W292.md).
