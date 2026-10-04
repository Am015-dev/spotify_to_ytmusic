# Game Night Shelf: read this first

Browser board games, published from `games/` at https://am015-dev.github.io/spotify_to_ytmusic/.
Work on branch `alex/brave-carson-rbpmlk`; never merge to main. Next steps: `games-src/HANDOFF.md`.
Full method: the `boardgame-builder` skill (`skills/boardgame-builder.zip`; read `references/board-first-play.md`).

## Hard rules
- Never write an original game's, publisher's or designer's name in this repo or on the site. No model names in
  files, commits or PRs. Research and publisher material only in the private repo `Am015-dev/game-night-private`.
- Publish to a preview (`games/<slug>-next/`). The live `games/<slug>/index.html` changes only after the owner OKs it.
- Don't edit the Mainhattan / Overdrive games (other sessions own them). Ticket to Ride is on hold.
- Run `games-src/scripts/stamp-copyright.py` on deployed files. Before pushing, run
  `git fetch origin alex/brave-carson-rbpmlk && git merge`; never force-push.
- If a command is blocked, stop and tell the owner; don't work around it.

## Lessons learnt (the owner's verdicts)
- **"Not like the real game" / "boring":** implement the real rules, and make the real game's fun moment (the bag
  draw, the colour grab, the wire cut) the big, tactile centrepiece.
- **"Confusing":** players don't read. Play happens on the board (`games-src/clarity-briefs/BOARD-FIRST.md`):
  - the board fills the screen;
  - you tap or drag the piece itself, and legal targets glow;
  - at most one line of text, 8 words or fewer;
  - a ghost finger shows the first move;
  - scores pop up where they're earned, and the computer's moves animate.
  - Portrait phone first (390×763, 375×553).
  - Hints must be right or absent.
- **AI reviews passed games that humans failed.** "Done" = 3 human-like blind testers via
  `games-src/scripts/drive-serve.js`:
  - they read 8 words at most and decide in 2 seconds;
  - ≤2 lost moments and ≤3 dead taps after the first minute;
  - fun ≥4/5;
  - each names an exciting moment and the goal.
  - Take a baseline first, then up to 3 rounds.
- **"No story mode":** chapters with bosses and a difficulty curve (`games-src/shell/CAMPAIGN.md`).

## Cost rules (about $4,000 was spent, mostly waste)
- One session, at most 2 subagents, 1–2 games finished per session. No new cloud sessions.
- No PR subscriptions, polling or scheduled wake-ups unless the owner asks.
- Prove the approach on one game before touching others. Clarity before features.
- Keep context small: hand off to a new session with an updated `games-src/HANDOFF.md`.
- Merge your own work. Never ask the owner to review PRs.
- Update `games/previews.html`, and end with ONE link plus 5 lines (before → after numbers, what's weak).
