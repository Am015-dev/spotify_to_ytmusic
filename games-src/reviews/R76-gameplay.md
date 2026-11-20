# R76 strict gameplay review: emberclimb

Reviewed commit: **f64204d25aea9832156154ad0e2e8cc83c49b084** (origin/alex/brave-carson-rbpmlk, includes the shell calm pass).
Branch head at commit time was 67ad4efa; no file under games-src/emberclimb, games/emberclimb or the shared shell changed between the two.
Reviewer: R76, 20 Nov 2026 (14:50-15:17 UTC). Benchmark: the official phone app of the roguelike deckbuilder this adapts, and the
tabletop rulebook the repo's notes name as the rules baseline (rules-notes.md). No game code was edited.

**Verdict: FAIL. Total 4.0 (capped by a stopper; the raw average is 5.5).**

## Gates (all run alone, one after another)

| Run | Command | Result |
|---|---|---|
| quick 1 | `VIS_SLUGS="," python3 games-src/scripts/build-all.py --quick --out /tmp/x emberclimb` | PASS (scenarios 14/14; WARN universal: text clipped "8 → Ione" span in #stage) |
| quick 2 | same | PASS (same WARN) |
| full 1 | same with `--full` | PASS (phone-check 55 s, sweep ok, RULES TEST PASS 40 games; lab WARN 5/8 checks) |
| full 2 | same | PASS (same lab WARN) |

games/lab.html, which `--full` rewrites, was restored and not committed. `node rules-test.js`: PASS (300 bot games, 0 stuck). `node logic-test.js`: 70/70.
Note: the gates pass, but the scenario `ec-split` does not reproduce the real boss-split layout (see stopper S1): in the scenario the foes are 66 px wide
and fit; in a real climb they are 96 px wide and the third one is off screen.

## What I played (touch only, Playwright touchscreen, fresh storage)

| Run | Size | Path | Result |
|---|---|---|---|
| T1 | 375x667 | Tutorial ("New here? Learn in 5 minutes") + coached climb | Guided fight OK (14 steps); coached climb **lost** to the boss's slimes at floor 7 (80 HP, not Gentle) |
| T2 | 375x553 | same | **Stuck** in the coached boss-split fight (S1); reproduced twice |
| Q1 | 375x667 | Quick, Warrior (only hero open), Gentle (default) | Lost floor 4 to Bile Blob, 2.6 min |
| Q2 | 375x553 | Quick | Won, 4.3 min, 6 fights |
| Q3 | 375x667 | Quick | Lost to boss, 4.7 min |
| Q4 | 375x553 | Quick | Lost to boss, 2.7 min, 3 fights |
| Q5 | 375x667 | Quick | Won, 4.9 min |
| Q6 | 375x553 | Quick | Won, 3.3 min |
| Q7 | 375x667 | Quick + Hint tap, 15 s sampled | Won, 3.9 min |

0 page errors in every run. A whole Quick climb is 3-5 minutes and 3-7 fights. The app's run is 3 acts of 15 floors (~50 rooms, about an hour).

## Clutter (sampled every second over all runs)

- **Helpers: max 1 by the selector count, but 2 in practice.** At the boss split (both sizes) the "Slimes!" banner and the "Warden Ashgrove: It split!..."
  toast are on screen together, over the hand and the bottom coach strip (shot: playable at T1/T2, floor 7). On the defeat screen the same toast sits on
  top of the Play again / Title buttons. Neither element is counted by calm-audit's selectors, so the audit says 1.
- **Infinite loops: not 0.** calm-audit: `loops=2` (button.intent.atk.w4atk {w4pulse}, div.gxt-ring {ec-tpulse}). In play: 3-6 at once. Every one seen:
  - `.intent.w4atk {w4pulse}` / `.intent.w4danger {w4pulse2}`: src/head.html:360
  - `.gxt-ring:not(.soft) {ec-tpulse}` (undoes the shell calm pass): src/head.html:545
  - `.node.glow {pulse}` on every reachable map room: src/head.html:111
  - `.en.glow {w485tg}` on every target: src/head.html:427 and :504 (also `.en.glow {pulse}` :123)
  - `.picks .card.rare::after {w4sheen}` on rare rewards: src/head.html:381
  - also defined: `.endbtn.pulse` :168, `.ec-ghost {nudge}` :190
- **15 s after Hint**: 1 infinite loop on every sample (the attack intent behind the sheet), 0 helpers. Hint does not give a hint: the bulb opens the
  "How a turn works" rules sheet (help.js:37, `suggest` returns null), so there is no move suggestion anywhere in a real game.

## Rules vs the original (engine and every player-facing text)

The act-1 engine is close to the tabletop: 3 energy, draw 5, Block resets, Vulnerable doubles and is spent per attack, Weak -1 unit per hit, Weak vs
Vulnerable cancels, Poison per token, foes = printed act-1 cards x8, die rows, the boss split, rest heals 3 units. The mismatches:

| # | Where | Mismatch |
|---|---|---|
| R1 | help.js:27 vs data.js:268 | Help says Gentle gives "6 times your HP"; the code gives 5x (seen in play: 400/400 for an 80 HP Warrior). |
| R2 | ui.js:271-272, data.js:268 | The default for every new player is Gentle: 5x HP, 3 free Healing Draughts, Rest heals 64. The rulebook game is opt-in and hard (bot: Warrior 7/50, Monk 0/50 wins). The default experience is not the original. |
| R3 | engine.js:12-30 (`upOps`) | Upgrades are generic (+1 unit to the first number, or -1 cost). The original prints a specific upgrade per card. |
| R4 | ui.js:384 | Intent caption "adds N Slimed to your deck"; its own explanation says "to your discard" (tabletop: discard pile). |
| R5 | ui.js:381, ui.js:410 | Intent / chip "Vulnerable: you take double damage" with no "next attack, one token used". help.js:14 states it right; the in-fight text does not. Same for Weak (ui.js:380). |
| R6 | ui.js:383 | Intent "Poison: lose 8 HP each turn" ignores the token count (the chip at ui.js:410 multiplies). |
| R7 | help.js:28 | "All enemies, relics and events are our own" contradicts the same card ("Every Act 1 foe uses its printed tabletop card"). |
| R8 | help.js:28 | "Potions ... (max 3)" but Pocket Satchel (data.js relic) adds a slot. |
| R9 | ui.js:229-233 (HNEED, heroOpen), setup screen | Quick game offers only the Warrior; the other 3 heroes are locked behind Story chapters 2-3. A first-timer gets 1 of 4 classes. |
| R10 | help.js:28, ui.js setup | Quick is Act 1 only (9 floors + boss, generated map). The original run is 3 acts (+ a final act). Acknowledged on screen, but it is the main depth gap. |
| R11 | data.js:177-183 | Encounter cuts (summoning cards bring only the lead foe; thief and gang cards missing). Acknowledged in rules-notes, not on screen. |
| R12 | tutor.js:160-176, engine | The coached climb runs at rulebook HP (80) while Quick defaults to Gentle (400): the tutorial is the hardest climb a newcomer meets. |
| R13 | rules-notes.md | Notes contradict themselves and the code: Rest "24" vs "heal 9", Prayer Beads 2 Miracles (code and text: 1, engine.js:320), Venom Vial 4 (code 2). Not player-facing, but a fixer cannot trust it. |
| R14 | data.js cards | Many card numbers are "tuned"/UNCHECKED per rules-notes (e.g. Final Verdict plain 30 damage). |

Depth vs the app: 24 cards per hero (about 20 in the reward pool), 19 relics, 9 potions, 13 events, 3 bosses, 1 act. Runs end in 3-5 minutes. The
owner's note ("extremely simplistic") still holds.

## Phone (375x667 and 375x553)

- Text: no visible text under 11 px in any sample. Taps: everything >= 44 px except the title mute chip (button#mute 44x40).
- **Multi-foe fights**: the foe row is pushed up under the top bar: intents half hidden at 667, fully under the relic/potion row at 553
  (shots: quick-w-375x553-battle, the Hex Acolyte's intent sits behind the potion portraits).
- **Boss split**: third slime off screen (left 366 px, 96 px wide on a 375 px screen); first two have their centres under the HUD (S1).
- Status chip text runs past the right edge ("Vulnerable 1: takes double damage", right edge 380-384 px).
- Hand fan hides card names ("Cinder Stri…" clipped by the next card).
- Defeat screen: the narrator toast covers Play again / Title.
- Spine Slug has no portrait on the result screen (empty circle).

## Stopper

**S1 (dead taps, both sizes): the boss-split fight.** Coached climb, floor 7, after the Mire Behemoth dies and 3 slimes join. Lift Cinder Strike; the coach
says "Now tap the glowing enemy". DOM at 375x553: `.en` e1 at (170,-3) 96x180, centre covered by `.w485top`; e2 centre covered by `.pot`; e3 at left 366,
off screen. A tap on a slime's picture hits the HUD (dead tap); only the thin name labels respond, and the third slime cannot be reached until the others
die. My touch player stuck there twice at 553; at 667 it could not target and lost. Repro: Title > New here? > follow the coach to the boss.
Gate scenario `ec-split` passes because it lays the foes out at 66 px.

## Scores (GAMEPLAY-RUBRIC.md)

| # | Row | Score | Why (repro for < 7) |
|---|---|---|---|
| 1 | Rules fidelity | 5 | Act-1 engine close to the tabletop, but generic upgrades (R3), Act 1 only (R10), non-rulebook default (R2), 6 text mismatches (R1, R4-R8). |
| 2 | Tutorial teaches | 5 | Guided fight is good: 14 one-line steps, one tap each. Then the coached climb drops to rulebook HP and ends in S1 (lost or stuck). Repro: Title > New here? > climb to floor 7. |
| 3 | First 10 seconds | 7 | Clear title, one big "New here?" button, Goal card names the goal and 4 rules. |
| 4 | Turn clarity | 6 | Intents show real numbers, but in multi-foe fights they sit under the top bar; "+1" arrow intent unexplained until tapped; card names clipped by the fan; Hint gives no hint. Repro: any 2-foe elite at 553. |
| 5 | Phone play | 4 | S1, third foe off screen, intents under HUD, chip text off the right edge, toast over result buttons, mute 44x40. Repro: boss split at 375x553. |
| 6 | AI and pacing | 6 | Gentle Warrior won 4/7 of my climbs, but a climb is 3-5 min / 3-7 fights; rulebook mode near-unwinnable (bot 14% Warrior, 0% Monk); Gentle Monk dies on floor 1 in 14% (bench-newcomer GENTLE=1). |
| 7 | Feel | 7 | Hit-stop, shake, flying numbers, card fly-in, good owner art. Loops never stop, which cheapens it. |
| 8 | Bugs | 4 | 0 errors, 0 crashes, but S1 dead taps / stuck state; scenario gate misses it. |

Average (5+5+7+6+4+6+7+4)/8 = **5.5**; stopper S1 caps the total at **4**. Rows under 7: 1, 2, 4, 5, 6, 8. **FAIL.**

## Fix list (in order)

1. **S1 foe row**: lay out the real fight like `ec-split` (scale foes to fit 3 per row at 375 px; never under #hud/potion row; wrap to 2 rows). Then make
   `ec-split` start from a real boss kill (Mire Behemoth to 0 HP in a normal climb state) so the gate tests the real layout. Check at 375x553 and 375x667.
2. **Loops to 0**: make w4pulse/w4pulse2 (head.html:360), ec-tpulse (:545, delete the override), node pulse (:111), w485tg (:427, :504), en pulse (:123),
   w4sheen (:381), endbtn pulse (:168), ec-ghost nudge (:190) finite (2-3 iterations) or static outlines. Re-run calm-audit: loops=0.
3. **One helper**: suppress the narrator toast while a turn banner ("Slimes!", "Your turn") is up and on the result screen; add `.toast`-type
   narrator and `.turnban` to calm-audit's helper selectors so the audit sees them.
4. **Tutorial climb**: run it on Gentle numbers (or the first-climb HP) and end the coaching before the split fight, or coach the split step by step.
5. **Text fixes**: help.js:27 "5 times"; ui.js:384 "to your discard"; ui.js:381/380/410 add "next attack, 1 used per attack"; ui.js:383 use token count;
   help.js:28 fix "all enemies our own" and "max 3" potions.
6. **Hint**: make the bulb suggest a move in fights (e.g. "Block: 16 is coming" or "Anvil Blow first: Vulnerable doubles the next hit") instead of the rules sheet.
7. **Phone polish**: status chips wrap inside 375 px; hand fan shows full names (lift name above overlap); mute 44x44; Spine Slug portrait.
8. **Depth (owner call)**: per-card printed upgrades; open all 4 heroes in Quick (or unlock by Quick wins, not Story only); offer the 3-act climb
   in Quick; more reward cards/relics. Fix rules-notes.md contradictions (R13).
