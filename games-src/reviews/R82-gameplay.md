# R82 strict gameplay review: stitchwise

**Verdict: FAIL, average 6.6.** No stopper. Rows under 7: Rules 6, Tutorial 6, Phone 5.
Reviewed commit `f3c8282ad16c62f345f2d033dd147a342e5ff903` (origin/alex/brave-carson-rbpmlk; contains cb812c16, the shell calm pass). 20 Nov 2026.

## Gates (2 runs each, run with nothing else going)
| Gate | Run 1 | Run 2 |
|---|---|---|
| `--quick` | PASS (scenarios 69.8 s) | PASS (70.7 s) |
| `--full` | PASS (phone-check 64.8 s, lab 3.5 s, rules-test 5.2 s) | PASS (64.1 s / 3.4 s / 5.3 s) |

Note: the brief's env name `VIS_stitchwiseS=","` is a broken template substitution. With it, 3 visual tests fail on missing
`.baselines/stitchwise-*-phone.png` (baselines are git-ignored and absent on a fresh checkout). The gates above ran with
`VIS_SLUGS=","`, the intended "skip visual" switch (visual.spec.js reads `VIS_SLUGS || SCN_SLUGS`). Fix the brief template.
`games/lab.html` from `--full` was restored, not committed.

## Scores (GAMEPLAY-RUBRIC.md)
| # | Row | Score | One-line reason |
|---|-----|------:|---|
| 1 | Rules fidelity | 6 | Engine matches all 73 checklist rules, but the first leather space is the old-printing value and 4 player-facing lines and 1 star are wrong |
| 2 | Tutorial teaches | 6 | 10 rules in order, one line, one tap, wrong taps refused. But at 375x553 the quilt is 19 px per square (its own R16 check fails 19 times), and there are 2 helpers and up to 10 infinite pulses at once |
| 3 | First 10 seconds | 7 | Title states the goal in one line; 3-bullet goal card; dock says "Tap a glowing patch to buy it" |
| 4 | Turn clarity | 7 | Gold chip shows whose turn it is; every offer shows buttons / time / income; Advance shows "+N buttons". Floating "+N" labels cover the chips |
| 5 | Phone play | 5 | 375x553: quilt squares 19 px outside placement, leather tap targets 19 px, 4 measured overlaps. Infinite loops in normal play. 375x667 is fine |
| 6 | AI and pacing | 7 | A newcomer can win on Easy (4 of 6 touch games vs Easy won; sim: noisy player 39 %); about 20 human turns a game |
| 7 | Feel | 7 | Real art, drag ghost, sounds, empty squares counted up on the result, confetti. A late bonus toast sits over the result card |
| 8 | Bugs | 8 | 8 full games to the result: 0 page errors, 0 stuck states, 0 dead taps, `swCheck` null every time |

Average (6+6+7+7+5+7+7+8)/8 = **6.6**. PASS needs every row >= 7, so this is a **FAIL**.

## Clutter (sampled every second)
- **Helpers.** calm-audit classes: max 0. Counting the game's own glow classes: up to **4 at once in normal play**
  (`span.hand` "Tap" finger + up to 3 pulsing `.offer.can`) and **2 at once in the tutorial** (gold `.qc.t2gap` gap cells + the `.t2-hl` target).
- **Infinite loops.** Normal play: max **3-4 per sample**, `.offer.can {canp}` (src/head.html:215-216) and `span.hand {handb}` (src/head.html:354/357).
  They are still running 15 s after a bulb tap (`bulb button.offer.can {canp}`). Tutorial: max **10 per sample**, `.qc.t2gap {t2gp}` x9 + `.t2-hl {t2p}`
  (src/head.html:395-396, 405-406). Also present, not seen in a sample: `.qc.tgt {pulse} infinite` (src/head.html:46).
  Target is 0, so this fails.

## Rules vs the original (engine + every player-facing text)
The engine (`src/engine.js`, `src/data.js`) matches RULES-CHECKLIST 1-73: setup, neutral token, turn order with the on-top tie, advance,
income including the patch just bought, leather (first only, placed at once), 7x7 once, end, scoring and tie-break. The `--full` rules-test passes.
Patch table: 33 entries; shapes, costs, times and incomes agree with the standard set as I know it (the 2 UNCONFIRMED entries are unchanged).
`rulesHtml()` (src/ui3.js:49-58) is accurate. Mismatches:

1. **src/data.js:2 `LEATHER_SPOTS: [20, 26, 32, 44, 50]`: the first leather is on the old printing's space.** The publisher's FAQ says the
   first leather patch "statistically is coming too early" and was moved "to a later space". Newer prints include the change, and a
   correction sheet is offered for older ones. RULES-CHECKLIST says the source is the 10-year edition, which is a newer print. 20 comes from public code
   tables made from old prints. The corrected space number could not be read here (the correction sheet is an image). Fixer: read it from the
   edition's board or correction sheet, then update data.js, logic-test R6/R7 and the tutorial setup if it depends on 20.
2. **campaign.json:298** (c3, Granny Fernsby): "Start with three extra buttons, do you? Cheeky. I will take the same." The player gets **no**
   extra buttons; only the boss gets +3 (src/ui2.js:129). Rewrite, e.g. "Three extra buttons for me. A champion's privilege."
3. **campaign.json:842** (c9 outro): "Seven squares and a smile." The goal is "at most 6 empty squares" (and so is star 2), so 7 contradicts it. Use "Six squares or fewer...".
4. **campaign.json:729, 814, 895, 986** (c7-c10 `easier.text`): "The computer plays at normal strength". But `easier.aiLevel` is `easy`
   (shell/gx-campaign.js:99 applies it), so the AI drops two levels and the text is wrong. Either set `aiLevel: "normal"` or say "gently".
