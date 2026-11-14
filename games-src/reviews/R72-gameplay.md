# R72 strict gameplay review: shipwreck-isle (F14)

Branch `shelf/W468-shipwreck-lean` at **05a2a2f0acba82e4b25b6d2c10d10b583e1ead7f**. Reviewer R72, 14 Nov 2026. Review only; no game code was changed.

**Verdict: FAIL. Average 7.0. Rows under 7: Tutorial teaches (6).** No stopper.
F14 fixes the R67 problem: Turn clarity goes from 6 to 7. A new tutorial bug now blocks the pass: step g3 tells you to gather food and rings the Wood row.

## Gates (run alone, 2 each)
| Gate | Run 1 | Run 2 |
|---|---|---|
| `build-all.py --quick shipwreck-isle` | PASS (BUILT, scn 8/8) | PASS |
| `build-all.py --full shipwreck-isle` | PASS (phone-check 164 s, sweep 4 games) | PASS (phone-check 167 s, sweep 4 games) |
| `lay-phone.js 375x553` | PASS: 0 problems, smallest target 44 px, 0 console errors, day played | |
`games/lab.html`, rewritten by --full, was not committed.

## Play sessions (touch only, isMobile + hasTouch, SwiftShader WebGL)
| Run | Size | Result |
|---|---|---|
| Learn to play (guided), tap the ring only | 375x667 | PASS, 54/58 steps shown, 28/28 rules, 0 errors |
| Learn to play (guided) | 375x553 | PASS, 53/58 steps, 28/28 rules, 0 errors |
| Full default game (Easy island), following ✨ | 375x667 | RESCUED day 11, pile 15, 39 non-decision taps, 0 errors |
| Full game, own random plan (no ✨) | 375x553 | Lost day 6 (fair for random play), 0 errors |
| Hint (bulb) then hands off for 25 s | 375x667 | 1 helper, 0 loops (details below) |
| Start day before touching any pawn; own plan for 3 days | 375x553, 375x667 | see row 4 |

## Clutter audit (sampled every 1 s, in-page)
Helpers counted: tutorial ring, hint ring/finger/bubble, ghost finger, *pulsing* place glows, *pulsing* pawn ring, coach bubble. A loop is any running animation with infinite iterations on a visible element.

| Run | Samples | Max helpers at once | Samples with >1 | Infinite loops |
|---|---|---|---|---|
| Tutorial 375x667 | 234 | 1 | 0 | 0 |
| Tutorial 375x553 | 101 | 1 | 0 | 0 |
| Full game 375x667 | 181 | 1 | 0 | 0 |
| Own-plan game 375x553 | 58 | 1 | 0 | 0 |
| After Hint, 25 s hands off | 31 | 1 (hint bubble only; the ghost finger left) | 0 | 0 |
| **Total** | **605** | **1** | **0** | **0** |

The R67 complaints are fixed. Rings and the finger stop. The ghost finger and pulsing glows never showed together. No pawn is ringed at day start ("Tap a pawn to see where it works"). The hint bubble never covered the turn line.

## Rules vs the original (repo notes: rules-check/shipwreck-isle.md, rc/rules-notes.md)
Engine: no change from R67. Weather (FN.weather / weather2) matches the notes: a rain die on days 4-6 and three dice on days 7-12 (Marooned, Normal). Each snow cloud costs 1 wood. Rain and snow clouds above the roof each ruin 1 food and 1 wood. The animal die is −1 food, −1 palisade, or a strength-3 fight against the weapon. Each storm is −1 palisade. Beast vs WEAPON was left as settled.

The 3 new tutorial steps:
| Step | Text | Verdict |
|---|---|---|
| wx1 | "Days 4 to 6 roll a rain die. Build a roof first." | True for Normal Marooned. **Not true in the next game a newcomer plays.** The tutorial's own "Play on" game sets no weather dice (`tutDeal`: `G.wxT={}`). The default first real game is the Easy island (`EASYK.wx:0`, so `G.wxT={}`), which rolls no weather dice at all. My 11-day Easy game had no weather roll. |
| wx2 | "From day 7, snow burns 1 wood. Storms knock down the palisade." | Half true. Snow costs 1 wood per cloud, but snow clouds **also** count against the roof with rain (`over=rain+snow-roof`). The text says nothing about that. Storms come from event cards, not "from day 7". Same Easy and Play-on problem as wx1. |
| wx3 | "Hungry animals take food, palisade, or fight: strength 3 against your weapon." | True (matches weather2). It applies only from day 7 on Normal; Easy never rolls the animal die. |

Other player-facing text: g3 "Gather food" is contradicted by its own highlight (see row 2). The rest of the 58 lines read true against the notes.

