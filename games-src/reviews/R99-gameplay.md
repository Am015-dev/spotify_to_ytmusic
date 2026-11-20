# R99 strict gameplay review: ochre-horizon

Reviewed branch `origin/shelf/W563-new-mars` at commit **f96f53aeca45dd78129cbe1e94cac9fef074a92e**. That is the build report commit on top of the last code commit `8eeeb997`.
Reviewed 2026-11-20, 16:40-17:20 UTC. The review only; no game code was changed.

## Verdict: FAIL, average 6.5 / 10
- Five rows score below 7: tutorial, turn clarity, phone, AI/pacing, and one row at the line.
- The cold player could play, but its verdict is not "fun": it scored fun 3/5 and would "probably once more" play again.
- No stopper: 0 crashes, 0 stuck states, and 0 rule breaks that stop play.

| # | Row | Score |
|---|-----|-------|
| 1 | Rules fidelity | 7 |
| 2 | Tutorial teaches | 6 |
| 3 | First 10 seconds | 7 |
| 4 | Turn clarity | 6 |
| 5 | Phone play | 6 |
| 6 | AI and pacing | 6 |
| 7 | Feel | 7 |
| 8 | Bugs | 7 |
| | **Average** | **6.5** |

## Gates
| Gate | Result |
|---|---|
| `VIS_SLUGS="," build-all.py --quick --out /tmp/x ochre-horizon` | PASS, 2 of 2 runs |
| `build-all.py --full` | PASS, 2 of 2 runs, alone in the foreground. games/lab.html and games/scenarios.json were restored, not committed. |
| `calm-audit.js` | loops=0, maxHelpers=0 |

The calm-audit helper count of 0 is a false clean. The audit does not know this game's helper elements (`#coach`, `#toast .tst`), so it cannot see them. My own sampler counted them; see Clutter.

## How I played
- I touch-played the built page with Playwright, tapping the real buttons, hexes and sheets.
- The player is a newcomer who taps the bulb every turn and does what it says.
- I sampled clutter, text size, tap size and clipping once a second.

| Run | Size | Level | Result | Generations | Time | Page errors |
|---|---|---|---|---|---|---|
| Learn to play, real speed, recorded | 375x667 | Easy | lost 82-87 | 17 | 646 s | 0 |
| Game 1 | 375x553 | Easy | won 89-78 | 18 | fast mode | 0 |
| Game 2 | 375x667 | Easy | won 117-89 | 21 | fast mode | 0 |
| Game 3 | 375x553 | Normal (default) | lost 84-91 | 17 | fast mode | 0 |
| Game 4 | 375x667 | Normal | won 76-67 | 16 | fast mode | 0 |

- Every run reached the result screen with 0 invariant errors.
- Thirteen card actions in the tutorial run were finished with `doMove`. My bot tapped the first, disabled row of a two-option action card ("Kiln of the Long Dusk"); the selector was mine, not a game bug.
- Engine gauntlet, 60 games each:
  - hint-follower (Normal) vs Easy: 35-25, so 58% for the newcomer.
  - Easy vs Easy: 28-32.
  - Games last 16-17 generations on average.
- The recording is games-src/reviews/R99-first-3-min-375x667.webm: the first 3 minutes of Learn to play at 375x667, real taps.

