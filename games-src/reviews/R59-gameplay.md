# R59 strict gameplay review: Twin Thrones (14 Nov 2026)

Build reviewed: `shelf/W520-twin-thrones-rules` at **2ef6d47906a1b0a2bb856f24adfce1579263bb9d** (FIXED2 report on code 857bf7d6).
Played as a newcomer, touch only, at 375x667 and 375x553, default level (Easy). Reviewer did not change game code.

## Verdict: FAIL, average 6.6 (rows 1, 4, 5 and 8 are under 7). No stopper.

| # | Row | Score | One line |
|---|-----|-------|----------|
| 1 | Rules fidelity | 6 | The engine and all 73 cards + 12 wonders + 10 tokens match the original. Some player-facing text is wrong or missing (see F1, F2). |
| 2 | Tutorial teaches | 8 | 40 steps, 1 short line + 1 tap each, every core rule in play order, 153 s, then "Play a real game". Same at 553. |
| 3 | First 10 seconds | 7 | Clear title, Easy preselected, 3-bullet "How to win", then "Tap the glowing wonder". |
| 4 | Turn clarity | 6 | The popup states cost and why ("Your wood costs 1 coin to trade. You pay 3 coins."). But 12 cards never say what they do (F2), chain cards don't name their link, and the Wonder button shows no cost. |
| 5 | Phone play | 6 | Takeable cards >= 49.7x54.6 at 553, 0 names overflow, big popup buttons. But the "Your turn" banner sits over the war track and the card you just opened (F3). Float labels and the star overlap text. |
| 6 | AI and pacing | 7 | Wait for your turn: median 2.2-2.9 s, p90 3.4-3.9 s, max 5.7 s. A full game is about 2.5 min of play. Easy can be beaten, but the step up to Normal is steep (F5). |
| 7 | Feel | 7 | Calm board, cards fly to the city, "+3 Grand Port" floats, sound. 0 endless pulses. |
| 8 | Bugs | 6 | 0 console errors and 0 stuck states in 4 games + 2 tutorials. But a tied game ends with a false line (F1), and a token tooltip stays on top of the result screen (F4). |

Average = 53 / 8 = **6.6**.

## Gates (run alone, reviewer machine)
| Gate | Result |
|---|---|
| `VIS_SLUGS="," build-all.py --quick --out /tmp/x twin-thrones` run 1 / run 2 | PASS 5/5 scenarios / PASS |
| `build-all.py --full` run 1 / run 2 | PASS / PASS (phone-check 54 s, rules sweep ok; LAB warn-only, as before) |
| `bench-ai.js 200 easy newbie` / `normal newbie` | the newbie wins 64% vs Easy / 16% vs Normal |

## Rules check vs the original (from rules-notes.md + reviewer knowledge; never named)
Engine (`src/engine.js`) checked line by line. All correct:
- Wonder draft 1-2-1 / 2-1-1 with the last card automatic.
- Pyramids 2-3-4-5-6 / 6-5-4-3-2 / 2-3-4-2-4-3-2. Rows alternate face up and face down. Cover logic is right.
- Trade costs 2 + the rival's brown/grey output; a trade post makes it 1. Choice production does not raise the rival's price.
- Sell gives 2 + 1 per yellow card. Chains are free. Seven wonders at most.
- Loot of 2 and 5 coins, taken once. Reaching 9 wins at once. End zones give 2/5/10 points.
- A pair of science symbols gives a token, once per symbol. 6 different symbols (Law counts) win at once.
- The weaker player on the war track picks who starts the next age; on a tie, the player who took the last card picks.
- The 10 token effects are right: Strategy works on red cards only; Theology; Economy; Urbanism 6 + 4.
- Guild coins and points come from the best city. Builders give 2 points per wonder, Moneylenders 1 point per 3 coins.
- Tie-break on civic points, then a shared win.

Data (`src/data.js`): all 73 cards (cost, effect, points, chain), 12 wonders (Beacon Isle P2 S1 W1 and Thunder Idol W1 C1 S1 P2 now correct) and 10 tokens match. Some ids carry the wrong age prefix (`a2-star-gazers`, `a3-scholar-court`…) but their `age` field is right: cosmetic only.
**No wrong core rule.** Rules is 6, not 7+, only because of the player-facing text below.

## Clutter (sampled every 1 s, 864 samples)
- Helpers on screen at once: **max 1** (the star; the card and its popup button glowing together count as one hint). My raw sampler saw 2 in 4-15 samples per game, but those were a flying card or the short "Your turn" banner next to the star. Neither is a helper.
- Endless animations: **0** in 556 game samples and 308 tutorial samples. **0** at 15 s after tapping Hints (4 of 4 games).
- After 10 s idle, the star appeared 4 of 4 times. Build/Sell/Wonder glowed when they were the hint.

