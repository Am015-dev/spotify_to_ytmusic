# W322: LAB hidden from buyers; store page makes no music or count claims

Branch `nr/W322-store` (from `nr/W317-integrate4`). Not deployed.

## What changed
1. **Title LAB button gated** (`parts/menus/focus.js`): SETTINGS is always shown; LAB is appended only when the URL has `?lab=1`.
   The LAB code, its ids (`labBtn`, `labBtnS`) and the LAB stage are untouched. `?lab=1` still auto-starts the LAB stage (existing behaviour in `parts/lab/lab.js`).
2. **Tests** (`qa/gauntlet-shell.js`, `qa/focus-test.js`): title expectations are now 3 buttons without the flag; new checks that LAB is absent without `?lab=1` and is the 4th button with it. The LAB-open step clicks `#labBtn` directly. Tests that already open the LAB pass `?lab=1` (lab2, lab3, footlab, soundlab, labfull, asset-coverage), so they needed no change.
3. **Store page** (`release/STORE-PAGE.md`): removed "original soundtrack" from the price paragraph, removed the soundtrack description sentence and the soundtrack feature bullet, reworded the MUSIC-PROVENANCE line to "NOT cleared for sale yet". "Nine selectable ships" is now "Unlock nine ships in the garage." "Five city districts" and "ten bosses" are softened to "Flight stages 1 and 2, and the on-foot street level, each ending in a boss fight." STORE-PAGE has no evidence list of its own, so those two claims could not be proven from it.

## Test lines (full build in a temp dir, `GAME_DIR` set)
- qa/flow-test.js: PASS 91, FAIL 0
- qa/focus-test.js: PASS 15, FAIL 0
- qa/gauntlet-shell.js: PASS 401, FAIL 0 (399 before plus the 2 new flag checks)
- qa/lab2-test.js: PASS 51, FAIL 0
- qa/lab3-test.js: PASS 14, FAIL 0
- qa/footlab-test.js: PASS 37, FAIL 0
- qa/soundlab-test.js: PASS 27, FAIL 0
- hub-test.js: PASS 145, FAIL 0
- qa/claims-check.js: PASS 17, FAIL 0
- qa/copy-test.js: PASS 15, FAIL 0
- labfull-test.js: FAIL 1 ("after the foot sandbox and leaving the Lab, saves differ"). **Pre-existing:** the same failure occurs on the unmodified W317 build (checked in a worktree).

## Screenshots (looked at; kept outside the repo, in /tmp/w322shots)
- 390x763 and 1440x860, no flag: three buttons (FLIGHT, ON FOOT, SETTINGS), no LAB, block still centred on the title.
- 390x763 and 1440x860, `?lab=1`: four buttons, LAB beside SETTINGS in a second row. Captured after exiting the auto-started LAB, since `?lab=1` opens the LAB stage on load.

## Open items
- `games-src/nightrun/REVIEW-2026-10-31-R2.md` is not in the repo, so the reviewer blockers could not be read. The task was done from the brief.
- hub.js still lists LAB as a TRAINING door (`hub.js:90`, `#labBtn`). It is outside focus.js and was not in scope. Buyers reach it only if the hub is shown with focus off (`?focus=0`).
- Not run: qa/smoke.sh as a whole, qa/qa.sh, and the built `games/` output (generated, not committed).
- Branch is pushed without merging `alex/brave-carson-rbpmlk`, because the brief names only nr/W322-store.
