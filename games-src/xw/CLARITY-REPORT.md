# Nebula Aces: clarity pass (Oct 2026)

Preview: `games/nebula-aces-next/index.html` (https://am015-dev.github.io/spotify_to_ytmusic/nebula-aces-next/). The live
game `games/nebula-aces/` is unchanged. The game's rules did not change.

Six blind testers played on a 390x763 phone through `games-src/scripts/drive-serve.js`, two per round. Every tester was
new, and none could see the code or the rules notes. In each round one tester was a casual player (skims and taps the
big button) and one was impatient (skips every intro). Their per-screen logs are in `playtest/`. The screenshot paths in
those logs point to the session scratchpad and were not kept.

## Fun scores

| Round | Build | Casual | Impatient | Average |
|---|---|---|---|---|
| 1 | live game, before any change | 2 | 2 | 2.0 |
| 2 | after fix pass 1 | 2 | 3 (won) | 2.5 |
| 3 | after fix pass 2 | 2 | 2 | 2.0 |

**The acceptance bar (fun ≥ 3.5) was not met in the 3 allowed rounds.** This preview is the best version so far. It
also includes a third fix pass (below) that came after round 3 and has not been blind-tested.

What did improve, judging by the logs:
- **Rounds 2–3:** all four testers could explain the goal, a round, and why hits were cancelled. In round 1, neither
  could.
- **"Recommended flew me into an asteroid":** reported by both round 1 testers and by no later tester.
- **The end screen:** after round 1 it no longer reads backwards.

## What the round 1 testers hit (live game)

1. **The ★ suggestions steered them into asteroids**, two rounds running. The cause: the suggestion parked the ship
   beside a rock, so next round every move clipped it (all arrows showed a red "!", which nothing explained).
2. **No health on the board.** Phone tags were hidden, so they couldn't tell ships apart or see their own hull until
   they died.
3. **"Iron Armada wins: every enemy ship is destroyed"** was shown to the player who had just lost. It read like a win.
4. **The pinned Done button covered the ★ "spend focus" choice** and the "Right now: N hits" line.
5. **The round summary said "0 damage taken"** after a critical damage card's fire and an asteroid had hurt them. It
   counted only shots.
6. **Clutter:** a fan of every maneuver's ghost was drawn over the mat; the setup said "Place asteroid 2 of 6" with
   no word on who placed number 1.

## What changed

**Bugs, each proven first by a failing test** (`clarity-test.js`, 6 checks):
- **Win line:** it is now written for the reader ("You win: …" / "You lose: all your ships are destroyed."). Hot-seat
  and watch keep the neutral line.
- **Round summary:** "damage taken" now comes from the hull + shields snapshot at the start of each round, so every
  source counts. The summary also lists each asteroid hit, crit card, bomb and shield repair as its own line.
- **Board health:** hull and shields (♥ ◈), plus stress, focus, evade and lock, now show on every ship's board tag on
  phones (13 px).
- **Suggestion safety:** the ★ suggestion never picks a red move while stressed, and never an asteroid unless every
  move hits one. In that case it says so: "every move from here touches an asteroid; this one does the least harm".
  This was a property test over 160 random positions. It already passed on the old code, because the real cause was
  parking next to rocks, which is fixed below.

**Trustworthy suggestions** (`suggestDial`, UI only; the computer opponent is unchanged):
- **Rocks and collisions:** it avoids ending within 30 mm of a rock, avoids landing on enemies (a bump costs your
  action) and on wingmen whose dials are already set.
- **Seeking a fight:** it rewards ending with an enemy in your arc (range 1 best) and costs a red move 1.5 points.
- **Measured** with `scratchpad/sugsim.js`: one side flew only the ★ dial against the normal computer, 12 games, same
  seeds. Asteroid hits per 12 games went 6 → 2, bumps 15 → 10, shots 56 → 63, and wins stayed at 8–4.

**Cause → effect:**
- **Every attack panel explains the shot**, e.g. "You are in Knifepoint's front arc at range 3: +1 defence die · a rock
  is in the way".
- **Every attack result shows the sum**, e.g. "(3 hits + 1 crit vs 2 evades from 3 defence dice; each evade cancels
  one)".

