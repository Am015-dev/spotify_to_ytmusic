# R100 strict gameplay review: vellum-shire

- Reviewed: `origin/shelf/W561-new-estate` at **9d1bdf50319d799df118034607efa959894057a7** ("vellum-shire: report").
- Reviewer did not edit game code. Played on the staged build (`/tmp/x/vellum-shire/index.html`), touch only, 375x667 and 375x553.
- Verdict: **FAIL**. Raw average 6.5; capped at **4** by a stopper: a first-time player got stuck mid-game.

## Gates (each run alone, in the foreground)
| gate | run 1 | run 2 |
|---|---|---|
| `build-all --quick vellum-shire` | PASS | PASS |
| `build-all --full vellum-shire` | PASS (phone-check, scenarios, rules-test 139/139, Normal beat Easy 6/8) | PASS |

`--full` rewrote games/lab.html and games/scenarios.json. Both were restored and not committed. Lab WARN: the LAB rows don't match the scenario list (3/8 checks), which is non-blocking.

## Clutter (calm-audit.js, 1 sample/s, play path plus Hint, guided path)
- `loops=0 maxHelpers=1` (one bubble with its own ring, at play@1s after Hint). **Pass.**

## Rules vs the original
The engine (`src/engine.js`), data (`src/data.js`), rules drawer (`src/ui3.js:49-63`) and hint lines all follow the original 2-player game. Matches: 5 chapters x 5 rounds; the 4 actions; workers ±1 with wrap; ink stall for 2 silver once per turn; keep, barge, animals, quarry; all 8 building effects; region points 1-36 plus chapter bonus 10/8/6/4/2; seals 5/2; selling 2 points per tile plus 1 silver; end scoring; turn order with the later arrival first; start workers 1/2; 3 start goods; 164 tiles and 42 goods.

Mismatches:
1. `src/data.js:45`: lore 1 text says "the same building **twice**". The engine (`engine.js:82`) allows any number, which is the original's power. The text is wrong, not the rule.
2. `src/engine.js:209`: when a barge brings more goods kinds than storage can hold, the game picks which kinds to keep. In the original the player chooses. It is disclosed as "UI-only", but the brief allows no simplifications. Low impact (rare).
3. `src/engine.js:136` and `:238`: the Granary/warehouse sell and the pending bonus actions are dropped automatically when nothing but skip is left. That is correct. Noted only because it was verified.

The 4 [unverified] items:
- Region points 5-8 and chapter bonuses II-IV: **accept**. They are the printed triangular series (15/21/28/36) and 8/6/4.
- Ink stall 4 tiles at 2 players: **accept as likely**. The rulebook says "2 to 8 depending on player count", which fits 4/6/8.
- Lore 16/18-21/23 building mapping: **accept**. The effect is the same 4 points per building kind whatever the number. Only the number on the tile could differ, and nothing in play depends on it.
- Start keeps from the plain keep stack: **accept**. It doesn't change any count a player sees. The tile invariant holds at 164.
- Tie-break "more empty spaces": consistent with the online play rules that fix the printed English error. Accept.

Rules verdict: **faithful**. 1 player-facing text error (lore 1) and 1 disclosed UI choice (barge overflow).

## First-timer play
- Tutorial: walked to the end card at 375x667 and 375x553, 19 steps (goal, dice, take, place, barge, rival, tower, sell, workers, ink, region). One short line and one tap per step. It does **not** teach the keep, animals, quarry, lore or seals. Most importantly, it never says "when nothing glows, tap Workers to take 2", which is exactly where the cold player got stuck.
- 3 full games by touch to the result screen, Easy computer, 0 page errors, 0 stuck states, tile/goods invariants clean:
  - 375x667, following the Hint (bulb = Normal pick): **lost 110-159**, 239 s, 130 taps.
  - 375x553, following the Hint: **won 182-125**, 233 s.
  - 375x667, weaker newcomer play (Easy picks): **lost 111-118**, 240 s.
  - Following hints won 1 of 2. Builder data: Normal beats Easy 27/40. That is about half or better, which meets the bar.
- Before committing: tapping a stall tile shows "Take Barge: to storage" plus a "Do it · 1 worker" button. Cost is shown; the tile's effect is not (you have to open Tiles). The selected stall tile gets no visible highlight.
- Rival turn: about 4.6-6.1 s per turn. The status line names each action ("Rival: takes Hostel"). The view switches to the rival's estate during its turn, but only the small red "Rival" tab says so. The cold player didn't notice.

## Phone (375x553 is the problem)
| element | 375x667 | 375x553 |
|---|---|---|
| estate hex (tap target) | 42x48 | **28x32** |
| stall tile | 41x42 | **37x30** |
| storage slot | **34x38** | **34x38** |
| silver button | 39x44 | 39x44 |
| smallest text | 11 px (worker-cost badges, counters), 12.8 px "Ink", 13.6 px "You/Rival" | same |

Nothing is clipped, there is no horizontal scroll, and nothing overlaps. At 667 there is a ~60 px empty band under the dock, and at 553 the board leaves wide empty margins, so the hexes could be larger.

