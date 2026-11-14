# R55 strict gameplay review: shipwreck-isle (14 Nov 2026)

Build reviewed: `origin/shelf/W468-shipwreck-lean` at **db89a4313** (F11 fix on top of ee14f3a79).
Bar: games-src/reviews/GAMEPLAY-RUBRIC.md, 8 rows, PASS needs every row >= 7.

## Verdict: FAIL, average 6.9

The F11 beast "fix" made a correct rule wrong. Rules is capped at 5. The one-helper claim also fails at 375x667.

| # | Row | Score |
|---|-----|------:|
| 1 | Rules fidelity | **5** (cap: wrong core rule) |
| 2 | Tutorial teaches | 8 |
| 3 | First 10 seconds | 7 |
| 4 | Turn clarity | **6** |
| 5 | Phone play | 7 |
| 6 | AI and pacing | 7 |
| 7 | Feel | 7 |
| 8 | Bugs | 8 |
| | **Average** | **6.9** |

No stopper: 0 errors, 0 stuck states and 0 dead taps across every run.

## Gates (each run alone, 375 px wide)
- `--quick`: PASS (145 s, scn 8/8). The first try failed only because the `three` package was missing locally. It passed after `npm i --no-save ... three`.
- `--full` run 1: PASS (339 s; phone-check 153.5 s). The first seconds overlapped the tail of the quick run.
- `--full` run 2, strictly alone: PASS (335 s; phone-check 153.0 s).
- Both full runs gave `lab WARN 9/12`: the LAB rows do not match the scenario list (menu and story-scene). This is not blocking.
- `logic-test.js`: 277/277 pass. N13 passes because the test was changed to assert the new palisade rule (see Rules).
- `guide-test.js` (tutorial by touch): PASS at 375x667 and 375x553, steps 51/55, rules 28/28.
- `lay-check.js`: game 375x553 PASS, learn 375x667 PASS. 0 plate overlaps; smallest ring 41 px at 375x553.

## Games played by touch
Four full games at 375x667 and 375x553, sampled every second by an injected probe (visible glows, ghost finger and its target, warn pulses, coach bubbles, every running animation with infinite iterations):

| Game | Size | Play | Result |
|---|---|---|---|
| 1 | 375x667 | follow ✨ hints | rescued, day 10, 141 s |
| 2 | 375x553 | follow ✨ hints | rescued, day 10, 139 s |
| 3 | 375x667 | own random plan | lost, day 5 |
| 4 | 375x667 | follow ✨ hints, re-run of game 1 with screenshots | rescued, day 10 |

All four games ended with 0 errors. lay-check also played one more game at 375x553 (rescued, day 11).

## 1. Rules fidelity: 5 (wrong core rule)
I identified the original from the repo's own notes (rules-check, rules-notes). The sources I read:
- the publisher's English rulebook PDF, text extracted locally;
- the community comprehensive FAQ and errata, which quotes the publisher's FAQ 1.01;
- a fan rules summary.

**WRONG: the hungry-animals beast now fights the palisade.**
- Engine: `phases.js:231` (`3-G.camp.pal`). Rules text: `rules-html.js:17`. Checklist: N13, rewritten in db89a431.
- The rulebook's weather-phase section says: "if players have to Fight a Beast (with a strength of 3) and the **Weapon** level is lower than 3, each player gets 1 Wound for every lacking level".
- The publisher's FAQ 1.01 asks: "When the red Hungry Animals die says 'fight a beast of value 3' I guess I only compare the **weapons** level with 3 and either win (with no other gain) or lose (and all players will get Wounds). Right?" Answer: "Yes."
- The FAQ also rules that the Soldier's weapon-raising skill helps against this beast, which only makes sense if the weapon is compared.
- The code before F11 (strength 3 vs weapon, wounds to everyone, no weapon loss) was correct. R51's finding was wrong, and F11 turned a correct rule into a wrong one.
- **Fix:** revert the `phases.js` line, the `rules-html.js` sentence, the `logic-test.js` N13 assertion, and the RULES-CHECKLIST and rules-notes lines to "weapon".

**In-game text vs engine:** they match each other (both say palisade), so both are wrong in the same way.

**Checked and correct:**
- Turn order: event (none in round 1), morale (solo +1 first), production, actions, weather, night.
- Action resolution: 2 pawns is a sure success, 1 pawn rolls the wound, success and adventure dice independently; a failed success die gives 2 determination. Resolution order: threat, hunt, build, gather, explore, camp, rest. Gains arrive after all actions.
- Threat and event deck: half the rounds from each pile; a card that slides off the left slot fires its threat.
- Tracks: shelter, roof, palisade and weapon costs and their effects; roof against clouds; winter clouds burn wood; storm lowers the palisade; camp move halves roof and palisade.
- Night: 1 food each or 2 wounds; 1 wound each without a shelter.

