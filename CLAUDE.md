# Mainhattan Overdrive (LEGO-2K-Drive-style, Frankfurt + Athens): read first
Live: games/mainhattan-overdrive/ on alex/brave-carson-rbpmlk. Trunk: alex/od-int2. Beta page: claude.ai/artifact/P6zT2b2SwfHYguRTtb67Ug. Owner: Alex (iPhone 17 landscape + PC). Full history and old rules: docs/LESSONS_and_old_rules.md (read only when needed).

## Production model (2026-10-14, after $700+ and many reverts)
1. Exactly 2 workers plus 1 reviewer at once (Alex, 2026-10-20, replaces the earlier 5+1: too many bugs from too many parallel changes). The reviewer checks every worker commit (diff read, rebuild, unit + TAG + bot, golden if visuals changed) BEFORE the coordinator deploys; a failed review sends it back to the same worker. Each task is timeboxed to ~30-40 min or ~100k context, with ONE deliverable; then the worker writes 5 lines in docs/HANDOFF_<lane>.md, pushes and STOPS. No idle or self-waking workers, no queues, no open-ended lanes. Pick targets from Alex's own words or the Beta perf db, in his priority order.
2. Cheapest model that can do it: Haiku for mechanical work, Sonnet for bugs with a repro, UI, integration and tests, Opus only for design or feel or anything Sonnet failed twice. Subagents: always set `model`.
3. Push only green: before every push, build (tools/build.sh) and run unit (`node tools/unit/run.js`, 0 FAIL) + your TAG + `TAG=life1,xf1,terrain` on the BUILT page, not hot. WIP sits behind a flag that defaults OFF until its tests pass. A reverted push is the most expensive outcome.
4. Tests are state asserts with no graphics (checklist GO in src/99c_checklist.js with a pass line). No real-time play as a test. One 852×393 shot only for visual changes, and LOOK at it. Each 2K-Drive-quality claim needs a side-by-side shot with a reference.
5. Token hygiene: print only pass/fail lines (`| tail -5`); never read files > 50 KB whole (grep or a line range); no polling loops or sleeps (run in the background and wait for the notification); hand off at 100k context.
6. Workers message the coordinator once, at the end: ≤ 5 lines (commit, what changed, measured result, what's left). No progress chatter.
7. The coordinator only routes and deploys. It deploys at most every 30 min (batch builds), never does technical work, and stays under 100k context (/compact).
8. Bugs come from the in-game 🐞 button → artifact db collection `bugs` (read with ArtifactData). Triage sets status/owner/fixedIn on the doc so Alex sees it in "My reports".

9. Cost discipline (Alex, 2026-10-20, see docs/COST_LEDGER.md): two lanes per target, then a design plan or drop it; Sonnet by default, no Haiku on fixes; the coordinator hands off at 200k context; the ledger gets one row per lane at every deploy.
10. iPhone truth first: no build counts as smooth on phones without the throttled iPhone-like gate (perf/ios-reveal: 6x CPU, 0 shader links and no long frames in the first 3 s after reveal) or real iPhone reports from the Beta page.
## Standing orders from Alex
- Never ask Alex anything; take the recommended option and note it in one line.
- Reuse first: grep the repo, then three.js addons, LDraw/OMR, Yuka, etc. Note the licence in the commit.
- Match LEGO 2K Drive (deep blue sky, brick clouds, glossy LEGO cars on the road, lively streets, fun varied tracks). Fun beats metrics: green tests ≠ playable.
- Phone first: iPhone landscape + portrait, no HUD over controls, 12 px minimum text.
- Keep `ALL_OPEN=true`, the credits "Made with ❤ by Alex" and "3D models by Alex", English UI, gas default on touch. No model names in files or commits.
- Every deploy prepends an `OD_CHANGELOG` entry (version, date, 2-4 plain lines). Never deploy an unsplit build (3.6 MB cap). The coordinator deploys with `deploy.sh`, then republishes the Beta artifact with all chunks (km.js, models.js, tune.json, models/{lx,as,xf,qa}.js, xc/*.js).

## Branches (Alex, 2026-10-20: never let branches pile up again)
- Only these live on origin: `main`, trunk `alex/od-int2`, live `alex/brave-carson-rbpmlk` (deploy.sh target), plus the current coordinator session's own branch.
- Workers push ONLY to `alex/od-int2` (fetch + rebase). A `<lane>-final` branch is allowed only when that push is denied; the coordinator cherry-picks it into trunk and deletes it in the same check.
- Reviewers commit `docs/REVIEW_2K_<n>.md` + `docs/shots/rev<n>/` straight to `alex/od-int2` (docs-only commit). No `alex/rev<n>` branches.
- Coordinator, at every deploy: delete remote branches whose head is already in trunk, live or main; tag anything else older than 12 h as `archive/<branch>` and delete it. Nothing else creates branches.
