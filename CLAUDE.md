# Game Night Shelf: read this first (keep this file under 3 KB)

Browser board games, live from `games/` at https://am015-dev.github.io/spotify_to_ytmusic/. Branch `alex/brave-carson-rbpmlk`,
never main. Next steps: `games-src/HANDOFF.md`. How-to: `games-src/PLAYBOOK.md`. UI standard: `games-src/UI-BAR.md`.
Old rules and lessons (read only when needed): `games-src/RULES-ARCHIVE.md`.

## Hard rules
- Never write an original game's, publisher's or designer's name in the repo or on the site. No model names, no Co-Authored-By,
  Claude-Session or other AI attribution in files, commits or PRs.
- Don't edit Mainhattan Overdrive. Nightrun belongs to this orchestrator. Ticket to Ride is on hold.
- Before pushing: `git fetch origin alex/brave-carson-rbpmlk && git merge`; never force-push; `git add` explicit paths only.
- If a command is blocked, stop and tell the owner. Never ask a worker question you could decide yourself; never wait.
- Screenshots vs benchmarks (URLs); no visual deploy unless every critic row >= 7 and the orchestrator saw the shots.
- Nightrun FEATURE FREEZE (24 Oct): look first, rules in WORKER-RULES.md 15-17 (17 = one-shot benchmark gate).

## How we work (owner, 14 Oct 2026: "you waste way too many tokens and deliver shit results")
- Workers: owner (20 Oct 2026) wants at least 5 workers + 1 reviewer at once on Nightrun, models chosen by task (see Cheapest model line). Never 15 in parallel.
- One task = ~30 min and ONE deliverable, fully briefed up front (games-src/BRIEF-TEMPLATE.md). Then 5 report lines and stop.
  No idle workers, no self-wake-ups, no follow-up messages except the owner's new bug reports.
- Model by task complexity (owner, 20 Oct 2026), always set it: HAIKU = mechanical, checklist, no judgement (run tests, bisect by flag,
  copy, list, wire known ids, data-table edits). SONNET = well-specified code, bugs, tuning to a measurable gate, research.
  OPUS = open design/feel, cross-system changes, reviewer scoring, anything a cheaper tier failed twice. Escalate one tier after a
  failed attempt; never Opus for chores.
- Push only what passes: phone-check + the change's key ?scn= tests on a full build before push; unfinished work is switched off
  by default (flag), so nothing gets reverted.
- Done = the independent audit passes (games-src/scripts/ui-audit.spec.js), never a worker's self-report.
- Quiet workers: print only pass/fail lines; one message at the end.
- Orchestrator: deploys at most every 30 min, stays under 100k tokens of context (hand off with a HANDOFF note), reports to the
  owner once per round with live times in UTC.
- Read less: start from `games-src/scripts/find.sh --maps` and the game's MODULES.md; read only the line ranges you change; never
  read built html, x.js or joined ui.js. Edit the file that owns the function.
- Prove a change on one game, owner says yes, then roll out. Shared/shell changes deploy all games in ONE build-all call.
- Run `games-src/scripts/stamp-copyright.py` on deployed files. Live deploys that pass their checks are pre-approved.