**One decision per screen, nothing under fixed bars:**
- **Combat choices:** the ★ choice is listed first and is the bright button. Done is unpinned when a ★ choice exists.
- **Phone dice steps:** the legend and the race line are hidden, the dice are smaller, and the mat shrinks (never
  below 3/4 width) only when the dice, result and buttons would otherwise overflow.

**Goal and race always visible:**
- **Goal line:** "🎯 Destroy every enemy ship · You 1 ship ♥3 ◈2 vs Enemy 2 ships ♥6" sits on top of the dock and the
  phone planning strip.

**Plain words, fewer taps:**
- **Dial legend:** it now explains ★ and the red "!" ("hits an asteroid").
- **One tap:** "★ Use suggested" sets the dial and moves to the next ship.
- **Phone mat:** it shows only the suggested ghost instead of a fan of every move.
- **Setup:** it says how many asteroids are already down.

## Retest notes (rounds 2–3) and what is still weak

- **Pace is the main fun problem.** Both round 3 testers went 14 rounds without a result. Ten or so rounds were
  "circling and bumping, nobody in arc". With three small ships and secret simultaneous dials, that is partly the game
  itself. Fix pass 3 makes ★ seek a shot, but the sim shows games got slightly longer (11 rounds vs 9 on average).
  - **Next idea:** a "Quick battle" preset (closer deployment or fewer asteroids) for first games. That is a setup
    choice, not a rules change.
- **Off-screen buttons.** In round 2 the defence ability and Done were below the fold, and the test driver can't
  scroll, so both testers got stuck. Fixed for round 3, where nobody got stuck in dice steps.
  - **Still open:** the round-summary list sits under the pinned Continue button until you scroll. The layout test
    requires that button to stay in view.
- **The board.** Name tags overlap when ships bunch up, the ghost hides under a tag, and the auto-camera zooms between
  steps. Not addressed.
- **Unexplained moments:**
  - The "Tinker" mech's shield repair is now in the summary, but there is no pop-up on the board.
  - "Next: X may shoot" can name a ship that then has no target and is skipped silently.
- **Two focus buttons.** The pilot ability (focus → evade on one die) and "spend focus" (all focus results) both say
  "focus". The ★ explains which is better, but the wording should differ.
- **Stress** is explained in the dial legend ("hard (stress)") and the suggestion "Cost" line, but not before a
  player's first red move outside the guided game.
- **Test-driver artefacts the testers reported** (not game bugs):
  - Tapping "Done" by text opened the roadmap's "Planning" tooltip, because its hidden screen-reader text said "done".
    It now says "finished".
  - Screenshots sometimes lagged one step behind.

## Tests

The commands, the 7 phone sizes and the 4 desktop sizes are as in the brief. The final full-run results are below.

| Test | Result |
|---|---|
| `clarity-test.js` (new) | 6 ok, 0 failed (5 of them failed before the fixes) |
| `unit.js` (rules) | 27 ok, 0 failed |
| `gxw2.js nebula.html 20` (computer vs computer) | 0 errors, 12–8 split |
| `click-ph.js` solo, and hot-seat via `PRE="UI.mode='hot'"` | 0 errors in each |
| `lay-desk.js` 1366x768, 1920x1080, 768x1024, 1100x700 | PROBLEMS 0 |
| `lay-phone.js` 412x780, 844x390, 750x342 | PROBLEMS 0 |
| `lay-phone.js` 390x844, 390x763, 390x664, 375x553 | 0 after the last fix (hide the goal line in the planning strip below 600 px tall). See below. |
| `net/p2p-xw.js` / `net/p2p-xw-phone.js` (real WebRTC, local relay) | errors [] in both; 163 and 448 remote clicks |

**On the 390x844 / 375x553 row:**
- The full run reported 3 problems:
  - "focus did not zoom" at 390x844 and at 375x553;
  - the Lock button clipped at 375x553.
- The Lock button was fixed. The re-run at 390x844 and 375x553 gave PROBLEMS 0.
- "Focus did not zoom" also fails on the unchanged live game at 390x844, so it is an existing, flaky check.
- The other two sizes (390x763, 390x664) showed 0 problems in the full run.
