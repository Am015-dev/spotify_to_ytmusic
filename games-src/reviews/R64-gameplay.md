# R64 strict gameplay review: Thornbound (14 Nov 2026)

**Verdict: FAIL, 6.8 / 10.** Rows under 7: Rules 5 (cap), Phone 6, Bugs 6.

- Build reviewed: `origin/shelf/W489-thornbound-rules` at **6abf36404cb6b6d8f0cb7215ae9538e451abb13f** ("loop-test checks the suggested glow comes back...").
- Reference: the published base-game rules, as written in `thornbound/rules-notes.md` and `thornbound/cards.json`. Both are own-words notes made from the rulebook and card images. Nothing here names the original.
- Rubric: `games-src/reviews/GAMEPLAY-RUBRIC.md`. History: R57 scored 6.4 FAIL; F12 claimed fixes.

## Gates (each run alone unless noted)
| Gate | Result |
|---|---|
| `--quick` | PASS (12/12 scenarios, 84 s) |
| `--full` run 1 | **FAIL**, phone-check: `text >8 words: 9w "The Great Road discards Hunting Horn…"` |
| `--full` run 2 | PASS (phone-check, lab WARN 10/12, sweep 0 problems; 4 m 29 s). A node gauntlet overlapped this run for about 1 minute. |
| hint-test | PASS (76 cards) |
| loop-test 375x553 | PASS (tutorial + 90 s game, 0 infinite loops) |
| rules-test | 119/119 |
| gauntlet 60 games, 2/3/4 players | 0 errors, 0 stalls, 0 invariant violations; factions 20-30 % at 4 players |

`--full` is **not reliable**. The game log line "The Great Road discards <card>." breaks phone-check's 8-word limit whenever the discarded card has a 4-word name (Hunting-Horn of the Swans). Whether that card comes up depends on the deal, so the gate passes or fails at random.

## Rules and text vs the original
The engine's core rules match the original. I checked them in the code:
- Supporters count in the first Clash only.
- The Herald needs the chosen Location; then +1 and a steal from each rival Herald there.
- Order Track ties reverse the previous order.
- Attrition: shuffle the Discard, Hand Size -1, minimum 3.
- Great Road discards 1, or 2 when nothing was taken.
- Steals need a strictly higher bid.
- Tied Clashes re-clash with only the new cards.
- Winter clean-up, including token decay.
- Deadly against Invulnerable and Resilient cards.
- Final tiebreak order: the Favour, then the Order Track.

The R57 text faults are fixed:
- The Heir hint now says "returns this card".
- Deploy now says "stays 1 more Winter".
- The tutorial's Day → Night → count order is right.
- The coach's Lost Pile line is right.

