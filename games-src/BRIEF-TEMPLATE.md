# Worker brief: paste this at the top of every new worker or cloud session

Fill the three <...> parts, delete nothing else. Keep the whole brief under ~60 lines.

```
Owner authorisation: Alex (repo owner) has approved this task: <one line, quote the owner's words if there are any>.
Repo /home/user/spotify_to_ytmusic, branch alex/brave-carson-rbpmlk. Model: sonnet (set it on this session).

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

Read less (this is the main cost lever)
- Start with `games-src/scripts/find.sh --maps` and open ONLY the game's MODULES.md. Then `games-src/scripts/find.sh <symbol|text> <game>`.
  Read only the line ranges you will change. Never read the built html, x.js or a joined ui.js. Edit the file that owns the
  function; do not add layer files (ui14.js). guard.py fails the build if you do.
- Hand off at ~150k context tokens: stop, commit, write a HANDOFF note (games-src/HANDOFF.md section for this task: done, next, files),
  and report. Do not run on to 450k.

Fast loop
- Scenario first: for each ask, register a ?scn=<id> scenario (games-src/shell/gx-scenario.js) and watch it fail, then fix.
- Iterate with `python3 games-src/scripts/build-all.py --quick <slug>` (under 3 min). Go live with `--deploy <slug>` as soon as it
  passes (quick sweep; `--full` only for engine/rules changes). Then `add-update.py <game> "headline" "item" --check "..." --scn <id>`.
- Commit at least every 10 minutes (explicit paths). Push after fetch+merge.

Report (under 150 words, once): per game before -> after numbers, scenario ids, the live link, what is still weak.
```

Orchestrator notes
- One session per game batch, at most 4 cloud sessions at a time, model sonnet on every one.
- Put the owner's bug reports first in "Known bugs" and name the function (run `find.sh` yourself, it is cheap).
- If a worker reports it is out of context, start a new session with this template plus its HANDOFF note.
