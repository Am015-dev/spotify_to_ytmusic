# R94 strict gameplay review: shipwreck-isle

- Build reviewed: `origin/shelf/W468-shipwreck-lean` at **b0281a009eb140df92fd86d5b8c20b9a7c62ca2c** ("F15: weather help card shortened to 19 words").
- Date: 20 Nov 2026, about 16:25 UTC. Reviewer only: no game code was changed.
- Proof files: `games-src/reviews/R94-proof/`. Cold-play video: `cold-play-375x667-first3min.webm` (the first 180 s at 375x667, touch only: start screen, New here?, Learn in 5 minutes, through day 2).

## Verdict: FAIL, average 6.5

| # | Row | Score |
|---|-----|-------|
| 1 | Rules fidelity | 6 |
| 2 | Tutorial teaches | 5 |
| 3 | First 10 seconds | 8 |
| 4 | Turn clarity | 7 |
| 5 | Phone play | 7 |
| 6 | AI and pacing | 5 |
| 7 | Feel | 7 |
| 8 | Bugs | 7 |

No stopper: there were no stuck states, no crashes and no dead taps, so the score is not capped. It still fails, because rows 1, 2 and 6 are under 7.

## Gates (run alone, 2 runs each)

| Gate | Run 1 | Run 2 |
|---|---|---|
| `build-all.py --quick` | PASS (8/8 scenarios, 148 s) | PASS (8/8, 147 s) |
| `build-all.py --full` | PASS (phone-check 174 s, sweep 4 games) | PASS (phone-check 171 s, sweep 4 games) |

