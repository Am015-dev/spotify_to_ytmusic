# R90 strict gameplay review: cauldron-fair

**Verdict: FAIL. Average 6.1, capped at 4.0 by stoppers (engine rule breaks plus dead taps). No row is 7 or higher except 3, 6 and 7.**

- Commit reviewed: `f3c8282ad16c62f345f2d033dd147a342e5ff903` (origin/alex/brave-carson-rbpmlk, contains cb812c16 shell calm pass). Reviewer R90, 20 Nov 2026 (UTC).
- Gates (each run on its own):
  - `--quick`: FAIL 3 of 3 runs, 10/13 scenarios. All 10 `?scn=` scenarios pass. The 3 failures are the visual tests `visual.spec.js` title/menu/board: "A snapshot doesn't exist .baselines/cauldron-fair-*-phone.png". The `ui-baselines` branch has no cauldron-fair baselines; `baselines.sh pull` brought 12 files, none for this game.
  - `--full`: PASS 2 of 2. phone-check ok; sweep CLEAN (risk bot vs easy wins 85%); lab WARN 9/12 (LAB rows differ from the scenario list).
  - `games/lab.html` was restored and not committed.
- Rules: 3 engine rule errors, 1 visible broken text ("undefined"), 2 wrong rules taught to newcomers (flask "once a day", red "after an orange"), and about 10 misleading texts.
- Clutter (1 s samples, 375x667 and 375x553):
  - Max helpers/glows on screen: 13 (shop), 8 in the tutorial shop step. Limit is 1.
  - Infinite loops: up to 26 (confetti), up to 10 during play, 2 forever at an idle brew.
  - After the Hint bulb: 1 to 3 loops still running during the next 15 s.
- Play by touch:
  - Tutorial: 30/30 steps at both sizes, 0 errors, 0 dead taps.
  - Games: 6 full Quick games at the default setting (2 players, rival on easy) to the result screen, plus 1 run that hit my bot's limit (see Bugs).
  - 0 page errors, 0 stuck states, 2 dead taps.
  - Newcomer won 2 of 6.

| # | Row | Score |
|---|-----|-------|
| 1 | Rules fidelity | 5 |
| 2 | Tutorial teaches | 6 |
| 3 | First 10 seconds | 7 |
| 4 | Turn clarity | 6 |
| 5 | Phone play | 5 |
| 6 | AI and pacing | 7 |
| 7 | Feel | 7 |
| 8 | Bugs | 6 |
| | **Average** | **6.1, capped at 4.0 (stopper)** |

Stoppers under the rubric ("rule broken", "dead tap"): engine rule breaks R1 to R3 below, and the dead taps B1 and B2.

## Method
- Build: `/tmp/x/cauldron-fair/index.html` from the quick gate, served like the live site by `scripts/gx-serve.js`. Touch only: `touchscreen.tap` at element centres.
- Contexts: `isMobile`, `hasTouch`, fresh storage.
- Reviewer bot (scratchpad `r90play.js`, not committed):
  - Taps what a newcomer would: the goal-card OK, tips, report Continue, and the glowing suggestion where there is one.
  - Draws until whites reach limit minus 2 and uses the flask near the limit.
  - In the shop it buys the glowing chip, or else the last chip offered.
  - Taps the Hint bulb once on day 3, then waits 15 s.
- Sampler: an in-page 1 s interval recording:
  - Helpers: calm-audit's set plus every visible `.sug .pickglow .tglow .armed .droptgt [class*=glow] .pulse #ghost`.
  - Running infinite animations.
  - Text under 11 px, tap targets under 44 px, buttons outside the viewport, buttons covered at their centre.
  - A dead-tap check after every tap: no state or DOM change within 2 s.
- Rules: an independent read of the engine and every text against `cauldron-fair/rules-notes.md`, with the two biggest engine findings reproduced by a node script against `src/engine.js`.
- Screenshots: `/tmp/claude-0/-home-user-spotify-to-ytmusic/ad1586c1-8698-5345-ad1e-eb898cb20f59/scratchpad/out/` (`tut667-step*.png`, `g553-1-mid.png`, `g553-1-shop.png`, `g553-1-hint.png`, `g667-2-hint.png`, `g667-3-result.png`). They are not in the repo; re-shoot with the repro steps.

