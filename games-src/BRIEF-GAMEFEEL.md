# Brief: make <SLUG> a real game (owner, 8 Nov 2026)

Owner, word for word: "none of the games must be ugly looking or play like a spreadsheet; the aim of the game in the tutorial must
be clear; I need to understand what to do; do not distract me with lots of pop-ups that move fast and leave no time to read; no
game is delivered unless it is fully playable and readable; every game must pass the impeccable skill and the design skill; if you
need help, search the web first, never ask me."

## Rules for you (no exceptions)
- Read CLAUDE.md first. No original game, publisher or designer names. No AI attribution in commits. Commit as
  am015-dev <alexandrosk21@gmail.com>. Never force-push. `git add` explicit paths.
- Never ask the owner or the orchestrator anything; decide, note why in one line, continue. Search the web when stuck.
- Never run a command that needs approval. Never run `build-all.py --deploy` (the orchestrator deploys). Use
  `build-all.py --quick <slug>` and the game's own tests.
- First: call Skill boardgame-builder, Skill fun-game-design, Skill impeccable, Skill design-review. Read
  .claude/skills/boardgame-builder/references/board-first-play.md and the "Owner verdicts, 8 Nov 2026" section of that skill.
- Owner art (assets-inbox/<slug> games) is never replaced or hidden; one art style per game. Another worker may be wiring the
  owner's 3D models and pictures in this game: fetch and merge alex/brave-carson-rbpmlk every 20 minutes and keep their
  asset-loading code; you own layout, interaction, motion and words.
- Don't change the rules engine (logic-test.js must still pass).

## What "done" means
1. Play screen at 390x844: the board and pieces are the screen, with big art and big numbers. You drag or tap the real piece,
   legal spots glow, it snaps with a vibrate tick, motion shows every result, and the rival's turn plays out step by step at
   readable speed. No spreadsheet of chips and rows.
2. The aim is clear: the first screen of Learn to play and the Goal card say in one plain sentence how you win, plus at most 3
   short bullets on how you score.
3. No fast pop-ups: any message stays until tapped, or for at least 4 seconds plus 1 second per 10 words; at most one message
   on screen at a time; nothing animates text away before it can be read. Play mode has no bubbles (Hints toggle, off by default).
4. Words: short, plain sentences a friend would say at a table, max ~12 words per line.
5. Readable: text at least 14px on phone, contrast at least 4.5:1, nothing overlaps (check after 10 turns at 390x844 and 375x667).
6. Fully playable: a full game by touch (page.touchscreen.tap / drag) on phone and by mouse on PC finishes with no stuck state.
7. Gates: Skill impeccable critique and Skill design-review both scored on your final shots with no item below 7/10;
   build-all --quick PASS; logic-test.js PASS; ui-audit A-F 0; `node games-src/scripts/asset-usage.js <slug>` no worse than before.
8. Shots: 390x844 and 1440x900 of title, Learn-to-play first screen, Goal card, first turn, mid-game, rival turn, result, in
   games-src/<dir>/playable-shots/feel/. Look at every one yourself as a first-time player.

## Report (one message, then stop)
Push to your branch. Send the orchestrator session one DONE trigger (create_trigger with persistent_session_id
session_01MS7iGyBWDerEAyagJ6ir4U, run_once_at 2 minutes ahead) starting "[DONE <W#>]" with: skills loaded, impeccable and
design-review scores, pass/fail per point 1-8, shot paths.

## For every worker (also helpers and reviewers)
End with exactly one DONE trigger to the orchestrator (format above), then stop. Never wait for an answer: if blocked,
decide, note it in the DONE report, and stop. The orchestrator sweeps every 20 minutes and merges finished work.

## Fix lists from helpers (merge the base every 20 minutes)
- games-src/<dir>/DESIGN-FIX.md (impeccable + design-review audit) and games-src/<dir>/COPY-FIX.md (plain-word rewrites) land
  on the base during your task. Apply every item in them before you report; say in your DONE which ones you skipped and why.
- The shared shell (games-src/shell) is being polished by D0; don't fight it, build on it.

## Speed (owner): test at machine speed
Headless, animations off or sped 100x for full-game and touch tests, parallel browser contexts, engine-level simulation for
rules. Real speed only for pop-up timing and the few screenshots that show motion. Minutes per test round, not hours.

## Feel gate (new, must pass before DONE)
`node games-src/scripts/feel-audit.js <slug> --secs 120` (results in games-src/qa/feel/<slug>.json; today's numbers in
games-src/qa/feel/SUMMARY.md). Needed: (a) 0 short or stacked messages, (b) 0 messages in Play with Hints off,
(c) 0 lines over 12 words, (d) 0 phone text under 14px, (e) 0 overlaps. If the driver cannot find Learn/Play, add
data-a="learn" / data-a="play" to those buttons. Learn to play must be finishable by touch with no Skip (taps on the
highlighted target must reach it; spotlight blockers must not cover it).
