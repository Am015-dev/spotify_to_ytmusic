# R97 strict gameplay review: crown-city-smash

- Reviewed commit: `91918e1c71db9c0c8b0f3bf9a1b550b968aed188` (origin/shelf/W580-crown-strict, F1 fixer on R83's list). Date: 2026-11-20 (UTC). The reviewer did not edit game code.
- **Verdict: FAIL**, average **7.4**. One row is under 7: row 6 (AI and pacing) scores 6. On Easy, a newcomer who does not use hints lost 5 of 5 touch games, and the cold player also lost. No stopper.
- Clutter bar: **PASS** (0 infinite loops, max 1 helper). Cold play: playable, "Mostly" fun, "Probably yes" to playing again (quoted below).

## Gates (alone, in the foreground)
| Gate | Run 1 | Run 2 |
|---|---|---|
| `VIS_SLUGS="," build-all.py --quick --out /tmp/x crown-city-smash` | PASS | PASS |
| `... --full` | PASS | PASS (`games/lab.html` restored, not committed) |
| calm-audit.js (20 s, play + bulb, guided) | loops=0, maxHelpers=1 | |
| tut-walk.js 375x667 / 375x553 | **FAIL** / **FAIL** | 26/26 steps, 22/22 rules, a winner, a real game afterwards. It fails only because the last line has 16 words (the limit is 12). F1 lengthened it (`kot/tutor.js:154`). |
| newb-sim.js 200 games (Easy) | 56% win at yield ≤5, 60% at yield ≤6 | **The same sim on the pre-F1 code (12c209a0) gives 61.5%**, so it does not predict touch play (see row 6) |

## R83 items: closed?
| R83 item | Status |
|---|---|
| 1. Four infinite loops (nudge, hotPulse, obGlow, bmPulse) | **Closed.** They are now 3–4 iterations (`board.css:10,142`, `extra.css:14`, `skin.css:40`, `onboard.css:17,20`, `playable.css:110`). The finger and `.go` loops are also finite. In kot/*.css|js, `grep infinite` finds nothing. calm-audit gives loops=0, and so did the per-second sampler over 8 touch games. |
| 2. Newcomer survival on Easy | **Not closed.** The Easy AI now hits a human Downtown holder less often (`ai.js:53`, EZHIT .4), and the yield advice now triggers at ≤6 ♥ (`engine.js:388`, `story.js:88,97`). By touch, the newcomer without hints still lost 5/5 (2 of them by KO). The gate F1 used, newb-sim, scores pre-F1 code the same (61.5%), so it cannot prove the fix. |
| 3. Banner vs step pill / ticker behind result | **Mostly closed.** At 375x667 the pill and the banner no longer overlap (0 samples). The result card hides `#moment` (`phone.css:227`, `story.js:48`). **New:** at 375x553 the banner, now 84 px lower, covers the top row of the dice tray for about 2 s after a knockout ("💥 GLACYX IS DOWN! 3 monsters left…" over `#dice`, seen in g2, g5, g6, g7). |
| 4. Dice ≥ 44 px | **Closed.** 0 tap targets under 44 px in any sample, at either size. |
| 5. Texts (tut-story:31/37, tagline, engine comment, checklist Kiosk) | **Closed** (`tut-story.js:28,37`, `tutor.js:154`, `hlp.js:43`, `engine.js:505`, `RULES-CHECKLIST.md:106`). The tutor.js:154 fix broke tut-walk's 12-word rule (above). The title lede `ui.js:114` still reads "First to 20 ★ wins." (acceptable shorthand). |

## Rules vs the original (rules-notes.md, RULES-CHECKLIST.md, COMPONENTS)
- Engine: since R83, the only change is the yield *recommendation* for an Easy human (`engine.js:388`: Recommended at ≤6 ♥). The rule itself is unchanged. data.js is unchanged, so R83's check of all 66 cards still holds. The AI change (`ai.js:53`) is a behaviour change, not a rule change. logic-test and rules-test pass within --full.
- Player-facing texts checked: the help (`hlp.js`), the tutorial (`tutor.js`, `tut-story.js`), coach and advice (`story.js`), the Rules screen (`ui.js:140-156`), result lines (`playable.js:257`), and the engine logs and win texts (`engine.js:509-516`). The win rule (20 ★, checked at the end of your turn; last standing; all out = nobody) is stated the same way everywhere except the short title lede. The tie line (`tut-story.js:66`: "the active one wins") matches the engine (`engine.js:515`) and is a house interpretation already listed as one.
- **Rules verdict: engine and components identical; no wrong player-facing claim.** Remaining text issue: the tutorial's last line is too long (`tutor.js:154`, 16 words).

## First-timer play (touch only, fresh storage, default Easy ×3)
Tutorial: 26/26 steps at 375x667 and 375x553, one line and one tap per step, the spotlit target never covered, ending in a real game.

| Game | Size | Player | Result | Rival turn avg | Wait between my turns |
|---|---|---|---|---|---|
| g1 | 375x667 | newcomer (pairs, claws, energy; yield ≤6) | lost, **KO** at 7★, Squidrik 21★ | 5.3 s* | 14.7 s* |
| g2 | 375x553 | newcomer | lost, 10★, Magmaw 20★ | 5.1 s* | 11.3 s* |
| g3 | 375x667 | newcomer | lost, 11★, Magmaw 21★ | 5.3 s* | 15.8 s* |
| g7 | 375x553 | newcomer (run alone) | lost, 12★, Magmaw 20★ | **3.5 s** | **9.9 s** |
| g8 | 375x667 | newcomer (run alone, video) | lost, **KO** at 8★ after 21 taps; Boltbox 21★ | **3.1 s** | n/a |
| g4 | 375x667 | hint follower (bulb keep mask, suggested card, Recommended yield) | lost, KO, Magmaw 22★ | 5.0 s* | 14.0 s* |
| g5 | 375x553 | hint follower | **won** (last standing, 9★) | 4.9 s* | 10.9 s* |
| g6 | 375x553 | hint follower | **won** (last standing, 15★) | 5.1 s* | 10.0 s* |

\* 3 games ran in parallel with the cold-play agent, so those timings are inflated. The games run alone are g7 and g8.

- Without hints: **0/5** (R83: 0/4), so 0/9 over the two reviews. Following every hint: 2/3. Hints are **off by default**, so the default first-timer is the 0/5 player. The cold player also lost (2nd, KO'd at 17★ one turn from the goal).
- Whose turn and what to do: clear (step pill "Roll 1/3 · Keep dice, then Roll", the active chip, the footer "Goal 20★ · You N★ · leader"). The previews are good: the face labels on the dice (STAR/HEAL/HIT/ENERGY), and Stay/Yield shows what each option gives.
- Rival turn: one line ("Magmaw: 1★, 2⚡, hits Voltusk −1") with "Tap to skip". The wait between your turns is about 10 s with 3 rivals, and the cold player felt 10–14 s and said the result line "fades quickly".

## Cold play (independent subagent, no history, 375x667, tutorial + one full game). Quoted as-is
> Could I play it? Yes. The tutorial ("Learn in 5 minutes", 26 short steps, one tap each) taught me everything: keeping dice, rolling three times, triple stars, energy, buying cards, Downtown, and stay or yield. It ended with a win. Then I played one real 4-monster game and lost. I had 17 of 20 stars. I was left at 1 heart, Squidrik hit me and knocked me out, and Squidrik won as the last monster standing. I finished 2nd of 4.
>
> Was it fun? Mostly. Rolling a quad of 3s for +4 stars feels great, and the computer turns are short. The loss felt a bit cheap: I was one turn from winning, and I couldn't do anything about the 1-heart risk (I stayed in Downtown at low hearts, which was my choice).
>
> Would I play again? Probably yes, once or twice.
>
> Confusing or rough:
> - After a roll, the dice change places. A die I had kept moved, so I tapped the wrong one once and had to check each time.
> - Card text such as Mending Beam and Toxic Spittle is wordy, and I couldn't tell whether it was worth the energy.
> - "Not enough ⚡: End turn" in the top banner is easy to miss.
> - Computer turns take 10 to 14 seconds. The screen just shows "Rolling the dice…" and the rival's result line fades quickly.
>
> Nothing froze and every tap I made registered. The only tap that did nothing was the final "Play a real game" tap on the tutorial-done screen, which I tapped twice. Nothing was covered or too small to read. The small top-bar stats (hearts, stars and energy per monster) are tiny but readable.

Cold verdict: **playable, and fun with reservations** ("Mostly", "Probably yes, once or twice"). The scripted single tap on "Play a real game" works in tut-walk, so the dead first tap is probably a tap during the end card's entry. It was not reproduced.

Video: `games-src/reviews/R97-first-3-min-375x667.webm` (first 3 minutes, fresh load → Play, newcomer policy, 10 fps). At 0:29–0:31 the rival's dice fly across the open Stay/Yield card and cover "Yield and run! / Leave the city to heal" for about 1 s.

## Clutter (sampled every second through 8 games, plus calm-audit)
- Infinite animations: **0** in every sample (2,000+ samples) and in calm-audit, including the 20 s after the bulb. PASS.
- Helpers: max **0** in normal play (hints off), and max **1** on the guided path (calm-audit). PASS.

## Phone (375x667 and 375x553)
- Text: nothing under 11 px. Taps: nothing under 44 px. No errors and no stuck screens in 8 games and 2 tutorials.
- Overlap 1 (375x553): after a knockout, the `#moment` banner covers the dice tray's top row for about 2 s (4 of 4 games at 553).
- Overlap 2 (375x667): the rival's flying dice pass over the Stay/Yield decision card for about 1 s (video 0:29–0:31).

## Scores (GAMEPLAY-RUBRIC.md)
| # | Row | Score | Why |
|---|---|---|---|
| 1 | Rules fidelity | 8 | Engine and cards identical; win texts now consistent; only house interpretations, which are listed |
| 2 | Tutorial teaches | 7 | Every core rule in order, one line + one tap, ends in a real game; but tut-walk FAILs (16-word last line), and the cold player had to tap "Play a real game" twice |
| 3 | First 10 seconds | 8 | Goal on the title, one Play button plus Learn |
| 4 | Turn clarity | 7 | A clear step pill and active chip, and labelled dice; but kept dice change places after a roll, the rival line fades fast, and "Not enough ⚡: End turn" is easy to miss |
| 5 | Phone play | 7 | 44 px dice, 0 loops, no text under 11 px; two short overlaps remain (banner over the dice at 553, flying dice over the Stay/Yield card) |
| 6 | AI and pacing | **6** | Without hints a newcomer lost **0/5** on Easy by touch (0/9 with R83); 2/3 only when following every hint, and hints are off by default; ~10 s between your turns |
| 7 | Feel | 8 | 3D arena, tumbling dice, pop-up results, knockout banners; the cold player: "a quad of 3s… feels great" |
| 8 | Bugs | 8 | 0 errors, 0 stuck, 0 dead taps in scripted play; one possibly eaten first tap on the tutorial end card (not reproduced) |

**Average 7.4. FAIL** (row 6 < 7).

## Repro for rows under 7
- Row 6: clear storage, open at 375x553 or 375x667, Play (default Easy ×3). Keep pairs, claws and energy, and hearts when under 7 ♥ outside Downtown. Use every roll, buy the first affordable card, yield at ≤6 ♥ as the advice says. Result: lost 5/5 (`games-src/kot/game-walk.js` with this policy; g1–g3, g7, g8). `node kot/newb-sim.js 200 easy` reports ~60% for the same policy both before and after F1, so the sim is not a valid gate.

## Fix list (priority order)
1. **Easy must be winnable without hints** (Opus, a balance/feel call). Gate it on **touch games** (game-walk.js policy, ≥6 games across both sizes: newcomer wins ≥2 and is KO'd in fewer than half), not newb-sim. First find out why newb-sim (~60%) and touch play (0/9) disagree. Suspects: real-game setup differences (seat order, starting monster, DEFEX/LVMIX defaults, AI speed paths) or the sim's `tender` override. Then tune: Easy rivals should also leave the star race open (e.g. stop rolling for star sets more often, or buy star cards less), because 3 of the 5 losses came from a rival reaching 20★ while the newcomer was at 10–12★.
2. **Kept dice keep their place** (Sonnet): don't re-sort the dice after a reroll, or keep kept dice fixed and only sort the new ones. The cold player tapped the wrong die because a kept die moved.
3. **tutor.js:154 ≤ 12 words** (Haiku), e.g. "Hold 20 ★ to your turn's end, or outlast all. Play!" Then tut-walk must PASS at both sizes.
4. **Overlaps** (Sonnet): at 375x553, place `#moment` where it doesn't cover `#dice` (or hide it while the dice tray is up). Don't open the Stay/Yield card until the rival's dice animation has landed, or put the card above the flying dice.
5. **Rival turn readability** (Sonnet): keep the rival's result line up until the next rival starts (it fades too fast), and trim the wait between your turns (~10 s with 3 rivals).
6. **End card first tap** (Haiku): make "Play a real game" accept a tap during the end card's entry, or don't show it until it is tappable.
7. Optional: make "Not enough ⚡: End turn" more visible (e.g. highlight the End turn button once); shorter card summaries in the shop.
