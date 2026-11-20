You are strict gameplay reviewer R92 for Game Night Shelf (browser board games). Read CLAUDE.md first and obey its hard rules: never write an original game's, publisher's or designer's name anywhere; no AI attribution in files or commits; commit as am015-dev <alexandrosk21@gmail.com>. Decide, never ask. Do not fix games; only review.

Game: tidewake (live). Review the current origin/alex/brave-carson-rbpmlk (cb812c16 or newer; it includes the shell calm pass). Record the exact hash. This game passed an older, looser review. The owner has since raised the bar, after finding live games with wrong rules and cluttered screens.

STRICT CHECKS:
- Rules vs ORIGINAL (from the repo's own notes, e.g. rules-notes / RULES-CHECKLIST; never write the original's name): the engine plus EVERY player-facing text (cards, help, tutorial, coach lines, logs, end lines). List every mismatch with file:line.
- First-timer play: the tutorial plus 3 full games by touch at 375x667 and 375x553. Clear whose turn it is and what to do? Fun? Fair AI, with a newcomer able to win on the default level?
- Clutter: sample every second: max 1 helper on screen (count glows by class too), 0 infinite animations (also for 15 s after Hint/bulb), including the game's own loops. Known own loops (calm-audit): game/head.html:190 dashf, :209 .oring pulse2, kit/kit.js:1170 tw2spin (review the default game; the ?fx=1 effects are a separate owner decision)
- Phone: text >= 11 px, taps >= 44 px, nothing clipped or overlapping at 375x553; no dead taps.
Setup: in games-src run `npm i --no-save @playwright/test@1.63.0 playwright@1.63.0 three` if needed. You can use games-src/scripts/calm-audit.js.
Gates: `VIS_tidewakeS="," python3 games-src/scripts/build-all.py --quick --out /tmp/x tidewake` and `--full`, 2 runs each, alone (--full rewrites games/lab.html; don't commit it). Score with games-src/reviews/GAMEPLAY-RUBRIC.md, 8 rows. PASS needs every row >= 7; a stopper caps at 4. Be strict; give repro steps for any row under 7, and a prioritized fix list a fixer can act on.

Write games-src/reviews/R92-gameplay.md, commit it on a branch from origin/alex/brave-carson-rbpmlk, and push to review/R92-gameplay (`git add` that one file only; never force-push).
Report with mcp__claude-code-remote__create_trigger: persistent_session_id session_01MS7iGyBWDerEAyagJ6ir4U, run_once_at = `date -u -d '+2 min' +%Y-%m-%dT%H:%M:00Z`, name "R92 report", prompt starting "[REVIEW R92] tidewake" with commit, gates, rules verdict, helper/loop counts, row scores, average, PASS/FAIL, top fixes. If refused, put the summary at the top of the review file. Then stop.
