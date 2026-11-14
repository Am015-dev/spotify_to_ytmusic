# R67 strict gameplay review: Shipwreck Isle

- **Commit reviewed:** `11b3c343c91b3dc22249113b0655d1a3e08f5ed1` (branch `shelf/W468-shipwreck-lean`), compared with `c1c78f1b8` (11b3c343~1).
- **Date:** 14 Nov 2026, 19:50-21:10 UTC. Reviewer only: no game code changed.
- **Verdict: FAIL, average 7.5.** Turn clarity is 6 because the clutter check fails. Every other row is 7 or higher. No stopper.

## Gates (run alone, one after another)

| Gate | Run 1 | Run 2 |
|---|---|---|
| `VIS_SLUGS="," build-all.py --quick --out /tmp/x shipwreck-isle` | exit 0, BUILT (158 s) | exit 0, BUILT (153 s) |
| `... --full ...` | **PASS** (411 s): phone-check ok, sweep PASS 4 games, lab WARN 9/12 (LAB rows differ from the scenario list, same as before) | **PASS** (385 s), same result |

`games/lab.html` was restored after `--full`; it is not committed.

## lay-phone.js at 375x553: the problems are OLD

I ran `node rc/lay-phone.js 375x553` on this commit and on `c1c78f1b8` (built in a separate worktree). The output is **identical on both** (7 problems, same numbers), so **this commit did not add them**:
- `SMALL TARGETS sg|1 43x44` on the setup screen. This one is real: the "1" player-count button is 1 px short of 44. It also failed before this commit.
- `#story [data-a=next] missing`, `TILES NOT HIT`, `island clipped`, then `page.tap timeout`. These come from the **test, not the game**. After Start, the game shows the "New here? Learn in 5 minutes / Play anyway" card (screenshot `rc/shots/ph/P_375x553_1story.png`). lay-phone does not know about that card, so it measures the island under the card and then waits 60 s for a Continue button that is not on screen. Fix the test: tap `Play anyway` (`[data-tutoffer]:not([data-tutoffer=learn])`) before the story steps.
- Both builds also served every image as the HTML page (the lay-phone route answers every `swi.test` URL with the page). That is why the icons look broken in lay-phone shots. The live art is fine when served (see my own runs below).

## What I played (touch only, real Chromium with SwiftShader WebGL, art served from `games/shipwreck-isle/`)

1. **Learn to play** at 375x667 and at 375x553: all 55 guide steps, by tapping only the ring each step shows. Then "Keep playing" into day 4 and day 5. 0 stuck, 0 console errors.
2. **Full game, Marooned, Easy (the default), 375x553:** days 1-12, through to the end. I tapped a pawn myself every day, then followed the ✨ hint, but tapped Start day instead of ✨ when the line said "🔥 ✨ adds 3 wood to the pile". Result: **lost on day 12** ("Time ran out"), signal pile stuck at 3/15 with 14-19 wood in stock.
3. **Full game, Marooned, Easy, 375x667:** same, but tapped ✨ whenever it offered pile wood. Result: **won on day 10** (pile 3 > 6 > 10 > 13 > 15, Fire built). 0 errors.
4. The previous bot runs (days 1-7 at 375x553, days 1-4 at 375x667) also had 0 errors. Each time the bot got stuck, the cause was my bot (it left a single pawn on a job that needs two, or kept tapping the Dog). The game never caused it.

Total: about 30 played days and 2 complete games, sampled once a second (about 1,500 samples).

### Turn clarity sampler (prompt vs what is tappable and glowing)
- **R60's bug is fixed.** In the real game, I found **0 samples** of "tap a glowing place" while nothing glowed, across 2 full games plus the 3 tutorial days. (My first tutorial run showed 5 samples, but the probe was reading the status line while the place pop-up covered it. With that corrected at 375x553, there were 0.)
- Every day starts with "Tap a pawn to see where it works" and 0 glows. Tapping any pawn then gives "<Name>: tap a glowing place" with 4-12 glows. This held on every day I sampled (22 + 21 + 2 days).
- **Still confusing (row 4):** at each day start the **Carpenter's first pawn already wears the gold "picked" ring** while the line says "Tap a pawn". After the tutorial, Friday is pre-picked instead. So the screen says "pick one" while showing one already picked. Shot: `scratchpad/g667/004_r1_tapapawn.png`.

