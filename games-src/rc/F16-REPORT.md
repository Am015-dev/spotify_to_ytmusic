# [FIXED16 shipwreck] report

The scheduled report to the orchestrator session was refused, so this file is the report. The code commit is b4c7c89b on `shelf/W468-shipwreck-lean` (draft PR #256), merged with `origin/alex/brave-carson-rbpmlk`. Nothing is deployed.

## Gates
- `--quick`: PASS (8/8) on the final code, and again after the merge.
- `--full`, twice on the final code, each run alone: PASS, PASS.
  - The lab test still warns 9/12, as before.
  - One earlier full run had an intermittent sweep problem: a help bubble covered a glowing place (scenario stranded, seed 101). The 2 final runs were clean.
- `guide-test.js` passes at 375x667, 375x553 and 390x844:
  - steps 57/61 (the other 4 are skip steps) and rules 28/28;
  - Food 1 on screen at the end of day 3.
- `logic-test.js`: 279/279, including the new M5d (Easier keeps the printed rules).
- `rules-test.js`: 28/28.
- `games/lab.html` was restored and not committed. No new animations; still at most 1 helper on screen.

## Survival on the default game: target missed
- The target was about 50%. The real figure is about 9% survival and 0% wins, on the rulebook's Easier variant with the full rules.
- `easy-sim`, 480 games: about 9% survival.
  - An 80-game run swings by about 5 points; my last 80-game run gave 0 of 80.
  - The computer's own planner, given every pawn, survives only about 10%.
- Touch play by tap at 375x667 (`taps-test`, per-pawn ✨, seeds 11, 23, 37, 41): 0 of 4 won.
  - The losses came on days 12, 8, 9 and 8.
  - The day-12 game lasted to the end, with the pile at 6.
- On the printed rules, ✨ can't reach 50%: from day 7 the weather brings 3 to 4 clouds a night.
- **Owner decision needed:**
  - (a) keep the rules identical and accept a hard first game, or
  - (b) add a labelled house setting (a "Gentle island") using the `EASYK` knobs in tutor.js, which are all off now.

## What changed
1. **Tutorial food.**
   - On day 2, both of the Cook's pawns gather food, so the gather is sure.
   - The lesson deal starts with 1 dry food, which never spoils, so day 3 ends at Food 1.
   - A new step teaches that fresh food spoils overnight.
   - Friday's Rest step moves to day 3.
   - `guide-test.js` now reads the Food shown on the day-3 summary, and checks that step wx1 sits on that summary.
2. **wx1 skip.**
   - `gDay()` no longer falls back to the engine's round between scenes, and `gPassed` waits.
   - Root cause: a tap on "Start day 4" in the 250 ms before a step's bubble appeared moved the story past the steps.
   - Those taps are now held while that step's scene is on screen.
   - `guide-test.js` asserts that every non-skip step shows.
3. **Rules identical.**
   - The default game is now "Easier" (it was "Easy island"), and it is the rulebook variant only:
     - the dog, 4 starting items, and 2 fewer book events;
     - the printed weather dice, decks, tiles and resources.
   - The setup screen reads Easier / Normal / Harder.
   - The Difficulty table in `rules-notes.md` matches the code.
   - The weather steps no longer say "Normal island".
   - "Keep playing" after the lesson turns the printed weather dice back on.
4. **✨ hint (`advisor.js`).**
   - On Easier, ✨ fills only urgent jobs (food, shelter, the roof before the rain, someone near death), then lets the planner place the rest.
   - Day 1's first hint is now "Cook + Friday → Wade Out for the Crates (food)", never "Arrange the camp".
   - Signal-pile wood waits until day 5.
   - ✨ suggests hunting only with weapon 4 or more.
5. **Polish.**
   - The end card sits under the resource bar.
   - "Skip tutorial" goes away when the tutorial ends.
   - The Camp and Hills labels are kept 14 px apart.
   - The day summary's food line is now about tomorrow, counting the morning's food.
   - Fixes from the cold play:
     - the no-fire banner names the terrain to explore for (mountains);
     - the life box is labelled "Weakest", because it shows the weakest castaway's life.

## Cold-play verdict (independent agent, 375x667, touch only; as-is)
> **Could you play it?** Yes, both. The tutorial (61 steps) ran from start to end by touch with no blockers. It is long, but each step is one clear tap. The real game reached a result screen: lost on day 7 of 12.
> **Was it fun?** 2.5 out of 5. Days 1-3 were about a 3 (nice art, exploring tiles is satisfying). Days 4-7 were about a 2, because I kept bleeding life and food every night and could not see how to stop it.
> **Would you play again?** Maybe once, on Easier. The loss felt unfair rather than "my mistake". Life went from 3 to 0 in one night, and the result screen told me why only afterwards.
> **What confused me:**
> - The red banner said "No fire yet, build the fire first" for 4 days, but Fire was not in the camp menu. I guess it needs mountains, and this map had none. Nothing told me how to unlock it.
> - The ✨ hint said "Build Snare" or "Arrange the camp" while the banner said "build fire". The two disagreed.
> - The warning said "Only 2 of 3 food" while the top bar said "eat 2".
> - The "Life" box shows one character's life, not the group's. The Cook died while the box showed 4.
> - An adventure card came up on an explore marked "✔ sure".
> - Some explores said "needs +1" without saying what that means.
> - Placing the Dog sometimes picked the Hammer instead.
> - The Rest bubble covered the zoom buttons.
>
> **Exciting moment:** flipping a new tile and drawing an adventure card. **Goal:** build the fire and stack 15 wood on the signal pile by day 12, while keeping everyone fed, sheltered and alive.
> **Result:** lost on day 7. The Cook and Carpenter died of wounds from hunger, hungry animals, low morale, and soaked and cold. Food never built up above 1.
> **Counts:** about 7 lost moments, about 4 dead taps.

- Fixed once after the cold play: the fire banner and the "Weakest" label.
- Still open:
  - the ✨ hint and the banner still disagree when no mountains have been found;
  - the Dog sometimes picks the Hammer;
  - the Rest bubble covers the zoom buttons;
  - "needs +1" is not explained.

## Proof
- `games-src/rc/proof/first-3-min-375x667.webm`: a cold start, "Learn in 5 minutes" by touch, reaching the end card at 150 s.