What I compared myself:
- All 20 Site of Power cards: Strength, archetype, traits, commands, cost, text and hint.
- All 14 basic cards.
- 14 random Kingdom Cards (seed 64: #4 #5 #6 #10 #15 #22 #23 #31 #38 #42 #44 #45 #49 #50), plus the engine code for 7 of them.
- All 16 Tactics and 4 Favour actions.
- All 6 command types, the glossary (58 entries), the rules page, all 38 tutorial lines and every coach line.

**Faults (they cap Rules at 5):**
1. **Hedge Skirmishers (Lantern Rising Site card) has lost its Ambush command.** The original card prints Ambush (Day): see `cards.json` `upr_a3` `commands:[ambush]`. In `src/data.js` the card has `cm:[]`, so the engine never offers Ambush and the hint never mentions it. hint-test cannot catch this, because it only compares the hint with the game's own data.
   - Repro: `node -e "require('./src/data.js');console.log(TB.DATA.SITE.uprising[2].cm)"` prints `[]`.
2. **Martial Writ (Gilded Court Tactic) text teaches the wrong length.** The text says "Rivals cannot swap, add or move cards into that Region **this Round**." The original, and the engine (`lockedFor`: `G.reg[r].n<=1`), lock the Region for its **first Clash** only. After a tied Clash, rivals may Ambush or Flank into the re-Clash while the text says they can't.
3. Minor, not counted in the cap:
   - Cellar Fuse's hint gives no timing (the original says Night).
   - The rules page leaves out Ossuary's "then discard any number of cards".
   - Rite of the Fang says "it gains" where "this card adds" is clearer.

## Clutter (sampled every 1 s, my own sampler)
| Run | Samples | Max helpers | Infinite loops |
|---|---|---|---|
| Tutorial 375x667 (to the end card, 93 s, +16 s idle) | 96 | 2* | 0 |
| Tutorial 375x553 (to the end card, 94 s) | 97 | 2* | 0 |
| Game 375x667 (full, 413 s, bulb at 40 s + 15 s idle) | 417 | **2** | 0 |
| Game 375x553 (full, 424 s, bulb + 15 s) | 428 | 2* | 0 |

\* In each of these the tutorial or bulb ring sits on the same spot that glows (`#bidspot` + `.gxt-ring`, or `.rglow` + `.gxh-ring`), so it reads as one pointer. I accept these.

**Not accepted:** at 375x667, Round 1 Spring, I tapped the bulb.
- What showed: the bulb bubble ("This Tactic helps you most right now.") plus a finger on the "Doctrine of Tempests" button, while the Supporter regions kept their gold glow (`.rglow`).
- Two separate helpers stayed on screen for all 16 samples, through the 15 s after the hint.
- Shot: `scratchpad/shots/gameA-04-bulb+15s.png` (this session's scratchpad; not committed).

## Regressions
- **Taps:**
  - Map Locations (`.tb-loc`) are **57x42 px** at 375x667 (seen in the tutorial and in the game), under 44.
  - Everything else measured 44 px or more (`.cs-c` 70x44, `.gxh-ok` 81x44).
- **Fonts:** no visible text under 14 px in any sample.
- **Double actions:** **fail, a tap goes through to the panel below.**
  - Repro (375x667): win the Uplands and claim Thornwild. The Goal card ("Have the most Influence…", "Got it") is open over the Thornwild Journey choice. Double-tap "Got it".
  - The first tap closes the card. The second tap lands on the Autumn option under it, and "Heathbound Clans Journeys with Net Menders and gains 1 Lore. The card goes to the Lost Pile" happens without the player choosing it.
  - Seen 2 out of 3 times; the third time the decision also moved on.
  - Double-tapping a hand card still plays it once, as designed ("Tap again").
- **Glow follower:** 1 win (19-8, 375x667) and 1 loss (14-16, 375x553): about half. OK.
- **`--full` reliable:** no (see Gates).

## Tutorial by touch
Both sizes reach "You know the rules" in about 94 s and 38 steps, with 0 page errors. One line per step, and one tap or Next per step.

It teaches by doing:
- bid, take back, steal
- Herald, hiding 3 cards, Supporters
- Clash order, claiming a Location, the Herald bonus and steal
- a tie re-Clash
- Govern, Journey, buying with Lore

These are only told in a Next bubble, never played: Day and Night commands, the Favour, Attrition.

The tutorial does not show a "learn later" list. The coached-game end screen in `turnstrip.js` (`tbEnd`, "Things you will meet later") still exists, but the tutorial never reaches it.

## Scores
| # | Row | Score | Why / repro |
|---|---|---|---|
| 1 | Rules fidelity | **5** | Capped. Hedge Skirmishers has no Ambush (engine and text). Martial Writ's text says "this Round" where the original and the engine say the first Clash. Repro steps above. |
| 2 | Tutorial teaches | 7 | Every core step is played once, in order. Commands, the Favour and Attrition are only told. |
| 3 | First 10 seconds | 8 | Goal card with 3 bullets, a glowing suggested card, "Tap a card to bid it in secret". |
| 4 | Turn clarity | 7 | Turn line plus a short "why" on every bulb hint. But the Spring bulb says "This Tactic helps you most right now." without naming the Tactic. Its bubble points at the top-left of the board, not at the button, and covers the turn line (`gameA-03-bulb.png`). In one of 3 runs, the bulb at Clash order showed nothing for 15 s (`gameB-03/04`). |
| 5 | Phone play | **6** | Map Location taps are 42 px tall (regression). At 375 px the "Doctrine of Tempests" button text is cut off at the left edge. The round-end "+3"/"+5" chips sit over the "You"/"Court" labels, and the round card mixes a gain with a total ("You +3 Influence · Court 8"; `gameA-07-round3.png`). |
| 6 | AI and pacing | 8 | Brisk rival; a full 4-round game takes about 7 min; the glow-follower wins about half; balanced gauntlet. |
| 7 | Feel | 7 | Cards flip, chips fly and score flashes show; the board reads as a game. |
| 8 | Bugs | **6** | 4 full games plus 2 tutorials: 0 page errors and 0 stuck screens. But the Goal card tap-through triggers a Journey nobody chose (repro above), and the `--full` gate fails at random. |

**Average 6.8. FAIL** (3 rows under 7; no stopper).

## Top fixes (in order)
1. Give Hedge Skirmishers `cm:[{n:'ambush'}]` (data + hint). Add a test that checks every Site card's commands and traits against `cards.json`, so hints are no longer only checked against the game's own data.
2. Martial Writ text: "…into that Region during its first Clash this Round."
3. Overlays: ignore taps for about 350 ms after an overlay closes, or swallow the pointerup that closed it, so a second tap can't reach the option below. Cover the Goal card, coach bubbles and pop-ups.
4. Make map Location hit areas at least 44 px tall.
5. Make phone-check reliable: shorten the log line ("Road discards <card>.") or have phone-check skip log lines.
6. While the bulb points at a Tactic or button, turn off the target glows (one helper). Name the Tactic in the bubble and anchor the bubble to it.
7. Fit or shrink long Tactic names on the action buttons at 375 px. Move the score chips off the labels.
