# Orchestrator efficiency rules (owner asked "is this efficient?", 20 Nov 17:48)
- Model: Sonnet for fixers with a clear list; Opus only for "make it fun" reworks and strict reviews; Haiku for chores.
- Every brief: "Aim ~30 min, stop by 45. Use an Explore/search subagent instead of reading whole files; read only line ranges you change. Run --full ONCE (again only if it looks flaky). One round, then report."
- Strict review only after a fixer's cold tester gives >= 4/5; below that -> next fixer with the tester's list.
- Panel data refresh every ~40 min (append mode).
- Every brief includes the PC layout check (1366x768, 1920x1080, mouse).

## BUDGET FREEZE (owner, 21:08 20 Nov: "71% of usage spent")
- No new workers except: (a) a fixer/review that takes a game to LIVE next, (b) a fix for a visible-name or stopper issue on a live game. Max 6 workers at once.
- Sonnet by default; Opus only for the strict review of a game about to go live. No new design passes or content rewrites; running ones finish, queue is paused.
- Every round must end in something live or be stopped. Report spend vs live results each round.
- FOCUS 4 (owner OK 21:22): sunglaze (F6 -> strict review), kaiten-kitchen (F5 -> strict review), wildmark (F4 -> strict review), perch-and-plume (F5 -> strict review). Each: cold >=4/5 -> Opus strict review -> PASS -> panel decision 'go live?' -> squash-merge + deploy. Any other report: archive, note on panel, NO follow-up worker.
- owner 23 Nov: max 5 workers at once.
- owner 23 Nov 23:05: max 7 workers (not excessive cost).