## Row 1 Rules fidelity: 5
The core loop is right in both engine and text:
- Start bag, white limit 7, explosion keeps the last chip, flask, rats from day 2.
- Bonus die rule, ruby space even when exploded, exploded = points OR shop.
- Buy 1 or 2 chips of different colours, book reveals on days 2 and 3, day-6 white.
- Day 9 secret "Stir!", 5 coins or 2 rubies = 1 VP, tie-break.
- All 4 book sets match the notes, and the 24 fortune card texts match.

Wrong:

| Sev | file:line | What it does / says | Rule |
|---|---|---|---|
| WRONG (engine) | src/engine.js:92-93 with :100, :113, :128, :408 | The rat stone is set to `droplet + tails` **before** the purple card resolves. A droplet step from A Little Slide, Fork in the Road ("droplet 2"), or the droplet face of Fairground Dice then gives a trailing player nothing that day, because the start is `max(rat, droplet)`. Repro (node): trailing seat, droplet 3, 3 tails, A Little Slide: start 6, should be 7. | Card first, then count rats from the current droplet. |
| WRONG (engine) | src/engine.js:92-93, :128 | Fairground Dice VP faces are scored after rat tails are counted. Only Clear the Pods was moved before rats. | Card first, then rats. |
| WRONG (engine + log text) | src/engine.js:112, :114, :126, :127, :129 | Day 9 removes card options: Pedlar's Pick forces 3 rubies, Swap Stall and Haggler's Hour are skipped, Fork in the Road is skipped, Rat Bounty gives VP only. The log claims "a chip could never be drawn" / "a droplet step would never be used". | The card is turned before the day-9 brew. Chips go straight into the bag and can be drawn that day; a droplet step helps that day. Keep all options and delete the false log lines. |
| WRONG (visible text) | src/ui2.js:19-20, rendered at ui4.js:68 and ui2.js:48/:55/:173 | `p1: d => 'Take up to '+d.n...` and `g3: d => 'Slide '+d.s...` take `d` as the first argument, but every caller passes `(p, q.d)`. Screens read **"Take up to undefined rewards"** (Gentle sigh, purple set 1 = beginner set, 2+ purples) and **"Slide undefined spaces"**. p1's meaning is also wrong: it is one reward level, not several rewards. | Use `(p, d) =>`; say "Pick a reward: best / middle / lowest". |
| WRONG (taught) | src/ui5.js:33, src/ui10.js:34, src/story-data.js:26 (tutorial "seven": "The flask works once a day"), src/ui11.js:15 | "Once a day, your flask..." | The flask is used once, then stays empty until refilled with 2 rubies (or by Spring Water). It does **not** refill each day. |
| WRONG (taught) | src/story-data.js:40 (tutorial "red") | "red moves 1 extra after an orange" | Red set 1 counts oranges anywhere in the pot: 1-2 give +1, 3+ give +2. |
| MISLEADING | src/data.js:96 | Trade wind: "The two-chip reward works once." | The engine (:636) allows each reward level once. |
| MISLEADING | src/ui9.js:16 | Black: "Most black chips: droplet moves, maybe ruby." | 2 players: a tie already moves the droplet. 3-4 players: compare with each neighbour. |
| MISLEADING | src/ui9.js:18 | Blue set 2: "Keeps your points if you boom." | Covers only the next 1/2/4 chips, keeps points AND shopping, and gives no die. |
| MISLEADING | src/ui10.js:56 | "Green, purple and black chips near the end act after the brew." | Purple and black count wherever they sit; green set 3 has no last-two rule. |
| MISLEADING | src/ui10.js:51 | "Green gives rubies, blue peeks, red moves..." | Set 1 only; wrong for sets 2-4. |
| MISLEADING | games-src/cauldron-fair/campaign.json:651, :740, :744 | "red chips pay off after reds land"; "Wren Feathers matter more"; "push the white ones down the bag" | Red set 4 = later white 1s move 2. Blue sets 3/4 don't help against whites. A bag has no order. |
| MINOR | src/ui5.js:21, :30 | "Stop whenever you like" / "Spend rubies if you like" (day 9) | You must draw one chip first; there is no ruby spending on day 9. |
| MINOR | src/ui9.js:9, :11 | "draw 5, place one" / "Trade 1 ruby for a 1-chip" | "up to 5", placing is optional; purple and black are excluded. |
| MINOR | src/data.js:51 vs :72 | Blue set 1 and the fortune card are both named "Peek and Pick". | Rename one. |
| MINOR | src/engine.js:271, :380 | "Take a Cinder Moth" is offered when black is sold out; choosing it errors. | Offer only chips in stock. |

