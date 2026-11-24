# [FIXED6 sunglaze] report

Branch shelf/W576-sunglaze-strict. F6 commits 5b85c375, a64344be, 6eb5c7b7, merged with the remote F4/F5 work and origin/alex/brave-carson-rbpmlk (the merge commit is the pushed head). Not deployed, no PR. The trigger call was refused, so this file is the report.

## Gates
- `build-all --full` ran ONCE (before the merge). Build, phone-check and lab-test were ok. Its sweep failed "no tappable covered": a tall middle pool laid tiles over a kiln tap. Fixed (the pool stays inside the oval). `--full` was not re-run.
- On the final merged build, run directly:
  - sweep.js QUICK: 2021 pass, 0 fail (c3 "tap chip reads the rule" passes)
  - tutor-e2e: ALL PASS (full game by touch at 375x667)
  - calm-audit: loops=0, maxHelpers=1
  - build-all --quick scenarios: PASS
- The full 40-game sweep was NOT re-run after the merge.
- games/lab.html and games/scenarios.json were restored and not committed.

## Round-end seconds
Wallphase to round end, 375x667, scripted game, final merged build: 1.8-2.8 s (3.9 s before, on 3-row rounds). A tap skips (4x). The other fixer's per-tile readable +N pacing is kept but shortened:
- 300+90 ms per own tile
- 420 ms per rival tile
- Round-score banner 2.2 s, non-blocking
- Great-chain banner 1.2 s

## Win rate, newcomer vs Easy
N=400, headless, merged AI. No agreed newcomer model exists in the repo, so this is mine: a player who plays Easy but picks a random legal take X% of the time, against Easy.

| X | win rate |
|--:|--|
| 0 | 50.0% (202/400, mirror) |
| 8 | 41.4% |
| 20 | 30.6% |
| 35 | 18% |

F6 changed no AI code; the AI is as merged from F4 (Easy slip .5 + look-ahead). The 45-55% target holds only for a newcomer about as sharp as Easy; a clumsier one loses more.

## What changed (src ui9.js, ui.js)
1. Faster round-end (above).
2. End card:
   - per-player table: Wall tiles, Full rows, Full columns, Colour sets, Floor, Total
   - one "why" line (biggest gap category) and one concrete tip
   - the empty cream art strip is gone
   - the F4 "Try Normal" button and line are kept
3. Sweep c3 passes. The failure seen in this run was the pool covering a kiln, fixed.
4. Start token labelled on the table: "Sun token: −1, you start next round". Shortened to 7 words so the 8-word board-text rule passes; the table reserves a 24 px strip for it.
5. Story card after Begin removed. Begin goes straight to the board; the goal text is in the Round 1 banner.
6. Middle: tiles sit on a grid inside the oval. No tile overlaps another tile or a kiln, and there is no 44 px minimum. Checked with 8 tiles at 375x553, 375x667 and 1366x768: 0 overlaps. Tiles are small at 375x553 (about 19 px with 8 tiles); a tap picks the nearest tile.
7. Full floor: the instruction line says "Floor full: tap it to discard".
8. Win rate (above).

## Known soft spots and notes
- Tiles are about 19 px in the middle at 375x553 with 8 tiles.
- A stop hook asked me to re-author commits as Claude / noreply@anthropic.com. I did NOT, because the task and CLAUDE.md say commit as am015-dev with no AI attribution. Commits are by am015-dev.

## Cold check
Independent subagent, no history, one-shot scripts. It ran on the build BEFORE the final merge. Verbatim:

> Both games ended as a win for me. Method caveats: replays drifted (seeded Math.random, 4x timers); I skipped Learn to play and the rules screens.
> A. Touch 375x667: won 57 to 41. Could I play without help? Mostly yes; the prompt strip taught me. Confusing: nothing says what the goal is or why the wall is faded; not obvious tiles go left rows first then to the wall at round end; the yellow 1 token unexplained until taken; why a tile counted as nothing fits is not explained; preview badges +5 +8 are unlabelled green pills. Fun 3/5: first two rounds drag, Easy is predictable. Play again: probably one more game to try Hard. Understood why I won: yes, mostly; the card shows Wall tiles, Full rows, Full columns, Colour sets, Floor, then 'You won by 16: ahead on wall tiles by 13.' plus a tip; I could not tell which of my choices mattered. The end card wall-tiles line showed +56 / +43 which did not match 57 / 41 until rows, columns and floor are added. Cramped/slow: round-end scoring was too slow; in several rounds a prompt like 'Sun token: -1, you start next round' stayed 8+ s; last factory pick to next Your turn took 4 to 5 s; disc tiles about 27 px, precision job; taps during motion sometimes ignored.
> B. Mouse 1366x768: won 60 to 39. Same answers; desktop menu 'Rival' row shows ten broken avatar images (looks like missing art); layout poor, factories on the left, board on the right, lots of empty space; board upper-left rack corner small; round-end felt 3 to 7 s; end card Play again / See boards small versus the card; a short x badge on untakeable tiles took a second look. Fun 3/5, would play again once or twice. Understood why: yes, 'You won by 21: ahead on floor by 12', but it explains the margin, not the lessons.
> Bottom line: playable cold; goal is never stated on the board; pace is the weakest point (felt 4 to 8 s); fix the broken avatars before a $5 release; the end card is clear and correct.

My note: its pace numbers come from a replay harness with seeded and sped-up timers; my own measurement on the final build is 1.8-2.8 s. The broken avatars, the unlabelled preview pills, the missing goal text and the desktop layout were not in my 8 items and are NOT fixed.

## Proof
`games-src/azul/proof/shots-f6/`: mid8-375x553.png, mid8-375x667.png, mid8-1366x768.png, end-375x553.png, end-375x667.png, end-1366x768.png (taken on the final merged build). The cold-check screenshots (pre-merge) are only in /tmp/claude-0/s/cold/ and were not committed.
