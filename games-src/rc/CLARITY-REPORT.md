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

## Tests (final run, on the final build)

| Test | Result |
|---|---|
| `rules-test.js` | 26 pass, 0 fail (2 new: card and threat wounds name their cause; both failed before the fix) |
| `click.js` / `click-phone.js` (jsdom, real buttons, every mode) | 0 errors (desktop 398 s, phone 427 s) |
| `lay-phone.js` at 390x844, 390x763, 390x664, 375x553, 412x780, 844x390, 750x342 | 0 problems at every size |
| `lay.js` at 1366x768, 1920x1080, 768x1024, 1100x700 | all pass. The extra 390x844 entry times out clicking the Camp button, which the phone layout hides. It fails the same way on the old build, so the problem is in the test. |
| `net/p2p-rc.js` (real WebRTC, host + client) | states agree, 0 errors (398 s) |

Also fixed: the internal ref of the Settlers scenario contained the original scenario's name, and the live file still ships it. The ref is now `scen-6-settlers`, and the preview contains none of the original names.

## Story campaign (added after the owner's verdict: "very low score, no story mode to learn the game")

The title screen's first button is now **📖 Story: learn the island chapter by chapter**. It opens the shared chapter map (`shell/gx-campaign.js`) with this game's `campaign.json`: 10 chapters in 3 acts. Bosses end each act.

**Act 1 teaches one idea per chapter.** Every Act 1 chapter is Marooned on Easier, with tips on.
- c1: survive 3 days.
- c2: build the Shelter by day 5.
- c3: explore 4 places by day 6.
- c4 (boss): the full Marooned game.

**How it is wired:**
- Chapter twists (`early-threat`, `low-morale`, `ada-adrift`) and checkpoint goals are in `scen.js` (`campSetup`, `campCheck`). They only apply when a chapter sets `G.cmp`; the normal game's rules are unchanged.
- The chapter goal shows in three places:
  - the bar under the island (for example "shelter ✗ · by day 5");
  - a goal card at the top of planning page 1, with how to reach it and the chapter's stars;
  - a "Do it" priority.
- A chapter skips the scenario's own intro, so only the chapter's intro is shown.
- It ends with "Chapter goal reached!" or "Chapter lost", then the campaign result screen.

**Headless AI ("Plan for me" alone) wins:**

| Chapter | Wins |
|---|---|
| c1 | 10/10 |
| c2 | 10/10 |
| c3 | 10/10 |
| c5 | 8/10 |

c3 is often won on day 1–2 and is probably too easy.

**Blind test of chapters 1–3** (log: `playtest/story-c1c3.md`):
- Result: won all three. **Fun 3/5.** The three rounds before the campaign averaged 2–2.5.
- The tester wanted to play on after chapters 1 and 3.

Fixed after the test:
- the old scenario intro repeating;
- the "Rescued!" ending on checkpoint chapters;
- the night card saying "under the shelter" with none built;
- tips repeating every chapter after "No more tips";
- the map refusing a second pawn on a planned job;
- stars that weren't shown during play.

**Still weak:**
- "Plan for me" can win Act 1 almost by itself, so the player isn't forced to decide.
- Text mismatches remain in flavour ("Day four" on day 1).
- No retest after these fixes.

**Tests:**
- `campaign-test.js`: 32 pass. Every chapter starts with its setup and twist, an AI win marks c1 beaten, and c2 loses after its deadline or wins with the shelter.
- rules: 26 pass.
- click and click-phone: 0 errors.
- phone layout, 7 sizes: 0 problems.