Why 5 and not lower: the core loop is correct, and every error is in edge cards, day 9 or text. Why not 7: three engine rule breaks plus two wrong rules taught in the tutorial and rules screen.

## Row 2 Tutorial teaches: 6
- Good:
  - 30 spotlight steps in play order, one short line plus one tap each.
  - Covers the fortune card, draw, whites, flask, report, exploded choice, shop, droplet, refill, rats, day-2 secret draw, the colours, and the day-9 report.
  - Ends with "Now a real game" and a Play button.
  - 35 s by touch, 0 dead taps at both sizes.
- Under 7 because:
  1. It teaches two rules wrongly: "seven" says the flask works once a day; "red" says red moves 1 after an orange.
  2. The shop step (`shops`) has **8 glowing things** on screen with the bubble: 5 `.tok.tglow` chips, 2 of them also `.sug`, plus `rbt.rdrop` and `rbt.rflask` glowing. The newcomer can't see which one the line means.
  3. The end card says "You know every rule", but the shop collapses "4 more stalls" (`tut667-step13-droplet.png`), so yellow and purple are only shown in later steps.
- Repro: Title, "New here? Learn in 5 minutes", tap through to step 11 "shops" at 375x667, then count the glows.

## Row 3 First 10 seconds: 7
- The title offers "New here? Learn in 5 minutes" first, then Play with the table size and rival level.
- On day 1 the goal card shows one sentence and three bullets.
- During the brew a "YOUR TURN: Whites 3/7. Draw, or Stop to keep this space." line, with the payoff on Stop.
- Clear enough.

## Row 4 Turn clarity: 6
- Good: the brew line, the payoff preview on Stop, "Odo: finished/choosing", the day chip, and the fortune chip.
- Under 7 because:
  1. The "undefined" prompts (Row 1).
  2. The shop glows **every** affordable chip (up to 13 `.tglow` at once, r3/r6/r7 reports in g553-1/2/3 and g667-1/3), so the glow doesn't say what to do.
  3. The Hint bulb during a decision ("Send a white back", yellow set 1, day 3) opens two generic "Chip powers" rules cards instead of a suggestion. The card covers the two answer buttons (`g667-2-hint.png`; `.gxh-rules` covered "Put the white chip back" until closed).
  4. At 375x553 the rival panel and the fortune chip sit on top of the track (`g553-1-mid.png`), so a newcomer can't read the spaces behind them.

## Row 5 Phone play: 5
- Passes:
  - DOM text: nothing under 11 px; the game forces a 14 px floor.
  - Main buttons are 44 px or more.
  - No sideways scroll.
- Fails:
  1. Ruby stepper buttons `button.sbc` in the evening report are **21x21** (g553-3 r4), 24x24 (g553-4 r5), 37-43 px elsewhere.
  2. The day chip `button.dayn.gchip` is pushed off the left edge (x = -3 to -9 px) in the report at both sizes.
  3. Secondary brew buttons run past the bottom of the screen at 375x667: "↩ White chip back" (6,652 to 369,696) and "Do-over: tip the cauldron" (6,649 to 369,693). Also "White chip back" at 375x553 (bottom 575).
  4. At 375x553 the track is about 250 px tall. Its coin/point labels (SVG text, so a DOM check misses them) are unreadably small (`g553-1-mid.png`, `g553-1-hint.png`).
  5. Thumbnails `button.th` (rival) sit under `div.sthead` / `div.ds.me` in the report (covered at their centre).

## Row 6 AI and pacing: 7
- The easy rival plays sensibly and fast. A full 9-day game is about 100 taps, roughly 2 minutes of bot time.
- My simple newcomer won 2 of 6 (39-37, 28-24) and lost 4 by 5-10 points (23-33, 27-32, 28-33, 36-41).
- The `--full` sweep's better bot wins 85% vs easy.
- A newcomer can win; it is a fair, brisk game.

## Row 7 Feel: 7
- Bag rummage, chips sliding onto the spiral, the boil heat on the pot, the meter shake near the limit, the die roll, and a confetti result screen with a per-day score table.
- It feels like a game. The looping idle motion is a clutter problem, not a lack of feel.