## Cold play (independent subagent, no knowledge of the game, 375x667, Learn to play, then on to generation 6, about 100 taps, about 20 min)
Verbatim, quoted as returned:
> 1. **Could I play?** Mostly yes, without guessing. The tutorial hint bubbles carried me through: pick a company, keep cards, play a card, place a tile, pass. Each play popup says "You get now: +1 rating" and the cost. Where I got stuck:
>    - After a round I was never sure whether I'd get another turn. The rival had passed, so I kept getting "Your turn: action 1 of 2" with nothing to do, and "Done end turn" just looped back to me.
>    - With 0 credits I had no obvious next move. A hint says "Out of money? Pass", but only once.
>    - Finding a specific card in a hand of 15-20 cards (unsorted, long scroll) was hard.
> 2. **Fun: 3 out of 5.** The look is good (clear map, readable cards), and the rival's score creeping up made it tense. The best moment was buying Gantry Lease, which showed credits income jump to +2 and titanium +1 on the bar. The second best was placing oceans and watching my score tick past the rival. It lost points because income was tiny and slow. I sat at 0 credits and passed for several rounds, and some actions felt like a chore.
> 3. **What confused me:**
>    - The Deep Ledger Mind and Rocket Union Hall popups said "Careful: this gives you nothing right now", while the card also shows 1 VP. I couldn't tell whether VP counts.
>    - The header shows "points" and "rating" as the same number all game, so I never saw how they differ.
>    - The cards list has no sort or filter.
>    - The "Round N: new cards" screen shows 4 cards but the button says "Buy 3 cards" or "Buy 4 cards" depending on toggles. I only found by trial that tapping a card toggles it.
>    - Windfall Mortgage ("lose 2 credit production") looked scary, and I never played it.
>    - Two banners stacked on the board ("Rival passed" plus "Your turn. The rival: passed") are redundant and cover the map.
>    - Terms like "rating" and "production" are never explained.
> 4. **Goal in one sentence:** Take turns with a rival to warm the planet, add air, and fill the oceans, and whoever has more points when all three gauges hit their goals wins.
> 5. **Dead taps and lost moments:** about 5 dead taps and about 6 lost moments. Dead taps: two taps landed on the map behind a card sheet, one tapped the wrong card after the list reshuffled, and I mis-tapped the sheet backdrop twice. Lost moments: not knowing whether it was still my turn once the rival had passed (about 3 times), choosing which card to play, the "gives you nothing" warning, and what to do at 0 credits.
> 6. **Play again?** Yes, probably once more. Income felt painfully slow in the first few rounds, so I'd want a faster start. The rival's turns were clear and the quick buy-and-play loop worked.
>
> **Could I tell what the rival did on its turn?** Yes. A summary banner reads, for example, "Rival: Beacon Spire. Place a special tile. Raise credits production 1." The new tile also showed on the map. Once the rival jumped from 22 to 27 while I was on the pass dialog and I missed why.

**Verdict:** playable, yes. Fun, no: 3/5, the same as the builder's round 2.
- The round-2 complaint about the rival is fixed: the rival's turn now reads clearly.
- Two complaints remain: a slow, cash-starved early game, and turn-flow confusion after the rival passes.

## Rules vs the original
The engine (`game/src/engine.js`) matches the original on:
- setup: corporate era, no starting production, 2 corporations plus the beginner, 10 cards at 3 credits each, rating 20
- turn flow: 1-2 actions, passing out, first player rotates
- research and draft
- production: energy becomes heat; credits = production + rating
- all three global tracks and their bonus steps (-24, -20, 0°C, oxygen 8%)
- standard project costs (11/14/18/23/25, sell 1)
- 8 plants and 8 heat conversions
- tile rules: ocean-adjacency bonus, no city next to a city, greenery next to own tile
- milestones (8 credits, 5 VP, 3 max) and awards (8/14/20, 3 max)
- 2-player award scoring with a tie paying both
- city scoring counts greeneries of any owner
- end trigger, then the final greenery conversion, with the tie broken by credits
- map 61 spaces, rows 5-9-5, 12 ocean spaces, 4 volcanic, 1 reserved, 2 off-map
- 9 ocean tiles

Mismatches and risks:

