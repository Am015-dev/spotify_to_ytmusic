# R66 strict gameplay review: Doorkick Dungeon

- **Build reviewed:** `origin/shelf/W502-doorkick-gameplay` @ `3c79b8acf57396a7d57beb7a5e23f295fef49819`
- **Reviewed:** 14 Nov 2026, 19:55-20:50 UTC. Touch only, phone sizes 375x553, 360x640, 375x667, 390x763 and 390x844.
- **Verdict: FAIL. Average 7.1.** Rows 2 (tutorial) and 5 (phone play) are under 7. No stopper.

## Gates (each run alone, slug `doorkick-dungeon`)

| Run | Result |
|---|---|
| `--quick` #1 | PASS: build OK, 25/25 scenarios |
| `--quick` #2 | PASS: build OK, 25/25 scenarios |
| `--full` #1 | PASS: phone-check OK, lab WARN 9/12, sweep clean (4 games, 4 winners) |
| `--full` #2 | PASS: phone-check OK, lab WARN 9/12, sweep clean (4 games, 4 winners) |

- `games/lab.html` was rewritten by `--full` and then reverted. It is not committed.
- Other tests: `fightfit-test.js` 396/396 PASS. `rules-test.js` 46/46. `logic-test.js` 207/207.
- `tutor-test.js 390x763,375x553` passed 9 of 10 runs. The `offer` run failed 1 time in 3 when run alone: `waitForSelector #tutoffer` timed out. This looks like a harness timing problem: by hand, the title screen always shows "New here? Learn in 5 minutes". The test is flaky all the same.

## Fight fit: FAIL

Nothing pokes out of the table any more. That part of the F15 fix holds: 396/396 shapes are inside the table in my run too, the final scale step fired on only 3 shapes (k = 0.99), and every tap target is at least 44 px.

The fight still fails the strict check, because `fightfit-test.js` only tests "inside the table". It doesn't test overlap or text size. My copy of the test adds those two checks. It found:

1. **Overlap in the compact score readout (the `cmp` layout: every fight with 3+ monsters, and at 375x553 even a 1-2 monster fight; seen in real play).** In the `cmp` layout, the monster total `b.num` collapses to **0 px wide**. Measured: `18` at x 181-181, label `MONSTERS` at x 186-282. The digits are painted on top of "MONSTERS" ("[18]ONSTERS"), and the hero pill shrinks to "YOU …".
   - Repro A (tutorial, no staging): 375x553, "New here? Learn in 5 minutes". Steps 11 "Too strong: run!" (`YOU 8 [12]MONSTERS`), 20 "Ask for help" (`YOU 2 [6]MONSTERS`) and 22 "Fight!" (`YOU … 10 [6]MONSTERS`). The bubble text quotes the very number that is garbled.
   - Repro B (staged): `fightfit-test.js` shape n2 enh0 you roll1 at 375x553. Also n2 rival loot long-name: `BARTH… 1 [48]ONSTERS`.
2. **Text under 11 px in 87 of 396 shapes (22%).** Shapes per size: 375x553: 21, 360x640: 33, 375x667: 33.
   - The smallest is **7.0 px**: the rival's name in the score pill at 375x553 (rival fight + roll + long name; the `.sl1` zoom-to-fit shrinks it).
   - "MORWEN" is 8.3 px in a plain rival fight with a roll box at 375x553.
   - Monster card names `.cn` are 9-10 px. The card is only 56 px wide while the table has free space ("The Endle…" for The Endless Goblin Horde, 1 monster, 375x553).
   - In real play, 18 fight samples across 3 games were under 11 px (8.7-10.5 px: "YOU +1", "1", "Slobber Fiend", "Forum Troll", "Tentaclopolis").
3. **A toast covers the readout in a fight.** "Not worn: no free slot" sits on top of `YOU vs MONSTERS` (375x553, real game, your fight against The Nameless Dread).
4. **The dock overflows on small phones.**
   - At 375x553 the loot question overflows `#prompt` by 12 px (scrollHeight 121, clientHeight 109); the caught question does the same (95 vs 83). The answer buttons touch the bottom edge of the screen, and "Squash a Beetle Colony" wraps to 3 lines.
   - "Caught! Escape, or take Bad Stuff?" shows only one button. The escape route (a glowing card) is not named.

## Rules vs the original (checked against `munch/rules-notes.md` and the repo's rules sheet + FAQ copy): PASS with gaps

The engine matches the core rules. That covers setup, the 4 turn steps, combat and ties (with the Warrior exception), one helper, several monsters, running on 5+, per-monster Bad Stuff, death and looting, item slots and Big items, selling (no change, not to level 10), level 10 only from a kill, charity (tied for lowest = discard) and all 7 race and class powers. The card texts, the rules page and the class texts agree with the engine. The Cleric Resurrection line is now on the rules page.

Gaps:
- **Cleric Resurrection is narrower than the original.** The original applies it to *any* face-up draw. Here it only replaces the door kick (`engine.js:367`), and the rules page says the same.
- **Charity among several tied lowest players** lets you give freely to them. The original says to split as evenly as possible.
- **Trading items between players is left out.** The notes disclose this.
- **The Quick game is the default.** It is the rulebook's own faster-play option, and it is disclosed on the rules page. But `rules-notes.md` still says "Not included: Listen at the door and shared victory", which is now stale.
- **The tutorial contradicts the default.** It says it uses the full rules, yet it has a "Listen at the door … just this once" step and lists "listen" among the learned skills. The real (Quick) game then listens every turn. A first-timer is told two different things.

## First-timer play

