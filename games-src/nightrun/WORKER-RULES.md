# Nightrun worker rules (every Nightrun brief starts with: "Read games-src/nightrun/WORKER-RULES.md first")

Why this file exists (21 Oct 2026): 14 workers finished in 7-198 min (median ~85 min for Opus design jobs) but the owner only heard
about them 2+ hours later: the briefs had dropped the DONE trigger and the HARD STOP from games-src/BRIEF-TEMPLATE.md.

1. REPORT THE MOMENT YOU FINISH: your last action, after the push, is mcp__claude-code-remote__create_trigger with
   persistent_session_id=session_01MS7iGyBWDerEAyagJ6ir4U, run_once_at = now + 1 min, prompt = "[DONE <title>] <5 lines>".
   Report even if blocked or partly done. Never end on a question.
2. HARD STOP at 45 minutes wall time (60 for Opus design): push what passes behind its flag, write what is left in
   games-src/nightrun/HANDOFF-<title>.md, report. A flag-off partial is better than a late perfect.
3. PUSH INCREMENTS: after each green step (flag + its own test + hud-cover + ui-align) fetch, merge and push, so the owner can test early. Do not hold everything for the end.
4. MEASUREMENT BUDGET: at most 10 minutes of bot runs per measurement; RUNS=8 (12 only for the final gate); do not re-run a suite
   whose inputs did not change. Run independent tests in parallel (2 at a time max; each container has 4 CPUs) except bot suites.
5. READ LESS: games-src/nightrun/WHERE.md (8 KB) then MODULES-COMPACT.md (7 KB); read only the line ranges you change.
6. NO NEW ASSETS (games-src/nightrun/ASSET-POLICY.md). Look at phone screenshots of any screen you change (owner request, 21 Oct).
7. Do not run more than one full-game crawl or coverage script per hour.
