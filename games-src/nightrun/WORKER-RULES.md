# Nightrun worker rules (every Nightrun brief starts with: "Read games-src/nightrun/WORKER-RULES.md first")

Why this file exists (21 Oct 2026): 14 workers finished in 7-198 min (median ~85 min for Opus design jobs) but the owner only heard
about them 2+ hours later: the briefs had dropped the DONE trigger and the HARD STOP from games-src/BRIEF-TEMPLATE.md.

1. REPORT THE MOMENT YOU FINISH: your last action, after the push, is mcp__claude-code-remote__create_trigger with
   persistent_session_id=session_01MS7iGyBWDerEAyagJ6ir4U, run_once_at = now + 1 min, prompt = "[DONE <title>] <5 lines>".
   Report even if blocked or partly done. Never end on a question.
2. HARD STOP at 45 minutes wall time (60 for Opus design): push what passes behind its flag, write what is left in
   games-src/nightrun/HANDOFF-<title>.md, report. A flag-off partial is better than a late perfect.
3. PUSH INCREMENTS TO YOUR OWN BRANCH (owner, 21 Oct 22:40: "always review before deploying"): never push to
   alex/brave-carson-rbpmlk (it deploys live). Push each green step to `nr/<your Wxx>` (git push -u origin HEAD:nr/W1xx), merged
   with the latest alex/brave-carson-rbpmlk first. The orchestrator reviews (your test + smoke + a look) and merges it live.
4. MEASUREMENT BUDGET: at most 10 minutes of bot runs per measurement; RUNS=8 (12 only for the final gate); do not re-run a suite
   whose inputs did not change. Run tests ONE AT A TIME: running two at once gave a false hud-cover FAIL (re-run alone passed, 21 Oct); parallelism comes from separate workers, not from tests inside one worker.
5. READ LESS: games-src/nightrun/WHERE.md (8 KB) then MODULES-COMPACT.md (7 KB); read only the line ranges you change.
6. NO NEW ASSETS (games-src/nightrun/ASSET-POLICY.md). Look at phone screenshots of any screen you change (owner request, 21 Oct).
7. Do not run more than one full-game crawl or coverage script per hour.
8. EVERY THING ON SCREEN MUST BE EXPLAINED (owner, 21 Oct: "so many unexplainable visuals, gamer is angry and confused"):
   any ring, icon, bar, label, effect or button you add or touch must be (a) readable by its shape/colour alone, (b) captioned
   in plain words the first time it appears, or (c) removed. No abbreviations or symbols without words (no "x~97s").
9. TEST TIME BUDGET (owner, 22 Oct 05:05: "who told you to spend so much time running the game, is it efficient?"): run ONLY the
   test that proves your fix plus `guard.py` and one 2-minute smoke; no stage 1-20 sweeps or "3 consecutive runs" unless the task is
   balance/difficulty. New or edited tests step game time faster than real time (`__mnr.step(dt)` loops), never wait on wall-clock play.
   PLAY AT x100, NEVER IN REAL TIME (owner, 23 Oct 2026: "it's a worker, play more on speed x100, you are not a human"): every play test,
   balance measure and review runs the game in stepped simulation at >= 100x real time (qa/simhunt.js; the street through its street mode),
   with many runs (>= 50 per bot) instead of a few real-time ones. Real-time play is allowed only for what cannot be stepped (audio clock,
   network loading), capped at 60 s per test.
10. REVIEWS SCORE FUN, NOT FIXES (owner, 22 Oct 05:55: "the review must be strict, the score is not even 12/100"): every reviewer
   is anchored to the real players' score (10-12/100). Score what a player experiences (fun, clarity, fairness, tension, looks, sound),
   never whether a fix landed. Each category starts at the players' level and moves only with concrete before/after evidence
   from play; a 'fixed' defect that still feels bad scores as not fixed. State the headline as 'player-equivalent score'.
11. SIMHUNT IS THE DEFAULT GATE (22 Oct): before you report, run `node games-src/nightrun/qa/simhunt.js` (2-3 min, all stages at
   sim speed) and paste its summary; a new NaN, stuck stage, escape spike or overlap you caused is a FAIL. Real-time bot runs only
   when the task is about feel/timing and the brief says so.
12. DO NOT COMMIT GENERATED FILES: never commit games/mainhattan-nightrun/index.html, sw.js, WHERE.md or MODULES-COMPACT.md on
   your nr/ branch (the orchestrator rebuilds once after merging). Add a new part to build.py only by appending ONE line
   `PARTS_EXTRA.append('<file>.js')` if present, never by editing the long `out=` line.
13. CHANGE WHAT THE PLAYER DOES, NOT ONLY WHAT THEY SEE: a design task must name the player decision it creates or sharpens
   (e.g. 'EMP now or save it', 'graze for score or stay safe') and a measure of it; polish tasks say so in the title.
14. FUN SKILL: any design/feel task loads the `fun-game-design` skill first and follows it.
15. CODING DISCIPLINE (owner, 23 Oct 2026: "look up the karpathy skill"; from the public "Karpathy guidelines" CLAUDE.md, paraphrased):
   (a) Think before coding: write down your assumptions; if the brief can be read two ways, pick the one the owner's words support and say so.
   (b) Simplicity first: the least code that solves the ask; no unrequested features, one-use abstractions or speculative options.
   (c) Surgical changes: touch only what the task needs, match the surrounding style, leave unrelated code alone (mention it, don't delete it);
       every changed line traces back to the ask. Never let a // comment swallow code on a one-line part (it broke the build twice on 23 Oct).
   (d) Goal-driven: turn the ask into a check first (a qa test that fails), then make it pass; loop until it does.
16. TOKEN DISCIPLINE (owner, 23 Oct 2026: "projects don't spend extreme number of tokens"; from public Claude Code and game-dev advice):
   (a) Tool output is the biggest cost: grep for the lines you need, read line ranges, never cat whole files or built html; print PASS/FAIL only.
   (b) One bounded task per session with a clean HANDOFF note; no marathon sessions.
   (c) Cheapest model that can do it (CLAUDE.md tiers); effort low for chores.
   (d) Screenshots: compare with games-src/nightrun/benchmark/ instead of retaking; retake only the screen you changed.
   (e) Automated tests catch crashes and regressions; feel and balance need the owner's play. Ask for it instead of looping bots past the point
       where numbers stop moving (23 Oct: four balance rounds moved the casual-bot clear rate 44 -> 4 -> 18 -> 20%).
