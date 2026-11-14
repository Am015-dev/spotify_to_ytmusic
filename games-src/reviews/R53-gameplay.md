# R53 strict gameplay review: Doorkick Dungeon

- **Build reviewed:** `shelf/W502-doorkick-gameplay` at `63d41ead637e857ead981788108480d972bce162` (staged build, md5 d0e18387…).
- **Date:** 14 Nov 2026.
- **Previous review:** R49 6.5 FAIL.
- **Verdict:** **FAIL.** The game scores 6.8 before the cap, but one of the three `--full` runs failed. Under the brief that is a stopper, so the total is capped at **4**.

## Gates
| Gate | Result |
|---|---|
| `--full` run 1 (alone) | **FAIL.** Sweep 3/4: `375x553 g1 turn 61: fight clipped: sline/vs/row/rollbox num 154..180 table 101..160` |
| `--full` run 2 (alone) | PASS (sweep 4/4, phone-check ok) |
| `--full` run 3 (alone) | PASS (sweep 4/4) |
| `--quick` with `VIS_SLUGS=","` | PASS: 25/25 scenarios, sweep ok |
| Tutorial `tutor-test.js 375x667,375x553` | PASS: 28 steps seen per run (clean, rotate, leave/return, skip, offer, drag, story), 219 steps checked, 0 problems |

The fight-fit fix from F14 still clips intermittently at 375x553: the score row and roll box sit below the table bottom. This is 1 sweep game in 12 and is not reproducible on demand, but any `--full` failure is a stopper.

## Rules vs the original (sources: rules-notes.md, rules.md v1.71, cards-base.json)
**Engine verdict: no wrong core rule found.**
- **Halfling:** fixed. `engine.js:265` `canReroll` lets you discard a card to roll again once after a failed run-away. `runMod` has no Halfling penalty. The double-price sale is limited to once a turn. The card text and the rules page match.
- **Other powers:**
  - Elf: +1 to run away, and a level per monster when helping, never the winning level.
  - Dwarf: any number of Big items and a 6-card hand.
  - Warrior: wins ties; Berserk up to 3 cards.
  - Wizard: Flight up to 3; Charm takes the whole hand of 3+ cards and keeps the treasure.
  - Thief: Backstab −2 once per victim per fight; Theft is a small item on 4+, otherwise lose a level.
  - Cleric: Turning +3 vs undead up to 3 times; Resurrection is in.
  - All of these are correct.
- **Combat:** strength is level plus items. Ties go to the monster unless a Warrior fights. One helper with a bribe. Rewards arrive at the end. Correct.
- **Running away:** 5+ on a d6 per monster, with Bad Stuff per monster. "Won't pursue", Sticky Paste and the escape items all work. Correct.
- **Levels, winning, selling:** level 10 comes only from a kill (with the divine-card exception). Selling is 1,000 gold per level, no change, never to level 10. Correct.
- **Curses and hand limit:** curses hit at once from the door and can be played on anyone at fixed windows. Hand limit 5 (Dwarf 6), charity to the lowest, discard if you are the lowest. Correct.

**Text that doesn't match the engine (Rules row −1):**
1. **Rules page, Cleric** (`rules-html.js:39`) lists only Turning. Resurrection is live in the engine (`act:'resurrect'`, offered on every main phase) but is never explained to the player.
2. **Tutorial step `listen`** says "Each turn starts with a free door card." The rules page says "The story and the tutorial use the full rules." Under full rules this happens only once, as a scripted event (`G.tutListen`), so a new player learns a Quick-mode rule as if it were core.
3. **Stale local notes:**
   - `munch/rules-notes.md:46` still says "Halfling −1 (base printing)".
   - `munch/RULES-CHECKLIST.md:6` says "Halfling keeps the printed -1".
   - Neither is player-facing, but both contradict the fix and line 124 of the same checklist.

## Clutter (my own sampler, not the game's census)
I injected an init script that sampled every 1 s, whoever's turn it was. It counted visible help bubbles, hint cues, star badges and running pulse/glow nudges. It does not count level-up flashes, drop targets or the door-kick animation, which are feedback rather than helpers.

| Run | Samples | 2+ helpers | Infinite loops |
|---|---|---|---|
| 375x667, 2 normal games (seed 21) | 477 | 0 | 0 |
| 375x553, 2 normal games (seed 23) | 341 | 0 | 0 |
| **Bulb tap at 375x667, then 15 s + 15 s** | 30 | **30** (bubble + ★ star) | **`gxh-pulse` on `.gxh-ring`, 30/30 s** |
| **Bulb tap at 375x553, then 15 s + 15 s** | 30 | **30** | **30/30 s** |
| Tapping the ★ hint card, 15 s | 15 | 4 (star + target outlines, expected) | 0 |