## Games played (touch, Easy, Quick game)
| Game | Size | Play style | Result | My turns | Wait med / p90 / max |
|---|---|---|---|---|---|
| g1 | 375x667 | half hint, half random | lost 49-49 on civic points | 28 | 2.9 / 3.9 / 5.7 s |
| g2 | 375x553 | half hint, half random | lost 33-42 | 29 | 2.3 / 3.8 / 4.8 s |
| g3 | 375x553 | random taps, build if possible | **won 41-40** | 29 | 2.2 / 3.8 / 4.7 s |
| g4 | 375x667 | follow the star | won 54-35 | 30 | 2.2 / 3.4 / 4.8 s |
Tutorial: 375x667 and 375x553, 40/40 steps, 153 s each, 0 errors, ends on "Play a real game".

**Fun / decisions / fairness.** You do face real choices: build, sell or wonder; what to deny the rival; the war threat versus science pairs. The popup makes the cost of each choice clear. Easy as the default is fair for a first game: the newbie bot wins 64%, R56 measured 72%, and I went 2-2. Easy is not too easy for a first game. But random tapping beat it 41-40, so after 2-3 games it has no bite. Normal then jumps to a 16% newbie win rate, and nothing sits in between. There's no prompt like "You won twice on Easy, try Normal". The owner's "not fun" now comes mostly from not knowing what late cards do (F2), not from the rules.

## Findings (repro steps for every row under 7)
- **F1 (rows 1, 8): a tied game claims a science win.** Play to a points tie (g1: 49-49, the rival won on civic points). The result says "Rival won 49 to 49 on civic points" and then "**An early science win: points do not decide this game.**" Cause: `src/ui.js:582` prints that line for any `G.reason` other than `points`, so `tiebreak` and `draw` fall into the science branch. Shot: `shots/g1-667/18-result.png`.
- **F2 (rows 1, 4): 12 cards never say what they do.** Tap Sand Arena (age III): the popup says only "3 points, free if you own a chain symbol". The 2 coins per wonder is missing. Trade Chamber, Beacon Quay, Grand Port and Armory say only "coins for cards in your city", and the card face says "coins now": no count, no card type. All 7 guilds say "guild: points from the biggest city": no card type, no coins. Customs Quay says "your glass costs 1 coin to trade" but covers glass **and papyrus** (`describe()` reads only `c.price[0]`, `src/ui.js:178`). The All cards drawer shows the same card faces, so the facts are nowhere in the game. Also "1 points" (Herbarium popup).
- **F3 (row 5): the "Your turn" banner covers the decision.** At 375x553, tap a card right as your turn starts. The banner sits over the war track and the zoomed card, and the card name and art are hidden. Seen in g2 turn 1 and g3 turn 28: `shots/g2-553/03-zoom1.png`, `shots/g3-553/14-zoom28.png`. It also overlaps the tutorial bubble 4 times per tutorial (banner + ring). Other overlaps: "+3 Wayside Shrine" / "+1 Beacon Isle" floats sit on the goal line and the rival coins (`g3-553/10-first.png`, `g1-667/10-token.png`); the star covers the card name ("Timber Stan★", `g1-667/09-hint+15.png`).
- **F4 (row 8): a token tooltip outlives the pick.** Earn a token, tap one (it shows "Fine Masonry: Blue cards cost 2 fewer resources. Tap again to take it."), then finish the game. The tooltip is still drawn over the result screen. Shot: `g1-667/18-result.png`.
- **F5 (row 6, minor): a steep jump from Easy to Normal.** Easy picks at random from the 2nd-6th best move 60% of the time (and the `ai.js` header still says "easy = random legal"). Newbie win rate is 64% on Easy and 16% on Normal. Add a middle step, or nudge to Normal after 2 Easy wins.
- **Row 4, minor:** the Wonder button shows the wonder's name but not its cost (Build says "pay 6"). "Age II: who starts?" doesn't say why you choose (you are behind on shields). Chain cards say "free if you own a chain symbol" without naming the card.

Screenshots: reviewer scratchpad `shots/<game>/` (local only, not committed).

## Top fixes, in order
1. Fix `ui.js:582`: show the early-win line only for `military` / `science`. Add a tie line for `tiebreak` / `draw`.
2. Write a full popup line for perCol / perWonder / guild / two-resource price cards. Examples: "2 coins per wonder you built, 3 points"; "1 coin per yellow card in the city with most now; 1 point each at the end". Use the same text in the All cards drawer.
3. Don't show the "Your turn" banner while the card popup or the tutorial bubble is open. Keep float labels off the goal line, and keep the star off the card name.
4. Clear the token tooltip when the picker closes.
5. Add the wonder cost to the Wonder button. Name the chain card. Add a middle AI level, or a "Try Normal" nudge after 2 Easy wins.
