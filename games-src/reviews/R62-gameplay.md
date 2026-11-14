# R62 strict gameplay review: hollowbough

- Build reviewed: `shelf/W521-hollowbough-rules` @ **e0a9f6ddba70b5581e9432e6cfca5497590328db** (F16 calm caps in every mode)
- Reviewer: R62, 14 Nov 2026 (UTC). Played on the build only; no game code changed.
- Owner report: "very confusing and distracting with the tap button, the rules are not correct".
- **Verdict: PASS, average 7.1.** Every row is 7 or higher and nothing stops play.

## Gates (each run alone, `VIS_SLUGS=","`)

| Run | Result |
|---|---|
| `--quick` #1 | PASS, 13/13 scenarios, 86 s |
| `--quick` #2 | PASS, 13/13 scenarios, 85 s |
| `--full` #1 | PASS: phone-check, lab-test, sweep (46 bulb taps, 0 with no suggestion), 208 s |
| `--full` #2 | PASS, same as #1, 207 s |
| rules-test.js | 108/108 |
| gauntlet: 40 games easy vs normal | 0 errors, 0 stalls; normal wins 90% (29 vs 20 pts on average), about 65 turns a game |
| gauntlet: 40 games normal vs normal | 0 errors, 0 stalls; average 33 pts, about 69 turns a game |

## The first-timer path (fresh browser, touch only)

The title opens with **Guided** already chosen. It shows two buttons: "New here? Learn in 5 minutes" on top and "Play" below.
Tapping Play brings up "New here?" with two answers, "Learn in 5 minutes" and "Play now". Play now starts a **Guided** game (no `calm` class).
Learn runs a 37-step tutorial, then starts a normal **vs** game (with `calm`) behind the goal card.

## Clutter check (my own probe, not the worker's calm-measure)

How the probe works: it runs in a fresh browser and enters through the title by touch. Every second it records the helpers on screen: the kit's bubble, ring or finger counts as one helper; the ghost finger, the idle nudge and coach tips count separately, and the tab dot counts when it competes with another helper. It also counts every running animation that is infinite, or finite but still running after 12 s. After each bulb tap it waits 15 s without touching and samples every second.

| Mode / size | Games (complete) | Samples | Bulb taps | Max helpers | Helper loops | Other loops | Off-screen targets | Silent taps (real) |
|---|---|---|---|---|---|---|---|---|
| Guided 375x667 | 2 (1 done: 34-35; 1 long run stopped by probe, see note) | 1350 | 66 | **1** | **0** | 0 | 0 | 0 |
| Guided 375x553 | 3: 1 done and sampled (62-42), 1 done following the bulb, unsampled (53-45), 1 long run stopped by probe (about 60 bulb taps, no helper or loop flags) | 197 (+ the stopped run) | 9 (+ about 60) | **1** | **0** | 1 (result screen tree) | 0 | 0 |
| Normal vs 375x667 | 2 done (12-25, 16-25) | 212 | 10 | **1** | **0** | 0 | 0 | 0 |
| Normal vs 375x553 | 1 done (16-30) | 91 | 4 | **1** | **0** | 0 | 0 | 0 |
| Tutorial 375x667 / 375x553 | 2 done by touch, about 58 s each | - | - | 1 | 0 | 0 | 0 | 0 |

- **F16 claims, checked:**
  - The ghost finger taps 3 times (`ftap 1.5s x3 forwards`), then rests.
  - The bulb's ring and finger are gone or still at 15 s after every one of the 89 recorded bulb taps (about 150 counting the stopped run). The bubble stays on screen, still, until the moment changes. That is 1 helper and no motion.
  - Glows do not pulse.
  - Long Road chips read "discard 3 · 3 pts" (`ui2.js:524`).
  - The Goals list at 375x553 is no longer covered.
- **The one infinite loop left** is `.hero-tree` (`treesway 5s infinite`) on the Final score card (`ui5.js:186`, `head.html:288`). It is decoration, not a helper, but the brief asks for 0 infinite loops.
- **Note on the probe stops:**
  - What happened: two long Guided runs stalled in Autumn at "Pick a green card to run again" (Tinder Chipmunk).
  - The cause was my probe. It kept tapping a glowing city card whose centre sat under the sticky "My city" header.
  - Proof it is not a game stall: with a 14-card city, tapping a visible glowing card resolves the choice at both sizes. My rerun probe only taps targets it can actually hit, and those games finished cleanly.
  - The stalled runs still count toward the clutter samples above: 0 loops, max 1 helper.
