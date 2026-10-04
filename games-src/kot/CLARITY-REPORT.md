# Crown City Smash: clarity report (Oct 2026)

Preview: `games/crown-city-smash-next/index.html` (https://am015-dev.github.io/spotify_to_ytmusic/crown-city-smash-next/). The live game is unchanged.

**Method.** Each round had two blind testers: a casual player who follows the tips and an impatient player who skips everything. They played on a 390x763 phone through `scripts/drive-serve.js` and never saw the code or the notes. Their full per-screen logs are in `playtest/` (r1 = before any change, r2 and r3 = after fixes).

## Fun scores

| Round | Casual | Impatient | Average | Results |
|---|---|---|---|---|
| 1 (before) | 4.0 | 3.0 | 3.5 | won / lost (4th) |
| 2 | 3.4 | 3.8 | 3.6 | lost (2nd) / won |
| 3 | 3.6 | 4.0 | 3.8 | won / won |

In every round, all six testers explained the goal (20★ or last one standing) and how a turn works. In round 3 both testers listed where every one of their own stars came from, with totals that add up.

## What testers hit before (round 1)

1. **Real bug: "💡 Keep suggested" kept different dice from the ones the blue outline marked.** Once this cost the player their claws. The outline used one search (`aiMarkHard0`) and the button used another (`aiMarkHard`), and both are random.
2. **Computer turns were invisible.** Stars and hearts jumped (for example "Magmaw 7→13★") while the tester waited. The single result line kept replacing itself.
3. **Moving into Downtown was never explained on phones.** The phone CSS hides the result line's "Why:" part, so the +1★ and the crown moving had no cause.
4. **Roll / Done moved by about 40 px** whenever the hint or preview text changed, so taps missed.
5. **The intro story's bullet list ran under the "Let's smash" button.**
6. **A pair of numbers scores nothing, and nothing said so.**
7. **At 20★ in the buy step the game didn't end.** That is the correct rule (you must survive your turn), but nothing said it.
8. **A tip popped up right after rolling and hid the result.**

## What changed (source in `kot/`, rules untouched)

- **Hint bug fixed, test first.** `clarity-test.js` #1 failed on the old build: in 12 seeded rolls, 9 kept different dice from the outline. The button now applies exactly the outlined mask and says how many dice it kept, or "nothing here is worth keeping".
- **The result line is tappable on phones again.** `#banner` inherited `pointer-events:none` from the old floating banner, so "What just happened" never opened on a phone. The round-2 testers found this. Fixed and verified with a real Chromium touch tap.
- **"⏪ While you waited"**: when your turn starts, the result line shows the net change per monster since your last turn: "You −3♥ −2⚡ · Glacyx +4★ 👑in · …". You come first, and your ⚡ is included. Tap it for every logged event in order. Covered by test #3.
- **Computer turns are narrated in the dock**: the monster's name and each logged event of its turn, oldest first, in the space that used to be empty.
- **The move-in +1★ is now part of the score line itself** ("moves into Downtown 👑 +1★"). Covered by test #2.
- **One-shot cards say what they did in the log**, for example "buys Cyclone (one-shot: …)".
- **Fixed height for the result line and the preview line in portrait**, so Roll and Done stay put. Extra card actions ("Twist a die") now fit above the fold at 763 and 664. Long picks (choosing a die face) scroll together with their title instead of covering it.
- **Plain words where they were missing:**
  - "· 20★ wins" in the dock title.
  - A note under the preview when a pair is showing: "a pair scores nothing: numbers need three of a kind".
  - In the buy step: "Step 4 · Shop: you have N⚡ …" and "or tap a card above to read and buy it".
  - At 20★: "you have 22★ (20 wins): end your turn to win".
  - The win text now reads "X reaches 21 stars (20 needed)".
- **Intro**: a one-line "Your turn: roll 6 dice up to 3 times … three of a kind scores stars …" replaces the list that sat under the button.
- **Tips**:
  - The Downtown tip now waits for a computer turn, so it never covers your own result.
  - It pauses the computer while it is shown.
  - The tip texts are shorter.
  - The last tip points at the recap and at 🧭.

## Tests (full set run once at the end)

See the table at the end of this file for numbers.

## Still weak (honest)

- **Suggestions without a "why".**
  - The 💡 dice pick is a Monte Carlo search and gives no reason.
  - In round 3 it said "reroll all" with the player at ♥2 holding two hearts, and it disagreed with 🧭 "What now?", which said claws were the best face.
  - The next step: one evaluation should drive both the outline and 🧭, plus a short reason ("keep the 3s: one more makes 3★").
- **The recap can still be cut off** when four monsters all changed. The tap list has everything, but some testers didn't tap it.
- **Effects of computer cards** are in the tap list but not in the summary. Examples: Cyclone taking ⚡, and a −4♥ from a Barbed-Tail-type card.
- **Each claw hit appears twice in the event list**: the "smashes" line plus the per-victim line. It reads like a double hit.
- **Max hearts (10) is not shown on the chips**, so "4 hearts but heal 1" confused one tester.
- **The third shop card can need a scroll** in the shop pop-up at 763 px.
- **The six header icons have no labels** until the last tip.
- **On the 3D board the monsters are hard to tell apart** at phone size.
- Three blind rounds is a small sample, and nobody has tested on a real iPhone yet.