| # | Where | Mismatch | Severity |
|---|---|---|---|
| R1 | COMPONENTS.md:20, data/cards.json (8 `special` tile cards) | The original pool has **11** special-tile cards. Ours has 8, a distribution mismatch: [unverified] here, but the builder's own memory (11) agrees with mine. | medium |
| R2 | game/src/ui5.js:64 (tutorial `turn2`) | "You get two actions, then the rival takes a turn." The rule is 1 **or** 2 actions; the game offers "Done end turn" after one. It teaches the wrong rule. | medium |
| R3 | game/src/engine.js:446, 450 | A card's trigger never fires on its own tags. The original's default is believed the same (some cards say "including this"), but this is not marked [unverified] in rules-notes.md and has no rules-test assertion. | low |
| R4 | rules-notes.md "Simplified on purpose", engine.js `rprod` | "Decrease any production" always hits the rival and can be played when the rival has none. In the original you must pick a target that has it, which can be yourself. Documented, but it is a rule change, not just interface. | low |
| R5 | rules-notes.md "Simplified on purpose", engine.js `maxPay` | Payment is automatic: titanium and steel are spent first, so you cannot save them. Documented. It changes play in titanium-heavy hands. | low |
| R6 | COMPONENTS.md:25-26, game/src/map.js milestones and awards | 4 of 5 awards copy the original's award concepts one-for-one under new names: tiles on the map, credit production, science tags, heat resources. Founder (3 cities) and Engineer (building tags) are also near copies of original milestones. Thresholds differ (TR 34, 7 building). This is close to card-for-card copying of authored goals; redesign at least the awards. | medium (content) |
| R7 | data/targets.json vs COMPONENTS.md:12-13 | The targets and the reported actuals disagree: city tags 15 vs 12, building 58 vs 55, cost band 0-6 50 vs 45, 20-29 30 vs 35. The ±3 tolerance hides a 3-5 card drift; record which is the original's structure. | low |
| R8 | data/cards.json:3181 | Player-facing text "Standard projects(city)  cost 4 less." is machine text, with a double space and "(city)". | low |
| R9 | game/src/ui5.js:95, engine.js:474-475 | Hints and the log show raw keys ("fund financier", "claimed the steward milestone"), not the display names. | low |

Judging the [unverified] counts:
- 208 cards, 12 corporations plus a beginner, 61/12/9: right.
- The 118/48/42 type split: plausible within ±2 of my memory, so I accept it but leave it [unverified].
- Special-tile cards: 8 is wrong (should be about 11; see R1).

Our own content: all 208 card names, all corporations and the map names are our own. A 12-card sample and the corporations show no card-for-card copies. R6 is the exception.

## Clutter
Sampled every second over 5 runs (1,366 samples).

**Infinite animations:** 0 in every sample, including the 15 s after a bulb tap (calm-audit agrees).

**Helpers: max 3 on screen at once, which fails the max 1 rule.** At 8-9 s into Learn to play these three show together:
- the coach bubble ("Warm it, give it air…")
- the "Try this" bulb toast
- the "Your turn. The rival: …" toast

Over the gauges the three goal pulses also run at the same moment. A toast stacked on another toast happened in more than 40 samples in every one of the 5 runs (my log caps at 40). The stacks were:
- "Your turn. The rival: passed" + "Try this"
- "Rival passed" + "Your turn. The rival: passed", which the cold player also flagged

The cause is in game/src/ui3.js:19: the toast box keeps 2 toasts. ui3.js:86 adds a second rival summary on top of the first. The coach check in ui5.js:76 only blocks a second coach, not toasts.

## Phone (375x667 and 375x553)
- **Text:** no visible text under 11 px in any sample.
- **Clipping:** none off-screen.
- **Taps:**
  - The bar, the resource chips, the menu, the zoom buttons and the bulb are all 44 px or more.
  - **Sheet tabs are 40 px tall** (game/head.html:87 `min-height:40px`). That covers Can play/Hand/Played, Standard/Milestones/Awards, You/Rival, and the rules tabs.
  - **Hexes are 32x37 px at 375x667 and 29x33 px at 375x553** without zoom. The two-tap "Place here" confirm and the zoom buttons make this safe, but a first tap often selects a neighbour.
