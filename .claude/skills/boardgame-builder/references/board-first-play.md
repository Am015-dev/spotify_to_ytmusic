# Board-first play and human-like playtests

Hard lesson (Oct 2026): 15 games passed newcomer reviews, and then the owner played them on an iPhone and called every one "confusing", "boring", "not like the real game" or "unusable in portrait". The cause was that AI reviewers read every paragraph, so text-heavy docks, wizards and advisor panels passed. Real phone players don't read. They look at the board and touch things. **Doing teaches; explaining doesn't.**

## The standard (each point is pass/fail)
1. **The board is the screen.**
   - In portrait the board fills most of the screen, the hand or rack sits at the bottom edge, and the scores are a thin strip at the top.
   - No dock panel covers a third of the screen with text.
2. **Touch the thing itself.** Every action is a tap or drag on the piece, card, tile, chip or space it affects. Picking something up makes its legal targets glow, and dropping it animates it there. Buttons are only for real yes/no or end-turn decisions. No menus of options where the board can express the choice.
3. **One line of text, at most 8 words**, for "what to do now". Everything else is shown, not written: glows, arrows, a ghost finger for the very first move, points floating up where they score.
4. **Cause and effect on the board.** Pieces visibly move, scores pop where earned, a lost piece flies off, and the computer's moves animate at a watchable pace (tap to speed up). Every change to a player's score or pieces has a visible cause ("who, what, why"). Unexplained eliminations and score jumps read as "random".
5. **The real game's fun moment is the centrepiece.** Find what makes the physical game exciting and make it big, tactile and dramatic, with sound and a short delay for tension. For example: pulling a chip from the bag and hoping it doesn't explode; grabbing every tile of one colour while the rest slide to the middle; cutting a wire; ships moving at the same time. If the testers can't name an exciting moment, the build isn't done, however correct the rules are.
6. **First game in 60 seconds or less, without reading.** The guided game is hands-on: the ghost finger shows one move, the player copies it, then the next idea. Teach in layers (round 1 basics, round 2 the next system, and so on), never all the systems in rounds 1–2. Tips stay at 2 short lines or fewer, away from the action.
7. **Portrait phone first.** The game must be fully playable one-handed at 390×763 and 375×553. Landscape and desktop can show more.
8. **Suggestions must be trustworthy.** The picked move and its sentence come from the same evaluation. Make no suggestion when unsure. Preview "your 6 vs their 5" before anything that resolves at once. One wrong hint destroys trust in all of them.
9. **Always show the goal and the race:** "Most points after round 4 wins · You 8 · Rival 3".

This replaces the dock-heavy "guided steps, advisor and wizard" approach in `newcomer-ux.md` wherever they conflict.

## Bugs: scripted sweeps first (Oct 2026)
AI blind testers missed bugs the owner found in seconds. Each game needs `sweep.js` and `rotate-test.js` that play
the real page with touch taps (40+ games, both phone sizes, rotations) and assert: no page errors, glowing targets
respond, hint = best move and hint text = finger, on-screen scores = engine, nothing stuck, nothing covered, no
horizontal scroll. Run before every deploy. Use the blind testers below only to rate fun/clarity, once, at the end.

## Human-like blind testers (the gate for "done")
Use `scripts/drive-serve.js`. It drives an HTTP-controlled phone page:
- endpoints `/open?url=`, `/shot`, `/tap?text=`, `/tap?x=&y=`, `/wait?ms=` and `/quit`;
- each step saves a screenshot and prints the tappable elements.

Give tester subagents **no repo access and no rules**, and these instructions:
- Read only the **first 8 words** of any text block and skip the rest.
- Look at each screenshot for "2 seconds" and decide from what is visually obvious. If nothing is obvious, tap whatever looks most tappable on the board and log a **lost** moment.
- Log every **dead tap** (a tap that did nothing), every lost moment, every "what just happened?" moment, and fun from 1 to 5 per round.
- At the end answer: Could you play a full turn without reading? What was the exciting moment? Would you play again? What's the goal, in one sentence?

Use three personas: casual, careful, and a skipper who just presses the big button.

**Acceptance, for all three testers:**
- after the first minute, 2 or fewer lost moments and 3 or fewer dead taps;
- every tester names an exciting moment;
- average fun of 4/5 or more;
- every tester can state the goal.

Run a baseline before changing anything, then test again after each rework round, for up to 3 rounds. Report baseline → final numbers. A "PROBLEMS 0" layout run and a passing click test say nothing about whether a game is fun or clear.

## Story mode
"All games are boring: no story mode with bosses and gradual difficulty." A paid-quality game needs a campaign:
- **Structure:**
  - a chapter map of 8–10 nodes with 1–3 stars each and a boss at the end of each act;
  - skippable 2–4 line story scenes;
  - boss cards that explain each twist in plain words.
- **Difficulty:**
  - Act 1 teaches (easy AI, one idea per goal);
  - Act 2 is normal;
  - Act 3 is hard, with boss twists;
  - offer "make it easier" after 2 losses.
- **Limits:** use only levers the game already has (AI level and style, setup, starting resources, scenario, a small set of twists). The normal rules don't change.
- **Format:** chapters are data (`campaign.json`). On the shelf, the shared framework is `games-src/shell/gx-campaign.js` (see `CAMPAIGN.md`).

## The paid-product bar
Players expect, beyond rules and looks:
- a component reference drawer;
- settings (sound, speed, colour-blind, reduced motion);
- undo where the rules allow it;
- a "since your last turn" summary;
- stats and achievements;
- offline play through a service worker;
- privacy, terms and credits pages;
- original names everywhere.

The shared kit is `games-src/shell/gx-kit.js` (see `GX-KIT.md`).