## Cold play (independent subagent, no knowledge of the game, 375x667, touch), quoted as-is
> Could you play it? Partly. I finished the tutorial (19 steps) and played a real game against the computer (default difficulty was Easy) to chapter II, round 3 of 5, which is round 8 of 10. I did not reach the result screen. I got stuck and ran out of my 20 minutes. Score at that point: me 31, computer 17.
>
> Was it fun? Yes, the tutorial was excellent. It was one tap at a time, with "tap your 3" prompts and "Do it" confirmations. The dice-and-tiles puzzle clicks once you see that a die picks a stall column or a board hex with that many pips. Bonus popups like "+15 points" and "Region complete!" feel rewarding. I would play again.
>
> What confused me:
> - s26, s29: The "Do it" button says "1 worker" with no explanation. It was unclear whether that costs a worker or just names the action.
> - s43, s49: With full storage (3 tiles), tapping a stall tile does nothing, with no message. Only after a second try (s46) did it say "Storage full: tap a tile to drop". I also had to tap the tile's top half (s50) because the lower half did nothing.
> - s52, s53: My score stayed at 0 for the first 3 rounds. I could not tell why tiles in storage were not scoring, or what makes a board hex glow.
> - s53 to s56: Whole rounds where my dice had no glowing hex.
> - s64, s65: Buying from the ink stall did not use up the die.
> - s81 to s89 (stuck): One die was left, nothing glowed, and no "End turn" button appeared. The hint text only said "Wool: sell with a 1".
> - s83, s84, s86: The arrow button at the bottom right (345,577) is unlabeled. Tapping it shifted the whole layout. I never found a way to pass the die.
> - s33, s74: During the computer's turn the board sometimes shows its tiles (s74), with no clear sign of whose board it is.
> - Several icons are tiny, and the tiles in the stalls are hard to tell apart.
>
> Verdict: A charming, well-taught dice-and-tiles game, but the missing "pass / no moves" and storage-full cues leave a first-time player stranded mid-game.

Reviewer check of the stuck state: the engine always allows "take 2 workers", and the Workers button does get the `.tgt` class. On screen, though, it shows only a faint gold border next to bright glowing hexes and tiles, and no line says "tap Workers". So for a newcomer this is a real soft-lock. The lower-half tap on a stall tile did select in my repeat (it hit the tile's polygon), so I couldn't reproduce it. Video: `games-src/reviews/R100-first-3-min-375x667.webm` (first 3 min of the cold session).

## Scores (GAMEPLAY-RUBRIC.md)
| # | row | score | why |
|---|---|--:|---|
| 1 | Rules fidelity | 8 | Full original game; lore 1 text wrong; barge overflow auto-picked |
| 2 | Tutorial teaches | 7 | Short and one tap per step, but skips keep/animal/quarry/lore/seals and the "nothing glows → Workers" fallback |
| 3 | First 10 seconds | 7 | Title line plus "Learn in 5 minutes"; first turn says "Tap a die, then a glowing spot" |
| 4 | Turn clarity | **5** | No pass/"take workers" cue when a die has no glowing target (stopper); "1" badges and "1 worker" not explained; first tap with full storage is silent; rival board swap unclear |
| 5 | Phone play | **5** | 375x553: hexes 28x32, stall tiles 37x30; storage 34x38 at both sizes; 11-13.6 px labels (rubric asks 14) |
| 6 | AI and pacing | 7 | About 5 s rival turns, about 4 min games, hint-follower won 1 of 2 on Easy |
| 7 | Feel | 7 | Score pops, "Region complete!", sound; the selected stall tile doesn't highlight |
| 8 | Bugs | **6** | 0 errors and 0 engine stalls in 3 scripted games, but the cold player hit a practical soft-lock and a silent first tap |

Raw average **6.5**. Stopper (first-timer stuck, could not finish), so the total is capped at **4**. **FAIL.**

## Repro for rows under 7
- Row 4/8 (stopper): Play vs computer at 375x667. Use workers until you have 0, then keep one die whose number matches no stall tile, no placeable space and no goods (e.g. s82 in the cold run: chapter II, round 3, die 3, 0 workers). Nothing glows, there is no End/Pass button, and the only legal move is tapping the faint Workers button.
- Row 4: fill all 3 storage slots, select a die, tap a glowing stall tile. The first tap gives no message; the "Storage full" prompt appears only on a later try.
- Row 5: 375x553, Play vs computer, measure `[data-h]` at 28x32, stall `[data-tile]` at 37x30 and `.sto` at 34x38.

## Prioritized fixes
1. **When a selected die has no glowing target, make it obvious**: glow the Workers button like the hexes and show "Nothing fits: tap Workers for +2" in the status line. Also have Hint suggest it. Then add one tutorial step for this case.
2. **Bigger targets at 375x553**: let the board use the side margins and the empty band (hexes ≥ 44 px), or add a tap-to-zoom estate. Make storage slots and stall tiles ≥ 44 px at both sizes.
3. Storage full: the first tap on a stall tile should say "Storage full: tap a stored tile to drop" right away.
4. Explain cost badges: the first time a "1" badge appears, show "1 = workers needed"; label the button "Do it (uses 1 worker)".
5. Rival turn: show a clear "Rival's estate" banner while the view is switched.
6. Before committing, show the tile's effect in the confirm line (e.g. "Barge: load goods, play earlier").
7. Fix the lore 1 text to "the same building more than once" (`src/data.js:45`).
8. Label the bottom-right ⇥ button, and highlight the selected stall tile.
9. Labels below 14 px (badges 11 px, "Ink" 12.8 px, "You/Rival" 13.6 px) up to 14 px where room allows.
