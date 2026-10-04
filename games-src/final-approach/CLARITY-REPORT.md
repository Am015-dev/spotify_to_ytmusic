# Final Approach: clarity report (Oct 2026)

Brief: `games-src/clarity-briefs/final-approach.md`. Model for the work: `games-src/thornbound/CLARITY-PLAN.md`.
Method: blind playtests on a 390x763 phone screen through `games-src/scripts/drive-serve.js`. Each tester was a fresh agent with no
access to the repo, and could see only screenshots of the game. There were two personas per round: a casual player who takes the
guided flight, and an impatient player who skips every tutorial. Logs are in `playtest/round0` (before any change), `playtest/round1`
and `playtest/round2` (the last allowed retest). Their screenshot paths point to a session scratchpad that was not kept.

## Scores

| round | build | casual | impatient | average |
|---|---|---|---|---|
| 0 | as found | 2 | 2 | **2.0** |
| 1 | clarity round 1 | 2.8 | 2.5 | **2.65** |
| 2 | clarity round 2 (shipped, plus three small text fixes after the test) | 3.3 | 2.5 | **2.9** |

**The acceptance bar (fun ≥ 3.5 on average) was not met after the three allowed rounds.** This is the best version, shipped with
honest notes as the brief says. The other acceptance items:

- **Goal and a round:** all six testers could explain both correctly by the end of their game.
- **Why points were won or lost:** in round 2 both testers named the exact reason for every loss. They worked out some of those
  reasons only on the loss screen, not before the fatal die (see "Still weak").
- **Unexplained changes:** the round-0 list ("planes vanished", "plane jumped", "coffee dropped", "surprise reroll mode") is gone
  in round 2. What remains is misreading small dice faces, and "a reroll token comes aboard" with no reason given.
- **Unreachable options:** the phrase list and the Checklist sheet are fixed. One remains: the landing checklist sheet still has to be
  scrolled to on a phone. The goal strip shows its content, but one tester did not connect the two.

## What the first testers hit (round 0, both 2/5)

1. **Win conditions out of sight.** The landing checklist sat below the sticky buttons, so testers first saw it in round 5 or not
   at all. Both lost on rules they had never been shown (brakes, a level axis, being at the airport in time).
2. **Deadly rules appeared only on the loss screen.** These were: leaving a space that holds a plane, the engines moving the plane
   immediately, the radio count starting at your own space, and a tilt of 3 being a spin. Both losses "felt like traps".
3. **Things changed with no cause shown.**
   - The computer crewmate spent the shared coffee and reroll tokens without saying so.
   - A reroll prompt took over the player's taps ("Confirm reroll (none)").
   - The speed markers moved with gear and flaps, unexplained.
4. **Real bugs.**
   - The coffee + button moved after the first press, so the second press landed on −.
   - The round summary's "Tap to close" was not a button.
   - A guided tip could stay up for five rounds ("Step 7 of 15"), and the step numbers jumped.
   - "No more tips" was forgotten after "Fly again".
   - The Hint reason was pushed below the fold.
5. **Clutter and wording.**
   - The 14 briefing phrases were mostly off screen.
   - The same slot was called "Concentration" in some places and "Coffee" in others.
   - "Level dice, no change" was read as "the tilt is fixed".
   - Hint said "space 7" while the track said "Airport".

## What changed

Rules: unchanged (the engine still matches `rules-notes.md`). One engine change: the reroll log line now names who spent the token
("Co-pilot spends a reroll token…"); the old line did not. Nothing in shared modules, other games or the live file was touched.

1. **Goal strip, always on screen** (top of the dock).
   - First line: "Be at the airport by round 7 · 4 spaces to the airport, 3 rounds left to fly there". It adds "(some 2-space moves
     needed)" or "(too far!)" when that applies.
   - Then one chip per landing condition: planes to clear, Gear n/3, Flaps n/4, Level / "Tilt 1 right: level it to land, 3 = spin",
     Brakes n, and trainee, ice or fuel when the scenario has them.
   - A ⚠ line covers the two traps that ended most flights:
     - "A plane is on your space: radio it away (a 1 on a Radio) before both engine dice are down, or keep the engine sum ≤ 4."
     - Flaps or gear falling behind, naming the value the crewmate needs next.
   - Tapping the strip opens the full checklist.
   - On landscape and short phones the strip steps aside while a tip or the die card needs the room.
2. **Deadly moves are marked before they happen.**
   - Every legal space for the chosen die is tried on a copy of the public state.
   - A space that would end the flight at once turns red with a ✕. The die card says why ("Collision with a plane on space 1"), and
     the first tap only warns. Causes covered: collision, overshoot, spin, landing too fast, a missing Axis/Engines die, running out
     of fuel, missing the airport.
   - This uses only public information: placed dice and the board.
3. **Cause and effect in the die card.**
   - Engines: "4 + 5 = 9: the plane moves 2 spaces right away".
   - Radio: which space it reaches, whether a plane is there, and that it counts from here, before the engines move you.
   - Axis: the resulting tilt, a spin warning, and in the landing round "it must be level to land!".
   - A gear, flap or brake that is already done says "a die there changes nothing", and no longer glows gold.