- Both full runs warn on the lab test (`WARN 9/12`: the LAB rows don't match the scenarios). This is not a failure.
- `games/lab.html` was restored and is not committed.
- Also run: `node logic-test.js` passes all 277; `node rules-test.js` passes all 28.

## Clutter (sampled every second)

| Run | Samples | Max helpers on screen | Infinite loops | 15 s after ✨ Hint |
|---|---|---|---|---|
| Tutorial + 4 days, 375x667 | 257 | 1 | 0 | 1 helper, 0 loops |
| Tutorial + 4 days, 375x553 | 243 | 1 | 0 | 1 helper, 0 loops |
| Tutorial + Keep playing to day 8, 375x553 | 270 | 1 | 0 | 0 loops |
| Full default game, 375x667 | 298 | 1 (✨ finger) | 0 | 1 / 0 |
| Full default game, 375x553 | 261 | 1 (✨ finger) | 0 | 1 / 0 |

The clutter rule is met: at most 1 helper on screen and 0 infinite loops in every run, including the 15 s after a hint. The F14 and F15 work holds up here.

## Rules versus the original (from `rc/rules-notes.md` and `rc/RULES-CHECKLIST.md`)

**Normal mode engine: matches.** These all match the published game:
- the round phases;
- 2 pawns per castaway, and 1 pawn = dice while 2 = sure;
- the shelter cost by player count, and hunting needs 2 pawns with weapon against strength;
- rest, arranging the camp, the night (eat 1 or take 2 wounds; no shelter = 1 wound);
- the weather: each cloud above the roof costs 1 food and 1 wood, each snow cloud also costs 1 wood, and the hungry-animals die can take food, the palisade or fight at strength 3;
- Marooned's weather table (rain from round 4; rain, snow and animals from round 7);
- the signal pile goes 1-2-3-4-5 with one stage a round.

Beast vs WEAPON was not reopened.

**Player-facing text: true**, including all 3 weather steps (wx1 to wx3) and the rules page. The tutorial lines match the engine.

**Fails to match: the default game ("Easy island") is not the original's easier variant.**
- `rc/tutor.js` (`EASYK`, `easyDeal`) changes these things:
  - removes the weather dice entirely (`G.wxT={}`);
  - swaps the event deck for the 14 mildest cards;
  - fixes the tile order so the mountains come early;
  - raises food and wood to 4;
  - starts the signal pile at 3/15 ("wreck timber").
- None of these is in the published easier variant (dog, 4 starting items, 2 fewer book events). Your requirement is rules identical to the original.
- `rc/rules-notes.md` (Difficulty table) still describes only the published variant, so the notes don't match the code.
- Easy is the default on the start screen ("Game setup: Marooned · 2 players · Easy island").
- As a result, the tutorial's weather steps ("Normal island, days 4-6: a rain die…") describe a mode the learner is not playing. Their first real game never rolls a weather die.

Repro:
1. Open the game and look at the start screen: Difficulty is preset to Easy island.
2. Tap Play, then Play anyway.
3. On the plan screen, the scenario card says "Easy island: milder events, no weather dice." The Pile shows 3/15 on day 1 (see `hint-day1-arrange-camp-375x553.png`).

## Tutorial (375x667 and 375x553, touch only: taps only the ring)

What works:
- The tutorial runs to the end card at both sizes: 50/58 steps shown at 667 and 51/58 at 553. The rest are skip steps whose action was already done.
- There is one short line and one tap per step, and the ring is always on the right thing.
- The g3 "Gather food" ring is now on the Birds (food) row, not Wood (`tut-g3-food-row-375x667.png`).
- Stale lines are gone. Pawn names (Carpenter, Cook, Friday) are not clipped.
- The weather lines are now true for the Normal island.

What fails:
1. **Food is 0 at the end of day 3, at both sizes.** The day-3 summary reads "Food -1 … ⚠ Food 0 of 2 for tonight: the hungry take 2 wounds each". The resource bar shows Food 0 (`tut-day3-food0-375x667.png`, `tut-day3-food0-375x553.png`).
   - The g3 step sends one pawn to gather. One pawn rolls the dice, so the food is not certain, and the day-2 rain cloud then takes 1 food.
   - **Why `guide-test.js` passes anyway:** it reads `G.res.food` at step wx1. At that moment the engine is already past day 4's production, so it reads food 1 while the screen shows 0. My probe logged exactly this: `res food 1` at wx1, with Food 0 on screen. The test checks the wrong moment.
   - Repro:
     1. Tap Play, then Learn in 5 minutes.
     2. Tap only the ring through step 54.
     3. At "Day 3 is over", read the Food tile.
2. **Step wx1 ("days 4-6: a rain die") was skipped in 1 of 2 runs.** At 375x667 it never showed (the log goes advc, wx2, wx3, end). At 375x553 it showed.
   - The skip is intermittent. It happens around the advc step (the tap on the card), and wx1 is probably passed over by `gPassed`.
   - Repro: run the tutorial by touch at 375x667 and compare `R94-proof/tutorial-log-375x667.txt` with the 553 log.
3. The three weather steps start with "Normal island", but the learner is told Easy island is their game. A first-timer can't tell which rules apply to them (see the rules section).
4. The end card ("You know the rules!") covers the resource bar labels, and "Skip tutorial" stays on screen after the tutorial is finished (`tut-endcard-covers-bar-375x667.png`).
5. 58 steps is long for "Learn in 5 minutes", but it does fit in about 2.5 minutes of tapping.

## First-timer play (by touch, both sizes)

- **Tutorial, then Keep playing:**
  - 375x553: reached day 8 alive. Food was 0-2 every day.
  - 375x667: the bot stopped on day 4 because it only tapped ✨. That was a limitation of my bot, not the game: the finger points at a tile, and a person would tap it. The bot was rerun with tile taps.
- **Full default game (Play, Play anyway: Easy island, 2 players, Friday + dog), tapping ✨ for every placement, then the tile it points at, then the row it recommends, and the first option on every choice.** Logs: `R94-proof/game-runs.txt`.

| Size | Result | Food over the game |
|---|---|---|
| 375x667 | **Lost on day 12**: life 2, pile not finished (wood stuck at 9-10) | 0 from day 4 to the end |
| 375x553 | **Lost on day 10** | 0-1 every day; "No fire yet, day 4" warning (`game-day4-labels-375x553.png`) |

- On day 1 with no shelter, ✨ suggests "Carpenter → Arrange the camp: lifts morale" (`hint-day1-arrange-camp-375x553.png`). That is a weak first move to teach.
- A newcomer who trusts the hint starves slowly and takes wounds every night.

## Row notes and repro for rows under 7

1. **Rules fidelity (6).**
   - The engine and texts match the original in Normal mode.
   - The default mode removes a whole rule (the weather dice), adds a 3-wood pile head start, and uses a curated deck and a fixed tile order. None of these is a published variant.
   - The notes don't match the code. Repro is in the rules section.
2. **Tutorial teaches (5).**
   - The order, the one tap per step and the true lines are good.
   - But it ends day 3 at Food 0 with a red hunger warning, which fails the required food > 0 at day 3. Its own test false-passes on this.
   - One weather step skips intermittently, and the weather steps talk about a mode the learner isn't playing. Repro is in the tutorial section.
6. **AI and pacing (5).**
   - Following ✨ on every placement, I lost 2 of 2 default games, with food at 0 almost every day.
   - ✨ suggests arranging the camp before the shelter on day 1.
   - The notes claim 59-70% wins for a ✨ player (`easy-sim.js`). My 2 touch games did not reproduce that.
   - Repro: Play, Play anyway, then for each pawn tap ✨, then the pointed tile, then the recommended row; repeat to the end.

Rows 3, 4, 5, 7 and 8 are at 7 or above:
- **First 10 seconds (8):** the start screen gives the goal and a clear "New here? Learn in 5 minutes".
- **Turn clarity (7):** "YOUR TURN: PLAN THE DAY", "Food · eat 2", dice icons on the job rows and a pile counter. The tile labels crowd near the camp ("8 Camp" over "Hills").
- **Phone play (7):** the board comes first and nothing is cut off at 553 tall, apart from the end card overlap.
- **Feel (7):** journal scenes, wound and food floaters, and dice rolls.
- **Bugs (7):** 0 page errors and 0 stuck states over 5 runs. The intermittent wx1 skip is the one bug. The only console error was an external host that my test harness blocks.

## Cold-play verdict (plain words)

- **Could a first-timer play it?** Yes. The tutorial holds your hand one tap at a time, the ring is always on the right thing, and nothing clutters the screen.
- **Was it fun?** Not yet. The tutorial tells you to gather food and then ends day 3 with no food and a red "the hungry take 2 wounds" warning.
- In the real default game, doing exactly what the ✨ hint says still leaves the camp starving and you lose. It looks lovely and reads clearly, but it feels unfair rather than tense.
- On top of that, the default island quietly drops the weather rules that the tutorial has just taught.

## Top fixes (in order)

1. **Tutorial day 2:** make the food gather sure (a second pawn, for example Friday, on the Birds row), or stage it so day 3 ends with Food ≥ 1. Fix `guide-test.js` to read the food shown on the day-3 summary (the `daysum` beat's state), not `G.res` after the next day's production.
2. **wx1 skip:** make sure the info steps on the `daysum` beat can't be passed over after the advc tap. Add a guide-test assertion that every non-skip step is shown.
3. **Easy island:** make it the published easier variant (dog, 4 items, the book/adventure split, weather dice kept), or default the first real game to Normal. Then update the Difficulty table in `rules-notes.md` so it matches the code. After that, drop "Normal island" from the weather steps.
4. **✨ Suggest:** put shelter and tonight's food ahead of arranging the camp on day 1. Re-measure `easy-sim.js` with touch play (✨, then the pointed tile, then the recommended row).
5. **Polish:** keep the end card clear of the resource bar, hide "Skip tutorial" once the tutorial is done, and space out the "Camp" and "Hills" tile labels.
