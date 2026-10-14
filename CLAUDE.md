# Game Night Shelf: read this first

Browser board games, published from `games/` at https://am015-dev.github.io/spotify_to_ytmusic/.
Work on branch `alex/brave-carson-rbpmlk`; never merge to main. Next steps: `games-src/HANDOFF.md`.
**How to work (new game, improvement, bug fix): `games-src/PLAYBOOK.md`.** Full method: the project skill `.claude/skills/boardgame-builder/` (loads automatically; read `references/board-first-play.md`).

## Hard rules
- Never write an original game's, publisher's or designer's name in this repo or on the site. No model names in
  files, commits or PRs. Research and publisher material only in the private repo `Am015-dev/game-night-private`.
- **Publish live** (owner's decision, 5 Oct 2026): a finished game goes straight to `games/<slug>/index.html` once its
  sweep/phone-check passes. No more preview step; `-next` folders are retired.
- Don't edit Mainhattan Overdrive (other sessions own it). Mainhattan Nightrun belongs to the Game Night orchestrator
  and its workers (owner's decision, 7 Oct 2026). Ticket to Ride is on hold.
- Run `games-src/scripts/stamp-copyright.py` on deployed files. Before pushing, run
  `git fetch origin alex/brave-carson-rbpmlk && git merge`; never force-push.
- If a command is blocked, stop and tell the owner; don't work around it.
- No Co-Authored-By, Claude-Session or any other AI attribution lines in commits or PRs (owner's order, 5 Oct 2026).

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
    Deploy gate (owner, 13 Oct 2026: "fast tests, not hours of sweeps", Overdrive-style): `build-all.py --deploy`
    = phone-check + the change's `?scn=` GO scenario tests + look check; any failure blocks. NO game playing
    (owner: "don't play the game"): sweeps run only with `--full`, for engine/rules changes. The fast gate tests at
    phone size only (390×763); all sizes + LAB test run with `--full`. Max 2 deploys at once per machine (4 cores; 5 at once
    pushed the load to 17 and 3D games render in software). The owner checks via the
    ✔ Test checklist scenarios (one tap each), not by playing whole games.
  - The owner's bug reports go first into the fixer's brief, then into the sweep.
  - AI blind testers (`drive-serve.js`) only rate fun/clarity: one, once, at the end (~100k tokens each).
  - Phone rotation: iOS reports the old size right after rotating. Use one debounced relayout fed by resize,
    orientationchange, visualViewport and ResizeObserver, re-measured after ~400 ms.
- **NO SCREENSHOTS (owner, 13 Oct 2026: "stop making screenshots, wire and create tests with GO I can approve").** Workers take
  no screenshots, contact sheets, before/after images or shot grids, and commit no png/webp shots. Deliverable = the change + a
  `?scn=` scenario with machine checks + a ✔ Test checklist item with GO. The owner approves by tapping GO. Only exception: the
  owner asks for an image.
- **Fast loop (owner, 13 Oct 2026; same rules as Overdrive):**
  - Tests first: a task's FIRST commit is its acceptance tests. Each test is one ✔ Test checklist item with a plain pass line
    and a `?scn=` link that spawns ONLY that requirement, plus an automated check of the same spawn that acts with REAL taps
    (no forced state during the tested action). Done = every test passes and its GO item is in the ✔ Test checklist.
  - The whole test set for a change runs in under 3 min. Prove a test with a 1-min dry run before any longer run; a run that
    fails on a script error is fixed, never repeated.
  - Workers never wait for an answer: fix the cause (max 20 min) or note it in HANDOFF.md and move on to the next game.
  - Workers commit at least every 10 min. Features over ~1 h or ~$5: spec + 3 acceptance tests + one mock-up first; the
    orchestrator asks the owner one yes/no.
- **"No story mode":** chapters with bosses and a difficulty curve (`games-src/shell/CAMPAIGN.md`).

## Cost rules (about $4,000 was spent, mostly waste)
- **Always set the model on every helper and cloud session.** The default is the most expensive model; all 45 earlier
  cloud sessions ran on it by accident. Main model: plan, decide, review only (no hands-on screenshots). Sonnet: build, fix, sweeps.
  Haiku: downloads, copying, simple loops.
  Pick the cheapest model that can do the job, and write it in every brief (owner, 13 Oct 2026: "lower models for easy tasks"):
  - **Haiku:** status refreshes (wiring-status, game-status, next-wave, shots gallery), commit/push chores, copying or converting
    assets, cut-outs, applying an already-written fix to more games, the watchdog, link checks, reading logs to report a number.
  - **Sonnet:** wiring art into game code, bug fixes, tests/scenarios, layout work, new features.
  - **Main model (orchestrator):** plan, decide, brief and review only; never runs chores itself (hand them to Haiku).
- One fixer per game, one round, one deploy: the brief names exact functions/lines (grep first) and every known
  bug; the fixer fixes until the sweep is clean and reports in under 150 words. No AI-tester rework loops.
- Cloud sessions allowed (owner, 6 Oct 2026): ONE WORKER PER GAME, at most 15 at a time, Haiku or Sonnet per the model tiers (owner, 13 Oct 2026); every title starts with its group tag ([ART] [TESTS] [LAB] [FIX] [NIGHTRUN] [OPS]) and the session gets the matching `group:<name>` tag, and HANDOFF.md keeps the groups table current; the orchestrator session only starts them, reviews one mid-game screenshot each and updates the shelf. In-session: at most 2 subagents.
- Answer each helper report once; ignore duplicate notifications. Commit work in progress as you go.
- No PR subscriptions, polling or scheduled wake-ups unless the owner asks. (The 13 Oct watchdog routines were removed: scheduled
  sessions can't see or stop other sessions.) Instead every worker STOPS ITSELF at 45 minutes or ~150k context: deploy what passed,
  commit + push, HANDOFF note, stop. The orchestrator checks all workers (get_session) at every owner message and archives finished ones.
- Prove the approach on one game before touching others. Clarity before features.
- **Read less (owner, 13 Oct 2026: 98% of tokens were workers re-reading their own long contexts):**
  - Start from the code map, not the files: `games-src/scripts/find.sh --maps`, then the game's `MODULES.md` and
    `find.sh <symbol|text> <game>`. Read only the line ranges you change (Read with offset/limit). Never read the built
    html, `x.js` or a joined `ui.js` (generated, git-ignored, skipped by search). Edit the file that owns the function;
    never add an override layer file (`ui14.js`).
  - Hand off at ~150k context tokens with a HANDOFF note, not at 450k. A worker takes at most 2-3 games and deploys each
    one as soon as it passes. Briefs name exact files/functions (grep first): paste `games-src/BRIEF-TEMPLATE.md`.
  - `games-src/scripts/guard.py` (run by every build and by CI) fails on big non-media files, growth of sources over
    120 KB, new override layer files and tracked build outputs. Fix what it says; don't raise the limits.
  - `git add` explicit paths, never `git add -A` (it re-adds build outputs).
- Keep context small: hand off to a new session with an updated `games-src/HANDOFF.md`.
- Merge your own work. Never ask the owner to review PRs. Live deploys of games that pass their checks are pre-approved by the owner.
- Update `games/previews.html`, and end with ONE link plus 5 lines (before → after numbers, what's weak).
