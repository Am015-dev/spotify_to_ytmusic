# HANDOFF W321: result screens (branch nr/W321-result, not deployed)

Built from nr/W317-integrate4. One owner per behaviour; all copy in player words.

## What changed (item -> owner)
1. Garage line: `parts/profile/ret.js` retShow sets `#overSub` after it decides GARAGE: "Spend your Neon in the garage, then retry" only when the button shows, else "Try again. Your Neon is saved." (head.html default is the second line).
2. One score: the HUD number and `Score` are both `G.score` (the saved/ranked value). The card used a 0.8 s count-up from 0 (ret.js, `RET.trans`), so a screenshot caught "6023" next to HUD 28757. The count-up is removed: the card shows the final number at once.
3. Unexplained numbers: `Reached` / `Stage 1 · FIRST RUN`; `PERFECT hits 12 (shots on the beat)` (head.html, story.js, hud/c.js); stage clear row `PERFECT hits (shots on the beat): 9 of 36`; challenge row `Score 40K of 60K`; `Goal MINI-BOSS` -> `To clear it: beat the mini-boss` (`goalPlain` in story/story.js); the `Banked ♦ +3 · in garage: 3` line (`#oNeon`, hangar/shop.js, cp.js) is hidden, because the run-end bar already says `This run: +3 Neon` and the Neon chip shows the total; "Marked ↺: Neon x0.75, no records" -> "Restart here with half your hull and N s of safety. Neon pay is 75% and this run sets no records." (difficulty/cp.js).
4. Street result: `BROKEN` -> `CRATES SMASHED` (street/street2.js; it counts crates and barrels broken).
5. FUN / SAME AGAIN / BORING widget: only with `?lab=1` (profile/feedback.js). The autosave "Saved" pill is not shown while a result sheet is up (core/saves.js); settings / slot toasts unchanged.
6. 844x390: `head.html` has one landscape block for `#over` and `#stres` (text left, all buttons in a column right, incl. the checkpoint button).
7. Street hint: `streetlook.js` slHud puts the hint in the empty sky right of the hearts panel (up to 3 lines); with no room or a boss on screen the old strip under the panel is used.
- Bonus fix: the 3rd star row ("No hull lost") was swallowed by a `//` comment in the middle of `ST.finish` (W307) and never drawn; it is back.

## Open (not done, needs an owner decision)
- The same swallowed line also held `medalHTML(...)` and `RET.resultRow()` (Neon paid, "NO LEAK / NO HIT" chips, "+N Neon · medals", "GOLD 0/5"). They have never been in a reviewed build and show unexplained words, so they stay off. Turn them on only with copy for each (W321 comment in story.js).
- The review file REVIEW-2026-10-31-R2.md was read from origin/nr/REVIEW-R2.

## Proof (see report): copy-test, bossbar-layout, focus, flow, gauntlet-shell, claims-check. copy-test has 4 new checks (result strings, PERFECT hits wording, garage line vs button, widget hidden).

## Screenshots looked at (12; never committed)
- flight game over, stage 1, nothing affordable, 390x763 / 844x390 / 1440x860: Score 28757, Stage 1 · FIRST RUN, PERFECT hits 0 (shots on the beat), To clear it: beat the mini-boss, This run +3 Neon, no garage line (no GARAGE button), RETRY + TITLE inside the screen at all 3 sizes, no widget, no pill.
- flight stage clear, 3 sizes: three star rows with PERFECT hits 9 of 36, Score 28757, NEXT STAGE / RETRY / TITLE inside, 844x390 two columns.
- street YOU WENT DOWN, 3 sizes: SCORE / TIME / KILLS / CRATES SMASHED / NEON, RETRY + TITLE inside.
- street STREET CLEAR, 3 sizes: rank A, same rows, + BEST, buttons inside, nothing overlapping.
- street mid-run (390x763): hint right of the hearts panel, OVERDRIVE plate free.