5. **campaign.json:532** (c5 star 3, "Take the 7x7 bonus"): **impossible**. The torn-squares twist tears (0,0), (8,8), **(4,4)** (src/ui2.js:130).
   Every 7x7 square on a 9x9 board covers the centre, and `swBonus` counts torn (99) as unfilled (src/engine.js:47). So 3 stars can never be earned
   in chapter 5 (the easier mode caps at 2). Move the third torn square off the centre, e.g. (8,0), or change the star.
6. Minor: **campaign.json:1050** coach `start` gives the score as "buttons minus 2 per empty square" without the +7 (the goal card has it).
   Title "Learn to play: A real game in 5 minutes; Aunt Wren coaches you" (src/ui3.js:12) describes the old coached game. The current tutorial
   is a scripted 10-step practice fair whose bubbles are not voiced by Wren.

## Play log (touch, served like the live site, default animation settings)
Tutorial (Learn to play) at both sizes, walked to the score card, then "Play a real game" played to the result: PASS at 375x667. At 375x553 it
reaches the end but the game's own R16 check fails 19 times: quilt 19.1 px per square on every non-placing step, 34.1 px while placing (needs ~36);
the leather step taps a 19 px square. Rule order: buy, rotate, place, pay, time, advance, income, leather, bonus, flip, bonus, end. One line per step, one target.

| Game | Size | Player style | Vs | Result (engine) | Human turns |
|---|---|---|---|---|---|
| g1 | 375x667 | noisy newcomer (easy policy) + bulb tap | Easy | WIN 34 - -14 | 25 |
| g1 | 375x553 | noisy newcomer | Easy | WIN 22 - 16 | 22 |
| g2 | 375x667 | noisy newcomer | Normal | LOSS -12 - 16 | 17 |
| g2 | 375x553 | noisy newcomer | Normal | LOSS 4 - 20 | 22 |
| g3 | 375x667 | sensible player | Easy | WIN 20 - 11 | 19 |
| g3 | 375x553 | sensible player | Easy | WIN 23 - 2 | 20 |
| s1 | 375x667 | naive first-fit | Easy | LOSS 6 - 7 | 20 |
| s1 | 375x553 | naive first-fit | Easy | LOSS -10 - 16 | 20 |

Engine sim, 150 games each: first-fit vs Easy 14 %, noisy vs Easy 39 %, noisy vs Normal 38 %, sensible vs Normal 55 %, sensible vs Hard 37 %.
Easy is the highlighted Quick-game choice, so a newcomer can win on the default level. Across all games: 0 page errors when served
(file:// only misses art), 0 dead taps (every tap changed state), 0 stuck states. Text never under 11 px; no control outside the quilt under 44 px.

## Findings with repro (rows under 7)
- **R5 / R2: 375x553 quilt is too small.** Quick game > Easy > Start at 375x553: the quilt is 9 x 19 px squares, with wallpaper filling the
  space beside it (shots: `scratchpad/shots/s1-375x553-first.png`, `-mid.png`). When a leather patch comes up you tap a 19 px square.
  In the tutorial, `node tut-walk.js 375x553 --full` reports `R16 ... 19.1px` x19.
- **R5: overlaps at 375x553** (measured, more than 4 px both ways): `#track` over `button.btn.adv`; the shell `button.gx-ibtn` over `button.btn.alt[rules]`;
  `button.offer.no` over `button.btn.alt`. Floating "+10 pts" / "+2 buttons" labels sit over the opponent chip's name and button count
  (first turn, and tutorial step 8). The `▶42` token tag hides Marden's `43` tag on the track (tutorial step 8).
- **R5 / clutter: infinite loops in normal play.** Any turn: every affordable offer pulses (`canp`) and the "Tap" hand bobs (`handb`) forever,
  including 15 s after a bulb tap. Up to 4 helpers at once by class.
- **R2 / clutter: tutorial step 1** shows 9 pulsing gold gap cells plus the pulsing target offer: 2 helpers, 10 infinite animations.
- **R1: copy and data mismatches 1-5 above.**
- R7 (minor): at the end of s1-375x667, the toast "Poppy completed a 7x7 square: +7 bonus!" appears over the result card.

## Prioritized fix list
1. **Phone 375x553 layout (R5, R2):** give the quilt the free height at 553 (aim >= 30 px per square outside placement and >= 36 px while
   placing), also during leather placement. Shrink or collapse the track (3 rows) to make room. Move the floating +N labels off the chips. Separate the
   two token tags. Clear the track/Advance and info/Rules overlaps. Prove it with `tut-walk.js 375x553 --full` (0 R16 failures).
2. **Calm (clutter):** make `canp`, `handb`, `t2p`, `t2gp` and `.qc.tgt pulse` finite (e.g. 2-3 iterations, then a static gold outline). Show the
   "Tap" hand only on the first turn, or only after idling. In the tutorial show one helper: a static gold outline on the gap cells, the pulse only on the target.
   Prove it with `node scripts/calm-audit.js` plus a game-class sample: 0 loops, 1 helper.
3. **c5 impossible star:** move the torn square off (4,4) (src/ui2.js:130) or replace star 3.
4. **Leather spaces:** confirm the current print's first leather space from the correction sheet; update src/data.js:2 and tests.
5. **Copy:** campaign.json:298, 842, 729/814/895/986 (or fix aiLevel), 1050; title subtitle src/ui3.js:12.
6. Hold the 7x7 bonus toast until the result card is gone, or drop it once the result shows.
