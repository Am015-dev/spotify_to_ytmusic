# R98 strict gameplay review: doorkick-dungeon (Doorkick Dungeon)

- Build reviewed: `origin/shelf/W502-doorkick-gameplay` at **6062cca3d99a62cfdf982d25b8433b8607c188b4** (F17: Resurrection dock, Bad Stuff line, bulb relayout). Source `games-src/munch`, slug `doorkick-dungeon`. Reviewed 20 Nov 2026, UTC.
- **Verdict: FAIL. Average 6.6.** Rows 4, 5, 6 and 8 are under 7. The cold player did not call it both playable and fun. No hard stopper was confirmed (one stuck state seen once, not reproduced).

## Gates (alone, in the foreground)

| Gate | Run 1 | Run 2 |
|---|---|---|
| `build-all --quick doorkick-dungeon` | PASS | PASS |
| `build-all --full doorkick-dungeon` | PASS (lab WARN 9/12, sweep clean, 4 games reached a winner) | **FAIL**: `sweep.js: help bubble covers a glowing target in phase fight {"left":179,"top":689,...}` |

The full gate is flaky: 1 of 2 runs fails. `games/lab.html` was restored and is not committed.

Extra checks on the same build:
- `logic-test.js`: 207/207 rules pass. `rules-test.js`: 48/48 pass.
- `tutor-test.js 375x667,375x553`: 0 problems, 31 steps.
- `fightfit-test.js`: PASS, 432/432 fight shapes, text >= 11 px.
- **`bulbloop-test.js`: FAIL, twice.** In charity hand picks the bulb bubble is built **40 times in 15 s** at 375x667 and 38 times at 360x640 (the limit is 2). Bad Stuff picks and 375x553 are fine. **The F11/F13 "bulb relayout loop" fix does not hold for charity.**

## Rules against the original (engine and every player-facing text)

