# Game Night Shelf: read this first

Browser board games, published from `games/` at https://am015-dev.github.io/spotify_to_ytmusic/.
Work on branch `alex/brave-carson-rbpmlk`; never merge to main. Next steps: `games-src/HANDOFF.md`.
**How to work (new game, improvement, bug fix): `games-src/PLAYBOOK.md`.** Full method: the project skill `.claude/skills/boardgame-builder/` (loads automatically; read `references/board-first-play.md`).

## Hard rules
- Never write an original game's, publisher's or designer's name in this repo or on the site. No model names in
  files, commits or PRs. Research and publisher material only in the private repo `Am015-dev/game-night-private`.
- **Publish live** (owner's decision, 5 Oct 2026): a finished game goes straight to `games/<slug>/index.html` once its
  sweep/phone-check passes. No more preview step; `-next` folders are retired.
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
- **AI testers miss bugs the owner finds in seconds.** Scripts find bugs, not AI eyes:
  - each game has `sweep.js` (40+ full games through the real page with touch taps at 390×763 and 375×553, plus
    rotations) and `rotate-test.js`. They fail on page errors, a glowing target that doesn't respond, a wrong hint
    or hint text ≠ finger, on-screen scores ≠ engine, anything stuck >8 s, covered buttons, horizontal scroll.
    Run them before every deploy; a failing sweep blocks the deploy.
  - The owner's bug reports go first into the fixer's brief, then into the sweep.
  - AI blind testers (`drive-serve.js`) only rate fun/clarity: one, once, at the end (~100k tokens each).
  - Phone rotation: iOS reports the old size right after rotating. Use one debounced relayout fed by resize,
    orientationchange, visualViewport and ResizeObserver, re-measured after ~400 ms.
- **"No story mode":** chapters with bosses and a difficulty curve (`games-src/shell/CAMPAIGN.md`).

## Cost rules (about $4,000 was spent, mostly waste)
- **Always set the model on every helper and cloud session.** The default is the most expensive model; all 45 earlier
  cloud sessions ran on it by accident. Main model: plan, decide, review only (no hands-on screenshots). Sonnet: build, fix, sweeps.
  Haiku: downloads, copying, simple loops.
- One fixer per game, one round, one deploy: the brief names exact functions/lines (grep first) and every known
  bug; the fixer fixes until the sweep is clean and reports in under 150 words. No AI-tester rework loops.
- One session, at most 2 subagents, 1–2 games finished per session. No new cloud sessions.
- Answer each helper report once; ignore duplicate notifications. Commit work in progress as you go.
- No PR subscriptions, polling or scheduled wake-ups unless the owner asks.
- Prove the approach on one game before touching others. Clarity before features.
- Keep context small: hand off to a new session with an updated `games-src/HANDOFF.md`.
- Merge your own work. Never ask the owner to review PRs. Live deploys of games that pass their checks are pre-approved by the owner.
- Update `games/previews.html`, and end with ONE link plus 5 lines (before → after numbers, what's weak).