### Clutter sampler (max 1 helper, 0 infinite loops)
- **Hint loop: FAIL.** After tapping 💡 Hint (day 2), the hint ring (`gxh-pulse`, `animation ... infinite` in `shell/gx-help.css:23`) and the finger (`gxh-finger`) were **still looping at 15 s**: 17 one-second samples in a row in both full games. They stop only at the next tap. The hint bubble also covers the status line for that whole time (the prompt is blank). Shot: `scratchpad/g667/012_afterhint.png`.
- **Tutorial ring loop:** `#tutring` pulses with `tutp ... infinite` (`rc/head.html:791`) while it waits for each step's tap: 46 samples at 375x667 and 49 at 375x553.
- **Two helpers at once:** on day 1, and after every ✨ tap, the ghost finger (`#bfgh`) and the pulsing place glows run together for about 4-5 s: 8 samples per full game, all finite. After Hint, the bulb pulse and the hint bubble overlapped for 1 sample.
- **Counts:** max helpers on screen = **2**. Samples with more than 1 helper: 30 (375x553 game) and 21 (375x667 game). Infinite-loop samples: 17 per game after Hint, plus 46 or 49 per tutorial.

## Rules vs the original (repo notes plus the online rule reference; the original is not named here)

- **Hungry-animals fight = strength 3 against the WEAPON, wounds to every castaway: CORRECT, keep it.** The online rule reference's weather-phase page lists the three animal faces: "Discard 1 food or each character suffers 1 Wound", "Decrease the Palisade level by 1 or each character suffers 1 Wound", and "Fight a combat against a strength 3 beast". Its combat rule is "compare Weapon level to the beast's Strength; each point short = 1 Wound", and the reference states that all characters suffer the wounds from this weather combat. The engine (`phases.js:231`: `3-G.weapon` wounds for each living castaway, no weapon loss) matches this. So do the new Help line (`hlp.js`) and the rulebook line (`rules-html.js`). R55's call stands. **No fix here is backwards.**
- **Food face and palisade face** (`phases.js:229-230`) match the reference: 1 wound each when the food or palisade can't be paid.
- **Rain/winter die faces: still unverified.** I found no online source that lists the face counts. Note that the data has **no blank face** on either die (`rain: 1,1,1,2 rain + 1 snow`; `winter: 1,1 snow, 2,2 snow, 2,2 rain`). With those faces, every rain round in 4-6 always brings at least one cloud. Check the faces against a physical die photo before calling them final. Not deducted.
- **Signal pile:** the engine lets you fill part of a stage on one day and finish it later (10 > 13 on day 7, then 13 > 15 on day 9). It still caps a day at one stage. I could not confirm whether the original allows a part-filled stage. Flag it for the rules notes. Not deducted.
- **Pile 3/15 on day 1** is the Easy level's head start ("Easy island: timber from the wreck", `tutor.js:18`). It is a documented variant, not a rules bug.
- **Help, rulebook, tutorial:** the turn order, shelter/roof/palisade costs, weather (each cloud above the roof costs 1 food and 1 wood; snow costs 1 wood more), night (eat or take 2 wounds; no shelter = 1 wound), morale, hunting (weapon vs strength, weapon drops by the loss value) and dice (1 pawn = 3 dice, 2 = sure; a failure gives 2 determination) all agree with the original as summarised in `rules-notes.md`.
- The new Help sentence sits on the "Roof and palisade" card, whose picture shows roof > cloud. The weapon is not pictured, and the line is now about 40 words.

## Scores (GAMEPLAY-RUBRIC.md)