## Scores (GAMEPLAY-RUBRIC.md)
| # | Row | Score | Why |
|---|---|---|---|
| 1 | Rules fidelity | 7 | The engine is faithful (see above). The new weather lines are correct only for Normal and say nothing about the Easy island. |
| 2 | Tutorial teaches | **6** | It covers all 28 rules in order, one line and one tap per step. But g3 says "Gather food" and rings the **Wood** row every time. Day 3 then ends on "Food 0 of 2 for tonight: the hungry take 2 wounds each". The 3 weather steps are text-only cards stacked on the day-3 summary, with nothing on screen to point at. They teach dice the next game never rolls. |
| 3 | First 10 seconds | 8 | "Day 1 of 12. Light a fire and stack 15 wood." Then a clean board with "Tap a pawn to see where it works". |
| 4 | Turn clarity | 7 | F14 is verified: 1 helper at most, 0 loops, finite pulses, no pre-ringed pawn, and the turn line is never covered. The "needs 2 pawns" line shows ("Place 11 needs 2 pawns: give yours another job"). The "Tap ✨ to add N wood" bubble appeared at most once per day (6-7 s) and did not nag. In 3 hand-placed days the pile was always covered, so the once-a-day Start-day ask never fired. The code limits it to once per day (`BF.pileAsk===G.round`). Remaining nits: stale status lines and a refused Start day that rings nothing (fixes 3-4). |
| 5 | Phone play | 7 | lay-phone passes at 375x553: 44 px targets, no scroll, board first. Nits: when a pawn is ringed, the ring clips its name ("Cook" at 375x667, tutorial shots 30 and 44). The place pop-up title ("Cook → place 3 · mountains") falls back to a serif font. |
| 6 | AI and pacing | 7 | Co-op, so no rival. Following ✨, you are rescued on day 11 of 12 in about 3 minutes of bot time. A random own plan dies on day 6, which is fair. The Easy island is generous. |
| 7 | Feel | 7 | Dice, haul floaters and day summaries all react. The tutorial ends on three plain text cards. |
| 8 | Bugs | 7 | 0 page errors, 0 stuck states and 0 dead taps for a human across 5 sessions. The g3 mis-target is a logic bug. |

**Average 7.0 (56/8). FAIL: row 2 is under 7.**

## Repro steps for rows under 7, plus nits
1. **Row 2 (must fix), g3 food/wood mismatch.** Fresh profile at 375x667: Play, then Learn. Follow the ring to day 2, step 32/58, "Gather food. Food and wood arrive after all jobs." The ring sits on "⭐ Wood · place 3 (mountains)", not on "🦜 Birds". Cause: `guide.js:60` looks for rows matching `/fish|food/`. The tutorial deck always explores tile 5 first (`tutDeal` tileDeck `[5,4,...]`), which offers parrot ("Birds") and wood. The regex misses it and `gRow('gather')` falls back to the first row, Wood. Effect: Food 0 at the end of day 3 and a starvation warning on the last tutorial screen (tut-52). Fix: match `parrot|bird|fish|food`, or use the row's resource key.
2. **Row 2 / row 1, weather steps vs the next game.** Finish Learn and tap Play on, or start the default real game (Easy). No rain die rolls on days 4-6 and no snow or animals from day 7, unlike wx1-wx3. Fix: either say "On the full island (Normal)…" or show a real weather roll in the tutorial. Also add "snow clouds count against the roof too" to wx2.
3. **Row 4 nit, stale status lines.** At 375x553 on a fresh real game, tap Start day before touching any pawn. The line reads "Carpenter still has a pawn to place." with nothing ringed or glowing (shot r-1). Tap Carpenter: the glows appear, but the line keeps the old text for about 6-8 s instead of "Carpenter: tap a glowing place". Similarly, after both Cook pawns have jobs, "🔥 Pile +2. Cook still needs a job" stays up. Fix: drop BF.msg once its condition is gone, and ring the named pawn after a refused Start day.
4. **Row 5 nit.** When a pawn is ringed, its name label sits under the ring (tutorial 375x667, steps 32 and 47). The `#ppop` header uses a serif fallback font.

## Top fixes (in order)
1. guide.js g3: ring the food row (Birds/parrot) so the line and the tap agree. This is the pass blocker.
2. Weather steps: say they describe the Normal island, or teach them on a real roll. Mention snow counting against the roof.
3. Clear stale BF.msg lines once a pawn is in hand or its job is set. After a refused Start day, ring the named pawn.
4. Keep pawn names clear of the hand ring. Give the pop-up header the game's sans font.

Screenshots (reviewer scratchpad, not committed): tut-30.png (g3 ring on Wood), tut-44.png, tut-52.png (Food 0 warning + wx2), hint-0s-375x667.png, pawn-tapped-375x667.png, r-1-start-refused-375x553.png.