Sources checked: `rules-notes.md`, `RULES-CHECKLIST.md`, `cards.js`, `rules-html.js`, `tutor.js`, `coach.js`, `hlp.js`, `ui.js`, `campaign.js`, all compared with the published rulebook and card list from memory. (The publisher's sites are blocked here, as the notes also say.)

**Engine: no rule mismatch found.**
- Turn order, kicking the door, looking for trouble or looting the room, and charity are correct.
- Combat is correct: ties go to the monster, a Warrior wins ties, there is one helper, and an Elf helper gains a level.
- Running away (5+, rolled per monster), death and looting, item slots, Big items and selling are correct, including no selling to level 10.
- Winning at level 10 only by a kill is correct, and so is the divine-intervention exception.
- All seven race and class powers, the two-race and two-class cards, and the shared win in the faster-play variant (`engine.js:86`) are correct.
- I spot-checked the monster levels, treasures, "vs" bonuses and Bad Stuff: all 37 monsters match the original numbers.

**Mismatches and gaps (none is a stopper):**
1. `games-src/munch/rules-html.js:13` and `ui.js:232-236`: the default new game is the faster-play variant: you listen at the door every turn, a helper shares the win, and the computer heroes are set to Easy. It is the rulebook's own optional rule and it is labelled, but the game you get by default is not the base game. Make "Full" the default, or say "Quick (faster-play variant)" on the Start button.
2. `games-src/munch/tutor.js:119` (run step): it says "4+ escapes (elf +1)" and never states the base rule of 5 or 6. A newcomer learns 4+ as the rule. Write "5 or 6 escapes; your Elf +1 makes it 4+".
3. `games-src/munch/tutor.js:139` (listen step): the tutorial says it plays the full rules, yet it teaches listening at the door, which is faster-play only. The text does say "Quick games", so this is acceptable, but the flow mixes the two modes.
4. `games-src/munch/tutor.js:123` (death step): "You keep your level but lose your cards." You also keep your race, class and curses, as `rules-html.js` says. The tutorial line is incomplete.
5. `games-src/munch/campaign.js:2,18-23`: the comment says "the rules never change", but Story twists change setup: a boss starts at a higher level, gets extra treasure, goes first, or you start with fewer treasures. This is acceptable as a labelled story mode, but the comment is wrong.
6. `games-src/munch/COMPONENTS.md` **does not exist**. The NEWGAME brief requires it (owner, 20 Nov). The counts (94 door, 74 treasure, 168 in all) are asserted in rules-notes and logic-test row 3, but there is no component file.
7. **Policy flag for the orchestrator** (outside the rules row): `cards.js:18-58` reproduces the original card pool one for one, with the same monster levels, treasures, bonuses and Bad Stuff, under new names and reworded texts. The owner's brief of 20 Nov says large authored card pools should be our own design to the same structure, "without copying the original card-for-card". This game copies card for card. That is a content-policy risk, not a rules error, so it does not lower row 1.

## Clutter and loops

All samples were taken once a second, at 375x667 and 375x553.
- **Infinite animations: 0.** That holds for every sample in 5 full games and both tutorial runs, including the 15 s after each of about 60 bulb taps. `calm-audit.js` also gives loops=0 and maxHelpers=0.
- **Helpers: at most 1 distinct helper.** My raw count saw "2" in about 14 % of samples, but it was always the ★ mark and the `.pulse` on the **same** button (I checked by element), or the bulb bubble together with the ★ target it points at.
- **But the bulb bubble is rebuilt 40 times in 15 s during charity** (bulbloop-test, above). That is a loop in all but name. Each build re-places the bubble.
- The full sweep, run 2, shows a help bubble **covering** the glowing target in a fight.

## First-timer play by touch (my own runs)

| Run | Size | Speed | Result | Notes |
|---|---|---|---|---|
| Tutorial | 375x667 and 375x553 | real | 31/31 steps, 72 s each | One line plus one tap per step. At 553 the meddle bubble covers the fight readout. |
| g1 | 375x667 | normal | Lost at level 9 (P3 won), 40 turns, 5.9 min | **29 taps on a ★ card at x=387 (off a 375 px screen) in tidy-up.** |
| g2 | 375x667 | fast | Lost at level 1, 23 turns | |
| g3 | 375x553 | fast | **Won as the helper** (shared win), level 5, 33 turns | The end screen is clear and fun. |
| g4 | 375x667 | fast | Lost at level 7 | |
| g0 | 375x667 | fast | Won at level 10 | Pictures were missing on my server for this run; I did not use it for layout. |

The newcomer bot follows every ★ (`newbie-touch.js`, NBFOL=1, Easy, 375x667, 12 games):
- **3 solo wins** (25 %).
- One game **stuck for more than 24 s** in another player's fight window (`stuck 501|combat|null|others`). The ★ was tapped over and over with no effect. A rerun of the same seeds did not reproduce it.
- Overall, a newcomer who follows the hints wins **about 1 in 4 against three Easy heroes**. That is just the 4-player average, not "about half".

What works:
- The top bar always says "Lv 3/10 · Your move" or "Grub's turn".
- The rival kick shows a big "A MONSTER! Level 1 · Morwen must fight" with the card.
- The run button shows the odds ("Run 50%").
- The fight readout ("YOU 7 vs 1 MONSTERS, +6: you win") is readable at both sizes.
- The end screen gives stats and a best moment.

What hurts:
- **Clipped dock buttons at 375x667** when there are three: "oot the room (free card", "Fight Hellmouse (Lv". The Charm button is also cut (cold-play shots g09/g10).
- **Hand and gear strips run off the right edge**: "Antlered H…" and "Tough-Guy H…". The ★ suggested card can sit off-screen (g1, 29 taps).
- During rival turns at 375x553 the "Not worn: wrong race or class" note sits on top of the "Morwen kicks the door…" toast, and the door animation covers the readout.
- In a fight at 375x553, the monster rows are 42 px tall (under 44).
- At 375x667 the bulb bubble covers the found card and its "Into your hand" line, and it says what happened, not what to do.

## Cold play (independent subagent, no history, touch only, 375x667)

Quoted as written:

> Honest report: I did NOT finish a full game. I got through the tutorial's first stretch (about 11 of 31 steps) plus roughly 5 turns of a real Quick game (reached level 5 of 10 against two computer players, in the middle of a fight) before my first game session was killed when I restarted the browser to re-record the video. I did not replay it.
>
> 1. Mostly yes. The title bar says whose move it is, and the bottom line plus the glowing buttons tell you what to tap. The tutorial speech bubbles were clear.
> 2. Moderately fun. Kicking doors, selling for a level and cursing rivals are easy to grasp.
> 3. I'd probably play again, but not for a full 10-level game on a phone, because the computer players' turns are long.
> 4. Confusing moments:
>  - Taking the computer's turns costs 5-15 seconds of watching a dark "Grub's turn..." screen with little information.
>  - "Curse Tansy with the star card" glows all three players, including me, so it is unclear who is a good target.
>  - The "Play Loophole" star hint stuck around after other actions.
>  - Selling needs "1000 gold" with no running total until you pick cards.
> 5. Problems:
>  - The bottom buttons clip their text ("oot the room (free card", "Fight Hellmouse (Lv..."), and the Charm button is also cut off.
>  - The green hint labels are cut off at the screen edge ("Go up a level!", "Become Wizard").
>  - Cards at the bottom overlap and are partly hidden behind the "Pointy Holy Mace" row.
>  - Tapping a card in a fight sometimes did nothing and I had to tap again.
> 6. No end screen reached. At level 5 I was in a "Too strong" fight (6 vs 6), with Grub at level 6 and Tansy at level 6, so I was behind. About 5 of my own turns so far.

Note: for its first ~10 minutes, my local server was missing the art. The subagent was told to ignore broken portraits and re-recorded the video with art loaded.

**Cold-play verdict: playable ("mostly yes"), but only "moderately fun"; it would not play a full game on a phone again. That is not a "playable and fun" verdict.**

Video of the first 3 minutes (fresh load into the tutorial, art loaded): `games-src/reviews/R98-first-3-min-375x667.webm`.

## Fixer checks F9-F17

| Fix | Holds? |
|---|---|
| Readable fight (11 px floor, full-width table) | Yes (fightfit 432/432) |
| Fight fit | Yes |
| **Bulb relayout loop** | **No: charity 40 builds in 15 s at 375x667 and 38 at 360x640** |
| 11 px hand names | Mostly. Names show an ellipsis, and only 1-frame dips appear while cards fly in. "✗ not worn" measures 10.9 px. |
| Resurrection dock fit | Not hit in my games; covered by fightfit, which passes |
| Bad Stuff hint | Yes (bulbloop Bad Stuff picks OK, 2 builds) |
| Halfling reroll rule | Yes (logic-test rows 76-78, 124; rules text matches) |

## Scores (GAMEPLAY-RUBRIC.md)

| # | Row | Score | Why |
|---|---|---|---|
| 1 | Rules fidelity | **8** | Engine is faithful, 207/207. Small text gaps: the 5+ base, the death line, faster-play as the default, and no COMPONENTS.md. |
| 2 | Tutorial teaches | **7** | 31 short one-tap steps that cover kick, fight, run, help, curse, charity, loot and sell, then a real game. It never states 5+, and Warrior ties and other class powers are untaught. |
| 3 | First 10 seconds | **7** | Tagline, goal, and a "New here?" offer. Story is the big first button, ahead of learning. |
| 4 | Turn clarity | **6** | Whose turn is always clear and the odds are shown. Dock labels are clipped, the ★ can point off-screen, a bubble covers the target (sweep), and the curse target glows on every player including you. |
| 5 | Phone play | **6** | Clipped dock buttons at 375x667, strips cut at the right edge, overlapping toasts at 553, 42 px monster rows. |
| 6 | AI and pacing | **6** | Brisk (rival max 4-5.6 s per turn, games 35-45 turns), but the hint follower wins about 25 %, not about half, and the cold player found rival turns long. |
| 7 | Feel | **8** | Kick and reveal animations, painted cards, "A MONSTER!", a confetti end screen with stats. |
| 8 | Bugs | **5** | 0 page errors. But the bulb rebuild loop, a flaky full gate (bubble over target), one stuck hint-follower state (not reproduced) and dead taps on an off-screen ★. |

**Average 6.6** ((8+7+7+6+6+6+8+5)/8 = 53/8 = 6.6). **FAIL** (rows 4, 5, 6 and 8 under 7; cold verdict not "fun").

## Repro steps for rows under 7

- **R8 bulb loop:** `cd games-src/munch && node bulbloop-test.js 375x667`. You get `FAIL charity s3 ... 40 bulb bubble build(s) in 15 s`. By hand: get 7+ cards at the end of a turn so charity starts, then tap the bulb. The bubble keeps rebuilding.
- **R8/R4 bubble over target:** `VIS_SLUGS="," python3 games-src/scripts/build-all.py --full --out /tmp/x doorkick-dungeon`, run twice. One run fails with `help bubble covers a glowing target in phase fight`.
- **R4/R5 clipped dock:** play a Quick game at 375x667. On a turn with "Loot the room (free card)", "Fight <monster from hand> (Lv n)" and "Sell" all offered, the first two labels are cut on both ends.
- **R4 ★ off-screen:** at 375x667, in tidy-up (`post`) with gear to put on, the ★ card centre is at x≈387 (g1, 29 taps). The hint points at a card you cannot see without scrolling the strip.
- **R5 overlap at 553:** at 375x553, during a rival's kick, the "Not worn: wrong race or class" note overlaps the "Morwen kicks the door…" toast.
- **R6 win rate:** `NBFOL=1 node newbie-touch.js 8 375x667 5 1` gives 2/8 wins, and a rerun gives 1/4.

## Prioritized fix list

1. **Charity bulb loop** (Sonnet): the bulb bubble in the charity phase must build at most 2 times in 15 s at 375x667 and 360x640. Gate: `bulbloop-test.js` (all sizes) PASS, twice.
2. **Bubble never over a glowing target in fights** (Sonnet): make the full sweep pass 2 of 2 runs. Gate: `build-all --full` twice.
3. **Dock labels never clipped** (Sonnet): with 3 dock buttons at 375x667 and 375x553, shorten the labels ("Loot room", "Fight Hellmouse") or wrap to 2 lines at 13 px or more. No text cut. Also fix the Charm button.
4. **★ target always on screen** (Sonnet): when the ★ or the suggested card is in a scrolled strip, scroll it into view before marking. Also fix the green "Go up a level!" and "Become Wizard" labels cut at the edge.
5. **Newcomer win rate about 50 % on Easy** (Opus, design): the hint follower wins 25 % against three Easy heroes. Make Easy AIs less ruthless with curses and meddling against the human, or stop offering 3 rivals by default for a first game (2 rivals). Gate: `newbie-touch.js` NBFOL=1, 12 games, 5-7 wins.
6. **Rival turn feel** (Sonnet): keep each rival step readable and short. One toast at a time (no "Not worn" note on top of the kick toast), and drop rival turns from 5-15 s to under 5 s at normal speed.
7. **Curse targeting** (Sonnet): when the ★ suggests cursing a rival, glow only valid sensible targets, never yourself as the suggested one.
8. **Text fixes** (Haiku):
   - `tutor.js:119` should say "5 or 6 escapes; your Elf +1 makes it 4+".
   - `tutor.js:123` should say "You keep level, race, class and curses; you lose your cards."
   - Correct the comment at `campaign.js:2`.
9. **COMPONENTS.md** (Haiku): list every component type and count against the original structure, per the NEWGAME brief.
10. **Owner decision (orchestrator):** the default mode (faster-play vs full), and whether the card pool may stay a one-for-one copy under the 20 Nov content rule.