**Normal play passes the gate.** A first run with a looser definition counted level-up flashes and the door-kick animation, which inflated it to 27%. I reject that as a false positive.

**The bulb fails the gate:**
- The bulb bubble's ring uses `animation: gxh-pulse 1.1s ease-in-out infinite` (`shell/gx-help.css:23`). It pulses for as long as the bubble is open: I saw more than 30 s, and the bubble has no OK/close button.
- The ★ badge on the suggested card stays visible at the same time, so two helpers are on screen.
- Repro: start a Quick game at 375x667 → tap the bulb (top left) during setup → wait. The ring keeps pulsing on the hero and the ★ stays on the Wizard card.
- Shots: `scratchpad/bulb667-bulb.png`, `bulb667-afterclose.png`, `bulb553-*.png` (local, not committed).

## Touch play
| Item | Result |
|---|---|
| Tutorial | Both sizes, through `tutor-test.js` (real taps) |
| Full games, normal speed, touch only | 10: 4 at 375x667, 6 at 375x553 |
| Reached the result screen | 10/10, 0 page errors, 0 stuck states |
| Newcomer driver wins | 3/10. The driver follows the ★ about half the time and otherwise taps at random. |
| Game length | 2.4–5.7 min |
| Longest single AI turn | 4.7 s; most turns are 3.4–4.5 s. That is above the 3.6 s F14 claimed, but brisk. |

## Scores (GAMEPLAY-RUBRIC.md)
| # | Row | Score | Why |
|---|---|---|---|
| 1 | Rules fidelity | **6** | The engine is faithful, including the Halfling reroll. But the rules page omits Cleric Resurrection, and the tutorial teaches "each turn starts with a free door card" under full rules. |
| 2 | Tutorial teaches | 8 | 28 one-line steps teach every core rule by doing, with 0 problems at both sizes. |
| 3 | First 10 seconds | 8 | Goal card, a ★ on the card to play, and one big Ready button. |
| 4 | Turn clarity | 7 | The status pill, the "−3: need help or run" line and the roll line are clear. The dock prompt text is hidden behind the buttons when there are 2+ choices (see 5). |
| 5 | Phone play | **6** | See the findings below. |
| 6 | AI and pacing | 7 | AI turns ≤ 4.7 s, games 2.5–6 min, and a newcomer can win on default Easy. |
| 7 | Feel | 7 | Door kick, card flights, dice and level-up bursts are good. The bulb ring loops forever and a second helper stays up (see Clutter). |
| 8 | Bugs | **5** | 0 errors or stuck states in 10 touch games, but `--full` run 1 failed with the fight clipped at 375x553. |

Raw average: **6.8**. After the stopper cap: **4**. **FAIL** (rows 1, 5 and 8 are below 7, and there is a stopper).

### Row 5 findings (repro)
1. **Dock prompt hidden behind its buttons:**
   - At 375x667 a failed run-away shows "Caught! Escape or take Bad Stuff" under "Use Snack on a Stick | Take the Bad Stuff". The text is drawn behind the buttons and can't be read. Shot: `scratchpad/shots/fight-375x667-me-run.png`.
   - At 375x553, in a rival's fight, "Loot one card from …'s body" is behind three card buttons. Shot: `fight-375x553-rival-run.png`.
2. **Toast over the score pill:** in your own fight at 375x553, the toast "Not worn: no free slot" sits on top of the YOU vs MONSTER pill, so the numbers you need are hidden. Shot: `fight-375x553-me-act.png`.
3. **Fight clipping:** the score row and roll box fall below the table at 375x553 (`--full` run 1, sweep g1 turn 61).
4. **Truncated header:** at 375x553 the header reads "Grub's fight: med…", cut mid-word.

## Top fixes (in order)
1. Make the fight fit hold at 375x553 under every combination, so `--full` passes 3 out of 3 (the sweep issue `fight clipped: sline/vs/row/rollbox`).
2. Help bubble from the bulb:
   - Make the ring pulse 3 times, then hold still.
   - Hide the ★ badge while the bubble is open, or add a close button.
3. Dock: lay out the prompt line above the choice buttons, never under them, at both sizes. Move toasts off the fight score pill.
4. Rules text:
   - Add Resurrection to the Cleric line on the rules page.
   - Reword the tutorial `listen` step, e.g. "Quick games start each turn with a free door card".
   - Fix the stale Halfling −1 lines in `rules-notes.md` and `RULES-CHECKLIST.md`.
