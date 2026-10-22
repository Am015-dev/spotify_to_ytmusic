# Proposed CLAUDE.md amendments (process audit, 2026-10-22)
Paste above "## Standing orders from Alex" once Alex approves. Details and sources: .claude/skills/fun-game-design/SKILL.md Phase 9.

## Amendments 2026-10-22 (override rules 1, 3, 4, 7 where they conflict)
11. Preview every deploy: also publish a Beta-preview with all new ?cl/feature flags ON, so Alex plays new work the same day. A flag stays default OFF at most 1 day; then it ships ON or is deleted.
12. Phone profile is the default test profile: iPhone UA + phone perf tier/compaction + 852x393 touch + 6x CPU. Desktop UA is the extra run (the invisible-car bug only existed on the phone path).
13. Bug lanes start from Alex's exact words: write the check, see it FAIL on the live build, fix the root cause, see it PASS. Bug timebox ~90 min (not 30-40).
14. Visual lanes carry the reference image (docs/shots/bench) and a number to hit (e.g. studs readable at 50 m >= 6 px); the reviewer looks at the before/after shots.
15. No known-red list: a red or flaky GO is fixed or deleted within 1 day; never ship through a red by bypassing its GO.
16. A play-like bot (tools/bughunt.js, time-accelerated) on the phone profile is a pre-deploy gate once it exists.
17. Small measurable fixes may ship on green automated gates without waiting for the reviewer; the reviewer handles visuals, feel and core code first.
18. One coordinator only; other sessions route Alex's asks to it. Deploy as soon as a reviewed fix is green (no 30-min batching).
