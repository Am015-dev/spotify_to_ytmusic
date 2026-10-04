# Shipwreck Isle: clarity report (Oct 2026)

**Preview:** `games/shipwreck-isle-next/index.html`, built from `games-src/rc`. The live game is unchanged.

## How it was tested

Three rounds of blind phone playtests at 390x763, run with `games-src/scripts/drive-serve.js`. Each round had two new testers with no access to the repo:
- a **casual** player, who skims and takes any guided option;
- an **impatient** player, who skips every tip and the guided game.

The per-screen logs are in `playtest/`. The screenshots stayed in the session scratchpad and are not in the repo.

| Round | Build | Casual fun | Impatient fun | Average |
|---|---|---|---|---|
| 1 (before) | the live build | 2 | 2 | **2.0** |
| 2 | fixes A–G | 2.5 | 2.5 | **2.5** |
| 3 | fixes A–J | 2.5 | 2 | **2.25** |

**Acceptance is NOT met.** The target was an average of 3.5. After round 3, both testers could:
- explain the goal and the day;
- name a cause for most of their life and food changes.

They still lost life every day to systems they couldn't see how to prevent, mainly **morale** and **ignored threats**, and to a "Plan for me" that never builds a shelter. The brief allows 3 rounds, so this build ships as the best version, with the notes below. Fixes K–L came after round 3 and were not retested blind.

## What testers hit before (round 1)

1. **Choices below the fold on phones (the worst problem).** The island took 370 of 763 px, which left about 300 px for the dock. In it:
   - adventure choices, "Keep this roll?" and the Explore "+" sat below the screen;
   - the casual tester soft-locked on day 2 and had to reload.
2. **No cause for losses.** Life and food dropped at night or in the morning, and only the Log said why. "Skip to my next choice" skipped right past the scenes that hurt.
3. **Misleading text.**
   - "Another piece of our new life stands complete" showed over failed dice.
   - "Food for tonight ✓" appeared, then rain ruined the food.
4. **No guided game.** A four-step tutorial existed in the code (`tutHtml`) but was never shown.
5. **The goal was not visible while playing**, and nothing showed how to add wood to the signal pile.
6. **Blocked jobs gave no reason.** A tap on a disabled "+" did nothing.

## What changed

- **A. Phone: decisions fit on screen.**
  - While planning, choosing or in a pop-up, the island shrinks to about 56% of the width (`data-dec`, `--bhs`). It returns to full size while you watch the story.
  - Story choices come first, right under the title, in a highlighted box. The card text follows below.
  - In the tile pop-up, the job "+" comes before the pawn picker.
  - The "why" under a recommended job is no longer hidden behind the sticky button bar. The button stays sticky only in landscape.
- **B. Cause for every wound and loss from a card.** Card wounds now name the card, and ignored threats name the threat: "Cook takes 1 wound (ignored threat “Take It Slow”)". Resource losses carry their source. Two new rules tests failed before this fix and pass after it.
- **C. The day summary says why.**
  - "Carpenter: 13 → 12 life (sleeping in the open)".
  - "Food: 3 → 0 (eaten 2, 1 spoiled overnight)".
- **D. "Skip ahead" stops at anything that hurts you**, at your next choice and at the day summary. Before, it jumped to your next decision.
- **E. Truthful text.**
  - After a failed roll the scene says "The dice went against us. It is not done yet."
  - The food check counts the rain likely to get past the roof ("Food for tonight 3 of 2 +1").
  - The food priority says "More food: the rain will ruin some" when food is planned but short.
- **F. Guided first game.** The title screen's first button is "New here? Play a guided first game": Marooned on Easier with Carpenter, Cook, Friday and the dog. One short tip appears per new screen, one idea each:
  - the four planning pages;
  - event, jobs, dice, a choice;
  - morale, production, weather, night, the day summary.

  Each tip has "Got it" and "No more tips". Auto-play pauses while a tip or the day summary is on screen.
- **G. Blocked jobs explain themselves.** Their "+" is greyed but tappable, and a tap shows the reason as a toast.
- **H. Goal always visible.**
  - The bar under the island reads "🎯 fire ✗ · pile 0/15" (or crosses, raft and Ada, or home and tools). Tapping it opens camp status.
  - Planning page 1 opens with a goal card: progress, how to work on it, and an **"Add N wood to the pile"** button.
- **I. Clearer counters.** The planning steps read "Planning 1 of 4" and the day's phases "Day part 5 of 7". Testers had read "4 of 4" followed by "5 of 7" as a bug. The "pay with fur" toggle only appears when you have the fur.
- **J. Less text.** The repeated "Before you give out jobs…" line and the old goal card at the bottom of page 1 are gone.
- **K. (after round 3)** Opening a job category scrolls its list into view.
- **L. (after round 3)** Negative morale shows in the top bar as "☹-2", in place of the roof, because round-3 wounds mostly came from morale.

## What's still weak (honest notes)

- **Morale and threats feel like random punishment.**
  - Morale wounds come from the rules, and "Plan for me" doesn't plan around them.
  - "Plan for me" also skips threats and rarely builds a shelter. The computer planner is weak: 0–10% wins, per `rules-notes.md`.
  - Improving the planner is the biggest remaining lever for fun. It is outside this clarity pass.
- **Helpers can be planned alone on jobs they can't do alone.** The dog is the example: the plan is only blocked at the last step.
- **Text density.** Testers still found these too wordy:
  - the "This morning" list on planning page 1;
  - event cards with threat text ("acting character… needs Knife/Rope");
  - adventure cards with their "later, as an event…" halves.
- **Jargon with no glossary:** determination, dry food, "?" markers.
- **Pace.** 3–4 event and threat scenes come before every planning page.
- **The top-bar ♥ is the lowest life of any castaway.** The guided tip says so, but impatient players never read it.
- **Not retested:** fixes K–L and the final layout tweaks were not seen by a blind tester.

## Tests (final run)

See the table in the session summary and the commit message.
- **Rules:** 26 pass (24 old + 2 new).
- **Click** (jsdom, every mode): 0 errors.
- **Desktop layout:** 1366x768, 1920x1080, 768x1024, 1100x700, plus 390x844.
- **Phone layout:** 7 sizes.
- **p2p:** `net/p2p-rc.js`.