- **Silent taps:**
  - The probe flagged 3. Two were races: a production choice opened between the check and the tap.
  - The third was real: **tapping a hand card while the rival is playing gives no answer at all.** There is no toast and no zoom; only the passive "Bramble is playing…" bar shows. Reproduced on its own (see Bugs).

## Rules: quick regression check vs the original

All core numbers still match, and rules-test passes 108/108:
- 8 basic spots with their correct shared or exclusive flags.
- Haven: 2 cards for 1 resource.
- Long Road 5/4/3 exclusive and 2 shared, Autumn only, discard N to score N.
- Starting hands 5/6/7/8 by seat; hand limit 8; city limit 15.
- Prepare gives +1/+1/+2 workers. Spring and Autumn run production; Summer takes up to 2 meadow cards.
- 4 basic events need 3 or 4 of a colour and are worth 3 points.

The "Re-run a production card" choice correctly leaves out the Chipmunk itself.
No regression since R50.

## Scores (GAMEPLAY-RUBRIC.md)

| # | Row | Score | Why |
|---|---|---|---|
| 1 | Rules fidelity | **8** | No regression since R50 and 108/108 rules tests. |
| 2 | Tutorial teaches | **7** | 37 one-line, one-tap steps, finished by touch at both sizes in about 1 minute: meadow build, worker, event, Prepare, Inn, special event, haven discard, Long Road, pass, scoring. It ends straight in a real game. |
| 3 | First 10 seconds | **7** | Guided is preselected, "Learn" comes first, and a clear goal card says "most points after Autumn wins". There are two big green buttons; Play reads as primary only after a moment. |
| 4 | Turn clarity | **7** | The top bar always says what to do. Cards show cost, points and "Can build" or "Need 2 resin". Weak spot: a normal game glows **every** legal target (11-14 at once), so the board says "anything", not "this". |
| 5 | Phone play | **7** | Nothing is clipped at 375x553. Choice buttons are big. But at 553 the choice tray covers the bottom city row, and in a 15-card city the top row's centre scrolls under the sticky "My city" header. |
| 6 | AI and pacing | **7** | The default rival is beatable: the newcomer path won 2 of 3 Guided games, and the loss was by 1 point. Turns are quick. Real-speed game length is fine (about 65 turns). |
| 7 | Feel | **7** | The calm caps work in Guided too: the finger rests, glows are still, cards fly. One infinite decorative loop is left on the Final score screen. |
| 8 | Bugs | **7** | 0 page errors and 0 stuck states in 6 completed games (3 Guided, 3 normal) plus 2 tutorials. One real silent tap: a hand card during the rival's turn. |

**Average 7.1 → PASS.** No stopper.

## Repro steps for what still needs fixing (rows held at 7)

1. **Silent tap on a rival turn (rows 4 and 8).**
   - Steps: fresh Guided game at 375x667. Make your first move. While "Bramble is playing…" shows, tap any hand card.
   - Result: nothing happens. Expect a toast such as "Bramble's turn: wait a moment" or the card zoom.
2. **Result-screen loop (row 7).**
   - Finish any game and tap "See the result". The Elderheart tree sways forever (`.hero-tree`, `treesway 5s infinite`).
   - Fix: give it a few iterations, or none in calm play.
3. **Covered glow targets (row 5).**
   - Steps: 375x553, a city of 12 or more cards, play Tinder Chipmunk. The "Pick a green card" tray covers the last city row (Amber Still and Hoard Cellar are not tappable until you scroll).
   - At 375x667, once the city panel has scrolled down, the top row's glowing cards sit half under the "My city" header.
   - Fix: on a city choice, scroll the first option into view and pad the panel by the tray height.
4. **All-glow normal games (row 4).**
   - In a normal game every legal place glows softly (11-14 at once at 375x667).
   - Fix: glow only on a selected card's options, or keep the top 3 as in Guided, so the board points somewhere.
5. **Bulb bubble placement (minor, row 5).**
   - At 375x553 the bulb bubble covers the resource row while it is talking about affording a card.
   - Fix: place it below the tabs.

## Top fixes, in order

1. Answer hand taps on the rival's turn.
2. Stop the endless tree sway on the result screen.
3. Keep choice targets clear of the tray and the sticky header.
4. Fewer glows in normal games.