**Scenario 1 win:** fire plus the 15-wood pile, round 10 or later, now checked only at round end (`scen.js`). This is a defensible reading of the scenario sheet, which I could not read. Not penalised. In play, rescue happened at the end of day 10.

**Dice faces:** still unverified; no source lists them.
- The engine's hungry-animals die (1 food, 2 palisade, 1 fight, 2 blank) is plausible.
- The rain die has no blank face (5 rain faces and 1 snow), which looks harsh; check it against a photo of the die.
- Not scored.

## 2. Tutorial teaches: 8
- One short line and one highlighted tap per step, in rule order.
- 28/28 rules taught; a wrong tap is ignored; it hands over to a real game.
- Readable at 375x553 (shots tut-1/8/22/36).
- 55 steps is long. It does not teach the hungry-animals die, but that die never rolls in the two tutorial days.

## 3. First 10 seconds: 7
- "Day 1 of 12. Light a fire and stack 15 wood." states the goal.
- The day starts with Carpenter selected and "tap a glowing place".

## 4. Turn clarity: 6
1. **Two helpers at once at 375x667.**
   - Repro: default game, follow ✨ for the Carpenter, day 2. Tap place 7: the place pop-up opens and the ghost finger points at the ⭐ "Wood · place 7" row inside it.
   - The pop-up is short at this height, so the map glows on places 2, 3 and 6 stay visible above it.
   - This happened on 14 of 133 sampled seconds (game 4) and 15 of 142 (game 1).
   - At 375x553 the pop-up covers the glows (12 seconds, all hidden), so there it counts as 1 helper.
   - F11's claim that the finger only ever points at a glowing place is false: it also points at ⭐ rows inside the pop-up.
   - **Fix:** hide `#bfglow` (or its rings) while `#ppop` is open, or don't show the finger on pop-up rows.
2. **Glows and the finger show at day start, before any tap.**
   - Repro: Play, then Continue to the planning of day 1. Four places glow and the finger already sits on place 3, on both sizes (daystart shots).
   - This regresses the R46 "nothing glowing at day start" bar. It is caused by hint mode being on by default on the Easy island.
   - **Fix:** show glows only after a pawn or ✨ tap, or at least no finger until ✨ is tapped.

The "why" text is still there: the ✨ line names the job, and the day summary gives reasons, warnings and tomorrow's threat.

## 5. Phone play: 7
- lay-check PASS at both sizes; board at least 317 px.
- The smallest glow ring is 41 px at 375x553, under 44 px.
- The day-summary card covers most of the board, but it is tappable to continue.

## 6. AI and pacing: 7
- Following ✨ wins 4/4 (day 10, 10, 10, 11), so a new player can win on the default level. It may be too easy if you follow the hints.
- A random own plan loses on day 5, so choices matter.
- About 32 to 36 non-decision taps per game. The rival and island steps are brisk.

## 7. Feel: 7
- Story scenes, card flips, flying gains, and finite pulses that now stop after 3 cycles.
- Feels like a game. The helper animation after 15 s is static, which is correct.

## 8. Bugs: 8
- 0 page errors and 0 stuck states over 5 full games, 2 tutorials and lay-check.

## Clutter and loop counts
- **Infinite CSS/WAAPI animations: 0**, in every sample of every run, including the 15 s after a ✨ tap at both sizes. At 15 s nothing is running at all.
- **Max visible helpers: 2 at 375x667** (finger on a pop-up ⭐ row plus visible map glows; 29 of 275 seconds over games 1 and 4).
- **Max visible helpers: 1 at 375x553** (the pop-up covers the glows).
- Warning pulses never ran while glows showed.
- The probe once reported "3"; that was the probe counting its own debug tag, not a third helper.

## Top fixes, in order
1. Revert the beast fight to the WEAPON level in the engine, rules text, N13 test, checklist and notes. This restores Rules.
2. Hide the map glows while the place pop-up is open, or never put the finger on pop-up rows. This gives one helper at 375x667.
3. Nothing glowing and no finger at day start until a pawn or ✨ is tapped.
4. Rings at least 44 px at 375x553; fix the lab WARN row list.

Screenshots (local to the review session): daystart-375x667/553, hint-0s / hint-15s at both sizes, fe-375x667-2 (two helpers), fe-375x553-1 (pop-up covers the glows), tut553/tut-*.png, result.png.