- **Tutorial:** 28 steps, one line and one tap each, at 390x763 and 375x553 (plus the rotate, leave, drag and story runs). 0 page errors, 0 stuck.
- **3 full touch games** (375x667, 375x553, 360x640, newcomer driver following hints 50% of the time):
  - 0 page errors, 0 stuck, all reached a winner.
  - 42-45 turns.
  - Longest rival turn 4.4-6.8 s at speed 4.
  - Newcomer won 0/3 (finished level 6, 6 and 2).
- **3 more games** at 390x844, always following the ★ hint: newcomer won **2/3** (average level 9.0). A new player who follows the hints can win on the default (Easy, Quick).
- **Clear whose turn it is:** yes. The title shows "Your move" or "Morwen's turn…", and the dock gives one instruction ("Too strong for you: tap Run").
- **Fun:** the door kick, boss clips, the Victory banner and the flying numbers give good feedback.
- **AI:** fair. It curses and meddles by the same rules.

## Clutter (sampled every second through the 3 games at 375x667, 375x553 and 360x640, 433 samples)

- **Helper bubbles on screen at once: max 1.** 0 samples had 2 or more.
- **Infinite animations: 0 samples** in the whole run, including the 15 s after each bulb tap (4 bulb taps per game, 167 post-bulb samples, 0 infinite, max 1 bubble).
- The repo census (`NBCENSUS`): max 1 cue, 0 multi.
- My looser sampler saw a `.pulse` element plus a ★ card at the same time in ~10% of samples. `tbl.css:434` stops the pulse animation while a ★ exists, so only one cue is animated. Not counted as a fail.

## Scores (GAMEPLAY-RUBRIC.md)

| # | Row | Score | Why |
|---|---|---|---|
| 1 | Rules fidelity | 8 | Faithful engine. Resurrection is narrow, charity split is free, trading is missing. |
| 2 | Tutorial teaches | **6** | Death and looting a body are never taught. The "listen just this once" step contradicts the default game. The readout is garbled on 3 tutorial steps at 375x553. The last bubble says "Tap Next." but the button says "Finish". |
| 3 | First 10 seconds | 8 | The title offers "New here? Learn in 5 minutes". Then a goal card, then "Wear ★ Pointy Kneecaps". |
| 4 | Turn clarity | 7 | One clear instruction a turn. The score readout is unreadable at 375x553 in compact fights. The title truncates to "Lv 1/10 · Your …" at 360. |
| 5 | Phone play | **5** | Readout overlap. 22% of fight shapes have text under 11 px (min 7 px). A toast covers the readout. The dock overflows 12 px at 375x553. The "Treasure" deck label is clipped to "Treasur" at all 3 phone sizes. |
| 6 | AI and pacing | 7 | Brisk, fair rivals. A hint follower wins 2/3. A careless newcomer won 0/3. |
| 7 | Feel | 8 | Door, boss clips, flying cards, Victory banner, floating numbers. |
| 8 | Bugs | 8 | 0 errors and 0 stuck in 6 games and 10 tutorial runs. The tutorial-offer test is flaky. Copy mismatch "Tap Next" vs "Finish". |

**Average: 57 / 8 = 7.1. FAIL** (rows 2 and 5 are under 7).

## Repro steps for rows under 7

**Row 5:**
1. Open `?phone=1` at 375x553 and choose "New here? Learn in 5 minutes". Tap through to step 20 "Ask for help". The score pill reads `YOU 2` with `6` drawn over the "M" of "MONSTERS". To see it in numbers, run `fightfit-test.js` and measure `.arena .score b.num`: width 0, overlapping `i.yn`.
2. Stage a rival fight with a roll box at 375x553 (`fightfit-test.js` shape n1 enh0 rival roll1). The rival's name in the pill renders at 8.3 px (7.0 px with a long name).
3. In a real game at 375x553, tap an item that can't be worn during your fight. The "Not worn: no free slot" toast covers `YOU vs MONSTERS`.
4. Stage the loot question at 375x553 (n2 rival loot). `#prompt` scrollHeight is 121 against clientHeight 109, and the 3 answer buttons touch the bottom edge of the screen.
5. On any phone size, look at the right deck label: "Treasur".

**Row 2:**
1. Play the tutorial. Step 17 says "A free door card, just this once". Then start a Quick game (the default): you listen at the door every turn.
2. The tutorial never shows death or looting a body.
3. Step 28 says "Tap Next." and the only button is "Finish".

## Top fixes (most important first)

1. **Compact readout:** give `b.num` its real width in `.arena.cmp` (it collapses to 0 and paints over the label), and show the full "YOU".
2. **Minimum type in the fight:**
   - Floor `.sl1` zoom and `.cn` at 11 px. Shorten or wrap long names instead of shrinking them.
   - Let a single monster card use the free table height (it sits at 56 px with space to spare).
   - Add min-font and overlap checks to `fightfit-test.js`. It only tests containment, which is why these slipped past 396/396.
3. **Fight toasts:** keep them off the score readout (place them below the pill, or in the dock).
4. **Dock at 375x553:**
   - Make the loot and caught questions fit with no overflow: shorter question text, 2-line buttons.
   - Name the escape route in the caught question ("Play a glowing card to escape, or…").
5. **Tutorial:**
   - Add a death and looting step.
   - Make "listen" match the default Quick game (or say that Quick games listen every turn).
   - Fix "Tap Next" to read "Tap Finish".
6. **Small fixes:**
   - Stop the "Treasure" deck label clipping.
   - Update `rules-notes.md` "Not included" (Quick game is now in).
   - De-flake the `tutor-test.js` offer run.
