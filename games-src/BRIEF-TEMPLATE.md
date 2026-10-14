# Worker brief: paste this at the top of every new worker or cloud session

Fill the three <...> parts, delete nothing else. Keep the whole brief under ~60 lines.

```
Owner authorisation: Alex (repo owner) has approved this task: <one line, quote the owner's words if there are any>.
Repo /home/user/spotify_to_ytmusic, branch alex/brave-carson-rbpmlk. Model: <haiku for chores/status/copying/repeating a known fix; sonnet for code, fixes, tests> (set it on this session; see CLAUDE.md model tiers).

Task: <games: at most 2-3, each deployed as soon as it passes>
Known bugs / asks (every one, in the owner's words): <list>
Exact places (grep first): <file:function or file:line for each>

Rules
- Read CLAUDE.md and games-src/PLAYBOOK.md first, nothing else big.
- Never write an original game's, publisher's or designer's name; no model names; no Co-Authored-By, Claude-Session or other AI
  attribution in files, commits or PRs. Never force-push. Don't touch Mainhattan Overdrive; Nightrun only if named here.
- Before every push: git fetch origin alex/brave-carson-rbpmlk && git merge. `git add` explicit paths only, check
  `git diff --cached --stat` before committing (other sessions share this branch).
- If a command is blocked, stop and tell the owner.
- HARD STOP: at 45 minutes or ~150k context, stop yourself: deploy what passed, commit + push, write a HANDOFF note, stop.
- A check failure that the LIVE game also has is not yours: deploy anyway (build-all.py already warns instead of failing).
- NEVER wait for an answer (owner, 13 Oct 2026: workers sat blocked for ~15-20 min). If a check fails or you're unsure: fix the real
  cause (max 20 min), never raise limits or skip checks; if it still fails, commit, write what fails and where in HANDOFF.md,
  move on to your next game, and mention it in your report.

Read less (this is the main cost lever)
- Start with `games-src/scripts/find.sh --maps` and open ONLY the game's MODULES.md. Then `games-src/scripts/find.sh <symbol|text> <game>`.
  Read only the line ranges you will change. Never read the built html, x.js or a joined ui.js. Edit the file that owns the
  function; do not add layer files (ui14.js). guard.py fails the build if you do.
- Hand off at ~150k context tokens: stop, commit, write a HANDOFF note (games-src/HANDOFF.md section for this task: done, next, files),
  and report. Do not run on to 450k.

Fast loop
- NO screenshots, contact sheets or before/after images (owner's order). Deliver: change + ?scn= scenario + ✔ Test item with GO.
- Scenario first: for each ask, register a ?scn=<id> scenario (games-src/shell/gx-scenario.js) and watch it fail, then fix.
- Iterate with `python3 games-src/scripts/build-all.py --quick <slug>` (under 3 min). Go live with `--deploy <slug>` as soon as it
  passes (quick sweep; `--full` only for engine/rules changes). Then `add-update.py <game> "headline" "item" --check "..." --scn <id>`.
- Commit at least every 10 minutes (explicit paths). Push after fetch+merge.

Report (under 150 words, once): per game before -> after numbers, scenario ids, the live link, what is still weak.
```

Orchestrator notes
- ONE session per game, at most 15 at a time. Title starts with the group tag ([ART] [TESTS] [LAB] [FIX] [NIGHTRUN] [OPS]) + game; tag it
  group:<name> (set_session_tags); add it to the groups table in HANDOFF.md. Model: Haiku for chores (status refresh, copying, converting, repeating
  an already-written fix, checks that only report), Sonnet for code/fixes/tests. Never the main model for workers.
- Put the owner's bug reports first in "Known bugs" and name the function (run `find.sh` yourself, it is cheap).
- If a worker reports it is out of context, start a new session with this template plus its HANDOFF note.
