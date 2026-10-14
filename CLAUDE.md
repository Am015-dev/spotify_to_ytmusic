# Mainhattan Overdrive (LEGO-2K-Drive-style, Frankfurt + Athens): read first
Live: games/mainhattan-overdrive/ on alex/brave-carson-rbpmlk. Trunk: alex/od-int2. Beta page: claude.ai/artifact/P6zT2b2SwfHYguRTtb67Ug. Owner: Alex (iPhone 16 landscape + PC). Full history and old rules: docs/LESSONS_and_old_rules.md (read only when needed).

## Production model (2026-10-14, after $700+ and many reverts)
1. Few lanes, short tasks: at most 3 workers at once (1 integrator on Sonnet, ≤2 fixers). Each task is timeboxed to ~30 min or ~100k context, with ONE deliverable; then the worker writes 5 lines in docs/HANDOFF_<lane>.md, pushes and STOPS. No idle or self-waking workers, no queues, no open-ended lanes.
2. Cheapest model that can do it: Haiku for mechanical work, Sonnet for bugs with a repro, UI, integration and tests, Opus only for design or feel or anything Sonnet failed twice. Subagents: always set `model`.
3. Push only green: before every push, build (tools/build.sh) and run unit (`node tools/unit/run.js`, 0 FAIL) + your TAG + `TAG=life1,xf1,terrain` on the BUILT page, not hot. WIP sits behind a flag that defaults OFF until its tests pass. A reverted push is the most expensive outcome.
4. Tests are state asserts with no graphics (checklist GO in src/99c_checklist.js with a pass line). No real-time play as a test. One 852×393 shot only for visual changes, and LOOK at it. Each 2K-Drive-quality claim needs a side-by-side shot with a reference.
5. Token hygiene: print only pass/fail lines (`| tail -5`); never read files > 50 KB whole (grep or a line range); no polling loops or sleeps (run in the background and wait for the notification); hand off at 100k context.
6. Workers message the coordinator once, at the end: ≤ 5 lines (commit, what changed, measured result, what's left). No progress chatter.
7. The coordinator only routes and deploys. It deploys at most every 30 min (batch builds), never does technical work, and stays under 100k context (/compact).
8. Bugs come from the in-game 🐞 button → artifact db collection `bugs` (read with ArtifactData). Triage sets status/owner/fixedIn on the doc so Alex sees it in "My reports".

## Standing orders from Alex
- Never ask Alex anything; take the recommended option and note it in one line.
- Reuse first: grep the repo, then three.js addons, LDraw/OMR, Yuka, etc. Note the licence in the commit.
- Match LEGO 2K Drive (deep blue sky, brick clouds, glossy LEGO cars on the road, lively streets, fun varied tracks). Fun beats metrics: green tests ≠ playable.
- Phone first: iPhone landscape + portrait, no HUD over controls, 12 px minimum text.
- Keep `ALL_OPEN=true`, the credits "Made with ❤ by Alex" and "3D models by Alex", English UI, gas default on touch. No model names in files or commits.
- Every deploy prepends an `OD_CHANGELOG` entry (version, date, 2-4 plain lines). Never deploy an unsplit build (3.6 MB cap). The coordinator deploys with `deploy.sh`, then republishes the Beta artifact with all chunks (km.js, models.js, tune.json, models/{lx,as,xf,qa}.js, xc/*.js).
