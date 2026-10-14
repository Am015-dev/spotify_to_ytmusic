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
- No screenshots for anyone to look at. Pixel baselines are allowed only as a machine gate (never opened by a model; branch ui-baselines).

## How we work (owner, 14 Oct 2026: "you waste way too many tokens and deliver shit results")
- At most 3 workers at once: 1 integrator (Sonnet) + up to 2 fixers. Never 15 in parallel.
- One task = ~30 min and ONE deliverable, fully briefed up front (games-src/BRIEF-TEMPLATE.md). Then 5 report lines and stop.
  No idle workers, no self-wake-ups, no follow-up messages except the owner's new bug reports.
- Cheapest model that can do it: Haiku for mechanical work, Sonnet for bugs and UI, Opus only for design and feel. Always set it.
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