## Row 8 Bugs: 6
- 6 full games to the result screen plus 2 tutorials: 0 page errors, 0 console errors, 0 stuck states.
- One run (g667-2) stopped on day 3 only because my bot never closes the Hint rules card. A person would tap ×, so I don't count it as a game stuck state; it is listed under Row 4.
- Dead taps (no change within 2 s):
  - **B1** shop, pick chip: g553-1 day 8 and g553-4 day 4. Tapping a chip in the shop (the last chip in the list, likely unaffordable or sold out) does nothing and gives no message.
  - **B2** "Score 4 points" on Clear the Pods: g553-2 day 1, the first tap had no effect.
- Plus the visible "undefined" text (Row 1).

## Clutter (calm check)

| Path | Max helpers at once | Max infinite loops | After Hint (15 s) |
|---|---|---|---|
| Tutorial 375x667 / 375x553 | 8 / 7 (step `shops`: 5-6 `.tok.tglow` + `.rdrop` + `.rflask` + bubble). Also 3 at `choose` (2 `.dpick.pickglow` + bubble). | 26 (end card confetti `i{conf}`, head.html:198) | n/a |
| Quick games (6) | 8-13 (shop `.tok.tglow`, head.html:599). Also day 1 `.tok.tglow` + `#ghost`. | 8-26. In play: `bagidle` (head.html:389), `flglow` (:382/383), `boil` (:424-426), `bagshake`/`rummage`/`dip` (:397-406), `#ghost` (:418), `tgl` (:599/:610/:624), `throb` (:375), `pickP` (:576), `dieRoll` (:571). Result screen: `conf` x26. | 1-3 loops (`bagidle`, `flglow`, `boil`); helpers 1 |
| Idle brew (goal card up, nobody taps) | 1 (`#ghost`) | 2 forever (`bagidle` + `ghost`) | n/a |

The known own loops are still live: `src/head.html:382 flglow` and `:389 bagidle`. Others not on the calm-audit list are also running: `boil`, `ghost`, `tgl`, `conf`, `sugP`, `pickP`, `throb`, `bagshake`/`rummage`/`dip` while drawing, `flarm`/`dropglow` (skin.css:151/:156).

## Prioritized fix list (for the fixer)
1. **Engine, day 9 cards** (engine.js:112, :114, :126, :127, :129): keep every option on the last day. Remove the "could never be drawn" / "never be used" logs. Add rules-test cases.
2. **Engine, card before rats** (engine.js:92-93): resolve the purple card (all droplet and VP effects incl. Fairground Dice and Fork) before `setRats`. Or re-run `setRats` after the card's answers, the way `clear` does. Test: a trailing seat with A Little Slide gets start = droplet + 1 + tails.
3. **"undefined" prompts** (ui2.js:19-20): `(p, d) =>`; reword Gentle sigh as one reward level.
4. **Flask text** (ui5.js:33, ui10.js:34, story-data.js:26, ui11.js:15): "Once per refill: after use it stays empty until you pay 2 rubies." **Red tutorial line** (story-data.js:40): "Red moves 1 extra if an orange is in your pot."
5. **Calm**:
   - Shop: glow only the suggested chip, never every affordable one (head.html:599 `.tok.tglow`). Don't glow `.rdrop`/`.rflask` at the same time.
   - Make `bagidle`, `flglow`, `boil`, `ghost`, `tgl`, `conf`, `throb`, `pickP`, `sugP`, `flarm`, `dropglow` finite (1-3 iterations), or run them only for a moment after a state change.
   - The tutorial `shops` step should show only its own target.
6. **Phone**:
   - Ruby stepper `.sbc` at least 44x44.
   - Keep the day chip inside the screen in the report.
   - Fit "White chip back" / "Do-over" in the viewport at 375x667 and 375x553.
   - At 375x553 make the track labels legible, or zoom the track, and move the rival panel and fortune chip off the track.
7. **Dead taps**:
   - A sold-out or unaffordable shop chip must answer the tap with a short reason, or not be tappable.
   - Check why the first "Score 4 points" tap on Clear the Pods is ignored (likely eaten during the card's entrance).
8. **Hint during a decision**: the bulb should suggest an answer (as it does for draw/stop), not open generic rules cards over the buttons.
9. Misleading texts: data.js:96, ui9.js:9/:11/:16/:18, ui10.js:51/:56, ui5.js:21/:30, campaign.json:651/:740/:744, the duplicate "Peek and Pick" name (data.js:51/:72), and the sold-out Cinder Moth offer (engine.js:271/:380).
10. Gate: add cauldron-fair visual baselines to `ui-baselines` so `--quick` can pass.