- **Overlap:** the two stacked toasts cover the top third of the board at 375x553. Over an open Projects sheet they cover the Standard/Milestones/Awards tab row. That is a frame at 25 s in the webm: "Try this: fund financier" sits over the tabs it asks you to tap.
- **Dead taps:** none were caused by the game in my runs.
  - The cold player had about 5: taps behind a sheet onto the map, the backdrop closing a popup, and a list reshuffle.
  - Twice my bot tapped a card in "Can play" and got no Play button, consistent with the list re-sorting under the finger.
  - "Done end turn" while the rival has passed gives no feedback: the turn comes straight back as "action 1 of 2".

## Rows under 7: repro steps
- **Row 2, Tutorial 6.** Learn to play.
  - (a) 8 s in: the coach bubble, the bulb toast and the rival toast show together.
  - (b) After one action the coach says "You get two actions, then the rival takes a turn" (wrong, see R2).
  - (c) It is a tip stream over a live, random game, not "one line + one tap" steps. Oxygen/temperature bonus steps, card resources and VP, and the research buy toggle are never taught. The cold player found by trial that tapping a research card toggles it.
- **Row 4, Turn clarity 6.**
  - (a) Pass until the rival passes, then take 1 action and tap "Done end turn". You are back at "action 1 of 2" with no "Rival has passed: you keep playing" line.
  - (b) Open Deep Ledger Mind (1 VP, adds a science resource). It says "Careful: this gives you nothing right now" (ui4.js:135), which ignores VP and resources.
  - (c) The top strip shows points and rating as the same number for most of the game, and neither word is explained.
  - (d) Have a two-option action card. The bulb says "Use Kiln of the Long Dusk" without saying which option.
- **Row 5, Phone 6.**
  - (a) Open any sheet: the tabs are 40 px tall.
  - (b) At 375x553 the board hexes are 29x33 px.
  - (c) At 375x553 take a turn after the rival passes: two toasts cover the top third of the map. With Projects open they cover the tab row.
- **Row 6, AI and pacing 6.**
  - The rival is brisk: about 3.8 s per turn at real speed, 7.9 s max. Its play is sensible.
  - The hint-follower wins 58% on Easy in the engine but went 2-1 in my touch runs, losing the tutorial game 82-87 on Easy.
  - Real games run 16-21 generations. The cold player reached only generation 6 in 20 min, and sat at 0 credits passing for several rounds.
  - For a first game on a phone that is too long and too cash-starved early. A tutorial or "short game" start, still with identical rules, would need UI help: a clearer income explanation, and suggestions for cheap production early.

## Prioritised fix list
1. **One message at a time.**
   - Queue the coach bubble, the bulb toast and the rival summary so only one is visible.
   - Drop the duplicate "Rival passed" toast when "Your turn. The rival:" follows.
   - Keep toasts off the sheet's tab row. (ui3.js:17-21, 86; ui5.js:76)
2. **After the rival passes,** say it in the hint pill and on the button: "Rival is out: your turn again". (Turn clarity; the cold player's top confusion.)
3. **Fix the "You get now / Careful" preview** so it counts VP, card resources and lasting effects. (ui4.js:135)
4. **Fix tutorial line `turn2`** to "Take 1 or 2 actions, then the rival plays." Add one-line steps for bonus steps, VP on cards and the research toggle. Explain "rating" and "production" in one line each.
5. **Make phone taps 44 px:** sheet tabs at min-height 44 (head.html:87). Consider a larger default board zoom at 375x553.
6. **Early-game cash for first-timers:**
   - The bulb should favour cheap credit production in generations 1-3.
   - Add a visible "income next round: +N" on Pass.
   - Re-run cold play; the bar is "fun" (4/5+) and "would play again".
7. **Content and rules:**
   - R1: add 3 special-tile cards to reach the original's 11.
   - R6: redesign the awards and milestones so they are not renamed copies.
   - R3: mark self-trigger as [unverified] and add a test.
   - R8/R9: fix the machine text and raw keys.
8. **Keep the hand findable:** stop "Can play" re-sorting while the sheet is open, and add a sort/filter in "Hand". The cold player and my bot both mis-tapped after a re-sort.
9. **Teach calm-audit this game's helpers** (`#coach.on`, `#toast .tst`), so the gate stops reporting a false 0.
