# Mainhattan Overdrive (LEGO-2K-Drive-style, Frankfurt + Athens): read first
Knowledge: docs/wiki/index.md (read it before grepping).
Live: games/mainhattan-overdrive/ on alex/brave-carson-rbpmlk. Trunk: alex/od-int2. Beta page: claude.ai/artifact/P6zT2b2SwfHYguRTtb67Ug. Owner: Alex (iPhone 17 landscape + PC). Full history and old rules: docs/LESSONS_and_old_rules.md (read only when needed).

## Production model (2026-10-14, after $700+ and many reverts)
1. Exactly 2 workers plus 1 reviewer at once (Alex, 2026-10-20, replaces the earlier 5+1: too many bugs from too many parallel changes). The reviewer checks every worker commit (diff read, rebuild, unit + TAG + bot, golden if visuals changed) BEFORE the coordinator deploys; a failed review sends it back to the same worker. Each task is timeboxed to ~30-40 min or ~100k context, with ONE deliverable; then the worker writes 5 lines in docs/HANDOFF_<lane>.md, pushes and STOPS. No idle or self-waking workers, no queues, no open-ended lanes. Pick targets from Alex's own words or the Beta perf db, in his priority order.
2. Model by task complexity (Alex, 2026-10-20). The coordinator scores every task before spawning and writes the model in the lane title:
   - HAIKU = low: mechanical, one file or a table, no judgement (changelog text, ledger rows, renames, config/tune values, docs, branch lists, asset catalogue entries, re-running a gate and reporting).
   - SONNET = medium: a bug with a repro, a feature in 1-3 modules, UI, tuning with a measurable target, tests/GO asserts, data fixes (ramps, assets from a parts list), integration, telemetry.
   - OPUS = high: design or feel plans, anything touching 4+ modules or the render/physics core, cross-cutting performance with no known owner, graphics tiers, reviews of feel/visuals, the reviewer's verification of risky commits, and any bug Sonnet missed twice.
   When unsure between two levels, pick the higher for the first try only if a miss would be expensive to undo (shared code, perf, deploy gate); otherwise the lower. Subagents: always set `model`.
3. Push only green: before every push, build (tools/build.sh) and run unit (`node tools/unit/run.js`, 0 FAIL) + your TAG + `TAG=life1,xf1,terrain` on the BUILT page, not hot. WIP sits behind a flag that defaults OFF until its tests pass. A reverted push is the most expensive outcome.
4. Tests are state asserts with no graphics (checklist GO in src/99c_checklist.js with a pass line). No real-time play as a test. One 852×393 shot only for visual changes, and LOOK at it. Each 2K-Drive-quality claim needs a side-by-side shot with a reference.
5. Token hygiene: print only pass/fail lines (`| tail -5`); never read files > 50 KB whole (grep or a line range); no polling loops or sleeps (run in the background and wait for the notification); hand off at 100k context.
6. Workers message the coordinator once, at the end: ≤ 5 lines (commit, what changed, measured result, what's left). No progress chatter.
7. The coordinator only routes and deploys. It deploys at most every 30 min (batch builds), never does technical work, and stays under 100k context (/compact).
8. Bugs come from the in-game 🐞 button → artifact db collection `bugs` (read with ArtifactData). Triage sets status/owner/fixedIn on the doc so Alex sees it in "My reports".

9. Cost discipline (Alex, 2026-10-20, see docs/COST_LEDGER.md): two lanes per target, then a design plan or drop it; model by task complexity (rule 2); the coordinator hands off at 200k context; the ledger gets one row per lane at every deploy.
10. iPhone truth first: no build counts as smooth on phones without the throttled iPhone-like gate (perf/ios-reveal: 6x CPU, 0 shader links and no long frames in the first 3 s after reveal) or real iPhone reports from the Beta page.
## Amendments 2026-10-22, approved by Alex (process audit; details in .claude/skills/fun-game-design Phase 9; override rules 1, 3, 4, 7 where they conflict)
11. Preview every deploy: also publish a Beta-preview with all new ?cl/feature flags ON, so Alex plays new work the same day. A flag stays default OFF at most 1 day; then it ships ON or is deleted.
12. Phone profile is the default test profile: iPhone UA + phone perf tier/compaction + 852x393 touch + 6x CPU. Desktop UA is the extra run (the invisible-car bug only existed on the phone path).
13. Bug lanes start from Alex's exact words: write the check, see it FAIL on the live build, fix the root cause, see it PASS. Bug timebox ~90 min (not 30-40).
14. Visual lanes carry the reference image (docs/shots/library, see INDEX.md) and a number to hit (e.g. studs readable at 50 m >= 6 px); the reviewer looks at the before/after shots.
15. No known-red list: a red or flaky GO is fixed or deleted within 1 day; never ship through a red by bypassing its GO.
16. A play-like bot (tools/bughunt.js, time-accelerated) on the phone profile is a pre-deploy gate once it exists.
17. Small measurable fixes may ship on green automated gates without waiting for the reviewer; the reviewer handles visuals, feel and core code first.
18. One coordinator only; other sessions route Alex's asks to it. Deploy as soon as a reviewed fix is green (no 30-min batching).
## Standing orders from Alex
- Never ask Alex anything; take the recommended option and note it in one line.
- Reuse first: grep the repo, then three.js addons, LDraw/OMR, Yuka, etc. Note the licence in the commit.
- Match LEGO 2K Drive (deep blue sky, brick clouds, glossy LEGO cars on the road, lively streets, fun varied tracks). Fun beats metrics: green tests ≠ playable.
- Phone first: iPhone landscape + portrait, no HUD over controls, 12 px minimum text.
- Keep `ALL_OPEN=true`, the credits "Made with ❤ by Alex" and "3D models by Alex", English UI, gas default on touch. No model names in files or commits.
- Every deploy prepends an `OD_CHANGELOG` entry (version, date, 2-4 plain lines). Never deploy an unsplit build (3.6 MB cap). The coordinator deploys with `deploy.sh`, then republishes the Beta artifact with ALL chunks: km.js, models.js, tune.json, EVERY models/*.js (about 150 per-car files; missing them broke most garage cars until beta.158) and every xc/*.js.

## Cost (Alex, 22 Oct: "very expensive compared to the deliverables, most were fixing your own bugs")
- Only player-visible work from Alex's words. No test-only or flake lanes unless a release check blocks a deploy. One worker at a time unless Alex asks for more.

## Branches (Alex, 2026-10-20: never let branches pile up again)
- Only these live on origin: `main`, trunk `alex/od-int2`, live `alex/brave-carson-rbpmlk` (deploy.sh target), plus the current coordinator session's own branch.
- Workers push ONLY to `alex/od-int2` (fetch + rebase). A `<lane>-final` branch is allowed only when that push is denied; the coordinator cherry-picks it into trunk and deletes it in the same check.
- Reviewers commit `docs/REVIEW_2K_<n>.md` + `docs/shots/rev<n>/` straight to `alex/od-int2` (docs-only commit). No `alex/rev<n>` branches.
- Coordinator, at every deploy: delete remote branches whose head is already in trunk, live or main; tag anything else older than 12 h as `archive/<branch>` and delete it. Nothing else creates branches.
