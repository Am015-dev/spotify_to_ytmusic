# Board-first rework: play on the board, not in menus

The owner played the clarity versions on an iPhone. Verdicts:
- Short Fuse: "very confusing, I have no idea what to do".
- Sunglaze: "confusing even with suggestions, very boring, not like the fun of the real board game".
- Nebula Aces: "very confusing even when guided, unusable in portrait".
- Cauldron Fair: "completely useless, not like the game, very confusing".

The owner's direction: **"use the board more and interact. All games can work that way."**

Why the earlier pass failed: the AI testers read every paragraph, so text-heavy screens passed. Real players on a
phone don't read. They look at the board and touch things. Explanations in a dock panel don't teach. **Doing**
teaches.

## The standard (each point is a pass/fail check)

1. **The board is the screen.** In portrait the board, table or play area fills most of the screen. Your hand
   or rack sits at the bottom edge. Scores are a thin strip at the top. No dock panel covers a third of the
   screen with text.
2. **Touch the thing itself.**
   - Every action is a tap or drag on the piece, card, tile, chip, ship or space it affects.
   - Pick up the tile, card or piece, and the legal targets glow. Drop or tap on a target, and it animates there.
   - Buttons are only for real yes/no or end-turn decisions: "Stop", "Done", "Draw".
   - Remove menus of options wherever the board can express the choice.
3. **One short line of text** at most for "what to do now" (≤ 8 words, e.g. "Tap a tile colour in a factory").
   Everything else is shown, not written: glows, arrows, a ghost finger animation for the very first move,
   numbers floating up when points score.
4. **Show cause and effect on the board.** Pieces visibly move. Scores pop up where they were earned. A lost
   piece flies off. The computer's moves animate on the board at a watchable pace (tap to speed up).
5. **Recreate the real game's fun moment, and make it the centrepiece.** Find the moment that makes the physical
   game exciting and make it big, tactile and dramatic, with sound and a little delay for tension. For example:
   - pulling a chip from the bag and hoping it's not the one that explodes;
   - grabbing all the tiles of one colour and watching the rest slide to the middle;
   - revealing a wire;
   - the moment the ships move at the same time.
6. **First game in ≤ 60 seconds without reading.** The guided first game is a hands-on tutorial: the ghost finger
   shows one move, the player copies it, and the next idea follows. Never a wall of text. Tips that stay up to
   explain a concept stay ≤ 2 short lines and sit away from the board action.
7. **Portrait phone first.** 390x763 and 375x553 must be fully playable one-handed. Landscape and desktop can show
   more.

## Testers that behave like real phone players

Use `games-src/scripts/drive-serve.js` with blind tester subagents (no repo access). These rules are for the
testers:
- They may read only the **first 8 words** of any text block. Ignore the rest; you are skimming.
- Before each action, look at the screenshot for "2 seconds": decide from what is visually obvious (glows,
  highlighted pieces, the one big button). If nothing is obvious, try tapping the thing that looks most
  tappable on the board, and log it as a **"lost"** moment.
- They log every tap that did nothing ("dead tap"), every lost moment, and fun 1–5 per round.
- At the end: "Could you play a full turn without reading? What was the exciting moment? Would you play again?"

Acceptance, all three blind testers:
- ≤ 2 lost moments after the first minute;
- dead taps ≤ 3;
- every tester names an exciting moment;
- average fun ≥ 4/5;
- each tester can say the goal in one sentence.

Run a blind test BEFORE changing anything (baseline numbers), then after each rework round, up to 3 rounds.

## Rules
- Keep the full rules engine and AI unchanged (rules bugs excepted, each proven by a test).
- Reuse the game's existing art. If something new is needed, draw it in the game's style.
- Keep online play, hot-seat, saves and all existing tests working; the tests may need updating for the new
  interaction.
- Never write an original game's, publisher's or designer's name anywhere. No model identifiers. Don't touch
  shared modules, the shelf pages, other games or the live game file.
- Build, publish to the game's preview path and stamp it. Write `<source>/BOARD-FIRST-REPORT.md` with the baseline
  and final tester numbers and 4 before/after screenshots. Then
  `git fetch origin alex/brave-carson-rbpmlk && git merge origin/alex/brave-carson-rbpmlk` and push to
  `alex/brave-carson-rbpmlk` yourself so the preview goes live; push your branch too.
- Cost: work directly, background long jobs, no polling.
- End with 8 lines: baseline → final numbers and the preview link.