4. **The partner's moves explained** (dock feed and round summary, in plain words).
   - Coffee: "Ravi puts a 5 on Coffee (1 shared coffee token spent: down 1)".
   - Markers: "Landing gear 1 down. Blue marker now 5: a sum up to 5 now stays put." The orange marker gets the same treatment.
   - Rerolls: "Ravi spent a reroll token. Tap dice to reroll them, or keep yours", with the button reading "Keep my dice" or
     "Reroll 2 dice".
5. **Fewer surprises.**
   - Reroll needs two taps; the first explains what it does.
   - "Fly again" after the guided flight starts a normal flight. The guided dice are fixed, so it used to replay the same hand.
   - The coffee stepper never moves under the finger.
   - The round summary has an OK button.
   - Unanswered tips leave when their round ends, and tips no longer show "Step n of 15".
6. **Less on screen.**
   - The roster chips and the Checklist button are gone on phones; the goal strip replaces both.
   - The briefing shows three phrases, the ones that fit the round (the same advice the computer crew would give), two per row,
     with "More phrases…".
   - The briefing says plainly that the computer crewmate goes by the panel, not by phrases.
   - The "Fits:" and coffee help lines hide on short and landscape phones.
7. **Plain words.**
   - "Coffee" everywhere.
   - "Equal dice, the tilt stays at 1 right".
   - "The airport" instead of "space 7".
   - Hints no longer promise that the crewmate will "match" or "complete" a die, because the computer cannot see your die coming.
   - The rules drawer and the first tip state the real deadline: on the airport when the last round starts.

## Tests

New: `game/clarity-test.js` (Playwright; `node clarity-test.js [WxH]`). It has one check per bug found in testing: goal, deadly,
coffee, recap, rrwho, hint, tipsoff, deadline, rr2tap, phrases. Six of the checks (goal, deadly, coffee, recap, rrwho, tipsoff)
failed on the build the round-0 testers played and pass now. The others were added with round-2 fixes.

Final run on the shipped build (from `game/`; p2p from `games-src/`):

| test | result |
|---|---|
| `clarity-test.js` 390x763 and 844x390 | **10/10 ok** at each size (PROBLEMS 0) |
| `rules-test.js` | **68 passed, 0 failed** |
| `hidden-test.js 40` | 40 games, 1 841 checks, **0 problems** |
| `net-strip-test.js 24` | 24 games, 2 253 stripped views, **0 problems** |
| `click.js` (jsdom, 18 configurations) | ANIM=0: 18 games, **0 errors, 0 stalls**, 0 hidden-dice violations. ANIM=1: the same |
| `lay.js` 1366x768, 1920x1080, 768x1024, 1100x700 | **PROBLEMS 0** |
| `lay-phone.js` 390x844, 390x763, 390x664, 375x553, 412x780, 844x390, 750x342 | **PROBLEMS 0** at every size (the first sweep found 8 on the short and landscape sizes; fixed by a compact die card and goal strip there) |
| `px-test.js` | **PASSED** |
| `net/p2p-fa.js` full / leave / ui / hostleft, `net/p2p-fa-phone.js` full / touch | **Not verified in this sandbox.** Every run reports "bad" because the guest never reaches the host's lobby ("host sees [Hosty]" only). The **unchanged original build fails in exactly the same way** (same `ui` run, same result), so this is the sandbox's WebRTC/relay environment, not this change. `net.js`, `netstrip.js` and the online flow were not edited; `net-strip-test` passes. Re-run on a machine where the p2p test worked before. |

## Still weak (honest notes)

- **Fun is 2.9 on average, not 3.5.** In round 2 every loss was understood, but often only on the loss screen.
  - The landing round's axis is the main killer. It must end exactly level, and the partner's hidden last die can undo it. Only
    the chip text and the landing-round die card warn about it now.
  - A next step would be a pre-landing check before round 7 starts, e.g. "Landing round: the axis must end level. You are 1 right:
    put a die 1 lower than Ravi's".
- **The computer crewmate seems to work against you.**
  - In simulation the co-pilot is sound: with a hint-style computer pilot it lands 19 of 20 Port Alder flights, and finishes the
    flaps in 19 of 20.
  - With a human pilot it can look like sabotage. It answers an axis die with a value that tilts further, it fills Coffee while
    flaps lag, and it spends shared coffee the human was saving.
  - It never reacts to phrases. That is now stated on screen, but testers still found it disappointing.
  - Making the computer crewmate follow the human's phrases (for example "Flaps next" raising the weight of flap moves) would help
    most, but it changes the AI and needs gauntlet tuning. Not done.
- **Dice faces are too small to read** on a phone. All three rounds misread 2/3/4 at least once. This is an art and scale job, not
  started.
- **The panel shows all ~30 spaces from the first second,** even in the guided flight that promises one control at a time. A
  guided flight that hides unused controls until they are introduced would answer the remaining "too much on screen" complaints.
- **The die card covers the dice tray** on portrait phones while a die is chosen. The card says which die it is, but not the other
  dice in hand.
- "Debrief" on the loss screen reopens the same card, and "a reroll token comes aboard" gives no reason (the altitude row carries
  it). Both are small.
- Changes made after the last test, which no tester has seen: the shorter engine and radio wording, "level it to land" on the axis
  chip, the landing-round axis warning, and the landscape goal strip and briefing.