| # | Row | Score | Why |
|---|---|---|---|
| 1 | Rules fidelity | **8** | Engine and texts match the original wherever I could check; the hungry-animals line is verified. Die faces and part-filled pile stages are still open. |
| 2 | Tutorial teaches | **7** | 55 one-line, one-tap steps in rule order, then a real game; completes at both sizes. Its last line says "That is every rule", but snow/winter, hungry animals, palisade/storm and the weapon in weather are never taught. 55 taps is long for "5 minutes". |
| 3 | First 10 seconds | **8** | "New here? Learn in 5 minutes" plus the goal in one line; Play is obvious. |
| 4 | Turn clarity | **6** | The R60 bug is fixed. The row fails on clutter: the hint loops forever and covers the prompt, and the ghost finger and glows run as 2 helpers. Also a pre-picked pawn under "Tap a pawn", plus the unclear lines below. |
| 5 | Phone play | **7** | 375x667 is clean. At 375x553 with 10+ glowing places, the place labels sit on top of the glow rings, and the job chips ("Gather needs +1") cover the island. The dice floaters ("wound", "failed") are cut off at the top of the board. One 43 px button on setup. |
| 6 | AI and pacing | **8** | Following ✨ wins Easy on day 10. Days are brisk, and the story plays itself with Continue. |
| 7 | Feel | **8** | Dice rolls, success/fail floaters, resource fly-ins, the card flip, rain: every action has feedback. |
| 8 | Bugs | **8** | 2 full games to the end plus 2 tutorials: 0 console errors, 0 game-caused stuck states, 0 dead taps. |

**Average 7.5. FAIL** (row 4 < 7).

## Repro steps for row 4 (score 6)

1. **Endless hint loop that hides the prompt.** Start Marooned on Easy at 375x667 and play to day 2's plan. Tap 💡 (top left) and wait 15 s without touching anything. The ring and finger keep pulsing (`gxh-pulse` and `gxh-finger`, both infinite), and the status line stays hidden under the bubble. Expected: no more than 3 pulses, then still; prompt visible. Shot: `scratchpad/g667/012_afterhint.png`. (The CSS is in the shared shell, so fixing it touches every game.)
2. **Two helpers at once.** On day 1's plan, tap a pawn, then tap ✨. The ghost finger animates over the suggested place while every glow ring pulses, for about 4-5 s. Expected: one cue. Keep the finger and hold the other glows steady while it shows (or the reverse).
3. **Pre-picked pawn vs "Tap a pawn".** At the start of any day's plan, the Carpenter's first pawn (or Friday's, after the tutorial) wears the gold picked ring, but the line says "Tap a pawn to see where it works" and nothing glows. Expected: either no pawn ringed until tapped, or "Carpenter is ready: tap it to see where it works". Shot: `scratchpad/g667/004_r1_tapapawn.png`.
4. **Unclear lines.** "🔥 ✨ adds 3 wood to the pile" reads like something that already happened. It actually means "tap ✨ to add it". When my bot tapped Start day instead, the pile stayed at 3/15 for 11 days and the game was lost with 19 wood in stock, and **Start day gave no warning about the unfed pile**. "Too few pawns for place 2: pawn back" does not say what to tap. The floating "🧱 -1" chip on day 7 has no label (`scratchpad/f553/015_r7_tapapawn.png`).

## Top fixes (in order)
1. Shell `gx-help.css:23`: make `gxh-pulse` and the finger finite (3 pulses), and keep the status line visible under or beside the hint bubble. Do it in one build-all call, because the shell is shared.
2. Day 1 and after ✨: show only the ghost finger, or only the glows, never both animating.
3. Day start: don't pre-ring a pawn, or name the ringed pawn in the line.
4. Rewrite "🔥 ✨ adds N wood" as "Tap ✨ to add N wood to the pile". When a pile stage is due and wood is spare, Start day should ask once.
5. "Too few pawns for place N: pawn back" > "Place N needs 1 more pawn: add one or take this one back".
6. Tutorial ring: stop pulsing after 3 cycles. Either teach weather dice, hungry animals and palisade in one step, or change "That is every rule" to "That is the core; weather gets harsher from day 4 and day 7".
7. 375x553: hide place labels while glows show (or move them off the rings). Fix the 43 px setup button and the clipped dice floaters.
8. lay-phone.js: handle the "New here?" card, and serve the art files in the route.

Local evidence (not committed): `/tmp/claude-0/-home-user-spotify-to-ytmusic/5ef44f64-d946-5e11-9f72-f0d8b18cc2c5/scratchpad/` (`tut667`, `tut553`, `g553`, `g667`, `f553`, `f667` folders with shots and `log.txt`). Gate logs are in `/tmp/claude-0/quick{1,2}.log`, `/tmp/claude-0/full{1,2}.log` and `/tmp/claude-0/lp_{cur,prev}.log`.
